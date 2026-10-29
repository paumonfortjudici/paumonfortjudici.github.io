# Image prompts for ChatGPT (and how the images come back)

Version 3 (2026-10-29). Pau threw away the first set (flat colour, riso look), then the second (five different references, too complex). He works **one category at a time**. The Catalog (CAT) is defined: ten pencil sketches that all copy ONE style master, the CAT-02 sketch he liked. PF, ST and PR are open: they get their prompts when Pau gives the direction for each.

## The system

Every image has an ID: `AREA-NN`. Use the ID as the file name when you save the result, in `C:\Users\User\Documents\Portofolio\_inbox\` (git ignores that folder). If you make several versions add a letter: `CAT-04b.png`.

| Area | IDs | What it replaces | Status |
|---|---|---|---|
| `CAT` | CAT-01 .. CAT-10 | the grey sketch next to each name in the Catalog | **defined below (v3, one style master)**; CAT-02 is already in `_inbox` |
| `PF` | PF-01 .. PF-05 | the five slides of folder 09 (A Portfolio for a Client) | waiting for Pau's direction |
| `ST` | ST-01 .. ST-09 | the nine stickers of folder 10 (Sticker Sheet) | waiting for Pau's direction |
| `PR` | PR-01 .. PR-04 | the four big scenes of the Process film (section 05) | waiting for Pau's direction |

References, in `_inbox/refs/`:

| File | What it is | Used for |
|---|---|---|
| `STYLE-MASTER.png` | the web-designer pencil sketch Pau liked (1536x1024) | **every CAT prompt** |
| `REF-1_chair-colour.jpg` | flat marker figure, orange + blue | colour categories later |
| `REF-2_crayon-laptop.jpg`, `REF-3_ink-hat-tie.jpg`, `REF-4_ink-bicycle.jpg`, `REF-5_pen-trumpet.jpg` | Pau's original Pinterest references | kept for the other categories; no longer used for CAT |

## CAT: the ten Catalog sketches (soft pencil, one style master)

### How the picture is used on the site

- It sits **directly on the band colour**, right-aligned, in a box up to 38rem wide and 12rem (192 px) tall, `object-fit: contain`. It is hidden on phones (max-width 760px).
- Band colours: 01 tomato `#FF4B2B`, 02 pine `#1F5C46` (dark), 03 marigold `#FFB81C`, 04 oxblood `#8A1B3D` (dark), 05 ultraviolet `#5B3DF5` (dark), 06 bubblegum `#FF8FC1`, 07 lagoon `#0F9AA8`, 08 olive `#86A22F`, 09 butter `#FBE79A`, 10 lilac `#B79CFF`.
- ChatGPT draws dark pencil on white, 1536x1024. At filing time I trim to the drawing, turn white into transparent (luminance to alpha), **thicken the line a little** so it holds at 190 px tall, and tint the pencil per band: graphite `#2E2E2E` on the seven light bands, pale chalk grey `#E6E1D6` on the three dark ones (02, 04, 05). Result: `public/works/<slug>/catalog-sketch.webp`, then the slug is added to `CATALOG_SKETCH` (`catalog/sketches.ts`).

### The recipe (what the style master does, and every prompt repeats)

One soft dark pencil, line about 4 to 5 px on 1536x1024, fewest lines that make an object recognisable. Three tones only (soft light-grey diagonal hatching, one dense scribbled dark mass for hair or hat, one small dark shadow patch). One thick soft grey squiggle as the single loud mark. Layout: the same person at left (messy bun, round glasses, loose sweater, three-quarters from behind, face in profile), the object of the scene at right in simple perspective, one long horizontal line under both. Pure white background, no text.

### Chat opening message (new chat, paste first, attach `STYLE-MASTER.png`)

```text
The attached image is the STYLE MASTER. Over this chat we will make TEN more sketches for the folders of a portfolio website, and all ten must look as if the same hand drew them on the same day with the same pencil as this one. Do not draw anything yet. Study the image, reply "ready" and describe its style back to me in five lines.

WHAT THE STYLE MASTER IS (copy all of it exactly):
- MEDIUM: one soft dark pencil, black to graphite grey, slightly waxy, with visible grain. Nothing else: no colour, no ink, no digital look.
- LINE: one confident line per contour, about 4 to 5 px thick on a 1536x1024 canvas, with a few doubled "searching" strokes and small overshoots at the corners. Straight edges are hand-drawn: nearly straight, never ruler-perfect. Quick and simple, not fussy: every object is built from the fewest lines that make it recognisable.
- TONE: only three kinds. (1) Soft parallel diagonal hatching in light grey, about 45 degrees, on one big area of clothing and on one shape of the object. (2) One dense scribbled dark mass for the hair or a hat. (3) One small solid dark patch for a shadow. Everything else stays blank white.
- ONE BOLD SQUIGGLE: every sketch has one thick, soft, grey wavy line pressed hard, like the steam in the style master. It is the single loud mark of the drawing.
- LAYOUT: wide. At left the same person, seen three-quarters from behind with the face in profile. At right the object of the scene, drawn in simple perspective like the monitor in the style master. One long horizontal line (desk, counter or floor) runs under both. Generous white margin: the drawing fills about 80% of the width and 60% of the height.
- THE PERSON, always the same: hair in a messy bun made of one dark scribble (or a hat when I say so), round glasses, a loose sweater with rolled sleeves, the face reduced to a profile line with a small nose and the glasses, tiny simple hands.
- BACKGROUND: flat pure white. No paper texture, no frame, no shadow on the ground, no signature. NO TEXT of any kind: no letters, no numbers (text is drawn as rows of wavy line).
- FORBIDDEN: colour, gradients, digital brush, vector look, 3D, perfect symmetry, realism, extra details, extra objects.

With every request I will attach the style master again. Copy only its style, never its scene: the web designer is already done.
```

### The ten prompts (one message each, attach `STYLE-MASTER.png` to each)

**CAT-01 Proyecto Contract (trade magazines)**

```text
Attach STYLE-MASTER.png. Same style as the attached image (copy the style, not its scene).

SCENE: The person sits at left at a long table, leaning forward, one hand holding a stubby pencil above an open magazine spread lying on the table at right, drawn in simple perspective like the monitor in the master (a wide trapezoid with a centre fold). Left page: a big photo box with a diagonal cross and one short caption bar. Right page: two thick headline bars and three columns of wavy lines.
BOLD SQUIGGLE: a loose thick loop drawn round the headline, as if marked while editing.
TONE only on: the back of the sweater, the lower half of the photo box, the shadow under the edge of the spread; the hair as the dark scribble.
Keep it simple: nothing beyond what is listed. Landscape 1536x1024, pure white background, pencil only, no text.
```

**CAT-02 Plana Digital (brand and website). Already done: this is the prompt that matches the style master; use it only for variations.**

```text
Attach STYLE-MASTER.png. Same style as the attached image.

SCENE: The person sits at left on a plain chair, one arm stretched to a mouse, a tall mug beside the hand. At right a large desktop monitor on a short stand, slightly angled, its screen showing a website wireframe: a thin bar with three dots, a big hero rectangle with a half sun and four short rays inside it, two small boxes under it, a mouse-cursor arrow on a corner of the screen.
BOLD SQUIGGLE: the steam rising from the mug.
TONE only on: the back of the sweater, the hero rectangle, the shadow under the monitor stand; the hair as the dark scribble.
Keep it simple: nothing beyond what is listed. Landscape 1536x1024, pure white background, pencil only, no text.
```

**CAT-03 44 Lab (custom rugs)**

```text
Attach STYLE-MASTER.png. Same style as the attached image (copy the style, not its scene).

SCENE: The person stands at left, three-quarters from behind, wearing a knitted beanie in place of the bun, pressing a chunky tufting gun (boxy body, a grip, a pointed nose) against a rug at right stretched in a tall wooden frame, drawn in simple perspective. The rug shows one bold pattern of three nested diamonds and short fuzzy ticks along its edges. A tiny devil with two horns and a thin tail sits on the top bar of the frame, drawn in six strokes. One floor line under everything.
BOLD SQUIGGLE: the gun's power cable falling from the gun in one big loose loop to the floor.
TONE only on: the back of the sweater, the outer diamond ring of the rug (hatching), the beanie as the dark scribble.
Keep it simple: nothing beyond what is listed. Landscape 1536x1024, pure white background, pencil only, no text.
```

**CAT-04 Spelled Guilty (noir word-search book)**

```text
Attach STYLE-MASTER.png. Same style as the attached image (copy the style, not its scene).

SCENE: The person sits at left at a desk, wearing a fedora in place of the bun and a trench coat with the collar turned up, leaning over a big open puzzle book at right, drawn in simple perspective (a wide trapezoid with a centre fold). Its right page shows a 5-by-5 grid of small squares filled with tiny scribbles instead of letters, and one long pill-shaped loop round a row. A thick-rimmed magnifying glass lies on the left page.
BOLD SQUIGGLE: one big loose question mark floating above the book.
TONE only on: the hat band of the fedora as the dense dark scribble, the back of the coat (hatching), the shadow under the book.
Keep it simple: nothing beyond what is listed. Landscape 1536x1024, pure white background, pencil only, no text.
```

**CAT-05 Space Monkey (escape room)**

```text
Attach STYLE-MASTER.png. Same style as the attached image (copy the style, not its scene).

SCENE: The person stands at left, three-quarters from behind, holding up a big old-fashioned key (round bow, long shaft, three teeth) towards the right. At right, standing on a table, a big astronaut helmet seen from the front: a round glass dome with a cheerful monkey face inside (two round ears poking out at the sides, two dot eyes, a wide grin), a ribbed collar ring below it. A small ringed planet (a circle with one tilted ellipse) floats above the helmet.
BOLD SQUIGGLE: a thick coiled hose leaving the helmet's collar and looping down to the table.
TONE only on: the back of the sweater, a few diagonal strokes of reflection on the glass dome, the lower half of the planet; the hair as the dark scribble.
Keep it simple: nothing beyond what is listed. Landscape 1536x1024, pure white background, pencil only, no text.
```

**CAT-06 Procreate Sketchbook (early drawings)**

```text
Attach STYLE-MASTER.png. Same style as the attached image (copy the style, not its scene).

SCENE: The person sits at left at a desk, a slim stylus in hand with its tip touching a drawing tablet at right (a thick rounded rectangle on a short stand, drawn in simple perspective like the monitor in the master). On the tablet screen a loose half-finished profile portrait: only the hair, one eye and the nose line. Beside the tablet on the desk lies a small sheet of paper with a shield crest and a five-point star doodled on it.
BOLD SQUIGGLE: the stylus line leaving the screen and continuing into the air as one thick loose spiral.
TONE only on: the back of the sweater, the hair of the portrait (dense hatching), the shadow under the tablet; the person's hair as the dark scribble.
Keep it simple: nothing beyond what is listed. Landscape 1536x1024, pure white background, pencil only, no text.
```

**CAT-07 Somia (sustainable fashion store)**

```text
Attach STYLE-MASTER.png. Same style as the attached image (copy the style, not its scene).

SCENE: The person stands at left, three-quarters from behind, holding up a wide-sleeved blouse on a hanger at arm's length; a small empty paper price tag hangs from the hanger on a string. At right a clothes rail (one horizontal bar on two thin legs) with three garments hanging from it: a long coat, a blouse with wide sleeves, trousers folded over a hanger. A small potted plant with four leaves stands at the foot of the rail. One floor line under everything.
BOLD SQUIGGLE: a tailor's measuring tape around the person's neck, hanging down in one thick wavy band.
TONE only on: the back of the sweater, the long coat (hatching along its fall), the shadow under the rail; the hair as the dark scribble.
Keep it simple: nothing beyond what is listed. Landscape 1536x1024, pure white background, pencil only, no text.
```

**CAT-08 Gotet (vermouth bar)**

```text
Attach STYLE-MASTER.png. Same style as the attached image (copy the style, not its scene).

SCENE: The person stands at left behind a bar counter, in profile, wearing a long apron over the sweater, one hand on the lever of a tall soda siphon standing on the counter at right (lever head, spout, a few stripes). Under the spout a stemmed glass with two ice cubes and an olive on a toothpick; next to it a squat bottle with an empty label shape. The counter is one long horizontal line with a thickness edge.
BOLD SQUIGGLE: one thick wavy spray falling from the siphon's spout into the glass.
TONE only on: the back of the apron, the liquid in the glass (short diagonal hatching), the shadow under the siphon and the bottle; the hair as the dark scribble.
Keep it simple: nothing beyond what is listed. Landscape 1536x1024, pure white background, pencil only, no text.
```

**CAT-09 A Portfolio for a Client (foley artist)**

```text
Attach STYLE-MASTER.png. Same style as the attached image (copy the style, not its scene).

SCENE: The person stands at left, three-quarters from behind, headphones hanging round the neck, both hands holding a long boom pole that rises diagonally to the upper right and ends in a big furry windshield microphone (a fat rounded capsule drawn with short fur ticks, a strap round its middle). One boot is raised, about to stamp on a shallow gravel tray on the floor in front of the person (a low rectangle with dots). One floor line under everything.
BOLD SQUIGGLE: one thick wavy sound line leaving the microphone towards the right.
TONE only on: the back of the sweater, the shadow of the gravel tray, the fur as dense short ticks at the base of the capsule; the hair as the dark scribble.
Keep it simple: nothing beyond what is listed. Landscape 1536x1024, pure white background, pencil only, no text.
```

**CAT-10 Sticker Sheet (illustration showcase)**

```text
Attach STYLE-MASTER.png. Same style as the attached image (copy the style, not its scene).

SCENE: The person sits at left at a table, leaning over a big sheet of backing paper lying on the table at right, drawn in simple perspective (a wide rounded trapezoid with one curled corner). On the sheet, four sticker shapes: a star, a heart, a speech bubble and a flower. The speech bubble and the flower are already empty, drawn as dashed outlines. The person's small hand pinches the corner of the star and peels it away; the curled corner shows its back side.
BOLD SQUIGGLE: the peeled corner of the star curls into one thick loose spiral.
TONE only on: the back of the sweater, the curled underside of the star (hatching), the shadow of the sheet on the table; the hair as the dark scribble.
Keep it simple: nothing beyond what is listed. Landscape 1536x1024, pure white background, pencil only, no text.
```

### One-line fixes to paste when a result is off

- Too busy: `Simpler: remove everything that is not listed, fewer lines, like the style master.`
- The person changed: `Same person as the style master: messy bun, round glasses, loose sweater, face in profile.`
- It looks like marker or ink: `Pencil, not marker: soft graphite grey with visible grain, same line weight as the style master.`
- Colour or paper texture crept in: `Pencil only on flat pure white, no tint, no paper texture.`

## PF, ST, PR

Open. Pau gives the art direction and references for each category, then the prompts are written like the CAT set (one opening message per chat, one prompt per image). The IDs, the file names and the filing procedure stay as before:

- `PF-NN` becomes `public/works/concept-portfolio/art/slide-N.webp` (1080x1920) plus the derived sheet, contact sheet, thumb, peek and card art.
- `ST-NN` becomes `sticker-NN.webp` (1200x1600 transparent) and `thumb-NN.webp` (300x400), then `build-shapes.py` and the card art (see `docs/api/world-illustration.md`).
- `PR-NN` becomes `public/process/scene-0N.webp` (1400x1500) and the index goes into `SCENE_IMAGES` (`process/images.ts`).
