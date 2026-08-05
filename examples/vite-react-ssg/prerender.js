// The final step of static site generation.
//
// It runs the built server bundle in Node to get an HTML string, then drops that
// string into the placeholder the client build left behind.
//
// react-router and @tanstack/react-start do this step for you.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const serverEntry = path.join(root, 'dist/server/entry-server.js')
const htmlPath = path.join(root, 'dist/client/index.html')

for (const [script, target] of [
  ['build:server', serverEntry],
  ['build:client', htmlPath],
]) {
  if (!fs.existsSync(target)) {
    console.error(`${path.relative(root, target)} is missing. Run "pnpm ${script}" first.`)
    process.exit(1)
  }
}

const { render } = await import(serverEntry)
const template = fs.readFileSync(htmlPath, 'utf-8')

if (!template.includes('<!--app-html-->')) {
  console.error('index.html has no <!--app-html--> placeholder.')
  process.exit(1)
}

fs.writeFileSync(htmlPath, template.replace('<!--app-html-->', render()))

console.log(`prerendered ${path.relative(root, htmlPath)}`)
