// Presenter mode: the slide fills the screen's height (Fullscreen API when the browser has it, otherwise a fixed overlay).
//   keys    arrows, space, PageUp / PageDown, Home / End, N for the design notes
//   touch   swipe, or tap the left and right edges
//   mouse   a laser dot replaces the cursor
//   leave   the Leave tab, or Escape (the browser's own Escape exits full screen first; in the overlay it is the shell's Escape stack)
import { useEffect, useRef, useState, type MutableRefObject, type RefObject } from 'react'
import { TabButton } from '@/components/primitives'
import { COPY } from './copy'
import { SLIDES } from './data'
import { ArrowLeftIcon, ArrowRightIcon } from './icons'
import { Rays } from './Wall'
import { SlideView } from './SlideView'
import { Trail } from './Floor'
import { useModal } from './useModal'

type FsElement = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void }
type FsDocument = Document & { webkitFullscreenElement?: Element | null; webkitExitFullscreen?: () => Promise<void> | void }

export const fullscreenElement = (): Element | null => document.fullscreenElement ?? (document as FsDocument).webkitFullscreenElement ?? null

/** Asks for full screen on `el` (must be called inside the click that opens the presenter). Resolves to whether it worked. */
export async function enterFullscreen(el: HTMLElement | null): Promise<boolean> {
  if (!el) return false
  try {
    if (el.requestFullscreen) {
      await el.requestFullscreen({ navigationUI: 'hide' })
      return true
    }
    const legacy = (el as FsElement).webkitRequestFullscreen
    if (legacy) {
      await legacy.call(el)
      return true
    }
  } catch {
    /* refused (no gesture, iframe policy, iPhone): the fixed overlay is the fallback */
  }
  return false
}

export function leaveFullscreen(): void {
  if (!fullscreenElement()) return
  try {
    if (document.exitFullscreen) void document.exitFullscreen().catch(() => undefined)
    else (document as FsDocument).webkitExitFullscreen?.()
  } catch {
    /* already out */
  }
}

interface PresenterProps {
  rootRef: RefObject<HTMLDivElement>
  index: number
  goTo: (i: number, options?: { instant?: boolean }) => void
  /** true when the browser left full screen by itself (its own Escape) */
  onClose: (viaBrowser?: boolean) => void
  /** whether the browser agreed to full screen (the overlay then follows `fullscreenchange`) */
  fullscreen: MutableRefObject<boolean>
  toggleNotes: () => void
}

export function Presenter({ rootRef, index, goTo, onClose, fullscreen, toggleNotes }: PresenterProps) {
  const modal = useModal(true, () => onClose(), () => rootRef.current)
  const laserRef = useRef<HTMLDivElement>(null)
  const last = SLIDES.length - 1
  const slide = SLIDES[index]
  const indexRef = useRef(index)
  indexRef.current = index
  const go = useRef(goTo)
  go.current = goTo
  const notes = useRef(toggleNotes)
  notes.current = toggleNotes

  // the stage (and its live region) is inert while presenting: the presenter says which slide is on show itself
  const [said, setSaid] = useState('')
  const firstSlide = useRef(true)
  useEffect(() => {
    if (firstSlide.current) {
      firstSlide.current = false
      return
    }
    setSaid(COPY.lane.announce(SLIDES[index].n, SLIDES[index].title))
  }, [index])

  // the browser leaves full screen by itself on Escape: take the overlay down with it
  useEffect(() => {
    const onChange = () => {
      if (!fullscreenElement() && fullscreen.current) {
        fullscreen.current = false
        onClose(true)
      }
    }
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange', onChange)
    }
  }, [fullscreen, onClose])

  // keys (capture phase, so the world's own arrows and the shell's [ ] hop never see them while presenting)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const target = e.target as HTMLElement | null
      const onControl = !!target?.closest?.('button, a, input, select, textarea')
      const at = indexRef.current
      let handled = true
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
          go.current(Math.min(last, at + 1), { instant: true })
          break
        case ' ':
          if (onControl) return
          go.current(Math.min(last, at + 1), { instant: true })
          break
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          go.current(Math.max(0, at - 1), { instant: true })
          break
        case 'Home':
          go.current(0, { instant: true })
          break
        case 'End':
          go.current(last, { instant: true })
          break
        case 'n':
        case 'N':
          notes.current()
          break
        case '[':
        case ']':
          break // swallowed: no hopping to another project while presenting
        default:
          handled = false
      }
      if (handled) e.preventDefault()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [last])

  // laser dot, idle chrome, swipe
  useEffect(() => {
    const root = rootRef.current
    const laser = laserRef.current
    if (!root || !laser) return
    let idle = 0
    let swipe: { x: number; y: number; t: number } | null = null
    const wake = () => {
      root.removeAttribute('data-idle')
      window.clearTimeout(idle)
      idle = window.setTimeout(() => {
        if (!root.matches(':focus-within') || document.activeElement === root) root.setAttribute('data-idle', 'true')
      }, 2600)
    }
    const onMove = (e: PointerEvent) => {
      wake()
      if (e.pointerType === 'touch') return
      laser.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
      laser.setAttribute('data-on', 'true')
    }
    const onLeave = () => laser.removeAttribute('data-on')
    const onDown = (e: PointerEvent) => {
      wake()
      if (e.pointerType === 'mouse') return
      swipe = { x: e.clientX, y: e.clientY, t: performance.now() }
    }
    const onUp = (e: PointerEvent) => {
      if (!swipe || e.pointerType === 'mouse') return
      const dx = e.clientX - swipe.x
      const dy = e.clientY - swipe.y
      const quick = performance.now() - swipe.t < 700
      swipe = null
      if (quick && Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        const at = indexRef.current
        go.current(dx < 0 ? Math.min(last, at + 1) : Math.max(0, at - 1), { instant: true })
      }
    }
    wake()
    root.addEventListener('pointermove', onMove)
    root.addEventListener('pointerleave', onLeave)
    root.addEventListener('pointerdown', onDown)
    root.addEventListener('pointerup', onUp)
    root.addEventListener('keydown', wake)
    root.addEventListener('focusin', wake)
    return () => {
      window.clearTimeout(idle)
      root.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerleave', onLeave)
      root.removeEventListener('pointerdown', onDown)
      root.removeEventListener('pointerup', onUp)
      root.removeEventListener('keydown', wake)
      root.removeEventListener('focusin', wake)
    }
  }, [rootRef, last])

  return (
    <div
      ref={(node) => {
        ;(rootRef as { current: HTMLDivElement | null }).current = node
        ;(modal.ref as { current: HTMLDivElement | null }).current = node
      }}
      className="w-cp-pres"
      role="dialog"
      aria-modal="true"
      aria-label={COPY.present.label(slide.n)}
      tabIndex={-1}
      data-cursor="native"
      onKeyDown={modal.onKeyDown}
    >
      <Rays className="w-cp-pres-rays" />
      <div className="w-cp-pres-slide" data-field={slide.field}>
        {/* all five stay mounted (decoded) and only the one on show is visible, so turning a slide never flashes an empty frame */}
        {SLIDES.map((s, i) => (
          <div key={s.n} className="w-cp-pres-layer" data-on={i === index ? 'true' : 'false'} aria-hidden={i === index ? undefined : true}>
            <SlideView slide={s} current={i === index} loading="eager" priority={i === index} lens={false} />
          </div>
        ))}
      </div>
      <button type="button" className="w-cp-zone w-cp-zone-prev" tabIndex={-1} aria-label={COPY.present.prev} onClick={() => go.current(Math.max(0, indexRef.current - 1), { instant: true })} />
      <button type="button" className="w-cp-zone w-cp-zone-next" tabIndex={-1} aria-label={COPY.present.next} onClick={() => go.current(Math.min(last, indexRef.current + 1), { instant: true })} />
      <div className="w-cp-pres-top">
        <div className="w-cp-pres-id" aria-hidden="true">
          <p className="w-cp-pres-count t-label">
            {COPY.lane.caption(slide.n)}
            <span className="w-cp-pres-name">
              <span className="w-cp-dot">{' · '}</span>
              {slide.name}
            </span>
          </p>
          <p className="w-cp-pres-concept t-label">{COPY.present.concept}</p>
        </div>
        <TabButton size="sm" color="var(--cp-tomato)" ink="var(--cp-ink)" icon="cross" iconPosition="before" cursor="Close" onClick={() => onClose()}>
          {COPY.present.leave}
        </TabButton>
      </div>
      <div className="w-cp-pres-foot">
        <TabButton
          size="sm"
          color="var(--cp-paper)"
          ink="var(--cp-ink)"
          icon={<ArrowLeftIcon />}
          iconPosition="before"
          aria-label={COPY.present.prev}
          aria-disabled={index <= 0}
          onClick={() => index > 0 && goTo(index - 1, { instant: true })}
        >
          <span className="w-cp-pres-btn-l">{COPY.lane.prev}</span>
        </TabButton>
        <Trail index={index} goTo={(i) => goTo(i, { instant: true })} compact />
        <TabButton
          size="sm"
          color="var(--cp-paper)"
          ink="var(--cp-ink)"
          icon={<ArrowRightIcon />}
          aria-label={COPY.present.next}
          aria-disabled={index >= last}
          onClick={() => index < last && goTo(index + 1, { instant: true })}
        >
          <span className="w-cp-pres-btn-l">{COPY.lane.next}</span>
        </TabButton>
        <p className="w-cp-pres-hint t-label" aria-hidden="true">
          {COPY.present.keys}
          <span className="w-cp-dot">{' · '}</span>
          {COPY.present.notesKey}
        </p>
      </div>
      <div className="pm-sr" role="status" aria-live="polite" aria-atomic="true">
        {said}
      </div>
      <div ref={laserRef} className="w-cp-laser" aria-hidden="true" />
    </div>
  )
}
