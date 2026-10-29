# Image prompts for ChatGPT (and how the images come back)

Version 4 (2026-10-29), the definitive Catalog set. Pau threw away three earlier directions (flat riso colour, five-reference graphite, one-reference graphite) and fixed the brief:

- The style master is the flat felt-tip marker figure (orange hoodie, cobalt line, pink laces): `_inbox/refs/STYLE-MASTER.jpg`.
- Each Catalog sketch is a **simple sketch in exactly 4 colours**, chosen to contrast with the colour of its folder.
- No character is required, and the ten do **not** share a structure: same artistic hand, a different idea and composition each, "as if one artist had designed each folder one by one".
- They are not a small motif any more: each is a **wide frieze behind the title of its folder**, at low opacity, filling much of the horizontal band.

Version 8 adds ST (the nine Sticker Sheet characters restyled like Pau's lilac selfie sticker, two references per prompt). Version 7 added TK (the seven "On my desk" icons as animatable parts sheets, plus the bin, in blackwork tattoo style: see the TK section). Version 6 added PR (the four Process scenes: a restyle of the scenes already on the site, two references per prompt). PF and ST are still open: they get their prompts when Pau gives the direction for each category.

## The system

Every image has an ID: `AREA-NN`. Save the result with the ID as its name in `C:\Users\User\Documents\Portofolio\_inbox\` (git ignores that folder). If you make several versions add a letter: `CAT-04b.png`.

| Area | IDs | What it replaces | Status |
|---|---|---|---|
| `CAT` | CAT-01 .. CAT-10 | the grey sketch next to each name in the Catalog, now a faint full-width background of the folder | **defined below (v4)** |
| `PF` | PF-01 .. PF-05 | the five slides of folder 09 (A Portfolio for a Client) | waiting for Pau's direction |
| `ST` | ST-01 .. ST-09 | the nine stickers of folder 10 (Sticker Sheet), same characters restyled | **filed and live** (`python tools/ingest_stickers.py _inbox/refs`) |
| `PR` | PR-01 .. PR-04 | the four big scenes of the Process film (section 05): COLLECT, SKETCH, MAKE, DELIVER | **filed and live** |
| `TK` / `BIN` | TK-01 .. TK-07, BIN-01 | the seven tool icons of "On my desk" (animated parts sheets) and the bin | **filed and live** (`python tools/ingest_tokens.py _inbox/refs`) |

`_inbox/refs/STYLE-PROCESS.jpg` (the "Small objects in time" poster grid) is the style reference for every PR prompt, and `_inbox/refs/ELEM-01.png` .. `ELEM-04.png` (the current scenes of the site) are the "what to draw" references. `_inbox/refs/STYLE-MASTER.jpg` is the reference for every CAT prompt. `REF-2` .. `REF-5` (the crayon, ink and pen references) are kept for the other categories. The graphite experiments are archived in `_inbox/_old/` and are not used.

## CAT: how the pictures are used on the site (this decides the format)

Measured on the live Catalog (closed folder bands):

| Viewport | Band width | Head height (where the title sits) | Ratio |
|---|---|---|---|
| 1440 | 1270 px | 115 to 230 px | 5.5:1 to 11:1 |
| 1920 | 1516 px | 127 to 284 px | 5.3:1 to 12:1 |
| 1024 | 903 px | 86 to 174 px | 5.2:1 to 10.5:1 |

So the picture is a very long, low strip. Plan for filing:

1. ChatGPT draws on a flat background of the folder's own colour (so the contrast is judged on the real colour). I remove that flat colour (key it out from the edges, with a soft edge), trim to the drawing and save `public/works/<slug>/catalog-sketch.webp` (transparent).
2. The picture becomes the **background of the band head**: full width, behind the title and the meta, `object-fit: cover`, opacity 0.3 (0.4 on hover). The old small grey sketch is switched off for that slug (`CATALOG_SKETCH` in `catalog/sketches.ts`). A header with a picture is never flatter than 7:1, so the crop shows enough of the picture.
3. It shows on phones too (as a background it needs no room).

**Status: CAT-01 .. CAT-10 are filed and live** (`python tools/ingest_catalog.py _inbox/refs`; the generated images are 2172x724, the script trims the empty margins so the band can fill the whole folder). To replace one, put the new `CAT-NN.png` in the inbox and run the script again.

Folder colours: 01 tomato `#FF4B2B`, 02 pine `#1F5C46`, 03 marigold `#FFB81C`, 04 oxblood `#8A1B3D`, 05 ultraviolet `#5B3DF5`, 06 bubblegum `#FF8FC1`, 07 lagoon `#0F9AA8`, 08 olive `#86A22F`, 09 butter `#FBE79A`, 10 lilac `#B79CFF`.

## Chat opening message (new chat, paste first, attach `STYLE-MASTER.jpg`)

```text
The attached image is the STYLE MASTER. Over this chat we will draw TEN wide sketches, one for each coloured folder of a portfolio website. They are the work of ONE illustrator who solved each folder in a different way, but with the same hands, the same markers and the same sense of humour as the style master. Do not draw anything yet. Study the image, reply "ready" and describe back to me, in six lines, what makes its style.

THE STYLE (copy it exactly; copy the style, never the subject):
- MARKER LINE. Every outline is one thick felt-tip marker line of a single colour and a single constant weight (about 1.5% of the height of the artwork), with round ends. Lines are confident but not clean: they overshoot corners, leave small gaps instead of closing, wobble a little, and are never ruler-straight or vector-perfect.
- OPAQUE FLAT FILLS. Colour is laid in with an opaque marker or gouache: completely flat, with faint directional brush streaks inside the fill. The fill is deliberately NOT registered with the line: in places it stops short of the outline and lets the background show through, in places it spills a little over it, like a two-pass screen print.
- FEW INNER LINES. Folds, seams and details are single expressive strokes of the same marker. Never hatching, never shading.
- NAIVE, CHUNKY SHAPES. Proportions are simplified and slightly exaggerated (oversized sweater, tiny head, long legs). Everything is a bold, simple, readable shape with a touch of humour.
- ONE SMALL ACCENT. A tiny bright detail in the accent colour (like the pink shoelaces) that makes the drawing sing.
- NO shading, NO gradients, NO shadows, NO textures except the faint streaks in the fills, NO 3D, NO photo look, NO outline in any colour other than the line colour of that drawing.

THE FOUR COLOURS. Every drawing uses exactly FOUR colours, given in each request as hex codes: LINE (all the outlines), FILL A (the main fill, about 60% of the coloured area), FILL B (the second fill, about 30%) and DETAIL (the small accent, about 10%). No fifth colour, no tints, no black unless it is one of the four. They were chosen to contrast with the colour of the folder.

THE BACKGROUND. The background is the colour of the folder, given in each request as a hex code: one perfectly flat, uniform fill, edge to edge. No gradient, no vignette, no paper texture, no frame, no border, no shadow on the ground. NO TEXT anywhere: no letters, no numbers, no logos (any label is an empty shape).

THE FORMAT. Each sketch is a long horizontal FRIEZE that will become a faint background behind a headline across a wide folder. Make it an ultra-wide panorama, as close to 4:1 as you can get (for example 2048x512). If only 1536x1024 is possible, draw everything inside the middle horizontal third and leave the top and bottom thirds as empty flat background (I will crop them). The drawing runs edge to edge: shapes may touch or be cut by the left and right edges. Shapes are big and bold (the tallest reach the full height of the strip, nothing is smaller than 8% of that height) because it will be shown small and faint.

TEN DIFFERENT SKETCHES, ONE ARTIST. The ten must NOT share a layout. Each request gives its own structure (a flat-lay, a skyline, a rug, a grid, a panorama...) and its own witty touch. What stays identical in all ten is the hand: the marker, the line weight, the unregistered flat fills, the chunky simplified shapes, the humour. Imagine one illustrator, one afternoon, ten folders, ten different ideas.

With every request I will attach the style master again.
```

## The ten prompts (one message each, attach `STYLE-MASTER.jpg` to each)

**CAT-01 Proyecto Contract**

```text
Attach the style master. Same artist and same hand as the style master (copy the style, not its subject).

FOLDER: 01 Proyecto Contract, a trade magazine on commercial interiors.
BACKGROUND: perfectly flat tomato #FF4B2B, edge to edge.
THE FOUR COLOURS: LINE ink #17101B, FILL A cream #FFF2DA, FILL B marigold #FFB81C, DETAIL ultraviolet #5B3DF5.
STRUCTURE: a flat-lay of an editor's desk seen from directly above, objects scattered along one long table in a row from edge to edge, overlapping at different angles.
ITEMS (all big and simple): a large open magazine spread (left page: a photo box with a bold diagonal cross and a caption bar; right page: a headline of two thick bars and three columns of wavy lines), a stack of three closed magazines slightly fanned, a stubby pencil, a ruler with tick marks, a round magnifying loupe, a coffee mug seen from above (two concentric circles and a handle), a pair of scissors, a roll of tape.
YOUR OWN TOUCH: a loose thick loop in the DETAIL colour drawn round one headline, as if the editor had just marked it, with the pencil lying across it and its tip still touching the loop.
Nothing like the other nine in layout, but drawn by the same hand.
Format: ultra-wide panorama (about 4:1, or 1536x1024 with everything in the middle third), flat background, no text, no frame, no shadow.
```

**CAT-02 Plana Digital**

```text
Attach the style master. Same artist and same hand as the style master (copy the style, not its subject).

FOLDER: 02 Plana Digital, brand identity and websites.
BACKGROUND: perfectly flat pine green #1F5C46, edge to edge.
THE FOUR COLOURS: LINE cream #FFF2DA, FILL A marigold #FFB81C, FILL B tomato #FF4B2B, DETAIL bubblegum #FF8FC1.
STRUCTURE: a city skyline made of browser windows standing side by side like buildings of different heights and widths, on one long ground line, with a sky above.
ITEMS (all big and simple): seven browser windows (a rounded rectangle with a bar of three dots on top). One holds a half sun with short rays, one a grid of six small boxes, one a big headline bar above a block. Two smaller buildings are a tall phone shape and a tablet shape. A flock of mouse-cursor arrows (the classic pointer shape) flies over the skyline in a loose V like birds.
YOUR OWN TOUCH: the cursor arrows are the birds, drawn in the DETAIL colour, and the tallest window has a tiny antenna with a flag.
Nothing like the other nine in layout, but drawn by the same hand.
Format: ultra-wide panorama (about 4:1, or 1536x1024 with everything in the middle third), flat background, no text, no frame, no shadow.
```

**CAT-03 44 Lab**

```text
Attach the style master. Same artist and same hand as the style master (copy the style, not its subject).

FOLDER: 03 44 Lab, custom hand-tufted rugs.
BACKGROUND: perfectly flat marigold #FFB81C, edge to edge.
THE FOUR COLOURS: LINE ultraviolet #5B3DF5, FILL A tomato #FF4B2B, FILL B cream #FFF2DA, DETAIL pine #1F5C46.
STRUCTURE: one single huge object stretched across the whole width: a long hand-tufted runner rug seen from slightly above, filling the strip almost edge to edge, with a fringe at both short ends.
ITEMS (all big and simple): the rug with a bold repeated pattern of concentric diamonds and zigzags and short fuzzy ticks along its long edges; a chunky tufting gun (boxy motor, grip, pointed nose) resting on it with its cable making one big loose loop; three cones of yarn standing at one end.
YOUR OWN TOUCH: a tiny mischievous devil (round head, two small horns, wide grin, thin tail ending in an arrow tip) peeks out from under a lifted corner of the rug and pulls a loose thread, drawn with the DETAIL colour for the thread and the tail.
Nothing like the other nine in layout, but drawn by the same hand.
Format: ultra-wide panorama (about 4:1, or 1536x1024 with everything in the middle third), flat background, no text, no frame, no shadow.
```

**CAT-04 Spelled Guilty**

```text
Attach the style master. Same artist and same hand as the style master (copy the style, not its subject).

FOLDER: 04 Spelled Guilty, a noir murder-mystery word-search book.
BACKGROUND: perfectly flat oxblood #8A1B3D, edge to edge.
THE FOUR COLOURS: LINE cream #FFF2DA, FILL A marigold #FFB81C, FILL B lagoon #0F9AA8, DETAIL bubblegum #FF8FC1.
STRUCTURE: a pattern. One long word-search grid runs across the whole width, 3 rows by about 18 columns of equal square cells, with the objects of the investigation lying on top of it.
ITEMS (all big and simple): each cell holds one tiny squiggle instead of a letter (a different squiggle each time, never a readable letter); about a dozen cells are filled solid with FILL B; three long pill-shaped loops in the DETAIL colour circle rows of cells (one horizontal, one diagonal, one vertical); a noir fedora (pinched crown, band, wide brim) sits on the top edge of the grid at the right; a big magnifying glass (thick handle, round lens) lies over the left part of the grid and the three cells under the lens are drawn larger; a trail of four footprints walks across the grid.
YOUR OWN TOUCH: one cell contains a cartoon eye peeking out at the viewer.
Nothing like the other nine in layout, but drawn by the same hand.
Format: ultra-wide panorama (about 4:1, or 1536x1024 with everything in the middle third), flat background, no text, no frame, no shadow.
```

**CAT-05 Space Monkey**

```text
Attach the style master. Same artist and same hand as the style master (copy the style, not its subject).

FOLDER: 05 Space Monkey, an escape room in Granollers.
BACKGROUND: perfectly flat ultraviolet #5B3DF5, edge to edge.
THE FOUR COLOURS: LINE cream #FFF2DA, FILL A marigold #FFB81C, FILL B bubblegum #FF8FC1, DETAIL lagoon #0F9AA8.
STRUCTURE: a panorama of space with depth: one long dotted orbit line sweeps across the whole width from left to right, and everything is strung along it, objects at very different sizes.
ITEMS (all big and simple): a big ringed planet at the far left; a small cratered planet; a moon shaped like a banana; a little rocket flying along the orbit line; five or six four-point stars of different sizes; and at the right of the centre a chubby monkey in a baggy spacesuit with a round glass helmet, floating weightless and holding up a big old-fashioned key (round bow, long shaft, three teeth).
YOUR OWN TOUCH: the banana moon, and the monkey's long curly tail ends in a tiny glove.
Nothing like the other nine in layout, but drawn by the same hand.
Format: ultra-wide panorama (about 4:1, or 1536x1024 with everything in the middle third), flat background, no text, no frame, no shadow.
```

**CAT-06 Procreate Sketchbook**

```text
Attach the style master. Same artist and same hand as the style master (copy the style, not its subject).

FOLDER: 06 Procreate Sketchbook, my first drawings: portraits, crests and logo ideas.
BACKGROUND: perfectly flat bubblegum pink #FF8FC1, edge to edge.
THE FOUR COLOURS: LINE oxblood #8A1B3D, FILL A cream #FFF2DA, FILL B ultraviolet #5B3DF5, DETAIL marigold #FFB81C.
STRUCTURE: a loose sheet of doodles, spread along the width at very different sizes, all connected by ONE long continuous marker line that never lifts: it starts at the left edge, loops through every doodle and ends at the tip of a stylus at the right.
ITEMS (all big and simple): a face in profile with a big nose and a swirl of hair; a heraldic shield crest divided in four fields, two of them filled; a monogram-like swirl made of two loops (no letters); a five-point star; a leaf sprig with three leaves; a small bird; at the right end a slim stylus pen with a pointed tip and a clip; three round paint dots near the stylus.
YOUR OWN TOUCH: the single unbroken line is the whole idea: the drawing is one stroke.
Nothing like the other nine in layout, but drawn by the same hand.
Format: ultra-wide panorama (about 4:1, or 1536x1024 with everything in the middle third), flat background, no text, no frame, no shadow.
```

**CAT-07 Somia**

```text
Attach the style master. Same artist and same hand as the style master (copy the style, not its subject).

FOLDER: 07 Somia, a sustainable fashion store.
BACKGROUND: perfectly flat lagoon teal #0F9AA8, edge to edge.
THE FOUR COLOURS: LINE ink #17101B, FILL A cream #FFF2DA, FILL B tomato #FF4B2B, DETAIL marigold #FFB81C.
STRUCTURE: a rhythm along a line: one thin horizontal clothes rail runs across the whole width, garments hang from it at a regular beat, and a floor line runs below.
ITEMS (all big and simple): six garments, each on a simple triangular hanger with a hook: a wide-sleeved blouse, a long coat, trousers folded over a hanger, a belted dress, a chunky knit jumper, a long scarf; three empty paper price tags on strings; on the floor three potted plants of different sizes and a folded stack of two garments.
YOUR OWN TOUCH: one tiny bird sits on the rail and pecks at a price tag, and the DETAIL colour is used only on the tags and the bird's beak.
Nothing like the other nine in layout, but drawn by the same hand.
Format: ultra-wide panorama (about 4:1, or 1536x1024 with everything in the middle third), flat background, no text, no frame, no shadow.
```

**CAT-08 Gotet**

```text
Attach the style master. Same artist and same hand as the style master (copy the style, not its subject).

FOLDER: 08 Gotet, a vermouth bar identity.
BACKGROUND: perfectly flat olive green #86A22F, edge to edge.
THE FOUR COLOURS: LINE oxblood #8A1B3D, FILL A cream #FFF2DA, FILL B tomato #FF4B2B, DETAIL marigold #FFB81C.
STRUCTURE: a shop front seen straight on: a scalloped striped awning runs across the whole width at the top (nine scallops alternating FILL A and FILL B), and below it one long shelf line carries the bar.
ITEMS (all big and simple): on the shelf, from left to right, three vermouth bottles of different heights (rounded shoulders, an empty label shape), a stemmed glass with ice cubes and a lemon wheel, a tall soda siphon (lever head and spout), a smiling olive character with two dot eyes, then two more bottles.
YOUR OWN TOUCH: the olive wears a tiny beret and holds a toothpick like a flag; the DETAIL colour is only the lemon, the siphon lever and the flag.
Nothing like the other nine in layout, but drawn by the same hand.
Format: ultra-wide panorama (about 4:1, or 1536x1024 with everything in the middle third), flat background, no text, no frame, no shadow.
```

**CAT-09 A Portfolio for a Client**

```text
Attach the style master. Same artist and same hand as the style master (copy the style, not its subject).

FOLDER: 09 A Portfolio for a Client, the presentation of a foley artist (the person who makes film sounds with everyday objects).
BACKGROUND: perfectly flat butter yellow #FBE79A, edge to edge.
THE FOUR COLOURS: LINE ultraviolet #5B3DF5, FILL A tomato #FF4B2B, FILL B lagoon #0F9AA8, DETAIL ink #17101B.
STRUCTURE: an audio timeline: three long thin horizontal tracks stacked and running across the whole width, with clips of different lengths drawn as rounded rectangles, and a vertical playhead line with a small triangle head crossing near the right third.
ITEMS (all big and simple): track 1 has clips filled with spiky waveform bars; track 2 has a pair of boots and three footprints; track 3 has a folded umbrella, a celery stalk, half a watermelon and a crumpled sheet drawn as a spiky star. Each clip holds one of these big simple pictures.
YOUR OWN TOUCH: from the top-left corner a boom pole hangs down into the first track and ends in a big furry microphone (a fat capsule covered in short fur ticks, a strap round its middle), as if it were recording the timeline.
Nothing like the other nine in layout, but drawn by the same hand.
Format: ultra-wide panorama (about 4:1, or 1536x1024 with everything in the middle third), flat background, no text, no frame, no shadow.
```

**CAT-10 Sticker Sheet**

```text
Attach the style master. Same artist and same hand as the style master (copy the style, not its subject).

FOLDER: 10 Sticker Sheet, an illustration showcase.
BACKGROUND: perfectly flat lilac #B79CFF, edge to edge.
THE FOUR COLOURS: LINE pine green #1F5C46, FILL A marigold #FFB81C, FILL B tomato #FF4B2B, DETAIL cream #FFF2DA.
STRUCTURE: a long sheet of backing paper (a rounded rectangle, slightly curled at the right end) covering most of the width, with a loose grid of die-cut outlines on it, some stickers still in place, some already gone.
ITEMS (all big and simple): on the sheet a star with a face (two dot eyes, a smile), a heart, a speech bubble with three dots, a flower, a lightning bolt and a smiling sun; two empty die-cut outlines drawn as dashed lines; two stickers already peeled and floating just off the sheet, each with a curled corner that shows its back side in the DETAIL colour; a pair of scissors at the right end.
YOUR OWN TOUCH: the star sticker has tiny legs and is running off the sheet.
Nothing like the other nine in layout, but drawn by the same hand.
Format: ultra-wide panorama (about 4:1, or 1536x1024 with everything in the middle third), flat background, no text, no frame, no shadow.
```

## One-line fixes to paste when a result is off

- It is not the same hand: `Same hand as the style master: one constant marker line, flat fills that are not registered with the line, chunky simplified shapes.`
- Too clean or vector-like: `Looser: the line overshoots the corners and leaves gaps, the fills stop short of the outline in places.`
- Too many colours: `Exactly four colours plus the background: LINE, FILL A, FILL B, DETAIL, nothing else.`
- Shading, gradient or texture crept in: `Completely flat fills with only faint brush streaks, no shading, no gradient, no shadow.`
- Too small or too busy for a strip: `Fewer and bigger shapes, the tallest reach the full height of the strip, nothing smaller than 8% of it.`
- It is not wide enough: `Redraw it as an ultra-wide panorama, about 4:1, edge to edge.`
- Background drifted: `The background is one perfectly flat fill of the folder colour, no vignette, no texture.`

## PR: the four Process scenes (restyle of the current scenes, in Pau's reference style)

**v6 (2026-10-29).** The first try (PR-01 drawn from a text list, "pastel pop", separate objects) came back as clean, generic vector art with glossy highlights, and the objects were not the ones on the site. Pau's fix, adopted here: **attach two references to every prompt**. IMAGE 1 is the scene that is already on the site (it says WHAT to draw: every object, its place and size) and IMAGE 2 is Pau's poster grid (it says HOW to draw it). The artistic target is the reference as it really is: hand-painted, bold, saturated, naive and chunky, not pastel and not clean.

### How the pictures are used on the site

Each step of the film is a flat panel (01 COLLECT marigold `#FFB81C`, 02 SKETCH bubblegum `#FF8FC1`, 03 MAKE tomato `#FF4B2B`, 04 DELIVER lagoon `#0F9AA8`) with the scene on the left (about 480 x 515 css px, 14:15) and the text on the right. The tool tokens of "On my desk" stay as they are.

- The references for IMAGE 1 are the four current vector scenes exported fully drawn, without label strips or lettering: `_inbox/refs/ELEM-01.png` .. `ELEM-04.png` (960 x 1026). The style reference is `_inbox/refs/STYLE-PROCESS.jpg`.
- The result is drawn on the same flat colour as the panel. The ingest keys that colour out (as for the Catalog), trims, scales to 1400 x 1500 and saves `public/process/scene-0N.webp`; the step index goes into `SCENE_IMAGES` (`process/images.ts`). The label strips stay hidden for these and the alt text of each scene stays.
- **Animation.** The old vector scene had its objects land one after another and draw themselves. A raster scene keeps a little entrance instead: when the frame develops, the picture rises like developer (a clip-path reveal from the bottom), settles with a small spring, then idles with a tiny bob while the frame is the active one; loose marks (dashes, stars) that come out as separate pieces twinkle. Reduced motion and "Pause motion": drawn and still from the first paint. If an illustration happens to come out with separate objects, they can land in turn.

### Chat opening message (new chat, paste first, attach `STYLE-PROCESS.jpg`)

```text
You will make FOUR illustrations for a portfolio website, one for each step of a design process (COLLECT, SKETCH, MAKE, DELIVER). With every request I will attach TWO images: IMAGE 1 is the scene to redraw (it tells you WHAT to draw: every object, its position and its size) and IMAGE 2 is the STYLE REFERENCE (it tells you HOW to draw it). The image attached now is the STYLE REFERENCE: a grid of hand-painted posters. Do not draw anything yet. Study it, reply "ready" and describe back to me, in six lines, what makes its style and what makes it different from clean vector illustration.

THE STYLE OF THE REFERENCE, in detail (copy the way it is drawn, never its subjects, never its lettering):
1. HAND-PAINTED, NOT VECTOR. Shapes are filled with opaque colour that looks painted with a chunky brush or a fat paint marker: uneven edges, faint brush streaks and dry-brush speckle inside the big fills. Nothing is perfectly straight, round, parallel or symmetrical.
2. A THICK, UNEVEN INK OUTLINE. Near-black, like a fat marker, around the main shapes of the objects. Its thickness changes a little as the hand presses, corners are rounded, it sometimes misses the fill or overshoots it. Some shapes (big colour fields, sleeves, a table) have no outline at all: a flat colour block with a few thin dark detail strokes.
3. BOLD, SATURATED, HIGH-CONTRAST COLOUR. Big flat fields of strong colour side by side, cream and near-black to hold them together. Colour is used boldly, never politely.
4. NAIVE, CHUNKY DRAWING. Simple blunt forms, a slightly wonky perspective, details drawn in a few strokes (a clock face with small naive digits, a necklace as a row of dashes).
5. FLAT SHADING ONLY. A hard-edged darker shape on the shadow side, flat cream blobs or strokes for highlights. NO shiny glossy highlights, NO gradients, NO soft shadows.
6. LOOSE PLAYFUL MARKS around the objects: short dashes, zigzags, wavy lines, dots and tiny stars, drawn quickly, as separate small marks.

WHAT IS NOT THE STYLE: clean vector spot illustration, app-icon or sticker art, Duolingo, Notion or Slack style, perfectly even outlines, glossy shine, symmetrical geometry, a polite pastel palette in one hue family.

THE RULE FOR EVERY REQUEST. IMAGE 1 is the layout. Keep every object it shows, the same number of them, in the same positions, sizes, tilts and overlaps, and keep its colour roles (they are the site's own palette). Do NOT copy the way IMAGE 1 is drawn (it is a clean vector drawing): redraw all of it in the hand-painted style of the reference. Replace any text with scribbled lines. Never add an object that is not in IMAGE 1 and never leave one out.

THE BACKGROUND. The same flat colour as the background of IMAGE 1, edge to edge: a flat fill, no pattern, no texture, no vignette, no frame. Only a few loose marks (dashes, squiggles, dots, tiny stars) may float around the objects.

NO TEXT of any kind: no letters, no numbers, no logos.

THE FORMAT. The same proportions as IMAGE 1 (about 14:15, almost square). If only standard sizes are possible, use 1024x1024 with everything inside the central 94% of the height.

With every request I will attach the scene (IMAGE 1) and the style reference (IMAGE 2).
```

### The four prompts (one message each: attach the scene as IMAGE 1 and `STYLE-PROCESS.jpg` as IMAGE 2)

**PR-01 COLLECT. IMAGE 1 = `ELEM-01.png`**

```text
IMAGE 1 is attached first (ELEM-01.png, the scene) and IMAGE 2 second (the style reference).

Redraw IMAGE 1, step 01 COLLECT (gathering references), in the hand-painted style of IMAGE 2. Same objects, same positions, same sizes, same colour roles, a completely different hand. Look at IMAGE 2 again before you draw: it must feel painted by the same hand as those posters.

WHAT IMAGE 1 SHOWS (keep all of it):
- A big cream board, slightly tilted, filling most of the picture, with a thick outline and a hard dark offset shadow.
- Six cards on the board: top left a landscape photo card (violet-blue sky, a pale sun, teal and lilac hills, two caption lines); top centre a tall red portrait card (a cream circle head, dark shoulders, three lines); top right a card with a teal banner and two lines; middle right a card with a row of four colour swatches (red, yellow, violet, black) and lines; lower left a card with a pale yellow photo of a dark green bottle with a label; lower middle a small card with a mini web layout (a black top bar with three dots, a lilac box, lines).
- One red string running from pin to pin through all six cards, with seven round pins in red, white, yellow, red, violet, teal and red.
- Bottom right a big pink sticky note with a curled corner, one swoosh line on it and a red pin.
- Bottom left a big magnifying glass with a violet handle whose lens shows the four colour swatches.
- At the bottom a cream ticket stub with a yellow star, and a round red roll of tape.
CHANGE ONLY the way it is drawn: thick uneven marker outline, painted fills with brush streaks, naive wonky shapes, flat hard shadows, flat cream highlight blobs, and a few loose dashes and tiny stars around the objects. Replace any text or caption with scribbled lines. Add nothing and leave nothing out.
Format: the proportions of IMAGE 1, flat marigold #FFB81C background, no text.
```

**PR-02 SKETCH. IMAGE 1 = `ELEM-02.png`**

```text
IMAGE 1 is attached first (ELEM-02.png, the scene) and IMAGE 2 second (the style reference).

Redraw IMAGE 1, step 02 SKETCH (rough thumbnails, then one chosen sketch becomes a finished character), in the hand-painted style of IMAGE 2. Same objects, same positions, same sizes, same colour roles, a completely different hand. Look at IMAGE 2 again before you draw: it must feel painted by the same hand as those posters.

WHAT IMAGE 1 SHOWS (keep all of it):
- Top left a cream spiral notepad with seven black rings along its top edge and a 3 by 3 grid of nine boxed thumbnails of little devil heads, each with a different face; the top-left and the bottom-left thumbnails are crossed out with a red X; the middle-right one is circled with a loose red loop, and a black curved arrow runs from that loop down to the tablet.
- Top right a cream card with a yellow strip of tape on top, a star outline, a devil face and three lines.
- Bottom right a tablet with a thick black frame whose cream screen shows ONE big finished red devil character: round head, two big black horns, angry-happy eyes, pink cheeks, an open grin with fangs, a round body, thin arms and legs, black feet and a tail; a stylus is drawing at its cheek.
- Bottom left a yellow pencil lying diagonally with a red eraser and a ferrule, and three small pale shavings under its tip.
CHANGE ONLY the way it is drawn: thick uneven marker outline, painted fills with brush streaks, naive wonky shapes, flat hard shadows, flat cream highlight blobs, and a few loose dashes and tiny stars around the objects. Replace any text or caption with scribbled lines. Add nothing and leave nothing out.
Format: the proportions of IMAGE 1, flat bubblegum #FF8FC1 background, no text.
```

**PR-03 MAKE. IMAGE 1 = `ELEM-03.png`**

```text
IMAGE 1 is attached first (ELEM-03.png, the scene) and IMAGE 2 second (the style reference).

Redraw IMAGE 1, step 03 MAKE (vectors, page layouts, retouching, a clay sculpt, variations), in the hand-painted style of IMAGE 2. Same objects, same positions, same sizes, same colour roles, a completely different hand. Look at IMAGE 2 again before you draw: it must feel painted by the same hand as those posters.

WHAT IMAGE 1 SHOWS (keep all of it):
- Top left a cream card with a grey grid, a smooth black bezier curve with two teal round handle points and square anchor points, and a yellow leaf shape under the curve.
- Top right a tall cream magazine page, slightly tilted: two black headline bars, a lilac photo box with a diagonal cross, a yellow box, dashed teal guide lines, columns of short lines and a red box at the bottom.
- Bottom left a lilac head bust on a small cream round stand, with dotted halftone shading on its left side, a dashed circle with a crosshair on its cheek, and a yellow brush tool next to the head.
- Bottom centre a cream photo card showing a teal sky, a pale sun and green hills with dashed selection circles on the hills.
- Bottom right a cream card with a 2 by 2 grid of four little faces on coloured squares (pink mouse, a yellow cat framed in red with a green tick badge, a teal one, a lilac monkey) and a yellow four-point sparkle at its corner.
- At the very bottom a long yellow ruler with tick marks (no numbers).
CHANGE ONLY the way it is drawn: thick uneven marker outline, painted fills with brush streaks, naive wonky shapes, flat hard shadows, flat cream highlight blobs, and a few loose dashes and tiny stars around the objects. Replace any text or caption with scribbled lines. Add nothing and leave nothing out.
Format: the proportions of IMAGE 1, flat tomato #FF4B2B background, no text.
```

**PR-04 DELIVER. IMAGE 1 = `ELEM-04.png`**

```text
IMAGE 1 is attached first (ELEM-04.png, the scene) and IMAGE 2 second (the style reference).

Redraw IMAGE 1, step 04 DELIVER (brand manual, print-ready file, a working website, the key handed over), in the hand-painted style of IMAGE 2. Same objects, same positions, same sizes, same colour roles, a completely different hand. Look at IMAGE 2 again before you draw: it must feel painted by the same hand as those posters.

WHAT IMAGE 1 SHOWS (keep all of it):
- Left a tilted cream print-ready sheet: crop marks, a registration target at the top, a dashed trim line, a picture of a violet sky, a big yellow sun and a red hill, and a strip of colour bars along the bottom.
- Top centre a thick red hardcover notebook, slightly tilted, with a darker red spine, a yellow sun with short rays on the cover, a black elastic band and cream page edges.
- Bottom centre a cream browser window: a black bar with three dots and a long pale address pill, a big yellow hero block with two lines and a black button, and three cards below (lilac, pink, cream).
- Bottom right a tablet and a phone with thick black frames, overlapping each other and the window, each showing a yellow block, lines and lilac and pink boxes.
- Bottom left a cream key with a round bow tied by a ring to a yellow rounded tag with a hole.
CHANGE ONLY the way it is drawn: thick uneven marker outline, painted fills with brush streaks, naive wonky shapes, flat hard shadows, flat cream highlight blobs, and a few loose dashes and tiny stars around the objects. Replace any text or caption with scribbled lines. Add nothing and leave nothing out.
Format: the proportions of IMAGE 1, flat teal #0F9AA8 background, no text.
```

### One-line fixes to paste when a result is off

- Still too clean: `Still too clean and vector-like. Repaint it the way IMAGE 2 is painted: thick uneven marker outline, brush streaks and dry-brush speckle in the fills, lopsided naive shapes, no glossy highlights.`
- The objects changed: `You changed the objects. Redraw IMAGE 1 exactly: the same objects, the same count, the same positions and sizes. Only the way it is drawn changes.`
- Glossy shine: `Remove every glossy highlight and gradient: only flat hard-edged shadow shapes and flat cream highlight blobs.`
- Dull or one-hue colour: `Bolder colour: strong flat fields with high contrast, as in IMAGE 2, keeping the colour roles of IMAGE 1.`
- Text appeared: `Remove all lettering: no letters, numbers or logos anywhere; captions become scribbled lines.`
- The background is wrong: `The background is one perfectly flat fill of the same colour as IMAGE 1, no pattern, no vignette, no texture.`
- If Pau wants it softer after seeing a result: `A little softer: chalkier tones, same hand.`

## TK: the seven tool icons of "On my desk" and the bin (old-school blackwork tattoo flash)

**v7 (2026-10-29).** Pau wants the seven small tool icons and the waste-paper basket redrawn in an old-school blackwork tattoo-flash style (reference: `_inbox/refs/STYLE-TATTOO.jpg`, a poster with a tiger, a cat, a skull, a cobra, heavy black outlines and solid black shapes over four flat colours on jade). **The icons must keep their little hover animations**, so each icon is drawn as a **parts sheet**: its moving parts as separate pieces, which are cut out and re-assembled in code.

### Files and IDs

| ID | Object | Reference to attach as IMAGE 1 | Result file |
|---|---|---|---|
| TK-01 | The whole Adobe suite (fan of paint chips) | `OBJ-01.png` | `TK-01.png` |
| TK-02 | Pencil and paper | `OBJ-02.png` | `TK-02.png` |
| TK-03 | Procreate (index tab on a canvas card) | `OBJ-03.png` | `TK-03.png` |
| TK-04 | Nomad Sculpt (clay, loop tool, flag) | `OBJ-04.png` | `TK-04.png` |
| TK-05 | AI tools (luggage tag) | `OBJ-05.png` | `TK-05.png` |
| TK-06 | Pinterest (card and push pin) | `OBJ-06.png` | `TK-06.png` |
| TK-07 | VS Code (keyboard key and braces) | `OBJ-07.png` | `TK-07.png` |
| BIN-01 | The bin of discarded thumbnails (bottom right of the desk) | `OBJ-BIN.png` | `BIN-01.png` |

The `OBJ-*.png` files are the current objects exported from the site (1240 x 1240, flat cream, no lettering). `STYLE-TATTOO.jpg` is IMAGE 2 for every prompt.

### What is animated today (the new parts must allow the same moves)

- TK-01: three chips fan open on a rivet (about -30 / 0 / +30 degrees, opening to -46 / +46).
- TK-02: the scribble is drawn again while the pencil rides along it.
- TK-03: the index tab slides up out of the card and the brush stroke is painted again.
- TK-04: the clay squashes under a thumb, the flag waves, the loop tool nudges in.
- TK-05: the tag swings from its string and the tick is drawn again.
- TK-06: the pin is pressed in and the card flutters.
- TK-07: the key cap is pressed down and the braces pop.
- BIN-01: static (as now).

### What happens after the images arrive

`tools/ingest_tokens.py` keys the jade out (as for the Catalog and Process), splits every sheet into its separate pieces, and a manifest per icon (written by looking at the pieces) says which piece is which part, where it sits in the 150-unit token box and where its pivot is. `TOKEN_ART` then draws the pieces as sprites with the same `tk-*` classes and the same keyframes (`tokens.css`); the tool names the old drawings carried are written in real type on each icon's blank ribbon banner; the hard offset shadow stays a CSS `drop-shadow`. Still path for reduced motion and "Pause motion" as now. If a sheet comes back with touching parts, that icon moves as one piece.

### Chat opening message (new chat, paste first, attach `STYLE-TATTOO.jpg`)

```text
You will make EIGHT small illustrations for a portfolio website: seven tool icons and one waste-paper basket, all in the style of the STYLE REFERENCE attached now: an old-school blackwork tattoo flash poster. With every request I will attach TWO images: IMAGE 1 is the current object (it tells you WHAT to draw) and IMAGE 2 is the style reference (it tells you HOW to draw it). Do not draw anything yet. Study the style reference, reply "ready" and describe back to me, in six lines, what makes its style.

THE STYLE (copy the way it is drawn, never its subjects, never its lettering):
- TRADITIONAL TATTOO FLASH. Heavy black outlines with a bold thick-and-thin weight, rounded joints, confident and slightly rough. Big SOLID BLACK shapes carry the shadows and the patterns (stripes, silhouettes, a shadow side). Every object is iconic, simplified and readable as a silhouette even when tiny.
- FLAT SPOT COLOUR. Only a few flat, opaque colours laid under the black linework, not perfectly in register: a fill may stop short of the line or spill a little over it, like a screen print. A fine print grain. No gradients, no soft shading, no 3D, no glossy shine.
- LIGHT IS CREAM. Highlights, eyes and small details are flat cream shapes, never white and never shiny.
- ORNAMENT. Small tattoo symbols decorate the objects: four-point stars, eyes, suns with rays, lightning bolts, hearts, sparkle ticks. Small wisps, dashes and rays float near them.
- CHUNKY, ORIGINAL, A LITTLE ODD. Proportions are exaggerated, shapes are bold and a touch strange, each object has one witty tattoo-flash twist, nothing looks like clip art.

THE COLOURS. Exactly four: ink black #17101B, tomato #FF4B2B, marigold #FFB81C and cream #FFF2DA. Nothing else, no tints.

THE BACKGROUND. One perfectly flat, uniform fill of jade green #4F9C80, edge to edge (it is only a working colour: I will remove it). No object may use jade. No ground, no shadow, no frame, no paper texture, no vignette. NO TEXT of any kind: no letters, no numbers, no logos.

THE KEY RULE FOR THE SEVEN TOOL ICONS: A PARTS SHEET. Each icon will be animated, so I need its moving parts as SEPARATE pieces. Draw every part complete (also the sides that would be hidden when assembled), upright and square-on to the viewer, with no tilt and no perspective, never touching or overlapping another part, with at least 6% of the canvas width of empty background between any two parts. Keep the parts at the scale they have in IMAGE 1, so that if I put them together they form that object. Add a blank ribbon banner (empty, no text) as one more part: a long ribbon with folded swallow-tail ends, about as wide as the widest part; I will write the name on it myself.
The waste-paper basket is the exception: it is ONE single drawing, with no parts sheet and no banner.

THE FORMAT. Square, 1024x1024. Arrange the parts in a loose, balanced layout filling about 90% of the canvas.

With every request I will attach the current object (IMAGE 1) and the style reference (IMAGE 2).
```

### The eight prompts (one message each: attach the object as IMAGE 1 and `STYLE-TATTOO.jpg` as IMAGE 2)

**TK-01 The whole Adobe suite. IMAGE 1 = `OBJ-01.png`**

```text
IMAGE 1 is attached first (OBJ-01.png, the current object) and IMAGE 2 second (the style reference).

Redraw IMAGE 1 as a PARTS SHEET in the blackwork tattoo-flash style of IMAGE 2. The object: the whole Adobe suite, shown as a fan of three paint chips joined by one rivet.
BACKGROUND: perfectly flat jade #4F9C80, edge to edge. PALETTE: ink #17101B, tomato #FF4B2B, marigold #FFB81C, cream #FFF2DA, nothing else.
PARTS (each one separate, complete, upright, at least 6% of empty background between all of them):
1. A tall paint chip: a rounded-rectangle card (about 2:5), cream with a thick black outline, with three stacked colour blocks (tomato, marigold, ink black), a small tattoo star in the top block, and one small round hole near the bottom end where the rivet goes.
2. A second paint chip, identical in size and layout, with the blocks in a different order (marigold, ink black, tomato) and a small eye in the top block.
3. A third paint chip, identical in size and layout (ink black, tomato, marigold) with a small sun with rays in the top block.
4. The rivet: a round disc with a thick black outline, a four-point star on its cap and a cream highlight blob.
5. The blank ribbon banner, completely empty.
Original twist: the three chips look like three tattoo flash cards, each carrying one symbol.
Must read at a glance: three paint chips, a rivet and a ribbon.
Add nothing else. Square 1024x1024, flat jade background, no text.
```

**TK-02 Pencil and paper. IMAGE 1 = `OBJ-02.png`**

```text
IMAGE 1 is attached first (OBJ-02.png, the current object) and IMAGE 2 second (the style reference).

Redraw IMAGE 1 as a PARTS SHEET in the blackwork tattoo-flash style of IMAGE 2. The object: a stub of pencil mid-scribble on a scrap of paper.
BACKGROUND: perfectly flat jade #4F9C80, edge to edge. PALETTE: ink #17101B, tomato #FF4B2B, marigold #FFB81C, cream #FFF2DA, nothing else.
PARTS (each one separate, complete, upright, at least 6% of empty background between all of them):
1. A sheet of paper: a landscape rectangle (about 4:3) in cream with a thick black outline, one folded corner, and three ruled lines in black.
2. A scribble: ONE continuous thick black marker line in a loose wave with two small loops, about as wide as the sheet, drawn alone on the background.
3. A stub of pencil lying horizontally with its sharpened tip pointing right: a marigold body with bold black tiger-style stripes, a cream ferrule band with a zigzag, a tomato eraser at the left end, a sharpened cream wooden cone with a solid black graphite tip.
4. The blank ribbon banner, completely empty.
Original twist: the pencil's stripes are tiger stripes, like the tiger of the reference.
Must read at a glance: paper, a scribble and a pencil.
Add nothing else. Square 1024x1024, flat jade background, no text.
```

**TK-03 Procreate. IMAGE 1 = `OBJ-03.png`**

```text
IMAGE 1 is attached first (OBJ-03.png, the current object) and IMAGE 2 second (the style reference).

Redraw IMAGE 1 as a PARTS SHEET in the blackwork tattoo-flash style of IMAGE 2. The object: Procreate, shown as an index tab sticking out of the top of a canvas card that carries one painted brush stroke.
BACKGROUND: perfectly flat jade #4F9C80, edge to edge. PALETTE: ink #17101B, tomato #FF4B2B, marigold #FFB81C, cream #FFF2DA, nothing else.
PARTS (each one separate, complete, upright, at least 6% of empty background between all of them):
1. A canvas card: a blank landscape card (about 5:4) in cream with a thick black outline, a thin second black frame line inside it and rounded corners; nothing painted on it.
2. A brush stroke: one thick, wavy S-shaped paint stroke in tomato with a thick black outline and a cream highlight streak, round ends, one end finishing in a small teardrop splatter, about 70% of the card's width, drawn alone.
3. An index tab: a rounded plastic tab (about 60% of the card's width and a quarter of its height) in marigold with a thick black outline, flat at the bottom, with a small four-point star on it.
4. The blank ribbon banner, completely empty.
Original twist: the brush stroke is as bold as a tattoo line.
Must read at a glance: a card, a painted stroke and a tab.
Add nothing else. Square 1024x1024, flat jade background, no text.
```

**TK-04 Nomad Sculpt. IMAGE 1 = `OBJ-04.png`**

```text
IMAGE 1 is attached first (OBJ-04.png, the current object) and IMAGE 2 second (the style reference).

Redraw IMAGE 1 as a PARTS SHEET in the blackwork tattoo-flash style of IMAGE 2. The object: Nomad Sculpt, shown as a lump of clay with thumbprints, a wire loop sculpting tool and a little flag on a toothpick.
BACKGROUND: perfectly flat jade #4F9C80, edge to edge. PALETTE: ink #17101B, tomato #FF4B2B, marigold #FFB81C, cream #FFF2DA, nothing else.
PARTS (each one separate, complete, upright, at least 6% of empty background between all of them):
1. The clay lump: a fat, rough, rounded blob in tomato with a thick black outline, three thumbprint dents drawn as solid black ovals with a cream rim, a cream highlight streak and a flat base.
2. The wire loop tool, lying horizontally: a long rounded marigold wooden handle with black stripes on the left and a black wire oval loop at the right end.
3. The flag: a thin upright toothpick (marigold, thick black outline) carrying a small triangular cream flag with a black star on it.
4. The blank ribbon banner, completely empty.
Original twist: the clay has a tiny black tattoo-style swirl scar on one side.
Must read at a glance: clay, a sculpting tool and a flag.
Add nothing else. Square 1024x1024, flat jade background, no text.
```

**TK-05 AI tools. IMAGE 1 = `OBJ-05.png`**

```text
IMAGE 1 is attached first (OBJ-05.png, the current object) and IMAGE 2 second (the style reference).

Redraw IMAGE 1 as a PARTS SHEET in the blackwork tattoo-flash style of IMAGE 2. The object: AI tools, shown as a luggage tag with a grid of four variations, one of them picked with a tick.
BACKGROUND: perfectly flat jade #4F9C80, edge to edge. PALETTE: ink #17101B, tomato #FF4B2B, marigold #FFB81C, cream #FFF2DA, nothing else.
PARTS (each one separate, complete, upright, at least 6% of empty background between all of them):
1. The luggage tag with its string, as one piece: a cream tag with clipped top corners and a round hole, a thick black outline, and a loop of black string through the hole; inside the tag a 2 by 2 grid of four small framed squares, each with its own tattoo symbol: a tomato heart, a marigold star, a cream eye on black, an ink-black lightning bolt on marigold. The tag has no tick on it.
2. A tick: one bold hand-drawn check mark with a thick black outline and a marigold fill, drawn alone.
3. The blank ribbon banner, completely empty.
Original twist: the four symbols read like four tattoo flash options to pick from.
Must read at a glance: a tag with four options and a tick.
Add nothing else. Square 1024x1024, flat jade background, no text.
```

**TK-06 Pinterest. IMAGE 1 = `OBJ-06.png`**

```text
IMAGE 1 is attached first (OBJ-06.png, the current object) and IMAGE 2 second (the style reference).

Redraw IMAGE 1 as a PARTS SHEET in the blackwork tattoo-flash style of IMAGE 2. The object: Pinterest, shown as a reference card held up with a push pin.
BACKGROUND: perfectly flat jade #4F9C80, edge to edge. PALETTE: ink #17101B, tomato #FF4B2B, marigold #FFB81C, cream #FFF2DA, nothing else.
PARTS (each one separate, complete, upright, at least 6% of empty background between all of them):
1. The reference card: an upright photo card (about 4:5) with a thick cream border and a thick black outline, and a flash scene in the picture: a big tomato sun over a solid black mountain, a marigold sky and cream wave lines at the bottom.
2. The push pin: a round-headed pin seen from above at a slight angle, a tomato head with a cream highlight blob and a thick black outline, and a short black needle; drawn alone.
3. The blank ribbon banner, completely empty.
Original twist: the sun and the mountain are a nod to the reference poster, simple and bold.
Must read at a glance: a photo card and a push pin.
Add nothing else. Square 1024x1024, flat jade background, no text.
```

**TK-07 VS Code. IMAGE 1 = `OBJ-07.png`**

```text
IMAGE 1 is attached first (OBJ-07.png, the current object) and IMAGE 2 second (the style reference). In IMAGE 1 the curly braces and the lettering were removed; the key carries a pair of curly braces.

Redraw IMAGE 1 as a PARTS SHEET in the blackwork tattoo-flash style of IMAGE 2. The object: VS Code, shown as a keyboard key with a pair of curly braces on it.
BACKGROUND: perfectly flat jade #4F9C80, edge to edge. PALETTE: ink #17101B, tomato #FF4B2B, marigold #FFB81C, cream #FFF2DA, nothing else.
PARTS (each one separate, complete, upright, at least 6% of empty background between all of them):
1. The key base: the chunky lower body of a keyboard key seen from the front, a wide rounded block in solid ink black with a thin cream edge line and two small cream highlight dashes.
2. The key cap: a rounded-square key top in cream with a thick black outline and a thin inner frame line, completely blank.
3. The curly braces: a pair of bold hand-drawn curly braces, two separate shapes, in tomato with a thick black outline and a cream highlight streak.
4. The blank ribbon banner, completely empty.
Original twist: a few small marigold sparkle ticks on the key base.
Must read at a glance: a key and two curly braces.
Add nothing else. Square 1024x1024, flat jade background, no text.
```

**BIN-01 The bin of discarded thumbnails. IMAGE 1 = `OBJ-BIN.png`**

```text
IMAGE 1 is attached first (OBJ-BIN.png, the current object) and IMAGE 2 second (the style reference).

Redraw IMAGE 1 as ONE single illustration (not a parts sheet, no banner) in the blackwork tattoo-flash style of IMAGE 2. The object: a small wire waste-paper basket full of discarded thumbnails.
BACKGROUND: perfectly flat jade #4F9C80, edge to edge. PALETTE: ink #17101B, tomato #FF4B2B, marigold #FFB81C, cream #FFF2DA, nothing else.
WHAT TO DRAW (keep the layout of IMAGE 1):
- The basket as a solid ink-black trapezoid with a thick cream rim and a cream wire mesh grid.
- Three crumpled paper balls sitting above the rim (cream, marigold and cream) with black crease lines.
- A sheet of paper leaning on the rim, with a devil-head sketch on it (a round head with two horns) crossed out by a big tomato X.
- A few small cream wisps and a four-point star flying out of the basket.
Original twist: one of the crumpled balls shows a tiny skull doodle.
Must read at a glance: a basket of rejected sketches.
Fill about 90% of the canvas, centred. Add nothing else. Square 1024x1024, flat jade background, no text.
```

### One-line fixes to paste when a result is off

- Parts touch or overlap: `Redraw it as a parts sheet: every part fully separate and complete, with at least 6% of the canvas width of empty background between any two parts and from the edges.`
- A part is missing or extra: `Exactly the parts listed, nothing else, and the blank ribbon banner.`
- Parts are tilted: `Every part upright and square-on to the viewer, no tilt and no perspective.`
- Not tattoo enough: `More old-school tattoo flash: heavier black outlines with a thick-and-thin weight, big solid black shapes, flat colour slightly out of register, no gradients.`
- Colours drifted: `Only ink black, tomato, marigold and cream on the jade background, nothing else.`
- Text appeared (the banner or a part): `Remove all lettering: the ribbon banner must be completely empty.`
- Wrong scale between parts: `Keep the parts at the scale they have in IMAGE 1, so that together they form that object.`

## ST: the nine Sticker Sheet characters (restyle in the lilac selfie-sticker style)

**v8 (2026-10-29).** Pau wants the nine characters of folder 10 redrawn in the style of his lilac selfie sticker (`_inbox/refs/STYLE-STICKER.jpg`): the character types, descriptions, poses, props and the whole page layout stay exactly as they are; only the illustration style changes. Strategy as for Process: **two references per prompt**. IMAGE 1 = the current sticker (`STK-01.png` .. `STK-09.png`, the live art on cream: says WHAT to draw), IMAGE 2 = the style reference (says HOW).

### What the style is (read from the reference)

One accent colour for the whole figure (skin, clothes, props) plus solid black; a smooth, confident black ink line (medium weight outside, finer inside); solid black masses (curly hair, shoes, belt, pupils); plaid, stripes and quilting drawn only as thin black lines inside the garments; folds as short curved strokes in groups of two or three; hands with four fingers and a thumb; chunky shoes with two-loop laces and a few accent-colour eyelet dots on the black; a die-cut halo of the same accent colour round the whole figure, filling the gaps between limbs and body; flat cream `#FFF0E0` background; no cream, white, shading, gradient or text anywhere inside. (The current set is busier: cream highlights on the cat and the pages, dotted stitching, lots of small marks.)

### How the pictures are filed (this decides the format)

Per `docs/api/world-illustration.md` ("How to replace the nine stickers"): a transparent 1200 x 1600 cut-out whose outermost edge is a solid flat accent-colour outline and nothing else round it; the world adds the white vinyl margin, the shadow, the ghost and the physics shape from the alpha. So ChatGPT draws the figure with its accent halo on flat cream, and `tools/ingest_stickers.py` (written when the images arrive) does: key out the cream (the figure never contains cream, so it is safe), re-colour the accent to the exact hex (the generated accent drifts), trim, fit into 1080 x 1480 (at least 60 px of margin) centred on 1200 x 1600, save `sticker-0N.webp` + `thumb-0N.webp` (300 x 400), run `build-shapes.py`, re-export the Works card art (`thumb.webp`, `peek.webp`, `art/sheet.webp`). Captions, accents, hexes, alt texts, slots on the sheet, the Arrange composition and the lid do not change.

| ID | Sticker | Accent | Reference for IMAGE 1 | Result file |
|---|---|---|---|---|
| ST-01 | Boombox ollie | lilac `#C6B1FE` | `STK-01.png` | `ST-01.png` |
| ST-02 | Just one more chapter | tangerine `#FFA65F` | `STK-02.png` | `ST-02.png` |
| ST-03 | Coffee first, pixels later | sky `#85CEF9` | `STK-03.png` | `ST-03.png` |
| ST-04 | Small me, big plant | mint `#8EEBC3` | `STK-04.png` | `ST-04.png` |
| ST-05 | Quiet on set! | butter `#FCE67A` | `STK-05.png` | `ST-05.png` |
| ST-06 | Case of the missing sock | tomato `#FE7D6C` | `STK-06.png` | `ST-06.png` |
| ST-07 | Tuft happens | pink `#FF9FC5` | `STK-07.png` | `ST-07.png` |
| ST-08 | Houston, we have bananas | teal `#66CBC7` | `STK-08.png` | `ST-08.png` |
| ST-09 | Headphones on, world off | lime `#C5EB7C` | `STK-09.png` | `ST-09.png` |

### Chat opening message (new chat, paste first, attach `STYLE-STICKER.jpg`)

```text
You will make NINE sticker illustrations for a portfolio website: nine invented characters that must look like one sticker set drawn by one illustrator. With every request I will attach TWO images: IMAGE 1 is the current sticker (it tells you WHAT to draw: the character, the pose, the props, the composition) and IMAGE 2 is the STYLE REFERENCE (it tells you HOW to draw it). The image attached now is the STYLE REFERENCE. Do not draw anything yet. Study it, reply "ready" and describe back to me, in six lines, what makes its style.

THE STYLE OF THE REFERENCE (copy how it is drawn, never its subject):
1. ONE COLOUR PLUS BLACK. Everything that is not black is ONE single accent colour, flat and opaque: skin, face, hands, clothes, props. Nothing is cream, white or a second colour. Each request gives the exact accent hex.
2. THE INK LINE. A smooth, confident, clean black ink line with a slight thick-and-thin variation and softly tapered ends: a medium weight for the outline of the figure (about 0.7% of the image height) and a finer weight, about half, for inner details. Closed shapes, curved and elegant. Not sketchy, not wobbly, not a fat marker.
3. SOLID BLACK MASSES. Hair is a big solid black mass with wavy curly edges, shoes are solid black with two-loop laces and a few eyelet dots left in the accent colour, belts, pupils, the inside of a mouth and the darkest small details are solid black. Nothing else is black-filled.
4. PATTERN AND FOLDS IN LINE ONLY. Plaid, stripes, quilting or stitching are thin black lines drawn inside the garment, hand-ruled and a little irregular, clipped to its shape. Folds are short curved strokes in groups of two or three at elbows, knees, cuffs and hems. Ribbed cuffs are short parallel lines. No hatching for shading, no tone, no fill changes.
5. THE FIGURES. Stylised and elegant: small head, long limbs, oversized clothes with big soft volumes, a dynamic slightly off-balance gesture. Faces are very simple: two dot eyes or closed arcs, a short eyebrow, a small curved nose line, a smiling mouth, an ear. Hands are big and readable, four fingers and a thumb. Chunky shoes.
6. THE DIE-CUT HALO. Round the whole sticker runs a halo of the SAME accent colour, an even width of about 3.5% of the image width, with a smooth rounded contour. It fills the small gaps between limbs and body (under an arm, between the legs) so the sticker is one solid shape. The halo has no outline and no other border.
7. NOTHING ELSE. No shading, no gradient, no shadow, no texture, no glossy highlight, no white, no cream inside the figure, no text.

THE BACKGROUND. One flat cream #FFF0E0, edge to edge, exactly like the reference. Nothing else on it.

THE FORMAT. Portrait. The sticker, halo included, fills about 85% of the height, centred, with at least 8% of empty cream on every side.

THE RULE FOR EVERY REQUEST. IMAGE 1 is the layout: keep the same character, the same pose and gesture, the same props, the same number of objects, the same composition and the same overall silhouette. Keep its description. Do NOT copy how IMAGE 1 is drawn: it is a busier drawing with cream details and small marks; yours is cleaner, bolder and simpler, one colour plus black, as in IMAGE 2. Replace nothing with something else and add nothing that is not in IMAGE 1.

With every request I will attach the current sticker (IMAGE 1) and the style reference (IMAGE 2).
```

### The nine prompts (one message each: attach the sticker as IMAGE 1 and `STYLE-STICKER.jpg` as IMAGE 2)

**ST-01 Boombox ollie. IMAGE 1 = `STK-01.png`**

```text
IMAGE 1 is attached first (STK-01.png, the current sticker) and IMAGE 2 second (the style reference).

Redraw IMAGE 1, sticker "Boombox ollie", in the style of IMAGE 2. Same character, same pose, same props, same composition; only the way it is drawn changes.
ACCENT COLOUR: lilac #C6B1FE for everything that is not black, and for the die-cut halo.
WHAT IMAGE 1 SHOWS (keep all of it): a skater caught mid-ollie with the whole board tilted in the air. A black beanie with a folded cuff and a pompom, long wavy black hair under it, a wide open grin. The arm on the viewer's left is raised with a rock-on hand (index and little finger up, thumb out). The other arm holds a boombox on the shoulder (a rectangular radio with two big round speakers with concentric rings, a cassette window, a carry handle, a short antenna) and two music notes float above it. An oversized sweater with five vertical equalizer bars on the chest, a black belt, baggy plaid trousers with a small star patch on one knee, chunky black sneakers. The skateboard is seen from the side with a kicked tail and four wheels.
STYLE FOR THIS ONE: the plaid of the trousers as thin black ruled lines like the jacket in IMAGE 2, folds in groups of two or three strokes at the elbows and knees, solid black beanie, hair and shoes, the equalizer bars as solid black bars.
Format: portrait, flat cream #FFF0E0 background, the sticker with its halo about 85% of the height, no text.
```

**ST-02 Just one more chapter. IMAGE 1 = `STK-02.png`**

```text
IMAGE 1 is attached first (STK-02.png, the current sticker) and IMAGE 2 second (the style reference).

Redraw IMAGE 1, sticker "Just one more chapter", in the style of IMAGE 2. Same character, same pose, same props, same composition; only the way it is drawn changes.
ACCENT COLOUR: tangerine #FFA65F for everything that is not black, and for the die-cut halo.
WHAT IMAGE 1 SHOWS (keep all of it): a cosy reader sitting cross-legged on top of a tall tower of five books of different sizes (spines with simple stripes and small diamond marks), a tiny mug with a heart beside the lower books. The reader has hair in a bun with a pencil stuck through it, round glasses, closed smiling eyes, a heart floating at the left and three small z shapes rising at the right. A chunky cable-knit sweater with a rolled turtleneck. Both hands hold an open hardback with a moon and a star on its cover. A sleeping black cat curls on their lap, with closed eyes and a small smile, and its tiny paws.
STYLE FOR THIS ONE: the cable-knit as thin black braided lines clipped inside the sweater, folds at the elbows and the crossed knees, the cat as a solid black shape with its paws left in the accent colour with a black outline (no cream), the bun and pencil in solid black and line.
Format: portrait, flat cream #FFF0E0 background, the sticker with its halo about 85% of the height, no text.
```

**ST-03 Coffee first, pixels later. IMAGE 1 = `STK-03.png`**

```text
IMAGE 1 is attached first (STK-03.png, the current sticker) and IMAGE 2 second (the style reference).

Redraw IMAGE 1, sticker "Coffee first, pixels later", in the style of IMAGE 2. Same character, same pose, same props, same composition; only the way it is drawn changes.
ACCENT COLOUR: sky blue #85CEF9 for everything that is not black, and for the die-cut halo.
WHAT IMAGE 1 SHOWS (keep all of it): a curly-haired designer in dungarees standing and hugging a paper coffee cup as tall as themselves (a cup with a lid, a sleeve with a vertical-stripe pattern and a round coffee-bean icon), cheek resting on the lid with closed contented eyes, wavy steam lines rising above, a pencil behind the ear. A ruler and pens in the dungarees chest pocket, rolled-up trousers, chunky black sneakers. A drawing tablet in a thick frame leans against their legs, showing a bezier curve with two handle points and three tiny round buttons, a stylus lying on it.
STYLE FOR THIS ONE: curly hair as a big solid black mass with wavy edges, the dungaree stitching and seams as thin black lines, folds at the elbows, hem and knees, the cup sleeve stripes as black lines, the tablet frame as a thick black outline with the screen in the accent colour.
Format: portrait, flat cream #FFF0E0 background, the sticker with its halo about 85% of the height, no text.
```

**ST-04 Small me, big plant. IMAGE 1 = `STK-04.png`**

```text
IMAGE 1 is attached first (STK-04.png, the current sticker) and IMAGE 2 second (the style reference).

Redraw IMAGE 1, sticker "Small me, big plant", in the style of IMAGE 2. Same character, same pose, same props, same composition; only the way it is drawn changes.
ACCENT COLOUR: mint #8EEBC3 for everything that is not black, and for the die-cut halo.
WHAT IMAGE 1 SHOWS (keep all of it): a small gardener staggering forward under a huge pot (a rolled rim and a black zigzag pattern band around it) holding a monstera three times their height: big split leaves with their holes and veins as thin lines, and one small snail with a spiral shell riding on a leaf. The gardener wears a polka-dot bandana tied on the head with two tails, has a surprised open mouth and round eyes looking up, a utility belt with a trowel and small tools, rolled-up trousers and rubber boots caught mid-step. A couple of small four-point sparkle stars.
STYLE FOR THIS ONE: the pot as a solid black band with the zigzag left in the accent colour, the leaf veins as thin black lines, the polka dots of the bandana as small solid black dots, boots solid black with eyelet dots in the accent colour, folds at the knees and the elbows.
Format: portrait, flat cream #FFF0E0 background, the sticker with its halo about 85% of the height, no text.
```

**ST-05 Quiet on set! IMAGE 1 = `STK-05.png`**

```text
IMAGE 1 is attached first (STK-05.png, the current sticker) and IMAGE 2 second (the style reference).

Redraw IMAGE 1, sticker "Quiet on set!", in the style of IMAGE 2. Same character, same pose, same props, same composition; only the way it is drawn changes.
ACCENT COLOUR: butter yellow #FCE67A for everything that is not black, and for the die-cut halo.
WHAT IMAGE 1 SHOWS (keep all of it): a film director stepping up with one foot on a wooden apple crate (slats and an apple icon on its side). A beret on the head, sunglasses, the mouth wide open shouting into a big cone megaphone held with one hand, the other arm raised holding a clapperboard (a hinged clapper stick with diagonal stripes and a grid of lines on the board, no text). A long striped scarf flying behind, suspenders with a film-reel badge on the chest, high boots. An exclamation mark and a small sparkle float near the megaphone.
STYLE FOR THIS ONE: sunglasses as solid black, the clapper stripes and the scarf stripes as solid black bands, boots solid black, the crate slats as black lines, folds at the elbows and knees.
Format: portrait, flat cream #FFF0E0 background, the sticker with its halo about 85% of the height, no text.
```

**ST-06 Case of the missing sock. IMAGE 1 = `STK-06.png`**

```text
IMAGE 1 is attached first (STK-06.png, the current sticker) and IMAGE 2 second (the style reference).

Redraw IMAGE 1, sticker "Case of the missing sock", in the style of IMAGE 2. Same character, same pose, same props, same composition; only the way it is drawn changes.
ACCENT COLOUR: tomato #FE7D6C for everything that is not black, and for the die-cut halo.
WHAT IMAGE 1 SHOWS (keep all of it): a detective in a double-breasted trench coat (two rows of buttons, a belt, the collar up) and a fedora with a band, creeping forward on tiptoe. One hand holds a huge magnifying glass up to the face so that one eye looks gigantic inside the lens (a big almond with an iris and a highlight). A question mark floats at the top left. The other hand pinches a single striped sock held out as evidence. The detective's own legs wear striped socks and chunky shoes.
STYLE FOR THIS ONE: the big eye inside the lens with a solid black iris, the sock and the socks with solid black stripes, fedora band, belt and shoes solid black, the coat folds in groups of two or three strokes, plaid-like thin lines are not needed on the coat.
Format: portrait, flat cream #FFF0E0 background, the sticker with its halo about 85% of the height, no text.
```

**ST-07 Tuft happens. IMAGE 1 = `STK-07.png`**

```text
IMAGE 1 is attached first (STK-07.png, the current sticker) and IMAGE 2 second (the style reference).

Redraw IMAGE 1, sticker "Tuft happens", in the style of IMAGE 2. Same character, same pose, same props, same composition; only the way it is drawn changes.
ACCENT COLOUR: pink #FF9FC5 for everything that is not black, and for the die-cut halo.
WHAT IMAGE 1 SHOWS (keep all of it): a rug maker kneeling at a big upright wooden frame that holds a stretched canvas with a half-finished mushroom rug (a spotted mushroom cap on a stem, a field of small plus signs) and a few cone-shaped yarn spools at the foot of the frame. The rug maker wears goggles pushed up on a striped headband, sticks the tongue out in concentration, wears dungarees over a long-sleeved top and a belt with small tools, and holds a chunky tufting gun (a grip, a motor, a needle nose) with a power cable looping to the floor. A ball of yarn with a trailing thread flies at the top right, and a few fibre tufts fly off.
STYLE FOR THIS ONE: the field of plus signs and the mushroom spots as thin black marks, the headband stripes as solid black, the tufting gun body solid black, the cable as one thick looping black line, folds at the knees, elbows and dungaree straps, boots solid black with eyelet dots in the accent colour.
Format: portrait, flat cream #FFF0E0 background, the sticker with its halo about 85% of the height, no text.
```

**ST-08 Houston, we have bananas. IMAGE 1 = `STK-08.png`**

```text
IMAGE 1 is attached first (STK-08.png, the current sticker) and IMAGE 2 second (the style reference).

Redraw IMAGE 1, sticker "Houston, we have bananas", in the style of IMAGE 2. Same character, same pose, same props, same composition; only the way it is drawn changes.
ACCENT COLOUR: teal #66CBC7 for everything that is not black, and for the die-cut halo.
WHAT IMAGE 1 SHOWS (keep all of it): a monkey in a puffy spacesuit floating weightless, the body twisted. A big round glass helmet with a ribbed collar shows a grinning monkey face (round ears, big eyes, a wide smile). A chest control panel with a small heartbeat line, a coiled hose, a utility belt. One gloved hand holds up a bunch of bananas, the other waves. A long curly tail ends in a tiny glove. A ringed planet floats at the top left and a few four-point stars and sparkles around.
STYLE FOR THIS ONE: the monkey face with a solid black fur cap, nose and mouth in line and a black mouth interior, the glass of the helmet in the accent colour with two short curved reflection strokes, the suit folds in groups of two or three strokes, the collar rings and cuffs as parallel short lines, boots and gloves' cuffs solid black, the bananas as outlined accent shapes with black tips.
Format: portrait, flat cream #FFF0E0 background, the sticker with its halo about 85% of the height, no text.
```

**ST-09 Headphones on, world off. IMAGE 1 = `STK-09.png`**

```text
IMAGE 1 is attached first (STK-09.png, the current sticker) and IMAGE 2 second (the style reference).

Redraw IMAGE 1, sticker "Headphones on, world off", in the style of IMAGE 2. Same character, same pose, same props, same composition; only the way it is drawn changes.
ACCENT COLOUR: lime #C5EB7C for everything that is not black, and for the die-cut halo.
WHAT IMAGE 1 SHOWS (keep all of it): a dancer laughing with eyes closed, over-ear headphones on a headband, a long ponytail whipping through the air. An oversized track jacket with a star on the chest and a stripe running along the sleeves, trousers with a stripe down the leg (two parallel lines) and a patch on one knee. The dancer balances on the toe of one chunky sneaker with the other leg kicked up high. One arm is raised with a pointing finger, the other hand is open. Small motion lines and sparkles around.
STYLE FOR THIS ONE: ponytail and headphone pads as solid black masses, the star on the chest solid black, the stripes as two thin black lines or one solid black band, folds at the elbows and the bent knee, sneakers solid black with eyelet dots in the accent colour.
Format: portrait, flat cream #FFF0E0 background, the sticker with its halo about 85% of the height, no text.
```

### One-line fixes to paste when a result is off

- Cream or white inside the figure: `No cream or white anywhere inside the figure: every area that is not black is the single accent colour, flat.`
- A second colour crept in: `One accent colour only, plus solid black. Everything that is not black is exactly the accent colour.`
- Halo missing, uneven or white: `Add the die-cut halo: the same accent colour as the figure, an even width of about 3.5% of the image width, smooth contour, filling the gaps between limbs and body, no outline, not white.`
- Too busy or too like IMAGE 1: `Simpler and cleaner, like IMAGE 2: fewer small marks, a smooth confident black line, solid black masses, pattern as thin lines only. Do not copy how IMAGE 1 is drawn.`
- Wobbly or sketchy line: `A smooth, clean, confident ink line with slightly tapered ends, not wobbly, not sketchy.`
- Shading, texture or shine: `Completely flat: no shading, gradient, texture, shadow or glossy highlight.`
- The character changed: `You changed the character. Redraw IMAGE 1 exactly: the same character, pose, props and composition. Only the way it is drawn changes.`
- Text appeared: `Remove all lettering: no letters, numbers or logos anywhere.`
- Sticker cut at the edge or too small: `The whole sticker with its halo fully inside the picture, about 85% of the height, at least 8% of empty cream margin on every side.`

## PF

Open. Pau gives the art direction and references, then the prompts are written like the CAT, PR, TK and ST sets. The IDs, the file names and the filing procedure stay as before:

- `PF-NN` becomes `public/works/concept-portfolio/art/slide-N.webp` (1080x1920) plus the derived sheet, contact sheet, thumb, peek and card art.
