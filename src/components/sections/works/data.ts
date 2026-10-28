// Works section data: the bento recipes (where each folder sits for every filter), each folder's pose and art
// (tab position, peek, print tilt, tape), alt texts and the local fallbacks used while a card's art file is missing.
// Nothing here is a claim about Pau: titles, kinds, years and blurbs all come from the registry (src/lib/works.ts).

import type { Category } from '@/lib/works'

export type FilterId = Category | 'all'

/** f = featured (6 columns x 2 rows), s = small (3 x 1), w = the empty folder stretched to 6 x 1, n = the drawer note (6 x 1) */
export type CellKind = 'f' | 's' | 'w' | 'n'

export interface Cell {
  slug: string
  kind: CellKind
  /** 1-based column start / span and row start / span on the 12-column desktop grid */
  col: number
  span: number
  row: number
  rows: number
}

export const YOURS = 'yours'
/** the drawer note: a sticky note on the short drawers (Editorial, Web, Print) that says how many folders are in it and brings the rest back */
export const NOTE = 'note'

const f = (slug: string, col: number, row: number): Cell => ({ slug, kind: 'f', col, span: 6, row, rows: 2 })
const s = (slug: string, col: number, row: number): Cell => ({ slug, kind: 's', col, span: 3, row, rows: 1 })
const y = (col: number, row: number, wide = false): Cell => ({ slug: YOURS, kind: wide ? 'w' : 's', col, span: wide ? 6 : 3, row, rows: 1 })
const note = (col: number, row: number): Cell => ({ slug: NOTE, kind: 'n', col, span: 6, row, rows: 1 })

/**
 * Desktop recipes (>= 1100px). Every filter is its own composition on the 12-column grid, so a short list never leaves a hole:
 *   all           3 featured + 7 small + the empty folder = exactly 5 rows of 12 columns
 *   branding      one featured + a 2x2 block of small ones = exactly 2 rows
 *   illustration  a tall featured folder between two columns of small ones
 *   the others    featured pairs, then a last row of 12 columns: the small folders, the drawer note and the empty folder
 * Below 1100px the grid is 2 columns (then 1) and flows in registry order: the recipe is ignored (the drawer note is hidden there).
 */
export const LAYOUTS: Record<FilterId, Cell[]> = {
  all: [
    f('contract', 1, 1),
    f('plana', 7, 1),
    s('fortyfour-lab', 1, 3),
    f('spelled-guilty', 4, 3),
    s('space-monkey', 10, 3),
    s('procreate', 1, 4),
    s('somia', 10, 4),
    s('concept-brand', 1, 5),
    s('concept-portfolio', 4, 5),
    s('illustration', 7, 5),
    y(10, 5),
  ],
  editorial: [f('contract', 1, 1), f('spelled-guilty', 7, 1), s('concept-portfolio', 1, 3), note(4, 3), y(10, 3)],
  branding: [f('plana', 1, 1), s('fortyfour-lab', 7, 1), s('somia', 10, 1), s('concept-brand', 7, 2), y(10, 2)],
  web: [f('plana', 1, 1), f('somia', 7, 1), note(1, 3), y(7, 3, true)],
  illustration: [
    s('fortyfour-lab', 1, 1),
    f('spelled-guilty', 4, 1),
    s('space-monkey', 10, 1),
    s('procreate', 1, 2),
    s('concept-brand', 10, 2),
    s('concept-portfolio', 1, 3),
    s('illustration', 4, 3),
    y(7, 3, true),
  ],
  print: [f('contract', 1, 1), f('space-monkey', 7, 1), note(1, 3), y(7, 3, true)],
}

/** the two folders that stay double-width on tablet (2 columns); every other card is one column wide there */
export const TABLET_WIDE = new Set(['contract', 'plana'])

export interface Pose {
  /** resting vertical offset in px (desktop) and tilt of the whole folder in degrees. Kept small: rows never collide. */
  dy: number
  rot: number
  /** tilt of the print inside the folder */
  prot: number
  /** where the tab sits along the top edge, 0..1 */
  tabX: number
}

export const POSES: Record<string, Pose> = {
  contract: { dy: 0, rot: -0.35, prot: -0.9, tabX: 0.07 },
  plana: { dy: 14, rot: 0.4, prot: 0.7, tabX: 0.84 },
  'fortyfour-lab': { dy: 6, rot: -0.45, prot: -1.3, tabX: 0.12 },
  'spelled-guilty': { dy: -4, rot: 0.3, prot: 0.6, tabX: 0.5 },
  'space-monkey': { dy: 10, rot: 0.5, prot: 1.1, tabX: 0.8 },
  procreate: { dy: -6, rot: 0.4, prot: -0.8, tabX: 0.08 },
  somia: { dy: -8, rot: -0.4, prot: 0.9, tabX: 0.86 },
  'concept-brand': { dy: 4, rot: -0.3, prot: -1, tabX: 0.1 },
  'concept-portfolio': { dy: -8, rot: 0.5, prot: 0.8, tabX: 0.8 },
  illustration: { dy: 6, rot: -0.45, prot: -0.7, tabX: 0.42 },
  [YOURS]: { dy: 0, rot: 0.35, prot: 0, tabX: 0.14 },
  [NOTE]: { dy: 0, rot: -1.4, prot: 0, tabX: 0 },
}

export interface PeekArt {
  /** intrinsic size of the file (the attributes only reserve the aspect ratio: the peek is absolutely positioned) */
  w: number
  h: number
  /** horizontal centre as a percentage of the folder width */
  x: number
  /** tilt in degrees */
  rot: number
  /** size multiplier on the base peek height (58 % of the card width) */
  k?: number
}

export interface TapeArt {
  at: 'top' | 'bottom' | 'tl' | 'tr' | 'bl' | 'br'
  /** for at: 'top' | 'bottom': where along the edge the piece sits, in % (default 50) */
  x?: number
  color: 'butter' | 'marigold' | 'lagoon' | 'bubblegum' | 'tomato' | 'lilac' | 'olive'
  pattern?: 'plain' | 'stripes' | 'dots' | 'grid' | 'checks'
  rotate?: number
}

export interface Art {
  /** alt text of the print (it is the work itself, so it is described) */
  alt: string
  peek?: PeekArt
  /** tape that holds the print: only two folders carry it */
  tape?: TapeArt[]
}

/** The files' real sizes (measured): contract 481x640, plana 695x640, 44 Lab 511x633, Spelled Guilty 428x640, Space Monkey 433x640, Procreate 411x640, Somia 336x519. */
export const ART: Record<string, Art> = {
  contract: {
    alt: 'Opening page of a feature in Proyecto Contract: a blue flagship store under the headline Retail hipnótico, beside a rust OPEN SPACE tab.',
    peek: { w: 481, h: 640, x: 70, rot: 3 },
    tape: [{ at: 'top', x: 78, color: 'lagoon', pattern: 'stripes', rotate: 3 }],
  },
  plana: {
    alt: 'Plana Digital identity: the sunrise-over-a-browser symbol, the round 72 h seal and a sample social post.',
    peek: { w: 695, h: 640, x: 27, rot: -3, k: 0.8 },
  },
  'fortyfour-lab': {
    alt: 'Close-up of a hand-tufted rug in pink, lilac and mint, with the 44 Lab logo and its hand-drawn devil.',
    peek: { w: 511, h: 633, x: 72, rot: 4 },
    tape: [{ at: 'top', color: 'bubblegum', pattern: 'dots', rotate: -2 }],
  },
  'spelled-guilty': {
    alt: 'The Spelled Guilty paperback on a kraft table beside an open case file and word search.',
    peek: { w: 388, h: 640, x: 21, rot: -3 },
  },
  'space-monkey': {
    alt: 'The TYLER and SMITH escape-room posters pinned side by side, with the monkey-astronaut patch.',
    peek: { w: 433, h: 640, x: 25, rot: -4 },
  },
  procreate: {
    alt: 'Two flat-colour portraits in four tones of orange, cut out like paper on a teal wall.',
    peek: { w: 411, h: 640, x: 66, rot: 3 },
  },
  somia: {
    alt: 'A red and blue woollen handbag carrying the Somia tag, under the Somia wordmark.',
    peek: { w: 336, h: 519, x: 22, rot: -3, k: 0.95 },
  },
  'concept-brand': {
    alt: 'The red g and olive o of the Gotet wordmark, huge on a pink pattern, above three of its mascots: a vermouth glass with a lemon slice, an olive in a red beret and a blue soda siphon.',
    peek: { w: 767, h: 633, x: 62, rot: 3, k: 0.8 },
  },
  'concept-portfolio': {
    alt: 'Three slides of a fictional foley artist’s portfolio deck on a tomato-red desk: the FOLEY PORTFOLIO cover with a furry boom microphone, an I’M ONA RIBAS page and a SELECTED PROJECTS page.',
    peek: { w: 561, h: 628, x: 30, rot: -3, k: 0.95 },
  },
  illustration: {
    alt: 'Four die-cut doodle stickers piled on cream paper: a rug maker with a tufting gun and a peeling corner, a skater with a boombox, a gardener carrying a huge plant and a director with a megaphone.',
    peek: { w: 430, h: 632, x: 76, rot: 4, k: 0.95 },
  },
}

/**
 * Cards whose peek is not the registry's peek.webp. Spelled Guilty's registry peek is the paperback cover, which is also the print inside the
 * card (the Cover deck uses it): the card's own peek is a die-cut suspect from the book (public/works/spelled-guilty/peek-suspect.webp,
 * derived from stickers/suspect-10A.webp with a paper die-cut border), a second object instead of a second copy of the first.
 */
export const PEEK_SRC: Record<string, string> = {
  'spelled-guilty': '/works/spelled-guilty/peek-suspect.webp',
}

export interface FallbackArt {
  /** used when the registry's thumb.webp / peek.webp does not exist (yet) */
  thumb?: { src: string; w: number; h: number; pos: string }
  /** `paper`: a flat rectangle (a slide), not a cut-out: it gets a paper border like a print. w / h = the file's size, k = size multiplier, x / rot = position and tilt */
  peek?: { src: string; paper?: boolean; w?: number; h?: number; k?: number; x?: number; rot?: number }
  /** a CSS collage of die-cut stickers instead of a single picture (the illustration folder) */
  collage?: { src: string; x: number; y: number; w: number; rot: number }[]
}

/**
 * Folders whose official card art exists on disk: public/works/<slug>/thumb.webp and peek.webp (docs/api/card-art.md).
 * Asking for a file that is not there is a 404 on the live site (the dev server answers index.html with 200 and hides it), so a folder
 * that is not listed goes straight to FALLBACK and never makes the request. When the card-art files of the three concept folders land,
 * add their slugs here (and delete FALLBACK): nothing else changes. The <img onError> below remains the safety net for listed slugs.
 */
export const OFFICIAL_ART = new Set<string>([
  'contract',
  'plana',
  'fortyfour-lab',
  'spelled-guilty',
  'space-monkey',
  'procreate',
  'somia',
  'concept-brand',
  'concept-portfolio',
  'illustration',
])

/**
 * Stage 1 shipped card art for seven folders; the three concept folders were announced as "later". Until public/works/<slug>/thumb.webp
 * and peek.webp exist, each concept card falls back to real pieces that are already in public/works/<slug>/art. Once the official files
 * land nothing here is used any more (the <img onError> only fires when the request fails).
 */
export const FALLBACK: Record<string, FallbackArt> = {
  'concept-brand': {
    thumb: { src: '/works/concept-brand/art/brand/cast-sheet.webp', w: 3000, h: 2400, pos: '40% 12%' },
    peek: { src: '/works/concept-brand/art/brand/mascot-sifo-head-1.webp' },
  },
  'concept-portfolio': {
    thumb: { src: '/works/concept-portfolio/art/slide-1.webp', w: 1080, h: 1920, pos: '50% 0%' },
    // slide 2 of the deck sticks out of the folder like a slide out of a tray: a flat rectangle with a paper border, not a cut-out
    peek: { src: '/works/concept-portfolio/art/slide-2.webp', paper: true, w: 1080, h: 1920, k: 0.95, x: 70, rot: 5 },
  },
  illustration: {
    collage: [
      { src: '/works/illustration/art/thumb-05.webp', x: 6, y: 8, w: 50, rot: -5 },
      { src: '/works/illustration/art/thumb-07.webp', x: 46, y: 2, w: 50, rot: 4 },
      { src: '/works/illustration/art/thumb-02.webp', x: 4, y: 46, w: 48, rot: 3 },
      { src: '/works/illustration/art/thumb-06.webp', x: 48, y: 42, w: 48, rot: -4 },
    ],
    peek: { src: '/works/illustration/art/thumb-05.webp' },
  },
}

/** "01 · 04 & 09" / "02–03 & 07–08": the file numbers of the folders on show, runs of two or more collapsed into ranges */
export function fileNumbers(nums: number[]): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  const sorted = [...nums].sort((a, b) => a - b)
  const parts: string[] = []
  let i = 0
  while (i < sorted.length) {
    let j = i
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++
    parts.push(j > i ? `${pad(sorted[i])}–${pad(sorted[j])}` : pad(sorted[i]))
    i = j + 1
  }
  // two or more groups: the last one is joined with an ampersand ("02 & 07"), so it reads as two folders, not as a range
  return parts.length > 1 ? `${parts.slice(0, -1).join(' · ')} & ${parts[parts.length - 1]}` : parts[0] ?? ''
}

/**
 * The colour of each filter tab and of the bar under the rail (ink text on every one except `all`, which is cream on ink).
 * Branding, editorial and illustration match the cover's quick tabs; web is tomato here because butter vanishes on a cream sheet.
 */
export const FILTER_TONE: Record<FilterId, { color: string; ink: string }> = {
  all: { color: 'var(--ink)', ink: 'var(--cream)' },
  editorial: { color: 'var(--lagoon)', ink: 'var(--ink)' },
  branding: { color: 'var(--marigold)', ink: 'var(--ink)' },
  web: { color: 'var(--tomato)', ink: 'var(--ink)' },
  illustration: { color: 'var(--bubblegum)', ink: 'var(--ink)' },
  print: { color: 'var(--lilac)', ink: 'var(--ink)' },
}

/** All while another drawer is open: a pale blank divider (ink label) so the one black tab in the rail is always the selected one */
export const IDLE_ALL_TONE = { color: 'color-mix(in srgb, var(--ink) 13%, var(--cream))', ink: 'var(--ink)' }
