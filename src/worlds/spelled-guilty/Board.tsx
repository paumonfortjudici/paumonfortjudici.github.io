// Exhibit C: the evidence board. Sixteen die-cut suspects (drag them, or pick one up with Space and move it with the arrow
// keys) and six line-ups (click one to pull its file onto the index card), pinned with red string that follows every pin.
// Below 1024 px the wall becomes two swipe rows (line-ups, suspects) with the same typed card.
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { animate, motion, motionValue } from 'framer-motion'
import { PaperClip, Pin, Scribble, StickyNote, TabButton, Tape } from '@/components/primitives'
import { asset } from '@/lib/asset'
import { useMediaQuery } from '@/lib/hooks/useMediaQuery'
import { useWorldEscape } from '../WorldContext'
import { Stars } from './Reader'
import { CARD, NOTE, TIMELINE, BOARD_H, placeLinks, placePrints, placeSuspects, type PrintPlace, type SuspectPlace } from './boardLayout'
import { SG } from './copy'
import { BASE } from './data'
import './sg-board.css'

const pad2 = (n: number): string => String(n).padStart(2, '0')
const src = (file: string): string => asset(`${BASE}/${file}`)
const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v))

const suspectName = (p: SuspectPlace): string => SG.board.suspectLabel(p.item.letter, p.item.case, p.item.title, p.item.year)

/** the typed index card: what the pulled line-up says */
function Card({ print, onRead, className }: { print: PrintPlace | undefined; onRead: (caseNo: number) => void; className?: string }) {
  return (
    <div className={`w-sg-card ${className ?? ''}`} role="status" aria-live="polite">
      <Tape at="top" color="butter" w="5rem" h="1.4rem" rotate={2} />
      {print ? (
        <>
          <p className="w-sg-type w-sg-card__kicker">
            <span>{SG.board.cardKicker(print.art.case, SG.reader.difficulty[print.art.difficulty])}</span>
            <Stars level={print.art.difficulty} />
          </p>
          <p className="w-sg-card__title">{print.art.title}</p>
          <p className="w-sg-card__line">
            {print.art.setting}
          </p>
          {print.inBook ? (
            <TabButton size="sm" tone="ink" icon="arrow-right" cursor="Flip" onClick={() => onRead(print.art.case)} className="w-sg-card__read">
              {SG.board.cardRead}
            </TabButton>
          ) : (
            <p className="w-sg-card__line w-sg-card__line--small w-sg-card__muted">{SG.board.cardNotIn}</p>
          )}
        </>
      ) : (
        <p className="w-sg-card__title">{SG.board.cardEmpty}</p>
      )}
    </div>
  )
}

function Print({ p, selected, onPick, carousel }: { p: PrintPlace; selected: boolean; onPick: () => void; carousel?: boolean }) {
  const style = carousel ? undefined : ({ '--x': p.x, '--y': p.y, '--w': p.w, '--r': `${p.rot}deg` } as React.CSSProperties)
  return (
    <button
      type="button"
      className="w-sg-print"
      style={style}
      aria-pressed={selected}
      aria-label={SG.board.lineupLabel(p.art.case, p.art.title)}
      data-cursor="Open"
      data-carousel={carousel ? '' : undefined}
      onClick={onPick}
    >
      <span className="w-sg-print__img">
        <img src={src(p.art.file)} alt="" width={p.art.w} height={p.art.h} loading="lazy" decoding="async" draggable={false} />
      </span>
      <span className="w-sg-print__cap w-sg-type">
        Case {pad2(p.art.case)} · {p.art.year}
      </span>
      <Pin className="w-sg-print__pin" color="marigold" size={carousel ? '1.5rem' : 'calc(2.1 * 1cqw)'} />
      {selected ? <PaperClip className="w-sg-print__clip" color="tomato" rotate={-10} /> : null}
    </button>
  )
}

export default function Board({ still, onRead }: { still: boolean; onRead: (caseNo: number) => boolean }) {
  const places = useMemo(() => placeSuspects(), [])
  const prints = useMemo(() => placePrints(), [])
  const links = useMemo(() => placeLinks(places, prints), [places, prints])
  const mvs = useMemo(() => new Map(places.map((p) => [p.id, { x: motionValue(0), y: motionValue(0) }])), [places])

  const boardRef = useRef<HTMLDivElement>(null)
  const pathRefs = useRef<(SVGPathElement | null)[]>([])
  const shadowRefs = useRef<(SVGPathElement | null)[]>([])
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [selected, setSelected] = useState<number>(7)
  const [grabbed, setGrabbed] = useState<string | null>(null)
  const [active, setActive] = useState(0)
  const [order, setOrder] = useState<string[]>(() => places.map((p) => p.id))
  const [live, setLive] = useState('')
  const grabFrom = useRef<{ x: number; y: number } | null>(null)
  /** where each suspect is heading (keyboard nudges add up even while the spring is still moving) */
  const targets = useRef<Record<string, { x: number; y: number }>>({})

  const selectedPrint = prints.find((p) => p.art.case === selected)
  const wall = useMediaQuery('(min-width: 1024px)')

  // the wall's size in pixels (strings are drawn in pixels; everything else scales in container units)
  useEffect(() => {
    const el = boardRef.current
    if (!el) return
    const apply = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // strings: recomputed whenever a suspect moves (one rAF per burst of changes, no React state)
  useEffect(() => {
    if (size.w === 0) return
    const k = size.w / 100
    const pin = new Map<string, () => { x: number; y: number }>()
    for (const p of places) {
      const m = mvs.get(p.id)!
      pin.set(p.id, () => ({ x: (p.x + p.w / 2) * k + m.x.get(), y: (p.y + 1.1) * k + m.y.get() }))
    }
    for (const q of prints) pin.set(q.id, () => ({ x: (q.x + q.w / 2) * k, y: (q.y + 0.55) * k }))

    const draw = () => {
      links.forEach((l, i) => {
        const a = pin.get(l.a)?.()
        const b = pin.get(l.b)?.()
        if (!a || !b) return
        const dist = Math.hypot(b.x - a.x, b.y - a.y)
        const sag = dist * (l.kind === 'row' ? 0.1 : 0.07)
        const d = `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${((a.x + b.x) / 2).toFixed(1)} ${((a.y + b.y) / 2 + sag).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`
        pathRefs.current[i]?.setAttribute('d', d)
        shadowRefs.current[i]?.setAttribute('d', d)
      })
    }
    let raf = 0
    const schedule = () => {
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0
          draw()
        })
      }
    }
    draw()
    const unsubscribe: (() => void)[] = []
    mvs.forEach((m) => {
      unsubscribe.push(m.x.on('change', schedule), m.y.on('change', schedule))
    })
    return () => {
      unsubscribe.forEach((u) => u())
      if (raf) cancelAnimationFrame(raf)
    }
  }, [size.w, places, prints, links, mvs])

  const toFront = useCallback((id: string) => setOrder((o) => (o[o.length - 1] === id ? o : [...o.filter((i) => i !== id), id])), [])

  const moveTo = useCallback(
    (id: string, x: number, y: number) => {
      const m = mvs.get(id)
      if (!m) return
      targets.current[id] = { x, y }
      if (still) {
        m.x.set(x)
        m.y.set(y)
      } else {
        animate(m.x, x, { type: 'spring', stiffness: 520, damping: 42 })
        animate(m.y, y, { type: 'spring', stiffness: 520, damping: 42 })
      }
    },
    [mvs, still],
  )

  const nudge = useCallback(
    (p: SuspectPlace, dx: number, dy: number) => {
      const m = mvs.get(p.id)
      const board = boardRef.current
      if (!m || !board) return
      const k = board.clientWidth / 100
      const lo = { x: -p.x * k, y: -p.y * k }
      const hi = { x: board.clientWidth - (p.x + p.w) * k, y: board.clientHeight - (p.y + p.h) * k }
      const from = targets.current[p.id] ?? { x: m.x.get(), y: m.y.get() }
      moveTo(p.id, clamp(from.x + dx, lo.x, hi.x), clamp(from.y + dy, lo.y, hi.y))
    },
    [mvs, moveTo],
  )

  const drop = useCallback(
    (p: SuspectPlace, cancel = false) => {
      if (cancel && grabFrom.current) moveTo(p.id, grabFrom.current.x, grabFrom.current.y)
      grabFrom.current = null
      setGrabbed(null)
      setLive(SG.board.liveDrop(suspectName(p)))
    },
    [moveTo],
  )

  // Escape puts a picked-up suspect back before it would close the world
  useWorldEscape(grabbed !== null, () => {
    const p = places.find((s) => s.id === grabbed)
    if (p) drop(p, true)
  })

  const tidy = useCallback(() => {
    places.forEach((p) => moveTo(p.id, 0, 0))
    setOrder(places.map((p) => p.id))
    setGrabbed(null)
    grabFrom.current = null
    setLive(SG.board.liveTidy)
  }, [places, moveTo])

  const focusAt = (i: number) => {
    const next = (i + places.length) % places.length
    setActive(next)
    nodeRefs.current[places[next].id]?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>, p: SuspectPlace, i: number) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return
    const held = grabbed === p.id
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      if (held) drop(p)
      else {
        const m = mvs.get(p.id)!
        grabFrom.current = { x: m.x.get(), y: m.y.get() }
        setGrabbed(p.id)
        toFront(p.id)
        setLive(SG.board.liveGrab(suspectName(p)))
      }
      return
    }
    if (held) {
      const step = event.shiftKey ? 64 : 16
      const move: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
      const d = move[event.key]
      if (d) {
        event.preventDefault()
        nudge(p, d[0], d[1])
      }
      return
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusAt(i + 1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusAt(i - 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      focusAt(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      focusAt(places.length - 1)
    }
  }

  const read = (caseNo: number) => {
    onRead(caseNo)
  }

  return (
    <section className="w-sg-boardsec w-sg-station" aria-labelledby="sg-board-title">
      <header className="w-sg-head w-sg-head--split">
        <p className="w-sg-tag w-sg-type">{SG.board.exhibit}</p>
        <h3 id="sg-board-title" className="w-sg-h3 w-sg-key">
          {SG.board.title}
        </h3>
        <p className="w-sg-sub">{wall ? SG.board.sub : SG.board.subTouch}</p>
      </header>

      <div className="w-sg-frame w-sg-wall">
        <div className="w-sg-frame__tab">
          <TabButton size="sm" tone="cream" onClick={tidy} aria-label={SG.board.tidyLabel} cursor="Open">
            {SG.board.tidy}
          </TabButton>
        </div>
        <div ref={boardRef} className="w-sg-board" role="group" aria-label={SG.board.boardLabel} style={{ aspectRatio: `100 / ${BOARD_H}` }}>
          <div className="w-sg-note" style={{ '--x': NOTE.x, '--y': NOTE.y, '--w': NOTE.w } as React.CSSProperties}>
            <StickyNote color="butter" rotate={-3} pin="pin" w="100%">
              drag them around
            </StickyNote>
          </div>
          <div className="w-sg-timeline w-sg-hand" style={{ '--x': TIMELINE.x, '--y': TIMELINE.y, '--w': TIMELINE.w } as React.CSSProperties} aria-hidden="true">
            <span>{SG.board.first}</span>
            <Scribble kind="arrow" dir="right" color="var(--cream)" w="100%" ratio={9} stroke={3} />
            <span>{SG.board.last}</span>
          </div>

          {prints.map((p) => (
            <Print key={p.id} p={p} selected={selected === p.art.case} onPick={() => setSelected(p.art.case)} />
          ))}

          <div className="w-sg-cardwrap" style={{ '--x': CARD.x, '--y': CARD.y, '--w': CARD.w } as React.CSSProperties}>
            <Card print={selectedPrint} onRead={read} />
          </div>

          {places.map((p, i) => {
            const m = mvs.get(p.id)!
            const held = grabbed === p.id
            return (
              <motion.div
                key={p.id}
                ref={(node) => {
                  nodeRefs.current[p.id] = node
                }}
                className="w-sg-sus"
                data-held={held ? '' : undefined}
                data-match={selectedPrint && selectedPrint.art.case === p.item.case ? '' : undefined}
                style={{ '--x': p.x, '--y': p.y, '--w': p.w, x: m.x, y: m.y, rotate: p.rot, zIndex: 10 + order.indexOf(p.id) } as never}
                drag
                dragConstraints={boardRef}
                dragMomentum={false}
                dragElastic={0.05}
                whileDrag={still ? undefined : { scale: 1.06 }}
                onDragStart={() => toFront(p.id)}
                onDragEnd={() => {
                  targets.current[p.id] = { x: m.x.get(), y: m.y.get() }
                }}
                onFocus={() => setActive(i)}
                onKeyDown={(e) => onKeyDown(e, p, i)}
                tabIndex={active === i ? 0 : -1}
                role="button"
                aria-roledescription="draggable suspect"
                aria-pressed={held}
                aria-label={suspectName(p)}
                data-cursor="Drag"
              >
                <img src={src(p.item.file)} alt="" width={p.item.w} height={p.item.h} loading="lazy" decoding="async" draggable={false} />
                <Pin className="w-sg-sus__pin" color="marigold" size="calc(1.9 * 1cqw)" />
                <span className="w-sg-sus__tag" aria-hidden="true">
                  <b>{p.item.year}</b>
                  <i>
                    {pad2(p.item.case)} {p.item.letter}
                  </i>
                </span>
              </motion.div>
            )
          })}

          <svg className="w-sg-threads" viewBox={`0 0 ${size.w || 100} ${size.h || BOARD_H}`} aria-hidden="true" focusable="false">
            {links.map((l, i) => (
              <g key={`${l.a}-${l.b}`} data-kind={l.kind} data-on={l.kind === 'row' || l.cases?.includes(selected) ? '' : undefined}>
                <path ref={(n) => (shadowRefs.current[i] = n)} className="w-sg-thread__shadow" pathLength={1} />
                <path ref={(n) => (pathRefs.current[i] = n)} className="w-sg-thread" pathLength={1} />
              </g>
            ))}
          </svg>
        </div>
      </div>

      <p className="w-sg-keys w-sg-boardsec__keys">{SG.board.keys}</p>

      {/* phones and small tablets: the wall becomes two swipe rows */}
      <div className="w-sg-swipe">
        <h4 className="w-sg-type w-sg-swipe__label">{SG.board.carouselLineups}</h4>
        <ul className="w-sg-swipe__track" aria-label={SG.board.carouselLineups}>
          {prints.map((p) => (
            <li key={p.id}>
              <Print p={p} carousel selected={selected === p.art.case} onPick={() => setSelected(p.art.case)} />
            </li>
          ))}
        </ul>
        <Card print={selectedPrint} onRead={read} className="w-sg-card--swipe" />
        <h4 className="w-sg-type w-sg-swipe__label">{SG.board.carouselSuspects}</h4>
        <ul className="w-sg-swipe__track w-sg-swipe__track--sus" aria-label={SG.board.carouselSuspects}>
          {places.map((p) => (
            <li key={p.id}>
              <figure className="w-sg-susfig" style={{ '--sw': p.item.w / p.item.h } as React.CSSProperties}>
                <img src={src(p.item.file)} alt={suspectName(p)} width={p.item.w} height={p.item.h} loading="lazy" decoding="async" draggable={false} />
                <Pin className="w-sg-sus__pin" color="marigold" size="1.5rem" />
                <figcaption className="w-sg-sus__tag">
                  <b>{p.item.year}</b>
                  <i>
                    {pad2(p.item.case)} {p.item.letter}
                  </i>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>

      <p className="pm-sr" role="status" aria-live="polite">
        {live}
      </p>
    </section>
  )
}
