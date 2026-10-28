// render-stickers.mjs - renders the nine sticker SVGs (art-src/illustration/sticker-0N.svg) to transparent 1200 x 1600 PNGs in
// art-src/illustration/sheet/work/ (or $STICKER_WORK), the input of the sheet composer. Usage: node art-src/illustration/sheet/render-stickers.mjs [01 05 ...]
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const repo = path.resolve(here, '..', '..', '..')
const work = process.env.STICKER_WORK || path.join(here, 'work')
fs.mkdirSync(work, { recursive: true })
const only = process.argv.slice(2)
for (let n = 1; n <= 9; n++) {
  const id = String(n).padStart(2, '0')
  if (only.length && !only.includes(id)) continue
  const svg = path.join(repo, 'art-src', 'illustration', `sticker-${id}.svg`)
  const png = path.join(work, `sticker-${id}.png`)
  execFileSync('node', [path.join(repo, 'tools', 'render-svg.mjs'), '--in', svg, '--out', png, '--scale', '1', '--transparent'], { stdio: 'inherit' })
}
