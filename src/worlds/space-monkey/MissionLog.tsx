// The mission log: a typed sheet (punched for a binder, a paper clip on top) that types itself out once, line by line, the
// first time it scrolls into view. The words are written by Pau's brief, not generated at runtime: every character is in LOG.
// No React state in the typing loop (it writes two text nodes per line directly); the full text is always in the DOM for
// screen readers (visually hidden copy), and reduced / paused motion shows the finished sheet at once.
import { useEffect, useId, useRef } from 'react'
import { PaperClip } from '@/components/primitives'
import { useInView } from '@/lib/hooks'
import { useWorld } from '../WorldContext'
import { LOG } from './data'

const MS_PER_CHAR = 11
const PAUSE_CHARS = 12

export function MissionLog() {
  const id = useId()
  const { scrollRef, reduced } = useWorld()
  const sheetRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLOListElement>(null)
  // "on screen" = any part of the sheet in the upper three quarters of the scroller. (A threshold of 0.35 of the sheet's own area can
  // never be reached by a sheet taller than 2.8 screens, which a 320 px phone makes it.)
  const inView = useInView(sheetRef, { root: scrollRef, rootMargin: '0px 0px -25% 0px', threshold: 0 })
  // typing starts the first time the sheet is on screen; if it is scrolled away before it is finished, the rest is written at once
  // (nothing runs off-screen) and it never types again
  const phase = useRef<'idle' | 'typing' | 'done'>('idle')

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const rows = Array.from(list.querySelectorAll<HTMLElement>('[data-typed]'))
    const parts = rows.map((row) => ({
      row,
      typed: row.querySelector<HTMLElement>('[data-part="typed"]'),
      ghost: row.querySelector<HTMLElement>('[data-part="ghost"]'),
      text: row.dataset.text ?? '',
      shown: -1,
    }))
    const total = parts.reduce((sum, p) => sum + p.text.length + PAUSE_CHARS, 0)
    const paint = (count: number) => {
      let left = count
      let active: HTMLElement | null = null
      for (const p of parts) {
        const n = Math.max(0, Math.min(p.text.length, left))
        if (n !== p.shown && p.typed && p.ghost) {
          p.typed.textContent = p.text.slice(0, n)
          p.ghost.textContent = p.text.slice(n)
          p.shown = n
        }
        if (n > 0 && n < p.text.length) active = p.row
        left -= p.text.length + PAUSE_CHARS
      }
      for (const p of parts) {
        if (p.row === active) p.row.setAttribute('data-active', 'true')
        else p.row.removeAttribute('data-active')
      }
    }

    if (reduced || phase.current === 'done') {
      phase.current = 'done'
      paint(total)
      return
    }
    if (!inView) {
      if (phase.current === 'typing') {
        phase.current = 'done'
        paint(total)
      } else {
        paint(0)
      }
      return
    }
    phase.current = 'typing'
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const count = Math.floor((now - t0) / MS_PER_CHAR)
      paint(count)
      if (count < total) raf = requestAnimationFrame(tick)
      else phase.current = 'done'
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, reduced])

  return (
    <section className="w-space-monkey-log" aria-labelledby={`${id}-h`}>
      <div className="w-space-monkey-sheet-shadow">
        <div ref={sheetRef} className="w-space-monkey-sheet">
          <PaperClip className="w-space-monkey-sheet-clip" rotate={-4} size="3.6rem" />
          <h3 id={`${id}-h`} className="w-space-monkey-h3 w-space-monkey-sheet-title">
            Mission log
          </h3>
          <p className="w-space-monkey-sheet-sub">File 05 / Space Monkey / TYLER and SMITH</p>
          <ol ref={listRef} className="w-space-monkey-log-lines">
            {LOG.map((line) => (
              <li key={line.k} data-typed="" data-text={line.v}>
                <span className="w-space-monkey-log-k">{line.k}</span>
                <span className="w-space-monkey-log-v">
                  <span className="pm-sr">{line.v}</span>
                  <span aria-hidden="true">
                    <span data-part="typed" />
                    <span data-part="ghost" className="w-space-monkey-ghost">
                      {line.v}
                    </span>
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
