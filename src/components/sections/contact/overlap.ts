// Time maths for the Barcelona / Sydney strip. Pure functions, no React: everything comes from Intl with explicit IANA zones
// (Europe/Madrid is Barcelona's zone in the IANA database), so daylight saving is handled by the platform, never by a table.
//
// The strip is one 24-hour day of the FIRST zone (Barcelona), cut into 24 hour slots that start at its local midnight. For
// each slot we ask Intl what time it is in both zones, so the second lane (Sydney) is always the same instants, shifted.
// A slot counts as "at work" when its local hour is between WORK_FIRST_HOUR and WORK_LAST_HOUR (inclusive: the 19:00 slot
// runs until 20:00). The overlap is the longest run of slots where both of us are at work.

export const HOUR_MS = 3_600_000
export const WORK_FIRST_HOUR = 8
export const WORK_LAST_HOUR = 19

interface Parts {
  y: number
  mo: number
  d: number
  h: number
  mi: number
  s: number
}

const formatters = new Map<string, Intl.DateTimeFormat>()

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let f = formatters.get(timeZone)
  if (!f) {
    f = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    })
    formatters.set(timeZone, f)
  }
  return f
}

/** the wall-clock parts of an instant in a zone */
export function partsAt(timeZone: string, ms: number): Parts {
  const list = formatterFor(timeZone).formatToParts(new Date(ms))
  const get = (type: string): number => Number(list.find((p) => p.type === type)?.value ?? 0)
  return { y: get('year'), mo: get('month'), d: get('day'), h: get('hour') % 24, mi: get('minute'), s: get('second') }
}

/** UTC offset of a zone at an instant, in minutes (Sydney in October: +660) */
export function offsetMinutes(timeZone: string, ms: number): number {
  const p = partsAt(timeZone, ms)
  const wallAsUtc = Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s)
  return Math.round((wallAsUtc - Math.floor(ms / 1000) * 1000) / 60_000)
}

export interface Slot {
  /** 0..23, position along the strip */
  index: number
  /** local hour in the first zone (Barcelona) and in the second (Sydney) */
  hourA: number
  hourB: number
  workA: boolean
  workB: boolean
  both: boolean
}

export interface Overlap {
  /** first slot index of the run and how many slots it covers */
  from: number
  hours: number
  /** local start / end hours (end is exclusive, 0..23 after wrapping) in each zone */
  startA: number
  endA: number
  startB: number
  endB: number
}

export interface DayPlan {
  slots: Slot[]
  /** how many hours the second zone is ahead of the first right now (can be fractional, e.g. 9.5) */
  offsetHours: number
  /** the longest shared run, or null when the two working days never meet */
  overlap: Overlap | null
  /** 0..1: where "now" sits along the strip */
  playhead: number
  /** the instant the strip starts: the first zone's local midnight */
  midnightMs: number
}

const isWork = (hour: number): boolean => hour >= WORK_FIRST_HOUR && hour <= WORK_LAST_HOUR

export function planDay(nowMs: number, zoneA: string, zoneB: string): DayPlan {
  const a = partsAt(zoneA, nowMs)
  const msIntoSecond = ((nowMs % 1000) + 1000) % 1000
  // the first zone's local midnight. The wall clock says how long ago it was, but on the two days a year when the clocks change
  // that guess is an hour out: look at the result and nudge it until it really is 00:00 on today's date.
  let midnight = nowMs - (((a.h * 60 + a.mi) * 60 + a.s) * 1000 + msIntoSecond)
  for (let i = 0; i < 3; i++) {
    const p = partsAt(zoneA, midnight)
    const today = p.y === a.y && p.mo === a.mo && p.d === a.d
    if (today && p.h === 0 && p.mi === 0) break
    const wall = ((p.h * 60 + p.mi) * 60 + p.s) * 1000
    midnight += today ? -wall : 24 * HOUR_MS - wall
  }

  const slots: Slot[] = []
  for (let i = 0; i < 24; i++) {
    const t = midnight + i * HOUR_MS
    const pa = partsAt(zoneA, t)
    const pb = partsAt(zoneB, t)
    const workA = isWork(pa.h)
    const workB = isWork(pb.h)
    slots.push({
      index: i,
      hourA: pa.h,
      hourB: pb.h,
      workA,
      workB,
      both: workA && workB,
    })
  }

  // longest run of shared slots (the first one wins a tie)
  let best: { from: number; hours: number } | null = null
  let runFrom = -1
  for (let i = 0; i <= slots.length; i++) {
    const shared = i < slots.length && slots[i].both
    if (shared && runFrom < 0) runFrom = i
    if (!shared && runFrom >= 0) {
      const hours = i - runFrom
      if (!best || hours > best.hours) best = { from: runFrom, hours }
      runFrom = -1
    }
  }
  const overlap: Overlap | null = best
    ? {
        from: best.from,
        hours: best.hours,
        startA: slots[best.from].hourA,
        endA: (slots[best.from + best.hours - 1].hourA + 1) % 24,
        startB: slots[best.from].hourB,
        endB: (slots[best.from + best.hours - 1].hourB + 1) % 24,
      }
    : null

  return {
    slots,
    offsetHours: (offsetMinutes(zoneB, nowMs) - offsetMinutes(zoneA, nowMs)) / 60,
    overlap,
    playhead: Math.min(1, Math.max(0, (nowMs - midnight) / (24 * HOUR_MS))),
    midnightMs: midnight,
  }
}

export const pad2 = (n: number): string => String(n).padStart(2, '0')
export const hourLabel = (hour: number): string => `${pad2(((hour % 24) + 24) % 24)}:00`

/** the line under the strip when the two working days never meet (the normal sentence is built in TimeZones.tsx, with the hours in bold) */
export const NO_OVERLAP = 'Our working days do not meet today, so email is the best way in.'

/** "10 hours ahead" / "9.5 hours ahead" / "in step" */
export function aheadSentence(offsetHours: number, nameB: string): string {
  if (offsetHours === 0) return `${nameB} is on the same clock as Barcelona.`
  const abs = Math.abs(offsetHours)
  const amount = Number.isInteger(abs) ? String(abs) : abs.toFixed(1)
  return `${nameB} is ${amount} ${abs === 1 ? 'hour' : 'hours'} ${offsetHours > 0 ? 'ahead' : 'behind'} today.`
}

export type DayPart = 'morning' | 'afternoon' | 'evening' | 'night'
export function dayPart(hour: number): DayPart {
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 22) return 'evening'
  return 'night'
}

const weekdayFormatters = new Map<string, Intl.DateTimeFormat>()
/** 'Wed' or 'Wednesday' in a zone */
export function weekdayIn(timeZone: string, ms: number, style: 'short' | 'long' = 'short'): string {
  const key = `${timeZone}|${style}`
  let f = weekdayFormatters.get(key)
  if (!f) {
    f = new Intl.DateTimeFormat('en-GB', { timeZone, weekday: style })
    weekdayFormatters.set(key, f)
  }
  return f.format(new Date(ms))
}
