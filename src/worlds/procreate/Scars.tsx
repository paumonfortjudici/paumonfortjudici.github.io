// What a print leaves behind on the wall when it is picked up: the pin hole, the ghosts of the tape. They sit at the pose the print
// was hung in (the "loose" pose of the current plan) and fade in as soon as the print is away from it.
import { Tape } from '../../components/primitives'
import type { PrintDef } from './data'
import type { Dims, Pose } from './layout'

interface ScarProps {
  def: PrintDef
  dims: Dims
  home: Pose
  away: boolean
}

export function Scar({ def, dims, home, away }: ScarProps) {
  const hold = def.hold
  if (hold.kind === 'clip') return null
  return (
    <span
      className="w-procreate-scar"
      data-away={away ? '' : undefined}
      aria-hidden="true"
      style={{ width: dims.w, height: dims.h, transform: `translate(${home.x}px, ${home.y}px) rotate(${home.rot}deg)` }}
    >
      {hold.kind === 'pin' && <span className="w-procreate-hole" />}
      {hold.kind === 'tape' && hold.pieces.map((piece, i) => <Tape key={i} at={piece.at} color="paper" rotate={piece.rot} w={piece.w} h={piece.h} />)}
    </span>
  )
}
