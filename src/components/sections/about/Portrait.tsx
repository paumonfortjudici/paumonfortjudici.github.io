// The portrait folder: tab "PM · PAU MONFORT", a slide mount with film perforations holding the scrubbable portrait, the film strip
// that scrubs it from the keyboard or a finger, a handwritten hint and the honest caption (an AI-made animated portrait).

import { useCallback, useRef } from 'react'
import { ABOUT } from '../../../lib/copy'
import { useMotion, usePointerFine } from '../../../lib/hooks'
import { Folder, Reveal, Scribble } from '../../primitives'
import { FRAME_COUNT, frameLabel, timecode, type ScrubSource } from './clip'
import { FrameStrip } from './FrameStrip'
import { ScrubVideo, type ScrubHandle } from './ScrubVideo'
import { PORTRAIT } from './text'
import './portrait.css'

/** the hint is always two lines, whatever face is on screen: the hand face arrives late and a wrap that depends on it would move the page */
function twoLines(text: string): [string, string] {
  const cut = text.indexOf(' to ')
  return cut === -1 ? [text, ''] : [text.slice(0, cut), text.slice(cut + 1)]
}

export default function Portrait() {
  const { still } = useMotion()
  const fine = usePointerFine()
  const scrub = useRef<ScrubHandle>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const rangeRef = useRef<HTMLInputElement>(null)
  const printRef = useRef<HTMLSpanElement>(null)
  const lastFrame = useRef(-1)

  // Called for every frame the picture moves; only DOM writes, no React state.
  const onPaint = useCallback((frame: number, progress: number, source: ScrubSource) => {
    rootRef.current?.style.setProperty('--p', progress.toFixed(4))
    if (frame === lastFrame.current) return
    lastFrame.current = frame
    if (printRef.current) printRef.current.textContent = frameLabel(frame)
    const range = rangeRef.current
    if (range) {
      if (source !== 'range') range.value = String(frame)
      range.setAttribute('aria-valuetext', `Frame ${frame + 1} of ${FRAME_COUNT}, ${timecode(frame)}`)
    }
  }, [])

  const [hintA, hintB] = twoLines(still ? PORTRAIT.hint.still : fine ? PORTRAIT.hint.pointer : PORTRAIT.hint.touch)

  return (
    <div className="pm-ab-portrait" ref={rootRef}>
      <Folder
        color="var(--ink)"
        ink="var(--cream)"
        rim={false}
        tab={ABOUT.portraitTab}
        tabX={0.07}
        className="pm-ab-folder"
        bodyClassName="pm-ab-folder__body"
      >
        {/* the picture arrives after the heading: the slide drops into the folder, then the strip follows */}
        <Reveal kind="drop" delay={140}>
          <div className="pm-ab-mount">
            <span className="pm-ab-mount__film" aria-hidden="true" />
            <div className="pm-ab-mount__card">
              <ScrubVideo ref={scrub} still={still} fine={fine} onPaint={onPaint} />
              <p className="pm-ab-mount__print" aria-hidden="true">
                <span ref={printRef}>{frameLabel(0)}</span>
                <span className="pm-ab-mount__year">{PORTRAIT.year}</span>
              </p>
            </div>
          </div>
        </Reveal>
        <Reveal kind="rise" delay={330}>
          <FrameStrip rangeRef={rangeRef} onScrub={(progress) => scrub.current?.drive(progress)} />
        </Reveal>
        <p className="pm-ab-hint" aria-live="polite">
          <Scribble kind="arrow" dir="up-left" w="2.6rem" color="cream" stroke={3} seed="pm-hint" className="pm-ab-hint__arrow" />
          <span className="pm-ab-hint__text">
            <span>{hintA}</span> <span>{hintB}</span>
          </span>
        </p>
        <p className="pm-ab-caption">{PORTRAIT.caption}</p>
      </Folder>
    </div>
  )
}
