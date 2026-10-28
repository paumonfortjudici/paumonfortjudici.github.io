// Exhibit D: the synopsis, typed on a case-file sheet that stands in a typewriter. The whole sheet is on the table from the
// start (blank paper, nothing shifts) and the keys fill it from the top, a caret travelling down the lines. Reduced / paused
// motion: the sheet is simply complete. The full text is in the DOM from the first paint (the untyped part is only
// transparent), so assistive tech reads all of it.
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { PaperClip, StickyNote, TabButton } from '@/components/primitives'
import { useInView } from '@/lib/hooks/useInView'
import { useMediaQuery } from '@/lib/hooks/useMediaQuery'
import { SG } from './copy'
import Keys, { type KeysHandle } from './Keys'
import Scorecard from './Scorecard'
import './sg-typewriter.css'

const SPEED = 140 // characters per second, before the pauses (about eight seconds for the whole sheet; phones type faster)
const PREFILL = 4 // the heading and the two form lines are already typed when the sheet arrives: it is never a blank rectangle

export default function Typewriter({ scrollRef, still, onRead }: { scrollRef: RefObject<HTMLElement>; still: boolean; onRead: (caseNo: number) => boolean }) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const keysRef = useRef<KeysHandle>(null)
  const lines = SG.type.lines
  const wide = useMediaQuery('(min-width: 900px)')
  // typing starts when the top of the sheet is well inside the screen, and only runs while the sheet is on screen and the tab is visible
  const onScreen = useInView(sheetRef, { root: scrollRef, threshold: 0, rootMargin: '0px 0px -10% 0px' })
  const [started, setStarted] = useState(false)
  const [tabHidden, setTabHidden] = useState(false)
  useEffect(() => {
    if (onScreen) setStarted(true)
  }, [onScreen])
  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  const { starts, flat } = useMemo(() => {
    let n = 0
    const s = lines.map((l) => {
      const at = n
      n += l.t.length + 1
      return at
    })
    return { starts: s, flat: lines.map((l) => l.t).join('\n') }
  }, [lines])
  const total = flat.length + 1

  const [k, setK] = useState(still ? total : starts[Math.min(PREFILL, starts.length - 1)])
  const done = k >= total
  const typing = started && onScreen && !tabHidden && !done && !still

  // under reduced / paused motion the sheet is complete at once
  useEffect(() => {
    if (still) setK(total)
  }, [still, total])

  // the keystrokes: a pause at commas and full stops, a longer one at the end of a line, a little unevenness everywhere
  useEffect(() => {
    if (!typing) return
    const ch = flat[k] ?? '\n'
    const base = 1000 / (wide ? SPEED : SPEED * 1.5)
    const mult = ch === '.' ? 6 : ch === ',' ? 3 : ch === '\n' ? 4 : ch === ' ' ? 0.85 : 1
    const id = window.setTimeout(() => {
      keysRef.current?.press(ch)
      setK((v) => v + 1)
    }, base * mult * (0.7 + Math.random() * 0.6))
    return () => window.clearTimeout(id)
  }, [typing, k, flat, wide])

  const skip = useCallback(() => setK(total), [total])

  return (
    <section className="w-sg-typesec w-sg-station" aria-labelledby="sg-type-title">
      <div className="w-sg-typecol">
      <header className="w-sg-head w-sg-typesec__head">
        <p className="w-sg-tag w-sg-type">{SG.type.exhibit}</p>
        <h3 id="sg-type-title" className="w-sg-h3 w-sg-key">
          {SG.type.title}
        </h3>
        <p className="w-sg-sub">{SG.type.sub}</p>
      </header>
      <Scorecard onRead={onRead} />
      </div>

      <div className="w-sg-machine" data-typing={typing ? '' : undefined}>
        {/* a tab on the sheet's top edge that finishes the typing at once; it exists only while the keys are going */}
        <div className="w-sg-typeskip" data-on={typing ? '' : undefined}>
          <TabButton size="sm" tone="cream" onClick={skip} cursor="Open">
            {SG.type.skip}
          </TabButton>
        </div>
        <div ref={sheetRef} className="w-sg-sheet" role="article" aria-label={SG.type.sheetLabel} onClick={typing ? skip : undefined}>
          {lines.map((l, i) => {
            const at = starts[i]
            const typed = Math.min(l.t.length, Math.max(0, k - at))
            const active = k >= at && k <= at + l.t.length && !done
            const last = i === lines.length - 1
            return (
              <p key={i} className={`w-sg-typed w-sg-typed--${l.k}`}>
                <span>{l.t.slice(0, typed)}</span>
                {(active || (done && last)) && !still ? <span className="w-sg-caret pm-ambient" aria-hidden="true" /> : null}
                <span className="w-sg-rest">{l.t.slice(typed)}</span>
                {l.t ? null : ' '}
              </p>
            )
          })}
          <div className="w-sg-clipnote">
            <StickyNote color="butter" rotate={4} w="9.5rem">
              {SG.type.note}
            </StickyNote>
            <PaperClip className="w-sg-clipnote__clip" rotate={-14} size="3.6rem" />
          </div>
        </div>
        <div className="w-sg-bail" aria-hidden="true" />
        <div className="w-sg-platen" aria-hidden="true">
          <span className="w-sg-knob w-sg-knob--l" />
          <span className="w-sg-knob w-sg-knob--r" />
        </div>
        <Keys ref={keysRef} plate={SG.poster.titleA + ' ' + SG.poster.titleB} />
      </div>
    </section>
  )
}
