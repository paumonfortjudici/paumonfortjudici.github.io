// The catalog's search engine: tiny, deterministic, no dependencies. Everything is matched against the registry (src/lib/works.ts).
//
//  - The query is split into words; a folder matches when EVERY word is found in some field (substring, accent- and case-insensitive).
//  - Fields: title, keywords, categories, kind, roles, tools, group, years, blurb. Rank: title > keywords / categories > the rest > blurb.
//  - `hint` says why a folder matched when the reason is not visible on a closed band (keywords, roles, tools, categories, blurb).
//  - `splitMarks(text, words)` cuts a visible string into plain and matched parts, so the UI can underline the matched words.
//
// The functions are pure: the Catalog component keeps the state (query, group) and calls `searchWorks` on every change.

import { CATEGORY_LABEL, WORKS, type WorkMeta } from '@/lib/works'
import { INSIDE } from './contents'
import { CAT_UI, type GroupFilter } from './strings'

type FieldKey = 'title' | 'keywords' | 'categories' | 'kind' | 'roles' | 'tools' | 'group' | 'years' | 'blurb' | 'inside'

/** what a closed band already shows on its face: matches in these fields need no explanation */
const VISIBLE: ReadonlySet<FieldKey> = new Set<FieldKey>(['title', 'kind', 'years', 'group'])

/** base weight of a match per field (a word-start match keeps it all, a match inside a word keeps 45 %) */
const WEIGHT: Record<FieldKey, number> = {
  title: 100,
  keywords: 56,
  categories: 56,
  kind: 38,
  roles: 32,
  tools: 32,
  group: 26,
  years: 26,
  inside: 24,
  blurb: 12,
}

/** what a closed band says when the match is in a field its face does not show */
const FOUND: Partial<Record<FieldKey, string>> = CAT_UI.found

const isLetterOrDigit = (ch: string | undefined): boolean => !!ch && /[\p{L}\p{N}]/u.test(ch)

/** lower-cases and strips accents, keeping a map from every normalised index back to the original string */
function fold(text: string): { norm: string; map: number[] } {
  let norm = ''
  const map: number[] = []
  let i = 0
  for (const ch of text) {
    const base = ch.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    for (const piece of base) {
      norm += piece
      map.push(i)
    }
    i += ch.length
  }
  return { norm, map }
}

interface Entry {
  key: FieldKey
  raw: string
  norm: string
  map: number[]
}

interface Indexed {
  work: WorkMeta
  entries: Entry[]
}

function entry(key: FieldKey, raw: string): Entry {
  const { norm, map } = fold(raw)
  return { key, raw, norm, map }
}

const INDEX: Indexed[] = WORKS.map((work) => ({
  work,
  entries: [
    entry('title', work.title),
    ...work.keywords.map((k) => entry('keywords', k)),
    ...work.categories.flatMap((c) => [entry('categories', CATEGORY_LABEL[c]), entry('categories', c)]),
    entry('kind', work.kind),
    ...work.roles.map((r) => entry('roles', r)),
    ...work.tools.map((t) => entry('tools', t)),
    entry('group', work.group),
    ...(INSIDE[work.slug] ?? []).map((line) => entry('inside', line)),
    ...(work.years ? [entry('years', work.years)] : []),
    entry('blurb', work.blurb),
  ],
}))

/** the whole word that contains the match at `at` (for the "found in" hint) */
function wordAround(e: Entry, at: number, len: number): string {
  let a = at
  let b = at + len
  while (a > 0 && isLetterOrDigit(e.norm[a - 1])) a--
  while (b < e.norm.length && isLetterOrDigit(e.norm[b])) b++
  const from = e.map[a] ?? 0
  const to = e.map[b] ?? e.raw.length
  return e.raw.slice(from, to).trim()
}

interface TokenHit {
  score: number
  visible: boolean
  /** best hit in a field that a closed band does not show */
  hidden: { field: FieldKey; word: string; score: number } | null
}

/** a match inside a word ("book" in "Sketchbook") counts for less than half of one at the start of a word */
const INSIDE_WORD = 0.45

/** where `token` is in `norm`: the first occurrence at the start of a word, else the first inside a word (a token of one or two letters only counts at the start of a word) */
function locate(norm: string, token: string): { at: number; wordStart: boolean } | null {
  let inside = -1
  for (let at = norm.indexOf(token); at >= 0; at = norm.indexOf(token, at + 1)) {
    if (at === 0 || !isLetterOrDigit(norm[at - 1])) return { at, wordStart: true }
    if (inside < 0) inside = at
  }
  return inside >= 0 && token.length > 2 ? { at: inside, wordStart: false } : null
}

function matchToken(item: Indexed, token: string): TokenHit | null {
  let best = 0
  let visible = false
  let hidden: TokenHit['hidden'] = null
  for (const e of item.entries) {
    const found = locate(e.norm, token)
    if (!found) continue
    const { at, wordStart } = found
    const score = WEIGHT[e.key] * (wordStart ? 1 : INSIDE_WORD) + (wordStart && !isLetterOrDigit(e.norm[at + token.length]) ? 8 : 0)
    if (score > best) best = score
    if (VISIBLE.has(e.key)) visible = true
    else if (!hidden || score > hidden.score) hidden = { field: e.key, word: wordAround(e, at, token.length), score }
  }
  return best > 0 ? { score: best, visible, hidden } : null
}

export interface WorkHit {
  slug: string
  score: number
  /** why this folder matched, when the closed band does not show it: "Found in keywords:" + the word */
  hint: { field: string; word: string } | null
}

export interface SearchResult {
  /** the query words, folded (lower case, no accents) */
  words: string[]
  /** something is filtering: a query or a group */
  active: boolean
  hits: Map<string, WorkHit>
  /** slugs of the matches, best first (ties keep the cabinet's order) */
  ranked: string[]
}

/** Query text -> folded words. Punctuation (quotes, dashes, commas) only separates words. */
export function queryWords(query: string): string[] {
  return fold(query)
    .norm.replace(/[^\p{L}\p{N}]+/gu, ' ')
    .split(' ')
    .filter(Boolean)
}

export function searchWorks(query: string, group: GroupFilter): SearchResult {
  const words = queryWords(query)
  const hits = new Map<string, WorkHit>()
  for (const item of INDEX) {
    if (group !== 'all' && item.work.group !== group) continue
    let total = 0
    let hint: WorkHit['hint'] = null
    let ok = true
    for (const word of words) {
      const hit = matchToken(item, word)
      if (!hit) {
        ok = false
        break
      }
      total += hit.score
      if (!hint && !hit.visible && hit.hidden) {
        const found = FOUND[hit.hidden.field]
        if (found) hint = { field: found, word: hit.hidden.word }
      }
    }
    if (ok) hits.set(item.work.slug, { slug: item.work.slug, score: total, hint })
  }
  const ranked = [...hits.values()].sort((a, b) => b.score - a.score || (indexOfSlug(a.slug) - indexOfSlug(b.slug))).map((h) => h.slug)
  return { words, active: words.length > 0 || group !== 'all', hits, ranked }
}

const indexOfSlug = (slug: string): number => WORKS.findIndex((w) => w.slug === slug)

/** how many folders each group tab would show for this query (the tabs carry these counts) */
export function groupCounts(query: string): Record<GroupFilter, number> {
  const all = searchWorks(query, 'all')
  const out: Record<GroupFilter, number> = { all: all.hits.size, 'Published work': 0, 'First steps': 0, Concept: 0 }
  for (const slug of all.hits.keys()) {
    const group = WORKS[indexOfSlug(slug)]?.group
    if (group) out[group] += 1
  }
  return out
}

export interface Part {
  text: string
  mark: boolean
}

/** Cuts `text` into plain and matched parts for the given folded query words (overlaps are merged). */
export function splitMarks(text: string, words: string[]): Part[] {
  if (!text || words.length === 0) return [{ text, mark: false }]
  const { norm, map } = fold(text)
  const spans: [number, number][] = []
  for (const word of words) {
    let from = 0
    for (;;) {
      const at = norm.indexOf(word, from)
      if (at < 0) break
      // the same rule as the search: a token of one or two letters only counts at the start of a word
      if (word.length > 2 || at === 0 || !isLetterOrDigit(norm[at - 1])) spans.push([at, at + word.length])
      from = at + word.length
    }
  }
  if (spans.length === 0) return [{ text, mark: false }]
  spans.sort((a, b) => a[0] - b[0])
  const merged: [number, number][] = []
  for (const s of spans) {
    const last = merged[merged.length - 1]
    if (last && s[0] <= last[1]) last[1] = Math.max(last[1], s[1])
    else merged.push([s[0], s[1]])
  }
  const parts: Part[] = []
  let cursor = 0
  for (const [a, b] of merged) {
    const from = map[a] ?? 0
    const to = b >= map.length ? text.length : (map[b] ?? text.length)
    if (from > cursor) parts.push({ text: text.slice(cursor, from), mark: false })
    parts.push({ text: text.slice(from, to), mark: true })
    cursor = to
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), mark: false })
  return parts
}
