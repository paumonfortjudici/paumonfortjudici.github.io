// Small pieces shared by the info panel, the index and the brand kit: section bars, menu-style leader rows, paint-chip swatches that
// copy their hex, and live type samples.
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { toast } from '../../components/chrome/toast'
import { copyToClipboard } from '../../lib/hooks'
import { COLOUR, type ColourId } from './data'
import type { Sample } from './copy'

/** a Mantega bar with Blau capitals, like PER BEURE on the menu */
export function Bar({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h3 className="w-concept-brand-bar" id={id}>
      <span>{children}</span>
    </h3>
  )
}

/** the menu's dotted leader: name on the left, value on the right */
export function Leader({ rows, big }: { rows: { k: string; v: string }[]; big?: boolean }) {
  return (
    <dl className="w-concept-brand-leader" data-big={big ? 'true' : undefined}>
      {rows.map((r) => (
        <div key={r.k}>
          <dt>{r.k}</dt>
          <dd>{r.v}</dd>
        </div>
      ))}
    </dl>
  )
}

export function useHexCopy() {
  const [last, setLast] = useState<ColourId | null>(null)
  const timer = useRef(0)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const copy = async (id: ColourId) => {
    const c = COLOUR[id]
    const ok = await copyToClipboard(c.hex)
    if (ok) toast(`Copied ${c.hex}`, { swatch: c.hex, label: c.name, tone: 'butter' })
    else toast(`${c.name} is ${c.hex}`, { swatch: c.hex, tone: 'butter' })
    setLast(id)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setLast(null), 1700)
  }
  return { last, copy }
}

/** paint chips: click copies the hex and shows the toast */
export function Swatches({ ids, compact }: { ids: ColourId[]; compact?: boolean }) {
  const { last, copy } = useHexCopy()
  return (
    <ul className="w-concept-brand-swatches" data-compact={compact ? 'true' : undefined}>
      {ids.map((id) => {
        const c = COLOUR[id]
        return (
          <li key={id}>
            <button type="button" className="w-concept-brand-swatch" onClick={() => void copy(id)} data-cursor="Copy" aria-label={`Copy ${c.name}, ${c.hex}`}>
              <span className="w-concept-brand-swatch-chip" style={{ background: c.hex }} aria-hidden="true" />
              <span className="w-concept-brand-swatch-name">{c.name}</span>
              <span className="w-concept-brand-swatch-hex">{last === id ? 'Copied' : c.hex}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/** live type samples in the brand's own faces */
export function TypeSamples({ samples }: { samples: Sample[] }) {
  const display = samples.filter((s) => s.kind !== 'label')
  const labels = samples.filter((s) => s.kind === 'label')
  if (!samples.length) return <p className="w-concept-brand-note">No type on this one. The print is the four heads.</p>
  return (
    <div className="w-concept-brand-type">
      {display.length > 0 && (
        <div className="w-concept-brand-type-row">
          <p className="w-concept-brand-type-name">
            Fraunces <span>soft and wonky</span>
          </p>
          {display.map((s) => (
            <p key={s.text} className="w-concept-brand-sample" data-kind={s.kind}>
              {s.text}
            </p>
          ))}
        </div>
      )}
      {labels.length > 0 && (
        <div className="w-concept-brand-type-row">
          <p className="w-concept-brand-type-name">
            Barlow Semi Condensed <span>800, spaced capitals</span>
          </p>
          {labels.map((s) => (
            <p key={s.text} className="w-concept-brand-sample" data-kind="label">
              {s.text}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
