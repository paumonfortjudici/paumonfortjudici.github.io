// 03 About: the marigold sheet. Heading, greeting and words on the left; the animated portrait (a perforated slide mount in an ink
// folder, scrubbed by the pointer) on the right; then the career drawn from real dates on a ruler, and the small print
// (education, certificates, links as tickets). All copy is from src/lib/copy.ts (ABOUT) and ./about/text.ts. Docs: docs/api/sections-about.md
import type { ReactNode } from 'react'
import { ABOUT } from '../../lib/copy'
import { Reveal, Scribble, Sheet, StrokeWord } from '../primitives'
import CareerTimeline from './about/CareerTimeline'
import Credentials, { Education } from './about/Credentials'
import Portrait from './about/Portrait'
import Skills from './about/Skills'
import { honest } from './about/text'
import { useNarrow } from './about/useNarrow'
import './about.css'

/** words of the paragraph set in the italic twin (each must exist in the copy, otherwise it is simply not styled) */
const ITALICS = ['posters', 'Sydney', 'click, scroll and live in']

/**
 * Typesetting: short words stay with the word that follows them and a few pairs never split, so no line ends on "a", "In" or "lay"
 * (a no-break space is read as a space by screen readers). It runs on text chunks only, after the italic phrases have been found.
 */
const NBSP = String.fromCharCode(160)
/** zero-width and never a break: keeps a year range such as 2025–26 on one line (the en dash would otherwise allow a break after it) */
const WORD_JOINER = String.fromCharCode(0x2060)
const SHORT_WORD = /\b(a|A|I|In|in|as|to|of|on|at|by|or|so)\s+(?=\S)/g
const YEAR_RANGE = /(\d{4})–(\d{2})\s+/g
const bind = (text: string): string =>
  text.replace(SHORT_WORD, `$1${NBSP}`).replace(YEAR_RANGE, `$1–${WORD_JOINER}$2 `)

function emphasise(text: string): ReactNode[] {
  let nodes: ReactNode[] = [text]
  for (const phrase of ITALICS) {
    const next: ReactNode[] = []
    nodes.forEach((part, i) => {
      if (typeof part !== 'string') {
        next.push(part)
        return
      }
      const chunks = part.split(phrase)
      chunks.forEach((chunk, j) => {
        next.push(chunk)
        if (j < chunks.length - 1)
          next.push(
            <em className="pm-ab-em" data-long={phrase.includes(' ') ? '' : undefined} key={`${phrase}-${i}-${j}`}>
              {phrase}
            </em>,
          )
      })
    })
    nodes = next
  }
  return nodes.map((node) => (typeof node === 'string' ? bind(node) : node))
}

/**
 * The paragraph in copy.ts joins two thoughts with a dash (`never really stopped, dash, now I design`). The page has a budget of two em dashes
 * and the voice rule is short sentences, so this section sets it as two sentences. If copy.ts changes, this is a no-op.
 */
function sentences(text: string): string {
  return honest(text).replace(new RegExp(' ' + String.fromCharCode(0x2014) + ' ([a-z])'), (_all, letter: string) => '. ' + letter.toUpperCase())
}

/** the first sentence is the standfirst, the rest is the body */
function splitParagraph(text: string): { lead: string; rest: string } {
  const cut = text.indexOf('. ')
  return cut === -1 ? { lead: text, rest: '' } : { lead: text.slice(0, cut + 1), rest: text.slice(cut + 2) }
}

export function About() {
  const narrow = useNarrow()
  const { lead, rest } = splitParagraph(ABOUT.paragraph)
  const cut = ABOUT.greeting.lastIndexOf(' ')
  const hiFirst = ABOUT.greeting.slice(0, cut + 1)
  const hiLast = ABOUT.greeting.slice(cut + 1)

  return (
    <Sheet id="about" tone="marigold" page="About" n={3} aria-labelledby="about-title" className="pm-about">
      <div className="pm-ab-grid">
        <header className="pm-ab-head">
          <StrokeWord text={ABOUT.ghost} ghost size="clamp(2.8rem, 5.2vw, 6.8rem)" className="pm-ab-ghost" style={{ color: 'var(--on-sheet)' }} />
          <StrokeWord
            as="h2"
            id="about-title"
            text={ABOUT.strokeWord}
            size="clamp(4.2rem, 10.6vw, 15rem)"
            stack="mobile"
            stackSize="min(23vw, 7.6rem)"
            fill="tint"
            shadow="var(--tomato)"
            style={{ color: 'var(--on-sheet)' }}
          />
        </header>

        <div className="pm-ab-intro">
          <div className="pm-ab-hello">
            <h3 className="pm-ab-hi">
              {hiFirst}
              <span className="pm-ab-hi__last">
                {hiLast}
                <Scribble kind="underline" at="under" color="oxblood" stroke={5} seed="pm-hi" draw={500} />
              </span>
            </h3>
            <p className="pm-ab-name t-accent">{ABOUT.greetingSmall}</p>
          </div>

          <Reveal className="pm-ab-copy">
            <p className="pm-ab-lead">{bind(honest(lead))}</p>
            {rest && <p className="pm-ab-body t-body">{emphasise(sentences(rest))}</p>}
          </Reveal>
        </div>

        <div className="pm-ab-skillswrap">
          <Skills />
        </div>

        <div className="pm-ab-cell">
          <Portrait />
          {!narrow && <Education variant="cell" />}
        </div>
      </div>

      <CareerTimeline />
      <Credentials />
    </Sheet>
  )
}

export default About
