// The shelf above the stack: the group filters as folder tabs standing on a rule (All / Published work / First steps / Concept), the
// typed "N of 10 folders" count, and a small Clear tab that is only there when something is filtering. Toggle buttons (aria-pressed).
import { CATALOG } from '@/lib/copy'
import { TabButton } from '../../primitives'
import { CAT_UI, type GroupFilter } from './strings'

interface ShelfProps {
  group: GroupFilter
  counts: Record<GroupFilter, number>
  matches: number
  total: number
  active: boolean
  onGroup: (group: GroupFilter) => void
  onClear: () => void
}

const TABS: { id: GroupFilter; label: string }[] = [
  { id: 'all', label: CAT_UI.all },
  ...CATALOG.groups.map((g) => ({ id: g as GroupFilter, label: g })),
]

export function Shelf({ group, counts, matches, total, active, onGroup, onClear }: ShelfProps) {
  return (
    <div className="pm-cat-shelf">
      <div className="pm-cat-shelf__tabs" role="group" aria-label={CAT_UI.filterLabel}>
        {TABS.map(({ id, label }) => {
          const on = group === id
          return (
            <TabButton
              key={id}
              tone={on ? 'marigold' : 'paper'}
              size="md"
              selected={on}
              aria-pressed={on}
              count={counts[id]}
              className="pm-cat-shelf__tab"
              onClick={() => onGroup(on && id !== 'all' ? 'all' : id)}
            >
              {label}
            </TabButton>
          )
        })}
      </div>
      <div className="pm-cat-shelf__end">
        <p className="pm-cat-count t-label" data-empty={matches === 0 ? '' : undefined}>
          {CAT_UI.count(matches, total)}
        </p>
        <TabButton
          tone="tomato"
          size="sm"
          icon="cross"
          iconPosition="before"
          className="pm-cat-clear"
          data-idle={active ? undefined : ''}
          aria-label={CAT_UI.clearLabel}
          tabIndex={active ? 0 : -1}
          aria-hidden={active ? undefined : true}
          cursor="Close"
          onClick={onClear}
        >
          {CAT_UI.clear}
        </TabButton>
      </div>
    </div>
  )
}
