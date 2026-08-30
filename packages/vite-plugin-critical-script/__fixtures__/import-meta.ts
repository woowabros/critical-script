// Fixture for verifying esbuild warnings surface via `this.warn()`. `import.meta`
// is not available in the plugin's `iife` output, so esbuild replaces it with an
// empty object and emits an `empty-import-meta` warning.
window.__critical = import.meta.env
