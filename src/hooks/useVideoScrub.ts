import { useEffect, useRef } from 'react'

const SENSITIVITY = 0.8

/**
 * Lets the visitor "scrub" a background video by moving the mouse
 * horizontally, instead of it autoplaying. Seeks are queued rather than
 * fired on every mousemove, so a fast swipe doesn't flood the video
 * element with more currentTime writes than it can keep up with.
 */
export function useVideoScrub<T extends HTMLVideoElement>() {
  const videoRef = useRef<T | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let prevX = window.innerWidth / 2
    let targetTime = 0
    let seeking = false

    const applyTarget = () => {
      if (!video.duration || Number.isNaN(video.duration)) return
      if (seeking) return
      seeking = true
      video.currentTime = targetTime
    }

    const onSeeked = () => {
      seeking = false
      if (Math.abs(video.currentTime - targetTime) > 0.05) {
        applyTarget()
      }
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!video.duration || Number.isNaN(video.duration)) return
      const delta = e.clientX - prevX
      prevX = e.clientX
      const offset = (delta / window.innerWidth) * SENSITIVITY * video.duration
      targetTime = Math.min(Math.max(targetTime + offset, 0), video.duration)
      applyTarget()
    }

    video.addEventListener('seeked', onSeeked)
    window.addEventListener('mousemove', onMouseMove)
    return () => {
      video.removeEventListener('seeked', onSeeked)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return videoRef
}
