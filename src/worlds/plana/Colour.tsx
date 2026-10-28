// Plate 3, "Colour": the five inks of the palette as a bar sized by how much of a page each one gets (the manual's proportions), five
// paint chips that copy their hex (and show RGB and CMYK from the manual), and a contrast check for the chosen colour: its "Aa" on
// each of the other four, with the real WCAG 2 ratio computed in the browser and what it allows.
import { useEffect, useRef, useState } from 'react'
import { Scribble } from '../../components/primitives'
import { copyToClipboard } from '../../lib/hooks'
import { PLATES, SWATCHES, contrast, type Swatch } from './data'
import { Plate } from './Plate'
import { notify } from './notify'
import './colour.css'

function verdict(ratio: number): { key: 'ok' | 'large' | 'no'; label: string } {
  if (ratio >= 4.5) return { key: 'ok', label: 'Any size' }
  if (ratio >= 3) return { key: 'large', label: 'Large type only' }
  return { key: 'no', label: 'Avoid' }
}

/** The specimen "Aa" is large type, so it must reach 3:1 itself. A pairing the manual forbids (ratio under 3) is still printed with its real
 *  ratio and "Avoid", but the letters are nudged toward black or white just far enough to stay readable. */
function legible(fg: string, bg: string): string | undefined {
  if (contrast(fg, bg) >= 3) return undefined
  const target = contrast('#000000', bg) >= contrast('#FFFFFF', bg) ? 0 : 255
  const ch = [1, 3, 5].map((i) => parseInt(fg.slice(i, i + 2), 16))
  for (let t = 0.05; t <= 1.001; t += 0.05) {
    const hex = '#' + ch.map((c) => Math.round(c + (target - c) * t).toString(16).padStart(2, '0')).join('')
    if (contrast(hex, bg) >= 3.1) return hex
  }
  return undefined
}

export default function Colour() {
  const [selected, setSelected] = useState<Swatch['id']>('poppy')
  const [copied, setCopied] = useState<Swatch['id'] | null>(null)
  const timer = useRef(0)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const current = SWATCHES.find((s) => s.id === selected) ?? SWATCHES[3]

  const pick = async (swatch: Swatch) => {
    setSelected(swatch.id)
    const ok = await copyToClipboard(swatch.hex)
    window.clearTimeout(timer.current)
    if (ok) {
      setCopied(swatch.id)
      notify(`${swatch.name} ${swatch.hex}`, { swatch: swatch.hex, label: 'Copied' })
      timer.current = window.setTimeout(() => setCopied(null), 1800)
    } else {
      notify(`${swatch.name} is ${swatch.hex}`)
    }
  }

  return (
    <Plate
      info={PLATES[2]}
      caption="“The colours of the Vallès in June”: poppies among the wheat, holm oaks, paper and ink. The bar shows how much of each goes on a page; click a chip for its numbers and its contrast."
    >
      <div className="w-plana-frame w-plana-colour">
        <div
          className="w-plana-bar"
          role="img"
          aria-label={`Proportion of use: ${SWATCHES.map((s) => `${s.name} ${s.share} percent`).join(', ')}`}
        >
          {SWATCHES.map((s) => (
            <div key={s.id} className="w-plana-bar__seg" data-id={s.id} data-on={s.id === selected ? 'true' : 'false'} style={{ flexGrow: s.share }} aria-hidden="true">
              <span className="w-plana-bar__name">{s.name}</span>
              <span className="w-plana-bar__pct">{s.share}%</span>
            </div>
          ))}
        </div>

        <div className="w-plana-colour__lower">
          <ul className="w-plana-chips" aria-label="Palette: click a chip to copy its hex">
            {SWATCHES.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className="w-plana-chip"
                  data-id={s.id}
                  aria-pressed={s.id === selected}
                  aria-label={`${s.name}, ${s.hex}. Copy the hex.`}
                  data-cursor="Copy"
                  onClick={() => void pick(s)}
                >
                  <span className="w-plana-chip__tile" aria-hidden="true" />
                  <span className="w-plana-chip__body">
                    <span className="w-plana-chip__name">{s.name}</span>
                    <span className="w-plana-chip__local">{s.local}</span>
                    <span className="w-plana-chip__hex">{s.hex}</span>
                    <span className="w-plana-chip__val">RGB {s.rgb}</span>
                    <span className="w-plana-chip__val">CMYK {s.cmyk}</span>
                    <span className="w-plana-chip__copy" aria-hidden="true">
                      {copied === s.id ? 'Copied' : 'Copy hex'}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="w-plana-pairs" aria-live="polite">
            <div className="w-plana-pairs__head">
              <p className="w-plana-pairs__title">
                <span className="w-plana-pairs__lead">{current.name}</span> as a text colour
              </p>
              <p className="w-plana-pairs__role">{current.role}</p>
              <p className="w-plana-pairs__note" aria-hidden="true">
                <span>no corporate blue. on purpose.</span>
                <Scribble kind="underline" w="8.5rem" color="var(--poppy)" seed="plana-blue" draw={600} />
              </p>
            </div>
            <ul className="w-plana-pairs__grid">
              {SWATCHES.filter((s) => s.id !== current.id).map((bg) => {
                const ratio = contrast(current.hex, bg.hex)
                const v = verdict(ratio)
                return (
                  <li key={bg.id} className="w-plana-pair" data-verdict={v.key}>
                    <span className="w-plana-pair__aa" data-bg={bg.id} data-fg={current.id} aria-hidden="true" style={{ color: legible(current.hex, bg.hex) }}>
                      Aa
                    </span>
                    <span className="w-plana-pair__line">
                      <span className="w-plana-pair__ratio">{ratio.toFixed(1)} : 1</span>
                      <span className="w-plana-pair__verdict">
                        on {bg.name}: {v.label}
                      </span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    </Plate>
  )
}
