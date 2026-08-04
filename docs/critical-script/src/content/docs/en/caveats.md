---
title: Caveats & Troubleshooting
description: Things to watch out for, and answers to common problems.
sidebar:
  order: 4
---

## Caveats

- **An inline script is part of the HTML.** External and CDN caching do not apply to it; it follows the caching policy of the HTML itself.
- **Inline only the minimum.** critical-script is a tool for work that **only makes sense if it runs before the main JS bundle loads**. Heavy logic and large libraries must be split into the regular JS bundle for the tool to be worth using. The `outputSizeLimit` default of 8192 bytes enforces this principle at build time (see [API Reference, outputSizeLimit](../api-reference/#outputsizelimit) for the full rationale).
- **All external dependencies end up in the inline bundle.** Every library imported inside `critical.ts` is inlined, so writing in vanilla JS is preferable where possible.
- **The inline script has to be rendered to HTML.** The imported component emits a `<script>` tag while React renders, so the plugin pays off in setups that produce HTML at build time or on the server, such as react-router in framework mode and `@tanstack/react-start`.
- **Hydration applies in SSR environments.** The `<CriticalScript />` component sets `suppressHydrationWarning` automatically.

## Troubleshooting

**Q. The build fails because `outputSizeLimit` was exceeded.**

Reduce the imports in `critical.ts` or simplify the code. If it depends on a large library, rewriting it in vanilla JS is recommended. To raise the threshold, adjust the plugin's `outputSizeLimit` option, but keep the whole HTML within 14KB.

**Q. `process.env.X` is not substituted after the build.**

Define the value to substitute explicitly with the `define` option.

```ts
criticalScriptPlugin({
  define: { 'process.env.API_URL': JSON.stringify('https://api.example.com') },
})
```

**Q. TypeScript reports that it does not know the `?as-critical-script` import.**

Follow the [TypeScript Setup](../getting-started/#typescript-setup) section and add the package name to `compilerOptions.types` in `tsconfig.json`.

**Q. The inline script is missing from the page.**

Check that the page is rendered to HTML rather than mounted only on the client. On a dev server that renders through SSR the script appears as well, so if it is missing, verify your vite version and look for hook ordering conflicts with other plugins.
