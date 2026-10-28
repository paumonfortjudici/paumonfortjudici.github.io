// The overlay every world lives in. It owns everything that is not the world itself:
//   - the full-viewport dialog (desk-coloured, with the folder body in the project's colour: --w-bg)
//   - the shared-element folder-open transition (framer-motion layoutId = folderLayoutId(slug, origin))
//   - the title tab, the previous / next neighbour tabs and the Close tab (folder-tab shapes, see worlds.css)
//   - keys: Escape closes, ] and [ hop (ignored while typing; never Alt+Arrow)
//   - focus trap, focus restore to the opener, inert background (WorldHost sets it), scroll container .pm-world-scroll
// Worlds render inside .pm-world-scroll and must not render their own title, close or prev / next.
import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import { motion, useIsPresent, type Variants } from 'framer-motion'
import { UI, pad2 } from '../lib/copy'
import { useKey, isTextEntryTarget } from '../lib/hooks/useKey'
import { spring, toggleMotionPaused, useMotion } from '../lib/motion'
import { ReelGlyph } from '../components/chrome/MotionToggle'
import { closeWork, folderLayoutId, getOpener, getRoute, openWork, workHref } from '../lib/router'
import { nextOf, prevOf, type WorkMeta } from '../lib/works'
import { WorldContext, topEscape, type WorldContextValue } from './WorldContext'
import './worlds.css'

export { useWorld, useWorldEscape } from './WorldContext'

interface WorldShellProps {
  work: WorkMeta
  /** the surface the folder was opened from; when set, the folder body is a shared element with that card */
  origin?: string
  /** +1 / -1 when this shell was reached by hopping to the next / previous project (it then slides in) */
  dir?: -1 | 0 | 1
  children: ReactNode
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), summary, audio[controls], video[controls], [contenteditable="true"], [tabindex]:not([tabindex="-1"])'

function tabbables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.closest('[inert]') && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden',
  )
}

const isPlainClick = (event: MouseEvent): boolean =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey

function Chevron({ flip }: { flip?: boolean }) {
  return (
    <svg className="pm-wtab-icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
      <path d="M6 2.5 11.5 8 6 13.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Cross() {
  return (
    <svg className="pm-wtab-icon" viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" focusable="false">
      <path d="M3 3 13 13M13 3 3 13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

export default function WorldShell({ work, origin, dir = 0, children }: WorldShellProps) {
  const { still, reduced: osReduced, paused } = useMotion()
  const isPresent = useIsPresent()
  const titleId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const nextWork = nextOf(work.slug)
  const prevWork = prevOf(work.slug)
  const shared = !!origin
  const accent = work.accent ?? work.ink

  // The world mounts when the folder has (nearly) finished opening, not during the flight: no render / decode jank in the
  // transition, and the world's own entrance animations are seen. Plain opens (deep link, Forward) and still motion mount at once.
  const [gate] = useState(() => (still ? 0 : shared ? 320 : dir ? 260 : 0))
  const [ready, setReady] = useState(gate === 0)
  useEffect(() => {
    if (ready) return
    const id = window.setTimeout(() => setReady(true), gate)
    return () => window.clearTimeout(id)
  }, [ready, gate])

  const close = useCallback(() => closeWork(), [])
  const nextSlug = nextWork.slug
  const prevSlug = prevWork.slug
  const next = useCallback(() => openWork(nextSlug, undefined, { replace: true, dir: 1 }), [nextSlug])
  const prev = useCallback(() => openWork(prevSlug, undefined, { replace: true, dir: -1 }), [prevSlug])

  // keys: Escape closes (also while typing; an inner lightbox swallows it with preventDefault first), [ ] hop (not while typing)
  useKey(
    'Escape',
    () => {
      const inner = topEscape()
      if (inner) inner()
      else close()
    },
    { enabled: isPresent, ignoreTyping: false },
  )
  // a focused slider or checkbox is not typing: only text fields keep the brackets to themselves
  useKey(']', (e) => { if (!isTextEntryTarget(e.target)) next() }, { enabled: isPresent, ignoreTyping: false })
  useKey('[', (e) => { if (!isTextEntryTarget(e.target)) prev() }, { enabled: isPresent, ignoreTyping: false })

  // focus: into the scroller on open (so arrows / space scroll the world and screen readers announce the dialog)
  useEffect(() => {
    scrollRef.current?.focus({ preventScroll: true })
  }, [])

  // leaving: make this shell inert (and undo that if the same project comes straight back while it was still sliding out);
  // when the whole world is closing hand focus back to the opener
  const wasLeaving = useRef(false)
  useEffect(() => {
    const root = rootRef.current
    if (isPresent) {
      root?.removeAttribute('inert')
      if (wasLeaving.current) {
        // the same folder was opened again while it was still closing: it never remounted, so take focus back
        wasLeaving.current = false
        scrollRef.current?.focus({ preventScroll: true })
      }
      return
    }
    wasLeaving.current = true
    root?.setAttribute('inert', '')
    if (getRoute().kind === 'home') {
      const target = getOpener() ?? document.getElementById('main')
      target?.focus({ preventScroll: true })
    }
  }, [isPresent])

  // focus trap: Tab wraps inside the dialog (the page behind is inert as well, this covers older browsers)
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || !rootRef.current) return
    const nodes = tabbables(rootRef.current)
    if (nodes.length === 0) {
      event.preventDefault()
      scrollRef.current?.focus({ preventScroll: true })
      return
    }
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    const active = document.activeElement
    if (event.shiftKey && (active === first || !rootRef.current.contains(active))) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && (active === last || !rootRef.current.contains(active))) {
      event.preventDefault()
      first.focus()
    }
  }

  const context = useMemo<WorldContextValue>(
    () => ({
      work,
      slug: work.slug,
      color: work.color,
      ink: work.ink,
      accent,
      close,
      next,
      prev,
      nextWork,
      prevWork,
      reduced: still,
      scrollRef,
    }),
    [work, accent, close, next, prev, nextWork, prevWork, still],
  )

  // ---- motion -----------------------------------------------------------------------------------------------------
  // Three ways in and out:
  //   shared (opened from a card): the root stays still; the folder body flies out of / back into its card (layoutId) and the
  //                                desk layer fades in / out behind it, so the page is visible again while the folder shrinks
  //   hop (previous / next):       the whole panel slides sideways, the old one drifts away
  //   plain (deep link, Forward):  scale + fade
  const slide = { type: 'tween', duration: 0.5, ease: [0.2, 0.8, 0.2, 1] } as const
  const rootVariants: Variants = {
    enter: dir ? { x: `${dir * 100}%` } : shared ? {} : { opacity: 0, y: 28, scale: 0.985 },
    center: {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      transition: dir ? slide : shared ? { duration: 0 } : spring.folder,
    },
    exit: (exitDir: number) =>
      exitDir
        ? { x: `${-exitDir * 28}%`, transition: slide }
        : shared
          ? {}
          : { opacity: 0, y: 24, scale: 0.985, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } },
  }

  const deskMotion = shared
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.22 } },
        exit: { opacity: 0, transition: { duration: 0.32, delay: 0.04 } },
      }
    : { initial: false as const }

  const tabDelay = (n: number) => (shared ? 0.2 : dir ? 0.1 : 0.05) + n * 0.045
  const tabMotion = (n: number) => ({
    initial: { y: 22, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { ...spring.tab, delay: tabDelay(n) } },
    exit: { opacity: 0, transition: { duration: 0.12 } },
  })

  const vars = {
    '--w-color': work.color,
    '--w-ink': work.ink,
    '--w-accent': accent,
  } as CSSProperties

  const neighbourVars = (w: WorkMeta) => ({ '--c': w.color, '--on': w.ink }) as CSSProperties

  return (
    <WorldContext.Provider value={context}>
      <motion.div
        ref={rootRef}
        className="pm-world"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={isPresent ? undefined : true}
        data-world={work.slug}
        layoutRoot
        style={vars}
        variants={rootVariants}
        initial="enter"
        animate="center"
        exit="exit"
        onKeyDown={onKeyDown}
      >
        <motion.div className="pm-world-desk" aria-hidden="true" {...deskMotion} />
        <div className="pm-world-strip">
          <motion.p id={titleId} role="heading" aria-level={1} className="pm-wtab pm-wtab--title t-label" {...tabMotion(0)}>
            <span className="pm-wtab-n">{pad2(work.n)}</span>
            <span className="pm-wtab-dot" aria-hidden="true">
              ·
            </span>
            <span className="pm-wtab-t">{work.title}</span>
          </motion.p>

          <motion.a
            className="pm-wtab pm-wtab--nav pm-wtab--prev t-label"
            href={workHref(prevWork.slug)}
            aria-label={`${UI.world.prev}: ${pad2(prevWork.n)} ${prevWork.title}`}
            style={neighbourVars(prevWork)}
            data-cursor="Open"
            onClick={(event) => {
              if (!isPlainClick(event)) return
              event.preventDefault()
              prev()
            }}
            {...tabMotion(1)}
          >
            <span className="pm-wtab-key" aria-hidden="true">
              [
            </span>
            <Chevron flip />
            <span className="pm-sr">{UI.world.prev}: </span>
            <span className="pm-wtab-n">{pad2(prevWork.n)}</span>
            <span className="pm-wtab-t pm-wtab-t--nav">{prevWork.title}</span>
          </motion.a>

          <motion.a
            className="pm-wtab pm-wtab--nav pm-wtab--next t-label"
            href={workHref(nextWork.slug)}
            aria-label={`${UI.world.next}: ${pad2(nextWork.n)} ${nextWork.title}`}
            style={neighbourVars(nextWork)}
            data-cursor="Open"
            onClick={(event) => {
              if (!isPlainClick(event)) return
              event.preventDefault()
              next()
            }}
            {...tabMotion(2)}
          >
            <span className="pm-sr">{UI.world.next}: </span>
            <span className="pm-wtab-n">{pad2(nextWork.n)}</span>
            <span className="pm-wtab-t pm-wtab-t--nav">{nextWork.title}</span>
            <Chevron />
            <span className="pm-wtab-key" aria-hidden="true">
              ]
            </span>
          </motion.a>

          {!osReduced && (
            <motion.button
              type="button"
              className="pm-wtab pm-wtab--motion t-label"
              style={{ '--c': 'var(--ink)', '--on': 'var(--cream)' } as CSSProperties}
              aria-pressed={paused}
              data-cursor="none"
              onClick={toggleMotionPaused}
              {...tabMotion(3)}
            >
              <ReelGlyph className="pm-wtab-icon pm-wtab-reel pm-ambient" paused={paused} />
              <span className="pm-wtab-t pm-wtab-t--motion">{UI.pauseMotion}</span>
            </motion.button>
          )}
          <motion.button type="button" className="pm-wtab pm-wtab--close t-label" data-cursor="Close" onClick={close} {...tabMotion(3)}>
            <Cross />
            <span className="pm-wtab-t pm-wtab-t--close">{UI.world.close}</span>
            <span className="pm-wtab-key" aria-hidden="true">
              {UI.world.closeKey}
            </span>
          </motion.button>
        </div>

        <motion.div
          className="pm-world-body"
          layoutId={shared ? folderLayoutId(work.slug, origin) : undefined}
          style={{ borderTopLeftRadius: 18, borderTopRightRadius: 18 }}
          transition={{ layout: spring.folder }}
          initial={{ opacity: shared ? 0 : 1 }}
          animate={{ opacity: 1, transition: { duration: 0.2 } }}
          onLayoutAnimationComplete={() => setReady(true)}
        >
          <motion.div
            ref={scrollRef}
            className="pm-world-scroll"
            tabIndex={-1}
            layoutScroll
            initial={{ opacity: gate ? 0 : 1 }}
            animate={{ opacity: ready ? 1 : 0, transition: { duration: 0.25 } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
          >
            {ready ? children : null}
          </motion.div>
        </motion.div>
      </motion.div>
    </WorldContext.Provider>
  )
}
