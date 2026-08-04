import { type ReactElement, useCallback, useEffect, useRef, useState } from 'react'

import {
  BOOT_CHOICES,
  DEFAULT_BOOT_MS,
  DEFAULT_LATENCY_MS,
  DEMO_MESSAGE_SOURCE,
  DEMO_VARIANTS,
  type DemoMetrics,
  type DemoVariant,
  LATENCY_CHOICES,
  demoPath,
} from '../lib/demo'
import { STAGE_STRINGS, type Locale } from '../lib/i18n'

interface Props {
  locale: Locale
}

type Elapsed = Partial<Record<DemoVariant, number>>

type Results = Partial<Record<DemoVariant, DemoMetrics>>

export default function BenchmarkStage({ locale }: Props): ReactElement {
  const strings = STAGE_STRINGS[locale]

  const [boot, setBoot] = useState(DEFAULT_BOOT_MS)
  const [latency, setLatency] = useState(DEFAULT_LATENCY_MS)
  const [run, setRun] = useState(0)
  const [results, setResults] = useState<Results>({})
  const [elapsed, setElapsed] = useState<Elapsed>({})
  const [live, setLive] = useState(0)
  const [stalled, setStalled] = useState(false)

  const startedAt = useRef<null | number>(null)
  const frame = useRef(0)

  const complete = Object.keys(results).length >= DEMO_VARIANTS.length
  const running = run > 0 && !complete && !stalled

  // A demo page that never reports back must not leave the button disabled forever.
  useEffect(() => {
    if (run === 0 || complete) return

    const timer = window.setTimeout(() => setStalled(true), boot + latency + 15_000)

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
      setElapsed((previous) => ({ ...previous, [variant]: at }))
    }

    window.addEventListener('message', onMessage)

    return () => window.removeEventListener('message', onMessage)
  }, [])

  const start = useCallback((): void => {
    setResults({})
    setElapsed({})
    setLive(0)
    setStalled(false)
    startedAt.current = performance.now()
    setRun((previous) => previous + 1)
  }, [])

  const scale = Math.max(1, ...DEMO_VARIANTS.map((variant) => results[variant]?.contentAt ?? 0))
  const gap = (() => {
    const slow = results.without?.contentAt
    const fast = results.with?.contentAt

    return slow === undefined || fast === undefined ? null : slow - fast
  })()

  return (
    <div className='stage'>
      <section className='stage-controls'>
        <button className='stage-run' disabled={running} onClick={start} type='button'>
          {running ? strings.running : run === 0 ? strings.run : strings.rerun}
        </button>

        <fieldset className='stage-field'>
          <legend>{strings.boot}</legend>
          <div className='stage-choices'>
            {BOOT_CHOICES.map((choice) => (
              <button
                aria-pressed={boot === choice}
                disabled={running}
                key={choice}
                onClick={() => setBoot(choice)}
                type='button'
              >
                {choice}ms
              </button>
            ))}
          </div>
          <p>{strings.bootHint}</p>
        </fieldset>

        <fieldset className='stage-field'>
          <legend>{strings.latency}</legend>
          <div className='stage-choices'>
            {LATENCY_CHOICES.map((choice) => (
              <button
                aria-pressed={latency === choice}
                disabled={running}
                key={choice}
                onClick={() => setLatency(choice)}
                type='button'
              >
                {choice}ms
              </button>
            ))}
          </div>
          <p>{strings.latencyHint}</p>
        </fieldset>
      </section>

      <p aria-live='polite' className='stage-headline'>
        {gap === null ? (
          run === 0 ? (
            strings.idle
          ) : stalled ? (
            <span className='stage-stalled'>{strings.stalled}</span>
          ) : (
            <span className='stage-live'>{(live / 1000).toFixed(2)}s</span>
          )
        ) : (
          <>
            <strong>{gap.toFixed(0)}ms</strong> {strings.faster}
          </>
        )}
      </p>

      <section className='stage-grid'>
        {DEMO_VARIANTS.map((variant) => {
          const result = results[variant]
          const done = elapsed[variant]

          return (
            <article className={`panel panel-${variant}`} key={variant}>
              <header className='panel-head'>
                <div>
                  <h2>{strings.panel[variant]}</h2>
                  <p>{strings.panelHint[variant]}</p>
                </div>
                <span className={`panel-clock ${done === undefined ? '' : 'is-done'}`}>
                  {done === undefined
                    ? run === 0
                      ? '–'
                      : `${((running ? live : 0) / 1000).toFixed(2)}s`
                    : `${(done / 1000).toFixed(2)}s`}
                </span>
              </header>

              <div className='panel-frame'>
                {run === 0 ? (
                  <p className='panel-empty'>{strings.idle}</p>
                ) : (
                  <iframe
                    key={run}
                    src={demoPath(variant, { boot, lang: locale, latency, run })}
                    title={strings.panel[variant]}
                  />
                )}
              </div>

              <footer className='panel-foot'>
                <span>
                  {strings.requestStart}
                  <b>{result?.requestStart == null ? '–' : `${result.requestStart.toFixed(0)}ms`}</b>
                </span>
                <span>
                  {strings.contentShown}
                  <b>{result === undefined ? '–' : `${result.contentAt.toFixed(0)}ms`}</b>
                </span>
                <a
                  href={demoPath(variant, { boot, lang: locale, latency, run: Math.max(run, 1) })}
                  rel='noreferrer'
                  target='_blank'
                >
                  {strings.openInTab}
                </a>
              </footer>
            </article>
          )
        })}
      </section>

      {gap !== null && (
        <section className='stage-timeline'>
          <h2>{strings.timelineTitle}</h2>
          <ul>
            {DEMO_VARIANTS.map((variant) => {
              const result = results[variant]
              const requestStart = result?.requestStart ?? 0
              const contentAt = result?.contentAt ?? 0

              return (
                <li key={variant}>
                  <span className='timeline-label'>{strings.panel[variant]}</span>
                  <span className='timeline-track'>
                    <span className='timeline-wait' style={{ inlineSize: `${(requestStart / scale) * 100}%` }} />
                    <span
                      className='timeline-net'
                      style={{ inlineSize: `${((contentAt - requestStart) / scale) * 100}%` }}
                    />
                  </span>
                  <span className='timeline-value'>{contentAt.toFixed(0)}ms</span>
                </li>
              )
            })}
          </ul>
          <p className='timeline-legend'>
            <span className='key key-wait' /> {strings.legendWait}
            <span className='key key-net' /> {strings.legendNetwork}
          </p>
        </section>
      )}

      <section className='stage-notes'>
        <h2>{strings.simulationTitle}</h2>
        <ul>
          {strings.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
