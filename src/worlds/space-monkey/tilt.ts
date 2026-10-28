// The holographic tilt: one small spring that follows the pointer (or the keys, or the slider) and writes two things straight
// to the DOM, never to React state:
//   - rotateX / rotateY on the tilt wrapper (3D, transform only)
//   - --lx --ly --mag (light position 0..1 and tilt magnitude 0..1) on the foil layers, which move by translate only
// It runs only while something is happening: the pointer is over the poster, the spring has not settled, or the short idle
// "hello" sweep after opening is still going. Off-screen, hidden tab and still motion (reduced / paused) schedule nothing.

const MAX_Y_DEG = 17 // rotateY at full tilt
const MAX_X_DEG = 12 // rotateX at full tilt
const STIFFNESS = 170
const DAMPING = 18
const IDLE_MS = 9000
const REST = { x: -0.2, y: -0.12 } // where the light sits when nothing happens: a little foil is always visible

export interface HoloTiltOptions {
  /** the pointer + keyboard surface */
  stage: HTMLElement
  /** receives rotateX / rotateY */
  tilt: HTMLElement
  /** receive --lx --ly --mag */
  lit: HTMLElement[]
  /** offsets the idle sweep so the two posters never move in step */
  phase?: number
  still: boolean
  /** the horizontal tilt chosen with keys, so a slider can follow (-1..1; 0 when automatic again) */
  onManual?: (x: number) => void
  /** the horizontal tilt the poster is really at while the pointer or the idle sweep drives it (-1..1, rounded to 5 %), so the gauge tells the truth */
  onFollow?: (x: number) => void
}

type Vec = { x: number; y: number }

const clamp = (v: number, lo = -1, hi = 1) => Math.min(hi, Math.max(lo, v))

export class HoloTilt {
  private readonly stage: HTMLElement
  private readonly tilt: HTMLElement
  private readonly lit: HTMLElement[]
  private readonly phase: number
  private readonly onManual?: (x: number) => void
  private readonly onFollow?: (x: number) => void
  private followed = NaN
  private readonly io: IntersectionObserver

  private pos: Vec = { ...REST }
  private vel: Vec = { x: 0, y: 0 }
  private pointer: Vec | null = null
  private manual: Vec | null = null
  private idleLeft = IDLE_MS
  private clock = 0
  private amp = 1
  private still: boolean
  private visible = true
  private destroyed = false
  private raf = 0
  private last = 0
  private flipped = false

  constructor(options: HoloTiltOptions) {
    this.stage = options.stage
    this.tilt = options.tilt
    this.lit = options.lit
    this.phase = options.phase ?? 0
    this.still = options.still
    this.onManual = options.onManual
    this.onFollow = options.onFollow

    this.stage.addEventListener('pointerenter', this.onPointer)
    this.stage.addEventListener('pointermove', this.onPointer)
    this.stage.addEventListener('pointerdown', this.onTouchDown)
    this.stage.addEventListener('pointerleave', this.onLeave)
    this.stage.addEventListener('pointercancel', this.onLeave)
    this.stage.addEventListener('pointerup', this.onTouchUp)
    document.addEventListener('visibilitychange', this.sync)

    this.io = new IntersectionObserver((entries) => {
      this.visible = entries[entries.length - 1]?.isIntersecting ?? true
      this.sync()
    })
    this.io.observe(this.stage)

    this.apply()
    this.sync()
  }

  // ---- public ---------------------------------------------------------------------------------------------------------
  setStill(still: boolean): void {
    if (still === this.still) return
    this.still = still
    this.vel = { x: 0, y: 0 }
    this.pointer = null
    this.pos = still ? { ...(this.manual ?? REST) } : this.pos
    this.apply()
    this.sync()
  }

  /** the back of the card is for reading: less tilt, no idle sweep, a calm sheen */
  setFlipped(flipped: boolean): void {
    this.flipped = flipped
    this.amp = flipped ? 0.45 : 1
    if (flipped) this.idleLeft = 0
    this.wake()
  }

  /** keys: move the light and the tilt a step at a time (-1..1 on each axis) */
  nudge(dx: number, dy: number): void {
    const from = this.manual ?? { x: Math.round(this.pos.x * 3) / 3, y: Math.round(this.pos.y * 3) / 3 }
    this.setManual({ x: clamp(from.x + dx), y: clamp(from.y + dy) })
  }

  /** slider: x in -1..1, 0 hands control back to the automatic sweep and the pointer */
  setManualX(x: number): void {
    if (Math.abs(x) < 0.02) {
      this.reset()
      return
    }
    this.setManual({ x: clamp(x), y: 0.3 * Math.sin(x * 2.4) })
  }

  reset(): void {
    this.manual = null
    this.onManual?.(0)
    this.wake()
  }

  destroy(): void {
    this.destroyed = true
    if (this.raf) cancelAnimationFrame(this.raf)
    this.raf = 0
    this.stage.removeEventListener('pointerenter', this.onPointer)
    this.stage.removeEventListener('pointermove', this.onPointer)
    this.stage.removeEventListener('pointerdown', this.onTouchDown)
    this.stage.removeEventListener('pointerleave', this.onLeave)
    this.stage.removeEventListener('pointercancel', this.onLeave)
    this.stage.removeEventListener('pointerup', this.onTouchUp)
    document.removeEventListener('visibilitychange', this.sync)
    this.io.disconnect()
  }

  // ---- input ----------------------------------------------------------------------------------------------------------
  private setManual(v: Vec): void {
    this.manual = v
    this.onManual?.(v.x)
    if (this.still) {
      this.pos = { ...v }
      this.apply()
      return
    }
    this.wake()
  }

  private norm(event: PointerEvent): Vec {
    const r = this.stage.getBoundingClientRect()
    return {
      x: clamp(((event.clientX - r.left) / Math.max(1, r.width) - 0.5) * 2),
      y: clamp(((event.clientY - r.top) / Math.max(1, r.height) - 0.5) * 2),
    }
  }

  private readonly onPointer = (event: PointerEvent): void => {
    if (this.still || (event.pointerType !== 'mouse' && event.type === 'pointerenter')) return
    // over a control (the Flip tab, a colour chip) the poster holds its pose, so the thing under the pointer never slides away
    // before the click lands
    const target = event.target
    if (target instanceof Element && target.closest('button, a, input')) {
      this.pointer = { x: this.pos.x, y: this.pos.y }
      this.wake()
      return
    }
    this.pointer = this.norm(event)
    this.wake()
  }

  private readonly onTouchDown = (event: PointerEvent): void => {
    if (this.still || event.pointerType === 'mouse') return
    this.pointer = this.norm(event)
    this.wake()
  }

  private readonly onTouchUp = (event: PointerEvent): void => {
    if (event.pointerType !== 'mouse') this.onLeave()
  }

  private readonly onLeave = (): void => {
    if (!this.pointer) return
    this.pointer = null
    // the keys or the gauge still own the pose: the gauge goes back to that value
    if (this.manual) this.onManual?.(this.manual.x)
    this.wake()
  }

  // ---- loop -----------------------------------------------------------------------------------------------------------
  private goal(): Vec {
    if (this.pointer) return this.pointer
    if (this.manual) return this.manual
    if (this.idleLeft > 0 && !this.flipped) {
      const t = this.clock + this.phase
      return { x: 0.46 * Math.sin(t * 0.62), y: 0.3 * Math.sin(t * 0.41 + 1.1) }
    }
    return this.flipped ? { x: 0, y: 0 } : REST
  }

  private settled(goal: Vec): boolean {
    return (
      this.idleLeft <= 0 &&
      !this.pointer &&
      Math.abs(goal.x - this.pos.x) < 0.0015 &&
      Math.abs(goal.y - this.pos.y) < 0.0015 &&
      Math.abs(this.vel.x) < 0.0015 &&
      Math.abs(this.vel.y) < 0.0015
    )
  }

  private readonly frame = (now: number): void => {
    this.raf = 0
    if (!this.canRun()) return
    const dt = Math.min(0.05, Math.max(0.001, (now - this.last) / 1000))
    // idle is gentle: ~30 fps is enough; the pointer gets every frame
    if (!this.pointer && now - this.last < 28) {
      this.raf = requestAnimationFrame(this.frame)
      return
    }
    this.last = now
    this.clock += dt
    if (!this.pointer && !this.manual) this.idleLeft = Math.max(0, this.idleLeft - dt * 1000)

    const goal = this.goal()
    const steps = 2
    const h = dt / steps
    for (let i = 0; i < steps; i++) {
      this.vel.x += ((goal.x - this.pos.x) * STIFFNESS - this.vel.x * DAMPING) * h
      this.vel.y += ((goal.y - this.pos.y) * STIFFNESS - this.vel.y * DAMPING) * h
      this.pos.x += this.vel.x * h
      this.pos.y += this.vel.y * h
    }
    this.apply()
    if (!this.settled(goal)) this.raf = requestAnimationFrame(this.frame)
  }

  private canRun(): boolean {
    return !this.destroyed && !this.still && this.visible && !document.hidden
  }

  private readonly sync = (): void => {
    if (this.canRun()) this.wake()
    else if (this.raf) {
      cancelAnimationFrame(this.raf)
      this.raf = 0
    }
  }

  private wake(): void {
    if (this.raf || !this.canRun()) return
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.frame)
  }

  private apply(): void {
    const { x, y } = this.pos
    if (this.still) {
      if (this.tilt.style.transform) this.tilt.style.removeProperty('transform')
    } else {
      this.tilt.style.transform = `rotateX(${(-y * MAX_X_DEG * this.amp).toFixed(3)}deg) rotateY(${(x * MAX_Y_DEG * this.amp).toFixed(3)}deg)`
    }
    const lx = clamp(0.5 + x * 0.5, 0, 1).toFixed(4)
    const ly = clamp(0.5 + y * 0.5, 0, 1).toFixed(4)
    const mag = Math.min(1, Math.hypot(x, y) * 1.1).toFixed(3)
    // the gauge follows whatever drives the pose except its own value (keys and the gauge write it through onManual)
    if (this.onFollow && (!this.manual || this.pointer)) {
      const step = Math.round(clamp(x) * 20) / 20
      if (step !== this.followed) {
        this.followed = step
        this.onFollow(step)
      }
    }
    for (const el of this.lit) {
      el.style.setProperty('--lx', lx)
      el.style.setProperty('--ly', ly)
      el.style.setProperty('--mag', mag)
    }
  }
}
