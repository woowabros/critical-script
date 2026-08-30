import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { criticalScriptPlugin } from './index'

type LoadObject = { handler: (this: PluginContext, id: string) => Promise<string | undefined> }
type PluginContext = { warn: (log: unknown) => void }

const fixture = (name: string) => fileURLToPath(new URL(`./__fixtures__/${name}`, import.meta.url))

const noopContext: PluginContext = { warn: () => {} }

// Real Vite/Rollup invoke hook handlers with `this` bound to a plugin context
// exposing `warn`, so tests replicate that instead of calling `handler` bare.
const runLoad = (plugin: ReturnType<typeof criticalScriptPlugin>, id: string, context = noopContext) =>
  (plugin.load as unknown as LoadObject).handler.call(context, id)

describe('criticalScriptPlugin', () => {
  it('returns a vite plugin named vite-plugin-critical-script', () => {
    expect(criticalScriptPlugin().name).toBe('vite-plugin-critical-script')
  })

  it('ignores ids without the ?as-critical-script suffix', async () => {
    expect(await runLoad(criticalScriptPlugin(), './foo.ts')).toBeUndefined()
  })

  it('compiles a critical script into an inline <script> component module', async () => {
    const output = await runLoad(criticalScriptPlugin(), `${fixture('sample.ts')}?as-critical-script`)

    // wrapped as a React component that renders a <script>
    expect(output).toContain("_jsx('script'")
    expect(output).toContain('dangerouslySetInnerHTML')
    expect(output).toContain('suppressHydrationWarning')
    expect(output).toContain('data-size')
    // the compiled (minified) payload is preserved
    expect(output).toContain('window.__critical')
  })

  it('throws when the compiled script exceeds outputSizeLimit', async () => {
    await expect(
      runLoad(criticalScriptPlugin({ outputSizeLimit: 1 }), `${fixture('sample.ts')}?as-critical-script`),
    ).rejects.toThrowError(/too large/)
  })

  it('measures the compiled script in UTF-8 bytes', async () => {
    const id = `${fixture('sample.ts')}?as-critical-script`
    const output = (await runLoad(criticalScriptPlugin(), id)) ?? ''
    const script = JSON.parse(/__html: (".*")/.exec(output)?.[1] ?? '""') as string
    const scriptSize = new TextEncoder().encode(script).byteLength

    expect(scriptSize).toBeGreaterThan(script.length)
    expect(output).toContain(`'data-size': ${scriptSize}`)
    await expect(runLoad(criticalScriptPlugin({ outputSizeLimit: scriptSize - 1 }), id)).rejects.toThrowError(
      `Compiled script size: ${scriptSize}`,
    )
  })

  it('forwards esbuild warnings via this.warn()', async () => {
    const warnings: { message: string }[] = []
    const context: PluginContext = { warn: (log) => warnings.push(log as { message: string }) }

    await runLoad(criticalScriptPlugin(), `${fixture('import-meta.ts')}?as-critical-script`, context)

    expect(warnings).toHaveLength(1)
    expect(warnings[0]?.message).toContain('import.meta')
  })

  it('emits no warnings for a clean compile', async () => {
    const warnings: unknown[] = []
    const context: PluginContext = { warn: (log) => warnings.push(log) }

    await runLoad(criticalScriptPlugin(), `${fixture('sample.ts')}?as-critical-script`, context)

    expect(warnings).toHaveLength(0)
  })

  describe('target', () => {
    const modern = `${fixture('modern-syntax.ts')}?as-critical-script`

    it('leaves modern syntax intact when unset', async () => {
      const output = await runLoad(criticalScriptPlugin(), modern)

      expect(output).toContain('?.')
      expect(output).toContain('??')
    })

    it('compiles the inline script down to a language target', async () => {
      const output = await runLoad(criticalScriptPlugin({ target: 'es2015' }), modern)

      expect(output).not.toContain('?.')
      expect(output).not.toContain('??')
      expect(output).toContain('window.__critical')
    })

    it('accepts a list of browser targets', async () => {
      const output = await runLoad(criticalScriptPlugin({ target: ['chrome58', 'safari11'] }), modern)

      expect(output).not.toContain('?.')
      expect(output).toContain('window.__critical')
    })

    it('measures the size limit against the compiled-down output', async () => {
      // The limit is checked against the compiled script, not the module the
      // plugin returns, and the wrapper reports that size as data-size.
      const compiledSize = async (target?: string) =>
        Number(/'data-size': (\d+)/.exec((await runLoad(criticalScriptPlugin({ target }), modern)) ?? '')?.[1])

      const modernSize = await compiledSize()
      const loweredSize = await compiledSize('es2015')

      expect(loweredSize).toBeGreaterThan(modernSize)

      // A limit between the two tells the orderings apart: checking it before
      // the transform ran would let the lowered script through.
      const between = Math.floor((modernSize + loweredSize) / 2)

      await expect(runLoad(criticalScriptPlugin({ outputSizeLimit: between }), modern)).resolves.toBeDefined()
      await expect(
        runLoad(criticalScriptPlugin({ outputSizeLimit: between, target: 'es2015' }), modern),
      ).rejects.toThrowError(/too large/)
    })
  })
})
