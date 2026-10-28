// One print on the wall: a sheet of paper that is held by tape, a pin or a paper clip, with a hand-written note on its
// margin. It is a real <button>: drag it (framer-motion drag with momentum and a soft bounce at the edges), or Tab to it and
//   arrows nudge it by 12px (Shift: 48px), R turns it, Enter / Space opens the close-up, double-click or tap does too.
// The wall owns the poses; this component owns its motion values and exposes them through a handle.
import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { animate, motion, useMotionValue, useSpring, useTransform, useVelocity } from 'framer-motion'
import type { PrintDef } from './data'
import { PrintFace } from './PrintFace'
import { range, type Dims, type Pose } from './layout'

export interface PrintHandle {
  /** where the print is (or is heading), in wall pixels */
  pose(): Pose
  /** glide, or jump, to a pose; `enter` drops it onto the wall from above */
  moveTo(pose: Pose, opts?: { delay?: number; instant?: boolean; enter?: boolean }): void
  focus(): void
}

interface PrintProps {
  def: PrintDef
  /** position in the reading order, 1-based */
  n: number
  total: number
  dims: Dims
  wall: { w: number; h: number }
  z: number
  notes: boolean
  still: boolean
  /** set only on the first render of the wall: where this print is put down when it first appears */
  home?: Pose
  /** seconds before the print drops onto the wall */
  introDelay: number
  describedBy: string
  /** the print is on the first screen: its picture loads at once */
  eager: boolean
  /** delay (ms) before the marks of the note draw themselves */
  drawDelay: number
  onRaise: (id: PrintDef['id']) => void
  onOpen: (id: PrintDef['id']) => void
  /** the visitor moved or turned this print (the wall is no longer in one of its named arrangements) */
  onMoved: (id: PrintDef['id']) => void
  /** the print came to rest after a drag or a nudge */
  onSettled: (id: PrintDef['id'], pose: Pose) => void
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const wrapTurn = (deg: number) => ((((deg + 36) % 72) + 72) % 72) - 36

export const Print = forwardRef<PrintHandle, PrintProps>(function Print(props, ref) {
  const { def, n, total, dims, wall, z, notes, still, home, introDelay, describedBy, eager, drawDelay, onRaise, onOpen, onMoved, onSettled } = props
  const el = useRef<HTMLButtonElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const base = useMotionValue(0)
  const grow = useMotionValue(1)
  const lift = useMotionValue(1)
  const fade = useMotionValue(1)
  const stillRef = useRef(still)
  stillRef.current = still

  // the print sways with the speed it is dragged at, then settles (never under reduced / paused motion)
  const vx = useVelocity(x)
  const swayTarget = useTransform(vx, (v) => (stillRef.current ? 0 : clamp(v / 95, -5.5, 5.5)))
  const sway = useSpring(swayTarget, { stiffness: 190, damping: 13, mass: 0.7 })
  const rotate = useTransform([base, sway], ([b, s]) => (b as number) + (s as number))
  const scale = useTransform([grow, lift], ([a, b]) => (a as number) * (b as number))

  const target = useRef<Pose>({ x: 0, y: 0, rot: 0, scale: 1 })
  const playing = useRef<Array<{ stop: () => void }>>([])
  // the fade-in of the first appearance is kept apart from the glides: a Shuffle, a nudge or a pointer-down during the first
  // moments stops the glides, and must never leave a print stuck invisible
  const arriving = useRef<{ stop: () => void } | null>(null)
  // where the last programmed move (the entrance, Tidy up, Shuffle) is taking the print, until a hand or a key takes over.
  // framer stops a print's glide the moment a pointer goes down on it; a plain press (no drag) lets it finish the trip.
  const heading = useRef<Pose | null>(null)
  // a pointer is down on this print (the hover lift stays out of the way of the drag's own lift)
  const held = useRef(false)
  const hover = useRef<{ stop: () => void } | null>(null)
  const moved = useRef(false)
  const pointerKind = useRef('mouse')
  const settleTimer = useRef<number | undefined>(undefined)
  const [dragging, setDragging] = useState(false)
  // the size the print rests at (1, or smaller when it has been squared up into a row): the drag limits follow it
  const [resting, setResting] = useState(1)

  const stopAll = () => {
    playing.current.forEach((c) => c.stop())
    playing.current = []
    hover.current?.stop()
    hover.current = null
  }

  const free = range(dims, resting, wall.w, wall.h)

  const readPose = (): Pose => ({ x: x.get(), y: y.get(), rot: base.get(), scale: grow.get() })

  const moveTo: PrintHandle['moveTo'] = (pose, opts = {}) => {
    const { delay = 0, instant = false, enter = false } = opts
    const sc = pose.scale ?? 1
    stopAll()
    window.clearTimeout(settleTimer.current)
    target.current = { ...pose, scale: sc }
    setResting(sc)
    if (instant || stillRef.current) {
      arriving.current?.stop()
      arriving.current = null
      heading.current = null
      x.set(pose.x)
      y.set(pose.y)
      base.set(pose.rot)
      grow.set(sc)
      lift.set(1)
      fade.set(1)
      return
    }
    heading.current = { ...pose, scale: sc }
    // a lift left half-way by an interrupted drag settles back to flat
    if (lift.get() !== 1) playing.current.push(animate(lift, 1, { type: 'spring', stiffness: 260, damping: 20 }))
    if (enter) {
      x.set(pose.x + (pose.rot > 0 ? 26 : -26))
      y.set(pose.y - 110)
      base.set(pose.rot + (pose.rot > 0 ? 9 : -9))
      grow.set(sc)
      fade.set(0)
      arriving.current?.stop()
      arriving.current = animate(fade, 1, { duration: 0.22, delay })
    }
    const drop = { type: 'spring' as const, stiffness: 150, damping: 17, mass: 1, delay }
    playing.current.push(
      animate(x, pose.x, drop),
      animate(y, pose.y, drop),
      animate(base, pose.rot, { ...drop, stiffness: 110, damping: 13 }),
      animate(grow, sc, { type: 'spring', stiffness: 130, damping: 18, mass: 1, delay }),
    )
  }

  useImperativeHandle(ref, () => ({
    pose: () => ({ ...target.current }),
    focus: () => el.current?.focus({ preventScroll: true }),
    moveTo,
  }))

  // First appearance: the print is put down at its home pose (dropped onto the wall unless motion is still). Done here, in a
  // layout effect of the print itself, so there is no frame at 0,0 and a development double-mount simply starts it again.
  useLayoutEffect(() => {
    if (home) moveTo(home, stillRef.current ? { instant: true } : { enter: true, delay: introDelay })
    return () => {
      window.clearTimeout(settleTimer.current)
      stopAll()
      arriving.current?.stop()
      arriving.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const settleSoon = () => {
    window.clearTimeout(settleTimer.current)
    settleTimer.current = window.setTimeout(() => onSettled(def.id, { ...target.current }), 260)
  }

  /** finish a programmed move that a press interrupted (the print stayed where the pointer found it) */
  const resume = () => {
    const h = heading.current
    if (!h || stillRef.current) return
    if (Math.hypot(x.get() - h.x, y.get() - h.y) > 1 || Math.abs(base.get() - h.rot) > 0.3 || Math.abs(grow.get() - (h.scale ?? 1)) > 0.004) moveTo(h)
  }

  const nudge = (dx: number, dy: number) => {
    stopAll()
    heading.current = null
    const r = range(dims, target.current.scale ?? 1, wall.w, wall.h)
    const next = { x: clamp(target.current.x + dx, r.minX, r.maxX), y: clamp(target.current.y + dy, r.minY, r.maxY) }
    target.current = { ...target.current, ...next }
    if (stillRef.current) {
      x.set(next.x)
      y.set(next.y)
    } else {
      const sp = { type: 'spring' as const, stiffness: 560, damping: 44, mass: 0.7 }
      playing.current.push(animate(x, next.x, sp), animate(y, next.y, sp))
      // a nudge that interrupts the entrance or a Tidy / Shuffle glide also lets the turn and the size arrive
      const t = target.current
      if (Math.abs(base.get() - t.rot) > 0.3) playing.current.push(animate(base, t.rot, { type: 'spring', stiffness: 220, damping: 18, mass: 0.7 }))
      if (Math.abs(grow.get() - (t.scale ?? 1)) > 0.004) playing.current.push(animate(grow, t.scale ?? 1, { type: 'spring', stiffness: 200, damping: 20, mass: 0.7 }))
    }
    onMoved(def.id)
    settleSoon()
  }

  const turn = (dir: 1 | -1) => {
    heading.current = null
    const rot = wrapTurn(target.current.rot + 6 * dir)
    target.current = { ...target.current, rot }
    if (stillRef.current) base.set(rot)
    else playing.current.push(animate(base, rot, { type: 'spring', stiffness: 260, damping: 18, mass: 0.7 }))
    onMoved(def.id)
    settleSoon()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return
    const step = event.shiftKey ? 48 : 12
    const move: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    }
    const hit = move[event.key]
    if (hit) {
      event.preventDefault()
      nudge(hit[0], hit[1])
      return
    }
    if (event.key === 'r' || event.key === 'R') {
      event.preventDefault()
      turn(event.shiftKey ? -1 : 1)
    }
  }

  const noteId = `w-procreate-note-${def.id}`
  const vars = {
    '--pw': `${dims.w}px`,
    width: dims.w,
    height: dims.h,
    x,
    y,
    rotate,
    scale,
    opacity: fade,
    zIndex: z,
  } as unknown as CSSProperties

  return (
    <motion.button
      ref={el}
      type="button"
      className="w-procreate-print"
      data-id={def.id}
      data-stock={def.stock}
      data-dragging={dragging ? '' : undefined}
      data-cursor="Drag"
      style={vars}
      aria-label={`${def.alt} Print ${n} of ${total}.`}
      aria-describedby={notes ? `${noteId} ${describedBy}` : describedBy}
      drag
      dragConstraints={{ left: free.minX, top: free.minY, right: free.maxX, bottom: free.maxY }}
      dragElastic={still ? 0 : 0.12}
      dragMomentum={!still}
      dragTransition={{ power: 0.17, timeConstant: 300, bounceStiffness: 420, bounceDamping: 24 }}
      onPointerEnter={(event) => {
        // a mouse hovering over a print lifts it a hair off the wall (never for touch, never under reduced / paused motion)
        if (event.pointerType !== 'mouse' || stillRef.current || held.current) return
        hover.current?.stop()
        hover.current = animate(lift, 1.02, { type: 'spring', stiffness: 380, damping: 26 })
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== 'mouse' || stillRef.current || held.current) return
        hover.current?.stop()
        hover.current = animate(lift, 1, { type: 'spring', stiffness: 300, damping: 24 })
      }}
      onPointerDown={(event) => {
        pointerKind.current = event.pointerType || 'mouse'
        moved.current = false
        held.current = true
        // the press ends wherever the pointer is let go (a drag is captured by the window, so the button may never see the release)
        const release = () => {
          held.current = false
          window.removeEventListener('pointerup', release)
          window.removeEventListener('pointercancel', release)
        }
        window.addEventListener('pointerup', release)
        window.addEventListener('pointercancel', release)
        onRaise(def.id)
      }}
      onDragStart={() => {
        moved.current = true
        heading.current = null
        hover.current?.stop()
        hover.current = null
        window.clearTimeout(settleTimer.current)
        setDragging(true)
        onMoved(def.id)
        if (!stillRef.current) playing.current.push(animate(lift, 1.045, { type: 'spring', stiffness: 380, damping: 24 }))
      }}
      onDragEnd={() => {
        setDragging(false)
        held.current = false
        if (!stillRef.current) playing.current.push(animate(lift, 1, { type: 'spring', stiffness: 260, damping: 20 }))
      }}
      onDragTransitionEnd={() => {
        target.current = readPose()
        onSettled(def.id, { ...target.current })
      }}
      onFocus={() => onRaise(def.id)}
      onKeyDown={onKeyDown}
      onClick={(event) => {
        const fromKeyboard = event.detail === 0
        // the click that ends a drag is not a request to open (a touch drag fires no click at all, so `moved` is also reset on
        // the next pointer down); a keyboard activation always opens
        if (!fromKeyboard && moved.current) {
          moved.current = false
          return
        }
        moved.current = false
        // a plain press that caught a print on its way somewhere lets it finish the trip
        if (!fromKeyboard) resume()
        // keyboard and touch / pen open on a plain press; a mouse waits for the double-click
        if (fromKeyboard || pointerKind.current !== 'mouse') onOpen(def.id)
      }}
      onDoubleClick={() => {
        if (!moved.current) onOpen(def.id)
      }}
    >
      <PrintFace def={def} dims={dims} eager={eager} drawDelay={drawDelay} noteId={noteId} />
    </motion.button>
  )
})
