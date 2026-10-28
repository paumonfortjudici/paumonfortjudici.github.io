import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import './flipbook.css'
import { FlipEngine } from './engine'
import { grainUrl } from './grain'
import { useElementWidth, useStillMotion } from './hooks'
import { FaceEl, Leaf, type FlipCfg } from './Leaf'
import { smoothstep, clamp01 } from './curl'
import { stripsFor } from './quality'
import {
  DEFAULT_LABELS,
  buildModel,
  describe,
  leavesFor,
  maxPos,
  pageToPos,
  posToSpread,
  spreadToPos,
  visibleFaces,
  type BookModel,
  type Face,
  type Mode,
} from './model'
import type { FlipBookHandle, FlipBookProps, FlipLabels, FlipPage } from './types'

const SINGLE_BELOW = 720
const BEND_DEG = 60
const DEFAULT_THICKNESS = 0.032

interface InnerHandle {
  next(): void
  prev(): void
  goTo(spread: number): void
  goToPage(id: string): void
  scrub(progress: number | null, direction?: 'next' | 'prev'): void
  release(to?: 'start' | 'end'): void
  arm(): void
  disarm(): void
  hint(): void
  handleKey(e: { key: string; altKey: boolean; ctrlKey: boolean; metaKey: boolean; shiftKey: boolean; target: EventTarget | null; preventDefault(): void }): boolean
  readonly spread: number
}

interface InnerProps {
  pages: FlipPage[]
  model: BookModel
  mode: Mode
  still: boolean
  startSpread: number
  controlledSpread: number | undefined
  labels: FlipLabels
  total: number
  curl: 'strips' | 'flat'
  strips: number
  gloss: number
  hardCover: boolean
  thickness: number
  tilt: number
  controls: boolean
  onPageChange?: (spread: number) => void
  onSpreadChange?: FlipBookProps['onSpreadChange']
  onSeen: (spread: number) => void
  handleRef: { current: InnerHandle | null }
}

const hardCoverOverhang = 0.028

/** Left pages that exist beside this leaf's turn decide which shadows are drawn. */
function edgeOf(k: number, L: number, mode: Mode): 'first' | 'last' | 'both' | null {
  const first = mode === 'single' || k === 0
  const last = k === L - 1
  if (first && last) return 'both'
  if (first) return 'first'
  if (last) return 'last'
  return null
}

function Chevron({ dir }: { dir: 'l' | 'r' }) {
  return (
    <svg className="pm-flip__chev" viewBox="0 0 14 14" width="14" height="14" aria-hidden="true" focusable="false">
      <path d={dir === 'l' ? 'M9 2 L4 7 L9 12' : 'M5 2 L10 7 L5 12'} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Inner(p: InnerProps) {
  const { model, mode, still } = p
  const single = mode === 'single'
  const leaves = useMemo(() => leavesFor(model, mode), [model, mode])
  const L = leaves.length
  const max = maxPos(model, mode)

  const [engine] = useState(() => new FlipEngine(L, max, spreadToPos(model, mode, p.startSpread)))
  useSyncExternalStore(engine.subscribe, engine.getVersion)
  const pos = engine.pos
  const spread = posToSpread(model, mode, pos)

  const byId = useMemo(() => new Map(p.pages.map((pg) => [pg.id, pg])), [p.pages])
  const fresh = useCallback((f: Face): Face => (f ? byId.get(f.id) ?? f : null), [byId])

  const innerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const zonesRef = useRef<HTMLDivElement>(null)
  const stackL = useRef<HTMLDivElement>(null)
  const stackR = useRef<HTMLDivElement>(null)
  const blockL = useRef<HTMLDivElement>(null)
  const blockR = useRef<HTMLDivElement>(null)
  const spineRef = useRef<HTMLDivElement>(null)

  const cfg = useRef<FlipCfg>({ pw: 0, ph: 0, single, strips: p.strips, gloss: p.gloss, bend: BEND_DEG, flat: p.curl === 'flat', board: hardCoverOverhang })
  cfg.current.single = single
  cfg.current.strips = p.strips
  cfg.current.gloss = p.gloss
  cfg.current.flat = p.curl === 'flat'
  cfg.current.board = p.hardCover && !single ? hardCoverOverhang : 0

  const props = useRef(p)
  props.current = p
  interface Drag {
    id: number
    type: string
    x0: number
    y0: number
    t0: number
    zone: 'r' | 'l' | null
    started: boolean
    k: number
    dir: 1 | -1
    r0: number
    s0: number
  }
  const drag = useRef<Drag | null>(null)
  const hoverZone = useRef<'r' | 'l' | null>(null)
  const scrub = useRef<{ k: number; dir: 1 | -1 } | null>(null)
  const lastPosNotified = useRef(-1)
  const lastSpreadNotified = useRef(-1)

  // ------------------------------------------------------------------ measure
  useLayoutEffect(() => {
    const stage = stageRef.current
    const inner = innerRef.current
    if (!stage || !inner) return
    const measure = () => {
      const W = stage.offsetWidth
      const H = stage.offsetHeight
      const pw = single ? W : W / 2
      cfg.current.pw = pw
      cfg.current.ph = H
      inner.style.setProperty('--pw', `${pw}px`)
      inner.style.setProperty('--ph', `${H}px`)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(stage)
    return () => ro.disconnect()
  }, [single])

  // ------------------------------------------------------------------ progress -> centring, thickness, shadows
  const applyProgress = useCallback(
    (prog: number) => {
      const stage = stageRef.current
      if (!stage) return
      const frac = L > 0 ? prog / L : 0
      // which side has paper on it, and so where the book sits: during a far jump these follow the jumping leaf
      // l / r: where the book sits (follows the whole turn); bl / br: the paper block under each side, which
      // only shows once the turning leaf is over it
      const at = (pp: number) => ({
        l: smoothstep(0, 1, clamp01(pp)),
        r: smoothstep(0, 1, clamp01(L - pp)),
        bl: smoothstep(0.5, 1, clamp01(pp)),
        br: smoothstep(0.5, 1, clamp01(L - pp)),
      })
      let cur = at(prog)
      const jmp = engine.jumper
      if (jmp) {
        const a = at(jmp.from)
        const b = at(jmp.dest)
        const tj = engine.t(jmp.k).get()
        const s = smoothstep(0.35, 0.95, jmp.dir > 0 ? tj : 1 - tj)
        cur = { l: a.l + (b.l - a.l) * s, r: a.r + (b.r - a.r) * s, bl: a.bl + (b.bl - a.bl) * s, br: a.br + (b.br - a.br) * s }
      }
      const eL = cur.l
      const eR = cur.r
      const xPct = single ? 0 : -25 * (1 - eL) + 25 * (1 - eR)
      const tilt = props.current.tilt
      const t = `translate3d(${xPct.toFixed(3)}%,0,0)${tilt ? ` rotateX(${tilt}deg)` : ''}`
      stage.style.transform = t
      if (zonesRef.current) zonesRef.current.style.transform = `translate3d(${xPct.toFixed(3)}%,0,0)`
      // the page-stack edges have a fixed width; how much of it shows follows the pages on each side
      if (stackR.current) stackR.current.style.clipPath = `inset(0 ${(frac * 100).toFixed(2)}% 0 0)`
      if (stackL.current) stackL.current.style.clipPath = single ? 'inset(0 0 0 100%)' : `inset(0 0 0 ${((1 - frac) * 100).toFixed(2)}%)`
      if (blockR.current) blockR.current.style.opacity = single ? '1' : cur.br.toFixed(3)
      if (blockL.current) blockL.current.style.opacity = single ? '0' : cur.bl.toFixed(3)
      if (spineRef.current) spineRef.current.style.opacity = single ? '0' : (0.35 + 0.65 * Math.min(eL, eR)).toFixed(3)
    },
    [L, single, engine],
  )

  useLayoutEffect(() => {
    applyProgress(engine.progress())
    return engine.onProgress(() => applyProgress(engine.progress()))
  }, [engine, applyProgress])
  useLayoutEffect(() => {
    applyProgress(engine.progress())
  })

  // ------------------------------------------------------------------ navigation
  const reconcileTimer = useRef(0)
  const reconcileRef = useRef<() => void>(() => undefined)
  useEffect(() => () => window.clearTimeout(reconcileTimer.current), [])
  const notify = useCallback(
    (silent: boolean) => {
      const pr = props.current
      if (engine.pos === lastPosNotified.current) return
      lastPosNotified.current = engine.pos
      const sp = posToSpread(model, mode, engine.pos)
      const moved = sp !== lastSpreadNotified.current
      lastSpreadNotified.current = sp
      pr.onSeen(sp)
      if (silent) return
      if (moved) pr.onPageChange?.(sp)
      pr.onSpreadChange?.(describe(model, mode, engine.pos, pr.labels, pr.total))
      // controlled: once the parent has had its say (a re-render), a refused change turns back
      if (pr.controlledSpread !== undefined) {
        window.clearTimeout(reconcileTimer.current)
        reconcileTimer.current = window.setTimeout(() => reconcileRef.current(), 0)
      }
    },
    [engine, model, mode],
  )

  const goPos = useCallback(
    (np: number, silent = false, velocity?: number) => {
      const clamped = Math.max(0, Math.min(max, Math.round(np)))
      // a hand on the page wins: keys and buttons wait; a scrub is let go first
      if (drag.current?.started) return
      if (scrub.current) releaseScrub()
      if (clamped === engine.pos && !engine.jumper) return
      if (props.current.still) engine.reset(clamped)
      else engine.goTo(clamped, velocity)
      notify(silent)
    },
    [engine, max, notify],
  )

  // initial notification (captions) + cleanup of every running spring
  useEffect(() => {
    lastPosNotified.current = engine.pos
    lastSpreadNotified.current = spread
    props.current.onSeen(spread)
    props.current.onSpreadChange?.(describe(model, mode, engine.pos, props.current.labels, props.current.total))
    return () => engine.dispose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // controlled mode: follow the prop
  const controlled = p.controlledSpread
  const reconcile = useCallback(() => {
    const want = props.current.controlledSpread
    if (want === undefined) return
    const target = Math.max(0, Math.min(model.spreads - 1, Math.round(want)))
    // single mode: keep the current page when it already belongs to the controlled spread
    if (single && posToSpread(model, mode, engine.pos) === target) return
    const wp = spreadToPos(model, mode, target)
    if (wp !== engine.pos) goPos(wp, true)
  }, [model, mode, single, engine, goPos])
  reconcileRef.current = reconcile
  useEffect(() => {
    reconcile()
  }, [controlled, reconcile])

  // reduced motion switched on mid-turn: land everything
  useEffect(() => {
    if (still) engine.settleAll()
  }, [still, engine])

  // a one-shot invitation: the corner of the next page lifts and settles again
  const hintTimer = useRef(0)
  useEffect(() => () => window.clearTimeout(hintTimer.current), [])
  const hint = () => {
    if (props.current.still || engine.busy || engine.flying > 0) return
    const k = engine.leafFor(1)
    if (k < 0) return
    engine.arm(k)
    engine.peek(k, 0)
    window.clearTimeout(hintTimer.current)
    hintTimer.current = window.setTimeout(() => {
      engine.unpeek(k)
      disarmLater()
    }, 720)
  }

  const nextPos = () => goPos(engine.pos + 1)
  const prevPos = () => goPos(engine.pos - 1)

  // ------------------------------------------------------------------ pointer: drag, swipe, click, peek

  const geometry = () => {
    const stage = stageRef.current
    if (!stage) return { spineX: 0, pw: 1 }
    const r = stage.getBoundingClientRect()
    // r.width is the transformed width; with a pure translate it equals the layout width
    return single ? { spineX: r.left, pw: r.width } : { spineX: r.left + r.width / 2, pw: r.width / 2 }
  }

  const peekFor = (zone: 'r' | 'l') => {
    if (p.still || engine.busy || drag.current) return
    const k = engine.leafFor(zone === 'r' ? 1 : -1)
    if (k >= 0) engine.peek(k, zone === 'r' ? 0 : 1)
  }
  const unpeekFor = (zone: 'r' | 'l') => {
    const k = zone === 'r' ? engine.pos : engine.pos - 1
    engine.unpeek(k)
  }

  const armAround = useCallback(() => {
    if (props.current.still) return
    const e = engine
    if (e.pos < e.maxPos) e.arm(e.pos)
    if (e.pos > 0) e.arm(e.pos - 1)
  }, [engine])
  const disarmTimer = useRef(0)
  const disarmLater = useCallback(() => {
    window.clearTimeout(disarmTimer.current)
    disarmTimer.current = window.setTimeout(() => {
      if (!engine.busy && !hoverZone.current) engine.disarmAll()
    }, 900)
  }, [engine])
  useEffect(() => () => window.clearTimeout(disarmTimer.current), [])
  // keep the armed leaves in step with the position while the pointer / focus is around
  useEffect(() => {
    if (engine.armed.size === 0) return
    engine.disarmAll()
    armAround()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos])
  // a hovered corner lifts again once the previous turn has landed
  useEffect(() => {
    const z = hoverZone.current
    if (!z) return
    const id = window.setTimeout(() => {
      if (hoverZone.current === z) peekFor(z)
    }, 380)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos])

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const target = e.target as HTMLElement
    if (target.closest('a,button,input,select,textarea,[data-flip-no-drag]')) return
    const zoneEl = target.closest('[data-flip-zone]') as HTMLElement | null
    const zone = (zoneEl?.getAttribute('data-flip-zone') as 'r' | 'l' | null) ?? null
    if (e.pointerType === 'mouse' && !zone) return
    if (engine.busy && !p.still) return
    drag.current = { id: e.pointerId, type: e.pointerType, x0: e.clientX, y0: e.clientY, t0: performance.now(), zone, started: false, k: -1, dir: 1, r0: 1, s0: 0 }
    armAround()
  }

  const beginDrag = (d: Drag, dx: number, e: ReactPointerEvent<HTMLDivElement>) => {
    const dir: 1 | -1 = d.zone ? (d.zone === 'r' ? 1 : -1) : dx < 0 ? 1 : -1
    const k = engine.leafFor(dir)
    if (k < 0) return false
    const { spineX, pw } = geometry()
    const u0 = (e.clientX - dx - spineX) / pw
    const s0 = dir > 0 ? u0 : -u0
    d.k = k
    d.dir = dir
    d.s0 = s0
    d.r0 = d.zone ? Math.max(0.55, Math.abs(s0)) : Math.max(0.5, Math.abs(s0))
    d.started = true
    engine.grab(k)
    // capture only once it is a real drag, so a tap on an overlay button still clicks it
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* the pointer may already be gone */
    }
    return true
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const dx = e.clientX - d.x0
    const dy = e.clientY - d.y0
    if (!d.started) {
      const th = d.type === 'mouse' ? 4 : 8
      if (Math.hypot(dx, dy) < th) return
      if (d.type !== 'mouse' && Math.abs(dy) > Math.abs(dx) * 1.2) {
        // a vertical gesture: the page scrolls, not the book
        drag.current = null
        return
      }
      if (p.still || !beginDrag(d, dx, e)) {
        if (!p.still) drag.current = null
        return
      }
    }
    const { spineX, pw } = geometry()
    const u = (e.clientX - spineX) / pw
    const s = d.dir > 0 ? u : -u
    const sp = d.r0 + (s - d.s0)
    const th = Math.acos(Math.max(-1, Math.min(1, sp / d.r0))) / Math.PI
    engine.drag(d.k, d.dir > 0 ? th : 1 - th)
  }

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    drag.current = null
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* already released */
    }
    if (!d.started) {
      const dx = e.clientX - d.x0
      const dy = e.clientY - d.y0
      if (!cancelled && d.zone && Math.hypot(dx, dy) < 6 && performance.now() - d.t0 < 600) {
        if (d.zone === 'r') nextPos()
        else prevPos()
      } else if (!cancelled && p.still && Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        // no curl in reduced motion, but a swipe still works
        if (dx < 0) nextPos()
        else prevPos()
      }
      disarmLater()
      return
    }
    const mv = engine.t(d.k)
    const t = mv.get()
    const v = mv.getVelocity()
    const c = d.dir > 0 ? t : 1 - t
    const vc = d.dir > 0 ? v : -v
    const complete = !cancelled && c + 0.16 * vc > 0.5
    const side: 0 | 1 = complete ? (d.dir > 0 ? 1 : 0) : d.dir > 0 ? 0 : 1
    engine.drop(d.k, side, cancelled ? 0 : v)
    notify(false)
    disarmLater()
  }

  // ------------------------------------------------------------------ imperative
  const doScrub = useCallback(
    (progress: number | null, direction: 'next' | 'prev' = 'next') => {
      if (progress === null) return releaseScrub()
      const dir: 1 | -1 = direction === 'prev' ? -1 : 1
      const k = engine.leafFor(dir)
      if (k < 0) return
      if (!scrub.current || scrub.current.k !== k) {
        if (scrub.current) releaseScrub()
        scrub.current = { k, dir }
        engine.grab(k)
      }
      const pr = clamp01(progress)
      engine.drag(k, dir > 0 ? pr : 1 - pr)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [engine],
  )
  function releaseScrub(to?: 'start' | 'end') {
    const s = scrub.current
    if (!s) return
    scrub.current = null
    const t = engine.t(s.k).get()
    const c = s.dir > 0 ? t : 1 - t
    const complete = to ? to === 'end' : c > 0.5
    const side: 0 | 1 = complete ? (s.dir > 0 ? 1 : 0) : s.dir > 0 ? 0 : 1
    engine.drop(s.k, side)
    notify(false)
  }

  const handleKey: InnerHandle['handleKey'] = (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return false
    const el = e.target as HTMLElement | null
    if (el && isTyping(el)) return false
    switch (e.key) {
      case 'ArrowRight':
        nextPos()
        break
      case 'ArrowLeft':
        prevPos()
        break
      case 'Home':
        goPos(0)
        break
      case 'End':
        goPos(max)
        break
      default:
        return false
    }
    e.preventDefault()
    return true
  }

  useEffect(() => {
    p.handleRef.current = {
      next: nextPos,
      prev: prevPos,
      goTo: (s: number) => goPos(spreadToPos(model, mode, s)),
      goToPage: (id: string) => {
        const np = pageToPos(model, mode, id)
        if (np >= 0) goPos(np)
      },
      scrub: doScrub,
      release: (to) => releaseScrub(to),
      arm: armAround,
      disarm: disarmLater,
      hint,
      handleKey,
      get spread() {
        return posToSpread(model, mode, engine.pos)
      },
    }
    return () => {
      p.handleRef.current = null
    }
  })

  // ------------------------------------------------------------------ render the leaves
  const window3 = single ? { lo: pos - 2, hi: pos + 2 } : { lo: pos - 2, hi: pos + 1 }
  const mountedSet = new Set<number>()
  if (!still) {
    for (let k = window3.lo; k <= window3.hi; k++) if (k >= 0 && k < L) mountedSet.add(k)
    for (const k of engine.flightList()) if (k >= 0 && k < L) mountedSet.add(k)
    for (const h of [engine.hold.left, engine.hold.right]) if (h !== null && h >= 0 && h < L) mountedSet.add(h)
  }
  const jumper = engine.jumper
  const dest = jumper ? visibleFaces(model, mode, jumper.dest) : null
  const nStrips = p.curl === 'flat' ? 1 : stripsFor(Math.max(8, Math.min(32, single ? Math.min(p.strips, 16) : p.strips)))

  const leafEls = [...mountedSet]
    .filter((k) => !engine.isHidden(k))
    .sort((a, b) => a - b)
    .map((k) => {
      const lf = leaves[k]!
      let front = fresh(lf.front)
      let back = fresh(lf.back)
      if (jumper && jumper.k === k && dest) {
        if (jumper.dir > 0) back = fresh(dest.left)
        else front = fresh(dest.right)
      }
      const flying = engine.isFlying(k) || engine.hold.left === k || engine.hold.right === k
      const loadFront = flying || (single ? k >= pos - 2 && k <= pos + 2 : k >= pos - 1)
      const loadBack = flying || (single ? false : k <= pos)
      return (
        <Leaf
          key={k}
          k={k}
          engine={engine}
          cfg={cfg}
          front={front}
          back={back}
          loadFront={loadFront}
          loadBack={loadBack}
          showFront={single ? k === pos : k === pos}
          showBack={!single && k === pos - 1}
          armed={engine.armed.has(k)}
          n={nStrips}
          edge={edgeOf(k, L, mode)}
          board={p.hardCover && !single && (k === 0 || k === L - 1)}
          zr={100 - (k - pos)}
          zl={100 - (pos - 1 - k)}
        />
      )
    })

  // reduced motion: the visible spread dissolves into the one that replaces it (no curl, no travel)
  const [fadeFrom, setFadeFrom] = useState<number | null>(null)
  const lastPos = useRef(pos)
  useLayoutEffect(() => {
    if (!still) {
      lastPos.current = pos
      setFadeFrom(null)
      return
    }
    if (lastPos.current !== pos) {
      setFadeFrom(lastPos.current)
      lastPos.current = pos
    }
  }, [pos, still])
  useEffect(() => {
    if (fadeFrom === null) return
    const id = window.setTimeout(() => setFadeFrom(null), 260)
    return () => window.clearTimeout(id)
  }, [fadeFrom, pos])

  const centre = (at: number) => (single ? 0 : at === 0 ? -25 : at === L ? 25 : 0)
  const stillLayer = (at: number, cls: string, offset: number) => {
    const vis = visibleFaces(model, mode, at)
    const out = cls === 'is-out'
    return (
      <div
        key={at}
        className={`pm-flip__still ${cls}`.trim()}
        style={offset ? { transform: `translateX(${offset}%)` } : undefined}
        aria-hidden={out ? true : undefined}
      >
        {vis.right ? <FaceEl page={fresh(vis.right)} side="r" load z={2} exposed={!out} board={false} onUrl={noop} /> : null}
        {vis.left ? <FaceEl page={fresh(vis.left)} side="l" load z={2} exposed={!out} board={false} onUrl={noop} /> : null}
      </div>
    )
  }
  const fading = fadeFrom !== null && fadeFrom !== pos

  // ------------------------------------------------------------------ chrome
  const text = describe(model, mode, pos, p.labels, p.total).text
  const atStart = pos <= 0
  const atEnd = pos >= max

  const innerVars = {
    '--grain': grainUrl(),
    '--spine': single ? '0%' : '50%',
    '--pwp': single ? '100%' : '50%',
    '--stack-t': String(p.thickness),
  } as CSSProperties

  // the tabs are the shared folder-tab buttons (primitives/css/20-tabbutton.css): fill and ink come from these two vars
  const tabVars = { '--c': 'var(--_ink)', '--on': 'var(--_on)' } as CSSProperties

  return (
    <div className="pm-flip__inner" ref={innerRef} style={innerVars} data-hard={p.hardCover && !single ? '' : undefined}>
      <div
        className="pm-flip__frame"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => endDrag(e, false)}
        onPointerCancel={(e) => endDrag(e, true)}
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') armAround()
        }}
        onPointerLeave={() => disarmLater()}
      >
        <div className="pm-flip__stage" ref={stageRef}>
          <div className="pm-flip__block pm-flip__block--l" ref={blockL} />
          <div className="pm-flip__block pm-flip__block--r" ref={blockR} />
          <div className="pm-flip__stack pm-flip__stack--l" ref={stackL} />
          <div className="pm-flip__stack pm-flip__stack--r" ref={stackR} />
          {still ? (
            <>
              {fading ? stillLayer(fadeFrom, 'is-out', centre(fadeFrom) - centre(pos)) : null}
              {stillLayer(pos, fading ? 'is-in' : '', 0)}
            </>
          ) : (
            leafEls
          )}
          <div className="pm-flip__spine" ref={spineRef} aria-hidden="true" />
        </div>
        <div className="pm-flip__zones" ref={zonesRef}>
            {!atEnd ? (
              <div
                className="pm-flip__zone pm-flip__zone--r"
                data-flip-zone="r"
                data-cursor="Flip"
                aria-hidden="true"
                onPointerEnter={(e) => {
                  hoverZone.current = 'r'
                  if (e.pointerType === 'mouse') peekFor('r')
                }}
                onPointerLeave={() => {
                  hoverZone.current = null
                  unpeekFor('r')
                }}
              />
            ) : null}
            {!atStart ? (
              <div
                className="pm-flip__zone pm-flip__zone--l"
                data-flip-zone="l"
                data-cursor="Flip"
                aria-hidden="true"
                onPointerEnter={(e) => {
                  hoverZone.current = 'l'
                  if (e.pointerType === 'mouse') peekFor('l')
                }}
                onPointerLeave={() => {
                  hoverZone.current = null
                  unpeekFor('l')
                }}
              />
            ) : null}
        </div>
      </div>

      {p.controls ? (
        <div className="pm-flip__bar">
          <button
            type="button"
            className="pm-tabbtn pm-flip__btn pm-flip__btn--prev"
            data-size="md"
            data-cursor="Flip"
            style={tabVars}
            aria-disabled={atStart || undefined}
            onClick={() => (atStart ? undefined : prevPos())}
            onPointerEnter={armAround}
            onFocus={armAround}
            onBlur={disarmLater}
          >
            <Chevron dir="l" />
            <span className="pm-tabbtn__label">{p.labels.prev}</span>
          </button>
          <input
            className="pm-flip__range"
            type="range"
            min={0}
            max={max}
            step={1}
            value={pos}
            aria-label={p.labels.scrubber}
            aria-valuetext={text}
            onChange={(e) => goPos(Number(e.target.value))}
            style={{ '--fill': max > 0 ? `${(pos / max) * 100}%` : '0%' } as CSSProperties}
          />
          <button
            type="button"
            className="pm-tabbtn pm-flip__btn pm-flip__btn--next"
            data-size="md"
            data-cursor="Flip"
            style={tabVars}
            aria-disabled={atEnd || undefined}
            onClick={() => (atEnd ? undefined : nextPos())}
            onPointerEnter={armAround}
            onFocus={armAround}
            onBlur={disarmLater}
          >
            <span className="pm-tabbtn__label">{p.labels.next}</span>
            <Chevron dir="r" />
          </button>
        </div>
      ) : null}

      <div className="pm-flip__live" role="status" aria-live="polite" aria-atomic="true">
        {text}
      </div>
    </div>
  )
}

const noop = () => undefined

/** Elements that use the arrow keys themselves (text fields, selects, sliders, radios). */
function isTyping(t: HTMLElement): boolean {
  if (t.isContentEditable || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT') return true
  if (t.tagName !== 'INPUT') return false
  return !/^(checkbox|button|submit|reset|image|file|color)$/.test((t as HTMLInputElement).type)
}

function cfgAspect(pages: FlipPage[]): number {
  const inner = pages.find((pg) => pg.kind !== 'cover' && pg.kind !== 'back') ?? pages[0]
  return inner ? inner.width / inner.height : 0.75
}

export const FlipBook = forwardRef<FlipBookHandle, FlipBookProps>(function FlipBook(props, ref) {
  const rootRef = useRef<HTMLDivElement>(null)
  const width = useElementWidth(rootRef)
  const still = useStillMotion(props.reducedMotion)
  const modeProp = props.mode ?? 'auto'
  const mode: Mode = modeProp === 'auto' ? (width > 0 && width < SINGLE_BELOW ? 'single' : 'spread') : modeProp

  // the structure only changes when the list of pages does (inline arrays are fine)
  const sig = props.pages.map((pg) => `${pg.id}|${pg.src}|${pg.kind ?? ''}`).join('\n')
  const modelId = useRef(0)
  const model = useMemo(() => {
    modelId.current++
    return buildModel(props.pages)
  }, [sig]) // eslint-disable-line react-hooks/exhaustive-deps

  const labels = useMemo<FlipLabels>(() => ({ ...DEFAULT_LABELS, ...props.labels }), [props.labels])
  const lastSpread = useRef(props.page ?? props.defaultPage ?? 0)
  if (props.page !== undefined) lastSpread.current = props.page
  const innerRef = useRef<InnerHandle | null>(null)
  const aspect = props.aspect ?? cfgAspect(props.pages)

  useImperativeHandle(
    ref,
    () => ({
      next: () => innerRef.current?.next(),
      prev: () => innerRef.current?.prev(),
      goTo: (s) => innerRef.current?.goTo(s),
      goToPage: (id) => innerRef.current?.goToPage(id),
      spreadOf: (id) => {
        const np = pageToPos(model, mode, id)
        return np < 0 ? -1 : posToSpread(model, mode, np)
      },
      scrub: (pr, dir) => innerRef.current?.scrub(pr, dir),
      release: (to) => innerRef.current?.release(to),
      hint: () => innerRef.current?.hint(),
      get spread() {
        return innerRef.current?.spread ?? lastSpread.current
      },
      get count() {
        return model.spreads
      },
      get mode() {
        return mode
      },
      get still() {
        return still
      },
      get element() {
        return rootRef.current
      },
    }),
    [model, mode, still],
  )

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    innerRef.current?.handleKey(e)
  }

  // arrow keys anywhere on the page (the Contract / Spelled Guilty worlds opt in)
  const globalKeys = props.keys === 'window'
  useEffect(() => {
    if (!globalKeys) return
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return
      const t = e.target as HTMLElement | null
      if (t && isTyping(t)) return
      if (rootRef.current && t && rootRef.current.contains(t)) return // the book's own handler has it
      if (e.key === 'Home' || e.key === 'End') return // out in the page these scroll the world, as the browser does
      innerRef.current?.handleKey(e)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [globalKeys])

  const style = { '--pa': String(aspect) } as CSSProperties
  const rootClass = ['pm-flip', props.className].filter(Boolean).join(' ')

  return (
    <div
      ref={rootRef}
      className={rootClass}
      style={style}
      data-mode={mode}
      data-still={still ? '' : undefined}
      role="group"
      aria-roledescription="book"
      aria-label={props['aria-label'] ?? labels.label}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onFocus={() => innerRef.current?.arm()}
      onBlur={() => innerRef.current?.disarm()}
    >
      {width > 0 && props.pages.length > 0 ? (
        <Inner
          key={`${mode}-${still ? 's' : 'a'}-${modelId.current}`}
          pages={props.pages}
          model={model}
          mode={mode}
          still={still}
          startSpread={lastSpread.current}
          controlledSpread={props.page}
          labels={labels}
          total={props.totalPages ?? props.pages.length}
          curl={props.curl ?? 'strips'}
          strips={props.strips ?? 22}
          gloss={props.gloss ?? 0.3}
          hardCover={!!props.hardCover}
          thickness={DEFAULT_THICKNESS}
          tilt={props.tilt ?? 0}
          controls={props.controls !== false}
          onPageChange={props.onPageChange}
          onSpreadChange={props.onSpreadChange}
          onSeen={(s) => {
            lastSpread.current = s
          }}
          handleRef={innerRef}
        />
      ) : (
        <div className="pm-flip__frame pm-flip__frame--ph" />
      )}
    </div>
  )
})

