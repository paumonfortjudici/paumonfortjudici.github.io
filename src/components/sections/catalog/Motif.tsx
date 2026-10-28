// The folder stock. Every closed band carries a drawing of ITS world, printed tone-on-tone in the band's ink (docs: the sheet is a stack of
// ten different folders, so each one gets its own paper): Contract a spread with picture frames, crop marks and a colour strip; Plana the
// sunrise-in-a-browser symbol with its ripples; 44 Lab a tufted rug with fringe, devil horns and tail; Spelled Guilty a word search with the
// title word circled; Space Monkey stars, an orbit and the Earth's edge; Procreate a head under construction, hatching and a palette;
// Somia a shop awning with a hang tag; Gotet the vermuteria pattern (olives, lemon, ice, sparkles); the portfolio a fanned deck of slides;
// the Sticker Sheet die-cut stickers with their paper keyline.
//
// All of it is decorative (aria-hidden) and drawn on a 480 x 120 board in monoline strokes (round caps and joins), most of it in two
// strengths: `.m-a` (quiet) and `.m-b` (the line that carries the idea). The colours come from CSS (--mo-a, --mo-b on the band), the
// drawing only says `currentColor`. The board is anchored to the right (towards the meta column) and the CSS fades its left edge, so a
// long title that reaches into the board never fights with it. Seeded: the same slug draws the same hand every time.
import { useLayoutEffect, type ReactNode, type RefObject } from 'react'

const W = 480
const H = 120
/** the part of the board that is drawn on (the left 140 units are always empty: the board is anchored to the right) */
const X0 = 140

const f = (n: number): string => (Math.round(n * 10) / 10).toString()

/** mulberry32: a small seeded generator, so the stars and the hatching are the same on every render */
function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** a row of dots: one path of zero-length segments (round caps make them dots) */
const dots = (points: [number, number][]): string => points.map(([x, y]) => `M${f(x)} ${f(y)}h0.01`).join('')

// ---------------------------------------------------------------- Proyecto Contract: a spread on the light table ----------
function Contract() {
  const left = 'M170 18h64v84h-64Z'
  const right = 'M238 18h64v84h-64Z'
  const r = rng(11)
  // two columns of body text on the right page: lines of the same length, the last of each column short
  let body = ''
  for (let col = 0; col < 2; col++) {
    const x0 = 244 + col * 30
    for (let i = 0; i < 10; i++) {
      const y = 50 + i * 5
      const len = i === 9 ? 10 + r() * 6 : 22 + r() * 2
      body += `M${x0} ${y}h${f(len)}`
    }
  }
  const tint = [1, 0.75, 0.52, 0.32, 0.16]
  return (
    <>
      <g className="m-a">
        <path d={left + right} />
        <path d="M176 64h38M176 70h50M176 76h32M176 82h46M176 94h10" />
        <path d="M244 36h52M244 41h34" />
        <path d={body} strokeWidth="2" />
      </g>
      <g className="m-b">
        {/* the picture frame with its cross, the way a layout program draws an empty image box */}
        <path d="M176 24h52v32h-52ZM176 24l52 32M228 24l-52 32" />
        <path d="M244 28h46" strokeWidth="4.4" />
        {/* crop marks at the four corners and the gutter, registration target, colour control strip */}
        <path d="M170 12V3M164 18h-9M302 12V3M308 18h9M170 108v9M164 102h-9M302 108v9M308 102h9M236 12V3M236 108v9" />
        <circle cx="368" cy="60" r="10" />
        <circle cx="368" cy="60" r="3.2" />
        <path d="M352 60h32M368 44v32" />
      </g>
      <g className="m-b" stroke="none" fill="currentColor">
        {tint.map((o, i) => (
          <rect key={i} x={398 + i * 12} y={52} width={10} height={16} opacity={o} />
        ))}
      </g>
    </>
  )
}

// ---------------------------------------------------------------- Plana Digital: the sun over the horizon in a window ------
function Plana() {
  const cx = 380
  const hy = 92
  let rays = ''
  for (let i = 0; i < 9; i++) {
    const a = Math.PI + (Math.PI * (i + 0.5)) / 9
    rays += `M${f(cx + Math.cos(a) * 36)} ${f(hy + Math.sin(a) * 36)}L${f(cx + Math.cos(a) * (i % 2 ? 43 : 47))} ${f(hy + Math.sin(a) * (i % 2 ? 43 : 47))}`
  }
  const ripples = [70, 96, 124, 154, 186, 220].map((rad) => `M${f(cx - rad)} ${hy}A${rad} ${rad} 0 0 1 ${f(cx + rad)} ${hy}`).join('')
  return (
    <>
      <defs>
        {/* the ripples stay outside the window */}
        <clipPath id="pm-cat-m-plana" clipRule="evenodd">
          <path clipRule="evenodd" d={`M0 0H${W}V${H}H0Z M322 22H438V100H322Z`} />
        </clipPath>
      </defs>
      <g className="m-a" clipPath="url(#pm-cat-m-plana)">
        <path d={ripples} strokeDasharray="1 7.5" strokeWidth="2.8" />
        <path d={`M150 ${hy}H322M438 ${hy}H${W}`} />
      </g>
      <g className="m-b">
        <rect x="322" y="22" width="116" height="78" rx="9" />
        <path d="M322 39H438" />
        <path d={dots([[334, 30.5], [344, 30.5], [354, 30.5]])} strokeWidth="5" />
        <path d={`M338 ${hy}H422`} />
        <path d={`M${cx - 28} ${hy}A28 28 0 0 1 ${cx + 28} ${hy}`} />
        <path d={rays} />
      </g>
      <g className="m-a">
        <path d={`M${cx - 28} ${hy}A28 28 0 0 1 ${cx + 28} ${hy}Z`} fill="currentColor" stroke="none" />
        <path d="M334 96h8M350 96h14M372 96h6M386 96h18" strokeWidth="2" />
      </g>
    </>
  )
}

// ---------------------------------------------------------------- 44 Lab: a tufted rug with fringe, horns and a tail ------
function FortyFour() {
  let fringe = ''
  const r = rng(44)
  for (let i = 0; i < 12; i++) {
    const y = 24 + i * 6.4
    const bend = (r() - 0.5) * 5
    fringe += `M230 ${f(y)}q-8 ${f(bend)} -${f(14 + r() * 3)} ${f(bend * 1.4)}M410 ${f(y)}q8 ${f(bend)} ${f(14 + r() * 3)} ${f(bend * 1.4)}`
  }
  const tufts: [number, number][] = []
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 3; col++) {
      tufts.push([244 + col * 10, 38 + row * 8.5])
      tufts.push([376 + col * 10, 38 + row * 8.5])
    }
  }
  return (
    <>
      <g className="m-a">
        <path d={fringe} />
        <rect x="238" y="26" width="164" height="68" rx="2" />
        <path d="M320 36L350 60L320 84L290 60Z" />
        <path d={dots(tufts)} strokeWidth="3" />
      </g>
      <g className="m-b">
        <rect x="230" y="18" width="180" height="84" rx="3" />
        <path d="M320 30L356 60L320 90L284 60Z" />
        <circle cx="320" cy="60" r="5" fill="currentColor" />
        {/* two horns on the top edge, a tail from the bottom corner */}
        <path d="M296 18C291 13 289 7 292 2C298 5 303 11 304 18" />
        <path d="M344 18C349 13 351 7 348 2C342 5 337 11 336 18" />
        <path d="M410 96C436 104 454 92 446 80C440 72 450 66 458 70L452 62M458 70L451 76" />
      </g>
      <g className="m-b" stroke="none" fill="currentColor">
        {[[248, 36], [392, 36], [248, 84], [392, 84]].map(([x, y]) => (
          <path key={`${x}-${y}`} d={`M${x} ${y - 5}L${x + 5} ${y}L${x} ${y + 5}L${x - 5} ${y}Z`} />
        ))}
      </g>
    </>
  )
}

// ---------------------------------------------------------------- Spelled Guilty: a word search, the title circled ------
const GRID = ['SPELLEDKW', 'OTBAHNVRM', 'QGUILTYJX', 'ZDCFMAOPE']
/**
 * The letters of the word search are strokes, not text: the motif sits inside the band's heading, and a <text> node would leak the letter
 * grid into the heading's name, its outline and copy / paste. A 12 x 14 monoline alphabet (round caps, same weight as the rest).
 */
const GLYPH: Readonly<Record<string, string>> = {
  A: 'M1 14L6 1L11 14M3 9.5H9',
  B: 'M2 1V14M2 1H7C11 1 11 7 7 7H2M7 7C12 7 12 14 7 14H2',
  C: 'M11 3C8 -1 1 0 1 7.5C1 14 8 15 11 12',
  D: 'M2 1V14M2 1H5C13 1 13 14 5 14H2',
  E: 'M11 1H2V14H11M2 7.5H9',
  F: 'M11 1H2V14M2 7.5H9',
  G: 'M11 3C8 -1 1 0 1 7.5C1 14 8 15 11 11V8H7',
  H: 'M2 1V14M10 1V14M2 7.5H10',
  I: 'M3 1H9M6 1V14M3 14H9',
  J: 'M10 1V10C10 15 2 15 1 11',
  K: 'M2 1V14M11 1L2 8.5M5 6L11 14',
  L: 'M2 1V14H11',
  M: 'M1 14V1L6 9L11 1V14',
  N: 'M2 14V1L10 14V1',
  O: 'M6 1C-1 1 -1 14 6 14C13 14 13 1 6 1Z',
  P: 'M2 14V1H7C12 1 12 8 7 8H2',
  Q: 'M6 1C-1 1 -1 14 6 14C13 14 13 1 6 1ZM7 10L12 15',
  R: 'M2 14V1H7C12 1 12 8 7 8H2M7 8L11 14',
  S: 'M10.5 3C8 -0.5 1.5 1 2 4.5C2.5 8 10.5 7 10.5 10.5C10.5 14.5 3 15 1 11',
  T: 'M1 1H11M6 1V14',
  U: 'M2 1V9C2 15 10 15 10 9V1',
  V: 'M1 1L6 14L11 1',
  W: 'M0.5 1L3.5 14L6 5L8.5 14L11.5 1',
  X: 'M1 1L11 14M11 1L1 14',
  Y: 'M1 1L6 8L11 1M6 8V14',
  Z: 'M1 1H11L1 14H11',
}
function Guilty() {
  const x = (c: number): number => 201 + c * 30
  return (
    <>
      <g className="m-a" strokeWidth="2.2">
        {GRID.map((row, r) =>
          [...row].map((ch, c) => <path key={`${r}-${c}`} d={GLYPH[ch]} transform={`translate(${f(x(c) - 6)} ${f(18 + r * 24)})`} />),
        )}
      </g>
      <g className="m-b">
        {/* a pen ring round GUILTY, drawn twice like a real one */}
        <path d="M222 63C290 56 352 58 392 62C412 64 413 86 392 89C332 93 270 92 224 90C204 88 203 66 222 63Z" />
        <path d="M226 61C300 55 356 60 394 64C410 70 408 88 388 91" strokeWidth="1.8" />
      </g>
    </>
  )
}

// ---------------------------------------------------------------- Space Monkey: stars, an orbit, the edge of the Earth ---
function SpaceMonkey() {
  const r = rng(5)
  const stars: [number, number, number][] = []
  for (let i = 0; i < 40; i++) stars.push([150 + r() * 330, 5 + r() * 108, [1.2, 1.6, 2.1, 2.7][Math.floor(r() * 4)]])
  const sparkle = (x: number, y: number, s: number): string =>
    `M${f(x)} ${f(y - s)}Q${f(x + s * 0.14)} ${f(y - s * 0.14)} ${f(x + s)} ${f(y)}Q${f(x + s * 0.14)} ${f(y + s * 0.14)} ${f(x)} ${f(y + s)}Q${f(x - s * 0.14)} ${f(y + s * 0.14)} ${f(x - s)} ${f(y)}Q${f(x - s * 0.14)} ${f(y - s * 0.14)} ${f(x)} ${f(y - s)}Z`
  return (
    <>
      <g className="m-a" stroke="none" fill="currentColor">
        {stars.map(([x, y, rad], i) => (
          <circle key={i} cx={f(x)} cy={f(y)} r={rad} />
        ))}
      </g>
      <g className="m-b" stroke="none" fill="currentColor">
        <path d={sparkle(206, 30, 8) + sparkle(292, 92, 6) + sparkle(452, 40, 9) + sparkle(168, 84, 5)} />
      </g>
      <g className="m-a">
        <path d="M168 104Q300 -12 472 62" strokeDasharray="1 8" strokeWidth="2.8" />
        <path d="M333 120A126 126 0 0 1 480 84" />
        <circle cx="244" cy="34" r="9" />
        <ellipse cx="244" cy="34" rx="18" ry="5" transform="rotate(-22 244 34)" />
      </g>
      <g className="m-b">
        <path d="M343 120A118 118 0 0 1 480 93" />
        {/* a satellite on the orbit */}
        <g transform="translate(309.5 35) rotate(-7.5)">
          <rect x="-5" y="-3.5" width="10" height="7" rx="1" />
          <path d="M-7 -5h-10v10h10ZM7 -5h10v10h-10Z" />
          <path d="M-17 0h-4M17 0h4M0 -3.5v-6" />
        </g>
      </g>
    </>
  )
}

// ---------------------------------------------------------------- Procreate: a head under construction ------------------
function Procreate() {
  let hatch = ''
  const r = rng(6)
  for (let i = 0; i < 9; i++) {
    const x = 196 + i * 8
    hatch += `M${f(x)} ${f(78 - r() * 3)}L${f(x + 22 + r() * 6)} ${f(36 + r() * 3)}`
  }
  return (
    <>
      <g className="m-a" strokeWidth="2">
        <path d="M390 22C412 21 428 38 427 58C426 80 408 95 388 94C367 93 353 76 354 57C355 37 371 23 390 22Z" />
        <path d="M393 24C414 26 426 42 424 61C421 82 404 93 386 91C364 88 355 72 356 54C357 38 372 21 393 24" />
        <path d="M391 20C397 48 397 70 388 96" strokeDasharray="1 6" strokeWidth="2.6" />
        <path d="M352 55C372 50 408 50 428 55" strokeDasharray="1 6" strokeWidth="2.6" />
        <path d="M354 55c-8 -2 -9 14 0 15M427 55c8 -2 9 14 0 15" />
        <path d={hatch} />
      </g>
      <g className="m-b">
        <path d="M366 84C378 103 402 103 414 84" />
        <path d="M371 59q6 -4 12 0q-6 4.5 -12 0ZM397 59q6 -4 12 0q-6 4.5 -12 0Z" strokeWidth="2" />
        <path d="M369 51q7 -4 14 -1M397 50q7 -3 14 1" />
        <path d="M392 62q-4 9 -1 13q3 2 7 0" />
        <path d="M382 85q9 2 18 -1" />
        {/* a pencil, lying across the corner */}
        <path d="M436 104L470 70L476 76L442 110ZM436 104L433 113L442 110M470 70L474 66L480 72L476 76" />
      </g>
      <g className="m-b" stroke="none" fill="currentColor">
        {[0.9, 0.62, 0.4, 0.26, 0.14].map((o, i) => (
          <circle key={i} cx={288 + i * 17} cy={102} r={6.5} opacity={o} />
        ))}
      </g>
      <g className="m-b">
        <circle cx={288} cy={102} r={10} />
      </g>
    </>
  )
}

// ---------------------------------------------------------------- Somia: a shop awning with a hang tag ------------------
function Somia() {
  const n = 9
  const sw = 36
  const x0 = 150
  const stripes: ReactNode[] = []
  for (let i = 0; i < n; i++) {
    const x = x0 + i * sw
    stripes.push(<path key={i} d={`M${x} 16h${sw}V60a${sw / 2} ${sw / 2} 0 0 1 -${sw} 0Z`} fill={i % 2 === 0 ? 'currentColor' : 'none'} fillOpacity={0.7} className={i % 2 === 0 ? 'm-a' : undefined} stroke="none" />)
  }
  let outline = `M${x0} 16H${x0 + n * sw}`
  for (let i = 0; i < n; i++) outline += `M${x0 + i * sw} 16V60a${sw / 2} ${sw / 2} 0 0 0 ${sw} 0V16`
  return (
    <>
      <g>{stripes}</g>
      <g className="m-b">
        <path d={outline} />
        <path d={`M${x0 - 6} 10H${x0 + n * sw + 6}`} strokeWidth="3.4" />
        {/* the tag swings from the scallop, on a string */}
        <path d="M408 78V92" strokeWidth="1.8" />
        <path d="M398 98a10 10 0 0 1 20 0V116H398Z" />
        <circle cx="408" cy="100" r="2.6" />
        <path d="M403 109h10" strokeWidth="1.8" />
      </g>
    </>
  )
}

// ---------------------------------------------------------------- Gotet: the vermuteria pattern ------------------------
function Gotet() {
  const row = (y: number, items: [string, number, number][]): ReactNode =>
    items.map(([id, x, rot], i) => <use key={`${y}-${i}`} href={`#pm-cat-ic-${id}`} transform={`translate(${x} ${y}) rotate(${rot})`} />)
  return (
    <>
      <defs>
        <g id="pm-cat-ic-olive">
          <ellipse rx="8.5" ry="11.5" />
          <circle cx="0" cy="-6.2" r="3.3" />
          <path d="M-4.6 5q-1.2 -4 0.6 -7.4" strokeWidth="1.7" />
          <path d="M1.2 -11.4Q2.4 -17.5 9 -18.2" />
        </g>
        <g id="pm-cat-ic-lemon">
          <circle r="11.5" />
          <circle r="8" strokeWidth="1.6" />
          <path d="M-8 0H8M-4 -7L4 7M4 -7L-4 7" strokeWidth="1.6" />
        </g>
        <g id="pm-cat-ic-ice">
          <rect x="-8.5" y="-8.5" width="17" height="17" rx="3.5" />
          <path d="M-4 -3.5L2 -3.5" strokeWidth="1.8" />
        </g>
        <g id="pm-cat-ic-spark">
          <path d="M0 -10Q1.6 -1.6 10 0Q1.6 1.6 0 10Q-1.6 1.6 -10 0Q-1.6 -1.6 0 -10Z" />
        </g>
        <g id="pm-cat-ic-bubbles">
          <circle cx="-6" cy="4" r="4.5" />
          <circle cx="5" cy="-2" r="3" />
          <circle cx="3" cy="9" r="2.2" />
        </g>
      </defs>
      <g className="m-b">
        {row(34, [['olive', 184, -14], ['lemon', 228, 10], ['ice', 272, -12], ['spark', 316, 0], ['olive', 360, 16], ['lemon', 404, -8], ['ice', 448, 14]])}
        {row(86, [['spark', 206, 0], ['olive', 250, 12], ['bubbles', 294, 0], ['lemon', 338, -14], ['spark', 382, 0], ['olive', 426, -10], ['bubbles', 466, 0]])}
      </g>
    </>
  )
}

// ---------------------------------------------------------------- Concept portfolio: a fanned deck of slides --------------
function Portfolio() {
  const slide = (x: number, rot: number, strong: boolean): ReactNode => (
    <g key={x} transform={`rotate(${rot} ${x + 24} 104)`} className={strong ? 'm-b' : 'm-a'}>
      <rect x={x} y={16} width="48" height="86" rx="4" />
      <path d={`M${x + 6} 24h8M${x + 17} 24h8M${x + 28} 24h8M${x + 39} 24h3`} strokeWidth="2" opacity="0.85" />
      <path d={`M${x + 6} 36h32`} strokeWidth="4" />
      <path d={`M${x + 6} 44h22`} />
      <path d={`M${x + 6} 54h36v24h-36ZM${x + 6} 54l36 24M${x + 42} 54l-36 24`} strokeWidth="1.8" />
      <path d={`M${x + 6} 88h26`} />
    </g>
  )
  return (
    <>
      {slide(296, -10, false)}
      {slide(350, 0, true)}
      {slide(404, 10, false)}
    </>
  )
}

// ---------------------------------------------------------------- Sticker Sheet: die-cut stickers with a paper keyline -----
function Stickers() {
  let star = ''
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / 5
    const rad = i % 2 ? 9 : 19
    star += `${i ? 'L' : 'M'}${f(Math.cos(a) * rad)} ${f(Math.sin(a) * rad)}`
  }
  star += 'Z'
  const shapes: { d: string; x: number; y: number; rot: number; extra?: ReactNode }[] = [
    { d: star, x: 196, y: 56, rot: -14 },
    { d: 'M0 16C-26 -2 -15 -22 0 -9C15 -22 26 -2 0 16Z', x: 252, y: 60, rot: 9 },
    { d: 'M-20 -14h40a5 5 0 0 1 5 5v18a5 5 0 0 1 -5 5h-22l-9 9v-9h-9a5 5 0 0 1 -5 -5v-18a5 5 0 0 1 5 -5Z', x: 318, y: 54, rot: -7 },
    { d: 'M5 -22L-11 4H0L-5 22L12 -6H1Z', x: 384, y: 58, rot: 12 },
    { d: 'M-15 6A15 15 0 1 1 15 6A15 15 0 1 1 -15 6M-14 -6L-16 -22L-3 -13M14 -6L16 -22L3 -13', x: 440, y: 62, rot: -10 },
  ]
  return (
    <>
      {shapes.map((s, i) => (
        <g key={i} transform={`translate(${s.x} ${s.y}) rotate(${s.rot})`}>
          <path d={s.d} className="m-keyline" />
        </g>
      ))}
      {shapes.map((s, i) => (
        <g key={`i${i}`} transform={`translate(${s.x} ${s.y}) rotate(${s.rot})`} className="m-b">
          <path d={s.d} />
        </g>
      ))}
      <g className="m-b" transform="translate(318 54) rotate(-7)">
        <path d="M-8 -3h0.01M0 -3h0.01M8 -3h0.01" strokeWidth="4.2" />
      </g>
      <g className="m-b" transform="translate(440 62) rotate(-10)">
        <path d="M-6 4h0.01M6 4h0.01M0 9v0.01" strokeWidth="3.6" />
        <path d="M-22 4h-8M-22 9l-7 3M22 4h8M22 9l7 3" strokeWidth="1.8" />
      </g>
    </>
  )
}

const DRAW: Record<string, () => ReactNode> = {
  contract: Contract,
  plana: Plana,
  'fortyfour-lab': FortyFour,
  'spelled-guilty': Guilty,
  'space-monkey': SpaceMonkey,
  procreate: Procreate,
  somia: Somia,
  'concept-brand': Gotet,
  'concept-portfolio': Portfolio,
  illustration: Stickers,
}

/** the least room (px) between a title and its meta column for the drawing to be worth showing */
const MIN_ROOM = 150

/**
 * Sizes the drawing to the room a band really has: the space between the end of the title's longest line and the meta column
 * (a one-line title leaves a lot, a wrapped one less, a very long one none). Writes `--m-room` (px) on the host, no React state,
 * so nothing re-renders; the CSS reads it for the width of `.pm-cat-motif`. Re-measured on resize and when the title face swaps in.
 */
export function useMotifRoom(host: RefObject<HTMLElement>): void {
  useLayoutEffect(() => {
    const el = host.current
    if (!el) return
    const title = el.querySelector<HTMLElement>('.pm-cat-title')
    const meta = el.querySelector<HTMLElement>('.pm-cat-metarow')
    if (!title || !meta) return
    let raf = 0
    const fit = (): void => {
      raf = 0
      const box = el.getBoundingClientRect()
      if (box.width === 0) return
      // the right end of the longest line of TEXT (the title's own boxes are block-level and stretch to the column: they say nothing)
      const range = document.createRange()
      const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT)
      let end = box.left
      while (walker.nextNode()) {
        const node = walker.currentNode
        if (!node.textContent?.trim()) continue
        range.selectNodeContents(node)
        for (const r of Array.from(range.getClientRects())) if (r.width > 1) end = Math.max(end, r.right)
      }
      const gap = parseFloat(getComputedStyle(el).columnGap) || 20
      const room = meta.getBoundingClientRect().left - end - gap * 1.2
      el.style.setProperty('--m-room', `${room >= MIN_ROOM ? Math.floor(room) : 0}px`)
    }
    const schedule = (): void => {
      if (!raf) raf = requestAnimationFrame(fit)
    }
    fit()
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule)
    ro?.observe(el)
    // the title's own face swaps in after the first paint: the line ends move
    document.fonts?.addEventListener?.('loadingdone', schedule)
    void document.fonts?.ready.then(schedule)
    return () => {
      ro?.disconnect()
      document.fonts?.removeEventListener?.('loadingdone', schedule)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [host])
}

/** the world's drawing for a band (null for a slug without one) */
export function Motif({ slug }: { slug: string }) {
  const draw = DRAW[slug]
  if (!draw) return null
  return (
    <svg
      className="pm-cat-motif"
      data-motif={slug}
      viewBox={`${X0} 0 ${W - X0} ${H}`}
      preserveAspectRatio="xMaxYMid meet"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {draw()}
    </svg>
  )
}
