// One band of the catalog: a project folder lying in the stack. Three states:
//   open  the accordion's one open band: header + the taped print, blurb, slate, "filed under", OPEN FOLDER
//   rest  a closed band: the giant title in the project's own typeface, kind, years, group
//   thin  a closed band that does not match the search: dimmed and folded down to a strip (still there, still openable)
// Structure (APG accordion): <h3><button aria-expanded aria-controls> + a group panel. The header is one button; the tab ("FOLDER 03")
// is a second, pointer-only way to the same toggle. The colour field is a <Folder as={motion.div}> whose layoutId is the shell's, so
// OPEN FOLDER flies the band's field into the world (docs/api/platform.md section 3).
import { Fragment, memo, useRef, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { CATALOG, CONCEPT, CONCEPT_LINE, pad2 } from '@/lib/copy'
import { folderLayoutId, openWork, workHref } from '@/lib/router'
import { CATEGORY_LABEL, type WorkMeta } from '@/lib/works'
import { prefetchWorld } from '@/worlds/registry'
import { ArrowIcon, Folder, Polaroid, SlateLabel, Stamp, TabButton } from '../../primitives'
import { luminance, parseHex } from '../../primitives/util'
import { Cutout } from './Cutout'
import { Inside } from './Inside'
import { Marked } from './Marked'
import { Motif, useMotifRoom } from './Motif'
import type { WorkHit } from './search'
import { CAT_UI, PRINT_ALT, PRINT_CAPTION } from './strings'
import { prefetchThumb, Thumb } from './Thumb'
import { rememberOpen } from './useReturn'

export type BandState = 'open' | 'rest' | 'thin'

/** where each tab sits along its band's top edge (0 = left, 1 = right): never two neighbours alike, like the template's tabs */
const TAB_X = [0.68, 0.07, 0.83, 0.3, 0.68, 0.15, 0.92, 0.44, 0.76, 0.22] as const
const PATTERNS = ['stripes', 'dots', 'plain', 'checks', 'grid'] as const

/** the titles that stand on two lines, broken where the design wants it: the same break in every face (a free wrap would change with the face, and the band would change height when it swaps in) */
const LINES: Readonly<Record<string, readonly string[]>> = {
  contract: ['Proyecto', 'Contract'],
  'spelled-guilty': ['Spelled', 'Guilty'],
  'space-monkey': ['Space', 'Monkey'],
  procreate: ['Procreate', 'Sketchbook'],
  'concept-portfolio': ['A Portfolio', 'for a Client'],
  illustration: ['Sticker', 'Sheet'],
}

/** cream ink = a dark field (pine, oxblood, ultraviolet): its slate and button flip to paper */
const isDarkField = (ink: string): boolean => {
  const rgb = parseHex(ink)
  return rgb ? luminance(rgb) > 0.5 : false
}

/** a straight apostrophe between two letters becomes a typographic one (the registry's concept-portfolio blurb has "client's") */
const curl = (text: string): string => text.replace(/(\p{L})'(\p{L})/gu, '$1’$2')

const isPlainClick = (event: MouseEvent): boolean => event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey

/** one slate line per entry (the slate hides a cell whose value is empty, which is how Contract and Plana have no Tools cell) */
function lines(values: readonly string[], words: string[]): ReactNode {
  if (values.length === 0) return null
  return values.map((value) => (
    <span key={value} className="pm-slate__line">
      <Marked text={value} words={words} />
    </span>
  ))
}

function PlusIcon() {
  return (
    <svg className="pm-cat-plus" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12.4 3.4C12 8 12.3 15.5 11.7 20.6" />
      <path d="M3.3 12.3C8.6 11.7 15.4 12.5 20.8 11.8" />
    </svg>
  )
}

/** the highlight layer of a title (catalog.css, "the title highlight"): one inline marker block per line of text, the same in every band */
function Hl({ children }: { children: ReactNode }) {
  return <span className="pm-cat-hl">{children}</span>
}

/** the giant title; Plana sets "plana" heavy and "digital" light, like its own logo */
function TitleText({ work, words }: { work: WorkMeta; words: string[] }) {
  if (work.slug === 'plana') {
    const [first, ...rest] = work.title.split(' ')
    return (
      <Hl>
        <span className="pm-cat-t1">
          <Marked text={first} words={words} />
        </span>{' '}
        <span className="pm-cat-t2">
          <Marked text={rest.join(' ')} words={words} />
        </span>
      </Hl>
    )
  }
  const stacked = LINES[work.slug]
  if (stacked) {
    // one block per line, with a real space between them (the accessible name and copy / paste read "Proyecto Contract")
    return (
      <>
        {stacked.map((line, i) => (
          <Fragment key={line}>
            {i > 0 && ' '}
            <span className="pm-cat-ln">
              <Hl>
                <Marked text={line} words={words} />
              </Hl>
            </span>
          </Fragment>
        ))}
      </>
    )
  }
  return (
    <Hl>
      <Marked text={work.title} words={words} />
    </Hl>
  )
}

interface BandProps {
  work: WorkMeta
  /** 0-based position in the stack */
  index: number
  state: BandState
  /** the query's folded words, for the underlines */
  words: string[]
  hint: WorkHit['hint']
  /** it has been open at least once: its print and slate are mounted (nothing is fetched for bands nobody opened) */
  mounted: boolean
  /** how many times the band has been opened (keys the slate and the stamp so they play again) */
  plays: number
  /** touch / still motion: a small thumbnail sits in the header (the cursor preview is for a mouse) */
  inlineThumb: boolean
  /** colour of the tape that holds the print: the next folder's colour */
  tape: string
  /** where the tab stands along the band's top edge (0..1); the first band's is measured so the arrow from the search card lands on it */
  tabX?: number
  onToggle: (slug: string) => void
  headRef: (slug: string, el: HTMLButtonElement | null) => void
}

function BandImpl({ work, index, state, words, hint, mounted, plays, inlineThumb, tape, tabX, onToggle, headRef }: BandProps) {
  const open = state === 'open'
  const thin = state === 'thin'
  const headId = `pm-cat-h-${work.slug}`
  const panelId = `pm-cat-p-${work.slug}`
  const dark = isDarkField(work.ink)
  /** one short spoken name for the header button (the visible text is a glued run of spans: title, kind, years, group, search hint) */
  const spokenYears = work.years ? work.years.replace(/\s*[–—-]\s*/, ' to ') : ''
  const headLabel =
    [work.title, work.kind, spokenYears].filter(Boolean).join(', ') +
    (thin ? `. ${CAT_UI.noMatch}` : '') +
    (hint ? `. ${hint.field} ${hint.word}` : '')
  /** the header row: the folder stock (motif) takes the room between the end of the title and the meta column */
  const bigRef = useRef<HTMLSpanElement>(null)
  useMotifRoom(bigRef)

  // the label of the tab is a pointer shortcut to the same toggle as the header, so it carries the same cursor word (and the preview)
  const tab = (
    <span className="pm-cat-tab" data-cursor={open ? 'Close' : 'Open'} data-peek={open ? undefined : work.slug}>
      <span>{CATALOG.bandTab(work.n)}</span>
      <span className="pm-cat-tab__arrow">
        <ArrowIcon dir="right" />
      </span>
    </span>
  )

  return (
    <li className="pm-cat-item" data-slug={work.slug} style={{ '--i': index } as CSSProperties}>
      <Folder
        as={motion.div}
        layoutId={folderLayoutId(work.slug, 'catalog')}
        className="pm-cat-band"
        data-slug={work.slug}
        data-state={state}
        data-dark={dark ? '' : undefined}
        color={work.color}
        ink={work.ink}
        tab={tab}
        tabX={tabX ?? TAB_X[index % TAB_X.length]}
        bodyClassName="pm-cat-body"
        onClick={(event: MouseEvent<HTMLElement>) => {
          // the tab is not a button (the header is): it is a pointer shortcut to the same toggle
          if (event.target instanceof Element && event.target.closest('.pm-folder__tab')) onToggle(work.slug)
        }}
      >
        <h3 className="pm-cat-h" data-peek={open ? undefined : work.slug} data-cursor={open ? 'Close' : 'Open'}>
          <button
            ref={(el) => headRef(work.slug, el)}
            id={headId}
            type="button"
            className="pm-cat-head"
            aria-label={headLabel}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => onToggle(work.slug)}
            onPointerEnter={() => prefetchThumb(work)}
            onFocus={() => prefetchThumb(work)}
          >
            <span className="pm-cat-no" aria-hidden="true">
              {pad2(work.n)}
            </span>
            <span className="pm-cat-main">
              {thin && <span className="pm-sr">{CAT_UI.noMatch}. </span>}
              <span className="pm-cat-big">
                <span ref={bigRef} className="pm-cat-big__in">
                  <Motif slug={work.slug} />
                  <span className="pm-cat-title">
                    <TitleText work={work} words={words} />
                  </span>
                  <span className="pm-cat-metarow">
                    <span className="pm-cat-meta">
                      <span className="pm-cat-kind">
                        <Marked text={work.kind} words={words} />
                      </span>
                      <span className="pm-cat-line">
                        {work.years && (
                          <span>
                            <Marked text={work.years} words={words} />
                          </span>
                        )}
                        <span>
                          <Marked text={work.group} words={words} />
                        </span>
                      </span>
                      {hint && (
                        <span className="pm-cat-found">
                          {hint.field} <mark className="pm-cat-mark">{hint.word}</mark>
                        </span>
                      )}
                    </span>
                    {inlineThumb && !open && (
                      <span className="pm-cat-ithumb" aria-hidden="true">
                        <Thumb work={work} />
                      </span>
                    )}
                  </span>
                </span>
              </span>
              <span className="pm-cat-small" aria-hidden="true">
                <span className="pm-cat-small__in">
                  <span className="pm-cat-small__t">{work.title}</span>
                  <span className="pm-cat-small__g">{work.group}</span>
                </span>
              </span>
            </span>
            <PlusIcon />
          </button>
        </h3>

        <div id={panelId} className="pm-cat-fold" role="group" aria-labelledby={headId} data-open={open ? '' : undefined}>
          <div className="pm-cat-fold__in">
            {(mounted || open) && (
              <div className="pm-cat-panel">
                <div className="pm-cat-panel__text">
                  <p className="pm-cat-blurb">
                    <Marked text={curl(work.blurb)} words={words} />
                  </p>
                  <div className="pm-cat-kit">
                    <SlateLabel
                      key={plays}
                      className="pm-cat-slate"
                      tone={dark ? 'paper' : 'ink'}
                      items={[
                        { label: CAT_UI.slate.role, value: lines(work.roles, words) },
                        { label: CAT_UI.slate.tools, value: lines(work.tools, words) },
                        { label: CAT_UI.slate.group, value: <Marked text={work.group} words={words} /> },
                      ]}
                    />
                    <Inside key={`in${plays}`} slug={work.slug} words={words} tape={tape} />
                    {work.concept && (
                      <div className="pm-cat-concept">
                        <Stamp key={plays} text={CONCEPT.stamp} tone="ink" rotate={-5} size="1.05rem" rough={2} />
                        <p className="pm-cat-concept__line">{CONCEPT_LINE}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="pm-cat-panel__art" data-cut={work.peek ? '' : undefined}>
                  <Polaroid
                    width={720}
                    height={900}
                    caption={PRINT_CAPTION[work.slug]}
                    rotate={index % 2 ? 2.4 : -2.6}
                    w="var(--cat-print)"
                    tape={{ color: tape, pattern: PATTERNS[index % PATTERNS.length], w: '5.2rem', h: '1.7rem', rotate: index % 2 ? 3 : -4 }}
                  >
                    <Thumb work={work} alt={PRINT_ALT[work.slug]} />
                  </Polaroid>
                  <Cutout work={work} />
                </div>
                <div className="pm-cat-foot">
                  <div className="pm-cat-foot__meta">
                    <p className="pm-cat-file t-label">{CATALOG.bandFooter(work.n, work.years)}</p>
                    <ul className="pm-cat-filed" aria-label={CAT_UI.filedUnder}>
                      {work.categories.map((category) => (
                        <li key={category} className="pm-cat-filed__c">
                          <Marked text={CATEGORY_LABEL[category]} words={words} />
                        </li>
                      ))}
                    </ul>
                  </div>
                  <TabButton
                    href={workHref(work.slug)}
                    tone={dark ? 'paper' : 'ink'}
                    size="lg"
                    icon="arrow-right"
                    cursor="Open"
                    className="pm-cat-open"
                    onClick={(event) => {
                      if (!isPlainClick(event)) return
                      event.preventDefault()
                      rememberOpen(event.currentTarget)
                      openWork(work.slug, 'catalog')
                    }}
                    onPointerEnter={() => prefetchWorld(work.slug)}
                    onFocus={() => prefetchWorld(work.slug)}
                  >
                    {CATALOG.button}
                  </TabButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </Folder>
    </li>
  )
}

export const Band = memo(BandImpl)
