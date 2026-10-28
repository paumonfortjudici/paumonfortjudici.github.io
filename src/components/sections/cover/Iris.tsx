// The aperture behind the cover lettering: a nine-blade iris inside a lens barrel with a ring of focus ticks.
// Decorative (aria-hidden), drawn once from geometry (no assets). The colours come from the CSS (currentColor for the lines,
// --iris-blade for every other blade, --iris-open for the opening), so the ring stays a whisper behind the letters.
// The blades "open" once when the cover arrives (cover.css).

const BLADES = 9
const R_BARREL = 304 // outer lens ring
const R_RING = 282 // where the blade edges end
const R_OPEN = 92 // circumradius of the opening
const TICKS = 72

interface Iris {
  opening: string
  edges: string
  blades: string
  ticks: string
}

const n1 = (v: number): string => (Math.round(v * 10) / 10).toString()
const pt = (x: number, y: number): string => `${n1(x)} ${n1(y)}`

function build(): Iris {
  const verts = Array.from({ length: BLADES }, (_, k) => {
    const a = (k / BLADES) * Math.PI * 2 - Math.PI / 2
    return [R_OPEN * Math.cos(a), R_OPEN * Math.sin(a)] as const
  })
  const opening = `M${verts.map(([x, y]) => pt(x, y)).join('L')}Z`

  // every blade edge continues one side of the opening until it meets the ring
  const ends = verts.map(([x, y], k) => {
    const [px, py] = verts[(k + BLADES - 1) % BLADES]
    const len = Math.hypot(x - px, y - py)
    const ux = (x - px) / len
    const uy = (y - py) / len
    const b = x * ux + y * uy
    const s = -b + Math.sqrt(b * b - (x * x + y * y) + R_RING * R_RING)
    return [x + ux * s, y + uy * s] as const
  })
  const edges = verts.map(([x, y], k) => `M${pt(x, y)}L${pt(ends[k][0], ends[k][1])}`).join('')

  // the visible face of every other blade: between its own edge, the next edge, the ring and the opening's side
  let blades = ''
  for (let k = 0; k < BLADES; k += 2) {
    const next = (k + 1) % BLADES
    blades += `M${pt(verts[k][0], verts[k][1])}L${pt(ends[k][0], ends[k][1])}A${R_RING} ${R_RING} 0 0 1 ${pt(ends[next][0], ends[next][1])}L${pt(verts[next][0], verts[next][1])}Z`
  }

  // lens barrel: long ticks every 6th, short ones between
  let ticks = ''
  for (let k = 0; k < TICKS; k++) {
    const a = (k / TICKS) * Math.PI * 2
    const long = k % 6 === 0
    const r0 = R_RING + 8
    const r1 = R_BARREL - (long ? 6 : 14)
    ticks += `M${pt(r0 * Math.cos(a), r0 * Math.sin(a))}L${pt(r1 * Math.cos(a), r1 * Math.sin(a))}`
  }
  return { opening, edges, blades, ticks }
}

const IRIS = build()

export function Iris({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="-320 -320 640 640" aria-hidden="true" focusable="false">
      <path className="cv-iris__blade" d={IRIS.blades} />
      <path className="cv-iris__open" d={IRIS.opening} />
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <circle r={R_BARREL} strokeWidth="2.6" />
        <circle r={R_RING} strokeWidth="1.6" />
        <path d={IRIS.ticks} strokeWidth="1.6" />
        <path d={IRIS.edges} strokeWidth="1.8" />
        <path d={IRIS.opening} strokeWidth="2.2" />
      </g>
    </svg>
  )
}
