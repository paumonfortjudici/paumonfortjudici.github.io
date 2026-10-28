// The shop window: a laptop and a phone that scroll through the real captures of somia.store.
//   - one master progress (the tour engine) drives both screens, the tape and the section buttons
//   - device switcher (hang tags): Laptop / Phone / Side by side; page switcher (the shop's own underlined nav): Home / Collection / Product
//   - Browse the site: play / pause + speed (a row of size-picker squares). Manual control (dragging a screen, arrow keys on a screen)
//     pauses the tour; the tape and the section buttons keep it going.
//   - reduced motion or "Pause motion": nothing autoplays; play and speed are replaced by previous / next section buttons.
// The tour only runs while the window is on screen, the tab is visible and no lightbox is open.

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ArrowIcon } from '../../components/primitives'
import { useInView } from '../../lib/hooks/useInView'
import { TOUR, type TourPage } from './data'
import { Laptop, Phone } from './Devices'
import { Sections } from './Sections'
import { Subtitle } from './Subtitle'
import { Tape } from './Tape'
import { createTour } from './tour'
import { useWorld } from '../WorldContext'

type Mode = 'side' | 'laptop' | 'phone'

const MODES: Array<{ id: Mode; label: string }> = [
  { id: 'laptop', label: 'Laptop' },
  { id: 'phone', label: 'Phone' },
  { id: 'side', label: 'Side by side' },
]
const SPEEDS = [
  { value: 0.5, label: '½×', name: 'half speed' },
  { value: 1, label: '1×', name: 'normal speed' },
  { value: 2, label: '2×', name: 'double speed' },
]

// page pixels per second at 1× (the desktop page is 1440 wide, the phone page 390 wide)
const PAGE_SPEED = { laptop: 190, phone: 170 } as const

const pageHeight = (page: TourPage, kind: 'desktop' | 'mobile'): number => {
  const variant = page[kind]
  const width = variant.view.w
  return variant.slices.reduce((sum, s) => sum + s.h * (width / s.w), 0)
}

function PlayIcon({ playing }: { playing: boolean }) {
  return (
    <svg className="w-somia-btn__icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
      {playing ? <path d="M4.5 2.5h2.6v11H4.5zM8.9 2.5h2.6v11H8.9z" fill="currentColor" /> : <path d="M4.5 2.2 13 8l-8.5 5.8z" fill="currentColor" />}
    </svg>
  )
}

export function Showcase({ ready, paused }: { ready: boolean; paused: boolean }) {
  const { scrollRef, reduced: still } = useWorld()
  const tour = useMemo(createTour, [])
  const windowRef = useRef<HTMLDivElement>(null)
  // narrow = the window itself is under 560px wide (a phone, or a small browser window): one device at a time
  // wide = 780px or more: there is room on the glass for the translation card (otherwise it sits under the tape)
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.innerWidth < 720)
  const [wide, setWide] = useState(false)
  const [mode, setMode] = useState<Mode>(() => (typeof window !== 'undefined' && window.matchMedia?.('(max-width: 719px)').matches ? 'phone' : 'side'))
  const [pageId, setPageId] = useState<TourPage['id']>('home')
  const [playing, setPlaying] = useState(!still)
  const [speed, setSpeed] = useState(1)
  const [tabVisible, setTabVisible] = useState(() => typeof document === 'undefined' || document.visibilityState !== 'hidden')
  const [status, setStatus] = useState('')
  const stageRef = useRef<HTMLDivElement>(null)
  const inView = useInView(stageRef, { root: scrollRef, threshold: 0.12 })

  const shown: Mode = narrow && mode === 'side' ? 'phone' : mode
  const page = TOUR.find((p) => p.id === pageId) ?? TOUR[0]
  const primary: 'laptop' | 'phone' = shown === 'phone' ? 'phone' : 'laptop'
  const variant = primary === 'phone' ? page.mobile : page.desktop
  const pageH = useMemo(() => pageHeight(page, primary === 'phone' ? 'mobile' : 'desktop'), [page, primary])
  const span = Math.max(1, pageH - variant.view.h)
  const rate = (PAGE_SPEED[primary] * speed) / span

  useLayoutEffect(() => {
    const el = windowRef.current
    if (!el) return
    const measure = () => {
      setNarrow(el.clientWidth < 560)
      setWide(el.clientWidth >= 780)
    }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const onVisibility = () => setTabVisible(document.visibilityState !== 'hidden')
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  // nothing autoplays under reduced / paused motion; the visitor can still scrub, drag and step
  useEffect(() => {
    if (still) setPlaying(false)
  }, [still])

  useEffect(() => {
    tour.onInteract = () => setPlaying(false)
    return () => {
      tour.onInteract = null
      tour.destroy()
    }
  }, [tour])

  useEffect(() => {
    tour.configure({ playing, active: ready && inView && tabVisible && !still && !paused, rate })
  }, [tour, playing, ready, inView, tabVisible, still, paused, rate])

  // a different page starts at the top
  useEffect(() => {
    tour.scrubTo(0)
  }, [tour, pageId])

  const marks = useMemo(() => variant.chapters.map((c) => Math.min(1, Math.max(0, c.at / span))), [variant, span])
  const step = (dir: 1 | -1) => {
    const p = tour.progress
    let target = dir > 0 ? 1 : 0
    if (dir > 0) {
      const next = marks.find((m) => m > p + 0.004)
      if (next !== undefined) target = next
    } else {
      for (let i = marks.length - 1; i >= 0; i--) {
        if (marks[i] < p - 0.004) {
          target = marks[i]
          break
        }
      }
    }
    tour.tweenTo(target, still ? 0 : 650)
  }

  const togglePlay = () => {
    const next = !playing
    setPlaying(next)
    setStatus(next ? 'Tour playing.' : 'Tour paused.')
  }

  const labelFor = (kind: 'laptop' | 'phone') => `${kind === 'laptop' ? 'Laptop' : 'Phone'} screen showing the ${page.label.toLowerCase()} page of somia.store. Drag it, or press the arrow keys, to scroll.`

  return (
    <div className="w-somia-showcase" data-ready={ready ? 'true' : 'false'}>
      <div ref={windowRef} className="w-somia-window" data-device={shown} data-narrow={narrow ? 'true' : 'false'} data-ready={ready ? 'true' : 'false'}>
        <div className="w-somia-glass">
          <span className="w-somia-rail" aria-hidden="true" />
          <div className="w-somia-head">
            <fieldset className="w-somia-tags">
              <legend className="pm-sr">Show me</legend>
              {MODES.map((m, i) => (
                <label key={m.id} className="w-somia-tag" data-on={shown === m.id} data-only={m.id === 'side' ? 'wide' : undefined} style={{ ['--k' as string]: i }}>
                  <input
                    type="radio"
                    name="somia-device"
                    className="pm-sr"
                    checked={shown === m.id}
                    onChange={() => {
                      setMode(m.id)
                      setStatus(`Showing the ${m.label.toLowerCase()}.`)
                    }}
                  />
                  <span className="w-somia-tag__card">{m.label}</span>
                </label>
              ))}
            </fieldset>

            {wide && <Subtitle tour={tour} chapters={variant.chapters} captions={page.captions} marks={marks} where="glass" />}

            <div className="w-somia-nav">
              <fieldset className="w-somia-pages">
                <legend className="pm-sr">Page</legend>
                {TOUR.map((t) => (
                  <label key={t.id} className="w-somia-page" data-on={pageId === t.id}>
                    <input
                      type="radio"
                      name="somia-page"
                      className="pm-sr"
                      checked={pageId === t.id}
                      onChange={() => {
                        setPageId(t.id)
                        setStatus(`Showing the ${t.label.toLowerCase()} page.`)
                      }}
                    />
                    <span>{t.label}</span>
                  </label>
                ))}
              </fieldset>
              <p className="w-somia-url" aria-hidden="true">
                somia.store<span>{page.path}</span>
              </p>
            </div>
          </div>

          <div ref={stageRef} className="w-somia-stage">
            {/* a solo phone leaves the glass wide: the section on show is lettered large on its left, the sections on its right */}
            {shown === 'phone' && (
              <>
                <div className="w-somia-aside w-somia-aside--l">
                  <Subtitle tour={tour} chapters={variant.chapters} captions={page.captions} marks={marks} where="stage" />
                </div>
                <nav className="w-somia-aside w-somia-aside--r" aria-label="Sections of the page">
                  <Sections tour={tour} chapters={variant.chapters} marks={marks} still={still} />
                </nav>
              </>
            )}
            <Laptop key={`laptop-${pageId}`} tour={tour} variant={page.desktop} shown={shown !== 'phone'} label={labelFor('laptop')} />
            <Phone key={`phone-${pageId}`} tour={tour} variant={page.mobile} shown={shown !== 'laptop'} label={labelFor('phone')} />
            <div className="w-somia-plinth" aria-hidden="true" />
          </div>
        </div>

        <div className="w-somia-sill" data-still={still ? 'true' : 'false'}>
          <div className="w-somia-board" role="group" aria-label="Browse the site">
            <p className="w-somia-board__title" aria-hidden="true">
              Browse the site
            </p>
            <div className="w-somia-board__row">
              {!still && (
                <button type="button" className="w-somia-btn w-somia-btn--solid w-somia-play" onClick={togglePlay} data-cursor={playing ? undefined : 'Play'} data-playing={playing}>
                  <PlayIcon playing={playing} />
                  <span>{playing ? 'Pause' : 'Play'}</span>
                </button>
              )}
              {!still && (
                <fieldset className="w-somia-speeds">
                  <legend className="pm-sr">Speed</legend>
                  {SPEEDS.map((s) => (
                    <label key={s.value} className="w-somia-size" data-on={speed === s.value}>
                      <input
                        type="radio"
                        name="somia-speed"
                        className="pm-sr"
                        checked={speed === s.value}
                        onChange={() => {
                          setSpeed(s.value)
                          setStatus(`Tour at ${s.name}.`)
                        }}
                      />
                      <span aria-hidden="true">{s.label}</span>
                      <span className="pm-sr">{s.name}</span>
                    </label>
                  ))}
                </fieldset>
              )}
              <div className="w-somia-steps" role="group" aria-label="Sections">
                <button type="button" className="w-somia-btn w-somia-btn--ghost" onClick={() => step(-1)}>
                  <ArrowIcon dir="left" className="w-somia-btn__icon" />
                  <span>Previous</span>
                  <span className="pm-sr"> section</span>
                </button>
                <button type="button" className="w-somia-btn w-somia-btn--ghost" onClick={() => step(1)}>
                  <span>Next</span>
                  <span className="pm-sr"> section</span>
                  <ArrowIcon dir="right" className="w-somia-btn__icon" />
                </button>
              </div>
            </div>
          </div>

          <div className="w-somia-sill__tape">
            <Tape tour={tour} chapters={variant.chapters} span={span} still={still} />
            {!wide && <Subtitle tour={tour} chapters={variant.chapters} captions={page.captions} marks={marks} where="sill" />}
          </div>
          <p className="w-somia-hint">{still ? 'Motion is paused. Use the section buttons, the tape, or the arrow keys on a screen.' : 'Drag a screen, grab the tape, or focus a screen and use the arrow keys.'}</p>
        </div>
      </div>

      <p className="pm-sr" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  )
}
