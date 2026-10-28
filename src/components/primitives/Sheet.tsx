// <Sheet> - a paper sheet lying on the desk: one per page of the cabinet. Sets the surface variables for everything inside
// (--sheet --on-sheet --muted-on-sheet --accent --accent-ink; contrast measured, see docs/api/primitives.md), draws the
// grain, the paper edge and the '+' crop marks, and (unless meta={false}) the <SheetMeta> bar on top.
// Props: id (anchor, e.g. 'catalog'), tone 'cream'|'ink'|'marigold'|'ultraviolet'|'tomato', page ('Catalog'), n (2),
// total (6), accent (a tone name or {color, ink}; default rotates by page), years, meta, marks, as.
// <SheetMeta page n total accent years /> can also be used on its own.

import { createElement, forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { NAV_TOTAL, SHEET_META } from '../../lib/copy'
import type { Category } from '../../lib/works'
import { cx, isStill, resolveTone, type ToneColors, type ToneName } from './util'

export type SheetTone = 'cream' | 'ink' | 'marigold' | 'ultraviolet' | 'tomato'

export interface SheetProps extends Omit<HTMLAttributes<HTMLElement>, 'id'> {
  id: string
  tone?: SheetTone
  page: string
  n: number
  total?: number
  accent?: ToneName | ToneColors
  years?: string
  meta?: boolean
  marks?: boolean
  as?: 'section' | 'div' | 'article'
  children?: ReactNode
}

/** the accent of the meta bar and chips when none is given: rotates through the folder colours and always contrasts with the sheet */
export function defaultAccent(tone: SheetTone, n: number): ToneName {
  switch (tone) {
    case 'ink':
      return 'marigold'
    case 'marigold':
      return 'oxblood'
    case 'ultraviolet':
      return 'bubblegum'
    case 'tomato':
      return 'pine'
    default:
      return n <= 1 ? 'tomato' : 'lagoon'
  }
}

/** The three category labels are real buttons: they tell the Works section which filter to show and scroll there. */
export const FILTER_EVENT = 'pm:filter'
export function requestFilter(category: Category): void {
  window.dispatchEvent(new CustomEvent<Category>(FILTER_EVENT, { detail: category }))
  requestAnimationFrame(() => {
    document.getElementById('works')?.scrollIntoView({ behavior: isStill() ? 'auto' : 'smooth', block: 'start' })
  })
}

const pad2 = (n: number) => String(n).padStart(2, '0')

export interface SheetMetaProps extends HTMLAttributes<HTMLDivElement> {
  page: string
  n: number
  total?: number
  years?: string
  accent?: ToneName | ToneColors
  tone?: SheetTone
}

export function SheetMeta({ page, n, total = NAV_TOTAL, years = SHEET_META.years, accent, tone = 'cream', className, style, ...rest }: SheetMetaProps) {
  const a = resolveTone(accent ?? defaultAccent(tone, n))
  const vars = { '--accent': a.color, '--accent-ink': a.ink, ...style } as CSSProperties
  return (
    <div className={cx('pm-meta', className)} style={vars} {...rest}>
      <span className="pm-meta__years">{years}</span>
      {SHEET_META.categories.map(({ label, category }) => (
        <button key={category} type="button" className="pm-meta__cat" data-cursor="Open" title={`See ${label.toLowerCase()} work`} onClick={() => requestFilter(category)}>
          {label}
        </button>
      ))}
      <span className="pm-meta__page">
        {page}
      </span>
      <span className="pm-meta__count">
        {pad2(n)} / {pad2(total)}
      </span>
    </div>
  )
}

export const Sheet = forwardRef<HTMLElement, SheetProps>(function Sheet(props, ref) {
  const { id, tone = 'cream', page, n, total = NAV_TOTAL, accent, years, meta = true, marks = true, as = 'section', className, style, children, ...rest } = props
  const a = resolveTone(accent ?? defaultAccent(tone, n))
  const vars = { '--accent': a.color, '--accent-ink': a.ink, ...style } as CSSProperties
  return createElement(
    as,
    {
      ref,
      id,
      className: cx('pm-sheet', className),
      style: vars,
      'data-tone': tone,
      'data-meta': meta ? undefined : 'false',
      'aria-label': rest['aria-labelledby'] ? undefined : page,
      ...rest,
    },
    meta && <SheetMeta page={page} n={n} total={total} years={years} accent={accent} tone={tone} />,
    marks && (
      <>
        <span className="pm-plus pm-plus--tl" aria-hidden="true" />
        <span className="pm-plus pm-plus--tr" aria-hidden="true" />
        <span className="pm-plus pm-plus--bl" aria-hidden="true" />
        <span className="pm-plus pm-plus--br" aria-hidden="true" />
      </>
    ),
    children,
  )
})
