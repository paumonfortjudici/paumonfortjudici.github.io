# World 9, "Slide Deck" (concept-portfolio): API / behaviour note

Source: `src/worlds/ConceptPortfolioWorld.tsx` (default export, lazy chunk) + `src/worlds/concept-portfolio/**`. It renders only the body below the shell's strip (no title, no close, no prev / next) and uses `useWorld()` for `{ work, reduced, scrollRef }`. Nothing else in the repo imports from it. Chunk (production build): **20.7 KB gzip JS + 8.2 KB gzip CSS** (budget 120 KB) and the Anybody face (loaded by the shell with `loadWorldFonts('concept-portfolio')`). `tsc -b` clean for these files, no console output, no 404s, no horizontal scroll at 390.

## 1. What it is

A small **presentation room** for the portfolio deck of an invented client (Ona Ribas, foley artist, Girona). The deck is the deliverable, so the world is built around showing it (a different family from the other nine worlds: a horizontal lane of paper-mounted slides plus tools, not a page):

* **the lane**: the five 9:16 slides in a horizontal scroll-snap strip. The slide in the middle is full size (`min(78vh, 820px)`, capped so mount + floor fit), its neighbours step back (scale .86 / .78, a night-teal veil, a degree or two of tilt). Each slide sits in a thin paper **mount** (washi tape on top, a caption slate on the lower margin: `SLIDE 02 / 05  ABOUT`, a clapper stick above it) and the middle one wears a taped paper tag stamped `CONCEPT / INVENTED CLIENT`.
* **Present**: the slide fills the screen's height (Fullscreen API, or a fixed overlay when the browser refuses), keys, swipe, a laser dot.
* **Design notes**: numbered pins on every slide with my reasons, first person (5 per slide, 25 in all).
* **Sound** (stretch goal): the props on the slides become instruments, synthesised with the Web Audio API (no audio files). OFF at first.
* **About Ona**: a folder-tab drawer (a bottom sheet on phones): bio, three invented projects, availability, an invented brief, the palette as click-to-copy chips, the fonts with a live Anybody width-axis sample.
* **Sheet**: a contact sheet of the five slides; pick a frame and the lane goes there.
* **Stage**: a teal wall with a butter paper cut laid over it (hard cut shadow, halftone dots, speck), the name painted across both in letters with their own widths, a paper-cut sunburst that turns slowly behind the middle slide, a call sheet pinned on the first slide, the boot-print trail as progress strip on a night-teal floor.
* Under the stage (a row of boot prints peeks under the floor on the first screen, so nobody needs a "scroll" cue): the **credits** ("How this deck was made", two lines fitted to the margins, an honest text, a film strip of the five slides from `sheet.webp`) and `<WorldFacts work={work} />` (Role / Year / Tools slate, CONCEPT stamp + the exact `CONCEPT_LINE`).

## 2. Files

| File | Job |
|---|---|
| `ConceptPortfolioWorld.tsx` | all state and wiring: lane, notes, sound, panels, presenter, keys, live region, sessionStorage, Escape guard |
| `concept-portfolio/data.ts` | the five slides (alt texts from `portfolio.json`), the pins and hotspots (positions measured on the slides in slide pixels, stored in percent), the client, palette, fonts, the sheet |
| `concept-portfolio/copy.ts` | every visible string of the world (English) |
| `concept-portfolio/useLane.ts` | scroll-snap lane: scale / tilt / dim per scroll frame, wall parallax, wheel steps, mouse drag with a throw, `goTo` |
| `concept-portfolio/Lane.tsx` | the mounts, caption slates, CONCEPT tag, loupe tab, neighbour "go to" buttons |
| `concept-portfolio/SlideView.tsx` | a slide as an object: picture, pins + notes, sound hotspots, the onomatopoeia pop, the loupe |
| `concept-portfolio/Wall.tsx` | wall, butter cut, halftone, painted title (two clipped copies), rays (`Rays` is reused by the presenter), call sheet |
| `concept-portfolio/Bar.tsx`, `Floor.tsx` | the five tabs; Previous / Next + the boot-print `Trail` |
| `concept-portfolio/Presenter.tsx` | presenter mode (+ `enterFullscreen`, `leaveFullscreen`) |
| `concept-portfolio/AboutPanel.tsx`, `SheetOverlay.tsx`, `useModal.ts` | the two overlays and their shared focus / Escape / Tab behaviour |
| `concept-portfolio/sound.ts` | `FoleyBoard`: the six synthesised hits |
| `concept-portfolio/StretchWord.tsx` | letters with their own `font-stretch` (`StretchWord`), a line stretched to its margins (`FitLine`), `autoWidths` |
| `concept-portfolio/deck.ts`, `icons.tsx` | the shared context (`useDeck`, `useInert`), small hand-drawn icons (boot print, loupe...) |
| `concept-portfolio/concept-portfolio.css` | all styling, classes `w-cp-*`; the deck's palette lives as custom properties `--cp-*` on `.w-cp` |

## 3. The lane

* **Geometry**: from 1200 px the mounts overlap (`--cp-tuck` = 13 % of a mount, 30 % from 1700 px; a CSS `gap` cannot be negative, so it is a negative margin) and from 1500 px the neighbours step back less (scale .92 instead of .86), so the middle slide is flanked by a fanned deck: four mounts show at 1920 with the first slide centred, all five from slide 2. `--cp-reserve` (92 px, 116 px on phones) is what the mount, caption slate and CONCEPT tag need above and below the slide.
* **Geometry (variables)**: `--cp-h` (slide height), `--cp-w`, `--cp-mw` (mount width), `--cp-gap`, `--cp-pull` (phones: neighbours overlap this much so a sliver of the next slide shows at each edge) live on `.w-cp-stage`. The lane has spacers so the first and the last slide can be centred; mounts snap with `scroll-snap-align: center` + `scroll-snap-stop: always`.
* **Wheel**: a vertical wheel over the lane turns into one slide per gesture (a gesture ends after 150 ms of silence; a hard mouse notch may add a step every 340 ms). Sideways wheel / trackpad scrolls natively and snaps. At the first slide scrolling up and at the last slide scrolling down are **not** captured: the page scrolls on to the credits (the toolbar, the wall above and the floor always scroll the page).
* **Drag**: mouse only (touch scrolls natively). A drag past 6 px disables snapping, writes `scrollLeft`, and on release projects the release speed about 260 ms ahead, then `scrollTo` (smooth) to the slide that throw lands on (at most two slides away). Reduced / paused motion: the throw is dropped, it jumps to the nearest slide. A drag swallows the click that follows.
* **Keys**: `ArrowLeft` / `ArrowRight` anywhere in the world (not while typing, not under an overlay); `Enter` (loupe) only while the lane itself has focus; `Home` / `End` jump the lane while the stage is on screen (they scroll the page again once it is scrolled down to the credits). While the loupe is on the arrows pan it (Shift = bigger steps) and `Escape` puts it away first.
* **Buttons**: Previous / Next tabs (`aria-disabled` at the ends, focus never lost), the boot-print trail (five buttons, `aria-current="step"`), a click on a neighbour (a real, un-tabbable `button` over it, cursor label Flip).
* **Scroll frame** (rAF, direct DOM writes, no React state): `transform` (rotate + scale) and the veil's `opacity` per mount, the wall slab's `translateX` (a third of the lane's speed) and the sunburst's counter-shift (it stays behind the middle slide). `useLane` returns `{ laneRef, index, mount, scrim, goTo }`.
* Only the slide in the middle is interactive: pins, hotspots and the loupe of the others are `inert`.

## 4. Loupe (detail lens)

Hover (mouse and trackpad only): a round glass follows the pointer over the current slide and shows the same 1080 px picture at about x2.8 (`SLIDE_W / frame width`, clamped 2 to 3.1). It hides over pins, notes and hotspots (`data-cp-ui`). Keyboard / touch alternative: the **Loupe** tab on the mount's lower margin (and `Enter` on the focused lane) turns on a larger fixed glass at 50 % x 38 %; arrows pan it, a drag (finger or mouse) moves it, `Escape` or the tab again puts it away. Position and enlargement are plain transforms written straight to the DOM. No loupe in the presenter (it has the laser).

## 5. Presenter mode

`Present` tab -> `flushSync(setPresenting(true))` then `requestFullscreen()` on the presenter element inside the same click. If the browser refuses (iPhone, iframes) the same element is a `position: fixed; inset: 0` overlay. Keys (capture phase, so the shell's `[` `]` hop and the lane arrows never fire): arrows, `PageUp` / `PageDown`, `Space`, `Home` / `End`, `N` toggles the design notes. Swipe, or tap the side margins. All five slides stay mounted (decoded) inside the presenter and only the one on show is visible, so turning a slide never flashes an empty frame. A laser dot (tomato, glow) replaces the cursor on fine pointers; the chrome (count + `Concept, invented client` tag, Leave tab, Previous / trail / Next, key hint) fades after 2.6 s without movement and comes back on focus.

**Escape order**: in real full screen the browser exits full screen on the first Escape (`fullscreenchange` closes the overlay, and a 500 ms guard swallows a late Escape keydown so it cannot also close the world); in the fallback overlay `useWorldEscape` leaves it; the world closes on the next press. Focus returns to the Present tab. The stage (and the world's live region) is `inert` while an overlay is open, so the presenter has a polite status line of its own that says "Slide N of 5: title" on every change.

## 6. Design notes (the director's commentary)

`SLIDES[i].pins`: `{ id, x, y, side, title, text }`, x / y in percent of the 1080 x 1920 slide (authored in slide pixels and converted by `pin()`: re-measure there if the art is re-exported), `side` = where the note opens so it never covers its own pin (`l r t b`; phones override it: pins below 54 % open upward, the rest downward). Each pin is a real `button` (`aria-expanded`, `aria-controls`, `aria-label="Design note 3 of 5: ..."`); the note is a paper slip with an ink edge and a hard shadow that is nudged (never over the pin) to stay inside the screen and the lane (checked for all 25 pins at 1440, 1920, 768 and 390). While the toggle is off the layer is `visibility: hidden` + `inert` + `aria-hidden`. One note at a time; `Escape` or a press elsewhere closes it; changing slide closes it. The notes say what the guide says (per-letter widths with the real numbers of the lockups, the field rhythm teal / butter / deep / butter / teal, the footprints that walk from slide 4 into slide 5, the burst as a spotlight, the cohesion rules). The signature "Pau" is set in the marker face (`loadHandFonts()`, lazy).

## 7. Sound board

`FoleyBoard` (`sound.ts`): one `AudioContext`, created inside the click that switches the toggle on (`arm()`; never before: `soundSupported()` guards it), every hit goes through bus -> limiter -> hard clip at +-1 -> output gain 0.25, so nothing can leave louder than 0.25 (measured with an analyser on the output: 0.13 to 0.23 over three overlapping hits of each sound), closed when the toggle goes off and when the world unmounts. Nothing plays while the tab is hidden (`visibilityState` check; the context is suspended / resumed on `visibilitychange` and never woken while hidden). Hits, all under 1.2 s (measured in the browser: 0.12 / 0.30 / 0.36 / 1.0 / 0.48 / 0.73 s): `snap` (click), `crunch` (9 bandpassed noise grains + crumble), `clop` (two hollow knocks), `whistle` (sine sweep 1250 to 2150 Hz with vibrato and steam), `steps` (two pitched thumps + gravel), `wave` (cloth whoosh + falling "bye-bye"). Hotspots (`SLIDES[i].hotspots`) exist only while the toggle is on; each press also pops its onomatopoeia (label font) and announces it, so it works without sound. State is remembered for the session (`sessionStorage['pm-cp-sound']`, try / catch); a restored ON creates its context on the first press. Honest label while on: "Synthesised in your browser: no recordings".

## 8. About Ona, the sheet, the stage

* **Panel** (`AboutPanel`): `role="dialog" aria-modal`, `Folder` with the tab "About Ona", a focus trap that stops the event before the shell's trap, `useWorldEscape`, focus restored to the tab. Palette chips copy the hex (`copyToClipboard` + `toast()` in a try / catch + a local "Copied" state); the width slider (`min 50, max 150`) feeds `font-stretch` of the CRUNCH sample; "Mix the widths" switches to the deck's per-letter pattern (the guide's own example `150, 90, 70, 100, 120, 90`). Syne and DM Sans are named only (they are not installed in the app: the slides carry them baked in) and the text says so. The brief ("What she asked for") is labelled "Invented brief".
* **Sheet** (`SheetOverlay`): the five frames are cut from `sheet.webp` with background positions; arrow keys walk the frames; the current one is circled.
* **Stage**: the wall slab is 260vw wide and drifts at 0.3x the lane. The butter paper is a `clip-path` polygon with a hand-cut edge; the same polygon (and its inverse) clips the two copies of the painted title so the letters change colour exactly at the cut. Rays: 16 + 10 hand-jittered triangles in one SVG, `pm-ambient` (stops under reduced / paused motion, rests while the stage is scrolled away).
* **Painted title**: live Anybody text with per-letter `font-stretch`, not the slides' baked lockups (the baked ones keep their pre-measured optical spacing).

## 9. Layout and breakpoints

The stage is `overflow: clip` (not a scroller: focus and `scrollIntoView` can never shift it; a Playwright `click()` with forced scroll retries used to move the page, a real mouse never does). The slide height is `min(78vh, 820px, stage height - toolbar - floor - 92px)`: at 1440 x 900 it is 666 px (74 vh), because the mount, the caption slate and the CONCEPT tag need 92 px.

* >= 1180 px: toolbar floats over the wall (left: Present, Design notes, Sound; right: Sheet, About Ona); call sheet bottom left on the first slide; hint "Drag, scroll or use the arrow keys" on the floor (>= 1100).
* 900-1179 px: no call sheet. 640-899 px: one row of smaller tabs, no hint.
* < 640 px: the toolbar is two rows of tabs, nothing scrolls sideways (row 1 Present / Notes / Sound, row 2 Sheet / About Ona plus, while Sound is on, a short honest label "Synthesised here: no recordings"; the notes tab says "Notes" and drops its count; `--rsv-top` is 108px); Previous / Next are icon-only tabs; neighbours overlap a little (`--cp-pull`) so a sliver of the next slide shows at the edge; the About drawer is a bottom sheet (90 % high); the contact sheet is a 3-column grid; notes open above or below their pin; the CONCEPT tag shrinks.
* Short screens (< 560 px high, landscape phones): the stage keeps a 560 px minimum height and the world scrolls; Present is the answer there.
* 1920 x 1080: the slide grows to 820 px, four slides show, the wall title and rays scale with the viewport.

## 10. Motion

Every ambient loop carries `pm-ambient` (rays, presenter rays). Animations are `transform` / `opacity` / `clip-path` only (pop, pin pop-in, note, tag, drawer, contact sheet, call sheet). Reduced / paused: no rotation, no parallax, no tilt, no momentum (a drag jumps to the nearest slide), instant snaps and scrolls, no pop-in, no ray rotation; state and content remain. Hidden / initial states only under `html.js`.

## 11. Accessibility

Landmarks: `section` "Presentation room", toolbar `group` "Deck tools", the lane is a focusable carousel `group` (`aria-roledescription`), each mount a `slide` group with its number and title, one polite status line (slide changes, toggles, sound words, loupe), dialogs for the panel / sheet / presenter. Headings: an sr-only `h2` (the Cover owns the `h1`), the credits `h3`. Every image has alt text (the slides use the `portfolio.json` descriptions); decorative art is `aria-hidden`. Tab order: toolbar, lane, hotspots, pins, Loupe, Previous, trail, Next. Targets >= 44 px on touch (tabs, trail steps, pins have a 44 px hit area). Nothing under 13 px. Contrast: ink on tomato / sun / celery / paper, butter on ink / night / deep, deep on paper and butter (all >= 4.5:1; years in tomato are 30 px display, 3.2:1 on paper).

## 12. Honesty

Ona Ribas, Casa Grava Studio, the film titles, hello@onaribas.example and the phone are invented and labelled so: the CONCEPT tag ("Invented client") on the slide in the middle and in the presenter, the "Invented brief" tag, the call sheet ("Ona Ribas, foley artist (invented)"), the credits text, and `WorldFacts` (stamp + `CONCEPT_LINE`). Pau's part is stated as the brief, the rules, the system and the art direction; the artwork was produced with AI-assisted tools under that direction. Notes say "I set / I fixed / I let" about rules, never "I drew".

## 13. Dev-only file (delete before shipping)

`concept-portfolio/_vite.dev.config.mjs`: a Vite config whose file watcher ignores everything under `src/` except this world, so another agent's edit cannot reload the page under test (`npx vite --config src/worlds/concept-portfolio/_vite.dev.config.mjs --port 5218 --strictPort --host 127.0.0.1`).

## 14. Critique log

Round 1 (first full render, 1440 and 390): (1) the CONCEPT stamp floated over the right-hand neighbour's art, a loose ornament covering content -> a paper tag taped to the corner of the slide in the middle; (2) the credits title ran off both margins as one huge line -> two lines fitted to the margins by measuring (`FitLine`); (3) at 768 the toolbar wrapped into two rows and hit the tape, at 390 the neighbours showed no peek -> one row of smaller tabs at <= 899 and `--cp-pull` on phones.
Round 2 (pins on the art, About panel, contact sheet): (1) several pins sat on the text they explain (slide 2 "Catalan.", slide 1 CRUNCH burst, slide 3 "WORK") -> re-measured; (2) the About header: the stamp overlapped the name and the Close tab, and the 55 to 65 wide letters of "ONA RIBAS" read as "OIA" -> stamp moved under the meta line, narrow letters widened to the guide's minimums; (3) contact-sheet cells overflowed their columns on phones -> `min-width: 0`, stacked labels.
Round 3 (whole states, 1366 / 1440 / 1920): (1) the butter side of the painted title read as dirty khaki -> a warm sun / butter mix, and halftone dots added to tie the wall to the slides' own print language; (2) nothing told you the credits and facts exist below -> the stage is 34 px shorter so the boot-print row peeks under the floor; (3) pins and sound badges on the neighbours looked pressable -> they stay visible (the room is annotated everywhere) but are inert, dimmed by the veil, hidden from assistive tech, and a press on them takes you to that slide.
Round 4 (measured, not estimated): the five slides were overlaid with a labelled grid and every pin and hotspot was re-placed from it: pins that sat on a title letter now sit in the right margin at the title's mid-height (the ink touches the margin, so the pin marks exactly that), pins on small text moved off it, the steps badge no longer covers the first timeline year (badge corner is a per-hotspot option); the CONCEPT tag was clipped by the stage at 1440 x 900 -> the reserve grew 8 px and the tag shrank; the presenter flashed an empty frame between slides -> all five stay mounted; the sound bus got a hard clip so the 0.25 peak claim is exact.

## 15. Weaknesses left

(1) Landscape phones: the 560 px minimum stage height means the first screen shows only the top of the slide; Present is the real answer. (2) The slides' baked small text (tags, timeline lines) is 9 to 12 px at lane size: the loupe and the presenter are the answer, the lane itself cannot do better with a 1080 x 1920 portrait at about 460 px wide. (3) Pin and hotspot positions were measured by eye on the current WebPs: re-export the art and they must be re-measured (`data.ts`, slide pixels). (4) The synthesised hits are plausible, not recordings by design: the kettle and the crunch convince, the clop is closer to a woodblock. (5) The real-desktop full-screen path (physical Escape) could only be tested in headless Chrome.

## 16. Critic round 1 (fixes)

* **Lane** (D1): the tuck above; the call sheet scales with the room (x1.22 from 1560 px, x1.42 from 1800 px) and the last slide gets its own slip on the right of the wall, "That's a wrap" (scene 5 of 5, the invented client, "roll the credits"), with a row of boot prints walking off it (`Sheet kind="wrap"` in `Wall.tsx`, pinned to the wall, not the slab). The painted wall title re-stretches on every slide: slide 1 keeps the authored widths, the others use `autoWidths(text, seed)` (same rules), each letter glides with a `font-stretch` transition (none under reduced / paused motion).
* **Targets** (D2): toolbar, loupe and floor tabs `min-height: 44px`; trail steps 44 wide; the pin is now a real 44 x 44 button with the 28 px disc drawn by `::before` (no more `::after` hit area).
* **CONCEPT tag on phones** (D3): `--cp-reserve: 116px` gives the tag room inside the lane's clip.
* **Credits heading** (D4): one `aria-label` on the h3, every visual line `aria-hidden` (no sr-only copy any more).
* **Credits layout** (D5): copy left, the Role / Year / Tools slate pushed to the right margin, the film strip runs edge to edge (negative margins, `overflow-x: clip` on the section) under both.
* **Presenter** (D6): the sides are the stage's own wall (butter paper left, teal right, rays, "ONA" / "RIBAS" painted and cropped); the vertical trail sits on a night-teal strip so it reads on butter.
* **Notes** (D7): wide screens: the slip opens beside the slide on the wall (side chosen by the pin's half) with an inked leader line from the pin (`--lead`); if the wall has no room (768) or on phones it docks as a strip along the top or bottom edge of the slide, whichever hides fewer of the other pins (never its own), with `pointer-events: none` so covered pins can still be tapped. `Pin.side` in `data.ts` is no longer used.
* **Close labels** (D8): the About drawer and the contact sheet say "Back to the deck"; in the drawer the tab has its own row above the name.
* **Loupe hint** (D9): 1.8 s after the room opens a small tag "Tiny print? Try the loupe" points at the Loupe tab and the tab nods twice; it goes after 9 s, or as soon as the loupe or the notes are on.
* **First paint** (D10): the first slide's image is requested as soon as the chunk is evaluated (`new Image()` in `ConceptPortfolioWorld.tsx`). The rest of the delay is the shell's loader on a cold server.


## Mop-up round

* **Phones toolbar** (D11): two rows, every tab visible at 390 (Sheet and About Ona on row 2).
* **Loupe hint** (D12): the "Tiny print? Try the loupe" tag now sits on the wall to the right of the mount (>= 1100px) instead of across the slide; below 1100px only the tab nods (three times).
* **Neighbour pins and hotspots** (D13): `pointer-events: none` on every mount that is not the current one.
* **Home / End** (D14): global while the stage is in view and no overlay is open.
* **Loupe** (D15): the glass is a clipped child (`.w-cp-loupe-glass`); the zoom readout is a sun-coloured stamp on the rim, outside the circle.
