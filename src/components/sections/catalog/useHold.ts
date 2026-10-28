// useHold: what a visitor expects when they open a band lower down the stack.
//
// The open band folds shut above the one they clicked (up to 700 px of it, over 0.55 s), which would carry the clicked header off the top
// of the screen and leave them looking at the middle of a panel. Chrome's own scroll anchoring does not hold it here, so this does:
//  1. `hold(header)` records where the header is, and for the length of the fold (a frame loop, 780 ms) scrolls the page by exactly the
//     distance the header drifts, so it stays under the pointer while the bands above it close and the band it opens grows below it;
//  2. when the fold has settled and the band was OPENED (not closed), the page scrolls the least it takes to show the whole band: its
//     bottom edge to the bottom of the screen, never so far that its tab leaves the top (under the sticky nav).
// Any wheel, touch, key or pointer press hands the page back at once (nothing keeps scrolling against the visitor). Reduced and paused
// motion: the folds are instant, the pin is a single correction and the reveal does not glide.

import { useCallback, useEffect, useRef } from 'react'

const HOLD_MS = 780
/** reduced or paused motion: the folds are instant, so a few frames are enough to settle */
const HOLD_STILL_MS = 140
const HANDOVER = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const

interface Run {
  stop: () => void
}

/** scrolls the least that shows the whole band (bottom edge above the fold), keeping its top below the sticky nav */
function bringIntoView(item: HTMLElement, still: boolean): void {
  const box = item.getBoundingClientRect()
  const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72
  const floor = navH + 14
  const below = box.bottom - (window.innerHeight - 28)
  const room = box.top - floor
  const delta = Math.min(below, room)
  if (below > 0 && delta > 8) window.scrollBy({ top: delta, behavior: still ? 'instant' : 'smooth' })
}

/** returns `hold(header, reveal)`: call it in the click handler, BEFORE the state change that opens or closes a band */
export function useHold(still: boolean): (header: HTMLElement, reveal: boolean) => void {
  const current = useRef<Run | null>(null)

  const stop = useCallback((): void => {
    current.current?.stop()
    current.current = null
  }, [])

  // leaving the page or unmounting never leaves a loop or a listener behind
  useEffect(() => stop, [stop])

  return useCallback(
    (header: HTMLElement, reveal: boolean): void => {
      stop()
      const top0 = header.getBoundingClientRect().top
      const t0 = performance.now()
      let raf = 0
      const run: Run = {
        stop: () => {
          cancelAnimationFrame(raf)
          for (const type of HANDOVER) window.removeEventListener(type, run.stop)
          if (current.current === run) current.current = null
        },
      }
      for (const type of HANDOVER) window.addEventListener(type, run.stop, { passive: true })
      const tick = (): void => {
        const drift = header.getBoundingClientRect().top - top0
        if (Math.abs(drift) >= 0.5) window.scrollBy({ top: drift, behavior: 'instant' })
        if (performance.now() - t0 < (still ? HOLD_STILL_MS : HOLD_MS)) {
          raf = requestAnimationFrame(tick)
          return
        }
        run.stop()
        const item = header.closest<HTMLElement>('.pm-cat-item')
        if (reveal && item) bringIntoView(item, still)
      }
      current.current = run
      raf = requestAnimationFrame(tick)
    },
    [stop, still],
  )
}
