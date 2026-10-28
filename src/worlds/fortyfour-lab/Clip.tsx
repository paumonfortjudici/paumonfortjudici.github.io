// A muted looping clip that plays only while it is on screen (and only when motion is allowed), with a visible Pause / Play tab.
//   - nothing is fetched until the clip first scrolls near the viewport (an <img> poster stands in, lazy)
//   - preload="none": the first play() starts the download
//   - out of view, tab hidden, or "active" false (another slide of the stack is on top) -> paused
//   - reduced motion / "Pause motion": never starts by itself; the Play tab still works (the visitor asked for it)
//   - a clip the visitor paused stays paused until they press Play
import { useEffect, useRef, useState } from 'react'
import { useInView } from '../../lib/hooks'
import { asset } from '../../lib/asset'
import { useWorld } from '../WorldContext'
import { POSTS_DIR, type Slide } from './posts'
import { PauseIcon, PlayIcon } from './icons'

interface ClipProps {
  slide: Slide
  /** this clip is the one the tag is showing right now */
  active: boolean
  /** accessible name of the clip */
  label: string
}

export default function Clip({ slide, active, label }: ClipProps) {
  const { scrollRef, reduced } = useWorld()
  const box = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const inView = useInView(box, { root: scrollRef, threshold: 0.4 })
  const near = useInView(box, { root: scrollRef, rootMargin: '60% 0px 60% 0px', once: true })
  const [playing, setPlaying] = useState(false)
  const [wanted, setWanted] = useState(false)
  const userPaused = useRef(false)
  const [hidden, setHidden] = useState(() => (typeof document === 'undefined' ? false : document.hidden))
  const file = slide.video

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  // the one place that decides play / pause: on screen, on top of its stack, tab visible, and either motion is allowed and the
  // visitor did not pause it, or the visitor pressed Play
  const allowed = active && inView && !hidden
  const run = allowed && ((!reduced && !userPaused.current) || wanted)
  useEffect(() => {
    const el = video.current
    if (!el) return
    if (run) {
      const started = el.play()
      if (started) started.catch(() => setPlaying(false))
    } else {
      el.pause()
    }
  }, [run, near])

  // the stack moved on: forget a manual Play so the next visit follows the rules again
  useEffect(() => {
    if (!active) setWanted(false)
  }, [active])

  if (!file) return null
  const toggle = () => {
    const el = video.current
    if (playing) {
      userPaused.current = true
      setWanted(false)
      el?.pause()
    } else {
      userPaused.current = false
      setWanted(true)
      const started = el?.play()
      if (started) started.catch(() => setPlaying(false))
    }
  }

  return (
    <div ref={box} className="w-fortyfour-lab-clip">
      {near || wanted ? (
        <video
          ref={video}
          className="w-fortyfour-lab-clip-video"
          src={asset(`${POSTS_DIR}${file.file}`)}
          poster={asset(`${POSTS_DIR}${slide.image}`)}
          width={file.w}
          height={file.h}
          muted
          loop
          playsInline
          preload="none"
          aria-label={label}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      ) : (
        <img
          className="w-fortyfour-lab-clip-video"
          src={asset(`${POSTS_DIR}${slide.image}`)}
          alt={slide.alt}
          width={slide.w}
          height={slide.h}
          loading="lazy"
          decoding="async"
        />
      )}
      <button
        type="button"
        className="w-fortyfour-lab-clip-tab t-label"
        onClick={toggle}
        aria-label={`${playing ? 'Pause' : 'Play'} the clip: ${label}`}
        data-cursor={playing ? undefined : 'Play'}
      >
        {playing ? <PauseIcon width="1em" height="1em" /> : <PlayIcon width="1em" height="1em" />}
        <span>{playing ? 'Pause' : 'Play'}</span>
      </button>
    </div>
  )
}
