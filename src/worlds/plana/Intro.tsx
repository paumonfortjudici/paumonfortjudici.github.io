// The title page and the contents of the atlas, as two grid items so the reading order stays honest: the title (the world's h2) comes
// first in the DOM, then the hero plate, then the table of contents. On a wide screen the grid puts the title and the contents in the
// column to the right of the hero; on a narrow one they stack in DOM order. The contents are buttons that scroll to a plate inside the
// world's own scroller (never a #hash, the router owns the hash). Each row is a plate: number, name, a dotted leader and what you can do.
import { useCallback } from 'react'
import { PLATES, plateId } from './data'
import { useWorld } from '../WorldContext'

export function IntroTitle() {
  return (
    <div className="w-plana-intro">
      <p className="w-plana-intro__kicker">
        <span>Plana Digital</span>
        <span>Brand manual v2.0 · October 2026</span>
      </p>
      <h2 className="w-plana-intro__title">
        <span>Brand</span>{' '}
        <span>
          atlas<span className="w-plana-dot">.</span>
        </span>
      </h2>
      <p className="w-plana-intro__lede">
        Everything I designed for Plana Digital, my new web studio in Cardedeu: the symbol, the logo system, colour, type and the website layout. Seven
        plates, and you can touch every one.
      </p>
    </div>
  )
}

export function Contents() {
  const { scrollRef, reduced } = useWorld()

  const go = useCallback(
    (id: string) => {
      const scroller = scrollRef.current
      const target = document.getElementById(plateId(id))
      if (!scroller || !target) return
      const top = target.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - 14
      scroller.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' })
      target.focus({ preventScroll: true })
    },
    [scrollRef, reduced],
  )

  return (
    <nav className="w-plana-contents" aria-label="Plates">
      <ol className="w-plana-toc">
        {PLATES.map((p) => (
          <li key={p.id}>
            <button type="button" onClick={() => go(p.id)}>
              <span className="w-plana-toc__n" aria-hidden="true">
                {p.n}
              </span>
              <span className="w-plana-toc__t">{p.title}</span>
              <span className="w-plana-toc__leader" aria-hidden="true" />
              <span className="w-plana-toc__h">{p.hint}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}
