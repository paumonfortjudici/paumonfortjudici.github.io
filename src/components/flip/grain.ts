let cached: string | null = null

function toBlobUrl(dataUrl: string): string {
  // A data: URL inside a custom property is re-parsed on every style recalc of every element that uses it
  // (measured: 22 strips x 60 fps went from 7 ms to 17 ms per frame), a short blob: URL is not.
  const b64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return URL.createObjectURL(new Blob([bytes], { type: 'image/png' }))
}

/**
 * A tiny tiled paper noise (96 x 96 px, mostly transparent speckle), generated once and
 * shared by every book. Returns a CSS value for a custom property: url("blob:...").
 */
export function grainUrl(): string {
  if (cached !== null) return cached
  if (typeof document === 'undefined') return 'none'
  try {
    const size = 96
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('no 2d context')
    // deterministic noise so the paper never changes between visits
    let seed = 20261028
    const rnd = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
      return seed / 4294967296
    }
    const img = ctx.createImageData(size, size)
    for (let i = 0; i < size * size; i++) {
      const o = i * 4
      if (rnd() < 0.55) {
        img.data[o] = 46
        img.data[o + 1] = 30
        img.data[o + 2] = 16
        img.data[o + 3] = Math.floor(rnd() * 11)
      } else {
        img.data[o] = 255
        img.data[o + 1] = 250
        img.data[o + 2] = 238
        img.data[o + 3] = Math.floor(rnd() * 13)
      }
    }
    ctx.putImageData(img, 0, 0)
    cached = `url("${toBlobUrl(canvas.toDataURL('image/png'))}")`
  } catch {
    cached = 'none'
  }
  return cached
}
