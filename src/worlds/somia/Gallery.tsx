// Eight key screens hung as framed pictures, with a small lightbox. The lightbox is portalled into the world's folder body
// (below the tab strip), traps Tab itself, takes Escape through useWorldEscape (so Escape closes the picture, not the world),
// swallows [ and ] while it is open, and hands focus back to the frame that opened it.

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowIcon, CrossIcon } from '../../components/primitives'
import { useWorld, useWorldEscape } from '../WorldContext'
import { FRAMED, cap, type Framed } from './data'

const FOCUSABLE = 'button:not([disabled]):not([tabindex="-1"]), [href], [tabindex]:not([tabindex="-1"])'

function Lightbox({ index, onIndex, onClose, host }: { index: number; onIndex: (next: number) => void; onClose: () => void; host: HTMLElement }) {
  const item = FRAMED[index]
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const count = FRAMED.length
  const go = useCallback((dir: 1 | -1) => onIndex((index + dir + count) % count), [index, count, onIndex])

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true })
  }, [])

  // the neighbours are fetched while this picture is looked at, so Left / Right never shows an empty frame
  useEffect(() => {
    for (const neighbour of [FRAMED[(index + 1) % count], FRAMED[(index - 1 + count) % count]]) {
      const img = new Image()
      img.decoding = 'async'
      img.src = cap(neighbour.file)
    }
  }, [index, count])

  // [ and ] must not hop to another project while a picture is open: swallow them before the shell's listener
  useEffect(() => {
    const swallow = (event: globalThis.KeyboardEvent) => {
      if (event.key === '[' || event.key === ']') event.preventDefault()
    }
    window.addEventListener('keydown', swallow, true)
    return () => window.removeEventListener('keydown', swallow, true)
  }, [])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      event.stopPropagation()
      go(1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      event.stopPropagation()
      go(-1)
    } else if (event.key === 'Tab') {
      const nodes = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      const active = document.activeElement
      if (event.shiftKey && (active === first || !dialogRef.current?.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || !dialogRef.current?.contains(active))) {
        event.preventDefault()
        first.focus()
      }
      event.stopPropagation() // the shell's own trap must not also run
    }
  }

  return createPortal(
    <motion.div
      ref={dialogRef}
      className="w-somia-lb"
      role="dialog"
      aria-modal="true"
      aria-label="Screenshots of somia.store"
      data-frame={item.frame}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.22 } }}
      exit={{ opacity: 0, transition: { duration: 0.16 } }}
      onKeyDown={onKeyDown}
    >
      {/* the dark around the picture is one big button (out of the tab order, hidden from assistive tech: Close and Escape are the keyboard path) */}
      <button type="button" className="w-somia-lb__backdrop" tabIndex={-1} aria-hidden="true" onClick={onClose} data-cursor="Close" />
      <div className="w-somia-lb__bar">
        <p className="w-somia-lb__count" aria-live="polite">
          {index + 1} / {count}
        </p>
        <button ref={closeRef} type="button" className="w-somia-btn w-somia-btn--light" onClick={onClose} data-cursor="Close">
          <CrossIcon className="w-somia-btn__icon" />
          <span>Close</span>
        </button>
      </div>

      <div className="w-somia-lb__stage">
        <button type="button" className="w-somia-lb__nav w-somia-lb__nav--prev" onClick={() => go(-1)} aria-label="Previous picture">
          <ArrowIcon dir="left" />
        </button>
        <figure className="w-somia-lb__fig">
          <span className="w-somia-lb__frame">
            <span className="w-somia-lb__mat">
              <img key={item.id} src={cap(item.file)} alt={item.alt} width={item.w} height={item.h} decoding="async" />
            </span>
          </span>
          <figcaption className="w-somia-lb__cap">
            <span className="w-somia-lb__title">{item.title}</span>
            {item.es && (
              <span className="w-somia-lb__es">
                <i lang="es">{item.es}</i>
                {item.tr && <span className="w-somia-lb__tr">&ldquo;{item.tr}&rdquo;</span>}
              </span>
            )}
            <span className="w-somia-lb__note">{item.note}</span>
          </figcaption>
        </figure>
        <button type="button" className="w-somia-lb__nav w-somia-lb__nav--next" onClick={() => go(1)} aria-label="Next picture">
          <ArrowIcon dir="right" />
        </button>
      </div>
    </motion.div>,
    host,
  )
}

function Frame({ item, onOpen, index }: { item: Framed; index: number; onOpen: (index: number, trigger: HTMLButtonElement) => void }) {
  return (
    <li className="w-somia-fr" data-frame={item.frame} data-id={item.id}>
      <button type="button" className="w-somia-fr__btn" onClick={(event) => onOpen(index, event.currentTarget)} aria-label={`Open larger: ${item.title}`} data-cursor="Open">
        <span className="w-somia-fr__frame">
          <span className="w-somia-fr__mat">
            <span className="w-somia-fr__pic" style={{ aspectRatio: item.crop.ratio }}>
              <img
                src={cap(item.file)}
                alt=""
                width={item.w}
                height={item.h}
                loading="lazy"
                decoding="async"
                style={{
                  width: `${100 / item.crop.w}%`,
                  height: `${100 / item.crop.h}%`,
                  left: `${(-item.crop.x / item.crop.w) * 100}%`,
                  top: `${(-item.crop.y / item.crop.h) * 100}%`,
                }}
              />
            </span>
          </span>
        </span>
      </button>
      <p className="w-somia-fr__cap">
        <b>{item.title}</b>
        {item.es && <i lang="es">{item.es}</i>}
      </p>
    </li>
  )
}

export function Gallery({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const { scrollRef } = useWorld()
  const [open, setOpen] = useState<number | null>(null)
  const trigger = useRef<HTMLButtonElement | null>(null)
  const host = scrollRef.current?.parentElement ?? null

  const close = useCallback(() => {
    setOpen(null)
    onOpenChange(false)
    // the world's content is no longer inert once the parent has re-rendered
    window.requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true }))
  }, [onOpenChange])

  useWorldEscape(open !== null, close)

  const onOpen = (index: number, button: HTMLButtonElement) => {
    trigger.current = button
    setOpen(index)
    onOpenChange(true)
  }

  return (
    <section className="w-somia-gallery" aria-labelledby="somia-gallery-title">
      <div className="w-somia-gallery__wall">
        <header className="w-somia-gallery__head">
          <h3 id="somia-gallery-title" className="w-somia-gallery__title">
            <span className="pm-sr">On the wall: </span>
            eight screens, framed
          </h3>
          <p className="w-somia-gallery__lede">Home, menu, collection, product, materials, editorial and the basket, each cropped to the part that matters. Open one to see the whole screen.</p>
        </header>
        <ul className="w-somia-gallery__list" role="list">
          {FRAMED.map((item, i) => (
            <Frame key={item.id} item={item} index={i} onOpen={onOpen} />
          ))}
        </ul>
      </div>
      <AnimatePresence>{open !== null && host ? <Lightbox key="lightbox" index={open} onIndex={setOpen} onClose={close} host={host} /> : null}</AnimatePresence>
    </section>
  )
}
