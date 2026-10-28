// Procedural hand-drawn marks for <Scribble>. Every mark is built from jittered points smoothed with Catmull-Rom splines, from a
// seeded PRNG: the same seed always gives the same mark, different seeds give different hands. Marks may have several passes
// (the way a marker goes over a line twice); each pass becomes its own <path pathLength="1">.

import { rng } from './util'

export type ScribbleKind = 'underline' | 'circle' | 'arrow' | 'burst' | 'squiggle' | 'tick'
type Pt = [number, number]

export interface Mark {
  /** viewBox */
  w: number
  h: number
  paths: string[]
  /** a path that is a closed shape (burst) */
  closed?: boolean
}

const r1 = (n: number) => Math.round(n * 10) / 10

/** Catmull-Rom through the points -> cubic Bezier path data */
function smooth(pts: Pt[], tension = 1, close = false): string {
  const n = pts.length
  const at = (i: number): Pt => (close ? pts[(i + n) % n] : pts[Math.min(n - 1, Math.max(0, i))])
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`
  const last = close ? n : n - 1
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1)
    const p1 = at(i)
    const p2 = at(i + 1)
    const p3 = at(i + 2)
    const k = tension / 6
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k]
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k]
    d += `C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p2[0])} ${r1(p2[1])}`
  }
  return close ? d + 'Z' : d
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function underline(rand: () => number, W: number, H: number): Mark {
  const jit = (a: number) => (rand() - 0.5) * a
  const n = 7
  const y0 = H * 0.5
  const main: Pt[] = []
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    main.push([lerp(W * 0.03, W * 0.97, t) + jit(W * 0.012), y0 - t * H * 0.1 + Math.sin(t * 6.1 + rand()) * H * 0.07 + jit(H * 0.1)])
  }
  main[n - 1][1] -= H * 0.1 // a little flick at the end
  const second: Pt[] = []
  const m = 5
  const s0 = lerp(0.1, 0.24, rand())
  const s1 = lerp(0.74, 0.92, rand())
  for (let i = 0; i < m; i++) {
    const t = i / (m - 1)
    second.push([lerp(W * s0, W * s1, t) + jit(W * 0.01), y0 + H * 0.3 - t * H * 0.06 + jit(H * 0.09)])
  }
  return { w: W, h: H, paths: [smooth(main, 1), smooth(second, 1)] }
}

function squiggle(rand: () => number, W: number, H: number): Mark {
  const jit = (a: number) => (rand() - 0.5) * a
  const waves = 9
  const pts: Pt[] = []
  for (let i = 0; i <= waves; i++) {
    const t = i / waves
    pts.push([lerp(W * 0.03, W * 0.97, t) + jit(W * 0.012), (i % 2 ? H * 0.78 : H * 0.22) + jit(H * 0.14)])
  }
  return { w: W, h: H, paths: [smooth(pts, 1.05)] }
}

function circle(rand: () => number, W: number, H: number): Mark {
  const cx = W / 2
  const cy = H / 2
  const rx = W * (0.43 + rand() * 0.02)
  const ry = H * (0.4 + rand() * 0.03)
  const a0 = -Math.PI * (0.62 + rand() * 0.28)
  const sweep = Math.PI * 2 + 0.5 + rand() * 0.45
  const n = 18
  const phase = rand() * 6.28
  const lean = (rand() - 0.5) * 0.22
  const pts: Pt[] = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const a = a0 + t * sweep
    const wob = 1 + Math.sin(a * 2 + phase) * 0.045 + (rand() - 0.5) * 0.035
    const drift = 1 + t * 0.075 // the hand overshoots: the end lands outside the start
    const x = cx + Math.cos(a) * rx * wob * drift
    const y = cy + Math.sin(a) * ry * wob * drift
    pts.push([x + (y - cy) * lean, y])
  }
  return { w: W, h: H, paths: [smooth(pts, 1)] }
}

function arrow(rand: () => number, W: number, H: number): Mark {
  const jit = (a: number) => (rand() - 0.5) * a
  const p0: Pt = [W * 0.05, H * (0.7 + rand() * 0.12)]
  const p1: Pt = [W * 0.95, H * (0.18 + rand() * 0.14)]
  const bend = (rand() > 0.5 ? 1 : -1) * H * (0.28 + rand() * 0.22)
  const mid: Pt = [(p0[0] + p1[0]) / 2 - (p1[1] - p0[1]) * 0.18, (p0[1] + p1[1]) / 2 + bend * 0.7]
  const pts: Pt[] = []
  const n = 7
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    const u = 1 - t
    pts.push([u * u * p0[0] + 2 * u * t * mid[0] + t * t * p1[0] + jit(W * 0.01), u * u * p0[1] + 2 * u * t * mid[1] + t * t * p1[1] + jit(H * 0.03)])
  }
  pts[n - 1] = p1
  const tipDir = Math.atan2(p1[1] - pts[n - 2][1], p1[0] - pts[n - 2][0])
  const L = H * (0.26 + rand() * 0.06)
  const spread = 0.46 + rand() * 0.14
  const a: Pt = [p1[0] - Math.cos(tipDir - spread) * L, p1[1] - Math.sin(tipDir - spread) * L]
  const b: Pt = [p1[0] - Math.cos(tipDir + spread) * L * (0.92 + rand() * 0.16), p1[1] - Math.sin(tipDir + spread) * L]
  const head = `M${r1(a[0])} ${r1(a[1])}L${r1(p1[0] + jit(1))} ${r1(p1[1] + jit(1))}L${r1(b[0])} ${r1(b[1])}`
  return { w: W, h: H, paths: [smooth(pts, 1), head] }
}

function burst(rand: () => number, W: number, H: number): Mark {
  const spikes = 12 + Math.floor(rand() * 5)
  const R1 = Math.min(W, H) * 0.47
  const R2 = R1 * (0.6 + rand() * 0.08)
  const rot = rand() * Math.PI
  const pts: Pt[] = []
  for (let i = 0; i < spikes * 2; i++) {
    const a = rot + (i * Math.PI) / spikes + (rand() - 0.5) * 0.08
    const rr = i % 2 === 0 ? R1 * (0.9 + rand() * 0.14) : R2 * (0.9 + rand() * 0.16)
    pts.push([W / 2 + Math.cos(a) * rr, H / 2 + Math.sin(a) * rr])
  }
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${r1(p[0])} ${r1(p[1])}`).join('') + 'Z'
  return { w: W, h: H, paths: [d], closed: true }
}

function tick(rand: () => number, W: number, H: number): Mark {
  const jit = (a: number) => (rand() - 0.5) * a
  const A: Pt = [W * (0.08 + rand() * 0.04), H * (0.5 + rand() * 0.06)]
  const B: Pt = [W * (0.34 + rand() * 0.06), H * (0.84 + rand() * 0.06)]
  const C: Pt = [W * (0.94 + rand() * 0.04), H * (0.08 + rand() * 0.06)]
  const mid: Pt = [lerp(B[0], C[0], 0.5) + jit(W * 0.04), lerp(B[1], C[1], 0.5) + H * 0.1]
  const pts: Pt[] = [A, [lerp(A[0], B[0], 0.5) + jit(2), lerp(A[1], B[1], 0.5) + 1], B, mid, C]
  const again: Pt[] = [
    [A[0] + W * 0.012, A[1] + H * 0.04],
    [B[0] + W * 0.01, B[1] - H * 0.01],
    [mid[0] + W * 0.01, mid[1] + H * 0.02],
    [C[0] - W * 0.01, C[1] + H * 0.03],
  ]
  return { w: W, h: H, paths: [smooth(pts, 0.9), smooth(again, 0.9)] }
}

export const SCRIBBLE_RATIO: Record<ScribbleKind, number> = {
  underline: 8,
  squiggle: 7,
  circle: 1.7,
  arrow: 1.9,
  burst: 1,
  tick: 1.25,
}

export function makeMark(kind: ScribbleKind, seed: number | string, ratio?: number): Mark {
  const rand = rng(`${kind}:${seed}`)
  const H = 100
  const W = Math.round(H * (ratio ?? SCRIBBLE_RATIO[kind]))
  switch (kind) {
    case 'underline':
      return underline(rand, W, H)
    case 'squiggle':
      return squiggle(rand, W, H)
    case 'circle':
      return circle(rand, W, H)
    case 'arrow':
      return arrow(rand, W, H)
    case 'burst':
      return burst(rand, W, H)
    case 'tick':
      return tick(rand, W, H)
  }
}
