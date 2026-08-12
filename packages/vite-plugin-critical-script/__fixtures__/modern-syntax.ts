// Fixture for the `target` option. Every construct below is syntax that esbuild
// has to rewrite for older targets, so the compiled output differs visibly
// between `esnext` and, say, `es2015`.
window.__critical = globalThis.crypto?.randomUUID?.() ?? 'ok'
