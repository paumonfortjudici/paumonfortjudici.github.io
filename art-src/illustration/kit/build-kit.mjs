// build-kit.mjs - writes doodle-kit.svg: the shared <defs> (style, filters, building blocks) + a visual catalog.
//   node art-src/illustration/kit/build-kit.mjs
// Every building block is a <g id="k-..."> in <defs>, drawn in LOCAL coordinates at the scale of the pilot sticker,
// with the shared classes (fa / fi / fp / k / k2 / k3 ...). Place one with
//   <use href="#k-eye-dot" transform="translate(x y) rotate(deg) scale(s)"/>
// Anchors: face parts = centre of the feature, hands = wrist centre (fingers point up, -y), shoes = ankle (top middle,
// toe towards +x, sole at y=125), doodles = centre. Flip with scale(-1 1). Paste the <defs> block you need into your sticker
// (blocks that use a clipPath carry their own k-clip-* id) and put the <use> inside the wobbled #art group.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { smooth as S, limb, capsule, blob, rrect, circle, fmt, scPts, poly } from './pen.mjs'
import { styleBlock, filterDefs, DEFAULTS } from './sticker-lib.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || path.join(here, 'doodle-kit.svg')
const cfg = { ...DEFAULTS }

const P = (d, cls, extra = '') => `<path class="${cls}" d="${d}"${extra ? ' ' + extra : ''}/>`
const G = (id, inner) => `<g id="k-${id}">${inner}</g>`
const defs = []
const sym = (id, inner) => defs.push(G(id, inner))
const clipDef = (id, d) => defs.push(`<clipPath id="k-clip-${id}"><path d="${d}"/></clipPath>`)

// ------------------------------------------------------------------ FACE PARTS
sym('eye-dot', P(blob(0, 0, 11, 16, { seed: 31, wob: 0.03 }), 'fi') + P(blob(4, -6, 4, 4, { seed: 50 }), 'fp'))
sym('eye-happy', P('M-22 8Q0 -22 22 8', 'k2'))
sym('eye-wink', P('M-22 6Q0 -18 22 6', 'k2') + P('M22 6L32 12M20 -2L30 -6', 'k3'))
sym('eye-sleepy', P('M-22 -4Q0 18 22 -4', 'k2') + P('M20 -2L30 -10M14 4L24 8', 'k3'))
sym('eye-wide', P(blob(0, 0, 21, 25, { seed: 33, wob: 0.02 }), 'fp k3f') + P(blob(2, 3, 10, 13, { seed: 34 }), 'fi') + P(blob(6, -3, 3.6, 3.6, { seed: 35 }), 'fp'))
sym('brow-arch', P('M-30 10Q-2 -16 30 2', 'k2'))
sym('brow-flat', P('M-30 3Q0 -4 30 -2', 'k2'))
sym('brow-worry', P('M-30 -8Q0 -4 30 12', 'k2'))
sym('brow-angry', P('M-30 -10L30 10', 'k2'))
sym('brow-up', P('M-30 8Q0 -24 30 -4', 'k2'))
sym('nose-hook', P(S([[0, -2], [8, 14], [6, 28], [-4, 36], [-18, 34]]), 'k2'))
sym('nose-L', P('M2 -24L8 16Q8 28 -12 26', 'k2'))
sym('nose-dot', P(blob(0, 0, 8, 7, { seed: 7 }), 'fi'))
sym('nose-small', P('M-9 4Q0 14 9 4', 'k2'))
// mouths: origin = centre of the mouth
{
  const grin = S([[-52, -34, 'c'], [-14, -22], [24, -26], [58, -44, 'c'], [54, 2], [28, 26], [0, 30], [-30, 22], [-50, 0]], { closed: true })
  clipDef('grin', grin)
  const teeth = S([[-64, -32], [-20, -18], [24, -24], [64, -42], [64, -18], [24, -2], [-20, 4], [-64, -12]], { closed: true })
  sym('mouth-grin', P(grin, 'fi k') + `<g clip-path="url(#k-clip-grin)">${P(teeth, 'fp')}${P(blob(4, 24, 28, 15, { seed: 5 }), 'fa')}</g>`)
  sym('mouth-smile', P('M-44 -2Q0 34 44 -2', 'k2'))
  sym('mouth-smirk', P('M-34 6Q-4 22 34 -10', 'k2') + P('M34 -10L42 -18', 'k3'))
  sym('mouth-flat', P('M-30 0H30', 'k2'))
  sym('mouth-o', P(blob(0, 0, 17, 22, { seed: 9, wob: 0.03 }), 'fi k3f') + P(blob(0, 12, 9, 6, { seed: 10 }), 'fa'))
  sym('mouth-tongue', P('M-36 0Q0 24 36 0', 'k2') + P(S([[0, 8, 'c'], [-2, 30], [12, 42], [28, 36], [30, 14, 'c']], { closed: true }), 'fa k3f') + P('M14 14V32', 'k3'))
}
// ear (left side, mirror for the right) with a paper earring
sym('ear', P(S([[0, -32, 'c'], [-28, -38], [-48, -14], [-46, 16], [-26, 38], [-2, 30, 'c']], { closed: true }), 'fa k') + P(S([[-18, -16], [-30, -2], [-22, 12]]), 'k3') + P(blob(-28, 58, 11, 12, { seed: 6 }), 'pp'))
sym('cheek', P('M-16 -6L-8 10M4 -8L12 8', 'k3'))
sym('glasses-round', P(blob(-62, 0, 38, 38, { seed: 3, wob: 0.01 }), 'k2') + P(blob(62, 0, 38, 38, { seed: 4, wob: 0.01 }), 'k2') + P('M-24 -6Q0 -18 24 -6', 'k2') + P('M-98 -6L-124 -14M98 -6L124 -14', 'k2') + P('M-82 -12Q-76 -24 -62 -26M42 -12Q48 -24 62 -26', 'pp'))
sym('glasses-sun', P(rrect(-98, -22, 74, 52, 22), 'fi') + P(rrect(24, -22, 74, 52, 22), 'fi') + P('M-26 -6H26', 'k2') + P('M-98 -10L-124 -16M98 -10L124 -16', 'k2') + P('M-82 -6L-62 -6M40 -6L60 -6', 'pp'))

// ------------------------------------------------------------------ HANDS (origin = wrist centre, fingers up, ~105 px wide)
{
  const palm = (top = -96) => S([[-32, 12, 'c'], [-46, -24], [-54, -62], [-52, top, 'c'], [52, top, 'c'], [54, -62], [46, -24], [32, 12, 'c']], { closed: true })
  // a finger = capsule that starts at (bx,by), leans 'ang' degrees from vertical, 'len' long, 'w' wide
  const fing = (bx, by, ang, len, w) => {
    const a = (ang * Math.PI) / 180, d = [Math.sin(a), -Math.cos(a)], e = len - w / 2
    const p = (t, c = 0) => [bx + d[0] * e * t - d[1] * c, by + d[1] * e * t + d[0] * c]
    return S(capsule([p(0), p(0.55, 2), p(1, 0)], [w / 2, w / 2 - 0.5, w / 2 - 1.5]), { closed: true })
  }
  const F = (d) => P(d, 'fa k')
  const knuckle = (x, top = -104) => F(rrect(x - 14, top - 24, 28, 44, 14))          // a curled finger: just its rounded top above the palm
  const thumbAcross = F(S(capsule([[44, -26], [18, -50], [-10, -58]], [18, 16, 13]), { closed: true }))
  sym('hand-open', F(fing(38, -84, 16, 68, 28)) + F(fing(15, -92, 6, 92, 29)) + F(fing(-10, -94, -2, 102, 29)) + F(fing(-35, -88, -13, 90, 29))
    + F(S(capsule([[-44, -26], [-66, -44], [-84, -52]], [17, 16, 14]), { closed: true })) + F(palm()))
  sym('hand-fist', [-39, -13, 13, 39].map((x) => knuckle(x)).join('') + F(palm(-104)) + P('M-26 -104V-76M0 -104V-76M26 -104V-76', 'k3') + thumbAcross)
  sym('hand-point', F(fing(-37, -92, -4, 108, 28)) + [-11, 14, 39].map((x) => knuckle(x)).join('') + F(palm(-104)) + P('M2 -104V-76M26 -104V-76', 'k3') + thumbAcross)
  sym('hand-peace', F(fing(-30, -96, -12, 108, 28)) + F(fing(-3, -100, 9, 114, 28)) + [20, 43].map((x) => knuckle(x)).join('') + F(palm(-104)) + P('M32 -104V-78', 'k3') + thumbAcross)
  const stack = [-80, -54, -28, -2].map((y) => F(rrect(-48, y - 14, 96, 30, 15))).join('')
  const thumbUp = S(capsule([[-30, -88], [-33, -128]], [19, 18]), { closed: true })
  sym('hand-thumbsup', F(thumbUp) + stack + P(thumbUp, 'fa') + P('M-48 -86V-72', 'fa'))
  sym('hand-horns', F(S(capsule([[-6, -92], [-6, -98]], [15, 15]), { closed: true })) + F(S(capsule([[20, -92], [20, -98]], [14, 14]), { closed: true }))
    + F(S(capsule([[-38, -86], [-42, -122], [-45, -146]], [19, 18, 16]), { closed: true })) + F(S(capsule([[40, -86], [45, -112], [50, -126]], [16, 15, 14]), { closed: true }))
    + F(palm(-98)) + thumbAcross)
}

// ------------------------------------------------------------------ SHOES (origin = ankle, toe -> +x, sole bottom at y = 125; flip with scale(-1 1))
{
  const SK = 1.2
  const sk = (pts) => scPts(pts, SK, SK, [0, 0])
  const hightop = S(sk([[-62, 0, 'c'], [-72, 40], [-78, 88], [-70, 104, 'c'], [120, 104, 'c'], [152, 92], [156, 66], [136, 46], [88, 34], [48, 14], [44, -2, 'c']]), { closed: true })
  clipDef('hightop', hightop)
  const Y = (y) => y * SK, X = (x) => x * SK
  const laces = [0, 1, 2].map((i) => `<path class="pp" d="M${fmt(X(44 + i * 28))} ${fmt(Y(26 + i * 10))} L${fmt(X(60 + i * 28))} ${fmt(Y(44 + i * 10))}"/>`).join('')
  sym('shoe-hightop', P(hightop, 'fi') + `<g clip-path="url(#k-clip-hightop)">${P(`M${X(-100)} ${Y(80)} L${X(180)} ${Y(76)} L${X(180)} ${Y(130)} L${X(-100)} ${Y(130)}Z`, 'fp')}${P(`M${X(-100)} ${Y(80)} L${X(180)} ${Y(76)}`, 'k3')}</g>`
    + laces + P(blob(X(-10), Y(34), 6, 6, { seed: 21 }), 'fp') + P(blob(X(-10), Y(56), 6, 6, { seed: 22 }), 'fp') + P(`M${X(124)} ${Y(54)} Q${X(134)} ${Y(64)} ${X(131)} ${Y(72)}`, 'pp'))
  const low = S([[-62, 22, 'c'], [-72, 56], [-76, 94], [-68, 108, 'c'], [122, 108, 'c'], [156, 96], [158, 72], [136, 54], [90, 48], [44, 32], [16, 14], [-18, 18]], { closed: true })
  clipDef('low', low)
  sym('shoe-low', P(low, 'fi') + `<g clip-path="url(#k-clip-low)">${P('M-100 90L180 84V140H-100Z', 'fp')}${P('M-100 90L180 84', 'k3')}</g>`
    + P('M-44 66Q30 36 112 62', 'sh') + P(blob(-4, 36, 6, 6, { seed: 23 }), 'fp') + P('M30 40L44 52M54 46L68 58', 'pp'))
  const boot = S([[-54, -140, 'c'], [54, -140, 'c'], [58, 34], [100, 54], [152, 82], [166, 108], [158, 128, 'c'], [-64, 128, 'c'], [-66, 88], [-60, 24]], { closed: true })
  clipDef('boot', boot)
  sym('shoe-boot', P(boot, 'fi') + `<g clip-path="url(#k-clip-boot)">${P('M-80 -118H80V-88H-80Z', 'fa')}${P('M-80 104L180 100V150H-80Z', 'fp')}${P('M-80 104L180 100', 'k3')}</g>` + P('M-26 -62Q-32 -16 -26 24', 'pp'))
}

// ------------------------------------------------------------------ DOODLES (origin = centre)
{
  const spark = 'M0 -26Q4 -5 26 0Q4 5 0 26Q-4 5 -26 0Q-4 -5 0 -26Z'
  sym('sparkle', P(spark, 'fi'))
  const star = Array.from({ length: 10 }, (_, i) => { const r = i % 2 ? 15 : 36, a = (-90 + i * 36) * Math.PI / 180; return [Math.cos(a) * r, Math.sin(a) * r] })
  sym('star5', P(poly(star, true), 'fa k'))
  sym('heart', P('M0 28C-42 -2 -36 -36 -13 -34C-4 -33 0 -26 0 -21C0 -26 4 -33 13 -34C36 -36 42 -2 0 28Z', 'fa k'))
  sym('note1', P(blob(0, 0, 19, 14, { seed: 63, rot: -22 }), 'fi') + P('M17 -4V-68', 'k3') + P('M13 -68Q18 -50 46 -44L48 -33Q14 -40 13 -62Z', 'fi'))
  sym('note2', P(blob(0, 0, 19, 14, { seed: 61, rot: -22 }) + blob(46, -10, 19, 14, { seed: 62, rot: -22 }), 'fi') + P('M17 -4V-80M63 -14V-90', 'k3') + P('M13 -76L67 -88V-72L13 -60Z', 'fi'))
  sym('steam', P('M-10 40Q-30 20 -10 0Q10 -20 -10 -40', 'k2') + P('M18 34Q2 16 18 -2Q34 -20 18 -36', 'k3'))
  sym('waves', P('M10 -18A26 26 0 0 1 10 18', 'k2') + P('M30 -38A52 52 0 0 1 30 38', 'k2') + P('M50 -58A78 78 0 0 1 50 58', 'k3'))
  sym('speed', P('M-60 -24H20', 'k2') + P('M-40 0H40', 'k2') + P('M-60 24H0', 'k2'))
  const burst = Array.from({ length: 24 }, (_, i) => { const r = i % 2 ? 30 : 48, a = (i * 15) * Math.PI / 180; return [Math.cos(a) * r, Math.sin(a) * r] })
  sym('burst', P(poly(burst, true), 'fa k'))
  sym('confetti', P(blob(-30, -18, 6, 6, { seed: 1 }), 'fi') + P(blob(24, 24, 5, 5, { seed: 2 }), 'fi') + P('M-4 -2H14M5 -11V7', 'k3') + P('M-26 30L-14 22', 'k3') + P('M26 -26L38 -32', 'k3') + P(blob(2, 34, 4, 4, { seed: 3 }), 'fi'))
  sym('zzz', P('M-30 -20H-8L-30 8H-8', 'k2') + P('M0 -40H18L0 -18H18', 'k3') + P('M26 -62H40L26 -44H40', 'k3'))
  sym('question', P('M-18 -22Q-18 -48 6 -48Q30 -48 30 -26Q30 -10 8 -2V14', 'k2') + P(blob(8, 38, 7, 7, { seed: 8 }), 'fi'))
  sym('exclaim', P('M0 -40V10', 'k2', 'style="stroke-width:16"') + P(blob(0, 36, 8, 8, { seed: 9 }), 'fi'))
  const spiral = Array.from({ length: 40 }, (_, i) => { const t = i / 39, a = t * 4.2 * Math.PI, r = 4 + t * 34; return [Math.cos(a) * r, Math.sin(a) * r] })
  sym('swirl', P(S(spiral), 'k2'))
  sym('patch', P(rrect(-50, -50, 100, 100, 16), 'fa k') + P(rrect(-36, -36, 72, 72, 9), 'st') + P(spark, 'fi', 'transform="scale(0.65)"'))
  sym('button', P(blob(0, 0, 8, 8, { seed: 5 }), 'fi'))
}

// ------------------------------------------------------------------ CATALOG (the visual index; order = README table)
const cat = []
const put = (id, x, y, s = 1) => cat.push(`<use href="#k-${id}" xlink:href="#k-${id}" transform="translate(${x} ${y}) scale(${s})"/>`)
const panel = (x, y, w, h) => cat.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="40" class="fa k"/>`)
const W = 2100
const col = (i) => 130 + i * 185
panel(30, 30, W - 60, 520)
;['eye-dot', 'eye-happy', 'eye-wink', 'eye-sleepy', 'eye-wide', 'brow-arch', 'brow-flat', 'brow-worry', 'brow-angry', 'brow-up', 'cheek'].forEach((id, i) => put(id, col(i), 110))
;['nose-hook', 'nose-L', 'nose-dot', 'nose-small', 'mouth-grin', 'mouth-smile', 'mouth-smirk', 'mouth-flat', 'mouth-o', 'mouth-tongue'].forEach((id, i) => put(id, col(i), 250))
;[['glasses-round', 330], ['glasses-sun', 800], ['ear', 1250]].forEach(([id, x]) => put(id, x, id === 'ear' ? 400 : 430))
panel(30, 580, W - 60, 340)
;['hand-open', 'hand-fist', 'hand-point', 'hand-peace', 'hand-thumbsup', 'hand-horns'].forEach((id, i) => put(id, 200 + i * 330, 840, 1.2))
panel(30, 950, W - 60, 340)
;[['shoe-hightop', 260, 1060], ['shoe-low', 820, 1060], ['shoe-boot', 1360, 1100]].forEach(([id, x, y]) => put(id, x, y))
panel(30, 1320, W - 60, 330)
;['sparkle', 'star5', 'heart', 'note1', 'note2', 'steam', 'waves', 'speed', 'burst', 'confetti', 'zzz', 'question', 'exclaim', 'swirl', 'patch', 'button'].forEach((id, i) => put(id, 130 + (i % 8) * 250, 1420 + Math.floor(i / 8) * 130))

const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="2100" height="1690" viewBox="0 0 2100 1690">
<title>Doodle kit - building blocks for the sticker series</title>
<desc>Shared styles, halo / wobble / grain filters and hand-drawn building blocks (face parts, hands, shoes, doodles). Open in a browser for the catalog; paste the blocks you need into a sticker. See README.md.</desc>
<!--
 RECIPE (see README.md for the numbers)
   <g transform="FIT">                                  FIT = translate/scale that centres the die-cut: halo >= 60 px from the canvas edge
     <g id="halo" filter="url(#halo-smooth)"><g fill="ACCENT" stroke="ACCENT" stroke-width="76" stroke-linejoin="round">
        <use href="#shape-a"/> <use href="#shape-b"/> ... every closed silhouette shape of the character </g></g>
     <g id="art" filter="url(#wobble)"> parts painted back to front: <use href="#shape-a" class="fa k"/> + open <path class="k2|k3"/> details </g>
   </g>
   <rect width="1200" height="1600" filter="url(#grain)" mask="url(#haloMask)" opacity=".16"/>     haloMask = the same halo group, white
-->
${styleBlock(cfg)}
<defs>
${filterDefs(cfg, { x: -100, y: -100, width: 2400, height: 1900 })}
${defs.join('\n')}
</defs>
<rect width="2100" height="1690" fill="${cfg.paper}"/>
<g id="catalog" filter="url(#wobble)">
${cat.join('\n')}
</g>
</svg>
`
fs.writeFileSync(OUT, svg)
console.log('wrote', OUT, svg.length, 'bytes,', defs.length, 'defs')
