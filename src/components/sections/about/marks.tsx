// Small hand-drawn pictograms for the three skill blocks, plus the code-bracket scribble. Strokes only, currentColor, aria-hidden.
// The scribble reuses the primitives' draw-on mechanism (class pm-sc + data-draw, set to data-in by useRevealOnce), so it
// draws itself once when it arrives and is simply drawn under reduced / paused motion.

import { useRef, type CSSProperties, type SVGProps } from 'react'
import { useRevealOnce } from '../../primitives'

type IconProps = Omit<SVGProps<SVGSVGElement>, 'viewBox' | 'fill' | 'stroke'> & { size?: number | string }

function Icon({ size = '1.35em', children, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

/** a pen nib: the vector tool */
export function NibIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12.2 3.2C14.9 7.6 17.3 10.6 17 14.4C16.8 17 14.9 18.8 12 18.8C9.1 18.8 7.2 17 7 14.4C6.7 10.6 9.4 7.5 12.2 3.2Z" />
      <path d="M12 9.6V14.1" />
      <circle cx="12" cy="15.3" r="1.1" />
      <path d="M8.6 21H15.6" />
    </Icon>
  )
}

/** a pencil */
export function PencilIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.2 20L5.3 15.4L16.2 4.5C17.1 3.6 18.5 3.6 19.4 4.5L19.6 4.7C20.5 5.6 20.5 7 19.6 7.9L8.7 18.8L4.2 20Z" />
      <path d="M14.2 6.6L17.5 9.9" />
      <path d="M5.3 15.4L8.7 18.8" />
    </Icon>
  )
}

/** code brackets */
export function BracketsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8.4 6.6L3.6 12L8.6 17.5" />
      <path d="M15.6 6.5L20.4 12L15.4 17.6" />
      <path d="M13.4 4.6L10.5 19.4" />
    </Icon>
  )
}

const BRACES = [
  'M31 6.5C23.5 6.2 22.6 11.5 22.8 18.5C23 26.5 22 30.2 14.4 33.4C22.2 36.3 23 40.2 22.8 48.4C22.6 55.6 23.8 61 31.6 61.4',
  'M61.5 6.3C69 6.6 70 12 69.6 19.2C69.2 27 70.6 30.6 78.2 33.6C70.4 36.6 69.4 40.4 69.8 48.2C70.2 55.4 69 60.8 61 61.3',
  'M42.5 24.4V43.6',
]

/** a hand-drawn pair of braces with a caret between them */
export function BraceScribble({ className, delay = 0 }: { className?: string; delay?: number }) {
  const ref = useRef<SVGSVGElement>(null)
  useRevealOnce(ref, { threshold: 0.2 })
  const vars = { '--w': '4.7rem', '--d': `${delay}ms`, '--dur': '0.8s' } as CSSProperties
  return (
    <svg
      ref={ref}
      className={className ? `pm-sc ${className}` : 'pm-sc'}
      style={vars}
      viewBox="0 0 92 68"
      aria-hidden="true"
      focusable="false"
      data-draw=""
      data-kind="braces"
    >
      <g className="pm-sc__ink" fill="none" stroke="currentColor" strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round">
        {BRACES.map((d, i) => (
          <path key={i} className="pm-sc__p" d={d} pathLength={1} style={{ '--p': i } as CSSProperties} />
        ))}
      </g>
    </svg>
  )
}
