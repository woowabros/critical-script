import { createGlobalThemeContract } from '@vanilla-extract/css'

/**
 * The tokens, as names a stylesheet written in TypeScript can reach.
 *
 * A contract rather than a theme: the values live in tokens.css and stay there. That file is
 * loaded by the documentation pages and by the standalone ones, and its variables are read
 * from Astro style blocks and from the stylesheet that dresses Starlight. Declaring the
 * palette a second time here would leave two places to change a colour in.
 *
 * So this only maps each token to the custom property it already has. `vars.surface1` writes
 * `var(--surface-1)`, and nothing new is emitted.
 */
export const vars = createGlobalThemeContract({
  accent2: 'accent-2',
  accent2Dim: 'accent-2-dim',
  accent2Strong: 'accent-2-strong',
  accent2Wash: 'accent-2-wash',
  brand: 'brand',
  brandDeep: 'brand-deep',
  brandDim: 'brand-dim',
  brandEdge: 'brand-edge',
  brandStrong: 'brand-strong',
  brandWash: 'brand-wash',
  codeBg: 'code-bg',
  codeChrome: 'code-chrome',
  codeLine: 'code-line',
  danger: 'danger',
  ease: 'ease',
  fontMono: 'font-mono',
  fontSans: 'font-sans',
  info: 'info',
  infoWash: 'info-wash',
  ink1: 'ink-1',
  ink2: 'ink-2',
  ink3: 'ink-3',
  ink4: 'ink-4',
  line: 'line',
  lineStrong: 'line-strong',
  ok: 'ok',
  okWash: 'ok-wash',
  radiusFull: 'radius-full',
  radiusLg: 'radius-lg',
  radiusMd: 'radius-md',
  radiusSm: 'radius-sm',
  shadowLg: 'shadow-lg',
  shadowMd: 'shadow-md',
  shadowSm: 'shadow-sm',
  slow: 'slow',
  slowWash: 'slow-wash',
  surface0: 'surface-0',
  surface1: 'surface-1',
  surface2: 'surface-2',
  surface3: 'surface-3',
  warn: 'warn',
  warnWash: 'warn-wash',
})
