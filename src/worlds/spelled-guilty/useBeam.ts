// The flashlight. The veil (a full-viewport dark layer, sticky inside the world's scroller) has a soft radial hole whose
// centre is two CSS variables, --bx / --by, written here once per frame while the beam is moving (rAF-lerped towards the
// pointer, the finger, the focused element or the arrow keys). The loop sleeps when the beam has arrived, when the lights
// are on and while the tab is hidden. Under reduced / paused motion the beam still follows the pointer (that is direct
// manipulation, not an animation) but without smoothing, and nothing sweeps by itself.
import { useEffect, useMemo, useRef, type RefObject } from 'react'

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v))
const smooth = (t: number): number => t * t * (3 - 2 * t)

export interface BeamOptions {
  /** the world's scroller: its pointer, touch and focus events steer the beam */
  scrollRef: RefObject<HTMLElement>
  /** the veil element (gets --bx / --by) */
  veilRef: RefObject<HTMLElement>
  /** a small hand-written note that rides along with the beam until the visitor takes over */
  hintRef: RefObject<HTMLElement>
  /** lights off */
  active: boolean
  /** reduced / paused motion: no smoothing and no self-moving sweep */
  instant: boolean
  /** client coordinates where the beam parks before the visitor moves (the book) */
  home: () => { x: number; y: number } | null
  /** the visitor took the light (first real pointer move, key or touch) */
  onTaken?: () => void
  /** true while another station owns the left and right arrow keys (the sample book on screen) */
  yieldKeys?: () => boolean
}

export interface BeamHandle {
  /** nudge the beam by a number of pixels (arrow keys) */
  aim: (dx: number, dy: number) => void
  /** send the beam back to the book */
  recentre: () => void
}

interface Box {
  left: number
  top: number
  width: number
  height: number
}

const SWEEP_MS = 2800

export function useBeam(options: BeamOptions): BeamHandle {
  const latest = useRef(options)
  latest.current = options
  const live = useRef({
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    raf: 0,
    last: 0,
    sweepAt: 0,
    sweeping: false,
    taken: false,
    originX: 0,
    originY: 0,
    box: { left: 0, top: 0, width: 1, height: 1 } as Box,
  })

  const handle = useMemo<BeamHandle>(
    () => ({
      aim: (dx, dy) => api.current.aim(dx, dy),
      recentre: () => api.current.recentre(),
    }),
    [],
  )
  const api = useRef<BeamHandle>({ aim: () => undefined, recentre: () => undefined })

  const { active, instant } = options

  useEffect(() => {
    const s = live.current
    const veil = options.veilRef.current
    const scroller = options.scrollRef.current
    if (!active || !veil || !scroller) {
      api.current = { aim: () => undefined, recentre: () => undefined }
      return
    }

    const measure = (): Box => {
      const r = veil.getBoundingClientRect()
      s.box = { left: r.left, top: r.top, width: Math.max(1, r.width), height: Math.max(1, r.height) }
      return s.box
    }

    const write = (): void => {
      veil.style.setProperty('--bx', `${s.x.toFixed(1)}px`)
      veil.style.setProperty('--by', `${s.y.toFixed(1)}px`)
      const hint = latest.current.hintRef.current
      if (hint) {
        // the note rides on the beam's lower edge, on the side that has room
        const right = s.x < s.box.width * 0.55
        const x = right ? s.x + 120 : s.x - 120 - hint.offsetWidth
        hint.style.transform = `translate3d(${clamp(x, 8, s.box.width - hint.offsetWidth - 8).toFixed(1)}px, ${clamp(s.y + 150, 8, s.box.height - 48).toFixed(1)}px, 0)`
      }
    }

    const homeInStage = (): { x: number; y: number } => {
      const b = measure()
      const h = latest.current.home()
      return h ? { x: clamp(h.x - b.left, 0, b.width), y: clamp(h.y - b.top, 0, b.height) } : { x: b.width * 0.7, y: b.height * 0.5 }
    }

    const stop = (): void => {
      if (s.raf) cancelAnimationFrame(s.raf)
      s.raf = 0
      s.last = 0
    }

    const tick = (now: number): void => {
      s.raf = 0
      const dt = s.last ? Math.min(64, now - s.last) : 16
      s.last = now
      if (s.sweeping) {
        const b = s.box
        const t = clamp((now - s.sweepAt) / SWEEP_MS, 0, 1)
        const home = homeInStage()
        // a searching path: the wall on the left, across the desk, then onto the book
        const a = { x: b.width * 0.2, y: b.height * 0.3 }
        const m = { x: b.width * 0.46, y: b.height * 0.66 }
        const seg = t < 0.5 ? smooth(t / 0.5) : smooth((t - 0.5) / 0.5)
        const from = t < 0.5 ? a : m
        const to = t < 0.5 ? m : home
        s.tx = from.x + (to.x - from.x) * seg + Math.sin(t * 9) * 14 * (1 - t)
        s.ty = from.y + (to.y - from.y) * seg + Math.cos(t * 7) * 10 * (1 - t)
        if (t >= 1) s.sweeping = false
      }
      const k = latest.current.instant ? 1 : 1 - Math.exp(-dt / 85)
      s.x += (s.tx - s.x) * k
      s.y += (s.ty - s.y) * k
      write()
      if (s.sweeping || Math.abs(s.tx - s.x) + Math.abs(s.ty - s.y) > 0.4) {
        s.raf = requestAnimationFrame(tick)
      } else {
        s.x = s.tx
        s.y = s.ty
        write()
        s.last = 0
      }
    }

    const kick = (): void => {
      if (!s.raf && !document.hidden) s.raf = requestAnimationFrame(tick)
    }

    const take = (): void => {
      if (s.taken) return
      s.taken = true
      s.sweeping = false
      latest.current.onTaken?.()
    }

    const toStage = (cx: number, cy: number): { x: number; y: number } => {
      const b = measure()
      return { x: clamp(cx - b.left, 0, b.width), y: clamp(cy - b.top, 0, b.height) }
    }

    const onPointerMove = (event: PointerEvent): void => {
      if (event.pointerType === 'touch') return
      // a mouse that merely twitches while the beam is still searching does not take the light
      if (s.sweeping && !s.taken) {
        if (!s.originX && !s.originY) {
          s.originX = event.clientX
          s.originY = event.clientY
          return
        }
        if (Math.hypot(event.clientX - s.originX, event.clientY - s.originY) < 10) return
      }
      take()
      const p = toStage(event.clientX, event.clientY)
      s.tx = p.x
      s.ty = p.y
      kick()
    }

    const onTouch = (event: TouchEvent): void => {
      const t = event.touches[0]
      if (!t) return
      take()
      const p = toStage(t.clientX, t.clientY)
      s.tx = p.x
      s.ty = p.y
      kick()
    }

    // keyboard: the beam goes where the focus goes, so nobody tabs into the dark
    const onFocusIn = (event: FocusEvent): void => {
      const el = event.target as HTMLElement | null
      if (!el || el === scroller || el.closest('[data-sg-ui]')) return
      const r = el.getBoundingClientRect()
      if (r.width === 0 && r.height === 0) return
      const p = toStage(r.left + r.width / 2, r.top + Math.min(r.height / 2, 260))
      take()
      s.tx = p.x
      s.ty = p.y
      kick()
    }

    // the room itself has focus (the scroller): left and right arrows aim the beam, shift + up / down too (plain up / down keep scrolling)
    const onKey = (event: KeyboardEvent): void => {
      if (event.target !== scroller || event.defaultPrevented) return
      if (event.altKey || event.ctrlKey || event.metaKey) return
      const sideways = event.key === 'ArrowLeft' || event.key === 'ArrowRight'
      const upDown = event.shiftKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')
      if (!sideways && !upDown) return
      if (latest.current.yieldKeys?.()) return
      event.preventDefault()
      const step = sideways ? (event.shiftKey ? 160 : 48) : 120
      const sign = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1
      api.current.aim(sideways ? sign * step : 0, sideways ? 0 : sign * step)
    }

    const onVisibility = (): void => {
      if (document.hidden) stop()
      else if (s.sweeping || Math.abs(s.tx - s.x) + Math.abs(s.ty - s.y) > 0.4) kick()
    }

    const onResize = (): void => {
      const b = measure()
      s.tx = clamp(s.tx, 0, b.width)
      s.ty = clamp(s.ty, 0, b.height)
      s.x = clamp(s.x, 0, b.width)
      s.y = clamp(s.y, 0, b.height)
      write()
    }

    api.current = {
      aim: (dx, dy) => {
        const b = measure()
        take()
        s.tx = clamp(s.tx + dx, 0, b.width)
        s.ty = clamp(s.ty + dy, 0, b.height)
        kick()
      },
      recentre: () => {
        take()
        const h = homeInStage()
        s.tx = h.x
        s.ty = h.y
        kick()
      },
    }

    // start: where the beam is now (or at the first stop of the sweep), then search for the book unless the visitor already has the light
    const b0 = measure()
    if (!s.taken) {
      s.tx = s.x = b0.width * 0.2
      s.ty = s.y = b0.height * 0.3
      write()
      if (!latest.current.instant) {
        s.sweeping = true
        s.sweepAt = performance.now()
        s.originX = 0
        s.originY = 0
        kick()
      } else {
        const h = homeInStage()
        s.tx = s.x = h.x
        s.ty = s.y = h.y
        write()
      }
    } else {
      s.x = clamp(s.x, 0, b0.width)
      s.y = clamp(s.y, 0, b0.height)
      write()
    }

    scroller.addEventListener('pointermove', onPointerMove, { passive: true })
    scroller.addEventListener('touchstart', onTouch, { passive: true })
    scroller.addEventListener('touchmove', onTouch, { passive: true })
    scroller.addEventListener('focusin', onFocusIn)
    scroller.addEventListener('keydown', onKey)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('resize', onResize)
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(onResize)
    observer?.observe(scroller)

    return () => {
      stop()
      scroller.removeEventListener('pointermove', onPointerMove)
      scroller.removeEventListener('touchstart', onTouch)
      scroller.removeEventListener('touchmove', onTouch)
      scroller.removeEventListener('focusin', onFocusIn)
      scroller.removeEventListener('keydown', onKey)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', onResize)
      observer?.disconnect()
      api.current = { aim: () => undefined, recentre: () => undefined }
    }
    // the listeners are rebuilt only when the lights or the motion mode change; everything else is read through `latest`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, instant])

  return handle
}
