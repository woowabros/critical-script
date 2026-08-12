# critical-script documentation site

The documentation site published at <https://woowabros.github.io/critical-script/>. Built with
[Astro](https://astro.build) and [Starlight](https://starlight.astro.build), and built by the
published plugin, so the benchmark pages exercise the real thing.

## Isolation from the repository

This directory is **not** part of the repository's pnpm workspace. It has its own
`pnpm-workspace.yaml` and its own `pnpm-lock.yaml`, so the site's dependencies never reach the root
lockfile or the published SBOM. The plugin comes from the registry at a pinned version rather than
from `packages/`, so nothing in the repository has to be built first, and the site always runs
against a release rather than the working tree.

Run the following commands from `docs/website/`:

```bash
pnpm install
pnpm dev
```

`pnpm build` writes the static site to `dist/`, and `pnpm preview` serves that output. Because the
inline critical script is a build artifact, the benchmark numbers only mean something against the
built output.

## Layout

| Path | What it holds |
|------|---------------|
| `../{en,ko}/` | Documentation pages loaded directly by Astro, one directory per locale. |
| `../404.md` | The shared not-found page. |
| `src/pages/demo/` | The two standalone benchmark pages, with and without the inline script. |
| `src/components/DemoScreen/prefetch.critical.ts` | The module the plugin compiles into an inline script. |
| `src/components/` | React islands: the demo screen and the benchmark runner. |
| `public/api/home.json` | The static response both demo pages request. |

## Documentation source

The site loads Markdown and MDX directly from `docs/en`, `docs/ko`, and `docs/404.md` through the
Astro collection configured in `src/content.config.ts`. These files are both the GitHub-readable
documentation and the published source. Do not create a second copy under `src/content/`.
