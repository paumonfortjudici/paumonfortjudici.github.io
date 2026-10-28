// Barcelona and Sydney, live: two clocks (day / night dot, weekday, part of the day) and a 24-hour dual bar drawn like a strip of
// film leader (perforations, two tracks, one playhead). The hours when both of us are at work are computed with Intl from the
// real zones (see ./overlap.ts), so the sentence under the strip is true today, daylight saving included.
// Nothing runs while the strip is off screen or the tab is hidden; the clocks tick once a minute and are not live regions.

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from 'react'
import { FilmPerforations } from '../../primitives'
import { FOOTER } from '../../../lib/copy'
import { readClock, useInView } from '../../../lib/hooks'
import { DayDot } from './glyphs'
import { HOUR_MS, NO_OVERLAP, WORK_FIRST_HOUR, WORK_LAST_HOUR, aheadSentence, dayPart, hourLabel, pad2, planDay, weekdayIn, type DayPlan, type Slot } from './overlap'

// Barcelona is Europe/Madrid in the IANA database; both zones come from the same place as the footer clocks.
const [HOME, AWAY] = FOOTER.clocks

// Words that are not in COPY.md (added for this strip).
const COPY = {
  heading: 'Time zones',
  homeNote: 'Home, in Cardedeu',
  awayNote: 'Where I worked in 2025–26',
  homeCode: 'BCN',
  awayCode: 'SYD',
  both: 'Both at work',
  now: 'Now',
  best: 'Best overlap:',
  rule: (from: string, to: string) => `A working day is counted as ${from} to ${to} on both sides.`,
} as const

/** the wall clock, refreshed once a minute while `active` (in view, tab visible) */
function useMinute(active: boolean): number {
  const [stamp, setStamp] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    const tick = () => {
      if (document.hidden) return
      setStamp((prev) => {
        const now = Date.now()
        return Math.floor(now / 60_000) === Math.floor(prev / 60_000) ? prev : now
      })
    }
    tick()
    const id = window.setInterval(tick, 15_000)
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [active])
  return stamp
}

interface ClockProps {
  side: 'home' | 'away'
  name: string
  note: string
  zone: string
  stamp: number
}

function Clock({ side, name, note, zone, stamp }: ClockProps) {
  const clock = readClock(zone, new Date(stamp))
  const part = dayPart(clock.hour)
  const short = weekdayIn(zone, stamp)
  const long = weekdayIn(zone, stamp, 'long')
  return (
    <div className="pm-ct-clock" data-side={side} data-day={clock.isDay ? 'day' : 'night'}>
      <p className="pm-sr">{`${name}: ${clock.time}, ${long} ${part}. ${note}.`}</p>
      <p className="pm-ct-clock__name" aria-hidden="true">
        {name}
      </p>
      <p className="pm-ct-clock__time" aria-hidden="true">
        <span className="pm-ct-clock__digits">{clock.time}</span>
        <DayDot day={clock.isDay} className="pm-ct-clock__dot" />
      </p>
      <p className="pm-ct-clock__when" aria-hidden="true">
        {short} · {part}
      </p>
      <p className="pm-ct-clock__note" aria-hidden="true">
        {note}
      </p>
    </div>
  )
}

function slotState(slot: Slot, side: 'home' | 'away'): 'both' | 'work' | 'off' {
  if (slot.both) return 'both'
  return (side === 'home' ? slot.workA : slot.workB) ? 'work' : 'off'
}

function Lane({ plan, side }: { plan: DayPlan; side: 'home' | 'away' }) {
  // the slot the playhead stands in: it is outlined (the needle itself never crosses the digits)
  const nowIndex = Math.min(plan.slots.length - 1, Math.floor(plan.playhead * plan.slots.length))
  const ticks = plan.slots.filter((s) => (side === 'home' ? s.hourA : s.hourB) % 6 === 0)
  return (
    <div className="pm-ct-lane" data-side={side}>
      <div className="pm-ct-lane__cells">
        {plan.slots.map((slot) => {
          const hour = side === 'home' ? slot.hourA : slot.hourB
          return (
            <span key={slot.index} className="pm-ct-cell" data-state={slotState(slot, side)} data-mid={side === 'away' && hour === 0 ? '' : undefined} data-now={slot.index === nowIndex ? '' : undefined}>
              <span className="pm-ct-cell__n">{pad2(hour)}</span>
              {/* the day changes here: name the day that starts (Sydney's midnight) */}
              {side === 'away' && hour === 0 && slot.index > 0 && <span className="pm-ct-cell__day">{weekdayIn(AWAY.timeZone, plan.midnightMs + slot.index * HOUR_MS)}</span>}
            </span>
          )
        })}
      </div>
      {/* narrow screens: the cells are too thin for numbers, so every sixth hour is written under the lane */}
      <div className="pm-ct-lane__axis">
        {ticks.map((slot) => {
          const hour = side === 'home' ? slot.hourA : slot.hourB
          // Sydney's midnight is where the day changes: on a phone this label is the only place that says which day starts
          const newDay = side === 'away' && hour === 0 && slot.index > 0
          return (
            <span key={slot.index} style={{ '--i': slot.index } as CSSProperties} data-newday={newDay ? '' : undefined}>
              {newDay ? `${weekdayIn(AWAY.timeZone, plan.midnightMs + slot.index * HOUR_MS)} ${pad2(hour)}` : pad2(hour)}
            </span>
          )
        })}
      </div>
    </div>
  )
}

/** a frame of film leader (ring, crosshair, a quarter wiped) with the hours between the two clocks counted in the middle */
function LeaderFrame({ text }: { text: string }) {
  return (
    <span className="pm-ct-leader">
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true" focusable="false">
        <path className="pm-ct-leader__wipe" d="M50 50V16A34 34 0 0 1 84 50Z" fill="currentColor" stroke="none" />
        <circle cx="50" cy="50" r="46" strokeWidth="3.2" />
        <circle cx="50" cy="50" r="34" strokeWidth="1.8" />
        <path strokeWidth="1.8" d="M4 50h12M84 50h12M50 4v12M50 84v12" />
      </svg>
      <span className="pm-ct-leader__n">{text}</span>
    </span>
  )
}

export default function TimeZones() {
  const ref = useRef<HTMLElement | null>(null)
  const headingId = useId()
  const inView = useInView(ref, { rootMargin: '200px 0px' })
  const stamp = useMinute(inView)
  const minute = Math.floor(stamp / 60_000)
  const plan = useMemo(() => planDay(minute * 60_000, HOME.timeZone, AWAY.timeZone), [minute])
  const overlap = plan.overlap
  const offsetText = `${plan.offsetHours >= 0 ? '+' : '-'}${Number.isInteger(plan.offsetHours) ? Math.abs(plan.offsetHours) : Math.abs(plan.offsetHours).toFixed(1)}`

  return (
    <section ref={ref} className="pm-ct-zones" aria-labelledby={headingId}>
      <h3 id={headingId} className="pm-sr">
        {COPY.heading}
      </h3>
      <FilmPerforations className="pm-ct-zones__perf" />
      <div className="pm-ct-zones__body">
        <div className="pm-ct-zones__clocks">
          <Clock side="home" name={HOME.label} note={COPY.homeNote} zone={HOME.timeZone} stamp={stamp} />
          <div className="pm-ct-bridge" aria-hidden="true">
            <span className="pm-ct-bridge__line" />
            <LeaderFrame text={offsetText} />
            <span className="pm-ct-bridge__line pm-ct-bridge__line--arrow" />
          </div>
          <Clock side="away" name={AWAY.label} note={COPY.awayNote} zone={AWAY.timeZone} stamp={stamp} />
        </div>

        <div className="pm-ct-track" aria-hidden="true" style={{ '--now': plan.playhead } as CSSProperties}>
          <div className="pm-ct-track__names">
            <span>{COPY.homeCode}</span>
            <span>{COPY.awayCode}</span>
          </div>
          <div className="pm-ct-track__lanes">
            {overlap && (
              <div className="pm-ct-sync" style={{ '--from': overlap.from, '--span': overlap.hours } as CSSProperties}>
                <span className="pm-ct-sync__label">{COPY.both}</span>
              </div>
            )}
            <Lane plan={plan} side="home" />
            <Lane plan={plan} side="away" />
            <div className="pm-ct-playhead">
              <span className="pm-ct-playhead__flag">{COPY.now}</span>
            </div>
          </div>
        </div>

        <div className="pm-ct-zones__foot">
          <div className="pm-ct-zones__sum">
            {overlap ? (
              <p className="pm-ct-zones__best">
                {COPY.best} <strong>{hourLabel(overlap.startB)} to {hourLabel(overlap.endB)}</strong> in {AWAY.label}, <strong>{hourLabel(overlap.startA)} to {hourLabel(overlap.endA)}</strong> in {HOME.label}.
              </p>
            ) : (
              <p className="pm-ct-zones__best">{NO_OVERLAP}</p>
            )}
            {/* the rule behind the highlight, so the sentence can be checked against the bar */}
            <p className="pm-ct-zones__rule">{COPY.rule(hourLabel(WORK_FIRST_HOUR), hourLabel(WORK_LAST_HOUR + 1))}</p>
          </div>
          <p className="pm-ct-zones__ahead">{aheadSentence(plan.offsetHours, AWAY.label)}</p>
        </div>
      </div>
      <FilmPerforations className="pm-ct-zones__perf" />
    </section>
  )
}
