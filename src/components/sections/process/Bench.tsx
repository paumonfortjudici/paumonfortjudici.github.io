// The darkroom bench: a 35mm film strip with the four steps as frames (drag it, flip it with the tabs, or use the keys),
// a ruler that is the tablist, and the shelf of tools that lights up the frames where each one is used.
//
// Semantics: the strip is an ordered list of the four steps (ol) and every frame stays readable by assistive tech. In strip mode
// each frame is a tabpanel and the ruler is the tablist (roving tabindex, arrows / Home / End); frames outside the light are only
// dimmed. On phones the strip becomes a vertical stack: no tabs, no buttons, and the frame in the middle of the screen is "active".
// Motion: drag with momentum that snaps to a frame (framer-motion), springs for the buttons; reduced / paused motion = the
// strip still drags and moves, but without momentum or springs, and every frame is already developed.
import { animate, motion, useMotionValue, type AnimationPlaybackControls } from 'framer-motion'
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { PROCESS, pad2 } from '../../../lib/copy'
import { useMediaQuery, useMotion, usePointerFine } from '../../../lib/hooks'
import { loadHandFonts } from '../../../styles/fonts'
import { FilmPerforations, Reveal, Scribble, TabButton, Tape } from '../../primitives'
import { PROCESS_UI, SCENE_LABELS, STEP_NOTES, STEP_STYLE, TOOLS, stepBody, type ToolId } from './data'
import { Bin, CoffeeRing, Ruler, Shavings } from './marginalia'
import { SCENES } from './scenes'
import { SCENE_IMAGES, sceneImage } from './images'
import { asset } from '../../../lib/asset'
import { TOKEN_ART } from './tokens'
import './art.css'
import './tokens.css'
import './bench.css'

const STEPS = PROCESS.steps
const N = STEPS.length

// the hand notes (under every paragraph, on the tapes) are written in the marker face: ask for it with the chunk (idempotent)
void loadHandFonts()

const nearestIndex = (snaps: readonly number[], v: number): number => {
  let best = 0
  let bestD = Infinity
  snaps.forEach((s, i) => {
    const d = Math.abs(s - v)
    if (d < bestD) {
      bestD = d
      best = i
    }
  })
  return best
}

export default function Bench() {
  const uid = useId()
  const { still } = useMotion()
  const stack = useMediaQuery('(max-width: 720px)')
  const fine = usePointerFine()

  const [active, setActive] = useState(0)
  const [visited, setVisited] = useState<readonly number[]>([])
  const [hot, setHot] = useState<ToolId | null>(null)
  const [live, setLive] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [said, setSaid] = useState('')
  const [bump, setBump] = useState<Record<number, 'a' | 'b'>>({})
  const [snaps, setSnaps] = useState<readonly number[]>(() => STEPS.map(() => 0))

  const rootRef = useRef<HTMLDivElement>(null)
  const vpRef = useRef<HTMLDivElement>(null)
  const slotRefs = useRef<(HTMLLIElement | null)[]>([])
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const snapsRef = useRef<readonly number[]>(snaps)
  const activeRef = useRef(0)
  const modeRef = useRef<'go' | 'drag'>('go')
  const draggedRef = useRef(false)
  const holdRef = useRef(false)
  const animRef = useRef<AnimationPlaybackControls | null>(null)
  const flashRef = useRef(0)
  /** the visitor has moved the film by any means (drag, keys, buttons, a tool): the invitation below never plays after that */
  const touchedRef = useRef(false)
  const hintedRef = useRef(false)
  const x = useMotionValue(0)

  // ---- in the light: the section is on screen (starts the first development and the small ambient loops) ------------------
  useEffect(() => {
    const el = rootRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setLive(true)
      return
    }
    const io = new IntersectionObserver((entries) => setLive(entries[entries.length - 1]?.isIntersecting ?? false), { rootMargin: '600px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // ---- which frames have been developed (a frame that was in the light stays developed) --------------------------------
  useEffect(() => {
    if (!live) return
    setVisited((v) => (v.includes(active) ? v : [...v, active]))
  }, [live, active])
  const developed = (i: number): boolean => still || visited.includes(i)

  // one invitation: when the first frame has finished developing, the film slides a little to the left and comes back, as if
  // somebody had tugged it (it is the only thing that tells a mouse-less visitor the strip moves). Never in still motion, never after
  // the film has been touched, once per visit.
  useEffect(() => {
    if (!live || stack || still || hintedRef.current || touchedRef.current) return
    const t = window.setTimeout(() => {
      if (hintedRef.current || touchedRef.current || modeRef.current === 'drag' || activeRef.current !== 0) return
      hintedRef.current = true
      const base = snapsRef.current[0] ?? 0
      animRef.current?.stop()
      const a = animate(x, [base, base - 64, base], { duration: 1.3, times: [0, 0.42, 1], ease: ['easeOut', 'easeInOut'] })
      animRef.current = a
      void a.then(() => {
        if (animRef.current === a) animRef.current = null
      })
    }, 2800)
    return () => window.clearTimeout(t)
  }, [live, stack, still, x])

  // a frame that comes back into the light after it was developed: its objects settle again
  const firstActive = useRef(true)
  useEffect(() => {
    if (firstActive.current) {
      firstActive.current = false
      return
    }
    if (stack || still || !visited.includes(active)) return
    setBump((prev) => ({ ...prev, [active]: prev[active] === 'a' ? 'b' : 'a' }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  // ---- measure where each frame has to sit so that it is centred in the viewport -------------------------------------
  useLayoutEffect(() => {
    const vp = vpRef.current
    if (!vp) return
    const measure = () => {
      const first = slotRefs.current[0]
      if (!first) return
      // layout widths, not transformed boxes (the frames outside the light are scaled down), and fractional pixels
      const vw = vp.getBoundingClientRect().width
      const cs = getComputedStyle(first)
      const fw = parseFloat(cs.width)
      const lead = parseFloat(cs.marginLeft) || 0
      const gap = first.parentElement ? parseFloat(getComputedStyle(first.parentElement).columnGap) || 0 : 0
      const next = slotRefs.current.map((_, i) => Math.round(vw / 2 - (lead + i * (fw + gap) + fw / 2)))
      snapsRef.current = next
      setSnaps((prev) => (prev.length === next.length && prev.every((v, i) => v === next[i]) ? prev : next))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(vp)
    slotRefs.current.forEach((li) => li && ro.observe(li))
    return () => ro.disconnect()
  }, [stack])

  // keep the strip on the active frame when the layout changes (resize, stack <-> strip)
  useLayoutEffect(() => {
    if (stack) {
      x.set(0)
      return
    }
    if (holdRef.current) return
    animRef.current?.stop()
    animRef.current = null
    x.set(snaps[activeRef.current] ?? 0)
  }, [snaps, stack, x])

  // while dragging (or coasting), the frame nearest to the middle is the active one
  useEffect(
    () =>
      x.on('change', (v) => {
        if (modeRef.current !== 'drag') return
        const n = nearestIndex(snapsRef.current, v)
        if (n !== activeRef.current) {
          activeRef.current = n
          setActive(n)
          setSaid(PROCESS_UI.step(n + 1, N, STEPS[n].title))
        }
      }),
    [x],
  )

  // ---- stack mode: the frame crossing the middle of the screen is active; a frame is developed as it comes in -----------
  useEffect(() => {
    if (!stack || typeof IntersectionObserver === 'undefined') return
    const mid = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          const i = Number((e.target as HTMLElement).dataset.i)
          activeRef.current = i
          setActive(i)
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    const enter = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          const i = Number((e.target as HTMLElement).dataset.i)
          setVisited((v) => (v.includes(i) ? v : [...v, i]))
        }
      },
      { rootMargin: '0px 0px 30% 0px', threshold: 0.01 },
    )
    slotRefs.current.forEach((li) => {
      if (!li) return
      mid.observe(li)
      enter.observe(li)
    })
    return () => {
      mid.disconnect()
      enter.disconnect()
    }
  }, [stack])

  useEffect(
    () => () => {
      animRef.current?.stop()
      window.clearTimeout(flashRef.current)
    },
    [],
  )

  // ---- moving ---------------------------------------------------------------------------------------------------------
  const go = useCallback(
    (to: number) => {
      const n = ((to % N) + N) % N
      touchedRef.current = true
      modeRef.current = 'go'
      activeRef.current = n
      setActive(n)
      setSaid(PROCESS_UI.step(n + 1, N, STEPS[n].title))
      if (stack) {
        slotRefs.current[n]?.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' })
        return
      }
      const target = snapsRef.current[n] ?? 0
      animRef.current?.stop()
      animRef.current = null
      x.stop() // a drag that is still coasting must not fight the move
      if (still) {
        x.set(target)
      } else {
        const a = animate(x, target, { type: 'spring', stiffness: 150, damping: 23, mass: 0.9 })
        animRef.current = a
        void a.then(() => {
          if (animRef.current === a) animRef.current = null
        })
      }
    },
    [stack, still, x],
  )

  const dragTransition = useMemo(
    () => ({
      power: 0.2,
      timeConstant: 190,
      bounceStiffness: 240,
      bounceDamping: 32,
      modifyTarget: (t: number) => snapsRef.current[nearestIndex(snapsRef.current, t)] ?? t,
    }),
    [],
  )

  const onTabKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    let to: number | null = null
    if (e.key === 'ArrowRight') to = active + 1
    else if (e.key === 'ArrowLeft') to = active - 1
    else if (e.key === 'Home') to = 0
    else if (e.key === 'End') to = N - 1
    if (to === null) return
    e.preventDefault()
    // the arrows wrap round (first <- last), as the tabs pattern asks
    const n = ((to % N) + N) % N
    go(n)
    tabRefs.current[n]?.focus()
  }

  // ---- a sideways swipe on a trackpad (or a tilt wheel) moves one frame per gesture ------------------------------------
  useEffect(() => {
    const vp = vpRef.current
    if (!vp || stack) return
    let armed = true
    let quiet = 0
    let sum = 0
    const onWheel = (e: WheelEvent) => {
      // only a deliberate sideways gesture: a vertical wheel (or a pinch) scrolls the page as usual
      if (e.ctrlKey || Math.abs(e.deltaX) < Math.abs(e.deltaY) * 1.4) return
      e.preventDefault()
      // the long tail of a trackpad swipe must not count again: arm only after the stream of events has stopped
      window.clearTimeout(quiet)
      quiet = window.setTimeout(() => {
        armed = true
        sum = 0
      }, 150)
      if (!armed) return
      sum += e.deltaX
      if (Math.abs(sum) < 36) return
      const to = Math.max(0, Math.min(N - 1, activeRef.current + (sum > 0 ? 1 : -1)))
      armed = false
      sum = 0
      if (to !== activeRef.current) go(to)
    }
    vp.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      vp.removeEventListener('wheel', onWheel)
      window.clearTimeout(quiet)
    }
  }, [stack, go])

  // ---- the shelf ------------------------------------------------------------------------------------------------------
  const hotTool = hot ? TOOLS.find((t) => t.id === hot) : undefined
  const litSteps: readonly number[] = hotTool && !stack ? hotTool.steps : []

  // what the margin note at the shelf promises has to be what a tap or a hover really does in this layout
  const shelfNote = stack ? PROCESS_UI.noteShelfPhone : fine ? PROCESS_UI.noteShelfHover : PROCESS_UI.noteShelfTap

  const pressTool = (id: ToolId) => {
    const tool = TOOLS.find((t) => t.id === id)
    if (!tool) return
    // the next step that uses it, wrapping round (a tool used in two steps alternates between them).
    // On a phone the frames are a long way up the page: a tap only plays the tool, it does not scroll away from the shelf.
    if (!stack) go(tool.steps.find((s) => s > active) ?? tool.steps[0])
    setHot(id)
    window.clearTimeout(flashRef.current)
    flashRef.current = window.setTimeout(() => setHot((h) => (h === id ? null : h)), 1500)
  }

  return (
    <div ref={rootRef} className="pm-proc-bench" data-live={live ? '' : undefined} data-mode={stack ? 'stack' : 'strip'} data-still={still ? '' : undefined}>
      <div className="pm-proc-film">
        <div ref={vpRef} className="pm-proc-vp" data-dragging={dragging ? '' : undefined}>
          <motion.div
            className="pm-proc-track"
            style={{ x: stack ? 0 : x }}
            drag={stack ? false : 'x'}
            dragConstraints={{ left: snaps[N - 1] ?? 0, right: snaps[0] ?? 0 }}
            dragElastic={0.1}
            dragMomentum={!still}
            dragTransition={dragTransition}
            onPointerDownCapture={() => {
              draggedRef.current = false
            }}
            onDragStart={() => {
              modeRef.current = 'drag'
              touchedRef.current = true
              draggedRef.current = true
              holdRef.current = true
              animRef.current?.stop()
              animRef.current = null
              setDragging(true)
            }}
            onDragEnd={() => {
              holdRef.current = false
              setDragging(false)
              if (still) go(nearestIndex(snapsRef.current, x.get()))
            }}
          >
            {/* the labels on the head and the tail of the roll: a scrap of paper written by hand and held with a strip of tape */}
            <div className="pm-proc-lead pm-proc-lead--head" aria-hidden="true">
              <span className="pm-proc-target">
                <b>5</b>
              </span>
              <span className="pm-proc-roll" style={{ ['--r' as string]: '-5deg' }}>
                <Tape at="top" color="marigold" rotate={-4} w="3.4rem" h="1.2rem" />
                {PROCESS_UI.filmStart}
              </span>
              <span className="pm-proc-code">{PROCESS_UI.codeHead}</span>
            </div>
            <div className="pm-proc-lead pm-proc-lead--tail" aria-hidden="true">
              <span className="pm-proc-stamp">{PROCESS_UI.stamp}</span>
              <span className="pm-proc-roll" style={{ ['--r' as string]: '4deg' }}>
                <Tape at="top" color="bubblegum" rotate={3} w="3.4rem" h="1.2rem" />
                {PROCESS_UI.filmEnd}
              </span>
              <span className="pm-proc-code">{PROCESS_UI.codeTail}</span>
            </div>
            <FilmPerforations className="pm-proc-perf pm-proc-perf--top" hole="1.1rem" data-cursor={stack ? undefined : 'Drag'} />
            <ol className="pm-proc-frames" aria-label={PROCESS_UI.region}>
              {STEPS.map((step, i) => {
                const style = STEP_STYLE[i]
                const Scene = SCENES[i]
                const isActive = i === active
                const dev = developed(i)
                const labels = SCENE_LABELS[i]
                const tabId = `${uid}-t${i}`
                const panelId = `${uid}-p${i}`
                return (
                  <li
                    key={step.n}
                    ref={(el) => {
                      slotRefs.current[i] = el
                    }}
                    className="pm-proc-slot"
                    data-i={i}
                    data-active={isActive ? '' : undefined}
                    data-dev={dev ? '1' : '0'}
                    data-lit={litSteps.includes(i) ? '' : undefined}
                    data-cursor={!stack && !isActive ? 'Flip' : undefined}
                    onClick={() => {
                      if (stack || draggedRef.current || isActive) return
                      go(i)
                    }}
                  >
                    <span className="pm-proc-edge" aria-hidden="true">
                      {pad2(step.n)} {step.title}
                    </span>
                    <div
                      className="pm-proc-frame"
                      id={panelId}
                      role={stack ? undefined : 'tabpanel'}
                      aria-labelledby={stack ? undefined : tabId}
                      style={{ ['--c' as string]: `var(--${style.tone})` }}
                    >
                      <div className="pm-proc-grid">
                      <div className="pm-proc-pic">
                        <div className="pm-proc-art">
                          {SCENE_IMAGES.has(i) ? (
                            <img className="pm-proc-img" src={asset(sceneImage(i))} width={1400} height={1500} alt={style.alt} loading="lazy" decoding="async" draggable={false} />
                          ) : (
                            <Scene dev={dev} bump={bump[i]} />
                          )}
                          {(SCENE_IMAGES.has(i) ? [] : labels).map((l) => (
                            <span
                              key={l.text}
                              className="pm-proc-lbl"
                              aria-hidden="true"
                              style={{ left: `${(l.x / 560) * 100}%`, top: `${(l.y / 600) * 100}%`, ['--r' as string]: `${l.r}deg`, ['--tx' as string]: l.a === 'r' ? '-100%' : '0%' }}
                            >
                              {l.text}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="pm-proc-copy">
                        <p className="pm-proc-num" aria-hidden="true">
                          {pad2(step.n)}
                        </p>
                        <h3 className="pm-proc-name">{step.title}</h3>
                        <p className="pm-proc-body">{stepBody(step.n, step.body)}</p>
                        <p className="pm-proc-hand" aria-hidden="true">
                          <Scribble kind="arrow" dir="left" w="3.6rem" color="var(--ink)" seed={`process-note-${i}`} stroke={3.2} />
                          <span>{STEP_NOTES[i]}</span>
                        </p>
                        <ul className="pm-proc-chips" aria-label={PROCESS_UI.inThisStep}>
                          {step.chips.map((chip, k) => (
                            <li key={chip} className="pm-proc-chip" style={{ ['--r' as string]: `${[-1.4, 1, -0.6, 1.5, -1][k % 5]}deg` }}>
                              {chip}
                            </li>
                          ))}
                        </ul>
                      </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
            <FilmPerforations className="pm-proc-perf pm-proc-perf--bottom" hole="1.1rem" data-cursor={stack ? undefined : 'Drag'} />
          </motion.div>
        </div>
      </div>

      <p className="pm-sr" role="status" aria-live="polite">
        {said}
      </p>

      <div className="pm-proc-ctl">
        <div
          className="pm-proc-ruler"
          role="tablist"
          aria-label={PROCESS_UI.tablist}
          onKeyDown={onTabKey}
          data-active={active}
          style={{ ['--ai' as string]: active, ['--ac' as string]: `var(--${STEP_STYLE[active].tone})` }}
        >
          {STEPS.map((step, i) => (
            <button
              key={step.n}
              ref={(el) => {
                tabRefs.current[i] = el
              }}
              id={`${uid}-t${i}`}
              type="button"
              role="tab"
              className="pm-proc-tab"
              aria-selected={i === active}
              aria-controls={`${uid}-p${i}`}
              tabIndex={i === active ? 0 : -1}
              data-i={i}
              data-seen={visited.includes(i) || still ? '' : undefined}
              data-lit={litSteps.includes(i) ? '' : undefined}
              style={{ ['--c' as string]: `var(--${STEP_STYLE[i].tone})` }}
              onClick={() => go(i)}
            >
              <span className="pm-proc-tabn">{pad2(step.n)}</span>
              <span className="pm-proc-tabt">{step.title}</span>
            </button>
          ))}
        </div>
        <div className="pm-proc-btns">
          <TabButton tone="cream" icon="arrow-left" iconPosition="before" cursor="Flip" aria-label={PROCESS_UI.backLabel} onClick={() => go(active - 1)}>
            {PROCESS_UI.back}
          </TabButton>
          <TabButton tone="marigold" icon="arrow-right" cursor="Flip" aria-label={PROCESS_UI.nextLabel} onClick={() => go(active + 1)}>
            {PROCESS_UI.next}
          </TabButton>
        </div>
      </div>

      <div className="pm-proc-shelf">
        <div className="pm-proc-shelf-head">
          <h3 className="pm-proc-shelf-title t-display">
            <span className="pm-proc-shelf-word">
              {PROCESS_UI.shelfTitle}
              <Scribble kind="underline" at="under" color="var(--proc-pink)" seed="process-desk" />
            </span>
          </h3>
          <p className="pm-proc-shelf-lead">{PROCESS_UI.shelfLead}</p>
          <p className="pm-proc-note pm-proc-note--shelf t-hand" aria-hidden="true">
            <Scribble kind="arrow" dir="up-left" w="3.8rem" color="var(--proc-pink)" seed="process-shelf" />
            <span>{shelfNote}</span>
          </p>
        </div>
        <ul className="pm-proc-tools">
          {TOOLS.map((tool, i) => {
            const Art = TOKEN_ART[tool.id]
            const lit = !stack && tool.steps.includes(active)
            return (
              <Reveal key={tool.id} as="li" kind="drop" delay={i * 70} className="pm-proc-tool">
                <button
                  type="button"
                  className="pm-proc-tk"
                  data-lit={lit ? '' : undefined}
                  data-hot={hot === tool.id ? '' : undefined}
                  onClick={() => pressTool(tool.id)}
                  onPointerEnter={(e) => {
                    if (e.pointerType === 'mouse') setHot(tool.id)
                  }}
                  onPointerLeave={(e) => {
                    if (e.pointerType === 'mouse') setHot((h) => (h === tool.id ? null : h))
                  }}
                  onFocus={() => setHot(tool.id)}
                  onBlur={() => setHot((h) => (h === tool.id ? null : h))}
                >
                  <span className="pm-proc-tk-art" aria-hidden="true">
                    <Art />
                  </span>
                  <span className="pm-proc-tk-txt">
                    <span className="pm-proc-tk-name">{tool.name}</span>
                    <span className="pm-proc-tk-use">{tool.use}</span>
                    <span className="pm-proc-tk-steps">
                      <span className="pm-sr">{PROCESS_UI.usedIn(tool.steps, !stack)}</span>
                      {tool.steps.map((s) => (
                        <span key={s} className="pm-proc-tk-n" aria-hidden="true" data-on={!stack && s === active ? '' : undefined}>
                          {pad2(s + 1)}
                        </span>
                      ))}
                    </span>
                  </span>
                </button>
              </Reveal>
            )
          })}
          {/* tablet widths: the plank has four slots a row and seven tools, so the eighth slot holds the margin note */}
          <li className="pm-proc-spare" aria-hidden="true">
            <p className="pm-proc-note pm-proc-note--spare t-hand">
              <Scribble kind="arrow" dir="up-left" w="3.8rem" color="var(--proc-pink)" seed="process-spare" />
              <span>{shelfNote}</span>
            </p>
          </li>
        </ul>
        {/* the rest of the desk: a ruler, a coffee ring, pencil shavings and the bin of discarded thumbnails (decoration) */}
        <div className="pm-proc-foot" aria-hidden="true">
          <div className="pm-proc-foot__desk">
            <Shavings />
            <CoffeeRing />
            <Ruler />
          </div>
          <Bin />
        </div>
      </div>
    </div>
  )
}
