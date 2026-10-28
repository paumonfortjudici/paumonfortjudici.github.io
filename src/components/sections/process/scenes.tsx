// The four hand-built scenes that live in the film frames (one graphic language, see art.css): 560 x 600 user units each.
//   COLLECT  a reference wall: pinned cards, red string, a magnifier, the sticky note with the one-line promise
//   SKETCH   a pad of thumbnails that resolves into a tablet where the chosen sketch becomes a character
//   MAKE     a desk: vector curve, page layout, retouched photo, a clay head being sculpted, a grid of variations
//   DELIVER  a stack of deliverables: print-ready sheet, brand manual, responsive windows, a key handed over
// Objects (g.ob) land and draw their strokes in turn when `dev` turns on; the scene is plain, fully drawn art otherwise.
// Every drawn shape is a <path> (pathLength is set to 1 in JS), so the stroke-dash draw-on is the same in every browser.
// Decoration: the picture says nothing the paragraph does not (role="img" + a description for assistive tech).
import { memo, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { STEP_STYLE } from './data'

const O = (n: number): CSSProperties => ({ '--o': n }) as CSSProperties

/** path data for a rounded rect, a circle and an ellipse (so that every shape is a path) */
const rr = (x: number, y: number, w: number, h: number, r = 0): string =>
  r
    ? `M${x + r} ${y}H${x + w - r}a${r} ${r} 0 0 1 ${r} ${r}V${y + h - r}a${r} ${r} 0 0 1 ${-r} ${r}H${x + r}a${r} ${r} 0 0 1 ${-r} ${-r}V${y + r}a${r} ${r} 0 0 1 ${r} ${-r}Z`
    : `M${x} ${y}h${w}v${h}h${-w}Z`
const ci = (cx: number, cy: number, r: number): string => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`
const el = (cx: number, cy: number, rx: number, ry: number): string => `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`

interface ShapeProps {
  c: string
  style?: CSSProperties
  transform?: string
}
/** rounded rect */
const R = ({ c, x, y, w, h, r = 0, ...rest }: ShapeProps & { x: number; y: number; w: number; h: number; r?: number }) => (
  <path className={c} d={rr(x, y, w, h, r)} {...rest} />
)
/** circle */
const C = ({ c, cx, cy, r, ...rest }: ShapeProps & { cx: number; cy: number; r: number }) => <path className={c} d={ci(cx, cy, r)} {...rest} />
/** ellipse */
const E = ({ c, cx, cy, rx, ry, ...rest }: ShapeProps & { cx: number; cy: number; rx: number; ry: number }) => (
  <path className={c} d={el(cx, cy, rx, ry)} {...rest} />
)
/** shape path */
const P = ({ c, d, ...rest }: ShapeProps & { d: string }) => <path className={c} d={d} {...rest} />

interface SceneProps {
  dev: boolean
  /** flips a / b each time the frame comes back into the light after it was developed: the objects settle again */
  bump?: 'a' | 'b'
}

const Scene = ({ dev, bump, step, children }: SceneProps & { step: number; children: ReactNode }) => {
  const ref = useRef<SVGSVGElement>(null)
  // every drawn shape is a <path>: pathLength 1 makes the stroke-dash draw-on independent of the real length (dashed guides keep their own length)
  useLayoutEffect(() => {
    ref.current?.querySelectorAll('.o:not(.dsh)').forEach((p) => p.setAttribute('pathLength', '1'))
  }, [])
  return (
    <svg
      ref={ref}
      className="pm-art pm-scene"
      viewBox="0 0 560 600"
      data-dev={dev ? '1' : '0'}
      data-bump={bump}
      role="img"
      aria-label={STEP_STYLE[step].alt}
      focusable="false"
    >
      {children}
    </svg>
  )
}

/** a pinned card: paper card, coloured picture, two caption lines. x y w h rotation; children are drawn in card coordinates */
function Card({ x, y, w, h, r = 0, pic, picH, o, children }: {
  x: number; y: number; w: number; h: number; r?: number; pic: string; picH: number; o: number; children?: ReactNode
}) {
  return (
    <g className="ob" style={O(o)}>
      <g transform={`translate(${x} ${y}) rotate(${r} ${w / 2} ${h / 2})`}>
        <R c="sh" x={7} y={8} w={w} h={h} r={9} />
        <R c="o pa" x={0} y={0} w={w} h={h} r={9} />
        <R c={`o t ${pic}`} x={8} y={8} w={w - 16} h={picH} r={5} />
        {children}
        <P c="o t nofill" d={`M10 ${picH + 22} H${w - 36} M10 ${picH + 34} H${Math.round(w * 0.5)}`} />
      </g>
    </g>
  )
}

const Pin = ({ x, y, c, o }: { x: number; y: number; c: string; o: number }) => (
  <g className="ob" style={O(o)}>
    <C c="sh" cx={x + 4} cy={y + 5} r={9} />
    <C c={`o ${c}`} cx={x} cy={y} r={9} style={{ strokeWidth: 3.4 }} />
    <circle cx={x - 3} cy={y - 3} r="2.4" fill="var(--paper)" />
  </g>
)

/* ------------------------------------------------------------------------------------------------------------------ */
export function Collect({ dev, bump }: SceneProps) {
  const string1 = 'M131 78 Q205 122 282 64 Q360 112 433 92 Q474 150 433 220 Q398 272 430 330'
  const string2 = 'M131 252 Q205 304 282 284 Q352 270 430 330'
  return (
    <Scene dev={dev} bump={bump} step={0}>
      {/* the wall */}
      <g className="ob" style={O(0)}>
        <g transform="rotate(-1.2 280 300)">
          <R c="sh" x={38} y={46} w={504} h={530} r={18} />
          <R c="o pa" x={28} y={34} w={504} h={530} r={18} />
        </g>
      </g>

      {/* the cards, masonry style */}
      <Card x={56} y={70} w={150} h={150} r={-3} pic="uv" picH={104} o={1}>
        <C c="o t bt" cx={104} cy={38} r={14} />
        <P c="o t lg" d="M8 104 V86 Q30 62 54 84 T102 80 L142 92 V104 Z" />
        <P c="o t lc" d="M8 104 V96 Q40 80 70 98 T142 96 V104 Z" />
      </Card>
      <Card x={226} y={56} w={112} h={196} r={2.5} pic="to" picH={146} o={2}>
        <C c="o t cr" cx={56} cy={62} r={26} />
        <P c="o t nofill" d="M20 112 H92 M20 126 H92 M20 140 H66" />
        <P c="o t ik" d="M8 96 Q56 78 104 96 L104 100 H8 Z" />
      </Card>
      <Card x={358} y={84} w={150} h={104} r={-1.5} pic="lg" picH={58} o={3}>
        <text className="disp" x="76" y="54" textAnchor="middle" style={{ fontSize: 46, fill: 'var(--cream)' }}>Aa</text>
      </Card>
      <Card x={358} y={212} w={150} h={86} r={2} pic="pa" picH={40} o={4}>
        <R c="o t to" x={14} y={14} w={28} h={28} r={3} />
        <R c="o t mg" x={44} y={14} w={28} h={28} r={3} />
        <R c="o t uv" x={74} y={14} w={28} h={28} r={3} />
        <R c="o t ik" x={104} y={14} w={28} h={28} r={3} />
      </Card>
      <Card x={56} y={244} w={150} h={150} r={2} pic="bt" picH={104} o={5}>
        <R c="o t ik" x={64} y={14} w={22} h={12} r={2} />
        <P c="o t pn" d="M66 26 h18 v12 q18 8 18 26 v32 q0 4 -4 4 h-52 q-4 0 -4 -4 v-32 q0 -18 18 -26 Z" />
        <R c="o t pa" x={54} y={62} w={42} h={24} r={2} />
        <P c="o t nofill" d="M60 70 H90 M60 78 H80" />
      </Card>
      <Card x={226} y={276} w={112} h={112} r={-2} pic="pa" picH={70} o={6}>
        <R c="o t ik" x={8} y={8} w={96} h={14} r={3} />
        <circle cx="18" cy="15" r="2.6" fill="var(--tomato)" />
        <circle cx="28" cy="15" r="2.6" fill="var(--marigold)" />
        <circle cx="38" cy="15" r="2.6" fill="var(--olive)" />
        <R c="o t lc" x={16} y={30} w={38} h={30} r={3} />
        <P c="o t nofill" d="M62 36 H96 M62 46 H88 M62 56 H92" />
      </Card>

      {/* the red string, then the pins on top of it */}
      <g className="ob" style={O(8)}>
        <P c="o nofill" d={string1} style={{ strokeWidth: 8 }} />
        <P c="o nofill s-to" d={string1} style={{ strokeWidth: 3.6 }} />
      </g>
      <g className="ob" style={O(9)}>
        <P c="o nofill" d={string2} style={{ strokeWidth: 8 }} />
        <P c="o nofill s-to" d={string2} style={{ strokeWidth: 3.6 }} />
      </g>
      <Pin x={131} y={78} c="to" o={7} />
      <Pin x={282} y={64} c="pa" o={7} />
      <Pin x={433} y={92} c="mg" o={7} />
      <Pin x={433} y={220} c="to" o={7} />
      <Pin x={131} y={252} c="uv" o={7} />
      <Pin x={282} y={284} c="lg" o={7} />

      {/* the sticky note with the one-line promise */}
      <g className="ob" style={O(10)}>
        <g transform="translate(352 322) rotate(4 78 78)">
          <P c="sh" d="M8 8 H164 V136 L136 164 H8 Z" />
          <P c="o bg" d="M0 0 H156 V128 L128 156 H0 Z" />
          <P c="o t dbg" d="M156 128 L128 128 L128 156 Z" />
          <text className="hand f0" x="16" y="62" style={{ fontSize: 36 }}>one-line</text>
          <text className="hand f0" x="16" y="102" style={{ fontSize: 36 }}>promise</text>
          <P c="o t nofill f0" d="M16 112 Q50 120 98 110 T124 112" />
        </g>
        <C c="o to" cx={430} cy={330} r={9} style={{ strokeWidth: 3.4 }} />
        <circle cx="427" cy="327" r="2.4" fill="var(--paper)" />
      </g>

      {/* the magnifier */}
      <g className="ob" style={O(11)}>
        <g className="lp lp-sway pm-ambient">
          <g transform="translate(194 466) rotate(45)">
            <R c="sh" x={7} y={-3} w={84} h={26} r={13} />
            <R c="o uv" x={0} y={-12} w={84} h={24} r={12} />
            <R c="o t pa" x={0} y={-12} w={14} h={24} r={4} />
          </g>
          <C c="sh" cx={160} cy={432} r={62} />
          <C c="o cr" cx={150} cy={420} r={62} style={{ strokeWidth: 9 }} />
          {/* what the glass shows: the palette, enlarged */}
          <R c="o t to" x={102} y={397} w={22} h={46} r={3} />
          <R c="o t mg" x={127} y={397} w={22} h={46} r={3} />
          <R c="o t uv" x={152} y={397} w={22} h={46} r={3} />
          <R c="o t ik" x={177} y={397} w={22} h={46} r={3} />
          <P c="o t w nofill" d="M108 386 A46 46 0 0 1 134 368" style={{ strokeWidth: 4 }} />
        </g>
      </g>

      {/* the odd things that end up on a wall like this: a cinema ticket and a bottle cap */}
      <g className="ob" style={O(12)}>
        <g transform="translate(284 494) rotate(-5 60 27)">
          <P c="sh" d={TICKET} transform="translate(7 8)" />
          <P c="o c2" d={TICKET} />
          <P c="o t mg" d="M42 11 L46.4 21.9 L58.2 22.7 L49.1 30.3 L52 41.8 L42 35.5 L32 41.8 L34.9 30.3 L25.8 22.7 L37.6 21.9 Z" />
          <P c="o t nofill dsh f0" d="M92 10 V44" />
          <P c="o t nofill" d="M101 18 H113 M101 27 H113 M101 36 H109" />
        </g>
      </g>
      <g className="ob" style={O(13)}>
        <C c="sh" cx={463} cy={531} r={24} />
        <C c="o to" cx={456} cy={524} r={24} />
        <C c="o t nofill dsh f0" cx={456} cy={524} r={16} />
        <C c="o t pa" cx={456} cy={524} r={7} />
      </g>
    </Scene>
  )
}

/** a ticket stub with the two bites out of the perforation line: 120 x 54 */
const TICKET = 'M4 0 H85 a7 7 0 0 0 14 0 H116 a4 4 0 0 1 4 4 V50 a4 4 0 0 1 -4 4 H99 a7 7 0 0 0 -14 0 H4 a4 4 0 0 1 -4 -4 V4 a4 4 0 0 1 4 -4 Z'

/* ------------------------------------------------------------------------------------------------------------------ */
const DOODLES = [
  'M17 36a15 15 0 1 0 30 0a15 15 0 1 0-30 0ZM20 25l-5-11 11 6M44 25l5-11-11 6M26 34h.1M38 34h.1M25 43q7 6 14 0',
  'M20 36a12 17 0 1 0 24 0a12 17 0 1 0-24 0ZM22 22q-8-10-6-16q8 2 12 12M42 22q8-10 6-16q-8 2-12 12M24 30l7 3M40 30l-7 3M28 36h.1M36 36h.1M26 47q6-4 12 0',
  'M16 24h32v26q0 6-6 6H22q-6 0-6-6ZM18 24l-2-12 9 8M46 24l2-12-9 8M25 34h.1M39 34h.1M22 44q10 10 20 0v-2H22Z',
  'M17 36a15 15 0 1 0 30 0a15 15 0 1 0-30 0ZM20 25l-5-11 11 6M42 22l4-4M26 34h.1M38 35h.1M24 43h16M34 43q3 8 6 2',
  'M14 38a18 17 0 1 0 36 0a18 17 0 1 0-36 0ZM18 26q-8-8-4-16q8 4 10 11M46 26q8-8 4-16q-8 4-10 11M25 35h.1M39 35h.1M20 46q12 11 24 0M17 42h.1M47 42h.1',
  'M22 44a10 10 0 1 0 20 0a10 10 0 1 0-20 0ZM22 38q-14-6-10-26q10 10 16 20M42 38q14-6 10-26q-10 10-16 20M28 43h.1M36 43h.1M28 49q4 3 8 0',
  'M12 38a20 18 0 1 0 40 0a20 18 0 1 0-40 0ZM20 12a14 5 0 1 0 28 0a14 5 0 1 0-28 0ZM26 36h.1M38 36h.1M24 46q8 6 16 0',
  'M32 18q-18 4-14 28q2 10 14 10t14-10q4-24-14-28ZM21 22l-5-9 10 4M43 22l5-9-10 4',
  'M10 38a22 14 0 1 0 44 0a22 14 0 1 0-44 0ZM14 30l-4-12 11 5M50 30l4-12-11 5M24 36h.1M40 36h.1M26 44q6 5 12 0',
]

const Thumb = ({ i }: { i: number }) => {
  const col = i % 3
  const row = Math.floor(i / 3)
  return (
    <g transform={`translate(${14 + col * 76} ${34 + row * 76})`}>
      <R c="o t nofill" x={0} y={0} w={64} h={64} r={5} />
      <P c="o t nofill gr" d={DOODLES[i]} />
    </g>
  )
}
const PAD = 'translate(24 54) rotate(-3 120 150)'

export function Sketch({ dev, bump }: SceneProps) {
  return (
    <Scene dev={dev} bump={bump} step={1}>
      {/* the pad */}
      <g className="ob" style={O(0)}>
        <g transform={PAD}>
          <R c="sh" x={8} y={9} w={240} h={300} r={10} />
          <R c="o pa" x={0} y={0} w={240} h={300} r={10} />
          <P c="o t nofill" d="M30 -6 v20 M62 -6 v20 M94 -6 v20 M126 -6 v20 M158 -6 v20 M190 -6 v20 M222 -6 v20" style={{ strokeWidth: 5 }} />
        </g>
      </g>
      {/* three rows of thumbnails, one more crossed out each time */}
      <g className="ob" style={O(1)}>
        <g transform={PAD}>
          <Thumb i={0} /><Thumb i={1} /><Thumb i={2} />
          <P c="o nofill s-to" d="M20 40 L70 92 M70 40 L20 92" style={{ strokeWidth: 3.4 }} />
        </g>
      </g>
      <g className="ob" style={O(2)}>
        <g transform={PAD}>
          <Thumb i={3} /><Thumb i={4} /><Thumb i={5} />
          <P c="o nofill s-to" d="M196 100 C240 92 252 160 222 196 C196 222 150 210 150 160 C150 116 186 100 224 108" style={{ strokeWidth: 3.6 }} />
        </g>
      </g>
      <g className="ob" style={O(3)}>
        <g transform={PAD}>
          <Thumb i={6} /><Thumb i={7} /><Thumb i={8} />
          <P c="o nofill s-to" d="M20 192 L70 244 M70 192 L20 244" style={{ strokeWidth: 3.4 }} />
        </g>
      </g>

      {/* the arrow from the chosen sketch to the tablet */}
      <g className="ob" style={O(4)}>
        <P c="o x nofill" d="M262 196 C296 198 300 252 314 298" />
        <P c="o x nofill" d="M296 280 L314 300 L330 276" />
      </g>

      {/* the tablet */}
      <g className="ob" style={O(5)}>
        <g transform="translate(308 262) rotate(3 112 150)">
          <R c="sh" x={8} y={9} w={224} h={300} r={24} />
          <R c="o ik" x={0} y={0} w={224} h={300} r={24} />
          <R c="o t pa" x={12} y={14} w={200} h={272} r={10} />
          <circle cx="112" cy="7" r="2.6" fill="var(--paper)" />
        </g>
      </g>
      {/* the character, redrawn big */}
      <g className="ob" style={O(6)}>
        <g transform="translate(302 262) rotate(3 112 150)">
          <P c="o x nofill" d="M140 232 C182 240 192 204 172 192" />
          <P c="o to" d="M162 182 L186 196 L160 206 Z" />
          <P c="o nofill" d="M84 192 C66 198 58 212 62 226" style={{ strokeWidth: 12 }} />
          <P c="o nofill s-to" d="M84 192 C66 198 58 212 62 226" style={{ strokeWidth: 5 }} />
          <P c="o nofill" d="M148 190 C168 182 176 166 172 152" style={{ strokeWidth: 12 }} />
          <P c="o nofill s-to" d="M148 190 C168 182 176 166 172 152" style={{ strokeWidth: 5 }} />
          <P c="o nofill" d="M102 228 L98 262 M130 228 L136 262" style={{ strokeWidth: 12 }} />
          <P c="o nofill s-to" d="M102 228 L98 262 M130 228 L136 262" style={{ strokeWidth: 5 }} />
          <E c="o ik" cx={93} cy={268} rx={17} ry={8} />
          <E c="o ik" cx={141} cy={268} rx={17} ry={8} />
          <P c="o to" d="M82 192 C80 160 152 160 150 192 C154 234 78 234 82 192 Z" />
          <C c="o cr" cx={62} cy={230} r={9} />
          <C c="o cr" cx={172} cy={146} r={9} />
          <P c="o ik" d="M80 94 C64 66 72 48 94 44 C90 60 96 76 104 86 Z" />
          <P c="o ik" d="M150 94 C166 66 158 48 136 44 C140 60 134 76 126 86 Z" />
          <C c="o to" cx={116} cy={122} r={50} />
          <E c="o t cr" cx={98} cy={118} rx={11} ry={14} />
          <E c="o t cr" cx={134} cy={118} rx={11} ry={14} />
          <circle cx="101" cy="114" r="5.4" fill="var(--ink)" />
          <circle cx="137" cy="114" r="5.4" fill="var(--ink)" />
          <P c="o t nofill" d="M84 100 L110 110 M148 100 L122 110" style={{ strokeWidth: 4 }} />
          <C c="o t bg" cx={82} cy={142} r={8} />
          <C c="o t bg" cx={150} cy={142} r={8} />
          <P c="o t ik" d="M92 144 Q116 178 142 144 Q116 154 92 144 Z" />
          <P c="o t cr" d="M106 150 l4 10 l6 -9 Z" />
        </g>
      </g>
      {/* the stylus */}
      <g className="ob" style={O(7)}>
        <g className="lp lp-wig pm-ambient">
          <g transform="translate(450 396) rotate(-50)">
            <P c="sh" d="M7 5 L27 -1.5 H141 a6.5 6.5 0 0 1 0 13 H27 Z" />
            <P c="o ik" d="M0 0 L22 -7 V7 Z" />
            <R c="o pa" x={22} y={-7} w={108} h={14} r={6} />
            <R c="o t ik" x={96} y={-7} w={7} h={14} />
            <R c="o ik" x={130} y={-7} w={12} h={14} r={6} />
          </g>
        </g>
      </g>

      {/* a shape, a mascot, a lettering style: what the thumbnails turn into */}
      <g className="ob" style={O(4)}>
        <g transform="translate(350 40) rotate(4 84 74)">
          <R c="sh" x={7} y={8} w={168} h={148} r={6} />
          <R c="o pa" x={0} y={0} w={168} h={148} r={6} />
          <P c="o t nofill gr" d="M34 28 L40 44 L57 45 L44 55 L48 71 L34 62 L20 71 L24 55 L11 45 L28 44 Z" />
          <g transform="translate(52 24) scale(0.95)">
            <P c="o t nofill gr" d={DOODLES[4]} />
          </g>
          <text className="hand" x="130" y="66" textAnchor="middle" style={{ fontSize: 42, fill: 'var(--ink-3)' }}>Aa</text>
          <P c="o t nofill" d="M16 100 H152 M16 116 H118 M16 132 H138" />
          <P c="o t tp" d="M52 -6 H116 V16 H52 Z" transform="rotate(-3 84 5)" />
        </g>
      </g>

      {/* the pencil and its shavings */}
      <g className="ob" style={O(8)}>
        <g className="lp lp-nudge pm-ambient">
          <g transform="translate(40 556) rotate(-17)">
            <P c="sh" d="M7 9 L52 -6 H214 V22 H52 Z" />
            <P c="o c2" d="M0 0 L52 -14 V14 Z" />
            <P c="o n ik" d="M0 0 L16 -4.2 V4.2 Z" />
            <R c="o mg" x={52} y={-14} w={166} h={28} r={2} />
            <R c="o n dmg" x={54} y={7} w={162} h={5} />
            <P c="o t w nofill" d="M58 -9 H212" />
            <R c="o pa" x={218} y={-14} w={30} h={28} r={2} />
            <P c="o t nofill" d="M226 -14 V14 M234 -14 V14" />
            <R c="o to" x={248} y={-14} w={30} h={28} r={10} />
          </g>
          <P c="o t bt" d="M96 582 q4 -16 22 -14 q-10 4 -10 12 q-6 3 -12 2 Z" />
          <P c="o t bt" d="M138 590 q6 -14 22 -10 q-8 4 -8 12 q-8 2 -14 -2 Z" />
          <P c="o t bt" d="M186 580 q2 -12 16 -12 q-6 4 -4 10 q-6 3 -12 2 Z" />
        </g>
      </g>
    </Scene>
  )
}

/* ------------------------------------------------------------------------------------------------------------------ */
const RULER = (() => {
  let d = ''
  for (let i = 0; i <= 30; i++) {
    const x = 8 + i * 10
    d += `M${x} 0v${i % 5 === 0 ? 17 : 9}`
  }
  return d
})()

export function Make({ dev, bump }: SceneProps) {
  return (
    <Scene dev={dev} bump={bump} step={2}>
      <defs>
        <pattern id="pm-ht-make" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(32)">
          <circle cx="3.5" cy="3.5" r="1.5" fill="currentColor" />
        </pattern>
      </defs>

      {/* vectors */}
      <g className="ob" style={O(0)}>
        <g transform="translate(22 36) rotate(-2 125 98)">
          <R c="sh" x={8} y={9} w={250} h={198} r={10} />
          <R c="o pa" x={0} y={0} w={250} h={198} r={10} />
          <P c="o nofill t lt" d="M20 40 H230 M20 80 H230 M20 120 H230 M20 160 H230 M60 14 V184 M110 14 V184 M160 14 V184 M210 14 V184" />
          <P c="o mg" d="M122 164 C142 124 194 128 208 164 C182 190 142 190 122 164 Z" />
          <P c="o nofill t" d="M34 162 L72 32 M214 114 L172 22" />
          <P c="o x nofill" d="M34 162 C72 32 172 22 214 114" />
          <C c="o t lg" cx={72} cy={32} r={7} />
          <C c="o t lg" cx={172} cy={22} r={7} />
          <R c="o t pa" x={28} y={156} w={12} h={12} />
          <R c="o t pa" x={208} y={108} w={12} h={12} />
          <R c="o t uv" x={115} y={48} w={12} h={12} />
        </g>
      </g>

      {/* layout */}
      <g className="ob" style={O(1)}>
        <g transform="translate(306 26) rotate(3 103 134)">
          <R c="sh" x={8} y={9} w={206} h={268} r={6} />
          <R c="o pa" x={0} y={0} w={206} h={268} r={6} />
          <R c="o ik" x={14} y={16} w={130} h={18} r={2} />
          <R c="o t ik" x={14} y={40} w={88} h={10} r={2} />
          <R c="o t lc" x={14} y={62} w={108} h={76} />
          <P c="o t nofill" d="M14 62 L122 138 M122 62 L14 138" />
          <R c="o t mg" x={130} y={62} w={62} h={76} />
          <text className="disp" x="161" y="118" textAnchor="middle" style={{ fontSize: 58 }}>A</text>
          <P c="o t nofill" d="M14 156 H66 M14 168 H62 M14 180 H66 M14 192 H56 M14 204 H66 M14 216 H50 M76 156 H128 M76 168 H122 M76 180 H128 M76 192 H116 M76 204 H128 M138 156 H190 M138 168 H182 M138 180 H190 M138 192 H174 M138 204 H190" />
          <R c="o t to" x={138} y={224} w={52} h={30} r={2} />
          <P c="o t nofill dsh s-lg f0" d="M14 8 V262 M192 8 V262 M6 148 H200" />
        </g>
      </g>

      {/* retouch */}
      <g className="ob" style={O(3)}>
        <g transform="translate(228 330) rotate(-3 85 62)">
          <R c="sh" x={7} y={8} w={170} h={130} r={5} />
          <R c="o pa" x={0} y={0} w={170} h={130} r={5} />
          <R c="o t lg" x={10} y={10} w={150} h={90} />
          <C c="o t bt" cx={122} cy={36} r={14} />
          <P c="o t pn" d="M10 100 V76 Q50 46 92 76 T160 70 V100 Z" />
          <circle cx="58" cy="52" r="2.8" fill="var(--ink)" />
          <C c="o t nofill dsh f0" cx={58} cy={52} r={13} />
          <C c="o t nofill dsh f0" cx={112} cy={78} r={13} />
          <P c="o t nofill dsh f0" d="M70 56 L100 74" />
          <P c="o t nofill" d="M10 114 H110" />
        </g>
      </g>

      {/* variations */}
      <g className="ob" style={O(4)}>
        <g transform="translate(404 336) rotate(2 66 68)">
          <R c="sh" x={7} y={8} w={136} h={138} r={8} />
          <R c="o pa" x={0} y={0} w={136} h={138} r={8} />
          <g transform="translate(10 10)">
            <R c="o t bg" x={0} y={0} w={54} h={54} r={4} />
            <C c="o t pa" cx={27} cy={30} r={13} />
            <C c="o t pa" cx={14} cy={14} r={6} />
            <C c="o t pa" cx={40} cy={14} r={6} />
            <P c="o t nofill" d="M22 29h.1M32 29h.1M23 36q4 3 8 0" />
          </g>
          <g transform="translate(72 10)">
            <R c="o t mg" x={0} y={0} w={54} h={54} r={4} />
            <C c="o t pa" cx={27} cy={31} r={13} />
            <P c="o t pa" d="M16 22 L10 6 L24 16 Z M38 22 L44 6 L30 16 Z" />
            <P c="o t nofill" d="M22 30h.1M32 30h.1M23 37q4 3 8 0" />
          </g>
          <g transform="translate(10 72)">
            <R c="o t lg" x={0} y={0} w={54} h={54} r={4} />
            <C c="o t pa" cx={27} cy={32} r={13} />
            <P c="o t nofill" d="M27 19 V8 M22 8 h10" />
            <P c="o t nofill" d="M22 31h.1M32 31h.1M23 38q4 3 8 0" />
          </g>
          <g transform="translate(72 72)">
            <R c="o t lc" x={0} y={0} w={54} h={54} r={4} />
            <C c="o t pa" cx={27} cy={31} r={13} />
            <C c="o t pa" cx={10} cy={30} r={6} />
            <C c="o t pa" cx={44} cy={30} r={6} />
            <P c="o t nofill" d="M22 30h.1M32 30h.1M23 37q4 3 8 0" />
          </g>
          <R c="o nofill s-to" x={64} y={2} w={70} h={70} r={8} style={{ strokeWidth: 4 }} />
          <C c="o pn" cx={128} cy={12} r={13} style={{ strokeWidth: 3.4 }} />
          <P c="o nofill s-pa" d="M121 12 l5 5 l9 -11" style={{ strokeWidth: 3.6 }} />
        </g>
      </g>

      {/* the sparkle: the AI step, small and honest */}
      <g className="ob" style={O(5)}>
        <g className="lp lp-twink pm-ambient">
          <P c="o mg" d="M408 322 Q411 337 428 341 Q411 345 408 360 Q405 345 388 341 Q405 337 408 322 Z" />
        </g>
      </g>

      {/* clay head being sculpted */}
      <g className="ob" style={O(2)}>
        <g transform="translate(20 318)">
          <E c="sh" cx={104} cy={240} rx={88} ry={18} />
          <E c="o pa" cx={98} cy={232} rx={88} ry={18} />
          <P c="o t dc2" d="M10 232 V246 a88 18 0 0 0 176 0 V232" />
          <R c="o dlc" x={68} y={172} w={52} h={54} r={6} />
          <P c="o lc" d="M38 96 C38 40 92 18 136 42 C162 56 166 90 160 108 L176 128 L158 136 C160 158 142 184 108 188 C70 190 42 156 38 96 Z" />
          <P c="o n" d="M38 96 C38 40 64 24 88 20 C58 52 54 118 78 176 C52 160 40 132 38 96 Z" style={{ '--f': 'url(#pm-ht-make)' } as CSSProperties} />
          <E c="o t dlc" cx={84} cy={112} rx={9} ry={14} />
          <P c="o t nofill" d="M118 88 q12 -6 24 -2 M128 98 h.1" />
          <g className="lp lp-pulse pm-ambient f0">
            <C c="o t nofill dsh" cx={132} cy={146} r={23} />
          </g>
          <P c="o t nofill f0" d="M132 134 v24 M120 146 h24" />
          <g transform="translate(160 62) rotate(-38)">
            <R c="o mg" x={0} y={-7} w={46} h={14} r={7} />
            <P c="o t nofill" d="M2 0 H-9" />
            <E c="o t nofill" cx={-22} cy={0} rx={13} ry={8} />
          </g>
        </g>
      </g>

      {/* ruler on the desk */}
      <g className="ob" style={O(6)}>
        <g transform="translate(224 540)">
          <R c="sh" x={6} y={7} w={316} h={38} r={4} />
          <R c="o bt" x={0} y={0} w={316} h={38} r={4} />
          <P c="o t nofill" d={RULER} />
        </g>
      </g>
    </Scene>
  )
}

/* ------------------------------------------------------------------------------------------------------------------ */
export function Deliver({ dev, bump }: SceneProps) {
  return (
    <Scene dev={dev} bump={bump} step={3}>
      {/* print-ready sheet */}
      <g className="ob" style={O(0)}>
        <g transform="translate(24 108) rotate(-7 110 150)">
          <R c="sh" x={8} y={9} w={220} h={304} r={3} />
          <R c="o pa" x={0} y={0} w={220} h={304} r={3} />
          <P c="o t nofill" d="M6 28 H20 M28 6 V20 M214 28 H200 M192 6 V20 M6 262 H20 M28 284 V270 M214 262 H200 M192 284 V270" />
          <C c="o t nofill" cx={110} cy={14} r={7} />
          <P c="o t nofill" d="M110 4 V24 M100 14 H120" />
          <R c="o t nofill dsh f0" x={22} y={26} w={176} h={238} />
          <R c="o t uv" x={30} y={34} w={160} h={220} />
          <C c="o t mg" cx={110} cy={118} r={52} />
          <P c="o t to" d="M30 254 V190 Q70 150 110 190 T190 186 V254 Z" />
          <R c="o t cr" x={26} y={278} w={23.4} h={11} />
          <R c="o t mg" x={49.4} y={278} w={23.4} h={11} />
          <R c="o t lg" x={72.8} y={278} w={23.4} h={11} />
          <R c="o t ol" x={96.2} y={278} w={23.4} h={11} />
          <R c="o t bg" x={119.6} y={278} w={23.4} h={11} />
          <R c="o t to" x={143} y={278} w={23.4} h={11} />
          <R c="o t uv" x={166.4} y={278} w={23.4} h={11} />
        </g>
      </g>

      {/* brand manual */}
      <g className="ob" style={O(1)}>
        <g transform="translate(214 62) rotate(4 100 131)">
          <R c="sh" x={9} y={10} w={206} h={262} r={8} />
          <R c="o pa" x={8} y={6} w={204} h={254} r={6} />
          <P c="o t nofill" d="M212 22 H206 M212 36 H206 M212 50 H206" />
          <R c="o to" x={0} y={0} w={204} h={258} r={8} />
          <P c="o n dto" d="M0 8 a8 8 0 0 1 8 -8 H22 V258 H8 a8 8 0 0 1 -8 -8 Z" />
          <P c="o t nofill" d="M22 0 V258" />
          <R c="o ik" x={164} y={-2} w={12} h={262} />
          <C c="o mg" cx={104} cy={78} r={24} />
          <P c="o t nofill" d="M104 38 V28 M104 128 V118 M64 78 H54 M154 78 H144 M76 50 L69 43 M132 50 L139 43 M76 106 L69 113 M132 106 L139 113" />
          <text className="disp f0" x="38" y="184" style={{ fontSize: 30, fill: 'var(--ink)' }}>Brand</text>
          <text className="disp f0" x="38" y="218" style={{ fontSize: 30, fill: 'var(--ink)' }}>manual</text>
        </g>
      </g>

      {/* responsive: desktop, tablet, phone */}
      <g className="ob" style={O(2)}>
        <g transform="translate(224 380) rotate(-2 120 80)">
          <R c="sh" x={8} y={9} w={240} h={164} r={8} />
          <R c="o pa" x={0} y={0} w={240} h={164} r={8} />
          <P c="o ik" d="M0 8 a8 8 0 0 1 8 -8 H232 a8 8 0 0 1 8 8 V26 H0 Z" />
          <circle cx="14" cy="13" r="4" fill="var(--tomato)" />
          <circle cx="28" cy="13" r="4" fill="var(--marigold)" />
          <circle cx="42" cy="13" r="4" fill="var(--olive)" />
          <R c="o t pa" x={64} y={6} w={130} h={14} r={7} />
          <R c="o t mg" x={12} y={36} w={216} h={58} />
          <P c="o x nofill" d="M24 54 H118" />
          <P c="o t nofill" d="M24 70 H92" />
          <R c="o t ik" x={24} y={78} w={40} h={10} r={3} />
          <R c="o t lc" x={12} y={104} w={66} h={50} />
          <R c="o t bg" x={87} y={104} w={66} h={50} />
          <R c="o t c2" x={162} y={104} w={66} h={50} />
        </g>
      </g>
      <g className="ob" style={O(3)}>
        <g transform="translate(436 340) rotate(3 48 64)">
          <R c="sh" x={7} y={8} w={96} h={128} r={12} />
          <R c="o ik" x={0} y={0} w={96} h={128} r={12} />
          <R c="o t pa" x={7} y={9} w={82} h={110} r={5} />
          <R c="o t mg" x={12} y={14} w={72} h={34} />
          <P c="o t nofill" d="M14 58 H80 M14 68 H66" />
          <R c="o t lc" x={14} y={78} w={30} h={30} />
          <R c="o t bg" x={50} y={78} w={30} h={30} />
        </g>
      </g>
      <g className="ob" style={O(4)}>
        <g transform="translate(498 408) rotate(-3 26 50)">
          <R c="sh" x={6} y={7} w={54} h={104} r={10} />
          <R c="o ik" x={0} y={0} w={54} h={104} r={10} />
          <R c="o t pa" x={5} y={8} w={44} h={86} r={4} />
          <R c="o t mg" x={9} y={12} w={36} h={28} />
          <P c="o t nofill" d="M10 48 H44 M10 57 H36" />
          <R c="o t lc" x={10} y={66} w={34} h={22} />
        </g>
      </g>

      {/* the key, handed over */}
      <g className="ob" style={O(5)}>
        <g className="lp lp-swing pm-ambient">
          <g transform="translate(70 424) rotate(-10)">
            <C c="o t nofill" cx={52} cy={10} r={14} style={{ strokeWidth: 5 }} />
            <R c="sh" x={11} y={36} w={100} h={66} r={14} />
            <R c="o mg" x={4} y={28} w={100} h={66} r={14} />
            <C c="o t lg" cx={52} cy={40} r={6.5} />
            <text className="hand f0" x="54" y="76" textAnchor="middle" style={{ fontSize: 34 }}>yours</text>
          </g>
          <g transform="translate(86 520) rotate(-12)">
            <C c="o pa" cx={0} cy={0} r={22} />
            <C c="o t lg" cx={0} cy={0} r={8} />
            <R c="o pa" x={18} y={-7} w={72} h={14} r={6} />
            <R c="o pa" x={64} y={6} w={9} h={16} r={2} />
            <R c="o pa" x={78} y={6} w={9} h={11} r={2} />
          </g>
        </g>
      </g>
    </Scene>
  )
}

// memoised: the bench re-renders on every hover, a scene only when it is developed or settles again
export const SCENES = [memo(Collect), memo(Sketch), memo(Make), memo(Deliver)] as const
