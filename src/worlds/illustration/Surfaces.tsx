// The two surfaces of the board: the aluminium laptop lid and the cream sticker sheet with its die-cut ghosts.
// Both are decorative (aria-hidden): the stickers themselves are the buttons. The board measures the two `data-frame` boxes.
import { forwardRef, type CSSProperties, type ReactNode } from 'react'
import { CANVAS_H, CANVAS_W, SLOTS, SLOT_UNIT, stickerInfo, type Slot } from './data'
import { SHAPES } from './shapes.generated'

/**
 * The ref goes to the frame: it is the box the board measures AND the box that tips when Gravity is on (lid and hinge together).
 * `tabs` are real controls that stand on the lid's top edge like folder tabs ("Save my laptop"); `footer` is the control row under
 * the lid (it is exactly as wide as the lid); `badge` is the stamp that stands on the lid's top edge at the left. All three live outside the aria-hidden frame.
 */
export const Lid = forwardRef<HTMLDivElement, { tabs?: ReactNode; footer?: ReactNode; badge?: ReactNode }>(function Lid({ tabs, footer, badge }, ref) {
  return (
    <div className="w-illustration-lidwrap">
      <div className="w-illustration-lidbox">
        {badge && <div className="w-illustration-lidbadge">{badge}</div>}
        {tabs && <div className="w-illustration-lidtabs">{tabs}</div>}
        <div className="w-illustration-lidframe" data-frame="lid" aria-hidden="true" ref={ref}>
          <div className="w-illustration-lid">
            <span className="w-illustration-sheen" />
          </div>
          <div className="w-illustration-hinge">
            <span className="w-illustration-hinge-long">Concept: invented characters</span>
            <span className="w-illustration-hinge-short">Concept: invented</span>
          </div>
        </div>
      </div>
      {footer}
    </div>
  )
})

function Ghost({ slot }: { slot: Slot }) {
  const size = SLOT_UNIT * slot.mult * 100
  // the label sits on the widest stretch of the silhouette (computed with the shapes), so it stays inside the dashed line
  const [lx, ly, run] = SHAPES[slot.n].lab
  const labelStyle = { left: `${(lx / CANVAS_W) * 100}%`, top: `${(ly / CANVAS_H) * 100}%`, width: `${((run * 0.84) / CANVAS_W) * 100}%` } as CSSProperties
  const style = {
    left: `${slot.cx * 100 - size / 2}%`,
    top: `${slot.cy * 100 - size / 2}%`,
    width: `${size}%`,
    height: `${size}%`,
    transform: `rotate(${slot.angle}deg)`,
  } as CSSProperties
  return (
    <span className="w-illustration-ghost" style={style} data-ghost={slot.n} data-home="true">
      <svg viewBox="0 0 1200 1600" focusable="false">
        <path d={SHAPES[slot.n].d} />
      </svg>
      <span className="w-illustration-ghost-label" style={labelStyle}>
        <span className="w-illustration-ghost-n">{String(slot.n).padStart(2, '0')}</span>
        <span className="w-illustration-ghost-cap">{stickerInfo(slot.n).caption}</span>
      </span>
    </span>
  )
}

export function Sheet() {
  return (
    <div className="w-illustration-sheetframe" data-frame="sheet" aria-hidden="true">
      <div className="w-illustration-paper">
        <div className="w-illustration-paperface">
          {SLOTS.map((s) => (
            <Ghost key={s.n} slot={s} />
          ))}
        </div>
        <span className="w-illustration-curl">
          <span className="w-illustration-curl-flap" />
        </span>
      </div>
    </div>
  )
}
