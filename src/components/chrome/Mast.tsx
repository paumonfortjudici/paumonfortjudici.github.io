// The mast: the first thing on the page. A hanging folder tab in the colour of the sheet you are on (html[data-section] and
// --sec / --sec-ink, written by sectionState) with PAU MONFORT in outline lettering, drawn on while the intro bars wipe away.
// To its right, on the desk: the two notes about what he does, in Fraunces italic, held by a hand-drawn brace, and a rubber
// stamp. On a phone it collapses to the name tab and the first note.
// Markup: <header class="pm-mast"> strip + row [tab | notes]. No focusable elements (the skip link and the tabs follow).

import { Fragment, type CSSProperties } from 'react'
import { MAST } from '../../lib/copy'
import { useClock } from '../../lib/hooks'
import { Stamp, StrokeWord } from '../primitives'
import { nameDelay } from './introState'
import { Asterisk } from './marks'
import { CHROME } from './strings'
import './chrome.css'

/** a curly brace drawn with a slightly unsteady hand; it groups the two notes and points back at the name */
function Brace() {
  return (
    <svg className="pm-mast__brace" viewBox="0 0 32 96" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path pathLength={1} d="M27.4 3.2C17.6 2.6 15.2 9.4 15.6 20.6L14.8 35.8C15 43.2 11.6 47.2 3.8 48.2C11.9 49.4 15.3 52.8 15.1 60.4L15.5 76.2C15 87.4 17.4 93.5 27.2 92.8" />
    </svg>
  )
}

/**
 * A note whose lines may only break after a comma: "I draw it, / lay it out and build it." never "I draw it, lay it / out and build it."
 * The chunks are inline-blocks (see chrome.css), so the space between two of them has to live outside them: a space at the end of an
 * inline-block is collapsed away.
 */
function Note({ text, className }: { text: string; className?: string }) {
  // split after each comma without a regex lookbehind (Safari before 16.4 cannot even parse one, and would drop the whole bundle)
  const parts = text.split(/,\s+/)
  const chunks = parts.map((part, i) => (i < parts.length - 1 ? `${part},` : part))
  return (
    <p className={className ? `pm-mast__note ${className}` : 'pm-mast__note'}>
      {chunks.map((chunk, i) => (
        <Fragment key={i}>
          {i > 0 ? ' ' : null}
          <span className="pm-mast__chunk">{chunk}</span>
        </Fragment>
      ))}
    </p>
  )
}

/**
 * A clapperboard slate at the right end of the notes: the time in Sydney right now and how far Barcelona is behind it. It is aimed at the
 * people on the other side of the world (the studio this site is a pitch to), and it is the one live thing in the mast. The stick is
 * striped in ink and the accent of the sheet you are on, and claps shut every time the minute changes. Desktop only (the notes column
 * has to be wide enough: chrome.css).
 */
function Slate() {
  const syd = useClock('Australia/Sydney')
  const bcn = useClock('Europe/Madrid')
  // whole hours between the two wall clocks (8, 9 or 10 depending on the season); Sydney is always the one ahead
  const diff = (((syd.hour * 60 + syd.minute - (bcn.hour * 60 + bcn.minute)) % 1440) + 1440) % 1440
  const hours = Math.round((diff > 720 ? 1440 - diff : diff) / 60)
  return (
    <div className="pm-sydney" data-day={syd.isDay ? 'true' : 'false'}>
      <span className="pm-sydney__stick" key={syd.time} aria-hidden="true" />
      <div className="pm-sydney__body">
        <p className="pm-sydney__head">
          <span>Sydney now</span>
          <span className="pm-sydney__lamp" aria-hidden="true" />
          <span className="pm-sr">{syd.isDay ? ', daytime' : ', night'}</span>
        </p>
        <p className="pm-sydney__time" aria-live="off">
          {syd.time}
        </p>
        <p className="pm-sydney__sub">{`Barcelona is ${hours} h behind`}</p>
      </div>
    </div>
  )
}

export function Mast() {
  return (
    <header className="pm-mast" style={{ '--pm-name-delay': `${nameDelay}ms` } as CSSProperties}>
      <div className="pm-mast__strip" aria-hidden="true" />
      <div className="pm-mast__row">
        <div className="pm-mast__tab">
          <StrokeWord
            as="div"
            text="PAU MONFORT"
            label={MAST.name}
            size="clamp(3rem, 4.5vw, 6rem)"
            stack="mobile"
            stackSize="min(15.5vw, 5rem)"
            draw={nameDelay}
            strokeScale={1.5}
            tracking={0.035}
            // a brisker draw than the section words (the intro is short): 0.85 s a letter, 45 ms apart
            style={{ color: 'var(--sec-ink)', '--draw-dur': '0.85s', '--step': '45ms' } as CSSProperties}
          />
          <Asterisk className="pm-mast__mark" />
        </div>
        <div className="pm-mast__notes">
          <Brace />
          <div className="pm-mast__text">
            <Note text={MAST.notes[0]} />
            <Note text={MAST.notes[1]} className="pm-mast__note--second" />
          </div>
          <Slate />
          {CHROME.stamp.show && (
            <span className="pm-mast__stamp">
              <Stamp text={CHROME.stamp.text} sub={CHROME.stamp.sub} color="var(--sec-lit)" blend="normal" rotate={-5} size="0.95rem" rough={1} thump={false} />
            </span>
          )}
        </div>
      </div>
    </header>
  )
}

export default Mast
