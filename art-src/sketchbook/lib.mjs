// Kit for the pages of the Procreate sketchbook (public/works/procreate/book/*.webp): a worn, dirty, hand-made book. Every page is 1200 x 1600
// (3:4), laid out in absolute pixels in HTML/CSS/SVG and printed by render.mjs. The helpers below return HTML strings.
// The look: yellowed paper with foxing and tooth, drawings printed and glued in (tape, photo corners, wrinkles), others drawn straight on the
// page, handwriting in pencil / biro / felt-tip with a wobble, coffee rings, thumbprints, graphite smears, eraser crumbs, doodles in the margins.
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { FONT_CSS, grain, fibre, tape as tapeBase, ring as ringBase, sticky as stickyBase } from '../folders/lib.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
export const W = 1200
export const H = 1600
export const srcUrl = (f) => pathToFileURL(path.join(here, 'sources', f)).href

export const PENCIL = '#3d3b42'
export const BIRO = '#26398c'
export const FELT = '#17121b'
export const RED = '#b3281f'
export const GREEN = '#2b6a3c'

/** seeded random numbers, so every render of a page is the same page */
export function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const mottle = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900"><filter id="m" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".008 .011" numOctaves="3" seed="4" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .62  0 0 0 0 .48  0 0 0 0 .26  0 0 0 1.6 -.55"/></filter><rect width="100%" height="100%" filter="url(#m)"/></svg>`,
)
const maskGrain = (a = 2.6) => `url('data:image/svg+xml,${grain(0.62, a)}')`

const CSS = `${FONT_CSS}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#222}
.pg{position:relative;width:${W}px;height:${H}px;overflow:hidden;isolation:isolate}
.a{position:absolute}
.t{position:absolute;white-space:nowrap}
`

const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<filter id="rough" x="-6%" y="-10%" width="112%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.6" xChannelSelector="R" yChannelSelector="G"/></filter>
<filter id="wob" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/></filter>
<filter id="warp" x="-3%" y="-3%" width="106%" height="106%"><feTurbulence type="fractalNoise" baseFrequency=".005 .009" numOctaves="2" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G"/></filter>
<filter id="blot" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="3" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="26" xChannelSelector="R" yChannelSelector="G"/></filter>
</defs></svg>`

/** a whole page. body = the layers (strings). kind: plain | dots | ruled. tone: 0 normal, 1 yellower, -1 paler */
export function pageHtml({ seed = 1, kind = 'plain', tone = 0, body = '', clean = false }) {
  const r = rng(seed * 7 + 3)
  const base = tone > 0 ? '#eee3c6' : tone < 0 ? '#f5efdf' : '#f1e9d3'
  let fox = ''
  for (let i = 0; i < 30; i++) {
    const edge = r() < 0.65
    const x = edge ? (r() < 0.5 ? r() * 190 : W - r() * 190) : r() * W
    const y = r() * H
    const d = 8 + r() * 36
    const al = 0.07 + r() * 0.17
    fox += `<div class="a" style="left:${x - d / 2}px;top:${y - d / 2}px;width:${d}px;height:${d}px;border-radius:50%;background:radial-gradient(closest-side,rgba(142,96,40,${al.toFixed(3)}),rgba(142,96,40,0))"></div>`
  }
  const dots =
    kind === 'dots'
      ? `<div class="a" style="left:60px;top:70px;right:60px;bottom:90px;background-image:radial-gradient(circle at 1.5px 1.5px,rgba(70,62,56,.30) 1.5px,transparent 2.2px);background-size:42px 42px"></div>`
      : ''
  const ruled =
    kind === 'ruled'
      ? `<div class="a" style="left:0;right:0;top:170px;bottom:110px;background-image:repeating-linear-gradient(to bottom,transparent 0 56px,rgba(60,92,170,.36) 56px 58px)"></div><div class="a" style="left:158px;top:0;bottom:0;width:3px;background:rgba(190,60,48,.42)"></div><div class="a" style="left:168px;top:0;bottom:0;width:2px;background:rgba(190,60,48,.28)"></div>`
      : ''
  const dirt = clean
    ? ''
    : `<div class="a" style="inset:0;box-shadow:inset 0 0 150px 18px rgba(120,80,30,.2),inset 0 0 40px rgba(90,60,20,.2)"></div>`
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${DEFS}<div class="pg">
<div class="a" style="inset:0;background:${base}"></div>
<div class="a" style="inset:0;background-image:url(&quot;data:image/svg+xml,${mottle}&quot;);background-size:900px;mix-blend-mode:multiply;opacity:.4"></div>
<div class="a" style="inset:0;background-image:url(&quot;data:image/svg+xml,${fibre}&quot;);background-size:500px;mix-blend-mode:multiply;opacity:.26"></div>
${fox}${dirt}${dots}${ruled}
${body}
<div class="a" style="inset:0;z-index:95;pointer-events:none;mix-blend-mode:multiply;opacity:.42;background-image:url(&quot;data:image/svg+xml,${grain(0.9, 1.0)}&quot;)"></div>
</div></body></html>`
}

// ---- handwriting and marks ----------------------------------------------------------------------------------------------------------------

/** handwriting. x, y = top left; size px; font = Reenie Beanie (thin pencil) | Gochi Hand (felt-tip) | Gloria Hallelujah (round pen); c colour; w = wrap width */
export function hand(o) {
  const { x, y, t, size = 54, font = 'Reenie Beanie', c = PENCIL, rot = 0, w, lh = 1.04, ls = 0, op = 0.94, z = 40, weight = 400, pencil = true } = o
  const mask = pencil ? `-webkit-mask-image:${maskGrain(o.strength ?? 2.7)};mask-image:${maskGrain(o.strength ?? 2.7)};` : ''
  return `<div class="t" style="left:${x}px;top:${y}px;font:${weight} ${size}px/${lh} '${font}',cursive;color:${c};letter-spacing:${ls}px;transform:rotate(${rot}deg);transform-origin:0 50%;z-index:${z};opacity:${op};mix-blend-mode:multiply;filter:url(#rough);${w ? `width:${w}px;white-space:normal;` : ''}${mask}${o.extra ?? ''}">${t}</div>`
}

/** one SVG layer covering the page, wobbled so the lines look drawn by hand */
export function ink(inner, { z = 41, op = 0.9, wob = true, blend = 'multiply', pencil = false } = {}) {
  return `<svg class="a" style="left:0;top:0;z-index:${z};opacity:${op};mix-blend-mode:${blend};${wob ? 'filter:url(#wob);' : ''}${pencil ? `-webkit-mask-image:${maskGrain(2.4)};mask-image:${maskGrain(2.4)};` : ''}" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${inner}</svg>`
}

const stroke = (d, c, sw = 5, extra = '') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`
const pts = (arr) => 'M' + arr.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')

/** a curved arrow from (x1,y1) to (x2,y2); bend > 0 curves one way, < 0 the other */
export function arrowPath({ x1, y1, x2, y2, bend = 0.22, head = 26, c = RED, sw = 5 }) {
  const dx = x2 - x1
  const dy = y2 - y1
  const mx = (x1 + x2) / 2 - dy * bend
  const my = (y1 + y2) / 2 + dx * bend
  const ang = Math.atan2(y2 - my, x2 - mx)
  const h = (a) => [x2 + Math.cos(ang + Math.PI + a) * head, y2 + Math.sin(ang + Math.PI + a) * head]
  const h1 = h(0.5)
  const h2 = h(-0.5)
  return (
    stroke(`M${x1} ${y1} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2} ${y2}`, c, sw) +
    stroke(`M${h1[0].toFixed(1)} ${h1[1].toFixed(1)} L${x2} ${y2} L${h2[0].toFixed(1)} ${h2[1].toFixed(1)}`, c, sw)
  )
}
/** a hand-drawn ellipse with the overshoot of a real circling gesture */
export function circlePath(cx, cy, rx, ry, { c = RED, sw = 5, seed = 1, turns = 1.12 } = {}) {
  const r = rng(seed)
  const a0 = r() * Math.PI * 2
  const n = 64
  const p = []
  for (let i = 0; i <= n; i++) {
    const a = a0 + (i / n) * Math.PI * 2 * turns
    const k = 1 + (i / n) * 0.06 + (r() - 0.5) * 0.025
    p.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k])
  }
  return stroke(pts(p), c, sw)
}
/** a double underline stroke */
export function underPath(x, y, w, { c = RED, sw = 5, seed = 2 } = {}) {
  const r = rng(seed)
  const line = (off) => {
    const p = []
    for (let i = 0; i <= 14; i++) p.push([x + (w * i) / 14, y + off + Math.sin(i * 0.9 + off) * 2.6 + (r() - 0.5) * 2.4])
    return pts(p)
  }
  return stroke(line(0), c, sw) + stroke(line(11), c, sw * 0.8)
}
export function starPath(cx, cy, rad, { c = PENCIL, sw = 4, rot = 0, seed = 3 } = {}) {
  const r = rng(seed)
  const p = []
  for (let i = 0; i <= 10; i++) {
    const a = rot + (i * Math.PI) / 5 - Math.PI / 2
    const k = (i % 2 ? 0.42 : 1) * rad * (0.94 + r() * 0.12)
    p.push([cx + Math.cos(a) * k, cy + Math.sin(a) * k])
  }
  return stroke(pts(p), c, sw)
}
export function spiralPath(cx, cy, rad, { c = PENCIL, sw = 4, turns = 3 } = {}) {
  const p = []
  const n = 80
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2 * turns
    const k = (i / n) * rad
    p.push([cx + Math.cos(a) * k, cy + Math.sin(a) * k * 0.92])
  }
  return stroke(pts(p), c, sw)
}
export function squigPath(x, y, w, { amp = 14, n = 6, c = PENCIL, sw = 4, seed = 5 } = {}) {
  const r = rng(seed)
  const p = []
  for (let i = 0; i <= n * 8; i++) p.push([x + (w * i) / (n * 8), y + Math.sin((i / 8) * Math.PI) * amp * (0.85 + r() * 0.3)])
  return stroke(pts(p), c, sw)
}
export function loopsPath(x, y, w, { c = BIRO, sw = 3.4, n = 7, seed = 8 } = {}) {
  // a pen test: a row of loops
  const r = rng(seed)
  const p = []
  const steps = n * 18
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const a = t * n * Math.PI * 2
    p.push([x + t * w + Math.cos(a) * 22 * (0.8 + r() * 0.3), y + Math.sin(a) * 26 * (0.8 + r() * 0.3)])
  }
  return stroke(pts(p), c, sw)
}
export function boxPath(x, y, s, { c = PENCIL, sw = 4, tick = false, seed = 4 } = {}) {
  const r = rng(seed)
  const j = () => (r() - 0.5) * 3.5
  const box = stroke(`M${x + j()} ${y + j()} L${x + s + j()} ${y + j()} L${x + s + j()} ${y + s + j()} L${x + j()} ${y + s + j()} Z`, c, sw)
  const t = tick ? stroke(`M${x + s * 0.18} ${y + s * 0.55} L${x + s * 0.44} ${y + s * 0.86} L${x + s * 1.12} ${y - s * 0.28}`, RED, sw + 1) : ''
  return box + t
}
/** faint blue construction lines, as if the face had been laid out first */
export function guides(lines, { c = 'rgba(70,112,178,.55)', sw = 2.2 } = {}) {
  return lines.map(([x1, y1, x2, y2]) => stroke(`M${x1} ${y1} L${x2} ${y2}`, c, sw)).join('')
}
/** a patch of pencil hatching (a hatching test in the margin) */
export function hatchPath(x, y, w, h, { c = PENCIL, sw = 2.4, gap = 11, cross = false } = {}) {
  let d = ''
  for (let i = 0; i < w + h; i += gap) {
    const x1 = x + Math.max(0, i - h)
    const y1 = y + Math.min(h, i)
    const x2 = x + Math.min(w, i)
    const y2 = y + Math.max(0, i - w)
    d += `M${x1} ${y1} L${x2} ${y2} `
  }
  if (cross) for (let i = 0; i < w + h; i += gap) d += `M${x + Math.min(w, i)} ${y + Math.min(h, i)} L${x + Math.max(0, i - h)} ${y + Math.max(0, i - w)} `
  return stroke(d, c, sw)
}

// ---- things stuck on the page -------------------------------------------------------------------------------------------------------------

const rot2 = (lx, ly, deg) => {
  const a = (deg * Math.PI) / 180
  return [lx * Math.cos(a) - ly * Math.sin(a), lx * Math.sin(a) + ly * Math.cos(a)]
}

function tornClip(w, h, seed) {
  const r = rng(seed)
  const j = () => 1 + r() * 7
  const p = []
  for (let x = 0; x <= w; x += 20) p.push([x, j()])
  for (let y = 0; y <= h; y += 20) p.push([w - j(), y])
  for (let x = w; x >= 0; x -= 20) p.push([x, h - j()])
  for (let y = h; y >= 0; y -= 20) p.push([j(), y])
  return `clip-path:polygon(${p.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(',')});`
}

/**
 * A picture put on the page. k = file in sources/, x y = top left of the outer box, w h = the picture, border = paper border, rot degrees.
 * bare: true -> a drawing made straight on the page (the white of the picture drops out: multiply), no border, no shadow.
 * torn: a clipping with ragged edges. corners: black photo corners. Returns { html, at(u, v), corner(name), tapes(names) }.
 */
export function print(o) {
  const { k, x, y, w, h, rot = 0, die = false, border = 14, bc = '#f7f2e6', z = 12, pos = '50% 50%', fit = 'cover', torn = false, corners = false, bare = false, warp = true, seed = 3, shadow = true, crop } = o
  // crop = { x, y, w, h, sw, sh }: the part of the source (natural size sw x sh) that fills the w x h box
  const fill = (extra = '') => {
    if (!crop) return `<img src="${srcUrl(k)}" style="display:block;width:100%;height:100%;object-fit:${fit};object-position:${pos};${extra}" alt="">`
    const sc = w / crop.w
    return `<img src="${srcUrl(k)}" style="position:absolute;left:${-crop.x * sc}px;top:${-crop.y * sc}px;width:${crop.sw * sc}px;height:${crop.sh * sc}px;${extra}" alt="">`
  }
  const bw = bare || die ? 0 : border
  const ow = w + bw * 2
  const oh = h + bw * 2
  const cx = x + ow / 2
  const cy = y + oh / 2
  const at = (u, v) => {
    const [dx, dy] = rot2(bw + u * w - ow / 2, bw + v * h - oh / 2, rot)
    return [cx + dx, cy + dy]
  }
  const corner = (name) => {
    const sx = name.includes('l') ? -1 : name.includes('r') ? 1 : 0
    const sy = name.includes('t') ? -1 : name.includes('b') ? 1 : 0
    const [dx, dy] = rot2((sx * ow) / 2, (sy * oh) / 2, rot)
    return [cx + dx, cy + dy]
  }
  let html
  if (die) {
    const W2 = '#fbf6ea'
    const chain = [[5,0],[-5,0],[0,5],[0,-5],[4,4],[-4,-4],[4,-4],[-4,4]].map(([a,b]) => `drop-shadow(${a}px ${b}px 0 ${W2})`).join(' ')
    html = `<img class="a" src="${srcUrl(k)}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;transform:rotate(${rot}deg);z-index:${z};filter:${chain} drop-shadow(0 7px 7px rgba(40,25,10,.45))" alt="">`
  } else if (bare) {
    html = `<div class="a" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;overflow:hidden;transform:rotate(${rot}deg);mix-blend-mode:multiply;z-index:${z};opacity:${o.op ?? 0.93}${warp ? ';filter:url(#warp)' : ''}">${fill()}</div>`
  } else {
    const sh = shadow ? 'box-shadow:0 1px 1px rgba(30,20,10,.4),0 6px 12px -6px rgba(30,20,10,.45);' : ''
    const glue = `<div class="a" style="inset:0;background:linear-gradient(112deg,rgba(255,255,255,0) 18%,rgba(255,255,255,.14) 27%,rgba(40,25,10,.07) 36%,rgba(255,255,255,.1) 58%,rgba(40,25,10,.08) 79%,rgba(255,255,255,.06) 90%);mix-blend-mode:normal"></div><div class="a" style="inset:0;mix-blend-mode:multiply;opacity:.3;background-image:url(&quot;data:image/svg+xml,${grain(0.8, 1.0)}&quot;)"></div>`
    const inner = `<div class="a" style="left:0;top:0;width:${ow}px;height:${oh}px;background:${bc};padding:${bw}px;${sh}${torn ? '' : 'border-radius:2px;'}${torn ? tornClip(ow, oh, seed) : ''}"><div class="a" style="left:${bw}px;top:${bw}px;width:${w}px;height:${h}px;overflow:hidden">${fill()}${glue}</div></div>`
    html = `<div class="a" style="left:${x}px;top:${y}px;width:${ow}px;height:${oh}px;transform:rotate(${rot}deg);z-index:${z}${warp ? ';filter:url(#warp)' : ''}">${inner}</div>`
  }
  const tapes = (names, extra = {}) =>
    names
      .map((n, i) => {
        const [tx, ty] = n.length === 2 ? corner(n) : corner(n)
        const diag = { tl: -42, tr: 42, bl: 42, br: -42, t: -3, b: 3, l: 86, r: -86 }[n] ?? 0
        const jr = (rng(seed + i * 13)() - 0.5) * 8
        return tapeBase({ x: tx, y: ty, w: extra.w ?? 150, h: extra.h ?? 44, rot: rot + diag + jr, c: extra.c ?? 'rgba(232,216,160,.82)', z: z + 4 })
      })
      .join('')
  const cornersHtml = corners
    ? ['tl', 'tr', 'bl', 'br']
        .map((n) => {
          const [px, py] = corner(n)
          const a = { tl: 0, tr: 90, br: 180, bl: 270 }[n]
          return `<div class="a" style="left:${px - 38}px;top:${py - 38}px;width:76px;height:76px;transform:rotate(${rot + a}deg);transform-origin:38px 38px;z-index:${z + 3}"><div class="a" style="left:0;top:0;width:76px;height:76px;background:#2a2420;clip-path:polygon(0 0,100% 0,0 100%);box-shadow:0 2px 3px rgba(0,0,0,.4)"></div></div>`
        })
        .join('')
    : ''
  return { html: html + cornersHtml, at, corner, tapes, box: { x, y, w: ow, h: oh, rot } }
}

/** a coffee ring, with the splash of a cup that was put down too fast */
export function coffee({ x, y, d = 190, rot = 0, z = 6, splash = true, op = 1 }) {
  const r = rng(Math.round(x + y))
  let drops = ''
  if (splash)
    for (let i = 0; i < 7; i++) {
      const a = r() * Math.PI * 2
      const dist = d * (0.58 + r() * 0.42)
      const s = 3 + r() * 9
      drops += `<div class="a" style="left:${x + Math.cos(a) * dist - s / 2}px;top:${y + Math.sin(a) * dist - s / 2}px;width:${s}px;height:${s}px;border-radius:50%;background:rgba(110,70,30,.34);mix-blend-mode:multiply;z-index:${z}"></div>`
    }
  return `<div style="opacity:${op}">${ringBase({ x, y, d, rot, z })}${drops}</div>`
}

/** a graphite smear: the side of a hand dragged across pencil */
export function smear({ x, y, w, h, rot = 0, op = 0.4, z = 30, c = '62,58,68' }) {
  return `<div class="a" style="left:${x - w / 2}px;top:${y - h / 2}px;width:${w}px;height:${h}px;transform:rotate(${rot}deg);background:radial-gradient(closest-side,rgba(${c},${op}),rgba(${c},0));filter:blur(14px);mix-blend-mode:multiply;z-index:${z}"></div>`
}

/** a thumbprint (grease and graphite) */
export function thumb({ x, y, rot = -20, s = 1, op = 0.34, z = 30 }) {
  const w = 130 * s
  const h = 170 * s
  return `<div class="a" style="left:${x - w / 2}px;top:${y - h / 2}px;width:${w}px;height:${h}px;transform:rotate(${rot}deg);z-index:${z};mix-blend-mode:multiply;opacity:${op};background:repeating-radial-gradient(ellipse at 52% 62%,rgba(70,48,24,.75) 0 2.2px,transparent 2.2px 6.2px);-webkit-mask-image:radial-gradient(ellipse closest-side,#000 35%,rgba(0,0,0,.4) 70%,transparent 100%);mask-image:radial-gradient(ellipse closest-side,#000 35%,rgba(0,0,0,.4) 70%,transparent 100%);filter:url(#rough)"></div>`
}

/** a water / coffee stain: faint fill and a darker rim */
export function stain({ x, y, w, h, rot = 0, op = 1, z = 5 }) {
  return `<div class="a" style="left:${x - w / 2}px;top:${y - h / 2}px;width:${w}px;height:${h}px;transform:rotate(${rot}deg);z-index:${z};mix-blend-mode:multiply;opacity:${op};background:radial-gradient(closest-side,rgba(150,110,52,.07) 66%,rgba(150,108,48,.26) 90%,rgba(150,108,48,0) 100%);filter:url(#blot)"></div>`
}

/** eraser crumbs and a little pencil dust */
export function crumbs({ x, y, n = 9, spread = 90, seed = 5, z = 30 }) {
  const r = rng(seed)
  let out = ''
  for (let i = 0; i < n; i++) {
    const w = 5 + r() * 11
    const h = 3 + r() * 5
    out += `<div class="a" style="left:${x + (r() - 0.5) * spread * 2}px;top:${y + (r() - 0.5) * spread}px;width:${w}px;height:${h}px;border-radius:${h}px;transform:rotate(${r() * 180}deg);background:${r() < 0.5 ? 'rgba(120,112,108,.55)' : 'rgba(200,190,178,.8)'};box-shadow:0 1px 1px rgba(40,30,20,.3);z-index:${z}"></div>`
  }
  return out
}

/** an ink blot */
export function blot({ x, y, d = 90, c = '#17121b', z = 30 }) {
  return `<div class="a" style="left:${x - d / 2}px;top:${y - d / 2}px;width:${d}px;height:${d}px;border-radius:50%;background:radial-gradient(closest-side,${c} 62%,rgba(23,18,27,.0) 100%);filter:url(#blot);mix-blend-mode:multiply;opacity:.92;z-index:${z}"></div>`
}

/** a dog-eared corner. side: 'l' (bottom-left of a left page) | 'r' (bottom-right of a right page) */
export function dogear({ side = 'r', s = 120, z = 50 }) {
  const r = side === 'r'
  return `<div class="a" style="${r ? 'right' : 'left'}:0;bottom:0;width:${s}px;height:${s}px;z-index:${z}"><div class="a" style="inset:0;background:linear-gradient(${r ? '315deg' : '45deg'},#cfc3a6 0,#e9dfc6 46%,rgba(0,0,0,0) 46.3%);clip-path:polygon(${r ? '100% 0,100% 100%,0 100%' : '0 0,0 100%,100% 100%'})"></div><div class="a" style="inset:0;background:linear-gradient(${r ? '315deg' : '45deg'},rgba(60,40,20,.34),rgba(60,40,20,0) 14%);clip-path:polygon(${r ? '100% 0,100% 100%,0 100%' : '0 0,0 100%,100% 100%'})"></div></div>`
}

/** a swatch of marker / paint tried out: a ragged scribbled patch */
export function swatch({ x, y, w = 140, h = 90, c, rot = 0, z = 20, label, lc = PENCIL, strokeW = 14 }) {
  const lines = Math.floor(h / (strokeW * 0.7))
  let d = ''
  for (let i = 0; i < lines; i++) {
    const yy = y + 8 + i * strokeW * 0.7
    d += i % 2 ? `M${x + w - 6} ${yy} L${x + 6} ${yy + 3} ` : `M${x + 6} ${yy} L${x + w - 6} ${yy + 3} `
  }
  const t = label ? hand({ x: x + 4, y: y + h + 4, t: label, size: 38, c: lc, z }) : ''
  return `<svg class="a" style="left:0;top:0;z-index:${z};mix-blend-mode:multiply;opacity:.92;filter:url(#wob);transform-origin:${x + w / 2}px ${y + h / 2}px;transform:rotate(${rot}deg)" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><path d="${d}" fill="none" stroke="${c}" stroke-width="${strokeW}" stroke-linecap="round"/></svg>${t}`
}

/** a round sticker */
export function sticker({ x, y, d = 190, c = '#f4eee0', rot = -6, z = 40, inner = '', ring: ringC }) {
  return `<div class="a" style="left:${x - d / 2}px;top:${y - d / 2}px;width:${d}px;height:${d}px;border-radius:50%;background:${c};transform:rotate(${rot}deg);z-index:${z};box-shadow:0 1px 1px rgba(0,0,0,.4),0 5px 9px -4px rgba(0,0,0,.5);${ringC ? `outline:5px solid ${ringC};outline-offset:-14px;` : ''}">${inner}</div>`
}

export const tape = tapeBase
export const sticky = stickyBase

/** the printed page number, at the outer bottom corner */
export function pageNo(n) {
  const left = n % 2 === 0
  return hand({ x: left ? 78 : W - 150, y: H - 128, t: String(n), size: 56, c: PENCIL, rot: left ? -4 : 3, op: 0.8, z: 45 })
}

// ---- covers -------------------------------------------------------------------------------------------------------------------------------

/** the cloth-covered board. spine: where the tape runs ('l' for the front cover, 'r' for the back) */
export function board({ seed = 4, spine = 'l', body = '' }) {
  const r = rng(seed)
  let scuffs = ''
  for (let i = 0; i < 150; i++) {
    const edge = r()
    const x = edge < 0.35 ? r() * 90 : edge < 0.7 ? W - r() * 90 : r() * W
    const y = edge < 0.35 || edge < 0.7 ? r() * H : r() < 0.5 ? r() * 70 : H - r() * 70
    const len = 14 + r() * 110
    const a = r() * 180
    const al = 0.08 + r() * 0.26
    scuffs += `<div class="a" style="left:${x}px;top:${y}px;width:${len}px;height:${1 + r() * 2.4}px;background:rgba(214,204,188,${al.toFixed(2)});transform:rotate(${a}deg);border-radius:2px"></div>`
  }
  let corners = ''
  for (const [cx, cy] of [
    [0, 0],
    [W, 0],
    [0, H],
    [W, H],
  ])
    corners += `<div class="a" style="left:${cx - 150}px;top:${cy - 150}px;width:300px;height:300px;background:radial-gradient(closest-side,rgba(188,166,132,.55),rgba(188,166,132,0));filter:blur(6px)"></div>`
  const tapeX = spine === 'l' ? 0 : W - 128
  const hinge = spine === 'l' ? 142 : W - 142
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${DEFS}<div class="pg">
<div class="a" style="inset:0;background:#1d1c20"></div>
<div class="a" style="inset:0;background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.04) 0 1px,transparent 1px 3px),repeating-linear-gradient(90deg,rgba(0,0,0,.22) 0 1px,transparent 1px 3px)"></div>
<div class="a" style="inset:0;background-image:url(&quot;data:image/svg+xml,${mottle}&quot;);background-size:900px;mix-blend-mode:screen;opacity:.14"></div>
${corners}${scuffs}
<div class="a" style="inset:0;box-shadow:inset 0 0 120px 20px rgba(0,0,0,.55)"></div>
<div class="a" style="left:${tapeX}px;top:-6px;width:128px;height:${H + 12}px;background:linear-gradient(90deg,#8f2018,#b3281f 40%,#a3241a);box-shadow:${spine === 'l' ? '3px 0' : '-3px 0'} 6px rgba(0,0,0,.5);clip-path:polygon(0 0,100% 1%,98% 6%,100% 12%,99% 40%,100% 70%,98% 92%,100% 100%,0 99%,1% 80%,0 55%,1% 28%)"></div>
<div class="a" style="left:${tapeX}px;top:0;width:128px;height:${H}px;background-image:url(&quot;data:image/svg+xml,${fibre}&quot;);mix-blend-mode:multiply;opacity:.7"></div>
<div class="a" style="left:${hinge}px;top:0;width:3px;height:${H}px;background:rgba(0,0,0,.6);box-shadow:3px 0 0 rgba(255,255,255,.08)"></div>
${body}
<div class="a" style="inset:0;z-index:95;pointer-events:none;mix-blend-mode:multiply;opacity:.4;background-image:url(&quot;data:image/svg+xml,${grain(0.9, 1.0)}&quot;)"></div>
</div></body></html>`
}
