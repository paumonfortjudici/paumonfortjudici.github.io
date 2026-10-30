// Slide 2, About (butter): I'M ONA RIBAS over a sunburst, the bio, Ona clapping two coconuts, the five props that fake sounds, a teal floor with boot prints.
import { img, ink, paper, tape, dots, chrome, lines, trail, C } from './lib.mjs'

const lab = (txt, x, y, rot, bg = C.sun, id = '') =>
  `<div class="lab" style="left:${x}px;top:${y}px;transform:rotate(${rot}deg);background:${bg}" ${id ? `data-id="${id}"` : ''}>${txt}</div>`

export default function s2() {
  const prints = ['print-01', 'print-02', 'print-03', 'print-04', 'print-05', 'print-06', 'print-01', 'print-02', 'print-03', 'print-04', 'print-05', 'print-06'].map((n, i) => [n, 56 + i * 88, 1866 + (i % 2 ? -22 : 14), 90 + (i % 2 ? -4 : 5)])
  const body = [
    img('sun-big', { x: 900, y: 270, w: 1050, rot: -14, z: 1, cls: 'hard-s' }),
    dots({ l: 60, t: 560, w: 420, h: 200, c: C.salmon, r: 3.4, fade: '180deg', op: 0.8 }),
    img('title-ona', { x: 538, y: 410, w: 910, rot: -1.5, z: 3 }),
    ink('wave-2', { x: 560, y: 744, w: 92, rot: -6, c: C.tomato, z: 4 }),
    // Ona, built from the same parts as on every slide, clapping two coconut halves
    img('ona-clap', { x: 800, y: 1205, h: 880, rot: 1.2, z: 5, cls: 'hard', id: 'ona' }),
    img('burst-clop', { x: 905, y: 1090, w: 290, rot: 7, z: 7, cls: 'hard-s', id: 'clop' }),
    // the props, stepping down from the top right to the bottom left, each tagged with the noise it fakes
    img('candy', { x: 392, y: 1368, w: 268, rot: 9, z: 6, cls: 'die', id: 'p-candy' }),
    img('celery', { x: 222, y: 1478, w: 290, rot: -9, z: 6, cls: 'die', id: 'p-celery' }),
    img('cabbage', { x: 420, y: 1590, w: 240, rot: 6, z: 7, cls: 'die', id: 'p-cabbage' }),
    img('umbrella', { x: 208, y: 1654, w: 318, rot: -12, z: 7, cls: 'die', id: 'p-umbrella' }),
    tape({ x: 330, y: 1318, w: 120, rot: -28, c: 'rgba(242,162,154,.9)', z: 9 }),
    tape({ x: 292, y: 1452, w: 110, rot: 22, c: 'rgba(99,160,172,.85)', z: 9 }),
    lab('CELLOPHANE · FIRE', 470, 1300, 5, C.sun),
    lab('CELERY · BONES', 78, 1388, -6, C.sun),
    lab('CABBAGE · STABS', 440, 1500, 4, C.sun),
    lab('UMBRELLA · WINGS', 74, 1726, -5, C.sun),
    ink('arrow-curve', { x: 530, y: 1250, w: 120, rot: 8, c: C.deep, z: 5 }),
    img('sparkle-y1', { x: 560, y: 790, w: 60, rot: -10, z: 5 }),
    img('sparkle-y3', { x: 1010, y: 740, w: 56, rot: 10, z: 5 }),
    // the teal floor under the butter page, with the first prints of the trail
    paper({ l: -30, t: 1780, w: 1140, h: 260, c: C.teal, rot: -0.6, z: 6 }),
    trail(prints, C.butter, 7, 74),
  ].join('')

  const text = [
    chrome('ABOUT', '02 / 05', C.deep),
    `<text class="t-body-i" x="72" y="752" font-size="30" fill="${C.deep}">(Ona means wave, in Catalan.)</text>`,
    lines('t-sc', 28, C.deep, 72, 838, 36, ['FOLEY ARTIST &amp;', 'SOUND DESIGNER']),
    `<text class="t-label" xml:space="preserve" x="72" y="918" font-size="22" fill="${C.tomato}">GIRONA  ·  SINCE 2016</text>`,
    lines('t-body', 32, C.deep, 72, 986, 46, ['I make the sounds nobody', 'notices until they’re missing:', 'footsteps, rustling coats, a', 'door that finally closes. Ten', 'years in a studio full of', 'gravel, celery and old shoes,', 'and one very patient', 'neighbour.']),
  ].join('')

  return { field: C.butter, body, text }
}
