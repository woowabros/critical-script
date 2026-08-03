import { type ReactElement, useEffect, useState } from 'react'

import CriticalScript from './home.critical?as-critical-script'

const NO_SCRIPT =
  'No inline critical script on this page. It is a build artifact, so run "pnpm build" and serve with "pnpm preview".'

export default function App(): ReactElement {
  const [home, setHome] = useState<HomeData | null>(null)
  const [problem, setProblem] = useState<null | string>(null)

  useEffect(() => {
    if (window.__home === undefined) {
      setProblem(NO_SCRIPT)

      return
    }

    // The request started during HTML parsing. Here we only take the result.
    void window.__home.then(setHome).catch(() => {
      setProblem('The demo API did not respond.')
    })
  }, [])

  return (
    <>
      {/* Renders as an inline <script> holding the compiled home.critical.ts. */}
      <CriticalScript />

      <main className='page'>
        <p className='eyebrow'>@woowabros/vite-plugin-critical-script</p>
        <h1>A critical script, start to finish</h1>
        <p className='lede'>
          <code>home.critical.ts</code> was compiled into an inline <code>&lt;script&gt;</code> in this page's HTML. It
          started fetching <code>/api/home.json</code> during parsing, and the content below came from that already
          finished request rather than from one this component had to start.
        </p>

        {problem !== null && <p className='problem'>{problem}</p>}

        {home !== null && (
          <section className='card'>
            <h2>{home.title}</h2>
            {/* Intrinsic size, so the browser reserves the right box before the bytes land. */}
            <img alt='critical-script' height={887} src={home.heroImageUrl} width={1774} />
            <ul>
              {home.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {home === null && problem === null && <p className='pending'>Waiting for the prefetched response…</p>}
      </main>
    </>
  )
}
