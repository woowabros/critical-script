import { select } from 'd3-selection'

import * as styles from '../../styles/chart.css'
import { type DemoLane, axisTicks, timeScale } from '../../lib/demo'

/**
 * Draws the benchmark waterfall. Everything below each `<svg>` element belongs to this
 * module: React hands over an empty root and never reaches inside it again.
 *
 * Lanes are redrawn on every animation frame while a run is in flight, so the joins are
 * keyed and nothing is measured through the layout engine.
 */

/** Row height. Rows sit flush against each other, so a case reads as one block. */
export const ROW = 22

/** Breathing room between a bar's edge and its label. */
const PAD = 6

/** Length of the arrowhead on the measure, and its height. */
const HEAD = 7

const LABEL_SIZE = 11

/** Radius of the numbered mark. Small enough to sit inside a row without touching the next. */
const STEP_R = 8

/**
 * Whether a lane has anything to draw. `pending` and `absent` both have no bar, but they
 * mean different things: one has not happened yet, the other never will. Only the second
 * is worth naming, so a run in flight is not littered with rows that say nothing.
 */
export type LaneState = 'absent' | 'pending' | 'present'

export interface ChartLane {
  end: number
  label: string
  /** Names the colour, which lives in the stylesheet with the rest of the palette. */
  lane: string
  start: number
  state: LaneState
  /** Set to number this lane as one step of the story the chart tells. */
  step?: number
  /** Already formatted, because the chart should not be deciding how numbers read. */
  value: string
}

/** Where a lane's caption ended up, once the bar turned out to be wide enough or not. */
interface Placed extends ChartLane {
  anchor: 'end' | 'start'
  caption: string
  /** The class the caption is drawn with, which says whether it sits on the bar or beside it. */
  place: string
  x: number
  y: number
}

/** The lane names are data, so a lane the chart has never heard of simply gets no colour. */
function laneClass(lane: string): string {
  return styles.lane[lane as DemoLane] ?? ''
}

/** Cached per root, so the label font is read from the stylesheet once rather than per frame. */
const fonts = new WeakMap<SVGSVGElement, string>()

function labelFont(root: SVGSVGElement): string {
  const known = fonts.get(root)

  if (known !== undefined) return known

  const font = `${LABEL_SIZE}px ${getComputedStyle(root).fontFamily}`

  fonts.set(root, font)

  return font
}

let ruler: CanvasRenderingContext2D | null | undefined

/**
 * Measures label widths on a canvas rather than through `getComputedTextLength`, which
 * would force the browser to lay the text out again on every frame of a run.
 */
function measurer(root: SVGSVGElement): (text: string) => number {
  ruler ??= document.createElement('canvas').getContext('2d')

  if (ruler === null) return (text) => text.length * LABEL_SIZE * 0.55

  ruler.font = labelFont(root)

  const context = ruler

  return (text) => context.measureText(text).width
}

/**
 * A set of bars to sit behind the real ones, for the reader to compare against. Only the
 * lanes worth comparing belong here: an identical bar drawn twice is just a brighter bar.
 */
export interface Reference {
  lanes: ChartLane[]
  /** 0 hides it. The caller fades it in as the chart moves away from the state it stands for. */
  opacity: number
  /** A measure across the room one lane no longer takes, drawn over the ghost of its old bar. */
  saved?: Saved
}

export interface Saved {
  /** Where the lane ends now, in ms. The arrow points here. */
  from: number
  label: string
  lane: string
  opacity: number
  /** Where it used to end. The measure runs out to here. */
  to: number
}

/** One case's lanes, against the same axis as every other case. */
export function drawLanes(
  root: SVGSVGElement,
  axis: number,
  lanes: ChartLane[],
  width: number,
  reference?: Reference,
): void {
  const height = Math.max(ROW, lanes.length * ROW)
  const scale = timeScale(axis, width)
  const measure = measurer(root)

  const svg = select(root).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`)

  const barWidth = (lane: ChartLane): number =>
    lane.state === 'present' ? Math.max(2, scale(lane.end) - scale(lane.start)) : 0

  /**
   * Inside the bar when the bar can hold the caption, past its end when the chart has room
   * to the right, and ahead of its start when it has not. A late lane would otherwise have
   * its caption pushed back over its own bar.
   */
  /**
   * Where the numbered mark goes, and which side of the bar's head it ended up on. It prefers
   * the outside, and moves inside when the bar starts too near the left edge to leave room.
   */
  const markSpot = (lane: ChartLane): { inside: boolean; x: number } => {
    const from = scale(lane.start)
    const inside = from - PAD - STEP_R < STEP_R

    return { inside, x: inside ? from + PAD + STEP_R : from - PAD - STEP_R }
  }

  /** The room a mark takes on whichever side of the head it sits, gap included. */
  const markRoom = (lane: ChartLane): number => (lane.step === undefined ? 0 : STEP_R * 2 + PAD)

  const place = (lane: ChartLane, index: number): Placed => {
    const y = index * ROW

    // A lane with no bar gets no caption either. Whether nothing has happened here yet or
    // nothing ever will, naming it would only leave a row of text with no bar to explain it.
    if (lane.state !== 'present') {
      return { ...lane, anchor: 'start', caption: '', place: '', x: 0, y }
    }

    // A stretch too short to have a length says only what it is. The inline script is the one
    // lane that lands inside a single millisecond, and `critical-script 0ms` reads as an error.
    const caption = lane.end - lane.start < 1 ? lane.label : `${lane.label} ${lane.value}`
    const text = measure(caption)
    const from = scale(lane.start)
    const to = scale(lane.end)
    // The caption steps around the mark rather than over it, on whichever side the mark took.
    const spot = lane.step === undefined ? null : markSpot(lane)
    const head = spot?.inside === true ? markRoom(lane) : 0
    const tail = spot?.inside === false ? markRoom(lane) : 0

    if (barWidth(lane) >= text + PAD * 2 + head) {
      return { ...lane, anchor: 'start', caption, place: styles.label.inside, x: from + PAD + head, y }
    }

    // A bar with no width ends where it starts, so a mark that moved inside one stands in the
    // way of a caption placed after it. Whichever of the two is further right wins the space.
    const after = spot?.inside === true ? Math.max(to + PAD, spot.x + STEP_R + PAD) : to + PAD

    if (after + text <= width) {
      return { ...lane, anchor: 'start', caption, place: styles.label.outside, x: after, y }
    }

    return {
      ...lane,
      anchor: 'end',
      caption,
      place: styles.label.outside,
      x: Math.max(text, from - PAD - tail),
      y,
    }
  }

  const placed = lanes.map(place)

  svg
    .selectAll<SVGLineElement, number>(`line.${styles.grid}`)
    .data(axisTicks(axis))
    .join('line')
    .attr('class', styles.grid)
    .attr('x1', (tick) => scale(tick))
    .attr('x2', (tick) => scale(tick))
    .attr('y1', 0)
    .attr('y2', height)

  // Appended before the rows, so it stays behind them however often this is redrawn.
  svg
    .selectAll<SVGRectElement, ChartLane & { y: number }>(`rect.${styles.ghost}`)
    .data(
      (reference?.lanes ?? [])
        .map((lane, index) => ({ ...lane, y: index * ROW }))
        .filter((lane) => lane.state === 'present'),
      (lane) => lane.lane,
    )
    .join('rect')
    .attr('class', (lane) => `${styles.ghost} ${laneClass(lane.lane)}`)
    .attr('x', (lane) => scale(lane.start))
    .attr('y', (lane) => lane.y)
    .attr('width', barWidth)
    .attr('height', ROW)
    .attr('opacity', reference?.opacity ?? 0)

  const row = svg
    .selectAll<SVGGElement, Placed>(`g.${styles.row}`)
    .data(placed, (entry) => entry.lane)
    .join((enter) => {
      const created = enter.append('g').attr('class', styles.row)

      created.append('rect')
      created.append('text')

      return created
    })

  row
    .select<SVGRectElement>('rect')
    .attr('class', (entry) => `${styles.bar} ${laneClass(entry.lane)}`)
    .attr('x', (entry) => scale(entry.start))
    .attr('y', (entry) => entry.y)
    .attr('width', barWidth)
    .attr('height', ROW)
    .attr('display', (entry) => (entry.state === 'present' ? null : 'none'))

  const mark = svg
    .selectAll<SVGGElement, Placed>(`g.${styles.step}`)
    .data(
      placed.filter((entry) => entry.step !== undefined && entry.state === 'present'),
      (entry) => entry.lane,
    )
    .join((enter) => {
      const created = enter.append('g')

      created.append('circle').attr('r', STEP_R)
      created.append('text').attr('text-anchor', 'middle').attr('dominant-baseline', 'central')

      return created
    })
    .attr('class', (entry) => `${styles.step} ${laneClass(entry.lane)}`)

  mark
    .select<SVGCircleElement>('circle')
    .attr('cx', (entry) => markSpot(entry).x)
    .attr('cy', (entry) => entry.y + ROW / 2)

  mark
    .select<SVGTextElement>('text')
    .attr('x', (entry) => markSpot(entry).x)
    .attr('y', (entry) => entry.y + ROW / 2)
    .text((entry) => String(entry.step))

  // Over the ghost, because the room it measures is the room the ghost still stands in. The
  // dashes break around the figure rather than running under it.
  const saved = reference?.saved
  const savedRow = lanes.findIndex((lane) => lane.lane === saved?.lane)

  svg
    .selectAll<SVGGElement, Saved>(`g.${styles.saved}`)
    .data(saved === undefined || savedRow < 0 ? [] : [saved])
    .join((enter) => {
      const created = enter.append('g')

      created.append('path').attr('class', styles.savedRule)
      created.append('path').attr('class', styles.savedHead)
      created.append('line').attr('class', styles.savedTick)
      created
        .append('text')
        .attr('class', styles.savedLabel)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')

      return created
    })
    .attr('class', (entry) => `${styles.saved} ${laneClass(entry.lane)}`)
    .attr('opacity', (entry) => entry.opacity)
    .call((group) => {
      const y = savedRow * ROW + ROW / 2
      const from = (entry: Saved): number => scale(entry.from)
      const to = (entry: Saved): number => scale(entry.to)
      const middle = (entry: Saved): number => (from(entry) + to(entry)) / 2
      const half = (entry: Saved): number => measure(entry.label) / 2 + PAD

      group
        .select<SVGPathElement>(`path.${styles.savedRule}`)
        .attr(
          'd',
          (entry) =>
            `M${from(entry) + HEAD} ${y} H${Math.max(from(entry) + HEAD, middle(entry) - half(entry))}` +
            ` M${Math.min(to(entry), middle(entry) + half(entry))} ${y} H${to(entry)}`,
        )

      group
        .select<SVGPathElement>(`path.${styles.savedHead}`)
        .attr('d', (entry) => `M${from(entry)} ${y} l${HEAD} ${-HEAD / 2} v${HEAD} z`)

      group
        .select<SVGLineElement>('line')
        .attr('x1', to)
        .attr('x2', to)
        .attr('y1', y - HEAD / 2)
        .attr('y2', y + HEAD / 2)

      group
        .select<SVGTextElement>('text')
        .attr('x', middle)
        .attr('y', y)
        .text((entry) => entry.label)
    })

  row
    .select<SVGTextElement>('text')
    .attr('class', (entry) => `${entry.place} ${laneClass(entry.lane)}`)
    .attr('x', (entry) => entry.x)
    .attr('y', (entry) => entry.y + ROW / 2)
    .attr('text-anchor', (entry) => entry.anchor)
    .attr('dominant-baseline', 'central')
    .text((entry) => entry.caption)
}
