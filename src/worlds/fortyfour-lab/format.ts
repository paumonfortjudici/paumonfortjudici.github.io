// Date helpers for the wall. Dates are the manifest's YYYY-MM-DD strings, parsed by hand and never passed through a time zone:
// 8 March 2023 is 8 March 2023 for a visitor in Barcelona and in Sydney alike.
import { POSTS, type Post } from './posts'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export interface DateParts {
  y: number
  m: number
  d: number
}

export function parts(date: string): DateParts {
  const [y, m, d] = date.split('-').map(Number)
  return { y, m, d }
}

/** '2023-03-08' -> '8 MAR 2023' (the stamp) */
export function stampText(date: string): string {
  const { y, m, d } = parts(date)
  return `${d} ${MONTHS[m - 1].slice(0, 3).toUpperCase()} ${y}`
}

/** '2023-03-08' -> '8 March 2023' (screen readers, captions) */
export function longDate(date: string): string {
  const { y, m, d } = parts(date)
  return `${d} ${MONTHS[m - 1]} ${y}`
}

/** '2023-03-08' -> '8 March' */
export function dayMonth(date: string): string {
  const { m, d } = parts(date)
  return `${d} ${MONTHS[m - 1]}`
}

/** 74.2 -> '01:14' (minutes:seconds, like the timecode on a slate) */
export function timecode(seconds: number): string {
  const s = Math.round(seconds)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

/** whole days between two date strings (calendar arithmetic on the parts, no time zone involved) */
export function daysBetween(a: string, b: string): number {
  const pa = parts(a)
  const pb = parts(b)
  return Math.round((Date.UTC(pb.y, pb.m - 1, pb.d) - Date.UTC(pa.y, pa.m - 1, pa.d)) / 86400000)
}

export interface MonthGroup {
  key: string
  month: string
  year: number
  posts: Post[]
  /** index of the first post of the group in POSTS */
  first: number
}

export function groupByMonth(posts: Post[] = POSTS): MonthGroup[] {
  const groups: MonthGroup[] = []
  posts.forEach((post, i) => {
    const { y, m } = parts(post.date)
    const key = `${y}-${String(m).padStart(2, '0')}`
    let group = groups[groups.length - 1]
    if (!group || group.key !== key) {
      group = { key, month: MONTHS[m - 1], year: y, posts: [], first: i }
      groups.push(group)
    }
    group.posts.push(post)
  })
  return groups
}

/** the first and the last post of the wall, for the intro and the end note */
export const FIRST_DATE = POSTS[0].date
export const LAST_DATE = POSTS[POSTS.length - 1].date

/** the feed hangs its tags in two columns on both sides of the thread from this width up (the hero has its own, wider breakpoint in the CSS) */
export const WIDE_QUERY = '(min-width: 740px)'
