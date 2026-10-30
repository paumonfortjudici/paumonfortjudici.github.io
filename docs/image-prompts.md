# Image prompts for ChatGPT (and how the images come back)

Version 4 (2026-10-29), the definitive Catalog set. Pau threw away three earlier directions (flat riso colour, five-reference graphite, one-reference graphite) and fixed the brief:

- The style master is the flat felt-tip marker figure (orange hoodie, cobalt line, pink laces): `_inbox/refs/STYLE-MASTER.jpg`.
- Each Catalog sketch is a **simple sketch in exactly 4 colours**, chosen to contrast with the colour of its folder.
- No character is required, and the ten do **not** share a structure: same artistic hand, a different idea and composition each, "as if one artist had designed each folder one by one".
- They are not a small motif any more: each is a **wide frieze behind the title of its folder**, at low opacity, filling much of the horizontal band.

Version 12 adds the PF plan B (the five slides built from separate hand-made pieces, 29 prompts, composed here). Version 9 added PF (the five slides of folder 09 redrawn as an indie comic, with a character model sheet ONA-00). Version 8 added ST (the nine Sticker Sheet characters restyled like Pau's lilac selfie sticker, two references per prompt). Version 7 added TK (the seven "On my desk" icons as animatable parts sheets, plus the bin, in blackwork tattoo style: see the TK section). Version 6 added PR (the four Process scenes: a restyle of the scenes already on the site, two references per prompt). PF and ST are still open: they get their prompts when Pau gives the direction for each category.

## The system

Every image has an ID: `AREA-NN`. Save the result with the ID as its name in `C:\Users\User\Documents\Portofolio\_inbox\` (git ignores that folder). If you make several versions add a letter: `CAT-04b.png`.

| Area | IDs | What it replaces | Status |
|---|---|---|---|
| `CAT` | CAT-01 .. CAT-10 | the grey sketch next to each name in the Catalog, now a faint full-width background of the folder | **defined below (v4)** |
| `PF` | ONA-00, PF-01 .. PF-05 | the five slides of folder 09 (A Portfolio for a Client) as an indie comic, plus the character model sheet | **defined below (v9)** |
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

## PF: the five slides of "A Portfolio for a Client" (comic-cover restyle, Ona Ribas)

**v9 (2026-10-29).** Pau wants folder 09 to be a showpiece (he is starting a freelance business of making portfolios): the same five slides, the same layouts, the same copy, but drawn like an indie comic: hand-inked, scratchy, crowded with meaningful detail and small easter eggs, as if an artist had drawn it on paper and then painted it digitally. References: three hand-drawn gig posters (`_inbox/refs/STYLE-COMIC-1.jpg`, `-2.jpg`, `-3.jpg`). The prompts describe how they are drawn and never name or copy their subjects, characters, compositions or lettering.

### Strategy

- **The deck's own palette stays** (teal / butter / deep teal fields, tomato, sun yellow, lilac, periwinkle, celery, steel, salmon, paper, ink `#101820`), so the palette card of the "About Ona" panel, the design notes and the folder colour stay true. What changes is how the palette is used (flat, off-register, halftone, hatching).
- **Per prompt, attach**: IMAGE 1 = the current slide (`SLD-01.png` .. `SLD-05.png`: layout and content to keep), the three style references, and for slides 02, 04 and 05 Ona's model sheet (`ONA-00.png`, generated first).
- **Text (hybrid).** ChatGPT cannot be trusted with the bio, the timeline or the contact card. So it draws only (a) the huge hand-cut **titles**, spelled exactly, and (b) the short **sound words** (SNAP!, CRUNCH!, CLIP-CLOP!, WHEEE!, CREAK, THUMP!, BYE!) in bursts. Every other text container (caption boxes, tags, strips, the contact card) is drawn **completely empty**, and the real copy is set by us afterwards, in real type, so it is exact and sharp. The header and footer bands are left clean for the small header and footer rows.
- **Format**: 9:16, 1080 x 1920. If ChatGPT can only give 2:3, the ingest pads the field top and bottom (the bands are clean for that).
- **Ona is fixed by a model sheet** (`ONA-00`: Ona in three poses, expressions, hands, boots, the furry mic ("dead cat"), the black cat, the duffel, the neighbour). Generate it first, approve it, then attach it to slides 02, 04 and 05.
- **Recurring easter-egg system** (it makes the deck one story): the black cat appears in every slide (alive inside the mic's fur on 01, a tail and eyes on 02, a tiny watcher on 03, asleep on a speaker on 04, riding the duffel on 05); the patient neighbour (a tiny man in a dressing gown with ear muffs) appears on 02 and 05; "ona" means wave in Catalan, so tiny wave curls hide in the art; numbers that mean something (six kilos of salt, eight episodes, sixteen titles, 22 films); objects that connect slides (the three project polaroids on the wall of slide 04). The world's Loupe tool ("Tiny print? Try the loupe") is how a visitor finds them.

### What happens after the images arrive

`tools/ingest_slides.py` fits each image to 1080 x 1920 (padding the clean bands if needed), I compose the real text into the empty containers with Chrome (comic-lettering faces for titles of small print, to be chosen with Pau: the deck's Syne / DM Sans / Anybody are replaced and the fonts card of the "About Ona" panel is updated), save `slide-N.webp`, rebuild `sheet.webp`, `contact-sheet.webp`, `thumb.webp`, `art/thumb.webp`, the Works / cover card art and `peek.webp`, and **re-measure every pin and every sound hotspot on the new art** (`src/worlds/concept-portfolio/data.ts`), rewriting the design notes and the alt texts so they describe what is drawn.

### Files

| ID | What | Reference as IMAGE 1 | Also attach | Result file |
|---|---|---|---|---|
| ONA-00 | Model sheet: cast and props | none | the 3 posters | `ONA-00.png` |
| PF-01 | Cover (teal): FOLEY PORTFOLIO | `SLD-01.png` | the 3 posters | `PF-01.png` |
| PF-02 | About (butter): I'M ONA RIBAS | `SLD-02.png` | the 3 posters + `ONA-00.png` | `PF-02.png` |
| PF-03 | Projects (deep teal): SELECTED PROJECTS | `SLD-03.png` | the 3 posters | `PF-03.png` |
| PF-04 | Experience (butter): EXPERIENCE & EDUCATION | `SLD-04.png` | the 3 posters + `ONA-00.png` | `PF-04.png` |
| PF-05 | Contact (teal): THANKS FOR LISTENING | `SLD-05.png` | the 3 posters + `ONA-00.png` | `PF-05.png` |

### Chat opening message (new chat, paste first, attach the three posters `STYLE-COMIC-1.jpg`, `-2.jpg`, `-3.jpg`)

```text
You will illustrate FIVE portrait slides (9:16) for a portfolio deck of an invented client: Ona Ribas, a foley artist and sound designer from Girona. Together they must read as the pages of one indie comic, a comic cover and four comic pages, drawn by one artist. With every request I will attach IMAGE 1 (the current slide: the layout, the content and the composition to keep) and the THREE STYLE REFERENCES (hand-drawn gig posters: they tell you HOW to draw). The three images attached now are the STYLE REFERENCES. Do not draw anything yet. Study them, reply "ready" and describe back to me, in eight lines, what makes their style.

THE STYLE OF THE POSTERS (copy how they are drawn; never their subjects, characters, compositions, texts or signatures):
1. HAND-INKED LINEWORK. Everything is drawn with a lively dip-pen or brush-pen line of changing weight: thick (about 8 to 14 px on a 1080 x 1920 slide) on outer silhouettes and on the shadow side, thin (2 to 4 px) for inner details. Lines wobble a little, overshoot corners, cross, double up where the artist corrected them and end in tapered flicks. Never vector-clean. A few thin leftover pencil construction lines (blue-grey or pink) may show under the colour here and there.
2. SCRATCHY SHADING. Shadows are dense hatching, cross-hatching and short speed strokes in the ink colour, plus patches of coarse halftone dots (Ben-Day) in a darker or lighter tone of the local colour, on the shadow side of objects and across large background areas. No smooth gradients, no airbrush, no 3D-render look.
3. FLAT COLOUR PAINTED UNDER THE LINES, SLIGHTLY OFF-REGISTER. Flat opaque fills, two or three tones per object (a base, one darker shade, one light highlight shape), deliberately not aligned with the linework: a fill may stop short of a line or spill over it, like a risograph print or a digital paint layer under a scanned drawing. A fine paper grain and dry-brush speckle over everything.
4. A LIMITED PALETTE USED BOLDLY. Each slide uses 5 or 6 of these colours plus ink, in big flat fields with strong value contrast, one dominant field colour and one hot accent: teal #007E9B, deep teal #1B6885, butter #FDEFAF, steel #63A0AC, paper #F6F0DC, sun yellow #F2C62F, tomato #E8553E, salmon #F2A29A, lilac #B58AD6, periwinkle #7A8CE8, celery #9CCF9A. The ink is blue-black #101820, never pure black.
5. HAND-CUT TITLE LETTERING. Titles are huge chunky hand-lettered capitals, as if cut from paper or painted with a fat brush: letters of different widths and slightly different heights, a wobbling baseline, rough notched edges, lines stacked tightly so the title runs margin to margin. Every letter has a thick ink outline and a hard solid extruded shadow in ink going down and to the right, and sometimes a second offset colour behind it. Small sound words are lettered the same way, smaller, inside spiky comic bursts.
6. DENSE BUT ORGANISED, FULL OF CLUES. The pictures are crowded with information, and all of it has a reason: a clear hierarchy (title, hero scene, secondary scenes, quiet areas for small text), overlapping shapes at different scales, small props, four-point sparkles in ink and in sun yellow, music-note and sound-wave shapes, speed lines, sweat drops. Each slide hides small easter eggs: tiny funny details that make sense in foley work and in Ona's story (listed in each request). They are drawn small, with no caption.
7. COMIC-COVER ENERGY. Dramatic camera angles (low angle, foreshortening, big hands and boots near the viewer), characters breaking out of their frames, irregular hand-drawn panel borders, sound words, expressive faces with huge eyes and tiny pupils, sweat drops, band-aids. Playful, a little anarchic, warm.

WHAT IS NOT THE STYLE: clean vector illustration, flat sticker or app-icon art, smooth gradients, 3D renders, glossy or plastic shine, symmetrical corporate layouts, a stock-photo look, perfectly straight and even lines, pastel one-hue palettes.

THE FIXED CAST AND THE RECURRING MOTIFS (the same in every slide):
- ONA RIBAS, a young woman: dark curly hair as one big wavy ink mass with a few curls escaping, a small gold hoop earring, round cheeks with a blush, a big expressive mouth. She wears a LILAC sweater (#B58AD6) with big puffy sleeves, TOMATO dungarees (#E8553E) with a chest pocket and a rolled hem, ODD SOCKS (one celery green, one salmon pink), chunky black boots with cream soles, and yellow (#F2C62F) over-ear headphones. Comic proportions: a slightly big head, long legs, big expressive hands. She must look identical in every slide (her model sheet is attached when she appears).
- THE DEAD CAT: foley people call a furry microphone windscreen a "dead cat". It is a big cream-butter furry boom-microphone windscreen with two periwinkle straps. Its living joke: a small BLACK CAT with yellow eyes and a pink nose, who appears in every slide.
- FOOTPRINTS: boot prints with a wavy-line sole on every slide (steel, celery or butter, depending on the field).
- ONE YELLOW SUNBURST (#F2C62F) on every slide: hand-drawn spiky rays.
- SOUND BURSTS: spiky starburst balloons with short sound words.
- "ONA" means "wave" in Catalan: tiny wave curls hide in the art.
- THE PATIENT NEIGHBOUR: a tiny man in a dressing gown with ear muffs and bags under his eyes, who appears small in some slides.

TEXT RULES (very important): I will add all small and medium text myself, in real type.
- Draw the HUGE TITLE of each slide as hand-cut lettering, spelled EXACTLY as given in the request, with nothing added. Check every letter.
- Draw the short SOUND WORDS a request lists (SNAP!, CRUNCH!, CLIP-CLOP!, WHEEE!, CREAK, THUMP!, BYE!), spelled exactly, in comic lettering inside spiky bursts.
- Everything else is NOT text: caption boxes, paper strips, tags, ribbons, tickets, cards and speech bubbles are drawn COMPLETELY EMPTY (no letters, no numbers, no scribbles, no lines imitating writing), because I will write in them. Keep them large, flat and uncluttered, with a hand-inked border, so text can sit on them. The only exceptions are the tiny words a request names on a prop.
- Never invent words, labels, logos, brand names, signatures or watermarks.

LAYOUT RULES: 9:16, 1080 x 1920 px (if you cannot output 9:16, make it as tall as you can with the same proportions and never crop the lettering). The art runs edge to edge. Keep a clean HEADER BAND (the top 6%) and a clean FOOTER BAND (the bottom 7%) in the field colour with paper grain and halftone only, for my small header and footer text (only footprints may run along the very bottom edge).

THE RULE FOR EVERY REQUEST: IMAGE 1 is the layout to keep: the same field colour, the same title position and size (margin to margin), the same elements in roughly the same zones, the same reading order and hierarchy. You are redrawing it as a comic cover or a comic page. Do NOT copy how IMAGE 1 is drawn (it is a clean flat slide): draw everything in the hand-inked comic style above. Keep its characters, props and story, and add the hidden details I list.

With every request I will attach the current slide (IMAGE 1), the three style references and, when Ona appears, her model sheet.
```

### The six prompts

**ONA-00 The cast and props model sheet (generate this first, same chat, attach the three posters)**

```text
Attach the three style references. Draw a MODEL SHEET of the cast and props of the deck, in the hand-inked comic style of the references (scratchy ink line, hatching, halftone, off-register flat colour, paper grain).
FORMAT: landscape 3:2 (1536 x 1024), flat paper background #F6F0DC with paper grain, no frame. NO TEXT of any kind: no labels, no names, no numbers.
LAYOUT OF THE SHEET:
1. LEFT HALF, ONA RIBAS full body, three poses side by side, each about 75% of the sheet height: (a) front view, standing, hands on hips, a cheerful grin; (b) three-quarter view mid-step walking away, looking back over her shoulder, one hand waving, a big smile; (c) a low-angle, foreshortened comic pose: right knee kicked up towards the viewer (a huge boot in the foreground), clapping two coconut halves together, mouth wide open laughing, eyes squeezed shut.
   ONA: a young woman, dark curly hair drawn as one big wavy solid-ink mass with a few curls escaping, a small gold hoop earring, round cheeks with a salmon blush, big expressive mouth, a tiny nose. Comic proportions: a slightly big head, long legs, big expressive hands with four fingers and a thumb. LILAC sweater #B58AD6 with big puffy sleeves and ribbed cuffs. TOMATO dungarees #E8553E with a chest pocket with a button, rolled hems and a visible side stitch line. ODD SOCKS: one celery green #9CCF9A, one salmon #F2A29A. Chunky black boots with cream soles, thick laces, a scuffed toe. Yellow #F2C62F over-ear headphones (around her neck in a, on her head in c).
2. TOP RIGHT, a row of six heads of Ona with six expressions: laughing, gasping with a sweat drop, concentrating with her tongue out, sleepy, a mischievous grin, a goodbye smile.
3. MIDDLE RIGHT, four hands: clapping two coconut halves, holding a boom pole, waving, one flat on a mixing-console fader. And one boot and odd sock close-up, stomping.
4. THE DEAD CAT: a big furry boom-microphone windscreen in cream-butter, drawn with hundreds of ink-edged tufts and hatched shadows, two periwinkle #7A8CE8 straps with rivets, a deep-teal shock-mount handle, a short boom pole and a braided cable ending in a plug. Next to it a small version of the same.
5. THE BLACK CAT: a small black cat with big yellow eyes with slit pupils, a pink nose, white whisker lines, in three poses (sitting, asleep curled up, peeking over an edge with only its eyes and ears showing).
6. THE DUFFEL: a periwinkle duffel bag with buckled straps, a celery stalk and a coconut half sticking out of it.
7. THE PATIENT NEIGHBOUR: a tiny man in a striped dressing gown and slippers, big ear muffs, bags under his eyes, holding a steaming mug, a tired smile.
8. BOTTOM EDGE, a row of 12 round colour swatches of the deck palette (no text), and one boot-print trail with wavy-line soles.
Everything separate with clear space, nothing overlapping.
```

**PF-01 Cover. IMAGE 1 = `SLD-01.png`, plus the three posters**

```text
IMAGE 1 is attached first (SLD-01.png, the current cover). The three style references follow.

Redraw IMAGE 1 as the COVER of an indie comic, in the hand-inked comic style of the references. Slide 1 of 5, teal field #007E9B with halftone patches in deep teal #1B6885 and steel #63A0AC. 9:16.
ZONES (percent of the height): 0 to 6 clean header band; 6 to 31 the title; 31 to 82 the hero scene; 82 to 93 the caption box and the seal; 93 to 100 clean footer band with footprints along the very bottom edge.
TITLE: two lines of huge hand-cut capitals, exactly "FOLEY" and then "PORTFOLIO", each line running margin to margin. Letters of different widths and heights (the F very wide, the O narrower, the L tall and narrow, the E medium, the Y wide), a wobbling baseline, rough notched edges. Butter fill #FDEFAF, thick ink outline, a hard solid ink extruded shadow down-right, and a thin tomato offset behind it.
HERO (the middle of the cover): a GIANT FURRY BOOM-MICROPHONE WINDSCREEN (the dead cat) bursting towards the viewer along a diagonal, seen from a low angle with strong foreshortening, filling about 60% of the width. Hundreds of spiky ink-edged tufts in butter and cream, shadow side hatched in deep teal and halftone-dotted in salmon, a lit side with white-cream highlight tufts. Two periwinkle straps with rivets, a deep-teal shock-mount handle, a thick braided cable looping out to the lower right and ending in a plug. Behind it a big hand-drawn yellow sunburst with long irregular rays, and deep-teal waveform bars radiating like the stripes of a road in perspective. Speed lines and four-point sparkles in ink and sun yellow. Entering from the bottom-right edge, Ona's two forearms in lilac puffy sleeves with ribbed cuffs, gripping the boom pole (hands only, comic off-panel).
SOUND BURSTS (spiky balloons with hard shadows): "SNAP!" in a sun-yellow burst at the top right (x 72 to 95%, y 33 to 41%); "CRUNCH!" in a tomato burst at the bottom left (x 6 to 32%, y 74 to 84%). Letters in ink with a cream offset.
EMPTY TEXT CONTAINERS: (a) a comic caption box, cream paper with a hand-inked tilted border, bottom left (x 5 to 62%, y 85 to 93%), COMPLETELY EMPTY; (b) a round tomato seal like a sticker at the bottom right (x 74 to 96%, y 82 to 93%) with a cream inner disc and an empty cream ring band round it (I will write on the ring) and the number "2026" lettered large in ink in the centre.
HIDDEN DETAILS (tiny, no captions): (1) two small yellow cat eyes with slit pupils, a pink nose and whiskers peeking out of the fur on the upper side of the windscreen, the dead cat is alive; (2) in the steel hardware of the clamp, a tiny reflection of Ona waving with her yellow headphones; (3) a snapped celery stick with crumbs flying out of the SNAP! burst; (4) cereal flakes and gravel bits flying out of the CRUNCH! burst; (5) the tallest waveform bars curl into a breaking wave shape; (6) a tiny blank clapperboard half hidden under the CRUNCH! burst; (7) in the footprint trail one print wears an odd sock, one is a bare foot with a plaster.
Do not write any other text. Keep the header and footer bands clean. Full 9:16 portrait, edge to edge.
```

**PF-02 About. IMAGE 1 = `SLD-02.png`, plus the three posters and `ONA-00.png`**

```text
IMAGE 1 is attached first (SLD-02.png, the current About slide). The three style references and Ona's model sheet follow.

Redraw IMAGE 1 as an inside page of an indie comic, in the hand-inked comic style of the references. Slide 2 of 5, butter field #FDEFAF with salmon halftone dots and paper grain. 9:16. Ona must match her model sheet exactly.
ZONES (percent of the height): 0 to 6 clean header band; 6 to 25 the title over a giant sunburst; 25 to 30 a small quiet strip; 30 to 62 on the left (x 5 to 50%) the empty caption panels; 28 to 88 on the right and centre (x 30 to 100%) Ona and the props; 88 to 100 a teal #007E9B floor with halftone and butter footprints.
TITLE: two lines of huge hand-cut capitals, exactly "I'M ONA" and then "RIBAS" (with a straight apostrophe), each line margin to margin. Deep teal #1B6885 fill, thick ink outline, hard solid ink extruded shadow down-right, a tomato offset behind it, letters of very different widths. Behind the title a giant hand-drawn sun-yellow sunburst with long irregular rays running across the name.
HERO: Ona in an extreme, low-angle comic pose at the centre right (x 30 to 90%, y 36 to 88%): her right knee kicked up towards the viewer with a huge foreshortened boot in the foreground, clapping two coconut halves in front of her chest, mouth wide open laughing, eyes squeezed shut, joy drops flying, curls bouncing, her headphones bouncing round her neck, a dungaree strap flapping, motion lines round the knee and boot, her hatched ink shadow on the floor. A sun-yellow "CLIP-CLOP!" burst in front of the coconuts (centre near x 65%, y 58%).
THE FIVE PROPS, taped to the page on paper sketch frames with tape strips, stepping down from the top right to the bottom left, each bursting a little out of its frame like a comic panel: celery bunch (x 48 to 95%, y 34 to 53%), cellophane candy wrapper beside it, a cabbage (x 30 to 62%, y 58 to 76%), a blue periwinkle umbrella (x 8 to 36%, y 67 to 85%), a watermelon half with a mallet (x 82 to 100%, y 63 to 79%). Each prop has an EMPTY arrow-shaped paper tag tied to it with string: top of the cluster (x 50 to 96%, y 29 to 34%) two tags, one under the cabbage (x 29 to 58%, y 77 to 81%), one under the umbrella (x 9 to 40%, y 87 to 91%), one vertical on the right edge (x 89 to 95%, y 74 to 89%).
EMPTY TEXT CONTAINERS: (a) a long thin paper strip under the title (x 5 to 50%, y 26 to 29%); (b) a small empty strip for a role line (x 5 to 50%, y 33 to 41%); (c) a large caption panel of cream paper with a hand-inked slightly tilted border and torn corners (x 5 to 50%, y 42 to 62%), COMPLETELY EMPTY.
HIDDEN DETAILS (tiny, no captions): (1) the celery stalks are arranged like a skeleton forearm and hand (bones); (2) the cellophane wrapper twists end in tiny flames (fire); (3) a small kitchen knife stuck in the cabbage with a band-aid on it (stabs); (4) tiny feathers along the umbrella ribs (wings); (5) the watermelon has a band-aid and a tiny crack beside the mallet (heads); (6) in the corner of every frame a small wave curl ("ona" means wave); (7) the patient neighbour, a tiny man in a dressing gown with ear muffs, bags under his eyes and a mug, peeking from behind the edge of the teal floor at the bottom left (x 3 to 12%, y 90 to 97%); (8) the black cat's tail and two yellow eyes in the dark shadow behind the cabbage frame; (9) Ona's headphone cable ends plugged into the cabbage, as if she were listening to it; (10) a bucket of gravel and a shovel behind the umbrella frame; (11) the footprint trail on the floor: butter boot prints, one pair is a pair of odd socks.
Do not write any other text. Keep the header band clean. Full 9:16 portrait, edge to edge.
```

**PF-03 Projects. IMAGE 1 = `SLD-03.png`, plus the three posters**

```text
IMAGE 1 is attached first (SLD-03.png, the current Projects slide). The three style references follow.

Redraw IMAGE 1 as a comic PAGE with three panels, in the hand-inked comic style of the references. Slide 3 of 5, deep teal field #1B6885 with halftone patches in teal and steel. 9:16.
ZONES (percent of the height): 0 to 6 clean header band; 7.5 to 9.5 the small word "SELECTED"; 9.5 to 19 the title; then three rows that zigzag: row 1 picture on the left (x 6 to 45%, y 22 to 42%) and an EMPTY text area on the right (x 47 to 94%, y 22 to 41%); row 2 picture on the right (x 58 to 94%, y 44 to 64%) and an empty text area on the left (x 6 to 55%, y 44 to 62%); row 3 picture on the left (x 6 to 46%, y 67 to 89%) and an empty text area on the right (x 47 to 94%, y 67 to 88%); 94 to 100 clean footer band. A trail of steel boot prints zigzags down the page from panel to panel.
TITLE: "SELECTED" small in sun-yellow hand-cut capitals, then "PROJECTS" huge, margin to margin, butter-cream fill, a wide P and a wide E and a narrow J, thick ink outline, a hard solid ink extruded shadow down-right.
THE EMPTY TEXT AREAS stay plain deep-teal field with halftone and grain only, nothing drawn in them (I will set a year, a title, a line and a blurb there).
THE THREE PANELS: each is an irregular, hand-inked, slightly tilted panel with rough edges and something breaking out of the border.
PANEL 1, "SALT SEASON": a low-angle ground-level shot, a desert of cracked white salt flat under a big low sun, two giant tomato-red boots #E8553E mid-stomp towards the viewer kicking up halftone-dotted salt spray, the far horizon with dunes; in the foreground the edge of a kitchen table with a baking tray of salt, a small microphone on a stand pointing at it and six one-kilo salt bags piled at the left. A sun-yellow "CRUNCH!" burst at the top right of the panel. Butter, cream, sky-blue steel and tomato.
PANEL 2, "KETTLE & CROW": a black ink crow whose two wings are open periwinkle umbrellas (#7A8CE8), flying and never landing, its feet dangling, above a tomato kettle on a stove with a panicked screaming face, its spout jetting steam, flames under it, rain falling off the umbrellas, a lightning flash; the panel is a periwinkle-lilac disc with halftone. A sun-yellow "WHEEE!" burst at the bottom right.
PANEL 3, "THE UNDERSTUDY MOON": a stop-motion set: a smiling crescent moon made of layered cut paper in butter and sun yellow, with a visible hinge at its jaw, tape pieces and paper wings glued on, hanging by threads against a lilac #B58AD6 paper sky with wavy deep-teal paper hills; cardboard cut-out boots on sticks walk along the bottom; a pair of scissors and a craft knife in the corner; a lilac sleeve and hand entering from the side holding tweezers that pin a star. A salmon "CREAK" burst at the top left of the panel.
HIDDEN DETAILS (tiny, no captions): (1) exactly six salt bags (six kilos); (2) exactly eight small paper stars hanging by threads in panel 3 (eight episodes); (3) a tiny black cat's two yellow eyes in a window behind the stove in panel 2, and a tiny paper cat silhouette peeking behind a hill in panel 3; (4) a small kitchen clock stopped at three in panel 1; (5) a tiny camera on a tripod and a sprocket frame counter in the corner of panel 3; (6) a tiny wave curl in the corner of each panel; (7) the crow wears one tiny yellow headphone; (8) the steel footprints end at the third panel with one print of an odd sock.
Do not write any other text. Keep the header and footer bands clean. Full 9:16 portrait, edge to edge.
```

**PF-04 Experience. IMAGE 1 = `SLD-04.png`, plus the three posters and `ONA-00.png`**

```text
IMAGE 1 is attached first (SLD-04.png, the current Experience slide). The three style references and Ona's model sheet follow.

Redraw IMAGE 1 as an inside page of an indie comic with one big splash panel, in the hand-inked comic style of the references. Slide 4 of 5, butter field #FDEFAF with salmon halftone and paper grain. 9:16. Ona must match her model sheet exactly.
ZONES (percent of the height): 0 to 6 clean header band; 7 to 23 the title; 23 to 58 the splash panel (x 5 to 95%); 58 to 93 the timeline: a boot-print trail with four sun-yellow stop markers on the left (x 5 to 16%) and an EMPTY text area on the right (x 17 to 94%); 93 to 100 a clean footer band.
TITLE: two lines of huge hand-cut capitals, exactly "EXPERIENCE" and then "& EDUCATION", each line margin to margin, deep teal #1B6885 fill with thick ink outline, hard solid ink extruded shadow down-right and a tomato offset, letters of very different widths and heights (the P of EXPERIENCE taller and wider).
THE SPLASH PANEL: an irregular hand-inked, slightly tilted panel with a rough edge, deep teal #1B6885 inside, with some rays and one corner of the scene breaking out of the border. Inside, a crowded sound studio seen at a slightly tilted angle: on the left a wall of pinned memories (a call sheet with "SC 24" circled in tomato, a printed waveform strip, a film strip, a ticket "ADMIT ONE", a ticket "TAKE 12", a cassette, a film reel, a cork edge); at the centre right, Ona seated side-on at a mixing desk full of faders and knobs with a screen showing a green waveform, a big sun-yellow spiky sunburst behind her head like a studio lamp, her yellow headphones ON her head, concentrating with the tip of her tongue out, one hand on a fader, the other holding a celery stalk like a microphone; at the right edge a boom-microphone stand with a pink pop filter; her boots and odd socks foreshortened in the foreground.
THE TIMELINE: boot prints, toes up, climbing the left side from the bottom to the panel, with four sun-yellow spiky suns each with a black dot in the middle (like eyes) as stop markers at y 59%, 68%, 76% and 84.5%. The right area stays plain butter field with grain only (I will set the four entries there).
HIDDEN DETAILS (tiny, no captions): (1) three small pinned polaroids on the wall that match slide 3: red boots on a salt flat, a screaming kettle, a smiling paper moon; (2) the black cat asleep curled up on top of a speaker, wearing one tiny headphone; (3) a postcard of the coloured houses of the Onyar river in Girona, a blue and white tile from Lisbon, a moth on the lampshade; (4) a cereal box with a cartoon face on a shelf (too many cereal ads); (5) a row of exactly sixteen small pushpins on the wall (sixteen titles); (6) a tin tray of gravel with boots beside the desk, and a pile of old shoes; (7) a red "REC" lamp lit and a clock; (8) a coffee mug with a wave curl on it; (9) twenty-two tiny tally marks scratched on the edge of the desk (22 films); (10) the footprint trail ends in the gravel tray.
Do not write any other text. Keep the header and footer bands clean. Full 9:16 portrait, edge to edge.
```

**PF-05 Contact. IMAGE 1 = `SLD-05.png`, plus the three posters and `ONA-00.png`**

```text
IMAGE 1 is attached first (SLD-05.png, the current Contact slide). The three style references and Ona's model sheet follow.

Redraw IMAGE 1 as the LAST PAGE of an indie comic, in the hand-inked comic style of the references. Slide 5 of 5, teal field #007E9B with deep-teal and steel halftone and paper grain. 9:16. Ona and the black cat must match her model sheet exactly.
ZONES (percent of the height): 0 to 6 clean header band; 6 to 23 the title; 24 to 28 an EMPTY quiet strip; 29 to 67 the hero scene; 69 to 90 a torn-paper card, EMPTY; 91 to 95 an EMPTY yellow luggage tag (x 6 to 62%); 92 to 96 a quiet area on the right (x 66 to 94%); 96 to 100 clean footer band.
TITLE: two lines of huge hand-cut capitals, exactly "THANKS FOR" and then "LISTENING", each margin to margin, butter-cream fill, thick ink outline, hard solid ink extruded shadow down-right, a tomato offset, letters of very different widths (a very wide H, a narrow I).
HERO: Ona walking away from the viewer towards a big rising sun, in a long energetic mid-stride, seen from behind and a little below, her head turned back over her shoulder with a huge delighted grin, her free hand waving goodbye at the viewer (the hand near x 44%, y 36%), the other hand holding up a boom pole with a small furry windscreen at its top; yellow headphones round her neck, lilac sweater, tomato dungarees, odd socks, chunky boots; on her back the periwinkle duffel with a celery stalk and a coconut sticking out and the BLACK CAT riding on top with a sly grin, its yellow eyes on the viewer. Behind her a big sun-yellow rising sun with long hand-drawn rays cut in half by the ground line (y 62%), halftone, speed lines. A tomato "BYE!" burst next to her waving hand (x 33 to 47%, y 33 to 40%). A trail of steel boot prints along the horizon, toes pointing right, the way she walks.
THE HORIZON: tiny in the far background, in deep teal and steel silhouettes with halftone, the skyline of Girona: the colourful houses along the Onyar river, an iron footbridge and the cathedral bell tower above its long stairs.
EMPTY TEXT CONTAINERS: (a) the torn-paper card (x 6 to 94%, y 69 to 90%): deep teal #1B6885 paper with torn edges, two strips of masking tape on the top corners and a hand-inked border, COMPLETELY EMPTY; (b) a yellow #F2C62F luggage tag with a hole and a loop of string, tilted, COMPLETELY EMPTY; (c) the strip under the title, empty.
HIDDEN DETAILS (tiny, no captions): (1) the patient neighbour, a tiny man in a dressing gown with ear muffs, far right on the horizon, waving a white handkerchief with a huge relieved smile; (2) a tiny wave curl inside the sun; (3) the cat's tail ends in a small wave curl; (4) a small "foley" cassette tape unspooling in her pocket; (5) a tiny coconut half and a celery stalk have dropped into the footprint trail; (6) one of the boot prints is a pair of odd socks; (7) her duffel's buckle is shaped like a tiny cat head.
Do not write any other text. Keep the header and footer bands clean. Full 9:16 portrait, edge to edge.
```

### One-line fixes to paste when a result is off

- Not comic enough (too clean): `Too clean and vector-like. Redraw it hand-inked like the three style references: a lively dip-pen line of changing weight with overshoots and doubled lines, scratchy hatching, halftone dots, flat colour slightly off-register with the lines, paper grain.`
- The title is misspelled: `The title must read exactly: [WORD ONE] / [WORD TWO]. Check every letter: [F-O-L-E-Y / P-O-R-T-F-O-L-I-O]. Same lettering style, nothing else changes.`
- A text container has writing in it: `Every caption box, strip, tag, card and ribbon must be completely empty: no letters, no numbers, no scribbles. Remove all the writing from them, change nothing else.`
- Too many random words: `Remove every word that is not the title or a listed sound word. No invented labels, no signature, no watermark.`
- Ona looks different: `Ona must match the attached model sheet exactly: the same face, hair, earring, lilac sweater, tomato dungarees, odd socks, boots and headphones.`
- It copies IMAGE 1's drawing: `Do not copy how IMAGE 1 is drawn. Keep its layout and content but redraw everything as a hand-inked comic page.`
- Easter eggs missing or too big: `Add the listed hidden details, each one tiny (about 2% of the slide), drawn into the scene, with no caption.`
- The bands are used: `Keep the top 6% and the bottom 7% clean: field colour with paper grain and halftone only.`
- A colour is off: `Use only the deck palette; the field of this slide is [teal #007E9B / butter #FDEFAF / deep teal #1B6885].`
- Too dark: `Lighter: more flat colour and white-cream highlights, less black hatching.`

Work order that saves retries: ONA-00 first (approve her), then PF-02 (the hardest), then PF-01, PF-04, PF-05 and PF-03.

### v10: corrections after the first PF-02 (2026-10-29)

The first PF-02 had a very good title and sunburst but was **overloaded** (five taped paper frames, six empty containers, string tags, a knife, feathers, a gravel bucket, a cable plugged into a cabbage, a stray black blob, sparkles everywhere), **read as AI-generated** (every object rendered at the same fine detail, botanical cabbage and celery next to a cartoon girl, etched hatching, glossy shading, a uniform halftone filter, perfectly even lines, the "taped sketch" frames made from the pencil-construction-line instruction) and had **execution errors** (two pairs of headphones, one cracked coconut instead of two shells). The saved first version is `_inbox/_old/PF-02_v1.webp`.
Changes of method, valid for every remaining slide and every retry:
1. **Less information**: the title, one hero, at most five simple secondary objects, the sound burst, the floor, at most two tiny hidden details (the ten to eleven listed per slide above are a menu, not a requirement). No pencil construction lines.
2. **ChatGPT draws no text containers** (no caption boxes, strips, tags, seals, cards or tape): the left empty zones stay plain field. The containers are made afterwards in code (torn paper, tape, hard shadows, a little wobble) and carry the real text; they look hand-made instead of generated.
3. **Less AI**: bold, simple, confident; one outline weight; no fine hatching, no micro detail, no realistic or botanical rendering, no gloss, no soft shading; shadows are flat solid black shapes; every object in the same cartoon line language as the characters; detail only in faces, hands and a little in the boots.
4. **Hand-made imperfection**: wobbly uneven lines, doubled lines, three or four places where the colour is clearly off-register, dry-brush gaps, asymmetry, halftone only in two or three chosen areas.
5. **Post-processing by us** on the whole set: one scanned-paper texture, ink grain and a slight print misregistration, which removes most of the plastic sheen and unifies the five slides.
6. Fallback if a slide still looks generated: draw it in **separate pieces** (the title and sunburst, the hero alone on flat colour, the props on a parts sheet) and compose them in code with real textures, as was done for the "On my desk" icons.

### v11: second correction of PF-02 (2026-10-29): "one hand" is the tell

The second PF-02 fixed the content (one pair of headphones, two coconut halves, no containers, fewer objects) but still read as generated because **everything is drawn by the same hand**: one line weight, one finish, every object equally polished, perfect registration, nothing overlapping, a clean even title. Pau asks for the opposite: different illustration styles on one page (as if several artists worked on a zine), strokes out of place, things overlapping, much more raw than clean, letters of different sizes, a bit bizarre. Saved: `_inbox/_old/PF-02_v2.webp`, `PF-02_v2b.webp`.
The prompt below is pasted in the same chat with the v2 image attached. It keeps the content and layout and changes only the hand. The same rules apply to PF-01, 03, 04 and 05 (paste the "ROUGH, MANY HANDS" block in the chat before asking for them).
If ChatGPT keeps re-polishing, the fallback is a **parts sheet drawn with a different technique per object** (linocut celery, crayon cabbage, brush umbrella, stamped footprints, ballpoint neighbour, ink-brush Ona), composed here in code with real paper, print and ink textures.

## PF plan B (v12): the five slides built from separate hand-made pieces (2026-10-29)

Pau's verdict on the one-shot PF-02 (v1 and v2): the content is fine but "everything is too equal, too perfect", it reads as generated. Plan B: **ChatGPT draws one object at a time, each with a different real technique** (ink brush, linocut, wax crayon, felt-tip, photocopy, cut paper, ballpoint, rubber stamp). **I assemble them** with overlaps, tape, torn paper, misregistration and paper/ink textures, and I set all the real text (bio, timeline, contact, tags). ChatGPT only draws what it does best: the big titles, the sound bursts and the artworks.

### Folders and names
- Results go to `C:\Users\User\Documents\Portofolio\_inbox\pf\` named with their ID (`K-01.png`, `T-03.png`, `S2-04.png`...). Several versions: add a letter (`S2-04b.png`).
- References are in `C:\Users\User\Documents\Portofolio\_inbox\refs\`:
  - `STYLE-COMIC-1.jpg` red truck poster: chunky ragged title, ink, halftone
  - `STYLE-COMIC-2.jpg` 25 DEC poster: scratchy pen, jagged lettering, hatching
  - `STYLE-COMIC-3.jpg` 12 MAY poster: loose pen, marker lettering, panels
  - `STYLE-COMIC-4.jpg` Summer Crawl poster: puffy bubble lettering, flat blobby colour, thick outline
  - `ONA-REF.png` Ona cropped from the v2 slide (look only at the girl)
  - `TITLE-REF.png` the v2 title "I'M ONA RIBAS" that Pau likes

### The five chats (one chat per group, paste the RULES block first in each)
1. **ONA**: K-01, then S2-01, S4-01, S5-01 (same chat, so she stays the same person)
2. **KIT**: K-02 to K-07 (sunbursts, sound bursts, footprints, marks, sparks, neighbour)
3. **TITLES**: T-01 to T-05
4. **OBJECTS**: S1-01, S2-02 to S2-06, S4-02 to S4-05, S5-02 (since 2026-10-30 these are goofy 3D renders, see v13 at the end; do not use the RULES block below for this chat)
5. **PANELS**: S3-01 to S3-03

### RULES block (paste first in every chat, reply "ready")
```text
RULES FOR EVERY IMAGE IN THIS CHAT. They apply to all my requests until I say otherwise. Reply "ready" and nothing else.

WHAT THIS IS. I am building a hand-made zine-style poster deck by cutting out separate artworks and pasting them together myself. So every request asks for ONE object, or one sheet of separate objects. Draw only that. Never draw a scene around it, a frame, a border, a table, a floor, a ground shadow or a background.

BACKGROUND. Perfectly flat hot magenta #FF00FF over the whole image, edge to edge (a working colour I will remove). No gradient, no texture, no shadow on it. Nothing in the artwork may use magenta, hot pink or purple-pink. Leave at least 6% of empty magenta all round the artwork and between separate items.

IT MUST LOOK HAND-MADE, NOT GENERATED. Each request names a real technique and real materials (pen, linocut, crayon, felt-tip, stamp, torn paper...). Draw as if a human did it quickly with those materials and then scanned it: uneven line weight, lines that overshoot or stop short, a redrawn contour left beside the first, ink starved or pooled in places, paper showing through, colour not quite inside the outline, asymmetry. Leave a few things rough or unfinished. Put detail ONLY where the request says; keep everything else simple and bold. Do NOT make it clean, even, symmetrical, glossy or perfect; do not smooth it.
FORBIDDEN: gradients, soft shading, airbrush, glossy highlights, 3D-render look, photorealism, blur, vector-clean outlines, pencil construction lines, sketch lines under the colour.

COLOUR. Flat opaque colour, two or three tones per object, hard-edged shadows. Ink is blue-black #101820, never pure black. Palette when a request names no colour: teal #007E9B, deep teal #1B6885, butter #FDEFAF, steel #63A0AC, paper #F6F0DC, sun yellow #F2C62F, tomato #E8553E, salmon #F2A29A, lilac #B58AD6, periwinkle #7A8CE8, celery #9CCF9A.

TEXT. No text of any kind unless a request puts a word in capitals between quotes; then spell it EXACTLY and write nothing else. No signature, watermark, logo or numbers.
```

### Order of work
Do K-01 first (approve Ona). Then the titles (quick to judge), then everything else in any order. You can send me files in batches: I start composing as soon as I have a slide's pieces.

---

### CHAT 1: ONA (all her images)

**K-01 Ona model sheet.** Attach `ONA-REF.png`, `STYLE-COMIC-2.jpg`, `STYLE-COMIC-3.jpg`.
```text
Attach ONA-REF.png (look ONLY at the girl, ignore every object around her) and the two poster references STYLE-COMIC-2 and STYLE-COMIC-3 (loose pen-and-ink comic drawing).

Draw a MODEL SHEET of ONA RIBAS, the same character as in ONA-REF: keep her face, her dark-brown curly hair, small gold hoop earring, lilac sweater with big puffy sleeves, tomato dungarees with a strap and rolled hems, one green sock and one pink sock, chunky black boots with cream soles and a wavy-line sole print, yellow over-ear headphones. Redraw her in a different hand: a loose, fast pen-and-ink comic drawing.
TECHNIQUE: dip pen and brush pen on paper, scanned, then painted flat in a layer under the lines. Thick-and-thin line (thick on the shadow side and silhouette, hair-thin inside), lines that overshoot and cross, a few doubled contours, spotted solid blacks in boots and hair, quick hatching strokes in sleeve and dungaree folds, a second darker flat tone in hard-edged shapes, the flat colour shifted 4 to 8 px from the lines so it spills over or stops short, ink spots and dry-brush gaps. Her face is simple: round cheeks with a flat salmon blush, big eyes with tiny pupils, a big mouth. Comic proportions: slightly big head, long legs, big hands with four fingers and a thumb.
LAYOUT (landscape 3:2, everything separate): five full-body poses in a row, each about 70% of the height: (1) front view standing, hands on hips, grinning; (2) back view, headphones round her neck, a periwinkle #7A8CE8 duffel bag on her back with a celery stalk and a coconut half sticking out; (3) side view sitting on a chair, headphones ON her head, tongue out in concentration; (4) three-quarter view mid-stride, looking back and waving; (5) low-angle view kicking one knee up with a huge boot in the foreground. Under them a row of six heads: laughing, gasping with a sweat drop, concentrating, sleepy, mischievous, a goodbye smile. EXACTLY ONE pair of headphones per drawing.
Format: landscape 3:2, flat hot magenta #FF00FF background, 6% margin, no text.
```

**S2-01 Ona kicking and clapping coconuts** (slide 2). Attach `K-01.png`, `ONA-REF.png`, `STYLE-COMIC-2.jpg`.
```text
Attach K-01.png (Ona's model sheet), ONA-REF.png and STYLE-COMIC-2.jpg.

Draw ONE character: Ona, exactly as in the model sheet, in this pose: low-angle comic view, her right knee kicked up towards the viewer with a huge foreshortened chunky boot in the foreground (the wavy-line sole facing us), clapping TWO separate coconut halves (brown hairy shell outside, white flesh inside), one in each hand, an inch apart, about to hit; mouth wide open laughing, eyes squeezed shut, curls bouncing, a few joy drops flying, a dungaree strap flapping, 3 or 4 motion lines round the knee. The yellow headphones hang round her neck: EXACTLY ONE pair, none on her head.
TECHNIQUE: dip pen and brush pen on paper, scanned, then painted flat in a layer under the lines. Thick-and-thin line, overshoots, doubled contours, spotted solid blacks in the boots and hair, hatching in the sleeve and dungaree folds, a second darker flat tone in hard-edged shapes, flat colour shifted 4 to 8 px off the lines, ink spots and dry-brush gaps, coarse halftone dots on at most two areas (the dungaree shadow, the sole). Simple face. Keep detail in her face, hands and boots; the rest simple.
Format: portrait 2:3, the figure filling 90% of the height, flat hot magenta #FF00FF background, 6% margin, no cast shadow, no ground, no text.
```

**S4-01 Ona at the mixing desk** (slide 4). Attach `K-01.png`, `ONA-REF.png`, `STYLE-COMIC-3.jpg`.
```text
Attach K-01.png (Ona's model sheet), ONA-REF.png and STYLE-COMIC-3.jpg.

Draw ONE character: Ona, exactly as in the model sheet, sitting side-on on a simple swivel office chair (seat, back, stem, five wheel legs: the chair is part of the drawing), leaning forward in concentration, the yellow headphones ON HER HEAD (none round her neck: EXACTLY ONE pair), the tip of her tongue sticking out, one hand stretched forward flat as if on a fader, the other hand holding a celery stalk like a microphone, knees bent, odd socks, chunky boots foreshortened in the foreground. No desk, nothing in front of her.
TECHNIQUE: dip pen and brush pen on paper, scanned, then painted flat under the lines: thick-and-thin line, overshoots, doubled contours, spotted blacks, hatching in the folds, flat colour shifted 4 to 8 px off the lines, ink spots, dry-brush gaps, halftone dots on at most two areas.
Format: portrait 3:4, the figure filling 90% of the height, flat hot magenta #FF00FF background, 6% margin, no ground shadow, no text.
```

**S5-01 Ona walking away** (slide 5). Attach `K-01.png`, `ONA-REF.png`, `STYLE-COMIC-3.jpg`.
```text
Attach K-01.png (Ona's model sheet), ONA-REF.png and STYLE-COMIC-3.jpg.

Draw ONE character: Ona, exactly as in the model sheet, walking away from the viewer in a long energetic stride, seen from behind and a little from below, her head turned back over her shoulder (three-quarter face) with a huge delighted grin, her free hand waving goodbye, the other hand holding up a boom pole with a small furry microphone windscreen on top. Yellow headphones round her neck (EXACTLY ONE pair). Lilac sweater, tomato dungarees, odd socks, chunky boots. On her back the periwinkle #7A8CE8 duffel bag with a celery stalk and a coconut half sticking out of the top, and the BLACK CAT riding on top of the duffel, looking at the viewer with a sly grin, its tail ending in a small wave curl; the duffel's buckle is shaped like a tiny cat head.
TECHNIQUE: dip pen and brush pen on paper, scanned, then painted flat under the lines: thick-and-thin line, overshoots, doubled contours, spotted blacks (boots, hair, cat), hatching in the folds, flat colour shifted 4 to 8 px off the lines, ink spots, dry-brush gaps, halftone dots on at most two areas.
Format: portrait 3:4, the figure filling 90% of the height, flat hot magenta #FF00FF background, 6% margin, no ground shadow, no text.
```

---

### CHAT 2: KIT (reusable pieces; paste RULES first)

**K-02 Sunbursts.** Attach `STYLE-COMIC-4.jpg` (only to see how spiky edges are cut by hand).
```text
Attach STYLE-COMIC-4.jpg (look only at how its spiky shapes have hand-cut, irregular edges).
Draw a SHEET of hand-made sunbursts and spiky shapes, in sun yellow #F2C62F, each separate:
1. (big, about 60% of the sheet) a sunburst of 18 to 22 rays of different lengths, widths and angles, some slightly curved, painted with a dry, loaded flat brush: ragged edges, dry-brush gaps and streaks, uneven solid yellow, no centre circle, no outline.
2. a half sunburst (the lower half cut flat), rays fanning up, same brush.
3. a spotlight: a long ragged yellow cone.
4. a row of FOUR small spiky suns, each with a round black dot in the middle like an eye, different sizes, drawn with a marker: ink outline of changing weight, flat yellow slightly off-register.
5. five small hand-cut starbursts of 7 to 12 points, one with an ink outline.
TECHNIQUE: gouache with a dry brush, and a marker for the small ones. Uneven, asymmetric. No gradients, no glow, no perfect radial symmetry.
Format: landscape 3:2, flat hot magenta #FF00FF background, 6% gap between items, no text.
```

**K-03 Sound bursts.** Attach `STYLE-COMIC-1.jpg` and `STYLE-COMIC-4.jpg` (look only at their hand lettering).
```text
Attach STYLE-COMIC-1.jpg and STYLE-COMIC-4.jpg (look only at how their short words are hand-lettered).
Draw a SHEET of 7 comic sound bursts (spiky balloons), each separate, with this word inside in hand-lettered capitals, spelled EXACTLY:
1. "SNAP!" sun-yellow #F2C62F burst, small
2. "CRUNCH!" tomato #E8553E burst, medium
3. "CLIP-CLOP!" sun-yellow burst: CLIP small, CLOP huge, letters tilted
4. "WHEEE!" sun-yellow burst, each E bigger than the one before
5. "CREAK" salmon #F2A29A burst, letters stretched thin and tall
6. "THUMP!" celery #9CCF9A burst, letters fat and heavy
7. "BYE!" tomato burst, letters leaning and waving
Each burst has a different silhouette (round-spiky, jagged, lopsided, with a little tail) and a different size.
TECHNIQUE: cut out of paper with scissors and lettered with a brush pen: asymmetric edges, ink outline of changing weight, a hard solid ink shadow offset down-right, flat colour a few pixels off the outline, dry-brush gaps. The lettering wobbles, letters of different sizes, a thin cream offset line behind the ink letters.
Format: landscape 3:2, flat hot magenta #FF00FF background, 6% gap between bursts, no other text.
```

**K-04 Footprints (rubber stamp).**
```text
Draw a SHEET of RUBBER-STAMP PRINTS in blue-black ink #101820 only:
- 8 prints of a chunky boot sole (left and right): thick wavy-line tread, a heel block, a toe; different sizes; each stamped with uneven pressure: heavy in the toe, faded in the heel, ink gaps and speckle, blotchy edges.
- 3 half-printed boot prints (only the toe or only the heel, as if the stamp slipped) and 2 double-stamped prints (a ghost copy shifted 10 px).
- 2 pairs of prints of feet in odd socks (one sock with wavy stripes, the other with dots) and 1 bare foot with a plaster on the heel.
- 2 cat paw prints.
TECHNIQUE: a carved rubber stamp, inked on a pad, pressed on paper, scanned. No two prints alike, each slightly rotated, ink halos at the edges.
Format: landscape 3:2, flat hot magenta #FF00FF background, 6% gap between prints, no text.
```

**K-05 Marks (brush pen and marker).**
```text
Draw a SHEET of hand-drawn MARKS in blue-black ink #101820 only, each separate, as drawn fast with a brush pen and a thick marker:
- 6 arrows of different kinds (curved, straight, zigzag, looping, double-headed, tiny)
- 4 underlines (single, double, wavy, scribbled)
- 3 punctuation marks drawn large: "!!", "?!", "?"
- 4 loose rings and ovals for circling things (one open, one overlapping itself)
- 5 groups of motion lines (3 to 7 strokes each)
- 3 crossed-out scribble patches and 3 hatching patches (random directions)
- 8 sweat or joy drops (single and in sprays)
TECHNIQUE: a marker running dry, thick-and-thin by pressure, strokes ending in flicks, a few overdrawn. Nothing symmetrical, no perfect circles, no straight ruled lines.
Format: landscape 3:2, flat hot magenta #FF00FF background, 6% gap between items, no letters other than the three punctuation groups.
```

**K-06 Sparks, curls and splats.**
```text
Draw a SHEET of small hand-made decorations, each separate:
- 8 four-point sparkles of different sizes and proportions (4 in sun yellow #F2C62F, 4 in blue-black ink #101820; two with an offset ink outline)
- 6 little wave curls: spirals and breaking-wave doodles in ink
- 4 music notes (a single, a double beamed, a loose one, a tiny one) in ink
- 5 ink splatters and sprays (a big blot with drops, a flick, a spray of dots)
- 2 thumbprints in ink and 1 coffee-cup ring in thin brown (#8A5A3C) with two drips
- 4 white correction-fluid brush strokes (opaque white, thick, streaky, dried)
- 3 smudges of grey ink
TECHNIQUE: brush pen, marker, a real ink splatter from a loaded brush, white-out fluid. Irregular, uneven, nothing symmetrical.
Format: landscape 3:2, flat hot magenta #FF00FF background, 6% gap between items, no text.
```

**K-07 The patient neighbour.**
```text
Draw a SHEET of THE PATIENT NEIGHBOUR, a tired middle-aged man with messy hair, stubble, bags under his eyes and big grey-steel ear muffs, wearing a striped dressing gown (tomato and cream stripes) and slippers. Four separate drawings:
(1) head and shoulders peeking over an edge, holding a steaming mug;
(2) full body standing with the mug, a tired side-eye;
(3) full body waving a white handkerchief with a huge relieved grin;
(4) head only, asleep, a snore cloud made of three small bubbles (no letters).
TECHNIQUE: a naive doodle drawn with a cheap blue-black ballpoint pen: a thin, shaky, slightly childlike line that wobbles and scribbles, hatching made of scribbled loops, with flat felt-tip colour scribbled loosely over it that goes outside the line. Face: dot eyes, one eyebrow higher than the other, a lopsided mouth. Clumsy proportions on purpose, charming; not manga, not polished.
Palette: ballpoint #101820, salmon #F2A29A skin, tomato #E8553E stripes, steel #63A0AC ear muffs, paper #F6F0DC for the mug and handkerchief.
Format: landscape 3:2, flat hot magenta #FF00FF background, 6% gap, no text.
```

---

### CHAT 3: TITLES (paste RULES first)

**T-01 "FOLEY / PORTFOLIO"** (cover, bubble letters). Attach `STYLE-COMIC-4.jpg`.
```text
Attach STYLE-COMIC-4.jpg (look at its puffy bubble lettering: how the letters swell, merge and wobble).
Draw a title in two stacked lines, spelled EXACTLY: line 1 "FOLEY", line 2 "PORTFOLIO". Nothing else.
STYLE: puffy bubble capitals, like fat balloons or melted wax: every letter swollen and rounded, a different size and width from its neighbours (some huge, some squeezed), tilted at different angles (about -8 to +10 degrees), jumping off the baseline, letters touching and partly merging. The round letters are lumpy, not perfect circles. FOLEY is very wide and big; PORTFOLIO is tighter, with a huge first P and a small second O.
PAINT: butter #FDEFAF fill with one lighter cream highlight blob inside each letter (flat, hard-edged), a thick blue-black ink outline #101820 of changing weight, a second thick outline in tomato #E8553E behind it shifted 12 px down-right, and a hard solid ink shadow beyond that. Everything slightly out of register: the butter stops short of the ink in places and spills over in others; dry-brush gaps and ink speckle. As if cut out of paper and inked with a fat brush by a human in a hurry.
Format: landscape 3:2, the title filling 92% of the width, flat hot magenta #FF00FF background, no other text.
```

**T-02 "I'M ONA / RIBAS"** (About; the lettering Pau likes, with size variation). Attach `TITLE-REF.png`, `STYLE-COMIC-1.jpg`.
```text
Attach TITLE-REF.png (the lettering I want to keep) and STYLE-COMIC-1.jpg.
Draw a title in two stacked lines, spelled EXACTLY: line 1 "I'M ONA" (a plain straight apostrophe), line 2 "RIBAS". Nothing else.
KEEP the look of TITLE-REF: hand-cut chunky capitals, the same blue-teal fill as in TITLE-REF, a thick ink outline, a tomato #E8553E offset behind, a hard ink extruded shadow down-right, rough notched edges and uneven ink coverage with starved speckles.
CHANGE: much more variation between letters: different sizes and heights (a huge M, a tiny apostrophe pushed against the I, a tall narrow I, an enormous R, a squeezed B), tilted at different angles (about -8 to +10 degrees), a wobbling baseline, letters overlapping each other's shadows. Both lines still run edge to edge.
Format: landscape 3:2, the title filling 92% of the width, flat hot magenta #FF00FF background, no other text.
```

**T-03 "SELECTED / PROJECTS"** (Projects, jagged scratchy). Attach `STYLE-COMIC-2.jpg`.
```text
Attach STYLE-COMIC-2.jpg (look at the jagged, scratchy lettering of its big title).
Draw a title in two lines, spelled EXACTLY: line 1 small "SELECTED", line 2 huge "PROJECTS". Nothing else.
STYLE: sharp jagged capitals drawn with a dry marker and trimmed with a knife: spiky corners, notched edges, strokes of uneven thickness, letters leaning on each other; widths and heights vary wildly (a very wide P, a tall narrow J, a small R and O, a huge S), a baseline that wobbles. SELECTED: smaller, sun yellow #F2C62F with an ink outline, letters spaced irregularly. PROJECTS: butter #FDEFAF fill, a thick ink outline, a deep double extrusion in ink going down-right with scratchy hatching inside it, dry-brush texture, ink speckles, the colour not quite inside the outline.
Format: landscape 3:2, PROJECTS filling 92% of the width, flat hot magenta #FF00FF background, no other text.
```

**T-04 "EXPERIENCE / & EDUCATION"** (Experience, ragged stencil). Attach `STYLE-COMIC-1.jpg`.
```text
Attach STYLE-COMIC-1.jpg (look at its chunky ragged title lettering).
Draw a title in two lines, spelled EXACTLY: line 1 "EXPERIENCE", line 2 "& EDUCATION". Nothing else.
STYLE: chunky ragged capitals like stencil cuts torn out of heavy paper: thick, rough notched edges, uneven ink coverage with starved patches. Letters of very different heights: the P of EXPERIENCE much taller and wider, the first E small; the "&" huge; in EDUCATION a big D and C and a tiny tall I. Slight rotations, lines stacked tight, both lines the same width, edge to edge. Fill deep teal #1B6885, thick ink outline, a tomato #E8553E offset 10 px behind, a hard ink extrusion down-right. Coarse halftone dots inside two or three letters only.
Format: landscape 3:2, the title filling 92% of the width, flat hot magenta #FF00FF background, no other text.
```

**T-05 "THANKS FOR / LISTENING"** (Contact, loose marker). Attach `STYLE-COMIC-3.jpg`.
```text
Attach STYLE-COMIC-3.jpg (look at the loose marker lettering of its big pink title).
Draw a title in two lines, spelled EXACTLY: line 1 "THANKS FOR", line 2 "LISTENING". Nothing else.
STYLE: loose fat-marker capitals, wobbly and fast: THANKS big on the left shrinking towards the right, FOR small and tilted up; LISTENING with a huge L and a tiny I, the baseline rising. Visible start and end of each stroke, a double stroke where the marker went over twice. Butter-cream #FDEFAF fill, a thick ink outline of uneven weight, a solid ink drop shadow down-right and a tomato #E8553E offset. One scribbled underline under LISTENING.
Format: landscape 3:2, the title filling 92% of the width, flat hot magenta #FF00FF background, no other text.
```

---

### CHAT 4: OBJECTS, hand-drawn version (SUPERSEDED on 2026-10-30 by the 3D version in "PF plan B (v13)" at the end of this file; kept for reference)

**S1-01 The giant furry microphone** (cover hero). Attach `STYLE-COMIC-1.jpg`.
```text
Attach STYLE-COMIC-1.jpg (look at its chunky ink shapes, halftone and hatching).
Draw ONE object: a giant furry boom-microphone windscreen (a "dead cat") bursting towards the viewer along a diagonal from the lower left to the upper right, seen from a low angle with strong foreshortening, filling about 85% of the canvas.
TECHNIQUE: inked with a brush pen on paper, scanned. The fur is NOT individual hairs: it is bold ragged tufts with spiky silhouettes, 8 to 12 big clumps, each outlined in thick ink with a few hatching strokes on the shadow side; cream-butter #FDEFAF fill with a second darker butter tone and coarse salmon #F2A29A halftone dots on the shadow side only. Two periwinkle #7A8CE8 straps with rivets. At the lower end a deep-teal #1B6885 shock mount and a boom pole that runs off the bottom-right edge, gripped by two forearms in lilac #B58AD6 puffy sleeves with ribbed cuffs (hands drawn loosely). A thick braided cable looping out to the lower left, ending in a plug.
HIDDEN DETAIL (tiny): two yellow cat eyes with slit pupils and a salmon nose peeking out of the fur on the upper side.
Colour a few pixels off the outlines, dry-brush gaps, ink spots. Nothing smooth.
Format: square, flat hot magenta #FF00FF background, 6% margin (the pole may end at the canvas edge), no text.
```

**S2-02 Celery (linocut).**
```text
Draw ONE object: a bunch of celery lying diagonally: 6 stalks with ribbed outsides, cut flat at the base, leafy tops in three clumps.
TECHNIQUE: a LINOCUT PRINT on cheap paper, printed in two passes with two separate inks: pass 1 celery green #9CCF9A as flat solid shapes; pass 2 blue-black ink #101820 as the carved line block: chunky gouge marks, wedge-shaped cuts for the ribs, a rough chipped outline, the leaves as angular cut shapes. The two passes are misregistered by about 10 px (the green sticks out beyond the black on one side and leaves a paper gap on the other). Ink-starved patches where the paper shows through, slight roller streaks. No fine detail, no hairlines, nothing smooth.
Format: landscape 3:2, flat hot magenta #FF00FF background, 6% margin, no text.
```

**S2-03 Candy wrapper (felt-tip).**
```text
Draw ONE object: a hard-candy cellophane wrapper twisted at both ends with a sweet inside, tilted; a tiny spiky tomato flame licking each twisted end.
TECHNIQUE: cheap felt-tip markers on printer paper: shaky outlines, strokes that overlap and get darker where they cross, streaks, a marker running dry, colour scribbled outside the line. The cellophane is an angular pattern of pale highlights and a few diagonal lines, crinkle folds as zigzags, no gloss.
Palette: sun yellow #F2C62F, tomato #E8553E, periwinkle #7A8CE8, salmon #F2A29A, white, ink fine-liner #101820.
Format: landscape 3:2, flat hot magenta #FF00FF background, 6% margin, no text.
```

**S2-04 Cabbage (oil pastel).**
```text
Draw ONE object: a whole green cabbage, big and round, with thick overlapping leaf folds; between two leaves peek out two yellow cat eyes with slit pupils and one small black paw (a hidden joke).
TECHNIQUE: oil pastel and wax crayon on rough paper: thick waxy strokes in layers; circular scribbled fills; the dark outline is a broken, heavy crayon line that does not close; paper tooth showing through as white speckle; colour scribbled outside the outline; a darker teal #007E9B crayon scribble for the shadow folds. 6 to 8 big simple leaf shapes, only 4 or 5 thick crayon lines for veins.
Palette: celery #9CCF9A, butter #FDEFAF, teal #007E9B, ink #101820 for the cat, sun yellow #F2C62F for its eyes.
Format: square, flat hot magenta #FF00FF background, 6% margin, no text.
```

**S2-05 Umbrella (wet brush).**
```text
Draw ONE object: a half-open umbrella lying tilted, with a hooked tomato #E8553E handle and a periwinkle #7A8CE8 canopy; tiny feathers poking out between the ribs (the umbrella is also a wing).
TECHNIQUE: fast wet brush with gouache and black Indian ink: a thick black brush contour with dry tips, the canopy painted in one pass of periwinkle that bleeds past the outline and pools darker at the edges, a few drips running down, one rib drawn twice, parts left unpainted with the paper showing, brush hairs visible in the strokes. The feathers are 5 quick brush flicks in ink and cream. No details, no perfect geometry.
Format: landscape 3:2, flat hot magenta #FF00FF background, 6% margin, no text.
```

**S2-06 Watermelon (photocopy and cut paper).**
```text
Draw ONE object: half a watermelon, cut face up, a few seeds, a striped rind; a small wooden mallet lying across it; a band-aid stuck on the rind; a small crack.
TECHNIQUE: a PHOTOCOPIED DRAWING with cut-paper colour. First a bold ink drawing photocopied to harsh black and white (thick contours, coarse halftone dots for the shadow, toner speckle, a fuzzy grey edge). Then two flat colours cut from coloured paper and pasted slightly crooked BEHIND it: tomato #E8553E for the flesh, celery #9CCF9A for the rind, both shifted 12 px and a little bigger or smaller than the black linework, with a visible scissor-cut edge (small notches).
Format: landscape 3:2, flat hot magenta #FF00FF background, 6% margin, no text.
```

**S4-02 Mixing console (felt-tip marker).**
```text
Draw ONE object: a long mixing-console desk seen from a slight above-front angle, about 2:1: a row of 12 faders and 6 big knobs in two rows, a few buttons, a small screen on top showing a green waveform of bars, two meters with needles, a cable looping off the side; at the right end a microphone stand with a salmon #F2A29A round pop filter on an angled boom arm. No people.
TECHNIQUE: a fast marker drawing: a wobbly fine ink-marker contour with lines that do not meet at the corners, flat marker colour streaky and applied outside the line: desk body steel #63A0AC with darker steel hatching, tomato #E8553E knobs, sun-yellow #F2C62F buttons, celery #9CCF9A waveform. Keep detail simple: vary the position of the faders, leave a few crooked or missing.
Format: landscape 3:2, flat hot magenta #FF00FF background, 6% margin, no text.
```

**S4-03 Speaker with the sleeping cat (wax crayon).**
```text
Draw ONE object group: a big studio speaker cabinet seen slightly from the front-left (a woofer cone, a smaller tweeter, a rounded box, a cable behind it) and, on top of it, a small black cat asleep curled in a ball, wearing one tiny yellow headphone on its head, one paw hanging over the edge, a tiny smile.
TECHNIQUE: wax crayon and oil pastel on rough paper: thick waxy strokes, a broken heavy outline, paper tooth showing, flat colour scribbled outside the lines. Speaker box tomato #E8553E with steel #63A0AC cones and cream #F6F0DC rings; the cat in black crayon with sun-yellow #F2C62F headphone.
Format: square, flat hot magenta #FF00FF background, 6% margin, no text.
```

**S4-04 Wall souvenirs, paper (photocopy and cut paper).**
```text
Draw a SHEET of 6 paper souvenirs pinned on a wall, each separate, ALL BLANK of writing (no letters and no numbers on any of them; I will write on them):
1. a film-script call sheet: a sheet with three scribbled blocks instead of text, a punched hole, a curled corner;
2. a printed waveform: a strip of paper with a black audio waveform;
3. a film strip with 4 frames, each frame with a tiny doodle: a boot, an umbrella, a smiling moon, a kettle;
4. a cinema ticket (a notched edge, blank);
5. a smaller ticket (blank);
6. a postcard of the coloured houses along a river with an iron footbridge (Girona), with a blank stamp box.
TECHNIQUE: found-object collage: the call sheet, the waveform and the film strip are black-and-white photocopies with coarse halftone, toner speckle and grey edges; the tickets and the postcard are cut from coloured paper with scissors (tomato, sun yellow, steel, butter), with torn corners, creases, tape remnants and one coffee stain.
Format: landscape 3:2, flat hot magenta #FF00FF background, 6% gap between items, no text.
```

**S4-05 Wall souvenirs, objects (felt-tip and instant photos).**
```text
Draw a SHEET of 5 objects pinned on a wall, each separate, with no writing at all:
1. a compact audio cassette; 2. a film reel with three holes;
3, 4, 5. three instant (Polaroid-style) photos with a white border: (3) red boots stamping on a salt flat; (4) a kettle with a screaming face; (5) a smiling paper crescent moon.
TECHNIQUE: the cassette and the reel in felt-tip marker (shaky outline, streaky flat colour outside the line); the three photos as small gouache paintings inside a cream-white border, each painted fast, a bit crooked inside its frame, the border slightly dirty and bent at a corner.
Format: landscape 3:2, flat hot magenta #FF00FF background, 6% gap between items, no text.
```

**S5-02 Skyline of Girona (linocut).**
```text
Draw ONE long strip: the skyline of Girona, a city in Catalonia, as a panorama: a row of tall narrow houses along a river bank with irregular windows, an iron footbridge with a thin lattice, and behind and higher a cathedral with a tall bell tower above a long flight of stairs.
TECHNIQUE: a LINOCUT PRINT in ONE colour (blue-black ink #101820) on paper: carved white windows and roof tiles, chunky gouge marks, uneven ink with starved patches, a rough torn-block edge at the bottom. Houses are simple blocks with irregular windows; the tower is a solid shape with a few openings. No other colour.
Format: a wide strip about 4:1 centred in a 3:2 canvas (I will crop), flat hot magenta #FF00FF background, no text.
```

---

### CHAT 5: PANELS, hand-technique version (SUPERSEDED on 2026-10-30 by the flat-style version in "PF plan B (v14)" at the end of this file; kept for reference)

**S3-01 "Salt Season" (risograph).** Attach `STYLE-COMIC-1.jpg`.
```text
Attach STYLE-COMIC-1.jpg (look only at its chunky shapes and coarse halftone).
Draw ONE comic panel, picture plus its own rough hand-inked border, about 4:3: a flat salt desert under a big low sun, seen from ground level: two giant tomato #E8553E boots mid-stomp coming towards the viewer, kicking up a spray of salt (coarse dots); EXACTLY six bags of salt piled at the left; at the bottom right a baking tray of salt with a tiny microphone on a stand pointing at it. The left boot's toe breaks out of the border.
TECHNIQUE: a three-colour RISOGRAPH print (butter + steel #63A0AC + tomato, with ink): coarse grain, a halftone sun, the layers misregistered by 10 to 15 px (the tomato layer shifted), darker overprint where colours overlap, ink-starved speckles, thick blunt shapes, no fine detail. The panel border is a rough irregular hand-inked line, slightly tilted. Outside the border: flat magenta.
Format: landscape 4:3, flat hot magenta #FF00FF background outside the panel, no text.
```

**S3-02 "Kettle & Crow" (brush ink and gouache).** Attach `STYLE-COMIC-3.jpg`.
```text
Attach STYLE-COMIC-3.jpg (look only at its loose pen line and flat colour).
Draw ONE comic panel shaped like a rough, slightly lopsided disc, periwinkle-lilac inside: a black ink crow whose two wings are open periwinkle #7A8CE8 umbrellas (ribs visible), flying with feet dangling, wearing ONE tiny yellow headphone on one ear; below it a tomato #E8553E kettle on a stove with a panicked screaming face (open mouth, huge eyes), steam jetting from its spout, small flames under it; rain falling from the umbrellas; one lightning flash; in a small window behind, two yellow cat eyes.
TECHNIQUE: a loose brush-pen drawing with flat gouache colour, fast: a thick brush contour with dry gaps, the flat panel colour not reaching the border, coarse halftone dots in one corner, rain as quick strokes, colour off-register.
Format: roughly square, flat hot magenta #FF00FF background outside the panel, no text.
```

**S3-03 "The Understudy Moon" (paper collage).**
```text
Draw ONE panel: a stop-motion set made of cut paper: a layered paper crescent moon in butter #FDEFAF and sun yellow #F2C62F with a visible hinge at the jaw, smiling with closed eyes, held up by two threads and bits of masking tape; a lilac #B58AD6 paper sky; wavy deep-teal #1B6885 paper hills; EXACTLY eight small paper stars hanging by threads; two cardboard cut-out boots on sticks walking along the bottom; a pair of scissors lying in the corner.
TECHNIQUE: PAPER COLLAGE photographed flat: every shape a torn or scissor-cut piece of coloured paper with a visible fibre edge, glued on top of the others, each casting a thin hard shadow underneath; a dashed line of white stitching along one hill; masking-tape pieces; paper grain; slightly crooked cuts. No drawn lines except a few felt-tip details (the moon's closed eye and smile). The whole panel is a rough piece of torn paper with an irregular edge.
Format: landscape 4:3, flat hot magenta #FF00FF background around the paper, no text.
```

---

### One-line fixes (paste in the same chat)
- Background not flat: `The background must be one perfectly flat hot magenta #FF00FF: no texture, no shadow, no gradient, no ground. Nothing in the artwork may be magenta or hot pink.`
- Too clean or digital: `Too clean and digital. Redraw it as a real [linocut / wax crayon / felt-tip / wet brush / photocopy / cut paper / ballpoint / rubber stamp] by a human in a hurry: uneven line weight, lines that miss, colour off-register, material texture, parts left unfinished.`
- Too much detail: `Simpler and bolder: fewer lines, no tiny details, no hairlines, big simple shapes.`
- Misspelled word: `The text must read exactly: [WORDS]. Check every letter, [spell it letter by letter]. Same style, nothing else changes.`
- It has text it should not have: `Remove all writing: no letters, numbers or logos anywhere on this.`
- Items touch or overlap: `Redraw with every item fully separate, at least 6% of the width of empty magenta between any two items and from the edges.`
- A second pair of headphones: `Exactly one pair of headphones, [round her neck / on her head], none anywhere else.`
- Ona looks different: `Ona must match the model sheet exactly: face, hair, earring, sweater, dungarees, socks, boots, headphones.`
- Wrong count: `Exactly [six] [salt bags / paper stars], count them.`
- Shadow or ground under the object: `Remove the shadow and the ground: the object floats on flat magenta.`

### What I do with it (no work for Pau)
1. `tools/ingest_pf.py`: key out the magenta, split the sheets into pieces, name them, trim.
2. `tools/compose_slides.mjs`: lay each slide out (the old layouts as the base: title edge to edge, hero, props, floor, zones for text), with overlaps and broken rules, procedurally torn paper, masking tape, hard shadows, rubber-stamp marks, **misregistration of the colour against the ink** on every piece, paper grain and ink speckle, a slight scanner skew; set all real text in real type (header and footer rows, bio, tags, timeline, contact card, seal 2026, luggage tag) in open-source hand-lettering faces chosen with Pau; render to 1080 x 1920.
3. Save `slide-1..5.webp`, rebuild `sheet`, `contact-sheet`, `thumb`, the Works card and the cover peek; re-measure every pin and sound hotspot (`data.ts`), rewrite the design notes and alt texts, update the fonts card of the "About Ona" panel.
4. Show Pau slide by slide, adjust.

---

## PF plan B (v13): CHAT 4 OBJECTS redone as goofy 3D renders (2026-10-30)

Pau's idea after chats 1 to 3: the objects should **break with everything else** in the deck. Instead of a hand technique each, they become **realistic but goofy 3D renders**, exactly in the style of a reference image he sent (a toy-like handheld console: putty-coloured soft-touch plastic, brushed metal, fat rounded bevels, oversized blue/yellow/red buttons, a yellow smiley knob, corner screws, vent slots, a knurled dial, plug-in tabs, a white cable, soft studio light, floating three-quarter view on a pastel backdrop). This section **replaces** the hand-drawn "CHAT 4: OBJECTS" above. Same IDs, same formats, same files.

- New reference: `C:\Users\User\Documents\Portofolio\_inbox\refs\STYLE-3D.jpg` (the console; it is third party work, used only to copy the rendering style, never its shape, text or screen).
- If a hand-drawn version of any of these IDs was already generated, move it to `_inbox\_old\` so the names do not clash.
- Use a NEW chat for these. Do not paste the plan B RULES block (it forbids 3D renders); paste the 3D RULES below, with `STYLE-3D.jpg` attached, and reply "ready".

### RULES block for the 3D chat (attach `STYLE-3D.jpg`, paste, reply "ready")
```text
RULES FOR EVERY IMAGE IN THIS CHAT. They apply to all my requests until I say otherwise. Reply "ready" and nothing else.

WHAT THIS IS. I am cutting out separate objects to paste into a collage poster. Every request asks for ONE object (or one sheet of separate objects) as a stand-alone 3D product shot. Draw only that: never a scene around it, no table, floor, wall, frame or border, and no hands or people unless a request says so. The object floats in empty space.

STYLE (identical for every image in this chat). Look at the attached reference (STYLE-3D) and match ITS RENDERING STYLE ONLY: a high-end 3D render of a toy-like gadget, real materials with goofy design. Do not copy its shape (never draw a console), its screen picture or any of its writing.
- SHAPES: chunky, soft and over-rounded, with generous bevels and fat, slightly exaggerated proportions, like a designer toy or a tiny gadget from a kids' stop-motion show. Oversized buttons, knobs and handles. Small silly touches as in the reference: a round yellow smiley button or sticker, tiny corner screws, vent slots, a knurled dial, a plug-in tab, a cable with a plug.
- MATERIALS: tactile and believable: matte or satin plastic, soft-touch rubber, brushed or anodised metal, painted metal, fabric, paper, fur, wood. Fine surface grain, small seams, tiny bevel highlights, a few small imperfections. Glossy only where the thing is naturally glossy or wet (an eye, cut watermelon flesh, cellophane). No chrome, no mirror finish.
- LIGHT: big soft studio light from the upper left, a gentle fill from the right, soft ambient occlusion in the crevices, soft bounce light, small soft highlights. No hard shadows, no dramatic contrast, no lens flare, no depth-of-field blur: the whole object is sharp.
- COLOUR: soft pastels with a few saturated primary accents (as in the reference: putty body, blue, yellow and red buttons). Palette: warm putty #E8DCCB, teal #007E9B, deep teal #1B6885, butter #FDEFAF, steel #63A0AC, paper #F6F0DC, sun yellow #F2C62F, tomato #E8553E, salmon #F2A29A, lilac #B58AD6, periwinkle #7A8CE8, celery #9CCF9A, and blue-black #101820 for the darkest parts (never pure black).
- CAMERA: a hero view from a three-quarter angle, slightly from above, the object a little tilted as if floating, a moderate wide lens with little distortion, filling the frame as the request says.
- GOOFY means: fatter, rounder, cuter, one silly detail. Never scary, never uncanny, never grimy.

BACKGROUND. Perfectly flat hot magenta #FF00FF over the whole image, edge to edge (a working colour I will remove). No gradient, vignette, floor, ground, cast shadow or reflection on it. The object has a crisp clean silhouette: no glow, no halo, no magenta rim light, and the magenta must not tint the object. Nothing in the object may be magenta, hot pink or purple-pink. Leave at least 6% of empty magenta all round it and between separate items.

TEXT. No text of any kind unless a request puts a word in capitals between quotes. No logos, brand names, watermarks or numbers.

NOT. Not hand-drawn, no outlines, no cel-shading, no flat vector look, no sketch, no photograph of a real place, no photoreal dirt or grime, no neon or sci-fi glow.
```

### The eleven prompts (one message each; attach `STYLE-3D.jpg` to each)

**S1-01 The giant furry microphone** (cover hero)
```text
Attach STYLE-3D.jpg (copy only its rendering style: materials, soft light, chunky toy shapes, pastels with primary accents; do not draw a console and do not copy its text).
Draw ONE object: a giant boom microphone with a huge furry windscreen (a "dead cat"), bursting towards the viewer on a diagonal from the lower left to the upper right, seen from a low three-quarter angle with strong foreshortening, filling about 85% of the canvas.
FUR: a real 3D fur groom, dense and fluffy, cream-butter #FDEFAF with slightly darker butter roots, long soft tufts that catch the light at their tips, a few flyaway strands. The windscreen is fat and ridiculous, like a fluffy cloud on a stick.
HARDWARE: two periwinkle #7A8CE8 soft-touch straps with small metal rivets round the fur; at the lower end a chunky deep-teal #1B6885 shock mount held by thick tomato #E8553E elastic bands; a fat brushed-aluminium boom pole ending in a big soft-touch sun-yellow #F2C62F rubber grip with a small round smiley-face sticker on it, running off the bottom-right edge; a thick white cable looping out to the lower left and ending in a chunky plug. No hands, no arms.
HIDDEN DETAIL (tiny): two glossy yellow cat eyes with slit pupils and a small salmon nose peeking out of the fur on the upper side.
Format: square, flat hot magenta #FF00FF background, 6% margin (the pole may end at the canvas edge), no text.
```

**S2-02 Celery**
```text
Attach STYLE-3D.jpg (copy only its rendering style: materials, soft light, chunky toy shapes, pastels with primary accents; do not copy its shape or text).
Draw ONE object: a fat bunch of celery floating diagonally: six chubby ribbed stalks cut flat at the base (the cut ends show pale cross-sections with tiny dots), ruffled leafy tops in three clumps, and a small periwinkle #7A8CE8 elastic band tied round the middle.
GOOFY: designer-toy proportions, thick stalks slightly bent as if dancing, puffy crinkled leaves.
MATERIAL: crisp waxy vegetable skin in soft satin, fine ribbing and tiny fibres, celery green #9CCF9A with paler inner faces and a slightly deeper green at the leaf tips, a few small realistic blemishes.
Format: landscape 3:2, flat hot magenta #FF00FF background, 6% margin, no text.
```

**S2-03 Candy wrapper**
```text
Attach STYLE-3D.jpg (copy only its rendering style: materials, soft light, chunky toy shapes, pastels with primary accents; do not copy its shape or text).
Draw ONE object: a hard candy in a twisted cellophane wrapper, floating tilted: a round sweet with sun-yellow #F2C62F and tomato #E8553E swirl stripes, wrapped in crinkly transparent cellophane that is twisted into a fan at both ends. At each twisted end a tiny soft tomato jelly-silicone flame licks up like a little candle flame.
GOOFY: the wrapper ends are oversized and fluffy-fanned, the flames are cute.
MATERIAL: real cellophane, thin, translucent, crinkled, with soft highlights, see-through folds and faint caustics; the sweet is satin boiled sugar.
Format: landscape 3:2, flat hot magenta #FF00FF background, 6% margin, no text.
```

**S2-04 Cabbage**
```text
Attach STYLE-3D.jpg (copy only its rendering style: materials, soft light, chunky toy shapes, pastels with primary accents; do not copy its shape or text).
Draw ONE object: a big round green cabbage floating, with thick overlapping crinkled leaves and pale ribs. Between two leaves peek out two glossy sun-yellow #F2C62F cat eyes with slit pupils and one small black paw with tiny salmon toe beans (a hidden joke); the paw is a soft velvety toy-like shape.
GOOFY: very fat and round, the leaf edges frilly and exaggerated.
MATERIAL: waxy leaves in soft satin with a light bloom and fine veins; celery #9CCF9A, deeper teal-green #007E9B in the folds, butter #FDEFAF at the pale core; the cat parts in blue-black #101820.
Format: square, flat hot magenta #FF00FF background, 6% margin, no text.
```

**S2-05 Umbrella**
```text
Attach STYLE-3D.jpg (copy only its rendering style: materials, soft light, chunky toy shapes, pastels with primary accents; do not copy its shape or text).
Draw ONE object: a half-open umbrella floating tilted, the canopy half unfurled with the ribs showing: matte periwinkle #7A8CE8 nylon with stitched seams and soft folds, brushed-metal ribs and tips, a hooked tomato #E8553E soft-touch handle and a chunky rubber tip. Soft white feathers (real 3D feathers with fine barbs) poke out between the ribs and folds, as if the umbrella is secretly a wing.
GOOFY: a puffy canopy and a fat handle.
Format: landscape 3:2, flat hot magenta #FF00FF background, 6% margin, no text.
```

**S2-06 Watermelon**
```text
Attach STYLE-3D.jpg (copy only its rendering style: materials, soft light, chunky toy shapes, pastels with primary accents; do not copy its shape or text).
Draw ONE object: half a watermelon, cut face up, floating tilted: juicy tomato-red #E8553E flesh with a few black seeds and a pale inner rim, a thick striped rind in celery #9CCF9A and teal #007E9B; a small round-headed wooden toy mallet lying across the flesh; a band-aid (soft fabric plaster in salmon #F2A29A with a white pad) stuck on the rind; one small crack through the rind with a few fine splits and tiny juice drops.
GOOFY: chubby, very thick rind, a toy-sized mallet.
MATERIAL: wet glossy flesh (the only glossy part), satin rind, real wood grain on the mallet, soft fabric on the band-aid.
Format: landscape 3:2, flat hot magenta #FF00FF background, 6% margin, no text.
```

**S4-02 Mixing console**
```text
Attach STYLE-3D.jpg (copy only its rendering style: materials, soft light, chunky toy shapes, pastels with primary accents; do not copy its shape or text).
Draw ONE object: a chunky desktop mixing console seen from a slight above-front three-quarter angle, about 2:1, in warm putty #E8DCCB soft-touch plastic with a brushed steel #63A0AC side panel. On top: a row of 12 short fat faders at different heights (one slightly crooked) with sun-yellow, periwinkle #7A8CE8 and tomato #E8553E caps; six big chunky rubber knobs in two rows, one of them bigger with a small round yellow smiley sticker on top; a few oversized round buttons in blue, yellow and red; a small rounded screen at the top showing a soft green waveform made of simple bars; two small analogue meters with needles. Details: corner screws, vent slots and a knurled metal dial on the side, a white cable looping off the side and ending in a plug, two or three small colourful plug-in tabs sticking out of the sides. At the right end a slim microphone stand with a round salmon #F2A29A pop filter on an angled boom arm. No people.
Format: landscape 3:2, flat hot magenta #FF00FF background, 6% margin, no text.
```

**S4-03 Speaker with the sleeping cat**
```text
Attach STYLE-3D.jpg (copy only its rendering style: materials, soft light, chunky toy shapes, pastels with primary accents; do not copy its shape or text).
Draw ONE object group: a big studio speaker cabinet seen slightly from the front-left: a rounded, bevelled box in tomato #E8553E soft-touch plastic, a large woofer with a steel #63A0AC cone and a thick cream #F6F0DC rubber surround, a smaller tweeter, corner screws, a cable behind it ending in a plug. On top of it a small black cat asleep, curled in a ball, with a tiny pair of sun-yellow #F2C62F over-ear headphones sitting crooked on its head (exactly one pair), one paw hanging over the edge, closed eyes and a tiny smile.
GOOFY: a very chunky speaker with slightly oversized details; the cat is a designer-toy cat.
CAT: soft velvety short fur in blue-black #101820 with a soft rim light so its shape reads against the speaker, salmon toe beans.
Format: square, flat hot magenta #FF00FF background, 6% margin, no text.
```

**S4-04 Wall souvenirs, paper**
```text
Attach STYLE-3D.jpg (copy only its rendering style: materials, soft light, chunky toy shapes, pastels with primary accents; do not copy its shape or text).
Draw a SHEET of 6 paper souvenirs, each separate and floating at a slightly different angle, ALL BLANK of writing (no letters and no numbers on any of them; I will add text myself):
1. a film-script call sheet in cream #F6F0DC paper with three soft grey blocks standing in for text, a punched hole and a curled corner;
2. a strip of paper with a bold black audio waveform printed on it;
3. a film strip with 4 frames, each frame holding a tiny clay-toy miniature: a boot, an umbrella, a smiling moon, a kettle;
4. a cinema ticket with a notched edge, tomato #E8553E, blank;
5. a smaller ticket, sun yellow #F2C62F, blank;
6. a postcard of the coloured houses along a river with an iron footbridge (Girona) as a tiny toy diorama, with a blank stamp box.
MATERIAL: each a real 3D paper object: visible paper thickness at the edges, a slight curl, soft creases, a bit of tape remnant on one corner, matte paper grain, a soft ambient shadow only inside the creases.
Format: landscape 3:2, flat hot magenta #FF00FF background, 6% gap between items, no text.
```

**S4-05 Wall souvenirs, objects**
```text
Attach STYLE-3D.jpg (copy only its rendering style: materials, soft light, chunky toy shapes, pastels with primary accents; do not copy its shape or text).
Draw a SHEET of 5 objects, each separate and floating at a slightly different angle, with no writing at all:
1. a chunky compact audio cassette in warm putty #E8DCCB plastic with a smoky translucent window, two visible reels, a blank tomato label area and a tiny round yellow smiley sticker;
2. a film reel in steel #63A0AC metal with three big round holes and a short curl of film trailing;
3, 4, 5. three instant (Polaroid-style) photos with a thick soft white plastic border, each slightly bent at a corner, each showing a tiny clay-toy 3D miniature scene: (3) a pair of red boots stamping on a white salt flat; (4) a kettle with a screaming face; (5) a smiling paper crescent moon.
GOOFY: fat, rounded, oversized parts.
Format: landscape 3:2, flat hot magenta #FF00FF background, 6% gap between items, no text.
```

**S5-02 Skyline of Girona**
```text
Attach STYLE-3D.jpg (copy only its rendering style: materials, soft light, chunky toy shapes, pastels with primary accents; do not copy its shape or text).
Draw ONE long strip: a toy diorama of the skyline of Girona, a city in Catalonia, seen straight-on from the front like a panorama and standing on a thin chunky clay plinth that is the river bank (the plinth is the bottom edge of the strip). A row of tall narrow chubby houses in soft pastel ochre, salmon, butter, steel and teal with small shuttered windows, little balconies and wobbly rooflines; a slim iron footbridge with a lattice in tomato #E8553E; and behind and higher, a cathedral with a tall bell tower rising above a long flight of stairs.
MATERIAL: matte painted clay, soft-touch resin, rounded edges, tiny seams, as a hand-made miniature rendered in 3D. No sky, no water, no ground beyond the plinth.
Format: a wide strip about 4:1 centred in a 3:2 canvas (I will crop), flat hot magenta #FF00FF background, no text.
```

### One-line fixes for the 3D chat (paste in the same chat)
- Not the reference's look: `Match the reference's rendering: a clean 3D render, chunky over-rounded toy shapes, soft studio light, pastel colours with primary accents. Nothing hand-drawn, no outlines.`
- Too glossy or plasticky: `Less glossy: matte and satin soft-touch materials, small soft highlights only, no mirror reflections.`
- Too serious or realistic: `More goofy: chunkier, rounder, fatter proportions, oversized buttons and handles, one silly detail.`
- Magenta spill or pink edge: `The object has picked up magenta light and a pink edge. Re-render with neutral white light: no magenta tint, glow or halo on the object, a crisp clean silhouette.`
- Background not flat or shadow under it: `The background must be one perfectly flat hot magenta #FF00FF: no floor, no cast shadow, no gradient, no reflection. The object floats.`
- Too dark or dirty: `Cleaner and brighter: soft even light, pastel colours, no grime, no dark shadows.`
- Too many tiny details: `Simpler: fewer tiny details, big readable shapes.`
- It has writing: `Remove all writing: no letters, numbers or logos anywhere on this.`
- Items touch (sheets): `Redraw with every item fully separate, at least 6% of the width of empty magenta between any two items and from the edges.`
- Shape drifts to the console: `Do not draw a console or a handheld gadget. Draw only [the object]; take only the rendering style from the reference.`

### What I do with the 3D pieces
1. `tools/ingest_pf.py`: key the magenta out with a soft edge and a magenta de-spill, split the sheets, trim, name.
2. In the compositions the 3D objects are the deliberate intruders in a hand-drawn poster. To make them sit on the same paper I treat each one as a die-cut sticker: a thin cream cut edge, a hard blue-black offset shadow, a touch of grain, plus tape and torn paper where it overlaps the drawn parts. I test it on slide 2 first and show Pau before doing the rest.
3. The rest of the pipeline (text, layouts, sheet, thumbs, pins) is the same as in v12 above.

---

## PF plan B (v14): CHAT 5 PANELS redone in the bold flat style of a new reference (2026-10-30)

Pau's verdict on the first panel results: they "looked AI-generated" (the risograph / brush / paper-collage prompts gave polished, detailed, over-textured images). New direction: **be faithful to a new reference and step outside the norm.** The reference (`C:\Users\User\Documents\Portofolio\_inbox\refs\STYLE-PANEL.jpg`) is a contemporary flat poster illustration: a woman with a boombox, giant sneaker in the foreground.

What the style is (read from the reference, and what the prompts enforce):
- **Flat, hard-edged colour shapes, no outlines**, no gradients, no highlights, no texture. Shading is one second, darker shape (deep violet) offset under the form.
- **Six or seven colours only**: acid yellow, blaze orange, bubblegum pink, electric violet (+ deep violet), emerald green, cream for the small details (laces, nails, socks).
- **Huge simple shapes**, little detail: a sneaker is five shapes.
- **Extreme scale and crop**: a giant foreground element (the sneaker) thrown at the lens, the subject cropped by the canvas edges, a wild low angle.
- **Fat pink zigzag scribbles laid over the subject**, crossing its edges (the signature).
- **Patterns as design**: a checkerboard (shorts), stripes (socks).
- **Minimal faces** (lips, no eyes), blocky hands with cream nails, slightly naive anatomy.
- **Two-block background** split by an edge (yellow over orange).

This is why the old prompts failed: they asked for many details and textures. The new ones cap the number of elements, forbid outlines, gradients and texture, and force the crop and the scribbles.

This section **replaces** the old "CHAT 5: PANELS" (hand techniques, magenta background). There is **no key colour any more**: every panel runs full bleed to the four edges and I add the frame, shape and tape in code. Same IDs (S3-01 to S3-03). Landscape 4:3, square, landscape 4:3 as before. If any earlier panel result exists, move it to `_inbox\_old\`.

- Use a NEW chat. Do not paste the plan B RULES block. Attach `STYLE-PANEL.jpg` to the rules message and to every prompt.

### RULES block for the panels chat (attach `STYLE-PANEL.jpg`, paste, reply "ready")
```text
RULES FOR EVERY IMAGE IN THIS CHAT. They apply to all my requests until I say otherwise. Reply "ready" and nothing else.

WHAT THIS IS. Each request is ONE bold poster-style illustration that I will use as a comic panel in a collage. The art runs FULL BLEED to all four edges of the canvas: no border, no frame, no margin, no paper edge, no drop shadow, no mockup, nothing outside the picture.

STYLE (identical for every image in this chat). Copy the attached reference (STYLE-PANEL) as faithfully as you can: a contemporary flat poster illustration.
- FLAT SHAPES ONLY: hard-edged areas of solid colour. NO outlines at all: shapes are separated only by colour. No gradients, no soft shading, no highlights, no glow, no blur, no texture, no grain, no rim light, no 3D. Shading is ONE second, darker flat shape (deep violet) placed under or beside a form, slightly offset.
- FEW COLOURS: exactly six flat colours per image, named in the request, from this palette: acid yellow #F7EF35, blaze orange #FF5A00, bubblegum pink #FF6FD8, electric violet #6A1FD0, emerald green #1D9A5E, cream #FBF8E6. Deep violet #2B1068 is also allowed, only for shadow shapes and the darkest forms. Cream is for small details (laces, nails, socks, teeth, threads).
- HUGE SIMPLE SHAPES: big blocky forms, nothing smaller than about 3% of the width (except a tiny hidden detail a request asks for). Simplify everything: a boot is five shapes, not fifty. If in doubt, remove detail. Few objects, each big and readable.
- EXAGGERATED SCALE AND CROP: a wild low-angle view with a GIANT foreground element thrown at the lens and small things far away, like the huge sneaker in the reference. The main subject is cropped by the canvas edges. Bold, a little naive, slightly wonky proportions; shapes slightly irregular, not geometrically perfect, a few edges overshooting, a shadow shape slightly off-register.
- PINK SCRIBBLES: 2 or 3 fat zigzag or looping scribbles in bubblegum pink, as if drawn with a thick round brush, laid OVER the subject and crossing its edges, like the pink squiggles in the reference. Rounded ends, uneven width.
- PATTERN as a design device: one checkerboard or stripe area, like the checked shorts and striped socks in the reference.
- FACES AND HANDS: minimal. A face is one or two flat shapes (the reference has lips and no eyes). Hands are blocky, with cream nails. Never realistic.
- BACKGROUND: two flat colour blocks split by a diagonal or horizontal edge, like the yellow over orange in the reference.
It must look like a human illustrator made it in an hour in a vector or Procreate tool: confident, graphic, slightly rough, intentional.
FORBIDDEN: the typical AI look: smooth polished shading, soft gradients, glossy highlights, tiny decorative details, perfect symmetry, many small objects, cinematic lighting, texture overlays, 3D render, watercolour or painterly look, concept-art look.

DO NOT COPY the reference's subject: no woman, no boombox, no sneakers (boots only where a request asks). Copy only its look.

TEXT. No text, letters, numbers or logos anywhere.
```

### The three prompts (one message each; attach `STYLE-PANEL.jpg` to each)

**S3-01 "Salt Season"**
```text
Attach STYLE-PANEL.jpg (copy its look exactly: flat hard-edged colour, no outlines, a giant foreground element, pink scribbles over the subject, a pattern; do not copy its woman, boombox or sneakers).
Draw ONE full-bleed panel: a salt flat seen from ground level with a wild low-angle view. Foreground, HUGE and cropped by the bottom and right edges: two giant chunky boots mid-stomp coming at the viewer, legs cropped at the shin, in striped socks (one cream-and-emerald stripes, one cream-and-pink stripes), cream laces, violet soles with a wavy tread; the right boot is lifted high and close to the lens, the left one planted. They kick up a spray of salt: big flat cream blobs and dots flying in all directions. Far behind, small: EXACTLY six cream salt sacks tied at the top, piled at the left, and at the right a violet baking tray full of cream salt with a tiny microphone on a stand pointing at it. A huge flat sun disc low on the horizon.
Background: two flat blocks split by a slightly diagonal horizon: blaze-orange sky with an acid-yellow sun disc, cream salt ground with a few deep-violet shadow shapes under the boots and sacks.
COLOURS (exactly six, plus deep violet for shadows): blaze orange, acid yellow, cream, electric violet, emerald (the boots), bubblegum pink (the stripes of one sock and the scribbles).
Two fat bubblegum-pink zigzag scribbles drawn over the boots and across the spray.
Format: landscape 4:3, full bleed, no border, no text.
```

**S3-02 "Kettle & Crow"**
```text
Attach STYLE-PANEL.jpg (copy its look exactly: flat hard-edged colour, no outlines, a giant foreground element, pink scribbles over the subject, a pattern; do not copy its woman, boombox or sneakers).
Draw ONE full-bleed panel: a huge crow flapping across the top, cropped by the top edge, in deep violet #2B1068, with a tiny pair of acid-yellow headphones on its head (exactly one pair). Its two wings are two big open umbrellas with scalloped edges and thin cream ribs, one emerald and one bubblegum pink, its feet dangling. Below, in the foreground, GIANT and cropped by the bottom edge: a blaze-orange kettle on a stove, thrown towards the lens, its face only a huge open screaming mouth in deep violet (no eyes, or two small cream dots), steam jetting from the spout as a thick bubblegum-pink zigzag scribble, two or three small flat flames under it. Rain falls from the umbrellas as short flat cream dashes; one big blaze-orange lightning bolt. In a small deep-violet window on the left, two acid-yellow cat eyes with slit pupils.
Background: two flat blocks split by a diagonal: acid yellow above, electric violet below (the stove counter), with one checkerboard area of violet and deep violet on the counter.
COLOURS (exactly six, plus deep violet): acid yellow, blaze orange, bubblegum pink, electric violet, emerald, cream.
Two more pink scribbles over the crow and the umbrellas.
Format: square, full bleed, no border, no text.
```

**S3-03 "The Understudy Moon"**
```text
Attach STYLE-PANEL.jpg (copy its look exactly: flat hard-edged colour, no outlines, a giant foreground element, pink scribbles over the subject, a pattern; do not copy its woman, boombox or sneakers).
Draw ONE full-bleed panel: a stop-motion stage set made of cardboard and paper, drawn as flat shapes. A big acid-yellow crescent moon with a smiling mouth and one closed eye (a small deep-violet arc), with a visible round hinge at the jaw, held up by two thin cream threads and two cream rectangles of masking tape; EXACTLY eight small acid-yellow paper stars hanging from the top by thin cream threads; wavy emerald hills, one of them with a cream-and-emerald checkerboard pattern. In the foreground, GIANT and cropped by the bottom edge: two cardboard cut-out boots on sticks (blaze orange with darker orange corrugation stripes, thin cream sticks) walking towards the viewer; in one corner a pair of scissors lying flat with bubblegum-pink handles.
Background: electric-violet sky above, the hills below, split by the horizon.
COLOURS (exactly six, plus deep violet for shadows): electric violet, acid yellow, cream, emerald, blaze orange, bubblegum pink.
Two fat bubblegum-pink zigzag scribbles drawn across the moon and the boots.
Format: landscape 4:3, full bleed, no border, no text.
```

### One-line fixes for the panels chat (paste in the same chat)
- Looks AI or too polished: `Too polished and too detailed. Redraw it like a bold flat poster by a human illustrator: huge simple shapes, no outlines, no gradients, no shading except one flat darker shape, no tiny details, a more extreme crop and scale.`
- Has outlines: `Remove every outline. Shapes are separated only by colour changes.`
- Gradients, texture or glow: `Completely flat colour: no gradients, no texture, no grain, no highlights, no glow.`
- Too many colours: `Use only these six flat colours plus deep violet #2B1068 for shadows: [list]. Nothing else.`
- Too clean or symmetrical: `Make the shapes slightly wonky and irregular, with a few edges overshooting and one shadow shape slightly off-register, like a hand-pulled screenprint. Not geometrically perfect.`
- Too many things: `Fewer things: only [the boots, the sacks and the tray]. Each big and simple.`
- No scribbles: `Add two fat bubblegum-pink zigzag scribbles drawn with a thick round brush OVER the subject, crossing its edges.`
- Copies the reference: `Do not draw a woman, a boombox or sneakers. Take only the style from the reference.`
- Has a border or margin: `Remove the border and any margin: the art runs to all four edges.`
- It has writing: `Remove all writing: no letters, numbers or logos anywhere on this.`
- Wrong count: `Exactly [six] [salt sacks / paper stars], count them.`
- Face too realistic: `Simplify the face to one or two flat shapes, no nose, no shading, no realistic eyes.`

### What I do with the panels
1. No keying: the panel is already a full rectangle. I crop it to its shape (rectangle, rough torn edge or lopsided disc).
2. I add the frame, masking tape, a hard blue-black offset shadow, and extra pink scribbles in code over the edges so they cross into the neighbouring pieces.
3. A light paper grain and a few pixels of colour misregistration so the panels sit with the hand-drawn pieces. If Pau prefers them perfectly flat like the reference, I leave them clean.
4. The rest (text, layout, sheet, thumbs, pins) is the same as v12.

---

## GT: the Gotet cast redrawn in a 90s retro rubber-hose style (v15, 2026-10-30)

Pau loves the 90s retro illustration of the whole Gotet brand but not how the CAST is executed (four mascots: Gotet the little glass, Oliva the olive in a barretina, Sifó the soda siphon, Xip the crisp). New reference: `_inbox/refs/STYLE-RETRO.jpg` (a retro font specimen with rubber-hose mascots: thick ink outline, flat saturated colour with a lighter and a darker hard shape, huge white cartoon eyes, white 3-finger gloves, chunky sneakers, a flat dark ground ellipse, sparkles). Only the drawing style is copied; the characters, props, names, personalities and brand colours stay.

### Files and names
- Results go to `C:\Users\User\Documents\Portofolio\_inbox\gotet\` named with their ID (`GT-01.png` ...). Several versions: add a letter (`GT-01b.png`).
- References (in `_inbox\refs\`): `STYLE-RETRO.jpg` (the style), `GT-REF-cast.jpg` (the four characters today, whole sheet), `GT-REF-gotet.png`, `GT-REF-oliva.png`, `GT-REF-sifo.png`, `GT-REF-xip.png` (one column each: pose A, pose B and the two heads of today).
- What a character needs (the site's files): pose A, pose B, and the faces E1 Hola / E2 Xin-xin / E3 Psst / E4 Mmm as heads. Today's choices: Gotet A "Hug the cube" (Mmm), B "Jump!" (Xin-xin); Oliva A "Wave and flag" (Hola), B "Tip the cap" (Mmm); Sifó A "Press the lever" (Hola), B "Pour and wink" (Psst); Xip A "Shrug" (Psst), B "Dance" (Xin-xin).

### Order (ONE chat for all, so the family stays a family)
Rules message, then GT-01 (Gotet A) and approve it. Every later prompt also attaches the approved GT-01 as the family look. Then GT-02, GT-03 (Gotet), GT-04 to GT-06 (Oliva), GT-07 to GT-09 (Sifó), GT-10 to GT-12 (Xip), and last GT-13 (the four together).

### Rules message (new chat; attach `STYLE-RETRO.jpg` and `GT-REF-cast.jpg`; reply "ready")
```text
This chat redraws the CAST of Gotet, an invented vermuteria (a Catalan vermouth bar) in Cardedeu, as a family of four cartoon mascots. I will send one request per picture. Reply "ready" and nothing else.

THE TWO IMAGES. STYLE-RETRO is the DRAWING STYLE to copy: a 90s retro rubber-hose cartoon. Copy ONLY how it is drawn. Never copy its words, fonts, layouts, windows, stickers, or its sun, camera and cup characters, and not its colours. GT-REF-cast shows the four characters as they are today: keep WHO they are (shape, props, name), redraw them in the new style.

THE CAST (never change who they are):
1. GOTET, "the little glass": a short tumbler is his body, filled with red vermouth, two pale ice cubes at the top, a lemon slice on the rim. Gentle, shy, sunny; he blushes first and talks second. Catch phrase "Un gotet?".
2. OLIVA, "the olive in a barretina": a green olive with a red Catalan barretina (a soft long red cap that flops to one side) and a banderilla (a thin cocktail stick with a small pennant flag). The host: warm, talkative, welcomes everybody. "Passa, passa!"
3. SIFO, "the soda siphon": the tallest, a slim blue siphon bottle with a brass-yellow pump head, a lever, a spout and a red bow tie. The maître: dramatic, vain, bubbly. "Psssh!"
4. XIP, "the crisp": a ruffled yellow potato crisp with a bite taken out of its top right edge. The joker: dry wit, one raised eyebrow, one wink. "Crec!"

STYLE LOCK (identical for every picture in this chat):
- OUTLINE: one bold, even, blue-black ink line (#211736) round every shape, very thick (about 1.5 percent of the picture height), round line ends; inner detail lines at half that weight. Clean and confident, never sketchy, never thin.
- COLOUR: flat opaque fills in the brand colours only: vermouth red #D8283B, olive green #86A22F, siphon blue #2340C0, butter yellow #FFD34E, pale pink #F8D2D0, white, ink #211736. Each body has ONE lighter hard-edged highlight shape (top left) and ONE darker hard-edged shade shape (bottom right), plus one or two tiny white glints. No gradients, no soft shading, no texture, no glow, no 3D.
- EYES AND FACE: huge cartoon eyes: two tall white ovals with a thick ink outline, big black pupils with a small white glint, short thick eyebrows. A wide mouth with an ink outline, deep red inside, a pink tongue and white teeth when open. Two flat round pink cheek ovals.
- LIMBS: thin black noodle arms and legs of one constant thickness (rubber hose), no elbows or knees. Hands are white cartoon gloves with THREE fingers and a thumb, a thick outline and a small cuff. Feet are chunky 90s sneakers with a white toe cap and a thick white sole and two short lace lines.
- GROUND SHADOW: a flat solid ink-coloured ellipse under the feet (not for heads, not when a character is in the air: then it floats far below).
- SPARKLES: one to three four-point sparkles (white or butter yellow, ink outline) near the character, and tiny motion marks where it moves.
- LIFE: bouncy, slightly asymmetric poses, a big round chunky body, short legs. It must look inked by a human cartoonist, not generated: simple bold shapes, small imperfections in the line, no tiny details.
- NOT: thin outlines, pastel, gradients, glossy or 3D, realistic, anime, a vector look without outlines, background pattern, props that were not named, extra characters.

BACKGROUND. Perfectly flat cyan #00E5FF over the whole picture, edge to edge (a working colour I will remove). No gradient, no texture, no floor, no cast shadow except the character's own ink ellipse. Nothing in the characters may be cyan. Leave at least 8 percent of empty cyan all round.

TEXT. No letters, words or numbers anywhere.
```

### The prompts

**GT-01 · Gotet, pose A "Hug the cube"** (attach `GT-REF-gotet.png` and `STYLE-RETRO.jpg`)
```text
Attach GT-REF-gotet.png (IMAGE 1: what to draw: Gotet, the character and his props only) and STYLE-RETRO.jpg (IMAGE 2: how to draw it).
Draw ONE full-body picture of GOTET, the little glass, in pose A "Hug the cube", in the 90s rubber-hose style of the rules.
CHARACTER: a short tumbler is his body: pale glass rim, red vermouth #D8283B inside with a lighter highlight shape and a darker shade shape, two pale ice cubes floating at the top, three tiny bubbles, a butter-yellow #FFD34E lemon slice with a red rim perched on the upper left of the rim.
FACE (Mmm): eyes closed in two happy arches with thick lashes, two flat pink cheeks, a small content closed smile.
POSE: standing, three-quarter view, both white gloves hugging a big pale ice cube against his chest, shoulders hunched shyly, one noodle leg slightly bent. Blue #2340C0 sneakers with white soles. One sparkle at the upper right. Flat ink ground ellipse.
Format: portrait 4:5, the figure filling 85 percent of the height, flat cyan #00E5FF background, no text.
```

**GT-02 · Gotet, pose B "Jump!"** (attach `GT-REF-gotet.png`, `STYLE-RETRO.jpg` and the approved `GT-01.png`)
```text
Attach GT-REF-gotet.png (IMAGE 1: what to draw), STYLE-RETRO.jpg (IMAGE 2: how to draw it) and the approved GT-01.png (IMAGE 3: the family look: copy its line weight, eyes, gloves and sneakers exactly).
Draw ONE full-body picture of GOTET in pose B "Jump!": the same character as in IMAGE 3.
FACE (Xin-xin): eyes squeezed into joyful arches, a huge open laughing mouth with a pink tongue, flat pink cheeks.
POSE: mid-air leap, both arms thrown up with open white gloves, legs kicked out in a rubber-hose scissor, sneakers pointing in different directions; a few red vermouth drops and one ice cube flying out of the top; the lemon slice bouncing on the rim. Two sparkles and three small motion marks. The ink ground ellipse floats far below the feet, small and flat.
Format: portrait 4:5, the figure filling 85 percent of the height, flat cyan #00E5FF background, no text.
```

**GT-03 · Gotet, the four faces** (same attachments as GT-02)
```text
Attach GT-REF-gotet.png (IMAGE 1: what to draw), STYLE-RETRO.jpg (IMAGE 2: how to draw it) and the approved GT-01.png (IMAGE 3: the family look).
Draw FOUR HEADS of GOTET in one row, evenly spaced, all the same size. "Head" means the glass body only, with its lemon slice, ice and bubbles: NO arms, NO legs, NO gloves, NO sneakers, no ground shadow.
From left to right, four faces:
E1 HOLA: a wide open smile with teeth and tongue, eyes wide open, one eyebrow raised.
E2 XIN-XIN: eyes squeezed into joyful arches, a huge open laughing mouth.
E3 PSST: one eye winking, the other wide open, a mouth smirking to one side with the tongue sticking out.
E4 MMM: eyes closed in relaxed arches, a small closed content smile, extra rosy cheeks.
Everything else identical in the four. Format: landscape 3:2, one row, flat cyan #00E5FF background, no text.
```

**GT-04 · Oliva, pose A "Wave and flag"** (attach `GT-REF-oliva.png`, `STYLE-RETRO.jpg`, approved `GT-01.png`)
```text
Attach GT-REF-oliva.png (IMAGE 1: what to draw: Oliva, the character and her props only), STYLE-RETRO.jpg (IMAGE 2: how to draw it) and the approved GT-01.png (IMAGE 3: the family look: copy its line weight, eyes, gloves and sneakers exactly).
Draw ONE full-body picture of OLIVA, the olive in a barretina, in pose A "Wave and flag".
CHARACTER: a plump green olive #86A22F as the body with a lighter highlight shape and a darker shade shape; on top a red #D8283B barretina, a soft long Catalan cap that flops over to the right with a darker red shade and a white glint; in one glove a thin butter-yellow cocktail stick (a banderilla) with a small red pennant flag at the top.
FACE (Hola): a wide open welcoming smile, eyes wide, flat pink cheeks.
POSE: standing, leaning slightly forward, one white glove waving high, the other holding the stick planted on the ground like a flagpole. Red sneakers with white soles. Two sparkles. Flat ink ground ellipse.
Format: portrait 4:5, the figure filling 85 percent of the height, flat cyan #00E5FF background, no text.
```

**GT-05 · Oliva, pose B "Tip the cap"**
```text
Attach GT-REF-oliva.png (IMAGE 1: what to draw), STYLE-RETRO.jpg (IMAGE 2: how to draw it) and the approved GT-01.png (IMAGE 3: the family look).
Draw ONE full-body picture of OLIVA in pose B "Tip the cap": the same character as in IMAGE 1.
FACE (Mmm): eyes closed in relaxed arches, a small content closed smile, rosy cheeks.
POSE: a stylish greeting: one white glove lifts the barretina off the top of her head by its tip, the other holds the banderilla at her side; one foot stepping forward, the other heel up. Red sneakers with white soles. One sparkle by the lifted cap, a few small motion marks. Flat ink ground ellipse.
Format: portrait 4:5, the figure filling 85 percent of the height, flat cyan #00E5FF background, no text.
```

**GT-06 · Oliva, the four faces**
```text
Attach GT-REF-oliva.png (IMAGE 1: what to draw), STYLE-RETRO.jpg (IMAGE 2: how to draw it) and the approved GT-01.png (IMAGE 3: the family look).
Draw FOUR HEADS of OLIVA in one row, evenly spaced, all the same size. "Head" means the olive body with her red barretina only: NO arms, NO legs, NO gloves, NO sneakers, NO banderilla, no ground shadow.
From left to right: E1 HOLA (wide open smile with teeth and tongue, eyes wide, one eyebrow raised), E2 XIN-XIN (eyes squeezed into joyful arches, a huge open laughing mouth), E3 PSST (one eye winking, a smirk to one side with the tongue out), E4 MMM (eyes closed in relaxed arches, a small closed content smile, extra rosy cheeks).
Everything else identical in the four. Format: landscape 3:2, one row, flat cyan #00E5FF background, no text.
```

**GT-07 · Sifó, pose A "Press the lever"**
```text
Attach GT-REF-sifo.png (IMAGE 1: what to draw: Sifó, the character only), STYLE-RETRO.jpg (IMAGE 2: how to draw it) and the approved GT-01.png (IMAGE 3: the family look: copy its line weight, eyes, gloves and sneakers exactly).
Draw ONE full-body picture of SIFO, the soda siphon, in pose A "Press the lever".
CHARACTER: the tallest of the cast: a slim blue #2340C0 siphon bottle as the body with a lighter highlight shape, a darker shade shape and tiny white bubbles, a brass-yellow #FFD34E pump head with a lever and a curved spout, a red #D8283B bow tie at the neck.
FACE (Hola): wide open showman smile, eyes wide, one eyebrow raised, flat pink cheeks.
POSE: standing very upright and proud, one white glove raised high pressing the lever on top, a thin white arc of soda spraying out of the spout and ending in a few round bubbles, the other glove on his hip. Butter-yellow sneakers with white soles. Two sparkles. Flat ink ground ellipse.
Format: portrait 4:5, the figure filling 88 percent of the height, flat cyan #00E5FF background, no text.
```

**GT-08 · Sifó, pose B "Pour and wink"**
```text
Attach GT-REF-sifo.png (IMAGE 1: what to draw), STYLE-RETRO.jpg (IMAGE 2: how to draw it) and the approved GT-01.png (IMAGE 3: the family look).
Draw ONE full-body picture of SIFO in pose B "Pour and wink": the same character as in IMAGE 1.
FACE (Psst): one eye winking, the other wide open, a smirk to one side with the tongue sticking out, flat pink cheeks.
POSE: the body tilted back in a dramatic lean, one white glove on the lever, the spout pointing up and to the right with a long soda arc ending in bubbles, the other glove giving a thumbs-up; one leg kicked back. Butter-yellow sneakers with white soles. Two sparkles. Flat ink ground ellipse.
Format: portrait 4:5, the figure filling 88 percent of the height, flat cyan #00E5FF background, no text.
```

**GT-09 · Sifó, the four faces**
```text
Attach GT-REF-sifo.png (IMAGE 1: what to draw), STYLE-RETRO.jpg (IMAGE 2: how to draw it) and the approved GT-01.png (IMAGE 3: the family look).
Draw FOUR HEADS of SIFO in one row, evenly spaced, all the same size. "Head" means the blue bottle with its brass pump head and red bow tie only: NO arms, NO legs, NO gloves, NO sneakers, no soda arc, no ground shadow.
From left to right: E1 HOLA (wide open smile with teeth and tongue, eyes wide, one eyebrow raised), E2 XIN-XIN (eyes squeezed into joyful arches, a huge open laughing mouth), E3 PSST (one eye winking, a smirk to one side with the tongue out), E4 MMM (eyes closed in relaxed arches, a small closed content smile, extra rosy cheeks).
Everything else identical in the four. Format: landscape 3:2, one row, flat cyan #00E5FF background, no text.
```

**GT-10 · Xip, pose A "Shrug"**
```text
Attach GT-REF-xip.png (IMAGE 1: what to draw: Xip, the character only), STYLE-RETRO.jpg (IMAGE 2: how to draw it) and the approved GT-01.png (IMAGE 3: the family look: copy its line weight, eyes, gloves and sneakers exactly).
Draw ONE full-body picture of XIP, the crisp, in pose A "Shrug".
CHARACTER: a round ruffled potato crisp as the body, butter yellow #FFD34E with a lighter highlight shape, a darker shade shape, a few tiny crisp-seasoning dots, and a clean round bite taken out of the top right edge with two tiny crumbs.
FACE (Psst): one eyebrow raised high, one eye winking, a smirk to one side with the tongue out, flat pink cheeks. Dry humour.
POSE: standing, both white gloves held out to the sides with palms up in a big shrug, shoulders up, one foot crossed over the other. Blue #2340C0 sneakers with white soles. One sparkle. Flat ink ground ellipse.
Format: portrait 4:5, the figure filling 85 percent of the height, flat cyan #00E5FF background, no text.
```

**GT-11 · Xip, pose B "Dance"**
```text
Attach GT-REF-xip.png (IMAGE 1: what to draw), STYLE-RETRO.jpg (IMAGE 2: how to draw it) and the approved GT-01.png (IMAGE 3: the family look).
Draw ONE full-body picture of XIP in pose B "Dance": the same character as in IMAGE 1.
FACE (Xin-xin): eyes squeezed into joyful arches, a huge open laughing mouth, flat pink cheeks.
POSE: a retro dance move: one leg kicked high, the other bent, one white glove pointing up and the other swinging down, the body tilted. Blue sneakers with white soles. Two sparkles and four small music-like motion marks (no notes, only dashes and dots). Flat ink ground ellipse.
Format: portrait 4:5, the figure filling 85 percent of the height, flat cyan #00E5FF background, no text.
```

**GT-12 · Xip, the four faces**
```text
Attach GT-REF-xip.png (IMAGE 1: what to draw), STYLE-RETRO.jpg (IMAGE 2: how to draw it) and the approved GT-01.png (IMAGE 3: the family look).
Draw FOUR HEADS of XIP in one row, evenly spaced, all the same size. "Head" means the crisp body with its bite only: NO arms, NO legs, NO gloves, NO sneakers, no ground shadow.
From left to right: E1 HOLA (wide open smile with teeth and tongue, eyes wide, one eyebrow raised), E2 XIN-XIN (eyes squeezed into joyful arches, a huge open laughing mouth), E3 PSST (one eye winking, a smirk to one side with the tongue out), E4 MMM (eyes closed in relaxed arches, a small closed content smile, extra rosy cheeks).
Everything else identical in the four. Format: landscape 3:2, one row, flat cyan #00E5FF background, no text.
```

**GT-13 · The family** (attach `STYLE-RETRO.jpg` and the four approved poses A: `GT-01.png`, `GT-04.png`, `GT-07.png`, `GT-10.png`)
```text
Attach the four approved characters (IMAGES 1 to 4: Gotet, Oliva, Sifo and Xip: keep each one exactly as drawn) and STYLE-RETRO.jpg (IMAGE 5: the style).
Draw ALL FOUR TOGETHER in one picture, standing shoulder to shoulder in a row, facing the viewer, in this order from left to right: Gotet, Oliva, Sifo (the tallest, clearly taller than the others), Xip. Each one in a friendly pose of its own (Gotet hugging his ice cube, Oliva waving with her flag, Sifo with a hand on the lever, Xip shrugging), all looking at the viewer, slightly overlapping at the gloves and sneakers. One shared flat ink ground ellipse under each pair of feet. Three sparkles between them. Same style, same line weight, same colours as the approved characters.
Format: landscape 3:2, the group filling 90 percent of the width, flat cyan #00E5FF background, no text.
```

### One-line fixes (paste in the same chat)
- Thin or sketchy line: `The outline is too thin. Redraw with one bold even blue-black ink line, very thick, round line ends, thinner inner lines at half weight.`
- Gradients, 3D or glossy: `No gradients, no soft shading, no 3D, no gloss. Flat colour with one lighter hard shape and one darker hard shape only.`
- Not retro enough: `Closer to STYLE-RETRO: huge white cartoon eyes, white three-finger gloves, chunky sneakers with white soles, noodle limbs, a bouncy pose.`
- Looks generated or too perfect: `Make it feel inked by a human cartoonist: slightly asymmetric, a few small imperfections in the line, simpler shapes, no tiny details.`
- Wrong hands: `White gloves with exactly three fingers and a thumb on each hand, a thick outline, a small cuff.`
- Character drifts: `Keep the character exactly as in IMAGE 3 (the approved one): same body shape, props, eye style, gloves and sneakers.`
- Off-brand colours: `Use only these colours: #D8283B, #86A22F, #2340C0, #FFD34E, #F8D2D0, white and ink #211736.`
- Background not flat or has cyan on the character: `The background must be one perfectly flat cyan #00E5FF with nothing else; nothing in the character may be cyan.`
- It has writing: `Remove all letters and words: no text anywhere.`
- Sifó without the water (for the clean versions I need): `The same picture, same pose, but remove the soda arc and every bubble. Nothing else changes.`
- Heads have a body: `Heads only: no arms, no legs, no gloves, no shoes, no ground shadow.`

### What I do with it (no work for Pau)
1. `tools/ingest_gotet.py`: key out the cyan, trim, split each four-faces sheet into its four heads, name the files `mascot-<name>-a / -b / -head-1 / -head-2` with the faces the copy says (Gotet E4 + E2, Oliva E1 + E4, Sifó E1 + E3, Xip E3 + E2) and keep all sixteen faces for the panel.
2. Rebuild `cast.webp`, `cast-sheet.webp` and the small copies in `brand/s/`; the live top zone of the board takes the new files by itself; update the cast rules in the panel (white gloves and a 90s look instead of pink gloves and the 1930s) and the alt texts.
3. **Pending decision:** the 20 mockups, the 3 posters and `board.webp` have the old cast baked in. After the cast is approved I either recompose them with the new characters or prepare their prompts.
