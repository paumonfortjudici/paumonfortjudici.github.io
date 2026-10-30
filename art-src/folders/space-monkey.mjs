// Folder 05, Space Monkey: a CLASSIFIED MISSION DOSSIER. Electric-violet pressboard folder with a stitched pocket, the two posters
// printed as proof sheets (crop marks, colour bars), the monkey patch (embroidered), two keys on numbered tags, a cipher wheel, a
// blueprint star chart, a redacted memo, polaroids, an escape-room countdown, security tape, a UV glow and hand-drawn die-cut stickers.
// Identity (both posters, patch, monkey sticker) sits in the band y 430-920; everything else is paper, tape and clutter.
import { pub, sheet, text, clip, tape, stamp, ring, pen } from './lib.mjs'

const sm = (f) => pub(`works/space-monkey/${f}`)
const RED = '#e5261c'
const INK = '#0d0b14'
const LIFT = '0 2px 3px rgba(8,4,30,.5), 0 20px 34px -6px rgba(8,4,30,.7)'
const FLAT = '0 1px 1px rgba(8,4,30,.45), 0 6px 12px -2px rgba(8,4,30,.55)'
const SK = sm('catalog-sketch.webp')

/** a die-cut sticker cropped from the folder's own catalog frieze (coords in a 2000 px wide frame) */
const sticker = (o) => {
  const s = o.s ?? 0.5
  return `<div class="a" style="left:${o.x}px;top:${o.y}px;width:${o.cw * s}px;height:${o.ch * s}px;overflow:hidden;transform:rotate(${o.rot ?? 0}deg);z-index:${o.z ?? 24};filter:drop-shadow(2px 5px 3px rgba(8,4,30,.55)) drop-shadow(0 0 1px rgba(8,4,30,.5))"><img src="${SK}" style="position:absolute;left:${-o.x0 * s}px;top:${-o.y0 * s}px;width:${2000 * s}px;height:auto;max-width:none" alt=""></div>`
}

const PW = 312 // poster width on a proof
const SW = 360 // sheet width
/** crop marks around the poster rectangle of a proof sheet */
const cropMarks = (px, py, pw, ph, W, H) => {
  const d = []
  for (const [cx, cy, dx, dy] of [[px, py, -1, -1], [px + pw, py, 1, -1], [px, py + ph, -1, 1], [px + pw, py + ph, 1, 1]]) {
    d.push(`M${cx + dx * 4} ${cy}H${cx + dx * 20}M${cx} ${cy + dy * 4}V${cy + dy * 20}`)
  }
  return `<svg class="a" style="left:0;top:0;z-index:3" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><path d="${d.join('')}" stroke="#111" stroke-width="1.6" fill="none"/></svg>`
}
const regMark = (x, y) => `<svg class="a" style="left:${x - 10}px;top:${y - 10}px;z-index:3" width="20" height="20" viewBox="0 0 22 22"><circle cx="11" cy="11" r="6.5" fill="none" stroke="#111" stroke-width="1.5"/><path d="M11 0V22M0 11H22" stroke="#111" stroke-width="1.3"/></svg>`
const colourBar = (x, y) => ['#00a6e3', '#e5007d', '#ffed00', '#111', RED, '#009a44', '#2b3a9f'].map((c, i) => `<div class="a" style="left:${x + i * 29}px;top:${y}px;width:27px;height:20px;background:${c}"></div>`).join('')

/** a proof sheet: poster printed in the middle of a white sheet */
const proof = (o) => {
  const h = 26 + o.ph + 46
  return sheet({
    x: o.x, y: o.y, w: SW, h, rot: o.rot, z: o.z, c: o.c, shadow: LIFT,
    inner: [
      `<img class="a" src="${o.src}" style="left:24px;top:26px;width:${PW}px;height:${o.ph}px;object-fit:cover;box-shadow:0 0 0 1px rgba(0,0,0,.3)" alt="">`,
      cropMarks(24, 26, PW, o.ph, SW, h),
      regMark(SW / 2, 12), regMark(11, 26 + o.ph / 2), regMark(SW - 11, 26 + o.ph / 2),
      colourBar(24, 26 + o.ph + 12),
      text({ x: 240, y: 26 + o.ph + 10, t: o.label, font: 'Courier Prime', weight: 700, size: 18, c: '#222', ls: '.04em', z: 4 }),
      text({ x: 240, y: 26 + o.ph + 29, t: o.sub, font: 'DM Mono', weight: 500, size: 11, c: '#555', ls: '.04em', z: 4 }),
      o.inner ?? '',
    ].join(''),
  })
}

/** brass or steel key on a numbered tag */
const keyTag = (o) => {
  const [c1, c2, c3] = o.metal === 'brass' ? ['#fff0a8', '#e0aa3c', '#8a5a14'] : ['#ffffff', '#bcc5d2', '#68758a']
  const s = o.s ?? 0.85
  return `<svg class="a" style="left:${o.x}px;top:${o.y}px;width:${360 * s}px;height:${240 * s}px;transform:rotate(${o.rot ?? 0}deg);z-index:${o.z ?? 28};filter:drop-shadow(2px 6px 4px rgba(8,4,30,.6))" viewBox="0 0 360 240">
<defs><linearGradient id="k-${o.id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset=".5" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/></linearGradient></defs>
<path d="M54 56 C 44 112, 78 140, 124 156" fill="none" stroke="#efe9d6" stroke-width="3.4" stroke-linecap="round"/>
<circle cx="54" cy="54" r="31" fill="none" stroke="url(#k-${o.id})" stroke-width="25"/>
<circle cx="54" cy="54" r="43" fill="none" stroke="rgba(50,30,5,.5)" stroke-width="1.6"/><circle cx="54" cy="54" r="18" fill="none" stroke="rgba(50,30,5,.45)" stroke-width="1.6"/>
<rect x="96" y="45" width="236" height="17" rx="6" fill="url(#k-${o.id})" stroke="rgba(50,30,5,.55)" stroke-width="1.8"/>
<rect x="102" y="35" width="15" height="37" rx="4" fill="url(#k-${o.id})" stroke="rgba(50,30,5,.55)" stroke-width="1.8"/>
<rect x="276" y="60" width="17" height="27" rx="2" fill="url(#k-${o.id})" stroke="rgba(50,30,5,.55)" stroke-width="1.8"/>
<rect x="302" y="60" width="20" height="19" rx="2" fill="url(#k-${o.id})" stroke="rgba(50,30,5,.55)" stroke-width="1.8"/>
<path d="M124 49H322" stroke="rgba(255,255,255,.7)" stroke-width="2" stroke-linecap="round"/>
<g transform="rotate(${o.tagRot ?? -5} 190 190)">
<polygon points="112,168 136,142 280,142 280,236 112,236" fill="${o.tag}" stroke="rgba(0,0,0,.3)" stroke-width="1.5"/>
<circle cx="136" cy="168" r="12" fill="#f7f6f0" stroke="#9a9a92" stroke-width="1.5"/><circle cx="136" cy="168" r="5" fill="#2a2630"/>
<text x="156" y="170" font-family="DM Mono" font-weight="500" font-size="17" fill="${o.ink}" opacity=".85" letter-spacing="2">No.${o.num}</text>
<text x="124" y="214" font-family="Courier Prime" font-weight="700" font-size="42" fill="${o.ink}" letter-spacing="1">${o.name}</text>
</g></svg>`
}

/** a cipher wheel (two rotating alphabets) */
const cipher = (o) => {
  const d = o.d
  const r = d / 2
  const L = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']
  const ringL = (rad, size, fill, off, w = 700) => L.map((ch, i) => `<text x="${r}" y="${r - rad}" transform="rotate(${i * (360 / 26) + off} ${r} ${r})" text-anchor="middle" font-family="Orbitron" font-weight="${w}" font-size="${size}" fill="${fill}">${ch}</text>`).join('')
  const ticks = L.map((_, i) => `<line x1="${r}" y1="${r - r * 0.745}" x2="${r}" y2="${r - r * 0.715}" transform="rotate(${i * (360 / 26) + 6.9} ${r} ${r})" stroke="#f3ead0" stroke-width="2"/>`).join('')
  return `<svg class="a" style="left:${o.x - r}px;top:${o.y - r}px;width:${d}px;height:${d}px;transform:rotate(${o.rot ?? 0}deg);z-index:${o.z ?? 7};filter:drop-shadow(3px 9px 8px rgba(8,4,30,.65))" viewBox="0 0 ${d} ${d}">
<defs><radialGradient id="cw1" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#3b2a86"/><stop offset="1" stop-color="#150d34"/></radialGradient><radialGradient id="cw2" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="#fff8e2"/><stop offset="1" stop-color="#dccfa8"/></radialGradient><radialGradient id="cw3" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff0a8"/><stop offset=".6" stop-color="#d9a73c"/><stop offset="1" stop-color="#8a5a14"/></radialGradient></defs>
<circle cx="${r}" cy="${r}" r="${r - 3}" fill="url(#cw1)" stroke="#0b0720" stroke-width="5"/>
<circle cx="${r}" cy="${r}" r="${r * 0.73}" fill="none" stroke="#f3ead0" stroke-width="2.4"/>
${ticks}${ringL(r * 0.86, d * 0.082, '#f3ead0', 0)}
<circle cx="${r}" cy="${r}" r="${r * 0.7}" fill="url(#cw2)" stroke="#0b0720" stroke-width="3"/>
${ringL(r * 0.55, d * 0.076, '#1b1236', 38, 800)}
<circle cx="${r}" cy="${r}" r="${r * 0.43}" fill="none" stroke="${RED}" stroke-width="3"/>
<g transform="translate(${r} ${r})" stroke="#1b1236" stroke-width="2.2" opacity=".75"><path d="M0 -${r * 0.4}L${r * 0.1} 0L0 ${r * 0.4}L-${r * 0.1} 0Z" fill="none"/><path d="M-${r * 0.4} 0L0 ${r * 0.1}L${r * 0.4} 0L0 -${r * 0.1}Z" fill="none"/></g>
<circle cx="${r}" cy="${r}" r="${r * 0.15}" fill="url(#cw3)" stroke="#5a3a0c" stroke-width="2"/><circle cx="${r}" cy="${r}" r="${r * 0.05}" fill="#6b4410"/>
<path d="M${r - 11} 2 L${r + 11} 2 L${r} ${r * 0.09 + 6}Z" fill="${RED}" stroke="#600" stroke-width="1.5"/>
</svg>`
}

/** blueprint star chart (blue grid paper) */
const chartSheet = (o) => sheet({
  x: o.x, y: o.y, w: 540, h: 440, rot: o.rot, z: o.z, c: '#1b4fb0', shadow: LIFT, r: 2,
  extra: 'background-image:linear-gradient(rgba(255,255,255,.28) 1.5px,transparent 1.5px),linear-gradient(90deg,rgba(255,255,255,.28) 1.5px,transparent 1.5px),linear-gradient(rgba(255,255,255,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.1) 1px,transparent 1px);background-size:60px 60px,60px 60px,12px 12px,12px 12px;',
  inner: `<svg class="a" style="left:0;top:0" width="540" height="440" viewBox="0 0 540 440" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round">
<g stroke-width="2.4" opacity=".85"><circle cx="280" cy="210" r="176"/><circle cx="280" cy="210" r="126" stroke-width="1.6"/><circle cx="280" cy="210" r="76" stroke-width="1.6"/><path d="M280 24V396M94 210H466M148 78L412 342M412 78L148 342" stroke-width="1.4"/></g>
<ellipse cx="280" cy="210" rx="236" ry="84" transform="rotate(-24 280 210)" stroke-dasharray="3 12" stroke-width="3.4"/>
<g stroke-width="3"><path d="M190 120L236 160L296 130L350 178L330 246"/><path d="M200 290L246 262L290 300L352 292"/></g>
<g fill="#fff" stroke="none"><circle cx="190" cy="120" r="7"/><circle cx="236" cy="160" r="5"/><circle cx="296" cy="130" r="8"/><circle cx="350" cy="178" r="6"/><circle cx="330" cy="246" r="7"/><circle cx="200" cy="290" r="6"/><circle cx="246" cy="262" r="5"/><circle cx="290" cy="300" r="8"/><circle cx="352" cy="292" r="5"/><circle cx="130" cy="180" r="3"/><circle cx="420" cy="140" r="3"/><circle cx="400" cy="330" r="3"/><circle cx="150" cy="340" r="3"/></g>
<path d="M436 56 l5 15 l15 5 l-15 5 l-5 15 l-5 -15 l-15 -5 l15 -5Z" fill="#fff" stroke="none"/>
<text x="26" y="44" fill="#fff" stroke="none" font-family="Orbitron" font-weight="800" font-size="25" letter-spacing="3">STAR CHART</text>
<text x="26" y="72" fill="#fff" stroke="none" font-family="DM Mono" font-weight="500" font-size="16" letter-spacing="2" opacity=".8">SECTOR 13 / ORBIT 02</text>
<text x="26" y="414" fill="#fff" stroke="none" font-family="DM Mono" font-weight="500" font-size="15" letter-spacing="2" opacity=".75">SCALE 1:60 / NOT FOR DISTRIBUTION</text>
</svg>`,
})

const bar = (w) => `<span style="display:inline-block;width:${w}px;height:.8em;background:${INK};vertical-align:-.08em;margin:0 4px;border-radius:1px"></span>`

/** polaroid with a cropped poster as the photo */
const polaroid = (o) => sheet({
  x: o.x, y: o.y, w: 250, h: 300, rot: o.rot, z: o.z ?? 30, c: '#fbf9f3', shadow: LIFT, r: 3,
  inner: [
    `<div class="a" style="left:16px;top:16px;width:218px;height:218px;overflow:hidden;background:#000;box-shadow:inset 0 0 14px rgba(0,0,0,.6)"><img src="${o.src}" style="position:absolute;width:${o.iw}px;left:${o.il}px;top:${o.it}px;max-width:none;filter:contrast(1.06) saturate(1.1)" alt=""><div class="a" style="inset:0;background:linear-gradient(135deg,rgba(255,255,255,.22),transparent 38%)"></div></div>`,
    text({ x: 20, y: 240, t: o.cap, font: 'Reenie Beanie', size: 50, c: '#23233a', rot: -2, w: 215, lh: 0.95, extra: 'white-space:nowrap' }),
  ].join(''),
})

/** a strip of tape across a corner: x, y = centre, len, rot, bg, ink, t */
const cornerTape = (o) => `<div class="a" style="left:${o.x - o.len / 2}px;top:${o.y - 23}px;width:${o.len}px;height:46px;transform:rotate(${o.rot}deg);z-index:${o.z ?? 30};background:${o.bg};overflow:hidden;box-shadow:0 3px 7px rgba(8,4,30,.55);white-space:nowrap;font:900 23px/46px 'Archivo';letter-spacing:.2em;color:${o.ink};text-align:center;text-shadow:0 1px 0 rgba(0,0,0,.2)"><div class="a" style="inset:0;background:repeating-linear-gradient(90deg,transparent 0 120px,rgba(255,255,255,.12) 120px 121px)"></div>${o.t}</div>`

export default function () {
  const dymo = (o) => `<div class="a" style="left:${o.x}px;top:${o.y}px;transform:rotate(${o.rot ?? 0}deg);z-index:${o.z ?? 34};background:${o.c ?? '#17151e'};color:${o.ink ?? '#fff'};font:700 ${o.size ?? 28}px/1 'Courier Prime';letter-spacing:.14em;padding:.28em .6em;border-radius:3px;box-shadow:0 1px 0 rgba(255,255,255,.18) inset,${FLAT};text-shadow:0 -1px 0 rgba(255,255,255,.35),0 1px 1px #000;white-space:nowrap">${o.t}</div>`

  const body = [
    // ---- the folder itself: pressboard texture, crease
    `<div class="a fibre" style="inset:0;z-index:1;mix-blend-mode:multiply;opacity:.3"></div>`,
    `<div class="a" style="inset:0;z-index:1;background:repeating-linear-gradient(45deg,rgba(255,255,255,.045) 0 2px,transparent 2px 6px),repeating-linear-gradient(-45deg,rgba(0,0,30,.06) 0 2px,transparent 2px 6px)"></div>`,
    `<div class="a" style="inset:0;z-index:2;background:linear-gradient(90deg,transparent 43%,rgba(8,4,50,.2) 47.5%,rgba(8,4,50,.55) 49.4%,rgba(255,255,255,.22) 50.4%,rgba(8,4,50,.14) 52.5%,transparent 57%)"></div>`,
    // ---- paper stack peeking from behind the proofs
    sheet({ x: 50, y: 440, w: 350, h: 520, rot: -9.5, z: 4, c: '#f3c8d4' }),
    sheet({ x: 92, y: 404, w: 350, h: 540, rot: 5, z: 5, c: '#e9dfc4' }),
    sheet({ x: 664, y: 408, w: 350, h: 540, rot: 9.5, z: 4, c: '#c9def4' }),
    sheet({ x: 632, y: 452, w: 350, h: 520, rot: -4.5, z: 5, c: '#f4ecd2' }),

    // ---- TOP: blueprint star chart, cipher wheel, TOP SECRET label
    chartSheet({ x: 6, y: -34, rot: -4, z: 6 }),
    sticker({ x: 8, y: 118, x0: 0, y0: 40, cw: 470, ch: 395, s: 0.44, rot: -12, z: 12 }),
    cipher({ x: 905, y: 150, d: 330, rot: 14, z: 7 }),
    clip({ x: 440, y: 14, h: 128, rot: 14, z: 22, c: RED }),
    tape({ x: 60, y: 70, w: 140, rot: -42, c: 'rgba(244,236,200,.78)', z: 22 }),
    `<div class="a" style="left:372px;top:96px;width:350px;height:112px;transform:rotate(-3deg);z-index:26;background:${INK};border-radius:6px;box-shadow:${LIFT};overflow:hidden">
      <div class="a" style="left:0;top:0;width:100%;height:24px;background:repeating-linear-gradient(-45deg,${RED} 0 14px,${INK} 14px 28px)"></div>
      <div class="a" style="left:0;top:76px;width:100%;height:36px;background:repeating-linear-gradient(-45deg,${RED} 0 14px,${INK} 14px 28px)"></div>
      <div class="a" style="left:0;top:30px;width:100%;text-align:center;font:900 38px/1 'Orbitron';letter-spacing:.06em;white-space:nowrap;color:#fff;text-shadow:0 0 14px rgba(255,255,255,.25)">TOP SECRET</div>
    </div>`,
    dymo({ x: 372, y: 238, t: 'FILE SM-13', size: 22, rot: 2.5, z: 27 }),
    ring({ x: 642, y: 300, d: 150, rot: 20, z: 9 }),
    pen({ kind: 'circle', x: 190, y: 160, w: 170, h: 90, c: '#fff', rot: -8, sw: 5, z: 14 }),
    // a brass key lying over the blueprint and the Tyler sheet's top edge
    keyTag({ id: 'a', x: 196, y: 262, s: 0.7, rot: -4, metal: 'brass', tag: '#fff2cf', ink: '#2a2118', num: '01', name: 'TYLER', z: 32 }),

    // ---- THE TWO POSTERS, printed as proofs (identity band y 430-920)
    proof({
      x: 74, y: 417, ph: 466, rot: -3, z: 10, c: '#f8f2e4', src: sm('tyler.webp'), label: 'PROOF 01', sub: 'TYLER / ROOM A',
      inner: [
        pen({ kind: 'circle', x: 172, y: 92, w: 150, h: 96, c: RED, rot: 6, sw: 6, z: 12 }),
        text({ x: 252, y: 62, t: 'shiny!', font: 'Reenie Beanie', size: 46, c: '#ffd1cc', rot: -12, z: 12, extra: 'text-shadow:0 1px 3px #000' }),
      ].join(''),
    }),
    proof({
      x: 650, y: 430, ph: 460, rot: 2.5, z: 11, c: '#eceff4', src: sm('smith.webp'), label: 'PROOF 02', sub: 'SMITH / ROOM B',
      inner: [
        pen({ kind: 'circle', x: 212, y: 188, w: 84, h: 56, c: '#ffe14a', rot: 4, sw: 6, z: 12 }),
        text({ x: 188, y: 244, t: 'the patch!', font: 'Reenie Beanie', size: 33, c: '#ffe9a0', rot: -6, z: 12, extra: 'text-shadow:0 1px 3px #000,0 0 6px #000' }),
      ].join(''),
    }),
    // tapes across the top corners of the posters
    cornerTape({ x: 118, y: 486, len: 220, rot: -41, bg: RED, ink: '#fff', t: 'CLASSIFIED', z: 30 }),
    cornerTape({ x: 966, y: 496, len: 220, rot: 41, bg: INK, ink: RED, t: 'EYES ONLY', z: 30 }),
    tape({ x: 408, y: 440, w: 110, rot: 52, c: 'rgba(244,236,200,.8)', z: 28 }),
    tape({ x: 668, y: 450, w: 110, rot: 38, c: 'rgba(160,230,255,.62)', z: 28 }),

    // ---- the monkey patch and the monkey sticker, between the two posters
    `<div class="a" style="left:436px;top:452px;width:208px;height:208px;border-radius:50%;z-index:34;transform:rotate(-8deg);background:repeating-conic-gradient(${RED} 0 5deg,#a31710 5deg 10deg);box-shadow:${LIFT}">
      <div class="a" style="inset:15px;border-radius:50%;background:#f5efe0;box-shadow:inset 0 0 0 2px rgba(0,0,0,.3),inset 0 3px 10px rgba(0,0,0,.28)"></div>
      <div class="a" style="inset:24px;border-radius:50%;border:3px dashed rgba(13,11,20,.45)"></div>
      <img class="a" src="${sm('logo-monkey-patch@3x.png')}" style="left:32px;top:40px;width:144px;height:129px;transform:rotate(12deg);filter:drop-shadow(0 2px 2px rgba(0,0,0,.3))" alt="">
    </div>`,
    `<div class="a" style="left:536px;top:459px;width:14px;height:14px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#9aa4b4 70%);box-shadow:0 2px 3px rgba(0,0,0,.6);z-index:35"></div>`,
    sticker({ x: 440, y: 690, x0: 1295, y0: 0, cw: 490, ch: 510, s: 0.4, rot: 7, z: 33 }),
    sticker({ x: 590, y: 840, x0: 1045, y0: 115, cw: 255, ch: 190, s: 0.42, rot: -16, z: 33 }),

    // ---- BOTTOM: the redacted memo tucked into the pocket, steel key, polaroids, countdown, UV ink
    sheet({
      x: 22, y: 972, w: 340, h: 400, rot: -2.5, z: 9, c: '#f2f0e8', shadow: FLAT,
      inner: [
        text({ x: 22, y: 58, t: 'MEMORANDUM', font: 'Courier Prime', weight: 700, size: 30, ls: '.08em', c: '#15131b' }),
        `<div class="a" style="left:22px;top:98px;width:296px;height:3px;background:#15131b"></div>`,
        `<div class="a" style="left:22px;top:108px;width:310px;font:400 21px/1.5 'Courier Prime';color:#26232d;white-space:nowrap">TO:&nbsp; ${bar(130)}<br>RE:&nbsp; 2 ROOMS, 2 POSTERS<br>TYLER: astronaut<br>SMITH: the officer<br>KEY: ${bar(60)} the ${bar(70)}</div>`,
        stamp({ x: 56, y: 8, t: 'CLASSIFIED', size: 28, c: RED, rot: 5, font: 'Courier Prime', z: 14 }),
      ].join(''),
    }),
    clip({ x: 292, y: 946, h: 110, rot: 10, z: 22 }),
    // the pocket of the folder, stitched, in front of the memo
    `<div class="a" style="left:-20px;top:1252px;width:1120px;height:240px;z-index:20;border-radius:44px 44px 0 0;background:linear-gradient(#5f43f2,#4a2fd8 40%,#3d26b4);box-shadow:0 -4px 12px rgba(5,0,40,.6),0 -1px 0 rgba(255,255,255,.28) inset"></div>`,
    `<div class="a fibre" style="left:-20px;top:1252px;width:1120px;height:240px;z-index:21;border-radius:44px 44px 0 0;mix-blend-mode:multiply;opacity:.3"></div>`,
    `<div class="a" style="left:8px;top:1272px;width:1064px;height:100px;z-index:22;border:3px dashed rgba(255,255,255,.42);border-radius:34px 34px 0 0"></div>`,
    dymo({ x: 40, y: 1288, t: 'ESCAPE ROOM', size: 28, rot: -3, z: 36 }),
    dymo({ x: 400, y: 1300, t: 'SPACE MONKEY', size: 24, rot: 2, z: 36, c: RED }),

    keyTag({ id: 'b', x: 540, y: 922, s: 0.8, rot: -8, metal: 'steel', tag: RED, ink: '#fff', num: '02', name: 'SMITH', z: 36, tagRot: 4 }),
    polaroid({ x: 800, y: 1012, rot: 6.5, z: 33, src: sm('smith.webp'), iw: 640, il: -112, it: -74, cap: 'suspect no. 2' }),
    polaroid({ x: 330, y: 992, rot: -6, z: 30, src: sm('tyler.webp'), iw: 480, il: -222, it: -84, cap: 'lost in orbit' }),
    clip({ x: 960, y: 992, h: 120, rot: 12, z: 40 }),
    tape({ x: 420, y: 996, w: 110, rot: -12, c: 'rgba(244,236,200,.8)', z: 40 }),
    sticker({ x: 690, y: 1204, x0: 790, y0: 150, cw: 185, ch: 210, s: 0.34, rot: 20, z: 40 }),

    // escape-room countdown (up on the top of the folder, next to the label)
    `<div class="a" style="left:572px;top:246px;width:236px;height:128px;transform:rotate(4deg);z-index:38;border-radius:16px;background:linear-gradient(#34323e,#14131a);box-shadow:${LIFT},0 1px 0 rgba(255,255,255,.25) inset">
      <div class="a" style="left:14px;top:14px;width:208px;height:78px;border-radius:7px;background:#0a0406;box-shadow:inset 0 3px 10px rgba(0,0,0,.9),0 1px 0 rgba(255,255,255,.18)"></div>
      <div class="a" style="left:14px;top:20px;width:208px;text-align:center;font:700 62px/68px 'Orbitron';color:#ff3a2a;text-shadow:0 0 10px #ff2a1a,0 0 26px rgba(255,50,30,.7)">59:59</div>
      <div class="a" style="left:20px;top:100px;font:700 15px/1 'DM Mono';letter-spacing:.3em;color:#9a98a8">ESCAPE</div>
      <div class="a" style="left:168px;top:98px;width:18px;height:18px;border-radius:50%;background:${RED};box-shadow:0 2px 2px #000"></div><div class="a" style="left:196px;top:98px;width:18px;height:18px;border-radius:50%;background:#e8e4d0;box-shadow:0 2px 2px #000"></div>
    </div>`,
    text({ x: 836, y: 322, t: 'the key is', font: 'Reenie Beanie', size: 48, c: '#9ff6ff', rot: -3, z: 37, extra: 'text-shadow:0 0 6px #35e6ff,0 0 18px #2ad0ff,0 0 34px rgba(40,200,255,.8)' }),
    text({ x: 850, y: 364, t: 'in the helmet', font: 'Reenie Beanie', size: 48, c: '#9ff6ff', rot: -3, z: 37, extra: 'text-shadow:0 0 6px #35e6ff,0 0 18px #2ad0ff,0 0 34px rgba(40,200,255,.8)' }),
    ring({ x: 700, y: 1290, d: 170, rot: 10, z: 12 }),

    // ---- light: UV glow and the folder's edge vignette
    `<div class="a" style="inset:0;z-index:70;mix-blend-mode:screen;pointer-events:none;background:radial-gradient(ellipse 420px 360px at 190px 1040px,rgba(40,190,255,.34),transparent 70%),radial-gradient(ellipse 380px 320px at 930px 250px,rgba(170,90,255,.38),transparent 70%),radial-gradient(ellipse 300px 260px at 960px 1180px,rgba(60,210,255,.22),transparent 70%)"></div>`,
    `<div class="a" style="inset:0;z-index:71;pointer-events:none;background:radial-gradient(ellipse 80% 70% at 50% 50%,transparent 55%,rgba(6,0,40,.5) 100%)"></div>`,
    // construction guides for the 430-920 identity band (only when SM_GUIDES is set)
    process.env.SM_GUIDES ? `<div class="a" style="left:0;top:430px;width:1080px;height:2px;background:#0f0;z-index:120"></div><div class="a" style="left:0;top:920px;width:1080px;height:2px;background:#0f0;z-index:120"></div>` : '',
  ].join('')
  return { bg: '#4b30da', body }
}
