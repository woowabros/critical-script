<div align="center">
  <a href="https://github.com/woowabros/critical-script" title="critical-script - Inline critical scripts for React prerender">
    <img src="./public/img/og.png" alt="critical-script — Inline critical scripts for React prerender" height="300" />
  </a>
</div>

# vite-react-ssg

[← critical-script](../../README.md)

The smallest complete use of the plugin, built from `vite`, `react` and `react-dom` alone. The prerender step is written by hand, so nothing about how an inline script reaches the HTML stays hidden behind a framework.

- Two files carry the whole idea: one critical script and one component that consumes its result.
- Five source files and roughly a hundred lines, comments and types included, compiling to an 81 byte inline script.
- The API it fetches is a static file, so the built output works on any static host.
- It installs `@woowabros/vite-plugin-critical-script` from npm, exactly as a consumer would, and sits outside the repository's pnpm workspace so its dependencies never reach the root lockfile or the published SBOM.

## Running it

The example installs the plugin from npm, so nothing has to be built in the repository first.

```bash
cd examples/vite-react-ssg
pnpm install
pnpm build
pnpm preview
```

`pnpm preview` serves the built output. There is deliberately no `dev` script: the inline script is a build artifact, so a dev server has none, and the page says so instead of waiting forever.

## The critical script

`src/home.critical.ts` is the code that gets inlined. It is a plain TypeScript module.

```ts
// home.critical.ts
window.__home = fetch('/api/home.json').then((response) => response.json() as Promise<HomeData>)
```

`src/App.tsx` imports it with the `?as-critical-script` suffix, renders it as a component, and consumes the result.

```tsx
// App.tsx
import CriticalScript from './home.critical?as-critical-script'

export default function App() {
  const [home, setHome] = useState<HomeData | null>(null)

  useEffect(() => {
    // The request started during HTML parsing. Here we only take the result.
    void window.__home?.then(setHome)
  }, [])

  return (
    <>
      <CriticalScript />
      {/* … */}
    </>
  )
}
```

After the build, `dist/client/index.html` holds this.

<!-- prettier-ignore -->
```html
<div id="root">
  <script data-size="81">"use strict";(()=>{window.__home=fetch("/api/home.json").then(o=>o.json());})();</script>
  <main class="page">…</main>
</div>
```

The browser runs that script while it is still parsing the document, so the request is already in flight when the bundle arrives. By the time the component's effect runs, the response is waiting instead of being requested.

## Layout

```
examples/vite-react-ssg/
├── index.html          the page shell, holding an <!--app-html--> placeholder
├── prerender.js         fills the placeholder with the rendered HTML
├── public/api/          the static file the critical script fetches
└── src/
    ├── home.critical.ts the inlined code
    ├── App.tsx          renders <CriticalScript /> and consumes the result
    ├── entry-server.tsx exports render() for the prerender step
    ├── entry-client.tsx hydrates #root
    └── styles.css
```

The build runs in three steps, and each can be run on its own.

```bash
pnpm build:client   # the browser bundle plus an index.html holding the placeholder
pnpm build:server   # the same app bundled so Node can execute it
pnpm prerender      # calls render() and fills the placeholder
```

The plugin intercepts the `?as-critical-script` import during both builds and compiles it with esbuild. The inline `<script>` only lands in the HTML during the third step, which is the step a framework performs for you. With react-router in framework mode you turn on the `prerender` option and neither `prerender.js` nor `entry-server.tsx` needs to exist.

## Notes

**The example pins `vite@6.4.3`, ahead of the plugin package's own devDependency.** `vite@5.4.21` carries a high severity advisory ([GHSA-fx2h-pf6j-xcff](https://github.com/advisories/GHSA-fx2h-pf6j-xcff)) that has no fix in the 5.x line, since the vulnerable range reaches `<= 6.4.2`. `6.4.3` is both the first patched version and the newest 6.x release.

**`@vitejs/plugin-react` is deliberately absent.** Vite reads `jsx: "react-jsx"` from `tsconfig.json` and transforms TSX with esbuild, so it is not needed for a build. The cost is Fast Refresh, which this example does not rely on.

**The page explains itself when the inline script is missing.** Opening HTML that was never prerendered leaves `window.__home` unset, and the component says so rather than showing a spinner that never resolves.

To watch the size guard fire, lower it in `vite.config.ts` with `criticalScriptPlugin({ outputSizeLimit: 40 })` and build. The build fails and reports both the compiled size and the current limit.

## License

MIT © Woowabros. See [LICENSE](../../LICENSE) for details.
