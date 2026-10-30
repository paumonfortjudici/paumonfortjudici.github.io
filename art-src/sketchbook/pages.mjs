// The pages of the sketchbook. Every handwritten title and line comes from src/worlds/procreate/book.json (the same words the site shows),
// the drawings from sources/. Coordinates are page pixels (1200 x 1600); a left page has its gutter on the right, a right page on the left.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  W, H, PENCIL, BIRO, FELT, RED, GREEN,
  pageHtml, board, hand, ink, print, coffee, smear, thumb, stain, crumbs, blot, dogear, swatch, sticker, sticky, tape, pageNo,
  arrowPath, circlePath, underPath, starPath, spiralPath, squigPath, loopsPath, boxPath, guides, hatchPath,
} from './lib.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const book = JSON.parse(fs.readFileSync(path.resolve(here, '..', '..', 'src', 'worlds', 'procreate', 'book.json'), 'utf8'))
const T = Object.fromEntries(book.pages.map((p) => [p.id, p]))

const pad2 = (n) => String(n).padStart(2, '0')
/** the handwritten heading of a drawing page: its number circled in biro, the title in felt-tip, the line in pencil underneath */
function heading(id, { x, y, size = 88, rot = -1.4, lw = 760, ls = 1.4, titleHtml, lineGap = 1.12 }) {
  const t = T[id]
  const circ = ink(circlePath(x - 52, y + size * 0.56, 38, 34, { c: BIRO, sw: 4, seed: t.no + 4 }), { z: 41 })
  return (
    circ +
    hand({ x: x - 82, y: y + size * 0.22, t: pad2(t.no), size: 44, font: 'Gochi Hand', c: BIRO, rot: -3, pencil: false }) +
    hand({ x, y, t: titleHtml ?? t.title, size, font: 'Gochi Hand', c: FELT, rot, pencil: false, op: 0.96 }) +
    hand({ x: x + 6, y: y + size * lineGap, t: t.line, size: 58, c: PENCIL, rot: rot * 0.6, w: lw, lh: 1.0, ls })
  )
}

const housePath = (x, y, s, c = PENCIL) => {
  const p = (d) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>`
  return (
    p(`M${x} ${y + s * 0.5} L${x + s * 0.5} ${y} L${x + s} ${y + s * 0.5} L${x + s} ${y + s * 1.05} L${x} ${y + s * 1.05} Z`) +
    p(`M${x + s * 0.18} ${y + s * 0.65} L${x + s * 0.36} ${y + s * 0.65} L${x + s * 0.36} ${y + s * 0.83} L${x + s * 0.18} ${y + s * 0.83} Z`)
  )
}

// ---- cover and back ------------------------------------------------------------------------------------------------------------------

const coverHtml = () => {
  const label = `<div class="a" style="left:236px;top:380px;width:760px;height:480px;transform:rotate(-2.4deg);z-index:20;background:#eee2c2;box-shadow:0 1px 1px rgba(0,0,0,.5),0 10px 18px -8px rgba(0,0,0,.7);filter:url(#warp)"><div class="a" style="inset:0;box-shadow:inset 0 0 60px rgba(150,105,50,.38)"></div></div>`
  const txt =
    hand({ x: 292, y: 428, t: 'SKETCHBOOK', size: 124, font: 'Gochi Hand', c: FELT, rot: -2.4, pencil: false, z: 40, ls: 3 }) +
    hand({ x: 310, y: 622, t: 'procreate  ·  for fun', size: 78, font: 'Reenie Beanie', c: BIRO, rot: -2.2, z: 40 }) +
    hand({ x: 330, y: 722, t: 'not for work!', size: 84, font: 'Gochi Hand', c: RED, rot: -2.6, pencil: false, z: 40 })
  const labelInk = ink(underPath(322, 810, 360, { c: RED, sw: 5, seed: 6 }), { z: 41 })
  const tapes = tape({ x: 262, y: 392, w: 170, h: 50, rot: -38, z: 30, c: 'rgba(226,208,150,.86)' }) + tape({ x: 968, y: 346, w: 170, h: 50, rot: 36, z: 30, c: 'rgba(226,208,150,.86)' })
  const chalk = '#e7e1d0'
  const doodles = ink(
    starPath(330, 1120, 46, { c: chalk, sw: 5, rot: 0.2, seed: 2 }) +
      starPath(470, 1210, 24, { c: chalk, sw: 4, rot: 0.5, seed: 5 }) +
      spiralPath(250, 1330, 60, { c: chalk, sw: 4.5, turns: 3.2 }) +
      squigPath(440, 1340, 300, { c: chalk, sw: 5, amp: 18, n: 5, seed: 9 }) +
      starPath(1000, 1000, 34, { c: chalk, sw: 4.5, rot: -0.3, seed: 8 }),
    { z: 22, blend: 'screen', op: 0.8 },
  )
  const whitePau = hand({ x: 210, y: 1020, t: 'pau', size: 112, font: 'Gochi Hand', c: chalk, rot: -5, pencil: false, op: 0.85, z: 24, extra: 'mix-blend-mode:screen;' })
  const sticky = sticker({
    x: 925, y: 1215, d: 250, c: '#f2ecda', rot: 8, z: 35, ring: RED,
    inner: `<div class="a" style="left:0;top:0;width:100%;height:100%;display:grid;place-items:center;text-align:center;font:400 50px/.95 'Gochi Hand';color:${RED};transform:rotate(-6deg)">100%<br>for fun</div>`,
  })
  const lightRing = (x, y, d) => `<div class="a" style="left:${x - d / 2}px;top:${y - d / 2}px;width:${d}px;height:${d}px;border-radius:50%;border:12px solid rgba(206,178,130,.22);box-shadow:inset 0 0 22px rgba(206,178,130,.16);mix-blend-mode:screen;z-index:12;filter:url(#blot)"></div>`
  const stains = lightRing(780, 1010, 250) + lightRing(300, 1450, 170)
  const thumbs = thumb({ x: 640, y: 1180, rot: 25, s: 1.4, op: 0.2, z: 14 }).replace('mix-blend-mode:multiply', 'mix-blend-mode:screen')
  return board({ seed: 4, spine: 'l', body: stains + thumbs + label + labelInk + txt + tapes + doodles + whitePau + sticky })
}

const backHtml = () => {
  const chalk = '#e7e1d0'
  const sticker1 = `<div class="a" style="left:430px;top:760px;width:430px;height:240px;transform:rotate(3deg);z-index:20;background:#f2ecda;box-shadow:0 1px 1px rgba(0,0,0,.5),0 8px 14px -7px rgba(0,0,0,.7);filter:url(#warp)"><div class="a" style="inset:0;box-shadow:inset 0 0 40px rgba(150,105,50,.3)"></div></div>`
  const txt =
    hand({ x: 460, y: 780, t: 'NOT FOR SALE', size: 74, font: 'Gochi Hand', c: RED, rot: 3, pencil: false, z: 30 }) +
    hand({ x: 480, y: 880, t: "(it's a sketchbook)", size: 60, c: PENCIL, rot: 2.6, z: 30 })
  const doodles = ink(
    starPath(300, 420, 40, { c: chalk, sw: 4.5, seed: 11 }) + squigPath(380, 1280, 330, { c: chalk, sw: 5, amp: 16, n: 5, seed: 4 }) + spiralPath(930, 450, 52, { c: chalk, sw: 4.5 }),
    { z: 22, blend: 'screen', op: 0.75 },
  )
  const lightRing = (x, y, d) => `<div class="a" style="left:${x - d / 2}px;top:${y - d / 2}px;width:${d}px;height:${d}px;border-radius:50%;border:12px solid rgba(206,178,130,.22);box-shadow:inset 0 0 22px rgba(206,178,130,.16);mix-blend-mode:screen;z-index:12;filter:url(#blot)"></div>`
  return board({ seed: 9, spine: 'r', body: lightRing(520, 1240, 260) + sticker1 + txt + tape({ x: 470, y: 770, w: 150, h: 44, rot: -30, z: 28, c: 'rgba(226,208,150,.86)' }) + doodles })
}

// ---- inside --------------------------------------------------------------------------------------------------------------------------

const p02 = () => {
  const lab = `<div class="a" style="left:200px;top:330px;width:800px;height:520px;transform:rotate(-1.6deg);z-index:20;background:#f6efdb;box-shadow:0 1px 1px rgba(40,25,10,.5),0 9px 14px -7px rgba(40,25,10,.55);filter:url(#warp)"><div class="a" style="inset:14px;border:4px double rgba(38,57,140,.55)"></div></div>`
  const body =
    coffee({ x: 760, y: 1180, d: 300, rot: 20, z: 6 }) +
    stain({ x: 300, y: 1280, w: 420, h: 320, rot: 14, op: 0.9 }) +
    lab +
    hand({ x: 262, y: 372, t: 'this sketchbook', size: 62, c: BIRO, rot: -1.6, z: 40 }) +
    hand({ x: 262, y: 430, t: 'belongs to', size: 62, c: BIRO, rot: -1.6, z: 40 }) +
    hand({ x: 330, y: 500, t: 'PAU', size: 190, font: 'Gochi Hand', c: FELT, rot: -2.2, pencil: false, z: 40, ls: 6 }) +
    hand({ x: 270, y: 700, t: 'if found: please return it.', size: 58, c: PENCIL, rot: -1.4, z: 40 }) +
    hand({ x: 270, y: 764, t: 'reward: a coffee (or two)', size: 58, c: RED, rot: -1.2, z: 40 }) +
    tape({ x: 220, y: 360, w: 170, h: 48, rot: -38, z: 30, c: 'rgba(232,216,160,.84)' }) +
    tape({ x: 984, y: 836, w: 170, h: 48, rot: -36, z: 30, c: 'rgba(232,216,160,.84)' }) +
    ink(starPath(150, 1000, 40, { c: PENCIL, sw: 4, seed: 3 }) + spiralPath(1010, 1050, 48, { c: PENCIL, sw: 4 }) + squigPath(210, 1500, 260, { c: PENCIL, sw: 4, amp: 12, n: 4, seed: 12 }), { z: 41, pencil: true }) +
    thumb({ x: 880, y: 960, rot: -30, s: 1.1, op: 0.3 }) +
    crumbs({ x: 300, y: 1000, n: 7, spread: 110, seed: 3 }) +
    smear({ x: 600, y: 1420, w: 560, h: 90, rot: -3, op: 0.22 }) +
    pageNo(2)
  return pageHtml({ seed: 2, kind: 'plain', tone: 1, body })
}

const LIST = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
const p03 = () => {
  const head = hand({ x: 224, y: 130, t: "what's inside", size: 118, font: 'Gochi Hand', c: FELT, rot: -1.2, pencil: false, z: 40 }) + ink(underPath(228, 262, 520, { c: RED, sw: 5, seed: 4 }), { z: 41 })
  let rows = ''
  let marks = ''
  LIST.forEach((n, i) => {
    const t = T[`p-${pad2(n)}`]
    const y = 330 + i * 80
    marks += boxPath(190, y + 30, 38, { tick: i % 3 !== 1, seed: i + 2 })
    rows += hand({ x: 260, y: y + 16, t: `${t.title}`, size: 56, c: PENCIL, rot: (i % 2 ? 0.4 : -0.5), z: 40 }) + hand({ x: 1010, y: y + 16, t: `p.${n}`, size: 56, c: BIRO, rot: -1, z: 40, pencil: true })
  })
  const note =
    hand({ x: 228, y: 1330, t: 'all made in procreate,', size: 60, c: RED, rot: -1.4, z: 40 }) +
    hand({ x: 228, y: 1392, t: 'printed + glued in. no brief.', size: 60, c: RED, rot: -1.2, z: 40 }) +
    hand({ x: 228, y: 1454, t: 'no client. just for fun.', size: 60, c: RED, rot: -1.0, z: 40 })
  const body = head + rows + ink(marks, { z: 41 }) + note + ink(underPath(228, 1448, 360, { c: RED, sw: 4, seed: 9 }), { z: 41 }) + coffee({ x: 1020, y: 1380, d: 230, rot: 8, z: 6 }) + smear({ x: 600, y: 300, w: 700, h: 80, rot: 1, op: 0.2 }) + crumbs({ x: 980, y: 260, n: 6, spread: 70, seed: 8 }) + pageNo(3)
  return pageHtml({ seed: 3, kind: 'ruled', body })
}

// ---- the drawings --------------------------------------------------------------------------------------------------------------------

const p04 = () => {
  const pr = print({ k: 'hills.jpg', x: 120, y: 120, w: 740, h: 964, rot: -1.4, border: 16, seed: 4, z: 12 })
  const [hx, hy] = pr.at(0.47, 0.64)
  const body =
    coffee({ x: 900, y: 1080, d: 260, rot: 6, z: 6 }) +
    coffee({ x: 190, y: 1450, d: 210, rot: -12, z: 6, splash: false }) +
    pr.html + pr.tapes(['tl', 'tr']) +
    heading('p-04', { x: 150, y: 1190, size: 88, lw: 800 }) +
    hand({ x: 905, y: 700, t: 'the tiny<br>house!', size: 62, c: RED, rot: 4, z: 42, w: 260 }) +
    ink(arrowPath({ x1: 925, y1: 730, x2: hx + 22, y2: hy + 4, bend: -0.3, head: 24, c: RED, sw: 5 }), { z: 43 }) +
    ink(squigPath(900, 1380, 230, { c: PENCIL, sw: 3.6, amp: 10, n: 4, seed: 7 }) + starPath(1060, 1470, 28, { c: PENCIL, sw: 3.6, seed: 5 }), { z: 41, pencil: true }) +
    thumb({ x: 1010, y: 1300, rot: -20, s: 1.0, op: 0.28 }) +
    crumbs({ x: 520, y: 1530, n: 8, spread: 120, seed: 4 }) +
    smear({ x: 500, y: 1130, w: 700, h: 70, rot: -1.5, op: 0.2 }) +
    pageNo(4) + dogear({ side: 'l', s: 110 })
  return pageHtml({ seed: 4, kind: 'plain', body })
}

const p05 = () => {
  const pr = print({ k: 'houses-stack.jpg', x: 520, y: 150, w: 566, h: 1132, rot: 1.1, border: 16, seed: 5, z: 12 })
  const nocurve =
    ink(circlePath(300, 1050, 64, 56, { c: PENCIL, sw: 4.5, seed: 6 }) + `<path d="M246 1100 L356 998" stroke="${RED}" stroke-width="7" stroke-linecap="round" fill="none"/>`, { z: 41 }) +
    hand({ x: 180, y: 1130, t: 'no curves!', size: 66, c: RED, rot: -3, z: 42 })
  const tiny = ink(housePath(100, 790, 70) + housePath(214, 770, 90) + housePath(360, 800, 60), { z: 41, pencil: true })
  const body =
    stain({ x: 240, y: 330, w: 380, h: 300, rot: 20, op: 0.7 }) +
    pr.html + pr.tapes(['tl', 'tr']) +
    hand({ x: 112, y: 150, t: 'houses,', size: 112, font: 'Gochi Hand', c: FELT, rot: -2.4, pencil: false, z: 40 }) +
    hand({ x: 112, y: 270, t: 'stacked', size: 112, font: 'Gochi Hand', c: FELT, rot: -2.0, pencil: false, z: 40 }) +
    ink(circlePath(66, 232, 40, 36, { c: BIRO, sw: 4, seed: 9 }), { z: 41 }) +
    hand({ x: 40, y: 206, t: '02', size: 44, font: 'Gochi Hand', c: BIRO, rot: -3, pencil: false }) +
    hand({ x: 116, y: 440, t: T['p-05'].line, size: 58, c: PENCIL, rot: -1, w: 380, lh: 1.0, ls: 1.2 }) +
    tiny + hand({ x: 120, y: 900, t: 'boxes first.', size: 52, c: PENCIL, rot: -2, z: 40 }) +
    nocurve +
    coffee({ x: 330, y: 1450, d: 230, rot: 10, z: 6 }) +
    thumb({ x: 1070, y: 1400, rot: 18, s: 1.05, op: 0.26 }) +
    crumbs({ x: 740, y: 1450, n: 7, spread: 120, seed: 9 }) +
    smear({ x: 280, y: 1280, w: 420, h: 70, rot: 4, op: 0.2 }) +
    pageNo(5) + dogear({ side: 'r', s: 110 })
  return pageHtml({ seed: 5, kind: 'dots', body })
}

const p07 = () => {
  // crop of the line drawing (736 x 1308): the face with a little air round it
  const crop = { x: 110, y: 330, w: 520, h: 650, sw: 736, sh: 1308 }
  const w = 740
  const h = Math.round((w * crop.h) / crop.w)
  const pr = print({ k: 'face-round-glasses.jpg', x: 230, y: 190, w, h, rot: -1, bare: true, crop, seed: 7, z: 14 })
  const [gx, gy] = pr.at(0.7, 0.52)
  const guideLines = [
    ...[0.31, 0.52, 0.66, 0.73].map((v) => [90, pr.at(0, v)[1], 1110, pr.at(1, v)[1] - 8]),
    [pr.at(0.5, 0.05)[0], pr.at(0.5, 0.05)[1], pr.at(0.5, 1.02)[0] + 8, pr.at(0.5, 1.02)[1]],
  ]
  const body =
    ink(guides(guideLines) + `<ellipse cx="${pr.at(0.5, 0.58)[0]}" cy="${pr.at(0.5, 0.58)[1]}" rx="${w * 0.4}" ry="${h * 0.5}" fill="none" stroke="rgba(70,112,178,.5)" stroke-width="2.2" transform="rotate(-2 ${pr.at(0.5, 0.58)[0]} ${pr.at(0.5, 0.58)[1]})"/>`, { z: 8, blend: 'multiply', op: 0.8 }) +
    smear({ x: 300, y: 1010, w: 420, h: 110, rot: -10, op: 0.3 }) +
    pr.html +
    heading('p-07', { x: 170, y: 1190, size: 94, lw: 840 }) +
    hand({ x: 880, y: 360, t: 'round<br>glasses', size: 64, c: RED, rot: 5, z: 42, w: 280 }) +
    ink(arrowPath({ x1: 930, y1: 460, x2: gx + 30, y2: gy - 24, bend: 0.32, head: 24, c: RED, sw: 5 }), { z: 43 }) +
    hand({ x: 90, y: 560, t: 'curly<br>hair', size: 58, c: PENCIL, rot: -6, z: 42, w: 220 }) +
    ink(arrowPath({ x1: 160, y1: 540, x2: pr.at(0.2, 0.2)[0] - 10, y2: pr.at(0.2, 0.2)[1] + 16, bend: -0.3, head: 22, c: PENCIL, sw: 4 }), { z: 43, pencil: true }) +
    coffee({ x: 1000, y: 1380, d: 240, rot: -8, z: 6 }) +
    thumb({ x: 160, y: 1400, rot: 22, s: 1.0, op: 0.3 }) +
    crumbs({ x: 620, y: 1500, n: 9, spread: 150, seed: 7 }) +
    pageNo(7) + dogear({ side: 'r', s: 110 })
  return pageHtml({ seed: 7, kind: 'plain', tone: -1, body })
}

const p06 = () => {
  const pr = print({ k: 'hillside-town.jpg', x: 110, y: 130, w: 800, h: 800, rot: 1.2, border: 16, corners: true, seed: 6, z: 12 })
  const [wx, wy] = pr.at(0.61, 0.56)
  const body =
    coffee({ x: 150, y: 210, d: 250, rot: 4, z: 6 }) +
    pr.html +
    ink(circlePath(wx, wy, 70, 56, { c: RED, sw: 5, seed: 3 }), { z: 43 }) +
    hand({ x: 940, y: 470, t: 'tiny<br>windows!', size: 60, c: RED, rot: 5, z: 42, w: 240 }) +
    ink(arrowPath({ x1: 950, y1: 560, x2: wx + 78, y2: wy + 30, bend: 0.25, head: 22, c: RED, sw: 5 }), { z: 43 }) +
    heading('p-06', { x: 150, y: 1100, size: 88, lw: 820 }) +
    ink(squigPath(880, 1420, 250, { c: PENCIL, sw: 3.6, amp: 11, n: 4, seed: 11 }) + housePath(960, 1230, 60) + housePath(1050, 1250, 44), { z: 41, pencil: true }) +
    thumb({ x: 1040, y: 1010, rot: 30, s: 1.0, op: 0.28 }) +
    crumbs({ x: 600, y: 1520, n: 8, spread: 140, seed: 6 }) +
    smear({ x: 500, y: 1030, w: 700, h: 60, rot: 1, op: 0.18 }) +
    pageNo(6) + dogear({ side: 'l', s: 110 })
  return pageHtml({ seed: 6, kind: 'plain', tone: 1, body })
}

const p08 = () => {
  const pr = print({ k: 'five-faces.jpg', x: 215, y: 150, w: 640, h: 853, rot: -1.8, border: 15, seed: 8, z: 12 })
  const L = (text, tx, ty, u, v, ax, ay, rotT = 3) =>
    hand({ x: tx, y: ty, t: text, size: 58, c: RED, rot: rotT, z: 42, w: 250 }) +
    ink(arrowPath({ x1: ax, y1: ay, x2: pr.at(u, v)[0], y2: pr.at(u, v)[1], bend: 0.28, head: 22, c: RED, sw: 5 }), { z: 43 })
  const body =
    stain({ x: 1000, y: 1250, w: 420, h: 330, rot: 10, op: 0.8 }) +
    pr.html + pr.tapes(['t', 'bl']) +
    L('shades', 930, 215, 0.93, 0.22, 930, 280, 4) +
    L('round<br>shades', 930, 520, 0.95, 0.53, 930, 600, 3) +
    L('grumpy<br>beard', 930, 800, 0.95, 0.82, 930, 880, 3) +
    L('beanie', 36, 310, 0.04, 0.38, 100, 380, -4) +
    L('hoodie', 36, 760, 0.07, 0.74, 100, 830, -4) +
    heading('p-08', { x: 160, y: 1110, size: 86, lw: 840 }) +
    coffee({ x: 160, y: 1480, d: 190, rot: 5, z: 6, splash: false }) +
    thumb({ x: 1010, y: 1400, rot: -15, s: 1.0, op: 0.28 }) +
    crumbs({ x: 640, y: 1530, n: 7, spread: 150, seed: 8 }) +
    pageNo(8) + dogear({ side: 'l', s: 110 })
  return pageHtml({ seed: 8, kind: 'plain', body })
}

const p09 = () => {
  const pr = print({ k: 'yellow-cap.jpg', x: 270, y: 190, w: 700, h: 700, rot: 1.8, border: 16, corners: true, seed: 9, z: 12 })
  const N = (text, tx, ty, u, v, ax, ay, rotT = -4) =>
    hand({ x: tx, y: ty, t: text, size: 58, c: PENCIL, rot: rotT, z: 42, w: 220 }) + ink(arrowPath({ x1: ax, y1: ay, x2: pr.at(u, v)[0], y2: pr.at(u, v)[1], bend: -0.3, head: 22, c: PENCIL, sw: 4 }), { z: 43, pencil: true })
  const body =
    coffee({ x: 1000, y: 1010, d: 250, rot: 12, z: 6 }) +
    pr.html +
    N('cap', 100, 240, 0.34, 0.1, 160, 305) +
    N('big<br>glasses', 80, 520, 0.2, 0.33, 150, 610) +
    N('wavy<br>hair', 1030, 360, 0.93, 0.4, 1040, 450, 5) +
    heading('p-09', { x: 170, y: 1100, size: 92, lw: 600 }) +
    swatch({ x: 800, y: 1290, w: 220, h: 80, c: '#f3c63a', rot: -2, label: 'yellow!', lc: PENCIL }) +
    swatch({ x: 810, y: 1440, w: 200, h: 50, c: '#17121b', rot: 1.5 }) +
    thumb({ x: 140, y: 1400, rot: 12, s: 1.0, op: 0.3 }) +
    crumbs({ x: 560, y: 1520, n: 8, spread: 150, seed: 9 }) +
    pageNo(9) + dogear({ side: 'r', s: 110 })
  return pageHtml({ seed: 9, kind: 'dots', body })
}

const PALETTE = [
  ['#b16022', 'brown'],
  ['#dc8f43', 'orange'],
  ['#f8a635', 'amber'],
  ['#ffd800', 'yellow'],
]
const p10 = () => {
  const pr = print({ k: 'portrait-cap.webp', x: 110, y: 150, w: 600, h: 849, rot: -3, die: true, seed: 10, z: 12 })
  const sw = PALETTE.map(([c, n], i) => swatch({ x: 800, y: 290 + i * 150, w: 210, h: 90, c, rot: i % 2 ? 1.5 : -1.5, label: n, lc: PENCIL })).join('')
  const [dx, dy] = pr.at(0.88, 0.3)
  const body =
    stain({ x: 860, y: 1150, w: 380, h: 300, rot: -10, op: 0.8 }) +
    pr.html + sw +
    hand({ x: 800, y: 110, t: 'the whole<br>palette', size: 58, c: RED, rot: 4, z: 42, w: 260 }) +
    ink(arrowPath({ x1: 800, y1: 190, x2: dx + 36, y2: dy - 30, bend: -0.3, head: 22, c: RED, sw: 5 }), { z: 43 }) +
    sticky({ x: 800, y: 1010, s: 270, rot: 4, c: '#f7df6a', t: 'too orange??<br>(no. keep it)', size: 42, font: 'Gochi Hand', z: 30 }) +
    heading('p-10', { x: 160, y: 1170, size: 90, lw: 620 }) +
    coffee({ x: 150, y: 1470, d: 200, rot: 0, z: 6, splash: false }) +
    thumb({ x: 1010, y: 1440, rot: 20, s: 0.9, op: 0.26 }) +
    crumbs({ x: 480, y: 1530, n: 7, spread: 120, seed: 10 }) +
    pageNo(10) + dogear({ side: 'l', s: 110 })
  return pageHtml({ seed: 10, kind: 'plain', tone: 1, body })
}

const p11 = () => {
  const pr = print({ k: 'portrait-quiff.webp', x: 330, y: 160, w: 480, h: 827, rot: 2.4, die: true, seed: 11, z: 12 })
  const sw = PALETTE.map(([c, n], i) => swatch({ x: 110, y: 230 + i * 120, w: 150, h: 64, c, rot: i % 2 ? -1.5 : 1.5, z: 20 })).join('')
  const ticks = ink(PALETTE.map((_, i) => boxPath(60, 250 + i * 120, 36, { tick: true, seed: i + 20 })).join(''), { z: 41 })
  const [dx, dy] = pr.at(0.88, 0.3)
  const body =
    coffee({ x: 1030, y: 1280, d: 280, rot: 14, z: 6 }) +
    pr.html + sw + ticks +
    hand({ x: 90, y: 740, t: 'same four,<br>all of them', size: 58, c: PENCIL, rot: -3, z: 42, w: 260 }) +
    hand({ x: 880, y: 330, t: 'four dots<br>= the palette', size: 54, c: RED, rot: 5, z: 42, w: 280 }) +
    ink(arrowPath({ x1: 905, y1: 440, x2: dx + 6, y2: dy + 60, bend: -0.25, head: 22, c: RED, sw: 5 }), { z: 43 }) +
    heading('p-11', { x: 180, y: 1180, size: 90, lw: 760 }) +
    thumb({ x: 160, y: 1420, rot: -10, s: 1.0, op: 0.28 }) +
    crumbs({ x: 600, y: 1520, n: 8, spread: 150, seed: 11 }) +
    pageNo(11) + dogear({ side: 'r', s: 110 })
  return pageHtml({ seed: 11, kind: 'plain', body })
}

const p12 = () => {
  const crop = { x: 0, y: 0, w: 736, h: 925, sw: 736, sh: 981 }
  const pr = print({ k: 'grumpy-man.jpg', x: 150, y: 150, w: 640, h: Math.round((640 * 925) / 736), rot: -1.6, border: 15, seed: 12, z: 12, crop })
  const sw =
    swatch({ x: 880, y: 250, w: 190, h: 66, c: '#e8480a', rot: 2, label: 'wall: orange??', lc: PENCIL }) +
    swatch({ x: 880, y: 420, w: 190, h: 66, c: '#f6b51d', rot: -2, label: 'skin: yellow', lc: PENCIL }) +
    swatch({ x: 880, y: 590, w: 190, h: 66, c: '#2a9d50', rot: 1.5, label: 'shirt: green', lc: PENCIL })
  const [ex, ey] = pr.at(0.5, 0.33)
  const body =
    coffee({ x: 1000, y: 1250, d: 240, rot: -6, z: 6 }) +
    pr.html + pr.tapes(['tl', 'tr']) + sw +
    hand({ x: 880, y: 780, t: 'look at<br>those ears', size: 58, c: RED, rot: 5, z: 42, w: 260 }) +
    ink(arrowPath({ x1: 872, y1: 800, x2: pr.at(0.8, 0.42)[0] + 12, y2: pr.at(0.8, 0.42)[1] + 6, bend: -0.25, head: 22, c: RED, sw: 5 }), { z: 43 }) +
    heading('p-12', { x: 140, y: 1140, size: 90, lw: 720 }) +
    thumb({ x: 130, y: 1450, rot: 20, s: 1.0, op: 0.28 }) +
    crumbs({ x: 560, y: 1530, n: 7, spread: 140, seed: 12 }) +
    pageNo(12) + dogear({ side: 'l', s: 110 })
  void ex; void ey
  return pageHtml({ seed: 12, kind: 'dots', tone: 1, body })
}

const p13 = () => {
  const pr = print({ k: 'hatch-eye.jpg', x: 520, y: 150, w: 560, h: 996, rot: 1.4, border: 14, torn: true, bc: '#fbf8ee', seed: 13, z: 12 })
  const [ex, ey] = pr.at(0.7, 0.66)
  const ball = (cx, cy, r) =>
    `<defs><clipPath id="cb"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath></defs><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${PENCIL}" stroke-width="3.4"/><g clip-path="url(#cb)">${hatchPath(cx - r, cy - r, r * 2, r * 2, { gap: 13, sw: 2.2 })}${hatchPath(cx - r * 0.2, cy - r * 0.2, r * 1.2, r * 1.2, { gap: 9, sw: 2.2, cross: true })}</g>`
  const body =
    stain({ x: 270, y: 1330, w: 460, h: 340, rot: -6, op: 0.8 }) +
    pr.html + pr.tapes(['tl', 'br']) +
    heading('p-13', { x: 130, y: 190, size: 92, lw: 340, titleHtml: 'an eye<br>made of<br>lines', lineGap: 3.4, rot: -2 }) +
    ink(ball(220, 900, 110) + hatchPath(100, 1090, 260, 120, { gap: 10, sw: 2.2 }) + hatchPath(100, 1090, 260, 120, { gap: 10, sw: 2.2, cross: true }), { z: 41, pencil: true }) +
    hand({ x: 100, y: 1230, t: 'hatching test<br>(it takes patience)', size: 54, c: PENCIL, rot: -2, z: 42, w: 380 }) +
    hand({ x: 330, y: 800, t: 'the eye!', size: 62, c: RED, rot: -6, z: 42 }) +
    ink(arrowPath({ x1: 440, y1: 810, x2: ex - 34, y2: ey - 6, bend: -0.25, head: 24, c: RED, sw: 5 }), { z: 43 }) +
    thumb({ x: 110, y: 1500, rot: -20, s: 0.9, op: 0.26 }) +
    crumbs({ x: 420, y: 1530, n: 7, spread: 120, seed: 13 }) +
    pageNo(13) + dogear({ side: 'r', s: 110 })
  return pageHtml({ seed: 13, kind: 'plain', body })
}

const p14 = () => {
  const pr = print({ k: 'hatch-torso.jpg', x: 190, y: 160, w: 480, h: 652, rot: -2.4, border: 14, torn: true, bc: '#fbf8ee', seed: 14, z: 12 })
  const [rx, ry] = pr.at(0.5, 0.42)
  const body =
    coffee({ x: 960, y: 1200, d: 270, rot: 8, z: 6 }) +
    pr.html + pr.tapes(['tl', 'tr']) +
    hand({ x: 760, y: 280, t: 'ribs!', size: 70, c: RED, rot: 6, z: 42 }) +
    ink(arrowPath({ x1: 790, y1: 372, x2: rx + 64, y2: ry + 4, bend: 0.3, head: 24, c: RED, sw: 5 }), { z: 43 }) +
    hand({ x: 740, y: 520, t: 'little<br>lines on<br>lines on<br>lines', size: 56, c: PENCIL, rot: -3, z: 42, w: 300 }) +
    heading('p-14', { x: 150, y: 1000, size: 92, lw: 800 }) +
    ink(squigPath(170, 1330, 360, { c: PENCIL, sw: 3.6, amp: 12, n: 5, seed: 14 }) + starPath(820, 1380, 34, { c: PENCIL, sw: 3.6, seed: 7 }), { z: 41, pencil: true }) +
    thumb({ x: 1020, y: 960, rot: -30, s: 1.0, op: 0.28 }) +
    crumbs({ x: 540, y: 1520, n: 8, spread: 140, seed: 14 }) +
    smear({ x: 400, y: 900, w: 560, h: 60, rot: 2, op: 0.2 }) +
    pageNo(14) + dogear({ side: 'l', s: 110 })
  return pageHtml({ seed: 14, kind: 'plain', tone: -1, body })
}

const p15 = () => {
  const pr = print({ k: 'hatch-fruit.jpg', x: 230, y: 170, w: 740, h: Math.round((740 * 502) / 480), rot: -1.2, bare: true, seed: 15, z: 14 })
  const body =
    stain({ x: 900, y: 1010, w: 420, h: 300, rot: 16, op: 0.9 }) +
    pr.html +
    heading('p-15', { x: 170, y: 1110, size: 92, lw: 800 }) +
    hand({ x: 880, y: 960, t: 'tiny lines.<br>so many.', size: 56, c: RED, rot: 4, z: 42, w: 260 }) +
    ink(spiralPath(120, 520, 38, { c: PENCIL, sw: 3.6 }) + starPath(1070, 300, 30, { c: PENCIL, sw: 3.6, seed: 5 }) + squigPath(160, 1400, 300, { c: PENCIL, sw: 3.6, amp: 11, n: 5, seed: 15 }), { z: 41, pencil: true }) +
    coffee({ x: 1030, y: 1380, d: 230, rot: 0, z: 6 }) +
    thumb({ x: 150, y: 1470, rot: 15, s: 0.9, op: 0.28 }) +
    crumbs({ x: 600, y: 1530, n: 8, spread: 150, seed: 15 }) +
    pageNo(15) + dogear({ side: 'r', s: 110 })
  return pageHtml({ seed: 15, kind: 'plain', body })
}

const p16 = () => {
  const cols = ['#2b79d8', '#1f9ad6', '#6bb04a', '#e9d33b', '#e8480a', '#d4366a', '#7a4bb5', '#17121b']
  const sw = cols.map((c, i) => swatch({ x: 120 + (i % 2) * 300, y: 200 + Math.floor(i / 2) * 120, w: 250, h: 72, c, rot: (i % 3) - 1, z: 20 })).join('')
  const list = ['more hills', 'more lines', 'a hand (scary)']
  const todo =
    hand({ x: 130, y: 760, t: 'to draw next:', size: 84, font: 'Gochi Hand', c: FELT, rot: -2, pencil: false, z: 40 }) +
    ink(underPath(134, 860, 380, { c: RED, sw: 5, seed: 7 }), { z: 41 }) +
    list.map((t, i) => hand({ x: 200, y: 900 + i * 90, t, size: 62, c: PENCIL, rot: -1 + i * 0.6, z: 40 })).join('') +
    ink(list.map((_, i) => boxPath(130, 920 + i * 90, 40, { tick: false, seed: i + 30 })).join(''), { z: 41 })
  const tests =
    ink(loopsPath(760, 300, 330, { c: BIRO, sw: 3.4, n: 6, seed: 3 }) + loopsPath(760, 440, 330, { c: PENCIL, sw: 3.4, n: 7, seed: 5 }) + squigPath(760, 560, 330, { c: RED, sw: 4.6, amp: 20, n: 5, seed: 7 }), { z: 41 }) +
    hand({ x: 760, y: 610, t: 'testing, testing...', size: 56, c: BIRO, rot: -3, z: 42 })
  const body =
    coffee({ x: 900, y: 1180, d: 290, rot: 20, z: 6 }) +
    hand({ x: 120, y: 110, t: 'colour tests', size: 74, font: 'Gochi Hand', c: FELT, rot: -2, pencil: false, z: 40 }) +
    sw + tests + todo +
    sticky({ x: 790, y: 960, s: 250, rot: -5, c: '#f7df6a', t: 'so many<br>blues<br>in there', size: 44, font: 'Gochi Hand', z: 30 }) +
    thumb({ x: 250, y: 1460, rot: 28, s: 1.1, op: 0.28 }) +
    crumbs({ x: 600, y: 1520, n: 9, spread: 160, seed: 16 }) +
    smear({ x: 700, y: 760, w: 500, h: 80, rot: -4, op: 0.18 }) +
    pageNo(16) + dogear({ side: 'l', s: 110 })
  return pageHtml({ seed: 16, kind: 'dots', tone: 1, body })
}

const p17 = () => {
  const body =
    coffee({ x: 300, y: 1230, d: 340, rot: 8, z: 6 }) +
    stain({ x: 820, y: 400, w: 480, h: 380, rot: 20, op: 0.8 }) +
    hand({ x: 170, y: 330, t: "that's all,", size: 190, font: 'Gochi Hand', c: FELT, rot: -4, pencil: false, z: 40 }) +
    hand({ x: 250, y: 560, t: 'for now.', size: 170, font: 'Gochi Hand', c: FELT, rot: -3, pencil: false, z: 40 }) +
    ink(underPath(260, 770, 560, { c: RED, sw: 6, seed: 3 }), { z: 41 }) +
    hand({ x: 230, y: 850, t: 'thanks for flipping through.', size: 70, c: BIRO, rot: -2, z: 40 }) +
    hand({ x: 230, y: 940, t: 'more soon (probably).', size: 62, c: PENCIL, rot: -1, z: 40 }) +
    ink(starPath(900, 250, 50, { c: PENCIL, sw: 4, seed: 2 }) + starPath(1000, 330, 26, { c: PENCIL, sw: 3.6, seed: 4 }) + spiralPath(930, 1000, 58, { c: PENCIL, sw: 4 }) + squigPath(160, 1470, 320, { c: PENCIL, sw: 4, amp: 13, n: 5, seed: 2 }), { z: 41, pencil: true }) +
    blot({ x: 1000, y: 1160, d: 110 }) + blot({ x: 1068, y: 1240, d: 34 }) + blot({ x: 940, y: 1228, d: 20 }) +
    thumb({ x: 700, y: 1330, rot: 14, s: 1.2, op: 0.3 }) +
    crumbs({ x: 640, y: 1480, n: 10, spread: 170, seed: 17 }) +
    pageNo(17) + dogear({ side: 'r', s: 110 })
  return pageHtml({ seed: 17, kind: 'plain', tone: 1, body })
}

export const PAGES = [
  { id: 'cover', html: coverHtml },
  { id: 'p-02', html: p02 },
  { id: 'p-03', html: p03 },
  { id: 'p-04', html: p04 },
  { id: 'p-05', html: p05 },
  { id: 'p-06', html: p06 },
  { id: 'p-07', html: p07 },
  { id: 'p-08', html: p08 },
  { id: 'p-09', html: p09 },
  { id: 'p-10', html: p10 },
  { id: 'p-11', html: p11 },
  { id: 'p-12', html: p12 },
  { id: 'p-13', html: p13 },
  { id: 'p-14', html: p14 },
  { id: 'p-15', html: p15 },
  { id: 'p-16', html: p16 },
  { id: 'p-17', html: p17 },
  { id: 'back', html: backHtml },
]
