# Image prompts for ChatGPT (and how the images come back)

Version 4 (2026-10-29), the definitive Catalog set. Pau threw away three earlier directions (flat riso colour, five-reference graphite, one-reference graphite) and fixed the brief:

- The style master is the flat felt-tip marker figure (orange hoodie, cobalt line, pink laces): `_inbox/refs/STYLE-MASTER.jpg`.
- Each Catalog sketch is a **simple sketch in exactly 4 colours**, chosen to contrast with the colour of its folder.
- No character is required, and the ten do **not** share a structure: same artistic hand, a different idea and composition each, "as if one artist had designed each folder one by one".
- They are not a small motif any more: each is a **wide frieze behind the title of its folder**, at low opacity, filling much of the horizontal band.

Version 6 adds PR (the four Process scenes: a restyle of the scenes already on the site, two references per prompt: see the PR section). PF and ST are still open: they get their prompts when Pau gives the direction for each category.

## The system

Every image has an ID: `AREA-NN`. Save the result with the ID as its name in `C:\Users\User\Documents\Portofolio\_inbox\` (git ignores that folder). If you make several versions add a letter: `CAT-04b.png`.

| Area | IDs | What it replaces | Status |
|---|---|---|---|
| `CAT` | CAT-01 .. CAT-10 | the grey sketch next to each name in the Catalog, now a faint full-width background of the folder | **defined below (v4)** |
| `PF` | PF-01 .. PF-05 | the five slides of folder 09 (A Portfolio for a Client) | waiting for Pau's direction |
| `ST` | ST-01 .. ST-09 | the nine stickers of folder 10 (Sticker Sheet) | waiting for Pau's direction |
| `PR` | PR-01 .. PR-04 | the four big scenes of the Process film (section 05): COLLECT, SKETCH, MAKE, DELIVER | **defined below (v5)** |

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

## PF and ST

Open. Pau gives the art direction and references for each category, then the prompts are written like the CAT and PR sets. The IDs, the file names and the filing procedure stay as before:

- `PF-NN` becomes `public/works/concept-portfolio/art/slide-N.webp` (1080x1920) plus the derived sheet, contact sheet, thumb, peek and card art.
- `ST-NN` becomes `sticker-NN.webp` (1200x1600 transparent) and `thumb-NN.webp` (300x400), then `build-shapes.py` and the card art (see `docs/api/world-illustration.md`).
