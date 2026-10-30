// Folder 04, Spelled Guilty: an editor's hard-cover case file. Inside: oxblood bookcloth with gilt stamping, a ribbon, a card pocket with
// index cards, the cover as a printer's proof (crop marks, colour bar), the real case-file page and the real word-search page with red-pen
// circles and a working magnifying glass, a typed manuscript page with proof marks, carbon copy, scorecard on a prong fastener, photos,
// an exhibit tag, a suspect line-up of die-cut stickers, the real CASE CLOSED page, string and pins.
import { pub, text, clip, tape, stamp, ring, SHADOW } from './lib.mjs'

const P = (f) => pub(`works/spelled-guilty/${f}`)
const RED = '#d4202f'
const NAVY = '#1f3459'
const f1 = (n) => Math.round(n * 10) / 10
const rnd = (seed) => {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

const box = (o, inner = '', style = '') =>
  `<div class="a" style="left:${o.x}px;top:${o.y}px;${o.w !== undefined ? `width:${o.w}px;` : ''}${o.h !== undefined ? `height:${o.h}px;` : ''}transform:rotate(${o.rot ?? 0}deg);z-index:${o.z ?? 5};${style}">${inner}</div>`
const abs = (x, y, w, h, style = '', inner = '') => `<div class="a" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;${style}">${inner}</div>`

const slub = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><filter id="s" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".012 .9" numOctaves="2" seed="7" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 .8  0 0 0 0 .8  0 0 0 .55 -.2"/></filter><rect width="100%" height="100%" filter="url(#s)"/></svg>`,
)
const CSS = `
.cloth{background:url("data:image/svg+xml,${slub}"),repeating-linear-gradient(0deg,rgba(0,0,0,.18) 0 1px,transparent 1px 3px),repeating-linear-gradient(90deg,rgba(255,225,225,.05) 0 1px,transparent 1px 3px),radial-gradient(ellipse 85% 65% at 50% 45%,#701a2e,#50101f 58%,#30060f 100%)}
.leather{background:url("data:image/svg+xml,${slub}"),linear-gradient(180deg,#8a2248,#5e1230)}
.gilt{background:linear-gradient(100deg,#8c6a2a,#f2dc9a 30%,#b8924a 50%,#f6e6ab 70%,#8c6a2a);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 1px 0 rgba(0,0,0,.55))}
`

// ---------- red pen (page-local SVG) ----------
function loop(x1, x2, y, { pad = 22, ry = 26, seed = 1, sw = 7 } = {}) {
  const r = rnd(seed)
  const cx = (x1 + x2) / 2
  const rx = (x2 - x1) / 2 + pad
  const n = 60
  const a0 = Math.PI * (0.85 + r() * 0.3)
  const sp = (v, p) => Math.sign(v) * Math.abs(v) ** p
  let d = ''
  for (let i = 0; i <= n; i++) {
    const u = i / n
    const t = a0 + u * 1.12 * 2 * Math.PI
    const g = 1 + 0.07 * u + (r() - 0.5) * 0.05
    d += `${i ? 'L' : 'M'}${f1(cx + sp(Math.cos(t), 0.55) * rx * g)} ${f1(y + sp(Math.sin(t), 0.8) * ry * g + u * 4)}`
  }
  return `<path d="${d}" fill="none" stroke="${RED}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" opacity=".93"/>`
}
function strike(x1, x2, y, seed = 3, sw = 5) {
  const r = rnd(seed)
  const j = () => f1((r() - 0.5) * 5)
  return `<path d="M${x1} ${f1(y) + +j()} Q${f1((x1 + x2) / 2)} ${f1(y) + +j() * 2} ${x2} ${f1(y) + +j()}" fill="none" stroke="${RED}" stroke-width="${sw}" stroke-linecap="round" opacity=".93"/>`
}
const penSvg = (inner, w = 900, h = 1350) => `<svg style="position:absolute;left:0;top:0;width:${w}px;height:${h}px;mix-blend-mode:multiply" viewBox="0 0 ${w} ${h}">${inner}</svg>`
const hand = (x, y, t, size, rot = 0, font = 'Reenie Beanie', c = RED) => `<div style="position:absolute;left:${x}px;top:${y}px;white-space:nowrap;font:400 ${size}px/1 '${font}';color:${c};transform:rotate(${rot}deg);mix-blend-mode:multiply">${t}</div>`

// ---------- a printed page of public/ in page-local units (900 x 1350), with an optional magnifying glass ----------
function pageInner({ src, tint = '#f3e8cb', overlay = '' }) {
  return (
    `<img src="${src}" style="position:absolute;left:0;top:0;width:900px;height:1350px;display:block">` +
    `<div style="position:absolute;inset:0;background:${tint};mix-blend-mode:multiply"></div>` +
    `<div style="position:absolute;inset:0;box-shadow:inset 0 0 80px rgba(110,70,20,.34)"></div>` +
    overlay
  )
}
const LAYER = (k) => `position:absolute;left:0;top:0;width:900px;height:1350px;transform:scale(${k});transform-origin:0 0;`
function doc(o) {
  const k = o.w / 900
  const h = 1350 * k
  return (
    `<div class="a" style="left:${o.x}px;top:${o.y}px;width:${f1(o.w)}px;height:${f1(h)}px;transform:rotate(${o.rot ?? 0}deg);z-index:${o.z ?? 6}">` +
    `<div class="a" style="inset:0;overflow:hidden;border-radius:2px;box-shadow:${o.shadow ?? SHADOW.flat}"><div style="${LAYER(k)}isolation:isolate">${pageInner(o)}</div></div>` +
    `<div style="${LAYER(k)}">${o.over ?? ''}</div></div>`
  )
}
function lens(o) {
  const { cx, cy, r, M = 1.9, ang = 45, len = 340 } = o
  const content = `<div style="position:absolute;left:0;top:0;width:900px;height:1350px;transform:translate(${f1(r - cx * M)}px,${f1(r - cy * M)}px) scale(${M});transform-origin:0 0;isolation:isolate">${pageInner(o)}</div>`
  return (
    `<div style="position:absolute;left:${cx - r}px;top:${cy - r}px;width:${2 * r}px;height:${2 * r}px;filter:drop-shadow(14px 20px 12px rgba(0,0,0,.45))">` +
    `<div style="position:absolute;left:${r}px;top:${r}px;width:0;height:0;transform:rotate(${ang}deg)">` +
    `<div style="position:absolute;left:${r + 20}px;top:-19px;width:${len}px;height:38px;border-radius:6px 22px 22px 6px;background:linear-gradient(180deg,#6a4630,#2a170c 55%,#4a2c1a);box-shadow:inset 0 3px 3px rgba(255,255,255,.22)"></div>` +
    `<div style="position:absolute;left:${r + 6}px;top:-24px;width:62px;height:48px;border-radius:8px;background:linear-gradient(180deg,#f7e3a0,#a47a2c 55%,#dcb862)"></div>` +
    `</div>` +
    `<div style="position:absolute;inset:0;border-radius:50%;overflow:hidden;background:#fff">${content}<div style="position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at 28% 22%,rgba(255,255,255,.6),rgba(255,255,255,0) 34%),radial-gradient(circle at 50% 50%,rgba(255,255,255,0) 62%,rgba(20,10,0,.28) 100%)"></div></div>` +
    `<div style="position:absolute;inset:-17px;border-radius:50%;border:18px solid #c9a24c;box-shadow:inset 0 0 0 3px #f6e5a4,inset 0 0 14px rgba(0,0,0,.5),0 0 0 2px #7b5c22"></div>` +
    `</div>`
  )
}

// ---------- little props ----------
const pin = (x, y, c = RED, z = 60) =>
  `<div class="a" style="left:${x - 14}px;top:${y - 14}px;width:28px;height:28px;border-radius:50%;background:radial-gradient(circle at 34% 28%,rgba(255,255,255,.85),rgba(255,255,255,0) 26%),radial-gradient(circle at 40% 36%,${c},#6e0e17 88%);box-shadow:5px 8px 6px rgba(0,0,0,.45),inset -2px -3px 4px rgba(0,0,0,.35);z-index:${z}"></div>`
const binder = (x, y, s = 1, rot = 0, z = 40) =>
  `<svg class="a" style="left:${x}px;top:${y}px;width:${120 * s}px;height:${140 * s}px;transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(3px 5px 3px rgba(0,0,0,.5))" viewBox="0 0 120 140"><path d="M26 58 C 2 14, 36 -6, 44 26" fill="none" stroke="#c4cbd2" stroke-width="5.5" stroke-linecap="round"/><path d="M94 58 C 118 14, 84 -6, 76 26" fill="none" stroke="#c4cbd2" stroke-width="5.5" stroke-linecap="round"/><path d="M8 54 L112 54 L98 132 Q60 140 22 132 Z" fill="#1d1d22"/><path d="M14 58 L106 58" stroke="rgba(255,255,255,.28)" stroke-width="3"/><path d="M26 70 L24 124" stroke="rgba(255,255,255,.12)" stroke-width="5"/></svg>`
const flag = (x, y, c, rot = 0, z = 50, w = 78) => `<div class="a" style="left:${x}px;top:${y}px;width:${w}px;height:28px;transform:rotate(${rot}deg);z-index:${z};background:${c};clip-path:polygon(0 0,100% 0,88% 50%,100% 100%,0 100%);box-shadow:0 2px 3px rgba(0,0,0,.4);opacity:.95"></div>`
const flagUp = (x, y, c, rot = 0, z = 36) => `<div class="a" style="left:${x}px;top:${y}px;width:32px;height:84px;transform:rotate(${rot}deg);z-index:${z};background:linear-gradient(90deg,rgba(255,255,255,.25),rgba(0,0,0,.08)),${c};clip-path:polygon(0 0,50% 12%,100% 0,100% 100%,0 100%);filter:drop-shadow(0 2px 2px rgba(0,0,0,.4))"></div>`
function pencil(o) {
  const len = o.len ?? 420
  return box({ x: o.x, y: o.y, w: len, h: 24, rot: o.rot ?? 0, z: o.z ?? 40 }, [
    abs(0, 0, len - 40, 24, 'background:linear-gradient(180deg,#9d2347 0 22%,#7a1630 22% 62%,#5a0f24 62%);border-radius:4px 0 0 4px;filter:drop-shadow(5px 7px 4px rgba(0,0,0,.45))'),
    abs(len - 40, 0, 40, 24, 'background:#e8c98f;clip-path:polygon(0 0,100% 42%,100% 58%,0 100%)'),
    abs(len - 6, 9, 6, 6, 'background:#222;border-radius:50%'),
    abs(30, 0, 22, 24, 'background:linear-gradient(180deg,#e6e9ec,#8d949b 50%,#d4d8dc)'),
    abs(0, 0, 32, 24, 'background:#e9a5b4;border-radius:4px 0 0 4px'),
  ].join(''))
}

// ---------- the pieces ----------
const manuscript = () => {
  const lines = [
    'On the night of the October',
    'gale in 1923, the keeper fell',
    'from the gallery of the',
    'lighthouse and died on the',
    'rocks below. Only four people',
    'had crossed the causeway',
    'before the tide cut the rock',
    'off from the village. Each of',
    'them had climbed the iron',
    'stairs to see her that',
    'evening. The coroner said the',
    'bruise on her shoulder came',
    'from a left-handed shove.',
  ]
  const typed = lines.map((l, i) => text({ x: 44, y: 112 + i * 28, t: l, font: 'Courier Prime', size: 15, c: '#262626', z: 3 })).join('')
  const pen = penSvg(
    [
      strike(264, 310, 149, 4, 4),
      loop(188, 260, 261, { pad: 8, ry: 17, seed: 21, sw: 4 }),
      strike(106, 208, 429, 5, 4),
      strike(108, 206, 435, 6, 3),
      `<path d="M312 164 C 300 156, 290 152, 284 146" fill="none" stroke="${RED}" stroke-width="3" stroke-linecap="round"/>`,
      `<path d="M300 250 C 330 236, 350 236, 372 240" fill="none" stroke="${RED}" stroke-width="3" stroke-linecap="round"/>`,
      `<path d="M20 106 L20 124 M26 106 L26 124 M20 106 C 12 106 12 118 20 118" fill="none" stroke="${RED}" stroke-width="3" stroke-linecap="round"/>`,
    ].join(''),
    400,
    560,
  )
  return box(
    { x: 160, y: 78, w: 400, h: 560, rot: 3.5, z: 6 },
    [
      abs(0, 0, 400, 560, `background:#f2e7c6;box-shadow:${SHADOW.lift};border-radius:2px`),
      abs(0, 0, 400, 560, 'box-shadow:inset 0 0 60px rgba(120,80,20,.28);border-radius:2px'),
      text({ x: 44, y: 34, t: 'CASE 01 &nbsp;·&nbsp; DRAFT 3', font: 'Courier Prime', size: 13, c: '#666' }),
      text({ x: 316, y: 34, t: 'p. 3', font: 'Courier Prime', size: 13, c: '#666' }),
      text({ x: 44, y: 66, t: 'MURDER AT GULL ROCK', font: 'Courier Prime', weight: 700, size: 19, c: '#222' }),
      typed,
      pen,
      hand(314, 122, 'plunged', 34, -6),
      hand(310, 222, 'tighten!', 32, -4),
      hand(304, 408, 'KEY!!', 38, 6),
      text({ x: 176, y: 520, t: '— 3 —', font: 'Courier Prime', size: 14, c: '#666' }),
      abs(8, 12, 30, 5, 'background:#9aa0a6;transform:rotate(38deg);border-radius:2px;box-shadow:0 1px 1px rgba(0,0,0,.4)'),
    ].join(''),
  )
}
const carbon = () => {
  const rows = Array.from({ length: 16 }, (_, i) => abs(40, 96 + i * 26, 220 + ((i * 53) % 90), 8, 'background:rgba(24,48,120,.24);border-radius:2px')).join('')
  return box(
    { x: 705, y: 24, w: 350, h: 520, rot: 7, z: 3 },
    [abs(0, 0, 350, 520, `background:#b9c9e0;box-shadow:${SHADOW.lift};border-radius:2px`), abs(0, 0, 350, 520, 'box-shadow:inset 0 0 50px rgba(30,50,110,.28)'), text({ x: 40, y: 40, t: 'CARBON COPY', font: 'Courier Prime', weight: 700, size: 20, c: 'rgba(24,48,120,.55)' }), rows].join(''),
  )
}
const fastener = (x, y, rot) =>
  box({ x, y, w: 240, h: 40, rot, z: 8 }, [
    abs(0, 8, 240, 24, 'background:linear-gradient(180deg,#f0f2f4,#9aa1a8 55%,#cfd4d8);border-radius:4px;box-shadow:3px 5px 5px rgba(0,0,0,.45)'),
    abs(38, 2, 36, 36, 'background:radial-gradient(circle at 38% 32%,#f8e6a4,#9a7424);border-radius:50%;box-shadow:2px 4px 4px rgba(0,0,0,.45)'),
    abs(166, 2, 36, 36, 'background:radial-gradient(circle at 38% 32%,#f8e6a4,#9a7424);border-radius:50%;box-shadow:2px 4px 4px rgba(0,0,0,.45)'),
  ].join(''))

function photo(o) {
  return box({ x: o.x, y: o.y, w: o.w, h: o.h, rot: o.rot, z: o.z }, [
    abs(0, 0, o.w, o.h, `background:#f4efe2;box-shadow:${SHADOW.lift};border-radius:2px`),
    `<img class="a" src="${o.src}" style="left:12px;top:12px;width:${o.w - 24}px;height:${o.h - 60}px;object-fit:cover;object-position:${o.pos ?? '50% 50%'};filter:sepia(.28) contrast(1.06) brightness(.97)">`,
    text({ x: 18, y: o.h - 44, t: o.label, font: 'Gochi Hand', size: 30, c: '#2b2b3a', rot: -1 }),
  ].join(''))
}

const CARDS = [
  ['03', 'Death on the Midnight Express'],
  ['07', 'Cut! Murder on Stage Four'],
  ['16', 'The Soprano’s Last Aria'],
  ['51', 'Thin Ice'],
  ['59', 'The Puppeteer’s Last String'],
]
const indexCards = () =>
  CARDS.map(([n, t], i) => {
    const rules = Array.from({ length: 6 }, (_, k) => abs(0, 76 + k * 26, 430, 2, 'background:rgba(70,110,190,.3)')).join('')
    return box({ x: 26 + [0, 14, -4, 18, 6][i], y: 990 + i * 52, w: 430, h: 262, rot: [-5, 3, -2.5, 4.5, -1.5][i], z: 7 + i }, [
      abs(0, 0, 430, 262, `background:#f6efdb;box-shadow:${SHADOW.flat};border-radius:3px`),
      abs(0, 40, 430, 3, 'background:rgba(212,32,47,.8)'),
      rules,
      text({ x: 18, y: 10, t: `<span style="color:${RED}">${n}</span> &nbsp;${t}`, font: 'Courier Prime', weight: 700, size: 20, c: '#23233a' }),
    ].join(''))
  }).join('')
const pocket = () =>
  box({ x: 6, y: 1228, w: 524, h: 150, z: 34, rot: 0 }, [
    `<div class="a" style="inset:0;filter:drop-shadow(0 -4px 8px rgba(0,0,0,.6))"><div class="a leather" style="inset:0;border-radius:30px 30px 0 0;-webkit-mask-image:radial-gradient(circle 56px at 50% 0,transparent 0 55px,#000 56px);mask-image:radial-gradient(circle 56px at 50% 0,transparent 0 55px,#000 56px)"></div></div>`,
    abs(14, 16, 496, 150, 'border:3px dashed rgba(236,196,120,.55);border-radius:22px 22px 0 0;-webkit-mask-image:radial-gradient(circle 70px at 50% -16px,transparent 0 69px,#000 70px);mask-image:radial-gradient(circle 70px at 50% -16px,transparent 0 69px,#000 70px)'),
    `<div class="a gilt" style="left:0;top:62px;width:524px;text-align:center;font:700 25px/1 'Cormorant';letter-spacing:.34em">CASES 01 – 80</div>`,
  ].join(''))
// (pocket label sits at top:62)

function lineup() {
  const S = (f, h, x, aspect, rot) => `<img class="a" src="${P('stickers/' + f)}" style="left:${x}px;top:${240 - h}px;height:${h}px;width:${f1(h * aspect)}px;transform:rotate(${rot}deg);transform-origin:50% 100%;filter:drop-shadow(2px 4px 3px rgba(0,0,0,.4))">`
  const lines = [60, 100, 140, 180, 220].map((y) => abs(0, y, 430, 2, 'background:rgba(70,110,190,.35)')).join('')
  return box({ x: 440, y: 1018, w: 410, h: 292, rot: -4, z: 36 }, [
    abs(0, 0, 410, 292, `background:#f4ecd5;box-shadow:${SHADOW.lift};border-radius:3px`),
    lines,
    abs(0, 0, 410, 34, 'background:#1f3459;border-radius:3px 3px 0 0'),
    text({ x: 14, y: 6, t: 'LINE-UP · 4 SUSPECTS · 1 KILLER', font: 'Courier Prime', weight: 700, size: 17, c: '#f6ecd3', ls: '.08em' }),
    S('suspect-80B.webp', 158, 14, 450 / 807, -2),
    S('suspect-24D.webp', 186, 106, 312 / 876, 2),
    S('suspect-16A.webp', 192, 184, 480 / 963, -1.5),
    S('suspect-45D.webp', 186, 296, 336 / 945, 2.5),
    ...[[46], [136], [232], [326]].map(([x], i) => text({ x, y: 244, t: 'ABCD'[i], font: 'Gochi Hand', size: 36, c: '#23233a' })),
  ].join(''))
}

function tagPiece(o) {
  return box({ x: o.x, y: o.y, w: 170, h: 300, rot: o.rot, z: o.z }, [
    `<div class="a" style="inset:0;filter:drop-shadow(4px 7px 5px rgba(0,0,0,.5))"><div class="a fibre" style="inset:0;background-color:#e8c98c;clip-path:polygon(24% 0,76% 0,100% 12%,100% 100%,0 100%,0 12%)"></div></div>`,
    abs(65, 14, 40, 40, 'background:#f6f1e2;border-radius:50%;box-shadow:inset 0 0 0 2px rgba(0,0,0,.18)'),
    abs(76, 25, 18, 18, 'background:radial-gradient(circle,#2a1a10,#5a4a38);border-radius:50%;box-shadow:inset 0 2px 3px rgba(0,0,0,.7)'),
    text({ x: 85, y: 62, t: 'EXHIBIT', font: 'Courier Prime', weight: 700, size: 22, c: RED, ls: '.1em', extra: 'transform:translateX(-50%) rotate(-3deg);' }),
    text({ x: 85, y: 88, t: '80', font: 'Barlow Semi Condensed', weight: 800, size: 96, c: NAVY, lh: 1, extra: 'transform:translateX(-50%)' }),
    text({ x: 85, y: 186, t: 'CASES', font: 'Courier Prime', weight: 700, size: 30, c: '#2a2a3a', ls: '.08em', extra: 'transform:translateX(-50%)' }),
    text({ x: 85, y: 226, t: '4 SUSPECTS', font: 'Courier Prime', weight: 700, size: 22, c: '#2a2a3a', extra: 'transform:translateX(-50%)' }),
    text({ x: 85, y: 256, t: '1 KILLER', font: 'Courier Prime', weight: 700, size: 22, c: RED, extra: 'transform:translateX(-50%)' }),
    `<svg class="a" style="left:-20px;top:-90px;width:220px;height:130px;overflow:visible" viewBox="0 0 220 130"><path d="M105 62 C 90 40, 40 20, 20 -10 M105 62 C 120 30, 160 14, 200 -20" fill="none" stroke="#b79867" stroke-width="3.5" stroke-linecap="round"/><path d="M96 66 C 80 48, 74 40, 78 30 C 88 20, 100 34, 101 52" fill="none" stroke="#b79867" stroke-width="3"/></svg>`,
  ].join(''))
}

// ---------- the real pages ----------
const gx = (c) => 150 + (c - 1) * 50
const gy = (r) => 193 + (r - 1) * 50
const gridPen =
  penSvg(
    [
      loop(gx(4), gx(10), gy(1), { seed: 11 }),
      loop(gx(4), gx(10), gy(4), { seed: 12 }),
      loop(gx(7), gx(10), gy(6), { seed: 13 }),
      loop(gx(2), gx(11), gy(8), { seed: 14 }),
      loop(gx(2), gx(6), gy(12), { seed: 15 }),
      strike(104, 194, 962, 31), // BOATMAN
      strike(287, 340, 936, 32), // DECK
      strike(287, 410, 1039, 33), // LIGHTHOUSE
      strike(287, 375, 1065, 34), // LOGBOOK
      strike(653, 718, 988, 35), // SPRAY
    ].join(''),
  ) + hand(520, 1262, 'who’s left-handed?', 64, -3)

const caseFilePen = penSvg([strike(640, 756, 432, 41, 6), strike(644, 752, 440, 42, 4), loop(606, 718, 448, { pad: 12, ry: 17, seed: 43, sw: 5 })].join(''))

export default function () {
  const GRID = { src: P('pages/p009-case-01-grid.webp'), tint: '#f2e5c3', overlay: gridPen }
  const body = [
    // ----- the container: oxblood bookcloth, panels, crease, gilt rules, gilt stamping -----
    `<div class="a cloth" style="inset:0;z-index:0"></div>`,
    abs(0, 0, 540, 1350, 'z-index:1;background:linear-gradient(90deg,rgba(0,0,0,.4),rgba(0,0,0,0) 14%,rgba(0,0,0,0) 78%,rgba(0,0,0,.5))'),
    abs(540, 0, 540, 1350, 'z-index:1;background:linear-gradient(90deg,rgba(0,0,0,.55),rgba(0,0,0,0) 20%,rgba(0,0,0,0) 86%,rgba(0,0,0,.4))'),
    abs(526, 0, 28, 1350, 'z-index:2;background:linear-gradient(90deg,transparent,rgba(255,200,200,.1) 42%,rgba(0,0,0,.4) 55%,transparent)'),
    abs(18, 18, 502, 1314, 'z-index:2;border:3px solid rgba(228,188,106,.55);border-radius:8px;box-shadow:inset 0 0 0 8px transparent,inset 0 0 0 10px rgba(228,188,106,.28)'),
    abs(560, 18, 502, 1314, 'z-index:2;border:3px solid rgba(228,188,106,.55);border-radius:8px;box-shadow:inset 0 0 0 8px transparent,inset 0 0 0 10px rgba(228,188,106,.28)'),
    `<div class="a gilt" style="left:46px;top:30px;z-index:3;white-space:nowrap;font:700 26px/1 'Cormorant';letter-spacing:.5em">CASE FILES</div>`,

    // ----- top of the folder: loose papers, photos, the fastener stack, an exhibit tag -----
    doc({ src: P('pages/p003-how-to-solve.webp'), x: 24, y: 96, w: 360, rot: -5, z: 5, tint: '#eee0c2' }),
    manuscript(),
    carbon(),
    doc({ src: P('pages/p004-scorecard-01-25.webp'), x: 690, y: 76, w: 380, rot: 3, z: 4, tint: '#ebdfc2' }),
    fastener(770, 92, 3),
    photo({ src: P('art/case-07-cut-murder-on-stage-four.webp'), x: 430, y: 46, w: 290, h: 232, rot: 5, z: 9, label: 'CASE 07', pos: '50% 40%' }),
    photo({ src: P('art/case-51-thin-ice.webp'), x: 640, y: 168, w: 250, h: 204, rot: -6, z: 10, label: 'CASE 51', pos: '50% 40%' }),
    tape({ x: 590, y: 56, w: 120, rot: -14, z: 40 }),
    tape({ x: 770, y: 186, w: 110, rot: 12, c: 'rgba(242,170,160,.82)', z: 40 }),
    tagPiece({ x: 868, y: 112, rot: 7, z: 26 }),
    clip({ x: 405, y: 90, h: 120, rot: 6, z: 30 }),
    clip({ x: 450, y: 330, h: 110, rot: -10, c: '#c9a24c', z: 32 }),
    ring({ x: 120, y: 330, d: 190, rot: 20, z: 18 }),

    // ----- the band: case-file page, cover proof, word-search page with magnifier -----
    doc({ src: P('pages/p008-case-01-file.webp'), x: 4, y: 405, w: 380, rot: -5, z: 20, tint: '#f4e9cf', overlay: caseFilePen }),
    stamp({ x: 4, y: 722, t: 'GUILTY', size: 86, c: RED, rot: -9, font: 'Barlow Semi Condensed', weight: 800, z: 44 }),
    box({ x: 318, y: 368, w: 410, h: 615, rot: -2, z: 30 }, [
      abs(0, 0, 410, 615, `background:#f7f4ea;box-shadow:${SHADOW.lift};border-radius:2px`),
      `<img class="a" src="${P('cover-front.webp')}" style="left:40px;top:60px;width:330px;height:495px;box-shadow:2px 3px 8px rgba(0,0,0,.35)">`,
      abs(40, 60, 330, 495, 'background:linear-gradient(115deg,rgba(255,255,255,.14),rgba(255,255,255,0) 35%)'),
      text({ x: 40, y: 22, t: 'FRONT COVER · PROOF 3 · CMYK', font: 'Courier Prime', size: 14, c: '#666', ls: '.04em' }),
      // crop marks
      ...[[10, 60, 22, 1.5], [378, 60, 22, 1.5], [10, 555, 22, 1.5], [378, 555, 22, 1.5]].map(([x, y, w, h]) => abs(x, y, w, h, 'background:#111')),
      ...[[40, 30, 1.5, 22], [370, 30, 1.5, 22], [40, 563, 1.5, 22], [370, 563, 1.5, 22]].map(([x, y, w, h]) => abs(x, y, w, h, 'background:#111')),
      // colour bar
      ...['#00aeef', '#ec008c', '#fff200', '#111', '#e2231a', '#00a651', '#2e3192', '#777', '#bbb'].map((c, i) => abs(40 + i * 36.6, 584, 34, 18, `background:${c}`)),
      abs(386, 584, 16, 16, 'border:2px solid #111;border-radius:50%;box-shadow:inset 0 0 0 4px #f7f4ea,inset 0 0 0 5px #111'),
      // a label over the author line, handwriting on the margin
      box({ x: 70, y: 516, w: 250, h: 44, rot: -3, z: 5 }, [abs(0, 0, 250, 44, `background:#f6efdb;box-shadow:${SHADOW.flat};border-radius:2px`), text({ x: 125, y: 11, t: 'PRESS OK · PROOF 3', font: 'Courier Prime', weight: 700, size: 19, c: RED, ls: '.04em', extra: 'transform:translateX(-50%)' })].join('')),
      hand(250, 12, 'more red?', 34, 4),
    ].join('')),
    doc({ src: P('pages/p009-case-01-grid.webp'), x: 676, y: 392, w: 420, rot: 3, z: 24, tint: '#f2e5c3', overlay: gridPen, shadow: SHADOW.lift, over: lens({ ...GRID, cx: 520, cy: 470, r: 178, M: 1.65, ang: 52, len: 330 }) }),
    binder(24, 84, 0.8, -12, 40),
    flagUp(112, 346, '#f4c430', -5),
    flagUp(158, 340, '#2a9d8f', -4),
    flagUp(204, 336, '#e0503f', -3),
    clip({ x: 1020, y: 400, h: 110, rot: 14, c: '#b3261e', z: 34 }),

    // ----- bottom of the folder: index cards in a pocket, line-up, CASE CLOSED page, sketch strip -----
    indexCards(),
    pocket(),
    pencil({ x: 150, y: 1312, len: 400, rot: -5, z: 40 }),
    lineup(),
    doc({
      src: P('pages/p214-case-closed.webp'), x: 800, y: 1010, w: 285, rot: 5, z: 38, tint: '#f0e4c8', shadow: SHADOW.lift,
      overlay: `<img src="${P('catalog-sketch.webp')}" style="position:absolute;left:10px;top:900px;width:880px;transform:rotate(-3deg)">` + hand(430, 270, 'solved!', 130, -8),
    }),
    ring({ x: 640, y: 1045, d: 170, rot: 30, z: 40 }),
    clip({ x: 850, y: 995, h: 120, rot: -6, z: 39 }),

    // ----- red string, pins and the ribbon -----
    `<svg class="a" style="left:0;top:0;width:1080px;height:1350px;z-index:58;filter:drop-shadow(2px 4px 2px rgba(0,0,0,.45));pointer-events:none"><path d="M262 70 C 340 150, 470 150, 596 54" fill="none" stroke="#c4202e" stroke-width="4" stroke-linecap="round"/><path d="M596 54 C 700 120, 800 130, 878 104" fill="none" stroke="#c4202e" stroke-width="4" stroke-linecap="round"/></svg>`,
    pin(262, 70),
    pin(596, 54, '#f2c230'),
    pin(878, 104),
    `<svg class="a" style="left:520px;top:0;width:80px;height:340px;z-index:62;filter:drop-shadow(3px 5px 3px rgba(0,0,0,.5))" viewBox="0 0 80 340"><defs><linearGradient id="rb" x1="0" x2="1"><stop offset="0" stop-color="#8e1328"/><stop offset=".5" stop-color="#d12a40"/><stop offset="1" stop-color="#8e1328"/></linearGradient></defs><path d="M28 0 C 34 90, 20 170, 36 300 L 36 322 L 52 306 L 68 322 L 68 300 C 52 170, 64 90, 60 0 Z" fill="url(#rb)"/><path d="M44 0 C 48 90, 36 170, 50 296" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="3"/></svg>`,
  ].join('')
  return { bg: '#3a0a1a', css: CSS, body }
}
