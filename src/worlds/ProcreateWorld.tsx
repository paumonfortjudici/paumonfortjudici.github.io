// World 6 · Procreate Sketchbook · "Sketchbook Wall"
// A hand-made wall: four early drawings taped, pinned and clipped to kraft paper on a cork board. Pick a print up and drag it
// (momentum, a soft bounce at the edges), or do it without a pointer: Tab to a print, arrows nudge it, R turns it, Enter opens
// a close-up. "Tidy up" (the ruler) squares everything up, "Shuffle" scatters it, the eraser rubs out the handwritten notes.
// The layout engine is in ./procreate/layout.ts, the content in ./procreate/data.ts, the objects in ./procreate/*.tsx.
import { Fragment, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Pin, Scribble, Stamp, Tape, TabButton, WorldFacts } from '../components/primitives'
import { usePointerFine } from '../lib/hooks'
import { useWorld } from './WorldContext'
import { COPY, PORTRAIT_PALETTE, PRINTS, src, type PrintId } from './procreate/data'
import { CHIP_AT, fromNorm, kindFor, pickupSpot, planFor, scatter, toNorm, type Mode, type Plan, type Pose, type PoseMap } from './procreate/layout'
import { aimBetween } from './procreate/aim'
import { Lightbox } from './procreate/Lightbox'
import { Line } from './procreate/Line'
import { Print, type PrintHandle } from './procreate/Print'
import { Scar } from './procreate/Scars'
import { EraserArt, LoupeIcon, PencilArt, RulerArt } from './procreate/Props'
import './procreate/procreate.css'

interface Geo {
  w: number
  h: number
  viewH: number
}

// The small pictures are fetched as soon as this chunk loads (a card hover or focus prefetches it), so the prints are already
// in the cache when the folder has finished opening and none of them lands on the wall as blank paper.
if (typeof window !== 'undefined') {
  for (const def of PRINTS) {
    const img = new Image()
    img.decoding = 'async'
    img.src = src.thumb(def)
  }
}

const STACK: PrintId[] = ['logo', 'crest', 'quiff', 'cap']

/** the little prints of the index are glued on a touch crooked, each its own way */
const THUMB_TILT = [-2.2, 1.6, 2.1, -1.7]

/** the pencil marks that appear round the squared-up row (Tidy up): numbers over the prints in reading order, a measuring line under them */
function Measure({ row, s, h }: { row: NonNullable<Plan['row']>; s: number; h: number }) {
  const above = row.top
  const below = Math.max(0, h - row.bottom)
  const font = Math.max(20, Math.min(34, s * 25))
  return (
    <span className="w-procreate-measure" aria-hidden="true">
      {row.centres.map((c, i) => (
        <span key={c.id} className="w-procreate-measure-n" style={{ left: c.cx - c.w / 2 + font * 0.8, top: Math.max(4, row.top - Math.min(above - 4, font + 14)), fontSize: font }}>
          {i + 1}
        </span>
      ))}
      <span className="w-procreate-measure-line" style={{ left: row.left, width: row.right - row.left, top: row.bottom + Math.min(below / 2, 40) }}>
        <span className="w-procreate-measure-word" style={{ fontSize: font * 0.8 }}>hung level</span>
      </span>
    </span>
  )
}

/** a print counts as away from where it was hung when it has moved by more than a hand's width of paper edge */
function awayFrom(poses: PoseMap, plan: Plan): Partial<Record<PrintId, boolean>> {
  const out: Partial<Record<PrintId, boolean>> = {}
  for (const def of PRINTS) {
    const p = poses[def.id]
    const h = plan.loose[def.id]
    out[def.id] = Math.hypot(p.x - h.x, p.y - h.y) > 26 || Math.abs(p.rot - h.rot) > 9 || (p.scale ?? 1) < 0.97
  }
  return out
}

export default function ProcreateWorld() {
  const { work, scrollRef, reduced } = useWorld()
  const pointerFine = usePointerFine()
  const hintId = useId()
  const indexId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const wallRef = useRef<HTMLDivElement>(null)

  const [geo, setGeo] = useState<Geo | null>(null)
  const [mode, setMode] = useState<Mode>('loose')
  const [order, setOrder] = useState<PrintId[]>(STACK)
  const [notes, setNotes] = useState(true)
  // the first time anything is picked up, turned, squared up or shuffled, the wall's own "pick one up" note has done its job
  const [touched, setTouched] = useState(false)
  const [open, setOpen] = useState<number | null>(null)
  // the print that was looked at closely gets a FILED stamp when the close-up is put away (a moment, then it fades)
  const [filed, setFiled] = useState<{ id: PrintId; n: number } | null>(null)
  const filedTimer = useRef<number | undefined>(undefined)
  const openNow = useRef<number | null>(null)
  openNow.current = open
  const [status, setStatus] = useState('')
  const [host, setHost] = useState<HTMLElement | null>(null)
  // which prints are away from the place they were hung in (their pin hole and tape ghosts show on the wall)
  const [away, setAway] = useState<Partial<Record<PrintId, boolean>>>({})

  const handles = useRef<Partial<Record<PrintId, PrintHandle>>>({})
  const norm = useRef<Partial<Record<PrintId, Pose>>>({})
  const modeRef = useRef<Mode>('loose')
  const shuffles = useRef(0)
  const intro = useRef(true)
  const notesRef = useRef(true)
  const announceTimer = useRef<number | undefined>(undefined)
  const lastKind = useRef<string>('')
  const opener = useRef<HTMLElement | null>(null)
  const openRef = useRef(false)
  const stillNow = useRef(false)
  stillNow.current = reduced
  modeRef.current = mode

  // ---- measuring the wall ------------------------------------------------------------------------------------------------
  useLayoutEffect(() => {
    const wall = wallRef.current
    const scroller = scrollRef.current
    if (!wall || !scroller) return
    setHost(scroller.parentElement)
    const read = () => {
      const w = Math.round(wall.clientWidth)
      const h = Math.round(wall.clientHeight)
      const viewH = Math.round(scroller.clientHeight)
      setGeo((prev) => (prev && prev.w === w && prev.h === h && prev.viewH === viewH ? prev : { w, h, viewH }))
    }
    read()
    const ro = new ResizeObserver(read)
    ro.observe(wall)
    ro.observe(scroller)
    return () => ro.disconnect()
  }, [scrollRef])

  const kind = geo ? kindFor(geo.w, geo.viewH) : null
  // stacked walls are as tall as their prints; the wide wall is as tall as the viewport leaves it
  const planKey = geo && kind ? `${kind}:${geo.w}:${kind === 'wide' ? geo.h : 0}` : ''
  const plan: Plan | null = useMemo(() => (geo && kind ? planFor(kind, geo.w, geo.h) : null), [planKey]) // eslint-disable-line react-hooks/exhaustive-deps
  const wallH = plan ? plan.wallH : 0

  // ---- placing the prints ------------------------------------------------------------------------------------------------
  const storeNorm = useCallback(
    (poses: PoseMap, p: Plan, w: number) => {
      for (const def of PRINTS) norm.current[def.id] = toNorm(poses[def.id], p.dims[def.id], w, p.wallH)
    },
    [],
  )

  // Every later size change re-places the prints at once (no glide while the window is being dragged): a named arrangement
  // is laid out again for the new size, a hand-made one is projected from where each print was.
  useLayoutEffect(() => {
    if (!plan || !geo) return
    const changedKind = lastKind.current !== '' && lastKind.current !== plan.kind
    lastKind.current = plan.kind
    if (intro.current) {
      // the prints put themselves down when they first mount (see `home` below)
      intro.current = false
      storeNorm(plan.loose, plan, geo.w)
      return
    }
    if (changedKind) setMode('loose')
    const current = changedKind ? 'loose' : modeRef.current

    let poses: PoseMap
    if (current === 'tidy') poses = plan.tidy
    else if (current === 'loose' || Object.keys(norm.current).length === 0) poses = plan.loose
    else {
      poses = {} as PoseMap
      for (const def of PRINTS) poses[def.id] = fromNorm(norm.current[def.id] as Pose, plan.dims[def.id], geo.w, plan.wallH)
    }
    PRINTS.forEach((def) => handles.current[def.id]?.moveTo(poses[def.id], { instant: true }))
    storeNorm(poses, plan, geo.w)
    setAway(awayFrom(poses, plan))
  }, [planKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // the polite live region is emptied first, so the same message can be announced twice in a row
  const announce = useCallback((text: string) => {
    window.clearTimeout(announceTimer.current)
    setStatus('')
    announceTimer.current = window.setTimeout(() => setStatus(text), 40)
  }, [])
  useEffect(() => () => window.clearTimeout(announceTimer.current), [])
  useEffect(() => () => window.clearTimeout(filedTimer.current), [])

  const arrange = useCallback(
    (next: 'loose' | 'tidy' | 'shuffle') => {
      if (!plan || !geo) return
      setTouched(true)
      let poses: PoseMap
      if (next === 'tidy') poses = plan.tidy
      else if (next === 'loose') poses = plan.loose
      else {
        shuffles.current += 1
        poses = scatter(plan, geo.w, shuffles.current)
      }
      setMode(next)
      PRINTS.forEach((def, i) => handles.current[def.id]?.moveTo(poses[def.id], { delay: i * 0.055 }))
      storeNorm(poses, plan, geo.w)
      setAway(awayFrom(poses, plan))
      if (next === 'shuffle') {
        setOrder((prev) => {
          const rand = [...prev]
          for (let i = rand.length - 1; i > 0; i--) {
            const j = (shuffles.current * 7 + i * 3) % (i + 1)
            ;[rand[i], rand[j]] = [rand[j], rand[i]]
          }
          return rand
        })
      }
      announce(COPY.status[next])
    },
    [plan, geo, storeNorm, announce],
  )

  const toggleTidy = useCallback(() => arrange(modeRef.current === 'tidy' ? 'loose' : 'tidy'), [arrange])
  const toggleNotes = useCallback(() => {
    const next = !notesRef.current
    notesRef.current = next
    setNotes(next)
    announce(next ? COPY.status.notesOn : COPY.status.notesOff)
  }, [announce])

  const raise = useCallback((id: PrintId) => setOrder((prev) => (prev[prev.length - 1] === id ? prev : [...prev.filter((i) => i !== id), id])), [])
  const moved = useCallback((id: PrintId) => {
    setTouched(true)
    if (modeRef.current === 'loose' || modeRef.current === 'tidy') setMode('custom')
    setAway((prev) => (prev[id] ? prev : { ...prev, [id]: true }))
  }, [])
  const settled = useCallback(
    (id: PrintId, pose: Pose) => {
      if (!plan || !geo) return
      norm.current[id] = toNorm(pose, plan.dims[id], geo.w, plan.wallH)
    },
    [plan, geo],
  )

  // ---- the close-up ------------------------------------------------------------------------------------------------------
  const openAt = useCallback((index: number, from?: HTMLElement | null) => {
    if (openRef.current) return // a double tap must not open it twice (and must not take the close-up itself for the opener)
    openRef.current = true
    // focus comes back to whatever opened the close-up (a row of the index hands over its own tab)
    opener.current = from ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null)
    setOpen(index)
  }, [])
  const openPrint = useCallback((id: PrintId) => openAt(PRINTS.findIndex((p) => p.id === id)), [openAt])
  const closeUp = useCallback(() => {
    openRef.current = false
    const at = openNow.current
    if (at !== null && !stillNow.current) {
      window.clearTimeout(filedTimer.current)
      setFiled({ id: PRINTS[at].id, n: Date.now() })
      filedTimer.current = window.setTimeout(() => setFiled(null), 1900)
    }
    setOpen(null)
    const back = opener.current
    window.setTimeout(() => {
      if (back && back.isConnected) back.focus({ preventScroll: true })
    }, 0)
  }, [])

  // the wall and the page behind the close-up are not reachable while it is open
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (open !== null) root.setAttribute('inert', '')
    else root.removeAttribute('inert')
    return () => root.removeAttribute('inert')
  }, [open])

  const tidy = mode === 'tidy'

  const stacked = plan !== null && plan.kind !== 'wide'
  const pick = plan && plan.kind === 'wide' ? pickupSpot(plan) : null
  // the wall's own "pick one up" note says the dragging part, so the lede keeps only the other half
  const hint = !pointerFine ? COPY.hintTouch : pick ? COPY.hintMouseShort : COPY.hintMouse
  const pickArrow = pick ? aimBetween(pick.from[0], pick.from[1], pick.to[0], pick.to[1]) : null
  const ledge = (
    <div className="w-procreate-ledge">
      <div className="w-procreate-rulerbox">
        <button type="button" className="w-procreate-prop w-procreate-ruler" data-on={tidy ? '' : undefined} tabIndex={-1} aria-hidden="true" onClick={toggleTidy}>
          <RulerArt />
        </button>
        <span className="w-procreate-prop w-procreate-pencil" aria-hidden="true">
          <PencilArt />
        </span>
      </div>
      <div className="w-procreate-tools" role="group" aria-label={COPY.controlsLabel}>
        <TabButton tone="cream" aria-pressed={tidy} selected={tidy} onClick={toggleTidy}>
          {COPY.tidy}
        </TabButton>
        <TabButton tone="cream" onClick={() => arrange('shuffle')}>
          {COPY.shuffle}
        </TabButton>
        {/* one line of the tray is all a phone has: its short label stands in (the accessible name stays the full phrase) */}
        <TabButton tone="bubblegum" onClick={toggleNotes} aria-label={notes ? COPY.notesOff : COPY.notesOn}>
          <span className="w-procreate-lab-long">{notes ? COPY.notesOff : COPY.notesOn}</span>
          <span className="w-procreate-lab-short" aria-hidden="true">
            {notes ? COPY.notesOffShort : COPY.notesOnShort}
          </span>
        </TabButton>
      </div>
      {pointerFine && (
        <p className="w-procreate-dymo t-label" aria-hidden="true">
          {/* what the wall is, until a print has the keyboard: then the same strip says which keys do what (the keys are also read
              out by every print's description, so nothing is lost for a screen reader) */}
          <span className="w-procreate-dymo-what">{COPY.label}</span>
          <span className="w-procreate-dymo-keys">
            {/* each phrase stays in one piece: when the strip has to wrap it breaks between phrases, never inside one */}
            {COPY.keysShort.split(', ').map((part, i, all) => (
              <Fragment key={part}>
                {i > 0 && ' '}
                <span className="w-procreate-dymo-part">
                  {part}
                  {i < all.length - 1 ? ',' : ''}
                </span>
              </Fragment>
            ))}
          </span>
        </p>
      )}
      <button type="button" className="w-procreate-prop w-procreate-eraser" data-on={notes ? undefined : ''} tabIndex={-1} aria-hidden="true" onClick={toggleNotes}>
        <EraserArt />
      </button>
    </div>
  )

  return (
    <div
      ref={rootRef}
      className="w-procreate"
      data-kind={plan?.kind ?? 'wide'}
      data-notes={notes ? 'on' : 'off'}
      data-mode={mode}
      data-touched={touched ? '' : undefined}
    >
      <div className="w-procreate-stage">
        <header className="w-procreate-head">
          <h2 className="w-procreate-title">
            <span className="w-procreate-title-ink">
              Where it all{' '}
              <span className="w-procreate-started">
                started
                <Scribble kind="underline" at="under" color="ink" stroke={5.5} seed={7} draw={900} />
              </span>
            </span>
          </h2>
          <div className="w-procreate-lede">
            <Tape at="top" color="marigold" pattern="stripes" rotate={-3} w="5.4rem" h="1.5rem" />
            <p className="w-procreate-lede-text">{COPY.lede}</p>
            <p className="w-procreate-hint">{hint}</p>
          </div>
        </header>

        <section className="w-procreate-board" aria-label={COPY.boardLabel}>
          {stacked && ledge}
          <div className="w-procreate-wallbox">
            <div
              ref={wallRef}
              className="w-procreate-wall"
              role="group"
              aria-label={COPY.wallLabel}
              style={plan && plan.kind !== 'wide' ? { height: wallH } : undefined}
            >
              {plan && PRINTS.map((def) => <Scar key={def.id} def={def} dims={plan.dims[def.id]} home={plan.loose[def.id]} away={!!away[def.id]} />)}
              {plan?.kind === 'wide' && plan.row && <Measure row={plan.row} s={plan.s} h={plan.wallH} />}
              {plan?.kind === 'wide' && (
                // a paint-chip card taped between the prints: the four colours of the two portraits, nothing to press
                <span className="w-procreate-chipcard" aria-hidden="true" style={{ '--s': plan.s, left: `${CHIP_AT.x * 100}%`, top: `${CHIP_AT.y * 100}%` } as CSSProperties}>
                  <Tape at="top" color="bubblegum" pattern="plain" rotate={-4} w="3.2rem" h="1.1rem" />
                  <span className="w-procreate-chipcard-chips">
                    {PORTRAIT_PALETTE.map((hex) => (
                      <span key={hex} style={{ backgroundColor: hex }} />
                    ))}
                  </span>
                  <span className="w-procreate-chipcard-word">the palette</span>
                </span>
              )}
              {pick && (
                <>
                  <span className="w-procreate-ink w-procreate-pickup" aria-hidden="true" style={{ left: pick.left, bottom: pick.bottom, fontSize: pick.font }}>
                    {COPY.pickOneUp}
                  </span>
                  <span className="w-procreate-ink w-procreate-pickarrow" aria-hidden="true" style={{ left: pickArrow!.left, top: pickArrow!.top, width: pickArrow!.width }}>
                    <Scribble kind="arrow" seed={3} color="ink" w="100%" stroke={3.4} draw={1500} rotate={pickArrow!.rotate} />
                  </span>
                </>
              )}
              {plan && filed && plan.kind === 'wide' && (
                <span
                  key={filed.n}
                  className="w-procreate-filed"
                  aria-hidden="true"
                  style={{
                    left: (handles.current[filed.id]?.pose().x ?? 0) + plan.dims[filed.id].w * 0.68,
                    top: (handles.current[filed.id]?.pose().y ?? 0) + plan.dims[filed.id].h * 0.78,
                  }}
                >
                  <Stamp text="Filed" tone="oxblood" rotate={-9} size={`${Math.max(1.4, plan.s * 1.9)}rem`} decorative thump />
                </span>
              )}
              {plan &&
                PRINTS.map((def, i) => (
                  <Print
                    key={def.id}
                    ref={(handle) => {
                      if (handle) handles.current[def.id] = handle
                      else delete handles.current[def.id]
                    }}
                    def={def}
                    n={i + 1}
                    total={PRINTS.length}
                    dims={plan.dims[def.id]}
                    wall={{ w: geo ? geo.w : 0, h: plan.wallH }}
                    z={order.indexOf(def.id) + 1}
                    notes={notes}
                    still={reduced}
                    home={intro.current ? plan.loose[def.id] : undefined}
                    introDelay={0.2 + i * 0.12}
                    describedBy={hintId}
                    eager
                    drawDelay={plan.kind === 'wide' ? 1100 + i * 170 : i === 0 ? 1100 : 160}
                    onRaise={raise}
                    onOpen={openPrint}
                    onMoved={moved}
                    onSettled={settled}
                  />
                ))}
            </div>
            <Pin className="w-procreate-corner w-procreate-corner--tl" color="marigold" size="1.9rem" />
            <Pin className="w-procreate-corner w-procreate-corner--tr" color="bubblegum" size="1.9rem" />
            <Pin className="w-procreate-corner w-procreate-corner--bl" color="tomato" size="1.9rem" />
            <Pin className="w-procreate-corner w-procreate-corner--br" color="lagoon" size="1.9rem" />
          </div>

          {!stacked && ledge}
        </section>
      </div>

      <section className="w-procreate-index" aria-labelledby={indexId}>
        <div className="w-procreate-card w-procreate-card--list">
          <Tape at="top" color="marigold" pattern="stripes" rotate={-2} w="7rem" h="1.7rem" />
          <h3 className="w-procreate-card-title" id={indexId}>
            <span className="w-procreate-card-title-ink">
              {COPY.indexTitle}
              <Scribble kind="underline" at="under" color="tomato" stroke={4.2} seed={31} ratio={18} />
            </span>
          </h3>
          <p className="w-procreate-card-intro">{COPY.indexIntro}</p>
          <ol className="w-procreate-list">
            {PRINTS.map((def, i) => (
              // The whole row opens the close-up for a pointer (the click bubbles up from the picture and the words); the tab is the
              // keyboard and screen-reader way in, and its Enter / Space click bubbles up to the same handler.
              <li
                key={def.id}
                className="w-procreate-list-item"
                data-cursor="Open"
                onClick={(event) => openAt(i, event.currentTarget.querySelector<HTMLElement>('.pm-tabbtn'))}
              >
                <span className="w-procreate-thumb" data-stock={def.stock} style={{ '--r': `${THUMB_TILT[i]}deg` } as CSSProperties} aria-hidden="true">
                  <img src={src.thumb(def)} width={def.tw} height={def.th} alt="" loading="lazy" decoding="async" draggable={false} />
                  <span className="w-procreate-list-n">{i + 1}.</span>
                </span>
                <div className="w-procreate-list-text">
                  <h4 className="w-procreate-list-title">{def.title}</h4>
                  <p className="w-procreate-list-line">
                    <Line text={def.line} />
                  </p>
                </div>
                <TabButton size="sm" tone="bubblegum" icon={<LoupeIcon />} iconPosition="before" cursor="Open" aria-label={`${COPY.lookCloser}: ${def.title}`}>
                  {COPY.lookCloser}
                </TabButton>
              </li>
            ))}
          </ol>
        </div>

        <div className="w-procreate-side">
          <div className="w-procreate-card w-procreate-card--palette">
            <Tape at="top" color="bubblegum" pattern="dots" rotate={3} w="6rem" h="1.6rem" />
            <h3 className="w-procreate-card-title">
              <span className="w-procreate-card-title-ink">
                {COPY.paletteTitle}
                <Scribble kind="underline" at="under" color="tomato" stroke={4.2} seed={44} ratio={18} />
              </span>
            </h3>
            <p className="w-procreate-card-intro">{COPY.paletteBody}</p>
            <ul className="w-procreate-chips">
              {PORTRAIT_PALETTE.map((hex) => (
                <li key={hex} className="w-procreate-chip">
                  <span className="w-procreate-chip-dot" style={{ backgroundColor: hex }} aria-hidden="true" />
                  <code className="w-procreate-chip-hex">{hex.toUpperCase()}</code>
                </li>
              ))}
            </ul>
            <div className="w-procreate-stamp" aria-hidden="true">
              <Stamp text="Filed" sub="Folder 06" tone="oxblood" rotate={-7} size="1.5rem" decorative />
            </div>
          </div>

          <div className="w-procreate-card w-procreate-card--when">
            <Tape at="top" color="marigold" pattern="plain" rotate={2} w="4.6rem" h="1.4rem" />
            <h3 className="w-procreate-card-title">{COPY.whenTitle}</h3>
            <div className="w-procreate-when" aria-hidden="true">
              {PRINTS.map((def) => (
                <span key={def.id} className="w-procreate-when-dot">
                  ?
                </span>
              ))}
              <Scribble kind="underline" at="under" color="ink" stroke={3.4} seed={52} ratio={26} />
            </div>
            <p className="w-procreate-card-intro">{COPY.whenBody}</p>
          </div>

          <div className="w-procreate-facts">
            <WorldFacts work={work} tone="ink">
              {COPY.facts}
            </WorldFacts>
          </div>
        </div>
      </section>

      <p id={hintId} className="pm-sr">
        {COPY.keys}
      </p>
      <p className="pm-sr" role="status">
        {status}
      </p>

      {open !== null && host && <Lightbox index={open} container={host} notes={notes} still={reduced} onIndex={setOpen} onClose={closeUp} />}
    </div>
  )
}
