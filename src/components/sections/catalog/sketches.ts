// The slot for the picture that stands next to each closed band's title (Motif.tsx). Today every band draws a grey, tone-on-tone sketch of its
// world in SVG. When a hand-made picture is ready, drop it in as public/works/<slug>/catalog-sketch.webp (transparent PNG or WebP, drawn in
// full colour, any size: it is fitted into the same box as the sketch, right-aligned) and add the slug below: the band then shows the picture
// instead of the grey sketch (the SVG sketches stay in the code as the fallback).
//
// The list is static on purpose, like OFFICIAL_ART in sections/works/data.ts: asking for a file that is not there is a 404 on the live site,
// so a slug that is not listed never makes the request. Slugs: contract, plana, fortyfour-lab, spelled-guilty, space-monkey, procreate,
// somia, concept-brand, concept-portfolio, illustration.
import { asset } from '@/lib/asset'

export const CATALOG_SKETCH = new Set<string>([])

/** the public path of a band's own sketch (only ever asked for when the slug is in CATALOG_SKETCH) */
export const sketchPath = (slug: string): string => asset(`/works/${slug}/catalog-sketch.webp`)
