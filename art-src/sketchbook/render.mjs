// Prints the pages of the sketchbook: node art-src/sketchbook/render.mjs [id ...]   (no id = every page)
// pages.mjs exports PAGES = [{ id, html }]; each is written to _build/<id>.png (1200 x 1600). export.py turns them into WebP.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from 'playwright-core'
import { W, H } from './lib.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const build = path.join(here, '_build')
fs.mkdirSync(build, { recursive: true })
const only = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const { PAGES } = await import(pathToFileURL(path.join(here, 'pages.mjs')).href + `?v=${Date.now()}`)
const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args: ['--allow-file-access-from-files', '--disable-web-security'] })
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })
for (const p of PAGES) {
  if (only.length && !only.includes(p.id)) continue
  const file = path.join(build, `${p.id}.html`)
  fs.writeFileSync(file, p.html())
  const pg = await ctx.newPage()
  const errs = []
  pg.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 140)))
  pg.on('requestfailed', (r) => errs.push('FAILED ' + r.url().slice(-70)))
  await pg.goto(pathToFileURL(file).href, { waitUntil: 'load' })
  await pg.evaluate(async () => {
    await document.fonts.ready
    await Promise.all([...document.images].map((i) => i.decode().catch(() => {})))
  })
  await pg.waitForTimeout(250)
  await pg.screenshot({ path: path.join(build, `${p.id}.png`), clip: { x: 0, y: 0, width: W, height: H } })
  console.log(p.id, 'done', errs.length ? JSON.stringify(errs) : '')
  await pg.close()
}
await browser.close()
