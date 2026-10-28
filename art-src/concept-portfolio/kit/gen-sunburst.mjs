// Generates kit/sunburst.svg : hand-irregular sunbursts, sparkles and onomatopoeia burst badges as <symbol>s.
// Usage: node kit/gen-sunburst.mjs            (rewrites kit/sunburst.svg)
// Every symbol is drawn in a 1000x1000 box centred on 0,0 (viewBox="-500 -500 1000 1000") and has NO fill of its own:
//   <use href="#sb-9" x="CX-R" y="CY-R" width="2R" height="2R" fill="#F2C62F"/>      (R = radius you want, CX/CY = centre)
// Rotate with transform="rotate(deg CX CY)" on the <use>; mirror with transform="translate(2*CX 0) scale(-1 1)".
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const f2 = (n) => (Math.round(n * 100) / 100).toString()

function rng(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
// Catmull-Rom through points -> cubic Bezier commands (open polyline)
function smoothOpen(pts, tension = 0.5) {
  let d = ''
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2
    const c1 = [p1[0] + ((p2[0] - p0[0]) * tension) / 3 * 2 / 2, p1[1] + ((p2[1] - p0[1]) * tension) / 3 * 2 / 2]
    const c2 = [p2[0] - ((p3[0] - p1[0]) * tension) / 3 * 2 / 2, p2[1] - ((p3[1] - p1[1]) * tension) / 3 * 2 / 2]
    d += `C${f2(c1[0])} ${f2(c1[1])} ${f2(c2[0])} ${f2(c2[1])} ${f2(p2[0])} ${f2(p2[1])}`
  }
  return d
}
function smoothClosed(pts, tension = 0.5) {
  const n = pts.length
  let d = `M${f2(pts[0][0])} ${f2(pts[0][1])}`
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n]
    const c1 = [p1[0] + ((p2[0] - p0[0]) * tension) / 3, p1[1] + ((p2[1] - p0[1]) * tension) / 3]
    const c2 = [p2[0] - ((p3[0] - p1[0]) * tension) / 3, p2[1] - ((p3[1] - p1[1]) * tension) / 3]
    d += `C${f2(c1[0])} ${f2(c1[1])} ${f2(c2[0])} ${f2(c2[1])} ${f2(p2[0])} ${f2(p2[1])}`
  }
  return d + 'Z'
}

// One tapered ray starting inside the hub, ending in a sharp tip.
function rayPath(theta, r0, L, w0, expo, bend, noise, R) {
  const u = [Math.cos(theta), Math.sin(theta)], v = [-u[1], u[0]]
  const K = 7, left = [], right = []
  for (let k = 0; k <= K; k++) {
    const t = k / K
    const r = r0 + (L - r0) * t
    const h = w0 * Math.pow(1 - t, expo)
    const b = bend * L * t * t
    const nl = k === 0 || k === K ? 0 : (R() - 0.5) * noise * L
    const nr = k === 0 || k === K ? 0 : (R() - 0.5) * noise * L
    left.push([u[0] * r + v[0] * (h + b + nl), u[1] * r + v[1] * (h + b + nl)])
    right.push([u[0] * r + v[0] * (-h + b + nr), u[1] * r + v[1] * (-h + b + nr)])
  }
  const first = left[0]
  let d = `M${f2(first[0])} ${f2(first[1])}` + smoothOpen(left) + smoothOpen(right.slice().reverse())
  return d + 'Z'
}

function sunburst({ n, R = 480, hub = 0.09, seed = 1, wFrac = 0.045, expo = 1.15, lenMin = 0.55, lenMax = 1, alt = true, jitter = 5, bend = 0.03, noise = 0.004, rot = 0 }) {
  const rnd = rng(seed)
  let d = ''
  for (let i = 0; i < n; i++) {
    const base = (360 / n) * i + rot + (rnd() - 0.5) * 2 * jitter
    const theta = (base * Math.PI) / 180
    let L
    if (alt) L = (i % 2 === 0 ? lenMax - rnd() * 0.1 : lenMin + rnd() * 0.16) * R
    else L = (lenMin + rnd() * (lenMax - lenMin)) * R
    const w0 = L * wFrac * (0.9 + rnd() * 0.2)
    d += rayPath(theta, -R * 0.03, L, w0, expo, (rnd() - 0.5) * 2 * bend, noise, rnd)
  }
  // irregular hub blob, wound the SAME way as the rays (otherwise nonzero fill leaves holes)
  const hp = []
  const HN = 9
  for (let i = 0; i < HN; i++) {
    const a = -((i / HN) * Math.PI * 2 + rnd() * 0.2)
    const rr = R * hub * (0.86 + rnd() * 0.28)
    hp.push([Math.cos(a) * rr, Math.sin(a) * rr])
  }
  d += smoothClosed(hp)
  return d
}

// 4-point twinkle (concave diamond), slightly irregular
function sparkle({ R = 480, seed = 3, lens = [1, 0.7, 1, 0.7], pinch = 0.13, rot = 0 }) {
  const rnd = rng(seed)
  const a = rot * Math.PI / 180
  const tip = (i) => {
    const ang = i * Math.PI / 2 - Math.PI / 2 + a + (rnd() - 0.5) * 0.05
    const L = R * lens[i] * (0.97 + rnd() * 0.06)
    return [Math.cos(ang) * L, Math.sin(ang) * L]
  }
  const T = [tip(0), tip(1), tip(2), tip(3)]
  const mid = (p, q) => {
    // control point near the centre, on the bisector between tips p and q, pushed slightly off-centre for a hand feel
    const ax = (p[0] + q[0]) / 2, ay = (p[1] + q[1]) / 2
    const len = Math.hypot(ax, ay) || 1
    const k = (pinch * R) / len * (0.9 + rnd() * 0.2)
    return [ax * k, ay * k]
  }
  let d = `M${f2(T[0][0])} ${f2(T[0][1])}`
  for (let i = 0; i < 4; i++) {
    const p = T[i], q = T[(i + 1) % 4], c = mid(p, q)
    d += `Q${f2(c[0])} ${f2(c[1])} ${f2(q[0])} ${f2(q[1])}`
  }
  return d + 'Z'
}

// rounded zig-zag badge for onomatopoeia
function burst({ n = 15, R = 480, inner = 0.76, seed = 2, jitter = 0.05, round = 26 }) {
  const rnd = rng(seed)
  const pts = []
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 + (rnd() - 0.5) * 0.05
    const rr = R * (i % 2 === 0 ? 0.96 + rnd() * 0.06 : inner * (1 + (rnd() - 0.5) * 2 * jitter * 3))
    pts.push([Math.cos(a) * rr, Math.sin(a) * rr * (0.94 + (i % 7) * 0.003)])
  }
  // rounded corners with quadratic curves
  const m = pts.length
  let d = ''
  for (let i = 0; i < m; i++) {
    const p0 = pts[(i - 1 + m) % m], p1 = pts[i], p2 = pts[(i + 1) % m]
    const l1 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), l2 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1])
    const r1 = Math.min(round, l1 / 2.4), r2 = Math.min(round, l2 / 2.4)
    const a = [p1[0] + ((p0[0] - p1[0]) * r1) / l1, p1[1] + ((p0[1] - p1[1]) * r1) / l1]
    const b = [p1[0] + ((p2[0] - p1[0]) * r2) / l2, p1[1] + ((p2[1] - p1[1]) * r2) / l2]
    d += (i === 0 ? 'M' : 'L') + `${f2(a[0])} ${f2(a[1])}Q${f2(p1[0])} ${f2(p1[1])} ${f2(b[0])} ${f2(b[1])}`
  }
  return d + 'Z'
}

// regular scalloped seal (a circle made of n round bumps)
function seal({ n = 16, R = 480, bump = 0.06 }) {
  const rnd = rng(12)
  const pts = []
  const M = n * 8
  for (let i = 0; i < M; i++) {
    const a = (i / M) * Math.PI * 2
    const rr = R * (1 - bump + bump * Math.abs(Math.sin((a * n) / 2)) * (1 + (rnd() - 0.5) * 0.02))
    pts.push([Math.cos(a) * rr, Math.sin(a) * rr])
  }
  return smoothClosed(pts, 0.6)
}

const symbols = [
  { id: 'sb-9', note: 'classic: 9 rays, long/short alternating (default burst)', d: sunburst({ n: 9, seed: 4, wFrac: 0.072, lenMin: 0.5, lenMax: 1, jitter: 5, expo: 1.05, hub: 0.1 }) },
  { id: 'sb-12', note: 'spiky: 12 slim rays with more length variety', d: sunburst({ n: 12, seed: 11, wFrac: 0.05, lenMin: 0.48, lenMax: 1, jitter: 4, alt: false, hub: 0.08, expo: 1.1 }) },
  { id: 'sb-7', note: 'chunky: 7 broad rays (large, behind characters)', d: sunburst({ n: 7, seed: 8, wFrac: 0.095, lenMin: 0.6, lenMax: 1, jitter: 7, expo: 0.95, hub: 0.12 }) },
  { id: 'sb-10', note: 'wide-open: 10 rays, uneven lengths (use half off-canvas)', d: sunburst({ n: 10, seed: 21, wFrac: 0.062, lenMin: 0.42, lenMax: 1, jitter: 6, alt: false, hub: 0.09, bend: 0.04, expo: 1.05 }) },
  { id: 'sp-4', note: 'twinkle: 4-point, tall', d: sparkle({ seed: 3, lens: [1, 0.68, 1, 0.68], pinch: 0.12 }) },
  { id: 'sp-4s', note: 'twinkle: 4-point, squat', d: sparkle({ seed: 9, lens: [0.92, 0.86, 0.8, 0.9], pinch: 0.17, rot: 14 }) },
  { id: 'bst-15', note: 'onomatopoeia badge: 15 points', d: burst({ n: 15, seed: 2 }) },
  { id: 'bst-11', note: 'onomatopoeia badge: 11 bigger points', d: burst({ n: 11, seed: 5, inner: 0.7, round: 34 }) },
  { id: 'bst-seal', note: 'round seal: 16 scallops (stamp / circular-text badge)', d: seal({ n: 16 }) },
]

const defs = symbols
  .map((s) => `  <!-- ${s.id}: ${s.note} -->\n  <symbol id="${s.id}" viewBox="-500 -500 1000 1000" overflow="visible"><path d="${s.d}"/></symbol>`)
  .join('\n')

// preview board
const cells = [
  ['sb-9', 'sb-12', 'sb-7'],
  ['sb-10', 'sp-4', 'sp-4s'],
  ['bst-15', 'bst-11', 'bst-seal'],
]
let prev = ''
cells.forEach((row, r) =>
  row.forEach((id, c) => {
    const cx = 190 + c * 350, cy = 190 + r * 350
    const col = id.startsWith('sb') || id.startsWith('sp') ? '#F2C62F' : '#E8553E'
    prev += `  <use href="#${id}" x="${cx - 160}" y="${cy - 160}" width="320" height="320" fill="${col}"/>\n  <text x="${cx}" y="${cy + 185}" text-anchor="middle" font-size="20" fill="#101820" font-family="sans-serif">${id}</text>\n`
  }),
)

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1100" viewBox="0 0 1080 1100">
<title>Ona Ribas concept portfolio - kit/sunburst.svg</title>
<!-- GENERATED by kit/gen-sunburst.mjs - edit the generator, not this file.
     Symbols are drawn in a 1000x1000 box centred on 0,0 and have no fill: colour them with fill= on the <use>.
     Place:  <use href="#sb-9" x="CX-R" y="CY-R" width="2R" height="2R" fill="#F2C62F"/>   (R = ray length you want)
     Rotate: transform="rotate(deg CX CY)" on the <use>.  Put filter="url(#f-rough-lite)" on a <g> around bursts/sparkles (thin shapes), f-rough on fat badges.
     Reserved ids: sb-*, sp-*, bst-*. -->
<defs id="kit-sunburst">
${defs}
</defs>
<defs>
  <!-- preview only: same as f-rough-lite in texture.svg -->
  <filter id="pv-rough" filterUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1100" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.012 0.016" numOctaves="2" seed="4" result="w"/>
    <feDisplacementMap in="SourceGraphic" in2="w" scale="9" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</defs>
<rect width="1080" height="1100" fill="#FDEFAF"/>
<g filter="url(#pv-rough)">
${prev}</g>
</svg>
`
fs.writeFileSync(path.join(HERE, 'sunburst.svg'), svg)
console.log('wrote kit/sunburst.svg', symbols.length, 'symbols,', svg.length, 'bytes')
