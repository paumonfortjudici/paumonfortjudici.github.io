import type { FlipLabels, FlipPage, FlipSpreadInfo } from './types'

/** A face of a leaf: a page, or null for a blank face (padding / the back of a single-mode leaf). */
export type Face = FlipPage | null

export interface LeafModel {
  /** Leaf index, 0 = first leaf of the book. */
  k: number
  front: Face
  back: Face
}

export interface BookModel {
  /** All faces in reading order, padded with blanks so that the length is even. */
  faces: Face[]
  /** Spread-mode leaves: faces[2k] (front, right-hand) and faces[2k + 1] (back, left-hand). */
  leaves: LeafModel[]
  /** Number of leaves in spread mode. */
  L: number
  /** Number of spreads: L + 1 (0 = closed front, L = closed back); L when the book ends on a padded blank (no back cover, odd count). */
  spreads: number
  /** Non-blank faces in reading order (single-page mode steps through these). */
  single: FlipPage[]
  /** Index in `faces` -> index in `single` (-1 for blanks). */
  toSingle: number[]
  /** Page id -> index in `faces`. */
  index: Map<string, number>
}

export type Mode = 'spread' | 'single'

export const DEFAULT_LABELS: FlipLabels = {
  label: 'Book',
  prev: 'Previous pages',
  next: 'Next pages',
  scrubber: 'Go to pages',
  cover: 'Front cover',
  back: 'Back cover',
  pages: (a, b, total) => `Pages ${a} and ${b} of ${total}`,
  page: (n, total) => `Page ${n} of ${total}`,
}

export function buildModel(pages: FlipPage[]): BookModel {
  const faces: Face[] = pages.slice()
  const hasBack = faces.length > 1 && faces[faces.length - 1]!.kind === 'back'
  const endPad = faces.length % 2 === 1 && !hasBack
  if (faces.length % 2 === 1) {
    // an odd number of faces: a blank (endpaper) goes before the back cover, or at the very end
    if (hasBack) faces.splice(faces.length - 1, 0, null)
    else faces.push(null)
  }
  const leaves: LeafModel[] = []
  for (let k = 0; k * 2 < faces.length; k++) leaves.push({ k, front: faces[2 * k] ?? null, back: faces[2 * k + 1] ?? null })
  const single: FlipPage[] = []
  const toSingle: number[] = []
  const index = new Map<string, number>()
  faces.forEach((f, i) => {
    if (f) {
      toSingle[i] = single.length
      single.push(f)
      index.set(f.id, i)
    } else toSingle[i] = -1
  })
  // a book without a back cover that ends on a padded blank stops on its last real page instead of an empty one
  return { faces, leaves, L: leaves.length, spreads: endPad ? leaves.length : leaves.length + 1, single, toSingle, index }
}

/** Leaves of the book in the given mode. In single mode every page is its own leaf (its back is plain paper). */
export function leavesFor(model: BookModel, mode: Mode): LeafModel[] {
  if (mode === 'spread') return model.leaves
  return model.single.map((front, k) => ({ k, front, back: null }))
}

/** Largest position: spread mode = number of leaves; single mode = last page. */
export function maxPos(model: BookModel, mode: Mode): number {
  return mode === 'spread' ? model.spreads - 1 : Math.max(0, model.single.length - 1)
}

export function posToSpread(model: BookModel, mode: Mode, pos: number): number {
  if (mode === 'spread') return pos
  const page = model.single[pos]
  if (!page) return 0
  const f = model.index.get(page.id) ?? 0
  return Math.ceil(f / 2)
}

/** Position that shows (the left page of) a spread. */
export function spreadToPos(model: BookModel, mode: Mode, spread: number): number {
  const s = Math.max(0, Math.min(model.spreads - 1, Math.round(spread) || 0))
  if (mode === 'spread') return s
  if (s === 0) return 0
  const left = model.faces[2 * s - 1]
  const right = model.faces[2 * s] ?? null
  const face = left ?? right
  if (!face) return Math.max(0, model.single.length - 1)
  return Math.max(0, model.toSingle[model.index.get(face.id)!] ?? 0)
}

/** Position that shows a given page (single mode) or its spread (spread mode). */
export function pageToPos(model: BookModel, mode: Mode, id: string): number {
  const f = model.index.get(id)
  if (f === undefined) return -1
  if (mode === 'spread') return Math.ceil(f / 2)
  return model.toSingle[f]!
}

export function visibleFaces(model: BookModel, mode: Mode, pos: number): { left: Face; right: Face } {
  if (mode === 'single') return { left: null, right: model.single[pos] ?? null }
  return { left: pos >= 1 ? model.faces[2 * pos - 1] ?? null : null, right: pos < model.L ? model.faces[2 * pos] ?? null : null }
}

export function describe(model: BookModel, mode: Mode, pos: number, labels: FlipLabels, total: number): FlipSpreadInfo {
  const { left, right } = visibleFaces(model, mode, pos)
  const spread = posToSpread(model, mode, pos)
  const numberOf = (p: FlipPage) => p.n ?? (model.index.get(p.id) ?? 0) + 1
  const pages = [left, right].filter((p): p is FlipPage => !!p)
  let text = ''
  if (pages.length === 2) text = labels.pages(numberOf(pages[0]!), numberOf(pages[1]!), total)
  else if (pages.length === 1) {
    const p = pages[0]!
    text = p.kind === 'cover' ? labels.cover : p.kind === 'back' ? labels.back : labels.page(numberOf(p), total)
  }
  return { index: spread, count: model.spreads, left, right, pages, text }
}
