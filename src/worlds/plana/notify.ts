// Copy feedback: the site toast (src/components/chrome/toast.ts, drawn by ToastLayer above every world, so it is never trapped under the world's
// own stacking context). The Colour plate calls notify('Poppy #E5502F', { swatch: '#E5502F', label: 'Copied' }).
import { toast } from '../../components/chrome/toast'

export interface NotifyOptions {
  /** a CSS colour shown as a chip on the toast (the colour that was just copied) */
  swatch?: string
  /** a small typed line above the message, e.g. 'Copied' */
  label?: string
}

/** Say something short. Safe to call from any handler. */
export function notify(message: string, options?: NotifyOptions): void {
  toast(message, options)
}
