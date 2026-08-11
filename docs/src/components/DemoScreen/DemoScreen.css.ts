import { globalStyle, keyframes, style, styleVariants } from '@vanilla-extract/css'

import { vars } from '../../styles/vars.css'

/**
 * The two demo documents, which the benchmark loads in an iframe.
 *
 * They render inside a fixed-height frame, so everything here is sized to fit the shortest
 * panel without scrolling. The hero is cropped to a banner strip rather than shown at its
 * full 2:1 ratio.
 */

export const root = style({
  padding: '0.85rem 1rem',
})

export const head = style({
  alignItems: 'center',
  display: 'flex',
  gap: '0.75rem',
  justifyContent: 'space-between',
  marginBottom: '0.7rem',
})

const badgeBase = style({
  borderRadius: vars.radiusFull,
  borderStyle: 'solid',
  borderWidth: '1px',
  fontSize: '0.6875rem',
  letterSpacing: '0.03em',
  padding: '0.15rem 0.55rem',
  textTransform: 'uppercase',
})

/** Which page this is, in its own colour: the key colour for the one that got the plugin. */
export const badge = styleVariants({
  with: [
    badgeBase,
    {
      background: vars.brandWash,
      borderColor: `color-mix(in oklab, ${vars.brand} 40%, transparent)`,
      color: vars.brandStrong,
    },
  ],
  without: [
    badgeBase,
    {
      background: vars.slowWash,
      borderColor: `color-mix(in oklab, ${vars.slow} 40%, transparent)`,
      color: vars.slow,
    },
  ],
})

const stageBase = style({
  fontSize: '0.75rem',
  // Stays on the right whether or not the badge is rendered beside it.
  marginInlineStart: 'auto',
})

/** How far the page has got. Named by the stage rather than by the colour it takes. */
export const stage = styleVariants({
  booting: [stageBase, { color: vars.ink4 }],
  idle: [stageBase, { color: vars.ink3 }],
  ready: [stageBase, { color: vars.ok }],
  requesting: [stageBase, { color: vars.warn }],
})

export const problem = style({
  color: vars.slow,
  fontSize: '0.8125rem',
})

export const card = style({})

globalStyle(`${card} h1`, {
  fontSize: '0.9375rem',
  marginBottom: '0.5rem',
})

globalStyle(`${card} img`, {
  blockSize: '8rem',
  border: `1px solid ${vars.line}`,
  borderRadius: vars.radiusSm,
  display: 'block',
  inlineSize: '100%',
  objectFit: 'cover',
  objectPosition: '50% 45%',
})

globalStyle(`${card} ul`, {
  color: vars.ink2,
  fontSize: '0.75rem',
  lineHeight: 1.45,
  margin: '0.6rem 0 0',
  paddingInlineStart: '1rem',
})

const pulse = keyframes({
  '50%': { opacity: 0.45 },
})

export const skeleton = style({
  display: 'grid',
  gap: '0.5rem',
})

globalStyle(`${skeleton} span`, {
  animation: `${pulse} 1.4s ${vars.ease} infinite`,
  background: vars.surface2,
  borderRadius: vars.radiusSm,
  display: 'block',
})

globalStyle(`${skeleton} span`, {
  '@media': {
    '(prefers-reduced-motion: reduce)': { animation: 'none' },
  },
})

/* Matched to the loaded card, so nothing shifts when the content lands. */
export const skeletonTitle = style({
  blockSize: '1.1rem',
  inlineSize: '55%',
})

export const skeletonMedia = style({
  blockSize: '8rem',
})

export const skeletonLine = style({
  blockSize: '0.7rem',
})

export const skeletonLineShort = style({
  inlineSize: '70%',
})

export const metrics = style({
  borderTop: `1px solid ${vars.line}`,
  display: 'flex',
  gap: '1.25rem',
  margin: '0.7rem 0 0',
  paddingTop: '0.6rem',
})

globalStyle(`${metrics} dt`, {
  color: vars.ink3,
  fontSize: '0.625rem',
  letterSpacing: '0.03em',
  textTransform: 'uppercase',
})

globalStyle(`${metrics} dd`, {
  color: vars.ink1,
  fontFamily: vars.fontMono,
  fontSize: '0.9375rem',
  fontVariantNumeric: 'tabular-nums',
  margin: '0.1rem 0 0',
})
