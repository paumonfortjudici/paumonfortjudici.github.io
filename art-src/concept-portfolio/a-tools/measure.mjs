// measure text widths in Chrome with the kit fonts:  node art-src/concept-portfolio/a-tools/measure.mjs
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import { KIT, SC } from './lib.mjs'
import { pathToFileURL } from 'node:url'
const fontsCss = fs.readFileSync(`${KIT}/fonts.css`, 'utf8')
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find((p) => fs.existsSync(p))
const b = await chromium.launch({ executablePath: CHROME, headless: true })
const p = await b.newPage()
const html = `${SC}/art/concept-portfolio/measure.html`
fs.writeFileSync(html, `<!doctype html><style>${fontsCss}</style><svg xmlns="http://www.w3.org/2000/svg" width="1200" height="200"><text id="t" x="0" y="100" style="font-family:Syne;font-weight:700;letter-spacing:.1em"></text></svg>`)
await p.goto(pathToFileURL(html).href)
await p.evaluate(() => document.fonts.load('700 20px Syne'))
await p.evaluate(() => document.fonts.ready)
const strs = ['CELERY · BONES', 'CELLOPHANE · FIRE', 'WATERMELON · HEADS', 'CABBAGE · STABS', 'UMBRELLA · WINGS']
for (const fs_ of [18, 19, 20]) {
  const out = await p.evaluate(({ strs, fs_ }) => strs.map((s) => { const t = document.getElementById('t'); t.setAttribute('font-size', fs_); t.textContent = s; return [s, Math.round(t.getComputedTextLength() * 10) / 10] }), { strs, fs_ })
  console.log(fs_, JSON.stringify(out))
}
await b.close()
