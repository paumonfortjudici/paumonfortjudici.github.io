// A word whose letters each carry their own width on Anybody's wdth axis (50 tall and narrow ... 150 super wide): the signature of the deck.
import { useLayoutEffect, useMemo, useRef } from 'react'

interface StretchWordProps {
  text: string
  /** one width per character (spaces included); missing entries fall back to 100 */
  widths: readonly number[]
  /** the words are painted on a wall: hide them from assistive tech. Otherwise the text is also read out. */
  decorative?: boolean
  className?: string
  /** added to every width (the live sample in the panel pushes all letters together) */
  offset?: number
  /** 0 = every letter at `base`, 1 = every letter at its own width */
  mix?: number
  base?: number
}

export function StretchWord({ text, widths, decorative, className, offset = 0, mix = 1, base = 100 }: StretchWordProps) {
  const letters = useMemo(() => Array.from(text), [text])
  const spans = letters.map((ch, i) => {
    if (ch === ' ') return ' ' // a real space: lines may break here
    const own = widths[i] ?? 100
    const w = Math.min(150, Math.max(50, base + (own - base) * mix + offset))
    return (
      <span key={i} style={{ fontStretch: `${w}%` }}>
        {ch}
      </span>
    )
  })
  return (
    <span className={className}>
      {!decorative && <span className="pm-sr">{text}</span>}
      <span aria-hidden="true">{spans}</span>
    </span>
  )
}

/**
 * A line that is stretched until its ink touches both margins of its box, like the deck's title lockups. The font size is
 * measured (never guessed) and re-measured on resize and when the faces arrive.
 */
export function FitLine({ text, widths, className }: { text: string; widths: readonly number[]; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    const box = el?.parentElement
    if (!el || !box) return
    const fit = () => {
      el.style.fontSize = '100px'
      const natural = el.getBoundingClientRect().width
      const room = box.clientWidth
      if (natural > 0 && room > 0) el.style.fontSize = `${((100 * room) / natural).toFixed(2)}px`
    }
    fit()
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(fit)
    ro?.observe(box)
    let alive = true
    void document.fonts?.ready.then(() => alive && fit())
    const refit = () => alive && fit()
    document.fonts?.addEventListener?.('loadingdone', refit) // a face that arrives after the first measurement
    return () => {
      alive = false
      ro?.disconnect()
      document.fonts?.removeEventListener?.('loadingdone', refit)
    }
  }, [text])
  return (
    <span className="w-cp-fitbox">
      <span ref={ref} className={`w-cp-fit ${className ?? ''}`}>
        <StretchWord text={text} widths={widths} decorative />
      </span>
    </span>
  )
}

/**
 * A width for every letter of any text, following the deck's own rules: round letters stay at 90 or wider (narrower reads as a
 * zero), L at 60+, I at 50+, at most two very wide letters in a row, and the word starts and ends wide. Seeded, so it never changes.
 */
export function autoWidths(text: string, seed = 1): number[] {
  const cycle = [150, 90, 62, 118, 74, 140, 100, 56, 128, 84]
  const round = new Set(['O', 'C', 'G', 'D', 'Q', 'S', 'B', 'R', 'U'])
  const letters = Array.from(text.toUpperCase())
  let wide = 0
  return letters.map((ch, i) => {
    if (ch === ' ') {
      wide = 0
      return 100
    }
    let w = cycle[(i * 3 + seed) % cycle.length]
    if (round.has(ch)) w = Math.max(w, 96)
    if (ch === 'L') w = Math.max(w, 62)
    if (ch === 'I') w = Math.min(Math.max(w, 50), 80)
    if (w >= 130) {
      wide += 1
      if (wide > 2) w = 100
    } else wide = 0
    const first = i === 0 || letters[i - 1] === ' '
    const final = i === letters.length - 1 || letters[i + 1] === ' '
    if ((first || final) && !'IL'.includes(ch)) w = Math.max(w, 126)
    return w
  })
}
