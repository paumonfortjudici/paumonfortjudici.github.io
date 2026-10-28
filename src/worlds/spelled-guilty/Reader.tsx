// Exhibit B: the case file. The sample pages of the book in the in-house page-turning FlipBook (title page, how to solve, the
// scorecard, then six cases rising in difficulty), a typed index card that says what is open, and tabs that jump to a case.
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { FlipBook, type FlipBookHandle, type FlipPage, type FlipSpreadInfo } from '@/components/flip'
import { TabButton, Tape } from '@/components/primitives'
import { asset } from '@/lib/asset'
import { useInView } from '@/lib/hooks/useInView'
import { SG } from './copy'
import { ART, BASE, COVER, FLIP_PAGES, type ArtItem, type Difficulty } from './data'
import './sg-reader.css'

/** the six case spreads of the sample, in the order of the book */
const CASE_SPREADS = [1, 7, 45, 59, 67, 75]

type SpreadMeta =
  | { kind: 'cover' | 'back' }
  | { kind: 'intro' | 'scorecard' }
  | { kind: 'case'; art: ArtItem }

const artOf = (n: number): ArtItem => ART.find((a) => a.case === n)!

/** spread index -> what is open (0 = closed front cover, 1 = title + how to solve, 2 = scorecard, 3-8 = cases, 9 = back) */
const SPREADS: SpreadMeta[] = [{ kind: 'cover' }, { kind: 'intro' }, { kind: 'scorecard' }, ...CASE_SPREADS.map((n) => ({ kind: 'case' as const, art: artOf(n) })), { kind: 'back' }]

const pad2 = (n: number): string => String(n).padStart(2, '0')

/** the city (or the first words of the setting) for the index tabs */
const placeOf = (setting: string): string => {
  const parts = setting.split(',').map((p) => p.trim())
  const last = parts[parts.length - 1]
  return /^\d{4}$/.test(last) ? parts[parts.length - 2] ?? parts[0] : last
}

/** one evocative word per sample case for its tab (the lighthouse, the film set, the airship, the puppet theatre, the casino, the festival) */
const TAB_PLACE: Record<number, string> = { 1: 'Lighthouse', 7: 'Hollywood', 45: 'Airship', 59: 'Puppets', 67: 'Casino', 75: 'Cannes' }

export function Stars({ level }: { level: Difficulty }) {
  const n = SG.reader.stars[level]
  return (
    <span className="w-sg-stars" role="img" aria-label={`${SG.reader.difficulty[level]}: ${n} of 3`}>
      {[0, 1, 2].map((i) => (
        <svg key={i} viewBox="0 0 24 24" aria-hidden="true" focusable="false" data-on={i < n ? '' : undefined}>
          <path d="M12 2.6l2.9 6.1 6.7.9-4.9 4.6 1.2 6.6L12 17.6 6.1 20.8l1.2-6.6L2.4 9.6l6.7-.9z" />
        </svg>
      ))}
    </span>
  )
}

export interface ReaderHandle {
  /** turn the book to a spread without scrolling (used when the page viewer closes) */
  goToSpread: (spread: number) => void
  /** scroll the table into view and show a spread (default: open the cover onto the first spread) */
  show: (spread?: number) => void
  /** show the spread that holds this case, if it is one of the six */
  showCase: (caseNo: number) => boolean
}

interface ReaderProps {
  scrollRef: RefObject<HTMLElement>
  still: boolean
  /** open the page viewer on the spread that is showing */
  onZoom: (spread: number) => void
  /** the table is well on screen (the world lets the book have the arrow keys then) */
  onVisible?: (visible: boolean) => void
}

const Reader = forwardRef<ReaderHandle, ReaderProps>(function Reader({ scrollRef, still, onZoom, onVisible }, ref) {
  const sectionRef = useRef<HTMLElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const bookRef = useRef<FlipBookHandle>(null)
  const pending = useRef<number | null>(null)
  const hinted = useRef(false)
  const touched = useRef(false)
  const [opened, setOpened] = useState(false)
  const [spread, setSpread] = useState(0)
  const near = useInView(sectionRef, { root: scrollRef, rootMargin: '140% 0px 140% 0px', once: true })
  const visible = useInView(sectionRef, { root: scrollRef, threshold: 0.3 })
  const tableIn = useInView(tableRef, { root: scrollRef, threshold: 0.55, once: true })

  const pages = useMemo<FlipPage[]>(() => {
    const src = (file: string): string => asset(`${BASE}/${file}`)
    return [
      { id: 'cover', src: src(COVER.front.file), alt: SG.poster.frontAlt, width: COVER.front.w, height: COVER.front.h, kind: 'cover' },
      ...FLIP_PAGES.map((p) => ({ id: `p-${String(p.n).padStart(3, '0')}`, src: src(p.file), alt: p.alt, width: p.w, height: p.h, n: p.n })),
      { id: 'back', src: src(COVER.back.file), alt: 'Back cover of Spelled Guilty.', width: COVER.back.w, height: COVER.back.h, kind: 'back' },
    ]
  }, [])

  const goTo = useCallback((target: number) => {
    const book = bookRef.current
    if (book && book.count > 0) book.goTo(target)
    else pending.current = target
  }, [])

  /** the first page a visitor sees: the title spread on a desk, but on a phone (one page at a time) the half-title is a blank sheet, so open on the first case file */
  const goFirst = useCallback(() => {
    const book = bookRef.current
    if (book && book.count > 0 && book.mode === 'single') book.goTo(3)
    else goTo(1)
  }, [goTo])

  const scrollHere = useCallback(() => {
    tableRef.current?.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' })
  }, [still])

  useImperativeHandle(
    ref,
    () => ({
      goToSpread: (target) => goTo(target),
      show: (target = 1) => {
        scrollHere()
        // let the scroll get going, then turn the cover (the page-curl is the "opening")
        window.setTimeout(() => (target === 1 ? goFirst() : goTo(target)), still ? 0 : 450)
      },
      showCase: (caseNo) => {
        const i = CASE_SPREADS.indexOf(caseNo)
        if (i < 0) return false
        scrollHere()
        window.setTimeout(() => goTo(3 + i), still ? 0 : 450)
        return true
      },
    }),
    [goTo, goFirst, scrollHere, still],
  )

  const onSpread = useCallback((info: FlipSpreadInfo) => {
    setSpread(info.index)
    if (info.index !== 0) touched.current = true
    if (pending.current !== null) {
      const target = pending.current
      pending.current = null
      window.setTimeout(() => bookRef.current?.goTo(target), 60)
    }
  }, [])

  // the first time the table is well on screen the cover opens by itself (a page curl; a dissolve under reduced motion),
  // unless somebody has already turned a page; after that the corner of the next page lifts once: an invitation
  useEffect(() => {
    if (!tableIn || opened || touched.current || !near) return
    const id = window.setTimeout(() => {
      if (!touched.current) goFirst()
      setOpened(true)
    }, still ? 150 : 650)
    return () => window.clearTimeout(id)
  }, [tableIn, opened, near, still, goFirst])

  useEffect(() => {
    onVisible?.(visible)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  useEffect(() => {
    if (!visible || !opened || hinted.current || still) return
    hinted.current = true
    const id = window.setTimeout(() => bookRef.current?.hint(), 1700)
    return () => window.clearTimeout(id)
  }, [visible, opened, still])

  const meta = SPREADS[Math.min(spread, SPREADS.length - 1)]
  const vars = {
    '--flip-ink': 'var(--cream)',
    '--flip-on': 'var(--ink)',
    '--book-paper': '#f8f2e2',
    '--book-edge': '#e6dabc',
    '--book-tint': 'rgb(240 225 190 / 0.1)',
  } as CSSProperties

  const tabs: { spread: number; label: string; level?: Difficulty; name: string }[] = [
    { spread: 1, label: 'How to solve', name: SG.reader.intro.title },
    { spread: 2, label: 'Scorecard', name: SG.reader.scorecard.title },
    ...CASE_SPREADS.map((n, i) => {
      const art = artOf(n)
      return { spread: 3 + i, label: `${pad2(n)} ${TAB_PLACE[n] ?? placeOf(art.setting)}`, level: art.difficulty, name: `Case ${pad2(n)}, ${art.title}, ${SG.reader.difficulty[art.difficulty]}` }
    }),
  ]
  const toneOf = (level?: Difficulty) => (level === 'easy' ? 'olive' : level === 'medium' ? 'marigold' : level === 'hard' ? 'tomato' : 'cream')

  return (
    <section ref={sectionRef} className="w-sg-reader w-sg-station" aria-labelledby="sg-reader-title">
      <header className="w-sg-head w-sg-head--split">
        <p className="w-sg-tag w-sg-type">{SG.reader.exhibit}</p>
        <h3 id="sg-reader-title" className="w-sg-h3 w-sg-key">
          {SG.reader.title}
        </h3>
        <p className="w-sg-sub">{SG.reader.sub}</p>
      </header>

      <div ref={tableRef} className="w-sg-table">
        <div className="w-sg-blotter" aria-hidden="true" />

        <aside className="w-sg-card-col" aria-hidden="true">
          <div className="w-sg-index-card" data-kind={meta.kind}>
            <Tape at="top" color="butter" w="5.5rem" h="1.5rem" rotate={-3} />
            <p className="w-sg-type w-sg-index-card__kicker">
              <span>{meta.kind === 'cover' || meta.kind === 'back' ? SG.reader.closed : SG.reader.spread(spread, 8)}</span>
              {meta.kind === 'case' ? <Stars level={meta.art.difficulty} /> : null}
            </p>
            {meta.kind === 'case' ? (
              <>
                <p className="w-sg-type w-sg-index-card__case">
                  Case {pad2(meta.art.case)} · {SG.reader.difficulty[meta.art.difficulty]}
                </p>
                <p className="w-sg-index-card__title">{meta.art.title}</p>
                <p className="w-sg-index-card__line">
                  {meta.art.setting}
                </p>
                <p className="w-sg-index-card__rule w-sg-type">{SG.reader.leftRight}</p>
              </>
            ) : meta.kind === 'intro' ? (
              <>
                <p className="w-sg-index-card__title">{SG.reader.intro.title}</p>
                <p className="w-sg-index-card__line">{SG.reader.intro.line}</p>
              </>
            ) : meta.kind === 'scorecard' ? (
              <>
                <p className="w-sg-index-card__title">{SG.reader.scorecard.title}</p>
                <p className="w-sg-index-card__line">{SG.reader.scorecard.line}</p>
              </>
            ) : (
              <>
                <p className="w-sg-index-card__title">{meta.kind === 'cover' ? SG.reader.covers.front : SG.reader.covers.back}</p>
                <p className="w-sg-index-card__line">{meta.kind === 'cover' ? 'Closed. Turn the cover.' : 'The end of the sample.'}</p>
              </>
            )}
          </div>
        </aside>

        <div className="w-sg-flip" style={vars} data-closed={spread === 0 ? 'front' : spread === SPREADS.length - 1 ? 'back' : undefined}>
          {near ? (
            <FlipBook
              ref={bookRef}
              pages={pages}
              totalPages={214}
              aspect={900 / 1350}
              gloss={0.12}
              keys={visible ? 'window' : 'focus'}
              aria-label={SG.reader.bookLabel}
              labels={{ label: SG.reader.bookLabel, pages: SG.reader.pages }}
              onSpreadChange={onSpread}
            />
          ) : (
            <div className="w-sg-flip__ph" />
          )}
        </div>

        <nav className="w-sg-index" aria-label={SG.reader.indexLabel}>
          <p className="w-sg-type w-sg-index__label" aria-hidden="true">
            {SG.reader.indexTitle}
          </p>
          <ul>
            {tabs.map((t) => (
              <li key={t.spread}>
                <TabButton
                  size="sm"
                  tone={toneOf(t.level)}
                  selected={spread === t.spread}
                  aria-current={spread === t.spread ? 'true' : undefined}
                  aria-label={t.name}
                  cursor="Flip"
                  onClick={() => (t.spread === 1 && bookRef.current?.mode === 'single' ? bookRef.current.goToPage('p-003') : goTo(t.spread))}
                >
                  <span className="w-sg-tabrow">
                    {t.label}
                    {t.level ? <Stars level={t.level} /> : null}
                  </span>
                </TabButton>
              </li>
            ))}
          </ul>
          <TabButton size="sm" tone="ink" icon="arrow-up-right" cursor="Open" onClick={() => onZoom(spread)} className="w-sg-index__zoom">
            {SG.reader.zoom}
          </TabButton>
        </nav>
      </div>
    </section>
  )
})

export default Reader
