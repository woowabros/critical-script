import { type ReactElement, useState } from 'react'

import {
  BOOT_CHOICES,
  DEFAULT_BOOT_MS,
  DEFAULT_LATENCY_MS,
  DEMO_VARIANTS,
  LATENCY_CHOICES,
  demoPath,
} from '../lib/demo'
import { STAGE_STRINGS, type Locale } from '../lib/i18n'
import { useBenchmark } from '../lib/useBenchmark'

interface Props {
  locale: Locale
}

export default function BenchmarkStage({ locale }: Props): ReactElement {
  const strings = STAGE_STRINGS[locale]

  const [boot, setBoot] = useState(DEFAULT_BOOT_MS)
  const [latency, setLatency] = useState(DEFAULT_LATENCY_MS)
  const {
    gap,
    live,
    reportedAt: elapsed,
    results,
    run,
    running,
    scale,
    stalled,
    start,
  } = useBenchmark({
    boot,
    latency,
  })

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
                  <p className='panel-empty'>{strings.panelIdle}</p>
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
