// "The book has stopped turning": used to draw the pen circle only once the page it lives on has landed.
// FlipBook reports a spread change the moment a turn STARTS, and keeps a page (and so its overlay) hidden until the leaf lands.
// This watches the leaves (data-state="m" = a sheet is in the air) and calls back once nothing has moved for a few frames.
// Reduced or paused motion has no curl (a 0.24 s dissolve), so it simply waits that long. Returns the cancel function.

const SETTLE_FRAMES = 6
const MIN_WAIT = 380
const MAX_WAIT = 3200

export function whenSettled(book: HTMLElement | null, still: boolean, done: () => void, skipMinimum = false): () => void {
  if (!book || still) {
    const id = window.setTimeout(done, still ? 300 : 0)
    return () => window.clearTimeout(id)
  }
  const t0 = performance.now()
  let calm = 0
  let raf = 0
  const tick = () => {
    const elapsed = performance.now() - t0
    const moving = book.querySelector('.pm-flip__leaf[data-state="m"]') !== null
    calm = moving ? 0 : calm + 1
    if ((calm >= SETTLE_FRAMES && (skipMinimum || elapsed > MIN_WAIT)) || elapsed > MAX_WAIT) {
      done()
      return
    }
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(raf)
}
