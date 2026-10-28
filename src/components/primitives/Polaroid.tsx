// <Polaroid> - a print with a white border and a hand-written caption, taped to the wall, tilted.
// Props: src + alt + width + height (the photo's real size: sets the aspect, no layout shift) or children (any content in the
// photo area), caption (hand font), rotate (deg), tape (true | TapeProps | false; default a butter strip at the top),
// as (default 'figure'), loading. Exposes --rot --w (width, default 15rem) --paper.

import type { CSSProperties, ReactNode } from 'react'
import { Tape, type TapeProps } from './Tape'
import { cx } from './util'

export interface PolaroidProps {
  src?: string
  alt?: string
  width?: number
  height?: number
  caption?: ReactNode
  rotate?: number
  tape?: boolean | TapeProps
  w?: number | string
  className?: string
  style?: CSSProperties
  children?: ReactNode
  loading?: 'lazy' | 'eager'
}

export function Polaroid({ src, alt = '', width, height, caption, rotate, tape = true, w, className, style, children, loading = 'lazy' }: PolaroidProps) {
  const vars = {
    '--rot': rotate === undefined ? undefined : `${rotate}deg`,
    '--w': w === undefined ? undefined : typeof w === 'number' ? `${w}px` : w,
    ...style,
  } as CSSProperties
  const tapeProps: TapeProps = typeof tape === 'object' ? tape : {}
  return (
    <figure className={cx('pm-polaroid', className)} style={vars}>
      {tape !== false && <Tape at="top" color="butter" {...tapeProps} />}
      <div className="pm-polaroid__photo" style={width && height ? ({ aspectRatio: `${width} / ${height}` } as CSSProperties) : undefined}>
        {src ? <img src={src} alt={alt} width={width} height={height} loading={loading} decoding="async" draggable={false} /> : children}
      </div>
      {caption != null && <figcaption className="pm-polaroid__cap t-hand">{caption}</figcaption>}
    </figure>
  )
}
