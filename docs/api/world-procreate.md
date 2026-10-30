# World 6 · Procreate Sketchbook · "Sketchbook" (API + behaviour note)

Slug `procreate`, folder colour bubblegum `#FF8FC1` (ink text). Files: `src/worlds/ProcreateWorld.tsx` (default export) and `src/worlds/procreate/**`. Read this instead of the source.

## What it is

A small, battered sketchbook open on a green cutting mat: twelve drawings Pau made in Procreate for the love of it (his statement of 2026-10-30: "not jobs"), printed, glued into the book and noted by hand. It replaces the first version of this world (a cork wall of pinned, draggable prints with a Vértice logo and a Yakisoba F.C. crest, which Pau asked to remove). Old-school and dirty on purpose: yellowed paper with foxing, coffee rings, thumbprints, graphite smears, eraser crumbs, tape, photo corners, pen tests, doodles in the margins, a scuffed black cloth cover with red spine tape.

The book is the in-house page-curl `FlipBook` (`src/components/flip`, see `docs/api/flipbook.md`): 18 faces (cover, pages 2 to 17, back), 9 spreads plus the two closed states, hard boards. Every face is a picture (1200 x 1600 WebP, `public/works/procreate/book/`). The handwriting on the pictures and every word of the page are the same text (`procreate/book.json`).

Above the book: the hand-lettered title "Just for fun", a taped lede, a NOT FOR WORK stamp. On the mat: a pencil, an eraser, a sharpener with shavings, a ruler, a coffee ring (SVG, `aria-hidden`). Under the book: a taped index card that says what is open (pages, drawing numbers, titles, lines) and the "Look closer" tab. Below the mat: a ruled contents page (twelve rows, each with a "p.N" tab that turns the book to it) beside the facts slate.

## Interaction map

| Input | What happens |
|---|---|
| Desk first well on screen | the cover opens by itself (page curl; dissolve under reduced or paused motion), unless a page was already turned; then the corner of the next page lifts once (a hint) |
| Drag a page's outer 20 % / swipe / click the outer edge | turns the page (FlipBook) |
| Arrow keys, Home, End | turn the book; they work anywhere while the desk is on screen (`keys="window"`), only with focus otherwise |
| Prev / next tabs and the scrubber | the non-drag way to turn pages (FlipBook's own controls) |
| "p.N" tab on a contents row | turns the book to the spread that holds the drawing (`goToPage`); the row of the open spread is highlighted |
| "Look closer" | opens the page viewer on the first page of the spread that is showing |
| Viewer: Left / Right / Home / End, swipe, tabs | previous / next page, first / last |
| Viewer: click the empty dark area, Esc, "Back to the book" | closes it; focus returns to the tab that opened it and the book turns to the spread of the page last seen |
| `[` `]` | still hop between projects (shell) |

Narrow containers (under 720 px) show one page at a time (FlipBook `mode: 'auto'`). On phones the card moves under the Look closer tab and the sharpener, ruler, pencil and eraser are hidden.

## Content (`procreate/book.json`, `procreate/data.ts`)

`book.json` has one entry per face: `id` (`cover`, `p-02` .. `p-17`, `back`), `kind`, `n` (printed page number), `no` (drawing number 1 to 12), `short`, `title`, `line` (the pencil sentence under the drawing) and `alt` (what a person would see, handwriting included). `data.ts` exports `PAGES`, `DRAWINGS`, `pageSrc`, the spread helpers (`spreadOfPage`, `firstFaceOfSpread`, `spreadOfFace`) and `COPY` (every visible string of the world).

| Pages | What |
|---|---|
| cover | black cloth, red spine tape, label SKETCHBOOK / procreate · for fun / not for work! |
| 2, 3 | "this sketchbook belongs to PAU" (reward: a coffee), contents list with tick boxes |
| 4, 5 | 01 Hills & a tiny house, 02 Houses, stacked |
| 6, 7 | 03 Hillside town, 04 Quick face (round glasses, drawn straight on the page with construction lines) |
| 8, 9 | 05 Five faces in circles (labelled), 06 Yellow cap |
| 10, 11 | 07 Four colours only, 08 Same four colours (die-cut stickers with the palette swatches) |
| 12, 13 | 09 Very serious man, 10 An eye made of lines (torn clipping + a hatching test) |
| 14, 15 | 11 Hatching, a body (small torn clipping), 12 Citrus & leaves |
| 16, 17 | colour tests and a to-draw-next list, "that's all, for now." |
| back | NOT FOR SALE (it's a sketchbook) |

Nothing in the copy is a claim: no dates, no briefs, no clients, no tools beyond Procreate, nobody named. Descriptions say what is in the picture ("round glasses, curly hair, big smile"), never who it shows.

## How the pages are made (`art-src/sketchbook/`)

| File | Role |
|---|---|
| `sources/` | the drawings Pau sent (10 JPEGs, 736 px wide for eight of them, 445 and 480 for the other two) and the two orange portraits (transparent WebP) |
| `lib.mjs` | the kit: paper (tone, dots, ruled, foxing), `hand()` handwriting (Reenie Beanie pencil, Gochi Hand felt-tip, biro / red pen, wobble filter, grain mask), SVG doodles and arrows, `print()` (glued print with tape and photo corners, torn clipping, bare drawing multiplied onto the paper, die-cut sticker), coffee ring, thumbprint, smear, stain, crumbs, blot, dog-ear, swatch, sticker, cloth `board()` for the covers |
| `pages.mjs` | one function per page; takes its words from `book.json` |
| `render.mjs` | `node art-src/sketchbook/render.mjs [id ...]` prints `_build/<id>.png` (Playwright + the installed Chrome) |
| `export.py` | PNG to `public/works/procreate/book/<id>.webp` (q80) |
| `cards.mjs`, `cards.py` | the card art: `thumb.webp` (720 x 900, a page on the cutting mat) and `peek.webp` (484 x 632, the closed book with a cream die-cut edge) |
| `../folders/procreate.mjs` | the Works card's "inside of the folder" picture (`inside.webp`), built with the folder kit from two real pages of the book |

Rebuild: `node art-src/sketchbook/render.mjs`, `python -I -X utf8 art-src/sketchbook/export.py`, then `node art-src/sketchbook/cards.mjs` and `python -I -X utf8 art-src/sketchbook/cards.py`, then `node art-src/folders/render.mjs procreate` and `python -I -X utf8 art-src/folders/export.py procreate`. To swap a drawing for its original, replace the file in `sources/` (same name), check its crop in `pages.mjs` and rebuild.

## Files

| File | Role |
|---|---|
| `ProcreateWorld.tsx` | state (spread, opened, viewer), the desk, the index card, contents, facts; cover auto-open and hint |
| `procreate/Viewer.tsx` | the page viewer (portal into the folder body, focus trap, `useWorldEscape`, swipe) |
| `procreate/Props.tsx` | pencil, eraser, sharpener, ruler (SVG, decoration) |
| `procreate/data.ts`, `procreate/book.json` | content |
| `procreate/procreate.css` | all styles, classes `w-procreate-*` |

## Motion, accessibility, performance

* Only transform, opacity and clip-path animate (the title write-on, the viewer's page swing). Under reduced or paused motion the book dissolves instead of curling, the cover opens at once and nothing is hinted. FlipBook keeps its own live region ("Pages 4 and 5 of 17").
* Each page picture carries its `alt` (handwriting included). The index card is `aria-hidden` (it repeats what the live region says); the contents list is the text route to every drawing and its tabs are real buttons named "Open at page N: title". The viewer is `role="dialog" aria-modal`, labelled by the page title; the world behind it is not reachable.
* Pictures: 18 pages at about 260 KB (4.6 MB in all) but a visitor loads only the spreads they turn to (FlipBook fetches the visible spread). The world chunk is small; fonts are Gloria Hallelujah (title) and Gochi Hand (notes, lazy).

## Honesty decisions

* The drawings are Pau's own Procreate drawings, made for fun (his statement, confirmed in writing in chat on 2026-10-30 when asked). The files he sent are web-size copies (eight of ten are exactly 736 px wide): ask for the originals and swap them in.
* Removed on his request: the Vértice logo idea and the Yakisoba F.C. crest (and their files). Still held back, as before: the group portrait with a third-party logo and the kids portrait.
* The two orange portraits keep their palette story ("four colours only", the four dots) and "too orange?? (no. keep it)" stays as a sticky note.
* Handwriting is decoration in Pau's voice, not a fact about the drawings: nothing says when, how long, with which brush, for whom.

## Known limits

* The pictures are low resolution for the viewer (the clippings and the 736 px prints are shown at about native size). Originals would sharpen them.
* The page-curl needs a modern browser with CSS 3D; FlipBook falls back to a dissolve under reduced motion.
