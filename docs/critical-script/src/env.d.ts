/// <reference types="astro/client" />

interface DemoHome {
  heroImageUrl: string
  items: string[]
  title: string
}

/** Injected by the plugin's `define` option when the critical script is compiled. */
declare const __DEMO_API_URL__: string

interface Window {
  /** Set by prefetch.critical.ts while the browser is still parsing the HTML. */
  __demoHome?: Promise<DemoHome>
}
