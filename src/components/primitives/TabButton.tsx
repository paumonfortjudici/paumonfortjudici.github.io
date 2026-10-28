// <TabButton> - the site's button: a small folder tab (label font, ink on colour) instead of a pill.
// Props: tone ('tomato' | 'pine' | ... or {color, ink}) or color + ink, size 'sm'|'md'|'lg', href (renders <a>; external adds
// target/rel + a hidden "opens in a new tab"), icon ('arrow-right' | 'arrow-left' | 'arrow-up-right' | 'arrow-down' | 'cross' |
// node), iconPosition, count (TabChip), selected (pulled up, for tablists), fused (sits on a bar of its own colour),
// shoulders (concave corners, default true), cursor (data-cursor label), disabled.
// Press = translateY(2px) and the paper edge collapses 3px -> 1px. Exposes --c --on --edge --fr --th.

import { createElement, forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { TabChip } from './Folder'
import { ArrowIcon, CrossIcon, type ArrowDir } from './icons'
import { cx, resolveTone, type ToneColors, type ToneName } from './util'

export type TabIcon = 'arrow-right' | 'arrow-left' | 'arrow-up-right' | 'arrow-down' | 'cross' | 'none'

export interface TabButtonProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  tone?: ToneName | ToneColors
  color?: string
  ink?: string
  size?: 'sm' | 'md' | 'lg'
  href?: string
  target?: string
  rel?: string
  /** opens in a new tab: adds target="_blank", rel="noopener noreferrer" and a visually hidden hint */
  external?: boolean
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  icon?: TabIcon | ReactNode
  iconPosition?: 'before' | 'after'
  count?: number | string
  selected?: boolean
  fused?: boolean
  shoulders?: boolean
  /** value of data-cursor (the custom cursor shows it): Open | Flip | Drag | Play | Visit | Copy | Close. External links default to Visit. */
  cursor?: string
  children?: ReactNode
}

const ARROWS: Record<string, ArrowDir> = {
  'arrow-right': 'right',
  'arrow-left': 'left',
  'arrow-up-right': 'up-right',
  'arrow-down': 'down',
}

function renderIcon(icon: TabButtonProps['icon']): ReactNode {
  if (icon === undefined || icon === null || icon === false || icon === 'none') return null
  if (typeof icon === 'string' && icon in ARROWS) return <ArrowIcon dir={ARROWS[icon]} className="pm-tabbtn__icon" />
  if (icon === 'cross') return <CrossIcon className="pm-tabbtn__icon" />
  return <span className="pm-tabbtn__icon">{icon}</span>
}

export const TabButton = forwardRef<HTMLElement, TabButtonProps>(function TabButton(props, ref) {
  const {
    tone,
    color,
    ink,
    size = 'md',
    href,
    target,
    rel,
    external,
    type,
    disabled,
    icon,
    iconPosition = 'after',
    count,
    selected,
    fused,
    shoulders = true,
    cursor,
    className,
    style,
    children,
    ...rest
  } = props

  const palette = resolveTone(tone, 'ink')
  const vars = { '--c': color ?? palette.color, '--on': ink ?? palette.ink } as CSSProperties
  const Tag = href ? 'a' : 'button'
  const iconNode = renderIcon(icon)
  const linkProps = href
    ? { href, target: external ? '_blank' : target, rel: external ? 'noopener noreferrer' : rel }
    : { type: type ?? 'button', disabled }
  // a disabled link must not navigate and must leave the tab order
  const blocked = href && disabled ? { tabIndex: -1, onClick: (e: { preventDefault: () => void }) => e.preventDefault() } : null

  return createElement(
    Tag,
    {
      ...linkProps,
      ...rest,
      ...blocked,
      ref,
      className: cx('pm-tabbtn', className),
      style: { ...vars, ...style },
      'data-size': size,
      'data-selected': selected ? 'true' : undefined,
      'data-fused': fused ? 'true' : undefined,
      'data-shoulders': shoulders ? undefined : 'false',
      'data-cursor': cursor ?? (external ? 'Visit' : undefined),
      'aria-disabled': href && disabled ? true : undefined,
    },
    iconPosition === 'before' && iconNode,
    <span className="pm-tabbtn__label">{children}</span>,
    count != null && <TabChip>{typeof count === 'number' ? String(count).padStart(2, '0') : count}</TabChip>,
    iconPosition === 'after' && iconNode,
    external && <span className="pm-sr"> (opens in a new tab)</span>,
  )
})
