// Lays words out from the glyph dictionary in ./fraunces900.ts (advance + pair kerning), entirely at runtime.
// The result is plain data for <StrokeWord>: one entry per visible glyph with its contours split so every contour can
// get its own <path pathLength="1"> (a single multi-contour path would restart the dash on every contour).
// Units: 1 em = UNITS_PER_EM (200) units, y down, baseline = 0 (see tools/glyphs.mjs to regenerate the data).

import { FRAUNCES_900 } from './fraunces900'

const FONT = FRAUNCES_900

export const UNITS_PER_EM = FONT.size
export const CAP_HEIGHT = FONT.cap

export interface LaidGlyph {
  ch: string
  /** pen position of the glyph origin, in units (relative to the viewBox origin 0,0 BEFORE the viewBox offset) */
  x: number
  /** baseline of the line this glyph sits on */
  y: number
  /** whole glyph outline (all contours) for fills */
  d: string
  /** one closed contour each: the outer shape and its counters */
  contours: string[]
  /** visible-glyph index (drives the draw / wave stagger) */
  i: number
  word: number
  line: number
}

export interface Layout {
  glyphs: LaidGlyph[]
  /** the viewBox, in units */
  vb: { x: number; y: number; w: number; h: number }
  /** the text that is actually drawn (normalised); characters the dictionary lacks are listed in `missing` */
  text: string
  missing: string[]
  words: number
  lines: number
}

export interface LayoutOptions {
  /** extra letter-spacing in em (added after every glyph). Outline strokes need a little air: default 0.03 */
  tracking?: number
  /** put every word on its own line */
  stack?: boolean
  /** horizontal alignment of the lines when there is more than one */
  align?: 'start' | 'center' | 'end'
  /** space between lines, as a fraction of the cap height (default 0.2) */
  leading?: number
}

const contourCache = new Map<string, string[]>()
const contoursOf = (ch: string, path: string): string[] => {
  let c = contourCache.get(ch)
  if (!c) {
    c = path
      .split('z')
      .filter((s) => s.length > 0)
      .map((s) => s + 'z')
    contourCache.set(ch, c)
  }
  return c
}

/** Upper-case, drop accents (the dictionary is A-Z 0-9 # ( ) : ' ’ & . , ! ? -), unify quotes and dashes. */
export function normalizeLettering(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[‘`´]/g, '’')
    .replace(/[“”"]/g, '')
    .replace(/[–—‐‑−]/g, '-')
    .replace(/…/g, '...')
    .replace(/[ \t\r]+/g, ' ')
    .toUpperCase()
}

const VB_TOP = -(CAP_HEIGHT + 10)
const VB_LINE_H = CAP_HEIGHT + 20
const PAD_X = 6

export function layoutLetters(input: string, opts: LayoutOptions = {}): Layout {
  const { tracking = 0.03, stack = false, align = 'start', leading = 0.2 } = opts
  const text = normalizeLettering(input)
  const track = tracking * UNITS_PER_EM
  const missing: string[] = []

  // split into lines: explicit "\n" always, every word when `stack`
  const rawLines = text.split('\n').flatMap((l) => (stack ? l.split(/ +/) : [l])).map((l) => l.trim())
  const lines = rawLines.filter((l) => l.length > 0)
  if (lines.length === 0) lines.push('')

  const lineAdvance = CAP_HEIGHT * (1 + leading)
  const placed: LaidGlyph[] = []
  const extents: { min: number; max: number }[] = []
  let visible = 0
  let wordIndex = 0
  let drawn = ''

  lines.forEach((line, li) => {
    let pen = 0
    let prev: string | null = null
    let min = Infinity
    let max = -Infinity
    let inWord = false
    const start = placed.length
    for (const ch of Array.from(line)) {
      if (ch === ' ') {
        pen += FONT.space + track
        prev = null
        inWord = false
        continue
      }
      const g = FONT.glyphs[ch]
      if (!g) {
        if (!missing.includes(ch)) missing.push(ch)
        continue
      }
      if (!inWord) {
        if (placed.length > start) wordIndex += 1
        inWord = true
      }
      if (prev) pen += FONT.kern[prev + ch] ?? 0
      const [adv, x0, , x1, , path] = g
      placed.push({
        ch,
        x: pen,
        y: li * lineAdvance,
        d: path,
        contours: contoursOf(ch, path),
        i: visible++,
        word: wordIndex,
        line: li,
      })
      min = Math.min(min, pen + x0)
      max = Math.max(max, pen + x1)
      pen += adv + track
      prev = ch
    }
    wordIndex += 1
    drawn += (li ? '\n' : '') + line
    extents.push(Number.isFinite(min) ? { min, max } : { min: 0, max: 0 })
  })

  const widest = Math.max(...extents.map((e) => e.max - e.min), 1)
  // shift every line so its ink starts at PAD_X (+ alignment offset)
  const shifts = extents.map((e) => {
    const w = e.max - e.min
    const off = align === 'center' ? (widest - w) / 2 : align === 'end' ? widest - w : 0
    return PAD_X + off - e.min
  })
  for (const g of placed) g.x += shifts[g.line]

  const lineCount = lines.length
  return {
    glyphs: placed,
    vb: {
      x: 0,
      y: VB_TOP,
      w: Math.round((widest + PAD_X * 2) * 10) / 10,
      h: VB_LINE_H + (lineCount - 1) * lineAdvance,
    },
    text: drawn,
    missing,
    words: Math.max(1, wordIndex),
    lines: lineCount,
  }
}
