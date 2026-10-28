// The index tabs (the file keeps its old name, PillNav, so App does not change): six dividers of a filing drawer poking
// out of a cream rail, sticky at the top of the window (opaque, no blur, 64 px; 56 px on phones). The tab of the sheet you
// are reading is pulled up and takes that sheet's accent (a small spring with one overshoot: this object is physical).
// Scroll-spy = sectionState (IntersectionObserver band at the middle of the viewport). Real links: #catalog etc.
// Left of the rail: the counter "03 /06" and a small "PM" monogram tab (back to the top: the name stays with you once the mast
// has scrolled away). Right: the "Pause motion" tab. On a phone the tabs become one snap row that centres the active tab.
// Sets --nav-h on :root to its measured height (base.css uses it for scroll-padding-top). The nav marks itself
// data-stuck="true" while it is pinned to the top edge.

import { useEffect, useRef, type MouseEvent } from 'react'
import { MAST, NAV, NAV_COUNTER } from '../../lib/copy'
import { useMotion } from '../../lib/motion'
import { scrollToSection, type SectionId } from '../../lib/router'
import { Asterisk } from './marks'
import MotionToggle from './MotionToggle'
import { focusSection, lockToSection, readAccents, scrollToTop, subscribeScroll, useActiveIndex } from './sectionState'
import { CHROME } from './strings'
import './chrome.css'

export function PillNav() {
  const active = useActiveIndex()
  const { still } = useMotion()
  const navRef = useRef<HTMLElement | null>(null)
  const rowRef = useRef<HTMLUListElement | null>(null)
  const stitchRef = useRef<HTMLElement | null>(null)
  const pinRef = useRef<HTMLElement | null>(null)
  const hiRef = useRef<HTMLElement | null>(null)
  const [counterNum, counterRest] = NAV_COUNTER(active).split(' ') // "03 /06": the number rolls, the total stays

  // the rail is a ruler of six inches (one per sheet, like the desk ruler in the margin): a tomato pin slides along it, the inch of the
  // sheet you are on is highlighted and the stitches under it are sewn over as you read. DOM writes only, no re-render per frame.
  useEffect(() => {
    let last = -1
    return subscribeScroll((info) => {
      const frac = Math.min(1, Math.max(0, info.p / 6))
      const stitch = stitchRef.current
      if (stitch) stitch.style.clipPath = `inset(0 ${((1 - frac) * 100).toFixed(2)}% 0 0)`
      const pin = pinRef.current
      if (pin) pin.style.left = `${(frac * 100).toFixed(2)}%`
      const hi = hiRef.current
      if (hi && info.index !== last) {
        last = info.index
        hi.style.transform = `translate3d(${info.index * 100}%, 0, 0)`
      }
    })
  }, [])

  // pinned to the top edge? (IntersectionObserver on the sticky element itself; nothing re-renders)
  useEffect(() => {
    const nav = navRef.current
    if (!nav || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => {
        nav.dataset.stuck = entry.intersectionRatio < 1 ? 'true' : 'false'
      },
      { threshold: [1], rootMargin: '-1px 0px 0px 0px' },
    )
    io.observe(nav)
    return () => io.disconnect()
  }, [])

  // the real height of the nav is the scroll padding: anchors, focus and "Back to cover" land just under it
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const root = document.documentElement
    const apply = () => root.style.setProperty('--nav-h', `${Math.round(nav.getBoundingClientRect().height)}px`)
    apply()
    if (typeof ResizeObserver === 'undefined') return () => root.style.removeProperty('--nav-h')
    const ro = new ResizeObserver(apply)
    ro.observe(nav)
    return () => {
      ro.disconnect()
      root.style.removeProperty('--nav-h')
    }
  }, [])

  // every tab carries the accent its sheet declares (the little coloured window of a real index tab)
  useEffect(() => {
    const paint = () => {
      const accents = readAccents()
      rowRef.current?.querySelectorAll<HTMLElement>('.pm-nav__tab').forEach((el, i) => {
        const a = accents[i]
        if (a?.color) el.style.setProperty('--tab-c', a.color)
        if (a?.ink) el.style.setProperty('--tab-on', a.ink)
      })
    }
    paint()
    const id = window.setTimeout(paint, 1500) // sections that finish rendering a moment later
    return () => window.clearTimeout(id)
  }, [])

  // phone: the snap row keeps the active tab in the middle
  useEffect(() => {
    const row = rowRef.current
    const tab = row?.children[active] as HTMLElement | undefined
    if (!row || !tab || row.scrollWidth <= row.clientWidth + 2) return
    const left = tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2
    row.scrollTo({ left, behavior: still ? 'auto' : 'smooth' })
  }, [active, still])

  const onClick = (event: MouseEvent<HTMLAnchorElement>, id: SectionId) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    lockToSection(id)
    scrollToSection(id)
    focusSection(id)
  }

  return (
    <nav ref={navRef} className="pm-nav" aria-label={CHROME.navLabel} data-stuck="false">
      <div className="pm-nav__inner">
        <a
          href="#cover"
          className="pm-nav__home"
          onClick={(e) => {
            if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
            e.preventDefault()
            scrollToTop()
          }}
        >
          <span className="pm-nav__home-pm" aria-hidden="true">
            PM
          </span>
          <span className="pm-nav__home-name" aria-hidden="true">
            {MAST.name}
          </span>
          <Asterisk className="pm-nav__home-mark" />
          <span className="pm-sr">{`${MAST.name}, ${CHROME.homeLabel}`}</span>
        </a>
        <ul ref={rowRef} className="pm-nav__tabs">
          {NAV.map((item, i) => (
            <li key={item.id} className="pm-nav__item">
              <a
                href={`#${item.id}`}
                className="pm-nav__tab"
                data-sec={item.id}
                data-active={i === active ? 'true' : undefined}
                aria-current={i === active ? 'true' : undefined}
                onClick={(e) => onClick(e, item.id)}
              >
                <span className="pm-nav__label">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="pm-nav__rail" aria-hidden="true">
          {/* a camera's footage counter: the digits roll up into place when the sheet changes (keyed, so the animation replays) */}
          <span className="pm-nav__count">
            <span className="pm-nav__digits" key={counterNum}>
              {counterNum}
            </span>
            <span>{` ${counterRest}`}</span>
          </span>
          <span className="pm-nav__seam">
            <i className="pm-nav__hi" ref={hiRef} />
            <i className="pm-nav__ticks" />
            <i className="pm-nav__thread">
              <i className="pm-nav__stitch" ref={stitchRef} />
            </i>
            <i className="pm-nav__pin" ref={pinRef} />
          </span>
        </div>
        <MotionToggle variant="rail" />
      </div>
    </nav>
  )
}

export default PillNav
