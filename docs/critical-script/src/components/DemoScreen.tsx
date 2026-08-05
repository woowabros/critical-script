import { type ReactElement, useEffect, useState } from 'react'

import {
  API_PATH,
  BASE,
  DEMO_MESSAGE_SOURCE,
  type DemoMetrics,
  type DemoStage,
  type DemoVariant,
  clampSimulated,
  sleep,
} from '../lib/demo'
import { DEMO_STRINGS, type Locale, isLocale } from '../lib/i18n'

interface Props {
  variant: DemoVariant
}

interface Simulation {
  boot: number
  latency: number
  locale: Locale
}

function readSimulation(): Simulation {
  const params = new URLSearchParams(window.location.search)
  const lang = params.get('lang') ?? undefined

  return {
    boot: clampSimulated(params.get('boot')),
    latency: clampSimulated(params.get('latency')),
    locale: isLocale(lang) ? lang : 'en',
  }
}

/** Real timings, read from the Resource Timing API rather than from our own marks. */
function readTiming(): null | Pick<DemoMetrics, 'dataReady' | 'requestStart'> {
  const entry = performance
    .getEntriesByType('resource')
    .find((candidate): candidate is PerformanceResourceTiming => candidate.name.endsWith(API_PATH))

  return entry === undefined ? null : { dataReady: entry.responseEnd, requestStart: entry.startTime }
}

export default function DemoScreen({ variant }: Props): ReactElement {
  const [home, setHome] = useState<DemoHome | null>(null)
  const [stage, setStage] = useState<DemoStage>('idle')
  const [metrics, setMetrics] = useState<DemoMetrics | null>(null)
  const [problem, setProblem] = useState<null | string>(null)
  const [locale, setLocale] = useState<Locale>('en')

  useEffect(() => {
    let abandoned = false
    const { boot, latency, locale: pageLocale } = readSimulation()

    setLocale(pageLocale)

    const run = async (): Promise<void> => {
      // Stands in for downloading, parsing, and hydrating a real application bundle.
      // Both variants pay it. Only the "without" variant has its request stuck behind it.
      setStage('booting')
      await sleep(boot)

      if (abandoned) return

      let startedAt: number
      let pending: Promise<DemoHome>

      if (variant === 'with') {
        if (window.__demoHome === undefined) {
          setProblem('window.__demoHome is undefined, so the inline critical script did not run.')

          return
        }

        // The inline script already sent this request while the HTML was being parsed.
        startedAt = performance.getEntriesByName('demo:fetch-start')[0]?.startTime ?? 0
        pending = window.__demoHome
      } else {
        startedAt = performance.now()
        pending = fetch(`${BASE}${API_PATH}`, { cache: 'no-store' }).then(
          (response) => response.json() as Promise<DemoHome>,
        )
      }

      setStage('requesting')

      const data = await pending

      // Stands in for a server that answers in `latency` ms. Measured from the moment the
      // request started, so both variants model the same server.
      await sleep(startedAt + latency - performance.now())

      if (abandoned) return

      const timing = readTiming()
      const collected: DemoMetrics = {
        boot,
        contentAt: performance.now(),
        dataReady: timing?.dataReady ?? null,
        latency,
        requestStart: timing?.requestStart ?? null,
        variant,
      }

      setHome(data)
      setStage('ready')
      setMetrics(collected)

      if (window.parent !== window) {
        window.parent.postMessage({ source: DEMO_MESSAGE_SOURCE, ...collected }, window.location.origin)
      }
    }

    void run().catch(() => {
      if (!abandoned) setProblem('The demo API did not respond.')
    })

    return () => {
      abandoned = true
    }
  }, [variant])

  const strings = DEMO_STRINGS[locale]

  return (
    <main className={`demo demo-${variant} demo-stage-${stage}`}>
      <header className='demo-head'>
        <span className='demo-badge'>{strings.badge[variant]}</span>
        <span className='demo-stage'>{problem === null ? strings.stage[stage] : strings.failed}</span>
      </header>

      {problem !== null && <p className='demo-problem'>{problem}</p>}

      {home === null && problem === null && (
        <div aria-hidden='true' className='demo-skeleton'>
          <span className='demo-skeleton-title' />
          <span className='demo-skeleton-media' />
          <span className='demo-skeleton-line' />
          <span className='demo-skeleton-line short' />
        </div>
      )}

      {home !== null && (
        <article className='demo-card'>
          <h1>{home.title}</h1>
          {/* Intrinsic size, so the browser reserves the box before the bytes land. */}
          <img alt='' height={887} src={home.heroImageUrl} width={1774} />
          <ul>
            {home.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      )}

      {metrics !== null && (
        <dl className='demo-metrics'>
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
