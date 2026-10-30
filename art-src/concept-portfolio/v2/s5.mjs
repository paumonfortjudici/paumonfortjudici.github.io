// Slide 5, Contact (teal): THANKS FOR LISTENING, Ona walking off at sunrise waving back, the boot-print trail, the contact card and the availability tag.
import { img, ink, paper, tape, dots, chrome, trail, C } from './lib.mjs'

const row = (y, k, v) => `<text x="116" y="${y}" class="t-label" font-size="24" fill="${C.celery}">${k}</text><text x="300" y="${y + 2}" class="t-body" font-size="40" fill="${C.butter}" style="font-weight:700">${v}</text>`

export default function s5() {
  const prints = ['print-01', 'print-02', 'print-03', 'print-04', 'print-05', 'print-06', 'print-01', 'print-02', 'print-03', 'print-04', 'print-05', 'print-06'].map((n, i) => [n, 62 + i * 86, 1262 + (i % 2 ? -20 : 12), 90 + (i % 2 ? -4 : 5)])
  const body = [
    dots({ l: 60, t: 700, w: 420, h: 440, c: C.steel, r: 3.4, fade: '20deg', op: 0.6 }),
    img('title-thanks', { x: 540, y: 395, w: 900, rot: -1.2, z: 3 }),
    // the burst, cut in half by the ground line, becomes the sunrise behind her
    img('sun-half', { x: 760, y: 1210, w: 880, rot: 0, z: 1, cls: 'hard-s' }),
    img('ona-away', { x: 770, y: 1030, h: 700, rot: 0, z: 5, cls: 'hard', id: 'ona' }),
    img('burst-bye', { x: 300, y: 905, w: 270, rot: -9, z: 7, cls: 'hard-s', id: 'bye' }),
    img('sparkle-y1', { x: 90, y: 700, w: 60, rot: -8, z: 4 }),
    img('sparkle-y3', { x: 1005, y: 760, w: 52, rot: 12, z: 4 }),
    ink('wave-1', { x: 130, y: 1100, w: 130, rot: -8, c: C.butter, z: 3 }),
    trail(prints, C.butter, 2, 74),
    // the card: deep teal, celery labels, butter values
    paper({ l: 72, t: 1370, w: 936, h: 360, c: C.deep, rot: -0.4, z: 4 }),
    tape({ x: 190, y: 1366, w: 130, rot: -6, c: 'rgba(253,239,175,.88)', z: 8 }),
    tape({ x: 900, y: 1372, w: 120, rot: 7, c: 'rgba(242,162,154,.9)', z: 8 }),
    // the availability tag, arrow-shaped, butter on teal
    paper({ l: 84, t: 1768, w: 520, h: 66, c: C.butter, rot: -2, z: 5, style: 'clip-path:polygon(0 50%,7% 0,100% 0,100% 100%,7% 100%)' }),
  ].join('')

  const text = [
    chrome('CONTACT', '05 / 05', C.butter),
    `<text x="72" y="728" class="t-body" font-size="40" fill="${C.butter}">Let’s make some noise together.</text>`,
    row(1450, 'EMAIL', 'hello@onaribas.example'),
    row(1534, 'WEB', 'onaribas.example'),
    row(1618, 'PHONE', '+00 000 000 000'),
    row(1702, 'BASE', 'Girona, Catalonia'),
    `<text x="140" y="1810" class="t-label" font-size="24" fill="${C.ink}" transform="rotate(-2 290 1790)">AVAILABLE FROM JANUARY 2027</text>`,
    `<circle cx="116" cy="1802" r="7" fill="${C.tomato}"/>`,
    `<text x="716" y="1792" class="t-body" font-size="29" fill="${C.butter}" style="font-weight:700">Features, series,</text><text x="716" y="1828" class="t-body" font-size="29" fill="${C.butter}" style="font-weight:700">shorts and games.</text>`,
  ].join('')

  return { field: C.teal, body, text }
}
