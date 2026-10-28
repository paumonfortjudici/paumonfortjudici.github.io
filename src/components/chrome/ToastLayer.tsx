// A paper luggage tag that slides in from the bottom edge, stays a moment and slides out. One tag at a time (see toast.ts).
// The wrapper is a persistent live region (role="status", aria-live="polite"): it is in the page before the first message,
// so screen readers announce the text that appears in it. It sits outside #app-root, so it still shows (and is announced)
// above an open folder world. z-index 90 (above the world and the grain, below the intro and the cursor).

import { useEffect, useState, useSyncExternalStore, type CSSProperties } from 'react'
import { TONES } from '../primitives/util'
import { getToast, subscribeToast, type ToastItem } from './toast'
import './chrome.css'

const LEAVE_MS = 320

export default function Toast() {
  const item = useSyncExternalStore(subscribeToast, getToast, () => null)
  const [shown, setShown] = useState<ToastItem | null>(null)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (item) {
      setShown(item)
      setLeaving(false)
      return
    }
    if (!shown) return
    setLeaving(true)
    const id = window.setTimeout(() => setShown(null), LEAVE_MS)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item])

  const palette = shown ? TONES[shown.tone] : undefined
  const vars = palette ? ({ '--c': palette.color, '--on': palette.ink } as CSSProperties) : undefined

  return (
    <div className="pm-toast" role="status" aria-live="polite" aria-atomic="true">
      {shown && (
        <div key={shown.id} className="pm-toast__tag" data-leaving={leaving ? 'true' : undefined} style={vars}>
          <svg className="pm-toast__string" viewBox="0 0 60 34" aria-hidden="true" focusable="false">
            <path className="pm-toast__rope" d="M58 30C42 31 30 26 22 17C16 10 9 4 3 7C-1 10 4 17 10 17" />
            <path className="pm-toast__core" d="M58 30C42 31 30 26 22 17C16 10 9 4 3 7C-1 10 4 17 10 17" />
          </svg>
          <div className="pm-toast__paper">
            {shown.swatch && <span className="pm-toast__swatch" style={{ background: shown.swatch }} aria-hidden="true" />}
            <span className="pm-toast__text">
              {shown.label ? (
                <span className="pm-toast__label">{shown.label}</span>
              ) : (
                shown.to && <span className="pm-toast__label pm-toast__to">{`To: ${shown.to}`}</span>
              )}
              <span className="pm-toast__msg">{shown.message}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
