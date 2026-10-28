// Plate 7, "Website": a browser window that tours the real planadigital.cat (captures of the live site): the hero, the services, the
// scroll-driven 0 h to 72 h process (a sample bakery site builds itself) and the closing footer. It scrolls by itself while the plate is
// on screen and the tab is visible; a play / pause tab, four stop tabs and six hour chips are the manual controls (arrows move between
// stops). Reduced or paused motion: it starts on the hero and nothing moves unless you choose a stop.
// Two sets of captures: the 1440 px desktop ones, and on phones the 390 px mobile ones (a shrunken desktop page would be unreadable).
// Not shown on purpose: the pricing block, the team cards, the contact band and the "maintenance" line (prices and other people's
// details stay out), which is why every segment is a crop of a capture.
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { TabButton } from '../../components/primitives'
import { useInView, useMediaQuery } from '../../lib/hooks'
import { useWorld } from '../WorldContext'
import { PLATES, TOUR_STOPS, plana } from './data'
import { Plate } from './Plate'
import { rovingKeyDown } from './roving'
import './website.css'

interface Shot {
  file: string
  /** the capture's own size in units (its pixels) */
  w: number
  h: number
}

interface Layout {
  id: 'wide' | 'phone'
  /** width of the page in capture units; the viewport is `w` x `viewH` */
  w: number
  viewH: number
  /** the sticky header, repeated on top of the glide (the top `crop` units of `shot`) */
  header: Shot & { crop: number }
  /** hero (and services, on desktop): the first `crop` units of `shot` */
  hero: Shot & { crop: number; alt: string }
  /** services as a separate segment (phone only) */
  services?: Shot & { alt: string }
  /** the six states of the process section; each is shown without its sticky header (`header.crop` units) */
  scenes: (Shot & { hours: number; alt: string })[]
  /** the closing footer: the last `crop` units of `shot` */
  closing: Shot & { crop: number; alt: string }
}

const WIDE: Layout = {
  id: 'wide',
  w: 1440,
  viewH: 900,
  header: { file: 'web/home-desktop-01.webp', w: 1440, h: 1857, crop: 67 },
  hero: {
    file: 'web/home-desktop-01.webp',
    w: 1440,
    h: 1857,
    crop: 1472, // stops before the maintenance line of the services list
    alt: 'The planadigital.cat home page: the sunrise symbol, the headline “The website for your business, ready in 72 hours”, four commitments and a list of services.',
  },
  scenes: [
    { file: 'web/home-desktop-02.webp', w: 1440, h: 900, hours: 0, alt: 'Process section at 0 hours: a wireframe of the sample bakery site.' },
    { file: 'web/home-desktop-03.webp', w: 1440, h: 900, hours: 13, alt: 'Process section at 13 hours: the sample site gains its header bar and logo.' },
    { file: 'web/home-desktop-04.webp', w: 1440, h: 900, hours: 24, alt: 'Process section at 24 hours: navigation and button appear and the headline is being typed.' },
    { file: 'web/home-desktop-05.webp', w: 1440, h: 900, hours: 36, alt: 'Process section at 36 hours: the hero text is in place and the photo is loading, blurred.' },
    { file: 'web/home-desktop-06.webp', w: 1440, h: 900, hours: 48, alt: 'Process section at 48 hours: the hero photo is sharp and buttons and tags are in place.' },
    { file: 'web/home-desktop-07.webp', w: 1440, h: 900, hours: 72, alt: 'Process section at 72 hours: the finished sample site with an online badge, product cards and a search-result tooltip.' },
  ],
  closing: {
    file: 'web/home-desktop-11.webp',
    w: 1440,
    h: 1477,
    crop: 572, // the orange footer; the contact band above it stays out
    alt: 'The closing footer of the site: an orange band with the line “See you in la Plana” and the round seal.',
  },
}

const PHONE: Layout = {
  id: 'phone',
  w: 780,
  viewH: 1600,
  header: { file: 'web/home-mobile-01.webp', w: 780, h: 1976, crop: 133 },
  hero: {
    file: 'web/home-mobile-01.webp',
    w: 780,
    h: 1976,
    crop: 1860,
    alt: 'The home page on a phone: the headline “The website for your business, ready in 72 hours”, two buttons and the sunrise symbol.',
  },
  services: {
    file: 'web/home-mobile-02.webp',
    w: 780,
    h: 1816,
    alt: 'The home page on a phone: four commitments and the start of the services list, “We say website, not 360 degree digital solution”.',
  },
  scenes: [
    { file: 'web/home-mobile-04.webp', w: 780, h: 1688, hours: 0, alt: 'Process section on a phone at 0 hours: a wireframe of the sample bakery site.' },
    { file: 'web/home-mobile-05.webp', w: 780, h: 1688, hours: 12, alt: 'Process section on a phone at about 12 hours: the sample site gains its header.' },
    { file: 'web/home-mobile-06.webp', w: 780, h: 1688, hours: 24, alt: 'Process section on a phone at 24 hours: the headline is being typed.' },
    { file: 'web/home-mobile-07.webp', w: 780, h: 1688, hours: 36, alt: 'Process section on a phone at about 36 hours: the hero text is in place and the photo is loading.' },
    { file: 'web/home-mobile-08.webp', w: 780, h: 1688, hours: 48, alt: 'Process section on a phone at 48 hours: the photo is sharp and the buttons are in place.' },
    { file: 'web/home-mobile-09.webp', w: 780, h: 1688, hours: 72, alt: 'Process section on a phone at 72 hours: the finished sample site with an online badge.' },
  ],
  closing: {
    file: 'web/home-mobile-19.webp',
    w: 780,
    h: 1708,
    crop: 849, // from where the orange band starts
    alt: 'The closing footer on a phone: “See you in la Plana” on orange, with the round seal.',
  },
}

/** the geometry of a layout: segment heights, where each stop scrolls to, the page height */
function geometry(l: Layout) {
  const top = l.hero.crop
  const services = l.services ? l.services.h : 0
  const sceneH = l.scenes[0].h - l.header.crop
  const close = l.closing.crop
  const total = top + services + sceneH + close
  const headerH = l.header.crop
  const y = [
    0, // hero
    l.services ? top - headerH : 572, // services: on desktop they are the lower part of the first segment
    top + services - headerH, // process: its first scene starts right under the sticky header
    total - l.viewH, // closing
  ]
  return { top, services, sceneH, close, total, y }
}

const DWELL = [4600, 4600, 1500, 4600] // ms on each stop (the process stop steps through its six scenes, DWELL is per scene)

const PLAY = (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
    <path d="M4 2.5v11l9-5.5z" fill="currentColor" />
  </svg>
)
const PAUSE = (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
    <path d="M3.5 2.5h3v11h-3zM9.5 2.5h3v11h-3z" fill="currentColor" />
  </svg>
)

function usePageVisible(): boolean {
  const [visible, setVisible] = useState(() => (typeof document === 'undefined' ? true : document.visibilityState !== 'hidden'))
  useEffect(() => {
    const on = () => setVisible(document.visibilityState !== 'hidden')
    document.addEventListener('visibilitychange', on)
    return () => document.removeEventListener('visibilitychange', on)
  }, [])
  return visible
}

export default function Website() {
  const { reduced, scrollRef } = useWorld()
  const phone = useMediaQuery('(max-width: 759px)')
  const layout = phone ? PHONE : WIDE
  const g = geometry(layout)
  const frame = useRef<HTMLDivElement>(null)
  const inView = useInView(frame, { root: scrollRef, threshold: 0.3 })
  const pageVisible = usePageVisible()
  const [stop, setStop] = useState(0)
  const [scene, setScene] = useState(0)
  // the scene that was on show a moment ago stays underneath while the new one wipes in over it: no two captures are ever blended
  const [seen, setSeen] = useState({ cur: 0, prev: -1 })
  if (seen.cur !== scene) setSeen({ cur: scene, prev: seen.cur })
  const [playing, setPlaying] = useState(!reduced)
  const tabs = useRef<(HTMLElement | null)[]>([])
  const warmed = useRef<string | null>(null)

  const run = playing && inView && pageVisible && !reduced

  // "Pause motion" (or the OS setting) switched on while the tour was playing: it stops where it is
  useEffect(() => {
    if (reduced) setPlaying(false)
  }, [reduced])

  // the tour: dwell on a stop, then glide to the next one (the process stop steps through its six scenes first)
  useEffect(() => {
    if (!run) return
    const id = window.setTimeout(
      () => {
        if (stop === 2 && scene < layout.scenes.length - 1) {
          setScene(scene + 1)
          return
        }
        const next = (stop + 1) % TOUR_STOPS.length
        setStop(next)
        if (next === 2) setScene(0)
      },
      stop === 2 && scene === 0 ? DWELL[2] + 900 : DWELL[stop],
    )
    return () => window.clearTimeout(id)
  }, [run, stop, scene, layout])

  // once the plate is near, fetch every picture of the tour so a stop never arrives blank
  useEffect(() => {
    if (!inView || warmed.current === layout.id) return
    warmed.current = layout.id
    const files = [layout.header.file, layout.hero.file, layout.services?.file, layout.closing.file, ...layout.scenes.map((s) => s.file)]
    files.forEach((file) => {
      if (file) new Image().src = plana(file)
    })
  }, [inView, layout])

  const choose = (i: number) => {
    setPlaying(false)
    setStop(i)
    if (i === 2) setScene((s) => (stop === 2 ? s : 0))
  }

  const y = (g.y[stop] / g.total) * 100
  const current = TOUR_STOPS[stop]
  // the whole home page is one stack of captures; only the part on show is exposed to assistive technology
  const heroOn = stop === 0 || (stop === 1 && !layout.services)
  const servicesOn = stop === 1
  const sceneCrop = (layout.header.crop / g.sceneH) * 100

  return (
    <Plate
      info={PLATES[6]}
      caption="planadigital.cat, captured from the live site: I designed the layout. The copy is Catalan, and the tour skips the pricing, team and contact sections."
    >
      <div className="w-plana-frame w-plana-site" data-layout={layout.id}>
        <div ref={frame} className="w-plana-browser" style={{ '--y': `${y}%`, '--vw': layout.w, '--vh': layout.viewH } as CSSProperties}>
          <div className="w-plana-browser__bar" aria-hidden="true">
            <span className="w-plana-browser__dots">
              <i />
              <i />
              <i />
            </span>
            <span className="w-plana-browser__url">planadigital.cat</span>
          </div>

          <div
            className="w-plana-browser__view"
            id="plana-tour-view"
            role="tabpanel"
            aria-labelledby={`plana-tour-tab-${current.id}`}
            data-cursor={playing ? undefined : 'Play'}
            onClick={() => setPlaying((p) => !p)}
          >
            <div className="w-plana-browser__nav" aria-hidden="true" style={{ aspectRatio: `${layout.w} / ${layout.header.crop}` }}>
              <img src={plana(layout.header.file)} width={layout.header.w} height={layout.header.h} alt="" loading="lazy" decoding="async" draggable={false} />
            </div>

            <div className="w-plana-browser__page" key={layout.id}>
              <div className="w-plana-seg" style={{ aspectRatio: `${layout.w} / ${g.top}` }} aria-hidden={heroOn ? undefined : true}>
                <img src={plana(layout.hero.file)} width={layout.hero.w} height={layout.hero.h} alt={layout.hero.alt} loading="lazy" decoding="async" draggable={false} />
              </div>

              {layout.services && (
                <div className="w-plana-seg" style={{ aspectRatio: `${layout.w} / ${g.services}` }} aria-hidden={servicesOn ? undefined : true}>
                  <img src={plana(layout.services.file)} width={layout.services.w} height={layout.services.h} alt={layout.services.alt} loading="lazy" decoding="async" draggable={false} />
                </div>
              )}

              <div className="w-plana-seg w-plana-seg--scenes" style={{ aspectRatio: `${layout.w} / ${g.sceneH}` }} aria-hidden={stop === 2 ? undefined : true}>
                {layout.scenes.map((s, i) => (
                  <img
                    key={s.file}
                    src={plana(s.file)}
                    width={s.w}
                    height={s.h}
                    alt={i === scene ? s.alt : ''}
                    aria-hidden={i === scene ? undefined : true}
                    data-state={i === scene ? 'on' : i === seen.prev ? 'prev' : 'off'}
                    style={{ top: `-${sceneCrop}%` }}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                ))}
              </div>

              <div className="w-plana-seg w-plana-seg--closing" style={{ aspectRatio: `${layout.w} / ${g.close}` }} aria-hidden={stop === 3 ? undefined : true}>
                <img src={plana(layout.closing.file)} width={layout.closing.w} height={layout.closing.h} alt={layout.closing.alt} loading="lazy" decoding="async" draggable={false} />
              </div>
            </div>
          </div>
        </div>

        <div className="w-plana-site__controls">
          <div className="w-plana-site__tabs">
            <TabButton
              size="sm"
              color="var(--poppy)"
              ink="var(--night)"
              icon={playing ? PAUSE : PLAY}
              iconPosition="before"
              aria-pressed={playing}
              onClick={() => setPlaying((p) => !p)}
              cursor={playing ? undefined : 'Play'}
            >
              {playing ? 'Pause tour' : 'Play tour'}
            </TabButton>

            <div
              className="w-plana-site__stops"
              role="tablist"
              aria-label="Parts of the home page"
              onKeyDown={rovingKeyDown(TOUR_STOPS.length, stop, (n) => {
                choose(n)
                tabs.current[n]?.focus()
              })}
            >
              {TOUR_STOPS.map((s, n) => (
                <TabButton
                  key={s.id}
                  ref={(el) => {
                    tabs.current[n] = el
                  }}
                  id={`plana-tour-tab-${s.id}`}
                  role="tab"
                  aria-selected={n === stop}
                  aria-controls="plana-tour-view"
                  tabIndex={n === stop ? 0 : -1}
                  size="sm"
                  color={n === stop ? 'var(--wheat)' : 'var(--paper)'}
                  ink="var(--night)"
                  selected={n === stop}
                  onClick={() => choose(n)}
                >
                  {s.label}
                </TabButton>
              ))}
            </div>
          </div>

          <div className="w-plana-site__caption" aria-live={playing ? 'off' : 'polite'}>
            <p>{current.caption}</p>
            {/* always laid out (hidden unless the process stop is on), so choosing it never changes the plate's height */}
            <div className="w-plana-site__hours-slot" data-on={stop === 2 ? 'true' : 'false'}>
              <ol className="w-plana-site__hours" aria-label="Hours in the process section">
                {layout.scenes.map((s, i) => (
                  <li key={s.hours}>
                    <button
                      type="button"
                      aria-pressed={i === scene}
                      onClick={() => {
                        setPlaying(false)
                        setScene(i)
                      }}
                    >
                      {s.hours} h
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </Plate>
  )
}
