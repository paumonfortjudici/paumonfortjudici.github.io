// What holds a print to the wall: pieces of tape, a push pin or a paper clip. Shared by the wall and the close-up.
import { PaperClip, Pin, Tape } from '../../components/primitives'
import type { Hold } from './data'

export function Holders({ hold }: { hold: Hold }) {
  if (hold.kind === 'tape') {
    return (
      <>
        {hold.pieces.map((piece, i) => (
          <Tape key={i} at={piece.at} color={piece.color} pattern={piece.pattern} rotate={piece.rot} w={piece.w} h={piece.h} />
        ))}
      </>
    )
  }
  if (hold.kind === 'pin') return <Pin className="w-procreate-pin" color={hold.color} size="2.3rem" />
  return <PaperClip className="w-procreate-clip" color={hold.color} rotate={hold.rot} size="4.6rem" />
}
