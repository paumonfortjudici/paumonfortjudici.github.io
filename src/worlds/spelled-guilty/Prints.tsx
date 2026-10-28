// Exhibit E: how a case works, as three photographic prints pegged on a darkroom line (the three step cards of the book's
// own marketing), then a film strip with a compass rosette per level: which way the words may run in easy, medium and hard.
import type { CSSProperties } from 'react'
import { Reveal } from '@/components/primitives'
import { asset } from '@/lib/asset'
import Directions from './Directions'
import { SG } from './copy'
import { BASE, STEP_CARDS } from './data'
import './sg-prints.css'

const ALT = [
  'Step one card: a case file page with a magnifying glass over one suspect, titled Read the Case.',
  'Step two card: a word-search grid with words circled, titled Find the Words.',
  'Step three card: a pinned note where crossed-out words leave a few circled letters, titled Name the Killer.',
]

/** the cord is a quadratic curve in a 1000 x 96 box: y at a position t along it */
const cordY = (t: number): number => (1 - t) * (1 - t) * 14 + 2 * t * (1 - t) * 86 + t * t * 14

const TILT = [-3.2, 2.1, -1.6]

export default function Prints() {
  return (
    <section className="w-sg-prints w-sg-station" aria-labelledby="sg-steps-title">
      <div className="w-sg-safelight" aria-hidden="true">
        <span className="w-sg-safelight__cord" />
        <span className="w-sg-safelight__shade" />
        <span className="w-sg-safelight__bulb" />
      </div>

      <header className="w-sg-head w-sg-head--split">
        <p className="w-sg-tag w-sg-type">{SG.steps.exhibit}</p>
        <h3 id="sg-steps-title" className="w-sg-h3 w-sg-key">
          {SG.steps.title}
        </h3>
        <p className="w-sg-sub">{SG.steps.sub}</p>
      </header>

      <div className="w-sg-line">
        <svg className="w-sg-cord" viewBox="0 0 1000 96" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path className="w-sg-cord__shadow" d="M-20 14 Q500 86 1020 14" />
          <path className="w-sg-cord__line" d="M-20 14 Q500 86 1020 14" />
        </svg>
        <ol className="w-sg-line__items">
          {SG.steps.items.map((step, i) => {
            const card = STEP_CARDS[i]
            const style = { '--cy': `${cordY((i + 0.5) / 3).toFixed(1)}px`, '--r': `${TILT[i]}deg` } as CSSProperties
            return (
              <li key={step.n} style={style}>
                <Reveal kind="drop" delay={i * 140}>
                  <figure className="w-sg-photo">
                    <span className="w-sg-peg" aria-hidden="true" />
                    <span className="w-sg-photo__img">
                      <img src={asset(`${BASE}/${card.file}`)} alt={ALT[i]} width={card.w} height={card.h} loading="lazy" decoding="async" />
                    </span>
                    <figcaption className="w-sg-type">
                      {step.n} · {step.title}
                    </figcaption>
                  </figure>
                </Reveal>
                <p className="w-sg-step__text">{step.text}</p>
              </li>
            )
          })}
        </ol>
      </div>

      <Directions />
    </section>
  )
}
