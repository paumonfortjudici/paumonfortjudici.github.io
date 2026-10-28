// Gravity mode: the lid becomes a tilted desk and every sticker on it falls, bounces, tumbles and piles up.
// matter-js is imported lazily (a dynamic import, so it never touches the main chunk and only loads the first time Gravity is
// switched on). Each sticker is a compound body made of the convex pieces of its white vinyl outline (shapes.generated.ts).
import type Matter from 'matter-js'
import { CANVAS_H, CANVAS_W } from './data'

export type MatterLib = typeof Matter

export interface PhysInput {
  n: number
  /** canvas centre in lid-local px */
  x: number
  y: number
  rotDeg: number
  /** px per canvas px (the sticker's on-screen scale) */
  k: number
  /** convex pieces, flat [x0, y0, x1, y1, ...] in canvas px */
  parts: number[][]
}

export interface PhysPose {
  n: number
  x: number
  y: number
  rotDeg: number
}

export interface Box {
  x: number
  y: number
  w: number
  h: number
}

let pending: Promise<MatterLib> | null = null

export function loadMatter(): Promise<MatterLib> {
  if (!pending) {
    pending = import('matter-js').then((mod) => {
      const m = mod as unknown as { default?: MatterLib }
      return m.default ?? (mod as unknown as MatterLib)
    })
    pending.catch(() => {
      pending = null
    })
  }
  return pending
}

/** acceleration scale: Matter's default is 0.001; paper-light stickers feel right a little faster */
const GRAVITY = 0.0016
const STEP = 1000 / 60
const MAX_STEP_SPEED = 38
/** paper drags in the air: a little at first, then more and more, so a pile always comes to rest (measured in the lab: every
    run falls asleep within about 2 to 7 seconds; with constant drag a pile of compound bodies can keep rocking for ever) */
const AIR_START = 0.03
const AIR_RAMP_AFTER = 1.3 // seconds
const AIR_RAMP = 0.35 // per second
const AIR_MAX = 0.6
const GIVE_UP_AFTER = 7 // seconds: whatever still moves is put to sleep

interface Item {
  n: number
  body: Matter.Body
  comX: number
  comY: number
}

export class GravityWorld {
  private M: MatterLib
  private engine: Matter.Engine
  private items: Item[] = []
  private acc = 0
  private calm = 0
  private age = 0
  private air = AIR_START
  private gx = 0
  private gy = 1
  private inner: Box

  constructor(M: MatterLib, inputs: PhysInput[], inner: Box, gravity: { x: number; y: number }) {
    this.M = M
    this.inner = inner
    const { Engine, Bodies, Body, Vertices, Composite } = M
    this.engine = Engine.create({ enableSleeping: true, positionIterations: 10, velocityIterations: 8, constraintIterations: 2 })
    this.setGravity(gravity.x, gravity.y)

    // four thick walls around the lid's play area
    const T = 400
    const wall = { isStatic: true, friction: 0.7, frictionStatic: 1, restitution: 0.2 }
    Composite.add(this.engine.world, [
      Bodies.rectangle(inner.x + inner.w / 2, inner.y + inner.h + T / 2, inner.w + 2 * T, T, wall),
      Bodies.rectangle(inner.x + inner.w / 2, inner.y - T / 2, inner.w + 2 * T, T, wall),
      Bodies.rectangle(inner.x - T / 2, inner.y + inner.h / 2, T, inner.h + 2 * T, wall),
      Bodies.rectangle(inner.x + inner.w + T / 2, inner.y + inner.h / 2, T, inner.h + 2 * T, wall),
    ])

    const opts = { friction: 0.55, frictionStatic: 0.9, frictionAir: AIR_START, restitution: 0.2, density: 0.0016, slop: 0.07 }
    for (const input of inputs) {
      const parts = input.parts.map((flat) => {
        const vs: Matter.Vector[] = []
        for (let i = 0; i < flat.length; i += 2) vs.push({ x: (flat[i] - CANVAS_W / 2) * input.k, y: (flat[i + 1] - CANVAS_H / 2) * input.k })
        const sorted = Vertices.clockwiseSort(vs)
        return Body.create({ position: Vertices.centre(sorted), vertices: sorted, ...opts })
      })
      const body = Body.create({ parts, ...opts })
      // the compound's centre of mass, in the frame whose origin is the sticker's canvas centre
      const comX = body.position.x
      const comY = body.position.y
      const a = (input.rotDeg * Math.PI) / 180
      Body.setAngle(body, a)
      Body.setPosition(body, { x: input.x + (Math.cos(a) * comX - Math.sin(a) * comY), y: input.y + (Math.sin(a) * comX + Math.cos(a) * comY) })
      // a small random spin so piles are never perfectly tidy
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.03)
      this.items.push({ n: input.n, body, comX, comY })
      Composite.add(this.engine.world, body)
    }
  }

  setGravity(x: number, y: number): void {
    const changed = Math.abs(x - this.gx) + Math.abs(y - this.gy) > 1e-3
    this.gx = x
    this.gy = y
    this.engine.gravity.x = x
    this.engine.gravity.y = y
    this.engine.gravity.scale = GRAVITY
    if (changed) {
      this.calm = 0
      for (const it of this.items) this.M.Sleeping.set(it.body, false)
    }
  }

  /** one fixed physics step, with the air drag that grows as the pile ages */
  private tick(): void {
    this.age += STEP / 1000
    const air = Math.min(AIR_MAX, AIR_START + Math.max(0, this.age - AIR_RAMP_AFTER) * AIR_RAMP)
    if (Math.abs(air - this.air) > 0.002) {
      this.air = air
      for (const it of this.items) it.body.frictionAir = air
    }
    this.M.Engine.update(this.engine, STEP)
    for (const it of this.items) {
      const sp = it.body.speed
      if (sp > MAX_STEP_SPEED) this.M.Body.setVelocity(it.body, { x: (it.body.velocity.x / sp) * MAX_STEP_SPEED, y: (it.body.velocity.y / sp) * MAX_STEP_SPEED })
    }
    this.contain()
  }

  /**
   * The four walls hold a normal pile. A very crowded one (nine stickers cover about three quarters of the lid) can push a body
   * a little through a wall while the solver sorts out the overlaps, so after every step each body's hull is brought back inside
   * the play area, and the part of its velocity that pointed outwards is dropped.
   */
  private contain(): void {
    const { Body } = this.M
    const { x, y, w, h } = this.inner
    for (const it of this.items) {
      const b = it.body
      if (b.isSleeping) continue
      const dx = b.bounds.min.x < x ? x - b.bounds.min.x : b.bounds.max.x > x + w ? x + w - b.bounds.max.x : 0
      const dy = b.bounds.min.y < y ? y - b.bounds.min.y : b.bounds.max.y > y + h ? y + h - b.bounds.max.y : 0
      if (!dx && !dy) continue
      Body.translate(b, { x: dx, y: dy })
      const v = b.velocity
      const vx = dx && dx * v.x < 0 ? 0 : v.x
      const vy = dy && dy * v.y < 0 ? 0 : v.y
      if (vx !== v.x || vy !== v.y) Body.setVelocity(b, { x: vx, y: vy })
    }
  }

  /** advance by real time; returns true while anything still moves */
  step(dtMs: number): boolean {
    this.acc += Math.min(dtMs, 100)
    let guard = 0
    while (this.acc >= STEP && guard < 6) {
      this.acc -= STEP
      guard += 1
      this.tick()
    }
    return this.awake()
  }

  /** true while anything still moves; bodies that have been quiet for ~0.8 s (or the pile is old) are put to sleep */
  awake(): boolean {
    if (this.items.every((it) => it.body.isSleeping)) return false
    const quiet = this.items.every((it) => it.body.isSleeping || (it.body.speed < 0.14 && Math.abs(it.body.angularSpeed) < 0.004))
    this.calm = quiet ? this.calm + 1 : 0
    if (this.calm > 48 || this.age > GIVE_UP_AFTER) {
      for (const it of this.items) this.M.Sleeping.set(it.body, true)
      return false
    }
    return true
  }

  /** run to rest at once (reduced motion: no animation, the stickers just jump to where they would have settled) */
  settle(maxSteps = 480): void {
    for (let i = 0; i < maxSteps; i++) {
      this.tick()
      if (!this.awake()) break
    }
  }

  /** dev aid: speeds and sleep flags of every body */
  debug(): Array<{ n: number; speed: number; ang: number; sleeping: boolean; bounds: number[]; inner: number[] }> {
    const { x, y, w, h } = this.inner
    return this.items.map((it) => ({
      n: it.n,
      speed: +it.body.speed.toFixed(3),
      ang: +Math.abs(it.body.angularSpeed).toFixed(4),
      sleeping: it.body.isSleeping,
      bounds: [it.body.bounds.min.x, it.body.bounds.min.y, it.body.bounds.max.x, it.body.bounds.max.y].map((v) => Math.round(v)),
      inner: [x, y, x + w, y + h].map((v) => Math.round(v)),
    }))
  }

  poses(): PhysPose[] {
    return this.items.map((it) => {
      const a = it.body.angle
      const c = Math.cos(a)
      const s = Math.sin(a)
      return {
        n: it.n,
        x: it.body.position.x - (c * it.comX - s * it.comY),
        y: it.body.position.y - (s * it.comX + c * it.comY),
        rotDeg: (a * 180) / Math.PI,
      }
    })
  }

  destroy(): void {
    this.M.Composite.clear(this.engine.world, false)
    this.M.Engine.clear(this.engine)
    this.items = []
  }
}
