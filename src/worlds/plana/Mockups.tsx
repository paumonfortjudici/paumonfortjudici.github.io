// Plate 5, "Mockups": a draggable rail (with momentum) of the six applications of the system. Drag it, swipe it, press the tabs, or
// focus it and use the arrow keys / Home / End. Every picture is tagged "Sample mockup": the contact details, the bakery and the
// Instagram numbers inside them are placeholders, never real clients. Captions are English; the pictures' own text is Catalan.
import { animate, motion, useMotionValue, useMotionValueEvent } from 'framer-motion'
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { TabButton } from '../../components/primitives'
import { useWorld } from '../WorldContext'
import { MOCKUPS, PLATES, plana } from './data'
import { Plate } from './Plate'
import './mockups.css'

export default function Mockups() {
  const { reduced } = useWorld()
  const viewport = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const [min, setMin] = useState(0) // the furthest the track may travel (<= 0)
  const [offsets, setOffsets] = useState<number[]>([])
  const [index, setIndex] = useState(0)
  const [live, setLive] = useState('')
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)
  const target = useRef(0) // the slot the rail is heading for: quick presses must add up before the spring has arrived

  // measure: how far the track can travel, and where each picture starts
  useEffect(() => {
    const measure = () => {
      const v = viewport.current
      const t = track.current
      if (!v || !t) return
      setMin(Math.min(0, v.clientWidth - t.scrollWidth))
      setOffsets(Array.from(t.children).map((c) => (c as HTMLElement).offsetLeft - 16))
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (viewport.current) ro.observe(viewport.current)
    if (track.current) ro.observe(track.current)
    return () => ro.disconnect()
  }, [])

  const nearest = useCallback(
    (value: number) => {
      if (offsets.length === 0) return 0
      let best = 0
      offsets.forEach((o, i) => {
        if (Math.abs(o + value) < Math.abs(offsets[best] + value)) best = i
      })
      return best
    },
    [offsets],
  )

  useMotionValueEvent(x, 'change', (v) => {
    setAtStart(v >= -1)
    setAtEnd(v <= min + 1)
    setIndex(nearest(v))
  })

  useEffect(() => {
    setAtEnd(x.get() <= min + 1)
    setIndex(nearest(x.get()))
  }, [min, nearest, x])

  const announce = (i: number) => setLive(`Mockup ${i + 1} of ${MOCKUPS.length}: ${MOCKUPS[i].title}`)

  const goTo = (i: number) => {
    const slot = Math.max(0, Math.min(MOCKUPS.length - 1, i))
    const to = Math.max(min, Math.min(0, -(offsets[slot] ?? 0)))
    target.current = slot
    if (reduced) x.set(to)
    else animate(x, to, { type: 'spring', stiffness: 300, damping: 34, mass: 0.8 })
    announce(slot)
  }

  const step = (dir: 1 | -1) => goTo(target.current + dir)

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') step(1)
    else if (event.key === 'ArrowLeft') step(-1)
    else if (event.key === 'Home') goTo(0)
    else if (event.key === 'End') goTo(MOCKUPS.length - 1)
    else return
    event.preventDefault()
  }

  return (
    <Plate
      info={PLATES[4]}
      caption="Six applications of the system. All six are sample mockups: the contact details, the bakery and the Instagram numbers inside them are placeholders, not clients."
    >
      <div className="w-plana-frame w-plana-rail">
        <div
          ref={viewport}
          className="w-plana-rail__viewport"
          role="group"
          aria-roledescription="carousel"
          aria-label="Six sample mockups. Use the left and right arrow keys, or drag."
          tabIndex={0}
          onKeyDown={onKeyDown}
          data-cursor="Drag"
        >
          <motion.div
            ref={track}
            className="w-plana-rail__track"
            drag="x"
            dragConstraints={{ left: min, right: 0 }}
            dragElastic={reduced ? 0 : 0.12}
            dragMomentum={!reduced}
            dragTransition={{ power: 0.28, timeConstant: 280, bounceStiffness: 260, bounceDamping: 30 }}
            style={{ x }}
            onDragStart={() => {
              target.current = nearest(x.get())
            }}
            onDragTransitionEnd={() => {
              // the rail comes to rest on a print, like a card dropped into a slot
              const i = nearest(x.get())
              if (!reduced) goTo(i)
              else {
                target.current = i
                announce(i)
              }
            }}
          >
            {MOCKUPS.map((m, i) => (
              <figure key={m.id} className="w-plana-shot" data-tilt={i % 2 === 0 ? 'a' : 'b'} aria-label={`${i + 1} of ${MOCKUPS.length}: ${m.title}`}>
                <div className="w-plana-shot__print">
                  <img src={plana(m.file)} width={m.w} height={m.h} alt={m.alt} loading="lazy" decoding="async" draggable={false} />
                  <span className="w-plana-shot__tag">Sample mockup</span>
                </div>
                <figcaption className="w-plana-shot__label">
                  <strong>{m.title}</strong>
                  <span>{m.caption}</span>
                  {m.placeholder && <em>{m.placeholder}</em>}
                </figcaption>
              </figure>
            ))}
          </motion.div>
        </div>

        <div className="w-plana-rail__bar">
          <TabButton
            size="sm"
            tone={{ color: 'var(--night)', ink: 'var(--paper)' }}
            icon="arrow-left"
            iconPosition="before"
            aria-disabled={atStart || undefined}
            aria-label="Previous mockup"
            onClick={() => !atStart && step(-1)}
          >
            Prev
          </TabButton>
          <p className="w-plana-rail__count" aria-hidden="true">
            <span>{String(index + 1).padStart(2, '0')}</span> / {String(MOCKUPS.length).padStart(2, '0')}
            <em>{MOCKUPS[index].title}</em>
          </p>
          <TabButton
            size="sm"
            tone={{ color: 'var(--night)', ink: 'var(--paper)' }}
            icon="arrow-right"
            aria-disabled={atEnd || undefined}
            aria-label="Next mockup"
            onClick={() => !atEnd && step(1)}
          >
            Next
          </TabButton>
          <p className="pm-sr" role="status" aria-live="polite">
            {live}
          </p>
        </div>
      </div>
    </Plate>
  )
}
