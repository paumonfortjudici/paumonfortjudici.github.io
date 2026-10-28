// Generates kit/ona-parts.svg : the recurring character ONA RIBAS as reusable symbols (head + expression overlays, headphones, hands, boots, sock).
// Everything is flat colour + partial ink, drawn FRONT-FACING / side-on, so any pose is built by rotating / tilting these parts.
// Usage in a slide (after `node kit/inline-kit.mjs slide-N.svg`):
//   <use href="#ona-head" x="X" y="Y" width="W" height="W*1.05"/>   W = head width in px (the symbol box is 400 x 420, hair included)
// Colours are fixed inside the symbols (skin, hair, ink, accents) so Ona is identical on every slide.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = path.dirname(fileURLToPath(import.meta.url))

const INK = '#101820', NIGHT = '#0F4157', SKIN = '#E7AC84', SHADE = '#C98A62', BLUSH = '#F2A29A', SUN = '#F2C62F', TOMATO = '#E8553E', PAPER = '#F6F0DC', STEEL = '#63A0AC', CELERY = '#9CCF9A'

// ---------------- HEAD (viewBox 0 0 400 420) ----------------
const hairBack = 'M96 348A30 30 0 0 1 62 296A40 40 0 0 1 48 230A42 42 0 0 1 50 164A44 44 0 0 1 74 102A46 46 0 0 1 122 56A50 50 0 0 1 190 30A50 50 0 0 1 256 32A48 48 0 0 1 314 62A46 46 0 0 1 352 114A44 44 0 0 1 360 178A44 44 0 0 1 354 244A40 40 0 0 1 336 302A34 34 0 0 1 304 348L250 330L150 330Z'
const face = 'M200 104C142 104 112 142 112 198C112 254 132 298 166 318C186 330 214 330 234 318C268 298 288 254 288 198C288 142 258 104 200 104Z'
const fringe = 'M302 126C288 98 240 82 196 84C146 86 108 112 102 170C102 190 112 202 124 200C128 172 150 148 192 146C232 144 266 156 298 180C306 162 308 142 302 126Z'
const headBase = `
  <path d="${hairBack}" fill="${INK}"/>
  <path d="M170 312L174 396L230 396L234 312Z" fill="${SKIN}"/>
  <path d="M170 318C188 346 216 346 234 318L234 348C216 368 188 368 170 348Z" fill="${SHADE}"/>
  <path d="M114 198C94 192 84 214 94 234C100 246 112 246 116 238Z" fill="${SKIN}"/>
  <path d="M286 198C306 192 316 214 306 234C300 246 288 246 284 238Z" fill="${SKIN}"/>
  <circle cx="302" cy="258" r="16" fill="none" stroke="${SUN}" stroke-width="6"/>
  <path d="${face}" fill="${SKIN}"/>
  <path d="${fringe}" fill="${INK}"/>
  <g fill="none" stroke="${NIGHT}" stroke-width="6" stroke-linecap="round">
    <path d="M118 84C108 100 118 116 134 112"/><path d="M200 52C190 68 200 84 216 80"/><path d="M290 84C300 100 292 116 276 112"/><path d="M330 170C344 178 346 198 334 208"/><path d="M72 190C60 198 60 218 72 226"/><path d="M322 290C336 296 336 312 324 320"/><path d="M80 290C68 298 70 314 82 320"/>
  </g>
  <ellipse cx="140" cy="252" rx="20" ry="12" fill="${BLUSH}" opacity=".85"/><ellipse cx="260" cy="252" rx="20" ry="12" fill="${BLUSH}" opacity=".85"/>
  <g fill="${SHADE}"><circle cx="176" cy="234" r="3"/><circle cx="190" cy="228" r="3"/><circle cx="224" cy="228" r="3"/><circle cx="214" cy="234" r="3"/></g>
  <path d="M186 246C194 254 206 254 214 246" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
  <rect x="108" y="108" width="48" height="13" rx="6.5" fill="${SUN}" transform="rotate(-28 132 114)"/>`
const eyesOpen = `<g fill="${INK}"><ellipse cx="160" cy="208" rx="6.5" ry="8.5"/><ellipse cx="240" cy="208" rx="6.5" ry="8.5"/></g><g fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"><path d="M142 180C152 172 166 172 176 176"/><path d="M226 176C236 172 250 172 260 180"/></g>`
const eyesHappy = `<g fill="none" stroke="${INK}" stroke-width="6.5" stroke-linecap="round"><path d="M148 212C154 200 166 200 172 212"/><path d="M228 212C234 200 246 200 252 212"/><path d="M142 178C152 170 166 170 176 174"/><path d="M226 174C236 170 250 170 260 178"/></g>`
const eyesSide = `<g fill="${INK}"><ellipse cx="152" cy="208" rx="6.5" ry="8.5"/><ellipse cx="232" cy="208" rx="6.5" ry="8.5"/></g><g fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"><path d="M136 176C146 168 160 168 170 172"/><path d="M220 172C230 168 244 168 254 176"/></g>`
const mouthSmile = `<path d="M160 272C180 290 220 290 240 272" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`
const mouthGrin = `<path d="M156 266C176 306 224 306 244 266C220 272 180 272 156 266Z" fill="${INK}"/><path d="M174 288C186 300 214 300 226 288C214 282 186 282 174 288Z" fill="${TOMATO}"/>`
const mouthOh = `<ellipse cx="200" cy="280" rx="13" ry="16" fill="${INK}"/><ellipse cx="200" cy="288" rx="8" ry="7" fill="${TOMATO}"/>`

// ---------------- HEADPHONES ----------------
// worn around the neck: 2 yellow cups on the collarbones + band arcs rising behind the neck. Box 0 0 340 150, cups centred x=48 and x=292.
const cup = (cx, cy, k = 1) => `<g transform="translate(${cx} ${cy}) scale(${k})"><ellipse cx="0" cy="6" rx="42" ry="54" fill="${INK}"/><ellipse cx="0" cy="0" rx="38" ry="50" fill="${SUN}" stroke="${INK}" stroke-width="6"/><ellipse cx="0" cy="4" rx="22" ry="30" fill="${NIGHT}"/><path d="M-26 -22C-24 -36 -10 -44 4 -44" fill="none" stroke="${PAPER}" stroke-width="5" stroke-linecap="round" opacity=".8"/></g>`
const band = (d) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="30" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${SUN}" stroke-width="17" stroke-linecap="round"/>`
// worn around the neck: 2 yellow cups on the collarbones + band arcs rising behind the neck. Box -10 -20 360 190, cups centred x=48 and x=292.
const cansNeck = band('M62 38C86 6 122 -6 152 -6') + band('M278 38C254 6 218 -6 188 -6') + cup(48, 92) + cup(292, 92)
// worn on the head, drawn in the HEAD box (0 0 400 420): yellow band over the hair + small cups on the ears
const cansOn = band('M96 214C66 120 118 22 200 22C282 22 334 120 304 214') + cup(92, 232, 0.62) + cup(308, 232, 0.62)

// ---------------- HANDS (viewBox 0 0 120 150, wrist at the bottom) ----------------
const handOpenD = 'M40 150L38 118C26 112 14 100 10 86C8 76 16 68 26 72C30 74 34 80 38 88L38 44C38 34 56 32 56 44L56 26C56 14 74 14 74 26L74 40C74 30 90 30 90 42L90 56C90 48 104 48 104 58L100 96C98 116 88 128 84 150Z'
const handOpen = `<path d="${handOpenD}" fill="${SKIN}"/><g fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"><path d="M56 46L56 82M74 42L74 80M90 58L90 80"/><path d="${handOpenD}" stroke-width="5" stroke-dasharray="96 30" stroke-dashoffset="-14" stroke-linejoin="round"/></g>`
const handHoldD = 'M38 150L36 118C22 110 16 92 24 76C32 62 50 54 70 56C94 58 108 74 104 96C102 110 94 118 88 124L84 150Z'
const handHold = `<path d="${handHoldD}" fill="${SKIN}"/><path d="M62 60C74 48 98 52 100 68C100 78 90 82 80 78C70 76 62 70 62 60Z" fill="${SKIN}"/><g fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><path d="M24 82C36 78 50 80 58 88"/><path d="M24 98C36 94 50 96 58 104"/><path d="M28 112C38 108 48 110 54 116"/><path d="M62 60C74 48 98 52 100 68"/><path d="${handHoldD}" stroke-width="5" stroke-dasharray="80 36" stroke-dashoffset="-6"/></g>`

// ---------------- BOOT, side view facing LEFT (viewBox 0 0 300 200) ----------------
const boot = `<path d="M258 6L258 104C258 124 252 134 244 142L56 142C30 142 16 128 20 108C24 90 44 82 70 80C100 76 120 62 134 42C144 28 160 22 178 22L178 6Z" fill="${INK}"/><path d="M28 112C34 96 54 90 74 90C90 90 100 96 100 106L100 138L44 138C32 134 24 124 28 112Z" fill="${NIGHT}"/><rect x="170" y="2" width="96" height="34" rx="10" fill="${TOMATO}" stroke="${INK}" stroke-width="6"/><path d="M180 20L256 20" stroke="${PAPER}" stroke-width="4" stroke-dasharray="10 8" stroke-linecap="round" opacity=".8"/><path d="M12 140L252 140C268 140 280 148 282 162C283 178 272 188 256 188L40 188C20 188 8 176 8 160C8 150 10 144 12 140Z" fill="${PAPER}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><path d="M26 176L26 188M58 176L58 188M90 176L90 188M122 176L122 188M154 176L154 188M186 176L186 188M218 176L218 188M250 176L250 188" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><g fill="${PAPER}"><circle cx="156" cy="58" r="6.5"/><circle cx="132" cy="76" r="6.5"/><circle cx="106" cy="92" r="6.5"/></g><path d="M170 60C190 50 214 44 248 42" fill="none" stroke="${STEEL}" stroke-width="5" stroke-linecap="round"/>`
const sock = (c) => `<path d="M0 10C14 0 26 16 40 8C54 0 66 16 80 8L80 92L0 92Z" fill="${c}"/><path d="M0 34L80 34M0 54L80 54M0 74L80 74" stroke="${INK}" stroke-width="4" opacity=".28"/>`

const symbols = [
  ['ona-head-base', '0 0 400 420', headBase, 'head + hair + ear/hoop + cheeks + nose, NO eyes/mouth'],
  ['ona-eyes-open', '0 0 400 420', eyesOpen, 'default eyes + brows'],
  ['ona-eyes-happy', '0 0 400 420', eyesHappy, 'laughing arcs'],
  ['ona-eyes-side', '0 0 400 420', eyesSide, 'looking to the viewer\'s left (eyes 8 px left)'],
  ['ona-mouth-smile', '0 0 400 420', mouthSmile, 'quiet smile'],
  ['ona-mouth-grin', '0 0 400 420', mouthGrin, 'open grin with tongue'],
  ['ona-mouth-oh', '0 0 400 420', mouthOh, 'concentration / surprise'],
  ['ona-cans-neck', '-10 -20 360 190', cansNeck, 'headphones worn around the NECK (draw over the collar, under the chin)'],
  ['ona-cans-on', '0 0 400 420', cansOn, 'headphones worn ON the head (draw over the head)'],
  ['ona-hand-open', '0 0 120 150', handOpen, 'open palm, wrist at the bottom (wave, hold-up)'],
  ['ona-hand-hold', '0 0 120 150', handHold, 'curled fist / gripping (coconut, strap, mug)'],
  ['ona-boot', '0 0 300 200', boot, 'right boot, side view, toe to the LEFT. Mirror for the other side.'],
  ['ona-sock-celery', '0 0 80 90', sock(CELERY), 'mismatched sock (celery) - shows above the boot cuff'],
  ['ona-sock-salmon', '0 0 80 90', sock(BLUSH), 'mismatched sock (salmon)'],
]
const comp = (id, ...parts) => `<symbol id="${id}" viewBox="0 0 400 420" overflow="visible">${parts.map((p) => `<use href="#${p}" width="400" height="420"/>`).join('')}</symbol>`
const assembled = [
  comp('ona-head', 'ona-head-base', 'ona-eyes-open', 'ona-mouth-smile'),
  comp('ona-head-grin', 'ona-head-base', 'ona-eyes-open', 'ona-mouth-grin'),
  comp('ona-head-happy', 'ona-head-base', 'ona-eyes-happy', 'ona-mouth-grin'),
  comp('ona-head-oh', 'ona-head-base', 'ona-eyes-side', 'ona-mouth-oh'),
]
const defs = symbols.map(([id, vb, body, note]) => `  <!-- ${id}: ${note} -->\n  <symbol id="${id}" viewBox="${vb}" overflow="visible">${body}</symbol>`).join('\n') + '\n  <!-- assembled heads (use these first) -->\n  ' + assembled.join('\n  ')

// ---------------- preview ----------------
const U = (id, x, y, w, h, extra = '') => `<use href="#${id}" x="${x}" y="${y}" width="${w}" height="${h}" ${extra}/>`
const lab = (t, x, y) => `<text x="${x}" y="${y}" font-family="sans-serif" font-size="17" fill="#101820" text-anchor="middle">${t}</text>`
let pv = ''
;[['ona-head', 'ona-head'], ['ona-head-grin', '-grin'], ['ona-head-happy', '-happy'], ['ona-head-oh', '-oh']].forEach(([id, l], i) => { pv += U(id, 30 + i * 260, 20, 240, 252) + lab(l, 150 + i * 260, 290) })
pv += `<g>${U('ona-head-base', 1070, 20, 240, 252)}${U('ona-eyes-open', 1070, 20, 240, 252)}${U('ona-mouth-smile', 1070, 20, 240, 252)}${U('ona-cans-on', 1070, 20, 240, 252)}</g>` + lab('with ona-cans-on', 1190, 290)
pv += U('ona-cans-neck', 40, 330, 300, 159) + lab('ona-cans-neck', 190, 510)
pv += U('ona-hand-open', 400, 330, 96, 120) + U('ona-hand-hold', 540, 330, 96, 120) + lab('hands: open / hold (rotate / mirror as needed)', 520, 510)
pv += U('ona-boot', 850, 330, 225, 150) + `<g transform="translate(1140 330)">${U('ona-boot', 0, 0, 225, 150, 'transform="translate(225 0) scale(-1 1)"')}</g>` + lab('ona-boot, mirrored', 1100, 510)
pv += U('ona-sock-celery', 1320, 330, 64, 72) + U('ona-sock-salmon', 1400, 330, 64, 72)
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="560" viewBox="0 0 1500 560">
<title>Ona Ribas concept portfolio - kit/ona-parts.svg</title>
<!-- GENERATED by kit/gen-ona.mjs - edit the generator, not this file.
     ONA = curly black cloud bob, tan skin, freckles, rosy cheeks, ONE sun-yellow hoop earring, sun-yellow hair clip, sun-yellow headphones.
     Symbols have fixed colours. Reserved ids: ona-*.  Head box 400x420; wrist/ankle attach points are at the bottom/left of each symbol. -->
<defs id="kit-ona">
${defs}
</defs>
<rect width="1500" height="560" fill="#FDEFAF"/><rect x="1040" width="460" height="300" fill="#007E9B"/>
${pv}
</svg>
`
fs.writeFileSync(path.join(HERE, 'ona-parts.svg'), svg)
console.log('wrote kit/ona-parts.svg', svg.length, 'bytes')
