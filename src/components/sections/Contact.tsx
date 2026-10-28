// 06 Contact. The template's stack of three overlapping folders, kept and enriched:
//   folder 1 (ink)      "Folder 11 · yours": the giant outline LET'S TALK :) and the invitation (the next folder in the cabinet is yours)
//   folder 2 (marigold) both e-mail addresses, each on a ruled line with COPY and WRITE tabs standing on it
//   folder 3 (cream)    five ticket stubs: WhatsApp, Plana Digital, Instagram, GitHub, the book
// plus a taped business card (the Plana Digital e-mail signature, lazy chunk) poking out of the stack, and a strip of film leader
// with Barcelona / Sydney clocks and the hours when both of us are at work (./contact/TimeZones).
// Behaviour and API: docs/api/sections-contact.md

import { Component, lazy, Suspense, useEffect, useRef, useState, type CSSProperties, type ErrorInfo, type ReactNode, type RefObject } from 'react'
import { Folder, Reveal, Scribble, Sheet, StrokeWord, TabButton, Ticket, type ToneName } from '../primitives'
import { toast } from '../chrome/toast'
import { CONTACT } from '../../lib/copy'
import { useCopy, useInView, useMediaQuery } from '../../lib/hooks'
import { layoutLetters, UNITS_PER_EM } from '../../lib/lettering/layout'
import { Glyph, type GlyphName } from './contact/glyphs'
import TimeZones from './contact/TimeZones'
import './contact.css'

// The business card is its own chunk (it brings Plana's three faces with it): it loads when the section is about to be seen.
const loadCard = () => import('./contact/SignatureCard')
const SignatureCard = lazy(loadCard)

// Words that are not in COPY.md (added for this section).
const TEXT = {
  /** the Works sheet ends with "Next folder: yours?": this is that folder (a middle dot, not a dash) */
  tabTalk: 'Folder 11 · yours',
  tabMail: 'Email',
  tabElse: 'Elsewhere',
  phraseLabel: 'Let’s talk',
  /** handwritten note beside the paragraph: two beats, so it can stack on narrow folders */
  note: ['no forms,', 'just write'],
  mailHeading: 'Email addresses',
  elseHeading: 'Other places to find me',
  second: 'At Plana Digital',
  copyFailed: 'Couldn’t copy it automatically. The address is selected, so copy it from your keyboard.',
} as const

// LET'S / TALK :) on two lines. The word is sized to a share of the folder (--ct-word, a container-query length set in
// contact.css): its width in em is measured from the same layout StrokeWord uses, so it fills exactly that share at any width.
const PHRASE = CONTACT.phrase.replace(' ', '\n')
const K_PHRASE = layoutLetters(PHRASE, { tracking: 0.03 }).vb.w / UNITS_PER_EM
const PHRASE_SIZE = `calc(var(--ct-word) / ${K_PHRASE.toFixed(3)})`

// the paragraph is COPY.md's own words; only a no-break space goes in front of its dash, so a line never starts with "—"
const NBSP = String.fromCharCode(160)
const PARAGRAPH = CONTACT.paragraph.replace(' — ', `${NBSP}— `)

/** "https://www.amazon.com/dp/B0H…" becomes "amazon.com" */
const hostOf = (href: string): string => {
  try {
    return new URL(href).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

/** a phone number is one word: "+34 697 512 / 258" must never wrap (no-break spaces); anything else is left alone */
const keepTogether = (value: string): string => (/^[+\d\s]+$/.test(value) ? value.replace(/\s/g, NBSP) : value)

// one colourway per ticket, in the order of CONTACT.links (WhatsApp, Plana Digital, Instagram, GitHub, the book)
const TICKETS: readonly { glyph: GlyphName; tone: ToneName; stub: ToneName; rotate: number }[] = [
  { glyph: 'chat', tone: 'butter', stub: 'pine', rotate: -1.4 },
  { glyph: 'sunrise', tone: 'pine', stub: 'marigold', rotate: 1.1 },
  { glyph: 'devil', tone: 'bubblegum', stub: 'oxblood', rotate: -0.9 },
  { glyph: 'branch', tone: 'ink', stub: 'lilac', rotate: 1.3 },
  { glyph: 'lens', tone: 'oxblood', stub: 'butter', rotate: -1.2 },
]

/** the business card (a lazy chunk) and the time strip must never take the whole page down with them: if one fails, it simply is not there */
class QuietBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(_error: Error, _info: ErrorInfo) {
    /* both are extras: the contact details above them do not depend on either */
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

function selectText(el: HTMLElement | null): void {
  if (!el) return
  const selection = window.getSelection()
  if (!selection) return
  const range = document.createRange()
  range.selectNodeContents(el)
  selection.removeAllRanges()
  selection.addRange(range)
}

interface CopyTabProps {
  text: string
  size: 'sm' | 'md'
  tone: ToneName
  target: RefObject<HTMLElement>
}

/** COPY: a tab. The label swaps to "Copied" (both words are laid out, so the tab never changes width), the site toast speaks. */
function CopyTab({ text, size, tone, target }: CopyTabProps) {
  const { copied, copy } = useCopy(text)
  const [takes, setTakes] = useState(0)
  const onClick = async () => {
    const ok = await copy()
    if (ok) {
      toast(CONTACT.toast)
      setTakes((n) => n + 1)
    } else {
      // both clipboard routes refused: select the address so the keyboard can finish the job, and say so
      selectText(target.current)
      toast(TEXT.copyFailed, { duration: 4600 })
    }
  }
  return (
    <span className="pm-ct-copy">
      <TabButton tone={tone} size={size} cursor="Copy" aria-label={`Copy ${text}`} onClick={onClick}>
        <span className="pm-ct-swap">
          <span data-on={copied ? undefined : ''}>{CONTACT.emailActions.copy}</span>
          <span data-on={copied ? '' : undefined} aria-hidden="true">
            {CONTACT.emailActions.copied}
          </span>
        </span>
      </TabButton>
      {/* a slate card slides out of the folder for a moment: every copy is a new take (the toast speaks for screen readers) */}
      {copied && takes > 0 && (
        <span className="pm-ct-take" key={takes} aria-hidden="true">
          <span className="pm-ct-take__bar" />
          Take {takes} · {CONTACT.emailActions.copied}
        </span>
      )}
    </span>
  )
}

/** one ruled line of the e-mail folder: the address, and the tabs that stand on the rule */
function MailRow({ address, main }: { address: string; main?: boolean }) {
  const addr = useRef<HTMLAnchorElement | null>(null)
  const at = address.indexOf('@')
  return (
    <div className="pm-ct-mail__row" data-main={main ? '' : undefined}>
      <div className="pm-ct-mail__who">
        {!main && <span className="pm-ct-mail__kicker">{TEXT.second}</span>}
        {/* the WRITE tab is the keyboard way in: the big address stays clickable for the mouse without a second tab stop */}
        <a ref={addr} className="pm-ct-mail__addr" href={`mailto:${address}`} target="_blank" rel="noopener noreferrer" tabIndex={-1} translate="no" data-cursor="Open">
          {address.slice(0, at)}
          <wbr />
          {address.slice(at)}
        </a>
      </div>
      <div className="pm-ct-mail__acts">
        <CopyTab text={address} size={main ? 'md' : 'sm'} tone="ink" target={addr} />
        <TabButton href={`mailto:${address}`} target="_blank" rel="noopener noreferrer" tone="paper" size={main ? 'md' : 'sm'} icon="arrow-up-right" cursor="Open" aria-label={`Write an email to ${address}`}>
          {CONTACT.emailActions.write}
        </TabButton>
      </div>
    </div>
  )
}

export function Contact() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const near = useInView(sectionRef, { once: true, rootMargin: '2000px 0px' })

  // the card's code (not its fonts: those start only when the card is mounted) is fetched while the browser is idle, so that on arrival
  // (a deep link, a fast scroll, a slow line) the card does not have a hole to wait in
  useEffect(() => {
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback
    const id = idle ? idle(() => void loadCard().catch(() => undefined), { timeout: 4000 }) : window.setTimeout(() => void loadCard().catch(() => undefined), 2500)
    return () => {
      if (!idle) window.clearTimeout(id)
    }
  }, [])

  // keyboard order follows what the eye sees: from 1180px the card lies top right (so it comes right after the heading, before the
  // folders); below that it lies under the tickets and is the last stop of the sheet
  const wide = useMediaQuery('(min-width: 1180px)')
  const cardSlot = (
    <div className="pm-ct-cardslot">
      <QuietBoundary>
        <Suspense fallback={null}>{near && <SignatureCard />}</Suspense>
      </QuietBoundary>
    </div>
  )

  return (
    <Sheet ref={sectionRef} id="contact" tone="tomato" page="Contact" n={6} className="pm-ct" aria-labelledby="contact-title">
      <div className="pm-ct-stage">
        <header className="pm-ct-head">
          <div className="pm-ct-head__word">
            <StrokeWord as="h2" id="contact-title" text={CONTACT.strokeWord} fill="tint" style={{ color: 'var(--ink)' }} />
            <Scribble kind="underline" at="under" color="var(--cream)" stroke={5} seed="contact" draw={900} />
          </div>
        </header>

        <div className="pm-ct-stack">
          {wide && cardSlot}
          <Reveal kind="drop" className="pm-ct-slot pm-ct-slot--pad">
            <Folder tone="ink" tab={TEXT.tabTalk} tabX={0.035} className="pm-ct-folder" bodyClassName="pm-ct-talk">
              <StrokeWord
                className="pm-ct-phrase"
                as="h3"
                text={PHRASE}
                label={TEXT.phraseLabel}
                size={PHRASE_SIZE}
                fill="tint"
                shadow="var(--tomato)"
                style={{ color: 'var(--cream)' }}
              />
              <div className="pm-ct-talk__row">
                <p className="pm-ct-talk__p t-lead">{PARAGRAPH}</p>
                {/* the note points down at the WRITE tab of the next folder */}
                <div className="pm-ct-talk__note">
                  <p className="pm-ct-hand">
                    <span>{TEXT.note[0]}</span> <span>{TEXT.note[1]}</span>
                  </p>
                  <span className="pm-ct-arrow">
                    <Scribble kind="arrow" dir="down" color="var(--marigold)" w="var(--aw)" stroke={4} seed="write" draw={500} />
                  </span>
                </div>
              </div>
            </Folder>
          </Reveal>

          <Reveal kind="drop" delay={110} className="pm-ct-slot pm-ct-slot--pad">
            <Folder tone="marigold" tab={TEXT.tabMail} tabX={0.3} className="pm-ct-folder" bodyClassName="pm-ct-mail">
              <h3 className="pm-sr">{TEXT.mailHeading}</h3>
              <MailRow address={CONTACT.email} main />
              <MailRow address={CONTACT.emailSecond} />
            </Folder>
          </Reveal>

          <Reveal kind="drop" delay={220} className="pm-ct-slot">
            <Folder tone="cream" tab={TEXT.tabElse} tabX={0.62} className="pm-ct-folder" bodyClassName="pm-ct-else">
              <h3 className="pm-sr">{TEXT.elseHeading}</h3>
              <ul className="pm-ct-tix">
                {CONTACT.links.map((link, i) => {
                  const t = TICKETS[i % TICKETS.length]
                  return (
                    // the tilt is a CSS variable of the item (not the primitive's inline `rotate`), so the phone layout can flatten it
                    <li className="pm-ct-tix__item" key={link.label} style={{ '--tilt': `${t.rotate}deg` } as CSSProperties}>
                      <Reveal kind="pop" delay={i * 70}>
                        {/* names and handles are never translated by a browser's auto-translate */}
                        <Ticket
                          href={link.href}
                          label={keepTogether(link.value)}
                          kicker={
                            <span className="pm-ct-kick">
                              <Glyph name={t.glyph} className="pm-ct-kick__glyph" />
                              {link.label}
                              {/* where the stub really goes, in mono: the link target is never a surprise */}
                              {!link.value.includes(hostOf(link.href)) && <span className="pm-ct-kick__host">{hostOf(link.href)}</span>}
                            </span>
                          }
                          tone={t.tone}
                          stub={t.stub}
                          translate="no"
                          aria-label={`${link.label}: ${link.value} (opens in a new tab)`}
                        />
                      </Reveal>
                    </li>
                  )
                })}
              </ul>
            </Folder>
          </Reveal>

          {!wide && cardSlot}
        </div>

        <QuietBoundary>
          <TimeZones />
        </QuietBoundary>
      </div>
    </Sheet>
  )
}

export default Contact
