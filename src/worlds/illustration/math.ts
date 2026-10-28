// Small geometry helpers for the sticker board (no React, no DOM).
import { CANVAS_H, CANVAS_W } from './data'
import { SHAPES } from './shapes.generated'

export const DEG = Math.PI / 180
export const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v))
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t
/** an angle in degrees wrapped to -180..180 */
export const wrap180 = (a: number): number => ((((a + 180) % 360) + 360) % 360) - 180

export interface Pt {
  x: number
  y: number
}

export function rotateAbout(x: number, y: number, cx: number, cy: number, deg: number): Pt {
  if (!deg) return { x, y }
  const c = Math.cos(deg * DEG)
  const s = Math.sin(deg * DEG)
  const dx = x - cx
  const dy = y - cy
  return { x: cx + dx * c - dy * s, y: cy + dx * s + dy * c }
}

/** Andrew's monotone chain */
export function convexHull(points: Pt[]): Pt[] {
  const p = [...points].sort((a, b) => a.x - b.x || a.y - b.y)
  if (p.length < 3) return p
  const cross = (o: Pt, a: Pt, b: Pt) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
  const lower: Pt[] = []
  for (const q of p) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop()
    lower.push(q)
  }
  const upper: Pt[] = []
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i]
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop()
    upper.push(q)
  }
  lower.pop()
  upper.pop()
  return lower.concat(upper)
}

/** the hull of every sticker's collision pieces, in canvas pixels (origin top-left of the 1200 x 1600 canvas) */
export const HULLS: Record<number, Pt[]> = {}
for (let n = 1; n <= 9; n++) {
  const pts: Pt[] = []
  for (const part of SHAPES[n].parts) for (let i = 0; i < part.length; i += 2) pts.push({ x: part[i], y: part[i + 1] })
  HULLS[n] = convexHull(pts)
}

export interface Extents {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

/** bounds of a sticker's hull relative to its canvas centre, after rotating by `rotDeg` and scaling by k (px per canvas px) */
export function extentsOf(n: number, rotDeg: number, k: number): Extents {
  const c = Math.cos(rotDeg * DEG)
  const s = Math.sin(rotDeg * DEG)
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const p of HULLS[n]) {
    const px = p.x - CANVAS_W / 2
    const py = p.y - CANVAS_H / 2
    const x = (px * c - py * s) * k
    const y = (px * s + py * c) * k
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
  return { minX, maxX, minY, maxY }
}

/** Sutherland-Hodgman against one half-plane  sx*x + sy*y <= m (keep 'below') or >= m (keep 'above') */
export function clipHalfPlane(poly: Pt[], sx: number, sy: number, m: number, keep: 'below' | 'above'): Pt[] {
  const side = (p: Pt) => (keep === 'below' ? m - (sx * p.x + sy * p.y) : sx * p.x + sy * p.y - m)
  const out: Pt[] = []
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]
    const b = poly[(i + 1) % poly.length]
    const da = side(a)
    const db = side(b)
    if (da >= 0) out.push(a)
    if ((da >= 0) !== (db >= 0)) {
      const t = da / (da - db)
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
    }
  }
  return out
}

const BOX: Pt[] = [
  { x: 0, y: 0 },
  { x: CANVAS_W, y: 0 },
  { x: CANVAS_W, y: CANVAS_H },
  { x: 0, y: CANVAS_H },
]

/** the four corners a sticker can be held by: [sx, sy] */
export const CORNERS: ReadonlyArray<readonly [number, number]> = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
]

export interface Fold {
  /** clip-path of the sticker without the lifted corner */
  face: string
  /** clip-path (before the reflection) of the lifted corner */
  flapClip: string
  /** the reflection across the fold line, as the 6 numbers of a CSS matrix(): the translation is in canvas px */
  a: number
  b: number
  c: number
  d: number
  e: number
  f: number
}

const poly = (pts: Pt[]): string => 'polygon(' + pts.map((p) => `${((p.x / CANVAS_W) * 100).toFixed(2)}% ${((p.y / CANVAS_H) * 100).toFixed(2)}%`).join(',') + ')'

/**
 * A corner of a sticker peeled up. The fold line is perpendicular to the diagonal through the corner and sits `depth` canvas
 * pixels inside the hull's extreme point in that direction, so the fold always bites into the silhouette, not into empty canvas.
 * The flap is the lifted triangle reflected across the fold line (the white back of the vinyl).
 */
export function foldFor(n: number, corner: number, depth: number): Fold {
  const [sx, sy] = CORNERS[corner]
  let ext = -Infinity
  for (const p of HULLS[n]) ext = Math.max(ext, sx * p.x + sy * p.y)
  const m = ext - depth
  const face = clipHalfPlane(BOX, sx, sy, m, 'below')
  const flap = clipHalfPlane(BOX, sx, sy, m, 'above')
  // reflection across  sx*x + sy*y = m :  p' = p - (sx*px + sy*py - m) * (sx, sy)
  return { face: poly(face), flapClip: poly(flap), a: 0, b: -sx * sy, c: -sx * sy, d: 0, e: sx * m, f: sy * m }
}

/** a deterministic pseudo random generator (mulberry32) for scatters that should look the same on every visit */
export function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
