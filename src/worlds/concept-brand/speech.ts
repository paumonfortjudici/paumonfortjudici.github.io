// The mascots' reactions: on hover, focus or tap a character hops, shows pose B and a speech bubble for about 1.2 s.
import { useCallback, useEffect, useRef, useState } from 'react'
import type { MascotId } from './data'

export const SPEECH_MS = 1200

const none = (): Record<MascotId, boolean> => ({ gotet: false, oliva: false, sifo: false, xip: false })
const zero = (): Record<MascotId, number> => ({ gotet: 0, oliva: 0, sifo: 0, xip: 0 })

export interface Speech {
  /** in pose B with a bubble right now */
  active: Record<MascotId, boolean>
  /** counts up on every trigger: the parity restarts the hop animation without remounting the images */
  hop: Record<MascotId, number>
  /** the latest one, for the polite live region */
  said: { id: MascotId; n: number } | null
  trigger: (id: MascotId) => void
}

export function useSpeech(): Speech {
  const [active, setActive] = useState(none)
  const [hop, setHop] = useState(zero)
  const [said, setSaid] = useState<Speech['said']>(null)
  const timers = useRef<Partial<Record<MascotId, number>>>({})

  const trigger = useCallback((id: MascotId) => {
    window.clearTimeout(timers.current[id])
    setActive((a) => (a[id] ? a : { ...a, [id]: true }))
    setHop((h) => ({ ...h, [id]: h[id] + 1 }))
    setSaid((s) => ({ id, n: (s?.n ?? 0) + 1 }))
    timers.current[id] = window.setTimeout(() => setActive((a) => ({ ...a, [id]: false })), SPEECH_MS)
  }, [])

  useEffect(
    () => () => {
      Object.values(timers.current).forEach((t) => window.clearTimeout(t))
    },
    [],
  )

  return { active, hop, said, trigger }
}

/** warm the B poses once the browser is idle, so the first hop never waits for a download */
export function preloadPoses(urls: string[]): () => void {
  const imgs: HTMLImageElement[] = []
  const run = () => {
    for (const url of urls) {
      const img = new Image()
      img.decoding = 'async'
      img.src = url
      imgs.push(img)
    }
  }
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void }
  if (w.requestIdleCallback) {
    const id = w.requestIdleCallback(run, { timeout: 2500 })
    return () => w.cancelIdleCallback?.(id)
  }
  const id = window.setTimeout(run, 1200)
  return () => window.clearTimeout(id)
}
