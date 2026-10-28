// Exhibit F: the credit, in plain words, on a manila folder; the CASE CLOSED stamp; the Amazon ticket and the facts slate.
import { Folder, StickyNote, Stamp, Tape, WorldFacts } from '@/components/primitives'
import { useWorld } from '../WorldContext'
import { SG } from './copy'
import './sg-closed.css'

export default function Closed() {
  const { work } = useWorld()
  return (
    <section className="w-sg-closed w-sg-station" aria-labelledby="sg-credit-title">
      <Folder color="var(--cream-2)" ink="var(--ink)" tab={SG.credit.exhibit} tabX={0.05} className="w-sg-folder" bodyClassName="w-sg-folder__body">
        <div className="w-sg-credit">
          <h3 id="sg-credit-title" className="w-sg-h3 w-sg-key w-sg-key--ink">
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
          <WorldFacts work={work} tone="ink">
            {SG.credit.samplePages}
          </WorldFacts>
          <div className="w-sg-closed__stamp">
            <Stamp text={SG.credit.stamp} sub="Volume 1" tone="tomato" rotate={-7} size="clamp(2rem, 1.1rem + 1.7vw, 2.8rem)" />
          </div>
        </div>
      </Folder>
    </section>
  )
}
