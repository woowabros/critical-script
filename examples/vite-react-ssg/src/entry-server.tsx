import { renderToString } from 'react-dom/server'

import App from './App'

/**
 * Called by prerender.js at build time. This call is the moment
 * <CriticalScript /> becomes an inline <script> string in the HTML.
 */
export function render(): string {
  return renderToString(<App />)
}
