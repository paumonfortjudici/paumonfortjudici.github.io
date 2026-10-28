// The hotspot chips: menu-card tabs in the brand colours (paper with a Tinta line and a hard shadow) with the number of pieces on the
// end like the count chips of the cabinet's own tabs. The chosen one turns into a chalkboard tab: Tinta with Mantega chalk.
// Real buttons with aria-pressed; clicking the chosen chip again lets go.
import { forwardRef } from 'react'
import { GROUP_HOTS, GROUP_LABEL, GROUP_ORDER, GROUP_PAPER, MASCOTS, PATTERN_ICONS, type GroupId } from './data'
import { UI_TEXT } from './copy'

interface ChipsProps {
  group: GroupId | null
  onGroup: (group: GroupId) => void
}

/** how many pieces each chip opens: the wordmark, the four characters, the twelve pattern icons, then the mockups and posters of the group */
const COUNT: Record<GroupId, number> = {
  wordmark: 1,
  cast: MASCOTS.length,
  pattern: PATTERN_ICONS.length,
  shopfront: GROUP_HOTS.shopfront.length,
  takeaway: GROUP_HOTS.takeaway.length,
  print: GROUP_HOTS.print.length,
  bottle: GROUP_HOTS.bottle.length,
  wearables: GROUP_HOTS.wearables.length,
  posters: GROUP_HOTS.posters.length,
}

const Chips = forwardRef<HTMLDivElement, ChipsProps>(function Chips({ group, onGroup }, ref) {
  return (
    <div className="w-concept-brand-chips" ref={ref} role="group" aria-label={UI_TEXT.chipsLabel}>
      {GROUP_ORDER.map((g) => (
        <button
          key={g}
          type="button"
          className="w-concept-brand-chip"
          data-paper={GROUP_PAPER[g]}
          aria-pressed={group === g}
          onClick={() => onGroup(g)}
          data-cursor="Open"
        >
          <span>{GROUP_LABEL[g]}</span>
          <span className="w-concept-brand-chip-n" aria-hidden="true">
            {String(COUNT[g]).padStart(2, '0')}
          </span>
        </button>
      ))}
    </div>
  )
})

export default Chips
