# World 5: Space Monkey, "Mission Dossier" (API / behaviour note)

Slug `space-monkey` · folder colour ultraviolet `#5B3DF5` (cream text, 5.5:1) · display face Orbitron 700-800 (loaded by the shell, `src/worlds/fonts.ts`; it has no middle dot, so the world writes `/` and draws stars) · body Karla · typed parts Courier Prime · handwriting Gochi Hand (lazy, the margin notes wait at most 0.9 s for it).

Source: `src/worlds/SpaceMonkeyWorld.tsx` + `src/worlds/space-monkey/**` (CSS prefix `w-space-monkey-`, about 45 KB of CSS, 11.5 KB gzip of JS). Nothing outside those files is touched. Default export, lazy chunk, renders only the content below the shell's strip (no title bar, no close, no prev / next).

## 1. What the visitor sees

A folder with a window onto deep space. The folder colour (ultraviolet) stays as a rounded frame round a sticky starfield; the content scrolls inside that window.

1. **Hero (one screen, a poster).** Wide (container 1100 px and up): the title `SPACE MONKEY` stands on the left edge like the label on a film can (reads bottom-up, with a hard offset in the SMITH uniform blue), the two posters take the middle at the largest size the height allows, and a rail on the right holds a margin note, the mission patch and the "File 05" brief card (with a one-line postscript in Pau's pen: "more below: the dates and the log"). Under 1100 px the title lies flat on top and the patch and brief sit under the posters; under 720 px everything is one column and the posters are stacked.
2. **Two holographic tilt posters** (TYLER, SMITH). CSS 3D tilt that follows the pointer; the foil is six stacked gradient layers (overlay and color-dodge bands, glitter, fine lines, a specular spot) that move with the tilt by transform and opacity only. TYLER has a cool spectrum (ice, violet, magenta, aqua), SMITH the full rainbow. Above each print: a **Tilt gauge** drawn as a ruler (the touch / keyboard way to tilt) and a **Flip** tab. Flip turns the poster over to its **dossier side**: `Poster 01 / 02`, the file name, the Photoshop dates, the palette that is really in the poster (click or tap a chip to copy its hex: the shared "Copied #XXXXXX" tag), Pau's handwritten note and a FILED stamp.
3. **Mission patch**: "MY FIRST PROJECT / AGE 13" stitched round the room's own monkey patch (cut out of SMITH's sleeve; its author is unknown and is not claimed). A grease-pencil circle marks the real patch on SMITH's sleeve.
4. **Mission tape** ("From file to opening day"): a yellow measuring tape, one tick per day from 1 Dec 2017 to 28 Feb 2018, tags at the real dates (TYLER file created 08 Dec, SMITH file created 13 Dec, SMITH last saved 20 Dec, the room opens 19 Feb 2018) and the 61-day gap between the last save and opening day. Horizontal from 1000 px, vertical (day 0 at the top) below.
5. **Mission log**: a typed, punched sheet (What / Story / Where / When / Who / Now) that types itself once when it comes into view.
6. **End**: the WorldFacts slate (Role / Year / Tools; no external link, because the room's own website no longer exists), the two posters in miniature, taped up, and a **Back to the posters** tab.

## 2. Interactions and their alternatives

| Feature | Pointer | Keyboard | Touch / no pointer |
|---|---|---|---|
| Tilt | move over the poster (spring; the light follows) | focus the poster (Tab), arrow keys tilt a step at a time, `Home` levels it | the **Tilt** range gauge under each poster (`aria-label="Tilt the TYLER poster"`, `aria-valuetext` "Level" / "40 percent right"), and press-and-drag on the print |
| Flip | click the print, or the **Flip** tab | `Enter` / `Space` on the focused poster, or Tab to the Flip button | tap the print or the Flip tab |
| Copy a colour | click a chip (cursor label "Copy") | Tab to a chip, `Enter` | tap (chips are 44 px or taller) |
| Back to the top | the **Back to the posters** tab | Tab + `Enter`; focus moves to the first poster | tap |

* Arrow keys are consumed only while the poster itself has focus (`event.target === currentTarget`). `Escape` always reaches the shell. `[` and `]` reach it from the poster, the chips and the buttons; from the Tilt gauge (an `<input>`, which the shared `useKey` treats as typing) the world passes them on itself, with the same modifier rule.
* The side that is not showing is `inert` and `aria-hidden`; a polite live region says "TYLER: dossier side showing".
* The poster is `role="group"` with `aria-roledescription="holographic poster"` and a hidden hint (`aria-describedby`).
* Over a control (the Flip tab, a chip) the poster holds its pose, so the thing under the pointer never slides away before the click lands.
* Touch: the stage has `touch-action: pan-y` (a vertical swipe scrolls the world; a horizontal drag tilts).

## 3. Motion states

| State | Starfield | Posters | Typing | Flip |
|---|---|---|---|---|
| Normal | 3 parallax layers drifting, twinkle, pointer + scroll parallax, ~30 fps; the Earth limb and sunrise are drawn once per resize | spring tilt (max 17 deg Y / 12 deg X), foil follows, a short idle "hello" sweep (9 s) after opening | types once; if the sheet is scrolled away first, the rest is written at once | 0.85 s turn with a small overshoot |
| `prefers-reduced-motion` or `html[data-motion="paused"]` (`useMotion().still`) | one static frame, no loop scheduled | **flat** (no rotation, no resting angle); the foil keeps a fixed light; arrows / gauge still move that light, instantly | finished sheet at once, no caret | instant |
| Tab hidden / canvas off-screen | loop stopped (`visibilitychange`, `IntersectionObserver`) | loop stopped | n/a | n/a |

No per-frame React state anywhere: positions live in typed arrays (sky) or are written straight to the DOM (tilt: `style.transform` and `--lx --ly --mag`; typing: two text nodes per line). Measured: 30 to 50 clears of the star canvas per second on screen, 0 when hidden, paused, reduced or off-screen; 0 `requestAnimationFrame` calls from the whole page while still; layout shift 0.0005 over load, flip and scroll; window / document / scroller listeners return to the baseline after the world closes.

## 4. Files

| File | Role |
|---|---|
| `SpaceMonkeyWorld.tsx` | composes the world; measures the scroller height into `--sm-h` (ResizeObserver) so the sticky sky and frame are exactly as tall as the scroller; lazy Gochi Hand; the "Back to the posters" block |
| `space-monkey/data.ts` | **all copy and facts** (posters, palettes, dates, log lines, tape marks). Every fact comes from `public/works/space-monkey/manifest.json`, `docs/ART_DIRECTION.md` 9 and 12.1 and Pau's own words |
| `space-monkey/HoloPoster.tsx` | one poster: stage (perspective, keyboard + pointer), Flip tab, front (print + foil + sleeve circle), back (`PosterBack`), Tilt gauge |
| `space-monkey/tilt.ts` | `HoloTilt`: a small spring that writes rotateX / rotateY and `--lx --ly --mag` straight to the DOM; runs only while something moves; stops off-screen, on a hidden tab and when still |
| `space-monkey/PosterBack.tsx` | the dossier side (fields, palette chips with copy, Pau's note, stamp) |
| `space-monkey/notify.ts` | guarded import of the shared toast (`import.meta.glob`: never breaks the build if the toast module moves) |
| `space-monkey/Starfield.tsx` + `sky.ts` | the two canvases (stars, Earth limb) and the loop (`createSky`) |
| `space-monkey/MissionPatch.tsx` | the embroidered patch (SVG, `textPath` ring, thread filter) |
| `space-monkey/MissionTape.tsx` | the measuring tape (positions are CSS only: `--at = day / 90`) |
| `space-monkey/MissionLog.tsx` | the typed sheet |
| `space-monkey/space-monkey.css` | all styles; palette variables `--sm-*` at the top (the posters' own colours); the foil spectrum per poster is six custom properties on `.w-space-monkey-foil` |

## 5. Honesty decisions (do not change without Pau)

* TYLER and SMITH were Pau's **first project, at 13** (his words: "My first project, at 13."). The files are Photoshop CS6 exports dated 8 Dec 2017 (TYLER created and saved) and 13 Dec 2017 (SMITH created; last saved 20 Dec 2017); the file names are the exported JPGs (`TYLER.jpg`, `SMITH 2.jpg`). SMITH's note says only "Five days after TYLER." (the two creation dates).
* The room opened in **Granollers on 19 Feb 2018** (its own archived opening post); its website **no longer exists**: said in the log, nothing is linked.
* The monkey-astronaut art is **the room's patch**; its author is unknown, so the world says "the room's own patch, cut from SMITH's sleeve" and never that Pau drew it. It is shown small (the cut-out is only 181 px native).
* Not stated on purpose: the room's duration (sources say 60 and 80 minutes) and Tyler's rank (colonel on one page, lieutenant on another). "Two to six players" is on both sources. The one line of story (the shuttle Icarus flies to the station Helios, contact has been lost) is on both. The posters are described by what they show ("an astronaut over the Earth", "a uniformed officer in a shuttle hangar"), not by who they are in the story.
* Nothing from the third-party listing is shown (no rating, price, address, review).
* The WorldFacts slate reads `work.roles` from `src/lib/works.ts`: it says "Poster design" and "Illustration". The evidence supports "Poster design"; whether Pau drew the characters himself is for him to confirm (see the report's open questions).

## 6. Facts for the integrator

* Reads `useWorld()` for `work`, `reduced` (= `useMotion().still`), `scrollRef`, `next`, `prev`. Uses `WorldFacts`, `TabButton`, `Folder`, `Stamp`, `PaperClip`, `Scribble`, `Tape` from `@/components/primitives`, `useMediaQuery` / `useInView` / `copyToClipboard` from `@/lib/hooks`, `spring` from `@/lib/motion`, `loadHandFonts` from `@/styles/fonts`.
* Only transform, opacity and clip-path animate (the typing caret blinks by changing a border colour in two steps and stops under still motion).
* Images: `tyler.webp` / `smith.webp` (1005x1500 / 1017x1500) with `srcSet` of the 600 px thumbs, explicit width / height and `aspect-ratio` boxes (no layout shift); the first poster is `fetchpriority="high"`, the second is lazy on phones; the patch is `logo-monkey-patch.png` (181x162); the miniatures at the end reuse the 600 px thumbs (lazy, `alt=""`).
* Contrast measured: cream on ultraviolet (tabs) 5.5:1, ultraviolet and royal blue on the paper of the dossier 5.8:1 and 5.4:1, ink-3 on paper 9.7:1; light text on the sky sits on a dark halo and measures 7:1 or better against its surroundings. Nothing is under 13 px (the patch lettering is 15.9 px at 768 and 19 px or more elsewhere).
* Scanned for horizontal scroll, sticking-out boxes and truncated text at 320x568, 320x640, 360x640, 375x667, 390x844, 412x915, 844x390, 600x900, 768x1024, 1024x768, 1280x600, 1280x720, 1366x768, 1440x900, 1920x1080, 2560x1440 and 3440x1440: nothing found. The dossier back was also measured at 1366x520, 1280x480, 1100x500, 900x450, 480x800, 1366x600 and 1920x900: it always fits its card (the caption and the tool line drop out on short cards, the stamp and the chip names on the smallest).
* Browsers: built and measured in Chromium only. The riskiest parts in other engines are the blend modes of the foil inside a 3D-transformed card (Safari) and container-query units (cqw / cqh, supported since Safari 16 and Firefox 110).
* The "You have Reduced Motion enabled on your device" console warning seen with `prefers-reduced-motion` in the dev server comes from framer-motion's dev build (it also appears on the home page); it is not printed by the production build.
* Test hazard for the other agents: the shared dev server full-reloads whenever any agent saves a file. For a stable run, keep a private Vite config that only watches the world's own files (a config outside the repo that sets `server.watch.ignored`, started with `npx vite --config <file> --port <port>`).

## 7. Fix round 1 (critic findings)

* **Still switch.** `space-monkey/useStill.ts` = the shell's `reduced` OR the `html[data-motion]` attribute watched by a `MutationObserver`, so a pause written straight to the attribute also stops the sky, the tilt and the typing live (measured: 0 `requestAnimationFrame` calls from the world 2.5 s after the attribute is set, and after the real Pause switch). `HoloPoster`, `MissionLog` and `SpaceMonkeyWorld` use it instead of `useWorld().reduced`.
* **No `text-shadow`.** The title's blue offset is an aria-hidden second copy of the words (`.w-space-monkey-title-ink`, words from `data-t` + `::before`, so the heading is read once). The halo behind light text on the sky is a scrim: a soft `box-shadow` cloud of space black on the text's own box. The two labels against the yellow tape (`61 DAYS`, `5 DAYS`) use a solid space-black plate.
* **Rail.** `.w-space-monkey-rail` is a container (`smrail`, wide layouts only) stacked from the top: margin note, patch (capped at min(30rem, 29vh): the cut-out stays near 1.3x of its native 181 px), caption, a **T-minus 61 slate** (`Gauge`, hidden under 1300 px of container width and under 820 px of height) and the brief card at the foot (`margin-top: auto`). The patch fades in with a plain CSS animation (no scroll observer) and is warmed (fetched + decoded) when the world chunk loads.
* **Tape + log.** New wrapper `.w-space-monkey-mid` (`--rail`, `--sm-block` tokens). A bracket marks the 5 days between the two files (horizontal tape only). The slate column climbs into the empty lower rail of the tape, so there is no black band. 720 to 999 px (tablet): the vertical tape sits beside the log and the slate and miniatures share the row below.
* **End.** The two miniatures are about 2x bigger (`--mw` 18.6 cqw) and fan across the column; every vertical gap is `--sm-block`; the Back tab is centred.
* **Tilt gauge** follows the pointer and the idle sweep (`HoloTilt.onFollow`, written to the input's DOM value, no React state, not while the gauge itself has focus, and not at all under still motion, where the poster is flat); keys and the gauge still own the pose through `onManual`.
* **Log** types its rows side by side on phones (staggered by 6 characters) and starts as soon as the sheet touches the screen, so no phone sees a blank sheet for long. Copy no longer repeats the brief (it adds: what the posters show, 61 days, near Barcelona, two to six players).
* Palette chips have a distinct two-ring focus (paper gap, ultraviolet, ink). The yellow grease-pencil ring on SMITH's sleeve has a dark ring under it.
