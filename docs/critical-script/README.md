# critical-script documentation site

The documentation site published at <https://woowabros.github.io/critical-script/>. Built with
[Astro](https://astro.build) and [Starlight](https://starlight.astro.build), and built by the plugin
this repository ships, so the benchmark pages exercise the real thing.

## Isolation from the repository

This directory is **not** part of the repository's pnpm workspace. It has its own
`pnpm-workspace.yaml` and its own `pnpm-lock.yaml`, so the site's dependencies never reach the root
lockfile or the published SBOM. The plugin is consumed through
`link:../../packages/vite-plugin-critical-script`, which means the plugin has to be built before the
site is.

```bash
# once, from the repository root
pnpm install
pnpm --filter @woowabros/vite-plugin-critical-script build

# then, in this directory
pnpm install
pnpm dev
```

`pnpm build` writes the static site to `dist/`, and `pnpm preview` serves that output. Because the
inline critical script is a build artifact, the benchmark numbers only mean something against the
built output.

## Layout

| Path | What it holds |
|------|---------------|
| `src/content/docs/{en,ko}/` | Documentation pages, one directory per locale. |
| `src/pages/demo/` | The two standalone benchmark pages, with and without the inline script. |
| `src/critical/prefetch.critical.ts` | The module the plugin compiles into an inline script. |
| `src/components/` | React islands: the demo screen and the benchmark runner. |
| `public/api/home.json` | The static response both demo pages request. |

## Relationship to `docs/en` and `docs/ko`

The markdown under `docs/en` and `docs/ko` stays in place for reading on GitHub, and the pages here
are the versions published on the site. The two sets cover the same material, so a change to one
needs the same change in the other.
