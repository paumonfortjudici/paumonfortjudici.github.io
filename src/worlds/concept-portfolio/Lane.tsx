// The lane: five paper mounts in a horizontal scroll-snap strip. Each mount is a thin paper mat with the slide in it, a strip of
// washi tape and a caption slate ("SLIDE 02 / 05  ABOUT") on its lower margin. Not a phone, no notch.
import { useEffect, useId, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { Stamp, Tape, TabButton } from '@/components/primitives'
import { COPY } from './copy'
import { SLIDES, type Slide } from './data'
import { useDeck } from './deck'
import { LoupeIcon } from './icons'
import { SlideView } from './SlideView'
import type { LaneApi } from './useLane'

const TAPE = ['var(--cp-salmon)', 'var(--cp-sun)', 'var(--cp-salmon)', 'var(--cp-sun)', 'var(--cp-salmon)']
const TAPE_TILT = [-4, 3, -2.5, 4, -3.5]

interface MountProps {
  slide: Slide
  i: number
  current: boolean
  api: LaneApi
  onLoupe: () => void
}

/** the loupe tab pulses once and a small tag points at it, for a few seconds after the room opens (tiny print is the lane's one weakness) */
function useLoupeHint(zoom: boolean): boolean {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const show = window.setTimeout(() => setOn(true), 1800)
    const hide = window.setTimeout(() => setOn(false), 9000)
    return () => {
      window.clearTimeout(show)
      window.clearTimeout(hide)
    }
  }, [])
  return on && !zoom
}

function Mount({ slide, i, current, api, onLoupe }: MountProps) {
  const deck = useDeck()
  const hint = useLoupeHint(deck.zoom || deck.notes)
  return (
    <div
      ref={api.mount(i)}
      className="w-cp-mount"
      data-current={current ? 'true' : 'false'}
      data-field={slide.field}
      style={{ '--i': i } as CSSProperties}
      role="group"
      aria-roledescription={COPY.lane.slideRole}
      aria-label={COPY.lane.slideLabel(slide.n, slide.title)}
    >
      <div className="w-cp-paper">
        <Tape at="top" color={TAPE[i]} rotate={TAPE_TILT[i]} w="5.6rem" h="1.7rem" />
        <SlideView slide={slide} current={current} loading={i < 3 ? 'eager' : 'lazy'} priority={i === 0} />
        {current && (
          <div className="w-cp-ctag">
            <Tape at="tr" color="var(--cp-sun)" rotate={34} w="3.2rem" h="1.2rem" />
            <Stamp text="Concept" sub="Invented client" tone="ink" rotate={-3} size="1.05rem" thump={false} />
          </div>
        )}
        <div className="w-cp-mat">
          <p className="w-cp-slate" aria-hidden="true">
            <span className="w-cp-slate-n">{COPY.lane.caption(slide.n)}</span>
            <span className="w-cp-slate-t">{slide.name}</span>
          </p>
          {current && hint && (
            <span className="w-cp-loupehint" aria-hidden="true">
              {COPY.loupe.hint}
            </span>
          )}
          {current && (
            <TabButton
              size="sm"
              className="w-cp-loupebtn"
              data-hint={hint ? 'true' : undefined}
              color="var(--cp-deep)"
              ink="var(--cp-butter)"
              icon={<LoupeIcon />}
              iconPosition="before"
              selected={deck.zoom}
              aria-pressed={deck.zoom}
              onClick={onLoupe}
            >
              {COPY.loupe.button}
            </TabButton>
          )}
        </div>
        {!current && (
          <button type="button" className="w-cp-hit" data-cursor="Flip" tabIndex={-1} aria-label={COPY.lane.goTo(slide.n, slide.title)} onClick={() => deck.goTo(i)} />
        )}
        <span ref={api.scrim(i)} className="w-cp-scrim" aria-hidden="true" />
      </div>
    </div>
  )
}

interface LaneProps {
  api: LaneApi
  onLoupe: () => void
}

export function Lane({ api, onLoupe }: LaneProps) {
  const hintId = useId()
  const { goTo } = api
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || e.altKey || e.ctrlKey || e.metaKey) return
    if (e.key === 'Enter') {
      e.preventDefault()
      onLoupe()
    } else if (e.key === 'Home') {
      e.preventDefault()
      goTo(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      goTo(SLIDES.length - 1)
    }
  }
  return (
    <>
      <p id={hintId} className="pm-sr">
        {COPY.loupe.laneHint}
      </p>
      <div
        ref={api.laneRef}
        className="w-cp-lane"
        data-cursor="Drag"
        role="group"
        aria-roledescription={COPY.lane.roleDescription}
        aria-label={COPY.lane.label}
        aria-describedby={hintId}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {SLIDES.map((slide, i) => (
          <Mount key={slide.n} slide={slide} i={i} current={api.index === i} api={api} onLoupe={onLoupe} />
        ))}
      </div>
    </>
  )
}
