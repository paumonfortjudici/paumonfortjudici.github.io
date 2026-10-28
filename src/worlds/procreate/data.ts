// Content of the Procreate world: the five prints on the wall, their captions and how each one is held.
// Everything here comes from public/works/procreate/manifest.json (file names, sizes, alt text, palettes) plus Pau's own
// statement ("my beginnings as a graphic designer, made very young, always my passion"). No dates, ages, clients or names.
import { asset } from '../../lib/asset'

export type PrintId = 'kids' | 'crest' | 'logo' | 'cap' | 'quiff'

/** the paper each drawing is printed on */
export type Stock = 'sketch' | 'photo' | 'grid' | 'card'

export interface TapePiece {
  at: 'top' | 'tl' | 'tr' | 'bl' | 'br'
  color: 'marigold' | 'bubblegum' | 'butter' | 'tomato'
  pattern?: 'plain' | 'stripes' | 'dots' | 'grid' | 'checks'
  rot: number
  w?: string
  h?: string
}

export type Hold =
  | { kind: 'tape'; pieces: TapePiece[] }
  | { kind: 'clip'; color: 'tomato' | 'ultraviolet' | 'lagoon'; rot: number }
  | { kind: 'pin'; color: 'tomato' | 'ultraviolet' | 'lagoon' }

/** a point on the drawing: u, v run 0..1 across the picture (v above 1 is the writing strip under it) */
export type Spot = [u: number, v: number]

export type NoteMark =
  /** a pencil arrow from near the lettering to a real detail of the drawing */
  | { kind: 'arrow'; from: Spot; to: Spot; seed: number }
  /** a line under the lettering */
  | { kind: 'underline'; seed: number }

export interface NoteSpec {
  text: string
  /** left edge of the lettering, % of the print's width; it sits in the writing strip under the picture */
  x: number
  /** tilt of the lettering, degrees */
  rot: number
  ink: 'ink' | 'oxblood'
  mark: NoteMark
}

export interface PrintDef {
  id: PrintId
  /** file stem in public/works/procreate/ (full size: <stem>.webp, small: <stem>-thumb.webp) */
  file: string
  /** intrinsic size of the full file and of the thumb (from the manifest) */
  w: number
  h: number
  tw: number
  th: number
  /** manifest alt text: what a person would see */
  alt: string
  /** short name: lightbox heading, index list, accessible name */
  title: string
  /** the one-line description shown in the lightbox */
  line: string
  stock: Stock
  hold: Hold
  note: NoteSpec
  /** share of the print's width taken by the writing strip under the picture */
  strip: number
  /** 'small': the close-up never goes past the size of the small file (no zoom into the full-size picture) */
  closeUp?: 'small'
}

const aspect = (p: PrintDef) => p.w / p.h
export const aspectOf = aspect

export const PRINTS: PrintDef[] = [
  {
    id: 'logo',
    file: 'vertice-design-logo',
    w: 1400,
    h: 984,
    tw: 600,
    th: 422,
    alt: 'Violet diamond-shaped logo with a hanging lamp over an armchair next to the words Vértice design.',
    title: 'Vértice, a logo idea',
    line: 'A logo idea: a violet diamond holding a pendant lamp over an armchair, beside the name Vértice design in thin geometric letters.',
    stock: 'grid',
    hold: { kind: 'tape', pieces: [{ at: 'top', color: 'bubblegum', pattern: 'stripes', rot: 2.5, w: '6.6rem', h: '1.6rem' }] },
    note: { text: 'logo experiments', x: 10, rot: -1.2, ink: 'ink', mark: { kind: 'arrow', from: [0.34, 1.03], to: [0.3, 0.8], seed: 5 } },
    strip: 0.17,
  },
  {
    id: 'crest',
    file: 'yakisoba-fc-crest',
    w: 1400,
    h: 1305,
    tw: 600,
    th: 559,
    alt: 'Football club crest reading Yakisoba F.C. with a bowl of noodles under crossed chopsticks and a soccer ball.',
    title: 'Yakisoba F.C.',
    line: 'A crest layout: an orange and white shield with a ball, a bowl of noodles under crossed chopsticks and a ribbon that reads Yakisoba F.C.',
    stock: 'card',
    hold: { kind: 'pin', color: 'tomato' },
    // "a crest idea": true whoever drew the noodle bowl, and it does not claim an earlier or a later crest
    note: { text: 'a crest idea', x: 9, rot: 1.4, ink: 'oxblood', mark: { kind: 'arrow', from: [0.27, 1.03], to: [0.2, 0.74], seed: 9 } },
    strip: 0.17,
  },
  {
    id: 'kids',
    file: 'kids-portrait',
    w: 1400,
    h: 997,
    tw: 600,
    th: 427,
    // no brand name in the picture's description: the T-shirt carries a cartoon character that is not mine
    alt: 'Flat-colour cartoon drawing of two children: a boy in a yellow T-shirt and an older child with long hair and a grey T-shirt.',
    title: 'Two kids, cartoon style',
    line: 'A cartoon-style drawing of two children, chest up, in flat colour with black outlines: a boy in a yellow T-shirt next to an older child with long hair.',
    stock: 'sketch',
    hold: {
      kind: 'tape',
      pieces: [
        { at: 'tl', color: 'marigold', rot: -34, w: '4.4rem', h: '1.45rem' },
        { at: 'tr', color: 'marigold', rot: 31, w: '4.4rem', h: '1.45rem' },
      ],
    },
    note: { text: 'made very young', x: 8, rot: -1.6, ink: 'ink', mark: { kind: 'arrow', from: [0.21, 1.03], to: [0.07, 0.82], seed: 4 } },
    strip: 0.17,
    // the people in this one are children: it hangs small, and its close-up stays at the size of the small file
    closeUp: 'small',
  },
  {
    id: 'cap',
    file: 'portrait-cap',
    w: 990,
    h: 1400,
    tw: 600,
    th: 848,
    alt: 'Four-tone orange and yellow flat-colour portrait of a bearded man in a cap looking up.',
    title: 'Portrait study, cap',
    line: 'A portrait study in four warm flat colours: a bearded man in a snapback cap, looking up, with four swatch dots beside him.',
    stock: 'photo',
    hold: {
      kind: 'tape',
      pieces: [
        { at: 'top', color: 'marigold', pattern: 'dots', rot: -4, w: '6.2rem', h: '1.6rem' },
        { at: 'bl', color: 'bubblegum', rot: 36, w: '3.8rem', h: '1.3rem' },
      ],
    },
    note: { text: 'four colours only', x: 9, rot: -1.8, ink: 'oxblood', mark: { kind: 'arrow', from: [0.78, 1.04], to: [0.9, 0.48], seed: 12 } },
    strip: 0.15,
  },
  {
    id: 'quiff',
    file: 'portrait-orange-1',
    w: 813,
    h: 1400,
    tw: 600,
    th: 1033,
    alt: 'Four-tone orange and yellow flat-colour portrait of a young man with a quiff and an earring.',
    title: 'Portrait study, quiff',
    line: 'The same four warm colours on another portrait study: a young man with a tall quiff and an ear hoop, four swatch dots beside his head.',
    stock: 'photo',
    hold: { kind: 'clip', color: 'tomato', rot: 7 },
    note: { text: 'same four colours', x: 9, rot: 1.2, ink: 'ink', mark: { kind: 'underline', seed: 21 } },
    strip: 0.15,
  },
]

export const PRINT_BY_ID = Object.fromEntries(PRINTS.map((p) => [p.id, p])) as Record<PrintId, PrintDef>

export const src = {
  full: (p: PrintDef) => asset(`/works/procreate/${p.file}.webp`),
  thumb: (p: PrintDef) => asset(`/works/procreate/${p.file}-thumb.webp`),
}

/** the palette the two portraits share (manifest: portrait-orange-1 / portrait-cap, "four warm tones with four swatch dots") */
export const PORTRAIT_PALETTE = ['#b16022', '#dc8f43', '#f8a635', '#ffd800'] as const

export const COPY = {
  title: 'Where it all started',
  lede: 'My beginnings as a graphic designer: five early pieces from my Procreate folder, made very young. Always my passion.',
  pickOneUp: 'pick one up',
  hintMouse: 'Drag a print around. Double-click to look closer.',
  /** the wall's own "pick one up" note already says the first half */
  hintMouseShort: 'Double-click a print to look closer.',
  /** the label-maker strip on the ledge: what the wall is, until a print has the keyboard (then it says which keys) */
  label: 'Procreate folder · early work · undated',
  hintTouch: 'Drag a print by its paper. Tap one to look closer.',
  keys: 'Tab to a print. Arrows move it, R turns it, Enter opens it.',
  keysShort: 'Arrows move, R turns, Enter opens',
  boardLabel: 'The sketchbook wall',
  wallLabel: 'Five prints you can move',
  controlsLabel: 'Wall controls',
  tidy: 'Tidy up',
  shuffle: 'Shuffle',
  notesOff: 'Rub out the notes',
  notesOn: 'Write the notes back',
  /** what the tab says on a phone, where the tray has one line: the full phrase stays the accessible name */
  notesOffShort: 'Rub out',
  notesOnShort: 'Write back',
  indexTitle: 'What is on the wall',
  indexIntro: 'The same five pieces, one by one, as they sit in my Procreate folder.',
  whenTitle: 'Which came first?',
  whenBody: 'The files carry no dates, so this line stays a question.',
  lookCloser: 'Look closer',
  paletteTitle: 'Four colours, twice',
  paletteBody: 'Both portrait studies use the same four flat colours. The dots beside each head are the whole palette.',
  facts: 'Early work, shown as it is. Made very young, always my passion.',
  lightbox: {
    label: 'Close-up of a print',
    back: 'Back to the wall',
    prev: 'Previous',
    next: 'Next',
    counter: (i: number, n: number) => `${i} of ${n}`,
  },
  status: {
    tidy: 'Prints squared up and lined up.',
    loose: 'Prints back where I hung them.',
    shuffle: 'Prints shuffled.',
    notesOff: 'Notes rubbed out.',
    notesOn: 'Notes written back.',
  },
}
