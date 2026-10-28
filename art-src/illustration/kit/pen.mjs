// pen.mjs - tiny, dependency-free drafting helpers for the hand-built doodle stickers.
// They only turn point lists into SVG path data ("d" strings). The finished sticker is plain SVG;
// you never need this file at render time. Use it while drafting:
//
//   import { smooth, tube, blob, grid, rotPts } from './kit/pen.mjs'
//   const d = smooth([[100,100],[200,80],[300,140,'c'],[260,260]], { closed: true })
//
// Point format: [x, y]            -> smooth point (tangent follows its neighbours)
//               [x, y, 'c']       -> corner (sharp turn, tangents are one-sided)
//               [x, y, 0.6]       -> smooth point with a tighter (<1) or looser (>1) handle
// Everything lives in the 1200 x 1600 sticker canvas.

export const r1 = (n) => { const v = Math.round(n * 10) / 10; return Object.is(v, -0) ? 0 : v }
export const fmt = (n) => String(r1(n))

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]]
const len = (v) => Math.hypot(v[0], v[1])
const norm = (v) => { const l = len(v) || 1; return [v[0] / l, v[1] / l] }
export const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]

/** Smooth path through points (cardinal spline with chord-length handles, no overshoot loops). */
export function smooth(pts, opts = {}) {
  const { closed = false, k = 1 } = opts
  const n = pts.length
  if (n < 2) return ''
  const P = pts.map((p) => [p[0], p[1]])
  const flag = pts.map((p) => p[2])
  const at = (i) => P[closed ? (i + n) % n : Math.min(Math.max(i, 0), n - 1)]
  const dirIn = [], dirOut = []
  for (let i = 0; i < n; i++) {
    const corner = flag[i] === 'c'
    const hasPrev = closed || i > 0
    const hasNext = closed || i < n - 1
    if (corner || !hasPrev || !hasNext) {
      dirIn[i] = hasPrev ? norm(sub(P[i], at(i - 1))) : norm(sub(at(i + 1), P[i]))
      dirOut[i] = hasNext ? norm(sub(at(i + 1), P[i])) : norm(sub(P[i], at(i - 1)))
    } else {
      const d = norm(sub(at(i + 1), at(i - 1)))
      dirIn[i] = d; dirOut[i] = d
    }
  }
  const sc = (i) => (typeof flag[i] === 'number' ? flag[i] : 1)
  let d = `M${fmt(P[0][0])} ${fmt(P[0][1])}`
  const segs = closed ? n : n - 1
  for (let i = 0; i < segs; i++) {
    const j = (i + 1) % n
    const chord = len(sub(P[j], P[i]))
    const h = (chord * k) / 3
    const c1 = [P[i][0] + dirOut[i][0] * h * sc(i), P[i][1] + dirOut[i][1] * h * sc(i)]
    const c2 = [P[j][0] - dirIn[j][0] * h * sc(j), P[j][1] - dirIn[j][1] * h * sc(j)]
    d += `C${fmt(c1[0])} ${fmt(c1[1])} ${fmt(c2[0])} ${fmt(c2[1])} ${fmt(P[j][0])} ${fmt(P[j][1])}`
  }
  return d + (closed ? 'Z' : '')
}

/** Straight-segment path. */
export function poly(pts, closed = false) {
  return pts.map((p, i) => (i ? 'L' : 'M') + fmt(p[0]) + ' ' + fmt(p[1])).join('') + (closed ? 'Z' : '')
}

/** Deterministic random (mulberry32). */
export function rng(seed = 1) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const trPts = (pts, dx, dy) => pts.map((p) => [p[0] + dx, p[1] + dy, ...p.slice(2)])
export const scPts = (pts, sx, sy = sx, o = [0, 0]) =>
  pts.map((p) => [o[0] + (p[0] - o[0]) * sx, o[1] + (p[1] - o[1]) * sy, ...p.slice(2)])
export function rotPts(pts, deg, o = [0, 0]) {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a)
  return pts.map((p) => {
    const x = p[0] - o[0], y = p[1] - o[1]
    return [o[0] + x * c - y * s, o[1] + x * s + y * c, ...p.slice(2)]
  })
}
export const mirrorPts = (pts, x0) => pts.map((p) => [2 * x0 - p[0], p[1], ...p.slice(2)])

/** Imperfect ellipse (hand-drawn dots, wheels, balls). */
export function blobPts(cx, cy, rx, ry = rx, o = {}) {
  const { rot = 0, wob = 0.045, n = 9, seed = 1, phase = 0 } = o
  const R = rng(seed)
  const pts = []
  for (let i = 0; i < n; i++) {
    const t = phase + (i / n) * Math.PI * 2
    const f = 1 + (R() - 0.5) * 2 * wob
    pts.push([cx + Math.cos(t) * rx * f, cy + Math.sin(t) * ry * f])
  }
  return rot ? rotPts(pts, rot, [cx, cy]) : pts
}
export const blob = (cx, cy, rx, ry, o) => smooth(blobPts(cx, cy, rx, ry, o), { closed: true })

/** Points along an elliptical arc (angles in degrees, 0 = +x, 90 = +y/down). */
export function arcPts(cx, cy, rx, ry, a0, a1, n = 6) {
  const pts = []
  for (let i = 0; i <= n; i++) {
    const t = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180
    pts.push([cx + Math.cos(t) * rx, cy + Math.sin(t) * ry])
  }
  return pts
}

/** Normals of a polyline (unit vectors, averaged at joints). */
export function normals(pts) {
  return pts.map((p, i) => {
    const a = pts[Math.max(i - 1, 0)], b = pts[Math.min(i + 1, pts.length - 1)]
    const t = norm(sub(b, a))
    return [-t[1], t[0]]
  })
}

/** Shift every point along its normal by d (positive = left of travel direction in screen space). */
export function offsetPts(pts, d) {
  const N = normals(pts)
  return pts.map((p, i) => [p[0] + N[i][0] * d, p[1] + N[i][1] * d])
}

/**
 * Closed outline of a limb / sleeve / tail around a centre line.
 * widths: number | number[] (full width at each centre point). Returns points for smooth(..., {closed:true}).
 * caps: 'round' (default) | 'flat'
 */
export function tube(pts, widths, o = {}) {
  const { capStart = 'round', capEnd = 'round' } = o
  const w = Array.isArray(widths) ? widths : pts.map(() => widths)
  const N = normals(pts)
  const left = pts.map((p, i) => [p[0] + (N[i][0] * w[i]) / 2, p[1] + (N[i][1] * w[i]) / 2])
  const right = pts.map((p, i) => [p[0] - (N[i][0] * w[i]) / 2, p[1] - (N[i][1] * w[i]) / 2])
  const last = pts.length - 1
  const tEnd = norm(sub(pts[last], pts[last - 1])), tSt = norm(sub(pts[0], pts[1]))
  const out = left.map((p) => [p[0], p[1]])
  if (capEnd === 'round') out.push([pts[last][0] + (tEnd[0] * w[last]) / 2, pts[last][1] + (tEnd[1] * w[last]) / 2])
  else { out[last] = [...out[last], 'c']; }
  const rr = right.map((p) => [p[0], p[1]]).reverse()
  if (capEnd !== 'round') rr[0] = [...rr[0], 'c']
  out.push(...rr)
  if (capStart === 'round') out.push([pts[0][0] + (tSt[0] * w[0]) / 2, pts[0][1] + (tSt[1] * w[0]) / 2])
  else { out[0] = [...out[0], 'c']; out[out.length - 1] = [...out[out.length - 1], 'c'] }
  return out
}

/**
 * Plaid / grid lines inside a quadrilateral that follows the garment volume.
 * quad = [TL, TR, BR, BL]. us / vs = fractions (0..1) of the lines to draw:
 *   us -> lines running "down" the garment (constant u), vs -> lines running "across" (constant v).
 * warp(u, v) -> [dx, dy] bends the lines to suggest folds. over = how far lines overshoot the quad (fraction).
 * Draw with a clipPath of the garment so the overshoot is hidden. Returns one path "d".
 */
export function grid(quad, us, vs, o = {}) {
  const { steps = 5, warp = null, over = 0.06 } = o
  const [A, B, C, D] = quad
  const P = (u, v) => {
    const top = lerp(A, B, u), bot = lerp(D, C, u)
    const p = lerp(top, bot, v)
    if (warp) { const w = warp(u, v); return [p[0] + w[0], p[1] + w[1]] }
    return p
  }
  let d = ''
  for (const u of us) {
    const pts = []
    for (let i = 0; i <= steps; i++) pts.push(P(u, -over + ((1 + 2 * over) * i) / steps))
    d += smooth(pts)
  }
  for (const v of vs) {
    const pts = []
    for (let i = 0; i <= steps; i++) pts.push(P(-over + ((1 + 2 * over) * i) / steps, v))
    d += smooth(pts)
  }
  return d
}

/** Evenly spaced fractions, e.g. spaced(4) -> [0.2,0.4,0.6,0.8]. */
export const spaced = (n, a = 0, b = 1) => Array.from({ length: n }, (_, i) => a + ((b - a) * (i + 1)) / (n + 1))

/** Rounded rectangle (axis-aligned) as a path with true arcs. */
export function rrect(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2)
  const a = `A${fmt(r)} ${fmt(r)} 0 0 1 `
  return `M${fmt(x + r)} ${fmt(y)}H${fmt(x + w - r)}${a}${fmt(x + w)} ${fmt(y + r)}V${fmt(y + h - r)}${a}${fmt(x + w - r)} ${fmt(y + h)}H${fmt(x + r)}${a}${fmt(x)} ${fmt(y + h - r)}V${fmt(y + r)}${a}${fmt(x + r)} ${fmt(y)}Z`
}

/** Perfect circle path (use blob() for a hand-drawn one). */
export const circle = (cx, cy, r) =>
  `M${fmt(cx - r)} ${fmt(cy)}a${fmt(r)} ${fmt(r)} 0 1 0 ${fmt(2 * r)} 0a${fmt(r)} ${fmt(r)} 0 1 0 ${fmt(-2 * r)} 0Z`

/** Point at distance t along direction (deg, 0 = +x, 90 = down) from p. */
export const polar = (p, deg, t) => [p[0] + Math.cos((deg * Math.PI) / 180) * t, p[1] + Math.sin((deg * Math.PI) / 180) * t]

/**
 * limb(axis, hw): outline a bent limb / sleeve / trouser leg around a centre line with mitred inner
 * corners and rounded outer corners (what tube() cannot do at an elbow or knee).
 *   axis : [[x,y], ...]   (>= 2 points, hip -> knee -> ankle)
 *   hw   : half width, number or one per axis point
 * returns { A, B, ends } where A / B are the two edge polylines (smooth() points, inner mitre corners are
 * flagged 'c') and ends[i] = { A, B } are the edge points at axis point i (use them to build quads for grid()).
 * A is the side of the +normal (-dy, dx): for a limb running DOWN the screen A is the viewer's right... check once
 * by drawing it, then forget about it.
 */
export function limb(axis, hw) {
  const n = axis.length
  const h = Array.isArray(hw) ? hw : axis.map(() => hw)
  const d = [], nr = []
  for (let i = 0; i < n - 1; i++) { const t = norm(sub(axis[i + 1], axis[i])); d.push(t); nr.push([-t[1], t[0]]) }
  const A = [], B = [], ends = []
  for (let i = 0; i < n; i++) {
    const P = axis[i]
    if (i === 0 || i === n - 1) {
      const k = i === 0 ? 0 : n - 2
      const a = [P[0] + nr[k][0] * h[i], P[1] + nr[k][1] * h[i]], b = [P[0] - nr[k][0] * h[i], P[1] - nr[k][1] * h[i]]
      A.push([...a, 'c']); B.push([...b, 'c']); ends.push({ A: a, B: b })
      continue
    }
    const n1 = nr[i - 1], n2 = nr[i], d1 = d[i - 1], d2 = d[i]
    const cross = d1[0] * d2[1] - d1[1] * d2[0]
    const dot = n1[0] * n2[0] + n1[1] * n2[1]
    const m = [(n1[0] + n2[0]) / (1 + dot), (n1[1] + n2[1]) / (1 + dot)]       // mitre vector (unit normals)
    const bis = norm([n1[0] + n2[0], n1[1] + n2[1]])
    const mitre = (s) => [P[0] + s * m[0] * h[i], P[1] + s * m[1] * h[i]]
    const arc = (s) => [[P[0] + s * n1[0] * h[i], P[1] + s * n1[1] * h[i]], [P[0] + s * bis[0] * h[i], P[1] + s * bis[1] * h[i]], [P[0] + s * n2[0] * h[i], P[1] + s * n2[1] * h[i]]]
    // cross > 0 : A is the inside of the turn, B the outside
    if (cross > 0) {
      const a = mitre(1); A.push([...a, 'c']); ends.push({ A: a, B: arc(-1)[1] })
      B.push(...arc(-1))
    } else {
      const b = mitre(-1); B.push([...b, 'c'])
      A.push(...arc(1)); ends.push({ A: arc(1)[1], B: b })
    }
  }
  return { A, B, ends }
}

/** Closed outline points of a limb: A forward, B backward. */
export const limbOutline = ({ A, B }) => [...A, ...B.slice().reverse()]

/**
 * capsule(axis, hw): closed outline of a finger / thumb / tail / strap: a limb() with a flat start (the base is
 * hidden under a palm or sleeve) and a properly ROUND end cap. Use it with smooth(..., {closed:true}).
 * The last axis point is where the cap starts: the tip ends hw[last] beyond it.
 */
export function capsule(axis, hw) {
  const n = axis.length
  const L = limb(axis, hw)
  const h = Array.isArray(hw) ? hw[n - 1] : hw
  const d = norm(sub(axis[n - 1], axis[n - 2]))
  const tip = [axis[n - 1][0] + d[0] * h, axis[n - 1][1] + d[1] * h]
  const A = L.A.map((p) => p.slice()), B = L.B.map((p) => p.slice())
  A[A.length - 1] = A[A.length - 1].slice(0, 2)      // un-flag the end corners so the spline rounds the cap
  B[B.length - 1] = B[B.length - 1].slice(0, 2)
  return [...A, tip, ...B.slice().reverse()]
}
