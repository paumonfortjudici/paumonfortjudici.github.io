// Pau's Plana Digital e-mail signature, rebuilt in HTML / CSS as a business card taped to the desk (never the original PNG).
// Front: Plana Digital's lockup (inline SVG, the sun rises on arrival), the promise in English, name, role, tel / mail / web.
// Back: a hand-written thank-you over the Plana sunrise. One button flips it (click, tap, Enter, Space).
// This file is a lazy chunk: it brings Plana's three faces (Sora, DM Mono, Figtree) with it, so the home page never pays for them.

import '@fontsource-variable/sora/wght.css'
import '@fontsource/dm-mono/latin-500.css'
import '@fontsource-variable/figtree/wght.css'
import { useEffect, useId, useRef, useState } from 'react'
import { Scribble, Tape, useRevealOnce } from '../../primitives'
import { CONTACT } from '../../../lib/copy'
import { useMotion } from '../../../lib/motion'
import { loadHandFonts, whenFontsLoaded } from '../../../styles/fonts'
import { LOCKUP, LOCKUP_VIEWBOX } from './planaMark'

// Words that are not in COPY.md (the original signature is Catalan: "Webs llestes en 72 hores." / "ESTUDI WEB · CARDEDEU").
const TAGLINE = { first: 'Websites ready', second: 'in', hot: '72 hours.' } as const
const BAND = 'Web studio · Cardedeu'
// the original signature styles WhatsApp like a link after the number (it has no target there: here it is only a word)
const WHATSAPP = 'WhatsApp'
const THANKS = { one: 'Thanks for scrolling', two: 'this far.', three: 'Let’s make something.' } as const
const LABELS = {
  group: 'Business card of Pau Monfort',
  flip: 'Flip the business card',
  tape: 'flip me',
  tapeBack: 'flip back',
  received: 'Received',
} as const

/** Plana Digital's horizontal lockup: the brand's own paths, coloured by class from contact.css. The sun is its own shape so it can rise. */
function Lockup({ className }: { className?: string }) {
  const clip = `pmct${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const windowBody = LOCKUP.find((p) => p.id === 'window')
  return (
    <svg className={className} viewBox={LOCKUP_VIEWBOX} role="img" aria-label="Plana Digital">
      <defs>
        <clipPath id={clip}>
          <path d={windowBody?.d} />
        </clipPath>
      </defs>
      {LOCKUP.map((p) =>
        p.id === 'sun' ? (
          <g key={p.id} clipPath={`url(#${clip})`}>
            <path className={`${p.cls} pm-ct-lsun`} d={p.d} />
          </g>
        ) : (
          <path key={p.id} className={p.cls} d={p.d} />
        ),
      )}
    </svg>
  )
}

export default function SignatureCard() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [ready, setReady] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const [seenBack, setSeenBack] = useState(false)
  // reduced or paused motion: nothing is staged, so nothing waits (no font gate, no reveal): the card is simply there
  const { still } = useMotion()

  // the sun rises the first time the card is well inside the viewport (data-in, no state, no re-render)
  useRevealOnce(rootRef, { threshold: 0.45 })

  useEffect(() => {
    let alive = true
    void loadHandFonts()
    // keep the card invisible until its three faces are in, so the text never flashes a fallback and moves
    // (still motion: no wait at all, the faces swap in when they arrive)
    void whenFontsLoaded(['800 1em "Sora Variable"', '500 1em "DM Mono"', '400 1em "Figtree Variable"'], still ? 0 : 1200).then(() => {
      if (alive) setReady(true)
    })
    return () => {
      alive = false
    }
  }, [still])

  const toggle = () => {
    setFlipped((f) => !f)
    setSeenBack(true)
  }

  const card = CONTACT.businessCard

  return (
    <div ref={rootRef} className="pm-ct-card" role="group" aria-label={LABELS.group} translate="no" data-ready={ready || still ? '' : undefined} data-flipped={flipped ? '' : undefined}>
      <div className="pm-ct-card__tilt">
        {/* the tape is a pivot: it stays put while the card turns under it */}
        <Tape at="top" color="butter" pattern="stripes" rotate={-4} w="9rem" h="2.3rem">
          <span aria-hidden="true">{flipped ? LABELS.tapeBack : LABELS.tape}</span>
        </Tape>

        <div className="pm-ct-card__flipper">
          <div className="pm-ct-face pm-ct-face--front" aria-hidden={flipped || undefined}>
            <Lockup className="pm-ct-logo" />
            <p className="pm-ct-tag">
              <span>{TAGLINE.first}</span>
              <span>
                {TAGLINE.second} <span className="pm-ct-tag__hot">{TAGLINE.hot}</span>
              </span>
            </p>
            <div className="pm-ct-info">
              <p className="pm-ct-name">{card.name}</p>
              <p className="pm-ct-role">{card.role}</p>
              <dl className="pm-ct-rows">
                {card.rows.map((row) => (
                  <div className="pm-ct-row" key={row.label}>
                    <dt>{row.label}</dt>
                    <dd>
                      {row.value}
                      {row.label === 'TEL' && <span className="pm-ct-row__wa">{WHATSAPP}</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <span className="pm-ct-sun" aria-hidden="true" />
            <div className="pm-ct-band">
              <span className="pm-ct-band__txt">{BAND}</span>
            </div>
          </div>

          <div className="pm-ct-face pm-ct-face--back" aria-hidden={!flipped || undefined}>
            <p className="pm-ct-thanks">
              <span>{THANKS.one}</span>
              <span>{THANKS.two}</span>
              <span className="pm-ct-thanks__last">
                {THANKS.three}
                {seenBack && <Scribble kind="underline" at="under" color="var(--pd-poppy)" stroke={3.4} seed="thanks" draw={420} />}
              </span>
            </p>
            <div className="pm-ct-sunrise" aria-hidden="true">
              <span className="pm-ct-bsun" />
            </div>
            {/* the card is stamped when it is turned over for the first time (then it stays: the ink is dry) */}
            {seenBack && (
              <span className="pm-ct-received" aria-hidden="true">
                {LABELS.received}
              </span>
            )}
          </div>
        </div>

        {/* the whole card is the button, but the cursor's "Flip" disc is only shown over the tape strip: anywhere else it would sit on the
            handwriting (back) or the numbers (front) the pointer is there to read */}
        <button type="button" className="pm-ct-card__hit" aria-pressed={flipped} aria-label={LABELS.flip} data-cursor="none" onClick={toggle}>
          <span className="pm-ct-card__hit-tape" data-cursor="Flip" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
