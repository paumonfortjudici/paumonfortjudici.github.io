// Ona mid-gallop for slide 2 ("clip-clop"). Model coordinates = ona-model.svg inner group (head box 224, sole y 1001);
// placed on the slide with translate(451 682) scale(1.029). Returns SVG fragments in z-order; slide-2.mjs wraps them in shared filter groups.
// Kit parts only for head / cans / hands / boots / socks (never redrawn). Body = flat shapes from the model sheet + generated limb tubes.
import { r1, add, sub, mul, len, norm, dot, rot, lerp, P } from './lib.mjs'

// ---------- limb helper ----------
function spline(pts, per = 14) {
  const out = []
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(i + 2, pts.length - 1)]
    for (let k = 0; k < per; k++) {
      const t = k / per, t2 = t * t, t3 = t2 * t
      out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)))
    }
  }
  out.push(pts[pts.length - 1])
  return out
}
// tube around a centreline; hws = half widths at the control points (interpolated); caps 'flat' | 'round'
export function limb(ctrl, hws, { capA = 'flat', capB = 'flat', per = 14 } = {}) {
  const c = spline(ctrl, per)
  const n = c.length
  const hw = c.map((_, i) => {
    const f = (i / (n - 1)) * (hws.length - 1), k = Math.min(Math.floor(f), hws.length - 2)
    return hws[k] + (hws[k + 1] - hws[k]) * (f - k)
  })
  const L = [], R = []
  for (let i = 0; i < n; i++) {
    const t = norm(sub(c[Math.min(i + 1, n - 1)], c[Math.max(i - 1, 0)]))
    const nn = [t[1], -t[0]]
    L.push(add(c[i], mul(nn, hw[i]))); R.push(add(c[i], mul(nn, -hw[i])))
  }
  const cap = (p, q, dir, kind) => {
    if (kind === 'flat') return []
    const m = lerp(p, q, 0.5), half = mul(sub(p, q), 0.5), r = len(half)
    const pts = []
    for (let a = 1; a < 12; a++) { const th = (a / 12) * Math.PI; pts.push(add(m, add(mul(half, Math.cos(th)), mul(dir, r * Math.sin(th))))) }
    return pts
  }
  const tA = norm(sub(c[0], c[1])), tB = norm(sub(c[n - 1], c[n - 2]))
  const pts = [...L, ...cap(L[n - 1], R[n - 1], tB, capB), ...R.slice().reverse(), ...cap(R[0], L[0], tA, capA)]
  return { d: 'M' + pts.map(P).join('L') + 'Z', c, L, R, hw }
}
// strip along one side of a limb: from fraction f0..f1 of the half-width on the chosen side ('L'|'R'), optionally only t0..t1 of the length
export function strip(lb, side, f0, f1, t0 = 0, t1 = 1) {
  const n = lb.c.length
  const i0 = Math.round(t0 * (n - 1)), i1 = Math.round(t1 * (n - 1))
  const a = [], b = []
  for (let i = i0; i <= i1; i++) {
    const u = norm(side === 'L' ? sub(lb.L[i], lb.c[i]) : sub(lb.R[i], lb.c[i])), h = lb.hw[i]
    a.push(add(lb.c[i], mul(u, h * f0))); b.push(add(lb.c[i], mul(u, h * f1)))
  }
  return 'M' + [...a, ...b.reverse()].map(P).join('L') + 'Z'
}
// partial ink line along one side ('L'|'R') of a limb between fractions t0..t1 of its length
export function edgeLine(lb, side, t0 = 0, t1 = 1, inset = 0) {
  const pts = side === 'L' ? lb.L : lb.R
  const i0 = Math.round(t0 * (pts.length - 1)), i1 = Math.round(t1 * (pts.length - 1))
  const out = []
  for (let i = i0; i <= i1; i++) { const u = norm(sub(lb.c[i], pts[i])); out.push(add(pts[i], mul(u, inset))) }
  return 'M' + out.map(P).join('L')
}
// a band across a limb at fraction t (0..1) of its length, `thick` px along the axis
export function band(lb, t, thick, grow = 3) {
  const i = Math.round(t * (lb.c.length - 1))
  const j0 = Math.max(0, i - Math.round(thick / 2 / 4)), j1 = Math.min(lb.c.length - 1, i + Math.round(thick / 2 / 4))
  const pts = []
  for (let j = j0; j <= j1; j++) pts.push(add(lb.c[j], mul(sub(lb.L[j], lb.c[j]), 1 + grow / lb.hw[j])))
  for (let j = j1; j >= j0; j--) pts.push(add(lb.c[j], mul(sub(lb.R[j], lb.c[j]), 1 + grow / lb.hw[j])))
  return 'M' + pts.map(P).join('L') + 'Z'
}
// the edge line of a band across a limb: 'a' = the edge toward the start of the limb, 'b' = toward the end
export function bandEdge(lb, t, thick, grow = 3, which = 'a', trim = 0.16) {
  const i = Math.round(t * (lb.c.length - 1))
  const j = Math.max(0, Math.min(lb.c.length - 1, which === 'a' ? i - Math.round(thick / 2 / 4) : i + Math.round(thick / 2 / 4)))
  const a = add(lb.c[j], mul(sub(lb.L[j], lb.c[j]), 1 + grow / lb.hw[j])), b = add(lb.c[j], mul(sub(lb.R[j], lb.c[j]), 1 + grow / lb.hw[j]))
  return `M${P(lerp(a, b, trim))}L${P(lerp(a, b, 1 - trim))}`
}
const circ = (cx, cy, r) => `M${r1(cx - r)} ${r1(cy)}A${r} ${r} 0 1 0 ${r1(cx + r)} ${r1(cy)}A${r} ${r} 0 1 0 ${r1(cx - r)} ${r1(cy)}Z`
// crescent shading of a UNION of shapes: shapes minus the same shapes shifted up-left (light from the upper left)
let maskN = 0
export function crescent(paths, shift, color, W = 1000, H = 1200) {
  const id = `sh${++maskN}`
  const body = paths.map((d) => `<path d="${d}"/>`).join('')
  return `<mask id="${id}" maskUnits="userSpaceOnUse" x="-300" y="-100" width="${W + 300}" height="${H}"><rect x="-300" y="-100" width="${W + 300}" height="${H}" fill="white"/><g transform="translate(${shift[0]} ${shift[1]})" fill="black">${body}</g></mask><g mask="url(#${id})" fill="${color}">${body}</g>`
}

// hand symbol placed with its wrist at (wx,wy), fist pointing `ang` degrees clockwise from "up"; mirror for the left hand
const hand = (wx, wy, ang, mirror = false) => `<use href="#ona-hand-hold" width="96" height="120" clip-path="url(#hand-clip)" transform="translate(${wx} ${wy})${mirror ? ' scale(-1 1)' : ''} rotate(${ang}) translate(-48 -120)"/>`

// coconut half seen as a cup: dome behind (left), white flesh rim (ellipse) in front, dark hollow. Local frame: dome centre (0,0), faces +x.
function coconut(cx, cy, ang, mirror, k = 1) {
  const T = `translate(${cx} ${cy})${mirror ? ' scale(-1 1)' : ''} rotate(${ang}) scale(${k})`
  const flat = `<g transform="${T}">
    <path d="M10 -54C-32 -54 -58 -28 -58 0C-58 28 -32 54 10 54Z" fill="#C98A62"/>
    <ellipse cx="10" cy="0" rx="15" ry="54" fill="#F6F0DC"/>
    <ellipse cx="12.5" cy="0" rx="8.5" ry="44" fill="#101820"/>
    <path d="M10 -40C4 -22 4 22 10 40C14 28 15 -28 10 -40Z" fill="#C98A62"/>
  </g>`
  const ink = `<g transform="${T}" class="ink-fine">
    <path d="M-30 -48C-44 -40 -52 -26 -53 -14M-18 -52C-28 -50 -36 -46 -42 -40M-30 48C-44 40 -52 26 -53 14M-18 52C-28 50 -36 46 -42 40"/>
    <path d="M-52 -4C-48 -8 -44 -8 -40 -4"/>
    <circle cx="-34" cy="-14" r="3.6" fill="#101820"/><circle cx="-26" cy="-2" r="3.6" fill="#101820"/><circle cx="-37" cy="2" r="3.6" fill="#101820"/>
  </g>`
  return { flat, ink }
}

const UP = 'rotate(-5 300 540)' // upper body leans toward the text (viewer's left)
export function ona() {
  // ===== lower body =====
  const legS = limb([[380, 640], [388, 750], [400, 836]], [68, 68, 66])
  const thigh = limb([[244, 604], [176, 594], [112, 588]], [64, 59, 55], { capB: 'round' })
  const shin = limb([[112, 588], [136, 642], [160, 700]], [54, 52, 50])
  const hip = 'M156 516L444 516C456 580 458 640 448 700L164 700C146 640 146 580 156 516Z'
  const pantsShapes = [hip, legS.d, thigh.d, shin.d]
  const pantsFlat = pantsShapes.map((d) => `<path d="${d}" fill="#E8553E"/>`).join('')
  const pantsShade = crescent(pantsShapes, [-15, -13], '#C23F2B')
  const cuffS = `<path d="${band(legS, 0.94, 36, 3)}" fill="#C23F2B"/>`
  const cuffL = `<path d="${band(shin, 0.93, 36, 3)}" fill="#C23F2B"/>`

  const d1 = norm(sub(shin.c[shin.c.length - 1], shin.c[shin.c.length - 6])) // shin direction (down)
  const lean = (Math.atan2(d1[0], d1[1]) * 180) / Math.PI
  const A = shin.c[shin.c.length - 1]
  const sockL = `<g transform="translate(${r1(A[0])} ${r1(A[1])}) rotate(${r1(-lean)})"><use href="#ona-sock-celery" x="-40" y="-6" width="80" height="90"/></g>`
  const sockS = `<use href="#ona-sock-salmon" x="360" y="806" width="80" height="90"/>`
  const bootS = `<use href="#ona-boot" x="0" y="0" width="300" height="200" transform="translate(${402 - 145} 868) scale(.6667)"/>`
  const B = add(A, mul(d1, 56))
  const bootL = `<g transform="translate(${r1(B[0])} ${r1(B[1])}) rotate(-46) scale(.6667) translate(-218 -14)"><use href="#ona-boot" x="0" y="0" width="300" height="200"/></g>`
  const floorShadow = `<ellipse cx="274" cy="1002" rx="214" ry="16" fill="#101820"/>`

  // ===== upper body (leaning) =====
  const sweater = `<path d="M178 226C214 208 386 208 422 226C444 330 452 430 452 530L148 530C148 430 156 330 178 226Z" fill="#B58AD6"/><path d="M388 232C412 330 424 430 428 530L452 530C452 430 444 330 422 226Z" fill="#9B72BD"/>`
  const bib = `<path d="M248 372Q232 372 232 388L220 520L380 520L368 388Q368 372 352 372Z" fill="#E8553E"/><path d="M348 372Q368 372 368 388L380 520L350 520Z" fill="#C23F2B"/>`
  const straps = `<path d="M232 380L264 380L276 226L244 222Z" fill="#E8553E"/><path d="M336 380L368 380L356 226L324 226Z" fill="#E8553E"/>`
  const collar = `<path d="M226 190C250 214 350 214 374 190L388 218C352 246 248 246 212 218Z" fill="#9B72BD"/><path d="M226 190C250 206 350 206 374 190L378 200C350 220 250 220 222 200Z" fill="#B58AD6"/>`
  const buttons = `<circle cx="246" cy="392" r="10" fill="#F2C62F"/><circle cx="354" cy="392" r="10" fill="#F2C62F"/>`

  // ===== arms =====
  const upR = limb([[200, 246], [148, 330], [98, 410]], [38, 35, 31], { capB: 'round' })
  const foR = limb([[98, 410], [114, 408], [130, 403]], [31, 31, 30])
  const upL = limb([[400, 246], [452, 330], [502, 410]], [38, 35, 31], { capB: 'round' })
  const foL = limb([[502, 410], [486, 408], [470, 403]], [31, 31, 30])
  const skinR = limb([[128, 404], [148, 400], [172, 395]], [29, 25, 21]), skinL = limb([[472, 404], [452, 400], [428, 395]], [29, 25, 21])
  const sleeveShapes = [upR.d, foR.d, upL.d, foL.d]
  const sleeveFlat = sleeveShapes.map((d) => `<path d="${d}" fill="#B58AD6"/>`).join('')
  const sleeveShade = crescent(sleeveShapes, [-12, -15], '#9B72BD')
  const rollR = `<path d="${band(foR, 0.95, 28, 6)}" fill="#9B72BD"/>`, rollL = `<path d="${band(foL, 0.95, 28, 6)}" fill="#9B72BD"/>`
  const skinFlat = `<path d="${skinR.d}" fill="#E7AC84"/><path d="${skinL.d}" fill="#E7AC84"/>`
  const wR = [160, 398], wL = [440, 398]

  // coconuts + hands
  const cR = coconut(224, 392, 12, false, 1.1), cL = coconut(314, 392, 12, true, 1.1)
  const hands = hand(wR[0], wR[1], 76, false) + hand(wL[0], wL[1], 76, true)

  // head + cans
  const head = `<g transform="rotate(-6 300 150)"><use href="#ona-head-grin" x="188" y="-42" width="224" height="235"/></g><use href="#ona-cans-neck" x="184" y="170" width="232" height="122"/>`

  // ===== ink (details only, partial, never a full contour) =====
  const inkUpperUP = `<g class="ink-fine">
    <path d="M262 424L338 424L338 480L262 480Z" stroke-dasharray="26 10"/>
    <path d="M168 504C190 512 214 514 232 510M432 504C410 512 386 514 368 510"/>
    <path d="M206 300C200 342 200 380 206 414" opacity=".0"/>
  </g>`
  const inkLegs = `<g class="ink-fine">
    <path d="M436 560C442 650 448 740 446 796" stroke-dasharray="40 16"/>
    <path d="M334 716C334 744 338 772 342 796" stroke-dasharray="26 14"/>
    <path d="M238 548C196 548 150 546 110 548" stroke-dasharray="44 16"/>
    <path d="M60 570C70 578 72 594 66 606M78 556C88 564 90 578 86 590"/>
    <path d="M182 556C198 574 220 586 246 590"/>
    <path d="${bandEdge(legS, 0.94, 36, 3, 'a')}"/><path d="${bandEdge(shin, 0.93, 36, 3, 'a')}"/>
    <path d="M86 620C92 650 104 676 120 700" stroke-dasharray="30 14"/>
  </g>`
  const inkArms = `<g class="ink-fine">
    <path d="${bandEdge(foR, 0.97, 24, 4, 'a')}"/><path d="${bandEdge(foL, 0.97, 24, 4, 'a')}"/>
    <path d="M76 392C84 400 88 410 86 420M524 392C516 400 512 410 514 420"/>
  </g>`

  // lit-side ink contours (light from the upper left): one side of each big shape, in runs with gaps
  const cont = (d, dash) => `<path d="${d}" stroke-dasharray="${dash}"/>`
  const kneeArc = 'M112 530C84 528 56 548 52 578'
  const contourLegs = `<g class="ink" transform="translate(1.5 -1)">
    ${cont(edgeLine(legS, 'R', 0.12, 0.88), '120 26 70 22')}
    ${cont(edgeLine(thigh, 'R', 0.05, 0.98), '90 22 54 20 40 18')}
    ${cont(kneeArc, '60 30')}
    ${cont(edgeLine(shin, 'R', 0.08, 0.86), '70 20 40 18')}
  </g>`
  const contourUP = `<g class="ink" transform="translate(1.5 -1)">
    ${cont('M178 232C160 320 152 420 150 520', '150 30 80 26')}
    ${cont('M232 192C260 212 340 212 368 192', '60 40')}
  </g>`
  const contourArms = `<g class="ink" transform="translate(1.5 -1)">${cont(edgeLine(upR, 'R', 0.08, 0.92, 4), '70 20 50 18')}${cont(edgeLine(upL, 'L', 0.06, 0.5, 9), '70 24')}</g>`
  return {
    UP,
    lower: { floorShadow, pantsFlat, pantsShade, cuffS, cuffL, sockL, sockS, bootS, bootL },
    upper: { sweater, bib: bib + straps + collar + buttons, sleeves: skinFlat + sleeveFlat + sleeveShade + rollR + rollL },
    head,
    handsBlock: { coconutsFlat: cR.flat + cL.flat, coconutsInk: cR.ink + cL.ink, hands },
    ink: { inkUpperUP, inkLegs, inkArms, contourLegs, contourUP, contourArms },
    parts: { legS, thigh, shin, upR, foR, upL, foL },
  }
}
