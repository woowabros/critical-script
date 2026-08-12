---
title: API Reference
description: Plugin options, component props, and framework compatibility.
sidebar:
  order: 1
---

## Plugin Options

`criticalScriptPlugin` accepts the following options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `outputSizeLimit` | `number` | `8192` | Maximum size (in bytes) of the compiled inline script. Exceeding it fails the build. |
| `define` | `Record<string, string>` | `{}` | Passed directly to `define` in esbuild's build options. Commonly used to inject environment variables at build time. |
| `target` | `string \| string[]` | `esnext` | Language or browser versions the inline script is compiled down to (passed to esbuild). |

### outputSizeLimit

Maximum size (in bytes) of the compiled inline script. Exceeding the limit fails the build. The default of `8192` serves the following purposes.

1. **Preserve the tool's essential role**: critical-script is a tool for work that **only makes sense if it runs before the main JS bundle loads**. Putting heavy logic in the inline script defeats the purpose of using it, and that kind of logic belongs in the regular JS bundle. A small limit is the mechanism that enforces this principle at build time.
2. **A mistake detector**: If code that carelessly `import`s a large library slips into a PR, the build fails and it is caught immediately.
3. **Avoid delaying the subsequent JS bundle download**: The larger the inline script, the later the `<script src="bundle.js">` that follows it is discovered and starts downloading. If the time gained by the inline code is offset by the main bundle arriving later, overall performance can end up worse.

The default `outputSizeLimit` encourages small inline scripts. Increase it only when you have a specific reason.

### define

The option is passed directly to `define` in esbuild's build options. It is commonly used to inject environment variables at build time:

```ts
criticalScriptPlugin({
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    'process.env.API_URL': JSON.stringify('https://api.example.com'),
  },
})
```

### target

Language or browser versions the inline script is compiled down to. The value goes straight to esbuild, so it accepts the same forms.

```ts
criticalScriptPlugin({ target: 'es2017' })
criticalScriptPlugin({ target: ['chrome87', 'safari14'] })
```

Leaving it unset applies esbuild's default of `esnext`, so setting a value that matches the browsers you support is recommended. `target` lowers syntax only. esbuild adds no API polyfills, and a critical script runs before the main bundle, so nothing the bundle would have transformed or polyfilled is available to it.

1. **The script may not run at all**: An unsupported syntax or token can stop the whole script from running in the browser.
2. **Keep the version aligned with the application**: If the application supports older browsers, the inline script has to be compiled down to the same level to be safe.

## `<CriticalScript />` component props

An imported critical script component accepts the standard HTML `<script>` attributes:

```tsx
<CriticalScript id="my-script" nonce={nonce} />
```

The component automatically sets `suppressHydrationWarning` and attaches a `data-size` attribute indicating the script size.

## Compatibility

### Framework Support

| Framework | Package | Supported versions |
|-----------|---------|--------------------|
| [vite](https://github.com/vitejs/vite) | `@woowabros/vite-plugin-critical-script` | 5.x |
| [react-router](https://github.com/remix-run/react-router) | `@woowabros/vite-plugin-critical-script` | 7.x |
| [@tanstack/react-start](https://github.com/TanStack/router) | `@woowabros/vite-plugin-critical-script` | 1.x |

### React Versions

- 17.x
- 18.x
- 19.x
