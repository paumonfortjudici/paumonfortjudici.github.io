// THE WALL: one big pan / zoom surface with the Gotet board hung on it. This file is its own chunk (react-zoom-pan-pinch lives here and
// nowhere else), loaded when the Board view opens.
//   wheel and pinch zoom (multiplicative, around the pointer), drag to pan with momentum, double-click or double-tap zooms to the spot,
//   keyboard while the canvas has focus: arrows pan, + and - zoom, 0 fits (Esc, [ and ] are never touched), and a flight camera that
//   flies to whatever is selected (about 700 ms, instant when motion is off).
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { TransformComponent, TransformWrapper, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch'
import Board from './Board'
import Controls, { makeStore } from './Controls'
import { MASCOT_COPY } from './copy'
import { BOARD_H, BOARD_W, IMG, isMascotId, selectionView, type ColourwayId, type MascotId, type Rect, type Selection } from './data'
import {
  MAX_SCALE,
  STAGE_H,
  STAGE_PAD,
  STAGE_W,
  cameraAt,
  centreOf,
  clamp,
  clampCentre,
  easeInOut,
  flightPath,
  scaleFor,
  type Camera,
  type Insets,
} from './geometry'
import { useSpeech } from './speech'

export interface WallProps {
  sel: Selection
  colourway: ColourwayId
  /** reduced or paused motion: no flight, no idle bob */
  still: boolean
  /** the tour owns the arrow keys */
  tourActive: boolean
  /** room the overlay UI takes from the canvas, in px */
  reserve: { top: number; bottom: number; left: number; right: number }
  onSelect: (sel: Selection) => void
  /** keyboard shortcut past the 28 tab stops of the board: take focus to the details panel */
  onSkip: () => void
  /** tell the parent the zoom changed enough to matter (for the Fit control state) */
  onFitChange?: (atFit: boolean) => void
}

/** the wall paper: tile size in px (it does not scale with the zoom) and how far it slides per board unit of camera travel */
const WALL_TILE = 260
/** the mascots stop bobbing above this zoom */
const BOB_MAX_ZOOM = 0.45
const WALL_PARALLAX = 0.07
const ROOM = 110
/** the 2x art is worth loading when board pixels per device pixel reach this */
const DETAIL_AT = 0.9
const FULL_AT = 0.36

function useStageSize(ref: RefObject<HTMLElement>): { w: number; h: number } | null {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const read = () => {
      const r = el.getBoundingClientRect()
      setSize((s) => (s && Math.abs(s.w - r.width) < 0.5 && Math.abs(s.h - r.height) < 0.5 ? s : { w: r.width, h: r.height }))
    }
    read()
    const ro = new ResizeObserver(read)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return size
}

export default function Wall({ sel, colourway, still, tourActive, reserve, onSelect, onSkip, onFitChange }: WallProps) {
  const stageRef = useRef<HTMLDivElement>(null)
  const paperRef = useRef<HTMLDivElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const twRef = useRef<ReactZoomPanPinchRef | null>(null)
  const size = useStageSize(stageRef)
  const speech = useSpeech()
  const store = useMemo(makeStore, [])

  const safe: Insets = useMemo(() => ({ left: reserve.left, right: reserve.right, top: reserve.top, bottom: reserve.bottom }), [reserve.left, reserve.right, reserve.top, reserve.bottom])
  const live = useRef({ size, safe, sel, still, tourActive })
  live.current = { size, safe, sel, still, tourActive }

  const [detail, setDetail] = useState(false)
  const [full, setFull] = useState(false)
  const [view, setView] = useState<Rect | null>(null)
  const [atFit, setAtFit] = useState(true)
  const atFitRef = useRef(true)
  // false while a selection flight is under way: the dim and the marker appear when the camera has landed (it is a lot cheaper, and it reads as "fly there, then circle it")
  const [landed, setLanded] = useState(true)

  // ---- camera targets -------------------------------------------------------------------------------------------------------
  const minScale = useMemo(() => {
    if (!size) return 0.1
    return scaleFor({ x: 0, y: 0, w: BOARD_W, h: BOARD_H }, size.w, size.h, safe, ROOM)
  }, [size, safe])

  const cameraFor = useCallback(
    (selection: Selection): Camera => {
      const { size: s, safe: sf } = live.current
      if (!s) return { scale: 0.1, x: 0, y: 0 }
      const min = scaleFor({ x: 0, y: 0, w: BOARD_W, h: BOARD_H }, s.w, s.h, sf, ROOM)
      const view = selectionView(selection)
      const whole = !selection.group && !selection.item
      const room = whole ? ROOM : Math.max(50, Math.max(view.w, view.h) * 0.06)
      const scale = clamp(scaleFor(view, s.w, s.h, sf, room), min, MAX_SCALE)
      return cameraAt(view.x + view.w / 2, view.y + view.h / 2, scale, s.w, s.h, sf)
    },
    [],
  )

  // ---- the flight ---------------------------------------------------------------------------------------------------------------
  const raf = useRef(0)
  const cancelFly = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current)
    raf.current = 0
  }, [])
  useEffect(() => cancelFly, [cancelFly]) // closing the world mid-flight stops the flight

  const flyTo = useCallback(
    (target: Camera, ms?: number) => {
      const tw = twRef.current
      const { size: s, safe: sf, still: reduced } = live.current
      if (!tw || !s) return
      cancelFly()
      const st = tw.instance.state
      if (reduced || ms === 0) {
        tw.setTransform(target.x, target.y, target.scale, 0)
        setLanded(true)
        return
      }
      const cur: Camera = { scale: st.scale, x: st.positionX, y: st.positionY }
      const c0 = centreOf(cur, s.w, s.h, sf)
      const c1 = centreOf(target, s.w, s.h, sf)
      const sw = s.w - sf.left - sf.right
      const path = flightPath([c0.cx, c0.cy, sw / cur.scale], [c1.cx, c1.cy, sw / target.scale])
      const duration = ms ?? clamp(560 + path.length * 90, 620, 860)
      const t0 = performance.now()
      const step = (now: number) => {
        const p = clamp((now - t0) / duration, 0, 1)
        if (p >= 1) {
          tw.setTransform(target.x, target.y, target.scale, 0)
          raf.current = 0
          setLanded(true)
          return
        }
        const [cx, cy, vw] = path.at(easeInOut(p))
        const cam = cameraAt(cx, cy, sw / vw, s.w, s.h, sf)
        tw.setTransform(cam.x, cam.y, cam.scale, 0)
        raf.current = requestAnimationFrame(step)
      }
      raf.current = requestAnimationFrame(step)
    },
    [cancelFly],
  )

  // after a drag, a pinch or a wheel has finished (and its momentum has run out) the camera eases back if it wandered off the board
  const settleTimer = useRef(0)
  const settle = useCallback(() => {
    window.clearTimeout(settleTimer.current)
    settleTimer.current = window.setTimeout(function again() {
      const tw = twRef.current
      const { size: s, safe: sf } = live.current
      if (!tw || !s || raf.current) return
      const inst = tw.instance
      if (inst.isPanning || inst.isPinching || inst.animation) {
        settleTimer.current = window.setTimeout(again, 180)
        return
      }
      const st = inst.state
      const cur: Camera = { scale: st.scale, x: st.positionX, y: st.positionY }
      // zoomed all the way out: the board goes back to the middle of the wall
      const fitCam = cameraFor({ group: null, item: null })
      if (cur.scale <= fitCam.scale * 1.05) {
        if (Math.abs(cur.x - fitCam.x) + Math.abs(cur.y - fitCam.y) + Math.abs(cur.scale - fitCam.scale) * 1000 > 1) flyTo(fitCam, 320)
        return
      }
      const { cx, cy } = centreOf(cur, s.w, s.h, sf)
      const vw = (s.w - sf.left - sf.right) / cur.scale
      const vh = (s.h - sf.top - sf.bottom) / cur.scale
      const nx = clampCentre(cx, vw, BOARD_W)
      const ny = clampCentre(cy, vh, BOARD_H)
      if (Math.abs(nx - cx) < 1 && Math.abs(ny - cy) < 1) return
      flyTo(cameraAt(nx, ny, cur.scale, s.w, s.h, sf), 320)
    }, 180)
  }, [flyTo, cameraFor])
  useEffect(() => () => window.clearTimeout(settleTimer.current), [])

  // true once the visitor has moved the camera by hand since the last time it was framed on a selection
  const moved = useRef(false)

  // fly to whatever is selected (instantly the first time)
  const first = useRef(true)
  useEffect(() => {
    if (!size || !twRef.current) return
    const cam = cameraFor(sel)
    if (first.current) {
      first.current = false
      twRef.current.setTransform(cam.x, cam.y, cam.scale, 0)
      return
    }
    moved.current = false
    setLanded(false)
    flyTo(cam)
    // size and reserve are deliberately not dependencies: a resize re-fits below instead of flying
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel.group, sel.item, !!size])

  // when the canvas changes size or the overlay UI changes its reserve: keep the framing
  const lastFrame = useRef<string>('')
  useEffect(() => {
    if (!size || !twRef.current) return
    const key = `${Math.round(size.w)}x${Math.round(size.h)}:${safe.top}:${safe.bottom}:${safe.left}:${safe.right}`
    const prev = lastFrame.current
    lastFrame.current = key
    if (!prev || prev === key) return
    // a new window size re-frames at once; a new reserve (the sheet or the tour docket opened) flies there, unless the visitor has
    // moved the camera by hand since the last framing: then only a view that fell below the fit is put back
    const sizeChanged = prev.split(':')[0] !== key.split(':')[0]
    if (!moved.current) flyTo(cameraFor(live.current.sel), sizeChanged ? 0 : undefined)
    else if (twRef.current.instance.state.scale < minScale) flyTo(cameraFor({ group: null, item: null }), 0)
  }, [size, safe, cameraFor, flyTo, minScale])

  // keyboard focus on a hotspot: bring it into view if it is not
  const ensureVisible = useCallback(
    (rect: Rect) => {
      const tw = twRef.current
      const { size: s, safe: sf } = live.current
      if (!tw || !s) return
      const { scale, positionX: x, positionY: y } = tw.instance.state
      const left = (sf.left - x) / scale - STAGE_PAD
      const top = (sf.top - y) / scale - STAGE_PAD
      const right = (s.w - sf.right - x) / scale - STAGE_PAD
      const bottom = (s.h - sf.bottom - y) / scale - STAGE_PAD
      const inside = rect.x >= left && rect.y >= top && rect.x + rect.w <= right && rect.y + rect.h <= bottom
      if (inside) return
      const min = scaleFor({ x: 0, y: 0, w: BOARD_W, h: BOARD_H }, s.w, s.h, sf, ROOM)
      const fits = scaleFor(rect, s.w, s.h, sf, Math.max(60, Math.max(rect.w, rect.h) * 0.08))
      const target = clamp(Math.min(scale, fits), min, MAX_SCALE)
      flyTo(cameraAt(rect.x + rect.w / 2, rect.y + rect.h / 2, target, s.w, s.h, sf), 420)
    },
    [flyTo],
  )

  // ---- drag or click? -----------------------------------------------------------------------------------------------------------
  const drag = useRef({ x: 0, y: 0, moved: false, down: false })
  const wasDrag = useCallback(() => drag.current.moved, [])

  // ---- listeners on the library's wrapper: wheel, double click / tap, keys, drag tracking ----------------------------------------------
  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!size || wrapper) return
    const el = twRef.current?.instance.wrapperComponent
    if (el) setWrapper(el)
  }, [size, wrapper])

  useEffect(() => {
    const el = wrapper
    if (!el) return
    const zoomAt = (factor: number, clientX: number, clientY: number, ms: number) => {
      const tw = twRef.current
      if (!tw) return
      const min = live.current.size ? scaleFor({ x: 0, y: 0, w: BOARD_W, h: BOARD_H }, live.current.size.w, live.current.size.h, live.current.safe, ROOM) : 0.1
      const next = clamp(tw.instance.state.scale * factor, min, MAX_SCALE)
      void tw.zoomToPoint(next, clientX, clientY, live.current.still ? 0 : ms, 'easeOut')
    }

    // wheel: any wheel zooms around the pointer (mouse notch ~ 16 %, trackpad pinch finer)
    let wheelTarget = 0
    let wheelAt = 0
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      cancelFly()
      moved.current = true
      const tw = twRef.current
      if (!tw) return
      let dy = e.deltaY
      if (e.deltaMode === 1) dy *= 16
      else if (e.deltaMode === 2) dy *= 400
      const k = e.ctrlKey ? 0.011 : 0.0016
      const now = performance.now()
      const base = now - wheelAt < 320 && wheelTarget ? wheelTarget : tw.instance.state.scale
      const min = live.current.size ? scaleFor({ x: 0, y: 0, w: BOARD_W, h: BOARD_H }, live.current.size.w, live.current.size.h, live.current.safe, ROOM) : 0.1
      wheelTarget = clamp(base * Math.exp(-dy * k), min, MAX_SCALE)
      wheelAt = now
      void tw.zoomToPoint(wheelTarget, e.clientX, e.clientY, live.current.still ? 0 : 130, 'easeOut')
    }

    const nearMax = () => (twRef.current?.instance.state.scale ?? 0) > MAX_SCALE * 0.8
    const onDouble = (e: MouseEvent) => {
      cancelFly()
      if (nearMax()) {
        const cam = cameraFor({ group: null, item: null })
        flyTo(cam, 420)
        return
      }
      zoomAt(2.2, e.clientX, e.clientY, 300)
    }

    // double tap (touch): the library's own detection is off, so count taps here
    let lastTap = { t: 0, x: 0, y: 0 }
    const onPointerDown = (e: PointerEvent) => {
      cancelFly()
      moved.current = true
      drag.current = { x: e.clientX, y: e.clientY, moved: false, down: true }
      // the library cancels mousedown (so a drag does not select text), which also cancels focus: take it back so the keys work
      if (!el.contains(document.activeElement)) el.focus({ preventScroll: true })
      if (e.pointerType === 'touch') {
        const now = performance.now()
        if (now - lastTap.t < 320 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 28) {
          lastTap = { t: 0, x: 0, y: 0 }
          onDouble(e as unknown as MouseEvent)
        } else lastTap = { t: now, x: e.clientX, y: e.clientY }
      }
    }
    const onPointerMove = (e: PointerEvent) => {
      const d = drag.current
      if (d.down && !d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6) d.moved = true
    }
    const onPointerUp = () => {
      drag.current.down = false
    }

    // keys: only while the canvas (or something inside it) has focus; Escape, [ and ] are left alone
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return
      if (e.key === 'Escape' || e.key === '[' || e.key === ']') return
      const { size: s, safe: sf, tourActive: touring } = live.current
      const tw = twRef.current
      if (!tw || !s) return
      const stepX = (s.w - sf.left - sf.right) * 0.2
      const stepY = (s.h - sf.top - sf.bottom) * 0.2
      const ms = live.current.still ? 0 : 170
      let handled = true
      // a key press takes the camera back from any flight under way (this must come before the "0" key starts its own flight)
      cancelFly()
      switch (e.key) {
        case 'ArrowLeft':
          if (touring) return
          void tw.panBy(stepX, 0, ms, 'easeOut')
          break
        case 'ArrowRight':
          if (touring) return
          void tw.panBy(-stepX, 0, ms, 'easeOut')
          break
        case 'ArrowUp':
          if (touring) return
          void tw.panBy(0, stepY, ms, 'easeOut')
          break
        case 'ArrowDown':
          if (touring) return
          void tw.panBy(0, -stepY, ms, 'easeOut')
          break
        case '+':
        case '=': {
          const r = el.getBoundingClientRect()
          zoomAt(1.4, r.left + sf.left + (s.w - sf.left - sf.right) / 2, r.top + sf.top + (s.h - sf.top - sf.bottom) / 2, 200)
          break
        }
        case '-':
        case '_': {
          const r = el.getBoundingClientRect()
          zoomAt(1 / 1.4, r.left + sf.left + (s.w - sf.left - sf.right) / 2, r.top + sf.top + (s.h - sf.top - sf.bottom) / 2, 200)
          break
        }
        case '0':
          flyTo(cameraFor({ group: null, item: null }), 420)
          onSelect({ group: null, item: null })
          moved.current = false
          break
        default:
          handled = false
      }
      if (handled) {
        if (e.key !== '0') moved.current = true
        e.preventDefault()
        e.stopPropagation()
      }
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('dblclick', onDouble)
    el.addEventListener('pointerdown', onPointerDown, true)
    window.addEventListener('pointermove', onPointerMove, true)
    window.addEventListener('pointerup', onPointerUp, true)
    window.addEventListener('pointercancel', onPointerUp, true)
    el.addEventListener('keydown', onKey)
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('dblclick', onDouble)
      el.removeEventListener('pointerdown', onPointerDown, true)
      window.removeEventListener('pointermove', onPointerMove, true)
      window.removeEventListener('pointerup', onPointerUp, true)
      window.removeEventListener('pointercancel', onPointerUp, true)
      el.removeEventListener('keydown', onKey)
    }
  }, [wrapper, cancelFly, cameraFor, flyTo, onSelect])

  // ---- follow the camera: CSS variables for the wall and the counter-scaled marks, plus the few things React needs to know -----------
  useEffect(() => {
    if (!wrapper) return
    const inst = twRef.current?.instance
    if (!inst) return
    let pending = 0
    let settle = 0
    const apply = () => {
      pending = 0
      const { scale, positionX: x, positionY: y } = inst.state
      const paper = paperRef.current
      const s0 = live.current.size
      if (paper && s0) {
        // the wall is far behind the board: it slides at a small fraction of the camera centre (board units), whatever the zoom
        const cxb = (s0.w / 2 - x) / scale
        const cyb = (s0.h / 2 - y) / scale
        const ox = (((-cxb * WALL_PARALLAX) % WALL_TILE) + WALL_TILE) % WALL_TILE
        const oy = (((-cyb * WALL_PARALLAX) % WALL_TILE) + WALL_TILE) % WALL_TILE
        paper.style.transform = `translate3d(${ox.toFixed(1)}px, ${oy.toFixed(1)}px, 0)`
      }
      const board = boardRef.current
      if (board) {
        // the idle bob only runs while the cast is in view and small (the whole-board overview): zoomed in, a bobbing character would repaint big areas for nothing
        const top = (0 - y) / scale
        const bob = scale <= BOB_MAX_ZOOM && top < 1500 ? 'on' : 'off'
        if (board.dataset.bob !== bob) board.dataset.bob = bob
        board.style.setProperty('--z', String(scale))
        // speech bubbles keep a fixed size on screen, a little smaller while the characters are tiny (full size from about 50 % zoom)
        board.style.setProperty('--bz', ((Math.min(1, 0.7 + Math.max(0, scale - 0.16) * 0.9)) / scale).toFixed(4))
      }
      store.scale = scale
      store.listeners.forEach((l) => l())
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const ppu = scale * dpr
      setDetail((d) => (d === ppu >= DETAIL_AT ? d : ppu >= DETAIL_AT))
      if (ppu >= FULL_AT) setFull(true)
      const fitS = live.current.size ? scaleFor({ x: 0, y: 0, w: BOARD_W, h: BOARD_H }, live.current.size.w, live.current.size.h, live.current.safe, ROOM) : 0
      const nowFit = scale <= fitS * 1.04
      if (nowFit !== atFitRef.current) {
        atFitRef.current = nowFit
        setAtFit(nowFit)
        onFitChange?.(nowFit)
      }
      window.clearTimeout(settle)
      settle = window.setTimeout(() => {
        const s = live.current.size
        if (!s) return
        const sc = inst.state.scale
        const r = (v: number) => Math.round(v / 40) * 40
        const nx = r((0 - inst.state.positionX) / sc - STAGE_PAD)
        const ny = r((0 - inst.state.positionY) / sc - STAGE_PAD)
        const nw = r(s.w / sc)
        const nh = r(s.h / sc)
        setView((v) => (v && v.x === nx && v.y === ny && v.w === nw && v.h === nh ? v : { x: nx, y: ny, w: nw, h: nh }))
      }, 120)
    }
    const schedule = () => {
      if (!pending) pending = requestAnimationFrame(apply)
    }
    apply()
    const off = inst.onChange(schedule)
    return () => {
      off()
      cancelAnimationFrame(pending)
      window.clearTimeout(settle)
    }
  }, [wrapper, store, onFitChange])

  // the full-size art arrives on its own after a moment even if nobody zooms
  useEffect(() => {
    const t = window.setTimeout(() => setFull(true), 2600)
    return () => window.clearTimeout(t)
  }, [])

  // the panel picked a character: let the one on the board say hello too
  const lastMascot = useRef<MascotId | null>(null)
  useEffect(() => {
    const id = isMascotId(sel.item) ? sel.item : null
    if (id && id !== lastMascot.current && !speech.active[id]) speech.trigger(id)
    lastMascot.current = id
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel.item])

  // ---- controls -------------------------------------------------------------------------------------------------------------------
  const fit = useCallback(() => {
    cancelFly()
    moved.current = false
    flyTo(cameraFor({ group: null, item: null }), 460)
    onSelect({ group: null, item: null })
  }, [cancelFly, cameraFor, flyTo, onSelect])

  const zoomBy = useCallback(
    (factor: number) => {
      const tw = twRef.current
      const wrap = tw?.instance.wrapperComponent
      const { size: s, safe: sf } = live.current
      if (!tw || !wrap || !s) return
      cancelFly()
      const r = wrap.getBoundingClientRect()
      const min = scaleFor({ x: 0, y: 0, w: BOARD_W, h: BOARD_H }, s.w, s.h, sf, ROOM)
      const next = clamp(tw.instance.state.scale * factor, min, MAX_SCALE)
      void tw.zoomToPoint(next, r.left + sf.left + (s.w - sf.left - sf.right) / 2, r.top + sf.top + (s.h - sf.top - sf.bottom) / 2, live.current.still ? 0 : 240, 'easeOut')
    },
    [cancelFly],
  )

  const initial = useMemo(() => (size ? cameraFor(sel) : { scale: 0.1, x: 0, y: 0 }), [size ? 1 : 0]) // eslint-disable-line react-hooks/exhaustive-deps

  const said = speech.said ? MASCOT_COPY[speech.said.id] : null

  return (
    <div className="w-concept-brand-stage" ref={stageRef}>
      <div className="w-concept-brand-wallbg" aria-hidden="true">
        <div
          className="w-concept-brand-wallpaper"
          ref={paperRef}
          style={{ '--cb-wall': `url(${IMG.wallTile})`, '--cb-tile': `${WALL_TILE}px` } as CSSProperties}
        />
      </div>
      <button type="button" className="w-concept-brand-skiplink" onClick={onSkip}>
        Skip the tiles, go to the details
      </button>
      {size && (
        <TransformWrapper
          onInit={(r) => {
            twRef.current = r
          }}
          initialScale={initial.scale}
          initialPositionX={initial.x}
          initialPositionY={initial.y}
          minScale={minScale}
          maxScale={MAX_SCALE}
          limitToBounds={false}
          smooth
          onPanningStop={settle}
          onZoomStop={settle}
          onPinchStop={settle}
          wheel={{ disabled: true }}
          doubleClick={{ disabled: true }}
          panning={{ velocityDisabled: still }}
          pinch={{ step: 4 }}
          velocityAnimation={{ sensitivityMouse: 0.9, sensitivityTouch: 1.1, animationTime: 380, maxAnimationTime: 900 }}
        >
          <TransformComponent
            wrapperClass="w-concept-brand-canvas"
            contentClass="w-concept-brand-content"
            wrapperStyle={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'clip', touchAction: 'none' }}
            contentStyle={{ width: STAGE_W, height: STAGE_H, display: 'block' }}
            wrapperProps={{
              tabIndex: 0,
              role: 'group',
              'aria-label': 'Gotet brand board. A pan and zoom canvas with the board hung on a wall.',
              'aria-describedby': 'w-concept-brand-keys',
              'aria-roledescription': 'canvas',
            }}
          >
            <Board
              ref={boardRef}
              sel={sel}
              landed={landed}
              colourway={colourway}
              still={still}
              detail={detail}
              view={view}
              full={full}
              speech={speech}
              chosen={isMascotId(sel.item) ? sel.item : null}
              onSelect={onSelect}
              onEnsureVisible={ensureVisible}
              wasDrag={wasDrag}
              style={{ left: STAGE_PAD, top: STAGE_PAD }}
            />
          </TransformComponent>
        </TransformWrapper>
      )}
      <p id="w-concept-brand-keys" className="w-concept-brand-sr">
        Drag to pan. Scroll or pinch to zoom. With the board focused, arrow keys pan, plus and minus zoom, and 0 fits the whole board. Every tile is also a button you can tab to.
      </p>
      <p className="w-concept-brand-sr" role="status" aria-live="polite">
        {said ? `${said.name} says ${said.catch} ${said.catchGloss}` : ''}
      </p>
      <Controls store={store} atFit={atFit} onFit={fit} onIn={() => zoomBy(1.5)} onOut={() => zoomBy(1 / 1.5)} />
    </div>
  )
}
