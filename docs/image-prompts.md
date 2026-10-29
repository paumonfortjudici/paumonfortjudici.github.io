# Image prompts for ChatGPT (and how the images come back)

## The system

Every image has an ID: `AREA-NN`. Use the ID as the file name when you save the result.

| Area | IDs | What it replaces | Ratio to ask for | What I do with it |
|---|---|---|---|---|
| `CAT` | CAT-01 .. CAT-10 | the grey sketch next to each name in the Catalog | square 1024x1024, plain white background | cut out, trim, save as `public/works/<slug>/catalog-sketch.webp`, switch the slot on |
| `PF` | PF-01 .. PF-05 | the five slides of folder 09 (A Portfolio for a Client) | portrait 1024x1536 | scale to 1080x1920, rebuild the sheet, the card thumbnail and the peek |
| `ST` | ST-01 .. ST-09 | the nine stickers of folder 10 (Sticker Sheet) | portrait 1024x1536, plain white background | cut out to 1200x1600 transparent + 300x400 thumbnail, regenerate the silhouettes, rebuild the card art |
| `PR` | PR-01 .. PR-04 | the four big scenes of the Process film (section 05) | square 1024x1024, full-bleed colour | crop to 1400x1500, save as `public/process/scene-0N.webp`, switch them on |

Where to put them: create the folder `C:\Users\User\Documents\Portofolio\_inbox\` and drop every file there, named with its ID (`CAT-03.png`, `ST-07.png`...). If you make several versions, add a letter: `ST-07b.png`; tell me which one you prefer (or I pick by eye). If a file has no ID I will recognise it by what it shows and rename it. The folder is ignored by git: nothing in it is published until I file it.

Tips for ChatGPT: one image per prompt, generate in a new chat per area so the style stays consistent, and if a result is almost right say "same image, but ..." instead of starting again. Do not ask it for transparent backgrounds (it cannot): I remove plain white backgrounds myself.

## The house style (paste this at the start of every prompt of every area)

> STYLE: a confident editorial illustration with the look of a risograph print: flat colour fills, one uniform thick dark ink outline (#17101B), a hard offset shadow without blur, a very subtle paper grain and halftone dots, slightly imperfect hand-drawn charm but with clean, precise, professional execution: consistent line weight, clear silhouettes, correct anatomy and proportions, balanced composition, crisp edges, no artefacts, no gibberish text. Palette: tomato #FF4B2B, marigold #FFB81C, pine green #1F5C46, oxblood #8A1B3D, ultraviolet #5B3DF5, bubblegum pink #FF8FC1, lagoon #0F9AA8, olive #86A22F, butter #FBE79A, lilac #B79CFF, ink #17101B, cream #FFF2DA.

## CAT: the ten Catalog sketches

Common ending for all ten: "Single centred object group, generous empty margin all round, no text, no letters, solid pure white #FFFFFF background, no shadow on the background, square 1024x1024."

- **CAT-01 Proyecto Contract (trade magazine):** an open magazine spread lying flat, one page a big photo placeholder with a cross, the other columns of text as bars, trim marks in the corners and a red pencil circle drawn around a small byline. Dominant colours: tomato, cream, ink.
- **CAT-02 Plana Digital (brand + website):** a browser window with three dots in its bar, a half sun rising behind a green horizon stripe inside it, a mouse cursor arrow on the corner, tiny rays around. Colours: pine green, marigold, tomato, cream.
- **CAT-03 44 Lab (custom rugs):** a hand-tufted rug seen at a slight angle, diamond pattern, fringe at both ends, a chunky tufting gun resting on it and a mischievous little red devil with tiny horns and a trident peeking over its edge. Colours: marigold, tomato, ink, cream.
- **CAT-04 Spelled Guilty (word-search mystery book):** a square grid of letter-like marks with a long pill-shaped loop drawn round one word, a magnifying glass over it and a noir fedora hat resting on top of the book. Colours: oxblood, cream, ink, a touch of marigold.
- **CAT-05 Space Monkey (escape-room posters):** a monkey astronaut helmet with a visor reflecting stars, a ringed planet and a tiny rocket orbiting it. Colours: ultraviolet, cream, marigold, ink.
- **CAT-06 Procreate Sketchbook (early drawings):** a tablet with a stylus drawing a loose portrait sketch, a few pencil strokes and colour dots beside it. Colours: bubblegum, oxblood, cream, ink.
- **CAT-07 Somia (sustainable fashion store):** a striped shop awning above a small window, a clothes hanger with a simple blouse, a hanging paper tag, a tiny leaf. Colours: lagoon, cream, ink, a touch of tomato.
- **CAT-08 Gotet (vermouth bar identity):** a vermouth glass with ice and a lemon slice, an olive wearing a tiny red beret, a blue soda siphon, all lined up and smiling. Colours: olive, oxblood, tomato, cream.
- **CAT-09 A Portfolio for a Client (slide deck):** three tall slides fanned out like a hand of cards, the front one showing a fluffy boom microphone, sound-burst stars around. Colours: butter, ultraviolet, teal, ink.
- **CAT-10 Sticker Sheet (illustration showcase):** a sheet of stickers with one corner peeling back, a star sticker, a heart sticker and a speech-bubble sticker on it. Colours: lilac, pine, butter, cream.

## PF: the five slides of "A Portfolio for a Client" (Ona Ribas, foley artist, Girona)

I like the concept, the layout and the colour system: keep them exactly. What changes is the execution of the artwork: much more professional (clean shapes, consistent line, better character drawing and hands, richer cut-paper collage detail, crisp typography, no wobbly letters).

Common block (paste after the style block, before each slide):

> A 9:16 portrait presentation slide for the invented portfolio of Ona Ribas, a foley artist and sound designer from Girona. Flat cut-paper collage, thick ink outline, halftone shadows, paper grain. Palette for this deck: teal #007E9B, deep teal #1B6885, steel #63A0AC, butter #FDEFAF, paper #F6F0DC, ink #101820, sun yellow #F2C62F, tomato #E8553E, salmon #F2A29A. Typography: a tall condensed hand-cut sans for titles, a clean grotesk for body text, small spaced capitals for labels. Render the text exactly as given, spelled correctly, once each, sharp and perfectly legible. Footprint trail and sunburst shapes are recurring motifs. Ona: a young woman with a curly dark bob, headphones round her neck, purple jacket, red dungarees, black boots, expressive face.

- **PF-01 (cover, teal field):** top-left small caps "FOLEY & SOUND DESIGN", top-right "ONA RIBAS". Huge title "FOLEY PORTFOLIO" in butter. Centre: a fluffy furry boom microphone in a windshield, held by a pole, with a yellow sunburst behind it and comic bursts "CRUNCH!" and "SNAP!". Below: "The small noises that make a film feel real." and "PORTFOLIO 2026 · GIRONA". A round sun-yellow badge "2026" bottom right.
- **PF-02 (about, butter field):** small caps "ABOUT" and "02 / 05". Huge title "I'M ONA RIBAS" in teal. Italic "(Ona means wave, in Catalan.)". Label "FOLEY ARTIST & SOUND DESIGNER", "GIRONA · SINCE 2016". Paragraph: "I make the sounds nobody notices until they're missing: footsteps, rustling coats, a door that finally closes. Ten years in a studio full of gravel, celery and old shoes, and one very patient neighbour." Hero: Ona performing foley, stamping a boot onto a gravel tray with a "CLIP-CLOP" tag, surrounded by a collage of props with tiny labels: umbrella, watermelon (WATERMELON · HEADS), celery (CELERY · BONES), cellophane (CELLOPHANE · FIRE).
- **PF-03 (selected projects, teal field):** small caps "WORK" and "03 / 05". Title "SELECTED PROJECTS". Three entries, each with a small round illustration: "2025 SALT SEASON, FEATURE · FOOTSTEPS, CLOTH: Two hundred kilometres of desert footsteps, recorded in a kitchen with six kilos of salt." (a desert dune and boots), "2024 KETTLE & CROW, SHORT FILM · PROPS, WINGS: A kettle that screams, a crow that never lands, and one umbrella playing the wings." (kettle, crow, umbrella), "2023 THE UNDERSTUDY MOON, SERIES · PAPER, CREAKS: Eight episodes of paper wings, cardboard footsteps and a moon that creaks when it smiles." (a smiling moon). Footer note "Full credits and reels on request."
- **PF-04 (experience and education, deep teal field):** small caps "BACKGROUND" and "04 / 05". Title "EXPERIENCE & EDUCATION". Top illustration: Ona at a sound mixing desk with headphones, waveforms and a clapperboard "TAKE 12". Timeline with footprints: "2023 – NOW  FOLEY ARTIST  Casa Grava Studio, Girona  Features, series and shorts. Sixteen titles so far."; "2019 – 2023  FOLEY EDITOR  Estudi Rumor, Barcelona  Cut foley for 22 films and too many cereal ads."; "2016 – 2019  FOLEY WALKER  Moth & Marrow Post, Lisbon  Learned to walk like other people for a living."; "2012 – 2016  BA IN FILM & SOUND  Aurell School of Film and Sound, Girona  Plus a masterclass and one very large gravel pit." Footer: "LANGUAGES · CATALÀ · CASTELLANO · ENGLISH".
- **PF-05 (contact, teal field):** small caps "CONTACT" and "05 / 05". Title "THANKS FOR LISTENING", line "Let's make some noise together." Ona waving happily, holding a boom pole with a fluffy microphone, a black cat at her feet, a comic burst "BYE!". A dark rounded card at the bottom: "EMAIL hello@onaribas.example", "WEB onaribas.example", "PHONE +00 000 000 000", "BASE Girona, Catalonia", and a yellow tag "AVAILABLE FROM JANUARY 2027" with "Features, series, shorts and games."

If the text comes out wrong in any slide, ask: "Same slide, same illustration, but with NO text at all, just empty space where the text goes." and send me that version as `PF-0Nb.png`: I will set the typography myself.

## ST: the nine stickers

I keep the whole world, layout and behaviour; only the nine pictures change. A sticker = one invented character, full body, a dynamic pose filling a 3:4 portrait. Common ending: "No text in the picture. No white outline or die-cut border (I add it myself). One clear silhouette. Solid pure white #FFFFFF background, no shadow, portrait 1024x1536."

Style addition for the stickers: "bold clean black ink outline of one weight, flat fills in the character's accent colour plus black and cream, small pattern textures, cheerful and quirky, a tiny sparkle or two."

- **ST-01 "Boombox ollie" (accent lilac #C6B1FE):** a skater in a black beanie and baggy plaid trousers pops an ollie (board tilted in the air), a boombox on one shoulder, a rock-on hand up. Equalizer bars on the sweater.
- **ST-02 "Just one more chapter" (tangerine #FFA65F):** a cosy reader in round glasses and a cable-knit sweater sits cross-legged on a tower of books, holding a hardback while a sleeping black cat curls up on their lap.
- **ST-03 "Coffee first, pixels later" (sky #85CEF9):** a curly-haired designer in dungarees hugs a paper coffee cup as tall as themselves, cheek on the lid, a drawing tablet showing a bezier curve leaning at their feet.
- **ST-04 "Small me, big plant" (mint #8EEBC3):** a small gardener in a polka-dot bandana and rubber boots staggers along carrying a big pot with a monstera three times their height, a snail riding one leaf.
- **ST-05 "Quiet on set!" (butter #FCE67A):** a film director in a beret and sunglasses, striped scarf flying, steps up onto an apple crate and shouts through a megaphone while holding a clapperboard aloft.
- **ST-06 "Case of the missing sock" (tomato #FE7D6C):** a trench-coated detective in a fedora creeps forward, one eye hugely magnified by an oversized magnifying glass, pinching a single striped sock as evidence.
- **ST-07 "Tuft happens" (pink #FF9FC5):** a rug maker in goggles and dungarees kneels at a wooden frame, tongue out in concentration, punching yarn into a half-finished mushroom rug with a chunky tufting gun.
- **ST-08 "Houston, we have bananas" (teal #66CBC7):** a monkey in a puffy spacesuit floats weightless, grinning inside the helmet and holding up a banana, its long tail ending in a tiny glove, a ringed planet nearby.
- **ST-09 "Headphones on, world off" (lime #C5EB7C):** a dancer in headphones and an oversized track jacket laughs with eyes shut, ponytail whipping, balancing on one toe with the other leg kicked high.

## PR: the four big scenes of the Process film

I keep the concept, the film strip, the texts and "On my desk" exactly as they are. Each scene is one illustrated desk-top view that tells its step; the frame behind it is a flat colour, so the picture should be full-bleed in that colour. Common ending: "Square 1024x1024, the picture fills the whole canvas edge to edge on the flat background colour given, objects arranged on one clear surface with a hard offset shadow, no text except the tiny label-maker tags named, a generous calm composition with one clear focal object, rich believable detail."

- **PR-01 COLLECT (background marigold #FFB81C):** a reference wall: photographs, colour swatches, magazine clippings, a postcard and a sketch, pinned to a cork board and joined by red string; a magnifying glass lying in front; a yellow sticky note reading "one-line promise". Tiny tags: "Pinterest", "Moodboard".
- **PR-02 SKETCH (background bubblegum #FF8FC1):** a notepad full of tiny thumbnail sketches of a little devil character, a pencil drawing the next one, and a tablet with a stylus where the chosen sketch becomes a finished clean character. Tiny tags: "Thumbnails", "Procreate".
- **PR-03 MAKE (background tomato #FF4B2B):** a desk with a vector curve with handles, a magazine page layout with columns, a retouched photo, a clay head being sculpted and a grid of four design variations with one picked with a tick. Tiny tags: "Vectors", "Layouts", "Retouch", "Sculpt", "Variants".
- **PR-04 DELIVER (background lagoon #0F9AA8):** a stack of deliverables: a brand manual, a print-ready sheet with crop marks and colour bars, a website shown in desktop, tablet and phone windows, and a key on a tag that says "yours". Tiny tags: "Print-ready", "Brand manual", "Responsive".
