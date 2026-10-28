import { useEffect, useRef } from 'react'

export interface UseKeyOptions {
  /** skip while focus is in an input, textarea, select or contenteditable (keeps typing safe). Default true. */
  ignoreTyping?: boolean
  /** turn the listener off without unmounting. Default true. */
  enabled?: boolean
  /** 'keydown' (default) or 'keyup' */
  event?: 'keydown' | 'keyup'
  /** react to held-down auto-repeat too (carousels). Default false. */
  repeat?: boolean
  /** also fire with Ctrl / Meta / Alt held. Default false. AltGr (how `[` and `]` are typed on Spanish layouts) is always fine. */
  allowModifiers?: boolean
  /** call preventDefault() when the key matched. Default false. */
  preventDefault?: boolean
  /** where to listen. Default window. */
  target?: Window | Document | HTMLElement | null
}

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

const NON_TEXT_INPUT = new Set(['range', 'checkbox', 'radio', 'button', 'submit', 'reset', 'image', 'file', 'color'])

/** Text-entry fields only: a focused range slider, checkbox or button is not typing, so `[` and `]` may still hop between folders. */
export function isTextEntryTarget(target: EventTarget | null): boolean {
  if (!isTypingTarget(target)) return false
  return !(target instanceof HTMLInputElement && NON_TEXT_INPUT.has(target.type))
}

const matches = (event: KeyboardEvent, keys: string[]): boolean =>
  keys.some((key) => event.key === key || (key.length === 1 && event.key.toLowerCase() === key.toLowerCase()))

/**
 * Global keyboard shortcut. `key` follows KeyboardEvent.key ('Escape', ']', 'ArrowLeft', 'f').
 * The handler is skipped when another handler already called preventDefault() on the event (so an inner lightbox can
 * swallow Escape before the world shell sees it), during IME composition, and while typing (see options).
 * Never bind Alt+Arrow: that is the browser's Back / Forward.
 */
export function useKey(key: string | string[], handler: (event: KeyboardEvent) => void, options: UseKeyOptions = {}): void {
  const { ignoreTyping = true, enabled = true, event: eventName = 'keydown', repeat = false, allowModifiers = false, preventDefault = false, target } = options
  const handlerRef = useRef(handler)
  handlerRef.current = handler
  const keysKey = Array.isArray(key) ? key.join('\u0000') : key

  useEffect(() => {
    if (!enabled) return
    const keys = keysKey.split('\u0000')
    const node: Window | Document | HTMLElement | null = target === undefined ? window : target
    if (!node) return
    const listener = (raw: Event) => {
      const event = raw as KeyboardEvent
      if (event.defaultPrevented || event.isComposing) return
      if (!repeat && event.repeat) return
      const modified = event.ctrlKey || event.metaKey || event.altKey
      if (modified && !allowModifiers && !event.getModifierState('AltGraph')) return
      if (ignoreTyping && isTypingTarget(event.target)) return
      if (!matches(event, keys)) return
      if (preventDefault) event.preventDefault()
      handlerRef.current(event)
    }
    node.addEventListener(eventName, listener)
    return () => node.removeEventListener(eventName, listener)
  }, [keysKey, enabled, eventName, ignoreTyping, repeat, allowModifiers, preventDefault, target])
}
