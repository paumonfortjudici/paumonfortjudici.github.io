// Plate 6, "Manual": the 17 pages of the brand manual as a pile that fans out like a sunrise. The pile sits behind a holm-oak horizon (the
// symbol's own field and stripe), so the pages rise out of the ground like rays. It opens on hover (mouse), on focus, or with the "Fan it out"
// tab; the page under the pointer (or focused, or chosen with the arrows) lifts and comes to the front, its neighbours fall away on both
// sides. Arrow keys move through the pages, Enter / click reads one in the viewer (a lightbox with real buttons, a focus trap and arrow-key
// paging). While the fan is closed only the first few pictures are loaded; the rest arrive the first time it opens.
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { Scribble, TabButton } from '../../components/primitives'
import { useBodyLock, usePointerFine } from '../../lib/hooks'
import { useWorld } from '../WorldContext'
import { MANUAL, PLATES, plana } from './data'
import { ManualViewer } from './ManualViewer'
import { Plate } from './Plate'
import './manual.css'

const COUNT = MANUAL.length
const EAGER = 4 // pages whose pictures load before the fan has ever opened

// a pile is never perfectly neat: a fixed, hand-made scatter (same on every visit)
const SCATTER = [0, 1.4, -1.9, 2.3, -1.2, 1.8, -2.4, 1.1, -0.9, 2.1, -1.6, 0.8, -2.1, 1.5, -0.7, 2.4, -1.3]

export default function Manual() {
  const { scrollRef } = useWorld()
  const fine = usePointerFine()
  const [toggled, setToggled] = useState(false)
  const [hover, setHover] = useState(false)
  const [focusIn, setFocusIn] = useState(false)
  const [active, setActive] = useState(0)
  const [viewer, setViewer] = useState<number | null>(null)
  const [everOpen, setEverOpen] = useState(false)
  const plate = useRef<HTMLDivElement>(null)
  const leaves = useRef<(HTMLButtonElement | null)[]>([])
  const returnTo = useRef<HTMLElement | null>(null)

  const open = toggled || hover || focusIn || viewer !== null
  useBodyLock(viewer !== null, scrollRef)
  useEffect(() => {
    if (open) setEverOpen(true)
  }, [open])

  // the world behind the viewer must not be reachable while it is open
  useEffect(() => {
    const root = plate.current?.closest<HTMLElement>('.w-plana')
    if (!root || viewer === null) return
    root.setAttribute('inert', '')
    return () => root.removeAttribute('inert')
  }, [viewer])

  const openViewer = (i: number) => {
    returnTo.current = leaves.current[i]
    setViewer(i)
  }

  const closeViewer = () => {
    setViewer(null)
    window.setTimeout(() => returnTo.current?.focus({ preventScroll: true }), 0)
  }

  const onLeaf = (i: number) => {
    if (!open) {
      setToggled(true)
      setActive(i)
      return
    }
    openViewer(i)
  }

  const step = (delta: number) => {
    setToggled(true)
    setActive((a) => Math.max(0, Math.min(COUNT - 1, a + delta)))
  }

  const onKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    let next = -1
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = Math.min(COUNT - 1, active + 1)
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = Math.max(0, active - 1)
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = COUNT - 1
    if (next < 0) return
    event.preventDefault()
    setActive(next)
    leaves.current[next]?.focus({ preventScroll: true })
  }

  const page = MANUAL[active]
  // the viewer lives inside the shell's folder body (below the tab strip), so the shell's focus trap and Escape stack still apply
  const portalTarget = viewer !== null ? (scrollRef.current?.parentElement ?? null) : null

  return (
    <Plate
      info={PLATES[5]}
      caption="The 17-page brand manual (v2.0, October 2026). The pages are written in Spanish, with Catalan on the mockups; the English captions are mine."
    >
      <div ref={plate} className="w-plana-frame w-plana-manual" data-open={open ? 'true' : 'false'}>
        <div className="w-plana-manual__top">
          <p className="w-plana-manual__head">
            <span className="w-plana-manual__big" aria-hidden="true">
              {COUNT}
            </span>
            <span className="w-plana-manual__title">pages</span>
          </p>
          <p className="w-plana-manual__sub">The whole system on paper: the name, the symbol, the logo forms, colour, type, voice and every application.</p>
          <p className="w-plana-fan__note" data-gone={everOpen ? 'true' : 'false'} aria-hidden="true">
            <span>{fine ? 'hover to fan them out' : 'tap to fan them out'}</span>
            <Scribble kind="arrow" dir="down-left" w="3rem" color="var(--holm)" seed="plana-fan" draw={1200} />
          </p>
        </div>

        <div
          className="w-plana-fan"
          onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(true)}
          onPointerLeave={(e) => e.pointerType === 'mouse' && setHover(false)}
          onFocus={(e) => {
            // only keyboard focus fans the pile out; a tap also focuses the page on some phones, and that tap must be the one that fans it
            let keyboard = true
            try {
              keyboard = (e.target as HTMLElement).matches(':focus-visible')
            } catch {
              /* an old browser: treat every focus as keyboard focus */
            }
            if (keyboard) setFocusIn(true)
          }}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusIn(false)
          }}
        >

          <ul className="w-plana-fan__stack" aria-label="Pages of the brand manual" onKeyDown={onKeyDown}>
            {MANUAL.map((p, i) => (
              <li
                key={p.n}
                className="w-plana-leaf"
                data-active={open && i === active ? 'true' : 'false'}
                style={{ '--i': i, '--jr': SCATTER[i], '--cr': (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 1.15, '--bg': p.bg, '--z': open ? 40 - Math.abs(i - active) : 40 - i } as CSSProperties}
              >
                <button
                  ref={(el) => {
                    leaves.current[i] = el
                  }}
                  type="button"
                  className="w-plana-leaf__btn"
                  tabIndex={i === active ? 0 : -1}
                  aria-label={`Page ${p.n} of ${COUNT}: ${p.title}. ${open ? 'Open it in the viewer.' : 'Fan the pages out.'}`}
                  data-cursor="Open"
                  onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => onLeaf(i)}
                >
                  {(everOpen || i < EAGER) && (
                    <img src={plana(p.file)} width={1600} height={1000} alt="" loading="lazy" decoding="async" draggable={false} />
                  )}
                </button>
              </li>
            ))}
          </ul>
          <div className="w-plana-fan__horizon" aria-hidden="true" />
        </div>

        <div className="w-plana-manual__bar">
          <p className="w-plana-manual__now" aria-live="polite">
            <span className="w-plana-manual__no">{String(page.n).padStart(2, '0')}</span>
            <span>{page.title}</span>
          </p>
          <div className="w-plana-manual__actions">
            <TabButton
              size="sm"
              color="var(--night)"
              ink="var(--paper)"
              icon="arrow-left"
              aria-label="Previous manual page"
              aria-disabled={active === 0 || undefined}
              onClick={() => active > 0 && step(-1)}
            >
              <span className="pm-sr">Previous manual page</span>
            </TabButton>
            <TabButton
              size="sm"
              color="var(--night)"
              ink="var(--paper)"
              icon="arrow-right"
              aria-label="Next manual page"
              aria-disabled={active === COUNT - 1 || undefined}
              onClick={() => active < COUNT - 1 && step(1)}
            >
              <span className="pm-sr">Next manual page</span>
            </TabButton>
            <TabButton size="sm" color="var(--wheat)" ink="var(--night)" aria-expanded={open} onClick={() => setToggled((t) => !t)} cursor="Open">
              {open ? 'Close the fan' : 'Fan it out'}
            </TabButton>
            <TabButton size="sm" color="var(--poppy)" ink="var(--night)" onClick={() => openViewer(active)} cursor="Open">
              Read page {page.n}
            </TabButton>
          </div>
        </div>
      </div>

      {viewer !== null && portalTarget && <ManualViewer index={viewer} onIndex={setViewer} onClose={closeViewer} container={portalTarget} />}
    </Plate>
  )
}
