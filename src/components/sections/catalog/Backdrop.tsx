// The ground of the dark sheet. Two quiet layers, both decorative (aria-hidden) and both doing a job:
//  - a halftone field in marigold, the sheet's accent (the riso plate behind the lettering);
//  - a COUNTDOWN LEADER that is also a gauge: a ring of ten arcs, one per folder, in that folder's own colour. Arcs of folders that match
//    the search stay lit, the others go dark (the typed count above the stack says the same in words); the open band's arc is the
//    needle: full strength and thicker.
// The leader is the cinema detail of this sheet; the Cover has the iris, so the two sheets do not repeat each other.
import { useMemo } from 'react'
import { WORKS } from '@/lib/works'

const R_RING = 268
const R_ARCS = 232
const R_INNER = 188
const GAP = 4 // degrees between two arcs

const n1 = (v: number): string => (Math.round(v * 10) / 10).toString()
const polar = (r: number, deg: number): [number, number] => {
  const a = ((deg - 90) * Math.PI) / 180
  return [r * Math.cos(a), r * Math.sin(a)]
}
function arc(r: number, from: number, to: number): string {
  const [x0, y0] = polar(r, from)
  const [x1, y1] = polar(r, to)
  return `M${n1(x0)} ${n1(y0)}A${r} ${r} 0 0 1 ${n1(x1)} ${n1(y1)}`
}

interface BackdropProps {
  /** slugs of the folders that match the search */
  lit: ReadonlySet<string>
  /** the band that is open: its arc is the dial's needle */
  open: string | null
}

export function Backdrop({ lit, open }: BackdropProps) {
  const arcs = useMemo(() => {
    const step = 360 / WORKS.length
    return WORKS.map((w, i) => ({ slug: w.slug, color: w.color, d: arc(R_ARCS, i * step + GAP / 2, (i + 1) * step - GAP / 2) }))
  }, [])
  const ticks = useMemo(() => {
    let d = ''
    for (let i = 0; i < 100; i++) {
      const long = i % 10 === 0
      const [x0, y0] = polar(R_RING - 8, i * 3.6)
      const [x1, y1] = polar(R_RING - (long ? 26 : 16), i * 3.6)
      d += `M${n1(x0)} ${n1(y0)}L${n1(x1)} ${n1(y1)}`
    }
    return d
  }, [])

  return (
    <div className="pm-cat-bg" aria-hidden="true">
      <div className="pm-cat-halftone" />
      <div className="pm-cat-leader">
        <svg className="pm-cat-leader__svg" viewBox="-300 -300 600 600" focusable="false">
          <g fill="none" stroke="currentColor" strokeLinecap="butt">
            <circle r={R_RING} strokeWidth="2.4" />
            <path d={ticks} strokeWidth="1.8" />
            <circle r={R_INNER} strokeWidth="2" />
            <path d={`M-${R_INNER} 0H${R_INNER}M0 -${R_INNER}V${R_INNER}`} strokeWidth="1.6" />
          </g>
          <g className="pm-cat-leader__arcs" fill="none" strokeWidth="22" strokeLinecap="butt">
            {arcs.map((a) => (
              <path key={a.slug} d={a.d} stroke={a.color} data-lit={lit.has(a.slug) ? '' : undefined} />
            ))}
          </g>
          <g className="pm-cat-leader__needle" fill="none" strokeWidth="36" strokeLinecap="butt">
            {arcs.map((a) => (
              <path key={a.slug} d={a.d} stroke={a.color} data-open={a.slug === open ? '' : undefined} />
            ))}
          </g>
        </svg>
      </div>
    </div>
  )
}
