// World 4: Spelled Guilty, "Case File". A noir detective's room: the lights are off and a flashlight follows your pointer.
// Stations, top to bottom: the book as a 3D object (A), the case file as a page-turning sample (B), the evidence board (C),
// the typewriter synopsis beside the detective's scorecard (D), how a case works (E), who made it and the facts slate (F).
// Alternatives for every pointer feature: the Lights on / Lights off tabs (default for touch and reduced motion: on), the
// beam follows keyboard focus and can be aimed with the arrow keys (the "Aim the beam" tab, or the room itself when the book
// is not on screen), the book turns with tabs and arrows, the board has pick-up-and-move keys and a Tidy up tab (and a swipe
// carousel on phones), the scorecard is a keyboard grid, the sample pages open in a page viewer.
// Files: see docs/api/world-spelled-guilty.md.
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from 'react'
// the shared stylesheet first: station stylesheets (imported by the components below) build on it
import './spelled-guilty/sg-base.css'
import { TabButton } from '@/components/primitives'
import { usePointerFine } from '@/lib/hooks/usePointerFine'
import { loadHandFonts } from '@/styles/fonts'
import { useWorld } from './WorldShell'
import Board from './spelled-guilty/Board'
import Closed from './spelled-guilty/Closed'
import Poster from './spelled-guilty/Poster'
import Prints from './spelled-guilty/Prints'
import Reader, { type ReaderHandle } from './spelled-guilty/Reader'
import Typewriter from './spelled-guilty/Typewriter'
import Zoom, { pageOfSpread, spreadOfPage } from './spelled-guilty/Zoom'
import { SG } from './spelled-guilty/copy'
import { useBeam } from './spelled-guilty/useBeam'

const LIGHTS_KEY = 'pm-sg-lights'

type Lights = 'on' | 'off'

function readLights(): Lights | null {
  try {
    const v = window.sessionStorage.getItem(LIGHTS_KEY)
    return v === 'on' || v === 'off' ? v : null
  } catch {
    return null
  }
}

function writeLights(value: Lights): void {
  try {
    window.sessionStorage.setItem(LIGHTS_KEY, value)
  } catch {
    /* storage blocked: the switch still works for this visit */
  }
}

export default function SpelledGuiltyWorld() {
  const { scrollRef, reduced } = useWorld()
  const fine = usePointerFine()
  const titleId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const veilRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLParagraphElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const readerRef = useRef<ReaderHandle>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState<{ open: boolean; page: number }>({ open: false, page: 0 })
  const zoomOpener = useRef<HTMLElement | null>(null)
  const flickerTimer = useRef(0)
  const bookOnScreen = useRef(false)

  // lights: off for a mouse, on for touch and for reduced / paused motion (and whatever the visitor chose earlier this visit)
  const [lights, setLights] = useState<Lights>(() => readLights() ?? (fine && !reduced ? 'off' : 'on'))
  const [flicker, setFlicker] = useState(false)
  const [hint, setHint] = useState(true)
  const [aimFocus, setAimFocus] = useState(false)
  const [calm, setCalm] = useState(false)
  const off = lights === 'off'

  useEffect(() => {
    void loadHandFonts()
    return () => window.clearTimeout(flickerTimer.current)
  }, [])

  // the scroller's visible height drives the veil, the poster and the page viewer (a CSS custom property, no re-render)
  useEffect(() => {
    const scroller = scrollRef.current
    const root = rootRef.current
    if (!scroller || !root) return
    const apply = () => root.style.setProperty('--sg-vh', `${scroller.clientHeight}px`)
    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(scroller)
    return () => observer.disconnect()
  }, [scrollRef])

  // the lights rail sits back once the poster has scrolled away (one state change per crossing, not per scroll event)
  useEffect(() => {
    const scroller = scrollRef.current
    if (!scroller) return
    let raf = 0
    const check = () => {
      raf = 0
      setCalm(scroller.scrollTop > scroller.clientHeight * 0.6)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check)
    }
    check()
    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      scroller.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [scrollRef])

  // while the page viewer is open the room behind it (and the lights rail) cannot be reached; when it closes, focus goes back
  // to whatever opened it (after the room is reachable again)
  useEffect(() => {
    contentRef.current?.toggleAttribute('inert', zoom.open)
    railRef.current?.toggleAttribute('inert', zoom.open)
    if (!zoom.open && zoomOpener.current) {
      zoomOpener.current.focus({ preventScroll: true })
      zoomOpener.current = null
    }
  }, [zoom.open])

  const setMode = useCallback((next: Lights) => {
    setLights(next)
    writeLights(next)
    if (next === 'off') {
      setFlicker(true)
      window.clearTimeout(flickerTimer.current)
      flickerTimer.current = window.setTimeout(() => setFlicker(false), 900)
    }
  }, [])

  const beam = useBeam({
    scrollRef,
    veilRef,
    hintRef,
    active: off,
    instant: reduced,
    // the beam parks between the title and the book, so the first screen has two lit things and the rest of the wall is only dim
    home: () => {
      const r = stageRef.current?.getBoundingClientRect()
      if (!r) return null
      const book = { x: r.left + r.width / 2, y: r.top + r.height * 0.46 }
      const t = rootRef.current?.querySelector('.w-sg-title')?.getBoundingClientRect()
      if (!t || t.width === 0) return book
      const title = { x: t.left + t.width * 0.5, y: t.top + t.height * 0.5 }
      return { x: title.x * 0.5 + book.x * 0.5, y: title.y * 0.5 + book.y * 0.5 }
    },
    onTaken: () => setHint(false),
    yieldKeys: () => bookOnScreen.current,
  })

  const openCase = useCallback(() => {
    readerRef.current?.show(1)
  }, [])

  const openZoom = useCallback((spread: number) => {
    zoomOpener.current = document.activeElement as HTMLElement | null
    setZoom({ open: true, page: pageOfSpread(spread) })
  }, [])
  const closeZoom = useCallback((lastPage: number) => {
    setZoom((z) => ({ ...z, open: false }))
    readerRef.current?.goToSpread(spreadOfPage(lastPage))
  }, [])

  const style = { '--sg-vh': 'calc(100dvh - 56px)' } as CSSProperties

  return (
    <div ref={rootRef} className="w-sg" data-lights={lights} data-flicker={flicker ? '' : undefined} data-hint={hint ? '' : undefined} data-calm={calm ? '' : undefined} data-zoom={zoom.open ? '' : undefined} style={style}>
      <div className="w-sg-fixed" data-sg-ui="">
        <div ref={veilRef} className="w-sg-veil" aria-hidden="true">
          <p ref={hintRef} className="w-sg-hint">
            {SG.room.hint}
          </p>
        </div>
        <Zoom open={zoom.open} startPage={zoom.page} onClose={closeZoom} />
      </div>
      <div className="w-sg-railwrap" data-sg-ui="">
        <div ref={railRef} className="w-sg-rail">
          <div className="w-sg-lights" role="group" aria-label={SG.room.lightsGroup}>
            <TabButton size="sm" tone="cream" selected={!off} aria-pressed={!off} onClick={() => setMode('on')} data-sg-ui="">
              {SG.room.lightsOn}
            </TabButton>
            <TabButton size="sm" tone="ink" selected={off} aria-pressed={off} onClick={() => setMode('off')} data-sg-ui="">
              {SG.room.lightsOff}
            </TabButton>
          </div>
          {off ? (
            <>
              <TabButton
                size="sm"
                tone="cream"
                aria-label={SG.room.aimLabel}
                className="w-sg-aimtab"
                data-sg-ui=""
                onFocus={() => setAimFocus(true)}
                onBlur={() => setAimFocus(false)}
                onClick={() => beam.recentre()}
                onKeyDown={(event) => {
                  const step = event.shiftKey ? 160 : 48
                  const keys: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
                  const move = keys[event.key]
                  if (!move) return
                  event.preventDefault()
                  beam.aim(move[0], move[1])
                }}
              >
                {SG.room.aim}
              </TabButton>
              {aimFocus ? <p className="w-sg-aim-note w-sg-type">{SG.room.aimNote}</p> : null}
            </>
          ) : null}
        </div>
      </div>

      <div ref={contentRef} className="w-sg-content">
        <Poster titleId={titleId} still={reduced} stageRef={stageRef} onOpen={openCase} />
        <Reader ref={readerRef} scrollRef={scrollRef} still={reduced} onZoom={openZoom} onVisible={(v) => (bookOnScreen.current = v)} />
        <Board still={reduced} onRead={(n) => readerRef.current?.showCase(n) ?? false} />
        <Typewriter scrollRef={scrollRef} still={reduced} onRead={(n) => readerRef.current?.showCase(n) ?? false} />
        <Prints />
        <Closed />
      </div>
    </div>
  )
}
