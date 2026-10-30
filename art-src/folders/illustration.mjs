// Folder 10, Sticker Sheet: a lilac vinyl sticker-collector's binder seen from above, rings down the left edge. One clear punched sleeve
// page holds the real die-cut stickers at angles (one half-peeled) across the middle band; above and below: catalog strip, foil sheet of
// tiny stars, washi, price-gun labels, a liner with the ghost shapes of swapped-away stickers, a pack bag, a "swap?" note, a CONCEPT stamp.
import { pub, pic, sticky, stamp, ring, SHADOW } from './lib.mjs'

const art = (f) => pub(`works/illustration/${f}`)
const S = (n) => art(`art/sticker-0${n}.webp`)
const INK = '#17101B'
const enc = encodeURIComponent
const f1 = (n) => Math.round(n * 100) / 100

const PEBBLE = enc(
  `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360"><filter id="p" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".5" numOctaves="3" seed="8" stitchTiles="stitch" result="n"/><feDiffuseLighting in="n" lighting-color="#fff" surfaceScale="2.4" diffuseConstant="1"><feDistantLight azimuth="235" elevation="58"/></feDiffuseLighting></filter><rect width="100%" height="100%" filter="url(#p)"/></svg>`,
)

/* ---------- small builders (canvas px; a group makes its own local frame) ---------- */
const grp = (o) => `<div class="a" style="left:${o.x}px;top:${o.y}px;width:${o.w}px;height:${o.h}px;transform:rotate(${o.rot ?? 0}deg);z-index:${o.z ?? 10};${o.extra ?? ''}">${o.inner ?? ''}</div>`

const HALO = '#fffaf0'
const halo = (r) => [[r, 0], [-r, 0], [0, r], [0, -r]].map(([a, b]) => `drop-shadow(${a}px ${b}px 0 ${HALO})`).join(' ')
/** a real die-cut sticker. cx, cy = centre of the 3:4 image box, size = image width */
const stk = (o) => {
  const w = o.size ?? 300
  const h = (w * 4) / 3
  return `<div class="a" style="left:${f1(o.cx - w / 2)}px;top:${f1(o.cy - h / 2)}px;width:${w}px;height:${h}px;transform:rotate(${o.rot ?? 0}deg);z-index:${o.z ?? 10}"><img src="${S(o.n)}" style="display:block;width:100%;height:100%;${o.clip ? `clip-path:${o.clip};` : ''}filter:${halo(3)} drop-shadow(0 3px 3px rgba(50,25,110,.4)) drop-shadow(0 12px 13px rgba(50,25,110,.2))">${o.inner ?? ''}</div>`
}
/** the pale die-cut impression a removed sticker leaves on the backing paper */
const ghost = (o) => {
  const w = o.size ?? 300
  const h = (w * 4) / 3
  return `<div class="a" style="left:${f1(o.cx - w / 2)}px;top:${f1(o.cy - h / 2)}px;width:${w}px;height:${h}px;transform:rotate(${o.rot ?? 0}deg);z-index:${o.z ?? 9}"><img src="${S(o.n)}" style="display:block;width:100%;height:100%;opacity:.95;filter:brightness(0) invert(1) drop-shadow(2px 0 0 #cdbdf2) drop-shadow(-2px 0 0 #cdbdf2) drop-shadow(0 2px 0 #cdbdf2) drop-shadow(0 -2px 0 #cdbdf2) drop-shadow(0 1px 1px rgba(110,80,190,.35))"></div>`
}

/** the peeled corner of sticker 7 (top-left): fold line A-B in 1200x1600 image px, flap = the corner reflected across it */
function peelParts(size) {
  const k = size / 1200
  const A = [96, 430]
  const B = [380, 176]
  const C = [100, 176]
  const dx = B[0] - A[0]
  const dy = B[1] - A[1]
  const L = Math.hypot(dx, dy)
  const ux = dx / L
  const uy = dy / L
  const t = (C[0] - A[0]) * ux + (C[1] - A[1]) * uy
  const foot = [A[0] + ux * t, A[1] + uy * t]
  const Cr = [2 * foot[0] - C[0], 2 * foot[1] - C[1]]
  const left = [0, A[1] - (A[0] * dy) / dx]
  const top = [A[0] - (A[1] * dx) / dy, 0]
  const clip = `polygon(${f1(top[0] * k)}px 0,100% 0,100% 100%,0 100%,0 ${f1(left[1] * k)}px)`
  const pts = [A, B, Cr].map((p) => `${f1(p[0] * k)},${f1(p[1] * k)}`).join(' ')
  const mid = [((A[0] + B[0]) / 2) * k, ((A[1] + B[1]) / 2) * k]
  const far = [Cr[0] * k, Cr[1] * k]
  const w = size
  const h = (size * 4) / 3
  const flap = `<svg class="a" style="left:0;top:0;width:${w}px;height:${h}px;overflow:visible;z-index:3;filter:drop-shadow(1px 3px 3px rgba(40,20,90,.5))" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="pf" gradientUnits="userSpaceOnUse" x1="${f1(mid[0])}" y1="${f1(mid[1])}" x2="${f1(far[0])}" y2="${f1(far[1])}"><stop offset="0" stop-color="#cfc2ee"/><stop offset=".4" stop-color="#fffaf0"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs><polygon points="${pts}" fill="url(#pf)" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>`
  return { clip, flap }
}

/* ---------- washi, rolls, foil stars, labels ---------- */
const TORN = 'polygon(0 6%,3% 0,6% 8%,9% 0,100% 0,97% 14%,100% 28%,97% 42%,100% 56%,97% 70%,100% 84%,97% 100%,9% 100%,6% 92%,3% 100%,0 94%,2% 78%,0 64%,2% 50%,0 36%,2% 22%)'
const PATTERN = {
  stripe: (a, b) => `repeating-linear-gradient(-45deg,${a} 0 11px,${b} 11px 22px)`,
  dots: (a, b) => `radial-gradient(circle at 11px 11px,${b} 4.5px,transparent 5.5px) 0 0/22px 22px,${a}`,
  check: (a, b) => `conic-gradient(${a} 25%,${b} 0 50%,${a} 0 75%,${b} 0) 0 0/24px 24px`,
}
const washi = (o) => {
  const w = o.w ?? 170
  const h = o.h ?? 46
  return `<div class="a" style="left:${o.x - w / 2}px;top:${o.y - h / 2}px;width:${w}px;height:${h}px;transform:rotate(${o.rot ?? -6}deg);background:${o.bg};opacity:.9;z-index:${o.z ?? 30};clip-path:${TORN};box-shadow:0 1px 1px rgba(16,24,32,.15)"></div>`
}
function roll(o) {
  const d = o.d ?? 190
  const th = Math.round(d * 0.3)
  const tailLen = o.tail ?? 250
  const core = d * 0.4
  const hole = d * 0.2
  const tail = `<div class="a" style="left:${d * 0.5}px;top:${d - th * 0.82}px;width:${tailLen}px;height:${th}px;transform:rotate(${o.tailRot ?? 3}deg);transform-origin:0 50%;background:${o.bg};clip-path:polygon(0 0,100% 0,96% 12%,100% 25%,96% 38%,100% 50%,96% 62%,100% 75%,96% 88%,100% 100%,0 100%);box-shadow:0 2px 2px rgba(16,24,32,.2);z-index:1"></div>`
  const disc = `<div class="a" style="left:0;top:0;width:${d}px;height:${d}px;border-radius:50%;background:repeating-radial-gradient(circle,rgba(255,255,255,.4) 0 1.5px,rgba(0,0,0,.05) 1.5px 4px),${o.base};box-shadow:0 2px 3px rgba(16,24,32,.28),0 14px 22px -6px rgba(16,24,32,.45),inset 0 0 0 4px rgba(255,255,255,.35);z-index:2"></div>`
  const ringCore = `<div class="a" style="left:${(d - core) / 2}px;top:${(d - core) / 2}px;width:${core}px;height:${core}px;border-radius:50%;background:radial-gradient(circle,#b89868 0 30%,#d7bb8b 31% 100%);box-shadow:inset 0 0 0 3px rgba(120,80,30,.35),0 1px 2px rgba(0,0,0,.3);z-index:3"></div>`
  const holeEl = `<div class="a" style="left:${(d - hole) / 2}px;top:${(d - hole) / 2}px;width:${hole}px;height:${hole}px;border-radius:50%;background:radial-gradient(circle at 50% 30%,#6a55b0,#3c2c78);box-shadow:inset 0 4px 6px rgba(0,0,0,.55),0 1px 0 rgba(255,255,255,.4);z-index:4"></div>`
  return grp({ x: o.cx - d / 2, y: o.cy - d / 2, w: d, h: d, rot: o.rot ?? 0, z: o.z ?? 24, inner: tail + disc + ringCore + holeEl })
}
const starPath = (cx, cy, R, r, rot = -90) => {
  const p = []
  for (let i = 0; i < 10; i++) {
    const a = ((rot + i * 36) * Math.PI) / 180
    const rr = i % 2 ? r : R
    p.push(`${f1(cx + rr * Math.cos(a))},${f1(cy + rr * Math.sin(a))}`)
  }
  return p.join(' ')
}
function starSheet(o) {
  const cols = 6
  const rows = 4
  const w = o.w
  const h = o.h
  const gx = (w - 36) / cols
  const gy = (h - 36) / rows
  const colors = ['#FFD23F', '#FF9FC5', '#85CEF9', '#8EEBC3', '#C6B1FE', '#FF7D6C', '#FCE67A', '#66CBC7']
  const missing = new Set(o.missing ?? [])
  let s = ''
  let i = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++, i++) {
      const cx = 18 + gx * (c + 0.5)
      const cy = 18 + gy * (r + 0.5)
      if (missing.has(i)) {
        s += `<polygon points="${starPath(cx, cy, 19, 9, -90)}" fill="#fff" stroke="#d5c8f3" stroke-width="2.5" stroke-linejoin="round" opacity=".9"/>`
        continue
      }
      const rot = -90 + ((i * 17) % 24) - 12
      s += `<polygon points="${starPath(cx, cy, 21, 10.5, rot)}" fill="#fffaf0" stroke="#fffaf0" stroke-width="5" stroke-linejoin="round"/><polygon points="${starPath(cx, cy, 18, 8.6, rot)}" fill="${colors[(i * 3) % colors.length]}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>`
    }
  }
  const holo = 'conic-gradient(from 20deg at 50% 50%,#ffc6ee,#c4e8ff,#d3ffe0,#fff2ae,#e1c6ff,#ffc6ee)'
  return grp({
    x: o.x, y: o.y, w, h, rot: o.rot ?? 0, z: o.z ?? 16,
    extra: `border-radius:10px;background:${holo};box-shadow:${SHADOW.lift}`,
    inner: `<div class="a" style="inset:7px;border-radius:5px;background:#fffaf0"></div><div class="a" style="inset:0;border-radius:10px;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.55) 40%,transparent 50%);mix-blend-mode:screen"></div><svg class="a" style="left:0;top:0" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${s}</svg>`,
  })
}
const priceLabel = (x, y, t, c, rot, w = 108) =>
  grp({ x, y, w, h: 66, rot, z: 22, extra: `background:${c};border-radius:8px;box-shadow:0 1px 1px rgba(16,24,32,.25),0 5px 8px -2px rgba(16,24,32,.3);border:2px solid rgba(255,255,255,.55)`, inner: `<div class="a" style="left:0;top:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;font:700 40px/1 'Courier Prime';color:${INK};letter-spacing:-.02em">${t}</div><div class="a" style="left:7px;top:6px;width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.55)"></div>` })

/** a pencil lying on the page. x, y = top left of the grp, len */
const pencil = (o) => {
  const len = o.len ?? 330
  return grp({
    x: o.x, y: o.y, w: len, h: 34, rot: o.rot ?? -4, z: o.z ?? 24,
    extra: 'filter:drop-shadow(2px 6px 4px rgba(30,15,80,.42))',
    inner: [
      `<div class="a" style="left:0;top:2px;width:36px;height:30px;border-radius:9px 3px 3px 9px;background:linear-gradient(180deg,#ffb6d2,#ff8fb8 60%,#e86d9d)"></div>`,
      `<div class="a" style="left:34px;top:0;width:30px;height:34px;background:repeating-linear-gradient(90deg,#8b91a2 0 3px,#eef0f6 3px 6px,#aab0c0 6px 9px)"></div>`,
      `<div class="a" style="left:62px;top:0;width:${len - 62 - 74}px;height:34px;background:linear-gradient(180deg,#5b35c9 0,#8d6cf0 22%,#b79cff 50%,#8d6cf0 78%,#4b2aa8 100%)"></div>`,
      `<div class="a" style="left:${len - 76}px;top:0;width:58px;height:34px;background:linear-gradient(180deg,#e9c690,#f6dcae 50%,#d3a96d);clip-path:polygon(0 0,100% 36%,100% 64%,0 100%)"></div>`,
      `<div class="a" style="left:${len - 24}px;top:11px;width:24px;height:12px;background:#2b2230;clip-path:polygon(0 0,100% 38%,100% 62%,0 100%)"></div>`,
    ].join(''),
  })
}
/** a tiny die-cut star with a white halo, for scattering */
const spark = (x, y, s, c, rot = 0, z = 20) =>
  `<svg class="a" style="left:${x - s / 2}px;top:${y - s / 2}px;width:${s}px;height:${s}px;transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(0 2px 2px rgba(50,25,110,.4))" viewBox="0 0 60 60"><polygon points="${starPath(30, 31, 28, 14, -90)}" fill="#fffaf0" stroke="#fffaf0" stroke-width="6" stroke-linejoin="round"/><polygon points="${starPath(30, 31, 24, 11.5, -90)}" fill="${c}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/></svg>`

/* ---------- binder pieces ---------- */
const RING_YS = [250, 675, 1100]
const ringLoop = (cx, cy) =>
  `<svg class="a" style="left:${cx - 74}px;top:${cy - 38}px;width:148px;height:76px;z-index:40;filter:drop-shadow(3px 6px 4px rgba(30,10,80,.5))" viewBox="0 0 148 76"><defs><linearGradient id="ch${cy}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#7c8294"/><stop offset=".28" stop-color="#f7f8fc"/><stop offset=".55" stop-color="#aeb4c4"/><stop offset=".82" stop-color="#eceff5"/><stop offset="1" stop-color="#7b8193"/></linearGradient></defs><rect x="9" y="11" width="130" height="54" rx="27" fill="none" stroke="url(#ch${cy})" stroke-width="13"/><path d="M56 17 H92" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".75"/></svg>`
const holeDisc = (x, y, d = 34, z = 12) => `<div class="a" style="left:${x - d / 2}px;top:${y - d / 2}px;width:${d}px;height:${d}px;border-radius:50%;background:radial-gradient(circle at 45% 35%,#7a5fd0,#4a3396 70%);box-shadow:inset 0 3px 4px rgba(0,0,0,.55),0 1px 0 rgba(255,255,255,.55);z-index:${z}"></div>`
/** the clear sleeve page: slivers of the pages beneath, shell, cream dot-grid card, punched strip with holes, glare */
function sleevePage(o) {
  const strip = 50
  const slivers = [0, 1, 2].map((i) => `<div class="a" style="left:${o.x - 22 + i * 9}px;top:${o.y + 14 + i * 7}px;width:${o.w}px;height:${o.h - 28 - i * 14}px;border-radius:14px;z-index:${4 + i * 0.1};background:rgba(255,255,255,.3);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.65),2px 2px 5px rgba(40,10,110,.3)"></div>`).join('')
  const shell = `<div class="a" style="left:${o.x}px;top:${o.y}px;width:${o.w}px;height:${o.h}px;border-radius:18px;z-index:6;background:linear-gradient(165deg,rgba(255,255,255,.62),rgba(255,255,255,.38));box-shadow:0 2px 3px rgba(40,20,100,.35),0 20px 34px -8px rgba(40,10,110,.55),inset 0 0 0 2px rgba(255,255,255,.8),inset 0 0 26px rgba(255,255,255,.4)"></div>`
  const card = `<div class="a" style="left:${o.x + strip}px;top:${o.y + 18}px;width:${o.w - strip - 18}px;height:${o.h - 36}px;border-radius:6px;z-index:7;background:radial-gradient(circle,rgba(150,110,230,.34) 2.4px,transparent 3px) 0 0/36px 36px,linear-gradient(180deg,#fff7e4,#fdeecf);box-shadow:inset 0 0 0 1.5px rgba(150,120,225,.28),0 1px 3px rgba(40,20,100,.25)"></div>`
  const holes = RING_YS.map((y) => holeDisc(o.x + 25, y)).join('')
  const glare = `<div class="a" style="left:${o.x}px;top:${o.y}px;width:${o.w}px;height:${o.h}px;border-radius:18px;z-index:17;pointer-events:none;background:linear-gradient(128deg,transparent 0 22%,rgba(255,255,255,.3) 28%,rgba(255,255,255,.04) 36%,transparent 42%,rgba(255,255,255,.18) 60%,transparent 68%)"></div>`
  return slivers + shell + card + holes + glare
}

export default function () {
  const peel = peelParts(300)
  const body = [
    // vinyl texture, gloss and the stitched edge
    `<div class="a" style="inset:0;z-index:1;background-image:url('data:image/svg+xml,${PEBBLE}');mix-blend-mode:multiply;opacity:.5"></div>`,
    `<div class="a" style="inset:0;z-index:1;background:linear-gradient(118deg,transparent 18%,rgba(255,255,255,.2) 26%,transparent 34%,transparent 70%,rgba(255,255,255,.12) 78%,transparent 86%)"></div>`,
    `<div class="a" style="inset:12px;z-index:2;border:4px dashed rgba(255,246,230,.8);border-radius:22px"></div>`,
    // the spine: crease, metal plate, rivets, three rings
    `<div class="a" style="left:20px;top:0;width:110px;height:1350px;z-index:3;background:linear-gradient(90deg,rgba(35,10,100,0),rgba(35,10,100,.5) 40%,rgba(35,10,100,.6) 55%,rgba(35,10,100,0))"></div>`,
    `<div class="a" style="left:58px;top:120px;width:34px;height:1110px;z-index:4;border-radius:6px;background:linear-gradient(90deg,#9aa0b0,#f5f7fb 28%,#bcc2d0 55%,#e9ecf3 78%,#7e8496);box-shadow:3px 3px 6px rgba(20,5,70,.55),inset 0 0 0 1.5px rgba(255,255,255,.6)"></div>`,
    ...[140, 1210].map((y) => `<div class="a" style="left:66px;top:${y - 9}px;width:18px;height:18px;z-index:5;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#9097a8 70%);box-shadow:0 1px 2px rgba(0,0,0,.5)"></div>`),
    sleevePage({ x: 100, y: 30, w: 948, h: 1290 }),
    ...RING_YS.map((y) => ringLoop(75, y)),

    // ---------- top (y < 430): catalog strip, tiny stars, labels, washi ----------
    pic({ src: art('catalog-sketch.webp'), x: 168, y: 78, w: 556, h: 166, rot: -2.2, border: 8, bc: '#fffaf0', z: 14, shadow: SHADOW.lift }),
    washi({ x: 186, y: 86, w: 150, rot: -38, bg: PATTERN.stripe('#FF9FC5', '#ffd3e6'), z: 30 }),
    washi({ x: 704, y: 232, w: 150, rot: -34, bg: PATTERN.dots('#85CEF9', '#fffaf0'), z: 30 }),
    starSheet({ x: 752, y: 62, w: 284, h: 196, rot: 3.5, missing: [3, 8, 13, 14, 20], z: 15 }),
    priceLabel(176, 292, '€1', '#FFE14D', -6),
    priceLabel(296, 306, '€2', '#FF7AB0', 4),
    priceLabel(416, 294, '€1', '#7BE3FF', -3),
    priceLabel(536, 312, '€3', '#B6F26B', 6),
    roll({ cx: 905, cy: 340, d: 130, rot: 180, base: '#8EEBC3', bg: PATTERN.dots('#8EEBC3', '#fffaf0'), tail: 190, tailRot: 5, z: 23 }),
    pencil({ x: 168, y: 388, len: 340, rot: -3 }),
    stamp({ x: 628, y: 392, t: 'CONCEPT', size: 48, c: '#5a2fc8', rot: -6, z: 36 }),
    `<div class="t" style="left:236px;top:424px;font:400 48px/1 'Gochi Hand';color:#5a2fc8;transform:rotate(-7deg);z-index:30">peel me!</div>`,
    `<svg class="a" style="left:396px;top:428px;width:140px;height:84px;z-index:30;transform:rotate(14deg)" viewBox="0 0 160 90"><path d="M6 20 C 50 6, 100 20, 138 62 M112 56 L140 66 L136 36" fill="none" stroke="#5a2fc8" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    ring({ x: 470, y: 905, d: 170, rot: 20, z: 8 }),
    spark(1004, 440, 54, '#FFD23F', 12, 21),
    spark(150, 470, 44, '#FF9FC5', -10, 21),
    spark(1010, 905, 50, '#85CEF9', 8, 21),
    spark(600, 905, 40, '#8EEBC3', -14, 21),
    spark(122, 910, 46, '#FFD23F', 14, 21),

    // ---------- the band (y 470 to 880): five real die-cut stickers on the page ----------
    stk({ n: 1, cx: 246, cy: 668, size: 270, rot: -6, z: 12 }),
    stk({ n: 4, cx: 420, cy: 704, size: 262, rot: 4, z: 13 }),
    stk({ n: 7, cx: 598, cy: 672, size: 300, rot: -3, z: 14, clip: peel.clip, inner: peel.flap }),
    stk({ n: 5, cx: 778, cy: 704, size: 262, rot: 5, z: 13 }),
    stk({ n: 6, cx: 944, cy: 666, size: 262, rot: -4, z: 12 }),

    // ---------- bottom (y > 920): liner with ghost shapes, pack bag, washi, note ----------
    grp({
      x: 150, y: 950, w: 470, h: 330, rot: -3, z: 14,
      extra: 'border-radius:8px;background:linear-gradient(170deg,#efe8ff,#d9ccfa);box-shadow:0 1px 2px rgba(40,20,100,.35),0 14px 24px -6px rgba(40,20,100,.45)',
      inner: [
        `<div class="a" style="inset:10px;border-radius:5px;border:2.5px dashed rgba(120,90,210,.5)"></div>`,
        ghost({ n: 2, cx: 118, cy: 168, size: 200, rot: -4, z: 2 }),
        ghost({ n: 3, cx: 290, cy: 176, size: 200, rot: 5, z: 2 }),
      ].join(''),
    }),
    grp({
      x: 640, y: 952, w: 400, h: 330, rot: 5, z: 21,
      extra: 'filter:drop-shadow(0 4px 4px rgba(30,10,80,.35)) drop-shadow(0 16px 18px rgba(30,10,80,.3))',
      inner: [
        `<div class="a" style="left:0;top:34px;width:400px;height:296px;border-radius:10px;background:linear-gradient(160deg,#efe6ff,#d6c6fb);z-index:1;box-shadow:inset 0 0 0 2px rgba(255,255,255,.7)"></div>`,
        stk({ n: 9, cx: 296, cy: 206, size: 190, rot: 9, z: 2 }),
        stk({ n: 3, cx: 106, cy: 204, size: 192, rot: -8, z: 3 }),
        stk({ n: 2, cx: 200, cy: 212, size: 192, rot: 2, z: 4 }),
        `<div class="a" style="left:0;top:34px;width:400px;height:296px;border-radius:10px;z-index:6;background:linear-gradient(118deg,rgba(255,255,255,.55) 0 18%,rgba(255,255,255,.14) 30%,rgba(255,255,255,.34) 44%,rgba(255,255,255,.12) 60%,rgba(255,255,255,.4) 100%);box-shadow:inset 0 0 0 3px rgba(255,255,255,.75)"></div>`,
        `<div class="a" style="left:-4px;top:0;width:408px;height:112px;z-index:8;border-radius:8px 8px 4px 4px;background:linear-gradient(180deg,#FCE67A,#f6d94f);box-shadow:0 3px 4px rgba(30,10,80,.3)"><div class="a" style="left:0;bottom:0;width:100%;height:12px;border-radius:0 0 4px 4px;background:linear-gradient(90deg,#ffb8ea,#b8e4ff,#c8ffd8,#fff0a0,#dcb8ff,#ffb8ea,#b8e4ff)"></div><div class="a" style="left:0;top:0;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;font:400 52px/1 'Cherry Bomb One';color:${INK};letter-spacing:.01em">STICKER PACK<span style="font:700 24px/1.2 'Courier Prime';letter-spacing:.14em;margin-top:6px">9 DIE-CUTS · NO. 10</span></div><div class="a" style="left:176px;top:-6px;width:60px;height:14px;background:#85CEF9;opacity:.85;clip-path:${TORN}"></div></div>`,
      ].join(''),
    }),
    roll({ cx: 250, cy: 1250, d: 170, rot: 0, base: '#FF9FC5', bg: PATTERN.stripe('#FF9FC5', '#ffd3e6'), tail: 210, tailRot: 8, z: 22 }),
    sticky({ x: 452, y: 1120, s: 190, rot: 7, c: '#FFE0F0', t: 'swap?<br>2 for 1!', size: 42, z: 26 }),
  ].join('')
  return { bg: 'radial-gradient(120% 70% at 22% 4%,rgba(255,255,255,.3),transparent 60%),radial-gradient(90% 60% at 92% 100%,rgba(50,15,140,.4),transparent 62%),#a98cf8', body }
}
