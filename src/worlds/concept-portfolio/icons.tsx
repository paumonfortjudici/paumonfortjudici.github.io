// Small hand-drawn pictograms for the deck world (the faces have no arrow glyphs and the site has no icon font).
// All are 1em, currentColor, aria-hidden. A boot print is the deck's own footprint motif.

import type { SVGProps } from 'react'

type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'>

const base = (props: IconProps): SVGProps<SVGSVGElement> => ({
  viewBox: '0 0 24 24',
  width: '1em',
  height: '1em',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
  ...props,
})

export function PlayIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7.5 4.8 19 12 7.5 19.2Z" fill="currentColor" />
    </svg>
  )
}

export function SpeakerIcon({ muted, ...props }: IconProps & { muted?: boolean }) {
  return (
    <svg {...base(props)}>
      <path d="M4 9.6h3.6L12.8 5v14l-5.2-4.6H4Z" fill="currentColor" strokeWidth={1.6} />
      {muted ? <path d="M16.4 9.4 21 14.6M21 9.4l-4.6 5.2" /> : <path d="M16.2 8.6c1.9 2 1.9 4.8 0 6.8M19 6c3.2 3.4 3.2 8.6 0 12" />}
    </svg>
  )
}

export function SheetIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="4" width="7" height="7" rx="1.2" />
      <rect x="13" y="4" width="7" height="7" rx="1.2" />
      <rect x="4" y="13" width="7" height="7" rx="1.2" />
      <rect x="13" y="13" width="7" height="7" rx="1.2" />
    </svg>
  )
}

export function LoupeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="10.4" cy="10.4" r="5.8" />
      <path d="M14.8 14.8 20 20" strokeWidth={3} />
    </svg>
  )
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20.4 12.4C15.6 11.7 10.2 12.5 4.6 11.9" />
      <path d="M10.2 5.8C8.5 8.5 6.5 10.5 3.6 11.9c2.8 1.5 4.9 3.6 6.5 6.5" />
    </svg>
  )
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3.6 12.4C8.4 11.7 13.8 12.5 19.4 11.9" />
      <path d="M13.8 5.8C15.5 8.5 17.5 10.5 20.4 11.9c-2.8 1.5-4.9 3.6-6.5 6.5" />
    </svg>
  )
}

/** a boot print with the zig-zag tread. `foot="l"` mirrors it. The fill and tread colours come from CSS (.w-cp-boot ...) */
export function BootPrint({ foot = 'r', className }: { foot?: 'l' | 'r'; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 64" width="100%" height="100%" aria-hidden="true" focusable="false" style={foot === 'l' ? { transform: 'scaleX(-1)' } : undefined}>
      <path
        className="w-cp-boot-sole"
        d="M14 2.2C21.2 2.2 25.4 9 25.2 19C25 27.2 21.8 30.6 21.4 35.4C21 40.4 24.2 43.6 24 51C23.8 59 19.8 62.4 14 62.2C8.2 62 4.2 58.8 4.2 52C4.2 45 7.4 41.4 7.2 35C7 29.2 2.8 26.4 2.8 18.4C2.8 9 7 2.2 14 2.2Z"
      />
      <path className="w-cp-boot-tread" d="M7.4 11.5l4.2-3.2 3 3.2 3-3.2 4.2 3.2M6.6 20l4.2-3.2 3.2 3.2 3.2-3.2 4 3.2M7.6 28.5l3.6-3 2.8 3 2.8-3 3.4 3M9.2 47l3.4-3 2.6 3 2.8-3 3 3M9 55l3.4-3 2.6 3 2.8-3 3 3" />
    </svg>
  )
}
