// Motion switches for the whole site.
//
//   html.js                       set by an inline script in index.html: hidden/initial animation states live only under it
//   html[data-motion="paused"]    the visitor pressed "Pause motion" (persisted in localStorage 'pm-motion')
//   @media (prefers-reduced-motion: reduce)   the OS preference
//
// CSS: every ambient loop carries the class `pm-ambient`; base.css stops them for both switches.
// JS: use `useMotion().still` for canvas / video / rAF loops (pause them when still, off-screen and on visibilitychange).
// framer-motion: App wraps the tree in <MotionConfig reducedMotion>, so transform + layout animations also stop when paused.

import { useMemo, useSyncExternalStore } from 'react'
import { useMediaQuery } from './hooks/useMediaQuery'

const STORAGE_KEY = 'pm-motion'
const listeners = new Set<() => void>()

function readInitialPaused(): boolean {
  if (typeof document === 'undefined') return false
  if (document.documentElement.getAttribute('data-motion') === 'paused') return true
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'paused'
  } catch {
    return false
  }
}

function applyAttribute(value: boolean): void {
  if (typeof document === 'undefined') return
  if (value) document.documentElement.setAttribute('data-motion', 'paused')
  else document.documentElement.removeAttribute('data-motion')
}

let paused = readInitialPaused()
applyAttribute(paused) // keeps the attribute right even when the inline script did not run (tests, embeds)

function emit(): void {
  listeners.forEach((listener) => listener())
}

/** The visitor's "Pause motion" switch. Persists in localStorage (try/catch) and mirrors to html[data-motion]. */
export function setMotionPaused(next: boolean): void {
  if (next === paused) return
  paused = next
  applyAttribute(next)
  try {
    if (next) window.localStorage.setItem(STORAGE_KEY, 'paused')
    else window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* private mode or blocked storage: the switch still works for this visit */
  }
  emit()
}

export const toggleMotionPaused = (): void => setMotionPaused(!paused)
export const getMotionPaused = (): boolean => paused

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Keep several tabs in sync.
if (typeof window !== 'undefined') {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return
    const next = event.newValue === 'paused'
    if (next === paused) return
    paused = next
    applyAttribute(next)
    emit()
  }
  window.addEventListener('storage', onStorage)
  import.meta.hot?.dispose(() => window.removeEventListener('storage', onStorage))
}

/** OS-level preference only. Prefer `useMotion().still` unless you specifically need to tell the two apart. */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

export interface MotionState {
  /** the OS asks for reduced motion */
  reduced: boolean
  /** the visitor pressed "Pause motion" */
  paused: boolean
  /** reduced || paused: stop every loop, parallax, autoplay and big transform */
  still: boolean
}

export function useMotion(): MotionState {
  const reduced = useReducedMotion()
  const isPaused = useSyncExternalStore(subscribe, getMotionPaused, () => false)
  return useMemo(() => ({ reduced, paused: isPaused, still: reduced || isPaused }), [reduced, isPaused])
}

/** Shared easings and springs (framer-motion). Overshoot only on physical objects: folders, stickers, stamps, tickets. */
export const ease = {
  out: [0.2, 0.8, 0.2, 1] as const,
  inOut: [0.65, 0, 0.25, 1] as const,
}

export const spring = {
  /** a folder / sheet moving like paper: settles with one small overshoot */
  folder: { type: 'spring', stiffness: 190, damping: 21, mass: 0.9 } as const,
  /** a tab popping out of a folder edge */
  tab: { type: 'spring', stiffness: 420, damping: 24, mass: 0.7 } as const,
  /** things that must not overshoot: menus, panels */
  calm: { type: 'spring', stiffness: 320, damping: 36, mass: 0.9 } as const,
}
