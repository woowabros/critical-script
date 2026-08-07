import { useCallback, useEffect, useRef, useState } from 'react'

import { DEMO_MESSAGE_SOURCE, DEMO_VARIANTS, type DemoMetrics, type DemoVariant } from './demo'

type Elapsed = Partial<Record<DemoVariant, number>>

type Results = Partial<Record<DemoVariant, DemoMetrics>>

interface Options {
  /** Run once as soon as the component mounts, rather than waiting for a press. */
  autoStart?: boolean
  boot: number
  latency: number
}

export interface Benchmark {
  /** Milliseconds the fast variant saved, once both sides have reported. */
  gap: null | number
  /** Wall clock since the current run started, for a live read-out. */
  live: number
  reportedAt: Elapsed
  results: Results
  run: number
  running: boolean
  /** Longest `contentAt` seen this run, for scaling bars against. */
  scale: number
  stalled: boolean
  start: () => void
}

const STALL_MS = 15_000

/**
 * Drives one benchmark run: reloads both demo documents at the same moment and collects
 * what they post back. Shared by the compact preview on the landing page and the detailed
 * page, so both measure the same way.
 */
export function useBenchmark({ autoStart = false, boot, latency }: Options): Benchmark {
  const [run, setRun] = useState(0)
  const [results, setResults] = useState<Results>({})
  const [reportedAt, setReportedAt] = useState<Elapsed>({})
  const [live, setLive] = useState(0)
  const [stalled, setStalled] = useState(false)

  const startedAt = useRef<null | number>(null)
  const frame = useRef(0)
  const autoStarted = useRef(false)

  const complete = Object.keys(results).length >= DEMO_VARIANTS.length
  const running = run > 0 && !complete && !stalled

  const start = useCallback((): void => {
    setResults({})
    setReportedAt({})
    setLive(0)
    setStalled(false)
    startedAt.current = performance.now()
    setRun((previous) => previous + 1)
  }, [])

  useEffect(() => {
    if (!autoStart || autoStarted.current) return

    autoStarted.current = true
    start()
  }, [autoStart, start])

  // A demo document that never reports back must not leave the button disabled forever.
  useEffect(() => {
    if (run === 0 || complete) return

    const timer = window.setTimeout(() => setStalled(true), boot + latency + STALL_MS)

    return () => window.clearTimeout(timer)
  }, [boot, complete, latency, run])

  // One wall clock for both panels, so the numbers on screen share an origin.
  useEffect(() => {
    if (!running) {
      window.cancelAnimationFrame(frame.current)

      return
    }

    const tick = (): void => {
      if (startedAt.current !== null) setLive(performance.now() - startedAt.current)
      frame.current = window.requestAnimationFrame(tick)
    }

    frame.current = window.requestAnimationFrame(tick)

    return () => window.cancelAnimationFrame(frame.current)
  }, [running])

  useEffect(() => {
    const onMessage = (event: MessageEvent): void => {
      if (event.origin !== window.location.origin) return

      const payload = event.data as Partial<DemoMetrics> & { source?: string }

      if (payload.source !== DEMO_MESSAGE_SOURCE || payload.variant === undefined) return

      const variant = payload.variant
      const at = startedAt.current === null ? 0 : performance.now() - startedAt.current

      setResults((previous) => ({ ...previous, [variant]: payload as DemoMetrics }))
      setReportedAt((previous) => ({ ...previous, [variant]: at }))
    }

    window.addEventListener('message', onMessage)

    return () => window.removeEventListener('message', onMessage)
  }, [])

  const slow = results.without?.contentAt
  const fast = results.with?.contentAt

  return {
    gap: slow === undefined || fast === undefined ? null : slow - fast,
    live,
    reportedAt,
    results,
    run,
    running,
    scale: Math.max(1, ...DEMO_VARIANTS.map((variant) => results[variant]?.contentAt ?? 0)),
    stalled,
    start,
  }
}
