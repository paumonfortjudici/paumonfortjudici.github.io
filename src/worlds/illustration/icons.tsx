// Hand-drawn pictograms of this world (the faces have no arrow glyphs). All aria-hidden, currentColor.
import type { SVGProps } from 'react'

type IconProps = Omit<SVGProps<SVGSVGElement>, 'dir'>

const base = {
  viewBox: '0 0 24 24',
  width: '1em',
  height: '1em',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
}

/** a curved arrow: turn left (counter-clockwise) or right (clockwise) */
export function TurnIcon({ dir, ...rest }: IconProps & { dir: 'left' | 'right' }) {
  return (
    <svg {...base} {...rest} style={{ transform: dir === 'right' ? 'scaleX(-1)' : undefined, ...rest.style }}>
      <path d="M5.2 13.2C5.6 8.3 9.6 5 14.4 5.4c3.2.3 5.6 2.4 6.2 5.4" />
      <path d="M4.6 5.6l.4 5.6 5.4-.9" />
      <path d="M19.2 15.6c-1.3 2.3-3.6 3.6-6.4 3.5" />
    </svg>
  )
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5.2c-.2 4.8-.1 8.2 0 13.6" />
      <path d="M5.2 12.1c4.9-.2 8.3-.1 13.6 0" />
    </svg>
  )
}

export function MinusIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5.2 12.1c4.9-.2 8.3-.1 13.6 0" />
    </svg>
  )
}

export function DownloadIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4.6c.2 5 .1 8.6 0 11.4" />
      <path d="M7.4 11.8c1.7 1.8 3.1 3.1 4.6 4.4 1.5-1.4 2.9-2.7 4.6-4.4" />
      <path d="M5 19.4c4.8.2 9.2.2 14 0" />
    </svg>
  )
}
