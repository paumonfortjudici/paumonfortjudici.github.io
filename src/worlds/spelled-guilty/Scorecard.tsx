// Exhibit D, second half: the detective's scorecard. All eighty cases of the book as one square each, in a grid that works like
// the printed scorecard: colour = level, a red marker circle = "this one is in the sample pages". Hover, tap or arrow to a square
// and its title, place and year are typed on the slip underneath (titles only: nothing about any solution). Roving tabindex and
// grid-style keys; every square carries its whole label (title, place, level), so the slip is only the visual copy of it.
import { memo, useCallback, useRef, useState, type KeyboardEvent } from 'react'
import { TabButton, Tape } from '@/components/primitives'
import { BOOK_CASES } from './boardLayout'
import { SG } from './copy'
import { CASES } from './data'
import { Stars } from './Reader'
import './sg-score.css'

const pad2 = (n: number): string => String(n).padStart(2, '0')
const level = (d: string): string => SG.reader.difficulty[d as 'easy' | 'medium' | 'hard']

function Scorecard({ onRead }: { onRead: (caseNo: number) => boolean }) {
  const [selected, setSelected] = useState<number | null>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [active, setActive] = useState(0)
  const cells = useRef<(HTMLButtonElement | null)[]>([])

  const shown = hover ?? selected
  const item = shown ? CASES[shown - 1] : null

  /** how many squares make one row right now (the grid is 10 or 6 wide depending on the screen) */
  const columns = useCallback((): number => {
    const first = cells.current[0]
    if (!first) return 10
    const top = first.offsetTop
    let n = 0
    for (const c of cells.current) {
      if (c && c.offsetTop === top) n++
      else if (n) break
    }
    return Math.max(1, n)
  }, [])

  const go = useCallback((to: number) => {
    const i = Math.min(CASES.length - 1, Math.max(0, to))
    setActive(i)
    cells.current[i]?.focus()
  }, [])

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (event.altKey || event.metaKey) return
    const cols = columns()
    const rowStart = i - (i % cols)
    const keys: Record<string, number> = {
      ArrowRight: i + 1,
      ArrowLeft: i - 1,
      ArrowDown: i + cols,
      ArrowUp: i - cols,
      Home: event.ctrlKey ? 0 : rowStart,
      End: event.ctrlKey ? CASES.length - 1 : Math.min(CASES.length - 1, rowStart + cols - 1),
      PageDown: i + cols * 3,
      PageUp: i - cols * 3,
    }
    const to = keys[event.key]
    if (to === undefined) return
    event.preventDefault()
    go(to)
  }

  return (
    <div className="w-sg-scorewrap">
      <div className="w-sg-score">
        <Tape at="top" color="butter" w="5.2rem" h="1.5rem" rotate={-3} />
        <h4 className="w-sg-type w-sg-score__title">{SG.score.title}</h4>
        <p className="w-sg-score__sub">{SG.score.sub}</p>

        <div className="w-sg-score__grid" role="group" aria-label={SG.score.groupLabel} onPointerLeave={() => setHover(null)}>
          {CASES.map((c, i) => {
            const sample = BOOK_CASES.includes(c.n)
            return (
              <button
                key={c.n}
                ref={(node) => {
                  cells.current[i] = node
                }}
                type="button"
                className="w-sg-sq"
                data-l={c.difficulty}
                data-sample={sample ? '' : undefined}
                aria-pressed={selected === c.n}
                aria-label={SG.score.cellLabel(c.n, c.title, c.setting, level(c.difficulty), sample)}
                tabIndex={active === i ? 0 : -1}
                data-cursor="Open"
                onFocus={() => {
                  setActive(i)
                  setSelected(c.n)
                }}
                onClick={() => setSelected(c.n)}
                onPointerEnter={(event) => {
                  if (event.pointerType === 'mouse') setHover(c.n)
                }}
                onKeyDown={(event) => onKeyDown(event, i)}
              >
                <span aria-hidden="true">{pad2(c.n)}</span>
              </button>
            )
          })}
        </div>

        <p className="w-sg-score__legend w-sg-type" aria-hidden="true">
          <span data-l="easy">{SG.score.legend.easy}</span>
          <span data-l="medium">{SG.score.legend.medium}</span>
          <span data-l="hard">{SG.score.legend.hard}</span>
        </p>

        {/* the slip: what the pointer is over, or the last square picked */}
        <div className="w-sg-slip" aria-hidden="true">
          {item ? (
            <>
              <p className="w-sg-type w-sg-slip__kicker">
                <span>{SG.score.kicker(item.n, level(item.difficulty))}</span>
                <Stars level={item.difficulty} />
              </p>
              <p className="w-sg-slip__title">{item.title}</p>
              <p className="w-sg-slip__line">{item.setting}</p>
            </>
          ) : (
            <p className="w-sg-slip__title w-sg-slip__title--empty">{SG.score.empty}</p>
          )}
        </div>
        <div className="w-sg-score__act">
          {selected && BOOK_CASES.includes(selected) && hover === null ? (
            <TabButton size="sm" tone="ink" icon="arrow-right" cursor="Flip" onClick={() => onRead(selected)}>
              {SG.score.read}
            </TabButton>
          ) : null}
        </div>
      </div>
      <p className="w-sg-keys">{SG.score.keys}</p>
    </div>
  )
}

// the synopsis re-renders on every keystroke; the scorecard next to it must not
export default memo(Scorecard)
