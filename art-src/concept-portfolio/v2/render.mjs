// Prints the slides of the A Portfolio deck: node art-src/concept-portfolio/v2/render.mjs [1 2 3 ...]   (default: all five)
// Each slide module (s1.mjs ... s5.mjs) returns { field, body, text }; this writes _build/slide-N.html, _build/slide-N.png (1080 x 1920) and
// _build/anchors-N.json (the box of every element that carries a data-id, in slide pixels: used to measure the pins and the sound hotspots).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from 'playwright-core'
import { page, W, H } from './lib.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const build = path.join(here, '_build')
fs.mkdirSync(build, { recursive: true })
const wanted = process.argv.slice(2).filter((a) => /^\d$/.test(a)).map(Number)
const list = wanted.length ? wanted : [1, 2, 3, 4, 5]
const exe = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

// the stencil pieces are CSS masks, which a file:// page may only load with this flag
const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--allow-file-access-from-files', '--disable-web-security'] })
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })
for (const n of list) {
  const mod = await import(pathToFileURL(path.join(here, `s${n}.mjs`)).href + `?v=${Date.now()}`)
  const html = page(mod.default())
  const file = path.join(build, `slide-${n}.html`)
  fs.writeFileSync(file, html)
  const pg = await ctx.newPage()
  const errs = []
  pg.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 160)))
  pg.on('requestfailed', (r) => errs.push('FAILED ' + r.url().slice(-60)))
  await pg.goto(pathToFileURL(file).href, { waitUntil: 'load' })
  await pg.evaluate(async () => {
    await document.fonts.ready
    await Promise.all([...document.images].map((i) => i.decode().catch(() => {})))
  })
  await pg.waitForTimeout(500)
  const anchors = await pg.evaluate(() =>
    Object.fromEntries([...document.querySelectorAll('[data-id]')].map((e) => {
      const r = e.getBoundingClientRect()
      return [e.dataset.id, { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), cx: Math.round(r.left + r.width / 2), cy: Math.round(r.top + r.height / 2) }]
    })),
  )
  fs.writeFileSync(path.join(build, `anchors-${n}.json`), JSON.stringify(anchors, null, 1))
  await pg.screenshot({ path: path.join(build, `slide-${n}.png`), clip: { x: 0, y: 0, width: W, height: H } })
  console.log(`slide ${n} done`, errs.length ? errs : '')
  await pg.close()
}
await browser.close()
