// The board as an object on the wall: 3000 x 4243 board units, hung with four bits of tape. The top zone is live (TopZone); the lower
// part is the finished board art (a small copy first, the full 3000 px file once you zoom), with the real 2x mockups and posters laid
// over it when you are close enough to see them.
import { forwardRef, useEffect, useState, type CSSProperties } from 'react'
import { BOARD_H, BOARD_W, IMG, NONE, PANEL_Y, SCALLOP_BOTTOM, mascotImg, MASCOTS, type ColourwayId, type MascotId, type Rect, type Selection } from './data'
import { Bubbles, Detail, Highlight, Hotspots, Tapes } from './BoardLayers'
import { preloadPoses, type Speech } from './speech'
import TopZone from './TopZone'

interface BoardProps {
  sel: Selection
  /** the camera has landed on the selection: the dim and the marker may appear */
  landed: boolean
  colourway: ColourwayId
  still: boolean
  /** zoomed in enough that the 2x art is worth loading */
  detail: boolean
  /** the part of the board in view, in board units (null until the first measure) */
  view: Rect | null
  /** load the full 3000 px board art */
  full: boolean
  speech: Speech
  chosen: MascotId | null
  onSelect: (sel: Selection) => void
  onEnsureVisible: (rect: Rect) => void
  wasDrag: () => boolean
  style?: CSSProperties
}

const Board = forwardRef<HTMLDivElement, BoardProps>(function Board(
  { sel, landed, colourway, still, detail, view, full, speech, chosen, onSelect, onEnsureVisible, wasDrag, style },
  ref,
) {
  const [smallReady, setSmallReady] = useState(false)
  const [fullReady, setFullReady] = useState(false)
  useEffect(() => preloadPoses(MASCOTS.map((m) => mascotImg(m.id, 'b'))), [])
  const wallpaper = sel.group === 'pattern' && !sel.item
  return (
    <div ref={ref} className="w-concept-brand-board" style={{ width: BOARD_W, height: BOARD_H, ...style }} data-cursor="Drag">
      <div className="w-concept-brand-sheet">
        <div className="w-concept-brand-panel-bg" style={{ top: PANEL_Y, height: BOARD_H - PANEL_Y }} aria-hidden="true" />
        <img
          className="w-concept-brand-lower"
          data-ready={smallReady ? 'true' : undefined}
          src={IMG.boardBottomSmall}
          alt=""
          width={BOARD_W}
          height={BOARD_H - SCALLOP_BOTTOM}
          decoding="async"
          draggable={false}
          style={{ top: SCALLOP_BOTTOM }}
          onLoad={() => setSmallReady(true)}
        />
        {full && (
          <img
            className="w-concept-brand-lower"
            data-ready={fullReady ? 'true' : undefined}
            src={IMG.boardBottom}
            alt=""
            width={BOARD_W}
            height={BOARD_H - SCALLOP_BOTTOM}
            decoding="async"
            draggable={false}
            style={{ top: SCALLOP_BOTTOM }}
            onLoad={() => setFullReady(true)}
          />
        )}
        <Detail on={detail} view={view} />
        <TopZone colourway={colourway} wallpaper={wallpaper} active={speech.active} hop={speech.hop} still={still} chosen={chosen} />
        <Highlight sel={landed ? sel : NONE} />
        <Hotspots sel={sel} speech={speech} onSelect={onSelect} onEnsureVisible={onEnsureVisible} wasDrag={wasDrag} />
        <Bubbles speech={speech} />
      </div>
      <Tapes />
    </div>
  )
})

export default Board
