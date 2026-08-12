// Compiled by esbuild and inlined into the demo HTML by the plugin.
// It has to stay small, so it only starts the request and hands the promise over.
// The two marks bracket the whole script, so the benchmark can draw how long it ran.
performance.mark('demo:critical-start')

// The benchmark's throttling worker reads these two off the request. They are copied from
// this page's own address rather than looked up, so this script needs no table of network
// presets. Both variants therefore ask the worker for exactly the same conditions.
// Written out by hand here to keep the inline script small; `throttled()` in lib/demo.ts
// builds the same string for the request the other variant sends.
const here = new URLSearchParams(location.search)
const conditions =
  `latency=${Number(here.get('latency')) || 0}` +
  `&rate=${Number(here.get('rate')) || 0}` +
  `&think=${Number(here.get('think')) || 0}`

window.__demoHome = fetch(`${__DEMO_API_URL__}?${conditions}`, { cache: 'no-store' }).then((response) =>
  response.json(),
)

performance.mark('demo:critical-end')
