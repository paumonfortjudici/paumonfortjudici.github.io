// "Pause motion": a small tab with a drawn film reel. The reel turns while motion plays and stops when it is paused
// (it carries the pm-ambient class, so the OS setting and this very switch both stop it). A real <button aria-pressed>:
// the name stays "Pause motion" (a toggle never renames itself), `aria-pressed` says whether it is paused.
// When the OS asks for reduced motion the visitor cannot override it: the tab is disabled and says why, in plain text.
// Lives in the index-tab rail and in the footer (variant 'rail' | 'foot').

import { toggleMotionPaused, useMotion } from '../../lib/motion'
import { UI } from '../../lib/copy'
import { CHROME } from './strings'

const HOLES = [0, 1, 2, 3, 4].map((i) => {
  const a = ((i * 72 - 90) * Math.PI) / 180
  return { x: 12 + 5.7 * Math.cos(a), y: 12 + 5.7 * Math.sin(a) }
})

/**
 * A reel drawn with a slightly unsteady hand: rim, hub and five lightening holes. `paused` swaps the holes for the two
 * bars of a pause sign, so the state reads in the picture itself (a turning reel = motion plays, bars = it is paused).
 */
export function ReelGlyph({ className, paused = false }: { className?: string; paused?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.1 2.1C17.7 1.9 22.1 6.3 21.9 12C22 17.7 17.8 22.1 12 21.9C6.2 22.1 1.9 17.8 2.1 12C1.9 6.3 6.3 2 12.1 2.1Z" />
      {paused ? (
        <>
          <path d="M9.2 7.9V16.1" strokeWidth="2.6" />
          <path d="M14.8 7.9V16.1" strokeWidth="2.6" />
        </>
      ) : (
        <>
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
          {HOLES.map((h, i) => (
            <circle key={i} cx={h.x} cy={h.y} r="2.25" strokeWidth="1.5" />
          ))}
        </>
      )}
    </svg>
  )
}

export interface MotionToggleProps {
  variant?: 'rail' | 'foot'
  className?: string
}

export default function MotionToggle({ variant = 'rail', className }: MotionToggleProps) {
  const { reduced, paused } = useMotion()
  return (
    <button
      type="button"
      className={className ? `pm-mt ${className}` : 'pm-mt'}
      data-variant={variant}
      data-off={reduced ? 'true' : undefined}
      aria-pressed={paused || reduced}
      disabled={reduced}
      onClick={toggleMotionPaused}
    >
      <ReelGlyph className="pm-mt__reel pm-ambient" paused={paused || reduced} />
      <span className="pm-mt__label">{reduced ? CHROME.motionOff : UI.pauseMotion}</span>
    </button>
  )
}

export { MotionToggle }
