// World 6 · Procreate Sketchbook · "Sketchbook"
// A small, battered sketchbook open on a cutting mat: drawings made in Procreate for the love of it, printed and glued in, with a line of
// handwriting under each. Turn the pages with the page curl (drag a corner, swipe, arrow keys, the tabs), jump to a drawing from the
// contents, or open any page big on its own ("Look closer"). The pages are pictures built by art-src/sketchbook; the words are in
// ./procreate/book.json, shared by the pictures and by this file. Notes: docs/api/world-procreate.md.
import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties } from 'react'
import { FlipBook, type FlipBookHandle, type FlipPage, type FlipSpreadInfo } from '@/components/flip'
import { Scribble, Stamp, Tape, TabButton, WorldFacts } from '@/components/primitives'
import { useInView } from '@/lib/hooks/useInView'
import { usePointerFine } from '@/lib/hooks'
import { loadHandFonts } from '@/styles/fonts'
import { useWorld } from './WorldContext'
import { COPY, DRAWINGS, PAGES, PAGE_H, PAGE_W, TOTAL_PAGES, firstFaceOfSpread, pageSrc, spreadOfFace, spreadOfPage } from './procreate/data'
import { EraserArt, PencilArt, RulerArt, SharpenerArt } from './procreate/Props'
import { Viewer } from './procreate/Viewer'
import './procreate/procreate.css'

const pad2 = (n: number): string => String(n).padStart(2, '0')

/** what is open at a spread: the drawings on its pages (0 = closed front, 9 = closed back) */
function drawingsAt(spread: number) {
  if (spread <= 0 || spread >= 9) return []
  return DRAWINGS.filter((d) => spreadOfPage(d.n) === spread)
}

export default function ProcreateWorld() {
  const { work, scrollRef, reduced } = useWorld()
  const pointerFine = usePointerFine()
  const hintId = useId()
  const contentsId = useId()
  const sectionRef = useRef<HTMLElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const bookRef = useRef<FlipBookHandle>(null)
  const touched = useRef(false)
  const hinted = useRef(false)
  const opener = useRef<HTMLElement | null>(null)
  const [spread, setSpread] = useState(0)
  const [opened, setOpened] = useState(false)
  const [viewer, setViewer] = useState<number | null>(null)
  const viewerRef = useRef<number | null>(null)
  viewerRef.current = viewer
  const [host, setHost] = useState<HTMLElement | null>(null)

  const near = useInView(sectionRef, { root: scrollRef, rootMargin: '140% 0px 140% 0px', once: true })
  const visible = useInView(sectionRef, { root: scrollRef, threshold: 0.3 })
  const tableIn = useInView(tableRef, { root: scrollRef, threshold: 0.55, once: true })

  useEffect(() => {
    void loadHandFonts()
  }, [])
  useEffect(() => {
    setHost(scrollRef.current?.parentElement ?? null)
  }, [scrollRef])

  const pages = useMemo<FlipPage[]>(
    () =>
      PAGES.map((p) => ({
        id: p.id,
        src: pageSrc(p.id),
        alt: p.alt,
        width: PAGE_W,
        height: PAGE_H,
        kind: p.kind,
        n: p.n,
      })),
    [],
  )

  const onSpread = useCallback((info: FlipSpreadInfo) => {
    setSpread(info.index)
    if (info.index !== 0) touched.current = true
  }, [])

  // the first time the desk is well on screen the cover opens by itself (a page curl; a dissolve under reduced or paused motion), unless
  // somebody has already turned a page; then the corner of the next page lifts once: an invitation
  useEffect(() => {
    if (!tableIn || opened || touched.current || !near) return
    const id = window.setTimeout(() => {
      // on a phone (one page at a time) the first page is the owner's label: open on the first drawing instead
      if (!touched.current) bookRef.current?.goTo(bookRef.current.mode === 'single' ? 2 : 1)
      setOpened(true)
    }, reduced ? 150 : 700)
    return () => window.clearTimeout(id)
  }, [tableIn, opened, near, reduced])

  useEffect(() => {
    if (!visible || !opened || hinted.current || reduced) return
    hinted.current = true
    const id = window.setTimeout(() => bookRef.current?.hint(), 1800)
    return () => window.clearTimeout(id)
  }, [visible, opened, reduced])

  const goPage = useCallback((id: string) => {
    touched.current = true
    bookRef.current?.goToPage(id)
  }, [])

  const openViewer = useCallback(() => {
    opener.current = document.activeElement as HTMLElement | null
    setViewer(firstFaceOfSpread(spread))
  }, [spread])
  const closeViewer = useCallback(() => {
    const face = viewerRef.current
    if (face !== null) bookRef.current?.goTo(spreadOfFace(face))
    setViewer(null)
    window.setTimeout(() => {
      opener.current?.focus({ preventScroll: true })
      opener.current = null
    }, 0)
  }, [])

  const here = drawingsAt(spread)
  const hint = pointerFine ? COPY.hintMouse : COPY.hintTouch
  const vars = {
    '--flip-ink': 'var(--cream)',
    '--flip-on': 'var(--ink)',
    '--book-paper': '#efe6cf',
    '--book-edge': '#d6c8a2',
    '--book-tint': 'rgb(235 215 170 / 0.1)',
  } as CSSProperties

  return (
    <div className="w-procreate" data-closed={spread === 0 ? 'front' : spread === 9 ? 'back' : undefined}>
      <header className="w-procreate-head">
        <h2 className="w-procreate-title">
          <span className="w-procreate-title-ink">
            {COPY.title}{' '}
            <span className="w-procreate-fun">
              {COPY.titleAccent}
              <Scribble kind="underline" at="under" color="ink" stroke={5.5} seed={7} draw={900} />
            </span>
          </span>
        </h2>
        <div className="w-procreate-lede">
          <Tape at="top" color="marigold" pattern="stripes" rotate={-3} w="5.4rem" h="1.5rem" />
          <p className="w-procreate-lede-text">{COPY.lede}</p>
          <p id={hintId} className="w-procreate-hint">
            {hint}
          </p>
          <span className="w-procreate-stamp" aria-hidden="true">
            <Stamp text={COPY.stamp} tone="oxblood" rotate={-8} size="1.25rem" decorative />
          </span>
        </div>
      </header>

      <section ref={sectionRef} className="w-procreate-board" aria-label={COPY.boardLabel}>
        <div ref={tableRef} className="w-procreate-mat">
          <div className="w-procreate-mat-grid" aria-hidden="true" />
          <div className="w-procreate-props" aria-hidden="true">
            <span className="w-procreate-prop w-procreate-prop--pencil">
              <PencilArt />
            </span>
            <span className="w-procreate-prop w-procreate-prop--eraser">
              <EraserArt />
            </span>
            <span className="w-procreate-prop w-procreate-prop--sharpener">
              <SharpenerArt />
            </span>
            <span className="w-procreate-prop w-procreate-prop--ruler">
              <RulerArt />
            </span>
            <span className="w-procreate-ring" />
            <span className="w-procreate-shavings" />
          </div>


          <div className="w-procreate-book" style={vars} data-closed={spread === 0 ? 'front' : spread === 9 ? 'back' : undefined}>
            {near ? (
              <FlipBook
                ref={bookRef}
                pages={pages}
                totalPages={TOTAL_PAGES}
                aspect={PAGE_W / PAGE_H}
                hardCover
                gloss={0.1}
                keys={visible ? 'window' : 'focus'}
                aria-label={COPY.bookLabel}
                labels={{ label: COPY.bookLabel }}
                onSpreadChange={onSpread}
              />
            ) : (
              <div className="w-procreate-book-ph" />
            )}
          </div>

          <div className="w-procreate-under">
            <aside className="w-procreate-card" aria-hidden="true">
              <Tape at="top" color="bubblegum" pattern="plain" rotate={-3} w="4.8rem" h="1.4rem" />
              {spread === 0 ? (
                <>
                  <p className="w-procreate-card-kicker">Closed</p>
                  <p className="w-procreate-card-line">{COPY.closed}</p>
                </>
              ) : spread === 9 ? (
                <>
                  <p className="w-procreate-card-kicker">The end</p>
                  <p className="w-procreate-card-line">That was the whole book. Turn it back over to start again.</p>
                </>
              ) : here.length === 0 ? (
                <>
                  <p className="w-procreate-card-kicker">Pages {spread * 2}–{spread * 2 + 1}</p>
                  <p className="w-procreate-card-line">{spread === 1 ? 'Whose book this is, and what is in it.' : spread === 8 ? 'Colour tests and the last page.' : ''}</p>
                </>
              ) : (
                <>
                  <p className="w-procreate-card-kicker">
                    Pages {spread * 2}–{spread * 2 + 1}
                  </p>
                  {here.map((d) => (
                    <div key={d.id} className="w-procreate-card-item">
                      <p className="w-procreate-card-title">
                        <span>{pad2(d.no)}</span> {d.title}
                      </p>
                      <p className="w-procreate-card-line">{d.line}</p>
                    </div>
                  ))}
                </>
              )}
            </aside>
            <div className="w-procreate-closer">
              <TabButton size="sm" tone="cream" icon={<span aria-hidden="true">+</span>} iconPosition="before" cursor="Open" onClick={openViewer} aria-label={COPY.closerHelp}>
                {COPY.closer}
              </TabButton>
            </div>
          </div>
        </div>
      </section>

      <section className="w-procreate-contents" aria-labelledby={contentsId}>
        <div className="w-procreate-sheet">
          <Tape at="top" color="marigold" pattern="stripes" rotate={-2} w="7rem" h="1.7rem" />
          <h3 className="w-procreate-sheet-title" id={contentsId}>
            <span className="w-procreate-sheet-title-ink">
              {COPY.contentsTitle}
              <Scribble kind="underline" at="under" color="tomato" stroke={4.2} seed={31} ratio={18} />
            </span>
          </h3>
          <p className="w-procreate-sheet-intro">{COPY.contentsIntro}</p>
          <ol className="w-procreate-list">
            {DRAWINGS.map((d) => (
              <li key={d.id} className="w-procreate-list-item" data-on={spreadOfPage(d.n) === spread ? '' : undefined}>
                <span className="w-procreate-list-n" aria-hidden="true">
                  {pad2(d.no)}
                </span>
                <div className="w-procreate-list-text">
                  <h4 className="w-procreate-list-title">{d.title}</h4>
                  <p className="w-procreate-list-line">{d.line}</p>
                </div>
                <TabButton size="sm" tone="bubblegum" cursor="Flip" selected={spreadOfPage(d.n) === spread} aria-label={`${COPY.goTo} page ${d.n}: ${d.title}`} onClick={() => goPage(d.id)}>
                  p.{d.n}
                </TabButton>
              </li>
            ))}
          </ol>
        </div>
        <div className="w-procreate-facts">
          <WorldFacts work={work} tone="ink">
            {COPY.facts}
          </WorldFacts>
        </div>
      </section>

      {viewer !== null && host && <Viewer face={viewer} container={host} still={reduced} onFace={setViewer} onClose={closeViewer} />}
    </div>
  )
}
