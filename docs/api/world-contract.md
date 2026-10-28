# World 1, Proyecto Contract, "Press Proof": API / behaviour note

Source: `src/worlds/ContractWorld.tsx` (default export, lazy chunk) + `src/worlds/contract/**`. It renders **only** the body below the shell's 44 px strip (no title, no close, no prev / next) and uses `useWorld()` for `{ work, reduced, scrollRef }`. Nothing else in the repo imports from it. Status: finished and verified (see sections 8 and 9).

## 1. What it is

A prepress light table. The folder colour (tomato `#FF4B2B`, ink text) is a cutting mat with a hairline grid. In the middle, on a pane of lit glass in a black frame, the 30 shipped pages of the issue are a real page-turning book (the in-house `FlipBook`) with trim marks, two registration targets printed in the margin of the glass, a ruler drawn to the scale of the pages (1 cm on it = 1 cm of print, a page is 209 mm) and a slug line that follows the spread on show (`PROYECTO CONTRACT / HOTEL DESIGN 18 + 223 / PROOF 42–43 / 2026`). Around it:

* left, **Press notes**: a rust title block (the issue's own section-tab rust), a drop cap in Bitter, three short paragraphs (what the magazine is, my stint, what you are turning) and, on tall or tablet screens, a swatch card of the issue's colours;
* right, **Find my name** (a `TabButton`), the masthead crop taped to the table with a pencil circle and "that's me", and **six byline slips** (`Textos: Pau Monfort.` crops) pinned with tape, each with its page and feature; a slip whose page is on show in the book stands up straight with a tick;
* on the glass, under the book: a **caption** per spread (observation of what the layout does, never a claim of authorship), the scrubber and Previous / Next tabs; at the top right of the glass a **Read closer** tab;
* under everything, a **contact sheet** (film strip with perforations) of the 16 positions of the book, a grease-pencil tick on each one that carries my name, then the credit line, the key to the ticks, a press control strip (colour bars in process inks + a tone ladder), and a facts band: `WorldFacts` slate + `proyectocontract.es` ticket, the **directory** (the sections of the issue drawn as a lobby sign) and the **type card** (Bitter and Overpass as stand-ins for the issue's Caecilia and Interstate).

## 2. Files

| File | Job |
|---|---|
| `ContractWorld.tsx` | state and wiring: book ref, picked evidence, the pen mark, the opening turn + page-corner hint, Home / End guard, reader state, announce line |
| `contract/Stage.tsx` | slug line + Read tab, the `FlipBook`, trim marks + targets + ruler (three variants: spread / closed cover / single page; only the one that fits the book on show is visible), caption deck, scrubber, Previous / Next (+ the phone's Find tab) |
| `contract/Evidence.tsx` | `FindTab`, the two kinds of print (masthead / credit line), the six slips (`aria-pressed` = picked, `data-here` = on show) |
| `contract/Notes.tsx`, `Swatches.tsx` | left column |
| `contract/Frames.tsx` | the contact sheet (sprite atlas `atlas.webp`, 8 x 2 frames of 192 x 128, built by `atlas.build.py`; ticks from `MY_PAGES`) |
| `contract/PageMark.tsx`, `lens.ts` | the overlay drawn on a page of the book: pen circle + reading loupe (section 4) |
| `contract/Reader.tsx` | "Read closer": portalled lightbox with the spread fitted to the screen, then at print size (section 5) |
| `contract/Directory.tsx` | the sections of the issue as an engraved lobby sign (espresso plate, the issue's vertical rust tab). Every row turns the book to the first page of that room that is in the 30; the room the book is in is `aria-current` |
| `contract/TypeCard.tsx` | the colophon card |
| `contract/useSettled.ts` | "the book has stopped turning": waits for the leaf to land before drawing |
| `contract/data.ts` | the 30 pages, the 16 spreads, the credit, the six bylines (copied from `public/works/contract/manifest.json`, plus measured text positions inside each byline crop) and `MY_PAGES` |
| `contract/copy.ts` | every visible string of the world (English) |
| `contract/helpers.ts` | `pageId`, `spreadOfPage`, `proofLabel`, `frameLabel`, `grow`, `inCrop`, `cropWindow` |
| `contract/contract.css` | all styling, classes `w-contract-*`; the world's own colours are custom properties at the top of `.w-contract` (the reader, which is portalled out of it, re-declares the two it uses) |
| `contract/atlas.webp`, `atlas.build.py` | the rail's sprite sheet and the script that rebuilds it (venv python `-I -X utf8`, from the repo root; reads the manifest and `pages/*.webp`) |

## 3. The book

`FlipBook` with `keys="window"` (arrows turn the page anywhere in the world), `controls={false}` (the world draws its own deck so the tabs and scrubber match the glass), `gloss={0.55}`, `aspect={1000/1331}`, `totalPages={230}`, `mode` = `'single'` below 760 px of viewport width, otherwise `'spread'` (the book's own rule would switch at 720 px of *book* width, i.e. already at 1440). `--flip-max-h` is set by the world from the viewport height so book + deck + film strip fit the first screen (laptop, 1440 x 900, 1920 x 1080). Page ids are `p-001 ... p-230` (`pageId(n)`); the cover is `cover.webp`, the back cover `p-230`.

* Opening: the book starts closed on the cover and, 1.4 s after the folder has opened, turns once onto the first Open Space spread (42-43, the lobby of the cover photograph) unless the visitor has already pressed or tapped something; when the leaf has landed the corner of the next page lifts once (`hint()`). Reduced / paused motion: it simply starts on 42-43.
* Keys: arrows (book), Home / End only while focus is in the book or its tabs (elsewhere they keep scrolling the world), `[` `]` and Esc belong to the shell. A focused range input keeps its own arrows (the book treats it as typing) and the change turns the book.
* Single-page mode: the scrubber counts pages (0-29), otherwise spreads (0-15); Previous reads "Back" (arrow only on phones).
* The book mounts the current spread and its neighbours only: the other pages are not requested (section 7).

## 4. Find my name (and the byline slips)

`reveal(pick, spec, message)` in `ContractWorld.tsx`:

1. clears any mark, remembers what is picked (drives which print is shown);
2. `book.goToPage('p-004')` unless that page is already on show (one leaf turns, never a riffle), and scrolls the book into view on phones;
3. `whenSettled()` waits until no leaf is in the air (`.pm-flip__leaf[data-state="m"]`), 300 ms in reduced / paused motion (the dissolve);
4. sets `mark` = `{ page, ring, seed, lens }`: the book's page overlay (`PageMark`) draws, in percent of the page:
   * a **pen circle** (`Scribble kind="circle"`) on `credit.circleBboxPct` grown a hair (masthead) or on the byline's name box (slips): both come straight from the manifest. Measured: the loop lands at 25.2 / 71.1 / 9.2 / 2.6 % of the page against the manifest's 25.5 / 71.2 / 8.7 / 2.5 at 1920, 1440 and 390 px;
   * a **reading loupe**: a bar of glass laid on the page that shows the same line enlarged from its crop (`credit.webp`, `bylines/*.webp`) with the name circled again on the glass, a `×N` tag and a thin leader to the real circle. `lens.ts` (`makeLens`) derives everything from the manifest boxes, and the loupe is sized in percent of the page, so it scales with the book. The pen loop only fills about 85 % of its box, so the boxes are cut generously;
5. announces the result in the polite status line (`#w-contract-found`).

Slips on pages 72, 111 and 186 do the same on their spread. Slips for 91, 195 and 213 are not in the book: they lay the credit-line crop large on the right-hand print (`ByLinePrint`) with "Not in the 30 pages of this book". Nothing is invented: every box is in the manifest.

## 5. Read closer

`Reader.tsx`, opened by the icon tab (with a text label when the glass is 800 px wide) at the top right of the glass. Portalled into the shell's folder body (`scrollRef.current.parentElement`, like the Plana manual viewer) so it covers the world but not the tab strip. Opens fitted to the screen (about twice the size of the book on the table), a click on a page or the "Full size" tab goes to print size (the pages are 1000 px wide), where it scrolls both ways (mouse drag, a finger, arrow and Page keys). Fitted, Left / Right and `[` `]` turn the spread; the book behind turns with it. Escape goes through `useWorldEscape` (the folder stays open), a click on the dark and the Back tab close it, focus is trapped and returns to the tab, the scroller behind is `inert` and scroll-locked.

## 6. Layout and breakpoints

* >= 1180 px: three columns `--col-l | glass | --col-r`, then the film strip, credit line + key + colour strip, facts (slate + ticket | directory | type card). From 1500 px the right column shares out its slack between its parts (`align-content: space-between`), below that the left column is the tall one.
* 760-1179 px: the glass on top over the full width, Find my name under it, the film strip with its foot, notes beside the print + slips (`display: contents` re-flows the table and evidence into one grid), then facts (slate + ticket left, directory right, type card under).
* < 760 px: one column in story order (glass, film + foot, print, slips, notes, facts: directory, type card); the Find tab lives in the pager (Back / Find my name / Next), the slug line is title + proof number; no tilted paper (the tape stays); the film strip scrolls sideways and keeps the frame on show centred; the book is single-page.
* `.w-contract-print` (masthead print and credit-line print) have one fixed height so swapping them never moves the slips.

## 7. Motion, accessibility, performance, honesty

* Motion: every entrance sits under `html.js`; base.css shortens animations under reduced / paused motion (`useWorld().reduced` is `useMotion().still`). No loops. Moving parts: the lamp (three flickers when the folder opens, one opacity overlay), the book (framer spring, or a 240 ms dissolve when still), the pen circles (stroke draw), the loupe pop-in, the film strip wipe, the caption fade, the reader's fade. Transform, opacity and clip-path only.
* Reduced / paused: no curl, the circle and loupe appear fully drawn after 300 ms, the lamp is off, the book starts on 42-43.
* Landmarks: `aside` (notes, labelled), `section`s (evidence, film, directory, facts), the book is a `role="group"` book from `FlipBook`; one polite status line; headings h2 / h3 only (the Cover owns the h1). Every picture has alt text (decorative crops `alt=""`); slips are `button aria-pressed`, the contact sheet is a list of `button aria-current` (the label adds "my name is on this spread"), the directory rows are buttons (`aria-current` for the room on show, `lang="es"` on Spanish names), the scrubber is a labelled range with `aria-valuetext`, the tabs use `aria-disabled` at the ends, the reader is `role="dialog" aria-modal`.
* Tap targets >= 44 px on touch (TabButton rules, the range is 44 px tall, directory rows grow to 44 px). Nothing under 13 px (audit-page: no findings). Contrast: ink on tomato, paper and the peach glass; cream on ink and on the espresso plate; the only cream on a coloured field is the 39 px "Press notes" / "DIRECTORY" display on the issue's rust (3.8:1, large text).
* Lazy loading: only 3 spreads of `<img decoding="async">` are mounted by the book (6 page images + the cover at load on a laptop); slips and rail use `loading="lazy"` (the rail is one 61 KB sprite instead of 16 requests); width and height on every image; the prints are fixed-height boxes. CLS through open + picks + reader: 0.002 at 1440, 0.002 at 390.
* Chunk: `ContractWorld` 13 KB gzip JS + 6.7 KB gzip CSS (+ the shared `FlipBook` chunk 11.5 KB + 2.5 KB CSS), about 34 KB gzip in all against the 120 KB budget; fonts Bitter + Overpass are loaded by the shell (`loadWorldFonts('contract')`).
* Honesty (docs/ART_DIRECTION.md 12.1): the world never says or implies that I laid out the issue or any page; "Redacción" is named as the editorial team; Maquetación is not shown or credited; the director is not named; page 4 is the redacted image (never re-render from the PDF); the credit line "Pages © Casual Magazines and the credited photographers, shown as a portfolio sample." is always visible; the type card says Bitter / Overpass are stand-ins for Caecilia / Interstate. The directory and the captions are observation of the published layout.

## 8. How to test (real shell)

`npx vite --port 5210 --strictPort --host 127.0.0.1`, then `http://127.0.0.1:5210/#/work/contract` (deep link) or open `#works` and click the first card. Interactions worth a look: arrows / drag / the pager / the scrubber / a frame of the film / a directory row; Find my name; each slip (72, 111 and 186 turn the book, 91, 195 and 213 lay the crop large); Read closer (Esc, `[` `]`, size toggle); `]` and `[` hop to the next / previous project; Esc closes. With `reducedMotion` the book never curls and the marks appear drawn.

## 9. Critique log (three rounds on the real result, 1440 x 900, 1920 x 1080, 1280 x 720, 768 x 1024, 390 x 844, reduced motion)

Round 1 (first look at the earlier build)
1. The signature tab was below the fold on a phone (the book, its deck and the film all came first) -> a second "Find my name" lives in the pager between Back and Next; the standalone tab is hidden there.
2. Dead rectangles at the foot: a credit line and a small bar strip in one corner, the facts slate floating in a wide empty band -> the foot is a press control strip (credit line, key to the ticks, colour bars in real process inks + tone ladder) and the facts band is a row of three real things (slate + ticket | directory sign | type card).
3. Gallery, not light table: the book lay on a flat mat with a soft glow -> the book, ruler, caption and pager sit on a lit glass pane in a black frame (the one gradient: warm in the middle, falling off to the frame), the registration targets are printed in the margin of glass, the lamp flickers on when the folder opens.

Round 2 (after round 1)
1. The three columns started at different heights (notes, glass frame, tab) -> the frame is dropped by its own 7 px outline so the tops line up.
2. 1280 x 720: the slug line wrapped, the new Read tab was an unlabelled icon -> tracking and gap tightened, the label appears when the glass is 800 px wide (container query).
3. 1920 x 1080: a 100 px hole under the slips -> the right column shares out its slack from 1500 px (not below: at 1280 the left column is the taller one and the stretch opened gaps).

Round 3 (loupe, reader, phone, tablet)
1. The loupe's pen loop cut the name ("Monfor") and clipped the "P" of a byline because the hand-drawn loop only fills 85 % of its box -> the boxes are cut wider on both sides (checked at 2x).
2. Tablet: the credit line, key and colour strip floated far from the film, the type card ran 100 % wide -> they hang under the film strip, the card is limited to 31 rem.
3. Reader on a phone: four tabs wrapped, "Fit to screen" broke onto two lines and changed the tab's size -> one constant label, "Back" short label, two-row header; fitted view first (the 1000 px picture at 1:1 on a 390 px screen showed a crop of a crop).

## 10. Notes for other worlds and the shell

* `FlipBook keys="window"` also takes Home and End anywhere on the page, and those two keys are how a world's scroller is moved to its top and bottom. ContractWorld works around it with a capture-phase listener that stops them unless focus is inside the book (`ContractWorld.tsx`, the effect commented "Home / End guard"). A world that uses the window keys and scrolls should do the same, or the FlipBook should only take Home / End while the book has focus.
* A lightbox that must cover the world but not the shell's tab strip is portalled into `scrollRef.current.parentElement` (the `.pm-world-body`); the Plana manual viewer and the Contract reader both do it. A `bodyRef` on `useWorld()` would make that less of a trick.
* Testing: another agent's edit can full-reload a dev server mid-test. The numbers above were taken on a production build served from the scratchpad (`vite build --outDir <scratchpad>/dist-contract`, then `vite preview --outDir <scratchpad>/dist-contract`).
