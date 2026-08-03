# API Reference

## Plugin Options

`criticalScriptPlugin` accepts the following options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `outputSizeLimit` | `number` | `8192` | Maximum size (in bytes) of the compiled inline script. Exceeding it fails the build. |
| `define` | `Record<string, any>` | `{}` | Global constants to substitute at build time (similar to esbuild's define). |

### outputSizeLimit

Maximum size (in bytes) of the compiled inline script. Exceeding the limit fails the build. The default of `8192` carries four intentions.

1. **Fit the HTML in the first TCP packet**: Per [RFC 6928](https://datatracker.ietf.org/doc/html/rfc6928), the TCP initial congestion window (initcwnd) is 10 segments, roughly 14KB. If the entire compressed `index.html` fits within 14KB, the HTML arrives in a single round trip and initial rendering is faster. 8192 bytes leaves headroom even once the rest of the HTML content is added.
2. **Preserve the tool's essential role**: critical-script is a tool for work that **only makes sense if it runs before the main JS bundle loads**. Putting heavy logic in the inline script defeats the purpose of using it, and that kind of logic belongs in the regular JS bundle. A small limit is the mechanism that enforces this principle at build time.
3. **A mistake detector**: If code that carelessly `import`s a large library slips into a PR, the build fails and it is caught immediately.
4. **Avoid delaying the subsequent JS bundle download**: The larger the inline script, the later the `<script src="bundle.js">` that follows it is discovered and starts downloading. If the time gained by the inline code is offset by the main bundle arriving later, overall performance can end up worse.

> 14KB is an estimate based on TCP MSS (about 1460B) × initcwnd (10) and varies with the actual network environment. The principle — "**keep it minimal**" — matters more than the exact number.

### define

Defines values to substitute as global constants at build time:

```ts
criticalScriptPlugin({
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    'process.env.API_URL': JSON.stringify('https://api.example.com'),
  },
})
```

## Critical Script Component Props

An imported critical script component accepts the standard HTML `<script>` attributes:

```tsx
<CriticalScript id="my-script" nonce={nonce} />
```

The component automatically sets `suppressHydrationWarning` and attaches a `data-size` attribute indicating the script size.

## Compatibility

### Framework Support

| Framework | Package | Supported versions |
|-----------|---------|--------------------|
| vite | `@woowabros/vite-plugin-critical-script` | 5.x |
| [react-router](https://github.com/remix-run/react-router) | `@woowabros/vite-plugin-critical-script` | 7.x |
| [@tanstack/react-start](https://github.com/TanStack/router) | `@woowabros/vite-plugin-critical-script` | 1.x |

### React Versions

- 17.x
- 18.x
- 19.x
