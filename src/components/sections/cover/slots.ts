// Hand-placed geometry of the cover deck: ten folders in two staggered tiers (wide), two cascades (duo) or one cascade (solo).
// Everything here is DATA for the CSS (custom properties on each slot) and for the Folder's `tabX`; the layout maths live in cover.css.
//   col / row   position in the wide layout (5 per tier; the back row is row 0, the front row overlaps it)
//   jx / jy     tenths of a container-width unit (1cqw) of hand-made wobble: the tiers are never a ruler-straight grid
//   tab         where the tab sits along the folder's top edge (0..1; <= 0 flush left, >= 1 flush right), per layout
//   tilt        degrees, how the peek cut-out leans when it comes out of the folder

import { asset } from '../../../lib/asset'

export type DeckLayout = 'wide' | 'duo' | 'solo'

export interface DeckSlot {
  col: number
  row: 0 | 1
  jx: number
  jy: number
  tab: Record<DeckLayout, number>
  tilt: number
}

export const DECK_SLOTS: readonly DeckSlot[] = [
  // back tier
  { col: 0, row: 0, jx: 0, jy: 0, tab: { wide: 0, duo: 0.06, solo: 0.05 }, tilt: -5 },
  { col: 1, row: 0, jx: 2, jy: 5, tab: { wide: 0.46, duo: 0.52, solo: 0.55 }, tilt: 4 },
  { col: 2, row: 0, jx: -2, jy: 1, tab: { wide: 0.1, duo: 0.22, solo: 0.2 }, tilt: -3 },
  { col: 3, row: 0, jx: 1, jy: 8, tab: { wide: 0.52, duo: 0.7, solo: 0.76 }, tilt: 5 },
  { col: 4, row: 0, jx: 0, jy: 3, tab: { wide: 0.96, duo: 0.1, solo: 0.1 }, tilt: -4 },
  // front tier
  { col: 0, row: 1, jx: 0, jy: 0, tab: { wide: 0.3, duo: 0.6, solo: 0.6 }, tilt: 3 },
  { col: 1, row: 1, jx: 2, jy: -4, tab: { wide: 0, duo: 0.28, solo: 0.3 }, tilt: -5 },
  { col: 2, row: 1, jx: -2, jy: 4, tab: { wide: 0.5, duo: 0.8, solo: 0.85 }, tilt: 4 },
  { col: 3, row: 1, jx: 1, jy: -2, tab: { wide: 0.16, duo: 0.36, solo: 0.4 }, tilt: -3 },
  { col: 4, row: 1, jx: 0, jy: 6, tab: { wide: 0.56, duo: 0.56, solo: 0.66 }, tilt: 5 },
]

/**
 * Intrinsic size of each peek.webp that EXISTS in public/works (docs/api/card-art.md). A slug that is not listed here gets no
 * request for it (a missing file would be a 404 on GitHub Pages).
 */
export const PEEK_SIZE: Record<string, readonly [number, number]> = {
  contract: [481, 640],
  plana: [695, 640],
  'fortyfour-lab': [511, 633],
  'spelled-guilty': [428, 640],
  'space-monkey': [433, 640],
  procreate: [411, 640],
  somia: [336, 519],
  'concept-brand': [767, 633],
  'concept-portfolio': [561, 628],
  illustration: [430, 632],
}

/** Stand-in cut-outs bundled with the cover, for a folder whose public/works/<slug>/peek.webp is missing. Empty now: every folder has its card art. */
export const LOCAL_PEEK: Record<string, { src: string; size: readonly [number, number] }> = {}

/** where a project's cut-out lives and how big it is: the registry's file when it exists, else the cover's own */
export function peekFor(slug: string, registryPath: string | undefined): { src: string; size: readonly [number, number] } | null {
  const size = PEEK_SIZE[slug]
  if (size && registryPath) return { src: asset(registryPath), size }
  return LOCAL_PEEK[slug] ?? null
}
export const peekSize = (slug: string): readonly [number, number] | null => PEEK_SIZE[slug] ?? LOCAL_PEEK[slug]?.size ?? null

/** container widths (px of the cover's content box) where the deck changes shape */
export const WIDE_MIN = 860
export const DUO_MIN = 600
export const layoutFor = (width: number): DeckLayout => (width >= WIDE_MIN ? 'wide' : width >= DUO_MIN ? 'duo' : 'solo')

// ---- tab positions that always fit their strip (wide layout) ----------------------------------------------------------
// A folder is 24% of the deck wide and the next one covers its right part, so only `strip` px of it are visible. The tab
// (label + arrow, about 150px, plus a 12px shoulder on each side) must end inside that strip or the neighbour would cut
// it. Keep these constants in step with --fw / --m in cover.css.
export const WIDE_FW = 0.24
export const WIDE_M = 0.01
const TAB_W = 150
const TAB_SHOULDER = 12
const TAB_MARGIN = 8
/** distance of the corner arc + the shoulder from the folder's edge (Folder: --br 18 + --fr 12) */
const TAB_EDGE = 30

/** the tab position (0..1 along the folder's top edge) for a wide-layout slot, capped so the tab never runs under the next folder */
export function fitTab(t: number, deckWidth: number, lastColumn: boolean): number {
  if (lastColumn || deckWidth <= 0 || t <= 0) return t
  const folder = deckWidth * WIDE_FW
  const strip = (deckWidth * (1 - WIDE_FW - 2 * WIDE_M)) / 4
  const room = strip - TAB_SHOULDER - TAB_MARGIN - TAB_W // furthest left edge of the tab that still fits
  const span = folder - 2 * TAB_EDGE - TAB_W // travel of the tab between its corner stops
  if (room <= TAB_EDGE || span <= 0) return 0
  return Math.min(t, (room - TAB_EDGE) / span)
}
