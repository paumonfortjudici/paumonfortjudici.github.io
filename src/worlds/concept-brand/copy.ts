// Gotet world: every sentence in one place. Pau talks in the first person about what HE did: the brief, the art direction and
// the rules in the brand guide. The artwork itself was produced with AI-assisted tools under that direction (said once on the
// overview, once on the last tour stop and once in the facts slate), never "I drew". Gotet is invented: nobody hired me and nothing opened.
// Catalan appears only where it is the brand's own copy (catchphrases, poster titles, menu lines).
import type { ColourId, GroupId, MascotId } from './data'

export interface Sample {
  text: string
  kind: 'display' | 'italic' | 'label'
}

export interface ItemCopy {
  lines: string[]
  palette: ColourId[]
  samples: Sample[]
  /** real-world size and how it sits on the board (guide 7.2) */
  real?: string
  board?: string
  scale?: string
}

const d = (text: string): Sample => ({ text, kind: 'display' })
const i = (text: string): Sample => ({ text, kind: 'italic' })
const l = (text: string): Sample => ({ text, kind: 'label' })

export const ITEMS: Record<string, ItemCopy> = {
  wordmark: {
    lines: [
      'Gotet is a Catalan diminutive of got, a glass: a little glass. So the logo had to feel like one.',
      'My rule for the letters: fat, round-ended tubes, each bouncing on its own baseline, with a hard blue shadow. The “o” is a stuffed olive, with a red pimento and a glint.',
      'It is never retyped, rotated, stretched or given a second shadow.',
    ],
    palette: ['vermell', 'oliva', 'blau', 'rosat', 'tinta'],
    samples: [d('gotet'), l('VERMUTERIA DE BARRI')],
    real: 'Minimum 100 px or 22 mm wide',
    board: '1900 × 706 px at the top of the board',
  },
  m01: {
    lines: [
      'It is the only scene on the board, so it is the only place where I let big shapes carry a 4 px ink line.',
      'I chose blue and pink for the awning on purpose: alternating red and yellow stripes read as the Catalan flag, so I banned them everywhere.',
      'The window decal is blue, because pink on pink glass would vanish.',
    ],
    palette: ['mantega', 'blau', 'rosat', 'oliva', 'vermell', 'tinta'],
    samples: [i('Gotet petit. Diumenge gran.'), l('VERMUTERIA DE BARRI')],
    real: 'About 3400 × 1300 mm',
    board: '1035 × 392 px',
    scale: '0.30 px per mm',
  },
  m02: {
    lines: [
      'Social posts are 4:5 and full-bleed, and I give each one a single thing to say. This one says good morning, with Gotet doing the greeting.',
      'One wink per piece. I keep exclamation marks inside the characters’ sound words, so this tile stays calm.',
    ],
    palette: ['rosat', 'vermell', 'blau', 'tinta'],
    samples: [d('Bon dia, bon vermut.'), l('DIUMENGE, DE 12 A 18 H')],
    real: '1080 × 1350 px post (4:5)',
    board: '329 × 392 px',
    scale: 'Screen, not print',
  },
  m03: {
    lines: [
      'Sound words are the only place I allow shouting, so “Crec!” is the loudest thing the brand ever does: yellow on red, with a hard ink shadow.',
      'The price is big on purpose. Yellow on red only passes the contrast rules at large sizes.',
    ],
    palette: ['vermell', 'mantega', 'rosat', 'tinta'],
    samples: [d('CREC!'), i('Xips de la casa')],
    real: '1080 × 1350 px post (4:5)',
    board: '329 × 392 px',
    scale: 'Screen, not print',
  },
  m04: {
    lines: [
      'On the green tile every word is Tinta. Pink on olive is only 2.09 : 1, so I banned it.',
      'Sifó sprays into a glass: the splash is the product demo, with the price underneath in small caps.',
    ],
    palette: ['oliva', 'tinta', 'blau', 'rosat', 'mantega'],
    samples: [d('UN RAIG DE DIUMENGE'), i('A splash of Sunday.'), l('VERMUT AMB SIFÓ · 3,90 €')],
    real: '1080 × 1350 px post (4:5)',
    board: '329 × 392 px',
    scale: 'Screen, not print',
  },
  m05: {
    lines: [
      'Three cups, three colours, and a rule that the lids never overlap. The yellow-on-red pattern is clipped to the cup, so the print stays inside the object.',
      'The blue cup carries the reverse wordmark, the only one allowed on Blau. The yellow cup lets Oliva carry the print.',
    ],
    palette: ['rosat', 'blau', 'vermell', 'mantega', 'tinta'],
    samples: [l('PER EMPORTAR')],
    real: '85 mm across the top × 110 mm',
    board: '196 × 253 px each',
    scale: '2.3 px per mm',
  },
  m06: {
    lines: [
      'Six items, Catalan first and the English gloss second, in italics. Names are Fraunces 700 and prices are Fraunces 900 in red, because only big, heavy red passes contrast.',
      'The footer says “Gaudeix-ne amb seny”, enjoy it sensibly. It is an alcohol brand and I wanted the menu to say so.',
    ],
    palette: ['oliva', 'rosat', 'blau', 'mantega', 'vermell', 'tinta'],
    samples: [d('Vermut de la casa'), l('PER BEURE · TO DRINK')],
    real: 'A5, 148 × 210 mm',
    board: '414 × 588 px',
    scale: '2.8 px per mm',
  },
  m07: {
    lines: [
      'A stamp card is the cheapest print job in a bar, so I gave it the cheekiest copy: eight olive stamps, and the ninth vermut is on the house.',
      'The first circle is already stamped, with an olive pressed at a slight angle, so you can see how it works.',
    ],
    palette: ['mantega', 'blau', 'rosat', 'oliva'],
    samples: [l('TARGETA D’OLIVES'), d('9')],
    real: '85 × 55 mm',
    board: '238 × 154 px',
    scale: '2.8 px per mm',
  },
  m08: {
    lines: [
      'Two matchbooks, two moods. One is blue with the reverse wordmark, the other is pink and says “Encén el diumenge”: light up Sunday.',
      'I gave both the same dark striker strip with pink dots, so they read as a pair.',
    ],
    palette: ['vermell', 'blau', 'rosat', 'tinta'],
    samples: [i('Encén el diumenge.'), l('VERMUTERIA DE BARRI · CARDEDEU')],
    real: '50 × 36 mm closed',
    board: '140 × 101 px each',
    scale: '2.8 px per mm',
  },
  m09: {
    lines: [
      'House vermut, 75 cl, 15 % vol. The glass is dark Tinta with a pink shine strip, and the label is the one place where I put Gotet’s head right next to the wordmark.',
      'The small print says “Gaudeix-ne amb seny”. Cartoon characters on an alcohol label would need checking against the local advertising rules before anything was printed.',
    ],
    palette: ['rosat', 'tinta', 'vermell', 'blau', 'mantega'],
    samples: [i('Receptari del barri'), l('VERMUT DE LA CASA')],
    real: '75 mm across × 300 mm',
    board: '143 × 570 px',
    scale: '1.9 px per mm',
  },
  m10: {
    lines: [
      'Three hang tags with a punched hole and a string loop, fanned so they overlap: crisps, the big bottle and the olives.',
      'I write prices the Catalan way, 2,80 €, in Fraunces 900.',
    ],
    palette: ['oliva', 'mantega', 'rosat', 'blau', 'vermell'],
    samples: [d('2,80 €'), l('BOSSA 120 G')],
    real: '70 × 40 mm',
    board: '196 × 112 px each',
    scale: '2.8 px per mm',
  },
  m11: {
    lines: [
      'The house siphon has no face: I only give faces to the four characters, never to objects. Its head is matte Tinta because brass would disappear on the yellow tile.',
      'The label borrows Sifó’s head and says “Un raig de diumenge”, a splash of Sunday.',
    ],
    palette: ['mantega', 'blau', 'tinta', 'rosat', 'vermell'],
    samples: [i('Un raig de diumenge'), l('SIFÓ DE LA CASA')],
    real: '120 mm across × 330 mm, 1 L',
    board: '210 × 578 px',
    scale: '1.75 px per mm',
  },
  m12: {
    lines: [
      'Four crown caps, one per character, each with its head on a pink centre disc and 21 scallops around the rim.',
      'On a dark tile there is no shadow, only a 3 px pink rim light on the top left: I did not want a dark shadow that nobody could see.',
    ],
    palette: ['tinta', 'vermell', 'oliva', 'blau', 'mantega', 'rosat'],
    samples: [],
    real: '26 mm across',
    board: '70 px across each',
    scale: '2.7 px per mm',
  },
  m13: {
    lines: [
      'The front is the reverse wordmark on blue. The back has the owners’ first names, Ona and Jan, which I made up, and an invented address and phone number. Nothing on this board is real.',
      'Gotet sits in the corner of the back, so the card is friendly before it is useful.',
    ],
    palette: ['rosat', 'blau', 'mantega', 'tinta'],
    samples: [d('Ona & Jan'), l('ELS AMOS · THE OWNERS')],
    real: '85 × 55 mm',
    board: '238 × 154 px each',
    scale: '2.8 px per mm',
  },
  m14: {
    lines: [
      'Two coasters overlap on a red tile. One is yellow with Gotet’s head and a ring of text, the other is blue with the pattern clipped to the disc.',
      'I put the tagline on the ring, so a coaster does the advertising even when it is only holding a glass.',
    ],
    palette: ['vermell', 'mantega', 'blau', 'rosat', 'oliva'],
    samples: [l('GOTET PETIT · DIUMENGE GRAN')],
    real: '95 mm across',
    board: '230 px across each',
    scale: '2.4 px per mm',
  },
  m15: {
    lines: [
      'The glass from the logo, made real: red vermut over ice, a citrus wheel on the rim and an olive on a yellow stick.',
      'I added a fill line that says “Fins aquí”, up to here, so the glass tells the bar how much to pour.',
    ],
    palette: ['tinta', 'rosat', 'vermell', 'mantega'],
    samples: [l('FINS AQUÍ')],
    real: '75 mm across × 90 mm, 20 cl',
    board: '255 × 306 px',
    scale: '3.4 px per mm',
  },
  m16: {
    lines: [
      'The pattern at full strength: blue lines on pink at 0.8 scale, clipped to a folded napkin, with a second napkin peeking in from the corner.',
      'A pink plate carries the thank-you, “Gràcies per venir. Torna diumenge.”: thanks for coming, come back on Sunday. I like that the napkin says it, so the staff do not have to.',
    ],
    palette: ['mantega', 'rosat', 'blau'],
    samples: [i('Gràcies per venir. Torna diumenge.')],
    real: '165 × 165 mm',
    board: '313 × 313 px',
    scale: '1.9 px per mm',
  },
  m17: {
    lines: [
      'Carry a little Sunday. Gotet stands inside the bag so the glass sits between the wordmark and the caption and touches neither.',
      'A mascot once hung off the edge of the bag in a test render, so I wrote the rule: print stays inside the object, with at least 12 px of margin.',
    ],
    palette: ['oliva', 'rosat', 'blau', 'vermell'],
    samples: [l('CARRY A LITTLE SUNDAY.')],
    real: 'Body 380 × 420 mm',
    board: '237 × 244 px, plus handles',
    scale: '0.62 px per mm',
  },
  m18: {
    lines: [
      'A blue bib apron with the reverse wordmark on the chest and a yellow pocket that carries Oliva’s head in a dashed stitch ring.',
      'The name tag reads “Ona, cap de sifó”: head of siphon. I keep the jokes small and inside the brand’s vocabulary.',
    ],
    palette: ['rosat', 'blau', 'mantega', 'oliva', 'tinta'],
    samples: [d('Ona'), l('CAP DE SIFÓ')],
    real: '700 × 900 mm',
    board: '280 × 360 px',
    scale: '0.40 px per mm',
  },
  m19: {
    lines: [
      '“Vermut i vinils”: every Sunday at 12, with records, olives and a splash from the siphon. Free entry.',
      'I put Xip, in pose B, dancing on the record, so the flyer has one clear picture and one clear line.',
    ],
    palette: ['mantega', 'vermell', 'tinta', 'rosat'],
    samples: [d('VERMUT I VINILS'), l('CADA DIUMENGE A LES 12 H')],
    real: 'A6, 105 × 148 mm',
    board: '273 × 385 px',
    scale: '2.6 px per mm',
  },
  m20: {
    lines: [
      'Six die-cut stickers: four character heads and two sound words, “Xin-xin!” on a yellow starburst and “Psssh!” on a blue pill.',
      'Each has a 12 px pink die-cut halo outside its silhouette, and I left out the sheet and the shadow, as if you had just peeled them.',
    ],
    palette: ['tinta', 'rosat', 'mantega', 'blau'],
    samples: [d('XIN-XIN!')],
    real: 'A6, 105 × 148 mm',
    board: '273 × 385 px',
    scale: '2.6 px per mm',
  },
  p1: {
    lines: [
      '“Un raig de diumenge”: fizzy, celebratory, midday blue. I had Sifó spray an arc across the sun into Gotet’s jumping glass.',
      'It is the hero scene of the cast, the lightest and most graphic of the three, and it proves Sifó’s gag.',
    ],
    palette: ['blau', 'rosat', 'mantega', 'tinta', 'vermell'],
    samples: [d('UN RAIG'), i('A splash of Sunday.')],
    real: '1200 × 1700 px',
    board: '840 × 1190 px in a 14 px pink frame',
    scale: '0.70',
  },
  p2: {
    lines: [
      '“A les dotze, vermut”: noon on a Sunday as an olive-slice clock. The pimento is the clock face and the hands are banderillas, the cocktail sticks.',
      'I wanted one big shape that proves the olive and pimento system at poster scale. Xip peeks out from behind the clock.',
    ],
    palette: ['mantega', 'blau', 'tinta', 'oliva', 'vermell', 'rosat'],
    samples: [d('A LES DOTZE, VERMUT.'), i('Sundays, noon till six.')],
    real: '1200 × 1700 px',
    board: '840 × 1190 px in a 14 px pink frame',
    scale: '0.70',
  },
  p3: {
    lines: [
      '“Fem-ne un?”: shall we have one? The cast stands behind the counter and clinks, with bunting across the top.',
      'It is the most human scene of the three: faces, gestures, props and type. I let the counter hide their legs, so they look like they are working the bar.',
    ],
    palette: ['vermell', 'rosat', 'mantega', 'tinta', 'blau'],
    samples: [d('FEM-NE UN?'), i('Shall we have one? The table’s ready.')],
    real: '1200 × 1700 px',
    board: '840 × 1190 px in a 14 px pink frame',
    scale: '0.70',
  },
}

// ---- groups ---------------------------------------------------------------------------------------------------------------------
export interface GroupCopy {
  title: string
  sub: string
  lines: string[]
}

export const GROUPS: Record<GroupId, GroupCopy> = {
  wordmark: {
    title: 'The wordmark',
    sub: 'gotet, set as tube lettering',
    lines: ITEMS.wordmark.lines,
  },
  cast: {
    title: 'The cast',
    sub: 'Four things from the vermut table, one colour each',
    lines: [
      'Gotet the glass, Oliva the olive, Sifó the siphon and Xip the crisp. Each owns one colour, so the cast is the palette.',
      'One pen for all four, in a 90s rubber-hose style: a thick even Tinta outline, flat colour with one lighter and one darker shape per body, white gloves, chunky sneakers, a flat ground ellipse and light from the top left. I treat that as the family code.',
      'Faces live only on these four. Letters, packaging and the pattern never get one.',
    ],
  },
  pattern: {
    title: 'The pattern',
    sub: 'The menu as wallpaper',
    lines: [
      'Twelve things from the vermut table, set as simple line icons on a half-drop lattice. Two colours only, and never a face.',
      'It is big and bold on napkins and cups and very faint behind the wordmark. I never let a tile go below 0.3 scale, or the lines turn to mush.',
      'Try the colourways: the top of the board re-tints, and the wordmark swaps to the version that is allowed on that ground.',
    ],
  },
  shopfront: {
    title: 'Shopfront and social',
    sub: 'Where the brand meets the street and the phone',
    lines: [
      'The shopfront is the one scene on the board, so it is the one place where big shapes get a 4 px ink line.',
      'The three social tiles are 4:5 posts, and I give each one a single thing to say: one wink per piece, and exclamation marks only inside the characters’ sound words.',
    ],
  },
  takeaway: {
    title: 'Takeaway',
    sub: 'Things that travel from the bar to the table',
    lines: [
      'Cups, coasters and the glass. I ask for objects as flat colour with one soft shadow and no outline: the line work belongs to the art printed on them.',
      'That print stays inside each object with at least 12 px of margin. A mascot once hung off the edge of a tote in a test render, which is why the rule exists.',
    ],
  },
  print: {
    title: 'Menu and print',
    sub: 'Paper that is cheap to print and nice to keep',
    lines: [
      'An A5 menu, a loyalty card, matchbooks, price tags, business cards, a napkin and a vinyl-night flyer.',
      'Catalan first, English second in italics, prices written 3,50 €. I keep anything meant to be read on pink or yellow, in Tinta or Blau.',
    ],
  },
  bottle: {
    title: 'Bottle and siphon',
    sub: 'The house products',
    lines: [
      'The vermut, the siphon and four crown caps. The siphon itself has no face, because faces belong to the four characters. The labels only borrow their heads.',
      'It is an alcohol brand, so I kept the tone adult and wry, with no minors, and every label says “Gaudeix-ne amb seny”: enjoy it sensibly.',
    ],
  },
  wearables: {
    title: 'Wearables',
    sub: 'The cast leaves the bar',
    lines: [
      'A tote, an apron and a sticker set. I art-direct soft goods compressed so the sizes look plausible next to each other: 0.62 px per mm for the tote and 0.40 for the apron, against 2.8 for a menu.',
    ],
  },
  posters: {
    title: 'Posters',
    sub: 'Three moods: fizzy, sunny, warm',
    lines: [
      'Each poster is 1200 × 1700 px, with one ground colour at about 55 to 60 percent, a faint pattern tone, grain, the wordmark and at least three characters.',
      'On the board they sit in a 14 px pink paper frame at 0.70 scale, so the blue poster does not melt into the blue panel.',
    ],
  },
}

// ---- mascots (guide 5.4 and 5.5) ----------------------------------------------------------------------------------------------
export interface MascotCopy {
  name: string
  role: string
  colour: string
  line: string
  personality: string
  catch: string
  catchGloss: string
  aria: string
  a: { name: string; expr: string }
  b: { name: string; expr: string }
  /** the two heads: expression codes shown under them */
  heads: [string, string]
}

export const MASCOT_COPY: Record<MascotId, MascotCopy> = {
  gotet: {
    name: 'Gotet',
    role: 'The little glass',
    colour: 'Red: the vermut',
    line: 'Hero and namesake. In every group I put him in front or in the middle, nothing covers his face, and red gets the most breathing room.',
    personality: 'Gentle, shy and sunny. He blushes first and talks second, and he is always carrying something cold.',
    catch: 'Un gotet?',
    catchGloss: 'A little glass?',
    aria: 'Gotet, the little glass. Say hello.',
    a: { name: 'Hug the cube', expr: 'Mmm' },
    b: { name: 'Jump!', expr: 'Xin-xin' },
    heads: ['E4 Mmm', 'E2 Xin-xin'],
  },
  oliva: {
    name: 'Oliva',
    role: 'The olive in a barretina',
    colour: 'Green: the olive',
    line: 'The host. Her red cap, a barretina, is the olive’s own pimento, and her banderilla, a cocktail stick with a pennant, is a flag.',
    personality: 'Warm and talkative. She cannot stop welcoming people in, and she remembers everybody’s order.',
    catch: 'Passa, passa!',
    catchGloss: 'Come in, come in!',
    aria: 'Oliva, the olive in a barretina. Say hello.',
    a: { name: 'Wave and flag', expr: 'Hola' },
    b: { name: 'Tip the cap', expr: 'Mmm' },
    heads: ['E1 Hola', 'E4 Mmm'],
  },
  sifo: {
    name: 'Sifó',
    role: 'The soda siphon',
    colour: 'Blue: the siphon glass',
    line: 'The maître, and the tallest of the cast: I used his height to set the scale for the other three. He presses his own lever and sprays on cue.',
    personality: 'Dramatic, vain and bubbly. He wants an audience. He is the loudest and the kindest.',
    catch: 'Psssh!',
    catchGloss: 'The sound of the siphon',
    aria: 'Sifó, the soda siphon. Say hello.',
    a: { name: 'Press the lever', expr: 'Hola' },
    b: { name: 'Pour and wink', expr: 'Psst' },
    heads: ['E1 Hola', 'E3 Psst'],
  },
  xip: {
    name: 'Xip',
    role: 'The crisp',
    colour: 'Yellow: the butter',
    line: 'The joker, a ruffled crisp with a bite taken out of its top right edge. It is the bravest, because it is always the first to be bitten.',
    personality: 'Dry wit, one eyebrow, one wink. It never hurries and never panics.',
    catch: 'Crec!',
    catchGloss: 'The crunch',
    aria: 'Xip, the crisp. Say hello.',
    a: { name: 'Shrug', expr: 'Psst' },
    b: { name: 'Dance', expr: 'Xin-xin' },
    heads: ['E3 Psst', 'E2 Xin-xin'],
  },
}

export const CAST_RULES: { title: string; body: string }[] = [
  { title: 'One pen', body: 'A thick, even Tinta outline round every shape, half that weight for detail lines inside. Round caps, round joins, never sketchy, never thin.' },
  { title: 'Flat colour', body: 'No gradients, glows or bevels. Each body gets one lighter and one darker hard-edged shape, a flat ground ellipse and a few sparkles.' },
  { title: 'One light', body: 'It always comes from the top left: one lighter shape and a small white glint per body.' },
  { title: 'Same eyes', body: 'Big white ovals with a thick outline, a big dark pupil and a glint, so faces read on blue and on red.' },
  { title: 'Noodle limbs', body: 'Two arms and two legs of one thickness, white three-finger gloves, chunky sneakers with white soles. The 90s rubber-hose look.' },
]

export const CAST_HEIGHTS = 'Heights, tallest first: Sifó 1, Oliva 0.81, Gotet 0.71, Xip 0.65. They always share one scale.'

// ---- wordmark panel -----------------------------------------------------------------------------------------------------------
export const WORDMARK_RULES: string[] = [
  'Clear space is 94 units on every side: the width of one stem, 6.2 % of the wordmark.',
  'Never full colour on blue: red and blue vibrate.',
  'Mascots may cover at most a quarter of any letter, and never the pimento or the eye of the “e”.',
  'No mascot ever sits inside a logo lockup. The system stays timeless.',
]

// ---- pattern panel -------------------------------------------------------------------------------------------------------------
export const PATTERN_FACTS: { k: string; v: string }[] = [
  { k: 'Tile', v: '600 × 600 units' },
  { k: 'Stroke', v: '5 units, round' },
  { k: 'Lattice', v: 'Half-drop: 4 rows 150 apart' },
  { k: 'Per row', v: '3 icons, 200 apart' },
  { k: 'On the board', v: 'Top zone at scale 2' },
  { k: 'Smallest scale', v: '0.3' },
]

// ---- overview and chrome --------------------------------------------------------------------------------------------------------
export const OVERVIEW = {
  kicker: 'Concept project',
  title: 'Gotet',
  sub: 'A neighbourhood vermuteria in Cardedeu that does not exist.',
  lines: [
    'I invented this bar to show how I build a brand from nothing: a name, a pen, four characters and twenty things a bar could put its name on.',
    'The brief, the art direction and every rule on this board are mine. Every piece was checked against those rules.',
  ],
  hint: 'Pick a tab on the left, tap any tile, say hi to a character or take the tour.',
  inventory: [
    { n: '1', what: 'Wordmark' },
    { n: '4', what: 'Characters' },
    { n: '12', what: 'Pattern icons' },
    { n: '20', what: 'Mockups' },
    { n: '3', what: 'Posters' },
  ],
  tagline: 'Small glass. Big Sunday.',
}

export const UI_TEXT = {
  region: 'Gotet brand board',
  chipsLabel: 'Parts of the board',
  tour: 'Sunday service',
  tourStart: 'Take the tour',
  tourNext: 'Next stop',
  tourPrev: 'Back',
  tourSkip: 'Skip',
  tourLabel: 'Sunday service tour',
  index: 'Index',
  board: 'Board',
  kit: 'Brand kit',
  fit: 'Fit the whole board',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  showOnBoard: 'Show on the board',
  keys: 'Arrows pan, plus and minus zoom, 0 fits',
  back: 'Back to the group',
  allBoard: 'The whole board',
  copied: 'Copied',
  copy: 'Copy',
  close: 'Close',
  details: 'Details',
  noteTitle: 'Art director’s note',
}

export const BAR_LABEL = {
  rule: 'The rule',
  palette: 'Palette',
  type: 'Type',
  size: 'Real size',
  pieces: 'On the board',
  cast: 'Meet the cast',
  poses: 'Two poses',
  faces: 'Faces',
  pen: 'The family code',
  variants: 'Variants',
  clear: 'Clear space',
  minimum: 'Smallest sizes',
  icons: 'The twelve icons',
  ways: 'Colourways',
  lattice: 'The lattice',
}

// ---- the tour (nine stops, one art director’s note each) ------------------------------------------------------------------------
export const TOUR: { title: string; note: string }[] = [
  {
    title: 'The name',
    note: 'Start with the wordmark. Gotet means a little glass, so the logo had to feel like one: fat round tubes, a hard blue shadow and an olive for the “o”. I wrote the rule that it is never retyped, rotated or re-shadowed.',
  },
  {
    title: 'The cast',
    note: 'Four things from the vermut table, one colour each. Gotet is the glass and the hero, Oliva hosts, Sifó performs and Xip shrugs. Same pen, same eyes, same shoes, so they read as one family. Tap one: it hops.',
  },
  {
    title: 'The wallpaper',
    note: 'The menu as wallpaper: twelve little line icons on a half-drop lattice, two colours only and never a face. Try the colourways and the whole top of the board changes.',
  },
  {
    title: 'The street and the phone',
    note: 'The shopfront is the only scene on the board, so it gets a 4 px ink line. The three social tiles get one wink each, and each one says exactly one thing.',
  },
  {
    title: 'To go',
    note: 'Cups, coasters and the glass. The art stays inside every object with at least 12 px of margin, a rule I wrote after a mascot hung off the edge of a tote in a test render.',
  },
  {
    title: 'On paper',
    note: 'Menu, loyalty card, matchbooks, price tags, business cards, napkin and flyer. Catalan first, English second in italics, and every price written 3,50 €.',
  },
  {
    title: 'The house products',
    note: 'The bottle, the siphon and four crown caps. The siphon has no face: only the four characters get faces. It is an alcohol brand, so every label says enjoy it sensibly.',
  },
  {
    title: 'On the wall',
    note: 'Three posters, three moods: fizzy blue, sunny yellow, warm red. Each one has the wordmark, a faint pattern tone, grain and at least three characters.',
  },
  {
    title: 'The whole board',
    note: 'That is the system on one wall: one name, four characters, one pattern, twenty objects and three posters. I wrote the rules and art-directed every piece.',
  },
]

// ---- brand kit -------------------------------------------------------------------------------------------------------------------
export const KIT = {
  title: 'Brand kit',
  sub: 'The reference page a printer would ask for, in one drawer.',
  ratioTitle: 'How much of the board each colour gets',
  ratioNote: 'Brand-wide target, share of the visible area. The top zone is 80 percent pink, the panel is 52 percent blue.',
  contrastTitle: 'Which colours may carry text',
  contrastAllowed: 'Allowed for small text: Tinta on Rosat, Mantega or Oliva. Blau on Rosat or Mantega. Rosat or Mantega on Blau.',
  contrastLarge: 'Large text only (24 px, or 19 px bold): Vermell on Rosat or Mantega, and Rosat or Mantega on Vermell.',
  contrastNever: 'Never as text: Oliva anywhere, Rosat on Oliva, Mantega on Rosat, Blau on Tinta, Vermell on Blau or Oliva.',
  typeTitle: 'Two typefaces',
  typeRoles: [
    { role: 'Poster headline', spec: 'Fraunces 900, 148 to 235 px, uppercase, hard ink shadow' },
    { role: 'Subline', spec: 'Fraunces italic 600, 44 to 66 px, sentence case' },
    { role: 'Menu name and price', spec: 'Fraunces 700 and 900, 21 px at A5' },
    { role: 'Label and descriptor', spec: 'Barlow Semi Condensed 800, uppercase, tracking 0.16 to 0.30 em' },
    { role: 'Body and info lines', spec: 'Barlow Semi Condensed 500 to 700' },
  ],
  typeRule: 'Catalan first, English second and italic. No faux bold, no faux italic, no tracking on Fraunces.',
  logoTitle: 'The logo family',
}

/** short values for the rows of a group list (the full sizes are in the piece's own panel) */
export const ROW_VAL: Record<string, string> = {
  m01: '3400 × 1300 mm',
  m02: '4:5 post',
  m03: '4:5 post',
  m04: '4:5 post',
  m05: '85 × 110 mm each',
  m09: '75 × 300 mm',
  m11: '120 × 330 mm',
  m12: '26 mm each',
  m14: '95 mm each',
  m15: '75 × 90 mm',
  m17: '380 × 420 mm',
  p1: '1200 × 1700 px',
  p2: '1200 × 1700 px',
  p3: '1200 × 1700 px',
}
