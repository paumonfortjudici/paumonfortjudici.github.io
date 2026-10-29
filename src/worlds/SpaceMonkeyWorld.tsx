// World 5, Space Monkey: "Mission Dossier". Two escape-room posters Pau made at 13 (his first project), shown as holographic foil
// cards that tilt with the pointer and turn over to their dossier side, in a folder with a window onto deep space.
// Layout: the folder's own colour stays as a frame (sticky overlay) round a sticky starfield; the content scrolls inside that
// window: hero (spine title, two posters, rail with the patch and the brief) -> the mission tape -> the typed log + facts.
// Docs: docs/api/world-space-monkey.md
import { useEffect, useId, useRef, useState } from 'react'
import { ArrowIcon, Folder, Scribble, TabButton, Tape, WorldFacts } from '@/components/primitives'
import { pad2 } from '@/lib/copy'
import { loadHandFonts, whenFontsLoaded } from '@/styles/fonts'
import { useWorld } from './WorldShell'
import { HoloPoster } from './space-monkey/HoloPoster'
import { MissionLog } from './space-monkey/MissionLog'
import { MissionPatch } from './space-monkey/MissionPatch'
import { MissionTape } from './space-monkey/MissionTape'
import { Starfield } from './space-monkey/Starfield'
import { useStill } from './space-monkey/useStill'
import { LEAD, POSTERS } from './space-monkey/data'
import './space-monkey/space-monkey.css'

/** The margin note beside the posters. Wide layouts only: below that every poster has its own labelled Flip tab. */
function Hint() {
  return (
    <p className="w-space-monkey-brief-hint">
      <span className="w-space-monkey-hint-arrow" aria-hidden="true">
        <Scribble kind="arrow" dir="left" w="3.2rem" color="var(--sm-yellow)" stroke={3.2} draw={900} seed="brief" />
      </span>
      <span>flip a poster: its file is on the back</span>
    </p>
  )
}

function Seal() {
  return (
    <figure className="w-space-monkey-seal">
      <div className="w-space-monkey-seal-pop">
        <MissionPatch className="w-space-monkey-patch" />
      </div>
      <figcaption className="w-space-monkey-seal-note">the room’s own patch, cut from SMITH’s sleeve</figcaption>
    </figure>
  )
}

/** A countdown slate in the rail (wide layouts only): the one number of the story, pulled up from the log so the first screen has a reason to scroll. */
function Gauge() {
  return (
    <div className="w-space-monkey-gauge" role="group" aria-label="About five months from the posters to opening day">
      <span className="w-space-monkey-gauge-head" aria-hidden="true">
        T-minus
      </span>
      <span className="w-space-monkey-gauge-num" aria-hidden="true">
        5
      </span>
      <span className="w-space-monkey-gauge-note" aria-hidden="true">
        months from the posters to opening day
      </span>
    </div>
  )
}

function Brief({ n }: { n: number }) {
  return (
    <div className="w-space-monkey-brief">
      <Folder
        color="var(--cream-2)"
        ink="var(--ink)"
        tab={`File ${pad2(n)}`}
        tabX={0.14}
        className="w-space-monkey-brief-folder"
        bodyClassName="w-space-monkey-brief-body"
      >
        <p className="w-space-monkey-brief-lead">{LEAD}</p>
        {/* a postscript in Pau's pen, wide layouts only (below that the page visibly goes on): the lower half is the tape and the log */}
        <p className="w-space-monkey-brief-more">
          <span>more below: the dates and the log</span>
          <Scribble kind="arrow" dir="down" w="2rem" color="var(--ultraviolet)" stroke={3} draw={1600} seed="more" />
        </p>
      </Folder>
    </div>
  )
}

/** The way back: the two posters in miniature, taped up, and the tab that scrolls to them. The miniatures are decoration (alt=""); the tab is the control. */
function Return({ onBack }: { onBack: () => void }) {
  return (
    <div className="w-space-monkey-return">
      <div className="w-space-monkey-minis" aria-hidden="true">
        {POSTERS.map((poster) => (
          <figure key={poster.id} className="w-space-monkey-mini" data-poster={poster.id}>
            <img
              src={poster.thumb}
              width={600}
              height={Math.round((600 * poster.height) / poster.width)}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
            />
            <Tape at="top" color="var(--sm-yellow)" w="3.4rem" h="1.15rem" rotate={poster.id === 'tyler' ? -5 : 4} />
          </figure>
        ))}
      </div>
      <TabButton tone="ultraviolet" icon={<ArrowIcon dir="up" />} iconPosition="before" onClick={onBack}>
        Back to the posters
      </TabButton>
    </div>
  )
}

export default function SpaceMonkeyWorld() {
  const { work, scrollRef } = useWorld()
  const reduced = useStill()
  const titleId = useId()
  const rootRef = useRef<HTMLDivElement>(null)

  // Pau's handwriting (Gochi Hand) is lazy: the margin notes fade in once it is here (or after 0.9 s)
  const [hand, setHand] = useState<'pending' | 'ready'>('pending')
  useEffect(() => {
    let alive = true
    void loadHandFonts()
      .then(() => whenFontsLoaded(['1em "Gochi Hand"'], 900))
      .then(() => alive && setHand('ready'))
    return () => {
      alive = false
    }
  }, [])

  // the tab scrolls back to the top and hands the keyboard to the first poster (the button itself is about to leave the screen)
  const backToPosters = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
    rootRef.current?.querySelector<HTMLElement>('.w-space-monkey-stage')?.focus({ preventScroll: true })
  }

  // the sticky sky and frame are exactly as tall as the scroller: measure it once and on resize (no per-frame work)
  useEffect(() => {
    const root = rootRef.current
    const scroller = scrollRef.current
    if (!root || !scroller) return
    const set = () => root.style.setProperty('--sm-h', `${scroller.clientHeight}px`)
    set()
    const observer = new ResizeObserver(set)
    observer.observe(scroller)
    return () => observer.disconnect()
  }, [scrollRef])

  return (
    <div ref={rootRef} className="w-space-monkey" data-hand={hand}>
      <Starfield still={reduced} />
      <div className="w-space-monkey-frame" aria-hidden="true" />

      <div className="w-space-monkey-flow">
        <section className="w-space-monkey-hero" aria-labelledby={titleId}>
          <h2 id={titleId} className="w-space-monkey-title">
            {/* the blue misregistered copy is its own aria-hidden layer: its words come from CSS (attr), so the heading's text is read once */}
            <span className="w-space-monkey-title-ink" aria-hidden="true">
              <span data-t="Space" /> <span data-t="Monkey" />
            </span>
            <span className="w-space-monkey-title-face">
              <span>Space</span> <span>Monkey</span>
            </span>
          </h2>
          <div className="w-space-monkey-deck">
            <div className="w-space-monkey-posters">
              {POSTERS.map((poster, i) => (
                <HoloPoster key={poster.id} data={poster} index={i} />
              ))}
            </div>
            <div className="w-space-monkey-rail">
              <Hint />
              <Seal />
              <Gauge />
              <Brief n={work.n} />
            </div>
          </div>
        </section>

        {/* one wrapper so a tablet can set the vertical tape beside the log (see the 720 to 999 tier in the CSS) */}
        <div className="w-space-monkey-mid">
          <MissionTape />

          <div className="w-space-monkey-close">
            <MissionLog />
            <div className="w-space-monkey-end">
              <WorldFacts work={work} tone="ink" className="w-space-monkey-facts">
                Early work, kept here as a portfolio sample.
              </WorldFacts>
              <Return onBack={backToPosters} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
