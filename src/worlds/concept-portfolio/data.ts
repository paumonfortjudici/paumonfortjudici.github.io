// Data of the "Slide Deck" world: the five slides, the director's pins, the sound hotspots, the client facts.
// Source of truth for the artwork: public/works/concept-portfolio/art/portfolio.json (alt texts, palette, fonts, bio) and the
// director's guide (what is on each slide). Everything about Ona Ribas is FICTIONAL (name, studios, films, e-mail, phone).
// Positions of pins and hotspots are written in pixels of the 1080 x 1920 slide (measured by looking at each slide) and stored
// as percentages, so they follow the slide at every size.

import { asset } from '@/lib/asset'

export type Field = 'teal' | 'butter' | 'deep'
export type PinSide = 'l' | 'r' | 't' | 'b'
export type SoundKind = 'snap' | 'crunch' | 'clop' | 'whistle' | 'steps' | 'wave'

export const SLIDE_W = 1080
export const SLIDE_H = 1920

/** pixels of the 1080 x 1920 slide -> percent of the frame */
const X = (px: number): number => Math.round((px / SLIDE_W) * 1000) / 10
const Y = (py: number): number => Math.round((py / SLIDE_H) * 1000) / 10

export interface Pin {
  id: string
  /** percent of the frame */
  x: number
  y: number
  /** where the note opens, so it never covers its own pin (small screens override it) */
  side: PinSide
  title: string
  text: string
}

export interface Hotspot {
  id: string
  kind: SoundKind
  /** box, percent of the frame */
  x: number
  y: number
  w: number
  h: number
  /** the onomatopoeia that pops up with the sound (works without sound too) */
  word: string
  /** accessible name */
  label: string
  /** which corner of the box carries the speaker badge (default top right), so it never covers text */
  corner?: 'tl' | 'tr' | 'bl' | 'br'
}

export interface Slide {
  n: number
  src: string
  /** the word on the caption slate */
  name: string
  /** short title for labels */
  title: string
  alt: string
  field: Field
  pins: Pin[]
  hotspots: Hotspot[]
}

const pin = (id: string, px: number, py: number, side: PinSide, title: string, text: string): Pin => ({ id, x: X(px), y: Y(py), side, title, text })
const hot = (id: string, kind: SoundKind, cx: number, cy: number, w: number, h: number, word: string, label: string, corner?: Hotspot['corner']): Hotspot => ({
  id,
  kind,
  x: X(cx - w / 2),
  y: Y(cy - h / 2),
  w: X(w),
  h: Y(h),
  word,
  label,
  corner,
})

const art = (file: string): string => asset(`/works/concept-portfolio/art/${file}`)

export const SLIDES: Slide[] = [
  {
    n: 1,
    src: art('slide-1.webp'),
    name: 'Cover',
    title: 'Cover: Foley Portfolio',
    alt: 'Teal cover: FOLEY PORTFOLIO in huge stretched cream letters above a giant furry boom microphone, with yellow sunburst rays and red and yellow SNAP! and CRUNCH! bursts. The tagline reads “The small noises that make a film feel real.”',
    field: 'teal',
    pins: [
      pin('1-1', 1046, 262, 'l', 'Every letter has its own width', 'Anybody has a width axis from 50 to 150. In FOLEY the F is set at 150, the O at 90, the L at 60 and the E at 70: one super-wide letter beside tall narrow ones, like a film title card.'),
      pin('1-2', 575, 1010, 'l', 'The mic listens to the title', 'The microphone points at FOLEY as if it is listening to it. Butter fur against teal gives it the strongest value contrast on the slide, so it reads before any small text does.'),
      pin('1-3', 122, 1452, 'r', 'Noise gets its own shape', 'Sounds are bursts with lettering in Anybody 800 and an ink copy offset under it. Exclamation marks live only here, never in the body copy.'),
      pin('1-4', 258, 706, 'r', 'A spotlight and a sound field', 'Each slide gets one yellow burst, always the same yellow, acting as a spotlight. The deep-teal waveform behind the mic is room tone: quiet, so the fur can shout.'),
      pin('1-5', 690, 1862, 't', 'Footprints from the first slide', 'Boot prints appear on all five slides. Here they walk along the bottom edge and off the page: the first hint that this deck is a journey.'),
    ],
    hotspots: [
      hot('1-snap', 'snap', 905, 690, 200, 180, 'SNAP!', 'Play the snap'),
      hot('1-crunch', 'crunch', 215, 1535, 270, 260, 'CRUNCH!', 'Play the celery crunch'),
    ],
  },
  {
    n: 2,
    src: art('slide-2.webp'),
    name: 'About',
    title: 'About: I’m Ona Ribas',
    alt: 'Butter slide headed I’M ONA RIBAS over a yellow sunburst, with a short bio and five taped frames of foley props. Ona, in a lilac sweater and red dungarees, kicks one knee up and claps two coconut halves.',
    field: 'butter',
    pins: [
      pin('2-1', 800, 112, 'b', 'The name crosses the sun', 'I let the burst run behind the name on purpose. Deep teal on yellow still reads at 3.8 to 1, and the rays make the name look lit from behind.'),
      pin('2-2', 1046, 236, 'l', 'The joke is in her name', 'Ona means wave in Catalan, so waves and waveforms keep coming back. One small joke per slide, delivered flat: that is her kind of humour.'),
      pin('2-3', 448, 1292, 'r', 'Props tagged with what they fake', 'Five framed objects, each tagged with the noise it makes: celery is bones, cabbage is stabs. They step down from top right to bottom left and break out of their frames.'),
      pin('2-4', 735, 922, 'l', 'One Ona, built from parts', 'Her face, hair, hoop earring, hands and boots come from one set of parts, so she is the same Ona on every slide, in the same lilac sweater, tomato dungarees and odd socks. I fixed her face once and never redraw it.'),
      pin('2-5', 178, 1796, 't', 'A teal floor under a butter page', 'The deck alternates teal, butter and deep teal. On this butter slide a teal floor grounds her and carries the footprints in butter.'),
    ],
    hotspots: [hot('2-clop', 'clop', 706, 1114, 250, 150, 'CLIP-CLOP!', 'Play the coconut clip-clop')],
  },
  {
    n: 3,
    src: art('slide-3.webp'),
    name: 'Work',
    title: 'Selected projects',
    alt: 'Deep-teal slide, SELECTED PROJECTS: Salt Season (2025), Kettle & Crow (2024) and The Understudy Moon (2023), each with a small gouache illustration of red boots on a salt flat, a screaming kettle under a crow with umbrella wings, and a smiling paper moon.',
    field: 'deep',
    pins: [
      pin('3-1', 252, 104, 'b', 'Same header, every slide', 'Thirty small rules keep five slides one family. The first one: this header row sits on the same baseline, in the same size, on every slide.'),
      pin('3-2', 1046, 290, 'l', 'A new mix of widths', 'PROJECTS gets its own width pattern: a super-wide P and E around a tight J. Every title has a different rhythm, but all of them run exactly margin to margin.'),
      pin('3-3', 560, 392, 'r', 'Years in sun yellow', 'Years are the loudest text after the title: Anybody at 140% width, sun yellow on deep teal. You can still read them when the slide is a thumbnail.'),
      pin('3-4', 520, 846, 'r', 'A path between projects', 'Text and picture swap sides block by block, and steel footprints walk from the first project to the second and on to the third, so the eye follows the trail.'),
      pin('3-5', 930, 950, 'l', 'Each project is a tiny joke', 'A kettle screams under a crow whose wings are umbrellas. Every spot illustration sits on its own colour, so the three silhouettes never blur together.'),
    ],
    hotspots: [hot('3-whistle', 'whistle', 830, 1160, 340, 240, 'WHEEE!', 'Play the kettle whistle')],
  },
  {
    n: 4,
    src: art('slide-4.webp'),
    name: 'Background',
    title: 'Experience and education',
    alt: 'Butter slide headed EXPERIENCE & EDUCATION: a pinned wall of waveforms, polaroids and tickets, with Ona at a mixing desk in yellow headphones. Below, a footprint trail links four timeline entries from film school in 2012 to Casa Grava Studio today.',
    field: 'butter',
    pins: [
      pin('4-1', 1046, 218, 'l', 'Two lines, margin to margin', 'Each line is stretched until its ink touches both margins, so the page edge becomes the grid. The ampersand opens the second line on purpose.'),
      pin('4-2', 396, 590, 'b', 'A wall of pinned memories', 'A waveform print, a film strip, ADMIT ONE and TAKE 12 tickets, a call sheet with SC 24 circled, a cassette. Every piece is a flat object you can name at a glance.'),
      pin('4-3', 730, 760, 'l', 'Same Ona, new pose', 'Seated at her desk with the headphones on her head, not round her neck. Same face and costume, side-on this time, so she stays Ona in any position.'),
      pin('4-4', 640, 462, 'b', 'The burst changes job', 'Yellow on deep teal reads strongly, so here the burst can sit right behind her head like a studio lamp, and a few rays spill out over the panel edge.'),
      pin('4-5', 122, 1398, 'r', 'A career as a walk', 'The timeline is a trail of footprints, toes up, four stops from film school to the studio. It climbs towards the desk scene, so the story ends where she sits now.'),
    ],
    hotspots: [hot('4-steps', 'steps', 120, 1445, 130, 720, 'THUMP!', 'Play the footsteps', 'tl')],
  },
  {
    n: 5,
    src: art('slide-5.webp'),
    name: 'Contact',
    title: 'Contact: Thanks for listening',
    alt: 'Teal closing slide, THANKS FOR LISTENING, with Ona walking off at sunrise, waving back, a boom pole in one hand and a duffel bag with a black cat on her back. A deep-teal card lists her email, website, phone and base in Girona, with a tag saying she is available from January 2027.',
    field: 'teal',
    pins: [
      pin('5-1', 1046, 372, 'l', 'Open and close on teal', 'The closing title mirrors the cover: two stretched lines in butter on teal. Starting and ending on the same field is the first and last beat of the rhythm.'),
      pin('5-2', 925, 962, 'l', 'The burst becomes a sunrise', 'The same yellow burst, cut in half by the ground line, turns into a sunrise. She walks off looking back and waving, which is how this deck says goodbye.'),
      pin('5-3', 440, 850, 'l', 'A gag that pays off', 'Foley people call a furry mic windscreen a dead cat. It is the big fur on slide 1 and the small one on her boom pole here; the live cat on the duffel is the joke.'),
      pin('5-4', 232, 1262, 't', 'The trail keeps walking', 'On slide 4 the prints climb up to her desk. Here they run along the horizon, toes pointing right, the way she is walking. Same boots, same trail: the whole deck is one walk from cover to goodbye.'),
      pin('5-5', 852, 1418, 't', 'Contact comes second', 'After the title, the card is the next thing you read: celery labels, then butter values set large on deep teal. The address and phone are invented on purpose.'),
    ],
    hotspots: [hot('5-wave', 'wave', 478, 690, 300, 230, 'BYE!', 'Play the goodbye wave')],
  },
]

export const SLIDE_COUNT = SLIDES.length

/** the wide sheet (five slides side by side, 504 px each + 20 px gutters) used by the contact-sheet overview */
export const SHEET = {
  src: art('sheet.webp'),
  w: 2600,
  h: 896,
  slideW: 504,
  gutter: 20,
  alt: 'All five portfolio slides side by side: a teal cover, a butter About page, a deep-teal Projects page, a butter Experience page and a teal Contact page, each with the same hand-cut lettering, footprints and sunbursts.',
}

// ---- the client (invented) ---------------------------------------------------------------------------------------------
export const CLIENT = {
  name: 'Ona Ribas',
  profession: 'Foley artist and sound designer',
  city: 'Girona, Catalonia',
  since: 2016,
  bio: 'Ona gives films their footsteps, rustling coats, slamming doors and sighs. For ten years she has worked in a studio full of gravel, celery and old shoes: first as a foley walker, then cutting foley for 22 films, and now performing it herself on features, series, shorts and games. She talks to directors in objects (“this scene is wet cardboard”) and keeps one very patient neighbour.',
  availability: 'Available from January 2027',
  availabilityNote: 'Features, series, shorts and games.',
  projects: [
    { year: 2025, title: 'Salt Season', kind: 'Feature', how: 'Footsteps, cloth', line: 'Two hundred kilometres of desert footsteps, recorded in a kitchen with six kilos of salt.' },
    { year: 2024, title: 'Kettle & Crow', kind: 'Short film', how: 'Props, wings', line: 'A kettle that screams, a crow that never lands, and one umbrella playing the wings.' },
    { year: 2023, title: 'The Understudy Moon', kind: 'Stop-motion series', how: 'Paper, creaks', line: 'Eight episodes of paper wings, cardboard footsteps and a moon that creaks when it smiles.' },
  ],
} as const

export interface Swatch {
  name: string
  hex: string
  role: string
  /** the CSS custom property that carries this colour on the world (--cp-<v>) */
  v: string
}

/** the deck's palette, with the role each colour plays (portfolio.json) */
export const PALETTE: Swatch[] = [
  { name: 'Teal', hex: '#007E9B', role: 'field of slides 1 and 5', v: 'teal' },
  { name: 'Butter', hex: '#FDEFAF', role: 'field of slides 2 and 4; type on teal and deep teal', v: 'butter' },
  { name: 'Deep teal', hex: '#1B6885', role: 'field of slide 3; type on butter; panels', v: 'deep' },
  { name: 'Steel', hex: '#63A0AC', role: 'secondary shapes, halftone on teal', v: 'steel' },
  { name: 'Ink', hex: '#101820', role: 'linework, hair, shoes, hard shadows', v: 'ink' },
  { name: 'Paper', hex: '#F6F0DC', role: 'frames, collage, tickets, boot soles', v: 'paper' },
  { name: 'Sun', hex: '#F2C62F', role: 'sunbursts, headphones, numerals', v: 'sun' },
  { name: 'Tomato', hex: '#E8553E', role: 'dungarees, sound bursts, years on butter', v: 'tomato' },
  { name: 'Salmon', hex: '#F2A29A', role: 'blush, tape, halftone dots on butter', v: 'salmon' },
  { name: 'Lilac', hex: '#B58AD6', role: 'sweater, moon sky', v: 'lilac' },
  { name: 'Periwinkle', hex: '#7A8CE8', role: 'hardware: mic clamps, umbrella, duffel', v: 'peri' },
  { name: 'Celery', hex: '#9CCF9A', role: 'celery, cabbage, labels on deep teal', v: 'celery' },
]

export const FONTS = [
  { name: 'Anybody', role: 'Display titles', detail: 'Variable font at weight 600, with a different width (50 to 150) for every letter.', loaded: true },
  { name: 'Syne', role: 'Labels, subheads and project titles', detail: 'Bold 700, caps or small caps, tracked wide.', loaded: false },
  { name: 'DM Sans', role: 'Body copy', detail: 'Medium 500, with italic for asides.', loaded: false },
] as const

/** the lockup of the guide's own example, CRUNCH, with its per-letter widths (the live sample in the panel) */
export const SAMPLE = { word: 'CRUNCH', widths: [150, 90, 70, 100, 120, 90] }

/** the stage title painted on the wall: letters with their own widths, like the deck's lockups */
export const WALL_TITLE: { text: string; widths: number[] }[] = [
  { text: 'ONA RIBAS', widths: [140, 78, 140, 100, 112, 56, 150, 72, 140] },
  { text: 'FOLEY PORTFOLIO', widths: [150, 100, 60, 50, 140, 100, 145, 90, 60, 130, 70, 130, 55, 50, 140] },
]
