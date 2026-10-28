# World 3: 44 Lab, "Workshop Wall" (API note)

Slug `fortyfour-lab` · folder colour marigold `#FFB81C` (ink text) · files: `src/worlds/FortyFourLabWorld.tsx` (default export, lazy chunk) and `src/worlds/fortyfour-lab/**` (CSS prefix `w-fortyfour-lab-`). Nothing outside those paths was touched.

The world is a **tufted rug hung from a marigold rail** (the folder's own colour, so the shell's tab strip joins it). The whole Instagram wall of the account (13 posts, 2023-03-08 to 2023-06-30) hangs on it as **tags on one vertical stitched thread**, in date order, under huge Chango month banners. A hand-drawn **devil walks the thread as you scroll** and the thread is sewn behind him. Production chunk: 15.1 KB gz JS + 7.1 KB gz CSS + a 1.1 KB worker + Chango 12 KB. No server, no network call, no third-party script.

## 1. File map

| File | What it is |
|---|---|
| `FortyFourLabWorld.tsx` | composes the world: rail, wall (rug border bands, `Hero`, `Feed`, `Thread`), `Footer`. Starts the pile tiles and the hand-writing face the moment the chunk is evaluated (the folder is still opening). Owns `wide` (`min-width: 1000px`). |
| `fortyfour-lab/Hero.tsx` | first screen: the `44 LAB` wordmark cut-out (the heading is screen-reader only), the profile label (avatar, bio in English, Instagram ticket), the intro lines, the empty `data-ffl-slot` where the devil stands before he walks. |
| `fortyfour-lab/Feed.tsx` | the content of the wall in reading order: month banners, key card, the 13 tags, the "30+" patch, the size chart, the end stack. Wide layout: hangs every box with `pack()` (section 3). |
| `fortyfour-lab/pack.ts` | pure, DOM-free stacking routine for the wide layout (two columns, staggered). |
| `fortyfour-lab/Thread.tsx` | the thread and the devil (section 4). Measures anchors in the DOM, builds one smooth path, moves the devil, reveals the sewn thread, fades the day-gap notes when he passes. |
| `fortyfour-lab/threadPath.ts` | pure maths: S-curve path through points (y strictly increasing), dense sample table, `sampleAtY` (x and slope from a y by binary search). |
| `fortyfour-lab/Tag.tsx` | one post: title (shown under the tag with CSS `order`, read first by screen readers), the hanging tag, the note. Carousels use `Ring`, reels the film-strip tag. |
| `fortyfour-lab/Ring.tsx` | a carousel as a ring of tags on one eyelet; flip with the two tab buttons, ArrowLeft / ArrowRight / Home / End, or swipe / drag the tag. |
| `fortyfour-lab/Clip.tsx` | a muted looping clip with a visible Pause / Play tab. |
| `fortyfour-lab/Sizes.tsx` | the size chart: every rug whose size is printed in a caption, drawn to scale on a 10 cm cutting mat. |
| `fortyfour-lab/Yarns.tsx` | the logo's five yarns on a shade card; each row copies its hex (`useCopy`). |
| `fortyfour-lab/Footer.tsx` | fringe, "The label on the back" title, `WorldFacts`, and the whole logo on a label hung from the fringe on a loop of yarn. |
| `fortyfour-lab/posts.ts` | the 13 posts: exact file names, intrinsic sizes, date strings, my short titles and notes, alt text per slide. The raw manifest is not bundled (its captions carry 2023 prices and the Etsy shop). |
| `fortyfour-lab/format.ts` | date helpers on the `YYYY-MM-DD` strings (no time zone ever), month grouping, `timecode(74.2) = '01:14'`. |
| `fortyfour-lab/icons.tsx` | the world's own drawn pictograms (spool, plane, bubble, play, pause, film frame). |
| `fortyfour-lab/pile.ts`, `pile.worker.ts`, `pileCore.ts` | the tufted pile: two seamless tiles (tan wall, transparent fuzz) generated as raw pixels in a worker, turned into `blob:` PNG urls. No image is shipped. The worker ends as soon as both tiles are drawn. |
| `fortyfour-lab/fortyfour-lab.css` | all styling in one file (palette variables, rail, wall, hero, feed, banners, tags, thread, devil, cards, footer, breakpoints, still block). |

## 2. Reading path

1. **Rail + wall**: marigold rail with cream loops, the rug border (diamond chain with pile fuzz) down both sides, the pile under everything.
2. **Hero** (a poster; the dominant thing is the devil and the wordmark): `44 LAB` thumps down, the devil steps in, the maker's label pops, the words are wiped on (about a second, plain CSS, `backwards` fill so nothing lingers).
3. **Feed**: MARCH 2023 / APRIL / MAY / JUNE in Chango (cream faces with yarn fuzz, ink outline, red offset shadow) and the 13 tags in order. Wide: left column / spine / right column, posts alternate sides. Narrow: one column, the thread along the right edge. Small cards: the key to the wall (beside the first tag), the "30+" patch under the Greyscale portrait rug, the size chart under the Next release reel.
4. **End**: the needle at the end of the thread, the end stack (the grid has been quiet since the last post; the five yarns), fringe, "The label on the back" with the facts slate and the whole logo.

## 3. Layout

* **Narrow (< 1000 px)**: one column in DOM order; `Feed` removes its row styles. Tags are 31 to 38 rem wide, the eyelet is on the right of every tag.
* **Wide**: the feed is a 3-column grid (left tags | spine | right tags) with `grid-auto-rows: 8px`. `Feed` measures every `[data-pack]` box (height plus margins) in a layout effect and `pack(slots, heights)` returns the top of each box; `--row` and `--span` are written as custom properties (no React state, nothing re-renders). A post goes in its own column under whatever is already there and never higher than half the previous post's height below that post's top, so the two columns interleave like a zip. A month banner goes in the column the first post of its month is not in, beside that post. The first banner spans all columns. Re-packed on width change (`ResizeObserver`), on `document.fonts` events and when `wide` changes. A CSS grid with auto rows could not do this: a row shared by a short and a tall item leaves a hole.
* Reels are a slim film strip (0.84 of a photo tag's width) so heights match their neighbours.
* Month banners fill their cell: font size is a fraction of the cell's container width (`cqw`), tuned per word from the measured width of Chango (APRIL 4.35 em, MAY 3.19 em, JUNE 3.39 em). The note under a side banner hangs at the end that does not touch the spine.
* Measured at 1000 to 2560 px wide: no two blocks overlap, and no hole taller than about 250 px at 1280 and 1440 (largest at 1920: 350 px, which holds the thread and a day note).

## 4. The thread and the devil (signature interaction)

* **Measured, not guessed**: zero-size `data-ffl-anchor="knot"` markers sit on every tag's eyelet pivot; `month` and `end` anchors sit in the first banner and at the end. `measure()` reads them with `getBoundingClientRect` divided by the wall's own scale (the folder-open transition cannot skew them) and builds the path. Re-measured on `ResizeObserver` of the wall, window resize, `document.fonts.ready` and a 700 ms settle.
* **Wide**: the thread zigzags down the spine; a short yarn tie runs from the thread to each eyelet and ends in a cream knot, so the devil never walks over a tag. Hand-written notes beside the thread say how long after the previous post ("same day", "next day", "N days later"), only within a month, on the short side of the walking devil (his trident side is 63 % of his width), clear of every block; each fades to 10 % while he stands level with it.
* **Narrow**: the thread runs along the right edge with the knots on the eyelets; the devil keeps his trident towards the page (turned the other way it would leave the screen).
* **The devil** (`devil-cutout.webp`) stands in the hero slot at rest, then rides a "reading line" half way down the visible area with a soft spring (he lags and catches up). His x comes from the path at his y. He turns to face the way he moves, leans into the slope and waddles (CSS squash and bounce) while the page scrolls, and shrinks from hero size to walking size over the first 560 px.
* **The thread sews itself**: the red running stitches (ink edge, red, cream highlight) are revealed behind him by a curtain moved with transforms only: a window clips (`overflow: hidden`, moves down to the devil's depth) and the drawing inside moves up by the same amount, so the drawing never moves on the page. (A `clip-path` changed on every frame re-rastered the 9000 px dashed layer and cost half of every frame; this version took the p90 frame from 25 ms to 12 ms on the production build.) A faint dotted guide shows the whole route ahead.
* **Cost**: one passive `scroll` listener on the world's own scroller wakes a rAF loop that sleeps as soon as the devil has caught up. No window scroll listener, no layout reads inside the loop. Tags sway when he passes their eyelet (`data-swing`, 1.2 s damped rotation) and swing in from the eyelet the first time they come into view (`data-seen`).
* **Reduced motion / "Pause motion"** (`useWorld().reduced`): the devil stands in the hero, the whole thread is drawn, no sway, no swing-in, no waddle, no entrance, notes stay put. No scroll listener is attached.

## 5. Posts

* 13 tags in the manifest's date order. Dates are the manifest strings (`2023-03-08`) formatted by hand (`8 MAR 2023` stamp, `8 March 2023` for screen readers): nothing is converted to a time zone.
* **Carousels (6)**: a ring of tags (each slide is a tag threaded on the same eyelet, fanned out). Only the top tag, the next and the previous hold a picture, and the pictures are lazy, so a long carousel never decodes more than three images. Slide counter `01 / 05`, polite live region with the alt text. The label says `Photos`, or `Photos + clip` when one slide is a video. **Keyboard**: Tab reaches Previous and Next (two stops per carousel); ArrowLeft / ArrowRight / Home / End flip it while focus is on either button or the clip tab; plain arrows do nothing elsewhere (they scroll the world). **Touch / mouse**: swipe or drag the tag (it turns around its eyelet; a vertical swipe still scrolls the page). Reduced motion: poses are set, not animated.
* **Reels (7)**: a strip of dark film with sprocket holes. Six are **stills** (copyright-flagged audio): the poster frame, a visible `STILL` mark and the line `Reel, still frame`; no video element exists for them. One reel, "Rug process", is a clip and its label is a timecode, `Reel, 01:14`.
* **Clips (4)**: that reel plus the video slides of three carousels (10.8 s, 13.7 s, 13.9 s). The `<video>` is created only when the clip is within 60 % of a screen of the viewport, `preload="none"`, `muted loop playsInline`, poster = the real poster frame. Plays while at least 40 % is on screen, on top of its stack, the tab is visible and motion is allowed; pauses otherwise. A visible tab (Pause / Play, 44 px on touch) overrides; a clip the visitor paused stays paused. Under reduced motion it never autoplays but Play works. Verified: no video request until a clip nears the viewport; `muted`, `preload="none"`; paused again when scrolled away or flipped away.
* **Copy**: titles and notes are mine (`posts.ts`). A caption that names a real person or a brand is reduced to the kind of rug ("Cut-out portrait rug", "Faceted portrait rug", "Greyscale portrait rug", "Sneaker rugs"); a third-party character is "a pink ghost rug". Nobody is named as the person tufting in the reel stills.

## 6. Other objects on the wall

* **Key to the wall** (beside the first tag): what a carousel, a reel, a clip and a still are, drawn with the same marks as the tags.
* **"30+" patch** (under the Greyscale portrait rug): the one number from that post's caption (more than 30 hours of work), with an arrow up to the tag.
* **To scale** (size chart): the six rugs whose size is in a caption, on a 10 cm grid; the numbers are the caption numbers, nothing else is claimed. The mat is a picture (`aria-hidden`), the legend is the text.
* **The logo's five yarns** (end stack): tan, devil red, outline, cream, horn yellow with their hex codes; click or press to copy (cursor label "Copy", polite status, 46 px rows).
* **The whole logo** (footer): `devil.webp` on a label hung from the fringe by a loop of yarn.

## 7. Typography and colour

* Chango (loaded by `WorldHost` with the chunk): month names, post titles, the profile name, the end titles; `-webkit-text-stroke: 0.13em` outline in `#2D2D2D`, `paint-order: stroke fill`, an offset text-shadow in the logo red. Karla for body copy, Gochi Hand (`loadHandFonts()`) for the notes, "follow the thread" and the labels' hand lines. Courier Prime for the small labels. The `WorldFacts` slate keeps the cabinet's own faces.
* Palette from the logo manifest: tan `#C9A269` (wall), red `#E8673F`, outline `#2D2D2D`, cream `#FFE4AB`, yellow `#EDB52B`, sun `#F9B925`; text-safe red on cream is `#A8301A` (6.1:1). Variables live at the top of the CSS file. The devil's dark outline is invisible on dark: he only ever stands on tan, cream or marigold.

## 8. Honesty

* Years: 2023. The account is `@fortyfour.lab`: handtufted rugs, international shipping, custom orders by DM (my translation of the bio).
* No prices, comments, likes, follower counts, Etsy shop or link-in-bio anywhere. Not even in code that ships (posts.ts carries only my own text).
* The end card says the grid has been quiet since the last post (the capture of 2026-10-28 found nothing newer than 2023-06-30). It says nothing else about activity.
* "Photos and clips come from the @fortyfour.lab Instagram account and are shown here as portfolio samples. The short captions are my own English versions." sits on the footer slate.
* The 74 s clip was checked frame by frame (the design on a screen, the traced outline, the tufting gun, the finished rug) before its note was written.

## 9. Verified

Tools: `tools/shot.mjs` style runs through my own runner (retries when another agent's edit reloads the dev page), a production build served statically, Chrome headless.

* **Viewports looked at**: 1440x900, 1920x1080, 768x1024, 390x844 (full scroll strips, contact sheets), plus 2560x1300, 1280x600, 1280x720, 1024x768, 844x390 landscape, 320x640 and reduced motion at 1440. Resizing the open world across 390 / 768 / 900 / 1100 / 1440 / 1920 keeps the thread and the devil valid, no NaN, no horizontal scroll.
* **Opening**: deep link `#/work/fortyfour-lab`, and by clicking the card in `#works` (focus lands on the scroller, Escape returns to `#works`); `]` goes to Spelled Guilty, `[` back; arrows stay free.
* **Console / network**: no errors, no warnings (in dev, framer-motion prints one dev-only reduced-motion notice on every page when the OS asks for it: not from this world, and absent in the production build), no 404, no failed or duplicate request.
* **Performance (production build, 1440x900)**: scroll the whole wall at 28 px per frame: p50 7.1 ms, p90 12 ms, 2 % of frames over 33 ms; at 390x844: p50 6.9 ms, 1.1 % over 33 ms. CLS 0.0001 (0 on the phone). No video loaded until it nears the viewport; at most one video mounted; at most 28 images in the DOM, 18 decoded at the top of the page. World chunk 15.1 KB gz.
* **Keyboard**: full Tab pass (ticket, 2 stops per carousel, the clip tab, 5 yarn buttons, the facts ticket, then the shell's tabs), every stop has the two-tone focus ring; carousel Arrow / Home / End; Play / Pause by button.
* **Touch (390x844, real touch events)**: swipe flips the carousel, a vertical swipe scrolls the page and leaves the counter alone, no control under 44 px, no horizontal overflow.
* **Still motion**: OS reduced motion and the "Pause motion" switch give the same result: devil at rest in the hero, the whole thread drawn, nothing hidden, no running infinite animation, no video starts by itself, Play works by hand.

### Critique rounds (what I saw, what I changed)

* **Round 1.** (1) The day-gap notes sat in the devil's walking path and the banner notes sat under the spine; (2) the empty right half of the foot; (3) a "Portrait rug" title on three different tags. Changed: notes start past the devil's short side, slide along the thread until clear and fade while he stands beside them; notes hang under the far end of each banner; the foot gets the whole logo on a stitched label; each rug has its own title.
* **Round 2.** (1) Holes of 450 to 630 px in the columns at 1440 and 1920; (2) APRIL / MAY / JUNE did not fill their cells and MARCH was timid; (3) reels as wide as photo tags made the columns uneven and the tags small on big screens. Changed: pixel packing (`pack.ts`), per-word banner sizes, slim reels, bigger tags above 1440, the "30+" patch and the size chart to fill the gaps with real facts.
* **Round 3.** (1) At 1280x600 the wordmark pushed the label and the devil below the fold; (2) the thread layer cost half of every frame; (3) three tab stops per carousel and a hidden "carousel" tab stop. Changed: the wordmark is capped at 40 % of the viewport height, the curtain reveal, two stops per carousel; also 320 px fixes (label handle, key icon column), honest labels (`Photos + clip`, `Reel, 01:14`), a literal note for the cutting reel.

## 10. Weak spots

* Six of the seven reels are still frames (audio flagged by Instagram); the world says so on every one, but a studio would love the process footage. Needs the original clips from Pau (see `notes/instagram-capture.md`).
* The wall is only 16 weeks long (13 posts). The end card says the grid went quiet; there is nothing newer to show.
* The tufted pile is generated, not photographed: it reads as rug at normal size and as a pattern if you zoom in on a 4K screen.
* On a phone the walking devil briefly overlaps the edge of the intro text (his trident side extends left of the thread).
