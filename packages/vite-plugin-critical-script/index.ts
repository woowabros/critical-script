import type { Plugin } from 'vite'

import dedent from 'dedent'
import * as esbuild from 'esbuild'

interface Options {
  /**
   * Maximum size (in bytes) for the compiled inline script. Build fails when exceeded.
   *
   * The default `8192` reflects four intents:
   *
   * 1. **Fit HTML in the first TCP packet.** Per RFC 6928, TCP's initial
   *    congestion window (initcwnd) is 10 segments (~14KB). When the compressed
   *    `index.html` fits in that window, the entire HTML arrives in the first
   *    round-trip. 8192 bytes leaves room for the rest of the HTML.
   * 2. **Preserve the tool's purpose.** This plugin is for tasks that *can't
   *    wait* for the JS bundle — API prefetch, asset preload, native webview
   *    bridge calls. Heavy logic belongs in the main bundle; a small limit
   *    enforces this principle at build time.
   * 3. **Catch accidental imports.** When a large library is unintentionally
   *    imported inside a critical script, the build fails immediately rather
   *    than silently bloating the HTML.
   * 4. **Avoid delaying the subsequent JS bundle.** The larger the inline
   *    script, the later the browser discovers and starts downloading the
   *    `<script src="bundle.js">` that follows. Time gained by inlining can
   *    be offset — or net negative — when the main bundle's arrival slips.
   *
   * @default 8192
   */
  outputSizeLimit?: number
  /**
   * Defines values to be replaced as global constants during build.
   * Passed directly to esbuild's `define` option.
   *
   * @example
   * ```ts
   * criticalScriptPlugin({
   *   define: {
   *     __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
   *     'process.env.API_URL': JSON.stringify('https://api.example.com')
   *   }
   * })
   * ```
   */
  define?: Record<string, string>
  /**
   * Language or browser versions the inline script is compiled down to.
   * Passed straight to esbuild, so it accepts the same values.
   *
   * Leaving this unset applies esbuild's default of `esnext`, so setting a
   * value that matches the browsers you support is recommended. `target`
   * lowers syntax only: esbuild adds no API polyfills, and a critical script
   * runs before the main bundle, so nothing the bundle would have transformed
   * or polyfilled is available to it.
   *
   * 1. **The script may not run at all.** An unsupported syntax or token can
   *    stop the whole script from running in the browser.
   * 2. **Keep the version aligned with the application.** If the application
   *    supports older browsers, the inline script has to be compiled down to
   *    the same level to be safe.
   *
   * @default undefined (esbuild's own default, `esnext`)
   *
   * @example
   * ```ts
   * criticalScriptPlugin({ target: 'es2017' })
   * criticalScriptPlugin({ target: ['chrome87', 'safari14'] })
   * ```
   */
  target?: esbuild.BuildOptions['target']
}

const wrapScript = (scriptContent: string, scriptSize: number) =>
  `
import { jsx as _jsx } from 'react/jsx-runtime';

export default ({ ...otherProps }) => {
  const props = {
    suppressHydrationWarning: true,
    'data-size': ${JSON.stringify(scriptSize)},
    dangerouslySetInnerHTML: { __html: ${JSON.stringify(scriptContent)} },
  };

  return _jsx('script', { ...props, ...otherProps });
}
`.trim()

/**
 * Creates a Vite plugin that compiles TypeScript modules into inline critical scripts.
 *
 * Use this for tasks that *can't wait* for the JavaScript bundle to load —
 * API prefetch, asset preload (e.g., LCP image from API response), native
 * webview bridge calls, etc. Keep the inline code minimal; heavy logic
 * belongs in the main JS bundle.
 *
 * Use `?as-critical-script` suffix to import a script file as an inline React
 * component. The imported component renders as a `<script>` tag with the
 * compiled code inlined.
 *
 * @param options - Plugin configuration options.
 * @returns A Vite plugin instance.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { criticalScriptPlugin } from '@woowabros/vite-plugin-critical-script'
 *
 * export default defineConfig({
 *   plugins: [criticalScriptPlugin({ outputSizeLimit: 4096 })]
 * })
 * ```
 *
 * @example
 * ```tsx
 * // App.tsx
 * import CriticalScript from './critical.ts?as-critical-script'
 *
 * export default function App() {
 *   return <CriticalScript />
 * }
 * ```
 */
export function criticalScriptPlugin(options: Options = {}): Plugin {
  const outputSizeLimit = options.outputSizeLimit ?? 8192

  return {
    load: {
      async handler(id) {
        if (!id.endsWith('?as-critical-script')) return

        const filePath = id.replace(/\?.+$/, '') // Remove string after '?'
        const esbuildResult = await esbuild.build({
          bundle: true,
          define: options.define,
          entryPoints: [filePath],
          format: 'iife',
          minify: true,
          target: options.target,
          treeShaking: true,
          write: false,
        })

        for (const warning of esbuildResult.warnings) {
          this.warn({
            id: filePath,
            loc: warning.location
              ? { column: warning.location.column, file: warning.location.file, line: warning.location.line }
              : undefined,
            message: warning.text,
          })
        }

        const file = esbuildResult.outputFiles.shift()
        const fileContent = file?.text ?? `console.warn('No critical script output')`
        const scriptSize = new TextEncoder().encode(fileContent).byteLength

        if (scriptSize > outputSizeLimit) {
          throw new Error(dedent`
            The compiled critical script is too large, forcing build termination. (Compiled script size: ${scriptSize})
            A script that is too large can negatively impact network performance by increasing the size of index.html.
            Please check if too much code is included in the script, and increase outputSizeLimit if necessary. (Current outputSizeLimit: ${outputSizeLimit})
          `)
        }
        return wrapScript(fileContent, scriptSize)
      },
      order: 'pre',
    },
    name: 'vite-plugin-critical-script',
  }
}
