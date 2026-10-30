// Strings of the Catalog sheet that are not in src/lib/copy.ts (those come from CATALOG there). English only, typographic quotes.
// Kept in one place so the lead can fold them into copy.ts later. Nothing here is a claim about Pau that docs/ART_DIRECTION.md
// does not already support: the hand-written captions only name what the project's own thumbnail shows.

import type { Group } from '@/lib/works'

export type GroupFilter = 'all' | Group

export const CAT_UI = {
  /** typed under the filter tabs and spoken by the polite live region */
  count: (n: number, total: number): string => `${n} of ${total} folders`,
  /** accessible name of the group filter */
  filterLabel: 'Filter the catalog by group',
  all: 'All',
  clear: 'Clear',
  clearLabel: 'Clear the search and the filter',
  /** the word before the three example searches on the index card */
  try: 'Try',
  examples: ['poster', 'magazine', 'logo'] as const,
  exampleLabel: (word: string): string => `Search for ${word}`,
  /** the drawer index of ten colour spines above the stack */
  spinesLabel: 'Jump to a folder',
  spineLabel: (n: number, title: string): string => `Folder ${String(n).padStart(2, '0')}, ${title}`,
  /** the flag on the index card's writing box */
  typeHere: 'type here',
  /** hand-written note on the arrow that points at the first folder */
  note: 'ten folders, ten typefaces',
  /** slate cell labels in the open band */
  slate: { role: 'Role', tools: 'Tools', group: 'Group' },
  /** typed in the open band: the label of the categories, and of the contents slip */
  filedUnder: 'Filed under',
  inside: 'Inside the folder',
  /** the hint a closed band prints when the search matched something its face does not show, by field */
  found: {
    keywords: 'Found in keywords:',
    categories: 'Found in categories:',
    roles: 'Found in roles:',
    tools: 'Found in tools:',
    blurb: 'Found in the notes:',
    inside: 'Found inside:',
  },
  /** live region, after the visitor stops typing */
  announce: (n: number, total: number, query: string): string =>
    query ? `${n} of ${total} folders match “${query}”.` : `${n} of ${total} folders.`,
  /** read after a thin band's title: it is still a folder you can open, it just does not match */
  noMatch: 'No match for this search',
} as const

/** What each thumbnail shows, in the hand font under the taped print (taken from the registry blurbs and docs/api/card-art.md). */
export const PRINT_CAPTION: Record<string, string> = {
  contract: 'the issue',
  plana: 'the sunrise',
  'fortyfour-lab': 'the devil',
  'spelled-guilty': 'case 01',
  'space-monkey': 'tyler & smith',
  procreate: 'the sketchbook',
  somia: 'bag and tag',
  'concept-brand': 'the cast',
  'concept-portfolio': 'the deck',
  illustration: 'a few of the nine',
}

/** alt text of the thumbnails (English, descriptive; each one says what the shipped thumb.webp really shows) */
export const PRINT_ALT: Record<string, string> = {
  contract: 'Opening page of a feature in Proyecto Contract: a blue flagship store under the headline Retail hipnótico, beside a rust OPEN SPACE tab.',
  plana: 'Plana Digital identity: the sunrise-over-a-browser symbol, the round 72 h seal and a sample social post.',
  'fortyfour-lab': 'Close-up of a hand-tufted rug in pink, lilac and mint, with the 44 Lab logo and its hand-drawn devil.',
  'spelled-guilty': 'The Spelled Guilty paperback on a kraft table beside an open case file and word search.',
  'space-monkey': 'The TYLER and SMITH escape-room posters pinned side by side, with the monkey-astronaut patch.',
  procreate: 'A page of a battered sketchbook with a hills drawing glued in, on a green cutting mat with a pencil and an eraser.',
  somia: 'A red and blue woollen handbag carrying the Somia tag, under the Somia wordmark.',
  'concept-brand': 'Part of the Gotet logo, a red g and an olive o, above three mascots (a glass, an olive in a red cap and a blue soda siphon) on a pink pattern.',
  'concept-portfolio': 'Three slides of a fictional portfolio deck, fanned out: the FOLEY PORTFOLIO cover with a furry boom microphone, a project page and an About page.',
  illustration: 'Four die-cut doodle stickers: a film-crew character with a camera, a figure with a boombox, a clapperboard operator and someone carrying a big plant.',
}
