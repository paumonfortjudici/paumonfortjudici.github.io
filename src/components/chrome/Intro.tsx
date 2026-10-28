// The intro: SMPTE-style colour bars lie on top of an already painted page, hold for a beat (a slate counts a timecode),
// then wipe away bar by bar (clip-path) while the Mast draws the name. Then `pm-intro-done` fires and the Cover drops its
// folders. About 1.1 s of bars; the whole sequence, folders included, stays under 2.2 s.
// Skippable by any key, pointer, tap or wheel; once per session; never played for deep links, reduced motion, paused motion
// (see introState.ts). It never takes focus, never traps it, and removes itself from the DOM when done.

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { finishIntro, INTRO, INTRO_END, introWillPlay, markIntroSeen } from './introState'
import './chrome.css'

const BARS = 7

export default function Intro() {
  const [open, setOpen] = useState(introWillPlay)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const tcRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!introWillPlay || !root) return
    markIntroSeen()
    let done = false
    let raf = 0
    const timers: number[] = []
    const started = performance.now()

    // a burned-in timecode on the slate (24 frames a second), only while the slate is on screen
    const tick = () => {
      const ms = Math.min(performance.now() - started, INTRO_END)
      const frames = Math.floor((ms / 1000) * 24)
      const tc = tcRef.current
      if (tc) tc.textContent = `00:00:0${Math.floor(frames / 24)}:${String(frames % 24).padStart(2, '0')}`
      if (ms < INTRO.hold) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const events = ['keydown', 'pointerdown', 'touchstart', 'wheel'] as const
    const finish = (skipped: boolean) => {
      if (done) return
      done = true
      timers.forEach((t) => window.clearTimeout(t))
      cancelAnimationFrame(raf)
      events.forEach((e) => window.removeEventListener(e, onSkip, true))
      finishIntro()
      if (skipped) root.setAttribute('data-skip', '')
      timers.push(window.setTimeout(() => setOpen(false), skipped ? 170 : 30))
    }
    const onSkip = () => finish(true)
    events.forEach((e) => window.addEventListener(e, onSkip, { capture: true, passive: true }))
    timers.push(window.setTimeout(() => finish(false), INTRO_END))

    return () => {
      done = true
      timers.forEach((t) => window.clearTimeout(t))
      cancelAnimationFrame(raf)
      events.forEach((e) => window.removeEventListener(e, onSkip, true))
    }
  }, [])

  if (!open) return null
  const vars = { '--hold': `${INTRO.hold}ms`, '--stagger': `${INTRO.stagger}ms`, '--wipe': `${INTRO.wipe}ms` } as CSSProperties

  return (
    <div ref={rootRef} className="pm-intro" aria-hidden="true" style={vars}>
      <div className="pm-intro__bars">
        {Array.from({ length: BARS }, (_, i) => (
          <div key={i} className="pm-intro__bar" style={{ '--i': i } as CSSProperties}>
            <i className="pm-intro__top" />
            <i className="pm-intro__mid" />
            <i className="pm-intro__low" />
          </div>
        ))}
      </div>
      <div className="pm-intro__slate">
        <span className="pm-intro__stick" />
        <span className="pm-intro__name">Pau Monfort</span>
        <span className="pm-intro__line">Portfolio 2026</span>
        <span className="pm-intro__tc" ref={tcRef}>
          00:00:00:00
        </span>
      </div>
    </div>
  )
}
