---
title: Design Philosophy
description: What belongs in an inline critical script, and when the plugin pays off.
sidebar:
  order: 2
---

critical-script is a tool for doing work that **only makes sense if it runs before the main JS bundle loads**, with *as little code as possible*.

- Inline only the work that has to start before the main JS bundle arrives, such as API prefetching, resource preloading, and calls to native webview bridges.
- Keep heavy logic such as synchronous computation or large library usage in the regular JS bundle.
- The default `outputSizeLimit` of 8192 bytes enforces this principle at build time. See [API Reference > outputSizeLimit](./api-reference.md#outputsizelimit) for the full rationale.

## When to Use It

critical-script pays off most when two conditions hold at the same time.

1. **Timing determines the outcome.** Work that only makes sense if it runs before the main JS bundle loads (API prefetching, resource preloading, calls to native webview bridges, skeleton UI adjustments, and so on).
2. **The code to inline is more than a one-liner.** It carries some amount of logic, changes often, or is shared across several places. In that case TypeScript's static checking, module system, and IDE support help a great deal.

You do not need critical-script when any of the following applies:

- **The work can run after the main JS bundle loads.** Put it in the regular bundle.
- **The work contains heavy logic.** Put it in the regular bundle.
- **The inline code is 1–2 lines and rarely changes.** Write it directly in a `<script>` tag.
