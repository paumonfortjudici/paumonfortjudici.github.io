// Hash router (GitHub Pages cannot rewrite URLs).
//
//   #/work/<slug>                    a world is open (a project folder)
//   #cover #catalog #about #works #process #contact     section anchors: native smooth scroll, nothing to handle
//   anything else                    home
//
// Opening a world pushes ONE history entry tagged {pmWork:'from-home'}; closing it goes back, so the browser restores
// the scroll position. Hopping to the previous / next project replaces the entry, so Back / Escape always leave the
// world in a single step. Unknown slugs fall back to home. While a world is open, <html data-world-open="<slug>"> locks
// page scroll (base.css).

import { useSyncExternalStore } from 'react'
import { workBySlug } from './works'

export const SECTION_IDS = ['cover', 'catalog', 'about', 'works', 'process', 'contact'] as const
export type SectionId = (typeof SECTION_IDS)[number]

export type Route =
  | { kind: 'home'; anchor?: SectionId }
  | {
      kind: 'work'
      slug: string
      /** which surface the folder was opened from ('cover' | 'catalog' | 'works'); undefined for deep links and hops */
      origin?: string
      /** set only on the render that follows a prev / next hop: +1 next, -1 previous (used for the slide direction) */
      dir?: -1 | 0 | 1
    }

export interface OpenOptions {
  /** replace the current history entry instead of pushing (prev / next hops). Implied while a world is open. */
  replace?: boolean
  /** direction of a hop: +1 next, -1 previous */
  dir?: -1 | 0 | 1
}

interface Session {
  slug: string
  origin?: string
  scrollY: number
  /** location.hash before the world opened ('' when none): where Close returns to */
  prevHash: string
  /** the element that opened the world, for focus restore */
  opener: HTMLElement | null
  /** true after the first prev / next hop */
  hopped: boolean
}

const WORK_HASH = /^#\/work\/([a-z0-9-]+)\/?$/i
const listeners = new Set<() => void>()

let route: Route = { kind: 'home' }
let session: Session | null = null
let lastSession: Session | null = null
let pendingDir: -1 | 0 | 1 = 0
let closing = false

const isSection = (value: string): value is SectionId => (SECTION_IDS as readonly string[]).includes(value)
const baseUrl = (): string => window.location.pathname + window.location.search

function activeElementOrNull(): HTMLElement | null {
  const el = document.activeElement
  return el instanceof HTMLElement && el !== document.body && el !== document.documentElement ? el : null
}

function parse(): Route {
  const hash = window.location.hash
  const match = WORK_HASH.exec(hash)
  if (match) {
    const slug = match[1].toLowerCase()
    if (workBySlug(slug)) {
      const origin = session && !session.hopped && session.slug === slug ? session.origin : undefined
      return { kind: 'work', slug, origin, dir: pendingDir }
    }
    // unknown slug: drop the bogus hash and show home
    window.history.replaceState(null, '', baseUrl())
    return { kind: 'home' }
  }
  const anchor = hash.slice(1)
  return isSection(anchor) ? { kind: 'home', anchor } : { kind: 'home' }
}

function sameRoute(a: Route, b: Route): boolean {
  if (a.kind !== b.kind) return false
  if (a.kind === 'home' && b.kind === 'home') return a.anchor === b.anchor
  if (a.kind === 'work' && b.kind === 'work') return a.slug === b.slug && a.origin === b.origin
  return false
}

function applyRouteEffects(prev: Route, next: Route): void {
  const root = document.documentElement
  if (next.kind === 'work') root.dataset.worldOpen = next.slug
  else delete root.dataset.worldOpen
  if (prev.kind === 'work' && next.kind === 'home' && lastSession) {
    // put the page back exactly where the visitor left it, before the folder shrinks back onto its card
    window.scrollTo({ top: lastSession.scrollY, left: 0, behavior: 'instant' })
  }
}

function refresh(): void {
  const next = parse()
  pendingDir = 0
  if (sameRoute(route, next)) return
  const prev = route
  if (prev.kind === 'home' && next.kind === 'work' && !session) {
    // opened by a plain link, the Forward button or a typed hash: still remember where we came from
    session = { slug: next.slug, scrollY: window.scrollY, prevHash: '', opener: activeElementOrNull(), hopped: false }
  }
  if (prev.kind === 'work' && next.kind === 'home') {
    lastSession = session
    session = null
    closing = false
  }
  route = next
  applyRouteEffects(prev, next)
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const getRoute = (): Route => route

/** Current route. `work` routes carry `origin` when the folder was opened from a card via openWork(slug, origin). */
export function useRoute(): Route {
  return useSyncExternalStore(subscribe, getRoute, getRoute)
}

/** The element that opened the current (or just closed) world, if it still exists. Used for focus restore. */
export function getOpener(): HTMLElement | null {
  const opener = (session ?? lastSession)?.opener ?? null
  return opener && opener.isConnected ? opener : null
}

/** '#/work/<slug>': use as the href of a link, and also call openWork() in its onClick (preventDefault) to get the folder animation. */
export const workHref = (slug: string): string => `#/work/${slug}`

/**
 * The shared-element id of a folder body. The card that opens the world and the world shell use the same id, so
 * framer-motion expands the card into the world. `origin` says which surface the card lives on ('cover' | 'catalog' |
 * 'works'), because the same project has a card in each of them and only the clicked one may animate.
 */
export const folderLayoutId = (slug: string, origin?: string): string => `folder-${slug}-${origin ?? 'x'}`

/**
 * Open a project world. Call it from the card's click handler:
 *   onClick={(e) => { e.preventDefault(); openWork(work.slug, 'works') }}
 * Remembers the scroll position, the previous anchor and the opening element so closeWork() can restore them.
 */
export function openWork(slug: string, origin?: string, options: OpenOptions = {}): void {
  if (!workBySlug(slug)) return
  const url = `${baseUrl()}#/work/${slug}`
  const fromHome = route.kind === 'home'
  if (fromHome) {
    session = { slug, origin, scrollY: window.scrollY, prevHash: window.location.hash, opener: activeElementOrNull(), hopped: false }
  } else if (session) {
    session.hopped = true
  }
  pendingDir = options.dir ?? 0
  if (fromHome && !options.replace) {
    // Leave the entry we came from without its section anchor. Otherwise Back lands on ".../#works" and the browser scrolls
    // to that fragment on top of the scroll position restored here, and focus drops on <body>.
    if (isSection(window.location.hash.slice(1))) window.history.replaceState(window.history.state, '', baseUrl())
    window.history.pushState({ pmWork: 'from-home' }, '', url)
  } else window.history.replaceState(window.history.state, '', url)
  refresh()
}

function goHomeWithoutLeaving(): void {
  window.history.pushState(null, '', baseUrl() + (session?.prevHash ?? ''))
  refresh()
}

/**
 * Close the open world. When the previous history entry is the page we came from this is history.back(), so the
 * browser restores the scroll position; for a deep link it navigates home without leaving the site.
 */
export function closeWork(): void {
  if (route.kind !== 'work' || closing) return
  const state = window.history.state as { pmWork?: string } | null
  if (state?.pmWork === 'from-home') {
    closing = true
    window.history.back()
    // safety net: if no popstate arrives (embedded browsers), still close
    window.setTimeout(() => {
      if (route.kind === 'work' && closing) {
        closing = false
        goHomeWithoutLeaving()
      }
    }, 600)
    return
  }
  goHomeWithoutLeaving()
}

/** Smooth-scroll (unless motion is reduced or paused: CSS decides) to a section and reflect it in the URL without adding history entries. */
export function scrollToSection(id: SectionId, options: { instant?: boolean } = {}): void {
  const element = document.getElementById(id)
  if (!element) return
  element.scrollIntoView({ block: 'start', behavior: options.instant ? 'instant' : 'auto' })
  window.history.replaceState(window.history.state, '', `${baseUrl()}#${id}`)
  refresh()
}

/** Call once after the first render: scrolls to a section anchor in the URL (the DOM did not exist when the browser tried). */
export function syncInitialScroll(): void {
  if (route.kind !== 'home' || !route.anchor) return
  const element = document.getElementById(route.anchor)
  element?.scrollIntoView({ block: 'start', behavior: 'instant' })
}

// ---- boot --------------------------------------------------------------------------------------------------------
if (typeof window !== 'undefined') {
  route = parse()
  applyRouteEffects({ kind: 'home' }, route)
  const onChange = () => refresh()
  window.addEventListener('hashchange', onChange)
  window.addEventListener('popstate', onChange)
  import.meta.hot?.dispose(() => {
    window.removeEventListener('hashchange', onChange)
    window.removeEventListener('popstate', onChange)
  })
}
