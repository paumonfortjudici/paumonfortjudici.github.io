// Guarded access to the chrome agent's global toast (src/components/chrome/toast.ts): `toast(message, { swatch, label })`.
// import.meta.glob resolves at build time and is simply empty when that file does not exist, so this world never breaks the
// build or the page if the toast is renamed or removed; the swatch readout on the poster back stays as the visible feedback.
type ToastFn = (message: string, options?: { swatch?: string; label?: string; tone?: 'butter' }) => void

const loaders = import.meta.glob<Record<string, unknown>>('../../components/chrome/toast.ts')

/** Shows "Copied #065D8C" as the shared paper tag when it is available. Resolves to whether a toast was shown. */
export async function notifyCopied(hex: string, name: string): Promise<boolean> {
  try {
    const load = Object.values(loaders)[0]
    if (!load) return false
    const mod = await load()
    const fn = mod.toast
    if (typeof fn !== 'function') return false
    ;(fn as ToastFn)(`Copied ${hex}`, { swatch: hex, label: name, tone: 'butter' })
    return true
  } catch {
    return false
  }
}
