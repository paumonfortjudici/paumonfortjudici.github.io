# World 6 · Procreate Sketchbook · "Sketchbook Wall" (API + behaviour note)

Slug `procreate`, folder colour bubblegum `#FF8FC1` (ink text). Files: `src/worlds/ProcreateWorld.tsx` (default export) and `src/worlds/procreate/**`.
Read this instead of the source. Nothing outside those paths was touched; the shell, primitives, copy and registry are used as documented.

## What it is

A hand-made wall. Five early drawings (public/works/procreate: the two portraits in four warm colours, the Yakisoba crest, the Vértice logo idea, the portrait of two kids) hang on a sheet of kraft paper pinned to a cork board. Each print is a real `<button>` you can **drag** (framer-motion drag, momentum, soft bounce at the edges, it sways with the speed of the hand and settles), or move **without a pointer**. A tool tray holds a ruler, a pencil, an eraser and three tab buttons: **Tidy up** (the ruler), **Shuffle**, **Rub out the notes** (the eraser). Open a print in a **close-up** with its one-line description. Below the wall: an index card (the five, each with a little glued-on print, its description and a "Look closer" tab; the whole row is clickable), a palette card (the four colours the two portraits share) and the `WorldFacts` slate (the right-hand column is sticky while the five rows scroll past).

First screen (1280 x 720 and up): the hand-lettered title on the folder's bubblegum, the lede, then the wall filling the rest of the screen with the tool tray at its foot; a 36 px sliver of the next strip's cork rail shows under it, so the board plainly goes on. The wall is the one dominant thing.

## Interaction map

| Input | What happens |
|---|---|
| Hover a print (mouse only) | it lifts a hair (scale 1.02) and settles back on leave; none of it for touch, reduced or paused motion |
| Pointer down on a print | it comes to the front |
| Drag a print | follows the hand, lifts (scale 1.045), sways up to 5.5 degrees with its speed, glides on release (`power 0.17, timeConstant 300`), bounces softly (`dragElastic 0.12`) inside the wall; a pin hole / tape ghosts appear where it hung; the wall's "pick one up" note fades |
| Press (no drag) on a print that is still travelling (entrance, Tidy, Shuffle) | framer stops the glide on pointer down; the click that follows lets it finish the trip (`resume()` in Print.tsx) |
| Double-click a print (mouse) | opens the close-up. A single click only raises it |
| Tap a print (touch, pen) | opens the close-up |
| Tab | prints (reading order: two kids, crest, logo, cap, quiff), then Tidy up / Shuffle / Rub out the notes, then the five "Look closer" tabs |
| Arrow keys on a focused print | nudge 12 px (Shift: 48 px), clamped to the wall; the page does not scroll |
| R / Shift+R on a focused print | turn it by +6 / -6 degrees (wraps at 36) |
| Enter / Space on a print | opens the close-up |
| Click on an index row (picture, title or sentence) | opens the close-up of that print; focus returns to the row's "Look closer" tab on close. The tab itself is the keyboard / screen-reader route (its Enter / Space click bubbles to the same handler) |
| Close-up: Left / Right / Home / End | previous / next / first / last print (wraps). A horizontal swipe on touch |
| Close-up: click on the empty dark area | closes it (a click on the paper or the caption does not) |
| Close-up: Tab / Shift+Tab | cycles inside the dialog (Previous, Next, Back to the wall); the shell's trap does not run |
| Esc | closes the close-up first (focus returns to the element that opened it); with no close-up open it closes the world (shell) |
| `[` `]` | still hop between projects (shell), also while the close-up is open |
| Tidy up (tab, or click the ruler) | toggle: squares everything up, again = back to the way it was hung. `aria-pressed` on the tab |
| Shuffle | scatters the prints (best-candidate placement that avoids piles), new z-order, new tilt |
| Rub out the notes (tab, or click the eraser) | wipes every handwritten note and arrow left to right (clip-path); the label becomes "Write the notes back". On a phone (narrow wall) the tab reads "Rub out" / "Write back" so the three tabs share one line; the accessible name stays the full phrase |

The ruler and the eraser are mouse shortcuts to the tabs next to them: `aria-hidden`, `tabIndex -1`. Cursor labels: prints `Drag`, index rows and "Look closer" `Open`, "Back to the wall" `Close`.

Live region (`role="status"`, polite): "Prints squared up and lined up." / "Prints back where I hung them." / "Prints shuffled." / "Notes rubbed out." / "Notes written back."

## Layout engine (`procreate/layout.ts`, pure functions)

The wall is measured (ResizeObserver on the wall and on the world's scroller) and one of three **kinds** is chosen: `wide` (wall >= 960 px wide and the viewport under the tab strip >= 640 px tall: one screen, the wall height comes from the viewport), `mid` (>= 600 px: two columns of prints, the wall is as tall as they are) and `narrow` (one column). The root carries `data-kind`; the tool tray follows it (on mid / narrow it moves to the top of the board: ruler and eraser on one line, the three tabs on the next).

* Every print has a size (paper width `w`; border 4.5 %; writing strip 15-17 % of `w`; the height follows from the drawing's aspect ratio) and a pose `{ x, y, rot, scale? }` in wall pixels (top-left corner, transform origin at 50 % 42 %).
* `planFor(kind, W, H)` returns `{ dims, loose, tidy, wallH }`. **loose** = the hand-hung composition (wide: the table `WIDE_LOOSE`, in a 1380 x 520 reference wall, scaled by `s = min(W/1380, H/520)` in size and spread to the real width / height in position; mid / narrow: jittered columns). **tidy** = wide: one row hung on the wall's middle line (the prints shrink just enough to fit, equal gaps, a faint pencil line shows); mid / narrow: plain columns at full size.
* `scatter(plan, W, seed)` is the shuffle (seeded, repeatable).
* A hand-made arrangement (after a drag, nudge or shuffle) is stored normalised (`toNorm`) and projected back (`fromNorm`) when the window is resized; a named arrangement (loose, tidy) is laid out again. When the kind changes the wall goes back to loose.
* To retune the composition edit `WIDE_W` (print widths) and `WIDE_LOOSE` (positions, tilt) in `layout.ts`; to retune a print edit `procreate/data.ts`.

## Content (`procreate/data.ts`)

`PRINTS` (order = tab order and close-up order): `id`, `file` stem in `public/works/procreate/`, intrinsic sizes and the manifest `alt`, a short `title`, the one-line description `line` (shown in the close-up and the index), the paper `stock` (`sketch` torn from a spiral pad, `photo`, `grid` graph paper, `card`), how it is held (`hold`: tape pieces with colour / pattern / angle, a pin, a paper clip) and its handwritten `note`: lettering sits in the strip under the drawing, `mark` is either an arrow (`from` / `to` in picture coordinates, so it lands on a real detail: the sleeve outline, the ribbon, the armchair, the swatch dots) or an underline. `COPY` holds every visible string of the world (including the short phone labels `notesOffShort` / `notesOnShort`). `PORTRAIT_PALETTE` is the manifest palette of the two portraits.

## Files

| File | Role |
|---|---|
| `ProcreateWorld.tsx` | state (geometry, mode, z-order, notes on/off, "touched", close-up), tools, sections, WorldFacts; preloads the five small pictures when the chunk loads |
| `procreate/Print.tsx` | one draggable / keyboard-operable print; motion values x, y, base rotation, sway, lift, scale; `PrintHandle { pose, moveTo, focus }`; `heading` (where a programmed move is going) lets a plain press finish an interrupted trip |
| `procreate/PrintFace.tsx` | what a print looks like (paper, drawing, note, arrow, holders); used by the wall and the close-up at any size |
| `procreate/Holders.tsx`, `Scars.tsx` | tape / pin / clip; the pin hole and tape ghosts left on the wall |
| `procreate/Lightbox.tsx` | the close-up (portal into `.pm-world-body`, focus trap, Esc via `useWorldEscape`, swipe). Its column (`.w-procreate-lb-inner`) is centred when it fits and scrolls from the top when it does not (320 x 568 phones); the paper is sized from the *measured* heights of the caption and the tab row |
| `procreate/aim.ts` | `aimBetween(fx, fy, tx, ty)`: size + turn a `<Scribble kind="arrow">` so its tail and tip land on two given points; used by the prints' notes (PrintFace) and by the wall's own "pick one up" note |
| `procreate/Line.tsx` | the one-line description with "T-shirt" kept in one piece (index + close-up) |
| `procreate/Props.tsx` | ruler, pencil, eraser, loupe icon as SVG |
| `procreate/layout.ts`, `data.ts` | engine (incl. `pickupSpot(plan)`: where the wall's own note stands so its arrow ends just above the first print's torn edge at any wall size), content |
| `procreate/procreate.css` | all styles, classes `w-procreate-*`; palette variables at the top |
| `procreate/kraft.webp`, `cork.webp` | seamless 512 px tiles (displayed at 256 css px), made by `procreate/tools/make_textures.py` (Pillow + numpy, seeded) |

## Motion contract

* Entrance: the prints drop onto the wall in a stagger (spring), the notes and arrows draw on afterwards (`Scribble draw` delays), the title is written on (clip-path). Every motion has a still path: `useWorld().reduced` (OS reduced motion or the visitor's Pause motion) makes placement instant, switches momentum / sway / lift / elastic edges off and shows everything at once. The wipe of the notes is a clip-path transition that base.css shortens under both switches.
* Measured on a build (per-frame trace of one drag): full motion = the print keeps gliding after release and settles; OS reduced motion and "Pause motion" = it stops exactly where the hand let go (no glide, no sway, no lift, no overshoot), entrance settles in under 0.8 s.
* Only transform, opacity and clip-path animate. No ambient loops, no rAF outside framer-motion, nothing runs while idle or off-screen. Listeners, observers and timers are cleaned up on unmount.
* Interrupted entrance: the first-appearance fade is its own animation (`arriving`), so a Shuffle, Tidy up, nudge or press during the first second never leaves a print stuck invisible (regression-tested for all four).
* In development framer-motion prints "You have Reduced Motion enabled on your device" once when the OS asks for reduced motion (it does so for every `motion` component of the site, not only this world; it does not exist in production).

## Accessibility

* Prints are `<button>`s named with the manifest `alt` + "Print n of 5", described by their note and by a visually hidden key hint. The decoration inside is `aria-hidden`.
* Headings: `h2` title, `h3` "What is on the wall" / "Four colours, twice", `h4` per print. The close-up is `role="dialog" aria-modal`, labelled by the print's title, with a polite live caption; the world's own content is `inert` behind it.
* Focus uses the global two-tone ring (the rotated print shows it round its box). Touch: `touch-action: none` only on the prints (and `pan-y` on the close-up's print); the wall and everything else scroll the page, so on phones the prints are narrower than the board and leave a scrolling gutter on one side. Verified with CDP touch events: a swipe on the lede or in the gutter scrolls the page, a touch drag on a print moves it with no page scroll, a tap opens the close-up, a horizontal swipe in the close-up changes print.
* Contrast: ink on bubblegum, kraft, paper; oxblood on paper; cream on ink (close-up, key label); all above 4.5:1. Nothing under 13 px (notes are `max(14.5px, 7.8 % of the print's width)`; the tray tabs are 13 px).
* Index rows: a click handler on the `<li>` is a pointer convenience only; each row has a real `<button>` (the tab) for keyboard and assistive tech.

## Honesty decisions

* Early work, no dates, ages or clients are claimed. The crest and the logo are described as drawings ("A football crest drawing", "A logo idea"); nobody portrayed is named.
* The brief's annotation "first crest" is written "early crest": nothing says it was the first.
* No timeline: the notes hold no dates for these files.
* Procreate: the folder is "Procreate sketchbook" by Pau's own naming and the registry lists the tool; the copy says "my Procreate folder", it does not date or certify anything.
* The group portrait with a third-party logo is not in the repo and is not referenced.

## Verified (production build in an isolated snapshot, plus the dev server)

1440 x 900, 1920 x 1080, 1366 x 768, 1280 x 720, 1200 x 800, 1000 x 760, 768 x 1024, 390 x 844 (dpr 2), 360 / 375 / 414 / 480 widths for the tray, reduced motion, paused motion, deep link and opening from a Works card (shared-element flight), drag with momentum (per-frame traces) and at the wall edge, touch (CDP touch events), keyboard (arrows, Shift+arrows, R, Enter, Space, Esc, Tab trap, focus restore, `[` `]`), index rows (click on picture / words / tab / Enter on tab, each followed by Esc and a focus check), Tidy / Shuffle / notes, early interactions during the entrance, resize across wide / mid / narrow, no console errors or 404s. Production build: world chunk 34 KB (12.0 KB gzip) + 22 KB CSS (5.0 KB gzip) + two textures (35 KB + 10 KB), Gloria Hallelujah latin 18 KB. Page audit (`tools/audit-page.mjs`, 1440 x 900): no overflow, no text under 13 px, no nameless control, no contrast finding, no duplicate ids, every stop of the tab order shows a focus ring, CLS 0.

## Known limits

* Very small phones (320 x 568): the close-up's column scrolls a little for the two tall portraits (the paper never goes below 120 px wide). 360 x 640 and up fit without scrolling.
* LCP of a deep link is dominated by the site's own startup bundle (the cork tile of the board is the world's candidate, about 0.1 s after the chunk); the world adds no blocking work of its own.
* Shuffle may overlap two prints a little (it avoids piles, it does not forbid overlap): that is how a hand-pinned wall looks.
