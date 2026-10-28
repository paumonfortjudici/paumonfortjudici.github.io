# World 8: Gotet, "Brand Board Explorer" (API note)

Slug `concept-brand` · folder colour olive · files: `src/worlds/ConceptBrandWorld.tsx` (default export, lazy chunk) and `src/worlds/concept-brand/**` (CSS prefix `w-concept-brand-`). Derived art was added under `public/works/concept-brand/art/` (section 9). Nothing else was touched.
Gotet is an **invented** vermuteria in Cardedeu (a concept project: the shell shows the CONCEPT stamp and the CONCEPT line, the world says so again). The world is **a brand board you can walk around, pinned on the wall of the bar**: one big pan / zoom canvas with a docked info panel (a menu card). The interior is Gotet's own brand: Blau Sifó `#2340C0`, Vermell Vermut `#D8283B`, Verd Oliva `#86A22F`, Mantega `#FFD34E`, Rosat `#F8D2D0`, Tinta `#211736`; faces Fraunces (soft + wonk) and Barlow Semi Condensed. The shell around it stays olive. Honesty: the brief, the art direction and the rules are Pau's; the artwork was produced with AI-assisted tools under that direction (said on the overview, on the last tour stop and in the facts slate; the copy never says "client", "launched" or "real bar").

## 1. File map

| File | What it is |
|---|---|
| `ConceptBrandWorld.tsx` | the world: view (board / index), selection, colourway, tour, kit drawer, bottom-sheet state, the `rail` and `sheet` layout switches, `reserve` (how much canvas the overlay UI covers), Escape layering (`useWorldEscape`), tour arrow keys, focus on view change |
| `concept-brand/data.ts` | all structure: board size, 24 hotspot rects (`HOTS`, same numbers as `art/board-hotspots.json`), the nine chip groups, mascots + hit areas, palette (+ live WCAG `contrast()`), colourways, logo family, tour groups, `Selection` helpers (`selectionRects`, `selectionView`) and the image URL helpers (`IMG`, thumbs) |
| `concept-brand/copy.ts` | every sentence: copy for the 20 mockups + 3 posters + wordmark (lines, palette, type samples, real sizes), group intros, mascot lore + catch phrases, the nine tour notes, kit texts, UI strings |
| `concept-brand/geometry.ts` | scallop paths (guide 9.2), the hand-marker path generator, camera maths (`scaleFor`, `cameraAt`, `centreOf`, `clampCentre`), van Wijk and Nuij `flightPath`, `dimPath` |
| `concept-brand/Wall.tsx` | **own chunk**, the only importer of `react-zoom-pan-pinch`: wheel / pinch / drag / double click / keyboard, the flight camera, settle, the sliding wall paper, CSS variables for the counter-scaled marks |
| `concept-brand/Board.tsx`, `BoardLayers.tsx` | the board object (hard shadow, 4 tapes), live top zone, lower art, 2x detail tiles, dim + marker (`Highlight`), the 28 buttons (`Hotspots`), speech `Bubbles` |
| `concept-brand/TopZone.tsx` | the top zone rebuilt live (guide 9.2) with colourway re-tint and reverse wordmark swap |
| `concept-brand/speech.ts` | `useSpeech()`: hop + pose B + bubble for 1.2 s, `preloadPoses()` |
| `concept-brand/Controls.tsx` | crown-cap dial (turns with the zoom, fits the board) + two coasters (zoom out / in) + the zoom store (`makeStore`) |
| `concept-brand/Chips.tsx` | the nine hotspot chips with count chips |
| `concept-brand/Panel.tsx`, `panels.tsx`, `atoms.tsx` | the info panel (docked or bottom sheet) and its bodies: overview, group, piece, wordmark, cast, pattern; bars, leaders, paint chips (`useHexCopy` + `toast`), type samples |
| `concept-brand/Tour.tsx` | "Sunday service": nine stops, order docket pinned along the bottom of the wall |
| `concept-brand/Kit.tsx` | brand kit drawer: palette + ratio bar, contrast table (computed from the hexes), type specimens, logo family |
| `concept-brand/IndexView.tsx` | the Index view: every piece as a tile + inline details + facts |
| `concept-brand/wall.css`, `ui.css`, `panel.css`, `index.css` | all styling (palette variables at the top of `wall.css`) |
| `concept-brand/_harness.html/.tsx`, `_top.html/.tsx`, `_vite.dev.mjs`, `_vite.build.mjs` | **DEV ONLY, delete before shipping** (section 10) |

## 2. Model

```ts
interface Selection { group: GroupId | null; item: string | null }   // item = hotspot id (m06), mascot id (gotet) or null
```
`group` is one of the nine chips (`wordmark cast pattern shopfront takeaway print bottle wearables posters`). One selection drives everything: the camera (`selectionView`), the dim + marker (`selectionRects`), the chip state, the panel body (`PanelBody`), the index tile that is open. A chip = `{group, item: null}` (the active chip again clears it), a tile or a mascot = `{group: groupOf(id), item: id}`, key `0` = none.

## 3. Layout

* **Rail** (`useMediaQuery('(min-width: 1100px) and (min-height: 700px)')`): the nine chips stand in a column on the left edge of the wall (ragged, like labels on a menu board), the CONCEPT stamp sits above the three tabs at the bottom left, the zoom controls stand in a column on the right edge, the panel is docked right (`clamp(340px, 29vw, 470px)`). The board gets the whole height (`reserve`: left = right edge of the chip column, right 84 px, top 14, bottom 62 for the tabs).
* **Row** (900 to 1099 px, or short screens): chips in a row on top, tabs bottom left, controls bottom right. **Sheet** (below 900 px): the three tabs on top of a scrolling chip row, the panel is a bottom sheet (56 % high, folded to a 76 px handle; it unfolds on a selection, folds when you arrive on the board). **Phone** (below 700 px): the Index is the default and the board is behind the Board tab.
* `reserve = { top, bottom, left, right }` in px is what the overlay UI covers; the camera frames every target in what is left, so nothing ever hides behind the chips, the tour docket or the sheet.

## 4. The wall (`Wall.tsx`)

* The library is used with `limitToBounds={false}` and the board as its content (3000 x 4243 px at scale 1, `STAGE_PAD = 0`). Wheel and double click are **ours**: the library's wheel step is additive, so we zoom multiplicatively around the pointer (a mouse notch about 17 %, a trackpad pinch finer). `minScale` = the fit, `MAX_SCALE` = 3. Drag pans with the library's momentum, pinch is the library's. After any gesture `settle()` waits for the momentum to run out and eases the camera back if it wandered (`clampCentre`; at the fit the board returns to the middle).
* Double click / double tap zooms 2.2x at the spot (near the maximum it goes back to the fit).
* **Keyboard** (only while the canvas or something in it has focus; Escape, `[` and `]` are never handled): arrows pan 20 % of the view, `+` `=` zoom in, `-` `_` zoom out, `0` fits (and clears the selection). During the tour the arrows belong to the tour. A pointer-down on the canvas takes focus back (the library cancels mousedown, which cancels focus). A skip link ("Skip the tiles, go to the details") jumps over the 28 tab stops.
* **The flight**: `flyTo(camera, ms?)` follows the van Wijk and Nuij smooth zoom and pan (one flight, not a zoom-out then a zoom-in), 620 to 860 ms by distance, eased in-out; instant when `useWorld().reduced`. Any pointer, wheel or key cancels it. A new selection always flies; the dim and the hand marker appear when the camera has **landed** (`landed` state: it reads as "fly there, then circle it", and the flight itself is a pure transform); a change of `reserve` (sheet or docket opened) re-flies unless the visitor moved the camera by hand since the last framing; a new window size re-frames at once. A flight is cancelled when the world unmounts.
* Keyboard focus on a tile calls `ensureVisible(rect)` (a 420 ms flight only when the tile is not already inside the free part of the canvas). A click that ends a drag is ignored (`wasDrag()`, 6 px).
* Per-frame work is limited to: the library's transform, `--z` and `--bz` on the board (zoom; marks that must keep their screen size divide by it: focus rings, marker stroke, bubbles, hover ring), one `transform` on the wall paper, and a tiny external store for the dial. React state changes only for: the 2x detail switch, the full art switch, the view rectangle (culling), "at fit", "landed".
* **The wall paper** is one opaque, oversized layer (`will-change: transform`, one tile of overhang on top and left) that only ever slides by `translate3d` (a slow parallax of the camera centre, 0.07 px per board unit); the tile does not scale with the zoom (scaling a vector tile per frame was the single biggest cost measured).

## 5. The board (`Board.tsx`, `TopZone.tsx`)

* Layers (z): blue panel `0`, lower art `1`, 2x tiles `2`, live top zone `4`, dim + marker `6`, buttons `7`, bubbles `8`, tapes `10`. A hard shadow (34 / 40 px, no blur) under the sheet; four tapes (the `Tape` primitive at its natural size, scaled 3.1x).
* **Live top zone** (guide 9.2, diffed against `board.webp`, see section 8): Rosat ground with the faint pattern as the vector tile (`pattern-*.svg` at scale 2, clipped by the 25 scallops, a new colourway cross-fades), the wordmark image at (550, 60) 1900 wide, the four mascots at scale 0.95 with feet on y 1350 and centres 496 / 1046 / 1726 / 2386, the two captions in live SVG text (Barlow 700, 44 px, spaced 6).
* **Lower art**: `board-bottom-small.webp` first (174 KB), then `board-bottom.webp` (815 KB) once `zoom x dpr >= 0.36` or after 2.6 s idle; both are the rows y 1560 to 4243 of the finished board (the live zone covers everything above). **Detail**: the real 2x mockup and poster WebPs are laid over their cells only when `zoom x min(dpr, 2) >= 0.9` and the tile is within the view plus 25 %, with a 0.35 s fade (deep zoom stays crisp, the fit view stays light).
* **Mascots** are alive: a bob (`pm-ambient`, different period and delay each, absent when motion is still, and paused above 45 % zoom or when the top zone is out of view, so it never repaints big areas for nothing), and on mouse hover, focus or click a hop (squash and stretch), pose B for 1.2 s and a speech bubble (`Un gotet?`, `Passa, passa!`, `Psssh!`, `Crec!`). A mouse only says hello when no button is held (dragging across the cast stays quiet); touch triggers on tap. Only the latest speaker shows a bubble; a polite live region says "Gotet says Un gotet? A little glass?".
* **Buttons** (Tab order): tabs (Sunday service, Index, Brand kit), 9 chips, the skip link, the canvas, then 28 buttons: the top zone (`wordmark`; the click point decides wordmark or wallpaper), a patch of wallpaper, the 4 mascots, `m01` to `m20`, `p1` to `p3`; all 24 hotspots of `board-hotspots.json` are among them, labelled `title. alt text of the piece`.
* **Pattern selected**: the wordmark and the cast fade to 12 % so the wallpaper shows alone.

## 6. Panel, tour, kit, index

* **Panel**: docked from 900 px, a bottom sheet below. Opens by itself on a selection (not during the tour); scrolls to the top for a new piece and keeps its place when you switch character inside the cast. Bodies: Overview (nothing selected: says what is Pau's; the actions are on the first screen), Group (intro + rows with short real sizes), Piece (the rule, palette chips that copy the hex and call `toast()`, live type samples, real size / on the board / scale, previous / next in the group), **Wordmark** (11 variants as radios on their right ground, the clear-space diagram drawn in SVG over the real logo, smallest sizes with a 100 px actual-size figure, rules), **Cast** (4 heads as a picker, personality, catch phrase, pose A and B cropped to the character, the two heads, the four faces E1 Hola / E2 Xin-xin / E3 Psst / E4 Mmm, the family code), **Pattern** (the colourway radios re-tint the top zone live and swap the wordmark to the reverse version on blue and red grounds; the twelve icons drawn from `pattern-icons.svg` in the active colourway; lattice facts). The panel footer is `<WorldFacts work tone="ink" />`.
* **Tour** ("Sunday service"): nine stops, one note each, counter, dots, Back / Next stop / Skip (the last stop says Close), ArrowRight / ArrowLeft, Escape ends it. It never advances by itself. The docket sits along the bottom; `reserve.bottom` keeps the camera above it; the three tabs and the stamp hide while it runs.
* **Kit**: a drawer from the left; focus goes to its Close tab and returns to the Brand kit tab; Escape closes it before the tour and before the world.
* **Index**: its own scroller inside the world (the shell's scroller stays still), brand-coloured tiles with captions and alt text, a tile opens its details right under it (the same `PanelBody`, two columns on wide screens), "Show on the board" switches view with the selection kept. Ends with `<WorldFacts work tone="ink" />` on a pink card.

## 7. Accessibility, motion, copy

Landmarks: the panel is an `aside`, the canvas a labelled group (`aria-roledescription="canvas"`, described by the key hints), every control a real button, radio or link. Headings: panel title `h2`, bars `h3`. Focus ring: the global two-tone ring; on the board it is divided by the zoom so it stays 2 + 4 px on screen. Reduced motion and `html[data-motion="paused"]`: instant flights, no bob, no hop animation (pose B and the bubble still show), the marker is drawn, slide and pop animations collapse. Text pairs follow guide 2.5 (Tinta on Rosat, Mantega, Oliva; Blau on Rosat and Mantega; Rosat on Blau; Vermell only at 24 px and up). Tap targets are 44 px or more on touch. Italics are Fraunces italic (no faux Barlow italic). English only; two em dashes: none.

## 8. How it was verified

Playwright (`tools/shot.mjs`, `tools/audit-page.mjs` and a scratch runner for wheel, drag, pinch and taps through CDP). **Live top zone vs `board.webp`** at 1:1 (`_top.html`, whole board with `?board=1`): mean absolute difference per pixel (sum of RGB) pattern 1.5, wordmark 6.6, cast 5.6 to 7.5, scallops 7.5, captions 11 to 14, offset 0,0 everywhere; the whole assembled board 5 to 8 per band, the join at y 1560 5.2. Flights for every chip at 1440, 1920, 768 and 1100 stay inside the board. Wheel, drag, double click, keyboard (`+ - 0 arrows`, then `]` `[` Esc), pinch, double tap, settle. Esc layering (tour, kit, world). The real app (production build): deep link, opened from Works, closed with Esc. Reduced and paused motion. 390 x 844: Index first, no horizontal scroll, the board behind a toggle, the sheet. `tools/audit-page.mjs` on the real page at 1440 x 900, 1920 x 1080 and 390 x 844: no overflow, no text under 13 px, no image problems, no nameless controls, no duplicate ids, 0 low-contrast findings, focus ring visible along the tab order, CLS 0, no console errors, no failed requests. Chunks (production build): world entry 67.6 KB (21.7 KB gz), `Wall` 73.9 KB (23.4 KB gz, includes react-zoom-pan-pinch), CSS 44 KB (8.3 KB gz): about 53 KB gz in all, the library is in neither the main bundle nor the entry chunk.

## 9. Assets

Read only: `art/board.webp`, `board-small.webp`, `board-hotspots.json`, `brand/*.webp`, `mockups/*.webp`, `posters/*.webp`. Derived and added under `public/works/concept-brand/art/`:
* `board-bottom.webp` (3000 x 2683, 815 KB) and `board-bottom-small.webp` (1000 x 894, 174 KB): rows y 1560 to 4243 of the board (crop, one re-encode at quality 84).
* `brand/pattern-blau-on-rosat.svg`, `pattern-rosat-on-blau.svg`, `pattern-mantega-on-vermell.svg`, `pattern-faint-vermell-on-rosat.svg` (the vector tiles from `art-src/concept-brand/pattern`), `brand/pattern-wall.svg` (the faint tile on Tinta, Rosat at 7 %), `brand/pattern-icons.svg` (a `<symbol>` sprite of the 12 icons).
* `brand/s/*.webp` (29 small copies: heads 360 px, poses 480 px, logos 900 px, cast 1400 px, the icon sheet 1200 px) for the panel, the kit and the index.

## 10. For the lead and other agents

* Dev only, remove before shipping: `src/worlds/concept-brand/_harness.html`, `_harness.tsx`, `_top.html`, `_top.tsx`, `_vite.dev.mjs`, `_vite.build.mjs`. The harness mounts the real `WorldHost` without the cabinet (`npx vite --config src/worlds/concept-brand/_vite.dev.mjs --port 5217 --strictPort --host 127.0.0.1`, open `/src/worlds/concept-brand/_harness.html#/work/concept-brand`).
* The 24 hotspot rects are copied into `data.ts`; if `board-hotspots.json` changes, update `HOTS`.
* Chrome note (not mine): `html.pm-cursor-on * { cursor: none !important }` means every toggle of that class (the first pointer move of a session) restyles the whole document; on the full page (about 4200 elements) a single style recalculation of 80 to 230 ms shows up in the trace of the first click inside a world. Setting the class before first paint, or inheriting `cursor: none` from `html` without the universal selector, would remove that one-off hitch in every world.
