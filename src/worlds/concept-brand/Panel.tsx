// The info panel: a menu card hung on the wall. Docked on the right from 900 px; a bottom sheet below that.
import { useEffect, useRef } from 'react'
import { TabButton, WorldFacts } from '../../components/primitives'
import type { WorkMeta } from '../../lib/works'
import { PanelBody } from './panels'
import { GROUP_LABEL, HOT, LOGOS, isMascotId, logoThumb, type ColourwayId, type Selection } from './data'
import { MASCOT_COPY, UI_TEXT } from './copy'

interface PanelProps {
  work: WorkMeta
  sel: Selection
  onSelect: (sel: Selection) => void
  colourway: ColourwayId
  onColourway: (id: ColourwayId) => void
  onTour: () => void
  onKit: () => void
  mode: 'dock' | 'sheet'
  open: boolean
  onToggle: () => void
  still: boolean
}

/** the line the sheet shows when it is folded down */
function headline(sel: Selection): string {
  if (sel.item) {
    if (isMascotId(sel.item)) return MASCOT_COPY[sel.item].name
    return HOT[sel.item]?.title ?? ''
  }
  return sel.group ? GROUP_LABEL[sel.group] : 'Gotet'
}

export default function Panel({ work, sel, onSelect, colourway, onColourway, onTour, onKit, mode, open, onToggle, still }: PanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  // a new piece starts at the top; picking another character inside the cast keeps the place
  const place = sel.group === 'cast' ? 'cast' : `${sel.group}:${sel.item}`
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: still ? 'auto' : 'smooth' })
  }, [place, still])
  const sheet = mode === 'sheet'
  const title = headline(sel)
  const hasSel = sel.group !== null
  return (
    <aside className="w-concept-brand-panel" data-mode={mode} data-open={open ? 'true' : 'false'} aria-label="About this piece">
      <div className="w-concept-brand-card">
        {sheet ? (
          <div className="w-concept-brand-card-top">
            <button type="button" className="w-concept-brand-handle" onClick={onToggle} aria-expanded={open} aria-controls="w-concept-brand-scroll">
              <span className="w-concept-brand-handle-bar" aria-hidden="true" />
              <span className="w-concept-brand-handle-title">{open ? '' : title}</span>
              <span className="w-concept-brand-handle-hint">{open ? 'Fold down' : UI_TEXT.details}</span>
            </button>
          </div>
        ) : hasSel ? (
          <div className="w-concept-brand-card-top">
            <img className="w-concept-brand-mini" src={logoThumb(LOGOS[0])} width={900} height={335} alt="gotet" decoding="async" />
            <TabButton size="sm" color="var(--cb-blau)" ink="var(--cb-rosat)" onClick={() => onSelect({ group: null, item: null })}>
              {UI_TEXT.allBoard}
            </TabButton>
          </div>
        ) : (
          <div className="w-concept-brand-card-top" data-empty="true" />
        )}
        <div className="w-concept-brand-scroll" id="w-concept-brand-scroll" ref={scrollRef} tabIndex={0} role="region" aria-label="Details, scrollable">
          <PanelBody sel={sel} onSelect={onSelect} colourway={colourway} onColourway={onColourway} onTour={onTour} onKit={onKit} />
          <div className="w-concept-brand-foot">
            <WorldFacts work={work} tone="ink" />
          </div>
        </div>
      </div>
    </aside>
  )
}

