# World 10, "Sticker Sheet" (slug `illustration`): API and behaviour note

Folder lilac `#B79CFF`, ink text. Display face Cherry Bomb One (loaded with the chunk by the shell, `loadWorldFonts('illustration')`), body face Karla.
A sticker sandbox with physics: nine doodle characters on a cream sticker sheet, an aluminium laptop lid beside it (above the sheet on a phone).
Peel them off, throw them, stick them anywhere, turn and resize them, tip the lid with Gravity (matter-js, loaded on demand), arrange them,
save the lid as a PNG. Concept project: the CONCEPT stamp and `CONCEPT_LINE` come from `WorldFacts`.

Entry: `src/worlds/IllustrationWorld.tsx` (default export, renders and wires; reads `useWorld()` for `work`, `scrollRef`, `reduced`).
Everything else lives in `src/worlds/illustration/`. Nothing outside that folder and the entry file was touched.

## Files

| File | What it is |
|---|---|
| `board.ts` | The `Board` class (pure TS, no React): every sticker's pose and mode, pointer + keyboard handling, throw, springs, entrance, Gravity orchestration, `snapshot()` for the PNG export. React renders the stickers once; the board writes `transform`, `opacity`, `clip-path` and a few custom properties straight to the DOM (nothing re-renders while a sticker moves). |
| `physics.ts` | `GravityWorld`: lazy matter-js (`loadMatter()` is a dynamic `import('matter-js')`), one compound body per sticker made of the convex pieces of its vinyl outline, walls round the lid, air drag that grows with the pile's age so every pile falls asleep, a containment clamp so a crowded pile never leaves the lid. |
| `shapes.generated.ts` | GENERATED. Per sticker: `d` (the white vinyl outline as one smooth SVG path), `parts` (convex collision pieces), `com`, `lab` (where the ghost's label goes), `box`. |
| `tools/build-shapes.py` | Regenerates `shapes.generated.ts` from the sticker alpha: `python -I -X utf8 src/worlds/illustration/tools/build-shapes.py` (numpy + Pillow; about 20 s; set `STICKER_DEBUG=<folder>` for overlay PNGs). Re-run it if a sticker image changes. |
| `data.ts` | Captions, accents, hex, alt text (copied from `public/works/illustration/art/manifest.json`), the nine slots on the sheet (canvas centres, rotation, scale from `art-src/illustration/sheet/layout.json`), the initial lid and the Arrange composition. |
| `math.ts` | Hulls, rotated extents, half-plane clipping and the peeling-corner geometry (`foldFor`). |
| `StickerView.tsx` | One sticker: vinyl margin (SVG), the art, two shadows, the peeling flap, the caption tag (full, with tape buttons) or the keyboard caption. |
| `Surfaces.tsx` | `Lid` (brushed aluminium in CSS, hinge, engraved line; slots `tabs` and `footer`) and `Sheet` (cream paper, nine die-cut ghosts with number and caption, curled corner). |
| `Controls.tsx` | Tab buttons Peel all / Arrange / Reset, the Gravity lever (a strip of tape with a stick that flips), `SaveTab`. |
| `Cast.tsx`, `Lightbox.tsx`, `Title.tsx`, `icons.tsx`, `save.ts` | The nine label strips, the Details lightbox, the die-cut lettering of the title, hand-drawn icons, "Save my laptop" (canvas to PNG). |
| `illustration.css`, `stickers.css`, `controls.css`, `cast.css` | All styles, classes `w-illustration-*`. The world's own palette (the nine accents, vinyl white, aluminium, brass) is defined as variables at the top of `illustration.css`. |

The sheet is built live in the DOM from the nine stickers (the baked `sheet.webp` is only a visual reference and is not loaded; `sheet-layout.json` is not read either, the same numbers sit in `data.ts`).

## Behaviour

* **Peel**: pointer down on a sticker, move more than 5 px (9 px on touch): it lifts (a spring `lift`: it rises 10 px, grows 6.5 %, twists 1.6 to 3.2 degrees, a soft shadow grows), a sticker from the sheet also grows to the lid's size, sideways motion swings it, and the corner nearest the pointer peels up (the lifted triangle is clipped off and reflected across the fold line as the white back of the vinyl). Its die-cut ghost, with its number and caption, stays on the sheet. Pointer capture and window listeners; the page behind never sees the drag.
* **Throw**: velocity from the last 80 ms of pointer samples; above 240 px/s it glides (air drag, then dry friction once it comes down below 300 px/s, so it skids to a firm stop), bounces off the lid's play area (restitution 0.46) and sticks flat where it stops. The lift spring is underdamped, so landing is the **slap** (scale 1.065 to 1, the shadow shrinks, a small undershoot). Slower releases just drop.
* **Where it ends**: centre over the lid, stuck on the lid; over the sheet, snaps into its own ghost; over the desk, back where it came from (nearest legal spot on the lid, or its ghost). Stickers stay inside the lid, can overlap, the last one touched is on top (also on pointer down).
* **Turn / resize**: double-click or double-tap +20 degrees (Shift -20) with an overshooting spring; `R` / `Shift+R` (15 degrees); two tape buttons on the corners of the selected sticker; `Alt` + wheel (0.55 to 1.9); `+` / `-` and size buttons in the tag. On the sheet a double-click peels the sticker onto the lid.
* **Caption tag**: a click opens a paper tag hung from the sticker with its caption (Cherry Bomb One), number, size buttons, "Details" and "Back to sheet" / "Stick on lid". It hangs above the sticker when there is no room below. Keyboard focus only shows the caption and the key hints (no extra tab stops). A click that does not come from our own pointer handling (a screen reader's "activate", a script) opens the full tag, so everything the drag does has a plain button.
* **Details lightbox**: the full image on a field of the sticker's own accent colour, its alt text, the accent swatch (click copies the hex, announced), previous / next (also `ArrowLeft` / `ArrowRight`), Close. Focus trap, `useWorldEscape`, focus returns to the opener, the board behind is `inert`.
* **Gravity** (the lever; `role="switch"`): the lid tips -3.6 degrees and every sticker on it falls, bounces, tumbles and piles up (compound matter-js bodies from the vinyl outline); drag is off while it is on (a click still opens the tag); off lets you pick them up again. The pile always falls asleep (about 2 to 7 s); then no `requestAnimationFrame` runs.
* **Peel all** (every sticker still on the sheet flies to the lid, one after the other, into a best-candidate scatter), **Reset** (everything flies back into its ghost), **Arrange** (all nine in a two-row composition with a rhythm of tilts). They turn Gravity off first and are disabled while matter-js loads.
* **Entrance**: when the world opens the four stickers on the lid slap down one after another (not under reduced motion).
* **Keyboard**: every sticker is a `<button>` in the tab order. `Space` / `Enter` picks it up (announced in the live region), arrows move it 12 px (Shift 48), `Space` / `Enter` sticks it down, `R` / `Shift+R` turn, `+` `-` resize, `D` details, `L` / `B` send it to the lid / back to the sheet, `Esc` puts a held sticker back, then closes an open tag, and only then the shell closes the world. Blur sticks a keyboard-held sticker down.
* **Touch**: `touch-action: none` only on the vinyl silhouettes (the hit shape is the outline, so a drag that starts in a sticker's empty corner scrolls the page). Dragging near the top or bottom edge auto-scrolls.
* **Focus ring vs pointer**: a pointer press moves focus to the sticker (so `R`, `+`, `-`, `D` work straight after a click) but never draws the two-tone ring or the keyboard caption; the board tracks the input modality (`stage[data-input]`, set by a capture-phase `keydown` listener and by pointer presses). Tab onto a sticker after a mouse session shows both again.
* **Reduced / paused motion** (`useWorld().reduced`): no entrance, no glide (a throw just drops), no flights (Peel all, Arrange, Reset jump), no curl, no tilt, Gravity runs the physics to rest at once and the stickers jump to the pile. No loop runs while idle in either mode.
* **Save my laptop**: renders the lid look and the stickers to a canvas (about 1500 px of laptop on the field's lilac grid) and downloads `my-sticker-laptop.png` through a temporary link. Nothing leaves the browser.

## Tuning knobs

`board.ts`: `THROW_MIN`, `GLIDE_K`, `GLIDE_C`, `LAND_SPEED`, `RESTITUTION`, `MIN_SC` / `MAX_SC`, `TILT_GRAVITY`, `KB_STEP`, `FOLD_DEPTH`, `lidScale()`. `physics.ts`: `GRAVITY`, `AIR_*`, `GIVE_UP_AFTER` and the body options (friction, restitution, density). `data.ts`: `INITIAL_LID`, `ARRANGE`, `SLOTS`.

## Known limits

* Only Chromium was available for testing: Firefox, Safari and iOS Safari are untested. `touch-action: none` on an SVG path (the hit shape) is the one thing I would check first on iOS. The CSS relies on `color-mix`, container query units (`cqw`), `@property` (already used by the shell) and `text-wrap`.
* The collision shapes are convex pieces of a closed outline (narrow gaps between limbs are filled), so in a pile stickers rest on slightly "fatter" bodies than they look. If a sticker image changes, re-run `tools/build-shapes.py`.
* The arrangement is not remembered: closing the world and opening it again starts from the four stickers on the lid.
* The PNG export redraws the lid in a canvas (a close but not pixel-identical copy of the CSS aluminium).

## Honest copy

"One outline weight, one halo, one flat colour each. I art-directed all nine so they read as one set. They are invented characters made with AI-assisted tools, not clients or real people." plus the CONCEPT stamp and `CONCEPT_LINE` (WorldFacts). Never "hand-drawn by me".

## Performance

World chunk 32 KB gzip JS + 6 KB gzip CSS (budget 120 KB). matter-js (27 KB gzip) is its own chunk, fetched the first time Gravity is switched on; `index-*.js` (main) does not contain it. Images: the stickers use `srcset` (300 px thumb at 1x, 1200 px full at 2x), the lightbox loads the 1200 px file, the cast strips are `loading="lazy"`; every image has width and height.

## Dev aids

In dev builds only, `window.__illustration` is the `Board`; `__illustration.debugInfo()` returns the poses, modes and, with Gravity on, each body's speed and sleep flag. Used by the browser checks below; it is compiled out of production builds.

## Verified (Chrome headless through `tools/shot.mjs`-style scripts, dev server and `vite build` + `vite preview`)

* 1440x900, 1920x1080, 1280x720, 1024x768, 768x1024, 390x844 (touch, 2x): no horizontal scroll (scrollWidth = clientWidth at 768 and 390), console clean, no failed requests.
* Peel (corner curl), throw (drag with intermediate moves), stick, slap, ghost with label, snap back into the ghost, rotate (double-click, `R`), resize (Alt+wheel, `+`/`-`), tag, lightbox (focus trap, Esc closes only the lightbox, focus returns), Gravity on / off, Peel all, Reset, Arrange, Save (PNG downloads), opening from the Works card, `[` `]` hopping, Esc closing.
* Keyboard path: Tab, Space, arrows, Shift+arrows, `R`, `L`, `B`, `D`, Esc; live-region messages checked.
* Touch at 390x844: lid above the sheet, a sticker dragged from the sheet to the lid, vertical scrolling from empty spots and from a sticker's transparent corner, double-tap turns, tap opens the tag; every target at least 44 px.
* Reduced motion and "Pause motion": no glide, no flights, Gravity jumps to the pile, no `requestAnimationFrame` while idle.
* Idle: no `requestAnimationFrame` after a throw, a drop, Arrange, Reset or Gravity (the physics sleeps).
* Stress: 250 random operations (drags, throws, double-clicks, keys, Alt+wheel, lightbox, Gravity, Peel all, Reset, Arrange) on desktop and a touch run on a phone viewport: no errors, nothing stuck in `held` or `glide`, every pose finite, stickers inside the lid.
* `npx tsc -b`: clean for these files. matter-js absent from the main chunk (grep of the built `index-*.js`).
