// BRAND KIT drawer: the palette with its usage-ratio bar, the contrast notes (computed live from the hexes), the two typefaces and the
// logo family. A compact reference, no downloads.
import { useEffect, useRef } from 'react'
import { TabButton } from '../../components/primitives'
import { Bar, Leader, Swatches } from './atoms'
import { KIT, UI_TEXT } from './copy'
import { COLOUR, COLOURS, FONT_DISPLAY, FONT_UTILITY, LOGOS, MIN_SIZES, contrast, logoRatio, logoThumb, logoThumbSize, type ColourId } from './data'

interface KitProps {
  onClose: () => void
}

const short = (id: ColourId): string => id[0].toUpperCase() + id.slice(1)

const level = (ratio: number): 'ok' | 'large' | 'no' => (ratio >= 4.5 ? 'ok' : ratio >= 3 ? 'large' : 'no')

function ContrastTable() {
  const ids = COLOURS.map((c) => c.id)
  return (
    <table className="w-concept-brand-contrast">
      <caption>WCAG contrast between every pair of colours</caption>
      <thead>
        <tr>
          <td />
          {ids.map((id) => (
            <th key={id} scope="col">
              <span className="w-concept-brand-dot" style={{ background: COLOUR[id].hex }} aria-hidden="true" />
              <span>{short(id)}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ids.map((row) => (
          <tr key={row}>
            <th scope="row">
              <span className="w-concept-brand-dot" style={{ background: COLOUR[row].hex }} aria-hidden="true" />
              <span>{short(row)}</span>
            </th>
            {ids.map((col: ColourId) => {
              if (row === col) return <td key={col} data-level="same" aria-label="same colour" />
              const r = contrast(row, col)
              const l = level(r)
              return (
                <td key={col} data-level={l}>
                  <span>{r.toFixed(1)}</span>
                  <span className="w-concept-brand-sr">{l === 'ok' ? ', passes for small text' : l === 'large' ? ', large text only' : ', do not use for text'}</span>
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function Kit({ onClose }: KitProps) {
  const closeRef = useRef<HTMLElement>(null)
  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true })
  }, [])
  return (
    <section className="w-concept-brand-kit" aria-label={KIT.title}>
      <div className="w-concept-brand-kit-top">
        <div>
          <h2 className="w-concept-brand-title">{KIT.title}</h2>
          <p className="w-concept-brand-sub">{KIT.sub}</p>
        </div>
        <TabButton ref={closeRef} size="sm" color="var(--cb-blau)" ink="var(--cb-rosat)" icon="cross" onClick={onClose}>
          {UI_TEXT.close}
        </TabButton>
      </div>
      <div className="w-concept-brand-kit-scroll" tabIndex={0} role="region" aria-label="Brand kit, scrollable">
        <Bar>Palette</Bar>
        <Swatches ids={COLOURS.map((c) => c.id)} />
        <ul className="w-concept-brand-roles">
          {COLOURS.map((c) => (
            <li key={c.id}>
              <b>{c.name}.</b> {c.role}.
            </li>
          ))}
        </ul>
        <Bar>{KIT.ratioTitle}</Bar>
        <div className="w-concept-brand-ratio" role="img" aria-label={COLOURS.map((c) => `${c.name} ${c.ratio} percent`).join(', ')}>
          {COLOURS.map((c) => (
            <span key={c.id} style={{ flexGrow: c.ratio, background: c.hex }} />
          ))}
        </div>
        <ul className="w-concept-brand-legend">
          {COLOURS.map((c) => (
            <li key={c.id}>
              <span className="w-concept-brand-dot" style={{ background: c.hex }} aria-hidden="true" />
              {short(c.id)} <b>{c.ratio}%</b>
            </li>
          ))}
        </ul>
        <p className="w-concept-brand-note">{KIT.ratioNote}</p>
        <Bar>{KIT.contrastTitle}</Bar>
        <ContrastTable />
        <ul className="w-concept-brand-key" aria-hidden="true">
          <li data-level="ok">4.5 or more: small text</li>
          <li data-level="large">3 to 4.5: large text</li>
          <li data-level="no">under 3: never text</li>
        </ul>
        <ul className="w-concept-brand-list">
          <li>{KIT.contrastAllowed}</li>
          <li>{KIT.contrastLarge}</li>
          <li>{KIT.contrastNever}</li>
        </ul>
        <Bar>{KIT.typeTitle}</Bar>
        <div className="w-concept-brand-specimens">
          <div className="w-concept-brand-specimen">
            <p className="w-concept-brand-specimen-big" style={{ fontFamily: FONT_DISPLAY }}>
              Aa
            </p>
            <p className="w-concept-brand-specimen-name">Fraunces</p>
            <p className="w-concept-brand-specimen-line" style={{ fontFamily: FONT_DISPLAY }}>
              Small glass. <em>Big Sunday.</em>
            </p>
            <p className="w-concept-brand-specimen-meta">Soft 100, wonk 1, optical size 144. Weights 700 to 900, italic 600 to 700.</p>
          </div>
          <div className="w-concept-brand-specimen" data-utility="true">
            <p className="w-concept-brand-specimen-big" style={{ fontFamily: FONT_UTILITY }}>
              Aa
            </p>
            <p className="w-concept-brand-specimen-name">Barlow Semi Condensed</p>
            <p className="w-concept-brand-specimen-line" style={{ fontFamily: FONT_UTILITY }}>
              VERMUTERIA DE BARRI
            </p>
            <p className="w-concept-brand-specimen-meta">500 for body, 600 and 700 for info lines, 800 for spaced capitals.</p>
          </div>
        </div>
        <Leader rows={KIT.typeRoles.map((r) => ({ k: r.role, v: r.spec }))} />
        <p className="w-concept-brand-note">{KIT.typeRule}</p>
        <Bar>{KIT.logoTitle}</Bar>
        <ul className="w-concept-brand-family">
          {LOGOS.map((l) => (
            <li key={l.id}>
              <span className="w-concept-brand-family-tile" style={{ background: COLOUR[l.ground].hex }}>
                <img src={logoThumb(l)} width={logoThumbSize(l).w} height={logoThumbSize(l).h} alt={l.name} decoding="async" loading="lazy" style={{ aspectRatio: `${logoRatio(l)}` }} />
              </span>
              <b>{l.name}</b>
              <span>{l.useOn}</span>
            </li>
          ))}
        </ul>
        <Leader rows={MIN_SIZES.map((s) => ({ k: `${s.name}, smallest`, v: s.mm ? `${s.px} · ${s.mm}` : s.px }))} />
      </div>
    </section>
  )
}
