// Shared behaviour of the deck's overlays (the About drawer, the contact sheet, the presenter):
//   - Escape closes the overlay first (the shell's Escape stack), and the world only on the next press
//   - focus moves in when it opens and goes back to the tab that opened it once the stage is live again
//   - Tab stays inside the overlay (the shell's own trap would walk out to its title tabs: this one stops the event first)
import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from 'react'
import { useWorldEscape } from '../WorldContext'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

const visible = (el: HTMLElement): boolean => !el.closest('[inert]') && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden'

export interface Modal {
  ref: RefObject<HTMLDivElement>
  onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void
}

export function useModal(open: boolean, close: () => void, firstFocus?: () => HTMLElement | null): Modal {
  const ref = useRef<HTMLDivElement>(null)
  const firstRef = useRef(firstFocus)
  firstRef.current = firstFocus
  useWorldEscape(open, close)

  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    const id = requestAnimationFrame(() => (firstRef.current?.() ?? ref.current)?.focus({ preventScroll: true }))
    return () => {
      cancelAnimationFrame(id)
      // wait until the stage is no longer inert, then hand focus back
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (opener && opener.isConnected && !opener.closest('[inert]')) opener.focus({ preventScroll: true })
        }),
      )
    }
  }, [open])

  const onKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab') return
    const root = ref.current
    if (!root) return
    event.stopPropagation() // the shell's focus trap must not see this Tab
    const nodes = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(visible)
    if (nodes.length === 0) {
      event.preventDefault()
      root.focus({ preventScroll: true })
      return
    }
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    const active = document.activeElement
    if (event.shiftKey && (active === first || active === root || !root.contains(active))) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && (active === last || !root.contains(active))) {
      event.preventDefault()
      first.focus()
    }
  }

  return { ref, onKeyDown }
}
