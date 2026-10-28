// The overview: all five slides as a small contact sheet (film frames with sprocket holes and frame numbers). Pick a frame and
// the lane goes there. The five pictures come from the single wide sheet.webp, cut with background positions.
import { useRef, type KeyboardEvent } from 'react'
import { Scribble, TabButton } from '@/components/primitives'
import { pad2 } from '@/lib/copy'
import { COPY } from './copy'
import { SHEET, SLIDES } from './data'
import { useInert } from './deck'
import { useModal } from './useModal'

interface SheetOverlayProps {
  open: boolean
  onClose: () => void
  index: number
  goTo: (i: number) => void
}

export function SheetOverlay({ open, onClose, index, goTo }: SheetOverlayProps) {
  const listRef = useRef<HTMLOListElement>(null)
  const modal = useModal(open, onClose, () => listRef.current?.querySelector<HTMLElement>('[aria-current="true"]') ?? null)
  const shell = useRef<HTMLDivElement>(null)
  useInert(shell, !open)

  // arrow keys walk the frames (rows of the grid with Up / Down)
  const onKeyDown = (e: KeyboardEvent<HTMLOListElement>) => {
    const list = listRef.current
    if (!list) return
    const cells = Array.from(list.querySelectorAll<HTMLElement>('button'))
    const at = cells.indexOf(document.activeElement as HTMLElement)
    if (at < 0) return
    const columns = Math.max(1, getComputedStyle(list).gridTemplateColumns.split(' ').length)
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowDown' ? columns : e.key === 'ArrowUp' ? -columns : 0
    if (!step && e.key !== 'Home' && e.key !== 'End') return
    e.preventDefault()
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? cells.length - 1 : Math.min(cells.length - 1, Math.max(0, at + step))
    cells[next]?.focus()
  }

  return (
    <div ref={shell} className="w-cp-over" data-kind="sheet" data-open={open ? 'true' : 'false'} aria-hidden={open ? undefined : true}>
      <button type="button" className="w-cp-over-scrim" tabIndex={-1} aria-hidden="true" onClick={onClose} />
      <div ref={modal.ref} className="w-cp-sheetpaper" role="dialog" aria-modal="true" aria-labelledby="w-cp-sheet-title" tabIndex={-1} onKeyDown={modal.onKeyDown}>
        <header className="w-cp-sheet-head">
          <div>
            <h3 id="w-cp-sheet-title" className="w-cp-sheet-title">
              {COPY.sheet.title}
            </h3>
            <p className="w-cp-sheet-sub">{COPY.sheet.sub}</p>
          </div>
          <TabButton size="sm" color="var(--cp-butter)" ink="var(--cp-ink)" icon="cross" iconPosition="before" cursor="Close" onClick={onClose}>
            {COPY.sheet.close}
          </TabButton>
        </header>
        <ol ref={listRef} className="w-cp-reel" onKeyDown={onKeyDown}>
          {SLIDES.map((slide, i) => (
            <li key={slide.n}>
              <button
                type="button"
                className="w-cp-cell"
                data-cursor="Open"
                aria-current={i === index ? 'true' : undefined}
                aria-label={COPY.sheet.frame(slide.n, slide.title)}
                onClick={() => {
                  goTo(i)
                  onClose()
                }}
              >
                <span
                  className="w-cp-cell-img"
                  aria-hidden="true"
                  style={{
                    backgroundImage: `url(${SHEET.src})`,
                    backgroundSize: `${(SHEET.w / SHEET.slideW) * 100}% 100%`,
                    backgroundPositionX: `${(i / (SLIDES.length - 1)) * 100}%`,
                  }}
                />
                <span className="w-cp-cell-meta" aria-hidden="true">
                  <span className="w-cp-cell-n">
                    {pad2(slide.n)}
                    {i === index && <Scribble kind="circle" at="around" color="var(--cp-tomato)" seed={i + 3} stroke={3} />}
                  </span>
                  <span className="w-cp-cell-t">{slide.name}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
