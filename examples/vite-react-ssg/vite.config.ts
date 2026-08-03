import { criticalScriptPlugin } from '@woowabros/vite-plugin-critical-script'
import { defineConfig } from 'vite'

export default defineConfig(({ isSsrBuild }) => ({
  build: {
    // The server bundle runs once in Node and is then discarded, so it needs no public assets.
    copyPublicDir: !isSsrBuild,
  },
  plugins: [criticalScriptPlugin()],
}))
