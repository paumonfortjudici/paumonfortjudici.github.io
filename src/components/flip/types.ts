import type { ReactNode } from 'react'

/** One physical page of the book, in reading order. */
export interface FlipPage {
  /** Stable id (used by goToPage and as React key). */
  id: string
  src: string
  srcSet?: string
  sizes?: string
  alt: string
  /** Intrinsic size of the image (reserves the aspect ratio, avoids layout shift). */
  width: number
  height: number
  /** 'cover' = front board (stands alone, centred while closed); 'back' = back board; default 'page'. */
  kind?: 'cover' | 'page' | 'back'
  /** Printed page number in the full publication (live region says "Pages 4 and 5 of 230"). */
  n?: number
  /**
   * Drawn over the page in percent coordinates (position: absolute; inset: 0 box).
   * Hidden while the leaf is mid-turn, interactive otherwise (pointer-events: none on the wrapper,
   * set pointer-events: auto on the parts that must be clickable).
   */
  overlay?: ReactNode
}

export interface FlipLabels {
  /** aria-label of the book group. */
  label: string
  prev: string
  next: string
  /** aria-label of the range scrubber. */
  scrubber: string
  cover: string
  back: string
  /** "Pages 4 and 5 of 230" */
  pages: (left: number | string, right: number | string, total: number) => string
  /** "Page 4 of 230" */
  page: (n: number | string, total: number) => string
}

export interface FlipSpreadInfo {
  /** Spread index (0 = closed front, count - 1 = closed back). */
  index: number
  /** Number of spreads. */
  count: number
  left: FlipPage | null
  right: FlipPage | null
  /** The visible pages (1 or 2; in single mode exactly 1). */
  pages: FlipPage[]
  /** Human text, same as the live region. */
  text: string
}

export interface FlipBookHandle {
  next(): void
  prev(): void
  /** Go to a spread index (0 .. count - 1). Far jumps riffle through the leaves. */
  goTo(spread: number): void
  /** Go to the spread that shows this page (single mode: that exact page). */
  goToPage(id: string): void
  /** Spread index that shows this page, or -1. */
  spreadOf(id: string): number
  /**
   * Hold the leaf that would turn in `direction` at `progress` (0..1) without animating, like a hand holding it.
   * Pass progress = null (or call release()) to let it settle. Used by tests and scroll-linked turns.
   */
  scrub(progress: number | null, direction?: 'next' | 'prev'): void
  /** Release a scrub: the leaf springs to its nearest rest (or the given side). */
  release(to?: 'start' | 'end'): void
  /** One-shot invitation: the corner of the next page lifts and settles again (no-op in reduced motion). */
  hint(): void
  readonly spread: number
  /** Number of spreads. */
  readonly count: number
  readonly mode: 'spread' | 'single'
  /** True when the 3D curl is disabled (reduced or paused motion). */
  readonly still: boolean
  /** The root element. */
  readonly element: HTMLElement | null
}

export interface FlipBookProps {
  /** Pages in reading order. First may be kind 'cover', last may be kind 'back'. */
  pages: FlipPage[]
  /** Controlled spread index (0 .. count - 1). */
  page?: number
  defaultPage?: number
  /** Called with the new spread index whenever the book settles on / starts turning to another spread. */
  onPageChange?: (spread: number) => void
  /** Like onPageChange but with the visible pages and the text, for captions. */
  onSpreadChange?: (info: FlipSpreadInfo) => void
  /** Page width / height. Default: taken from the first inner page. */
  aspect?: number
  className?: string
  labels?: Partial<FlipLabels>
  /** 'auto' = single page below ~720px container width. */
  mode?: 'auto' | 'spread' | 'single'
  /** Boards (first and last leaf) slightly larger than the paper, with a hinge groove. */
  hardCover?: boolean
  /** Force instant cross-fade instead of the curl (also honoured: prefers-reduced-motion, html[data-motion="paused"]). */
  reducedMotion?: boolean
  /** 'strips' = the curl (a bend made of vertical strips), 'flat' = rigid rotateY leaf. */
  curl?: 'strips' | 'flat'
  /** Strips per leaf for the curl (8 - 32). Default 22 (16 in single mode). */
  strips?: number
  /** 0..1, how glossy the paper looks while it curls (magazine 0.55, novel 0.15). Default 0.3. */
  gloss?: number
  /** Where arrow keys are handled: only while the book has focus ('focus') or anywhere on the page ('window'). */
  keys?: 'focus' | 'window'
  /** Show the built-in prev / next buttons and scrubber. Default true. */
  controls?: boolean
  /** Printed total (for "Pages 4 and 5 of 230"). Default: pages.length. */
  totalPages?: number
  /** Camera tilt in degrees (rotateX). Default 0. */
  tilt?: number
  /** Accessible name of the book (overrides labels.label). */
  'aria-label'?: string
}
