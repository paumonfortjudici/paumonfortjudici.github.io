// sticker-07 "Tuft happens" - rug-tufting maker kneeling at a frame (accent: pink #FF9FC5).
//
//   node art-src/illustration/sticker-07.build.mjs            -> art-src/illustration/sticker-07.svg
//   FX=0 node art-src/illustration/sticker-07.build.mjs x.svg -> fast draft without filters
//   BG=1 ...                                                  -> adds a paper-coloured backdrop (previews only)
//
// Built on the pilot's recipe (kit/sticker-lib.mjs + kit/pen.mjs + kit/blocks.mjs). Pose: kneeling on the right knee, torso leaning
// left into the work, tufting gun pressed on the cloth, tongue out; frame with a half-finished mushroom on the left, cable + yarn cones below.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createSticker } from './kit/sticker-lib.mjs'
import { limb, limbOutline, capsule, blob, rotPts, trPts, scPts, fmt, rrect, lerp } from './kit/pen.mjs'
import { headFrame, ear } from './kit/blocks.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || path.join(here, 'sticker-07.svg')

const st = createSticker({
  title: 'Tuft happens - doodle sticker 07',
  desc: 'A rug-tufting maker in dungarees kneels at a wooden frame, a chunky tufting gun punching loops of yarn into a half-finished mushroom rug, tongue out in concentration. Concept illustration, art-directed by Pau.',
  accent: '#FF9FC5',
  seed: 29,
  root: 'translate(-26,-30) scale(1.005)',
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
function stripOutline(ctrl, w) {            // closed polygon around a centre line (footprint of tubes / open line art for the halo)
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
const HIP = [900, 1090], LEAN = -22                           // torso frame: origin = hip centre, leaning 22 deg to the LEFT (towards the frame)
const tl = (x, y) => { const q = rotv([x, y], LEAN); return [q[0] + HIP[0], q[1] + HIP[1]] }
const tlp = (pts) => pts.map(([x, y, f]) => { const q = tl(x, y); return f === undefined ? q : [...q, f] })

const HEAD_C = [708, 606], HEAD_T = -16, HS = 1.0
const fr = headFrame({ center: HEAD_C, tilt: HEAD_T, scale: HS })
const HEADTF = `translate(${HEAD_C[0]} ${HEAD_C[1]}) rotate(${HEAD_T}) scale(${HS})`

// gun frame: origin = nose tip pressed on the cloth, +x towards the rear, tilted a little
const NOSE = [400, 905], GA = -10
const GTF = `translate(${NOSE[0]} ${NOSE[1]}) rotate(${GA})`
const gw = (x, y) => { const q = rotv([x, y], GA); return [NOSE[0] + q[0], NOSE[1] + q[1]] }

// ================================================================ 1. FRAME with the half-finished mushroom rug (everything inside is drawn untilted, then tilted 3 deg)
const FRAME_ROT = 3, FRAME_O = [345, 1380]
const FTF = `rotate(${FRAME_ROT} ${FRAME_O[0]} ${FRAME_O[1]})`
group('frame', () => {
  raw(`<g transform="${FTF}">`)
  // two wooden feet
  for (const [id, x] of [['footL', 150], ['footR', 450]]) {
    shape(id, rrect(x, 1370, 92, 110, 10), { tf: FTF }); raw(`<path class="fa k" d="${rrect(x, 1370, 92, 110, 10)}"/>`)
  }
  shape('frameOuter', rrect(130, 170, 430, 1210, 22), { tf: FTF })
  raw(`<path class="fa k" d="${rrect(130, 170, 430, 1210, 22)}"/>`)
  // wood grain on the bars
  raw('<path class="k3" d="M148 250 Q154 440 146 620 M148 900 Q152 1100 146 1260 M542 300 Q548 480 540 640 M542 940 Q546 1120 540 1290 M240 188 H360 M420 188 H500 M230 1352 H330"/>')
  raw(`<path class="fa k3f" d="${rrect(176, 216, 338, 1118, 8)}"/>`)
  // primary cloth: a sparse mesh of small crosses (not a grid)
  let cr = ''
  for (let y = 262; y < 1320; y += 72) for (let x = 216; x < 500; x += 72) cr += `M${x - 7} ${y}h14M${x} ${y - 7}v14`
  raw(`<path class="k3" style="stroke-width:6" d="${cr}"/>`)
  // the mushroom motif: geometry mapped (scale k about the stem base + a nudge) instead of a scaled group, so strokes stay 10 / 7 px
  const MK = 0.9, MP = [345, 962], MT = [-18, 66]
  const mx = (x) => MP[0] + (x - MP[0]) * MK + MT[0], my = (y) => MP[1] + (y - MP[1]) * MK + MT[1]
  const NUM = '(-?[0-9]+(?:[.][0-9]+)?)'
  const mp = (d) => d.replace(new RegExp(NUM + ' ' + NUM, 'g'), (_, a, b) => fmt(mx(+a)) + ' ' + fmt(my(+b)))     // absolute M / C / Q / L pairs only
  // mushroom stem: tufted down to a ragged edge at the gun's nose, the rest is a dotted guide line
  const stem = 'M300 656 C306 740 298 860 280 962 C318 982 378 982 414 962 C396 860 388 740 394 656Z'
  raw(`<path class="st" d="${mp(stem)}"/>`)
  const stemTuft = 'M300 656 C304 720 298 800 288 862 Q300 878 322 866 Q344 884 366 898 Q388 904 404 890 C400 820 390 740 394 656Z'
  raw(`<path class="fp k" d="${mp(stemTuft)}"/>`)
  // mushroom cap: tufted (cream yarn) with rows of loops and accent spots
  const cap = 'M208 648 C204 520 280 450 345 450 C410 450 486 520 482 648 C440 672 250 672 208 648Z'
  raw(`<path class="fp k" d="${mp(cap)}"/>`)
  const spots = [[296, 512, 34, 25, 1], [418, 566, 22, 18, 2], [338, 604, 16, 13, 3]]
  const inSpot = (x, y) => spots.some(([cx, cy, rx, ry]) => ((x - cx) / (rx + 17)) ** 2 + ((y - cy) / (ry + 13)) ** 2 < 1)
  const arc = (x, y, r) => `M${fmt(mx(x))} ${fmt(my(y))}a${fmt(r * MK)} ${fmt(r * MK)} 0 0 1 ${fmt(2 * r * MK)} 0`
  let lp = ''
  const inCap = (x, y, hw) => ((x - 345) / (137 - 10 - hw)) ** 2 + ((y - 648) / (198 - 14)) ** 2 < 1         // keep the loops ~10 px inside the cap outline
  // staggered rows of loops (brick pattern), skipping the spots and keeping ~14 px inside the cap outline
  const row = (y, x0) => { for (let x = x0; x < 480; x += 38) { const cx = x + 14; if (!inSpot(cx, y) && inCap(cx, y - 8, 14)) lp += arc(x, y, 14) } }
  ;[476, 512, 548, 584, 620].forEach((y, n) => row(y, 214 + (n % 2) * 20))
  raw(`<path class="k3" d="${lp}"/>`)
  let lp2 = ''
  for (const [y, n] of [[694, 3], [730, 3], [766, 3], [802, 3], [838, 2]]) for (let q = 0; q < n; q++) lp2 += arc(316 + q * 30 + (y === 838 ? 15 : 0), y, 10)
  raw(`<path class="k3" d="${lp2}"/>`)
  for (const [cx, cy, rx, ry, sd] of spots) raw(`<path class="fa k3f" d="${blob(mx(cx), my(cy), rx * MK, ry * MK, { seed: sd, wob: 0.03 })}"/>`)
  raw('</g>')
})

// ================================================================ 2. YARN CONES on the floor + a loose strand towards the gun
const cone = (id, cx, base, w, h, tilt = 0, flip = 1) => {
  const tf = `translate(${cx} ${base}) rotate(${tilt})`
  const body = S([[-w / 2, 0, 'c'], [w / 2, 0, 'c'], [w * 0.2, -h * 0.82], [0, -h, 'c'], [-w * 0.2, -h * 0.82]], { closed: true })
  shape(id, body, { tf }); clip('clip' + id, body)
  let wind = ''
  for (let y = -h * 0.74; y < 6; y += 24) wind += `M${-w} ${y + flip * w * 0.30}L${w} ${y - flip * w * 0.30}`
  raw(`<g transform="${tf}"><path class="fa k" d="${body}"/>`)
  raw(`<g clip-path="url(#clip${id})"><path class="k3" d="${wind}"/><path class="fp" d="M${-w} ${-h * 0.80} H${w} V${-h - 8} H${-w}Z"/><path class="k3" d="M${-w} ${-h * 0.80} H${w}"/></g>`)
  raw(`<path class="k" fill="none" d="${body}"/><path class="fi" d="${rrect(-w / 2 - 4, -12, w + 8, 14, 6)}"/></g>`)
}
group('cones', () => {
  cone('coneA', 282, 1462, 124, 232, -3, 1)
  cone('coneB', 396, 1472, 104, 176, 4, -1)
  cone('coneC', 484, 1474, 84, 128, -6, 1)
})
group('strand', () => {
  // the yarn is fed to the gun by the left hand: from the cone tip, a slack S-curve over the cloth, up to the fingers
  const pts = [[398, 1296], [410, 1236], [452, 1196], [496, 1150], [486, 1090], [452, 1052], [470, 996], [500, 940], [520, 884]]
  shape('strandShape', stripOutline(pts, 8)); raw(`<path class="k3" d="${S(pts)}"/>`)
})

// ================================================================ 3. CABLE: outlined tube leaving the gun's rear, looping behind the maker and across the floor to a two-prong plug
group('cable', () => {
  const cab = [gw(404, 4), [850, 800], [960, 784], [1030, 850], [1042, 980], [996, 1100], [1010, 1180], [1020, 1246]]
  // a chunky solid-ink power cable (34 px) with a dashed accent sheen along its upper edge
  shape('cable', stripOutline(cab, 34))
  raw(`<path class="tube-k" style="stroke-width:34" d="${S(cab)}"/>`)
  const dense = catmull(cab, 14), nn = dense.map((q, i) => { const u = dense[Math.max(i - 1, 0)], v = dense[Math.min(i + 1, dense.length - 1)]; const t = nrm(sub(v, u)); return [-t[1], t[0]] })
  const sheen = dense.map((q, i) => add(q, nn[i], 6))
  raw(`<path class="sh" style="stroke-dasharray:90 46" d="M${sheen.map(P2).join('L')}"/>`)
  const ptf = 'translate(1024 1262) rotate(76)'
  shape('plug', rrect(-6, -30, 52, 60, 12), { tf: ptf }); shape('plugProngs', 'M46 -18 h28 v12 h-28Z M46 6 h28 v12 h-28Z', { tf: ptf })
  raw(`<g transform="${ptf}"><path class="fi k" d="${rrect(-6, -30, 52, 60, 12)}"/><path class="fp k3f" d="M46 -18 h28 v12 h-28Z M46 6 h28 v12 h-28Z"/></g>`)
})

// ================================================================ 4. LEGS: wide rolled jeans, striped socks, slides (right knee on the floor, left foot flat in front)
// foot (local frame: ankle at the origin, +x towards the toes): striped sock + ink slide with an instep strap.
// the size is baked into the geometry (only +-1 mirroring in the transform) so strokes stay 10 px and the halo stays 38 px
const footPts0 = [[-30, -8, 'c'], [46, -8, 'c'], [98, 22], [114, 50], [102, 70, 'c'], [-30, 70, 'c']]
function foot(id, ank, dir, rot, flip = 1, size = 1) {
  const Z = size
  const tf = `translate(${fmt(ank[0])} ${fmt(ank[1])}) rotate(${rot}) scale(${dir} ${flip})`
  const sockD = S(footPts0.map(([x, y, c]) => [x * Z, y * Z, c]), { closed: true })
  const slideD = rrect(-38 * Z, 62 * Z, 166 * Z, 28 * Z, 14 * Z)
  const strapD = S([[44, -10, 'c'], [76, -4, 'c'], [84, 66, 'c'], [52, 70, 'c']].map(([x, y, c]) => [x * Z, y * Z, c]), { closed: true })
  const stripes = [[-6, 12], [32, 50], [70, 88]].map(([a, b]) => `M${fmt(a * Z)} ${fmt(-20 * Z)} H${fmt(b * Z)} V${fmt(90 * Z)} H${fmt(a * Z)}Z`).join('')
  shape(id + 'Slide', slideD, { tf }); shape(id + 'Sock', sockD, { tf }); shape(id + 'Strap', strapD, { tf })
  clip('clip' + id, sockD)
  raw(`<g transform="${tf}"><path class="fi k" d="${slideD}"/><path class="fp k" d="${sockD}"/><g clip-path="url(#clip${id})"><path class="fi" d="${stripes}"/></g><path class="fi k" d="${strapD}"/></g>`)
}
group('leg-right', () => {
  const HR = [892, 1106], KR = [846, 1398], AR = [986, 1424]
  const L = limb([HR, KR, AR], [76, 70, 50])
  foot('footR', [AR[0] + 22, 1470 - 6], 1, 0, -1, 0.86)
  shape('legR', S(limbOutline(L), { closed: true })); use('legR')
  creases(KR, HR, AR, [38, 52, 66], 24)
  const d = nrm(sub(AR, KR)), eA = L.ends[2].A, eB = L.ends[2].B, cA = add(eA, d, -36), cB = add(eB, d, -36)
  shape('cuffR2', S([eA, eB, cB, cA].map((p) => [...p, 'c']), { closed: true })); use('cuffR2')
  line(`M${P2(mid(eA, cA, 0.5))} L${P2(mid(eB, cB, 0.5))}`, 'st')
})
group('leg-left', () => {
  const HL = [820, 1112], KL = [660, 1180], AL = [650, 1372]
  const L = limb([HL, KL, AL], [76, 66, 52])
  foot('footL', [AL[0] + 4, GROUND - 88 - 2], -1, 0)
  shape('legL', S(limbOutline(L), { closed: true })); use('legL')
  creases(KL, HL, AL, [38, 52, 66], 24)
  const d = nrm(sub(AL, KL)), eA = L.ends[2].A, eB = L.ends[2].B, cA = add(eA, d, -36), cB = add(eB, d, -36)
  shape('cuffL2', S([eA, eB, cB, cA].map((p) => [...p, 'c']), { closed: true })); use('cuffL2')
  line(`M${P2(mid(eA, cA, 0.5))} L${P2(mid(eB, cB, 0.5))}`, 'st')
})

// ================================================================ 5. TORSO: tee, shoulder straps; APRON: bib + lap draped over the thighs with three yarn-scrap pockets
group('torso', () => {
  const tee = [[-132, -284, 'c'], [-70, -312], [70, -312], [132, -284, 'c'], [138, -170], [128, -40, 'c'], [60, -14], [-60, -14], [-128, -40, 'c'], [-138, -170]]
  shape('tee', S(tlp(tee), { closed: true })); use('tee')
})
group('apron', () => {
  const wL = tl(-100, -34), wR = tl(100, -34)
  const apron = S([...tlp([[-84, -204, 'c'], [84, -204, 'c']]), [wR[0] + 10, wR[1] + 20, 'c'], [996, 1236, 'c'], [892, 1256], [790, 1244, 'c'], [wL[0] - 8, wL[1] + 30, 'c']], { closed: true })
  shape('apron', apron); use('apron')
  line(S([wL, [mid(wL, wR)[0], mid(wL, wR)[1] + 10], wR]), 'k3')
  // three patch pockets full of yarn scraps (ink loops with paper tips)
  for (const [i, px] of [820, 892, 964].entries()) {
    const id = 'pocket' + i
    shape(id, S([[px - 31, 1146, 'c'], [px + 31, 1146, 'c'], [px + 31, 1206, 'c'], [px, 1214], [px - 31, 1206, 'c']], { closed: true })); use(id)
    for (const [dx, h] of [[-11, 52], [11, 42]]) {
      const a = [px + dx, 1144], b = [px + dx + (dx < 0 ? -7 : 7), 1144 - h]
      raw(`<path class="k3" d="M${P2(a)} Q${P2(add(mid(a, b), [dx < 0 ? -13 : 13, 0]))} ${P2(b)}"/>`)
      raw(`<path class="fp k3f" d="${blob(b[0], b[1], 11, 11, { seed: i * 3 + (dx > 0 ? 1 : 0) + 80 })}"/>`)
    }
  }
})

// ================================================================ 6. ARMS (sleeves before the gun, hands after it)
function elbowSleeve(idP, SHp, ELp, WRp, hw, cuffLen, wristHw, wristLen) {
  const u = nrm(sub(WRp, ELp)), ce = add(WRp, u, -wristLen), cs = add(ce, u, -cuffLen)
  shape(idP + 'Wrist', S(capsule([ce, WRp], [wristHw, wristHw - 1]), { closed: true })); use(idP + 'Wrist')
  const L = limb([SHp, ELp, cs], hw)
  shape(idP + 'Dome', blob(SHp[0], SHp[1], hw[0], hw[0], { seed: 61 })); use(idP + 'Dome')
  shape(idP + 'Slv', S(limbOutline(L), { closed: true })); use(idP + 'Slv', 'fa')
  line(S(L.A), 'k2'); line(S(L.B), 'k2')
  creases(ELp, SHp, WRp, [32, 44, 56], 22)
  const eA = L.ends[2].A, eB = L.ends[2].B, cA = add(eA, u, cuffLen), cB = add(eB, u, cuffLen)
  shape(idP + 'Cuff', S([eA, cA, cB, eB].map((p) => [...p, 'c']), { closed: true })); use(idP + 'Cuff')
  for (const t of [0.34, 0.67]) line(`M${P2(mid(eA, cA, t))} L${P2(mid(eB, cB, t))}`, 'k3')
  return L
}
const WR_R = gw(356, 140), SH_R = tl(120, -270)                 // right fist round the pistol grip, forearm arriving from the right
const EL_R = elbowPos(SH_R, WR_R, 182, 178, -1)
const WR_L = gw(136, 72), SH_L = tl(-120, -270)                 // left hand under the nozzle
const EL_L = elbowPos(SH_L, WR_L, 182, 176, -1)
group('arm-right', () => { elbowSleeve('R', SH_R, EL_R, WR_R, [44, 54, 40], 32, 21, 20) })
group('arm-left', () => { elbowSleeve('L', SH_L, EL_L, WR_L, [44, 54, 40], 32, 21, 22) })

group('gun', () => {
  const gu = (id, d) => shape(id, d, { tf: GTF })
  // pistol grip (behind the body), nozzle, body, foot plate, spool, trigger
  const grip = S([[266, 50, 'c'], [338, 50, 'c'], [350, 150, 'c'], [294, 156, 'c']], { closed: true })
  gu('gunGrip', grip); use('gunGrip', 'fi k')
  const noz = S([[14, -14, 'c'], [110, -36, 'c'], [110, 36, 'c'], [14, 14, 'c']], { closed: true })
  gu('gunNoz', noz); use('gunNoz')
  const body = rrect(100, -62, 286, 124, 34)
  gu('gunBody', body); use('gunBody', 'fi k')
  gu('gunFoot', rrect(-8, -34, 26, 68, 9)); use('gunFoot', 'fi k')
  raw(`<g transform="${GTF}">`)
  raw('<path class="fa" d="M168 -62 H190 V62 H168Z M214 -62 H236 V62 H214Z"/>')
  raw('<path class="pp" d="M334 -24 V-4 M352 -24 V-4 M370 -24 V-4"/>')
  raw('</g>')
  // yarn spool on top (paper, winding lines)
  const spool = rrect(130, -140, 100, 82, 16)
  gu('gunSpool', spool); raw(`<g transform="${GTF}"><path class="fp k" d="${spool}"/><path class="k3" d="M146 -122 L214 -86 M146 -100 L214 -64 M164 -130 L224 -96"/><path class="fi" d="${rrect(170, -152, 20, 18, 5)}"/></g>`)
  // trigger (accent) in front of the grip
  gu('gunTrig', S(capsule([[254, 56], [262, 100]], [12, 11]), { closed: true })); use('gunTrig')
  // the yarn strand from the spool down to the nose
  raw(`<g transform="${GTF}"><path class="k3" d="M132 -104 Q80 -96 40 -44 L6 -4"/></g>`)
})

// ================================================================ 7. HANDS (after the gun): right fist round the pistol grip with the index on the trigger, left open hand under the nozzle
group('hands', () => {
  // right fist (gun frame): four stacked finger bars, the top one reaching forward to the trigger; every part registered for the halo
  const RT = `${GTF} translate(312 108)`
  shape('rfBack', rrect(-40, 40, 80, 40, 18), { tf: RT }); use('rfBack')
  for (let n = 0; n < 4; n++) { shape('rfB' + n, rrect(n === 0 ? -66 : -42, -54 + n * 26, n === 0 ? 108 : 84, 30, 15), { tf: RT }); use('rfB' + n) }
  shape('rfThumb', S(capsule([[30, -2], [22, -34], [12, -58]], [13, 12, 11]), { closed: true }), { tf: RT }); use('rfThumb')
  // left open hand under the nozzle: palm-up mitt, three fingers curling forward
  ;[48, 64, 80].forEach((y, n) => { shape('lmF' + n, S(capsule([[70 - n * 6, y + 8], [26 - n * 6, y + 8]], [12, 11]), { closed: true }), { tf: GTF }); use('lmF' + n) })
  shape('lmPalm', rrect(66, 44, 84, 50, 22), { tf: GTF }); use('lmPalm')
})

// ================================================================ 8. HEAD: bob (ink mass), face, ear, knit brows + tongue, striped bandana headband, goggles pushed up
group('head', () => {
  const H = fr.H
  // back hair: a short bob hugging the head (ink), with paper lint dots
  const bob = [[-142, -30, 'c'], [-152, -120], [-112, -196], [-40, -226], [40, -228], [112, -198], [152, -122], [144, -30, 'c'], [140, 52], [118, 104], [76, 112], [60, 80], [-60, 80], [-76, 112], [-118, 104], [-140, 52]]
  shape('bob', S(H(bob), { closed: true })); use('bob', 'fi k')
  line(S(H([[-142, -120], [-156, -70], [-152, -20]])), 'sh'); line(S(H([[140, -132], [152, -84], [150, -42]])), 'sh')
  // bandana tails (behind the face, fluttering left)
  const tail = (id, pts, hw) => { shape(id, S(capsule(H(pts), hw.map((w) => w * HS)), { closed: true })); use(id) }
  tail('bTail1', [[-124, -92], [-152, -112], [-186, -118]], [16, 14, 10])
  tail('bTail2', [[-124, -92], [-154, -80], [-184, -58]], [15, 13, 9])
  const FACE = [[-98, -100], [-112, -26], [-100, 44], [-60, 108], [-8, 138], [48, 126], [92, 74], [112, 4], [106, -72], [0, -126]]
  shape('face', S(H(FACE), { closed: true })); use('face')
  ear(st, fr, { hoop: true })
  // features: dot eyes, knit angry brows, small nose, tongue out in concentration, effort marks
  raw(`<g transform="${HEADTF}">`)
  raw('<path class="fi" d="M-54 -14 m-11 0 a11 16 0 1 0 22 0 a11 16 0 1 0 -22 0Z"/><path class="fp" d="M-50 -22 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0Z"/>')
  raw('<path class="fi" d="M40 -20 m-11 0 a11 16 0 1 0 22 0 a11 16 0 1 0 -22 0Z"/><path class="fp" d="M44 -28 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0Z"/>')
  raw('<path class="k2" d="M-86 -62 Q-56 -52 -26 -38"/><path class="k2" d="M16 -38 Q46 -56 76 -64"/>')
  raw('<path class="fi" d="M0 26 m-9 0 a9 8 0 1 0 18 0 a9 8 0 1 0 -18 0Z"/>')
  raw('<path class="k2" d="M-36 86 Q0 106 36 86"/>')
  raw('<path class="fa k3f" d="M-2 94 C-4 112 6 130 22 128 C38 126 38 106 34 92Z"/><path class="k3" d="M16 98 V118"/>')
  raw('<path class="k3" d="M-96 46 L-84 62 M-76 40 L-64 56"/>')
  raw('</g>')
  // striped bandana headband across the hairline
  const topY = (x) => -128 + 28 * (x / 124) ** 2, botY = (x) => -96 + 24 * (x / 120) ** 2
  const band = S(H([[-126, -100, 'c'], [-62, -122], [0, -128], [62, -122], [126, -100, 'c'], [122, -72, 'c'], [62, -92], [0, -96], [-62, -92], [-122, -72, 'c']]), { closed: true })
  shape('band', band); use('band')
  for (const x of [-78, -26, 26, 78]) fillp(poly(H([[x - 11, topY(x - 11) + 3], [x + 11, topY(x + 11) + 3], [x + 11, botY(x + 11) - 3], [x - 11, botY(x - 11) - 3]])), 'fi')
  const kn = fr.hp([-128, -92])
  shape('knot', blob(kn[0], kn[1], 24 * HS, 22 * HS, { seed: 6 })); use('knot')
  // goggles pushed up on the hair: accent strap, two lens rings (paper glass)
  raw(`<g transform="${HEADTF}">`)
  raw('<path d="M-122 -152 Q0 -216 122 -152" fill="none" stroke="#FF9FC5" stroke-width="14" stroke-linecap="round"/>')
  raw('<path class="fa k" d="M-14 -178 H14 V-160 H-14Z"/>')
  for (const sx of [-1, 1]) {
    raw(`<path class="fa k" d="${blob(sx * 52, -176, 40, 40, { seed: 31 + sx, wob: 0.015 })}"/>`)
    raw(`<path class="fp k3f" d="${blob(sx * 52, -176, 25, 25, { seed: 35 + sx, wob: 0.015 })}"/>`)
    raw(`<path class="k3" d="M${sx * 52 - 14} -184 Q${sx * 52 - 8} -194 ${sx * 52 + 2} -194"/>`)
  }
  raw('</g>')
})

// ================================================================ 9. EXTRAS: vibration marks around the gun's nose
group('doodles', () => {
  const sp = (cx, cy, k) => `M${cx} ${fmt(cy - 26 * k)}Q${fmt(cx + 4 * k)} ${fmt(cy - 5 * k)} ${fmt(cx + 26 * k)} ${cy}Q${fmt(cx + 4 * k)} ${fmt(cy + 5 * k)} ${cx} ${fmt(cy + 26 * k)}Q${fmt(cx - 4 * k)} ${fmt(cy + 5 * k)} ${fmt(cx - 26 * k)} ${cy}Q${fmt(cx - 4 * k)} ${fmt(cy - 5 * k)} ${cx} ${fmt(cy - 26 * k)}Z`
  for (const [id, cx, cy, k] of [['sparkA', 806, 236, 1.05], ['sparkB', 1030, 392, 0.85]]) { shape(id, sp(cx, cy, k)); raw(`<path class="fi" d="${sp(cx, cy, k)}"/>`) }
  // a ball of yarn with a loose curly strand
  const bc = [926, 282], br = 46
  const ball = blob(bc[0], bc[1], br, br, { seed: 90, wob: 0.02 })
  shape('yarnBall', ball); clip('clipBall', ball)
  raw(`<path class="fa k" d="${ball}"/>`)
  const w = (dy, bow) => `M${bc[0] - 70} ${bc[1] + dy + 22} Q${bc[0]} ${bc[1] + dy - bow} ${bc[0] + 70} ${bc[1] + dy + 22}`
  raw(`<g clip-path="url(#clipBall)"><path class="k3" d="${w(-26, 50)} ${w(-4, 50)} ${w(18, 50)} ${w(40, 50)}"/></g>`)
  const strand = [[bc[0] + 34, bc[1] + 36], [bc[0] + 70, bc[1] + 62], [bc[0] + 58, bc[1] + 100], [bc[0] + 92, bc[1] + 112], [bc[0] + 110, bc[1] + 88]]
  shape('yarnTail', stripOutline(strand, 9)); raw(`<path class="k2" d="${S(strand)}"/>`)
})
console.log('arms: R', Math.round(len(SH_R, EL_R)), Math.round(len(EL_R, WR_R)), 'L', Math.round(len(SH_L, EL_L)), Math.round(len(EL_L, WR_L)), 'EL_R', EL_R.map(Math.round), 'EL_L', EL_L.map(Math.round), 'SH', SH_R.map(Math.round), SH_L.map(Math.round))

st.write(OUT)
