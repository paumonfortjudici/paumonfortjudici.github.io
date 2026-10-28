// The brand strip, laid out as one shelving unit with three bays: the logo family and type, the palette as paint chips
// (click to copy a hex), and the four values as shelf talkers. Every object stands on a plank; the planks are drawn per
// slot, so the rows keep their shelf when the unit wraps on a phone.

import type { CSSProperties, ReactNode } from 'react'
import { Reveal } from '../../components/primitives'
import { useCopy } from '../../lib/hooks/useCopy'
import { BRAND, PALETTE, VALUES, cap, type Swatch, type ValueTag } from './data'

const tilt = (deg: number): CSSProperties => ({ ['--tilt' as string]: `${deg}deg` })

// an object stands on its plank; an optional label hangs on the plank's front edge
function Slot({ children, label, delay = 0, wide }: { children: ReactNode; label?: ReactNode; delay?: number; wide?: boolean }) {
  return (
    <li className="w-somia-slot" data-wide={wide ? 'true' : undefined}>
      <Reveal kind="drop" delay={delay} className="w-somia-obj">
        {children}
      </Reveal>
      {label && <p className="w-somia-tagline">{label}</p>}
    </li>
  )
}

function Bay({ id, bay, title, note, labelled, children }: { id: string; bay: string; title: string; note: ReactNode; labelled?: boolean; children: ReactNode }) {
  return (
    <div className="w-somia-bay" role="group" aria-labelledby={id} data-bay={bay} data-labelled={labelled ? 'true' : undefined}>
      <div className="w-somia-bay__head">
        <h4 id={id} className="w-somia-dymo">
          {title}
        </h4>
        <p className="w-somia-bay__note">{note}</p>
      </div>
      <ul className="w-somia-bay__row">{children}</ul>
    </div>
  )
}

function Chip({ swatch, deg }: { swatch: Swatch; deg: number }) {
  const { copied, copy } = useCopy(swatch.hex)
  return (
    <div className="w-somia-chipwrap" style={tilt(deg)}>
      <button
        type="button"
        className="w-somia-chip"
        style={{ ['--c' as string]: swatch.hex }}
        onClick={() => void copy()}
        data-cursor="Copy"
        data-copied={copied ? 'true' : undefined}
        aria-label={`Copy ${swatch.name}, ${swatch.hex}`}
      >
        <span className="w-somia-chip__swatch" aria-hidden="true">
          {swatch.id === 'peri' && <span className="w-somia-chip__new">NEW</span>}
          <span className="w-somia-chip__hole" />
        </span>
        <span className="w-somia-chip__name">{swatch.name}</span>
        <span className="w-somia-chip__hex">{copied ? 'Copied' : swatch.hex}</span>
        <span className="w-somia-chip__role">{swatch.sampled ? `${swatch.role}, sampled from the photos` : swatch.role}</span>
      </button>
      <span className="pm-sr" role="status">
        {copied ? `${swatch.name} ${swatch.hex} copied` : ''}
      </span>
    </div>
  )
}

// a swing tag on a cord: it hangs from the rail, and when touched (pointer over it, or a tap) it swings once around its cord
// and comes to rest at its own tilt. Pure delight: nothing is said only by the swing, so it needs no keyboard path.
function SwingTag({ value, deg }: { value: ValueTag; deg: number }) {
  return (
    <figure
      className="w-somia-swing"
      style={tilt(deg)}
      onPointerEnter={(event) => {
        event.currentTarget.dataset.swing = 'on'
      }}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) delete event.currentTarget.dataset.swing
      }}
    >
      <span className="w-somia-swing__cord" aria-hidden="true" />
      <div className="w-somia-swing__card">
        <span className="w-somia-swing__eyelet" aria-hidden="true" />
        <img src={cap(value.icon)} width={534} height={534} alt={value.alt} loading="lazy" decoding="async" />
        <figcaption>
          <span className="w-somia-swing__es" lang="es">
            {value.es}
          </span>
          <span className="w-somia-swing__en">{value.en}</span>
          <span className="w-somia-swing__note">{value.note}</span>
        </figcaption>
      </div>
    </figure>
  )
}

const CHIP_TILT = [-1.6, 1.2, -0.8, 1.8, -1.3, 0.9, -1.9, 1.4]
const VALUE_TILT = [2.4, -1.8, 1.4, -2.6]

export function Shelves() {
  return (
    <section className="w-somia-strip" aria-labelledby="somia-strip-title">
      <div className="w-somia-unit">
        <header className="w-somia-unit__board">
          <div className="w-somia-unit__title">
            <h3 id="somia-strip-title" className="w-somia-strip__title">
              <span className="pm-sr">Brand strip: </span>
              the brand, shelf by shelf
            </h3>
          </div>
          <p className="w-somia-strip__lede">
            What the shop is dressed in: a wordmark, a ring stamp, a calm palette and four little line icons. Spanish originals are in italics.
          </p>
        </header>
        <Bay id="somia-bay-logo" bay="logo" title="Logo family and type" note="The shop serves its logo files as small PNGs, so I show them small." labelled>
          <Slot
            delay={0}
            label={
              <>
                <b>Wordmark</b>
                <span>high-contrast capitals, black or white</span>
              </>
            }
          >
            <div className="w-somia-boxes" role="group" aria-label="The wordmark in white and in black">
              <div className="w-somia-box w-somia-box--black">
                <img src={BRAND.wordmarkWhite} width={281} height={101} alt="Somia wordmark, white version" loading="lazy" decoding="async" />
              </div>
              <div className="w-somia-box w-somia-box--paper">
                <img src={BRAND.wordmarkDark} width={281} height={101} alt="Somia wordmark, black version" loading="lazy" decoding="async" />
              </div>
            </div>
          </Slot>

          <Slot
            delay={70}
            label={
              <>
                <b>Ring stamp and ribbon S</b>
                <span>
                  <i lang="es">letra</i> and <i lang="es">sello</i>
                </span>
              </>
            }
          >
            <div className="w-somia-seal" role="img" aria-label="The ring stamp turning slowly around the ribbon S">
              <img className="w-somia-ring pm-ambient" src={BRAND.ring} width={351} height={352} alt="" loading="lazy" decoding="async" />
              <img className="w-somia-ribbon" src={BRAND.ribbon} width={189} height={206} alt="" loading="lazy" decoding="async" />
            </div>
          </Slot>

          <Slot
            delay={140}
            label={
              <>
                <b>Favicon</b>
                <span>the ribbon S, in black</span>
              </>
            }
          >
            <div className="w-somia-fav">
              <span className="w-somia-fav__tile">
                <img src={BRAND.favicon} width={128} height={128} alt="Somia favicon: the ribbon S in black" loading="lazy" decoding="async" />
              </span>
              <span className="w-somia-fav__tab" aria-hidden="true">
                <img src={BRAND.favicon} width={128} height={128} alt="" loading="lazy" decoding="async" />
                <span>Somia | Moda y Ropa sostenible online</span>
              </span>
            </div>
          </Slot>

          <Slot delay={210} wide>
            <div className="w-somia-type">
              <p className="w-somia-type__aa" aria-hidden="true">
                <span className="w-somia-type__head">Aa</span>
                <span className="w-somia-type__text">Aa</span>
              </p>
              <p className="w-somia-type__names">
                <b>Headlines</b> PP Hatton Ultralight, lowercase. It is a paid face, so here I use Cormorant as its look-alike.
                <br />
                <b>Text</b> Fira Sans Light and Regular.
              </p>
            </div>
          </Slot>
        </Bay>

        <Bay id="somia-bay-palette" bay="palette" title="Palette" note="Click a chip to copy its hex. Sage and concrete are not theme colours: I sampled them from the photography.">
          {PALETTE.map((swatch, i) => (
            <Slot key={swatch.id} delay={i * 60}>
              <Chip swatch={swatch} deg={CHIP_TILT[i % CHIP_TILT.length]} />
            </Slot>
          ))}
        </Bay>

        <Bay id="somia-bay-values" bay="values" title="Values" note="The four icons under the home page, hung on tags. The line on each is my English reading of what the shop prints beneath it.">
          {VALUES.map((value, i) => (
            <Slot key={value.id} delay={i * 80}>
              <SwingTag value={value} deg={VALUE_TILT[i % VALUE_TILT.length]} />
            </Slot>
          ))}
        </Bay>
      </div>
    </section>
  )
}
