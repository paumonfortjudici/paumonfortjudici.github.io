// Tufted pile as a CSS background: the tile pixels come from pileCore (rendered in a worker, so the folder-open transition never
// stutters), are put on a canvas and encoded to a blob: URL (never re-parsed on style recalcs). Cached for the page lifetime.
// If a worker cannot be created the same pixels are rendered on the main thread.
import { FUZZ_PILE, WALL_PILE, renderPile, type PileSpec } from './pileCore'

export { FUZZ_PILE, WALL_PILE }

let worker: Worker | null | undefined
const waiting = new Map<number, (tile: { n: number; buffer: ArrayBufferLike }) => void>()
let nextId = 1

function getWorker(): Worker | null {
  if (worker !== undefined) return worker
  try {
    worker = new Worker(new URL('./pile.worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (event: MessageEvent<{ id: number; n: number; buffer: ArrayBufferLike }>) => {
      waiting.get(event.data.id)?.(event.data)
      waiting.delete(event.data.id)
      // nothing left to draw: let the thread go (a later tile would simply start a new one)
      if (waiting.size === 0) {
        worker?.terminate()
        worker = undefined
      }
    }
    worker.onerror = () => {
      // fall back for everything still waiting and for later calls
      worker?.terminate()
      worker = null
      waiting.forEach((resolve) => resolve({ n: 0, buffer: new ArrayBuffer(0) }))
      waiting.clear()
    }
  } catch {
    worker = null
  }
  return worker
}

function pixels(spec: PileSpec, dpr: number): Promise<{ n: number; buffer: ArrayBufferLike }> {
  const w = getWorker()
  if (!w) {
    const { n, data } = renderPile(spec, dpr)
    return Promise.resolve({ n, buffer: data.buffer })
  }
  return new Promise((resolve) => {
    const id = nextId++
    waiting.set(id, (tile) => {
      if (tile.n) resolve(tile)
      else {
        const { n, data } = renderPile(spec, dpr)
        resolve({ n, buffer: data.buffer })
      }
    })
    w.postMessage({ id, spec, dpr })
  })
}

const cache = new Map<string, Promise<string>>()

/** A blob: URL of the tile (empty string when canvas is unavailable). */
export function pileUrl(spec: PileSpec): Promise<string> {
  const key = `${spec.seed}:${spec.size}`
  let pending = cache.get(key)
  if (!pending) {
    const dpr = Math.min(2, Math.max(1, Math.round(window.devicePixelRatio || 1)))
    pending = pixels(spec, dpr)
      .then(
        ({ n, buffer }) =>
          new Promise<string>((resolve) => {
            const canvas = document.createElement('canvas')
            canvas.width = n
            canvas.height = n
            const g = canvas.getContext('2d')
            if (!g) return resolve('')
            g.putImageData(new ImageData(new Uint8ClampedArray(buffer as ArrayBuffer), n, n), 0, 0)
            canvas.toBlob((blob) => resolve(blob ? URL.createObjectURL(blob) : ''), 'image/png')
          }),
      )
      .catch(() => '')
    cache.set(key, pending)
  }
  return pending
}
