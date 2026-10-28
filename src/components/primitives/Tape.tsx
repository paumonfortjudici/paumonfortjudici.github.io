// <Tape> - a piece of washi tape: translucent (the art shows through), jagged torn ends, a faint pattern, fibre tooth, a
// hair of shadow. It always HOLDS something: put it on a polaroid, a note or a card corner.
// Props: color (tone name or CSS colour; default butter), pattern ('plain'|'stripes'|'dots'|'grid'|'checks'), rotate (deg),
// w / h (CSS lengths; default 7.5rem x 1.9rem), at ('top'|'bottom'|'left'|'right'|'tl'|'tr'|'bl'|'br': absolutely placed so
// the tape overhangs that edge/corner of its position:relative parent), children (hand-written label on the tape).
// Exposes --tape --rot --w --h. Decorative: aria-hidden unless it has text children.

import type { CSSProperties, ReactNode } from 'react'
import { cx, TONES, type ToneName } from './util'

export type TapeAt = 'top' | 'bottom' | 'left' | 'right' | 'tl' | 'tr' | 'bl' | 'br'

export interface TapeProps {
  color?: ToneName | string
  pattern?: 'plain' | 'stripes' | 'dots' | 'grid' | 'checks'
  rotate?: number
  w?: number | string
  h?: number | string
  at?: TapeAt
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

const px = (v: number | string): string => (typeof v === 'number' ? `${v}px` : v)

export function Tape({ color = 'butter', pattern = 'plain', rotate, w, h, at, className, style, children }: TapeProps) {
  const fill = color in TONES ? TONES[color as ToneName].color : color
  const vars = {
    '--tape': fill,
    '--rot': rotate === undefined ? undefined : `${rotate}deg`,
    '--w': w === undefined ? undefined : px(w),
    '--h': h === undefined ? undefined : px(h),
    ...style,
  } as CSSProperties
  return (
    <span className={cx('pm-tape', className)} style={vars} data-at={at} data-pattern={pattern} {...(children ? {} : { 'aria-hidden': true })}>
      <span className="pm-tape__in">{children}</span>
    </span>
  )
}
