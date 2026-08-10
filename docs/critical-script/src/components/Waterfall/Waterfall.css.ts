import { createVar, globalStyle, keyframes, style, styleVariants } from '@vanilla-extract/css'

import * as chart from '../../styles/chart.css'
import { vars } from '../../styles/vars.css'

/**
 * How the benchmark's cases are laid out: each case is a small picture of its demo page beside
 * its own lanes, and one axis across the top serves all of them.
 *
 * The picture only has to say whether that page is still loading, so it is the first thing to
 * give up room when the screen narrows.
 */

/**
 * The picture's size, and the room between it and the lanes. Set once at the top and read by
 * everything below, so the narrow layout only has to restate these four numbers.
 */
const previewW = createVar()
const previewH = createVar()
const previewScale = createVar()
const gutter = createVar()

export const root = style({
  vars: {
    [gutter]: '1rem',
    [previewH]: '154px',
    // The frame renders at its own size and is scaled down, so the demo keeps a layout worth
    // looking at rather than reflowing into a column. 176 / 480 and 154 / 420.
    [previewScale]: '0.3667',
    [previewW]: '176px',
  },
  '@media': {
    // Narrow enough that the lanes want the whole width. The picture moves up beside the
    // heading, where it costs no room of its own, and the chart spans everything underneath.
    'screen and (max-width: 40rem)': {
      vars: {
        [gutter]: '0.6rem',
        [previewH]: '74px',
        [previewScale]: '0.175',
        [previewW]: '84px',
      },
    },
  },
  marginBlockStart: '0.75rem',
})

export const row = style({
  display: 'grid',
  gap: `0.35rem ${gutter}`,
  gridTemplateAreas: `'title title' 'preview lanes'`,
  gridTemplateColumns: `${previewW} 1fr`,
  '@media': {
    'screen and (max-width: 40rem)': {
      gridTemplateAreas: `'preview title' 'lanes lanes'`,
      gridTemplateColumns: '1fr',
    },
  },
  marginBlockStart: '1.4rem',
})

globalStyle(`${row} > h3`, {
  color: vars.ink1,
  fontSize: '0.9375rem',
  gridArea: 'title',
  margin: 0,
  '@media': {
    'screen and (max-width: 40rem)': { alignSelf: 'center' },
  },
})

globalStyle(`${row} > ${chart.lanes}`, {
  gridArea: 'lanes',
})

export const preview = style({
  gridArea: 'preview',
  '@media': {
    'screen and (max-width: 40rem)': { alignSelf: 'center' },
  },
})

const frameBase = style({
  background: vars.surface1,
  blockSize: previewH,
  borderRadius: vars.radiusSm,
  borderWidth: '1px',
  inlineSize: previewW,
  overflow: 'hidden',
  position: 'relative',
  transition: `border-color 160ms ${vars.ease}`,
})

/**
 * A finished page carries the key green, so a glance says which one got there first. Nothing
 * has been asked for yet in the idle state, so that box is a placeholder and says so quietly.
 *
 * The border is declared by each state rather than once above and overridden here. A composed
 * style and the style it composes are two classes on one element, and which of them wins a
 * property they both set comes down to the order they were written to the stylesheet, which
 * differs between the dev server and a build. Nothing is set twice, so nothing can flip.
 */
export const frame = styleVariants({
  done: [frameBase, { borderColor: vars.ok, borderStyle: 'solid', boxShadow: `0 0 0 3px ${vars.okWash}` }],
  idle: [frameBase, { borderColor: vars.line, borderStyle: 'dashed' }],
  loading: [frameBase, { borderColor: vars.line, borderStyle: 'solid' }],
})

globalStyle(`${frameBase} iframe`, {
  blockSize: '420px',
  border: 0,
  inlineSize: '480px',
  transform: `scale(${previewScale})`,
  transformOrigin: 'top left',
})

const waiting = keyframes({
  '50%': { opacity: 0.35 },
})

const dotBase = style({
  blockSize: '0.875rem',
  borderRadius: '50%',
  inlineSize: '0.875rem',
  insetBlockEnd: '0.3rem',
  insetInlineEnd: '0.3rem',
  position: 'absolute',
})

/** The same three states as the frame, in the corner of it. */
export const dot = styleVariants({
  done: [
    dotBase,
    {
      background: vars.ok,
      // A tick, so the state does not rest on colour alone.
      ':after': {
        blockSize: '0.2rem',
        borderBlockEnd: `1.5px solid ${vars.surface0}`,
        borderInlineStart: `1.5px solid ${vars.surface0}`,
        content: '',
        inlineSize: '0.36rem',
        insetBlockStart: '0.28rem',
        insetInlineStart: '0.24rem',
        position: 'absolute',
        transform: 'rotate(-45deg)',
      },
    },
  ],
  idle: [dotBase, { background: vars.surface2, boxShadow: `0 0 0 1px ${vars.line}` }],
  loading: [
    dotBase,
    {
      animation: `${waiting} 1.1s ease-in-out infinite`,
      background: vars.surface3,
      boxShadow: `0 0 0 1px ${vars.lineStrong}`,
      '@media': {
        '(prefers-reduced-motion: reduce)': { animation: 'none' },
      },
    },
  ],
})

/* Named for a reader who cannot see the colour. */
export const said = style({
  clipPath: 'inset(50%)',
  position: 'absolute',
  whiteSpace: 'nowrap',
})
