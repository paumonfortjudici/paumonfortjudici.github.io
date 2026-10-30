// Folder 08, Gotet (concept): the bar owner's back-office folder. An olive-green card folder lying open on a zinc bar top, stained with
// vermouth rings: fanned posters, the brand board, a printed menu, die-cut cardboard coasters, bottle-label proofs with crop marks, a
// waiter's order pad, matchbooks, a sticker sheet of the mascots, a bar-tab receipt, crown caps, an olive on a pick and an orange slice.
import { pub, sheet, pic, text, clip, tape, stamp, pen, sticky, SHADOW } from './lib.mjs'

const B = (f) => pub(`works/concept-brand/art/brand/${f}.webp`)
const POS = (n) => pub(`works/concept-brand/art/posters/poster-${n}.webp`)
const BOARD = pub('works/concept-brand/art/board-small.webp')

const K = { rosat: '#f8d2d0', blau: '#2340c4', red: '#d8243c', olive: '#86a22f', sun: '#ffd34e', ink: '#1d1530', cream: '#fbf6ea' }
const FR = "'Fraunces'"
const BA = "'Barlow Semi Condensed'"

/** a transparent image placed absolutely (x, y top-left, w, h optional, rot, z) */
const img = (o) => `<img class="a" src="${o.src}" style="left:${o.x}px;top:${o.y}px;width:${o.w}px;${o.h ? `height:${o.h}px;` : ''}transform:rotate(${o.rot ?? 0}deg);z-index:${o.z ?? 10};${o.extra ?? ''}" alt="">`
/** a die-cut sticker: the image with a cream border (SVG filter) and a soft shadow */
const sticker = (o) => img({ ...o, extra: `filter:url(#stk) drop-shadow(0 3px 3px rgba(20,25,10,.38));${o.extra ?? ''}` })

const defs = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<filter id="stk" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">
<feGaussianBlur in="SourceAlpha" stdDeviation="6" result="b"/>
<feComponentTransfer in="b" result="m"><feFuncA type="linear" slope="14" intercept="-0.55"/></feComponentTransfer>
<feFlood flood-color="#fbf3e2" result="c"/><feComposite in="c" in2="m" operator="in" result="o"/>
<feMerge><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<radialGradient id="og" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#d6e695"/><stop offset=".42" stop-color="#8fae33"/><stop offset="1" stop-color="#4a6713"/></radialGradient>
<linearGradient id="wd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ecca8e"/><stop offset="1" stop-color="#b88a4a"/></linearGradient>
<filter id="rough" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="7" result="n"/>
<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  5.5 0 0 0 -1.3" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in"/></filter>
<radialGradient id="pulp" cx=".5" cy=".5" r=".55"><stop offset="0" stop-color="#ffcf55"/><stop offset=".7" stop-color="#f9a021"/><stop offset="1" stop-color="#f08a14"/></radialGradient>
</defs></svg>`

// ---------- the zinc bar top ----------
const zinc = `linear-gradient(160deg,#cdd3d7,#a2abb2 52%,#b9c1c6)`
const barTop = [
  `<div class="a" style="inset:0;z-index:0;background:radial-gradient(900px 520px at 18% 8%,rgba(255,255,255,.6),transparent 62%),radial-gradient(760px 640px at 92% 92%,rgba(255,255,255,.35),transparent 62%),repeating-linear-gradient(90deg,rgba(255,255,255,.08) 0 2px,rgba(30,40,50,.05) 2px 5px,rgba(255,255,255,.03) 5px 7px),${zinc}"></div>`,
  // a long soft reflection streak
  `<div class="a" style="left:-200px;top:520px;width:1500px;height:90px;transform:rotate(-20deg);background:linear-gradient(transparent,rgba(255,255,255,.28),transparent);z-index:0"></div>`,
].join('')

/** a vermouth ring stain (reddish brown, soaks into the paper). x, y = centre */
const vring = (o) => {
  const d = o.d ?? 160
  const c = o.c ?? '150,40,38'
  return `<div class="a" style="left:${o.x - d / 2}px;top:${o.y - d / 2}px;width:${d}px;height:${d}px;border-radius:50%;border:${Math.max(3, d * 0.04)}px solid rgba(${c},${o.a ?? 0.34});background:radial-gradient(circle,rgba(${c},.05) 55%,rgba(${c},.12) 100%);box-shadow:inset 0 0 ${d * 0.1}px rgba(${c},.28),0 0 ${d * 0.04}px rgba(${c},.2);z-index:${o.z ?? 40};mix-blend-mode:multiply;transform:scaleY(.95) rotate(${o.rot ?? 0}deg)"></div>`
}
const drop = (x, y, d, z = 40) => `<div class="a" style="left:${x}px;top:${y}px;width:${d}px;height:${d * 0.9}px;border-radius:50%;background:rgba(150,40,38,.32);box-shadow:0 0 ${d * 0.3}px rgba(150,40,38,.3);mix-blend-mode:multiply;z-index:${z}"></div>`

// ---------- the olive-green folder ----------
const folder = [
  // the back tab
  `<div class="a" style="left:566px;top:20px;width:236px;height:56px;border-radius:18px 18px 0 0;background:#7a962b;box-shadow:0 -2px 6px rgba(20,30,20,.25);z-index:1"></div>`,
  text({ x: 590, y: 28, t: 'GOTET · CONCEPT', font: 'Barlow Semi Condensed', weight: 800, size: 23, ls: '.14em', c: '#f6efd2', z: 3 }),
  // the card itself
  `<div class="a paper-tex" style="left:30px;top:56px;width:1020px;height:1256px;border-radius:9px;background-color:#86a22f;box-shadow:0 16px 36px rgba(24,36,44,.5),0 3px 5px rgba(24,36,44,.45);z-index:2"></div>`,
  `<div class="a" style="left:30px;top:56px;width:1020px;height:1256px;border-radius:9px;z-index:2;background:radial-gradient(900px 700px at 28% 22%,rgba(255,255,230,.2),transparent 62%),radial-gradient(800px 800px at 85% 90%,rgba(30,50,0,.22),transparent 65%);box-shadow:inset 0 0 0 2px rgba(255,255,255,.18),inset 0 0 70px rgba(35,55,0,.32)"></div>`,
  // the spine crease
  `<div class="a" style="left:506px;top:56px;width:68px;height:1256px;z-index:2;background:linear-gradient(90deg,transparent,rgba(30,50,0,.18) 30%,rgba(25,40,0,.42) 48%,rgba(255,255,230,.3) 54%,transparent)"></div>`,
  // score lines
  `<div class="a" style="left:488px;top:56px;width:2px;height:1256px;z-index:2;background:rgba(30,50,0,.28);box-shadow:1px 0 0 rgba(255,255,230,.22)"></div>`,
  `<div class="a" style="left:590px;top:56px;width:2px;height:1256px;z-index:2;background:rgba(30,50,0,.25);box-shadow:1px 0 0 rgba(255,255,230,.2)"></div>`,
].join('')

// rivets and a seam of the zinc sheet, in the strip above and below the folder
const rivet = (x, y) => `<div class="a" style="left:${x - 9}px;top:${y - 9}px;width:18px;height:18px;border-radius:50%;background:radial-gradient(circle at 38% 32%,#f4f7f9,#9aa3aa 55%,#6e777e);box-shadow:0 1px 2px rgba(20,30,40,.5),inset 0 0 0 1px rgba(60,70,80,.35);z-index:1"></div>`
const zincBits = [
  `<div class="a" style="left:0;top:11px;width:100%;height:3px;background:rgba(60,70,80,.28);box-shadow:0 2px 0 rgba(255,255,255,.4);z-index:1"></div>`,
  rivet(120, 30), rivet(330, 30), rivet(560, 30), rivet(1010, 30),
  `<div class="a" style="left:0;top:1326px;width:100%;height:3px;background:rgba(60,70,80,.28);box-shadow:0 2px 0 rgba(255,255,255,.4);z-index:1"></div>`,
  rivet(260, 1340), rivet(640, 1340), rivet(1020, 1340),
].join('')

// ---------- small makers ----------
const cropMarks = (x, y, w, h, off = 9, len = 20) => {
  const l = (a, b, c, d) => `<div class="a" style="left:${a}px;top:${b}px;width:${c}px;height:${d}px;background:#171717"></div>`
  return [
    l(x - off - len, y, len, 1.6), l(x + w + off, y, len, 1.6), l(x - off - len, y + h, len, 1.6), l(x + w + off, y + h, len, 1.6),
    l(x, y - off - len, 1.6, len), l(x + w, y - off - len, 1.6, len), l(x, y + h + off, 1.6, len), l(x + w, y + h + off, 1.6, len),
  ].join('')
}

/** a printed bottle label (proof), x, y, w, h inside its parent */
const label = (o) => {
  const { x, y, w, h } = o
  const pink = o.kind !== 'blue'
  const bg = pink ? K.rosat : K.blau
  const fg = pink ? K.blau : K.rosat
  return `<div class="a" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${bg};border-radius:7px;box-shadow:inset 0 0 0 4px ${bg},inset 0 0 0 7px ${pink ? K.blau : K.sun}">
  <img class="a" src="${B(pink ? 'logo-wordmark' : 'logo-wordmark-reverse')}" style="left:${w * 0.13}px;top:${h * 0.07}px;width:${w * 0.74}px">
  <img class="a" src="${B(pink ? 'logo-icon' : 'logo-icon-olive')}" style="left:${w * 0.25}px;top:${h * 0.27}px;width:${w * 0.5}px">
  <div class="a" style="left:0;width:100%;top:${h * 0.65}px;text-align:center;font:800 ${w * 0.1}px/1.1 ${BA};letter-spacing:.14em;color:${fg}">${pink ? 'VERMUT<br>DE LA CASA' : 'OLIVES<br>DE LA CASA'}</div>
  <div class="a" style="left:0;width:100%;top:${h * 0.84}px;text-align:center;font:italic 600 ${w * 0.088}px/1 ${FR};color:${fg}">${pink ? 'Receptari del barri' : 'pot 250 g'}</div></div>`
}

const coaster = (o) => {
  const d = o.d
  const id = 'cp' + Math.round(o.x + o.y)
  return `<div class="a" style="left:${o.x}px;top:${o.y}px;width:${d}px;height:${d}px;transform:rotate(${o.rot ?? 0}deg);z-index:${o.z ?? 16};border-radius:50%;background:#c9a26a;box-shadow:0 2px 0 #b58f58,0 4px 0 #a07b46,0 14px 20px rgba(20,25,10,.5)">
  <div class="a paper-tex" style="inset:3px;border-radius:50%;background-color:${o.c};overflow:hidden">
  <svg class="a" style="inset:0" width="${d - 6}" height="${d - 6}" viewBox="0 0 200 200"><defs><path id="${id}" d="M100,100 m-75,0 a75,75 0 1,1 150,0 a75,75 0 1,1 -150,0"/></defs>
  <circle cx="100" cy="100" r="92" fill="none" stroke="${o.ring}" stroke-width="3.5"/><circle cx="100" cy="100" r="58" fill="none" stroke="${o.ring}" stroke-width="2.5"/>
  <text font-family="Barlow Semi Condensed" font-weight="800" font-size="21" fill="${o.ring}"><textPath href="#${id}" textLength="460" lengthAdjust="spacing">${o.t}</textPath></text></svg>
  ${o.disc ? `<div class="a" style="left:${(d - 6) * 0.29}px;top:${(d - 6) * 0.29}px;width:${(d - 6) * 0.42}px;height:${(d - 6) * 0.42}px;border-radius:50%;background:${o.disc}"></div>` : ''}
  <img class="a" src="${o.icon}" style="left:${(d - 6) * (0.5 - o.is / 2)}px;top:${(d - 6) * (0.5 - o.is / 2)}px;width:${(d - 6) * o.is}px"></div></div>`
}

/** a round rubber stamp: ring text + CONCEPT in the middle. x, y = top-left, d = diameter */
const roundStamp = (o) => {
  const d = o.d
  const c = o.c ?? K.blau
  return `<svg class="a" style="left:${o.x}px;top:${o.y}px;width:${d}px;height:${d}px;transform:rotate(${o.rot ?? -12}deg);z-index:${o.z ?? 36};mix-blend-mode:multiply;opacity:1;filter:url(#rough)" viewBox="0 0 120 120">
  <defs><path id="rs" d="M60,60 m-47,0 a47,47 0 1,1 94,0 a47,47 0 1,1 -94,0"/></defs>
  <circle cx="60" cy="60" r="56" fill="none" stroke="${c}" stroke-width="5"/><circle cx="60" cy="60" r="37" fill="none" stroke="${c}" stroke-width="2.6"/>
  <text font-family="Barlow Semi Condensed" font-weight="800" font-size="15.5" fill="${c}"><textPath href="#rs" textLength="290" lengthAdjust="spacing">INVENTED CLIENT ★ INVENTED CLIENT ★</textPath></text>
  <text x="60" y="66" text-anchor="middle" font-family="Barlow Semi Condensed" font-weight="800" font-size="17.5" fill="${c}" letter-spacing=".4">CONCEPT</text></svg>`
}

const cap = (o) => {
  const d = o.d
  const n = 21
  let teeth = ''
  for (let i = 0; i < n; i++) {
    const a = (i * 2 * Math.PI) / n
    teeth += `<circle cx="${50 + Math.cos(a) * 43}" cy="${50 + Math.sin(a) * 43}" r="6.6"/>`
  }
  return `<div class="a" style="left:${o.x}px;top:${o.y}px;width:${d}px;height:${d}px;transform:rotate(${o.rot ?? 0}deg);z-index:${o.z ?? 24};filter:drop-shadow(1px 4px 3px rgba(20,25,20,.5))">
  <svg class="a" style="inset:0" viewBox="0 0 100 100" width="${d}" height="${d}"><g fill="${o.c}" stroke="#1d1530" stroke-width="4.4">${teeth}<circle cx="50" cy="50" r="43"/></g><g fill="${o.c}">${teeth}<circle cx="50" cy="50" r="43"/></g>
  <circle cx="50" cy="50" r="33" fill="${K.rosat}" stroke="#1d1530" stroke-width="2.4"/><circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1.6"/></svg>
  <img class="a" src="${o.head}" style="left:${d * 0.2}px;top:${d * 0.2}px;width:${d * 0.6}px"></div>`
}

const orange = (o) => {
  const d = o.d
  let lines = ''
  for (let i = 0; i < 10; i++) {
    const a = (i * 36 * Math.PI) / 180
    lines += `<line x1="100" y1="100" x2="${100 + Math.cos(a) * 78}" y2="${100 + Math.sin(a) * 78}"/>`
  }
  return `<svg class="a" style="left:${o.x}px;top:${o.y}px;width:${d}px;height:${d}px;transform:rotate(${o.rot ?? 0}deg);z-index:${o.z ?? 30};filter:drop-shadow(3px 7px 5px rgba(20,25,20,.45))" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="96" fill="#ef7a10"/><circle cx="100" cy="100" r="88" fill="#fff1d2"/><circle cx="100" cy="100" r="81" fill="url(#pulp)"/>
  <g stroke="#fff3d6" stroke-width="5.5" stroke-linecap="round">${lines}</g><circle cx="100" cy="100" r="8" fill="#fff3d6"/>
  <g fill="rgba(255,255,255,.35)"><ellipse cx="62" cy="58" rx="16" ry="7" transform="rotate(-40 62 58)"/><ellipse cx="142" cy="132" rx="12" ry="5" transform="rotate(-38 142 132)"/><ellipse cx="128" cy="62" rx="9" ry="4" transform="rotate(30 128 62)"/></g></svg>`
}

const pick = (o) => `<svg class="a" style="left:${o.x}px;top:${o.y}px;width:${o.w}px;height:${o.w * 0.22}px;transform:rotate(${o.rot ?? 0}deg);z-index:${o.z ?? 32};filter:drop-shadow(3px 6px 3px rgba(20,25,20,.45))" viewBox="0 0 300 66">
  <path d="M3 33 L62 29.5 L290 28.5 Q297 33 290 37.5 L62 36.5 Z" fill="url(#wd)"/>
  <path d="M246 30 L292 6 L284 30 Z" fill="${K.red}" stroke="#7d1020" stroke-width="1.5" stroke-linejoin="round"/>
  <ellipse cx="146" cy="33" rx="58" ry="30" fill="url(#og)" stroke="rgba(40,60,10,.55)" stroke-width="2"/>
  <circle cx="94" cy="33" r="13" fill="${K.red}" stroke="rgba(110,15,25,.6)" stroke-width="2"/><circle cx="90" cy="29" r="4" fill="rgba(255,255,255,.55)"/>
  <ellipse cx="146" cy="16" rx="26" ry="5.5" transform="rotate(-6 146 16)" fill="rgba(255,255,230,.5)"/></svg>`

const pencil = (o) => {
  const w = o.w
  return `<div class="a" style="left:${o.x}px;top:${o.y}px;width:${w}px;height:24px;transform:rotate(${o.rot ?? 0}deg);z-index:${o.z ?? 30};filter:drop-shadow(2px 5px 3px rgba(20,25,20,.45))">
  <div class="a" style="left:0;top:2px;width:24px;height:20px;border-radius:8px 3px 3px 8px;background:#e98a8f"></div>
  <div class="a" style="left:22px;top:0;width:20px;height:24px;background:repeating-linear-gradient(90deg,#c8ccd0 0 3px,#8f969c 3px 4px)"></div>
  <div class="a" style="left:42px;top:0;width:${w - 42 - 44}px;height:24px;background:linear-gradient(#4d6be0 0 28%,${K.blau} 28% 72%,#1b2f9a 72%)"></div>
  <div class="a" style="left:60px;top:0;width:${w - 60 - 60}px;height:24px;font:800 14px/24px ${BA};letter-spacing:.3em;color:${K.rosat};white-space:nowrap">GOTET · GOTET · GOTET</div>
  <div class="a" style="left:${w - 44}px;top:0;width:44px;height:24px;background:#e8c58f;clip-path:polygon(0 0,100% 50%,0 100%)"></div>
  <div class="a" style="left:${w - 14}px;top:8px;width:14px;height:8px;background:#222;clip-path:polygon(0 0,100% 50%,0 100%)"></div></div>`
}

// ---------- the papers ----------
const poster = (n, o) => pic({ src: POS(n), border: 6, shadow: SHADOW.lift, ...o })

const menuCard = (o) => {
  const row = (n, p, y) => `<div class="a" style="left:28px;top:${y}px;width:274px;height:40px;border-bottom:3px dotted rgba(29,21,48,.42)"><span style="position:absolute;left:0;bottom:5px;font:700 21px/1 ${FR};color:${K.ink};white-space:nowrap">${n}</span><span style="position:absolute;right:0;bottom:5px;font:800 22px/1 ${FR};color:${K.red};white-space:nowrap">${p} €</span></div>`
  const pill = (t, y, w) => `<div class="a" style="left:28px;top:${y}px;width:${w}px;height:32px;background:${K.sun};border-radius:4px;font:800 18px/32px ${BA};letter-spacing:.2em;color:${K.blau};padding-left:12px">${t}</div>`
  return sheet({
    ...o, w: 336, h: 504, c: K.rosat, r: 8, shadow: SHADOW.lift,
    inner: [
      `<div class="a" style="inset:12px;border:3.5px solid ${K.blau};border-radius:5px"></div>`,
      img({ src: B('logo-wordmark'), x: 40, y: 28, w: 206, z: 3 }),
      img({ src: B('mascot-oliva-a'), x: 238, y: 14, w: 86, z: 4 }),
      `<div class="a" style="left:0;width:100%;top:116px;text-align:center;font:800 15px/1 ${BA};letter-spacing:.24em;color:${K.blau}">VERMUTERIA DE BARRI</div>`,
      pill('PER BEURE', 148, 150),
      row('Vermut de la casa', '3,50', 190), row('Vermut amb sifó', '3,90', 238), row('Vermut rosat', '4,20', 286),
      pill('PER PICAR', 340, 150),
      row('Olives farcides', '3,00', 382), row('Patates xips', '2,80', 430),
    ].join(''),
  })
}

const proofSheet = (o) => {
  const lw = 150, lh = 212
  const regs = `<svg class="a" style="left:304px;top:26px" width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="13" fill="none" stroke="#111" stroke-width="2"/><circle cx="22" cy="22" r="6" fill="none" stroke="#111" stroke-width="1.6"/><path d="M22 0V44M0 22H44" stroke="#111" stroke-width="1.6"/></svg>`
  const bar = ['#2340c4', '#f8d2d0', '#86a22f', '#d8243c', '#ffd34e', '#1d1530'].map((c, i) => `<div class="a" style="left:${46 + i * 30}px;top:274px;width:26px;height:20px;background:${c};box-shadow:inset 0 0 0 1px rgba(0,0,0,.25)"></div>`).join('')
  return sheet({
    ...o, w: 382, h: 330, c: '#fbfaf4', r: 2, shadow: SHADOW.lift,
    inner: [
      label({ x: 50, y: 40, w: lw, h: lh }), cropMarks(50, 40, lw, lh),
      label({ x: 222, y: 70, w: lw - 20, h: lh - 30, kind: 'blue' }), cropMarks(222, 70, lw - 20, lh - 30, 8, 16),
      regs, bar,
      text({ x: 232, y: 284, t: 'PROOF 02', font: 'DM Mono', weight: 500, size: 19, c: '#222', ls: '.08em' }),
    ].join(''),
  })
}

const orderPad = (o) => {
  const ink = '#1f3fa8'
  const hand = (t, y, x = 26, s = 42, rot = -1) => text({ x, y, t, font: 'Reenie Beanie', size: s, c: ink, rot, lh: 1 })
  return [
    sheet({ x: o.x + 10, y: o.y + 8, w: 244, h: 318, rot: (o.rot ?? 0) + 3, z: (o.z ?? 20) - 1, c: '#ece5cf', shadow: SHADOW.flat }),
    sheet({
      ...o, w: 244, h: 318, c: '#fffbea', r: 2, shadow: SHADOW.lift,
      inner: [
        `<div class="a" style="left:0;top:0;width:100%;height:30px;background:${K.red};border-radius:2px 2px 0 0;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)"></div>`,
        img({ src: B('logo-wordmark-mono-blau'), x: 22, y: 42, w: 96, z: 3 }),
        text({ x: 140, y: 52, t: 'TABLE', font: 'DM Mono', weight: 500, size: 17, c: '#555' }),
        hand('4', 36, 206, 56),
        `<div class="a" style="left:22px;top:92px;width:200px;height:2px;background:#222;opacity:.6"></div>`,
        Array.from({ length: 6 }, (_, i) => `<div class="a" style="left:18px;top:${138 + i * 42}px;width:208px;height:2px;background:rgba(40,80,170,.32)"></div>`).join(''),
        hand('2 vermuts', 98), hand('1 sifó!', 140, 26, 42), hand('olives x2', 182), hand('xips + pa', 224, 26, 42),
        `<svg class="a" style="left:176px;top:98px" width="50" height="170" viewBox="0 0 50 170"><path d="M4 22 L16 34 L40 6 M4 66 L16 78 L40 50 M4 108 L16 120 L40 92 M4 150 L16 162 L40 134" fill="none" stroke="${K.red}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        hand('= 16,70 €', 268, 30, 46, -2),
        pen({ kind: 'under', x: 20, y: 296, w: 190, h: 24, c: K.red, rot: -2, sw: 4 }),
      ].join(''),
    }),
  ].join('')
}

const matchbook = (o) => {
  const { w, h } = o
  const strike = `<div class="a" style="left:0;bottom:0;width:100%;height:30%;background:${K.ink};background-image:radial-gradient(${K.rosat} 2.6px,transparent 3.4px);background-size:15px 12px;background-position:4px 4px"></div>`
  const inner = o.back
    ? `<div class="a" style="left:0;top:9px;width:100%;text-align:center;font:800 ${h * 0.085}px/1 ${BA};letter-spacing:.16em;color:${K.blau}">VERMUTERIA DE BARRI</div><div class="a" style="left:${w * 0.07}px;top:${h * 0.28}px;width:${w * 0.58}px;font:italic 700 ${h * 0.2}px/1.05 ${FR};color:${K.blau}">Encén el diumenge.</div><svg class="a" style="left:${w * 0.72}px;top:${h * 0.26}px" width="${w * 0.22}" height="${h * 0.42}" viewBox="0 0 40 60"><path d="M20 2 C26 16 38 22 36 40 C35 54 26 58 20 58 C12 58 4 52 5 40 C6 30 12 28 14 20 C16 28 20 22 20 2 Z" fill="${K.red}" stroke="${K.ink}" stroke-width="2.4"/><path d="M20 30 C24 38 28 40 27 47 C26 52 22 53 20 53 C16 53 13 50 14 46 C15 40 19 38 20 30 Z" fill="${K.sun}"/></svg>`
    : `<img class="a" src="${B('logo-wordmark-reverse')}" style="left:${w * 0.1}px;top:${h * 0.1}px;width:${w * 0.8}px">`
  return `<div class="a" style="left:${o.x}px;top:${o.y}px;width:${w}px;height:${h}px;transform:rotate(${o.rot ?? 0}deg);z-index:${o.z ?? 20};border-radius:6px;background:${o.back ? K.rosat : K.blau};box-shadow:${SHADOW.lift},inset 0 0 0 4px ${o.back ? K.rosat : K.rosat};overflow:hidden">
  ${o.back ? '' : `<div class="a" style="inset:4px;border-radius:3px;background:${K.blau}"></div>`}${inner}${strike}<div class="a" style="left:${w * 0.3}px;top:${h * 0.7}px;width:${w * 0.4}px;height:3px;background:rgba(255,255,255,.18)"></div></div>`
}

const matchstick = (o) => `<div class="a" style="left:${o.x}px;top:${o.y}px;width:${o.w}px;height:9px;transform:rotate(${o.rot ?? 0}deg);z-index:${o.z ?? 24};filter:drop-shadow(2px 3px 2px rgba(0,0,0,.4))"><div class="a" style="left:0;top:0;width:${o.w - 6}px;height:9px;border-radius:3px;background:linear-gradient(#f4d45c,#d9ae2c)"></div><div class="a" style="left:${o.w - 18}px;top:-3px;width:18px;height:15px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#7a3a3a,#1d1530 70%)"></div></div>`

const stickerSheet = (o) => {
  const st = (src, x, y, w, rot) => sticker({ src, x, y, w, rot, z: 6 })
  const star = `<div class="a" style="left:22px;top:238px;width:104px;height:104px;transform:rotate(-8deg);z-index:6;filter:url(#stk) drop-shadow(0 3px 3px rgba(20,25,10,.38))"><div class="a" style="inset:0;background:${K.ink};clip-path:polygon(50% 0,60% 14%,76% 6%,78% 24%,95% 26%,88% 42%,100% 54%,86% 64%,92% 82%,74% 80%,68% 98%,54% 86%,40% 100%,34% 82%,16% 88%,18% 68%,2% 58%,14% 46%,4% 30%,22% 26%,24% 8%,40% 14%)"></div><div class="a" style="inset:6px;background:${K.sun};clip-path:polygon(50% 0,60% 14%,76% 6%,78% 24%,95% 26%,88% 42%,100% 54%,86% 64%,92% 82%,74% 80%,68% 98%,54% 86%,40% 100%,34% 82%,16% 88%,18% 68%,2% 58%,14% 46%,4% 30%,22% 26%,24% 8%,40% 14%)"></div><div class="a" style="left:0;top:34px;width:100%;text-align:center;font:900 24px/.95 ${FR};color:${K.ink}">XIN-<br>XIN!</div></div>`
  const pill = `<div class="a" style="left:136px;top:270px;width:104px;height:46px;transform:rotate(3deg);z-index:6;border-radius:24px;background:${K.blau};box-shadow:inset 0 0 0 4px ${K.ink};font:900 22px/46px ${FR};text-align:center;color:${K.rosat};filter:url(#stk) drop-shadow(0 3px 3px rgba(20,25,10,.38))">PSSSH!</div>`
  return sheet({
    ...o, w: 262, h: 360, c: '#d3dde2', r: 6, shadow: SHADOW.lift,
    extra: 'background-image:linear-gradient(135deg,rgba(255,255,255,.6),transparent 40%,rgba(255,255,255,.3) 70%,transparent);',
    inner: [
      st(B('mascot-gotet-head-1'), 14, 14, 116, -5), st(B('mascot-oliva-head-1'), 138, 8, 112, 6),
      st(B('mascot-sifo-head-1'), 12, 124, 118, 4), st(B('mascot-xip-head-1'), 136, 120, 116, -6),
      star, pill,
    ].join(''),
  })
}

const receipt = (o) => {
  const w = 252, h = 424
  const zig = (y0, flip) => Array.from({ length: Math.floor(w / 14) + 1 }, (_, i) => `${i * 14}px ${(i % 2 === 0) !== flip ? y0 : y0 === 0 ? 9 : h - 9}px`).join(',')
  const topPts = Array.from({ length: Math.floor(w / 14) + 1 }, (_, i) => `${Math.min(i * 14, w)}px ${i % 2 ? 0 : 9}px`)
  const botPts = Array.from({ length: Math.floor(w / 14) + 1 }, (_, i) => `${Math.min((Math.floor(w / 14) - i) * 14, w)}px ${i % 2 ? h : h - 9}px`)
  const clipPath = `polygon(${[...topPts, ...botPts].join(',')})`
  const li = (t, p, y) => `<div class="a" style="left:22px;top:${y}px;width:208px;font:700 19px/1 'Courier Prime';color:#232323;white-space:nowrap">${t}<span style="position:absolute;right:0">${p}</span></div>`
  return `<div class="a" style="left:${o.x}px;top:${o.y}px;width:${w}px;height:${h}px;transform:rotate(${o.rot ?? 0}deg);z-index:${o.z ?? 19};filter:drop-shadow(0 2px 2px rgba(20,25,20,.3)) drop-shadow(0 10px 14px rgba(20,25,20,.35))">
  <div class="a paper-tex" style="inset:0;background-color:#f7f4ea;clip-path:${clipPath}">
  ${img({ src: B('logo-wordmark-mono-ink'), x: 54, y: 24, w: 144, z: 3 })}
  <div class="a" style="left:0;width:100%;top:92px;text-align:center;font:700 17px/1 'Courier Prime';letter-spacing:.14em;color:#444">BAR TAB · TABLE 4</div>
  <div class="a" style="left:22px;top:122px;width:208px;border-top:2px dashed #666"></div>
  ${li('2 Vermut casa', '7,00', 138)}${li('1 Vermut sifó', '3,90', 170)}${li('1 Olives', '3,00', 202)}${li('1 Xips casa', '2,80', 234)}
  <div class="a" style="left:22px;top:268px;width:208px;border-top:2px dashed #666"></div>
  <div class="a" style="left:22px;top:282px;width:208px;font:700 27px/1 'Courier Prime';color:#111;white-space:nowrap">TOTAL<span style="position:absolute;right:0">16,70€</span></div>
  <div class="a" style="left:22px;top:338px;width:208px;height:44px;background:repeating-linear-gradient(90deg,#111 0 2px,transparent 2px 4px,#111 4px 5px,transparent 5px 8px,#111 8px 11px,transparent 11px 13px)"></div>
  <div class="a" style="left:0;width:100%;top:396px;text-align:center;font:italic 600 17px/1 ${FR};color:#333">Gaudeix-ne amb seny.</div></div></div>`
}

// ---------- the layout ----------
export default function () {
  const body = [
    defs,
    barTop,
    // vermouth rings on the bar, half under the folder
    vring({ x: 470, y: 26, d: 124, rot: 20, z: 1 }),
    vring({ x: 160, y: 1338, d: 150, rot: -10, z: 1, a: 0.3 }),
    vring({ x: 905, y: 1334, d: 110, rot: 6, z: 1, a: 0.26 }),
    zincBits,
    folder,
    // ---- top zone: fanned posters, tape label, matchbooks, olive pick, tab clutter
    poster(3, { x: 44, y: 98, w: 232, h: 329, rot: -7, z: 4 }),
    poster(1, { x: 192, y: 80, w: 232, h: 329, rot: 3, z: 5 }),
    poster(2, { x: 340, y: 106, w: 232, h: 329, rot: 10, z: 6 }),
    tape({ x: 160, y: 66, w: 270, h: 52, rot: -3, c: 'rgba(243,232,190,.88)', z: 30 }),
    text({ x: 46, y: 46, t: 'gotet · back office', font: 'Gochi Hand', size: 38, c: '#1d1530', rot: -3, z: 31 }),
    clip({ x: 400, y: 70, h: 118, rot: 8, c: '#d8243c', z: 22 }),
    matchbook({ x: 604, y: 76, w: 170, h: 116, rot: -6, z: 14 }),
    matchbook({ x: 618, y: 226, w: 170, h: 116, rot: 5, z: 13, back: true }),
    matchstick({ x: 624, y: 372, w: 130, rot: -4, z: 15 }),
    receipt({ x: 806, y: 54, rot: 4, z: 19 }),
    // ---- the hero print: the brand board (its header, wordmark and cast, lands in the visible band)
    pic({ src: BOARD, x: 492, y: 478, w: 556, h: 786, rot: 1.6, border: 7, bc: '#fbf8ee', z: 10, shadow: SHADOW.lift }),
    tape({ x: 540, y: 482, w: 130, h: 40, rot: -32, c: 'rgba(255,211,78,.82)', z: 30 }),
    tape({ x: 836, y: 806, w: 120, h: 38, rot: -24, c: 'rgba(248,170,170,.8)', z: 30 }),
    // ---- left of the band: the menu and the coasters
    menuCard({ x: 40, y: 468, rot: -3, z: 14 }),
    clip({ x: 70, y: 440, h: 124, rot: -6, c: '#2340c4', z: 22 }),
    coaster({ x: 330, y: 486, d: 220, rot: 12, z: 16, c: K.sun, ring: K.blau, t: 'GOTET PETIT · DIUMENGE GRAN ·', icon: B('logo-icon'), is: 0.46 }),
    coaster({ x: 346, y: 690, d: 206, rot: -8, z: 17, c: K.blau, ring: K.rosat, t: 'VERMUTERIA DE BARRI · CARDEDEU ·', icon: B('logo-icon-olive'), is: 0.34, disc: K.rosat }),
    vring({ x: 446, y: 650, d: 150, rot: 10, z: 18, a: 0.3 }),
    // ---- bottom left: the folder pocket with papers sticking out, the proof sheet and the order pad
    sheet({ x: 70, y: 1090, w: 190, h: 240, rot: -5, c: K.rosat, z: 8, shadow: SHADOW.flat }),
    sheet({ x: 240, y: 1100, w: 200, h: 230, rot: 2, c: K.sun, z: 8, shadow: SHADOW.flat }),
    sheet({ x: 380, y: 1080, w: 130, h: 240, rot: 7, c: K.blau, z: 8, shadow: SHADOW.flat }),
    `<div class="a paper-tex" style="left:30px;top:1160px;width:460px;height:152px;border-radius:0 0 0 9px;background-color:#779328;box-shadow:0 -3px 8px rgba(20,35,0,.35),inset 0 0 0 2px rgba(255,255,255,.12);z-index:12;-webkit-mask-image:radial-gradient(circle 60px at 50% 0,transparent 97%,#000 100%);mask-image:radial-gradient(circle 60px at 50% 0,transparent 97%,#000 100%)"></div>`,
    `<div class="a" style="left:46px;top:1176px;width:420px;height:122px;border:3px dashed rgba(250,246,214,.5);border-radius:5px;z-index:13"></div>`,
    proofSheet({ x: 34, y: 930, rot: -2.4, z: 20 }),
    // the CONCEPT stamp on the header of the brand board, inside the visible band
    roundStamp({ x: 936, y: 484, d: 112, rot: -12, z: 36, c: '#1c35b5' }),
    orderPad({ x: 392, y: 944, rot: 4, z: 21 }),
    clip({ x: 540, y: 924, h: 120, rot: 16, c: '#a9b2ba', z: 30 }),
    // ---- bottom right: sticker sheet, caps, olive pick, orange slice
    stickerSheet({ x: 798, y: 800, rot: -3, z: 18 }),
    cap({ x: 540, y: 1226, d: 100, c: K.red, head: B('mascot-gotet-head-1'), rot: 12, z: 24 }),
    cap({ x: 700, y: 1186, d: 100, c: K.blau, head: B('mascot-sifo-head-1'), rot: -8, z: 24 }),
    cap({ x: 836, y: 1232, d: 98, c: K.olive, head: B('mascot-oliva-head-1'), rot: -14, z: 25 }),
    cap({ x: 948, y: 1186, d: 96, c: K.sun, head: B('mascot-xip-head-1'), rot: 20, z: 24 }),
    cap({ x: 446, y: 384, d: 96, c: K.sun, head: B('mascot-xip-head-1'), rot: -10, z: 24 }),
    pencil({ x: 180, y: 1282, w: 290, rot: -6, z: 30 }),
    pick({ x: 690, y: 1268, w: 300, rot: -6, z: 32 }),
    orange({ x: 4, y: 1186, d: 160, rot: 20, z: 31 }),
    vring({ x: 700, y: 1196, d: 120, rot: 5, z: 41, a: 0.28 }),
    drop(300, 1180, 12), drop(318, 1200, 7), drop(770, 1040, 9, 42),
  ].join('')
  return { bg: '#a7b0b6', body }
}
