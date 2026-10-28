// The sections of the page on show, as a large list on the glass beside a solo phone: a second way to jump (the tape's
// chips are the first), lettered big enough to fill the window. The active section is written straight to the DOM by the
// tour's per-frame callback, like the tape's pin (no React per frame).

import { useEffect, useRef } from 'react'
import type { Chapter } from './data'
import type { Tour } from './tour'

interface SectionsProps {
  tour: Tour
  chapters: Chapter[]
  /** each chapter's position on the tape, 0..1 */
  marks: number[]
  /** reduced motion: jumps are instant */
  still: boolean
}

export function Sections({ tour, chapters, marks, still }: SectionsProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([])

  useEffect(() => {
    let active = -1
    return tour.subscribe((p) => {
      let index = 0
      for (let i = 0; i < marks.length; i++) if (p + 0.004 >= marks[i]) index = i
      if (index === active) return
      active = index
      refs.current.forEach((button, i) => {
        if (!button) return
        if (i === index) button.setAttribute('aria-current', 'true')
        else button.removeAttribute('aria-current')
      })
    })
  }, [tour, marks])

  return (
    <ol className="w-somia-rooms">
      {chapters.map((chapter, i) => (
        <li key={chapter.id}>
          <button
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            className="w-somia-room"
            onClick={() => tour.tweenTo(marks[i], still ? 0 : 700)}
          >
            <span className="w-somia-room__n" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="w-somia-room__name">{chapter.label}</span>
          </button>
        </li>
      ))}
    </ol>
  )
}
