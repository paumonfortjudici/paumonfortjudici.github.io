// Builds slide-2.svg ("I'M ONA RIBAS"). Run:  node art-src/concept-portfolio/a-tools/slide-2.mjs [--render] [--scale 1|2] [--tag name] [--guides]
import fs from 'node:fs'
import { buildSlide, render, trail, SC } from './lib.mjs'
import { ona } from './ona.mjs'
import { framesInner, props } from './frames.mjs'

const argv = process.argv.slice(2)
const SCALE = argv.includes('--scale') ? Number(argv[argv.indexOf('--scale') + 1]) : 1
const TAG = argv.includes('--tag') ? argv[argv.indexOf('--tag') + 1] : 'r'
const OUT = `${SC}/art/concept-portfolio/slide-2`
const O = ona()
const T2 = 'translate(451 682) scale(1.029)'

// ---------------- bg: field + teal floor (floor edge is a hand-wobbled path: no filter needed) ----------------
const floorEdge = (() => { // seeded wobble along y ~ 1700
  const pts = []; let seed = 7; const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  for (let x = -20; x <= 1100; x += 70) pts.push([x, 1700 + (r() - 0.5) * 9])
  return 'M-20 1960L-20 ' + pts[0][1].toFixed(1) + pts.slice(1).map((p, i) => 'L' + p[0] + ' ' + p[1].toFixed(1)).join('') + 'L1100 1960Z'
})()
const bg = `<rect id="field" width="1080" height="1920" fill="#FDEFAF"/>
<g id="floor-fx" filter="url(#f-rough-lite)"><path id="floor" d="${floorEdge}" fill="#007E9B"/></g>
<g id="floor-dots" filter="url(#f-ht-m)"><ellipse cx="860" cy="1930" rx="470" ry="230" fill="#63A0AC" fill-opacity=".46" mask="url(#tone-core)"/></g>`

// ---------------- art-back: hero burst ----------------
const artBack = `<g id="burst-hero" filter="url(#f-rough-lite)"><use href="#sb-7" x="330" y="-110" width="900" height="900" fill="#F2C62F" transform="rotate(${argv.includes('--rot') ? argv[argv.indexOf('--rot') + 1] : -28} 780 340)"/></g>`

// ---------------- frames + props + tags ----------------
const PR = props()
const FRAMES = `<g id="frames" filter="url(#f-cutout)">${framesInner()}${PR.tagsShapes}</g>
<g id="props-flat" filter="url(#f-rough)"><g transform="translate(-4 3)">${PR.flat}</g></g>
<g id="props-ink" filter="url(#f-wobble)">${PR.ink}</g>
<g id="tape-sparks" filter="url(#f-rough-lite)">${PR.tapes}${PR.extra}
  <use href="#sp-4" x="212" y="1198" width="56" height="56" fill="#F2C62F"/><use href="#sp-4s" x="1026" y="1128" width="42" height="42" fill="#F2C62F"/><use href="#sp-4s" x="434" y="1096" width="38" height="38" fill="#F2C62F"/></g>
<g id="tag-text">${PR.tagsText}</g>`

const MOTION = `<g id="motion-marks" fill="none" stroke="#101820" stroke-width="6" stroke-linecap="round">
  <use href="#fx-impact" x="634" y="1612" width="110" height="110" transform="rotate(8 689 1667)"/>
  <path d="M742 1478C758 1500 760 1530 748 1556M762 1470C784 1496 786 1536 770 1566" stroke-width="5"/>
</g>`

// ---------------- Ona (z: shadow, socks, sweater, pants, bib, boots, body ink | burst | arms + coconuts, coconut ink, head, hands) ----------------
const L = O.lower
const ONA_BODY = `<g id="ona-body-flat" filter="url(#f-rough)"><g transform="${T2}">
  ${L.floorShadow}${L.sockL}${L.sockS}
  <g transform="${O.UP}">${O.upper.sweater}</g>
  ${L.pantsFlat}${L.pantsShade}${L.cuffS}${L.cuffL}
  <g transform="${O.UP}">${O.upper.bib}</g>
  ${L.bootS}${L.bootL}
</g></g>
<g id="ona-body-ink" filter="url(#f-wobble)">${MOTION}<g transform="${T2}">${O.ink.inkLegs}${O.ink.contourLegs}<g transform="${O.UP}">${O.ink.inkUpperUP}${O.ink.contourUP}</g></g></g>`
const BURST = `<g id="burst-clip" filter="url(#f-rough)"><g transform="rotate(6 716 1060)"><use href="#bst-11" x="574" y="926" width="300" height="300" fill="#101820"/><use href="#bst-11" x="566" y="918" width="300" height="300" fill="#F2C62F"/></g></g>`
const ONA_ARMS = `<g id="ona-arms-flat" filter="url(#f-rough)"><g transform="${T2}"><g transform="${O.UP}">${O.upper.sleeves}${O.handsBlock.coconutsFlat}</g></g></g>
<g id="ona-arms-ink" filter="url(#f-wobble)"><g transform="${T2}"><g transform="${O.UP}">${O.ink.inkArms}${O.ink.contourArms}${O.handsBlock.coconutsInk}</g></g></g>`
const ONA_HEAD = `<g id="ona-head" transform="${T2}"><g transform="${O.UP}">${O.head}</g></g>`
const ONA_HANDS = `<g id="ona-hands" transform="${T2}"><g transform="${O.UP}">${O.handsBlock.hands}</g></g>`

const feet = '<g id="footprints">' + trail(110, 1812, 470, 1812, 5, { w: 46, h: 120, fill: '#FDEFAF', op: 0.75, gap: 15 }) + '</g>'

const art = [feet, FRAMES, ONA_BODY, BURST, ONA_ARMS, ONA_HEAD, ONA_HANDS].join(String.fromCharCode(10))

// ---------------- type ----------------
const para = ['I make the sounds nobody', 'notices until they’re missing:', 'footsteps, rustling coats, a', 'door that finally closes. Ten', 'years in a studio full of', 'gravel, celery and old shoes,', 'and one very patient', 'neighbour.']
const type = `
<g id="lockups" filter="url(#f-type)"><g fill="#1B6885"><use href="#t-im-ona" x="72" y="296"/><use href="#t-ribas" x="72" y="540"/></g>
  <g transform="rotate(2.5 716 1012)" font-family="Anybody" font-weight="800" font-size="27" style="font-stretch:115%" text-anchor="middle"><text x="716" y="1015" fill="#101820">CLIP-CLOP!</text></g></g>
<text class="t-body-i" x="72" y="604" font-size="30" fill="#1B6885">(Ona means wave, in Catalan.)</text>
<g class="t-sc" font-size="28" fill="#1B6885"><text x="72" y="690">FOLEY ARTIST &amp;</text><text x="72" y="726">SOUND DESIGNER</text></g>
<text class="t-label" xml:space="preserve" x="72" y="772" font-size="22" fill="#E8553E">GIRONA  ·  SINCE 2016</text>
<g class="t-body" font-size="32" fill="#1B6885">${para.map((l, i) => `<text x="72" y="${832 + 46 * i}">${l}</text>`).join('')}</g>`
const chrome = `<g class="t-sc" font-size="28" fill="#1B6885"><text x="72" y="112">ABOUT</text><text x="1010.5" y="112" text-anchor="end">02 / 05</text></g>`

const svgPath = buildSlide({
  n: 2,
  speckOpacity: 0.8,
  title: 'Ona Ribas - concept portfolio - slide 2 (about)',
  layers: { bg, 'art-back': artBack, art, type, chrome },
  extraDefs: '<clipPath id="hand-clip"><rect x="-60" y="-60" width="220" height="176"/></clipPath>',
})
if (argv.includes('--guides')) fs.writeFileSync(svgPath, fs.readFileSync(svgPath, 'utf8').replace('<g id="guides" display="none"', '<g id="guides" display="inline"'))
if (argv.includes('--render')) console.log(render(svgPath, `${OUT}/${TAG}${SCALE === 2 ? '@2x' : ''}.png`, SCALE))
