// 04 Works: the cabinet of ten folders (docs/api/sections-works.md).
//   - a cream sheet with the outline word WORKS, the sub, an index card with the keys that work inside a folder
//   - the drawer rail: a brass label holder + divider tabs (All, Editorial, Branding, Web, Illustration, Print) with counts;
//     the window event 'pm:filter' (sheet meta bar, cover quick tabs) applies a filter and brings the rail into view
//   - the folders: a bento on a 12-column grid (3 featured folders twice as large), each filter is its own composition;
//     2 columns on tablet, 1 on phones. Filtering re-flows with framer-motion layout animations (instant when motion is still)
//   - the last card is an empty dashed folder, "Next folder: yours?", that scrolls to #contact

import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties } from 'react'
import { AnimatePresence } from 'framer-motion'
import { FILTER_EVENT, Sheet, StrokeWord, isStill } from '@/components/primitives'
import { WORKS_SECTION, pad2 } from '@/lib/copy'
import { useMediaQuery } from '@/lib/hooks'
import { useMotion } from '@/lib/motion'
import { CATEGORIES, WORKS, byCategory, workBySlug } from '@/lib/works'
import { FilterRail } from './works/FilterRail'
import { KeysCard } from './works/KeysCard'
import { NoteCard } from './works/NoteCard'
import { WorkCard } from './works/WorkCard'
import { YoursCard } from './works/YoursCard'
import { LAYOUTS, NOTE, TABLET_WIDE, YOURS, type FilterId } from './works/data'
import { WORKS_UI } from './works/strings'
import './works.css'

const isFilter = (value: unknown): value is FilterId => value === 'all' || (CATEGORIES as readonly unknown[]).includes(value)

/** "[ and ]" in the sub is drawn as two small keycaps that never break across lines (copy.ts keeps the plain sentence) */
function SubText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[ and \])/).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="pm-wk__hop">
            <kbd className="pm-wk-kbd">[</kbd>
            &nbsp;and&nbsp;
            <kbd className="pm-wk-kbd">]</kbd>
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}

export function Works() {
  const [filter, setFilter] = useState<FilterId>('all')
  const { still } = useMotion()
  const flat = useMediaQuery('(max-width: 767px)')
  // no keyboard: the sub does not tell visitors to press [ and ] (and the index card of keys is not drawn)
  const touch = useMediaQuery('(hover: none), (pointer: coarse)')
  const railRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  // Land the rail (the tabs and the first folders) under the nav, two frames after a filter was applied. requestFilter() also scrolls to
  // #works in the next frame; this one runs a frame later, so it wins and the page makes a single smooth move to the rail.
  const frames = useRef<[number, number]>([0, 0])
  const landRail = useCallback(() => {
    cancelAnimationFrame(frames.current[0])
    cancelAnimationFrame(frames.current[1])
    frames.current[0] = requestAnimationFrame(() => {
      frames.current[1] = requestAnimationFrame(() => railRef.current?.scrollIntoView({ block: 'start', behavior: isStill() ? 'auto' : 'smooth' }))
    })
  }, [])

  // 'pm:filter' (detail = a category): the sheet meta bar and the cover quick tabs ask for a filter. Apply it, then land the rail.
  useEffect(() => {
    const onFilter = (event: Event) => {
      const detail = (event as CustomEvent<unknown>).detail
      if (!isFilter(detail)) return
      setFilter(detail)
      landRail()
    }
    window.addEventListener(FILTER_EVENT, onFilter)
    return () => {
      window.removeEventListener(FILTER_EVENT, onFilter)
      cancelAnimationFrame(frames.current[0])
      cancelAnimationFrame(frames.current[1])
    }
  }, [landRail])

  // the drawer note's tab: every folder back, rail in view
  const showAll = useCallback(() => {
    setFilter('all')
    landRail()
  }, [landRail])

  const shown = useMemo(() => byCategory(filter), [filter])
  const numbers = useMemo(() => shown.map((work) => work.n), [shown])
  const filterLabel = WORKS_SECTION.filters().find((item) => item.id === filter)?.label ?? 'All'

  // tablet: registry order in 2 columns; the empty folder is double width only when it would otherwise sit alone in a row; the drawer
  // note (desktop only) takes no room there
  const items = useMemo(() => {
    let used = 0
    return LAYOUTS[filter].map((cell, index) => {
      const tablet = cell.slug === NOTE ? 0 : cell.slug === YOURS ? (used % 2 === 0 ? 2 : 1) : TABLET_WIDE.has(cell.slug) ? 2 : 1
      used += tablet
      return { cell, index, tablet }
    })
  }, [filter])

  return (
    <Sheet id="works" tone="cream" page="Works" n={4} aria-labelledby="works-title" className="pm-wk">
      <svg className="pm-wk-defs" width="0" height="0" aria-hidden="true" focusable="false">
        <defs>
          {/* a hand-drawn wobble for the pencil outline of the empty folder, and a rougher one for pencil lettering */}
          <filter id="pm-wk-pencil" x="-4%" y="-4%" width="108%" height="108%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.032" numOctaves="2" seed="11" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="3.4" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="pm-wk-graphite" x="-4%" y="-8%" width="108%" height="116%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="1.1" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <header className="pm-wk__head">
        {/* the count sits against the word like a superscript and follows the filter (keyed: it slides in again each time the number changes) */}
        <div className="pm-wk__title">
          <StrokeWord as="h2" id="works-title" text={WORKS_SECTION.strokeWord} size="clamp(4rem, 8.4vw, 10.5rem)" fill="tint" shadow="var(--accent)" className="pm-wk__word" style={{ color: 'var(--on-sheet)' }} />
          <StrokeWord key={shown.length} ghost text={`(${pad2(shown.length)})`} size="clamp(2.6rem, 4.6vw, 5.4rem)" className="pm-wk__ghost" style={{ color: 'var(--accent)' }} />
        </div>
        <p className="pm-wk__sub t-lead">{touch ? WORKS_UI.subTouch : <SubText text={WORKS_SECTION.sub} />}</p>
        <KeysCard />
      </header>

      <FilterRail ref={railRef} filter={filter} onChange={setFilter} numbers={numbers} panelId={panelId} />
      <p className="pm-sr" role="status" aria-live="polite">
        {WORKS_UI.status(shown.length, WORKS.length, filterLabel)}
      </p>

      <div className="pm-wk-stage" role="tabpanel" id={panelId} aria-labelledby={`pm-wk-tab-${filter}`}>
        <ul className="pm-wk-grid" role="list">
          <AnimatePresence mode={still ? 'sync' : 'popLayout'}>
            {items.map(({ cell, index, tablet }) => {
              const special = cell.slug === YOURS || cell.slug === NOTE
              const work = special ? undefined : workBySlug(cell.slug)
              if (!work && !special) return null
              return (
                <li
                  key={`${cell.slug}-${cell.kind}`}
                  className="pm-wk-cell"
                  data-kind={cell.kind}
                  data-slug={cell.slug}
                  data-tw={tablet}
                  style={{ '--gc': `${cell.col} / span ${cell.span}`, '--gr': `${cell.row} / span ${cell.rows}` } as CSSProperties}
                >
                  {work ? (
                    <WorkCard work={work} cell={cell} filter={filter} still={still} flat={flat} index={index} />
                  ) : cell.slug === NOTE ? (
                    <NoteCard cell={cell} shown={shown.length} total={WORKS.length} drawer={filterLabel} onAll={showAll} still={still} />
                  ) : (
                    <YoursCard cell={cell} still={still} flat={flat} />
                  )}
                </li>
              )
            })}
          </AnimatePresence>
        </ul>
      </div>
    </Sheet>
  )
}

export default Works
