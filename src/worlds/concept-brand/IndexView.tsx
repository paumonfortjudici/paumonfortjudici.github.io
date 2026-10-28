// INDEX VIEW: every piece of the board (wordmark, cast, pattern, 20 mockups, 3 posters) as a normal scrolling page of big
// brand-coloured tiles, each with a caption and alt text. A tile opens its details right under it, the same words as the panel.
// This is the default on phones and a toggle everywhere, so keyboard, screen-reader and touch visitors never need the pan / zoom.
import { useEffect, useRef } from 'react'
import { TabButton, WorldFacts } from '../../components/primitives'
import type { WorkMeta } from '../../lib/works'
import { Bar } from './atoms'
import { GROUPS, ITEMS, UI_TEXT } from './copy'
import { PanelBody } from './panels'
import { COLOUR, GROUP_HOTS, GROUP_LABEL, HOT, IMG, LOGOS, NONE, isMascotId, logoThumb, type ColourwayId, type GroupId, type Selection } from './data'

interface IndexProps {
  work: WorkMeta
  sel: Selection
  onSelect: (sel: Selection) => void
  colourway: ColourwayId
  onColourway: (id: ColourwayId) => void
  onBoard: () => void
  onKit: () => void
  still: boolean
}

type Key = string

const selFor = (key: Key): Selection => {
  if (key === 'wordmark') return { group: 'wordmark', item: 'wordmark' }
  if (key === 'cast') return { group: 'cast', item: null }
  if (key === 'pattern') return { group: 'pattern', item: null }
  return { group: HOT[key].group, item: key }
}

const keyOf = (sel: Selection): Key | null => {
  if (!sel.group) return null
  if (sel.group === 'cast' || isMascotId(sel.item)) return 'cast'
  if (sel.group === 'pattern') return 'pattern'
  return sel.item ?? null
}

interface Tile {
  key: Key
  code: string
  title: string
  note: string
  src: string
  w: number
  h: number
  alt: string
  bg?: string
  wide?: boolean
  contain?: boolean
}

const IDENTITY: Tile[] = [
  {
    key: 'wordmark',
    code: 'Logo',
    title: 'Wordmark',
    note: 'Tube lettering with an olive for the o',
    src: logoThumb(LOGOS[0]),
    w: 900,
    h: 335,
    alt: HOT.wordmark.alt,
    bg: COLOUR.rosat.hex,
    contain: true,
  },
  {
    key: 'cast',
    code: 'Cast',
    title: 'The four characters',
    note: 'Gotet, Oliva, Sifó and Xip',
    src: IMG.castSmall,
    w: 1400,
    h: 513,
    alt: 'The four characters standing in a row: Gotet the red glass, Oliva the green olive in a red cap, Sifó the blue soda siphon and Xip the yellow crisp.',
    bg: COLOUR.rosat.hex,
    contain: true,
  },
  {
    key: 'pattern',
    code: 'Pattern',
    title: 'The twelve icons',
    note: 'The menu as wallpaper',
    src: IMG.patternSheetSmall,
    w: 1200,
    h: 900,
    alt: 'A sheet of the twelve pattern icons in blue line on pink: olive, glass, crisp, siphon, citrus wheel, bubbles, crown cap, ice cubes, banderilla, sparkle, sun and olive tin.',
    bg: COLOUR.rosat.hex,
    contain: true,
  },
]

const tileOf = (id: string): Tile => {
  const h = HOT[id]
  return {
    key: id,
    code: h.code,
    title: h.title,
    note: ITEMS[id].real ?? h.short,
    src: h.detail!.src,
    w: h.detail!.w,
    h: h.detail!.h,
    alt: h.alt,
    wide: h.rect.w > 600,
  }
}

const SECTIONS: { id: string; label: string; tiles: Tile[] }[] = [
  { id: 'identity', label: 'The identity', tiles: IDENTITY },
  ...(['shopfront', 'takeaway', 'print', 'bottle', 'wearables', 'posters'] as GroupId[]).map((g) => ({
    id: g,
    label: GROUP_LABEL[g],
    tiles: GROUP_HOTS[g].map(tileOf),
  })),
]

export default function IndexView({ work, sel, onSelect, colourway, onColourway, onBoard, onKit, still }: IndexProps) {
  const open = keyOf(sel)
  const detailRef = useRef<HTMLLIElement>(null)
  // bring the freshly opened details into view
  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => detailRef.current?.scrollIntoView({ block: 'nearest', behavior: still ? 'auto' : 'smooth' }), 40)
    return () => window.clearTimeout(t)
  }, [open, still])

  return (
    <div className="w-concept-brand-index" data-view="index">
      <header className="w-concept-brand-index-head">
        <p className="w-concept-brand-kicker">Concept project · Index</p>
        <h2 className="w-concept-brand-index-title">
          Everything on the board, <em>as a page.</em>
        </h2>
        <p className="w-concept-brand-index-lede">
          Gotet is a vermuteria in Cardedeu that does not exist. Tap a tile to read what the rule was and why. No panning or zooming needed.
        </p>
        <div className="w-concept-brand-index-actions">
          <TabButton color="var(--cb-mantega)" ink="var(--cb-tinta)" onClick={onBoard} cursor="Open">
            {UI_TEXT.board}
          </TabButton>
          <TabButton color="var(--cb-rosat)" ink="var(--cb-tinta)" onClick={onKit}>
            {UI_TEXT.kit}
          </TabButton>
        </div>
      </header>
      {SECTIONS.map((section) => (
        <section key={section.id} className="w-concept-brand-index-section" aria-labelledby={`w-concept-brand-idx-${section.id}`}>
          <Bar id={`w-concept-brand-idx-${section.id}`}>{section.label}</Bar>
          {section.id !== 'identity' && <p className="w-concept-brand-index-sub">{GROUPS[section.id as GroupId].sub}</p>}
          <ul className="w-concept-brand-grid" data-kind={section.id}>
            {section.tiles.flatMap((tile) => {
              const isOpen = open === tile.key
              const cell = (
                <li key={tile.key} className="w-concept-brand-tile" data-wide={tile.wide ? 'true' : undefined} data-open={isOpen ? 'true' : undefined}>
                  <button
                    type="button"
                    className="w-concept-brand-tile-btn"
                    aria-expanded={isOpen}
                    aria-controls={`w-concept-brand-detail-${tile.key}`}
                    onClick={() => onSelect(isOpen ? NONE : selFor(tile.key))}
                    data-cursor="Open"
                  >
                    <span className="w-concept-brand-tile-art" style={tile.bg ? { background: tile.bg } : undefined} data-contain={tile.contain ? 'true' : undefined}>
                      <img src={tile.src} width={tile.w} height={tile.h} alt={tile.alt} loading="lazy" decoding="async" style={{ aspectRatio: `${tile.w} / ${tile.h}` }} />
                    </span>
                    <span className="w-concept-brand-tile-cap">
                      <span className="w-concept-brand-tile-code">{tile.code}</span>
                      <span className="w-concept-brand-tile-title">{tile.title}</span>
                      <span className="w-concept-brand-tile-note">{tile.note}</span>
                    </span>
                  </button>
                </li>
              )
              if (!isOpen) return [cell]
              return [
                cell,
                <li key={`${tile.key}-detail`} id={`w-concept-brand-detail-${tile.key}`} className="w-concept-brand-tile-detail" ref={detailRef}>
                  <div className="w-concept-brand-card w-concept-brand-card--inline">
                    <PanelBody sel={sel} onSelect={onSelect} colourway={colourway} onColourway={onColourway} onTour={onBoard} onKit={onKit} hideActions />
                    <div className="w-concept-brand-actions">
                      <TabButton size="sm" color="var(--cb-blau)" ink="var(--cb-rosat)" onClick={onBoard} cursor="Open">
                        {UI_TEXT.showOnBoard}
                      </TabButton>
                    </div>
                  </div>
                </li>,
              ]
            })}
          </ul>
        </section>
      ))}
      <div className="w-concept-brand-index-foot">
        <WorldFacts work={work} tone="ink" />
      </div>
    </div>
  )
}
