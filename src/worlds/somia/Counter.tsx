// The counter: the dark desk of the cabinet laid out as a shop counter. A till receipt says plainly what the job was (and what
// it was not), the facts slate and the ticket to the shop sit beside it, and the front of the counter carries the motto as a
// slow marquee, the way the live site closes its home page. The receipt is typed in the cabinet's own label face (Courier
// Prime): the one place where the shop and the filing cabinet meet.

import { useRef } from 'react'
import MotionToggle from '../../components/chrome/MotionToggle'
import { WorldFacts } from '../../components/primitives'
import { useInView } from '../../lib/hooks/useInView'
import type { WorkMeta } from '../../lib/works'
import { useWorld } from '../WorldContext'
import { BRAND, MOTTO } from './data'

// the receipt prints itself, line by line in steps, the first time the counter comes into view (still under reduced motion)
function Receipt() {
  const { scrollRef } = useWorld()
  const ref = useRef<HTMLDivElement>(null)
  const printed = useInView(ref, { root: scrollRef, once: true, threshold: 0.3 })
  return (
    <div ref={ref} className="w-somia-receipt-wrap" data-printed={printed ? 'true' : 'false'}>
      <article className="w-somia-receipt" aria-label="Receipt: what I did for Somia">
        <p className="w-somia-receipt__shop" translate="no">
          SOMIA
        </p>
        <p className="w-somia-receipt__sub">
          online store &middot; <span translate="no">somia.store</span>
        </p>
        <hr />
        <dl className="w-somia-receipt__items">
          <div>
            <dt>1</dt>
            <dd>Brand identity</dd>
          </div>
          <div>
            <dt>1</dt>
            <dd>Logo</dd>
          </div>
          <div>
            <dt>1</dt>
            <dd>Web layout, as shown in the window</dd>
          </div>
        </dl>
        <hr />
        <dl className="w-somia-receipt__facts">
          <div>
            <dt>Languages</dt>
            <dd>ES &middot; CA &middot; EN</dd>
          </div>
          <div>
            <dt>Built on</dt>
            <dd>Shopify</dd>
          </div>
          <div>
            <dt>Screens</dt>
            <dd>Oct 2026</dd>
          </div>
        </dl>
        <hr />
        <p className="w-somia-receipt__fine">
          Brand identity, logo and web layout: my part. The photography, the models and the words in the pictures are Somia&rsquo;s.
        </p>
        {/* where a till prints its barcode, the shop's own seal is pressed instead: the ring stamp around the ribbon S (the real files, small: they are only 351 and 189 px) */}
        <div className="w-somia-receipt__seal" aria-hidden="true">
          <img src={BRAND.ring} width={351} height={352} alt="" loading="lazy" decoding="async" />
          <img src={BRAND.ribbon} width={189} height={206} alt="" loading="lazy" decoding="async" />
        </div>
        <p className="w-somia-receipt__thanks">thank you &middot; gracias &middot; gr&agrave;cies</p>
      </article>
    </div>
  )
}

// the motto, over and over, on the front of the counter (decorative: the motto is already in the text above)
function Marquee() {
  const run = Array.from({ length: 6 }, (_, i) => (
    <span key={i} className="w-somia-marquee__item">
      <span lang="es">{MOTTO.es}</span>
      <img src={BRAND.ribbon} width={189} height={206} alt="" loading="lazy" decoding="async" />
    </span>
  ))
  return (
    <div className="w-somia-marquee" aria-hidden="true">
      <div className="w-somia-marquee__track pm-ambient">
        <div className="w-somia-marquee__run">{run}</div>
        <div className="w-somia-marquee__run">{run}</div>
      </div>
    </div>
  )
}

export function Counter({ work }: { work: WorkMeta }) {
  return (
    <section className="w-somia-counter" aria-labelledby="somia-counter-title">
      <h3 id="somia-counter-title" className="pm-sr">
        The counter: what I did for Somia
      </h3>

      <div className="w-somia-bench">
        <div className="w-somia-till">
          <Receipt />
          <div className="w-somia-counter__facts">
            <WorldFacts work={work} tone="paper">
              Screens captured from somia.store in October 2026. The photography and the words in them belong to Somia and are shown only to explain the layout.
            </WorldFacts>
          </div>
        </div>
        {/* the site's own "Pause motion" tab, standing on the front panel: the header with the same switch is inert while a world is open,
            and this window has two loops of its own (the ring on the shelves, the motto below) besides the tour */}
        <div className="w-somia-bench__tab">
          <MotionToggle variant="foot" />
        </div>
      </div>
      <div className="w-somia-front-panel">
        <Marquee />
      </div>
    </section>
  )
}
