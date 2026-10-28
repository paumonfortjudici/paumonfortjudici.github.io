// Prints <use> lines for a FOOTPRINT TRAIL along a straight segment (the toes point from the first point towards the second).
//   node kit/trail.mjs X0 Y0 X1 Y1 N [--w 46] [--h 120] [--fill "#1B6885"] [--op 0.9] [--gap 16] [--start r|l]
// Prints are evenly spaced, alternate right/left foot, are offset sideways by +-gap and tilted +-5 deg like a real gait.
// Minimum size 44 x 115 (the zig-zag tread turns into noise below that). Paste the output inside <g id="art"> and wrap it in nothing (no filter).
// For a curved trail run the script once per segment.
const a = process.argv.slice(2)
const num = a.slice(0, 5).map(Number)
if (num.length < 5 || num.some(Number.isNaN)) { console.error('usage: node kit/trail.mjs X0 Y0 X1 Y1 N [--w 46] [--h 120] [--fill "#1B6885"] [--op 0.9] [--gap 16] [--start r|l]'); process.exit(2) }
const opt = (k, d) => (a.includes('--' + k) ? a[a.indexOf('--' + k) + 1] : d)
const [x0, y0, x1, y1, n] = num
const w = Number(opt('w', 46)), h = Number(opt('h', 120)), gap = Number(opt('gap', 16)), op = opt('op', '1'), fill = opt('fill', '#1B6885'), start = opt('start', 'r')
const dx = x1 - x0, dy = y1 - y0
const phi = (Math.atan2(dx, -dy) * 180) / Math.PI // 0 = toes up, 90 = toes right
const px = Math.cos((phi * Math.PI) / 180), py = Math.sin((phi * Math.PI) / 180)
for (let i = 0; i < n; i++) {
  const t = (i + 0.5) / n, cx = x0 + dx * t, cy = y0 + dy * t
  const right = (i % 2 === 0) === (start === 'r')
  const off = right ? gap : -gap
  const X = cx + px * off, Y = cy + py * off
  console.log(`<use href="#fp-boot-${right ? 'r' : 'l'}" x="${(X - w / 2).toFixed(1)}" y="${(Y - h / 2).toFixed(1)}" width="${w}" height="${h}" fill="${fill}" opacity="${op}" transform="rotate(${(phi + (right ? -5 : 5)).toFixed(1)} ${X.toFixed(1)} ${Y.toFixed(1)})"/>`)
}
