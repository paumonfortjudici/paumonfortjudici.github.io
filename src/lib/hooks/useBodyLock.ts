import { useEffect, type RefObject } from 'react'

interface Lock {
  count: number
  overflow: string
}
const locks = new WeakMap<HTMLElement, Lock>()

function resolve(target?: RefObject<HTMLElement> | HTMLElement | null): HTMLElement | null {
  if (!target) return typeof document === 'undefined' ? null : document.documentElement
  return 'current' in target ? target.current : target
}

/**
 * Locks scrolling of the page (default) or of a given element while `active`. Reference counted, so nested users
 * (a lightbox inside a world) cannot unlock each other. html has `scrollbar-gutter: stable`, so nothing shifts.
 * The world shell does NOT need this (the router sets html[data-world-open]); use it for menus, lightboxes, drawers.
 * For a lightbox inside a world pass the world's scroller: `useBodyLock(open, useWorld().scrollRef)`.
 */
export function useBodyLock(active: boolean, target?: RefObject<HTMLElement> | HTMLElement | null): void {
  useEffect(() => {
    if (!active) return
    const element = resolve(target)
    if (!element) return
    let lock = locks.get(element)
    if (!lock) {
      lock = { count: 0, overflow: element.style.overflow }
      locks.set(element, lock)
    }
    if (lock.count === 0) {
      element.style.overflow = 'hidden'
      element.setAttribute('data-scroll-locked', '')
    }
    lock.count += 1
    return () => {
      const current = locks.get(element)
      if (!current) return
      current.count -= 1
      if (current.count <= 0) {
        element.style.overflow = current.overflow
        element.removeAttribute('data-scroll-locked')
        locks.delete(element)
      }
    }
  }, [active, target])
}
