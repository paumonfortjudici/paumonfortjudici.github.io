// What "Find my name" draws on a page of the book, as the overlay of that page (a box in percent of the page): a pen circle around
// the line, and a reading loupe, a bar of glass laid on the page that shows the same line enlarged from the crop of it, with a
// thin leader to the circle. The overlay never takes the pointer, and the page hides it while a leaf is turning.
import type { CSSProperties } from 'react'
import { Scribble } from '../../components/primitives'
import type { Box } from './data'

export interface LensSpec {
  src: string
  /** size of the picture (reserves the space) */
  w: number
  h: number
  /** how many glass widths wide the picture is drawn */
  zoom: number
  /** where the picture's top-left corner lies behind the glass: x in percent of the glass width, y in percent of its height */
  ix: number
  iy: number
  /** the pen circle on the enlarged line, in percent of the glass */
  ring: { left: number; top: number; width: number; height: number }
  /** what the loupe does to the line on the page: "×6" */
  power: string
  /** size of the glass: width in percent of the page, and width / height */
  width: number
  aspect: number
  /** where the middle of the glass lies on the page, in percent [x, y] */
  at: [number, number]
  /** percent of the picture's width cut away on the right (0 = none) */
  cut: number
  /** paint of the glass behind the picture (a CSS colour); the paper colour when absent */
  bg?: string
}

export interface MarkSpec {
  page: number
  /** the pen circle, in percent of the page */
  ring: Box
  seed: string
  /** changes on every pick, so the pen draws again */
  key: number
  lens: LensSpec
}

const PAGE_W = 1000
const PAGE_H = 1331

export function PageMark({ mark }: { mark: MarkSpec }) {
  const [x, y, w, h] = mark.ring
  const { lens } = mark
  const ratio = (w * PAGE_W) / (h * PAGE_H)
  // the leader runs from the middle of the lens (it hides the start of the line) to the middle of the circle
  const line = {
    x1: lens.at[0] * (PAGE_W / 100),
    y1: lens.at[1] * (PAGE_H / 100),
    x2: (x + w / 2) * (PAGE_W / 100),
    y2: (y + h / 2) * (PAGE_H / 100),
  }
  const lensVars = { '--zoom': lens.zoom, '--ix': lens.ix, '--iy': lens.iy, '--wh': lens.aspect, '--lw': lens.width, '--cut': lens.cut, '--lens-bg': lens.bg } as CSSProperties
  const r = lens.ring
  return (
    <>
      <svg className="w-contract-leader" viewBox={`0 0 ${PAGE_W} ${PAGE_H}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <line {...line} stroke="var(--c-pencil)" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="w-contract-ring" style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }}>
        <Scribble kind="circle" at="around" ratio={ratio} seed={mark.seed} color="var(--c-pencil)" stroke={4} draw={0} />
      </span>
      <span className="w-contract-lens-pos" style={{ left: `${lens.at[0]}%`, top: `${lens.at[1]}%` }}>
        <span className="w-contract-lens" style={lensVars}>
          <img src={lens.src} width={lens.w} height={lens.h} alt="" decoding="async" />
          <span className="w-contract-lens-ring" style={{ left: `${r.left}%`, top: `${r.top}%`, width: `${r.width}%`, height: `${r.height}%` }}>
            <Scribble kind="circle" at="around" ratio={(r.width / r.height) * lens.aspect} seed={`${mark.seed}-lens`} color="var(--c-pencil)" stroke={3.4} draw={750} />
          </span>
          <span className="w-contract-lens-glare" />
        </span>
        <span className="w-contract-lens-power">{lens.power}</span>
      </span>
    </>
  )
}
