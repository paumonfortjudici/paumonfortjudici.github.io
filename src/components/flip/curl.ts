/**
 * Geometry and shading of a turning sheet, no DOM.
 *
 * The leaf is a polyline of `n` equal strips seen from above (x along the page, z towards the viewer),
 * hinged at the spine (x = 0). Each strip has its own angle: angle 0 = lying on the right-hand page,
 * 90 = standing up, 180 = lying on the left-hand page. The curl is the difference between the angle of
 * the strip at the spine (the rigid rotation, t * 180 degrees) and the angle of the strip at the free
 * edge: the free edge leads when the sheet is pulled, so the paper bows like a real page.
 */

const D2R = Math.PI / 180

/** Diffuse light: almost overhead, a touch from the right, so a sheet that stands up goes darker (front and back). */
const LX = 0.14
const LZ = 0.99
/** Sheen: a lamp on the upper left; the half vector with the viewer (+z) decides where the gloss runs along the bend. */
const HX = -0.27
const HZ = 0.963
const FLAT_HALF = 0.5 + 0.5 * LZ
const HI_BASE = Math.pow(HZ, 38)
const DARK_MAX = 0.6
/** Occlusion between a standing sheet and the page under it, strongest at the hinge. */
const AO_MAX = 0.2

export interface CurlBuf {
  n: number
  /** Polyline nodes (n + 1), in px from the spine. */
  x: Float64Array
  z: Float64Array
  /** Angle of each strip in degrees, continuous in about [-20, 200]. */
  ang: Float64Array
  /** 1 when the strip shows its back face (angle > 90). */
  back: Uint8Array
  /** Shade (dark overlay alpha) and highlight alpha at the physical inner (0) and outer (1) end of each strip. */
  d0: Float64Array
  d1: Float64Array
  h0: Float64Array
  h1: Float64Array
  /** Silhouette of the sheet projected on the page below. */
  minX: number
  maxX: number
  maxZ: number
  edgeX: number
  edgeZ: number
}

export function makeBuf(n: number): CurlBuf {
  return {
    n,
    x: new Float64Array(n + 1),
    z: new Float64Array(n + 1),
    ang: new Float64Array(n),
    back: new Uint8Array(n),
    d0: new Float64Array(n),
    d1: new Float64Array(n),
    h0: new Float64Array(n),
    h1: new Float64Array(n),
    minX: 0,
    maxX: 0,
    maxZ: 0,
    edgeX: 0,
    edgeZ: 0,
  }
}

let shDark = 0
let shHi = 0

/** Lambert (half-lambert, paper scatters light) + a narrow sheen. Results in shDark / shHi. */
function shade(theta: number, back: boolean, gloss: number): void {
  const th = theta * D2R
  const s = Math.sin(th)
  const c = Math.cos(th)
  const nx = back ? s : -s
  const nz = back ? -c : c
  const ndl = nx * LX + nz * LZ
  const half = 0.5 + 0.5 * ndl
  const d = (FLAT_HALF - half) / FLAT_HALF
  shDark = (d > 0 ? d : 0) * DARK_MAX
  const ndh = nx * HX + nz * HZ
  if (ndh > 0.5 && gloss > 0) {
    const raw = Math.pow(ndh, 38)
    const h = (raw - HI_BASE) / (1 - HI_BASE)
    shHi = h > 0 ? h * gloss * 0.7 : 0
  } else shHi = 0
}

/**
 * @param t       turn progress 0..1 (0 = on the right, 1 = on the left)
 * @param sw      width of one strip in px (page width / n)
 * @param amp     signed bend in degrees at the free edge (positive: the edge leads a forward turn)
 * @param shape   how the bend is distributed along the sheet (1 = linear, 2 = mostly at the free end)
 */
export function solveCurl(b: CurlBuf, t: number, sw: number, amp: number, shape: number, gloss: number, fan = 0): void {
  const n = b.n
  const tt = t < 0 ? 0 : t > 1 ? 1 : t
  const phi = tt * 180
  const bend = amp * Math.pow(Math.sin(Math.PI * tt), 0.9)
  let x = 0
  let z = 0
  let minX = 0
  let maxX = 0
  let maxZ = 0
  b.x[0] = 0
  b.z[0] = 0
  for (let j = 0; j < n; j++) {
    const a = phi + bend * Math.pow((j + 0.5) / n, shape)
    const r = a * D2R
    let dx = sw * Math.cos(r)
    let dz = sw * Math.sin(r)
    if (z + dz < 0) {
      // a sheet cannot pass through the page below: it lies flat on it
      dz = -z
      const rem = sw * sw - dz * dz
      dx = (Math.cos(r) < 0 ? -1 : 1) * Math.sqrt(rem > 0 ? rem : 0)
    }
    let ang = Math.atan2(dz, dx) / D2R
    if (ang < -90) ang += 360
    b.ang[j] = ang
    b.back[j] = ang > 90 ? 1 : 0
    x += dx
    z += dz
    b.x[j + 1] = x
    b.z[j + 1] = z
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (z > maxZ) maxZ = z
  }
  b.minX = minX
  b.maxX = maxX
  b.maxZ = maxZ
  b.edgeX = x
  b.edgeZ = z
  // shading at the two ends of every strip, from the angle at the nodes (smooth across strips)
  const lift = Math.sin(phi * D2R)
  for (let j = 0; j < n; j++) {
    const back = b.back[j] === 1
    // `fan` spreads the two ends of a rigid sheet by a few degrees: a moving gradient across a flat leaf
    const aIn = (j === 0 ? b.ang[0]! : (b.ang[j - 1]! + b.ang[j]!) * 0.5) - fan
    const aOut = (j === n - 1 ? b.ang[n - 1]! : (b.ang[j]! + b.ang[j + 1]!) * 0.5) + fan
    shade(aIn, back, gloss)
    b.d0[j] = shDark + AO_MAX * lift * Math.pow(1 - j / n, 1.8)
    b.h0[j] = shHi
    shade(aOut, back, gloss)
    b.d1[j] = shDark + AO_MAX * lift * Math.pow(1 - (j + 1) / n, 1.8)
    b.h1[j] = shHi
  }
}

export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v)
export const smoothstep = (a: number, b: number, v: number): number => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}
