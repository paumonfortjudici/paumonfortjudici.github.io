// <Scribble> - hand-drawn marks (underline, circle, arrow, burst, squiggle, tick) that draw themselves on; seeded, aria-hidden.
// Props: kind, seed, color (tone or CSS), w (CSS width), ratio (w / h), dir (arrow), stroke (px, 3.4), draw (true | delay | false),
// filled (burst), at ('under' | 'around': overlays a position:relative parent, e.g. a word), rotate.
// Exposes --w --d --dur --rot. Docs: docs/api/primitives.md

import { useId, useMemo, useRef, type CSSProperties } from 'react'
import { useInkWidth, useRevealOnce } from './hooks'
import { makeMark, type ScribbleKind } from './scribbleGen'
import { cx, TONES, type ToneName } from './util'

export type ScribbleDir = 'right' | 'left' | 'up' | 'down' | 'up-right' | 'up-left' | 'down-right' | 'down-left'

export interface ScribbleProps {
  kind: ScribbleKind
  seed?: number | string
  color?: ToneName | string
  w?: number | string
  ratio?: number
  dir?: ScribbleDir
  stroke?: number
  draw?: boolean | number
  filled?: boolean
  at?: 'under' | 'around'
  rotate?: number
  className?: string
  style?: CSSProperties
}

const DEFAULT_W: Record<ScribbleKind, string> = {
  underline: '10rem',
  squiggle: '7rem',
  circle: '9rem',
  arrow: '7.5rem',
  burst: '5.5rem',
  tick: '2.8rem',
}
const DUR: Record<ScribbleKind, string> = {
  underline: '0.55s',
  squiggle: '0.65s',
  circle: '0.85s',
  arrow: '0.75s',
  burst: '0.6s',
  tick: '0.45s',
}
const ROTATION: Record<ScribbleDir, number> = { right: 0, 'down-right': 40, down: 90, 'down-left': 140, left: 180, 'up-left': 220, up: 270, 'up-right': 320 }

export function Scribble({ kind, seed, color, w, ratio, dir = 'right', stroke = 3.4, draw = true, filled, at, rotate, className, style }: ScribbleProps) {
  const uid = useId()
  const mark = useMemo(() => makeMark(kind, seed ?? uid, ratio), [kind, seed, uid, ratio])
  const svgRef = useRef<SVGSVGElement | null>(null)
  const inkRef = useRef<SVGGElement | null>(null)
  useRevealOnce(svgRef, { disabled: draw === false, threshold: 0.2 })
  useInkWidth(svgRef, inkRef, (width) => Math.min((stroke * mark.w) / width, mark.h * 0.14), [mark, stroke])

  const paint = color === undefined ? 'currentColor' : color in TONES ? TONES[color as ToneName].color : color
  const delay = typeof draw === 'number' ? draw : 0
  const rot = (kind === 'arrow' ? ROTATION[dir] : 0) + (rotate ?? 0)
  const vars = {
    '--w': w === undefined ? DEFAULT_W[kind] : typeof w === 'number' ? `${w}px` : w,
    '--d': `${delay}ms`,
    '--dur': DUR[kind],
    '--rot': `${rot}deg`,
    color: paint,
    ...style,
  } as CSSProperties
  return (
    <svg
      ref={svgRef}
      className={cx('pm-sc', className)}
      style={vars}
      viewBox={`0 0 ${mark.w} ${mark.h}`}
      preserveAspectRatio={at === 'around' ? 'none' : undefined}
      aria-hidden="true"
      focusable="false"
      data-kind={kind}
      data-at={at}
      data-draw={draw === false ? undefined : ''}
      data-filled={filled ? '' : undefined}
    >
      <g ref={inkRef} className="pm-sc__ink" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
        {mark.paths.map((d, i) => (
          <path key={i} className="pm-sc__p" d={d} pathLength={1} style={{ '--p': i } as CSSProperties} />
        ))}
      </g>
    </svg>
  )
}
