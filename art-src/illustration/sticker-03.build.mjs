// sticker-03 "Coffee first, pixels later" - designer hugging a giant coffee cup (accent: sky #85CEF9).
//
//   node art-src/illustration/sticker-03.build.mjs            -> art-src/illustration/sticker-03.svg
//   FX=0 node art-src/illustration/sticker-03.build.mjs x.svg -> fast draft without filters
//   BG=1 ...                                                  -> paper-coloured backdrop (previews only)
//
// Built like the pilot: kit/sticker-lib.mjs (frame) + kit/pen.mjs (geometry) + kit/blocks.mjs (head blocks).
// Pose: standing hip-shot in front of the cup's left edge, weight on the left leg, the right shin crossed over it; torso leans into the
// cup, cheek on the lid's rim; one arm wraps across the cup's front (hand gripping its far side), the other is bent behind the back (hand on the hip). A drawing tablet with a half-finished bezier curve leans on the cup's foot.
// Order (back to front): far fingertips -> cup + steam -> far sleeve -> neck -> tee -> dungarees (legs, bib) -> sneakers -> near arm -> head -> tablet.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createSticker } from './kit/sticker-lib.mjs'
import { smooth, limb, limbOutline, capsule, tube, blob, blobPts, rotPts, trPts, scPts, fmt, rrect, lerp, rng } from './kit/pen.mjs'
import { headFrame, face, ear, features, hairCurly } from './kit/blocks.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || path.join(here, 'sticker-03.svg')

const st = createSticker({
  title: 'Coffee first, pixels later - doodle sticker 03',
  desc: 'A designer with curly hair hugs a paper coffee cup as tall as themselves, cheek resting on the lid, while a drawing tablet with a half-finished bezier curve leans at their feet. Concept illustration, art-directed by Pau, built with AI-assisted tools.',
  accent: '#85CEF9',
  seed: 13,
  root: 'translate(-90,-19)',
})
const { shape, use, line, fillp, raw, clip, group, S } = st
const PAPER = st.cfg.paper, INK = st.cfg.ink, ACC = st.cfg.accent

const P2 = (p) => `${fmt(p[0])} ${fmt(p[1])}`
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]]
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k]
const nrm = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l] }
const mid = (a, b, t = 0.5) => lerp(a, b, t)
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])
const dot = (x, y, r, seed = 1, cls = 'fi') => fillp(blob(x, y, r, r, { seed, wob: 0.04 }), cls)
const ang = (a, b) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI

/** stripes across the segments of a limb, perpendicular to the axis, slightly bowed; clipped to the limb */
function limbStripes(clipId, axis, hw, pitch, first, skip = 40, cls = 'k3') {
  let d = ''
  for (let k = 0; k < axis.length - 1; k++) {
    const P0 = axis[k], P1 = axis[k + 1], dd = nrm(sub(P1, P0)), nn = [-dd[1], dd[0]]
    const len = dist(P0, P1), h = Math.max(hw[k], hw[k + 1]) * 1.25
    for (let t = k === 0 ? first : skip + 6; t < len - skip; t += pitch) {
      const c = add(P0, dd, t), a = add(c, nn, -h), b = add(c, nn, h), m = add(mid(a, b), dd, 12)
      d += `M${P2(a)}Q${P2(m)} ${P2(b)}`
    }
  }
  raw(`<g clip-path="url(#${clipId})"><path class="${cls}" d="${d}"/></g>`)
}
/** ribbed band across a limb end (cuff), centred on c, axis direction angDeg */
function cuff(id, c, angDeg, w = 104, len = 44, r = 12) {
  const tf = `translate(${fmt(c[0])} ${fmt(c[1])}) rotate(${fmt(angDeg)})`
  shape(id, rrect(-len / 2, -w / 2, len, w, r), { tf })
  use(id)
  raw(`<g transform="${tf}"><path class="k3" d="${[-w / 4, 0, w / 4].map((y) => `M${fmt(-len / 2 + 10)} ${fmt(y)}H${fmt(len / 2 - 10)}`).join('')}"/></g>`)
}

/** balloon sleeve: fill-only limb (mitred inner corner, round outer corner) + a half-disc shoulder cap, the contour is drawn as open
 *  lines (two long edges + the cap arc) so the shoulder end melts into the body. stripes = [pitch, first, skip] */
function balloonSleeve(id, axis, hw, stripes) {
  const L = limb(axis, hw)
  const d = S(limbOutline(L), { closed: true })
  shape(id, d); clip('clip' + id, d)
  const r = hw[0], e = L.ends[0], dd = nrm(sub(axis[1], axis[0]))
  const capD = `M${P2(e.A)}A${r} ${r} 0 0 1 ${P2(e.B)}`
  shape(id + 'Cap', capD + 'Z')
  fillp(capD + 'Z', 'fa')
  use(id, 'fa')
  // two fills that only touch leave an anti-aliasing hairline: bridge the seam with an overlap patch
  fillp(`M${P2(add(e.A, dd, -5))}L${P2(add(e.B, dd, -5))}L${P2(add(e.B, dd, 9))}L${P2(add(e.A, dd, 9))}Z`, 'fa')
  line(capD, 'k2'); line(S(L.A), 'k2'); line(S(L.B), 'k2')
  if (stripes) limbStripes('clip' + id, axis, hw, ...stripes)
  return L
}

// ============================================================ 1. THE CUP (hero prop): lid, tapered body, ink corrugated sleeve, bean logo, steam
const CX = 768                                    // cup axis
const CT = 516, CB = 1428                         // body top (under the lid) / bottom
const halfW = (y) => 220 - ((y - CT) * 55) / (CB - CT) + 9 * Math.sin((Math.PI * (y - CT)) / (CB - CT))     // body half width: 220 at the lid, 165 at the foot, a little belly
const CUPTF = 'rotate(-2.5 768 1428)'

group('cup', () => {
  shape('cupBody', S([[CX - 220, CT, 'c'], [CX - 218, 700], [CX - 206, 980], [CX - 188, 1200], [CX - 174, 1396], [CX - 158, CB, 'c'], [CX + 158, CB, 'c'], [CX + 174, 1396], [CX + 188, 1200], [CX + 206, 980], [CX + 218, 700], [CX + 220, CT, 'c']], { closed: true }), { tf: CUPTF })
  use('cupBody')
  shape('cupFoot', S([[CX - 172, 1388, 'c'], [CX + 172, 1388, 'c'], [CX + 160, CB + 6, 'c'], [CX - 160, CB + 6, 'c']], { closed: true }), { tf: CUPTF })
  use('cupFoot')
})
group('cup-sleeve', () => {
  const y0 = 850, y1 = 1030, bow = 24
  const w0 = halfW(y0) + 6, w1 = halfW(y1) + 6
  const d = `M${fmt(CX - w0)} ${y0}Q${fmt(CX)} ${y0 + bow} ${fmt(CX + w0)} ${y0}L${fmt(CX + w1)} ${y1}Q${fmt(CX)} ${y1 + bow} ${fmt(CX - w1)} ${y1}Z`
  shape('cupSleeve', d, { tf: CUPTF })
  use('cupSleeve', 'fi k')
  let r = ''
  const n = 11
  for (let i = 0; i < n; i++) {
    const u = -0.86 + (1.72 * i) / (n - 1)
    const xt = CX + u * w0, xb = CX + u * w1
    const yt = y0 + 0.5 * (1 - u * u) * bow, yb = y1 + 0.5 * (1 - u * u) * bow
    r += `M${fmt(xt)} ${fmt(yt + 22)}L${fmt(xb)} ${fmt(yb - 22)}`
  }
  raw(`<g transform="${CUPTF}"><path class="sh" d="${r}"/></g>`)
})
group('cup-logo', () => {
  raw(`<g transform="${CUPTF} translate(${CX + 112} 636)"><path class="fa k2" d="${blob(0, 0, 62, 62, { seed: 44, wob: 0.02 })}"/><path class="k3" d="${blob(0, 0, 49, 49, { seed: 45, wob: 0.02 })}" style="stroke-dasharray:1 12;stroke-linecap:round"/><g transform="rotate(28)"><path class="fi" d="${blob(0, 0, 22, 33, { seed: 41, wob: 0.03 })}"/><path class="sh" d="M-4 -22Q8 -4 -3 22"/></g></g>`)
})
group('lid', () => {
  shape('lidRim', rrect(CX - 242, 478, 484, 46, 23), { tf: CUPTF })
  use('lidRim')
  shape('lidDome', S([[CX - 206, 486, 'c'], [CX - 184, 440], [CX - 110, 418], [CX, 414], [CX + 110, 418], [CX + 184, 440], [CX + 206, 486, 'c']], { closed: true }), { tf: CUPTF })
  use('lidDome')
  raw(`<g transform="${CUPTF}"><path class="fi" d="${blob(CX + 128, 446, 36, 9, { seed: 42, wob: 0.03, rot: -3 })}"/><path class="k3" d="M${CX - 10} 450Q${CX + 50} 438 ${CX + 76} 444"/></g>`)
})
group('steam', () => {
  shape('steamA', `M${CX + 118} 396C${CX + 82} 346 ${CX + 152} 312 ${CX + 118} 258C${CX + 86} 214 ${CX + 148} 190 ${CX + 122} 138`, { tf: CUPTF }); use('steamA', 'k2')
  shape('steamAext', `M${CX + 122} 138L${CX + 110} 106`, { tf: CUPTF })
  shape('steamB', `M${CX + 184} 392C${CX + 154} 354 ${CX + 214} 324 ${CX + 188} 280C${CX + 162} 244 ${CX + 210} 226 ${CX + 194} 196`, { tf: CUPTF }); use('steamB', 'k2')
  shape('steamBext', `M${CX + 194} 196L${CX + 184} 164`, { tf: CUPTF })
})

// ============================================================ 2. THE DESIGNER: far sleeve, neck, tee, dungarees, sneakers
const LEAN = 5, PIV = [490, 960]
const UB = (pts) => rotPts(pts, LEAN, PIV)
const UBTF = `rotate(${LEAN} ${PIV[0]} ${PIV[1]})`
const fr = headFrame({ center: [654, 488], tilt: 15, scale: 0.98 })
const { H: HF, hp } = fr

// far arm: bent behind the back (hand on the lower back): shoulder, upper arm and a round elbow poke out at the left, the forearm hides behind the hip
const farAxis = [UB([[430, 684]])[0], [340, 868], [436, 924]], farHw = [54, 58, 40]
group('far-sleeve', () => { balloonSleeve('farSleeve', farAxis, farHw, [60, 44, 40]) })
// neck (behind the tee's scoop neckline)
group('neck', () => {
  shape('neck', S(tube(UB([[600, 600], [606, 680]]), [96, 112]), { closed: true })); use('neck')
})
// tee body: long-sleeve tee with horizontal stripes, leaning into the cup (top shifted right of the hem)
group('tee', () => {
  const d = S(UB([[436, 668, 'c'], [506, 644], [552, 642], [576, 668], [606, 684], [636, 668], [662, 640], [672, 656, 'c'], [668, 760], [650, 860], [634, 930, 'c'], [496, 948], [392, 932, 'c'], [378, 860], [398, 760]]), { closed: true })
  shape('tee', d); clip('clipTee', d)
  use('tee')
})

// dungarees: baggy legs - weight on the left leg (hip pushed out, knee drifting back, foot turned out), the free leg relaxed with the knee
// bent towards the cup and the foot turned out the other way
const supAxis = [[392, 944], [368, 1190], [402, 1376]], supHw = [76, 72, 56]
const freeAxis = [[556, 944], [640, 1170], [572, 1376]], freeHw = [80, 74, 56]
const legSup = limb(supAxis, supHw), legFree = limb(freeAxis, freeHw)
/** a dotted seam running parallel to a limb, `inset` px inside its outer edge (side +1 = the A side, -1 = the B side) */
function seamD(axis, hw, side, inset = 24, from = 1, to = axis.length) {
  const pts = []
  for (let i = from - 1; i < to; i++) {
    const a0 = axis[Math.max(i - 1, 0)], a1 = axis[Math.min(i + 1, axis.length - 1)]
    const t = nrm(sub(a1, a0)), n = [-t[1], t[0]]
    pts.push(add(axis[i], n, side * (hw[i] - inset)))
  }
  return S(pts)
}
/** rolled cuff at the end of a limb: a band across the last 44 px (with a dotted stitch line) so the hem never shows a bare cut */
function hem(id, L, axis) {
  const e = L.ends[axis.length - 1], c = mid(e.A, e.B), dir = nrm(sub(axis[axis.length - 1], axis[axis.length - 2]))
  cuff(id, add(c, dir, -23), ang(axis[axis.length - 2], axis[axis.length - 1]), dist(e.A, e.B) + 8, 46, 12, true)
}
group('legs', () => {
  const ds = S(limbOutline(legSup), { closed: true }), df = S(limbOutline(legFree), { closed: true })
  shape('legSup', ds); shape('legFree', df)
  // halo-only filler for the gap between the legs (not painted): a narrow gap would otherwise leave a pinhole in the die-cut
  shape('legGap', S([[470, 980, 'c'], [540, 990, 'c'], [548, 1250], [520, 1372, 'c'], [458, 1372, 'c'], [446, 1190]], { closed: true }))
  use('legSup'); use('legFree')
  line(seamD(supAxis, supHw, 1, 24, 1, 3), 'st')
  line(seamD(freeAxis, freeHw, -1, 24, 1, 3), 'st')
  hem('hemSup', legSup, supAxis); hem('hemFree', legFree, freeAxis)
  // hip creases on the weight-bearing side + a thigh fold on the free leg
  line('M330 1010Q362 1030 356 1066', 'k3')
  line('M308 1046Q336 1060 330 1090', 'k3')
  line('M566 1104Q618 1128 676 1098', 'k3')
})
group('bib', () => {
  raw(`<g clip-path="url(#clipTee)"><g transform="${UBTF}"><path class="fa" d="M416 640H452V800H416Z"/><path class="k2" d="M416 640V800M452 640V800"/></g></g>`)
  shape('bibShape', rrect(406, 760, 182, 200, 22), { tf: UBTF }); use('bibShape')
  raw(`<g transform="${UBTF}">`)
  raw(`<path class="fa k" d="${rrect(420, 832, 118, 74, 12)}"/>`)
  dot(434, 722, 11, 3)                                     // strap button
  // pen, ruler (ticks) and brush sticking out of the pocket
  raw('<path class="fa k3f" d="M434 832V794Q434 784 443 784Q452 784 452 794V832Z"/>')
  raw('<path class="fp k3f" d="M466 834V772H490V834Z"/><path class="k3" d="M466 786H478M466 800H478M466 814H478"/>')
  raw('<path class="k2" d="M512 832V798"/><path class="fi" d="M506 798Q512 772 520 798Z"/>')
  raw('</g>')
})

group('waistband', () => {
  shape('waist', rrect(316, 920, 344, 50, 16), { tf: UBTF }); use('waist')
  raw(`<g transform="${UBTF}"><path class="st" d="${rrect(330, 934, 316, 22, 8)}"/></g>`)
})
// sneakers: kit low-top outline, chunky: ink body, paper sole, accent swoosh, paper laces
const SNK = 'M-62 22C-65.3 33.3 -69.7 44.4 -72 56C-74.4 68.5 -77 81.3 -76 94C-75.6 99.4 -70.7 103.3 -68 108C-4.7 108 58.7 108 122 108C133.3 104 147.5 104.5 156 96C161.7 90.3 161.5 79.2 158 72C153.9 63.4 144.9 57.2 136 54C121.4 48.9 105 51.6 90 48C74.2 44.2 58.8 38.8 44 32C33.9 27.4 26.8 16.4 16 14C4.9 11.5 -6.6 16.8 -18 18C-32.7 19.5 -47.3 20.7 -62 22Z'
function sneaker(id, tf) {
  shape(id, SNK, { tf })
  clip(id + 'Clip', SNK)
  use(id, 'fi')
  raw(`<g transform="${tf}">`)
  raw(`<g clip-path="url(#${id}Clip)"><path class="fp" d="M-100 92L180 88V140H-100Z"/><path class="k3" d="M-100 92L180 88"/></g>`)
  raw('<path class="sh" d="M-44 66Q30 36 112 62"/><path class="pp" d="M30 40L44 52M54 46L68 58"/>')
  raw(`<path class="fp" d="${blob(-4, 36, 6, 6, { seed: 5 })}"/>`)
  raw('</g>')
}
group('sneakers', () => {
  sneaker('shoeSup', 'translate(414 1368) scale(-1.04 1.04) rotate(3)')
  sneaker('shoeFree', 'translate(560 1368) scale(1.04) rotate(-3)')
})

// ============================================================ 3. NEAR ARM: striped balloon sleeve across the cup, ribbed cuff, hand gripping the far edge
const SH = [660, 700]                                         // the near shoulder (a round drop-shoulder cap)
const nearAx = [SH, [624, 818], [858, 790]], nearHw = [52, 62, 48]
group('near-arm', () => {
  balloonSleeve('nearArm', nearAx, nearHw, [64, 70, 34])
  cuff('cuffNear', [874, 782], -12, 92, 46, 12)
  shape('palmNear', blob(922, 778, 44, 46, { seed: 7, wob: 0.03 })); use('palmNear')
  ;[[744, 70], [768, 78], [792, 74], [816, 60]].forEach(([y, len], i) => {
    shape(`nf${i}`, S(tube([[930, y], [930 + len, y + 10]], [25, 23]), { closed: true })); use(`nf${i}`)
  })
  shape('thumbNear', S(tube([[902, 750], [934, 716]], [26, 22]), { closed: true })); use('thumbNear')
})

// ============================================================ 4. HEAD: curly hair, face, closed-eyes bliss, paper-clip earring, stylus behind the ear
group('head', () => {
  // stylus tucked behind the ear: drawn before the hair so it looks pushed into the curls
  const sT = hp([-250, -118]), sE = hp([-120, -34]), sA = ang(sT, sE), sL = dist(sT, sE)
  const stf = `translate(${fmt(sT[0])} ${fmt(sT[1])}) rotate(${fmt(sA)})`
  shape('stylus', `M0 0L34 -13H${fmt(sL - 10)}Q${fmt(sL)} -13 ${fmt(sL)} 0Q${fmt(sL)} 13 ${fmt(sL - 10)} 13H34Z`, { tf: stf })
  raw(`<g transform="${stf}">`)
  raw(`<path class="fa k3f" d="M34 -12H${fmt(sL - 10)}V12H34Z"/><path class="fp k3f" d="M0 0L34 -12V12Z"/><path class="fi" d="M0 0L14 -5V5Z"/>`)
  raw('</g>')
  ear(st, fr, { hoop: true })
  face(st, fr)
  for (const [ex, ey] of [[-54, -10], [40, -16]]) line(`M${P2(hp([ex - 24, ey - 2]))}Q${P2(hp([ex, ey + 26]))} ${P2(hp([ex + 24, ey - 2]))}`, 'k2')
  line(S(HF([[-10, 26], [0, 36], [10, 26]])), 'k2')
  line(S(HF([[-44, 82], [0, 116], [44, 82]])), 'k2')
  line(`M${P2(hp([-90, 40]))}L${P2(hp([-82, 58]))}M${P2(hp([-70, 36]))}L${P2(hp([-62, 54]))}M${P2(hp([66, 34]))}L${P2(hp([74, 52]))}M${P2(hp([86, 30]))}L${P2(hp([94, 48]))}`, 'k3')
  hairCurly(st, fr)
})

// ============================================================ 5. TABLET: ink bezel, paper screen with a half-finished bezier, colour dots, pen across the bezel
group('tablet', () => {
  const tf = 'translate(926 1292) rotate(-10)'
  shape('tabBody', rrect(-150, -196, 300, 392, 34), { tf })
  use('tabBody', 'fi k')
  raw(`<g transform="${tf}">`)
  raw(`<path class="fp" d="${rrect(-130, -176, 260, 342, 16)}"/>`)
  raw('<path class="k2" d="M-86 70C-70 -90 20 -120 86 -40"/>')
  raw('<path class="k3" d="M-86 70L-60 -70M86 -40L60 -110"/>')
  for (const [x, y] of [[-86, 70], [0, -66], [86, -40]]) raw(`<path class="fi" d="${rrect(x - 12, y - 12, 24, 24, 4)}"/>`)
  for (const [x, y] of [[-60, -70], [60, -110]]) raw(`<path class="fp k3f" d="${blob(x, y, 9, 9, { seed: x })}"/>`)
  raw(`<path class="fa k3f" d="${blob(-40, 126, 14, 14, { seed: 3 })}"/><path class="fi" d="${blob(0, 126, 14, 14, { seed: 4 })}"/><path class="fp k3f" d="${blob(40, 126, 14, 14, { seed: 5 })}"/>`)
  raw('</g>')
})
group('pen', () => {
  // a pen lying across the bezel's corner: tip on the screen, cap hanging out over the edge
  const ptf = 'translate(926 1292) rotate(-10) translate(52 76) rotate(50)'
  shape('penShape', 'M0 0L34 -13H150Q166 -13 166 0Q166 13 150 13H34Z', { tf: ptf })
  raw(`<g transform="${ptf}">`)
  raw('<path class="fa k3f" d="M34 -12H116V12H34Z"/><path class="fp k3f" d="M0 0L34 -12V12Z"/><path class="fi" d="M0 0L14 -5V5Z"/>')
  raw('<path class="fi" d="M116 -12H130V12H116Z"/><path class="fa k3f" d="M130 -12H150Q165 -12 165 0Q165 12 150 12H130Z"/>')
  raw('</g>')
})

st.write(OUT)
