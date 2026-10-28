// The desk the sheets lie on. Fixed behind everything (.pm-desk, z -1 inside #app-root), pointer-events none, aria-hidden.
//   layers (bottom to top): the plum desk colour (base.css) < a cutting-mat grid (slides at a fifth of the scroll speed)
//   < warm light leaks (plain alpha, slow drift) < a projector beam from the top-right corner (slow sway, with dust drifting in it).
//   No blend modes, masks or filters: each of those forces an offscreen pass on every scrolled frame (measured). The static film
//   grain is the global .pm-grain.
// On screens with room in the side margins (>= 1500 px viewport) the margins carry two WORKING instruments:
//   right: a ruler of six inches, one inch per sheet, with the section names on it and a paper clip that slides to where you
//          are (continuous: the clip is at "3.4" when you are 40 % through sheet 4);
//   left:  a cloth measuring tape the length of the page in centimetres, running past as you scroll, with a red index line
//          at the middle of the window.
// Both read sectionState (one rAF-throttled passive scroll read, no React re-render per frame). The ambient layers carry
// pm-ambient (stopped by reduced motion and by "Pause motion"); the instruments move only when the visitor scrolls.

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { NAV } from '../../lib/copy'
import { useMotion } from '../../lib/motion'
import { PaperClip, Tape } from '../primitives'
import { subscribeScroll } from './sectionState'
import './chrome.css'

type Room = 'none' | 'tight' | 'roomy' | 'wide'

/**
 * Dust in the projector beam: a handful of specks that drift up through the cone, fade in, hang a while and fade out. Their places are
 * fixed numbers in the beam's own frame (its apex is the top-right corner; rho = distance from the apex as a fraction of the beam's
 * width, theta = direction in degrees clockwise from "up"; the cone runs from 196 to 246), so the markup is identical on every render.
 */
const MOTES = (() => {
  let seed = 7
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
  return Array.from({ length: 18 }, () => {
    // close to the apex: that is the part of the cone that shows beside the mast (the rest lies behind the sheets)
    const rho = 0.03 + rnd() * 0.13
    const theta = ((199 + rnd() * 44) * Math.PI) / 180
    const dur = 22 + rnd() * 18
    return {
      x: `${(100 - rho * Math.abs(Math.sin(theta)) * 100).toFixed(2)}%`,
      y: `${(-rho * Math.cos(theta) * 100).toFixed(2)}%`,
      s: `${(2 + rnd() * 2.6).toFixed(1)}px`,
      o: (0.4 + rnd() * 0.45).toFixed(2),
      d: `${dur.toFixed(1)}s`,
      delay: `${(-rnd() * dur).toFixed(1)}s`,
      dx: `${Math.round((rnd() - 0.5) * 56)}px`,
      dy: `${-Math.round(14 + rnd() * 46)}px`,
    }
  })
})()

const CM = 96 / 2.54 // 1 cm in CSS px
const TEN_CM = CM * 10
const MAT_INCH = 140 // the repeat of the mat's inch lines (chrome.css)

// tight: ticks only | roomy (28 px and up: the section names fit beside the ticks) | wide (44 px and up: bigger ticks and names)
const roomFor = (margin: number): Room => (margin < 14 ? 'none' : margin < 28 ? 'tight' : margin < 44 ? 'roomy' : 'wide')

function Ruler({ room }: { room: Room }) {
  const markRef = useRef<HTMLDivElement | null>(null)
  const hiRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let last = -1
    return subscribeScroll((info) => {
      const mark = markRef.current
      if (mark) mark.style.transform = `translate3d(0, ${(info.p * 100).toFixed(2)}%, 0)`
      const hi = hiRef.current
      if (hi && info.index !== last) {
        last = info.index
        hi.style.transform = `translate3d(0, ${info.index * 100}%, 0)`
      }
    })
  }, [])

  return (
    <div className="pm-ruler" data-room={room}>
      <div className="pm-ruler__body">
        <div className="pm-ruler__hi" ref={hiRef} />
        <div className="pm-ruler__ticks" />
        {NAV.map((item, i) => (
          <span key={item.id} className="pm-ruler__name" style={{ '--i': i } as CSSProperties}>
            {item.label}
          </span>
        ))}
        <div className="pm-ruler__track" ref={markRef}>
          <PaperClip className="pm-ruler__clip" color="tomato" rotate={0} size="3.1rem" />
        </div>
      </div>
    </div>
  )
}

function MeasuringTape() {
  const layerRef = useRef<HTMLDivElement | null>(null)
  const [tens, setTens] = useState(12)

  useEffect(() => {
    let lastTens = 0
    return subscribeScroll((info) => {
      const layer = layerRef.current
      if (layer) layer.style.transform = `translate3d(0, ${-info.y}px, 0)`
      const t = Math.ceil(info.docHeight / TEN_CM) + 1
      if (t !== lastTens) {
        lastTens = t
        setTens(t)
      }
    })
  }, [])

  return (
    <div className="pm-mtape">
      <div className="pm-mtape__strip">
        <div className="pm-mtape__layer" ref={layerRef} style={{ height: tens * TEN_CM }}>
          {Array.from({ length: tens - 1 }, (_, k) => (
            <span key={k} className="pm-mtape__n" style={{ top: (k + 1) * TEN_CM }}>
              {(k + 1) * 10}
            </span>
          ))}
        </div>
        <span className="pm-mtape__index" />
      </div>
      <span className="pm-mtape__washi pm-mtape__washi--a">
        <Tape color="butter" pattern="stripes" w="3.4rem" h="1.25rem" rotate={-9} />
      </span>
      <span className="pm-mtape__washi pm-mtape__washi--b">
        <Tape color="lagoon" pattern="dots" w="3.4rem" h="1.25rem" rotate={7} />
      </span>
    </div>
  )
}

export function Desk() {
  const probeRef = useRef<HTMLDivElement | null>(null)
  const matRef = useRef<HTMLDivElement | null>(null)
  const [margin, setMargin] = useState(0)
  const { still } = useMotion()

  // a hidden tab keeps no loop running: html[data-hidden] pauses every pm-ambient animation on the site (chrome.css)
  useEffect(() => {
    const root = document.documentElement
    const sync = () => root.toggleAttribute('data-hidden', document.hidden)
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => {
      document.removeEventListener('visibilitychange', sync)
      root.removeAttribute('data-hidden')
    }
  }, [])

  // the cutting mat is a little further away than the sheets: it slides at a fifth of the page's speed (depth, not decoration).
  // One transform write per frame, none under reduced or paused motion.
  useEffect(() => {
    if (still) {
      if (matRef.current) matRef.current.style.transform = ''
      return
    }
    return subscribeScroll((info) => {
      const mat = matRef.current
      if (mat) mat.style.transform = `translate3d(0, ${-((info.y * 0.2) % MAT_INCH).toFixed(1)}px, 0)`
    })
  }, [still])

  // how wide is the empty margin beside the sheets? (a probe as wide as the sheets, measured against the page width)
  useEffect(() => {
    const probe = probeRef.current
    if (!probe) return
    let raf = 0
    const measure = () => {
      raf = 0
      const gap = (document.documentElement.clientWidth - probe.offsetWidth) / 2
      setMargin(window.innerWidth >= 1500 ? Math.max(0, Math.floor(gap)) : 0)
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('resize', schedule)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  const room = roomFor(margin)

  return (
    <div className="pm-desk" aria-hidden="true" data-room={room} style={{ '--pm-m': `${margin}px` } as CSSProperties}>
      <div className="pm-desk__probe" ref={probeRef} />
      <div className="pm-desk__mat" ref={matRef} />
      <div className="pm-desk__leaks">
        <i className="pm-desk__leak pm-ambient" data-leak="a" />
        <i className="pm-desk__leak pm-ambient" data-leak="b" />
        <i className="pm-desk__leak pm-ambient" data-leak="c" />
        <i className="pm-desk__leak pm-ambient" data-leak="d" />
      </div>
      <div className="pm-desk__beam pm-ambient">
        {MOTES.map((m, i) => (
          <i
            key={i}
            className="pm-desk__mote pm-ambient"
            style={{ '--x': m.x, '--y': m.y, '--s': m.s, '--o': m.o, '--d': m.d, '--delay': m.delay, '--dx': m.dx, '--dy': m.dy } as CSSProperties}
          />
        ))}
      </div>
      {room !== 'none' && (
        <>
          <Ruler room={room} />
          <MeasuringTape />
        </>
      )}
    </div>
  )
}

export default Desk
