# World 7: Somia, "Storefront" (API note)

Slug `somia` · folder colour lagoon · files: `src/worlds/SomiaWorld.tsx` (default export, lazy chunk) and `src/worlds/somia/**` (CSS prefix `w-somia-`). Nothing outside those paths was touched.
The world is a **shop front**: an awning, a sign plate, a chalk panel and a shop window whose glass holds a laptop and a phone scrolling through the real captures of somia.store. Behind it a shelving unit holds the brand, a wall of framed screens opens in a lightbox, and a till receipt on the counter says what the job was. Chunk: 48.4 KB JS (15.5 KB gz) + 50.2 KB CSS (10.9 KB gz), no heavy library (framer-motion only for the lightbox presence; the tour engine is plain TypeScript).

## 1. File map

| File | What it is |
|---|---|
| `SomiaWorld.tsx` | composes the four parts, imports `@fontsource/fira-sans/latin-300.css` and `somia/somia.css`, owns `ready` (entrance gate: the world is invisible until Cormorant and Fira Sans are decoded, or 900 ms) and the `inert` switch while a framed picture is open |
| `somia/data.ts` | every file name, size, caption, chapter marker, hex, translation (sources: `public/works/somia/web/manifest.json`, `notes/web-capture.md`). `TOUR[].captions` = the English line per section |
| `somia/Facade.tsx` | fascia + `Awning` + wall column (sign plate, `Chalk` panel, notice with the portfolio's lagoon `Tape`) + `Showcase` |
| `somia/Awning.tsx` | 27 CSS stripes with scalloped ends (container queries hide stripes on narrower widths, the count stays odd) |
| `somia/Chalk.tsx` | "visto como pienso" lettered in chalk: a ten-letter hand alphabet (centre-line strokes, seeded jitter), stroke-by-stroke draw-on, SVG chalk filter whose grain is kept at about one screen pixel by a ResizeObserver |
| `somia/Showcase.tsx` | the window: hang-tag device switcher, page switcher, plinth, sill with the controls, the tape and (narrow windows) the translation card; owns playing / speed / mode / page state |
| `somia/Devices.tsx` | `Laptop` and `Phone` drawn in CSS and the shared `Screen` (clipping frame + tall reel of captures, drag, keys, slice mounting) |
| `somia/Sections.tsx` | the page's sections as a large list on the glass beside a solo phone (a second way to jump; active one written to the DOM by the tour) |
| `somia/Tape.tsx` | the tailor's tape: a real `<input type="range">` over a drawn ribbon, a sewing-pin playhead, one button per section |
| `somia/Subtitle.tsx` | the translation card: the section on show in English, the Spanish original in italics where the page prints a short phrase. Lettered on the glass when the window is 780 px wide or more, under the tape otherwise |
| `somia/tour.ts` | the engine (no React): one master progress `p` 0..1 drives every screen, the tape pin, the subtitle and the section buttons |
| `somia/Shelves.tsx` | the brand strip: logo family + type, palette chips (click to copy), four swing tags |
| `somia/Gallery.tsx` | eight framed screens (twelve-column hang beside a sticky headline; every picture is a zoomed crop given by `FRAMED[].crop`) + lightbox (portalled into the folder body) |
| `somia/Counter.tsx` | till receipt (prints itself, shop seal pressed on it) + `WorldFacts` + the site's own "Pause motion" tab + the motto as a marquee on the front panel |
| `somia/somia.css` | all styling (one file; sections: front / subtitle / tape / brand strip / gallery / counter / responsive / still) |

## 2. Reading path

1. **Front** (first screen, a poster whose dominant thing is the window): lagoon fascia (the folder colour, so the shell's title tab joins it), an awning that rolls down, sign plate (white wordmark, 140 px wide: the PNGs are only 281 px), chalk panel + paper label ("dressed as I think", "Redrawn in chalk for this page."), a notice taped up with lagoon washi ("I did Somia's brand identity, logo and web layout."), the window with devices, the sill with the controls. From 1500 px up the wall is framed by two stone pilasters.
2. **Brand strip**: black cornice with the title, then three bays: logo family and type (two wordmark boxes, ring stamp turning around the ribbon S, favicon in its tab, type card), palette (8 paint chips), values (4 swing tags with the line icons). Objects stand on planks; labels hang on the plank edge; the swing tags hang from a rail and swing once when touched.
3. **On the wall**: eight framed screens (salon hang), lightbox.
4. **Counter**: receipt, facts slate (`WorldFacts`, in the cabinet's own Fraunces / Courier Prime), "Pause motion" tab, the motto as a marquee on the front panel.

## 3. The shop window (signature interaction)

* **Devices**: laptop (screen 16:10, shows 1440 x 900 page pixels) and phone (390 x 844). Both are pure CSS (lid, bezel, camera, hinge notch, island, side buttons, contact shadow); the tent cards read "Desktop 1440 px" / "Phone 390 px" (the real capture widths).
* **Pages**: Home (desktop = the 1440 x 8496 composite, phone = nine mobile slices), Collection (Vincles), Product. Desktop collection / product are stacked slices; every slice reserves its exact `aspect-ratio` and its `<img>` is created only when it comes within 1.3 screens of the visible part (IntersectionObserver rooted on the screen). A device that is not on show fetches nothing: on a phone the 406 KB desktop composite is never requested (measured). The first capture of the device on show carries `fetchpriority="high"`.
* **Device switcher** (hang tags, radio group): Laptop / Phone / Side by side. Side by side is hidden below 560 px of window width (phones start on Phone). The hidden device fades, is `inert` and `aria-hidden`; solo modes scale the device with a transform (no layout animation).
* **One master progress**: laptop and phone scroll together (progress maps to each page's own length, so the footer meets the footer), a drag on either screen moves both.
* **Browse the site**: Play / Pause (`data-cursor="Play"` when paused), speed ½× 1× 2× (a row of size-picker squares). 1× is about 190 page px per second on the laptop (170 on the phone). Tour = lead (hero rests 1.4 s) -> scroll -> hold 1.6 s at the end -> eased rewind -> repeat. It only runs while the window is at least 12 % visible in the world scroller, the tab is visible and no framed picture is open; otherwise the rAF stops (measured: the reel does not move while scrolled away or with the tab hidden). Measured on a production build: p95 frame time 8 to 14 ms, no long tasks (the machine was shared by many agents, so a stray 200 ms frame appears now and then, also with the tour paused).
* **Scrub**: drag a screen (mouse / pen; momentum on release; pauses the tour for good), the tape (range input: pointer, arrows = 2 %, Page keys = 10 %, Home / End; the tour resumes after the touch), a section button (Hero, Tiles, Film, Look, Story, Values, Footer; Grid / More rows; Gallery / Related / Reviews / Footer: tweened, the tour keeps going), or focus a screen and press Arrow keys (16 % of a screen), Page keys, Space / Shift+Space, Home, End.
* **Translation card** (`Subtitle`): follows the master progress. "Join sustainable fashion / *únete a la moda ecológica*" on the hero, and so on for every section of every page. It is the cinema detail of this world: subtitles for a foreign-language picture. No live region (it changes while the tour plays).
* **Touch**: screens do not capture touch (the page keeps scrolling); the tape, play / pause and the speed squares are the touch path (section chips are replaced by the translation card under the tape below 760 px).
* **Reduced motion / "Pause motion"** (`useWorld().reduced`): no autoplay, no awning unroll, chalk fully drawn, ring and marquee still, hang tags still, receipt printed; Play and the speed squares are replaced by Previous / Next section buttons plus a one-line hint. Dragging, the tape and the keys still work (instant).

### Engine (`tour.ts`) in short

```ts
const tour = createTour()                       // one per Showcase
tour.register('laptop', { viewport, strip })    // a screen joins; returns cleanup (ResizeObserver keeps max travel)
tour.subscribe((p) => ...)                      // per-frame callback (tape pin, active section, subtitle); returns cleanup
tour.configure({ playing, active, rate })       // rate = progress per second
tour.scrubTo(p) / tour.tweenTo(p, ms) / tour.holdScrub(bool)
tour.grab(id, y) / tour.drag(y) / tour.release()   // direct manipulation with momentum
tour.nudge(id, layoutPx) / tour.onInteract      // keyboard on a screen; the UI turns "playing" off
```

## 4. Brand strip details

* Palette (theme tokens from the shop's CSS): Ink `#1C1C1C`, Black `#040404`, Paper `#F5F4F1`, Light grey `#EFEFEF`, White `#FFFFFF`, Periwinkle `#BFD2E8` (the NEW badge). Sage `#A9AA98` and Concrete `#8D8780` are **sampled from the photographs** and labelled so. Click or tap a chip: `useCopy`, the hex turns into "Copied", a polite status line announces it, cursor label "Copy".
* Values: the four line icons (`brand/icon-*.png`, 76 px), Spanish word in italics, English label, my English reading of the line the shop prints under each icon. The tags swing once when the pointer enters (decoration only; nothing is said by the swing).
* Type: PP Hatton Ultralight (headlines, lowercase) and Fira Sans 300 / 400 (text), as read from the shop's CSS.
* The ring stamp and ribbon S are the real PNG files (351 and 189 px): the ring turns slowly (`pm-ambient`, 70 s), the same pair is pressed on the receipt as the shop's seal.

## 5. Fonts (decision)

PP Hatton is a commercial face and is **never self-hosted**. Headlines use **`@fontsource-variable/cormorant`** (weight 300, 500 for the Spanish italics) as the look-alike, text uses **`@fontsource/fira-sans`** 300 / 400. `src/worlds/fonts.ts` (foundation) loads Cormorant roman + italic and Fira Sans 400 / 500 / 600 with the chunk; the world adds `latin-300.css` itself (Fira Sans Light is the shop's body weight). The world root sets `--font-display` / `--font-label` to its own faces (core body face Karla stays the fallback); `.w-somia-counter__facts` resets them to Fraunces / Courier Prime so the facts slate keeps the cabinet's voice, and the receipt is typed in Courier Prime. The UI says plainly that Cormorant is a stand-in.

## 5b. Round-1 changes (critic fixes)

* **No prices**: the shop prints prices on its collection and product pages (also in the home "look" card and the related-products rows). Twelve captures were re-saved with every price covered by a paper price tag (a hatched, outlined label with a punched hole, redrawn over the first grey bars; `public/works/somia/web/masked/`, found by OCR; the originals stay in `web/`). `data.ts` routes those file names through `cap()` to `masked/`: the window, the wall and the lightbox never show a price.
* **Solo phone**: when the Phone tag is on and the window is 640 px wide or more, the glass carries the section on show lettered large on the left (the translation card, `where="stage"`) and the page's sections as a large clickable list on the right (`Sections.tsx`). The card leaves the head and the sill in that mode. Solo scales: laptop 1.12 (about 80 % of the glass height), phone 1.34 (it just clears the head of the glass).
* **Wall**: left column (headline, sticky) + twelve-column hang (8+4, 4+4+4, 3+6+3), slim mats, each picture cropped by fractions of its source (`crop: {x,y,w,h,ratio}`; `ratio` must equal the real box shape measured in the browser, product .72, story and basket .68, otherwise object-fit cover trims the sides again); the museum label hangs in a reserved strip so every row ends on one line; labels never wrap (ellipsis). Phone: two columns with the order set by hand.
* **Counter**: the receipt (bigger, till barcode instead of the small seal), the facts slate (bigger), the ticket and the caption sit on one counter top lit by a flat lamp cone; the shop's ring stamp and ribbon S are pressed large (decorative) beside the caption, the content block is centred in the counter top and from 1101 px a second, fainter press of the same stamp sits low on the left; on a tablet the one seal is centred. Single column below 1100 px.
* **Tour**: the hero now rests 2.6 s on the first start (the whole header and wordmark are visible), the chalk motto draws in about 1.8 s, section chips are painted 36 px tall with a 44 px hit area at every width and a 3 px focus ring, the favicon is shown in a real browser tab on its strip.

## 6. Honesty (docs/ART_DIRECTION.md 12.1)

* Role is written exactly as Pau's statement: **brand identity, logo and web layout** (notice, receipt, `WorldFacts` roles from the registry). Never "sole designer"; nothing about photography, copy or the hand lettering.
* The chalk motto is **redrawn for this page** (the real wall lettering is not Pau's to claim and was not copied); the label under the panel says so.
* The window shows **screenshots** ("The window shows screenshots of the live site", receipt line "Screens Oct 2026", facts caption). Photography, models and the words in the pictures are Somia's. No prices (covered in the captures, see 5b), no product claims, no customer or team portraits beyond what is already in `web/`.
* The shop's microcopy shown in captions is the shop's own and is translated, not extended. Spanish originals are in italics (`lang="es"`).
* The registry has no year and no tools for Somia, so the facts slate shows the Role cell only (see the open question in the report).

## 7. Accessibility

Landmarks: `section` regions with names; one sr-only `h2` for the world, `h3` for each part, `h4` bay titles. Radio groups are real radio inputs in `fieldset`s (arrow keys work, ring on the visible object via `label:has(input:focus-visible)`). Screens are `role="group" aria-roledescription="scrolling preview"` with a label that explains drag and arrows. Tape = labelled range input with `aria-valuetext` ("Story, 52 percent down the page"). Status changes go to one polite live region. Lightbox: `role="dialog" aria-modal`, focus to Close, Tab trap (the shell's trap is stopped), `useWorldEscape` (Escape closes the picture, a second Escape closes the world), Left / Right arrows, `[` and `]` swallowed while open, a click on the dark closes it (a real `<button>` out of the tab order), focus returns to the frame, the rest of the world is `inert`. The site's **"Pause motion"** tab (the chrome's `MotionToggle`, reused as is) stands on the counter's front panel because the header copy is inert while a world is open. Nothing under 13 px; tap targets are 44 px on touch (measured at 390 x 844: none under); contrast: ink on paper, white on black, paper on `#141414`, black on concrete 5.8:1 (narrow page switcher), periwinkle on the dark glass.

## 8. Responsive

1920: the composition scales (container units; the strip, the wall and the counter use `zoom` steps at 1680 / 1880 / 2300) and the window is capped by the viewport height, so the first screen stays a poster. 1440 x 900: fascia, awning, wall column, window and sill all fit above the fold (also with reduced motion). 1366 x 768 and 1280 x 720: the notice keeps its headline and one line. 768: the wall column becomes sign + notice beside the chalk panel; the window follows. 390: sign + paper label stand beside the chalk panel, notice below, window with the phone, tape, translation card; shelves wrap with a plank per row; the gallery is two columns; no horizontal scroll. Swept at 320, 360, 414, 520, 600, 680, 720, 820, 900, 1000, 1024, 1100, 1180, 1280, 1366, 2560: no horizontal overflow, no console messages.

## 9. Verified

`tsc -b` clean for these files; production build; no console errors or warnings, no failed or 404 requests; opens from a card (shared flight) and by deep link; Esc / `[` `]` still work; device switcher, page switcher, speed, play / pause, drag, tape, chapters, arrow / Page / Space / Home / End keys, lightbox (focus trap, keys, backdrop click, Escape), chip copy, swing, receipt print, reduced motion (OS setting) and "Pause motion" (the tab in the world), off-screen and hidden-tab pause; 1440 x 900, 1920 x 1080, 2560 x 1440, 768 x 1024, 390 x 844. Gates: taste-skill lint on `src/worlds/somia` reports only the cabinet's allowed families (shadow = paper thickness and cast shadows, gradient = hard-stop patterns for ticks, seams and screws, mono = the till receipt, hairline = the receipt's dashed rules, outlined-box = 1px paper edges); taste-skill inspect on `#/work/somia`: the one finding that was this world's (the gallery headline wrapping to three lines) is fixed; what remains (eyebrow `FOLDER 01`, text-shadow, covered cover text, the About paragraph, the nav's sideways row) belongs to the cabinet page behind the open world, and `button-fx` counts every tab-button on the page (the cabinet's own tabs carry the same 3px paper edge as the solid Pause button here).

## 10. Notes for other agents

* `--w-bg` stays lagoon for the shell's folder body; the world covers it with Somia's paper beige and keeps a 14 px lagoon fascia at the very top so the tab joins the page. Until the faces are decoded the folder colour stays visible under the (invisible) world, so the opening folder never turns into a blank page.
* The lightbox is portalled into `.pm-world-body` (the scroller's parent) and therefore outside `.w-somia`: its variables are declared on `.w-somia-lb` too.
* Everything colour-bearing in this world is Somia's palette; the only cabinet colours are the lagoon fascia, the lagoon tape on the notice, the facts slate and the Pause motion tab.
* `scroll-home-desktop.mp4` (2.6 MB) is deliberately not used: the composite is 406 KB and the tour needs control over speed and position.
* Only transform, opacity and clip-path animate (plus the chalk's stroke-dashoffset); hover and selected colours change at once.
