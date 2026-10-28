// The translation card of the window. The shop speaks Spanish, so whatever section is on show gets its English line (and the
// Spanish original in italics where the page prints a short phrase), like film subtitles for a foreign picture.
// It follows the tour's master progress: it is lettered on the glass when the window is wide, and sits under the tape when the
// window is narrow. The text changes only when the section changes (a handful of times per pass), so React state is fine here.

import { useEffect, useMemo, useState } from 'react'
import type { Caption, Chapter } from './data'
import type { Tour } from './tour'

interface SubtitleProps {
  tour: Tour
  chapters: Chapter[]
  captions: Record<string, Caption>
  /** each chapter's position on the tape, 0..1 */
  marks: number[]
  where: 'glass' | 'sill' | 'stage'
}

export function Subtitle({ tour, chapters, captions, marks, where }: SubtitleProps) {
  const [index, setIndex] = useState(0)
  const key = useMemo(() => chapters.map((c) => c.id).join('|'), [chapters])

  // the engine calls back every frame while the tour moves: React hears about it only when the section changes
  useEffect(() => {
    let current = -1
    return tour.subscribe((p) => {
      let next = 0
      for (let i = 0; i < marks.length; i++) if (p + 0.004 >= marks[i]) next = i
      if (next !== current) {
        current = next
        setIndex(next)
      }
    })
  }, [tour, marks])

  const chapter = chapters[Math.min(index, chapters.length - 1)]
  const caption = chapter ? captions[chapter.id] : undefined
  if (!chapter || !caption) return null

  return (
    <p className="w-somia-sub" data-where={where}>
      <span key={`${key}-${chapter.id}`} className="w-somia-sub__line">
        <span className="w-somia-sub__label">{chapter.label}</span>
        <span className="w-somia-sub__en">{caption.en}</span>
        {caption.es && (
          <span className="w-somia-sub__es" lang="es">
            {caption.es}
          </span>
        )}
      </span>
    </p>
  )
}
