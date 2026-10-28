// "Read closer": the spread on show, bigger, on the lit glass with the room dimmed. It opens fitted to the screen (about twice the
// size of the book on the table) and one click, tap or the "Full size" tab takes it to the size it was printed at: the pages are
// 1000 px wide pictures, so every line of the layout can be read. At full size it scrolls both ways (drag with the mouse, a finger on
// touch, arrow keys and Page keys with focus); fitted, the arrow keys and [ ] turn the spread. Escape (through the world's Escape
// stack, so the folder stays open), the Close tab or a click on the dark close it.
// It is portalled into the shell's folder body (the way the Plana manual viewer is) so it covers the world but not the tab strip.
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { createPortal } from 'react-dom'
import type { FlipSpreadInfo } from '../../components/flip'
import { TabButton } from '../../components/primitives'
import { useBodyLock } from '../../lib/hooks'
import { useWorldEscape } from '../WorldContext'
import { READER } from './copy'
import { proofLabel } from './helpers'

interface ReaderProps {
  info: FlipSpreadInfo
  container: HTMLElement
  /** the world's scroller: made inert while the reader is open */
  behind: HTMLElement | null
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
  onClose: () => void
}

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), [tabindex]'
/** width of one page picture at full size, in px (the shipped pages are 1000 px wide) */
const PAGE_W = 1000

export default function Reader({ info, container, behind, canPrev, canNext, onPrev, onNext, onClose }: ReaderProps) {
  const root = useRef<HTMLDivElement>(null)
  const scroll = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number; left: number; top: number; moved: number } | null>(null)
  const opener = useRef<Element | null>(null)
  const [full, setFull] = useState(false)
  const [fit, setFit] = useState(0.6)

  useWorldEscape(true, onClose)
  useBodyLock(true, behind)

  // focus moves in on open and goes back to the tab that opened the reader on close; the world underneath is inert meanwhile
  useEffect(() => {
    opener.current = document.activeElement
    behind?.setAttribute('inert', '')
    scroll.current?.focus({ preventScroll: true })
    return () => {
      behind?.removeAttribute('inert')
      const back = opener.current
      if (back instanceof HTMLElement && back.isConnected) back.focus({ preventScroll: true })
    }
  }, [behind])

  // the scale that fits the whole spread in the room that is left, never bigger than the print
  const pages = info.pages.length
  const ratio = info.pages[0] ? info.pages[0].height / info.pages[0].width : 1.331
  useLayoutEffect(() => {
    const el = scroll.current
    if (!el) return
    const measure = () => {
      const cs = getComputedStyle(el)
      const w = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      const h = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
      if (w > 0 && h > 0) setFit(Math.min(1, w / (pages * PAGE_W), h / (PAGE_W * ratio)))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [pages, ratio])

  // a new spread, or a change of size, starts at the top left of its pages
  const first = info.pages[0]?.id
  useEffect(() => {
    scroll.current?.scrollTo({ left: 0, top: 0 })
  }, [first, full])

  const trap = (event: KeyboardEvent<HTMLDivElement>) => {
    const k = event.key
    const arrows = k === 'ArrowLeft' || k === 'ArrowRight'
    // the book behind listens to the arrow keys anywhere (keys="window"): inside the reader they are the reader's, so it never turns twice
    if (arrows || k === 'ArrowUp' || k === 'ArrowDown' || k === 'Home' || k === 'End') event.stopPropagation()
    // fitted, nothing scrolls: Left and Right turn the spread
    if (arrows && !full && event.target === scroll.current) {
      event.preventDefault()
      if (k === 'ArrowRight' && canNext) onNext()
      if (k === 'ArrowLeft' && canPrev) onPrev()
      return
    }
    // the shell's project keys would leave the folder: here they are the spread keys
    if (k === '[' || k === ']') {
      event.preventDefault()
      event.stopPropagation()
      if (k === ']' && canNext) onNext()
      if (k === '[' && canPrev) onPrev()
      return
    }
    if (k !== 'Tab' || !root.current) return
    const nodes = Array.from(root.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.getClientRects().length > 0 && n.tabIndex >= 0 && !n.closest('[aria-hidden="true"]'))
    if (nodes.length === 0) return
    const firstNode = nodes[0]
    const lastNode = nodes[nodes.length - 1]
    const active = document.activeElement
    if (event.shiftKey && (active === firstNode || !root.current.contains(active))) {
      event.preventDefault()
      lastNode.focus()
    } else if (!event.shiftKey && (active === lastNode || !root.current.contains(active))) {
      event.preventDefault()
      firstNode.focus()
    }
  }

  // drag to look around (a mouse; touch and pens scroll natively). A press that hardly moves is a click: it toggles the size.
  const down = (e: PointerEvent<HTMLDivElement>) => {
    const el = scroll.current
    if (!el || e.pointerType !== 'mouse' || e.button !== 0) return
    drag.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop, moved: 0 }
    if (full) {
      el.setPointerCapture(e.pointerId)
      el.dataset.drag = ''
    }
  }
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const el = scroll.current
    const d = drag.current
    if (!el || !d) return
    d.moved = Math.max(d.moved, Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y))
    if (full) {
      el.scrollLeft = d.left - (e.clientX - d.x)
      el.scrollTop = d.top - (e.clientY - d.y)
    }
  }
  const up = (e: PointerEvent<HTMLDivElement>) => {
    const el = scroll.current
    if (!el) return
    drag.current = null
    delete el.dataset.drag
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
  }
  const click = (e: React.MouseEvent<HTMLDivElement>) => {
    const moved = drag.current?.moved ?? 0
    if (moved > 5) return
    // a click on the pages (not on the dark around them) changes the size
    if ((e.target as HTMLElement).tagName === 'IMG') setFull((v) => !v)
  }

  const label = proofLabel(info)
  const scale = full ? 1 : fit

  return createPortal(
    <div ref={root} className="w-contract-reader" role="dialog" aria-modal="true" aria-label={`${READER.title}: ${info.text}`} onKeyDown={trap}>
      <button type="button" className="w-contract-reader-scrim" tabIndex={-1} aria-hidden="true" onClick={onClose} data-cursor="Close" />
      <header className="w-contract-reader-head">
        <p className="w-contract-reader-title">
          <span className="w-contract-reader-live">Proof {label}</span>
          <span className="w-contract-reader-hint">{full ? READER.hintFull : READER.hintFit}</span>
        </p>
        <div className="w-contract-reader-tabs">
          <TabButton size="sm" tone="paper" icon="arrow-left" cursor="Flip" aria-disabled={!canPrev || undefined} onClick={() => canPrev && onPrev()}>
            <span className="pm-sr">{READER.prev}</span>
          </TabButton>
          <TabButton size="sm" tone="paper" icon="arrow-right" cursor="Flip" aria-disabled={!canNext || undefined} onClick={() => canNext && onNext()}>
            <span className="pm-sr">{READER.next}</span>
          </TabButton>
          <TabButton size="sm" tone="marigold" selected={full} aria-pressed={full} cursor={full ? 'Close' : 'Open'} onClick={() => setFull((v) => !v)}>
            {READER.full}
          </TabButton>
          <TabButton size="sm" tone="tomato" icon="cross" cursor="Close" onClick={onClose}>
            <span className="w-contract-reader-long">{READER.close}</span>
            <span className="w-contract-reader-short" aria-hidden="true">
              {READER.closeShort}
            </span>
          </TabButton>
        </div>
      </header>
      <div
        ref={scroll}
        className="w-contract-reader-scroll"
        data-full={full ? '' : undefined}
        tabIndex={0}
        role="region"
        aria-label={`${info.text}, ${full ? 'full size. Scroll to look around.' : 'fitted to the screen.'}`}
        data-cursor={full ? 'Drag' : 'Open'}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onClick={click}
      >
        <div className="w-contract-reader-spread" data-pages={pages} style={{ '--pw': `${(PAGE_W * scale).toFixed(2)}px` } as CSSProperties}>
          {info.pages.map((p) => (
            <img key={p.id} src={p.src} width={p.width} height={p.height} alt={p.alt} decoding="async" draggable={false} />
          ))}
        </div>
      </div>
    </div>,
    container,
  )
}
