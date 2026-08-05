import { type ReactElement } from 'react'

import { BASE, DEFAULT_BOOT_MS, DEFAULT_LATENCY_MS, DEMO_VARIANTS, type DemoVariant, demoPath } from '../lib/demo'
import { PREVIEW_STRINGS, STAGE_STRINGS, type Locale } from '../lib/i18n'
import { useBenchmark } from '../lib/useBenchmark'

interface Props {
  locale: Locale
}

/**
 * The landing page version. It starts measuring on its own as soon as the page loads, and
 * keeps a single button to run it again. Everything adjustable lives on the detailed page.
 */
export default function BenchmarkPreview({ locale }: Props): ReactElement {
  const strings = PREVIEW_STRINGS[locale]
  const shared = STAGE_STRINGS[locale]
  const boot = DEFAULT_BOOT_MS
  const latency = DEFAULT_LATENCY_MS
  const { gap, live, reportedAt, results, run, running, stalled, start } = useBenchmark({
    autoStart: true,
    boot,
    latency,
  })

  const clock = (variant: DemoVariant): string => {
    const done = reportedAt[variant]

    if (done !== undefined) return `${(done / 1000).toFixed(2)}s`

    return running ? `${(live / 1000).toFixed(2)}s` : '–'
  }

  return (
    // `not-content` keeps Starlight's markdown spacing out of here. Without it the second
    // panel picks up a sibling margin and the two columns sit at different heights.
    <section className='bp not-content'>
      <header className='bp-head'>
        <div>
          <h2>{strings.title}</h2>
          <p>{strings.description}</p>
        </div>
        <div className='bp-actions'>
          <button className='bp-run' disabled={running} onClick={start} type='button'>
            {running ? shared.running : strings.rerun}
          </button>
          <a className='bp-more' href={`${BASE}/${locale}/benchmark`}>
            {strings.details}
          </a>
        </div>
      </header>

      <p aria-live='polite' className='bp-verdict'>
        {stalled ? (
          <span className='bp-stalled'>{shared.stalled}</span>
        ) : gap === null ? (
          <span className='bp-live'>{(live / 1000).toFixed(2)}s</span>
        ) : (
          <>
            <strong>{gap.toFixed(0)}ms</strong> {shared.faster}
          </>
        )}
      </p>

      <div className='bp-grid'>
        {DEMO_VARIANTS.map((variant) => (
          <article className={`bp-panel bp-${variant}`} key={variant}>
            <header>
              <h3>{shared.panel[variant]}</h3>
              <span className='bp-clock'>{clock(variant)}</span>
            </header>

            <div className='bp-frame'>
              {run > 0 && (
                <iframe
                  key={run}
                  src={demoPath(variant, { boot, lang: locale, latency, run })}
                  title={shared.panel[variant]}
                />
              )}
            </div>

            {/* Request start is the measured number the plugin moves; content shown also
                carries the simulated bundle boot and API latency. */}
            <footer>
              <span>
                {shared.requestStart}
                <b>
                  {results[variant]?.requestStart == null ? '–' : `${results[variant]!.requestStart!.toFixed(0)}ms`}
                </b>
              </span>
              <span>
                {shared.contentShown}
                <b>{results[variant] === undefined ? '–' : `${results[variant]!.contentAt.toFixed(0)}ms`}</b>
              </span>
            </footer>
          </article>
        ))}
      </div>

      <p className='bp-note'>{strings.note}</p>
    </section>
  )
}
