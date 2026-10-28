// A page viewer for the sample book: one page at its real size (900 px wide, the interior is set small), scrollable, with
// previous / next / close tabs, the arrow keys and Escape. It lives in the world's sticky layer so it covers exactly the visible
// part of the scroller (never the shell's tab strip). Keys are handled on the viewer itself (React handler, stopPropagation), so
// neither the shell's focus trap nor the book behind it reacts to them.
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { TabButton } from '@/components/primitives'
import { useBodyLock } from '@/lib/hooks/useBodyLock'
import { useMediaQuery } from '@/lib/hooks/useMediaQuery'
import { asset } from '@/lib/asset'
import { useWorld, useWorldEscape } from '../WorldContext'
import { SG } from './copy'
import { BASE, COVER, FLIP_PAGES } from './data'

export interface ZoomPage {
  src: string
  alt: string
  w: number
  h: number
  /** short typed caption */
  caption: string
}

/** every page of the sample, in reading order: front cover, the 16 pages, back cover */
export const ZOOM_PAGES: ZoomPage[] = [
  { src: asset(`${BASE}/${COVER.front.file}`), alt: SG.poster.frontAlt, w: COVER.front.w, h: COVER.front.h, caption: SG.reader.covers.front },
  ...FLIP_PAGES.map((p) => ({ src: asset(`${BASE}/${p.file}`), alt: p.alt, w: p.w, h: p.h, caption: `Page ${p.n} of 214 · ${p.label}` })),
  { src: asset(`${BASE}/${COVER.back.file}`), alt: 'Back cover of Spelled Guilty.', w: COVER.back.w, h: COVER.back.h, caption: SG.reader.covers.back },
]

/** the spread of the book that holds page index i of ZOOM_PAGES */
export const spreadOfPage = (i: number): number => (i <= 0 ? 0 : i >= ZOOM_PAGES.length - 1 ? 9 : Math.floor((i - 1) / 2) + 1)

/** the page to open for a spread: the right-hand page (the word search or the how-to), or a cover */
export const pageOfSpread = (spread: number): number => (spread <= 0 ? 0 : spread >= 9 ? ZOOM_PAGES.length - 1 : 2 * (spread - 1) + 2)

interface ZoomProps {
  open: boolean
  startPage: number
  onClose: (lastPage: number) => void
}

const TABBABLE = 'button:not([disabled]), [href], [tabindex="0"]'

export default function Zoom({ open, startPage, onClose }: ZoomProps) {
  const [page, setPage] = useState(startPage)
  const narrow = useMediaQuery('(max-width: 560px)')
  const { scrollRef: roomRef } = useWorld()
  const rootRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLElement | null>(null)
  const last = ZOOM_PAGES.length - 1

  // each opening starts on the page it was asked for
  useEffect(() => {
    if (open) setPage(startPage)
  }, [open, startPage])

  const go = useCallback(
    (to: number) => {
      setPage(Math.min(last, Math.max(0, to)))
      scrollRef.current?.scrollTo({ top: 0 })
    },
    [last],
  )

  const close = useCallback(() => onClose(page), [onClose, page])
  useWorldEscape(open, close)
  // the room behind the viewer does not scroll while it is open
  useBodyLock(open, roomRef)

  // focus moves into the viewer when it opens (the world gives it back to whatever opened it)
  useEffect(() => {
    if (open) closeRef.current?.focus({ preventScroll: true })
  }, [open])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault()
      event.stopPropagation()
      go(page + (event.key === 'ArrowRight' ? 1 : -1))
    } else if (event.key === 'Tab' && rootRef.current) {
      const nodes = Array.from(rootRef.current.querySelectorAll<HTMLElement>(TABBABLE))
      if (nodes.length === 0) return
      const first = nodes[0]
      const lastNode = nodes[nodes.length - 1]
      const active = document.activeElement
      if (event.shiftKey && (active === first || !rootRef.current.contains(active))) {
        event.preventDefault()
        event.stopPropagation()
        lastNode.focus()
      } else if (!event.shiftKey && (active === lastNode || !rootRef.current.contains(active))) {
        event.preventDefault()
        event.stopPropagation()
        first.focus()
      }
    }
  }

  if (!open) return null
  const p = ZOOM_PAGES[page]

  return (
    <div ref={rootRef} className="w-sg-zoom" role="dialog" aria-modal="true" aria-label={SG.reader.zoomLabel} data-sg-ui="" onKeyDown={onKeyDown}>
      <div className="w-sg-zoom__bar">
        <p className="w-sg-type w-sg-zoom__cap" aria-live="polite">
          {p.caption}
        </p>
        <div className="w-sg-zoom__tabs">
          <TabButton size="sm" tone="cream" icon="arrow-left" iconPosition="before" aria-label={SG.reader.zoomPrev} disabled={page === 0} onClick={() => go(page - 1)}>
            {narrow ? SG.reader.zoomPrevShort : SG.reader.zoomPrev}
          </TabButton>
          <TabButton size="sm" tone="cream" icon="arrow-right" aria-label={SG.reader.zoomNext} disabled={page === last} onClick={() => go(page + 1)}>
            {narrow ? SG.reader.zoomNextShort : SG.reader.zoomNext}
          </TabButton>
          <TabButton ref={closeRef} size="sm" tone="tomato" icon="cross" iconPosition="before" aria-label={SG.reader.zoomClose} onClick={close}>
            {narrow ? SG.reader.zoomCloseShort : SG.reader.zoomClose}
          </TabButton>
        </div>
      </div>
      <div ref={scrollRef} className="w-sg-zoom__scroll" tabIndex={0} role="region" aria-label={p.caption}>
        <img key={p.src} className="w-sg-zoom__page" src={p.src} alt={p.alt} width={p.w} height={p.h} decoding="async" draggable={false} />
      </div>
    </div>
  )
}
