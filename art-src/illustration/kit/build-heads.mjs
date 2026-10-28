// build-heads.mjs - renders a sheet of every head building block of blocks.mjs, on busts, in sticker style (halo, wobble, grain).
//   node art-src/illustration/kit/build-heads.mjs            -> kit/doodle-heads.svg   (render it to PNG with tools/render-svg.mjs)
// It is also the usage example of blocks.mjs: face parts and hats are called exactly as in a sticker.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createSticker } from './sticker-lib.mjs'
import { headFrame, face, ear, features, hairBob, hairCurly, hairCap, ponytail, scrunchie, beanie, beret, fedora, bandana, headphones } from './blocks.mjs'
import { blob } from './pen.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || path.join(here, 'doodle-heads.svg')
const st = createSticker({ title: 'Doodle kit - head blocks', accent: '#C6B1FE', seed: 3, root: 'translate(0,0)', bg: true })
const { shape, use, S, group } = st
const SC = 0.7

function bust(i, cx, cy) {
  shape(`neck${i}`, S([[cx - 42, cy + 80, 'c'], [cx + 42, cy + 84, 'c'], [cx + 46, cy + 190], [cx - 46, cy + 186]], { closed: true }))
  use(`neck${i}`, 'fa')
  shape(`shoulders${i}`, S([[cx - 150, cy + 330, 'c'], [cx - 140, cy + 240], [cx - 80, cy + 190], [cx + 80, cy + 192], [cx + 140, cy + 240], [cx + 150, cy + 330, 'c']], { closed: true }))
  use(`shoulders${i}`)
}
const heads = [
  // [centre x, y, tilt, what]
  [210, 280, 9, (fr) => { hairBob(st, fr, { id: 'bob1' }); return () => { face(st, fr, { id: 'face1' }); ear(st, fr); features(st, fr, { mouthId: 'M1' }); beanie(st, fr, { id: 'beanie1' }) } }],
  [600, 280, -5, (fr) => () => { face(st, fr, { id: 'face2' }); ear(st, fr); features(st, fr, { eyes: 'happy', brows: 'flat', nose: 'small', mouth: 'smile', cheeks: true }); hairCurly(st, fr) }],
  [990, 280, 6, (fr) => () => { face(st, fr, { id: 'face3' }); ear(st, fr, { hoop: false }); features(st, fr, { eyes: 'sleepy', brows: 'flat', nose: 'L', mouth: 'smile' }); hairCap(st, fr, { bun: true }) }],
  [210, 800, 0, (fr) => () => { face(st, fr, { id: 'face4' }); features(st, fr, { eyes: 'dot', brows: 'up', nose: 'hook', mouth: 'smirk' }); fedora(st, fr) }],
  [700, 800, -10, (fr) => { ponytail(st, fr); return () => { face(st, fr, { id: 'face5' }); features(st, fr, { eyes: 'happy', brows: 'arch', nose: 'small', mouth: 'grin', cheeks: true, mouthId: 'M5' }); hairCap(st, fr, { id: 'cap5', part: 'left' }); scrunchie(st, fr); headphones(st, fr) } }],
  [1040, 800, 8, (fr) => () => { face(st, fr, { id: 'face6' }); ear(st, fr, { mirrorIt: true, hoop: false }); features(st, fr, { eyes: 'dot', brows: 'worry', nose: 'dot', mouth: 'o' }); beret(st, fr) }],
  [210, 1320, 4, (fr) => () => { face(st, fr, { id: 'face7' }); features(st, fr, { eyes: 'dot', brows: 'angry', nose: 'hook', mouth: 'tongue' }); bandana(st, fr) }],
  [600, 1320, 0, (fr) => () => { face(st, fr, { id: 'face8' }); ear(st, fr); features(st, fr, { eyes: 'happy', brows: 'arch', nose: 'hook', mouth: 'grin', mouthId: 'M8' }); headphones(st, fr, { id: 'phones8' }) }],
  [990, 1320, -4, (fr) => () => { face(st, fr, { id: 'face9' }); ear(st, fr); features(st, fr, { eyes: 'dot', brows: 'arch', nose: 'hook', mouth: 'smile' }) }],
]
heads.forEach(([cx, cy, tilt, make], i) => {
  const fr = headFrame({ center: [cx, cy], tilt, scale: SC })
  group(`head${i + 1}`, () => {
    const front = make(fr)          // BACK layers are drawn inside make(); it returns the function that draws the FRONT layers
    bust(i + 1, cx, cy)
    front()
  })
})
st.write(OUT)
