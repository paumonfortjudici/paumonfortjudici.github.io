// One lazy face (or small family) per world, set by the world's own CSS (`font-family: 'Sora Variable', var(--font-body)`).
// The CSS is a dynamic import, so it lands in its own chunk and never touches the first paint. Source: notes/typography.md section 4.
// Always list the core body face as the next fallback in the world's CSS: some world faces lack glyphs (Orbitron has no middle dot).
import { whenFontsLoaded } from '../styles/fonts'

type CssLoader = () => Promise<unknown>

/** The 'loadWorld' map: one dynamic import of the @fontsource CSS per slug. */
export const loadWorld: Record<string, CssLoader> = {
  contract: () => Promise.all([import('@fontsource-variable/bitter/wght.css'), import('@fontsource-variable/overpass/wght.css')]),
  plana: () =>
    Promise.all([
      import('@fontsource-variable/sora/wght.css'),
      import('@fontsource/dm-mono/latin-500.css'),
      import('@fontsource-variable/figtree/wght.css'),
    ]),
  'fortyfour-lab': () => import('@fontsource/chango/latin-400.css'),
  'spelled-guilty': () => import('@fontsource-variable/archivo/wdth.css'),
  'space-monkey': () => import('@fontsource-variable/orbitron/wght.css'),
  procreate: () => import('@fontsource/gloria-hallelujah/latin-400.css'),
  somia: () =>
    Promise.all([
      import('@fontsource-variable/cormorant/wght.css'),
      import('@fontsource-variable/cormorant/wght-italic.css'),
      import('@fontsource/fira-sans/latin-400.css'),
      import('@fontsource/fira-sans/latin-500.css'),
      import('@fontsource/fira-sans/latin-600.css'),
    ]),
  'concept-brand': () =>
    Promise.all([
      import('@fontsource/shrikhand/latin-400.css'),
      import('@fontsource/barlow-semi-condensed/latin-400.css'),
      import('@fontsource/barlow-semi-condensed/latin-500.css'),
      import('@fontsource/barlow-semi-condensed/latin-600.css'),
      import('@fontsource/barlow-semi-condensed/latin-700.css'),
    ]),
  'concept-portfolio': () => import('@fontsource-variable/anybody/wdth.css'),
  illustration: () => import('@fontsource/cherry-bomb-one/latin-400.css'),
}

/** The face(s) each world shows first. The film leader waits for them (up to ~0.9 s) so the big title never flashes a fallback. */
const headline: Record<string, string[]> = {
  contract: ['800 1em "Bitter Variable"', '800 1em "Overpass Variable"'],
  plana: ['800 1em "Sora Variable"', '400 1em "Figtree Variable"'],
  'fortyfour-lab': ['400 1em "Chango"'],
  'spelled-guilty': ['800 1em "Archivo Variable"'],
  'space-monkey': ['700 1em "Orbitron Variable"'],
  procreate: ['400 1em "Gloria Hallelujah"'],
  somia: ['300 1em "Cormorant Variable"', '400 1em "Fira Sans"'],
  'concept-brand': ['400 1em "Shrikhand"', '600 1em "Barlow Semi Condensed"'],
  'concept-portfolio': ['900 1em "Anybody Variable"'],
  illustration: ['400 1em "Cherry Bomb One"'],
}

const cache = new Map<string, Promise<void>>()

/**
 * Loads the faces of one world (idempotent; safe to call early, e.g. on card hover or focus). Resolves when the CSS is in
 * and the headline faces are decoded, or after the timeout. Never rejects.
 */
export function loadWorldFonts(slug: string): Promise<void> {
  let pending = cache.get(slug)
  if (!pending) {
    const css = loadWorld[slug]
    pending = (css ? css() : Promise.resolve())
      .then(() => whenFontsLoaded(headline[slug] ?? []))
      .catch(() => {
        cache.delete(slug)
      })
    cache.set(slug, pending)
  }
  return pending
}
