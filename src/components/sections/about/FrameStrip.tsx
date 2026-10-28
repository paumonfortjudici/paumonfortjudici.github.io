// The film strip under the portrait: the 12 thumbnails of the clip on a perforated strip, with a real <input type="range"> over it.
// It is the keyboard and touch twin of the pointer scrub (arrows = one frame, PageUp / PageDown = a tenth, Home / End), and it
// shows where the portrait is: a grease-pencil oval rides along the strip (its position is the CSS variable --p, written on the
// portrait root every frame, so nothing re-renders; the playhead on the frame reads the same variable).

import type { CSSProperties, Ref } from 'react'
import { asset } from '../../../lib/asset'
import { FilmPerforations, Scribble } from '../../primitives'
import { FRAME_COUNT, LAST, THUMB_FRAMES, timecode } from './clip'
import { PORTRAIT } from './text'

export interface FrameStripProps {
  rangeRef: Ref<HTMLInputElement>
  /** progress 0..1 chosen by the visitor (drag, click, arrow keys) */
  onScrub: (progress: number) => void
}

const pad2 = (n: number): string => String(n).padStart(2, '0')

export function FrameStrip({ rangeRef, onScrub }: FrameStripProps) {
  return (
    <div className="pm-ab-strip">
      <FilmPerforations tone="cream" hole="0.62rem" />
      <div className="pm-ab-strip__frames">
        {THUMB_FRAMES.map((frame, i) => (
          <img
            key={frame}
            className="pm-ab-strip__f"
            style={{ '--i': i } as CSSProperties}
            src={asset(`/about/frames/f-${pad2(i + 1)}.webp`)}
            width={240}
            height={300}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        ))}
        <span className="pm-ab-strip__mark" aria-hidden="true">
          <Scribble kind="circle" at="around" color="tomato" stroke={3.2} seed="pm-selected-frame" />
        </span>
        <input
          ref={rangeRef}
          className="pm-ab-strip__range"
          type="range"
          min={0}
          max={LAST}
          step={1}
          defaultValue={0}
          aria-label={PORTRAIT.scrub}
          aria-valuetext={`Frame 1 of ${FRAME_COUNT}, ${timecode(0)}`}
          data-cursor="Drag"
          onInput={(event) => {
            const value = Number(event.currentTarget.value)
            event.currentTarget.setAttribute('aria-valuetext', `Frame ${value + 1} of ${FRAME_COUNT}, ${timecode(value)}`)
            onScrub(value / LAST)
          }}
        />
      </div>
      <FilmPerforations tone="cream" hole="0.62rem" />
    </div>
  )
}
