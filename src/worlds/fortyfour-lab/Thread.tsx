// The thread and the devil who walks it.
//   - Layout is measured from the DOM (zero-size anchors on every tag's eyelet and in the first month banner, the devil's empty slot in
//     the hero), turned into one smooth path, and re-measured when the wall resizes or the fonts arrive. Positions only come from
//     getBoundingClientRect, divided by the wall's own scale, so the folder-open transition cannot skew them.
//   - The thread runs down the spine; every tag hangs from it by a short yarn tie that ends in a knot on the tag's eyelet, so the
//     devil never has to walk over a tag. A faint dotted guide shows the whole route; the real thread (red running stitches) is
//     revealed with a clip-path down to the devil's feet, so it "sews itself" behind him.
//   - The devil rides a "reading line" half way down the visible area, following it with a soft spring (he lags, then catches up).
//     His x comes from the path at his y; he faces the way he is moving, leans into the slope and waddles while the page scrolls.
//     Only the transform of two small elements and one clip-path change per frame; the loop sleeps as soon as he has caught up.
//   - Reduced motion / "Pause motion": he stands still in the hero and the whole thread is drawn. No scroll listener at all.
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { asset } from '../../lib/asset'
import { useWorld } from '../WorldContext'
import { daysBetween } from './format'
import { POSTS } from './posts'
import { buildThread, clamp, lerp, sampleAtY, smooth, type Pt, type Thread } from './threadPath'

const DEVIL_RATIO = 1762 / 1418
// where his feet are in the cut-out (measured on the alpha channel: the ground shadow is centred at 63.4% of the width and 97.5% of the height)
const FEET_X = 0.634
const FEET_Y = 0.975

interface Gap {
  x: number
  y: number
  text: string
  side: 'left' | 'right'
  /** how far from the thread the words start: clear of the devil's short side, so he never stands on them */
  off: number
}

interface Model {
  w: number
  h: number
  /** the path he walks (y strictly increasing) */
  thread: Thread
  /** the path that is drawn: the same, minus the narrow layout's first sidestep out of the hero */
  drawD: string
  /** yarn ties from the thread to each eyelet */
  strings: string
  knots: Pt[]
  /** y of every post's eyelet, in order, to make the tags swing when the devil passes */
  postYs: number[]
  /** short hand-written notes beside the thread: how long after the previous post (wide layout, same month only) */
  gaps: Gap[]
  /** the last stitch, and which way the needle points (down-right in the wide layout, down-left along the edge) */
  end: Pt
  needleDeg: number
  /** wide layout: the thread zigzags across the spine and he turns to face the way he walks; narrow: he always faces the page */
  wide: boolean
  /** devil: width in the hero, and the scale he walks at */
  heroW: number
  walkScale: number
  y0: number
  y1: number
}

function measure(wall: HTMLElement): Model | null {
  const box = wall.getBoundingClientRect()
  const w = wall.offsetWidth
  const h = wall.offsetHeight
  if (!w || !h) return null
  const k = box.width / w || 1
  const at = (el: Element): Pt => {
    const r = el.getBoundingClientRect()
    return { x: (r.left + r.width / 2 - box.left) / k, y: (r.top + r.height / 2 - box.top) / k }
  }
  const slot = wall.querySelector<HTMLElement>('[data-ffl-slot]')
  const probe = wall.querySelector<HTMLElement>('[data-ffl-walk]')
  if (!slot || !probe) return null
  const slotBox = slot.getBoundingClientRect()
  const heroW = slotBox.width / k
  const heroH = slotBox.height / k
  // the thread starts under his feet, so that at rest he stands exactly in the slot
  const start: Pt = { x: (slotBox.left - box.left) / k + FEET_X * heroW, y: (slotBox.bottom - box.top) / k - (1 - FEET_Y) * heroH }
  const walkW = probe.getBoundingClientRect().width / k

  const wide = window.matchMedia('(min-width: 1000px)').matches
  const spineX = w - Math.max(46, Math.min(62, w * 0.14))

  const anchors = Array.from(wall.querySelectorAll<HTMLElement>('[data-ffl-anchor]'))
  const raw = anchors.filter((el) => el.getAttribute('data-ffl-anchor') === 'knot').map(at)
  const span = raw.length ? Math.max(...raw.map((p) => p.x)) - Math.min(...raw.map((p) => p.x)) : 0
  // How far from its eyelet the thread passes (the length of the yarn tie). Long enough that the walking devil's short side (his hand,
  // 37% of his width) stays clear of the tag he walks past: eyelet to tag edge is 31px, plus a few px of air. Short enough that the
  // S-curve still swings visibly towards every tag.
  const tie = clamp(Math.max(span * 0.3, 39 + 0.37 * walkW), 56, 150)

  const points: Pt[] = [start]
  if (!wide) points.push({ x: spineX, y: start.y + 150 })
  const knots: Pt[] = []
  const postYs: number[] = []
  const strings: string[] = []
  let post = 0
  let end: Pt = start
  for (const el of anchors) {
    const kind = el.getAttribute('data-ffl-anchor')
    const p = at(el)
    if (kind === 'knot') {
      knots.push(p)
      postYs.push(p.y)
      const sx = wide ? (p.x < w / 2 ? p.x + tie : p.x - tie) : spineX + (post % 2 ? 5 : -5)
      points.push({ x: sx, y: p.y })
      const mid = ((sx + p.x) / 2).toFixed(1)
      strings.push(`M${sx.toFixed(1)} ${p.y.toFixed(1)}Q${mid} ${(p.y + 15).toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      post++
    } else if (kind === 'month') {
      points.push({ x: wide ? w / 2 : spineX, y: p.y })
    } else if (kind === 'end') {
      end = { x: wide ? w / 2 : spineX, y: p.y }
      points.push(end)
    }
  }
  const thread = buildThread(points)
  if (!thread) return null
  const drawn = wide ? thread : buildThread(points.slice(1))
  const gaps: Gap[] = []
  if (wide) {
    // everything a note must not touch: tags (with their titles and notes), the key, the small cards and the month banners
    const blocks = Array.from(wall.querySelectorAll<HTMLElement>('.w-fortyfour-lab-post, .w-fortyfour-lab-key, .w-fortyfour-lab-month, .w-fortyfour-lab-fact, .w-fortyfour-lab-sizes, .w-fortyfour-lab-endstack')).map((el) => {
      const r = el.getBoundingClientRect()
      return { l: (r.left - box.left) / k, r: (r.right - box.left) / k, t: (r.top - box.top) / k, b: (r.bottom - box.top) / k }
    })
    const hits = (l: number, r: number, top: number, bottom: number) => blocks.some((o) => l < o.r + 10 && r > o.l - 10 && top < o.b + 8 && bottom > o.t - 8)
    // He faces the way he walks and his trident side is the long one (63% of his width), so a note stands on the short side:
    // between a tag on the left and the next one on the right he walks right, and the short side is the right-hand one.
    // The note sits half way between the two eyelets if there is room, otherwise it slides along the thread until there is.
    const shortOff = clamp(walkW * (1 - FEET_X) + 18, 44, 120)
    const longOff = clamp(walkW * FEET_X + 18, 60, 190)
    for (let i = 0; i < knots.length - 1; i++) {
      const a = POSTS[i]
      const b = POSTS[i + 1]
      if (!a || !b || a.date.slice(0, 7) !== b.date.slice(0, 7)) continue
      const days = daysBetween(a.date, b.date)
      const text = days === 0 ? 'same day' : days === 1 ? 'next day' : days + ' days later'
      const mid = (knots[i].y + knots[i + 1].y) / 2
      const preferred: 'left' | 'right' = i % 2 ? 'left' : 'right'
      const other = preferred === 'left' ? 'right' : 'left'
      const spot = (side: 'left' | 'right', y: number) => {
        const off = side === preferred ? shortOff : longOff
        const x = sampleAtY(thread, y).x
        const width = off + text.length * 10.5
        const ok = side === 'right' ? !hits(x, x + width, y - 18, y + 18) : !hits(x - width, x, y - 18, y + 18)
        return ok ? ({ x, y, text, side, off } as Gap) : null
      }
      let found: Gap | null = null
      for (const d of [0, 50, -50, 100, -100, 150, -150, 200, -200]) {
        const y = mid + d
        if (y < knots[i].y + 90 || y > knots[i + 1].y - 90) continue
        found = spot(preferred, y) ?? spot(other, y)
        if (found) break
      }
      if (found) gaps.push(found)
    }
  }
  return {
    w,
    h,
    thread,
    drawD: (drawn ?? thread).d,
    strings: strings.join(''),
    knots,
    postYs,
    gaps,
    end,
    needleDeg: wide ? 58 : 122,
    wide,
    heroW,
    walkScale: clamp(walkW / heroW, 0.18, 1),
    y0: thread.ys[0],
    y1: thread.ys[thread.ys.length - 1],
  }
}

export default function Thread({ wallRef }: { wallRef: RefObject<HTMLDivElement> }) {
  const { scrollRef, reduced } = useWorld()
  const [model, setModel] = useState<Model | null>(null)
  const devil = useRef<HTMLDivElement>(null)
  const lean = useRef<HTMLDivElement>(null)
  const live = useRef<HTMLDivElement>(null)
  const liveInner = useRef<HTMLDivElement>(null)
  /** where he is on the thread (a y); survives a re-measure so he does not jump back to the hero */
  const posRef = useRef<number | null>(null)

  const remeasure = useCallback(() => {
    const wall = wallRef.current
    if (!wall) return
    const next = measure(wall)
    if (!next) return
    setModel((prev) => {
      // keep the old object when nothing moved, so the loop below is not torn down for nothing
      if (prev && prev.w === next.w && prev.h === next.h && prev.thread.d === next.thread.d && prev.drawD === next.drawD && prev.heroW === next.heroW && prev.walkScale === next.walkScale) return prev
      return next
    })
  }, [wallRef])

  useLayoutEffect(() => {
    remeasure()
  }, [remeasure])

  useEffect(() => {
    const wall = wallRef.current
    if (!wall) return
    let frame = 0
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(remeasure)
    }
    const observer = new ResizeObserver(schedule)
    observer.observe(wall)
    window.addEventListener('resize', schedule)
    void document.fonts?.ready.then(schedule)
    // images and the grid settle a moment after the first paint
    const late = window.setTimeout(schedule, 700)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(late)
      window.removeEventListener('resize', schedule)
      observer.disconnect()
    }
  }, [wallRef, remeasure])

  // the walk
  useEffect(() => {
    const el = devil.current
    const leanEl = lean.current
    const liveEl = live.current
    const innerEl = liveInner.current
    const wall = wallRef.current
    if (!model || !el || !leanEl || !liveEl || !innerEl || !wall) return
    const { thread, heroW, walkScale, y0, y1, postYs, wide } = model
    const heroH = heroW * DEVIL_RATIO

    /** puts him on the thread at depth y; returns the scale he is drawn at */
    const place = (y: number, facing: number, leanDeg: number) => {
      const s = lerp(1, walkScale, smooth(clamp((y - y0 - 30) / 560, 0, 1)))
      const { x } = sampleAtY(thread, y)
      el.style.transform = `translate3d(${(x - heroW * s * FEET_X).toFixed(1)}px, ${(y - heroH * s * FEET_Y).toFixed(1)}px, 0) scale(${s.toFixed(4)})`
      leanEl.style.transform = `rotate(${leanDeg.toFixed(2)}deg) scaleX(${facing})`
      return s
    }

    // The sewn part of the thread is revealed by a curtain that moves with transforms only (no repaint, nothing re-rastered):
    // the window clips and moves down by pos - h, the drawing inside moves up by the same amount, so it never moves on the page.
    // (A clip-path changed on every frame re-rastered the 9000px dashed layer and cost half of every frame.) Whole pixels, so the two cancel exactly.
    const reveal = (y: number) => {
      const p = Math.round(clamp(y, 0, model.h))
      liveEl.style.transform = p >= model.h ? 'none' : `translate3d(0, ${p - model.h}px, 0)`
      innerEl.style.transform = p >= model.h ? 'none' : `translate3d(0, ${model.h - p}px, 0)`
    }

    if (reduced) {
      // still: standing in the hero, the whole thread sewn
      reveal(model.h)
      el.removeAttribute('data-walking')
      place(y0, 1, 0)
      posRef.current = null
      return
    }

    const scroller = scrollRef.current
    if (!scroller) return
    const posts = Array.from(wall.querySelectorAll<HTMLElement>('[data-ffl-post]'))
    // the hand-written day-gap notes get out of his way: they fade while he stands level with them
    const notes = Array.from(wall.querySelectorAll<HTMLElement>('.w-fortyfour-lab-gap')).map((node, i) => ({ node, y: model.gaps[i]?.y ?? -1e9, near: false }))
    let pos = posRef.current ?? clamp(scroller.scrollTop + scroller.clientHeight * 0.5, y0, y1)
    let facing = 1
    let leanDeg = 0
    let lastX = sampleAtY(thread, pos).x
    let lastMove = 0
    let walking = false
    let running = false
    let frame = 0
    let last = 0

    const swing = (i: number) => {
      const tag = posts[i]
      if (!tag || tag.hasAttribute('data-swing')) return
      tag.setAttribute('data-swing', '')
      const done = () => tag.removeAttribute('data-swing')
      tag.querySelector('.w-fortyfour-lab-media')?.addEventListener('animationend', done, { once: true })
      window.setTimeout(done, 1600)
    }

    const tick = (now: number) => {
      const dt = Math.min(0.064, (now - last) / 1000 || 0.016)
      last = now
      const vh = scroller.clientHeight
      const target = clamp(scroller.scrollTop + vh * 0.5, y0, y1)
      const prev = pos
      let next = prev + (target - prev) * (1 - Math.exp(-dt * 9))
      const maxLag = vh * 0.46
      next = clamp(next, target - maxLag, target + maxLag)
      if (Math.abs(target - next) < 0.4) next = target
      pos = next
      posRef.current = pos
      const moved = pos - prev
      if (Math.abs(moved) > 0.35) lastMove = now
      const nowWalking = now - lastMove < 170
      if (nowWalking !== walking) {
        walking = nowWalking
        if (walking) el.setAttribute('data-walking', '')
        else el.removeAttribute('data-walking')
      }
      const sample = sampleAtY(thread, pos)
      const dx = sample.x - lastX
      // narrow: the thread hugs the right edge, so he keeps his trident towards the page (turned the other way it would leave the screen)
      if (wide && Math.abs(dx) > 0.12) facing = dx > 0 ? 1 : -1
      lastX = sample.x
      const lead = facing * clamp(Math.atan(Math.abs(sample.slope)) * (180 / Math.PI) * 0.16, 0, 9)
      leanDeg = lerp(leanDeg, walking ? lead : 0, 1 - Math.exp(-dt * 8))
      const s = place(pos, facing, leanDeg)
      reveal(pos)
      const headY = pos - heroH * s * FEET_Y - 24
      for (const note of notes) {
        const near = note.y > headY && note.y < pos + 36
        if (near !== note.near) {
          note.near = near
          if (near) note.node.setAttribute('data-near', '')
          else note.node.removeAttribute('data-near')
        }
      }
      // tags sway when he walks past their eyelet
      for (let i = 0; i < postYs.length; i++) {
        const y = postYs[i]
        if ((prev < y && pos >= y) || (prev > y && pos <= y)) swing(i)
      }
      running = pos !== target || walking
      if (running) frame = requestAnimationFrame(tick)
    }

    const kick = () => {
      if (running) return
      running = true
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }

    scroller.addEventListener('scroll', kick, { passive: true })
    kick()
    return () => {
      scroller.removeEventListener('scroll', kick)
      cancelAnimationFrame(frame)
      el.removeAttribute('data-walking')
      for (const note of notes) note.node.removeAttribute('data-near')
    }
  }, [model, reduced, scrollRef, wallRef])

  const w = model?.w ?? 0
  const h = model?.h ?? 0
  return (
    <>
      <span className="w-fortyfour-lab-walkprobe" data-ffl-walk aria-hidden="true" />
      {model && (
        <div className="w-fortyfour-lab-thread" aria-hidden="true" style={{ width: w, height: h }}>
          <svg className="w-fortyfour-lab-guide" width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            <path d={model.drawD} />
          </svg>
          {model.gaps.map((g) => (
            <span key={g.y} className="w-fortyfour-lab-gap" data-side={g.side} style={{ left: g.x, top: g.y, '--off': `${g.off.toFixed(0)}px` } as CSSProperties}>
              {g.text}
            </span>
          ))}
          <div ref={live} className="w-fortyfour-lab-live" style={{ transform: `translate3d(0, ${-h}px, 0)` }}>
            <div ref={liveInner} className="w-fortyfour-lab-live-inner" style={{ transform: `translate3d(0, ${h}px, 0)` }}>
              <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
                <path className="w-fortyfour-lab-stitch-edge" d={model.drawD} />
                <path className="w-fortyfour-lab-stitch" d={model.drawD} />
                <path className="w-fortyfour-lab-stitch-light" d={model.drawD} />
              </svg>
            </div>
          </div>
        </div>
      )}
      <div ref={devil} className="w-fortyfour-lab-devil" style={{ width: model?.heroW ?? 0, visibility: model ? 'visible' : 'hidden' }} aria-hidden="true">
        <div ref={lean} className="w-fortyfour-lab-devil-lean">
          <div className="w-fortyfour-lab-devil-hop pm-ambient">
            <img src={asset('/works/fortyfour-lab/logo/devil-cutout.webp')} alt="" width={1418} height={1762} decoding="async" draggable={false} />
          </div>
        </div>
      </div>
      {model && (
        <div className="w-fortyfour-lab-ties" aria-hidden="true" style={{ width: w, height: h }}>
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            {model.strings && <path className="w-fortyfour-lab-string-edge" d={model.strings} />}
            {model.strings && <path className="w-fortyfour-lab-string" d={model.strings} />}
            {model.knots.map((p, i) => (
              <g key={i} transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`}>
                <circle className="w-fortyfour-lab-knot" r="6.5" />
                <circle className="w-fortyfour-lab-knot-shine" cx="-1.8" cy="-2" r="1.7" />
              </g>
            ))}
            <g className="w-fortyfour-lab-needle" transform={`translate(${model.end.x.toFixed(1)} ${model.end.y.toFixed(1)}) rotate(${model.needleDeg})`}>
              <path className="w-fortyfour-lab-needle-body" d="M0 0 L8 -3.4 L96 -1.4 L132 0 L96 1.4 L8 3.4 Z" />
              <ellipse className="w-fortyfour-lab-needle-eye" cx="14" cy="0" rx="4.6" ry="1.7" />
            </g>
          </svg>
        </div>
      )}
    </>
  )
}
