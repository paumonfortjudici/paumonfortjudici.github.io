// One small store for "where is the visitor on the page": shared by the Mast (colour), the index tabs (scroll-spy and
// counter), the desk (scroll ruler, measuring tape) and the footer. It exists so that the page has ONE IntersectionObserver
// and ONE rAF-throttled passive scroll read, and so that scrolling never re-renders React: subscribers that only move a
// DOM node (ruler clip, tape) take a per-frame callback; React only re-renders when the active section changes.
//
//   html[data-section]   the active section id ('cover' | 'catalog' | 'about' | 'works' | 'process' | 'contact')
//   html --sec/--sec-ink the accent of the active sheet and the ink that sits on it (read from the sheet's own --accent /
//                        --accent-ink, so a section that overrides its Sheet accent is followed; chrome.css has the
//                        default map as a fallback)
//   html --sec-lit       the same accent as it must be drawn ON THE DARK DESK (strokes, stamp): the accent itself when it has
//                        4.5:1 against the desk, cream-2 when it does not (oxblood, pine)
//
// Active section = the sheet that crosses a thin band at the middle of the viewport (IntersectionObserver, the same
// idea as the template). The extremes are forced from the scroll read (top = cover, bottom = contact), because the last
// sheet may never reach the band when the footer is tall.

import { useEffect, useSyncExternalStore } from 'react'
import { SECTION_IDS, type SectionId } from '../../lib/router'
import { contrast, parseHex } from '../primitives/util'

export interface ScrollInfo {
  /** window.scrollY */
  y: number
  /** scrollable distance (document height minus viewport) */
  max: number
  /** 0..1 over the whole page */
  progress: number
  /** 0..6: where the visitor is on the "six inches" ruler (piecewise linear: one inch per sheet, continuous at the boundaries) */
  p: number
  /** document height in px */
  docHeight: number
  /** the active section index (0..5) */
  index: number
}

type Listener = () => void
type FrameListener = (info: ScrollInfo) => void

const COUNT = SECTION_IDS.length
const listeners = new Set<Listener>()
const frameListeners = new Set<FrameListener>()

let activeIndex = 0
let lockedIndex: number | null = null
let users = 0
let stop: (() => void) | null = null

let tops: number[] = []
let breaks: number[] = [] // scroll offsets: breaks[i] = scrollY at which the middle of the viewport reaches section i
let docHeight = 0
let maxScroll = 0
let info: ScrollInfo = { y: 0, max: 0, progress: 0, p: 0, docHeight: 0, index: 0 }

const sectionEl = (i: number): HTMLElement | null => document.getElementById(SECTION_IDS[i])

/** the accent a section's sheet declares for itself, or '' */
function accentOf(i: number): { color: string; ink: string } {
  const el = sectionEl(i)
  if (!el) return { color: '', ink: '' }
  const cs = getComputedStyle(el)
  return { color: cs.getPropertyValue('--accent').trim(), ink: cs.getPropertyValue('--accent-ink').trim() }
}

/** The accents of all six sheets (used once by the tabs for their coloured inserts). Empty strings when a sheet declares none. */
export function readAccents(): { color: string; ink: string }[] {
  return SECTION_IDS.map((_, i) => accentOf(i))
}

const DESK_RGB: [number, number, number] = [0x0e, 0x09, 0x12]

/** the accent as it can be drawn on the dark desk ('' when the colour is not a hex we can measure: chrome.css has the map) */
function litOf(color: string): string {
  const rgb = parseHex(color)
  if (!rgb) return ''
  return contrast(rgb, DESK_RGB) >= 4.5 ? color : 'var(--cream-2)'
}

function writeActive(i: number): void {
  const root = document.documentElement
  root.dataset.section = SECTION_IDS[i]
  const { color, ink } = accentOf(i)
  const lit = color ? litOf(color) : ''
  if (color) root.style.setProperty('--sec', color)
  else root.style.removeProperty('--sec')
  if (ink) root.style.setProperty('--sec-ink', ink)
  else root.style.removeProperty('--sec-ink')
  if (lit) root.style.setProperty('--sec-lit', lit)
  else root.style.removeProperty('--sec-lit')
}

// one rAF-throttled flush for everything that follows the page: scrolling, resizing and a change of active section
let raf = 0
function scheduleFlush(): void {
  if (!raf) {
    raf = requestAnimationFrame(() => {
      raf = 0
      flush()
    })
  }
}

function setActive(i: number): void {
  if (i === activeIndex || i < 0 || i >= COUNT) return
  activeIndex = i
  writeActive(i)
  listeners.forEach((l) => l())
  if (users > 0) scheduleFlush() // the per-frame subscribers (ruler highlight) learn about the new section too
}

function measure(): void {
  const y = window.scrollY
  tops = SECTION_IDS.map((_, i) => {
    const el = sectionEl(i)
    return el ? el.getBoundingClientRect().top + y : 0
  })
  docHeight = document.documentElement.scrollHeight
  maxScroll = Math.max(0, docHeight - window.innerHeight)
  const half = window.innerHeight * 0.5
  breaks = [0]
  for (let i = 1; i < COUNT; i++) {
    const want = tops[i] - half
    breaks.push(Math.min(maxScroll, Math.max(breaks[i - 1] + 1, want)))
  }
  breaks.push(Math.max(maxScroll, breaks[COUNT - 1] + 1))
}

function rulerPosition(y: number): number {
  if (breaks.length < COUNT + 1) return 0
  for (let i = 0; i < COUNT; i++) {
    const a = breaks[i]
    const b = breaks[i + 1]
    if (y <= b || i === COUNT - 1) return i + Math.min(1, Math.max(0, (y - a) / Math.max(1, b - a)))
  }
  return COUNT
}

function flush(): void {
  const y = window.scrollY
  if (lockedIndex === null) {
    if (y <= 2) setActive(0)
    else if (maxScroll > 0 && y >= maxScroll - 2) setActive(COUNT - 1)
  }
  info = { y, max: maxScroll, progress: maxScroll > 0 ? Math.min(1, Math.max(0, y / maxScroll)) : 0, p: rulerPosition(y), docHeight, index: activeIndex }
  frameListeners.forEach((f) => f(info))
}

function start(): () => void {
  const schedule = scheduleFlush

  // the section that crosses the middle band of the viewport is the active one (the sheet with more of the band wins)
  let io: IntersectionObserver | null = null
  const observed = new Set<Element>()
  // sections are looked up again on every re-measure: one that renders a moment later (lazy, Suspense) is picked up too
  const observeSections = () => {
    if (!io) return
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id)
      if (el && !observed.has(el)) {
        observed.add(el)
        io.observe(el)
      }
    }
  }
  if (typeof IntersectionObserver !== 'undefined') {
    io = new IntersectionObserver(
      (entries) => {
        if (lockedIndex !== null) return
        let best: IntersectionObserverEntry | null = null
        for (const e of entries) {
          if (e.isIntersecting && (!best || e.intersectionRect.height >= best.intersectionRect.height)) best = e
        }
        if (!best) return
        const i = (SECTION_IDS as readonly string[]).indexOf((best.target as HTMLElement).id)
        if (i >= 0) setActive(i)
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    )
  }

  observeSections()
  measure()
  writeActive(activeIndex)
  flush()

  const onScroll = () => schedule()
  const onResize = () => {
    observeSections()
    measure()
    schedule()
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
  window.addEventListener('load', onResize)

  // the page changes height when fonts and images arrive and when sections open or close: re-measure then
  let ro: ResizeObserver | null = null
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(onResize)
    ro.observe(document.body)
    const main = document.getElementById('main')
    if (main) ro.observe(main)
  }
  void document.fonts?.ready.then(onResize)

  // a visitor who takes over (wheel, touch, keys) ends a programmatic scroll lock at once
  const release = () => releaseLock()
  window.addEventListener('wheel', release, { passive: true })
  window.addEventListener('touchstart', release, { passive: true })
  window.addEventListener('keydown', release)

  return () => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onResize)
    window.removeEventListener('load', onResize)
    window.removeEventListener('wheel', release)
    window.removeEventListener('touchstart', release)
    window.removeEventListener('keydown', release)
    io?.disconnect()
    ro?.disconnect()
    if (raf) cancelAnimationFrame(raf)
    raf = 0
  }
}

function retain(): () => void {
  users += 1
  if (users === 1) stop = start()
  return () => {
    users -= 1
    if (users === 0) {
      stop?.()
      stop = null
    }
  }
}

// ---- programmatic scrolls (index tabs): hold the active tab on the target while the page travels ---------------------------
let lockTimer = 0
let onScrollEnd: (() => void) | null = null

function releaseLock(): void {
  if (lockedIndex === null) return
  lockedIndex = null
  window.clearTimeout(lockTimer)
  if (onScrollEnd) window.removeEventListener('scrollend', onScrollEnd)
  onScrollEnd = null
  flush()
}

/** Call right before scrolling to a section from the tabs: the tab stays on the target (no hopping through the sheets in between). */
export function lockToSection(id: SectionId): void {
  const i = SECTION_IDS.indexOf(id)
  if (i < 0) return
  lockedIndex = i
  setActive(i)
  window.clearTimeout(lockTimer)
  if (onScrollEnd) window.removeEventListener('scrollend', onScrollEnd)
  onScrollEnd = () => releaseLock()
  window.addEventListener('scrollend', onScrollEnd, { once: true })
  lockTimer = window.setTimeout(releaseLock, 1600) // browsers without scrollend, and scrolls that never move
}

/**
 * The way a native fragment link does it: after a link has scrolled to a sheet, the keyboard's place moves there, so the next Tab
 * goes into that sheet and not on to the next tab of the nav (or, from the footer, nowhere). The sheet takes focus without
 * scrolling (tabindex -1, no ring: chrome.css) and a screen reader announces its name. Call it right after `scrollToSection`.
 */
export function focusSection(id: SectionId): void {
  const el = document.getElementById(id)
  if (!el) return
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
}

/**
 * Back to the very top (the mast included) and `#cover` in the address bar, without a history entry. `behavior: 'auto'` follows
 * the CSS: smooth unless the OS or the visitor asks for no motion. The cover tab stays lit on the way up.
 */
export function scrollToTop(): void {
  lockToSection('cover')
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}#cover`)
  focusSection('cover')
}

// ---- API ---------------------------------------------------------------------------------------------------------------
/** Index (0..5) of the active section. Re-renders only when it changes. Mounting a consumer starts the shared observers. */
export function useActiveIndex(): number {
  useEffect(() => retain(), [])
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => activeIndex,
    () => 0,
  )
}

/**
 * Per-frame scroll callback for things that only move a DOM node (never set React state in it). Called once straight away
 * with the current reading, then at most once per animation frame while the page scrolls or changes size.
 */
export function subscribeScroll(callback: FrameListener): () => void {
  const release = retain()
  frameListeners.add(callback)
  callback(info)
  return () => {
    frameListeners.delete(callback)
    release()
  }
}

export const sectionIds = SECTION_IDS
