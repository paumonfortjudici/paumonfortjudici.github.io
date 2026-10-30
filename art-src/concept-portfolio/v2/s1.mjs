// Slide 1, the cover (teal): FOLEY PORTFOLIO, the giant furry microphone, a sunburst as a spotlight, SNAP! and CRUNCH!, the 2026 seal, the first footprints.
import { img, ink, dots, chrome, lines, trail, C } from './lib.mjs'

/** bars of a waveform, seeded so every render is the same */
const wave = (x0, x1, y, hmax, n, seed) => {
  let s = seed
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  const step = (x1 - x0) / n
  let out = ''
  for (let i = 0; i < n; i++) {
    const env = Math.sin((i / n) * Math.PI) * 0.75 + 0.25
    const h = Math.max(10, hmax * env * (0.25 + rnd() * 0.75))
    out += `<rect x="${(x0 + i * step).toFixed(1)}" y="${(y - h / 2).toFixed(1)}" width="${(step * 0.52).toFixed(1)}" height="${h.toFixed(1)}" rx="${(step * 0.26).toFixed(1)}"/>`
  }
  return out
}

export default function s1() {
  // boot prints walking along the bottom edge and off the page: toes to the right, one foot then the other
  const prints = ['print-01', 'print-02', 'print-03', 'print-04', 'print-05', 'print-06', 'print-01', 'print-02', 'print-03', 'print-04', 'print-05', 'print-06'].map((n, i) => [n, 56 + i * 88, 1880 + (i % 2 ? -22 : 14), 90 + (i % 2 ? -4 : 5)])
  const body = [
    // the room tone behind the mic: a deep-teal waveform
    `<svg style="position:absolute;left:0;top:0;z-index:0" width="1080" height="1920" fill="${C.deep}">${wave(-10, 1090, 1180, 330, 62, 11)}</svg>`,
    dots({ l: 590, t: 150, w: 480, h: 520, c: C.steel, r: 3.4, fade: '200deg', op: 0.7 }),
    // the spotlight: a yellow sunburst whose heart sits under the pole, so the rays fan round the fur
    img('sun-big', { x: 800, y: 1290, w: 1150, rot: 14, z: 1, cls: 'hard-s' }),
    img('title-cover', { x: 541, y: 420, w: 944, rot: -1.2, z: 3 }),
    img('mic', { x: 520, y: 1215, w: 900, rot: -3, z: 4, cls: 'die', id: 'mic' }),
    img('burst-snap', { x: 912, y: 770, w: 262, rot: 9, z: 6, cls: 'hard-s', id: 'snap' }),
    img('burst-crunch', { x: 232, y: 1535, w: 420, rot: -7, z: 6, cls: 'hard-s', id: 'crunch' }),
    ink('mark-06', { x: 1010, y: 692, w: 70, rot: 8, c: C.butter, z: 5 }),
    img('sparkle-y1', { x: 78, y: 760, w: 70, rot: -8, z: 5 }),
    img('sparkle-y3', { x: 1000, y: 1010, w: 64, rot: 12, z: 5 }),
    img('sparkle-y2', { x: 46, y: 1000, w: 44, rot: 6, z: 5 }),
    trail(prints, C.butter, 2, 76),
  ].join('')

  const text = [
    chrome('FOLEY &amp; SOUND DESIGN', 'ONA RIBAS', C.butter),
    lines('t-body', 38, C.butter, 72, 1700, 54, ['The small noises that make a', 'film feel real.']),
    `<text class="t-sc" x="72" y="1800" font-size="24" fill="${C.butter}">PORTFOLIO 2026  ·  GIRONA</text>`,
    `<g transform="rotate(-8 930 1790)">
      <circle cx="930" cy="1790" r="84" fill="${C.tomato}" stroke="${C.ink}" stroke-width="5"/>
      <circle cx="930" cy="1790" r="68" fill="none" stroke="${C.butter}" stroke-width="2" stroke-dasharray="3 7" stroke-linecap="round"/>
      <path id="seal-arc" d="M 930 1790 m -57 0 a 57 57 0 1 1 114 0 a 57 57 0 1 1 -114 0" fill="none"/>
      <text class="t-label" font-size="15" fill="${C.butter}" xml:space="preserve"><textPath href="#seal-arc" textLength="352" lengthAdjust="spacing">FOOTSTEPS · CLOTH · PROPS · </textPath></text>
      <g class="t-display" font-size="34" text-anchor="middle"><text x="932" y="1802" fill="${C.ink}">2026</text><text x="929" y="1799" fill="${C.butter}">2026</text></g>
    </g>`,
  ].join('')

  return { field: C.teal, body, text }
}
