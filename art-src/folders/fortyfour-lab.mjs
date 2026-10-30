// Folder 03, 44 Lab: a workshop JOB ENVELOPE. Dark kraft envelope lining (printed lattice), its folded-back top flap with a string-and-washer tie,
// a pocket with a yellow cloth-bound edge along the bottom. On the lining: a graph-paper rug sketch in pencil with yarn swatches, glossy prints of
// the posts, a yellow carbon work order, the devil as a die-cut vinyl sticker, a pencil, a tape measure, scissors, trimmings of yarn and ink stamps.
// Identity (sketch + hero rug print + devil sticker) sits in the band y 430-920; everything above and below is clutter.
import { pub, sheet, text, clip, tape, stamp, ring, SHADOW } from './lib.mjs'

const post = (f) => pub(`works/fortyfour-lab/posts/${f}`)
const logo = (f) => pub(`works/fortyfour-lab/logo/${f}`)
const work = (f) => pub(`works/fortyfour-lab/${f}`)

const INK = '#17101B'
const YEL = '#FFB81C'
const PINK = '#ff3d95'
const LILAC = '#b68cf4'
const MINT = '#9ff0cc'
const ORANGE = '#ff7b1c'
const RED = '#d9301f'
const BLUE = '#1f2fa8'
const YARNS = [PINK, LILAC, MINT, ORANGE, INK, '#ffffff', YEL, RED]

const GR = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><filter id="n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="2" seed="9"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 2.4 -.55"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`,
)
const FIB = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><filter id="f" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.1 .05" numOctaves="3" seed="4" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .3  0 0 0 0 .17  0 0 0 0 .06  0 0 0 .7 -.22"/></filter><rect width="100%" height="100%" filter="url(#f)"/></svg>`,
)

const DEFS = `<svg width="0" height="0" style="position:absolute"><defs>
<filter id="fuzz" x="-12%" y="-12%" width="124%" height="124%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G"/></filter>
<filter id="pencil" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".035 .05" numOctaves="2" seed="3" result="w"/><feDisplacementMap in="SourceGraphic" in2="w" scale="4" xChannelSelector="R" yChannelSelector="G"/></filter>
</defs></svg>`

const OUTLINE = [
  'drop-shadow(5px 0 0 #fffaf0)', 'drop-shadow(-5px 0 0 #fffaf0)', 'drop-shadow(0 5px 0 #fffaf0)', 'drop-shadow(0 -5px 0 #fffaf0)',
  'drop-shadow(4px 4px 0 #fffaf0)', 'drop-shadow(-4px -4px 0 #fffaf0)', 'drop-shadow(4px -4px 0 #fffaf0)', 'drop-shadow(-4px 4px 0 #fffaf0)',
  'drop-shadow(3px 6px 7px rgba(30,15,0,.5))',
].join(' ')

/** a die-cut vinyl sticker: transparent cutout with a white border */
const die = (src, o) => `<img class="a" src="${src}" style="left:${o.x}px;top:${o.y}px;width:${o.w}px;height:${o.h}px;transform:rotate(${o.rot ?? 0}deg);z-index:${o.z ?? 22};filter:${OUTLINE}">`

/** a glossy print: white border (wider at the bottom), a diagonal gloss, an optional handwritten caption */
const photo = (o) => {
  const b = o.b ?? 14
  const bb = o.bb ?? b
  return `<div class="a" style="left:${o.x}px;top:${o.y}px;width:${o.w}px;height:${o.h}px;transform:rotate(${o.rot ?? 0}deg);z-index:${o.z ?? 12};background:#fbf8ef;padding:${b}px ${b}px ${bb}px;box-shadow:${SHADOW.lift};border-radius:2px"><div style="width:100%;height:100%;overflow:hidden"><img src="${o.src}" style="display:block;width:100%;height:100%;object-fit:cover;object-position:${o.pos ?? '50% 50%'};transform:scale(${o.zoom ?? 1});transform-origin:${o.origin ?? '50% 50%'}"></div><div class="a" style="inset:0;background:linear-gradient(118deg,rgba(255,255,255,.22) 0 12%,rgba(255,255,255,0) 32% 60%,rgba(255,255,255,.1) 76%,rgba(255,255,255,0) 90%);mix-blend-mode:screen"></div>${o.cap ? text({ x: b + 6, y: o.h - bb + 2, t: o.cap, font: 'Gochi Hand', size: o.capSize ?? 30, c: BLUE, rot: -1, z: 3 }) : ''}</div>`
}

/** a fuzzy tufted swatch (pile faked with dot gradients, ragged edge with a displacement filter) */
const tuft = (o) => {
  const l = 'rgba(255,255,255,.4)'
  const d = 'rgba(0,0,0,.3)'
  return `<div class="a" style="left:${o.x}px;top:${o.y}px;width:${o.w}px;height:${o.h}px;transform:rotate(${o.rot ?? 0}deg);z-index:${o.z ?? 10};filter:drop-shadow(0 3px 3px rgba(40,20,0,.5))"><div style="width:100%;height:100%;border-radius:${o.r ?? 6}px;background:radial-gradient(circle at 50% 50%,${l} 0 1.5px,transparent 2.7px) 0 0/6px 6px,radial-gradient(circle at 50% 50%,${d} 0 1.7px,transparent 3px) 3px 3px/6px 6px,radial-gradient(ellipse at 28% 22%,rgba(255,255,255,.3),transparent 62%),${o.c};filter:url(#fuzz)"></div></div>`
}

/** washi tape: striped / dotted, zig-zag ends */
const washi = (o) => {
  const w = o.w ?? 150
  const h = o.h ?? 44
  const c1 = o.c1 ?? '#ff7fb6'
  const c2 = o.c2 ?? '#ffc2dc'
  const pat = o.dots ? `radial-gradient(circle,#fff 0 3px,transparent 3.5px) 0 0/16px 16px,${c1}` : `repeating-linear-gradient(45deg,${c1} 0 9px,${c2} 9px 18px)`
  return `<div class="a" style="left:${o.x - w / 2}px;top:${o.y - h / 2}px;width:${w}px;height:${h}px;transform:rotate(${o.rot ?? -6}deg);background:${pat};opacity:.9;z-index:${o.z ?? 30};clip-path:polygon(0 0,4% 14%,0 28%,4% 42%,0 56%,4% 70%,0 84%,4% 100%,96% 100%,100% 86%,96% 72%,100% 58%,96% 44%,100% 30%,96% 16%,100% 0);box-shadow:0 1px 1px rgba(16,24,32,.2)"></div>`
}

/** a pencil lying at an angle. x, y = start of the eraser end, len, rot */
const pencil = (o) => {
  const len = o.len ?? 420
  return `<div class="a" style="left:${o.x}px;top:${o.y}px;width:${len}px;height:30px;transform:rotate(${o.rot ?? 0}deg);transform-origin:0 50%;z-index:${o.z ?? 46};filter:drop-shadow(3px 5px 4px rgba(30,15,0,.45))">
<div class="a" style="left:0;top:2px;width:34px;height:26px;background:linear-gradient(#ff9bb0,#f0708f);border-radius:5px 3px 3px 5px"></div>
<div class="a" style="left:34px;top:0;width:46px;height:30px;background:repeating-linear-gradient(90deg,#d3d7db 0 4px,#8c929a 4px 6px,#eef0f2 6px 10px);"></div>
<div class="a" style="left:80px;top:0;width:${len - 80 - 62}px;height:30px;background:linear-gradient(180deg,#ffcf4d 0 22%,#ffb81c 22% 55%,#e39a00 55% 80%,#b97500 80%)"></div>
<div class="a" style="left:80px;top:0;width:${len - 80 - 62}px;height:30px;background:linear-gradient(180deg,rgba(255,255,255,.35),transparent 30%,rgba(0,0,0,.22))"></div>
<div class="a" style="left:${len - 62}px;top:0;width:62px;height:30px;background:#e8c392;clip-path:polygon(0 0,100% 50%,0 100%)"></div>
<div class="a" style="left:${len - 22}px;top:11px;width:22px;height:8px;background:#3a3a44;clip-path:polygon(0 0,100% 50%,0 100%)"></div>
</div>`
}

/** a tape measure: the yellow case and the pulled-out strip going to the left */
const measure = (o) => {
  const len = o.len ?? 620
  let nums = ''
  const n = Math.round((len - 20) / 100)
  for (let i = 1; i < n + 1 && i * 100 < len - 20; i++) nums += `<div class="t" style="left:${i * 100 + 4}px;top:22px;font:800 22px/1 'Barlow Semi Condensed';color:${INK}">${(n - i) * 10}</div>`
  return `<div class="a" style="left:${o.x}px;top:${o.y}px;width:${len + 130}px;height:130px;transform:rotate(${o.rot ?? 0}deg);transform-origin:${len + 65}px 65px;z-index:${o.z ?? 44}">
<div class="a" style="left:0;top:38px;width:${len}px;height:52px;background:linear-gradient(180deg,#ffd35a,${YEL} 45%,#f0a200);box-shadow:0 4px 6px rgba(30,15,0,.4);border-radius:2px 0 0 2px;overflow:hidden">
<div class="a" style="inset:0;background:repeating-linear-gradient(90deg,${INK} 0 2px,transparent 2px 10px) 0 0/100% 12px no-repeat,repeating-linear-gradient(90deg,${INK} 0 2px,transparent 2px 50px) 0 0/100% 24px no-repeat,repeating-linear-gradient(90deg,${RED} 0 2px,transparent 2px 25.4px) 0 100%/100% 12px no-repeat"></div>${nums}</div>
<div class="a" style="left:-8px;top:34px;width:16px;height:60px;background:linear-gradient(90deg,#9aa0a8,#e4e7ea,#8b9199);border-radius:3px;box-shadow:0 2px 3px rgba(0,0,0,.4)"></div>
<div class="a" style="left:${len - 6}px;top:0;width:130px;height:130px;border-radius:30px;background:radial-gradient(circle at 34% 28%,#ffd966,${YEL} 55%,#d88e00);box-shadow:0 8px 12px rgba(30,15,0,.45),inset 0 0 0 9px ${INK}"></div>
<div class="a" style="left:${len + 28}px;top:28px;width:74px;height:74px;border-radius:50%;background:radial-gradient(circle at 40% 34%,#fff,#d5d9de 55%,#9aa0a8);box-shadow:inset 0 0 0 4px rgba(0,0,0,.25)"></div>
<div class="t" style="left:${len + 38}px;top:52px;font:400 24px/1 'Chango';color:${INK}">44</div>
</div>`
}

/** scissors lying open: silver blades, orange handles */
const scissors = (o) => `<svg class="a" style="left:${o.x}px;top:${o.y}px;width:${o.w ?? 300}px;height:${(o.w ?? 300) * 0.4}px;transform:rotate(${o.rot ?? 0}deg);z-index:${o.z ?? 45};filter:drop-shadow(3px 6px 5px rgba(30,15,0,.5))" viewBox="0 0 300 120">
<path d="M86 58 L292 22 L296 31 L96 74 Z" fill="#dfe3e7" stroke="#80878f" stroke-width="2"/><path d="M92 62 L292 28" stroke="#fff" stroke-width="2" opacity=".8"/>
<path d="M86 62 L292 100 L296 92 L96 46 Z" fill="#cdd2d7" stroke="#80878f" stroke-width="2"/>
<path d="M92 56 L50 28 M92 62 L50 94" stroke="${ORANGE}" stroke-width="12" stroke-linecap="round"/>
<ellipse cx="34" cy="26" rx="30" ry="20" transform="rotate(-18 34 26)" fill="none" stroke="${ORANGE}" stroke-width="12"/><ellipse cx="34" cy="96" rx="30" ry="20" transform="rotate(18 34 96)" fill="none" stroke="${ORANGE}" stroke-width="12"/>
<circle cx="92" cy="60" r="7" fill="#5a5f66" stroke="#2e3136" stroke-width="2"/></svg>`

/** a ball of yarn */
let ballId = 0
const ball = (o) => {
  const id = `yb${ballId++}`
  const arcs = [10, 38, 62, 90, 118, 146].map((a, i) => `<ellipse cx="50" cy="50" rx="62" ry="${22 + (i % 3) * 7}" transform="rotate(${a} 50 50)"/>`).join('')
  return `<svg class="a" style="left:${o.x}px;top:${o.y}px;width:${o.d}px;height:${o.d}px;z-index:${o.z ?? 45};transform:rotate(${o.rot ?? 0}deg);filter:drop-shadow(3px 7px 6px rgba(30,15,0,.55))" viewBox="0 0 100 100"><defs><clipPath id="c${id}"><circle cx="50" cy="50" r="46"/></clipPath><radialGradient id="g${id}" cx=".34" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".45" stop-color="${o.c}"/><stop offset="1" stop-color="${o.c2 ?? '#000'}" stop-opacity=".55"/></radialGradient></defs>
<circle cx="50" cy="50" r="46" fill="${o.c}"/><g clip-path="url(#c${id})"><g fill="none" stroke="rgba(30,10,70,.42)" stroke-width="2.6">${arcs}</g><g fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1.4" transform="translate(1.6 1.6)">${arcs}</g></g><circle cx="50" cy="50" r="46" fill="url(#g${id})"/>
<path d="M92 66 C 100 80, 86 96, 70 100" fill="none" stroke="${o.c}" stroke-width="4.4" stroke-linecap="round"/></svg>`
}

/** an ink stamp: round, text on a circle, with the devil as a silhouette in the middle */
let stampId = 0
const roundStamp = (o) => {
  const id = `rs${stampId++}`
  const c = o.c ?? '#2a3fb5'
  return `<div class="a" style="left:${o.x}px;top:${o.y}px;width:${o.d}px;height:${o.d}px;transform:rotate(${o.rot ?? 0}deg);z-index:${o.z ?? 30};mix-blend-mode:multiply;opacity:.86;-webkit-mask-image:url(&quot;data:image/svg+xml,${GR}&quot;);mask-image:url(&quot;data:image/svg+xml,${GR}&quot;)">
<svg style="position:absolute;inset:0" width="${o.d}" height="${o.d}" viewBox="0 0 200 200"><defs><path id="${id}" d="M100 100 m-69 0 a69 69 0 1 1 138 0 a69 69 0 1 1 -138 0"/></defs>
<circle cx="100" cy="100" r="95" fill="none" stroke="${c}" stroke-width="6"/><circle cx="100" cy="100" r="50" fill="none" stroke="${c}" stroke-width="3"/><circle cx="100" cy="100" r="86" fill="none" stroke="${c}" stroke-width="2"/>
<text font-family="Courier Prime" font-weight="700" font-size="22" letter-spacing="3.2" fill="${c}"><textPath href="#${id}">${o.t ?? 'HANDTUFTED · MADE TO ORDER · '}</textPath></text></svg>
<div class="a" style="left:${o.d * 0.29}px;top:${o.d * 0.27}px;width:${o.d * 0.42}px;height:${o.d * 0.46}px;background:${c};-webkit-mask:url(${logo('devil-cutout.webp')}) center/contain no-repeat;mask:url(${logo('devil-cutout.webp')}) center/contain no-repeat"></div></div>`
}

/** a strand of yarn: SVG path, with a twisted highlight */
const strand = (d, c, w = 11) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="rgba(255,255,255,.42)" stroke-width="${w * 0.8}" stroke-linecap="round" stroke-dasharray="2.5 ${w * 0.62}"/><path d="${d}" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="${w * 0.8}" stroke-linecap="round" stroke-dasharray="2.5 ${w * 0.62}" stroke-dashoffset="${w * 0.8}"/>`
const strands = (z, inner) => `<svg class="a" style="left:0;top:0;width:1080px;height:1350px;z-index:${z};filter:drop-shadow(0 3px 3px rgba(40,20,0,.4));overflow:visible" viewBox="0 0 1080 1350">${inner}</svg>`

/** a Dymo-style embossed label */
const dymo = (o) => `<div class="a" style="left:${o.x}px;top:${o.y}px;transform:rotate(${o.rot ?? 0}deg);z-index:${o.z ?? 44};background:linear-gradient(180deg,${o.c ?? '#222027'},${o.c2 ?? '#0e0c11'});color:#f5f2ee;font:500 ${o.size ?? 38}px/1 'DM Mono';letter-spacing:.18em;padding:12px 20px;border-radius:5px;box-shadow:0 3px 5px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.2);text-shadow:0 -1px 0 rgba(0,0,0,.6),0 1px 0 rgba(255,255,255,.25);white-space:nowrap">${o.t}</div>`

/** the pencil sketch on graph paper, as inline SVG (456 x 590) */
const SKETCH = () => {
  const B = 'M236 150 C312 142 384 190 388 268 C392 344 364 410 304 440 C246 468 168 462 124 416 C78 368 76 292 102 230 C126 174 178 154 236 150 Z'
  const E = 'M184 226 C204 214 222 236 216 262 C210 292 226 306 214 330 C204 348 182 340 178 318 C174 292 166 244 184 226 Z'
  const M = 'M128 332 C126 386 178 414 236 402 C296 414 348 386 346 334'
  const hatch = (id, c, w = 3.4, s = 7) => `<pattern id="${id}" width="${s}" height="${s}" patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><line x1="0" y1="0" x2="0" y2="${s}" stroke="${c}" stroke-width="${w}"/></pattern>`
  return `<svg class="a" style="left:0;top:0" width="456" height="590" viewBox="0 0 456 590"><defs>${hatch('hP', PINK)}${hatch('hL', '#a47af0')}${hatch('hM', '#58d9a6', 4, 6)}<clipPath id="cb"><path d="${B}"/></clipPath></defs>
<g filter="url(#pencil)">
<g clip-path="url(#cb)"><path d="M40 120 L236 134 C224 190 262 220 244 260 C226 300 270 330 250 380 C240 410 262 440 258 480 L40 490 Z" fill="url(#hP)" opacity=".95"/><path d="M236 134 C224 190 262 220 244 260 C226 300 270 330 250 380 C240 410 262 440 258 480 L430 490 L430 120 Z" fill="url(#hL)" opacity=".95"/></g>
<path d="${M}" fill="none" stroke="#7fe3b4" stroke-width="32" stroke-linecap="round" opacity=".85"/>
<path d="${M}" fill="none" stroke="url(#hM)" stroke-width="32" stroke-linecap="round"/>
<path d="${M}" fill="none" stroke="#2b2833" stroke-width="12" stroke-linecap="round"/>
<path d="${E}" fill="${ORANGE}" stroke="${ORANGE}" stroke-width="17" stroke-linejoin="round" opacity=".92"/><path d="${E}" fill="#2b2833" opacity=".95"/>
<g transform="translate(98 -6) rotate(3 200 280)"><path d="${E}" fill="${ORANGE}" stroke="${ORANGE}" stroke-width="17" stroke-linejoin="round" opacity=".92"/><path d="${E}" fill="#2b2833" opacity=".95"/></g>
<path d="${B}" fill="none" stroke="#33303a" stroke-width="3.4" stroke-linejoin="round"/>
<path d="M240 146 C316 140 388 188 392 268 C396 346 366 414 306 444 C248 472 166 466 120 420 C74 370 72 292 98 228 C124 170 180 150 240 146 Z" fill="none" stroke="#33303a" stroke-width="2" opacity=".6"/>
<g transform="translate(236 300) scale(.915) translate(-236 -300)"><path d="${B}" fill="none" stroke="#33303a" stroke-width="2" stroke-dasharray="9 7" opacity=".75"/></g>
<g stroke="#33303a" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round">
<path d="M64 492 L398 486"/><path d="M64 478 L64 506 M398 472 L398 500"/><path d="M80 486 L64 492 L80 498 M382 480 L398 486 L382 492"/>
<path d="M36 142 L40 460"/><path d="M24 142 L52 142 M28 460 L56 460"/><path d="M28 158 L36 142 L46 158 M28 444 L40 460 L50 444"/>
</g></g>
</svg>`
}

export default function () {
  let seed = 44
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)

  // trimmings of yarn scattered over the lining
  const trims = Array.from({ length: 80 }, () => {
    const x = Math.round(rnd() * 1040 + 10)
    const y = Math.round(rnd() * 1300 + 20)
    const a = Math.round(rnd() * 180)
    const c = YARNS[Math.floor(rnd() * YARNS.length)]
    const l = 22 + rnd() * 20
    const k = (rnd() - 0.5) * 12
    return `<g transform="translate(${x} ${y}) rotate(${a})">${strand(`M0 0 q${l * 0.3} ${k} ${l * 0.55} 0 t${l * 0.45} ${-k * 0.4}`, c, 6)}</g>`
  }).join('')

  const hdr = `<div class="a" style="left:0;top:0;width:1080px;height:84px;z-index:5;background:linear-gradient(180deg,#d9b27a,#caa066);box-shadow:0 6px 10px rgba(40,20,0,.45)">
<div class="a fibre" style="inset:0;opacity:.45"></div>
<div class="a" style="left:0;right:0;bottom:12px;border-top:3px dashed rgba(70,40,10,.4)"></div>
<div class="t" style="left:222px;top:18px;font:700 22px/1 'Courier Prime';letter-spacing:.2em;color:rgba(50,26,6,.72)">JOB ENVELOPE · HANDTUFTED RUGS</div>
<div class="t" style="left:222px;top:46px;font:500 17px/1 'DM Mono';letter-spacing:.22em;color:rgba(50,26,6,.55)">DO NOT BEND · TRIMMINGS INSIDE</div></div>`

  // the string-and-washer tie, with the hang tag on the loose end
  const washer = `<div class="a" style="left:78px;top:18px;width:96px;height:96px;border-radius:50%;background:radial-gradient(circle at 38% 30%,#ead0a0,#c49a5e 62%,#a67c42);box-shadow:0 4px 7px rgba(30,15,0,.55),inset 0 0 0 6px rgba(120,80,30,.35),inset 0 3px 4px rgba(255,255,255,.5);z-index:42"></div>
<div class="a" style="left:106px;top:46px;width:40px;height:40px;border-radius:50%;background:radial-gradient(circle at 36% 30%,#fff,#c9ced4 55%,#8a9098);box-shadow:inset 0 0 0 3px rgba(0,0,0,.2),0 1px 2px rgba(0,0,0,.4);z-index:43"></div>
${strands(41, strand('M126 66 C 84 30, 66 90, 112 100 C 170 108, 168 36, 128 62 C 98 86, 118 130, 140 150 C 156 166, 150 186, 140 204', RED, 8))}`
  const tag = `<div class="a" style="left:76px;top:176px;width:130px;height:214px;transform:rotate(-7deg);z-index:16;filter:drop-shadow(2px 5px 5px rgba(30,15,0,.5))"><div class="a fibre" style="inset:0;background-color:#e9cf98;clip-path:polygon(0 18%,50% 0,100% 18%,100% 100%,0 100%)"><div class="a" style="left:51px;top:20px;width:28px;height:28px;border-radius:50%;background:#7a5a2e;box-shadow:inset 0 2px 3px rgba(0,0,0,.6),0 0 0 4px #f6e3b6"></div><div class="t" style="left:12px;top:68px;font:400 22px/1 'Chango';letter-spacing:-.5px;color:${INK}">44 LAB</div><div class="t" style="left:14px;top:104px;font:700 13px/1.2 'Courier Prime';letter-spacing:.12em;color:#5a4320;white-space:normal;width:104px">HANDTUFTED<br>RUG</div><div class="a" style="left:10px;top:140px;width:110px;height:68px;background:url(${logo('devil-cutout.webp')}) center/contain no-repeat"></div></div></div>`

  const body = [
    DEFS,
    // lining (printed lattice), envelope walls, folded-back flap
    `<div class="a" style="inset:0;z-index:1;background:repeating-linear-gradient(45deg,rgba(60,30,5,.11) 0 2px,transparent 2px 18px),repeating-linear-gradient(-45deg,rgba(60,30,5,.11) 0 2px,transparent 2px 18px),radial-gradient(ellipse at 50% 46%,rgba(255,225,160,.22),rgba(60,30,5,.32) 100%)"></div>`,
    `<div class="a" style="left:0;top:0;width:22px;height:100%;z-index:2;background:linear-gradient(90deg,rgba(40,20,0,.55),rgba(40,20,0,0))"></div><div class="a" style="right:0;top:0;width:22px;height:100%;z-index:2;background:linear-gradient(270deg,rgba(40,20,0,.55),rgba(40,20,0,0))"></div>`,
    hdr,
    washer,
    tag,
    strands(4, trims),

    // top zone: the yarn colour card, the trippy-eye print, tape measure, pencil, scissors
    `<div class="a" style="left:250px;top:104px;width:420px;height:150px;transform:rotate(-2.5deg);z-index:9;background:#f3ead4;box-shadow:${SHADOW.lift};border-radius:3px"><div class="t" style="left:14px;top:8px;font:500 15px/1 'DM Mono';letter-spacing:.2em;color:#6b5a3c">YARN COLOURS</div></div>`,
    ...[PINK, LILAC, MINT, ORANGE, INK, YEL].map((c, i) => tuft({ x: 266 + i * 64, y: 142, w: 54, h: 92, rot: -2.5 + (i % 2) * 2, c, z: 10, r: 8 })),
    photo({ src: post('2023-03-14-CpxGI67D-xW-03.webp'), x: 790, y: 30, w: 250, h: 330, rot: 7, z: 7, b: 11, bb: 40, cap: 'trippy eye', capSize: 26 }),
    clip({ x: 870, y: 14, h: 120, rot: 12, z: 28 }),
    measure({ x: 212, y: 292, len: 440, rot: -1.2 }),
    pencil({ x: 640, y: 74, len: 380, rot: 24, z: 46 }),
    scissors({ x: 790, y: 364, w: 250, rot: -6, z: 21 }),

    // THE BAND (y 430-920): the graph-paper sketch, the hero rug print, the devil sticker
    `<div class="a" style="left:14px;top:448px;width:456px;height:590px;transform:scale(.78);transform-origin:0 0;z-index:8">${sheet({
      x: 0, y: 0, w: 456, h: 590, rot: -3.5, z: 1, c: '#f8f6ea', shadow: SHADOW.lift, r: 2,
      extra: 'background-image:repeating-linear-gradient(0deg,rgba(40,120,190,.3) 0 1.4px,transparent 1.4px 22px),repeating-linear-gradient(90deg,rgba(40,120,190,.3) 0 1.4px,transparent 1.4px 22px),repeating-linear-gradient(0deg,rgba(40,120,190,.32) 0 2.4px,transparent 2.4px 110px),repeating-linear-gradient(90deg,rgba(40,120,190,.32) 0 2.4px,transparent 2.4px 110px);',
      inner: [
        SKETCH(),
        text({ x: 56, y: 22, t: 'SMILEY RUG', font: 'Gochi Hand', size: 48, c: '#2d2b36', rot: -1.5 }),
        text({ x: 300, y: 30, t: 'draft 2', font: 'Reenie Beanie', size: 40, c: '#2d2b36', rot: 4 }),
        text({ x: 172, y: 498, t: '60 cm', font: 'Gochi Hand', size: 34, c: '#2d2b36', rot: -1 }),
        text({ x: 268, y: 506, t: '1 trace', font: 'Reenie Beanie', size: 32, c: '#2d2b36', rot: -2 }),
        text({ x: 268, y: 533, t: '2 tuft', font: 'Reenie Beanie', size: 32, c: '#2d2b36', rot: -2 }),
        text({ x: 268, y: 560, t: '3 trim', font: 'Reenie Beanie', size: 32, c: '#2d2b36', rot: -2 }),
        tuft({ x: 52, y: 522, w: 44, h: 48, c: PINK, rot: -4, z: 3, r: 4 }),
        tuft({ x: 102, y: 524, w: 44, h: 48, c: LILAC, rot: 3, z: 3, r: 4 }),
        tuft({ x: 152, y: 521, w: 44, h: 48, c: MINT, rot: -2, z: 3, r: 4 }),
        tuft({ x: 202, y: 524, w: 44, h: 48, c: ORANGE, rot: 4, z: 3, r: 4 }),
      ].join(''),
    })}</div>`,
    tape({ x: 128, y: 458, w: 120, rot: -8, c: 'rgba(240,226,170,.82)', z: 30 }),

    photo({ src: post('2023-03-08-CpiPiE6I2on-02.webp'), x: 352, y: 456, w: 352, h: 446, rot: 4, z: 12, b: 13, bb: 52, cap: 'smiley rug · 60x60', capSize: 30, zoom: 1.28, origin: '50% 56%' }),
    washi({ x: 396, y: 470, w: 140, rot: -30, c1: '#ff7fb6', c2: '#ffc2dc', z: 31 }),
    tape({ x: 690, y: 478, w: 110, rot: 40, c: 'rgba(244,236,200,.82)', z: 31 }),

    die(logo('lockup-cutout.webp'), { x: 716, y: 440, w: 330, h: 470, rot: 6, z: 22 }),
    roundStamp({ x: 600, y: 772, d: 128, rot: 12, z: 30, c: '#2a3fb5' }),
    ring({ x: 1000, y: 470, d: 190, rot: 20, z: 6 }),

    // bottom zone: the work order (yellow carbon) and the printed drawing with the tufting gun
    sheet({
      x: 30, y: 934, w: 372, h: 400, rot: -2, z: 13, c: '#ffe58a', shadow: SHADOW.lift,
      inner: [
        text({ x: 20, y: 12, t: 'WORK ORDER', font: 'Courier Prime', weight: 700, size: 37, ls: '.02em', c: INK }),
        text({ x: 262, y: 34, t: 'Nº', font: 'Courier Prime', weight: 700, size: 20, c: RED }),
        text({ x: 288, y: 14, t: '044', font: 'Courier Prime', weight: 700, size: 42, c: RED }),
        `<div class="a" style="left:20px;top:62px;width:332px;height:3px;background:${INK}"></div>`,
        text({ x: 20, y: 90, t: 'ITEM', font: 'DM Mono', weight: 500, size: 15, ls: '.18em', c: '#7a6420' }),
        text({ x: 108, y: 70, t: 'Smiley rug', font: 'Gochi Hand', size: 34, c: BLUE }),
        `<div class="a" style="left:20px;top:114px;width:332px;height:2px;background:rgba(80,60,10,.3)"></div>`,
        text({ x: 20, y: 138, t: 'SIZE', font: 'DM Mono', weight: 500, size: 15, ls: '.18em', c: '#7a6420' }),
        text({ x: 108, y: 118, t: '60 x 60 cm', font: 'Gochi Hand', size: 34, c: BLUE }),
        `<div class="a" style="left:20px;top:162px;width:332px;height:2px;background:rgba(80,60,10,.3)"></div>`,
        text({ x: 20, y: 186, t: 'YARN', font: 'DM Mono', weight: 500, size: 15, ls: '.18em', c: '#7a6420' }),
        ...[PINK, LILAC, MINT, ORANGE, INK].map((c, i) => `<div class="a" style="left:${108 + i * 48}px;top:170px;width:36px;height:36px;border-radius:50%;background:${c};box-shadow:inset 0 -3px 4px rgba(0,0,0,.25),0 1px 1px rgba(0,0,0,.3)"></div>`),
        `<div class="a" style="left:20px;top:214px;width:332px;height:2px;background:rgba(80,60,10,.3)"></div>`,
        ...['trace', 'tuft', 'trim'].map((t, i) => `<div class="a" style="left:${20 + i * 112}px;top:230px;width:26px;height:26px;border:3px solid ${INK};background:rgba(255,255,255,.4)"></div>${text({ x: 54 + i * 112, y: 228, t, font: 'Courier Prime', weight: 700, size: 25, c: INK })}${i < 2 ? `<svg class="a" style="left:${18 + i * 112}px;top:220px;z-index:9" width="40" height="40" viewBox="0 0 40 40"><path d="M6 22 L16 32 L36 4" fill="none" stroke="${BLUE}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>` : ''}`),
        `<div class="a" style="left:0;top:276px;width:100%;border-top:3px dashed rgba(80,60,10,.5)"></div>`,
        text({ x: 20, y: 290, t: 'SHIPS WORLDWIDE', font: 'DM Mono', weight: 500, size: 15, ls: '.22em', c: '#7a6420' }),
      ].join(''),
    }),
    stamp({ x: 252, y: 1010, t: 'APPROVED', size: 32, c: '#c92b1c', rot: -10, z: 33 }),
    tape({ x: 394, y: 946, w: 100, rot: 42, c: 'rgba(244,236,200,.82)', z: 31 }),

    photo({ src: work('catalog-sketch.webp'), x: 420, y: 948, w: 640, h: 196, rot: -2.5, z: 14, b: 10, bb: 10 }),
    washi({ x: 442, y: 960, w: 130, rot: -40, c1: YEL, c2: '#ffe08a', z: 31 }),
    tape({ x: 1030, y: 940, w: 110, rot: 52, c: 'rgba(244,236,200,.82)', z: 31 }),
    clip({ x: 416, y: 990, h: 130, rot: -6, z: 28 }),

    // yarn strands crossing the picture
    strands(36, [
      strand('M520 1210 C 560 1130, 700 1170, 780 1150 C 860 1128, 920 1090, 1040 1100', PINK, 12),
      strand('M10 904 C 80 924, 150 896, 232 918', MINT, 11),
      strand('M486 1286 C 440 1300, 412 1250, 436 1220', LILAC, 8),
    ].join('')),

    // papers sticking out of the pocket
    ...[
      { x: 560, y: 1160, c: '#cfe3f7', r: -3 },
      { x: 640, y: 1146, c: '#ffc3d3', r: 2 },
      { x: 720, y: 1162, c: '#ffe58a', r: -1.5 },
      { x: 800, y: 1148, c: '#f6f0e0', r: 3.5 },
    ].map((p, i) => sheet({ x: p.x, y: p.y, w: 260, h: 300, rot: p.r, c: p.c, z: 34 + i * 0.1, shadow: SHADOW.flat, inner: [0, 1, 2].map((k) => `<div class="a" style="left:22px;top:${20 + k * 20}px;width:${150 + ((k * 37) % 70)}px;height:4px;background:rgba(30,30,60,.28)"></div>`).join('') })),

    // the pocket along the bottom, bound with yellow cloth tape
    `<div class="a" style="left:0;top:1190px;width:1080px;height:170px;z-index:40;filter:drop-shadow(0 -7px 9px rgba(30,15,0,.5))"><div class="a fibre" style="inset:0;background-color:#9c6f3d;clip-path:path('M0 28 L452 28 A88 88 0 0 0 628 28 L1080 28 L1080 170 L0 170 Z')">
<div class="a" style="left:0;top:0;width:100%;height:44px;background:repeating-linear-gradient(90deg,rgba(0,0,0,.08) 0 1px,transparent 1px 3px),linear-gradient(180deg,#ffd04a,${YEL} 60%,#e9a000);box-shadow:0 3px 4px rgba(40,20,0,.4)"></div>
<div class="a" style="left:0;top:66px;width:100%;border-top:3px dashed rgba(255,225,170,.55)"></div>
<div class="a" style="left:0;top:112px;width:100%;height:60px;background:linear-gradient(180deg,rgba(0,0,0,0),rgba(30,15,0,.28))"></div></div></div>`,
    dymo({ x: 60, y: 1268, t: 'CUSTOM ORDERS', size: 34, rot: -1.5, z: 44 }),
    dymo({ x: 646, y: 1284, t: '@FORTYFOUR.LAB', size: 24, rot: 1, z: 44, c: '#c2271b', c2: '#8f160d' }),
    ball({ x: 488, y: 1214, d: 126, c: LILAC, c2: '#4a2a8a', rot: -10, z: 45 }),
    // the avatar as a pin-back button
    `<div class="a" style="left:960px;top:1232px;width:112px;height:112px;border-radius:50%;z-index:45;background:#c9a269;box-shadow:0 5px 8px rgba(30,15,0,.55),inset 0 0 0 5px #e8e8e8,inset 0 0 0 9px rgba(0,0,0,.18);overflow:hidden;transform:rotate(-8deg)"><img src="${post('avatar.webp')}" style="position:absolute;left:8px;top:8px;width:96px;height:96px;border-radius:50%;object-fit:cover"><div class="a" style="inset:0;border-radius:50%;background:radial-gradient(circle at 30% 26%,rgba(255,255,255,.55),transparent 42%)"></div></div>`,
  ].join('')

  return { bg: `#b78650 url("data:image/svg+xml,${FIB}")`, body }
}
