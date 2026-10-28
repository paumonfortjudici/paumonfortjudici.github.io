// Page data of the Proyecto Contract flipbook, copied from public/works/contract/manifest.json (never guess a path: read the
// manifest). Page images are single pages; the book pairs them (even left, odd right) exactly as `SPREADS` lists.

export type PageKind = 'cover' | 'ad' | 'toc' | 'credits' | 'opener' | 'photo' | 'text-grid' | 'news'

/** [left, top, width, height] in percent of the page */
export type Box = [number, number, number, number]

export interface PageDef {
  /** printed page number in the full issue (1 = front cover, 230 = back cover) */
  n: number
  /** path under /works/contract/ */
  file: string
  w: number
  h: number
  /** the manifest description of the page: used as the alt text */
  note: string
  kind: PageKind
  /** advertiser artwork, not magazine layout */
  ad?: boolean
}

export const PAGES: PageDef[] = [
  { n: 1, file: 'cover.webp', w: 1400, h: 1869, kind: 'cover', note: 'Front cover. Interstate masthead over a full-bleed hotel-lobby photograph; the blue band announces the bound-in Proyecto Contract 223.' },
  { n: 2, file: 'pages/p-002.webp', w: 1000, h: 1331, kind: 'ad', ad: true, note: 'Full-page advertisement (Tecsoled lighting) facing the contents page.' },
  { n: 3, file: 'pages/p-003.webp', w: 1000, h: 1331, kind: 'toc', note: 'SUMARIO. Rust-orange vertical tab, four numbered photo thumbnails and a seven-section contents list set in Caecilia.' },
  { n: 4, file: 'pages/p-004.webp', w: 1000, h: 1331, kind: 'credits', note: "HALL editorial and masthead. 'Pau Monfort' is listed in the masthead under Redacción." },
  { n: 5, file: 'pages/p-005.webp', w: 1000, h: 1331, kind: 'ad', ad: true, note: 'Full-page advertisement (Inclass furniture) facing the masthead.' },
  { n: 32, file: 'pages/p-032.webp', w: 1000, h: 1331, kind: 'opener', note: 'SALA DE VISITAS opener. Rust-orange panel with a white pull-quote in Caecilia Heavy beside a portrait.' },
  { n: 33, file: 'pages/p-033.webp', w: 1000, h: 1331, kind: 'photo', note: 'Interview portrait on a clean shelf wall; folio and running head in the margin.' },
  { n: 34, file: 'pages/p-034.webp', w: 1000, h: 1331, kind: 'text-grid', note: 'Interview spread. Wide photo with an overlaid pull-quote, two-column Q&A and boxed project captions in rust type.' },
  { n: 35, file: 'pages/p-035.webp', w: 1000, h: 1331, kind: 'text-grid', note: 'Interview continues: photo stack, serif Q&A column and a boxed caption.' },
  { n: 42, file: 'pages/p-042.webp', w: 1000, h: 1331, kind: 'opener', note: "OPEN SPACE opener 'Madrid entre molduras' (Mercer Hotel Madrid). Rust tab, title and standfirst over a full-bleed lobby photo." },
  { n: 43, file: 'pages/p-043.webp', w: 1000, h: 1331, kind: 'photo', note: 'Right half of the double-page lobby photograph.' },
  { n: 60, file: 'pages/p-060.webp', w: 1000, h: 1331, kind: 'opener', note: 'Gran Hotel Barcino opener. Portrait-crop detail photo above a centred Caecilia headline and standfirst.' },
  { n: 61, file: 'pages/p-061.webp', w: 1000, h: 1331, kind: 'photo', note: 'Full-height photograph of the stone courtyard.' },
  { n: 72, file: 'pages/p-072.webp', w: 1000, h: 1331, kind: 'opener', note: "Waldorf Astoria Seychelles opener 'Santuario en el Índico'. Double-page chandelier photo with a translucent title box; byline 'Textos: Pau Monfort.'" },
  { n: 73, file: 'pages/p-073.webp', w: 1000, h: 1331, kind: 'photo', note: 'Right half of the double-page chandelier photograph.' },
  { n: 82, file: 'pages/p-082.webp', w: 1000, h: 1331, kind: 'photo', note: 'Les Clarisses. Panoramic double-page image under a hanging leaf installation, with a two-column caption.' },
  { n: 83, file: 'pages/p-083.webp', w: 1000, h: 1331, kind: 'photo', note: 'Right half of the panoramic image; small caption columns set in white.' },
  { n: 110, file: 'pages/p-110.webp', w: 1000, h: 1331, kind: 'opener', note: 'Catalonia Plaza España opener. Full-bleed reception photo spanning both pages.' },
  { n: 111, file: 'pages/p-111.webp', w: 1000, h: 1331, kind: 'opener', note: "Title 'Bienestar al mando' set over the counter; byline 'Textos: Pau Monfort.'" },
  { n: 130, file: 'pages/p-130.webp', w: 1000, h: 1331, kind: 'news', note: 'ZONA VIP news page: rust tab, large Interstate headline and a graffiti photo for the Interihotel MAD26 fair.' },
  { n: 131, file: 'pages/p-131.webp', w: 1000, h: 1331, kind: 'cover', note: 'Cover of the bound-in Proyecto Contract 223: blue retail-interior photograph and Interstate cover lines.' },
  { n: 150, file: 'pages/p-150.webp', w: 1000, h: 1331, kind: 'text-grid', note: 'LOUNGE COLLECTION. Six mini-features in a strict grid, photos alternating left and right with hairline rules.' },
  { n: 151, file: 'pages/p-151.webp', w: 1000, h: 1331, kind: 'text-grid', note: 'Grid continues: three more projects, text columns facing photos.' },
  { n: 152, file: 'pages/p-152.webp', w: 1000, h: 1331, kind: 'opener', note: "Lady Pipa opener 'Retail hipnótico'. Rust OPEN SPACE tab and white serif title over a blue interior." },
  { n: 153, file: 'pages/p-153.webp', w: 1000, h: 1331, kind: 'photo', note: 'Right half of the blue retail photograph.' },
  { n: 186, file: 'pages/p-186.webp', w: 1000, h: 1331, kind: 'opener', note: "Nude Project opener 'Escenografía kubrickiana'. Portrait photo over a centred headline; byline 'Textos: Pau Monfort.'" },
  { n: 187, file: 'pages/p-187.webp', w: 1000, h: 1331, kind: 'photo', note: 'Full-height photograph of the speaker-wall arch.' },
  { n: 220, file: 'pages/p-220.webp', w: 1000, h: 1331, kind: 'opener', note: "ARCHIVO opener 'Materia técnica, uso exigente'. Olive field, rust tab and an illustration by Luca Deu." },
  { n: 221, file: 'pages/p-221.webp', w: 1000, h: 1331, kind: 'photo', note: 'Right half of the illustration.' },
  { n: 230, file: 'pages/p-230.webp', w: 1000, h: 1335, kind: 'ad', ad: true, note: 'Back cover: advertisement (Roca, Kay tap collection).' },
]

/** Real pairs of the issue: [1] is the front cover, [230] the back cover. The spread index is the position in this list. */
export const SPREADS: number[][] = [[1], [2, 3], [4, 5], [32, 33], [34, 35], [42, 43], [60, 61], [72, 73], [82, 83], [110, 111], [130, 131], [150, 151], [152, 153], [186, 187], [220, 221], [230]]

export const TOTAL_PAGES = 230

/** pages of the 30 in the book that carry my name: the masthead (4) and three Textos bylines (72, 111, 186) */
export const MY_PAGES = [4, 72, 111, 186]

/** width / height of the inside pages */
export const PAGE_ASPECT = 1000 / 1331

/** trim size of one page in millimetres (the PDF page box is 593.6 x 790.3 pt) */
export const PAGE_MM = { w: 209, h: 279 }

/** The masthead crop (credit.webp, an 8x render) and where my name sits on page 4. */
export const CREDIT = {
  page: 4,
  file: 'credit.webp',
  w: 992,
  h: 392,
  /** the ellipse that encloses the name without touching its neighbour */
  circle: [25.472, 71.172, 8.715, 2.509] as Box,
  name: [26.988, 71.932, 6.609, 0.99] as Box,
  /** the region of the page that credit.webp shows; its image is 0.633 % taller than the crop (5 pt of flat colour were added below) */
  crop: [25.944, 68.704, 20.89, 6.2] as Box,
}

export interface BylineDef {
  page: number
  file: string
  /** feature name and the headline it ran under */
  feature: string
  headline: string
  /** the name on the page */
  name: Box
  /** the whole credit line on the page */
  line: Box
  /** that page is one of the 30 in the flipbook */
  inBook: boolean
  /** size of the crop image */
  w: number
  h: number
  /** where the printed text starts and ends inside the crop, as a fraction of its width (measured from the pixels) */
  start: number
  end: number
  /** where the word "Textos:" and the name "Pau" start inside the crop, in px of the crop image (measured from the pixels) */
  textos: number
  pau: number
}

export const BYLINES: BylineDef[] = [
  {
    page: 72,
    file: 'bylines/byline-072.webp',
    feature: 'Waldorf Astoria Seychelles Platte Island',
    headline: 'Santuario en el Índico',
    name: [43.467, 41.669, 10.28, 1.532],
    line: [14.073, 41.669, 39.674, 1.532],
    inBook: true,
    w: 1509,
    h: 133,
    start: 0.0338,
    end: 0.9636,
    textos: 880,
    pau: 1097,
  },
  {
    page: 91,
    file: 'bylines/byline-091.webp',
    feature: 'Palacio de Córdoba',
    headline: 'Imaginario andalusí',
    name: [80.126, 26.966, 10.657, 1.618],
    line: [49.589, 26.966, 41.194, 1.618],
    inBook: false,
    w: 1511,
    h: 133,
    start: 0.0338,
    end: 0.9643,
    textos: 882,
    pau: 1099,
  },
  {
    page: 111,
    file: 'bylines/byline-111.webp',
    feature: 'Catalonia Plaza España',
    headline: 'Bienestar al mando',
    name: [47.111, 88.999, 10.28, 1.532],
    line: [9.551, 88.999, 47.84, 1.532],
    inBook: true,
    w: 1799,
    h: 133,
    start: 0.0289,
    end: 0.9700,
    textos: 1171,
    pau: 1388,
  },
  {
    page: 186,
    file: 'bylines/byline-186.webp',
    feature: 'Nude Project',
    headline: 'Escenografía kubrickiana',
    name: [63.22, 91.309, 10.28, 1.532],
    line: [26.758, 91.309, 46.742, 1.532],
    inBook: true,
    w: 1760,
    h: 133,
    start: 0.0295,
    end: 0.9693,
    textos: 1132,
    pau: 1349,
  },
  {
    page: 195,
    file: 'bylines/byline-195.webp',
    feature: "L'Arc",
    headline: 'Vestigios bajo el cristal',
    name: [77.291, 29.877, 10.28, 1.532],
    line: [47.617, 29.877, 39.954, 1.532],
    inBook: false,
    w: 1519,
    h: 133,
    start: 0.0336,
    end: 0.9645,
    textos: 890,
    pau: 1107,
  },
  {
    page: 213,
    file: 'bylines/byline-213.webp',
    feature: 'Clínica ID Medicina Estética',
    headline: 'Cuidado táctil',
    name: [68.401, 89.593, 10.28, 1.532],
    line: [19.117, 89.593, 59.565, 1.532],
    inBook: false,
    w: 2217,
    h: 133,
    start: 0.0235,
    end: 0.9756,
    textos: 1588,
    pau: 1806,
  },
]
