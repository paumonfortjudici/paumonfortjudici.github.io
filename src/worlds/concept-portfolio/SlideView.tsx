// One slide as an object: the picture, the director's pins, the sound hotspots, the pop of an onomatopoeia and the loupe.
// Used by the lane (five mounts) and by the presenter (the slide on show). Everything is positioned in percent of the frame,
// so it follows the slide at any size. Only the slide in the middle is interactive; the others are inert.
import { memo, useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { COPY } from './copy'
import { SLIDE_W, type Pin, type Slide } from './data'
import { clamp, useDeck, useInert } from './deck'
import { SpeakerIcon } from './icons'

// ---- the loupe ----------------------------------------------------------------------------------------------------------
// A round glass that follows the mouse (hover), or sits at a fixed point that the arrow keys / a drag move (zoom mode). It shows
// the same 1080 px picture, enlarged. Position and enlargement are plain transforms written straight to the DOM.
function Loupe({ frameRef, src, active }: { frameRef: RefObject<HTMLDivElement>; src: string; active: boolean }) {
  const deck = useDeck()
  const lensRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const tagRef = useRef<HTMLSpanElement>(null)
  const geo = useRef({ w: 0, h: 0, z: 2.5, d: 196 })
  const zoomRef = useRef(deck.zoom)
  zoomRef.current = deck.zoom
  const [hover, setHover] = useState(false)
  const visible = active && (deck.zoom || hover)

  const measure = useCallback(() => {
    const frame = frameRef.current
    const lens = lensRef.current
    const img = imgRef.current
    if (!frame || !lens || !img) return
    const w = frame.clientWidth
    const h = frame.clientHeight
    if (!w) return
    const z = clamp(SLIDE_W / w, 2, 3.1)
    geo.current = { w, h, z, d: lens.offsetWidth }
    img.style.width = `${w * z}px`
    img.style.height = `${h * z}px`
    if (tagRef.current) tagRef.current.textContent = `×${z.toFixed(1)}`
  }, [frameRef])

  const place = useCallback((x: number, y: number) => {
    const { z, d } = geo.current
    const lens = lensRef.current
    const img = imgRef.current
    if (!lens || !img) return
    lens.style.transform = `translate3d(${(x - d / 2).toFixed(1)}px, ${(y - d / 2).toFixed(1)}px, 0)`
    img.style.transform = `translate3d(${(d / 2 - x * z).toFixed(1)}px, ${(d / 2 - y * z).toFixed(1)}px, 0)`
  }, [])

  useLayoutEffect(() => {
    if (!active) return
    measure()
    const frame = frameRef.current
    if (!frame || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(frame)
    return () => ro.disconnect()
  }, [active, measure, frameRef])

  // fixed zoom: the point comes from the arrow keys or a drag
  useEffect(() => {
    if (!active || !deck.zoom) return
    measure()
    place((deck.zoomPt.x / 100) * geo.current.w, (deck.zoomPt.y / 100) * geo.current.h)
  }, [active, deck.zoom, deck.zoomPt, measure, place])

  // hover lens (mouse and trackpad only; touch uses the Loupe button)
  useEffect(() => {
    const frame = frameRef.current
    if (!frame || !active || !deck.fine) return
    let inside = false
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || zoomRef.current) return
      const overUi = (e.target as Element | null)?.closest?.('[data-cp-ui]')
      if (overUi) {
        if (inside) {
          inside = false
          setHover(false)
        }
        return
      }
      if (!inside) {
        inside = true
        measure()
        setHover(true)
      }
      const rect = frame.getBoundingClientRect()
      const sx = rect.width ? frame.clientWidth / rect.width : 1
      const sy = rect.height ? frame.clientHeight / rect.height : 1
      place((e.clientX - rect.left) * sx, (e.clientY - rect.top) * sy)
    }
    const onLeave = () => {
      inside = false
      setHover(false)
    }
    frame.addEventListener('pointermove', onMove)
    frame.addEventListener('pointerleave', onLeave)
    return () => {
      frame.removeEventListener('pointermove', onMove)
      frame.removeEventListener('pointerleave', onLeave)
      setHover(false)
    }
  }, [active, deck.fine, measure, place, frameRef])

  // drag the fixed loupe (touch or mouse)
  const { setZoomPt, zoom } = deck
  useEffect(() => {
    const frame = frameRef.current
    if (!frame || !active || !zoom) return
    let id = -1
    const toPct = (e: PointerEvent) => {
      const rect = frame.getBoundingClientRect()
      return { x: clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100), y: clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100) }
    }
    const down = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest?.('[data-cp-ui]')) return
      id = e.pointerId
      frame.setPointerCapture(id)
      setZoomPt(toPct(e))
    }
    const move = (e: PointerEvent) => {
      if (e.pointerId === id) setZoomPt(toPct(e))
    }
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return
      id = -1
      if (frame.hasPointerCapture(e.pointerId)) frame.releasePointerCapture(e.pointerId)
    }
    frame.addEventListener('pointerdown', down)
    frame.addEventListener('pointermove', move)
    frame.addEventListener('pointerup', up)
    frame.addEventListener('pointercancel', up)
    return () => {
      frame.removeEventListener('pointerdown', down)
      frame.removeEventListener('pointermove', move)
      frame.removeEventListener('pointerup', up)
      frame.removeEventListener('pointercancel', up)
    }
  }, [active, zoom, setZoomPt, frameRef])

  if (!active) return null
  return (
    <div ref={lensRef} className="w-cp-loupe" data-on={visible ? 'true' : 'false'} data-fixed={deck.zoom ? 'true' : undefined} aria-hidden="true">
      <span className="w-cp-loupe-glass">
        <img ref={imgRef} src={src} alt="" width={SLIDE_W} height={1920} decoding="async" draggable={false} />
      </span>
      <span ref={tagRef} className="w-cp-loupe-tag" />
    </div>
  )
}

// ---- the director's pins -------------------------------------------------------------------------------------------------
/**
 * Where a note sits. Wide screens: the slip opens onto the wall beside the slide (never over the art it explains) and a thin
 * leader line is inked from the pin to it; if the wall is too narrow it stays inside the slide, beside its pin. Phones: the note is
 * docked as a strip along the top or the bottom edge of the slide, whichever hides fewer of the other pins (and never its own),
 * and it lets taps through, so every pin stays pressable.
 */
function Note({ id, pin, siblings, k, total, side }: { id: string; pin: Pin; siblings: Pin[]; k: number; total: number; side: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const frame = el.closest('.w-cp-frame')?.getBoundingClientRect()
    const vw = document.documentElement.clientWidth
    const pad = 10
    const reset = (mode: string) => {
      el.setAttribute('data-side', mode)
      el.style.width = ''
      el.style.setProperty('--nx', '0px')
      el.style.setProperty('--ny', '0px')
      el.style.setProperty('--lead', '0px')
    }
    // beside the slide, on the wall: only when the wall has room there
    if (side !== 'dock' && frame) {
      reset(side)
      const rect = el.getBoundingClientRect()
      const out = side === 'r' ? frame.right + 24 - rect.left : frame.left - 24 - rect.right
      const fits = side === 'r' ? rect.right + out <= vw - pad : rect.left + out >= pad
      if (fits) {
        let ny = 0
        const host = el.closest('.w-cp-lane, .w-cp-pres-slide')?.getBoundingClientRect()
        const top = (host?.top ?? 0) + 4
        const bottom = (host?.bottom ?? window.innerHeight) - 4
        if (rect.top < top) ny = top - rect.top
        else if (rect.bottom > bottom) ny = bottom - rect.bottom
        el.style.setProperty('--nx', `${out}px`)
        el.style.setProperty('--ny', `${ny}px`)
        el.style.setProperty('--lead', `${Math.abs(out) + 11}px`)
        return
      }
    }
    // no room beside the slide (phones, small tablets): a strip along its top or bottom edge, over the fewest other pins
    reset('dock')
    if (!frame) return
    el.style.width = `${Math.round(frame.width - 12)}px`
    const rect = el.getBoundingClientRect()
    const h = rect.height / (frame.height || 1) // note height as a share of the slide
    const covered = (from: number, to: number) => siblings.filter((p) => p.id !== pin.id && p.y >= from * 100 - 3 && p.y <= to * 100 + 3).length
    const ownTop = pin.y <= h * 100 + 3
    const ownBottom = pin.y >= (1 - h) * 100 - 3
    const top = covered(0, h)
    const bottom = covered(1 - h, 1)
    const atTop = ownTop ? false : ownBottom ? true : top < bottom || (top === bottom && pin.y > 54)
    el.style.setProperty('--nx', `${frame.left + 6 - rect.left}px`)
    el.style.setProperty('--ny', `${atTop ? frame.top + 6 - rect.top : frame.bottom - 6 - rect.bottom}px`)
  })

  return (
    <div ref={ref} id={id} className="w-cp-note" role="group" aria-labelledby={`${id}-t`} data-side={side} data-cursor="none" data-cp-ui>
      <div className="w-cp-note-in">
        <p className="w-cp-note-k">{COPY.notes.kicker(k + 1, total)}</p>
        <p className="w-cp-note-t" id={`${id}-t`}>
          {pin.title}
        </p>
        <p className="w-cp-note-p">{pin.text}</p>
        <p className="w-cp-note-by" aria-hidden="true">
          {COPY.notes.signature}
        </p>
      </div>
    </div>
  )
}

function PinMark({ pin, siblings, k, total }: { pin: Pin; siblings: Pin[]; k: number; total: number }) {
  const deck = useDeck()
  const open = deck.openPin === pin.id
  const cardId = useId()
  // wide: the note opens toward the nearer margin of the slide, so it lands on the wall beside it; phones: docked
  const side = deck.narrow ? 'dock' : pin.x >= 50 ? 'r' : 'l'
  return (
    <div className="w-cp-pinwrap" style={{ left: `${pin.x}%`, top: `${pin.y}%`, '--k': k } as CSSProperties} data-open={open ? 'true' : undefined} data-side={side}>
      <button
        type="button"
        className="w-cp-pin"
        data-cp-ui
        data-cursor="Open"
        aria-expanded={open}
        aria-controls={open ? cardId : undefined}
        aria-label={COPY.notes.pin(k + 1, total, pin.title)}
        onClick={() => deck.setOpenPin(open ? null : pin.id)}
      >
        <span aria-hidden="true">{k + 1}</span>
      </button>
      {open && <Note id={cardId} pin={pin} siblings={siblings} k={k} total={total} side={side} />}
    </div>
  )
}

const Pins = memo(function Pins({ slide, current }: { slide: Slide; current: boolean }) {
  const deck = useDeck()
  const ref = useRef<HTMLDivElement>(null)
  const live = deck.notes && current
  useInert(ref, !live)
  return (
    <div ref={ref} className="w-cp-pins" data-on={deck.notes ? 'true' : 'false'} aria-hidden={live ? undefined : true}>
      {slide.pins.map((pin, k) => (
        <PinMark key={pin.id} pin={pin} siblings={slide.pins} k={k} total={slide.pins.length} />
      ))}
    </div>
  )
})

// ---- the sound hotspots --------------------------------------------------------------------------------------------------
const Hotspots = memo(function Hotspots({ slide, current }: { slide: Slide; current: boolean }) {
  const deck = useDeck()
  const ref = useRef<HTMLDivElement>(null)
  const live = deck.sound && current
  useInert(ref, !live)
  return (
    <div ref={ref} className="w-cp-hots" data-on={deck.sound ? 'true' : 'false'} aria-hidden={live ? undefined : true}>
      {deck.sound &&
        slide.hotspots.map((spot) => (
          <button
            key={spot.id}
            type="button"
            className="w-cp-hot"
            data-cp-ui
            data-cursor="Play"
            data-corner={spot.corner}
            aria-label={spot.label}
            style={{ left: `${spot.x}%`, top: `${spot.y}%`, width: `${spot.w}%`, height: `${spot.h}%` }}
            onClick={() => deck.hit(slide.n, spot)}
          >
            <span className="w-cp-hot-badge" aria-hidden="true">
              <SpeakerIcon />
            </span>
          </button>
        ))}
    </div>
  )
})

// ---- the slide ------------------------------------------------------------------------------------------------------------
interface SlideViewProps {
  slide: Slide
  /** the slide in the middle of the lane / on show in the presenter */
  current: boolean
  loading?: 'eager' | 'lazy'
  priority?: boolean
  /** the presenter has a laser dot instead of the loupe */
  lens?: boolean
}

export const SlideView = memo(function SlideView({ slide, current, loading = 'lazy', priority, lens = true }: SlideViewProps) {
  const deck = useDeck()
  const frameRef = useRef<HTMLDivElement>(null)
  const pop = deck.pop && deck.pop.slide === slide.n ? deck.pop : null
  return (
    <div ref={frameRef} className="w-cp-frame" data-cursor="none" data-zoom={current && lens && deck.zoom ? 'on' : undefined}>
      <img
        className="w-cp-img"
        src={slide.src}
        alt={slide.alt}
        width={SLIDE_W}
        height={1920}
        loading={loading}
        decoding="async"
        draggable={false}
        {...(priority ? ({ fetchpriority: 'high' } as object) : {})}
      />
      <Hotspots slide={slide} current={current} />
      <Pins slide={slide} current={current} />
      {pop && (
        <span key={pop.key} className="w-cp-pop" style={{ left: `${pop.x}%`, top: `${pop.y}%` }} aria-hidden="true">
          <span className="w-cp-pop-word">{pop.word}</span>
        </span>
      )}
      <Loupe frameRef={frameRef} src={slide.src} active={current && lens} />
    </div>
  )
})
