// The thread: one smooth path that runs top to bottom through the hero, the month banners and the knot of every tag.
// Every piece is a cubic with vertical tangents at both ends (an S), so y only ever increases along the path. That lets the
// devil's position be found from a y alone (binary search on a dense sample table), no getPointAtLength and no layout reads.

export interface Pt {
  x: number
  y: number
}

export interface Thread {
  /** SVG path data */
  d: string
  /** dense samples along the path, ys strictly increasing */
  xs: number[]
  ys: number[]
}

const r1 = (n: number) => Math.round(n * 10) / 10

export function buildThread(points: Pt[], steps = 26): Thread | null {
  if (points.length < 2) return null
  // y must strictly increase: nudge anything that does not
  const pts: Pt[] = []
  for (const p of points) {
    const prev = pts[pts.length - 1]
    pts.push({ x: p.x, y: prev ? Math.max(p.y, prev.y + 2) : p.y })
  }
  let d = `M${r1(pts[0].x)} ${r1(pts[0].y)}`
  const xs = [pts[0].x]
  const ys = [pts[0].y]
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]
    const b = pts[i]
    const dy = b.y - a.y
    const c1y = a.y + dy * 0.5
    const c2y = b.y - dy * 0.5
    d += `C${r1(a.x)} ${r1(c1y)} ${r1(b.x)} ${r1(c2y)} ${r1(b.x)} ${r1(b.y)}`
    for (let s = 1; s <= steps; s++) {
      const t = s / steps
      const u = 1 - t
      xs.push(u * u * u * a.x + 3 * u * u * t * a.x + 3 * u * t * t * b.x + t * t * t * b.x)
      ys.push(u * u * u * a.y + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * b.y)
    }
  }
  return { d, xs, ys }
}

export interface Sample {
  x: number
  /** direction of travel, per unit of y (dx / dy): 0 = straight down, large = nearly sideways */
  slope: number
}

/** x and slope of the thread at a given y (clamped to the ends). */
export function sampleAtY(thread: Thread, y: number): Sample {
  const { xs, ys } = thread
  const last = ys.length - 1
  if (y <= ys[0]) return { x: xs[0], slope: (xs[1] - xs[0]) / Math.max(0.001, ys[1] - ys[0]) }
  if (y >= ys[last]) return { x: xs[last], slope: (xs[last] - xs[last - 1]) / Math.max(0.001, ys[last] - ys[last - 1]) }
  let lo = 0
  let hi = last
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (ys[mid] <= y) lo = mid
    else hi = mid
  }
  const span = Math.max(0.001, ys[hi] - ys[lo])
  const t = (y - ys[lo]) / span
  return { x: xs[lo] + (xs[hi] - xs[lo]) * t, slope: (xs[hi] - xs[lo]) / span }
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const smooth = (t: number) => t * t * (3 - 2 * t)
