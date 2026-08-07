// Compiled by esbuild and inlined into the demo HTML by the plugin.
// It has to stay small, so it only starts the request and hands the promise over.
performance.mark('demo:fetch-start')
window.__demoHome = fetch(__DEMO_API_URL__, { cache: 'no-store' }).then((response) => response.json())
