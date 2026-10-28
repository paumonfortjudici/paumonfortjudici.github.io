// <Reveal> - wraps content that should arrive when it scrolls into view. One shared IntersectionObserver sets data-in="true"
// once; the hidden state exists only under html.js, and reduced motion / "Pause motion" show everything at once.
// Props: as (element, default 'div'), kind ('rise' default | 'fade' | 'pop' | 'drop' | 'left' | 'right'), delay (ms, for
// staggering: 60-90ms steps), rootMargin / threshold (default: well inside the viewport), plus any HTML attribute.
// Exposes --rv-delay.

import { createElement, useRef, type CSSProperties, type ElementType, type HTMLAttributes, type ReactNode } from 'react'
import { useRevealOnce, type ObserveOptions } from './hooks'
import { cx } from './util'

export interface RevealProps extends HTMLAttributes<HTMLElement>, ObserveOptions {
  as?: ElementType
  kind?: 'rise' | 'fade' | 'pop' | 'drop' | 'left' | 'right'
  delay?: number
  children?: ReactNode
}

export function Reveal({ as: Tag = 'div', kind = 'rise', delay = 0, rootMargin, threshold, className, style, children, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  useRevealOnce(ref, { rootMargin, threshold })
  return createElement(
    Tag,
    {
      ...rest,
      ref,
      className: cx('pm-rv', className),
      style: delay ? ({ '--rv-delay': `${delay}ms`, ...style } as CSSProperties) : style,
      'data-kind': kind,
    },
    children,
  )
}
