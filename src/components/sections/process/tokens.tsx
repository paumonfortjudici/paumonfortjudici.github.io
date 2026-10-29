// The seven tool tokens of the shelf: Pau's old-school blackwork tattoo-flash drawings, cut into their moving parts (public/process/tk/<token>-<part>.webp,
// filed by tools/ingest_tokens.py) and put back together here on a 150 x 150 unit board, so that each one still makes its own little move on hover
// and focus (tokens.css). Every part sits where it sits in the object; a wrapper (`pm-tk-g`, class tk-*) is what moves, around the pivot given in
// board units. Each icon carries the tool's name in real type on its ribbon, written ALONG the curve of the ribbon (an SVG text path built from the
// curve measured on the drawing), and the ribbon sits in a different place on every icon (top, bottom, across the object, tilted either way).
// The ribbon text is decoration (aria-hidden): the button has the real name. No logos and no app icons. The board is --tk wide, 160 to 240 px.
import { memo, type ComponentType, type CSSProperties, type ReactNode } from 'react'
import { asset } from '../../../lib/asset'
import type { ToolId } from './data'
import { SPRITES } from './tokens.sprites'

const U = 150

type Token = Exclude<keyof typeof SPRITES, 'bin'>
interface PieceSize {
  w: number
  h: number
  holes?: readonly { x: number; y: number }[]
  /** ribbons only: the centre line of the band, y = a x^2 + b x + c (x, y: 0..1 of the piece), and its thickness (0..1 of the height) */
  curve?: readonly [number, number, number]
  band?: number
}
const SIZES = SPRITES as unknown as Record<string, Record<string, PieceSize>>

interface SprProps {
  t: Token
  p: string
  /** the board point the anchor of the piece lands on, in board units */
  x: number
  y: number
  /** width of the piece on the board (its height follows its proportions) */
  w: number
  /** the point of the piece that lands on (x, y), 0..1 of its width and height: the centre by default */
  ax?: number
  ay?: number
  /** a fixed tilt of the piece, degrees, around its anchor */
  rot?: number
  className?: string
}

/** one piece of an icon, an absolutely placed WebP */
function Spr({ t, p, x, y, w, ax = 0.5, ay = 0.5, rot, className }: SprProps) {
  const s = SIZES[t][p]
  const h = (w * s.h) / s.w
  const style: CSSProperties = { left: `${((x - ax * w) / U) * 100}%`, top: `${((y - ay * h) / U) * 100}%`, width: `${(w / U) * 100}%` }
  if (rot) {
    style.transform = `rotate(${rot}deg)`
    style.transformOrigin = `${ax * 100}% ${ay * 100}%`
  }
  return <img className={className ? `pm-tk-img ${className}` : 'pm-tk-img'} src={asset(`/process/tk/${t}-${p}.webp`)} width={s.w} height={s.h} alt="" draggable={false} style={style} />
}

/** the hole of a paint chip (where the rivet goes), 0..1 of the piece */
const hole = (t: Token, p: string): { x: number; y: number } => SIZES[t][p].holes?.[0] ?? { x: 0.5, y: 0.9 }

/** a group that moves as one: it covers the board, and `o` is its pivot in board units */
function G({ cls, o, children }: { cls: string; o?: readonly [number, number]; children: ReactNode }) {
  const style = o ? ({ '--ox': o[0], '--oy': o[1] } as CSSProperties) : undefined
  return (
    <span className={`pm-tk-g ${cls}`} style={style}>
      {children}
    </span>
  )
}

/** the ribbon with the tool's name along its curve: centred on (x, y), `w` wide, tilted `rot` degrees */
function Ribbon({ t, name, x, y, w, rot = 0 }: { t: Token; name: string; x: number; y: number; w: number; rot?: number }) {
  const s = SIZES[t].banner
  const [a, b, c] = s.curve ?? [0, 0, 0.5]
  const W = s.w
  const H = s.h
  const h = (w * H) / W
  // the type: as big as the band and the room between the folded tails allow (Courier-like faces are 0.6 em wide)
  const fs = Math.min(0.105 * W, (0.98 * W) / name.length)
  const yAt = (nx: number) => a * nx * nx + b * nx + c
  const x0 = 0.19
  const x1 = 0.81
  const shift = 0.29 * fs // the baseline sits this far under the centre line, so the capitals are centred in the band
  const p0 = { x: x0 * W, y: yAt(x0) * H + shift }
  const p1 = { x: x1 * W, y: yAt(x1) * H + shift }
  const xm = (x0 + x1) / 2
  const slope0 = 2 * a * x0 + b // dy/dx at the start, in 0..1 units (a quadratic curve is one Bezier segment)
  const ctrl = { x: xm * W, y: (yAt(x0) + slope0 * (xm - x0)) * H + shift }
  const d = `M${p0.x.toFixed(1)} ${p0.y.toFixed(1)} Q${ctrl.x.toFixed(1)} ${ctrl.y.toFixed(1)} ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`
  const id = `pm-tk-rb-${t}`
  const style: CSSProperties = { left: `${((x - w / 2) / U) * 100}%`, top: `${((y - h / 2) / U) * 100}%`, width: `${(w / U) * 100}%`, transform: rot ? `rotate(${rot}deg)` : undefined }
  return (
    <span className="pm-tk-rb" style={style}>
      <img className="pm-tk-rb__img" src={asset(`/process/tk/${t}-banner.webp`)} width={W} height={H} alt="" draggable={false} />
      <svg className="pm-tk-rb__txt" viewBox={`0 0 ${W} ${H}`} focusable="false">
        <path id={id} d={d} fill="none" />
        <text fontSize={fs.toFixed(1)}>
          <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
            {name}
          </textPath>
        </text>
      </svg>
    </span>
  )
}

const Board = ({ children }: { children: ReactNode }) => (
  <span className="pm-tk-svg" aria-hidden="true">
    {children}
  </span>
)

/** the whole Adobe suite: three paint chips on one rivet (a star, an eye and a sun on them), the ribbon across the top */
function Fan() {
  const chip = (p: string) => {
    const h = hole('adobe', p)
    return <Spr t="adobe" p={p} x={75} y={127} w={46} ax={h.x} ay={h.y} />
  }
  return (
    <Board>
      <G cls="tk-fl" o={[75, 127]}>
        {chip('chipL')}
      </G>
      <G cls="tk-fr" o={[75, 127]}>
        {chip('chipR')}
      </G>
      <G cls="tk-fc" o={[75, 127]}>
        {chip('chipM')}
      </G>
      <Spr t="adobe" p="rivet" x={75} y={127} w={16} />
      <Ribbon t="adobe" name="ADOBE" x={75} y={22} w={132} rot={-3} />
    </Board>
  )
}

/** pencil and paper: a tiger-striped pencil writing on a scrap of paper, the ribbon along the bottom */
function Pencil() {
  return (
    <Board>
      <Spr t="pencil" p="paper" x={72} y={82} w={118} />
      <Spr t="pencil" p="scribble" x={72} y={84} w={70} className="tk-scr" />
      <G cls="tk-pen">
        <Spr t="pencil" p="pencil" x={106} y={84} w={102} ax={1} ay={0.5} rot={27} />
      </G>
      <Ribbon t="pencil" name="PENCIL" x={76} y={131} w={130} rot={3} />
    </Board>
  )
}

/** Procreate: a plastic index tab on a canvas card, with one brush stroke; the ribbon is stuck across the lower left corner of the card */
function IndexTab() {
  return (
    <Board>
      <G cls="tk-tab">
        <Spr t="procreate" p="tab" x={75} y={38} w={62} />
      </G>
      <Spr t="procreate" p="card" x={75} y={84} w={110} />
      <Spr t="procreate" p="stroke" x={76} y={82} w={84} className="tk-b1" />
      <Ribbon t="procreate" name="PROCREATE" x={72} y={124} w={126} rot={-7} />
    </Board>
  )
}

/** Nomad Sculpt: a lump of clay with thumbprints, a wire loop tool pressed into it and a little flag on a toothpick; the ribbon runs across the top */
function Clay() {
  return (
    <Board>
      <G cls="tk-flag" o={[62, 94]}>
        <Spr t="nomad" p="flag" x={62} y={94} w={26} ax={0.1034} ay={1} />
      </G>
      <G cls="tk-clay" o={[64, 144]}>
        <Spr t="nomad" p="clay" x={64} y={108} w={92} />
      </G>
      <G cls="tk-tool">
        <Spr t="nomad" p="tool" x={114} y={104} w={64} rot={135} />
      </G>
      <Ribbon t="nomad" name="NOMAD SCULPT" x={72} y={18} w={146} rot={-4} />
    </Board>
  )
}

/** AI tools: a luggage tag with four tattoo symbols to pick from and the tick that picks one; the ribbon is tied on at the lower right */
function Tag() {
  return (
    <Board>
      <G cls="tk-tagg" o={[74, 6]}>
        <Spr t="ai" p="tag" x={74} y={6} w={94} ax={0.6493} ay={0} />
        <Spr t="ai" p="tick" x={62} y={94} w={33} className="tk-tick" />
      </G>
      <Ribbon t="ai" name="AI TOOLS" x={76} y={129} w={120} rot={5} />
    </Board>
  )
}

/** Pinterest: a photo card held up with a push pin, and the ribbon laid over its caption strip */
function Pin() {
  return (
    <Board>
      <G cls="tk-pcard" o={[64, 40]}>
        <Spr t="pinterest" p="card" x={68} y={88} w={88} />
      </G>
      <G cls="tk-pin" o={[64, 40]}>
        <Spr t="pinterest" p="pin" x={64} y={40} w={28} ax={0.025} ay={1} />
      </G>
      <Ribbon t="pinterest" name="PINTEREST" x={74} y={125} w={124} rot={7} />
    </Board>
  )
}

/** VS Code: a keyboard key with a pair of curly braces on its cap; the ribbon is wrapped round the key's black base */
function Key() {
  return (
    <Board>
      <Spr t="vscode" p="base" x={75} y={106} w={108} />
      <G cls="tk-top">
        <Spr t="vscode" p="cap" x={75} y={62} w={72} />
        <G cls="tk-br" o={[75, 62]}>
          <Spr t="vscode" p="braceL" x={63} y={62} w={14} />
          <Spr t="vscode" p="braceR" x={87} y={62} w={14} />
        </G>
      </G>
      <Ribbon t="vscode" name="VS CODE" x={75} y={120} w={124} rot={-4} />
    </Board>
  )
}

// memoised: no props, so a token is drawn once
export const TOKEN_ART: Record<ToolId, ComponentType> = {
  adobe: memo(Fan),
  pencil: memo(Pencil),
  procreate: memo(IndexTab),
  nomad: memo(Clay),
  ai: memo(Tag),
  pinterest: memo(Pin),
  vscode: memo(Key),
}
