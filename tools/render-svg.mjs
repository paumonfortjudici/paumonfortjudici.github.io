// Render an SVG (or an HTML page) to PNG with real Chrome, optionally with a transparent background.
// Usage: node tools/render-svg.mjs --in art-src/x/sticker.svg --out out.png [--scale 2] [--transparent] [--bg "#fff"] [--width 1200] [--selector "#board"]
//  - For an .svg the viewport is sized from the root width/height (or viewBox) * (--width / natural width if given).
//  - For .html the page is loaded as is (use --selector to screenshot one element, otherwise the full page).
//  - Local fonts: inside the SVG/HTML use @font-face with url(file:///...) pointing at woff2 files (e.g. in node_modules/@fontsource).
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true])
    return acc
  }, []),
)
if (!args.in || !args.out) {
  console.error('Usage: node tools/render-svg.mjs --in file.svg|html --out file.png [--scale 2] [--transparent] [--bg "#fff"] [--width N] [--selector css]')
  process.exit(2)
}
const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].find((p) => fs.existsSync(p))
const input = path.resolve(args.in)
const isSvg = input.toLowerCase().endsWith('.svg')
const scale = Number(args.scale || 1)

const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const context = await browser.newContext({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: scale })
const page = await context.newPage()
const problems = []
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text().slice(0, 300)) })
page.on('pageerror', (e) => problems.push('pageerror: ' + String(e).slice(0, 300)))
page.on('requestfailed', (r) => problems.push('requestfailed: ' + r.url().slice(0, 160)))
await page.goto(pathToFileURL(input).href, { waitUntil: 'load' })
await page.evaluate(() => document.fonts && document.fonts.ready)

if (isSvg) {
  const size = await page.evaluate(() => {
    const s = document.documentElement
    const vb = s.viewBox && s.viewBox.baseVal
    const w = s.width.baseVal.value || (vb && vb.width) || 1000
    const h = s.height.baseVal.value || (vb && vb.height) || 1000
    return { w, h }
  })
  let { w, h } = size
  if (args.width) { const k = Number(args.width) / w; w = Number(args.width); h = Math.round(h * k) }
  await page.setViewportSize({ width: Math.round(w), height: Math.round(h) })
  if (args.width) await page.evaluate(({ w, h }) => { const s = document.documentElement; s.setAttribute('width', w); s.setAttribute('height', h) }, { w, h })
}
if (args.bg && args.bg !== true) await page.evaluate((bg) => { document.body ? (document.body.style.background = bg) : (document.documentElement.style.background = bg) }, args.bg)
await page.waitForTimeout(250)
fs.mkdirSync(path.dirname(path.resolve(args.out)), { recursive: true })
if (args.selector) await (await page.$(args.selector)).screenshot({ path: args.out, omitBackground: !!args.transparent })
else await page.screenshot({ path: args.out, omitBackground: !!args.transparent, fullPage: !isSvg })
await browser.close()
console.log(JSON.stringify({ out: args.out, scale, problems }))
