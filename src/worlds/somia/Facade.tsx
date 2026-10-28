// The shop front: the lagoon fascia (the folder's own colour, so the tab above joins it), the awning, and under it a sage
// wall holding the sign plate, the chalk panel and the notice, next to the window with the devices.

import { Tape } from '../../components/primitives'
import { Awning } from './Awning'
import { Chalk } from './Chalk'
import { BRAND, MOTTO } from './data'
import { Showcase } from './Showcase'

export function Facade({ ready, paused }: { ready: boolean; paused: boolean }) {
  return (
    <section className="w-somia-front" aria-labelledby="somia-front-title">
      <h3 id="somia-front-title" className="pm-sr">
        The shop front: browse the Somia website
      </h3>
      <div className="w-somia-fascia" aria-hidden="true" />
      <Awning ready={ready} />
      <div className="w-somia-facade">
        <div className="w-somia-wall">
          <div className="w-somia-sign">
            <img src={BRAND.wordmarkWhite} width={281} height={101} alt="Somia" />
          </div>

          <figure className="w-somia-panel" data-ready={ready ? 'true' : 'false'}>
            <div className="w-somia-panel__field">
              <Chalk ready={ready} />
            </div>
            <figcaption className="w-somia-panel__tag">
              <span className="w-somia-panel__es" lang="es">
                {MOTTO.es}
              </span>
              <span className="w-somia-panel__en">{MOTTO.en}</span>
              <span className="w-somia-panel__note">Redrawn in chalk for this page.</span>
            </figcaption>
          </figure>

          <div className="w-somia-notice">
            <Tape at="top" color="lagoon" pattern="stripes" w="5.2rem" rotate={-2} />
            <p className="w-somia-notice__lead">I did Somia&rsquo;s brand identity, logo and web layout.</p>
            <p className="w-somia-notice__body">
              <span className="w-somia-notice__short">A sustainable women&rsquo;s fashion shop.</span>
              <span className="w-somia-notice__what">Somia is a sustainable women&rsquo;s fashion shop, online in Spanish, Catalan and English.</span>{' '}
              <span className="w-somia-notice__more">The window shows screenshots of the live site.</span>
            </p>
          </div>
        </div>

        <Showcase ready={ready} paused={paused} />
      </div>
      <div className="w-somia-kerb" aria-hidden="true" />
    </section>
  )
}
