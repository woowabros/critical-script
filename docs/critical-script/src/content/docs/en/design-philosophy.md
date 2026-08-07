---
title: Design Philosophy
description: What belongs in an inline critical script, and when the plugin pays off.
sidebar:
  order: 2
---

critical-script is a tool for doing work that **only makes sense if it runs before the main JS bundle loads**, with *as little code as possible*.

- Inline only the work that has to start before the main JS bundle arrives, such as API prefetching, resource preloading, and webview bridges.
- Keep heavy logic such as synchronous computation or large library usage in the regular JS bundle. Cramming it into the inline script defeats the purpose of this tool.
- The default `outputSizeLimit` of 8192 bytes enforces this principle at build time. See [API Reference, outputSizeLimit](/critical-script/en/api-reference#outputsizelimit) for the full rationale.

## When to Use It

critical-script pays off most when two conditions hold at the same time.

1. **Timing determines the outcome.** Work that only makes sense if it runs before the main JS bundle loads (API prefetching, resource preloading, webview bridges, skeleton UI adjustments, and so on).
2. **The code to inline is more than a one-liner.** It carries some amount of logic, changes often, or is shared across several places. In that case TypeScript's static checking, module system, and IDE support help a great deal.

It only works with vite-based React frameworks that prerender HTML.

## When You Don't Need It

- **The work is fine running after the main JS bundle.** Put it in the regular bundle.
- **You are trying to inline heavy logic.** It belongs in a JS bundle instead.
- **The inline code is 1–2 lines and rarely changes.** Writing it directly in a `<script>` tag is simpler.
