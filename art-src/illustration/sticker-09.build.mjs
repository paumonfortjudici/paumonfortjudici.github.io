// sticker-09 "Headphones on, world off" - the dancer (accent: lime #C5EB7C).
//
//   node art-src/illustration/sticker-09.build.mjs            -> art-src/illustration/sticker-09.svg
//   FX=0 node art-src/illustration/sticker-09.build.mjs x.svg -> fast draft without filters
//   BG=1 ...                                                  -> adds a paper-coloured backdrop (previews only)
//
// Same kit as the pilot (kit/sticker-lib.mjs, kit/pen.mjs, kit/blocks.mjs). The body is built on a tilted spine frame (T):
// the torso arches back to the left, the head is thrown back, the right leg kicks out to the right (sole towards us),
// the left leg is stretched down on tiptoe; the ponytail and the jacket wings are the two flowing masses (their curves rhyme).
// Drawing order, back to front: ponytail, legs + ruffled cuffs, feet, neck + tank top, jacket wings + sleeves (union outline),
// hem bands, stripes, cuffs, hands, head (face, cap hair, scrunchie, headphones), extras (waves, stars, speed lines).
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createSticker } from './kit/sticker-lib.mjs'
import { limb, limbOutline, capsule, blob, rotPts, trPts, scPts, fmt, rrect, lerp, tube, poly } from './kit/pen.mjs'
import { headFrame, face, features, hairCap } from './kit/blocks.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || path.join(here, 'sticker-09.svg')

const st = createSticker({
  title: 'Headphones on, world off - doodle sticker 09',
  desc: 'A dancer lost in the music: eyes shut and laughing, headphones on, ponytail whipping, one foot on tiptoe and the other leg kicked high in parachute trousers and an oversized track jacket. Concept illustration, art-directed by Pau.',
  accent: '#C5EB7C',
  seed: 37,
  root: process.env.ROOT || 'translate(29,-71)',
})
const { shape, use, line, fillp, raw, clip, group, S } = st
const INK = st.cfg.ink

const P2 = (p) => `${fmt(p[0])} ${fmt(p[1])}`
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]]
const nrm = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l] }
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k]
const mid = (a, b, t = 0.5) => lerp(a, b, t)
const rot2 = (p, deg) => rotPts([p], deg, [0, 0])[0]
const angleOf = (d) => (Math.atan2(d[1], d[0]) * 180) / Math.PI + 90               // rotation that turns "up" (0,-1) into d

// ============================================================ SPINE FRAME: a = along the shoulders (right), b = up the spine
const H0 = [610, 960], SPINE = Number(process.env.SPINE || -18)
const sr = (SPINE * Math.PI) / 180
const U = [Math.sin(sr), -Math.cos(sr)], Rv = [Math.cos(sr), Math.sin(sr)]
const T = (a, b) => [H0[0] + Rv[0] * a + U[0] * b, H0[1] + Rv[1] * a + U[1] * b]
const TS = (pts) => pts.map(([a, b, f]) => (f ? [...T(a, b), f] : T(a, b)))

// ============================================================ shared builders
function limbPart(id, axis, hw, cls = 'fa k') {
  const L = limb(axis, hw)
  const d = S(limbOutline(L), { closed: true })
  shape(id, d); clip('clip' + id, d)
  if (cls) use(id, cls)
  return L
}
/** union outline: ink pass (fill + 20 px stroke) then accent fills on top: overlapping parts melt into one garment with a clean 10 px contour */
function union(ids) {
  for (const i of ids) raw(`<use href="#${i}" class="fi" style="stroke:${INK};stroke-width:20;stroke-linejoin:round"/>`)
  for (const i of ids) use(i, 'fa')
}
function crossAt(axis, hw, k, t, over = 0) {
  const P = lerp(axis[k], axis[k + 1], t), d = nrm(sub(axis[k + 1], axis[k])), n = [-d[1], d[0]]
  const h = hw[k] + (hw[k + 1] - hw[k]) * t + over
  return [add(P, n, h), add(P, n, -h), d]
}
/** points running along a limb at a fixed distance from one edge (side 0 = A, 1 = B); inset in px */
function alongEdge(axis, hw, side, inset, spans) {
  const pts = []
  for (const [k, t0, t1, n] of spans) for (let i = 0; i <= n; i++) { const t = t0 + ((t1 - t0) * i) / n; pts.push(crossAt(axis, hw, k, t, -inset)[side]) }
  return pts
}

/** Catmull-Rom densify: a polyline through the key points with `per` samples per span (so capsules come out smooth) */
function densify(pts, per = 6) {
  const out = []
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(i + 2, pts.length - 1)]
    for (let j = 0; j < per; j++) {
      const t = j / per, t2 = t * t, t3 = t2 * t
      out.push([0, 1].map((k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)))
    }
  }
  out.push(pts[pts.length - 1])
  return out
}
/** width keyframes [[u, w], ...] sampled at u in 0..1 (linear) */
const widthAt = (keys, u) => { for (let i = 0; i < keys.length - 1; i++) if (u <= keys[i + 1][0]) { const f = (u - keys[i][0]) / (keys[i + 1][0] - keys[i][0]); return keys[i][1] + (keys[i + 1][1] - keys[i][1]) * f } return keys[keys.length - 1][1] }
const normalAt = (pts, i) => { const a = pts[Math.max(i - 1, 0)], b = pts[Math.min(i + 1, pts.length - 1)]; const t = nrm(sub(b, a)); return [t[1], -t[0]] }

// ============================================================ HEAD FRAME
const HT = Number(process.env.HT || -26)
const HC = T(-8, 470)
const fr = headFrame({ center: HC, tilt: HT, scale: 1.03 })

// ============================================================ 1. PONYTAIL (back layer): a chunky whip of ink, out to the left and curling back up (a "?" swirl)
group('ponytail', () => {
  const R = fr.hp([-150, -100])
  const K = Number(process.env.PT || 0.74)
  const key = [R, add(R, [-62 * K, 18 * K]), add(R, [-128 * K, 8 * K]), add(R, [-180 * K, -40 * K]), add(R, [-198 * K, -108 * K]), add(R, [-176 * K, -170 * K]), add(R, [-126 * K, -206 * K])]
  const M = densify(key, 7), N = M.length - 1
  const lock = (i0, i1, offFn, wFn) => {
    const pts = [], hw = []
    for (let i = i0; i <= i1; i++) { const u = (i - i0) / (i1 - i0); pts.push(add(M[i], normalAt(M, i), offFn(u))); hw.push(wFn(u)) }
    return S(capsule(pts, hw), { closed: true })
  }
  shape('pt0', lock(0, N, () => 0, (u) => widthAt([[0, 30], [0.15, 40], [0.35, 47], [0.6, 40], [0.82, 26], [0.94, 14], [1, 5]], u))); use('pt0', 'fi')
  shape('pt1', lock(Math.round(N * 0.3), N, (u) => 8 + 40 * u, (u) => 24 * Math.pow(1 - u, 0.8) + 4)); use('pt1', 'fi')
  shape('pt2', lock(Math.round(N * 0.22), Math.round(N * 0.88), (u) => -(6 + 26 * Math.sin(Math.PI * u)), (u) => 20 * (1 - u * u) + 4)); use('pt2', 'fi')
  line(S(densify(key.slice(1, 5).map((q, i) => add(q, [0, 6])), 5)), 'sh')
  // the hair tie: a paper scrunchie where the ponytail leaves the head
  const d0 = nrm(sub(key[1], key[0])), tf = `translate(${fmt(R[0])} ${fmt(R[1])}) rotate(${fmt(angleOf(d0) + 180)})`
  shape('tie', S([[-40, -22, 'c'], [-20, -34], [0, -24], [20, -34], [40, -22, 'c'], [42, 24, 'c'], [22, 34], [0, 24], [-20, 34], [-40, 24, 'c']], { closed: true }), { tf })
  use('tie', 'fp k')
  raw(`<g transform="${tf}"><path class="k3" d="M-22 -20 L-20 22M0 -18 L0 22M22 -20 L20 22"/></g>`)
})

// ============================================================ 2a. TIPTOE SNEAKER (drawn first: the trouser cuff overlaps its collar)
const axSL = [[598, 930], [588, 1040], [574, 1165], [540, 1304]], hwSL = [98, 100, 108, 64]               // standing leg (left), leaning back towards the arch
group('shoe-tiptoe', () => {
  // --- standing foot on tiptoe: chunky sneaker in profile, toe down-left (paper sole, laces, eyelets)
  const dSL = nrm(sub(axSL[3], axSL[2])); const ank = add(axSL[3], dSL, 44)
  const tf = `translate(${fmt(ank[0] + 2)} ${fmt(ank[1] - 10)}) rotate(-50) scale(-1 1)`
  const SK = 1.3
  const X = (x) => x * SK, Y = (y) => y * SK
  const shoePts = scPts([[-62, -10, 'c'], [-72, 40], [-78, 88], [-70, 106, 'c'], [120, 106, 'c'], [152, 92], [156, 66], [136, 46], [88, 34], [48, 14], [44, -10, 'c']], SK, SK, [0, 0])
  const sd = S(shoePts, { closed: true })
  shape('shoeS', sd, { tf })
  clip('clipShoeS', sd)
  use('shoeS', 'fi k')
  raw(`<g transform="${tf}"><g clip-path="url(#clipShoeS)"><path class="fp" d="M${X(-100)} ${Y(76)} L${X(180)} ${Y(72)} L${X(180)} ${Y(130)} L${X(-100)} ${Y(130)}Z"/><path class="k3" d="M${X(-100)} ${Y(76)} L${X(180)} ${Y(72)}"/></g>`)
  for (let i = 0; i < 3; i++) raw(`<path class="pp" d="M${X(48 + i * 28)} ${Y(22 + i * 10)} L${X(64 + i * 28)} ${Y(40 + i * 10)}"/>`)
  raw(`<path class="fp" d="${blob(X(-14), Y(30), 6, 6, { seed: 21 })}"/><path class="fp" d="${blob(X(-14), Y(54), 6, 6, { seed: 22 })}"/>`)
  raw(`<path class="pp" d="M${X(124)} ${Y(54)} Q${X(134)} ${Y(64)} ${X(131)} ${Y(72)}"/>`)
  raw(`<path class="pp" d="M${X(112)} ${Y(70)} Q${X(122)} ${Y(52)} ${X(100)} ${Y(38)}"/><path class="pp" d="M${X(-62)} ${Y(52)} Q${X(-34)} ${Y(44)} ${X(-38)} ${Y(14)}"/></g>`)

})

// ============================================================ 2. LEGS: parachute trousers (wide cones) with ruffled elastic cuffs
const axKL = [[664, 950], [756, 920], [842, 882], [930, 816]], hwKL = [102, 106, 108, 64]                   // kicking leg (right), up and out
/** gathered cuff at the end of a trouser leg: a short band with a scalloped far edge and gather lines. returns { e: cuff end centre, d } */
function ruffle(id, axis, hw, len = 44, scallops = 5) {
  const n = axis.length, d = nrm(sub(axis[n - 1], axis[n - 2])), nn = [-d[1], d[0]]
  const e = axis[n - 1], h0 = hw[n - 1], h1 = h0 - 8
  const A0 = add(e, nn, h0), B0 = add(e, nn, -h0)
  const far = add(e, d, len)
  const pts = [[...A0, 'c'], [...add(far, nn, h1), 'c']]
  for (let i = 0; i < scallops; i++) {                                              // a smooth frilled edge: bump, dip, bump...
    const t0 = i / scallops, t1 = (i + 1) / scallops
    const p0 = add(far, nn, h1 - 2 * h1 * t0), p1 = add(far, nn, h1 - 2 * h1 * t1)
    pts.push(add(mid(p0, p1), d, 14))
    if (i < scallops - 1) pts.push(add(p1, d, -1))
  }
  pts.push([...add(far, nn, -h1), 'c'], [...B0, 'c'])
  shape(id, S(pts, { closed: true }))
  use(id)
  for (let i = 1; i < scallops; i++) { const t = i / scallops, a = add(e, nn, h0 - 2 * h0 * t); line(`M${P2(add(a, d, 8))}L${P2(add(a, d, len - 10))}`, 'k3') }
  return { e: add(far, d, 6), d, nn }
}
let cuffS, cuffK
group('legs', () => {
  limbPart('legS', axSL, hwSL)
  limbPart('legK', axKL, hwKL)
  // racing stripe (thick + thin) along the outer seam of each leg
  raw('<g clip-path="url(#cliplegS)">')
  line(S(alongEdge(axSL, hwSL, 0, 32, [[0, 0.1, 1, 2], [1, 0, 1, 2], [2, 0, 0.9, 3]])), 'k2', 'style="stroke-width:20"')
  line(S(alongEdge(axSL, hwSL, 0, 60, [[0, 0.1, 1, 2], [1, 0, 1, 2], [2, 0, 0.9, 3]])), 'k3')
  raw('</g><g clip-path="url(#cliplegK)">')
  line(S(alongEdge(axKL, hwKL, 1, 32, [[0, 0.3, 1, 2], [1, 0, 1, 2], [2, 0, 0.88, 3]])), 'k2', 'style="stroke-width:20"')
  line(S(alongEdge(axKL, hwKL, 1, 60, [[0, 0.3, 1, 2], [1, 0, 1, 2], [2, 0, 0.88, 3]])), 'k3')
  raw('</g>')
  // zip pocket on the standing thigh: stitched flap + zip line + pull
  raw('<g transform="translate(590 1112) rotate(-5)">')
  raw(`<path class="fa k" d="${rrect(-40, -50, 80, 100, 16)}"/><path class="st" d="${rrect(-27, -37, 54, 74, 8)}"/><path class="k3" d="M-40 -14 H40"/>`)
  raw(`<path class="fi" d="${rrect(-7, -14, 14, 30, 7)}"/>`)
  raw('</g>')
  line('M722 968 Q742 960 770 958', 'k3')                                           // pleats near the hips
  line('M724 1012 Q744 1004 772 1002', 'k3')
  line('M626 1214 Q612 1236 618 1262', 'k3')                                       // knee folds on the standing leg
  line('M652 1222 Q640 1242 644 1262', 'k3')
  cuffS = ruffle('cuffS', axSL, hwSL)
  cuffK = ruffle('cuffK', axKL, hwKL)
})

// ============================================================ 3. KICKING FOOT: the sole facing us (drawn over the cuff)
group('sole', () => {
  // --- kicking foot: the sole facing us (paper midsole rim, ink outsole with paper tread)
  const kc = add(cuffK.e, [24, -54])
  const ktf = `translate(${fmt(kc[0])} ${fmt(kc[1])}) rotate(-10)`
  const foot = [[0, -150], [46, -132], [62, -80], [54, -20], [38, 34], [40, 92], [30, 128], [0, 140], [-30, 128], [-40, 92], [-38, 34], [-54, -20], [-62, -80], [-46, -132]]
  const fd = S(foot, { closed: true }), inner = S(scPts(foot, 0.74, 0.8, [0, 0]), { closed: true })
  shape('soleK', fd, { tf: ktf })
  clip('clipSoleK', inner)
  use('soleK', 'fp k')
  raw(`<g transform="${ktf}"><path class="fi" d="${inner}"/><g clip-path="url(#clipSoleK)">`)
  for (let i = 0; i < 4; i++) raw(`<path class="pp" d="M-60 ${-86 + i * 28} L-18 ${-70 + i * 28} L18 ${-86 + i * 28} L60 ${-70 + i * 28}"/>`)
  for (let i = 0; i < 2; i++) raw(`<path class="pp" d="M-40 ${70 + i * 26} L0 ${84 + i * 26} L40 ${70 + i * 26}"/>`)
  raw('</g></g>')
})

// ============================================================ 4. NECK + TANK TOP (visible between the open jacket wings)
group('tank', () => {
  shape('neck', S(TS([[-34, 320, 'c'], [34, 322, 'c'], [38, 262], [-38, 258]]), { closed: true }))
  use('neck', 'fa')
  shape('tank', S(TS([[-48, 304, 'c'], [-24, 266], [0, 256], [24, 266], [48, 304, 'c'], [94, 290], [98, 200], [90, 110], [76, 30], [0, 12], [-76, 30], [-90, 110], [-98, 200], [-94, 290]]), { closed: true }))
  use('tank')
  const sc = T(2, 168)
  const starPts = Array.from({ length: 10 }, (_, i) => { const r = i % 2 ? 19 : 44, a = ((-90 + i * 36 + SPINE) * Math.PI) / 180; return [sc[0] + Math.cos(a) * r, sc[1] + Math.sin(a) * r] })
  fillp(poly(starPts, true), 'fi k3f')
})

// ============================================================ 5. JACKET: wings + sleeves as one union garment per side
const axLA = [[466, 724], [366, 806], [282, 774]], hwLA = [76, 88, 58]
const axRA = [[620, 684], [786, 586], [838, 410]], hwRA = [76, 88, 58]
let cuffL, cuffR
function sleeveCuff(id, axis, hw, len = 40) {
  const n = axis.length, d = nrm(sub(axis[n - 1], axis[n - 2])), nn = [-d[1], d[0]]
  const e = axis[n - 1], h = hw[n - 1] - 6
  const eA = add(e, nn, h), eB = add(e, nn, -h), cA = add(eA, d, len), cB = add(eB, d, len)
  shape(id, S([eA, cA, cB, eB].map((p) => [...p, 'c']), { closed: true }))
  use(id)
  for (let i = 1; i < 5; i++) { const t = i / 5; line(`M${P2(mid(eA, eB, t))}L${P2(mid(cA, cB, t))}`, 'k3') }
  return { wc: mid(cA, cB), d }
}
group('jacket', () => {
  shape('wingL', S(TS([[-50, 308, 'c'], [-84, 308], [-108, 290], [-146, 238], [-186, 176], [-214, 124], [-230, 88], [-216, 54], [-182, 22], [-142, -8], [-86, -40, 'c'], [-86, 40], [-90, 140], [-92, 232]]), { closed: true }))
  limbPart('armL', axLA, hwLA, null)
  union(['wingL', 'armL'])
  shape('wingR', S(TS([[50, 308, 'c'], [84, 308], [108, 290], [148, 252], [196, 212], [238, 170], [268, 128], [256, 90], [220, 52], [166, 12], [86, -40, 'c'], [88, 40], [92, 150], [92, 240]]), { closed: true }))
  limbPart('armR', axRA, hwRA, null)
  union(['wingR', 'armR'])
  // ribbed hem bands along the wing hems
  const hem = (id, pts) => {
    const lo = TS(pts), hi = lo.map((q) => add(q, U, 30))
    const ring = [...lo.map((q, i) => (i === 0 || i === lo.length - 1 ? [...q, 'c'] : q)), ...hi.slice().reverse().map((q, i, arr) => (i === 0 || i === arr.length - 1 ? [...q, 'c'] : q))]
    shape(id, S(ring, { closed: true }), { halo: false })
    use(id)
    const n = 7
    for (let i = 1; i < n; i++) { const t = i / n, idx = t * (lo.length - 1), k = Math.min(Math.floor(idx), lo.length - 2), f = idx - k; const a = lerp(lo[k], lo[k + 1], f), b = lerp(hi[k], hi[k + 1], f); line(`M${P2(add(a, U, 5))}L${P2(add(b, U, -5))}`, 'k3') }
  }
  hem('hemL', [[-226, 70], [-196, 34], [-160, 2], [-126, -24], [-90, -40]])
  hem('hemR', [[258, 100], [222, 56], [176, 18], [132, -18], [90, -40]])
  // fold lines on the wings
  line(S(TS([[-138, 196], [-160, 128], [-174, 66]])), 'k3')
  line(S(TS([[-112, 160], [-128, 110], [-136, 66]])), 'k3')
  line(S(TS([[146, 222], [186, 168], [214, 118]])), 'k3')
  line(S(TS([[122, 180], [150, 138], [168, 102]])), 'k3')
  // elbow wrinkles on the outer side of each bend
  const wr = (axis, k, hwv, sgn) => {
    const P = axis[k], d1 = nrm(sub(axis[k], axis[k - 1])), d2 = nrm(sub(axis[k + 1], axis[k])), bis = nrm(add(d1, d2, -1))
    const o = nrm([sgn * bis[0], sgn * bis[1]])
    for (const r of [0.5, 0.76]) { const a = rot2(o, -32), b = rot2(o, 32); line(`M${P2(add(P, a, hwv * r))}Q${P2(add(P, o, hwv * r * 1.12))} ${P2(add(P, b, hwv * r))}`, 'k3') }
  }
  // racing stripes down the sleeves (thick + thin), clipped to the sleeve
  raw('<g clip-path="url(#clip' + 'armL' + ')">')
  line(S(alongEdge(axLA, hwLA, 1, 31, [[0, 0.3, 1, 3], [1, 0.02, 0.8, 3]])), 'k2', 'style="stroke-width:18"')
  line(S(alongEdge(axLA, hwLA, 1, 58, [[0, 0.3, 1, 3], [1, 0.02, 0.8, 3]])), 'k3')
  raw('</g><g clip-path="url(#clip' + 'armR' + ')">')
  line(S(alongEdge(axRA, hwRA, 0, 31, [[0, 0.3, 1, 3], [1, 0.02, 0.8, 3]])), 'k2', 'style="stroke-width:18"')
  line(S(alongEdge(axRA, hwRA, 0, 58, [[0, 0.3, 1, 3], [1, 0.02, 0.8, 3]])), 'k3')
  raw('</g>')
  cuffL = sleeveCuff('cuffL', axLA, hwLA)
  cuffR = sleeveCuff('cuffR', axRA, hwRA)
  // gathers: short curved folds on the stripe-free side of each forearm, just above the cuff
  const gather = (axis, hw, k, side, ts) => { for (const t of ts) { const e = crossAt(axis, hw, k, t, -3)[side], c = crossAt(axis, hw, k, t, -3)[1 - side], d = crossAt(axis, hw, k, t)[2]; const m = lerp(e, c, 0.3); line(`M${P2(add(e, d, -2))}Q${P2(add(m, d, 9))} ${P2(add(lerp(e, c, 0.42), d, -2))}`, 'k3') } }
  gather(axLA, hwLA, 1, 0, [0.52, 0.64, 0.76])
  gather(axRA, hwRA, 1, 1, [0.52, 0.64, 0.76])
  // ribbed collar around the neck
  const cc = T(0, 306)
  shape('collar', blob(cc[0], cc[1], 70, 30, { rot: SPINE, wob: 0.01, seed: 8 }))
  use('collar')
  for (const a of [-48, -32, -16, 0, 16, 32, 48]) { const yb = 30 * Math.sqrt(1 - (a / 70) ** 2); line(`M${P2(T(a, 306 - yb + 8))}L${P2(T(a * 1.02, 306 - yb + 22))}`, 'k3') }
})

// ============================================================ 6. HANDS
/** a finger = capsule starting at (bx,by), leaning ang degrees from vertical, len long, w wide (local frame: fingers up, wrist at the origin) */
function fing(bx, by, ang, len, w) {
  const a = (ang * Math.PI) / 180, d = [Math.sin(a), -Math.cos(a)], e = len - w / 2
  const p = (t, c = 0) => [bx + d[0] * e * t - d[1] * c, by + d[1] * e * t + d[0] * c]
  return S(capsule([p(0), p(0.55, 2), p(1, 0)], [w / 2, w / 2 - 0.5, w / 2 - 1.5]), { closed: true })
}
/** open hand with splayed fingers (palm = fill only so the finger bases melt into it, side lines close it) */
const HK = Number(process.env.HK || 0.96)                              // hand scale (small hands in big sleeves)
function handOpen(id, wc, rot, mirror = false) {
  const tf = `translate(${fmt(wc[0])} ${fmt(wc[1])}) rotate(${fmt(rot)}) scale(${mirror ? -HK : HK} ${HK})`
  const F = [['pk', fing(-34, -76, -24, 62, 26)], ['ri', fing(-11, -86, -8, 86, 27)], ['mi', fing(12, -88, 7, 96, 27)], ['in', fing(34, -80, 24, 78, 26)]]
  for (const [n, d] of F) { shape(id + n, d, { tf }); use(id + n) }
  shape(id + 'pa', S([[-30, 12, 'c'], [-45, -22], [-50, -56], [-48, -84, 'c'], [48, -84, 'c'], [50, -56], [45, -22], [30, 12, 'c']], { closed: true }), { tf }); use(id + 'pa', 'fa')
  raw(`<g transform="${tf}"><path class="k2" d="${S([[-30, 12], [-45, -22], [-51, -56], [-49, -80]])}"/><path class="k2" d="${S([[30, 12], [45, -22], [51, -56], [49, -80]])}"/></g>`)
  shape(id + 'th', S(capsule([[-38, -8], [-64, -28], [-86, -38]], [22, 20, 16]), { closed: true }), { tf }); use(id + 'th')
}
/** pointing hand (index up, other fingers curled, thumb across) */
function handPoint(id, wc, rot) {
  const tf = `translate(${fmt(wc[0])} ${fmt(wc[1])}) rotate(${fmt(rot)}) scale(${HK})`
  shape(id + 'ix', fing(-36, -92, -3, 112, 28), { tf }); use(id + 'ix')
  ;[-10, 15, 40].forEach((x, i) => { shape(id + 'k' + i, rrect(x - 15, -128, 30, 50, 15), { tf }); use(id + 'k' + i) })
  shape(id + 'pa', S([[-32, 12, 'c'], [-46, -24], [-54, -62], [-52, -104, 'c'], [52, -104, 'c'], [54, -62], [46, -24], [32, 12, 'c']], { closed: true }), { tf }); use(id + 'pa')
  raw(`<g transform="${tf}"><path class="k3" d="M3 -104V-78M28 -104V-78"/></g>`)
  shape(id + 'th', S(capsule([[44, -26], [18, -50], [-10, -58]], [18, 16, 13]), { closed: true }), { tf }); use(id + 'th')
}
group('hands', () => {
  handOpen('hL', cuffL.wc, angleOf(cuffL.d), true)
  handPoint('hR', cuffR.wc, angleOf(cuffR.d))
  // paper scrunchie on the left wrist (ink stitches)
  const sc = add(cuffL.wc, cuffL.d, -6), stf = `translate(${fmt(sc[0])} ${fmt(sc[1])}) rotate(${fmt(angleOf(cuffL.d))})`
  shape('scrunch', S([[-50, -16, 'c'], [-34, -26], [-12, -18], [12, -26], [34, -18], [50, -16, 'c'], [52, 18, 'c'], [30, 26], [8, 18], [-12, 26], [-34, 20], [-52, 18, 'c']], { closed: true }), { tf: stf })
  use('scrunch', 'fp k')
  raw(`<g transform="${stf}"><path class="k3" d="M-30 -14 L-26 14M-8 -12 L-6 14M16 -14 L18 14M38 -12 L40 14"/></g>`)
})

// ============================================================ 7. HEAD
group('head', () => {
  face(st, fr)
  features(st, fr, { eyes: 'happy', brows: 'none', nose: 'small', mouth: 'grin', cheeks: true, mouthId: 'M9' })
  hairCap(st, fr, { id: 'cap9', part: 'left' })
  // over-ear headphones: a tighter band than the kit block (it hugs the hair cap) + ink cups with lime discs and a paper highlight
  const band = S(fr.H([[-128, 6], [-134, -100], [-104, -186], [0, -218], [104, -186], [134, -100], [128, 6]]))
  shape('phonesBand', band)
  shape('phonesBandOut', S(fr.H([[-142, 6], [-150, -100], [-118, -200], [0, -234], [118, -200], [150, -100], [142, 6]])))     // halo only: the band is a 28 px tube, so its outer edge needs its own 38 px of die-cut
  raw(`<path class="tube-k" d="${band}"/><path class="tube-a" d="${band}"/>`)
  for (const [sx, i] of [[-1, 1], [1, 2]]) {
    const c = fr.hp([sx * 132, 24])
    shape('phonesCup' + i, blob(c[0], c[1], 52 * fr.scale, 70 * fr.scale, { seed: 20 + i, rot: fr.tilt, wob: 0.02 }))
    use('phonesCup' + i, 'fi k')
    fillp(blob(c[0] + sx * 4, c[1], 28 * fr.scale, 44 * fr.scale, { seed: 24 + i, rot: fr.tilt, wob: 0.02 }), 'fa')
    line(S(fr.H([[sx * 150, -12], [sx * 158, 14], [sx * 150, 40]])), 'pp')
  }
})

// ============================================================ 8. EXTRAS: sound waves by the cups, stars + speed dashes around the kick, wrist scrunchie
group('extras', () => {
  // sound waves beside the right cup (3 arcs). registered as an invisible blob so the halo covers them
  const cup = fr.hp([132, 24])
  const wc = add(cup, [78, -92])
  raw(`<g transform="translate(${fmt(wc[0])} ${fmt(wc[1])}) rotate(-52) scale(1.12)"><path class="k2" d="M10 -22A30 30 0 0 1 10 22"/><path class="k2" d="M34 -44A58 58 0 0 1 34 44"/><path class="k3" d="M58 -66A86 86 0 0 1 58 66"/></g>`)
  shape('wavesReg', blob(wc[0] + 26, wc[1] - 22, 74, 98, { rot: -52, seed: 3 }))
  const spark = 'M0 -26Q4 -5 26 0Q4 5 0 26Q-4 5 -26 0Q-4 -5 0 -26Z'
  const star = Array.from({ length: 10 }, (_, i) => { const r = i % 2 ? 17 : 40, a = (-90 + i * 36) * Math.PI / 180; return [Math.cos(a) * r, Math.sin(a) * r] })
  const sk = add(cuffK.e, [50, -262])
  shape('sparkK', spark, { tf: `translate(1042 930) scale(0.9)` }); use('sparkK', 'fi')
  shape('sparkA', spark, { tf: `translate(176 560) scale(1.0)` }); use('sparkA', 'fi')
  // speed dashes trailing under the kick (parallel to the leg)
  const kd = nrm(sub(axKL[3], axKL[2])), kn = [-kd[1], kd[0]]
  const d0 = add(axKL[2], kn, 150)
  for (const [off, along, len] of [[0, -20, 78], [34, 30, 58], [-30, 54, 52]]) {
    const a = add(add(d0, kn, off), kd, along), b = add(a, kd, len)
    line(`M${P2(a)}L${P2(b)}`, 'k2')
  }
  // gap fillers (halo only): they close the two little islands the die-cut would otherwise leave inside the figure
  shape('fillA', blob(232, 614, 38, 26, { seed: 5 }))
  shape('fillB', blob(858, 708, 40, 46, { seed: 6 }))
  shape('speedReg', blob(...add(d0, kd, 40), 70, 46, { rot: angleOf(kd) - 90, seed: 4 }))
})

st.write(OUT)
