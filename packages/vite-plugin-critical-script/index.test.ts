import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { criticalScriptPlugin } from './index'

type LoadObject = { handler: (id: string) => Promise<string | undefined> }

const fixture = (name: string) => fileURLToPath(new URL(`./__fixtures__/${name}`, import.meta.url))

const runLoad = (plugin: ReturnType<typeof criticalScriptPlugin>, id: string) =>
  (plugin.load as unknown as LoadObject).handler(id)

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
})
