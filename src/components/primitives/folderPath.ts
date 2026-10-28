// The silhouette of a folder (body + tab + the two concave "inverted radius" shoulders) as ONE closed SVG path.
// Same geometry as the template's --fr technique (tab corner radius = shoulder radius = fr), but drawn as a single
// path instead of three abutting CSS boxes: there is nothing to leave a hairline seam at 125 % / 150 % zoom or dpr 1.25,
// and the same path feeds the fill, the paper-thickness edge, the rim, the highlight and the focus ring.
//
// Coordinates: origin = top-left of the folder box. The tab lives in y = 0..th, the body in y = th..h.

export interface FolderShape {
  w: number
  h: number
  /** tab height (= y of the body's top edge). 0 = no tab: a plain rounded panel */
  th: number
  /** left edge of the tab's straight side (the shoulders extend `fr` further out at the bottom) */
  tabX: number
  tabW: number
  /** tab corner radius = shoulder radius */
  fr: number
  /** body corner radius */
  br: number
  flush?: 'left' | 'right'
}

const f = (n: number): string => String(Math.round(n * 100) / 100)

export interface TabPlacement {
  /** left edge of the tab's straight side */
  x: number
  /** the flush side actually used (a tab that cannot fit between the two corner arcs hugs the nearer edge) */
  flush?: 'left' | 'right'
}

/**
 * Where the tab goes for a position t (0..1) along the top edge, keeping both shoulders clear of the body's corner arcs.
 * When the folder is too narrow for that, the tab hugs the nearer edge (flush) instead of overflowing it.
 */
export function placeTab(t: number, w: number, tabW: number, fr: number, br: number, flush?: 'left' | 'right'): TabPlacement {
  if (flush === 'left') return { x: 0, flush }
  if (flush === 'right') return { x: w - tabW, flush }
  const lo = br + fr
  const hi = w - br - fr - tabW
  if (hi < lo) return t < 0.5 ? { x: 0, flush: 'left' } : { x: w - tabW, flush: 'right' }
  return { x: Math.round(lo + Math.min(1, Math.max(0, t)) * (hi - lo)) }
}

export function folderPath(s: FolderShape): string {
  const { w, h, th, tabX, tabW, flush } = s
  const br = Math.min(s.br, w / 2, h / 2)
  if (th <= 0) {
    return `M${f(br)} 0H${f(w - br)}A${f(br)} ${f(br)} 0 0 1 ${f(w)} ${f(br)}V${f(h - br)}A${f(br)} ${f(br)} 0 0 1 ${f(w - br)} ${f(h)}H${f(br)}A${f(br)} ${f(br)} 0 0 1 0 ${f(h - br)}V${f(br)}A${f(br)} ${f(br)} 0 0 1 ${f(br)} 0Z`
  }
  const r = Math.max(1, Math.min(s.fr, tabW / 2 - 0.5, th / 2 - 0.5))
  const bl = flush === 'left' ? 0 : br
  const brr = flush === 'right' ? 0 : br
  const x0 = tabX
  const x1 = tabX + tabW
  const p: string[] = [`M${f(bl)} ${f(th)}`]
  // left side of the tab
  if (flush === 'left') p.push(`V${f(r)}`, `A${f(r)} ${f(r)} 0 0 1 ${f(r)} 0`)
  else p.push(`H${f(x0 - r)}`, `A${f(r)} ${f(r)} 0 0 0 ${f(x0)} ${f(th - r)}`, `V${f(r)}`, `A${f(r)} ${f(r)} 0 0 1 ${f(x0 + r)} 0`)
  // right side of the tab
  if (flush === 'right') p.push(`H${f(w - r)}`, `A${f(r)} ${f(r)} 0 0 1 ${f(w)} ${f(r)}`, `V${f(th)}`)
  else p.push(`H${f(x1 - r)}`, `A${f(r)} ${f(r)} 0 0 1 ${f(x1)} ${f(r)}`, `V${f(th - r)}`, `A${f(r)} ${f(r)} 0 0 0 ${f(x1 + r)} ${f(th)}`, `H${f(w - brr)}`)
  if (brr) p.push(`A${f(brr)} ${f(brr)} 0 0 1 ${f(w)} ${f(th + brr)}`)
  // body: right edge, bottom, left edge
  p.push(`V${f(h - br)}`, `A${f(br)} ${f(br)} 0 0 1 ${f(w - br)} ${f(h)}`, `H${f(br)}`, `A${f(br)} ${f(br)} 0 0 1 0 ${f(h - br)}`)
  if (flush === 'left') p.push(`V${f(th)}`)
  else p.push(`V${f(th + bl)}`, `A${f(bl)} ${f(bl)} 0 0 1 ${f(bl)} ${f(th)}`)
  return p.join('') + 'Z'
}

/** The upward-facing edges only (open path): the body's top edge, the tab outline and the two top corners. Used for the 1px highlight. */
export function folderTopEdge(s: FolderShape): string {
  const { w, th, tabX, tabW, flush } = s
  const br = Math.min(s.br, w / 2, s.h / 2)
  if (th <= 0) return `M0 ${f(br)}A${f(br)} ${f(br)} 0 0 1 ${f(br)} 0H${f(w - br)}A${f(br)} ${f(br)} 0 0 1 ${f(w)} ${f(br)}`
  const r = Math.max(1, Math.min(s.fr, tabW / 2 - 0.5, th / 2 - 0.5))
  const bl = flush === 'left' ? 0 : br
  const brr = flush === 'right' ? 0 : br
  const x0 = tabX
  const x1 = tabX + tabW
  const p: string[] = []
  if (flush === 'left') p.push(`M0 ${f(r)}A${f(r)} ${f(r)} 0 0 1 ${f(r)} 0`)
  else p.push(`M0 ${f(th + bl)}A${f(bl)} ${f(bl)} 0 0 1 ${f(bl)} ${f(th)}`, `H${f(x0 - r)}`, `A${f(r)} ${f(r)} 0 0 0 ${f(x0)} ${f(th - r)}`, `V${f(r)}`, `A${f(r)} ${f(r)} 0 0 1 ${f(x0 + r)} 0`)
  if (flush === 'right') p.push(`H${f(w - r)}`, `A${f(r)} ${f(r)} 0 0 1 ${f(w)} ${f(r)}`)
  else p.push(`H${f(x1 - r)}`, `A${f(r)} ${f(r)} 0 0 1 ${f(x1)} ${f(r)}`, `V${f(th - r)}`, `A${f(r)} ${f(r)} 0 0 0 ${f(x1 + r)} ${f(th)}`, `H${f(w - brr)}`, brr ? `A${f(brr)} ${f(brr)} 0 0 1 ${f(w)} ${f(th + brr)}` : '')
  return p.join('')
}
