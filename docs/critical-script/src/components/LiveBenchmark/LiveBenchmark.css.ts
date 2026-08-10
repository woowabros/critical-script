import { globalStyle, style } from '@vanilla-extract/css'

import { vars } from '../../styles/vars.css'

/**
 * The wrapper that lets the benchmark sit on a documentation page. It carries the heading and
 * the sentence under it, so the benchmark's own page can keep its larger title.
 */

export const root = style({
  borderBlockStart: `1px solid ${vars.line}`,
  marginBlock: '3rem 2rem',
  paddingBlockStart: '2.5rem',
})

export const head = style({
  marginBlockEnd: '1.75rem',
})

/* The same weight as the heading over the recorded chart further up the page. Neither of them
   is the page's own title, and the two sections should read as a pair. */
globalStyle(`${head} h2`, {
  fontSize: '1.25rem',
  margin: 0,
})

globalStyle(`${head} p`, {
  color: vars.ink3,
  fontSize: '0.875rem',
  margin: '0.4rem 0 0',
  maxInlineSize: '62ch',
})
