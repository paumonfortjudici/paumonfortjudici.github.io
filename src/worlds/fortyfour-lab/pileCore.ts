// Tufted pile, generated as raw pixels. Pure (no DOM), so it runs the same in a worker and on the main thread.
// Two tiles: the opaque tan wall, and a transparent "fuzz" that sits over any flat colour (border bands, big letters) so the
// colour reads as yarn. Everything wraps at the tile edges, so the tile repeats seamlessly. Seeded: the same tile on every visit.
// The tufts are stamped straight into the pixel buffer (no per-stroke canvas calls).

export interface PileSpec {
  /** css px of one tile edge */
  size: number
  seed: number
  /** opaque base colour, or null for a transparent overlay */
  base: string | null
  lights: string[]
  darks: string[]
  /** tufts per css px² */
  density: number
  /** overall strength of the speckle (overlay tiles need less) */
  alpha: number
}

export const WALL_PILE: PileSpec = {
  size: 320,
  seed: 4401,
  base: '#c9a269',
  lights: ['#d7b67d', '#dfc08a', '#e6cb99', '#ecd5a8'],
  darks: ['#b78f58', '#a98350', '#997443', '#85632f'],
  density: 0.34,
  alpha: 1,
}

export const FUZZ_PILE: PileSpec = {
  size: 200,
  seed: 77,
  base: null,
  lights: ['#ffffff', '#fff4d6', '#ffe9b8'],
  darks: ['#3a2a14', '#5a3d18', '#2d2d2d'],
  density: 0.26,
  alpha: 0.5,
}

const mulberry32 = (seed: number) => {
  let a = seed | 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type RGB = [number, number, number]
const rgb = (hex: string): RGB => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]

/** a wrapped bilinear value-noise field in [-1, 1], `cells` cells across */
function noiseField(rnd: () => number, cells: number): (u: number, v: number) => number {
  const grid = new Float32Array(cells * cells)
  for (let i = 0; i < grid.length; i++) grid[i] = rnd() * 2 - 1
  const at = (x: number, y: number) => grid[(((y % cells) + cells) % cells) * cells + (((x % cells) + cells) % cells)]
  return (u, v) => {
    const x = u * cells
    const y = v * cells
    const x0 = Math.floor(x)
    const y0 = Math.floor(y)
    const fx = x - x0
    const fy = y - y0
    const sx = fx * fx * (3 - 2 * fx)
    const sy = fy * fy * (3 - 2 * fy)
    const a = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * sx
    const b = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * sx
    return a + (b - a) * sy
  }
}

/** RGBA pixels of one square tile, `n` px a side (n = size * dpr) */
export function renderPile(spec: PileSpec, dpr: number): { n: number; data: Uint8ClampedArray } {
  const N = Math.round(spec.size * dpr)
  const data = new Uint8ClampedArray(N * N * 4)
  const rnd = mulberry32(spec.seed)
  const opaque = spec.base !== null

  if (spec.base) {
    // uneven pile height and light: two octaves of soft clumps over the base colour
    const [br, bg, bb] = rgb(spec.base)
    const big = noiseField(rnd, 7)
    const small = noiseField(rnd, 23)
    for (let y = 0; y < N; y++) {
      const v = y / N
      for (let x = 0; x < N; x++) {
        const u = x / N
        const f = 1 + big(u, v) * 0.055 + small(u, v) * 0.03
        const i = (y * N + x) * 4
        data[i] = br * f
        data[i + 1] = bg * f
        data[i + 2] = bb * f
        data[i + 3] = 255
      }
    }
  }

  /** blend one pixel (wrapped) over what is there */
  const put = (x: number, y: number, c: RGB, a: number) => {
    const px = x < 0 ? x + N : x >= N ? x - N : x
    const py = y < 0 ? y + N : y >= N ? y - N : y
    const i = (py * N + px) * 4
    if (opaque) {
      data[i] += (c[0] - data[i]) * a
      data[i + 1] += (c[1] - data[i + 1]) * a
      data[i + 2] += (c[2] - data[i + 2]) * a
    } else {
      const A = data[i + 3] / 255
      const out = a + A * (1 - a)
      if (out > 0) {
        data[i] = (c[0] * a + data[i] * A * (1 - a)) / out
        data[i + 1] = (c[1] * a + data[i + 1] * A * (1 - a)) / out
        data[i + 2] = (c[2] * a + data[i + 2] * A * (1 - a)) / out
        data[i + 3] = out * 255
      }
    }
  }

  const lights = spec.lights.map(rgb)
  const darks = spec.darks.map(rgb)
  const count = Math.round(spec.size * spec.size * spec.density)
  // the pile leans one way, like wool brushed with a hand
  const lean = -0.62
  for (let n = 0; n < count; n++) {
    const x = rnd() * N
    const y = rnd() * N
    const dark = rnd() < 0.3
    const color = dark ? darks[Math.floor(rnd() * darks.length)] : lights[Math.floor(rnd() * lights.length)]
    const strength = (dark ? 0.22 + rnd() * 0.4 : 0.3 + rnd() * 0.5) * spec.alpha
    if (rnd() < 0.62) {
      // a cut tuft seen from above: a tiny leaning stroke, 1 or 2 css px thick, softer at both ends
      const len = (2.4 + rnd() * 4.8) * dpr
      const ang = lean + (rnd() - 0.5) * 1.5
      const thick = rnd() < 0.5 ? 1 : Math.max(1, Math.round(1.6 * dpr))
      const steps = Math.max(2, Math.round(len))
      const dx = (Math.cos(ang) * len) / steps
      const dy = (Math.sin(ang) * len) / steps
      for (let s = 0; s <= steps; s++) {
        const t = s / steps
        const a = strength * (0.55 + 0.45 * Math.sin(Math.PI * t))
        const px = Math.round(x + dx * s)
        const py = Math.round(y + dy * s)
        for (let ox = 0; ox < thick; ox++) for (let oy = 0; oy < thick; oy++) put(px + ox, py + oy, color, a)
      }
    } else {
      // a loop catching the light, or the gap between two tufts
      const r = Math.max(1, Math.round((0.6 + rnd() * 1.1) * dpr))
      const px = Math.round(x)
      const py = Math.round(y)
      for (let ox = -r; ox <= r; ox++) {
        for (let oy = -r; oy <= r; oy++) {
          const d = Math.hypot(ox, oy) / (r + 0.5)
          if (d <= 1) put(px + ox, py + oy, color, strength * (1 - d * 0.6))
        }
      }
    }
  }
  return { n: N, data }
}
