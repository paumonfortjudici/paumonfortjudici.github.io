// The die-cut lettering of the world's title: every letter is a vinyl sticker in one of the nine accents, with a keyline,
// a white halo and a hard shadow, stuck on by hand (a little tilt and a little off the baseline).
import type { CSSProperties } from 'react'

const ACCENTS = ['lilac', 'tangerine', 'sky', 'mint', 'butter', 'tomato', 'pink', 'teal', 'lime'] as const
const TILT = [-4, 3, -2.5, 4, -3, 2.5, -4, 3.5, -2, 4, -3.5, 2]
const DROP = [0.02, -0.03, 0.03, -0.02, 0.025, -0.03, 0.02, -0.025, 0.03, -0.02, 0.02, -0.03]
const WORDS = ['STICKER', 'SHEET'] as const

export function Title() {
  let k = 0
  return (
    <h2 className="w-illustration-title">
      {/* the one accessible name; the die-cut letters below are painted by CSS (data-c) and hidden from assistive technology */}
      <span className="pm-sr">Sticker sheet</span>
      {WORDS.map((word) => (
        <span className="w-illustration-word" key={word} aria-hidden="true">
          {[...word].map((ch, i) => {
            const idx = k++
            const style = { '--c': `var(--wi-${ACCENTS[idx % ACCENTS.length]})`, '--tilt': `${TILT[idx % TILT.length]}deg`, '--drop': `${DROP[idx % DROP.length]}em` } as CSSProperties
            return (
              <span className="w-illustration-ch" data-c={ch} style={style} key={i} />
            )
          })}
        </span>
      ))}
    </h2>
  )
}
