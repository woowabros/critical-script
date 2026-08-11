import { useCallback, useEffect, useRef, useState } from 'react'

import {
  DEMO_MESSAGE_SOURCE,
  DEMO_VARIANTS,
  type DemoMessage,
  type DemoMetrics,
  type DemoTrace,
  type DemoVariant,
  NETWORKS,
  type Network,
  axisBound,
  ensureThrottle,
  releaseThrottle,
  traceReach,
} from '../../lib/demo'

type Elapsed = Partial<Record<DemoVariant, number>>

type Results = Partial<Record<DemoVariant, DemoMetrics>>

type Traces = Partial<Record<DemoVariant, DemoTrace>>

interface Options {
  /** What each page has to compute before it can act, in milliseconds. */
  bootWork: number
  network: Network
  /** What the server spends working on the data request, in milliseconds. */
  serverWork: number
}

/** One page's lanes, plus the clocks a lane that is still running should be drawn to. */
export interface TimelineGroup {
  /** This page's own clock, right now, for stretches that have not closed yet. */
  now: number
  /** True once this page has reported its final numbers. */
  settled: boolean
  /**
   * Where this page's clock stood when it reported, or null before then. A lane that ends at
   * a moment stops here, while one that is still downloading keeps running with `now`.
   */
  settledAt: null | number
  trace: DemoTrace | null
  variant: DemoVariant
}

export interface Benchmark {
  /** End of the timeline axis in milliseconds. Steps upward, never shrinks within a run. */
  axis: number
  /** Milliseconds the fast variant saved, once both sides have reported. */
  gap: null | number
  /** Wall clock since the current run started, for a live read-out. */
  live: number
  reportedAt: Elapsed
  results: Results
  run: number
  running: boolean
  stalled: boolean
  start: () => void
  /**
   * Whether the throttling worker is in charge. False means the browser would not have it
   * and both pages ran at full speed, which makes the numbers far smaller than the
   * controls asked for. Null until the first run has settled the question.
   */
  throttled: boolean | null
  /** One group per variant, updated every frame while a run is in flight. */
  timeline: TimelineGroup[]
}

const STALL_MS = 15_000

/**
 * A demo document has to arrive and hydrate before any of the throttled requests go out,
 * and that cost lands on its clock too. The first run measures it; until then this stands
 * in, so the axis usually holds instead of rescaling mid-run.
 */
const ASSUMED_OVERHEAD_MS = 200

/**
 * Drives one benchmark run: reloads both demo documents at the same moment and collects
 * what they post back. Shared by the compact preview on the landing page and the detailed
 * page, so both measure the same way.
 */
export function useBenchmark({ bootWork, network, serverWork }: Options): Benchmark {
  const [run, setRun] = useState(0)
  const [results, setResults] = useState<Results>({})
  const [reportedAt, setReportedAt] = useState<Elapsed>({})
  const [traces, setTraces] = useState<Traces>({})
  const [live, setLive] = useState(0)
  const [now, setNow] = useState<Elapsed>({})
  const [settledAt, setSettledAt] = useState<Elapsed>({})
  const [axis, setAxis] = useState(0)
  const [stalled, setStalled] = useState(false)
  const [throttled, setThrottled] = useState<boolean | null>(null)
  /** True from the press until the worker is in charge and the pages can be loaded. */
  const [arming, setArming] = useState(false)

  const startedAt = useRef<null | number>(null)
  const frame = useRef(0)
  const runRef = useRef(0)
  /** Parent clock reading that lines up with zero on each demo document's own clock. */
  const origins = useRef<Elapsed>({})
  /** Pages whose own clock has replaced the provisional one the run started them with. */
  const aligned = useRef(new Set<DemoVariant>())
  /**
   * What a finished run cost on top of what its conditions alone predict, kept per set of
   * conditions. A figure measured on a slow connection says nothing about a fast one.
   */
  const overhead = useRef<Partial<Record<Network, number>>>({})
  /** The conditions the run on screen was started with, which its numbers belong to. */
  const ranWith = useRef<Network>(network)
  /** What those conditions predicted, so the leftover can be told from the prediction. */
  const expected = useRef(0)
  /** Pages that have reported. Their clocks stop, so no lane of theirs can grow further. */
  const reported = useRef(new Set<DemoVariant>())

  /**
   * Roughly what these settings alone predict: the connection's own figure, plus the two
   * costs it cannot account for. Only a starting width for the axis, which measures itself
   * from the first run onwards.
   */
  const expect = NETWORKS[network].expect + serverWork + bootWork

  const complete = Object.keys(results).length >= DEMO_VARIANTS.length
  const running = arming || (run > 0 && !complete && !stalled)

  /**
   * Whether any stretch is still on the wire. A page reports as soon as its screen is up,
   * but its image can still be arriving, so the clock has to keep running past that report
   * or the lane would stop growing the moment it opened.
   */
  const stillOpen = DEMO_VARIANTS.some((variant) => {
    const trace = traces[variant]

    if (trace === undefined) return false

    return [trace.api, trace.document, trace.execute, trace.image, trace.script].some(
      (segment) => segment != null && segment.end === null,
    )
  })

  /** Kept apart from `running`, which is about whether the run can be started again. */
  const animating = arming || (run > 0 && !stalled && (!complete || stillOpen))

  const begin = useCallback((): void => {
    setResults({})
    setReportedAt({})
    setTraces({})
    setLive(0)
    setNow({})
    setSettledAt({})
    // Seeded from what this run is expected to cost, so the axis usually holds for the
    // whole run and the bars grow against marks that stay put.
    setAxis(axisBound(expect + (overhead.current[network] ?? ASSUMED_OVERHEAD_MS)))
    setStalled(false)
    ranWith.current = network
    expected.current = expect
    reported.current = new Set()
    aligned.current = new Set()
    startedAt.current = performance.now()
    // Until a page reports, its clock is taken to have started when the run did. That is
    // true to within the moment it took to put the frame on the page, and it lets the lanes
    // that run from zero be drawn while the document is still on its way.
    origins.current = Object.fromEntries(DEMO_VARIANTS.map((variant) => [variant, startedAt.current]))
    runRef.current += 1
    setRun(runRef.current)
  }, [expect, network])

  // The worker has to be in charge before the demo pages load, or their requests would go
  // out at full speed and the controls would mean nothing.
  const start = useCallback((): void => {
    setArming(true)

    void ensureThrottle().then((ready) => {
      setThrottled(ready)
      setArming(false)
      begin()
    })
  }, [begin])

  /**
   * Registered for as long as the benchmark is on screen, and no longer.
   *
   * Leaving the component covers moving to another page of the site. Closing the tab or typing
   * a new address ends the document without unmounting anything, which is what `pagehide` is
   * for: it fires where `unload` does not, and unlike `beforeunload` it does not cost the page
   * its place in the back/forward cache. A page being frozen into that cache is left alone,
   * because it is coming back.
   *
   * Neither path is a guarantee. A crash takes the document with it, and `unregister` may not
   * settle before the document goes. That is acceptable here: the worker stores nothing, its
   * scope covers only the demo pages, and a run registers it again before it needs it.
   */
  useEffect(() => {
    const leaving = (event: PageTransitionEvent): void => {
      if (event.persisted) return

      void releaseThrottle()
    }

    window.addEventListener('pagehide', leaving)

    return () => {
      window.removeEventListener('pagehide', leaving)
      void releaseThrottle()
    }
  }, [])

  // A demo document that never reports back must not leave the button disabled forever.
  useEffect(() => {
    if (run === 0 || complete) return

    const timer = window.setTimeout(() => setStalled(true), expect + STALL_MS)

    return () => window.clearTimeout(timer)
  }, [complete, expect, run])

  // One wall clock for both panels, so the numbers on screen share an origin. Each demo
  // document keeps its own clock, so the tick also converts the parent's reading into it.
  useEffect(() => {
    if (!animating) {
      window.cancelAnimationFrame(frame.current)

      return
    }

    const tick = (): void => {
      const parentNow = performance.now()

      if (startedAt.current !== null) setLive(parentNow - startedAt.current)

      const converted: Elapsed = {}

      for (const variant of DEMO_VARIANTS) {
        const origin = origins.current[variant]

        if (origin !== undefined) converted[variant] = parentNow - origin
      }

      setNow(converted)

      frame.current = window.requestAnimationFrame(tick)
    }

    frame.current = window.requestAnimationFrame(tick)

    return () => window.cancelAnimationFrame(frame.current)
  }, [animating])

  useEffect(() => {
    const onMessage = (event: MessageEvent): void => {
      if (event.origin !== window.location.origin) return

      const payload = event.data as DemoMessage | null | undefined

      if (payload?.source !== DEMO_MESSAGE_SOURCE) return
      // A page from an earlier run can still be tearing down. Its numbers belong to a
      // timeline that is no longer on screen.
      if (Number(payload.run) !== runRef.current) return

      const variant = payload.variant
      const parentNow = performance.now()

      if (payload.kind === 'trace') {
        // The first message of a run fixes the offset between the two clocks. Later ones
        // would only fold in their own delivery delay.
        // The first message of a run replaces the provisional offset with the real one.
        // Later ones would only fold in their own delivery delay.
        if (!aligned.current.has(variant)) {
          aligned.current.add(variant)
          origins.current[variant] = parentNow - payload.sentAt
        }
        setTraces((previous) => ({ ...previous, [variant]: payload.trace }))

        return
      }

      const at = startedAt.current === null ? 0 : parentNow - startedAt.current

      reported.current.add(variant)
      // Noted so that a lane ending at a moment can stop here, while one still on the wire
      // carries on against the running clock.
      const stopped = parentNow - (origins.current[variant] ?? parentNow)

      setSettledAt((previous) => ({ ...previous, [variant]: stopped }))
      setResults((previous) => ({ ...previous, [variant]: payload }))
      setReportedAt((previous) => ({ ...previous, [variant]: at }))
    }

    window.addEventListener('message', onMessage)

    return () => window.removeEventListener('message', onMessage)
  }, [])

  const timeline: TimelineGroup[] = DEMO_VARIANTS.map((variant) => ({
    now: now[variant] ?? 0,
    settled: results[variant] !== undefined,
    settledAt: settledAt[variant] ?? null,
    trace: traces[variant] ?? null,
    variant,
  }))

  const furthest = Math.max(
    0,
    ...timeline.map((group) => (group.trace === null ? 0 : traceReach(group.trace, group.now))),
  )

  // Before the first run the axis follows the settings, so an empty timeline already shows
  // the scale a run under them would need.
  useEffect(() => {
    if (run > 0) return

    setAxis(axisBound(expect + (overhead.current[network] ?? ASSUMED_OVERHEAD_MS)))
  }, [expect, network, run])

  // The axis only grows, so a bar already on screen never has to move backwards.
  useEffect(() => {
    setAxis((previous) => (furthest > previous ? axisBound(furthest) : previous))
  }, [furthest])

  // What this run cost beyond what its conditions alone predict is the best guess for the
  // next run under the same conditions. Read from a ref rather than from the current
  // selection, so picking a different preset cannot claim this run's figure as its own.
  useEffect(() => {
    if (!complete) return

    const used = ranWith.current

    overhead.current[used] = Math.max(0, furthest - expected.current)
  }, [complete, furthest])

  const slow = results.without?.contentAt
  const fast = results.with?.contentAt

  return {
    axis,
    gap: slow === undefined || fast === undefined ? null : slow - fast,
    live,
    reportedAt,
    results,
    run,
    running,
    stalled,
    start,
    throttled,
    timeline,
  }
}
