// The ground the atlas ends on: a holm-oak field with the symbol's stripe, edge to edge, and a poppy sun that RISES with the scroll and
// stays risen at the end (the 72nd hour). The manual's own closing line is written on it once the sun has cleared the horizon.
// The sun's height is one css variable (--rise, 0 to 1) written straight to the element from the world's scroller: no React state, no
// re-render per scroll event. Without script, or under still motion, the sun simply stands risen.
import { useEffect, useRef } from 'react'
import { useWorld } from '../WorldContext'

export function Horizon() {
  const { scrollRef, reduced } = useWorld()
  const ground = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ground.current
    const scroller = scrollRef.current
    if (!el || !scroller) return
    if (reduced) {
      el.style.setProperty('--rise', '1')
      return
    }
    let frame = 0
    const update = () => {
      frame = 0
      const g = el.getBoundingClientRect()
      const view = scroller.getBoundingClientRect()
      const sky = g.height * 3.2 // about the height of the sun above the ground
      const enter = view.bottom - g.top // how far the ground's top edge is above the bottom of the view (negative: not there yet)
      const p = Math.max(0, Math.min(1, (enter + sky) / (g.height + sky)))
      el.style.setProperty('--rise', p.toFixed(3))
    }
    const on = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    update()
    scroller.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      scroller.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
      window.cancelAnimationFrame(frame)
    }
  }, [reduced, scrollRef])

  return (
    <div ref={ground} className="w-plana-ground">
      <div className="w-plana-ground__sky" aria-hidden="true">
        <span className="w-plana-ground__sun" />
        <span className="w-plana-ground__sign">See you in la Plana.</span>
      </div>
      <p className="pm-sr">See you in la Plana.</p>
    </div>
  )
}
