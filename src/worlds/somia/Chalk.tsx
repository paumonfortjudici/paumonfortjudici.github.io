// "visto como pienso" lettered in chalk on the wall panel.
// Redrawn for this page: a small hand alphabet (ten letters, centre-line strokes), jittered by a seeded random so no two
// Os are the same, drawn on stroke by stroke (pathLength = 1) and finished with an SVG chalk filter (wobbling edge +
// dust). The filter's grain is kept at about one screen pixel whatever the size of the panel (a ResizeObserver rewrites
// its numbers), otherwise a small panel would turn the dust into flat grey.

import { useEffect, useId, useMemo, useRef } from 'react'
import { MOTTO } from './data'

interface Glyph {
  w: number
  s: string[]
}

// cap height 100, absolute coordinates, a stroke is one pen-down movement
const GLYPHS: Record<string, Glyph> = {
  V: { w: 80, s: ['M 3 4 C 14 36 28 70 41 98', 'M 79 0 C 68 34 54 70 41 98'] },
  I: { w: 14, s: ['M 7 3 C 8 34 6 66 7 98'] },
  S: { w: 58, s: ['M 52 16 C 46 3 26 -1 14 10 C 2 22 12 40 28 48 C 44 56 58 68 50 86 C 42 102 16 101 3 86'] },
  T: { w: 66, s: ['M 2 5 C 22 2 44 3 64 2', 'M 34 4 C 35 36 33 68 34 98'] },
  O: { w: 76, s: ['M 40 3 C 16 4 3 28 3 52 C 3 78 20 99 42 98 C 64 97 76 74 74 48 C 72 22 58 2 36 6'] },
  C: { w: 68, s: ['M 66 20 C 56 5 40 0 28 4 C 8 10 1 34 3 56 C 5 80 21 100 43 98 C 55 97 63 90 68 80'] },
  M: { w: 98, s: ['M 4 98 C 5 66 4 34 6 3 C 20 26 34 50 50 74 C 62 52 76 26 90 2 C 91 34 92 66 94 98'] },
  P: { w: 58, s: ['M 8 3 C 9 36 7 68 8 98', 'M 8 4 C 30 -1 56 6 55 28 C 54 50 32 56 9 50'] },
  E: { w: 54, s: ['M 10 3 C 11 36 8 68 9 98', 'M 10 4 C 26 1 40 3 54 2', 'M 10 50 C 22 48 34 49 46 47', 'M 9 97 C 26 100 42 99 55 98'] },
  N: { w: 78, s: ['M 7 98 C 8 66 6 34 8 3 C 26 34 46 66 66 96 C 66 64 67 32 68 1'] },
}

// the three lines are staggered like the paint on the real wall
const LINES = [
  { text: 'VISTO', x: 70, y: 8, r: -2 },
  { text: 'COMO', x: 4, y: 158, r: 1.2 },
  { text: 'PIENSO', x: 40, y: 308, r: -1 },
]

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Laid {
  key: string
  transform: string
  strokes: Array<{ d: string; i: number }>
}

function layOut(): { lines: Array<{ transform: string; letters: Laid[] }>; count: number } {
  const rnd = mulberry32(7)
  let i = 0
  const lines = LINES.map((line, li) => {
    let x = line.x
    const letters: Laid[] = []
    for (const [ci, ch] of Array.from(line.text).entries()) {
      const g = GLYPHS[ch]
      const jitter = () => (rnd() - 0.5) * 3.2
      const rot = (rnd() - 0.5) * 6
      const dy = (rnd() - 0.5) * 5
      const strokes = g.s.map((d) => ({
        d: d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_m, a: string, b: string) => `${(+a + jitter()).toFixed(1)} ${(+b + jitter()).toFixed(1)}`),
        i: i++,
      }))
      letters.push({ key: `${li}-${ci}`, transform: `translate(${x.toFixed(1)} ${dy.toFixed(1)}) rotate(${rot.toFixed(1)} ${g.w / 2} 50)`, strokes })
      x += g.w + 20
    }
    return { transform: `translate(0 ${line.y}) rotate(${line.r} 220 50)`, letters }
  })
  return { lines, count: i }
}

export function Chalk({ ready, className }: { ready: boolean; className?: string }) {
  const uid = useId().replace(/:/g, '')
  const laid = useMemo(layOut, [])
  const svgRef = useRef<SVGSVGElement>(null)
  const warpRef = useRef<SVGFETurbulenceElement>(null)
  const displaceRef = useRef<SVGFEDisplacementMapElement>(null)
  const grainRef = useRef<SVGFETurbulenceElement>(null)

  // keep the dust about one screen pixel: baseFrequency and displacement are in viewBox units
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const apply = (width: number) => {
      if (width <= 0) return
      const px = width / 512 // screen px per viewBox unit
      warpRef.current?.setAttribute('baseFrequency', (0.016 / px).toFixed(4))
      displaceRef.current?.setAttribute('scale', (2.4 / px).toFixed(2))
      grainRef.current?.setAttribute('baseFrequency', Math.min(1.6, 0.5 / px).toFixed(3))
    }
    apply(svg.getBoundingClientRect().width)
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver((entries) => apply(entries[entries.length - 1].contentRect.width))
    ro.observe(svg)
    return () => ro.disconnect()
  }, [])

  return (
    <svg
      ref={svgRef}
      className={`w-somia-chalk${className ? ` ${className}` : ''}`}
      viewBox="-12 -12 512 436"
      role="img"
      lang="es"
      aria-label={MOTTO.es}
      data-ready={ready ? 'true' : 'false'}
      focusable="false"
    >
      <defs>
        <filter id={`${uid}-chalk`} x="-8%" y="-8%" width="116%" height="116%" colorInterpolationFilters="sRGB">
          <feTurbulence ref={warpRef} type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4" result="warp" />
          <feDisplacementMap ref={displaceRef} in="SourceGraphic" in2="warp" scale="4" xChannelSelector="R" yChannelSelector="G" result="wob" />
          <feTurbulence ref={grainRef} type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="9" result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3.2 0 0 0 -0.82" result="holes" />
          <feComposite in="wob" in2="holes" operator="in" result="dusty" />
          <feGaussianBlur in="dusty" stdDeviation="0.35" />
        </filter>
      </defs>
      <g filter={`url(#${uid}-chalk)`} className="w-somia-chalk__ink">
        {laid.lines.map((line, li) => (
          <g key={li} transform={line.transform}>
            {line.letters.map((letter) => (
              <g key={letter.key} transform={letter.transform}>
                {letter.strokes.map((stroke) => (
                  <path key={stroke.i} className="w-somia-chalk__s" d={stroke.d} pathLength={1} style={{ ['--i' as string]: stroke.i }} />
                ))}
              </g>
            ))}
          </g>
        ))}
      </g>
    </svg>
  )
}
