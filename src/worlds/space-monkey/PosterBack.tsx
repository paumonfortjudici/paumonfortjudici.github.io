// The dossier side of a poster: the back of the print, typed like a file card. File name, Poster 0N / 02, the dates of the
// Photoshop document, the palette that is really in the poster (click or tap a swatch to copy its hex), Pau's note and a stamp.
import { useCallback, useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { Stamp } from '@/components/primitives'
import { copyToClipboard } from '@/lib/hooks'
import { notifyCopied } from './notify'
import type { PosterData } from './data'

interface PosterBackProps {
  data: PosterData
  /** the back is the visible side: the stamp thumps down after the card has turned */
  flipped: boolean
  /** lets the poster put the light sheen under the card's own pointer light */
  sheenRef: RefObject<HTMLElement>
}

export function PosterBack({ data, flipped, sheenRef }: PosterBackProps) {
  const [readout, setReadout] = useState<{ hex: string; name: string; copied: boolean } | null>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])
  useEffect(() => {
    if (!flipped) setReadout(null)
  }, [flipped])

  const copy = useCallback(async (hex: string, name: string) => {
    const ok = await copyToClipboard(hex)
    setReadout({ hex, name, copied: ok })
    if (ok) void notifyCopied(hex, name)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setReadout((r) => (r?.hex === hex ? { ...r, copied: false } : r)), 2200)
  }, [])

  return (
    <div className="w-space-monkey-back-sheet">
      <header className="w-space-monkey-back-head">
        <p className="w-space-monkey-back-no">
          Poster {String(data.n).padStart(2, '0')} / 02
        </p>
        {flipped && (
          <span className="w-space-monkey-back-stamp">
            <Stamp text="Filed" sub="File 05" tone="ultraviolet" rotate={-9} size="1.25rem" rough={2} />
          </span>
        )}
      </header>

      <h3 className="w-space-monkey-back-title">{data.title}</h3>
      <p className="w-space-monkey-back-caption">{data.caption}</p>

      <dl className="w-space-monkey-back-fields">
        <div>
          <dt>File</dt>
          <dd>{data.file}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{data.created}</dd>
        </div>
        <div>
          <dt>Saved</dt>
          <dd>{data.saved}</dd>
        </div>
        <div>
          <dt>Made in</dt>
          <dd>Photoshop CS6</dd>
        </div>
      </dl>

      <div className="w-space-monkey-back-palette">
        <p className="w-space-monkey-back-label">Palette</p>
        <ul className="w-space-monkey-back-chips">
          {data.palette.map((s, i) => {
            const isCopied = readout?.hex === s.hex && readout.copied
            return (
              <li key={s.hex}>
                <button
                  type="button"
                  className="w-space-monkey-chip"
                  style={{ '--sw': s.hex, '--tilt': `${i % 2 ? 1.1 : -0.9}deg` } as CSSProperties}
                  aria-label={`Copy ${s.hex}, ${s.name}`}
                  data-copied={isCopied ? 'true' : undefined}
                  data-cursor="Copy"
                  onClick={() => void copy(s.hex, s.name)}
                >
                  <span className="w-space-monkey-chip-color" aria-hidden="true" />
                  <span className="w-space-monkey-chip-hex" aria-hidden="true">
                    {isCopied ? 'Copied' : s.hex}
                  </span>
                  <span className="w-space-monkey-chip-name" aria-hidden="true">
                    {s.name}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        <p className="pm-sr" role="status" aria-live="polite">
          {readout?.copied ? `Copied ${readout.hex}, ${readout.name}` : ''}
        </p>
      </div>

      <p className="w-space-monkey-back-note">
        <span className="w-space-monkey-back-label">Pau’s note</span>
        <span className="w-space-monkey-back-hand">{data.note}</span>
      </p>

      <i ref={sheenRef} className="w-space-monkey-back-sheen" aria-hidden="true" />
    </div>
  )
}
