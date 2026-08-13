import { type ReactElement, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { DEMO_LANES, type DemoVariant } from '../../lib/demo'
import type { StageStrings } from '../../lib/i18n'
import type { TimelineGroup } from '../BenchmarkStage/useBenchmark'
import { type ChartLane, type LaneState, drawLanes } from './lanes'
import * as chart from '../../styles/chart.css'
import * as styles from './Waterfall.css'

interface Props {
  axis: number
  /** Where the demo page for a variant lives, built by the page that owns the run. */
  frameSrc: (variant: DemoVariant) => string
  groups: TimelineGroup[]
  /** Bumped per run, so each run gets a fresh document rather than a reused one. */
  run: number
  strings: StageStrings
}

function toLanes({ now, settled, settledAt, trace }: TimelineGroup, strings: StageStrings): ChartLane[] {
  /**
   * While the page is still going, an empty lane has simply not happened yet. Once it has
   * reported, an empty lane is one this page never had, which is worth saying out loud:
   * the page with no inline script is the reason that row exists.
   */
  const missing = (): LaneState => (settled ? 'absent' : 'pending')

  return DEMO_LANES.map((lane) => {
    const shared = { label: strings.lane[lane], lane }

    // Both of the lanes that run from zero are drawn against the clock from the moment the
    // run starts, rather than appearing whole once the page gets round to reporting. What
    // the page measures replaces the running figure as soon as its first trace lands.
    if (lane === 'paint') {
      // Still being spent while the page loads, so it grows rather than sitting on an early
      // candidate. It stops at the moment the page reported, because nothing can still be
      // pending after that; the largest paint lands a beat later and only moves it forward.
      const reached = Math.max(trace?.paint ?? 0, settledAt ?? now)

      return {
        ...shared,
        end: reached,
        start: 0,
        state: reached > 0 ? 'present' : missing(),
        value: `${reached.toFixed(0)}ms`,
      }
    }

    if (lane === 'document') {
      // On its way from the start of the run, whether or not the page can say so yet.
      const segment = trace?.document ?? null
      const start = segment?.start ?? 0
      const end = segment === null ? now : (segment.end ?? now)

      return {
        ...shared,
        end,
        start,
        state: end > start ? 'present' : missing(),
        value: `${Math.max(0, end - start).toFixed(0)}ms`,
      }
    }

    const segment = trace?.[lane] ?? null
    // A lane that has not closed yet runs up to this page's own clock, right now.
    const end = segment === null ? 0 : (segment.end ?? now)

    return {
      ...shared,
      end,
      start: segment?.start ?? 0,
      state: segment === null ? missing() : 'present',
      value: segment === null ? '' : `${Math.max(0, end - segment.start).toFixed(0)}ms`,
    }
  })
}

/**
 * One case's lanes. Owns nothing but the root element: everything inside the `<svg>` is
 * drawn and updated by d3, so React never reconciles against a tree it did not build.
 *
 * It measures itself rather than being told how wide it is. Every case sits in the same grid
 * column and so arrives at the same figure, and nothing else on the page has to hold it.
 */
function Lanes({ axis, lanes }: { axis: number; lanes: ChartLane[] }): ReactElement {
  const host = useRef<SVGSVGElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const element = host.current

    if (element === null) return

    const settle = (measured: number): void =>
      setWidth((previous) => (Math.abs(previous - measured) < 0.5 ? previous : measured))
    const observer = new ResizeObserver((entries) => settle(entries[0]?.contentRect.width ?? 0))

    // Measured once here as well as through the observer. The observer only reports on a
    // rendering update, which a page the reader cannot see does not get, and an element that
    // already has a width should not wait to be told about it.
    settle(element.getBoundingClientRect().width)
    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    if (host.current === null || width === 0) return

    drawLanes(host.current, axis, lanes, width)
  }, [axis, lanes, width])

  return <svg className={chart.lanes} ref={host} />
}

/**
 * The demo page, small. It carries no numbers of its own, because the lanes beside it say
 * everything: all it has to show is which of the three states this page is in.
 */
function Preview({ label, src, state, strings }: PreviewProps): ReactElement {
  const words = { done: strings.previewReady, idle: strings.previewIdle, loading: strings.previewLoading }

  return (
    <div className={styles.preview}>
      <div className={styles.frame[state]}>
        {/* Nothing to show until a run has been asked for. Out of the tab order and
            unreachable to a reader once there is: it is a picture of a page, not a page to
            use. The lanes carry every number it used to print. */}
        {src !== null && <iframe aria-hidden='true' src={src} tabIndex={-1} title={label} />}
        <span className={styles.dot[state]}>
          <span className={styles.said}>{words[state]}</span>
        </span>
      </div>

      {/* Over the foot of the picture on a wide screen, and beside it on a narrow one, where
          the picture is too small to carry writing. */}
      <h3 className={styles.caption}>{label}</h3>
    </div>
  )
}

interface PreviewProps {
  label: string
  /** Null before a run has been asked for, so no demo page is loaded until then. */
  src: null | string
  state: 'done' | 'idle' | 'loading'
  strings: StageStrings
}

export default function Waterfall({ axis, frameSrc, groups, run, strings }: Props): ReactElement {
  return (
    <div className={styles.root}>
      {groups.map((group) => (
        <section className={styles.row} key={group.variant}>
          <Preview
            key={run}
            label={strings.panel[group.variant]}
            src={run === 0 ? null : frameSrc(group.variant)}
            state={run === 0 ? 'idle' : group.settled ? 'done' : 'loading'}
            strings={strings}
          />
          <Lanes axis={axis} lanes={toLanes(group, strings)} />
        </section>
      ))}
    </div>
  )
}
