import { useEffect, useState } from 'react'

export interface ClockState {
  /** 'HH:MM', 24 h, zero padded. Show it in a tabular face (Courier Prime) so the digits do not jitter. */
  time: string
  hour: number
  minute: number
  /** 07:00-18:59 local time: drives the day / night dot */
  isDay: boolean
  timeZone: string
}

const formatters = new Map<string, Intl.DateTimeFormat>()

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatters.get(timeZone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone })
    formatters.set(timeZone, formatter)
  }
  return formatter
}

/** Pure helper (also handy in tests): the wall-clock time in an IANA zone, e.g. 'Europe/Madrid', 'Australia/Sydney'. */
export function readClock(timeZone: string, date: Date = new Date()): ClockState {
  try {
    const parts = formatterFor(timeZone).formatToParts(date)
    const hourText = parts.find((p) => p.type === 'hour')?.value ?? '00'
    const minuteText = parts.find((p) => p.type === 'minute')?.value ?? '00'
    const hour = Number(hourText) % 24
    return {
      time: `${hourText}:${minuteText}`,
      hour,
      minute: Number(minuteText),
      isDay: hour >= 7 && hour < 19,
      timeZone,
    }
  } catch {
    // unknown zone: show a neutral placeholder instead of crashing the footer
    return { time: '--:--', hour: 12, minute: 0, isDay: true, timeZone }
  }
}

const REFRESH_MS = 20_000

/** A live clock for one time zone, refreshed every 20 s (and when the tab becomes visible again). */
export function useClock(timeZone: string): ClockState {
  const [clock, setClock] = useState<ClockState>(() => readClock(timeZone))

  useEffect(() => {
    const tick = () => {
      const next = readClock(timeZone)
      setClock((prev) => (prev.time === next.time && prev.isDay === next.isDay && prev.timeZone === next.timeZone ? prev : next))
    }
    tick()
    const id = window.setInterval(tick, REFRESH_MS)
    const onVisible = () => {
      if (!document.hidden) tick()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [timeZone])

  return clock
}
