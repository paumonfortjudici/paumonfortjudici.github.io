// Folder 06, Procreate Sketchbook: the inside of a dusty-pink folder with the battered sketchbook open across it (two real pages of the book),
// a loose black print of the five faces, a die-cut portrait sticker, a yellow sticky note, a pencil, an eraser, a ruler, a coffee ring and
// a black elastic strap. The pages are the pictures of the world (public/works/procreate/book/), so the card shows the real book.
import { pub, repo, sheet, tape, ring, sticky, text, SHADOW } from './lib.mjs'

const BOOK = (id) => pub(`works/procreate/book/${id}.webp`)
const SRC = (f) => repo(`art-src/sketchbook/sources/${f}`)
const PINK = '#f088b9'
const INK = '#3f3d48'

const DS = (a = 1) => `drop-shadow(0 1px 1px rgba(70,15,45,${0.3 * a})) drop-shadow(0 10px 12px rgba(70,15,45,${0.34 * a}))`

const pencilSvg = (w, rot, x, y, z = 24) => `<svg class="a" style="left:${x}px;top:${y}px;width:${w}px;transform:rotate(${rot}deg);z-index:${z};filter:${DS()}" viewBox="0 0 480 44"><path d="M2 22 L48 5 L48 39 Z" fill="#f1d3a3"/><path d="M2 22 L16 16.8 L16 27.2 Z" fill="#3d3b42"/><rect x="48" y="5" width="330" height="34" fill="#ffc83a"/><rect x="48" y="5" width="330" height="9" fill="#ffe487"/><rect x="48" y="30" width="330" height="9" fill="#d98e00"/><rect x="378" y="3" width="42" height="38" fill="#b9bec7"/><path d="M386 3v38M394 3v38M402 3v38M410 3v38" stroke="#7d8490" stroke-width="2"/><rect x="420" y="5" width="48" height="34" rx="9" fill="#ff8fc1"/></svg>`
const eraserSvg = (w, rot, x, y, z = 24) => `<svg class="a" style="left:${x}px;top:${y}px;width:${w}px;transform:rotate(${rot}deg);z-index:${z};filter:${DS()}" viewBox="0 0 170 76"><rect x="4" y="8" width="162" height="62" rx="10" fill="#cfc8ba"/><rect x="4" y="3" width="162" height="62" rx="10" fill="#f7f2e7"/><rect x="52" y="3" width="66" height="62" fill="#2b79d8"/><rect x="52" y="3" width="66" height="10" fill="#5b9be9"/><path d="M62 34h46M62 44h30" stroke="#f7f2e7" stroke-width="4" stroke-linecap="round"/></svg>`
const rulerSvg = (w, rot, x, y, z = 8) => {
  let t = ''
  for (let mm = 0; mm <= 150; mm++) {
    const px = 20 + mm * 4
    t += mm % 10 === 0 ? `M${px} 6v26` : mm % 5 === 0 ? `M${px} 6v18` : `M${px} 6v11`
  }
  return `<svg class="a" style="left:${x}px;top:${y}px;width:${w}px;transform:rotate(${rot}deg);z-index:${z};filter:${DS(0.8)}" viewBox="0 0 640 74"><rect x="2" y="9" width="636" height="62" rx="5" fill="#bf9c5e"/><rect x="2" y="3" width="636" height="62" rx="5" fill="#ecd08f"/><path d="${t}" stroke="#3d3b42" stroke-width="1.8" fill="none" opacity=".85"/></svg>`
}

/** an open book: two pages side by side in a black cloth cover, page edges showing at the bottom */
const openBook = ({ x, y, pw, left, right, rot = 0, z = 6 }) => {
  const ph = Math.round((pw * 4) / 3)
  const pad = 16
  const w = pw * 2 + pad * 2
  const h = ph + pad * 2
  return `<div class="a" style="left:${x}px;top:${y}px;width:${w}px;height:${h + 14}px;transform:rotate(${rot}deg);z-index:${z};filter:${DS(1.25)}">
    <div class="a" style="left:0;top:14px;width:${w}px;height:${h}px;background:#16151a;border-radius:10px;box-shadow:inset 0 0 0 2px rgba(255,255,255,.06)"></div>
    <div class="a" style="left:${pad - 3}px;top:${pad + 12}px;width:${pw * 2 + 6}px;height:${ph + 8}px;background:repeating-linear-gradient(0deg,#e9dfc6 0 2px,#cdbf9b 2px 3px);border-radius:3px"></div>
    <img class="a" src="${left}" style="left:${pad}px;top:${pad + 4}px;width:${pw}px;height:${ph}px" alt="">
    <img class="a" src="${right}" style="left:${pad + pw}px;top:${pad + 4}px;width:${pw}px;height:${ph}px" alt="">
    <div class="a" style="left:${pad + pw - 46}px;top:${pad + 4}px;width:46px;height:${ph}px;background:linear-gradient(90deg,rgba(60,38,18,0),rgba(60,38,18,.42))"></div>
    <div class="a" style="left:${pad + pw}px;top:${pad + 4}px;width:46px;height:${ph}px;background:linear-gradient(270deg,rgba(60,38,18,0),rgba(60,38,18,.42))"></div>
  </div>`
}

export default () => {
  const body = [
    // the elastic strap, behind everything but the sheets
    `<div class="a" style="left:928px;top:-10px;width:34px;height:1380px;background:repeating-linear-gradient(0deg,#17151b 0 3px,#24212a 3px 5px);box-shadow:0 0 0 1px rgba(0,0,0,.4),3px 0 8px rgba(70,15,45,.35);z-index:3"></div>`,
    rulerSvg(780, -1.5, 70, 112),
    ring({ x: 930, y: 255, d: 210, rot: 6, z: 4 }),
    // the sketchbook, open across the middle (hills | houses)
    openBook({ x: 84, y: 408, pw: 420, left: BOOK('p-04'), right: BOOK('p-05'), rot: -2.6, z: 6 }),
    // the black print of five faces, loose, slipping under the book's corner
    sheet({ x: 690, y: 880, w: 292, h: 386, rot: 8, c: '#fbf8ee', z: 12, shadow: SHADOW.lift, extra: 'padding:12px;', inner: `<img src="${SRC('five-faces.jpg')}" style="display:block;width:100%;height:100%;object-fit:cover;object-position:50% 40%" alt="">` }),
    tape({ x: 826, y: 892, w: 150, h: 42, rot: -4, z: 30 }),
    // a die-cut portrait sticker
    `<img class="a" src="${SRC('portrait-cap.webp')}" style="left:36px;top:178px;width:262px;transform:rotate(-12deg);z-index:14;filter:drop-shadow(4px 0 0 #fbf6ea) drop-shadow(-4px 0 0 #fbf6ea) drop-shadow(0 4px 0 #fbf6ea) drop-shadow(0 -4px 0 #fbf6ea) drop-shadow(0 8px 8px rgba(70,15,45,.45))" alt="">`,
    sticky({ x: 70, y: 1010, s: 236, rot: -6, c: '#f7df6a', t: 'too orange??<br>(no. keep it)', size: 36, font: 'Gochi Hand', z: 16 }),
    pencilSvg(400, -3, 330, 1196, 22),
    eraserSvg(150, -8, 90, 1262, 22),
    text({ x: 380, y: 1100, t: 'just for fun', font: 'Gochi Hand', size: 54, c: '#7a1450', rot: -4, z: 20, extra: 'opacity:.82' }),
  ].join('')
  return { bg: `${PINK}`, css: '', body }
}
