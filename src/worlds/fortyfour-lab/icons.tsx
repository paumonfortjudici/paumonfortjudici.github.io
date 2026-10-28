// Small drawn pictograms for the 44 Lab world, in the logo's own language: dark outline, flat fills from its palette.
// (The Instagram bio uses emoji; this world draws its own instead of printing them.) All aria-hidden.

import type { SVGProps } from 'react'

type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'>

const base = {
  viewBox: '0 0 32 32',
  fill: 'none',
  stroke: 'var(--ffl-outline)',
  strokeWidth: 2.2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true as const,
  focusable: false as const,
}

/** a spool of thread: handtufted */
export function SpoolIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="9" y="8.6" width="14" height="14.8" rx="1.2" fill="var(--ffl-red)" />
      <path d="M9.4 12.6 22.6 11M9.4 16.8 22.6 15.2M9.4 21 22.6 19.4" strokeWidth="1.5" />
      <rect x="6.4" y="4.4" width="19.2" height="4.4" rx="2" fill="var(--ffl-cream)" />
      <rect x="6.4" y="23.2" width="19.2" height="4.4" rx="2" fill="var(--ffl-cream)" />
      <path d="M22.6 19.4c3.4 1.2 3.6 4.6 6.2 5.2" stroke="var(--ffl-red)" strokeWidth="2.6" />
    </svg>
  )
}

/** a paper plane: international shipping */
export function PlaneIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3.6 15.4 28 4.6 21.8 27.4 15.6 18.2z" fill="var(--ffl-cream)" />
      <path d="M15.6 18.2 28 4.6" />
      <path d="M15.6 18.2 14.6 25.4 18.4 21.6" fill="var(--ffl-yellow)" />
      <path d="M2 24.6c2.4-1.2 4-.2 5.4-1.4" stroke="var(--ffl-red)" strokeWidth="2.2" strokeDasharray="0.1 4.2" />
    </svg>
  )
}

/** a speech bubble: custom orders by DM */
export function BubbleIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 5.6h22a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H15.2L8.4 28.4l.6-6H5a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2z" fill="var(--ffl-yellow)" />
      <path d="M8.6 11.6h14.8M8.6 16.4h9" strokeWidth="2.4" />
    </svg>
  )
}

export function PlayIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={2} {...props}>
      <path d="M9 5.6 25 16 9 26.4z" fill="currentColor" stroke="currentColor" />
    </svg>
  )
}

export function PauseIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={2} {...props}>
      <rect x="7" y="6" width="6.4" height="20" rx="1.4" fill="currentColor" stroke="currentColor" />
      <rect x="18.6" y="6" width="6.4" height="20" rx="1.4" fill="currentColor" stroke="currentColor" />
    </svg>
  )
}

/** a film frame with its sprocket holes: the STILL mark */
export function FrameIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={2.4} {...props}>
      <rect x="5" y="3.6" width="22" height="24.8" rx="2.4" fill="var(--ffl-cream)" />
      <path d="M5 9.4h22M5 22.6h22" />
      <path d="M9.6 6.5h.1M16 6.5h.1M22.4 6.5h.1M9.6 25.5h.1M16 25.5h.1M22.4 25.5h.1" strokeWidth="2.6" />
    </svg>
  )
}
