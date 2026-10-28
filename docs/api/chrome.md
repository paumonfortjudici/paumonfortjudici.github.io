# Chrome: the frame around every sheet (API note)

The desk, the mast, the index tabs, the footer, the intro, the toast and the cursor. Source: `src/components/chrome/**` (+ the mount points in `src/App.tsx`).
Nothing here needs configuring: `App` mounts it. This note is about what other agents can use and what they can rely on.

```
#app-root (inert while a world is open)        next to it, OUTSIDE #app-root (never inert, above the world)
  .pm-skip   skip link (App)                      <ToastLayer/>   z 90   luggage tag, role=status
  <Desk/>    .pm-desk, fixed, z -1                <div.pm-grain/> z 85   (foundation)
  <Mast/>    <header class=pm-mast>               <Intro/>        z 95   colour bars, once per session
  <PillNav/> <nav class=pm-nav>, sticky, z 40     <CustomCursor/> z 100  dot + ring + label disc
  <main id=main> the six sheets
  <Footer/>  <footer class=pm-foot>
```
z layers (tokens.css): nav 40 < world 80 < grain 85 < toast 90 < intro 95 < cursor 100 < skip link 110. The nav, mast, desk and footer sit **below** an open world; the cursor and the toast sit **above** it (they are the pointer and a notification: a world's `data-cursor="Close"` must show).

## 1. File map

| File | What it is |
|---|---|
| `Desk.tsx` | the page background (layers below) + the side instruments on wide screens |
| `Mast.tsx` | hanging folder tab with `PAU MONFORT`, a brace, the two notes (the stamp is switched off: section 8) |
| `PillNav.tsx` | the **index tabs** (file name kept so App did not change): sticky rail with six dividers, a "PM" tab that appears when the nav is pinned, a footage counter, the Pause tab |
| `MotionToggle.tsx` | `Pause motion` tab (reel glyph). Exports `MotionToggle` (default), `ReelGlyph` |
| `KeyHints.tsx` | `Esc closes a folder / [ ] hop / arrows turn pages` as keycaps (hidden on touch) |
| `Footer.tsx` | the last frame of the film: perforations, wordmark, end titles in three columns, clocks, a marker note, controls |
| `Intro.tsx`, `introState.ts` | the colour bars + clapper slate intro and its switchboard |
| `ToastLayer.tsx`, `toast.ts` | the luggage tag and the global store. **`Toast.tsx` does not exist on purpose**: on Windows `./Toast` would resolve to `toast.ts` |
| `CustomCursor.tsx` | dot + ring + label disc |
| `sectionState.ts` | one IntersectionObserver + one rAF-throttled scroll read: active section, ruler position, tape offset, focus hand-off |
| `marks.tsx` | the hand-cut asterisk used by the mast and the PM tab |
| `strings.ts` | strings only the chrome uses (credits, key hints, motion-off sentence, the footer note). The shell's shared strings stay in `src/lib/copy.ts` |
| `chrome.css` | all styles (`pm-desk*`, `pm-mast*`, `pm-nav*`, `pm-mt*`, `pm-foot*`, `pm-keys`, `pm-intro*`, `pm-toast*`, `pm-cursor*`) |
| `dev/index.html` + `dev/harness.tsx` | dev-only stand-in page (the chrome around six fake sheets). Not shipped; see section 9 |

## 2. Toast: `toast(message, options?)`

```ts
import { toast } from '../chrome/toast'          // from a section:  '../../chrome/toast'
toast('Email copied — talk soon!')
toast('Copied #E5502F', { swatch: '#E5502F', label: 'Colour', tone: 'butter' })   // Plana / Space Monkey colour copy
```
`options`: `duration` ms (default 2600), `tone` (any `ToneName`, default `'butter'`; ink or cream text is picked for contrast), `swatch` (a CSS colour shown as a chip on the tag), `label` (a small typed line above the message). One tag at a time: a new toast replaces the one on screen and restarts the timer. Also exported: `dismissToast()`, `getToast()`, `subscribeToast()`. `toast.ts` has no React in it. The wrapper is a persistent `role="status" aria-live="polite"` region (so the text is announced), z 90, outside `#app-root`. Long messages wrap inside the tag (it never leaves the screen); the message is set in the marker face (loaded on demand).

## 3. The intro and the Cover's cue

* `html[data-intro]` is `running` while the bars play and `done` from then on (set when `introState.ts` is first imported, so it is right before the Cover mounts). `window` event **`pm-intro-done`** fires exactly once, at the moment the bars have wiped away (about 1.13 s after the intro mounts; at once when skipped or bypassed). The Cover waits for either (with its own fallback timer) and then drops its folders: the whole sequence stays under 2.2 s.
* Timeline (`INTRO` in `introState.ts`): seven colour bars (the folder palette; the lower strip is the castellation) hold 380 ms with a **slate** on them (name, "Portfolio 2026" and a 24 fps timecode that counts); the slate's **clapper stick** is raised at the start and snaps shut at about 0.25 s (the slate jumps a hair), then the bars wipe away downward with `clip-path` (62 ms apart, 380 ms each); the Mast starts to draw the name at 600 ms (`nameDelay`), the brace, asterisk and notes follow it.
* Plays **once per session** (`sessionStorage['pm-intro-seen']`, try/catch). Never plays for: a deep link `#/work/...`, `prefers-reduced-motion`, `html[data-motion="paused"]`, `?intro=0`, a visitor who already saw it, **and automated browsers (`navigator.webdriver`) unless the URL has `?intro=1`** (which also ignores the "seen" flag, but never overrides reduced / paused motion). Use `?intro=1` to look at it in screenshots.
* Skippable by any key, pointer, tap or wheel. It is `aria-hidden`, takes no focus, traps nothing and removes itself from the DOM when done. It is painted on top of an already rendered page (it never delays LCP).

## 4. Section state: what the page exposes

`sectionState.ts` writes, on `<html>`:

| | |
|---|---|
| `data-section` | `cover` / `catalog` / `about` / `works` / `process` / `contact`: the sheet that crosses a band at the middle of the viewport (extremes forced from the scroll read: top = cover, bottom = contact) |
| `--sec`, `--sec-ink` | the accent of that sheet and the ink that sits on it. Read from the sheet's own `--accent` / `--accent-ink` (so a Sheet with a custom `accent` is followed); `chrome.css` has the default map as a fallback (cover tomato, catalog marigold, about oxblood with cream ink, works lagoon, process bubblegum, contact pine with cream ink) |
| `--sec-lit` | the same accent as it must be drawn **on the dark desk** (strokes, the PM tab rim, the scroll bar thumb): the accent itself when it has 4.5:1 against the desk, cream-2 for oxblood and pine |
| `--nav-h` | the nav's measured height (70 px, 58 px on phones): `scroll-padding-top` already uses it, and `.pm-sheet` adds its own 12 px, so every anchor lands at 82 px / 70 px |

Hooks and functions (all from `./sectionState`):
`useActiveIndex()` (0..5, re-renders only when it changes) · `subscribeScroll(cb)` (per-frame callback for things that only move a DOM node: **never set React state in it**; `cb({ y, max, progress, p, docHeight, index })`) · `lockToSection(id)` (call before a programmatic scroll to a section: the active tab stays on the target instead of hopping through the sheets in between; released on `scrollend`, 1.6 s, or any wheel / touch / key) · `focusSection(id)` (after a link has scrolled to a sheet, the keyboard's place moves there like a native `#fragment` link does: the sheet takes focus without scrolling, no ring) · `scrollToTop()` (back to the very top, `#cover` in the address bar, no history entry; smooth unless motion is off; focuses the cover) · `readAccents()`.

Also on `<html>`: `data-hidden` while the tab is hidden: `html[data-hidden] .pm-ambient { animation-play-state: paused }`, so **every** ambient loop on the site stands still in a background tab (chrome.css). While a world is open the loops of the page behind it are paused too. The page's own scroll bar takes its thumb colour from `--sec-lit` (it says where you are).

## 5. Cursor labels

`data-cursor="Open" | "Flip" | "Drag" | "Play" | "Visit" | "Copy" | "Close"` on any element: a solid disc with that word replaces the dot and ring (ink with a cream rim). `data-cursor-color="var(--tomato)"` (any CSS colour) tints the disc; the word is ink or cream, whichever contrasts. `data-cursor="none"` = no label. Over any `a[href]`, `button`, `summary`, `label[for]`, `[role=button|tab|link|menuitem|switch]`, range / checkbox / radio inputs the ring grows even without a label. The **native cursor stays** over text fields, textareas, selects, `contenteditable`, `data-cursor="native"` (and its descendants), and whenever text is selected.
Fine pointers only (`(hover: hover) and (pointer: fine)`); nothing is rendered on touch. Under reduced or paused motion the ring is gone and the dot is exact. The primitives set the labels already (`TabButton cursor="Flip"`: use the `cursor` prop, because `TabButton` overwrites a raw `data-cursor`).

## 6. What each piece does

**Desk.** Layers: plum desk colour, cutting-mat grid (a fine line at 4 % and an inch line every fifth at 8 %; it slides at a fifth of the scroll speed: depth), four light leaks (tomato, marigold, tomato, one small ultraviolet; plain-alpha radial gradients, 49 to 73 s drifts), a projector-beam cone from the top-right corner (conic gradient, swaying 5 degrees over 47 s) with eighteen specks of dust drifting in it (22 to 40 s each; they sit near the apex, which is the part of the cone that shows beside the mast). All loops carry `pm-ambient`. **No `mix-blend-mode`, mask, filter or vignette on the desk**: a blend or a mask forces an offscreen pass on every scrolled frame, and over a near-black desk a plain warm alpha looks the same as `screen`. The static grain is the global `.pm-grain` (not duplicated). At viewport >= 1500 px the margins beside the sheets carry two working instruments, sized from the real margin (a hidden probe as wide as the sheets): **right**, a ruler of six inches (one inch per sheet; section names written along it when the margin is >= 28 px (ticks only below that); a highlighter swipe on the active inch; a paper clip that sits at `3.4` when you are 40 % through sheet 4); **left**, a cloth measuring tape the length of the page in centimetres (96 dpi) that runs past as you scroll, red index line at mid-window, two washi strips holding it.
**Mast.** `<header class="pm-mast">`: a full-bleed strip in the sheet accent and a hanging tab (concave fillet where it meets the strip, rounded at the bottom right) with the name in outline lettering (`StrokeWord`, ink = `--sec-ink`), an eight-spoke asterisk, a hand-drawn brace and the two notes in Fraunces italic. The notes are sized to the column they stand in (`cqw`: the longer note fills about nine tenths of it at any window width, so it can never overflow); where the column is >= 600 px a note breaks only after its comma. No focusable elements. The name draws after `nameDelay` (0 without an intro). Phone: stacked name + first note only. The rubber stamp ("Open for projects") exists but is **off** (`CHROME.stamp.show = false`): the Cover has its own round stamp with the same words, and two of them on the first screen is one ornament too many.
**Index tabs.** Six cards standing behind a cream rail (the hidden 14 px means pulling one up is only a `translateY`, no seam). The active tab is raised 8 px with a spring that overshoots once (about 9 %, settles in 0.46 s), takes its sheet's accent (`aria-current="true"`), and each inactive tab keeps a small coloured top edge in its sheet's accent. Rail: the counter `03 /06` (label font, **a footage counter**: the number rolls up into place when the sheet changes, the total stays) and a seam of stitches (pencil line, tomato thread sewn as you scroll). At the left end stands a **"PM" tab** (a link: back to the top; it spells `Pau Monfort` where the nav is >= 1100 px wide): it waits behind the rail while the mast is on screen and stands up when the nav is pinned (`data-stuck="true"`), so the name stays with you after the mast has scrolled away; hidden on phones and when the nav is narrower than 900 px; its rim is the accent on the desk (visible for oxblood and pine). The Pause tab stands on the right end (it keeps its words only where the nav is wider than 1040 px, a glyph otherwise). Real links (`#catalog`), smooth scroll through `scrollToSection` (no history entries) and the focus moves to the sheet (`focusSection`). Pinned = opaque band (no blur). Phone: one snap row (44 px tabs) that centres the active tab; the Pause tab collapses to its reel. On touch the two small tabs get a 44 px hit area (12 px extend into the rail, which takes no pointer events).
**MotionToggle.** `<button aria-pressed>`; the name stays **Pause motion** (a toggle never renames itself: ARIA APG), `aria-pressed` says whether motion is paused, the reel turns while it plays and shows pause bars when paused. Calls `toggleMotionPaused()` (persists, syncs tabs). With the OS asking for reduced motion it is `disabled`, pressed, and says **Motion is off in your system settings** in plain text (two lines in the rail where it fits, always in the footer, readable by screen readers everywhere).
**Footer.** Two cream perforation bands (the holes cut out so the desk shows) around an ink frame: `(c) 2026 Pau Monfort Judici`, **live clocks** (`Europe/Madrid` and `Australia/Sydney`, lamp lit 07:00 to 18:59, tabular figures, not a live region, refreshed every 20 s), the name as giant outline lettering with a tomato riso offset, the **end titles in three columns** (role above name, each under a thin cut line; two columns below 1040 px, one on phones; they roll up into place once, when the footer arrives), then a row with the `KeyHints` on the left and, on the right, a handwritten note ("that's a wrap!", marker face, underlined by a `Scribble`) above the Pause tab and `Back to cover` (a tab; `scrollToTop()`).
**Toast / Cursor / Intro:** sections 2, 5, 3.

## 7. Motion and accessibility

Reduced motion and "Pause motion" (`pm-ambient` + base.css): leaks, beam, dust, reel and the mat parallax stop, the name and brace are fully drawn, the intro is not rendered, the nav raise is instant (the raised state still shows), the cursor ring is gone. Keyboard: skip link, then (once the nav is pinned) the PM tab, the six tabs, the Pause tab, then the page (the Mast has no tab stops); after a tab is activated the next Tab goes into that sheet; focus ring is the global two-tone ring; `scroll-padding-top` keeps focused things under the nav. Targets are 44 px on touch (tabs 44, Pause 48 x 44 on phones, the little tabs on the rail 44 through their hit area). Nothing is read under 13 px; every text pair uses the tone table (ink on tomato / marigold / bubblegum / lagoon / cream, cream on oxblood / pine / ink). No arrow glyph is ever typed (the SVG icons draw them). Windows high contrast (`forced-colors`): the desk is dropped, tabs and keys get a drawn edge, the current tab a heavier edge and an underline. Print: no desk, nav, intro, toast, cursor, controls or key hints; the mast, the sheets and the end titles stay.

## 8. Decisions worth knowing

* `Toast.tsx` is called `ToastLayer.tsx` (see the file map).
* The intro is skipped for `navigator.webdriver` (automation) unless `?intro=1`: it protects other agents' screenshots from catching the bars, and real visitors are unaffected. **For the final QA run set `SKIP_FOR_AUTOMATION = false` in `introState.ts`**, so a reviewer's automated browser sees the intro like a visitor (once per browser session, never for deep links, reduced or paused motion).
* The Mast's stamp is off (section 6, Mast). To bring it back set `CHROME.stamp.show = true` in `strings.ts`; it then shows when the notes column has >= 690 px.
* The page is observed once: `sectionState` owns the IntersectionObserver band (-45 % / -50 %) and the single passive scroll listener; do not add more window scroll handlers for section tracking, subscribe to it.
* The desk was measured against the rest of the page (headless Chrome, 1440 x 900, instant 28 px scroll steps): with or without the whole desk, the cursor and the grain, the median frame is the same (about 21 ms in that setup: the sheets are what cost).

## 9. Verification

`dev/index.html` mounts the real chrome around six fake sheets with the real ids, tones and accents (useful to look at the chrome alone). Because many agents edit the same tree and every dev server reloads when anyone saves, anything timing-sensitive (smooth scroll, intro frames, focus order) is best tested on a static build: `npx vite build --outDir <scratch>/dist --emptyOutDir`, then serve that folder (a 30-line static server) and use `?intro=1` to play the intro. Checked at 1440 x 900, 1920 x 1080, 768 x 1024 and 390 x 844 (also 320 x 640, 2560 x 1440, with reduced motion, with "Pause motion", with forced colours and with WCAG text-spacing overrides): the six anchors land at 82 px under the nav, `aria-current` and the counter follow, tab order, motion toggle persistence, intro once / skip by key / skip by click / deep link / reduced / paused, world open (nav and mast under it, cursor and toast over it, `]` `[` Esc work), the toast over a world, no console warnings or errors, `tools/audit-page.mjs` with no blocking findings at 1440 / 768 / 390.
