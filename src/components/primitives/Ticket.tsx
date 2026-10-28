// <Ticket> - a perforated ticket stub: the site's external-link CTA (never a pill). Notches and a row of perforation holes are
// cut with masks, so the shadow and whatever is behind show through; on hover / focus the stub tears away a few degrees.
// Props: href, label (the link text, e.g. 'planadigital.cat'), kicker ('Visit'), external (default true: new tab,
// rel="noopener noreferrer", the accessible name says so), tone (paper colour of the main part, default 'paper'), stub (colour
// of the stub, default ink), rotate (deg), cursor (data-cursor, default 'Visit'). Exposes --c --on --stub --stub-ink --rot --n.

import type { AnchorHTMLAttributes, CSSProperties, ReactNode } from 'react'
import { cx, resolveTone, type ToneColors, type ToneName } from './util'

export interface TicketProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'color'> {
  href: string
  label: ReactNode
  kicker?: ReactNode
  external?: boolean
  tone?: ToneName
  stub?: ToneName | ToneColors
  rotate?: number
  cursor?: string
}

const text = (node: ReactNode): string => (typeof node === 'string' || typeof node === 'number' ? String(node) : '')

export function Ticket({ href, label, kicker = 'Visit', external = true, tone = 'paper', stub = 'ink', rotate, cursor = 'Visit', className, style, 'aria-label': ariaLabel, ...rest }: TicketProps) {
  const paper = resolveTone(tone, 'paper')
  const tail = resolveTone(stub, 'ink')
  const name = ariaLabel ?? `${text(kicker)} ${text(label)}`.trim() + (external ? ' (opens in a new tab)' : '')
  const vars = {
    '--c': paper.color,
    '--on': paper.ink,
    '--stub': tail.color,
    '--stub-ink': tail.ink,
    '--rot': rotate === undefined ? undefined : `${rotate}deg`,
    ...style,
  } as CSSProperties
  return (
    <a
      className={cx('pm-ticket', className)}
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : null)}
      aria-label={name}
      data-cursor={cursor}
      style={vars}
      {...rest}
    >
      <span className="pm-ticket__main">
        <span className="pm-ticket__kicker">{kicker}</span>
        <span className="pm-ticket__label">{label}</span>
      </span>
      <span className="pm-ticket__stub" aria-hidden="true">
        <svg className="pm-ticket__arrow" viewBox="0 0 48 32" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" focusable="false">
          <path d="M5 17.5C15 15.5 26 18.5 38.5 15.5" pathLength={1} />
          <path d="M31.5 6.5C34.5 10.5 38.5 13.5 43.5 15.5C38.5 18.5 34.5 22.5 31.5 27.5" pathLength={1} />
        </svg>
      </span>
    </a>
  )
}
