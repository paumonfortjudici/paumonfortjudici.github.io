// <Stamp> - a rubber stamp: letterpress edge (SVG filter), ink that soaks in (multiply), a thump-in when scrolled into view.
// Props: text, sub, ring (ring text -> round stamp), shape ('rect'|'round'|'plain'), tone / color (default tomato), rotate (-8),
// size (CSS length: the em of rect stamps, the width of round ones, >= 10rem), rough (1-3), thump (true), spin (turning badge,
// ambient), blend ('multiply' | 'normal' on dark surfaces), decorative (aria-hidden). Exposes --rot --size.

import { useId, useRef, type CSSProperties, type ReactNode } from 'react'
import './defs'
import { useRevealOnce } from './hooks'
import { cx, TONES, type ToneName } from './util'

export interface StampProps {
  text: string
  sub?: string
  ring?: string
  shape?: 'rect' | 'round' | 'plain'
  tone?: ToneName
  color?: string
  rotate?: number
  size?: number | string
  rough?: 1 | 2 | 3
  thump?: boolean
  spin?: boolean
  blend?: 'multiply' | 'normal'
  decorative?: boolean
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

const px = (v: number | string): string => (typeof v === 'number' ? `${v}px` : v)

/** an 8-spoke asterisk, hand-cut, for the centre of spinning badges */
const STAR = 'M100 78 L103 94 L117 84 L109 98 L124 100 L109 104 L117 116 L103 108 L100 124 L97 108 L83 116 L91 104 L76 100 L91 98 L83 84 L97 94 Z'

/** the ring text, repeated until it fills the circle at a natural letter-spacing, always ending on a separator */
function ringString(raw: string): string {
  const unit = raw.trim().replace(/[\s·•.]+$/u, '') + ' · '
  const reps = Math.max(1, Math.round(446 / (unit.length * 12.4)))
  return unit.repeat(reps)
}

/** centre text of a round stamp: at most two lines, sized to fit the inner ring */
function coreLines(text: string): { lines: string[]; size: number } {
  const words = text.trim().split(/\s+/)
  const lines = words.length > 1 && text.length > 7 ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')] : [text.trim()]
  const longest = Math.max(...lines.map((l) => l.length))
  return { lines, size: Math.max(16, Math.min(30, 112 / (longest * 0.62))) }
}

export function Stamp({
  text,
  sub,
  ring,
  shape,
  tone,
  color,
  rotate = -8,
  size,
  rough = 2,
  thump = true,
  spin = false,
  blend = 'multiply',
  decorative = false,
  className,
  style,
}: StampProps) {
  const kind = shape ?? (ring ? 'round' : 'rect')
  const ref = useRef<HTMLSpanElement | null>(null)
  useRevealOnce(ref, { disabled: !thump, threshold: 0.35 })
  const ink = color ?? (tone ? TONES[tone].color : 'var(--tomato)')
  // what a reader should get: a spinning badge only shows its ring text (the centre is an asterisk)
  const label = (spin && ring ? [ring] : [text, sub, ring]).filter(Boolean).join(' · ').replace(/\s*·\s*$/, '')
  const rootStyle = {
    '--rot': `${rotate}deg`,
    '--size': size === undefined ? undefined : px(size),
    color: ink,
    ...style,
  } as CSSProperties
  const uid = `pmr${useId().replace(/[^a-zA-Z0-9]/g, '')}`

  return (
    <span
      ref={ref}
      className={cx('pm-stamp', `pm-stamp--${kind}`, className)}
      style={rootStyle}
      data-rough={rough}
      data-thump={thump ? '' : undefined}
      data-blend={blend}
      {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': label })}
    >
      <span className={cx('pm-stamp__turn', spin && 'pm-ambient')} data-spin={spin ? '' : undefined}>
        <span className="pm-stamp__ink">
          {kind === 'round' ? (
            <svg className="pm-stamp__svg" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
              <circle cx="100" cy="100" r="93" fill="none" stroke="currentColor" strokeWidth="6" />
              <circle cx="100" cy="100" r="66" fill="none" stroke="currentColor" strokeWidth="2.6" />
              <defs>
                <path id={uid} d="M28 100a72 72 0 1 1 144 0a72 72 0 1 1 -144 0" />
              </defs>
              <text className="pm-stamp__ring" fill="currentColor">
                <textPath href={`#${uid}`} startOffset="0" textLength="446" lengthAdjust="spacing">
                  {ringString(ring ?? text)}
                </textPath>
              </text>
              {spin ? (
                <path d={STAR} fill="currentColor" transform="translate(100 100) scale(1.25) translate(-100 -100)" />
              ) : (
                <Core text={text} sub={sub} />
              )}
            </svg>
          ) : (
            <span className="pm-stamp__frame">
              <span className="pm-stamp__text">{text}</span>
              {sub && <span className="pm-stamp__sub">{sub}</span>}
            </span>
          )}
        </span>
      </span>
    </span>
  )
}

function Core({ text, sub }: { text: string; sub?: string }) {
  const { lines, size } = coreLines(text)
  const subSize = 17
  const block = lines.length * size * 0.98 + (sub ? subSize + 6 : 0)
  let y = 100 - block / 2 + size * 0.78
  return (
    <>
      {lines.map((line) => {
        const at = y
        y += size * 0.98
        const wide = line.length * size * 0.62 > 112
        return (
          <text key={line} className="pm-stamp__core" x="100" y={at} textAnchor="middle" fill="currentColor" style={{ fontSize: size }} {...(wide ? { textLength: 112, lengthAdjust: 'spacingAndGlyphs' as const } : null)}>
            {line}
          </text>
        )
      })}
      {sub && (
        <text className="pm-stamp__subtext" x="100" y={y + 6} textAnchor="middle" fill="currentColor">
          {sub}
        </text>
      )}
    </>
  )
}
