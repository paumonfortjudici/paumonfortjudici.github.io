// The kit of the second build of the A Portfolio deck: the pieces (art-src/concept-portfolio/pieces, filed by tools/ingest_pf.py) are
// laid out in HTML and printed to 1080 x 1920 by render.mjs. This file has the helpers every slide uses: pieces (img / ink), torn paper,
// tape, the shared CSS, the filters (die-cut edge, hard shadow, torn edge), the paper grain and the page wrapper.
import fs from 'node:fs'

export const man = JSON.parse(fs.readFileSync(new URL('../pieces/pieces.json', import.meta.url), 'utf8'))
export const W = 1080
export const H = 1920

export const C = {
  teal: '#007E9B', butter: '#FDEFAF', deep: '#1B6885', steel: '#63A0AC', ink: '#101820', paper: '#F6F0DC', sun: '#F2C62F', tomato: '#E8553E',
  salmon: '#F2A29A', lilac: '#B58AD6', peri: '#7A8CE8', celery: '#9CCF9A', night: '#0B3C4E',
}

const size = (name, o) => {
  const m = man[name]
  if (!m) throw new Error('no piece called ' + name)
  const w = o.w ?? o.h * (m.w / m.h)
  return { w, h: w * (m.h / m.w) }
}

const pos = (o, w, h) => ({ l: o.l ?? o.x - w / 2, t: o.t ?? o.y - h / 2 })

/** a piece as a picture. x, y = its centre (or l, t = top left); w or h = its size; rot in degrees; cls = die | hard | none; z = layer */
export function img(name, o = {}) {
  const { w, h } = size(name, o)
  const { l, t } = pos(o, w, h)
  const tr = `rotate(${o.rot ?? 0}deg)${o.flip ? ' scaleX(-1)' : ''}`
  return `<img class="p ${o.cls ?? ''}" src="../../pieces/${name}.webp" style="left:${l.toFixed(1)}px;top:${t.toFixed(1)}px;width:${w.toFixed(1)}px;height:${h.toFixed(1)}px;transform:${tr};z-index:${o.z ?? 2};${o.op ? `opacity:${o.op};` : ''}${o.style ?? ''}" ${o.id ? `data-id="${o.id}"` : ''} alt="">`
}

/** a piece used as a stencil: its shape painted in colour c (prints, marks, notes) */
export function ink(name, o = {}) {
  const { w, h } = size(name, o)
  const { l, t } = pos(o, w, h)
  const tr = `rotate(${o.rot ?? 0}deg)${o.flip ? ' scaleX(-1)' : ''}`
  const url = `url(../../pieces/${name}.webp)`
  return `<i class="m ${o.cls ?? ''}" style="left:${l.toFixed(1)}px;top:${t.toFixed(1)}px;width:${w.toFixed(1)}px;height:${h.toFixed(1)}px;transform:${tr};z-index:${o.z ?? 1};background:${o.c ?? C.ink};-webkit-mask-image:${url};mask-image:${url};${o.op ? `opacity:${o.op};` : ''}${o.style ?? ''}" ${o.id ? `data-id="${o.id}"` : ''}></i>`
}

/** a sheet of paper with a torn edge and a hard shadow. l, t, w, h; c = colour */
export function paper(o) {
  return `<div class="paper" style="left:${o.l}px;top:${o.t}px;width:${o.w}px;height:${o.h}px;background:${o.c ?? C.paper};transform:rotate(${o.rot ?? 0}deg);z-index:${o.z ?? 1};${o.style ?? ''}" ${o.id ? `data-id="${o.id}"` : ''}>${o.inner ?? ''}</div>`
}

/** a strip of masking / washi tape. x, y = its centre, w, rot, c = colour */
export function tape(o) {
  const w = o.w ?? 150
  const h = o.h ?? 46
  return `<div class="tape" style="left:${o.x - w / 2}px;top:${o.y - h / 2}px;width:${w}px;height:${h}px;transform:rotate(${o.rot ?? -4}deg);background:${o.c ?? 'rgba(246,240,220,.82)'};z-index:${o.z ?? 6}"></div>`
}

/** halftone dots in a patch: l, t, w, h, c, r = dot size, fade = which side fades */
export function dots(o) {
  const p = o.p ?? 16
  return `<div class="dots" style="left:${o.l}px;top:${o.t}px;width:${o.w}px;height:${o.h}px;background-image:radial-gradient(circle at 50% 50%, ${o.c} ${o.r ?? 3.2}px, transparent ${(o.r ?? 3.2) + 0.7}px);background-size:${p}px ${p}px;-webkit-mask-image:linear-gradient(${o.fade ?? '90deg'}, #000 0%, transparent 100%);mask-image:linear-gradient(${o.fade ?? '90deg'}, #000 0%, transparent 100%);z-index:${o.z ?? 0};opacity:${o.op ?? 1}"></div>`
}

const FONT_CSS = `
@font-face{font-family:"Anybody";font-style:normal;font-weight:100 900;font-stretch:50% 150%;src:url("../fonts/anybody-latin-wdth-normal.woff2") format("woff2-variations")}
@font-face{font-family:"Syne";font-weight:600;src:url("../fonts/syne-latin-600-normal.woff2") format("woff2")}
@font-face{font-family:"Syne";font-weight:700;src:url("../fonts/syne-latin-700-normal.woff2") format("woff2")}
@font-face{font-family:"Syne";font-weight:800;src:url("../fonts/syne-latin-800-normal.woff2") format("woff2")}
@font-face{font-family:"DM Sans";font-style:normal;font-weight:100 1000;src:url("../fonts/dm-sans-latin-wght-normal.woff2") format("woff2-variations")}
@font-face{font-family:"DM Sans";font-style:italic;font-weight:100 1000;src:url("../fonts/dm-sans-latin-wght-italic.woff2") format("woff2-variations")}
`

const GRAIN = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360"><filter id="n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .06  0 0 0 0 .08  0 0 0 0 .1  0 0 0 1.15 -.42"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`,
)
const FIBRE = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><filter id="f" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".012 .22" numOctaves="3" seed="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .55  0 0 0 0 .45  0 0 0 0 .3  0 0 0 .5 -.12"/></filter><rect width="100%" height="100%" filter="url(#f)"/></svg>`,
)

const CSS = `${FONT_CSS}
:root{--teal:${C.teal};--butter:${C.butter};--deep:${C.deep};--steel:${C.steel};--ink:${C.ink};--paper:${C.paper};--sun:${C.sun};--tomato:${C.tomato};--salmon:${C.salmon};--lilac:${C.lilac};--peri:${C.peri};--celery:${C.celery};--night:${C.night}}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;background:#222;overflow:hidden}
.slide{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:var(--field);isolation:isolate}
.p{position:absolute;display:block;max-width:none;transform-origin:50% 50%}
.m{position:absolute;display:block;-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}
.die{filter:url(#die)}
.hard{filter:url(#hard)}
.hard-s{filter:url(#hard-s)}
.paper{position:absolute;filter:url(#torn)}
.tape{position:absolute;opacity:.92;clip-path:polygon(0 8%,3% 0,6% 10%,9% 0,100% 0,97% 12%,100% 24%,97% 36%,100% 50%,97% 64%,100% 78%,97% 90%,100% 100%,9% 100%,6% 88%,3% 100%,0 92%,2% 76%,0 62%,2% 48%,0 34%,2% 20%);box-shadow:inset 0 0 0 1px rgba(16,24,32,.08);background-image:linear-gradient(90deg,rgba(255,255,255,.18) 0 2px,transparent 2px 9px);filter:drop-shadow(0 2px 0 rgba(16,24,32,.22))}
.dots{position:absolute}
.grain{position:absolute;inset:0;z-index:50;pointer-events:none;mix-blend-mode:multiply;opacity:.55;background-image:url("data:image/svg+xml,${GRAIN}")}
.fibre{position:absolute;inset:0;z-index:49;pointer-events:none;mix-blend-mode:multiply;opacity:.35;background-image:url("data:image/svg+xml,${FIBRE}")}
.txt{position:absolute;left:0;top:0;width:${W}px;height:${H}px;z-index:40;overflow:visible}
.t-display{font-family:"Anybody","Arial Black",sans-serif;font-weight:700;font-stretch:140%}
.t-sc{font-family:"Syne","Arial",sans-serif;font-weight:700;letter-spacing:.09em;font-variant-numeric:lining-nums}
.t-smcp{font-family:"Syne","Arial",sans-serif;font-weight:700;font-variant-caps:small-caps;letter-spacing:.06em;font-variant-numeric:lining-nums}
.t-body{font-family:"DM Sans","Arial",sans-serif;font-weight:500}
.t-body-i{font-family:"DM Sans","Arial",sans-serif;font-weight:500;font-style:italic}
.t-label{font-family:"Syne","Arial",sans-serif;font-weight:700;letter-spacing:.1em;font-variant-numeric:lining-nums}
.lab{position:absolute;z-index:8;font-family:"Syne","Arial",sans-serif;font-weight:700;letter-spacing:.08em;font-size:18px;line-height:1;color:var(--ink);background:var(--butter);padding:7px 11px 6px;filter:url(#torn-s);white-space:nowrap}
`

/** the SVG filters every slide shares: the die-cut edge (a cream border cut with scissors, then a hard ink shadow), the hard shadow, the torn paper */
const FILTERS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<filter id="die" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB">
 <feMorphology in="SourceAlpha" operator="dilate" radius="8" result="d0"/>
 <feTurbulence type="fractalNoise" baseFrequency=".022" numOctaves="2" seed="4" result="t"/>
 <feDisplacementMap in="d0" in2="t" scale="9" xChannelSelector="R" yChannelSelector="G" result="d"/>
 <feFlood flood-color="${C.paper}"/><feComposite in2="d" operator="in" result="cream"/>
 <feOffset in="d" dx="9" dy="11" result="o"/><feFlood flood-color="${C.ink}"/><feComposite in2="o" operator="in" result="ink"/>
 <feMerge><feMergeNode in="ink"/><feMergeNode in="cream"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
<filter id="hard" x="-6%" y="-6%" width="112%" height="112%" color-interpolation-filters="sRGB">
 <feOffset in="SourceAlpha" dx="8" dy="10" result="o"/><feFlood flood-color="${C.ink}"/><feComposite in2="o" operator="in" result="ink"/>
 <feMerge><feMergeNode in="ink"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
<filter id="hard-s" x="-6%" y="-6%" width="112%" height="112%" color-interpolation-filters="sRGB">
 <feOffset in="SourceAlpha" dx="4" dy="5" result="o"/><feFlood flood-color="${C.ink}"/><feComposite in2="o" operator="in" result="ink"/>
 <feMerge><feMergeNode in="ink"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
<filter id="torn" x="-4%" y="-4%" width="108%" height="108%" color-interpolation-filters="sRGB">
 <feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="3" seed="11" result="t"/>
 <feDisplacementMap in="SourceGraphic" in2="t" scale="11" xChannelSelector="R" yChannelSelector="G" result="g"/>
 <feOffset in="g" dx="9" dy="11" result="o"/><feColorMatrix in="o" type="matrix" values="0 0 0 0 .063  0 0 0 0 .094  0 0 0 0 .125  0 0 0 1 0" result="ink"/>
 <feMerge><feMergeNode in="ink"/><feMergeNode in="g"/></feMerge>
</filter>
<filter id="torn-s" x="-6%" y="-20%" width="112%" height="140%" color-interpolation-filters="sRGB">
 <feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="2" seed="5" result="t"/>
 <feDisplacementMap in="SourceGraphic" in2="t" scale="5" xChannelSelector="R" yChannelSelector="G" result="g"/>
 <feOffset in="g" dx="4" dy="5" result="o"/><feColorMatrix in="o" type="matrix" values="0 0 0 0 .063  0 0 0 0 .094  0 0 0 0 .125  0 0 0 1 0" result="ink"/>
 <feMerge><feMergeNode in="ink"/><feMergeNode in="g"/></feMerge>
</filter>
</defs></svg>`

/** the page of one slide: field colour, layers in `body`, the old deck's SVG text in `text` (baseline coordinates of the 1080 x 1920 slide) */
export function page({ field, body, text }) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>slide</title><style>${CSS}</style></head><body><div class="slide" style="--field:${field}">${FILTERS}${body}<div class="fibre"></div><svg class="txt" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${text}</svg><div class="grain"></div></div></body></html>`
}

/** the header and footer row of every slide: kicker left, count right (the same baseline and size on every slide) */
export const chrome = (left, right, fill) =>
  `<g class="t-sc" font-size="28" fill="${fill}"><text x="72" y="112">${left}</text><text x="1010.5" y="112" text-anchor="end">${right}</text></g>`

/** a row of text lines: lines = [string], x, y of the first baseline, step */
export const lines = (cls, size, fill, x, y, step, arr, extra = '') =>
  `<g class="${cls}" font-size="${size}" fill="${fill}" ${extra}>${arr.map((s, i) => `<text x="${x}" y="${y + i * step}">${s}</text>`).join('')}</g>`

/** a footprint trail: a list of [name, x, y, rot] printed in colour c (pieces print-01..06 are boot soles, toe up) */
export const trail = (pts, c, z = 1, w = 74) => pts.map(([n, x, y, rot, flip]) => ink(n, { x, y, w, rot, c, z, flip, op: 0.95 })).join('')
