/// <reference types="astro/client" />

interface DemoHome {
  heroImageUrl: string
  items: string[]
  title: string
}

/** Injected by the plugin's `define` option when the critical script is compiled. */
declare const __DEMO_API_URL__: string

interface Window {
  /** Set by public/demo-bundle.js, and resolved once that bundle is ready to be used. */
  __demoBundle: Promise<void>
  /** Set by prefetch.critical.ts while the browser is still parsing the HTML. */
  __demoHome?: Promise<DemoHome>
}

declare namespace React {
  /**
   * The Element Timing attribute, which React's own types do not carry. Naming an element
   * with it has the browser report the moment it painted.
   */
  interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
    elementtiming?: string
  }
}
