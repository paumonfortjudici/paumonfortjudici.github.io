// sticker-04 "Small me, big plant" - a tiny gardener staggers under a monstera three times their height (accent: mint #8EEBC3).
//
//   node art-src/illustration/sticker-04.build.mjs            -> art-src/illustration/sticker-04.svg
//   FX=0 node art-src/illustration/sticker-04.build.mjs x.svg -> fast draft without filters
//   BG=1 ...                                                  -> paper-coloured backdrop (previews only)
//
// Built like the pilot: kit/sticker-lib.mjs (frame) + kit/pen.mjs (geometry) + kit/blocks.mjs (head blocks) + sticker-04.leaf.mjs (monstera leaves).
// Pose: walking to the right under the load, knees bent, one boot pushing off on its heel; the pot is held at belly height by two paper
// garden gloves gripping its lower sides (the near hand in front, only the far hand's fingers show round the right edge), the gardener
// hides behind it: the head peeks out to the left of the stems at the pot's top-left with a young leaf draped over the bandana,
// eyes up at the load, a sweat drop on the temple. A snail crawls up the midrib of the right-hand leaf (head poking past the tip).
// Order (back to front): stems + leaves -> snail -> legs + boots -> seat + shirt (+ pocket with a trowel) -> pot -> near arm + glove ->
// far fingers -> head (hair lock, face, bandana, sweat) -> draped leaf -> sparkles.
// Halo-only fillers (shape() without a paint call): 'crownFill', 'bayFill' (pinholes between leaves), 'legGap' (between the legs), snailAnt.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createSticker } from './kit/sticker-lib.mjs'
import { smooth, limb, limbOutline, capsule, tube, blob, blobPts, rotPts, trPts, scPts, fmt, rrect, lerp, rng } from './kit/pen.mjs'
import { headFrame, face, ear } from './kit/blocks.mjs'
import { monstera } from './sticker-04.leaf.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || path.join(here, 'sticker-04.svg')

const st = createSticker({
  title: 'Small me, big plant - doodle sticker 04',
  desc: 'A small gardener in overalls and a polka-dot bandana staggers along carrying a pot with a monstera three times their height; a snail rides one of the leaves. Concept illustration, art-directed by Pau.',
  accent: '#8EEBC3',
  seed: 17,
  root: 'translate(28,14) scale(.99)',
})
const { shape, use, line, fillp, raw, clip, group, S, defs, sil } = st
/** an OPEN path (steam, zzz, antennae...) registered for the die-cut with ROUND caps: the lib's halo stroke has butt caps, so a plain shape()
 *  leaves the die-cut hugging the ends of an open polyline (ink 2-7 px from the edge). Paint it afterwards with use(id, 'k2'). */
const shapeOpen = (id, d, tf = '') => { defs.push(`<path id="${id}" d="${d}" stroke-linecap="round"${tf ? ` transform="${tf}"` : ''}/>`); sil.push(id) }
const PAPER = st.cfg.paper, INK = st.cfg.ink, ACC = st.cfg.accent

const P2 = (p) => `${fmt(p[0])} ${fmt(p[1])}`
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]]
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k]
const nrm = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l] }
const mid = (a, b, t = 0.5) => lerp(a, b, t)
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])
const dot = (x, y, r, seed = 1, cls = 'fi') => fillp(blob(x, y, r, r, { seed, wob: 0.04 }), cls)
const ang = (a, b) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI

// ============================================================ helpers
/** a leaf placed by its petiole point: id, base, angle (deg clockwise from "up"), size and options -> outline, midrib, veins, holes */
function leaf(id, base, a, L, W, o = {}) {
  const lf = monstera({ L, W, ...o })
  const tf = `translate(${fmt(base[0])} ${fmt(base[1])}) rotate(${a})`
  shape(id, lf.outline, { tf })
  use(id)
  raw(`<g transform="${tf}">`)
  raw(`<path class="k2" d="${lf.rib}"/>`)
  for (const v of lf.veins) raw(`<path class="k3" d="${v}"/>`)
  lf.holes.forEach((h, i) => raw(`<path class="fa k3f" d="${blob(h.cx, h.cy, h.rx, h.ry, { seed: 5 + i, rot: h.rot, wob: 0.03 })}"/>`))
  raw('</g>')
  return { lf, tf, base, a }
}
/** an outlined stem: ink walls + accent core, from a centre line (tapering width) */
function stem(id, pts, w0 = 52, w1 = 36) {
  const n = pts.length
  const ws = pts.map((_, i) => w0 + ((w1 - w0) * i) / (n - 1))
  shape(id, S(tube(pts, ws), { closed: true }))
  use(id)
}
/** band across a limb end (cuff), centred on c, axis direction angDeg; rib lines optional */
function cuff(id, c, angDeg, w = 104, len = 44, r = 12, ribs = true) {
  const tf = `translate(${fmt(c[0])} ${fmt(c[1])}) rotate(${fmt(angDeg)})`
  shape(id, rrect(-len / 2, -w / 2, len, w, r), { tf })
  use(id)
  if (ribs) raw(`<g transform="${tf}"><path class="k3" d="${[-w / 4, 0, w / 4].map((y) => `M${fmt(-len / 2 + 10)} ${fmt(y)}H${fmt(len / 2 - 10)}`).join('')}"/></g>`)
}

// ============================================================ 1. THE CROWN: thick outlined stems + monstera leaves
const POTX = 640, RIMY = 880
group('stems', () => {
  stem('stemA', [[POTX + 4, RIMY + 10], [POTX - 18, 800], [POTX - 36, 690], [624, 520]], 50, 34)
  stem('stemB', [[POTX - 20, RIMY + 10], [560, 842], [500, 784], [452, 724]], 46, 32)
  stem('stemC', [[POTX + 30, RIMY + 10], [728, 842], [778, 790], [800, 740]], 46, 32)
})
group('crown-fill', () => {                                    // halo-only: closes the pinholes between the stems and leaves
  shape('crownFill', S([[470, 520, 'c'], [800, 520, 'c'], [800, 890, 'c'], [470, 890, 'c']], { closed: true }))
  shape('bayFill', S([[868, 380, 'c'], [936, 380, 'c'], [936, 458, 'c'], [868, 458, 'c']], { closed: true }))     // the little bay between leaf A, the sparkle and the snail would otherwise be an enclosed hole in the die-cut
})
group('leaves', () => {
  leaf('leafA', [624, 520], 4, 410, 390, { seed: 1, slits: [0.3, 0.5, 0.7], slitW: 38, depth: 0.52, holes: 0, veins: 'few' })
  leaf('leafB', [452, 724], -52, 350, 335, { seed: 2, slits: [0.34, 0.6], slitW: 42, depth: 0.54, holes: 0, veins: 'few' })
  leaf('leafC', [800, 740], 48, 330, 320, { seed: 3, slits: [0.34, 0.6], slitW: 42, depth: 0.54, holes: 0, veins: 'few' })
})
// a young leaf, still rolled up like a cigar, in front of the stems
group('young-leaf', () => {
  const tf = 'translate(668 846) rotate(9)'
  shape('youngLeaf', S([[0, 0, 'c'], [-30, -50], [-34, -130], [-14, -200], [4, -236, 'c'], [26, -190], [36, -120], [28, -50]], { closed: true }), { tf })
  use('youngLeaf')
  raw(`<g transform="${tf}"><path class="k3" d="M-18 -30Q4 -80 -14 -130Q-24 -170 4 -222"/><path class="k3" d="M12 -64Q30 -110 20 -160"/></g>`)
})
// ------------------------------------------------------------ the snail, crawling up the midrib of the right-hand leaf towards the tip
group('snail', () => {
  const SN = [974, 584, -42]
  const tf = `translate(${SN[0]} ${SN[1]}) rotate(${SN[2]})`
  // plump foot: pointed tail on the ground at the left, raised neck + head at the right
  shape('snailBody', S([[-108, 0, 'c'], [-80, -24], [-36, -34], [24, -40], [58, -58], [76, -92], [98, -106], [118, -90], [114, -58], [102, -28], [88, -6, 'c'], [30, 6], [-40, 8], [-90, 6]], { closed: true }), { tf })
  use('snailBody', 'fi')
  shape('snailShell', blob(-30, -68, 58, 58, { seed: 21, wob: 0.03 }), { tf })
  use('snailShell')
  raw(`<g transform="${tf}">`)
  raw('<path class="k3" d="M-30 -68Q-12 -68 -12 -84Q-12 -108 -38 -108Q-72 -108 -74 -72Q-74 -34 -36 -28"/>')
  raw('<path class="k3" d="M86 -100Q84 -128 94 -144M106 -100Q122 -126 140 -136"/>')
  raw(`<path class="fi" d="${blob(94, -146, 9, 9, { seed: 3 })}"/><path class="fi" d="${blob(141, -137, 9, 9, { seed: 4 })}"/>`)
  raw('<path class="pp" d="M104 -78Q112 -70 108 -58"/>')
  raw('</g>')
  shapeOpen('snailAnt', 'M92 -112L94 -146M112 -108L141 -137', tf)     // halo-only (round caps): keeps the antenna balls inside the die-cut
})

// ============================================================ 2. THE GARDENER (peeking round the pot): legs + boots, torso, tools
const fr = headFrame({ center: [334, 884], tilt: -9, scale: 0.92 })
const { H: HF, hp } = fr

// boots: the kit boot outline with a short shaft (top at y -70): ink, paper rubber-boot stripe, paper sole + line, paper highlight; toe to +x, sole at y 128
const BOOT = 'M-54 -70C-18 -70 18 -70 54 -70C55 -40 50 -10 58 34C61.6 49.1 86.2 46.9 100 54C117.5 63 136.8 69.5 152 82C159.6 88.2 164.7 98.2 166 108C166.9 115.1 160.7 121.3 158 128C84 128 10 128 -64 128C-64.7 114.7 -66.5 101.3 -66 88C-65.2 66.6 -61.1 45.4 -60 24C-58 -10 -56 -40 -54 -70Z'
function boot(id, tf) {
  shape(id, BOOT, { tf })
  clip(id + 'Clip', BOOT)
  use(id, 'fi')
  raw(`<g transform="${tf}">`)
  raw(`<g clip-path="url(#${id}Clip)"><path class="fp" d="M-80 -46H80V-26H-80Z"/><path class="fp" d="M-80 106L180 102V150H-80Z"/><path class="k3" d="M-80 106L180 102"/></g>`)
  raw('<path class="pp" d="M-24 16Q-30 40 -22 62"/>')
  raw('</g>')
}
// stubby legs: the trousers are short and baggy, the boots do most of the work. Bent knees: the front knee pushes forward, the back foot pushes off on its toes
const legBack = [[524, 1150], [478, 1216], [426, 1272]], legBackHw = [78, 72, 56]
const legFront = [[604, 1150], [674, 1230], [656, 1312]], legFrontHw = [78, 72, 56]
group('legs', () => {
  const Lb = limb(legBack, legBackHw), Lf = limb(legFront, legFrontHw)
  shape('legBack', S(limbOutline(Lb), { closed: true })); use('legBack')
  shape('legFront', S(limbOutline(Lf), { closed: true })); use('legFront')
  boot('bootBack', 'translate(389 1318) rotate(40) scale(.82)')
  boot('bootFront', 'translate(650 1377) scale(.82)')
  for (const [id, L, ax] of [['hemBack', Lb, legBack], ['hemFront', Lf, legFront]]) {
    const e = L.ends[2], c = mid(e.A, e.B), dir = nrm(sub(ax[2], ax[1]))
    cuff(id, add(c, dir, -6), ang(ax[1], ax[2]), dist(e.A, e.B) + 10, 46, 12, false)
  }
  line('M594 1204Q628 1220 660 1204', 'k3')
})
group('leg-gap', () => { shape('legGap', S([[470, 1200, 'c'], [640, 1200, 'c'], [650, 1440, 'c'], [470, 1440, 'c']], { closed: true })) })
group('torso', () => {
  // seat of the overalls: joins the legs behind the pot
  shape('seat', S([[296, 1134, 'c'], [540, 1126, 'c'], [566, 1196], [530, 1232, 'c'], [440, 1240], [318, 1232, 'c'], [288, 1184]], { closed: true }))
  use('seat')
  // shirt
  shape('torso', S([[300, 996, 'c'], [380, 976], [470, 984, 'c'], [530, 1090], [524, 1160, 'c'], [320, 1168, 'c'], [292, 1090]], { closed: true }))
  use('torso')
  line('M326 1160Q420 1176 520 1158', 'k3')
  // patch pocket on the seat with a trowel sticking out of it, leaning outwards
  raw('<g transform="translate(330 1198) rotate(5)">')
  // trowel: ink handle with a paper ferrule, leaning out to the left (the blade is inside the pocket); its handle is also registered for the die-cut
  shape('pocketHalo', rrect(-62, -34, 124, 78, 14), { tf: 'translate(330 1198) rotate(5)' })     // the patch pocket sits on the left edge of the body: register it for the die-cut too
  shape('trowelHalo', 'M-53 -20V-90Q-53 -106 -40 -106Q-27 -106 -27 -90V-20Z', { tf: 'translate(330 1198) rotate(5) rotate(-38 -40 -20)' })
  raw('<g transform="rotate(-38 -40 -20)"><path class="fi" d="M-53 -20V-90Q-53 -106 -40 -106Q-27 -106 -27 -90V-20Z"/><path class="fp k3f" d="M-56 -64H-24V-44H-56Z"/></g>')
  raw(`<path class="fa k" d="${rrect(-62, -34, 124, 78, 14)}"/>`)
  raw(`<path class="st" d="${rrect(-50, -22, 100, 54, 8)}"/>`)
  raw('</g>')
})

// ============================================================ 3. THE POT (ink mass) with accent rim, paper zigzag
group('pot', () => {
  const body = S([[POTX - 196, 926, 'c'], [POTX + 196, 926, 'c'], [POTX + 156, 1172, 'c'], [POTX - 156, 1172, 'c']], { closed: true })
  shape('potBody', body)
  use('potBody', 'fi k')
  clip('clipPot', body)
  let z = `M${POTX - 200} 1030`
  const n = 14, x0 = POTX - 200, w = 400 / n
  for (let i = 1; i <= n; i++) z += `L${fmt(x0 + i * w)} ${i % 2 ? 1062 : 1030}`
  raw(`<g clip-path="url(#clipPot)"><path class="pp" d="${z}"/></g>`)
  shape('potRim', rrect(POTX - 218, 868, 436, 66, 22))
  use('potRim')
})

// ============================================================ 4. ARMS: rolled sleeves, thin forearms, paper garden gloves gripping the pot's lower sides
/** paper garden glove in its own frame: wrist at the origin, fingers to +x. accent cuff, ink-lined palm, thumb on top, two finger seams */
function glove(id, tf, mirror = false) {
  const m = mirror ? -1 : 1
  const g = `${tf} scale(${m} 1)`
  shape(id + 'Palm', S([[0, -36, 'c'], [60, -42], [96, -26], [104, 4], [92, 34], [56, 42], [0, 36, 'c']], { closed: true }), { tf: g })
  shape(id + 'Thumb', S(capsule([[40, -34], [58, -64], [86, -80]], [19, 17, 15]), { closed: true }), { tf: g })
  use(id + 'Thumb', 'fp k'); use(id + 'Palm', 'fp k')
  raw(`<g transform="${g}"><path class="k3" d="M64 -22Q82 -8 78 10M72 22Q88 28 86 36"/></g>`)
  shape(id + 'Cuff', rrect(-19, -40, 38, 80, 10), { tf: g }); use(id + 'Cuff')
}
const shN = [352, 1040], elN = [378, 1126], wrN = [456, 1150]
group('arm-near', () => {
  shape('nUp', S(tube([shN, elN], [104, 96]), { closed: true })); use('nUp')
  // rolled sleeve: a fat band at the elbow with fold lines, the bare forearm continues to the wrist
  shape('nFore', S(tube([[elN[0] + 10, elN[1] + 4], wrN], [56, 50]), { closed: true })); use('nFore')
  cuff('nRoll', [elN[0] + 4, elN[1] + 2], ang(shN, elN) + 8, 108, 46, 14, true)
  line('M326 1066Q348 1080 342 1100', 'k3')
  glove('gloveN', `translate(${wrN[0]} ${wrN[1]}) rotate(-8)`)
})
group('far-fingers', () => {                                  // the far hand reaches round the back of the pot: only its gloved fingers show
  const edge = (y) => POTX + 196 - (40 * (y - 926)) / 246
  ;[1084, 1118, 1152].forEach((y, i) => {
    shape(`ffing${i}`, S(tube([[edge(y) + 46, y + 2], [edge(y) - 54, y + 10]], [26, 24]), { closed: true })); use(`ffing${i}`, 'fp k')
  })
})

// ============================================================ 5. HEAD: ink lock, ear, big round eyes, strained brows, puffing mouth, sweat drop, polka-dot bandana
group('head', () => {
  const sc = fr.scale
  // back layer: hair lock streaming back (left) behind the head, ink mass
  const lock = [[-118, -74, 'c'], [-166, -60], [-206, -16], [-220, 34], [-214, 84, 'c'], [-196, 114], [-170, 102, 'c'], [-152, 128], [-124, 108, 'c'], [-110, 84], [-104, 40, 'c']]
  shape('hairLock', S(HF(lock), { closed: true })); use('hairLock', 'fi')
  face(st, fr)
  ear(st, fr, { hoop: false })
  // eyes: wide paper ellipses with ink pupils looking up at the load
  for (const [ex, ey, sd] of [[-52, -12, 1], [42, -18, 2]]) {
    const c = hp([ex, ey])
    fillp(blob(c[0], c[1], 23 * sc, 26 * sc, { seed: 30 + sd, wob: 0.025, rot: fr.tilt }), 'fp k3f')
    const p = hp([ex + 7, ey - 6])
    fillp(blob(p[0], p[1], 11 * sc, 12 * sc, { seed: 33 + sd, wob: 0.03 }), 'fi')
    const g = hp([ex + 11, ey - 11])
    fillp(blob(g[0], g[1], 3.6 * sc, 3.6 * sc, { seed: 36 + sd }), 'fp')
  }
  // brows: raised, inner ends up (strain)
  line(S(HF([[-90, -36], [-62, -54], [-28, -60]])), 'k2')
  line(S(HF([[16, -64], [48, -58], [76, -38]])), 'k2')
  // nose, mouth (o), blush
  line(S(HF([[-4, 26], [6, 38], [16, 28]])), 'k2')
  const m = hp([4, 92])
  fillp(blob(m[0], m[1], 17 * sc, 23 * sc, { seed: 9, wob: 0.03, rot: fr.tilt }), 'fi k3f')
  const t = hp([4, 104])
  fillp(blob(t[0], t[1], 9 * sc, 7 * sc, { seed: 10 }), 'fa')
  line(`M${P2(hp([-78, 48]))}L${P2(hp([-70, 66]))}M${P2(hp([-56, 44]))}L${P2(hp([-48, 62]))}`, 'k3')
  // polka-dot bandana (arch over the brows) with a knot and two tails flying back
  shape('bandTail1', S(capsule(HF([[-122, -92], [-170, -70], [-206, -30]]), [16, 15, 10].map((w) => w * sc)), { closed: true })); use('bandTail1')
  shape('bandTail2', S(capsule(HF([[-124, -100], [-184, -116], [-232, -104]]), [15, 14, 9].map((w) => w * sc)), { closed: true })); use('bandTail2')
  shape('bandana', S(HF([[-118, -66, 'c'], [-132, -126], [-100, -188], [0, -214], [100, -186], [132, -122], [118, -66, 'c'], [62, -88], [0, -98], [-62, -88]]), { closed: true })); use('bandana')
  const kc = hp([-128, -98])
  shape('bandKnot', blob(kc[0], kc[1], 26 * sc, 24 * sc, { seed: 6 })); use('bandKnot')
  for (const [dx, dy] of [[-74, -100], [-22, -108], [32, -108], [84, -98], [-100, -146], [-48, -156], [6, -160], [58, -156], [104, -140], [-22, -192], [38, -190]]) {
    const c = hp([dx, dy])
    fillp(blob(c[0], c[1], 9 * sc, 9 * sc, { seed: Math.abs(dx + dy) }), 'fp')
  }
  // sweat drop sliding down the temple
  const d0 = hp([112, -6])
  shape('sweat', `M${P2(d0)}C${fmt(d0[0] - 18)} ${fmt(d0[1] + 24)} ${fmt(d0[0] - 22)} ${fmt(d0[1] + 46)} ${fmt(d0[0])} ${fmt(d0[1] + 48)}C${fmt(d0[0] + 22)} ${fmt(d0[1] + 46)} ${fmt(d0[0] + 18)} ${fmt(d0[1] + 24)} ${P2(d0)}Z`)
  use('sweat', 'fa k3f')
})

// ============================================================ 6. leaves in front of the head and the pot: a young leaf draped over the bandana, one drooping over the pot's shoulder
group('front-leaves', () => {
  leaf('leafD', [488, 704], -136, 170, 150, { seed: 7, slits: [], holes: 0 })
})

// ============================================================ 7. extras: two sparkles
group('extras', () => {
  const spark = (id, x, y, s) => { shape(id, 'M0 -26Q4 -5 26 0Q4 5 0 26Q-4 5 -26 0Q-4 -5 0 -26Z', { tf: `translate(${x} ${y}) scale(${s})` }); use(id, 'fi') }
  spark('sparkA', 190, 420, 0.9)
  spark('sparkB', 936, 330, 1.1)
})

st.write(OUT)
