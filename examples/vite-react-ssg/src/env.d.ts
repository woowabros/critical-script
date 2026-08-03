/// <reference types="vite/client" />

interface HomeData {
  heroImageUrl: string
  items: string[]
  title: string
}

interface Window {
  /** Set by home.critical.ts while the browser is still parsing the HTML. */
  __home?: Promise<HomeData>
}
