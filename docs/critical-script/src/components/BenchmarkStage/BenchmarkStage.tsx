import { type ReactElement, type ReactNode, useState } from 'react'

import {
  DEFAULT_BOOT_WORK,
  DEFAULT_NETWORK,
  DEFAULT_SERVER_WORK,
  NETWORK_CHOICES,
  type Network,
  WORK_CHOICES,
  demoPath,
} from '../../lib/demo'
import { STAGE_STRINGS, type Locale } from '../../lib/i18n'
import * as styles from './BenchmarkStage.css'
import { useBenchmark } from './useBenchmark'
import Waterfall from '../Waterfall'

interface Props {
  locale: Locale
  /**
   * What to write the notes heading as. The page that carries the benchmark decides: on its
   * own page it follows an `h1`, and inside a section of another page it follows that
   * section's own heading.
   */
  notesAs?: 'h2' | 'h3'
}

interface FieldProps {
  children: ReactNode
  hint: string
  id: string
  label: string
}

/**
 * One setting: its name, its choices beside the name, and what it means underneath them.
 *
 * A `fieldset` with a `legend` would be the obvious markup, but a legend is not laid out as
 * a child of its own box, so it cannot sit in a row with the choices. A labelled group says
 * the same thing to a reader that cannot see the layout.
 */
function Field({ children, hint, id, label }: FieldProps): ReactElement {
  return (
    <div aria-labelledby={id} className={styles.field} role='group'>
      <span className={styles.fieldName} id={id}>
        {label}
      </span>
      <div className={styles.choices}>{children}</div>
      <p>{hint}</p>
    </div>
  )
}

/** The settings a run is carried out under, kept together so a run can hold on to them. */
interface Conditions {
  bootWork: number
  network: Network
  serverWork: number
}

const DEFAULTS: Conditions = {
  bootWork: DEFAULT_BOOT_WORK,
  network: DEFAULT_NETWORK,
  serverWork: DEFAULT_SERVER_WORK,
}

export default function BenchmarkStage({ locale, notesAs = 'h2' }: Props): ReactElement {
  const strings = STAGE_STRINGS[locale]

  const [chosen, setChosen] = useState<Conditions>(DEFAULTS)
  /**
   * What the run on screen was started with. The demo pages take their conditions from their
   * own address, so building that address from the current choice would reload them the
   * moment a setting changed, which reads as the benchmark running itself again.
   */
  const [applied, setApplied] = useState<Conditions>(DEFAULTS)
  const { axis, run, running, stalled, start, throttled, timeline } = useBenchmark(chosen)

  const begin = (): void => {
    setApplied(chosen)
    start()
  }

  const { bootWork, network, serverWork } = chosen
  const NotesHeading = notesAs

  return (
    <div>
      <section className={styles.controls}>
        <button className={styles.run} disabled={running} onClick={begin} type='button'>
          {running ? strings.running : run === 0 ? strings.run : strings.rerun}
        </button>

        {/* Closed to begin with: the defaults are the interesting case, and the summary says
            what they are without the reader having to open anything. */}
        <details className={styles.conditions}>
          <summary>
            <span className={styles.conditionsName}>{strings.conditions}</span>
            <span className={styles.conditionsNow}>
              {strings.networkName[network]} · {strings.serverWorkBrief} {serverWork}ms · {strings.bootWorkBrief}{' '}
              {bootWork}ms
            </span>
          </summary>

          <div className={styles.fields}>
            <Field hint={strings.networkHint} id='stage-network' label={strings.network}>
              {NETWORK_CHOICES.map((choice) => (
                <button
                  aria-pressed={network === choice}
                  disabled={running}
                  key={choice}
                  onClick={() => setChosen((previous) => ({ ...previous, network: choice }))}
                  type='button'
                >
                  {strings.networkName[choice]}
                </button>
              ))}
            </Field>

            <Field hint={strings.serverWorkHint} id='stage-server' label={strings.serverWork}>
              {WORK_CHOICES.map((choice) => (
                <button
                  aria-pressed={serverWork === choice}
                  disabled={running}
                  key={choice}
                  onClick={() => setChosen((previous) => ({ ...previous, serverWork: choice }))}
                  type='button'
                >
                  {choice}ms
                </button>
              ))}
            </Field>

            <Field hint={strings.bootWorkHint} id='stage-boot' label={strings.bootWork}>
              {WORK_CHOICES.map((choice) => (
                <button
                  aria-pressed={bootWork === choice}
                  disabled={running}
                  key={choice}
                  onClick={() => setChosen((previous) => ({ ...previous, bootWork: choice }))}
                  type='button'
                >
                  {choice}ms
                </button>
              ))}
            </Field>
          </div>
        </details>
      </section>

      {/* A run that never came back needs saying somewhere, now that the headline is gone. */}
      {stalled && (
        <p aria-live='polite' className={styles.warning}>
          {strings.stalled}
        </p>
      )}

      {/* Kept on screen from the start, empty, so pressing run fills a shape the reader has
          already seen rather than pushing the page around. */}
      <section className={styles.timeline}>
        <Waterfall
          axis={axis}
          frameSrc={(variant) => demoPath(variant, { ...applied, lang: locale, run })}
          groups={timeline}
          run={run}
          strings={strings}
        />

        {throttled === false && <p className={styles.warning}>{strings.throttleMissing}</p>}
      </section>

      <section className={styles.notes}>
        <NotesHeading>{strings.simulationTitle}</NotesHeading>
        <ul>
          {strings.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
