// World 9, "Slide Deck": a small presentation room for the portfolio deck of an INVENTED client (Ona Ribas, foley artist).
//   the lane       five 9:16 slides in a horizontal scroll-snap strip: wheel, drag with a throw, arrows, tabs, a boot-print trail; hover loupe
//   Present        the slide fills the screen (Fullscreen API or a fixed overlay), keys, swipe, a laser dot
//   Design notes   numbered pins on every slide with my reasons, in first person
//   Sound          a stretch goal: the props become instruments, synthesised with the Web Audio API (OFF at first)
//   About Ona      the client panel: bio, invented brief, click-to-copy palette, fonts with a live width-axis sample
//   Sheet          a contact sheet of the five slides
// Notes for developers: docs/api/world-concept-portfolio.md. Everything about Ona Ribas is fictional and labelled as such.
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { FilmStrip, WorldFacts } from '@/components/primitives'
import { useBodyLock, useInView, useKey, useMediaQuery, usePointerFine } from '@/lib/hooks'
import { loadHandFonts } from '@/styles/fonts'
import './concept-portfolio/concept-portfolio.css'
import { AboutPanel } from './concept-portfolio/AboutPanel'
import { Bar } from './concept-portfolio/Bar'
import { COPY } from './concept-portfolio/copy'
import { SHEET, SLIDES, SLIDE_COUNT, type Hotspot } from './concept-portfolio/data'
import { DeckContext, clamp, useInert, type Deck, type PopState } from './concept-portfolio/deck'
import { BootPrint } from './concept-portfolio/icons'
import { Floor } from './concept-portfolio/Floor'
import { Lane } from './concept-portfolio/Lane'
import { Presenter, enterFullscreen, leaveFullscreen } from './concept-portfolio/Presenter'
import { SheetOverlay } from './concept-portfolio/SheetOverlay'
import { FoleyBoard, soundSupported } from './concept-portfolio/sound'
import { FitLine, autoWidths } from './concept-portfolio/StretchWord'
import { useLane } from './concept-portfolio/useLane'
import { Wall } from './concept-portfolio/Wall'
import { useWorld, useWorldEscape } from './WorldContext'

// the first slide starts downloading as soon as this chunk is evaluated, before the world has rendered
if (typeof Image !== 'undefined') new Image().src = SLIDES[0].src

const SOUND_KEY = 'pm-cp-sound'

function readSound(): boolean {
  try {
    return window.sessionStorage.getItem(SOUND_KEY) === '1'
  } catch {
    return false
  }
}

function writeSound(on: boolean): void {
  try {
    window.sessionStorage.setItem(SOUND_KEY, on ? '1' : '0')
  } catch {
    /* private window: the switch still works for this visit */
  }
}

type Panel = 'about' | 'sheet' | null

const CREDITS_LINES = ['HOW THIS DECK', 'WAS MADE'].map((text, i) => ({ text, widths: autoWidths(text, 4 + i * 3) }))

export default function ConceptPortfolioWorld() {
  const { work, reduced: still, scrollRef } = useWorld()
  const fine = usePointerFine()
  const narrow = useMediaQuery('(max-width: 640px)')

  const soundHelpId = useId()
  const slabRef = useRef<HTMLDivElement>(null)
  const raysRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLElement>(null)
  const creditsRef = useRef<HTMLElement>(null)

  const [notes, setNotes] = useState(false)
  const [sound, setSound] = useState<boolean>(readSound)
  const [panel, setPanel] = useState<Panel>(null)
  const [presenting, setPresenting] = useState(false)
  const [zoom, setZoom] = useState(false)
  const [zoomPt, setZoomPt] = useState({ x: 50, y: 38 })
  const [openPin, setOpenPin] = useState<string | null>(null)
  const [pop, setPop] = useState<PopState | null>(null)
  const [message, setMessage] = useState<{ text: string; n: number }>({ text: '', n: 0 })

  const stageSeen = useInView(stageRef, { root: scrollRef, initial: true })
  const overlayOpen = panel !== null || presenting
  const lane = useLane({ count: SLIDE_COUNT, still, slabRef, raysRef, captureWheel: !overlayOpen })
  const { index, goTo } = lane
  const slide = SLIDES[index]

  const announce = useCallback((text: string) => setMessage((m) => ({ text, n: m.n + 1 })), [])

  // the signature on the notes is set in the marker face (lazy, 19 KB)
  useEffect(() => {
    void loadHandFonts()
  }, [])

  // ---- the page behind an overlay is inert and does not scroll ----------------------------------------------------------------
  useInert(stageRef, overlayOpen)
  useInert(creditsRef, overlayOpen)
  useBodyLock(overlayOpen, scrollRef)

  // ---- one slide at a time: close what belongs to the previous one --------------------------------------------------------------
  const first = useRef(true)
  useEffect(() => {
    setOpenPin(null)
    setZoom(false)
    if (first.current) {
      first.current = false
      return
    }
    announce(COPY.lane.announce(SLIDES[index].n, SLIDES[index].title))
  }, [index, announce])

  useEffect(() => {
    if (!notes) setOpenPin(null)
  }, [notes])

  // a note closes when you press anywhere else
  useEffect(() => {
    if (!openPin) return
    const onDown = (e: PointerEvent) => {
      if (!(e.target as Element | null)?.closest?.('.w-cp-pinwrap')) setOpenPin(null)
    }
    document.addEventListener('pointerdown', onDown, true)
    return () => document.removeEventListener('pointerdown', onDown, true)
  }, [openPin])

  // ---- the sound board ----------------------------------------------------------------------------------------------------------
  const boardRef = useRef<FoleyBoard | null>(null)
  const board = useCallback((): FoleyBoard => (boardRef.current ??= new FoleyBoard()), [])
  useEffect(
    () => () => {
      boardRef.current?.dispose() // the AudioContext closes with the world
      boardRef.current = null
    },
    [],
  )

  const toggleSound = useCallback(() => {
    if (sound) {
      board().dispose()
      setSound(false)
      writeSound(false)
      announce(COPY.sound.off)
      return
    }
    // switching on is the gesture that creates the AudioContext
    if (!soundSupported() || !board().arm()) {
      announce(COPY.sound.unavailable)
      return
    }
    setSound(true)
    writeSound(true)
    announce(COPY.sound.on)
  }, [sound, board, announce])

  const popKey = useRef(0)
  const popTimer = useRef<number>(0)
  useEffect(() => () => window.clearTimeout(popTimer.current), [])
  const hit = useCallback(
    (slideN: number, spot: Hotspot) => {
      const b = board()
      if (b.arm()) b.play(spot.kind) // a press is a gesture too: this also covers a sound state restored from the session
      popKey.current += 1
      setPop({ key: popKey.current, slide: slideN, word: spot.word, x: spot.x + spot.w / 2, y: spot.y + spot.h / 2 })
      window.clearTimeout(popTimer.current)
      popTimer.current = window.setTimeout(() => setPop(null), 1150)
      announce(COPY.sound.heard(spot.word))
    },
    [board, announce],
  )

  // ---- the loupe (fixed zoom: Enter, arrows, drag) --------------------------------------------------------------------------------
  const toggleZoom = useCallback(() => {
    setZoomPt({ x: 50, y: 38 })
    setZoom((z) => !z)
  }, [])
  useEffect(() => {
    if (zoom) announce(COPY.loupe.on)
  }, [zoom, announce])
  useWorldEscape(zoom && !overlayOpen, () => setZoom(false))
  useWorldEscape(openPin !== null && !overlayOpen, () => setOpenPin(null))

  // ---- keys: arrows turn the slides (or pan the loupe); Home / End live on the lane --------------------------------------------------
  useKey(
    ['ArrowLeft', 'ArrowRight'],
    (e) => {
      const dir = e.key === 'ArrowRight' ? 1 : -1
      if (zoom) {
        const step = e.shiftKey ? 14 : 7
        setZoomPt((p) => ({ x: clamp(p.x + dir * step, 0, 100), y: p.y }))
        return
      }
      goTo(index + dir)
    },
    { enabled: !overlayOpen, preventDefault: true },
  )
  useKey(
    ['ArrowUp', 'ArrowDown'],
    (e) => {
      const dir = e.key === 'ArrowDown' ? 1 : -1
      const step = e.shiftKey ? 14 : 7
      setZoomPt((p) => ({ x: p.x, y: clamp(p.y + dir * step, 0, 100) }))
    },
    { enabled: zoom && !overlayOpen, preventDefault: true },
  )

  // Home / End jump the lane to the first / last slide while the stage is on screen (focus on the lane itself is handled there);
  // once the page is scrolled down to the credits they scroll the page as usual
  useKey(
    ['Home', 'End'],
    (e) => goTo(e.key === 'End' ? SLIDE_COUNT - 1 : 0),
    { enabled: !overlayOpen && stageSeen, preventDefault: true },
  )

  // ---- panels and the presenter ---------------------------------------------------------------------------------------------------
  const openPanel = useCallback((kind: Exclude<Panel, null>) => {
    setOpenPin(null)
    setZoom(false)
    setPanel(kind)
  }, [])
  const closePanel = useCallback(() => setPanel(null), [])

  const presenterRef = useRef<HTMLDivElement>(null)
  const fullscreen = useRef(false)
  const present = useCallback(() => {
    setOpenPin(null)
    setZoom(false)
    setPanel(null)
    flushSync(() => setPresenting(true)) // the element has to exist inside this click for the Fullscreen API
    void enterFullscreen(presenterRef.current).then((ok) => {
      if (ok && presenterRef.current) fullscreen.current = true
    })
  }, [])
  // The browser itself leaves full screen on Escape. Some browsers still deliver that keydown to the page after the overlay has
  // gone, which would then close the whole world: swallow an Escape that arrives within half a second of leaving.
  const escapeGuard = useRef(0)
  const leavePresenter = useCallback((viaBrowser?: boolean) => {
    if (viaBrowser === true) escapeGuard.current = performance.now() + 500
    fullscreen.current = false
    leaveFullscreen()
    setPresenting(false)
  }, [])
  useEffect(() => {
    const swallow = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && performance.now() < escapeGuard.current) {
        e.preventDefault() // the shell's Escape handler skips events that are already handled
        e.stopPropagation()
      }
    }
    window.addEventListener('keydown', swallow, true)
    return () => window.removeEventListener('keydown', swallow, true)
  }, [])
  useEffect(
    () => () => {
      fullscreen.current = false
      leaveFullscreen() // the world closed while presenting
    },
    [],
  )

  const toggleNotes = useCallback(() => setNotes((n) => !n), [])
  const notesAnnounced = useRef(false)
  useEffect(() => {
    if (!notesAnnounced.current) {
      notesAnnounced.current = true
      return
    }
    announce(notes ? COPY.notes.on : COPY.notes.off)
  }, [notes, announce])

  const deck = useMemo<Deck>(
    () => ({ index, still, fine, narrow, notes, sound, zoom, zoomPt, setZoomPt, openPin, setOpenPin, pop, hit, goTo }),
    [index, still, fine, narrow, notes, sound, zoom, zoomPt, openPin, pop, hit, goTo],
  )

  return (
    <DeckContext.Provider value={deck}>
      <div className="w-cp" data-stage={stageSeen ? 'in' : 'out'} data-notes={notes ? 'on' : 'off'} data-sound={sound ? 'on' : 'off'} data-presenting={presenting ? 'true' : undefined}>
        <h2 className="pm-sr">{COPY.heading}</h2>
        <p className="pm-sr">{COPY.intro}</p>

        <section ref={stageRef} className="w-cp-stage" aria-label={COPY.bar.stage}>
          <Wall slabRef={slabRef} raysRef={raysRef} index={index} last={SLIDE_COUNT - 1} />
          <Bar
            notes={notes}
            sound={sound}
            pins={slide.pins.length}
            onPresent={present}
            onNotes={toggleNotes}
            onSound={toggleSound}
            onSheet={() => openPanel('sheet')}
            onAbout={() => openPanel('about')}
            soundHelpId={soundHelpId}
          />
          <p id={soundHelpId} className="pm-sr">
            {COPY.sound.help}
          </p>
          {sound && (
            <p className="w-cp-soundnote t-label" role="note">
              <span className="w-cp-soundnote-dot" aria-hidden="true" />
              {COPY.sound.honest}
            </p>
          )}
          <Lane api={lane} onLoupe={toggleZoom} />
          <Floor index={index} goTo={goTo} />
        </section>
        <div className="pm-sr" role="status" aria-live="polite" aria-atomic="true">
          <span key={message.n}>{message.text}</span>
        </div>

        <section ref={creditsRef} className="w-cp-credits" aria-labelledby="w-cp-credits-h">
          <div className="w-cp-trailrow" aria-hidden="true">
            {Array.from({ length: 15 }, (_, i) => (
              <span key={i} className="w-cp-trailstep" data-foot={i % 2 ? 'l' : 'r'}>
                <BootPrint foot={i % 2 ? 'l' : 'r'} className="w-cp-boot" />
              </span>
            ))}
          </div>
          <div className="w-cp-credits-in">
            <h3 id="w-cp-credits-h" className="w-cp-credits-h" aria-label={COPY.credits.title}>
              <span aria-hidden="true" className="w-cp-credits-lines">
                {CREDITS_LINES.map((line) => (
                  <FitLine key={line.text} text={line.text} widths={line.widths} />
                ))}
              </span>
            </h3>
            <div className="w-cp-credits-copy">
              <p>{COPY.credits.p1}</p>
              <p>{COPY.credits.p2}</p>
            </div>
            <WorldFacts work={work} />
            <figure className="w-cp-strip">
              <FilmStrip tone="ink">
                <img src={SHEET.src} alt={SHEET.alt} width={SHEET.w} height={SHEET.h} loading="lazy" decoding="async" />
              </FilmStrip>
              <figcaption className="w-cp-strip-cap">{COPY.credits.stripCaption}</figcaption>
            </figure>
          </div>
        </section>

        <AboutPanel open={panel === 'about'} onClose={closePanel} />
        <SheetOverlay open={panel === 'sheet'} onClose={closePanel} index={index} goTo={goTo} />
        {presenting && <Presenter rootRef={presenterRef} index={index} goTo={goTo} onClose={leavePresenter} fullscreen={fullscreen} toggleNotes={toggleNotes} />}
      </div>
    </DeckContext.Provider>
  )
}
