// Education and certificates as small paper objects, and the links as ticket stubs.
//   education     embossed label-maker strips (ink, raised letters). Shown under the portrait on wide screens (variant "cell",
//                 rendered by About.tsx) and with the certificates on narrow ones (variant "row", rendered here): only one of the
//                 two is in the DOM at a time (useNarrow), so the page has one "Education" heading, not a hidden twin.
//   certificates  paper file tags; the three that have a PDF carry a paper clip and open it in a new tab
//   elsewhere     perforated ticket stubs (the site's only external-link object), one per place
// Each <li> is a Reveal (it arrives once); the tilt lives on the object inside, so the arrival transform never fights it.

import type { CSSProperties } from 'react'
import { asset } from '../../../lib/asset'
import { ABOUT } from '../../../lib/copy'
import { PaperClip, Reveal, Ticket, type ToneName } from '../../primitives'
import { CREDENTIAL_LIST, type Credential } from './data'
import { useNarrow } from './useNarrow'
import { CREDENTIALS, TICKETS } from './text'
import './credentials.css'

const TILT = [-1.4, 1, -0.7, 1.3, -1.1, 0.8]
const STUB: Record<string, ToneName> = { IG: 'ink', PD: 'pine', GH: 'ultraviolet', SG: 'oxblood' }
const TICKET_TILT: Record<string, number> = { IG: -2.2, PD: 1.6, GH: -1.2, SG: 2 }

function Dymo({ item, tilt }: { item: Credential; tilt: number }) {
  return (
    <span className="pm-ab-dymo" style={{ '--rot': `${tilt}deg` } as CSSProperties}>
      <span className="pm-ab-dymo__t" data-t={item.title}>
        {item.title}
      </span>
      {item.year && <span className="pm-ab-dymo__y">{item.year}</span>}
    </span>
  )
}

function Tag({ item, tilt }: { item: Credential; tilt: number }) {
  const body = (
    <>
      <span className="pm-ab-tag__t">{item.title}</span>
      {item.year && <span className="pm-ab-tag__y">{item.year}</span>}
      {item.pdf && <span className="pm-ab-tag__pdf">{CREDENTIALS.pdf}</span>}
    </>
  )
  return (
    <span className="pm-ab-tag" style={{ '--rot': `${tilt}deg` } as CSSProperties}>
      {item.pdf && <PaperClip size="2.6rem" rotate={-34} className="pm-ab-tag__clip" />}
      {item.pdf ? (
        <a className="pm-ab-tag__in" href={asset(item.pdf)} target="_blank" rel="noopener noreferrer" aria-label={`${item.title}, ${CREDENTIALS.pdfAria}`} data-cursor="Open">
          {body}
        </a>
      ) : (
        <span className="pm-ab-tag__in">{body}</span>
      )}
    </span>
  )
}

/** the degrees, as label-maker strips */
export function Education({ variant }: { variant: 'cell' | 'row' }) {
  const education = CREDENTIAL_LIST.filter((item) => item.kind === 'education')
  const id = `about-edu-${variant}`
  return (
    <div className="pm-ab-cred__group pm-ab-edu" data-variant={variant} role="group" aria-labelledby={id}>
      <h3 id={id} className="pm-ab-cred__h">
        {CREDENTIALS.education}
      </h3>
      <ul className="pm-ab-chips" role="list">
        {education.map((item, i) => (
          <Reveal as="li" kind="pop" delay={i * 70} key={item.title}>
            <Dymo item={item} tilt={TILT[i % TILT.length]} />
          </Reveal>
        ))}
      </ul>
    </div>
  )
}

export default function Credentials() {
  const narrow = useNarrow()
  const certificates = CREDENTIAL_LIST.filter((item) => item.kind === 'certificate')
  return (
    <div className="pm-ab-cred">
      <div className="pm-ab-cred__chips">
        {narrow && <Education variant="row" />}
        <div className="pm-ab-cred__group" role="group" aria-labelledby="about-cert">
          <h3 id="about-cert" className="pm-ab-cred__h">
            {CREDENTIALS.certificates}
          </h3>
          <ul className="pm-ab-chips pm-ab-chips--tags" role="list">
            {certificates.map((item, i) => (
              <Reveal as="li" kind="pop" delay={i * 70} key={item.title}>
                <Tag item={item} tilt={TILT[(i + 2) % TILT.length]} />
              </Reveal>
            ))}
          </ul>
        </div>
      </div>

      <div className="pm-ab-cred__tix" role="group" aria-labelledby="about-elsewhere">
        <h3 id="about-elsewhere" className="pm-ab-cred__h">
          {CREDENTIALS.elsewhere}
        </h3>
        <ul className="pm-ab-tickets" role="list">
          {ABOUT.badges.map((badge, i) => {
            const text = TICKETS[badge.badge]
            if (!text || !badge.href) return null
            return (
              <Reveal as="li" kind="drop" delay={i * 80} key={badge.badge}>
                <Ticket href={badge.href} kicker={text.kicker} label={text.label} tone="paper" stub={STUB[badge.badge] ?? 'ink'} rotate={TICKET_TILT[badge.badge] ?? 0} />
              </Reveal>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
