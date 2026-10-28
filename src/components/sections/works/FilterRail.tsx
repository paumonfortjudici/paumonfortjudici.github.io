// The drawer rail above the folders: a brass label holder (a typed card slips in when the filter changes, listing the file
// numbers on show) and the divider tabs. The active tab is taller and fused with the bar under the rail, which takes its colour.
// Semantics: a tablist (roving tabindex, arrows / Home / End, automatic activation) that controls the folder list below.

import { forwardRef, useEffect, useRef, type CSSProperties, type KeyboardEvent } from 'react'
import { TabButton, isStill } from '@/components/primitives'
import { WORKS_SECTION } from '@/lib/copy'
import { FILTER_TONE, fileNumbers, type FilterId } from './data'
import { WORKS_UI } from './strings'

interface FilterRailProps {
  filter: FilterId
  onChange: (next: FilterId) => void
  /** registry numbers (1..10) of the folders on show */
  numbers: number[]
  panelId: string
}

export const FilterRail = forwardRef<HTMLDivElement, FilterRailProps>(function FilterRail({ filter, onChange, numbers, panelId }, ref) {
  const filters = WORKS_SECTION.filters()
  const tabs = useRef<(HTMLElement | null)[]>([])
  const list = useRef<HTMLDivElement | null>(null)
  const first = useRef(true)
  const tone = FILTER_TONE[filter]
  const name = filters.find((f) => f.id === filter)?.label ?? WORKS_UI.holder.all

  // where the tabs scroll sideways (tablet, phone) the active one is brought to the middle: a filter can also arrive from the sheet's
  // meta bar or the cover. Only the tab row moves, never the page.
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const row = list.current
    const tab = tabs.current[filters.findIndex((f) => f.id === filter)]
    if (!row || !tab || row.scrollWidth <= row.clientWidth + 1) return
    const left = tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2
    row.scrollTo({ left: Math.max(0, left), behavior: isStill() ? 'auto' : 'smooth' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = filters.findIndex((f) => f.id === filter)
    let next = -1
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % filters.length
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + filters.length) % filters.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = filters.length - 1
    if (next < 0) return
    event.preventDefault()
    onChange(filters[next].id)
    tabs.current[next]?.focus()
  }

  return (
    <div ref={ref} className="pm-wk-rail" data-filter={filter} style={{ '--bar': tone.color } as CSSProperties}>
      <div className="pm-wk-holder" aria-hidden="true">
        <span className="pm-wk-holder__screw" data-at="l" />
        <span className="pm-wk-holder__screw" data-at="r" />
        <div className="pm-wk-holder__slot">
          <div key={filter} className="pm-wk-holder__card">
            <span className="pm-wk-holder__name">{filter === 'all' ? WORKS_UI.holder.all : name}</span>
            <span className="pm-wk-holder__files">
              {WORKS_UI.holder.files} {fileNumbers(numbers)}
            </span>
          </div>
        </div>
      </div>

      <div ref={list} className="pm-wk-tabs" role="tablist" aria-label={WORKS_SECTION.filterLabel} onKeyDown={onKeyDown}>
        {filters.map((item, i) => {
          const active = item.id === filter
          const itemTone = FILTER_TONE[item.id]
          return (
            <TabButton
              key={item.id}
              ref={(el) => {
                tabs.current[i] = el
              }}
              role="tab"
              id={`pm-wk-tab-${item.id}`}
              aria-selected={active}
              aria-controls={panelId}
              tabIndex={active ? 0 : -1}
              color={itemTone.color}
              ink={itemTone.ink}
              fused={active}
              count={item.count}
              className="pm-wk-tab"
              data-tone={item.id}
              onClick={() => onChange(item.id)}
            >
              {item.label}
            </TabButton>
          )
        })}
      </div>

      <div className="pm-wk-bar" aria-hidden="true">
        {filters.map((item) => (
          <span key={item.id} className="pm-wk-bar__c" data-on={item.id === filter ? 'true' : undefined} style={{ '--c': FILTER_TONE[item.id].color } as CSSProperties} />
        ))}
      </div>
    </div>
  )
})
