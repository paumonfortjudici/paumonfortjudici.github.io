// The two card pictures of the deck (the folder face on the cover and the catalog cut-out): a fan of printed slides.
//   thumb 720 x 900 on tomato, peek 561 x 628 on nothing (transparent). Reads _build/slide-N.png, writes _build/card-thumb.png and card-peek.png.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from 'playwright-core'

const here = path.dirname(fileURLToPath(import.meta.url))
const build = path.join(here, '_build')
const url = (n) => pathToFileURL(path.join(build, `slide-${n}.png`)).href
const GRAIN = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360"><filter id="n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="9" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .06  0 0 0 0 .08  0 0 0 0 .1  0 0 0 1.1 -.42"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`,
)

const card = (n, { x, y, w, rot, z }) =>
  `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${(w * 16) / 9}px;transform:rotate(${rot}deg);z-index:${z};background:#F6F0DC;padding:${Math.round(w * 0.018)}px;box-shadow:${Math.round(w * 0.02)}px ${Math.round(w * 0.026)}px 0 #101820"><img src="${url(n)}" style="width:100%;height:100%;display:block"></div>`

const shell = (w, h, bg, inner) =>
  `<!doctype html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:${w}px;height:${h}px;overflow:hidden;background:${bg}}.g{position:absolute;inset:0;z-index:99;mix-blend-mode:multiply;opacity:.5;background-image:url("data:image/svg+xml,${GRAIN}")}</style></head><body>${inner}${bg === 'transparent' ? '' : '<div class="g"></div>'}</body></html>`

const jobs = [
  {
    name: 'card-thumb', w: 720, h: 900, bg: '#E8553E',
    // slide 3 behind at the top left, slide 2 behind on the right, the cover in front: the same fan as the old card
    html: card(3, { x: 20, y: -250, w: 330, rot: -9, z: 1 }) + card(2, { x: 250, y: -150, w: 440, rot: 7, z: 2 }) + card(1, { x: 14, y: 255, w: 460, rot: -3, z: 3 }),
  },
  {
    name: 'card-peek', w: 561, h: 628, bg: 'transparent',
    html: card(2, { x: 12, y: 36, w: 300, rot: -6, z: 1 }) + card(3, { x: 250, y: 30, w: 300, rot: 6, z: 2 }) + card(5, { x: 120, y: 40, w: 330, rot: 0, z: 3 }),
  },
]

const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args: ['--allow-file-access-from-files'] })
for (const j of jobs) {
  const ctx = await browser.newContext({ viewport: { width: j.w, height: j.h }, deviceScaleFactor: 1 })
  const pg = await ctx.newPage()
  const f = path.join(build, j.name + '.html')
  fs.writeFileSync(f, shell(j.w, j.h, j.bg, j.html))
  await pg.goto(pathToFileURL(f).href, { waitUntil: 'load' })
  await pg.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))))
  await pg.waitForTimeout(300)
  await pg.screenshot({ path: path.join(build, j.name + '.png'), omitBackground: j.bg === 'transparent' })
  await ctx.close()
  console.log(j.name, 'done')
}
await browser.close()
