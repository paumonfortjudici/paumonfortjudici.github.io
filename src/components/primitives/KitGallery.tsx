// DEV-ONLY: every primitive on cream / ink / marigold / ultraviolet / tomato (+ the desk), in several states.
// Served at /kit.html by the dev server; never imported by the production entry.
import { motion } from 'framer-motion'
import { useEffect, useState, type ReactNode } from 'react'
import { asset } from '../../lib/asset'
import { WORKS } from '../../lib/works'
import {
  ColorBars,
  CropMarks,
  FilmPerforations,
  FilmStrip,
  Folder,
  PaperClip,
  Pin,
  Polaroid,
  RegMark,
  Reveal,
  Scribble,
  Sheet,
  SlateLabel,
  Stamp,
  Sticker,
  StickyNote,
  StrokeWord,
  TabButton,
  Tape,
  Ticket,
  WorldFacts,
  type ScribbleKind,
  type SheetTone,
  type ToneName,
} from './index'

type StageTone = 'desk' | 'cream' | 'ink' | 'marigold' | 'ultraviolet' | 'tomato'
const STAGES: StageTone[] = ['cream', 'ink', 'marigold', 'ultraviolet', 'tomato']

function Sec({ id, title, note, children }: { id: string; title: string; note?: ReactNode; children: ReactNode }) {
  return (
    <section className="kit-sec" id={id}>
      <h2 className="kit-sec__title">{title}</h2>
      {note && <p className="kit-sec__note">{note}</p>}
      {children}
    </section>
  )
}

function Stage({ tone, label, children, className }: { tone: StageTone; label?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`kit-stage kit-stage--${tone}${className ? ' ' + className : ''}`}>
      <p className="kit-stage__label">{label ?? tone}</p>
      <div className="kit-stage__body">{children}</div>
    </div>
  )
}

/* ------------------------------------------------------------------------------------------------------ folders */
function FolderSection() {
  const [count, setCount] = useState(0)
  return (
    <Sec id="folders" title="Folder + TabChip" note="Every folder colour of the registry on the desk. One SVG silhouette: check the shoulders at dpr 1 / 1.25 / 1.5 / 2.">
      <Stage tone="desk" label="desk: the ten folders">
        <div className="kit-row" style={{ gap: '34px 26px' }}>
          {WORKS.map((w, i) => (
            <Folder
              key={w.slug}
              color={w.color}
              ink={w.ink}
              tab={`Folder ${String(w.n).padStart(2, '0')}`}
              count={w.categories.length}
              tabX={[0, 0.55, 0.2, 0.8, 0.35, 1, 0.65, 0.1, 0.45, 0.9][i]}
              style={{ width: 'min(100%, 300px)' }}
            >
              <span style={{ display: 'block', minHeight: 120 }}>
                <span className="t-num t-display" style={{ display: 'block' }}>{String(w.n).padStart(2, '0')}</span>
                <span className="t-h5 t-display" style={{ display: 'block' }}>{w.title}</span>
                <span className="t-caption" style={{ display: 'block', color: 'var(--on2)' }}>{w.kind}</span>
              </span>
            </Folder>
          ))}
        </div>
      </Stage>
      <div className="kit-stages" style={{ marginTop: 18 }}>
        {STAGES.map((tone) => (
          <Stage key={tone} tone={tone}>
            <div className="kit-row">
              <Folder tone="tomato" tab="Tomato" count={1} lift style={{ width: 150 }}>lifted</Folder>
              <Folder tone="pine" tab="Pine" tabX={0.9} rim style={{ width: 150 }}>rim</Folder>
              <Folder tone="butter" tab="Flush" flush style={{ width: 150 }}>flush</Folder>
            </div>
          </Stage>
        ))}
      </div>
      <Stage tone="cream" label="interactive: button folder, lift on hover, focus ring">
        <div className="kit-row">
          <Folder as="button" tone="lilac" tab="Folder 03" count={count} lift="hover" onClick={() => setCount((c) => c + 1)} style={{ width: 240 }}>
            <span style={{ display: 'block', minHeight: 90 }}>Press me ({count})</span>
          </Folder>
          <Folder as="a" href="#folders" tone="oxblood" tab="Link" tabX={0.7} lift="hover" style={{ width: 240 }}>
            <span style={{ display: 'block', minHeight: 90 }}>Oxblood link</span>
          </Folder>
          <Folder color="var(--paper)" ink="var(--ink)" style={{ width: 240 }}>No tab: plain panel</Folder>
          <Folder dashed ink="var(--ink)" tab="Next folder" tabX={0.3} style={{ width: 240 }}>
            <span style={{ display: 'block', minHeight: 90 }}>dashed: yours?</span>
          </Folder>
          <Folder as={motion.div} tone="olive" tab="motion.div" tabX={0.5} whileHover={{ y: -10 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }} style={{ width: 240 }}>
            <span style={{ display: 'block', minHeight: 90 }}>as=&#123;motion.div&#125;: hover me</span>
          </Folder>
        </div>
      </Stage>
    </Sec>
  )
}

/* ------------------------------------------------------------------------------------------------ tab buttons */
function TabButtonSection() {
  return (
    <Sec id="tabbuttons" title="TabButton" note="The site's button: a small folder tab. Hover pulls it up, press collapses the paper edge.">
      <div className="kit-stages">
        {(['desk', 'cream', 'ink', 'marigold', 'ultraviolet', 'tomato'] as const).map((tone) => (
          <Stage key={tone} tone={tone}>
            <div className="kit-row" style={{ gap: 18 }}>
              <TabButton tone="ink">Open folder</TabButton>
              <TabButton tone="tomato" icon="arrow-right">Next step</TabButton>
              <TabButton tone="marigold" icon="arrow-left" iconPosition="before" size="sm">Back</TabButton>
              <TabButton tone="cream" size="lg" count={3}>All works</TabButton>
              <TabButton tone="ultraviolet" href="#tabbuttons" icon="arrow-up-right" external>Link</TabButton>
              <TabButton tone="bubblegum" disabled>Disabled</TabButton>
            </div>
          </Stage>
        ))}
      </div>
    </Sec>
  )
}

/* ------------------------------------------------------------------------------------------------ stroke words */
const WORDS = ['PAU MONFORT', 'PORTFOLIO', 'CATALOG', 'ABOUT ME', 'WORKS', 'PROCESS', 'CONTACT', 'LET’S TALK :)', '#2026', '(10)', '(05)', '#PAU']
const TITLES = ['PROYECTO CONTRACT', 'PLANA DIGITAL', '44 LAB', 'SPELLED GUILTY', 'SPACE MONKEY', 'PROCREATE SKETCHBOOK', 'SOMIA', 'GOTET', 'A PORTFOLIO FOR A CLIENT', 'STICKER SHEET']

function StrokeSection() {
  return (
    <Sec id="strokewords" title="StrokeWord" note="Outline lettering at the default size (13vw, capped by the container). Hover for the wave. Real text is in a hidden span; the SVG is aria-hidden.">
      <div className="kit-stages" style={{ gridTemplateColumns: '1fr' }}>
        <Stage tone="cream" label="cream · default size · fill tint · h2">
          <div style={{ display: 'grid', gap: 18 }}>
            {WORDS.slice(0, 8).map((w) => (
              <StrokeWord key={w} text={w} as="h2" fill="tint" style={{ color: 'var(--tomato)' }} />
            ))}
          </div>
        </Stage>
        <Stage tone="ink" label="ink · 8vw · ghost words behind, solid fill">
          <div style={{ display: 'grid', gap: 18 }}>
            <div style={{ position: 'relative' }}>
              <StrokeWord text="#2026" ghost size="14vw" style={{ color: 'var(--marigold)', position: 'absolute', right: 0, top: '-0.1em' }} />
              <StrokeWord text="PORTFOLIO" size="10vw" fill="solid" style={{ color: 'var(--marigold)' }} />
            </div>
            {WORDS.slice(8).map((w) => (
              <StrokeWord key={w} text={w} size="8vw" style={{ color: 'var(--marigold)' }} />
            ))}
          </div>
        </Stage>
        <Stage tone="marigold" label="marigold · the ten titles · 6vw">
          <div style={{ display: 'grid', gap: 14 }}>
            {TITLES.map((w) => (
              <StrokeWord key={w} text={w} size="6vw" style={{ color: 'var(--ink)' }} />
            ))}
          </div>
        </Stage>
        <Stage tone="cream" label="cream · shadow: the misregistered riso outline · 11vw">
          <StrokeWord text="PAU MONFORT" size="11vw" shadow="var(--tomato)" fill="tint" style={{ color: 'var(--ink)' }} />
        </Stage>
        <Stage tone="cream" label="cream · the ten titles · 12vw (never wider than the stage) · drawn">
          <div style={{ display: 'grid', gap: 22 }}>
            {TITLES.map((w) => (
              <StrokeWord key={w} text={w} size="12vw" draw={false} style={{ color: 'var(--ink)' }} />
            ))}
          </div>
        </Stage>
        <Stage tone="tomato" label="tomato · ink outline, solid fill after the draw">
          <StrokeWord text="LET’S TALK :)" as="h2" size="10vw" fill="solid" style={{ color: 'var(--ink)' }} />
        </Stage>
        <Stage tone="ultraviolet" label="ultraviolet · stack on mobile (resize below 720px)">
          <StrokeWord text="PAU MONFORT" as="h1" size="12vw" stack="mobile" fill="tint" style={{ color: 'var(--cream)' }} />
        </Stage>
      </div>
    </Sec>
  )
}

/* ------------------------------------------------------------------------------------------------ sheets */
const SHEETS: { tone: SheetTone; page: string; n: number; word: string }[] = [
  { tone: 'cream', page: 'Cover', n: 1, word: 'PORTFOLIO' },
  { tone: 'ink', page: 'Catalog', n: 2, word: 'CATALOG' },
  { tone: 'marigold', page: 'About', n: 3, word: 'ABOUT ME' },
  { tone: 'cream', page: 'Works', n: 4, word: 'WORKS' },
  { tone: 'ultraviolet', page: 'Process', n: 5, word: 'PROCESS' },
  { tone: 'tomato', page: 'Contact', n: 6, word: 'CONTACT' },
]

function SheetSection() {
  return (
    <Sec id="sheets" title="Sheet + SheetMeta" note="Five tones, accent rotating through the folder colours. The three kinds of work in the bar are real buttons (they dispatch pm:filter on window and scroll to #works).">
      <div style={{ display: 'grid', gap: 0 }}>
        {SHEETS.map((s) => (
          <Sheet key={`${s.tone}${s.n}`} id={`kit-sheet-${s.n}`} tone={s.tone} page={s.page} n={s.n} style={{ marginBottom: 28 }}>
            <StrokeWord text={s.word} as="h2" size="min(10vw, 9rem)" style={{ color: 'var(--on-sheet)' }} />
            <p className="t-lead" style={{ maxWidth: '52ch', margin: '1rem 0 1.2rem' }}>
              Text on the {s.tone} sheet. <span style={{ color: 'var(--muted-on-sheet)' }}>Muted text on the same sheet, 16px.</span>
            </p>
            <div className="kit-row" style={{ gap: 16 }}>
              <TabButton color="var(--accent)" ink="var(--accent-ink)" icon="arrow-right">Accent tab</TabButton>
              <TabButton tone={s.tone === 'ink' ? 'cream' : 'ink'}>Open folder</TabButton>
            </div>
          </Sheet>
        ))}
      </div>
    </Sec>
  )
}

/* ------------------------------------------------------------------------------------------------ stamps + tape */
function StampSection() {
  return (
    <Sec id="stamps" title="Stamp + Tape" note="Letterpress edge from an SVG filter, thump-in on scroll. Ring stamps must be at least 10rem wide (ring text stays >= 13px).">
      <div className="kit-stages">
        {STAGES.map((tone) => (
          <Stage key={tone} tone={tone}>
            <div className="kit-row" style={{ gap: '30px 34px', alignItems: 'center' }}>
              <Stamp text="Concept" tone={tone === 'tomato' || tone === 'ultraviolet' || tone === 'ink' ? 'ink' : 'tomato'} color={tone === 'ink' || tone === 'ultraviolet' ? 'var(--cream)' : undefined} blend={tone === 'ink' || tone === 'ultraviolet' ? 'normal' : 'multiply'} />
              <Stamp text="Out now" sub="Spelled Guilty" rotate={5} color={tone === 'cream' ? 'var(--ultraviolet)' : tone === 'ink' ? 'var(--bubblegum)' : 'var(--ink)'} blend={tone === 'ink' ? 'normal' : 'multiply'} rough={3} />
              <Stamp text="Approved" shape="plain" rotate={-3} color={tone === 'cream' ? 'var(--pine)' : tone === 'ink' ? 'var(--olive)' : 'var(--ink)'} blend={tone === 'ink' ? 'normal' : 'multiply'} rough={1} />
              <Stamp
                text="First project"
                sub="Age 13"
                ring="My first project · age 13 · "
                rotate={-6}
                color={tone === 'ink' || tone === 'ultraviolet' ? 'var(--cream)' : tone === 'marigold' ? 'var(--oxblood)' : 'var(--ultraviolet)'}
                blend={tone === 'ink' || tone === 'ultraviolet' ? 'normal' : 'multiply'}
              />
              <Stamp text="Open" ring="Open for projects · 2026 · " spin color={tone === 'ink' ? 'var(--marigold)' : tone === 'cream' ? 'var(--tomato)' : 'var(--ink)'} blend={tone === 'ink' ? 'normal' : 'multiply'} />
            </div>
          </Stage>
        ))}
      </div>
      <h3 className="kit-sec__title" style={{ fontSize: 'var(--fs-h5)', marginTop: 36 }}>Tape</h3>
      <div className="kit-stages">
        {STAGES.map((tone) => (
          <Stage key={tone} tone={tone}>
            <div className="kit-row" style={{ gap: '26px 28px' }}>
              {(['butter', 'tomato', 'lagoon', 'bubblegum', 'lilac', 'marigold'] as ToneName[]).map((c, i) => (
                <Tape key={c} color={c} pattern={(['plain', 'stripes', 'dots', 'grid', 'checks', 'plain'] as const)[i]} rotate={(i % 2 ? 1 : -1) * (2 + i)} />
              ))}
              <Tape color="butter" w="9rem" h="2.2rem" rotate={-2}>pick a folder</Tape>
            </div>
            <div className="kit-row" style={{ marginTop: 34, gap: 40 }}>
              <div style={{ position: 'relative', width: 190, height: 120, background: 'var(--paper)', color: 'var(--ink)', borderRadius: 4, display: 'grid', placeItems: 'center' }}>
                <Tape at="tl" color="lagoon" w="5rem" />
                <Tape at="br" color="bubblegum" w="5rem" pattern="stripes" />
                a card, taped
              </div>
              <div style={{ position: 'relative', width: 190, height: 120, background: 'var(--paper)', color: 'var(--ink)', borderRadius: 4, display: 'grid', placeItems: 'center' }}>
                <Tape at="top" color="butter" />
                taped on top
              </div>
            </div>
          </Stage>
        ))}
      </div>
    </Sec>
  )
}

/* ------------------------------------------------------------------------------------------------ tickets */
function TicketSection() {
  return (
    <Sec id="tickets" title="Ticket" note="External-link CTA. Hover or focus tears the stub away; the accessible name says it opens a new tab.">
      <div className="kit-stages">
        {(['desk', ...STAGES] as StageTone[]).map((tone) => (
          <Stage key={tone} tone={tone}>
            <div className="kit-row" style={{ gap: 26 }}>
              <Ticket href="https://planadigital.cat/" label="planadigital.cat" rotate={-1.5} />
              <Ticket href="https://www.instagram.com/fortyfour.lab/" label="@fortyfour.lab" stub="tomato" rotate={1.2} />
              <Ticket href="https://www.amazon.com/dp/B0HNKTP74L" label="Spelled Guilty on Amazon" kicker="Get the book" tone="butter" stub="oxblood" />
            </div>
          </Stage>
        ))}
      </div>
    </Sec>
  )
}

/* ------------------------------------------------------------------------------------------------ small objects */
function ObjectsSection() {
  return (
    <Sec id="objects" title="Sticker, Polaroid, StickyNote, PaperClip, Pin" note="Die-cut halo from a shared SVG filter; polaroids carry real thumbnails; the clip and the pin hold things.">
      <div className="kit-stages">
        {(['desk', ...STAGES] as StageTone[]).map((tone) => (
          <Stage key={tone} tone={tone}>
            <div className="kit-row" style={{ gap: '38px 30px', alignItems: 'flex-end' }}>
              <Sticker src={asset('/works/fortyfour-lab/peek.webp')} alt="The 44 Lab devil" width={478} height={591} rotate={-5} style={{ width: 120 }} />
              <Sticker src={asset('/works/space-monkey/peek.webp')} alt="Space Monkey poster cut-out" width={432} height={640} rotate={4} halo={3} style={{ width: 110 }} />
              <Sticker src={asset('/works/illustration/art/thumb-02.webp')} alt="A doodle sticker" width={300} height={400} rotate={-3} halo={1} style={{ width: 100 }} />
              <Sticker rotate={-7}>
                <span style={{ display: 'inline-block', padding: '.35em .7em', background: 'var(--tomato)', color: 'var(--ink)', font: '800 1.5rem/1 var(--font-display)', borderRadius: 14, lineHeight: 1.1 }}>Websites ready in 72 hours</span>
              </Sticker>
            </div>
            <div className="kit-row" style={{ gap: '44px 34px', marginTop: 36, alignItems: 'flex-start' }}>
              <Polaroid src={asset('/works/contract/thumb.webp')} alt="Proyecto Contract cover" width={720} height={900} caption="the issue" rotate={-3} w="12rem" />
              <Polaroid src={asset('/works/space-monkey/tyler-thumb.webp')} alt="Tyler poster" width={600} height={895} caption="age 13!" rotate={2.5} w="11rem" tape={{ color: 'lagoon', pattern: 'stripes' }} />
              <StickyNote rotate={-3} pin="pin" w="10rem">pick a folder</StickyNote>
              <StickyNote color="bubblegum" rotate={3} pin="tape" w="10rem">my name is on page 3!</StickyNote>
              <div style={{ position: 'relative', width: 170, height: 120, background: 'var(--paper)', color: 'var(--ink)', borderRadius: 4, display: 'grid', placeItems: 'center', padding: 8, textAlign: 'center' }}>
                <PaperClip style={{ position: 'absolute', left: 16, top: -26 }} />
                clipped
              </div>
              <div className="kit-row" style={{ gap: 14 }}>
                <Pin color="tomato" />
                <Pin color="lagoon" size="2.6rem" />
                <Pin color="marigold" />
                <Pin color="ink" />
              </div>
              <div className="kit-row" style={{ gap: 12 }}>
                <PaperClip rotate={-12} />
                <PaperClip color="tomato" rotate={6} />
                <PaperClip color="lagoon" rotate={20} size="3.5rem" />
              </div>
            </div>
          </Stage>
        ))}
      </div>
    </Sec>
  )
}

/* ------------------------------------------------------------------------------------------------ scribbles */
const SCRIBBLES: ScribbleKind[] = ['underline', 'circle', 'arrow', 'burst', 'squiggle', 'tick']

function ScribbleSection() {
  return (
    <Sec id="scribbles" title="Scribble" note="Procedural and seeded: four seeds of each kind. They draw on when scrolled into view.">
      <div className="kit-stages">
        {STAGES.map((tone) => (
          <Stage key={tone} tone={tone}>
            <div style={{ display: 'grid', gap: 26 }}>
              {SCRIBBLES.map((kind) => (
                <div key={kind} className="kit-row" style={{ gap: 26, alignItems: 'center' }}>
                  {[1, 2, 3, 4].map((seed) => (
                    <Scribble key={seed} kind={kind} seed={seed} w={kind === 'underline' ? 150 : undefined} color={tone === 'ink' ? 'var(--marigold)' : tone === 'tomato' ? 'var(--ink)' : tone === 'cream' ? 'var(--ultraviolet)' : 'var(--oxblood)'} draw={seed * 120} />
                  ))}
                </div>
              ))}
            </div>
          </Stage>
        ))}
      </div>
      <Stage tone="cream" label="in context: scribbles over words">
        <p className="t-h2 t-display" style={{ margin: '0 0 2.4rem' }}>
          Hi, I’m <span style={{ position: 'relative', display: 'inline-block' }}>Pau<Scribble kind="circle" ratio={2.6} at="around" color="var(--tomato)" /></span>, I design{' '}
          <span style={{ position: 'relative', display: 'inline-block' }}>brands<Scribble kind="underline" at="under" color="var(--ultraviolet)" /></span>
        </p>
        <div className="kit-row" style={{ alignItems: 'center', gap: 14 }}>
          <span className="t-hand">pick a folder</span>
          <Scribble kind="arrow" dir="down-right" color="var(--ink)" w="5rem" />
        </div>
      </Stage>
    </Sec>
  )
}

/* ------------------------------------------------------------------------------------------------ reveal */
function RevealSection() {
  return (
    <Sec id="reveal" title="Reveal" note="Scroll here: each kind arrives once. Reduced motion and Pause motion show everything at once.">
      <Stage tone="cream">
        <div className="kit-row" style={{ gap: 24 }}>
          {(['rise', 'fade', 'pop', 'drop', 'left', 'right'] as const).map((kind, i) => (
            <Reveal key={kind} kind={kind} delay={i * 80}>
              <Folder tone="marigold" tab={kind} style={{ width: 150 }}>{kind}</Folder>
            </Reveal>
          ))}
        </div>
      </Stage>
    </Sec>
  )
}

/* ------------------------------------------------------------------------------------------------ cinema */
function CinemaSection() {
  return (
    <Sec id="cinema" title="SlateLabel, ColorBars, FilmPerforations, FilmStrip" note="Details, never a theme park.">
      <div className="kit-stages">
        {(['desk', ...STAGES] as StageTone[]).map((tone) => (
          <Stage key={tone} tone={tone}>
            <div style={{ display: 'grid', gap: 28 }}>
              <SlateLabel items={[{ label: 'Role', value: 'Editorial director' }, { label: 'Year', value: '2022–2024' }, { label: 'Tools', value: 'InDesign, Photoshop' }]} />
              <SlateLabel tone="paper" items={[{ label: 'Role', value: 'Brand identity · Logo · Brand manual' }, { label: 'Year', value: '2026' }, { label: 'Tools', value: '' }]} />
              <ColorBars />
              <ColorBars height="2.2rem" compact />
              <FilmPerforations />
              <div className="kit-row" style={{ gap: 40, padding: '1.6rem 2rem', position: 'relative', alignItems: 'center' }}>
                <CropMarks />
                <RegMark />
                <RegMark size="3rem" />
                <span className="t-label">crop + registration marks</span>
              </div>
              <FilmStrip>
                <div style={{ flex: 1, minHeight: 80, display: 'grid', placeItems: 'center', border: '2px solid var(--cream)' }}>frame</div>
                <div style={{ flex: 1, minHeight: 80, display: 'grid', placeItems: 'center', border: '2px solid var(--cream)' }}>frame</div>
                <div style={{ flex: 1, minHeight: 80, display: 'grid', placeItems: 'center', border: '2px solid var(--cream)' }}>frame</div>
              </FilmStrip>
            </div>
          </Stage>
        ))}
      </div>
    </Sec>
  )
}

/* ------------------------------------------------------------------------------------------------ world facts */
function WorldFactsSection() {
  return (
    <Sec id="worldfacts" title="WorldFacts" note="One per work, on its own folder colour. Empty cells are hidden; concept work carries the stamp and the exact line.">
      <div style={{ display: 'grid', gap: 22 }}>
        {WORKS.map((w) => (
          <div key={w.slug} style={{ background: w.color, color: w.ink, borderRadius: 22, padding: 'clamp(16px, 2vw, 30px)' }}>
            <p className="t-label" style={{ margin: '0 0 6px' }}>{w.n} · {w.title}</p>
            <WorldFacts work={w} tone={w.ink.toLowerCase() === '#fff2da' ? 'paper' : 'ink'} />
          </div>
        ))}
      </div>
    </Sec>
  )
}

function Toolbar() {
  const [paused, setPaused] = useState(false)
  const [last, setLast] = useState('none yet')
  useEffect(() => {
    const on = (e: Event) => setLast(String((e as CustomEvent<string>).detail))
    window.addEventListener('pm:filter', on)
    return () => window.removeEventListener('pm:filter', on)
  }, [])
  return (
    <div className="kit__bar">
      <TabButton
        size="sm"
        tone={paused ? 'marigold' : 'cream'}
        aria-pressed={paused}
        onClick={() => {
          const next = !paused
          setPaused(next)
          if (next) document.documentElement.setAttribute('data-motion', 'paused')
          else document.documentElement.removeAttribute('data-motion')
        }}
      >
        {paused ? 'Motion paused' : 'Pause motion'}
      </TabButton>
      <span className="t-label" id="kit-last-filter">pm:filter → {last}</span>
    </div>
  )
}

/* ------------------------------------------------------------------------------------------------ edge cases */
function EdgeSection() {
  return (
    <Sec id="edge" title="Edge cases" note="Long labels, narrow boxes, wrapping: what the primitives do when content is not polite.">
      <Stage tone="cream">
        <div className="kit-row" style={{ gap: 28 }}>
          <Folder tone="marigold" tab="A very long folder tab label that cannot fit" count={12} style={{ width: 200 }}>narrow 200px, long tab</Folder>
          <Folder tone="lagoon" tab="Tiny" tabX={0.5} style={{ width: 90 }}>90px</Folder>
          <Folder tone="bubblegum" tab="Flush right" tabX={1} style={{ width: 160 }}>tabX = 1</Folder>
          <Folder tone="olive" style={{ width: 160, minHeight: 40 }}>no tab, short</Folder>
          <Folder tone="lilac" tab="Tall" style={{ width: 160 }}>
            <span style={{ display: 'block', height: 220 }}>a tall body</span>
          </Folder>
        </div>
        <div className="kit-row" style={{ gap: 18, marginTop: 30 }}>
          <TabButton tone="tomato" style={{ maxWidth: 200 }}>A button with a long label that has to wrap or clip</TabButton>
          <TabButton tone="ink" size="sm" count={128}>Count 128</TabButton>
          <TabButton tone="ultraviolet" icon="cross" shoulders={false}>No shoulders</TabButton>
        </div>
        <div className="kit-row" style={{ gap: 26, marginTop: 34 }}>
          <Ticket href="#edge" external={false} label="A ticket label that is much longer than any domain name should be, to test wrapping" style={{ maxWidth: 340 }} />
          <Stamp text="Extraordinarily long" sub="and a longer second line too" />
          <Stamp text="Round long label here" ring="A very long ring text that needs to be repeated or squeezed" />
        </div>
      </Stage>
      <Stage tone="ink">
        <StrokeWord text="A VERY LONG SENTENCE OF OUTLINE LETTERING THAT MUST SHRINK INTO ITS BOX" size="9vw" style={{ color: 'var(--marigold)' }} />
        <div style={{ width: 'min(100%, 260px)', marginTop: 26 }}>
          <StrokeWord text="NARROW" size="9vw" style={{ color: 'var(--cream)' }} />
        </div>
        <div style={{ marginTop: 26 }}>
          <StrokeWord text="Ñandú Café ÀÉÎ" size="7vw" style={{ color: 'var(--bubblegum)' }} />
        </div>
      </Stage>
      <Stage tone="marigold">
        <SlateLabel items={[{ label: 'Role', value: 'Brand identity, logo, brand manual, art direction, packaging, web layout and print files' }, { label: 'Year', value: '2019–2026' }, { label: 'Tools', value: 'Supercalifragilisticexpialidocious-and-more' }]} />
      </Stage>
    </Sec>
  )
}

export function KitGallery() {
  return (
    <div className="kit">
      <header className="kit__head">
        <h1>Primitives kit</h1>
        <p>Dev-only gallery of src/components/primitives. Every object on every surface.</p>
      </header>
      <Toolbar />
      <ul className="kit__nav">
        {['folders', 'tabbuttons', 'strokewords', 'sheets', 'stamps', 'tickets', 'objects', 'scribbles', 'reveal', 'cinema', 'worldfacts', 'edge'].map((id) => (
          <li key={id}>
            <a href={`#${id}`}>{id}</a>
          </li>
        ))}
      </ul>
      <FolderSection />
      <TabButtonSection />
      <StrokeSection />
      <SheetSection />
      <StampSection />
      <TicketSection />
      <ObjectsSection />
      <ScribbleSection />
      <RevealSection />
      <CinemaSection />
      <WorldFactsSection />
      <EdgeSection />
      <FilmPerforations style={{ marginTop: 40 }} tone="cream" />
    </div>
  )
}
