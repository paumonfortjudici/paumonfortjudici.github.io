// Hero fur-blimp microphone for slide 1 (object card 2.9). Generates SVG strings; seeded, so it is reproducible.
// Local frame: nose LEFT, tail RIGHT, centre (0,0), y down. Placed with translate(570 1090) rotate(28).
import { rng, r1, add, sub, mul, len, norm, dot, rot, lerp, P, polyFromSegs, polyLen, pointAtLen, cubicAt, smoothD } from './lib.mjs'

const SEED = 20260211
const CX = 570, CY = 1090, ANG = 28
const toSlide = (p) => { const a = (ANG * Math.PI) / 180; return [CX + p[0] * Math.cos(a) - p[1] * Math.sin(a), CY + p[0] * Math.sin(a) + p[1] * Math.cos(a)] }
const LIGHT = [-0.956, -0.293] // direction toward the light, in the local frame

// ---------- base outline (closed, clockwise on screen: nose -> over the top -> tail -> under the belly) ----------
export const SEGS = [
  [[-430, 0], [-430, -84], [-340, -154], [-240, -154]],       // nose dome (a little narrower than the body)
  [[-240, -154], [-100, -170], [120, -190], [250, -184]],     // back: swells toward the tail
  [[250, -184], [340, -180], [414, -142], [420, -70]],        // tail shoulder
  [[420, -70], [427, -24], [427, 24], [420, 70]],             // blunt tail face
  [[420, 70], [414, 142], [340, 184], [250, 186]],            // tail belly shoulder
  [[250, 186], [110, 194], [-100, 176], [-240, 158]],         // belly
  [[-240, 158], [-340, 158], [-430, 88], [-430, 0]],          // nose dome, bottom
]
const outlinePts = () => polyFromSegs(SEGS, 80)
const hAt = (x) => { // approx half-height of the body at local x
  if (x < -240) return 156 * Math.sqrt(Math.max(0, 1 - Math.pow((x + 240) / 190, 2)))
  if (x > 250) return 186 - (x - 250) * 0.68
  return 154 + (x + 240) * 0.07
}
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

// ---------- fur silhouette: clumps of leaning tufts ----------
function furTufts(seed = SEED) {
  const R = rng(seed)
  const pts = outlinePts()
  const total = polyLen(pts)
  const tufts = []
  const cuts = [0]
  while (cuts[cuts.length - 1] < total - 70) cuts.push(cuts[cuts.length - 1] + R.range(56, 112))
  cuts[cuts.length - 1] = total
  for (let c = 0; c + 1 < cuts.length; c++) {
    const s0 = cuts[c], s1 = cuts[c + 1]
    const k = Math.max(2, Math.round((s1 - s0) / R.range(21, 29)))
    const lean0 = R.range(16, 38)
    const Lmax = R.range(26, 46)
    for (let i = 0; i < k; i++) {
      const jit = (R() - 0.5) * 0.5
      const a = s0 + ((s1 - s0) * (i + (i ? jit : 0))) / k, b = s0 + ((s1 - s0) * (i + 1 + (i + 1 < k ? jit : 0))) / k
      const pa = pointAtLen(pts, a), pb = pointAtLen(pts, Math.min(b, total - 0.01)), pm = pointAtLen(pts, (a + b) / 2)
      const prof = Math.pow(Math.sin((Math.PI * (i + 0.55)) / (k + 0.1)), 0.9)
      let L = 12 + (Lmax - 12) * prof + R.range(-3, 3)
      const tan = pm.tan
      let nrm = [tan[1], -tan[0]]
      if (dot(nrm, pm.p) < 0) nrm = [-nrm[0], -nrm[1]]
      const x = pm.p[0], y = pm.p[1]
      let T = sub([1, 0], mul(nrm, dot([1, 0], nrm)))
      if (len(T) < 0.2) T = [0.3, y >= 0 ? 0.9 : -0.9]
      T = norm(T)
      let lean = lean0 + R.range(-6, 6)
      let bend = 0.26
      const nose = x < -388
      const face = x > 410 && Math.abs(y) < 74
      if (nose) { L = R.range(44, 66); lean += 14; bend = 0.36 }
      let dir = norm(add(mul(nrm, Math.cos((lean * Math.PI) / 180)), mul(T, Math.sin((lean * Math.PI) / 180))))
      if (face) { dir = norm(add(nrm, [0, y > 0 ? 0.35 : -0.35])); L = Math.min(L, 22) }
      const tip = add(pm.p, mul(dir, L))
      const baseDir = norm(sub(pb.p, pa.p))
      const bendv = mul(baseDir, -bend * L)
      const ca = add(lerp(pa.p, tip, 0.5), bendv)
      const cb = add(lerp(tip, pb.p, 0.5), mul(bendv, 0.55))
      tufts.push({ a: pa.p, b: pb.p, tip, ca, cb, nrm, lit: dot(nrm, LIGHT) })
    }
  }
  return tufts
}
function tuftsPath(tufts, off = [0, 0]) {
  let d = ''
  tufts.forEach((t, i) => {
    if (i === 0) d += `M${P(add(t.a, off))}`
    d += `Q${P(add(t.ca, off))} ${P(add(t.tip, off))}Q${P(add(t.cb, off))} ${P(add(t.b, off))}`
  })
  return d + 'Z'
}
function tuftsInk(tufts, seed = SEED + 7) { // ink along the lit side, in runs that stop and restart
  const R = rng(seed)
  const runs = []
  let cur = '', open = false
  tufts.forEach((t) => {
    const lit = t.lit > 0.05 && R() > 0.1
    if (lit) {
      if (!open) { cur += `M${P(t.a)}`; open = true }
      cur += `Q${P(t.ca)} ${P(t.tip)}Q${P(t.cb)} ${P(t.b)}`
      if (R() < 0.11) { runs.push(cur); cur = ''; open = false }
    } else if (open) { runs.push(cur); cur = ''; open = false }
  })
  if (open) runs.push(cur)
  return runs
}
// a small tuft lying over a clamp band: base point B (on the fur), direction d, length L, base width w
function lyingTuft(B, d, L, w) {
  const t = norm(d), n = [-t[1], t[0]]
  const a = add(B, mul(n, -w / 2)), b = add(B, mul(n, w / 2)), tip = add(B, mul(t, L))
  const ca = add(lerp(a, tip, 0.5), mul(n, -w * 0.22)), cb = add(lerp(tip, b, 0.5), mul(n, -w * 0.22))
  return { fill: `M${P(a)}Q${P(ca)} ${P(tip)}Q${P(cb)} ${P(b)}Z`, ink: `M${P(a)}Q${P(ca)} ${P(tip)}Q${P(cb)} ${P(b)}` }
}

// ---------- flow field + fur ticks ----------
function flow(x, y) {
  const rv = [x + 430, y]
  const wNose = smooth(0, 190, 215 - len(rv))
  const h = Math.max(hAt(x), 60)
  const k = Math.min(1, Math.abs(y) / h)
  const body = norm([1, Math.sign(y || 1) * 2.0 * k * k])
  return norm(lerp(body, norm(rv), wNose * 0.85))
}
function furInk(seed = SEED + 1) {
  const R = rng(seed)
  const dashes = []
  const centres = []
  let tries = 0
  while (centres.length < 28 && tries++ < 9000) {
    const x = R.range(-400, 395), y = R.range(-176, 184)
    if (Math.abs(y) > hAt(x) - 30 || Math.abs(x) > 392 - Math.abs(y) * 0.1) continue
    if (Math.abs(x + 258) < 42 || Math.abs(x - 241) < 42) continue
    if (x > 372 && Math.abs(y) < 86) continue
    if (x > 60 && x < 235 && y > 110) continue // under the mount plate
    const sh = dot([x, y], [0.956, 0.293]) / 330
    if (R() > 0.28 + 0.72 * smooth(-0.9, 0.6, sh)) continue
    if (centres.some((c) => len(sub(c, [x, y])) < 66)) continue
    centres.push([x, y])
  }
  centres.forEach((c) => {
    const f = flow(c[0], c[1])
    const k = R.int(3, 4)
    for (let i = 0; i < k; i++) {
      const perp = [-f[1], f[0]]
      const o = add(mul(perp, (i - (k - 1) / 2) * R.range(10, 15)), mul(f, R.range(-8, 8)))
      const p0 = add(c, o)
      const dir = rot(f, R.range(-10, 10))
      const L = R.range(18, 38)
      const bendAmt = R.range(3, 6.5) * (R() < 0.5 ? -1 : 1)
      const p1 = add(p0, mul(dir, L))
      const mid = add(lerp(p0, p1, 0.5), mul([-dir[1], dir[0]], bendAmt))
      dashes.push(`M${P(p0)}Q${P(mid)} ${P(p1)}`)
    }
  })
  const parting = []
  ;[[-170, -100, 96], [60, 80, 100], [300, -40, 70]].forEach(([x0, y0, Ln]) => {
    let p = [x0, y0]
    const pts = [p]
    for (let i = 0; i < 6; i++) { p = add(p, mul(flow(p[0], p[1]), Ln / 6)); pts.push(p) }
    parting.push(smoothD(pts, false, 1))
  })
  const fly = []
  const FR = rng(SEED + 99)
  ;[[-120, -166], [-20, -176], [70, -184], [168, -190], [310, -170], [-300, -150], [-352, 128], [-80, 184]].forEach(([x, y]) => {
    const up = y < 0 ? -1 : 1
    const p0 = [x, y - up * 10]
    const p1 = add(p0, [FR.range(22, 40), up * FR.range(26, 40)])
    const mid = add(lerp(p0, p1, 0.5), [FR.range(-10, 4), up * FR.range(4, 12)])
    fly.push(`M${P(p0)}Q${P(mid)} ${P(p1)}`)
  })
  return { dashes, parting, fly, count: dashes.length }
}

// ---------- clamps (bowed bands wrapping the cylinder, thumbscrew on top, ear below) ----------
function clamp(x) {
  const hw = 22, bow = 15
  const top = -(hAt(x) + 15), bot = hAt(x) + 15
  const H = (bot - top) / 2, cy = (bot + top) / 2
  const edge = (dx) => {
    const pts = []
    for (let i = 0; i <= 8; i++) { const y = top + (2 * H * i) / 8, u = (y - cy) / H; pts.push([x + dx + bow * (1 - u * u), y]) }
    return pts
  }
  const L = edge(-hw), Rr = edge(hw), M = edge(1)
  const band = 'M' + L.map(P).join('L') + 'L' + Rr.slice().reverse().map(P).join('L') + 'Z'
  const shade = 'M' + M.map(P).join('L') + 'L' + Rr.slice().reverse().map(P).join('L') + 'Z'
  const ink = 'M' + L.slice(1, 8).map(P).join('L') + 'M' + P(add(L[0], [5, 1])) + 'L' + P(add(Rr[0], [-8, -1])) + 'M' + P(add(L[8], [5, 0])) + 'L' + P(add(Rr[8], [-14, 1]))
  const tx = x + bow * 0.2 + 2
  const kx = tx + 3, ky = top - 19
  const knob = `<path d="M${r1(kx - 7)} ${r1(top + 3)}L${r1(kx + 7)} ${r1(top + 3)}L${r1(kx + 6)} ${r1(ky + 8)}L${r1(kx - 6)} ${r1(ky + 8)}Z" fill="#63A0AC"/><ellipse cx="${r1(kx)}" cy="${r1(ky)}" rx="20" ry="13" fill="#63A0AC"/><path d="M${r1(kx + 1)} ${r1(ky - 13)}A20 13 0 0 1 ${r1(kx + 1)} ${r1(ky + 13)}Z" fill="#1B6885"/>`
  const knobInk = `M${r1(kx - 19)} ${r1(ky + 3)}C${r1(kx - 19)} ${r1(ky - 9)} ${r1(kx - 7)} ${r1(ky - 14)} ${r1(kx + 8)} ${r1(ky - 11)}M${r1(kx - 11)} ${r1(ky - 4)}L${r1(kx - 11)} ${r1(ky + 5)}M${r1(kx - 4)} ${r1(ky - 6)}L${r1(kx - 4)} ${r1(ky + 7)}M${r1(kx + 3)} ${r1(ky - 6)}L${r1(kx + 3)} ${r1(ky + 7)}`
  const bx = x + bow * 0.2
  const ear = `<path d="M${r1(bx - 17)} ${r1(bot + 1)}L${r1(bx + 19)} ${r1(bot)}L${r1(bx + 17)} ${r1(bot + 20)}Q${r1(bx)} ${r1(bot + 26)} ${r1(bx - 15)} ${r1(bot + 19)}Z" fill="#7A8CE8"/><path d="M${r1(bx + 3)} ${r1(bot + 1)}L${r1(bx + 19)} ${r1(bot)}L${r1(bx + 17)} ${r1(bot + 20)}Q${r1(bx + 9)} ${r1(bot + 23)} ${r1(bx + 3)} ${r1(bot + 22)}Z" fill="#5B6BC4"/>`
  // two fur tufts lying over each end of the band (from the nose side, leaning toward the tail)
  const lt = []
  ;[[-hw - 14, -1], [-hw - 40, -1]].forEach(([dx, side]) => {
    const bxx = x + dx
    const B = [bxx, side * (hAt(bxx) - 6)]
    lt.push(lyingTuft(B, [0.86, side * 0.5], side < 0 ? 32 : 38, 24))
  })
  // two steel rivets on each band (flat disc + deep-teal shade + partial ink ring)
  const rv = [-0.56, 0.56].map((u) => [x + bow * (1 - u * u) + 1, cy + H * u])
  const rivets = rv.map(([rx, ry]) => `<circle cx="${r1(rx)}" cy="${r1(ry)}" r="9.5" fill="#63A0AC"/><circle cx="${r1(rx + 2)}" cy="${r1(ry + 2)}" r="6" fill="#1B6885"/>`).join('')
  const rivetInk = rv.map(([rx, ry]) => `M${r1(rx - 9.5)} ${r1(ry + 2)}C${r1(rx - 10)} ${r1(ry - 8)} ${r1(rx)} ${r1(ry - 12)} ${r1(rx + 8)} ${r1(ry - 7)}`).join('')
  return { band, shade, ink, knob, knobInk, ear: '', lt, rivets, rivetInk }
}

// stepped rubber cable boot at the tail (tomato): big ring against the fur, small ring, then the cable
const GROM = {
  fill: 'M412 -52C426 -58 440 -56 444 -52L444 52C440 56 426 58 412 52Z' + 'M440 -34C450 -38 460 -36 464 -32L464 32C460 36 450 38 440 34Z',
  shade: 'M430 -57C438 -57 442 -55 444 -52L444 52C442 55 438 57 430 57C436 30 436 -30 430 -57Z' + 'M452 -37C458 -37 462 -35 464 -32L464 32C462 35 458 37 452 37C456 20 456 -20 452 -37Z',
  face: 'M464 -32C470 -26 471 -12 471 0C471 12 470 26 464 32C458 22 458 -22 464 -32Z',
  hole: 'M465 -9C468 -7 469 -3 469 0C469 3 468 7 465 9C463 5 463 -5 465 -9Z',
  ink: 'M414 -54C426 -59 438 -57 443 -53M441 -35C450 -39 459 -37 463 -33M414 52L414 -48',
}

// ---------- pistol grip (own frame: origin top centre, +y along the axis) ----------
const GRIP = {
  body: 'M-36 -8L-37 14C-45 20 -47 44 -41 56Q-36 60 -38 66C-46 72 -48 96 -42 108Q-37 112 -39 118C-47 124 -49 148 -43 160C-41 180 -39 216 -41 246L41 246C47 140 47 50 37 -8Z',
  shade: 'M12 -8C18 40 20 120 14 246L41 246C47 140 47 50 37 -8Z',
  collar: 'M-47 6C-20 2 22 2 47 6L48 34C22 38 -22 38 -48 34Z',
  collarShade: 'M20 3L47 6L48 34C38 36 28 37 20 37Z',
  foot: 'M-45 238L45 238C51 238 54 244 54 252L54 262C54 272 47 278 37 278L-37 278C-47 278 -54 272 -54 262L-54 252C-54 244 -51 238 -45 238Z',
  footShade: 'M18 238L45 238C51 238 54 244 54 252L54 262C54 272 47 278 37 278L18 278Z',
  loop: 'M-13 286C-13 298 13 298 13 286',
  button: 'M30 126C42 122 56 128 56 140C56 154 44 162 34 158C26 154 24 132 30 126Z',
  buttonShade: 'M44 124C54 128 59 138 54 150C51 157 45 160 40 159C49 152 50 136 44 124Z',
  inkMain: 'M-36 -4L-37 14C-45 20 -47 44 -41 56M-38 66C-46 72 -48 96 -42 108M-39 118C-47 124 -49 148 -43 160L-41 232',
  inkFine: 'M-38 66L-22 72M-39 118L-22 124M-41 56L-30 60M-44 240L44 240M-46 8L40 6M-30 20L-30 22M30 20L30 22',
}

// ---------- cable: slide-space waypoints ----------
function cableD() {
  const tail = toSlide([466, 0])
  const pts = []
  const c0 = tail, c1 = add(tail, [34, 24]), c2 = [1014, 1370], c3 = [988, 1420]
  for (let i = 0; i <= 14; i++) pts.push(cubicAt([c0, c1, c2, c3], i / 14))
  const C = [914, 1446], a0 = -18, a1 = 396
  for (let i = 1; i <= 48; i++) {
    const t = i / 48, a = ((a0 + (a1 - a0) * t) * Math.PI) / 180, r = 76 - 36 * t
    pts.push([C[0] + r * Math.cos(a), C[1] + r * Math.sin(a)])
  }
  const way = [[912, 1492], [850, 1514], [786, 1512], [722, 1498], [662, 1484], [622, 1488], [592, 1504], [576, 1524]]
  return { d: smoothD(pts.concat(way), false, 1), end: [576, 1524] }
}

// Returns SVG fragments; slide-1.mjs wraps them in the few shared filtered groups (<= 14 filtered groups per slide).
export function mic() {
  const tufts = furTufts()
  const sil = tuftsPath(tufts)
  const silShift = tuftsPath(tufts, [-62 * 0.956, -62 * 0.293 * 0.9])
  const inkRuns = tuftsInk(tufts)
  const ink = furInk()
  const c1 = clamp(-258), c2 = clamp(241)
  const T = `translate(${CX} ${CY}) rotate(${ANG})`
  const GT = 'translate(596 1306) rotate(-15.6)'
  const g = GRIP
  const cab = cableD()
  const hw = (c) => `<path d="${c.band}" fill="#7A8CE8"/><path d="${c.shade}" fill="#5B6BC4"/>${c.rivets}${c.knob}${c.ear}`
  const lyingFill = (c) => c.lt.map((t) => `<path d="${t.fill}" fill="#FDEFAF"/>`).join('')
  const lyingInk = (c) => c.lt.map((t) => `<path d="${t.ink}"/>`).join('')
  const O = (inner, off) => `<g transform="translate(${off})">${inner}</g>` // flat offset (-4 3) = screen-print misregistration

  // ---- hard ink shadows (one f-dry group for mic + grip) ----
  const shadows = `<g id="shadow-mic" transform="translate(16 18)"><g transform="${T}"><path d="${sil}" fill="#101820"/><path d="${GROM.fill}" fill="#101820"/><path d="${GROM.face}" fill="#101820"/></g></g>
<g id="shadow-grip" transform="translate(14 16)"><g transform="${GT}"><path d="${g.body}" fill="#101820"/><path d="${g.foot}" fill="#101820"/></g></g>`

  // ---- cable (f-wobble) ----
  const cable = `<g id="obj-cable"><path d="${cab.d}" fill="none" stroke="#101820" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="${cab.d}" fill="none" stroke="#FDEFAF" stroke-width="3" stroke-linecap="round" stroke-dasharray="9 13"/></g>`

  // ---- grip: flat (f-rough-lite) + ink (f-wobble) ----
  const gripFlat = `<g id="obj-grip-flat" transform="translate(-4 3)"><g transform="${GT}">
  <path d="${g.body}" fill="#1B6885"/><path d="${g.shade}" fill="#0F4157"/>
  <path d="M-29 74C-31 100 -31 126 -33 150" fill="none" stroke="#63A0AC" stroke-width="6" stroke-linecap="round"/>
  <path d="${g.button}" fill="#E8553E"/><path d="${g.buttonShade}" fill="#C23F2B"/>
  <path d="${g.foot}" fill="#0F4157"/>
  <path d="${g.collar}" fill="#63A0AC"/><path d="${g.collarShade}" fill="#1B6885"/>
  </g></g>`
  const gripInk = `<g id="obj-grip-ink"><g transform="${GT}"><g class="ink"><path d="${g.inkMain}"/></g><g class="ink-fine"><path d="${g.inkFine}"/><path d="${g.loop}" stroke="#63A0AC" stroke-width="7"/></g></g></g>`

  // ---- mic fur: flat (f-rough-lite) and halftone belly (f-ht-m) ----
  const furFlat = `<g id="obj-mic-fur" transform="translate(-4 3)"><g transform="${T}">
  <path d="${sil}" fill="#FDEFAF"/>
  <clipPath id="mic-clip"><path d="${sil}"/></clipPath>
  <g clip-path="url(#mic-clip)"><path fill-rule="evenodd" fill="#EBD58A" d="M-600 -300H600V300H-600Z${silShift}"/></g>
  </g></g>`
  const halftone = `<g id="obj-mic-belly" transform="translate(-4 3)"><g transform="${T}"><clipPath id="mic-clip-2"><path d="${sil}"/></clipPath><g clip-path="url(#mic-clip-2)"><path fill-rule="evenodd" fill="#F2A29A" fill-opacity=".5" mask="url(#tone-diag)" d="M-430 -200H430V200H-430Z${silShift}"/></g></g></g>`

  // ---- hardware flats: clamps, lying tufts, cable boot (+ XLR) (f-rough-lite) ----
  const hwFlat = `<g id="obj-mic-hardware" transform="translate(-4 3)"><g transform="${T}">
  ${hw(c1)}${hw(c2)}${lyingFill(c1)}${lyingFill(c2)}
  <path d="${GROM.fill}" fill="#E8553E"/><path d="${GROM.shade}" fill="#C23F2B"/><path d="${GROM.face}" fill="#C23F2B"/><path d="${GROM.hole}" fill="#101820"/>
  </g></g>`
  const XT = `translate(${r1(cab.end[0])} ${r1(cab.end[1])}) rotate(32) scale(1.08)`
  const ticks = Array.from({ length: 7 }, (_, i) => `M${-22 + i * 7} 46L${-18 + i * 7} 58`).join('')
  const xlrFlat = `<g id="obj-xlr-flat" transform="translate(-4 3)"><g transform="${XT}">
  <path d="M-9 -2L9 -2L20 30L-20 30Z" fill="#101820"/>
  <path d="M-26 28L26 28L26 98L-26 98Z" fill="#63A0AC"/><path d="M8 28L26 28L26 98L8 98Z" fill="#1B6885"/>
  <path d="M-26 44L26 44L26 60L-26 60Z" fill="#1B6885"/><path d="M8 44L26 44L26 60L8 60Z" fill="#0F4157"/>
  <path d="M-33 70Q-39 70 -39 76L-39 90Q-39 96 -33 96L-26 96L-26 70Z" fill="#E8553E"/>
  <ellipse cx="0" cy="99" rx="27" ry="15" fill="#F6F0DC"/><ellipse cx="1" cy="100" rx="20.5" ry="10.5" fill="#0F4157"/>
  <g fill="#F6F0DC"><circle cx="-8" cy="97" r="3"/><circle cx="9" cy="97" r="3"/><circle cx="1" cy="105" r="3"/></g>
  </g></g>`

  // ---- ink (one f-wobble group): fur, clamps, boot, XLR ----
  const micInk = `<g id="obj-mic-ink"><g transform="${T}">
  <g class="ink-fine">${ink.dashes.map((d) => `<path d="${d}"/>`).join('')}${ink.fly.map((d) => `<path d="${d}"/>`).join('')}${ink.parting.map((d) => `<path d="${d}"/>`).join('')}</g>
  <g class="ink">${inkRuns.map((d) => `<path d="${d}"/>`).join('')}<path d="${c1.ink}"/><path d="${c2.ink}"/><path d="${GROM.ink}"/>${lyingInk(c1)}${lyingInk(c2)}</g>
  <g class="ink-fine"><path d="${c1.knobInk}"/><path d="${c2.knobInk}"/><path d="${c1.rivetInk}"/><path d="${c2.rivetInk}"/></g>
  </g></g>`
  const xlrInk = `<g id="obj-xlr-ink"><g transform="${XT}" class="ink-fine"><path d="M-26 32L-26 98M-26 98C-20 118 22 118 27 98"/><path d="${ticks}"/><path d="M-6 4L-14 24M5 6L12 24"/><path d="M-26 44L26 44M-26 60L26 60"/></g></g>`

  return { shadows, cable, gripFlat, gripInk, furFlat, halftone, hwFlat, xlrFlat, micInk, xlrInk, stats: { tufts: tufts.length, dashes: ink.count } }
}
