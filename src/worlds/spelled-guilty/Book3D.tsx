// The paperback as a CSS-3D object: front cover, back cover, spine, three paper edges. It turns with the pointer (a small tilt
// around its resting pose), with a drag (any angle, back cover included), with the Front / Spine / Back tabs and with the
// left / right arrow keys when it has focus. Click or Enter opens the case. Nothing here loops: it only moves when somebody moves it.
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { TabButton } from '@/components/primitives'
import { asset } from '@/lib/asset'
import { SG } from './copy'
import { BASE, COVER } from './data'
import './sg-room.css'

type Pose = 'front' | 'spine' | 'back'

/** resting angles (deg, rotateY): positive turns the spine towards the viewer */
const POSE: Record<Pose, number> = { front: 16, spine: 80, back: 196 }
const DEG = Math.PI / 180

/** the angle equal to `pose` (mod 360) that is nearest to where the book is now: the shortest way round */
const nearest = (now: number, pose: number): number => pose + Math.round((now - pose) / 360) * 360

interface Book3DProps {
  /** reduced / paused motion: no spring, no pointer tilt, no swing-in */
  still: boolean
  /** the element whose pointer position tilts the book (the poster) */
  hoverRoot: RefObject<HTMLElement>
  stageRef: RefObject<HTMLDivElement>
  onOpen: () => void
}

export default function Book3D({ still, hoverRoot, stageRef, onOpen }: Book3DProps) {
  const baseY = useMotionValue(still ? POSE.front : -34)
  const hoverY = useMotionValue(0)
  const hoverX = useMotionValue(0)
  const springY = useSpring(baseY, { stiffness: 78, damping: 15, mass: 0.95 })
  const springHoverY = useSpring(hoverY, { stiffness: 110, damping: 19 })
  const springHoverX = useSpring(hoverX, { stiffness: 110, damping: 19 })
  const rawY = useTransform([baseY, hoverY], ([a, b]) => (a as number) + (b as number))
  const smoothY = useTransform([springY, springHoverY], ([a, b]) => (a as number) + (b as number))
  const ry = still ? rawY : smoothY
  const rx = still ? hoverX : springHoverX
  const shadowX = useTransform(ry, (a) => -Math.sin(a * DEG) * 46)
  const shadowScale = useTransform(ry, (a) => 0.62 + 0.38 * Math.abs(Math.cos(a * DEG)))
  const sheen = useTransform(ry, (a) => `${Math.sin(a * DEG) * 70}%`)
  const spineShade = useTransform(ry, (a) => {
    const t = Math.min(1, Math.max(0, Math.sin(a * DEG)))
    return 0.5 - 0.42 * t
  })

  const [pose, setPose] = useState<Pose | null>('front')
  const [dragging, setDragging] = useState(false)
  const drag = useRef<{ id: number; x: number; from: number; moved: number } | null>(null)

  // the swing-in: the book arrives from the side and settles on its resting pose
  useEffect(() => {
    if (!still) baseY.set(POSE.front)
  }, [still, baseY])

  // the pointer tilts the book a little around its resting pose (only for a fine pointer, never while still)
  useEffect(() => {
    const root = hoverRoot.current
    const stage = stageRef.current
    if (!root || !stage || still) {
      hoverY.set(0)
      hoverX.set(0)
      return
    }
    const onMove = (event: globalThis.PointerEvent) => {
      if (event.pointerType === 'touch' || drag.current) return
      const r = stage.getBoundingClientRect()
      const nx = Math.max(-1, Math.min(1, (event.clientX - (r.left + r.width / 2)) / (window.innerWidth * 0.5)))
      const ny = Math.max(-1, Math.min(1, (event.clientY - (r.top + r.height / 2)) / (window.innerHeight * 0.5)))
      hoverY.set(nx * 15)
      hoverX.set(-ny * 7)
    }
    const onLeave = () => {
      hoverY.set(0)
      hoverX.set(0)
    }
    root.addEventListener('pointermove', onMove, { passive: true })
    root.addEventListener('pointerleave', onLeave)
    return () => {
      root.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerleave', onLeave)
    }
  }, [hoverRoot, stageRef, still, hoverX, hoverY])

  const goPose = (next: Pose): void => {
    baseY.set(nearest(baseY.get(), POSE[next]))
    setPose(next)
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>): void => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { id: event.pointerId, x: event.clientX, from: baseY.get(), moved: 0 }
    setDragging(true)
  }
  const onPointerMove = (event: PointerEvent<HTMLDivElement>): void => {
    const d = drag.current
    if (!d || d.id !== event.pointerId) return
    const dx = event.clientX - d.x
    d.moved = Math.max(d.moved, Math.abs(dx))
    if (d.moved > 4) {
      baseY.set(d.from + dx * 0.55)
      setPose(null)
    }
  }
  const endDrag = (event: PointerEvent<HTMLDivElement>): void => {
    const d = drag.current
    if (!d || d.id !== event.pointerId) return
    drag.current = null
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    if (d.moved <= 4 && event.type === 'pointerup') onOpen()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.altKey || event.ctrlKey || event.metaKey) return
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault()
      baseY.set(baseY.get() + (event.key === 'ArrowRight' ? 14 : -14) * (event.shiftKey ? 3 : 1))
      setPose(null)
    } else if (event.key === 'Home') {
      event.preventDefault()
      goPose('front')
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onOpen()
    }
  }

  const src = (file: string): string => asset(`${BASE}/${file}`)
  const heroAttrs = { fetchpriority: 'high' } as Record<string, string>

  return (
    <div className="w-sg-book-wrap">
      <div
        ref={stageRef}
        className="w-sg-stage"
        data-dragging={dragging ? '' : undefined}
        data-cursor="Drag"
        role="group"
        aria-roledescription="3D book"
        aria-label={SG.poster.stage}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
      >
        <motion.span className="w-sg-ground" aria-hidden="true" style={{ x: shadowX, scaleX: shadowScale }} />
        <motion.div className="w-sg-orbit" style={{ rotateY: ry, rotateX: rx }}>
          <div className="w-sg-book" aria-hidden="false">
            <div className="w-sg-face w-sg-face--front">
              <img src={src(COVER.front.file)} alt={SG.poster.frontAlt} width={COVER.front.w} height={COVER.front.h} decoding="async" draggable={false} {...heroAttrs} />
              <motion.span className="w-sg-sheen" aria-hidden="true" style={{ x: sheen }} />
            </div>
            <div className="w-sg-face w-sg-face--back">
              <img src={src(COVER.back.file)} alt="" width={COVER.back.w} height={COVER.back.h} decoding="async" draggable={false} />
            </div>
            <div className="w-sg-face w-sg-face--spine">
              <img src={src(COVER.spine.file)} alt="" width={COVER.spine.w} height={COVER.spine.h} decoding="async" draggable={false} />
              <motion.span className="w-sg-shade" aria-hidden="true" style={{ opacity: spineShade }} />
            </div>
            <div className="w-sg-face w-sg-face--edge" />
            <div className="w-sg-face w-sg-face--top" />
            <div className="w-sg-face w-sg-face--bottom" />
          </div>
        </motion.div>
      </div>

      <div className="w-sg-poses" role="group" aria-label={SG.poster.turn}>
        {(['front', 'spine', 'back'] as const).map((p) => (
          <TabButton key={p} size="sm" tone="cream" selected={pose === p} aria-pressed={pose === p} onClick={() => goPose(p)}>
            {SG.poster.poses[p]}
          </TabButton>
        ))}
      </div>
    </div>
  )
}
