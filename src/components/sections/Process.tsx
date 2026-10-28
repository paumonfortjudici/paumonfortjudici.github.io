// 05 Process: the darkroom bench. An ultraviolet sheet with the PROCESS lettering, then a 35mm film strip whose four frames are
// the four steps (COLLECT, SKETCH, MAKE, DELIVER), a ruler that is the tablist, and a shelf of the tools I work with.
// The bench (scenes, tool tokens, drag logic) is a lazy chunk: it loads when the sheet is two screens away (and is warmed when the
// browser is idle). If the chunk cannot be fetched, the four steps are still there as plain text.
// Docs: docs/api/sections-process.md
import { Component, lazy, Suspense, useEffect, useRef, type ErrorInfo, type ReactNode } from 'react'
import { PROCESS } from '../../lib/copy'
import { useInView, useMediaQuery, usePointerFine } from '../../lib/hooks'
import { loadHandFonts } from '../../styles/fonts'
import { Scribble, Sheet, StrokeWord } from '../primitives'
import { PROCESS_UI, STEP_STYLE, stepBody } from './process/data'
import './process.css'

const loadBench = () => import('./process/Bench')
const Bench = lazy(loadBench)

/** same footprint as the bench, so the sheet does not jump when the chunk arrives */
function Skeleton() {
  return <div className="pm-proc-skel" aria-hidden="true" />
}

/** the four steps as plain text: what is shown when the bench chunk fails to load (it must never take the page down with it) */
function PlainSteps() {
  return (
    <ol className="pm-proc-plain" aria-label={PROCESS_UI.region}>
      {PROCESS.steps.map((step, i) => (
        <li key={step.n} className="pm-proc-plain__step" style={{ ['--c' as string]: `var(--${STEP_STYLE[i].tone})` }}>
          <h3 className="pm-proc-plain__name">{step.title}</h3>
          <p className="pm-proc-plain__body">{stepBody(step.n, step.body)}</p>
          <p className="pm-proc-plain__chips">{step.chips.join(' · ')}</p>
        </li>
      ))}
    </ol>
  )
}

class BenchBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(_error: Error, _info: ErrorInfo) {
    /* nothing to report: the plain steps below carry the same words */
  }
  render() {
    return this.state.failed ? <PlainSteps /> : this.props.children
  }
}

export function Process() {
  const holder = useRef<HTMLDivElement>(null)
  const near = useInView(holder, { once: true, rootMargin: '2200px 0px' })
  const fine = usePointerFine()
  // the word fills the row on tablets and phones (it already does on a desktop: 12.5vw)
  const narrow = useMediaQuery('(max-width: 900px)')
  // phones get the film as a vertical stack (same breakpoint as the bench): there it is scrolled, not dragged
  const stack = useMediaQuery('(max-width: 720px)')
  const note = stack ? PROCESS_UI.noteScroll : fine ? PROCESS_UI.noteDrag : PROCESS_UI.noteSwipe

  // fetch the code once the browser has nothing better to do, so the sheet is ready when the visitor gets there
  // (the marker face of the hand notes comes with it; the call is idempotent, App asks for it too)
  useEffect(() => {
    const warm = () => {
      void loadBench().catch(() => undefined)
      void loadHandFonts()
    }
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(warm, { timeout: 8000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(warm, 4000)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <Sheet id="process" tone="ultraviolet" page="Process" n={5} aria-labelledby="process-title" className="pm-proc">
      <header className="pm-proc-head">
        {/* capped at 8rem: past 1500px the word keeps growing and the ghost would end up behind its first letters */}
        <StrokeWord text={PROCESS.ghost} ghost size="clamp(3.4rem, 9vw, 8rem)" className="pm-proc-ghost" style={{ color: 'var(--marigold)' }} />
        <StrokeWord as="h2" id="process-title" text={PROCESS.strokeWord} size={narrow ? 'clamp(4.5rem, 17.5vw, 17rem)' : 'clamp(4.5rem, 12.5vw, 17rem)'} shadow="var(--marigold)" style={{ color: 'var(--cream)' }} />
        <div className="pm-proc-intro">
          <p className="pm-proc-sub">{PROCESS.sub}</p>
          <p className="pm-proc-note t-hand" aria-hidden="true">
            <span>{note}</span>
            <Scribble kind="arrow" dir="down-left" w="4.6rem" color="var(--marigold)" seed="process-drag" />
          </p>
        </div>
      </header>

      <div ref={holder} className="pm-proc-holder">
        {near ? (
          <BenchBoundary>
            <Suspense fallback={<Skeleton />}>
              <Bench />
            </Suspense>
          </BenchBoundary>
        ) : (
          <Skeleton />
        )}
      </div>
    </Sheet>
  )
}

export default Process
