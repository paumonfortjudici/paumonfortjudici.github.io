// World 8: GOTET, "Brand Board Explorer". A concept brand (an invented vermuteria in Cardedeu), shown as the finished brand board hung on
// the wall of the bar: one big pan / zoom canvas next to a docked info panel (a menu card). Chips fly the camera, the four mascots are
// alive, a nine-stop tour walks you through, and an Index view lists everything as a normal page (the default on phones).
// The interior is Gotet's own brand (six colours, Fraunces + Barlow Semi Condensed); the shell around it stays olive.
// Honesty: the brief, the art direction and the rules in the guide are Pau's; the artwork was made with AI-assisted tools under them.
import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import './concept-brand/wall.css'
import './concept-brand/ui.css'
import './concept-brand/panel.css'
import './concept-brand/index.css'
import { Stamp, TabButton } from '../components/primitives'
import { useMediaQuery } from '../lib/hooks'
import Chips from './concept-brand/Chips'
import IndexView from './concept-brand/IndexView'
import Kit from './concept-brand/Kit'
import Panel from './concept-brand/Panel'
import Tour from './concept-brand/Tour'
import { MASCOT_COPY, TOUR, UI_TEXT } from './concept-brand/copy'
import { GROUP_LABEL, HOT, IMG, NONE, TOUR_GROUPS, isMascotId, type ColourwayId, type GroupId, type Selection } from './concept-brand/data'
import { useWorld, useWorldEscape } from './WorldContext'

const Wall = lazy(() => import('./concept-brand/Wall'))

type View = 'board' | 'index'

/** the height of the folded sheet (handle + CONCEPT strip), read from the stylesheet so CSS and the camera agree */
const foldPx = (el: HTMLElement): number => parseFloat(getComputedStyle(el).getPropertyValue('--cb-fold')) || 118

const announce = (sel: Selection): string => {
  if (sel.item) return isMascotId(sel.item) ? MASCOT_COPY[sel.item].name : (HOT[sel.item]?.title ?? '')
  return sel.group ? GROUP_LABEL[sel.group] : 'The whole board'
}

function Hanging() {
  return (
    <div className="w-concept-brand-stage" role="status">
      <div className="w-concept-brand-wallbg" aria-hidden="true" />
      <p className="w-concept-brand-hanging">Hanging the board</p>
    </div>
  )
}

export default function ConceptBrandWorld() {
  const { work, reduced: still } = useWorld()
  const phone = useMediaQuery('(max-width: 699px)')
  const sheet = useMediaQuery('(max-width: 899px)')
  // wide and tall enough: the nine chips stand in a column on the left edge of the wall (more height for the board, and the left margin is used)
  const rail = useMediaQuery('(min-width: 1100px) and (min-height: 700px)')

  const [view, setView] = useState<View>(() => (typeof window !== 'undefined' && window.matchMedia?.('(max-width: 699px)').matches ? 'index' : 'board'))
  const chosen = useRef(false)
  useEffect(() => {
    if (!chosen.current) setView(phone ? 'index' : 'board')
  }, [phone])
  const switchView = (next: View) => {
    chosen.current = true
    if (next === 'board') setSheetOpen(false) // arriving on the board: the sheet is folded down, the board has the screen
    setView(next)
  }

  const [sel, setSel] = useState<Selection>(NONE)
  const [colourway, setColourway] = useState<ColourwayId>('faint')
  const [tour, setTour] = useState<number | null>(null)
  const [kit, setKit] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [atFit, setAtFit] = useState(true)

  const select = useCallback(
    (next: Selection) => {
      setSel(next)
      if (next.group) setSheetOpen(true)
    },
    [setSel],
  )

  const onChip = (group: GroupId) => {
    if (sel.group === group && !sel.item) select(NONE)
    else select({ group, item: null })
  }

  // ---- the kit drawer ---------------------------------------------------------------------------------------------------------------
  const opener = useRef<HTMLElement | null>(null)
  const openKit = () => {
    opener.current = document.activeElement as HTMLElement | null
    setKit(true)
  }
  const closeKit = useCallback(() => {
    setKit(false)
    window.setTimeout(() => opener.current?.focus({ preventScroll: true }), 0)
  }, [])

  // ---- the tour ---------------------------------------------------------------------------------------------------------------------
  const stop = useCallback(
    (i: number) => {
      const at = Math.max(0, Math.min(TOUR.length - 1, i))
      setTour(at)
      const group = TOUR_GROUPS[at]
      select(group ? { group, item: null } : NONE)
      setSheetOpen(false) // the sheet stays folded while the docket is up: the camera frames each stop above it
    },
    [select],
  )
  const startTour = () => {
    setKit(false)
    chosen.current = true
    setView('board')
    stop(0)
  }
  const endTour = useCallback(() => setTour(null), [])
  useWorldEscape(kit || tour !== null, () => (kit ? closeKit() : endTour()))

  const onRootKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (tour === null || e.ctrlKey || e.metaKey || e.altKey) return
    const t = e.target as HTMLElement
    if (t.closest('input, select, textarea, [role="slider"]')) return
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      if (tour < TOUR.length - 1) stop(tour + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      if (tour > 0) stop(tour - 1)
    }
  }

  // ---- how much of the canvas the overlay UI takes -------------------------------------------------------------------------------------
  const mainRef = useRef<HTMLDivElement>(null)
  const chipsRef = useRef<HTMLDivElement>(null)
  const tourRef = useRef<HTMLElement>(null)
  const touring = tour !== null
  // on desktop the docket moves into the panel column during the tour (the details step aside), so the board keeps the whole canvas
  const dockTour = touring && !sheet
  const [reserve, setReserve] = useState({ top: 70, bottom: 14, left: 14, right: 14 })
  useLayoutEffect(() => {
    const main = mainRef.current
    const chips = chipsRef.current
    if (!main || !chips || view !== 'board') return
    const read = () => {
      const m = main.getBoundingClientRect()
      const c = chips.getBoundingClientRect()
      // a row of chips takes the top of the canvas, a column takes its left edge
      const top = rail ? 14 : Math.round(c.bottom - m.top + 12)
      const left = rail ? Math.round(c.right - m.left + 14) : 14
      // the three tabs stand on the bottom edge of the wall (60 px): the board stops above them
      let bottom = sheet ? (sheetOpen ? Math.round(m.height * 0.56) + 10 : foldPx(main) + 8) : dockTour ? 16 : 62
      const slip = tourRef.current
      if (slip) bottom = Math.max(bottom, (sheet ? foldPx(main) + 12 : 16) + slip.offsetHeight + 14)
      // in the rail layout the zoom controls stand in a column on the right edge of the wall: keep the board clear of it
      const right = rail ? 84 : 14
      setReserve((r) => (r.top === top && r.bottom === bottom && r.left === left && r.right === right ? r : { top, bottom, left, right }))
    }
    read()
    const ro = new ResizeObserver(read)
    ro.observe(main)
    ro.observe(chips)
    if (tourRef.current) ro.observe(tourRef.current)
    return () => ro.disconnect()
  }, [view, sheet, sheetOpen, touring, tour, rail, dockTour])

  // the index scrolls inside the world (the shell's own scroller stays still), so give it the arrow keys on arrival
  const indexRef = useRef<HTMLDivElement>(null)
  const firstView = useRef(true)
  useEffect(() => {
    // the tab that switched the view is gone: put focus on the new view (not on the first render: the shell has just focused its own scroller)
    if (firstView.current) {
      firstView.current = false
      return
    }
    if (view === 'index') indexRef.current?.focus({ preventScroll: true })
    else mainRef.current?.focus({ preventScroll: true })
  }, [view])

  // the board has 28 tab stops: this takes keyboard visitors straight to the details panel (and unfolds the sheet on narrow screens)
  const skipToPanel = useCallback(() => {
    setSheetOpen(true)
    window.setTimeout(() => document.getElementById('w-concept-brand-scroll')?.focus({ preventScroll: true }), 60)
  }, [])

  const board = view === 'board'
  return (
    <div className="w-concept-brand" data-view={view} data-sheet={board && sheet ? 'true' : undefined} data-rail={board && rail ? 'true' : undefined} data-touring={touring ? 'true' : undefined} data-sheet-open={board && sheet && sheetOpen ? 'true' : undefined} onKeyDown={onRootKey} style={{ '--cb-wall': `url(${IMG.wallTile})` } as CSSProperties}>
      {board ? (
        <>
          <div className="w-concept-brand-main" ref={mainRef} tabIndex={-1}>
            <div className="w-concept-brand-tabs">
              <TabButton size={sheet ? 'sm' : 'md'} color="var(--cb-mantega)" ink="var(--cb-tinta)" icon="arrow-right" selected={tour !== null} onClick={tour === null ? startTour : endTour} cursor="Play" aria-label={UI_TEXT.tour}>
                {sheet ? 'Tour' : UI_TEXT.tour}
              </TabButton>
              <TabButton size={sheet ? 'sm' : 'md'} color="var(--cb-rosat)" ink="var(--cb-tinta)" onClick={() => switchView('index')}>
                {UI_TEXT.index}
              </TabButton>
              <TabButton size={sheet ? 'sm' : 'md'} color="var(--cb-blau)" ink="var(--cb-rosat)" selected={kit} onClick={kit ? closeKit : openKit}>
                {UI_TEXT.kit}
              </TabButton>
            </div>
            <div className="w-concept-brand-top-ui">
              <Chips ref={chipsRef} group={sel.group} onGroup={onChip} />
            </div>
            <Suspense fallback={<Hanging />}>
              <Wall sel={sel} colourway={colourway} still={still} tourActive={tour !== null} reserve={reserve} onSelect={select} onSkip={skipToPanel} onFitChange={setAtFit} furniture={rail} />
            </Suspense>
            <div className="w-concept-brand-stampwrap" data-on={atFit && !sel.group && !kit && tour === null ? 'true' : 'false'} aria-hidden="true">
              <Stamp text="Concept" sub="An invented bar" tone="butter" blend="normal" rotate={-9} size="1.5rem" decorative />
            </div>
            {tour !== null && !dockTour && <Tour ref={tourRef} step={tour} onPrev={() => stop(tour - 1)} onNext={() => stop(tour + 1)} onSkip={endTour} />}
            {kit && <Kit onClose={closeKit} />}
            <p className="w-concept-brand-sr" role="status" aria-live="polite">
              {announce(sel)}
            </p>
          </div>
          <Panel
            work={work}
            sel={sel}
            onSelect={select}
            colourway={colourway}
            onColourway={setColourway}
            onTour={startTour}
            onKit={openKit}
            mode={sheet ? 'sheet' : 'dock'}
            open={sheetOpen}
            onToggle={() => setSheetOpen((o) => !o)}
            still={still}
            tourSlot={dockTour && tour !== null ? <Tour step={tour} onPrev={() => stop(tour - 1)} onNext={() => stop(tour + 1)} onSkip={endTour} onGo={stop} docked /> : undefined}
          />
        </>
      ) : (
        <>
          <div className="w-concept-brand-index-scroll" ref={indexRef} tabIndex={-1}>
            <IndexView
              work={work}
              sel={sel}
              onSelect={select}
              colourway={colourway}
              onColourway={setColourway}
              onBoard={() => switchView('board')}
              onKit={openKit}
              still={still}
            />
          </div>
          {kit && <Kit onClose={closeKit} />}
        </>
      )}
    </div>
  )
}
