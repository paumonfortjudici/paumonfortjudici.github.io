// Static data of the Sticker Sheet world. Sources (copied, not guessed):
//   public/works/illustration/art/manifest.json  -> captions, accents, hex values, alt text, file names
//   art-src/illustration/sheet/layout.json       -> where each sticker's CANVAS CENTRE sits on the 2400 x 3200 sheet (px), its
//                                                   rotation (degrees clockwise) and its scale multiplier (the baked sheet's recipe)
import { asset } from '../../lib/asset'

/** the sticker canvas, in pixels (every sticker-0N.webp is 1200 x 1600, transparent) */
export const CANVAS_W = 1200
export const CANVAS_H = 1600
export const CANVAS_RATIO = CANVAS_H / CANVAS_W

/** the baked sheet is 2400 x 3200; stickers sit at 0.62 x their canvas, so a canvas is 0.31 of the sheet's width */
export const SHEET_W = 2400
export const SHEET_H = 3200
export const SLOT_UNIT = 0.31

export const art = (file: string): string => asset(`/works/illustration/art/${file}`)

export interface StickerInfo {
  n: number
  file: string
  thumb: string
  caption: string
  accent: string
  hex: string
  alt: string
}

export const STICKERS: readonly StickerInfo[] = [
  {
    n: 1, file: 'sticker-01.webp', thumb: 'thumb-01.webp', caption: 'Boombox ollie', accent: 'lilac', hex: '#C6B1FE',
    alt: 'A skater in a black beanie and baggy plaid trousers pops an ollie, a boombox on one shoulder and a rock-on hand in the air.',
  },
  {
    n: 2, file: 'sticker-02.webp', thumb: 'thumb-02.webp', caption: 'Just one more chapter', accent: 'tangerine', hex: '#FFA65F',
    alt: 'A cosy reader in round glasses and a cable-knit sweater sits cross-legged on a tower of books, holding a hardback while a sleeping black cat curls up on their lap.',
  },
  {
    n: 3, file: 'sticker-03.webp', thumb: 'thumb-03.webp', caption: 'Coffee first, pixels later', accent: 'sky', hex: '#85CEF9',
    alt: 'A curly-haired designer in dungarees hugs a paper coffee cup as tall as themselves, cheek on the lid, with a drawing tablet showing a bezier curve leaning at their feet.',
  },
  {
    n: 4, file: 'sticker-04.webp', thumb: 'thumb-04.webp', caption: 'Small me, big plant', accent: 'mint', hex: '#8EEBC3',
    alt: 'A small gardener in a polka-dot bandana and rubber boots staggers along carrying a big pot with a monstera three times their height, a snail riding one of its leaves.',
  },
  {
    n: 5, file: 'sticker-05.webp', thumb: 'thumb-05.webp', caption: 'Quiet on set!', accent: 'butter', hex: '#FCE67A',
    alt: 'A film director in a beret and sunglasses, striped scarf flying, steps up onto an apple crate and shouts through a megaphone while holding a clapperboard aloft.',
  },
  {
    n: 6, file: 'sticker-06.webp', thumb: 'thumb-06.webp', caption: 'Case of the missing sock', accent: 'tomato', hex: '#FE7D6C',
    alt: 'A trench-coated detective in a fedora creeps forward, one eye hugely magnified by an oversized magnifying glass, pinching a single striped sock as evidence.',
  },
  {
    n: 7, file: 'sticker-07.webp', thumb: 'thumb-07.webp', caption: 'Tuft happens', accent: 'pink', hex: '#FF9FC5',
    alt: 'A rug maker in goggles and dungarees kneels at a wooden frame, tongue out in concentration, punching yarn into a half-finished mushroom rug with a chunky tufting gun.',
  },
  {
    n: 8, file: 'sticker-08.webp', thumb: 'thumb-08.webp', caption: 'Houston, we have bananas', accent: 'teal', hex: '#66CBC7',
    alt: 'A monkey in a puffy spacesuit floats weightless, grinning inside the helmet and holding up a banana, its long tail ending in a tiny glove, a ringed planet nearby.',
  },
  {
    n: 9, file: 'sticker-09.webp', thumb: 'thumb-09.webp', caption: 'Headphones on, world off', accent: 'lime', hex: '#C5EB7C',
    alt: 'A dancer in headphones and an oversized track jacket laughs with eyes shut, ponytail whipping, balancing on one toe with the other leg kicked high.',
  },
]

export const stickerInfo = (n: number): StickerInfo => STICKERS[n - 1]

export interface Slot {
  n: number
  /** canvas centre on the sheet, as a share of its width / height */
  cx: number
  cy: number
  /** degrees clockwise */
  angle: number
  /** scale multiplier (the sheet evens out the visual weight of the nine) */
  mult: number
}

const slot = (n: number, x: number, y: number, angle: number, mult = 1): Slot => ({ n, cx: x / SHEET_W, cy: y / SHEET_H, angle, mult })

export const SLOTS: readonly Slot[] = [
  slot(1, 500.2, 622.6, -5.0),
  slot(2, 1202.9, 593.4, 3.5),
  slot(3, 1923.5, 575.1, -3.0),
  slot(4, 467.0, 1608.5, 5.5),
  slot(5, 1165.1, 1582.4, -3.5),
  slot(6, 1936.0, 1587.3, 4.0, 1.04),
  slot(7, 432.4, 2638.5, -4.0, 0.95),
  slot(8, 1139.4, 2554.8, 5.5, 0.99),
  slot(9, 1947.2, 2609.5, -5.0, 1.025),
]

/** a pose on the lid: centre as a share of the lid's width / height, rotation in degrees, scale multiplier */
export interface LidPose {
  n: number
  u: number
  v: number
  rot: number
  k: number
}

const lp = (n: number, u: number, v: number, rot: number, k = 1): LidPose => ({ n, u, v, rot, k })

/** what the visitor finds on the lid at first: four stickers already stuck (their ghosts show on the sheet) */
export const INITIAL_LID: readonly LidPose[] = [lp(1, 0.17, 0.6, -8, 1.1), lp(5, 0.385, 0.43, 5, 1.12), lp(8, 0.6, 0.63, -6, 1.08), lp(6, 0.83, 0.44, 7, 1.1)]

/** "Arrange": all nine in two staggered rows, a sticker-bombed lid with a rhythm of tilts and sizes */
export const ARRANGE: readonly LidPose[] = [
  lp(1, 0.12, 0.3, -7, 1.0),
  lp(5, 0.31, 0.32, 5, 1.04),
  lp(3, 0.5, 0.28, -4, 1.0),
  lp(2, 0.69, 0.31, 6, 1.02),
  lp(9, 0.88, 0.3, -6, 1.0),
  lp(4, 0.21, 0.72, 5, 1.0),
  lp(7, 0.4, 0.74, -5, 0.98),
  lp(8, 0.6, 0.72, 4, 1.0),
  lp(6, 0.8, 0.74, -6, 1.02),
]
