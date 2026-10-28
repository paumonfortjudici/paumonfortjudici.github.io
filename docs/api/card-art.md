# Card art API: `thumb.webp` + `peek.webp` per folder

Files live in `public/works/<slug>/` (paths already in `src/lib/works.ts`; do not rename). Made from the project's real assets only (see "Sources").
Seven slugs are done: contract, plana, fortyfour-lab, spelled-guilty, space-monkey, procreate, somia. The three concept folders get theirs later.

| slug | folder | thumb 720x900 | peek (w x h) | what the peek is | hook (visible in the top ~40 %) |
|---|---|---|---|---|---|
| contract | #FF4B2B | 50 KB: Lady Pipa opener (PC 223 p.152-153), rust OPEN SPACE tab + blue room | 481x640, 67 KB | Hotel Design 18 cover on a page stack (crease + fore-edge) | masthead + lobby |
| plana | #1F5C46 | 31 KB: symbol, seal and the "72 h." social tile on wheat | 695x640, 30 KB (lossless) | the sunrise-in-a-browser symbol with its Paper sticker edge | window + three dots |
| fortyfour-lab | #FFB81C | 101 KB: Smiley Rug macro + logo lockup sticker | 511x633, 62 KB | the devil, cream die-cut halo | horns, grin, trident |
| spelled-guilty | #8A1B3D | 89 KB: cover + open case 01 on kraft, lamp light | 428x640, 38 KB | front cover, paper edge + hinge crease | SPELLED GUILTY title |
| space-monkey | #5B3DF5 | 96 KB: TYLER + SMITH posters + monkey patch on butter | 433x640, 80 KB | the TYLER poster in a cream margin | astronaut helmet |
| procreate | #FF8FC1 | 36 KB: two four-tone portraits cut out on teal | 645x600, 58 KB | Yakisoba F.C. crest, cream die-cut halo | chopsticks + shield |
| somia | #0F9AA8 | 36 KB: wordmark band + Cap de Creus editorial photo | 336x519, 43 KB (lossless) | paper hang tag with the real wordmark + ribbon-S | string loop + SOMIA |

## Using them
- `thumb`: 4:5, full-bleed art, no text to protect (the folder tab carries the title). `<img width="720" height="900" loading="lazy" decoding="async">`, `object-fit: cover`. Reads at 300 px and 140 px wide (checked).
- `peek`: transparent WebP, upright, <= 640 px tall. Decorative: `alt=""`. Use its own `width`/`height` attributes (aspect ratios differ: 0.67 to 1.09). Display it <= 320 css px tall (2x sharp). Put it BEHIND the folder body and let the body hide its lower part; the recognisable bit is in the top 40 % (table above). Tilt it in CSS (+/-2 to 5 deg) and give it a `drop-shadow`; no shadow or tilt is baked in.
- Every peek carries its own light edge (cream halo or paper edge) and was checked on all seven folder colours, the desk #0e0912, cream and ink (`C:/Users/User/AppData/Local/Temp/claude/C--Users-User-Documents-Portofolio/0908f779-4789-499a-9f74-ecb97a4d3b2d/scratchpad/shots/cards/peekcheck-all.png`; contact sheets `C:/Users/User/AppData/Local/Temp/claude/C--Users-User-Documents-Portofolio/0908f779-4789-499a-9f74-ecb97a4d3b2d/scratchpad/shots/cards/contact-sheet.png` and `contact-sheet-desk.png` in the same folder).
- Suggested `alt` for the thumbs (English): contract "Opening page of a feature in Proyecto Contract: a blue flagship store under the headline Retail hipnotico, beside a rust OPEN SPACE tab." / plana "Plana Digital identity: the sunrise-over-a-browser symbol, the round 72 h seal and a sample social post." / fortyfour-lab "Close-up of a hand-tufted rug in pink, lilac and mint, with the 44 Lab logo and its hand-drawn devil." / spelled-guilty "The Spelled Guilty paperback on a kraft table beside an open case file and word search." / space-monkey "The TYLER and SMITH escape-room posters pinned side by side, with the monkey-astronaut patch." / procreate "Two flat-colour portraits in four tones of orange, cut out like paper on a teal wall." / somia "The Somia wordmark above an editorial photograph from the Cap de Creus collection."

## Sources and honesty
- contract: cropped from `pages/p-152.webp` + `p-153.webp` (credit line cropped out, no contact data); peek = `cover.webp`. Credit line to show in the UI stays "Pages (c) Casual Magazines and the credited photographers, shown as a portfolio sample."
- plana: `logo/plana-digital-symbol(.svg|-reversed.svg)`, `plana-digital-seal.svg`, the "72 h." tile rectified from `board/detail-instagram-posts.webp` (a sample mockup: Catalan copy, no contacts or figures). Caption it as a sample mockup.
- fortyfour-lab: macro = slide 4 of the Smiley Rug post (CpiPiE6I2on) cut from the staged raw 1440x1800 JPEG in `.playwright-mcp/capture/fortyfour-lab/media/` (no person, no third-party likeness); lockup + devil from `logo/`.
- spelled-guilty: `cover-front.webp`, `pages/p008` + `p009` (case 01 as printed: grid unsolved, hidden-message boxes empty, no hints or solutions).
- space-monkey: `tyler.webp`, `smith.webp`, `logo-monkey-patch@3x.png` (clean patch only).
- procreate: `portrait-cap.webp` (palette swatches lifted off), `portrait-orange-1.webp`, `yakisoba-fc-crest.webp`. Held-back group portrait and the kids portrait are NOT used.
- somia: `web/editorial-cap-de-creus-desktop-hero@2x.webp` (photo only, site header cropped off), `web/brand/logo-somia-dark.png`, `sello-somia.png` (lifted from its 27 % opacity), both used at or below native size.

## Flags for the lead
- somia thumb shows the model's face from Somia's own editorial page (already in `public/works/somia/web/`). A face-free swap is ready (not shipped): `C:/Users/User/AppData/Local/Temp/claude/C--Users-User-Documents-Portofolio/0908f779-4789-499a-9f74-ecb97a4d3b2d/scratchpad/shots/cards/alt/somia-thumb-noface.webp` (720x900, 38 KB, red/blue wool tote from the raw 2x capture); copy it over `public/works/somia/thumb.webp`.
- procreate peek = the crest; `procreate/manifest.json` says the noodle-bowl art may be a stock icon (ask Pau). The portraits are real people of unknown identity (same manifest). A die-cut portrait peek is ready (not shipped): `C:/Users/User/AppData/Local/Temp/claude/C--Users-User-Documents-Portofolio/0908f779-4789-499a-9f74-ecb97a4d3b2d/scratchpad/shots/cards/alt/procreate-peek-portrait.webp` (411x640, 71 KB).
- `spelled-guilty/manifest.json` still lists the old 480x720 `thumb.webp`; the file is now the 720x900 scene.

## Rebuild / extend (concept folders)
Scripts and helpers: `C:/Users/User/AppData/Local/Temp/claude/C--Users-User-Documents-Portofolio/0908f779-4789-499a-9f74-ecb97a4d3b2d/scratchpad/cards_tools/` (run with `C:/Users/User/AppData/Local/Temp/claude/C--Users-User-Documents-Portofolio/0908f779-4789-499a-9f74-ecb97a4d3b2d/scratchpad/venv/Scripts/python.exe -I -X utf8`): `build_<slug>.py` per card, `cards_lib.py` (`die_cut` cream halo r=8, `on_surface` contact + ambient shadow, `stack_edge` page-stack edge, `paper_bg`, `rotate`, `save_webp(max_kb)`), `peek_check.py <slug|all>`, `contact.py [cream|desk]`, `verify.py` (size, alpha, folder < 12 MB). Language to match: full-bleed 4:5 print, one flat or lightly mottled ground, die-cut stickers with a cream halo, tape only where it holds a print, shadows from the top-left.
