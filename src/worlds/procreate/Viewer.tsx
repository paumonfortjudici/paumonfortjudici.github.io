// The close-up: one page of the sketchbook big and on its own, over the desk.
// Focus goes into the dialog, Tab stays inside it, the arrow keys (and the tabs, and a swipe) move to the previous / next page,
// Esc or "Back to the book" closes it. Escape goes through useWorldEscape, so the world itself stays open.
// It is portalled into the folder body (the shell's non-scrolling box), so it covers exactly the area under the tab strip
// wherever the world has been scrolled to.
import { useEffect, useId, useRef, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { TabButton } from '../../components/primitives'
import { useWorldEscape } from '../WorldContext'
import { COPY, PAGE_H, PAGE_W, PAGES, pageSrc } from './data'

interface ViewerProps {
  /** index in PAGES */
  face: number
  container: HTMLElement
  still: boolean
  onFace: (face: number) => void
  onClose: () => void
}

const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'

const nameOf = (face: number): string => {
  const p = PAGES[face]
  return p.title ?? (p.kind === 'cover' ? 'The cover' : p.kind === 'back' ? 'The back cover' : `Page ${p.n}`)
}

export function Viewer({ face, container, still, onFace, onClose }: ViewerProps) {
  const page = PAGES[face]
  const total = PAGES.length
  const dialog = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const lineId = useId()

  useWorldEscape(true, onClose)
  useEffect(() => {
    dialog.current?.focus({ preventScroll: true })
  }, [])

  const go = (next: number) => onFace(Math.max(0, Math.min(total - 1, next)))

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      go(face - 1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      go(face + 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      go(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      go(total - 1)
    } else if (event.key === 'Tab' && dialog.current) {
      // keep Tab inside the close-up; the shell's own trap must not also act on this event
      event.stopPropagation()
      const nodes = Array.from(dialog.current.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (nodes.length === 0) {
        event.preventDefault()
        return
      }
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      const active = document.activeElement
      if (event.shiftKey && (active === first || active === dialog.current)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }
  }

  const swing = still ? false : ({ opacity: 0, y: 22, rotate: face % 2 ? 1.6 : -1.6 } as const)

  return createPortal(
    <div ref={dialog} className="w-procreate-vw" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={lineId} tabIndex={-1} onKeyDown={onKeyDown}>
      <div className="w-procreate-vw-scrim" aria-hidden="true" />
      <div
        className="w-procreate-vw-inner"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose()
        }}
      >
        <div className="w-procreate-vw-stage">
          <AnimatePresence mode="wait">
            <motion.img
              key={page.id}
              className="w-procreate-vw-page"
              src={pageSrc(page.id)}
              width={PAGE_W}
              height={PAGE_H}
              alt={page.alt}
              draggable={false}
              initial={swing}
              animate={{ opacity: 1, y: 0, rotate: face % 2 ? 0.5 : -0.5 }}
              exit={still ? undefined : { opacity: 0, y: -16 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24, mass: 0.8 }}
              drag={still ? false : 'x'}
              dragSnapToOrigin
              dragElastic={0.5}
              onDragEnd={(_, info) => {
                if (info.offset.x > 90) go(face - 1)
                else if (info.offset.x < -90) go(face + 1)
              }}
            />
          </AnimatePresence>
        </div>

        <div className="w-procreate-vw-caption" aria-live="polite">
          <h3 className="w-procreate-vw-title" id={titleId}>
            {nameOf(face)}
          </h3>
          <p className="w-procreate-vw-line" id={lineId}>
            {page.line ?? (page.n ? `Page ${page.n} of the sketchbook.` : 'The sketchbook.')}
          </p>
        </div>

        <div className="w-procreate-vw-bar">
          <TabButton tone="cream" icon="arrow-left" iconPosition="before" onClick={() => go(face - 1)} disabled={face === 0}>
            {COPY.viewer.prev}
          </TabButton>
          <p className="w-procreate-vw-count t-label" aria-hidden="true">
            {COPY.viewer.counter(face + 1, total)}
          </p>
          <TabButton tone="cream" icon="arrow-right" onClick={() => go(face + 1)} disabled={face === total - 1}>
            {COPY.viewer.next}
          </TabButton>
          <TabButton tone="bubblegum" icon="cross" iconPosition="before" onClick={onClose} cursor="Close">
            {COPY.viewer.back}
          </TabButton>
        </div>
      </div>
    </div>,
    container,
  )
}
