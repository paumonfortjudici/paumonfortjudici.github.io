// A carousel as a ring of tags: every slide is a tag threaded on the same eyelet, fanned out like a deck of swatches.
// Flipping swings the top tag around the ring to the back of the deck (previous swings the last one back to the front).
//   - Next / Previous tabs; ArrowLeft / ArrowRight / Home / End while focus is on either tab (or the clip tab); a swipe or drag on the tag itself
//     (the group is not a tab stop of its own: three stops per carousel would be one too many)
//   - the drag turns the tag around its eyelet (rotation follows the pointer); past a threshold (or a flick) it flips, else it springs back
//   - one MotionValue per tag (rotate + y), driven imperatively: the same value carries the drag, the flight and the rest pose
//   - only the top tag, the next one and the previous one hold a picture; the clip of a video slide mounts on the top tag only
//   - reduced motion / "Pause motion": poses are set, not animated
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { animate, motion, motionValue, type AnimationPlaybackControls } from 'framer-motion'
import { Stamp, TabButton } from '../../components/primitives'
import { asset } from '../../lib/asset'
import { useWorld } from '../WorldContext'
import Clip from './Clip'
import { stampText, longDate } from './format'
import { POSTS_DIR, type Post } from './posts'

const FAN = 2.6 // degrees between neighbouring tags in the deck
const OUT = 34 // how far the flying tag swings out
const TILT = 0.7 // the whole deck hangs a little off true
const SPRING = { type: 'spring', stiffness: 230, damping: 22, mass: 0.8 } as const
const FLIGHT_MS = 640
const DROP_MS = 270

interface Flight {
  idx: number
  dir: 1 | -1
  /** 'out': still in front of the deck; 'in': has swung round behind it */
  phase: 'out' | 'in'
}

interface RingProps {
  post: Post
  /** which side of the tag the eyelet is on: 'right' for tags left of the thread, 'left' for tags right of it */
  eyelet: 'right' | 'left'
}

const restRot = (s: number, k: number) => s * (TILT + FAN * Math.min(k, 2))
const restY = (k: number) => Math.min(k, 2) * 4

export default function Ring({ post, eyelet }: RingProps) {
  const { reduced } = useWorld()
  const n = post.slides.length
  const s = eyelet === 'right' ? 1 : -1
  const [index, setIndex] = useState(0)
  const indexRef = useRef(0)
  const [flight, setFlight] = useState<Flight | null>(null)
  const timers = useRef<number[]>([])
  const controls = useRef<Array<AnimationPlaybackControls[] | undefined>>([])
  const rots = useMemo(() => post.slides.map((_, i) => motionValue(restRot(s, i))), [post.slides, s])
  const ys = useMemo(() => post.slides.map((_, i) => motionValue(restY(i))), [post.slides])

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t))
      controls.current.forEach((c) => c?.forEach((x) => x.stop()))
    },
    [],
  )

  // poses: whenever the front card or the flight changes, every tag goes to its place (the flying one by an arc)
  useEffect(() => {
    post.slides.forEach((_, i) => {
      const k = (i - index + n) % n
      controls.current[i]?.forEach((x) => x.stop())
      const flying = flight && flight.idx === i
      if (reduced) {
        rots[i].set(restRot(s, k))
        ys[i].set(restY(k))
        return
      }
      if (flying) {
        const back = restRot(s, flight.dir === 1 ? Math.min(n - 1, 2) : 0)
        const backY = restY(flight.dir === 1 ? Math.min(n - 1, 2) : 0)
        const opts = { duration: FLIGHT_MS / 1000, times: [0, 0.42, 1], ease: ['easeOut', 'easeInOut'] as ['easeOut', 'easeInOut'] }
        controls.current[i] = [animate(rots[i], [rots[i].get(), s * OUT, back], opts), animate(ys[i], [ys[i].get(), 30, backY], opts)]
      } else {
        controls.current[i] = [animate(rots[i], restRot(s, k), SPRING), animate(ys[i], restY(k), SPRING)]
      }
    })
  }, [index, flight, n, post.slides, reduced, rots, s, ys])

  const move = useCallback(
    (dir: 1 | -1) => {
      const cur = indexRef.current
      const nxt = (cur + dir + n) % n
      indexRef.current = nxt
      timers.current.forEach((t) => window.clearTimeout(t))
      timers.current = []
      setFlight({ idx: dir === 1 ? cur : nxt, dir, phase: 'out' })
      timers.current.push(window.setTimeout(() => setFlight((f) => (f ? { ...f, phase: 'in' } : f)), DROP_MS))
      timers.current.push(window.setTimeout(() => setFlight(null), FLIGHT_MS + 40))
      setIndex(nxt)
    },
    [n],
  )

  const jump = useCallback(
    (to: number) => {
      if (to === indexRef.current) return
      timers.current.forEach((t) => window.clearTimeout(t))
      timers.current = []
      setFlight(null)
      indexRef.current = to
      setIndex(to)
    },
    [],
  )

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return
    if (event.key === 'ArrowRight') move(1)
    else if (event.key === 'ArrowLeft') move(-1)
    else if (event.key === 'Home') jump(0)
    else if (event.key === 'End') jump(n - 1)
    else return
    event.preventDefault()
  }

  // swipe / drag: the top tag turns around the eyelet with the pointer
  const topIdx = index
  const onPan = (_: unknown, info: { offset: { x: number } }) => {
    if (reduced) return
    controls.current[topIdx]?.forEach((x) => x.stop())
    rots[topIdx].set(restRot(s, 0) + Math.max(-OUT, Math.min(OUT, -info.offset.x * 0.12)))
  }
  const onPanEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const outward = -s * info.offset.x
    const fling = -s * info.velocity.x
    if (outward > 64 || fling > 520) move(1)
    else if (outward < -64 || fling < -520) move(-1)
    else if (!reduced) {
      controls.current[topIdx]?.forEach((x) => x.stop())
      controls.current[topIdx] = [animate(rots[topIdx], restRot(s, 0), SPRING)]
    }
  }

  const current = post.slides[index]
  const onVideo = current.kind === 'video'
  const date = stampText(post.date)

  return (
    <div
      className="w-fortyfour-lab-media"
      data-kind="carousel"
      role="group"
      aria-roledescription="carousel"
      aria-label={`${post.title}, ${longDate(post.date)}: ${n} slides`}
      onKeyDown={onKeyDown}
    >
      <span className="w-fortyfour-lab-anchor" data-ffl-anchor="knot" aria-hidden="true" />
      <div className="w-fortyfour-lab-stack">
        {post.slides.map((slide, i) => {
          const k = (i - index + n) % n
          const flying = flight && flight.idx === i
          if (!(k <= 2 || k === n - 1 || flying)) return null
          const top = k === 0
          const withPicture = k <= 1 || k === n - 1 || !!flying
          const z = flying && (flight.dir === -1 || flight.phase === 'out') ? 40 : 20 - Math.min(k, 9)
          return (
            <motion.div
              key={slide.n}
              className="w-fortyfour-lab-card"
              style={{ rotate: rots[i], y: ys[i], zIndex: z }}
              aria-hidden={top ? undefined : true}
              {...(top ? { role: 'group', 'aria-roledescription': 'slide', 'aria-label': `${slide.n} of ${n}` } : null)}
            >
              <span className="w-fortyfour-lab-card-shadow" aria-hidden="true" />
              <span className="w-fortyfour-lab-card-edge" aria-hidden="true" />
              <div className="w-fortyfour-lab-card-paper">
                <figure className="w-fortyfour-lab-photo" style={{ aspectRatio: `${post.ratio}` }}>
                  {top && slide.kind === 'video' ? (
                    <Clip slide={slide} active label={`${post.title}, ${longDate(post.date)}`} />
                  ) : withPicture ? (
                    <img src={asset(`${POSTS_DIR}${slide.image}`)} alt={top ? slide.alt : ''} width={slide.w} height={slide.h} loading="lazy" decoding="async" draggable={false} />
                  ) : null}
                </figure>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* the drag surface: leaves the clip's own tab free when a video is on top */}
      <motion.div className="w-fortyfour-lab-grab" data-clip={onVideo ? '' : undefined} data-cursor="Flip" aria-hidden="true" onPan={onPan} onPanEnd={onPanEnd} />

      <div className="w-fortyfour-lab-tagui">
        <div className="w-fortyfour-lab-tagui-head">
          <Stamp text={date} color="var(--ffl-brick)" rotate={-4} size="1.05rem" rough={1} decorative />
        </div>
        <span className="w-fortyfour-lab-eyelet" aria-hidden="true" />
        <div className="w-fortyfour-lab-tagui-foot">
          <span className="w-fortyfour-lab-kind t-label">{post.slides.some((s) => s.kind === 'video') ? 'Photos + clip' : 'Photos'}</span>
          <div className="w-fortyfour-lab-pager">
            <TabButton tone="marigold" size="sm" icon="arrow-left" aria-label={`${post.title}: previous slide`} onClick={() => move(-1)} cursor="Flip" />
            <span className="w-fortyfour-lab-count t-label" aria-hidden="true">
              {String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
            </span>
            <TabButton tone="marigold" size="sm" icon="arrow-right" aria-label={`${post.title}: next slide`} onClick={() => move(1)} cursor="Flip" />
          </div>
        </div>
      </div>
      <p className="pm-sr" aria-live="polite">
        {`Photo ${index + 1} of ${n}: ${current.alt}`}
      </p>
    </div>
  )
}
