// The career as data: real dates only (ART_DIRECTION section 9). Positions on the ruler are derived from them, never typed by hand.
// A date is a fraction of a year: a start is the START of its month (Oct 2019 = 2019.75), an end is the END of its month.

import { ABOUT } from '../../../lib/copy'
import { workBySlug, WORKS, type WorkMeta } from '../../../lib/works'
import type { ToneName } from '../../primitives'
import { CV, PROJECT_NOTES } from './text'

export const AXIS_START = 2013

const today = new Date()
/** "now" as a fraction of a year (the bar of a job that is still running ends here) */
export const NOW = today.getFullYear() + today.getMonth() / 12 + (today.getDate() - 1) / 365
/** the ruler runs to the end of the current year (2026 today), and grows by itself when the year turns */
export const AXIS_END = Math.max(2027, Math.ceil(NOW))
export const SPAN = AXIS_END - AXIS_START
export const YEARS: number[] = Array.from({ length: SPAN }, (_, i) => AXIS_START + i)

/** a date as a percentage of the ruler */
export const pct = (yearFraction: number): number => ((yearFraction - AXIS_START) / SPAN) * 100

const monthStart = (year: number, month: number): number => year + (month - 1) / 12
const monthEnd = (year: number, month: number): number => year + month / 12

export interface Job {
  id: string
  /** from src/lib/copy.ts so the two never drift apart */
  role: string
  place: string
  /** the CV line */
  text: string
  from: number
  to: number
  /** machine-readable dates for <time> */
  fromIso: string
  toIso: string | null
  /** what the visitor reads */
  fromLabel: string
  toLabel: string
  ongoing: boolean
  tone: ToneName
  /** a folder this job produced (opens that world) */
  folder?: { slug: string; label: string; aria: string }
  /** reel number: the credits and the clips share it (I, II ...), so a clip too short for words can still be found */
  numeral: string
  /** the clip's name: full (inside a long clip), short (outside a short one) and tiny (outside, on a narrow chart) */
  company: string
  shortCompany: string
  tinyCompany: string
  /** which track of the timeline the clip lives on (0 = bottom). Clips share a track only when they do not overlap in time */
  track: number
  /** a clip too short to hold words is labelled outside, on the side that has more free track */
  label: 'in' | 'left' | 'right'
  /** another job was already running when this one began (true for every clip above track 0): the film shows the overlap */
  overlaps: boolean
  /** the years the overlap lasts (first and last calendar year), when `overlaps` */
  overlapYears: [number, number] | null
}

const copyJobs = ABOUT.timeline.items
/** a missing entry in copy.ts must never take the whole page down: it shows as an empty credit instead */
const copyJob = (i: number): { role: string; place: string } => copyJobs[i] ?? { role: '', place: '' }

type JobDef = Omit<Job, 'numeral' | 'track' | 'label' | 'overlaps' | 'overlapYears' | 'company' | 'shortCompany' | 'tinyCompany'> & { shortCompany?: string; tinyCompany?: string }

const JOB_DEFS: readonly JobDef[] = [
  {
    id: 'connecor',
    role: copyJob(0).role,
    place: copyJob(0).place,
    text: CV.connecor,
    from: monthStart(2019, 10),
    to: monthEnd(2024, 11),
    fromIso: '2019-10',
    toIso: '2024-11',
    fromLabel: 'Oct 2019',
    toLabel: 'Nov 2024',
    ongoing: false,
    tone: 'lagoon',
  },
  {
    id: 'casual',
    role: copyJob(1).role,
    place: copyJob(1).place,
    text: CV.casual,
    from: monthStart(2022, 5),
    to: monthEnd(2024, 11),
    fromIso: '2022-05',
    toIso: '2024-11',
    fromLabel: 'May 2022',
    toLabel: 'Nov 2024',
    ongoing: false,
    tone: 'tomato',
    folder: { slug: 'contract', label: 'Proyecto Contract', aria: 'Open the folder: Proyecto Contract, the magazine published by Casual Magazines' },
  },
  {
    id: 'fourmation',
    role: copyJob(2).role,
    place: copyJob(2).place,
    text: CV.fourmation,
    from: monthStart(2025, 7),
    to: monthEnd(2026, 2),
    fromIso: '2025-07',
    toIso: '2026-02',
    fromLabel: 'Jul 2025',
    toLabel: 'Feb 2026',
    ongoing: false,
    tone: 'ultraviolet',
    shortCompany: '4mation',
  },
  {
    id: 'plana',
    role: copyJob(3).role,
    place: copyJob(3).place,
    text: CV.plana,
    from: monthStart(2026, 1),
    to: Math.max(NOW, monthStart(2026, 1) + 0.1),
    fromIso: '2026',
    toIso: null,
    fromLabel: '2026',
    toLabel: 'Now',
    ongoing: true,
    tone: 'pine',
    shortCompany: 'Plana Digital',
    tinyCompany: 'Plana',
  },
]

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'] as const
/** a clip at least this long (years) holds its words; a shorter one is labelled outside */
const WORDS_FIT = 2

/** first-fit packing: a clip goes on the lowest track whose last clip has ended, so overlaps are drawn as overlaps (stacked tracks) */
function pack(jobs: readonly JobDef[]): { track: number; label: Job['label'] }[] {
  const lastEnd: number[] = []
  const firstStart: number[] = []
  const track = jobs.map((job) => {
    let t = lastEnd.findIndex((end) => end <= job.from + 1e-6)
    if (t === -1) t = lastEnd.length
    lastEnd[t] = job.to
    firstStart[t] = Math.min(firstStart[t] ?? Infinity, job.from)
    return t
  })
  return jobs.map((job, i) => {
    if (job.to - job.from >= WORDS_FIT) return { track: track[i], label: 'in' as const }
    // free track on each side of this clip (to the neighbours on the same track, or to the ends of the ruler)
    const mates = jobs.filter((_, j) => j !== i && track[j] === track[i])
    const before = mates.filter((o) => o.to <= job.from + 1e-6).reduce((m, o) => Math.max(m, o.to), AXIS_START)
    const after = mates.filter((o) => o.from >= job.to - 1e-6).reduce((m, o) => Math.min(m, o.from), AXIS_END)
    return { track: track[i], label: after - job.to >= job.from - before ? ('right' as const) : ('left' as const) }
  })
}

const PACKED = pack(JOB_DEFS)

export const JOBS: readonly Job[] = JOB_DEFS.map((def, i) => {
  const company = def.place.split(',')[0]
  const shortCompany = def.shortCompany ?? company
  // by the CV dates: an earlier-starting job was still running when this one began
  const earlier = JOB_DEFS.filter((other, j) => j !== i && other.from <= def.from && other.to > def.from + 1e-6)
  const overlaps = earlier.length > 0
  const until = overlaps ? Math.min(def.to, ...earlier.map((other) => other.to)) : 0
  const overlapYears: [number, number] | null = overlaps ? [Math.floor(def.from), Math.floor(until - 1e-6)] : null
  return { ...def, numeral: ROMAN[i] ?? String(i + 1), company, shortCompany, tinyCompany: def.tinyCompany ?? shortCompany, overlaps, overlapYears, ...PACKED[i] }
})

/** how many tracks the timeline needs */
export const TRACKS: number = JOBS.reduce((m, job) => Math.max(m, job.track + 1), 1)

export interface Pin {
  work: WorkMeta
  /** the label on the folder tab */
  year: string
  /** where it hangs on the ruler (a year fraction) */
  at: number
  /** what the folder is, in my words (also in the accessible name) */
  note: string
  /** tilt of the hanging folder (deg) */
  rot: number
}

interface PinDef extends Omit<Pin, 'work'> {
  slug: string
}

/**
 * Pins: only projects with a date I can stand behind. Space Monkey is Dec 2013 (Pau: the posters are from December 2013), 44 Lab is 2023 (the posts run
 * Mar to Jun), Plana Digital and Spelled Guilty are 2026 (no month). Pins that would touch are spread sideways at run time
 * (CareerTimeline), so two folders of the same year hang from nearby strings and fan out.
 */
const PIN_DEFS: readonly PinDef[] = [
  { slug: 'space-monkey', year: 'Dec 2013', at: 2013.96, note: PROJECT_NOTES['space-monkey'], rot: -3 },
  { slug: 'fortyfour-lab', year: '2023', at: 2023.34, note: PROJECT_NOTES['fortyfour-lab'], rot: 2.5 },
  { slug: 'plana', year: '2026', at: 2026.1, note: PROJECT_NOTES.plana, rot: -3.5 },
  { slug: 'spelled-guilty', year: '2026', at: 2026.5, note: PROJECT_NOTES['spelled-guilty'], rot: 3 },
]

/** a pin whose folder is missing from the registry is simply left out */
export const PINS: readonly Pin[] = PIN_DEFS.flatMap(({ slug, ...rest }) => {
  const work = workBySlug(slug)
  return work ? [{ work, ...rest }] : []
})

const PINNED = new Set(PINS.map((pin) => pin.work.slug))
/** Proyecto Contract sits inside the Casual Magazines bar; everything else that has no pin is "also in the cabinet" */
export const ALSO: readonly WorkMeta[] = WORKS.filter((work) => !PINNED.has(work.slug) && work.slug !== 'contract')

export type CredentialKind = 'education' | 'certificate'
export interface Credential {
  title: string
  year: string | null
  kind: CredentialKind
  /** public path of the certificate PDF */
  pdf?: string
}

/** index into ABOUT.education -> what kind of chip it is and which PDF it opens */
const CREDENTIAL_KIND: readonly { kind: CredentialKind; pdf?: string }[] = [
  { kind: 'education' },
  { kind: 'education' },
  { kind: 'certificate' },
  { kind: 'certificate', pdf: '/certificates/generative-ai.pdf' },
  { kind: 'certificate', pdf: '/certificates/software-web-dev.pdf' },
  { kind: 'certificate', pdf: '/certificates/cyber-security.pdf' },
]

/** the CV gives a month for one of them (ART_DIRECTION section 9: NSW Government certificate, May 2026) */
const DATE_LABEL: Record<string, string> = { 'NSW Government certificate': 'May 2026' }

export const CREDENTIAL_LIST: readonly Credential[] = ABOUT.education.map((text, i) => {
  const match = /^(.*?)\s*\((\d{4})\)$/.exec(text)
  const title = match ? match[1] : text
  return { title, year: match ? (DATE_LABEL[title] ?? match[2]) : null, ...(CREDENTIAL_KIND[i] ?? { kind: 'certificate' as const }) }
})
