// Small shared helpers for the primitives: class joiner, seeded randomness, colour maths, the tone table.
// No React in here.

export const cx = (...parts: (string | false | null | undefined)[]): string => parts.filter(Boolean).join(' ')

/** FNV-1a hash of a string -> unsigned 32-bit int (stable seeds from ids / text). */
export function hashString(text: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** mulberry32: tiny seeded PRNG, returns () => number in [0, 1). */
export function rng(seed: number | string): () => number {
  let a = typeof seed === 'number' ? seed >>> 0 : hashString(seed)
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** true when the OS asks for reduced motion OR the visitor pressed "Pause motion" (html[data-motion="paused"]). */
export function isStill(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.getAttribute('data-motion') === 'paused'
    )
  } catch {
    return false
  }
}

// ------------------------------------------------------------------------------------------------ colour maths
// Only hex colours can be measured (the registry gives hex). CSS var() colours return null and callers fall back.

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

export function parseHex(color: string): [number, number, number] | null {
  const m = HEX.exec(color.trim())
  if (!m) return null
  let h = m[1]
  if (h.length === 3) h = h.replace(/./g, (c) => c + c)
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

const lin = (c: number): number => {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}
export const luminance = (rgb: [number, number, number]): number => 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2])

export function contrast(a: [number, number, number], b: [number, number, number]): number {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** token name -> hex (src/styles/tokens.css), so `var(--pine)` can still be measured */
const TOKEN_HEX: Record<string, string> = {
  desk: '#0e0912',
  ink: '#17101b',
  'ink-2': '#2a1f30',
  'ink-3': '#4a3c52',
  cream: '#fff2da',
  paper: '#fff8ea',
  'cream-2': '#f6e3be',
  tomato: '#ff4b2b',
  marigold: '#ffb81c',
  pine: '#1f5c46',
  oxblood: '#8a1b3d',
  ultraviolet: '#5b3df5',
  bubblegum: '#ff8fc1',
  lagoon: '#0f9aa8',
  olive: '#86a22f',
  butter: '#fbe79a',
  lilac: '#b79cff',
}

/** '#rrggbb' or 'var(--token)' -> '#rrggbb' (null when unknown, e.g. color-mix() or a custom value). */
export function resolveHex(color: string): string | null {
  const c = color.trim()
  if (HEX.test(c)) return c
  const m = /^var\(\s*--([a-z0-9-]+)\s*\)$/i.exec(c)
  return m ? TOKEN_HEX[m[1]] ?? null : null
}

const DESK: [number, number, number] = [0x0e, 0x09, 0x12]

/** Dark folders (pine, oxblood, ultraviolet) sink into the desk: they get a cream-2 rim. Contrast against the desk < 3.3. */
export function needsRim(color: string): boolean {
  const rgb = parseHex(color)
  return rgb ? contrast(rgb, DESK) < 3.3 : false
}

/**
 * Alpha (percent) at which `ink` can be mixed into `color` for SECONDARY text (--on2) and still keep 4.6:1.
 * Starts at the 72 % of the art direction and climbs only when the pair needs it (ink on tomato / lagoon).
 */
export function on2Percent(color: string, ink: string): number {
  const bg = parseHex(color)
  const fg = parseHex(ink)
  if (!bg || !fg) return 72
  for (let p = 72; p <= 100; p += 2) {
    const a = p / 100
    const mixed: [number, number, number] = [
      Math.round(fg[0] * a + bg[0] * (1 - a)),
      Math.round(fg[1] * a + bg[1] * (1 - a)),
      Math.round(fg[2] * a + bg[2] * (1 - a)),
    ]
    if (contrast(mixed, bg) >= 4.6) return p
  }
  return 100
}

// ------------------------------------------------------------------------------------------------ tone table
// One source for "a colour and the text colour that sits on it" (docs/ART_DIRECTION.md §2, contrast measured in
// notes/skills-digest.md rule 9): ink on tomato / marigold / bubblegum / lagoon / olive / butter / lilac / cream / paper,
// cream on ink / pine / oxblood / ultraviolet. Never the reverse.

export type ToneName =
  | 'cream'
  | 'paper'
  | 'ink'
  | 'tomato'
  | 'pine'
  | 'marigold'
  | 'oxblood'
  | 'ultraviolet'
  | 'bubblegum'
  | 'lagoon'
  | 'olive'
  | 'butter'
  | 'lilac'

export interface ToneColors {
  color: string
  ink: string
}

export const TONES: Record<ToneName, ToneColors> = {
  cream: { color: 'var(--cream)', ink: 'var(--ink)' },
  paper: { color: 'var(--paper)', ink: 'var(--ink)' },
  ink: { color: 'var(--ink)', ink: 'var(--cream)' },
  tomato: { color: 'var(--tomato)', ink: 'var(--ink)' },
  pine: { color: 'var(--pine)', ink: 'var(--cream)' },
  marigold: { color: 'var(--marigold)', ink: 'var(--ink)' },
  oxblood: { color: 'var(--oxblood)', ink: 'var(--cream)' },
  ultraviolet: { color: 'var(--ultraviolet)', ink: 'var(--cream)' },
  bubblegum: { color: 'var(--bubblegum)', ink: 'var(--ink)' },
  lagoon: { color: 'var(--lagoon)', ink: 'var(--ink)' },
  olive: { color: 'var(--olive)', ink: 'var(--ink)' },
  butter: { color: 'var(--butter)', ink: 'var(--ink)' },
  lilac: { color: 'var(--lilac)', ink: 'var(--ink)' },
}

/** the registry's hex values (src/lib/works.ts) for the same names, used to measure contrast. */
export const TONE_HEX: Partial<Record<ToneName, string>> = {
  tomato: '#ff4b2b',
  pine: '#1f5c46',
  marigold: '#ffb81c',
  oxblood: '#8a1b3d',
  ultraviolet: '#5b3df5',
  bubblegum: '#ff8fc1',
  lagoon: '#0f9aa8',
  olive: '#86a22f',
  butter: '#fbe79a',
  lilac: '#b79cff',
}

export const isToneName = (v: string): v is ToneName => Object.prototype.hasOwnProperty.call(TONES, v)

/** a tone name or an explicit { color, ink } pair -> the pair */
export function resolveTone(tone: ToneName | ToneColors | undefined, fallback: ToneName = 'cream'): ToneColors {
  if (!tone) return TONES[fallback]
  if (typeof tone === 'string') return TONES[tone] ?? TONES[fallback]
  return tone
}
