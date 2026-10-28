// Tiny hooks shared by the primitives. They are local on purpose (no dependency on src/lib/hooks): the primitives are
// also used by the dev-only kit gallery, which must work without the site shell. Motion semantics are identical to
// useMotion(): everything that moves has a CSS path for prefers-reduced-motion AND html[data-motion="paused"].

import { useEffect, useLayoutEffect, type RefObject } from 'react'

export const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

type Callback = (el: Element) => void
interface SharedObserver {
  io: IntersectionObserver
  callbacks: Map<Element, Callback>
}
const observers = new Map<string, SharedObserver>()

export interface ObserveOptions {
  /** default '0px 0px -8% 0px': the element must be well inside the viewport (as in the original template) */
  rootMargin?: string
  threshold?: number
}

/**
 * Calls `cb` once, the first time `el` is visible. One shared IntersectionObserver per option set, so 100 reveals
 * cost one observer. Without IntersectionObserver the callback runs immediately. Returns the cleanup.
 */
export function observeOnce(el: Element, cb: Callback, options: ObserveOptions = {}): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    cb(el)
    return () => undefined
  }
  const rootMargin = options.rootMargin ?? '0px 0px -8% 0px'
  const threshold = options.threshold ?? 0
  const key = `${rootMargin}|${threshold}`
  let shared = observers.get(key)
  if (!shared) {
    const callbacks = new Map<Element, Callback>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const fn = callbacks.get(entry.target)
          if (!fn) continue
          callbacks.delete(entry.target)
          io.unobserve(entry.target)
          fn(entry.target)
        }
      },
      { rootMargin, threshold },
    )
    shared = { io, callbacks }
    observers.set(key, shared)
  }
  const s = shared
  s.callbacks.set(el, cb)
  s.io.observe(el)
  return () => {
    s.callbacks.delete(el)
    s.io.unobserve(el)
  }
}

/**
 * Sets data-in="true" on the element the first time it is visible (no React state, no re-render).
 * CSS decides what that means: hidden initial states exist only under `html.js`, so without JS everything is visible.
 */
export function useRevealOnce(ref: RefObject<HTMLElement | SVGElement | null>, options: ObserveOptions & { disabled?: boolean } = {}): void {
  const { disabled, rootMargin, threshold } = options
  useEffect(() => {
    const el = ref.current
    if (!el || disabled) return
    return observeOnce(el, (node) => node.setAttribute('data-in', 'true'), { rootMargin, threshold })
  }, [ref, disabled, rootMargin, threshold])
}

/**
 * Keeps an SVG's stroke width constant in SCREEN pixels while the SVG scales with its box:
 * the viewBox scales strokes, so the width in viewBox units is recomputed from the rendered width.
 * (`vector-effect: non-scaling-stroke` is not an option: it breaks pathLength dash maths.)
 * `units(renderedWidthPx)` returns the stroke width in viewBox units.
 */
export function useInkWidth(
  svgRef: RefObject<SVGSVGElement | null>,
  targetRef: RefObject<SVGElement | null>,
  units: (renderedWidthPx: number) => number,
  deps: readonly unknown[],
): void {
  useIsoLayoutEffect(() => {
    const svg = svgRef.current
    const target = targetRef.current
    if (!svg || !target) return
    const apply = (width: number) => {
      if (width > 0) target.setAttribute('stroke-width', String(Math.round(units(width) * 100) / 100))
    }
    apply(svg.clientWidth || svg.getBoundingClientRect().width)
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver((entries) => {
      const entry = entries[entries.length - 1]
      apply(entry ? entry.contentRect.width : svg.clientWidth)
    })
    ro.observe(svg)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
