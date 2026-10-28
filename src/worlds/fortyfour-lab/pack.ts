// Where everything on the wall hangs in the wide layout: a tiny stacking routine in pixels, with no DOM in it.
// Two columns (left and right of the spine) are filled top to bottom. A post goes in its own column, under whatever is already there,
// and never higher than `stagger` of the previous post's height below that post's top, so the two columns interleave like the teeth
// of a zip. (A CSS grid with auto rows could not do this: a row shared by two items of different heights is stretched by both, and a
// short tag beside a tall one left a hole of half a post.)

export type Col = 'left' | 'right'

export type SlotKind = 'month-full' | 'month-side' | 'key' | 'post' | 'fact' | 'sizes' | 'end'

export interface Slot {
  kind: SlotKind
  /** the column the box hangs in; a side banner also covers the spine, the full banner covers everything */
  col: Col | 'all'
  /** side banners only: the column the first post of its month hangs in (the banner sits in the other one, beside that post) */
  firstSide?: Col
}

export interface Packed {
  /** top of every box, in px from the top of the feed (same order as the slots) */
  tops: number[]
  /** bottom of the lowest box */
  end: number
}

/**
 * @param slots   in reading order
 * @param heights the full height of every box, margins included, in px (same order)
 * @param stagger how far down the previous post's height the next post of the other column starts (0.5 = half way)
 */
export function pack(slots: Slot[], heights: number[], stagger = 0.5): Packed {
  const bottom = { left: 0, right: 0 }
  const tops: number[] = []
  let prevTop = 0
  let prevH = 0
  slots.forEach((slot, i) => {
    const h = heights[i] ?? 0
    let top: number
    if (slot.kind === 'month-full') {
      top = 0
      bottom.left = bottom.right = h
      prevTop = 0
      prevH = 0
    } else if (slot.kind === 'month-side') {
      // beside the first post of its month, never above it
      const col = slot.col as Col
      const first = Math.max(bottom[slot.firstSide ?? col], prevTop + prevH * stagger)
      top = Math.max(bottom[col], first)
      bottom[col] = top + h
    } else if (slot.kind === 'post') {
      const col = slot.col as Col
      top = Math.max(bottom[col], prevTop + prevH * stagger)
      bottom[col] = top + h
      prevTop = top
      prevH = h
    } else {
      // the key, the small cards and the end card hang right under what is already in their column
      const col = slot.col as Col
      top = bottom[col]
      bottom[col] = top + h
    }
    tops.push(top)
  })
  return { tops, end: Math.max(bottom.left, bottom.right) }
}
