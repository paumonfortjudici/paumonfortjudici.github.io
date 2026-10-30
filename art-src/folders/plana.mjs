// Folder 02, Plana Digital: a brand-manual RING BINDER opened flat on a wheat-yellow cutting mat. Swiss white sheets on steel rings, colour
// divider tabs, the construction drawing of the symbol on the left page, the lockup + a pen-marked website printout on the right,
// a fan of Pantone-style colour chips, a stack of business cards, a fabric (tee) swatch, a sheet of die-cut stickers, a steel ruler, a pencil.
// Identity (lockup, symbol, printout) sits in y 460..880; everything above and below is desk clutter and binder.
import { pub, sheet, text, clip, tape, stamp, ring, hole, SHADOW } from './lib.mjs'

const C = { paper: '#F7F2E8', poppy: '#E5502F', wheat: '#F2CF6B', oak: '#1E4634', night: '#18181B', field: '#2E6A4F' }
const logo = (n) => pub(`works/plana/logo/plana-digital-${n}.svg`)
const man = (n) => pub(`works/plana/manual/m-${n}.webp`)
const brd = (n) => pub(`works/plana/board/${n}.webp`)
const web = (n) => pub(`works/plana/web/${n}.webp`)

/** a crop of a bitmap, printed: (cx, cy, cw) = the source window, w x h = size on paper, iw x ih = source natural size */
const crop = (o) => {
  const k = o.w / o.cw
  return `<div class="a" style="left:${o.x}px;top:${o.y}px;width:${o.w}px;height:${o.h}px;overflow:hidden;transform:rotate(${o.rot ?? 0}deg);z-index:${o.z ?? 5};box-shadow:${o.shadow ?? '0 0 0 1px rgba(24,24,27,.16)'};background:${o.bg ?? '#f4ece4'}"><img src="${o.src}" style="position:absolute;left:${-o.cx * k}px;top:${-o.cy * k}px;width:${o.iw * k}px;height:${o.ih * k}px;display:block" alt=""></div>`
}
const im = (src, x, y, w, h, extra = '') => `<img class="a" src="${src}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}" alt="">`
/** a red-pen mark: any path in a 160x90 viewBox, stretched to w x h */
const scrawl = (o) => `<svg class="a" style="left:${o.x}px;top:${o.y}px;width:${o.w}px;height:${o.h}px;transform:rotate(${o.rot ?? 0}deg);z-index:${o.z ?? 40};overflow:visible" viewBox="0 0 160 90" preserveAspectRatio="none"><path d="${o.d}" fill="none" stroke="${o.c ?? '#D92B1F'}" stroke-width="${o.sw ?? 4}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`
const CIRCLE = 'M80 6 C 130 4, 156 30, 148 56 C 138 82, 60 84, 24 62 C -2 40, 24 10, 82 8 C 110 6, 130 14, 138 24'
const ARROW = 'M6 70 C 40 20, 90 10, 140 40 M118 18 L142 42 L108 52'

/** pinked (zig-zag) edge for the fabric swatch */
const zig = (w, h, s = 14, a = 7) => {
  const p = []
  for (let x = 0; x <= w; x += s) p.push(`${x}px ${(x / s) % 2 ? a : 0}px`)
  for (let y = 0; y <= h; y += s) p.push(`${(y / s) % 2 ? w - a : w}px ${y}px`)
  for (let x = w; x >= 0; x -= s) p.push(`${x}px ${((w - x) / s) % 2 ? h - a : h}px`)
  for (let y = h; y >= 0; y -= s) p.push(`${((h - y) / s) % 2 ? a : 0}px ${y}px`)
  return `polygon(${p.join(',')})`
}

const grid = (n) => Array.from({ length: n }, (_, i) => i)

export default function () {
  const PW = 452
  const PH = 660
  const LX = 70
  const RX = 558
  const PY = 345
  const CW = 380 // content width on a page
  const RING_Y = [444, 675, 906]
  const pageShadow = '0 1px 1px rgba(0,0,0,.35), 0 8px 16px -4px rgba(0,0,0,.5)'

  // ---------- the cutting mat (desk) ----------
  const mat = [
    `<div class="a" style="inset:0;z-index:0;background:
      radial-gradient(ellipse at 50% 45%,rgba(255,255,255,.18),rgba(255,255,255,0) 62%),
      repeating-linear-gradient(0deg,rgba(124,82,8,.34) 0 2px,transparent 2px 135px),
      repeating-linear-gradient(90deg,rgba(124,82,8,.34) 0 2px,transparent 2px 135px),
      repeating-linear-gradient(0deg,rgba(124,82,8,.17) 0 1px,transparent 1px 27px),
      repeating-linear-gradient(90deg,rgba(124,82,8,.17) 0 1px,transparent 1px 27px),
      #EDC660"></div>`,
    `<div class="a" style="inset:0;z-index:1;background:radial-gradient(ellipse at 50% 50%,rgba(0,0,0,0) 55%,rgba(110,64,0,.28) 100%)"></div>`,
    ...grid(9).map((i) => text({ x: i * 135 + 8, y: 6, t: String(i * 5), font: 'DM Mono', size: 16, c: 'rgba(110,64,0,.55)', z: 1 })),
    ...grid(11).map((i) => text({ x: 6, y: i * 135 + 8, t: String(i * 5), font: 'DM Mono', size: 16, c: 'rgba(110,64,0,.55)', z: 1 })),
    `<svg class="a" style="left:0;top:0;width:1080px;height:1350px;z-index:1" viewBox="0 0 1080 1350">${[0, 15, 30, 45, 60, 75, 90].map((a) => { const r = (a * Math.PI) / 180; return `<line x1="1080" y1="1350" x2="${1080 - 460 * Math.cos(r)}" y2="${1350 - 460 * Math.sin(r)}" stroke="rgba(124,82,8,.3)" stroke-width="2"/><text x="${1080 - 484 * Math.cos(r)}" y="${1350 - 484 * Math.sin(r)}" font-family="DM Mono" font-size="17" fill="rgba(110,64,0,.55)">${a}</text>` }).join('')}<path d="M620 1350 A460 460 0 0 1 1080 890" fill="none" stroke="rgba(124,82,8,.3)" stroke-width="2"/><path d="M700 1350 A380 380 0 0 1 1080 970" fill="none" stroke="rgba(124,82,8,.24)" stroke-width="2"/></svg>`,
  ].join('')

  // ---------- the binder (everything in here tilts together) ----------
  const board = [
    `<div class="a" style="left:14px;top:290px;width:1052px;height:770px;border-radius:18px;z-index:1;background:radial-gradient(ellipse at 30% 20%,#34343a,#1c1c20 60%,#141417);box-shadow:0 2px 2px rgba(0,0,0,.4),0 22px 38px -8px rgba(60,35,0,.55),inset 0 0 0 2px rgba(255,255,255,.07)"></div>`,
    `<div class="a" style="left:26px;top:302px;width:1028px;height:746px;border-radius:10px;border:2px dashed rgba(255,255,255,.2);z-index:2"></div>`,
  ].join('')

  const stacks = [3, 2, 1].map((k) => sheet({ x: LX - k * 4, y: PY + k * 3, w: PW, h: PH, c: k === 3 ? '#e4e1d6' : k === 2 ? '#ece9de' : '#f3f0e6', z: 3, shadow: '0 1px 1px rgba(0,0,0,.3)', r: 2 })).join('')

  // dividers under the right page, the tabs poke out on the right
  const dividers = [
    ['LOGO', C.poppy, '#fff', 470],
    ['COLOUR', C.wheat, C.night, 562],
    ['TYPE', C.field, C.paper, 654],
    ['WEB', '#fbf8ee', C.night, 746],
  ]
  const tabs = dividers
    .map(([label, col, ink, y], i) => {
      const off = 4 * (4 - i)
      const left = RX + PW - 2 + off
      return (
        sheet({ x: RX + off, y: PY + 2 + (3 - i), w: PW, h: PH, c: col, z: 3, shadow: '0 1px 1px rgba(0,0,0,.35)', r: 2 }) +
        `<div class="a" style="left:${left}px;top:${y}px;width:${1060 - left}px;height:84px;background:${col};border-radius:0 12px 12px 0;z-index:3;box-shadow:2px 3px 5px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding-left:${off > 8 ? 8 : 0}px"><div style="writing-mode:vertical-rl;font:500 17px/1 'DM Mono';letter-spacing:.14em;color:${ink}">${label}</div></div>`
      )
    })
    .reverse() // the first divider is the nearest one: drawn last
    .join('')

  // ---- left page: the symbol, constructed ----
  const leftInner = [
    text({ x: 24, y: 24, t: 'PLANA DIGITAL · BRAND MANUAL', font: 'DM Mono', size: 13, ls: '.08em', c: '#77776f' }),
    text({ x: 380, y: 24, t: '03', font: 'DM Mono', size: 13, c: '#77776f' }),
    text({ x: 24, y: 76, t: '03 · THE SYMBOL', font: 'DM Mono', size: 16, ls: '.06em', c: C.poppy }),
    text({ x: 24, y: 104, t: 'A sunrise inside<br>the browser.', font: 'Sora', weight: 800, size: 34, lh: 1.02, c: C.oak, ls: '-.02em' }),
    crop({ src: man('04'), iw: 1600, ih: 1000, cx: 100, cy: 215, cw: 780, x: 24, y: 188, w: CW, h: 312, z: 5, bg: '#f4ece4' }),
    crop({ src: brd('process-three-days'), iw: 1200, ih: 258, cx: 120, cy: 26, cw: 960, x: 24, y: 516, w: CW, h: 82, z: 5, bg: '#ecca64' }),
    text({ x: 24, y: 626, t: 'V2.0 · OCT 2026', font: 'DM Mono', size: 13, ls: '.08em', c: '#77776f' }),
    `<div class="a" style="inset:0;z-index:50;background:linear-gradient(90deg,rgba(20,20,10,0) 80%,rgba(20,20,10,.17));pointer-events:none"></div>`,
  ].join('')

  // ---- right page: the lockup, the promise, a marked-up website printout ----
  const rightInner = [
    text({ x: 44, y: 24, t: 'PLANA DIGITAL · BRAND MANUAL', font: 'DM Mono', size: 13, ls: '.08em', c: '#77776f' }),
    text({ x: 44, y: 76, t: '04 · LOGO + WEB', font: 'DM Mono', size: 16, ls: '.06em', c: C.poppy }),
    im(logo('horizontal'), 44, 126, CW, 74.2),
    text({ x: 44, y: 212, t: 'Webs llestes en 72 hores.', font: 'Sora', weight: 800, size: 27, c: C.poppy, ls: '-.02em' }),
    text({ x: 44, y: 246, t: 'WEBSITES READY IN 72 HOURS', font: 'DM Mono', size: 12, ls: '.12em', c: '#77776f' }),
    crop({ src: web('home-desktop-01'), iw: 1440, ih: 1857, cx: 0, cy: 0, cw: 1440, x: 44, y: 272, w: CW, h: 252, z: 5, bg: '#f4f0e7', shadow: '0 0 0 1px rgba(24,24,27,.2), 0 3px 8px -2px rgba(0,0,0,.35)' }),
    crop({ src: brd('palette'), iw: 1200, ih: 326, cx: 0, cy: 78, cw: 1200, x: 44, y: 544, w: CW, h: 68, rot: 1, z: 6, bg: '#f4ece4', shadow: '0 0 0 1px rgba(24,24,27,.14), 0 3px 6px -2px rgba(0,0,0,.3)' }),
    `<div class="a" style="inset:0;z-index:50;background:linear-gradient(270deg,rgba(20,20,10,0) 80%,rgba(20,20,10,.17));pointer-events:none"></div>`,
  ].join('')

  const pages =
    sheet({ x: LX, y: PY, w: PW, h: PH, c: '#FBF8F0', z: 6, shadow: pageShadow, r: 2, inner: leftInner }) +
    sheet({ x: RX, y: PY, w: PW, h: PH, c: '#FBF8F0', z: 6, shadow: pageShadow, r: 2, inner: rightInner })

  // steel spine plate + the three rings + punch holes
  const plate = `<div class="a" style="left:522px;top:296px;width:36px;height:758px;z-index:8;background:linear-gradient(90deg,#6f757b,#d6dadd 30%,#f3f5f6 50%,#a2a9af 75%,#5d636a);box-shadow:0 0 8px rgba(0,0,0,.55),inset 0 0 0 1px rgba(255,255,255,.25)"></div>`
  const rivets = [372, 560, 790, 980].map((y) => `<div class="a" style="left:531px;top:${y - 9}px;width:18px;height:18px;border-radius:50%;z-index:9;background:radial-gradient(circle at 35% 30%,#fff,#9aa1a8 60%,#575d63);box-shadow:0 1px 2px rgba(0,0,0,.6)"></div>`).join('')
  const rings = RING_Y.map(
    (y) =>
      hole(LX + PW - 24, y, 32, 7) +
      hole(RX + 24, y, 32, 7) +
      `<svg class="a" style="left:470px;top:${y - 16}px;width:140px;height:32px;z-index:12;filter:drop-shadow(0 5px 3px rgba(0,0,0,.5))" viewBox="0 0 140 32"><defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fafbfc"/><stop offset=".4" stop-color="#aeb4ba"/><stop offset="1" stop-color="#5b6168"/></linearGradient></defs><rect x="2" y="5" width="136" height="22" rx="11" fill="url(#rg)"/><rect x="14" y="9" width="104" height="4" rx="2" fill="rgba(255,255,255,.8)"/><rect x="2" y="5" width="136" height="22" rx="11" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="1"/></svg>`,
  ).join('')

  // things stuck on the pages (inside the tilt)
  const onPages = [
    clip({ x: LX + 372, y: PY - 28, h: 118, rot: 8, c: C.poppy, z: 20 }),
    tape({ x: RX + 44 + CW, y: PY + 274, w: 100, rot: 42, c: 'rgba(242,207,107,.85)', z: 22 }),
    tape({ x: RX + 46, y: PY + 524, w: 100, rot: 42, c: 'rgba(242,207,107,.85)', z: 22 }),
    // red pen on the printout: circle the promise
    scrawl({ x: RX + 54, y: PY + 372, w: 168, h: 50, d: CIRCLE, rot: -2, sw: 4.5, z: 40 }),
    // a sticky on the printout's corner with a note and an arrow to the sun
    sheet({ x: RX + 258, y: PY + 438, w: 150, h: 96, rot: 5, c: '#F6DB72', z: 41, shadow: SHADOW.flat, r: 1, extra: 'padding:10px 12px;', inner: `<div style="font:400 29px/1.02 'Gochi Hand';color:#2a2a3a;transform:rotate(-2deg)">the sun =<br>the promise</div>` }),
    scrawl({ x: RX + 296, y: PY + 372, w: 58, h: 62, d: ARROW, rot: -18, sw: 3.6, z: 42 }),
    // stamp + note on the left page
    stamp({ x: LX + 206, y: PY + 192, t: 'APPROVED', font: 'Courier Prime', size: 34, c: C.oak, rot: -8, z: 45 }),
    text({ x: LX + 306, y: PY + 100, t: '3 dots =<br>3 days!', font: 'Gochi Hand', size: 30, lh: 1, c: '#D92B1F', rot: 5, z: 41 }),
  ].join('')

  const binder = `<div class="a" style="left:0;top:0;width:1080px;height:1350px;transform:rotate(-1.8deg);transform-origin:540px 675px;z-index:4">${board}${stacks}${tabs}${pages}${plate}${rivets}${rings}${onPages}</div>`

  // ---------- top zone: business cards, a sticky note, the colour-chip fan ----------
  const biz = (o) => `<div class="a paper-tex" style="left:${o.x}px;top:${o.y}px;width:300px;height:172px;transform:rotate(${o.rot}deg);z-index:${o.z};background-color:${o.c};border-radius:6px;box-shadow:0 1px 0 rgba(0,0,0,.28),0 4px 0 -1px rgba(0,0,0,.1),0 16px 22px -8px rgba(24,24,27,.5);overflow:hidden">${o.inner}</div>`
  const cards = [
    biz({ x: 26, y: 112, rot: -15, z: 6, c: C.wheat, inner: im(logo('vertical'), 24, 16, 100, 140) + text({ x: 150, y: 56, t: 'Estudi<br>web', font: 'Sora', weight: 800, size: 30, lh: 1, c: C.night }) + text({ x: 150, y: 128, t: 'ESTUDI WEB', font: 'DM Mono', size: 11, ls: '.1em', c: C.night }) }),
    biz({ x: 100, y: 22, rot: 9, z: 7, c: C.oak, inner: im(logo('horizontal-reversed'), 32, 50, 236, 46) + text({ x: 32, y: 124, t: 'planadigital.cat', font: 'DM Mono', size: 15, ls: '.06em', c: C.wheat }) }),
    biz({
      x: 92, y: 84, rot: -4, z: 8, c: '#FBF8F0',
      inner: im(logo('horizontal'), 22, 24, 190, 37.1) + im(logo('symbol'), 226, 18, 58, 53) +
        text({ x: 22, y: 92, t: 'ESTUDI WEB · CARDEDEU', font: 'DM Mono', size: 11, ls: '.08em', c: '#77776f' }) +
        text({ x: 22, y: 114, t: 'pau@planadigital.cat', font: 'DM Mono', size: 15, c: C.night }) +
        text({ x: 22, y: 136, t: '+34 697 512 258', font: 'DM Mono', size: 15, c: C.night }) +
        `<div class="a" style="left:0;bottom:0;width:100%;height:10px;background:${C.poppy}"></div>`,
    }),
    clip({ x: 350, y: 70, h: 104, rot: 12, c: C.oak, z: 20 }),
  ].join('')

  const sticky1 = sheet({ x: 420, y: 60, w: 160, h: 160, rot: -6, c: C.poppy, z: 9, shadow: SHADOW.flat, r: 1, extra: 'padding:14px;', inner: `<div style="font:400 35px/1.06 'Gochi Hand';color:#fff6e4;transform:rotate(-2deg)">72 h =<br>3 sunrises</div>` })

  const chipData = [
    ['Poppy', 'E5502F', C.poppy, 'PD 01'],
    ['Wheat', 'F2CF6B', C.wheat, 'PD 02'],
    ['Holm oak', '1E4634', C.oak, 'PD 03'],
    ['Paper', 'F7F2E8', C.paper, 'PD 04'],
    ['Night', '18181B', C.night, 'PD 05'],
  ]
  const FANX = 826
  const FANY = 376
  const angles = [-52, -30, -8, 14, 36]
  const fan = chipData
    .map(
      ([name, hex, col, code], i) =>
        `<div class="a" style="left:${FANX - 60}px;top:${FANY - 312}px;width:120px;height:332px;transform:rotate(${angles[i]}deg);transform-origin:60px 312px;background:#FBF8EE;border-radius:8px;z-index:${10 + i};box-shadow:0 2px 3px rgba(24,24,27,.3),0 10px 16px -6px rgba(24,24,27,.4)">` +
        text({ x: 10, y: 10, t: name, font: 'Sora', weight: 800, size: 18, c: C.night, ls: '-.01em' }) +
        text({ x: 10, y: 34, t: hex, font: 'DM Mono', size: 14, c: '#44443f' }) +
        text({ x: 10, y: 54, t: code, font: 'DM Mono', size: 11, ls: '.1em', c: '#8a8a82' }) +
        `<div class="a" style="left:8px;top:76px;width:104px;height:224px;background:${col};border-radius:4px;${col === C.paper ? 'box-shadow:inset 0 0 0 1.5px rgba(24,24,27,.2);' : ''}"></div>` +
        `</div>`,
    )
    .join('')
  const bolt = `<div class="a" style="left:${FANX - 14}px;top:${FANY - 14}px;width:28px;height:28px;border-radius:50%;z-index:20;background:radial-gradient(circle at 35% 30%,#fff,#a2a9af 55%,#575d63);box-shadow:0 2px 4px rgba(0,0,0,.55)"></div>`

  // ---------- bottom zone: tee swatch, sticker sheet, ruler, pencil ----------
  const tee = `<div class="a" style="left:36px;top:1096px;width:266px;height:224px;transform:rotate(-5deg);z-index:7;filter:drop-shadow(0 1px 1px rgba(0,0,0,.45)) drop-shadow(0 12px 9px rgba(24,24,27,.38))"><div style="position:absolute;inset:0;clip-path:${zig(266, 224)};background:repeating-linear-gradient(0deg,rgba(255,255,255,.08) 0 1px,transparent 1px 3px),repeating-linear-gradient(90deg,rgba(0,0,0,.16) 0 1px,transparent 1px 3px),#1E4634"></div><div class="a" style="left:15px;top:15px;right:15px;bottom:15px;border:3px dashed rgba(242,207,107,.75)"></div>${im(logo('seal'), 58, 34, 150, 150, 'filter:drop-shadow(0 1px 1px rgba(0,0,0,.35))')}</div>`
  const teeTag = sheet({ x: 214, y: 1070, w: 104, h: 58, rot: 12, c: '#FBF8F0', z: 9, r: 4, shadow: SHADOW.flat, inner: text({ x: 12, y: 10, t: 'TEE', font: 'Sora', weight: 800, size: 20, c: C.night }) + text({ x: 12, y: 34, t: 'ENCINA', font: 'DM Mono', size: 12, ls: '.1em', c: '#55554f' }) + `<div class="a" style="right:8px;top:8px;width:12px;height:12px;border-radius:50%;background:#b8a98a;box-shadow:inset 0 1px 2px rgba(0,0,0,.5)"></div>`, extra: 'clip-path:polygon(0 0,86% 0,100% 30%,100% 100%,0 100%);' })

  const dieCut = (x, y, d, inner) => `<div class="a" style="left:${x}px;top:${y}px;width:${d}px;height:${d}px;border-radius:50%;box-shadow:0 0 0 5px #fbfaf6,0 0 0 6.5px rgba(24,24,27,.28);z-index:6;overflow:hidden">${inner}</div>`
  const stickerSheet = sheet({
    x: 332, y: 1092, w: 340, h: 244, rot: 3, c: '#FDFCF8', z: 8, r: 4, shadow: SHADOW.lift,
    inner: [
      dieCut(28, 26, 118, im(logo('seal'), 0, 0, 118, 118)),
      dieCut(184, 24, 118, `<div class="a" style="inset:0;background:${C.poppy};border:6px solid ${C.night};border-radius:50%;display:flex;align-items:center;justify-content:center"><div style="font:800 40px/1 'Sora';color:${C.paper}">72 h</div></div>`),
      `<div class="a" style="left:40px;top:156px;width:84px;height:84px;border-radius:50%;border:2px dashed rgba(24,24,27,.28)"></div>`,
      `<div class="a" style="left:152px;top:160px;width:76px;height:76px;border-radius:18px;overflow:hidden;box-shadow:0 0 0 5px #fbfaf6,0 0 0 6.5px rgba(24,24,27,.28)">${im(logo('app-icon'), 0, 0, 76, 76)}</div>`,
      dieCut(250, 158, 76, im(logo('seal-green'), 0, 0, 76, 76)),
    ].join(''),
  })

  const ticks = Array.from({ length: 10 }, (_, i) => text({ x: (i + 1) * 40 - 5, y: 28, t: String(i + 1), font: 'DM Mono', size: 15, c: '#23272b', z: 3 })).join('')
  const ruler = `<div class="a" style="left:652px;top:1276px;width:416px;height:56px;transform:rotate(-2deg);z-index:9;background:linear-gradient(#f4f6f7,#c8cdd2 55%,#a8aeb4);border-radius:3px;box-shadow:0 1px 1px rgba(0,0,0,.4),0 10px 12px -5px rgba(24,24,27,.45)"><div class="a" style="left:0;top:0;width:100%;height:14px;background:repeating-linear-gradient(90deg,#23272b 0 1.5px,transparent 1.5px 8px)"></div><div class="a" style="left:0;top:0;width:100%;height:24px;background:repeating-linear-gradient(90deg,#23272b 0 2px,transparent 2px 40px)"></div>${ticks}</div>`

  const pencil = `<div class="a" style="left:704px;top:1226px;width:340px;height:26px;transform:rotate(-11deg);z-index:10;filter:drop-shadow(2px 6px 4px rgba(24,24,27,.38))"><div class="a" style="left:46px;top:0;width:250px;height:26px;background:linear-gradient(#f46b49 0,${C.poppy} 28%,#b13518 100%);border-radius:2px"></div><div class="a" style="left:0;top:0;width:50px;height:26px;background:linear-gradient(#f0d6aa,#d9b887);clip-path:polygon(0 50%,100% 0,100% 100%)"></div><div class="a" style="left:0;top:0;width:15px;height:26px;background:#2b2b2e;clip-path:polygon(0 50%,100% 20%,100% 80%)"></div><div class="a" style="left:296px;top:0;width:22px;height:26px;background:linear-gradient(#e6e9ec,#9aa1a7)"></div><div class="a" style="left:318px;top:0;width:22px;height:26px;background:#f2a6a0;border-radius:0 8px 8px 0"></div></div>`

  const sticker72 = (() => {
    const d = 160
    const x = 968
    const y = 1008
    return `<div class="a" style="left:${x - d / 2}px;top:${y - d / 2}px;width:${d}px;height:${d}px;border-radius:50%;background:${C.poppy};border:7px solid ${C.night};box-shadow:9px 10px 0 ${C.night};transform:rotate(9deg);z-index:30;display:flex;flex-direction:column;align-items:center;justify-content:center"><div style="font:800 60px/1 'Sora';color:${C.paper};letter-spacing:-.03em">72 h</div><div style="font:500 12px/1.2 'DM Mono';color:${C.paper};margin-top:8px;letter-spacing:.08em">IDEA → ONLINE</div></div>`
  })()
  const sticky2 = sheet({ x: 700, y: 1090, w: 140, h: 140, rot: 4, c: '#fbf8ee', z: 11, shadow: SHADOW.flat, r: 1, extra: 'padding:34px 14px 14px;', inner: `<div style="font:400 29px/1.08 'Gochi Hand';color:${C.oak};transform:rotate(-1deg)">brand<br>manual<br>v2.0</div>` })

  const body = [
    mat,
    binder,
    cards,
    sticky1,
    fan,
    bolt,
    tee,
    teeTag,
    stickerSheet,
    sticky2,
    ruler,
    pencil,
    sticker72,
    ring({ x: 930, y: 1190, d: 190, rot: 20, z: 6 }),
    tape({ x: 772, y: 1092, w: 120, rot: -8, c: 'rgba(229,80,47,.8)', z: 25 }),
  ].join('')
  return { bg: '#EDC660', body }
}
