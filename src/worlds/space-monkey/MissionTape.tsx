// The mission tape: a yellow measuring tape with one tick per day from 1 December 2013 to 31 May 2014, and paper tags
// hanging off it at the real dates. The long empty stretch between the posters and opening day is the point.
// Horizontal from 720 px up; vertical (tags on both sides) on phones. Positions are CSS only (--at = day / 182).
import { useId, type CSSProperties } from 'react'
import { TAPE_DAYS, TAPE_GAP_LABEL, TAPE_MARKS, TAPE_MONTHS } from './data'

const at = (day: number) => day / TAPE_DAYS

export function MissionTape() {
  const id = useId()
  const last = TAPE_MARKS[0]
  const open = TAPE_MARKS[1]
  return (
    <section className="w-space-monkey-tape-section" aria-labelledby={`${id}-h`}>
      <div className="w-space-monkey-tape-head">
        <h3 id={`${id}-h`} className="w-space-monkey-h3">
          From file to opening day
        </h3>
        <p className="w-space-monkey-tape-legend">One tick per day, from 1 December 2013 to 31 May 2014.</p>
      </div>
      <div className="w-space-monkey-tape" style={{ '--days': TAPE_DAYS } as CSSProperties}>
        <div className="w-space-monkey-tape-band" aria-hidden="true">
          {TAPE_MONTHS.map((m) => (
            <span key={m.label} className="w-space-monkey-tape-month" style={{ '--at': at(m.day) } as CSSProperties}>
              {m.label}
            </span>
          ))}
        </div>

        <ol className="w-space-monkey-tape-marks">
          {TAPE_MARKS.map((m) => (
            <li
              key={m.date}
              className="w-space-monkey-tape-mark"
              data-side={m.side}
              data-strong={m.strong ? 'true' : undefined}
              style={{ '--at': at(m.day) } as CSSProperties}
            >
              <span className="w-space-monkey-tape-stem" aria-hidden="true" />
              <span className="w-space-monkey-tape-tag">
                <b>{m.date}</b>
                <span>{m.text}</span>
              </span>
            </li>
          ))}
        </ol>

        <div
          className="w-space-monkey-tape-gap"
          style={{ '--from': at(last.day), '--to': at(open.day) } as CSSProperties}
        >
          <span>{TAPE_GAP_LABEL}</span>
          <span className="pm-sr">between the two posters and the opening of the room</span>
        </div>
      </div>
    </section>
  )
}
