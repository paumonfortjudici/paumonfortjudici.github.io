// The cursor-following preview: while a mouse is over a closed band's header, the project's thumbnail (a taped print) trails the pointer on a
// spring and leans into the direction it is dragged. It is purely decorative (aria-hidden, pointer-events: none): the same picture is in
// the open band, and touch screens / reduced motion get a small inline thumbnail in the band header instead (see Band.tsx).
//
// Self-contained: bands mark their header with data-peek="<slug>"; this component listens to the pointer on the window, so it needs no
// props from the bands. It listens only while `enabled`, and only for a mouse. Escape dismisses it until the pointer enters another band
// (WCAG 1.4.13). Thumbnails are mounted the first time their band is hovered and kept (see Thumb.tsx for the colour field behind them).
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, useMotionValue, useSpring, useTransform, useVelocity } from 'framer-motion'
import { CATALOG } from '@/lib/copy'
import { WORKS } from '@/lib/works'
import { Tape } from '../../primitives'
import { Thumb } from './Thumb'

/** size of the card in css px (keep in sync with .pm-cat-peek): used to keep it inside the viewport */
const CARD_W = 160
const CARD_H = 240
/** how far the card keeps clear of the pointer (right of it and above it), so the band under the pointer stays readable */
const GAP = 40
const NAV_CLEAR = 78

const TAPES = ['butter', 'bubblegum', 'lagoon', 'lilac'] as const

interface PreviewProps {
  enabled: boolean
  /** the open band never previews itself (its print is right there): it is hidden the moment its band opens under a still pointer */
  openSlug: string | null
}

export function CatalogPreview({ enabled, openSlug }: PreviewProps) {
  const mx = useMotionValue(-400)
  const my = useMotionValue(-400)
  const sx = useSpring(mx, { stiffness: 320, damping: 30, mass: 0.6 })
  const sy = useSpring(my, { stiffness: 270, damping: 28, mass: 0.7 })
  const tilt = useSpring(useTransform(useVelocity(sx), [-1800, 0, 1800], [-9, 0, 9], { clamp: true }), { stiffness: 170, damping: 15 })
  // the card rides above and to the right of the pointer (clear of it by GAP); near the top of the screen it swings under it (the offset is its own spring,
  // so the swing is a move, not a jump)
  const offY = useMotionValue(-(CARD_H + GAP))
  const offS = useSpring(offY, { stiffness: 240, damping: 26 })
  const x = useTransform(sx, (v) => Math.min(v + GAP, window.innerWidth - CARD_W - 16))
  const y = useTransform([sy, offS], ([v, o]: number[]) => Math.min(Math.max(v + o, NAV_CLEAR), window.innerHeight - CARD_H - 12))

  const [slug, setSlug] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [seen, setSeen] = useState<string[]>([])
  const current = useRef<string | null>(null)

  useEffect(() => {
    if (!enabled) {
      current.current = null
      setSlug(null)
      return
    }
    let lx = -1
    let ly = -1
    let raf = 0
    const pick = (next: string | null): void => {
      if (next === current.current) return
      if (next && !current.current) {
        // arriving: start at the pointer instead of flying in from where the card last was
        sx.jump(lx)
        sy.jump(ly)
      }
      current.current = next
      setDismissed(false)
      setSlug(next)
    }
    const under = (el: Element | null): string | null => el?.closest<HTMLElement>('[data-peek]')?.dataset.peek ?? null
    const onMove = (event: PointerEvent): void => {
      if (event.pointerType !== 'mouse') return
      lx = event.clientX
      ly = event.clientY
      mx.set(lx)
      my.set(ly)
      offY.set(ly - CARD_H - GAP < NAV_CLEAR ? GAP : -(CARD_H + GAP))
      pick(under(event.target instanceof Element ? event.target : null))
    }
    // the page scrolled, or a band opened or closed, under a still pointer: look again at what is under it
    const onScroll = (): void => {
      if (raf || lx < 0) return
      raf = requestAnimationFrame(() => {
        raf = 0
        pick(under(document.elementFromPoint(lx, ly)))
      })
    }
    const onFold = (event: TransitionEvent): void => {
      if (event.propertyName === 'grid-template-rows') onScroll()
    }
    const onLeave = (): void => pick(null)
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && current.current) setDismissed(true)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    window.addEventListener('keydown', onKey)
    window.addEventListener('transitionend', onFold, true)
    document.documentElement.addEventListener('pointerleave', onLeave)
    document.addEventListener('visibilitychange', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('transitionend', onFold, true)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', onLeave)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [enabled, mx, my, sx, sy, offY])

  useEffect(() => {
    if (slug) setSeen((list) => (list.includes(slug) ? list : [...list, slug]))
  }, [slug])

  if (!enabled) return null
  const work = slug ? WORKS.find((w) => w.slug === slug) : undefined
  const show = !!work && !dismissed && slug !== openSlug
  const tape = TAPES[(work?.n ?? 0) % TAPES.length]
  // in a portal: the card is above every sheet (z 30, under the nav), whatever the sheet's own stacking context is
  return createPortal(
    <motion.div
      className="pm-cat-peek"
      aria-hidden="true"
      style={{ x, y, rotate: tilt }}
      initial={false}
      animate={{ opacity: show ? 1 : 0, scale: show ? 1 : 0.84 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
    >
      <Tape at="top" color={tape} pattern="stripes" w="4.6rem" h="1.5rem" rotate={-3} />
      <span className="pm-cat-peek__photo">
        {seen.map((s) => {
          const w = WORKS.find((item) => item.slug === s)
          return w ? <Thumb key={s} work={w} loading="eager" className={s === slug ? 'pm-cat-peek__img is-on' : 'pm-cat-peek__img'} /> : null
        })}
      </span>
      <span className="pm-cat-peek__cap">{work ? CATALOG.bandFooter(work.n, work.years) : ''}</span>
    </motion.div>,
    document.body,
  )
}
