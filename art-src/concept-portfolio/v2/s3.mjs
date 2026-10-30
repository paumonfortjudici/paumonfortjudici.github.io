// Slide 3, Selected projects (deep teal): SELECTED PROJECTS, three projects with their comic panel, a trail of steel footprints from one to the next.
import { img, ink, tape, dots, chrome, lines, trail, C } from './lib.mjs'

const block = (y, x, year, titles, label, body) => {
  const ts = titles.map((t, i) => `<text class="t-smcp" x="${x}" y="${y + 66 + i * 54}" font-size="50" fill="${C.butter}">${t}</text>`).join('')
  const yl = y + 66 + (titles.length - 1) * 54 + 46
  return [
    `<text x="${x}" y="${y}" class="t-display" font-size="84" fill="${C.sun}">${year}</text>`,
    ts,
    `<text class="t-label" x="${x}" y="${yl}" font-size="23" fill="${C.celery}" xml:space="preserve">${label}</text>`,
    lines('t-body', 31, C.butter, x, yl + 54, 44, body),
  ].join('')
}

export default function s3() {
  const steps = [['print-01', 478, 1010, 160], ['print-02', 540, 1090, 196], ['print-03', 566, 1190, 178], ['print-04', 560, 1290, 184], ['print-05', 520, 1380, 205]]
  const body = [
    dots({ l: 640, t: 100, w: 440, h: 330, c: C.steel, r: 3.4, fade: '200deg', op: 0.55 }),
    img('title-projects', { x: 540, y: 392, w: 870, rot: -1, z: 3 }),
    // the three comic panels: print-and-cut, each on its own colour so the silhouettes never blur together
    img('panel-salt', { x: 272, y: 808, w: 410, rot: -2.4, z: 4, cls: 'die', id: 'pn-salt' }),
    img('panel-kettle', { x: 810, y: 1196, w: 384, rot: 2.2, z: 4, cls: 'die', id: 'pn-kettle', style: 'border-radius:46% 54% 50% 50% / 52% 46% 54% 48%' }),
    img('panel-moon', { x: 272, y: 1604, w: 410, rot: -1.6, z: 4, cls: 'die', id: 'pn-moon' }),
    tape({ x: 150, y: 660, w: 130, rot: -24, c: 'rgba(242,162,154,.9)' }),
    tape({ x: 892, y: 1058, w: 120, rot: 28, c: 'rgba(253,239,175,.88)' }),
    tape({ x: 395, y: 1448, w: 120, rot: 22, c: 'rgba(99,160,172,.88)' }),
    img('burst-crunch', { x: 116, y: 652, w: 190, rot: -11, z: 7, cls: 'hard-s', id: 'crunch' }),
    img('burst-wheee', { x: 968, y: 1398, w: 250, rot: 7, z: 7, cls: 'hard-s', id: 'wheee' }),
    img('burst-creak', { x: 118, y: 1452, w: 200, rot: -8, z: 7, cls: 'hard-s', id: 'creak' }),
    trail(steps, C.steel, 2, 62),
    img('sparkle-y1', { x: 60, y: 560, w: 50, rot: -8, z: 5 }),
    img('sparkle-y3', { x: 1010, y: 700, w: 56, rot: 10, z: 5 }),
    img('sparkle-y2', { x: 1030, y: 1560, w: 46, rot: 5, z: 5 }),
  ].join('')

  const text = [
    chrome('WORK', '03 / 05', C.butter),
    block(690, 508, '2025', ['Salt Season'], 'FEATURE  ·  FOOTSTEPS, CLOTH', ['Two hundred kilometres of desert', 'footsteps, recorded in a kitchen', 'with six kilos of salt.']),
    block(1080, 72, '2024', ['Kettle &amp; Crow'], 'SHORT FILM  ·  PROPS, WINGS', ['A kettle that screams, a crow that', 'never lands, and one umbrella', 'playing the wings.']),
    block(1470, 508, '2023', ['The Understudy', 'Moon'], 'SERIES  ·  PAPER, CREAKS', ['Eight episodes of paper wings,', 'cardboard footsteps and a moon', 'that creaks when it smiles.']),
    `<text x="72" y="1850" class="t-body-i" font-size="28" fill="${C.butter}" opacity=".85">Full credits and reels on request.</text>`,
  ].join('')

  return { field: C.deep, body, text }
}
