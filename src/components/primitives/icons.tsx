// Hand-drawn pictograms drawn as strokes (the type families have no arrow glyphs: never print → ↗ ↑ ↓ as text).
// <ArrowIcon dir size /> and <CrossIcon size />: 1em by default, currentColor, aria-hidden.

import type { SVGProps } from 'react'

export type ArrowDir = 'right' | 'left' | 'up' | 'down' | 'up-right' | 'down-right' | 'up-left' | 'down-left'

const ROT: Record<ArrowDir, number> = {
  right: 0,
  down: 90,
  left: 180,
  up: -90,
  'up-right': -45,
  'down-right': 45,
  'down-left': 135,
  'up-left': -135,
}

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'dir'> {
  size?: number | string
}

export function ArrowIcon({ dir = 'right', size = '1em', style, ...rest }: IconProps & { dir?: ArrowDir }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ transform: `rotate(${ROT[dir]}deg)`, ...style }}
      {...rest}
    >
      <path d="M3.4 12.4C8.2 11.7 13.6 12.5 19.4 11.9" />
      <path d="M13.8 5.8C15.5 8.5 17.5 10.5 20.4 11.9C17.6 13.4 15.5 15.5 13.9 18.4" />
    </svg>
  )
}

export function CrossIcon({ size = '1em', ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...rest}>
      <path d="M5.4 5.8C9.4 9.4 13.8 14.4 18.7 18.4" />
      <path d="M18.4 5.4C14.6 9.8 10 14.2 5.6 18.7" />
    </svg>
  )
}
