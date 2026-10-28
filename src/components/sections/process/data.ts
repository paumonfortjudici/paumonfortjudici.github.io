// Process section data. The steps and the tool names come from src/lib/copy.ts (PROCESS); everything marked "added" is new
// copy that is not in docs/COPY.md (kept here so the section is self-contained; it can move into copy.ts later).
import { PROCESS } from '../../../lib/copy'

export type ToolId = 'adobe' | 'pencil' | 'procreate' | 'nomad' | 'ai' | 'pinterest' | 'vscode'

export interface StepStyle {
  /** the frame's own flat colour (a folder colour) and the ink that sits on it (always ink on these four) */
  tone: 'marigold' | 'bubblegum' | 'tomato' | 'lagoon'
  /** short names of the scene's objects, written on label-maker strips in the picture (decoration, aria-hidden) */
  scene: string
  /** accessible description of the drawing */
  alt: string
}

/** index = step (0 COLLECT, 1 SKETCH, 2 MAKE, 3 DELIVER) */
export const STEP_STYLE: readonly StepStyle[] = [
  {
    tone: 'marigold',
    scene: 'collect',
    alt: 'A reference wall: cards pinned to a board and joined by red string, a magnifying glass, and a sticky note that reads one-line promise.',
  },
  {
    tone: 'bubblegum',
    scene: 'sketch',
    alt: 'A notepad full of tiny thumbnail sketches of a little devil, a pencil drawing the next one, and a tablet with a stylus where the chosen sketch becomes a finished character.',
  },
  {
    tone: 'tomato',
    scene: 'make',
    alt: 'A desk with a vector curve with handles, a magazine page layout with columns, a retouched photo, a clay head being sculpted and a grid of four variations with one picked.',
  },
  {
    tone: 'lagoon',
    scene: 'deliver',
    alt: 'A stack of deliverables: a brand manual, a print-ready sheet with crop marks and colour bars, a website shown in desktop, tablet and phone windows, and a key on a tag that says yours.',
  },
]

export interface SceneLabel {
  text: string
  /** top-left corner, in the scene's 560 x 600 units */
  x: number
  y: number
  /** tilt in degrees */
  r: number
  /** 'r': x is the right edge (the label grows leftwards, so it never leaves the picture on a narrow frame) */
  a?: 'r'
}

/** label-maker strips that name the objects of each scene (decoration, aria-hidden; the paragraph carries the meaning) */
export const SCENE_LABELS: readonly (readonly SceneLabel[])[] = [
  [],
  [
    { text: 'Thumbnails', x: 52, y: 398, r: -2 },
    { text: 'Procreate', x: 352, y: 566, r: 2 },
  ],
  [
    { text: 'Vectors', x: 36, y: 248, r: -2 },
    { text: 'Layouts', x: 320, y: 270, r: 3 },
    { text: 'Retouch', x: 232, y: 468, r: -2 },
    { text: 'Variants', x: 546, y: 486, r: 2, a: 'r' },
    { text: 'Sculpt', x: 44, y: 566, r: -1 },
  ],
  [
    { text: 'Print-ready', x: 30, y: 66, r: -5 },
    { text: 'Brand manual', x: 262, y: 28, r: 3 },
    { text: 'Responsive', x: 246, y: 564, r: -2 },
  ],
]

/** a hand-lettered margin note per frame: it only says what the paragraph already says, in my voice */
export const STEP_NOTES: readonly string[] = ['until one line is left', 'dozens, then one', 'AI explores, I decide', 'done when you don’t need me']

export interface Tool {
  id: ToolId
  /** the name as written in copy.ts (PROCESS.shelf.items) */
  name: string
  /** one honest line about what it is for (added; every claim comes from the step copy or from Pau's brief) */
  use: string
  /** steps (0-based) where it is used */
  steps: readonly number[]
}

const names = PROCESS.shelf.items
const nameAt = (i: number, fallback: string): string => names[i] ?? fallback

export const TOOLS: readonly Tool[] = [
  { id: 'adobe', name: nameAt(0, 'The whole Adobe suite'), use: 'Illustrator, InDesign, Photoshop and the rest: vectors, layouts and retouching.', steps: [2, 3] },
  { id: 'pencil', name: nameAt(1, 'Pencil & paper'), use: 'Every idea starts as a rough thumbnail on paper, dozens of them, before anything goes on a screen.', steps: [1] },
  { id: 'procreate', name: nameAt(2, 'Procreate'), use: 'Where the chosen thumbnail grows into a finished character, and where the lettering gets drawn.', steps: [1] },
  { id: 'nomad', name: nameAt(3, 'Nomad Sculpt'), use: 'A quick 3D sculpt when a flat reference is not enough to understand a shape.', steps: [2] },
  { id: 'ai', name: nameAt(4, 'AI tools'), use: 'Explore variations faster, always art-directed and finished by hand.', steps: [2] },
  { id: 'pinterest', name: nameAt(5, 'Pinterest'), use: 'Boards of ideas and references, pinned up before the first sketch is drawn.', steps: [0] },
  { id: 'vscode', name: nameAt(6, 'VS Code'), use: 'Where the finished design becomes a working React website, built to match the drawing.', steps: [3] },
]

export const toolsForStep = (step: number): ToolId[] => TOOLS.filter((t) => t.steps.includes(step)).map((t) => t.id)

/** added UI strings */
export const PROCESS_UI = {
  region: 'How I work, step by step',
  tablist: 'Process steps',
  step: (n: number, total: number, title: string): string => `Step ${n} of ${total}: ${title}`,
  inThisStep: 'In this step',
  back: PROCESS.back,
  backLabel: 'Back to the previous step',
  next: 'Next step',
  nextLabel: 'Next step',
  shelfTitle: PROCESS.shelf.label,
  shelfLead: 'What I reach for, and where it shows up.',
  /** read by assistive tech instead of the two number chips */
  usedIn: (steps: readonly number[], goes: boolean): string =>
    `Used in step${steps.length > 1 ? 's' : ''} ${steps.map((s) => s + 1).join(' and ')}.${goes ? ' Press to go to the frame.' : ''}`,
  /** margin notes (hand font) */
  noteDrag: 'drag the film',
  noteSwipe: 'swipe the film',
  /** phones: the film is a vertical stack there, so it is scrolled, not swiped */
  noteScroll: 'scroll to develop it',
  noteShelfHover: 'hover a tool and its frames light up',
  /** touch + the strip (tablets): a tap sends the film to the next frame that uses the tool */
  noteShelfTap: 'tap a tool and it finds its frame',
  /** phones (the film is a vertical stack, far above the shelf): a tap only plays the tool */
  noteShelfPhone: 'tap a tool and watch it move',
  filmStart: 'Process',
  filmEnd: 'Delivered',
  /** edge print and stamp on the leader and the tail of the roll (decoration, aria-hidden) */
  codeHead: 'PM 05 · 35 MM · HEAD',
  codeTail: 'PM 05 · 35 MM · TAIL',
  stamp: 'Approved',
  binNote: 'the bin: dozens, then one',
} as const

const BODY_FIX: Record<number, (s: string) => string> = {
  // the doc keeps two em dashes in the step copy; the page budget is two for everything, so the section says the same with a colon / comma
  1: (s) => s.replace(' — a reference wall', ': a reference wall'),
  3: (s) => s.replace(' — always art-directed', ', always art-directed'),
}
export const stepBody = (n: number, body: string): string => (BODY_FIX[n] ? BODY_FIX[n](body) : body)
