// Generates kit/titles.svg with OPTICALLY SPACED display lockups (finisher pass; replaces the flat-tracking output of gen-titles.mjs).
//
// Why: gen-titles.mjs positions every letter by its font advance + a flat 0.012 em tracking. With per-letter widths from 50 to 150 the
// side bearings change a lot, so some pairs touched or merged ("ERIENCE", "NIN", "ANKS", "RIB") while others had air ("LIS T ENING").
// Here every pair is spaced from the real ink silhouettes of the two glyphs (rendered in Chrome with the same Anybody variable font):
//   - the AREA gap (mean row gap, open rows clamped) is the same for every pair of letters   -> even colour, round next to straight tucks in a little
//   - the MINIMUM gap never goes below a floor (a fraction of cap height)                    -> diagonals (A, V, T, Y, K, R) never touch, even after the f-type wobble
//   - gaps are proportional to cap height, so all nine lockups share one rhythm at any scale.
// Each lockup keeps the original contract: baseline y=0, INK left edge x=0, INK right edge x=936. The ids and the per-letter widths are unchanged.
//
//   node kit/gen-titles-optical.mjs                      rebuild kit/titles.svg (+ preview board) and print gap / cap-height tables
//   node kit/gen-titles-optical.mjs --out X.svg --inline-fonts   write somewhere else (experiments), fonts inlined so the preview renders anywhere
//   --mean 0.15 --floor 0.10 --word 0.75 --wordfloor 0.6    base rhythm (fractions of cap height); each lockup then scales its in-word gaps so its font size equals the legacy size (--free: no scaling)
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const { chromium } = createRequire(path.resolve(HERE, '../../../package.json'))('playwright-core')
const CHROME = ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'].find((p) => fs.existsSync(p))
const fontsCss = fs.readFileSync(path.join(HERE, 'fonts.css'), 'utf8')

const argv = process.argv.slice(2)
const opt = (name, d) => { const i = argv.indexOf('--' + name); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d }
const MEAN = Number(opt('mean', 0.15)), FLOOR = Number(opt('floor', 0.10)), WORD = Number(opt('word', 0.75)), WORDFLOOR = Number(opt('wordfloor', 0.6))
const OUT = path.resolve(opt('out', path.join(HERE, 'titles.svg')))
const INLINE_FONTS = argv.includes('--inline-fonts')

const FS = 400                   // measuring size (px)
const CAPR = 0.675               // Anybody: capHeight 1350 / unitsPerEm 2000
const CAP = CAPR * FS            // 270
const OX = 150, BASE = 520       // glyph origin inside its measuring cell
const CELL_W = 900, CELL_H = 700
const CLAMP_MUL = 2.4            // an open row counts at most 2.4 x the target gap

// widths: 150 = super wide, 100 = normal, 60 = tall/narrow. RULES: round letters (O C G D Q S B R) >= 90, L >= 60, Y >= 80, K >= 70, I >= 50.
// (same letters and widths as gen-titles.mjs, but NO slot for the space: there the width array had an entry for the space too; here word gaps come from --word / --wordfloor)
const LOCKUPS = [
  // fs = the legacy font size (px at ink width 936): keeping it keeps every cap height, so the slide layouts do not move. word = word gap as a fraction of cap height (legacy values).
  { id: 't-foley', text: 'FOLEY', w: [150, 90, 60, 70, 90], fs: 359.31, use: 'Slide 1 main title' },
  { id: 't-portfolio', text: 'PORTFOLIO', w: [150, 95, 60, 100, 70, 95, 150, 50, 100], fs: 181.22, use: 'Slide 1 second line' },
  { id: 't-im-ona', text: 'I´M ONA', w: [60, 100, 130, 110, 70, 130], fs: 219.08, word: 0.84, use: 'Slide 2 name, line 1 (the acute accent is the hand-set apostrophe)' },
  { id: 't-ribas', text: 'RIBAS', w: [100, 60, 150, 70, 120], fs: 307.89, use: 'Slide 2 name, line 2' },
  { id: 't-projects', text: 'PROJECTS', w: [140, 70, 100, 60, 150, 90, 70, 100], fs: 192.89, use: 'Slide 3 title' },
  { id: 't-experience', text: 'EXPERIENCE', w: [150, 70, 150, 60, 70, 50, 60, 100, 70, 150], fs: 171.12, use: 'Slide 4 title' },
  { id: 't-education', text: '& EDUCATION', w: [100, 150, 100, 80, 90, 70, 130, 50, 100, 80], fs: 142.47, word: 0.70, use: 'Slide 4 second line (small)' },
  { id: 't-thanks-for', text: 'THANKS FOR', w: [90, 150, 70, 90, 70, 80, 150, 100, 70], fs: 156.59, word: 0.72, use: 'Slide 5 line 1' },
  { id: 't-listening', text: 'LISTENING', w: [150, 50, 90, 130, 70, 70, 50, 100, 120], fs: 191.5, use: 'Slide 5 line 2' },
]
// per-lockup overrides for the generated widths can be edited in the table above; WIDTHS_JSON lets an experiment replace it
const extra = opt('widths', null)
if (extra) { const o = JSON.parse(fs.readFileSync(path.resolve(extra), 'utf8')); for (const l of LOCKUPS) if (o[l.id]) l.w = o[l.id] }

const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const page = await (await browser.newContext({ viewport: { width: 1600, height: 900 } })).newPage()
const tmpHtml = path.join(os.tmpdir(), 'ona-gen-titles-optical.html')
fs.writeFileSync(tmpHtml, `<!doctype html><html><head><meta charset="utf-8"><style>${fontsCss}\nbody{margin:0;background:#fff}</style></head><body><div id="s"></div></body></html>`)
await page.goto(pathToFileURL(tmpHtml).href)
await page.evaluate(() => document.fonts.load('600 100px Anybody'))
await page.evaluate(() => document.fonts.ready)

// ---- 1. ink profiles of every distinct (char, width) glyph -------------------------------------------------------------------------------
const need = new Map()
for (const l of LOCKUPS) {
  let wi = 0
  for (const ch of l.text) { if (ch === ' ') continue; const w = l.w[wi++]; need.set(ch + '@' + w, { ch, w }) }
}
const glyphs = [...need.entries()].map(([key, v]) => ({ key, ...v }))
const prof = new Map()
const ROW0 = BASE - Math.round(CAP) - 40, ROW1 = BASE + 40      // rows we keep
for (let b = 0; b < glyphs.length; b += 8) {
  const batch = glyphs.slice(b, b + 8)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CELL_W * batch.length}" height="${CELL_H}" style="background:#fff;display:block"><g font-family="Anybody" font-weight="600" font-size="${FS}" fill="#000">${batch.map((g, i) => `<text x="${i * CELL_W + OX}" y="${BASE}" style="font-stretch:${g.w}%">${g.ch === '&' ? '&amp;' : g.ch}</text>`).join('')}</g></svg>`
  await page.evaluate((s) => { document.getElementById('s').innerHTML = s }, svg)
  await page.evaluate(() => document.fonts.ready)
  const shot = await (await page.$('#s svg')).screenshot({ type: 'png' })
  const out = await page.evaluate(async ({ b64, n, CELL_W, CELL_H, OX, ROW0, ROW1 }) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode()
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height
    const g = c.getContext('2d'); g.drawImage(img, 0, 0)
    const res = []
    for (let i = 0; i < n; i++) {
      const d = g.getImageData(i * CELL_W, 0, CELL_W, CELL_H).data
      const left = [], right = []
      let minX = 1e9, maxX = -1
      for (let y = ROW0; y < ROW1; y++) {
        let l = -1, r = -1
        for (let x = 0; x < CELL_W; x++) if (d[(y * CELL_W + x) * 4] < 128) { if (l < 0) l = x; r = x + 1 }
        left.push(l < 0 ? null : l - OX); right.push(r < 0 ? null : r - OX)
        if (l >= 0) { if (l - OX < minX) minX = l - OX; if (r - OX > maxX) maxX = r - OX }
      }
      res.push({ left, right, minX, maxX })
    }
    return res
  }, { b64: shot.toString('base64'), n: batch.length, CELL_W, CELL_H, OX, ROW0, ROW1 })
  batch.forEach((g, i) => prof.set(g.key, out[i]))
}
await browser.close()

// ---- 1b. --audit <titles.svg>: report the real gaps of an existing kit file (legacy or optical), then exit -------------------------------
const auditFile = opt('audit', null)
if (auditFile) {
  const txt = fs.readFileSync(path.resolve(auditFile), 'utf8')
  const rt = (BASE - Math.round(CAP)) - ROW0, rb = BASE - ROW0
  for (const m of txt.matchAll(/<g id="(t-[\w-]+)"[^>]*font-size="([\d.]+)"[^>]*><text[^>]*>([\s\S]*?)<\/text><\/g>/g)) {
    const fsz = Number(m[2]), k = fsz / FS
    const ts = [...m[3].matchAll(/<tspan x="(-?[\d.]+)" style="font-stretch:(\d+)%">([^<]+)<\/tspan>/g)].map((t) => ({ x: Number(t[1]) / k, w: Number(t[2]), ch: t[3] === '&amp;' ? '&' : t[3] }))
    const out = []
    for (let i = 1; i < ts.length; i++) {
      const A = ts[i - 1], B = ts[i]
      const pa = prof.get(A.ch + '@' + A.w), pb = prof.get(B.ch + '@' + B.w)
      if (!pa || !pb) { out.push(`${A.ch}${B.ch}:?`); continue }
      let mn = 1e9, sum = 0, n = 0
      for (let y = rt; y <= rb; y++) { const aR = pa.right[y], bL = pb.left[y]; if (aR != null && bL != null) { const g = (B.x + bL) - (A.x + aR); mn = Math.min(mn, g); sum += Math.min(Math.max(g, 0), 60); n++ } }
      out.push(`${A.ch}${B.ch}:${(mn * k).toFixed(0)}/${((sum / n) * k).toFixed(0)}`)
    }
    console.log(m[1].padEnd(14), 'cap', (CAPR * fsz).toFixed(0).padStart(4), ' min/mean gap px:', out.join(' '))
  }
  process.exit(0)
}

// ---- 2. pair spacing ----------------------------------------------------------------------------------------------------------------------
// rows that count: the cap-height band (a little extra for round overshoot is ignored on purpose)
const rowTop = (BASE - Math.round(CAP)) - ROW0, rowBot = BASE - ROW0       // indices into the profile arrays
function solvePair(A, B, mean, floor, clamp) {
  let dMin = -1e9, any = false
  const rows = []
  for (let y = rowTop; y <= rowBot; y++) {
    const aR = A.right[y], bL = B.left[y]
    if (aR != null && bL != null) { rows.push([aR, bL]); dMin = Math.max(dMin, floor - (bL - aR)); any = true } else rows.push(null)
  }
  if (!any) return 0
  const meanAt = (d) => { let s = 0; for (const r of rows) s += r ? Math.min(Math.max(d + r[1] - r[0], 0), clamp) : clamp; return s / rows.length }
  let lo = -2000, hi = 2000
  for (let it = 0; it < 60; it++) { const mid = (lo + hi) / 2; if (meanAt(mid) < mean) lo = mid; else hi = mid }
  return Math.max(dMin, hi)
}

function layout(spec, sc = 1) {
  const letters = []
  let wi = 0
  for (let i = 0; i < spec.text.length; i++) {
    const ch = spec.text[i]
    if (ch === ' ') { letters.push({ space: true }); continue }
    const w = spec.w[wi++]
    letters.push({ ch, w, p: prof.get(ch + '@' + w) })
  }
  const xs = []
  let prev = null, pendingSpace = false, x = 0
  const placed = []
  for (const L of letters) {
    if (L.space) { pendingSpace = true; continue }
    if (prev) {
      const d = pendingSpace
        ? solvePair(prev.p, L.p, (spec.word ?? WORD) * CAP, (spec.word ? spec.word * 0.85 : WORDFLOOR) * CAP, (spec.word ?? WORD) * CAP * 1.7)
        : solvePair(prev.p, L.p, MEAN * sc * CAP, FLOOR * sc * CAP, MEAN * sc * CAP * CLAMP_MUL)
      x += d
    }
    placed.push({ ...L, x })
    prev = L; pendingSpace = false
  }
  const inkL = Math.min(...placed.map((q) => q.x + q.p.minX)), inkR = Math.max(...placed.map((q) => q.x + q.p.maxX))
  const W = 936, k = W / (inkR - inkL)
  return { placed, inkL, inkR, k }
}

const built = []
const report = []
for (const spec of LOCKUPS) {
  let sc = 1
  if (spec.fs && !argv.includes('--free')) {
    // bigger gaps -> wider word at the same size -> smaller size at ink width 936. Bisect the gap scale until the size equals the legacy size.
    let lo = 0.3, hi = 4
    for (let it = 0; it < 40; it++) { const mid = (lo + hi) / 2; const f = FS * layout(spec, mid).k; if (f > spec.fs) lo = mid; else hi = mid }
    sc = (lo + hi) / 2
  }
  const { placed, inkL, k } = layout(spec, sc)
  const fs2 = FS * k, cap = CAPR * fs2
  const tspans = placed.map((q) => `<tspan x="${((q.x - inkL) * k).toFixed(2)}" style="font-stretch:${q.w}%">${q.ch === '&' ? '&amp;' : q.ch}</tspan>`).join('')
  const g = `<!-- ${spec.id} "${spec.text}"  widths ${spec.w.join(',')}  fs ${fs2.toFixed(1)}  cap height ${cap.toFixed(0)}  ink width 936  optical gaps (mean ${MEAN} / floor ${FLOOR} of cap)  ${spec.use} -->
  <g id="${spec.id}" font-family="Anybody, 'Arial Black', sans-serif" font-weight="600" font-size="${fs2.toFixed(2)}"><text x="0" y="0">${tspans}</text></g>`
  built.push({ spec, g, fs: fs2, cap })
  // report: real minimum gap per pair in final px
  const gaps = []
  for (let i = 1; i < placed.length; i++) {
    const A = placed[i - 1], B = placed[i]
    let mn = 1e9
    for (let y = rowTop; y <= rowBot; y++) { const aR = A.p.right[y], bL = B.p.left[y]; if (aR != null && bL != null) mn = Math.min(mn, (B.x + bL) - (A.x + aR)) }
    gaps.push(`${A.ch}${B.ch}:${(mn * k).toFixed(0)}`)
  }
  report.push(`${spec.id.padEnd(14)} fs ${fs2.toFixed(1).padStart(6)}  cap ${cap.toFixed(0).padStart(4)}  gap scale ${sc.toFixed(2)} (floor ${(FLOOR * sc).toFixed(3)} / mean ${(MEAN * sc).toFixed(3)} of cap)  min gaps(px) ${gaps.join(' ')}`)
}

// ---- 3. write the kit file (same layout as gen-titles.mjs) + preview board ----------------------------------------------------------------
let y = 40, prev = ''
for (const b of built) {
  prev += `<use href="#${b.spec.id}" x="72" y="${(y + b.cap).toFixed(0)}" fill="#FDEFAF"/>\n<text x="72" y="${(y + b.cap + 28).toFixed(0)}" font-family="sans-serif" font-size="16" fill="#BFE3EA">${b.spec.id}  fs ${b.fs.toFixed(0)}  cap ${b.cap.toFixed(0)}  (width 936)</text>\n`
  y += b.cap + 64
}
const H = Math.ceil(y + 20)
const defs = built.map((b) => b.g).join('\n  ')
const style = INLINE_FONTS ? `<style><![CDATA[${fontsCss}]]></style>` : '<style>@import url("fonts.css");</style>'
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="${H}" viewBox="0 0 1080 ${H}">
<title>Ona Ribas concept portfolio - kit/titles.svg</title>
<!-- GENERATED by kit/gen-titles-optical.mjs (optical spacing) - edit the LOCKUPS table there, not this file.
     Each lockup: baseline at y=0, INK left edge at x=0, INK right edge at x=936 (nominal). Reserved ids: t-*.
     <use href="#t-foley" x="72" y="BASELINE" fill="#FDEFAF"/>   or   transform="translate(72 BASELINE) scale(k)" for width 936*k (cap height = nominal cap * k).
     Colour comes from fill= on the <use>. Fonts: kit/fonts.css (Anybody wght 600, one font-stretch value per letter). -->
${style}
<defs id="kit-titles">
  ${defs}
</defs>
<rect width="1080" height="${H}" fill="#007E9B"/>
${prev}</svg>
`
fs.writeFileSync(OUT, svg)
console.log('wrote', OUT)
console.log(report.join('\n'))
