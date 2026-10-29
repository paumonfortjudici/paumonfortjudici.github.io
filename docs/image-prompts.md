# Image prompts for ChatGPT (and how the images come back)

Version 4 (2026-10-29), the definitive Catalog set. Pau threw away three earlier directions (flat riso colour, five-reference graphite, one-reference graphite) and fixed the brief:

- The style master is the flat felt-tip marker figure (orange hoodie, cobalt line, pink laces): `_inbox/refs/STYLE-MASTER.jpg`.
- Each Catalog sketch is a **simple sketch in exactly 4 colours**, chosen to contrast with the colour of its folder.
- No character is required, and the ten do **not** share a structure: same artistic hand, a different idea and composition each, "as if one artist had designed each folder one by one".
- They are not a small motif any more: each is a **wide frieze behind the title of its folder**, at low opacity, filling much of the horizontal band.

Version 5 adds PR (the four Process scenes, pastel pop, separate objects: see the PR section). PF and ST are still open: they get their prompts when Pau gives the direction for each category.

## The system

Every image has an ID: `AREA-NN`. Save the result with the ID as its name in `C:\Users\User\Documents\Portofolio\_inbox\` (git ignores that folder). If you make several versions add a letter: `CAT-04b.png`.

| Area | IDs | What it replaces | Status |
|---|---|---|---|
| `CAT` | CAT-01 .. CAT-10 | the grey sketch next to each name in the Catalog, now a faint full-width background of the folder | **defined below (v4)** |
| `PF` | PF-01 .. PF-05 | the five slides of folder 09 (A Portfolio for a Client) | waiting for Pau's direction |
| `ST` | ST-01 .. ST-09 | the nine stickers of folder 10 (Sticker Sheet) | waiting for Pau's direction |
| `PR` | PR-01 .. PR-04 | the four big scenes of the Process film (section 05): COLLECT, SKETCH, MAKE, DELIVER | **defined below (v5)** |

`_inbox/refs/STYLE-PROCESS.jpg` (the "Small objects in time" poster grid) is the reference for every PR prompt. `_inbox/refs/STYLE-MASTER.jpg` is the reference for every CAT prompt. `REF-2` .. `REF-5` (the crayon, ink and pen references) are kept for the other categories. The graphite experiments are archived in `_inbox/_old/` and are not used.

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

## PR: the four Process scenes (pastel pop, separate objects)

### How the pictures are used on the site (this decides the format)

Each step of the film is a flat panel (01 COLLECT marigold `#FFB81C`, 02 SKETCH bubblegum `#FF8FC1`, 03 MAKE tomato `#FF4B2B`, 04 DELIVER lagoon `#0F9AA8`) with the scene on the left (about 480 x 515 css px, 14:15) and the text on the right. Today the scene is a vector drawing whose objects **land one after another and draw themselves** when the frame becomes the active one; Pau wants that little entrance kept and only the illustration changed. The tool tokens of "On my desk" stay as they are.

To keep the entrance with raster art, **each scene is drawn as separate objects on the flat panel colour**:

1. ChatGPT draws 1024x1024, objects separated by at least 5% gaps, on the exact panel colour.
2. The ingest script keys the flat colour out (as for the Catalog), splits the picture into its connected pieces (parts closer than about 18 px are one object; tiny pieces become sparkles), saves each piece as a transparent WebP and writes a manifest (position and size of every piece, in percent of the scene box).
3. The bench renders the pieces absolutely positioned in the 14:15 box. When the frame develops, each piece lands in turn (a short spring with a few degrees of settle), then idles with a tiny bob while the frame is the active one; the existing hard offset shadow comes back as a CSS `drop-shadow`. Reduced motion and "Pause motion": every piece is in place from the first paint, no loops. If two objects were drawn touching, they simply land together.
4. The label-maker strips of the old scenes stay hidden for these (the pictures carry no text); the alt text of each scene (`STEP_STYLE[i].alt`) stays.

Filing target: `public/process/scene-0N/` (pieces + manifest), then the step index goes into `SCENE_IMAGES` (`process/images.ts`).

### Chat opening message (new chat, paste first, attach `STYLE-PROCESS.jpg`)

```text
The attached image is the STYLE REFERENCE. Over this chat we will draw FOUR illustrations, one for each step of a design process (COLLECT, SKETCH, MAKE, DELIVER), for a portfolio website. All four must look as if the same illustrator drew them, in the world of the reference: fun, chunky, flat and artistic. Do not draw anything yet. Study the image, reply "ready" and describe back to me, in six lines, what makes its style. Ignore its lettering: our drawings have no text.

THE STYLE (copy the style, never the subjects):
- FLAT POP GOUACHE. Every shape is a flat, opaque fill with slightly irregular, hand-cut edges, as if painted with a chunky brush or cut from paper. No gradients, no airbrush, no 3D, no photo texture, no cast shadows.
- INK OUTLINE. The main shapes of each object have a thick, wobbly dark outline in ink (#17101B), one constant weight (about 1.3% of the canvas width), round ends, overshooting and leaving small gaps like a real brush line. Small details may have no outline at all.
- FLAT SHADING. Volume comes only from ONE flat, hard-edged, darker shape on the shadow side of an object and one cream highlight stroke or blob. Never a gradient.
- ONE PATTERN PER OBJECT. Every object carries one hand-drawn decoration (stripes, polka dots, zigzag, checks, a spiral of dashes), a little irregular.
- ACTION MARKS. Short radiating dashes, zigzags and tiny four-point stars float near some objects, as separate small pieces.
- CHUNKY, SIMPLIFIED SHAPES. Proportions are exaggerated and a little wonky: a flat front view or a gentle three-quarter view, tilted a few degrees. Playful, warm, pastel pop.

THE COLOUR. Pastel pop: soft, chalky candy tones (cream, butter, bubblegum, lilac, mint, sky blue) balanced by one juicy accent per drawing. Each request gives the exact palette. Use only those colours plus the ink outline.

THE BACKGROUND. One perfectly flat, uniform fill of the colour given in each request (it is the colour of the panel the drawing will sit on), edge to edge. No object may use that colour as a fill. No ground, no table, no shadow, no frame, no vignette, no paper texture. NO TEXT of any kind: no letters, no numbers, no logos (a label is an empty shape or a scribble).

THE KEY RULE: SEPARATE OBJECTS. I will cut every object out and animate them dropping in one after another. So each object is its own separate cut-out. Objects NEVER touch or overlap each other or the edge of the canvas: leave at least 5% of the canvas width of empty background between any two of them. All the parts of one object stay connected (a pin belongs to its card). Sparkles are separate tiny pieces.

THE COMPOSITION. A loose, balanced still life floating on the flat colour: one big HERO object (about 36% of the canvas width) a little left of centre, three medium objects (22 to 26%), three or four small ones (12 to 18%) and four to six tiny sparkles. Objects are tilted between 3 and 12 degrees, never all the same way. The whole group fills about 88% of the canvas and is centred.

THE FORMAT. Square, 1024x1024.

FORBIDDEN: text, letters, numbers, logos, hands, faces (unless a request asks for one), extra objects, shadows, outlines in any colour but ink.

With every request I will attach the style reference again.
```

### The four prompts (one message each, attach `STYLE-PROCESS.jpg` to each)

**PR-01 COLLECT**

```text
Attach the style reference. Same illustrator and the same rules as the opening message.

STEP: 01 COLLECT. Gathering references: boards of ideas, screenshots, objects from my desk.
BACKGROUND: perfectly flat marigold #FFB81C, edge to edge. Never use yellow, orange or butter as a fill.
PALETTE: ink #17101B outlines, cream #FFF2DA, bubblegum #FF8FC1, lilac #B79CFF, sky blue #85CEF9, ultraviolet #5B3DF5 as the juicy accent, tomato #FF4B2B only for the push pins.
OBJECTS (each one separate, at least 5% of empty background between all of them):
1. HERO: a big round magnifying glass with a thick ultraviolet handle; its cream lens shows a magnified strip of four colour chips (bubblegum, lilac, sky blue, ultraviolet).
2. A landscape photo card (cream) with a tomato push pin at the top; the picture is a cream sun over two hills, one lilac and one sky blue.
3. A portrait card (cream) with a tomato push pin; the picture is a simple lilac face silhouette on a sky-blue ground.
4. A square sticky note in bubblegum with one curled corner and a single loop-the-loop line drawn on it.
5. A long narrow swatch strip: a cream card with five colour chips in a row.
6. A magazine clipping with a torn edge: one thick headline bar, a photo box with a bold diagonal cross, three short columns of wavy lines.
7. A ticket stub in sky blue with two notches and a star.
8. One loose tomato push pin, small.
SPARKLES: five tiny four-point stars and dash bursts, in ink and ultraviolet.
PATTERNS: diagonal stripes on the magnifier handle, polka dots on the ticket.
Must read at a glance: collecting references.
Add nothing else. Square 1024x1024, flat marigold background, no text.
```

**PR-02 SKETCH**

```text
Attach the style reference. Same illustrator and the same rules as the opening message.

STEP: 02 SKETCH. Dozens of rough thumbnails on paper, then one chosen sketch grows into a finished character on a tablet.
BACKGROUND: perfectly flat bubblegum pink #FF8FC1, edge to edge. Never use pink, magenta or salmon as a fill.
PALETTE: ink #17101B outlines, cream #FFF2DA, butter #FBE79A, sky blue #85CEF9, mint #8EEBC3, ultraviolet #5B3DF5, tomato #FF4B2B as the juicy accent (the little devil).
OBJECTS (each one separate, at least 5% of empty background between all of them):
1. HERO: a spiral notepad page (cream) with ultraviolet spiral rings along the top, filled with a grid of six tiny thumbnail sketches (3 by 2) of the same little devil head (round head, two small horns, a grin); one of the six is circled with a loose loop and has a tick next to it.
2. A big pencil lying diagonally: butter body with a stripe pattern, a sharpened wooden tip with an ink graphite point, a mint metal ferrule and a sky-blue eraser.
3. A drawing tablet with a sky-blue frame whose cream screen shows ONE big finished red devil character (tomato): round head, two horns, wide grin, a thin tail with an arrow tip, bold ink outline.
4. A slim stylus pen in ultraviolet with a pointed tip and a clip.
5. A mint pencil sharpener with one curl of wood shaving, all connected as one object.
6. Three crumpled paper balls (cream, with fold lines), each one a separate small object of a slightly different size: the rejected thumbnails.
7. A ruler in butter with ink tick marks (no numbers), lying at an angle.
SPARKLES: five tiny four-point stars and dash bursts, in ink and ultraviolet.
PATTERNS: stripes on the pencil, polka dots on the sharpener.
Must read at a glance: sketching a character.
Add nothing else. Square 1024x1024, flat bubblegum background, no text.
```

**PR-03 MAKE**

```text
Attach the style reference. Same illustrator and the same rules as the opening message.

STEP: 03 MAKE. The chosen sketch gets built properly: vectors, page layouts, photo retouching, a quick clay sculpt, a grid of variations.
BACKGROUND: perfectly flat tomato red #FF4B2B, edge to edge. Never use red, orange, coral or salmon as a fill.
PALETTE: ink #17101B outlines, cream #FFF2DA, butter #FBE79A, lilac #B79CFF, sky blue #85CEF9, mint #8EEBC3, ultraviolet #5B3DF5 as the juicy accent.
OBJECTS (each one separate, at least 5% of empty background between all of them):
1. HERO: a clay head bust in lilac on a small round cream stand, half sculpted: one side smooth, the other rough with thumbprints and tiny clay curls; only a nose and a closed-eye line as a face; a wooden loop sculpting tool stuck into the clay, all connected as one object.
2. A square vector card (cream) with a faint grid, a smooth bezier curve with two handle lines ending in round dots and small square anchor points, and a butter leaf shape under the curve.
3. A portrait magazine page (cream): a big photo box with a bold diagonal cross, a thick headline bar, two columns of wavy lines and a small ultraviolet square.
4. A landscape photo being retouched: sky-blue sky, mint hills, a butter sun, and a dashed circle on it like a healing selection.
5. A grid card of four variations: a cream card with a 2 by 2 grid of four little blob characters in different colours, one of them framed with a thick ultraviolet border and a tick badge.
6. A pen-tool nib (a fountain-pen nib shape) in ultraviolet with a round hole.
7. A fan of five colour swatches (mint, sky blue, lilac, butter, cream) joined at one end.
8. A ruler in butter with ink tick marks (no numbers), small.
SPARKLES: five tiny four-point stars and dash bursts, in ink and ultraviolet.
PATTERNS: stripes on the stand of the bust, polka dots on the nib.
Must read at a glance: building and refining a design.
Add nothing else. Square 1024x1024, flat tomato background, no text.
```

**PR-04 DELIVER**

```text
Attach the style reference. Same illustrator and the same rules as the opening message.

STEP: 04 DELIVER. Everything leaves ready to use: brand manual, print-ready files, a working website, the keys handed over.
BACKGROUND: perfectly flat teal #0F9AA8, edge to edge. Never use teal, green, mint or sky blue as a fill.
PALETTE: ink #17101B outlines, cream #FFF2DA, butter #FBE79A, bubblegum #FF8FC1, lilac #B79CFF, tomato #FF4B2B as the juicy accent.
OBJECTS (each one separate, at least 5% of empty background between all of them):
1. HERO: a thick hardcover brand manual, slightly tilted: tomato cover with a simple round logo mark (a circle with a swoosh, no letters), a wire spiral spine, cream page edges and a bubblegum bookmark ribbon.
2. A print-ready sheet: cream paper with four crop marks (L-shaped corner lines), a registration target (a circle with a cross) and a row of colour bars (bubblegum, butter, lilac, tomato, ink).
3. A desktop browser window (cream): a bar with three dots, a hero block with a butter sun, two small cards below and a cursor arrow.
4. A tablet with a lilac frame showing a simple layout of blocks and bars.
5. A phone with a bubblegum frame showing a simple layout of blocks and bars.
6. A brass key in butter tied to a cream paper tag (empty, with just a scribble line) by a string loop, all connected as one object.
7. A rolled poster (cream) tied with a bubblegum string, with a visible curl.
8. A small gift box in lilac with a tomato ribbon and bow.
SPARKLES: five tiny four-point stars and dash bursts, in ink and tomato.
PATTERNS: polka dots on the gift box, stripes on the ribbon.
Must read at a glance: delivering a finished brand.
Add nothing else. Square 1024x1024, flat teal background, no text.
```

### One-line fixes to paste when a result is off

- Objects touch or overlap: `Redraw with every object fully separate: at least 5% of the canvas width of empty background between any two objects and from the edges.`
- Too vivid: `Softer: chalkier, more pastel versions of the same colours, keep the ink outline.`
- Text appeared: `Remove all lettering: no letters, numbers or logos anywhere; labels are empty shapes.`
- An object uses the background colour: `The background is one perfectly flat fill; no object may use that colour as a fill, change those fills to cream.`
- Not the same illustrator: `Same hand as the style reference: flat opaque fills with hand-cut edges, one wobbly ink outline of constant weight, one flat darker shadow shape, no gradients.`
- Wrong count: `Exactly eight objects plus five sparkles, nothing else.`
- Objects too small: `Bigger: the hero about 36% of the canvas width, nothing smaller than 10%.`

## PF and ST

Open. Pau gives the art direction and references for each category, then the prompts are written like the CAT and PR sets. The IDs, the file names and the filing procedure stay as before:

- `PF-NN` becomes `public/works/concept-portfolio/art/slide-N.webp` (1080x1920) plus the derived sheet, contact sheet, thumb, peek and card art.
- `ST-NN` becomes `sticker-NN.webp` (1200x1600 transparent) and `thumb-NN.webp` (300x400), then `build-shapes.py` and the card art (see `docs/api/world-illustration.md`).
