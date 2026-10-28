// The engine behind the shop window: ONE master progress p (0..1) drives every screen in the window.
// Each screen maps p onto its own page (offset = p * (strip height - viewport height)), so the laptop and the phone
// scroll together, the tape shows p, and a drag on either screen moves both.
//
// No React in the loop: the engine writes `transform` straight to the strips and calls the per-frame subscribers
// (the tape pin). It only runs a requestAnimationFrame while something is moving (tour playing and visible, a tween,
// a drag release) and stops by itself otherwise, so an idle or off-screen window costs nothing.

export interface TourScreen {
  /** the clipping frame of the screen */
  viewport: HTMLElement
  /** the tall column of captures, translated by the engine */
  strip: HTMLElement
}

interface Registered extends TourScreen {
  id: string
  /** how far the strip can travel, in the strip's own layout px */
  max: number
  ro: ResizeObserver | null
}

type Phase = 'lead' | 'play' | 'hold' | 'rewind'

const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n)
const easeOutCubic = (u: number): number => 1 - Math.pow(1 - u, 3)
const easeInOut = (u: number): number => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2)

export interface Tour {
  readonly progress: number
  /** a screen joins the window; returns the cleanup */
  register(id: string, screen: TourScreen): () => void
  /** per-frame callback with the new progress (tape pin, flag); returns the cleanup */
  subscribe(fn: (p: number) => void): () => void
  /** playing: the visitor wants the tour to run; active: the window is on screen, the tab is visible, motion is allowed; rate: progress per second at the current speed */
  configure(options: { playing?: boolean; active?: boolean; rate?: number }): void
  /** jump to p without an animation (range input, keyboard on the tape) */
  scrubTo(p: number): void
  /** the tape is being held: the tour waits and picks up again afterwards (if it was playing) */
  holdScrub(held: boolean): void
  /** animate to p (chapter buttons, keyboard steps); `ms` 0 = instant */
  tweenTo(p: number, ms?: number): void
  /** direct manipulation of a screen: grab, drag (clientY), release with a little momentum */
  grab(id: string, clientY: number): void
  drag(clientY: number): void
  release(): void
  /** move by `layoutPx` on screen `id` (keyboard on a screen) */
  nudge(id: string, layoutPx: number, ms?: number): void
  /** called when the visitor takes manual control of a screen: the UI turns the play button off */
  onInteract: (() => void) | null
  destroy(): void
}

export function createTour(): Tour {
  let p = 0
  let playing = false
  let active = false
  let rate = 0.025
  let held = false
  let phase: Phase = 'lead'
  let phaseUntil = 0
  let rewindStart = 0
  let rewindFrom = 1
  let tween: { from: number; to: number; start: number; dur: number } | null = null
  let inertia = 0
  let drag: { id: string; startY: number; startP: number; scale: number; samples: Array<{ t: number; p: number }> } | null = null
  let raf = 0
  let last = 0
  const screens = new Map<string, Registered>()
  const subs = new Set<(value: number) => void>()

  const now = (): number => performance.now()

  const running = (): boolean => playing && active && !held && !drag
  const needsFrame = (): boolean => running() || tween !== null || inertia !== 0

  const apply = (): void => {
    screens.forEach((s) => {
      s.strip.style.transform = `translate3d(0, ${(-p * s.max).toFixed(2)}px, 0)`
    })
    subs.forEach((fn) => fn(p))
  }

  const measure = (s: Registered): void => {
    const max = Math.max(0, s.strip.offsetHeight - s.viewport.clientHeight)
    if (max !== s.max) {
      s.max = max
      apply()
    }
  }

  // where the loop picks up after a start, a scrub or a jump: at the very top the hero rests for a moment first
  const settlePhase = (): void => {
    phase = p >= 1 ? 'hold' : p <= 0 ? 'lead' : 'play'
    phaseUntil = now() + (phase === 'lead' ? 2600 : 1100)
  }

  const tick = (t: number): void => {
    raf = 0
    const dt = Math.min(0.064, Math.max(0, (t - last) / 1000))
    last = t

    if (tween) {
      const u = Math.min(1, (t - tween.start) / tween.dur)
      p = tween.from + (tween.to - tween.from) * easeOutCubic(u)
      if (u >= 1) {
        p = tween.to
        tween = null
        settlePhase()
      }
    } else if (inertia !== 0) {
      p = clamp01(p + inertia * dt)
      if (p <= 0 || p >= 1) inertia = 0
      inertia *= Math.pow(0.035, dt)
      if (Math.abs(inertia) < 0.004) {
        inertia = 0
        settlePhase()
      }
    } else if (running()) {
      if (phase === 'lead') {
        if (t >= phaseUntil) phase = 'play'
      } else if (phase === 'play') {
        p += dt * rate
        if (p >= 1) {
          p = 1
          phase = 'hold'
          phaseUntil = t + 1600
        }
      } else if (phase === 'hold') {
        if (t >= phaseUntil) {
          phase = 'rewind'
          rewindStart = t
          rewindFrom = p
        }
      } else {
        const u = Math.min(1, (t - rewindStart) / 1500)
        p = rewindFrom * (1 - easeInOut(u))
        if (u >= 1) {
          p = 0
          phase = 'lead'
          phaseUntil = t + 2400
        }
      }
    }

    apply()
    if (needsFrame()) raf = requestAnimationFrame(tick)
  }

  const ensureLoop = (): void => {
    if (raf || !needsFrame()) return
    last = now()
    raf = requestAnimationFrame(tick)
  }

  const manual = (): void => {
    tween = null
    inertia = 0
  }

  const tour: Tour = {
    get progress() {
      return p
    },
    register(id, screen) {
      const entry: Registered = { ...screen, id, max: 0, ro: null }
      entry.strip.style.willChange = 'transform'
      screens.set(id, entry)
      if (typeof ResizeObserver !== 'undefined') {
        entry.ro = new ResizeObserver(() => measure(entry))
        entry.ro.observe(entry.strip)
        entry.ro.observe(entry.viewport)
      }
      measure(entry)
      apply()
      return () => {
        entry.ro?.disconnect()
        entry.strip.style.willChange = ''
        entry.strip.style.transform = ''
        if (screens.get(id) === entry) screens.delete(id)
      }
    },
    subscribe(fn) {
      subs.add(fn)
      fn(p)
      return () => {
        subs.delete(fn)
      }
    },
    configure(options) {
      const wasRunning = running()
      if (options.rate !== undefined) rate = options.rate
      if (options.playing !== undefined) playing = options.playing
      if (options.active !== undefined) active = options.active
      if (!wasRunning && running()) settlePhase()
      ensureLoop()
    },
    scrubTo(next) {
      manual()
      p = clamp01(next)
      settlePhase()
      apply()
    },
    holdScrub(next) {
      held = next
      if (!next) settlePhase()
      ensureLoop()
    },
    tweenTo(target, ms = 650) {
      manual()
      const to = clamp01(target)
      if (ms <= 0 || Math.abs(to - p) < 0.0005) {
        p = to
        settlePhase()
        apply()
        return
      }
      tween = { from: p, to, start: now(), dur: ms }
      ensureLoop()
    },
    grab(id, clientY) {
      const s = screens.get(id)
      if (!s) return
      manual()
      const box = s.viewport.getBoundingClientRect()
      const scale = box.height / Math.max(1, s.viewport.clientHeight)
      drag = { id, startY: clientY, startP: p, scale: scale || 1, samples: [{ t: now(), p }] }
      tour.onInteract?.()
    },
    drag(clientY) {
      if (!drag) return
      const s = screens.get(drag.id)
      if (!s || s.max <= 0) return
      const dy = (clientY - drag.startY) / drag.scale
      p = clamp01(drag.startP - dy / s.max)
      const t = now()
      drag.samples.push({ t, p })
      while (drag.samples.length > 2 && t - drag.samples[0].t > 120) drag.samples.shift()
      apply()
    },
    release() {
      if (!drag) return
      const samples = drag.samples
      drag = null
      const a = samples[0]
      const b = samples[samples.length - 1]
      const dtSec = (b.t - a.t) / 1000
      const v = dtSec > 0.012 ? (b.p - a.p) / dtSec : 0
      inertia = Math.abs(v) > 0.03 ? Math.max(-1.6, Math.min(1.6, v)) : 0
      if (inertia === 0) settlePhase()
      ensureLoop()
    },
    nudge(id, layoutPx, ms = 180) {
      const s = screens.get(id)
      if (!s || s.max <= 0) return
      tour.onInteract?.()
      const base = tween ? tween.to : p
      tour.tweenTo(base + layoutPx / s.max, ms)
    },
    onInteract: null,
    destroy() {
      // stops the loop; screens and subscribers remove themselves (so a StrictMode remount just starts again)
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    },
  }
  return tour
}
