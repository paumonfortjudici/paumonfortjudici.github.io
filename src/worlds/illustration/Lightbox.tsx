// The Details lightbox: the full-size sticker on a field of its own accent colour, its description, the accent swatch (click to
// copy the hex), previous / next. Focus trap, Escape through the world's escape stack, focus goes back to whatever opened it.
import { useEffect, useRef, type CSSProperties, type KeyboardEvent } from 'react'
import { TabButton } from '../../components/primitives'
import { useCopy } from '../../lib/hooks'
import { useWorldEscape } from '../WorldContext'
import { STICKERS, art, stickerInfo } from './data'
import { SHAPES } from './shapes.generated'

interface Props {
  n: number
  onClose: () => void
  onStep: (dir: 1 | -1) => void
}

const FOCUSABLE = 'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'

export function Lightbox({ n, onClose, onStep }: Props) {
  const info = stickerInfo(n)
  const { copied, copy } = useCopy(info.hex)
  const ref = useRef<HTMLDivElement>(null)
  useWorldEscape(true, onClose)

  useEffect(() => {
    ref.current?.focus({ preventScroll: true })
  }, [])

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      onStep(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      onStep(-1)
    } else if (e.key === 'Tab') {
      const items = Array.from(ref.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || active === ref.current)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  const style = { '--accent': info.hex } as CSSProperties
  return (
    <div className="w-illustration-lightbox" role="dialog" aria-modal="true" aria-labelledby="w-illustration-lb-title" tabIndex={-1} ref={ref} onKeyDown={onKeyDown} style={style}>
      <div className="w-illustration-lb-field">
        <figure className="w-illustration-lb-fig" key={n}>
          {/* the white vinyl margin first: it is the placeholder while the full-size image loads, and it keeps the die-cut
              edge readable against a field of the sticker's own colour */}
          <svg className="w-illustration-lb-vinyl" viewBox="0 0 1200 1600" aria-hidden="true" focusable="false">
            <path d={SHAPES[n].d} />
          </svg>
          <img src={art(info.file)} srcSet={`${art(info.thumb)} 300w, ${art(info.file)} 1200w`} sizes="(min-width: 760px) 40vw, 80vw" width={1200} height={1600} alt={info.alt} decoding="async" />
        </figure>
        <div className="w-illustration-lb-text">
          <p className="w-illustration-lb-kicker">
            No. {String(n).padStart(2, '0')} of {String(STICKERS.length).padStart(2, '0')}
          </p>
          <h3 className="w-illustration-lb-title" id="w-illustration-lb-title">
            {info.caption}
          </h3>
          <p className="w-illustration-lb-alt">{info.alt}</p>
          <button type="button" className="w-illustration-lb-swatch" onClick={() => void copy()} data-cursor="Copy" aria-label={`Copy the accent colour ${info.hex}`}>
            <span className="w-illustration-lb-chip" aria-hidden="true" />
            <span className="w-illustration-lb-hex">{info.hex}</span>
            <span className="w-illustration-lb-copy">
              {copied ? (
                'Copied'
              ) : (
                <>
                  <span className="w-illustration-lb-name">{info.accent}</span>, click to copy
                </>
              )}
            </span>
          </button>
          <span className="pm-sr" role="status">
            {copied ? `Copied ${info.hex}` : ''}
          </span>
          <div className="w-illustration-lb-nav">
            <TabButton size="md" tone="cream" icon="arrow-left" iconPosition="before" onClick={() => onStep(-1)}>
              Previous
            </TabButton>
            <TabButton size="md" tone="cream" icon="arrow-right" onClick={() => onStep(1)}>
              Next
            </TabButton>
            <TabButton size="md" tone="ink" icon="cross" onClick={onClose}>
              Close
            </TabButton>
          </div>
        </div>
      </div>
    </div>
  )
}
