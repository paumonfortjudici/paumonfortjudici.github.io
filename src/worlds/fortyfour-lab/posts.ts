// Built from public/works/fortyfour-lab/posts/manifest.json (exact files, sizes and date strings), plus my own short copy and titles.
// A caption that names a real person or a brand is reduced to the kind of rug ("Cut-out portrait rug", "Sneaker rugs").
// The raw manifest is not bundled on purpose: its captions carry 2023 prices and the Etsy shop, which this world never shows.
// Dates stay strings ('2023-03-08'): nothing here converts a time zone.

export interface Slide {
  n: number
  kind: 'image' | 'video'
  /** the image (or the poster of a video slide), relative to /works/fortyfour-lab/posts/ */
  image: string
  w: number
  h: number
  /** only for kind 'video' */
  video?: { file: string; w: number; h: number; seconds: number }
  alt: string
}

export interface Post {
  id: string
  type: 'carousel' | 'reel'
  /** YYYY-MM-DD, exactly as published (never converted) */
  date: string
  title: string
  note: string
  /** width / height of the first picture: every slide of the tag is cropped to it */
  ratio: number
  slides: Slide[]
  /** a reel whose video is not shown here (copyright-flagged audio): its first frame is a still */
  still: boolean
}

export const POSTS_DIR = '/works/fortyfour-lab/posts/'

export const POSTS: Post[] = [
  {
    id: "CpiPiE6I2on",
    type: "carousel",
    date: "2023-03-08",
    title: "Smiley rug",
    note: "60 × 60 cm. A melting smiley in pink, lilac and mint. The earliest of the thirteen.",
    ratio: 0.8,
    still: false,
    slides: [
      { n: 1, kind: "image", image: "2023-03-08-CpiPiE6I2on-01.webp", w: 720, h: 900, alt: "A pink, lilac and mint melting-smiley rug on a sunny terrace floor." },
      { n: 2, kind: "image", image: "2023-03-08-CpiPiE6I2on-02.webp", w: 644, h: 800, alt: "The smiley rug on cream tiles, seen from above." },
      { n: 3, kind: "image", image: "2023-03-08-CpiPiE6I2on-03.webp", w: 640, h: 800, alt: "A wide view: the small smiley rug on the terrace with a railing behind." },
      { n: 4, kind: "image", image: "2023-03-08-CpiPiE6I2on-04.webp", w: 640, h: 800, alt: "Macro of the rug’s tufted pile in pink, lilac, mint and black." },
      { n: 5, kind: "image", image: "2023-03-08-CpiPiE6I2on-05.webp", w: 640, h: 800, alt: "A hand folds back one corner to show the rug’s grey backing." },
    ],
  },
  {
    id: "CpiQD8Vow8m",
    type: "carousel",
    date: "2023-03-08",
    title: "Cut-out portrait rug",
    note: "70 × 60 cm, cut to the outline of the figure, white edge and all.",
    ratio: 1.001,
    still: false,
    slides: [
      { n: 1, kind: "image", image: "2023-03-08-CpiQD8Vow8m-01.webp", w: 900, h: 899, alt: "A portrait rug cut to the outline of a man in headphones with a microphone, on terrace tiles." },
      { n: 2, kind: "image", image: "2023-03-08-CpiQD8Vow8m-02.webp", w: 800, h: 800, alt: "A closer look at the portrait rug and its tufted shading." },
      { n: 3, kind: "image", image: "2023-03-08-CpiQD8Vow8m-03.webp", w: 800, h: 800, alt: "The portrait rug on cream tiles, seen from above." },
      { n: 4, kind: "image", image: "2023-03-08-CpiQD8Vow8m-04.webp", w: 800, h: 800, alt: "A wide view of the portrait rug on the terrace floor." },
      { n: 5, kind: "image", image: "2023-03-08-CpiQD8Vow8m-05.webp", w: 800, h: 800, alt: "A hand folds back a corner to show the grey backing." },
    ],
  },
  {
    id: "Cpmv0UNoKww",
    type: "carousel",
    date: "2023-03-10",
    title: "Faceted portrait rug",
    note: "90 × 140 cm, built from loud flat facets. Not for sale; DM me if you want one like it.",
    ratio: 0.8,
    still: false,
    slides: [
      { n: 1, kind: "image", image: "2023-03-10-Cpmv0UNoKww-01.webp", w: 720, h: 900, alt: "A multicoloured, faceted portrait rug lying on a tiled floor." },
      { n: 2, kind: "image", image: "2023-03-10-Cpmv0UNoKww-02.webp", w: 640, h: 800, alt: "The same portrait rug seen from straight above on cream tiles." },
      { n: 3, kind: "image", image: "2023-03-10-Cpmv0UNoKww-03.webp", w: 640, h: 800, alt: "A low-angle view of the portrait rug beside a chair." },
      { n: 4, kind: "image", image: "2023-03-10-Cpmv0UNoKww-04.webp", w: 640, h: 800, alt: "Detail of the rug’s pile, striped with sunlight and shadow." },
      { n: 5, kind: "video", image: "2023-03-10-Cpmv0UNoKww-05.webp", w: 640, h: 800, video: { file: "2023-03-10-Cpmv0UNoKww-05.mp4", w: 480, h: 600, seconds: 13.9 }, alt: "Video: a hand hangs the rug on a wall, then the camera moves across its coloured facets." },
      { n: 6, kind: "image", image: "2023-03-10-Cpmv0UNoKww-06.webp", w: 640, h: 800, alt: "The portrait rug hung on a white wall in a hallway." },
      { n: 7, kind: "image", image: "2023-03-10-Cpmv0UNoKww-07.webp", w: 640, h: 800, alt: "The portrait rug hung on a round pillar, with two smaller rugs on the floor below." },
    ],
  },
  {
    id: "CpxGI67D-xW",
    type: "carousel",
    date: "2023-03-14",
    title: "Trippy eye rug",
    note: "60 × 120 cm runner in black and white ripples. Custom designs by DM.",
    ratio: 0.8,
    still: false,
    slides: [
      { n: 1, kind: "image", image: "2023-03-14-CpxGI67D-xW-01.webp", w: 720, h: 900, alt: "A black and white ripple-pattern runner rug on a terrace floor." },
      { n: 2, kind: "image", image: "2023-03-14-CpxGI67D-xW-02.webp", w: 640, h: 800, alt: "The runner on cream tiles beside a chair." },
      { n: 3, kind: "image", image: "2023-03-14-CpxGI67D-xW-03.webp", w: 640, h: 800, alt: "The runner seen from above on cream tiles." },
      { n: 4, kind: "image", image: "2023-03-14-CpxGI67D-xW-04.webp", w: 640, h: 800, alt: "The runner stretched out along the floor." },
      { n: 5, kind: "image", image: "2023-03-14-CpxGI67D-xW-05.webp", w: 640, h: 800, alt: "The runner on the terrace in shade." },
      { n: 6, kind: "image", image: "2023-03-14-CpxGI67D-xW-06.webp", w: 640, h: 800, alt: "A hand lifts one corner to show the backing." },
    ],
  },
  {
    id: "CpxKD_HjoJS",
    type: "reel",
    date: "2023-03-14",
    title: "First drop",
    note: "A reel of the first rugs, laid out on the terrace.",
    ratio: 0.562,
    still: true,
    slides: [
      { n: 1, kind: "image", image: "2023-03-14-CpxKD_HjoJS-poster.webp", w: 562, h: 1000, alt: "Still from the reel: a black and white ripple rug, the pink smiley rug and two portrait rugs laid out on a terrace floor." },
    ],
  },
  {
    id: "CqTGpZ0jYg0",
    type: "reel",
    date: "2023-03-27",
    title: "Rug process",
    note: "A 74-second look at how a portrait rug is made: the design, the tufting gun, the finished piece. No sound.",
    ratio: 0.562,
    still: false,
    slides: [
      { n: 1, kind: "video", image: "2023-03-27-CqTGpZ0jYg0-poster.webp", w: 562, h: 1000, video: { file: "2023-03-27-CqTGpZ0jYg0.mp4", w: 432, h: 768, seconds: 74.2 }, alt: "Still from the video: a tufting gun working on a black, white and grey portrait rug." },
    ],
  },
  {
    id: "CqX-akbDB5m",
    type: "reel",
    date: "2023-03-29",
    title: "Cutting new rugs",
    note: "Cutting three new rugs, still on the frame.",
    ratio: 0.563,
    still: true,
    slides: [
      { n: 1, kind: "image", image: "2023-03-29-CqX-akbDB5m-poster.webp", w: 563, h: 1000, alt: "Still from the reel: three finished rugs on a wooden frame, a green one with a cartoon face, a grey portrait and a small fist emblem." },
    ],
  },
  {
    id: "CqabRKJjF79",
    type: "reel",
    date: "2023-03-30",
    title: "Clean vs shaved",
    note: "Why a good finish matters on a rug. This one was a custom order.",
    ratio: 0.562,
    still: true,
    slides: [
      { n: 1, kind: "image", image: "2023-03-30-CqabRKJjF79-poster.webp", w: 562, h: 1000, alt: "Still from the reel: a green rug shaped like a lighter, with a cartoon face, on terracotta tiles." },
    ],
  },
  {
    id: "Cqp7A31t8ZV",
    type: "carousel",
    date: "2023-04-05",
    title: "Greyscale portrait rug",
    note: "120 × 80 cm, in black, white and grey.",
    ratio: 0.8,
    still: false,
    slides: [
      { n: 1, kind: "image", image: "2023-04-05-Cqp7A31t8ZV-01.webp", w: 720, h: 900, alt: "A black, white and grey portrait rug on terracotta terrace tiles." },
      { n: 2, kind: "image", image: "2023-04-05-Cqp7A31t8ZV-02.webp", w: 640, h: 800, alt: "The portrait rug on cream tiles, seen from above." },
      { n: 3, kind: "image", image: "2023-04-05-Cqp7A31t8ZV-03.webp", w: 640, h: 800, alt: "The rug on the terrace with the shadow of the railing across it." },
      { n: 4, kind: "image", image: "2023-04-05-Cqp7A31t8ZV-04.webp", w: 640, h: 800, alt: "Close-up of the tufted pile in white, grey and black." },
      { n: 5, kind: "image", image: "2023-04-05-Cqp7A31t8ZV-05.webp", w: 640, h: 800, alt: "The whole rug lying flat on terracotta tiles." },
      { n: 6, kind: "image", image: "2023-04-05-Cqp7A31t8ZV-06.webp", w: 640, h: 800, alt: "A close look at the face, with the cap outlined in light grey." },
      { n: 7, kind: "video", image: "2023-04-05-Cqp7A31t8ZV-07.webp", w: 640, h: 800, video: { file: "2023-04-05-Cqp7A31t8ZV-07.mp4", w: 480, h: 600, seconds: 13.67 }, alt: "Video: close-ups of the finished rug’s face and pile in the sun." },
      { n: 8, kind: "image", image: "2023-04-05-Cqp7A31t8ZV-08.webp", w: 640, h: 800, alt: "A hand folds back a corner to show the grey backing." },
    ],
  },
  {
    id: "CsjWnkaJH1d",
    type: "reel",
    date: "2023-05-22",
    title: "Next release",
    note: "Getting the next release ready, one edge at a time.",
    ratio: 0.563,
    still: true,
    slides: [
      { n: 1, kind: "image", image: "2023-05-22-CsjWnkaJH1d-poster.webp", w: 563, h: 1000, alt: "Still from the reel: a hand trims the white edge of a purple sneaker-shaped rug on a wooden table." },
    ],
  },
  {
    id: "CstacGGtElT",
    type: "reel",
    date: "2023-05-26",
    title: "Complete process",
    note: "The complete process of a pink ghost rug.",
    ratio: 0.562,
    still: true,
    slides: [
      { n: 1, kind: "image", image: "2023-05-26-CstacGGtElT-poster.webp", w: 562, h: 1000, alt: "Still from the reel: a person tufts a pink cartoon-ghost rug stretched on a wall frame." },
    ],
  },
  {
    id: "CuHLxaNtFBe",
    type: "carousel",
    date: "2023-06-30",
    title: "Sneaker rugs",
    note: "60 × 40 cm, with a white pile border cut around the shape.",
    ratio: 0.821,
    still: false,
    slides: [
      { n: 1, kind: "image", image: "2023-06-30-CuHLxaNtFBe-01.webp", w: 739, h: 900, alt: "Two sneaker-shaped rugs, one purple and one red, white and black, on terrace tiles." },
      { n: 2, kind: "image", image: "2023-06-30-CuHLxaNtFBe-02.webp", w: 657, h: 800, alt: "The red, white and black high-top sneaker rug." },
      { n: 3, kind: "image", image: "2023-06-30-CuHLxaNtFBe-03.webp", w: 657, h: 800, alt: "Close-up of the sneaker rug’s white pile and red details." },
      { n: 4, kind: "image", image: "2023-06-30-CuHLxaNtFBe-04.webp", w: 657, h: 800, alt: "The purple low-top sneaker rug on the tiles." },
      { n: 5, kind: "image", image: "2023-06-30-CuHLxaNtFBe-05.webp", w: 657, h: 800, alt: "The purple sneaker rug seen from above." },
      { n: 6, kind: "video", image: "2023-06-30-CuHLxaNtFBe-06.webp", w: 657, h: 800, video: { file: "2023-06-30-CuHLxaNtFBe-06.mp4", w: 480, h: 586, seconds: 10.8 }, alt: "Video: the camera glides over both sneaker rugs on the terrace tiles." },
    ],
  },
  {
    id: "CuHMcN2tDiK",
    type: "reel",
    date: "2023-06-30",
    title: "Drop 3",
    note: "Three rugs in one reel, and the latest of the thirteen.",
    ratio: 0.562,
    still: true,
    slides: [
      { n: 1, kind: "image", image: "2023-06-30-CuHMcN2tDiK-poster.webp", w: 562, h: 1000, alt: "Still from the reel: a pink cartoon-ghost rug with a purple and a red, white and black sneaker rug on terracotta tiles." },
    ],
  },
]
