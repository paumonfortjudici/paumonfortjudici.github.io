// The manual viewer: a lightbox for the 17 pages, portalled into the shell's folder body (so it covers the world but not the tab strip).
// Real buttons for previous / next / close, a thumbnail row, arrow keys / Home / End, Escape (through the world's Escape stack, so the
// world stays open), a focus trap, and focus returns to the page that opened it (Manual does that on close).
import { useEffect, useRef, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { TabButton } from '../../components/primitives'
import { useKey } from '../../lib/hooks'
import { useWorldEscape } from '../WorldContext'
import { MANUAL, plana } from './data'

interface ViewerProps {
  index: number
  onIndex: (index: number) => void
  onClose: () => void
  container: HTMLElement
}

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]'
const COUNT = MANUAL.length

export function ManualViewer({ index, onIndex, onClose, container }: ViewerProps) {
  const root = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLElement | null>(null)
  const page = MANUAL[index]

  useWorldEscape(true, onClose)

  const go = (next: number) => onIndex(Math.max(0, Math.min(COUNT - 1, next)))
  useKey('ArrowRight', () => go(index + 1), { preventDefault: true })
  useKey('ArrowLeft', () => go(index - 1), { preventDefault: true })
  useKey('Home', () => go(0), { preventDefault: true })
  useKey('End', () => go(COUNT - 1), { preventDefault: true })

  // focus the close tab on open, and warm the neighbours' pictures
  useEffect(() => {
    closeBtn.current?.focus({ preventScroll: true })
  }, [])
  useEffect(() => {
    ;[index - 1, index + 1].forEach((i) => {
      const p = MANUAL[i]
      if (p) new Image().src = plana(p.file)
    })
  }, [index])

  // keep the current thumbnail in view
  useEffect(() => {
    root.current?.querySelector<HTMLElement>('[aria-current="page"]')?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [index])

  const trap = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || !root.current) return
    // only real tab stops: visible, not tabindex -1 (the scrim button is a click target, not a control) and not aria-hidden
    const nodes = Array.from(root.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (n) => n.getClientRects().length > 0 && n.tabIndex >= 0 && !n.closest('[aria-hidden="true"]'),
    )
    if (nodes.length === 0) return
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    const active = document.activeElement
    if (event.shiftKey && (active === first || !root.current.contains(active))) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && (active === last || !root.current.contains(active))) {
      event.preventDefault()
      first.focus()
    }
  }

  return createPortal(
    <div ref={root} className="w-plana-viewer" role="dialog" aria-modal="true" aria-label="Brand manual viewer" onKeyDown={trap}>
      <button type="button" className="w-plana-viewer__scrim" tabIndex={-1} aria-hidden="true" onClick={onClose} data-cursor="Close" />
      <div className="w-plana-viewer__panel">
        <header className="w-plana-viewer__head">
          <p className="w-plana-viewer__count" aria-live="polite">
            <span className="w-plana-viewer__n">{String(page.n).padStart(2, '0')}</span>
            <span>
              of {COUNT} · {page.title}
            </span>
          </p>
          <TabButton
            ref={(el) => {
              closeBtn.current = el
            }}
            size="sm"
            color="var(--poppy)"
            ink="var(--night)"
            icon="cross"
            onClick={onClose}
            cursor="Close"
          >
            Close
          </TabButton>
        </header>

        <div className="w-plana-viewer__stage">
          <TabButton
            className="w-plana-viewer__side"
            size="md"
            color="var(--wheat)"
            ink="var(--night)"
            icon="arrow-left"
            aria-label="Previous page"
            aria-disabled={index === 0 || undefined}
            onClick={() => index > 0 && go(index - 1)}
          >
            <span className="pm-sr">Previous page</span>
          </TabButton>

          <figure className="w-plana-viewer__figure">
            <img key={page.n} className="w-plana-viewer__img" src={plana(page.file)} width={1600} height={1000} alt={page.alt} decoding="async" style={{ background: page.bg }} />
          </figure>

          <TabButton
            className="w-plana-viewer__side"
            size="md"
            color="var(--wheat)"
            ink="var(--night)"
            icon="arrow-right"
            aria-label="Next page"
            aria-disabled={index === COUNT - 1 || undefined}
            onClick={() => index < COUNT - 1 && go(index + 1)}
          >
            <span className="pm-sr">Next page</span>
          </TabButton>
        </div>

        <div className="w-plana-viewer__foot">
          <p className="w-plana-viewer__caption">
            {page.caption}
            {page.sample && <strong> Sample mockup: the contact details and numbers on this page are placeholders.</strong>}
          </p>
          <p className="w-plana-viewer__lang">The page’s own text is Spanish or Catalan; the caption is mine.</p>
        </div>

        <ol className="w-plana-viewer__thumbs" aria-label="Pages">
          {MANUAL.map((p, i) => (
            <li key={p.n}>
              <button
                type="button"
                className="w-plana-viewer__thumb"
                aria-label={`Page ${p.n}: ${p.title}`}
                aria-current={i === index ? 'page' : undefined}
                style={{ background: p.bg }}
                onClick={() => onIndex(i)}
              >
                <span>{p.n}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>,
    container,
  )
}
