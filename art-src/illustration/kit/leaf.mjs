// leaf.mjs - a procedural monstera leaf for the doodle stickers (used by sticker-04).
//
//   import { monstera } from './kit/leaf.mjs'
//   const lf = monstera({ L: 420, W: 400, seed: 3 })      // leaf in its own frame: petiole point at (0,0), tip at (0,-L)
//   lf.outline  -> closed path (heart base, plump rounded lobes, deep slits with round ends)   lf.rib -> midrib   lf.veins -> side veins
//   lf.holes    -> [{cx,cy,rx,ry,rot}] fenestrations between midrib and slits           lf.env(t) -> half width at t (0 base .. 1 tip)
//
// The lobes are hand-placed key points fed to smooth(); every slit is a straight-sided cut with a rounded end, which is what makes
// the monstera read at thumbnail size. The slits run from the margin towards the base of the midrib, so the lobes fan out like fingers.
import { smooth, rng, fmt } from './pen.mjs'

const unit = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l] }
const P = (p) => `${fmt(p[0])} ${fmt(p[1])}`
/** smooth() output without its leading "M x y" (so it can continue a path) */
const cont = (d) => d.slice(d.indexOf('C'))

/**
 * @param {number} L length (petiole point -> tip), W maximum width
 * @param {number[]} slits positions (0..1 along the midrib) of the slits; the left side gets a jittered copy
 * @param {number} depth slit depth as a fraction of the local half width, slitW opening width in px at the margin
 * @param {number} curl bends the midrib: the tip moves sideways by curl * L
 */
export function monstera({ L = 420, W = 400, slits = [0.3, 0.5, 0.7], depth = 0.58, slitW = 40, seed = 1, jitter = 0.03, holes = 2, curl = 0, slant = 0.55, veins: veinMode = 'all', veinReach = 0.66 } = {}) {
  const R = rng(seed)
  const hw = W / 2
  // ovate heart envelope: rounded shoulders at ~40 % of the length, a taper to a pointed tip
  const env = (t) => {
    if (t <= 0.4) return hw * Math.sqrt(Math.max(0, 1 - Math.pow((0.4 - t) / 0.4, 2.2)))
    return hw * Math.pow(Math.max(0, 1 - Math.pow((t - 0.4) / 0.6, 1.45)), 0.8)
  }
  const mid = (t) => curl * L * t * t
  const pt = (t, side, k = 1) => [mid(t) + side * env(t) * k, -L * t]

  /** one side as a list of segments, base -> tip */
  const half = (side) => {
    const seq = []
    seq.push({ k: 'c', pts: [[side * 4, -L * 0.13], [side * hw * 0.2, -L * 0.095], [side * hw * 0.5, -L * 0.04], [side * hw * 0.8, -L * 0.045], [side * hw * 0.97, -L * 0.13]] })
    let t = 0.24
    let prevP = seq[0].pts[seq[0].pts.length - 1]                // end point of the previous segment (every lobe must start exactly there)
    const list = slits.map((s) => s + (R() - 0.5) * jitter * 2)
    list.forEach((s) => {
      const dt = (slitW / L) * 0.5
      const e0 = pt(s - dt, side), e1 = pt(s + dt, side), E = pt(s, side)
      const dep = depth * env(s) * (0.92 + R() * 0.16)
      const dir = unit([-side * 1, slant])                     // into the leaf and DOWN towards the base: the lobes fan out like fingers
      const n = [-dir[1] * side * -1, dir[0] * side * -1]       // across the slit
      const T = [E[0] + dir[0] * dep, E[1] + dir[1] * dep]
      const r = slitW * 0.3
      const side0 = Math.sign((e0[0] - e1[0]) * n[0] + (e0[1] - e1[1]) * n[1]) || -1   // which end of the cap is nearer e0
      const TL = [T[0] + n[0] * r * side0, T[1] + n[1] * r * side0], TR = [T[0] - n[0] * r * side0, T[1] - n[1] * r * side0]
      const kk = r * 1.33
      const c1 = [TL[0] + dir[0] * kk, TL[1] + dir[1] * kk], c2 = [TR[0] + dir[0] * kk, TR[1] + dir[1] * kk]
      // lobe between the previous slit (or the basal lobe) and this slit
      const lobeT = (t + (s - dt)) / 2
      seq.push({ k: 'c', pts: [prevP, pt(lobeT, side, 1.055), e0] })
      seq.push({ k: 's', e0, TL, TR, e1, c1, c2 })
      prevP = e1
      t = s + dt
    })
    seq.push({ k: 'c', pts: [prevP, pt((t + 0.9) / 2, side, 1.04), pt(0.94, side, 0.96)] })
    return seq
  }
  // walk the right side up, the left side down
  const emit = (seq, rev) => {
    let d = ''
    const list = rev ? seq.slice().reverse() : seq
    for (const sg of list) {
      if (sg.k === 'c') {
        const pts = rev ? sg.pts.slice().reverse() : sg.pts
        d += cont(smooth(pts))
      } else if (!rev) d += `L${P(sg.TL)}C${P(sg.c1)} ${P(sg.c2)} ${P(sg.TR)}L${P(sg.e1)}`
      else d += `L${P(sg.TR)}C${P(sg.c2)} ${P(sg.c1)} ${P(sg.TL)}L${P(sg.e0)}`
    }
    return d
  }
  const rightSeq = half(1), leftSeq = half(-1)
  // sinus -> up the right side -> tip -> down the left side -> sinus. The basal piece is a curve starting AT the sinus, so it supplies the M.
  const tip = [mid(1), -L]
  const startR = rightSeq[0].pts[0]
  const startL = leftSeq[0].pts[0]
  let d = `M${P(startR)}`
  d += cont(smooth(rightSeq[0].pts))
  for (const sg of rightSeq.slice(1)) d += emit([sg], false)
  d += `L${P(tip)}`
  // left side, tip -> base: reverse the segments (the basal piece last, ending at the sinus)
  const leftBody = leftSeq.slice(1)
  d += emit(leftBody, true)
  d += cont(smooth(leftSeq[0].pts.slice().reverse()))
  d += 'Z'
  const outline = d

  const rib = smooth([[0, 0], [mid(0.3), -L * 0.3], [mid(0.6), -L * 0.6], [mid(0.84), -L * 0.84]])
  // side veins: one per lobe, running parallel to the slits (so each stays centred in its lobe): from the midrib to ~70 % of the way to the margin
  const lobeTs = slits.length
    ? [(0.16 + slits[0]) / 2, ...slits.slice(1).map((s, i) => (slits[i] + s) / 2), (slits[slits.length - 1] + 0.88) / 2]
    : [0.2, 0.34, 0.5, 0.66]                                  // a young, unslit leaf: just three pairs of veins
  const veins = []
  for (const side of [1, -1]) {
    const vl = lobeTs.slice(1)
    const pick = veinMode === 'few' ? vl.filter((_, i) => i % 2 === 0 || i === vl.length - 1) : veinMode === 'none' ? [] : vl
    for (const tc of pick) {                                      // the big basal lobe stays plain
      const e = env(tc), y0 = -L * tc + slant * e                   // screen y of the centre line (y up is negative)
      const a = [mid(tc), y0]
      const b = [mid(tc) + side * veinReach * e, -L * tc + slant * (1 - veinReach) * e]
      const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 6]
      veins.push(smooth([a, m, b]))
    }
  }
  // fenestrations: ovals lying between two neighbouring veins, elongated along the vein direction
  const holeList = []
  const rotDeg = (Math.atan2(1, slant) * 180) / Math.PI
  for (let i = 0; i < holes; i++) {
    const side = i % 2 ? -1 : 1
    const j = Math.min(1 + (i >> 1), lobeTs.length - 2)
    const th = (lobeTs[j] + lobeTs[j + 1]) / 2, e = env(th)
    holeList.push({ cx: mid(th) + side * 0.34 * e, cy: -L * th + slant * 0.66 * e, rx: 15 + R() * 3, ry: 30 + R() * 6, rot: side * rotDeg })
  }
  return { outline, rib, veins, holes: holeList, env, tip, L, W }
}
