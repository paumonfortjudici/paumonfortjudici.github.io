// check-sticker.mjs - one-command QA for a doodle sticker.
//   node art-src/illustration/kit/check-sticker.mjs art-src/illustration/sticker-01.svg [--png out.png] [--scale 1]
// Renders the SVG with real Chrome on a transparent background and verifies the series rules:
//   * canvas 1200 x 1600, transparent corners, nothing cut off
//   * die-cut (halo) edge >= 60 px from every canvas edge, ink >= 90 px, figure fills >= 78 % of the height
//   * ink budget: ink <= 32 % of the die-cut, solid ink masses 8-18 % (reference: 22.9 % / 12.1 %; pilot: 28 % / 12.9 %)
//   * no external references, no <image>, no <text>/fonts, unique ids, no dangling #refs, size < 200 KB
// Exit code 1 when a rule fails, so it can be used in a loop while drawing.
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import zlib from 'node:zlib'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const argv = process.argv.slice(2)
const flag = (n, d) => { const i = argv.indexOf('--' + n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d }
const input = argv.find((a) => !a.startsWith('--') && a.toLowerCase().endsWith('.svg'))
if (!input) { console.error('usage: node check-sticker.mjs sticker.svg [--png out.png] [--scale 1]'); process.exit(2) }
const scale = Number(flag('scale', 1))
const outPng = flag('png', '')

// ---- minimal PNG decoder (8-bit RGB / RGBA, non-interlaced: what Chrome writes)
function decodePng(buf) {
  let p = 8, w = 0, h = 0, ct = 6; const idat = []
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), type = buf.toString('ascii', p + 4, p + 8), data = buf.subarray(p + 8, p + 8 + len)
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); ct = data[9] }
    else if (type === 'IDAT') idat.push(data)
    p += 12 + len
  }
  const ch = ct === 6 ? 4 : 3
  const raw = zlib.inflateSync(Buffer.concat(idat)), stride = w * ch, out = Buffer.alloc(w * h * 4)
  let prev = Buffer.alloc(stride)
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)))
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? line[x - ch] : 0, b = prev[x], c = x >= ch ? prev[x - ch] : 0
      let v = line[x]
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1
      else if (f === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c }
      line[x] = v & 255
    }
    for (let x = 0; x < w; x++) { const o = (y * w + x) * 4; out[o] = line[x * ch]; out[o + 1] = line[x * ch + 1]; out[o + 2] = line[x * ch + 2]; out[o + 3] = ch === 4 ? line[x * ch + 3] : 255 }
    prev = line
  }
  return { w, h, data: out }
}

const svgPath = path.resolve(input)
const svg = fs.readFileSync(svgPath, 'utf8')
const results = []
const check = (name, ok, detail = '') => results.push({ name, ok, detail })

// ---- static checks
const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])
const dup = ids.filter((v, i) => ids.indexOf(v) !== i)
const refs = [...svg.matchAll(/(?:href|xlink:href)="#([^"]+)"/g)].map((m) => m[1]).concat([...svg.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]))
const dangling = [...new Set(refs.filter((r) => !ids.includes(r)))]
check('canvas 1200x1600', /width="1200"/.test(svg) && /height="1600"/.test(svg) && /viewBox="0 0 1200 1600"/.test(svg))
check('unique ids', dup.length === 0, dup.join(','))
check('no dangling references', dangling.length === 0, dangling.join(','))
check('no external references', !/(?:href|xlink:href)="(?!#|data:)/.test(svg) && !/url\((?!#|data:)/.test(svg) && !/@import/.test(svg))
check('no <image>', !/<image\b/.test(svg))
check('no <text> / fonts', !/<text\b/.test(svg) && !/font-family/.test(svg))
check('no gradients', !/<(linear|radial)Gradient/.test(svg))
check('size < 200 KB', svg.length < 200 * 1024, (svg.length / 1024).toFixed(1) + ' KB')

// ---- render + pixel checks
const CHROME = ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'].find((p) => fs.existsSync(p))
const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const page = await (await browser.newContext({ viewport: { width: 1200, height: 1600 }, deviceScaleFactor: scale })).newPage()
await page.goto(pathToFileURL(svgPath).href, { waitUntil: 'load' })
await page.waitForTimeout(250)
const png = await page.screenshot({ omitBackground: true })
await browser.close()
if (outPng) fs.writeFileSync(outPng, png)
const { w, h, data } = decodePng(png)
let x0 = w, x1 = -1, y0 = h, y1 = -1, ix0 = w, ix1 = -1, iy0 = h, iy1 = -1, covered = 0
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const o = (y * w + x) * 4, a = data[o + 3]
    if (a > 20) { covered++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y }
    if (a > 200 && data[o] + data[o + 1] + data[o + 2] < 120) { if (x < ix0) ix0 = x; if (x > ix1) ix1 = x; if (y < iy0) iy0 = y; if (y > iy1) iy1 = y }
  }
}
const k = scale
const m = { L: x0 / k, R: (w - 1 - x1) / k, T: y0 / k, B: (h - 1 - y1) / k }
const im = { L: ix0 / k, R: (w - 1 - ix1) / k, T: iy0 / k, B: (h - 1 - iy1) / k }
const corners = [0, (w - 1) * 4, (h - 1) * w * 4, ((h - 1) * w + w - 1) * 4].map((o) => data[o + 3])
const f = (o) => `L${o.L.toFixed(0)} R${o.R.toFixed(0)} T${o.T.toFixed(0)} B${o.B.toFixed(0)}`
check('transparent corners', corners.every((a) => a === 0))
check('die-cut >= 60 px from every edge', Math.min(m.L, m.R, m.T, m.B) >= 60, f(m))
check('ink >= 90 px from every edge', Math.min(im.L, im.R, im.T, im.B) >= 90, f(im))
check('figure fills >= 78 % of the height', (y1 - y0) / k >= 0.78 * 1600, `${(((y1 - y0) / k) / 16).toFixed(1)} %`)
check('die-cut fills 40-70 % of the canvas', covered / (w * h) > 0.4 && covered / (w * h) < 0.7, `${((covered / (w * h)) * 100).toFixed(1)} %`)

// ---- ink budget: share of ink pixels in the die-cut, and the part that is a solid mass (min run length >= 21 px) rather than line
const inkMask = new Uint8Array(w * h)
for (let i = 0; i < w * h; i++) { const o = i * 4; inkMask[i] = data[o + 3] > 200 && data[o] + data[o + 1] + data[o + 2] < 150 ? 1 : 0 }
const rh = new Int16Array(w * h), rv = new Int16Array(w * h)
for (let y = 0; y < h; y++) { let x = 0; while (x < w) { if (inkMask[y * w + x]) { const s0 = x; while (x < w && inkMask[y * w + x]) x++; for (let q = s0; q < x; q++) rh[y * w + q] = x - s0 } else x++ } }
for (let x = 0; x < w; x++) { let y = 0; while (y < h) { if (inkMask[y * w + x]) { const s0 = y; while (y < h && inkMask[y * w + x]) y++; for (let q = s0; q < y; q++) rv[q * w + x] = y - s0 } else y++ } }
let inkPx = 0, solidPx = 0
const thick = 21 * k
for (let i = 0; i < w * h; i++) if (inkMask[i]) { inkPx++; if (Math.min(rh[i], rv[i]) >= thick) solidPx++ }
const inkShare = (inkPx / covered) * 100, solidShare = (solidPx / covered) * 100
check('ink budget: total ink <= 32 % of the die-cut', inkShare <= 32, `${inkShare.toFixed(1)} % (lines ${(inkShare - solidShare).toFixed(1)} %)`)
check('solid ink masses 8-18 % of the die-cut', solidShare >= 8 && solidShare <= 18, `${solidShare.toFixed(1)} %`)

let bad = 0
for (const r of results) { if (!r.ok) bad++; console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? '  (' + r.detail + ')' : ''}`) }
console.log(bad ? `\n${bad} rule(s) failed` : '\nall rules pass')
process.exit(bad ? 1 : 0)
