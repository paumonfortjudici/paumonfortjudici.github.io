// The intro's switchboard. Decided ONCE, when this module is first imported (before React renders anything), so that the
// overlay, the Mast (which delays the drawing of the name until the bars start to wipe) and the Cover (which waits for the
// folders' cue) all agree.
//
//   html[data-intro="running"]   the intro is playing (bars on top of an already painted page)
//   html[data-intro="done"]      finished, skipped or never started: the Cover may drop its folders
//   window event 'pm-intro-done' fired exactly once, at the moment the bars have wiped away (or at once when skipped / bypassed)
//
// The intro does NOT play for: deep links (#/work/...), reduced motion, paused motion, a visitor who already saw it in this
// session (sessionStorage, in try/catch), and (while SKIP_FOR_AUTOMATION is true, below) automated browsers (navigator.webdriver)
// unless the URL has ?intro=1 (use it to look at the intro in screenshots; ?intro=1 also ignores the "seen" flag).

export const INTRO_DONE_EVENT = 'pm-intro-done'

/** timeline in ms (the whole intro, folders included, stays under 2.2 s: the Cover's drop takes the last second) */
export const INTRO = {
  /** the bars hold, the slate counts */
  hold: 380,
  /** each bar starts to wipe this much after the previous one */
  stagger: 62,
  /** how long one bar takes to wipe away */
  wipe: 380,
  /** the name starts to draw (the leftmost bars have retreated and the Mast is uncovered) */
  nameAt: 600,
} as const
/** all bars gone: the moment `pm-intro-done` fires */
export const INTRO_END = INTRO.hold + INTRO.stagger * 6 + INTRO.wipe // 1132

const SEEN_KEY = 'pm-intro-seen'

/**
 * Automated browsers (navigator.webdriver: crawlers, audit tools, screenshot scripts) load the page and look at it a second later, so
 * they would all catch the colour bars. They skip the intro unless the URL says `?intro=1`. Real visitors always get it once per
 * session (set this to `false` to make a QA run see the intro exactly as a visitor does).
 */
const SKIP_FOR_AUTOMATION = true

function decide(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const params = new URLSearchParams(window.location.search)
    const forced = params.get('intro')
    if (forced === '0') return false
    if (/^#\/work\//i.test(window.location.hash)) return false
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    if (document.documentElement.getAttribute('data-motion') === 'paused') return false
    if (forced !== null) return true
    if (SKIP_FOR_AUTOMATION && navigator.webdriver) return false
    if (window.sessionStorage.getItem(SEEN_KEY)) return false
  } catch {
    /* storage or matchMedia blocked: fall through and play */
  }
  return true
}

/** true when this page load plays the intro. Constant for the life of the page. */
export const introWillPlay: boolean = decide()

/** how long the Mast waits before it starts to draw the name (0 when there is no intro) */
export const nameDelay: number = introWillPlay ? INTRO.nameAt : 0

if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-intro', introWillPlay ? 'running' : 'done')
}

let finished = !introWillPlay

/** Mark the intro as finished: sets html[data-intro="done"] and fires `pm-intro-done` once. Safe to call repeatedly. */
export function finishIntro(): void {
  if (finished) return
  finished = true
  document.documentElement.setAttribute('data-intro', 'done')
  window.dispatchEvent(new CustomEvent(INTRO_DONE_EVENT))
}

export function markIntroSeen(): void {
  try {
    window.sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    /* private mode: it will simply play again next time */
  }
}
