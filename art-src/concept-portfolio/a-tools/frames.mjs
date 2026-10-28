// Slide 2: five framed foley props (celery, cellophane, watermelon, cabbage, umbrella), tape and hang-tags.
// Each prop is drawn in a local frame (origin = centre of the frame's paper, y down) and placed with translate + rotate.
import { rng, r1, add, sub, mul, len, norm, rot, lerp, P, smoothD } from './lib.mjs'
import { limb, strip } from './ona.mjs'

const CEL = '#9CCF9A', CELS = '#6FAE79', TOM = '#E8553E', TOMS = '#C23F2B', PERI = '#7A8CE8', PERIS = '#5B6BC4'
const PAPER = '#F6F0DC', BUT = '#FDEFAF', BUTS = '#EBD58A', SUN = '#F2C62F', SAL = '#F2A29A', INK = '#101820', STEEL = '#63A0AC'
const maskId = (() => { let n = 0; return () => `pm${++n}` })()

// frames: symbol, box, tilt (positions nudged +-24 px from the guide where noted in the report; F5 moved to the free right column)
export const FR = [
  { id: 'f1', sym: 'fr-a', x: 524, y: 648, w: 300, h: 380, rot: -3 },
  { id: 'f2', sym: 'fr-b', x: 728, y: 634, w: 304, h: 240, rot: 4 },
  { id: 'f5', sym: 'fr-c', x: 880, y: 1208, w: 200, h: 200, rot: 6 },
  { id: 'f3', sym: 'fr-c', x: 330, y: 1150, w: 320, h: 320, rot: -2 },
  { id: 'f4', sym: 'fr-a', x: 72, y: 1290, w: 300, h: 380, rot: 3 },
]
// centre of the paper of a frame, in slide coordinates (derived from the kit symbols' paper polygons)
export function paperCentre(f) {
  if (f.sym === 'fr-a') return [f.x + 148, f.y + 192]
  if (f.sym === 'fr-b') return [f.x + 153, f.y + 122]
  return [f.x + 0.503 * f.w, f.y + 0.503 * f.w]
}
const place = (f, inner) => { const c = paperCentre(f); return `<g transform="translate(${r1(c[0])} ${r1(c[1])}) rotate(${f.rot})">${inner}</g>` }
export function framesInner() {
  return FR.map((f) => `<use id="${f.id}" href="#${f.sym}" x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" transform="rotate(${f.rot} ${f.x + f.w / 2} ${f.y + f.h / 2})"/>`).join('')
}

// ---------- shape helpers ----------
function scallop(cx, cy, r, n, depth, rotDeg = 0) { // circle with n scallops
  const pts = []
  const steps = n * 8
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2 + (rotDeg * Math.PI) / 180
    const rr = r - depth * Math.abs(Math.sin((a - (rotDeg * Math.PI) / 180) * (n / 2)))
    pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)])
  }
  return 'M' + pts.map(P).join('L') + 'Z'
}
// rounded, serrated leaflet from (cx,cy) pointing `ang` degrees (0 = right, clockwise)
function leaflet(cx, cy, ang, L, W) {
  const t = [Math.cos((ang * Math.PI) / 180), Math.sin((ang * Math.PI) / 180)], n = [-t[1], t[0]]
  const pts = [], N = 7
  for (let i = 0; i <= N * 2; i++) {
    const u = i / (N * 2), side = u < 0.5 ? 1 : -1, v = u < 0.5 ? u * 2 : (1 - u) * 2
    const w = W * Math.sin(Math.PI * v * 0.92) * (1 + (i % 2 ? -0.16 : 0.1))
    pts.push(add(add([cx, cy], mul(t, L * v)), mul(n, side * w)))
  }
  return 'M' + pts.map(P).join('L') + 'Z'
}

// ================= F1: celery bunch =================
function celery() {
  const stalks = [
    { c: [[-92, 134], [-104, 8], [-118, -96]], w: [29, 23, 15], crown: [-118, -100] },
    { c: [[-28, 138], [-34, 6], [-44, -118]], w: [32, 25, 16], crown: [-44, -122] },
    { c: [[34, 132], [48, 4], [66, -104]], w: [29, 23, 15], crown: [66, -108] },
  ]
  let flat = '', ink = ''
  stalks.forEach((s, i) => {
    const lb = limb(s.c, s.w, { per: 10 })
    flat += `<path d="${lb.d}" fill="${CEL}"/>`
    flat += `<path d="${strip(lb, 'R', 0.42, 1, 0, 1)}" fill="${CELS}"/>`
    const base = s.c[0]
    flat += `<ellipse cx="${base[0]}" cy="${base[1] + 6}" rx="${s.w[0] + 1}" ry="10" fill="${PAPER}"/>`
    // frilly crown: 3 thin stems, each with a cluster of 3 leaflets
    const [tx, ty] = s.crown
    const R = rng(60 + i)
    ;[-34, 0, 34].forEach((da, k) => {
      const ang = -90 + da + R.range(-6, 6)
      const len1 = R.range(30, 44)
      const dir = [Math.cos((ang * Math.PI) / 180), Math.sin((ang * Math.PI) / 180)]
      const tip = add([tx, ty + 8], mul(dir, len1))
      flat += `<path d="M${P([tx, ty + 8])}L${P(tip)}" stroke="${CELS}" stroke-width="7" stroke-linecap="round" fill="none"/>`
      ;[-52, 0, 52].forEach((dd, q) => { flat += `<path d="${leaflet(tip[0], tip[1], ang + dd, R.range(22, 30), 9.5)}" fill="${q === 1 ? CELS : CEL}"/>` })
      if (k === 1 || i === 0) ink += `<path d="M${P(tip)}L${P(add(tip, mul(dir, 20)))}" class="ink-fine"/>`
    })
    // lit side ink: one long broken line down the rib
    const pts = []
    for (let j = Math.floor(lb.c.length * 0.1); j < lb.c.length * 0.88; j++) pts.push(add(lb.c[j], mul(sub(lb.L[j], lb.c[j]), 0.5)))
    ink += `<path d="${'M' + pts.map(P).join('L')}" class="ink-fine" stroke-dasharray="70 20 36 24"/>`
  })
  // tomato rubber band around the bunch
  flat += `<path d="M-126 52C-70 40 24 44 82 52L84 82C24 74 -70 74 -124 88Z" fill="${TOM}"/><path d="M24 45C46 46 66 48 82 52L84 82C66 79 44 76 24 76Z" fill="${TOMS}"/>`
  ink += `<path d="M-126 52C-70 40 24 44 82 52M-122 88C-70 74 -20 76 8 78" class="ink"/>`
  return { flat, ink }
}

// ================= F2: twisted cellophane candy wrapper =================
function cellophane() {
  const R = rng(777)
  let flat = "", ink = ""
  const C = [34, 2]
  const fan = (dir, col) => {
    const x0 = C[0] + dir * 62, x1 = C[0] + dir * 140
    return `<path d="M${x0} -26L${x1} -62L${x1 - dir * 8} -34L${x1 + dir * 4} -12L${x1 - dir * 6} 12L${x1 + dir * 2} 34L${x1 - dir * 8} 62L${x0} 26Z" fill="${col}"/>`
  }
  flat += fan(-1, SUN) + fan(1, SAL)
  // lighter streaks on the fans (the sheet catching the light)
  flat += `<path d="M${C[0] - 66} -16L${C[0] - 128} -52L${C[0] - 124} -36L${C[0] - 66} -4Z" fill="${PAPER}" opacity=".9"/><path d="M${C[0] - 66} 8L${C[0] - 124} 14L${C[0] - 120} 30L${C[0] - 66} 20Z" fill="${SAL}" opacity=".9"/>`
  flat += `<path d="M${C[0] + 66} -10L${C[0] + 126} -42L${C[0] + 124} -24L${C[0] + 66} 2Z" fill="${PAPER}" opacity=".9"/><path d="M${C[0] + 66} 12L${C[0] + 122} 22L${C[0] + 118} 44L${C[0] + 66} 26Z" fill="${SUN}" opacity=".95"/>`
  const body = [[-62, -30], [-20, -44], [26, -38], [64, -28], [72, 4], [60, 32], [18, 42], [-24, 38], [-64, 28], [-72, -2]].map(([x, y]) => [C[0] + x, C[1] + y])
  flat += `<path d="M${body.map(P).join("L")}Z" fill="${BUT}"/>`
  const ctr = [C[0] + 4, C[1] - 2]
  const facetCols = [SAL, SUN, PAPER, SAL, BUTS]
  ;[0, 2, 4, 6, 8].forEach((k, q) => { flat += `<path d="M${P(body[k])}L${P(body[k + 1])}L${P(ctr)}Z" fill="${facetCols[q]}"/>` })
  flat += `<path d="M${P([C[0] - 40, C[1] - 30])}L${P([C[0] - 12, C[1] - 38])}L${P([C[0] - 2, C[1] - 28])}L${P([C[0] - 28, C[1] - 20])}Z" fill="${PAPER}"/>`
  // ink: partial outline on the lit top edge of body + fans, a few creases (not radiating from one point)
  ink += `<path d="M${P(body[0])}L${P(body[1])}L${P(body[2])}L${P(body[3])}" class="ink"/>`
  ink += `<path d="M${C[0] - 62} -26L${C[0] - 140} -62L${C[0] - 148} -34" class="ink"/><path d="M${C[0] + 62} -26L${C[0] + 140} -62" class="ink"/>`
  ink += `<g class="ink-fine"><path d="M${P(lerp(ctr, body[1], 0.2))}L${P(lerp(ctr, body[4], 0.8))}"/><path d="M${P(body[6])}L${P(lerp(body[6], ctr, 0.7))}"/><path d="M${P(body[8])}L${P(lerp(body[8], ctr, 0.6))}"/><path d="M${P(lerp(ctr, body[2], 0.4))}L${P(lerp(ctr, body[5], 0.7))}"/></g>`
  for (const dir of [-1, 1]) for (let k = 0; k < 4; k++) { const y0 = -18 + k * 12, y1 = -46 + k * 30, x0 = C[0] + dir * 64, x1 = C[0] + dir * (118 + R.range(-6, 8)); ink += `<path d="M${x0} ${y0}L${x1} ${y1}" class="ink-fine" stroke-dasharray="${R.int(24, 36)} ${R.int(10, 16)}"/>` }
  const K = `translate(60 0) scale(.95) translate(${-C[0]} ${-C[1]})`
  const sp = `<use href="#sp-4" x="-70" y="-104" width="50" height="50" fill="${SUN}"/><use href="#sp-4s" x="108" y="62" width="40" height="40" fill="${SAL}"/>`
  return { flat: `<g transform="${K}">${flat}</g>`, ink: `<g transform="${K}">${ink}</g>`, extra: sp }
}

// ================= F5: watermelon half-moon =================
function watermelon() {
  const half = (r) => `M${-r} 0A${r} ${r} 0 0 0 ${r} 0Z`
  const id = maskId()
  const flat = `<path d="${half(72)}" fill="${CEL}"/>
  <mask id="${id}" maskUnits="userSpaceOnUse" x="-120" y="-40" width="240" height="160"><rect x="-120" y="-40" width="240" height="160" fill="white"/><path d="${half(72)}" fill="black" transform="translate(-14 -16)"/></mask>
  <path d="${half(72)}" fill="${CELS}" mask="url(#${id})"/>
  <path d="${half(59)}" fill="${PAPER}"/>
  <path d="${half(51)}" fill="${TOM}"/>
  <path d="M51 0A51 51 0 0 1 20 46A56 56 0 0 0 51 0Z" fill="${TOMS}"/>`
  const seeds = [[-30, 16], [-10, 24], [12, 26], [30, 16], [-20, 38], [6, 41], [24, 36]]
  const seedD = seeds.map(([x, y], i) => `<path transform="translate(${x} ${y}) rotate(${-20 + i * 7})" d="M0 -7C5 -2 5 6 0 8C-5 6 -5 -2 0 -7Z" fill="${INK}"/>`).join('')
  const ink = `<path d="M-72 2C-70 30 -52 56 -26 66" class="ink"/>${seedD}`
  return { flat, ink }
}

// ================= F3: cabbage =================
function cabbage() {
  const C = [-34, 6], Rr = 100
  let flat = "", ink = ""
  const id = maskId()
  // base head: gently ruffled circle
  const head = scallop(C[0], C[1], Rr, 9, 5, 10)
  flat += `<path d="${head}" fill="${CEL}"/>`
  // wrapper leaves = crescents of the head cut by shifted circles (spiral of overlapping leaves)
  const cres = (dx, dy, col, rr) => { const m = maskId(); return `<mask id="${m}" maskUnits="userSpaceOnUse" x="-260" y="-200" width="440" height="420"><rect x="-260" y="-200" width="440" height="420" fill="white"/><circle cx="${C[0] + dx}" cy="${C[1] + dy}" r="${rr}" fill="black"/></mask><path d="${head}" fill="${col}" mask="url(#${m})"/>` }
  flat += cres(44, -30, CELS, 96) + cres(-30, 46, CELS, 92)
  flat += `<path d="${scallop(C[0] - 8, C[1] - 10, 52, 6, 4, 0)}" fill="${CEL}"/><path d="${scallop(C[0] - 12, C[1] - 16, 30, 5, 3, 12)}" fill="${CELS}"/>`
  // pale veins (paper) on the wrapper leaves, fanning from the stem side
  const veins = [[[C[0] + 16, C[1] + 96], [C[0] - 30, C[1] + 20], [C[0] - 74, C[1] - 38]], [[C[0] + 16, C[1] + 96], [C[0] + 40, C[1] + 30], [C[0] + 78, C[1] - 6]], [[C[0] - 10, C[1] + 98], [C[0] - 56, C[1] + 60], [C[0] - 92, C[1] + 14]], [[C[0] + 30, C[1] + 92], [C[0] + 62, C[1] + 58], [C[0] + 88, C[1] + 40]]]
  veins.forEach(([p0, p1, p2], i) => { flat += `<path d="M${P(p0)}Q${P(p1)} ${P(p2)}" stroke="${PAPER}" stroke-width="${i < 2 ? 6 : 4}" stroke-linecap="round" fill="none"/>`; const j = lerp(p1, p2, 0.5); flat += `<path d="M${P(lerp(p1, p2, 0.2))}L${P(add(j, [i % 2 ? 14 : -14, -12]))}" stroke="${PAPER}" stroke-width="3" stroke-linecap="round" fill="none"/>` })
  // ink: partial rim on the lit upper-left of the head, a few fold lines
  const pts = []; for (let q = 0; q <= 14; q++) { const a = Math.PI * 0.9 + (Math.PI * 0.75 * q) / 14; pts.push([C[0] + (Rr - 1) * Math.cos(a), C[1] + (Rr - 1) * Math.sin(a)]) }
  ink += `<path d="M${pts.map(P).join("L")}" class="ink"/>`
  ink += `<g class="ink-fine"><path d="M${C[0] - 62} ${C[1] - 48}C${C[0] - 40} ${C[1] - 68} ${C[0] - 4} ${C[1] - 72} ${C[0] + 22} ${C[1] - 58}" stroke-dasharray="46 14"/><path d="M${C[0] + 56} ${C[1] + 22}C${C[0] + 40} ${C[1] + 52} ${C[0] + 10} ${C[1] + 66} ${C[0] - 20} ${C[1] + 62}" stroke-dasharray="30 12"/></g>`
  return { flat, ink }
}

// ================= F4: open umbrella =================
function umbrella() {
  const top = -150, base = -48, hw = 114
  const n = 8, step = (2 * hw) / n
  let d = `M${-hw} ${base}C${-hw} ${top + 46} ${-52} ${top} 0 ${top}C52 ${top} ${hw} ${top + 46} ${hw} ${base}`
  for (let i = n - 1; i >= 0; i--) { const x1 = -hw + (i + 1) * step, x0 = -hw + i * step; d += `Q${(x0 + x1) / 2} ${base + 22} ${x0} ${base}` }
  d += 'Z'
  const ribs = []
  for (let i = 1; i < n; i++) { const x = -hw + i * step; ribs.push(`M0 ${top + 4}Q${x * 0.55} ${(top + base) / 2 - 6} ${x} ${base + 4}`) }
  ribs.push(`M0 ${top + 4}Q${-hw * 0.7} ${(top + base) / 2 - 12} ${-hw + 6} ${base - 4}`, `M0 ${top + 4}Q${hw * 0.7} ${(top + base) / 2 - 12} ${hw - 6} ${base - 4}`)
  const id = maskId()
  const flat = `<path d="${d}" fill="${PERI}"/>
  <mask id="${id}" maskUnits="userSpaceOnUse" x="-160" y="-220" width="320" height="260"><rect x="-160" y="-220" width="320" height="260" fill="white"/><path d="${d}" fill="black" transform="translate(-26 -14)"/></mask>
  <path d="${d}" fill="${PERIS}" mask="url(#${id})"/>
  <path d="M0 ${base} L0 118" stroke="${INK}" stroke-width="7" stroke-linecap="round" fill="none"/>
  <path d="M-2 118C-2 160 -48 168 -50 126" stroke="${TOM}" stroke-width="17" stroke-linecap="round" fill="none"/>
  <path d="M-2 ${top - 6}L-2 ${top - 40}" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><circle cx="-2" cy="${top - 46}" r="8" fill="${STEEL}"/>`
  const ink = `<g class="ink-fine">${ribs.map((r) => `<path d="${r}"/>`).join('')}</g>
  <path d="M${-hw + 2} ${base - 6}C${-hw - 2} ${top + 50} ${-60} ${top + 4} -4 ${top - 2}" class="ink"/>
  <path d="M-4 118C-6 160 -50 168 -52 128" class="ink-fine" stroke-dasharray="40 14" transform="translate(-6 -3)"/>`
  return { flat, ink }
}

// ---------- tape ----------
const tapeUse = (x, y, w, rotDeg, fill) => `<use href="#tape" x="${x}" y="${y}" width="${w}" height="${r1((w * 72) / 260)}" fill="${fill}" opacity=".88" transform="rotate(${rotDeg} ${r1(x + w / 2)} ${r1(y + (w * 72) / 520)})"/>`

// ---------- hang tags: tag-b (600 x 96 box) sized to its text (Syne 700, measured in Chrome at 20 px) ----------
const TXT = { 'CELERY · BONES': 217.7, 'CELLOPHANE · FIRE': 263.5, 'WATERMELON · HEADS': (273.1 * 20) / 18, 'CABBAGE · STABS': 230.5, 'UMBRELLA · WINGS': 260.1 }
function tag({ x, y, rotDeg = 0, fill = SUN, text, fs = 20 }) {
  const w = Math.round(TXT[text] * (fs / 20) + 66), s = w / 600, h = 96 * s
  const tr = `rotate(${rotDeg} ${r1(x + w / 2)} ${r1(y + h / 2)})`
  return {
    w, h,
    shape: `<use href="#tag-b" x="${x}" y="${y}" width="${w}" height="${r1(h)}" fill="${fill}" transform="${tr}"/>`,
    txt: `<text class="t-label" x="${r1(x + 70 * s + 4)}" y="${r1(y + h * 0.66)}" font-size="${fs}" fill="${INK}" transform="${tr}">${text}</text>`,
  }
}

export function props() {
  const objs = { f1: celery(), f2: cellophane(), f5: watermelon(), f3: cabbage(), f4: umbrella() }
  const byId = Object.fromEntries(FR.map((f) => [f.id, f]))
  const flat = Object.keys(objs).map((k) => place(byId[k], objs[k].flat)).join('')
  const ink = Object.keys(objs).map((k) => place(byId[k], objs[k].ink)).join('')
  const extra = place(byId.f2, objs.f2.extra)
  const tapes = [
    tapeUse(540, 628, 120, -28, SAL),
    tapeUse(850, 618, 130, 12, SUN),
    tapeUse(960, 1192, 110, -10, SUN),
    tapeUse(342, 1134, 130, -14, SAL),
    tapeUse(150, 1274, 140, 6, SUN),
  ].join('')
  const T = {
    f4: tag({ x: 90, y: 1676, rotDeg: 3, text: 'UMBRELLA · WINGS' }),
    f3: tag({ x: 292, y: 1488, rotDeg: -2, text: 'CABBAGE · STABS' }),
    f2: tag({ x: 700, y: 556, rotDeg: 3, fill: PAPER, text: 'CELLOPHANE · FIRE' }),
    f1: tag({ x: 536, y: 602, rotDeg: -3, fill: PAPER, text: 'CELERY · BONES' }),
    f5: tag({ x: 972, y: 1404, text: 'WATERMELON · HEADS', fs: 18 }),
  }
  const V = `translate(1012 1400) rotate(90) translate(-972 -1404)` // F5's tag hangs vertically from its frame in the free right column
  const tagsShapes = [T.f4, T.f3, T.f2, T.f1].map((t) => t.shape).join('') + `<g transform="${V}">${T.f5.shape}</g>`
  const tagsText = [T.f4, T.f3, T.f2, T.f1].map((t) => t.txt).join('') + `<g transform="${V}">${T.f5.txt}</g>`
  return { flat, ink, extra, tapes, tagsShapes, tagsText }
}
