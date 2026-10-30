// Folder 09, A Portfolio for a Client: a film production folder. Manila inside, a typed call sheet, the five slides printed and fanned,
// a film strip of the deck, a red-pen SC 24, a sticky "TAKE 12", a clapper, tape, clips and a coffee ring.
import { pub, repo, sheet, pic, text, clip, tape, sticky, stamp, ring, hole, pen, SHADOW, kraft } from './lib.mjs'

const slide = (n) => pub(`works/concept-portfolio/art/slide-${n}.webp`)

export default function () {
  const call = [
    ['CLIENT', 'Ona Ribas, foley artist (invented)'],
    ['DECK', 'A five-slide portfolio, 9:16'],
    ['MY PART', 'The brief, the rules and the art direction'],
    ['TRY', 'Present, Design notes, Sound'],
  ]
  const frame = (n, i) => `<div class="a" style="left:${58 + i * 196}px;top:30px;width:172px;height:116px;background:#1b1b1f;border-radius:4px;overflow:hidden;box-shadow:inset 0 0 0 3px #0c0c0e"><img src="${slide(n)}" style="width:100%;height:100%;object-fit:cover;object-position:50% 14%;filter:saturate(1.05)"></div>`
  const perf = (y) => Array.from({ length: 28 }, (_, i) => `<div class="a" style="left:${14 + i * 38}px;top:${y}px;width:20px;height:14px;background:#e8cf86;border-radius:3px"></div>`).join('')
  const strip = (y, order, rot) => `<div class="a" style="left:-20px;top:${y}px;width:1130px;height:176px;transform:rotate(${rot}deg);background:#111114;z-index:3;box-shadow:${SHADOW.lift}">${perf(10)}${perf(152)}${order.map((n, i) => frame(n, i)).join('')}</div>`
  const inner = [
    // the two panels of the open folder: a crease down the middle
    `<div class="a" style="inset:0;z-index:1;background:linear-gradient(90deg,transparent 48.6%,rgba(60,40,10,.22) 49.6%,rgba(255,255,255,.22) 50.6%,transparent 52%)"></div>`,
    `<div class="a" style="left:0;top:0;width:100%;height:46px;z-index:2;background:linear-gradient(#0f5f77,#0b4f66);box-shadow:0 3px 8px rgba(0,0,0,.25)"></div>`,
    // left: the call sheet
    sheet({
      x: 46, y: 118, w: 440, h: 650, rot: -3.2, z: 6, shadow: SHADOW.lift,
      inner: [
        text({ x: 36, y: 34, t: 'CALL SHEET', font: 'Courier Prime', weight: 700, size: 40, ls: '.08em', c: '#171717' }),
        text({ x: 38, y: 88, t: 'PITCH DAY · TAKE 1', font: 'Courier Prime', size: 22, c: '#555' }),
        `<div class="a" style="left:36px;top:128px;width:368px;height:3px;background:#171717"></div>`,
        ...call.map(([k, v], i) => text({ x: 36, y: 154 + i * 98, t: k, font: 'Courier Prime', weight: 700, size: 20, c: '#b3261e' }) + text({ x: 36, y: 184 + i * 98, t: v, font: 'Courier Prime', size: 25, w: 370, c: '#222', lh: 1.2 })),
        text({ x: 40, y: 556, t: 'SC 24 · INT. KITCHEN · SALT', font: 'Courier Prime', size: 20, c: '#444' }),
      ].join(''),
    }),
    clip({ x: 360, y: 92, h: 130, rot: 8 }),
    pen({ kind: 'circle', x: 56, y: 650, w: 230, h: 70, c: '#c4271b', rot: -3, sw: 5 }),
    stamp({ x: 262, y: 688, t: 'CONCEPT', size: 34, c: '#1b6885', rot: -8 }),
    // right: the five slides, fanned
    pic({ src: slide(3), x: 640, y: 104, w: 300, h: 533, rot: 11, border: 9, z: 5, shadow: SHADOW.lift }),
    pic({ src: slide(2), x: 586, y: 134, w: 300, h: 533, rot: 4, border: 9, z: 7, shadow: SHADOW.lift }),
    pic({ src: slide(1), x: 536, y: 168, w: 300, h: 533, rot: -5, border: 9, z: 9, shadow: SHADOW.lift }),
    tape({ x: 690, y: 176, w: 140, rot: -10, c: 'rgba(242,162,154,.85)', z: 30 }),
    pic({ src: slide(5), x: 820, y: 460, w: 210, h: 373, rot: 8, border: 7, z: 10, shadow: SHADOW.lift }),
    // a sticky note and a ticket
    sticky({ x: 70, y: 812, s: 190, rot: -6, t: 'TAKE 12<br>(the kettle<br>screams!)', size: 33 }),
    pic({ src: repo('art-src/concept-portfolio/pieces/paper-ticket-red.webp'), x: 300, y: 826, w: 200, h: 130, rot: 8, fit: 'contain', z: 12, bc: 'transparent', shadow: 'none', imgExtra: 'filter:drop-shadow(0 3px 4px rgba(0,0,0,.35))' }),
    text({ x: 338, y: 872, t: 'ADMIT ONE', font: 'Courier Prime', weight: 700, size: 22, rot: 8, c: '#4a1208', z: 13 }),
    ring({ x: 690, y: 800, d: 190, rot: 20 }),
    // the film strip of the deck across the bottom
    `<div class="a" style="left:-20px;top:1010px;width:1130px;height:176px;transform:rotate(-2.2deg);background:#111114;z-index:14;box-shadow:${SHADOW.lift}">${perf(10)}${perf(152)}${[1, 2, 3, 4, 5].map((n, i) => frame(n, i)).join('')}</div>`,

    // more of the folder: the microphone from the cover, a clapperboard and a red pencil
    pic({ src: repo('art-src/concept-portfolio/pieces/mic.webp'), x: 690, y: 850, w: 300, h: 300, rot: 18, fit: 'contain', z: 11, bc: 'transparent', shadow: 'none', imgExtra: 'filter:drop-shadow(0 6px 7px rgba(0,0,0,.4))' }),
    `<div class="a" style="left:520px;top:930px;width:230px;height:150px;transform:rotate(-6deg);z-index:13;background:#16181c;border-radius:6px;box-shadow:${SHADOW.lift}"><div class="a" style="left:0;top:-34px;width:230px;height:40px;background:repeating-linear-gradient(115deg,#f2f2f2 0 26px,#16181c 26px 52px);border-radius:6px 6px 0 0;transform:rotate(-7deg);transform-origin:0 100%"></div><div style="position:absolute;left:14px;top:16px;right:14px;font:700 17px/1.9 'Courier Prime';color:#eee">SCENE 24<br>TAKE 12<br>KETTLE / CROW</div></div>`,
    `<div class="a" style="left:60px;top:1060px;width:360px;height:16px;transform:rotate(-4deg);z-index:12;background:linear-gradient(#e0412f,#b5281b);border-radius:3px 9px 9px 3px;box-shadow:0 3px 5px rgba(0,0,0,.35)"></div>`,
    // paper clip and a pencil-written note
    clip({ x: 880, y: 330, h: 120, rot: -12, z: 22 }),
    text({ x: 700, y: 1236, t: 'pitch day: one page', font: 'Gochi Hand', size: 40, c: '#1b3a46', rot: -3, z: 16 }),
    pen({ kind: 'under', x: 696, y: 1272, w: 270, h: 40, c: '#c4271b', rot: -3, sw: 4 }),
  ].join('')
  const body = `<div class="a" style="inset:0;transform:translateY(170px)">${inner}</div>` + strip(24, [3, 4, 5, 1, 2], 1.6) + clip({ x: 120, y: 20, h: 110, rot: 14, z: 30 })
  return { bg: kraft('#e6cd86'), body }
}
