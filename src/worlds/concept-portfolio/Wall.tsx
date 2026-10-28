// The stage behind the lane: a teal wall with a butter paper cut laid over it (hard cut shadow, like the slides' own cut-outs), a
// paper-cut sunburst that turns slowly behind the middle slide, and the name painted across both in letters with their own widths.
// All decorative (aria-hidden). The slab drifts at a third of the lane's speed; the rays sit inside it but are shifted back by
// the same amount, so the burst stays behind the slide in the middle (useLane writes both transforms).
import type { RefObject } from 'react'
import { Tape } from '@/components/primitives'
import { rng } from '@/components/primitives/util'
import { COPY } from './copy'
import { WALL_TITLE } from './data'
import { BootPrint } from './icons'
import { StretchWord, autoWidths } from './StretchWord'

/** a hand-cut sunburst: broad-based rays of uneven length, no ray exactly vertical */
function makeRays(seed: number, count: number, long: number, short: number, wide: number): string {
  const rand = rng(seed)
  const point = (angle: number, r: number) => `${(Math.cos(angle) * r).toFixed(1)} ${(Math.sin(angle) * r).toFixed(1)}`
  let d = ''
  for (let i = 0; i < count; i++) {
    const a = ((i + (rand() - 0.5) * 0.45) / count) * Math.PI * 2 + 0.11
    const isLong = i % 2 === 0
    const half = (isLong ? 0.062 : 0.045) * wide + rand() * 0.02
    const length = isLong ? long - rand() * 30 : short + rand() * 80
    d += `M${point(a - half, 70)}L${point(a + (rand() - 0.5) * 0.03, length)}L${point(a + half, 70)}Z`
  }
  return d
}

const RAYS_A = makeRays(11, 16, 498, 330, 1.35)
const RAYS_B = makeRays(29, 10, 430, 270, 0.7)

export function Rays({ className, raysRef }: { className?: string; raysRef?: RefObject<HTMLDivElement> }) {
  return (
    <div ref={raysRef} className={className} aria-hidden="true">
      <svg className="pm-ambient" viewBox="-500 -500 1000 1000" focusable="false">
        <g className="w-cp-rays-a">
          <path d={RAYS_A} />
          <circle r="92" />
        </g>
        <g className="w-cp-rays-b">
          <path d={RAYS_B} />
        </g>
      </svg>
    </div>
  )
}

/** the widths of a title line on a given slide: the authored pattern on the cover, then a new one per slide (same rules: round letters stay wide, L and I stay readable) */
function lineWidths(text: string, authored: readonly number[], line: number, slide: number): readonly number[] {
  return slide === 0 ? authored : autoWidths(text, 1 + slide * 4 + line * 2)
}

/** the two lines of the stage title, once per field: it changes colour exactly where the butter paper is cut */
function Title({ field, slide }: { field: 'butter' | 'teal'; slide: number }) {
  return (
    <div className="w-cp-title" data-over={field}>
      {WALL_TITLE.map((line, i) => (
        <p key={line.text} className={`w-cp-line w-cp-line-${i + 1}`}>
          <StretchWord text={line.text} widths={lineWidths(line.text, line.widths, i, slide)} decorative />
        </p>
      ))}
    </div>
  )
}

interface SheetProps {
  kind: 'call' | 'wrap'
  show: boolean
  head: string
  day: string
  rows: readonly (readonly [string, string])[]
}

/** a paper slip pinned to the wall (decorative, same facts as the sr-only intro). The call sheet greets you on the first slide, the wrap slip on the last. */
function Sheet({ kind, show, head, day, rows }: SheetProps) {
  return (
    <aside className="w-cp-call" data-kind={kind} data-show={show ? 'true' : 'false'} aria-hidden="true">
      <Tape at="top" color={kind === 'call' ? 'var(--cp-salmon)' : 'var(--cp-sun)'} rotate={kind === 'call' ? -3 : 3} w="4.6rem" h="1.5rem" />
      <p className="w-cp-call-head">
        <span>{head}</span>
        <span>{day}</span>
      </p>
      <dl className="w-cp-call-rows">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      {kind === 'wrap' && (
        <div className="w-cp-wrap-prints">
          {[0, 1, 2, 3, 4].map((n) => (
            <BootPrint key={n} foot={n % 2 ? 'l' : 'r'} className="w-cp-boot" />
          ))}
        </div>
      )}
    </aside>
  )
}

interface WallProps {
  slabRef: RefObject<HTMLDivElement>
  raysRef: RefObject<HTMLDivElement>
  /** index of the slide in the middle: the call sheet is pinned on the first, the wrap slip on the last, and the painted title re-stretches on every slide */
  index: number
  last: number
}

export function Wall({ slabRef, raysRef, index, last }: WallProps) {
  return (
    <div className="w-cp-wall" aria-hidden="true">
      <div className="w-cp-speck" />
      <div ref={slabRef} className="w-cp-slab">
        <div className="w-cp-cut" />
        <div className="w-cp-paperwall" />
        <div className="w-cp-ht w-cp-ht-a" />
        <div className="w-cp-ht w-cp-ht-b" />
        <Rays className="w-cp-rays" raysRef={raysRef} />
        <Title field="teal" slide={index} />
        <Title field="butter" slide={index} />
        <Sheet kind="call" show={index === 0} head={COPY.callsheet.head} day={COPY.callsheet.day} rows={COPY.callsheet.rows} />
      </div>
      <Sheet kind="wrap" show={index === last} head={COPY.wrap.head} day={COPY.wrap.day} rows={COPY.wrap.rows} />
    </div>
  )
}
