// The drawer note. On the short drawers (Editorial, Web, Print) the last row of the cabinet would leave blank paper beside the folders. A sticky
// note takes one of those gaps and does a job: it says how many folders this drawer holds (the number is circled in pencil) and its tab brings
// the other drawers back ("Show all 10"). It is not a folder (no link, no layoutId), so it only lands and leaves. Hidden below 1100px, where
// the grid is 2 columns and there is no gap to fill (CSS).

import { motion, type Variants } from 'framer-motion'
import { useEffect, type CSSProperties } from 'react'
import { Scribble, StickyNote, TabButton } from '@/components/primitives'
import { spring } from '@/lib/motion'
import { loadHandFonts } from '@/styles/fonts'
import { NOTE, POSES, type Cell } from './data'
import { WORKS_UI } from './strings'

/** a folder lands when it is 90px short of the fold: the peek and the tab are seen arriving, and a short viewport (a 768px laptop) never shows a blank band under the rail */
const LAND_MARGIN = '0px 0px 90px 0px'

interface Ctx {
  dy: number
  rot: number
  delay: number
}

const variants: Variants = {
  hidden: (c: Ctx) => ({ opacity: 0, y: c.dy + 40, rotate: c.rot + 2, scale: 0.97 }),
  in: (c: Ctx) => ({ opacity: 1, y: c.dy, rotate: c.rot, scale: 1, transition: { ...spring.folder, delay: c.delay } }),
  out: (c: Ctx) => ({ opacity: 0, scale: 0.92, y: c.dy + 8, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }),
}

interface NoteCardProps {
  cell: Cell
  /** folders on show, the registry total and the name of the drawer ("Web") */
  shown: number
  total: number
  drawer: string
  /** brings every folder back */
  onAll: () => void
  still: boolean
}

export function NoteCard({ cell, shown, total, drawer, onAll, still }: NoteCardProps) {
  // the note is written in the marker face: the app asks for it when the browser is idle, this makes sure it is on its way (idempotent)
  useEffect(() => {
    void loadHandFonts()
  }, [])
  const pose = POSES[NOTE]
  const ctx: Ctx = { dy: pose.dy, rot: pose.rot, delay: 0.1 }
  const motionProps = still
    ? ({ initial: false } as const)
    : ({ variants, custom: ctx, initial: 'hidden', whileInView: 'in', viewport: { once: true, margin: LAND_MARGIN }, exit: 'out' } as const)

  return (
    <motion.div
      className="pm-wk-notewrap"
      data-kind={cell.kind}
      role="group"
      aria-label={WORKS_UI.note.plain(shown, total, drawer)}
      // `y` and `rotate` are framer-motion style values (not CSS properties)
      style={{ y: pose.dy, rotate: pose.rot } as unknown as CSSProperties}
      {...motionProps}
    >
      <StickyNote color="butter" rotate={0} pin="tape" w="100%" className="pm-wk-note">
        <p className="pm-wk-note__title" aria-hidden="true">
          {WORKS_UI.note.before}
          <span className="pm-wk-note__n">
            {shown}
            <Scribble kind="circle" at="around" color="var(--tomato)" seed={`note-${drawer}`} stroke={3.4} />
          </span>
          {WORKS_UI.note.after(total, drawer)}
        </p>
        <p className="pm-wk-note__body" aria-hidden="true">
          {WORKS_UI.note.body}
        </p>
        <TabButton tone="ink" size="md" icon="arrow-right" aria-label={WORKS_UI.note.buttonLabel(total)} className="pm-wk-note__btn" onClick={onAll}>
          {WORKS_UI.note.button(total)}
        </TabButton>
      </StickyNote>
    </motion.div>
  )
}
