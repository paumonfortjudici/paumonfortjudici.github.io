// Generates kit/motifs.svg : recurring storytelling motifs as <symbol>s (footprints, waveforms, tape, arrows, sound arcs, impact lines, tags, frames).
// Usage: node kit/gen-motifs.mjs
// Fill-type symbols (fp-*, wv-*, tape, tag-a, fx-dots) take their colour from fill= on the <use>.
// Stroke-type symbols (arr-*, fx-*) take stroke= and stroke-width= from the <use> (they are fill="none", round caps).
// Frames (fr-*) are two-colour (paper + ink) and fixed.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const f2 = (n) => (Math.round(n * 100) / 100).toString()
function rng(seed) {
  let a = seed >>> 0
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}

// ---------- footprints: boot sole, right foot, toe up, viewBox 0 0 200 520 ----------
// right foot seen from below, toe up: arch (waist) on the LEFT, straight lateral edge on the RIGHT, squarer heel, zig-zag tread cut by a mask
const forefoot = 'M72 10C122 0 176 22 190 80C198 118 194 160 186 200C180 232 172 256 162 274C150 292 112 290 100 270C84 240 62 216 38 180C12 140 2 96 18 56C28 30 48 14 72 10Z'
const heel = 'M100 338C102 318 180 316 186 342C192 394 186 450 162 488C148 510 114 512 102 490C88 462 94 394 100 338Z'
const zig = (y, x0 = -10, x1 = 214, step = 36, amp = 13) => {
  let d = 'M' + x0 + ' ' + y, up = true
  for (let x = x0 + step / 2; x <= x1 + step; x += step / 2) { d += 'L' + x + ' ' + (up ? y - amp : y); up = !up }
  return d
}
const tread = [96, 158, 220].map((y) => zig(y, -10, 214, 44, 17)).join('') + [392, 452].map((y) => zig(y, 80, 214, 38, 14)).join('')
const sole = '' // (kept for the preview helper below)

// ---------- waveform bars ----------
function wave({ n, seed, shape }) {
  const rnd = rng(seed), bw = 14, pitch = 24
  let rects = ''
  let maxH = 0
  const hs = []
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    let env
    if (shape === 'speech') env = 0.25 + 0.75 * Math.abs(Math.sin(t * Math.PI * 3.1 + 0.4)) * (0.6 + 0.4 * Math.sin(t * 9))
    else if (shape === 'build') env = 0.12 + 0.88 * Math.pow(t, 1.5)
    else env = 0.15 + 0.85 * Math.sin(t * Math.PI)
    const h = Math.max(bw, Math.round(env * (150 + rnd() * 90)))
    hs.push(h); maxH = Math.max(maxH, h)
  }
  hs.forEach((h, i) => { rects += `<rect x="${i * pitch}" y="${-h / 2}" width="${bw}" height="${h}" rx="7"/>` })
  const W = (n - 1) * pitch + bw
  return { svg: `<symbol id="wv-${shape === 'speech' ? 'a' : shape === 'build' ? 'b' : 'c'}" viewBox="0 ${-maxH / 2 - 2} ${W} ${maxH + 4}" overflow="visible">${rects}</symbol>`, W, H: maxH + 4 }
}

// ---------- sound arcs ----------
function arcs() {
  let d = ''
  ;[44, 92, 142].forEach((r, i) => {
    const a0 = (-40 * Math.PI) / 180, a1 = (40 * Math.PI) / 180
    const x0 = Math.cos(a0) * r, y0 = Math.sin(a0) * r, x1 = Math.cos(a1) * r, y1 = Math.sin(a1) * r
    d += `M${f2(x0)} ${f2(y0)}A${r} ${r} 0 0 1 ${f2(x1)} ${f2(y1)}`
  })
  return d
}
// ---------- impact lines ----------
function impact(seed = 3) {
  const rnd = rng(seed)
  let d = ''
  const n = 7
  for (let i = 0; i < n; i++) {
    const a = ((i / n) * 360 + rnd() * 14) * (Math.PI / 180)
    const r0 = 62 + rnd() * 8, r1 = 100 + rnd() * 34
    d += `M${f2(Math.cos(a) * r0)} ${f2(Math.sin(a) * r0)}L${f2(Math.cos(a) * r1)} ${f2(Math.sin(a) * r1)}`
  }
  return d
}

const symbols = []
symbols.push(`<!-- fp-boot-r / fp-boot-l : boot-sole footprint, toe up, 200x520 box (right / left foot). Fill from <use fill>. Trail: alternate r/l every ~150 px along a curve, rotate each +-8deg off the path. -->
  <symbol id="fp-boot-r" viewBox="0 0 200 520"><mask id="fp-m" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="520"><rect width="200" height="520" fill="#fff"/><path fill="none" stroke="#000" stroke-width="13" stroke-linejoin="round" stroke-linecap="round" d="${tread}"/></mask><g mask="url(#fp-m)"><path d="${forefoot}"/><path d="${heel}"/></g></symbol>
  <symbol id="fp-boot-l" viewBox="0 0 200 520"><g transform="translate(200 0) scale(-1 1)"><g mask="url(#fp-m)"><path d="${forefoot}"/><path d="${heel}"/></g></g></symbol>`)
const wa = wave({ n: 40, seed: 7, shape: 'speech' }), wb = wave({ n: 30, seed: 4, shape: 'build' }), wc = wave({ n: 26, seed: 9, shape: 'hill' })
symbols.push(`<!-- wv-a / wv-b / wv-c : audio waveform bars (a = speech-like 40 bars, b = crescendo 30 bars, c = hill 26 bars). Fill from <use fill>. Natural widths: a ${wa.W}, b ${wb.W}, c ${wc.W}. -->
  ${wa.svg}
  ${wb.svg}
  ${wc.svg}`)
symbols.push(`<!-- tape : washi tape strip with torn ends, 260x72. Use with fill + opacity .85 -->
  <symbol id="tape" viewBox="0 0 260 72"><path d="M2 2L258 0L252 10L260 20L253 30L261 40L252 50L260 60L254 72L2 70L9 61L1 51L8 41L0 31L8 21L1 11L8 2Z"/></symbol>`)
symbols.push(`<!-- tag-a : hanging label tag with punched hole, 260x90 (set text on top, 26px Syne caps). Fill from <use fill>. -->
  <symbol id="tag-a" viewBox="0 0 260 90"><path fill-rule="evenodd" d="M32 2H248Q258 2 258 12V78Q258 88 248 88H32L2 45ZM40 45a8 8 0 1 0 0.01 0Z"/></symbol>`)
const head = (tip, from, len = 34, ang = 36) => {
  const dx = from[0] - tip[0], dy = from[1] - tip[1], l = Math.hypot(dx, dy)
  const ux = dx / l, uy = dy / l, a = (ang * Math.PI) / 180
  const rot = (s) => [tip[0] + len * (ux * Math.cos(s * a) - uy * Math.sin(s * a)), tip[1] + len * (ux * Math.sin(s * a) + uy * Math.cos(s * a))]
  const p = rot(1), q = rot(-1)
  return `M${f2(p[0])} ${f2(p[1])}L${f2(tip[0])} ${f2(tip[1])}L${f2(q[0])} ${f2(q[1])}`
}
symbols.push(`<!-- tag-b : WIDE label tag (600x96) for a line of text up to ~26 caps characters at 24 px. Fill from <use fill>. -->
  <symbol id="tag-b" viewBox="0 0 600 96"><path fill-rule="evenodd" d="M44 2H588Q598 2 598 12V84Q598 94 588 94H44L2 48ZM52 48a8 8 0 1 0 0.01 0Z"/></symbol>`)
symbols.push(`<!-- arr-curl / arr-loop / arr-wavy : hand-drawn arrows (stroke type: give stroke + stroke-width on the <use>). -->
  <symbol id="arr-curl" viewBox="0 0 230 130" overflow="visible"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M10 112C40 30 138 6 204 66"/><path d="${head([204, 66], [138, 6])}"/></g></symbol>
  <symbol id="arr-loop" viewBox="0 0 230 140" overflow="visible"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M8 122C40 112 82 92 100 62C118 32 92 8 70 24C50 40 70 76 104 64C140 52 170 38 206 44"/><path d="${head([206, 44], [170, 38])}"/></g></symbol>
  <symbol id="arr-wavy" viewBox="0 0 220 80" overflow="visible"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M8 44C60 28 118 62 192 40"/><path d="${head([192, 40], [118, 62])}"/></g></symbol>`)
symbols.push(`<!-- fx-waves : 3 sound arcs radiating to the right from 0,0 (stroke type). fx-impact : 7 radial hit dashes around 0,0 (stroke type). fx-squig : wavy line (stroke type). -->
  <symbol id="fx-waves" viewBox="-6 -150 160 300" overflow="visible"><g fill="none" stroke-linecap="round"><path d="${arcs()}"/></g></symbol>
  <symbol id="fx-impact" viewBox="-140 -140 280 280" overflow="visible"><g fill="none" stroke-linecap="round"><path d="${impact()}"/></g></symbol>
  <symbol id="fx-squig" viewBox="0 -24 180 48" overflow="visible"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 0Q19-26 34 0T64 0T94 0T124 0T154 0T176 -6"/></g></symbol>`)

// ---------- hand-framed paper pieces (two-colour, fixed) ----------
// paper = slightly skewed quad (offset inside the frame lines = print misregistration); frame lines = partial ink, loose corners; a small scribble signature
const PAPER = '#F6F0DC', INK = '#101820'
const frame = (id, w, h, sk) => {
  const r = rng(w * 7 + h)
  const j = () => (r() - 0.5) * sk
  const p = [[10 + j(), 14 + j()], [w - 8 + j(), 6 + j()], [w - 4 + j(), h - 8 + j()], [6 + j(), h - 2 + j()]]
  const paper = `M${p.map((q) => f2(q[0]) + ' ' + f2(q[1])).join('L')}Z`
  const L = (x0, y0, x1, y1) => `M${f2(x0)} ${f2(y0)}L${f2(x1)} ${f2(y1)}`
  const lines =
    L(-6, 2 + j(), w - 12, -2 + j()) + // top, overshoots left
    L(-2 + j(), 6, 4 + j(), h - 14) + // left
    L(w - 2 + j(), 18, w + 2 + j(), h * 0.72) + // right, stops short
    L(10, h + 2 + j(), w * 0.7, h - 4 + j()) // bottom, stops short
  const sig = `M${f2(w - 70)} ${f2(h - 22)}c6-14 12-14 14 0c2-12 10-14 14 0c2-10 9-12 12-2`
  return `<symbol id="${id}" viewBox="-10 -10 ${w + 20} ${h + 20}" overflow="visible"><path fill="${PAPER}" d="${paper}"/><g fill="none" stroke="${INK}" stroke-linecap="round" stroke-linejoin="round"><path stroke-width="9" d="${lines}"/><path stroke-width="5" d="${sig}"/></g></symbol>`
}
symbols.push(`<!-- fr-a (portrait 300x380) / fr-b (landscape 380x300) / fr-c (square 320x320) : paper + loose hand-inked frame + scribble signature. Draw the content ON TOP, inside the paper. Do not recolour. -->
  ${frame('fr-a', 300, 380, 7)}
  ${frame('fr-b', 380, 300, 7)}
  ${frame('fr-c', 320, 320, 7)}`)

const defs = symbols.join('\n  ')

// ---------- preview ----------
const use = (id, x, y, w, h, extra = '') => `<use href="#${id}" x="${x}" y="${y}" width="${w}" height="${h}" ${extra}/>`
const label = (t, x, y) => `<text x="${x}" y="${y}" font-family="sans-serif" font-size="18" fill="#101820">${t}</text>`
let prev = ''
prev += use('fp-boot-r', 60, 40, 78, 203, 'fill="#1B6885"') + use('fp-boot-l', 160, 120, 78, 203, 'fill="#1B6885"') + use('fp-boot-r', 260, 40, 78, 203, 'fill="#E8553E" transform="rotate(-8 299 141)"') + label('fp-boot-r / -l', 60, 360)
prev += use('wv-a', 400, 60, 460, 70, 'fill="#101820"') + use('wv-b', 400, 160, 400, 70, 'fill="#007E9B"') + use('wv-c', 400, 260, 360, 70, 'fill="#E8553E"') + label('wv-a / wv-b / wv-c', 400, 360)
prev += use('tape', 880, 60, 160, 44, 'fill="#F2A29A" opacity=".85"') + use('tag-a', 880, 120, 130, 45, 'fill="#F2C62F"') + use('tag-b', 880, 180, 180, 29, 'fill="#E8553E"') + label('tape, tag-a, tag-b', 880, 240)
prev += use('arr-curl', 60, 420, 200, 113, 'stroke="#101820" stroke-width="7"') + use('arr-loop', 300, 420, 200, 122, 'stroke="#101820" stroke-width="7"') + use('arr-wavy', 540, 420, 200, 73, 'stroke="#101820" stroke-width="7"') + label('arr-curl / arr-loop / arr-wavy', 60, 570)
prev += use('fx-waves', 800, 400, 120, 225, 'stroke="#007E9B" stroke-width="9"') + use('fx-impact', 920, 410, 140, 140, 'stroke="#E8553E" stroke-width="8"') + use('fx-squig', 800, 640, 180, 48, 'stroke="#101820" stroke-width="7"') + label('fx-waves, fx-impact, fx-squig', 720, 700)
prev += use('fr-a', 60, 740, 240, 304) + use('fr-b', 340, 770, 304, 240) + use('fr-c', 690, 750, 256, 256) + label('fr-a / fr-b / fr-c  (paper + frame, fixed colours)', 60, 1100)

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1140" viewBox="0 0 1080 1140">
<title>Ona Ribas concept portfolio - kit/motifs.svg</title>
<!-- GENERATED by kit/gen-motifs.mjs - edit the generator, not this file.
     Fill-type: <use href="#fp-boot-r" x= y= width= height= fill="#..."/>   Stroke-type: <use href="#arr-curl" ... stroke="#101820" stroke-width="7"/>
     Reserved ids: fp-*, wv-*, tape, tag-a, tag-b, arr-*, fx-*, fr-*. -->
<defs id="kit-motifs">
  ${defs}
</defs>
<rect width="1080" height="1140" fill="#FDEFAF"/>
${prev}
</svg>
`
fs.writeFileSync(path.join(HERE, 'motifs.svg'), svg)
console.log('wrote kit/motifs.svg', svg.length, 'bytes')
