# Section 03 About: API and behaviour note

Source: `src/components/sections/About.tsx`, `about.css` and `src/components/sections/about/**`. Read this instead of the source.
Prefix of every class: `pm-ab-`. Copy: `ABOUT` in `src/lib/copy.ts`, plus `about/text.ts` (strings the section adds, listed at the end).
Last full pass: second run (2026-10-28 evening). Everything below describes the code as it is now.

## 1. What is on the sheet

`<Sheet id="about" tone="marigold" page="About" n={3}>`: ink text on marigold, oxblood meta bar. One `<h2>` (the outline word, riso-offset in tomato), `<h3>` blocks below it.

| Block | Where | What |
|---|---|---|
| Heading | left, top | `StrokeWord` ABOUT ME (h2, `stack="mobile"`), ghost `#PAU` above it |
| Greeting | left | `h3` "Hi, I'm Pau!" (Fraunces 900, ~9vw) with a hand-drawn underline under "Pau!", the name in Fraunces italic 300 |
| Words | left | first sentence of `ABOUT.paragraph` as a standfirst (Fraunces 700), the rest as body (Karla, 3 phrases in the italic twin, each kept on one line). Side by side when the column is 700px or wider (container query). `About.tsx` sets the single dash of the copy as two sentences (`sentences()`: "never really stopped. Now I design ...", the page has an em dash budget of two) and ties short words and year ranges to their neighbours with no-break spaces (`bind()`), so no line ends on "a", "In" or "lay"; `text-wrap: pretty` on the body |
| Skills | left, under the words, level with the education strips | three different paper objects (`Skills.tsx`) |
| Portrait | right column | ink folder `PM · PAU MONFORT` > slide mount (sprocket holes cut out of its left edge) > scrubbable portrait with a playhead > 12-frame strip with a real range input > hand hint > honest caption |
| Education | under the portrait (>= 700px) or with the certificates (< 700px): only ONE of the two is in the DOM (`useNarrow`, `about/useNarrow.ts`, query `(max-width: 699px)`), so there is one "Education" heading | embossed label-maker strips |
| Work experience | full width | paper folder tab `WORK EXPERIENCE 04`: credits, a two-track film timeline, an axis with the freelance folders hanging from it, the undated work (section 4) |
| Certificates, links | full width, last | paper file tags in two columns (3 open a PDF) and four ticket stubs in two columns |

Grid (`.pm-ab-grid`, areas `head intro skills portrait`):
- >= 900px: two columns `1fr | clamp(380px, 30vw, 540px)`, the portrait cell spans the three left rows; the skills sit at the END of their row (`align-self: end`) so both columns finish level whichever one is taller (at 1920 the right one is).
- 700 to 899px: `head head / intro portrait / skills skills`, portrait column `clamp(300px, 42vw, 360px)`.
- < 700px: one column in the order head, portrait, intro, skills.
- Skills follow the width of their own box (container query on `.pm-ab-skillswrap`): three objects of different widths, two columns under 660px (the third spans), one under 520px.

## 2. The portrait

Files: `Portrait.tsx` (folder, mount, hint, caption, owns `--p`), `ScrubVideo.tsx` (the picture and its modes), `FrameStrip.tsx` (strip, range, oval), `clip.ts` (constants, source choice, the engine). Assets: `public/about/**` (`manifest.json` there). CSS: `about/portrait.css`.

**Modes** (decided by `usePointerFine()` and `useMotion().still`):

| Input | Behaviour |
|---|---|
| fine pointer | moving across the frame scrubs the clip: `progress = (x - left) / width`, smoothed in a rAF lerp (0.2 per frame), snapped to a whole frame, `video.currentTime = frame / 24` (the last frame is at 6.0 s, not at `duration` 6.0417). Pointer leave glides back to frame 0. The engine only runs while something has to move; it skips the assignment while `video.seeking` and guards `Number.isFinite(duration)`. |
| touch / coarse | the frame is a `<button aria-pressed>`: a tap toggles the seamless ping-pong loop (`portrait-loop.mp4`, muted, `playsInline`, 12 s). The strip follows the playing video. Dragging the strip loads `portrait-sm.*` on demand and scrubs. |
| reduced motion or "Pause motion" | poster only: no autoplay, no pointer scrub, **no video request**. Moving the strip (an explicit act) still works: an interim thumbnail answers at once, the video is fetched and takes over when buffered. |

- **Source choice in JS** (`chooseClip`): `canPlayType('video/webm; codecs="vp09..."')` then webm, else mp4. The 640 px files (`-sm`) unless the frame is wider than 560 device pixels (frame css width x min(dpr, 2)) and the connection is not `saveData` / 2g / 3g. Posters use `srcset` (no JS).
- **Lazy**: no `<video>` exists until the frame is within one viewport of the screen (IntersectionObserver, `rootMargin: 100% 0`), then `preload="auto"`. Measured: nothing is requested at the top of the page; the request starts when the frame is about 1.8 screens below at 1440x900.
- **Pause motion / reduced motion while the clip is mid-way** (live toggle, tested with the real button): the video is removed, and the timecode, the printed frame number, the strip, the oval and the playhead go back to frame 0 (the poster), so nothing stale is left on screen; resuming starts from the poster. Same for the touch loop.
- **Ready**: scrubbing is enabled when the whole file is buffered (best effort after 9 s). Until then the poster stays and a marigold "Developing NN%" chip shows.
- **Overlays** (DOM written directly, React never re-renders per frame): slate tag `PORTRAIT / 24 FPS`, burnt-in timecode `00:00:03:12` (frame 84), printed `FR 084` on the mount, the **playhead** (a cream hairline with a flag, follows the smoothed pointer across the frame, visible only while scrubbing or while the loop plays), `--p` (0..1, written on `.pm-ab-portrait`; the grease-pencil oval on the strip and the playhead both read it), the range value and its `aria-valuetext` ("Frame 85 of 145, 00:00:03:12").
- **The strip** is `<input type="range" min=0 max=144 step=1>` laid over 12 thumbnails (`frames/f-01..12.webp`): arrows = one frame, PageUp / PageDown = a tenth, Home / End. Thumb and oval share one width (`--ow`), so the oval sits exactly on the value. Two-tone focus ring from `base.css` around the strip.
- **The mount**: cream paper, 3px drawn edge; the sprocket holes down its left edge are cut out with a two-layer mask (a solid layer minus a tile that holds only the hole, `mask-composite: exclude` with the `-webkit-mask-composite: xor` twin), so a tile seam can never nick the paper (the old single-tile mask showed hairlines between holes).
- **Entrance**: the slide mount arrives as a `Reveal kind="drop"`, the strip a beat later as `Reveal kind="rise"` (hidden states only under `html.js`; the wrappers are `transform: none` once in, so the focus ring is never offset). The hint is always two lines (one block span each, split at the first " to "): the hand face loads late and a wrap that depends on it would move the page.
- **Mat**: 13px of paper above the frame, `object-position: 48% 0%` (never above 0%): the hair touches the top of the clip.
- Honest caption: "Animated portrait, made with AI video tools". Poster alt describes the picture. The hidden interim `<img>` has a real `src` (frame 01, lazy), never an empty one.

Behaviour verified with `playwright-core` on Chrome (scripts in the scratchpad `shots/about/test-*.mjs`, all run through `lib.mjs`, which kills the Vite HMR socket so another agent's save cannot reload the page mid-test): pointer at 2 / 25 / 50 / 75 / 98.5 percent gives frames 3 / 36 / 72 / 108 / 142 (t = 0.125 / 1.5 / 3.0 / 4.5 / 5.917 s), leave returns to 0, ArrowRight x10 = frame 10 (0.417 s), End = 144 (6.0 s), Home = 0; the playhead sits at the pointer (x = 62 percent of the frame gives `--p` 0.62 and the line at 214 of 345 px); reduced motion: no request until the strip moves; touch: tap plays and pauses, strip tap loads `portrait-sm.webm`.

## 3. Skills (`Skills.tsx`, `skills.css`)

`ABOUT.columns` rendered as three different objects, each with a coloured divider tab and a drawn pictogram (`marks.tsx`):
1. Graphic designer: paper card, a fan of five colour chips behind it, swatch-square bullets (tomato / lagoon / ultraviolet).
2. Illustrator: spiral-bound sketchbook page (wire loops and punched holes are masks, the holes show the sheet), dot grid, dash bullets, a brush squiggle (`Scribble kind="squiggle"`).
3. Front-end developer: ink card, line numbers in the label face, a hand-drawn pair of braces that draws itself (`BraceScribble`, uses the primitives' `pm-sc` draw-on classes).
Each `<li>` is a `Reveal kind="pop"`; the tilt lives on the inner object.

## 4. Career (`CareerTimeline.tsx`, `data.ts`, `timeline.css`)

**Real dates only** (ART_DIRECTION section 9). `data.ts` holds `JOBS` (role and place come from `ABOUT.timeline.items`, the CV line from `text.ts` `CV`), `PINS` and the derived `ALSO`. A date is a year fraction (a start is the start of its month, an end the end of its month); `pct(date)` gives the position on the ruler. The ruler runs from 2017 to the end of the current year (`AXIS_END`, grows by itself); a job that is still running (Plana Digital) ends at today.

| Job | Reel | From | To | Track |
|---|---|---|---|---|
| Web graphic designer, Connecor, Barcelona | I | Oct 2019 | Nov 2024 | 0 |
| Editorial director, Casual Magazines, Barcelona | II | May 2022 | Nov 2024 | 1 |
| Front-end developer (junior), 4mation Technologies, Sydney | III | Jul 2025 | Feb 2026 | 0 |
| Brand & web design, Plana Digital, Cardedeu | IV | 2026 | now | 1 |

`pack()` in `data.ts` puts each clip on the lowest track whose last clip has ended (first fit), so jobs that overlap in time overlap on the page: that is where the second track comes from, not a layout choice. A clip at least 2 years long holds its words (`label: 'in'`); a shorter one is named outside, on the side of its track with more free room (`'left'` or `'right'`). `overlaps` is true for a job that began while an earlier one was still running (only Casual Magazines).

CV lines (verbatim from section 9, first letter capitalised): Connecor "Developed and presented design proposals, edited photographs for web banners and social media, designed, laid out and produced technical illustrations for brochures, banners and signage."; Casual "Tracked communication strategies, ad campaigns and marketing actions; helped maintain brand identity guidelines for visual consistency."; 4mation "Developed and maintained web applications with the dev team; HTML, CSS, JavaScript, responsive design and UX good practice." Plana has no CV text in section 9, so its line is built from the registry blurb: "The brand identity, the brand manual and the website of my own web studio in Cardedeu." Casual carries a tag link to the Contract folder ("Proyecto Contract"); it does not say who laid out the issue.

**Wide screens (>= 1100px)**, top to bottom inside the paper folder:
1. **Credits** (`ol.pm-ab-jobs`): four columns (two by two when the folder is narrower than 1040px, a container query on `.pm-ab-tl`), each under a 5px rule in its clip colour: reel numeral chip + dates (label font), role (Fraunces 800), place, the CV line, and for Casual Magazines the "Proyecto Contract" tag (right arrow: it opens a folder, it is not an external link). The four credits are subgrid items spanning five shared rows (`@supports (grid-template-rows: subgrid)`), so a role that wraps ("Front-end developer (junior)") pushes the same row down in every column and the titles share a baseline (`align-self: end`); the places and the CV lines stay level. Pointing at a credit (or its clip) lights both and quietens the rest (`useJobLinks`, DOM attributes `data-hot` / `data-dim`, mouse only, decoration: every word is on the page without it).
2. **The film** (`.pm-ab-plane`): year bands and the dashed NOW playhead behind two tracks of film clips (`.pm-ab-clip`: ink bands with mask-cut sprocket holes around a band in the folder colour, placed with `--s` and `--e`). The long clips say "reel, role, company" (the words wrap onto a second line that is cut off, so only what fits shows); the short ones are named beside them (`PLANA` or `PLANA DIGITAL` by container width, `4MATION`). The running job's film is torn off at NOW. A handwritten note ("two roles at once, 2022 to 2024", derived from the dates) with an arrow sits on the free track before the Casual clip. Entrance: the clips are drawn out from the left (clip-path, staggered), only under `html.js`.
3. **The axis**: thick line, year and month ticks, year labels (centred in their year), a NOW flag.
4. **Freelance and own projects** (`.pm-ab-lane`): tiny folders hang by string from the axis at their date: Space Monkey Dec 2017 ("my first project, at 13"), 44 Lab 2023, Plana Digital 2026, Spelled Guilty 2026. Each is a real link: `layoutId={folderLayoutId(slug, 'about')}`, `openWork(slug, 'about')`, `prefetchWorld` on pointer enter and focus; the caption under it is `aria-hidden` (the link's name already says it). Width `--ab-pw` = `clamp(128px, 11.6vw, 198px)`, string length `DROP` = 92px. `usePinSpacing` pushes neighbours sideways (the string swings) until a folder plus a 52px gap fit (it keeps the old values when the lane has no width, e.g. a transient 1px viewport, instead of resetting every string: a screenshot tool's element capture showed that), writes `--dx --len --ang` straight to the DOM from a ResizeObserver, and tells the lane heading how much free room there is between the first two folders (`--lab-left`, `--lab-w`): the heading "Freelance & own projects" and its hand note live in that gap.
5. **Also in the cabinet**: undated work (Procreate, Somia, Gotet, the portfolio deck, the sticker sheet) as tags in the project's folder colour (`AlsoChip`, same open pattern, dashed stitch line = concept). Proyecto Contract is not a pin: it is inside the Casual Magazines credit.

**Under 1100px**: the plane, axis and tracks disappear; each credit is a list item with its own gauge (2017 at the top, 2026 at the bottom) and the clip drawn on it as a vertical ribbon (same `--s` / `--e`); from 700px the credits sit two by two; the pins are a grid (two columns, four from 640px) with the notes under the titles.

**Focus after a world closes**: the shell hands focus back to the opener, but the shared-element flight hides the folder and the browser drops it (or the shell parks it on `<main>`). `useRestoreFocus` puts it back 900 ms after the route returns home when nothing (or only `<main>`) has it. Verified for a pin (keyboard and mouse), a tag and the Contract link. See the shared requests in the report.

## 5. Education, certificates, links (`Credentials.tsx`)

- Education: `ABOUT.education[0..1]` as embossed label-maker strips (ink, raised type, year chip). `Education variant="cell"` sits under the portrait, `variant="row"` in the last row; CSS shows one of them (the other is `display: none`).
- Certificates: `ABOUT.education[2..5]` as paper tags in two columns (one under 640px), each as wide as its cell with the PDF mark on its right. The NSW Government chip reads "May 2026" (the CV gives the month; `DATE_LABEL` in `data.ts`). The three with a PDF carry a paper clip and open `/certificates/generative-ai.pdf`, `/certificates/software-web-dev.pdf`, `/certificates/cyber-security.pdf` in a new tab (`rel="noopener noreferrer"`, accessible name ends "certificate, PDF, opens in a new tab"). The NSW certificate has no PDF.
- Links: four `Ticket` stubs from `ABOUT.badges` (Instagram @fortyfour.lab, Website planadigital.cat, GitHub paumonfortjudici, On Amazon Spelled Guilty); stub colours are the destinations' folder colours.

## 6. Motion contract

Hidden initial states exist only under `html.js` (clip-path of the clips, `opacity` / `translate` / `rotate` of the pins (each folder swings once on its string, neighbours the opposite way: the spring easing overshoots about 0.4 degrees), opacity of the outside labels and the overlap note, the primitives' own for `Reveal`, `StrokeWord` and `Scribble`) and every one has a block for `prefers-reduced-motion` and `html[data-motion="paused"]` that shows the finished state. Hover lifts (clips, reel chips, tags, the swatch fan of the first skill) are off under both switches; only the opacity quietening stays. Only `transform`, `opacity`, `clip-path` and the individual `translate` / `rotate` properties are ever animated (the tag hover tint is instant). Nothing loops by itself (no ambient animation, so no `pm-ambient` class is needed). The video, the oval, the playhead and the timecode move only because the visitor moves something (or tapped play on touch). Off-screen and hidden-tab behaviour: the loop pauses on `visibilitychange` and when less than 15 percent of the frame is visible; the scrub engine has no idle loop.

## 7. Verified (second run)

`npx tsc -b` clean for these files; `vite build` passes (initial JS 183 KB gzip for the whole site). 1440x900, 1920x1080, 1280, 1100, 768x1024, 390x844 (touch), reduced motion and paused motion. No console errors or warnings, no failed requests, no horizontal scroll at any width. Layout shift: zero inside the sheet at 1440 (the only shifts measured at 390 and 768 move the whole sheet because the Catalog sheet above it changes height a second or two after load). DOM audit (`test-a11y.mjs`): no text under 13px, no unnamed control, every `<img>` has `alt` and `width` / `height`, no tap target under 44px on touch, headings h2 > h3 > h4 in order (the audit's contrast list only flags text on folder silhouettes, which it cannot see: cream on ink, pine, oxblood or ultraviolet, all checked by eye). Keyboard: Tab order through the sheet is the reading order (meta buttons, range, Contract link, 4 pins, 5 tags, 3 PDFs, 4 tickets), every stop shows the two-tone ring. Worlds open and close from a pin, a tag and the Contract link (Escape; focus returns to the opener). Hover link between credits and clips, the playhead, the lazy video request, the reduced and paused motion paths and the touch loop were each run in Chrome.

## 8. Strings added by this section (not in `COPY.md` / `copy.ts`; fold them into `copy.ts` if you want one place)

`about/text.ts`: `PORTRAIT` (hints "tap the portrait to bring him to life" and "slide the strip to pick a frame", caption "Animated portrait, made with AI video tools", poster alt, range label, slate "Portrait / 24 fps", "Developing", year "2026"), `TIMELINE` ("Now", "Freelance & own projects", "Each folder opens its own world.", "Also in the cabinet", "Concept", "Proyecto Contract" and its labels, the overlap note "two roles at once, 2022 to 2024"), `CV` (four lines), `PROJECT_NOTES` (four short notes in my voice, all from works.ts), `CREDENTIALS` ("Education", "Certificates", "Elsewhere", "PDF"), `TICKETS` (kicker and label per badge code). `data.ts`: the roman reel numerals and the short company names for the clips (`4mation`, `Plana Digital`, `Plana`).

## 9. Known weaknesses

- The About paragraph in `copy.ts` still has its em dash; `About.tsx` shows it as two sentences (see section 1), so the About sheet itself prints none. The whole page still has about seven more (catalog sub, search placeholder, two Process steps, Contact, toast, the browser title): the quality bar says two. Suggested fix in `copy.ts`: a full stop after "never really stopped" and a capital N, and then the `sentences()` helper in `About.tsx` can go.
- The Gochi Hand face loads late (`loadHandFonts` at idle); the layout does not move (two lines are reserved) but the handwriting swaps from the fallback once.
- Safari and Firefox were not tested (webm VP9 scrub, container queries, `:has()`, `mask-composite`); the mp4 and poster fallbacks and the `-webkit-mask-composite` twin are in place.
- Between 1100 and about 1250px the clips are narrow: the short ones are labelled with the narrow names and the 4mation label touches the right edge of the plane.
- The Plana credit line is derived from the registry (section 9 has no CV text for it).
- Plana's start month is not known (the CV says "2026"), so its clip starts on 1 January 2026 and overlaps 4mation by two months; that is why it sits on the second track.
