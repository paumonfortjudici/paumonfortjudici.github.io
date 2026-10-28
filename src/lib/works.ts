// The cabinet's registry: one entry per folder, in Pau's order. Copy here is final (see docs/ART_DIRECTION.md §12 for the honesty rules).
// Empty `years` / `tools` mean "not known": the UI hides those cells instead of inventing values.

export type Category = 'editorial' | 'branding' | 'web' | 'illustration' | 'print'
export type Group = 'Published work' | 'First steps' | 'Concept'

export interface WorkLink {
  label: string
  href: string
}

export interface WorkMeta {
  slug: string
  /** 1..10, Pau's order */
  n: number
  title: string
  kind: string
  /** '' when unknown */
  years: string
  group: Group
  /** first = primary (shown on the card tab) */
  categories: Category[]
  roles: string[]
  /** only what is verified or openly disclosed; [] when unknown */
  tools: string[]
  blurb: string
  /** folder colour + the text colour that sits on it (docs/ART_DIRECTION.md §2) */
  color: string
  ink: string
  accent?: string
  /** 4:5 card art and an optional transparent cut-out that pops out of the folder */
  thumb: string
  peek?: string
  links?: WorkLink[]
  /** adds the CONCEPT stamp and the AI-assisted line */
  concept?: boolean
  /** extra words the catalog search should match (synonyms, not claims) */
  keywords: string[]
}

export const CATEGORIES: Category[] = ['editorial', 'branding', 'web', 'illustration', 'print']

export const CATEGORY_LABEL: Record<Category, string> = {
  editorial: 'Editorial',
  branding: 'Branding',
  web: 'Web',
  illustration: 'Illustration',
  print: 'Print',
}

export const CONCEPT_LINE = 'Concept project, art-directed by Pau, built with AI-assisted tools.'

export const WORKS: WorkMeta[] = [
  {
    slug: 'contract',
    n: 1,
    title: 'Proyecto Contract',
    kind: 'Trade magazine',
    years: '2022–2024',
    group: 'Published work',
    categories: ['editorial', 'print'],
    roles: ['Editorial director', 'Editorial team', 'Texts'],
    tools: [],
    blurb:
      'A trade magazine on commercial interiors, hotels and offices. I was editorial director at its publisher; my name is in the masthead and my byline is on six features.',
    color: '#FF4B2B',
    ink: '#17101B',
    thumb: '/works/contract/thumb.webp',
    peek: '/works/contract/peek.webp',
    links: [{ label: 'proyectocontract.es', href: 'https://www.proyectocontract.es/' }],
    keywords: ['magazine', 'print', 'editorial', 'interiors', 'hotel', 'issue', 'masthead', 'casual magazines'],
  },
  {
    slug: 'plana',
    n: 2,
    title: 'Plana Digital',
    kind: 'Brand identity & website',
    years: '2026',
    group: 'Published work',
    categories: ['branding', 'web'],
    roles: ['Brand identity', 'Logo', 'Brand manual', 'Web design'],
    tools: [],
    blurb:
      'My new web studio in Cardedeu: a sunrise-over-a-browser identity, a full brand manual and the website that promises sites ready in 72 hours.',
    color: '#1F5C46',
    ink: '#FFF2DA',
    thumb: '/works/plana/thumb.webp',
    peek: '/works/plana/peek.webp',
    links: [{ label: 'planadigital.cat', href: 'https://planadigital.cat/' }],
    keywords: ['logo', 'brand manual', 'website', 'web design', 'identity', 'studio', 'sunrise', 'cardedeu'],
  },
  {
    slug: 'fortyfour-lab',
    n: 3,
    title: '44 Lab',
    kind: 'Custom rugs & a hand-drawn devil',
    years: '2023',
    group: 'Published work',
    categories: ['branding', 'illustration'],
    roles: ['Logo & mascot', 'Custom rugs'],
    tools: ['Hand-drawn'],
    blurb:
      'Custom handtufted rugs made to order, with a mischievous devil I drew by hand as the logo. Thirteen posts from spring 2023.',
    color: '#FFB81C',
    ink: '#17101B',
    thumb: '/works/fortyfour-lab/thumb.webp',
    peek: '/works/fortyfour-lab/peek.webp',
    links: [{ label: '@fortyfour.lab', href: 'https://www.instagram.com/fortyfour.lab/' }],
    keywords: ['rug', 'rugs', 'tufting', 'logo', 'mascot', 'devil', 'instagram', 'handmade', 'custom'],
  },
  {
    slug: 'spelled-guilty',
    n: 4,
    title: 'Spelled Guilty',
    kind: 'Book: 80 word-search whodunits',
    years: '2026',
    group: 'Published work',
    categories: ['editorial', 'illustration'],
    roles: ['Author', 'Art direction', 'Publishing'],
    tools: ['AI image tools', 'Custom book engine'],
    blurb:
      'A murder-mystery word-search book I wrote, art-directed and published myself: 80 cases, 214 pages, available on Amazon.',
    color: '#8A1B3D',
    ink: '#FFF2DA',
    thumb: '/works/spelled-guilty/thumb.webp',
    peek: '/works/spelled-guilty/peek.webp',
    links: [{ label: 'Spelled Guilty on Amazon', href: 'https://www.amazon.com/dp/B0HNKTP74L' }],
    keywords: ['book', 'cover', 'mystery', 'whodunit', 'puzzle', 'word search', 'amazon', 'publishing', 'kdp'],
  },
  {
    slug: 'space-monkey',
    n: 5,
    title: 'Space Monkey',
    kind: 'Escape-room posters',
    years: '2017',
    group: 'First steps',
    categories: ['illustration', 'print'],
    roles: ['Poster design', 'Illustration'],
    tools: ['Photoshop'],
    blurb: 'Two character posters, Tyler and Smith, for an escape room in Granollers. My very first project, at 13.',
    color: '#5B3DF5',
    ink: '#FFF2DA',
    thumb: '/works/space-monkey/thumb.webp',
    peek: '/works/space-monkey/peek.webp',
    links: [],
    keywords: ['poster', 'posters', 'escape room', 'granollers', 'first project', 'space', 'astronaut', 'character'],
  },
  {
    slug: 'procreate',
    n: 6,
    title: 'Procreate Sketchbook',
    kind: 'Early illustration work',
    years: 'Early work',
    group: 'First steps',
    categories: ['illustration'],
    roles: ['Illustration'],
    tools: ['Procreate'],
    blurb: 'Portraits, crests and logos drawn very young: where it all started and never stopped.',
    color: '#FF8FC1',
    ink: '#17101B',
    thumb: '/works/procreate/thumb.webp',
    peek: '/works/procreate/peek.webp',
    links: [],
    keywords: ['portrait', 'crest', 'logo', 'drawing', 'sketchbook', 'ipad', 'early work'],
  },
  {
    slug: 'somia',
    n: 7,
    title: 'Somia',
    kind: 'Brand identity & online store',
    years: '',
    group: 'Published work',
    categories: ['branding', 'web'],
    roles: ['Brand identity', 'Logo', 'Web layout'],
    tools: [],
    blurb: 'Brand identity, logo and web layout for a sustainable-fashion online store.',
    color: '#0F9AA8',
    ink: '#17101B',
    thumb: '/works/somia/thumb.webp',
    peek: '/works/somia/peek.webp',
    links: [{ label: 'somia.store', href: 'https://somia.store/' }],
    keywords: ['shop', 'store', 'fashion', 'ecommerce', 'logo', 'website', 'web design', 'shopify', 'sustainable'],
  },
  {
    slug: 'concept-brand',
    n: 8,
    title: 'Gotet',
    kind: 'Concept: a vermuteria identity',
    years: '2026',
    group: 'Concept',
    categories: ['branding', 'illustration'],
    roles: ['Art direction', 'Logo & lettering', 'Mascots', 'Packaging & posters'],
    tools: ['AI-assisted'],
    blurb:
      'A fictional neighbourhood vermuteria in Cardedeu: hand-lettered logo, four mascots, pattern, mockups and posters on one brand board.',
    color: '#86A22F',
    ink: '#17101B',
    thumb: '/works/concept-brand/thumb.webp',
    peek: '/works/concept-brand/peek.webp',
    links: [],
    concept: true,
    keywords: ['logo', 'brand board', 'mascot', 'packaging', 'poster', 'pattern', 'bar', 'vermouth', 'vermut', 'concept'],
  },
  {
    slug: 'concept-portfolio',
    n: 9,
    title: 'A Portfolio for a Client',
    kind: 'Concept: a portfolio deck',
    years: '2026',
    group: 'Concept',
    categories: ['editorial', 'illustration'],
    roles: ['Art direction', 'Presentation design', 'Illustration'],
    tools: ['AI-assisted'],
    blurb: "A fictional client's portfolio deck in five slides: hand-drawn, warm and easy to say yes to.",
    color: '#FBE79A',
    ink: '#17101B',
    thumb: '/works/concept-portfolio/thumb.webp',
    peek: '/works/concept-portfolio/peek.webp',
    links: [],
    concept: true,
    keywords: ['portfolio', 'presentation', 'slides', 'deck', 'client', 'pitch', 'concept'],
  },
  {
    slug: 'illustration',
    n: 10,
    title: 'Sticker Sheet',
    kind: 'Concept: an illustration showcase',
    years: '2026',
    group: 'Concept',
    categories: ['illustration'],
    roles: ['Illustration', 'Character design'],
    tools: ['AI-assisted'],
    blurb: 'Nine doodle characters on one sticker sheet: a showcase of my illustration style.',
    color: '#B79CFF',
    ink: '#17101B',
    thumb: '/works/illustration/thumb.webp',
    peek: '/works/illustration/peek.webp',
    links: [],
    concept: true,
    keywords: ['stickers', 'doodle', 'characters', 'illustration', 'style', 'concept'],
  },
]

export const workBySlug = (slug: string): WorkMeta | undefined => WORKS.find((w) => w.slug === slug)

export const byCategory = (cat: Category | 'all'): WorkMeta[] =>
  cat === 'all' ? WORKS : WORKS.filter((w) => w.categories.includes(cat))

const indexOf = (slug: string) => Math.max(0, WORKS.findIndex((w) => w.slug === slug))

export const nextOf = (slug: string): WorkMeta => WORKS[(indexOf(slug) + 1) % WORKS.length]

export const prevOf = (slug: string): WorkMeta => WORKS[(indexOf(slug) - 1 + WORKS.length) % WORKS.length]

export const categoryCounts = (): Record<Category | 'all', number> => ({
  all: WORKS.length,
  editorial: byCategory('editorial').length,
  branding: byCategory('branding').length,
  web: byCategory('web').length,
  illustration: byCategory('illustration').length,
  print: byCategory('print').length,
})
