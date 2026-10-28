// Lazy faces. The three core families come from fonts.css (latin only, preloaded in index.html).
// Everything else loads on demand through Vite's dynamic CSS imports, so it never touches the first paint.

let handPromise: Promise<void> | null = null

/**
 * Gochi Hand (marker, `.t-hand`) + Reenie Beanie (thin pen, `.t-hand-thin`).
 * App calls this once when the browser is idle; a section may also call it early (it is idempotent).
 * Resolves when the CSS is in; the glyph files are fetched by the browser the first time text uses them.
 */
export function loadHandFonts(): Promise<void> {
  if (!handPromise) {
    handPromise = Promise.all([
      import('@fontsource/gochi-hand/latin-400.css'),
      import('@fontsource/reenie-beanie/latin-400.css'),
    ])
      .then(() => undefined)
      .catch(() => {
        // Offline or blocked: the CSS stack falls back to the system handwriting faces, so nothing breaks.
        handPromise = null
      })
  }
  return handPromise
}

/**
 * Resolves when the given font specs ('800 1em "Sora Variable"') are loaded, or after `timeoutMs`, whichever is first.
 * Never rejects. Used to keep a lazy world behind its film-leader until its display face is ready, so the
 * big title does not flash a fallback face.
 */
export function whenFontsLoaded(specs: string[], timeoutMs = 900): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document) || specs.length === 0) return Promise.resolve()
  const loads = Promise.all(specs.map((spec) => document.fonts.load(spec).catch(() => []))).then(() => undefined)
  const timeout = new Promise<void>((resolve) => window.setTimeout(resolve, timeoutMs))
  return Promise.race([loads, timeout])
}
