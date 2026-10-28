// The contents slip of the open band: a typed paper slip taped to the folder, "Inside the folder", three lines you can tick off. It is the
// template's list of radio-like items for an open chapter, kept as a physical object. The lines come from ./inside.ts (what the world
// lets you do); the search reads them too, and the words it matched are underlined in pen like everywhere else on the sheet.
import type { CSSProperties } from 'react'
import { Tape } from '../../primitives'
import { INSIDE } from './contents'
import { Marked } from './Marked'
import { CAT_UI } from './strings'

/** a hand-drawn box and the pen tick in it (the tick draws in when the band opens: clip-path, see catalog.css) */
function Tick({ seed }: { seed: number }) {
  return (
    <svg className="pm-cat-tick" viewBox="0 0 22 22" aria-hidden="true" focusable="false">
      <path className="pm-cat-tick__box" d={seed % 2 ? 'M4 4.6Q11 3.2 18.2 4.4Q19.2 11 18 18.4Q11 19.6 4.2 18Q3 11 4 4.6Z' : 'M3.6 4.2Q11 3 18.4 4.8Q19 11.6 17.8 18Q10.6 19 4.6 18.4Q3.2 11 3.6 4.2Z'} />
      <path className="pm-cat-tick__pen" d="M5.2 11.6Q8.2 14 9.6 17.2Q12.6 8.4 20.2 2.4" />
    </svg>
  )
}

interface InsideProps {
  slug: string
  /** the query's folded words, for the underlines */
  words: string[]
  /** tape colour (the same piece that holds the print) */
  tape: string
}

export function Inside({ slug, words, tape }: InsideProps) {
  const lines = INSIDE[slug]
  if (!lines || lines.length === 0) return null
  return (
    <div className="pm-cat-inside">
      <Tape at="top" color={tape} pattern="stripes" w="4rem" h="1.4rem" rotate={-3} />
      <h4 className="pm-cat-inside__t">{CAT_UI.inside}</h4>
      <ul className="pm-cat-inside__list">
        {lines.map((line, i) => (
          <li key={line} style={{ '--n': i } as CSSProperties}>
            <Tick seed={i} />
            <span>
              <Marked text={line} words={words} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
