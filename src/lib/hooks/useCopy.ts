import { useCallback, useEffect, useRef, useState } from 'react'

/** Copies text. Uses the async Clipboard API, falls back to a hidden textarea + execCommand. Resolves to success. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* permission denied or insecure context: use the legacy path */
  }
  const previouslyFocused = document.activeElement as HTMLElement | null
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.setAttribute('aria-hidden', 'true')
  area.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none'
  document.body.appendChild(area)
  area.select()
  area.setSelectionRange(0, text.length)
  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }
  document.body.removeChild(area)
  previouslyFocused?.focus?.({ preventScroll: true })
  return ok
}

export interface UseCopy {
  /** true for `resetMs` after a successful copy: use it to flip a label ("Copy" -> "Copied") */
  copied: boolean
  /** copy `text` (or the override); resolves to whether it worked */
  copy: (override?: string) => Promise<boolean>
}

export function useCopy(text?: string, resetMs = 2200): UseCopy {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = useCallback(
    async (override?: string) => {
      const value = override ?? text ?? ''
      const ok = await copyToClipboard(value)
      if (ok) {
        setCopied(true)
        window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => setCopied(false), resetMs)
      }
      return ok
    },
    [text, resetMs],
  )

  return { copied, copy }
}
