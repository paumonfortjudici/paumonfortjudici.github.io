// The folder's own picture: a wide, hand-drawn frieze that lies behind the whole header of a closed band, faint, under the title and the meta
// (Band.tsx draws it, catalog.css `.pm-cat-art` fades it). Each is drawn in four colours chosen against its folder's colour, on that flat
// colour, and filed by `python tools/ingest_catalog.py <folder>` as public/works/<slug>/catalog-sketch.webp (transparent, 2172 x 724).
// A slug in the list below shows its picture and stops drawing the grey SVG sketch of Motif.tsx (which stays in the code as the fallback
// for a slug that has no picture yet). The prompts that made them are in docs/image-prompts.md (CAT-01 .. CAT-10).
//
// The list is static on purpose, like OFFICIAL_ART in sections/works/data.ts: asking for a file that is not there is a 404 on the live site,
// so a slug that is not listed never makes the request. Slugs: contract, plana, fortyfour-lab, spelled-guilty, space-monkey, procreate,
// somia, concept-brand, concept-portfolio, illustration.
import { asset } from '@/lib/asset'

export const CATALOG_SKETCH = new Set<string>([
  'contract',
  'plana',
  'fortyfour-lab',
  'spelled-guilty',
  'space-monkey',
  'procreate',
  'somia',
  'concept-brand',
  'concept-portfolio',
  'illustration',
])

/** pixel size of every frieze (the sources are 3:1) */
export const SKETCH_SIZE = { width: 2172, height: 724 } as const

/** the public path of a band's own sketch (only ever asked for when the slug is in CATALOG_SKETCH) */
export const sketchPath = (slug: string): string => asset(`/works/${slug}/catalog-sketch.webp`)
