// The animated portrait: a poster, and on top of it the video that the pointer scrubs.
//
//   fine pointer      moving across the frame scrubs the clip (progress = x across the frame, smoothed, snapped to whole frames)
//   touch             tap toggles the gapless ping-pong loop (portrait-loop.mp4, muted, inline); the strip scrubs on demand
//   reduced / paused  the poster only: no autoplay, no pointer scrub. Moving the strip (an explicit act) still shows frames.
//
// The video is requested only when the frame is within about one screen of the viewport (preload="auto" only then). The strip
// under the frame is the keyboard / touch twin of the pointer: both drive the same engine (./clip.ts).
// Everything that changes every frame (timecode, strip, labels) is written to the DOM directly: React never re-renders per frame.

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { asset } from '../../../lib/asset'
import { chooseClip, createEngine, LAST, LOOP_SECONDS, CLIP_SECONDS, nearestThumb, timecode, type ClipChoice, type Engine, type ScrubSource } from './clip'
import { PORTRAIT } from './text'

export interface ScrubHandle {
  /** aim the portrait at progress 0..1 (the strip's way in); arms the video when the pointer cannot */
  drive(progress: number): void
}

export interface ScrubVideoProps {
  /** reduced motion OR the visitor paused motion */
  still: boolean
  /** a mouse-like pointer that can hover */
  fine: boolean
  /** every frame the picture moves: the whole frame shown, the smoothed progress and what drove it */
  onPaint: (frame: number, progress: number, source: ScrubSource) => void
}

const pad2 = (n: number): string => String(n).padStart(2, '0')
const POSTER = '/about/poster.webp'
const POSTER_SM = '/about/poster-sm.webp'

export const ScrubVideo = forwardRef<ScrubHandle, ScrubVideoProps>(function ScrubVideo({ still, fine, onPaint }, ref) {
  const frameRef = useRef<HTMLElement | null>(null)
  const scrubRef = useRef<HTMLVideoElement | null>(null)
  const loopRef = useRef<HTMLVideoElement | null>(null)
  const interimRef = useRef<HTMLImageElement | null>(null)
  const tcRef = useRef<HTMLSpanElement | null>(null)
  const engineRef = useRef<Engine | null>(null)
  const readyRef = useRef(false)
  const onPaintRef = useRef(onPaint)
  onPaintRef.current = onPaint

  const [near, setNear] = useState(false)
  const [armed, setArmed] = useState(false)
  const [ready, setReady] = useState(false)
  const [percent, setPercent] = useState(0)
  const [failed, setFailed] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [loopShown, setLoopShown] = useState(false)
  const [clip, setClip] = useState<ClipChoice | null>(null)
  /** the countdown leader on the slate (3, 2, 1) when the scrub engine arms; null = show the frame rate */
  const [leader, setLeader] = useState<number | null>(null)

  const tap = !fine && !still
  useEffect(() => {
    if (!ready || still) return
    const timers = [2, 1].map((n, i) => window.setTimeout(() => setLeader(n), (i + 1) * 380))
    timers.push(window.setTimeout(() => setLeader(null), 3 * 380))
    setLeader(3)
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [ready, still])
  const pointerScrub = fine && !still
  const wantScrub = near && !failed && (pointerScrub || armed)
  // the gapless loop is available to every pointer: touch taps the frame, a mouse presses the Play tab
  const wantLoop = near && !still

  // ---- painting: the timecode lives here, the strip and the printed frame number live outside -------------------------------
  const showInterim = useCallback((frame: number) => {
    const image = interimRef.current
    if (!image) return
    const n = nearestThumb(frame)
    if (image.dataset.n !== String(n)) {
      image.dataset.n = String(n)
      image.src = asset(`/about/frames/f-${pad2(n)}.webp`)
    }
    image.hidden = false
  }, [])

  const paintAll = useCallback(
    (frame: number, progress: number, source: ScrubSource) => {
      if (tcRef.current) tcRef.current.textContent = timecode(frame)
      if (!readyRef.current && source === 'range') showInterim(frame)
      onPaintRef.current(frame, progress, source)
    },
    [showInterim],
  )

  // ---- the engine (created in an effect so React StrictMode's mount / unmount / mount leaves a live one) -------------------
  useEffect(() => {
    const engine = createEngine({
      video: () => scrubRef.current,
      ready: () => readyRef.current,
      paint: (frame, progress, source) => paintAll(frame, progress, source),
    })
    engineRef.current = engine
    return () => {
      engine.dispose()
      engineRef.current = null
    }
  }, [paintAll])

  // Motion is paused (or the OS asks for less) while the clip was somewhere in the middle: the poster is frame 0, so the timecode, the strip, the
  // printed frame number and the oval go back to it, and a later resume starts from the poster instead of jumping to the old frame.
  useEffect(() => {
    if (!still) return
    engineRef.current?.adopt(0)
    paintAll(0, 0, 'pointer')
  }, [still, paintAll])

  useImperativeHandle(
    ref,
    () => ({
      drive(progress) {
        if (!pointerScrub) setArmed(true)
        engineRef.current?.drive(progress, 'range')
      },
    }),
    [pointerScrub],
  )

  // ---- lazy start: the video exists only when the frame is within about one screen -----------------------------------------
  const setFrame = useCallback((node: HTMLElement | null) => {
    frameRef.current = node
  }, [])

  useEffect(() => {
    const node = frameRef.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setNear(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true)
          observer.disconnect()
        }
      },
      { rootMargin: '100% 0px 100% 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // nothing keeps running off-screen or in a hidden tab
  useEffect(() => {
    const node = frameRef.current
    const observer =
      node && typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              if (!entries.some((entry) => entry.isIntersecting)) loopRef.current?.pause()
            },
            { threshold: 0.15 },
          )
        : null
    if (node && observer) observer.observe(node)
    const onVisibility = () => {
      if (document.hidden) loopRef.current?.pause()
      else engineRef.current?.kick()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      observer?.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  useEffect(() => {
    if (still) loopRef.current?.pause()
  }, [still])

  useEffect(() => {
    if (armed) loopRef.current?.pause()
  }, [armed])

  // ---- which file: decided in JS, once, from the size of the frame --------------------------------------------------------
  useEffect(() => {
    if (!wantScrub || clip) return
    const width = frameRef.current?.getBoundingClientRect().width ?? 360
    setClip(chooseClip(width, asset))
  }, [wantScrub, clip])

  // ---- readiness: scrub only once the whole file is buffered (best effort after 9 s) ---------------------------------------
  const markReady = useCallback(() => {
    if (readyRef.current) return
    readyRef.current = true
    setReady(true)
    if (interimRef.current) interimRef.current.hidden = true
    engineRef.current?.kick()
  }, [])

  const onBuffer = useCallback(() => {
    const video = scrubRef.current
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return
    const end = video.buffered.length ? video.buffered.end(video.buffered.length - 1) : 0
    const ratio = Math.min(1, end / video.duration)
    setPercent(Math.round(ratio * 100))
    if (ratio >= 0.985) markReady()
  }, [markReady])

  useEffect(() => {
    if (!wantScrub || !clip || ready) return
    const id = window.setTimeout(() => {
      const video = scrubRef.current
      if (video && video.readyState >= 3) markReady()
    }, 9000)
    return () => window.clearTimeout(id)
  }, [wantScrub, clip, ready, markReady])

  useEffect(() => {
    if (wantScrub) return
    readyRef.current = false
    setReady(false)
    setPercent(0)
  }, [wantScrub])

  // the loop video is gone (motion paused while it played, or the pointer changed): forget that it was playing
  useEffect(() => {
    if (wantLoop) return
    setPlaying(false)
    setLoopShown(false)
  }, [wantLoop])

  // ---- the loop (touch): the strip follows the playing video ---------------------------------------------------------------
  useEffect(() => {
    if (!playing) return
    let raf = 0
    const step = () => {
      const video = loopRef.current
      if (video && !document.hidden) {
        const t = video.currentTime % LOOP_SECONDS
        const progress = (t <= CLIP_SECONDS ? t : LOOP_SECONDS - t) / CLIP_SECONDS
        engineRef.current?.adopt(progress)
        paintAll(Math.round(progress * LAST), progress, 'loop')
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [playing, paintAll])

  const toggleLoop = () => {
    const video = loopRef.current
    if (!video) return
    if (video.paused) {
      setArmed(false)
      void video.play().catch(() => setPlaying(false))
    } else {
      video.pause()
    }
  }

  // ---- the pointer ------------------------------------------------------------------------------------------------------------
  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!pointerScrub || event.pointerType === 'touch' || playing) return
    const box = frameRef.current?.getBoundingClientRect()
    if (!box || box.width === 0) return
    engineRef.current?.drive((event.clientX - box.left) / box.width, 'pointer')
  }
  const onPointerLeave = () => {
    const engine = engineRef.current
    if (pointerScrub && engine && engine.source() === 'pointer') engine.drive(0, 'pointer')
  }

  const layer = playing ? 'loop' : wantScrub && ready ? 'scrub' : wantLoop && loopShown ? 'loop' : 'poster'

  const inside = (
    <>
      <img
        className="pm-ab-frame__poster"
        src={asset(POSTER_SM)}
        srcSet={`${asset(POSTER_SM)} 640w, ${asset(POSTER)} 960w`}
        sizes="(max-width: 700px) 90vw, 520px"
        width={960}
        height={1200}
        alt={PORTRAIT.alt}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
      {/* the thumbnail that answers at once while the clip is still being fetched (hidden until then; src is never empty) */}
      <img
        ref={interimRef}
        className="pm-ab-frame__interim"
        src={asset('/about/frames/f-01.webp')}
        data-n="1"
        width={240}
        height={300}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        draggable={false}
        hidden
      />
      {wantLoop && (
        <video
          ref={loopRef}
          className="pm-ab-frame__loop"
          src={asset('/about/portrait-loop.mp4')}
          poster={asset(POSTER_SM)}
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          tabIndex={-1}
          aria-hidden="true"
          onPlay={() => {
            setPlaying(true)
            setLoopShown(true)
          }}
          onPause={() => setPlaying(false)}
        />
      )}
      {wantScrub && clip && (
        <video
          ref={scrubRef}
          className="pm-ab-frame__video"
          src={clip.url}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          tabIndex={-1}
          aria-hidden="true"
          onLoadedMetadata={onBuffer}
          onProgress={onBuffer}
          onCanPlayThrough={onBuffer}
          onLoadedData={onBuffer}
          onSeeked={() => engineRef.current?.kick()}
          onError={() => setFailed(true)}
        />
      )}
      <span className="pm-ab-playhead" aria-hidden="true" />
      <span className="pm-ab-slate" aria-hidden="true">
        <span className="pm-ab-slate__stick" />
        <span className="pm-ab-slate__row">{PORTRAIT.slate[0]}</span>
        <span className="pm-ab-slate__row">{leader === null ? PORTRAIT.slate[1] : `[ ${leader} ]`}</span>
      </span>
      <span className="pm-ab-frame__tc" ref={tcRef} aria-hidden="true">
        {timecode(0)}
      </span>
      {wantScrub && !ready && !failed && (
        <span className="pm-ab-frame__dev" aria-hidden="true">
          {PORTRAIT.developing} {percent}%
        </span>
      )}
    </>
  )

  return tap ? (
    <button
      ref={setFrame}
      type="button"
      className="pm-ab-frame"
      data-layer={layer}
      aria-pressed={playing}
      aria-label={playing ? PORTRAIT.pause : PORTRAIT.play}
      onClick={toggleLoop}
    >
      {inside}
    </button>
  ) : (
    <div ref={setFrame} className="pm-ab-frame" data-layer={layer} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
      {inside}
      {!still && (
        <button type="button" className="pm-ab-play" aria-pressed={playing} aria-label={playing ? PORTRAIT.pause : PORTRAIT.play} data-cursor="none" onClick={toggleLoop}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            {playing ? (
              <path d="M7 5v14M17 5v14" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
            ) : (
              <path d="M8 4.6v14.8L19.6 12z" fill="currentColor" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            )}
          </svg>
        </button>
      )}
    </div>
  )
})
