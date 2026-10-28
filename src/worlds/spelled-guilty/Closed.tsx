// Exhibit F: the credit, in plain words, on a manila folder; the CASE CLOSED stamp; the Amazon ticket and the facts slate.
import { Folder, StickyNote, Stamp, Tape, WorldFacts } from '@/components/primitives'
import { useMemo, useState } from 'react'
import { useWorld } from '../WorldContext'
import { SG } from './copy'
import './sg-closed.css'

const ANGLES = [-7, -3, -10, -5, -1, -9]

export default function Closed() {
  const { work } = useWorld()
  // the registry year is not a publication date and the book states none (ART_DIRECTION 12.1): the slate shows Role and Tools only
  // the stamp is a real one: every press lifts it and slams it down again at a slightly different angle (the Stamp remounts, so its own thump plays)
  const [presses, setPresses] = useState(0)
  const facts = useMemo(() => ({ ...work, years: '' }), [work])
  return (
    <section className="w-sg-closed w-sg-station" aria-labelledby="sg-credit-title">
      <Folder color="var(--cream-2)" ink="var(--ink)" tab={SG.credit.exhibit} tabX={0.05} className="w-sg-folder" bodyClassName="w-sg-folder__body">
        <div className="w-sg-credit">
          <h3 id="sg-credit-title" className="w-sg-h3 w-sg-key w-sg-key--ink" data-text={SG.credit.title}>
            {SG.credit.title}
          </h3>
          <p className="w-sg-credit__line">
            {SG.credit.leadIn}
            <strong>{SG.credit.name}</strong>
            {SG.credit.rest}
          </p>
          <div className="w-sg-credit__row">
            <div className="w-sg-credit__book">
              <Tape at="top" color="marigold" w="5.4rem" h="1.5rem" rotate={-2} />
              <p className="w-sg-credit__lead w-sg-type">{SG.credit.bookLead}</p>
              <blockquote className="w-sg-credit__quote">{SG.credit.bookLine}</blockquote>
            </div>
            <div className="w-sg-credit__note">
              <StickyNote color="butter" rotate={-3} pin="pin" w="12rem">
                {SG.credit.note}
              </StickyNote>
            </div>
          </div>
        </div>

        <div className="w-sg-closed__side">
          <WorldFacts work={facts} tone="ink">
            {SG.credit.samplePages}
          </WorldFacts>
          <div className="w-sg-closed__stamp">
            <button type="button" className="w-sg-stampbtn" aria-label={SG.credit.stampButton} data-cursor="Stamp" onClick={() => setPresses((n) => n + 1)}>
              <Stamp key={presses} decorative text={SG.credit.stamp} sub="Volume 1" tone="tomato" rotate={ANGLES[presses % ANGLES.length]} size="clamp(1.5rem, 0.6rem + 2.2vw, 2.8rem)" />
            </button>
            <span className="w-sg-stamphint w-sg-hand" aria-hidden="true">
              {SG.credit.stampHint}
            </span>
          </div>
        </div>
      </Folder>
    </section>
  )
}
