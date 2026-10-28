// The right column: the "Find my name" tab, a marked-up print of what it finds (the masthead crop, or the credit line of one of
// my features) and the six byline slips. Picking a slip turns the book to that spread when the page is one of the 30 in it, and
// always lays the credit line on the print, big enough to read.
import type { CSSProperties } from 'react'
import { Reveal, Scribble, Tape, TabButton } from '../../components/primitives'
import { asset } from '../../lib/asset'
import { EVIDENCE, FEATURE_SHORT, FIND } from './copy'
import { BYLINES, CREDIT, type BylineDef } from './data'
import { cropWindow, grow, inCrop } from './helpers'

export type Pick = { kind: 'masthead' } | { kind: 'byline'; page: number }

interface EvidenceProps {
  /** printed numbers of the pages on show in the book: a slip whose page is one of them lights up */
  onShow: number[]
  pick: Pick
  /** bumps on every pick so the pen marks draw again */
  round: number
  onFind: () => void
  onSlip: (byline: BylineDef) => void
}

const TAPES = ['butter', 'paper', 'marigold', 'lagoon', 'butter', 'bubblegum'] as const
const TILTS = [-1.4, 1.1, -0.7, 1.5, -1.1, 0.8]

function Loupe() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M10.2 3.8C13.7 3.6 16.5 6.4 16.3 9.9C16.1 13.4 13.3 16.2 9.9 16C6.5 15.9 3.8 13.1 4 9.7C4.1 6.4 6.6 4 10.2 3.8Z" />
      <path d="M14.7 14.6L20.4 20.3" />
    </svg>
  )
}

/** The signature tab. It is drawn twice (beside the print on a wide screen, in the book's deck on a phone); CSS shows one. */
export function FindTab({ onFind, size = 'lg', className }: { onFind: () => void; size?: 'md' | 'lg'; className?: string }) {
  return (
    <TabButton size={size} tone="ink" icon={<Loupe />} iconPosition="before" cursor="Flip" className={className} onClick={onFind}>
      {FIND.label}
    </TabButton>
  )
}

export default function Evidence({ onShow, pick, round, onFind, onSlip }: EvidenceProps) {
  const active = pick.kind === 'byline' ? BYLINES.find((b) => b.page === pick.page) : undefined
  return (
    <section className="w-contract-evidence" aria-labelledby="w-contract-ev-title">
      <h2 id="w-contract-ev-title" className="pm-sr">
        {EVIDENCE.title}
      </h2>

      <div className="w-contract-find">
        <FindTab onFind={onFind} />
      </div>

      <Reveal kind="drop" delay={120} className="w-contract-print-wrap">
        {active ? <ByLinePrint key={`b${active.page}-${round}`} byline={active} /> : <MastheadPrint key={`m-${round}`} />}
      </Reveal>

      <div className="w-contract-slips-head">
        <h3 className="w-contract-h3">{EVIDENCE.slipsTitle}</h3>
        <p className="w-contract-small">{EVIDENCE.slipsHint}</p>
      </div>
      <ul className="w-contract-slips">
        {BYLINES.map((b, i) => {
          const on = pick.kind === 'byline' && pick.page === b.page
          const here = b.inBook && onShow.includes(b.page)
          return (
            <Reveal as="li" kind="pop" delay={i * 70} key={b.page} className="w-contract-slip-item" style={{ '--tilt': `${TILTS[i]}deg` } as CSSProperties}>
              <button
                type="button"
                className="w-contract-slip"
                aria-pressed={on}
                data-here={here ? '' : undefined}
                data-cursor={b.inBook ? 'Flip' : 'Open'}
                onClick={() => onSlip(b)}
              >
                <Tape at="top" color={TAPES[i]} w="4.3rem" h="1.5rem" rotate={i % 2 ? 3 : -4} className="w-contract-slip-tape">
                  p. {b.page}
                </Tape>
                <span className="w-contract-slip-crop" style={cropWindow(b, 18, 8).vars}>
                  <img src={asset(`/works/contract/${b.file}`)} width={b.w} height={b.h} alt="" loading="lazy" decoding="async" />
                </span>
                <span className="w-contract-slip-name">{FEATURE_SHORT[b.page]}</span>
                {here ? <Scribble kind="tick" seed={`here-${b.page}`} color="var(--c-pencil)" w="1.5rem" stroke={4.2} className="w-contract-slip-tick" /> : null}
                <span className="pm-sr">{here ? EVIDENCE.here : b.inBook ? EVIDENCE.inBook : EVIDENCE.notInBook}</span>
              </button>
            </Reveal>
          )
        })}
      </ul>
    </section>
  )
}

/** the credit.webp crop, taped to the table, with my name circled and a note in pencil */
function MastheadPrint() {
  // my name in the crop's own coordinates, grown a little so the pen has room
  const [x, y, w, h] = grow(inCrop(CREDIT.name, CREDIT.crop), 3.4, 9)
  return (
    <figure className="w-contract-print" data-kind="masthead">
      <Tape at="top" color="butter" w="6.4rem" h="1.7rem" rotate={-3} />
      <div className="w-contract-print-img">
        <img src={asset(`/works/contract/${CREDIT.file}`)} width={CREDIT.w} height={CREDIT.h} alt={EVIDENCE.mastheadAlt} decoding="async" />
        <span className="w-contract-print-ring" style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }}>
          <Scribble kind="circle" at="around" ratio={(w * CREDIT.w) / (h * CREDIT.h)} seed="masthead-crop" color="var(--c-pencil)" stroke={3.6} draw={500} />
        </span>
        <span className="w-contract-print-note t-hand" aria-hidden="true">
          {FIND.note}
          <Scribble kind="arrow" dir="left" rotate={-14} w="3.4rem" ratio={1.6} seed="note-arrow" color="var(--c-pencil)" stroke={3} draw={900} className="w-contract-print-arrow" />
        </span>
      </div>
      <figcaption className="w-contract-print-cap">{EVIDENCE.masthead}</figcaption>
    </figure>
  )
}

/** the credit line of one feature, cropped from its page and laid large */
function ByLinePrint({ byline }: { byline: BylineDef }) {
  const { vars, from, span } = cropWindow(byline, 210, 12)
  // the pen on "Pau Monfort.": its place inside that window, in percent of the window
  const ringLeft = ((byline.pau - 22 - from) / span) * 100
  const ringWidth = ((byline.end * byline.w - byline.pau + 40) / span) * 100
  return (
    <figure className="w-contract-print" data-kind="byline">
      <Tape at="top" color="paper" w="6.4rem" h="1.7rem" rotate={2.5} />
      <p className="w-contract-print-note w-contract-print-note--above t-hand" aria-hidden="true">
        <span className="w-contract-print-note-text">{FIND.noteAgain}</span>
        <Scribble kind="arrow" dir="down" rotate={-8} w="2.2rem" ratio={1.4} seed="note-arrow-2" color="var(--c-pencil)" stroke={3} draw={800} className="w-contract-print-arrow" />
      </p>
      <div className="w-contract-print-crop" style={vars}>
        <img src={asset(`/works/contract/${byline.file}`)} width={byline.w} height={byline.h} alt={`Credit line on page ${byline.page}, ending “Textos: Pau Monfort.”`} decoding="async" />
        <span className="w-contract-print-ring" data-for="byline" style={{ left: `${ringLeft}%`, width: `${ringWidth}%` }}>
          <Scribble kind="circle" at="around" ratio={2.9} seed={`byline-${byline.page}`} color="var(--c-pencil)" stroke={3.4} draw={450} />
        </span>
      </div>
      <figcaption className="w-contract-print-cap">
        <span>
          Page {byline.page}, {FEATURE_SHORT[byline.page]}
        </span>
        <span className="w-contract-print-where">{byline.inBook ? 'In the book' : EVIDENCE.notInBook}</span>
      </figcaption>
    </figure>
  )
}
