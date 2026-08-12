import { type ScaleLinear, scaleLinear } from 'd3-scale'

export type DemoStage = 'booting' | 'idle' | 'ready' | 'requesting'

export type DemoVariant = 'with' | 'without'

/**
 * The lanes of the timeline, in the order they are drawn. The paint comes first because it
 * runs from zero to the moment the screen was done, so the rows under it read as the
 * breakdown of that one bar.
 *
 * Below that they are grouped by what the plugin touches. The document and the bundle are
 * the same either way, so they come first and stay still. The inline script sits directly
 * above the request it moves, and the image and the paint that follow from it.
 */
export const DEMO_LANES = ['paint', 'document', 'script', 'execute', 'critical', 'api', 'image'] as const

export type DemoLane = (typeof DEMO_LANES)[number]

/**
 * One measured stretch of a lane. A null `end` means it was still running when the page
 * reported, and the benchmark grows it against the clock until the next report arrives.
 *
 * Every stretch comes from a browser timing API. Nothing here is estimated or stood in
 * for; where the demo needs to be slow, it is made slow for real and then measured.
 */
export interface Segment {
  end: null | number
  start: number
}

/** What one demo page knows about its own load, streamed as it learns it. */
export interface DemoTrace {
  /** The data request, from the moment it left the browser to the response landing. */
  api: null | Segment
  /** The inlined critical script, bracketed by its own two marks. */
  critical: null | Segment
  /** index.html itself, from the request going out to its last byte arriving. */
  document: null | Segment
  /** Evaluating the bundle once the last of it has arrived, up to the app being able to act. */
  execute: null | Segment
  /** The hero image, however the page came to ask for it. */
  image: null | Segment
  /** Largest contentful paint so far. It moves as larger candidates are painted. */
  paint: null | number
  /** Every script the document pulled before it hydrated, merged into one stretch. */
  script: null | Segment
}

export interface DemoMetrics {
  /** Wall clock inside the demo document when the content became visible. */
  contentAt: number
  /** Response finished arriving, from the Resource Timing API. */
  dataReady: null | number
  /** Request left the browser, from the Resource Timing API. */
  requestStart: null | number
  variant: DemoVariant
}

/**
 * Sent whenever the page learns something new about its own load, so the benchmark can
 * draw the lanes while they are still running rather than waiting for the run to finish.
 */
export interface DemoTraceMessage {
  kind: 'trace'
  /** The run this page was opened for, so the parent can drop a stale page's messages. */
  run: string
  /** Document clock when the message was posted, which the parent aligns its own clock to. */
  sentAt: number
  source: typeof DEMO_MESSAGE_SOURCE
  trace: DemoTrace
  variant: DemoVariant
}

/** Sent once, when the content is on screen and the headline numbers are final. */
export interface DemoResult extends DemoMetrics {
  kind: 'result'
  run: string
  source: typeof DEMO_MESSAGE_SOURCE
}

export type DemoMessage = DemoResult | DemoTraceMessage

/** Both variants request the same file, so timing entries can be matched by this suffix. */
export const API_PATH = '/api/home.json'

/**
 * The rest of the application bundle: a module the demo page has to fetch and evaluate
 * before it can act. Served from `public/`, so nothing bundles it away.
 */
export const BUNDLE_PATH = '/demo-bundle.js'

/** Holds responses back on request, which is how the demo gets to be slow for real. */
export const THROTTLE_PATH = '/demo-sw.js'

export const DEMO_MESSAGE_SOURCE = 'critical-script-demo'

/** Left to right: the slow path first, so the improvement reads in reading order. */
export const DEMO_VARIANTS = ['without', 'with'] as const

/**
 * What the throttling worker is asked for, in the same two terms browser developer tools
 * use: a round trip added to every request, and a ceiling on how fast bytes arrive. The
 * numbers are close to what those tools mean by the same names.
 *
 * `expect` is only a starting width for the timeline axis. The axis measures itself from
 * the first run onwards, so a rough figure here is enough.
 */
export const NETWORKS = {
  'fast-4g': { expect: 1200, latency: 150, rate: 1_000_000 },
  off: { expect: 400, latency: 0, rate: 0 },
  'slow-4g': { expect: 3600, latency: 560, rate: 184_000 },
} as const

export type Network = keyof typeof NETWORKS

/** Left to right: the fastest first, so pressing along the row makes the page slower. */
export const NETWORK_CHOICES = ['off', 'fast-4g', 'slow-4g'] as const

export const DEFAULT_NETWORK: Network = 'slow-4g'

/**
 * Milliseconds offered for the two costs a connection cannot account for: the server
 * working on the answer, and the application framework starting itself up. Zero is there so
 * either one can be taken out of the picture on its own.
 */
export const WORK_CHOICES = [0, 200, 500, 1000] as const

export const DEFAULT_SERVER_WORK = 200

export const DEFAULT_BOOT_WORK = 200

export function isNetwork(value: null | string): value is Network {
  return value !== null && Object.prototype.hasOwnProperty.call(NETWORKS, value)
}

/** Kept in step with the same ceilings in the worker. */
const MAX_LATENCY_MS = 10_000

const MAX_RATE = 100_000_000

export function clampNumber(raw: null | number | string, max: number): number {
  const value = Number(raw)

  if (!Number.isFinite(value) || value <= 0) return 0

  return Math.min(Math.round(value), max)
}

/** Site root without a trailing slash, so paths can be joined with a single one. */
export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

/** What a request tells the worker. Also written by hand in the inline critical script. */
export interface Throttle {
  latency: number
  rate: number
  /**
   * What the server spends working on this answer before it starts sending it. Only the
   * data request carries it; a static file has nothing to work out. From the browser's side
   * this is indistinguishable from network latency, which is why the worker treats both the
   * same way and the timeline shows one wait.
   */
  think: number
}

export function readThrottle(params: URLSearchParams): Throttle {
  return {
    latency: clampNumber(params.get('latency'), MAX_LATENCY_MS),
    rate: clampNumber(params.get('rate'), MAX_RATE),
    think: clampNumber(params.get('think'), MAX_LATENCY_MS),
  }
}

/** What the page has to compute before it can act, which no connection can stand in for. */
export function readBootWork(params: URLSearchParams): number {
  return clampNumber(params.get('cpu'), MAX_LATENCY_MS)
}

/**
 * The demo pages are handed the two numbers rather than the name of a preset, so the
 * inline critical script can copy them onto its own request without carrying a table of
 * presets around with it.
 */
export function demoPath(
  variant: DemoVariant,
  options: { bootWork: number; lang: string; network: Network; run: number; serverWork: number },
): string {
  const { latency, rate } = NETWORKS[options.network]
  const query = new URLSearchParams({
    cpu: String(options.bootWork),
    lang: options.lang,
    latency: String(latency),
    rate: String(rate),
    run: String(options.run),
    think: String(options.serverWork),
  })

  return `${BASE}/demo/${variant}-critical?${query.toString()}`
}

/**
 * Asks the throttling worker to slow this response down. `think` is left off unless the
 * caller asks for it, because only the data request has a server working behind it.
 */
export function throttled(url: string, { latency, rate }: Throttle, think = 0): string {
  const glue = url.includes('?') ? '&' : '?'

  return `${url}${glue}latency=${latency}&rate=${rate}&think=${think}`
}

/**
 * Only the demo pages are throttled, so the worker is registered against their directory
 * rather than the site root. Everything else the documentation serves stays outside it.
 */
const THROTTLE_SCOPE = `${BASE}/demo/`

/**
 * Puts the throttling worker in charge before any demo page loads, so the delays the
 * controls describe happen inside real requests. Returns false when the browser will not
 * have it, in which case the demo still runs, only at full speed.
 *
 * Called before every run rather than once, so a run never starts against a registration
 * another tab has already taken away.
 */
export async function ensureThrottle(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false

  try {
    const registration = await navigator.serviceWorker.register(`${BASE}${THROTTLE_PATH}`, { scope: THROTTLE_SCOPE })
    const worker = registration.installing ?? registration.waiting ?? registration.active

    if (worker === null) return false
    const target = worker

    // `navigator.serviceWorker.ready` only settles for a scope that covers the current
    // page, and the benchmark deliberately sits outside this one, so wait on the worker.
    return await new Promise<boolean>((resolve) => {
      let finished = false
      let timer = 0

      const finish = (ready: boolean): void => {
        if (finished) return

        finished = true
        window.clearTimeout(timer)
        target.removeEventListener('statechange', onStateChange)
        resolve(ready)
      }

      function onStateChange(): void {
        if (target.state === 'activated') {
          finish(true)

          return
        }

        if (target.state === 'redundant') finish(false)
      }

      timer = window.setTimeout(() => finish(false), 3000)
      target.addEventListener('statechange', onStateChange)
      onStateChange()
    })
  } catch {
    return false
  }
}

/**
 * Takes the worker back off the origin when the benchmark is done with it, so its life is
 * no longer than the page that asked for it.
 */
export async function releaseThrottle(): Promise<void> {
  if (!('serviceWorker' in navigator)) return

  try {
    const registration = await navigator.serviceWorker.getRegistration(THROTTLE_SCOPE)

    await registration?.unregister()
  } catch {
    // Leaving it behind is harmless. It stores nothing and holds nothing back unless a
    // request asks it to, so a later deploy cannot find it serving anything stale.
  }
}

/** Matches the demo's hero image whether the page asked for it or a preload did. */
export const IMAGE_PATTERN = /\.(avif|gif|jpe?g|png|svg|webp)(\?|$)/

/** The rightmost point a trace has reached, counting a running segment up to `now`. */
export function traceReach(trace: DemoTrace, now: number): number {
  // A lane can be missing rather than null when a page from an older build is still on
  // screen, which happens across a dev reload, so this guards both.
  const ends = [trace.api, trace.critical, trace.document, trace.execute, trace.image, trace.script].map((segment) =>
    segment == null ? 0 : (segment.end ?? now),
  )

  return Math.max(0, trace.paint ?? 0, ...ends)
}

/** How many gaps the axis aims for. Few enough that the labels never crowd each other. */
const AXIS_TICKS = 5

/**
 * Rounds a duration up to a readable end of the timeline axis. Bars grow against a fixed
 * axis while a run is in flight, so the bound has to step rather than creep with the clock.
 */
export function axisBound(ms: number): number {
  return timeScale(Math.max(1, ms), 1).domain()[1]
}

/** Evenly spaced marks across the axis, in milliseconds, starting at zero. */
export function axisTicks(bound: number): number[] {
  return timeScale(bound, 1).ticks(AXIS_TICKS)
}

/** Maps milliseconds onto the width the chart has to draw in. */
export function timeScale(bound: number, width: number): ScaleLinear<number, number> {
  return scaleLinear().domain([0, bound]).nice(AXIS_TICKS).range([0, width])
}
