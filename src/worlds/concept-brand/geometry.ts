// Geometry for the Gotet board: the awning scallops, the hand-marker outlines and the camera maths (all in board units).
import { BOARD_H, BOARD_W, TOP, type Rect } from './data'

// ---- scallops (guide 9.2: 25 semicircles of radius 60 centred at x = 60 + 120 i, y = 1500, bulging down to y 1560) --------------
function scallopFill(): string {
  const r = TOP.scallopR
  let d = `M0 0H${BOARD_W}V1500`
  for (let i = TOP.scallops - 1; i >= 0; i--) d += `A${r} ${r} 0 0 1 ${i * 2 * r} 1500`
  return `${d}Z`
}

function scallopOutline(): string {
  const r = TOP.scallopR
  let d = 'M0 1500'
  for (let i = 1; i <= TOP.scallops; i++) d += `A${r} ${r} 0 0 0 ${i * 2 * r} 1500`
  return d
}

export const SCALLOP_FILL = scallopFill()
export const SCALLOP_OUTLINE = scallopOutline()

// ---- hand marker -------------------------------------------------------------------------------------------------------------
// A seeded, slightly wobbly loop that overshoots where it started, like a highlighter drawn by hand. Returns an SVG path.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Pt = [number, number]

function smooth(points: Pt[]): string {
  // Catmull-Rom to cubic Bezier
  const n = points.length
  let d = `M${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(n - 1, i + 2)]
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return d
}

export function markerPath(rect: Rect, seed: number): string {
  const rnd = mulberry32(seed * 7919 + 13)
  const short = Math.min(rect.w, rect.h)
  const pad = Math.max(16, Math.min(44, short * 0.045))
  const jit = Math.max(4, Math.min(26, short * 0.014))
  const j = () => (rnd() - 0.5) * 2 * jit
  const x0 = rect.x - pad
  const y0 = rect.y - pad
  const x1 = rect.x + rect.w + pad
  const y1 = rect.y + rect.h + pad
  const w = x1 - x0
  const h = y1 - y0
  const r = Math.min(70, w / 5, h / 5)
  const pts: Pt[] = []
  const edge = (ax: number, ay: number, bx: number, by: number, len: number) => {
    const steps = Math.max(1, Math.round(len / 340))
    for (let s = 1; s < steps; s++) {
      const t = s / steps
      pts.push([ax + (bx - ax) * t + j(), ay + (by - ay) * t + j()])
    }
  }
  const corner = (cx: number, cy: number, a0: number) => {
    for (const da of [0.16, 0.5, 0.84]) {
      const a = a0 + da * (Math.PI / 2)
      pts.push([cx + Math.cos(a) * r + j() * 0.5, cy + Math.sin(a) * r + j() * 0.5])
    }
  }
  // start a little right of the top-left corner, walk clockwise, overshoot past the start by a loop
  const startX = x0 + r + w * 0.07
  pts.push([startX + j(), y0 + j() * 0.6])
  edge(startX, y0, x1 - r, y0, w)
  corner(x1 - r, y0 + r, -Math.PI / 2)
  edge(x1, y0 + r, x1, y1 - r, h)
  corner(x1 - r, y1 - r, 0)
  edge(x1 - r, y1, x0 + r, y1, w)
  corner(x0 + r, y1 - r, Math.PI / 2)
  edge(x0, y1 - r, x0, y0 + r, h)
  corner(x0 + r, y0 + r, Math.PI)
  // the loop closes past where it began and drifts slightly inside
  pts.push([x0 + r + w * 0.12 + j(), y0 - jit * 0.4 + j() * 0.3])
  pts.push([x0 + r + w * 0.2, y0 + jit * 0.9])
  return smooth(pts)
}

// ---- camera maths --------------------------------------------------------------------------------------------------------------
/**
 * The stage the library moves is the board itself (the wall behind it is painted by the wrapper). The library's own bounds are off:
 * the camera clamps itself (clampCentre) because its bounds know nothing about the room the chips, the docket and the sheet take.
 */
export const STAGE_PAD = 0
export const STAGE_W = BOARD_W + 2 * STAGE_PAD
export const STAGE_H = BOARD_H + 2 * STAGE_PAD
export const MAX_SCALE = 3

export interface Insets {
  left: number
  top: number
  right: number
  bottom: number
}

export interface Camera {
  /** screen px per board unit */
  scale: number
  x: number
  y: number
}

/** The scale that fits `view` (board units) into the safe part of the canvas, with breathing room in board units. */
export function scaleFor(view: Rect, wrapW: number, wrapH: number, safe: Insets, room: number): number {
  const sw = Math.max(80, wrapW - safe.left - safe.right)
  const sh = Math.max(80, wrapH - safe.top - safe.bottom)
  return Math.min(sw / (view.w + room * 2), sh / (view.h + room * 2))
}

/** Position (stage space) that puts a board point at the centre of the safe rectangle. */
export function cameraAt(cx: number, cy: number, scale: number, wrapW: number, wrapH: number, safe: Insets): Camera {
  const sw = wrapW - safe.left - safe.right
  const sh = wrapH - safe.top - safe.bottom
  return {
    scale,
    x: safe.left + sw / 2 - (cx + STAGE_PAD) * scale,
    y: safe.top + sh / 2 - (cy + STAGE_PAD) * scale,
  }
}

/** The board point at the centre of the safe rectangle for a camera. */
export function centreOf(cam: Camera, wrapW: number, wrapH: number, safe: Insets): { cx: number; cy: number } {
  const sw = wrapW - safe.left - safe.right
  const sh = wrapH - safe.top - safe.bottom
  return {
    cx: (safe.left + sw / 2 - cam.x) / cam.scale - STAGE_PAD,
    cy: (safe.top + sh / 2 - cam.y) / cam.scale - STAGE_PAD,
  }
}

/**
 * Smooth and efficient zooming and panning (van Wijk and Nuij): the path a camera takes so the zoom-out and zoom-in feel like one
 * flight. p = [centre x, centre y, view width] in board units. Returns the interpolator and a natural duration factor.
 */
export function flightPath(p0: [number, number, number], p1: [number, number, number]): { at: (t: number) => [number, number, number]; length: number } {
  const rho = Math.SQRT2
  const rho2 = 2
  const rho4 = 4
  const [ux0, uy0, w0] = p0
  const [ux1, uy1, w1] = p1
  const dx = ux1 - ux0
  const dy = uy1 - uy0
  const d2 = dx * dx + dy * dy
  if (d2 < 1e-6) {
    const S = Math.log(w1 / w0) / rho
    return { at: (t) => [ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(rho * t * S)], length: Math.abs(S) }
  }
  const d1 = Math.sqrt(d2)
  const b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1)
  const b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1)
  const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0)
  const r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1)
  const S = (r1 - r0) / rho
  return {
    at: (t) => {
      const s = t * S
      const coshr0 = Math.cosh(r0)
      const u = (w0 / (rho2 * d1)) * (coshr0 * Math.tanh(rho * s + r0) - Math.sinh(r0))
      return [ux0 + u * dx, uy0 + u * dy, (w0 * coshr0) / Math.cosh(rho * s + r0)]
    },
    length: Math.abs(S),
  }
}

export const easeInOut = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v))

export const rectsOverlap = (a: Rect, b: Rect): boolean => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y

export const growRect = (r: Rect, by: number): Rect => ({ x: r.x - by, y: r.y - by, w: r.w + 2 * by, h: r.h + 2 * by })

/** the even-odd path of the dim layer: the whole board with a rounded hole for each rectangle */
export function dimPath(holes: Rect[]): string {
  let d = `M0 0H${BOARD_W}V${BOARD_H}H0Z`
  for (const h of holes) {
    const r = Math.min(28, h.w / 4, h.h / 4)
    d += `M${h.x + r} ${h.y}H${h.x + h.w - r}A${r} ${r} 0 0 1 ${h.x + h.w} ${h.y + r}V${h.y + h.h - r}A${r} ${r} 0 0 1 ${h.x + h.w - r} ${h.y + h.h}H${h.x + r}A${r} ${r} 0 0 1 ${h.x} ${h.y + h.h - r}V${h.y + r}A${r} ${r} 0 0 1 ${h.x + r} ${h.y}Z`
  }
  return d
}

/**
 * Where the centre of the view (board units) may rest. A view wider than the board keeps the whole board in sight; a closer view may
 * drift until 60 % of it is still board. Used after a drag, a pinch or a wheel has finished: the camera eases back.
 */
export function clampCentre(c: number, view: number, board: number): number {
  if (view >= board) return clamp(c, board - view / 2, view / 2)
  return clamp(c, view * 0.1, board - view * 0.1)
}
