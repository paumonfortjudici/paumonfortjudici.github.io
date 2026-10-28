// The ten voices. Every band's giant title is set in its project's own typeface (docs notes/typography.md section 4); the
// CSS (catalog.css, rules on [data-slug]) names the families, this file only loads them.
//
// Two things happen when the sheet is within about one screen of the viewport:
//  1. the catalog loads the exact title face of each band (TITLE_FACE below, its own dynamic imports, so a change in a world's
//     font list can never leave a band in a fallback: Gotet's title is Shrikhand while its world now uses the brand's own faces);
//  2. it calls loadWorldFonts(slug) (src/worlds/fonts.ts) for each folder, which warms the browser cache for the worlds, so a
//     folder opens without the film leader. The open band's face goes first, the other nine when the browser is idle.
// Nothing loads twice (dynamic imports and loadWorldFonts are both cached).

import { loadWorldFonts } from '@/worlds/fonts'
import { WORKS } from '@/lib/works'

/** the @fontsource CSS of the face that sets each band's title (one dynamic import per folder: a chunk of its own, never in the first paint) */
const TITLE_FACE: Record<string, () => Promise<unknown>> = {
  contract: () => import('@fontsource-variable/bitter/wght.css'),
  plana: () => import('@fontsource-variable/sora/wght.css'),
  'fortyfour-lab': () => import('@fontsource/chango/latin-400.css'),
  'spelled-guilty': () => import('@fontsource-variable/archivo/wdth.css'),
  'space-monkey': () => import('@fontsource-variable/orbitron/wght.css'),
  procreate: () => import('@fontsource/gloria-hallelujah/latin-400.css'),
  somia: () => import('@fontsource-variable/cormorant/wght.css'),
  'concept-brand': () => import('@fontsource/shrikhand/latin-400.css'),
  'concept-portfolio': () => import('@fontsource-variable/anybody/wdth.css'),
  illustration: () => import('@fontsource/cherry-bomb-one/latin-400.css'),
}

let started = false

const idle = (fn: () => void): void => {
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(fn, { timeout: 1200 })
  else window.setTimeout(fn, 160)
}

const load = (slug: string): void => {
  void TITLE_FACE[slug]?.().catch(() => undefined)
  void loadWorldFonts(slug)
}

/**
 * Loads all ten title faces, `firstSlug` first. Idempotent; resolves nothing (the CSS swaps the faces in when they are ready).
 * On a wide screen the sheet is already "within a screen" when the page opens (the cover is short), so the first request waits for the
 * window's own `load` and an idle moment: about 430 KB of display faces never compete with the cover's pictures for the first paint.
 */
export function loadCatalogFaces(firstSlug?: string): void {
  if (started || typeof window === 'undefined') return
  started = true
  const slugs = WORKS.map((w) => w.slug)
  const first = firstSlug && slugs.includes(firstSlug) ? firstSlug : slugs[0]
  const go = (): void =>
    idle(() => {
      load(first)
      idle(() => slugs.filter((s) => s !== first).forEach(load))
    })
  if (document.readyState === 'complete') go()
  else window.addEventListener('load', go, { once: true })
}
