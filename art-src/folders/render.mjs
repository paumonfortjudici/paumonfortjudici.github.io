// Prints a folder interior: node art-src/folders/render.mjs <slug> [<slug> ...]
// <slug>.mjs (next to this file) exports default () => ({ bg, css, body }) built with ./lib.mjs. Writes _build/<slug>.png (1080 x 1350) and
// _build/<slug>-wide.png (the 3:2 middle band that wide screens show) so both crops can be checked. Prints console / load errors.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from 'playwright-core'
import { page, W, H } from './lib.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const build = path.join(here, '_build')
fs.mkdirSync(build, { recursive: true })
const slugs = process.argv.slice(2).filter((a) => !a.startsWith('--'))
if (!slugs.length) {
  console.log('usage: node art-src/folders/render.mjs <slug>')
  process.exit(1)
}
const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args: ['--allow-file-access-from-files', '--disable-web-security'] })
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })
for (const slug of slugs) {
  const mod = await import(pathToFileURL(path.join(here, `${slug}.mjs`)).href + `?v=${Date.now()}`)
  const file = path.join(build, `${slug}.html`)
  fs.writeFileSync(file, page(mod.default()))
  const pg = await ctx.newPage()
  const errs = []
  pg.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 140)))
  pg.on('requestfailed', (r) => errs.push('FAILED ' + r.url().slice(-70)))
  await pg.goto(pathToFileURL(file).href, { waitUntil: 'load' })
  await pg.evaluate(async () => {
    await document.fonts.ready
    await Promise.all([...document.images].map((i) => i.decode().catch(() => {})))
  })
  await pg.waitForTimeout(400)
  await pg.screenshot({ path: path.join(build, `${slug}.png`), clip: { x: 0, y: 0, width: W, height: H } })
  await pg.screenshot({ path: path.join(build, `${slug}-wide.png`), clip: { x: 0, y: 315, width: W, height: 720 } })
  console.log(slug, 'done', errs.length ? JSON.stringify(errs) : '')
  await pg.close()
}
await browser.close()
