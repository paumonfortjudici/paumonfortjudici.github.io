// Generates kit/titles.svg : pre-measured DISPLAY lockups (Anybody 600, a different width axis value per letter).
// Each lockup is a <g id="t-..."> whose baseline is y=0, whose INK left edge is x=0 and whose INK right edge is x=936 (nominal).
// Use:   <use href="#t-foley" x="72" y="BASELINE_Y" fill="#FDEFAF"/>                         -> 936 wide, aligned to the 72 px margin
//        <use href="#t-foley" transform="translate(72 BASELINE_Y) scale(0.75)" fill="..."/>  -> any uniform scale k: width 936k, cap height capNominal*k
// Ad-hoc lockup:  node kit/gen-titles.mjs --text "CRUNCH" --w 150,80,100,60,120,90 --width 520 [--wght 800] [--id t-crunch]  -> prints a <g> snippet
// Rebuild the file:  node kit/gen-titles.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import os from 'node:os'
import { pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const { chromium } = createRequire(path.resolve(HERE, '../../../package.json'))('playwright-core')
const CHROME = ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'].find((p) => fs.existsSync(p))
const fontsCss = fs.readFileSync(path.join(HERE, 'fonts.css'), 'utf8')
const CAP = 0.675 // Anybody: capHeight 1350 / unitsPerEm 2000

// widths: 150 = super wide, 100 = normal, 60 = tall/narrow. RULES: round letters (O C G D Q S B R) >= 90, L >= 60, Y >= 80, K >= 70, I >= 50.
const LOCKUPS = [
  { id: 't-foley', text: 'FOLEY', w: [150, 90, 60, 70, 90], use: 'Slide 1 main title' },
  { id: 't-portfolio', text: 'PORTFOLIO', w: [150, 95, 60, 100, 70, 95, 150, 50, 100], use: 'Slide 1 second line' },
  { id: 't-im-ona', text: 'I\u00B4M ONA', w: [60, 100, 130, 60, 110, 70, 130], space: 30, use: 'Slide 2 name, line 1 (the acute accent is the hand-set apostrophe)' },
  { id: 't-ribas', text: 'RIBAS', w: [100, 60, 150, 70, 120], use: 'Slide 2 name, line 2' },
  { id: 't-projects', text: 'PROJECTS', w: [140, 70, 100, 60, 150, 90, 70, 100], use: 'Slide 3 title' },
  { id: 't-experience', text: 'EXPERIENCE', w: [150, 70, 150, 60, 70, 50, 60, 100, 70, 150], use: 'Slide 4 title' },
  { id: 't-education', text: '& EDUCATION', w: [100, 60, 150, 100, 80, 90, 70, 130, 50, 100, 80], space: 24, use: 'Slide 4 second line (small)' },
  { id: 't-thanks-for', text: 'THANKS FOR', w: [90, 150, 70, 90, 70, 80, 60, 150, 100, 70], space: 24, use: 'Slide 5 line 1' },
  { id: 't-listening', text: 'LISTENING', w: [150, 50, 90, 130, 70, 70, 50, 100, 120], use: 'Slide 5 line 2' },
]

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => { if (v.startsWith('--')) a.push([v.slice(2), arr[i + 1]]); return a }, []))
const adhoc = args.text ? [{ id: args.id || 't-custom', text: args.text, w: args.w.split(',').map(Number), width: Number(args.width || 936), wght: Number(args.wght || 600), use: 'ad hoc' }] : null

const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const page = await (await browser.newContext({ viewport: { width: 3600, height: 900 } })).newPage()
const tmpHtml = path.join(os.tmpdir(), 'ona-gen-titles.html')
fs.writeFileSync(tmpHtml, `<!doctype html><html><head><meta charset="utf-8"><style>${fontsCss}
body{margin:0;background:#fff} span{font-family:Anybody;white-space:pre;display:inline-block}</style></head><body><div id="m"></div><div id="s"></div></body></html>`)
await page.goto(pathToFileURL(tmpHtml).href)
await page.evaluate(() => document.fonts.load('600 100px Anybody').then(() => document.fonts.load('800 100px Anybody')))
await page.evaluate(() => document.fonts.ready)

async function measure(text, w, wght, tracking, spaceAdd = 0) {
  // 1. advances at fs=100
  const adv = await page.evaluate(({ text, w, wght }) => {
    const m = document.getElementById('m'); const out = []
    ;[...text].forEach((ch, i) => {
      const s = document.createElement('span'); s.textContent = ch === ' ' ? '\u00A0' : ch
      s.style.fontSize = '100px'; s.style.fontWeight = wght; s.style.fontStretch = (ch === ' ' ? 60 : w[i]) + '%'
      m.appendChild(s); out.push(s.getBoundingClientRect().width); m.removeChild(s)
    })
    return out
  }, { text, w, wght })
  adv.forEach((a, i) => { if (text[i] === ' ') adv[i] = a + spaceAdd })
  // 2. positions at fs=400, render, scan ink
  const fs4 = 400
  const xs = []; let acc = 0
  adv.forEach((a) => { xs.push(acc * 4); acc += a + tracking * 100 })
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="3400" height="700" style="background:#fff"><g font-family="Anybody" font-weight="${wght}" font-size="${fs4}" fill="#000">${[...text].map((ch, i) => ch === ' ' ? '' : `<text x="${(xs[i] + 40).toFixed(2)}" y="520" style="font-stretch:${w[i]}%">${ch === '&' ? '&amp;' : ch}</text>`).join('')}</g></svg>`
  await page.evaluate((svg) => { document.getElementById('s').innerHTML = svg }, svg)
  await page.evaluate(() => document.fonts.ready)
  const shot = await (await page.$('#s svg')).screenshot({ type: 'png' })
  const ink = await page.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode()
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height
    const g = c.getContext('2d'); g.drawImage(img, 0, 0)
    const d = g.getImageData(0, 0, c.width, c.height).data
    let minX = 1e9, maxX = -1, minY = 1e9, maxY = -1
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) { if (d[(y * c.width + x) * 4] < 128) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y } }
    return { minX, maxX: maxX + 1, minY, maxY: maxY + 1 }
  }, shot.toString('base64'))
  return { adv, xs, ink: { l: ink.minX - 40, r: ink.maxX - 40, top: 520 - ink.minY, bottom: ink.maxY - 520 } }
}

async function build(spec) {
  const wght = spec.wght || 600, tracking = spec.tracking ?? 0.012, W = spec.width || 936
  const m = await measure(spec.text, spec.w, wght, tracking, spec.space || 0)
  const inkW400 = m.ink.r - m.ink.l
  const k = W / inkW400                  // scale from fs=400 to final
  const fs = 400 * k
  const tspans = [...spec.text].map((ch, i) => ch === ' ' ? '' : `<tspan x="${((m.xs[i] - m.ink.l) * k).toFixed(2)}" style="font-stretch:${spec.w[i]}%">${ch === '&' ? '&amp;' : ch}</tspan>`).join('')
  const cap = CAP * fs
  const g = `<!-- ${spec.id} "${spec.text}"  widths ${spec.w.join(',')}  fs ${fs.toFixed(1)}  cap height ${cap.toFixed(0)}  ink width ${W}  ${spec.use} -->
  <g id="${spec.id}" font-family="Anybody, 'Arial Black', sans-serif" font-weight="${wght}" font-size="${fs.toFixed(2)}"><text x="0" y="0">${tspans}</text></g>`
  return { g, fs, cap, spec, ink: m.ink, k }
}

const list = adhoc || LOCKUPS
const built = []
for (const spec of list) built.push(await build(spec))
await browser.close()

if (adhoc) { console.log(built[0].g); console.log(`/* cap height ${built[0].cap.toFixed(0)} px, ink width ${adhoc[0].width} px */`); process.exit(0) }

// preview board
let y = 40, prev = ''
for (const b of built) {
  const capH = b.cap
  prev += `<use href="#${b.spec.id}" x="72" y="${(y + capH).toFixed(0)}" fill="#FDEFAF"/>\n<text x="72" y="${(y + capH + 28).toFixed(0)}" font-family="sans-serif" font-size="16" fill="#BFE3EA">${b.spec.id}  fs ${b.fs.toFixed(0)}  cap ${b.cap.toFixed(0)}  (width 936)</text>\n`
  y += capH + 64
}
const H = Math.ceil(y + 20)
const defs = built.map((b) => b.g).join('\n  ')
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="${H}" viewBox="0 0 1080 ${H}">
<title>Ona Ribas concept portfolio - kit/titles.svg</title>
<!-- GENERATED by kit/gen-titles.mjs - edit the LOCKUPS table there, not this file.
     Each lockup: baseline at y=0, INK left edge at x=0, INK right edge at x=936 (nominal). Reserved ids: t-*.
     <use href="#t-foley" x="72" y="BASELINE" fill="#FDEFAF"/>   or   transform="translate(72 BASELINE) scale(k)" for width 936*k (cap height = nominal cap * k).
     Colour comes from fill= on the <use>. Fonts: kit/fonts.css (Anybody wght 600, one font-stretch value per letter). -->
<style>@import url("fonts.css");</style>
<defs id="kit-titles">
  ${defs}
</defs>
<rect width="1080" height="${H}" fill="#007E9B"/>
${prev}</svg>
`
fs.writeFileSync(path.join(HERE, 'titles.svg'), svg)
console.log('wrote kit/titles.svg')
for (const b of built) console.log(b.spec.id.padEnd(14), 'fs', b.fs.toFixed(1).padStart(6), 'cap', b.cap.toFixed(0).padStart(4), 'ink l/r at 400:', b.ink.l, b.ink.r)
