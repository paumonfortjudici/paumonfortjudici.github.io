// Strings the About section adds on top of src/lib/copy.ts (ABOUT). English only, sentence case, typographic quotes.
// Facts come from docs/ART_DIRECTION.md section 9 (the CV) and the honesty rules of section 12. Nothing here is invented:
// the CV lines are the CV's own words, with a capital letter at the start.

import { ABOUT } from '../../../lib/copy'

export const PORTRAIT = {
  /** the handwritten hint under the strip, by input kind */
  hint: {
    pointer: ABOUT.videoHint,
    touch: 'tap the portrait to bring him to life',
    still: 'slide the strip to pick a frame',
  },
  /** ART_DIRECTION 12.1: an AI-generated stylised likeness, never footage */
  caption: 'Animated portrait, made with AI video tools',
  alt: 'Stylised animated portrait of Pau: curly brown hair, tattooed forearms and a brown T-shirt, looking off to the right.',
  scrub: 'Scrub the animated portrait',
  play: 'Play the animated portrait',
  pause: 'Pause the animated portrait',
  slate: ['Portrait', '24 fps'] as const,
  developing: 'Developing',
  year: '2026',
} as const

export const TIMELINE = {
  now: 'Now',
  nowAria: 'now',
  /** the ruler and the bars are drawn from real dates; this is the accessible name of the list */
  listLabel: 'Work experience, oldest first',
  freelance: 'Freelance & own projects',
  freelanceNote: 'Each folder opens its own world.',
  freelanceList: 'Freelance and own projects',
  also: 'Also in the cabinet',
  alsoList: 'More projects, not placed on the timeline',
  concept: 'Concept',
  /** handwritten on the film, pointing at the clip that starts while the one below it is still running; the years come from the CV dates */
  overlap: (from: number, to: number): string => `two roles at once, ${from} to ${to}`,
  /** ART_DIRECTION 12.1: the escape room opened in Feb 2018 in Granollers (the posters themselves are Dec 2017) */
  escapeRoom: 'Feb 2018: the escape room opens in Granollers',
  seeIssue: 'Proyecto Contract',
  seeIssueAria: 'Open the folder: Proyecto Contract, the magazine published by Casual Magazines',
} as const

/** The CV lines, one per job (ART_DIRECTION section 9). Casual Magazines stays exactly what the CV says. */
export const CV = {
  connecor:
    'Developed and presented design proposals, edited photographs for web banners and social media, designed, laid out and produced technical illustrations for brochures, banners and signage.',
  casual: 'Tracked communication strategies, ad campaigns and marketing actions; helped maintain brand identity guidelines for visual consistency.',
  fourmation: 'Developed and maintained web applications with the dev team; HTML, CSS, JavaScript, responsive design and UX good practice.',
  /** from the registry blurb of the Plana folder */
  plana: 'The brand identity, the brand manual and the website of my own web studio in Cardedeu.',
} as const

export const PROJECT_NOTES = {
  'space-monkey': 'my first project, at 13',
  'fortyfour-lab': 'custom rugs and a hand-drawn devil',
  plana: 'my own web studio',
  'spelled-guilty': 'a book I wrote and published',
} as const

export const CREDENTIALS = {
  education: 'Education',
  certificates: 'Certificates',
  pdf: 'PDF',
  pdfAria: 'certificate, PDF, opens in a new tab',
  elsewhere: 'Elsewhere',
} as const

/** the ticket stubs: a small line above (the place) and the link text */
export const TICKETS: Record<string, { kicker: string; label: string }> = {
  IG: { kicker: 'Instagram', label: '@fortyfour.lab' },
  PD: { kicker: 'Website', label: 'planadigital.cat' },
  GH: { kicker: 'GitHub', label: 'paumonfortjudici' },
  SG: { kicker: 'On Amazon', label: 'Spelled Guilty' },
}
