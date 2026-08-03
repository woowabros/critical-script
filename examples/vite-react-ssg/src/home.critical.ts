// This file never reaches the main JS bundle.
//
// The plugin compiles it with esbuild and inlines the result as a <script> in
// the prerendered HTML, so it runs while the browser is still parsing the
// document, before the bundle has been downloaded or React has loaded.
//
// Start the request here, park the promise on window, and let the app pick the
// result up once it boots.

window.__home = fetch('/api/home.json').then((response) => response.json() as Promise<HomeData>)
