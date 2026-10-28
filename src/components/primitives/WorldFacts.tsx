// <WorldFacts work={work}> - the facts slate that ends every world: SlateLabel (Role / Year / Tools; empty cells hidden),
// a Ticket stub per external link, and, for concept work, the CONCEPT stamp with the exact CONCEPT_LINE.
// Props: work (a WorkMeta from src/lib/works.ts), tone (slate 'ink' | 'paper'), children (extra notes: credits, captions).
// Nothing here is invented: every cell comes from the registry.

import type { HTMLAttributes, ReactNode } from 'react'
import { CONCEPT_LINE, type WorkMeta } from '../../lib/works'
import { Stamp } from './Stamp'
import { SlateLabel } from './Slate'
import { Ticket } from './Ticket'
import { cx } from './util'

export interface WorldFactsProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  work: WorkMeta
  tone?: 'ink' | 'paper'
  children?: ReactNode
}

export function WorldFacts({ work, tone = 'ink', className, children, ...rest }: WorldFactsProps) {
  const links = work.links ?? []
  const darkFolder = work.ink.toLowerCase() === '#fff2da'
  return (
    <section className={cx('pm-wf', className)} aria-label={`${work.title}: project facts`} {...rest}>
      <SlateLabel
        className="pm-wf__slate"
        tone={tone}
        items={[
          { label: 'Role', value: work.roles.length ? work.roles.map((r) => <span className="pm-slate__line" key={r}>{r}</span>) : '' },
          { label: 'Year', value: work.years },
          { label: 'Tools', value: work.tools.join(', ') },
        ]}
      />
      {links.length > 0 && (
        <div className="pm-wf__tix">
          {links.map((link, i) => (
            <Ticket key={link.href} href={link.href} label={link.label} rotate={i % 2 ? 1.2 : -1.6} />
          ))}
        </div>
      )}
      {work.concept && (
        <div className="pm-wf__concept">
          <Stamp text="Concept" rotate={-6} color={work.ink} blend={darkFolder ? 'normal' : 'multiply'} size="1.7rem" />
          <p className="pm-wf__line t-caption">{CONCEPT_LINE}</p>
        </div>
      )}
      {children && <div className="pm-wf__note t-caption">{children}</div>}
    </section>
  )
}
