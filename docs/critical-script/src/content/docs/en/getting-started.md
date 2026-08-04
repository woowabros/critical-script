---
title: Getting Started
description: Install the plugin, register it in vite.config.ts, and inline your first critical script.
sidebar:
  order: 1
---

## Installation

```bash
npm install -D @woowabros/vite-plugin-critical-script
# or
pnpm add -D @woowabros/vite-plugin-critical-script
```

## Usage

1. Register the plugin in `vite.config.ts`.

```ts
import { defineConfig } from 'vite'
import { criticalScriptPlugin } from '@woowabros/vite-plugin-critical-script'

export default defineConfig({
  plugins: [criticalScriptPlugin({ outputSizeLimit: 8192 })],
})
```

2. Write the code you want to run as critical in a separate file.

```ts
// home.critical.ts
window.__home = fetch('/api/home').then((r) => r.json())
```

3. Import it from a component with the `?as-critical-script` suffix.

```tsx
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

At build time, `home.critical.ts` is compiled and minified by esbuild and inlined into the HTML as a `<script>` tag. See the [API Reference](../api-reference/) for plugin options such as `define`, and [Use Cases](../use-cases/) for common patterns.

## Output Example

Suppose you have this `home.critical.ts`.

```ts
performance.mark('critical-start')
window.__home = fetch('/api/home').then((r) => r.json())
```

After the build, it is inlined into the HTML like this (with esbuild minification applied).

```html
<script data-size="95">(()=>{performance.mark("critical-start");window.__home=fetch("/api/home").then(r=>r.json())})();</script>
```

- The script is wrapped in an IIFE, so it does not pollute the global scope.
- The `data-size` attribute lets you check the post-minification byte size at a glance, which is useful for debugging and monitoring.

## TypeScript Setup

For your IDE and build tooling to recognize the type definitions for `?as-critical-script` imports, add the package name to `compilerOptions.types` in `tsconfig.json`.

```json
{
  "compilerOptions": {
    "types": ["@woowabros/vite-plugin-critical-script"]
  }
}
```

With this setting, the default export of `import CriticalScript from './foo.critical?as-critical-script'` is inferred as a React component that accepts the standard HTML `<script>` attributes.
