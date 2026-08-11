import { createVar, globalStyle, style, styleVariants } from '@vanilla-extract/css'

import type { DemoLane } from '../lib/demo'
import { vars } from './vars.css'

/**
 * The waterfall chart's own visual language. Two components draw one, so this sits with the
 * shared styles rather than beside either of them.
 *
 * The chart is drawn by d3 rather than by React, so lib/waterfall.ts imports these names and
 * hands them to the elements it creates. Nothing here is a name a stylesheet elsewhere could
 * reach by guessing it.
 */

/** The lane's colour, set by the lane class and read by everything drawn in that row. */
export const laneInk = createVar()

export const lanes = style({
  display: 'block',
  inlineSize: '100%',
  overflow: 'visible',
})

/* Rows sit flush against each other, so the gridlines are the only vertical structure. */
export const grid = style({
  stroke: vars.line,
  strokeWidth: 1,
})

/** Only a hook for d3 to join on. The row itself carries nothing to look at. */
export const row = style({})

/* A bar edge against the row above and below, so touching rows stay legible. */
export const bar = style({
  fill: laneInk,
  stroke: vars.surface0,
  strokeWidth: 1,
})

/* Where a bar used to be, for comparing against where it is now. Its opacity is set on the
   element rather than here: a declaration in a stylesheet overrides that presentation
   attribute, which would pin it flat. */
export const ghost = style({
  fill: laneInk,
})

const labelBase = style({
  fontSize: '11px',
  fontVariantNumeric: 'tabular-nums',
  pointerEvents: 'none',
})

/**
 * Inside a bar the label sits on the lane's own colour, which is bright enough to need dark
 * text. Outside it, the label carries the page's own ink instead.
 */
export const label = styleVariants({
  inside: [labelBase, { fill: vars.surface0, fontWeight: 600 }],
  outside: [labelBase, { fill: vars.ink2 }],
})

/* The numbered marks at the head of a bar, which tie the chart to the steps written under
   it. The number sits on the lane's own colour, so it needs dark text like a label inside a
   bar does. */
export const step = style({})

globalStyle(`${step} circle`, {
  fill: laneInk,
  // The same edge a bar carries against its neighbours. A mark often sits over a bar of its own
  // colour, and without this the two read as one shape.
  stroke: vars.surface0,
  strokeWidth: 1,
})

globalStyle(`${step} text`, {
  fill: vars.surface0,
  fontSize: '10px',
  fontVariantNumeric: 'tabular-nums',
  fontWeight: 700,
  pointerEvents: 'none',
})

/**
 * The stretch a lane no longer spends, drawn as a measure across the room its bar used to
 * take. In the one colour nothing else on the chart uses, so it reads as an annotation over
 * the measurement rather than as another lane of it.
 */
export const saved = style({
  pointerEvents: 'none',
})

export const savedRule = style({
  fill: 'none',
  stroke: vars.danger,
  strokeDasharray: '4 3',
  strokeWidth: 1.5,
})

/** Pointing at where the lane ends now, away from where it used to. */
export const savedHead = style({
  fill: vars.danger,
})

export const savedTick = style({
  stroke: vars.danger,
  strokeWidth: 1.5,
})

export const savedLabel = style({
  fill: vars.danger,
  fontSize: '11px',
  fontVariantNumeric: 'tabular-nums',
  fontWeight: 700,
})

/**
 * Loading and painting keep the colours the browser's own tools use for them. The two lanes
 * the plugin actually moves carry the key colour instead.
 */
const LANE_INK: Record<DemoLane, string> = {
  api: vars.brand,
  critical: vars.brand,
  document: vars.info,
  execute: vars.warn,
  image: vars.slow,
  paint: vars.ok,
  script: vars.accent2,
}

export const lane = styleVariants(LANE_INK, (ink) => ({ vars: { [laneInk]: ink } }))
