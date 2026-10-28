// The sticker board: every sticker's pose, the pointer / keyboard handling, the throw, the springs and Gravity mode.
// Pure TypeScript, no React: React renders the stickers once and hands their wrapper elements to the board, which writes
// transforms directly (nothing re-renders while a sticker moves). One requestAnimationFrame loop runs only while something
// moves (a held sticker, a glide, a tween, a settling spring, the tilting lid, falling stickers) and stops when all is quiet.
import { ARRANGE, CANVAS_H, CANVAS_RATIO, CANVAS_W, INITIAL_LID, SLOTS, SLOT_UNIT, stickerInfo, type LidPose } from './data'
import { CORNERS, DEG, clamp, extentsOf, foldFor, rotateAbout, wrap180 } from './math'
import { GravityWorld, loadMatter, type MatterLib, type PhysInput } from './physics'
import { SHAPES } from './shapes.generated'

export type Place = 'sheet' | 'lid'
type Mode = 'rest' | 'held' | 'glide' | 'tween' | 'phys'

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface Geo {
  stage: { w: number; h: number }
  /** the lid's layout box in stage px */
  lid: Rect
  /** the sheet's layout box in stage px */
  sheet: Rect
  /** the paper's rotation about its centre, degrees */
  sheetRot: number
  /** canvas width of a sticker at scale 1, px */
  unit: number
  /** margin between the lid's edge and the stickers' play area, px */
  inset: number
  /** the control row sits under the lid (wide screens) rather than above it (phones): a tag must not hang over it */
  controlsBelow: boolean
}

export type TagMode = 'full' | 'caption'

export interface UiState {
  /** the sticker whose caption tag is open (also: the one R, + and - act on) */
  selected: number | null
  /** 'full' = the tag with its buttons (pointer, touch), 'caption' = caption and key hints only (keyboard focus) */
  tagMode: TagMode
  /** the sticker picked up with the pointer or the keyboard */
  held: number | null
  /** index n - 1: is sticker n on the lid */
  onLid: readonly boolean[]
  gravity: boolean
  /** matter-js is loading */
  busy: boolean
  /** live-region text, `seq` changes with every message so a repeated one is read again */
  message: string
  seq: number
}

export interface BoardSnapshot {
  lid: { w: number; h: number }
  unit: number
  items: Array<{ n: number; u: number; v: number; rot: number; sc: number; z: number }>
}

interface Live {
  n: number
  el: HTMLElement | null
  face: HTMLElement | null
  flap: HTMLElement | null
  grad: SVGLinearGradientElement | null
  place: Place
  /** lid pose: centre as a share of the lid, rotation (degrees, lid frame) and scale multiplier */
  u: number
  v: number
  rot: number
  sc: number
  z: number
  /** render pose in the stage frame */
  x: number
  y: number
  r: number
  s: number
  lift: number
  liftV: number
  liftT: number
  curl: number
  curlV: number
  curlT: number
  corner: number
  /** swing of a held sticker */
  tilt: number
  tiltV: number
  /** the scale a held sticker springs to (a sticker peeled off the sheet grows to the lid's size), and its velocity */
  sT: number
  sV: number
  /** the little twist (degrees) a lifted sticker has, unwinding as it lands */
  twist: number
  /** a thrown sticker is in the air until it slows down, then it lands (the slap) and skids to a stop */
  air: boolean
  mode: Mode
  // glide
  vx: number
  vy: number
  w: number
  entered: boolean
  // tween
  tx: number
  ty: number
  tr: number
  ts: number
  tvx: number
  tvy: number
  tvr: number
  tvs: number
  stiff: number
  damp: number
  delay: number
  flight: boolean
  /** invisible until its turn in the entrance (the stickers on the lid slap down one after the other when the world opens) */
  hide: boolean
  /** the pose the world last wrote, to skip no-op writes */
  wrote: string
  /** initial lid scale is applied at the first measurement */
  pendingK: number | null
}

interface Sample {
  t: number
  x: number
  y: number
}

interface Drag {
  n: number
  id: number
  sx: number
  sy: number
  cx: number
  cy: number
  t0: number
  moved: boolean
  samples: Sample[]
  gx: number
  gy: number
  /** the sticker's scale when it was picked up: the grab point keeps its place on the paper while it grows */
  s0: number
  origin: Origin
  touch: boolean
}

interface Origin {
  place: Place
  u: number
  v: number
  rot: number
  sc: number
}

export interface BoardCallbacks {
  /** the caption tag's "Details" (or the D key) */
  onDetails?: (n: number) => void
}

const THROW_MIN = 240 // px/s: slower releases just drop
const GLIDE_K = 3.0 // 1/s: air drag of a thrown sticker
const GLIDE_C = 520 // px/s^2: dry friction once it is flat on the lid, so the skid ends with a firm stop and no long crawl
const LAND_SPEED = 300 // px/s: below this a thrown sticker comes down (the slap)
const SPIN_K = 3.0
const SPIN_C = 120 // deg/s^2
const RESTITUTION = 0.46
const MAX_SC = 1.9
const MIN_SC = 0.55
const TILT_GRAVITY = -3.6 // degrees: the lid tips like a slanted drawing desk
const KB_STEP = 12
const KB_STEP_BIG = 48
const FOLD_DEPTH = 0.22 // share of the canvas width bitten by a peeling corner
const REST_CURL = 0.6 // sticker 07 sits on the sheet with its top-left corner already lifting, like the baked sheet: an invitation

const now = (): number => (typeof performance !== 'undefined' ? performance.now() : Date.now())

const sameRect = (a: Rect, b: Rect): boolean => Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) < 0.5 && Math.abs(a.w - b.w) < 0.5 && Math.abs(a.h - b.h) < 0.5

const sameGeo = (a: Geo, b: Geo): boolean =>
  sameRect(a.lid, b.lid) &&
  sameRect(a.sheet, b.sheet) &&
  Math.abs(a.stage.w - b.stage.w) < 0.5 &&
  Math.abs(a.stage.h - b.stage.h) < 0.5 &&
  Math.abs(a.sheetRot - b.sheetRot) < 0.01 &&
  a.controlsBelow === b.controlsBelow

const inRect = (x: number, y: number, r: Rect, pad = 0): boolean => x >= r.x - pad && x <= r.x + r.w + pad && y >= r.y - pad && y <= r.y + r.h + pad

function stepSpring(x: number, v: number, target: number, k: number, c: number, dt: number): [number, number] {
  const n = Math.max(1, Math.ceil(dt / (1 / 150)))
  const h = dt / n
  for (let i = 0; i < n; i++) {
    v += (-k * (x - target) - c * v) * h
    x += v * h
  }
  return [x, v]
}

export class Board {
  private lives: Live[] = []
  private stage: HTMLElement | null = null
  private scroller: HTMLElement | null = null
  private lidEl: HTMLElement | null = null
  /** the nine die-cut ghosts on the sheet: each hides its label while its sticker is at home */
  private ghosts: Array<HTMLElement | null> = []
  private geo: Geo = {
    stage: { w: 800, h: 600 },
    lid: { x: 0, y: 0, w: 640, h: 400 },
    sheet: { x: 660, y: 0, w: 300, h: 400 },
    sheetRot: -1.3,
    unit: 93,
    inset: 10,
    controlsBelow: true,
  }
  private still = false
  private raf = 0
  private last = 0
  private zTop = 30
  private drag: Drag | null = null
  private kbOrigin: Origin | null = null
  private lastClick: { n: number; t: number; x: number; y: number } | null = null
  private tilt = 0
  private tiltV = 0
  private tiltT = 0
  private gravity = false
  private world: GravityWorld | null = null
  private matter: MatterLib | null = null
  private mounted = false
  private measured = false
  /** when the entrance started (ms): a slow machine never keeps a sticker hidden for more than a moment */
  private entranceAt = 0
  private ui: UiState
  private listeners = new Set<() => void>()
  private cb: BoardCallbacks = {}

  constructor() {
    this.lives = SLOTS.map((s) => ({
      n: s.n,
      el: null,
      face: null,
      flap: null,
      grad: null,
      place: 'sheet' as Place,
      u: 0.5,
      v: 0.5,
      rot: 0,
      sc: 1,
      z: s.n,
      x: 0,
      y: 0,
      r: 0,
      s: s.mult,
      lift: 0,
      liftV: 0,
      liftT: 0,
      curl: 0,
      curlV: 0,
      curlT: 0,
      corner: 2,
      tilt: 0,
      tiltV: 0,
      sT: s.mult,
      sV: 0,
      twist: 2,
      air: false,
      mode: 'rest' as Mode,
      vx: 0,
      vy: 0,
      w: 0,
      entered: false,
      tx: 0,
      ty: 0,
      tr: 0,
      ts: 1,
      tvx: 0,
      tvy: 0,
      tvr: 0,
      tvs: 0,
      stiff: 200,
      damp: 22,
      delay: 0,
      flight: false,
      hide: false,
      wrote: '',
      pendingK: null,
    }))
    let z = 20
    for (const p of INITIAL_LID) {
      const L = this.lives[p.n - 1]
      L.place = 'lid'
      L.u = p.u
      L.v = p.v
      L.rot = p.rot
      L.pendingK = p.k
      L.z = z++
    }
    this.zTop = z + 10
    const seven = this.lives[6]
    seven.corner = 0
    seven.curlT = REST_CURL
    seven.curl = REST_CURL * CANVAS_W * FOLD_DEPTH
    this.ui = { selected: null, tagMode: 'full', held: null, onLid: this.lives.map((l) => l.place === 'lid'), gravity: false, busy: false, message: '', seq: 0 }
  }

  // ------------------------------------------------------------------------------------------------- React bridge
  subscribe = (fn: () => void): (() => void) => {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  getUi = (): UiState => this.ui

  setCallbacks(cb: BoardCallbacks): void {
    this.cb = cb
  }

  private setUi(patch: Partial<UiState>): void {
    const next = { ...this.ui, ...patch }
    let changed = false
    for (const k of Object.keys(next) as Array<keyof UiState>) if (next[k] !== this.ui[k]) changed = true
    if (!changed) return
    this.ui = next
    this.listeners.forEach((fn) => fn())
  }

  private say(message: string): void {
    this.setUi({ message, seq: this.ui.seq + 1 })
  }

  private syncOnLid(): void {
    const onLid = this.lives.map((l) => l.place === 'lid')
    const prev = this.ui.onLid
    if (onLid.some((v, i) => v !== prev[i])) this.setUi({ onLid })
  }

  setStill(still: boolean): void {
    this.still = still
    if (still) {
      // finish everything at once
      for (const L of this.lives) if (L.mode === 'glide' || L.mode === 'tween') this.finishNow(L)
      this.tilt = 0
      this.tiltV = 0
      this.tiltT = 0
      this.applyTilt()
      this.renderAll()
    }
  }

  mount(stage: HTMLElement, scroller: HTMLElement | null, lid: HTMLElement | null): void {
    this.stage = stage
    this.scroller = scroller
    this.lidEl = lid
    this.ghosts = SLOTS.map((s) => stage.querySelector<HTMLElement>(`[data-ghost="${s.n}"]`))
    this.mounted = true
    stage.addEventListener('wheel', this.onWheel, { passive: false })
    this.measure()
    // a re-mount (React StrictMode runs every effect twice in development) must pick up whatever was moving: the loop stops by
    // itself after one step when nothing is
    this.wake()
  }

  unmount(): void {
    this.mounted = false
    if (this.raf) cancelAnimationFrame(this.raf)
    this.raf = 0
    this.detachWindow()
    this.stage?.removeEventListener('wheel', this.onWheel)
    this.world?.destroy()
    this.world = null
    this.stage = null
    this.scroller = null
    this.lidEl = null
    this.ghosts = []
    this.drag = null
  }

  attach(n: number, el: HTMLElement | null): void {
    const L = this.lives[n - 1]
    L.el = el
    L.face = el?.querySelector<HTMLElement>('[data-part="face"]') ?? null
    L.flap = el?.querySelector<HTMLElement>('[data-part="flap"]') ?? null
    L.grad = el?.querySelector<SVGLinearGradientElement>('linearGradient') ?? null
    L.wrote = ''
    if (el && this.measured) this.renderOne(L)
  }

  // ------------------------------------------------------------------------------------------------- geometry
  /** read the layout (stage, lid frame, sheet frame) and place everything. Call on mount and whenever the stage resizes. */
  measure(): void {
    const stage = this.stage
    if (!stage) return
    const off = (el: HTMLElement | null): Rect => {
      if (!el) return { x: 0, y: 0, w: 0, h: 0 }
      let x = 0
      let y = 0
      let cur: HTMLElement | null = el
      while (cur && cur !== stage) {
        x += cur.offsetLeft
        y += cur.offsetTop
        cur = cur.offsetParent as HTMLElement | null
      }
      return { x, y, w: el.offsetWidth, h: el.offsetHeight }
    }
    const lid = off(stage.querySelector<HTMLElement>('[data-frame="lid"]'))
    const sheet = off(stage.querySelector<HTMLElement>('[data-frame="sheet"]'))
    if (!lid.w || !sheet.w) return
    const rot = parseFloat(getComputedStyle(stage).getPropertyValue('--sheet-rot')) || 0
    const controls = off(stage.querySelector<HTMLElement>('.w-illustration-controls'))
    const prev = this.geo
    this.geo = {
      controlsBelow: controls.w > 0 && controls.y > lid.y,
      stage: { w: stage.offsetWidth, h: stage.offsetHeight },
      lid,
      sheet,
      sheetRot: rot,
      unit: sheet.w * SLOT_UNIT,
      inset: Math.max(10, Math.round(lid.w * 0.0145)),
    }
    // nothing moved (a pointer down re-reads the layout as a safety net): leave the poses and the physics alone
    if (this.measured && sameGeo(prev, this.geo)) return
    stage.style.setProperty('--u', `${this.geo.unit.toFixed(2)}px`)
    let first = false
    if (!this.measured) {
      this.measured = true
      first = true
      stage.dataset.ready = 'true' // the stickers are hidden by CSS until they have a place
      for (const L of this.lives) {
        if (L.pendingK !== null) {
          L.sc = L.pendingK * this.lidScale()
          L.pendingK = null
        }
      }
    }
    // keep every lid sticker inside the (possibly smaller) lid
    for (const L of this.lives) if (L.place === 'lid') this.clampToLid(L)
    if (this.world) this.rebuildWorld()
    // the entrance is set up before the first paint of the stickers, so they never flash at their resting place
    if (first) this.playEntrance()
    this.renderAll()
  }

  /** when the world opens, the stickers already on the lid slap down one after the other (not under reduced or paused motion) */
  private playEntrance(): void {
    if (this.still) return
    this.entranceAt = now()
    let i = 0
    for (const L of this.lives) {
      if (L.place !== 'lid' || L.mode !== 'rest') continue
      const t = this.restPose(L)
      const side = i % 2 ? 1 : -1
      L.x = t.x + side * 12
      L.y = t.y - 84
      L.r = t.r + side * 8
      L.s = t.s * 1.3
      L.lift = 1
      L.liftT = 1
      L.hide = true
      this.tweenToRest(L, { slap: true, stiff: 230, damp: 17, delay: 0.1 + i * 0.09 })
      i++
    }
  }

  private inner(): Rect {
    const { lid, inset } = this.geo
    return { x: lid.x + inset, y: lid.y + inset, w: lid.w - 2 * inset, h: lid.h - 2 * inset }
  }

  /** the scale stickers get when they are stuck by the board itself (arrange, peel all): sized to the lid, not the sheet */
  private lidScale(): number {
    return clamp((this.geo.lid.w * 0.235) / this.geo.unit, 0.8, 1.35)
  }

  /** px per canvas px for a sticker at scale s */
  private kOf(s: number): number {
    return (this.geo.unit * s) / CANVAS_W
  }

  private slotPose(n: number): { x: number; y: number; r: number; s: number } {
    const slot = SLOTS[n - 1]
    const { sheet, sheetRot } = this.geo
    const p = rotateAbout(sheet.x + slot.cx * sheet.w, sheet.y + slot.cy * sheet.h, sheet.x + sheet.w / 2, sheet.y + sheet.h / 2, sheetRot)
    return { x: p.x, y: p.y, r: slot.angle + sheetRot, s: slot.mult }
  }

  private lidPose(L: Live): { x: number; y: number; r: number; s: number } {
    const { lid } = this.geo
    const lx = lid.x + L.u * lid.w
    const ly = lid.y + L.v * lid.h
    const p = this.tilt ? rotateAbout(lx, ly, lid.x + lid.w / 2, lid.y + lid.h / 2, this.tilt) : { x: lx, y: ly }
    return { x: p.x, y: p.y, r: L.rot + this.tilt, s: L.sc }
  }

  private restPose(L: Live): { x: number; y: number; r: number; s: number } {
    return L.place === 'lid' ? this.lidPose(L) : this.slotPose(L.n)
  }

  /** the lid frame is where lid stickers live: the centre limits for the current rotation and scale */
  private clampToLid(L: Live): void {
    const inner = this.inner()
    const e = extentsOf(L.n, L.rot, this.kOf(L.sc))
    const lo = { x: inner.x - e.minX, y: inner.y - e.minY }
    const hi = { x: inner.x + inner.w - e.maxX, y: inner.y + inner.h - e.maxY }
    const lx = L.u * this.geo.lid.w + this.geo.lid.x
    const ly = L.v * this.geo.lid.h + this.geo.lid.y
    const cx = lo.x > hi.x ? (lo.x + hi.x) / 2 : clamp(lx, lo.x, hi.x)
    const cy = lo.y > hi.y ? (lo.y + hi.y) / 2 : clamp(ly, lo.y, hi.y)
    L.u = (cx - this.geo.lid.x) / this.geo.lid.w
    L.v = (cy - this.geo.lid.y) / this.geo.lid.h
  }

  // ------------------------------------------------------------------------------------------------- rendering
  private applyTilt(): void {
    if (this.lidEl) this.lidEl.style.transform = this.tilt ? `rotate(${this.tilt.toFixed(3)}deg)` : ''
  }

  renderAll(): void {
    if (!this.measured) return
    for (const L of this.lives) this.renderOne(L)
  }

  private renderOne(L: Live): void {
    const el = L.el
    if (!el) return
    const restLike = L.mode === 'rest' || L.mode === 'phys'
    if (restLike) {
      const p = this.restPose(L)
      L.x = p.x
      L.y = p.y
      L.r = p.r
      L.s = p.s
    }
    // the ghost keeps its label while its sticker is away (on the lid, in the air, flying back) and loses it once the sticker is home
    const ghost = this.ghosts[L.n - 1]
    if (ghost) {
      const home = L.place === 'sheet' && L.mode === 'rest' ? 'true' : 'false'
      if (ghost.dataset.home !== home) ghost.dataset.home = home
    }
    const W = this.geo.unit
    const H = W * CANVAS_RATIO
    const lifted = L.mode === 'held' || L.mode === 'glide' || (L.mode === 'tween' && L.flight)
    const sc = L.s * (1 + 0.065 * L.lift)
    const rot = L.r + (L.mode === 'held' ? L.tilt : 0) + L.twist * L.lift
    const tf = `translate3d(${(L.x - W / 2).toFixed(2)}px,${(L.y - H / 2).toFixed(2)}px,0) rotate(${rot.toFixed(3)}deg) scale(${sc.toFixed(4)})`
    const key = `${tf}|${L.lift.toFixed(3)}|${L.curl.toFixed(1)}|${L.z}|${lifted ? 1 : 0}|${L.hide ? 1 : 0}|${this.ui.selected === L.n ? this.ui.tagMode : 0}`
    if (key === L.wrote) return
    L.wrote = key
    el.style.opacity = L.hide ? '0' : ''
    el.style.transform = tf
    el.style.zIndex = String(lifted ? L.z + 1000 : L.z)
    el.style.setProperty('--lift', L.lift.toFixed(3))
    el.dataset.mode = L.mode
    el.dataset.place = L.place
    this.renderFold(L)
    if (this.ui.selected === L.n) {
      // the caption tag and the tape buttons stay upright and unscaled: hand them the sticker's rotation, scale and half extents
      const e = extentsOf(L.n, rot, this.kOf(sc))
      el.style.setProperty('--r', rot.toFixed(2))
      el.style.setProperty('--s', sc.toFixed(4))
      el.style.setProperty('--ex', `${Math.max(Math.abs(e.minX), Math.abs(e.maxX)).toFixed(1)}px`)
      el.style.setProperty('--ey-top', `${(-e.minY).toFixed(1)}px`)
      el.style.setProperty('--ey-bot', `${e.maxY.toFixed(1)}px`)
      const tagW = Math.min(this.ui.tagMode === 'caption' ? 310 : 344, this.geo.stage.w - 24)
      el.style.setProperty('--tag-dx', `${(clamp(L.x, tagW / 2 + 10, this.geo.stage.w - tagW / 2 - 10) - L.x).toFixed(1)}px`)
      // below the sticker, unless that would hang over the controls (lid) or run off the visible area (sheet): then above it
      const sr = this.scroller?.getBoundingClientRect()
      const st = this.stage?.getBoundingClientRect()
      const tagH = this.ui.tagMode === 'caption' ? 124 : 176
      const lid = this.geo.lid
      const visibleBottom = sr && st ? sr.bottom - st.top : this.geo.stage.h
      const visibleTop = sr && st ? sr.top - st.top : 0
      const bottomLimit = L.place === 'lid' && this.geo.controlsBelow ? Math.min(lid.y + lid.h + 8, visibleBottom) : visibleBottom
      const topLimit = L.place === 'lid' ? Math.max(lid.y - 100, visibleTop) : visibleTop
      const roomBelow = bottomLimit - (L.y + e.maxY + 20)
      const roomAbove = L.y + e.minY - 20 - topLimit
      el.dataset.tag = roomBelow >= tagH ? 'below' : roomAbove >= tagH ? 'above' : roomBelow >= roomAbove ? 'below' : 'above'
    }
  }

  private renderFold(L: Live): void {
    const { face, flap, grad } = L
    if (!face || !flap) return
    if (L.curl > 1.5) {
      const f = foldFor(L.n, L.corner, L.curl)
      face.style.clipPath = f.face
      flap.style.display = 'block'
      flap.style.clipPath = f.flapClip
      const k = this.geo.unit / CANVAS_W
      flap.style.transform = `matrix(${f.a},${f.b},${f.c},${f.d},${(f.e * k).toFixed(2)},${(f.f * k).toFixed(2)})`
      if (grad) {
        const [sx, sy] = CORNERS[L.corner]
        // from a point on the fold line to the corner side: dark at the fold, white at the tip
        const m = f.e * sx
        const px = (sx * m) / 2
        const py = (sy * m) / 2
        grad.setAttribute('x1', px.toFixed(1))
        grad.setAttribute('y1', py.toFixed(1))
        grad.setAttribute('x2', (px + (sx * L.curl) / 2).toFixed(1))
        grad.setAttribute('y2', (py + (sy * L.curl) / 2).toFixed(1))
      }
    } else if (face.style.clipPath) {
      face.style.clipPath = ''
      flap.style.display = 'none'
    }
  }

  // ------------------------------------------------------------------------------------------------- the loop
  private wake(): void {
    if (this.raf || !this.mounted) return
    this.last = now()
    this.raf = requestAnimationFrame(this.loop)
  }

  private loop = (ts: number): void => {
    this.raf = 0
    if (!this.mounted) return
    // a frame longer than 100 ms (a hidden tab, a busy machine) is shortened: nothing jumps, and a slow device is not slowed down much
    const dt = clamp((ts - this.last) / 1000, 0, 1 / 10)
    this.last = ts
    if (this.step(dt)) this.raf = requestAnimationFrame(this.loop)
  }

  /** advance everything by dt seconds; true while another frame is needed */
  private step(dt: number): boolean {
    let busy = false
    // the lid's tilt
    if (Math.abs(this.tilt - this.tiltT) > 0.003 || Math.abs(this.tiltV) > 0.02) {
      ;[this.tilt, this.tiltV] = stepSpring(this.tilt, this.tiltV, this.tiltT, 70, 13, dt)
      this.applyTilt()
      busy = true
    } else if (this.tilt !== this.tiltT) {
      this.tilt = this.tiltT
      this.tiltV = 0
      this.applyTilt()
    }
    // falling stickers
    if (this.world) {
      if (!this.still) this.world.setGravity(Math.sin(this.tilt * DEG), Math.cos(this.tilt * DEG))
      const awake = this.world.step(dt * 1000)
      this.pullWorld()
      if (awake || busy) busy = true
    }
    for (const L of this.lives) {
      if (this.stepOne(L, dt)) busy = true
    }
    if (this.entranceAt && now() - this.entranceAt > 1500) {
      this.entranceAt = 0
      for (const L of this.lives) L.hide = false
    }
    this.renderAll()
    return busy
  }

  private stepOne(L: Live, dt: number): boolean {
    let busy = false
    switch (L.mode) {
      case 'held':
        this.stepHeld(L, dt)
        busy = true
        break
      case 'glide':
        this.stepGlide(L, dt)
        busy = true
        break
      case 'tween':
        this.stepTween(L, dt)
        busy = true
        break
      default:
        break
    }
    // lift and curl springs
    if (Math.abs(L.lift - L.liftT) > 0.002 || Math.abs(L.liftV) > 0.01) {
      ;[L.lift, L.liftV] = stepSpring(L.lift, L.liftV, L.liftT, 460, 25, dt)
      busy = true
    } else {
      L.lift = L.liftT
      L.liftV = 0
    }
    if (L.n === 7 && L.place === 'sheet' && L.mode === 'rest' && L.curlT === 0 && L.curl < 2) this.applyRestCurl(L, false)
    const curlTarget = L.curlT * CANVAS_W * FOLD_DEPTH
    if (Math.abs(L.curl - curlTarget) > 0.4 || Math.abs(L.curlV) > 2) {
      ;[L.curl, L.curlV] = stepSpring(L.curl, L.curlV, curlTarget, 320, 27, dt)
      if (L.curl < 0) L.curl = 0
      busy = true
    } else {
      L.curl = curlTarget
      L.curlV = 0
    }
    return busy
  }

  // ------------------------------------------------------------------------------------------------- held
  private toStage(cx: number, cy: number): { x: number; y: number } {
    const r = this.stage?.getBoundingClientRect()
    return r ? { x: cx - r.left, y: cy - r.top } : { x: cx, y: cy }
  }

  private stepHeld(L: Live, dt: number): void {
    const d = this.drag
    ;[L.s, L.sV] = stepSpring(L.s, L.sV, L.sT, 240, 22, dt)
    if (d && d.n === L.n && d.moved) {
      this.autoScroll(d, dt)
      const p = this.toStage(d.cx, d.cy)
      const grow = d.s0 ? L.s / d.s0 : 1
      L.x = clamp(p.x + d.gx * grow, 0, this.geo.stage.w)
      L.y = clamp(p.y + d.gy * grow, 0, this.geo.stage.h)
      // swing: dragging sideways makes the paper lag, like a sheet held by one corner
      const v = this.velocity(d)
      const target = clamp(v.x * 0.0065, -9, 9)
      ;[L.tilt, L.tiltV] = stepSpring(L.tilt, L.tiltV, target, 150, 13, dt)
    } else {
      ;[L.tilt, L.tiltV] = stepSpring(L.tilt, L.tiltV, 0, 150, 13, dt)
    }
  }

  private autoScroll(d: Drag, dt: number): void {
    const sc = this.scroller
    if (!sc) return
    const rect = sc.getBoundingClientRect()
    const edge = 76
    let k = 0
    if (d.cy < rect.top + edge) k = -(1 - clamp((d.cy - rect.top) / edge, 0, 1))
    else if (d.cy > rect.bottom - edge) k = 1 - clamp((rect.bottom - d.cy) / edge, 0, 1)
    if (k) sc.scrollTop += k * 900 * dt
  }

  private velocity(d: Drag): { x: number; y: number } {
    const s = d.samples
    if (s.length < 2) return { x: 0, y: 0 }
    const last = s[s.length - 1]
    // the oldest sample within the last 80 ms
    let first = s[s.length - 2]
    for (let i = s.length - 2; i >= 0; i--) {
      if (last.t - s[i].t <= 80) first = s[i]
      else break
    }
    const dt = (last.t - first.t) / 1000
    if (dt < 0.008) return { x: 0, y: 0 }
    // a pointer that stopped before the release does not throw
    if (now() - last.t > 90) return { x: 0, y: 0 }
    return { x: (last.x - first.x) / dt, y: (last.y - first.y) / dt }
  }

  // ------------------------------------------------------------------------------------------------- pointer
  pointerDown(n: number, e: PointerEvent): void {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if (this.drag) return
    this.measure() // the layout may have moved (a font swap, a banner): pick up from where things really are
    const L = this.lives[n - 1]
    if (L.mode !== 'rest' && L.mode !== 'phys') this.finishNow(L)
    // bring to front on pointer down (the stickers on the lid are a stack: the last one touched is on top)
    if (L.z < this.zTop) {
      L.z = ++this.zTop
      this.renderOne(L)
    }
    const t = now()
    this.drag = {
      n,
      id: e.pointerId,
      sx: e.clientX,
      sy: e.clientY,
      cx: e.clientX,
      cy: e.clientY,
      t0: t,
      moved: false,
      samples: [{ t, x: e.clientX, y: e.clientY }],
      gx: 0,
      gy: 0,
      s0: L.s,
      origin: this.originOf(L),
      touch: e.pointerType === 'touch',
    }
    try {
      this.stage?.setPointerCapture(e.pointerId)
    } catch {
      /* the window listeners below keep working */
    }
    window.addEventListener('pointermove', this.onMove)
    window.addEventListener('pointerup', this.onUp)
    window.addEventListener('pointercancel', this.onUp)
  }

  private detachWindow(): void {
    window.removeEventListener('pointermove', this.onMove)
    window.removeEventListener('pointerup', this.onUp)
    window.removeEventListener('pointercancel', this.onUp)
  }

  private onMove = (e: PointerEvent): void => {
    const d = this.drag
    if (!d || e.pointerId !== d.id) return
    d.cx = e.clientX
    d.cy = e.clientY
    d.samples.push({ t: now(), x: e.clientX, y: e.clientY })
    if (d.samples.length > 12) d.samples.shift()
    if (!d.moved) {
      if (Math.hypot(d.cx - d.sx, d.cy - d.sy) < (d.touch ? 9 : 5)) return
      if (this.gravity || this.ui.busy) return
      this.beginDrag(d)
    }
    this.wake()
  }

  private onUp = (e: PointerEvent): void => {
    const d = this.drag
    if (!d || e.pointerId !== d.id) return
    this.drag = null
    this.detachWindow()
    try {
      this.stage?.releasePointerCapture(e.pointerId)
    } catch {
      /* already released */
    }
    const L = this.lives[d.n - 1]
    if (!d.moved) {
      this.clicked(d.n, e)
      return
    }
    this.release(L, d, e.type === 'pointercancel')
  }

  private beginDrag(d: Drag): void {
    const L = this.lives[d.n - 1]
    d.moved = true
    L.mode = 'held'
    L.tilt = 0
    L.tiltV = 0
    L.z = ++this.zTop
    L.liftT = 1
    L.twist = (Math.random() < 0.5 ? -1 : 1) * (1.6 + Math.random() * 1.6)
    // peeled off the sheet, a sticker grows to the size it will have on the lid (it comes towards you)
    L.sT = L.place === 'sheet' && !this.still ? this.lidScale() : L.s
    L.sV = 0
    d.s0 = L.s
    const p = this.toStage(d.cx, d.cy)
    d.gx = L.x - p.x
    d.gy = L.y - p.y
    // the corner under the pointer is the one that peels up
    const rel = rotateAbout(p.x, p.y, L.x, L.y, -L.r)
    const lx = (rel.x - L.x) / this.kOf(L.s)
    const ly = (rel.y - L.y) / this.kOf(L.s)
    L.corner = lx < 0 ? (ly < 0 ? 0 : 3) : ly < 0 ? 1 : 2
    L.curlT = this.still ? 0 : 1
    this.setUi({ selected: null, held: L.n })
    this.say(`Picked up ${stickerInfo(L.n).caption}.`)
  }

  private clicked(n: number, e: PointerEvent): void {
    const t = now()
    const lc = this.lastClick
    this.lastClick = { n, t, x: e.clientX, y: e.clientY }
    const L = this.lives[n - 1]
    if (lc && lc.n === n && t - lc.t < 340 && Math.hypot(lc.x - e.clientX, lc.y - e.clientY) < 22) {
      this.lastClick = null
      if (this.gravity) return
      if (L.place === 'sheet') this.toLid(n)
      else this.rotateBy(n, e.shiftKey ? -20 : 20)
      this.select(n)
      return
    }
    this.select(n)
  }

  /**
   * Open the caption tag of a sticker (and bring it to the front). A pointer selection ('full') hangs the tag with its tape
   * buttons and controls; keyboard focus ('caption') only shows the caption and the key hints, so Tab goes from sticker to
   * sticker without nine extra stops in between (every control of the full tag has a key: R, + and -, D, B and L).
   */
  select(n: number | null, mode: TagMode = 'full'): void {
    if (n !== null && this.lives[n - 1].mode === 'rest') {
      // the selected sticker comes to the front, so its tag is never hidden behind a neighbour (on the lid or on the sheet)
      const L = this.lives[n - 1]
      if (L.z < this.zTop) L.z = ++this.zTop
    }
    // a caption never replaces a full tag the visitor has opened on the same sticker
    const keep = n !== null && mode === 'caption' && this.ui.selected === n && this.ui.tagMode === 'full'
    this.setUi({ selected: n, tagMode: keep ? 'full' : mode })
    this.renderAll()
  }

  private originOf(L: Live): Origin {
    return { place: L.place, u: L.u, v: L.v, rot: L.rot, sc: L.sc }
  }

  /** the pointer was released: throw it, drop it, or snap it home */
  private release(L: Live, d: Drag, cancelled: boolean): void {
    this.setUi({ held: null })
    if (cancelled) {
      this.goBack(L, d.origin)
      return
    }
    const v = this.velocity(d)
    const speed = Math.hypot(v.x, v.y)
    L.curlT = 0
    // what the eye sees right now (base rotation + swing): the springs start from here; the twist unwinds with the lift
    const base = L.r
    L.r = base + L.tilt
    L.tilt = 0
    if (!this.still && speed > THROW_MIN) {
      const sp = Math.min(speed, 3400)
      L.mode = 'glide'
      L.vx = sp * (v.x / speed)
      L.vy = sp * (v.y / speed)
      L.w = clamp(v.x * 0.03, -170, 170)
      L.air = sp > LAND_SPEED
      L.entered = this.fitsInside(L)
      this.wake()
      return
    }
    this.settle(L, base)
  }

  private fitsInside(L: Live): boolean {
    const inner = this.inner()
    const e = extentsOf(L.n, L.r, this.kOf(L.s))
    return L.x + e.minX >= inner.x - 1 && L.x + e.maxX <= inner.x + inner.w + 1 && L.y + e.minY >= inner.y - 1 && L.y + e.maxY <= inner.y + inner.h + 1
  }

  /** where does a sticker released at (L.x, L.y) belong: the lid, the sheet, or back where it came from */
  private settle(L: Live, rot: number): void {
    const cameFrom = L.place
    let place: Place
    if (inRect(L.x, L.y, this.geo.lid)) place = 'lid'
    else if (inRect(L.x, L.y, this.geo.sheet, 6)) place = 'sheet'
    else place = cameFrom
    if (place === 'sheet') {
      this.dropOnSheet(L)
      return
    }
    // stick it on the lid, nudged inside the play area
    const jitter = this.still ? 0 : (Math.random() - 0.5) * 3
    L.place = 'lid'
    L.rot = wrap180(rot - this.tilt) + jitter
    // a sticker peeled off the sheet is as big as the lid's stickers once it is stuck (the lid is the bigger world)
    L.sc = cameFrom === 'sheet' ? this.lidScale() * (0.97 + Math.random() * 0.06) : L.s
    L.u = (L.x - this.geo.lid.x) / this.geo.lid.w
    L.v = (L.y - this.geo.lid.y) / this.geo.lid.h
    this.clampToLid(L)
    this.syncOnLid()
    this.tweenToRest(L, { slap: true })
    if (cameFrom !== 'lid') this.say(`Stuck ${stickerInfo(L.n).caption} on the lid.`)
    else this.say(`Stuck ${stickerInfo(L.n).caption} down.`)
  }

  private dropOnSheet(L: Live): void {
    L.place = 'sheet'
    L.rot = 0
    L.sc = 1
    this.syncOnLid()
    this.tweenToRest(L, { slap: true, stiff: 260, damp: 21 })
    this.say(`${stickerInfo(L.n).caption} is back on the sheet.`)
  }

  private goBack(L: Live, o: Origin): void {
    L.place = o.place
    L.u = o.u
    L.v = o.v
    L.rot = o.rot
    L.sc = o.sc
    L.curlT = 0
    this.syncOnLid()
    this.tweenToRest(L, { slap: true })
    this.say(`Put ${stickerInfo(L.n).caption} back.`)
  }

  // ------------------------------------------------------------------------------------------------- glide
  private stepGlide(L: Live, dt: number): void {
    // air drag, plus dry friction once the sticker is flat on the lid: the skid ends with a firm stop, not a long crawl
    const sp0 = Math.hypot(L.vx, L.vy)
    if (sp0 > 0) {
      const sp = Math.max(0, sp0 * Math.exp(-GLIDE_K * dt) - GLIDE_C * dt * (L.air ? 0.3 : 1))
      const f = sp / sp0
      L.vx *= f
      L.vy *= f
    }
    L.w = (L.w - Math.sign(L.w) * Math.min(Math.abs(L.w), SPIN_C * dt)) * Math.exp(-SPIN_K * dt)
    ;[L.s, L.sV] = stepSpring(L.s, L.sV, L.sT, 240, 22, dt)
    L.x += L.vx * dt
    L.y += L.vy * dt
    L.r += L.w * dt
    const st = this.geo.stage
    L.x = clamp(L.x, 0, st.w)
    L.y = clamp(L.y, 0, st.h)
    if (!L.entered && this.fitsInside(L)) L.entered = true
    if (L.entered) this.wallBounce(L)
    const speed = Math.hypot(L.vx, L.vy)
    // in the air the paper is lifted; below LAND_SPEED it comes down at once (the lift spring overshoots: that is the slap)
    if (L.air && speed < LAND_SPEED) L.air = false
    L.liftT = L.air ? clamp(0.62 + speed / 6000, 0.62, 1) : 0
    if (!L.air && speed < 14 && Math.abs(L.w) < 6) {
      L.vx = L.vy = L.w = 0
      this.settle(L, L.r)
    }
  }

  private wallBounce(L: Live): void {
    const inner = this.inner()
    const e = extentsOf(L.n, L.r, this.kOf(L.s))
    if (L.x + e.minX < inner.x) {
      L.x = inner.x - e.minX
      L.vx = Math.abs(L.vx) * RESTITUTION
      L.w *= 0.7
    } else if (L.x + e.maxX > inner.x + inner.w) {
      L.x = inner.x + inner.w - e.maxX
      L.vx = -Math.abs(L.vx) * RESTITUTION
      L.w *= 0.7
    }
    if (L.y + e.minY < inner.y) {
      L.y = inner.y - e.minY
      L.vy = Math.abs(L.vy) * RESTITUTION
      L.w *= 0.7
    } else if (L.y + e.maxY > inner.y + inner.h) {
      L.y = inner.y + inner.h - e.maxY
      L.vy = -Math.abs(L.vy) * RESTITUTION
      L.w *= 0.7
    }
  }

  // ------------------------------------------------------------------------------------------------- tweens
  /** spring the sticker from its current render pose to the pose stored in its logical state */
  private tweenToRest(L: Live, o: { slap?: boolean; stiff?: number; damp?: number; delay?: number; flight?: boolean } = {}): void {
    const target = this.restPose(L)
    L.stiff = o.stiff ?? 230
    L.damp = o.damp ?? 22
    L.delay = o.delay ?? 0
    L.flight = !!o.flight
    L.tx = target.x
    L.ty = target.y
    L.tr = L.r + wrap180(target.r - L.r)
    L.ts = target.s
    L.tvx = L.tvy = L.tvr = L.tvs = 0
    L.curlT = 0
    if (this.still) {
      this.finishNow(L)
      return
    }
    L.mode = 'tween'
    L.liftT = o.flight && !L.delay ? 0.85 : o.slap ? L.liftT : 0
    this.wake()
  }

  private stepTween(L: Live, dt: number): void {
    if (L.delay > 0) {
      L.delay -= dt
      if (L.delay <= 0) {
        L.hide = false
        if (L.flight) L.liftT = 0.85
      }
      return
    }
    // the target follows the layout: a window resized mid-flight still lands in the right place
    const t = this.restPose(L)
    L.tx = t.x
    L.ty = t.y
    L.ts = t.s
    L.tr = L.r + wrap180(t.r - L.r)
    ;[L.x, L.tvx] = stepSpring(L.x, L.tvx, L.tx, L.stiff, L.damp, dt)
    ;[L.y, L.tvy] = stepSpring(L.y, L.tvy, L.ty, L.stiff, L.damp, dt)
    ;[L.r, L.tvr] = stepSpring(L.r, L.tvr, L.tr, L.stiff, L.damp, dt)
    ;[L.s, L.tvs] = stepSpring(L.s, L.tvs, L.ts, L.stiff * 1.2, L.damp * 1.1, dt)
    const dist = Math.hypot(L.tx - L.x, L.ty - L.y)
    if (L.flight) L.liftT = dist > 18 ? 0.85 : 0
    else L.liftT = 0
    const settled = dist < 0.35 && Math.abs(L.tr - L.r) < 0.25 && Math.abs(L.ts - L.s) < 0.003 && Math.hypot(L.tvx, L.tvy) < 6 && Math.abs(L.tvr) < 6
    if (settled) {
      L.x = L.tx
      L.y = L.ty
      L.r = L.tr
      L.s = L.ts
      L.mode = 'rest'
      L.flight = false
      L.liftT = 0
    }
  }

  /** end any motion where it is going (or, for a glide, where it is) */
  private finishNow(L: Live): void {
    const wasGlide = L.mode === 'glide'
    L.mode = 'rest'
    if (wasGlide) {
      L.vx = L.vy = L.w = 0
      this.settle(L, L.r)
      L.mode = 'rest'
    }
    L.flight = false
    L.air = false
    L.hide = false
    L.liftT = 0
    L.lift = 0
    L.liftV = 0
    L.curlT = 0
    L.curl = 0
    L.curlV = 0
    L.delay = 0
    this.applyRestCurl(L, true)
    this.renderOne(L)
  }

  /** sticker 07 on the sheet keeps its top-left corner lifted (a static invitation); every other sticker lies flat */
  private applyRestCurl(L: Live, instant: boolean): void {
    if (L.n !== 7 || L.place !== 'sheet' || L.mode !== 'rest') return
    L.corner = 0
    L.curlT = REST_CURL
    if (instant) {
      L.curl = REST_CURL * CANVAS_W * FOLD_DEPTH
      L.curlV = 0
    }
  }

  // ------------------------------------------------------------------------------------------------- keyboard
  keyDown(n: number, e: KeyboardEvent): void {
    const L = this.lives[n - 1]
    const held = this.ui.held === n
    const stop = () => {
      e.preventDefault()
      e.stopPropagation()
    }
    switch (e.key) {
      case ' ':
      case 'Enter':
        if (e.repeat) return stop()
        stop()
        if (held) this.dropHeld(L)
        else this.pickUp(L)
        return
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowUp':
      case 'ArrowDown':
        if (!held) return
        stop()
        this.nudge(L, e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0, e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0, e.shiftKey ? KB_STEP_BIG : KB_STEP)
        return
      case 'r':
      case 'R':
        stop()
        this.rotateBy(n, e.shiftKey ? -15 : 15)
        return
      case '+':
      case '=':
        stop()
        this.scaleBy(n, 1.1)
        return
      case '-':
      case '_':
        stop()
        this.scaleBy(n, 1 / 1.1)
        return
      case 'd':
      case 'D':
        stop()
        this.cb.onDetails?.(n)
        return
      case 'b':
      case 'B':
        stop()
        if (L.place === 'lid') this.toSheet(n)
        else this.say(`${stickerInfo(n).caption} is already on the sheet.`)
        return
      case 'l':
      case 'L':
        stop()
        if (L.place === 'sheet') this.toLid(n)
        else this.say(`${stickerInfo(n).caption} is already on the lid.`)
        return
      default:
    }
  }

  private pickUp(L: Live): void {
    if (this.gravity || this.ui.busy) {
      this.say('Switch gravity off to pick stickers up.')
      return
    }
    if (L.mode !== 'rest') this.finishNow(L)
    this.kbOrigin = this.originOf(L)
    L.mode = 'held'
    L.z = ++this.zTop
    L.liftT = 1
    L.twist = (Math.random() < 0.5 ? -1 : 1) * (1.6 + Math.random() * 1.6)
    L.sT = L.place === 'sheet' && !this.still ? this.lidScale() : L.s
    L.sV = 0
    L.corner = 2
    L.curlT = this.still ? 0 : 1
    L.tilt = 0
    L.tiltV = 0
    this.setUi({ held: L.n, selected: L.n })
    this.say(`Picked up ${stickerInfo(L.n).caption}. Arrow keys move it, Shift moves further, Space sticks it down, R rotates, Escape puts it back.`)
    this.wake()
  }

  private dropHeld(L: Live): void {
    this.setUi({ held: null })
    L.curlT = 0
    this.settle(L, L.r)
    this.kbOrigin = null
  }

  private nudge(L: Live, dx: number, dy: number, step: number): void {
    L.x = clamp(L.x + dx * step, 0, this.geo.stage.w)
    L.y = clamp(L.y + dy * step, 0, this.geo.stage.h)
    this.scrollIntoViewSoft(L)
    this.wake()
  }

  private scrollIntoViewSoft(L: Live): void {
    const sc = this.scroller
    const st = this.stage
    if (!sc || !st) return
    const sr = sc.getBoundingClientRect()
    const r = st.getBoundingClientRect()
    const y = r.top + L.y
    if (y < sr.top + 60) sc.scrollTop -= sr.top + 60 - y
    else if (y > sr.bottom - 60) sc.scrollTop += y - (sr.bottom - 60)
  }

  /** drop whatever hold (pointer or keyboard) a sticker is in, without moving it: the caller sends it on from where it is */
  private endHold(L: Live): void {
    const dragging = this.drag !== null && this.drag.n === L.n
    if (this.ui.held !== L.n && !dragging) return
    if (dragging) {
      this.detachWindow()
      this.drag = null
    }
    this.kbOrigin = null
    L.curlT = 0
    L.mode = 'rest'
    this.setUi({ held: null })
  }

  /** Escape: put back whatever is picked up (keyboard or pointer); true when it did something */
  escape(): boolean {
    if (this.ui.held !== null) {
      const L = this.lives[this.ui.held - 1]
      const d = this.drag
      const origin = d && d.n === L.n ? d.origin : this.kbOrigin
      if (d) {
        this.detachWindow()
        this.drag = null
      }
      this.setUi({ held: null })
      this.kbOrigin = null
      if (origin) this.goBack(L, origin)
      return true
    }
    if (this.ui.selected !== null) {
      this.select(null)
      return true
    }
    return false
  }

  /** a sticker lost keyboard focus while picked up with the keyboard: stick it down where it is */
  blurred(n: number): void {
    if (this.ui.held === n && !this.drag) this.dropHeld(this.lives[n - 1])
    else if (this.ui.selected === n && this.ui.tagMode === 'caption') this.select(null)
  }

  // ------------------------------------------------------------------------------------------------- rotate and scale
  rotateBy(n: number, deg: number): void {
    const L = this.lives[n - 1]
    if (this.gravity) return
    if (L.place === 'sheet' && L.mode !== 'held') {
      this.say('Stick it on the lid first, then rotate it.')
      return
    }
    if (L.mode === 'held') {
      L.r += deg
      this.wake()
      return
    }
    if (L.mode !== 'rest') this.finishNow(L)
    L.rot += deg
    this.clampToLid(L)
    if (L.z < this.zTop) L.z = ++this.zTop
    this.tweenToRest(L, { stiff: 210, damp: 14 })
    this.say(`Rotated ${stickerInfo(n).caption}.`)
  }

  scaleBy(n: number, factor: number): void {
    const L = this.lives[n - 1]
    if (this.gravity) return
    if (L.place === 'sheet' && L.mode !== 'held') {
      this.say('Stick it on the lid first, then resize it.')
      return
    }
    const next = clamp(L.sc * factor, MIN_SC, MAX_SC)
    if (L.mode === 'held') {
      L.sT = clamp(L.sT * factor, MIN_SC, MAX_SC)
      if (this.still) L.s = L.sT
      L.sc = L.sT
      this.wake()
      return
    }
    if (next === L.sc) return
    if (L.mode !== 'rest') this.finishNow(L)
    L.sc = next
    this.clampToLid(L)
    this.tweenToRest(L, { stiff: 380, damp: 30 })
  }

  private onWheel = (e: WheelEvent): void => {
    if (!e.altKey || this.gravity) return
    const target = (e.target as Element | null)?.closest<HTMLElement>('[data-stk]')
    const n = target ? Number(target.dataset.stk) : this.ui.selected
    if (!n) return
    const L = this.lives[n - 1]
    if (L.place !== 'lid' && L.mode !== 'held') return
    e.preventDefault()
    this.scaleBy(n, Math.exp(-e.deltaY * 0.0016))
  }

  // ------------------------------------------------------------------------------------------------- moves between sheet and lid
  /** peel a sticker off the sheet and stick it on a free spot of the lid */
  toLid(n: number): void {
    const L = this.lives[n - 1]
    if (this.gravity) this.setGravity(false)
    this.endHold(L)
    if (L.mode !== 'rest') this.finishNow(L)
    const spot = this.freeSpot(n)
    L.place = 'lid'
    L.u = spot.u
    L.v = spot.v
    L.rot = spot.rot
    L.sc = this.lidScale() * spot.k
    L.z = ++this.zTop
    this.clampToLid(L)
    this.syncOnLid()
    this.tweenToRest(L, { flight: true, stiff: 150, damp: 19 })
    this.say(`Peeled ${stickerInfo(n).caption} onto the lid.`)
  }

  toSheet(n: number): void {
    const L = this.lives[n - 1]
    if (this.gravity) this.setGravity(false)
    this.endHold(L)
    if (L.mode !== 'rest') this.finishNow(L)
    L.place = 'sheet'
    L.rot = 0
    L.sc = 1
    this.syncOnLid()
    this.tweenToRest(L, { flight: true, stiff: 170, damp: 20 })
    this.say(`${stickerInfo(n).caption} is back on the sheet.`)
  }

  /**
   * The best of 48 random spots for one more sticker on the lid: the one farthest (in sticker-sized steps, so a tall sticker needs
   * more room above and below than beside it) from every sticker already there. This is "best candidate" sampling: an even
   * scatter that still overlaps a little, which is exactly what a sticker-bombed lid looks like.
   */
  private bestSpot(taken: ReadonlyArray<{ u: number; v: number }>): { u: number; v: number; rot: number; k: number } {
    const { lid } = this.geo
    const A = lid.w * 0.2
    const B = lid.w * 0.27
    let best = { u: 0.5, v: 0.5, rot: 0, k: 1 }
    let bestScore = -1
    for (let i = 0; i < 48; i++) {
      const c = { u: 0.13 + Math.random() * 0.74, v: 0.24 + Math.random() * 0.52, rot: (Math.random() - 0.5) * 34, k: 0.92 + Math.random() * 0.12 }
      let score = 9
      for (const t of taken) score = Math.min(score, Math.hypot(((t.u - c.u) * lid.w) / A, ((t.v - c.v) * lid.h) / B))
      if (score > bestScore) {
        bestScore = score
        best = c
      }
    }
    return best
  }

  private freeSpot(n: number): { u: number; v: number; rot: number; k: number } {
    return this.bestSpot(this.lives.filter((l) => l.n !== n && l.place === 'lid'))
  }

  /** "Peel all": every sticker still on the sheet is flung onto the lid, one after the other, into a tidy-random pile */
  peelAll(): void {
    if (this.gravity) this.setGravity(false)
    const rest = this.lives.filter((l) => l.place === 'sheet')
    if (!rest.length) return
    this.setUi({ selected: null })
    const taken: Array<{ u: number; v: number }> = this.lives.filter((l) => l.place === 'lid').map((l) => ({ u: l.u, v: l.v }))
    // a random order, so the stack never reads the same twice
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[rest[i], rest[j]] = [rest[j], rest[i]]
    }
    rest.forEach((L, i) => {
      this.endHold(L)
      if (L.mode !== 'rest') this.finishNow(L)
      const spot = this.bestSpot(taken)
      taken.push(spot)
      L.place = 'lid'
      L.u = spot.u
      L.v = spot.v
      L.rot = spot.rot
      L.sc = this.lidScale() * spot.k
      L.z = ++this.zTop
      this.clampToLid(L)
      this.tweenToRest(L, { flight: true, stiff: 120, damp: 17, delay: i * 0.07 })
    })
    this.syncOnLid()
    this.say(`Peeled all ${rest.length} stickers onto the lid.`)
  }

  /** "Reset": everything flies back into its ghost on the sheet */
  reset(): void {
    if (this.gravity) this.setGravity(false)
    this.setUi({ selected: null })
    const onLid = this.lives.filter((l) => l.place === 'lid').sort((a, b) => b.z - a.z)
    onLid.forEach((L, i) => {
      this.endHold(L)
      if (L.mode !== 'rest') this.finishNow(L)
      L.place = 'sheet'
      L.rot = 0
      L.sc = 1
      this.tweenToRest(L, { flight: true, stiff: 130, damp: 18, delay: i * 0.05 })
    })
    this.syncOnLid()
    this.say('Everything is back on the sheet.')
  }

  /** "Arrange": all nine on the lid in a composition with a rhythm of tilts */
  arrange(): void {
    if (this.gravity) this.setGravity(false)
    this.setUi({ selected: null })
    const ls = this.lidScale()
    ARRANGE.forEach((p: LidPose, i: number) => {
      const L = this.lives[p.n - 1]
      this.endHold(L)
      if (L.mode !== 'rest') this.finishNow(L)
      L.place = 'lid'
      L.u = p.u
      L.v = p.v
      L.rot = p.rot
      L.sc = ls * p.k * 0.94
      L.z = 40 + i
      this.clampToLid(L)
      this.tweenToRest(L, { flight: true, stiff: 130, damp: 17, delay: i * 0.06 })
    })
    this.zTop = 60
    this.syncOnLid()
    this.say('Arranged all nine on the lid.')
  }

  // ------------------------------------------------------------------------------------------------- gravity
  getGravity(): boolean {
    return this.gravity
  }

  async setGravity(on: boolean): Promise<void> {
    if (on === this.gravity || this.ui.busy) return
    if (on) {
      this.setUi({ selected: null })
      if (this.ui.held !== null) this.escape()
      for (const L of this.lives) if (L.mode !== 'rest') this.finishNow(L)
      this.setUi({ busy: true })
      let M: MatterLib
      try {
        M = await loadMatter()
      } catch {
        this.setUi({ busy: false })
        this.say('Gravity could not load. Try again.')
        return
      }
      if (!this.mounted) return
      this.matter = M
      this.setUi({ busy: false })
      this.gravity = true
      this.tiltT = this.still ? 0 : TILT_GRAVITY
      this.buildWorld(M)
      this.setUi({ gravity: true })
      this.say('Gravity on. The lid tips and the stickers slide.')
      if (this.still && this.world) {
        this.world.settle()
        this.pullWorld()
        this.renderAll()
      } else {
        this.wake()
      }
    } else {
      this.pullWorld()
      this.world?.destroy()
      this.world = null
      this.gravity = false
      for (const L of this.lives) if (L.mode === 'phys') L.mode = 'rest'
      this.tiltT = 0
      this.setUi({ gravity: false })
      this.say('Gravity off. You can pick the stickers up again.')
      this.wake()
      this.renderAll()
    }
  }

  private physInputs(): PhysInput[] {
    const { lid } = this.geo
    return this.lives
      .filter((l) => l.place === 'lid')
      .map((l) => ({ n: l.n, x: l.u * lid.w, y: l.v * lid.h, rotDeg: l.rot, k: this.kOf(l.sc), parts: SHAPES[l.n].parts }))
  }

  private buildWorld(M: MatterLib): void {
    const { lid, inset } = this.geo
    const inner = { x: inset, y: inset, w: lid.w - 2 * inset, h: lid.h - 2 * inset }
    this.world?.destroy()
    this.world = new GravityWorld(M, this.physInputs(), inner, { x: Math.sin(this.tiltT * DEG), y: Math.cos(this.tiltT * DEG) })
    for (const L of this.lives) if (L.place === 'lid') L.mode = 'phys'
  }

  private rebuildWorld(): void {
    if (this.world && this.matter) this.buildWorld(this.matter)
  }

  /** copy the bodies' poses into the stickers' lid poses */
  private pullWorld(): void {
    if (!this.world) return
    const { lid } = this.geo
    for (const p of this.world.poses()) {
      const L = this.lives[p.n - 1]
      L.u = p.x / lid.w
      L.v = p.y / lid.h
      L.rot = p.rotDeg
    }
  }

  // ------------------------------------------------------------------------------------------------- export
  snapshot(): BoardSnapshot {
    return {
      lid: { w: this.geo.lid.w, h: this.geo.lid.h },
      unit: this.geo.unit,
      items: this.lives
        .filter((l) => l.place === 'lid')
        .sort((a, b) => a.z - b.z)
        .map((l) => ({ n: l.n, u: l.u, v: l.v, rot: l.rot, sc: l.sc, z: l.z })),
    }
  }

  /** dev aid (exposed on window in dev builds only): what is still moving and why the loop keeps running */
  debugInfo(): unknown {
    return {
      raf: this.raf !== 0,
      tilt: +this.tilt.toFixed(4),
      tiltV: +this.tiltV.toFixed(4),
      tiltT: this.tiltT,
      gravity: this.gravity,
      geo: this.geo,
      world: this.world ? this.world.debug() : null,
      stickers: this.lives.map((l) => ({ n: l.n, mode: l.mode, place: l.place, u: +l.u.toFixed(4), v: +l.v.toFixed(4), rot: +l.rot.toFixed(2), sc: +l.sc.toFixed(4), lift: +l.lift.toFixed(3), liftV: +l.liftV.toFixed(3), curl: +l.curl.toFixed(2), z: l.z })),
    }
  }

  /** for the tag: which place a sticker is in */
  placeOf(n: number): Place {
    return this.lives[n - 1].place
  }

  canvasSize(): { w: number; h: number } {
    return { w: CANVAS_W, h: CANVAS_H }
  }
}
