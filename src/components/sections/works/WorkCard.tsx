// One folder of the cabinet. A <Folder as={motion.a}> in the project's colour that opens its world:
//   - layoutId = folderLayoutId(slug, 'works'): the same id the world shell uses, so the folder body flies out of this card;
//     it also makes the card glide when a filter re-flows the grid
//   - a real <a href="#/work/slug"> (middle-click and "open in new tab" keep working); a plain click runs openWork()
//   - the tab reads "CATEGORY NN" (the active filter relabels it), the print is the card art (4:5) with its tilt and tape,
//     the peek is a cut-out that sticks out from BEHIND the folder (z-index -1 in the folder's own stacking context) and rises on hover
//   - the title is set in the project's world typeface, loaded when the card is near the viewport
// Concept folders carry the CONCEPT stamp. Everything that moves has a still path (still = reduced or paused motion).

import { useEffect, useReducer, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode, type RefObject } from 'react'
import { motion, type Variants } from 'framer-motion'
import { ArrowIcon, Folder, Stamp, Tape } from '@/components/primitives'
import { asset } from '@/lib/asset'
import { CATALOG, CONCEPT } from '@/lib/copy'
import { spring } from '@/lib/motion'
import { folderLayoutId, openWork, workHref } from '@/lib/router'
import { CATEGORY_LABEL, type WorkMeta } from '@/lib/works'
import { loadWorldFonts } from '@/worlds/fonts'
import { prefetchWorld } from '@/worlds/registry'
import { ART, FALLBACK, OFFICIAL_ART, PEEK_SRC, POSES, type Cell, type FilterId, type PeekArt } from './data'
import { WORKS_UI } from './strings'

/** a folder lands when it is 90px short of the fold: the peek and the tab are seen arriving, and a short viewport (a 768px laptop) never shows a blank band under the rail */
const LAND_MARGIN = '0px 0px 90px 0px'

/** art files that answered 404 once: later mounts go straight to the fallback (no repeated failed requests) */
const failedArt = new Set<string>()
/** world faces already decoded: a remounted card shows its title at once */
const readyFaces = new Set<string>()
/** folders whose title is not set in the face their world loads (Gotet's is Fraunces, which the shell already ships): nothing to wait for */
const SHELL_FACE = new Set(['concept-brand'])

const HAS_DIGIT = /[0-9]/

/**
 * Opening a folder pushes one history entry and Close goes back to the entry before it. When that entry's URL carries a section anchor
 * (#works: the nav pills, a shared link) the browser answers the traversal with its own scroll-to-fragment, which beats the router's scroll
 * restore and leaves focus on <body> (see sharedRequests in docs/api/sections-works.md). Dropping the anchor from the current entry first
 * (the page does not move) makes Close land exactly where the visitor was, with focus back on the card.
 */
function dropSectionAnchor(): void {
  try {
    const { hash, pathname, search } = window.location
    if (hash && !hash.startsWith('#/work/')) window.history.replaceState(window.history.state, '', pathname + search)
  } catch {
    // a sandboxed frame may refuse history changes: the folder still opens
  }
}

/** the aspect of a peek the registry points at but that has not been measured (a guess only reserves the ratio before it loads) */
const DEFAULT_PEEK: PeekArt = { w: 450, h: 640, x: 30, rot: -3 }

interface Ctx {
  dy: number
  rot: number
  delay: number
}

// A folder lands on the desk (spring with one small overshoot, a little tilt that settles); leaving it just shrinks and fades.
const variants: Variants = {
  hidden: (c: Ctx) => ({ opacity: 0, y: c.dy + 46, rotate: c.rot + 2.6, scale: 0.97 }),
  in: (c: Ctx) => ({ opacity: 1, y: c.dy, rotate: c.rot, scale: 1, transition: { ...spring.folder, delay: c.delay } }),
  out: (c: Ctx) => ({ opacity: 0, scale: 0.9, y: c.dy + 10, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }),
}

const HOVER = { type: 'spring', stiffness: 340, damping: 17, mass: 0.8 } as const
const PRESS = { type: 'spring', stiffness: 520, damping: 30 } as const

/** loads the project's display face when the card is within ~2200px of the viewport (a couple of screens ahead: the face is in before the card is seen); true once it is decoded (or timed out) */
function useWorldFace(slug: string, ref: RefObject<HTMLElement | null>): boolean {
  const [ready, setReady] = useState(() => readyFaces.has(slug) || SHELL_FACE.has(slug))
  useEffect(() => {
    if (ready) return
    const el = ref.current
    if (!el) return
    let alive = true
    const start = () => {
      void loadWorldFonts(slug).then(() => {
        readyFaces.add(slug)
        if (alive) setReady(true)
      })
    }
    if (typeof IntersectionObserver === 'undefined') {
      start()
      return () => {
        alive = false
      }
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          io.disconnect()
          start()
        }
      },
      { rootMargin: '2200px 0px' },
    )
    io.observe(el)
    return () => {
      alive = false
      io.disconnect()
    }
  }, [slug, ready, ref])
  return ready
}

function Title({ work }: { work: WorkMeta }) {
  if (work.slug === 'plana') {
    // the logotype is "plana" in Sora ExtraBold and "digital" in Regular
    const [first, ...rest] = work.title.split(' ')
    return (
      <>
        <span className="pm-wk-w1">{first}</span> <span className="pm-wk-w2">{rest.join(' ')}</span>
      </>
    )
  }
  return <>{work.title}</>
}

interface WorkCardProps {
  work: WorkMeta
  cell: Cell
  filter: FilterId
  still: boolean
  /** phones: no resting tilt or offset (the phone is its own composition) */
  flat: boolean
  /** position in the visible list: staggers the landing */
  index: number
}

export function WorkCard({ work, cell, filter, still, flat, index }: WorkCardProps) {
  const ref = useRef<HTMLElement | null>(null)
  const faceReady = useWorldFace(work.slug, ref)
  const [, bump] = useReducer((n: number) => n + 1, 0)
  const base = POSES[work.slug]
  const pose = flat ? { ...base, dy: 0, rot: 0, prot: base.prot * 0.4 } : base
  const art = ART[work.slug]
  const fallback = FALLBACK[work.slug]
  const featured = cell.kind === 'f'

  const category = filter === 'all' || !work.categories.includes(filter) ? work.categories[0] : filter
  const tabLabel = CATEGORY_LABEL[category]

  const fail = (what: 'thumb' | 'peek') => () => {
    failedArt.add(`${work.slug}:${what}`)
    bump()
  }

  // ---- the print ---------------------------------------------------------------------------------------------------
  // a folder without official art on disk goes straight to its fallback: no request, so no 404 on the live site
  const official = OFFICIAL_ART.has(work.slug)
  const thumbFailed = !official || failedArt.has(`${work.slug}:thumb`)
  let print: ReactNode
  if (thumbFailed && fallback?.collage) {
    print = (
      <span className="pm-wk-collage" role="img" aria-label={art.alt}>
        {fallback.collage.map((piece) => (
          <img
            key={piece.src}
            className="pm-wk-collage__piece"
            src={asset(piece.src)}
            alt=""
            width={300}
            height={400}
            loading="lazy"
            decoding="async"
            draggable={false}
            style={{ '--x': `${piece.x}%`, '--y': `${piece.y}%`, '--w': `${piece.w}%`, '--r': `${piece.rot}deg` } as CSSProperties}
          />
        ))}
      </span>
    )
  } else if (thumbFailed && fallback?.thumb) {
    print = (
      <img
        src={asset(fallback.thumb.src)}
        alt={art.alt}
        width={fallback.thumb.w}
        height={fallback.thumb.h}
        loading="lazy"
        decoding="async"
        draggable={false}
        style={{ objectPosition: fallback.thumb.pos }}
      />
    )
  } else {
    print = <img src={asset(work.thumb)} alt={art.alt} width={720} height={900} loading="lazy" decoding="async" draggable={false} onError={fail('thumb')} />
  }

  // ---- the peek ----------------------------------------------------------------------------------------------------
  const peekFailed = !official || failedArt.has(`${work.slug}:peek`)
  const fb = peekFailed ? fallback?.peek : undefined
  // the fallback may bring its own size, place and tilt (a slide is not a cut-out); otherwise the folder's measured spec applies
  const peekSpec: PeekArt = { ...(art.peek ?? DEFAULT_PEEK), ...(fb?.w ? { w: fb.w } : null), ...(fb?.h ? { h: fb.h } : null), ...(fb?.x !== undefined ? { x: fb.x } : null), ...(fb?.rot !== undefined ? { rot: fb.rot } : null), ...(fb?.k !== undefined ? { k: fb.k } : null) }
  const peekSrc = peekFailed ? fb?.src : (PEEK_SRC[work.slug] ?? work.peek)
  const peek = peekSrc ? (
    <img
      className="pm-wk-peek"
      src={asset(peekSrc)}
      alt=""
      width={peekSpec.w}
      height={peekSpec.h}
      loading="lazy"
      decoding="async"
      draggable={false}
      data-paper={fb?.paper ? '' : undefined}
      onError={peekFailed ? undefined : fail('peek')}
      style={{ '--px': `${peekSpec.x}%`, '--pr': `${peekSpec.rot}deg`, '--pk': peekSpec.k ?? 1 } as CSSProperties}
    />
  ) : null

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    dropSectionAnchor()
    openWork(work.slug, 'works')
  }

  const ctx: Ctx = { dy: pose.dy, rot: pose.rot, delay: Math.min(0.28, ((cell.col - 1) / 9) * 0.28 + (index % 2) * 0.04) }
  const hover = still ? undefined : { y: pose.dy - 14, rotate: pose.rot * 0.25, transition: HOVER }
  // pressing pushes the lifted folder back down: the click answers at once, before the shell has opened the folder
  const press = still ? undefined : { y: pose.dy - 3, scale: 0.988, transition: PRESS }
  const motionProps = still
    ? ({ initial: false } as const)
    : ({
        variants,
        custom: ctx,
        initial: 'hidden',
        whileInView: 'in',
        viewport: { once: true, margin: LAND_MARGIN },
        exit: 'out',
      } as const)

  const roles = work.roles.join(' / ')

  return (
    <Folder
      as={motion.a}
      ref={ref}
      href={workHref(work.slug)}
      className="pm-wk-card"
      color={work.color}
      ink={work.ink}
      tab={
        <span key={tabLabel} className="pm-wk-tabtext">
          {tabLabel}
        </span>
      }
      count={work.n}
      tabX={pose.tabX}
      layoutId={folderLayoutId(work.slug, 'works')}
      // `y` and `rotate` are framer-motion style values (not CSS properties): the Folder's typing only knows CSSProperties
      style={{ '--fc': work.color, '--fi': work.ink, '--brs': base.rot >= 0 ? -1 : 1, y: pose.dy, rotate: pose.rot, borderRadius: 18 } as unknown as CSSProperties}
      aria-label={WORKS_UI.cardLabel(work)}
      data-cursor="Open"
      data-slug={work.slug}
      data-concept={work.concept ? '' : undefined}
      data-face={faceReady ? 'ready' : undefined}
      onClick={onClick}
      onMouseEnter={() => prefetchWorld(work.slug)}
      onFocus={() => prefetchWorld(work.slug)}
      // the pointer lifts the folder with a spring; keyboard focus lifts it in CSS (:focus-visible), so a folder that gets focus back after a
      // mouse click or a tap does not stay raised
      whileHover={hover}
      whileTap={press}
      {...motionProps}
    >
      {peek}
      <span className="pm-wk-print" style={{ '--prot': `${pose.prot}deg` } as CSSProperties}>
        {print}
        {art.tape?.map((tape) => (
          <Tape
            key={tape.at}
            at={tape.at}
            color={tape.color}
            pattern={tape.pattern}
            rotate={tape.rotate}
            className="pm-wk-tape"
            style={tape.x === undefined ? undefined : { left: `${tape.x}%` }}
          />
        ))}
      </span>
      <span className="pm-wk-text">
        <span className="pm-wk-top">
          <span className="pm-wk-row">
            <span className="pm-wk-title">
              <Title work={work} />
            </span>
            {/* "Early work" is not a year: it would only repeat the kind line */}
            {HAS_DIGIT.test(work.years) && <span className="pm-wk-years">{work.years}</span>}
          </span>
          <span className="pm-wk-kind">{work.kind}</span>
        </span>
        {featured && (
          <>
            <span className="pm-wk-blurb">{work.blurb}</span>
            <span className="pm-wk-foot">
              <span className="pm-wk-roles">{roles}</span>
              <span className="pm-tabbtn pm-wk-open" data-size="sm" aria-hidden="true">
                <span className="pm-tabbtn__label">{CATALOG.button}</span>
                <ArrowIcon dir="right" className="pm-tabbtn__icon" />
              </span>
            </span>
          </>
        )}
      </span>
      {/* concept art is AI-assisted (the registry says so in `tools`): the stamp says it too, so the print never travels unlabelled. It is pressed
          on the folder's own paper, under the print, in a strip the card keeps free for it, so it never covers the work or the years chip */}
      {work.concept && <Stamp text={CONCEPT.stamp} sub={work.tools.find((tool) => /AI/.test(tool))} tone="ink" rotate={-5} className="pm-wk-stamp" />}
    </Folder>
  )
}
