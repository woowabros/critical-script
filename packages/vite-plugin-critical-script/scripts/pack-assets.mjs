import { copyFileSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = join(packageRoot, '..', '..')

const REPOSITORY = 'woowabros/critical-script'
const REFERENCE = 'main'

const blobBase = `https://github.com/${REPOSITORY}/blob/${REFERENCE}`
const rawBase = `https://raw.githubusercontent.com/${REPOSITORY}/${REFERENCE}`

const imagePattern = /\.(png|jpe?g|gif|svg|webp|avif)(#|\?|$)/i

/**
 * npm 은 README 를 GitHub 마크다운 API 로 렌더링하며 저장소 맥락을 넘기지 않는다.
 * 상대 경로는 npmjs.com 기준으로 해석되어 깨지므로 절대 URL 로 바꾼다.
 * 이미지는 raw 주소를 쓴다. blob 주소는 HTML 페이지를 돌려주어 렌더링되지 않는다.
 */
function toAbsoluteUrl(relativePath) {
  const path = relativePath.replace(/^\.\//, '')
  return imagePattern.test(path) ? `${rawBase}/${path}` : `${blobBase}/${path}`
}

function prepare() {
  const readme = readFileSync(join(repoRoot, 'README.md'), 'utf8')
    .replace(/\]\((\.\/[^)\s]+)(\s+"[^"]*")?\)/g, (_, path, title = '') => `](${toAbsoluteUrl(path)}${title})`)
    .replace(/(src|href)="(\.\/[^"]+)"/g, (_, attribute, path) => `${attribute}="${toAbsoluteUrl(path)}"`)

  writeFileSync(join(packageRoot, 'README.md'), readme)
  copyFileSync(join(repoRoot, 'LICENSE'), join(packageRoot, 'LICENSE'))
}

function clean() {
  rmSync(join(packageRoot, 'README.md'), { force: true })
  rmSync(join(packageRoot, 'LICENSE'), { force: true })
}

const mode = process.argv[2]

if (mode === 'prepare') {
  prepare()
} else if (mode === 'clean') {
  clean()
} else {
  console.error('사용법: node scripts/pack-assets.mjs <prepare|clean>')
  process.exit(1)
}
