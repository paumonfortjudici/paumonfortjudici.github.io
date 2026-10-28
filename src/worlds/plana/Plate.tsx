// The chrome every plate shares: a numbered header (big numeral, title, a rule, a one-line hint), the plate itself (children, each
// plate draws its own frame) and a printed caption underneath, like the plates of an atlas.
import type { ReactNode } from 'react'
import { cx } from '../../components/primitives'
import { plateId, type PlateInfo } from './data'

export interface PlateProps {
  info: PlateInfo
  caption: ReactNode
  className?: string
  /** a short line right of the title (replaces the default hint) */
  hint?: ReactNode
  children: ReactNode
}

export function Plate({ info, caption, className, hint, children }: PlateProps) {
  const id = plateId(info.id)
  const titleId = `${id}-title`
  return (
    <section id={id} className={cx('w-plana-plate', `w-plana-plate--${info.id}`, className)} aria-labelledby={titleId} tabIndex={-1}>
      <header className="w-plana-plate__head">
        <span className="w-plana-plate__no" aria-hidden="true">
          {info.n}
        </span>
        <h3 id={titleId} className="w-plana-plate__title">
          <span className="pm-sr">Plate {info.n}: </span>
          {info.title}
        </h3>
        <span className="w-plana-plate__rule" aria-hidden="true" />
        <span className="w-plana-plate__hint">{hint ?? info.hint}</span>
      </header>
      {children}
      <p className="w-plana-plate__caption">{caption}</p>
    </section>
  )
}
