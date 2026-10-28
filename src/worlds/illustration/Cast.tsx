// "The cast": the nine captions as label-maker strips, one per sticker. Each opens the Details lightbox, so the whole set is
// reachable without dragging anything (and in a plain reading order for screen readers).
import type { CSSProperties } from 'react'
import { STICKERS, art } from './data'

interface Props {
  onOpen: (n: number, opener: HTMLElement) => void
}

export function Cast({ onOpen }: Props) {
  return (
    <section className="w-illustration-cast" aria-labelledby="w-illustration-cast-h">
      <h3 className="w-illustration-cast-title" id="w-illustration-cast-h">
        The cast
      </h3>
      <ol className="w-illustration-cast-list">
        {STICKERS.map((s) => (
          <li key={s.n} style={{ '--accent': s.hex, '--tilt': `${[-1.6, 1.2, -0.6, 1.8, -1.2, 0.8, -2, 1.4, -0.8][s.n - 1]}deg` } as CSSProperties}>
            {/* the picture's alt text: hidden here (so it is not read twice), used as the accessible description of this button and of the sticker itself */}
            <span hidden id={`w-illustration-alt-${s.n}`}>
              {s.alt}
            </span>
            <button
              type="button"
              className="w-illustration-chip"
              data-cursor="Open"
              aria-label={`${s.caption}, sticker ${s.n} of ${STICKERS.length}: open details`}
              aria-describedby={`w-illustration-alt-${s.n}`}
              onClick={(e) => onOpen(s.n, e.currentTarget)}
            >
              <img className="w-illustration-chip-art" src={art(s.thumb)} width={300} height={400} alt="" loading="lazy" decoding="async" />
              <span className="w-illustration-chip-n">{String(s.n).padStart(2, '0')}</span>
              <span className="w-illustration-chip-cap">{s.caption}</span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  )
}
