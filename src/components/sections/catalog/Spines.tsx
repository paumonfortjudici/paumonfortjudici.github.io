// The drawer index: ten colour spines standing on the shelf's rule, one per folder, so every colour of the cabinet is on screen the moment the
// sheet arrives (the open band below is tall; the other nine are further down). A spine is a pointer-and-keyboard shortcut: it opens its
// folder's band and brings it into view. It is a roving group (one tab stop, Left / Right / Home / End move along it), so it adds one stop
// to the page, not ten. The open band's spine is lifted; spines of folders that do not match the search go dark (their number turns cream).
import { useState, type CSSProperties, type KeyboardEvent } from 'react'
import { pad2 } from '@/lib/copy'
import { WORKS } from '@/lib/works'
import { CAT_UI } from './strings'

interface SpinesProps {
  /** slugs of the folders that match the search (ignored while nothing filters) */
  lit: ReadonlySet<string>
  active: boolean
  open: string | null
  onPick: (slug: string) => void
}

export function Spines({ lit, active, open, onPick }: SpinesProps) {
  const [rove, setRove] = useState(0)

  const onKeyDown = (event: KeyboardEvent<HTMLUListElement>): void => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 }
    let to = -1
    if (event.key in keys) to = Math.min(WORKS.length - 1, Math.max(0, rove + keys[event.key]))
    else if (event.key === 'Home') to = 0
    else if (event.key === 'End') to = WORKS.length - 1
    else return
    event.preventDefault()
    setRove(to)
    event.currentTarget.querySelectorAll<HTMLButtonElement>('button')[to]?.focus()
  }

  return (
    <nav className="pm-cat-spines" aria-label={CAT_UI.spinesLabel}>
      <ul className="pm-cat-spines__row" onKeyDown={onKeyDown}>
        {WORKS.map((work, i) => {
          const thin = active && !lit.has(work.slug)
          return (
            <li key={work.slug}>
              <button
                type="button"
                className="pm-cat-spine"
                style={{ '--c': work.color, '--on': work.ink } as CSSProperties}
                data-open={open === work.slug ? '' : undefined}
                data-thin={thin ? '' : undefined}
                data-title={work.title}
                tabIndex={i === rove ? 0 : -1}
                aria-current={open === work.slug ? 'true' : undefined}
                aria-label={CAT_UI.spineLabel(work.n, work.title)}
                data-cursor="Open"
                onFocus={() => setRove(i)}
                onClick={() => onPick(work.slug)}
              >
                <span aria-hidden="true">{pad2(work.n)}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
