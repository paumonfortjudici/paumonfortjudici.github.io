// Gotet brand board: structure and geometry (no prose: the words live in copy.ts).
// Every number comes from the brand guide (brand-guide.md sections 2 to 9) and from public/works/concept-brand/art/board-hotspots.json
// (tools/check-hotspots in the harness compares the two). The art itself is fictional: Gotet is an invented vermuteria in Cardedeu.
import { asset } from '../../lib/asset'

// ---- the board ------------------------------------------------------------------------------------------------------------
export const BOARD_W = 3000
export const BOARD_H = 4243
/** the panel (Blau) starts here; the scalloped awning of the top zone hangs 60 units below it */
export const PANEL_Y = 1500
export const SCALLOP_BOTTOM = 1560

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export const art = (path: string): string => asset(`/works/concept-brand/art/${path}`)

export const IMG = {
  board: art('board.webp'), // 3000 x 4243, 1.1 MB (the whole finished board: the page uses the derived bottom copies below)
  boardSmall: art('board-small.webp'), // 1000 x 1414
  boardBottom: art('board-bottom.webp'), // 3000 x 2683: board.webp from y 1560 down, 815 KB (derived)
  boardBottomSmall: art('board-bottom-small.webp'), // 1000 x 894: the same rows of board-small.webp, 174 KB (derived): the fit view and the blur-up
  wordmark: art('brand/logo-wordmark.webp'), // 3012 x 1120 (2x of the 1506 x 560 viewBox)
  patternIcons: art('brand/pattern-icons.svg'), // <symbol id="p-olive"> ... sprite of the 12 icons (derived from the tile)
  wallTile: art('brand/pattern-wall.svg'), // the faint pattern on a Tinta ground (derived: Rosat 7 % on Tinta)
  cast: art('brand/cast.webp'),
  castSmall: art('brand/s/cast.webp'), // 1400 x 513
  patternSheetSmall: art('brand/s/pattern-icons-sheet.webp'), // 1200 x 900
} as const

export const mascotImg = (id: MascotId, pose: 'a' | 'b'): string => art(`brand/mascot-${id}-${pose}.webp`)
export const headImg = (id: MascotId, n: 1 | 2): string => art(`brand/mascot-${id}-head-${n}.webp`)
/** small copies (art/brand/s): heads 360 x 360, poses 480 x 528 */
export const headThumb = (id: MascotId, n: 1 | 2): string => art(`brand/s/head-${id}-${n}.webp`)
export const poseThumb = (id: MascotId, pose: 'a' | 'b'): string => art(`brand/s/pose-${id}-${pose}.webp`)

// ---- palette (guide section 2) ----------------------------------------------------------------------------------------------
export type ColourId = 'blau' | 'vermell' | 'oliva' | 'mantega' | 'rosat' | 'tinta'

export interface Colour {
  id: ColourId
  name: string
  hex: string
  rgb: string
  role: string
  /** share of the whole board, in percent (guide 2.2, brand-wide target) */
  ratio: number
  /** a text colour that passes 4.5:1 on it (null: only large text, see the contrast notes) */
  textOn: ColourId | null
}

export const COLOURS: Colour[] = [
  {
    id: 'blau',
    name: 'Blau Sifó',
    hex: '#2340C0',
    rgb: '35, 64, 192',
    role: 'Sifó’s body, the big panel, reverse grounds, text on Rosat and Mantega',
    ratio: 34,
    textOn: 'rosat',
  },
  {
    id: 'rosat',
    name: 'Rosat',
    hex: '#F8D2D0',
    rgb: '248, 210, 208',
    role: 'Paper, glass, eye whites and every “white”: the table',
    ratio: 30,
    textOn: 'tinta',
  },
  {
    id: 'mantega',
    name: 'Mantega',
    hex: '#FFD34E',
    rgb: '255, 211, 78',
    role: 'Xip, the siphon’s brass, citrus, the sun, highlights',
    ratio: 12,
    textOn: 'tinta',
  },
  {
    id: 'vermell',
    name: 'Vermell Vermut',
    hex: '#D8283B',
    rgb: '216, 40, 59',
    role: 'Gotet’s liquid, the wordmark letters, pimento, prices',
    ratio: 10,
    textOn: null,
  },
  {
    id: 'oliva',
    name: 'Verd Oliva',
    hex: '#86A22F',
    rgb: '134, 162, 47',
    role: 'Oliva’s skin, the ring of the “o”, tiles',
    ratio: 7,
    textOn: 'tinta',
  },
  {
    id: 'tinta',
    name: 'Tinta',
    hex: '#211736',
    rgb: '33, 23, 54',
    role: 'The pen: every outline, shoes, ground shadows and body text',
    ratio: 7,
    textOn: 'rosat',
  },
]

export const COLOUR: Record<ColourId, Colour> = Object.fromEntries(COLOURS.map((c) => [c.id, c])) as Record<ColourId, Colour>

const channel = (v: number): number => {
  const s = v / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}
const luminance = (hex: string): number => {
  const n = parseInt(hex.slice(1), 16)
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
}
/** WCAG contrast ratio between two colours of the palette */
export function contrast(a: ColourId, b: ColourId): number {
  const la = luminance(COLOUR[a].hex)
  const lb = luminance(COLOUR[b].hex)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

// ---- type (guide section 3) -------------------------------------------------------------------------------------------------
export const FONT_DISPLAY = "'Fraunces Variable', 'Fraunces Fallback', Georgia, serif"
export const FONT_UTILITY = "'Barlow Semi Condensed', 'Karla Variable', 'Karla Fallback', Arial, sans-serif"

// ---- groups (the chips) -----------------------------------------------------------------------------------------------------
export type GroupId = 'wordmark' | 'cast' | 'pattern' | 'shopfront' | 'takeaway' | 'print' | 'bottle' | 'wearables' | 'posters'
export type MascotId = 'gotet' | 'oliva' | 'sifo' | 'xip'

export const GROUP_ORDER: GroupId[] = ['wordmark', 'cast', 'pattern', 'shopfront', 'takeaway', 'print', 'bottle', 'wearables', 'posters']

export const GROUP_LABEL: Record<GroupId, string> = {
  wordmark: 'Wordmark',
  cast: 'Cast',
  pattern: 'Pattern',
  shopfront: 'Shopfront and social',
  takeaway: 'Takeaway',
  print: 'Menu and print',
  bottle: 'Bottle and siphon',
  wearables: 'Wearables',
  posters: 'Posters',
}

/** the paper colour of each chip (text is Tinta on all three, 5.8 to 12.2 : 1) */
export const GROUP_PAPER: Record<GroupId, ColourId> = {
  wordmark: 'mantega',
  cast: 'rosat',
  pattern: 'oliva',
  shopfront: 'mantega',
  takeaway: 'rosat',
  print: 'oliva',
  bottle: 'mantega',
  wearables: 'rosat',
  posters: 'oliva',
}

// ---- hotspots (24 in board-hotspots.json) -----------------------------------------------------------------------------------
export interface Hot {
  id: string
  kind: 'wordmark' | 'mockup' | 'poster'
  /** the short code printed in captions: M06, P1 */
  code: string
  title: string
  /** what it is, in a few words (aria labels and captions) */
  short: string
  group: GroupId
  rect: Rect
  tile: ColourId
  alt: string
  /** the 2x art laid over the board when you zoom in (mockup cells and poster art) */
  detail?: { src: string; w: number; h: number; rect: Rect }
}

const mockup = (
  n: number,
  file: string,
  title: string,
  short: string,
  group: GroupId,
  rect: Rect,
  tile: ColourId,
  alt: string,
): Hot => {
  const id = `m${String(n).padStart(2, '0')}`
  return {
    id,
    kind: 'mockup',
    code: id.toUpperCase(),
    title,
    short,
    group,
    rect,
    tile,
    alt,
    detail: { src: art(`mockups/${file}.webp`), w: rect.w * 2, h: rect.h * 2, rect },
  }
}

const poster = (n: 1 | 2 | 3, title: string, short: string, x: number, tile: ColourId, alt: string): Hot => ({
  id: `p${n}`,
  kind: 'poster',
  code: `P${n}`,
  title,
  short,
  group: 'posters',
  rect: { x, y: 2925, w: 868, h: 1218 },
  tile,
  alt,
  // the poster art sits inside a 14 px Rosat paper frame at 0.70 scale (guide 8.5 and 9.4)
  detail: { src: art(`posters/poster-${n}.webp`), w: 1200, h: 1700, rect: { x: x + 14, y: 2939, w: 840, h: 1190 } },
})

export const HOTS: Hot[] = [
  {
    id: 'wordmark',
    kind: 'wordmark',
    code: 'Logo',
    title: 'Wordmark and cast',
    short: 'The top zone: the wordmark and the four characters',
    group: 'wordmark',
    rect: { x: 0, y: 0, w: 3000, h: 1500 },
    tile: 'rosat',
    alt: 'The gotet wordmark: lowercase tube lettering in red with a blue shadow, and a green olive with a red pimento for the o.',
  },
  mockup(1, 'm01-shopfront', 'Shopfront', 'Shopfront, awning and sign', 'shopfront', { x: 100, y: 1620, w: 1035, h: 392 }, 'mantega', 'A shopfront scene on a butter-yellow tile: a blue sign with the gotet wordmark, a blue and pink striped awning, a window with Gotet and Oliva on the sill, a green door, a round blade sign and a chalkboard that says Vermut del dia, 3,50 €.'),
  mockup(2, 'm02-social-greeting', 'Social tile 1: greeting', 'Social post, 4:5', 'shopfront', { x: 1159, y: 1620, w: 329, h: 392 }, 'rosat', 'A pink social post: Bon dia, bon vermut in red with a blue shadow, the Sunday opening hours, and Gotet the glass with a speech bubble that says Un gotet?'),
  mockup(3, 'm03-social-xips', 'Social tile 2: crisps', 'Social post, 4:5', 'shopfront', { x: 1512, y: 1620, w: 329, h: 392 }, 'vermell', 'A red social post: a big yellow CREC!, Xips de la casa, 2,80 €, and Xip the crisp dancing.'),
  mockup(4, 'm04-social-raig', 'Social tile 3: splash', 'Social post, 4:5', 'shopfront', { x: 1865, y: 1620, w: 329, h: 392 }, 'oliva', 'A green social post: UN RAIG DE DIUMENGE, A splash of Sunday, and Sifó the siphon spraying into a glass.'),
  mockup(5, 'm05-cups', 'Takeaway cups', 'Three takeaway cups', 'takeaway', { x: 2218, y: 1620, w: 682, h: 392 }, 'rosat', 'Three takeaway cups on a pink tile: a blue cup with the reverse wordmark, a red cup printed with a yellow pattern and a pink label, and a yellow cup with Oliva.'),
  mockup(6, 'm06-menu', 'Menu card', 'Menu card, A5', 'print', { x: 100, y: 2036, w: 682, h: 600 }, 'oliva', 'An A5 menu card lying on a green tile: the wordmark, three drinks and three snacks in Catalan and English with red prices, and Oliva waving in the corner.'),
  mockup(7, 'm07-loyalty', 'Loyalty card', 'Loyalty card', 'print', { x: 100, y: 2660, w: 329, h: 184 }, 'mantega', 'A blue loyalty card called Targeta d’olives with eight stamp circles and a free ninth.'),
  mockup(8, 'm08-matchbooks', 'Matchbooks', 'Two matchbooks', 'print', { x: 453, y: 2660, w: 329, h: 184 }, 'vermell', 'Two matchbooks on a red tile: a blue one with the reverse wordmark and a pink one that says Encén el diumenge.'),
  mockup(9, 'm09-bottle', 'House vermut bottle', 'Bottle, 75 cl', 'bottle', { x: 806, y: 2036, w: 329, h: 600 }, 'rosat', 'A dark bottle of house vermut on a pink tile, with a pink label carrying the wordmark and Gotet’s head.'),
  mockup(10, 'm10-tags', 'Price tags', 'Three price tags', 'print', { x: 806, y: 2660, w: 329, h: 184 }, 'oliva', 'Three fanned price tags on a green tile: crisps at 2,80 €, house vermut at 12,00 € and olives at 4,50 €.'),
  mockup(11, 'm11-siphon', 'House siphon', 'Siphon, 1 L', 'bottle', { x: 1159, y: 2036, w: 329, h: 600 }, 'mantega', 'The house siphon on a yellow tile: a blue glass body, a matte dark head and a pink oval label with Sifó’s head.'),
  mockup(12, 'm12-caps', 'Crown caps', 'Four crown caps', 'bottle', { x: 1159, y: 2660, w: 329, h: 184 }, 'tinta', 'Four crown caps on a dark tile, in red, green, blue and yellow, each carrying one character’s head.'),
  mockup(13, 'm13-business-cards', 'Business cards', 'Two business cards', 'print', { x: 1512, y: 2036, w: 329, h: 392 }, 'rosat', 'Two business cards on a pink tile: a blue front with the wordmark and a yellow back with Ona and Jan’s details.'),
  mockup(14, 'm14-coasters', 'Coasters', 'Two coasters', 'takeaway', { x: 1512, y: 2452, w: 329, h: 392 }, 'vermell', 'Two overlapping round coasters on a red tile: a yellow one with Gotet’s head and a blue one with the pattern and the ring text Vermuteria de barri.'),
  mockup(15, 'm15-glass', 'Vermut glass', 'Glass, 20 cl', 'takeaway', { x: 1865, y: 2036, w: 329, h: 392 }, 'tinta', 'A vermut glass on a dark tile: red vermut, ice, a citrus wheel, an olive on a yellow stick and a fill line that says Fins aquí.'),
  mockup(16, 'm16-napkin', 'Paper napkin', 'Napkin, folded', 'print', { x: 1865, y: 2452, w: 329, h: 392 }, 'mantega', 'A folded paper napkin on a yellow tile, printed with the blue pattern and a thank-you note.'),
  mockup(17, 'm17-tote', 'Tote bag', 'Tote bag', 'wearables', { x: 2218, y: 2036, w: 329, h: 392 }, 'oliva', 'A pink tote bag on a green tile with the wordmark, Gotet, and the line Carry a little Sunday.'),
  mockup(18, 'm18-apron', 'Apron', 'Bib apron', 'wearables', { x: 2218, y: 2452, w: 329, h: 392 }, 'rosat', 'A blue bib apron on a pink tile with the reverse wordmark, a yellow pocket with an Oliva patch and a small name tag.'),
  mockup(19, 'm19-flyer', 'Flyer', 'Flyer, A6', 'print', { x: 2571, y: 2036, w: 329, h: 392 }, 'mantega', 'A red A6 flyer on a yellow tile: Vermut i vinils, a vinyl record with Xip dancing on top, and the Sunday noon hours.'),
  mockup(20, 'm20-stickers', 'Sticker set', 'Sticker sheet, A6', 'wearables', { x: 2571, y: 2452, w: 329, h: 392 }, 'tinta', 'Six die-cut stickers on a dark tile: four character heads and two sound words, Xin-xin! and Psssh!'),
  poster(1, 'Poster 1: Un raig de diumenge', 'Poster, 1200 × 1700 px', 100, 'blau', 'A poster on a blue ground: UN RAIG DE DIUMENGE in pink, a big yellow sun, Sifó spraying an arc into Gotet’s jumping glass, and Oliva in front.'),
  poster(2, 'Poster 2: A les dotze, vermut', 'Poster, 1200 × 1700 px', 1066, 'mantega', 'A poster on a yellow ground: A LES DOTZE, VERMUT. in blue above a giant olive-slice clock that shows twelve, with Gotet, Oliva and Sifó in front and Xip peeking out from behind.'),
  poster(3, 'Poster 3: Fem-ne un?', 'Poster, 1200 × 1700 px', 2032, 'vermell', 'A poster on a red ground: FEM-NE UN? in pink, the cast clinking glasses behind a yellow counter, with bunting across the top.'),
]

export const HOT: Record<string, Hot> = Object.fromEntries(HOTS.map((h) => [h.id, h]))

export const GROUP_HOTS: Record<GroupId, string[]> = {
  wordmark: ['wordmark'],
  cast: [],
  pattern: [],
  shopfront: ['m01', 'm02', 'm03', 'm04'],
  takeaway: ['m05', 'm14', 'm15'],
  print: ['m06', 'm07', 'm08', 'm10', 'm13', 'm16', 'm19'],
  bottle: ['m09', 'm11', 'm12'],
  wearables: ['m17', 'm18', 'm20'],
  posters: ['p1', 'p2', 'p3'],
}

// ---- the top zone (guide 9.2) -------------------------------------------------------------------------------------------------
export const TOP = {
  /** the wordmark image, full colour: x 550, y 60, 1900 wide */
  wordmark: { x: 550, y: 60, w: 1900, h: 706.4 } as Rect,
  /** ink bounds of the wordmark (measured: x 25 to 1482 and y 84 to 595 of the 1506 x 560 viewBox) */
  wordmarkInk: { x: 580, y: 90, w: 1838, h: 645 } as Rect,
  /** the cast at scale 0.95, feet on y 1350: x = cx - 475, y = 362, 950 x 1045 */
  castScale: 0.95,
  castY: 362,
  castW: 950,
  castH: 1045,
  scallops: 25,
  scallopR: 60,
  labelY: 1450,
}

export interface Mascot {
  id: MascotId
  name: string
  /** centre x of the pose canvas on the board */
  cx: number
  colour: ColourId
  /** hit area inside the 1000 x 1100 pose canvas (alpha bounds from guide 5.6) */
  hit: Rect
  /** where the speech bubble points: x in percent of the pose canvas, y in canvas units */
  tip: { x: number; y: number }
  /** bob: seconds and a negative delay so the four never move together */
  bob: { dur: number; delay: number }
}

export const MASCOTS: Mascot[] = [
  { id: 'gotet', name: 'Gotet', cx: 496, colour: 'vermell', hit: { x: 222, y: 381, w: 500, h: 690 }, tip: { x: 47, y: 380 }, bob: { dur: 3.4, delay: -0.4 } },
  { id: 'oliva', name: 'Oliva', cx: 1046, colour: 'oliva', hit: { x: 154, y: 290, w: 755, h: 780 }, tip: { x: 50, y: 300 }, bob: { dur: 3.9, delay: -1.7 } },
  { id: 'sifo', name: 'Sifó', cx: 1726, colour: 'blau', hit: { x: 227, y: 110, w: 540, h: 960 }, tip: { x: 46, y: 130 }, bob: { dur: 3.1, delay: -2.3 } },
  { id: 'xip', name: 'Xip', cx: 2386, colour: 'mantega', hit: { x: 100, y: 434, w: 800, h: 636 }, tip: { x: 52, y: 440 }, bob: { dur: 3.7, delay: -0.9 } },
]

export const MASCOT: Record<MascotId, Mascot> = Object.fromEntries(MASCOTS.map((m) => [m.id, m])) as Record<MascotId, Mascot>

/** the hit area of a mascot, in board units (what the highlight outlines and the camera frames) */
export function mascotRect(m: Mascot): Rect {
  const s = TOP.castScale
  const x0 = m.cx - 475
  return { x: x0 + m.hit.x * s, y: TOP.castY + m.hit.y * s, w: m.hit.w * s, h: m.hit.h * s }
}

// ---- pattern colourways (guide 6.3) -------------------------------------------------------------------------------------------
export type ColourwayId = 'faint' | 'blau' | 'rosat' | 'mantega'

export interface Colourway {
  id: ColourwayId
  name: string
  ground: ColourId
  line: string
  lineName: string
  file: string
  /** where the guide uses it */
  usedFor: string
  /** the wordmark variant allowed on that ground (guide 4.4) */
  wordmark: 'full' | 'reverse'
  /** the colour of the two captions in the top zone, readable on that ground (guide 2.5) */
  label: ColourId
}

export const COLOURWAYS: Colourway[] = [
  { id: 'faint', name: 'Faint Vermell on Rosat', ground: 'rosat', line: '#F4BCBD', lineName: 'a flat tone of Vermell', file: 'pattern-faint-vermell-on-rosat.svg', usedFor: 'The top zone, the napkin and the tiles', wordmark: 'full', label: 'vermell' },
  { id: 'blau', name: 'Blau on Rosat', ground: 'rosat', line: '#2340C0', lineName: 'Blau', file: 'pattern-blau-on-rosat.svg', usedFor: 'The napkin, the tote lining, wrapping paper', wordmark: 'full', label: 'blau' },
  { id: 'rosat', name: 'Rosat on Blau', ground: 'blau', line: '#F8D2D0', lineName: 'Rosat', file: 'pattern-rosat-on-blau.svg', usedFor: 'Coaster B, the cup band, panel details', wordmark: 'reverse', label: 'rosat' },
  { id: 'mantega', name: 'Mantega on Vermell', ground: 'vermell', line: '#FFD34E', lineName: 'Mantega', file: 'pattern-mantega-on-vermell.svg', usedFor: 'Cup 2, the flyer back, sticker backing', wordmark: 'reverse', label: 'mantega' },
]

export const COLOURWAY: Record<ColourwayId, Colourway> = Object.fromEntries(COLOURWAYS.map((c) => [c.id, c])) as Record<ColourwayId, Colourway>
export const patternFile = (id: ColourwayId): string => art(`brand/${COLOURWAY[id].file}`)

export const PATTERN_ICONS: { id: string; name: string }[] = [
  { id: 'olive', name: 'Olive' },
  { id: 'glass', name: 'Glass' },
  { id: 'chip', name: 'Crisp' },
  { id: 'siphon', name: 'Siphon' },
  { id: 'citrus', name: 'Citrus wheel' },
  { id: 'bubbles', name: 'Bubbles' },
  { id: 'cap', name: 'Crown cap' },
  { id: 'ice', name: 'Ice cubes' },
  { id: 'banderilla', name: 'Banderilla' },
  { id: 'sparkle', name: 'Sparkle' },
  { id: 'sun', name: 'Sun' },
  { id: 'tin', name: 'Olive tin' },
]

// ---- logo family (guide 4.4 to 4.6) -------------------------------------------------------------------------------------------
export interface LogoVariant {
  id: string
  name: string
  file: string
  w: number
  h: number
  ground: ColourId
  useOn: string
  note: string
}

export const LOGOS: LogoVariant[] = [
  { id: 'full', name: 'Full colour', file: 'logo-wordmark', w: 3012, h: 1120, ground: 'rosat', useOn: 'Rosat and Mantega', note: 'The default. Red letters, green olive, a hard Blau shadow.' },
  { id: 'reverse', name: 'Reverse', file: 'logo-wordmark-reverse', w: 3012, h: 1120, ground: 'blau', useOn: 'Blau, Tinta, Vermell and Oliva', note: 'Rosat letters with a Mantega shadow. On Blau it is the hero pairing.' },
  { id: 'ink', name: 'Mono Tinta', file: 'logo-wordmark-mono-ink', w: 3012, h: 1120, ground: 'mantega', useOn: 'One-colour print on Rosat and Mantega', note: 'The olive becomes a ring with a solid dot. No outline, no shadow.' },
  { id: 'rosat', name: 'Mono Rosat', file: 'logo-wordmark-mono-rosat', w: 3012, h: 1120, ground: 'tinta', useOn: 'One-colour on Blau, Vermell and Tinta', note: 'Same construction, one colour.' },
  { id: 'blau', name: 'Mono Blau', file: 'logo-wordmark-mono-blau', w: 3012, h: 1120, ground: 'rosat', useOn: 'One-colour print on Rosat and Mantega', note: 'The cheapest way to print it.' },
  { id: 'primary', name: 'Primary lockup', file: 'logo-primary', w: 3012, h: 1400, ground: 'rosat', useOn: 'Signs, letterheads, anywhere with room', note: 'The wordmark with VERMUTERIA DE BARRI under it.' },
  { id: 'stacked', name: 'Stacked lockup', file: 'logo-stacked', w: 2400, h: 2020, ground: 'mantega', useOn: 'Square spaces', note: 'The glass icon over the wordmark and the descriptor.' },
  { id: 'badge', name: 'Round badge', file: 'logo-badge', w: 2000, h: 2000, ground: 'tinta', useOn: 'Stamps, stickers, caps', note: 'Ring text: GOTET PETIT · DIUMENGE GRAN · VERMUTERIA DE BARRI · CARDEDEU.' },
  { id: 'glass', name: 'Glass icon', file: 'logo-icon', w: 2000, h: 2000, ground: 'mantega', useOn: 'Anywhere the name is already known', note: 'Gotet without a face or limbs.' },
  { id: 'olive', name: 'Olive icon', file: 'logo-icon-olive', w: 2000, h: 2000, ground: 'rosat', useOn: 'Tiny sizes and stamps', note: 'The “o” of the wordmark, enlarged 2.75 times.' },
  { id: 'app', name: 'App icon', file: 'logo-icon-app', w: 2000, h: 2000, ground: 'tinta', useOn: 'Favicon and avatar', note: 'The glass on a Blau rounded square.' },
]

export const logoSrc = (v: LogoVariant): string => art(`brand/${v.file}.webp`)
/** 900 px wide copies for the panel, the kit and the index (art/brand/s): the board keeps the full files */
export const logoThumb = (v: LogoVariant): string => art(`brand/s/${v.file}.webp`)
export const logoThumbSize = (v: LogoVariant): { w: number; h: number } => ({ w: 900, h: Math.round((900 * v.h) / v.w) })
export const logoRatio = (v: LogoVariant): number => v.w / v.h

/** the four faces of the face grammar (guide 5.3): code, name, and which head shows it */
export const EXPRESSIONS: { code: string; name: string; who: MascotId; head: 1 | 2; what: string }[] = [
  { code: 'E1', name: 'Hola', who: 'sifo', head: 1, what: 'Two open eyes and a half-moon mouth' },
  { code: 'E2', name: 'Xin-xin', who: 'gotet', head: 2, what: 'Two happy arcs and a big laugh' },
  { code: 'E3', name: 'Psst', who: 'xip', head: 1, what: 'One open eye, one wink, a raised brow, a smirk' },
  { code: 'E4', name: 'Mmm', who: 'oliva', head: 2, what: 'Two calm arcs and a small smile' },
]

export const MIN_SIZES: { name: string; px: string; mm: string }[] = [
  { name: 'Wordmark', px: '100 px', mm: '22 mm' },
  { name: 'Primary lockup', px: '140 px', mm: '30 mm' },
  { name: 'Round badge', px: '200 px', mm: '20 mm' },
  { name: 'Glass icon', px: '24 px', mm: '6 mm' },
  { name: 'App icon', px: '32 px', mm: '' },
]

// ---- tour ----------------------------------------------------------------------------------------------------------------------
/** the nine stops of the Sunday service: null group = the whole board */
export const TOUR_GROUPS: (GroupId | null)[] = ['wordmark', 'cast', 'pattern', 'shopfront', 'takeaway', 'print', 'bottle', 'posters', null]

// ---- selection ------------------------------------------------------------------------------------------------------------------
export interface Selection {
  group: GroupId | null
  /** a hotspot id (wordmark, m01, p2), a mascot id (gotet) or null for the whole group */
  item: string | null
}

export const NONE: Selection = { group: null, item: null }

export const isMascotId = (id: string | null): id is MascotId => id === 'gotet' || id === 'oliva' || id === 'sifo' || id === 'xip'

export function groupOfItem(id: string): GroupId | null {
  if (isMascotId(id)) return 'cast'
  return HOT[id]?.group ?? null
}

/** rectangles to outline for a selection (board units) */
export function selectionRects(sel: Selection): Rect[] {
  if (sel.item) {
    if (isMascotId(sel.item)) return [mascotRect(MASCOT[sel.item])]
    const hot = HOT[sel.item]
    if (!hot) return []
    return [sel.item === 'wordmark' ? TOP.wordmarkInk : hot.rect]
  }
  switch (sel.group) {
    case 'wordmark':
      return [TOP.wordmarkInk]
    case 'cast':
      return [union(MASCOTS.map(mascotRect))]
    case 'pattern':
      // the whole top zone, the ground the pattern is printed on (the marker pads outward, so the rect is inset to stay on the board)
      return [{ x: 60, y: 60, w: BOARD_W - 120, h: PANEL_Y - 120 }]
    case null:
      return []
    default:
      return GROUP_HOTS[sel.group].map((id) => HOT[id].rect)
  }
}

export function union(rects: Rect[]): Rect {
  if (!rects.length) return { x: 0, y: 0, w: BOARD_W, h: BOARD_H }
  const x0 = Math.min(...rects.map((r) => r.x))
  const y0 = Math.min(...rects.map((r) => r.y))
  const x1 = Math.max(...rects.map((r) => r.x + r.w))
  const y1 = Math.max(...rects.map((r) => r.y + r.h))
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }
}

/** what the camera frames for a selection (differs from the outline for the pattern and the whole board) */
export function selectionView(sel: Selection): Rect {
  if (!sel.item && sel.group === 'pattern') return { x: 0, y: 0, w: BOARD_W, h: PANEL_Y }
  if (!sel.item && sel.group === null) return { x: 0, y: 0, w: BOARD_W, h: BOARD_H }
  if (sel.item === 'wordmark' || (!sel.item && sel.group === 'wordmark')) return TOP.wordmark
  return union(selectionRects(sel))
}
