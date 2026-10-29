// The seven tool tokens of the shelf: Pau's old-school blackwork tattoo-flash drawings, cut into their moving parts (public/process/tk/<token>-<part>.webp,
// filed by tools/ingest_tokens.py) and put back together here on a 150 x 150 unit board, so that each one still makes its own little move on hover
// and focus (tokens.css). Every part sits where it sits in the object; a wrapper (`pm-tk-g`, class tk-*) is what moves, around the pivot given in
// board units. The drawings carry no lettering: the tool's name is the button's own text under the picture. No logos and no app icons.
// The board is --tk wide, 160 to 240 px.
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

const Board = ({ children }: { children: ReactNode }) => (
  <span className="pm-tk-svg" aria-hidden="true">
    {children}
  </span>
)

/** the whole Adobe suite: three paint chips on one rivet (a star, an eye and a sun on them) */
function Fan() {
  const chip = (p: string) => {
    const h = hole('adobe', p)
    return <Spr t="adobe" p={p} x={75} y={125} w={54} ax={h.x} ay={h.y} />
  }
  return (
    <Board>
      <G cls="tk-fl" o={[75, 125]}>
        {chip('chipL')}
      </G>
      <G cls="tk-fr" o={[75, 125]}>
        {chip('chipR')}
      </G>
      <G cls="tk-fc" o={[75, 125]}>
        {chip('chipM')}
      </G>
      <Spr t="adobe" p="rivet" x={75} y={125} w={18} />
    </Board>
  )
}

/** pencil and paper: a tiger-striped pencil writing on a scrap of paper */
function Pencil() {
  return (
    <Board>
      <Spr t="pencil" p="paper" x={74} y={106} w={130} />
      <Spr t="pencil" p="scribble" x={74} y={108} w={78} className="tk-scr" />
      <G cls="tk-pen">
        <Spr t="pencil" p="pencil" x={112} y={108} w={116} ax={1} ay={0.5} rot={28} />
      </G>
    </Board>
  )
}

/** Procreate: a plastic index tab on a canvas card, with one brush stroke */
function IndexTab() {
  return (
    <Board>
      <G cls="tk-tab">
        <Spr t="procreate" p="tab" x={75} y={42} w={72} />
      </G>
      <Spr t="procreate" p="card" x={75} y={100} w={128} />
      <Spr t="procreate" p="stroke" x={76} y={98} w={98} className="tk-b1" />
    </Board>
  )
}

/** Nomad Sculpt: a lump of clay with thumbprints, a wire loop tool pressed into it and a little flag on a toothpick */
function Clay() {
  return (
    <Board>
      <G cls="tk-flag" o={[58, 92]}>
        <Spr t="nomad" p="flag" x={58} y={92} w={31} ax={0.1034} ay={1} />
      </G>
      <G cls="tk-clay" o={[66, 146]}>
        <Spr t="nomad" p="clay" x={66} y={106} w={112} />
      </G>
      <G cls="tk-tool">
        <Spr t="nomad" p="tool" x={113} y={105} w={78} rot={135} />
      </G>
    </Board>
  )
}

/** AI tools: a luggage tag with four tattoo symbols to pick from and the tick that picks one */
function Tag() {
  return (
    <Board>
      <G cls="tk-tagg" o={[95, 14]}>
        <Spr t="ai" p="tag" x={95} y={14} w={106} ax={0.6493} ay={0} />
        <Spr t="ai" p="tick" x={82} y={112} w={37} className="tk-tick" />
      </G>
    </Board>
  )
}

/** Pinterest: a photo card held up with a push pin */
function Pin() {
  return (
    <Board>
      <G cls="tk-pcard" o={[74, 40]}>
        <Spr t="pinterest" p="card" x={78} y={90} w={92} />
      </G>
      <G cls="tk-pin" o={[74, 40]}>
        <Spr t="pinterest" p="pin" x={74} y={40} w={29} ax={0.025} ay={1} />
      </G>
    </Board>
  )
}

/** VS Code: a black keyboard key with a pair of curly braces on its top face, each tilted to follow the slant of the key's sides */
function Key() {
  return (
    <Board>
      <G cls="tk-top" o={[75, 146]}>
        <Spr t="vscode" p="base" x={75} y={96} w={136} />
        <G cls="tk-br" o={[75, 68]}>
          <Spr t="vscode" p="braceL" x={58} y={68} w={17.5} rot={11} />
          <Spr t="vscode" p="braceR" x={92} y={68} w={17.5} rot={-11} />
        </G>
      </G>
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
