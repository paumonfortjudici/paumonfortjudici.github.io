// Folder 07, Somia: an UNBOXING / PACKAGING folder. A teal linen-board folder open on a pale desk: crumpled tissue paper folded in, the real hang tag with
// its string, printed pages of somia.store, a bag photo with photo corners, pinked fabric swatches (woven red/blue wool, tweed, alpaca, pinstripe),
// a glassine sticker sheet with the four brand icons, a stamped thank-you card with a wax seal, a packing list, a kraft shipping label, a cream
// ribbon printed with the wordmark, and a die-cut pocket holding the cards. Elegant, serif, quiet luxury: teal and warm cream, a touch of wool red.
import { pub, sheet, pic, text, clip, tape, sticky, stamp, ring, SHADOW, kraft, H } from './lib.mjs'

const P = (f) => pub(`works/somia/${f}`)
const WEB = (f) => pub(`works/somia/web/${f}`)
const BR = (f) => pub(`works/somia/web/brand/${f}`)

const TEAL = '#0F9AA8'
const DEEP = '#0a6672'
const CREAM = '#f5eddc'
const INK = '#16262c'
const RED = '#c9302b'

const uri = (s) => `url(data:image/svg+xml,${encodeURIComponent(s).split('(').join('%28').split(')').join('%29').split("'").join('%27')})`
/** kraft fibres (the kit's own is not exported): image layer first, colour last */
const FIBRE = uri(
  `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500"><filter id="f" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9 .06" numOctaves="3" seed="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .22  0 0 0 0 .1  0 0 0 .55 -.14"/></filter><rect width="100%" height="100%" filter="url(#f)"/></svg>`,
)
const kraftBg = (base) => `${FIBRE},${base}`
const at = (o) => `left:${o.x}px;top:${o.y}px;${o.w !== undefined ? `width:${o.w}px;` : ''}${o.h !== undefined ? `height:${o.h}px;` : ''}transform:rotate(${o.rot ?? 0}deg);z-index:${o.z ?? 5};`

/** crumpled tissue paper: lit noise, multiplied over the paper colour */
const crumple = (seed = 3, f = '.006 .028', surf = 5) =>
  uri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640"><filter id="c" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${f}" numOctaves="2" seed="${seed}" stitchTiles="stitch"/><feDiffuseLighting lighting-color="#fff" surfaceScale="${surf}" diffuseConstant="1.1"><feDistantLight azimuth="225" elevation="50"/></feDiffuseLighting><feComponentTransfer><feFuncR type="linear" slope="1.3"/><feFuncG type="linear" slope="1.3"/><feFuncB type="linear" slope="1.3"/></feComponentTransfer></filter><rect width="100%" height="100%" filter="url(#c)"/></svg>`,
  )
/** wool fuzz speckle */
const WOOL = uri(
  `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><filter id="w" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".55 .4" numOctaves="3" seed="7" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.7 0 0 0 -.66"/></filter><rect width="100%" height="100%" filter="url(#w)"/></svg>`,
)
const LINEN = `repeating-linear-gradient(0deg,rgba(255,255,255,.05) 0 1px,transparent 1px 3px),repeating-linear-gradient(90deg,rgba(0,0,0,.06) 0 1px,transparent 1px 3px)`

/** SVG colour filters: the brand's grey 27% PNGs (ring, ribbon S) turned into solid inks */
const DEFS = `<svg width="0" height="0" style="position:absolute"><defs>
<filter id="inkTeal" color-interpolation-filters="sRGB"><feColorMatrix values="0 0 0 0 .04  0 0 0 0 .42  0 0 0 0 .47  0 0 0 4.2 0"/></filter>
<filter id="inkDark" color-interpolation-filters="sRGB"><feColorMatrix values="0 0 0 0 .07  0 0 0 0 .1  0 0 0 0 .12  0 0 0 4.2 0"/></filter>
<filter id="inkWax" color-interpolation-filters="sRGB"><feColorMatrix values="0 0 0 0 .42  0 0 0 0 .08  0 0 0 0 .09  0 0 0 4.2 0"/></filter>
<filter id="inkWhite" color-interpolation-filters="sRGB"><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 4.2 0"/></filter>
</defs></svg>`

/** a die-cut zigzag (pinking shears) polygon */
const zig = (w, h, s = 10, a = 5) => {
  const nx = Math.round(w / s)
  const ny = Math.round(h / s)
  const p = []
  for (let i = 0; i <= nx; i++) p.push(`${(i * w) / nx}px ${i % 2 ? a : 0}px`)
  for (let j = 1; j <= ny; j++) p.push(`${w - (j % 2 ? a : 0)}px ${(j * h) / ny}px`)
  for (let i = nx - 1; i >= 0; i--) p.push(`${(i * w) / nx}px ${h - (i % 2 ? a : 0)}px`)
  for (let j = ny - 1; j >= 1; j--) p.push(`${j % 2 ? a : 0}px ${(j * h) / ny}px`)
  return `polygon(${p.join(',')})`
}

const FABRIC = {
  // the red / blue woven wool of the signature bag
  plaid: `${WOOL},repeating-linear-gradient(45deg,rgba(0,0,0,.09) 0 2px,transparent 2px 4px),repeating-linear-gradient(90deg,rgba(30,52,176,.82) 0 46px,rgba(30,52,176,0) 46px 92px),repeating-linear-gradient(0deg,rgba(250,245,240,.55) 0 18px,rgba(250,245,240,0) 18px 74px),${RED}`,
  tweed: `${WOOL},repeating-linear-gradient(90deg,rgba(40,28,24,.55) 0 5px,transparent 5px 34px),repeating-linear-gradient(0deg,rgba(40,28,24,.5) 0 5px,transparent 5px 34px),repeating-linear-gradient(90deg,rgba(210,190,160,.35) 0 2px,transparent 2px 17px),#7d6656`,
  alpaca: `${WOOL},repeating-linear-gradient(72deg,rgba(255,255,255,.2) 0 4px,rgba(0,0,0,.14) 4px 9px),repeating-linear-gradient(90deg,#8a8a88 0 9px,#737372 9px 13px,#9a9a97 13px 20px)`,
  stripe: `repeating-linear-gradient(0deg,rgba(0,0,0,.05) 0 1px,transparent 1px 3px),repeating-linear-gradient(90deg,#8ba8e0 0 6px,#f3f4f8 6px 15px)`,
  cord: `repeating-linear-gradient(90deg,#cf948c 0 5px,#b27069 5px 8px,#d9a39b 8px 10px)`,
  linen: `${WOOL},repeating-linear-gradient(0deg,rgba(120,100,60,.16) 0 1px,transparent 1px 4px),repeating-linear-gradient(90deg,rgba(120,100,60,.14) 0 1px,transparent 1px 5px),#e8dec6`,
  teal: `${WOOL},repeating-linear-gradient(45deg,rgba(0,0,0,.1) 0 2px,transparent 2px 4px),repeating-linear-gradient(90deg,rgba(255,255,255,.14) 0 3px,transparent 3px 18px),${TEAL}`,
}

/** a pinked swatch of fabric (own shadow through a wrapper, since clip-path would cut it) */
const swatch = (o) => {
  const w = o.w
  const h = o.h
  const fringe = o.fringe
    ? `<div style="position:absolute;left:0;right:0;bottom:-16px;height:18px;background:${o.fringe};-webkit-mask-image:repeating-linear-gradient(90deg,#000 0 2px,transparent 2px 5px);mask-image:repeating-linear-gradient(90deg,#000 0 2px,transparent 2px 5px)"></div>`
    : ''
  return `<div class="a" style="${at(o)}filter:drop-shadow(0 1px 1px rgba(16,30,36,.3)) drop-shadow(0 4px 5px rgba(16,30,36,.25))"><div style="position:absolute;inset:0;background:${FABRIC[o.kind]};clip-path:${o.zig === false ? 'none' : zig(w, h)}"></div><div style="position:absolute;inset:9px;border:2px dashed rgba(255,255,255,.28);border-radius:2px"></div>${fringe}</div>`
}

const staple = (x, y, rot = 0, z = 30) =>
  `<div class="a" style="left:${x}px;top:${y}px;width:30px;height:7px;border-radius:2px;transform:rotate(${rot}deg);z-index:${z};background:linear-gradient(#e9eef1,#8d979e 55%,#d7dde1);box-shadow:0 2px 2px rgba(0,0,0,.4)"></div>`

/** a printed page of somia.store: matte paper, the capture, a header line */
const printout = (o) => {
  const b = 11
  const foot = 36
  const iw = o.w - 2 * b
  const ih = Math.round(iw / (o.ratio ?? 1.6))
  const h = ih + b + foot
  return sheet({
    x: o.x, y: o.y, w: o.w, h, rot: o.rot, z: o.z ?? 9, c: '#fcfaf4', shadow: SHADOW.lift, r: 2,
    inner: [
      `<img src="${o.src}" style="position:absolute;left:${b}px;top:${b}px;width:${iw}px;height:${ih}px;object-fit:cover;object-position:${o.pos ?? '50% 0%'};filter:saturate(.95) contrast(.99)">`,
      `<div class="a" style="left:${b}px;top:${b}px;width:${iw}px;height:${ih}px;background:linear-gradient(125deg,rgba(255,255,255,.16),rgba(255,255,255,0) 38%,rgba(0,0,0,.05));pointer-events:none"></div>`,
      text({ x: b + 2, y: h - 29, t: o.cap, font: 'DM Mono', weight: 500, size: 17, c: '#79786f', ls: '.04em' }),
      text({ x: o.w - 72, y: h - 29, t: o.pg ?? '1 / 8', font: 'DM Mono', weight: 500, size: 17, c: '#79786f' }),
    ].join(''),
  })
}

/** a region of a picture as a photo, with an optional white border */
const crop = (o) => {
  const b = o.border ?? 0
  const iw = o.w - 2 * b
  const s = iw / o.cw
  return `<div class="a" style="${at(o)}background:${o.bc ?? '#fbf8ee'};padding:${b}px;box-shadow:${o.shadow ?? SHADOW.lift};border-radius:${o.r ?? 2}px;overflow:hidden;${o.extra ?? ''}"><div style="position:relative;width:100%;height:100%;overflow:hidden;border-radius:${o.ir ?? 0}"><img src="${o.src}" style="position:absolute;max-width:none;width:${o.nw * s}px;left:${-o.cx * s}px;top:${-o.cy * s}px;${o.imgExtra ?? ''}" alt=""></div></div>`
}

/** black photo corners, glued */
const corner = (x, y, rot, z = 14, c = '#2a2420') =>
  `<div class="a" style="left:${x}px;top:${y}px;width:34px;height:34px;transform:rotate(${rot}deg);z-index:${z};background:${c};clip-path:polygon(0 0,100% 0,0 100%);filter:drop-shadow(1px 2px 1px rgba(0,0,0,.35))"></div>`

const tissue = (o) =>
  `<div class="a" style="${at(o)}background-color:${o.c};background-image:${o.gloss ?? ''}${o.gloss ? ',' : ''}${crumple(o.seed ?? 3, o.f ?? '.006 .028', o.surf ?? 5)};background-size:100% 100%;background-blend-mode:${o.gloss ? 'normal,multiply' : 'multiply'};box-shadow:${o.shadow ?? '0 1px 2px rgba(0,30,40,.22),0 12px 26px -8px rgba(0,30,40,.38)'};border-radius:${o.r ?? 3}px;opacity:${o.op ?? 0.97};${o.extra ?? ''}">${o.inner ?? ''}</div>`

/** a wax seal with the brand's ribbon S pressed in */
const wax = (x, y, d, z = 40, rot = 0) =>
  `<div class="a" style="left:${x}px;top:${y}px;width:${d}px;height:${d}px;z-index:${z};transform:rotate(${rot}deg);filter:drop-shadow(0 3px 3px rgba(40,10,10,.5))"><div style="position:absolute;inset:0;border-radius:46% 54% 51% 49% / 52% 47% 53% 48%;background:radial-gradient(circle at 34% 28%,#de5a52 0,#b5322d 40%,#7b1c1c 100%)"></div><div style="position:absolute;inset:12%;border-radius:50%;background:radial-gradient(circle at 60% 70%,rgba(255,255,255,.07),rgba(0,0,0,.14));box-shadow:inset 2px 3px 5px rgba(60,5,5,.55),inset -2px -2px 3px rgba(255,170,160,.35)"></div><img src="${BR('sello-somia.png')}" style="position:absolute;left:27%;top:19%;width:46%;filter:url(#inkWax) drop-shadow(1px 1px 0 rgba(255,175,165,.5))"></div>`

/** a hang tag with a punched, eyelet hole and a twisted twine loop */
const hangTag = (o) => {
  const { w, h } = o
  const hy = Math.round(h * 0.1)
  const hole = `<div class="a" style="left:${w / 2 - 15}px;top:${hy - 15}px;width:30px;height:30px;border-radius:50%;background:radial-gradient(circle,#26292c 0 34%,#f4ecd4 36% 60%,#d6c9a6 63%)"></div>`
  const twine = `<svg class="a" style="left:${w / 2 - 70}px;top:${hy - 150}px;width:140px;height:160px;overflow:visible" viewBox="0 0 140 160"><path d="M70 150 C 22 132, 14 50, 56 18 C 84 -2, 118 26, 92 62 C 80 82, 72 112, 70 150" fill="none" stroke="${o.twine ?? '#efe4c8'}" stroke-width="6" stroke-linecap="round"/><path d="M70 150 C 22 132, 14 50, 56 18 C 84 -2, 118 26, 92 62 C 80 82, 72 112, 70 150" fill="none" stroke="rgba(110,85,40,.45)" stroke-width="6" stroke-dasharray="2 5" stroke-linecap="round"/></svg>`
  return `<div class="a" style="${at(o)}filter:drop-shadow(0 2px 2px rgba(16,30,36,.3)) drop-shadow(0 8px 8px rgba(16,30,36,.28))"><div style="position:absolute;inset:0;background:${o.c};clip-path:polygon(24% 0,76% 0,100% 15%,100% 100%,0 100%,0 15%)"></div>${o.inner ?? ''}${twine}${hole}</div>`
}

const barcode = (x, y, w, h, rot = 0, z = 12) =>
  `<div class="a" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;transform:rotate(${rot}deg);z-index:${z};background:repeating-linear-gradient(90deg,#111 0 3px,transparent 3px 5px,#111 5px 6px,transparent 6px 10px,#111 10px 14px,transparent 14px 15px,#111 15px 16px,transparent 16px 20px,#111 20px 22px,transparent 22px 26px)"></div>`

/** a cream satin bow with two tails */
const bow = (x, y, w, rot, z = 44) =>
  `<svg class="a" style="left:${x}px;top:${y}px;width:${w}px;height:${(w * 170) / 260}px;transform:rotate(${rot}deg);z-index:${z};overflow:visible;filter:drop-shadow(0 3px 3px rgba(16,30,36,.35)) drop-shadow(0 12px 10px rgba(16,30,36,.22))" viewBox="0 0 260 170"><defs><linearGradient id="sat" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbf5e8"/><stop offset=".5" stop-color="#efe3c9"/><stop offset="1" stop-color="#dccdac"/></linearGradient></defs><g fill="url(#sat)" stroke="rgba(120,95,50,.4)" stroke-width="1.6" stroke-linejoin="round"><path d="M122 84 L66 162 L90 152 L104 168 L140 92 Z"/><path d="M138 84 L194 162 L170 152 L156 168 L120 92 Z"/><path d="M130 80 C 96 18, 22 4, 12 52 C 4 98, 82 114, 130 84 Z"/><path d="M130 80 C 164 18, 238 4, 248 52 C 256 98, 178 114, 130 84 Z"/></g><g fill="none" stroke="rgba(120,95,50,.3)" stroke-width="1.4" stroke-linecap="round"><path d="M118 74 C 90 34, 50 24, 30 48"/><path d="M142 74 C 170 34, 210 24, 230 48"/></g><rect x="108" y="64" width="44" height="34" rx="9" fill="url(#sat)" stroke="rgba(120,95,50,.45)" stroke-width="1.6"/></svg>`

/** sticker sheet: glassine backing with die-cut stickers of the four value icons */
const stickerSheet = (o) => {
  const specs = [
    ['icon-sostenibilidad.png', `radial-gradient(circle at 30% 24%,rgba(255,255,255,.38),transparent 52%),${TEAL}`, true],
    ['icon-calidad.png', `radial-gradient(circle at 30% 24%,rgba(255,255,255,.7),transparent 52%),#f6efdd`, false],
    ['icon-proximidad.png', kraftBg('#caa36a'), false],
    ['icon-solidaridad.png', '', false],
  ]
  const d = 108
  const cell = (i) => {
    const x = 24 + (i % 2) * 132
    const y = 28 + Math.floor(i / 2) * 132
    if (i === 3) return `<div class="a" style="left:${x}px;top:${y}px;width:${d}px;height:${d}px;border-radius:50%;border:2px dashed rgba(70,95,100,.4);box-shadow:inset 0 2px 5px rgba(60,80,90,.25);background:rgba(120,150,150,.12)"></div>`
    const [f, bg, inv] = specs[i]
    return `<div class="a" style="left:${x}px;top:${y}px;width:${d}px;height:${d}px;border-radius:50%;background:${bg};box-shadow:0 0 0 5px rgba(255,255,255,.92),0 3px 5px rgba(20,40,45,.35);transform:rotate(${[-3, 4, 2, 0][i]}deg)"><img src="${BR(f)}" style="position:absolute;left:12%;top:12%;width:76%;height:76%;object-fit:contain;${inv ? 'filter:invert(1);' : ''}"></div>`
  }
  return tissue({ x: o.x, y: o.y, w: 288, h: 288, rot: o.rot, z: o.z, c: '#e9f0ee', seed: 9, f: '.03 .05', surf: 1.6, op: 0.98, r: 3, inner: [0, 1, 2, 3].map(cell).join('') })
}

export default function () {
  const body = [DEFS]
  const add = (...s) => body.push(...s)

  // ---------- the folder: two linen-board panels with a crease, on a pale desk ----------
  add(
    `<div class="a" style="left:28px;top:14px;width:514px;height:${H + 40}px;z-index:1;border-radius:10px 2px 2px 10px;background:${LINEN},linear-gradient(90deg,#0a6371,#0c8391 42%,#0b7886);box-shadow:-3px 5px 16px rgba(50,35,10,.45),inset 0 0 0 3px rgba(255,255,255,.07),inset 22px 0 34px -14px rgba(0,0,0,.28)"></div>`,
    `<div class="a" style="left:538px;top:14px;width:514px;height:${H + 40}px;z-index:1;border-radius:2px 10px 10px 2px;background:${LINEN},linear-gradient(270deg,#0a6371,#0c8391 42%,#0b7886);box-shadow:3px 5px 16px rgba(50,35,10,.45),inset 0 0 0 3px rgba(255,255,255,.07),inset -22px 0 34px -14px rgba(0,0,0,.28)"></div>`,
    `<div class="a" style="left:488px;top:14px;width:104px;height:${H + 40}px;z-index:2;background:linear-gradient(90deg,transparent,rgba(0,0,0,.34) 44%,rgba(255,255,255,.16) 53%,transparent)"></div>`,
  )

  // ---------- tissue paper, folded in: blush on the left, ivory on the right ----------
  add(
    tissue({ x: 44, y: 70, w: 480, h: 900, rot: -2, z: 4, c: '#f2d9d1', seed: 4 }),
    tissue({ x: 556, y: 40, w: 484, h: 940, rot: 1.6, z: 4, c: '#f6efdf', seed: 11 }),
    // a folded-over flap of tissue and a second layer, to show the layers
    tissue({ x: 520, y: 560, w: 520, h: 520, rot: -3, z: 5, c: '#efe4cf', seed: 21, f: '.03 .006', surf: 5, op: 0.93 }),
    tissue({ x: 30, y: 700, w: 470, h: 420, rot: 4, z: 5, c: '#e9c9c2', seed: 31, f: '.005 .03', surf: 5, op: 0.94 }),
  )

  // ---------- TOP: fabric sample card, sticker sheet, catalog sketch ----------
  const sw = (i, kind, label) => {
    const x = 20 + (i % 2) * 160
    const y = 52 + Math.floor(i / 2) * 112
    return (
      swatch({ x, y, w: 138, h: 82, kind, rot: [-1.5, 1.2, 1.6, -1.2][i], z: 3 }) +
      staple(x + 52, y + 10, 4, 6) +
      text({ x: x + 6, y: y + 80, t: label, font: 'Reenie Beanie', size: 30, c: '#27373d', z: 4 })
    )
  }
  add(
    stickerSheet({ x: 36, y: 22, rot: -3, z: 8 }),
    sheet({
      x: 322, y: 26, w: 346, h: 300, rot: 2.5, z: 9, c: '#f7f1e2', shadow: SHADOW.lift,
      inner: [
        text({ x: 22, y: 12, t: 'FABRIC SAMPLES', font: 'Cormorant', weight: 700, size: 27, ls: '.12em', c: INK }),
        sw(0, 'plaid', 'wool'), sw(1, 'alpaca', 'alpaca'), sw(2, 'stripe', 'cotton'), sw(3, 'tweed', 'tweed'),
      ].join(''),
    }),
    clip({ x: 340, y: 2, h: 120, rot: -8, z: 22, c: '#b8955a' }),
    printout({ src: WEB('collection-vincles-desktop-hero@2x.webp'), x: 640, y: 56, w: 404, rot: 3.6, z: 10, cap: 'somia.store / vincles', pg: '3 / 8', pos: '50% 0%' }),
    tape({ x: 880, y: 62, w: 150, rot: -4, c: 'rgba(15,154,168,.62)', z: 28 }),
    pic({ src: P('catalog-sketch.webp'), x: 120, y: 318, w: 420, h: 122, rot: -2, z: 8, border: 8, bc: '#f8f1df', pos: '50% 50%', shadow: SHADOW.lift }),
  )

  // ---------- BAND (y 430-920), left: the home page printed out ----------
  add(
    printout({ src: WEB('home-desktop-hero@2x.webp'), x: 30, y: 452, w: 484, rot: -4.5, z: 9, cap: 'somia.store', pg: '1 / 8', pos: '50% 0%' }),
    tape({ x: 118, y: 462, w: 140, rot: -34, c: 'rgba(245,238,214,.82)', z: 30 }),
    clip({ x: 470, y: 440, h: 110, rot: 14, z: 24, c: '#a9b2ba' }),
  )

  // ---------- BAND, centre: the real hang tag (wordmark + ribbon S) ----------
  const tagW = 286
  const tagH = Math.round(tagW / 0.644)
  add(
    `<div class="a" style="left:420px;top:462px;width:${tagW}px;height:${tagH}px;transform:rotate(7deg);z-index:20;filter:drop-shadow(0 2px 2px rgba(16,30,36,.3)) drop-shadow(0 12px 12px rgba(16,30,36,.35))"><img src="${P('peek.webp')}" style="width:100%;height:100%;display:block"></div>`,
  )

  // ---------- BAND, right: bag photo; below it the round fabric photo and the wool swatch ----------
  add(
    crop({ src: P('thumb.webp'), nw: 720, cx: 84, cy: 186, cw: 560, x: 706, y: 446, w: 322, h: 398, rot: 4.5, z: 11, border: 11 }),
    corner(718, 458, 0, 14),
    corner(992, 458, 90, 14),
    corner(718, 810, 270, 14),
    corner(992, 810, 180, 14),
    swatch({ x: 776, y: 856, w: 254, h: 170, kind: 'plaid', rot: -5, z: 13, fringe: 'repeating-linear-gradient(90deg,#c9302b 0 2px,#2a40b5 2px 4px)' }),
    swatch({ x: 906, y: 830, w: 118, h: 92, kind: 'teal', rot: 9, z: 12 }),
    crop({ src: WEB('materials-desktop-02.webp'), nw: 1440, cx: 193, cy: 248, cw: 480, x: 666, y: 850, w: 176, h: 176, rot: -6, z: 15, border: 9, r: 999, ir: '50%', bc: '#fbf8ee' }),
    tape({ x: 700, y: 870, w: 96, rot: -42, c: 'rgba(15,154,168,.6)', z: 30 }),
    staple(900, 880, -5, 31),
    staple(930, 996, -5, 31),
  )
  // a kraft hang tag peeking from under the real one
  add(
    hangTag({
      x: 596, y: 330, w: 124, h: 196, rot: -20, z: 12, c: kraftBg('#c9a46c'), twine: '#f1e8cf',
      inner: `<img src="${BR('logo-somia-dark.png')}" style="position:absolute;left:14px;top:82px;width:96px;mix-blend-mode:multiply;opacity:.85">`,
    }),
  )

  // ---------- BOTTOM: pocket with the cards tucked in, ribbon, label, tag ----------
  // thank-you card (stamped ring + S, wax seal) and packing list stand up out of the pocket
  const card = sheet({
    x: 84, y: 800, w: 322, h: 420, rot: -5, z: 13, c: '#f8f2e4', shadow: SHADOW.lift, r: 3,
    inner: [
      `<div class="a" style="inset:10px;border:1.5px solid rgba(15,120,130,.35);border-radius:2px"></div>`,
      text({ x: 0, y: 24, w: 322, t: 'thank you', font: 'Cormorant', weight: 500, size: 66, c: DEEP, extra: 'text-align:center;font-style:italic' }),
      `<img src="${BR('letra-somia.png')}" class="a" style="left:60px;top:112px;width:200px;height:200px;filter:url(#inkTeal);opacity:.9">`,
      `<img src="${BR('sello-somia.png')}" class="a" style="left:121px;top:162px;width:78px;filter:url(#inkTeal);opacity:.9">`,
    ].join(''),
  })
  const list = sheet({
    x: 396, y: 916, w: 262, h: 216, rot: 5, z: 12, c: '#fdfbf6', shadow: SHADOW.lift, r: 2, extra: 'overflow:hidden;',
    inner: [
      text({ x: 18, y: 18, t: 'PACKING LIST', font: 'Cormorant', weight: 700, size: 28, ls: '.12em', c: INK }),
      `<div class="a" style="left:18px;top:56px;width:226px;height:2px;background:${INK}"></div>`,
      text({ x: 18, y: 70, t: 'order SM-20841', font: 'Courier Prime', size: 20, c: '#555' }),
      ...['hang tag', 'care card', 'thank-you card', 'tissue + ribbon'].map((t, i) =>
        `<div class="a" style="left:20px;top:${116 + i * 46}px;width:22px;height:22px;border:2px solid #555"></div>` +
        `<svg class="a" style="left:18px;top:${106 + i * 46}px;width:34px;height:34px" viewBox="0 0 34 34"><path d="M5 18 L14 28 L31 4" fill="none" stroke="${RED}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>` +
        text({ x: 56, y: 114 + i * 46, t, font: 'Courier Prime', size: 22, c: '#222' }),
      ),
    ].join(''),
  })
  add(card, list)

  // the die-cut pocket (left panel)
  add(
    `<div class="a" style="left:28px;top:1132px;width:514px;height:260px;z-index:16;filter:drop-shadow(0 -3px 4px rgba(0,25,35,.3)) drop-shadow(0 -10px 14px rgba(0,25,35,.22))"><div style="position:absolute;inset:0;border-radius:12px 2px 0 10px;background:${LINEN},linear-gradient(180deg,#0e8d9b,#0b7683);-webkit-mask-image:radial-gradient(circle 72px at 50% 0,transparent 70px,#000 72px);mask-image:radial-gradient(circle 72px at 50% 0,transparent 70px,#000 72px)"></div><div style="position:absolute;left:18px;right:18px;top:40px;bottom:18px;border:3px dashed rgba(255,255,255,.34);border-radius:8px"></div><img src="${BR('logo-somia-white.png')}" style="position:absolute;left:78px;top:112px;width:230px;opacity:.4;filter:drop-shadow(0 -1.5px 0 rgba(0,40,50,.55)) drop-shadow(0 1.5px 0 rgba(255,255,255,.25))"></div>`,
  )

  // ribbon printed with the wordmark, tied around the whole thing with a bow
  const ribbonLogos = Array.from({ length: 9 }, () => `<img src="${BR('logo-somia-dark.png')}" style="height:30px;flex:none;margin-right:92px">`).join('')
  add(
    `<div class="a" style="left:-30px;top:1070px;width:1140px;height:72px;transform:rotate(-1.4deg);z-index:18;background:linear-gradient(180deg,#e6d8ba 0,#faf4e6 22%,#f7f0df 50%,#e8dcc0 100%);box-shadow:0 2px 3px rgba(16,30,36,.35),0 10px 14px -4px rgba(16,30,36,.32)"><div style="position:absolute;inset:0;display:flex;align-items:center;padding-left:40px;opacity:.8">${ribbonLogos}</div><div style="position:absolute;left:0;right:0;top:5px;height:2px;background:rgba(120,95,50,.25)"></div><div style="position:absolute;left:0;right:0;bottom:5px;height:2px;background:rgba(120,95,50,.25)"></div></div>`,
    bow(790, 996, 270, -5, 44),
  )

  // kraft shipping label with an invented order number, a barcode, a stamp
  add(
    `<div class="a" style="left:640px;top:1170px;width:400px;height:172px;transform:rotate(-2.5deg);z-index:17;background:${kraftBg('#c8a068')};border-radius:3px;box-shadow:${SHADOW.lift}">
      <img src="${BR('logo-somia-dark.png')}" style="position:absolute;left:24px;top:22px;width:166px;mix-blend-mode:multiply;opacity:.85">
      <div class="a" style="left:212px;top:18px;font:700 21px/1.2 'Courier Prime';color:#3a2a18;letter-spacing:.02em;white-space:nowrap">ORDER SM-20841<br><span style="font-weight:400;font-size:18px">1 OF 1 · TEXTILE</span></div>
      <div class="a" style="left:24px;top:74px;width:352px;height:3px;background:#3a2a18"></div>
      <div class="a" style="left:24px;top:88px;font:700 17px/1 'Courier Prime';color:#6b4a24">SHIP TO</div>
      <div class="a" style="left:104px;top:90px;width:210px;height:8px;border-radius:4px;background:rgba(58,42,24,.22)"></div>
      ${barcode(24, 118, 190, 36, 0, 3)}
    </div>`,
    stamp({ x: 856, y: 1262, t: 'FRAGILE', size: 38, c: RED, rot: -9, z: 36, font: 'Courier Prime' }),
    tape({ x: 668, y: 1186, w: 110, rot: -38, c: 'rgba(245,238,214,.82)', z: 38 }),
  )

  // teal hang tag on twine, a ring from a tea cup
  add(
    hangTag({
      x: 556, y: 1210, w: 112, h: 176, rot: -14, z: 15, c: TEAL, twine: '#efe4c8',
      inner: `<img src="${BR('logo-somia-white.png')}" style="position:absolute;left:12px;top:78px;width:88px">`,
    }),
    ring({ x: 936, y: 950, d: 190, rot: 12, z: 17 }),
  )

  // sticky note, brass clip, wax seal
  add(
    sticky({ x: 372, y: 1196, s: 148, rot: 6, c: '#bfe3e2', t: 'tissue,<br>tag, card,<br>ribbon!', size: 30, z: 26 }),
    clip({ x: 508, y: 1030, h: 110, rot: -8, z: 24, c: '#b8955a' }),
    wax(300, 930, 100, 40, -8),
  )

  return { bg: `radial-gradient(ellipse at 28% 18%,#eae1cf,#cabaa0 72%)`, body: body.join('') }
}
