// <Sticker> - a die-cut sticker: a smooth white paper rim grown around the art's own outline (shared SVG filter: dilate +
// blur + threshold), a drop shadow, a tilt. Give it an image or any content (text stickers).
// Props: src + alt + width + height (explicit size: no layout shift), halo (1 thin | 2 | 3 thick; default 2), rotate (deg),
// lifted (bigger shadow, for the drag state), as, children (instead of src). Exposes --rot, --pm-sticker-shadow.

import type { CSSProperties, ElementType, ReactNode } from 'react'
import './defs'
import { cx } from './util'

export interface StickerProps {
  src?: string
  alt?: string
  width?: number
  height?: number
  halo?: 1 | 2 | 3
  rotate?: number
  lifted?: boolean
  as?: ElementType
  className?: string
  style?: CSSProperties
  children?: ReactNode
  loading?: 'lazy' | 'eager'
}

export function Sticker({ src, alt = '', width, height, halo = 2, rotate, lifted, as: Tag = 'span', className, style, children, loading = 'lazy' }: StickerProps) {
  const vars = { '--rot': rotate === undefined ? undefined : `${rotate}deg`, ...style } as CSSProperties
  return (
    <Tag className={cx('pm-sticker', className)} style={vars} data-halo={halo} data-lifted={lifted ? '' : undefined}>
      {src ? <img className="pm-sticker__img" src={src} alt={alt} width={width} height={height} loading={loading} decoding="async" draggable={false} /> : children}
    </Tag>
  )
}
