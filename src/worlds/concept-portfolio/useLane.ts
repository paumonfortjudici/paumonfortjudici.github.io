// The slide lane: a horizontal scroll-snap strip whose middle slide is full size and whose neighbours step back.
//   wheel   a vertical wheel turns into one slide per gesture while the pointer is over the lane (past the ends the page scrolls on)
//   drag    mouse drag with a throw: the release speed picks the slide the throw lands on (touch and trackpads scroll natively)
//   scroll  every scroll frame writes the scale / tilt / dimming of each mount and the wall's parallax straight to the DOM
// Nothing here uses React state except the index of the middle slide.
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { clamp } from './deck'

interface Options {
  count: number
  still: boolean
  /** the wall slab that drifts slowly against the lane, and the sunburst inside it (shifted back so it stays behind the middle slide) */
  slabRef: RefObject<HTMLElement>
  raysRef: RefObject<HTMLElement>
  /** wheel capture is off while a panel or the presenter is open */
  captureWheel: boolean
}

export interface LaneApi {
  laneRef: RefObject<HTMLDivElement>
  index: number
  mount: (i: number) => (el: HTMLElement | null) => void
  scrim: (i: number) => (el: HTMLElement | null) => void
  goTo: (i: number, options?: { instant?: boolean }) => void
}

export function useLane({ count, still, slabRef, raysRef, captureWheel }: Options): LaneApi {
  const laneRef = useRef<HTMLDivElement>(null)
  const mounts = useRef<(HTMLElement | null)[]>([])
  const scrims = useRef<(HTMLElement | null)[]>([])
  const [index, setIndexState] = useState(0)
  const indexRef = useRef(0)
  const stillRef = useRef(still)
  stillRef.current = still
  const captureRef = useRef(captureWheel)
  captureRef.current = captureWheel
  // while a programmatic scroll (button, key, wheel step, throw) is running the index is the target, not the slide passing by
  const travelling = useRef<number | null>(null)
  const idleTimer = useRef<number>(0)

  const setIndex = useCallback((i: number) => {
    if (indexRef.current === i) return
    indexRef.current = i
    setIndexState(i)
  }, [])

  const targetLeft = useCallback((i: number): number => {
    const lane = laneRef.current
    const m = mounts.current[i]
    if (!lane || !m) return 0
    return m.offsetLeft + m.offsetWidth / 2 - lane.clientWidth / 2
  }, [])

  const goTo = useCallback(
    (raw: number, options?: { instant?: boolean }) => {
      const lane = laneRef.current
      if (!lane) return
      const i = clamp(Math.round(raw), 0, count - 1)
      const instant = options?.instant || stillRef.current
      travelling.current = i
      setIndex(i)
      window.clearTimeout(idleTimer.current)
      lane.setAttribute('data-throw', 'true') // snapping off while we glide to an exact snap position
      lane.scrollTo({ left: targetLeft(i), behavior: instant ? 'auto' : 'smooth' })
      idleTimer.current = window.setTimeout(
        () => {
          travelling.current = null
          lane.removeAttribute('data-throw')
        },
        instant ? 30 : 900,
      )
    },
    [count, setIndex, targetLeft],
  )

  // ---- scroll frame: scale, tilt, dimming, parallax ------------------------------------------------------------------------
  const sync = useCallback(() => {
    const lane = laneRef.current
    const ms = mounts.current
    if (!lane || !ms[0] || !ms[1]) return
    const pitch = ms[1].offsetLeft - ms[0].offsetLeft || 1
    const center = lane.scrollLeft + lane.clientWidth / 2
    const calm = stillRef.current
    let best = 0
    let bestDistance = Infinity
    for (let i = 0; i < count; i++) {
      const m = ms[i]
      if (!m) continue
      const d = (m.offsetLeft + m.offsetWidth / 2 - center) / pitch
      const a = Math.abs(d)
      if (a < bestDistance) {
        bestDistance = a
        best = i
      }
      const near = Math.min(a, 1)
      const far = clamp(a - 1, 0, 1)
      const s = 1 - 0.14 * near - 0.08 * far
      const rot = calm ? 0 : clamp(d, -1.6, 1.6) * 1.1
      m.style.transform = `rotate(${rot.toFixed(2)}deg) scale(${s.toFixed(3)})`
      const scrim = scrims.current[i]
      if (scrim) scrim.style.opacity = (near * 0.3 + far * 0.2).toFixed(3)
    }
    const slab = slabRef.current
    const rays = raysRef.current
    const shift = lane.scrollLeft * 0.3
    if (slab) slab.style.transform = calm ? 'none' : `translate3d(${(-shift).toFixed(1)}px, 0, 0)`
    if (rays) rays.style.transform = calm ? '' : `translate3d(calc(-50% + ${shift.toFixed(1)}px), -50%, 0)`
    if (travelling.current === null) setIndex(best)
  }, [count, setIndex, slabRef, raysRef])

  useEffect(() => {
    const lane = laneRef.current
    if (!lane) return
    let raf = 0
    const onScroll = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0
          sync()
        })
      // a scroll that has stopped (any cause) lets the nearest slide take over again
      window.clearTimeout(idleTimer.current)
      idleTimer.current = window.setTimeout(() => {
        travelling.current = null
        lane.removeAttribute('data-throw')
        sync()
      }, 140)
    }
    lane.addEventListener('scroll', onScroll, { passive: true })
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => {
      // a resize moves the snap positions: stay on the same slide
      lane.scrollTo({ left: targetLeft(indexRef.current), behavior: 'auto' })
      sync()
    })
    ro?.observe(lane)
    sync()
    return () => {
      lane.removeEventListener('scroll', onScroll)
      ro?.disconnect()
      if (raf) cancelAnimationFrame(raf)
      window.clearTimeout(idleTimer.current)
    }
  }, [sync, targetLeft])

  // reduced / paused motion: refresh once so tilt and parallax drop at once
  useEffect(() => {
    sync()
  }, [still, sync])

  // ---- wheel: one slide per gesture -----------------------------------------------------------------------------------------
  useEffect(() => {
    const lane = laneRef.current
    if (!lane) return
    let lastWheel = 0
    let lastStep = 0
    const onWheel = (e: WheelEvent) => {
      if (!captureRef.current || e.ctrlKey || e.metaKey) return
      const ax = Math.abs(e.deltaX)
      const ay = Math.abs(e.deltaY)
      if (ax >= ay) return // sideways: the lane scrolls and snaps natively
      const dir = Math.sign(e.deltaY)
      const at = travelling.current ?? indexRef.current
      if ((dir > 0 && at >= count - 1) || (dir < 0 && at <= 0)) return // past the ends the page scrolls on
      e.preventDefault()
      const now = performance.now()
      const fresh = now - lastWheel > 150
      lastWheel = now
      const strong = (e.deltaMode === 1 ? ay * 33 : ay) >= 50
      if (fresh || (now - lastStep > 340 && strong)) {
        lastStep = now
        goTo(at + dir)
      }
    }
    lane.addEventListener('wheel', onWheel, { passive: false })
    return () => lane.removeEventListener('wheel', onWheel)
  }, [count, goTo])

  // ---- mouse drag with a throw ----------------------------------------------------------------------------------------------
  useEffect(() => {
    const lane = laneRef.current
    if (!lane) return
    interface Drag {
      id: number
      x0: number
      left0: number
      moved: boolean
      samples: { x: number; t: number }[]
    }
    let drag: Drag | null = null
    let swallow = false
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      const el = e.target as Element
      // controls keep their clicks; a neighbour's "go to" button may start a drag
      if (el.closest('button, a, input, select, textarea, [data-cp-ui]') && !el.closest('.w-cp-hit')) return
      if (el.closest('[data-zoom="on"]')) return // the fixed loupe is being dragged over the slide: the lane stays put
      drag = { id: e.pointerId, x0: e.clientX, left0: lane.scrollLeft, moved: false, samples: [{ x: e.clientX, t: performance.now() }] }
    }
    const onMove = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return
      const dx = e.clientX - drag.x0
      if (!drag.moved) {
        if (Math.abs(dx) < 6) return
        drag.moved = true
        window.clearTimeout(idleTimer.current)
        travelling.current = indexRef.current
        lane.setPointerCapture(e.pointerId)
        lane.setAttribute('data-dragging', 'true')
      }
      lane.scrollLeft = drag.left0 - dx
      drag.samples.push({ x: e.clientX, t: performance.now() })
      if (drag.samples.length > 6) drag.samples.shift()
    }
    const finish = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return
      const d = drag
      drag = null
      if (!d.moved) return
      if (lane.hasPointerCapture(e.pointerId)) lane.releasePointerCapture(e.pointerId)
      lane.removeAttribute('data-dragging')
      swallow = true
      window.setTimeout(() => (swallow = false), 0)
      // release speed (px per ms, pointer direction) over the last ~100 ms
      const last = d.samples[d.samples.length - 1]
      const first = d.samples.find((s) => last.t - s.t < 110) ?? d.samples[0]
      const v = last.t > first.t ? (last.x - first.x) / (last.t - first.t) : 0
      const m0 = mounts.current[0]
      const m1 = mounts.current[1]
      const pitch = m0 && m1 ? m1.offsetLeft - m0.offsetLeft : 1
      // the throw carries about a quarter of a second further; the lane scrolls opposite to the pointer
      const projected = lane.scrollLeft - (stillRef.current ? 0 : v * 260)
      const nearest = clamp(Math.round(projected / pitch), 0, count - 1)
      const here = Math.round(lane.scrollLeft / pitch)
      goTo(clamp(nearest, here - 2, here + 2))
    }
    const onClick = (e: MouseEvent) => {
      if (!swallow) return
      e.stopPropagation()
      e.preventDefault()
    }
    lane.addEventListener('pointerdown', onDown)
    lane.addEventListener('pointermove', onMove)
    lane.addEventListener('pointerup', finish)
    lane.addEventListener('pointercancel', finish)
    lane.addEventListener('click', onClick, true)
    return () => {
      lane.removeEventListener('pointerdown', onDown)
      lane.removeEventListener('pointermove', onMove)
      lane.removeEventListener('pointerup', finish)
      lane.removeEventListener('pointercancel', finish)
      lane.removeEventListener('click', onClick, true)
    }
  }, [count, goTo])

  // stable ref callbacks (one per slide), so React does not detach and re-attach them on every render
  const mountRefs = useMemo(() => Array.from({ length: count }, (_, i) => (el: HTMLElement | null) => void (mounts.current[i] = el)), [count])
  const scrimRefs = useMemo(() => Array.from({ length: count }, (_, i) => (el: HTMLElement | null) => void (scrims.current[i] = el)), [count])
  const mount = useCallback((i: number) => mountRefs[i], [mountRefs])
  const scrim = useCallback((i: number) => scrimRefs[i], [scrimRefs])

  return { laneRef, index, mount, scrim, goTo }
}
