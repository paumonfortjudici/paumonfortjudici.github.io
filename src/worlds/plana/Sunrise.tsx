// Plate 1, "Sunrise": the hero. The symbol rises over a holm-oak horizon on load while the hours count 0 to 72 on their own (the
// whole promise in about four seconds); from then on a range slider (keyboard: arrows, Home, End, PageUp / PageDown) drives the sun
// and the three title-bar dots, and a caption swaps through the website's own 0 h to 72 h story (the three captions share one grid cell,
// so the plate never changes height while you drag). Three little windows (the manual's "day 1 / 2 / 3", page 3) are buttons that jump to
// a day: they stand in the sky next to the headline on a wide plate and move into the deck on a narrow one (two copies, only one is
// displayed). Reduced or paused motion: no rise, no count, the symbol stands at day 3.
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { Scribble } from '../../components/primitives'
import { PlanaSymbol } from './PlanaSymbol'
import { Plate } from './Plate'
import { DAYS, HOURS, PLATES, dayOf, dotsOf, sunOffset } from './data'
import { useWorld } from '../WorldContext'
import './sunrise.css'

type Phase = 'pre' | 'rise' | 'count' | 'done'

const INTRO_RISE_AT = 140
const INTRO_COUNT_AT = 1050
const INTRO_COUNT_MS = 3000

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

export default function Sunrise() {
  const { reduced } = useWorld()
  const [hour, setHour] = useState(reduced ? HOURS : 0)
  const [phase, setPhase] = useState<Phase>(reduced ? 'done' : 'pre')
  const [pressed, setPressed] = useState(false)
  const [touched, setTouched] = useState(reduced)
  const raf = useRef(0)
  const timers = useRef<number[]>([])
  const sliderId = useId()

  const clearIntro = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
    window.cancelAnimationFrame(raf.current)
  }, [])

  const finish = useCallback(() => {
    clearIntro()
    setPhase('done')
  }, [clearIntro])

  // the intro: rise, then count the hours up by themselves; any touch of the controls (or still motion) ends it at once
  useEffect(() => {
    if (reduced) {
      finish()
      setHour((h) => (h === 0 ? HOURS : h))
      return
    }
    if (phase !== 'pre') return
    timers.current.push(window.setTimeout(() => setPhase('rise'), INTRO_RISE_AT))
    timers.current.push(
      window.setTimeout(() => {
        setPhase('count')
        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / INTRO_COUNT_MS)
          setHour(Math.round(easeInOut(t) * HOURS))
          if (t < 1) raf.current = window.requestAnimationFrame(tick)
          else {
            setPhase('done')
            setPressed(true)
            timers.current.push(window.setTimeout(() => setPressed(false), 210))
          }
        }
        raf.current = window.requestAnimationFrame(tick)
      }, INTRO_COUNT_AT),
    )
    return clearIntro
  }, [reduced]) // eslint-disable-line

  useEffect(() => clearIntro, [clearIntro])

  const take = useCallback(() => {
    setTouched(true)
    if (phase !== 'done') finish()
  }, [phase, finish])

  const set = useCallback(
    (next: number) => {
      take()
      setHour(Math.max(0, Math.min(HOURS, Math.round(next))))
    },
    [take],
  )

  const goDay = (i: number) => {
    set(i === 0 ? 0 : i === 1 ? 24 : HOURS)
    if (i === 2) {
      setPressed(true)
      timers.current.push(window.setTimeout(() => setPressed(false), 210))
    }
  }

  const day = dayOf(hour)
  const step = DAYS[day]
  const dawn = phase === 'pre' || phase === 'rise' // the sun is still below the horizon, the dots are off
  const sun = dawn ? 27 : sunOffset(hour)
  const dots = dawn ? 0 : dotsOf(hour)
  const risen = phase !== 'pre'
  const done = phase === 'done'
  const pct = (hour / HOURS) * 100

  return (
    <Plate
      info={PLATES[0]}
      className="w-plana-sunrise"
      caption="The symbol, rebuilt from its own geometry so every part can move. Arrow keys work on the slider too."
    >
      <div className="w-plana-frame w-plana-p1" data-phase={phase}>
        {/* the story sits over the sky on a wide plate and under the slider on a phone (so the symbol and the slider share the first screen) */}
        <div className="w-plana-sky__text">
          <h4 className="w-plana-p1__headline">
            A sunrise inside the browser<span className="w-plana-dot">.</span>
          </h4>
          <p className="w-plana-p1__lede">
            The three dots in the title bar are the three days, painted in sunrise colours: 72 hours, three sunrises.
          </p>
        </div>

        <div className="w-plana-sky">
          <div className="w-plana-rise" data-risen={risen ? 'true' : 'false'}>
            <PlanaSymbol className="w-plana-p1__symbol" ids sun={sun} dots={dots as 0 | 1 | 2 | 3} pressed={pressed} />
          </div>

          <Sticker72 shown={done} />
        </div>

        <div className="w-plana-deck">
          <div className="w-plana-deck__track">
            <label className="pm-sr" htmlFor={sliderId}>
              Hours since you got in touch, from 0 to 72
            </label>
            <input
              id={sliderId}
              className="w-plana-range"
              type="range"
              min={0}
              max={HOURS}
              step={1}
              value={hour}
              style={{ '--p': `${pct}%` } as CSSProperties}
              aria-valuetext={`${hour} hours. Day ${step.day}: ${step.title}`}
              data-cursor="Drag"
              onPointerDown={take}
              onKeyDown={take}
              onChange={(e) => set(Number(e.target.value))}
            />
            <div className="w-plana-ticks" aria-hidden="true">
              <span style={{ '--f': 0 } as CSSProperties}>0 h</span>
              <span style={{ '--f': 24 / HOURS } as CSSProperties}>24 h</span>
              <span style={{ '--f': 48 / HOURS } as CSSProperties}>48 h</span>
              <span style={{ '--f': 1 } as CSSProperties}>72 h</span>
            </div>
          </div>

          <div className="w-plana-deck__body">
            <p className="w-plana-hours" aria-hidden="true">
              <span className="w-plana-hours__n">{hour}</span>
              <span className="w-plana-hours__u">h</span>
            </p>

            {/* the three captions share one grid cell: the box is as tall as the tallest, so the page below never moves while you drag */}
            <div className="w-plana-step" aria-hidden="true">
              {DAYS.map((d, i) => (
                <div key={d.day} className="w-plana-step__in" data-on={i === day ? 'true' : 'false'}>
                  <p className="w-plana-step__when">
                    Day {d.day} · {d.when}
                  </p>
                  <p className="w-plana-step__title">{d.title}</p>
                  <p className="w-plana-step__text">{d.text}</p>
                </div>
              ))}
            </div>
            <p className="pm-sr" aria-live={done ? 'polite' : 'off'} aria-atomic="true">
              Day {step.day}, {step.when}: {step.title}. {step.text}
            </p>

            <Days className="w-plana-days w-plana-days--deck" day={day} onPick={goDay} />

            <p className="w-plana-note" data-gone={touched || !done ? 'true' : 'false'} aria-hidden="true">
              <Scribble className="w-plana-note__arrow" kind="arrow" dir="up-right" w="3.6rem" color="var(--wheat)" seed="plana-sun" draw={1400} />
              <span className="w-plana-note__t">pull the sun</span>
            </p>
          </div>
        </div>

        {/* last in the DOM so the tab order is the slider first, then the day windows; on a wide plate it is drawn in the sky (grid area of the sky) */}
        <Days className="w-plana-days w-plana-days--sky" day={day} onPick={goDay} />
      </div>
    </Plate>
  )
}

/** The manual's three windows (page 3) as buttons that jump to a day: the sun and the lit dots are the ones the manual measured. */
function Days({ className, day, onPick }: { className: string; day: 0 | 1 | 2; onPick: (i: number) => void }) {
  return (
    <div className={className} role="group" aria-label="Jump to a day">
      {DAYS.map((d, i) => (
        <button
          key={d.day}
          type="button"
          className="w-plana-day"
          aria-pressed={day === i}
          aria-label={`Day ${d.day}, ${d.when}: ${d.title}`}
          onClick={() => onPick(i)}
          data-cursor="Open"
        >
          <PlanaSymbol className="w-plana-day__sym" decorative reversed sun={[16.7, 7.6, 0][i]} dots={(i + 1) as 1 | 2 | 3} />
          <span className="w-plana-day__t">Day {d.day}</span>
        </button>
      ))}
    </div>
  )
}

/** The round "Websites ready in 72 hours" sticker: thick outline and a solid Night shadow, the brand's own finish. */
function Sticker72({ shown }: { shown: boolean }) {
  const ringId = `pd-ring-${useId().replace(/:/g, '')}`
  return (
    <div className="w-plana-sticker" data-in={shown ? 'true' : 'false'}>
      <svg viewBox="0 0 200 200" role="img" aria-label="Sticker: Websites ready in 72 hours" focusable="false">
        <defs>
          <path id={ringId} d="M100 100m-69 0a69 69 0 1 1 138 0a69 69 0 1 1 -138 0" />
        </defs>
        <circle className="w-plana-sticker__shadow" cx="107" cy="108" r="94" />
        <circle className="w-plana-sticker__disc" cx="100" cy="100" r="94" />
        <circle className="w-plana-sticker__line" cx="100" cy="100" r="55" />
        <text className="w-plana-sticker__ring">
          <textPath href={`#${ringId}`} startOffset="0" textLength="424" lengthAdjust="spacing">
            WEBSITES READY IN 72 HOURS ·
          </textPath>
        </text>
        <text className="w-plana-sticker__num" x="100" y="117" textAnchor="middle">
          72 h
        </text>
      </svg>
    </div>
  )
}
