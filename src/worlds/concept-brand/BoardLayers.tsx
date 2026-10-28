// The layers that sit on the board: the real buttons (24 hotspots, a patch of wallpaper and the four characters), the dim and the
// hand marker around the target, the speech bubbles and the 2x detail art that fades in when you zoom.
import { useMemo, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react'
import { Tape } from '../../components/primitives'
import { MASCOT_COPY } from './copy'
import {
  BOARD_H,
  BOARD_W,
  HOT,
  HOTS,
  MASCOTS,
  TOP,
  groupOfItem,
  mascotRect,
  selectionRects,
  type MascotId,
  type Rect,
  type Selection,
} from './data'
import { dimPath, growRect, markerPath, rectsOverlap } from './geometry'
import type { Speech } from './speech'

const rectStyle = (r: Rect): CSSProperties => ({ left: r.x, top: r.y, width: r.w, height: r.h })

// ---- tape: four strips hold the board on the wall ------------------------------------------------------------------------------
export function Tapes() {
  const strips: { at: 'tl' | 'tr' | 'bl' | 'br'; color: string; rot: number; pattern: 'plain' | 'stripes' | 'dots' }[] = [
    { at: 'tl', color: 'var(--cb-mantega)', rot: -34, pattern: 'plain' },
    { at: 'tr', color: 'var(--cb-oliva)', rot: 36, pattern: 'stripes' },
    { at: 'bl', color: 'var(--cb-rosat)', rot: 38, pattern: 'dots' },
    { at: 'br', color: 'var(--cb-mantega)', rot: -36, pattern: 'plain' },
  ]
  return (
    <>
      {strips.map((s) => (
        <span key={s.at} className="w-concept-brand-tape-anchor" data-at={s.at} aria-hidden="true">
          <Tape at={s.at} color={s.color} rotate={s.rot} pattern={s.pattern} />
        </span>
      ))}
    </>
  )
}

// ---- detail: the real 2x mockups and posters, only when zoomed in and in view -----------------------------------------------------
export function Detail({ on, view }: { on: boolean; view: Rect | null }) {
  if (!on || !view) return null
  const around = growRect(view, Math.max(view.w, view.h) * 0.25)
  const shown = HOTS.filter((h) => h.detail && rectsOverlap(h.detail.rect, around))
  return (
    <>
      {shown.map((h) => (
        <img
          key={h.id}
          className="w-concept-brand-detail"
          src={h.detail!.src}
          width={h.detail!.w}
          height={h.detail!.h}
          alt=""
          decoding="async"
          draggable={false}
          style={rectStyle(h.detail!.rect)}
          onLoad={(e) => {
            e.currentTarget.dataset.ready = 'true'
          }}
        />
      ))}
    </>
  )
}

// ---- highlight: dim everything but the target and draw a hand marker around it ----------------------------------------------------
export function Highlight({ sel }: { sel: Selection }) {
  const rects = useMemo(() => selectionRects(sel), [sel])
  const dim = sel.group !== null && !(sel.group === 'pattern' && !sel.item)
  const signature = `${sel.group ?? '-'}:${sel.item ?? '-'}`
  const paths = useMemo(() => rects.map((r, i) => markerPath(r, i + 3 + rects.length * 11)), [rects])
  const dimD = useMemo(() => (dim ? dimPath(rects) : ''), [dim, rects])
  if (!rects.length) return null
  return (
    <svg className="w-concept-brand-hl" width={BOARD_W} height={BOARD_H} viewBox={`0 0 ${BOARD_W} ${BOARD_H}`} aria-hidden="true" focusable="false" key={signature}>
      {dim && <path className="w-concept-brand-dim" d={dimD} fillRule="evenodd" />}
      {paths.map((d, i) => (
        <g key={i} style={{ '--cb-i': i } as CSSProperties}>
          <path className="w-concept-brand-marker-shade" d={d} pathLength={1} />
          <path className="w-concept-brand-marker" d={d} pathLength={1} />
        </g>
      ))}
    </svg>
  )
}

// ---- speech bubbles -------------------------------------------------------------------------------------------------------------
export function Bubbles({ speech }: { speech: Speech }) {
  return (
    <>
      {MASCOTS.map((m) => {
        // only the latest speaker gets a bubble: two heads a hundred pixels apart would talk over each other
        if (!speech.active[m.id] || speech.said?.id !== m.id) return null
        const left = m.cx - 475 + TOP.castScale * (m.tip.x * 10)
        const top = TOP.castY + TOP.castScale * m.tip.y
        return (
          <span key={m.id} className="w-concept-brand-bubble" data-id={m.id} style={{ left, top }} aria-hidden="true">
            <span className="w-concept-brand-bubble-in">{MASCOT_COPY[m.id].catch}</span>
          </span>
        )
      })}
    </>
  )
}

// ---- the buttons ----------------------------------------------------------------------------------------------------------------
interface HotspotsProps {
  sel: Selection
  speech: Speech
  onSelect: (sel: Selection) => void
  onEnsureVisible: (rect: Rect) => void
  /** true when the pointer travelled since it went down: a drag that ends on a button is not a click */
  wasDrag: () => boolean
}

const WALLPAPER_PATCH: Rect = { x: 0, y: 0, w: 520, h: 330 }

export function Hotspots({ sel, speech, onSelect, onEnsureVisible, wasDrag }: HotspotsProps) {
  const focusVisible = (e: { currentTarget: HTMLElement }, rect: Rect) => {
    if (e.currentTarget.matches(':focus-visible')) onEnsureVisible(rect)
  }
  const current = sel.item
  const pick = (e: ReactMouseEvent, id: string) => {
    if (wasDrag()) return
    const g = groupOfItem(id)
    onSelect({ group: g, item: id })
    void e
  }
  return (
    <>
      <button
        type="button"
        className="w-concept-brand-hot"
        data-kind="zone"
        data-cursor="Open"
        style={rectStyle(HOT.wordmark.rect)}
        aria-label="Wordmark and cast: the top zone of the board"
        aria-current={current === 'wordmark' ? 'true' : undefined}
        onFocus={(e) => focusVisible(e, HOT.wordmark.rect)}
        onClick={(e) => {
          if (wasDrag()) return
          // a click on the bare ground means the wallpaper; the wordmark itself and keyboard presses mean the wordmark
          const box = e.currentTarget.getBoundingClientRect()
          const bx = e.detail === 0 ? 1500 : ((e.clientX - box.left) / box.width) * BOARD_W
          const by = e.detail === 0 ? 400 : ((e.clientY - box.top) / box.height) * 1500
          const w = TOP.wordmarkInk
          const onWordmark = bx >= w.x && bx <= w.x + w.w && by >= w.y && by <= w.y + w.h
          onSelect(onWordmark ? { group: 'wordmark', item: 'wordmark' } : { group: 'pattern', item: null })
        }}
      />
      <button
        type="button"
        className="w-concept-brand-hot"
        data-kind="patch"
        data-cursor="Open"
        style={rectStyle(WALLPAPER_PATCH)}
        aria-label="The wallpaper pattern behind the wordmark"
        aria-current={sel.group === 'pattern' ? 'true' : undefined}
        onFocus={(e) => focusVisible(e, { x: 0, y: 0, w: 1200, h: 1200 })}
        onClick={() => {
          if (!wasDrag()) onSelect({ group: 'pattern', item: null })
        }}
      />
      {MASCOTS.map((m) => {
        const r = mascotRect(m)
        const id: MascotId = m.id
        return (
          <button
            key={id}
            type="button"
            className="w-concept-brand-hot"
            data-kind="mascot"
            data-cursor="Open"
            style={rectStyle(r)}
            aria-label={MASCOT_COPY[id].aria}
            aria-current={current === id ? 'true' : undefined}
            onPointerEnter={(e) => {
              // a mouse that merely passes over says hello; a held button (a drag across the cast) and touch (it taps) do not
              if (e.pointerType === 'mouse' && e.buttons === 0) speech.trigger(id)
            }}
            onFocus={(e) => {
              speech.trigger(id)
              focusVisible(e, r)
            }}
            onClick={() => {
              if (wasDrag()) return
              speech.trigger(id)
              onSelect({ group: 'cast', item: id })
            }}
          />
        )
      })}
      {HOTS.filter((h) => h.id !== 'wordmark').map((h) => (
        <button
          key={h.id}
          type="button"
          className="w-concept-brand-hot"
          data-kind={h.kind}
          data-cursor="Open"
          style={rectStyle(h.rect)}
          aria-label={`${h.title}. ${h.alt}`}
          aria-current={current === h.id ? 'true' : undefined}
          onFocus={(e) => focusVisible(e, h.rect)}
          onClick={(e) => pick(e, h.id)}
        />
      ))}
    </>
  )
}

