// The animated portrait as data + the scrub engine. No React in here.
// The clip: 145 frames at 24 fps (public/about/manifest.json). Frame i sits at t = i / 24, so the LAST frame is at 6.0 s,
// not at video.duration (6.0417 s): pointer progress maps to currentTime = progress * 6.

export const FPS = 24
export const LAST = 144
export const FRAME_COUNT = 145
/** seconds at the last frame */
export const CLIP_SECONDS = LAST / FPS
/** the gapless ping-pong loop (touch): 288 frames = 12 s, forward then back */
export const LOOP_SECONDS = 12

/** the frame each of the 12 film-strip thumbnails was cut from (frames/f-01..f-12.webp) */
export const THUMB_FRAMES = [0, 13, 26, 39, 52, 65, 79, 92, 105, 118, 131, 144] as const

const pad = (n: number, width = 2): string => String(n).padStart(width, '0')

/** burnt-in timecode, 24 fps: frame 84 is 00:00:03:12 */
export const timecode = (frame: number): string => `00:00:${pad(Math.floor(frame / FPS))}:${pad(frame % FPS)}`
export const frameLabel = (frame: number): string => `FR ${pad(frame, 3)}`
export const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n)

/** the thumbnail whose source frame is closest to `frame` (1-based file number) */
export function nearestThumb(frame: number): number {
  let best = 0
  for (let i = 1; i < THUMB_FRAMES.length; i++) {
    if (Math.abs(THUMB_FRAMES[i] - frame) < Math.abs(THUMB_FRAMES[best] - frame)) best = i
  }
  return best + 1
}

/** which file to fetch, decided in JS (a <source media> is not honoured consistently inside <video>) */
export interface ClipChoice {
  url: string
  large: boolean
}

interface NetworkInformationLike {
  saveData?: boolean
  effectiveType?: string
}

export function chooseClip(frameCssWidth: number, assetUrl: (path: string) => string): ClipChoice {
  const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection
  const thin = Boolean(connection?.saveData) || connection?.effectiveType === '2g' || connection?.effectiveType === '3g' || connection?.effectiveType === 'slow-2g'
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  // the 640 px file is enough up to 560 device pixels across; the 960 px file only when the frame is big and sharp
  const large = !thin && frameCssWidth * dpr > 560
  let webm = false
  try {
    const probe = document.createElement('video')
    webm = probe.canPlayType(large ? 'video/webm; codecs="vp09.00.40.08"' : 'video/webm; codecs="vp09.00.30.08"') !== ''
  } catch {
    webm = false
  }
  return { url: assetUrl(`/about/portrait${large ? '' : '-sm'}.${webm ? 'webm' : 'mp4'}`), large }
}

// ---- the scrub engine --------------------------------------------------------------------------------------------------

export type ScrubSource = 'pointer' | 'range' | 'loop'

export interface EngineHooks {
  video(): HTMLVideoElement | null
  /** the whole file is buffered (scrubbing is only enabled then) */
  ready(): boolean
  /** called every frame while moving: the integer frame shown and the smoothed progress 0..1 */
  paint(frame: number, progress: number, source: ScrubSource): void
}

export interface Engine {
  /** aim at progress 0..1. `pointer` aims are remembered until the file is ready; `range` aims paint at once */
  drive(progress: number, source: ScrubSource): void
  /** run a tick if one is needed (file became ready, a seek finished, the tab came back) */
  kick(): void
  /** adopt a progress from outside (the loop video plays on its own) so a later scrub glides from there */
  adopt(progress: number): void
  source(): ScrubSource
  dispose(): void
}

/**
 * Pointer -> progress -> smoothed (lerp 0.2 per frame) -> snapped to a whole frame -> video.currentTime.
 * It only runs while something has to move (no idle loop), skips the assignment while the video is still seeking and
 * guards Number.isFinite(duration) (the duration is NaN until the metadata is in).
 */
export function createEngine(hooks: EngineHooks): Engine {
  let target = 0
  let current = 0
  let source: ScrubSource = 'pointer'
  let raf = 0
  let dead = false

  const usable = (): HTMLVideoElement | null => {
    const video = hooks.video()
    return video && hooks.ready() && Number.isFinite(video.duration) ? video : null
  }

  const tick = (): void => {
    raf = 0
    if (dead) return
    const video = usable()
    if (!video) return
    const diff = target - current
    current = Math.abs(diff) < 0.0006 ? target : current + diff * 0.2
    const frame = Math.round(current * LAST)
    const at = frame / FPS
    if (!video.seeking && Math.abs(video.currentTime - at) > 0.25 / FPS) video.currentTime = at
    hooks.paint(frame, current, source)
    const settled = current === target && !video.seeking && Math.abs(video.currentTime - at) < 0.01
    if (!settled && !document.hidden) raf = requestAnimationFrame(tick)
  }

  const kick = (): void => {
    if (dead || raf || document.hidden) return
    raf = requestAnimationFrame(tick)
  }

  return {
    drive(progress, from) {
      target = clamp01(progress)
      source = from
      if (usable()) {
        kick()
      } else if (from !== 'pointer') {
        // no file to show it with yet: follow the strip at once so the oval, the timecode and the interim thumbnail answer
        current = target
        hooks.paint(Math.round(current * LAST), current, from)
      }
    },
    kick,
    adopt(progress) {
      current = clamp01(progress)
      target = current
    },
    source: () => source,
    dispose() {
      dead = true
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    },
  }
}
