// sticker-08 "Houston, we have bananas" - astronaut monkey (accent: teal #66CBC7).
//
//   node art-src/illustration/sticker-08.build.mjs            -> art-src/illustration/sticker-08.svg
//   FX=0 node art-src/illustration/sticker-08.build.mjs x.svg -> fast draft without filters
//   BG=1 ...                                                  -> adds a paper-coloured backdrop (previews only)
//
// Built with the same kit as the pilot (kit/sticker-lib.mjs, kit/pen.mjs, kit/blocks.mjs).
// Drawing order, back to front: tail + tail glove, legs + boots, torso (belt, chest panel), arms with fused shoulders,
// banana + gripping mitt, neck ring, helmet (ears, shell, visor, monkey face), planet + sparkles.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createSticker } from './kit/sticker-lib.mjs'
import { limb, limbOutline, capsule, blob, rotPts, trPts, scPts, fmt, rrect, lerp, tube } from './kit/pen.mjs'
import { headFrame } from './kit/blocks.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || path.join(here, 'sticker-08.svg')
const BANANA_LEAN = Number(process.env.BL || 12)
const BUNCH = Number(process.env.BUNCH || 24)
const BR = Number(process.env.BR || 5), BLr = Number(process.env.BLR || -40)

const st = createSticker({
  title: 'Houston, we have bananas - doodle sticker 08',
  desc: 'A monkey floats in a puffy spacesuit, grinning inside the helmet visor and holding up a banana; a long tail ends in a tiny glove and a ringed planet drifts by. Concept illustration, art-directed by Pau, built with AI-assisted tools.',
  accent: '#66CBC7',
  seed: 31,
  root: process.env.ROOT || 'translate(22,2)',
})
const { shape, use, line, fillp, raw, clip, group, S } = st
const INK = st.cfg.ink

const P2 = (p) => `${fmt(p[0])} ${fmt(p[1])}`
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]]
const nrm = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l] }
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k]
const mid = (a, b, t = 0.5) => lerp(a, b, t)
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])
const frame = (c, tilt) => (pts) => trPts(rotPts(pts, tilt, [0, 0]), c[0], c[1])   // local -> canvas
const angleOf = (d) => (Math.atan2(d[1], d[0]) * 180) / Math.PI + 90               // rotation that turns "up" (0,-1) into d
const rot2 = (p, deg) => rotPts([p], deg, [0, 0])[0]

// ============================================================ FRAMES
const TC = [640, 826], TT = Number(process.env.TT || -30)                       // torso centre + tilt (head up-left, feet down-right)
const TL = frame(TC, TT)
const TFORM = `translate(${TC[0]} ${TC[1]}) rotate(${TT})`
const HT = Number(process.env.HT || -20)                                        // helmet tilt
const NECK = TL([[0, -196]])[0]                       // where the neck ring sits on the torso
const HC = add(sub(NECK, rot2([0, 196], HT)), [-26, 0])   // helmet centre: sits on that neck, nudged left so the right ear clears the banana
const fr = headFrame({ center: HC, tilt: HT, scale: 1 })
const HL = (pts) => fr.H(pts)
const HP = (p) => fr.hp(p)

// ============================================================ shared builders
function limbPart(id, axis, hw, cls = 'fa k') {
  const L = limb(axis, hw)
  const d = S(limbOutline(L), { closed: true })
  shape(id, d)
  clip('clip' + id, d)
  use(id, cls)
  return L
}
function sleeveFused(id, axis, hw) {                                   // fill only + two open edge lines: the shoulder melts into the torso
  const L = limb(axis, hw)
  const d = S(limbOutline(L), { closed: true })
  shape(id, d)
  clip('clip' + id, d)
  use(id, 'fa')
  line(S(L.A), 'k2'); line(S(L.B), 'k2')
  return L
}
/** edge points of a cross-section of segment k at fraction t (perpendicular to the segment, half width interpolated) */
function crossAt(axis, hw, k, t, over = 0) {
  const P = lerp(axis[k], axis[k + 1], t), d = nrm(sub(axis[k + 1], axis[k])), n = [-d[1], d[0]]
  const h = hw[k] + (hw[k + 1] - hw[k]) * t + over
  return [add(P, n, h), add(P, n, -h), d]
}
/** a straight stripe across segment k between fractions t0 and t1 (quad, perpendicular to the limb) */
function bandQuad(axis, hw, k, t0, t1) {
  const [a0, b0] = crossAt(axis, hw, k, t0, -2), [a1, b1] = crossAt(axis, hw, k, t1, -2)
  return [a0, a1, b1, b0].map((p) => [...p, 'c'])
}
/** an accordion ring (a slightly bowed line) across segment k at fraction t */
function ring(axis, hw, k, t, bow = 8) {
  const [a, b, d] = crossAt(axis, hw, k, t, -3)
  return `M${P2(a)}Q${P2(add(mid(a, b), d, bow))} ${P2(b)}`
}
/** concentric wrinkle arcs on the OUTER side of a bend (elbow / knee) */
function bendWrinkles(L, axis, k, hw, radii = [0.46, 0.7], span = 34) {
  const P = axis[k]
  const eA = L.ends[k].A, eB = L.ends[k].B
  const outer = dist(eA, P) < dist(eB, P) ? eA : eB
  const o = nrm(sub(outer, P))
  for (const r of radii) {
    const a = rot2(o, -span), b = rot2(o, span), m = o
    line(`M${P2(add(P, a, hw * r))}Q${P2(add(P, m, hw * r * 1.12))} ${P2(add(P, b, hw * r))}`, 'k3')
  }
}
function cuff(id, L, axis, len = 38, flare = 9) {
  const n = axis.length
  const dEnd = nrm(sub(axis[n - 1], axis[n - 2])), nn = [-dEnd[1], dEnd[0]]
  const eA = add(L.ends[n - 1].A, nn, flare), eB = add(L.ends[n - 1].B, nn, -flare)
  const cA = add(eA, dEnd, len), cB = add(eB, dEnd, len)
  shape(id, S([eA, cA, cB, eB].map((p) => [...p, 'c']), { closed: true }))
  use(id)
  for (const t of [0.34, 0.68]) line(`M${P2(mid(eA, cA, t))}L${P2(mid(eB, cB, t))}`, 'k3')
  return { wc: mid(cA, cB), d: dEnd }
}

/** union outline: ink pass (fill + 20 px stroke) then accent fills on top: overlapping parts melt into one shape with a clean 10 px contour */
function union(ids) {
  for (const i of ids) raw(`<use href="#${i}" class="fi" style="stroke:${INK};stroke-width:20;stroke-linejoin:round"/>`)
  for (const i of ids) use(i, 'fa')
}
/** open waving mitt: chunky glove fingers (index, middle, ring, pinky counted from the thumb side), the thumb, then the palm on top
 *  (its contour is the knuckle line, same as the kit's hand-open). k = scale of the geometry (strokes stay constant), wc = wrist centre. */
function openMitt(id, wc, rot, k = 1) {
  const tf = `translate(${fmt(wc[0])} ${fmt(wc[1])}) rotate(${fmt(rot)})`
  const f = (pts) => scPts(pts, k, k, [0, 0])
  const fing = (bx, by, ang, len, w) => {
    const a = (ang * Math.PI) / 180, dd = [Math.sin(a), -Math.cos(a)], e = len - w / 2
    const p = (t, c = 0) => [bx + dd[0] * e * t - dd[1] * c, by + dd[1] * e * t + dd[0] * c]
    return S(capsule(f([p(0), p(0.55, 2), p(1, 0)]), [w / 2 * k, (w / 2 - 0.5) * k, (w / 2 - 1.5) * k]), { closed: true })
  }
  const parts = [
    ['pk', fing(44, -80, 17, 76, 31)], ['ri', fing(15, -88, 6, 98, 33)], ['mi', fing(-15, -90, -5, 108, 34)], ['in', fing(-44, -84, -16, 94, 33)],
    ['th', S(capsule(f([[-40, -8], [-66, -26], [-90, -34]]), [22 * k, 20 * k, 17 * k]), { closed: true })],
    ['pa', S(f([[-36, 12, 'c'], [-54, -22], [-62, -58], [-58, -84, 'c'], [-30, -94], [0, -96], [30, -94], [58, -84, 'c'], [62, -58], [54, -22], [36, 12, 'c']]), { closed: true })],
  ]
  for (const [n, d] of parts) { shape(id + n, d, { tf }); use(id + n) }
  if (k >= 1) for (const x of [-26, 4, 34]) raw(`<g transform="${tf}"><path class="fi" d="${blob(x, -44, 6, 6, { seed: 40 + x })}"/></g>`)
}

// ============================================================ 1. TAIL (back layer): solid ink S-curve ending in a tiny glove
const tailAxis = [[736, 1000], [650, 1092], [520, 1152], [420, 1232], [428, 1318], [380, 1378], [306, 1380], [262, 1330]]
group('tail', () => {
  const hw = [24, 24, 22, 21, 21, 20, 19, 18]
  shape('tail', S(tube(tailAxis, hw.map((w) => w * 2)), { closed: true }))
  use('tail', 'fi')
  line(S([[640, 1096], [522, 1142], [432, 1214]]), 'sh')
  line(S([[424, 1284], [394, 1328], [352, 1346]]), 'sh')
  // tiny glove at the tip: cuff ring + a chubby mitten (palm + thumb), waving up-left
  const d = nrm(sub(tailAxis[7], tailAxis[6])), nn = [-d[1], d[0]]
  const base = add(tailAxis[7], d, 4)
  const eA = add(base, nn, 33), eB = add(base, nn, -33)
  const cA = add(eA, d, 30), cB = add(eB, d, 30)
  shape('tailCuff', S([eA, cA, cB, eB].map((p) => [...p, 'c']), { closed: true }))
  use('tailCuff')
  line(`M${P2(mid(eA, cA))}L${P2(mid(eB, cB))}`, 'k3')
  openMitt('tg', mid(cA, cB), angleOf(d), 0.7)
})

// ============================================================ 2. LEGS + BOOTS
const axLL = [[706, 946], [530, 1034], [638, 1232]], hwLL = [72, 66, 54]          // left leg: knee up and out
const axRL = [[772, 946], [896, 1140], [914, 1334]], hwRL = [68, 66, 54]          // right leg: stretched down-right
let LLg, RLg
group('legs', () => {
  RLg = limbPart('legR', axRL, hwRL)
  LLg = limbPart('legL', axLL, hwLL)
  for (const [ax, hw, ts] of [[axLL, hwLL, [0.7, 0.82]], [axRL, hwRL, [0.7, 0.82]]]) for (const t of ts) line(ring(ax, hw, 1, t, 6), 'k3')
  const seam = []
  for (const [k, ts] of [[0, [0.3, 0.55, 0.8]], [1, [0.12, 0.3, 0.46]]]) for (const t of ts) seam.push(crossAt(axRL, hwRL, k, t, -26)[1])
  line(S(seam), 'st')
  bendWrinkles(LLg, axLL, 1, 66)
  raw(`<g transform="translate(552 1070) rotate(-24)"><path class="fa k" d="${rrect(-44, -44, 88, 88, 18)}"/><path class="st" d="${rrect(-30, -30, 60, 60, 9)}"/><path class="fi" d="M-24 -10 Q-18 20 8 24 Q22 24 26 10 Q8 14 -4 4 Q-16 -4 -24 -10Z"/><path class="fi" d="M-24 -10 L-27 -18"/></g>`)
})
function boot(id, ank, rot, flip) {
  const X = flip ? -1 : 1
  const tf = `translate(${fmt(ank[0])} ${fmt(ank[1])}) rotate(${rot})`
  const pts = [[-56, -44, 'c'], [56, -44, 'c'], [60, 34], [104, 56], [158, 86], [172, 112], [164, 134, 'c'], [-66, 134, 'c'], [-70, 92], [-62, 26]].map(([x, y, f]) => (f ? [x * X, y, f] : [x * X, y]))
  const d = S(pts, { closed: true })
  shape(id, d, { tf })
  clip('clip' + id, d)
  use(id, 'fi k')
  raw(`<g transform="${tf}"><g clip-path="url(#clip${id})">`)
  raw(`<path class="fa" d="M${-90 * X} -52 H${90 * X} V-14 H${-90 * X}Z"/>`)
  raw(`<path class="fp" d="M${-100 * X} 108 L${190 * X} 104 V150 H${-100 * X}Z"/><path class="k3" d="M${-100 * X} 108 L${190 * X} 104"/>`)
  raw('</g>')
  raw(`<path class="pp" d="M${-30 * X} 8 Q${-36 * X} 40 ${-30 * X} 76"/>`)
  for (let i = 0; i < 3; i++) raw(`<path class="k3" d="M${(70 + i * 28) * X} 112 V130"/>`)
  raw('</g>')
}
group('boots', () => {
  boot('bootR', axRL[2], BR, false)
  boot('bootL', axLL[2], BLr, true)
})

// ============================================================ 2b. ARMS (drawn BEHIND the torso: the shoulder ends hide inside the body, the torso contour stays intact)
const axLA = [[520, 806], [396, 852], [292, 776]], hwLA = [68, 68, 54]            // left arm: out to the left, forearm up-left (waving)
const axRA = [[700, 742], [916, 796], [872, 640]], hwRA = [68, 66, 52]            // right arm: a V, forearm up to the banana
let LA, RA, mittL, mittR
group('arm-left', () => {
  LA = limbPart('armL', axLA, hwLA)
  raw('<g clip-path="url(#clip' + 'armL' + ')">'); for (const t of [0.46, 0.68]) fillp(S(bandQuad(axLA, hwLA, 1, t, t + 0.13), { closed: true }), 'fi'); raw('</g>')
  bendWrinkles(LA, axLA, 1, 68)
  mittL = cuff('cuffL', LA, axLA)
})
group('arm-right', () => {
  RA = limbPart('armR', axRA, hwRA)
  raw('<g clip-path="url(#clip' + 'armR' + ')">'); for (const t of [0.5, 0.7]) fillp(S(bandQuad(axRA, hwRA, 1, t, t + 0.12), { closed: true }), 'fi'); raw('</g>')
  bendWrinkles(RA, axRA, 1, 66)
  mittR = cuff('cuffR', RA, axRA)
})
group('mitt-left', () => openMitt('ml', mittL.wc, angleOf(mittL.d), 1))

// ============================================================ 3. TORSO: barrel body, belt, chest panel
group('torso', () => {
  const pts = [[-96, -186, 'c'], [96, -190, 'c'], [150, -130], [172, -30], [168, 70], [140, 150], [80, 190], [0, 200], [-80, 190], [-140, 150], [-168, 70], [-172, -30], [-150, -130]]
  shape('torso', S(TL(pts), { closed: true }))
  clip('clipTorso', S(pts, { closed: true }))
  use('torso')
  raw(`<g transform="${TFORM}">`)
  raw(`<path class="st" d="M-126 -150 Q-152 -40 -132 78"/><path class="st" d="M126 -150 Q152 -40 132 78"/>`)      // dotted seams down the sides
  raw(`<g clip-path="url(#clipTorso)"><path class="fi" d="M-180 94 Q0 112 180 94 L180 134 Q0 152 -180 134Z"/></g>`)
  raw(`<path class="fa k3f" d="${rrect(-32, 100, 64, 46, 14)}"/>`)
  raw(`<path class="fi" d="${blob(0, 124, 7, 7, { seed: 3 })}"/>`)
  raw(`<path class="fa k" d="${rrect(-100, -112, 200, 136, 28)}"/>`)
  raw(`<path class="fp k3f" d="${rrect(-76, -92, 152, 58, 14)}"/>`)
  raw(`<path class="k3" d="M-60 -62 H-34 L-22 -80 L-6 -46 L8 -72 L18 -62 H60"/>`)
  raw(`<path class="fi" d="${blob(-54, -2, 15, 15, { seed: 7, wob: 0.03 })}"/><path class="fi" d="${blob(0, -2, 15, 15, { seed: 8, wob: 0.03 })}"/><path class="fa k3f" d="${blob(54, -2, 15, 15, { seed: 9, wob: 0.03 })}"/>`)
  raw('</g>')
})

// ============================================================ 5. BANANAS + gripping fist (drawn in the banana frame: origin = wrist centre, up = along the forearm)
group('banana', () => {
  const wc = mittR.wc
  const lean = BANANA_LEAN                                                      // degrees: the bananas lean away from the head
  // a plump crescent on a circle (radius R, +-A0): the lower end sits in the fist, the fat body is fully visible
  const R = 185, A0 = (52 * Math.PI) / 180, N = 18, yb = -62
  const cpt = (a) => [R * Math.cos(a) - R * Math.cos(A0), yb - R * (Math.sin(a) + Math.sin(A0))]
  const wd = (a) => 52 * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(a) / A0, 4)), 0.5) + 6
  const radial = (a) => [Math.cos(a), -Math.sin(a)]
  const drawBanana = (id, extra, ridges) => {
    const tf = `translate(${fmt(wc[0])} ${fmt(wc[1])}) rotate(${fmt(angleOf(mittR.d) + lean + extra)})`
    const Op = [], Ip = []
    for (let i = 0; i <= N; i++) {
      const a = -A0 + (2 * A0 * i) / N, c = cpt(a), w = wd(a)
      Op.push(add(c, radial(a), w)); Ip.push(add(c, radial(a), -w))
    }
    shape(id, S([...Op, ...Ip.reverse()], { closed: true }), { tf })
    use(id, 'fp k')
    raw(`<g transform="${tf}">`)
    const ridge = (du, i0, i1) => { const pts = []; for (let i = i0; i <= i1; i++) { const a = -A0 + (2 * A0 * i) / N; pts.push(add(cpt(a), radial(a), du * wd(a))) } return S(pts) }
    if (ridges) { raw(`<path class="k3" d="${ridge(-0.4, 5, 15)}"/>`); raw(`<path class="k3" d="${ridge(0.46, 6, 14)}"/>`) }
    else raw(`<path class="k3" d="${ridge(0.1, 5, 14)}"/>`)
    const tt = cpt(A0), tdir = [-Math.sin(A0), -Math.cos(A0)]                   // blossom end: small ink nub continuing the tip
    raw('</g>')
    shape(id + 'Nub', S(capsule([add(tt, tdir, -14), add(tt, tdir, 12)], [12, 10]), { closed: true }), { tf })      // registered: the nub sticks out of the banana, the halo must wrap it
    use(id + 'Nub', 'fi k3f')
    return tf
  }
  drawBanana('bananaB', BUNCH, false)                                           // the second banana of the bunch, behind
  const tf = drawBanana('banana', 0, true)
  // the fist: a thumb tip pressing over the top of the bananas (drawn first, its base hides behind the finger rolls), then four stacked finger rolls
  // (every roll is registered so the die-cut halo wraps the whole fist; its transform = banana frame + a little per-roll rotation)
  const fx = 6, fy = -56
  shape('thumbR', S(capsule([[fx + 40, fy - 6], [fx + 22, fy - 52], [fx - 6, fy - 84]], [21, 20, 18]), { closed: true }), { tf }); use('thumbR')
  const rolls = [[-58, 108, 36], [-56, 114, 38], [-54, 112, 38], [-50, 100, 34]]
  rolls.forEach(([x0, w, h], i) => { shape('roll' + i, rrect(fx + x0, fy - 62 + i * 31, w, h, h / 2), { tf: `${tf} rotate(${-3 + i * 2} ${fx} ${fy})` }); use('roll' + i) })
})

// ============================================================ 6. NECK RING + HELMET: ears, shell, rivets, visor with the monkey face
group('helmet', () => {
  for (const [sx, id, sd] of [[-1, 'earL', 11], [1, 'earR', 12]]) {                // ears: ink fur, paper inner
    const c = HP([sx * 226, 4])
    shape(id, blob(c[0], c[1], 54, 54, { seed: sd, wob: 0.03 }))
    use(id, 'fi k')
    const c2 = HP([sx * 228, 6])
    fillp(blob(c2[0], c2[1], 27, 27, { seed: sd + 5, wob: 0.04 }), 'fp')
  }
  const nk = HP([0, 198])
  shape('neck', blob(nk[0], nk[1], 140, 46, { rot: HT, wob: 0.01, seed: 8 }))
  use('neck')
  for (const x of [-120, -58, -30, 30, 58, 120]) {                                  // ribs on the neck ring (the shell covers their top); the clips sit between them
    const yb = 198 + 46 * Math.sqrt(1 - (x / 140) ** 2)
    line(`M${P2(HP([x, yb - 32]))}L${P2(HP([x * 1.02, yb - 9]))}`, 'k3')
  }
  for (const x of [-88, 0, 88]) {                                                  // three clips locking the helmet to the collar
    const yb = 198 + 46 * Math.sqrt(1 - (x / 140) ** 2) - 14
    const c = HP([x, yb])
    raw(`<g transform="translate(${fmt(c[0])} ${fmt(c[1])}) rotate(${HT})"><path class="fa k3f" d="${rrect(-15, -13, 30, 26, 7)}"/><path class="fi" d="${blob(0, 0, 4.5, 4.5, { seed: 60 + x })}"/></g>`)
  }
  shape('shell', blob(HC[0], HC[1], 220, 208, { rot: HT, wob: 0.012, seed: 4 }))
  use('shell')
  for (let i = 0; i < 9; i++) {                                                     // a row of rivets on the shell above the visor
    const a = ((-165 + i * 18.75) * Math.PI) / 180
    const c = HP([2 + 200 * Math.cos(a), 3 + 178 * Math.sin(a)])
    fillp(blob(c[0], c[1], 8, 8, { seed: 70 + i, wob: 0.05 }), 'fi')
  }
  const vc = HP([4, 14])
  const visorD = blob(vc[0], vc[1], 168, 138, { rot: HT, wob: 0.008, seed: 5 })
  shape('visor', visorD, { halo: false })
  clip('clipVisor', visorD)
  const V = (pts) => HL(pts.map(([x, y, f]) => (f === undefined ? [x + 4, y + 14] : [x + 4, y + 14, f])))   // visor-local -> canvas
  raw('<use href="#visor" class="fa k" style="stroke-width:22"/>')
  raw('<g clip-path="url(#clipVisor)">')
  const fur = []
  const R = [150, 128]
  for (let i = 0; i < 18; i++) {
    const a = Math.PI + (i / 17) * Math.PI
    const bump = i % 2 ? 0.9 : 1.0
    fur.push(i % 2 ? [Math.cos(a) * R[0] * bump, Math.sin(a) * R[1] * bump + 22, 'c'] : [Math.cos(a) * R[0] * bump, Math.sin(a) * R[1] * bump + 22])
  }
  fur.push([140, 130], [0, 160], [-140, 130])
  fillp(S(V(fur), { closed: true }), 'fi')
  const heart = [[0, -44, 'c'], [-34, -80], [-84, -76], [-108, -34], [-100, 18], [-72, 62], [-34, 92], [0, 100], [34, 92], [72, 62], [100, 18], [108, -34], [84, -76], [34, -80]]
  fillp(S(V(heart), { closed: true }), 'fp')
  for (const [x, s] of [[-50, 1], [50, 2]]) {
    const c = V([[x, -22]])[0]
    fillp(blob(c[0], c[1], 11, 16, { seed: 31 + s, wob: 0.03, rot: HT }), 'fi')
    fillp(blob(c[0] + 4, c[1] - 6, 4, 4, { seed: 50 + s }), 'fp')
  }
  line(S(V([[-74, -46], [-52, -62], [-28, -52]])), 'k2')                           // two raised, delighted brows
  line(S(V([[26, -54], [50, -64], [74, -48]])), 'k2')
  for (const x of [-10, 10]) { const c = V([[x, 14]])[0]; fillp(blob(c[0], c[1], 6, 6, { seed: 3 + x }), 'fi') }
  const mouth = S(V([[-60, 28, 'c'], [-20, 42], [22, 40], [62, 24, 'c'], [56, 62], [28, 82], [0, 86], [-28, 80], [-52, 60]]), { closed: true })
  clip('clipMouth', mouth)
  fillp(mouth, 'fi k')
  raw(`<g clip-path="url(#clipMouth)"><path class="fp" d="${S(V([[-70, 24], [-20, 38], [24, 36], [70, 20], [70, 44], [24, 56], [-20, 58], [-70, 46]]), { closed: true })}"/><path class="fa" d="${blob(...V([[2, 88]])[0], 30, 16, { seed: 5, rot: HT })}"/></g>`)
  raw('</g>')
  raw('<use href="#visor" class="k" style="fill:none;stroke-width:22"/>')
  raw(`<path class="pp" style="stroke-width:9" d="${S(V([[-138, -4], [-132, -62], [-96, -104]]))}"/>`)        // glass reflection: a long arc + a dot
  fillp(blob(...V([[-140, 28]])[0], 6, 6, { seed: 9 }), 'fp')
  raw(`<path class="pp" style="stroke-width:9" d="${S(V([[124, 52], [116, 84], [92, 108]]))}"/>`)
})

// ============================================================ 7. PLANET + sparkles
group('extras', () => {
  const PC = [196, 246], RX = 100, RY = 29
  const ptf = `translate(${PC[0]} ${PC[1]}) rotate(-20)`
  raw(`<g transform="${ptf}"><path class="k2" style="stroke-width:12" d="M${-RX} 0 A${RX} ${RY} 0 0 1 ${RX} 0"/></g>`)
  shape('planet', blob(PC[0], PC[1], 58, 58, { seed: 4, wob: 0.02 }))
  use('planet')
  for (const [dx, dy, r, s] of [[-22, -24, 8, 1], [20, 26, 6, 2], [30, -18, 5, 3]]) raw(`<path class="fi" d="${blob(PC[0] + dx, PC[1] + dy, r, r, { seed: 20 + s })}"/>`)
  raw(`<g transform="${ptf}"><path class="k2" style="stroke-width:12" d="M${-RX} 0 A${RX} ${RY} 0 0 0 ${RX} 0"/></g>`)
  shape('ringReg', blob(PC[0], PC[1], RX, RY, { rot: -20, seed: 2, wob: 0.0 }))
  const spark = 'M0 -26Q4 -5 26 0Q4 5 0 26Q-4 5 -26 0Q-4 -5 0 -26Z'
  for (const [id, x, y, s] of [['sp1', 870, 150, 1.15], ['sp2', 1040, 700, 0.9]]) {
    shape(id, spark, { tf: `translate(${x} ${y}) scale(${s})` })
    use(id, 'fi')
  }
})

st.write(OUT)
