// The close-up: one print at a bigger size with its one-line description, over the wall.
// Focus goes into the dialog, Tab stays inside it, the arrow keys (and the tabs, and a swipe) move to the previous / next
// print, Esc or "Back to the wall" closes it. Escape goes through useWorldEscape, so the world itself stays open.
// It is portalled into the folder body (the shell's non-scrolling box), so it covers exactly the area under the tab strip
// wherever the world has been scrolled to.
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { TabButton } from '../../components/primitives'
import { useWorldEscape } from '../WorldContext'
import { COPY, PRINTS, aspectOf } from './data'
import { dimsFor } from './layout'
import { Line } from './Line'
import { PrintFace } from './PrintFace'

interface LightboxProps {
  index: number
  container: HTMLElement
  notes: boolean
  still: boolean
  onIndex: (index: number) => void
  onClose: () => void
}

const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'

export function Lightbox({ index, container, notes, still, onIndex, onClose }: LightboxProps) {
  const def = PRINTS[index]
  const total = PRINTS.length
  const dialog = useRef<HTMLDivElement>(null)
  const capRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const lineId = useId()
  const [box, setBox] = useState(() => ({ w: container.clientWidth, h: container.clientHeight }))
  // the real heights of the caption and of the row of tabs (they wrap on a phone, and the caption follows the print's sentence)
  const [chrome, setChrome] = useState(() => (container.clientWidth < 640 ? { cap: 128, bar: 112 } : { cap: 112, bar: 64 }))

  // No scroll lock needed: the close-up is a sibling of the world's scroller (it is portalled into the folder body), so wheel and
  // touch gestures over it never reach the scroller, and the scrollbar does not come and go (which would reflow the wall).
  useWorldEscape(true, onClose)

  useLayoutEffect(() => {
    const read = () => setBox((prev) => (prev.w === container.clientWidth && prev.h === container.clientHeight ? prev : { w: container.clientWidth, h: container.clientHeight }))
    const ro = new ResizeObserver(read)
    ro.observe(container)
    read()
    return () => ro.disconnect()
  }, [container])

  useLayoutEffect(() => {
    const cap = capRef.current
    const bar = barRef.current
    if (!cap || !bar) return
    const read = () =>
      setChrome((prev) => {
        const next = { cap: Math.ceil(cap.offsetHeight), bar: Math.ceil(bar.offsetHeight) }
        return prev.cap === next.cap && prev.bar === next.bar ? prev : next
      })
    const ro = new ResizeObserver(read)
    ro.observe(cap)
    ro.observe(bar)
    read()
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    dialog.current?.focus({ preventScroll: true })
  }, [])

  const go = (next: number) => onIndex((next + total) % total)

  // the paper is the same object as on the wall, only bigger: find the widest one that fits above the caption and the tabs.
  // Height budget = the measured caption + tab row, the padding and gaps of the column (14 + 14 + 14 margin + 12 + 12) and 20 px for
  // a taped corner that overhangs the paper. Where even the smallest paper does not fit (a very short phone) the column scrolls.
  const narrow = box.w < 640
  const side = narrow ? 14 : 56
  const vertical = chrome.cap + chrome.bar + 66 + 20
  const a = aspectOf(def)
  const perWidth = 0.045 + 0.91 / a + def.strip
  const paperW = Math.max(120, Math.min(box.w - side * 2, (box.h - vertical) / perWidth, 1180))
  const dims = dimsFor(def.id, paperW)

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      go(index - 1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      go(index + 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      onIndex(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      onIndex(total - 1)
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

  const swing = still ? false : ({ opacity: 0, y: 26, rotate: index % 2 ? 2 : -2 } as const)

  return createPortal(
    <div
      ref={dialog}
      className="w-procreate-lb"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={lineId}
      data-notes={notes ? 'on' : 'off'}
      tabIndex={-1}
      onKeyDown={onKeyDown}
    >
      <div className="w-procreate-lb-scrim" aria-hidden="true" />
      {/* the column: centred when it fits, scrolling from its top when it does not; a click on its empty dark area closes it */}
      <div
        className="w-procreate-lb-inner"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose()
        }}
      >
        <div className="w-procreate-lb-stage">
          <AnimatePresence mode="wait">
            <motion.div
              key={def.id}
              className="w-procreate-lb-print"
              data-stock={def.stock}
              style={{ width: dims.w, height: dims.h, ['--pw' as string]: `${dims.w}px` }}
              initial={swing}
              animate={{ opacity: 1, y: 0, rotate: index % 2 ? 0.6 : -0.6 }}
              exit={still ? undefined : { opacity: 0, y: -18 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24, mass: 0.8 }}
              drag={still ? false : 'x'}
              dragSnapToOrigin
              dragElastic={0.5}
              onDragEnd={(_, info) => {
                if (info.offset.x > 90) go(index - 1)
                else if (info.offset.x < -90) go(index + 1)
              }}
            >
              <PrintFace def={def} dims={dims} large drawDelay={260} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div ref={capRef} className="w-procreate-lb-caption" aria-live="polite">
          <h3 className="w-procreate-lb-title" id={titleId}>
            {def.title}
          </h3>
          <p className="w-procreate-lb-line" id={lineId}>
            <Line text={def.line} />
          </p>
        </div>

        <div ref={barRef} className="w-procreate-lb-bar">
          <TabButton tone="cream" icon="arrow-left" iconPosition="before" onClick={() => go(index - 1)}>
            {COPY.lightbox.prev}
            <span className="pm-sr"> print</span>
          </TabButton>
          <p className="w-procreate-lb-count t-label" aria-hidden="true">
            {COPY.lightbox.counter(index + 1, total)}
          </p>
          <TabButton tone="cream" icon="arrow-right" onClick={() => go(index + 1)}>
            {COPY.lightbox.next}
            <span className="pm-sr"> print</span>
          </TabButton>
          <TabButton tone="bubblegum" icon="cross" iconPosition="before" onClick={onClose} cursor="Close">
            {COPY.lightbox.back}
          </TabButton>
        </div>
      </div>
    </div>,
    container,
  )
}
