// One holographic poster: a print with foil on it that follows the pointer (or the arrow keys, or the Tilt slider), a file tab
// that turns it over to its dossier side, and a museum label underneath.
//
//   .stage   perspective + the pointer / keyboard surface (focusable)
//   .tilt    rotateX / rotateY, written by HoloTilt (tilt.ts), never by React
//   .flip    rotateY 0 / 180 with a CSS transition
//   faces    front (print + foil layers) and back (the dossier card), each backface-hidden and inert while it is not showing
//
// Reduced / paused motion: no rotation at all (flat poster); the foil keeps a fixed light and the Tilt slider and the arrow keys
// still move that light, instantly. Flip is instant.
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from 'react'
import { motion } from 'framer-motion'
import { Scribble, TabButton } from '@/components/primitives'
import { useMediaQuery } from '@/lib/hooks'
import { spring } from '@/lib/motion'
import { useWorld } from '../WorldContext'
import { SLEEVE_PATCH, type PosterData } from './data'
import { PosterBack } from './PosterBack'
import { HoloTilt } from './tilt'
import { useStill } from './useStill'

const STEP = 1 / 3

/** what a screen reader says for the Tilt slider: "Level", or how far to which side */
const tiltText = (v: number) => (Math.abs(v) < 5 ? 'Level' : `${Math.abs(v)} percent ${v < 0 ? 'left' : 'right'}`)

function FlipIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1.3em" height="1.3em" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="9" y="8" width="6" height="8" rx="1.1" />
      <path d="M3.2 12.2a9 9 0 0 1 9-9 9.7 9.7 0 0 1 6.5 2.6L21 8" />
      <path d="M21 3.4V8h-4.6" />
      <path d="M20.8 11.8a9 9 0 0 1-9 9 9.7 9.7 0 0 1-6.5-2.6L3 16" />
      <path d="M3 20.6V16h4.6" />
    </svg>
  )
}

export function HoloPoster({ data, index }: { data: PosterData; index: number }) {
  const { next, prev } = useWorld()
  const reduced = useStill()
  const narrow = useMediaQuery('(max-width: 719px)')
  const uid = useId()
  const [flipped, setFlipped] = useState(false)

  const stageRef = useRef<HTMLDivElement>(null)
  const tiltRef = useRef<HTMLDivElement>(null)
  const foilRef = useRef<HTMLDivElement>(null)
  const sheenRef = useRef<HTMLElement>(null)
  const frontRef = useRef<HTMLDivElement>(null)
  const backRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLInputElement>(null)
  const engineRef = useRef<HoloTilt | null>(null)
  const stillRef = useRef(reduced)
  stillRef.current = reduced

  /** writes straight to the range input's DOM (no React state): the diamond shows where the poster really is */
  const showOnGauge = useCallback((x: number) => {
    const slider = sliderRef.current
    if (!slider) return
    const value = Math.round(x * 100)
    if (slider.value === String(value)) return
    slider.value = String(value)
    slider.setAttribute('aria-valuetext', tiltText(value))
  }, [])

  useEffect(() => {
    const stage = stageRef.current
    const tilt = tiltRef.current
    const foil = foilRef.current
    const sheen = sheenRef.current
    if (!stage || !tilt || !foil || !sheen) return
    const engine = new HoloTilt({
      stage,
      tilt,
      lit: [foil, sheen],
      phase: index * 2.3,
      still: stillRef.current,
      onManual: (x) => showOnGauge(x),
      onFollow: (x) => {
        // not while the visitor holds the gauge itself, and not under still motion: the poster is flat there, so the gauge must not claim a tilt
        if (!stillRef.current && document.activeElement !== sliderRef.current) showOnGauge(x)
      },
    })
    engineRef.current = engine
    return () => {
      engine.destroy()
      engineRef.current = null
    }
  }, [index, showOnGauge])

  useEffect(() => {
    engineRef.current?.setStill(reduced)
  }, [reduced])

  // the side that is not showing is out of the tab order and the accessibility tree
  useEffect(() => {
    engineRef.current?.setFlipped(flipped)
    frontRef.current?.toggleAttribute('inert', flipped)
    backRef.current?.toggleAttribute('inert', !flipped)
  }, [flipped])

  const toggle = useCallback(() => setFlipped((f) => !f), [])

  // the print fades up when it has decoded (html.js only; the box is reserved by aspect-ratio, so nothing shifts)
  const markLoaded = useCallback((img: HTMLImageElement | null) => {
    if (!img) return
    const show = () => (img.dataset.loaded = '')
    if (img.complete && img.naturalWidth > 0) show()
    else {
      img.addEventListener('load', show, { once: true })
      img.addEventListener('error', show, { once: true }) // a broken print still shows its alt text instead of an invisible box
    }
  }, [])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    const engine = engineRef.current
    switch (event.key) {
      case 'ArrowLeft':
        engine?.nudge(-STEP, 0)
        break
      case 'ArrowRight':
        engine?.nudge(STEP, 0)
        break
      case 'ArrowUp':
        engine?.nudge(0, -STEP)
        break
      case 'ArrowDown':
        engine?.nudge(0, STEP)
        break
      case 'Home':
        engine?.reset()
        break
      case 'Enter':
      case ' ':
        toggle()
        break
      default:
        return
    }
    event.preventDefault()
  }

  // The shell's [ and ] (previous / next folder) skip every <input>, because typing must stay safe; a range input is not typing, so the
  // gauge passes them on itself (same rule as the shell: no Ctrl / Meta / Alt, except AltGr, which is how Spanish layouts type them).
  const onGaugeKeyDown = (event: KeyboardEvent<HTMLLabelElement>) => {
    if (event.key !== '[' && event.key !== ']') return
    if ((event.ctrlKey || event.metaKey || event.altKey) && !event.getModifierState('AltGraph')) return
    event.preventDefault()
    if (event.key === ']') next()
    else prev()
  }

  // a click on the print turns it over; the back is for reading (and selecting text), it turns back with the tab, Enter or Space
  const onStageClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (flipped || target.closest('button, a, input')) return
    toggle()
  }

  const num = String(data.n).padStart(2, '0')
  const cardId = `${uid}-card`
  const wrapStyle = { '--rest': `${index ? 1.4 : -1.4}deg` } as CSSProperties

  return (
    <article className="w-space-monkey-poster" data-poster={data.id} data-flipped={flipped ? 'true' : 'false'} style={wrapStyle}>
      <motion.div
        className="w-space-monkey-enter"
        initial={{ opacity: 0, y: -46, rotate: index ? 4 : -4 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ ...spring.folder, delay: 0.1 + index * 0.14 }}
      >
        <div
          ref={stageRef}
          id={cardId}
          className="w-space-monkey-stage"
          role="group"
          tabIndex={0}
          aria-roledescription="holographic poster"
          aria-label={`Poster ${num} of 02: ${data.title}, ${flipped ? 'dossier side' : 'front'}`}
          aria-describedby={`${uid}-hint`}
          onKeyDown={onKeyDown}
          onClick={onStageClick}
        >
          <div ref={tiltRef} className="w-space-monkey-tilt">
            <div className="w-space-monkey-tab">
              <TabButton
                size="sm"
                tone="ultraviolet"
                cursor="Flip"
                icon={<FlipIcon />}
                iconPosition="before"
                aria-controls={cardId}
                aria-label={flipped ? `Flip ${data.title} back to the poster` : `Flip ${data.title} over to its dossier side`}
                onClick={toggle}
              >
                Flip
              </TabButton>
            </div>

            <div className="w-space-monkey-flip">
              <div ref={frontRef} className="w-space-monkey-face w-space-monkey-front" aria-hidden={flipped} data-cursor="Flip">
                <div className="w-space-monkey-print">
                  <img
                    className="w-space-monkey-art"
                    src={data.src}
                    srcSet={`${data.thumb} 600w, ${data.src} ${data.width}w`}
                    sizes="(max-width: 720px) 90vw, 30vw"
                    width={data.width}
                    height={data.height}
                    alt={data.alt}
                    decoding="async"
                    loading={index === 0 || !narrow ? 'eager' : 'lazy'}
                    ref={markLoaded}
                    {...(index === 0 ? ({ fetchpriority: 'high' } as Record<string, string>) : null)}
                    draggable={false}
                  />
                  <div ref={foilRef} className="w-space-monkey-foil" aria-hidden="true">
                    <i className="w-space-monkey-foil-bow" />
                    <i className="w-space-monkey-foil-dodge" />
                    <i className="w-space-monkey-foil-lines" />
                    <i className="w-space-monkey-foil-glitter w-space-monkey-foil-glitter-a" />
                    <i className="w-space-monkey-foil-glitter w-space-monkey-foil-glitter-b" />
                    <i className="w-space-monkey-foil-spec" />
                  </div>
                  {data.id === 'smith' && (
                    <span
                      className="w-space-monkey-sleeve"
                      aria-hidden="true"
                      style={{ '--x': `${SLEEVE_PATCH.x * 100}%`, '--y': `${SLEEVE_PATCH.y * 100}%`, '--r': `${SLEEVE_PATCH.r * 200}%` } as CSSProperties}
                    >
                      {/* a dark ring under the yellow one: the grease pencil stays readable on the yellow epaulette next to it */}
                      <Scribble className="w-space-monkey-sleeve-under" kind="circle" at="around" color="var(--sm-space)" stroke={7.2} draw={false} seed="sleeve" />
                      <Scribble kind="circle" at="around" color="var(--sm-yellow)" stroke={3.8} draw={900} seed="sleeve" />
                    </span>
                  )}
                </div>
              </div>

              <div ref={backRef} className="w-space-monkey-face w-space-monkey-back" aria-hidden={!flipped}>
                <PosterBack data={data} flipped={flipped} sheenRef={sheenRef} />
              </div>
            </div>
          </div>
        </div>
        <span id={`${uid}-hint`} className="pm-sr">
          Arrow keys tilt the poster, Home levels it, Enter turns it over.
        </span>
        <div className="w-space-monkey-strip">
          <label className="w-space-monkey-tiltctl" onKeyDown={onGaugeKeyDown}>
            <span className="w-space-monkey-tiltctl-text">Tilt</span>
            <span className="w-space-monkey-tiltscale">
              <input
                ref={sliderRef}
                type="range"
                min={-100}
                max={100}
                step={5}
                defaultValue={0}
                aria-label={`Tilt the ${data.title} poster`}
                aria-valuetext="Level"
                data-cursor="Drag"
                onChange={(event) => {
                  const value = Number(event.currentTarget.value)
                  event.currentTarget.setAttribute('aria-valuetext', tiltText(value))
                  engineRef.current?.setManualX(value / 100)
                }}
              />
            </span>
          </label>
          <span className="pm-sr" role="status" aria-live="polite">
            {flipped ? `${data.title}: dossier side showing` : `${data.title}: poster showing`}
          </span>
        </div>
      </motion.div>
    </article>
  )
}
