<div align="center">
  <a href="https://github.com/woowabros/critical-script" title="critical-script - Inline critical scripts for React prerender">
    <img src="./docs/public/og.png" alt="critical-script — Inline critical scripts for React prerender" height="400" />
  </a>
  <p>
    <a href="https://github.com/woowabros/critical-script/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
    <a href="https://www.npmjs.com/package/@woowabros/vite-plugin-critical-script"><img src="https://img.shields.io/npm/v/@woowabros/vite-plugin-critical-script?logo=npm" alt="NPM badge" /></a>
    <a href="https://www.npmjs.com/package/@woowabros/vite-plugin-critical-script"><img src="https://img.shields.io/npm/dm/@woowabros/vite-plugin-critical-script?logo=npm" alt="NPM downloads" /></a>
    <a href="https://github.com/woowabros/critical-script"><img src="https://img.shields.io/github/stars/woowabros/critical-script?logo=github" alt="GitHub stars" /></a>
  </p>
</div>

# critical-script

English | [한국어](https://github.com/woowabros/critical-script/blob/main/README-ko_kr.md)

critical-script is a vite plugin that turns TypeScript code into an inline `<script>` tag embedded in prerendered HTML, so that critical work runs before the main JavaScript bundle is loaded.

- Importing a module with `?as-critical-script` produces a React component, and the inline script is embedded when that component is rendered to HTML at build time.
- Write it in TypeScript and it is type-checked at compile time. esbuild compiles and minifies the result, keeping the inline script as small as possible.
- It is built for work whose value depends on timing, such as [API prefetching, resource preloading, webview native bridges, and LCP optimization](./docs/en/use-cases.md).
- The `outputSizeLimit` option, 8192 bytes by default, caps the inline script at build time and fails the build when the limit is exceeded.
- It works with vite-based React frameworks that prerender HTML, including [react-router](https://github.com/remix-run/react-router) in framework mode and [@tanstack/react-start](https://github.com/TanStack/router).
- It is used across Baemin webview surfaces in production, where the API prefetch pattern improved LCP by 30–40% on the commerce webview service.

## Installation

```bash
npm install -D @woowabros/vite-plugin-critical-script
```

## Example

```ts
// home.critical.ts
performance.mark('critical-start')
window.__home = fetch('/api/home').then((r) => r.json())
```

```tsx
// home.tsx
import CriticalScript from './home.critical?as-critical-script'

export default function Home() {
  return (
    <>
      <CriticalScript />
      <Page />
    </>
  )
}
```

```html
<!-- built HTML -->
<script data-size="95">
  ;(() => {
    performance.mark('critical-start')
    window.__home = fetch('/api/home').then((r) => r.json())
  })()
</script>
```

## Documentation

- [Getting Started](./docs/en/getting-started.md): installation, usage, output example, and TypeScript setup.
- [Design Philosophy](./docs/en/design-philosophy.md): what belongs in an inline script, and when to use this plugin.
- [Use Cases](./docs/en/use-cases.md): API prefetching, resource preloading, webview native bridges, and LCP optimization.
- [API Reference](./docs/en/api-reference.md): plugin options, component props, and compatibility.
- [Caveats & Troubleshooting](./docs/en/caveats.md): things to watch out for, and answers to common problems.

## Contributors

We welcome contributions from everyone in the community. Read our [Contributing Guide](./CONTRIBUTING.md) to familiarize yourself with the development process, how to suggest bug fixes and improvements, and the steps for building and testing your changes.

<a href="https://github.com/woowabros/critical-script/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=woowabros/critical-script" />
</a>

## License

MIT © Woowabros. See [LICENSE](./LICENSE) for details.
