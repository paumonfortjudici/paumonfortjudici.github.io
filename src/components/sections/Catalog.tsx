// 02 Catalog: the index of the cabinet. Ten bands in a stack (a filmstrip of folders), one per project, each in its own folder colour and
// its own typeface, an accordion with one open band at a time; a typewritten index card that searches all of it live; group tabs; a
// cursor-following preview on a mouse and inline thumbnails on touch. Docs: docs/api/sections-catalog.md
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
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
import { Spines } from './catalog/Spines'
import { CAT_UI, type GroupFilter } from './catalog/strings'
import { useHold } from './catalog/useHold'
import { useReturn } from './catalog/useReturn'
import './catalog.css'

/**
 * which band is open after the filter changed: keep it while it still matches, otherwise fold it shut. A match never opens by itself while the
 * visitor types (a band opening off the screen under a moving stack reads as the page jumping): Enter or the Down arrow opens the best match.
 */
function nextOpen(prev: string | null, result: SearchResult): string | null {
  if (!result.active) return prev
  if (prev && result.hits.has(prev)) return prev
  return null
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
  const heads = useRef(new Map<string, HTMLButtonElement>())

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
  // Enter on the index card: the best match opens, and its header takes the focus (the page brings it into view, as for a click)
  const submit = (): void => {
    const slug = result.ranked[0]
    if (!slug) return
    const head = heads.current.get(slug)
    if (head) {
      hold(head, openRef.current !== slug)
      setOpenSlug(slug)
      requestAnimationFrame(() => head.focus({ preventScroll: true }))
    }
  }

  // a spine of the drawer index: open that folder and bring its band to the top of the screen once the bands above it have folded
  const jumpTimer = useRef(0)
  useEffect(() => () => window.clearTimeout(jumpTimer.current), [])
  const jump = useCallback(
    (slug: string): void => {
      const item = heads.current.get(slug)?.closest<HTMLElement>('.pm-cat-item')
      if (!item) return
      const wasOpen = openRef.current === slug
      setOpenSlug(slug)
      window.clearTimeout(jumpTimer.current)
      jumpTimer.current = window.setTimeout(
        () => {
          const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72
          window.scrollTo({ top: window.scrollY + item.getBoundingClientRect().top - navH - 44, behavior: still ? 'instant' : 'smooth' })
        },
        wasOpen ? 0 : still ? 160 : 800,
      )
    },
    [still],
  )

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
        <div className="pm-cat-top__title">
          <StrokeWord
            as="h2"
            id="catalog-title"
            text={CATALOG.strokeWord}
            fill="solid"
            shadow="var(--marigold)"
            size="clamp(4.5rem, 12.7vw, 18rem)"
            style={{ color: 'var(--cream)' }}
          />
          {/* the count, drawn as a superscript on the last letter (an exponent: 10 files) */}
          <span className="pm-cat-sup t-hand" aria-hidden="true">
            {CATALOG.ghost}
          </span>
        </div>
        <p className="pm-cat-sub t-lead">{CATALOG.sub}</p>

        <div className="pm-cat-top__card">
          <SearchCard value={query} onChange={changeQuery} onSubmit={submit} onArrowDown={() => focusHead(result.ranked[0] ?? WORKS[0]?.slug)} inputRef={inputRef} />
          <div className="pm-cat-note" aria-hidden="true">
            {/* the arrow stands on the left, over spine 01 (the first folder), and the words run on to its right */}
            <span className="pm-cat-note__arrow">
              <Scribble kind="arrow" dir="down" w="5.2rem" color="var(--marigold)" seed="catalog-arrow" stroke={3.6} draw={still ? false : 900} />
            </span>
            <span className="pm-cat-note__t t-hand">{CAT_UI.note}</span>
          </div>
          <Spines lit={lit} active={result.active} open={openSlug} onPick={jump} />
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
