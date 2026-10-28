// A small card for the cell under the "Next release" tag: every rug whose size is printed in a caption, drawn to scale on a 10 cm
// grid, like the cutting mat on a tufter's wall. The sizes are the caption numbers (cm); nothing else is claimed about the rugs.
// The mat is a picture (aria-hidden); the legend is the text, in the order the rugs appear on the wall.
import type { CSSProperties } from 'react'

interface Rug {
  n: number
  name: string
  w: number
  h: number
  /** top-left corner on the mat, in cm */
  x: number
  y: number
}

/** the mat is 310 x 170 cm with a 10 cm margin all round */
const MAT_W = 330
const MAT_H = 190

const RUGS: Rug[] = [
  { n: 1, name: 'Smiley', w: 60, h: 60, x: 250, y: 90 },
  { n: 2, name: 'Cut-out', w: 70, h: 60, x: 170, y: 90 },
  { n: 3, name: 'Faceted', w: 90, h: 140, x: 0, y: 0 },
  { n: 4, name: 'Trippy eye', w: 60, h: 120, x: 100, y: 0 },
  { n: 5, name: 'Greyscale', w: 120, h: 80, x: 170, y: 0 },
  { n: 6, name: 'Sneakers', w: 60, h: 40, x: 100, y: 130 },
]

export default function Sizes({ col }: { col: 'left' | 'right' }) {
  return (
    <aside className="w-fortyfour-lab-sizes" data-pack="" data-col={col} aria-label="The rug sizes from the captions, to scale">
      <div className="w-fortyfour-lab-sizes-head">
        <p className="w-fortyfour-lab-sizes-label t-label">To scale</p>
        <p className="w-fortyfour-lab-sizes-note">each square is 10 cm</p>
      </div>
      <div className="w-fortyfour-lab-mat" aria-hidden="true" style={{ aspectRatio: `${MAT_W} / ${MAT_H}` }}>
        {RUGS.map((rug) => (
          <span
            key={rug.n}
            className="w-fortyfour-lab-mat-rug"
            data-n={rug.n}
            style={
              {
                left: `${(((rug.x + 10) / MAT_W) * 100).toFixed(3)}%`,
                top: `${(((rug.y + 10) / MAT_H) * 100).toFixed(3)}%`,
                width: `${((rug.w / MAT_W) * 100).toFixed(3)}%`,
                height: `${((rug.h / MAT_H) * 100).toFixed(3)}%`,
              } as CSSProperties
            }
          >
            <span className="w-fortyfour-lab-mat-n">{rug.n}</span>
          </span>
        ))}
      </div>
      <ol className="w-fortyfour-lab-sizes-list">
        {RUGS.map((rug) => (
          <li key={rug.n}>
            <span className="w-fortyfour-lab-sizes-n" aria-hidden="true">
              {rug.n}
            </span>
            <span className="w-fortyfour-lab-sizes-name">{rug.name}</span>
            <span className="w-fortyfour-lab-sizes-dim">
              {rug.w} × {rug.h}
              <span className="pm-sr"> centimetres</span>
            </span>
          </li>
        ))}
      </ol>
    </aside>
  )
}
