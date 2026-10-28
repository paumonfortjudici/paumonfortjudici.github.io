import { useLayoutEffect, useState, useSyncExternalStore, type RefObject } from 'react'

const REDUCE = '(prefers-reduced-motion: reduce)'

function readStill(): boolean {
  if (typeof document === 'undefined') return false
  if (document.documentElement.getAttribute('data-motion') === 'paused') return true
  return typeof window.matchMedia === 'function' && window.matchMedia(REDUCE).matches
}

function subscribeStill(cb: () => void): () => void {
  const mq = typeof window.matchMedia === 'function' ? window.matchMedia(REDUCE) : null
  mq?.addEventListener('change', cb)
  const mo = new MutationObserver(cb)
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] })
  return () => {
    mq?.removeEventListener('change', cb)
    mo.disconnect()
  }
}

/** True when the OS asks for reduced motion, or the visitor paused motion (html[data-motion="paused"]), or `force`. */
export function useStillMotion(force?: boolean): boolean {
  const v = useSyncExternalStore(subscribeStill, readStill, () => false)
  return !!force || v
}

/** Width of an element in px, measured before paint and on every resize. 0 until measured. */
export function useElementWidth(ref: RefObject<HTMLElement>): number {
  const [w, setW] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const read = () => setW((prev) => {
      const next = Math.round(el.getBoundingClientRect().width)
      return next === prev ? prev : next
    })
    read()
    const ro = new ResizeObserver(read)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return w
}
