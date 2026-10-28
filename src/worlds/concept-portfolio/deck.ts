// Shared state of the deck world, handed down through a context so the lane, the presenter and the panels stay in step.
import { createContext, useContext, useEffect, type RefObject } from 'react'
import type { Hotspot } from './data'

export interface PopState {
  key: number
  slide: number
  word: string
  /** percent of the frame */
  x: number
  y: number
}

export interface Deck {
  /** the slide in the middle of the lane (0-based) */
  index: number
  still: boolean
  /** a mouse or trackpad is the main pointer: the hover loupe is available */
  fine: boolean
  narrow: boolean
  notes: boolean
  sound: boolean
  /** the fixed loupe (keyboard / touch alternative) is on, at `zoomPt` (percent of the frame) */
  zoom: boolean
  zoomPt: { x: number; y: number }
  setZoomPt: (point: { x: number; y: number }) => void
  openPin: string | null
  setOpenPin: (id: string | null) => void
  pop: PopState | null
  /** a hotspot was pressed on slide n (1-based) */
  hit: (slideN: number, spot: Hotspot) => void
  goTo: (index: number, options?: { instant?: boolean }) => void
}

export const DeckContext = createContext<Deck | null>(null)

export function useDeck(): Deck {
  const value = useContext(DeckContext)
  if (!value) throw new Error('useDeck() needs the deck world')
  return value
}

export const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value))

/** React 18 has no typed `inert`: set the attribute from an effect (inert = not focusable, not clickable, not read) */
export function useInert(ref: RefObject<HTMLElement>, inert: boolean): void {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (inert) el.setAttribute('inert', '')
    else el.removeAttribute('inert')
  }, [ref, inert])
}
