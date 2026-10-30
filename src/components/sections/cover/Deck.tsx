// The deck: one coloured folder per project, in Pau's order, standing in two staggered tiers (cascades on narrow screens).
// Each folder is a real <a href="#/work/<slug>"> (middle-click, copy link, Enter) whose body is also the shared element of the
// folder-open transition (layoutId = folderLayoutId(slug, 'cover')). Hover or keyboard focus lifts the folder with a spring and
// pulls the project's cut-out ("peek") up from behind its tab. Geometry lives in cover.css, hand-made offsets in ./slots.
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { motion } from 'framer-motion'
import { ArrowIcon, Folder } from '../../primitives'
import { COVER, pad2 } from '../../../lib/copy'
import { useInView, usePointerFine } from '../../../lib/hooks'
import { folderLayoutId, openWork, workHref } from '../../../lib/router'
import { CATEGORY_LABEL, type WorkMeta } from '../../../lib/works'
import { prefetchWorld } from '../../../worlds/registry'
import { useArmed, useElementWidth, useLate } from './hooks'
import { DECK_SLOTS, fitTab, peekFor, type DeckLayout } from './slots'

/** accessible name of the list (not visible copy) */
const LIST_LABEL = 'Projects: ten folders, one per project'

interface DeckFolderProps {
  work: WorkMeta
  index: number
  layout: DeckLayout
  /** width of the deck in px: the wide layout caps each tab so it ends inside its strip */
  deckWidth: number
  /** wide layout: render the cut-out at all (fetched lazily) */
  peek: boolean
  /** back row of the wide layout: the cut-out already stands up out of the folder at rest */
  rest: boolean
  /** the intro is over: the cascades show their cut-outs (each one when its folder is near the screen) */
  ready: boolean
}

function DeckFolder({ work, index, layout, deckWidth, peek, rest, ready }: DeckFolderProps) {
  const slotRef = useRef<HTMLLIElement>(null)
  // cascades (tablet and phone): every cut-out stands out of its folder at all times (there is no hover on a phone), so it is
  // fetched when its folder is within a screen or so of the viewport, not all at once
  const near = useInView(slotRef, { once: true, rootMargin: '40% 0px 60% 0px' })
  const showPeek = layout === 'wide' ? peek : ready && near
  const slot = DECK_SLOTS[index]
  const nextSlot = DECK_SLOTS.find((s) => s.row === slot.row && s.col === slot.col + 1)
  const tab = layout === 'wide' ? fitTab(slot.tab.wide, deckWidth, slot.col === 4) : slot.tab[layout]
  const [peekFailed, setPeekFailed] = useState(false)
  // the year line of some folders is a phrase ("Early work") that opens with the same word as the kind ("Early illustration work"):
  // read once, not twice
  const firstWord = (s: string) => s.trim().split(/\s+/)[0]?.toLowerCase() ?? ''
  const yearsRepeats = !!work.years && firstWord(work.years) === firstWord(work.kind)
  const label = `Open folder ${pad2(work.n)}: ${work.title}, ${work.kind}${work.years && !yearsRepeats ? `, ${work.years}` : ''}`
  const art = peekFor(work.slug, work.peek)
  const size = art?.size ?? null

  // The 'Open' cursor disc belongs to the tab (it carries the number and the arrow), not to the body: over the title and the
  // blurb the ring alone grows, so the disc never sits on the folder's own words.
  useEffect(() => {
    slotRef.current?.querySelector('.pm-folder__body')?.setAttribute('data-cursor', 'none')
  }, [])

  // what is stuck on the lower edge: every front-row folder on the wide deck, and the last folder of each cascade (its face is
  // shown whole there, and without a cut-out of the next folder over its corner it would be the only empty one)
  const lastOfCascade = (layout === 'duo' && (index === 4 || index === 9)) || (layout === 'solo' && index === 9)
  const stuck = (layout === 'wide' && !rest) || lastOfCascade

  const open = (event: MouseEvent<HTMLAnchorElement>) => {
    // let the browser handle new-tab and download gestures: the href is a real deep link
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    openWork(work.slug, 'cover')
  }

  const vars = {
    '--i': index,
    '--col': slot.col,
    '--row': slot.row,
    '--jx': slot.jx,
    '--jy': slot.jy,
    // where the right-hand neighbour sits relative to this folder (its own hand-made offsets): the hover cut follows its real edge, so no sliver of the folders behind shows between the two
    '--dxn': nextSlot ? nextSlot.jx - slot.jx : 0,
    '--dyn': nextSlot ? nextSlot.jy - slot.jy : 0,
    '--c2': index < 5 ? 0 : 1,
    '--r2': index % 5,
    '--t': tab,
    '--ar': size ? Math.round((size[0] / size[1]) * 1000) / 1000 : 0.75,
    // every cut-out gets about the same AREA (a tall magazine and a wide sticker read as equals): height scales with 1/sqrt(aspect)
    '--pk': size ? Math.round(Math.min(1.12, Math.max(0.8, Math.sqrt(0.78 / (size[0] / size[1])))) * 1000) / 1000 : 1,
    '--tilt': `${slot.tilt}deg`,
  } as CSSProperties

  return (
    <li ref={slotRef} className="cv-slot" style={vars} data-cat={work.categories.join(' ')} data-edge={slot.col === 4 ? '' : undefined} data-rest={rest ? '' : undefined}>
      <div className="cv-lift">
        {showPeek && art && size && !peekFailed ? (
          <img
            className="cv-peek"
            src={art.src}
            width={size[0]}
            height={size[1]}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
            onError={() => setPeekFailed(true)}
          />
        ) : null}
        <Folder
          as={motion.a}
          layoutId={folderLayoutId(work.slug, 'cover')}
          href={workHref(work.slug)}
          className="cv-folder"
          bodyClassName="cv-face"
          color={work.color}
          ink={work.ink}
          tab={
            <>
              {COVER.folderTab(work.n)}
              <ArrowIcon dir="right" size="1.1em" className="cv-folder__arrow" />
            </>
          }
          tabX={tab}
          aria-label={label}
          data-cursor="Open"
          onClick={open}
          onPointerEnter={() => prefetchWorld(work.slug)}
          onFocus={() => prefetchWorld(work.slug)}
        >
          <span className="cv-face__n t-display" aria-hidden="true">
            {pad2(work.n)}
          </span>
          {work.years ? (
            <span className="cv-face__years" aria-hidden="true">
              {work.years}
            </span>
          ) : null}
          <span className="cv-face__title t-display" aria-hidden="true">
            {work.title}
          </span>
          <span className="cv-face__kind" aria-hidden="true">
            {work.kind}
          </span>
          {/* what is stuck on the lower edge of the front row (the back row's lower edge is hidden behind it): a typed paper label with
              the primary category, or, for concept work, the rubber stamp it wears in its own world (ART_DIRECTION 12.1), pressed on
              after the folders land */}
          {stuck ? (
            <span className="cv-face__tag" aria-hidden="true">
              {work.concept ? 'Freelance' : CATEGORY_LABEL[work.categories[0]]}
            </span>
          ) : null}
        </Folder>
      </div>
    </li>
  )
}

interface DeckProps {
  works: readonly WorkMeta[]
  layout: DeckLayout
  /** the intro is over (or there is none): the folders may drop in */
  ready: boolean
}

export function Deck({ works, layout, ready }: DeckProps) {
  const listRef = useRef<HTMLUListElement>(null)
  // the folders drop in as soon as the deck is about to enter the first screen (a little before it is actually on it)
  const inView = useInView(listRef, { once: true, rootMargin: '0px 0px 14% 0px' })
  // ...or, failing that, a little after the intro: a visitor who never scrolls (a screenshot, a crawler) still gets the deck
  const late = useLate(ready, 2800)
  const seen = inView || late
  const fine = usePointerFine()
  const deckWidth = useElementWidth(listRef)
  const [touched, setTouched] = useState(false)
  const wide = layout === 'wide'
  // Back row of the wide layout: the project's cut-out stands up out of its folder from the start (a taste of the work).
  // Front row: the cut-out only comes out on hover / focus, so it needs a pointer that can hover; it is fetched when the
  // browser is idle or at the first touch of the deck.
  const armed = useArmed(ready && wide && fine, touched)

  return (
    <ul
      ref={listRef}
      role="list"
      className="cv-deck"
      data-layout={layout}
      data-in={ready && seen ? '' : undefined}
      aria-label={LIST_LABEL}
      onPointerEnter={() => setTouched(true)}
      onFocusCapture={() => setTouched(true)}
    >
      {works.slice(0, DECK_SLOTS.length).map((work, index) => {
        const rest = wide && DECK_SLOTS[index].row === 0
        return <DeckFolder key={work.slug} work={work} index={index} layout={layout} deckWidth={deckWidth} rest={rest} peek={rest ? ready : wide && fine && armed} ready={ready} />
      })}
    </ul>
  )
}
