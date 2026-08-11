import type { ReactElement } from 'react'

import { STAGE_STRINGS, type Locale } from '../../lib/i18n'
import BenchmarkStage from '../BenchmarkStage'
import * as styles from './LiveBenchmark.css'

interface Props {
  locale: Locale
}

/**
 * The measured benchmark, on a documentation page rather than on its own.
 *
 * It is the same component the benchmark page renders, with the heading and the sentence that
 * a page has to supply for itself. Its own page states the title as `h1`; here the title of
 * the page belongs to the plugin, so this is one section of it.
 *
 * Nothing is measured until the reader presses run, and this is meant to be handed
 * `client:visible`, so a page that carries it pays for none of it until it is reached.
 */
export default function LiveBenchmark({ locale }: Props): ReactElement {
  const strings = STAGE_STRINGS[locale]

  return (
    // `not-content` keeps Starlight's markdown spacing off everything inside.
    <section className={`${styles.root} not-content`}>
      <header className={styles.head}>
        <h2>{strings.title}</h2>
        <p>{strings.description}</p>
      </header>

      {/* One level down from the heading above, so the notes read as part of this section. */}
      <BenchmarkStage locale={locale} notesAs='h3' />
    </section>
  )
}
