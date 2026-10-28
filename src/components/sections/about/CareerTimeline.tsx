// The career as a drawing made from real dates. Everything on the ruler is positioned from data.ts, never by hand.
//
//   credits           one column per job (dates, role, place, the CV line), numbered I to IV in the colour of its clip
//   the film          two tracks of film clips on a shared ruler 2017 to now: a clip goes on the lowest free track, so Connecor
//                     and Casual Magazines are drawn on top of each other exactly where they overlap (2022 to 2024)
//   the axis          a thick line with year and month ticks and a NOW flag
//   freelance & own   tiny folders hanging by string from the axis at their date; each opens its world (shared-element flight)
//   also              undated work as colour tags in the project's folder colour
//
// Under 1100 px the plane goes away and each job becomes a list item with its own vertical ribbon on a 2017 to now gauge.

import { motion } from 'framer-motion'
import { useEffect, useLayoutEffect, useRef, type CSSProperties, type MouseEvent, type RefObject } from 'react'
import { asset } from '../../../lib/asset'
import { ABOUT, pad2 } from '../../../lib/copy'
import { folderLayoutId, getOpener, openWork, useRoute, workHref } from '../../../lib/router'
import type { WorkMeta } from '../../../lib/works'
import { prefetchWorld } from '../../../worlds/registry'
import { ArrowIcon, FilmPerforations, Folder, Scribble, resolveTone, useRevealOnce } from '../../primitives'
import { ALSO, JOBS, NOW, PINS, SPAN, TRACKS, YEARS, AXIS_END, AXIS_START, pct, type Job, type Pin } from './data'
import { TIMELINE } from './text'
import './timeline.css'

/** a plain click opens the folder with the flight; new-tab and download gestures keep the real link behaviour */
const opener =
  (slug: string, origin?: string) =>
  (event: MouseEvent<HTMLAnchorElement>): void => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    openWork(slug, origin)
  }

/** "2019-10" -> "’19" (the gauge on a phone writes the year where each ribbon starts and stops; the months are in the credit beside it) */
const short = (iso: string): string => '’' + iso.slice(2, 4)

const jobVars = (job: Job, index: number): CSSProperties => {
  const tone = resolveTone(job.tone)
  return { '--s': pct(job.from).toFixed(3), '--e': pct(job.to).toFixed(3), '--c': tone.color, '--on': tone.ink, '--k': index } as CSSProperties
}

/** a strip of film in the colour of the job; the long ones carry their words, the short ones only the reel number */
function Clip({ job }: { job: Job }) {
  return (
    <span className="pm-ab-clip">
      <FilmPerforations tone="ink" hole="0.5rem" />
      <span className="pm-ab-clip__mid">
        <span className="pm-ab-clip__lab">
          <span className="pm-ab-clip__no">{job.numeral}</span>
          {job.label === 'in' && (
            <>
              <span className="pm-ab-clip__role">{job.role}</span>
              <span className="pm-ab-clip__co">{job.company}</span>
            </>
          )}
        </span>
      </span>
      <FilmPerforations tone="ink" hole="0.5rem" />
    </span>
  )
}

/** one credit: reel number and dates, role, place, the CV line, and (mobile) its own gauge with the ribbon */
function JobRow({ job, index }: { job: Job; index: number }) {
  return (
    <li className="pm-ab-job" style={jobVars(job, index)} data-job={job.id} data-ongoing={job.ongoing ? '' : undefined}>
      <div className="pm-ab-job__txt">
        <p className="pm-ab-job__dates">
          <span className="pm-ab-job__no" aria-hidden="true">
            {job.numeral}
          </span>
          <span className="pm-ab-job__when">
            <time dateTime={job.fromIso}>{job.fromLabel}</time>
            <span aria-hidden="true"> – </span>
            <span className="pm-sr"> to </span>
            {job.toIso ? <time dateTime={job.toIso}>{job.toLabel}</time> : <span>{job.toLabel}</span>}
          </span>
        </p>
        <h4 className="pm-ab-job__role">{job.role}</h4>
        <p className="pm-ab-job__place">{job.place}</p>
        <p className="pm-ab-job__cv">{job.text}</p>
        {job.folder && (
          <a
            className="pm-ab-job__link"
            href={workHref(job.folder.slug)}
            aria-label={job.folder.aria}
            data-cursor="Open"
            onClick={opener(job.folder.slug)}
            onPointerEnter={() => prefetchWorld(job.folder!.slug)}
            onFocus={() => prefetchWorld(job.folder!.slug)}
          >
            {job.folder.label}
            <ArrowIcon dir="right" size="1.05em" />
          </a>
        )}
      </div>
      <div className="pm-ab-job__track" aria-hidden="true">
        {/* the shared 2017 to 2026 axis is written once, on the first gauge; the others are the same scale */}
        {index === 0 && <span className="pm-ab-job__y pm-ab-job__y--a">{AXIS_START}</span>}
        {index === 0 && <span className="pm-ab-job__y pm-ab-job__y--b">{AXIS_END - 1}</span>}
        <span className="pm-ab-job__at pm-ab-job__at--s">{short(job.fromIso)}</span>
        <span className="pm-ab-job__at pm-ab-job__at--e">{job.toIso ? short(job.toIso) : TIMELINE.now.toLowerCase()}</span>
        <Clip job={{ ...job, label: 'left' }} />
      </div>
    </li>
  )
}

/** a clip on its track (wide screens). A clip too short for words is named outside, on the side with more free track. */
function Bar({ job, index }: { job: Job; index: number }) {
  return (
    <div className="pm-ab-bar" style={jobVars(job, index)} data-job={job.id} data-label={job.label} data-ongoing={job.ongoing ? '' : undefined}>
      <Clip job={job} />
      {job.label !== 'in' && (
        <span className="pm-ab-bar__out">
          <span className="pm-ab-bar__wide">{job.shortCompany}</span>
          <span className="pm-ab-bar__narrow">{job.tinyCompany}</span>
        </span>
      )}
      {job.overlapYears && job.label === 'in' && job.track > 0 && (
        <span className="pm-ab-bar__note">
          <span className="pm-ab-bar__notetext">{TIMELINE.overlap(job.overlapYears[0], job.overlapYears[1])}</span>
          <Scribble kind="arrow" dir="right" w="2.8rem" color="oxblood" stroke={3} seed="pm-overlap" draw={700} />
        </span>
      )}
    </div>
  )
}

/** the string runs from the axis line down to the top of the folder */
const DROP = 92

/** a string with a push pin on the axis, a tiny folder hanging from it, and its caption */
function PinItem({ pin, index }: { pin: Pin; index: number }) {
  const { work } = pin
  const style = {
    '--x': pct(pin.at).toFixed(3),
    '--dx': '0px',
    '--rot': `${pin.rot}deg`,
    '--len': `${DROP}px`,
    '--ang': '0deg',
    '--drop': `${DROP}px`,
    '--k': index,
  } as CSSProperties
  const label = `Open folder ${pad2(work.n)}: ${work.title}, ${pin.year}. ${pin.note}`
  return (
    <li className="pm-ab-pin" style={style}>
      <span className="pm-ab-pin__stem" aria-hidden="true" />
      <span className="pm-ab-pin__head" aria-hidden="true" />
      <div className="pm-ab-pin__hang">
        <Folder
          as={motion.a}
          layoutId={folderLayoutId(work.slug, 'about')}
          href={workHref(work.slug)}
          className="pm-ab-pin__folder"
          bodyClassName="pm-ab-pin__body"
          color={work.color}
          ink={work.ink}
          tab={pin.year}
          tabX={0.12}
          lift="hover"
          aria-label={label}
          data-cursor="Open"
          onClick={opener(work.slug, 'about')}
          onPointerEnter={() => prefetchWorld(work.slug)}
          onFocus={() => prefetchWorld(work.slug)}
        >
          <img className="pm-ab-pin__img" src={asset(work.thumb)} width={720} height={900} alt="" loading="lazy" decoding="async" draggable={false} />
        </Folder>
        <p className="pm-ab-pin__cap" aria-hidden="true">
          <strong className="pm-ab-pin__title">{work.title}</strong>
          <span className="pm-ab-pin__capnote">{pin.note}</span>
        </p>
      </div>
    </li>
  )
}

/**
 * Keeps the hanging folders from touching: each pin keeps its date on the ruler, but its folder is pushed sideways (the string
 * swings) until neighbours are at least a folder and a gap apart. Also tells the lane heading how much free room there is between
 * the first two folders. Writes CSS variables straight to the DOM (no state).
 */
function usePinSpacing(listRef: RefObject<HTMLUListElement>): void {
  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    const lane = list.parentElement
    const pins = Array.from(list.querySelectorAll<HTMLElement>('.pm-ab-pin'))
    const apply = () => {
      const width = list.clientWidth
      // not laid out (hidden, or a transient 1px viewport such as a screenshot tool's): keep what we have instead of resetting every string
      if (!width) return
      const hang = pins[0]?.querySelector<HTMLElement>('.pm-ab-pin__hang')
      const vertical = !hang || window.getComputedStyle(pins[0]).position === 'static'
      if (vertical) {
        pins.forEach((el) => {
          el.style.setProperty('--dx', '0px')
          el.style.setProperty('--len', `${DROP}px`)
          el.style.setProperty('--ang', '0deg')
        })
        return
      }
      const half = hang.offsetWidth / 2
      const gap = hang.offsetWidth + 52
      const want = PINS.map((pin) => (pct(pin.at) / 100) * width)
      const lo = half + 2
      const hi = width - half - 2
      const x = want.map((v) => Math.min(hi, Math.max(lo, v)))
      for (let pass = 0; pass < 4; pass++) {
        for (let i = 1; i < x.length; i++) if (x[i] - x[i - 1] < gap) x[i] = x[i - 1] + gap
        if (x[x.length - 1] > hi) x[x.length - 1] = hi
        for (let i = x.length - 2; i >= 0; i--) if (x[i + 1] - x[i] < gap) x[i] = x[i + 1] - gap
        if (x[0] < lo) x[0] = lo
      }
      pins.forEach((el, i) => {
        const dx = x[i] - want[i]
        el.style.setProperty('--dx', `${dx.toFixed(1)}px`)
        el.style.setProperty('--len', `${Math.hypot(dx, DROP).toFixed(1)}px`)
        el.style.setProperty('--ang', `${((Math.atan2(dx, DROP) * 180) / Math.PI).toFixed(2)}deg`)
      })
      if (lane) {
        // the free room between the first two folders is where the lane heading lives
        const left = x[0] + half + 30
        const right = (x.length > 1 ? x[1] - half : width) - 30
        lane.style.setProperty('--lab-left', `${left.toFixed(1)}px`)
        lane.style.setProperty('--lab-w', `${Math.max(0, right - left).toFixed(1)}px`)
      }
    }
    apply()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(apply)
    observer.observe(list)
    return () => observer.disconnect()
  }, [listRef])
}

/** undated work: a tag in the folder's own colour, opening the same world */
function AlsoChip({ work }: { work: WorkMeta }) {
  const style = { '--c': work.color, '--on': work.ink, borderRadius: 8 } as CSSProperties
  return (
    <li>
      <motion.a
        className="pm-ab-chip"
        layoutId={folderLayoutId(work.slug, 'about')}
        href={workHref(work.slug)}
        style={style}
        data-concept={work.concept ? '' : undefined}
        data-cursor="Open"
        aria-label={`Open folder ${pad2(work.n)}: ${work.title}${work.concept ? ' (concept project)' : ''}`}
        onClick={opener(work.slug, 'about')}
        onPointerEnter={() => prefetchWorld(work.slug)}
        onFocus={() => prefetchWorld(work.slug)}
      >
        <span className="pm-ab-chip__n" aria-hidden="true">
          {pad2(work.n)}
        </span>
        <span className="pm-ab-chip__t">{work.title}</span>
        {work.concept && (
          <span className="pm-ab-chip__tag" aria-hidden="true">
            {TIMELINE.concept}
          </span>
        )}
      </motion.a>
    </li>
  )
}

/**
 * Pointing at a credit (or its clip) lights both and quiets the rest, so the words and the film find each other. Decoration only:
 * every word is on the page without it, and it ignores touch. DOM attributes only, no state.
 */
function useJobLinks(rootRef: RefObject<HTMLElement>): void {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    let current: string | null = null
    const light = (id: string | null) => {
      if (id === current) return
      current = id
      root.querySelectorAll('[data-hot]').forEach((el) => el.removeAttribute('data-hot'))
      if (!id) {
        root.removeAttribute('data-dim')
        return
      }
      root.setAttribute('data-dim', '')
      root.querySelectorAll(`[data-job="${id}"]`).forEach((el) => el.setAttribute('data-hot', ''))
    }
    const idOf = (target: EventTarget | null): string | null => (target instanceof Element ? (target.closest<HTMLElement>('[data-job]')?.dataset.job ?? null) : null)
    const over = (event: Event) => {
      if (event instanceof PointerEvent && event.pointerType !== 'mouse') return
      light(idOf(event.target))
    }
    const out = (event: Event) => light(idOf((event as PointerEvent | FocusEvent).relatedTarget))
    root.addEventListener('pointerover', over)
    root.addEventListener('pointerout', out)
    root.addEventListener('focusin', over)
    root.addEventListener('focusout', out)
    return () => {
      root.removeEventListener('pointerover', over)
      root.removeEventListener('pointerout', out)
      root.removeEventListener('focusin', over)
      root.removeEventListener('focusout', out)
      light(null)
    }
  }, [rootRef])
}

/**
 * Closing a world hands focus back to the folder that opened it, but the folder is hidden for a moment by the shared-element
 * flight and the browser drops the focus again (seen on the cover deck as well). Once the flight is over, put it back if nothing
 * else has taken it. Only for folders that live in this timeline.
 */
function useRestoreFocus(rootRef: RefObject<HTMLElement>): void {
  const kind = useRoute().kind
  const before = useRef(kind)
  useEffect(() => {
    const was = before.current
    before.current = kind
    if (was !== 'work' || kind !== 'home') return
    const timer = window.setTimeout(() => {
      const opener = getOpener()
      const active = document.activeElement
      // the shell falls back to <main> when the opener was still hidden by the flight: that counts as "nothing has the focus"
      const lost = !active || active === document.body || active.tagName === 'MAIN'
      if (opener && rootRef.current?.contains(opener) && lost) opener.focus({ preventScroll: true })
    }, 900)
    return () => window.clearTimeout(timer)
  }, [kind, rootRef])
}

export default function CareerTimeline() {
  const rootRef = useRef<HTMLDivElement>(null)
  const pinsRef = useRef<HTMLUListElement>(null)
  const laneRef = useRef<HTMLDivElement>(null)
  useRevealOnce(rootRef, { threshold: 0.1 })
  useRevealOnce(laneRef, { threshold: 0.2 })
  usePinSpacing(pinsRef)
  useRestoreFocus(rootRef)
  useJobLinks(rootRef)
  const vars = { '--years': SPAN, '--now': pct(NOW).toFixed(3) } as CSSProperties
  // the top track is the highest number (like the tracks of an editing timeline), so a clip that overlaps another sits above it
  const tracks = Array.from({ length: TRACKS }, (_, i) => TRACKS - 1 - i)

  return (
    <div className="pm-ab-tlwrap">
      <Folder
        color="var(--paper)"
        ink="var(--ink)"
        rim={false}
        tab={
          <span role="heading" aria-level={3} className="pm-ab-tltab">
            {ABOUT.timeline.label}
          </span>
        }
        count={JOBS.length}
        tabX={0.03}
        className="pm-ab-tlfolder"
        bodyClassName="pm-ab-tlbody"
      >
        <div className="pm-ab-tl" ref={rootRef} style={vars}>
          <ol className="pm-ab-jobs" aria-label={TIMELINE.listLabel}>
            {JOBS.map((job, i) => (
              <JobRow key={job.id} job={job} index={i} />
            ))}
          </ol>

          <div className="pm-ab-plane">
            <span className="pm-ab-plane__bands" aria-hidden="true" />
            <div className="pm-ab-plane__top">
              <span className="pm-ab-plane__now" aria-hidden="true" />
              <div className="pm-ab-bars" aria-hidden="true">
                {tracks.map((track) => (
                  <div className="pm-ab-trk" key={track} data-track={track}>
                    {JOBS.map((job, i) => (job.track === track ? <Bar key={job.id} job={job} index={i} /> : null))}
                  </div>
                ))}
              </div>

              <div className="pm-ab-axis" aria-hidden="true">
                <div className="pm-ab-axis__scale">
                  <span className="pm-ab-axis__ticks" />
                  <span className="pm-ab-axis__months" />
                  {YEARS.map((year, i) => (
                    <span key={year} className="pm-ab-axis__y" style={{ '--i': i } as CSSProperties}>
                      {year}
                    </span>
                  ))}
                  <span className="pm-ab-axis__flag">{TIMELINE.now}</span>
                </div>
              </div>
            </div>

            <div className="pm-ab-lane" ref={laneRef}>
              <div className="pm-ab-lane__lab">
                <h3 className="pm-ab-lane__title">{TIMELINE.freelance}</h3>
                <p className="pm-ab-lane__note">{TIMELINE.freelanceNote}</p>
                <p className="pm-ab-lane__aside">
                  <Scribble kind="arrow" dir="left" w="2.6rem" color="oxblood" stroke={3} seed="pm-aside" draw={700} />
                  {TIMELINE.escapeRoom}
                </p>
              </div>
              <ul className="pm-ab-pins" ref={pinsRef} aria-label={TIMELINE.freelanceList}>
                {PINS.map((pin, i) => (
                  <PinItem key={pin.work.slug} pin={pin} index={i} />
                ))}
              </ul>
            </div>
          </div>

          <div className="pm-ab-also">
            <p className="pm-ab-also__lab">{TIMELINE.also}</p>
            <ul className="pm-ab-also__list" aria-label={TIMELINE.alsoList}>
              {ALSO.map((work) => (
                <AlsoChip key={work.slug} work={work} />
              ))}
            </ul>
          </div>
        </div>
      </Folder>
    </div>
  )
}
