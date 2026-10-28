// Small hooks of the cover: when the intro is over, which shape the deck takes, and when to start fetching the peek art.

import { useEffect, useLayoutEffect, useState, type RefObject } from 'react'
import { useMotion } from '../../../lib/motion'
import { loadHandFonts } from '../../../styles/fonts'
import { layoutFor, type DeckLayout } from './slots'

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * True once the intro overlay is over: html[data-intro="done"] (set by the chrome's Intro), or after `fallbackMs` when an
 * intro is running but never says so. Pages with no intro at all (the attribute never appears) start after a beat, so the
 * first paint is never held back. Still motion (reduced / paused) is ready immediately: nothing waits, nothing moves.
 */
export function useIntroReady(fallbackMs = 1500): boolean {
  const { still } = useMotion()
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (done) return
    const root = document.documentElement
    const finish = () => setDone(true)
    if (root.getAttribute('data-intro') === 'done') {
      finish()
      return
    }
    const observer = new MutationObserver(() => {
      if (root.getAttribute('data-intro') === 'done') finish()
    })
    observer.observe(root, { attributes: true, attributeFilter: ['data-intro'] })
    // no intro on this page: do not wait for one
    const beat = window.setTimeout(() => {
      if (!root.hasAttribute('data-intro')) finish()
    }, 220)
    const limit = window.setTimeout(finish, fallbackMs)
    return () => {
      observer.disconnect()
      window.clearTimeout(beat)
      window.clearTimeout(limit)
    }
  }, [done, fallbackMs])

  return done || still
}

/**
 * True `ms` after `active` first became true. A safety net for entrances that wait for the viewer to scroll: a tool that
 * never scrolls (a full-page capture, a crawler, print preview) must still find the page complete.
 */
export function useLate(active: boolean, ms: number): boolean {
  const [late, setLate] = useState(false)
  useEffect(() => {
    if (!active || late) return
    const id = window.setTimeout(() => setLate(true), ms)
    return () => window.clearTimeout(id)
  }, [active, late, ms])
  return late
}

/** The deck's shape from the width of the cover's content box (measured before paint, then followed with a ResizeObserver). */
export function useDeckLayout(ref: RefObject<HTMLElement>): DeckLayout {
  const [layout, setLayout] = useState<DeckLayout>(() => {
    if (typeof window === 'undefined') return 'wide'
    // a first guess from the viewport; the real measurement below replaces it before the first paint
    return layoutFor(window.innerWidth - 2 * 40)
  })
  useIsoLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    setLayout(layoutFor(element.getBoundingClientRect().width))
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[entries.length - 1]
      if (entry) setLayout(layoutFor(entry.contentRect.width))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])
  return layout
}

/**
 * True when it is time to fetch the decorative peek images: the browser is idle after the intro, or the visitor already
 * touched the deck (whichever comes first). Until then no <img> exists, so the first screen carries no extra requests.
 */
export function useArmed(active: boolean, trigger: boolean): boolean {
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    if (!active || armed) return
    if (trigger) {
      setArmed(true)
      return
    }
    const arm = () => setArmed(true)
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(arm, { timeout: 3500 })
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(arm, 2500)
    return () => window.clearTimeout(id)
  }, [active, armed, trigger])
  return armed
}

/** The content-box width of an element, followed with a ResizeObserver (0 until measured). */
export function useElementWidth(ref: RefObject<HTMLElement>): number {
  const [width, setWidth] = useState(0)
  useIsoLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    setWidth(element.getBoundingClientRect().width)
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[entries.length - 1]
      if (entry) setWidth(entry.contentRect.width)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])
  return width
}

/**
 * True once the marker face (Gochi Hand) is in, or after `timeoutMs` whichever comes first, so the hand-written note never
 * shows a system handwriting face and is never stuck hidden either. Starts the (idempotent) lazy load itself.
 */
export function useHandFontReady(timeoutMs = 2500): boolean {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let alive = true
    const done = () => {
      if (alive) setReady(true)
    }
    const timer = window.setTimeout(done, timeoutMs)
    const fonts = typeof document !== 'undefined' ? document.fonts : undefined
    void loadHandFonts()
      .then(() => (fonts ? fonts.load('1em "Gochi Hand"') : undefined))
      .then(done, done)
    return () => {
      alive = false
      window.clearTimeout(timer)
    }
  }, [timeoutMs])
  return ready
}
