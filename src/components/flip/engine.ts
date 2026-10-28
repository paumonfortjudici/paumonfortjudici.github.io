import { JSAnimation, motionValue, type MotionValue } from 'framer-motion/dom'

/**
 * The physics of the book, no React and no DOM.
 *
 * Every leaf has a turn value t (0 = lying on the right-hand stack, 1 = lying on the left-hand stack) held in a
 * MotionValue. A turn is a framer-motion spring on that value; a drag writes the value directly; the components
 * listen to the value and move their own DOM nodes, so nothing re-renders per frame.
 *
 * The spring is framer-motion's own spring generator on its frame loop (JSAnimation, the engine under
 * animate()); importing it directly instead of animate() keeps ~22 KB gzip of DOM animation code out of the chunk.
 *
 * `pos` is where the book is going (the committed position): the number of leaves that lie on the left
 * (spread mode) or the index of the visible page (single mode).
 */

type Stoppable = { stop(): void }

const TURN = { type: 'spring', stiffness: 62, damping: 14.2, mass: 1, restDelta: 0.0005, restSpeed: 0.004 } as const
const PEEK = { type: 'spring', stiffness: 190, damping: 24, mass: 1, restDelta: 0.0005, restSpeed: 0.004 } as const
const JUMP = { type: 'spring', stiffness: 46, damping: 12.5, mass: 1, restDelta: 0.0005, restSpeed: 0.004 } as const
/** How far a hovered corner lifts (fraction of a full turn). */
export const PEEK_T = 0.04
/** More leaves than this in the air at once: the oldest one lands instantly. */
const MAX_FLIGHT = 3

export interface Jumper {
  /** Leaf that turns for the jump. */
  k: number
  dir: 1 | -1
  from: number
  dest: number
}

export class FlipEngine {
  L: number
  maxPos: number
  pos: number
  jumper: Jumper | null = null
  /** During a jump the stack tops keep showing the old pages until the jumper lands. */
  hold: { left: number | null; right: number | null } = { left: null, right: null }
  readonly armed = new Set<number>()
  /** Bumped whenever the structure (flights, jump, arming, position) changes: components re-render on it. */
  version = 0

  private tv = new Map<number, MotionValue<number>>()
  private anim = new Map<number, Stoppable>()
  private flight = new Set<number>()
  private target = new Map<number, 0 | 1>()
  private held = new Set<number>()
  private peeking = new Set<number>()
  private order: number[] = []
  private subs = new Set<() => void>()
  private progressSubs = new Set<() => void>()
  private offs: Array<() => void> = []

  constructor(L: number, maxPos: number, pos: number) {
    this.L = L
    this.maxPos = maxPos
    this.pos = Math.max(0, Math.min(maxPos, pos))
  }

  subscribe = (cb: () => void): (() => void) => {
    this.subs.add(cb)
    return () => this.subs.delete(cb)
  }
  getVersion = (): number => this.version

  onProgress(cb: () => void): () => void {
    this.progressSubs.add(cb)
    return () => this.progressSubs.delete(cb)
  }

  private emit(): void {
    this.version++
    this.subs.forEach((cb) => cb())
  }

  private tick = (): void => {
    this.progressSubs.forEach((cb) => cb())
  }

  restOf(k: number): 0 | 1 {
    return k < this.pos ? 1 : 0
  }

  /** The turn value of leaf k (created on demand at its resting position). */
  t(k: number): MotionValue<number> {
    const have = this.tv.get(k)
    if (have) return have
    const mv: MotionValue<number> = motionValue<number>(this.restOf(k))
    this.tv.set(k, mv)
    this.offs.push(mv.on('change', this.tick))
    return mv
  }

  isFlying(k: number): boolean {
    return this.flight.has(k)
  }
  isHeld(k: number): boolean {
    return this.held.has(k)
  }
  get flying(): number {
    return this.flight.size
  }
  /** True while a pointer holds a leaf or a jump is in the air: new drags wait. */
  get busy(): boolean {
    return this.held.size > 0 || this.jumper !== null
  }

  /** Is this leaf covered by the stack tops that a running jump keeps on screen? */
  isHidden(k: number): boolean {
    const j = this.jumper
    if (!j || k === j.k) return false
    const { left, right } = this.hold
    if (left !== null && k > left && k < this.pos) return true
    if (right !== null && k < right && k >= this.pos) return true
    return false
  }

  /** Book progress in leaves (sum of every turn value), for the page-stack thickness and the centring. */
  progress(): number {
    const j = this.jumper
    if (j) {
      const tj = this.t(j.k).get()
      return j.dir > 0 ? j.from + (j.dest - j.from) * tj : j.from - (j.from - j.dest) * (1 - tj)
    }
    let p = this.pos
    for (const k of this.flight) p += this.t(k).get() - this.restOf(k)
    return p
  }

  // ---------------------------------------------------------------- springs

  private stopAnim(k: number): void {
    const a = this.anim.get(k)
    if (a) a.stop()
    this.anim.delete(k)
  }

  private land(k: number): void {
    const mv = this.t(k)
    const tg = this.target.get(k)
    if (tg !== undefined) mv.set(tg)
    this.anim.delete(k)
    this.target.delete(k)
    this.held.delete(k)
    this.peeking.delete(k)
    this.flight.delete(k)
    this.order = this.order.filter((x) => x !== k)
    if (this.jumper && this.jumper.k === k) {
      this.jumper = null
      this.hold = { left: null, right: null }
    }
    this.emit()
  }

  /** Spring leaf k to a side. */
  private fly(k: number, target: 0 | 1, kind: 'turn' | 'peek' | 'jump' = 'turn', velocity?: number): void {
    const mv = this.t(k)
    this.stopAnim(k)
    this.held.delete(k)
    if (kind !== 'peek') this.peeking.delete(k)
    const wasFlying = this.flight.has(k)
    this.flight.add(k)
    this.target.set(k, target)
    this.order = this.order.filter((x) => x !== k)
    this.order.push(k)
    const conf = kind === 'peek' ? PEEK : kind === 'jump' ? JUMP : TURN
    const toValue = kind === 'peek' ? (target === 0 ? PEEK_T : 1 - PEEK_T) : target
    const ctl = new JSAnimation<number>({
      keyframes: [mv.get(), toValue],
      ...conf,
      velocity: velocity ?? mv.getVelocity(),
      onUpdate: (v: number) => mv.set(v),
      onComplete: () => {
        if (kind === 'peek') {
          // stay lifted until the pointer leaves
          mv.set(toValue)
          this.anim.delete(k)
        } else this.land(k)
      },
    })
    this.anim.set(k, ctl)
    if (kind !== 'peek') this.capFlights(k)
    if (!wasFlying) this.emit()
  }

  private capFlights(except: number): void {
    let guard = 8
    while (this.flight.size > MAX_FLIGHT && guard-- > 0) {
      const victim = this.order.find((x) => x !== except && !this.held.has(x) && !this.peeking.has(x) && x !== this.jumper?.k)
      if (victim === undefined) break
      this.stopAnim(victim)
      this.land(victim)
    }
  }

  // ---------------------------------------------------------------- navigation

  /** Move the book to a position. Returns true when something started moving. */
  goTo(newPos: number, velocity?: number): boolean {
    const np = Math.max(0, Math.min(this.maxPos, Math.round(newPos)))
    this.finishJump()
    const old = this.pos
    if (np === old) return false
    const d = np - old
    if (Math.abs(d) === 1) {
      const k = d > 0 ? old : old - 1
      this.t(k) // create at the old rest value before the position moves
      this.pos = np
      this.fly(k, d > 0 ? 1 : 0, 'turn', velocity)
    } else {
      this.startJump(old, np)
    }
    this.emit()
    return true
  }

  private startJump(old: number, np: number): void {
    const fwd = np > old
    const k = fwd ? old : old - 1
    this.t(k)
    const lo = Math.min(old, np)
    const hi = Math.max(old, np)
    this.pos = np
    for (const [kk, mv] of this.tv) {
      if (kk >= lo && kk < hi && kk !== k) {
        this.stopAnim(kk)
        this.flight.delete(kk)
        this.target.delete(kk)
        this.peeking.delete(kk)
        mv.set(this.restOf(kk))
      }
    }
    this.jumper = { k, dir: fwd ? 1 : -1, from: old, dest: np }
    this.hold = fwd ? { left: old - 1, right: null } : { left: null, right: old }
    this.fly(k, fwd ? 1 : 0, 'jump')
  }

  /** Land a running jump right now. */
  finishJump(): void {
    const j = this.jumper
    if (!j) return
    this.stopAnim(j.k)
    this.land(j.k)
  }

  /** Settle every leaf where it is going (used when motion gets disabled, and on unmount). */
  settleAll(): void {
    for (const k of [...this.flight]) {
      this.stopAnim(k)
      this.land(k)
    }
    for (const [k, mv] of this.tv) mv.set(this.restOf(k))
    this.jumper = null
    this.hold = { left: null, right: null }
    this.emit()
  }

  /** Re-seat the engine at a position without any animation. */
  reset(pos: number): void {
    this.pos = Math.max(0, Math.min(this.maxPos, pos))
    this.settleAll()
  }

  // ---------------------------------------------------------------- hand (drag / scrub / peek)

  /** Leaf that a turn in this direction would move, or -1. dir 1 = next page(s), -1 = previous. */
  leafFor(dir: 1 | -1): number {
    if (dir > 0) return this.pos < this.maxPos ? this.pos : -1
    return this.pos > 0 ? this.pos - 1 : -1
  }

  grab(k: number): MotionValue<number> {
    this.finishJump()
    const mv = this.t(k)
    this.stopAnim(k)
    this.target.delete(k)
    this.peeking.delete(k)
    this.held.add(k)
    this.flight.add(k)
    this.order = this.order.filter((x) => x !== k)
    this.order.push(k)
    this.emit()
    return mv
  }

  drag(k: number, t: number): void {
    this.t(k).set(t < 0 ? 0 : t > 1 ? 1 : t)
  }

  /** Let go of a held leaf: it springs to `target`; the position follows. Returns the new position. */
  drop(k: number, target: 0 | 1, velocity?: number): number {
    this.held.delete(k)
    if (target !== this.restOf(k)) this.pos = target === 1 ? k + 1 : k
    this.fly(k, target, 'turn', velocity)
    this.emit()
    return this.pos
  }

  peek(k: number, side: 0 | 1): void {
    if (k < 0 || this.flight.has(k) || this.jumper) return
    this.peeking.add(k)
    this.fly(k, side, 'peek')
  }

  unpeek(k: number): void {
    if (!this.peeking.has(k) || this.held.has(k)) return
    this.peeking.delete(k)
    this.fly(k, this.restOf(k), 'turn')
  }

  arm(k: number): void {
    if (k < 0 || k >= this.L || this.armed.has(k)) return
    this.armed.add(k)
    this.emit()
  }
  disarm(k: number): void {
    if (this.armed.delete(k)) this.emit()
  }
  disarmAll(): void {
    if (this.armed.size) {
      this.armed.clear()
      this.emit()
    }
  }

  /** Stop every spring (nothing keeps running after the book unmounts). The engine stays reusable (StrictMode). */
  dispose(): void {
    this.settleAll()
  }

  /** Leaves in the air, for mounting. */
  flightList(): number[] {
    return [...this.flight]
  }
}
