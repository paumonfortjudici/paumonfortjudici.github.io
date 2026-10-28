// "The cast": the nine characters as label-maker strips, one per sticker: number, caption, what the character is (one line the
// sheet does not carry) and the accent's hex. Each opens the Details lightbox, so the whole set is reachable without dragging
// anything. The buttons are out of the Tab order (every sticker above is already a tab stop and D opens its details): a screen
// reader or voice control still finds and activates them, a keyboard user does not tab through nine duplicates.
import type { CSSProperties } from 'react'
import { useMediaQuery } from '../../lib/hooks'
import { STICKERS, art } from './data'

/** one line per character, from the art director's notes (what they are, what they carry) */
const ROLE = [
  'Skater with a boombox, mid-ollie',
  'Reader on a book tower, with cat',
  'Designer hugging a giant coffee',
  'Gardener under a monstera',
  'Director on an apple crate',
  'Detective holding one sock',
  'Rug tufter at the frame',
  'Astronaut monkey, one banana',
  'Headphone dancer, high kick',
] as const

interface Props {
  onOpen: (n: number, opener: HTMLElement) => void
}

export function Cast({ onOpen }: Props) {
  // on a phone the strips are one swipeable shelf; a scroll area must be reachable by keyboard, so it is a tab stop only there
  const shelf = useMediaQuery('(max-width: 560px)')
  return (
    <section className="w-illustration-cast" aria-labelledby="w-illustration-cast-h">
      <h3 className="w-illustration-cast-title" id="w-illustration-cast-h">
        The cast
      </h3>
      <ol className="w-illustration-cast-list" {...(shelf ? { tabIndex: 0, role: 'list', 'aria-label': 'The cast, swipe sideways' } : {})}>
        {STICKERS.map((s) => (
          <li key={s.n} style={{ '--accent': s.hex, '--tilt': `${[-1.6, 1.2, -0.6, 1.8, -1.2, 0.8, -2, 1.4, -0.8][s.n - 1]}deg` } as CSSProperties}>
            {/* the picture's alt text: hidden here (so it is not read twice), used as the accessible description of this button and of the sticker itself */}
            <span hidden id={`w-illustration-alt-${s.n}`}>
              {s.alt}
            </span>
            <button
              type="button"
              className="w-illustration-chip"
              tabIndex={-1}
              aria-label={`${s.caption}, sticker ${s.n} of ${STICKERS.length}: open details`}
              aria-describedby={`w-illustration-alt-${s.n}`}
              onClick={(e) => onOpen(s.n, e.currentTarget)}
            >
              <img className="w-illustration-chip-art" src={art(s.thumb)} width={300} height={400} alt="" loading="lazy" decoding="async" />
              <span className="w-illustration-chip-n">{String(s.n).padStart(2, '0')}</span>
              <span className="w-illustration-chip-cap">{s.caption}</span>
              <span className="w-illustration-chip-role">{ROLE[s.n - 1]}</span>
              <span className="w-illustration-chip-hex" aria-hidden="true">
                {s.hex}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  )
}
