// The footer is the last frame of the film: a strip of film (perforations top and bottom) holding the end card. The name
// as giant outline lettering, the end titles in the label font, the two live clocks (Barcelona and Sydney, with a lamp that
// is lit by day), the "Pause motion" tab, "Back to cover" as a tab, and the keyboard hints.
// Clocks: Intl with explicit IANA zones (useClock), tabular figures, not a live region.

import { useEffect, useRef, type CSSProperties, type MouseEvent } from 'react'
import { FOOTER } from '../../lib/copy'
import { useClock } from '../../lib/hooks'
import { ArrowIcon, FilmPerforations, Scribble, StrokeWord, TabButton, useRevealOnce } from '../primitives'
import KeyHints from './KeyHints'
import MotionToggle from './MotionToggle'
import { scrollToTop } from './sectionState'
import { CHROME } from './strings'
import './chrome.css'

function Clock({ label, timeZone }: { label: string; timeZone: string }) {
  const clock = useClock(timeZone)
  return (
    <p className="pm-foot__clock" data-day={clock.isDay ? 'true' : 'false'}>
      <span className="pm-foot__lamp" aria-hidden="true" />
      <span className="pm-foot__city">{label}</span>
      <span className="pm-foot__time" aria-live="off">
        {clock.time}
      </span>
      <span className="pm-sr">{clock.isDay ? ', daytime' : ', night'}</span>
    </p>
  )
}

export function Footer() {
  const creditsRef = useRef<HTMLDListElement | null>(null)
  const markRef = useRef<HTMLDivElement | null>(null)
  useRevealOnce(creditsRef, { threshold: 0.35, rootMargin: '0px 0px -4% 0px' })

  // the name is set letter by letter, every letter whole (a half-drawn outline reads as broken type). It starts while the footer is still about
  // a screen and a half below the window, so by the time the end card arrives the word is usually complete.
  useEffect(() => {
    const host = markRef.current
    if (!host) return
    if (typeof IntersectionObserver === 'undefined') {
      host.setAttribute('data-in', 'true')
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        host.setAttribute('data-in', 'true')
        io.disconnect()
      },
      { rootMargin: '0px 0px 160% 0px' },
    )
    io.observe(host)
    return () => io.disconnect()
  }, [])

  const backToCover = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault()
    scrollToTop()
  }

  return (
    <footer className="pm-foot">
      <div className="pm-foot__film">
        <FilmPerforations tone="cream" hole="0.95rem" className="pm-foot__perf" />
        <div className="pm-foot__frame">
          <div className="pm-foot__top">
            <p className="pm-foot__rights">{FOOTER.rights}</p>
            <div className="pm-foot__clocks">
              {FOOTER.clocks.map((c) => (
                <Clock key={c.timeZone} label={c.label} timeZone={c.timeZone} />
              ))}
            </div>
          </div>

          <div className="pm-foot__mark" aria-hidden="true" ref={markRef}>
            <StrokeWord
              as="div"
              text="PAU MONFORT"
              size="16rem"
              stack="mobile"
              stackSize="min(21.5vw, 7.2rem)"
              draw={false}
              fill="tint"
              shadow="var(--tomato)"
              strokeScale={1.2}
              tracking={0.03}
              style={{ color: 'var(--cream)' }}
            />
          </div>

          {/* the end titles: three columns across the frame, role above name (they roll up into place once, when the footer arrives) */}
          <dl className="pm-foot__credits" ref={creditsRef}>
            {CHROME.credits.map((c, i) => (
              <div className="pm-foot__crow" key={c.role} style={{ '--r': i } as CSSProperties}>
                <dt>{c.role}</dt>
                <dd>{c.name}</dd>
              </div>
            ))}
          </dl>

          <div className="pm-foot__bottom">
            {/* the last thing written on the last frame sits right above the key hints, on the same side: one block, no empty corner */}
            <div className="pm-foot__left">
              <p className="pm-foot__wrap">
                <span className="pm-foot__wrap-text">
                  {CHROME.wrap}
                  <Scribble kind="underline" at="under" color="var(--marigold)" seed={11} />
                </span>
              </p>
              <KeyHints className="pm-foot__keys" />
            </div>
            <div className="pm-foot__ctrl">
              <MotionToggle variant="foot" />
              <TabButton href="#cover" onClick={backToCover} tone="marigold" size="md" icon={<ArrowIcon dir="up" />}>
                {FOOTER.back}
              </TabButton>
            </div>
          </div>
        </div>
        <FilmPerforations tone="cream" hole="0.95rem" className="pm-foot__perf" />
      </div>
    </footer>
  )
}

export default Footer
