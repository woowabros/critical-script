export type DemoStage = 'booting' | 'idle' | 'ready' | 'requesting'

export type DemoVariant = 'with' | 'without'

export interface DemoMetrics {
  /** Simulated bundle boot cost this run used, in milliseconds. */
  boot: number
  /** Wall clock inside the demo document when the content became visible. */
  contentAt: number
  /** Response finished arriving, from the Resource Timing API. */
  dataReady: null | number
  /** Simulated API latency this run used, in milliseconds. */
  latency: number
  /** Request left the browser, from the Resource Timing API. */
  requestStart: null | number
  variant: DemoVariant
}

/** Both variants request the same file, so timing entries can be matched by this suffix. */
export const API_PATH = '/api/home.json'

export const DEMO_MESSAGE_SOURCE = 'critical-script-demo'

/** Left to right: the slow path first, so the improvement reads in reading order. */
export const DEMO_VARIANTS = ['without', 'with'] as const

export const DEFAULT_BOOT_MS = 600

export const DEFAULT_LATENCY_MS = 400

export const BOOT_CHOICES = [0, 300, 600, 1200] as const

export const LATENCY_CHOICES = [0, 200, 400, 800] as const

const MAX_SIMULATED_MS = 4000

export function clampSimulated(raw: null | number | string): number {
  const value = Number(raw)

  if (!Number.isFinite(value) || value <= 0) return 0

  return Math.min(Math.round(value), MAX_SIMULATED_MS)
}

/** Site root without a trailing slash, so paths can be joined with a single one. */
export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

export function demoPath(
  variant: DemoVariant,
  options: { boot: number; lang: string; latency: number; run: number },
): string {
  const query = new URLSearchParams({
    boot: String(options.boot),
    lang: options.lang,
    latency: String(options.latency),
    run: String(options.run),
  })

  return `${BASE}/demo/${variant}-critical?${query.toString()}`
}

export function sleep(ms: number): Promise<void> {
  return ms <= 0 ? Promise.resolve() : new Promise((resolve) => window.setTimeout(resolve, ms))
}
