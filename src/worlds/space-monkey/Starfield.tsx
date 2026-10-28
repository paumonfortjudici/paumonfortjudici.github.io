// The sticky window onto deep space: stars + Earth limb (sky.ts). Decorative: aria-hidden, never takes the pointer.
import { useEffect, useRef } from 'react'
import { useWorld } from '../WorldContext'
import { createSky, type Sky } from './sky'

export function Starfield({ still }: { still: boolean }) {
  const { scrollRef } = useWorld()
  const hostRef = useRef<HTMLDivElement>(null)
  const starsRef = useRef<HTMLCanvasElement>(null)
  const earthRef = useRef<HTMLCanvasElement>(null)
  const skyRef = useRef<Sky | null>(null)
  const stillRef = useRef(still)
  stillRef.current = still

  useEffect(() => {
    const host = hostRef.current
    const stars = starsRef.current
    const earth = earthRef.current
    if (!host || !stars || !earth) return
    const sky = createSky({ host, stars, earth, scroller: scrollRef.current, still: stillRef.current })
    skyRef.current = sky
    return () => {
      sky.destroy()
      skyRef.current = null
    }
  }, [scrollRef])

  useEffect(() => {
    skyRef.current?.setStill(still)
  }, [still])

  return (
    <div className="w-space-monkey-sky" aria-hidden="true">
      <div ref={hostRef} className="w-space-monkey-window">
        <canvas ref={starsRef} className="w-space-monkey-stars" data-sky="stars" />
        <canvas ref={earthRef} className="w-space-monkey-earth" data-sky="earth" />
      </div>
    </div>
  )
}
