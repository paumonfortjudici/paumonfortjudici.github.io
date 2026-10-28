// What a print looks like, without the behaviour: the paper, the drawing, the pencil note under it with its arrow, and whatever
// holds it up. The wall puts it inside a draggable button, the close-up inside a plain box at a bigger size (same proportions,
// so the note and its arrow land on the same details).
import { useEffect, useState } from 'react'
import { Scribble } from '../../components/primitives'
import { aimBetween } from './aim'
import { src, type NoteMark, type PrintDef, type Spot } from './data'
import { Holders } from './Holders'
import type { Dims } from './layout'

interface PrintFaceProps {
  def: PrintDef
  dims: Dims
  /** the close-up loads the full file; the wall the small one */
  large?: boolean
  /** load the small file at once (prints that are on the first screen) instead of when they come near it */
  eager?: boolean
  /** delay (ms) before the marks draw themselves */
  drawDelay?: number
  /** id of the note, so a button can describe itself with it */
  noteId?: string
}

/** the note's arrow, from a spot beside the lettering to a spot of the drawing (both given in picture coordinates) */
function aim(dims: Dims, from: Spot, to: Spot) {
  return aimBetween(dims.pad + from[0] * dims.iw, dims.pad + from[1] * dims.ih, dims.pad + to[0] * dims.iw, dims.pad + to[1] * dims.ih)
}

function Mark({ mark, dims, ink, delay }: { mark: NoteMark; dims: Dims; ink: 'ink' | 'oxblood'; delay: number }) {
  if (mark.kind !== 'arrow') return null
  const a = aim(dims, mark.from, mark.to)
  return (
    <span className="w-procreate-ink w-procreate-arrow" aria-hidden="true" style={{ left: a.left, top: a.top, width: a.width }}>
      <Scribble kind="arrow" seed={mark.seed} color={ink} w="100%" stroke={3.3} draw={delay} rotate={a.rotate} />
    </span>
  )
}

/** the close-up shows the small picture at once and swaps in the full one when it has arrived (no blank paper, no double ink) */
function useFullSrc(def: PrintDef, large: boolean): string {
  const [url, setUrl] = useState(() => src.thumb(def))
  useEffect(() => {
    // a print that stays small (see closeUp in data.ts) never loads the full-size file
    if (!large || def.closeUp === 'small') return
    let alive = true
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => {
      if (alive) setUrl(src.full(def))
    }
    img.src = src.full(def)
    return () => {
      alive = false
      img.onload = null
    }
  }, [def, large])
  return url
}

export function PrintFace({ def, dims, large = false, eager = false, drawDelay = 0, noteId }: PrintFaceProps) {
  const note = def.note
  const closeUpSrc = useFullSrc(def, large)
  return (
    <>
      <span className="w-procreate-shadow" aria-hidden="true" />
      <span className="w-procreate-paper" aria-hidden="true" />
      <span className="w-procreate-pic" style={{ left: dims.pad, top: dims.pad, width: dims.iw, height: dims.ih }}>
        {large ? (
          <img className="w-procreate-img" src={closeUpSrc} width={def.w} height={def.h} alt={def.alt} decoding="async" draggable={false} />
        ) : (
          <img
            className="w-procreate-img"
            src={src.thumb(def)}
            srcSet={`${src.thumb(def)} ${def.tw}w, ${src.full(def)} ${def.w}w`}
            sizes={`${Math.round(dims.iw)}px`}
            width={def.tw}
            height={def.th}
            alt=""
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            draggable={false}
          />
        )}
      </span>

      {/* the writing strip: the note is centred in it, whatever the size of the print */}
      <span className="w-procreate-strip" style={{ left: `${note.x}%`, top: dims.pad + dims.ih, height: dims.ch }}>
        <span className="w-procreate-ink w-procreate-note" id={noteId} data-ink={note.ink} style={{ transform: `rotate(${note.rot}deg)` }}>
          {note.text}
          {note.mark.kind === 'underline' && <Scribble kind="underline" at="under" seed={note.mark.seed} color={note.ink} stroke={3.2} draw={drawDelay} />}
        </span>
      </span>
      <Mark mark={note.mark} dims={dims} ink={note.ink} delay={drawDelay} />

      <Holders hold={def.hold} />
    </>
  )
}
