// Folder 06, Procreate Sketchbook: an art student's portfolio sleeve. Dusty-pink board inside, a black elastic strap, a frosted
// plastic pocket at the bottom; loose sketch paper with the real prints, a torn spiral page, tracing paper with a pencil
// line trace over the orange portrait, paint-chip swatches, a die-cut crest sticker, a ruler, pencil, charcoal, eraser crumbs.
import { pub, sheet, text, tape, stamp, ring, pen } from './lib.mjs'

const P = (n) => pub(`works/procreate/${n}`)
const CAP = P('portrait-cap.webp')
const ORA = P('portrait-orange-1.webp')
const LOGO = P('vertice-design-logo.webp')
const CREST = P('yakisoba-fc-crest.webp')
const SKETCH = P('catalog-sketch.webp')

let seed = 11
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647

const INK = '#3f3d48' // graphite
const PINK = '#FF8FC1'
const SH = {
  flat: '0 1px 1px rgba(70,15,45,.28), 0 4px 9px -2px rgba(70,15,45,.32)',
  lift: '0 2px 3px rgba(70,15,45,.28), 0 16px 26px -6px rgba(70,15,45,.42)',
}
const DS = (a = 1) => `drop-shadow(0 1px 1px rgba(70,15,45,${0.3 * a})) drop-shadow(0 10px 12px rgba(70,15,45,${0.32 * a}))`

const box = (o) => `<div class="a" style="left:${o.x}px;top:${o.y}px;${o.w !== undefined ? `width:${o.w}px;` : ''}${o.h !== undefined ? `height:${o.h}px;` : ''}transform:rotate(${o.rot ?? 0}deg);z-index:${o.z ?? 5};${o.css ?? ''}">${o.inner ?? ''}</div>`
const note = (o) => text({ font: 'Gochi Hand', c: INK, extra: 'opacity:.9;text-shadow:0 0 .7px rgba(40,40,50,.8);', ...o })
const pencilNote = (o) => text({ font: 'Reenie Beanie', c: INK, extra: 'opacity:.92;text-shadow:0 0 .6px rgba(40,40,50,.9);', ...o })

// washi tape with a pattern
const WASHI = {
  dots: `radial-gradient(circle,#fff 0 4.5px,transparent 5.5px) 0 0/20px 20px,${PINK}`,
  stripes: 'repeating-linear-gradient(45deg,#fff 0 6px,#8b4ac0 6px 12px)',
  graph: 'repeating-linear-gradient(90deg,rgba(255,255,255,.75) 0 2px,transparent 2px 12px),#4a4a55',
  yolk: 'repeating-linear-gradient(0deg,rgba(255,255,255,.5) 0 2px,transparent 2px 9px),#ffd800',
}
const washi = ({ x, y, w = 150, h = 44, rot = -6, kind = 'dots', z = 30 }) =>
  `<div class="a" style="left:${x - w / 2}px;top:${y - h / 2}px;width:${w}px;height:${h}px;transform:rotate(${rot}deg);background:${WASHI[kind]};opacity:.9;z-index:${z};clip-path:polygon(0 6%,3% 0,6% 8%,9% 0,100% 0,97% 14%,100% 28%,97% 42%,100% 56%,97% 70%,100% 84%,97% 100%,9% 100%,6% 92%,3% 100%,0 94%,2% 78%,0 64%,2% 50%,0 36%,2% 22%)"></div>`

const starPts = (cx, cy, R, r) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const rr = i % 2 ? r : R
    return `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`
  }).join(' ')

// ---- pieces ------------------------------------------------------------------------------------------------------------

const defs = `<svg class="a" width="0" height="0" style="left:0;top:0"><defs>
<filter id="trace" x="-2%" y="-2%" width="104%" height="104%" color-interpolation-filters="sRGB">
  <feFlood flood-color="#ffffff" result="wh"/>
  <feComposite in="SourceGraphic" in2="wh" operator="over" result="flat"/>
  <feColorMatrix in="flat" type="matrix" values=".3 .6 .1 0 0  .3 .6 .1 0 0  .3 .6 .1 0 0  0 0 0 1 0" result="g"/>
  <feConvolveMatrix in="g" order="3" kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" divisor="1" bias="0" edgeMode="duplicate" preserveAlpha="true" result="e1"/>
  <feConvolveMatrix in="g" order="3" kernelMatrix="1 1 1 1 -8 1 1 1 1" divisor="1" bias="0" edgeMode="duplicate" preserveAlpha="true" result="e2"/>
  <feComposite in="e1" in2="e2" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="e"/>
  <feColorMatrix in="e" type="matrix" values="0 0 0 0 .22  0 0 0 0 .22  0 0 0 0 .27  7 0 0 0 -.12" result="ln"/>
  <feMorphology in="ln" operator="dilate" radius="0.35" result="ln2"/>
  <feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="2" seed="3" result="nz"/>
  <feColorMatrix in="nz" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 2.8 -.5" result="nz2"/>
  <feComposite in="ln2" in2="nz2" operator="in" result="rough"/>
  <feDisplacementMap in="rough" in2="nz" scale="2.4" xChannelSelector="R" yChannelSelector="G"/>
</filter>
<filter id="wob" x="-5%" y="-5%" width="110%" height="110%">
  <feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="2" seed="8" result="t"/>
  <feDisplacementMap in="SourceGraphic" in2="t" scale="7" xChannelSelector="R" yChannelSelector="G"/>
</filter>
</defs></svg>`

// pencil construction doodles on grid paper (top left)
const gridSheet = box({
  x: -70, y: -50, w: 590, h: 440, rot: -3, z: 3,
  css: `background-color:#fbf9ee;background-image:repeating-linear-gradient(0deg,rgba(80,130,200,.3) 0 1.5px,transparent 1.5px 30px),repeating-linear-gradient(90deg,rgba(80,130,200,.3) 0 1.5px,transparent 1.5px 30px);box-shadow:${SH.flat};border-radius:2px`,
  inner: `<svg class="a" style="left:0;top:0;filter:url(#wob);opacity:.78" width="590" height="400" viewBox="0 0 590 400" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="190" cy="190" r="100"/><path d="M190 60 V330" stroke-width="1.8"/><path d="M80 186 C140 214 240 214 300 186" stroke-width="1.8"/>
    <path d="M104 250 C130 340 250 340 276 250"/><ellipse cx="146" cy="190" rx="19" ry="9"/><ellipse cx="234" cy="190" rx="19" ry="9"/><path d="M168 246 C182 258 198 258 212 246"/>
    <circle cx="430" cy="150" r="62"/><path d="M392 120 l40 -40 M382 140 l56 -56 M376 160 l70 -70 M382 182 l74 -74 M398 198 l62 -62 M420 206 l40 -40" stroke-width="1.5"/>
    <path d="M380 290 L470 262 L548 296 L458 330 Z M380 290 V360 L458 394 V330 M458 394 L548 360 V296" stroke-width="2"/>
    <path d="M60 330 C90 300 120 360 150 330" stroke-width="1.6"/><path d="M300 330 l18 -26 l18 26 l-18 8 z" stroke-width="1.6"/>
  </svg>`,
})

// sticker sheet (top right)
const heartP = (a) => `<path ${a} d="M0 34 C-60 -6 -34 -52 0 -22 C34 -52 60 -6 0 34Z"/>`
const boltP = (a) => `<polygon ${a} points="8,-52 -30,8 -6,8 -16,52 30,-14 4,-14"/>`
const stickerSvg = (() => {
  const wh = 'fill="#fff" stroke="#fff" stroke-width="16" stroke-linejoin="round"'
  const slot = 'fill="#e3dbe9" stroke="#d3c9dc" stroke-width="2"'
  const g = (inner) => `<g style="filter:drop-shadow(0 2px 2.5px rgba(50,10,40,.4))">${inner}</g>`
  const heart = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">${g(heartP(wh) + heartP(`fill="${c}"`))}</g>`
  const star = (x, y, c) => g(`<polygon ${wh} points="${starPts(x, y, 62, 28)}"/><polygon fill="${c}" points="${starPts(x, y, 62, 28)}"/>`)
  const smiley = (x, y) => g(`<circle cx="${x}" cy="${y}" r="56" ${wh}/><circle cx="${x}" cy="${y}" r="56" fill="#8b4ac0"/><circle cx="${x - 18}" cy="${y - 12}" r="9" fill="#fff"/><circle cx="${x + 18}" cy="${y - 12}" r="9" fill="#fff"/><circle cx="${x - 16}" cy="${y - 11}" r="4" fill="#2a1346"/><circle cx="${x + 20}" cy="${y - 11}" r="4" fill="#2a1346"/><path d="M${x - 24} ${y + 14} C${x - 8} ${y + 36} ${x + 8} ${y + 36} ${x + 24} ${y + 14}" fill="none" stroke="#ffd800" stroke-width="6" stroke-linecap="round"/>`)
  const bolt = (x, y) => `<g transform="translate(${x} ${y})">${g(boltP(wh) + boltP('fill="#f8a635"'))}</g>`
  const flower = (x, y) => g(`<g transform="translate(${x} ${y})">${Array.from({ length: 6 }, (_, i) => `<circle cx="${Math.cos((i * Math.PI) / 3) * 34}" cy="${Math.sin((i * Math.PI) / 3) * 34}" r="26" ${wh}/>`).join('')}${Array.from({ length: 6 }, (_, i) => `<circle cx="${Math.cos((i * Math.PI) / 3) * 34}" cy="${Math.sin((i * Math.PI) / 3) * 34}" r="26" fill="${PINK}"/>`).join('')}<circle r="22" fill="#ffd800"/></g>`)
  return `<svg class="a" style="left:0;top:0" width="470" height="400" viewBox="0 0 470 400">
    ${heart(100, 116, 1.5, PINK)}${star(250, 112, '#ffd800')}${smiley(380, 118)}
    ${bolt(100, 290)}<polygon ${slot} points="${starPts(250, 290, 62, 28)}"/>${flower(380, 290)}
  </svg>`
})()
const stickerSheet = box({
  x: 650, y: -90, w: 470, h: 400, rot: 8, z: 3,
  css: `background:linear-gradient(135deg,#f6f1f8,#e9e2ee);box-shadow:${SH.flat};border-radius:4px`,
  inner: stickerSvg,
})

// ruler (wooden, cm marks)
const ruler = (() => {
  const nums = Array.from({ length: 12 }, (_, i) => text({ x: i * 56 + 6, y: 34, t: String(i), font: 'DM Mono', size: 20, c: '#3a2a10', z: 3 })).join('')
  return box({
    x: 10, y: 96, w: 720, h: 74, rot: -5, z: 12,
    css: `background:linear-gradient(90deg,#3a2a10 1.6px,transparent 1.6px) left top/56px 34px repeat-x,linear-gradient(90deg,#3a2a10 1.4px,transparent 1.4px) left top/28px 22px repeat-x,linear-gradient(90deg,#3a2a10 1px,transparent 1px) left top/5.6px 12px repeat-x,linear-gradient(#f1dba6,#e5c883);border-radius:3px;box-shadow:inset 0 0 0 1px rgba(90,60,10,.25),${SH.lift}`,
    inner: nums + `<div class="a" style="left:676px;top:22px;width:28px;height:28px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#e57da9,#c85f8b 70%);box-shadow:inset 0 2px 3px rgba(70,15,45,.5)"></div>`,
  })
})()

// graphite pencil
const pencil = (o) =>
  box({
    x: o.x, y: o.y, w: 520, h: 44, rot: o.rot, z: o.z ?? 20,
    css: 'filter:drop-shadow(2px 7px 4px rgba(70,15,45,.42))',
    inner: `<svg width="520" height="44" viewBox="0 0 520 44">
      <polygon points="0,22 64,4 64,40" fill="#ecc790"/><polygon points="0,22 22,15.5 22,28.5" fill="#2b2b33"/>
      <path d="M22 15.5 L64 4 L64 12 Z" fill="rgba(255,255,255,.3)"/>
      <rect x="64" y="4" width="366" height="36" fill="#3a3a44"/><rect x="64" y="4" width="366" height="10" fill="#51515d"/><rect x="64" y="30" width="366" height="10" fill="#25252c"/>
      <rect x="64" y="17" width="366" height="3" fill="rgba(255,255,255,.16)"/>
      <rect x="126" y="4" width="20" height="36" fill="${PINK}"/><rect x="152" y="4" width="6" height="36" fill="${PINK}"/>
      <text x="196" y="29" font-family="Courier Prime" font-weight="700" font-size="19" fill="${PINK}">HB  ·  2</text>
      <rect x="430" y="2" width="46" height="40" fill="#c9ccd2"/><path d="M438 2 V42 M446 2 V42 M454 2 V42 M462 2 V42" stroke="rgba(60,60,70,.35)" stroke-width="2"/><rect x="430" y="2" width="46" height="9" fill="rgba(255,255,255,.45)"/>
      <rect x="476" y="6" width="42" height="32" rx="9" fill="#ff7db3"/><rect x="476" y="6" width="42" height="9" rx="4" fill="rgba(255,255,255,.35)"/>
    </svg>`,
  })

// charcoal stub with its paper wrapper
const charcoal = (o) =>
  box({
    x: o.x, y: o.y, w: 160, h: 46, rot: o.rot, z: o.z ?? 20,
    css: 'filter:drop-shadow(2px 6px 4px rgba(70,15,45,.45))',
    inner: `<svg width="160" height="46" viewBox="0 0 160 46">
      <rect x="6" y="6" width="150" height="34" rx="8" fill="#1d1c21"/><rect x="6" y="6" width="150" height="9" rx="4" fill="#3b3a42"/>
      <path d="M62 4 H120 L116 11 L122 17 L116 23 L122 29 L116 35 L120 42 H62 Z" fill="#e6dfd0"/><path d="M62 4 H120 L116 11 L122 17 L116 23 L122 29 L116 35 L120 42 H62 Z" fill="none" stroke="rgba(90,70,40,.4)" stroke-width="1.2"/>
      <path d="M70 13 H104 M70 22 H108 M70 31 H100" stroke="rgba(120,100,70,.4)" stroke-width="2"/>
      <circle cx="12" cy="38" r="2" fill="#111"/><circle cx="20" cy="42" r="1.6" fill="#111"/>
    </svg>`,
  })

// block eraser with a violet sleeve
const eraser = (o) =>
  box({
    x: o.x, y: o.y, w: 110, h: 50, rot: o.rot, z: o.z ?? 20,
    css: `border-radius:7px;background:linear-gradient(90deg,#f7f3f6 0 34%,#8b4ac0 34%);box-shadow:inset 0 3px 0 rgba(255,255,255,.4),inset 0 -5px 0 rgba(0,0,0,.14),2px 8px 8px -2px rgba(70,15,45,.45)`,
    inner: `<div class="a" style="left:46px;top:15px;width:52px;height:4px;background:#ffd800;border-radius:2px"></div><div class="a" style="left:46px;top:27px;width:34px;height:4px;background:${PINK};border-radius:2px"></div><div class="a" style="left:8px;top:12px;width:20px;height:7px;background:rgba(120,110,120,.3);border-radius:4px"></div>`,
  })

const kneaded = (x, y, rot) =>
  box({ x, y, w: 62, h: 44, rot, z: 19, css: 'border-radius:48% 52% 45% 55% / 55% 45% 55% 45%;background:radial-gradient(circle at 35% 30%,#c3c0ca,#8f8c99);box-shadow:2px 6px 6px -1px rgba(70,15,45,.45),inset 0 -3px 4px rgba(0,0,0,.2)' })

const binder = (x, y, rot, z = 30) =>
  `<svg class="a" style="left:${x}px;top:${y}px;transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(2px 5px 3px rgba(70,15,45,.45))" width="96" height="112" viewBox="0 0 100 116">
    <path d="M24 50 C10 6 44 -6 46 34" fill="none" stroke="#b9bec6" stroke-width="5" stroke-linecap="round"/><path d="M76 50 C90 6 56 -6 54 34" fill="none" stroke="#b9bec6" stroke-width="5" stroke-linecap="round"/>
    <path d="M10 50 H90 L100 112 H0 Z" fill="#232328"/><path d="M10 50 H90 L92 62 H8 Z" fill="#3b3b44"/><path d="M24 70 L22 104" stroke="rgba(255,255,255,.14)" stroke-width="4"/>
  </svg>`

const crumbs = (cx, cy, n, spread, z = 13) =>
  Array.from({ length: n }, () => {
    const a = rnd() * 6.28
    const d = rnd() * spread
    const s = 4 + rnd() * 8
    const col = rnd() > 0.35 ? '#ece6ee' : '#bdb6c4'
    return `<div class="a" style="left:${(cx + Math.cos(a) * d).toFixed(0)}px;top:${(cy + Math.sin(a) * d * 0.6).toFixed(0)}px;width:${(s * 1.5).toFixed(1)}px;height:${s.toFixed(1)}px;border-radius:${s}px ${s * 0.4}px ${s}px ${s * 0.6}px;background:${col};transform:rotate(${(rnd() * 180).toFixed(0)}deg);z-index:${z};box-shadow:0 1px 1px rgba(70,15,45,.4)"></div>`
  }).join('')

const shavings = (cx, cy, n, spread, z = 13) =>
  Array.from({ length: n }, () => {
    const a = rnd() * 6.28
    const d = rnd() * spread
    const s = 12 + rnd() * 14
    return `<div class="a" style="left:${(cx + Math.cos(a) * d).toFixed(0)}px;top:${(cy + Math.sin(a) * d * 0.6).toFixed(0)}px;width:${s.toFixed(0)}px;height:${(s * 0.7).toFixed(0)}px;border:3px solid #f2dcb4;border-bottom-color:transparent;border-left-color:${rnd() > 0.5 ? 'transparent' : '#f2dcb4'};border-radius:50%;transform:rotate(${(rnd() * 360).toFixed(0)}deg);z-index:${z};filter:drop-shadow(0 1px 1px rgba(70,15,45,.35))"></div>`
  }).join('')

const smudge = (x, y, w, h, rot, a = 0.34, z = 13) => box({ x, y, w, h, rot, z, css: `background:radial-gradient(closest-side,rgba(40,38,48,${a}),rgba(40,38,48,${a * 0.4}) 55%,transparent);filter:blur(5px);mix-blend-mode:multiply` })

// paint-chip swatch card
const chip = ({ x, y, rot, cols, z = 18, w = 122 }) => {
  const bh = 58
  return sheet({
    x, y, w, h: 18 + cols.length * (bh + 6) + 40, rot, z, c: '#fffefa', shadow: SH.lift,
    inner: cols.map(([hex, name, ink], i) => `<div class="a" style="left:10px;top:${12 + i * (bh + 6)}px;width:${w - 20}px;height:${bh}px;background:${hex};border-radius:2px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.08)"></div>` + text({ x: 18, y: 20 + i * (bh + 6), t: name, font: 'Courier Prime', weight: 700, size: 15, c: ink, z: 9 }) + text({ x: 18, y: 42 + i * (bh + 6), t: hex.toUpperCase(), font: 'DM Mono', size: 15, c: ink, z: 9 })).join('') + text({ x: 12, y: 18 + cols.length * (bh + 6) + 6, t: cols.length + ' tones', font: 'Gochi Hand', size: 26, c: INK }),
  })
}

// ---- layout ------------------------------------------------------------------------------------------------------------

export default function () {
  seed = 11
  const crop = (w, h, m, c = INK) => `<svg class="a" style="left:0;top:0;opacity:.55" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round">${[[m, m], [w - m, m], [m, h - m], [w - m, h - m]].map(([x, y]) => `M${x - 9} ${y}H${x + 9}M${x} ${y - 9}V${y + 9}`).map((d) => `<path d="${d}"/>`).join('')}</svg>`

  // A. the cap portrait on thick sketch paper
  const A = sheet({
    x: 14, y: 410, w: 380, h: 540, rot: -4.5, z: 6, c: '#f6efdb', shadow: SH.lift,
    inner: [
      `<img class="a" src="${CAP}" style="left:28px;top:30px;width:306px;height:433px;object-fit:contain;filter:saturate(1.14) brightness(1.07)">`,
      crop(380, 540, 16),
      pencilNote({ x: 40, y: 462, t: 'cap · 4 tones', size: 54, rot: -3 }),
      pencilNote({ x: 22, y: -6, t: 'v2', size: 80, rot: -6, z: 12 }),
    ].join(''),
  })

  // B. the orange portrait on a torn-out spiral page
  const hm = 'radial-gradient(circle 11px at 0 22px,transparent 10px,#000 11px)'
  const B = box({
    x: 356, y: 396, w: 340, h: 600, rot: 3, z: 8, css: `filter:${DS()}`,
    inner: `<div class="a paper-tex" style="inset:0;background-color:#fdfaf2;border-radius:2px;-webkit-mask-image:${hm};mask-image:${hm};-webkit-mask-size:100% 44px;mask-size:100% 44px;-webkit-mask-repeat:repeat-y;mask-repeat:repeat-y">
      <div class="a" style="inset:0;background-image:radial-gradient(rgba(150,110,160,.42) 1.3px,transparent 1.8px);background-size:26px 26px;opacity:.55"></div>
      <img class="a" src="${ORA}" style="left:34px;top:52px;width:272px;height:468px;object-fit:contain;filter:saturate(1.14) brightness(1.07)">    </div>`,
  })

  // C. tracing paper over the orange portrait, with a pencil trace of it (a little out of register)
  const C = box({
    x: 384, y: 364, w: 372, h: 580, rot: 4.8, z: 14,
    css: `background:linear-gradient(135deg,rgba(255,255,255,.3),rgba(255,255,255,.18));backdrop-filter:blur(.8px) brightness(1.04);-webkit-backdrop-filter:blur(.8px) brightness(1.04);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.6),0 1px 2px rgba(70,15,45,.3),0 12px 20px -6px rgba(70,15,45,.34);border-radius:3px`,
    inner: [
      `<div class="a" style="inset:0;background:linear-gradient(100deg,transparent 28%,rgba(255,255,255,.3) 32%,transparent 37%,transparent 60%,rgba(255,255,255,.22) 64%,transparent 69%)"></div>`,
      `<img class="a" src="${ORA}" style="left:18px;top:76px;width:272px;height:468px;object-fit:contain;filter:url(#trace)">`,
      crop(372, 580, 16, '#555'),
      pencilNote({ x: 238, y: 520, t: 'trace v1', size: 54, rot: -4 }),
    ].join(''),
  })

  // D. the Vertice logo as a proof card
  const D = sheet({
    x: 698, y: 430, w: 314, h: 238, rot: -4, z: 16, c: '#fffdf9', shadow: SH.lift,
    inner: [
      `<img class="a" src="${LOGO}" style="left:14px;top:10px;width:286px;height:201px;object-fit:contain">`,
      note({ x: 176, y: 148, t: 'lamp +<br>chair', size: 36, rot: -3, lh: 1 }),
    ].join(''),
  })

  // E. the Yakisoba crest as a die-cut sticker
  const E = box({
    x: 748, y: 676, w: 250, h: 233, rot: 7, z: 17,
    inner: `<img class="a" src="${CREST}" style="left:0;top:0;width:250px;height:233px;object-fit:contain;filter:drop-shadow(5px 0 0 #fff) drop-shadow(-5px 0 0 #fff) drop-shadow(0 5px 0 #fff) drop-shadow(0 -5px 0 #fff) drop-shadow(4px 4px 0 #fff) drop-shadow(-4px -4px 0 #fff) drop-shadow(4px -4px 0 #fff) drop-shadow(-4px 4px 0 #fff) drop-shadow(0 7px 8px rgba(70,15,45,.45))">`,
  })

  // swatches fan
  const orange = [['#ffd800', 'YOLK', '#4a3a00'], ['#f8a635', 'AMBER', '#4a2a00'], ['#dc8f43', 'CLAY', '#3a1f00'], ['#b16022', 'BURNT', '#ffe8d0']]
  const violet = [['#ce8cfc', 'LILAC', '#3a1260'], ['#8b4ac0', 'GRAPE', '#f6e8ff'], ['#4d0e6e', 'NIGHT', '#f1dcff']]
  const swatches = [
    chip({ x: 292, y: 936, rot: -9, cols: orange, z: 18 }),
    chip({ x: 416, y: 958, rot: 4, cols: violet, z: 19 }),
    sheet({
      x: 546, y: 950, w: 130, h: 160, rot: -3, z: 18, c: '#fffefa', shadow: SH.lift,
      inner: `<div class="a" style="left:15px;top:14px;width:100px;height:100px;border-radius:50%;background:${PINK};box-shadow:inset 0 0 0 1px rgba(0,0,0,.08),inset 0 -6px 10px rgba(180,40,100,.25)"></div>` + text({ x: 14, y: 120, t: 'PINK', font: 'Courier Prime', weight: 700, size: 16, c: '#8a1d52' }) + text({ x: 14, y: 138, t: '#FF8FC1', font: 'DM Mono', size: 15, c: '#8a1d52' }),
    }),
  ].join('')

  // sticky + notes + stamps
  const sticky = sheet({
    x: 30, y: 938, w: 180, h: 168, rot: -6, z: 20, c: '#fff08a', shadow: SH.flat, r: 1,
    inner: text({ x: 16, y: 14, t: 'too<br>orange??', font: 'Gochi Hand', size: 48, c: '#4a1f3a', lh: 1.05, rot: -2 }) + text({ x: 16, y: 122, t: '(no. keep it)', font: 'Gochi Hand', size: 28, c: '#4a1f3a', rot: -2 }),
  })

  // a tear-off palette pad with dabs of the project's colours (top, outside the identity band)
  const dab = (x, y, w, h, c, rot = 0) => `<div class="a" style="left:${x}px;top:${y}px;width:${w * 1.15}px;height:${h * 0.8}px;transform:rotate(${rot}deg) skewX(-14deg);border-radius:38% 62% 44% 56% / 60% 38% 62% 40%;background:linear-gradient(100deg,rgba(255,255,255,.18),transparent 40%,rgba(0,0,0,.1)),${c};box-shadow:0 1px 1px rgba(70,15,45,.35),0 0 0 2px ${c}"></div>`
  const palettePad = box({
    x: 770, y: 120, w: 250, h: 220, rot: 6, z: 9,
    css: `background:linear-gradient(135deg,#f1f0f3,#e0dee5);box-shadow:${SH.lift};border-radius:3px;border-bottom:10px solid #c9c6d2`,
    inner: [
      dab(20, 20, 56, 42, '#ffd800', 10), dab(90, 14, 58, 46, '#f8a635', -8), dab(160, 26, 54, 40, '#dc8f43', 14), dab(30, 84, 62, 44, '#b16022', -12),
      dab(112, 90, 64, 48, '#8b4ac0', 8), dab(188, 96, 44, 38, PINK, -6), dab(28, 150, 70, 40, '#ce8cfc', 6),
      `<div class="a" style="left:130px;top:150px;width:70px;height:46px;border-radius:50%;background:radial-gradient(closest-side,rgba(248,166,53,.5),transparent);filter:blur(3px)"></div>`,
    ].join(''),
  })

  // bottom: the doodle strip taped on, a spiral-book corner behind, the frosted pocket
  const coil = Array.from({ length: 12 }, (_, i) => `<div class="a" style="left:${28 + i * 34}px;top:-12px;width:14px;height:32px;border-radius:7px;background:linear-gradient(90deg,#8e929c,#e6e8ee 45%,#7b7f89);box-shadow:1px 3px 3px rgba(70,15,45,.45)"></div>`).join('')
  const spiralPage = box({
    x: -80, y: 1148, w: 470, h: 330, rot: 5, z: 4,
    css: `background:#fbf6ea;box-shadow:${SH.flat};border-radius:3px;background-image:radial-gradient(rgba(150,110,160,.35) 1.2px,transparent 1.7px);background-size:26px 26px`,
    inner: coil + `<svg class="a" style="left:0;top:0;filter:url(#wob);opacity:.75" width="470" height="330" viewBox="0 0 470 330" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"><ellipse cx="220" cy="120" rx="64" ry="44"/><path d="M156 120 C170 170 270 170 284 120"/><path d="M220 76 V164" stroke-width="1.6"/><path d="M60 100 l34 -30 l34 30 l-34 14z" /><path d="M330 90 q30 -50 60 0 q30 50 60 0" /></svg>`,
  })
  const strip = box({
    x: 56, y: 1070, w: 900, h: 172, rot: -2.2, z: 12, css: `background:#fffdf7;border-radius:2px;box-shadow:${SH.lift}`,
    inner: `<img class="a" src="${SKETCH}" style="left:20px;top:12px;width:860px;height:148px;object-fit:contain">`,
  })
  const pocket = box({
    x: -4, y: 1262, w: 1090, h: 96, z: 44,
    css: `background:linear-gradient(180deg,rgba(255,255,255,.4),rgba(255,255,255,.2));backdrop-filter:blur(2.6px) brightness(1.08);-webkit-backdrop-filter:blur(2.6px) brightness(1.08);border-top:2px solid rgba(255,255,255,.8);box-shadow:0 -4px 10px rgba(70,15,45,.22),inset 0 2px 0 rgba(255,255,255,.4)`,
    inner: `<div class="a" style="left:0;right:0;top:12px;border-top:2px dashed rgba(70,60,80,.5)"></div><div class="a" style="inset:0;background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,.35) 38%,transparent 46%,transparent 70%,rgba(255,255,255,.28) 76%,transparent 82%)"></div>`,
  })

  const body = [
    defs,
    // the board: light falling from the top left, a soft vignette, and a faint fold
    `<div class="a paper-tex" style="inset:0;z-index:1;background:radial-gradient(900px 700px at 22% 12%,rgba(255,225,238,.5),transparent 70%),radial-gradient(800px 700px at 85% 80%,rgba(150,40,95,.28),transparent 70%)"></div>`,
    `<div class="a" style="left:0;right:0;top:672px;height:3px;z-index:2;background:linear-gradient(rgba(120,20,70,.16),rgba(255,255,255,.2))"></div>`,
    gridSheet, stickerSheet,
    spiralPage,
    A, B, C, D, E,
    swatches, sticky,
    strip,
    ruler,
    palettePad,
    pencil({ x: 380, y: 300, rot: -8, z: 22 }),
    charcoal({ x: 48, y: 330, rot: 14, z: 21 }),
    eraser({ x: 640, y: 214, rot: 17, z: 21 }),
    kneaded(588, 336, 20),
    smudge(150, 320, 130, 46, 12, 0.3), smudge(560, 650, 90, 40, -20, 0.18, 15),
    crumbs(300, 350, 16, 90), crumbs(690, 1040, 12, 70, 21), crumbs(190, 1030, 12, 80, 21), crumbs(700, 380, 10, 60, 22),
    shavings(540, 280, 6, 90, 23),
    binder(330, 372, -10, 30),
    washi({ x: 214, y: 430, w: 150, rot: -8, kind: 'dots' }),
    washi({ x: 700, y: 436, w: 120, rot: -38, kind: 'stripes', z: 30 }),
    washi({ x: 940, y: 1092, w: 130, rot: 16, kind: 'yolk', z: 30 }),
    pen({ kind: 'circle', x: 70, y: 450, w: 210, h: 86, rot: -8, c: '#d6458b', sw: 4.5, z: 27 }),
    note({ x: 250, y: 505, t: 'pattern!', size: 36, rot: 6, z: 27, c: '#b02466' }),
    stamp({ x: 46, y: 790, t: 'WIP', size: 44, c: '#c0245f', rot: -12, z: 28 }),
    stamp({ x: 850, y: 452, t: 'PROOF', size: 30, c: '#4d0e6e', rot: -6, z: 30 }),
    ring({ x: 700, y: 1005, d: 180, rot: 20, z: 11 }),
    pen({ kind: 'arrow', x: 700, y: 950, w: 150, h: 60, rot: 160, c: '#c0245f', sw: 5, z: 26 }),
    note({ x: 740, y: 1000, t: '4 tones, that\'s it', size: 38, rot: -3, z: 26 }),
    // the pocket and the strap
    pocket,
    box({ x: 1028, y: -10, w: 32, h: 1380, z: 60, css: 'background:repeating-linear-gradient(180deg,#232227 0 4px,#34343b 4px 8px);box-shadow:-7px 0 10px -2px rgba(70,15,45,.5),inset 2px 0 0 rgba(255,255,255,.1),inset -2px 0 0 rgba(0,0,0,.35)' }),
    box({ x: 1022, y: 1296, w: 44, h: 22, z: 62, css: 'border-radius:4px;background:linear-gradient(#ff9ec9,#e86aa5);box-shadow:0 2px 4px rgba(70,15,45,.5),inset 0 1px 0 rgba(255,255,255,.5)' }),
    // the label on the pocket
    box({
      x: 70, y: 1286, w: 470, h: 50, rot: -1.2, z: 50, css: 'background:#fffefa;box-shadow:0 2px 4px rgba(70,15,45,.4);border-left:8px solid #c0245f',
      inner: text({ x: 18, y: 9, t: 'PROCREATE · EARLY WORK', font: 'Courier Prime', weight: 700, size: 28, c: '#1c1424', ls: '.04em' }),
    }),
  ].join('')

  return { bg: '#e98fb7', body }
}
