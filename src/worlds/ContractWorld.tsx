// World 01, Proyecto Contract: "Press Proof". A prepress light table: the issue as a page-turning book on a tomato cutting mat,
// press notes on the left, and on the right the proof that my name is in it (a "Find my name" tab, a marked-up masthead and
// six byline slips). A contact sheet of every spread runs under it all. Docs: docs/api/world-contract.md
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FlipBookHandle, FlipPage, FlipSpreadInfo } from '../components/flip'
import { ColorBars, Scribble, TabButton, WorldFacts } from '../components/primitives'
import { asset } from '../lib/asset'
import { useMediaQuery } from '../lib/hooks'
import { loadHandFonts } from '../styles/fonts'
import './contract/contract.css'
import { CREDIT_LINE, FIND, RAIL, READER } from './contract/copy'
import { CREDIT, PAGES, SPREADS, type BylineDef } from './contract/data'
import Directory from './contract/Directory'
import Reader from './contract/Reader'
import Evidence, { FindTab, type Pick } from './contract/Evidence'
import Frames from './contract/Frames'
import { grow, inCrop, pageId } from './contract/helpers'
import { makeLens } from './contract/lens'
import Notes from './contract/Notes'
import { PageMark, type LensSpec, type MarkSpec } from './contract/PageMark'
import Stage from './contract/Stage'
import TypeCard from './contract/TypeCard'
import { whenSettled } from './contract/useSettled'
import { useWorld } from './WorldContext'

/** four corner brackets pointing outward: "full size" */
function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M4.5 9.5V4.5H9.5M14.5 4.5H19.5V9.5M19.5 14.5V19.5H14.5M9.5 19.5H4.5V14.5" />
    </svg>
  )
}

/** the spread the book opens onto: Open Space, pages 42 and 43 */
const OPENING = 5

/** where the middle of the lens lies on each page that carries a mark, in percent of that page: clear of the line it points at */
const LENS_AT: Record<number, [number, number]> = { 4: [47, 54], 72: [58, 57], 111: [60, 74], 186: [50, 80] }

/** the lens for the masthead: a slim bar over the crop of page 4 (credit.webp) with my name filling most of it */
function mastheadLens(): LensSpec {
  const [nx, ny, nw, nh] = inCrop(CREDIT.name, CREDIT.crop)
  return makeLens({
    src: asset(`/works/contract/${CREDIT.file}`),
    w: CREDIT.w,
    h: CREDIT.h,
    view: [nx / 100, ny / 100, nw / 100, nh / 100],
    // the pen loop only reaches about 85 % of its box, so the box is cut generously: the loop ends up just outside "Pau Monfort"
    mark: [(nx - 4.2) / 100, (ny - 1.8) / 100, (nw + 8.6) / 100, (nh + 3.6) / 100],
    fill: 0.66,
    dx: 0.03,
    dy: 0.02,
    width: 58,
    aspect: 4.1,
    at: LENS_AT[CREDIT.page],
    printedPct: CREDIT.name[2],
    // "Pau Monfort," and then the next name starts 22 px (of 992) after the comma: cut in the gap, so no half letter shows
    cutAt: 383 / CREDIT.w,
    bg: 'var(--c-peach)',
  })
}

/** the lens for a byline: a bar that reads the whole credit, from "Textos:" to the full stop, with the name circled in it */
function bylineLens(b: BylineDef): LensSpec {
  const from = b.textos - 2
  const to = b.end * b.w + 12
  // the strip is one line of type: the text sits in the middle band of the crop
  const printedPct = ((to - from) / ((b.end - b.start) * b.w)) * b.line[2]
  return makeLens({
    src: asset(`/works/contract/${b.file}`),
    w: b.w,
    h: b.h,
    view: [from / b.w, 0.15, (to - from) / b.w, 0.7],
    mark: [(b.pau - 34) / b.w, 0.17, (b.end * b.w - b.pau + 52) / b.w, 0.66],
    fill: 0.965,
    width: 68,
    aspect: 4.2,
    at: LENS_AT[b.page],
    printedPct,
  })
}

export default function ContractWorld() {
  const { work, reduced, scrollRef } = useWorld()
  const book = useRef<FlipBookHandle>(null)
  const settle = useRef<() => void>()
  const invite = useRef<() => void>()
  const keys = useRef(0)
  const touched = useRef(false)

  const [info, setInfo] = useState<FlipSpreadInfo | null>(null)
  // phones get the single-page book; everything wider keeps both pages (the book's own 720 px rule would flip it at 1440 px)
  const single = useMediaQuery('(max-width: 759px)')
  const [pick, setPick] = useState<Pick>({ kind: 'masthead' })
  const [mark, setMark] = useState<MarkSpec | null>(null)
  const [round, setRound] = useState(0)
  const [announce, setAnnounce] = useState('')
  const [reading, setReading] = useState(false)

  useEffect(() => {
    void loadHandFonts()
  }, [])

  // The book starts closed, on its cover. A moment after the folder has opened, the cover turns by itself onto the first Open
  // Space spread (the lobby of the cover photograph); a visitor who has already touched anything keeps what they chose.
  // Reduced or paused motion has nothing to watch: the book simply starts on that spread.
  const [start] = useState(() => (reduced ? OPENING : 0))
  useEffect(() => {
    if (reduced) return
    const touch = () => {
      touched.current = true
    }
    window.addEventListener('pointerdown', touch, true)
    window.addEventListener('keydown', touch, true)
    const id = window.setTimeout(() => {
      if (touched.current || book.current?.spread !== 0) return
      book.current.goTo(OPENING)
      // once the cover has landed, the corner of the next page lifts and settles: an invitation to take it
      invite.current = whenSettled(book.current.element, false, () => {
        if (!touched.current) book.current?.hint()
      })
    }, 1400)
    return () => {
      window.clearTimeout(id)
      invite.current?.()
      window.removeEventListener('pointerdown', touch, true)
      window.removeEventListener('keydown', touch, true)
    }
  }, [reduced])

  useEffect(() => () => settle.current?.(), [])

  // The book listens to the arrow keys anywhere in the world (keys="window") and to Home / End. Home and End are also how you
  // scroll a page to its top and bottom, so outside the book they keep doing that: only a focused book or one of its tabs takes them.
  useEffect(() => {
    const keep = (event: KeyboardEvent) => {
      if (event.key !== 'Home' && event.key !== 'End') return
      const root = book.current?.element
      const target = event.target as Node | null
      if (root && target && root.contains(target)) return
      event.stopPropagation()
    }
    window.addEventListener('keydown', keep, true)
    return () => window.removeEventListener('keydown', keep, true)
  }, [])

  const pages = useMemo<FlipPage[]>(
    () =>
      PAGES.map((p) => ({
        id: pageId(p.n),
        src: asset(`/works/contract/${p.file}`),
        alt: `Magazine page ${p.n}. ${p.note}`,
        width: p.w,
        height: p.h,
        kind: p.n === 1 ? 'cover' : p.n === 230 ? 'back' : 'page',
        n: p.n,
        overlay: mark && mark.page === p.n ? <PageMark key={mark.key} mark={mark} /> : undefined,
      })),
    [mark],
  )

  const onSpread = useCallback((next: FlipSpreadInfo) => setInfo(next), [])

  /** keep the book on screen when a pick comes from far down a phone-sized page */
  const showBook = useCallback(() => {
    const scroller = scrollRef.current
    const el = book.current?.element
    if (!scroller || !el) return
    const s = scroller.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    if (r.top >= s.top - 4 && r.bottom <= s.bottom + 4) return
    scroller.scrollTo({ top: Math.max(0, scroller.scrollTop + (r.top - s.top) - 12), behavior: reduced ? 'auto' : 'smooth' })
  }, [reduced, scrollRef])

  /** turn to a page, then mark the line that carries my name once the page has landed */
  const reveal = useCallback(
    (next: Pick, spec: Omit<MarkSpec, 'key'>, message: string) => {
      touched.current = true
      settle.current?.()
      setPick(next)
      setRound((n) => n + 1)
      setMark(null)
      setAnnounce('')
      const visible = !!info?.pages.some((p) => p.n === spec.page)
      if (!visible) book.current?.goToPage(pageId(spec.page))
      showBook()
      settle.current = whenSettled(
        book.current?.element ?? null,
        reduced,
        () => {
          keys.current += 1
          setMark({ ...spec, key: keys.current })
          setAnnounce(message)
        },
        visible,
      )
    },
    [info, reduced, showBook],
  )

  const findMyName = useCallback(() => {
    reveal({ kind: 'masthead' }, { page: CREDIT.page, ring: grow(CREDIT.circle, 0.25, 0.05), seed: 'masthead', lens: mastheadLens() }, FIND.done)
  }, [reveal])

  const pickSlip = useCallback(
    (b: BylineDef) => {
      if (b.inBook) {
        reveal(
          { kind: 'byline', page: b.page },
          { page: b.page, ring: grow(b.name, 0.9, 0.5), seed: `byline-${b.page}`, lens: bylineLens(b) },
          `Marked on page ${b.page}: my byline, Textos: Pau Monfort.`,
        )
        return
      }
      settle.current?.()
      setPick({ kind: 'byline', page: b.page })
      setRound((n) => n + 1)
      setAnnounce(`Page ${b.page} is not in the book. Its credit line, Textos: Pau Monfort, is enlarged beside it.`)
    },
    [reveal],
  )

  const pickFrame = useCallback((spread: number) => {
    touched.current = true
    book.current?.goTo(spread)
  }, [])

  /** a room of the directory: turn to its first page (and bring the book into view on a phone) */
  const pickRoom = useCallback(
    (page: number) => {
      touched.current = true
      book.current?.goToPage(pageId(page))
      showBook()
    },
    [showBook],
  )

  const current = info?.index ?? 0
  const onShow = useMemo(() => (info?.pages ?? []).map((p) => p.n ?? 0), [info])

  return (
    <div className="w-contract">
      <div className="w-contract-wrap">
        <div className="w-contract-table">
          <Notes />
          <Stage
            bookRef={book}
            pages={pages}
            info={info}
            single={single}
            start={start}
            onSpread={onSpread}
            find={<FindTab onFind={findMyName} size="md" />}
            read={
              <TabButton size="sm" tone="ink" icon={<ExpandIcon />} iconPosition="before" cursor="Open" className="w-contract-read" title={READER.tabLabel} onClick={() => setReading(true)}>
                <span className="w-contract-read-text">{READER.tab}</span>
              </TabButton>
            }
          />
          <Evidence onShow={onShow} pick={pick} round={round} onFind={findMyName} onSlip={pickSlip} />
        </div>

        <Frames current={current} still={reduced} onPick={pickFrame} />

        <div className="w-contract-foot">
          <p className="w-contract-credit">{CREDIT_LINE}</p>
          <p className="w-contract-key">
            <Scribble kind="tick" seed="key" color="var(--c-pencil)" w="1.15rem" stroke={4} draw={false} className="w-contract-key-tick" />
            {RAIL.key}
          </p>
          <div className="w-contract-strip" aria-hidden="true">
            <ColorBars compact className="w-contract-bars" />
            <div className="w-contract-ladder" />
          </div>
        </div>

        <WorldFacts work={work} tone="ink" className="w-contract-facts">
          <Directory onShow={onShow} onGo={pickRoom} />
          <TypeCard />
        </WorldFacts>
      </div>
      <p id="w-contract-found" className="pm-sr" role="status" aria-live="polite">
        {announce}
      </p>
      {reading && info && scrollRef.current?.parentElement ? (
        <Reader
          info={info}
          container={scrollRef.current.parentElement}
          behind={scrollRef.current}
          canPrev={current > 0}
          canNext={current < SPREADS.length - 1}
          onPrev={() => book.current?.prev()}
          onNext={() => book.current?.next()}
          onClose={() => setReading(false)}
        />
      ) : null}
    </div>
  )
}
