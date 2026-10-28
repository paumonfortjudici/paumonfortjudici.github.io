// <StickyNote>, <PaperClip> and <Pin>: the small objects that hold things to other things. Each one must hold, point at or
// label something real (see docs/api/primitives.md), otherwise leave it out.
//   <StickyNote color rotate w pin='pin'|'tape'|'none'>hand-written text</StickyNote>   flat fills, folded corner, 3px edge
//   <PaperClip color rotate size />   a steel (or coloured) wire clip, hand-bent
//   <Pin color size />                a push pin seen from above, with its cast shadow
// All three are decorative apart from the note's text; the clip and the pin are aria-hidden.

import type { CSSProperties, ReactNode } from 'react'
import { Tape } from './Tape'
import { cx, resolveTone, TONES, type ToneName } from './util'

export interface PinProps {
  color?: ToneName | string
  size?: number | string
  className?: string
  style?: CSSProperties
}

export function Pin({ color = 'tomato', size = '2rem', className, style }: PinProps) {
  const fill = color in TONES ? TONES[color as ToneName].color : color
  const vars = { '--pin': fill, '--size': typeof size === 'number' ? `${size}px` : size, ...style } as CSSProperties
  return (
    <svg className={cx('pm-pin', className)} style={vars} viewBox="0 0 36 36" aria-hidden="true" focusable="false">
      <ellipse className="pm-pin__shadow" cx="22.5" cy="25" rx="10.5" ry="6" />
      <circle className="pm-pin__head" cx="16" cy="16" r="11" />
      <path className="pm-pin__shade" d="M24.2 22.6A11 11 0 0 1 8.3 24.4A9 9 0 0 0 24.2 22.6Z" />
      <path className="pm-pin__hl" d="M8.8 12.4A9 9 0 0 1 16.4 7.2" />
      <circle className="pm-pin__dot" cx="13.4" cy="13.2" r="2.4" />
    </svg>
  )
}

export interface PaperClipProps {
  color?: ToneName | string
  rotate?: number
  size?: number | string
  className?: string
  style?: CSSProperties
}

export function PaperClip({ color, rotate = 8, size = '4.5rem', className, style }: PaperClipProps) {
  const wire = color === undefined ? undefined : color in TONES ? TONES[color as ToneName].color : color
  const vars = {
    '--rot': `${rotate}deg`,
    '--size': typeof size === 'number' ? `${size}px` : size,
    ...(wire ? { '--wire': wire } : null),
    ...style,
  } as CSSProperties
  return (
    <svg className={cx('pm-clip', className)} style={vars} viewBox="-3 -3 30 72" aria-hidden="true" focusable="false">
      <path className="pm-clip__shadow" d="M7 14V47a5 5 0 0 0 10 0V8a8 8 0 0 0-16 0V50a11 11 0 0 0 22 0V18" />
      <path className="pm-clip__wire" d="M7 14V47a5 5 0 0 0 10 0V8a8 8 0 0 0-16 0V50a11 11 0 0 0 22 0V18" />
    </svg>
  )
}

export interface StickyNoteProps {
  color?: ToneName | string
  rotate?: number
  w?: number | string
  pin?: 'pin' | 'tape' | 'none'
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

export function StickyNote({ color = 'butter', rotate = -2, w, pin = 'none', className, style, children }: StickyNoteProps) {
  const palette = color in TONES ? resolveTone(color as ToneName) : { color, ink: 'var(--ink)' }
  const vars = {
    '--c': palette.color,
    '--on': palette.ink,
    '--rot': `${rotate}deg`,
    '--w': w === undefined ? undefined : typeof w === 'number' ? `${w}px` : w,
    ...style,
  } as CSSProperties
  return (
    <div className={cx('pm-note', className)} style={vars}>
      <div className="pm-note__paper t-hand">{children}</div>
      {pin === 'pin' && <Pin className="pm-note__pin" color="tomato" size="2.1rem" />}
      {pin === 'tape' && <Tape at="top" color="marigold" w="5rem" h="1.5rem" rotate={-3} />}
    </div>
  )
}
