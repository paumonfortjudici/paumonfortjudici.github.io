// Wall furniture: things pinned to the wall of the bar around the board, so the wall beside it is never an empty plum field. A bar receipt
// (the usage ratios, tallied) hangs on the right and a card of paint chips on the left. Both live in board space (they pan and zoom with the
// board), are sized in screen pixels at the fit view (--p = board units per screen px at the fit), and fade away once the visitor zooms in
// or picks a part of the board. Decorative and aria-hidden: the same facts are in the brand kit and the panel.
import type { CSSProperties } from 'react'
import { BOARD_W, COLOURS, EXPRESSIONS, headThumb } from './data'

interface FurnitureProps {
  /** show it: the camera is at the fit and nothing is selected */
  on: boolean
  /** the fit scale (screen px per board unit) */
  fit: number
  /** free wall to the left and to the right of the board at the fit, in screen px */
  left: number
  right: number
  /** the canvas is tall enough for the card of paint chips under the chip rail */
  tall: boolean
}

/** a heading for the receipt's tally, like the totals on a till roll */
const TALLY = COLOURS.reduce((n, c) => n + c.ratio, 0)

export default function Furniture({ on, fit, left, right, tall }: FurnitureProps) {
  if (fit <= 0) return null
  const showLeft = left >= 170 && tall
  const showRight = right >= 130
  if (!showLeft && !showRight) return null
  const style = { '--p': (1 / fit).toFixed(4) } as CSSProperties
  const chipW = Math.min(300, left - 34)
  // the receipt tucks 34 px under the board's edge, so it can be wide enough to read
  const rcptW = Math.min(190, right + 20)
  const showFaces = showRight && tall
  return (
    <div className="w-concept-brand-furn" data-on={on ? 'true' : 'false'} style={style} aria-hidden="true">
      {showLeft && (
        <div className="w-concept-brand-chipcard" style={{ '--w': chipW, '--k': (chipW / 300).toFixed(3) } as CSSProperties}>
          <i className="w-concept-brand-furn-pin" />
          <p className="w-concept-brand-chipcard-head">Paint chips</p>
          <ul>
            {COLOURS.map((c) => (
              <li key={c.id}>
                <span className="w-concept-brand-chipcard-block" style={{ background: c.hex }} />
                <span className="w-concept-brand-chipcard-name">{c.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {showRight && (
        <div
          className="w-concept-brand-receipt"
          style={
            {
              '--w': rcptW,
              '--k': (rcptW / 190).toFixed(3),
              left: BOARD_W,
            } as CSSProperties
          }
        >
          <i className="w-concept-brand-furn-tape" />
          <div className="w-concept-brand-receipt-paper">
            <p className="w-concept-brand-receipt-brand">gotet</p>
            <p className="w-concept-brand-receipt-sub">Usage tally</p>
            <ul>
              {COLOURS.map((c) => (
                <li key={c.id}>
                  <i style={{ background: c.hex }} />
                  <span>{c.name}</span>
                  <b>{c.ratio}</b>
                </li>
              ))}
            </ul>
            <p className="w-concept-brand-receipt-total">
              <span>Total</span>
              <b>{TALLY}%</b>
            </p>
            <p className="w-concept-brand-receipt-foot">Concept, 2026. An invented bar.</p>
          </div>
        </div>
      )}
      {showFaces && (
        <div className="w-concept-brand-faces-sheet" style={{ '--w': rcptW, '--k': (rcptW / 190).toFixed(3), left: BOARD_W } as CSSProperties}>
          <i className="w-concept-brand-furn-tape" />
          <p className="w-concept-brand-faces-head">Four faces</p>
          <ul>
            {EXPRESSIONS.map((e) => (
              <li key={e.code} data-who={e.who}>
                <img src={headThumb(e.who, e.head)} width={360} height={360} alt="" loading="lazy" decoding="async" draggable={false} />
                <span>
                  {e.code} {e.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
