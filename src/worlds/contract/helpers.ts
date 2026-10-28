import type { CSSProperties } from 'react'
import type { FlipSpreadInfo } from '../../components/flip'
import { PAGES, SPREADS, type Box, type BylineDef } from './data'

export const pad2 = (n: number): string => String(n).padStart(2, '0')

/** the FlipBook page id of a printed page number: p-004, p-230 */
export const pageId = (n: number): string => `p-${String(n).padStart(3, '0')}`

/** the spread index (0 = front cover, 15 = back cover) that shows a printed page */
export const spreadOfPage = (n: number): number => SPREADS.findIndex((s) => s.includes(n))

/** index of a printed page inside the 30 shipped pages (the single-page position of the book) */
export const pageIndex = (n: number): number => PAGES.findIndex((p) => p.n === n)

/** "04–05", "Cover", "Back cover", or "04" in single-page mode: the live part of the slug line */
export function proofLabel(info: FlipSpreadInfo | null): string {
  if (!info) return 'Cover'
  const nums = info.pages.map((p) => p.n ?? 0)
  if (nums.length === 2) return `${pad2(nums[0])}–${pad2(nums[1])}`
  const only = info.pages[0]
  if (!only) return 'Cover'
  if (only.kind === 'cover') return 'Cover'
  if (only.kind === 'back') return 'Back cover'
  return pad2(only.n ?? 0)
}

/** label printed under a frame of the contact sheet: "Cover", "4–5", "Back" */
export function frameLabel(spread: number[]): string {
  if (spread.length === 1) return spread[0] === 1 ? 'Cover' : 'Back'
  return `${spread[0]}–${spread[1]}`
}

/** the ring drawn around a printed line: the box grown a little so the pen has room, as [left, top, width, height] in percent */
export function grow(box: Box, padX: number, padY: number): Box {
  return [box[0] - padX, box[1] - padY, box[2] + padX * 2, box[3] + padY * 2]
}

/** the box of a region of a page (percent of the page), re-expressed in percent of a crop of that page: [left, top, width, height] */
export function inCrop(box: Box, crop: Box): Box {
  return [((box[0] - crop[0]) / crop[2]) * 100, ((box[1] - crop[1]) / crop[3]) * 100, (box[2] / crop[2]) * 100, (box[3] / crop[3]) * 100]
}

/** width / height of a box given in percent of a page that is 1000 x 1331 */
export function boxRatio(box: Box, pageW = 1000, pageH = 1331): number {
  return (box[2] * pageW) / (box[3] * pageH)
}

/**
 * A window on a byline crop (the strip is 11 to 17 times wider than tall) for the small slips and the print: `lead` source pixels
 * before the name and `tail` after the full stop. The crop scales to fill whatever width its window has, so the name is as big as
 * the room allows. Returns the custom properties the CSS needs: --left and --span, as fractions of the crop's width.
 */
export function cropWindow(b: BylineDef, lead: number, tail: number): { vars: CSSProperties; from: number; span: number } {
  const from = b.pau - lead
  const to = b.end * b.w + tail
  return { vars: { '--left': from / b.w, '--span': (to - from) / b.w } as CSSProperties, from, span: to - from }
}
