import fs from 'node:fs'
import path from 'node:path'

import { defineConfig } from 'tsdown'

export default defineConfig({
  banner: {
    dts: '/// <reference types="./global.d.ts" />',
  },
  clean: true,
  dts: true,
  entry: ['index.ts'],
  external: ['vite'],
  format: 'esm',
  onSuccess: (output) => {
    fs.copyFileSync('./global.d.ts', path.join(output.outDir, 'global.d.ts'))
    console.log('✅ global.d.ts has been copied to dist folder.')
  },
  outDir: 'dist',
  sourcemap: true,
  target: 'es2022',
})
