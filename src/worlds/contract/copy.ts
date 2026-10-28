// Every visible string of the Contract world ("Press Proof"). English, first person where it is me talking.
// Honesty rules (docs/ART_DIRECTION.md 12.1): I am the editorial director of the publisher, I am in the masthead under
// Redacción, I wrote six Open Space features. Nothing here says or implies that I laid out the issue or any page: the captions
// describe what the layouts do, as observation. No third-party personal data.

export const CREDIT_LINE = 'Pages © Casual Magazines and the credited photographers, shown as a portfolio sample.'

export const BOOK_LABEL = 'Proyecto Contract, Hotel Design 18, with Proyecto Contract 223 bound in'

export const SLUG = {
  title: 'Proyecto Contract',
  issue: 'Hotel Design 18 + 223',
  year: '2026',
}

export const NOTES = {
  title: 'Press notes',
  p1: 'A Spanish magazine on interior design for commercial spaces, hospitality and offices, published by Casual Magazines. This issue is Hotel Design 18 with Proyecto Contract 223 bound inside: two magazines, 230 pages, 2026.',
  p2: 'I was editorial director at Casual Magazines from May 2022 to November 2024. My name is in the masthead under Redacción, the editorial team, and I wrote six Open Space features: they’re the slips on the table.',
  p3: 'You’re turning the issue as published: 30 of its 230 pages, with a note under the book on what each layout does.',
}

export const FIND = {
  label: 'Find my name',
  /** read out after the circle is drawn on page 4 */
  done: 'Circled on page 4: Pau Monfort, first name under Redacción, the editorial team.',
  /** handwritten beside the masthead crop */
  note: 'that’s me',
  noteAgain: 'me again',
}

export const EVIDENCE = {
  title: 'Where I’m in the issue',
  masthead: 'Masthead, page 4',
  mastheadAlt:
    'Detail of the masthead on page 4: the heading Redacción and, under it, the first name, Pau Monfort, followed by three colleagues.',
  slipsTitle: 'My byline, six times',
  slipsHint: 'Textos means “words by”. Pick one.',
  notInBook: 'Not in the 30 pages of this book',
  inBook: 'Turns the book to this spread',
  here: 'On show in the book now',
}

export const RAIL = {
  label: 'Contact sheet: every spread in the book',
  /** read out with a ticked frame */
  mine: 'my name is on this spread',
  /** the key printed under the film */
  key: 'my name is on these spreads',
}

/** The rule under the book: 1 cm on it is 1 cm of the printed page. */
export const RULER = { unit: 'cm' }

/** One caption per position of the book, in spread order: what the layout does (observation, not authorship). */
export const CAPTIONS: string[] = [
  'The front cover: an Interstate masthead over one lobby photograph, and a blue band for the second magazine bound inside.',
  'The contents page: a rust tab, big numerals over photo thumbnails and seven sections in one tight list. Facing it, an advertisement.',
  'The masthead sits under the HALL editorial, and I’m listed under Redacción, the editorial team. Facing page: an advertisement.',
  'Sala de Visitas opens on a rust panel with one big pull-quote in a heavy slab, facing the portrait it belongs to.',
  'Interview pages: a wide photo with the quote laid over it, two columns of questions and answers, project captions boxed in rust.',
  'Open Space opens with a full-bleed lobby photograph across both pages. The rust tab, the title and the standfirst sit right on top of it.',
  'Gran Hotel Barcino: a tall crop above a centred headline on the left, a full-height courtyard photograph on the right.',
  'Waldorf Astoria Seychelles: a chandelier across both pages under a translucent title box. My byline is on the left page.',
  'Les Clarisses lets one panoramic photograph carry both pages, with small white caption columns tucked underneath.',
  'Catalonia Plaza España: a full-bleed reception photo with the title set right over the counter. My byline is at the foot of the right page.',
  'A news page with its rust tab, facing the cover of the second magazine bound into this one.',
  'Lounge Collection runs on a strict grid: six mini-features, photos alternating sides, hairline rules between them.',
  'Lady Pipa: the Open Space tab and a white serif title over a blue-graded interior.',
  'Nude Project: a portrait photo over a centred headline, then the speaker-wall arch. My byline is on the left page.',
  'Archivo moves to an olive field: the rust tab, an illustration, and a title stacked in two weights of Interstate.',
  'The back cover is an advertisement for taps. The issue ends on a tap.',
]

/** Short names of the six features for the slips, in page order. */
export const FEATURE_SHORT: Record<number, string> = {
  72: 'Waldorf Astoria Seychelles',
  91: 'Palacio de Córdoba',
  111: 'Catalonia Plaza España',
  186: 'Nude Project',
  195: 'L’Arc',
  213: 'Clínica ID',
}

/** The colophon card: this world is set in Bitter and Overpass, free stand-ins for the faces the issue embeds. */
export const TYPE = {
  /** a headline from page 42, set in the stand-in */
  slab: 'Madrid entre molduras',
  slabNote: 'Bitter 800, standing in for the Caecilia Heavy of the issue’s headlines.',
  /** the masthead of the cover, set in the stand-in */
  sans: 'Proyecto Contract',
  sansNote: 'Overpass 800, standing in for the Interstate of its cover.',
}

/** The colours of the issue: the first six are sampled from the cover photograph, the last three are exact vector fills from the pages. */
export const SWATCHES: { name: string; hex: string }[] = [
  { name: 'Copper', hex: '#BF7944' },
  { name: 'Sand', hex: '#D29666' },
  { name: 'Walnut', hex: '#825B48' },
  { name: 'Blush', hex: '#D6AF9B' },
  { name: 'Espresso', hex: '#412318' },
  { name: 'Paper', hex: '#F0E9E5' },
  { name: 'Section rust', hex: '#B96027' },
  { name: 'Cover band', hex: '#5098D0' },
  { name: 'Archivo olive', hex: '#8B7959' },
]

/** The house directory (section 4 of the issue's contents pages): the sections are named like the rooms of a hotel. */
export const DIRECTORY = {
  title: 'Directory',
  sub: 'The sections of the issue are named like the rooms of a hotel. Pick one and the book turns to it.',
}

/**
 * Rooms of the building, in page order. `page` is the first page of the room that is one of the 30 in the book; `spans` are the
 * page ranges of the room in the two magazines (from their contents pages), used to mark the room the book is in.
 */
export const ROOMS: { id: string; name: string; es?: boolean; gloss: string; page: number; spans: [number, number][] }[] = [
  { id: 'sumario', name: 'Sumario', es: true, gloss: 'contents', page: 3, spans: [[3, 3]] },
  { id: 'hall', name: 'Hall', gloss: 'editorial and masthead', page: 4, spans: [[4, 5]] },
  { id: 'sala', name: 'Sala de Visitas', es: true, gloss: 'the interview', page: 32, spans: [[32, 41]] },
  { id: 'open', name: 'Open Space', gloss: 'the features', page: 42, spans: [[42, 122], [152, 212]] },
  { id: 'vip', name: 'Zona VIP', es: true, gloss: 'news', page: 130, spans: [[130, 130]] },
  { id: 'lounge', name: 'Lounge', gloss: 'six mini-features', page: 150, spans: [[140, 151]] },
  { id: 'archivo', name: 'Archivo', es: true, gloss: 'technical materials', page: 220, spans: [[220, 227]] },
]

/** "Read closer": the spread bigger, then at the size it was printed at. */
export const READER = {
  title: 'Read closer',
  /** tooltip of the icon tab */
  tab: 'Read closer',
  /** tooltip */
  tabLabel: 'Read this spread bigger',
  hintFit: 'Click a page for full size. Left and right turn it.',
  hintFull: 'Drag to look around. Click a page to fit it.',
  prev: 'Previous spread',
  next: 'Next spread',
  full: 'Full size',
  close: 'Back to the table',
  closeShort: 'Back',
}
