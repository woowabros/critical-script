import { type ReactElement, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { SHOWCASE_AXIS, SHOWCASE_STEPS, blendShowcase, showcaseGain, showcaseReference } from './recordedRun'
import { SHOWCASE_STRINGS, STAGE_STRINGS, type Locale, type ShowcaseStep } from '../../lib/i18n'
import { drawLanes } from '../Waterfall/lanes'
import * as chart from '../../styles/chart.css'
import * as styles from './Showcase.css'

interface Props {
  locale: Locale
}

/**
 * How long the bars take to move, and it depends on who moved them. A reader who works the
 * switch is owed an answer at once. A chart flipping itself is showing rather than answering,
 * so it takes its time and the eye can follow a bar across.
 */
const HAND_SLIDE_MS = 300

const AUTO_SLIDE_MS = 800

/** Long enough for the reader to take the chart in before it moves under them. */
const AUTO_AFTER_MS = 800

/** Faint enough to stay in the background, strong enough to measure the gap against. */
const REFERENCE_OPACITY = 0.3

/**
 * What the plugin leaves in the document, cut down to the two lines that explain the order:
 * the inlined module runs where it stands, and the bundle is still a file to be fetched.
 */
const INLINE_SAMPLE = (
  <pre className={styles.code}>
    <code>
      {'<head>\n  '}
      <b>{'<script>window.__home = fetch("/api/home.json")</script>'}</b>
      {'\n  <script type="module" src="/app.js"></script>\n</head>'}
    </code>
  </pre>
)

/** Slow at both ends, so the eye can catch where each bar starts and where it settles. */
function ease(at: number): number {
  return at < 0.5 ? 4 * at * at * at : 1 - (-2 * at + 2) ** 3 / 2
}

/**
 * The difference the plugin makes, on the landing page, from one recorded run rather than a
 * live one. Nothing is fetched and nothing is timed here: pressing a state slides the same
 * chart between the two runs, which is what makes the change legible. The benchmark page is
 * where the reader can measure it on their own machine instead.
 */
export default function Showcase({ locale }: Props): ReactElement {
  const strings = SHOWCASE_STRINGS[locale]
  const lanes = STAGE_STRINGS[locale]

  const [applied, setApplied] = useState(false)
  /** Whether the chart still owes the reader the one move it makes on its own. */
  const [auto, setAuto] = useState(true)
  /** How long the slide that is about to start should take, set by whoever asked for it. */
  const pace = useRef(AUTO_SLIDE_MS)
  const idle = (step: ShowcaseStep): boolean => !applied && step === 'critical'
  const canvas = useRef<SVGSVGElement>(null)
  const [width, setWidth] = useState(0)
  /** Where the slide has reached: 0 at the run without the plugin, 1 at the run with it. */
  const progress = useRef(0)
  const frame = useRef(0)

  /**
   * The chart applies the plugin once by itself, a moment after the page settles, so a reader
   * who never touches anything still sees what the switch is for. Once only: a chart flipping
   * back and forth on its own is something to escape rather than to read.
   *
   * Motion nobody asked for, so a reader who asked for less of it gets the chart standing still
   * and works the switch themselves. Touching it first cancels the move.
   */
  useEffect(() => {
    if (!auto || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const timer = window.setTimeout(() => {
      pace.current = AUTO_SLIDE_MS
      setApplied(true)
    }, AUTO_AFTER_MS)

    return () => window.clearTimeout(timer)
  }, [auto])

  useEffect(() => {
    const element = canvas.current

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

  // The chart is redrawn from an interpolated copy of the two runs, so d3 keeps owning
  // everything inside the `<svg>` and there is no separate animation for it to fight.
  useLayoutEffect(() => {
    if (canvas.current === null || width === 0) return

    const host = canvas.current
    const reference = showcaseReference(lanes.lane)
    const paint = (): void => {
      const gain = showcaseGain(progress.current)

      drawLanes(host, SHOWCASE_AXIS, blendShowcase(progress.current, lanes.lane), width, {
        lanes: reference,
        // Nothing to compare against while the chart still is that state.
        opacity: REFERENCE_OPACITY * progress.current,
        saved: {
          from: gain.from,
          label: strings.gain.replace('{value}', String(gain.percent)),
          lane: 'paint',
          opacity: progress.current,
          to: gain.to,
        },
      })
    }
    const target = applied ? 1 : 0

    if (progress.current === target) {
      paint()

      return
    }

    const from = progress.current
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (still) {
      progress.current = target
      paint()

      return
    }

    const startedAt = performance.now()

    const step = (): void => {
      const at = Math.min(1, (performance.now() - startedAt) / pace.current)

      progress.current = from + (target - from) * ease(at)
      paint()

      if (at < 1) frame.current = window.requestAnimationFrame(step)
    }

    frame.current = window.requestAnimationFrame(step)

    return () => window.cancelAnimationFrame(frame.current)
  }, [applied, lanes, width])

  return (
    // `not-content` keeps Starlight's markdown spacing out of the chart.
    <section className={`${styles.root} not-content`}>
      <div className={styles.chart}>
        <svg aria-label={strings.title} className={chart.lanes} ref={canvas} role='img' />
      </div>

      {/* A switch rather than a box to tick: it is the one control on the page, and it
          reads as turning the plugin on. The checkbox is still the control underneath, so
          the keyboard and screen readers get an ordinary checkbox to work with. */}
      <label className={styles.toggle}>
        <input
          checked={applied}
          className={styles.control}
          onChange={(event) => {
            pace.current = HAND_SLIDE_MS
            setAuto(false)
            setApplied(event.target.checked)
          }}
          type='checkbox'
        />
        <span aria-hidden='true' className={styles.track} />
        {strings.toggle}
      </label>

      <header className={styles.head}>
        <p>{strings.description}</p>
      </header>

      <ol className={styles.steps}>
        {SHOWCASE_STEPS.map((step, index) => (
          // Faint where the step does not happen in the state on screen. Without the plugin
          // there is no inline script, so the first step has no mark on the chart either.
          <li className={idle(step) ? `${styles.step} ${styles.stepIdle}` : styles.step} key={step}>
            {/* The list already carries its order for a screen reader, so the mark is drawn
                for the eye alone: it is there to be matched against the one on the bar. */}
            <span aria-hidden='true' className={`${styles.stepMark} ${chart.lane[step]}`}>
              {index + 1}
            </span>
            <b className={styles.stepTitle}>{lanes.lane[step]}</b>
            <div className={styles.stepBody}>
              <p>{strings.steps[step][applied ? 'after' : 'before']}</p>
              {step === 'critical' ? INLINE_SAMPLE : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
