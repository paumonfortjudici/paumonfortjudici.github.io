// Shared helpers for illustrator A's slide builders (slides 1 and 2). Pure JS, no deps.
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

export const ROOT = 'C:/Users/User/Documents/Portofolio'
export const SRC = `${ROOT}/art-src/concept-portfolio`
export const KIT = `${SRC}/kit`
export const SC = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-Documents-Portofolio/0908f779-4789-499a-9f74-ecb97a4d3b2d/scratchpad'

// ---------- numbers / PRNG ----------
export const r1 = (n) => (Math.round(n * 10) / 10).toString()
export const r2 = (n) => (Math.round(n * 100) / 100).toString()
export function rng(seed) {
  let a = seed >>> 0
  const f = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  f.range = (lo, hi) => lo + (hi - lo) * f()
  f.int = (lo, hi) => Math.floor(lo + (hi - lo + 1) * f())
  f.sign = () => (f() < 0.5 ? -1 : 1)
  f.pick = (arr) => arr[Math.floor(f() * arr.length)]
  return f
}

// ---------- vectors ----------
export const add = (a, b) => [a[0] + b[0], a[1] + b[1]]
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1]]
export const mul = (a, k) => [a[0] * k, a[1] * k]
export const len = (a) => Math.hypot(a[0], a[1])
export const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l] }
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1]
export const rot = (v, deg) => { const c = Math.cos((deg * Math.PI) / 180), s = Math.sin((deg * Math.PI) / 180); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c] }
export const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
export const P = (p) => `${r1(p[0])} ${r1(p[1])}`

// ---------- cubic bezier outline sampling ----------
// segs: array of [p0,c1,c2,p3] cubic segments forming a (closed) outline
export function cubicAt(s, t) {
  const [p0, c1, c2, p3] = s, u = 1 - t
  return [
    u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p3[1],
  ]
}
export function polyFromSegs(segs, steps = 40) {
  const pts = []
  segs.forEach((s, i) => { for (let k = i === 0 ? 0 : 1; k <= steps; k++) pts.push(cubicAt(s, k / steps)) })
  return pts
}
// resample polyline at equal arc length; returns [{p, n(outward normal for ccw-in-screen?), t}] computed by caller
export function polyLen(pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += len(sub(pts[i], pts[i - 1])); return L }
export function pointAtLen(pts, s, closed = false) {
  const total = polyLen(pts) + (closed ? len(sub(pts[0], pts[pts.length - 1])) : 0)
  if (closed) s = ((s % total) + total) % total
  let acc = 0
  const n = pts.length
  const m = closed ? n : n - 1
  for (let i = 0; i < m; i++) {
    const a = pts[i], b = pts[(i + 1) % n]
    const d = len(sub(b, a))
    if (acc + d >= s) {
      const t = d ? (s - acc) / d : 0
      return { p: lerp(a, b, t), tan: norm(sub(b, a)), i }
    }
    acc += d
  }
  const a = pts[n - 2], b = pts[n - 1]
  return { p: b, tan: norm(sub(b, a)), i: n - 2 }
}

// ---------- svg helpers ----------
export function pathEl(d, attrs = "") { return `<path d="${d}"${attrs ? " " + attrs : ""}/>` }
export function polyD(pts, close = true) { return 'M' + pts.map(P).join('L') + (close ? 'Z' : '') }
// smooth closed blob through points (Catalmull-Rom -> cubic)
export function smoothD(pts, closed = true, tension = 0.5) {
  const n = pts.length
  const g = (i) => pts[(i + n) % n]
  let d = `M${P(pts[0])}`
  const lim = closed ? n : n - 1
  for (let i = 0; i < lim; i++) {
    const p0 = closed ? g(i - 1) : pts[Math.max(i - 1, 0)], p1 = g(i), p2 = g(i + 1), p3 = closed ? g(i + 2) : pts[Math.min(i + 2, n - 1)]
    const c1 = add(p1, mul(sub(p2, p0), tension / 3)), c2 = sub(p2, mul(sub(p3, p1), tension / 3))
    d += `C${P(c1)} ${P(c2)} ${P(p2)}`
  }
  return d + (closed ? 'Z' : '')
}

// ---------- slide assembly ----------
export function readTemplate() { return fs.readFileSync(`${KIT}/slide-template.svg`, 'utf8') }
export function fillLayer(svg, id, inner) {
  const re = new RegExp(`<g id="${id}">[\\s\\S]*?</g>`)
  if (!re.test(svg)) throw new Error('layer not found: ' + id)
  return svg.replace(re, () => `<g id="${id}">\n${inner}\n</g>`)
}
export function buildSlide({ n, field = '#007E9B', speckOpacity = 0.7, layers, extraDefs = '', title }) {
  let svg = readTemplate()
  svg = svg.replace(/<g id="bg">[\s\S]*?<\/g>/, () => `<g id="bg">\n${layers.bg ?? `<rect id="field" width="1080" height="1920" fill="${field}"/>`}\n</g>`)
  svg = svg.replace(/<rect id="speck"[^>]*\/>/, () => `<rect id="speck" width="1080" height="1920" filter="url(#f-speck)" opacity="${speckOpacity}"/>`)
  for (const id of ['art-back', 'art', 'type', 'art-front', 'chrome']) svg = fillLayer(svg, id, layers[id] ?? '')
  if (title) svg = svg.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
  if (extraDefs) svg = svg.replace('<!--KIT:END-->', () => `<!--KIT:END-->\n<defs id="slide-defs">\n${extraDefs}\n</defs>`)
  const out = `${SRC}/slide-${n}.svg`
  fs.writeFileSync(out, svg)
  execFileSync('node', [`${KIT}/inline-kit.mjs`, out], { stdio: 'inherit' })
  return out
}
export function render(svgPath, outPng, scale = 1, extra = []) {
  fs.mkdirSync(path.dirname(outPng), { recursive: true })
  const out = execFileSync('node', [`${ROOT}/tools/render-svg.mjs`, '--in', svgPath, '--out', outPng, '--scale', String(scale), ...extra], { cwd: ROOT, encoding: 'utf8' })
  return out
}
export function trail(x0, y0, x1, y1, n, opt = {}) {
  const a = ['--w', opt.w ?? 46, '--h', opt.h ?? 120, '--fill', opt.fill ?? '#1B6885', '--op', opt.op ?? 0.9, '--gap', opt.gap ?? 16]
  if (opt.start) a.push('--start', opt.start)
  return execFileSync('node', [`${KIT}/trail.mjs`, x0, y0, x1, y1, n, ...a].map(String), { encoding: 'utf8' }).trim()
}
export const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
