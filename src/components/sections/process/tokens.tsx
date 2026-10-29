// The seven tool tokens of the shelf: Pau's old-school blackwork tattoo-flash drawings, cut into their moving parts (public/process/tk/<token>-<part>.webp,
// filed by tools/ingest_tokens.py) and put back together here on a 150 x 150 unit board, so that each one still makes its own little move on hover
// and focus (tokens.css). Every part sits where it sits in the object; a wrapper (`pm-tk-g`, class tk-*) is what moves, around the pivot given in
// board units. Each icon carries the tool's name in real type on its blank ribbon banner (decoration, aria-hidden: the button has the real name).
// No logos and no app icons. The board is shown 150 to 240 px wide, so the 13px names stay 13px.
import { memo, type ComponentType, type CSSProperties, type ReactNode } from 'react'
import { asset } from '../../../lib/asset'
import type { ToolId } from './data'
import { SPRITES } from './tokens.sprites'

const U = 150

type Token = Exclude<keyof typeof SPRITES, 'bin'>
type Sizes = Record<string, Record<string, { w: number; h: number; holes?: readonly { x: number; y: number }[] }>>
const SIZES = SPRITES as unknown as Sizes

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

/** the blank ribbon banner at the foot of every icon and the tool's name written on it */
function Banner({ t, name }: { t: Token; name: string }) {
  return (
    <>
      <Spr t={t} p="banner" x={75} y={130} w={128} />
      <span className="pm-tk-lab" data-long={name.length > 9 ? '' : undefined}>{name}</span>
    </>
  )
}

const Board = ({ children }: { children: ReactNode }) => (
  <span className="pm-tk-svg" aria-hidden="true">
    {children}
  </span>
)

/** the whole Adobe suite: three paint chips on one rivet, a star, an eye and a sun on them */
function Fan() {
  const chip = (p: string) => {
    const h = hole('adobe', p)
    return <Spr t="adobe" p={p} x={75} y={98} w={41} ax={h.x} ay={h.y} />
  }
  return (
    <Board>
      <G cls="tk-fl" o={[75, 98]}>
        {chip('chipL')}
      </G>
      <G cls="tk-fr" o={[75, 98]}>
        {chip('chipR')}
      </G>
      <G cls="tk-fc" o={[75, 98]}>
        {chip('chipM')}
      </G>
      <Spr t="adobe" p="rivet" x={75} y={98} w={15} />
      <Banner t="adobe" name="ADOBE" />
    </Board>
  )
}

/** pencil and paper: a stub of pencil, tiger-striped, on a scrap of paper, mid-scribble */
function Pencil() {
  return (
    <Board>
      <Spr t="pencil" p="paper" x={75} y={82} w={100} />
      <Spr t="pencil" p="scribble" x={74} y={96} w={78} className="tk-scr" />
      <G cls="tk-pen">
        <Spr t="pencil" p="pencil" x={70} y={62} w={96} rot={22} />
      </G>
      <Banner t="pencil" name="PENCIL" />
    </Board>
  )
}

/** Procreate: a plastic index tab on a canvas card, with one brush stroke */
function IndexTab() {
  return (
    <Board>
      <G cls="tk-tab">
        <Spr t="procreate" p="tab" x={75} y={41} w={56} />
      </G>
      <Spr t="procreate" p="card" x={75} y={78} w={92} />
      <Spr t="procreate" p="stroke" x={76} y={80} w={74} className="tk-b1" />
      <Banner t="procreate" name="PROCREATE" />
    </Board>
  )
}

/** Nomad Sculpt: a lump of clay with thumbprints, a wire loop tool and a flag on a toothpick */
function Clay() {
  return (
    <Board>
      <G cls="tk-flag" o={[70, 58]}>
        <Spr t="nomad" p="flag" x={70} y={58} w={26.5} ax={0.1034} ay={1} />
      </G>
      <G cls="tk-clay" o={[62, 109]}>
        <Spr t="nomad" p="clay" x={62} y={82} w={70} />
      </G>
      <G cls="tk-tool">
        <Spr t="nomad" p="tool" x={103} y={84} w={66} rot={135} />
      </G>
      <Banner t="nomad" name="NOMAD SCULPT" />
    </Board>
  )
}

/** AI tools: a luggage tag with four tattoo symbols to pick from, and the tick that picks one */
function Tag() {
  return (
    <Board>
      <G cls="tk-tagg" o={[75, 19]}>
        <Spr t="ai" p="tag" x={75} y={19} w={71} ax={0.6493} ay={0} />
        <Spr t="ai" p="tick" x={68} y={88} w={28} className="tk-tick" />
      </G>
      <Banner t="ai" name="AI TOOLS" />
    </Board>
  )
}

/** Pinterest: a reference card held to the wall with a push pin */
function Pin() {
  return (
    <Board>
      <G cls="tk-pcard" o={[75, 28]}>
        <Spr t="pinterest" p="card" x={74} y={64} w={68} />
      </G>
      <G cls="tk-pin" o={[70, 33]}>
        <Spr t="pinterest" p="pin" x={70} y={33} w={20} ax={0.025} ay={1} />
      </G>
      <Banner t="pinterest" name="PINTEREST" />
    </Board>
  )
}

/** VS Code: a keyboard key with a pair of curly braces */
function Key() {
  return (
    <Board>
      <Spr t="vscode" p="base" x={75} y={84} w={78} />
      <G cls="tk-top">
        <Spr t="vscode" p="cap" x={75} y={50} w={56} />
        <G cls="tk-br" o={[75, 50]}>
          <Spr t="vscode" p="braceL" x={63} y={50} w={14} />
          <Spr t="vscode" p="braceR" x={87} y={50} w={14} />
        </G>
      </G>
      <Banner t="vscode" name="VS CODE" />
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
