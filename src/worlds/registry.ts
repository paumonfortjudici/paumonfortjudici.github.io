// slug -> lazy world component. Every world is its own chunk (<= 120 KB gz without images) and brings its own CSS + display face.
import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import { loadWorldFonts } from './fonts'

export type WorldModule = { default: ComponentType }

export const WORLDS: Record<string, () => Promise<WorldModule>> = {
  contract: () => import('./ContractWorld'),
  plana: () => import('./PlanaWorld'),
  'fortyfour-lab': () => import('./FortyFourLabWorld'),
  'spelled-guilty': () => import('./SpelledGuiltyWorld'),
  'space-monkey': () => import('./SpaceMonkeyWorld'),
  procreate: () => import('./ProcreateWorld'),
  somia: () => import('./SomiaWorld'),
  'concept-brand': () => import('./ConceptBrandWorld'),
  'concept-portfolio': () => import('./ConceptPortfolioWorld'),
  illustration: () => import('./IllustrationWorld'),
}

const lazyCache = new Map<string, LazyExoticComponent<ComponentType>>()

/** A stable lazy component per slug (the world chunk and its faces load together; the film leader shows meanwhile). */
export function getWorldComponent(slug: string): LazyExoticComponent<ComponentType> {
  let component = lazyCache.get(slug)
  if (!component) {
    const load = WORLDS[slug]
    component = lazy(() => Promise.all([load(), loadWorldFonts(slug)]).then(([module]) => module))
    lazyCache.set(slug, component)
  }
  return component
}

/** Forget a failed load so the next render tries again. */
export function resetWorld(slug: string): void {
  lazyCache.delete(slug)
}

/** Start loading a world's chunk and faces ahead of time: call on card hover / focus. Idempotent and silent. */
export function prefetchWorld(slug: string): void {
  void WORLDS[slug]?.().catch(() => undefined)
  void loadWorldFonts(slug)
}
