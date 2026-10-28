// Where everything is pinned on the evidence board. Units: 1u = 1 % of the board's width (the board is 100u wide and BOARD_H tall),
// so the whole wall scales with its container. Suspects hang in two line-ups (feet on a baseline, like the height chart on the
// cover), each in order of year; the line-ups (prints) are pinned in a block on the right; strings join each print to its
// suspect and run along each row.
import { ART, SUSPECTS, type ArtItem, type SuspectItem } from './data'

export const BOARD_H = 64.2

/** u per image pixel: the tallest suspect is about 16u high */
const SCALE = 0.0162
const ROW_FEET = [27.4, 49.6]
const LEFT = 3.6
const RIGHT = 60.4

export interface SuspectPlace {
  id: string
  item: SuspectItem
  x: number
  y: number
  w: number
  h: number
  rot: number
  row: 0 | 1
  /** position in the whole year order (0 = oldest) */
  nth: number
}

export interface PrintPlace {
  id: string
  art: ArtItem
  x: number
  y: number
  w: number
  rot: number
  inBook: boolean
}

/** deterministic hand-placed jitter in [-1, 1] */
const jit = (i: number, k: number): number => Math.sin(i * 12.9898 + k * 78.233) * 0.9999

export const suspectId = (s: SuspectItem): string => `${String(s.case).padStart(2, '0')}${s.letter}`

export function placeSuspects(): SuspectPlace[] {
  const sorted = [...SUSPECTS].sort((a, b) => a.year - b.year)
  const rows: SuspectItem[][] = [[], []]
  sorted.forEach((s, i) => rows[i % 2].push(s))
  const out: SuspectPlace[] = []
  rows.forEach((row, r) => {
    const widths = row.map((s) => s.w * SCALE)
    const gap = (RIGHT - LEFT - widths.reduce((a, b) => a + b, 0)) / (row.length - 1)
    let cursor = LEFT
    row.forEach((s, i) => {
      const w = widths[i]
      const h = s.h * SCALE
      const nth = sorted.indexOf(s)
      const x = cursor + jit(nth, 1) * 0.35
      const feet = ROW_FEET[r] + jit(nth, 2) * 0.7
      out.push({ id: suspectId(s), item: s, x, y: feet - h, w, h, rot: jit(nth, 3) * 3.2, row: r as 0 | 1, nth })
      cursor += w + gap
    })
  })
  return out.sort((a, b) => a.nth - b.nth)
}

/** the line-ups on the board: three of them are also pages of the sample book (the two film sets, 07 and 75, hang side by side) */
const PRINT_CASES: { case: number; x: number; y: number; rot: number }[] = [
  { case: 7, x: 64.4, y: 2, rot: -2 },
  { case: 75, x: 81.8, y: 2.8, rot: 1.6 },
  { case: 16, x: 64, y: 15.4, rot: 1.3 },
  { case: 45, x: 81.4, y: 16.2, rot: -1.5 },
  { case: 6, x: 64.6, y: 28.8, rot: -1.1 },
  { case: 70, x: 81.6, y: 29.4, rot: 2 },
]

export const PRINT_W = 14.4
export const BOOK_CASES = [1, 7, 45, 59, 67, 75]

export function placePrints(): PrintPlace[] {
  return PRINT_CASES.map((p) => {
    const art = ART.find((a) => a.case === p.case)!
    return { id: `print-${p.case}`, art, x: p.x, y: p.y, w: PRINT_W, rot: p.rot, inBook: BOOK_CASES.includes(p.case) }
  })
}

/** the paper index card (what the selected print says) */
export const CARD = { x: 64.4, y: 43.8, w: 31.8 }
export const NOTE = { x: 4.2, y: 1.6, w: 15.5 }
/** the hand-written "oldest -> newest" under the line-ups */
export const TIMELINE = { x: 4.6, y: 57, w: 40 }

export interface Link {
  a: string
  b: string
  kind: 'row' | 'case'
  /** the line-up cases a 'case' string belongs to (the selected print lights its own strings) */
  cases?: number[]
}

/** strings: along each row in order of year, and from each print to the suspect of the same case (Cannes joins the other film set) */
export function placeLinks(suspects: SuspectPlace[], prints: PrintPlace[]): Link[] {
  const links: Link[] = []
  for (const row of [0, 1] as const) {
    const rs = suspects.filter((s) => s.row === row)
    for (let i = 0; i < rs.length - 1; i++) links.push({ a: rs[i].id, b: rs[i + 1].id, kind: 'row' })
  }
  for (const p of prints) {
    const match = suspects.find((s) => s.item.case === p.art.case)
    if (match) links.push({ a: match.id, b: p.id, kind: 'case', cases: [p.art.case] })
  }
  const cannes = prints.find((p) => p.art.case === 75)
  const film = prints.find((p) => p.art.case === 7)
  if (cannes && film) links.push({ a: film.id, b: cannes.id, kind: 'case', cases: [7, 75] })
  return links
}
