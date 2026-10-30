// The bodies of the info panel (and of the inline details in the index): the overview, a group, one piece, the wordmark, the cast and
// the pattern. Written like a menu card: bars, dotted leaders, paint chips. Pau talks about the rules; the artwork was made with
// AI-assisted tools under his direction (said on the overview and in the facts slate).
import { useState, type CSSProperties, type ReactNode } from 'react'
import { TabButton } from '../../components/primitives'
import { Bar, Leader, Swatches, TypeSamples } from './atoms'
import {
  BAR_LABEL,
  CAST_HEIGHTS,
  CAST_RULES,
  GROUPS,
  ITEMS,
  MASCOT_COPY,
  OVERVIEW,
  PATTERN_FACTS,
  ROW_VAL,
  UI_TEXT,
  WORDMARK_RULES,
} from './copy'
import {
  COLOUR,
  COLOURS,
  COLOURWAYS,
  EXPRESSIONS,
  GROUP_HOTS,
  GROUP_LABEL,
  HOT,
  IMG,
  MASCOT,
  LOGOS,
  MIN_SIZES,
  PATTERN_ICONS,
  headThumb,
  isMascotId,
  logoRatio,
  logoThumb,
  logoThumbSize,
  poseThumb,
  patternFile,
  type ColourwayId,
  type GroupId,
  type MascotId,
  type Selection,
} from './data'

type Pick = (sel: Selection) => void

const Lines = ({ lines }: { lines: string[] }) => (
  <>
    {lines.map((l) => (
      <p className="w-concept-brand-p" key={l}>
        {l}
      </p>
    ))}
  </>
)

const Title = ({ children, sub }: { children: ReactNode; sub?: string }) => (
  <header className="w-concept-brand-head">
    <h2 className="w-concept-brand-title">{children}</h2>
    {sub && <p className="w-concept-brand-sub">{sub}</p>}
  </header>
)

// ---- overview ---------------------------------------------------------------------------------------------------------------------
export function Overview({ onTour, hideActions }: { onTour: () => void; onKit: () => void; hideActions?: boolean }) {
  return (
    <div className="w-concept-brand-body">
      <p className="w-concept-brand-kicker">{OVERVIEW.kicker}</p>
      <h2 className="w-concept-brand-title w-concept-brand-title--logo">
        <span className="w-concept-brand-sr">Gotet</span>
        <img src={logoThumb(LOGOS[0])} width={900} height={335} alt="" decoding="async" />
      </h2>
      <p className="w-concept-brand-sub">{OVERVIEW.sub}</p>
      <Lines lines={OVERVIEW.lines} />
      {!hideActions && (
        <div className="w-concept-brand-actions">
          <TabButton color="var(--cb-mantega)" ink="var(--cb-tinta)" icon="arrow-right" onClick={onTour} cursor="Play">
            {UI_TEXT.tourStart}
          </TabButton>
        </div>
      )}
      <Bar>{BAR_LABEL.pieces}</Bar>
      <Leader rows={OVERVIEW.inventory.map((r) => ({ k: r.what, v: r.n }))} big />
      <Bar>{BAR_LABEL.palette}</Bar>
      <Swatches ids={COLOURS.map((c) => c.id)} />
      <p className="w-concept-brand-tagline">{OVERVIEW.tagline}</p>
      <p className="w-concept-brand-note">{OVERVIEW.hint}</p>
    </div>
  )
}

// ---- a group of pieces ------------------------------------------------------------------------------------------------------------
export function GroupPanel({ group, onSelect }: { group: GroupId; onSelect: Pick }) {
  const copy = GROUPS[group]
  return (
    <div className="w-concept-brand-body">
      <Title sub={copy.sub}>{copy.title}</Title>
      <Lines lines={copy.lines} />
      <Bar>{BAR_LABEL.pieces}</Bar>
      <ul className="w-concept-brand-rows">
        {GROUP_HOTS[group].map((id) => {
          const hot = HOT[id]
          return (
            <li key={id}>
              <button type="button" className="w-concept-brand-row" onClick={() => onSelect({ group, item: id })} data-cursor="Open">
                <span className="w-concept-brand-row-code">{hot.code}</span>
                <span className="w-concept-brand-row-name">{hot.title.replace(/^Poster \d: /, '').replace(/^Social tile \d: /, 'Social: ')}</span>
                <span className="w-concept-brand-row-dots" aria-hidden="true" />
                <span className="w-concept-brand-row-val">{ROW_VAL[id] ?? ITEMS[id].real?.replace('About ', '')}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ---- one piece ----------------------------------------------------------------------------------------------------------------------
export function ItemPanel({ id, onSelect }: { id: string; onSelect: Pick }) {
  const hot = HOT[id]
  const copy = ITEMS[id]
  if (!hot || !copy) return null
  const siblings = GROUP_HOTS[hot.group]
  const at = siblings.indexOf(id)
  const prev = at > 0 ? siblings[at - 1] : null
  const next = at >= 0 && at < siblings.length - 1 ? siblings[at + 1] : null
  const rows = [
    copy.real && { k: 'Real size', v: copy.real },
    copy.board && { k: 'On the board', v: copy.board },
    copy.scale && { k: 'Scale', v: copy.scale },
  ].filter(Boolean) as { k: string; v: string }[]
  return (
    <div className="w-concept-brand-body" data-cols="2">
      <nav className="w-concept-brand-crumb" aria-label="Where you are">
        <button type="button" onClick={() => onSelect({ group: hot.group, item: null })} data-cursor="Open">
          {GROUP_LABEL[hot.group]}
        </button>
        <span aria-hidden="true">/</span>
        <span>{hot.code}</span>
      </nav>
      <Title sub={hot.short}>{hot.title}</Title>
      <section className="w-concept-brand-sec">
        <Bar>{BAR_LABEL.rule}</Bar>
        <Lines lines={copy.lines} />
      </section>
      <section className="w-concept-brand-sec">
        <Bar>{BAR_LABEL.palette}</Bar>
        <Swatches ids={copy.palette} compact />
      </section>
      <section className="w-concept-brand-sec">
        <Bar>{BAR_LABEL.type}</Bar>
        <TypeSamples samples={copy.samples} />
      </section>
      {rows.length > 0 && (
        <section className="w-concept-brand-sec">
          <Bar>{BAR_LABEL.size}</Bar>
          <Leader rows={rows} />
        </section>
      )}
      {(prev || next) && (
        <div className="w-concept-brand-stepper">
          {prev ? (
            <TabButton size="sm" color="var(--cb-rosat)" ink="var(--cb-tinta)" icon="arrow-left" iconPosition="before" onClick={() => onSelect({ group: hot.group, item: prev })}>
              {HOT[prev].code}
            </TabButton>
          ) : (
            <span />
          )}
          {next && (
            <TabButton size="sm" color="var(--cb-rosat)" ink="var(--cb-tinta)" icon="arrow-right" onClick={() => onSelect({ group: hot.group, item: next })}>
              {HOT[next].code}
            </TabButton>
          )}
        </div>
      )}
    </div>
  )
}

// ---- the wordmark ----------------------------------------------------------------------------------------------------------------------
function ClearSpace() {
  // the file's viewBox is 1506 x 560 with the ink inside x 24 to 1481 and y 24 to 535; clear space = 94 units (one stem) outside the ink
  const ink = { x: 24, y: 24, w: 1457, h: 511 }
  const x = 94
  const box = { x: ink.x - x, y: ink.y - x, w: ink.w + 2 * x, h: ink.h + 2 * x }
  const corners = [
    { x: box.x, y: box.y },
    { x: ink.x + ink.w, y: box.y },
    { x: box.x, y: ink.y + ink.h },
    { x: ink.x + ink.w, y: ink.y + ink.h },
  ]
  return (
    <svg
      className="w-concept-brand-clear"
      viewBox={`${box.x - 14} ${box.y - 14} ${box.w + 28} ${box.h + 28}`}
      role="img"
      aria-label="The wordmark inside a dashed box that sits one stem width away from the letters on every side. Each corner is marked x."
    >
      {corners.map((c, i) => (
        <g key={i}>
          <rect x={c.x} y={c.y} width={x} height={x} className="w-concept-brand-clear-x" />
          <text x={c.x + x / 2} y={c.y + x / 2 + 22} textAnchor="middle" className="w-concept-brand-clear-t">
            x
          </text>
        </g>
      ))}
      <rect x={box.x} y={box.y} width={box.w} height={box.h} className="w-concept-brand-clear-box" />
      <image href={logoThumb(LOGOS[0])} x={0} y={0} width={1506} height={560} />
      <rect x={ink.x} y={ink.y} width={ink.w} height={ink.h} className="w-concept-brand-clear-ink" />
    </svg>
  )
}

export function WordmarkPanel() {
  const [variant, setVariant] = useState(LOGOS[0].id)
  const v = LOGOS.find((l) => l.id === variant) ?? LOGOS[0]
  const copy = GROUPS.wordmark
  return (
    <div className="w-concept-brand-body">
      <Title sub={copy.sub}>{copy.title}</Title>
      <Lines lines={copy.lines} />
      <Bar>{BAR_LABEL.variants}</Bar>
      <fieldset className="w-concept-brand-choices">
        <legend className="w-concept-brand-sr">Logo variant</legend>
        {LOGOS.map((l) => (
          <label key={l.id} className="w-concept-brand-choice" data-on={l.id === variant ? 'true' : undefined}>
            <input type="radio" name="w-concept-brand-variant" value={l.id} checked={l.id === variant} onChange={() => setVariant(l.id)} />
            <span>{l.name}</span>
          </label>
        ))}
      </fieldset>
      <figure className="w-concept-brand-stage-card" style={{ background: COLOUR[v.ground].hex }}>
        <img
          src={logoThumb(v)}
          width={logoThumbSize(v).w}
          height={logoThumbSize(v).h}
          alt={`${v.name}: ${v.note}`}
          decoding="async"
          style={{ aspectRatio: `${logoRatio(v)}`, maxHeight: v.h > 1500 ? 150 : 110 }}
        />
      </figure>
      <p className="w-concept-brand-p w-concept-brand-p--tight">
        <strong>Use on:</strong> {v.useOn}. {v.note}
      </p>
      <Bar>{BAR_LABEL.clear}</Bar>
      <ClearSpace />
      <Bar>{BAR_LABEL.minimum}</Bar>
      <div className="w-concept-brand-min">
        <figure>
          <img src={logoThumb(LOGOS[0])} width={100} height={Math.round(100 / logoRatio(LOGOS[0]))} alt="The wordmark at its smallest size, 100 pixels wide" />
          <figcaption>Actual size: 100 px</figcaption>
        </figure>
        <Leader rows={MIN_SIZES.map((s) => ({ k: s.name, v: s.mm ? `${s.px} · ${s.mm}` : s.px }))} />
      </div>
      <ul className="w-concept-brand-list">
        {WORDMARK_RULES.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </div>
  )
}

// ---- the cast ----------------------------------------------------------------------------------------------------------------------------
/** crop a 1000 x 1100 pose canvas to its character: CSS variables for the zoom and for where the character's middle sits */
function frame(id: MascotId): CSSProperties {
  const h = MASCOT[id].hit
  const k = Math.min((0.86 * 1000) / h.w, (0.86 * 1100) / h.h)
  const cx = ((h.x + h.w / 2) / 1000) * 100
  const cy = ((h.y + h.h / 2) / 1100) * 100
  return {
    '--pk': k.toFixed(3),
    '--px': `${(50 - cx).toFixed(2)}%`,
    '--py': `${(50 - cy).toFixed(2)}%`,
    '--ox': `${cx.toFixed(2)}%`,
    '--oy': `${cy.toFixed(2)}%`,
  } as CSSProperties
}

export function CastPanel({ item, onSelect }: { item: string | null; onSelect: Pick }) {
  const current: MascotId = isMascotId(item) ? item : 'gotet'
  const m = MASCOT_COPY[current]
  const group = GROUPS.cast
  return (
    <div className="w-concept-brand-body">
      <Title sub={group.sub}>{group.title}</Title>
      <p className="w-concept-brand-p">{group.lines[0]}</p>
      <Bar>{BAR_LABEL.cast}</Bar>
      <ul className="w-concept-brand-heads">
        {(['gotet', 'oliva', 'sifo', 'xip'] as MascotId[]).map((id) => (
          <li key={id}>
            <button type="button" aria-pressed={current === id} onClick={() => onSelect({ group: 'cast', item: id })} data-cursor="Open">
              <span className="w-concept-brand-head-art" style={{ background: COLOUR[id === 'gotet' ? 'rosat' : id === 'oliva' ? 'mantega' : id === 'sifo' ? 'rosat' : 'blau'].hex }}>
                <img src={headThumb(id, 1)} width={360} height={360} alt="" decoding="async" loading="lazy" />
              </span>
              <span>{MASCOT_COPY[id].name}</span>
            </button>
          </li>
        ))}
      </ul>
      <article className="w-concept-brand-character" aria-live="polite">
        <h3 className="w-concept-brand-name">
          {m.name} <span>{m.role}</span>
        </h3>
        <p className="w-concept-brand-chip-line">{m.colour}</p>
        <p className="w-concept-brand-p">{m.personality}</p>
        <p className="w-concept-brand-p">{m.line}</p>
        <p className="w-concept-brand-says">
          <q>{m.catch}</q> <span>{m.catchGloss}</span>
        </p>
        <Bar>{BAR_LABEL.poses}</Bar>
        <div className="w-concept-brand-poses">
          <figure style={frame(current)}>
            <div className="w-concept-brand-pose-frame" data-tone="a">
              <img src={poseThumb(current, 'a')} width={480} height={528} alt={`${m.name}, pose A: ${m.a.name}`} decoding="async" loading="lazy" />
            </div>
            <figcaption>
              <b>A</b> {m.a.name} <i>{m.a.expr}</i>
            </figcaption>
          </figure>
          <figure style={frame(current)}>
            <div className="w-concept-brand-pose-frame" data-tone="b">
              <img src={poseThumb(current, 'b')} width={480} height={528} alt={`${m.name}, pose B: ${m.b.name}`} decoding="async" loading="lazy" />
            </div>
            <figcaption>
              <b>B</b> {m.b.name} <i>{m.b.expr}</i>
            </figcaption>
          </figure>
        </div>
        <ul className="w-concept-brand-heads2">
          {[1, 2].map((n) => (
            <li key={n}>
              <img src={headThumb(current, n as 1 | 2)} width={360} height={360} alt={`${m.name}, head ${n}: ${m.heads[n - 1]}`} decoding="async" loading="lazy" />
              <span>{m.heads[n - 1]}</span>
            </li>
          ))}
        </ul>
      </article>
      <Bar>{BAR_LABEL.faces}</Bar>
      <ul className="w-concept-brand-faces">
        {EXPRESSIONS.map((e) => (
          <li key={e.code}>
            <img src={headThumb(e.who, e.head)} width={360} height={360} alt="" decoding="async" loading="lazy" />
            <b>{e.code}</b>
            <span>{e.name}</span>
          </li>
        ))}
      </ul>
      <p className="w-concept-brand-note">Four faces, one grammar: big white eyes with a dark pupil, a pink blush, and one of four mouths.</p>
      <Bar>{BAR_LABEL.pen}</Bar>
      <ul className="w-concept-brand-list">
        {CAST_RULES.map((r) => (
          <li key={r.title}>
            <strong>{r.title}.</strong> {r.body}
          </li>
        ))}
      </ul>
      <p className="w-concept-brand-note">{CAST_HEIGHTS}</p>
    </div>
  )
}

// ---- the pattern ---------------------------------------------------------------------------------------------------------------------------
export function PatternPanel({ colourway, onColourway }: { colourway: ColourwayId; onColourway: (id: ColourwayId) => void }) {
  const way = COLOURWAYS.find((c) => c.id === colourway) ?? COLOURWAYS[0]
  // the faint tone is made to vanish behind a wordmark: on the icon sheet it would vanish too, so the sheet falls back to Blau on Rosat
  const sheet = way.id === 'faint' ? COLOURWAYS[1] : way
  const copy = GROUPS.pattern
  return (
    <div className="w-concept-brand-body">
      <Title sub={copy.sub}>{copy.title}</Title>
      <Lines lines={copy.lines} />
      <Bar>{BAR_LABEL.ways}</Bar>
      <fieldset className="w-concept-brand-ways">
        <legend className="w-concept-brand-sr">Pattern colourway</legend>
        {COLOURWAYS.map((c) => (
          <label key={c.id} className="w-concept-brand-way" data-on={c.id === colourway ? 'true' : undefined}>
            <input type="radio" name="w-concept-brand-way" value={c.id} checked={c.id === colourway} onChange={() => onColourway(c.id)} />
            <span className="w-concept-brand-way-tile" style={{ backgroundColor: COLOUR[c.ground].hex, backgroundImage: `url(${patternFile(c.id)})` }} aria-hidden="true" />
            <span className="w-concept-brand-way-name">{c.name}</span>
            <span className="w-concept-brand-way-use">{c.usedFor}</span>
          </label>
        ))}
      </fieldset>
      <Bar>{BAR_LABEL.icons}</Bar>
      <ul className="w-concept-brand-icons">
        {PATTERN_ICONS.map((icon) => (
          <li key={icon.id}>
            <span className="w-concept-brand-icon-tile" style={{ background: COLOUR[sheet.ground].hex, color: sheet.line }}>
              <svg viewBox="0 0 116 116" aria-hidden="true" focusable="false">
                <use href={`${IMG.patternIcons}#p-${icon.id}`} width="116" height="116" />
              </svg>
            </span>
            <span>{icon.name}</span>
          </li>
        ))}
      </ul>
      <Bar>{BAR_LABEL.lattice}</Bar>
      <Leader rows={PATTERN_FACTS.map((f) => ({ k: f.k, v: f.v }))} />
    </div>
  )
}

// ---- the router of the panel ------------------------------------------------------------------------------------------------------------------
interface PanelBodyProps {
  sel: Selection
  onSelect: Pick
  colourway: ColourwayId
  onColourway: (id: ColourwayId) => void
  onTour: () => void
  onKit: () => void
  hideActions?: boolean
}

export function PanelBody({ sel, onSelect, colourway, onColourway, onTour, onKit, hideActions }: PanelBodyProps) {
  if (!sel.group) return <Overview onTour={onTour} onKit={onKit} hideActions={hideActions} />
  if (sel.group === 'wordmark') return <WordmarkPanel />
  if (sel.group === 'cast') return <CastPanel item={sel.item} onSelect={onSelect} />
  if (sel.group === 'pattern') return <PatternPanel colourway={colourway} onColourway={onColourway} />
  if (sel.item) return <ItemPanel id={sel.item} onSelect={onSelect} />
  return <GroupPanel group={sel.group} onSelect={onSelect} />
}
