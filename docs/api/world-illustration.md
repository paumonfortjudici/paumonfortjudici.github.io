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
| `Cast.tsx`, `Lightbox.tsx`, `Title.tsx`, `icons.tsx`, `save.ts` | The nine label strips (number, caption, a one-line role, the accent hex; out of the Tab order, every sticker is already a tab stop), the Details lightbox, the die-cut lettering of the title, hand-drawn icons, "Save my laptop" (canvas to PNG). |
| `illustration.css`, `stickers.css`, `controls.css`, `cast.css` | All styles, classes `w-illustration-*`. The world's own palette (the nine accents, vinyl white, aluminium, brass) is defined as variables at the top of `illustration.css`. |

The sheet is built live in the DOM from the nine stickers (the baked `sheet.webp` is only a visual reference and is not loaded; `sheet-layout.json` is not read either, the same numbers sit in `data.ts`).

## Behaviour

* **Peel**: pointer down on a sticker, move more than 5 px (9 px on touch): it lifts (a spring `lift`: it rises 10 px, grows 6.5 %, twists 1.6 to 3.2 degrees, a soft shadow grows), a sticker from the sheet also grows to the lid's size, sideways motion swings it, and the corner nearest the pointer peels up (the lifted triangle is clipped off and reflected across the fold line as the white back of the vinyl). Its die-cut ghost, with its number and caption, stays on the sheet. Pointer capture and window listeners; the page behind never sees the drag.
* **Throw**: velocity from the last 80 ms of pointer samples; above 240 px/s it glides (air drag, then dry friction once it comes down below 300 px/s, so it skids to a firm stop), bounces off the lid's play area (restitution 0.46) and sticks flat where it stops. The lift spring is underdamped, so landing is the **slap** (scale 1.065 to 1, the shadow shrinks, a small undershoot). Slower releases just drop.
* **Where it ends**: centre over the lid, stuck on the lid; over the sheet, snaps into its own ghost; over the desk, back where it came from (nearest legal spot on the lid, or its ghost). Stickers stay inside the lid, can overlap, the last one touched is on top (also on pointer down).
* **Turn / resize**: double-click or double-tap +20 degrees (Shift -20) with an overshooting spring; `R` / `Shift+R` (15 degrees); two tape buttons on the corners of the selected sticker; `Alt` + wheel (0.55 to 1.9); `+` / `-` and size buttons in the tag. On the sheet a double-click peels the sticker onto the lid.
* **Caption tag**: a click opens a paper tag hung from the sticker with its caption (Cherry Bomb One), number, size buttons, "Details" and "Back to sheet" / "Stick on lid". A tag on the lid never covers the title, the Save tab or the control row. It hangs below or above the sticker when that hides next to nothing; otherwise `bestTagSpot()` scans the lid, the hinge strip under it and the sheet beside it (wide screens; on a phone only the lid) for the spot that hides the fewest other stickers, never lies on the tape buttons and stays near its sticker (`data-tag` below / above / free, `placeTag()` in `board.ts`). The tag is 300 px wide (262 px for the keyboard caption). Keyboard focus only shows the caption and the key hints (no extra tab stops). A click that does not come from our own pointer handling (a screen reader's "activate", a script) opens the full tag, so everything the drag does has a plain button.
* **Details lightbox**: the full image on a field of the sticker's own accent colour, its alt text, the accent swatch (click copies the hex, announced), previous / next (also `ArrowLeft` / `ArrowRight`), Close. Focus trap, `useWorldEscape`, focus returns to the opener, the board behind is `inert`.
* **Gravity** (the lever; `role="switch"`): the lid tips -3.6 degrees and every sticker on it falls, bounces, tumbles and piles up (compound matter-js bodies from the vinyl outline); drag is off while it is on (a click still opens the tag); off lets you pick them up again. The pile always falls asleep (about 2 to 7 s); then no `requestAnimationFrame` runs.
* **Peel all** (every sticker still on the sheet flies to the lid, one after the other, into a best-candidate scatter), **Reset** (everything flies back into its ghost), **Arrange** (all nine in a two-row composition with a rhythm of tilts). They turn Gravity off first and are disabled while matter-js loads.
* **Concept label**: a CONCEPT stamp stands on the lid's top edge (`Lid` prop `badge`) and the hinge strip under the lid prints "Concept: invented characters" outside the stickers' play area. The shared custom cursor's "Drag" / "Flip" / "Open" discs are not used in this world (they covered the art and the Gravity label); the ring still grows over every control.
* **Entrance**: when the world opens the four stickers on the lid slap down one after another (not under reduced motion).
* **Keyboard**: every sticker is a `<button>` in the tab order. `Space` / `Enter` picks it up (announced in the live region), arrows move it 12 px (Shift 48), `Space` / `Enter` sticks it down, `R` / `Shift+R` turn, `+` `-` resize, `D` details, `L` / `B` send it to the lid / back to the sheet, `Esc` puts a held sticker back, then closes an open tag, and only then the shell closes the world. Blur sticks a keyboard-held sticker down.
* **Touch**: `touch-action: pan-y` on the stickers, so a swipe that starts on a sticker scrolls the page. A finger peels only after a 250 ms hold (the sticker lifts and a corner curls: the cue; a short vibration where supported; from then on a non-passive `touchmove` listener blocks the scroll) or a clearly sideways drag. Mouse and pen peel on pointer down, as before. A tap selects, a double-tap turns. Dragging near the top or bottom edge auto-scrolls.
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

"One outline weight, one halo, one flat colour each. I art-directed all nine so they read as one set. They are invented characters, not clients or real people." plus the CONCEPT stamp (the word "Concept" only) and `CONCEPT_LINE` (WorldFacts). The world never says how the art was made (no "AI-assisted" anywhere) and never says "hand-drawn by me".

## Performance

World chunk 32 KB gzip JS + 6 KB gzip CSS (budget 120 KB). matter-js (27 KB gzip) is its own chunk, fetched the first time Gravity is switched on; `index-*.js` (main) does not contain it. Images: the stickers use `srcset` (300 px thumb at 1x, 1200 px full at 2x), the lightbox loads the 1200 px file, the cast strips are `loading="lazy"`; every image has width and height.

## Dev aids

In dev builds only, `window.__illustration` is the `Board`; `__illustration.debugInfo()` returns the poses, modes and, with Gravity on, each body's speed and sleep flag. Used by the browser checks below; it is compiled out of production builds.

## Verified (Chrome headless through `tools/shot.mjs`-style scripts, dev server and `vite build` + `vite preview`)

* 1440x900, 1920x1080, 1280x720, 1024x768, 768x1024, 390x844 (touch, 2x): no horizontal scroll (scrollWidth = clientWidth at 768 and 390), console clean, no failed requests.
* Peel (corner curl), throw (drag with intermediate moves), stick, slap, ghost with label, snap back into the ghost, rotate (double-click, `R`), resize (Alt+wheel, `+`/`-`), tag, lightbox (focus trap, Esc closes only the lightbox, focus returns), Gravity on / off, Peel all, Reset, Arrange, Save (PNG downloads), opening from the Works card, `[` `]` hopping, Esc closing.
* Keyboard path: Tab, Space, arrows, Shift+arrows, `R`, `L`, `B`, `D`, Esc; live-region messages checked.
* Touch at 390x844: the lid is 4:3 on a phone (nine stickers fit; Peel all checked), lid above the sheet, a sticker dragged from the sheet to the lid, vertical scrolling from empty spots and from a sticker's transparent corner, double-tap turns, tap opens the tag; every target at least 44 px.
* Reduced motion and "Pause motion": no glide, no flights, Gravity jumps to the pile, no `requestAnimationFrame` while idle.
* Idle: no `requestAnimationFrame` after a throw, a drop, Arrange, Reset or Gravity (the physics sleeps).
* Stress: 250 random operations (drags, throws, double-clicks, keys, Alt+wheel, lightbox, Gravity, Peel all, Reset, Arrange) on desktop and a touch run on a phone viewport: no errors, nothing stuck in `held` or `glide`, every pose finite, stickers inside the lid.
* `npx tsc -b`: clean for these files. matter-js absent from the main chunk (grep of the built `index-*.js`).

## Final mop-up round

* Title: one visually hidden "Sticker sheet" is the h2's text; the die-cut letters are painted by CSS (`::after` with `attr(data-c)`).
  The letters are painted in three identical stacked layers (`Title.tsx`, `.w-illustration-tl[data-layer]`): ONE white halo under the whole word (with the hard shadow on the union), then the ink keylines, then the flat accent fills. Painting per layer, not per letter, keeps every letter whole where two touch: the old per-letter halo (a 0.36em white stroke) was painted over the letter before it and over the first word's lower edge, so the letters looked overlapped. The CONCEPT stamp is just "Concept" and sits clear of the halo (head `margin-bottom` 46 px).
* Lightbox: closing it puts the focus back on the sticker that was being viewed (the inert flag is cleared first); a lightbox opened from a cast strip returns to that strip.
* At 1700 px and wider (and 860 px tall) the head carries a recap strip (Peel it off, Throw it, Stick it down; decorative, `aria-hidden`) beside the lede.
* On phones (560 px and narrower) the cast is one swipeable shelf (scroll-snap, next strip peeks in, keyboard-focusable), without the hex.
* Not tested: real iOS Safari touch (only Chrome with CDP touch events: swipe scroll, 250 ms hold and drag, tap, sideways drag).


## How to replace the nine stickers

The art is swappable without touching React. The world draws the white vinyl margin, the shadow, the die-cut ghost on the sheet, the hit area and the physics shape itself, all from the **alpha channel** of each image, so the new art only has to be a transparent cut-out.

**1. Files (exact names, in `public/works/illustration/art/`)**

| File | Size | Used for |
|---|---|---|
| `sticker-01.webp` ... `sticker-09.webp` | **1200 x 1600 px**, RGBA, transparent background, WebP (quality about 88 is fine; about 150 to 220 KB each) | the sticker on the lid and the sheet, the Details lightbox (`1200w`), the PNG export |
| `thumb-01.webp` ... `thumb-09.webp` | **300 x 400 px**, the same picture scaled down, RGBA WebP | the `1x` source of every sticker, the cast strips |

Draw or generate each character as a **transparent PNG at 1200 x 1600 (3:4 portrait)**, the character filling the canvas but leaving at least **60 px of empty transparent margin on every side** (the vinyl margin of about 31 px is added outside the art, and a sticker touching the canvas edge would get it cut off). **No white die-cut border in the art**: the world adds it (white, one weight for all nine). Do put a clean, solid, closed outline round the character (the current set uses a flat accent colour as its outermost edge) and nothing else round it: no specks, glow, drop shadow or semi-transparent haze, because stray pixels become part of the outline. Holes (between an arm and the body) are fine, narrow gaps are filled by the world on purpose. Keep the nine on one visual weight (same outline thickness, same flat-colour style) so they read as a set.

Convert the PNGs to the two WebP sizes (any tool; with Pillow from the project's venv, run from the repo root, `new-art/` being wherever the PNGs are):

```
<venv python> -I -X utf8 -c "
from PIL import Image
for n in range(1, 10):
    im = Image.open('new-art/sticker-%02d.png' % n).convert('RGBA')
    assert im.size == (1200, 1600), im.size
    im.save('public/works/illustration/art/sticker-%02d.webp' % n, quality=88, method=6)
    im.resize((300, 400), Image.LANCZOS).save('public/works/illustration/art/thumb-%02d.webp' % n, quality=86, method=6)
"
```

with `<venv python>` = `C:/Users/User/AppData/Local/Temp/claude/C--Users-User-Documents-Portofolio/0908f779-4789-499a-9f74-ecb97a4d3b2d/scratchpad/venv/Scripts/python.exe` (needs Pillow; any Python with numpy + Pillow works).

**2. Regenerate the silhouettes (always, after any image changed)**

From the repo root:

```
C:/Users/User/AppData/Local/Temp/claude/C--Users-User-Documents-Portofolio/0908f779-4789-499a-9f74-ecb97a4d3b2d/scratchpad/venv/Scripts/python.exe -I -X utf8 src/worlds/illustration/tools/build-shapes.py
```

(numpy and Pillow only, about 20 s; on another machine simply `python -I -X utf8 src/worlds/illustration/tools/build-shapes.py`.) It reads `sticker-0N.webp` and rewrites `src/worlds/illustration/shapes.generated.ts` (outline `d`, collision `parts`, `com`, `lab`, `box`). Set `STICKER_DEBUG=<folder>` to also get overlay PNGs of the outline and the convex pieces and look at them: the outline should hug the character with an even margin and no stray islands. Then `npx tsc -b` and look at the world (peel, throw, Gravity).

**3. Where the words, colours and layout live**

* `src/worlds/illustration/data.ts`, `STICKERS`: per sticker `caption` (the tag, the ghost on the sheet, the cast strip), `accent` (one of `lilac, tangerine, sky, mint, butter, tomato, pink, teal, lime`), `hex` (the swatch in the lightbox and the cast strip, copied to the clipboard on click) and `alt` (the description for screen readers and the lightbox). The accent colour variables are `--wi-lilac` ... `--wi-lime` at the top of `illustration.css` (the lightbox field, the die-cut title letters and the tape buttons use them): if a character's colour changes, change `hex` here and the matching variable there.
* `Cast.tsx`, `ROLE`: the one-line role under each caption in the cast strips.
* `SLOTS` (where each ghost sits on the sheet), `INITIAL_LID` (the four on the lid at the start) and `ARRANGE` (the Arrange composition), all in `data.ts`, go by sticker number, so they keep working when the nine characters are replaced one for one. If a new sticker looks much bigger or smaller than its neighbours, adjust its `mult` in `SLOTS` and its `k` in `INITIAL_LID` / `ARRANGE`.
* `public/works/illustration/art/manifest.json` mirrors the same text for humans (the code does not read it): update it too.
* Not in this folder, also showing the old art: the Works card images `public/works/illustration/thumb.webp` (720 x 900) and `peek.webp` (430 x 632, transparent), and the baked reference `art/sheet.webp` (not loaded by the world). Re-export the card images from the new art.

**4. The nine characters: the brief for new art**

Common recipe: one sticker = one invented character, full body, in a dynamic pose that fills a 3:4 portrait; a clean bold black ink outline of one weight, flat fills in the character's accent plus black and cream, a little pattern texture, cheerful and quirky, no text in the picture, and one clear silhouette (tilted X, tower, S-curve...) so the nine read apart on a laptop lid.

| # | Caption | Accent | The character |
|---|---|---|---|
| 1 | Boombox ollie | lilac `#C6B1FE` | A skater in a black beanie and baggy plaid trousers pops an ollie (board tilted in the air), a boombox on one shoulder, a rock-on hand up. Equalizer bars on the sweater. |
| 2 | Just one more chapter | tangerine `#FFA65F` | A cosy reader in round glasses and a cable-knit sweater sits cross-legged on a tower of books, holding a hardback while a sleeping black cat curls up on their lap. |
| 3 | Coffee first, pixels later | sky `#85CEF9` | A curly-haired designer in dungarees hugs a paper coffee cup as tall as themselves, cheek on the lid, a drawing tablet showing a bezier curve leaning at their feet. |
| 4 | Small me, big plant | mint `#8EEBC3` | A small gardener in a polka-dot bandana and rubber boots staggers along carrying a big pot with a monstera three times their height, a snail riding one leaf. |
| 5 | Quiet on set! | butter `#FCE67A` | A film director in a beret and sunglasses, striped scarf flying, steps up onto an apple crate and shouts through a megaphone while holding a clapperboard aloft. |
| 6 | Case of the missing sock | tomato `#FE7D6C` | A trench-coated detective in a fedora creeps forward, one eye hugely magnified by an oversized magnifying glass, pinching a single striped sock as evidence. |
| 7 | Tuft happens | pink `#FF9FC5` | A rug maker in goggles and dungarees kneels at a wooden frame, tongue out in concentration, punching yarn into a half-finished mushroom rug with a chunky tufting gun. |
| 8 | Houston, we have bananas | teal `#66CBC7` | A monkey in a puffy spacesuit floats weightless, grinning inside the helmet and holding up a banana, its long tail ending in a tiny glove, a ringed planet nearby. |
| 9 | Headphones on, world off | lime `#C5EB7C` | A dancer in headphones and an oversized track jacket laughs with eyes shut, ponytail whipping, balancing on one toe with the other leg kicked high. |

The cast-strip roles (`ROLE` in `Cast.tsx`): 1 Skater with a boombox, mid-ollie; 2 Reader on a book tower, with cat; 3 Designer hugging a giant coffee; 4 Gardener under a monstera; 5 Director on an apple crate; 6 Detective holding one sock; 7 Rug tufter at the frame; 8 Astronaut monkey, one banana; 9 Headphone dancer, high kick.

## The nine stickers redrawn in the lilac selfie-sticker style (owner request, 2026-10-29)

Same nine characters, poses, props, captions, accents and layout; new art in the style of Pau's reference (one accent colour plus solid black, a smooth confident ink line, plaid and folds in thin line, solid black hair and shoes, a die-cut halo of the accent colour). Drawn in ChatGPT from the prompts ST-01 .. ST-09 in `docs/image-prompts.md` (IMAGE 1 = the previous sticker for what to draw, IMAGE 2 = the reference for how), 1086 x 1448 on flat cream, filed by **`python tools/ingest_stickers.py <folder>`**:
1. the cream is removed by a **flood fill from the border**, not a colour key (the figures carry cream details of their own: soles, a muzzle, a sock stripe, which stay opaque);
2. the halo colour is read just inside the edge, the edge pixels get alpha from how much halo and cream they mix;
3. every accent-coloured pixel (anything that is more than 18 RGB units from the cream-to-ink line, so a pale washed-out tone counts too) is set to the **exact accent hex** of the sticker keeping the antialiasing against the ink, so skin, clothes and halo are one flat colour (the model had drifted: teal and lime by up to 41 units);
4. a cream pocket enclosed by the figure and bordered only by the halo (between the legs in 01 and 05, a small one in 08) is cut out; pockets bordered by ink are details and stay;
5. the figure is trimmed and fitted into the frame the previous sticker occupied (`FRAME` in the script), so the `mult` / `k` values of `SLOTS`, `INITIAL_LID` and `ARRANGE` still give the same sizes.
Then `build-shapes.py` (outline and collision pieces: the outlines hug the characters with an even margin; 3 to 11 convex parts each) and the card art: `art-src/illustration/sheet/build_card.py` rebuilds `public/works/illustration/thumb.webp` (720 x 900: four stickers piled on the cream paper, each on its white backing with a soft shadow, the pink one with its corner peeling) and `peek.webp` (430 x 632: the detective with a white die-cut border); `build_sheet.py` + `finalize.py` rebuild the baked reference `art/sheet.webp`, `art/thumb.webp`, `manifest.json` and `sheet-layout.json` (the world does not load them). The previous files are in git history.
**Verified** (dev server, headless Chrome): the world at 1440 and 390 wide, the four stickers on the lid, the nine ghosts on the sheet, a drag from the sheet to the lid, Gravity (falls and piles up), 0 console errors or warnings, 0 failed requests; the Works card and the cover peek show the new files; `npx tsc -b` clean; image crawl of every world clean.
