// The floor of the stage: Previous and Next tabs and the progress strip, drawn as a trail of boot prints (the deck's footprint
// motif). Printed steps behind you are filled, the one you are on is tomato, the next ones are only outlines.
import { TabButton } from '@/components/primitives'
import { COPY } from './copy'
import { SLIDES } from './data'
import { ArrowLeftIcon, ArrowRightIcon, BootPrint } from './icons'

interface TrailProps {
  index: number
  goTo: (i: number) => void
  /** the presenter shows a smaller trail */
  compact?: boolean
}

export function Trail({ index, goTo, compact }: TrailProps) {
  return (
    <nav className="w-cp-trail" data-compact={compact ? 'true' : undefined} aria-label={COPY.lane.trailLabel}>
      <ol>
        {SLIDES.map((slide, i) => (
          <li key={slide.n} data-foot={i % 2 ? 'l' : 'r'}>
            <button
              type="button"
              className="w-cp-step"
              data-state={i < index ? 'past' : i === index ? 'now' : 'next'}
              aria-label={COPY.lane.trailStep(slide.n, slide.name)}
              aria-current={i === index ? 'step' : undefined}
              onClick={() => goTo(i)}
            >
              <BootPrint foot={i % 2 ? 'l' : 'r'} className="w-cp-boot" />
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}

interface FloorProps {
  index: number
  goTo: (i: number) => void
}

export function Floor({ index, goTo }: FloorProps) {
  const last = SLIDES.length - 1
  return (
    <div className="w-cp-floor">
      <p className="w-cp-hint t-label" aria-hidden="true">
        {COPY.lane.hint}
      </p>
      <TabButton
        className="w-cp-prev"
        color="var(--cp-paper)"
        ink="var(--cp-ink)"
        icon={<ArrowLeftIcon />}
        iconPosition="before"
        aria-disabled={index <= 0}
        onClick={() => index > 0 && goTo(index - 1)}
      >
        {COPY.lane.prev}
      </TabButton>
      <Trail index={index} goTo={goTo} />
      <TabButton
        className="w-cp-next"
        color="var(--cp-paper)"
        ink="var(--cp-ink)"
        icon={<ArrowRightIcon />}
        aria-disabled={index >= last}
        onClick={() => index < last && goTo(index + 1)}
      >
        {COPY.lane.next}
      </TabButton>
    </div>
  )
}
