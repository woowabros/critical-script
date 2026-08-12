import { globalStyle, style } from '@vanilla-extract/css'

import { laneInk } from '../../styles/chart.css'
import { vars } from '../../styles/vars.css'

/**
 * The landing page's chart: one recorded run, sliding between the two states rather than
 * measuring anything.
 *
 * Beside the component that renders it, and every class name below is generated, so nothing
 * here can reach any other part of the site. The chart's own bars and labels are drawn by d3
 * and styled by styles/chart.css, which the two components that draw a chart share.
 */

/* No card around it. The chart is already a bounded shape, and a panel only put a second
   frame around the one the gridlines draw.

   More room below than above: the rows of the chart run flush to the bottom edge of the
   `<svg>`, so the last bar would otherwise sit right against whatever follows the section. */
export const root = style({
  marginBlock: '2.5rem 4.5rem',
})

export const head = style({})

globalStyle(`${head} h2`, {
  fontSize: '1.25rem',
  margin: 0,
})

globalStyle(`${head} p`, {
  color: vars.ink3,
  fontSize: '0.875rem',
  margin: '0.4rem 0 0',
  maxInlineSize: '62ch',
  textWrap: 'balance',
})

/* Directly under the chart, next to what it changes, rather than as chrome in a corner. */
export const toggle = style({
  alignItems: 'center',
  // Nothing here is text to be taken away. Dragging across a switch should not leave a
  // selection behind, and a double click on the label should still just flip it.
  userSelect: 'none',
  color: vars.ink1,
  cursor: 'pointer',
  display: 'inline-flex',
  fontSize: '0.875rem',
  fontWeight: 600,
  gap: '0.5rem',
  marginBlockStart: '1.1rem',
})

/* Out of sight but not out of the page: the switch beside it is only a drawing, so the
   checkbox stays where the keyboard can reach it and where a screen reader can read it. */
export const control = style({
  blockSize: '1px',
  inlineSize: '1px',
  margin: 0,
  opacity: 0,
  position: 'absolute',
})

export const track = style({
  alignItems: 'center',
  background: vars.surface3,
  blockSize: '1.25rem',
  borderRadius: vars.radiusFull,
  display: 'inline-flex',
  flex: 'none',
  inlineSize: '2.25rem',
  padding: '0.1875rem',
  selectors: {
    [`${toggle}:hover &`]: {
      background: `color-mix(in oklab, ${vars.surface3} 70%, ${vars.lineStrong})`,
    },
    [`${control}:checked + &`]: {
      background: vars.brand,
    },
    [`${control}:focus-visible + &`]: {
      outline: `2px solid ${vars.brand}`,
      outlineOffset: '2px',
    },
  },
  transition: `background-color 0.2s ${vars.ease}`,
  ':after': {
    background: vars.ink3,
    blockSize: '0.875rem',
    borderRadius: vars.radiusFull,
    content: '',
    inlineSize: '0.875rem',
    transition: `translate 0.2s ${vars.ease}, background-color 0.2s ${vars.ease}`,
  },
})

/* The knob travels the width the track leaves it, which is the track less its own width. A
   global rule, because this is a pseudo-element under a condition set by another element. */
globalStyle(`${control}:checked + ${track}::after`, {
  background: vars.surface0,
  translate: '1rem',
})

export const chart = style({
  marginBlockStart: '1.5rem',
})

/* Under the chart rather than beside it, so each line is read after the bar it explains. */
export const steps = style({
  display: 'grid',
  gap: '1.1rem',
  listStyle: 'none',
  margin: '1.5rem 0 0',
  maxInlineSize: '76ch',
  padding: 0,
})

/**
 * The number and the title on one line, everything the step has to say under them, indented
 * to the title rather than to the number.
 *
 * A dotted run reaches from one number down to the next, so the three read as one sequence
 * rather than as three separate notes. It starts below the circle and past the bottom of its
 * own item, into the gap under the line, which is what makes it meet the next number.
 */
export const step = style({
  columnGap: '0.6rem',
  display: 'grid',
  // The second track is capped at zero rather than left to size itself: a `1fr` column takes
  // its minimum from its content, which is what would let the snippet widen the whole page
  // instead of scrolling inside its own block.
  gridTemplateColumns: '1.25rem minmax(0, 1fr)',
  position: 'relative',
  rowGap: '0.25rem',
  selectors: {
    '&:not(:last-child)::before': {
      borderInlineStart: `1px dashed ${vars.lineStrong}`,
      content: '',
      insetBlock: '1.45rem -0.75rem',
      insetInlineStart: '0.625rem',
      position: 'absolute',
    },
  },
  transition: `opacity 0.3s ${vars.ease}`,
})

/* Held back rather than hidden, so the reader can still see what applying the plugin would
   add and where. Timed with the slide of the bars. */
export const stepIdle = style({
  opacity: 0.45,
})

/* The same height as the mark beside it, so the two line up without either being nudged. */
export const stepTitle = style({
  color: vars.ink1,
  fontSize: '0.9375rem',
  fontWeight: 600,
  lineHeight: '1.25rem',
})

/* The circled number the chart also draws at the head of the bar. The colour comes from the
   lane class the element carries alongside this one, which is what sets this variable. */
export const stepMark = style({
  background: laneInk,
  blockSize: '1.25rem',
  borderRadius: vars.radiusFull,
  color: vars.surface0,
  flex: 'none',
  fontSize: '0.75rem',
  fontVariantNumeric: 'tabular-nums',
  fontWeight: 700,
  inlineSize: '1.25rem',
  lineHeight: '1.25rem',
  textAlign: 'center',
})

export const stepBody = style({
  color: vars.ink3,
  fontSize: '0.875rem',
  gridColumn: 2,
  // For the same reason as the track above: a grid item takes its own minimum from its
  // content too, so it would grow past a capped track without this.
  minInlineSize: 0,
})

globalStyle(`${stepBody} p`, {
  margin: 0,
  maxInlineSize: '62ch',
})

/* A few lines of the built document, not a code sample to be copied, so it stays quiet and
   scrolls on its own rather than widening the page. */
export const code = style({
  background: vars.codeBg,
  border: `1px solid ${vars.codeLine}`,
  borderRadius: vars.radiusSm,
  color: vars.ink3,
  fontSize: '0.75rem',
  // Wide enough for the code and no wider, so the block does not stretch past the sentence
  // above it, and narrow enough to scroll rather than push the page sideways.
  inlineSize: 'max-content',
  lineHeight: 1.8,
  margin: '0.6rem 0 0',
  maxInlineSize: '100%',
  overflowX: 'auto',
  padding: '0.6rem 0.8rem',
})

globalStyle(`${code} code`, {
  fontFamily: vars.fontMono,
})

/* The one line the plugin wrote. */
globalStyle(`${code} b`, {
  color: vars.brandStrong,
  fontWeight: 600,
})
