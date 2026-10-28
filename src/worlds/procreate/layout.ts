// The hanging plan of the wall: pure functions, no React. Given the size of the wall they return the size of every print and
// its pose (top-left corner in wall pixels + rotation + scale) for these arrangements:
//   loose    the way I hung them: crooked, overlapping a little (hand-placed table on wide walls, jittered columns on small ones)
//   tidy     squared up: no rotation, equal gaps. Wide walls: one row hung on a centre line, the prints scaled down to fit.
//            Mid / narrow walls: plain columns at full size.
//   shuffle  a random scatter that avoids piling prints on top of each other
// Three wall kinds: wide (one screen, the wall height comes from the viewport), mid (two columns) and narrow (one column).
// On mid / narrow walls the height comes from the plan (prints are stacked) and the world sets it on the wall.
import { PRINTS, PRINT_BY_ID, aspectOf, type PrintId } from './data'

export type Kind = 'wide' | 'mid' | 'narrow'
export type Mode = 'loose' | 'tidy' | 'shuffle' | 'custom'

export interface Pose {
  x: number
  y: number
  rot: number
  /** 1 unless the print is scaled down to fit a neat row */
  scale?: number
}

export interface Dims {
  /** outer size of the print: the paper */
  w: number
  h: number
  /** paper border around the picture */
  pad: number
  /** the picture */
  iw: number
  ih: number
  /** the writing strip under the picture */
  ch: number
}

export type DimsMap = Record<PrintId, Dims>
export type PoseMap = Record<PrintId, Pose>

export interface Plan {
  kind: Kind
  s: number
  dims: DimsMap
  /** height of the wall: the measured one on wide walls, the stacked one otherwise */
  wallH: number
  loose: PoseMap
  tidy: PoseMap
  /** wide walls: where the squared-up row sits, so the pencil measuring marks can be drawn round it (wall pixels) */
  row?: { top: number; bottom: number; left: number; right: number; centres: { id: PrintId; cx: number; w: number }[] }
}

const PAD = 0.045
/** scaling happens around this point of the print (see transform-origin in the CSS) */
export const ORIGIN = { x: 0.5, y: 0.42 }
/** the print the wall's own note points at: the first one in the reading order */
const LEAD: PrintId = 'logo'

export function dimsFor(id: PrintId, w: number, strip?: number): Dims {
  const def = PRINT_BY_ID[id]
  const pad = w * PAD
  const iw = w - pad * 2
  const ih = iw / aspectOf(def)
  const ch = w * (strip ?? def.strip)
  return { w, h: pad + ih + ch, pad, iw, ih, ch }
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** small seeded generator (mulberry32) so a shuffle is repeatable in tests */
export function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function kindFor(wallW: number, viewH: number): Kind {
  if (wallW >= 960 && viewH >= 640) return 'wide'
  if (wallW >= 600) return 'mid'
  return 'narrow'
}

/**
 * Where the wall's own "pick one up" note stands. Its arrow is aimed at a real point: the top edge of the first print (the
 * graph-paper logo sheet), found from the print's actual pose (turned about its origin), so the tip lands there however the wall is
 * sized. The lettering hangs above the arrow's tail at the same scale as the prints. All numbers are wall pixels.
 */
export function pickupSpot(plan: Plan): { left: number; bottom: number; font: number; from: [number, number]; to: [number, number] } {
  const d = plan.dims[LEAD]
  const p = plan.loose[LEAD]
  const sc = p.scale ?? 1
  const th = (p.rot * Math.PI) / 180
  const cos = Math.cos(th)
  const sin = Math.sin(th)
  const ox = d.w * ORIGIN.x
  const oy = d.h * ORIGIN.y
  // the point of the paper's top edge that the arrow aims at, after the sheet has been turned (and scaled) about its origin
  const dx = (d.w * 0.27 - ox) * sc
  const dy = -oy * sc
  const edge = { x: p.x + ox + dx * cos - dy * sin, y: p.y + oy + dx * sin + dy * cos }
  const font = clamp(plan.s * 39, 21, 64)
  const length = clamp(plan.s * 50, 32, 84)
  // the tip rests a hair above the paper; the tail leans back to the right, under the gap between "pick" and "one"
  const to: [number, number] = [edge.x, edge.y - 2]
  const from: [number, number] = [to[0] + length * 0.3, to[1] - length * 0.95]
  return { left: from[0] - font * 1.75, bottom: plan.wallH - (from[1] + font * 0.14), font, from, to }
}

/** the free range of a print that is drawn at `scale` around ORIGIN: where its top-left (translate) may be so the paper stays on the wall */
export function range(d: Dims, scale: number, W: number, H: number): { minX: number; maxX: number; minY: number; maxY: number } {
  const ox = d.w * ORIGIN.x * (1 - scale)
  const oy = d.h * ORIGIN.y * (1 - scale)
  return {
    minX: -ox,
    maxX: Math.max(-ox, W - d.w * scale - ox),
    minY: -oy,
    maxY: Math.max(-oy, H - d.h * scale - oy),
  }
}

// ---- wide: the designed wall -----------------------------------------------------------------------------------------------
const REF = { w: 1380, h: 520 }
/** outer width of every print at reference scale */
const WIDE_W: Record<PrintId, number> = { logo: 372, crest: 322, kids: 272, cap: 262, quiff: 230 }
/** hand-hung poses at reference scale: top-left in a 1380 x 520 wall, rotation in degrees */
const WIDE_LOOSE: Record<PrintId, Pose> = {
  logo: { x: 20, y: 128, rot: -2.4 },
  crest: { x: 360, y: 28, rot: 2.1 },
  kids: { x: 668, y: 252, rot: -3.1 },
  cap: { x: 902, y: 66, rot: 2.6 },
  quiff: { x: 1140, y: 24, rot: -2.4 },
}
/** left-to-right order of the neat row */
const ROW: PrintId[] = ['logo', 'crest', 'kids', 'cap', 'quiff']

function wideDims(s: number): DimsMap {
  const out = {} as DimsMap
  for (const p of PRINTS) out[p.id] = dimsFor(p.id, WIDE_W[p.id] * s)
  return out
}

/** the pose that puts the scaled paper's top-left corner at (left, top) */
function atCorner(d: Dims, scale: number, left: number, top: number): Pose {
  return { x: left - d.w * ORIGIN.x * (1 - scale), y: top - d.h * ORIGIN.y * (1 - scale), rot: 0, scale }
}

function planWide(W: number, H: number): Plan {
  const s = clamp(Math.min(W / REF.w, H / REF.h), 0.55, 1.7)
  const dims = wideDims(s)

  const loose = {} as PoseMap
  for (const p of PRINTS) {
    const ref = WIDE_LOOSE[p.id]
    const d = dims[p.id]
    loose[p.id] = {
      x: clamp((ref.x / REF.w) * W, 4, W - d.w - 4),
      y: clamp((ref.y / REF.h) * H, 4, H - d.h - 4),
      rot: ref.rot,
      scale: 1,
    }
  }

  // tidy: one row hung on the wall's middle line, equal gaps (the edges count as gaps), the prints shrunk just enough to fit
  const total = ROW.reduce((acc, id) => acc + dims[id].w, 0)
  const minGap = 20
  const st = clamp((W - minGap * (ROW.length + 1)) / total, 0.4, 1)
  const gap = (W - total * st) / (ROW.length + 1)
  const tidy = {} as PoseMap
  let left = gap
  let top = Infinity
  let bottom = 0
  const centres: { id: PrintId; cx: number; w: number }[] = []
  for (const id of ROW) {
    const d = dims[id]
    const y0 = (H - d.h * st) / 2
    tidy[id] = atCorner(d, st, left, y0)
    top = Math.min(top, y0)
    bottom = Math.max(bottom, y0 + d.h * st)
    centres.push({ id, cx: left + (d.w * st) / 2, w: d.w * st })
    left += d.w * st + gap
  }
  return { kind: 'wide', s, dims, wallH: H, loose, tidy, row: { top, bottom, left: gap, right: W - gap, centres } }
}

// ---- mid and narrow: stacked prints ---------------------------------------------------------------------------------------
const MID_FR: Record<PrintId, number> = { logo: 0.98, crest: 0.88, kids: 0.7, cap: 0.8, quiff: 0.7 }
const NARROW_FR: Record<PrintId, number> = { logo: 0.88, crest: 0.74, kids: 0.62, cap: 0.68, quiff: 0.6 }
const NARROW_ORDER: PrintId[] = ['logo', 'crest', 'kids', 'cap', 'quiff']
const STACK_GAP = 26
const STACK_PAD = 26

function hash01(text: string, salt = 0): number {
  let h = 2166136261 ^ salt
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  return ((h >>> 0) % 10007) / 10007
}

function planMid(W: number): Plan {
  const gap = clamp(W * 0.04, 20, 36)
  const colW = (W - gap * 3) / 2
  const dims = {} as DimsMap
  for (const p of PRINTS) dims[p.id] = dimsFor(p.id, colW * MID_FR[p.id])

  // best split of the five prints into two columns (smallest taller column)
  const ids = PRINTS.map((p) => p.id)
  let best: { cols: [PrintId[], PrintId[]]; height: number } | null = null
  for (let mask = 1; mask < 31; mask++) {
    const a = ids.filter((_, i) => mask & (1 << i))
    const b = ids.filter((_, i) => !(mask & (1 << i)))
    const hA = a.reduce((acc, id) => acc + dims[id].h + STACK_GAP, 0)
    const hB = b.reduce((acc, id) => acc + dims[id].h + STACK_GAP, 0)
    const height = Math.max(hA, hB)
    if (!best || height < best.height - 1) best = { cols: [a, b], height }
  }
  const cols = best!.cols
  const loose = {} as PoseMap
  const tidy = {} as PoseMap
  let wallH = 0
  cols.forEach((col, ci) => {
    let y = STACK_PAD
    const x0 = gap + ci * (colW + gap)
    col.forEach((id, row) => {
      const d = dims[id]
      const slack = colW - d.w
      const jx = (hash01(id, 3) - 0.5) * Math.min(slack + gap, 46)
      const jy = (hash01(id, 7) - 0.5) * 22
      tidy[id] = { x: x0 + slack / 2, y, rot: 0, scale: 1 }
      loose[id] = {
        x: clamp(x0 + slack / 2 + jx, 6, W - d.w - 6),
        y: y + jy + (row === 0 ? 4 : 0),
        rot: (hash01(id, 11) - 0.5) * 6.4,
        scale: 1,
      }
      y += d.h + STACK_GAP
    })
    wallH = Math.max(wallH, y - STACK_GAP + STACK_PAD)
  })
  return { kind: 'mid', s: colW / 330, dims, wallH, loose, tidy }
}

function planNarrow(W: number): Plan {
  const dims = {} as DimsMap
  for (const p of PRINTS) dims[p.id] = dimsFor(p.id, Math.min(W * NARROW_FR[p.id], 360))
  const loose = {} as PoseMap
  const tidy = {} as PoseMap
  let y = STACK_PAD
  NARROW_ORDER.forEach((id, i) => {
    const d = dims[id]
    const left = i % 2 === 0
    const edge = clamp(W * 0.025, 6, 14)
    const x = left ? edge : W - d.w - edge
    tidy[id] = { x: (W - d.w) / 2, y, rot: 0, scale: 1 }
    loose[id] = { x, y: y + (hash01(id, 5) - 0.5) * 10, rot: (left ? -1 : 1) * (1.4 + hash01(id, 9) * 2.6), scale: 1 }
    y += d.h + STACK_GAP
  })
  return { kind: 'narrow', s: W / 358, dims, wallH: y - STACK_GAP + STACK_PAD, loose, tidy }
}

export function planFor(kind: Kind, W: number, H: number): Plan {
  if (kind === 'wide') return planWide(W, H)
  return kind === 'mid' ? planMid(W) : planNarrow(W)
}

// ---- shuffle: best-candidate scatter ---------------------------------------------------------------------------------------
function overlap(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }): number {
  const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
  const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)
  return ox > 0 && oy > 0 ? ox * oy : 0
}

type Box = { x: number; y: number; w: number; h: number }

/** a print is a little wider than its box once it is turned and its tape is on: neighbours keep this much clear */
const fat = (b: Box): Box => ({ x: b.x - 9, y: b.y - 9, w: b.w + 18, h: b.h + 18 })

/** the largest share of the smaller print that any neighbour hides (0 = no two prints touch) */
function worstCover(boxes: Box[]): number {
  let worst = 0
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      worst = Math.max(worst, overlap(fat(boxes[i]), fat(boxes[j])) / Math.min(boxes[i].w * boxes[i].h, boxes[j].w * boxes[j].h))
    }
  }
  return worst
}

/**
 * Shuffle: the prints are thrown at random, but a pile is not allowed to happen (a hand-lettered note under a picture must stay
 * readable). 140 complete throws are made, each print going to the free-est of 90 random spots; of those, one of the three that
 * hide the least is kept. Seeded, so a shuffle is repeatable in tests.
 */
export function scatter(plan: Plan, W: number, seed: number): PoseMap {
  const rand = rng(seed * 7919 + 17)
  // the big ones first: they are the hardest to place
  const order = [...PRINTS].sort((a, b) => plan.dims[b.id].w * plan.dims[b.id].h - plan.dims[a.id].w * plan.dims[a.id].h)
  const throws: { boxes: Box[]; worst: number }[] = []
  for (let attempt = 0; attempt < 140; attempt++) {
    const boxes: Box[] = []
    for (const p of order) {
      const d = plan.dims[p.id]
      let best: Box = { x: 6, y: 6, w: d.w, h: d.h }
      let bestTotal = Infinity
      for (let tries = 0; tries < 90; tries++) {
        const box = { x: 6 + rand() * Math.max(0, W - d.w - 12), y: 6 + rand() * Math.max(0, plan.wallH - d.h - 12), w: d.w, h: d.h }
        const total = boxes.reduce((acc, other) => acc + overlap(fat(box), fat(other)), 0)
        if (total < bestTotal) {
          bestTotal = total
          best = box
        }
      }
      boxes.push(best)
    }
    throws.push({ boxes, worst: worstCover(boxes) })
  }
  throws.sort((a, b) => a.worst - b.worst)
  const chosen = throws[Math.floor(rand() * 3)].boxes
  const out = {} as PoseMap
  order.forEach((p, i) => {
    out[p.id] = { x: chosen[i].x, y: chosen[i].y, rot: (rand() - 0.5) * 12, scale: 1 }
  })
  return out
}

/** where a pose sits inside the free range of the wall, 0..1 (so a custom arrangement survives a resize) */
export function toNorm(pose: Pose, d: Dims, W: number, H: number): Pose {
  const sc = pose.scale ?? 1
  const r = range(d, sc, W, H)
  return { x: (pose.x - r.minX) / Math.max(1, r.maxX - r.minX), y: (pose.y - r.minY) / Math.max(1, r.maxY - r.minY), rot: pose.rot, scale: sc }
}

export function fromNorm(n: Pose, d: Dims, W: number, H: number): Pose {
  const sc = n.scale ?? 1
  const r = range(d, sc, W, H)
  return { x: r.minX + n.x * (r.maxX - r.minX), y: r.minY + n.y * (r.maxY - r.minY), rot: n.rot, scale: sc }
}
