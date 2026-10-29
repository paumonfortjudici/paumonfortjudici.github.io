# Image prompts for ChatGPT (and how the images come back)

Version 2 (2026-10-29). Pau threw away the first set (flat colour, riso look) and wants to work **one category at a time**, each with its own art direction and its own references. Only the Catalog (CAT) is defined so far. PF, ST and PR are open: they get their prompts when Pau gives the direction for each.

## The system

Every image has an ID: `AREA-NN`. Use the ID as the file name when you save the result, in `C:\Users\User\Documents\Portofolio\_inbox\` (git ignores that folder). If you make several versions add a letter: `CAT-04b.png`.

| Area | IDs | What it replaces | Status |
|---|---|---|---|
| `CAT` | CAT-01 .. CAT-10 | the grey sketch next to each name in the Catalog | **defined below (v2, graphite pencil)** |
| `PF` | PF-01 .. PF-05 | the five slides of folder 09 (A Portfolio for a Client) | waiting for Pau's direction |
| `ST` | ST-01 .. ST-09 | the nine stickers of folder 10 (Sticker Sheet) | waiting for Pau's direction |
| `PR` | PR-01 .. PR-04 | the four big scenes of the Process film (section 05) | waiting for Pau's direction |

The five references Pau chose are copied to `_inbox/refs/` with a stable name:

| File | What it is | Used for |
|---|---|---|
| `REF-1_chair-colour.jpg` | flat marker figure, orange + blue, on a chair | not for the Catalog (it is colour); keep for the colour categories |
| `REF-2_crayon-laptop.jpg` | black waxy crayon line, one blue accent, figure with laptop | CAT-02, CAT-05, CAT-10 |
| `REF-3_ink-hat-tie.jpg` | ink figure in a fedora, scribbled hat band, hatched tie | CAT-04, CAT-08 |
| `REF-4_ink-bicycle.jpg` | fluid single ink line, man with a bicycle | CAT-03, CAT-07 |
| `REF-5_pen-trumpet.jpg` | pen hatching, trumpet player leaning | CAT-01, CAT-06, CAT-09 |

## CAT: the ten Catalog sketches (graphite pencil)

### How the picture is used on the site (this decides the format)

- It sits **directly on the band colour**, right-aligned, in a box up to 38rem wide and 12rem (192 px) tall, `object-fit: contain`. So it is shown small: bold lines, a wide low composition.
- It is hidden on phones (max-width 760px).
- Band colours: 01 tomato `#FF4B2B`, 02 pine `#1F5C46` (dark), 03 marigold `#FFB81C`, 04 oxblood `#8A1B3D` (dark), 05 ultraviolet `#5B3DF5` (dark), 06 bubblegum `#FF8FC1`, 07 lagoon `#0F9AA8`, 08 olive `#86A22F`, 09 butter `#FBE79A`, 10 lilac `#B79CFF`.
- ChatGPT draws dark graphite on pure white. At filing time white becomes transparent (luminance to alpha) and the pencil is tinted per band: graphite `#2E2E2E` on the seven light bands, pale chalk grey `#E6E1D6` on the three dark ones (02, 04, 05), so no sketch disappears. The pencil grain survives.
- Format to ask for: landscape 1536x1024. I trim to the drawing and save `public/works/<slug>/catalog-sketch.webp`, then add the slug to `CATALOG_SKETCH` (`catalog/sketches.ts`).

### Chat opening message (new chat, paste first, attach REF-2, REF-3, REF-4, REF-5)

```text
You are a professional illustrator who draws in a sketchbook with soft graphite pencil. Over this chat we will make TEN loose preparatory sketches for the folders of a portfolio website. Each one is a quick "thinking sketch" that hints at what is inside a folder: artisanal and human, never corporate, never polished. All ten must look as if they were drawn on the same page of the same sketchbook in one sitting, with the same pencil and the same pressure.

Do not draw anything yet. Reply "ready" and summarise these rules in five lines.

MEDIUM. Soft graphite pencil (6B), sometimes the flat side of the lead for a broad smudge, a kneaded eraser used to lift a few highlights. Strictly monochrome grey: lines go from near-black graphite (#2E2E2E) through mid grey (#777777) to pale smudge (#C4C4C4). No colour of any kind: ignore every colour in the references (for example the blue in the crayon drawing).

LINE. Gestural, quick and confident, drawn from the elbow, one stroke per contour. Pressure varies along every line: heavier where a form turns away or sits in shadow, lighter where it catches the light. Lines overshoot the corners and leave small gaps (10 to 40 px) instead of closing. In a few places a second searching line runs beside the first, the way a draftsman corrects a line. A few pale construction lines (a guide circle for a head, a horizon) stay visible. Straight edges are drawn freehand: slightly bowed, never ruler-straight, never vector-clean.

TONE. Only in three to five places per drawing, and each request names them: a patch of loose parallel hatching (strokes at one angle, about 45 degrees, spaced at least 14 px apart), or a smudge made with the side of the pencil, or one dense scribbled dark mass. Everything else is blank white paper. No even fills, no gradients, no outline around a hatched area.

UNFINISHED ON PURPOSE. Leave about half of what a finished drawing would contain: edges that fade out, a side of the main object only suggested by two or three lines, parts that are simply missing. The idea must still read at a glance, small.

FIGURES. Drawn the way a sketcher draws strangers in a cafe: small head, the face reduced to a nose-and-chin profile line and one dot for the eye (or hidden under a hat or a scribble of hair), no eyelashes, no teeth, no realistic features. Hands are simple mitten-like shapes with three or four short strokes for the fingers. Bodies are big simple volumes of clothing with a few curved fold lines, long legs, a slightly off-balance gesture. Not a portrait, not a mascot, not manga, not a stick figure.

LEGIBILITY. Each sketch will be shown only about 190 px tall on a website, so draw it bold: main contours about 10 px thick on the 1536x1024 canvas (soft pencil pressed hard), secondary lines about 5 px, no hairline detail. Fewer and bolder strokes than reference 5.

COMPOSITION. One main subject plus at most two small secondary items. A wide, low arrangement: the whole drawing about 2.5 times wider than tall, centred, filling about 70% of the width and 55% of the height, with generous empty white all round. Casual, slightly naive perspective.

BACKGROUND. Flat uniform pure white #FFFFFF. No paper texture, no page edge, no frame, no vignette, no cast shadow, no ground line, no signature, no stamp, no watermark. No text of any kind: no letters and no numbers (write text as rows of wavy line).

REFERENCES. With every request I will attach ONE reference image. Take from it only the quality of the line, the pressure and the looseness. Never copy its subject, pose, composition or colour.

FORMAT. Landscape 1536x1024.
```

### The ten prompts (one message each, attach the named reference to each)

**CAT-01 Proyecto Contract (trade magazines). Attach REF-5.**

```text
Attach REF-5 (fine pen hatching: borrow only the way a few directional strokes build volume).

Draw: a magazine editor's moment. An open magazine spread lying on a table, seen from slightly above and tilted about 8 degrees, wide and low like a real spread. Left page: a big rectangular photo box with a bold diagonal cross inside it and one short caption bar under it. Right page: a headline made of two thick bars, then three narrow columns of text drawn as rows of short wavy lines. A right hand enters from the right edge holding a stubby pencil, its tip hovering just above the headline; the sleeve cuff is visible, nothing more of the arm. Around the spread, four small pale crop marks (L-shaped corner lines).
Tone only on: the lower half of the photo box (loose diagonal hatching), the thin shadow under the right page edge, the sleeve cuff.
Unfinished: the bottom-left corner of the spread fades out in two or three lines, the columns on the far right stop before the page edge.
Must read at a glance: a magazine being edited.
Add nothing else. Landscape 1536x1024, white background, grey graphite only, no text.
```

**CAT-02 Plana Digital (brand and website). Attach REF-2.**

```text
Attach REF-2 (waxy crayon-like loose line with one bold steam squiggle: borrow only the looseness and the bold steam line).

Draw: a web designer at work. At left a person seated on a plain chair (four lines for the chair), seen in profile, slightly hunched, one arm stretched forward to a mouse; a tall steaming mug beside the hand with ONE bold free squiggle of steam. At right a large desktop monitor on a short stand, facing the viewer at a slight angle, its screen showing a rough website wireframe: a thin bar on top with three dots, a big hero rectangle with a half sun and four short rays inside it, two small boxes under it, and a mouse-cursor arrow overlapping a corner of the screen.
Tone only on: the hero rectangle (a few diagonal strokes inside the half sun), the person's back, the shadow under the monitor stand.
Unfinished: the chair legs stop halfway, the lower edge of the monitor is only suggested.
Must read at a glance: someone building a website.
Add nothing else. Landscape 1536x1024, white background, grey graphite only, no text.
```

**CAT-03 44 Lab (custom rugs). Attach REF-4.**

```text
Attach REF-4 (one fluid line and a loose looping cable line: borrow the flow and the way the cable loops).

Draw: someone tufting a rug. At right a tall wooden rug frame standing at an angle like an easel, a rug stretched in it with a bold concentric diamond pattern drawn only on the half nearest the figure and short fuzzy ticks along the rug's edge; the rest of the rug only suggested. At left a person standing in profile, wearing a knitted beanie, pushing a chunky tufting gun (box-shaped motor, grip, a pointed needle nose) against the rug; the gun's power cable makes one big free looping scribble that falls to the floor, like the line in the reference. On the top bar of the frame a tiny mischievous devil sits with legs dangling (round head, two small horns, wide grin, thin tail ending in an arrow tip), drawn in only five or six strokes.
Tone only on: the beanie (dense dark scribble), the fuzzy rug edge, the shadow under the frame.
Unfinished: the person's far arm and legs fade out below the knees, the frame's feet are only two lines.
Must read at a glance: hand-tufting a rug, with a naughty devil.
Add nothing else. Landscape 1536x1024, white background, grey graphite only, no text.
```

**CAT-04 Spelled Guilty (noir word-search book). Attach REF-3.**

```text
Attach REF-3 (ink figure in a fedora: borrow the dense scribbled hat band, the face lost in shadow and the hatched tie).

Draw: a noir detective hunched over a puzzle book. Chest-up figure at left, three-quarter view, in a fedora tilted forward so the eyes are lost in shadow, only the nose, a thin mouth and the chin showing, the collar of a trench coat turned up, a loosely knotted tie. In front of the chest one hand holds up a thick-rimmed magnifying glass. At the lower right an open book held in the other hand, its page showing a loose 6-by-6 grid of tiny squares with scribbles instead of letters and one long pill-shaped loop drawn round one row.
Tone only on: the hat band (dense dark scribble, as in the reference), the shadow over the eyes, the tie (parallel hatching).
Unfinished: the coat dissolves into two or three lines at the bottom, the book's lower-right corner is missing.
Must read at a glance: a noir detective solving a word-search puzzle.
Add nothing else. Landscape 1536x1024, white background, grey graphite only, no text.
```

**CAT-05 Space Monkey (escape room). Attach REF-2.**

```text
Attach REF-2 (waxy crayon-like line, playful: borrow the bold line and the looseness).

Draw: a monkey astronaut escaping. A chubby monkey in a baggy spacesuit floats diagonally across the middle of the page, body twisted, weightless. Its big round helmet shows a cheerful monkey face (two round ears poking out at the sides, two dot eyes, a wide grin line) and two short curved strokes of glass reflection. One gloved hand holds up a large old-fashioned key (round bow, long shaft, three teeth); the long curly tail ends in a tiny glove. At the upper left a small ringed planet (a circle with one tilted ellipse); at the right a long free looping tether line trailing from the suit's back.
Tone only on: the underside folds of the suit, the three strokes of reflection on the helmet, a smudge under the planet's ring.
Unfinished: the legs fade out at the knees, the planet is only half outlined.
Must read at a glance: a space monkey holding the key to escape.
Add nothing else. Landscape 1536x1024, white background, grey graphite only, no text.
```

**CAT-06 Procreate Sketchbook (early drawings). Attach REF-5.**

```text
Attach REF-5 (pen hatching: borrow the way a few directional strokes build hair and cloth).

Draw: a sketchbook moment. In the middle a drawing tablet resting at a slight angle (a thick rounded rectangle with a small stand) with a loose, half-finished profile portrait on its screen (only the hair, one eye and the nose line). From the right a hand holds a slim stylus, its tip on the screen. At the left three tiny doodles float on the empty page: a heraldic shield crest, a five-point star, a sprig with three leaves, each drawn in a few strokes as if testing logo ideas.
Tone only on: the hair of the portrait (dense hatching), the left half of the shield crest, the shadow under the tablet.
Unfinished: the portrait's face has no outline on its far side, the hand shows only the thumb and two fingers.
Must read at a glance: drawing portraits, crests and logo ideas on a tablet.
Add nothing else. Landscape 1536x1024, white background, grey graphite only, no text.
```

**CAT-07 Somia (sustainable fashion store). Attach REF-4.**

```text
Attach REF-4 (one fluid line: borrow the elegant stand-by-the-object posture and the economy of the line).

Draw: a fashion store moment. At left a person standing in profile, long legs, holding up a blouse on a hanger at arm's length to examine it; a small empty paper price tag hangs from the hanger on a string. At right a clothes rail (one horizontal bar on two thin legs) with three garments hanging from it as simple shapes: a long coat, a blouse with wide sleeves, trousers folded over a hanger. At the foot of the rail a small potted plant with four leaves.
Tone only on: the long coat (hatching along its fall), the person's trousers, the shadow under the rail's foot.
Unfinished: the far garment on the rail is only its hanger and an outline, the person's head is a profile with no detail.
Must read at a glance: a sustainable clothes shop.
Add nothing else. Landscape 1536x1024, white background, grey graphite only, no text.
```

**CAT-08 Gotet (vermouth bar). Attach REF-3.**

```text
Attach REF-3 (ink figure with a tie: borrow the heavy hatching of the tie and the dark mass of the clothing).

Draw: a vermouth bar. A chest-up bartender behind a counter at left, three-quarter view, slicked-back hair, a big moustache drawn as one dark scribbled bar, waistcoat and long tie. One hand holds a tall soda siphon (lever head, spout, a band of simple stripes), the other lifts a stemmed glass with ice cubes and an olive on a toothpick. A long, slightly bowed freehand line for the bar counter runs across the whole width in front of him.
Tone only on: the tie and waistcoat (dense parallel hatching), the moustache, the liquid in the glass (short diagonal strokes).
Unfinished: the right half of the counter fades out, the bartender's far shoulder is only suggested.
Must read at a glance: a bartender serving vermouth with a siphon.
Add nothing else. Landscape 1536x1024, white background, grey graphite only, no text.
```

**CAT-09 A Portfolio for a Client (foley artist). Attach REF-5.**

```text
Attach REF-5 (a leaning, dynamic pose in pen line: borrow the weight and the lean of the body).

Draw: a foley artist at work. At left a person leaning hard into a stride, one boot stamping on a small shallow tray of gravel (a low rectangle with dots), headphones hanging round the neck, a loose jacket with fold lines. Both hands hold a long boom pole raised diagonally to the upper right, ending in a big furry windshield microphone (a fat rounded capsule covered in short fur ticks, a strap round the middle). Three short radiating lines near the microphone suggest sound.
Tone only on: the jacket folds (parallel hatching), the shadow of the gravel tray, a smudge at the base of the fur capsule. The fur itself is short ticks, not hatching.
Unfinished: the far leg stops at the knee, the pole's lower end fades into the hands.
Must read at a glance: a sound artist making noises with a boom microphone.
Add nothing else. Landscape 1536x1024, white background, grey graphite only, no text.
```

**CAT-10 Sticker Sheet (illustration showcase). Attach REF-2.**

```text
Attach REF-2 (bold crayon-like line and mitten-like hands: borrow how the hands are simplified).

Draw: peeling a sticker. At left a left hand holds a big sheet of backing paper (a rounded rectangle with one slightly curled corner) that has the cut outlines of four sticker shapes on it: a star, a heart, a speech bubble and a flower; the speech bubble and the flower are already empty, drawn as dashed outlines. At right a right hand pinches the corner of the star sticker and peels it away: the curled-up corner shows its back side. Hands are mitten-like shapes with three or four finger strokes each, each cut off at the wrist by a sleeve cuff.
Tone only on: the curled underside of the star (parallel hatching), the shadow of the sheet under the left thumb, a smudge on the heart.
Unfinished: the bottom edge of the sheet fades out, the flower is only half outlined.
Must read at a glance: stickers on a backing sheet, one being peeled.
Add nothing else. Landscape 1536x1024, white background, grey graphite only, no text.
```

### One-line fixes to paste when a result is off

- Too neat or finished: `Same subject, redraw it looser: fewer strokes, leave half of it out, lines that overshoot and do not close.`
- Colour, tint or paper texture crept in: `Grey graphite only on flat pure white, no tint, no paper texture.`
- Lines too thin to read small: `Same drawing with the pencil pressed hard: main contours twice as thick, no hairlines.`
- Face or hands too detailed: `Simplify: face is a nose-and-chin profile line and one dot, hands are mittens with three or four strokes.`

## PF, ST, PR

Open. Pau gives the art direction and references for each category, then the prompts are written like the CAT set (one opening message per chat with the rules, one prompt per image with its own reference). The IDs, the file names and the filing procedure stay as before:

- `PF-NN` becomes `public/works/concept-portfolio/art/slide-N.webp` (1080x1920) plus the derived sheet, contact sheet, thumb, peek and card art.
- `ST-NN` becomes `sticker-NN.webp` (1200x1600 transparent) and `thumb-NN.webp` (300x400), then `build-shapes.py` and the card art (see `docs/api/world-illustration.md`).
- `PR-NN` becomes `public/process/scene-0N.webp` (1400x1500) and the index goes into `SCENE_IMAGES` (`process/images.ts`).
