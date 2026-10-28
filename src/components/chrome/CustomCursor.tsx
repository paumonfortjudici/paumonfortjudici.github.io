// The cursor: a small dot and a ring that trails it, both drawn with mix-blend-mode: difference so they read on cream paper,
// on ink and on every folder colour. Over interactive things the ring grows; over anything that says data-cursor="Open" |
// "Flip" | "Drag" | "Play" | "Visit" | "Copy" | "Close" a small solid disc with that word replaces them (ink with a cream rim, or the
// colour given in data-cursor-color with an ink or cream word picked for contrast). It is never the only affordance: the same
// things have visible text, focus rings and keyboard paths.
//
// Only for a fine pointer (mouse, trackpad); nothing is rendered on touch. The native cursor stays over text fields, selects,
// contenteditable and data-cursor="native", and whenever text is selected. Cost: pointermove writes two transforms; the ring's
// rAF loop runs only until it has caught up with the pointer (nothing runs when the mouse is still). Under reduced or paused
// motion the ring is gone and the dot is exact (no trailing). z-index 100: above worlds, intro and toast. Three fixed siblings
// (not one wrapper): a blend mode only blends with what is in the same stacking context.

import { useEffect, useRef } from 'react'
import { usePointerFine } from '../../lib/hooks'
import { useMotion } from '../../lib/motion'
import { contrast, parseHex, resolveHex } from '../primitives/util'
import './chrome.css'

const NATIVE =
  'input:not([type="range"]):not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]), textarea, select, [contenteditable=""], [contenteditable="true"], [data-cursor="native"], [data-cursor="native"] *'
const INTERACTIVE =
  'a[href], button, summary, label[for], [role="button"], [role="tab"], [role="link"], [role="menuitem"], [role="switch"], input[type="range"], input[type="checkbox"], input[type="radio"], input[type="button"], input[type="submit"], [data-cursor]'

const CREAM: [number, number, number] = [0xff, 0xf2, 0xda]
const INK: [number, number, number] = [0x17, 0x10, 0x1b]

interface Context {
  native: boolean
  hot: boolean
  label: string
  color: string
}

function resolveContext(target: EventTarget | null): Context {
  const el = target instanceof Element ? target : null
  if (!el) return { native: false, hot: false, label: '', color: '' }
  if (el.closest(NATIVE)) return { native: true, hot: false, label: '', color: '' }
  const tagged = el.closest('[data-cursor]')
  const raw = tagged?.getAttribute('data-cursor') ?? ''
  const label = raw === 'none' || raw === 'native' ? '' : raw
  const color = el.closest('[data-cursor-color]')?.getAttribute('data-cursor-color') ?? ''
  return { native: false, hot: !!el.closest(INTERACTIVE), label, color }
}

/** the word on a tinted disc: ink or cream, whichever has more contrast with the tint */
function inkFor(color: string): { on: string; rim: string } {
  const hex = resolveHex(color)
  const rgb = hex ? parseHex(hex) : null
  if (!rgb) return { on: 'var(--cream)', rim: 'var(--ink)' }
  return contrast(rgb, INK) >= contrast(rgb, CREAM) ? { on: 'var(--ink)', rim: 'var(--ink)' } : { on: 'var(--cream)', rim: 'var(--cream)' }
}

function CursorLayer({ still }: { still: boolean }) {
  const ringRef = useRef<HTMLDivElement | null>(null)
  const dotRef = useRef<HTMLDivElement | null>(null)
  const tagRef = useRef<HTMLDivElement | null>(null)
  const labelRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const ring = ringRef.current
    const dot = dotRef.current
    const tag = tagRef.current
    const labelEl = labelRef.current
    if (!ring || !dot || !tag || !labelEl) return
    const root = document.documentElement
    const parts = [ring, dot, tag]
    const set = (name: string, value: string | null) =>
      parts.forEach((p) => (value === null ? p.removeAttribute(name) : p.setAttribute(name, value)))

    let x = -200
    let y = -200
    let rx = x
    let ry = y
    let raf = 0
    let awake = false // the pointer has moved at least once
    let inside = true
    let nativeSelection = false
    let ctx: Context = { native: false, hot: false, label: '', color: '' }
    const ease = still ? 1 : 0.24

    const show = () => awake && inside && !nativeSelection && !ctx.native
    const sync = () => {
      const on = show()
      root.classList.toggle('pm-cursor-on', on)
      set('data-visible', on ? 'true' : null)
      set('data-hot', on && ctx.hot ? 'true' : null)
      const labelled = on && !!ctx.label
      set('data-labelled', labelled ? 'true' : null)
      if (labelEl.textContent !== ctx.label) labelEl.textContent = ctx.label
      if (ctx.color) {
        const { on: ink, rim } = inkFor(ctx.color)
        tag.style.setProperty('--cursor-c', ctx.color)
        tag.style.setProperty('--cursor-on', ink)
        tag.style.setProperty('--cursor-rim', rim)
      } else {
        tag.style.removeProperty('--cursor-c')
        tag.style.removeProperty('--cursor-on')
        tag.style.removeProperty('--cursor-rim')
      }
    }

    const place = () => {
      const t = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0)`
      ring.style.transform = t
      tag.style.transform = t
    }
    const loop = () => {
      raf = 0
      rx += (x - rx) * ease
      ry += (y - ry) * ease
      if (Math.abs(x - rx) < 0.15 && Math.abs(y - ry) < 0.15) {
        rx = x
        ry = y
      } else {
        raf = requestAnimationFrame(loop)
      }
      place()
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      x = e.clientX
      y = e.clientY
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`
      if (!awake) {
        awake = true
        rx = x
        ry = y
        place()
        ctx = resolveContext(e.target)
        sync()
      } else if (!inside) {
        inside = true
        rx = x
        ry = y
        place()
        sync()
      }
      if (!raf) raf = requestAnimationFrame(loop)
    }
    const onOver = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      ctx = resolveContext(e.target)
      sync()
    }
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        awake = false // a finger took over: give the native behaviour back
        sync()
        return
      }
      set('data-down', 'true')
    }
    const onUp = () => set('data-down', null)
    const onLeave = () => {
      inside = false
      sync()
    }
    const onSelection = () => {
      const sel = document.getSelection()
      const next = !!sel && !sel.isCollapsed && sel.rangeCount > 0 // (no toString(): a long selection is not copied on every change)
      if (next !== nativeSelection) {
        nativeSelection = next
        sync()
      }
    }
    const onHidden = () => {
      if (document.hidden && raf) {
        cancelAnimationFrame(raf)
        raf = 0
        rx = x
        ry = y
        place()
      }
    }

    document.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })
    document.addEventListener('pointerdown', onDown, { passive: true })
    document.addEventListener('pointerup', onUp, { passive: true })
    document.addEventListener('pointercancel', onUp, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    document.addEventListener('selectionchange', onSelection)
    document.addEventListener('visibilitychange', onHidden)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointercancel', onUp)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('selectionchange', onSelection)
      document.removeEventListener('visibilitychange', onHidden)
      if (raf) cancelAnimationFrame(raf)
      root.classList.remove('pm-cursor-on')
    }
  }, [still])

  return (
    <>
      <div ref={ringRef} className="pm-cursor pm-cursor--ring" aria-hidden="true" data-still={still ? 'true' : undefined}>
        <span className="pm-cursor__ring" />
      </div>
      <div ref={dotRef} className="pm-cursor pm-cursor--dot" aria-hidden="true">
        <span className="pm-cursor__dot" />
      </div>
      <div ref={tagRef} className="pm-cursor pm-cursor--tag" aria-hidden="true">
        <span className="pm-cursor__disc">
          <span ref={labelRef} className="pm-cursor__label" />
        </span>
      </div>
    </>
  )
}

export default function CustomCursor() {
  const fine = usePointerFine()
  const { still } = useMotion()
  if (!fine) return null
  return <CursorLayer still={still} />
}
