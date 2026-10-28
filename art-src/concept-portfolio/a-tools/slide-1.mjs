// Builds slide-1.svg (COVER). Run:  node art-src/concept-portfolio/a-tools/slide-1.mjs [--render] [--scale 1|2] [--tag name] [--guides]
// Filtered groups (<= 14): back-fx, shadows, cable, grip-flat, grip-ink, mic-fur, mic-belly, flat-hw, ink-main, badges, badge-crunch, type  (= 12)
import fs from 'node:fs'
import { buildSlide, render, trail, SC } from './lib.mjs'
import { mic } from './mic.mjs'

const argv = process.argv.slice(2)
const SCALE = argv.includes('--scale') ? Number(argv[argv.indexOf('--scale') + 1]) : 1
const TAG = argv.includes('--tag') ? argv[argv.indexOf('--tag') + 1] : 'r'
const OUT = `${SC}/art/concept-portfolio/slide-1`
const M = mic()

// ---------------- art-back: waveform band + hero burst (one rough-lite group) ----------------
const artBack = `
<g id="halo-dots" filter="url(#f-ht-l)"><circle cx="450" cy="1030" r="500" fill="#1B6885" fill-opacity=".56" mask="url(#tone-core)"/></g>
<g id="back-fx" filter="url(#f-rough-lite)">
  <use id="wave-band" href="#wv-a" x="20" y="980" width="1045" height="210" fill="#1B6885"/>
  <use id="burst-hero" href="#sb-9" x="-64" y="560" width="940" height="940" fill="#F2C62F" transform="rotate(8 406 1030)"/>
</g>`

// ---------------- hard flats of the small badges ----------------
const sparkles = `<g id="sparkles">
  <use href="#sp-4" x="96" y="640" width="76" height="76" fill="#FDEFAF"/>
  <use href="#sp-4s" x="985" y="1060" width="58" height="58" fill="#FDEFAF"/>
  <use href="#sp-4" x="560" y="650" width="46" height="46" fill="#F2C62F"/>
  <use href="#sp-4s" x="424" y="1496" width="40" height="40" fill="#F2C62F"/>
</g>`
const listen = `<g id="fx-listen" fill="none" stroke="#FDEFAF" stroke-width="11" stroke-linecap="round"><use href="#fx-waves" x="124.4" y="762" width="96" height="180" transform="rotate(208 128 852)"/></g>`

const badgesFlat = `<g id="badges-flat">
  <g id="burst-snap" transform="rotate(7 905 690)"><use href="#bst-11" x="822" y="608" width="180" height="180" fill="#101820"/><use href="#bst-11" x="815" y="600" width="180" height="180" fill="#F2C62F"/></g>
  <g id="burst-crunch-shadow" transform="rotate(-8 215 1535)"><use href="#bst-15" x="93" y="1413" width="260" height="260" fill="#101820"/></g>
  <g id="seal-flat"><use href="#bst-seal" x="808" y="1599" width="200" height="200" fill="#101820"/><use href="#bst-seal" x="800" y="1590" width="200" height="200" fill="#E8553E"/></g>
</g>`
const crunchFlat = `<g id="burst-crunch" transform="rotate(-8 215 1535)"><use href="#bst-15" x="85" y="1405" width="260" height="260" fill="#E8553E"/></g>`

const feet = `<g id="footprints">\n${trail(40, 1884, 1040, 1884, 8, { w: 44, h: 115, fill: '#FDEFAF', op: 0.7, gap: 14 })}\n</g>`

const art = [
  feet,
  `<g id="shadows" filter="url(#f-dry)">${M.shadows}</g>`,
  `<g id="cable" filter="url(#f-wobble)">${M.cable}</g>`,
  `<g id="grip-flat" filter="url(#f-rough-lite)">${M.gripFlat}</g>`,
  `<g id="grip-ink" filter="url(#f-wobble)">${M.gripInk}</g>`,
  `<g id="mic-fur" filter="url(#f-rough-lite)">${M.furFlat}</g>`,
  `<g id="mic-belly" filter="url(#f-ht-m)">${M.halftone}</g>`,
  `<g id="flat-hw" filter="url(#f-rough-lite)">${M.hwFlat}${M.xlrFlat}${sparkles}</g>`,
  `<g id="ink-main" filter="url(#f-wobble)">${M.micInk}${M.xlrInk}${listen}</g>`,
  `<g id="badges" filter="url(#f-rough)">${badgesFlat}</g>`,
  `<g id="badge-crunch" filter="url(#f-gouache)">${crunchFlat}</g>`,
].join('\n')

// ---------------- type: ONE f-type group (title + onomatopoeia + numerals), plain text elsewhere ----------------
const type = `
<g id="lockups" filter="url(#f-type)">
  <g fill="#FDEFAF"><use href="#t-foley" x="72" y="400"/><use href="#t-portfolio" x="72" y="558"/></g>
  <g id="lt-crunch" transform="rotate(-8 215 1535)" font-family="Anybody" font-weight="800" font-size="34" style="font-stretch:120%" text-anchor="middle">
    <text x="219" y="1552" fill="#101820">CRUNCH!</text><text x="215" y="1547" fill="#FDEFAF">CRUNCH!</text></g>
  <g id="lt-snap" transform="rotate(7 905 690)" font-family="Anybody" font-weight="800" font-size="31" style="font-stretch:118%" text-anchor="middle">
    <text x="905" y="702" fill="#101820">SNAP!</text></g>
  <g id="lt-2026" font-family="Anybody" font-weight="700" style="font-stretch:140%" font-size="32" text-anchor="middle"><text x="903" y="1706" fill="#101820">2026</text><text x="900" y="1702" fill="#FDEFAF">2026</text></g>
</g>
<path id="seal-arc" d="M900 1618A72 72 0 1 1 899.9 1618" fill="none"/>
<text class="t-label" xml:space="preserve" font-size="20" fill="#FDEFAF"><textPath href="#seal-arc" textLength="446" lengthAdjust="spacing">FOOTSTEPS  ·  CLOTH  ·  PROPS  ·  </textPath></text>
<g class="t-body" font-size="38" fill="#FDEFAF"><text x="72" y="1700">The small noises that make a</text><text x="72" y="1754">film feel real.</text></g>
<text class="t-sc" xml:space="preserve" x="72" y="1800" font-size="24" fill="#FDEFAF">PORTFOLIO 2026  ·  GIRONA</text>`

const chrome = `
<g class="t-sc" font-size="28" fill="#FDEFAF"><text x="72" y="112">FOLEY &amp; SOUND DESIGN</text><text x="1010.5" y="112" text-anchor="end">ONA RIBAS</text></g>`

const svgPath = buildSlide({
  n: 1,
  field: '#007E9B',
  speckOpacity: 0.7,
  title: 'Ona Ribas - concept portfolio - slide 1 (cover)',
  layers: { 'art-back': artBack, art, type, chrome },
})
if (argv.includes('--guides')) fs.writeFileSync(svgPath, fs.readFileSync(svgPath, 'utf8').replace('<g id="guides" display="none"', '<g id="guides" display="inline"'))
if (argv.includes('--render')) console.log(render(svgPath, `${OUT}/${TAG}${SCALE === 2 ? '@2x' : ''}.png`, SCALE))
