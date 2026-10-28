// The contact sheet: one small picture per position of the book on a strip of film, in the order of the book. Real buttons;
// the frame on show is aria-current and circled in the marker. The pictures come from one sprite sheet (atlas.webp, 8 x 2).
import { useEffect, useRef, type CSSProperties } from 'react'
import { FilmPerforations, Scribble } from '../../components/primitives'
import atlas from './atlas.webp'
import { RAIL } from './copy'
import { MY_PAGES, SPREADS } from './data'
import { frameLabel } from './helpers'

interface FramesProps {
  current: number
  still: boolean
  onPick: (spread: number) => void
}

const COLS = 8

export default function Frames({ current, still, onPick }: FramesProps) {
  const listRef = useRef<HTMLOListElement>(null)

  // on a phone the strip scrolls sideways: keep the frame on show in view (without ever scrolling the page itself)
  useEffect(() => {
    const list = listRef.current
    const frame = list?.children[current] as HTMLElement | undefined
    if (!list || !frame || list.scrollWidth <= list.clientWidth + 2) return
    const left = frame.offsetLeft - (list.clientWidth - frame.offsetWidth) / 2
    list.scrollTo({ left, behavior: still ? 'auto' : 'smooth' })
  }, [current, still])

  return (
    <section className="w-contract-film" aria-label={RAIL.label} style={{ '--atlas': `url(${atlas})` } as CSSProperties}>
      <FilmPerforations tone="ink" hole="0.68rem" className="w-contract-perf" />
      <ol className="w-contract-frames" ref={listRef}>
        {SPREADS.map((spread, i) => {
          const on = i === current
          const pages = spread.length === 1 ? (spread[0] === 1 ? 'Front cover' : 'Back cover') : `Pages ${spread[0]} and ${spread[1]}`
          // a grease-pencil tick on every position of the book that carries my name
          const mine = spread.some((n) => MY_PAGES.includes(n))
          return (
            <li key={spread.join('-')}>
              <button
                type="button"
                className="w-contract-frame"
                aria-current={on ? 'true' : undefined}
                aria-label={mine ? `${pages}, ${RAIL.mine}` : pages}
                data-cursor="Flip"
                onClick={() => onPick(i)}
                style={{ '--col': i % COLS, '--row': Math.floor(i / COLS) } as CSSProperties}
              >
                <span className="w-contract-frame-pic" aria-hidden="true">
                  {on ? <Scribble key={i} kind="circle" at="around" ratio={1.5} seed={`frame-${i}`} color="var(--c-pencil)" stroke={3.2} className="w-contract-frame-ring" /> : null}
                  {mine ? <Scribble kind="tick" seed={`mine-${i}`} color="var(--c-pencil)" w="1.4rem" stroke={4} draw={200 + i * 40} className="w-contract-frame-tick" /> : null}
                </span>
                <span className="w-contract-frame-no" aria-hidden="true">
                  {frameLabel(spread)}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
      <FilmPerforations tone="ink" hole="0.68rem" className="w-contract-perf" />
    </section>
  )
}
