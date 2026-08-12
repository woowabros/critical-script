import type { AstroIntegration } from 'astro'

import { readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Strips the `.html` suffix from the site's own links in the built output.
 *
 * `build.format: 'file'` is what gives us URLs with no trailing slash, but it also makes
 * Astro and Starlight write `href="/critical-script/en/caveats.html"`. GitHub Pages
 * resolves `/critical-script/en/caveats` to that same file, and so do `astro dev` and
 * `astro preview`, so the suffix is only noise in the address bar.
 *
 * Only links that point at this site are touched, matched either by the base path or by
 * the full canonical origin. Anything external is left alone.
 */
export function cleanUrls({ base, site }: { base: string; site: string }): AstroIntegration {
  const prefixes = [base, new URL(base, site).href]
  // The prefix alternation needs its own group, or the trailing `[^"]*?` would only
  // apply to the last alternative.
  const pattern = new RegExp(
    `((?:href|content)=")((?:${prefixes.map(escapeRegExp).join('|')})[^"]*?)\\.html((?:#|\\?)[^"]*)?"`,
    'g',
  )

  return {
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir)
        let rewritten = 0

        for (const file of await htmlFiles(root)) {
          const html = await readFile(file, 'utf8')
          const next = html.replace(pattern, (_match, lead, target, tail) => `${lead}${target}${tail ?? ''}"`)

          if (next !== html) {
            await writeFile(file, next)
            rewritten += 1
          }
        }

        logger.info(`removed the .html suffix from internal links in ${rewritten} file(s)`)
      },
    },
    name: 'clean-urls',
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function htmlFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const found: string[] = []

  for (const entry of entries) {
    const full = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      found.push(...(await htmlFiles(full)))
    } else if (entry.name.endsWith('.html')) {
      found.push(full)
    }
  }

  return found
}
