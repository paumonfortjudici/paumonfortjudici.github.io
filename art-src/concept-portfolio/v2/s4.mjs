// Slide 4, Experience and education (butter): the two-line title, a pinned wall of souvenirs with Ona at the mixing desk, and the career as a trail of boot prints.
import { img, ink, paper, tape, dots, chrome, trail, C } from './lib.mjs'

const entry = (y, years, role, place, line) => [
  `<text x="190" y="${y}" class="t-display" font-size="52" fill="${C.tomato}" style="font-stretch:130%">${years}</text>`,
  `<text x="640" y="${y - 6}" class="t-sc" font-size="26" fill="${C.deep}">${role}</text>`,
  `<text x="190" y="${y + 44}" class="t-body" font-size="31" fill="${C.deep}" style="font-weight:700">${place}</text>`,
  `<text x="190" y="${y + 86}" class="t-body" font-size="29" fill="${C.deep}">${line}</text>`,
].join('')

export default function s4() {
  const ys = [1216, 1360, 1504, 1648]
  const marks = ys
    .map((y, i) => `${paper({ l: 80, t: y - 54, w: 82, h: 82, c: C.sun, z: 3, style: 'border-radius:50%' })}${ink('print-0' + (i + 1), { x: 121, y: y - 14, w: 44, rot: 0, c: C.ink, z: 5 })}`)
    .join('')
  const between = [[1262, 'print-05'], [1412, 'print-06'], [1562, 'print-04']].map(([y, n], i) => ink(n, { x: 121, y, w: 38, rot: i % 2 ? 4 : -4, c: C.deep, z: 3 })).join('')
  const body = [
    img('title-exp', { x: 462, y: 342, w: 750, rot: -1, z: 3 }),
    img('sparkle-y1', { x: 930, y: 180, w: 66, rot: 10, z: 4 }),
    img('sparkle-y3', { x: 1000, y: 440, w: 50, rot: -6, z: 4 }),
    // the wall: a deep-teal slab with a torn edge, the burst behind Ona's head like a studio lamp
    paper({ l: 54, t: 600, w: 972, h: 514, c: C.deep, rot: -0.5, z: 1 }),
    dots({ l: 70, t: 614, w: 940, h: 486, c: C.steel, r: 3, fade: '100deg', op: 0.45, z: 2 }),
    img('sun-big', { x: 770, y: 780, w: 600, rot: 12, z: 3, cls: 'hard-s' }),
    // pinned memories
    img('paper-call', { x: 168, y: 738, w: 200, rot: -6, z: 4, cls: 'die', id: 'call' }),
    img('paper-wave', { x: 392, y: 690, w: 262, rot: 3, z: 4, cls: 'die', id: 'wave' }),
    img('paper-film', { x: 345, y: 846, w: 116, rot: 78, z: 5, cls: 'die', id: 'film' }),
    img('paper-ticket-red', { x: 478, y: 806, w: 156, rot: 10, z: 5, cls: 'die', id: 'ticket' }),
    img('wall-cassette', { x: 176, y: 968, w: 214, rot: -9, z: 5, cls: 'die', id: 'cassette' }),
    img('wall-polaroid-boots', { x: 372, y: 990, w: 134, rot: 6, z: 5, cls: 'die' }),
    img('paper-ticket-yellow', { x: 100, y: 862, w: 126, rot: -14, z: 6, cls: 'die', id: 'take12' }),
    tape({ x: 168, y: 640, w: 100, rot: -8, c: 'rgba(242,162,154,.9)' }),
    tape({ x: 392, y: 604, w: 100, rot: 6, c: 'rgba(253,239,175,.88)' }),
    ink('ring-a', { x: 168, y: 758, w: 112, rot: -6, c: C.tomato, z: 8 }),
    // Ona at the mixing desk, headphones ON, same face and costume as everywhere
    img('console', { x: 836, y: 996, w: 440, rot: -1, z: 5, cls: 'die', id: 'console' }),
    img('ona-desk', { x: 646, y: 850, h: 540, rot: 0, z: 6, cls: 'hard', id: 'ona' }),
    img('speaker', { x: 972, y: 706, w: 180, rot: 5, z: 7, cls: 'die', id: 'speaker' }),
    img('burst-thump', { x: 100, y: 1114, w: 190, rot: -7, z: 8, cls: 'hard-s', id: 'thump' }),
    marks,
    between,
  ].join('')

  const text = [
    chrome('BACKGROUND', '04 / 05', C.deep),
    entry(ys[0], '2023 – NOW', 'FOLEY ARTIST', 'Casa Grava Studio, Girona', 'Features, series and shorts. Sixteen titles so far.'),
    entry(ys[1], '2019 – 2023', 'FOLEY EDITOR', 'Estudi Rumor, Barcelona', 'Cut foley for 22 films and too many cereal ads.'),
    entry(ys[2], '2016 – 2019', 'FOLEY WALKER', 'Moth &amp; Marrow Post, Lisbon', 'Learned to walk like other people for a living.'),
    entry(ys[3], '2012 – 2016', 'BA IN FILM &amp; SOUND', 'Aurell School of Film and Sound, Girona', 'Plus a masterclass and one very large gravel pit.'),
    `<text class="t-label" x="72" y="1836" font-size="22" fill="${C.deep}" xml:space="preserve">LANGUAGES  ·  CATALÀ  ·  CASTELLANO  ·  ENGLISH</text>`,
    `<g transform="translate(168 768) rotate(-5)"><text x="0" y="0" class="t-label" font-size="24" fill="${C.ink}" text-anchor="middle">SC 24</text></g>`,
    `<g transform="translate(478 812) rotate(10)"><text class="t-label" font-size="17" fill="${C.ink}" text-anchor="middle" x="0" y="0">ADMIT ONE</text></g>`,
    `<g transform="translate(100 868) rotate(-14)"><text class="t-label" font-size="16" fill="${C.ink}" text-anchor="middle" x="0" y="0">TAKE 12</text></g>`,
  ].join('')

  return { field: C.butter, body, text }
}
