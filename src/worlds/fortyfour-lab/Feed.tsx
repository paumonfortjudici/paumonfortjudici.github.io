// The feed: the month banners, the key to the wall, the thirteen hang tags, two small cards (a fact, the size chart) and the end card.
// The narrow layout is one column in reading order. The wide layout is a grid with a left and a right column (and the spine between
// them, where the thread runs); every box is placed by `pack()` from its measured height, on a grid of 8px rows (see pack.ts).
import { useLayoutEffect, useMemo, useRef } from 'react'
import { Scribble } from '../../components/primitives'
import { LAST_DATE, daysBetween, groupByMonth, longDate, type MonthGroup } from './format'
import { PlayIcon } from './icons'
import { pack, type Col, type Slot } from './pack'
import { POSTS } from './posts'
import Sizes from './Sizes'
import PostTag from './Tag'
import Yarns from './Yarns'

/** one line of hand-writing under each month: counts and facts that come straight from the captions */
const MONTH_NOTES: Record<string, string> = {
  '2023-03': 'eight posts, and the first drop on the 14th',
  '2023-04': 'one post',
  '2023-05': 'two reels',
  '2023-06': 'two posts on the 30th: Drop 3',
}

/** a number worth a patch of its own, hung under the first post of its month (it is in that post's caption) */
const MONTH_FACTS: Record<string, { big: string; text: string }> = {
  '2023-04': { big: '30+', text: 'hours of work on this one rug' },
}

/** the size chart hangs under this post, in its column */
const SIZES_AFTER = 9

/** the height of one grid row of the wide feed in px: the same number as `grid-auto-rows` in the CSS */
const UNIT = 8

type MonthItem = { kind: 'month'; group: MonthGroup; mode: 'full' | 'side'; col: Col }
type Item =
  | MonthItem
  | { kind: 'key' }
  | { kind: 'end' }
  | { kind: 'fact'; col: Col; monthKey: string }
  | { kind: 'sizes'; col: Col }
  | { kind: 'post'; group: MonthGroup; index: number; gap: number }

const sideOf = (index: number): Col => (index % 2 === 0 ? 'left' : 'right')

/** everything on the wall in reading order (which is also the order the DOM is in) */
function layout(groups: MonthGroup[]): Item[] {
  const items: Item[] = []
  groups.forEach((group, gi) => {
    if (gi === 0) {
      items.push({ kind: 'month', group, mode: 'full', col: 'left' })
      // the key to the wall sits in the right-hand column beside the first tag
      items.push({ kind: 'key' })
    } else {
      // a banner sits in the column the first post of its month is not in, beside that post
      items.push({ kind: 'month', group, mode: 'side', col: sideOf(group.first) === 'left' ? 'right' : 'left' })
    }
    group.posts.forEach((_, k) => {
      const index = group.first + k
      const gap = k === 0 ? 0 : Math.sqrt(daysBetween(group.posts[k - 1].date, group.posts[k].date))
      items.push({ kind: 'post', group, index, gap })
      if (k === 0 && MONTH_FACTS[group.key]) items.push({ kind: 'fact', col: sideOf(index), monthKey: group.key })
      if (index === SIZES_AFTER) items.push({ kind: 'sizes', col: sideOf(index) })
    })
  })
  items.push({ kind: 'end' })
  return items
}

/** what pack() needs to know about an item */
function slotOf(item: Item): Slot {
  switch (item.kind) {
    case 'month':
      return item.mode === 'full'
        ? { kind: 'month-full', col: 'all' }
        : { kind: 'month-side', col: item.col, firstSide: item.col === 'left' ? 'right' : 'left' }
    case 'key':
      return { kind: 'key', col: 'right' }
    case 'end':
      return { kind: 'end', col: 'right' }
    case 'fact':
      return { kind: 'fact', col: item.col }
    case 'sizes':
      return { kind: 'sizes', col: item.col }
    default:
      return { kind: 'post', col: sideOf(item.index) }
  }
}

/** the whole box: its height plus its margins */
function boxHeight(el: HTMLElement): number {
  const cs = getComputedStyle(el)
  return el.offsetHeight + (parseFloat(cs.marginTop) || 0) + (parseFloat(cs.marginBottom) || 0)
}

function MonthBanner({ item }: { item: MonthItem }) {
  const { group, mode, col } = item
  return (
    <section className="w-fortyfour-lab-month" data-pack="" data-mode={mode} data-col={col} data-month={group.key.slice(5)} aria-labelledby={`ffl-m-${group.key}`}>
      {/* the note hangs under the end of the name that is away from the spine, where the thread and the devil cross the letters */}
      <div className="w-fortyfour-lab-month-head">
        <h3 id={`ffl-m-${group.key}`} className="w-fortyfour-lab-month-name">
          <span aria-hidden="true" data-text={group.month}>
            {group.month}
          </span>
          <span className="pm-sr">{`${group.month} ${group.year}`}</span>
          {group.first === 0 && (
            <span className="w-fortyfour-lab-month-year" aria-hidden="true">
              {group.year}
            </span>
          )}
        </h3>
        <p className="w-fortyfour-lab-month-note">{MONTH_NOTES[group.key]}</p>
      </div>
      {mode === 'full' && <span className="w-fortyfour-lab-anchor w-fortyfour-lab-anchor--month" data-ffl-anchor="month" aria-hidden="true" />}
    </section>
  )
}

/** a stitched patch under a post, with an arrow up to it: one number from that post's caption */
function Fact({ col, monthKey }: { col: Col; monthKey: string }) {
  const fact = MONTH_FACTS[monthKey]
  return (
    <aside className="w-fortyfour-lab-fact" data-pack="" data-col={col}>
      <p className="w-fortyfour-lab-fact-big">{fact.big}</p>
      <p className="w-fortyfour-lab-fact-text">{fact.text}</p>
      <Scribble kind="arrow" dir="up" w="3.6rem" color="var(--ffl-outline)" seed={7} className="w-fortyfour-lab-fact-arrow" />
    </aside>
  )
}

function Key() {
  return (
    <aside className="w-fortyfour-lab-key" data-pack="" aria-label="Key to the wall">
      <p className="w-fortyfour-lab-key-label t-label">Key to the wall</p>
      <ul className="w-fortyfour-lab-key-list">
        <li>
          <span className="w-fortyfour-lab-key-tag" aria-hidden="true" />
          <span>A photo carousel: flip it with its arrows, a swipe or the arrow keys.</span>
        </li>
        <li>
          <span className="w-fortyfour-lab-key-film" aria-hidden="true" />
          <span>A reel, on dark film.</span>
        </li>
        <li>
          <PlayIcon className="w-fortyfour-lab-key-play" />
          <span>Four clips play here, muted, while they are on screen.</span>
        </li>
        <li>
          <span className="w-fortyfour-lab-key-still t-label" aria-hidden="true">
            Still
          </span>
          <span>The video stays on Instagram.</span>
        </li>
      </ul>
    </aside>
  )
}

const numberWords = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen']
const word = (n: number) => numberWords[n] ?? String(n)

/** the last thing on the rug, beside the needle: what the wall holds, and the honest note about the grid going quiet */
function EndCard() {
  const carousels = POSTS.filter((p) => p.type === 'carousel').length
  const reels = POSTS.filter((p) => p.type === 'reel').length
  const clips = POSTS.reduce((sum, p) => sum + p.slides.filter((slide) => slide.kind === 'video').length, 0)
  return (
    <aside className="w-fortyfour-lab-endcard" aria-label="The end of the thread">
      <h3 className="w-fortyfour-lab-endcard-title">The last stitch</h3>
      <p className="w-fortyfour-lab-endcard-note">The last post is from {longDate(LAST_DATE)}. The grid has been quiet since.</p>
      <p className="w-fortyfour-lab-endcard-count">
        {`${word(POSTS.length)[0].toUpperCase()}${word(POSTS.length).slice(1)} posts in all: ${word(carousels)} photo carousels, ${word(reels)} reels, and ${word(clips)} clips you can play here.`}
      </p>
    </aside>
  )
}

/** the end of the thread: the closing card and, under it, the logo's five yarns, beside the last reel */
function EndStack() {
  return (
    <div className="w-fortyfour-lab-endstack" data-pack="">
      <EndCard />
      <Yarns />
    </div>
  )
}

export default function Feed({ wide }: { wide: boolean }) {
  const groups = useMemo(() => groupByMonth(), [])
  const items = useMemo(() => layout(groups), [groups])
  const slots = useMemo(() => items.map(slotOf), [items])
  const ref = useRef<HTMLDivElement>(null)

  // wide layout: measure every box and hang it (rows are set as custom properties, no React state: nothing re-renders)
  useLayoutEffect(() => {
    const feed = ref.current
    if (!feed) return
    const nodes = Array.from(feed.querySelectorAll<HTMLElement>('[data-pack]'))
    const anchor = feed.querySelector<HTMLElement>('[data-ffl-anchor="end"]')
    if (!wide) {
      nodes.forEach((node) => {
        node.style.removeProperty('--row')
        node.style.removeProperty('--span')
      })
      anchor?.style.removeProperty('--row')
      return
    }
    let frame = 0
    let width = -1
    const run = () => {
      width = feed.clientWidth
      const heights = nodes.map(boxHeight)
      const { tops, end } = pack(slots, heights)
      nodes.forEach((node, i) => {
        node.style.setProperty('--row', String(Math.ceil(tops[i] / UNIT) + 1))
        node.style.setProperty('--span', String(Math.max(1, Math.ceil(heights[i] / UNIT))))
      })
      anchor?.style.setProperty('--row', String(Math.ceil(end / UNIT) + 1))
    }
    const later = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(run)
    }
    run()
    // boxes change height when the width changes or a face arrives (the hand font loads after the chunk)
    const observer = new ResizeObserver(() => {
      if (feed.clientWidth !== width) later()
    })
    observer.observe(feed)
    const fonts = document.fonts
    void fonts?.ready.then(later)
    fonts?.addEventListener?.('loadingdone', later)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      fonts?.removeEventListener?.('loadingdone', later)
    }
  }, [wide, slots])

  return (
    <div ref={ref} className="w-fortyfour-lab-feed">
      {items.map((item) => {
        if (item.kind === 'month') return <MonthBanner key={item.group.key} item={item} />
        if (item.kind === 'key') return <Key key="key" />
        if (item.kind === 'end') return <EndStack key="end" />
        if (item.kind === 'fact') return <Fact key={`fact-${item.monthKey}`} col={item.col} monthKey={item.monthKey} />
        if (item.kind === 'sizes') return <Sizes key="sizes" col={item.col} />
        const post = item.group.posts[item.index - item.group.first]
        const side = sideOf(item.index)
        const eyelet = wide ? (side === 'left' ? 'right' : 'left') : 'right'
        return <PostTag key={post.id} post={post} index={item.index} gap={item.gap} side={side} eyelet={eyelet} />
      })}
      <span className="w-fortyfour-lab-anchor w-fortyfour-lab-anchor--end" data-ffl-anchor="end" aria-hidden="true" />
    </div>
  )
}
