/**
 * A tiny governor for the number of strips. The curl is cheap on a laptop but costs main-thread time per
 * strip, so after a turn that ran slowly (median frame over 22 ms, i.e. below ~45 fps) every book on the
 * page uses fewer strips from then on. It never goes back up in the same visit (no oscillation).
 */
const STEPS = [1, 0.72, 0.5, 0.36]
const SLOW_MS = 22
const MIN_STRIPS = 8
let level = 0

export function stripsFor(base: number): number {
  return Math.max(MIN_STRIPS, Math.round(base * STEPS[level]!))
}

export function qualityLevel(): number {
  return level
}

/** Frame intervals (ms) measured while one leaf flew by itself (not held by a pointer). */
export function reportFlight(dts: number[]): boolean {
  if (dts.length < 14) return false
  const sorted = dts.slice().sort((a, b) => a - b)
  const median = sorted[sorted.length >> 1]!
  if (median > SLOW_MS && level < STEPS.length - 1) {
    level++
    return true
  }
  return false
}
