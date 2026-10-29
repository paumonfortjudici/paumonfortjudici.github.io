// sticker-05 "Quiet on set!" - film director on an apple crate (accent: butter #FCE67A).
//
//   node art-src/illustration/sticker-05.build.mjs            -> art-src/illustration/sticker-05.svg
//   FX=0 node art-src/illustration/sticker-05.build.mjs x.svg -> fast draft without filters
//   BG=1 ...                                                  -> adds a paper-coloured backdrop (previews only)
//
// Built on the pilot's recipe (kit/sticker-lib.mjs + kit/pen.mjs + kit/blocks.mjs). Pose: step-up lunge, torso leaning
// forward-right, megaphone at the lips (bell up-right), clapperboard raised up-left, scarf tails whipping back.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createSticker } from './kit/sticker-lib.mjs'
import { limb, limbOutline, capsule, blob, rotPts, trPts, scPts, fmt, rrect, lerp } from './kit/pen.mjs'
import { headFrame, ear } from './kit/blocks.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || path.join(here, 'sticker-05.svg')

const st = createSticker({
  title: 'Quiet on set! - doodle sticker 05',
  desc: 'A film director in sunglasses, beret and a flying striped scarf steps onto an apple crate and shouts through a megaphone while raising a clapperboard. Concept illustration, art-directed by Pau.',
  accent: '#FCE67A',
  seed: 19,
  root: 'translate(-22,10)',
})
const { shape, use, line, fillp, raw, clip, group, S } = st

// ---------------------------------------------------------------- helpers
const P2 = (p) => `${fmt(p[0])} ${fmt(p[1])}`
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]]
const nrm = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l] }
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k]
const mid = (a, b, t = 0.5) => lerp(a, b, t)
const len = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])
const dot = (x, y, r, seed = 1, cls = 'fi') => fillp(blob(x, y, r, r, { seed, wob: 0.04 }), cls)
const poly = (pts) => 'M' + pts.map(P2).join('L') + 'Z'
const kline = (d) => raw(`<path class="k" fill="none" d="${d}"/>`)          // open 10 px contour line
const rotv = (v, deg) => rotPts([v], deg, [0, 0])[0]

// dense Catmull-Rom through control points, and a ribbon (flat strip with a width profile) around it
function catmull(pts, per = 10) {
  const out = [], n = pts.length
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(i + 2, n - 1)]
    for (let j = 0; j < per; j++) {
      const t = j / per, t2 = t * t, t3 = t2 * t
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3)
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])])
    }
  }
  out.push(pts[n - 1])
  return out
}
function ribbon(ctrl, wfn, per = 10) {
  const C = catmull(ctrl, per), n = C.length
  const N = C.map((p, i) => { const a = C[Math.max(i - 1, 0)], b = C[Math.min(i + 1, n - 1)]; const t = nrm(sub(b, a)); return [-t[1], t[0]] })
  const W = C.map((_, i) => wfn(i / (n - 1)))
  return { C, N, W, n, L: C.map((p, i) => add(p, N[i], W[i] / 2)), R: C.map((p, i) => add(p, N[i], -W[i] / 2)) }
}
// closed, smoothed outline of a ribbon (every 3rd edge point -> cardinal spline, corners at the ends); notch > 0 cuts a V (swallowtail) into the free end
const ribbonOutline = (r, notch = 0) => {
  const i = r.n - 1, pick = (E) => E.filter((_, k) => k % 3 === 0 && k < i - 1)
  const Lp = pick(r.L).map((p, k) => (k === 0 ? [...p, 'c'] : p)), Rp = pick(r.R).reverse()
  const t = nrm(sub(r.C[i], r.C[i - 3])), m = add(mid(r.L[i], r.R[i]), t, -notch)
  const tip = (p) => [...p, 'c']
  const pts = [...Lp, tip(r.L[i]), ...(notch ? [tip(m)] : []), tip(r.R[i]), ...Rp.map((p, k) => (k === Rp.length - 1 ? [...p, 'c'] : p))]
  return S(pts, { closed: true })
}
const ribbonBand = (r, t0, t1) => { const i0 = Math.round(t0 * (r.n - 1)), i1 = Math.round(t1 * (r.n - 1)); return poly([...r.L.slice(i0, i1 + 1), ...r.R.slice(i0, i1 + 1).reverse()]) }

// nested wrinkle arcs in the crook of a bent joint: J = joint, A / B = points along the two limb segments
function creases(J, A, B, radii = [40, 54, 68], span = 22) {
  const a = nrm(sub(A, J)), b = nrm(sub(B, J)), inn = nrm(add(a, b)), th = Math.atan2(inn[1], inn[0])
  for (const r of radii) {
    const pts = [-span, 0, span].map((d) => { const t = th + (d * Math.PI) / 180; return [J[0] + Math.cos(t) * r, J[1] + Math.sin(t) * r] })
    line(S(pts), 'k3')
  }
}

// ---------------------------------------------------------------- skeleton (canvas px, before the fit)
const GROUND = 1470
const WAIST = [596, 912], LEAN = 15                         // torso frame: origin = waist centre, leaning 15 deg to the right
const tl = (x, y) => { const q = rotv([x, y], LEAN); return [q[0] + WAIST[0], q[1] + WAIST[1]] }
const tlp = (pts) => pts.map(([x, y, f]) => { const q = tl(x, y); return f === undefined ? q : [...q, f] })

const HS = 0.92                                             // head scale (face 206 px wide: inside the 190-230 ruler)
const HEAD_C = [676, 430], HEAD_T = -10
const fr = headFrame({ center: HEAD_C, tilt: HEAD_T, scale: HS })
const HEADTF = `translate(${HEAD_C[0]} ${HEAD_C[1]}) rotate(${HEAD_T}) scale(${HS})`

// ================================================================ 1. SCARF TAILS: drawn later (after the left sleeve, before the neck roll): see group 'scarf-tails' below
const KNOT = tl(-56, -296)
const scarfTail = (id, ctrl, wfn, bandsAt, notch = 26) => {
  const r = ribbon(ctrl, wfn)
  shape(id, ribbonOutline(r, notch)); fillp(ribbonOutline(r, notch), 'fa k')
  for (const [a, b] of bandsAt) fillp(ribbonBand(r, a, b), 'fi')
  return r
}

// ================================================================ 2. CRATE + LEGS: jodhpur breeches (wide hips, narrow knee), tall thin boots pulled over them, flat feet
const HIP = [600, 890]
const KNEE_B = [516, 1146], ANK_B = [414, 1372]
const HIP_F = [640, 904], KNEE_F = [858, 990], ANK_F = [822, 1212]
const SOLE = 96, FS = 0.95
const footPts = [[-60, -8, 'c'], [-68, 36], [-70, 84], [-60, SOLE, 'c'], [176, SOLE, 'c'], [208, 86], [214, 62], [192, 42], [134, 28], [76, 8], [50, -10, 'c']].map(([x, y, f]) => (f === undefined ? [x * FS, y * FS] : [x * FS, y * FS, f]))
const footD = S(footPts, { closed: true })
function boot(id, ank, top, hwTop, hwBot) {
  const L = limb([top, ank], [hwTop, hwBot])
  shape(id + 'Shaft', S(limbOutline(L), { closed: true })); use(id + 'Shaft', 'fi k')
  shape(id + 'Foot', footD, { tf: `translate(${fmt(ank[0])} ${fmt(ank[1])})` }); use(id + 'Foot', 'fi k')
  clip('clip' + id + 'Foot', footD)
  const yS = SOLE * FS
  raw(`<g transform="translate(${fmt(ank[0])} ${fmt(ank[1])})"><g clip-path="url(#clip${id}Foot)"><path class="fp" d="M-100 ${yS - 18} L260 ${yS - 20} L260 130 L-100 130Z"/><path class="k3" d="M-100 ${yS - 18} L260 ${yS - 20}"/></g>`)
  raw('<path class="pp" d="M112 34 L134 50"/><path class="pp" d="M88 22 L108 38"/><path class="pp" d="M136 46 L156 60"/></g>')
  // paper laces down the shaft
  const d = nrm(sub(ank, top)), n = [-d[1], d[0]]
  for (let k = 0; k < 4; k++) {
    const c = add(mid(top, ank, 0.40 + k * 0.15), n, -16)
    line(`M${P2(add(c, n, -11))}L${P2(add(c, n, 11))}`, 'pp')
  }
  // folded accent cuff on top of the shaft, breeches tucked in underneath
  const A0 = L.ends[0].A, B0 = L.ends[0].B, A1 = lerp(L.ends[0].A, L.ends[1].A, 0.19), B1 = lerp(L.ends[0].B, L.ends[1].B, 0.19)
  const grow = (a, b, k) => [add(a, nrm(sub(a, b)), k), add(b, nrm(sub(b, a)), k)]
  const [a0, b0] = grow(A0, B0, 8), [a1, b1] = grow(A1, B1, 8)
  fillp(S([a0, a1, b1, b0].map((p) => [...p, 'c']), { closed: true }), 'fa k')
}
group('crate', () => {
  shape('crate', rrect(650, 1310, 424, GROUND - 1310, 12)); use('crate')
  line('M656 1364 H808 M916 1364 H1068', 'k2'); line('M656 1418 H808 M916 1418 H1068', 'k2')
  line('M712 1316 V1464', 'k2'); line('M1012 1316 V1464', 'k2')
  raw('<path class="st" d="M684 1334 V1450"/><path class="st" d="M1040 1334 V1450"/>')
  // stencilled label: paper plate with an ink apple (no lettering)
  raw(`<path class="fp k3f" d="${rrect(808, 1334, 108, 110, 14)}"/>`)
  // apple (geometry baked at 0.82: no scaled strokes)
  const ak = 0.82, ap = (d) => d.replace(/(-?[0-9]+(?:[.][0-9]+)?) (-?[0-9]+(?:[.][0-9]+)?)/g, (_, x, y) => fmt(862 + x * ak) + ' ' + fmt(1392 + y * ak))
  raw(`<path class="fi" d="${ap('M0 -22C26 -42 58 -12 38 28C28 48 10 46 0 40C-10 46 -28 48 -38 28C-58 -12 -26 -42 0 -22Z')}"/><path class="fi" d="${ap('M2 -22C0 -36 6 -46 18 -50C20 -38 14 -28 2 -22Z')}"/><path class="pp" d="${ap('M-26 -4Q-30 12 -20 24')}"/>`)
})
// the front (bent) leg is painted first, the back leg overlaps it at the crotch (clean T-junction, no stray lines)
group('leg-front', () => {
  const kd = nrm(sub(ANK_F, KNEE_F))
  const thigh = limb([HIP_F, KNEE_F, add(KNEE_F, kd, 54)], [78, 60, 54])
  shape('thighF', S(limbOutline(thigh), { closed: true })); use('thighF')
  boot('bootF', ANK_F, add(KNEE_F, kd, 40), 49, 40)
})
group('leg-back', () => {
  const kd = nrm(sub(ANK_B, KNEE_B))
  const thigh = limb([HIP, KNEE_B, add(KNEE_B, kd, 54)], [78, 60, 54])
  shape('thighB', S(limbOutline(thigh), { closed: true })); use('thighB')
  boot('bootB', ANK_B, add(KNEE_B, kd, 40), 49, 40)
})

// ================================================================ 3. TORSO: shirt, high-waisted trousers, suspenders
group('torso', () => {
  const shirtL = [[-98, -286, 'c'], [-70, -314], [-34, -328], [34, -328], [70, -314], [100, -286, 'c'], [106, -226], [100, -150], [90, -50, 'c'], [50, -16], [0, -10], [-50, -16], [-86, -50, 'c'], [-94, -150], [-102, -226]]
  shape('shirt', S(tlp(shirtL), { closed: true })); use('shirt')
})
// stitched side seams on the breeches (dotted), drawn over the legs and under the waistband
const seam = (a0, a1, hw0, hw1, t0, t1, sign, inset) => {
  const d = nrm(sub(a1, a0)), n = [-d[1] * sign, d[0] * sign]
  const at = (t) => add(add(a0, sub(a1, a0), t), n, hw0 + (hw1 - hw0) * t - inset)
  return `M${P2(at(t0))} Q${P2(add(at((t0 + t1) / 2), n, 4))} ${P2(at(t1))}`
}
group('seams', () => {
  line(seam(HIP, KNEE_B, 78, 60, 0.30, 0.86, 1, 17), 'st')      // back leg, outer (left) side
  line(seam(HIP_F, KNEE_F, 78, 60, 0.30, 0.86, 1, 17), 'st')    // front thigh, upper side
})
group('waist', () => {
  shape('band', S(tlp([[-92, -76, 'c'], [0, -64], [94, -78, 'c'], [100, -20, 'c'], [0, -6], [-96, -18, 'c']]), { closed: true })); use('band')
  for (const sx of [-1, 1]) {
    const id = 'strap' + (sx < 0 ? 'L' : 'R')
    const a = [sx * 64, -70], b = [sx * 40, -68], c = [sx * 42, -298], d = [sx * 62, -298]
    shape(id, S(tlp([[...a, 'c'], [sx * 70, -190], [...d, 'c'], [...c, 'c'], [sx * 48, -190], [...b, 'c']]), { closed: true })); use(id, 'fi k')
    const bp = tl(sx * 54, -46)
    fillp(blob(bp[0], bp[1], 9, 9, { seed: 3 + sx }), 'fp k3f')
  }
})

// film-reel patch sewn on the chest between the suspenders (ink disc, paper holes: no lettering)
group('reel', () => {
  const c = tl(0, -166)
  raw(`<path class="fi" d="${blob(c[0], c[1], 37, 37, { seed: 71, wob: 0.012 })}"/>`)
  for (let i = 0; i < 4; i++) {
    const a = (LEAN + 45 + i * 90) * Math.PI / 180
    raw(`<path class="fp" d="${blob(c[0] + Math.cos(a) * 21, c[1] + Math.sin(a) * 21, 10.5, 10.5, { seed: 72 + i })}"/>`)
  }
  raw(`<path class="fp" d="${blob(c[0], c[1], 9, 9, { seed: 77 })}"/>`)
})

// ================================================================ 4. LEFT ARM (raised, clapperboard): balloon sleeve bent at the elbow, ribbed cuff, small hand
function elbowPos(Sp, W, l1, l2, sign = 1) {
  const d = len(Sp, W), u = nrm(sub(W, Sp)), a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(l1 * l1 - a * a, 0))
  return add(add(Sp, u, a), [-u[1], u[0]], sign * h)
}
const SH_L = tl(-84, -286), WR_L = [392, 384]
const EL_L = elbowPos(SH_L, WR_L, 150, 176, -1)
const uL = nrm(sub(WR_L, EL_L))
const BT = -26                                                  // board tilt (about the forearm direction)
const BS = 0.84                                                 // board scale
const BO = add(WR_L, uL, 50)                                    // board frame origin = bottom centre of the slate
const BTF = `translate(${fmt(BO[0])} ${fmt(BO[1])}) rotate(${BT})`
const HTF = `translate(${fmt(BO[0])} ${fmt(BO[1])}) rotate(${BT})`
group('arm-left', () => {
  const cuffLen = 36
  const cs = add(WR_L, uL, -cuffLen)
  const L = limb([SH_L, EL_L, cs], [56, 76, 46])
  shape('slvL', S(limbOutline(L), { closed: true }))
  use('slvL', 'fa')
  line(S([tl(-72, -318), tl(-98, -296), ...L.A.slice(1)]), 'k2'); line(S([tl(-100, -218), ...L.B.slice(1)]), 'k2')
  const eA = L.ends[2].A, eB = L.ends[2].B
  const cA = add(eA, uL, cuffLen), cB = add(eB, uL, cuffLen)
  shape('cuffL', S([eA, cA, cB, eB].map((p) => [...p, 'c']), { closed: true })); use('cuffL')
  for (const t of [0.34, 0.67]) line(`M${P2(mid(eA, cA, t))} L${P2(mid(eB, cB, t))}`, 'k3')
})

// ================================================================ 5. CLAPPERBOARD (local frame: origin = bottom centre of the slate, y up = negative)
const barStripes = (x0, x1, y0, y1, w, pitch, dir = 1) => {
  let d = ''
  const h = y1 - y0
  for (let x = x0 - h; x < x1 + h; x += pitch) d += dir > 0
    ? `M${x} ${y1}L${x + w} ${y1}L${x + w + h} ${y0}L${x + h} ${y0}Z`
    : `M${x + h} ${y1}L${x + w + h} ${y1}L${x + w} ${y0}L${x} ${y0}Z`
  return d
}
group('clapperboard', () => {
  const OPEN = 24, k = BS
  const R = (x, y, w, h, r) => rrect(x * k, y * k, w * k, h * k, r * k)             // geometry baked at scale k: no scaled strokes
  const sl = R(-150, -150, 300, 150, 10), bar = R(-150, -192, 300, 42, 6), stick = R(-150, -234, 300, 42, 6)
  const piv = `${fmt(150 * k)} ${fmt(-192 * k)}`
  shape('slate', sl, { tf: BTF }); shape('bar', bar, { tf: BTF })
  shape('stick', stick, { tf: `${BTF} rotate(${OPEN} ${piv})` })
  clip('clipBar', bar); clip('clipStick', stick)
  raw(`<g transform="${BTF} rotate(${OPEN} ${piv})">`)
  raw(`<path class="fa" d="${stick}"/><g clip-path="url(#clipStick)"><path class="fi" d="${barStripes(-150 * k, 150 * k, -234 * k, -192 * k, 34 * k, 72 * k, 1)}"/></g><path class="k" fill="none" d="${stick}"/>`)
  raw('</g>')
  raw(`<g transform="${BTF}">`)
  raw(`<path class="fa" d="${bar}"/><g clip-path="url(#clipBar)"><path class="fi" d="${barStripes(-150 * k, 150 * k, -192 * k, -150 * k, 34 * k, 72 * k, -1)}"/></g><path class="k" fill="none" d="${bar}"/>`)
  raw(`<path class="fa" d="${sl}"/><path class="k" fill="none" d="${sl}"/>`)
  // writing area, drawn in final px so the 7 px lines keep a >= 14 px gap
  raw(`<path class="fp k3f" d="${rrect(-112, -114, 224, 96, 8)}"/>`)
  raw('<path class="k3" d="M-112 -82 H112 M-112 -50 H112 M-36 -82 V-50 M40 -82 V-50"/>')
  raw('<path class="fi" d="M-100 -106 h22 v20 h-22Z"/>')
  raw('<path class="k3" d="M20 -104 V-90 M42 -104 V-90 M64 -104 V-90 M86 -104 V-90 M10 -96 L98 -100"/>')
  raw('<path class="k3" d="M-96 -44 V-26 M-74 -44 V-26 M-52 -44 V-26 M-30 -44 V-26 M-102 -38 L-24 -34"/>')
  raw('<path class="fa k3f" d="M40 -44 h22 v20 h-22Z M80 -44 h22 v20 h-22Z"/>')
  raw(`<path class="fp k3f" d="${blob(138 * k, -192 * k, 10, 10, { seed: 5 })}"/>`)
  raw('</g>')
})
// left hand under the slate: palm below the edge, four fingers hooking over it, thumb at the side (the pilot's capsule hand)
group('hand-left', () => {
  const T = `${HTF} translate(0 64)`
  // thumb first (the palm's outline then crosses its base like a real thumb joint), fingers, palm
  shape('lhThumb', S(capsule([[-30, 0], [-50, -14], [-66, -22]], [19, 18, 16]), { closed: true }), { tf: T }); use('lhThumb')
  const fingers = [[-33, 50, 25, -9], [-10, 60, 26, -3], [14, 56, 26, 4], [37, 44, 23, 10]]
  fingers.forEach(([x, h, w, a], n) => {
    shape('lhF' + n, `M${x - w / 2} -40 V${-40 - h + w / 2} a${w / 2} ${w / 2} 0 0 1 ${w} 0 V-40Z`, { tf: `${T} rotate(${a} ${x} -40)` }); use('lhF' + n)
  })
  shape('lhPalm', rrect(-50, -50, 102, 60, 20), { tf: T }); use('lhPalm')
})

// the two scarf ends: leave the roll over the left shoulder and stream back down-left (they must not read as arms: diagonal, striped, swallowtail ends)
group('scarf-tails', () => {
  scarfTail('tail2', [add(KNOT, [14, 22]), [584, 690], [532, 748], [486, 812], [430, 852], [376, 920], [316, 944]], (t) => 60 - 14 * t, [[0.62, 0.70], [0.78, 0.86]])
  scarfTail('tail1', [add(KNOT, [6, 8]), [566, 654], [506, 706], [448, 744], [380, 770], [322, 826], [250, 842]], (t) => 64 - 14 * t, [[0.62, 0.70], [0.78, 0.86]])
})

// ================================================================ 6. NECK, SCARF ROLL (around the neck) + hair
group('neck-scarf', () => {
  // neck between chin and scarf
  shape('neck', S(tlp([[-28, -340, 'c'], [28, -342, 'c'], [34, -300, 'c'], [-34, -300, 'c']]), { closed: true })); use('neck', 'fa')
  // draped scarf: a U-shaped roll (higher at the sides, sagging at the front) with three ink bands
  const topY = (x) => -314 - 12 * (x * x) / 4100, botY = (x) => -264 - 20 * (x * x) / 4100
  const xs = [-64, -43, -21, 0, 21, 43, 64]
  const top = xs.map((x) => [x, topY(x)]), bot = xs.map((x) => [x, botY(x)]).reverse()
  const outline = S(tlp([[top[0][0], top[0][1], 'c'], ...top.slice(1, -1), [top[6][0], top[6][1], 'c'], [bot[0][0], bot[0][1], 'c'], ...bot.slice(1, -1), [bot[6][0], bot[6][1], 'c']]), { closed: true })
  shape('roll', outline); use('roll')
  const band = (x0, x1) => poly(tlp([[x0, topY(x0) + 4], [x1, topY(x1) + 4], [x1, botY(x1) - 4], [x0, botY(x0) - 4]]))
  for (const [a, b] of [[-50, -34], [-8, 8], [34, 50]]) fillp(band(a, b), 'fi')
})
group('hair', () => {
  // sleek bob peeking out from under the beret on the visible side; accent shine arcs
  const lock = [[-118, -104, 'c'], [-170, -84], [-196, -30], [-204, 34], [-196, 88], [-176, 120], [-148, 124], [-130, 100], [-112, 52], [-106, -20, 'c']]
  shape('hair', S(fr.H(lock), { closed: true })); use('hair', 'fi')
  line(S(fr.H([[-160, -60], [-176, -10], [-176, 44]])), 'sh')
})

// ================================================================ 7. HEAD
group('head', () => {
  const FACE = [[-98, -100], [-114, -26], [-116, 44], [-74, 110], [-8, 138], [52, 126], [98, 76], [116, 8], [106, -72], [0, -126]]
  shape('face', S(fr.H(FACE), { closed: true })); use('face')
  ear(st, fr)
  const hs = (d) => d.replace(/-?\d+(\.\d+)?/g, (m) => fmt(parseFloat(m) * HS))   // bake the head scale into absolute path data
  const HTF0 = `translate(${HEAD_C[0]} ${HEAD_C[1]}) rotate(${HEAD_T})`
  const lens = (x) => rrect(x * HS, -26 * HS, 82 * HS, 56 * HS, 24 * HS)
  raw(`<g transform="${HTF0}">`)
  // sunglasses (ink lenses, paper glints)
  raw(`<path class="fi" d="${lens(-102)}"/><path class="fi" d="${lens(20)}"/>`)
  raw(`<path class="k2" d="${hs('M-24 -8 Q0 -16 24 -8')}"/><path class="k2" d="${hs('M-102 -8 L-126 -14')}"/><path class="k2" d="${hs('M102 -8 L124 -14')}"/>`)
  raw(`<path class="pp" d="${hs('M-84 -10 L-62 -10')}"/><path class="pp" d="${hs('M-84 4 L-76 4')}"/><path class="pp" d="${hs('M38 -10 L60 -10')}"/><path class="pp" d="${hs('M38 4 L46 4')}"/>`)
  // brows high above the shades, nose, cheek marks
  raw(`<path class="k2" d="${hs('M-90 -60 Q-62 -90 -26 -72')}"/><path class="k2" d="${hs('M18 -76 Q50 -106 84 -78')}"/>`)
  raw(`<path class="k2" d="${hs('M2 30 L7 50 Q6 60 -10 58')}"/>`)
  raw(`<path class="k3" d="${hs('M-92 50 L-82 66 M-72 44 L-62 60')}"/>`)
  raw('</g>')
  // beret (own drawing: sits higher than the kit one so the brows have room, no brow wedge)
  const H = fr.H
  shape('beret', S(H([[-132, -112, 'c'], [-166, -154], [-130, -206], [-40, -228], [60, -236], [152, -208], [176, -160], [142, -116, 'c'], [70, -104], [-24, -98], [-84, -100]]), { closed: true }))
  use('beret')
  line(S(H([[-126, -122], [-24, -112], [70, -114], [136, -126]])), 'k3')
  shape('beretStem', S(H([[0, -228], [-2, -254], [12, -262], [24, -252], [22, -228]]), { closed: true })); use('beretStem', 'fi k')
  line(S(H([[-26, -226], [-66, -184], [-98, -142]])), 'k3')
  line(S(H([[30, -224], [52, -176], [62, -128]])), 'k3')
  line(S(H([[84, -226], [118, -190], [136, -152]])), 'k3')
})

// ================================================================ 8. MEGAPHONE (local frame: origin = mouthpiece, +x along the axis towards the bell)
const MA = -26
const MO = fr.hp([30, 92])
const MTF = `translate(${fmt(MO[0])} ${fmt(MO[1])}) rotate(${MA})`
const mg = (x, y) => { const q = rotv([x, y], MA); return [MO[0] + q[0], MO[1] + q[1]] }
const ML = 306                                                   // length
group('megaphone', () => {
  const cone = S([[18, -30, 'c'], [100, -44], [190, -72], [262, -100], [ML, -110, 'c'], [ML, 110, 'c'], [262, 100], [190, 72], [100, 44], [18, 30, 'c']], { closed: true })
  const handle = S([[150, 62, 'c'], [200, 64, 'c'], [208, 170], [158, 174]], { closed: true })
  shape('mHandle', handle, { tf: MTF }); use('mHandle', 'fi k')
  shape('mCone', cone, { tf: MTF }); use('mCone')
  clip('clipCone', cone)
  raw(`<g transform="${MTF}">`)
  raw('<g clip-path="url(#clipCone)"><path class="fi" d="M186 -120 H218 V120 H186Z M246 -120 H278 V120 H246Z"/></g>')
  raw('</g>')
  shape('mBell', blob(ML, 0, 34, 112, { seed: 8, wob: 0.015 }), { tf: MTF }); use('mBell')
  raw(`<g transform="${MTF}"><path class="fi" d="${blob(ML + 4, 0, 20, 92, { seed: 9, wob: 0.015 })}"/><path class="pp" d="M${ML - 8} -72 Q${ML - 16} -52 ${ML - 12} -30"/></g>`)
  // mouthpiece: a dark oval flange pressed against the lips
  shape('mMouth', blob(2, 0, 17, 40, { seed: 4, wob: 0.02 }), { tf: MTF }); use('mMouth', 'fi k')
  raw(`<g transform="${MTF}"><path class="pp" d="M-4 -20 Q-9 0 -4 20"/></g>`)
})

// ================================================================ 9. RIGHT ARM: balloon sleeve in a V, ribbed cuff, bare wrist, fist on the handle
const SH_R = tl(84, -284)
const GX = 175                                                    // where the hand grips the megaphone (along its axis)
const WR_R = mg(GX, 196)
const EL_R = elbowPos(SH_R, WR_R, 172, 184, 1)
group('arm-right', () => {
  const cuffLen = 30, wristLen = 44
  const uR = nrm(sub(WR_R, EL_R))
  const ce = add(WR_R, uR, -wristLen)                              // end of the cuff / start of the bare wrist
  const cs = add(ce, uR, -cuffLen)
  shape('wristR', S(capsule([ce, mid(ce, WR_R, 0.6), WR_R], [22, 21, 20]), { closed: true })); use('wristR')
  const L = limb([SH_R, EL_R, cs], [50, 60, 43])
  shape('slvR', S(limbOutline(L), { closed: true }))
  use('slvR', 'fa')
  line(S([tl(100, -218), ...L.A.slice(1)]), 'k2'); line(S([tl(72, -318), tl(98, -296), ...L.B.slice(1)]), 'k2')
  creases(EL_R, SH_R, WR_R, [34, 47, 60], 22)
  const eA = L.ends[2].A, eB = L.ends[2].B
  const cA = add(eA, uR, cuffLen), cB = add(eB, uR, cuffLen)
  shape('cuffR', S([eA, cA, cB, eB].map((p) => [...p, 'c']), { closed: true })); use('cuffR')
  line(`M${P2(mid(eA, cA, 0.5))} L${P2(mid(eB, cB, 0.5))}`, 'k3')
  // fist around the handle: four stacked finger bars + thumb (hammer grip), drawn in the megaphone frame
  const FT = `${MTF} translate(${GX} 124)`
  for (let n = 0; n < 4; n++) { shape('rf' + n, rrect(-44, -54 + n * 27, 88, 31, 15.5), { tf: FT }); use('rf' + n) }
  shape('rfT', S(capsule([[22, -8], [4, -40], [-8, -58]], [15, 14, 12]), { closed: true }), { tf: FT }); use('rfT')
})
console.log('arms: L', Math.round(len(SH_L, EL_L)), Math.round(len(EL_L, WR_L)), 'R', Math.round(len(SH_R, EL_R)), Math.round(len(EL_R, WR_R)), 'EL_L', EL_L.map(Math.round), 'EL_R', EL_R.map(Math.round), 'WR_R', WR_R.map(Math.round), 'MO', MO.map(Math.round), 'bell', mg(ML, 0).map(Math.round), 'BO', BO.map(Math.round))

// ================================================================ 11. EXTRAS: an exclamation mark + a sparkle above the megaphone, a few dashes by the clapperboard
group('extras', () => {
  const ex = 'translate(1042 226) rotate(14) scale(1.15)'
  shape('exH', 'M-9 -42 H9 L6 8 H-6Z', { tf: ex }); shape('exD', blob(0, 34, 10, 10, { seed: 7 }), { tf: ex })
  use('exH', 'fi k3f'); use('exD', 'fi')
  const sp = 'translate(900 176) scale(0.8)'
  shape('spark', 'M0 -26Q4 -5 26 0Q4 5 0 26Q-4 5 -26 0Q-4 -5 0 -26Z', { tf: sp }); use('spark', 'fi')
})

// halo-only filler (registered for the die-cut, never painted): closes a pinhole the blur/threshold leaves in the small gap under the right sleeve
shape('haloFix', blob(779, 830, 26, 26, { seed: 3 }))
// ...and closes the small window between the megaphone cone and the right sleeve (the die-cut keeps only the big gap between the legs)
shape('haloFix2', blob(817, 581, 22, 22, { seed: 4 }))

st.write(OUT)
