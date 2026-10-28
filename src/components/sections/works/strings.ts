// Strings the Works section adds on top of src/lib/copy.ts (WORKS_SECTION, CATALOG.button, CONCEPT). English, sentence case,
// typographic apostrophes. Arrows are never typed: the faces have no arrow glyphs (SVG icons draw them).
// Merge candidates for src/lib/copy.ts: everything below is UI chrome, not a claim about Pau.

import type { WorkMeta } from '@/lib/works'

export const WORKS_UI = {
  /** the index card that explains the keys inside a folder */
  keys: {
    label: 'Keyboard shortcuts inside a folder',
    title: 'In a folder',
    items: [
      { key: '[', label: 'Previous' },
      { key: ']', label: 'Next' },
      { key: 'Esc', label: 'Close' },
    ],
  },
  /** the label holder on the drawer rail */
  holder: {
    all: 'All folders',
    files: 'Files',
  },
  /** the sticky note on the short drawers (Editorial, Web, Print): how many folders this drawer holds, and a tab that brings the rest back */
  note: {
    /** drawer = the filter's name ("Web"); the number is drawn inside a hand-drawn circle, so the sentence is split around it */
    before: 'Only ',
    after: (total: number, drawer: string): string => ` of ${total} folders live in ${drawer}.`,
    body: 'The rest are in the other drawers.',
    button: (total: number): string => `Show all ${total}`,
    buttonLabel: (total: number): string => `Show all ${total} folders`,
    plain: (shown: number, total: number, drawer: string): string => `Only ${shown} of ${total} folders live in ${drawer}. The rest are in the other drawers.`,
  },
  /** polite live region, read after a filter changes */
  status: (shown: number, total: number, filter: string): string =>
    filter === 'All' ? `Showing all ${total} folders.` : `Showing ${shown} of ${total} folders: ${filter}.`,
  /** accessible name of a folder card */
  cardLabel: (work: WorkMeta): string => {
    // "Early work" is not a year: only years with digits are read out; concept art says it is AI-assisted, as the stamp on the print does
    const years = /[0-9]/.test(work.years) ? `, ${work.years}` : ''
    const ai = work.concept && work.tools.some((tool) => /AI/.test(tool)) ? ' AI-assisted.' : ''
    return `${work.title}. ${work.kind}${years}.${ai} Open folder.`
  },
  /** accessible name of the empty folder */
  yoursLabel: 'Next folder: yours? Tell me what you’re making. Go to contact.',
} as const
