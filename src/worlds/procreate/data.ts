// Content of the Procreate world, "Sketchbook": one small book of Pau's Procreate drawings, printed, glued in and annotated by hand.
// The pages are pictures (public/works/procreate/book/*.webp, built by art-src/sketchbook); the words printed in them and the words
// shown on the screen come from the same file, ./book.json, so they cannot drift apart. Nothing here is a claim: no dates, no briefs,
// no clients, no names (Pau's statement of 2026-10-30: drawings made in Procreate for the love of it, not jobs).
import { asset } from '../../lib/asset'
import book from './book.json'

export interface BookPage {
  id: string
  kind: 'cover' | 'page' | 'back'
  /** printed page number (the cover and the back have none) */
  n?: number
  /** drawing number, 1 to 12 (only the pages that carry a drawing) */
  no?: number
  /** two words for a tab */
  short?: string
  title?: string
  line?: string
  alt: string
}

export interface Drawing extends BookPage {
  n: number
  no: number
  short: string
  title: string
  line: string
}

/** faces of the book in reading order: cover, pages 2 to 17, back */
export const PAGES: BookPage[] = (book.pages as Partial<BookPage>[]).map((p) => ({ kind: 'page', ...p }) as BookPage)
export const DRAWINGS: Drawing[] = PAGES.filter((p): p is Drawing => p.no !== undefined)

/** every page picture is 1200 x 1600 (3:4) */
export const PAGE_W = 1200
export const PAGE_H = 1600
export const pageSrc = (id: string): string => asset(`/works/procreate/book/${id}.webp`)

/** the printed total the live region says: "Pages 4 and 5 of 17" */
export const TOTAL_PAGES = 17

/** spread that shows a printed page: [2,3] is spread 1, [4,5] spread 2, ... [16,17] spread 8 (0 is the closed cover, 9 the closed back) */
export const spreadOfPage = (n: number): number => Math.floor(n / 2)
/** index in PAGES of the first page of a spread (the viewer walks PAGES one face at a time) */
export const firstFaceOfSpread = (spread: number): number => (spread <= 0 ? 0 : spread >= 9 ? PAGES.length - 1 : spread * 2 - 1)
/** the spread that holds a face of PAGES */
export const spreadOfFace = (face: number): number => (face <= 0 ? 0 : face >= PAGES.length - 1 ? 9 : Math.floor((face + 1) / 2))

export const COPY = {
  title: 'Just for',
  titleAccent: 'fun',
  lede: 'Pages from my Procreate sketchbook. No brief, no client: I drew all of these for the love of it.',
  hintMouse: 'Drag a corner of a page to turn it, or use the arrow keys.',
  hintTouch: 'Swipe a page to turn it.',
  boardLabel: 'The sketchbook, open on my desk',
  bookLabel: 'Procreate sketchbook, seventeen pages',
  stamp: 'Not for work',
  contentsTitle: 'What is inside',
  contentsIntro: 'Twelve drawings, one to a page. Jump to one, or just keep turning.',
  goTo: 'Open at',
  closer: 'Look closer',
  closerHelp: 'Look closer: open this page big, on its own',
  closed: 'The sketchbook is closed. Turn the cover.',
  openIt: 'Open the sketchbook',
  facts: 'Drawn in Procreate for the love of it. Not work, not a brief.',
  viewer: {
    label: 'Close-up of a page',
    prev: 'Previous page',
    next: 'Next page',
    back: 'Back to the book',
    counter: (i: number, n: number) => `${i} of ${n}`,
  },
}
