// 02 Catalog: the index of the cabinet. Ten bands in a stack (a filmstrip of folders), one per project, each in its own folder colour and
// its own typeface, an accordion with one open band at a time; a typewritten index card that searches all of it live; group tabs; a
// cursor-following preview on a mouse and inline thumbnails on touch. Docs: docs/api/sections-catalog.md
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { CATALOG, SHEET_META } from '@/lib/copy'
import { useInView, useMotion, usePointerFine } from '@/lib/hooks'
import { WORKS } from '@/lib/works'
import { observeOnce, Scribble, Sheet, StrokeWord, useRevealOnce } from '../primitives'
import { Backdrop } from './catalog/Backdrop'
import { Band, type BandState } from './catalog/Band'
import { loadCatalogFaces } from './catalog/faces'
import { CatalogPreview } from './catalog/Preview'
import { groupCounts, searchWorks, type SearchResult } from './catalog/search'
import { SearchCard } from './catalog/SearchCard'
import { Shelf } from './catalog/Shelf'
import { CAT_UI, type GroupFilter } from './catalog/strings'
import { useHold } from './catalog/useHold'
import { useReturn } from './catalog/useReturn'
import './catalog.css'

/** the Folder primitive's inset of a tab from the band's corners (body radius + tab shoulder: docs/api/primitives.md, `placeTab`) */
const TAB_INSET = 30
/** where the arrow's point is across its drawing, used when the path cannot be read */
const ARROW_TIP = 0.775

/** which band is open after the filter changed: keep it while it still matches, otherwise the best match (nothing when nothing matches) */
function nextOpen(prev: string | null, result: SearchResult): string | null {
  if (!result.active) return prev
  if (result.ranked.length === 0) return null
  if (prev && result.hits.has(prev)) return prev
  return result.ranked[0]
}

export function Catalog() {
  const { still } = useMotion()
  const fine = usePointerFine()
  const sheetRef = useRef<HTMLElement>(null)
  // the cursor preview listens to the pointer only while the sheet is on screen (nothing runs for the other five sheets)
  const near = useInView(sheetRef, { rootMargin: '12% 0px' })
  const peek = fine && !still

  const [query, setQuery] = useState('')
  const [group, setGroup] = useState<GroupFilter>('all')
  const [openSlug, setOpenSlug] = useState<string | null>(WORKS[0]?.slug ?? null)
  const [opened, setOpened] = useState<ReadonlySet<string>>(() => new Set(WORKS[0] ? [WORKS[0].slug] : []))
  const [announce, setAnnounce] = useState('')
  /** how many times each band has been opened: the slate and the stamp are re-keyed with it, so the clapper snaps shut every time */
  const [plays, setPlays] = useState<Readonly<Record<string, number>>>({})

  const stackRef = useRef<HTMLOListElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const noteRef = useRef<HTMLDivElement>(null)
  const heads = useRef(new Map<string, HTMLButtonElement>())
  /** where the first band's tab has to stand for the hand-drawn arrow to land on it (null: the arrow is hidden, the default position stays) */
  const [tab1, setTab1] = useState<number | null>(null)

  const result = useMemo(() => searchWorks(query, group), [query, group])
  const counts = useMemo(() => groupCounts(query), [query])
  const lit = useMemo<ReadonlySet<string>>(() => new Set(result.hits.keys()), [result])
  const matches = result.hits.size
  const empty = result.active && matches === 0

  // a band that has been opened keeps its print and slate mounted; the rest never fetch anything
  useEffect(() => {
    if (!openSlug) return
    setOpened((prev) => (prev.has(openSlug) ? prev : new Set(prev).add(openSlug)))
    setPlays((prev) => ({ ...prev, [openSlug]: (prev[openSlug] ?? 0) + 1 }))
  }, [openSlug])

  // the ten title faces start loading when the sheet is about one screen away
  useEffect(() => {
    const el = sheetRef.current
    if (!el) return
    return observeOnce(el, () => loadCatalogFaces(WORKS[0]?.slug), { rootMargin: '100% 0px 100% 0px' })
  }, [])

  // the arrow from the index card points at the first folder's tab: the card is pinned to the right edge and the tab is placed along the
  // band, so on a wide sheet they drift apart. Measure the arrow's point and stand the tab under it (the Folder takes a 0..1 position).
  useLayoutEffect(() => {
    const sheet = sheetRef.current
    const note = noteRef.current
    if (!sheet || !note) return
    let raf = 0
    const fit = (): void => {
      raf = 0
      const arrow = note.querySelector<SVGSVGElement>('svg')
      const band = stackRef.current?.querySelector<HTMLElement>('.pm-cat-band')
      const tab = band?.querySelector<HTMLElement>('.pm-folder__tab')
      if (!arrow || !band || !tab || getComputedStyle(note.querySelector<HTMLElement>('.pm-cat-note__arrow') ?? note).display === 'none') {
        setTab1(null)
        return
      }
      const box = arrow.getBoundingClientRect()
      let tipX = box.left + box.width * ARROW_TIP
      try {
        // the point of the arrow: the end of its longest stroke (the shaft), in screen coordinates
        const shaft = Array.from(arrow.querySelectorAll('path')).sort((a, b) => b.getTotalLength() - a.getTotalLength())[0]
        const m = shaft?.getScreenCTM()
        if (shaft && m) {
          const end = shaft.getPointAtLength(shaft.getTotalLength())
          tipX = m.a * end.x + m.c * end.y + m.e
        }
      } catch {
        /* keep the calibrated fraction */
      }
      const b = band.getBoundingClientRect()
      const lo = TAB_INSET
      const hi = b.width - TAB_INSET - tab.offsetWidth
      if (hi <= lo) return
      const t = (tipX - b.left - tab.offsetWidth / 2 - lo) / (hi - lo)
      const next = Math.round(Math.min(0.97, Math.max(0.03, t)) * 1000) / 1000
      setTab1((prev) => (prev !== null && Math.abs(prev - next) < 0.004 ? prev : next))
    }
    const schedule = (): void => {
      if (!raf) raf = requestAnimationFrame(fit)
    }
    fit()
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule)
    ro?.observe(sheet)
    document.fonts?.addEventListener?.('loadingdone', schedule)
    void document.fonts?.ready.then(schedule)
    return () => {
      ro?.disconnect()
      document.fonts?.removeEventListener?.('loadingdone', schedule)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  // the bands arrive once, like files shuffled into the drawer (the hidden state exists only under html.js)
  useRevealOnce(stackRef, { threshold: 0.04, rootMargin: '0px 0px -6% 0px' })

  // the polite live region speaks after the visitor stops typing, never on every key
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const text = !result.active ? CAT_UI.announce(matches, WORKS.length, '') : empty ? CATALOG.empty(query.trim()) : CAT_UI.announce(matches, WORKS.length, query.trim())
    const id = window.setTimeout(() => setAnnounce(text), 450)
    return () => window.clearTimeout(id)
  }, [result.active, empty, matches, query])

  const changeQuery = (value: string): void => {
    setQuery(value)
    setOpenSlug((prev) => nextOpen(prev, searchWorks(value, group)))
  }
  const changeGroup = (value: GroupFilter): void => {
    setGroup(value)
    setOpenSlug((prev) => nextOpen(prev, searchWorks(query, value)))
  }
  const clearAll = (): void => {
    setQuery('')
    setGroup('all')
    inputRef.current?.focus({ preventScroll: true })
  }
  const openRef = useRef(openSlug)
  openRef.current = openSlug
  const hold = useHold(still)
  useReturn()
  // a visitor's click: the clicked header stays where it is while the bands fold, and an opened band is brought into view (see useHold)
  const toggle = useCallback(
    (slug: string): void => {
      const head = heads.current.get(slug)
      if (head) hold(head, openRef.current !== slug)
      setOpenSlug((prev) => (prev === slug ? null : slug))
    },
    [hold],
  )
  const headRef = useCallback((slug: string, el: HTMLButtonElement | null): void => {
    if (el) heads.current.set(slug, el)
    else heads.current.delete(slug)
  }, [])

  const focusHead = (slug: string | undefined): void => {
    if (slug) heads.current.get(slug)?.focus()
  }
  const submit = (): void => {
    const slug = result.ranked[0]
    if (!slug) return
    setOpenSlug(slug)
    requestAnimationFrame(() => focusHead(slug))
  }

  // APG accordion keys on the band headers: Up / Down / Home / End move between them (Enter and Space are the buttons' own)
  const onStackKeyDown = (event: KeyboardEvent<HTMLOListElement>): void => {
    const target = event.target
    if (!(target instanceof HTMLElement) || !target.classList.contains('pm-cat-head')) return
    const here = WORKS.findIndex((w) => w.slug === target.closest('[data-slug]')?.getAttribute('data-slug'))
    let to = -1
    if (event.key === 'ArrowDown') to = Math.min(WORKS.length - 1, here + 1)
    else if (event.key === 'ArrowUp') to = Math.max(0, here - 1)
    else if (event.key === 'Home') to = 0
    else if (event.key === 'End') to = WORKS.length - 1
    else return
    event.preventDefault()
    focusHead(WORKS[to]?.slug)
  }

  const stateOf = (slug: string): BandState => (slug === openSlug ? 'open' : result.active && !result.hits.has(slug) ? 'thin' : 'rest')

  return (
    <Sheet ref={sheetRef} id="catalog" tone="ink" page={SHEET_META.pages.catalog} n={2} aria-labelledby="catalog-title" className="pm-cat">
      <Backdrop lit={lit} open={openSlug} />

      <div className="pm-cat-top">
        <div className="pm-cat-top__word">
          <StrokeWord text={CATALOG.ghost} ghost size="clamp(3.6rem, 7.2vw, 8.6rem)" className="pm-cat-ghost" />
          <StrokeWord
            as="h2"
            id="catalog-title"
            text={CATALOG.strokeWord}
            fill="solid"
            shadow="var(--marigold)"
            size="clamp(4.5rem, 11.6vw, 17rem)"
            style={{ color: 'var(--cream)' }}
          />
          <p className="pm-cat-sub t-lead">{CATALOG.sub}</p>
        </div>

        <div className="pm-cat-top__card">
          <SearchCard value={query} onChange={changeQuery} onSubmit={submit} onArrowDown={() => focusHead(result.ranked[0] ?? WORKS[0]?.slug)} inputRef={inputRef} />
          <div ref={noteRef} className="pm-cat-note" aria-hidden="true">
            <span className="pm-cat-note__t t-hand">{CAT_UI.note}</span>
            <span className="pm-cat-note__arrow">
              <Scribble kind="arrow" dir="down" w="9.5rem" color="var(--marigold)" seed="catalog-arrow" stroke={3.6} draw={still ? false : 900} />
            </span>
          </div>
        </div>
      </div>

      <Shelf group={group} counts={counts} matches={matches} total={WORKS.length} active={result.active} onGroup={changeGroup} onClear={clearAll} />

      <div className="pm-cat-empty" data-show={empty ? '' : undefined} aria-hidden={empty ? undefined : true}>
        <div className="pm-cat-empty__in">
          <p className="pm-cat-slip">{CATALOG.empty(query.trim())}</p>
        </div>
      </div>

      <ol ref={stackRef} className="pm-cat-stack" onKeyDown={onStackKeyDown}>
        {WORKS.map((work, i) => (
          <Band
            key={work.slug}
            work={work}
            index={i}
            state={stateOf(work.slug)}
            words={result.words}
            hint={result.hits.get(work.slug)?.hint ?? null}
            mounted={opened.has(work.slug)}
            plays={plays[work.slug] ?? 0}
            inlineThumb={!peek}
            tape={WORKS[(i + 1) % WORKS.length].color}
            tabX={i === 0 && tab1 !== null ? tab1 : undefined}
            onToggle={toggle}
            headRef={headRef}
          />
        ))}
      </ol>

      <CatalogPreview enabled={peek && near} openSlug={openSlug} />
      <p className="pm-sr" role="status" aria-live="polite" aria-atomic="true">
        {announce}
      </p>
    </Sheet>
  )
}

export default Catalog
