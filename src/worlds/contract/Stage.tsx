// The middle of the table: the slug line, the book on its press sheet (crop marks, registration targets, a ruler drawn to the
// scale of the pages) and the deck under it: the caption of the spread on show, the scrubber and the previous / next tabs.
import { useLayoutEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { FlipBook, type FlipBookHandle, type FlipPage, type FlipSpreadInfo } from '../../components/flip'
import { CropMarks, RegMark, TabButton } from '../../components/primitives'
import { BOOK_LABEL, CAPTIONS, RULER, SLUG } from './copy'
import { PAGES, SPREADS, TOTAL_PAGES } from './data'
import { pageId, pageIndex, proofLabel } from './helpers'

interface StageProps {
  bookRef: RefObject<FlipBookHandle>
  pages: FlipPage[]
  info: FlipSpreadInfo | null
  single: boolean
  /** spread the book starts on */
  start: number
  onSpread: (info: FlipSpreadInfo) => void
  /** the "Find my name" tab for the deck: it only shows on a phone, where it sits between Back and Next */
  find?: ReactNode
  /** the "Read closer" tab: it sits at the right end of the slug line */
  read?: ReactNode
}

const LAST_SPREAD = SPREADS.length - 1

type Kind = 'spread' | 'cover' | 'single'
const KINDS: Kind[] = ['spread', 'cover', 'single']

export default function Stage({ bookRef, pages, info, single, start, onSpread, find, read }: StageProps) {
  const stageRef = useRef<HTMLDivElement>(null)

  // Where the book's frame is inside the stage, in px: the crop marks, the targets and the ruler hang from these four numbers.
  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const measure = () => {
      const frame = stage.querySelector<HTMLElement>('.pm-flip__frame')
      if (!frame) return
      const s = stage.getBoundingClientRect()
      const f = frame.getBoundingClientRect()
      stage.style.setProperty('--fx', `${(f.left - s.left).toFixed(2)}px`)
      stage.style.setProperty('--fy', `${(f.top - s.top).toFixed(2)}px`)
      stage.style.setProperty('--fw', `${f.width.toFixed(2)}px`)
      stage.style.setProperty('--fh', `${f.height.toFixed(2)}px`)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(stage)
    const root = stage.querySelector('.pm-flip')
    if (root) ro.observe(root)
    return () => ro.disconnect()
  }, [])

  const index = info?.index ?? 0
  const label = proofLabel(info)
  const closed = !single && (index === 0 || index === LAST_SPREAD)
  const kind: Kind = single ? 'single' : closed ? 'cover' : 'spread'

  // the scrubber counts spreads in the two-page book and pages in the single-page book
  const first = info?.pages[0]?.n ?? 1
  const pos = single ? Math.max(0, pageIndex(first)) : index
  const max = single ? PAGES.length - 1 : LAST_SPREAD
  const atStart = pos <= 0
  const atEnd = pos >= max
  const go = (v: number) => {
    if (single) {
      const page = PAGES[v]
      if (page) bookRef.current?.goToPage(pageId(page.n))
    } else bookRef.current?.goTo(v)
  }

  return (
    <div className="w-contract-stage" ref={stageRef} data-kind={kind}>
      <div className="w-contract-head">
      <p className="w-contract-slug">
        <span className="w-contract-slug-seg">
          {SLUG.title}
          <i aria-hidden="true">/</i>
        </span>
        <span className="w-contract-slug-seg w-contract-slug-more">
          {SLUG.issue}
          <i aria-hidden="true">/</i>
        </span>
        <span className="w-contract-slug-seg">
          <span className="w-contract-slug-live">Proof {label}</span>
          <i aria-hidden="true">/</i>
        </span>
        <span className="w-contract-slug-seg w-contract-slug-more">{SLUG.year}</span>
      </p>
      {read}
      </div>

      <div className="w-contract-book">
        <FlipBook
          ref={bookRef}
          pages={pages}
          totalPages={TOTAL_PAGES}
          aspect={1000 / 1331}
          gloss={0.55}
          keys="window"
          controls={false}
          mode={single ? 'single' : 'spread'}
          defaultPage={start}
          aria-label={BOOK_LABEL}
          onSpreadChange={onSpread}
        />
      </div>
      <Trim kind={kind} />
      <Ruler kind={kind} />

      <div className="w-contract-deck">
        {/* every caption sits in the same grid cell and only the one on show is visible: the cell is as tall as the longest, so
            turning the page never moves what is under the book */}
        <div className="w-contract-captions">
          {CAPTIONS.map((text, i) => (
            <p key={i} className="w-contract-caption" data-on={i === index ? '' : undefined} aria-hidden={i === index ? undefined : true}>
              {text}
            </p>
          ))}
        </div>
        <TabButton
          size="md"
          tone="ink"
          icon="arrow-left"
          iconPosition="before"
          cursor="Flip"
          className="w-contract-deck-prev"
          aria-disabled={atStart || undefined}
          onClick={() => (atStart ? undefined : bookRef.current?.prev())}
        >
          {single ? 'Back' : 'Previous'}
        </TabButton>
        {find ? <div className="w-contract-deck-find">{find}</div> : null}
        <input
          className="w-contract-range"
          type="range"
          min={0}
          max={max}
          step={1}
          value={pos}
          aria-label={single ? 'Go to page' : 'Go to spread'}
          aria-valuetext={info?.text}
          style={{ '--fill': `${max > 0 ? (pos / max) * 100 : 0}%` } as CSSProperties}
          onChange={(e) => go(Number(e.target.value))}
        />
        <TabButton
          size="md"
          tone="ink"
          icon="arrow-right"
          iconPosition="after"
          cursor="Flip"
          className="w-contract-deck-next"
          aria-disabled={atEnd || undefined}
          onClick={() => (atEnd ? undefined : bookRef.current?.next())}
        >
          Next
        </TabButton>
      </div>
    </div>
  )
}

/** Trim marks and registration targets around the pages on show: the open book gets the whole spread, a closed one just its cover. */
function Trim({ kind }: { kind: Kind }) {
  return (
    <>
      {KINDS.map((k) => (
        <div key={k} className="w-contract-trim" data-kind={k} data-on={kind === k ? '' : undefined} aria-hidden="true">
          <CropMarks gap="5px" len="15px" />
          <RegMark size="1.2rem" className="w-contract-reg" />
          <RegMark size="1.2rem" className="w-contract-reg" />
        </div>
      ))}
    </>
  )
}

/** A rule laid under the book. 1 cm on it is 1 cm of the printed page (a page is 209 mm wide), whatever the screen size. */
function Ruler({ kind }: { kind: Kind }) {
  const mm: Record<Kind, number> = { spread: 418, cover: 209, single: 209 }
  return (
    <>
      {KINDS.map((k) => (
        <div key={k} className="w-contract-ruler" data-kind={k} data-on={kind === k ? '' : undefined} aria-hidden="true">
          {Array.from({ length: Math.floor(mm[k] / 50) + 1 }, (_, i) => (
            <span key={i} style={{ '--i': i } as CSSProperties}>
              {i === 0 ? `0 ${RULER.unit}` : i * 5}
            </span>
          ))}
        </div>
      ))}
    </>
  )
}
