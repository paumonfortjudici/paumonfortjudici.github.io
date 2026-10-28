// sticker-01 "Boombox ollie" - the pilot of the doodle-sticker series (accent: lilac #C6B1FE).
//
//   node art-src/illustration/sticker-01.build.mjs            -> art-src/illustration/sticker-01.svg
//   FX=0 node art-src/illustration/sticker-01.build.mjs x.svg -> fast draft without filters
//   BG=1 ...                                                  -> adds a paper-coloured backdrop (previews only)
//
// This file is a WORKED EXAMPLE of the pipeline, read it top to bottom before building another sticker:
//   1. kit/sticker-lib.mjs gives the frame (css classes, halo, wobble, grain) and the painter helpers.
//   2. kit/pen.mjs turns hand-placed key points into smooth paths (smooth), bent limbs (limb), blobs, grids.
//      kit/blocks.mjs holds the head blocks (face, features, ear, hair, beanie ...), see section 5 and 8 below.
//   3. Every part = one closed shape registered with shape() (so it also feeds the halo) + use() for fill and
//      contour + a few open line() details on top. Parts are painted back to front, like a painter would.
//   4. Poses are drawn by thinking in garments: straight-cut hems, boxy tee, balloon sleeves, baggy trousers,
//      with tiny limbs/hands coming out of them. The silhouette first, details last.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createSticker } from './kit/sticker-lib.mjs'
import { limb, limbOutline, capsule, blob, rotPts, trPts, scPts, fmt, rrect, lerp } from './kit/pen.mjs'
import { headFrame, face, ear, features, hairBob, beanie } from './kit/blocks.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || path.join(here, 'sticker-01.svg')

const st = createSticker({
  title: 'Boombox ollie - doodle sticker 01',
  desc: 'A skater in plaid baggy trousers pops an ollie with a boombox on the shoulder and a rock-on hand. Concept illustration, art-directed by Pau, built with AI-assisted tools.',
  accent: '#C6B1FE',
  seed: 7,
  root: 'translate(4,-30)',        // fit transform: halo lands 67-75 px from every edge of the 1200 x 1600 canvas
})
const { shape, use, line, fillp, raw, clip, group, S } = st

const P2 = (p) => `${fmt(p[0])} ${fmt(p[1])}`
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]]
const nrm = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l] }
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k]
const mid = (a, b, t = 0.5) => lerp(a, b, t)
const dot = (x, y, r, seed = 1, cls = 'fi') => fillp(blob(x, y, r, r, { seed, wob: 0.04 }), cls)

// ============================================================ 1. BOARD (tilted -13deg about its centre: the ollie diagonal)
const BT = -13, BC = [580, 1345]
const BTF = `rotate(${BT} ${BC[0]} ${BC[1]})`
const onBoard = (x, y) => rotPts([[x, y]], BT, BC)[0]
const DY = 1347                                    // deck top at the centre, board frame
group('board', () => {
  for (const [cx, sd] of [[335, 3], [830, 5]]) {
    const cy = DY + 72
    shape(`truck${sd}`, S([[cx - 34, DY + 33, 'c'], [cx + 34, DY + 33, 'c'], [cx + 22, DY + 58, 'c'], [cx - 22, DY + 58, 'c']], { closed: true }), { tf: BTF })
    use(`truck${sd}`, 'fi')
    shape(`wheel${sd}`, blob(cx, cy, 44, 44, { seed: sd, wob: 0.02 }), { tf: BTF })
    use(`wheel${sd}`, 'fi')
    raw(`<g transform="${BTF}"><path class="fa" d="${blob(cx, cy, 15, 15, { seed: sd + 1, wob: 0.03 })}"/><path class="sh" d="M${cx - 31} ${cy - 6} Q${cx - 26} ${cy - 26} ${cx - 8} ${cy - 32}"/></g>`)
  }
  const deckD = S([[175, DY - 38, 'c'], [225, DY - 8], [300, DY], [580, DY + 3], [860, DY], [935, DY - 8], [985, DY - 38, 'c'], [985, DY - 14], [935, DY + 24], [860, DY + 32], [580, DY + 35], [300, DY + 32], [225, DY + 24], [175, DY - 14, 'c']], { closed: true })
  shape('deck', deckD, { tf: BTF })
  use('deck')
  raw(`<g transform="${BTF}"><path class="k3" d="M250 ${DY + 17} L910 ${DY + 17}"/></g>`)
})

// ============================================================ 2. SHOE GEOMETRY (placed from the deck contact points, so soles really sit on the board)
const SK = 1.2
const shoeSole = 104 * SK
function placeShoe(deckX) {
  const pd = onBoard(deckX, DY + 1)
  const v = rotPts([[0, -shoeSole]], BT, [0, 0])[0]
  return [pd[0] + v[0], pd[1] + v[1]]
}
const shoeR0 = placeShoe(345), shoeF0 = placeShoe(790)
const shoeFpts = [[-62, 0, 'c'], [-72, 40], [-78, 88], [-70, 104, 'c'], [120, 104, 'c'], [152, 92], [156, 66], [136, 46], [88, 34], [48, 14], [44, -2, 'c']]
const shoeRpts = shoeFpts.map(([x, y, f]) => [-x, y, f])
const sk = (pts) => scPts(pts, SK, SK, [0, 0])
const shoeFd = S(sk(shoeFpts), { closed: true }), shoeRd = S(sk(shoeRpts), { closed: true })
const shoeRtf = `translate(${fmt(shoeR0[0])} ${fmt(shoeR0[1])}) rotate(${BT})`
const shoeFtf = `translate(${fmt(shoeF0[0])} ${fmt(shoeF0[1])}) rotate(${BT})`
shape('shoeR', shoeRd, { tf: shoeRtf }); shape('shoeF', shoeFd, { tf: shoeFtf })
clip('clipShoeR', shoeRd); clip('clipShoeF', shoeFd)          // local frame: used inside the transformed detail group

// ============================================================ 3. LEGS: baggy plaid trousers (limb() = bent tube with mitred inner corner)
// the axes start INSIDE the tee/belt (hidden) so the two legs overlap naturally at the crotch
const ankleR = [shoeR0[0] + 2, shoeR0[1] - 6], ankleF = [shoeF0[0] + 4, shoeF0[1] - 6]
const axR = [[549, 864], [414, 1104], ankleR], hwR = [62, 104, 96]
const axF = [[640, 870], [838, 1068], ankleF], hwF = [60, 102, 94]
const legR = limb(axR, hwR), legF = limb(axF, hwF)
const legRd = S(limbOutline(legR), { closed: true }), legFd = S(limbOutline(legF), { closed: true })
shape('legR', legRd); shape('legF', legFd)
clip('clipLegR', legRd); clip('clipLegF', legFd)

function cuffBand(L, len = 34) {
  const [e1, e2] = [L.ends[1], L.ends[2]]
  const d = nrm(sub(mid(e2.A, e2.B), mid(e1.A, e1.B)))
  const a2 = add(e2.A, d, -len), b2 = add(e2.B, d, -len)
  return { quad: [e2.A, e2.B, b2, a2], a2, b2 }
}
// plaid: a straight grid per leg segment (thigh / shin), clipped to the leg and to the segment region, so the
// lines change direction at the knee crease like real baggy trousers. Big cells = calm, readable at thumbnail size.
function legPlaid(id, L, axis, hw, o) {
  const { along = [-0.42, 0.34], pitch = 60, start = 34, bow = 7, endGap = 26 } = o
  for (let k = 0; k < axis.length - 1; k++) {
    const P0 = axis[k], P1 = axis[k + 1], dd = nrm(sub(P1, P0)), nn = [-dd[1], dd[0]]
    const len = Math.hypot(P1[0] - P0[0], P1[1] - P0[1]), h = Math.max(hw[k], hw[k + 1]) * 1.15
    let seg = ''
    for (const u of along) {
      const w = u * (hw[k] + hw[k + 1]) / 2
      seg += `M${P2(add(add(P0, nn, w), dd, -30))}L${P2(add(add(P1, nn, w), dd, 30))}`
    }
    for (let t = (k === 0 ? start : 46); t < len - endGap; t += pitch) {   // endGap keeps lines away from the knee crease (no stubs)
      const c = add(P0, dd, t), a = add(c, nn, -h), b = add(c, nn, h), m = add(mid(a, b), [0, 1], 2 * bow)
      seg += `M${P2(a)}Q${P2(m)} ${P2(b)}`
    }
    const e0 = L.ends[k], e1 = L.ends[k + 1]
    clip(`${id}Seg${k}`, S([e0.A, e0.B, e1.B, e1.A].map((p) => [...p, 'c']), { closed: true }))
    raw(`<g clip-path="url(#${id}Seg${k})"><path class="k3" clip-path="url(#clip${id})" d="${seg}"/></g>`)
  }
}
function trouserLeg(id, shapeId, L, axis, hw, plaidOpts) {
  use(shapeId)
  legPlaid(id, L, axis, hw, plaidOpts)
  const c = cuffBand(L)
  fillp(S(c.quad.map((p) => [...p, 'c']), { closed: true }), 'fa k')                 // folded cuff
  line(`M${P2(mid(L.ends[2].A, c.a2))} L${P2(mid(L.ends[2].B, c.b2))}`, 'st')      // dotted stitch line on the cuff
}
group('leg-rear', () => {
  trouserLeg('LegR', 'legR', legR, axR, hwR, { pitch: 80, start: 112, along: [-0.36, 0.3] })
  // stitched knee patch: a calm island inside the plaid
  raw('<g transform="translate(446 1056) rotate(-26)">')
  fillp(rrect(-50, -50, 100, 100, 16), 'fa k')
  line(rrect(-36, -36, 72, 72, 9), 'st')
  fillp('M0 -17 Q3 -4 17 0 Q3 4 0 17 Q-3 4 -17 0 Q-3 -4 0 -17Z', 'fi')
  raw('</g>')
})
group('leg-front', () => {
  trouserLeg('LegF', 'legF', legF, axF, hwF, { pitch: 78, start: 98, along: [-0.36, 0.3], endGap: 70 })
  // articulated knee seam on the bent leg: it sits exactly on the boundary where the plaid changes direction
  const kA = legF.ends[1].A, kB = legF.ends[1].B, km = mid(kA, kB)
  line(`M${P2(kA)} Q${P2(add(km, [-6, 14]))} ${P2(kB)}`, 'k3')
})

// ---- shoes: solid ink masses with a paper sole, laces and eyelet dots (same recipe as the reference's shoes)
function shoeDetails(tf, clipId, dir) {
  const X = (x) => x * dir * SK, Y = (y) => y * SK
  raw(`<g transform="${tf}">`)
  raw(`<g clip-path="url(#${clipId})"><path class="fp" d="M${X(-100)} ${Y(80)} L${X(180)} ${Y(76)} L${X(180)} ${Y(130)} L${X(-100)} ${Y(130)}Z"/><path class="k3" d="M${X(-100)} ${Y(80)} L${X(180)} ${Y(76)}"/></g>`)
  for (let i = 0; i < 3; i++) raw(`<path class="pp" d="M${X(44 + i * 28)} ${Y(26 + i * 10)} L${X(60 + i * 28)} ${Y(44 + i * 10)}"/>`)
  raw(`<path class="fp" d="${blob(X(-10), Y(34), 6, 6, { seed: 21 })}"/>`)
  raw(`<path class="fp" d="${blob(X(-10), Y(56), 6, 6, { seed: 22 })}"/>`)
  raw(`<path class="pp" d="M${X(124)} ${Y(54)} Q${X(134)} ${Y(64)} ${X(131)} ${Y(72)}"/>`)
  raw('</g>')
}
group('shoes', () => {
  use('shoeR', 'fi'); use('shoeF', 'fi')
  shoeDetails(shoeRtf, 'clipShoeR', -1)
  shoeDetails(shoeFtf, 'clipShoeF', 1)
})

// ============================================================ 4. BELT
group('belt', () => {
  shape('belt', S([[456, 892, 'c'], [630, 896], [808, 870, 'c'], [806, 906, 'c'], [630, 934], [460, 928, 'c']], { closed: true }))
  use('belt', 'fi k')
  fillp(blob(648, 914, 21, 21, { seed: 41, wob: 0.03 }), 'fa k3f')
  dot(648, 914, 6, 42)
})

// ============================================================ 5. HEAD FRAME: hair, face and beanie share one tilted, scaled frame (kit/blocks.mjs)
const fr = headFrame({ center: [652, 436], tilt: 9, scale: 1 })

// ---- hair (back layer): one black mass with scalloped end, accent shine arcs
group('hair', () => hairBob(st, fr, { id: 'hairL' }))

// ============================================================ 6. TEE: boxy, drop-shouldered; equalizer print, three wrinkles
group('tee', () => {
  shape('tee', S([[466, 648], [490, 614, 'c'], [590, 574, 'c'], [690, 568, 'c'], [815, 586, 'c'], [834, 640], [826, 760], [814, 876, 'c'], [740, 886], [650, 892], [560, 888], [482, 878, 'c'], [470, 830], [463, 760]], { closed: true }))
  use('tee')
  const x0 = 586, base = 840
  const hs = [70, 108, 144, 96, 58]
  hs.forEach((h, i) => fillp(`M${x0 + i * 34 + 2} ${base} V${base - h + 10} a10 10 0 0 1 20 0 V${base}Z`, 'fi'))
  line('M476 812 Q500 826 512 852', 'k3')
  line('M490 856 Q512 864 526 884', 'k3')
  line('M572 868 Q578 882 574 896', 'k3')
  line('M722 862 Q716 880 720 896', 'k3')
})
group('neck', () => {
  shape('neck', S([[606, 530, 'c'], [704, 536, 'c'], [706, 590], [602, 586]], { closed: true }))
  use('neck', 'fa')
  line('M606 548 L603 578', 'k3')
  fillp(S([[584, 573, 'c'], [648, 606], [714, 569, 'c'], [708, 560, 'c'], [648, 590], [590, 561, 'c']], { closed: true }), 'fa k')     // ribbed collar
})

// ============================================================ 7. LEFT ARM: balloon sleeve, ribbed cuff, rock-on hand
group('arm-left', () => {
  const axis = [[498, 654], [425, 618], [352, 582], [296, 524], [250, 466]]
  const L = limb(axis, [70, 82, 80, 66, 52])
  shape('slvL', S(limbOutline(L), { closed: true }))
  use('slvL', 'fa')                                    // fill only: the shoulder end must not get a contour
  line(S(L.A), 'k2'); line(S(L.B), 'k2')               // ...so the two long edges are stroked as open lines
  line('M356 520 Q388 548 380 598', 'k3')
  line('M402 540 Q420 566 412 592', 'k3')
  line('M470 700 Q452 676 462 646', 'k3')
  const dEnd = nrm(sub(axis[4], axis[3]))
  const eA = L.ends[4].A, eB = L.ends[4].B
  const cA = add(eA, dEnd, 40), cB = add(eB, dEnd, 40)
  shape('cuffL', S([eA, cA, cB, eB].map((p) => [...p, 'c']), { closed: true })); use('cuffL')
  for (const t of [0.34, 0.67]) line(`M${P2(mid(eA, cA, t))} L${P2(mid(eB, cB, t))}`, 'k3')
  // rock-on hand: palm + two folded fingers + raised index and pinky + thumb across (all simple capsules)
  const wc = mid(cA, cB)
  const hand = (pts) => trPts(rotPts(scPts(pts, 1.12, 1.12, [0, 0]), -20, [0, 0]), wc[0], wc[1])
  const palm = S(hand([[-40, 12, 'c'], [-52, -26], [-58, -64], [-56, -98, 'c'], [48, -98, 'c'], [58, -62], [48, -24], [38, 12, 'c']]), { closed: true })
  const fold = (x, w) => S(capsule(hand([[x, -92], [x, -116]]), [w / 2, w / 2]), { closed: true })
  shape('hFold1', fold(-6, 28)); shape('hFold2', fold(20, 26)); use('hFold1'); use('hFold2')
  shape('hIdx', S(capsule(hand([[-38, -86], [-43, -134], [-45, -162]]), [18, 17, 15]), { closed: true }))
  shape('hPnk', S(capsule(hand([[40, -86], [45, -118], [50, -134]]), [15, 14, 13]), { closed: true }))
  shape('hPalm', palm)
  use('hIdx'); use('hPnk'); use('hPalm')
  shape('hThumb', S(hand([[52, -16, 'c'], [52, -48], [34, -74], [4, -88], [-20, -84], [-26, -66], [-8, -56], [18, -46], [32, -16, 'c']]), { closed: true }))
  use('hThumb')
})

// ============================================================ 8. HEAD: face, ear + earring, features, beanie (all from kit/blocks.mjs)
group('head', () => {
  face(st, fr)
  ear(st, fr)                                                                                  // accent ear (readable on the black hair) + paper hoop
  features(st, fr, { eyes: 'dot', brows: 'arch', nose: 'hook', mouth: 'grin' })                 // dot eyes with a glint, arched brows, hooked nose, open grin
  beanie(st, fr, { dome: 'ink' })                                                              // the black dome is the head's anchor mass (the reference does this with hair)
})

// ============================================================ 9. BOOMBOX: drawn axis-aligned in its own frame, then rotated -4deg
const BXC = [902, 470], BXA = -4
group('boombox', () => {
  const tf = `rotate(${BXA} ${BXC[0]} ${BXC[1]})`
  const W = 310, Hh = 238
  shape('boxDepth', rrect(BXC[0] - W / 2 + 16, BXC[1] - Hh / 2 + 14, W, Hh, 30), { tf })     // the black "thickness" offset (like the phone in the reference)
  shape('box', rrect(BXC[0] - W / 2, BXC[1] - Hh / 2, W, Hh, 30), { tf })
  use('boxDepth', 'fi')
  use('box')
  raw(`<g transform="${tf} translate(${BXC[0]} ${BXC[1]})">`)
  raw(`<path class="tube-k" d="M-88 -116 V-148 Q-88 -164 -72 -164 H72 Q88 -164 88 -148 V-116"/><path class="tube-a" d="M-88 -116 V-148 Q-88 -164 -72 -164 H72 Q88 -164 88 -148 V-116"/>`)   // outlined carrying handle
  raw(`<path class="k2" d="M112 -118 Q126 -186 94 -246"/>`)
  raw(`<path class="fi" d="${blob(94, -252, 13, 13, { seed: 9 })}"/>`)
  for (const sx of [-95, 95]) {
    raw(`<path class="fa k3f" d="${blob(sx, 30, 64, 64, { seed: 12 + sx, wob: 0.015 })}"/>`)
    raw(`<path class="fi" d="${blob(sx, 30, 44, 44, { seed: 13 + sx, wob: 0.015 })}"/>`)
    raw(`<path class="fa" d="${blob(sx, 30, 19, 19, { seed: 14 + sx, wob: 0.03 })}"/>`)
    raw(`<path class="fi" d="${blob(sx, 30, 7, 7, { seed: 15 + sx })}"/>`)
  }
  raw(`<path class="fp k3f" d="${rrect(-48, -98, 96, 50, 12)}"/>`)
  raw(`<path class="k3" d="${blob(-23, -73, 11.5, 11.5, { seed: 17 })}"/><path class="k3" d="${blob(23, -73, 11.5, 11.5, { seed: 18 })}"/>`)
  raw(`<path class="fi" d="${blob(0, -16, 11, 11, { seed: 19 })}"/><path class="fi" d="${blob(0, 24, 11, 11, { seed: 20 })}"/><path class="k3" d="M-15 62 H15"/>`)
  raw('</g>')
})

// ============================================================ 10. RIGHT ARM: V-shaped cradle under the box, curled fingers over its edge
group('arm-right', () => {
  const axis = [[800, 598], [872, 814], [996, 646]]
  const L = limb(axis, [58, 64, 50])
  shape('slvR', S(limbOutline(L), { closed: true }))
  use('slvR', 'fa')
  line(S([[742, 574], [790, 580], ...L.A.slice(1)]), 'k2')            // the tee's shoulder line flows into the sleeve edge
  line(S(L.B), 'k2')
  line('M846 742 Q882 766 880 806', 'k3')
  line('M872 726 Q902 748 904 782', 'k3')
  line('M944 722 Q958 744 950 770', 'k3')
  const dEnd = nrm(sub(axis[2], axis[1]))
  const eA = L.ends[2].A, eB = L.ends[2].B
  const cA = add(eA, dEnd, 38), cB = add(eB, dEnd, 38)
  shape('cuffR', S([eA, cA, cB, eB].map((p) => [...p, 'c']), { closed: true })); use('cuffR')
  for (const t of [0.34, 0.67]) line(`M${P2(mid(eA, cA, t))} L${P2(mid(eB, cB, t))}`, 'k3')
  const wc = mid(cA, cB)
  raw(`<g transform="translate(${fmt(wc[0])} ${fmt(wc[1])}) rotate(8)">`)
  const finger = (x, h, w, ang) => `<path transform="rotate(${ang} ${x} -40)" class="fa k" d="M${x - w / 2} -40 V${-40 - h + w / 2} a${w / 2} ${w / 2} 0 0 1 ${w} 0 V-40Z"/>`
  raw(finger(-33, 50, 25, -9) + finger(-10, 60, 26, -3) + finger(14, 56, 26, 4) + finger(37, 44, 23, 10))
  raw(`<path class="fa k" d="${S([[-46, 8, 'c'], [-52, -18], [-50, -44, 'c'], [52, -44, 'c'], [54, -18], [46, 8, 'c']], { closed: true })}"/>`)
  raw(`<path class="fa k" d="${S(capsule([[-40, -8], [-54, -26], [-60, -30]], [17, 16, 14]), { closed: true })}"/>`)
  raw('</g>')
})

// ============================================================ 11. EXTRAS: music notes (filled shapes, inside the die-cut so they get a halo too)
group('extras', () => {
  // heads, stems and beam are all registered for the halo: NO ink may stick out of the die-cut
  const note = (id, tf, heads, stems, beam) => {
    shape(id + 'H', heads, { tf }); shape(id + 'S', stems, { tf })
    use(id + 'H', 'fi')
    use(id + 'S', 'k3')
    shape(id + 'B', beam, { tf }); use(id + 'B', 'fi')
  }
  const h2 = blob(0, 0, 19, 14, { seed: 61, rot: -22 }) + blob(46, -10, 19, 14, { seed: 62, rot: -22 })
  note('note2', 'translate(1022 232)', h2, 'M17 -4V-80M63 -14V-90', 'M13 -76L67 -88V-72L13 -60Z')
  const h1 = blob(0, 0, 19, 14, { seed: 63, rot: -22 })
  note('note1', 'translate(918 204) scale(0.9)', h1, 'M17 -4V-68', 'M13 -68Q18 -50 46 -44L48 -33Q14 -40 13 -62Z')
})

st.write(OUT)
