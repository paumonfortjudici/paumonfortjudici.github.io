// Somia world: every file name, size, caption and chapter marker in one place.
// Sources: public/works/somia/web/manifest.json (file, w, h, description) and notes/web-capture.md (copy, palette, translations).
// Nothing here is invented: captions describe what the captures show, hex values are the shop's own theme tokens
// (sage and concrete are sampled from the photography and say so).

import { asset } from '../../lib/asset'

export const cap = (file: string): string => asset(`/works/somia/web/${file}`)

// ---- the scrolling showcase ------------------------------------------------------------------------------------------

export interface Slice {
  file: string
  /** natural size of the capture */
  w: number
  h: number
  alt: string
}

export interface Chapter {
  id: string
  label: string
  /** scroll offset in the page's own pixels (desktop: 1440 wide, phone: 390 wide) where the section starts */
  at: number
}

/** what the section on show says, in English (the shop's own words are Spanish); `es` is the original where it is short and printed */
export interface Caption {
  en: string
  es?: string
}

export interface Variant {
  slices: Slice[]
  chapters: Chapter[]
  /** the viewport of the page that was captured: what one screen of the mockup shows */
  view: { w: number; h: number }
}

export interface TourPage {
  id: 'home' | 'collection' | 'product'
  label: string
  /** original Spanish name of the page where the shop has one */
  es: string
  /** the real path on somia.store (shown as the address under the page switcher) */
  path: string
  /** the translation card, by chapter id (desktop and phone share the section names) */
  captions: Record<string, Caption>
  desktop: Variant
  mobile: Variant
}

const DESKTOP_VIEW = { w: 1440, h: 900 } as const
const PHONE_VIEW = { w: 390, h: 844 } as const

export const TOUR: TourPage[] = [
  {
    id: 'home',
    label: 'Home',
    es: 'Inicio',
    path: '',
    captions: {
      hero: { en: 'Join sustainable fashion', es: 'únete a la moda ecológica' },
      tiles: { en: 'Jackets, waistcoats, shirts and blouses, jumpers' },
      film: { en: 'Discover sustainable clothes', es: 'descubre las prendas sostenibles' },
      look: { en: 'Buy your sustainable look', es: 'compra tu look sostenible' },
      story: { en: 'Sustainability and elegance in every garment', es: 'sostenibilidad y elegancia en cada prenda' },
      values: { en: 'Sustainability, quality, proximity, solidarity' },
      footer: { en: 'Newsletter, links and payment logos' },
    },
    desktop: {
      view: DESKTOP_VIEW,
      slices: [
        {
          file: 'home-desktop-fullpage.webp',
          w: 1440,
          h: 8496,
          alt: 'The whole Somia home page as one long screenshot: a hero film with the motto painted on a wall, category tiles, a film of a knitting machine, a shoppable look, the brand story in three steps, four values, questions, the newsletter block with the ring stamp and the footer.',
        },
      ],
      chapters: [
        { id: 'hero', label: 'Hero', at: 0 },
        { id: 'tiles', label: 'Tiles', at: 900 },
        { id: 'film', label: 'Film', at: 2058 },
        { id: 'look', label: 'Look', at: 2832 },
        { id: 'story', label: 'Story', at: 3868 },
        { id: 'values', label: 'Values', at: 5868 },
        { id: 'footer', label: 'Footer', at: 7596 },
      ],
    },
    mobile: {
      view: PHONE_VIEW,
      slices: [
        { file: 'home-mobile-01.webp', w: 780, h: 1688, alt: 'Somia home on a phone: the header, the hero film with the headline "tienda de ropa de mujer sostenible" and an outlined button.' },
        { file: 'home-mobile-02.webp', w: 780, h: 1604, alt: 'Home on a phone: two category tiles, jackets and shirts.' },
        { file: 'home-mobile-03.webp', w: 780, h: 1596, alt: 'Home on a phone: two category tiles, waistcoats and jumpers.' },
        { file: 'home-mobile-04.webp', w: 780, h: 1562, alt: 'Home on a phone: a film of the knitting machine with a link to the sustainable garments.' },
        { file: 'home-mobile-05.webp', w: 780, h: 1482, alt: 'Home on a phone: "compra tu look sostenible", a shoppable look with hotspots and a black button.' },
        { file: 'home-mobile-06.webp', w: 780, h: 1960, alt: 'Home on a phone: the story carousel and the first of four value icons.' },
        { file: 'home-mobile-07.webp', w: 780, h: 1974, alt: 'Home on a phone: frequently asked questions, the Instagram handle and the motto running as a marquee.' },
        { file: 'home-mobile-08.webp', w: 780, h: 1978, alt: 'Home on a phone: the newsletter block with the ring stamp, the wordmark and the first footer links.' },
        { file: 'home-mobile-09.webp', w: 780, h: 1218, alt: 'Home on a phone: the footer links and the payment logos.' },
      ],
      chapters: [
        { id: 'hero', label: 'Hero', at: 0 },
        { id: 'tiles', label: 'Tiles', at: 844 },
        { id: 'film', label: 'Film', at: 2444 },
        { id: 'look', label: 'Look', at: 3225 },
        { id: 'story', label: 'Story', at: 3966 },
        { id: 'values', label: 'Values', at: 4640 },
        { id: 'footer', label: 'Footer', at: 5933 },
      ],
    },
  },
  {
    id: 'collection',
    label: 'Collection',
    es: 'Vincles',
    path: '/collections/vincles',
    captions: {
      grid: { en: 'The Vincles collection, four to a row' },
      more: { en: 'More rows of bags and accessories' },
    },
    desktop: {
      view: DESKTOP_VIEW,
      slices: [
        { file: 'collection-vincles-desktop-01.webp', w: 1440, h: 1555, alt: 'The Vincles collection page: breadcrumb, serif title, filter bar and a four-column grid of product cards with NEW badges and colour dots.' },
        { file: 'collection-vincles-desktop-02.webp', w: 1440, h: 1727, alt: 'The Vincles collection page, further rows of bags and accessories.' },
      ],
      chapters: [
        { id: 'grid', label: 'Grid', at: 0 },
        { id: 'more', label: 'More rows', at: 1555 },
      ],
    },
    mobile: {
      view: PHONE_VIEW,
      slices: [
        { file: 'collection-vincles-mobile-01.webp', w: 780, h: 1994, alt: 'The Vincles collection on a phone: header, title, filter and the first product cards in two columns.' },
        { file: 'collection-vincles-mobile-02.webp', w: 780, h: 1590, alt: 'The Vincles collection on a phone: second block of the product grid.' },
        { file: 'collection-vincles-mobile-03.webp', w: 780, h: 1492, alt: 'The Vincles collection on a phone: third block of the product grid.' },
        { file: 'collection-vincles-mobile-04.webp', w: 780, h: 746, alt: 'The Vincles collection on a phone: fourth block of the product grid.' },
      ],
      chapters: [
        { id: 'grid', label: 'Grid', at: 0 },
        { id: 'more', label: 'More rows', at: 997 },
      ],
    },
  },
  {
    id: 'product',
    label: 'Product',
    es: 'Producto',
    path: '/products/chaqueta-xivitona-gris',
    captions: {
      gallery: { en: 'Add to basket', es: 'añadir a la cesta' },
      related: { en: 'Related products', es: 'productos relacionados' },
      reviews: { en: 'What do our customers think?', es: '¿qué opinan nuestras clientas?' },
      footer: { en: 'Newsletter and footer' },
    },
    desktop: {
      view: DESKTOP_VIEW,
      slices: [
        { file: 'product-desktop-01.webp', w: 1440, h: 1970, alt: 'A Somia product page: breadcrumb, a two-column photo gallery, title, price, description, size and colour pickers, a black add-to-basket button and an accordion.' },
        { file: 'product-desktop-02.webp', w: 1440, h: 1782, alt: 'The product page continued: the last gallery photo, a carousel of related products and the reviews block.' },
        { file: 'product-desktop-03.webp', w: 1440, h: 1084, alt: 'The product page continued: the newsletter block with the ring stamp and the footer.' },
      ],
      chapters: [
        { id: 'gallery', label: 'Gallery', at: 0 },
        { id: 'related', label: 'Related', at: 2480 },
        { id: 'reviews', label: 'Reviews', at: 3300 },
        { id: 'footer', label: 'Footer', at: 3936 },
      ],
    },
    mobile: {
      view: PHONE_VIEW,
      slices: [
        { file: 'product-mobile-01.webp', w: 780, h: 1904, alt: 'A product page on a phone: breadcrumb, a swipe gallery with dots and a sticky add-to-basket bar.' },
        { file: 'product-mobile-02.webp', w: 780, h: 1752, alt: 'The product page on a phone: title, price, description, size and colour pickers, quantity and accordions.' },
        { file: 'product-mobile-03.webp', w: 780, h: 1404, alt: 'The product page on a phone: the last accordion rows and a horizontal carousel of related products.' },
        { file: 'product-mobile-04.webp', w: 780, h: 1858, alt: 'The product page on a phone: the reviews block, the newsletter block and the start of the footer.' },
        { file: 'product-mobile-05.webp', w: 780, h: 1984, alt: 'The product page on a phone: the footer links and the payment logos.' },
      ],
      chapters: [
        { id: 'gallery', label: 'Gallery', at: 0 },
        { id: 'related', label: 'Related', at: 1828 },
        { id: 'reviews', label: 'Reviews', at: 2530 },
        { id: 'footer', label: 'Footer', at: 3607 },
      ],
    },
  },
]

// ---- brand strip ---------------------------------------------------------------------------------------------------------

export interface Swatch {
  id: string
  name: string
  hex: string
  role: string
  /** sampled from the photographs rather than read from the theme's CSS */
  sampled?: boolean
}

export const PALETTE: Swatch[] = [
  { id: 'ink', name: 'Ink', hex: '#1C1C1C', role: 'Text and the main button' },
  { id: 'black', name: 'Black', hex: '#040404', role: 'The wordmark' },
  { id: 'paper', name: 'Paper', hex: '#F5F4F1', role: 'Announcement bar and story band' },
  { id: 'grey', name: 'Light grey', hex: '#EFEFEF', role: 'Review and placeholder blocks' },
  { id: 'white', name: 'White', hex: '#FFFFFF', role: 'Header and pages' },
  { id: 'peri', name: 'Periwinkle', hex: '#BFD2E8', role: 'The NEW badge' },
  { id: 'sage', name: 'Sage', hex: '#A9AA98', role: 'The painted wall', sampled: true },
  { id: 'concrete', name: 'Concrete', hex: '#8D8780', role: 'The plaster wall', sampled: true },
]

export interface ValueTag {
  id: string
  es: string
  en: string
  icon: string
  alt: string
  /** my English reading of the Spanish line the shop prints under each icon */
  note: string
}

export const VALUES: ValueTag[] = [
  {
    id: 'sostenibilidad',
    es: 'Sostenibilidad',
    en: 'Sustainability',
    icon: 'brand/icon-sostenibilidad.png',
    alt: 'Line icon of a hanger with recycling arrows',
    note: 'Designed for you with the planet in mind: local production and responsible fashion.',
  },
  {
    id: 'calidad',
    es: 'Calidad',
    en: 'Quality',
    icon: 'brand/icon-calidad.png',
    alt: 'Line icon of three buttons',
    note: 'Every garment is made to last, with first-rate materials and careful finishes.',
  },
  {
    id: 'proximidad',
    es: 'Proximidad',
    en: 'Proximity',
    icon: 'brand/icon-proximidad.png',
    alt: 'Line icon of a needle, a thread and a leaf',
    note: 'Everything is made in nearby workshops and factories.',
  },
  {
    id: 'solidaridad',
    es: 'Solidaridad',
    en: 'Solidarity',
    icon: 'brand/icon-solidaridad.png',
    alt: 'Line icon of two hands',
    note: 'Much of the collection is made in social-inclusion workshops.',
  },
]

export const BRAND = {
  wordmarkDark: cap('brand/logo-somia-dark.png'),
  wordmarkWhite: cap('brand/logo-somia-white.png'),
  ring: cap('brand/letra-somia.png'),
  ribbon: cap('brand/sello-somia.png'),
  favicon: cap('brand/favicon-somia.png'),
} as const

// ---- framed pictures -------------------------------------------------------------------------------------------------------

export interface Framed {
  id: string
  file: string
  w: number
  h: number
  /** short English title under the frame */
  title: string
  /** the Spanish original visible in the picture, when there is one */
  es?: string
  /** its English translation (not for place names or collection names) */
  tr?: string
  /** one line for the lightbox */
  note: string
  alt: string
  frame: 'black' | 'white' | 'sage'
  /** show a portrait crop in the wall; the lightbox always shows the whole picture */
  crop?: { ratio: string; x: string; y: string }
}

export const FRAMED: Framed[] = [
  {
    id: 'hero',
    file: 'home-desktop-hero@2x.webp',
    w: 2880,
    h: 1800,
    title: 'Home, first screen',
    es: 'tienda de ropa de mujer sostenible',
    tr: 'sustainable women’s clothing shop',
    note: 'A campaign film behind a centred headline and an outlined button, with the motto painted on the wall.',
    alt: 'The Somia home page, first screen: two women leaning on a concrete and a sage wall, the headline "tienda de ropa de mujer sostenible", an outlined button and the motto "visto como pienso" lettered in chalk.',
    frame: 'black',
  },
  {
    id: 'product',
    file: 'product-desktop-hero@2x.webp',
    w: 2880,
    h: 1800,
    title: 'Product page',
    note: 'A two-column photo gallery on the left; title, price, size and colour pickers and a black button on the right.',
    alt: 'A Somia product page: a two-column gallery of photographs on the left, and on the right the title, price, size and colour pickers and a black add-to-basket button.',
    frame: 'white',
    crop: { ratio: '4 / 5', x: '12%', y: '40%' },
  },
  {
    id: 'menu',
    file: 'menu-mujer-desktop.webp',
    w: 1440,
    h: 900,
    title: 'Mega menu',
    es: 'Mujer',
    tr: 'Women',
    note: 'Hover the navigation and a white panel opens with the sub-categories and two campaign photographs.',
    alt: 'The Mujer mega menu open over the home hero: a white panel with a list of sub-categories and two campaign photographs.',
    frame: 'sage',
  },
  {
    id: 'collection',
    file: 'collection-vincles-desktop-hero@2x.webp',
    w: 2880,
    h: 1800,
    title: 'Collection page',
    es: 'Vincles',
    note: 'Breadcrumb, a serif title, a filter bar and a four-column grid with NEW badges and colour dots.',
    alt: 'The Vincles collection page: breadcrumb, a serif title, a filter bar and the start of a four-column product grid with NEW badges.',
    frame: 'black',
  },
  {
    id: 'materials',
    file: 'materials-desktop-02.webp',
    w: 1440,
    h: 900,
    title: 'Materials, one swatch at a time',
    es: 'Algodón 100%',
    tr: '100% cotton',
    note: 'A scroll story: a round fabric swatch and a single line about each of ten materials.',
    alt: 'The Materiales page: a round photograph of a twisted brown fabric on white, next to the title "Algodón 100%" and a short description.',
    frame: 'white',
  },
  {
    id: 'editorial',
    file: 'editorial-cap-de-creus-desktop-hero@2x.webp',
    w: 2880,
    h: 1800,
    title: 'Editorial lookbook',
    es: 'Cap de Creus 2026',
    note: 'A full-bleed photograph on the Catalan coast with a small white title card.',
    alt: 'The Cap de Creus 2026 editorial: a woman in a cream suit sitting by the sea under a blue sky, with a small white title card.',
    frame: 'black',
  },
  {
    id: 'story',
    file: 'home-desktop-05.webp',
    w: 1440,
    h: 900,
    title: 'Story scene, with the ring stamp',
    es: 'ropa sostenible y ecológica para vivir con estilo y consciencia',
    tr: 'sustainable, ecological clothes to live with style and awareness',
    note: 'A sticky scroll story: workshop photographs collaged next to the text, with the ring stamp on top.',
    alt: 'A scene of the home page story: the headline "ropa sostenible y ecológica para vivir con estilo y consciencia", a black button and a collage of workshop photographs with the ring stamp.',
    frame: 'sage',
    crop: { ratio: '4 / 5', x: '92%', y: '50%' },
  },
  {
    id: 'cart',
    file: 'cart-desktop-01.webp',
    w: 1440,
    h: 900,
    title: 'The empty basket',
    es: 'Tu compra apoya la inserción laboral de mujeres en Barcelona.',
    tr: 'Your purchase supports the job placement of women in Barcelona.',
    note: 'The basket drawer slides over the page: an empty basket, a few short reassurances and the motto at the bottom.',
    alt: 'The empty basket drawer sliding over a dimmed page, with a line of trust messages and a green line about supporting the job placement of women in Barcelona.',
    frame: 'white',
  },
]

// ---- the chalk lettering -------------------------------------------------------------------------------------------------

export const MOTTO = {
  es: 'visto como pienso',
  en: 'dressed as I think',
} as const
