import { DEMO_LANES, axisBound } from '../../lib/demo'
import type { ShowcaseState, ShowcaseStep } from '../../lib/i18n'
import type { ChartLane } from '../Waterfall/lanes'

/**
 * One measured run, kept as fixed numbers so the landing page can show the difference
 * without loading anything or asking the reader to wait.
 *
 * These are not made up and not averaged. They come from two Chrome performance traces of
 * the same commerce webview screen, recorded before and after the plugin was applied to it,
 * cut down to whole tens. A figure like 1341ms would claim a precision that one phone on one
 * network cannot carry; the benchmark page measures the same shape on the reader's own
 * machine instead.
 */

/** Milliseconds from the start of the page load. `start` and `end` on the same clock. */
interface Span {
  end: number
  start: number
}

interface Trace {
  api: Span
  /** Absent before the plugin: there is no inline script to run. */
  critical: null | Span
  document: Span
  execute: Span
  image: Span
  /** A moment rather than a stretch, drawn as the whole run up to it. */
  paint: number
  script: Span
}

/**
 * The lanes the plugin sets in motion, in the order one leads to the next: the inline script
 * asks for the data, the answer arrives sooner, and the image named in it follows. They are
 * numbered in that order on the chart and written out under it.
 */
export const SHOWCASE_STEPS: readonly ShowcaseStep[] = ['critical', 'api', 'image']

function stepOf(lane: (typeof DEMO_LANES)[number]): number | undefined {
  const at = SHOWCASE_STEPS.indexOf(lane as ShowcaseStep)

  return at === -1 ? undefined : at + 1
}

/**
 * The lanes the plugin does not touch. Both runs measured these within a few tens of
 * milliseconds of each other, and letting that noise animate would only draw the eye away
 * from the one lane that does move. They are held at the figures from the run without the
 * plugin, which is the state the reader sees first.
 */
const HELD = {
  document: { end: 60, start: 30 },
  execute: { end: 580, start: 340 },
  script: { end: 340, start: 40 },
} as const

const RUN: Record<ShowcaseState, Trace> = {
  after: {
    ...HELD,
    // The request leaves before the bundle has finished arriving, so the answer is already in
    // hand by the time the framework starts up, and the image it names follows straight after.
    api: { end: 570, start: 70 },
    critical: { end: 60, start: 60 },
    // The request is long done by now. What the image waits for here is the framework, which
    // has to render the screen before there is an `<img>` to fetch anything for.
    image: { end: 760, start: 640 },
    paint: 840,
  },
  before: {
    ...HELD,
    api: { end: 1090, start: 590 },
    critical: null,
    image: { end: 1270, start: 1150 },
    paint: 1340,
  },
}

/**
 * One axis for both states, so the bars can be compared by eye and the movement between
 * them means something. Taken from the slower of the two.
 */
export const SHOWCASE_AXIS = axisBound(Math.max(RUN.before.paint, RUN.after.paint))

/** Whether the plugin moves this lane at all, which is what makes it worth comparing. */
function moves(lane: (typeof DEMO_LANES)[number]): boolean {
  if (lane === 'paint') return RUN.before.paint !== RUN.after.paint

  const before = RUN.before[lane]
  const after = RUN.after[lane]

  if (before === null || after === null) return true

  return before.start !== after.start || before.end !== after.end
}

/**
 * The run without the plugin, for the lanes it moves, to sit behind the chart as something
 * to compare against. The lanes it leaves alone are left out: drawing an identical bar twice
 * would only make it brighter.
 */
export function showcaseReference(labels: Record<string, string>): ChartLane[] {
  return blendShowcase(0, labels).map((lane) =>
    moves(lane.lane as (typeof DEMO_LANES)[number]) ? lane : { ...lane, state: 'absent' as const },
  )
}

/**
 * How much earlier the screen finishes at this point in the slide, against where it finished
 * without the plugin. The two ends are what the chart measures across.
 */
export function showcaseGain(at: number): { from: number; percent: number; to: number } {
  const from = mix(RUN.before.paint, RUN.after.paint, at)

  return { from, percent: Math.round(((RUN.before.paint - from) / RUN.before.paint) * 100), to: RUN.before.paint }
}

function mix(from: number, to: number, at: number): number {
  return from + (to - from) * at
}

/**
 * The chart partway between the two runs. `at` is 0 at the run without the plugin and 1 at
 * the run with it, so a caller can hand this whatever an animation has reached.
 */
export function blendShowcase(at: number, labels: Record<string, string>): ChartLane[] {
  return DEMO_LANES.map((lane) => {
    const shared = { label: labels[lane] ?? lane, lane, step: stepOf(lane) }

    if (lane === 'paint') {
      const end = mix(RUN.before.paint, RUN.after.paint, at)

      return { ...shared, end, start: 0, state: 'present' as const, value: `${end.toFixed(0)}ms` }
    }

    const before = RUN.before[lane]
    const after = RUN.after[lane]

    // Nothing to run before the plugin, so the lane says so until the change is under way.
    if (before === null || after === null) {
      const only = before ?? after
      const present = before === null ? at > 0.5 : at < 0.5

      return {
        ...shared,
        end: only?.end ?? 0,
        start: only?.start ?? 0,
        state: present ? ('present' as const) : ('absent' as const),
        value: only === null ? '' : `${(only.end - only.start).toFixed(0)}ms`,
      }
    }

    const start = mix(before.start, after.start, at)
    const end = mix(before.end, after.end, at)

    return { ...shared, end, start, state: 'present' as const, value: `${(end - start).toFixed(0)}ms` }
  })
}
