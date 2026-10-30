// Kit for the "inside of the folder" pictures of the Works cards (public/works/<slug>/inside.webp): each one is the inside of an open
// project folder, full of papers (real pages of the project, notes, photos, tags), in a style of its own.
// A picture is 1080 x 1350 (4:5), laid out in absolute pixels in HTML, printed by render.mjs. Helpers below return HTML strings.
// The card shows it with object-fit: cover: on wide screens only the middle band (about y 270 to 1080, 3:2) is seen, so put what identifies
// the project inside that band and let paper, shadows and clutter fill the rest. Nothing is ever cut at the left and right edges.
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
export const ROOT = path.resolve(here, '..', '..')
export const W = 1080
export const H = 1350

/** a file of public/ (e.g. pub('works/contract/pages/p-002.webp')) as a file URL */
export const pub = (p) => pathToFileURL(path.join(ROOT, 'public', p)).href
/** any file of the repo (e.g. repo('art-src/concept-portfolio/pieces/mic.webp')) as a file URL */
export const repo = (p) => pathToFileURL(path.join(ROOT, p)).href
const nm = (p) => pathToFileURL(path.join(ROOT, 'node_modules', p)).href
const v2 = (p) => pathToFileURL(path.join(ROOT, 'art-src', 'concept-portfolio', 'v2', 'fonts', p)).href

const ff = (family, url, weight = 400, style = 'normal', extra = '') => `@font-face{font-family:"${family}";src:url("${url}") format("woff2");font-weight:${weight};font-style:${style};${extra}}`
/** families you can use in font-family: names in quotes */
export const FONT_CSS = [
  ff('Gochi Hand', nm('@fontsource/gochi-hand/files/gochi-hand-latin-400-normal.woff2')), // handwriting, marker
  ff('Reenie Beanie', nm('@fontsource/reenie-beanie/files/reenie-beanie-latin-400-normal.woff2')), // thin scribble
  ff('Gloria Hallelujah', nm('@fontsource/gloria-hallelujah/files/gloria-hallelujah-latin-400-normal.woff2')), // round pen
  ff('Courier Prime', nm('@fontsource/courier-prime/files/courier-prime-latin-400-normal.woff2'), 400), // typewriter
  ff('Courier Prime', nm('@fontsource/courier-prime/files/courier-prime-latin-700-normal.woff2'), 700),
  ff('DM Mono', nm('@fontsource/dm-mono/files/dm-mono-latin-500-normal.woff2'), 500), // labels
  ff('Chango', nm('@fontsource/chango/files/chango-latin-400-normal.woff2')), // fat display
  ff('Shrikhand', nm('@fontsource/shrikhand/files/shrikhand-latin-400-normal.woff2')), // fat italic display
  ff('Cherry Bomb One', nm('@fontsource/cherry-bomb-one/files/cherry-bomb-one-latin-400-normal.woff2')),
  ff('Barlow Semi Condensed', nm('@fontsource/barlow-semi-condensed/files/barlow-semi-condensed-latin-600-normal.woff2'), 600),
  ff('Barlow Semi Condensed', nm('@fontsource/barlow-semi-condensed/files/barlow-semi-condensed-latin-800-normal.woff2'), 800),
  ff('Fira Sans', nm('@fontsource/fira-sans/files/fira-sans-latin-500-normal.woff2'), 500),
  ff('Fraunces', nm('@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2'), '100 900'),
  ff('Fraunces', nm('@fontsource-variable/fraunces/files/fraunces-latin-wght-italic.woff2'), '100 900', 'italic'),
  ff('Cormorant', nm('@fontsource-variable/cormorant/files/cormorant-latin-wght-normal.woff2'), '300 700'),
  ff('Cormorant', nm('@fontsource-variable/cormorant/files/cormorant-latin-wght-italic.woff2'), '300 700', 'italic'),
  ff('Orbitron', nm('@fontsource-variable/orbitron/files/orbitron-latin-wght-normal.woff2'), '400 900'),
  ff('Archivo', nm('@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2'), '100 900', 'normal', 'font-stretch:62% 125%;'),
  ff('Bitter', nm('@fontsource-variable/bitter/files/bitter-latin-wght-normal.woff2'), '100 900'),
  ff('Sora', nm('@fontsource-variable/sora/files/sora-latin-wght-normal.woff2'), '100 800'),
  ff('Anybody', nm('@fontsource-variable/anybody/files/anybody-latin-wdth-normal.woff2'), '100 900', 'normal', 'font-stretch:50% 150%;'),
  ff('Syne', v2('syne-latin-700-normal.woff2'), 700),
  ff('Syne', v2('syne-latin-800-normal.woff2'), 800),
  ff('DM Sans', v2('dm-sans-latin-wght-normal.woff2'), '100 1000'),
].join('\n')

export const grain = (f = 0.8, a = 1.1) =>
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><filter id="n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${f}" numOctaves="2" seed="5" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .1  0 0 0 0 .08  0 0 0 0 .06  0 0 0 ${a} -.42"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`,
  )
/** fibres, for kraft and cardboard */
export const fibre = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500"><filter id="f" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9 .06" numOctaves="3" seed="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .22  0 0 0 0 .1  0 0 0 .55 -.14"/></filter><rect width="100%" height="100%" filter="url(#f)"/></svg>`,
)

export const SHADOW = {
  /** a sheet lying on others */
  flat: '0 1px 1px rgba(16,24,32,.22), 0 4px 9px -2px rgba(16,24,32,.28)',
  /** a thicker stack or something lifted */
  lift: '0 2px 3px rgba(16,24,32,.25), 0 14px 26px -6px rgba(16,24,32,.38)',
}

const CSS = `${FONT_CSS}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden}
.pg{position:relative;width:${W}px;height:${H}px;overflow:hidden;isolation:isolate}
.a{position:absolute}
.grain{position:absolute;inset:0;z-index:90;pointer-events:none;mix-blend-mode:multiply;opacity:.5;background-image:url("data:image/svg+xml,${grain()}")}
.fibre{background-image:url("data:image/svg+xml,${fibre}")}
.paper-tex{background-image:url("data:image/svg+xml,${grain(0.55, 0.7)}")}
.t{position:absolute;white-space:nowrap}
`

/** the page. bg = CSS background of the whole picture (the folder's inside), css = extra CSS, body = the layers */
export function page({ bg = '#caa46a', css = '', body, grainOn = true }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}${css}</style></head><body><div class="pg" style="background:${bg}">${body}${grainOn ? '<div class="grain"></div>' : ''}</div></body></html>`
}

const px = (n) => (typeof n === 'number' ? `${n}px` : n)
const place = (o) => `left:${px(o.x)};top:${px(o.y)};${o.w !== undefined ? `width:${px(o.w)};` : ''}${o.h !== undefined ? `height:${px(o.h)};` : ''}transform:rotate(${o.rot ?? 0}deg);z-index:${o.z ?? 5};`

/** a sheet of paper. x, y = top left, w, h, rot (deg), c = colour, inner = HTML inside (position: absolute children), pad, extra = extra style */
export function sheet(o) {
  return `<div class="a paper-tex" style="${place(o)}background-color:${o.c ?? '#f7f3e6'};box-shadow:${o.shadow ?? SHADOW.flat};border-radius:${o.r ?? 2}px;${o.extra ?? ''}">${o.inner ?? ''}</div>`
}

/** a picture of public/ (src = pub('works/...')) as a print, page or photo. border = white border width (a photo), fit = cover | contain */
export function pic(o) {
  const b = o.border ?? 0
  return `<div class="a" style="${place(o)}background:${o.bc ?? '#fbf8ee'};padding:${b}px;box-shadow:${o.shadow ?? SHADOW.flat};border-radius:${o.r ?? 2}px;overflow:hidden;${o.extra ?? ''}"><img src="${o.src}" style="display:block;width:100%;height:100%;object-fit:${o.fit ?? 'cover'};object-position:${o.pos ?? '50% 50%'};${o.imgExtra ?? ''}" alt=""></div>`
}

/** a line of text. x, y = top left, size px, font = family, c = colour, weight, rot, ls = letter-spacing, extra = style */
export function text(o) {
  return `<div class="t" style="left:${px(o.x)};top:${px(o.y)};font:${o.weight ?? 400} ${o.size ?? 24}px/${o.lh ?? 1.15} '${o.font ?? 'DM Sans'}',sans-serif;color:${o.c ?? '#101820'};letter-spacing:${o.ls ?? 0};transform:rotate(${o.rot ?? 0}deg);z-index:${o.z ?? 8};${o.w ? `width:${px(o.w)};white-space:normal;` : ''}${o.extra ?? ''}">${o.t}</div>`
}

/** a paper clip. x, y = top left, h = length, rot */
export function clip(o) {
  const h = o.h ?? 120
  return `<svg class="a" style="left:${px(o.x)};top:${px(o.y)};width:${h * 0.34}px;height:${h}px;transform:rotate(${o.rot ?? 0}deg);z-index:${o.z ?? 20};filter:drop-shadow(1px 2px 1.5px rgba(16,24,32,.4))" viewBox="0 0 40 118"><path d="M29 22 V88 a13 13 0 0 1 -26 0 V26 a9 9 0 0 1 18 0 V84" fill="none" stroke="${o.c ?? '#a9b2ba'}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M27 24 V86" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.2" stroke-linecap="round"/></svg>`
}

/** a strip of tape. x, y = centre, w, rot, c = colour (rgba) */
export function tape(o) {
  const w = o.w ?? 130
  const h = o.h ?? 40
  return `<div class="a" style="left:${o.x - w / 2}px;top:${o.y - h / 2}px;width:${w}px;height:${h}px;transform:rotate(${o.rot ?? -6}deg);background:${o.c ?? 'rgba(244,236,200,.78)'};z-index:${o.z ?? 25};clip-path:polygon(0 6%,3% 0,6% 8%,9% 0,100% 0,97% 14%,100% 28%,97% 42%,100% 56%,97% 70%,100% 84%,97% 100%,9% 100%,6% 92%,3% 100%,0 94%,2% 78%,0 64%,2% 50%,0 36%,2% 22%);box-shadow:0 1px 1px rgba(16,24,32,.15)"></div>`
}

/** a sticky note with handwriting. x, y = top left, s = side, c = colour, t = text (use <br>), font, size */
export function sticky(o) {
  const s = o.s ?? 190
  return sheet({ x: o.x, y: o.y, w: s, h: o.hh ?? s, rot: o.rot ?? 3, c: o.c ?? '#f9e27a', z: o.z ?? 15, shadow: SHADOW.flat, r: 1, extra: 'padding:' + Math.round(s * 0.09) + 'px;', inner: `<div style="font:${o.weight ?? 400} ${o.size ?? 30}px/1.12 '${o.font ?? 'Gochi Hand'}';color:${o.ink ?? '#2a2a3a'};transform:rotate(-1deg)">${o.t}</div>` })
}

/** a rubber stamp print. x, y = top left, t = text, c = ink colour, rot, size, font */
export function stamp(o) {
  return `<div class="a" style="left:${px(o.x)};top:${px(o.y)};transform:rotate(${o.rot ?? -8}deg);z-index:${o.z ?? 30};font:${o.weight ?? 700} ${o.size ?? 54}px/1 '${o.font ?? 'Courier Prime'}';letter-spacing:.06em;color:${o.c ?? '#b3261e'};border:${Math.max(3, (o.size ?? 54) * 0.09)}px solid ${o.c ?? '#b3261e'};padding:.12em .32em;border-radius:${o.round ?? 6}px;opacity:.82;mix-blend-mode:multiply;white-space:nowrap;-webkit-mask-image:url(&quot;data:image/svg+xml,${grain(0.5, 2.2)}&quot;);mask-image:url(&quot;data:image/svg+xml,${grain(0.5, 2.2)}&quot;)">${o.t}</div>`
}

/** a coffee ring. x, y = centre, d = diameter */
export function ring(o) {
  const d = o.d ?? 170
  return `<div class="a" style="left:${o.x - d / 2}px;top:${o.y - d / 2}px;width:${d}px;height:${d}px;border-radius:50%;border:${Math.round(d * 0.045)}px solid rgba(110,70,30,.32);box-shadow:inset 0 0 ${d * 0.12}px rgba(110,70,30,.22),0 0 ${d * 0.05}px rgba(110,70,30,.18);z-index:${o.z ?? 12};mix-blend-mode:multiply;transform:scaleY(.94) rotate(${o.rot ?? 0}deg)"></div>`
}

/** a round punch hole (a dark disc with a light edge). x, y = centre */
export const hole = (x, y, d = 34, z = 18) => `<div class="a" style="left:${x - d / 2}px;top:${y - d / 2}px;width:${d}px;height:${d}px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#6b6258,#2b2620 70%);box-shadow:inset 0 2px 3px rgba(0,0,0,.6),0 1px 0 rgba(255,255,255,.35);z-index:${z}"></div>`

/** ruled lines of a notepad: x, y, w, n lines, step, c */
export const rules = (x, y, w, n, step = 38, c = 'rgba(70,110,190,.35)', z = 6) => Array.from({ length: n }, (_, i) => `<div class="a" style="left:${x}px;top:${y + i * step}px;width:${w}px;height:2px;background:${c};z-index:${z}"></div>`).join('')

/** a hand-drawn arrow / underline in SVG. kind = 'arrow' | 'under' | 'circle' */
export function pen(o) {
  const c = o.c ?? '#c4271b'
  const w = o.w ?? 160
  const h = o.h ?? 80
  const d = { arrow: 'M6 60 C 40 10, 90 8, 140 40 M120 20 L142 42 L112 52', under: 'M4 40 C 50 30, 100 48, 156 32 M10 52 C 60 44, 110 58, 150 46', circle: 'M80 6 C 130 4, 156 30, 148 56 C 138 82, 60 84, 24 62 C -2 40, 24 10, 82 8 C 110 6, 130 14, 138 24' }[o.kind ?? 'arrow']
  return `<svg class="a" style="left:${px(o.x)};top:${px(o.y)};width:${w}px;height:${h}px;transform:rotate(${o.rot ?? 0}deg);z-index:${o.z ?? 26}" viewBox="0 0 160 90"><path d="${d}" fill="none" stroke="${c}" stroke-width="${o.sw ?? 5}" stroke-linecap="round" stroke-linejoin="round"/></svg>`
}

/** a kraft / manila background: base colour plus fibres. Use as the `bg` of page() and add the `fibre` layer if you want it stronger. */
export const kraft = (base = '#c9a56b') => `${base} url("data:image/svg+xml,${fibre}")`
