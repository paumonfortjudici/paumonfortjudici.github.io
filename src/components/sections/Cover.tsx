// 01 Cover: the sheet that opens the cabinet. Giant outline lettering (tomato ink + a misregistered ultraviolet plate, like a
// two-colour riso print), the title with its one accent word, the name tab, three quick tabs, a rotating stamp, a hand-written
// note, and the DECK: ten folders, one per project. Docs: docs/api/sections-cover.md
import { useRef } from 'react'
import { COVER, SHEET_META } from '../../lib/copy'
import { useMotion } from '../../lib/motion'
import { categoryCounts, WORKS, type Category } from '../../lib/works'
import { Scribble, Sheet, Stamp, StrokeWord, TabButton, requestFilter, type ToneName } from '../primitives'
import { Deck } from './cover/Deck'
import { useDeckLayout, useHandFontReady, useIntroReady } from './cover/hooks'
import { Iris } from './cover/Iris'
import './cover.css'

/** the heading's accessible name (the lettering itself is drawn, so the real words live here) */
const WORD_LABEL = 'Pau Monfort, portfolio'
/** on narrow screens the one long word breaks into two stacked lines, so the lettering stays poster-sized */
const WORD_STACKED = 'PORT\nFOLIO'

/** the hand-drawn arrow under the note: a long diagonal on the wide cover, a short one pointing straight down on narrow ones */
const ARROW = {
  wide: { dir: 'down-right', w: 'clamp(3.6rem, 6cqw, 5.4rem)', ratio: 1.9 },
  narrow: { dir: 'down', w: '3.6rem', ratio: 1.2 },
} as const

const QUICK_TONE: Record<Category, ToneName> = {
  branding: 'marigold',
  editorial: 'lagoon',
  illustration: 'bubblegum',
  web: 'butter',
  print: 'lilac',
}

/** the name tab, in the two pieces it is read in: "Pau Monfort" and "Graphic designer" (the dot between them is a separator) */
const [tagName, tagRole = ''] = COVER.nameTag.split(' · ')

/** the authored line break of the title: everything before "&" is line one, "& characters" is line two */
function titleLines(): { first: string; amp: string } {
  const before = COVER.title.before
  const cut = before.indexOf('&')
  return cut < 0 ? { first: before.trim(), amp: '' } : { first: before.slice(0, cut).trim(), amp: before.slice(cut).trim() }
}

export function Cover() {
  const rootRef = useRef<HTMLDivElement>(null)
  const { still } = useMotion()
  const ready = useIntroReady()
  const handReady = useHandFontReady()
  const layout = useDeckLayout(rootRef)
  const counts = categoryCounts()
  const { first, amp } = titleLines()
  const stacked = layout === 'solo'
  const noteOn = ready && handReady
  const arrow = layout === 'wide' ? ARROW.wide : ARROW.narrow

  // A quick tab previews its folders: while it is hovered (mouse) or focused (keyboard), the folders filed under that kind of
  // work step forward (cover.css, [data-hint]). Written straight onto the root: no state, so the lettering never re-renders.
  const hint = (category?: Category) => {
    const root = rootRef.current
    if (!root) return
    if (category) root.setAttribute('data-hint', category)
    else root.removeAttribute('data-hint')
  }

  const plate = (cls: string, drawDelay: number, fill: boolean) => (
    <span className={`cv-plate ${cls}`}>
      <StrokeWord
        as="span"
        text={stacked ? WORD_STACKED : COVER.strokeWord}
        label={WORD_LABEL}
        size="100cqw"
        hoverWave={false}
        draw={still ? false : drawDelay}
        fill={fill ? 'tint' : false}
        tracking={0.03}
        align="start"
        stack={stacked ? true : false}
        stackSize="100cqw"
      />
    </span>
  )

  return (
    <Sheet id="cover" tone="cream" page={SHEET_META.pages.cover} n={1} aria-labelledby="cover-title">
      <div ref={rootRef} className="cv" data-layout={layout} data-ready={ready ? '' : undefined}>
        {/* ---- the aperture behind everything ---- */}
        <div className="cv__decor" aria-hidden="true">
          <Iris className="cv-iris" />
        </div>

        {/* ---- the lettering ---- */}
        <div className="cv__top">
          {/* the year, as a thin third plate behind the lettering (decorative: the year is also on the stamp and the meta bar) */}
          <span className="cv__ghost" aria-hidden="true">
            <StrokeWord as="span" text={COVER.ghost} label="" size="100cqw" draw={false} hoverWave={false} strokeScale={0.55} />
          </span>
          <h1 id="cover-title" className="cv__word">
            <span className="pm-sr">{WORD_LABEL}</span>
            <span className="cv__ink" aria-hidden="true">
              {plate('cv-plate--tomato', 0, true)}
              {plate('cv-plate--violet', 260, false)}
            </span>
          </h1>
        </div>

        {/* ---- title, pointer note, name tab, quick tabs, blurb, stamp ---- */}
        <div className="cv__row">
          <div className="cv__lead">
            <h2 className="cv__title t-display">
              <span className="cv__line">{first}</span>{' '}
              <span className="cv__line">
                {amp ? `${amp} ` : null}
                <span className="cv__accent">
                  <em>{COVER.title.accent}</em>
                  <Scribble kind="underline" at="under" color="var(--tomato)" seed="characters" stroke={3.6} draw={still ? false : 1500} />
                </span>
              </span>
            </h2>

            {/* the hand-written pointer: its arrow ends on the deck */}
            <div className="cv__note" aria-hidden="true" data-in={noteOn ? '' : undefined}>
              <span className="cv__note-text t-hand">{COVER.note}</span>
              <span className="cv__arrow" style={{ width: arrow.w, aspectRatio: arrow.ratio }}>
                {noteOn ? (
                  <Scribble kind="arrow" dir={arrow.dir} ratio={arrow.ratio} color="var(--ink)" w="100%" stroke={3.4} draw={still ? false : 650} seed="pick" />
                ) : null}
              </span>
            </div>
          </div>

          <div className="cv__side">
            <TabButton href="#about" tone="ultraviolet" size="lg" icon="arrow-down" cursor="Open" className="cv__chip">
              <span className="cv__chip-name">{tagName}</span>
              <span className="cv__chip-sep"> · </span>
              <span className="cv__chip-role">{tagRole}</span>
            </TabButton>
            <ul className="cv__quick">
              {COVER.quickLinks.map(({ label, category }) => (
                <li
                  key={category}
                  onPointerEnter={(event) => event.pointerType === 'mouse' && hint(category)}
                  onPointerLeave={() => hint()}
                  onFocus={(event) => event.target instanceof Element && event.target.matches(':focus-visible') && hint(category)}
                  onBlur={() => hint()}
                >
                  <TabButton
                    size="sm"
                    tone={QUICK_TONE[category]}
                    count={counts[category]}
                    cursor="Open"
                    aria-label={`${label}, ${counts[category]} ${counts[category] === 1 ? 'folder' : 'folders'}`}
                    onClick={() => requestFilter(category)}
                  >
                    {label}
                  </TabButton>
                </li>
              ))}
            </ul>
            <p className="cv__blurb t-lead">{COVER.blurb}</p>
          </div>

          <div className="cv__stamp">
            {/* black ink, not the violet of the plate underneath: the ring text must stay legible where it crosses the O */}
            <Stamp text="Open" ring={COVER.stamp} spin tone="ink" rotate={-9} size="var(--stamp)" />
          </div>
        </div>

        {/* ---- the deck ---- */}
        <Deck works={WORKS} layout={layout} ready={ready} />
      </div>
    </Sheet>
  )
}

export default Cover
