// sticker-06 "Case of the missing sock" - trench-coated detective (accent: tomato #FE7D6C).
//
//   node art-src/illustration/sticker-06.build.mjs            -> art-src/illustration/sticker-06.svg
//   FX=0 node art-src/illustration/sticker-06.build.mjs x.svg -> fast draft without filters
//   BG=1 ...                                                  -> adds a paper-coloured backdrop (previews only)
//
// Built on the pilot's recipe (kit/sticker-lib.mjs + kit/pen.mjs + kit/blocks.mjs). Pose: stalking lean (20 deg), back foot on its
// toes with the heel up, one eye hugely magnified by an oversized lens, the other hand at the hip pinching a striped sock.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createSticker } from './kit/sticker-lib.mjs'
import { limb, limbOutline, capsule, blob, rotPts, trPts, scPts, fmt, rrect, lerp } from './kit/pen.mjs'
import { headFrame, ear, fedora } from './kit/blocks.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || path.join(here, 'sticker-06.svg')

const st = createSticker({
  title: 'Case of the missing sock - doodle sticker 06',
  desc: 'A trench-coated detective in a fedora creeps forward, one eye hugely magnified by an oversized lens, pinching a single striped sock. Concept illustration, art-directed by Pau.',
  accent: '#FE7D6C',
  seed: 23,
  root: 'translate(-1,-114) scale(1.045)',
})
const { shape, use, line, fillp, raw, clip, group, S } = st

// ---------------------------------------------------------------- helpers
const P2 = (p) => `${fmt(p[0])} ${fmt(p[1])}`
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]]
const nrm = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l] }
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k]
const mid = (a, b, t = 0.5) => lerp(a, b, t)
const len = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])
const poly = (pts) => 'M' + pts.map(P2).join('L') + 'Z'
const rotv = (v, deg) => rotPts([v], deg, [0, 0])[0]
const cosd = (d) => Math.cos((d * Math.PI) / 180), sind = (d) => Math.sin((d * Math.PI) / 180)
function elbowPos(Sp, W, l1, l2, sign = 1) {
  const d = len(Sp, W), u = nrm(sub(W, Sp)), a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(l1 * l1 - a * a, 0))
  return add(add(Sp, u, a), [-u[1], u[0]], sign * h)
}
function catmull(pts, per = 10) {
  const out = [], n = pts.length
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(i + 2, n - 1)]
    for (let j = 0; j < per; j++) {
      const t = j / per, t2 = t * t, t3 = t2 * t
      const g = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3)
      out.push([g(p0[0], p1[0], p2[0], p3[0]), g(p0[1], p1[1], p2[1], p3[1])])
    }
  }
  out.push(pts[n - 1])
  return out
}
function stripOutline(ctrl, w) {            // closed polygon around a centre line (footprint of open line art for the halo)
  const C = catmull(ctrl, 8), n = C.length
  const N = C.map((p, i) => { const a = C[Math.max(i - 1, 0)], b = C[Math.min(i + 1, n - 1)]; const t = nrm(sub(b, a)); return [-t[1], t[0]] })
  return poly([...C.map((p, i) => add(p, N[i], w / 2)), ...C.map((p, i) => add(p, N[i], -w / 2)).reverse()])
}

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
const HC = [452, 945], LEAN = 20                              // torso frame: origin = hip centre, torso leaning 20 deg forward (right)
const tl = (x, y) => { const q = rotv([x, y], LEAN); return [q[0] + HC[0], q[1] + HC[1]] }
const tlp = (pts) => pts.map(([x, y, f]) => { const q = tl(x, y); return f === undefined ? q : [...q, f] })

const HS = 0.92
const HEAD_C = [578, 458], HEAD_T = 9
const fr = headFrame({ center: HEAD_C, tilt: HEAD_T, scale: HS })
const HEADTF = `translate(${HEAD_C[0]} ${HEAD_C[1]}) rotate(${HEAD_T}) scale(${HS})`
const LENS = [742, 452], LR = 156, HA = 56                    // lens centre, radius, handle direction (deg, 0 = +x, down = +)

// ---------------------------------------------------------------- shoes: oxfords (ink, paper sole, laces)
const SOLE = 84
const shoePts = [[-46, -8, 'c'], [-54, 30], [-56, 68], [-48, SOLE, 'c'], [150, SOLE, 'c'], [188, 74], [198, 52], [174, 34], [118, 24], [76, 8], [40, -10, 'c']]
const shoeD = S(shoePts, { closed: true })
function shoe(id, ank, rot = 0) {
  const tf = `translate(${fmt(ank[0])} ${fmt(ank[1])}) rotate(${rot})`
  shape(id, shoeD, { tf }); use(id, 'fi k')
  clip('clip' + id, shoeD)
  raw(`<g transform="${tf}"><g clip-path="url(#clip${id})"><path class="fp" d="M-100 ${SOLE - 16} L260 ${SOLE - 18} L260 130 L-100 130Z"/><path class="k3" d="M-100 ${SOLE - 16} L260 ${SOLE - 18}"/></g>`)
  raw('<path class="pp" d="M96 26 L116 42"/><path class="pp" d="M70 14 L88 30"/><path class="pp" d="M122 36 L140 50"/></g>')
}

// ================================================================ 1. BACK LEG (screen-left): trousers, bare ankle, shoe on its toes
group('leg-back', () => {
  const ax = [[392, 1100], [310, 1236], [268, 1318]]
  const L = limb(ax, [46, 44, 40])
  shape('legB', S(limbOutline(L), { closed: true })); use('legB')
  const d = nrm(sub(ax[2], ax[1])), eA = L.ends[2].A, eB = L.ends[2].B
  const cA = add(eA, d, -34), cB = add(eB, d, -34)
  shape('cuffB', S([eA, eB, cB, cA].map((p) => [...p, 'c']), { closed: true })); use('cuffB')
  // bare ankle: skin continues below the cuff, with an ankle bone dot
  const ak = S(capsule([add(mid(eA, eB), d, -6), add(mid(eA, eB), d, 36)], [26, 22]), { closed: true })
  shape('ankleB', ak); use('ankleB')
  const ab = add(mid(eA, eB), d, 26)
  raw(`<path class="fi" d="${blob(ab[0] + 8, ab[1], 6, 6, { seed: 3 })}"/>`)
  shoe('shoeB', add(mid(eA, eB), d, 46), 40)
})

// ================================================================ 2. FRONT LEG (screen-right): trousers, striped sock, shoe flat on the ground
group('leg-front', () => {
  const ax = [[594, 1110], [672, 1214], [722, 1296]]
  const L = limb(ax, [48, 46, 42])
  const d = nrm(sub(ax[2], ax[1]))
  const ank = [754, GROUND - SOLE]
  shoe('shoeF', ank, 0)
  const sockTop = add(mid(L.ends[2].A, L.ends[2].B), d, -4)
  shape('sockF', S(capsule([sockTop, add(ank, [-6, 8])], [30, 28]), { closed: true })); use('sockF', 'fp k')
  const sd = nrm(sub(ank, sockTop)), nS = [-sd[1], sd[0]]
  for (const t of [0.30, 0.58, 0.86]) {
    const c = lerp(sockTop, ank, t)
    fillp(poly([add(c, nS, -30), add(c, nS, 30), add(add(c, nS, 30), [0, 12]), add(add(c, nS, -30), [0, 12])]), 'fi')
  }
  shape('legF', S(limbOutline(L), { closed: true })); use('legF')
  const eA = L.ends[2].A, eB = L.ends[2].B
  const cA = add(eA, d, -32), cB = add(eB, d, -32)
  shape('cuffF', S([eA, eB, cB, cA].map((p) => [...p, 'c']), { closed: true })); use('cuffF')
})

// ================================================================ 3. COAT: collar tab, torso, long skirt with a flaring back, lapels, belt, buttons
const hemPts = [[706, 1196], [636, 1220], [558, 1204], [490, 1220], [418, 1188], [340, 1198], [262, 1160], [176, 1106]]
group('coat', () => {
  const wR = tl(110, -60), wL = tl(-110, -60)
  const body = S([...tlp([[-124, -318, 'c'], [-58, -340], [52, -344], [128, -312, 'c'], [124, -190], [112, -60]]),
    [wR[0] + 52, 1010], ...hemPts.map((p, i) => (i === 0 ? [...p, 'c'] : p)), [wL[0] - 80, 1010], ...tlp([[-112, -190]])], { closed: true })
  shape('coat', body); use('coat')
})
group('coat-details', () => {
  // overlapping front panel (double-breasted): the front edge runs from the collar down to the hem
  const f0 = tl(22, -330), f1 = tl(26, -60)
  line(`M${P2(f0)} L${P2(f1)} Q${P2([552, 1060])} ${P2([604, 1214])}`, 'k2')
  // two columns of three ink buttons
  for (const [bx, by] of [[-30, -204], [-30, -150], [-30, -96], [74, -206], [74, -152], [74, -98]]) {
    const p = tl(bx, by)
    raw(`<path class="fi" d="${blob(p[0], p[1], 11, 11, { seed: Math.abs(bx * by) % 90 })}"/>`)
  }
  // flap pocket on the skirt
  const pk = [[566, 1010], [654, 1018], [648, 1060], [560, 1052]]
  shape('pocket', S(pk.map((p) => [...p, 'c']), { closed: true })); use('pocket')
  line('M566 1030 Q610 1044 654 1034', 'k3')
  // hatching on the shaded back/lower-left of the coat: 3 short strokes per group
  const hatch = (x, y, a, n = 3) => {
    const dx = cosd(a), dy = sind(a)
    let d = ''
    for (let i = 0; i < n; i++) { const ox = -dy * i * 14, oy = dx * i * 14; d += `M${fmt(x + ox)} ${fmt(y + oy)}l${fmt(dx * 36)} ${fmt(dy * 36)}` }
    return d
  }
  for (const [x, y] of [[320, 950], [262, 1040], [340, 1090], [234, 1112], [410, 1134]]) line(hatch(x, y, 58), 'k3')
})
group('belt', () => {
  const bl = S(tlp([[-114, -82, 'c'], [0, -74], [116, -86, 'c'], [116, -46, 'c'], [0, -36], [-114, -44, 'c']]), { closed: true })
  shape('belt', bl); use('belt', 'fi k')
  const bk = tl(30, -62)
  raw(`<g transform="translate(${fmt(bk[0])} ${fmt(bk[1])}) rotate(${LEAN})"><path class="fp k3f" d="${rrect(-30, -24, 60, 48, 10)}"/><path class="fi" d="${rrect(-6, -14, 12, 28, 5)}"/></g>`)
  shape('beltTail', S(tlp([[64, -50, 'c'], [88, -48, 'c'], [92, 14, 'c'], [68, 16, 'c']]), { closed: true })); use('beltTail', 'fi k')
})

// ================================================================ 4. LEFT ARM (akimbo) + pinching hand + the striped sock
const SH_L = tl(-116, -306), WR_L = [440, 930]
const EL_L = elbowPos(SH_L, WR_L, 190, 180, 1)
const PINCH = add(WR_L, rotv([34, 96], -6))
group('sock', () => {
  // the missing sock dangles from the pinch: paper body, ink stripes, scrunched cuff, heel and toe bend to the right
  const [px, py] = PINCH
  const sk = S([[px - 32, py - 4, 'c'], [px - 16, py - 16], [px, py - 6], [px + 16, py - 16], [px + 32, py - 4, 'c'], [px + 34, py + 96], [px + 82, py + 128], [px + 100, py + 176], [px + 66, py + 196], [px + 6, py + 176], [px - 22, py + 110]], { closed: true })
  shape('sockHeld', sk); use('sockHeld', 'fp k')
  clip('clipSockHeld', sk)
  let d = ''
  for (const [y0, y1] of [[22, 42], [66, 86], [110, 130], [154, 174]]) d += `M${px - 60} ${py + y0}H${px + 130}V${py + y1}H${px - 60}Z`
  raw(`<g clip-path="url(#clipSockHeld)"><path class="fi" d="${d}"/></g>`)
})
group('arm-left', () => {
  const cuffLen = 34, u = nrm(sub(WR_L, EL_L)), cs = add(WR_L, u, -cuffLen)
  const L = limb([SH_L, EL_L, cs], [54, 62, 44])
  shape('slvL', S(limbOutline(L), { closed: true })); use('slvL', 'fa')
  line(S([tl(-100, -300), ...L.B.slice(1)]), 'k2'); line(S([tl(-114, -224), ...L.A.slice(1)]), 'k2')
  creases(EL_L, SH_L, WR_L, [34, 46, 58], 22)
  const eA = L.ends[2].A, eB = L.ends[2].B, cA = add(eA, u, cuffLen), cB = add(eB, u, cuffLen)
  shape('cuffL', S([eA, cA, cB, eB].map((p) => [...p, 'c']), { closed: true })); use('cuffL')
  line(`M${P2(mid(eA, cA, 0.5))} L${P2(mid(eB, cB, 0.5))}`, 'k3')
  // hand pinching: palm + three curled fingers, index finger and thumb meeting on the sock cuff
  const T = `translate(${fmt(WR_L[0])} ${fmt(WR_L[1])}) rotate(-6)`
  shape('lhPalm', rrect(-38, 0, 76, 52, 22), { tf: T }); use('lhPalm')
  ;[-26, -6, 14].forEach((x, n) => { shape('lhC' + n, rrect(x - 11, 30, 22, 30, 11), { tf: T }); use('lhC' + n) })
  shape('lhIdx', S(capsule([[24, 30], [32, 62], [34, 92]], [14, 13, 11]), { closed: true }), { tf: T }); use('lhIdx')
  shape('lhThb', S(capsule([[40, 8], [58, 40], [50, 80]], [15, 14, 11]), { closed: true }), { tf: T }); use('lhThb')
})

// ================================================================ 5. HEAD: neck, face, features, brim shadow, fedora
group('head', () => {
  const nk = tl(0, -334)
  shape('neck', S([[nk[0] - 38, nk[1] - 70, 'c'], [nk[0] + 30, nk[1] - 64, 'c'], [nk[0] + 38, nk[1] + 10, 'c'], [nk[0] - 40, nk[1] + 12, 'c']], { closed: true })); use('neck', 'fa')
  // popped trench collar: a U-shaped band round the neck base with two upturned points
  shape('collarBand', S(tlp([[-66, -312, 'c'], [-62, -356, 'c'], [-34, -338], [0, -332], [34, -338], [62, -356, 'c'], [66, -312, 'c'], [34, -300], [0, -296], [-34, -300]]), { closed: true })); use('collarBand')
  const FACE = [[-98, -100], [-112, -26], [-100, 44], [-60, 108], [-8, 138], [48, 126], [92, 74], [112, 4], [106, -72], [0, -126]]
  shape('face', S(fr.H(FACE), { closed: true })); use('face')
  ear(st, fr, { hoop: false })
  const ec = fr.hp([-122, 24])
  shape('earHalo', blob(ec[0], ec[1], 46, 52, { seed: 9 }))                       // halo-only footprint of the ear (it sticks out of the face)
  const hs = (d) => d.replace(/-?\d+(\.\d+)?/g, (m) => fmt(parseFloat(m) * HS))   // bake the head scale into absolute path data
  raw(`<g transform="translate(${HEAD_C[0]} ${HEAD_C[1]}) rotate(${HEAD_T})">`)
  raw(`<path class="fi" d="${blob(-84 * HS, 2 * HS, 11 * HS, 16 * HS, { seed: 31, wob: 0.03 })}"/><path class="fp" d="${blob(-80 * HS, -7 * HS, 4 * HS, 4 * HS, { seed: 32 })}"/>`)
  raw(`<path class="k2" d="${hs('M-92 -40 Q-62 -50 -30 -44')}"/>`)
  raw(`<path class="k2" d="${hs('M-2 -4 C4 10 12 22 10 34 C8 46 -6 54 -26 50')}"/>`)
  raw(`<path class="k2" d="${hs('M-46 96 Q-18 106 18 98')}"/><path class="k3" d="${hs('M-50 86 L-46 98')}"/>`)
  raw('</g>')
  const frHat = headFrame({ center: fr.hp([0, -16]), tilt: HEAD_T + 3, scale: HS })
  fedora(st, frHat)
})

// ================================================================ 6. MAGNIFIER: handle, ring, glass with the giant eye
group('magnifier', () => {
  const tf = `translate(${LENS[0]} ${LENS[1]}) rotate(${HA})`
  const hl = LR + 282
  shape('lensHandle', S([[LR - 26, -24, 'c'], [LR + 40, -19], [hl - 12, -17, 'c'], [hl, -8], [hl, 8], [hl - 12, 17, 'c'], [LR + 40, 19], [LR - 26, 24, 'c']], { closed: true }), { tf })
  use('lensHandle', 'fi k')
  // grip bands on the visible part of the handle (accent rings on the ink cylinder, with a gap to the ring and to the fist)
  raw(`<g transform="${tf}"><path class="fa" d="M${LR + 38} -17 H${LR + 56} V17 H${LR + 38}Z M${LR + 76} -17 H${LR + 94} V17 H${LR + 76}Z M${LR + 114} -17 H${LR + 132} V17 H${LR + 114}Z"/></g>`)
  shape('lensRing', blob(LENS[0], LENS[1], LR, LR, { seed: 5, wob: 0.012 })); use('lensRing')
  const glass = blob(LENS[0], LENS[1], LR - 34, LR - 34, { seed: 6, wob: 0.012 })
  fillp(glass, 'fa k3f')
  raw(`<g transform="translate(${LENS[0]} ${LENS[1]})"><path class="pp" d="M-100 -22 Q-94 -64 -60 -90"/><path class="pp" d="M-88 22 L-86 30"/></g>`)
  // the giant eye
  raw(`<g transform="translate(${LENS[0] + 4} ${LENS[1] + 8})">`)
  raw('<path class="fp k" d="M-92 6 Q-46 -50 6 -52 Q58 -50 92 4 Q56 48 4 50 Q-48 50 -92 6Z"/>')
  raw(`<path class="fi" d="${blob(16, -2, 40, 40, { seed: 8, wob: 0.02 })}"/>`)
  raw(`<path class="fp" d="${blob(2, -14, 11, 11, { seed: 9 })}"/><path class="fp" d="${blob(30, 12, 5.5, 5.5, { seed: 10 })}"/>`)
  raw('<path class="k" fill="none" d="M-90 4 Q-46 -50 6 -52 Q58 -50 92 2" style="stroke-width:14"/>')
  raw('<path class="k3" d="M-74 -26 L-86 -42 M-44 -42 L-52 -60 M-12 -50 L-14 -68 M24 -52 L30 -70"/>')
  raw('<path class="k2" d="M-76 -76 Q-14 -112 54 -88"/>')
  raw('<path class="k3" d="M-52 60 Q-4 78 44 64"/>')
  raw('</g>')
})

// ================================================================ 7. RIGHT ARM: sleeve hanging down, forearm reaching out, fist round the handle
const FIST_X = LR + 214                                          // where the hand grips (along the handle)
const hRot = (x, y) => { const q = rotv([x, y], HA); return [LENS[0] + q[0], LENS[1] + q[1]] }
const WR_R = hRot(FIST_X, 78)
const SH_R = tl(120, -304)
const EL_R = elbowPos(SH_R, WR_R, 180, 180, 1)
group('arm-right', () => {
  const cuffLen = 32, wristLen = 16, u = nrm(sub(WR_R, EL_R)), ce = add(WR_R, u, -wristLen), cs = add(ce, u, -cuffLen)
  shape('wristR', S(capsule([ce, WR_R], [20, 19]), { closed: true })); use('wristR')
  const L = limb([SH_R, EL_R, cs], [48, 54, 42])
  shape('slvR', S(limbOutline(L), { closed: true })); use('slvR', 'fa')
  line(S([tl(100, -300), ...L.A.slice(1)]), 'k2'); line(S([tl(116, -222), ...L.B.slice(1)]), 'k2')
  creases(EL_R, SH_R, WR_R, [30, 42, 54], 22)
  const eA = L.ends[2].A, eB = L.ends[2].B, cA = add(eA, u, cuffLen), cB = add(eB, u, cuffLen)
  shape('cuffR', S([eA, cA, cB, eB].map((p) => [...p, 'c']), { closed: true })); use('cuffR')
  line(`M${P2(mid(eA, cA, 0.5))} L${P2(mid(eB, cB, 0.5))}`, 'k3')
  // fist (handle frame: +x along the handle): back of the hand / wrist block at +y, four finger bars hooking round the handle
  const FT = `translate(${LENS[0]} ${LENS[1]}) rotate(${HA}) translate(${FIST_X} 0)`
  shape('rfBack', rrect(-50, 8, 100, 58, 22), { tf: FT }); use('rfBack')
  for (let n = 0; n < 4; n++) { shape('rfB' + n, rrect(-42 + n * 28 - 15, -50, 30, 78, 15), { tf: FT }); use('rfB' + n) }
  shape('rfThumb', S(capsule([[-44, 40], [-30, 4], [-24, -22]], [15, 14, 12]), { closed: true }), { tf: FT }); use('rfThumb')
})

// ================================================================ 8. EXTRAS: a question mark by the hat
group('extras', () => {
  const q = [[-26, -14], [-22, -46], [8, -56], [38, -44], [40, -16], [24, 8], [10, 24], [10, 38]]
  const qt = 'translate(330 300) rotate(-12)'
  shape('qHook', stripOutline(q, 9), { tf: qt }); shape('qDot', blob(10, 68, 12, 12, { seed: 21 }), { tf: qt })
  raw(`<g transform="${qt}"><path class="k2" d="${S(q)}"/><path class="fi" d="${blob(10, 68, 12, 12, { seed: 21 })}"/></g>`)
})
console.log('arms: L', Math.round(len(SH_L, EL_L)), Math.round(len(EL_L, WR_L)), 'R', Math.round(len(SH_R, EL_R)), Math.round(len(EL_R, WR_R)), 'EL_L', EL_L.map(Math.round), 'EL_R', EL_R.map(Math.round), 'WR_R', WR_R.map(Math.round))

// halo-only filler (registered for the die-cut, never painted): closes the small window between the lens handle, the forearm and the coat
shape('haloFix', blob(794, 695, 24, 24, { seed: 5 }))

st.write(OUT)
