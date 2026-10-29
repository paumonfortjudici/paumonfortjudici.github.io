// sticker-02 "Just one more chapter" - reader with a sleeping cat on the lap (accent: tangerine #FFA65F).
//
//   node art-src/illustration/sticker-02.build.mjs            -> art-src/illustration/sticker-02.svg
//   FX=0 node art-src/illustration/sticker-02.build.mjs x.svg -> fast draft without filters
//   BG=1 ...                                                  -> paper-coloured backdrop (previews only)
//
// Built the same way as the pilot (kit/sticker-lib.mjs frame + kit/pen.mjs geometry + kit/blocks.mjs head blocks).
// Pose: cross-legged on a wobbly tower of books, knees up so the lap is a valley the cat nestles in; elbows out on the knees,
// a hardback held up (we see its back cover), head tilted down-left over the top of it.
// Order of the drawing (back to front): book tower -> mug -> torso -> legs -> slippers -> forearms -> sleeves -> turtleneck ->
// cuffs -> palms -> book -> fingers -> cat -> head -> extras.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createSticker } from './kit/sticker-lib.mjs'
import { smooth, limb, limbOutline, capsule, tube, blob, blobPts, rotPts, trPts, scPts, fmt, rrect, lerp, rng } from './kit/pen.mjs'
import { headFrame, face, ear, features } from './kit/blocks.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || path.join(here, 'sticker-02.svg')

const st = createSticker({
  title: 'Just one more chapter - doodle sticker 02',
  desc: 'A cosy reader in a cable-knit sweater sits cross-legged on a wobbly tower of books, a hardback held up in front of the chest and a sleeping black cat on the lap. Concept illustration, art-directed by Pau.',
  accent: '#FFA65F',
  seed: 11,
  root: 'translate(-22,-36) scale(1.037)',
})
const { shape, use, line, fillp, raw, clip, group, S, defs, sil } = st
/** an OPEN path (steam, zzz...) registered for the die-cut with ROUND caps: the lib's halo stroke has butt caps, so a plain shape()
 *  leaves the die-cut hugging the ends of an open polyline (ink 2-7 px from the edge). Paint it afterwards with use(id, 'k2'). */
const shapeOpen = (id, d, tf = '') => { defs.push(`<path id="${id}" d="${d}" stroke-linecap="round"${tf ? ` transform="${tf}"` : ''}/>`); sil.push(id) }
/** the kit's ear() paints with fillp() and is NOT registered for the halo: when the ear sticks out of the hair it ends up on the die-cut edge. This one is registered. */
const mirrorPts = (pts) => pts.map(([x, y, f]) => (f === undefined ? [-x, y] : [-x, y, f]))
function earShape(id, fr, mirrored = false) {
  const m = mirrored ? mirrorPts : (q) => q
  shape(id, S(fr.H(m([[-98, -8, 'c'], [-126, -14], [-146, 10], [-144, 40], [-124, 62], [-100, 54, 'c']])), { closed: true })); use(id)
  line(S(fr.H(m([[-116, 8], [-128, 22], [-120, 38]]))), 'k3')
}
const PAPER = st.cfg.paper, INK = st.cfg.ink, ACC = st.cfg.accent

const P2 = (p) => `${fmt(p[0])} ${fmt(p[1])}`
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]]
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k]
const nrm = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l] }
const mid = (a, b, t = 0.5) => lerp(a, b, t)
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])
const dot = (x, y, r, seed = 1, cls = 'fi') => fillp(blob(x, y, r, r, { seed, wob: 0.04 }), cls)
const mirrorX = (pts, x0 = 600) => pts.map(([x, y, f]) => (f === undefined ? [2 * x0 - x, y] : [2 * x0 - x, y, f]))
const ang = (a, b) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI

/** double-helix cable column along a->b (amplitude amp, one full twist per `period`): two phase-shifted waves */
function cableD(a, b, amp, period, margin = 0) {
  const d = nrm(sub(b, a)), n = [-d[1], d[0]], len = dist(a, b)
  const mk = (ph) => {
    const pts = []
    for (let s = margin; s <= len - margin + 0.01; s += period / 6) {
      const o = amp * Math.sin((2 * Math.PI * s) / period + ph)
      pts.push([a[0] + d[0] * s + n[0] * o, a[1] + d[1] * s + n[1] * o])
    }
    return S(pts)
  }
  return mk(0) + mk(Math.PI)
}
/** Catmull-Rom sampling of a hand-placed centre line (points every ~step px) */
function catmull(pts, step = 5) {
  const out = []
  const P = (i) => pts[Math.max(0, Math.min(pts.length - 1, i))]
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2)
    const n = Math.max(2, Math.ceil(dist(p1, p2) / step))
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t
      out.push([0, 1].map((c) => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3)))
    }
  }
  out.push(pts[pts.length - 1])
  return out
}
/** double-helix cable that follows a curved centre line (list of points) */
function cablePoly(center, amp, period, margin = 0) {
  const d = catmull(center, 5)
  const L = [0]
  for (let i = 1; i < d.length; i++) L.push(L[i - 1] + dist(d[i], d[i - 1]))
  const total = L[L.length - 1]
  const at = (s) => {
    let i = 1
    while (i < d.length - 1 && L[i] < s) i++
    const a = d[i - 1], b = d[i], t = (s - L[i - 1]) / (L[i] - L[i - 1] || 1)
    const tg = nrm(sub(b, a))
    return { p: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], n: [-tg[1], tg[0]] }
  }
  const mk = (ph) => {
    const pts = []
    const half = period / 2, nHalf = Math.floor((total - 2 * margin) / half), end = margin + nHalf * half
    for (let s = margin; s <= end + 0.01; s += period / 8) {
      const { p, n } = at(s), o = amp * Math.sin((2 * Math.PI * (s - margin)) / period + ph)
      pts.push([p[0] + n[0] * o, p[1] + n[1] * o])
    }
    return S(pts)
  }
  return mk(0) + mk(Math.PI)
}
/** straight line a->b shifted sideways by o (for the cable's border ribs) */
function sideD(a, b, o, trim = 0) {
  const d = nrm(sub(b, a)), n = [-d[1], d[0]]
  const p = add(add(a, d, trim), n, o), q = add(add(b, d, -trim), n, o)
  return `M${P2(p)}L${P2(q)}`
}
/** ribbed cuff band: long side across the arm, centred on c, arm direction angDeg */
function cuff(id, c, angDeg, w = 104, len = 44, r = 12) {
  const tf = `translate(${fmt(c[0])} ${fmt(c[1])}) rotate(${fmt(angDeg)})`
  shape(id, rrect(-len / 2, -w / 2, len, w, r), { tf })
  use(id)
  let d = ''
  for (const y of [-w / 4, 0, w / 4]) d += `M${fmt(-len / 2 + 10)} ${fmt(y)}H${fmt(len / 2 - 10)}`
  raw(`<g transform="${tf}"><path class="k3" d="${d}"/></g>`)
}

// ============================================================ 1. BOOK TOWER (spines to the viewer, slightly rotated = wobbly pile)
const BOOKS = [
  { id: 'bkA', cx: 598, cy: 1408, w: 786, h: 92, rot: 0.4 },
  { id: 'bkB', cx: 552, cy: 1326, w: 646, h: 72, rot: 2.0 },
  { id: 'bkC', cx: 656, cy: 1252, w: 700, h: 76, rot: -2.2 },
  { id: 'bkD', cx: 606, cy: 1182, w: 560, h: 64, rot: 1.0 },
]
const bk = Object.fromEntries(BOOKS.map((b) => [b.id, b]))
function bookBase(b) {
  const tf = `rotate(${b.rot} ${b.cx} ${b.cy})`
  shape(b.id, rrect(b.cx - b.w / 2, b.cy - b.h / 2, b.w, b.h, 16), { tf })
  use(b.id)
  return tf
}
const band = (b, x, w = 12) => `<path class="fi" d="M${fmt(b.cx + x - w / 2)} ${fmt(b.cy - b.h / 2 + 4)}h${w}v${b.h - 8}h${-w}Z"/>`
group('tower', () => {
  let b = bk.bkA, tf = bookBase(b)
  raw(`<g transform="${tf}">`)
  for (const sx of [-1, 1]) raw(band(b, sx * 292, 18))
  raw(`<path class="fp k3f" d="${rrect(b.cx - 96, b.cy - 24, 192, 48, 12)}"/>`)
  raw(`<path class="k3" d="M${b.cx - 62} ${b.cy - 6}h124M${b.cx - 40} ${b.cy + 9}h80"/>`)
  raw('</g>')
  b = bk.bkB; tf = bookBase(b)
  raw(`<g transform="${tf}">`)
  raw(band(b, -240, 26))
  for (const x of [170, 216, 262]) raw(`<path class="fi" d="M${b.cx + x} ${b.cy - 13}l10 13l-10 13l-10 -13Z"/>`)
  raw('</g>')
  b = bk.bkC
  // ribbon bookmark: painted after B (hangs over its spine) but before C (the book hides the top end)
  raw(`<g transform="rotate(${b.rot} ${b.cx} ${b.cy})"><path class="fa k3f" d="M${b.cx - 150} ${b.cy + b.h / 2 - 22}h30v${88}l-15 -18l-15 18Z"/></g>`)
  tf = bookBase(b)
  raw(`<g transform="${tf}">`)
  raw(band(b, -270, 18))
  raw(`<path class="st" d="M${b.cx - 110} ${b.cy}H${b.cx + 220}"/>`)
  raw('</g>')
  b = bk.bkD; tf = bookBase(b)
  raw(`<g transform="${tf}">`)
  raw(band(b, -226, 16) + band(b, 214, 12))
  raw(`<path class="fp k3f" d="${rrect(b.cx - 70, b.cy - 20, 140, 40, 12)}"/>`)
  raw(`<path class="fi" d="M${b.cx} ${b.cy - 12}Q${b.cx + 3} ${b.cy - 3} ${b.cx + 12} ${b.cy}Q${b.cx + 3} ${b.cy + 3} ${b.cx} ${b.cy + 12}Q${b.cx - 3} ${b.cy + 3} ${b.cx - 12} ${b.cy}Q${b.cx - 3} ${b.cy - 3} ${b.cx} ${b.cy - 12}Z"/>`)
  raw('</g>')
})

// ============================================================ 2. MUG with a heart + steam (on the right end of book C), own frame: origin = bottom centre
group('mug', () => {
  const tf = 'translate(938 1208) rotate(-1)'
  shape('mugBody', S([[-38, -76, 'c'], [38, -76, 'c'], [34, -28], [20, 0, 'c'], [-20, 0, 'c'], [-34, -28]], { closed: true }), { tf })
  shape('mugHandle', S(capsule([[34, -60], [62, -54], [66, -30], [40, -20]], [10, 10, 10, 10]), { closed: true }), { tf })
  use('mugHandle'); use('mugBody')
  raw(`<g transform="${tf}"><path class="fi" d="M0 -12C-11 -22 -18 -31 -18 -40C-18 -47 -12 -51 -7 -50C-3 -49 -1 -47 0 -44C1 -47 3 -49 7 -50C12 -51 18 -47 18 -40C18 -31 11 -22 0 -12Z"/>`)
  raw('</g>')
  shapeOpen('steamA', 'M44 -84Q62 -100 50 -118Q38 -136 54 -152', tf); use('steamA', 'k2')
  shapeOpen('steamB', 'M-2 -92Q-14 -104 -2 -118', tf); use('steamB', 'k3')
})

// ============================================================ 3. TORSO (the chest between the sleeves)
group('torso', () => {
  shape('torso', S([[520, 620, 'c'], [446, 640], [398, 690], [386, 800], [382, 940], [394, 1030, 'c'], [600, 1050], [806, 1030, 'c'], [812, 940], [814, 800], [802, 690], [756, 640], [684, 610, 'c']], { closed: true }))
  use('torso')
})

// ============================================================ 4. LEGS: knees up (the lap is a valley), pyjama stripes, fuzzy slippers
const legLpts = [[650, 1148, 'c'], [560, 1152], [470, 1152], [392, 1148], [330, 1136], [276, 1104], [238, 1056], [232, 1010], [262, 972], [320, 958], [400, 966], [480, 990], [560, 1018], [640, 1034], [668, 1060, 'c']]
const legRpts = [[550, 1148, 'c'], [640, 1154], [730, 1154], [808, 1148], [870, 1136], [924, 1104], [962, 1056], [968, 1010], [938, 972], [880, 958], [800, 966], [720, 990], [640, 1018], [560, 1034], [532, 1060, 'c']]
const legLd = S(legLpts, { closed: true }), legRd = S(legRpts, { closed: true })
shape('legL', legLd); shape('legR', legRd)
clip('clipLegL', legLd); clip('clipLegR', legRd)
function stripes(clipId, x0, x1, pitch, slope = 0.5, y0 = 900, y1 = 1200, gap = 22) {
  let d = ''
  for (let x = x0; x < x1; x += pitch) for (const o of [0, gap]) d += `M${fmt(x + o)} ${y0}L${fmt(x + o + (y1 - y0) * slope)} ${y1}`
  raw(`<g clip-path="url(#${clipId})"><path class="k3" d="${d}"/></g>`)
}
/** scalloped outline through a closed, clockwise list of points (each chord becomes a gentle outward arc) */
function scallopD(pts, bulge = 0.56) {
  let d = `M${P2(pts[0])}`
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length], r = dist(p, q) * bulge
    d += `A${fmt(r)} ${fmt(r)} 0 0 1 ${P2(q)}`
  }
  return d + 'Z'
}
/** superellipse sample (flat sole, rounded toe): clockwise on screen */
function superPts(a, b, p, n, squashLeft = 1) {
  const pts = []
  for (let i = 0; i < n; i++) {
    const t = (2 * Math.PI * i) / n, c = Math.cos(t), s = Math.sin(t)
    const x = a * Math.sign(c) * Math.abs(c) ** (2 / p), y = b * Math.sign(s) * Math.abs(s) ** (2 / p)
    pts.push([x, y * (x < 0 ? squashLeft : 1)])
  }
  return pts
}
/** fuzzy slipper in its own frame (toe towards +x): cream scalloped fluff, dark opening, toe seam */
function slipper(id, tf) {
  const body = scallopD(superPts(96, 44, 2.7, 17, 0.9))
  shape(id, body, { tf })
  use(id, 'fp k3f')                               // the shape def already carries tf: draw the body OUTSIDE the transformed group
  raw(`<g transform="${tf}">`)
  raw(`<path class="fi" d="${blob(-24, -18, 42, 17, { seed: 17, wob: 0.03, rot: -8 })}"/>`)       // the opening (dark)
  raw('<path class="k3" d="M52 -30Q68 -2 54 28"/>')                                               // toe seam
  raw('</g>')
}
group('legs', () => {
  use('legL'); stripes('clipLegL', 120, 560, 104, 0.5, 900, 1200, 20)
  use('legR'); stripes('clipLegR', 660, 1060, 104, 0.5, 900, 1200, 20)
})
group('slippers', () => {
  slipper('slipL', 'translate(696 1108) rotate(3) scale(.88)')
  slipper('slipR', 'translate(520 1108) scale(-.88 .88) rotate(3)')
})

// ============================================================ 5. ARMS: one big cable-knit sleeve per side (shoulder -> elbow on the knee), ribbed cuff at the book
const bookC = [600, 790], bookRot = -8
const bookTf = `translate(${bookC[0]} ${bookC[1]}) rotate(${bookRot})`
const shoulderL = [[524, 612, 'c'], [470, 622], [418, 640], [376, 668], [336, 716], [290, 786], [236, 856], [196, 906], [190, 956], [222, 996], [276, 990], [322, 958], [372, 904], [420, 838], [470, 770], [514, 696]]
const shoulderR = mirrorX(shoulderL).map(([x, y, f]) => (f === undefined ? [x, y - (y < 700 ? 8 : 0)] : [x, y - (y < 700 ? 8 : 0), f]))
group('sleeves', () => {
  const dL = S(shoulderL, { closed: true }), dR = S(shoulderR, { closed: true })
  shape('slvL', dL); shape('slvR', dR)
  clip('clipSlvL', dL); clip('clipSlvR', dR)
  use('slvL'); use('slvR')
  // the braid follows the curve of the sleeve, ~58 px inside its outer edge
  const cenL = [[414, 664], [374, 712], [334, 774], [294, 832]]
  const cenR = cenL.map(([x, y]) => [1200 - x, y - 8])
  raw(`<g clip-path="url(#clipSlvL)"><path class="k2" d="${cablePoly(cenL, 18, 100, 20)}"/></g>`)
  raw(`<g clip-path="url(#clipSlvR)"><path class="k2" d="${cablePoly(cenR, 18, 100, 20)}"/></g>`)
  // three cloth folds at each elbow
  raw('<path class="k3" d="M206 936Q232 946 232 972M240 922Q268 934 268 962M276 920Q300 930 302 954"/>')
  raw('<path class="k3" d="M994 944Q968 954 968 980M960 930Q932 942 932 970M924 928Q900 938 898 962"/>')
})
group('turtleneck', () => {
  const d = S([[516, 566, 'c'], [704, 556, 'c'], [724, 636], [716, 668, 'c'], [504, 670, 'c'], [498, 636]], { closed: true })
  shape('neck', d); clip('clipNeck', d)
  use('neck')
  let r = ''
  for (let x = 532; x < 710; x += 32) r += `M${x} 590L${x - 6} 662`
  raw(`<g clip-path="url(#clipNeck)"><path class="k3" d="${r}"/></g>`)
})
group('cuffs', () => {
  cuff('cuffL', [394, 874], -54, 100, 46, 12)
  cuff('cuffR', [814, 814], 54, 100, 46, 12)
})

// ============================================================ 6. BOOK (back cover to us), tilted -8deg
group('book', () => {
  const W = 360, H = 250
  shape('book', rrect(-W / 2, -H / 2, W, H, 18), { tf: bookTf })
  use('book')
  raw(`<g transform="${bookTf}">`)
  raw(`<path class="fp k3f" d="${rrect(-W / 2 + 14, -H / 2 - 15, W - 28, 28, 9)}"/>`)
  raw(`<path class="st" d="${rrect(-W / 2 + 28, -H / 2 + 30, W - 56, H - 60, 12)}"/>`)
  raw(`<path class="fi" d="M-9 ${-H / 2 - 12}h18v${H + 8}h-18Z"/>`)
  // emblem on the left cover: crescent moon + a little star in its hollow
  raw('<g transform="translate(-62 -6) scale(.88)">')
  raw('<path class="fi" d="M22 -35.8A42 42 0 1 0 22 35.8A36 36 0 1 1 22 -35.8Z"/>')
  raw('<path class="fi" d="M26 -20Q30 -4 46 0Q30 4 26 20Q22 4 6 0Q22 -4 26 -20Z"/>')
  raw('</g>')
  // little library sticker on the right cover
  raw(`<path class="fp k3f" d="${blob(84, -58, 24, 24, { seed: 31, wob: 0.03 })}"/>`)
  raw('<path class="fi" d="M84 -72Q87 -61 98 -58Q87 -55 84 -44Q81 -55 70 -58Q81 -61 84 -72Z"/>')
  raw('</g>')
})
// fingers wrapped round the side edges, on the cover
group('fingers', () => {
  const fingL = [[-14, 70, 27], [20, 78, 27], [54, 72, 26], [86, 58, 24]]
  const fingR = [[-98, 58, 24], [-64, 70, 27], [-30, 76, 27], [4, 62, 24]]
  fingL.forEach(([y, len, w], i) => { shape(`fL${i}`, S(tube([[-198, y], [-198 + len, y - 10 + i * 6]], [w, w - 2]), { closed: true }), { tf: bookTf }); use(`fL${i}`) })
  fingR.forEach(([y, len, w], i) => { shape(`fR${i}`, S(tube([[198, y], [198 - len, y - 12 + i * 7]], [w, w - 2]), { closed: true }), { tf: bookTf }); use(`fR${i}`) })
})

// ============================================================ 7. CAT: solid ink loaf + head with ears, paper whiskers/paws, S-tail
const CAT_DY = -16
group('cat', () => {
  const tf = `translate(0 ${CAT_DY})`
  const outline = [[446, 1046, 'c'], [420, 1000], [422, 942], [462, 900], [534, 876], [606, 872], [644, 884], [652, 854], [672, 808, 'c'], [702, 870], [722, 876], [744, 870], [776, 808, 'c'], [800, 852], [814, 912], [806, 966], [784, 1006], [764, 1040], [724, 1058, 'c'], [600, 1066], [500, 1062]]
  shape('catTail', S(capsule([[434, 1012], [388, 1028], [350, 1058], [340, 1094], [358, 1114], [384, 1102]], [14, 12, 11, 10, 9, 8]), { closed: true }), { tf })
  use('catTail', 'fi k')
  raw(`<g transform="${tf}"><path class="fp k3f" d="${blob(390, 1098, 10, 10, { seed: 8, wob: 0.03 })}"/></g>`)
  shape('catBody', S(outline, { closed: true }), { tf })
  use('catBody', 'fi k')
  raw(`<g transform="${tf}">`)
  raw('<path class="sh" d="M470 920Q520 892 588 890"/>')
  raw('<g transform="translate(722 934) rotate(-4)">')
  raw(`<path class="fa" d="${S([[-52, -100, 'c'], [-66, -70], [-34, -60, 'c']], { closed: true })}"/><path class="fa" d="${S([[52, -102, 'c'], [66, -72], [36, -60, 'c']], { closed: true })}"/>`)
  raw('<path class="pp" d="M-44 2Q-31 16 -18 2M18 2Q31 16 44 2"/>')
  raw('<path class="fa" d="M-11 20Q0 16 11 20Q9 32 0 37Q-9 32 -11 20Z"/>')
  raw('<path class="pp" d="M0 38V44M0 44Q-9 52 -18 46M0 44Q9 52 18 46"/>')
  raw('<path class="pp" d="M-44 30L-66 23M-46 40L-70 42M-42 50L-64 59M44 30L64 23M46 40L68 42M42 50L62 59"/>')
  raw('</g>')
  raw(`<path class="fp k3f" d="${blob(712, 1052, 26, 17, { seed: 3, wob: 0.03 })}"/><path class="fp k3f" d="${blob(760, 1044, 26, 17, { seed: 4, wob: 0.03 })}"/>`)
  raw('</g>')
})

// ============================================================ 8. HEAD
const fr = headFrame({ center: [606, 440], tilt: -12, scale: 0.97 })
const { H: HF, hp } = fr
const sc = fr.scale
group('head', () => {
  face(st, fr)
  earShape('earL', fr); earShape('earR', fr, true)
  features(st, fr, { eyes: 'sleepy', brows: 'arch', nose: 'small', mouth: 'none' })
  line(S(HF([[-20, 88], [4, 102], [32, 84]])), 'k2')
  const c1 = hp([52, 54]), c2 = hp([58, 68]), c3 = hp([68, 48]), c4 = hp([74, 62])
  line(`M${P2(c1)}L${P2(c2)}M${P2(c3)}L${P2(c4)}`, 'k3')
  // round glasses sliding down the nose
  const l1 = hp([-54, -2]), l2 = hp([40, -8]), rx = 37 * sc
  line(blob(l1[0], l1[1], rx, rx * 0.95, { seed: 3, wob: 0.02, rot: fr.tilt }), 'k2')
  line(blob(l2[0], l2[1], rx, rx * 0.95, { seed: 4, wob: 0.02, rot: fr.tilt }), 'k2')
  line(S(HF([[-18, -12], [-6, -20], [4, -18]])), 'k2')
  line(S(HF([[-91, -8], [-104, -2], [-112, 8]])), 'k2')
  line(S(HF([[77, -14], [96, -10], [108, 0]])), 'k2')
  line(S(HF([[-76, -16], [-68, -26], [-54, -30]])), 'pp')
  line(S(HF([[18, -22], [26, -32], [40, -36]])), 'pp')
  // hair: smooth side-parted cap (ink mass) + lumpy messy bun with a hair tie
  const cap = [[-112, -16, 'c'], [-130, -80], [-104, -150], [-40, -192], [40, -190], [108, -150], [134, -80], [112, -16, 'c'], [100, -50], [62, -84], [20, -108], [-30, -92], [-80, -62], [-106, -30]]
  shape('hairCap', S(HF(cap), { closed: true })); use('hairCap', 'fi')
  line(S(HF([[-20, -178], [10, -140], [20, -112]])), 'sh')
  const bc = hp([100, -214])
  shape('hairBun', blob(bc[0], bc[1], 66 * sc, 60 * sc, { seed: 12, rot: fr.tilt, n: 12, wob: 0.09 })); use('hairBun', 'fi')
  fillp(S(HF([[62, -180, 'c'], [96, -162], [130, -182, 'c'], [126, -164, 'c'], [96, -146], [66, -164, 'c']]), { closed: true }), 'fa k3f')
  // pencil through the bun
  const pT = hp([-4, -300]), pE = hp([168, -128]), pA = ang(pT, pE), pL = dist(pT, pE)
  const ptf = `translate(${fmt(pT[0])} ${fmt(pT[1])}) rotate(${fmt(pA)})`
  shape('pencil', `M0 0L36 -16H${fmt(pL - 18)}Q${fmt(pL)} -16 ${fmt(pL)} 0Q${fmt(pL)} 16 ${fmt(pL - 18)} 16H36Z`, { tf: ptf })
  raw(`<g transform="${ptf}">`)
  raw(`<path class="fa k3f" d="M34 -14H${fmt(pL - 52)}V14H34Z"/>`)
  raw('<path class="fp k3f" d="M0 0L34 -14V14Z"/><path class="fi" d="M0 0L15 -6V6Z"/>')
  raw(`<path class="fi" d="M${fmt(pL - 52)} -14H${fmt(pL - 34)}V14H${fmt(pL - 52)}Z"/>`)
  raw(`<path class="fp k3f" d="M${fmt(pL - 34)} -14H${fmt(pL - 16)}Q${fmt(pL - 1)} -14 ${fmt(pL - 1)} 0Q${fmt(pL - 1)} 14 ${fmt(pL - 16)} 14H${fmt(pL - 34)}Z"/>`)
  raw('</g>')
})

// ============================================================ 9. EXTRAS: zzz right of the head (the reader is nodding off too), a tiny heart on the left
group('extras', () => {
  const z = (id, x, y, s, cls) => { shapeOpen(id, `M0 0H${26 * s}L0 ${32 * s}H${26 * s}`, `translate(${x} ${y})`); use(id, cls) }
  z('zzA', 790, 398, 1.0, 'k3')
  z('zzB', 818, 336, 1.35, 'k2')
  z('zzC', 866, 258, 1.75, 'k2')
  shape('zzFill', S([[786, 236, 'c'], [858, 236, 'c'], [858, 350, 'c'], [786, 350, 'c']], { closed: true }))   // halo-only: merges the zzz cloud with the head's halo (otherwise a 15 px hairline bay is left between them)
  shape('heartL', 'M0 28C-42 -2 -36 -36 -13 -34C-4 -33 0 -26 0 -21C0 -26 4 -33 13 -34C36 -36 42 -2 0 28Z', { tf: 'translate(420 378) rotate(-14) scale(.95)' })
  use('heartL')
})

st.write(OUT)
