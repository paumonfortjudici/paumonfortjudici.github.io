// The die-cut lettering of the world's title: every letter is a vinyl letter sticker in one of the nine accents, stuck on by hand
// (a little tilt, a little off the baseline). The title is painted in THREE identical layers stacked in one grid cell, bottom to top:
// one white halo for the whole word (the die-cut border, so it never covers a neighbouring letter), the ink keylines, then the flat
// accent fills. Painting per layer, not per letter, is what keeps every letter whole where two of them touch.
import type { CSSProperties } from 'react'

const ACCENTS = ['lilac', 'tangerine', 'sky', 'mint', 'butter', 'tomato', 'pink', 'teal', 'lime'] as const
const TILT = [-4, 3, -2.5, 4, -3, 2.5, -4, 3.5, -2, 4, -3.5, 2]
const DROP = [0.02, -0.03, 0.03, -0.02, 0.025, -0.03, 0.02, -0.025, 0.03, -0.02, 0.02, -0.03]
const WORDS = ['STICKER', 'SHEET'] as const
const LAYERS = ['halo', 'key', 'fill'] as const

export function Title() {
  return (
    <h2 className="w-illustration-title">
      {/* the one accessible name; the die-cut letters below are painted by CSS (data-c) and hidden from assistive technology */}
      <span className="pm-sr">Sticker sheet</span>
      <span className="w-illustration-art" aria-hidden="true">
        {LAYERS.map((layer) => {
          let k = 0
          return (
            <span className="w-illustration-tl" data-layer={layer} key={layer}>
              {WORDS.map((word) => (
                <span className="w-illustration-word" key={word}>
                  {[...word].map((ch, i) => {
                    const idx = k++
                    const style = { '--c': `var(--wi-${ACCENTS[idx % ACCENTS.length]})`, '--tilt': `${TILT[idx % TILT.length]}deg`, '--drop': `${DROP[idx % DROP.length]}em` } as CSSProperties
                    return <span className="w-illustration-ch" data-c={ch} style={style} key={i} />
                  })}
                </span>
              ))}
            </span>
          )
        })}
      </span>
    </h2>
  )
}
