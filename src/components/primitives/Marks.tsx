// Printer's marks for proof tables and light tables (the Contract world): <RegMark size /> is a registration target,
// <CropMarks gap len /> draws trim marks at the four corners of its position:relative parent (they sit OUTSIDE its box,
// so leave a margin). Both are decorative (aria-hidden) and take their colour from `color`.
// Exposes --size (RegMark), --gap --len (CropMarks).

import type { CSSProperties } from 'react'
import { cx } from './util'

export function RegMark({ size = '2rem', className, style }: { size?: number | string; className?: string; style?: CSSProperties }) {
  const vars = { '--size': typeof size === 'number' ? `${size}px` : size, ...style } as CSSProperties
  return (
    <svg className={cx('pm-reg', className)} style={vars} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <circle cx="16" cy="16" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16" cy="16" r="2.4" fill="currentColor" />
      <path d="M16 1.5V11.5M16 20.5V30.5M1.5 16H11.5M20.5 16H30.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="butt" />
    </svg>
  )
}

export function CropMarks({ gap = '0.5rem', len = '1.3rem', className, style }: { gap?: number | string; len?: number | string; className?: string; style?: CSSProperties }) {
  const px = (v: number | string) => (typeof v === 'number' ? `${v}px` : v)
  const vars = { '--gap': px(gap), '--len': px(len), ...style } as CSSProperties
  return (
    <span className={cx('pm-crop', className)} style={vars} aria-hidden="true">
      <span data-c="tl" />
      <span data-c="tr" />
      <span data-c="bl" />
      <span data-c="br" />
    </span>
  )
}
