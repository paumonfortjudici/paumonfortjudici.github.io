// useReturn: puts the visitor back where they were when a folder opened from THIS sheet is closed.
//
// The router restores the scroll position and the shell restores focus, and from a plain URL that is enough. But a visitor who arrived
// through the nav (the URL is `#catalog`) gets the browser's own "scroll to the fragment" on top of it when the world closes: a smooth
// glide to the top of this sheet, and focus dropped on <body>. The band they had open is then far below them.
// (Reported to the lead as a router issue: docs/api/sections-catalog.md section 9. Once the router waits for the browser's own scroll
// this hook finds nothing to correct and does nothing.)
//
// `rememberOpen(button)` is called in the click handler of OPEN FOLDER, `useReturn()` runs in the Catalog: when the route goes back to
// the page it asserts the remembered scroll position on every frame while the browser's glide plays out (a programmatic scroll cancels
// it, and a correction made in the frame callback lands before the frame is painted, so nothing is seen to move), then puts focus back
// on the button if nothing else has it. Any wheel, touch or key hands the page back at once.
import { useEffect } from 'react'
import { useRoute } from '@/lib/router'

const remembered: { y: number; opener: HTMLElement | null } = { y: -1, opener: null }

/** call before openWork(): where the page is and what the visitor pressed */
export function rememberOpen(opener: HTMLElement | null): void {
  remembered.y = window.scrollY
  remembered.opener = opener
}

const FRAMES_MS = 900
const HANDOVER = ['wheel', 'touchstart', 'keydown'] as const

export function useReturn(): void {
  const route = useRoute()

  useEffect(() => {
    if (route.kind !== 'home' || remembered.y < 0) return
    const { y, opener } = remembered
    remembered.y = -1
    remembered.opener = null
    const t0 = performance.now()
    let raf = 0
    let handedOver = false
    const off = (): void => {
      for (const type of HANDOVER) window.removeEventListener(type, hand)
    }
    function hand(): void {
      handedOver = true
      cancelAnimationFrame(raf)
      off()
    }
    for (const type of HANDOVER) window.addEventListener(type, hand, { passive: true })
    const tick = (): void => {
      if (Math.abs(window.scrollY - y) > 1) window.scrollTo({ top: y, left: 0, behavior: 'instant' })
      if (performance.now() - t0 < FRAMES_MS) {
        raf = requestAnimationFrame(tick)
        return
      }
      off()
      const active = document.activeElement
      if (!handedOver && opener?.isConnected && (!active || active === document.body)) opener.focus({ preventScroll: true })
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      off()
    }
  }, [route])
}
