import { useEffect, useState, type RefObject } from 'react'

export interface UseInViewOptions {
  /** stay true after the first time the element is seen (reveals, lazy starts). Default false. */
  once?: boolean
  /** IntersectionObserver rootMargin. Default '0px'. A negative bottom margin ('0px 0px -8% 0px') waits until the element is well inside. */
  rootMargin?: string
  /** IntersectionObserver threshold. Default 0. */
  threshold?: number | number[]
  /** scroll container to observe against (default: the viewport). Pass a ref: inside a world use `useWorld().scrollRef`. */
  root?: Element | RefObject<Element> | null
  /** value before the first observation. Default false. */
  initial?: boolean
}

/**
 * True while the referenced element intersects the viewport (or `root`).
 * The element must be mounted on the first effect (a ref to something rendered conditionally later is not picked up).
 * Without IntersectionObserver the element counts as visible.
 */
export function useInView<T extends Element>(ref: RefObject<T>, options: UseInViewOptions = {}): boolean {
  const { once = false, rootMargin = '0px', threshold = 0, root = null, initial = false } = options
  const [inView, setInView] = useState(initial)
  const thresholdKey = Array.isArray(threshold) ? threshold.join(',') : String(threshold)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const rootElement = root && 'current' in root ? root.current : root
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1]
        if (!entry) return
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { root: rootElement, rootMargin, threshold: thresholdKey.includes(',') ? thresholdKey.split(',').map(Number) : Number(thresholdKey) },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, once, rootMargin, thresholdKey, root])

  return inView
}
