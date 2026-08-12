// Stands in for the rest of the application bundle: a script the demo page has to fetch and
// wait on before it can do any work. The benchmark asks the throttling worker to hold the
// file back, and asks this script to take `cpu` milliseconds getting itself ready.
//
// A classic script rather than a module, so the dev server hands it over untouched instead
// of pulling it through its own module pipeline. The module route was tried and dropped: a
// module script's `load` event fires once the graph has been fetched, not once it has been
// evaluated, so a top-level await inside it is invisible from the outside.
//
// Readiness is published as a promise for the same reason the critical script publishes one:
// the page can then await it, which is what makes this a real dependency rather than a wait
// the page chose to take.
const asked = Number(new URL(document.currentScript.src).searchParams.get('cpu'))
const startup = Number.isFinite(asked) && asked > 0 ? Math.min(Math.round(asked), 10000) : 0

performance.mark('demo:bundle-start')

window.__demoBundle = new Promise((resolve) => {
  setTimeout(() => {
    performance.mark('demo:bundle-ready')
    resolve()
  }, startup)
})
