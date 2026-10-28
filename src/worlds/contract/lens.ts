// The geometry of the reading loupe that "Find my name" lays on a page: a bar of glass (width in percent of the page, a fixed
// aspect) showing one line enlarged from its crop. Everything is derived from the real boxes in the manifest: pick the part of the
// picture to fit in the glass (`view`), the part to circle (`mark`), and this returns where the picture sits behind the glass and
// where the pen goes, as percentages the CSS can use as they are.
import type { LensSpec } from './PageMark'

/** [left, top, width, height] as fractions (0..1) of the picture */
export type Frac = [number, number, number, number]

export interface LensInput {
  src: string
  /** intrinsic size of the picture */
  w: number
  h: number
  /** the part of the picture that must fill `fill` of the glass width */
  view: Frac
  /** the part of the picture the pen circles */
  mark: Frac
  fill: number
  /** nudges of the view inside the glass: dx in glass widths, dy in glass heights */
  dx?: number
  dy?: number
  /** width of the glass in percent of the page, and its width / height */
  width: number
  aspect: number
  /** where the middle of the glass lies on the page, percent [x, y] */
  at: [number, number]
  /** how wide the view is on the printed page, in percent of the page (for the magnification tag) */
  printedPct: number
  /** the picture is cut off at this fraction of its width (the glass shows nothing of what lies beyond), and the glass is painted in `bg` */
  cutAt?: number
  bg?: string
}

export function makeLens(i: LensInput): LensSpec {
  const [vx, vy, vw, vh] = i.view
  const [mx, my, mw, mh] = i.mark
  const dx = i.dx ?? 0
  const dy = i.dy ?? 0
  const A = i.aspect
  const zoom = i.fill / vw // picture width, in glass widths
  const zoomH = zoom * (i.h / i.w) // picture height, in glass widths
  // where the picture's top-left corner lies behind the glass: x in percent of the glass width, y in percent of its height
  const ix = (0.5 + dx - (vx + vw / 2) * zoom) * 100
  const iy = (0.5 + dy - (vy + vh / 2) * zoomH * A) * 100
  // the pen: the mark box in glass units
  const ringL = (ix / 100 + mx * zoom) * 100
  const ringT = (iy / 100 + my * zoomH * A) * 100
  const ringW = mw * zoom * 100
  const ringH = mh * zoomH * A * 100
  return {
    src: i.src,
    w: i.w,
    h: i.h,
    zoom,
    ix,
    iy,
    ring: { left: ringL, top: ringT, width: ringW, height: ringH },
    power: `×${Math.max(1, Math.round((i.fill * i.width) / i.printedPct))}`,
    width: i.width,
    aspect: A,
    at: i.at,
    cut: i.cutAt === undefined ? 0 : (1 - i.cutAt) * 100,
    bg: i.bg,
  }
}
