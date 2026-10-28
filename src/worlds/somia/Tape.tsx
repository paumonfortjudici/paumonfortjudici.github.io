// The tailor's tape: the scrub bar of the shop window. A cream ribbon with ticks and numerals, a black pin that follows the
// master progress, and the page's sections as small buttons underneath. The scrubbing itself is a real <input type="range">
// laid over the ribbon (its own thumb is invisible), so mouse, touch, arrow keys, Home / End and screen readers all work.
// The pin and the active section are written straight to the DOM by the engine's per-frame callback (no React per frame).

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent, type PointerEvent } from 'react'
import type { Chapter } from './data'
import type { Tour } from './tour'

interface TapeProps {
  tour: Tour
  chapters: Chapter[]
  /** page pixels the master progress travels (page height - viewport height) of the primary device */
  span: number
  /** reduced motion: jumps are instant */
  still: boolean
}

// no 100: the right end cap covers it
const NUMERALS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]
const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n)

export function Tape({ tour, chapters, span, still }: TapeProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLSpanElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chipRefs = useRef<Array<HTMLButtonElement | null>>([])
  const release = useRef<number | undefined>(undefined)
  const marks = useMemo(() => chapters.map((c) => clamp01(c.at / Math.max(1, span))), [chapters, span])
  const [fits, setFits] = useState<boolean[]>(() => chapters.map(() => true))

  // which section names have room (greedy, left to right) and how far the pin travels
  const track = useRef(0)
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const layout = () => {
      const width = wrap.clientWidth
      const cap = parseFloat(getComputedStyle(wrap).getPropertyValue('--cap')) || 12
      const pin = parseFloat(getComputedStyle(wrap).getPropertyValue('--pin')) || 16
      track.current = Math.max(0, width - 2 * cap - pin)
      let lastRight = -Infinity
      const next = chapters.map((c, i) => {
        const x = cap + pin / 2 + marks[i] * track.current
        const w = c.label.length * 9 + 14
        const left = x - w / 2
        if (left < lastRight + 6) return false
        lastRight = x + w / 2
        return true
      })
      setFits((prev) => (prev.length === next.length && prev.every((v, i) => v === next[i]) ? prev : next))
    }
    layout()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(layout)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [chapters, marks])

  // per-frame: pin, input value, active section
  useEffect(() => {
    let active = -1
    return tour.subscribe((p) => {
      const pin = pinRef.current
      if (pin) pin.style.transform = `translate3d(${(p * track.current).toFixed(2)}px, 0, 0)`
      const input = inputRef.current
      if (input && document.activeElement !== input) {
        const value = String(Math.round(p * 1000))
        if (input.value !== value) input.value = value
      }
      let index = 0
      for (let i = 0; i < marks.length; i++) if (p + 0.004 >= marks[i]) index = i
      if (index !== active) {
        active = index
        chipRefs.current.forEach((chip, i) => {
          if (!chip) return
          if (i === index) chip.setAttribute('aria-current', 'true')
          else chip.removeAttribute('aria-current')
        })
        const label = chapters[index]?.label ?? ''
        input?.setAttribute('aria-valuetext', `${label}, ${Math.round(p * 100)} percent down the page`)
      }
    })
  }, [tour, marks, chapters])

  useEffect(() => () => window.clearTimeout(release.current), [])

  const onInput = (event: ChangeEvent<HTMLInputElement>) => {
    tour.holdScrub(true)
    tour.scrubTo(Number(event.target.value) / 1000)
    window.clearTimeout(release.current)
    release.current = window.setTimeout(() => tour.holdScrub(false), 600)
  }
  const onDown = (event: PointerEvent<HTMLInputElement>) => {
    window.clearTimeout(release.current)
    tour.holdScrub(true)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }
  const onUp = () => {
    window.clearTimeout(release.current)
    release.current = window.setTimeout(() => tour.holdScrub(false), 250)
  }
  // arrows move 2 % of the page, Page keys 10 %; the input is lined up with the real progress first (it is not refreshed while focused)
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const delta: Record<string, number> = { ArrowRight: 0.02, ArrowUp: 0.02, ArrowLeft: -0.02, ArrowDown: -0.02, PageUp: 0.1, PageDown: -0.1 }
    let next: number | null = null
    if (event.key in delta) next = tour.progress + delta[event.key]
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = 1
    if (next === null) return
    event.preventDefault()
    event.stopPropagation()
    const target = clamp01(next)
    event.currentTarget.value = String(Math.round(target * 1000))
    tour.holdScrub(true)
    tour.scrubTo(target)
    window.clearTimeout(release.current)
    release.current = window.setTimeout(() => tour.holdScrub(false), 600)
  }

  return (
    <div ref={wrapRef} className="w-somia-tape">
      <div className="w-somia-tape__ribbon" aria-hidden="true">
        <span className="w-somia-tape__cap w-somia-tape__cap--l" />
        <span className="w-somia-tape__cap w-somia-tape__cap--r" />
        <div className="w-somia-tape__scale">
          {NUMERALS.map((n) => (
            <span key={n} className="w-somia-tape__n" style={{ left: `${n}%` }} data-odd={n % 20 !== 0 ? 'true' : undefined}>
              {n}
            </span>
          ))}
        </div>
      </div>
      <input
        ref={inputRef}
        className="w-somia-tape__input"
        name="somia-position"
        autoComplete="off"
        type="range"
        min={0}
        max={1000}
        step={1}
        defaultValue={0}
        aria-label="Position in the page"
        data-cursor="Drag"
        onInput={onInput}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={onKeyDown}
        onBlur={() => tour.holdScrub(false)}
      />
      <span ref={pinRef} className="w-somia-tape__pin" aria-hidden="true" />
      <ul className="w-somia-tape__chapters" aria-label="Sections of the page">
        {chapters.map((chapter, i) => (
          <li
            key={chapter.id}
            className="w-somia-tape__chapter"
            data-fit={fits[i] ? 'true' : 'false'}
            style={{ ['--m' as string]: marks[i] }}
            data-edge={marks[i] <= 0.001 ? 'start' : marks[i] >= 0.999 ? 'end' : undefined}
          >
            <button
              ref={(el) => {
                chipRefs.current[i] = el
              }}
              type="button"
              onClick={() => tour.tweenTo(marks[i], still ? 0 : 700)}
            >
              {chapter.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
