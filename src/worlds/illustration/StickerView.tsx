// One sticker: white vinyl margin, the art, two soft shadows, the peeling corner, and (when selected) the caption tag with
// its tape buttons. Everything that moves is written by the Board; React only renders this once per state change.
import { memo, useCallback, type CSSProperties } from 'react'
import { CrossIcon, TabButton } from '../../components/primitives'
import type { Board, TagMode } from './board'
import { CANVAS_H, CANVAS_W, art, stickerInfo, STICKERS } from './data'
import { MinusIcon, PlusIcon, TurnIcon } from './icons'
import { SHAPES } from './shapes.generated'

interface Props {
  n: number
  board: Board
  selected: boolean
  tagMode: TagMode
  held: boolean
  onLid: boolean
  locked: boolean
  onDetails: (n: number) => void
}

const VIEW = `0 0 ${CANVAS_W} ${CANVAS_H}`

function StickerViewImpl({ n, board, selected, tagMode, held, onLid, locked, onDetails }: Props) {
  const info = stickerInfo(n)
  const shape = SHAPES[n]
  const attach = useCallback((el: HTMLDivElement | null) => board.attach(n, el), [board, n])
  const style = { '--accent': info.hex } as CSSProperties
  const label = `${info.caption}. Sticker ${n} of ${STICKERS.length}, ${onLid ? 'on the lid' : 'on the sheet'}.`

  return (
    <div ref={attach} className="w-illustration-stk" data-stk={n} data-locked={locked ? 'true' : undefined} style={style}>
      <button
        type="button"
        className="w-illustration-stk-btn"
        aria-label={label}
        aria-pressed={held}
        aria-describedby={`w-illustration-alt-${n}`}
        onPointerDown={(e) => {
          if (e.pointerType === 'mouse' && e.button !== 0) return
          e.preventDefault()
          e.currentTarget.focus({ preventScroll: true })
          board.pointerDown(n, e.nativeEvent)
        }}
        onKeyDown={(e) => board.keyDown(n, e.nativeEvent)}
        onClick={() => board.activate(n)}
        onFocus={(e) => {
          if (!board.usingPointer() && e.currentTarget.matches(':focus-visible')) board.select(n, 'caption')
        }}
        onBlur={() => board.blurred(n)}
        onContextMenu={(e) => e.preventDefault()}
      >
        <svg className="w-illustration-stk-hit" viewBox={VIEW} focusable="false" aria-hidden="true">
          <path d={shape.d} />
        </svg>
      </button>
      <div className="w-illustration-stk-lift">
        <svg className="w-illustration-stk-shadow w-illustration-stk-shadow--soft" viewBox={VIEW} aria-hidden="true" focusable="false">
          <path d={shape.d} />
        </svg>
        <svg className="w-illustration-stk-shadow w-illustration-stk-shadow--tight" viewBox={VIEW} aria-hidden="true" focusable="false">
          <path d={shape.d} />
        </svg>
        <div className="w-illustration-stk-face" data-part="face">
          <svg className="w-illustration-stk-vinyl" viewBox={VIEW} aria-hidden="true" focusable="false">
            <path d={shape.d} />
          </svg>
          <img
            className="w-illustration-stk-art"
            src={art(info.thumb)}
            srcSet={`${art(info.thumb)} 300w, ${art(info.file)} 1200w`}
            sizes="(min-width: 900px) 15vw, 36vw"
            width={CANVAS_W}
            height={CANVAS_H}
            alt=""
            draggable={false}
            decoding="async"
          />
        </div>
        <svg className="w-illustration-stk-flap" data-part="flap" viewBox={VIEW} aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id={`w-illustration-fg-${n}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" style={{ stopColor: 'var(--wi-flap-fold)' }} />
              <stop offset="0.34" style={{ stopColor: 'var(--wi-flap-mid)' }} />
              <stop offset="1" style={{ stopColor: 'var(--wi-flap-tip)' }} />
            </linearGradient>
          </defs>
          <path d={shape.d} fill={`url(#w-illustration-fg-${n})`} />
        </svg>
      </div>
      {selected && (tagMode === 'full' ? <Adorn n={n} board={board} onLid={onLid} onDetails={onDetails} /> : <Caption n={n} held={held} />)}
    </div>
  )
}

/** keyboard focus: the caption and the keys, nothing to tab through (the sticker's own name already says the caption) */
function Caption({ n, held }: { n: number; held: boolean }) {
  const info = stickerInfo(n)
  return (
    <div className="w-illustration-adorn" aria-hidden="true">
      <div className="w-illustration-tag w-illustration-tag--caption">
        <span className="w-illustration-tag-hole" aria-hidden="true" />
        <p className="w-illustration-tag-caption">{info.caption}</p>
        <p className="w-illustration-tag-keys">
          {held ? (
            <>
              <span>
                <kbd>Arrows</kbd> move
              </span>
              <span>
                <kbd>Space</kbd> stick
              </span>
              <span>
                <kbd>Esc</kbd> put back
              </span>
            </>
          ) : (
            <>
              <span>
                <kbd>Space</kbd> pick up
              </span>
              <span>
                <kbd>R</kbd> turn
              </span>
              <span>
                <kbd>D</kbd> details
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  )
}

/** the caption tag (hangs under the sticker) and the two tape buttons that turn it; upright and unscaled whatever the sticker does */
function Adorn({ n, board, onLid, onDetails }: { n: number; board: Board; onLid: boolean; onDetails: (n: number) => void }) {
  const info = stickerInfo(n)
  return (
    <div className="w-illustration-adorn" data-adorn="">
      {onLid && (
        <>
          <button type="button" className="w-illustration-tape w-illustration-tape--left" aria-label={`Rotate ${info.caption} to the left`} onClick={() => board.rotateBy(n, -20)}>
            <TurnIcon dir="left" />
          </button>
          <button type="button" className="w-illustration-tape w-illustration-tape--right" aria-label={`Rotate ${info.caption} to the right`} onClick={() => board.rotateBy(n, 20)}>
            <TurnIcon dir="right" />
          </button>
        </>
      )}
      <div className="w-illustration-tag" role="group" aria-label={`Caption tag: ${info.caption}`}>
        <span className="w-illustration-tag-hole" aria-hidden="true" />
        <button type="button" className="w-illustration-tag-close" aria-label="Close the tag" onClick={() => board.select(null)}>
          <CrossIcon />
        </button>
        <p className="w-illustration-tag-caption">{info.caption}</p>
        <div className="w-illustration-tag-row">
          <span className="w-illustration-tag-swatch" aria-hidden="true" />
          <span className="w-illustration-tag-meta">
            No. {String(n).padStart(2, '0')} of {String(STICKERS.length).padStart(2, '0')}
          </span>
          {onLid && (
            <span className="w-illustration-tag-size">
              <button type="button" aria-label={`Make ${info.caption} smaller`} onClick={() => board.scaleBy(n, 1 / 1.12)}>
                <MinusIcon />
              </button>
              <button type="button" aria-label={`Make ${info.caption} bigger`} onClick={() => board.scaleBy(n, 1.12)}>
                <PlusIcon />
              </button>
            </span>
          )}
        </div>
        <div className="w-illustration-tag-actions">
          <TabButton size="sm" tone="ink" onClick={() => onDetails(n)}>
            Details
          </TabButton>
          {onLid ? (
            <TabButton size="sm" tone="cream" onClick={() => board.toSheet(n)}>
              Back to sheet
            </TabButton>
          ) : (
            <TabButton size="sm" tone="cream" onClick={() => board.toLid(n)}>
              Stick on lid
            </TabButton>
          )}
        </div>
      </div>
    </div>
  )
}

export const StickerView = memo(StickerViewImpl)
