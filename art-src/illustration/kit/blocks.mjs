// blocks.mjs - head building blocks (face, features, ear, hair, hats, headphones) for the doodle stickers.
//
// All blocks are drawn in FACE-LOCAL coordinates (origin = face centre, the pilot's face is 224 px wide, 264 px tall, eye line y ~ -16,
// mouth y ~ 86) and placed with a head frame, so hair, face, ear and hat always share one tilt/scale/position:
//
//   import { headFrame, face, features, ear, hairBob, beanie } from './kit/blocks.mjs'
//   const fr = headFrame({ center: [652, 436], tilt: 9, scale: 1 })
//   group('hair', () => hairBob(st, fr))                      // BACK layer: painted before the neck / tee
//   group('head', () => { face(st, fr); ear(st, fr); features(st, fr, { eyes: 'dot', brows: 'arch', nose: 'hook', mouth: 'grin' }); beanie(st, fr) })
//
// Layers: 'back' blocks (hairBob, ponytailBack) go BEHIND the neck/body; 'front' blocks (hair caps, hats, headphones) go on top of the
// face. Every block registers its closed shapes with st.shape() so the die-cut halo wraps them. All ids can be changed with { id }.
import { blob, rotPts, trPts, scPts, fmt, rrect, limb, capsule } from './pen.mjs'

/** head frame: face-local points -> canvas points (rotate by tilt degrees, scale, translate to centre) */
export function headFrame({ center = [600, 440], tilt = 0, scale = 1 } = {}) {
  const H = (pts) => trPts(scPts(rotPts(pts, tilt, [0, 0]), scale, scale, [0, 0]), center[0], center[1])
  const hp = (p) => H([p])[0]
  return { H, hp, tilt, scale, center }
}

export const FACE = [[-98, -100], [-112, -26], [-100, 44], [-60, 108], [-8, 138], [48, 126], [92, 74], [112, 4], [106, -72], [0, -126]]

const mirror = (pts) => pts.map(([x, y, f]) => (f === undefined ? [-x, y] : [-x, y, f]))
const P2 = (p) => `${fmt(p[0])} ${fmt(p[1])}`

/** the face oval (accent fill + contour) */
export function face(st, fr, { id = 'face' } = {}) {
  st.shape(id, st.S(fr.H(FACE), { closed: true }))
  st.use(id)
}

/** left ear (accent shape with a curl, readable on black hair) + optional paper hoop; mirror = true draws the right ear */
export function ear(st, fr, { hoop = true, mirrorIt = false } = {}) {
  const m = mirrorIt ? mirror : (p) => p
  st.fillp(st.S(fr.H(m([[-98, -8, 'c'], [-126, -14], [-146, 10], [-144, 40], [-124, 62], [-100, 54, 'c']])), { closed: true }), 'fa k')
  st.line(st.S(fr.H(m([[-116, 8], [-128, 22], [-120, 38]]))), 'k3')
  if (hoop) { const e = fr.hp(mirrorIt ? [128, 82] : [-128, 82]); st.line(blob(e[0], e[1], 11 * fr.scale, 12 * fr.scale, { seed: 6 }), 'pp') }
}

// ------------------------------------------------------------------ FEATURES (eyes, brows, nose, mouth)
const EYES = {
  dot: (fr, c, s) => [['fi', blob(c[0], c[1], 11 * fr.scale, 16 * fr.scale, { seed: 31, wob: 0.03, rot: fr.tilt })], ['fp', blob(c[0] + 4 * fr.scale, c[1] - 6 * fr.scale, 4 * fr.scale, 4 * fr.scale, { seed: 50 + s })]],
}
const eyePath = {
  happy: (x, y) => [[x - 22, y + 8], [x, y - 22], [x + 22, y + 8]],
  sleepy: (x, y) => [[x - 22, y - 4], [x, y + 18], [x + 22, y - 4]],
}
const BROWS = {
  arch: [[[-84, -48], [-60, -72], [-28, -62]], [[16, -68], [42, -80], [70, -62]]],
  flat: [[[-80, -52], [-54, -58], [-28, -56]], [[16, -60], [42, -62], [70, -58]]],
  worry: [[[-84, -58], [-56, -62], [-28, -44]], [[16, -44], [44, -62], [72, -58]]],
  angry: [[[-84, -66], [-56, -56], [-28, -42]], [[16, -44], [44, -56], [72, -66]]],
  up: [[[-84, -50], [-58, -54], [-28, -52]], [[16, -72], [44, -96], [72, -70]]],
}
const NOSES = {
  hook: [[0, -2], [8, 14], [6, 28], [-4, 36], [-18, 34]],
  L: [[2, -4], [6, 20], [4, 32], [-14, 32]],
  small: [[-10, 24], [0, 34], [10, 24]],
}
/** the standard small vocabulary: eyes dot|happy|sleepy, brows arch|flat|worry|angry|up|none, nose hook|L|small|dot|none, mouth grin|smile|smirk|flat|o|tongue */
export function features(st, fr, { eyes = 'dot', brows = 'arch', nose = 'hook', mouth = 'grin', cheeks = false, mouthId = 'Mouth' } = {}) {
  const { H, hp, scale } = fr
  const S = st.S
  const e1 = hp([-54, -14]), e2 = hp([40, -20])
  if (eyes === 'dot') {
    for (const [e, s] of [[e1, 1], [e2, 2]]) for (const [cls, d] of EYES.dot(fr, e, s)) st.fillp(d, cls)
  } else {
    for (const c of [[-54, -14], [40, -20]]) st.line(S(H(eyePath[eyes](c[0], c[1]))), 'k2')
  }
  if (brows !== 'none') for (const b of BROWS[brows]) st.line(S(H(b)), 'k2')
  if (nose === 'dot') { const n = hp([0, 28]); st.fillp(blob(n[0], n[1], 8 * scale, 7 * scale, { seed: 7 }), 'fi') }
  else if (nose !== 'none') st.line(S(H(NOSES[nose])), 'k2')
  const M = (pts) => H(pts.map(([x, y, f]) => (f === undefined ? [x, y + 86] : [x, y + 86, f])))
  if (mouth === 'grin') {
    const outline = S(M([[-52, -32, 'c'], [-14, -20], [24, -24], [58, -42, 'c'], [54, 4], [28, 28], [0, 32], [-30, 24], [-50, 2]]), { closed: true })
    st.clip('clip' + mouthId, outline)
    st.fillp(outline, 'fi k')
    st.raw(`<g clip-path="url(#clip${mouthId})"><path class="fp" d="${S(M([[-64, -30], [-20, -16], [24, -22], [64, -40], [64, -16], [24, 0], [-20, 6], [-64, -10]]), { closed: true })}"/><path class="fa" d="${blob(...hp([4, 112]), 28 * scale, 15 * scale, { seed: 5, rot: fr.tilt })}"/></g>`)
  } else if (mouth === 'smile') st.line(S(M([[-44, -4], [0, 30], [44, -4]])), 'k2')
  else if (mouth === 'smirk') st.line(S(M([[-34, 8], [-4, 24], [34, -8]])), 'k2')
  else if (mouth === 'flat') st.line(S(M([[-30, 0], [30, 0]])), 'k2')
  else if (mouth === 'o') { const m = hp([0, 90]); st.fillp(blob(m[0], m[1], 17 * scale, 22 * scale, { seed: 9, wob: 0.03, rot: fr.tilt }), 'fi k3f'); st.fillp(blob(...hp([0, 102]), 9 * scale, 6 * scale, { seed: 10 }), 'fa') }
  else if (mouth === 'tongue') {
    st.line(S(M([[-36, 0], [0, 22], [36, 0]])), 'k2')
    st.fillp(S(M([[0, 8, 'c'], [-2, 30], [12, 42], [28, 36], [30, 14, 'c']]), { closed: true }), 'fa k3f')
    st.line(S(M([[14, 14], [14, 32]])), 'k3')
  }
  if (cheeks) for (const [x, y] of [[-88, 34], [84, 26]]) {
    const a = hp([x, y]), b = hp([x + 10, y + 16]), c = hp([x + 24, y - 2]), d = hp([x + 34, y + 14])
    st.line(`M${P2(a)}L${P2(b)}M${P2(c)}L${P2(d)}`, 'k3')
  }
}

// ------------------------------------------------------------------ HAIR
/** BACK layer: the pilot's wind-blown bob (one lock, scalloped end) with accent shine arcs; sides: ['left'] | ['right'] | ['left','right'] */
export function hairBob(st, fr, { id = 'hairBob', sides = ['left'] } = {}) {
  const lock = [[-124, -96, 'c'], [-162, -66], [-200, -18], [-216, 36], [-236, 62], [-214, 92, 'c'], [-228, 126], [-196, 140, 'c'], [-196, 180], [-160, 168, 'c'], [-132, 196], [-110, 150], [-102, 96], [-100, 40, 'c']]
  sides.forEach((side, i) => {
    const m = side === 'left' ? (p) => p : mirror
    const sid = i ? id + 'R' : id
    st.shape(sid, st.S(fr.H(m(lock)), { closed: true }))
    st.use(sid, 'fi')
    st.line(st.S(fr.H(m([[-150, -50], [-176, -8], [-182, 30]]))), 'sh')
    st.line(st.S(fr.H(m([[-166, 62], [-176, 96], [-160, 124]]))), 'sh')
  })
}

/** FRONT layer: scalloped curly cap with a curly fringe (ink mass), for short curly hair */
export function hairCurly(st, fr, { id = 'hairCurly' } = {}) {
  const outer = [[-118, 44, 'c'], [-152, 10], [-150, -34], [-138, -54, 'c'], [-164, -88], [-142, -120], [-118, -130, 'c'], [-98, -170], [-58, -186], [-40, -178, 'c'], [-14, -210], [24, -208], [40, -182, 'c'], [70, -200], [104, -174], [112, -152, 'c'], [146, -130], [152, -88], [134, -66, 'c'], [160, -30], [150, 10], [118, 44, 'c']]
  const fringe = [[104, -16], [96, -40], [70, -62, 'c'], [40, -44], [10, -68, 'c'], [-24, -46], [-56, -66, 'c'], [-84, -38], [-104, -14]]
  st.shape(id, st.S(fr.H([...outer, ...fringe]), { closed: true }))
  st.use(id, 'fi')
  st.line(st.S(fr.H([[-96, -150], [-110, -112], [-104, -90]])), 'sh')
  st.line(st.S(fr.H([[40, -196], [66, -176], [70, -150]])), 'sh')
}

/** FRONT layer: smooth side-parted cap of hair; bun: true adds a messy bun with a hair tie and a pencil through it */
export function hairCap(st, fr, { id = 'hairCap', bun = false, part = 'right' } = {}) {
  const m = part === 'right' ? (p) => p : mirror
  const cap = [[-112, -16, 'c'], [-130, -80], [-104, -150], [-40, -192], [40, -190], [108, -150], [134, -80], [112, -16, 'c'], [100, -50], [62, -84], [20, -108], [-30, -92], [-80, -62], [-106, -30]]
  st.shape(id, st.S(fr.H(m(cap)), { closed: true }))
  st.use(id, 'fi')
  st.line(st.S(fr.H(m([[-20, -178], [10, -140], [20, -112]]))), 'sh')
  if (bun) {
    const b = fr.hp(m([[96, -214]])[0])
    st.shape(id + 'Bun', blob(b[0], b[1], 62 * fr.scale, 58 * fr.scale, { seed: 12, rot: fr.tilt }))
    st.use(id + 'Bun', 'fi')
    st.fillp(st.S(fr.H(m([[62, -180, 'c'], [96, -162], [130, -182, 'c'], [126, -164, 'c'], [96, -146], [66, -164, 'c']])), { closed: true }), 'fa k3f')
    const p0 = fr.hp(m([[36, -258]])[0]), p1 = fr.hp(m([[132, -182]])[0]), p2 = fr.hp(m([[154, -170]])[0])
    st.raw(`<path class="k2" d="M${P2(p0)}L${P2(p1)}" style="stroke-width:15"/><path class="k2" d="M${P2(p1)}L${P2(p2)}" style="stroke:${st.cfg.paper};stroke-width:15"/>`)
  }
}

/** BACK layer: a long ponytail whipping to the left: one tapered main lock + two strands, all ink (the overlaps melt into one flowing mass) */
export function ponytail(st, fr, { id = 'ponytail' } = {}) {
  const locks = [
    [[[-112, -92], [-196, -134], [-286, -140], [-358, -104], [-380, -64]], [30, 40, 42, 32, 16]],
    [[[-200, -146], [-270, -176], [-340, -178], [-370, -162]], [18, 18, 14, 9]],
    [[[-250, -120], [-320, -84], [-366, -40], [-374, -8]], [20, 18, 14, 9]],
  ]
  locks.forEach(([axis, hw], i) => {
    st.shape(id + i, st.S(capsule(fr.H(axis), hw.map((w) => w * fr.scale)), { closed: true }))
    st.use(id + i, 'fi')
  })
  st.line(st.S(fr.H([[-190, -138], [-262, -150], [-326, -126]])), 'sh')
}

/** FRONT layer: the paper scrunchie / hair tie where the ponytail leaves the head (draw it after the hair cap) */
export function scrunchie(st, fr, { id = 'tie' } = {}) {
  const c = fr.hp([-122, -96])
  st.shape(id, blob(c[0], c[1], 30 * fr.scale, 42 * fr.scale, { seed: 14, rot: fr.tilt + 62 }))
  st.use(id, 'fp k')
  for (const [x, y] of [[-132, -112], [-124, -92], [-118, -74]]) { const a = fr.hp([x, y]), b = fr.hp([x - 14, y + 4]); st.line(`M${P2(a)}L${P2(b)}`, 'k3') }
}

// ------------------------------------------------------------------ HATS (FRONT layer)
/** knit beanie: dome (ink or accent), ribbed cuff, pom; the pilot's */
export function beanie(st, fr, { id = 'beanie', dome = 'ink', pom = true } = {}) {
  const { H, hp } = fr
  const S = st.S
  st.fillp(S(H([[-120, -80, 'c'], [0, -58], [124, -80, 'c'], [0, -46]]), { closed: true }), 'fi')     // brow shadow under the cuff
  st.shape(id, S(H([[-122, -108, 'c'], [-130, -154], [-98, -206], [-6, -232], [92, -208], [128, -156], [124, -112, 'c']]), { closed: true }))
  st.use(id, dome === 'ink' ? 'fi k' : 'fa k')
  const knit = dome === 'ink' ? 'sh' : 'k3'
  st.line(S(H([[-52, -222], [-68, -170], [-72, -122]])), knit)
  st.line(S(H([[0, -228], [-2, -176], [0, -126]])), knit)
  st.line(S(H([[52, -222], [68, -170], [72, -124]])), knit)
  st.shape(id + 'Cuff', S(H([[-126, -118, 'c'], [0, -102], [128, -120, 'c'], [122, -80, 'c'], [0, -64], [-120, -82, 'c']]), { closed: true }))
  st.use(id + 'Cuff')
  for (const x of [-90, -54, -18, 18, 54, 90]) {
    const a = H([[x, -108 + (x * x) / 2600, 'c']])[0], b = H([[x * 0.98, -72 + (x * x) / 2600]])[0]
    st.line(`M${fmt(a[0])} ${fmt(a[1] + 7)} L${fmt(b[0])} ${fmt(b[1] - 7)}`, 'k3')
  }
  if (pom) {
    const c = hp([-2, -256])
    st.shape(id + 'Pom', blob(c[0], c[1], 38 * fr.scale, 35 * fr.scale, { seed: 4 }))
    st.use(id + 'Pom', 'fp k')
  }
}

/** flat beret tilted over one side, accent with a little ink stem and fold lines */
export function beret(st, fr, { id = 'beret' } = {}) {
  const { H, hp } = fr
  const S = st.S
  st.fillp(S(H([[-120, -78, 'c'], [0, -58], [122, -80, 'c'], [0, -46]]), { closed: true }), 'fi')
  st.shape(id, S(H([[-128, -92, 'c'], [-156, -140], [-120, -190], [-30, -214], [70, -226], [150, -196], [166, -150], [134, -104, 'c'], [60, -92], [-40, -84]]), { closed: true }))
  st.use(id)
  const s = hp([8, -218])
  st.shape(id + 'Stem', S(H([[-2, -214], [-4, -240], [10, -248], [22, -238], [20, -214]]), { closed: true }))
  st.use(id + 'Stem', 'fi k')
  st.line(S(H([[-20, -214], [-60, -170], [-96, -130]])), 'k3')
  st.line(S(H([[30, -210], [50, -160], [60, -110]])), 'k3')
  st.line(S(H([[80, -214], [112, -176], [130, -140]])), 'k3')
}

/** fedora: ink crown with a pinch, accent band, wide brim; shades the brow */
export function fedora(st, fr, { id = 'fedora' } = {}) {
  const { H } = fr
  const S = st.S
  st.shape(id + 'Crown', S(H([[-104, -130, 'c'], [-100, -196], [-62, -244], [-8, -222, 'c'], [46, -246], [96, -198], [106, -130, 'c']]), { closed: true }))
  st.use(id + 'Crown', 'fi k')
  st.shape(id + 'Brim', S(H([[-214, -86], [-192, -122], [-120, -138], [0, -144], [120, -138], [192, -122], [216, -86], [182, -56], [100, -42], [0, -38], [-100, -42], [-182, -56]]), { closed: true }))
  st.use(id + 'Brim', 'fi k')
  st.shape(id + 'Band', S(H([[-106, -134, 'c'], [0, -142], [106, -134, 'c'], [104, -102, 'c'], [0, -98], [-104, -104, 'c']]), { closed: true }))
  st.use(id + 'Band')
  st.line(S(H([[-190, -92], [-120, -104], [-40, -110]])), 'sh')
}

/** head wrap / bandana with paper polka dots and a knot with two tails at the left */
export function bandana(st, fr, { id = 'bandana' } = {}) {
  const { H, hp } = fr
  const S = st.S
  st.shape(id, S(H([[-114, -66, 'c'], [-126, -128], [-92, -190], [0, -214], [92, -190], [126, -128], [114, -66, 'c'], [0, -46]]), { closed: true }))
  st.use(id)
  for (const [x, y] of [[-70, -90], [-20, -80], [34, -82], [84, -92], [-96, -140], [-46, -150], [6, -156], [58, -150], [100, -140], [-20, -186], [34, -184]]) {
    const c = hp([x, y])
    st.fillp(blob(c[0], c[1], 8 * fr.scale, 8 * fr.scale, { seed: Math.abs(x + y) }), 'fp')
  }
  const k = hp([-128, -92])
  st.shape(id + 'T1', S(capsule(H([[-124, -88], [-158, -56], [-176, -24]]), [15, 14, 12]), { closed: true }))
  st.shape(id + 'T2', S(capsule(H([[-124, -96], [-166, -84], [-196, -60]]), [14, 13, 11]), { closed: true }))
  st.use(id + 'T1'); st.use(id + 'T2')
  st.shape(id + 'Knot', blob(k[0], k[1], 24 * fr.scale, 22 * fr.scale, { seed: 6 }))
  st.use(id + 'Knot')
}

/** over-ear headphones: outlined band over the head + two ink cups with accent discs and a paper highlight */
export function headphones(st, fr, { id = 'phones' } = {}) {
  const { H, hp } = fr
  const S = st.S
  const band = S(H([[-130, 0], [-134, -120], [-98, -226], [0, -256], [98, -226], [134, -120], [130, 0]]))
  st.shape(id + 'Band', band, { halo: true })
  st.raw(`<path class="tube-k" d="${band}"/><path class="tube-a" d="${band}"/>`)
  for (const [sx, s] of [[-1, 1], [1, 2]]) {
    const c = hp([sx * 132, 24])
    st.shape(id + 'Cup' + s, blob(c[0], c[1], 52 * fr.scale, 70 * fr.scale, { seed: 20 + s, rot: fr.tilt, wob: 0.02 }))
    st.use(id + 'Cup' + s, 'fi k')
    st.fillp(blob(c[0] + sx * 4, c[1], 28 * fr.scale, 44 * fr.scale, { seed: 24 + s, rot: fr.tilt, wob: 0.02 }), 'fa')
    st.line(S(H([[sx * 150, -12], [sx * 158, 14], [sx * 150, 40]])), 'pp')
  }
}
