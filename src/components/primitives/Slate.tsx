// Cinema details. <SlateLabel items tone='ink'|'paper' clap /> (cells with no value are hidden), <ColorBars height compact />,
// <FilmPerforations hole tone='ink'|'cream' />, <FilmStrip tone>frames</FilmStrip> (perforations above and below).
// SlateLabel is a <dl> with a decorative clapper stick that snaps shut when it scrolls into view (html.js only).
// Exposes --board --chalk (slate), --h (bars), --hole --perf (perforations). Docs: docs/api/primitives.md

import { useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { useRevealOnce } from './hooks'
import { cx } from './util'

export interface SlateItem {
  label: string
  value?: ReactNode
}

export interface SlateLabelProps extends HTMLAttributes<HTMLDivElement> {
  items: SlateItem[]
  tone?: 'ink' | 'paper'
  /** the clapper stick snaps shut when the slate scrolls into view (default true) */
  clap?: boolean
}

const filled = (v: ReactNode): boolean => v !== null && v !== undefined && v !== false && v !== ''

export function SlateLabel({ items, tone = 'ink', clap = true, className, style, ...rest }: SlateLabelProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  useRevealOnce(ref, { disabled: !clap, threshold: 0.4 })
  const cells = items.filter((i) => filled(i.value))
  if (cells.length === 0) return null
  return (
    <div ref={ref} className={cx('pm-slate', className)} style={style} data-tone={tone} data-clap={clap ? '' : undefined} {...rest}>
      <div className="pm-slate__stick" aria-hidden="true" />
      <div className="pm-slate__board">
        <dl className="pm-slate__grid">
          {cells.map((cell) => (
            <div className="pm-slate__cell" key={cell.label}>
              <dt className="pm-slate__k">{cell.label}</dt>
              <dd className="pm-slate__v">{cell.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

export interface ColorBarsProps extends HTMLAttributes<HTMLDivElement> {
  height?: number | string
  compact?: boolean
}

export function ColorBars({ height = '4.5rem', compact, className, style, ...rest }: ColorBarsProps) {
  const vars = { '--h': typeof height === 'number' ? `${height}px` : height, ...style } as CSSProperties
  return (
    <div className={cx('pm-bars', className)} style={vars} data-compact={compact ? '' : undefined} aria-hidden="true" {...rest}>
      <div className="pm-bars__top" />
      {!compact && <div className="pm-bars__mid" />}
      {!compact && <div className="pm-bars__low" />}
    </div>
  )
}

export interface FilmPerforationsProps extends HTMLAttributes<HTMLDivElement> {
  hole?: number | string
  tone?: 'ink' | 'cream'
}

export function FilmPerforations({ hole, tone = 'ink', className, style, ...rest }: FilmPerforationsProps) {
  const vars = { '--hole': hole === undefined ? undefined : typeof hole === 'number' ? `${hole}px` : hole, ...style } as CSSProperties
  return <div className={cx('pm-perf', className)} style={vars} data-tone={tone} aria-hidden="true" {...rest} />
}

export function FilmStrip({ children, className, tone = 'ink', ...rest }: HTMLAttributes<HTMLDivElement> & { tone?: 'ink' | 'cream' }) {
  return (
    <div className={cx('pm-strip', className)} data-tone={tone} {...rest}>
      <FilmPerforations tone={tone} />
      <div className="pm-strip__frames">{children}</div>
      <FilmPerforations tone={tone} />
    </div>
  )
}
