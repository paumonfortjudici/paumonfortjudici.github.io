// Global toast store. No React in here, so any module can import `toast` (Contact: 'Email copied — talk soon!',
// Plana: a copied colour). The visual is <Toast/> (a paper luggage tag), mounted once in App.
//
//   import { toast } from '../chrome/toast'
//   toast(CONTACT.toast)
//   toast('Copied #E5502F', { swatch: '#E5502F', tone: 'butter' })
//
// One tag at a time: a new toast replaces the one on screen (and restarts the timer).

import { loadHandFonts } from '../../styles/fonts'
import type { ToneName } from '../primitives/util'

export interface ToastOptions {
  /** how long the tag stays, ms. Default 2600. */
  duration?: number
  /** paper colour of the tag (ink text is chosen for contrast). Default 'butter'. */
  tone?: ToneName
  /** a CSS colour shown as a little chip on the tag: the colour that was just copied */
  swatch?: string
  /** a small typed line above the message (label font), e.g. 'Copied' */
  label?: string
}

export interface ToastItem {
  id: number
  message: string
  tone: ToneName
  swatch?: string
  label?: string
  duration: number
}

let current: ToastItem | null = null
let nextId = 1
let timer = 0
const listeners = new Set<() => void>()

const emit = () => listeners.forEach((l) => l())

export function dismissToast(): void {
  window.clearTimeout(timer)
  if (current) {
    current = null
    emit()
  }
}

export function toast(message: string, options: ToastOptions = {}): void {
  if (typeof window === 'undefined' || !message) return
  void loadHandFonts() // the tag is written in the marker face (idempotent: App already asked for it when the browser was idle)
  const duration = options.duration ?? 2600
  current = { id: nextId++, message, tone: options.tone ?? 'butter', swatch: options.swatch, label: options.label, duration }
  window.clearTimeout(timer)
  timer = window.setTimeout(dismissToast, duration)
  emit()
}

export const getToast = (): ToastItem | null => current

export function subscribeToast(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
