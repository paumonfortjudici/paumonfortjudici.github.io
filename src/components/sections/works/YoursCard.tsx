// The last card: "Next folder: yours?". A blank manila folder outlined in a hand-drawn dashed pencil line. It has the same anatomy as
// the others (a peek, a print, a text row) but every part is empty: a dashed peek with a question mark, an empty graphic frame where
// the print goes (a box with a cross through it, the way InDesign draws a frame with no picture in it) that holds the pencil question,
// and one real call to action, the Contact tab, which scrolls to #contact.

import { motion, type Variants } from 'framer-motion'
import { useEffect, type CSSProperties, type MouseEvent } from 'react'
import { ArrowIcon, Folder, Scribble } from '@/components/primitives'
import { WORKS_SECTION } from '@/lib/copy'
import { spring } from '@/lib/motion'
import { scrollToSection } from '@/lib/router'
import { loadHandFonts } from '@/styles/fonts'
import { POSES, YOURS, type Cell } from './data'
import { WORKS_UI } from './strings'

/** a folder lands when it is 90px short of the fold: the peek and the tab are seen arriving, and a short viewport (a 768px laptop) never shows a blank band under the rail */
const LAND_MARGIN = '0px 0px 90px 0px'

interface Ctx {
  dy: number
  rot: number
  delay: number
}

const variants: Variants = {
  hidden: (c: Ctx) => ({ opacity: 0, y: c.dy + 46, rotate: c.rot + 2.6, scale: 0.97 }),
  in: (c: Ctx) => ({ opacity: 1, y: c.dy, rotate: c.rot, scale: 1, transition: { ...spring.folder, delay: c.delay } }),
  out: (c: Ctx) => ({ opacity: 0, scale: 0.9, y: c.dy + 10, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }),
}

const HOVER = { type: 'spring', stiffness: 340, damping: 17, mass: 0.8 } as const
const PRESS = { type: 'spring', stiffness: 520, damping: 30 } as const

interface YoursCardProps {
  cell: Cell
  still: boolean
  flat: boolean
}

export function YoursCard({ cell, still, flat }: YoursCardProps) {
  // the pencil lettering is the thin hand face: the app asks for it when the browser is idle, this makes sure it is on its way (idempotent)
  useEffect(() => {
    void loadHandFonts()
  }, [])
  const base = POSES[YOURS]
  const pose = flat ? { ...base, dy: 0, rot: 0 } : base
  const { title, text, cta } = WORKS_SECTION.lastCard
  // "Next folder: yours?" is written across the tab and the folder: the tab says "Next folder:", the folder asks "yours?"
  const colon = title.indexOf(': ')
  const lead = colon > -1 ? title.slice(0, colon + 1) : title
  const ask = colon > -1 ? title.slice(colon + 2) : ''

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    scrollToSection('contact')
  }

  const ctx: Ctx = { dy: pose.dy, rot: pose.rot, delay: 0.12 }
  const hover = still ? undefined : { y: pose.dy - 14, rotate: pose.rot * 0.25, transition: HOVER }
  // pressing pushes the lifted folder back down: the click answers at once, before the shell has opened the folder
  const press = still ? undefined : { y: pose.dy - 3, scale: 0.988, transition: PRESS }
  const motionProps = still
    ? ({ initial: false } as const)
    : ({
        variants,
        custom: ctx,
        initial: 'hidden',
        whileInView: 'in',
        viewport: { once: true, margin: LAND_MARGIN },
        exit: 'out',
      } as const)

  return (
    <Folder
      as={motion.a}
      href="#contact"
      className="pm-wk-card pm-wk-yours"
      dashed
      color="var(--manila)"
      ink="var(--ink-3)"
      tab={<span className="pm-wk-tabtext">{lead}</span>}
      tabX={pose.tabX}
      // `y` and `rotate` are framer-motion style values (not CSS properties): the Folder's typing only knows CSSProperties
      style={{ '--fc': 'var(--manila)', '--fi': 'var(--ink-3)', y: pose.dy, rotate: pose.rot } as unknown as CSSProperties}
      aria-label={WORKS_UI.yoursLabel}
      data-cursor="Open"
      data-slug={YOURS}
      data-kind={cell.kind}
      onClick={onClick}
      // the pointer lifts the folder with a spring; keyboard focus lifts it in CSS (:focus-visible), so a folder that gets focus back after a
      // mouse click or a tap does not stay raised
      whileHover={hover}
      whileTap={press}
      {...motionProps}
    >
      <span className="pm-wk-ghostpeek" aria-hidden="true">
        <span className="pm-wk-ghostpeek__q">?</span>
      </span>
      <span className="pm-wk-yours__main">
        <span className="pm-wk-yours__slot">
          {/* the empty graphic frame: a box with a cross through it */}
          <svg className="pm-wk-yours__frame" viewBox="0 0 80 100" preserveAspectRatio="none" fill="none" aria-hidden="true" focusable="false">
            <rect x="1" y="1" width="78" height="98" rx="1.5" />
            <path d="M1 1L79 99M79 1L1 99" />
          </svg>
          {/* a pencil smiley: the contact sheet signs off with ":)" too */}
          <svg className="pm-wk-yours__smile" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            <path d="M42 6C60 5 75 21 74 40C73 60 57 75 38 74C19 73 5 58 6 39C7 20 23 7 44 6C47 5 49 6 51 7" />
            <path d="M28 29C27 33 28 37 29 41" />
            <path d="M53 28C52 32 53 36 54 40" />
            <path d="M21 50C29 64 49 67 61 49" />
          </svg>
        </span>
        <span className="pm-wk-yours__side">
          <span className="pm-wk-yours__words">
            <span className="pm-wk-yours__ask">{ask}</span>
            <span className="pm-wk-yours__text">{text}</span>
          </span>
          <span className="pm-wk-yours__foot">
            <Scribble kind="arrow" dir="right" color="var(--pencil)" w="11cqw" seed="yours" stroke={3} className="pm-wk-yours__arrow" />
            <span className="pm-tabbtn pm-wk-yours__cta" data-size="md" aria-hidden="true">
              <span className="pm-tabbtn__label">{cta}</span>
              <ArrowIcon dir="right" className="pm-tabbtn__icon" />
            </span>
          </span>
        </span>
      </span>
    </Folder>
  )
}
