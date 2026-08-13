import { globalStyle, style } from '@vanilla-extract/css'

import { vars } from '../../styles/vars.css'

/** The benchmark's own furniture: the run button, the settings, and what sits under them. */

/* No card around it. The run button and the closed group are already a short, quiet block,
   and a panel only put a frame around empty space. */
export const controls = style({
  display: 'grid',
  gap: '1.1rem',
  justifyItems: 'start',
  // The same step the timeline and the notes take, so the three blocks keep one rhythm now
  // that the controls sit under the cases rather than above them.
  marginTop: '1.5rem',
})

export const run = style({
  background: vars.brand,
  border: 0,
  borderRadius: vars.radiusFull,
  color: vars.surface0,
  cursor: 'pointer',
  font: 'inherit',
  fontWeight: 650,
  letterSpacing: '-0.01em',
  padding: '0.7rem 1.4rem',
  selectors: {
    '&:hover:not([disabled])': {
      boxShadow: `0 8px 24px -10px ${vars.brand}`,
      transform: 'translateY(-1px)',
    },
    '&[disabled]': {
      cursor: 'progress',
      opacity: 0.55,
    },
  },
  transition: `transform 0.18s ${vars.ease}, box-shadow 0.18s ${vars.ease}, opacity 0.18s ${vars.ease}`,
  whiteSpace: 'nowrap',
})

/* Closed to begin with, so the page opens on the run button and the timeline rather than on
   a wall of settings. */
export const conditions = style({
  inlineSize: '100%',
})

/**
 * Laying the summary out as a flex line drops the browser's own marker, so it carries its own.
 * `list-item` would keep the marker but not let the two labels sit on one baseline.
 */
globalStyle(`${conditions} summary`, {
  alignItems: 'baseline',
  color: vars.ink2,
  cursor: 'pointer',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.15rem 0.6rem',
  paddingBlock: '0.15rem',
})

globalStyle(`${conditions} summary:hover`, {
  color: vars.ink1,
})

globalStyle(`${conditions} summary::marker, ${conditions} summary::-webkit-details-marker`, {
  content: '',
  display: 'none',
})

globalStyle(`${conditions} summary::before`, {
  blockSize: '0.36rem',
  borderBlockEnd: '1.5px solid currentcolor',
  borderInlineEnd: '1.5px solid currentcolor',
  content: '',
  inlineSize: '0.36rem',
  marginBlockEnd: '0.12rem',
  marginInlineEnd: '0.1rem',
  transform: 'rotate(-45deg)',
  transition: `transform 160ms ${vars.ease}`,
})

globalStyle(`${conditions}[open] summary::before`, {
  transform: 'rotate(45deg)',
})

export const conditionsName = style({
  fontSize: '0.8125rem',
  fontWeight: 600,
  letterSpacing: '0.02em',
})

/* What the run would be carried out under, so a closed group still says something. */
export const conditionsNow = style({
  color: vars.ink3,
  fontSize: '0.8125rem',
})

/* One control per row, so a fourth one would only make the group taller. */
export const fields = style({
  display: 'grid',
  gap: '1.1rem',
  marginBlockStart: '1.1rem',
})

/**
 * The name reads as the row's heading with its choices beside it, and the description sits
 * under the choices rather than under the name, so the names line up as one column. Narrower
 * than that there is no room for a column of names, so each one sits above its own choices.
 */
export const field = style({
  border: 0,
  display: 'grid',
  gap: '0.4rem 1.25rem',
  gridTemplateColumns: 'minmax(0, 11.5rem) 1fr',
  '@media': {
    'screen and (max-width: 40rem)': { gridTemplateColumns: '1fr' },
  },
  margin: 0,
  minInlineSize: 0,
  padding: 0,
})

export const fieldName = style({
  alignSelf: 'center',
  color: vars.ink1,
  fontSize: '0.8125rem',
  fontWeight: 600,
  gridColumn: 1,
  letterSpacing: '0.02em',
})

globalStyle(`${field} p`, {
  color: vars.ink3,
  fontSize: '0.8125rem',
  gridColumn: 2,
  '@media': {
    'screen and (max-width: 40rem)': { gridColumn: 1 },
  },
  margin: 0,
  textWrap: 'balance',
})

/* The choices beside each setting's name. One row of small buttons, one of them pressed. */
export const choices = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.375rem',
})

globalStyle(`${choices} button`, {
  background: vars.surface2,
  border: `1px solid ${vars.line}`,
  borderRadius: vars.radiusFull,
  color: vars.ink2,
  cursor: 'pointer',
  font: 'inherit',
  fontSize: '0.8125rem',
  fontVariantNumeric: 'tabular-nums',
  padding: '0.25rem 0.7rem',
  transition: `all 0.16s ${vars.ease}`,
})

globalStyle(`${choices} button:hover:not([disabled])`, {
  borderColor: vars.lineStrong,
  color: vars.ink1,
})

globalStyle(`${choices} button[aria-pressed='true']`, {
  background: vars.brandWash,
  borderColor: `color-mix(in oklab, ${vars.brand} 45%, transparent)`,
  color: vars.brandStrong,
  fontWeight: 600,
})

globalStyle(`${choices} button[disabled]`, {
  opacity: 0.5,
})

/* The cases start where the block starts. What is written above them keeps its own room. */
export const timeline = style({})

/* Shown only when the worker was refused, which makes every wait shorter than asked for. */
export const warning = style({
  background: vars.warnWash,
  borderInlineStart: `2px solid ${vars.warn}`,
  color: vars.ink2,
  fontSize: '0.8125rem',
  margin: '1.2rem 0 0',
  maxInlineSize: '60ch',
  padding: '0.6rem 0.9rem',
})
