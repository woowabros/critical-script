import { type ReactElement, useEffect, useState } from 'react'

import {
  API_PATH,
  BASE,
  BUNDLE_PATH,
  DEMO_MESSAGE_SOURCE,
  IMAGE_PATTERN,
  type DemoMetrics,
  type DemoResult,
  type DemoStage,
  type DemoTrace,
  type DemoTraceMessage,
  type DemoVariant,
  type Segment,
  type Throttle,
  readBootWork,
  readThrottle,
  throttled,
} from '../../lib/demo'
import { DEMO_STRINGS, type Locale, isLocale } from '../../lib/i18n'
import * as styles from './DemoScreen.css'

interface Props {
  variant: DemoVariant
}

interface Settings {
  /** Forwarded to the bundle, which decides for itself how long it takes to get ready. */
  bootWork: number
  locale: Locale
  run: string
  throttle: Throttle
}

/** The data request, however it was started, plus the moment it left the browser. */
interface Inflight {
  pending: Promise<DemoHome>
  startedAt: number
}

function readSettings(): Settings {
  const params = new URLSearchParams(window.location.search)
  const lang = params.get('lang') ?? undefined

  return {
    bootWork: readBootWork(params),
    locale: isLocale(lang) ? lang : 'en',
    run: params.get('run') ?? '0',
    throttle: readThrottle(params),
  }
}

/** Real timings, read from the Resource Timing API rather than from our own marks. */
function readTiming(): null | Pick<DemoMetrics, 'dataReady' | 'requestStart'> {
  const entry = performance
    .getEntriesByType('resource')
    .find((candidate): candidate is PerformanceResourceTiming => candidate.name.includes(API_PATH))

  return entry === undefined ? null : { dataReady: entry.responseEnd, requestStart: entry.startTime }
}

/**
 * How long after the largest thing on the screen has arrived the page keeps listening for a
 * paint. The boundary is that arrival rather than `load`, because the image's address comes
 * inside the data, so the document has long since loaded by the time the page even asks for
 * it. A short grace covers the paint that follows the bytes.
 */
const PAINT_GRACE_MS = 500

/** The awaited module, on its own, so execution can be told apart from waiting for it. */
function readBundle(): null | Segment {
  const entry = performance
    .getEntriesByType('resource')
    .find((candidate): candidate is PerformanceResourceTiming => candidate.name.includes(BUNDLE_PATH))

  return entry === undefined ? null : { end: entry.responseEnd, start: entry.startTime }
}

function markAt(name: string): null | number {
  return performance.getEntriesByName(name)[0]?.startTime ?? null
}

/** index.html itself, from the navigation entry the browser fills in as it arrives. */
function readDocument(): null | Segment {
  const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined

  return entry === undefined ? null : { end: entry.responseEnd, start: entry.requestStart }
}

/** The inlined critical script, bracketed by the two marks it leaves behind. */
function readCritical(): null | Segment {
  const start = markAt('demo:critical-start')

  return start === null ? null : { end: markAt('demo:critical-end') ?? start, start }
}

/** The hero image, matched by name so a preload would count the same as an `img` request. */
function readImage(): null | Segment {
  const entries = performance
    .getEntriesByType('resource')
    .filter((entry): entry is PerformanceResourceTiming => IMAGE_PATTERN.test(entry.name))

  if (entries.length === 0) return null

  return {
    end: Math.max(...entries.map((entry) => entry.responseEnd)),
    start: Math.min(...entries.map((entry) => entry.startTime)),
  }
}

/**
 * Every script the document pulled, merged into one stretch. A real page loads several,
 * and what matters here is when the last of them landed.
 */
function readScripts(): null | Segment {
  const entries = performance
    .getEntriesByType('resource')
    .filter(
      (entry): entry is PerformanceResourceTiming => (entry as PerformanceResourceTiming).initiatorType === 'script',
    )

  if (entries.length === 0) return null

  return {
    end: Math.max(...entries.map((entry) => entry.responseEnd)),
    start: Math.min(...entries.map((entry) => entry.startTime)),
  }
}

/**
 * Pulls in the rest of the bundle the way a page normally would, with a script element. The
 * `load` event here says the file arrived and its top level ran, which is not the same as
 * the bundle being ready to use: it publishes a promise of its own for that.
 *
 * A dynamic import would be rewritten by the dev server's module pipeline, and a module
 * script would not help either, because its `load` event fires once the graph has been
 * fetched rather than once it has been evaluated.
 */
function loadBundle(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const element = document.createElement('script')

    element.addEventListener('load', () => resolve())
    element.addEventListener('error', () => reject(new Error(`the demo bundle at ${url} did not load`)))
    element.src = url
    document.head.append(element)
  })
}

/** What the page has learnt so far, which the trace is rebuilt from on every report. */
interface Learnt {
  api: null | Segment
  /**
   * Opened when the screen renders the image, because Resource Timing only files an entry
   * once a resource has finished. Without it the lane would appear whole and late.
   */
  image: null | Segment
  /** True while the awaited module is still on the wire. */
  loading: boolean
  paint: null | number
  /** When the bundle had arrived and the page started running it. */
  ranFrom: null | number
  /** When it had finished running, so the app could act. Null while it still is. */
  ranUntil: null | number
}

function buildTrace({ api, image, loading, paint, ranFrom, ranUntil }: Learnt): DemoTrace {
  const scripts = readScripts()
  const bundle = readBundle()

  return {
    api,
    critical: readCritical(),
    document: readDocument(),
    // Waiting for the last of the bundle belongs to the network lane above, so this one
    // only covers running it, which is where the page finally becomes able to act. Opened
    // as soon as that starts, so it grows instead of appearing whole once it is over.
    execute: ranFrom === null ? null : { end: ranUntil, start: bundle?.end ?? scripts?.end ?? ranFrom },
    // What the browser timed, or the stretch still running if it has not timed it yet.
    image: readImage() ?? image,
    paint,
    // Held open while the awaited module is in flight, so the lane grows with the wait.
    script: scripts === null ? null : { end: loading ? null : scripts.end, start: scripts.start },
  }
}

export default function DemoScreen({ variant }: Props): ReactElement {
  const [home, setHome] = useState<DemoHome | null>(null)
  const [stage, setStage] = useState<DemoStage>('idle')
  const [metrics, setMetrics] = useState<DemoMetrics | null>(null)
  const [problem, setProblem] = useState<null | string>(null)
  const [locale, setLocale] = useState<Locale>('en')
  const [framed, setFramed] = useState(false)

  useEffect(() => {
    let abandoned = false
    let settling = 0
    const { bootWork, locale: pageLocale, run: runId, throttle } = readSettings()
    const framedNow = window.parent !== window

    setLocale(pageLocale)
    // Embedded in a benchmark panel, the surrounding page already prints these numbers.
    setFramed(framedNow)

    const learnt: Learnt = {
      api: null,
      image: null,
      loading: true,
      paint: null,
      ranFrom: null,
      ranUntil: null,
    }

    /** Hands the benchmark page everything known so far, so its lanes can keep up. */
    const report = (): void => {
      if (!framedNow) return

      const message: DemoTraceMessage = {
        kind: 'trace',
        run: runId,
        sentAt: performance.now(),
        source: DEMO_MESSAGE_SOURCE,
        trace: buildTrace(learnt),
        variant,
      }

      window.parent.postMessage(message, window.location.origin)
    }

    /** Later candidates are larger ones, so the marker only ever moves forward. */
    const paintedAt = (at: number): void => {
      if (abandoned || at <= (learnt.paint ?? 0)) return

      learnt.paint = at
      report()
    }

    // The largest contentful paint keeps being revised while the page settles, and the
    // hero image usually lands after the text does. Every candidate moves the marker.
    const painted = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) paintedAt(entry.startTime)
    })

    // The same moment from a second source. Chrome has been seen to skip the largest paint
    // for one of two documents loading side by side, and this one names the element it is
    // reporting on, so it always arrives.
    const heroPainted = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const timing = entry as PerformanceEntry & { loadTime?: number; renderTime?: number }

        paintedAt(timing.renderTime ?? timing.loadTime ?? timing.startTime)
      }
    })

    try {
      painted.observe({ buffered: true, type: 'largest-contentful-paint' })
    } catch {
      // Not every browser reports it, and the element timing below covers the same moment.
    }

    try {
      heroPainted.observe({ buffered: true, type: 'element' })
    } catch {
      // Same again: one of the two is enough to place the marker.
    }

    /**
     * The paint marker describes this page's load. Anything after the largest element has
     * landed is a repaint from something else, such as the reader resizing the window, and
     * does not belong on the timeline. The browser's own largest paint stops at the first
     * interaction for the same reason.
     */
    const stopWatching = (): void => {
      if (settling !== 0) return

      settling = window.setTimeout(() => {
        heroPainted.disconnect()
        painted.disconnect()
      }, PAINT_GRACE_MS)
    }

    // The image lands well after the screen is up, so its lane needs its own nudge. Its
    // arrival is also what closes the window on the paint marker.
    const fetched = new PerformanceObserver((list) => {
      if (!list.getEntries().some((entry) => IMAGE_PATTERN.test(entry.name))) return

      report()
      stopWatching()
    })

    fetched.observe({ buffered: true, type: 'resource' })

    /**
     * Opens the request lane and closes it the moment the response lands. It has to be
     * driven by the request itself rather than by the run's own sequence, because on the
     * fast side the page is still waiting for its bundle when the response arrives, and a
     * lane left open until then would be drawn far longer than the request really took.
     */
    const track = (pending: Promise<DemoHome>, startedAt: number): void => {
      learnt.api = { end: null, start: startedAt }
      report()

      void pending.then(
        () => {
          if (abandoned) return

          const timing = readTiming()

          learnt.api = { end: timing?.dataReady ?? performance.now(), start: timing?.requestStart ?? startedAt }
          report()
        },
        () => {
          // The run's own error handling reports this to the reader.
        },
      )
    }

    const run = async (): Promise<void> => {
      setStage('booting')
      report()

      let inflight: Inflight | null = null

      if (variant === 'with') {
        if (window.__demoHome === undefined) {
          setProblem('window.__demoHome is undefined, so the inline critical script did not run.')

          return
        }

        // The inline script already sent this request while the HTML was being parsed, so
        // the lane can start now instead of after the bundle has landed. That overlap is
        // the whole point of the plugin, and it only shows if we report it as it runs.
        inflight = { pending: window.__demoHome, startedAt: markAt('demo:critical-start') ?? 0 }
        track(inflight.pending, inflight.startedAt)
      }

      // The rest of the application bundle, which the page cannot act without. The
      // throttling worker holds it back by the amount the controls ask for, so this is a
      // real download and a real evaluation that the browser times like any other.
      await loadBundle(`${throttled(`${BASE}${BUNDLE_PATH}`, throttle)}&cpu=${bootWork}`)

      if (abandoned) return

      learnt.loading = false
      learnt.ranFrom = performance.now()
      report()

      // Starting the framework up. The bundle decides how long it needs and says when it is
      // ready; both variants wait on that, and only after their own bundle has arrived,
      // which is why the fast one has already sent its request by now.
      await window.__demoBundle

      if (abandoned) return

      learnt.ranUntil = performance.now()

      if (inflight === null) {
        const startedAt = performance.now()

        inflight = {
          pending: fetch(throttled(`${BASE}${API_PATH}`, throttle, throttle.think), { cache: 'no-store' }).then(
            (response) => response.json() as Promise<DemoHome>,
          ),
          startedAt,
        }
        track(inflight.pending, startedAt)
      }

      setStage('requesting')
      report()

      const data = await inflight.pending

      if (abandoned) return

      const timing = readTiming()
      const collected: DemoMetrics = {
        contentAt: performance.now(),
        dataReady: timing?.dataReady ?? null,
        requestStart: timing?.requestStart ?? null,
        variant,
      }

      // The image address arrives inside the response, so the throttle is put on here
      // rather than in the file the worker never sees. Rendering the screen is what asks
      // for it, so that is where its lane opens.
      learnt.image = { end: null, start: performance.now() }
      setHome({ ...data, heroImageUrl: throttled(data.heroImageUrl, throttle) })
      setStage('ready')
      setMetrics(collected)

      report()

      if (framedNow) {
        const message: DemoResult = { ...collected, kind: 'result', run: runId, source: DEMO_MESSAGE_SOURCE }

        window.parent.postMessage(message, window.location.origin)
      }
    }

    void run().catch(() => {
      if (!abandoned) setProblem('The demo API did not respond.')
    })

    return () => {
      abandoned = true
      window.clearTimeout(settling)
      fetched.disconnect()
      heroPainted.disconnect()
      painted.disconnect()
    }
  }, [variant])

  const strings = DEMO_STRINGS[locale]

  return (
    <main className={styles.root}>
      {/* The badge only earns its place when the demo stands alone. Inside a panel the
          heading above the frame already names the variant. */}
      <header className={styles.head}>
        {!framed && <span className={styles.badge[variant]}>{strings.badge[variant]}</span>}
        <span className={styles.stage[stage]}>{problem === null ? strings.stage[stage] : strings.failed}</span>
      </header>

      {problem !== null && <p className={styles.problem}>{problem}</p>}

      {home === null && problem === null && (
        <div aria-hidden='true' className={styles.skeleton}>
          <span className={styles.skeletonTitle} />
          <span className={styles.skeletonMedia} />
          <span className={styles.skeletonLine} />
          <span className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
        </div>
      )}

      {home !== null && (
        <article className={styles.card}>
          <h1>{home.title}</h1>
          {/* Intrinsic size, so the browser reserves the box before the bytes land. The
              timing attribute has the browser report the moment this actually painted. */}
          <img alt='' elementtiming='demo-hero' height={887} src={home.heroImageUrl} width={1774} />
          <ul>
            {home.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      )}

      {metrics !== null && !framed && (
        <dl className={styles.metrics}>
          <div>
            <dt>{strings.requestStart}</dt>
            <dd>{metrics.requestStart === null ? '–' : `${metrics.requestStart.toFixed(0)}ms`}</dd>
          </div>
          <div>
            <dt>{strings.contentShown}</dt>
            <dd>{metrics.contentAt.toFixed(0)}ms</dd>
          </div>
        </dl>
      )}
    </main>
  )
}
