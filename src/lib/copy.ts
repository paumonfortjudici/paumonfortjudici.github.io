// Every visible string of the shell, in one place (source: docs/COPY.md). English only, typographic apostrophes and quotes.
// Facts allowed on the site: docs/ART_DIRECTION.md section 9 and the honesty rules of section 12. Do not add claims here.
//
// Conventions
//  - Labels that the design sets in capitals (tabs, chips, buttons) are stored as written in COPY.md; `.t-label` also uppercases them.
//  - Arrows are never part of a string: Fraunces, Karla and Courier Prime have no arrow glyphs, so draw them as SVG icons.
//  - Brand-new strings that are not in COPY.md (UI group at the bottom) are marked "added".

import { CATEGORIES, CATEGORY_LABEL, CONCEPT_LINE, categoryCounts, workBySlug, type Category } from './works'
import type { SectionId } from './router'

export { CONCEPT_LINE }

export const pad2 = (n: number): string => String(n).padStart(2, '0')

const linkOf = (slug: string): string => workBySlug(slug)?.links?.[0]?.href ?? ''

// ---- Meta / SEO ----------------------------------------------------------------------------------------------------
export const META = {
  title: 'Pau Monfort · Graphic designer, illustrator & front-end developer',
  description:
    'Portfolio of Pau Monfort Judici: branding, editorial design, illustration and web. Based in Barcelona, worked in Sydney. Open for freelance projects.',
  lang: 'en',
} as const

// ---- Mast (header) -------------------------------------------------------------------------------------------------
export const MAST = {
  name: 'Pau Monfort',
  /** small asterisk / sunburst after the name instead of ®. No loaded face has this glyph: draw it as an SVG. */
  mark: '✳',
  notes: ['Design is my first language.', 'I draw it, lay it out and build it.'],
} as const

// ---- Nav -----------------------------------------------------------------------------------------------------------
export interface NavItem {
  id: SectionId
  label: string
}
export const NAV: readonly NavItem[] = [
  { id: 'cover', label: 'Cover' },
  { id: 'catalog', label: 'Catalog' },
  { id: 'about', label: 'About' },
  { id: 'works', label: 'Works' },
  { id: 'process', label: 'Process' },
  { id: 'contact', label: 'Contact' },
]
/** the counter reads `01 /06` */
export const NAV_TOTAL = NAV.length
export const NAV_COUNTER = (index: number): string => `${pad2(index + 1)} /${pad2(NAV_TOTAL)}`

// ---- Sheet meta bar: `2019–2026 · Branding · Editorial · Illustration · <PAGE NAME> · 0N / 06` -------------------------
export interface MetaCategory {
  label: string
  /** the three labels are links that open Works filtered */
  category: Category
}
export const SHEET_META = {
  /** COPY.md prints `2019—2026`; a year range takes an en dash */
  years: '2019–2026',
  categories: [
    { label: 'Branding', category: 'branding' },
    { label: 'Editorial', category: 'editorial' },
    { label: 'Illustration', category: 'illustration' },
  ] as readonly MetaCategory[],
  pages: {
    cover: 'Cover',
    catalog: 'Catalog',
    about: 'About',
    works: 'Works',
    process: 'Process',
    contact: 'Contact',
  } as Record<SectionId, string>,
  counter: (n: number): string => `${pad2(n)} / ${pad2(NAV_TOTAL)}`,
} as const

// ---- 01 Cover ------------------------------------------------------------------------------------------------------
export const COVER = {
  ghost: '#2026',
  strokeWord: 'PORTFOLIO',
  /** chip: scrolls to About */
  nameTag: 'Pau Monfort · Graphic designer',
  /** the one heading with a styled accent word */
  title: { before: 'Brands, books & ', accent: 'characters' },
  titleText: 'Brands, books & characters',
  quickLinks: [
    { label: 'Branding', category: 'branding' },
    { label: 'Editorial', category: 'editorial' },
    { label: 'Illustration', category: 'illustration' },
  ] as readonly MetaCategory[],
  blurb:
    'Graphic designer from Cardedeu, Barcelona. I design brands, magazines, books and characters. Drawn by hand, laid out in Adobe, built for the web. Open a folder and step inside.',
  /** text on the rotating stamp (the trailing dot is the separator before it loops) */
  stamp: 'OPEN FOR PROJECTS · 2026 ·',
  /** handwritten margin note */
  note: 'pick a folder',
  /** deck folder tab: `FOLDER 01` followed by an arrow icon */
  folderTab: (n: number): string => `FOLDER ${pad2(n)}`,
} as const

// ---- 02 Catalog ----------------------------------------------------------------------------------------------------
export const CATALOG = {
  strokeWord: 'CATALOG',
  ghost: '(10)',
  sub: 'Everything in the cabinet, indexed. Search by name, tool or kind of work, or just open a folder.',
  searchPlaceholder: 'Search the catalog: try “poster”, “magazine” or “logo”',
  /** added: accessible name of the search field */
  searchLabel: 'Search the catalog',
  empty: (query: string): string => `Nothing filed under “${query}” yet. Try “logo”, “book” or “poster”.`,
  /** band tab: `FOLDER 01` followed by an arrow icon */
  bandTab: (n: number): string => `FOLDER ${pad2(n)}`,
  /** band footer: `File 01 · 2022–2024` (Somia has no year: just `File 07`) */
  bandFooter: (n: number, years: string): string => (years ? `File ${pad2(n)} · ${years}` : `File ${pad2(n)}`),
  /** the tab-shaped button */
  button: 'OPEN FOLDER',
  groups: ['Published work', 'First steps', 'Concept'] as const,
} as const

// ---- 03 About ------------------------------------------------------------------------------------------------------
export interface Skill {
  title: string
  points: readonly string[]
}
export interface Job {
  years: string
  role: string
  place: string
}
export interface Badge {
  badge: string
  label: string
  href: string
}
export const ABOUT = {
  strokeWord: 'ABOUT ME',
  ghost: '#PAU',
  portraitTab: 'PM · PAU MONFORT',
  greeting: 'Hi, I’m Pau!',
  greetingSmall: 'Pau Monfort Judici',
  paragraph:
    'I’m a graphic designer from Cardedeu, near Barcelona. I started out drawing posters as a kid and never really stopped. Now I design brands, lay out magazines, art-direct illustrated books and build the websites that go with them. In 2025–26 I worked in Sydney as a front-end developer, which taught me to treat design as something people actually click, scroll and live in.',
  /** handwritten hint next to the animated portrait */
  videoHint: 'move your pointer to bring him to life',
  /** ART_DIRECTION 12.1: the portrait video is an AI-generated stylised likeness, never footage */
  videoCaption: 'Animated portrait',
  columns: [
    {
      title: 'Graphic designer',
      points: [
        'Brand identities, from logo to manual',
        'Editorial design for magazines and books',
        'Art direction, photo editing, print-ready files',
      ],
    },
    {
      title: 'Illustrator',
      points: [
        'Hand-drawn characters and logos',
        'Procreate, Illustrator and Nomad Sculpt',
        'Posters since I was 13',
      ],
    },
    {
      title: 'Front-end developer',
      points: [
        'HTML, CSS, JavaScript and React',
        'Responsive, accessible interfaces',
        'I build the sites I design',
      ],
    },
  ] as readonly Skill[],
  timeline: {
    label: 'Work experience',
    items: [
      { years: '2019–2024', role: 'Web graphic designer', place: 'Connecor, Barcelona' },
      { years: '2022–2024', role: 'Editorial director', place: 'Casual Magazines, Barcelona' },
      { years: '2025–2026', role: 'Front-end developer (junior)', place: '4mation Technologies, Sydney' },
      { years: '2026–Now', role: 'Brand & web design', place: 'Plana Digital, Cardedeu' },
    ] as readonly Job[],
  },
  /** certificate chips may link to /certificates/*.pdf */
  education: [
    'BA Tourism · UAB (2022)',
    'Australian College of Business Intelligence (2026)',
    'NSW Government certificate (2026)',
    'Generative AI & its Business Applications',
    'Software & Web Development',
    'Introduction to Cyber Security',
  ] as readonly string[],
  badges: [
    { badge: 'IG', label: '@fortyfour.lab', href: linkOf('fortyfour-lab') },
    { badge: 'PD', label: 'planadigital.cat', href: linkOf('plana') },
    { badge: 'GH', label: 'paumonfortjudici', href: 'https://github.com/paumonfortjudici' },
    { badge: 'SG', label: 'Spelled Guilty (Amazon)', href: linkOf('spelled-guilty') },
  ] as readonly Badge[],
} as const

// ---- 04 Works ------------------------------------------------------------------------------------------------------
export interface WorkFilter {
  id: Category | 'all'
  label: string
  count: number
}
export const WORKS_SECTION = {
  strokeWord: 'WORKS',
  ghost: '(10)',
  /** COPY.md says "use the arrow keys": since the amendments plain arrows stay free for in-world carousels and [ ] hop */
  sub: 'Ten folders, ten different worlds. Filter the cabinet, open a file, then use the [ and ] keys to hop between projects.',
  filterLabel: 'Filter the works',
  /** All · Editorial · Branding · Web · Illustration · Print, each with its count */
  filters: (): WorkFilter[] => {
    const counts = categoryCounts()
    return [
      { id: 'all', label: 'All', count: counts.all },
      ...CATEGORIES.map((id) => ({ id, label: CATEGORY_LABEL[id], count: counts[id] })),
    ]
  },
  /** card tab: `EDITORIAL 01` */
  cardTab: (category: Category, n: number): string => `${CATEGORY_LABEL[category].toUpperCase()} ${pad2(n)}`,
  /** the dashed last folder; the call to action takes an arrow icon and links to #contact */
  lastCard: { title: 'Next folder: yours?', text: 'Tell me what you’re making.', cta: 'Contact' },
} as const

// ---- 05 Process ----------------------------------------------------------------------------------------------------
export interface ProcessStep {
  n: number
  /** tab title (also the heading of the panel) */
  title: string
  body: string
  chips: readonly string[]
}
export const PROCESS = {
  strokeWord: 'PROCESS',
  ghost: '(05)',
  sub: 'How an idea becomes something people can hold, click or hang on a wall.',
  steps: [
    {
      n: 1,
      title: 'COLLECT',
      body: 'I start by listening and hoarding: the story behind the brand, who it speaks to, what is already on the shelf. Pinterest boards, screenshots, objects on my desk: a reference wall until a one-line promise appears.',
      chips: ['Pinterest boards', 'Reference wall', 'One-line promise'],
    },
    {
      n: 2,
      title: 'SKETCH',
      body: 'Pencil first. Dozens of tiny thumbnails on paper, then redrawn in Procreate until a shape, a mascot or a lettering style starts to feel inevitable.',
      chips: ['Pencil & paper', 'Procreate', 'Thumbnails'],
    },
    {
      n: 3,
      title: 'MAKE',
      body: 'The sketch gets built properly: vectors in Illustrator, layouts in InDesign, retouching in Photoshop, a quick sculpt in Nomad when a 3D reference helps, and AI tools to explore variations faster, always art-directed and finished by hand.',
      chips: ['Illustrator', 'InDesign', 'Photoshop', 'Nomad Sculpt', 'AI-assisted exploration'],
    },
    {
      n: 4,
      title: 'DELIVER',
      body: 'Everything leaves tidy: brand manual, print-ready files, a responsive website built in React. A project is only done when the client can run it without me.',
      chips: ['Brand manual', 'Print-ready files', 'Responsive web'],
    },
  ] as readonly ProcessStep[],
  shelf: {
    label: 'On my desk',
    items: ['The whole Adobe suite', 'Pencil & paper', 'Procreate', 'Nomad Sculpt', 'AI tools', 'Pinterest', 'VS Code'] as readonly string[],
  },
  /** tab / stamp buttons; arrows are icons */
  back: 'Back',
  next: 'NEXT STEP',
} as const

// ---- 06 Contact ----------------------------------------------------------------------------------------------------
export interface ContactLink {
  label: string
  value: string
  href: string
}
export const CONTACT = {
  strokeWord: 'CONTACT',
  /** outline lettering: the apostrophe is U+2019 on purpose (a straight one looks like a stray tick) */
  phrase: 'LET’S TALK :)',
  paragraph:
    'Open to freelance projects and studio collaborations — branding, editorial, illustration and web. Tell me what you’re making.',
  email: 'paumonfortjudici@gmail.com',
  emailSecond: 'pau@planadigital.cat',
  /** added: the two buttons next to the address (they read as tabs, not pills) */
  emailActions: { copy: 'Copy', copied: 'Copied', write: 'Write' },
  toast: 'Email copied — talk soon!',
  /** the WhatsApp link is derived from the public WhatsApp number (the signature card itself has no link target) */
  links: [
    { label: 'WhatsApp', value: '+34 697 512 258', href: 'https://wa.me/34697512258' },
    { label: 'Plana Digital', value: 'planadigital.cat', href: linkOf('plana') },
    { label: 'Instagram', value: '@fortyfour.lab', href: linkOf('fortyfour-lab') },
    { label: 'GitHub', value: 'paumonfortjudici', href: 'https://github.com/paumonfortjudici' },
    { label: 'Book', value: 'Spelled Guilty on Amazon', href: linkOf('spelled-guilty') },
  ] as readonly ContactLink[],
  /** the Plana Digital e-mail signature card, recreated in HTML (docs: notes/plana-facts.md section 12-13) */
  businessCard: {
    name: 'Pau Monfort',
    role: 'DESIGN & BRAND',
    rows: [
      { label: 'TEL', value: '+34 697 512 258' },
      { label: 'MAIL', value: 'pau@planadigital.cat' },
      { label: 'WEB', value: 'planadigital.cat' },
    ] as readonly { label: string; value: string }[],
  },
} as const

// ---- Footer --------------------------------------------------------------------------------------------------------
export const FOOTER = {
  name: 'Pau Monfort',
  rights: '© 2026 Pau Monfort Judici',
  /** live clocks, Intl with explicit zones (Barcelona is Europe/Madrid in the IANA database) */
  clocks: [
    { label: 'Barcelona', timeZone: 'Europe/Madrid' },
    { label: 'Sydney', timeZone: 'Australia/Sydney' },
  ] as readonly { label: string; timeZone: string }[],
  /** followed by an up-arrow icon */
  back: 'Back to cover',
} as const

// ---- Cursor labels (data-cursor="...") -----------------------------------------------------------------------------
export const CURSOR_LABELS = ['Open', 'Flip', 'Drag', 'Play', 'Visit', 'Copy', 'Close'] as const
export type CursorLabel = (typeof CURSOR_LABELS)[number]

// ---- Concept work ----------------------------------------------------------------------------------------------------
/** The line is CONCEPT_LINE from works.ts (ART_DIRECTION 12.1 wording, with commas). */
export const CONCEPT = { stamp: 'CONCEPT', line: CONCEPT_LINE } as const

// ---- Shared UI strings (added: not in COPY.md, needed by the shell) -----------------------------------------------------
export const UI = {
  skipLink: 'Skip to content',
  /** the visible "Pause motion" control (ART_DIRECTION 12.2) */
  pauseMotion: 'Pause motion',
  resumeMotion: 'Resume motion',
  world: {
    close: 'Close',
    closeKey: 'Esc',
    prev: 'Previous project',
    next: 'Next project',
    /** film-leader loader while a world chunk loads */
    developing: 'Developing…',
    failed: 'This folder is stuck.',
    retry: 'Try again',
  },
} as const
