// Folder 01, Proyecto Contract: a printer's proofing folder. Cool grey pressboard with a pocket, the issue's cover pulled as a press proof
// (crop marks, registration targets, colour bar), glossy tear sheets, newsprint galley strips with red/blue pencil marks, a photo contact
// sheet with grease-pencil circles, a loupe, a steel ruler, a bicolour pencil, a swatch fan from the issue's palette, flags, stamps, clips.
import { pub, sheet, text, clip, tape, sticky, stamp, ring, SHADOW } from './lib.mjs'

const P = (n) => pub(`works/contract/pages/p-${String(n).padStart(3, '0')}.webp`)
const COVER = pub('works/contract/cover.webp')

const RED = '#d8281b' // red pencil
const BLUE = '#2459b8' // blue pencil
const VERM = '#FF4B2B' // the folder's colour on the Works page
const RUST = '#B96027'
const SKY = '#5098D0'
const PEACH = '#F3DFD0'
const OLIVE = '#8B7959'
const ESP = '#412318'
const INK = '#17151a'

// ---------- tiny helpers -------------------------------------------------------------------------------------------------------------
const box = (o, inner = '') => `<div class="a" style="left:${o.x}px;top:${o.y}px;width:${o.w}px;height:${o.h}px;transform:rotate(${o.r ?? 0}deg);z-index:${o.z ?? 5};${o.css ?? ''}">${inner}</div>`
const ab = (x, y, w, h, css = '', inner = '') => `<div class="a" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;${css}">${inner}</div>`
const rad = (d) => (d * Math.PI) / 180
/** global position of a point (lx, ly) given in the local frame of a rotated box */
const glob = (b, lx, ly) => {
  const cx = b.x + b.w / 2
  const cy = b.y + b.h / 2
  const dx = lx - b.w / 2
  const dy = ly - b.h / 2
  const a = rad(b.r ?? 0)
  return [cx + dx * Math.cos(a) - dy * Math.sin(a), cy + dx * Math.sin(a) + dy * Math.cos(a)]
}
const GLOSS = 'linear-gradient(118deg,rgba(255,255,255,.28),rgba(255,255,255,0) 30%,rgba(255,255,255,0) 66%,rgba(255,255,255,.16)),linear-gradient(90deg,rgba(0,0,0,.16),rgba(0,0,0,0) 4%)'

/** a printed page / tear sheet. over = children in local coordinates (pencil marks, flags) */
function pg(o) {
  const b = { x: o.x, y: o.y, w: o.w, h: o.h, r: o.r ?? 0 }
  return box(
    { ...b, z: o.z ?? 5, css: `background:${o.bc ?? '#fdfcf8'};box-shadow:${o.shadow ?? SHADOW.lift};border-radius:2px;` },
    `<img src="${o.src}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${o.pos ?? '50% 0%'};display:block;border-radius:2px">` +
      ab(0, 0, o.w, o.h, `border-radius:2px;background:${GLOSS};`) +
      (o.over ?? ''),
  )
}

/** a pencil mark (hand-drawn path with a wobble filter) */
const mk = (x, y, w, h, d, o = {}) =>
  `<svg class="a" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;transform:rotate(${o.r ?? 0}deg);z-index:${o.z ?? 30};filter:url(#pc);mix-blend-mode:multiply;overflow:visible" viewBox="0 0 ${w} ${h}"><path d="${d}" fill="none" stroke="${o.c ?? RED}" stroke-width="${o.sw ?? 4}" stroke-linecap="round" stroke-linejoin="round" ${o.dash ? `stroke-dasharray="${o.dash}"` : ''} opacity=".93"/></svg>`
const loop = (w, h) => `M${w * 0.52} ${h * 0.06} C${w * 0.92} ${h * 0} ${w * 1.0} ${h * 0.55} ${w * 0.78} ${h * 0.86} C${w * 0.55} ${h * 1.05} ${w * 0.12} ${h * 1.0} ${w * 0.03} ${h * 0.55} C${-w * 0.02} ${h * 0.15} ${w * 0.3} ${h * 0} ${w * 0.62} ${h * 0.1} C${w * 0.8} ${h * 0.15} ${w * 0.9} ${h * 0.25} ${w * 0.93} ${h * 0.4}`
const wob = (w, a = 4) => `M0 ${a} C${w * 0.25} ${a * 0.2}, ${w * 0.5} ${a * 1.8}, ${w * 0.75} ${a * 0.8} S${w * 0.95} ${a * 1.2}, ${w} ${a * 0.4}`
const tick = 'M2 24 L16 40 L48 2'
const deleatur = 'M6 42 C 0 14, 30 2, 46 12 C 58 22, 40 42, 26 32 C 14 24, 30 8, 64 6'
const caret = 'M0 26 L12 4 L24 26'

// ---------- print-room objects -------------------------------------------------------------------------------------------------------
const CMYK = ['#00aeef', '#ec008c', '#fff200', '#1a1718', '#e8222a', '#00a651', '#2e3192']
const colourBar = (x, y, bw, bh) => {
  const cols = [...CMYK, '#111', '#3a3a3c', '#6c6c70', '#a0a0a4', '#d4d4d6', '#00aeef88', '#ec008c88', '#fff20099']
  return cols.map((c, i) => ab(x + i * bw, y, bw, bh, `background:${c};`)).join('')
}
/** crop marks around the trim rect (tx, ty, tw, th) of a local frame */
const cropMarks = (tx, ty, tw, th, off = 10, len = 28) => {
  const l = []
  for (const y of [ty, ty + th]) {
    l.push(`M${tx - off - len} ${y} H${tx - off}`, `M${tx + tw + off} ${y} H${tx + tw + off + len}`)
  }
  for (const x of [tx, tx + tw]) {
    l.push(`M${x} ${ty - off - len} V${ty - off}`, `M${x} ${ty + th + off} V${ty + th + off + len}`)
  }
  return `<path d="${l.join(' ')}" fill="none" stroke="#111" stroke-width="1.7"/>`
}
const regTarget = (cx, cy, r = 10) => `<g transform="translate(${cx} ${cy})" fill="none" stroke="#111" stroke-width="1.5"><circle r="${r}"/><circle r="${r * 0.45}" fill="#111"/><path d="M${-r * 1.6} 0 H${r * 1.6} M0 ${-r * 1.6} V${r * 1.6}"/></g>`

/** the cover as a press proof on a big sheet: trim, crop marks, registration targets, colour bar, slug */
function pressSheet(o) {
  const SW = 590
  const SH = 790
  const tx = 55
  const ty = 80
  const tw = 480
  const th = 641
  const svg = `<svg class="a" style="left:0;top:0;z-index:3" width="${SW}" height="${SH}" viewBox="0 0 ${SW} ${SH}">${cropMarks(tx, ty, tw, th)}${regTarget(27, 400, 9)}${regTarget(563, 400, 9)}${regTarget(295, 36, 9)}${regTarget(295, 762, 9)}</svg>`
  const bar = colourBar(206, 736, 20, 22)
  const slug = text({ x: 372, y: 28, t: 'PCHD18 · COVER · 3/3', font: 'DM Mono', size: 15, c: '#55525a', ls: '.06em' })
  const cmyk = ['C', 'M', 'Y', 'K'].map((l, i) => text({ x: 376 + i * 22, y: 50, t: l, font: 'DM Mono', weight: 500, size: 16, c: ['#00aeef', '#ec008c', '#d6c400', '#111'][i] })).join('')
  const cover = `<img src="${COVER}" style="position:absolute;left:${tx}px;top:${ty}px;width:${tw}px;height:${th}px;object-fit:cover;display:block">` + ab(tx, ty, tw, th, `background:${GLOSS};`)
  const marks = mk(458, 118, 78, 62, loop(78, 62), { c: RED, sw: 5, r: -6, z: 12 }) + text({ x: 430, y: 176, t: 'no. 18 ✓', font: 'Gochi Hand', size: 34, c: RED, rot: -6, z: 12, extra: 'mix-blend-mode:multiply' })
  return box({ ...o, w: SW, h: SH, css: `background:#fbfaf6;box-shadow:${SHADOW.lift},0 30px 50px -20px rgba(16,24,32,.35);border-radius:2px;` }, `<div class="a paper-tex" style="inset:0;opacity:.45"></div>` + cover + svg + bar + slug + cmyk + marks)
}

/** a trim strip with a colour bar and a target (thrown away by the printer, kept by the editor) */
function strip(o) {
  const inner =
    colourBar(70, 12, 28, 34) +
    `<svg class="a" style="left:0;top:0" width="${o.w}" height="${o.h}">${regTarget(34, 29, 10)}${regTarget(o.w - 34, 29, 10)}</svg>` +
    text({ x: 70 + 15 * 28 + 18, y: 14, t: 'K 100·80·60·40·20', font: 'DM Mono', size: 14, c: '#55525a' }) +
    text({ x: 70 + 15 * 28 + 18, y: 34, t: 'HOTEL DESIGN 18', font: 'DM Mono', weight: 500, size: 16, c: '#222' })
  return box({ ...o, css: `background:#f9f8f3;box-shadow:${SHADOW.flat};` }, inner)
}

/** a long newsprint galley strip */
function galley(o) {
  const inner =
    `<div class="a paper-tex" style="inset:0;opacity:.8"></div>` +
    text({ x: 12, y: 10, t: o.slug, font: 'DM Mono', size: 13, c: '#6a645a', ls: '.08em' }) +
    `<div class="a" style="left:12px;top:34px;width:${o.w - 24}px"><div style="font:800 25px/1.04 'Bitter',serif;color:#15130f;margin-bottom:12px">${o.head}</div><div style="font:400 16px/1.32 'Bitter',serif;color:#2b2820;text-align:left;hyphens:auto">${o.body}</div></div>` +
    (o.over ?? '')
  return box({ x: o.x, y: o.y, w: o.w, h: o.h, r: o.r, z: o.z, css: `background:#e6dfca;box-shadow:${SHADOW.flat};` }, inner)
}

function ruler({ x, y, len = 640, w = 56, r = 0, z = 24 }) {
  const mm = 2.4
  const n = Math.floor((len - 30) / mm)
  let t = ''
  let nums = ''
  for (let i = 0; i <= n; i++) {
    const px = 14 + i * mm
    const L = i % 10 === 0 ? 24 : i % 5 === 0 ? 16 : 9
    t += `<line x1="${px}" y1="0" x2="${px}" y2="${L}"/>`
    if (i % 10 === 0 && i > 0) nums += `<text x="${px + 3}" y="38" font-family="DM Mono" font-size="13" fill="#2a2f33" stroke="none">${i / 10}</text>`
  }
  return box(
    { x, y, w: len, h: w, r, z, css: `border-radius:4px;background:linear-gradient(180deg,#f4f7f9,#c8cfd5 38%,#e8edf0 58%,#9aa3aa);box-shadow:0 2px 2px rgba(16,24,32,.3),0 12px 20px -6px rgba(16,24,32,.45);` },
    `<div class="a" style="inset:0;border-radius:4px;background:repeating-linear-gradient(90deg,rgba(255,255,255,.14) 0 2px,rgba(0,0,0,.035) 2px 5px);"></div><svg class="a" style="left:0;top:0" width="${len}" height="${w}"><g stroke="#2a2f33" stroke-width="1.1">${t}</g>${nums}<circle cx="${len - 20}" cy="${w / 2}" r="8" fill="#6a727a" stroke="#cfd5da" stroke-width="2"/></svg>`,
  )
}

function pencil({ x, y, len = 430, r = 0, z = 28 }) {
  const s = len / 460
  return `<svg class="a" style="left:${x}px;top:${y}px;width:${len}px;height:${36 * s}px;transform:rotate(${r}deg);z-index:${z};filter:drop-shadow(2px 5px 3px rgba(16,24,32,.4))" viewBox="0 0 460 36">
  <defs><linearGradient id="hx" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".35" stop-color="#fff" stop-opacity=".05"/><stop offset=".7" stop-color="#000" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></linearGradient></defs>
  <polygon points="56,1 56,35 12,23 12,13" fill="#e9c993"/><polygon points="12,13 12,23 0,18" fill="#d8281b"/>
  <polygon points="404,1 404,35 448,23 448,13" fill="#e9c993"/><polygon points="448,13 448,23 460,18" fill="#2459b8"/>
  <rect x="56" y="1" width="174" height="34" fill="#d8281b"/><rect x="230" y="1" width="174" height="34" fill="#2459b8"/>
  <rect x="226" y="1" width="8" height="34" fill="#e8d28a"/>
  <rect x="56" y="1" width="348" height="34" fill="url(#hx)"/>
  <text x="76" y="23" font-family="DM Mono" font-size="12" fill="#ffd9d3" stroke="none">PROOF · RED</text><text x="252" y="23" font-family="DM Mono" font-size="12" fill="#cfe0ff" stroke="none">PROOF · BLUE</text>
  <path d="M56 1 L40 8 M56 35 L40 28" stroke="#c9a870" stroke-width="1.4"/></svg>`
}

function loupe({ cx, cy, r = 92, rot = 42, src, pos, mag, size, z = 32, imgRot = 0 }) {
  const iw = size[0] * mag
  const ih = size[1] * mag
  return box(
    { x: cx, y: cy, w: 0, h: 0, r: rot, z, css: 'filter:drop-shadow(4px 10px 8px rgba(16,24,32,.45))' },
    ab(r - 10, -17, 190, 34, 'border-radius:17px;background:linear-gradient(180deg,#4a4a50,#17171a 45%,#050506);box-shadow:inset 0 2px 2px rgba(255,255,255,.3)') +
      ab(r - 14, -22, 30, 44, 'border-radius:6px;background:linear-gradient(180deg,#f3f6f8,#8e969d 55%,#dfe4e8);') +
      ab(-(r + 15), -(r + 15), 2 * (r + 15), 2 * (r + 15), 'border-radius:50%;background:conic-gradient(from 20deg,#f4f7f9,#8f979e,#e9eef1,#7b838a,#f4f7f9);box-shadow:inset 0 0 0 2px rgba(0,0,0,.25)') +
      ab(-r, -r, 2 * r, 2 * r, 'border-radius:50%;overflow:hidden;background:#222;box-shadow:inset 0 0 14px rgba(0,0,0,.55)',
        `<div class="a" style="left:${r - iw / 2}px;top:${r - ih / 2}px;width:${iw}px;height:${ih}px;transform:rotate(${imgRot - rot}deg);"><img src="${src}" style="width:100%;height:100%;object-fit:cover;object-position:${pos};display:block;filter:saturate(1.12) contrast(1.05)"></div>` +
          ab(0, 0, 2 * r, 2 * r, 'border-radius:50%;background:radial-gradient(circle at 30% 26%,rgba(255,255,255,.55),rgba(255,255,255,0) 34%),radial-gradient(circle at 50% 50%,rgba(255,255,255,0) 62%,rgba(10,20,30,.32) 100%);')),
  )
}

function bclip({ x, y, w = 150, r = 0, z = 40, c = '#17171a' }) {
  return `<svg class="a" style="left:${x}px;top:${y}px;width:${w}px;height:${w * 0.72}px;transform:rotate(${r}deg);z-index:${z};filter:drop-shadow(3px 6px 4px rgba(16,24,32,.45))" viewBox="0 0 130 94">
  <defs><linearGradient id="bk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#55555c"/><stop offset=".25" stop-color="${c}"/><stop offset="1" stop-color="#000"/></linearGradient></defs>
  <path d="M34 46 L22 12 Q18 2 30 2 H100 Q112 2 108 12 L96 46" fill="none" stroke="#d5dade" stroke-width="5.5" stroke-linecap="round"/>
  <path d="M34 46 L22 12 Q18 2 30 2 H100 Q112 2 108 12 L96 46" fill="none" stroke="#7d868d" stroke-width="1.4" stroke-linecap="round" transform="translate(1.5 1.5)"/>
  <path d="M6 44 Q6 36 14 36 H116 Q124 36 124 44 L129 84 Q130 93 121 93 H9 Q0 93 1 84 Z" fill="url(#bk)"/>
  <path d="M10 42 H120" stroke="#ffffff" stroke-opacity=".28" stroke-width="2.4" stroke-linecap="round"/></svg>`
}

/** a page-marker flag */
const flag = ({ x, y, w = 78, h = 34, c, r = 0, z = 40 }) =>
  box({ x, y, w, h, r, z, css: 'filter:drop-shadow(1px 3px 2px rgba(16,24,32,.35))' }, ab(0, 0, w, h, `background:linear-gradient(90deg,${c},${c}e6 22%,${c}cc);clip-path:polygon(0 0,88% 0,100% 50%,88% 100%,0 100%);`, ab(0, 0, 10, h, 'background:rgba(255,255,255,.4)')))

function tag({ x, y, r = 0, z = 36 }) {
  const w = 160
  const h = 250
  return (
    box({ x, y, w, h, r, z, css: 'filter:drop-shadow(3px 7px 5px rgba(16,24,32,.4))' },
      ab(0, 0, w, h, 'background:#ecd9a2;clip-path:polygon(24% 0,76% 0,100% 13%,100% 100%,0 100%,0 13%);',
        `<div class="a paper-tex" style="inset:0"></div>` + ab(0, 0, w, 52, `background:${VERM};opacity:.9`) +
        ab(w / 2 - 17, 14, 34, 34, 'border-radius:50%;background:#e9e5da;box-shadow:inset 0 2px 4px rgba(0,0,0,.5)') +
        ab(w / 2 - 10, 21, 20, 20, 'border-radius:50%;background:#3d3a35;box-shadow:inset 0 2px 3px rgba(0,0,0,.8)') +
        text({ x: 14, y: 78, t: 'FOR', font: 'Courier Prime', weight: 700, size: 26, c: '#3a2410', ls: '.12em' }) +
        text({ x: 14, y: 110, t: 'APPROVAL', font: 'Courier Prime', weight: 700, size: 30, c: '#3a2410' }) +
        `<div class="a" style="left:14px;top:156px;width:130px;height:3px;background:#3a2410"></div>` +
        text({ x: 14, y: 170, t: 'ISSUE 18', font: 'Courier Prime', size: 22, c: '#5a4426' }) +
        text({ x: 14, y: 198, t: 'HOTEL DESIGN', font: 'Courier Prime', size: 18, c: '#5a4426' })) )
  )
}

const chip = (c, n, code) => ({ c, n, code })
function swatchFan({ px, py, z = 16, angles, ch = 280 }) {
  const chips = [chip(VERM, 'SIGNAL', '1-08'), chip(RUST, 'RUST', '7-31'), chip(SKY, 'SKY', '4-12'), chip(PEACH, 'PEACH', '0-62'), chip(OLIVE, 'OLIVE', '5-77'), chip(ESP, 'ESPRESSO', '9-05')]
  const cw = 86
  const bh = ch - 76
  const cards = chips
    .map((k, i) =>
      box({ x: px - cw / 2, y: py - ch + 26, w: cw, h: ch, r: angles[i], z: z + i, css: `transform-origin:${cw / 2}px ${ch - 26}px;background:#fbfaf5;box-shadow:0 3px 8px rgba(16,24,32,.38);border-radius:4px;` },
        ab(8, 8, cw - 16, bh - 30, `background:${k.c};box-shadow:inset 0 0 0 1px rgba(0,0,0,.1)`) +
          text({ x: 8, y: bh - 16, t: k.n, font: 'DM Mono', weight: 500, size: 15, c: '#222' }) +
          text({ x: 8, y: bh + 6, t: k.code, font: 'DM Mono', size: 14, c: '#7a766c' })),
    )
    .join('')
  const rivet = ab(px - 13, py - 13, 26, 26, `z-index:${z + 20};border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#a7afb6 50%,#5c646b);box-shadow:0 2px 3px rgba(0,0,0,.5)`)
  return cards + rivet
}

// ---------- the picture --------------------------------------------------------------------------------------------------------------
export default function () {
  const defs = `<svg width="0" height="0" style="position:absolute"><defs><filter id="pc" x="-8%" y="-8%" width="116%" height="116%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.4"/></filter></defs></svg>`

  // ----- folder: grey pressboard, a crease, printed corner marks
  const folder = [
    ab(0, 0, 1080, 1350, `z-index:0;background:linear-gradient(90deg,#b7bfc5 0,#aab2b8 49%,#9ea7ae 51%,#98a1a8 100%)`),
    ab(0, 0, 1080, 1350, 'z-index:1;background:radial-gradient(ellipse at 42% 42%,rgba(255,255,255,.14),rgba(10,20,30,.22) 100%)'),
    `<div class="a fibre" style="inset:0;z-index:1;opacity:.28;mix-blend-mode:multiply"></div>`,
    ab(0, 0, 1080, 1350, 'z-index:2;background:linear-gradient(90deg,rgba(255,255,255,0) 47.2%,rgba(30,40,50,.34) 49.3%,rgba(255,255,255,.3) 50.9%,rgba(255,255,255,0) 53.2%)'),
    `<svg class="a" style="left:0;top:0;z-index:2;opacity:.5" width="1080" height="1350" viewBox="0 0 1080 1350">${cropMarks(26, 26, 1028, 1298, 8, 22).replace('#111', '#667078')}</svg>`,
  ].join('')

  // ----- top zone (y 0 to 300): strip, job card, sumario, galleys, tag
  const galleys = [
    galley({ x: 676, y: -40, w: 160, h: 440, r: 8, z: 3, slug: 'OPEN SPACE · 42', head: 'Madrid entre molduras', body: 'En el barrio de los Jerónimos, Mercer Hotel Madrid 5*GL recupera un edificio catalogado de 1905 para convertirlo en un destino de lujo contemporáneo.',
      over: mk(8, 38, 144, 10, wob(144, 5), { c: RED, sw: 3.5, z: 4 }) + mk(6, 150, 150, 8, wob(150, 4), { c: RED, sw: 3.5, z: 4, dash: '2 7' }) + mk(-4, 170, 70, 52, deleatur, { c: RED, sw: 3.5, z: 4, r: -6 }) }),
    galley({ x: 810, y: -20, w: 160, h: 420, r: -5, z: 2, slug: 'OPEN SPACE · 60', head: 'Dormir junto a la historia', body: 'En pleno barrio Gótico de Barcelona, el Gran Hotel Barcino amplía su identidad a través de una reforma integral marcada por el hallazgo de restos de la antigua Barcino romana.',
      over: mk(100, 210, 56, 36, caret, { c: BLUE, sw: 3.5, z: 4 }) + mk(-6, 60, 14, 120, 'M10 2 C 0 20, 0 100, 10 118', { c: BLUE, sw: 3.5, z: 4 }) }),
    galley({ x: 928, y: 0, w: 156, h: 400, r: 4, z: 1, slug: 'OPEN SPACE · 152', head: 'Retail hipnótico', body: 'Como una escenografía onírica donde la compra se transforma en el inicio de una celebración. Un espacio entre lo íntimo, lo festivo y lo irreal.' }),
  ].join('')

  const top = [
    strip({ x: 10, y: 30, w: 640, h: 58, r: -1.6, z: 7 }),
    // the job card
    box({ x: 36, y: 112, w: 318, h: 186, r: -3.4, z: 9, css: `background:#f5f0dc;box-shadow:${SHADOW.lift};border-top:10px solid ${VERM};` },
      `<div class="a paper-tex" style="inset:0"></div>` + `<div class="a" style="left:0;right:0;top:100px;height:2px;background:rgba(60,100,180,.35)"></div><div class="a" style="left:0;right:0;top:138px;height:2px;background:rgba(60,100,180,.35)"></div>` +
        text({ x: 14, y: 10, t: 'JOB 18-223', font: 'DM Mono', weight: 500, size: 18, c: RED, ls: '.1em' }) +
        text({ x: 14, y: 38, t: 'PROYECTO CONTRACT', font: 'Courier Prime', weight: 700, size: 29, c: '#1c1a16' }) +
        text({ x: 14, y: 72, t: 'HOTEL DESIGN · No. 18', font: 'Courier Prime', size: 25, c: '#2d2a22' }) +
        text({ x: 14, y: 108, t: '230 pp + bound-in 223', font: 'Courier Prime', size: 22, c: '#3b382e' }) +
        text({ x: 14, y: 142, t: 'PROOF 3 / 3 · HOLD FOR OK', font: 'Courier Prime', weight: 700, size: 20, c: '#8a2a14' })),
    // sumario page peeking above the hero
    pg({ x: 366, y: 40, w: 290, h: 386, r: 5.5, z: 4, src: P(3), pos: '50% 0%' }),
    flag({ x: 604, y: 188, w: 84, c: SKY, r: -4, z: 6 }),
    galleys,
    tag({ x: 884, y: 150, r: 13 }),
    clip({ x: 944, y: 118, h: 124, rot: 6, z: 38, c: '#d93a24' }),
    ruler({ x: -30, y: 336, len: 700, r: -1.6, z: 30 }),
    // loose red-pencil note on the card
    text({ x: 672, y: 372, t: 'check credits!', font: 'Gochi Hand', size: 38, c: RED, rot: -4, z: 20, extra: 'mix-blend-mode:multiply' }),
  ].join('')

  // ----- the band: hero press sheet, tear sheets, contact sheet, loupe
  // the visible band on the cards is y 430 to 920: the cover's masthead, the lobby and the loupe live there
  const hero = pressSheet({ x: 20, y: 396, r: -2.4, z: 12 })
  const tear130 = pg({ x: 792, y: 448, w: 262, h: 349, r: 6, z: 8, src: P(130), pos: '50% 0%',
    over: mk(18, 12, 200, 70, loop(200, 70), { c: RED, sw: 4.5, r: -2, z: 6 }) + flag({ x: 230, y: 320, w: 70, c: VERM, r: 0, z: 7 }) })
  const tear152 = pg({ x: 588, y: 480, w: 262, h: 349, r: -5, z: 9, src: P(152), pos: '50% 0%',
    over: mk(48, 30, 112, 14, wob(112, 5), { c: '#fff', sw: 3, z: 6 }) + text({ x: 20, y: 284, t: 'keep it blue!!', font: 'Gochi Hand', size: 38, c: '#fff', rot: -3, z: 8, extra: 'text-shadow:0 1px 3px rgba(0,0,40,.5)' }) })

  // the contact sheet, black paper, 3 x 3 frames with orange numbers and grease-pencil marks
  const cs = { x: 590, y: 742, w: 430, h: 330, r: 3.2, z: 14 }
  const frames = [
    [P(43), '50% 52%'], [P(61), '50% 58%'], [P(187), '50% 40%'],
    [P(153), '50% 62%'], [P(73), '50% 16%'], [P(110), '50% 52%'],
    [P(221), '50% 50%'], [P(83), '50% 30%'], [P(130), '50% 70%'],
  ]
  const fw = 128
  const fh = 85
  const frameHtml = frames.map(([s, p], i) => {
    const cx = i % 3
    const cy = Math.floor(i / 3)
    const fx = 14 + cx * (fw + 8)
    const fy = 42 + cy * (fh + 8)
    return ab(fx, fy, fw, fh, 'background:#222;overflow:hidden', `<img src="${s}" style="width:100%;height:100%;object-fit:cover;object-position:${p};display:block;filter:saturate(1.1)">`) + text({ x: fx + 3, y: fy + fh + 0, t: String(i + 1).padStart(2, '0'), font: 'DM Mono', size: 11, c: '#e8a050' })
  }).join('')
  const csHtml = box({ ...cs, css: `background:#141416;box-shadow:${SHADOW.lift};border-radius:2px;` },
    `<div class="a" style="inset:0;background:linear-gradient(118deg,rgba(255,255,255,.1),rgba(255,255,255,0) 40%);"></div>` +
      text({ x: 14, y: 12, t: 'SELECTS · ISSUE 18', font: 'DM Mono', weight: 500, size: 17, c: '#e8a050', ls: '.1em' }) +
      frameHtml +
      mk(14 + 2 * (fw + 8) - 6, 42 + 1 * (fh + 8) - 6, fw + 12, fh + 12, loop(fw + 12, fh + 12), { c: '#ff6a4d', sw: 4.5, z: 8 }) +
      mk(14 + 0 * (fw + 8) + 10, 42 + 0 * (fh + 8) + 8, fw - 20, fh - 16, 'M0 0 L100 70 M100 0 L0 70', { c: '#ff6a4d', sw: 4.5, z: 8 }) +
      mk(14 + 0 * (fw + 8) - 4, 42 + 2 * (fh + 8) - 5, fw + 8, fh + 10, loop(fw + 8, fh + 10), { c: '#ff6a4d', sw: 4.5, z: 8, r: -2 }))
  const lensCentre = glob(cs, 14 + 1 * (fw + 8) + fw / 2, 42 + 0 * (fh + 8) + fh / 2)
  const lens = loupe({ cx: lensCentre[0] - 6, cy: lensCentre[1] - 2, r: 96, rot: 38, src: P(61), pos: '50% 58%', mag: 2.35, size: [fw, fh], imgRot: cs.r, z: 34 })

  const band = [
    hero,
    tear130,
    tear152,
    csHtml,
    lens,
    clip({ x: 1000, y: 722, h: 126, rot: 22, z: 36, c: '#2b66c4' }),
    bclip({ x: 758, y: 470, w: 124, r: 6, z: 40 }),
    // isolated so the stamp prints in plain ink over the photo instead of multiplying into it
    `<div class="a" style="inset:0;isolation:isolate;z-index:36;pointer-events:none">${stamp({ x: 318, y: 640, t: 'APPROVED', size: 52, c: '#0f2a66', rot: -8, font: 'Barlow Semi Condensed', weight: 800, z: 2 })}</div>`,
    stamp({ x: 44, y: 404, t: 'PROOF', size: 50, c: '#e0301b', rot: -4, font: 'Barlow Semi Condensed', weight: 800, z: 36 }),
    flag({ x: 560, y: 700, w: 76, c: '#f2c230', r: -4, z: 40 }),
    flag({ x: 1004, y: 540, w: 76, c: SKY, r: 8, z: 40 }),
  ].join('')

  // ----- bottom zone: pocket, tucked pages, swatch fan, sticky, ruler, rings
  const tucked = [
    pg({ x: 640, y: 1030, w: 262, h: 349, r: -3, z: 10, src: P(150), pos: '50% 0%' }),
    pg({ x: 850, y: 1020, w: 262, h: 349, r: 5, z: 11, src: P(220), pos: '50% 0%' }),
  ].join('')
  const pocket = box({ x: 560, y: 1196, w: 540, h: 230, z: 45, css: `background:linear-gradient(180deg,#b3bbc1,#a1aab1);border-radius:36px 0 0 0;box-shadow:0 -5px 14px rgba(16,24,32,.38),inset 0 2px 0 rgba(255,255,255,.4);` },
    `<div class="a fibre" style="inset:0;opacity:.25;mix-blend-mode:multiply;border-radius:36px 0 0 0"></div>` +
      ab(14, 14, 520, 240, 'border-top:2px dashed rgba(255,255,255,.55);border-left:2px dashed rgba(255,255,255,.55);border-radius:26px 0 0 0') +
      box({ x: 70, y: 30, w: 250, h: 120, r: -2, z: 3, css: 'background:#f6f2e4;box-shadow:0 1px 2px rgba(0,0,0,.3);' },
        `<div class="a paper-tex" style="inset:0"></div>` + ab(0, 0, 250, 10, `background:${VERM}`) +
          text({ x: 16, y: 24, t: 'REPRINTS · SPARES', font: 'Courier Prime', weight: 700, size: 26, c: '#222' }) +
          text({ x: 16, y: 62, t: 'HOTEL DESIGN No. 18', font: 'Courier Prime', size: 22, c: '#3a372e' }) +
          text({ x: 16, y: 92, t: 'do not fold', font: 'Gochi Hand', size: 28, c: RED })) +
      ab(390, 40, 90, 90, `border-radius:50%;background:${VERM};box-shadow:0 2px 4px rgba(0,0,0,.35),inset 0 0 0 4px rgba(255,255,255,.25)`,
        `<div class="a" style="left:0;top:22px;width:90px;text-align:center;font:400 44px/1 'Chango';color:#fff">18</div>`))

  const bottom = [
    tucked,
    pocket,
    swatchFan({ px: 120, py: 1340, z: 31, angles: [-20, -4, 12, 28, 44, 60], ch: 215 }),
    pencil({ x: 590, y: 1112, len: 450, r: 4, z: 47 }),
    sticky({ x: 404, y: 1196, s: 150, rot: 5, t: 'p.152<br>cyan too<br>cold?', size: 30, c: '#ffd84d', z: 48 }),
    ring({ x: 512, y: 1290, d: 140, rot: 12, z: 12 }),
    tape({ x: 636, y: 1228, w: 100, rot: -32, c: 'rgba(255,75,43,.75)', z: 56 }),
    clip({ x: 1034, y: 1178, h: 130, rot: -8, z: 50, c: '#c9d0d5' }),
  ].join('')

  return { bg: '#a7afb5', body: defs + folder + top + band + bottom }
}
