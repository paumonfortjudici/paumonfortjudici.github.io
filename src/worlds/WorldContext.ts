import { createContext, useContext, useEffect, useRef, type RefObject } from 'react'
import type { WorkMeta } from '../lib/works'

export interface WorldContextValue {
  /** the registry entry of the open project */
  work: WorkMeta
  /** shorthands of work.slug / color / ink / accent (accent falls back to ink) */
  slug: string
  color: string
  ink: string
  accent: string
  /** close the world (same as the Close tab / Escape) */
  close: () => void
  /** hop to the next / previous project (same as the edge tabs and the ] / [ keys) */
  next: () => void
  prev: () => void
  nextWork: WorkMeta
  prevWork: WorkMeta
  /** true when the OS asks for reduced motion OR the visitor pressed "Pause motion": same as useMotion().still */
  reduced: boolean
  /** the world's scroll container (.pm-world-scroll): pass to useInView({ root }) or useBodyLock(open, scrollRef) */
  scrollRef: RefObject<HTMLDivElement>
}

export const WorldContext = createContext<WorldContextValue | null>(null)

/** Inside a world component: who am I, how do I close, am I allowed to move. Worlds must not render their own title, close or prev / next. */
export function useWorld(): WorldContextValue {
  const value = useContext(WorldContext)
  if (!value) throw new Error('useWorld() can only be used inside a world rendered by WorldShell')
  return value
}

// ---- Escape stack ----------------------------------------------------------------------------------------------------
// Escape closes the world, unless something inside the world (a lightbox, a menu, a zoomed picture) is open and wants it first.
// Window listeners run in registration order and the shell registers first, so an inner useKey('Escape') would lose the race:
// use this hook instead. The most recently activated handler wins; when none is active the shell closes the world.
const escapeStack: Array<() => void> = []

export function useWorldEscape(active: boolean, handler: () => void): void {
  const latest = useRef(handler)
  latest.current = handler
  useEffect(() => {
    if (!active) return
    const entry = () => latest.current()
    escapeStack.push(entry)
    return () => {
      const index = escapeStack.lastIndexOf(entry)
      if (index >= 0) escapeStack.splice(index, 1)
    }
  }, [active])
}

/** used by the shell: the handler that should take this Escape, if any */
export const topEscape = (): (() => void) | undefined => escapeStack[escapeStack.length - 1]
