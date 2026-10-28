// Content of the Plana Digital world ("Brand Atlas"). Everything here comes from public/works/plana/manifest.json and the research notes
// (plana-facts.md): nothing is invented. Text inside the images is Spanish / Catalan; every caption below is English and mine.
// Honesty: mockups carry placeholder contacts and sample numbers (planadigital.com, a bakery called Fleca Rosella, Instagram stats):
// they are always labelled "sample mockup". No prices anywhere.
import { asset } from '../../lib/asset'

export const plana = (path: string): string => asset(`/works/plana/${path}`)

/* ---- the three days (the website's own "0 h to 72 h" story, in English) ----------------------------------------------------- */

export interface DayStep {
  day: 1 | 2 | 3
  /** the hour the day starts at on the slider */
  hour: number
  /** how the website prints it */
  when: string
  title: string
  text: string
}

export const DAYS: DayStep[] = [
  {
    day: 1,
    hour: 0,
    when: '0 h',
    title: 'You tell us about your business',
    text: 'A call or a visit. You show us what you do and who you sell to, plus whatever you have at hand: logo, photos, texts. That is all we ask.',
  },
  {
    day: 2,
    hour: 24,
    when: '24 h',
    title: 'We design and code',
    text: 'Design and code happen at the same time. Before anything goes live you get a link to look at, and you tell us what to change.',
  },
  {
    day: 3,
    hour: 48,
    when: '48 to 72 h',
    title: 'Your website, online',
    text: 'Last changes, then the domain is connected in your name and the site goes live. From that moment you can send the link to anyone.',
  },
]

export const HOURS = 72

/** which day an hour belongs to (0 to 23 = day 1, 24 to 47 = day 2, 48 to 72 = day 3) */
export const dayOf = (hour: number): 0 | 1 | 2 => (hour >= 48 ? 2 : hour >= 24 ? 1 : 0)

/**
 * How far the sun sits below the horizon, in symbol units (the sun's radius is 27). The manual's three windows are the anchors:
 * day 1 = 16.7, day 2 = 7.6, day 3 = 0 (measured from the manual's vectors). Between them the sun glides; from 48 h on it stays up.
 */
export function sunOffset(hour: number): number {
  const h = Math.max(0, Math.min(HOURS, hour))
  if (h <= 24) return 16.7 + (7.6 - 16.7) * (h / 24)
  if (h <= 48) return 7.6 + (0 - 7.6) * ((h - 24) / 24)
  return 0
}

/** dots lit in the title bar: one per day, painted in sunrise colours */
export const dotsOf = (hour: number): 1 | 2 | 3 => (dayOf(hour) + 1) as 1 | 2 | 3

/* ---- plates -------------------------------------------------------------------------------------------------------------- */

export interface PlateInfo {
  n: number
  id: string
  title: string
  hint: string
}

export const PLATES: PlateInfo[] = [
  { n: 1, id: 'sunrise', title: 'Sunrise', hint: 'Drag the sun' },
  { n: 2, id: 'lockups', title: 'Lockups', hint: 'Five forms' },
  { n: 3, id: 'colour', title: 'Colour', hint: 'Click a chip to copy' },
  { n: 4, id: 'type', title: 'Type', hint: 'Type your own words' },
  { n: 5, id: 'mockups', title: 'Mockups', hint: 'Drag the rail' },
  { n: 6, id: 'manual', title: 'Manual', hint: 'Fan it out' },
  { n: 7, id: 'website', title: 'Website', hint: 'Watch the tour' },
]

export const plateId = (id: string): string => `plana-plate-${id}`

/* ---- plate 2: lockups ---------------------------------------------------------------------------------------------------- */

export type Ground = 'paper' | 'wheat' | 'holm' | 'poppy' | 'night'

export interface Lockup {
  id: 'horizontal' | 'vertical' | 'symbol' | 'seal' | 'reversed'
  label: string
  file: string
  w: number
  h: number
  /** the background the manual approves for this form (plate 2 changes colour with it) */
  ground: Ground
  alt: string
  note: string
}

export const LOCKUPS: Lockup[] = [
  {
    id: 'horizontal',
    label: 'Horizontal',
    file: 'logo/plana-digital-horizontal.svg',
    w: 793,
    h: 155,
    ground: 'paper',
    alt: 'Plana Digital horizontal logo: the browser-window symbol next to the words plana digital',
    note: 'The main signature: web, signs, invoices and anywhere with room to spread out. Minimum 120 px on screen, 30 mm in print.',
  },
  {
    id: 'vertical',
    label: 'Vertical',
    file: 'logo/plana-digital-vertical.svg',
    w: 265,
    h: 372,
    ground: 'wheat',
    alt: 'Plana Digital vertical logo: the symbol above the words plana and digital',
    note: 'For square and tall formats: social posts, posters, T-shirts.',
  },
  {
    id: 'symbol',
    label: 'Symbol',
    file: 'logo/plana-digital-symbol-reversed.svg',
    w: 152,
    h: 140,
    ground: 'holm',
    alt: 'The Plana Digital symbol alone: a browser window with a rising sun and a cursor, with a paper edge',
    note: 'Alone, without the name: avatar, app icon, stickers, animation. On dark it wears a paper edge.',
  },
  {
    id: 'seal',
    label: 'Seal',
    file: 'logo/plana-digital-seal-green.svg',
    w: 400,
    h: 400,
    ground: 'poppy',
    alt: 'Plana Digital round seal in holm-oak green with the ring text Plana Digital, Cardedeu, Webs llestes en 72 h',
    note: 'The friendliest version: stamps, bags, fairs and the sign over the street.',
  },
  {
    id: 'reversed',
    label: 'Reversed',
    file: 'logo/plana-digital-horizontal-reversed.svg',
    w: 792,
    h: 155,
    ground: 'night',
    alt: 'Plana Digital horizontal logo reversed for dark backgrounds, with a paper-coloured wordmark',
    note: 'For dark backgrounds: a paper-coloured wordmark and a sticker edge round the symbol.',
  },
]

/* ---- plate 3: colour ----------------------------------------------------------------------------------------------------- */

export interface Swatch {
  id: 'paper' | 'holm' | 'wheat' | 'poppy' | 'night'
  name: string
  /** the manual's own name (Spanish / Catalan) */
  local: string
  hex: string
  rgb: string
  cmyk: string
  /** share of a typical page, measured from the manual's proportion bar */
  share: number
  role: string
}

// order = the order of the proportion bar in the manual (largest first)
export const SWATCHES: Swatch[] = [
  { id: 'paper', name: 'Paper', local: 'Papel', hex: '#F7F2E8', rgb: '247 242 232', cmyk: '0 2 6 3', share: 55, role: 'The main background: websites and documents.' },
  { id: 'holm', name: 'Holm oak', local: 'Encina', hex: '#1E4634', rgb: '30 70 52', cmyk: '57 0 26 73', share: 18, role: 'The dark base: signs, cards, the van.' },
  { id: 'wheat', name: 'Wheat', local: 'Trigo', hex: '#F2CF6B', rgb: '242 207 107', cmyk: '0 14 56 5', share: 12, role: 'Warmth: backgrounds, stickers, details.' },
  { id: 'poppy', name: 'Poppy', local: 'Amapola', hex: '#E5502F', rgb: '229 80 47', cmyk: '0 65 79 10', share: 10, role: 'The accent: buttons, the sun, whatever has to be seen.' },
  { id: 'night', name: 'Night', local: 'Noche', hex: '#18181B', rgb: '24 24 27', cmyk: '11 11 0 89', share: 5, role: 'Text, outlines and the volume of the logo.' },
]

/** WCAG 2 contrast ratio between two #RRGGBB colours */
export function contrast(a: string, b: string): number {
  const lum = (hex: string) => {
    const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    const [r, g, bl] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl
  }
  const la = lum(a)
  const lb = lum(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/* ---- plate 5: mockups ---------------------------------------------------------------------------------------------------- */

export interface Mockup {
  id: string
  title: string
  file: string
  w: number
  h: number
  alt: string
  caption: string
  /** what is made up inside the picture, when something is */
  placeholder?: string
}

export const MOCKUPS: Mockup[] = [
  {
    id: 'apparel',
    title: 'Apparel',
    file: 'board/mockup-apparel.webp',
    w: 1200,
    h: 752,
    alt: 'A white T-shirt, a green T-shirt with the big red seal and a cotton tote that reads Fet a Cardedeu.',
    caption: 'A small logo on a white tee, the big seal on a green one and a tote that says “Fet a Cardedeu” (made in Cardedeu).',
  },
  {
    id: 'signage',
    title: 'Signage',
    file: 'board/mockup-signage.webp',
    w: 1200,
    h: 749,
    alt: 'A shop front with a green fascia sign, window vinyl, an Obert (open) door sign and a round hanging seal.',
    caption: 'The shop front: a holm-oak fascia, window vinyl, an “Obert” (open) door sign and a round seal hanging over the pavement.',
    placeholder: 'The opening hours on the door are made up.',
  },
  {
    id: 'social',
    title: 'Social',
    file: 'board/mockup-social.webp',
    w: 1200,
    h: 752,
    alt: 'An Instagram profile on a phone plus three post templates.',
    caption: 'Instagram templates that alternate the brand colours: the “72 h” process card, a plain-words card and a before and after.',
    placeholder: 'The follower numbers and the bakery are made up.',
  },
  {
    id: 'stationery',
    title: 'Stationery',
    file: 'board/mockup-stationery.webp',
    w: 1200,
    h: 751,
    alt: 'Business cards, a proposal letter and two stickers on wheat yellow.',
    caption: 'Two-sided cards in paper and holm oak, a proposal letter and die-cut stickers on wheat yellow.',
    placeholder: 'Names, phone, e-mail and the bakery in the letter are placeholders.',
  },
  {
    id: 'van',
    title: 'Van',
    file: 'board/mockup-van.webp',
    w: 1200,
    h: 753,
    alt: 'A white van with green livery and a big red sun against green hills.',
    caption: 'Partial vinyl on any white van: the sun rises from the green stripe, exactly like in the symbol.',
    placeholder: 'The phone number and web address on the van are placeholders.',
  },
  {
    id: 'website',
    title: 'Website',
    file: 'board/mockup-website.webp',
    w: 1200,
    h: 750,
    alt: 'A laptop and a phone showing the Plana Digital website, with Catalan copy, on green and sand.',
    caption: 'The site layout on a laptop and a phone. The real thing, scrolling, is plate 7.',
  },
]

/* ---- plate 6: the manual -------------------------------------------------------------------------------------------------- */

export interface ManualPage {
  n: number
  file: string
  /** dominant colour of the page (placeholder while the picture loads) */
  bg: string
  title: string
  alt: string
  /** English caption shown in the viewer */
  caption: string
  /** true when the page carries placeholder contacts or sample numbers */
  sample?: boolean
}

export const MANUAL: ManualPage[] = [
  {
    n: 1,
    file: 'manual/m-01.webp',
    bg: '#1C4434',
    title: 'Cover',
    alt: 'Brand manual cover on holm-oak green: the plana digital horizontal logo, the line Webs llestes en 72 hores in wheat yellow and a large browser-window symbol with a sunrise and a cursor, cropped at the bottom-right.',
    caption: 'Holm-oak green, the horizontal logo, the promise in wheat yellow and the symbol cropped off the corner.',
  },
  {
    n: 2,
    file: 'manual/m-02.webp',
    bg: '#F4ECE4',
    title: 'The name',
    alt: 'Manual page El nombre: the words plana digital set huge in Sora, with four numbered readings of the name, the slogan and the four personality words.',
    caption: 'Four readings of “plana digital”: a web page in Catalan, the plain of the Vallès, plain and simple, and the surname that says what we do.',
  },
  {
    n: 3,
    file: 'manual/m-03.webp',
    bg: '#ECCC64',
    title: 'The symbol',
    alt: 'Manual page El símbolo on wheat yellow: the headline Un amanecer dentro del navegador beside the large symbol, and three small windows for Day 1, Day 2 and Day 3 in which the sun rises and the title-bar dots light up one by one.',
    caption: '“A sunrise inside the browser.” The three dots are the three days: 72 hours, three sunrises. This page is the script for plate 1.',
  },
  {
    n: 4,
    file: 'manual/m-04.webp',
    bg: '#F4ECE4',
    title: 'Construction',
    alt: 'Technical drawing of the symbol on a 124 by 100 unit grid with annotated frame stroke 7.5, corner radius 18, bar at 24, horizon at 74, sun radius 27 and a solid volume offset of 8 and 9, plus the two support colours.',
    caption: 'The symbol on a 124 × 100 grid: frame 7.5, corner radius 18, sun radius 27 and a solid shadow pushed 8 right and 9 down.',
  },
  {
    n: 5,
    file: 'manual/m-05.webp',
    bg: '#F4ECE4',
    title: 'Logotype',
    alt: 'Manual page Logotipo principal showing the horizontal logo with baseline, x-height, ascender and descender guides and the clear-space box equal to the height of the letter a.',
    caption: 'Sora ExtraBold plus Sora Regular, all lowercase. Clear space equals the height of the letter “a”.',
  },
  {
    n: 6,
    file: 'manual/m-06.webp',
    bg: '#DC4C2C',
    title: 'Logo versions',
    alt: 'Four full-height colour columns showing the logo versions: horizontal on paper, vertical on wheat yellow, symbol alone on holm-oak green and the round seal on poppy red.',
    caption: 'Four forms on four brand colours: horizontal, vertical, symbol and seal.',
  },
  {
    n: 7,
    file: 'manual/m-07.webp',
    bg: '#F4ECE4',
    title: 'Colour use',
    alt: 'Six logo-on-colour tiles (paper, holm-oak, poppy, wheat, night, one ink on white) and four crossed-out misuse examples: do not distort, do not change the colours, do not change the order, do not use on competing backgrounds.',
    caption: 'Approved backgrounds, and four ways not to use the logo: stretched, recoloured, reordered or on a competing background.',
  },
  {
    n: 8,
    file: 'manual/m-08.webp',
    bg: '#F4ECE4',
    title: 'Palette',
    alt: 'Manual page Los colores del Vallès en junio with five large swatches, Poppy E5502F, Wheat F2CF6B, Holm oak 1E4634, Paper F7F2E8 and Night 18181B, each with RGB, CMYK and a usage note, and a bar showing the approximate proportion of use.',
    caption: '“The colours of the Vallès in June”: five swatches with RGB and CMYK, and a bar for how much of each to use. Plate 3 rebuilds it.',
  },
  {
    n: 9,
    file: 'manual/m-09.webp',
    bg: '#1C4434',
    title: 'Typography',
    alt: 'Holm-oak green page with three giant Aa specimens: Sora ExtraBold for headlines and the logotype, Figtree Regular to Bold for text, DM Mono Medium for labels and data.',
    caption: 'Sora for the voice, Figtree for the reader, DM Mono for the programmer. All three are free Google fonts.',
  },
  {
    n: 10,
    file: 'manual/m-10.webp',
    bg: '#F4ECE4',
    title: 'Elements and voice',
    alt: 'Left: a poppy 72 h sticker, the round seal, the three-window sequence and the app icon. Right: the voice rule Como en el mostrador, no como en un folleto with three yes and no phrase pairs.',
    caption: 'The “72 h” sticker, the seal and the app icon, all with a thick outline and a solid shadow. On the right, the voice: “like at the counter, not like in a brochure”.',
  },
  {
    n: 11,
    file: 'manual/m-11.webp',
    bg: '#F4ECE4',
    title: 'Website',
    alt: 'A laptop and a phone on a holm-oak green and sand backdrop showing the Plana Digital website: Catalan headline La web del teu negoci, llesta en 72 hores, a green three-days card and a fixed-price footer strip.',
    caption: 'The website on a laptop and a phone: the headline, the three-days card and a strip of plain commitments.',
    sample: true,
  },
  {
    n: 12,
    file: 'manual/m-12.webp',
    bg: '#F4ECE4',
    title: 'Apparel',
    alt: 'A white T-shirt with a small logo, a green T-shirt with the large red seal, and a cotton tote bag reading Fet a Cardedeu with the symbol.',
    caption: 'A small logo on the chest for every day, the big seal for fairs and events, and a tote.',
    sample: true,
  },
  {
    n: 13,
    file: 'manual/m-13.webp',
    bg: '#F4ECE4',
    title: 'Street sign',
    alt: 'Flat illustration of a shop front: green fascia sign with the logo, window vinyl with Estudi web, an Obert door sign and a round hanging seal sign.',
    caption: 'A holm-oak fascia, vinyl on the window and a round hanging seal that can be read from the pavement. The opening hours are made up.',
    sample: true,
  },
  {
    n: 14,
    file: 'manual/m-14.webp',
    bg: '#F4ECE4',
    title: 'Cards and letter',
    alt: 'Business cards in paper and holm-oak green, a proposal letter, a round seal sticker and a red 72 h sticker on a wheat-yellow surface.',
    caption: 'Two-sided cards, a proposal letter, die-cut stickers and a seal to close envelopes. Names, phone, e-mail and the bakery are placeholders.',
    sample: true,
  },
  {
    n: 15,
    file: 'manual/m-15.webp',
    bg: '#F4ECE4',
    title: 'Van',
    alt: 'A white van with a green lower band and a large poppy sun rising from it in front of hills; side text Webs llestes en 72 hores and the logo.',
    caption: 'Side lettering where the sun rises from the green stripe, as in the symbol. The phone and web address are placeholders.',
    sample: true,
  },
  {
    n: 16,
    file: 'manual/m-16.webp',
    bg: '#F4ECE4',
    title: 'Social',
    alt: 'An Instagram profile on a phone and three square post templates: a 72 h process card, Diem web. No solució digital 360º, and a before and after card for an example bakery.',
    caption: 'Instagram templates that alternate the colours: process, phrases, before and after, brand pieces. The follower numbers and the bakery are made up.',
    sample: true,
  },
  {
    n: 17,
    file: 'manual/m-17.webp',
    bg: '#DC4C2C',
    title: 'Closing',
    alt: 'Poppy-red closing page with the round seal and the line Ens veiem a la Plana above the web, email and town line.',
    caption: '“Ens veiem a la Plana”: see you in la Plana. The web address and e-mail on this page are placeholders.',
    sample: true,
  },
]

/* ---- plate 7: the website tour --------------------------------------------------------------------------------------------- */

export interface TourStop {
  id: 'hero' | 'services' | 'process' | 'closing'
  label: string
  caption: string
}

export const TOUR_STOPS: TourStop[] = [
  {
    id: 'hero',
    label: 'Hero',
    caption: 'The first screen: the symbol, the promise in plain words (“The website for your business, ready in 72 hours”) and four commitments.',
  },
  {
    id: 'services',
    label: 'Services',
    caption: '“We say ‘website’. Not ‘360° digital solution’.” Services as a typographic list, no icons.',
  },
  {
    id: 'process',
    label: '0 to 72 h',
    caption: 'Scroll-driven: the counter runs from 0 h to 72 h while a sample bakery site builds itself, step by step.',
  },
  {
    id: 'closing',
    label: 'Closing',
    caption: 'The orange footer with the round seal: “See you in la Plana.”',
  },
]

