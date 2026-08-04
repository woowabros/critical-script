---
title: Use Cases
description: API prefetching, resource preloading, webview native bridges, and LCP optimization.
sidebar:
  order: 3
---

A critical script runs *before* the main JS bundle is downloaded and parsed. That timing is useful for the following kinds of work.

## API Prefetching

Kick off the request while the HTML is being parsed, then consume the response once the app has booted:

```ts
// home.critical.ts
window.__homeApi = fetch('/api/home').then((r) => r.json())
```

```tsx
// HomePage.tsx
useEffect(() => {
  window.__homeApi.then(setData)
}, [])
```

## Preloading Resources Resolved at Runtime

Take the LCP image URL from an API response and insert a `<link rel="preload">` right away:

```ts
// home.critical.ts
const data = await fetch('/api/home').then((r) => r.json())
const link = document.createElement('link')
link.rel = 'preload'
link.as = 'image'
link.href = data.heroImageUrl
document.head.appendChild(link)
```

## Webview Native Bridge

In a hybrid app, read the values passed in by native code before React renders, so the skeleton UI matches the device state without flicker. This is commonly used for bottom safe-area adjustments, such as iOS home indicators and fixed bottom areas:

```ts
// home.critical.ts
const inset = window.AppBridge?.getSafeAreaInsets?.()
if (inset) {
  document.documentElement.style.setProperty('--inset-bottom', `${inset.bottom}px`)
}
```

## LCP Optimization (Case Study)

The API prefetching pattern is used for performance optimization across various Baemin webview surfaces. Notably, on the commerce web, LCP (Largest Contentful Paint) improved by 30–40% compared to before it was applied.
