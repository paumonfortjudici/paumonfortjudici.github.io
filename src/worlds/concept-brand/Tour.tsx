// THE GUIDED TOUR, "Sunday service": nine stops, one art director's note each, a stop counter, back / next (and the arrow keys, handled by
// the world), Skip. It never advances by itself. Drawn as an order docket pinned along the bottom of the wall; the camera frames each
// stop in the part of the wall above it.
import { forwardRef, useEffect, useRef } from 'react'
import { TabButton } from '../../components/primitives'
import { TOUR, UI_TEXT } from './copy'

interface TourProps {
  step: number
  onPrev: () => void
  onNext: () => void
  onSkip: () => void
  /** shown inside the docked panel (the details step aside while the tour runs): a service sheet lists the nine stops */
  docked?: boolean
  onGo?: (i: number) => void
}

const Tour = forwardRef<HTMLElement, TourProps>(function Tour({ step, onPrev, onNext, onSkip, docked, onGo }, ref) {
  const total = TOUR.length
  const stop = TOUR[step]
  const last = step === total - 1
  const nextRef = useRef<HTMLElement>(null)
  // the docket takes focus when the tour starts, so the next key press is a tour key
  const started = useRef(false)
  useEffect(() => {
    if (started.current) return
    started.current = true
    nextRef.current?.focus({ preventScroll: true })
  }, [])
  const slip = (
    <section ref={ref} className="w-concept-brand-tour" aria-label={UI_TEXT.tourLabel} data-step={step} data-docked={docked ? 'true' : undefined}>
      <span className="w-concept-brand-pin" aria-hidden="true" />
      <div className="w-concept-brand-tour-side">
        <p className="w-concept-brand-tour-count">
          <span>{UI_TEXT.tour}</span>
          <b aria-label={`Stop ${step + 1} of ${total}`}>
            {step + 1}
            <i> / {total}</i>
          </b>
        </p>
        <ol className="w-concept-brand-dots" aria-hidden="true">
          {TOUR.map((_, i) => (
            <li key={i} data-on={i === step ? 'true' : undefined} data-done={i < step ? 'true' : undefined} />
          ))}
        </ol>
      </div>
      <div className="w-concept-brand-tour-main">
        <div aria-live="polite">
          <h2 className="w-concept-brand-tour-title">{stop.title}</h2>
          <p className="w-concept-brand-tour-note">{stop.note}</p>
        </div>
        <div className="w-concept-brand-tour-actions">
          <TabButton
            size="sm"
            color="var(--cb-rosat)"
            ink="var(--cb-tinta)"
            icon="arrow-left"
            iconPosition="before"
            onClick={onPrev}
            disabled={step === 0}
          >
            {UI_TEXT.tourPrev}
          </TabButton>
          <TabButton
            ref={nextRef}
            size="sm"
            color={docked ? 'var(--cb-blau)' : 'var(--cb-mantega)'}
            ink={docked ? 'var(--cb-rosat)' : 'var(--cb-tinta)'}
            icon={last ? 'cross' : 'arrow-right'}
            onClick={last ? onSkip : onNext}
          >
            {last ? UI_TEXT.close : UI_TEXT.tourNext}
          </TabButton>
          {!last && (
            <button type="button" className="w-concept-brand-skip" onClick={onSkip}>
              {UI_TEXT.tourSkip}
            </button>
          )}
        </div>
      </div>
    </section>
  )
  if (!docked) return slip
  return (
    <>
      {slip}
      <nav className="w-concept-brand-service" aria-label="The nine stops">
        <p className="w-concept-brand-bar">
          <span>Today&apos;s service</span>
        </p>
        <ol>
          {TOUR.map((t, i) => (
            <li key={t.title}>
              <button
                type="button"
                onClick={() => onGo?.(i)}
                aria-current={i === step ? 'step' : undefined}
                data-done={i < step ? 'true' : undefined}
              >
                <span className="w-concept-brand-service-n">{i + 1}</span>
                <span className="w-concept-brand-service-t">{t.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
})

export default Tour
