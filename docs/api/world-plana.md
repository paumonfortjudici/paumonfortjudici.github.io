# World 2: Plana Digital, "Brand Atlas" (API and behaviour note)

Source: `src/worlds/PlanaWorld.tsx` + `src/worlds/plana/**`. Slug `plana`, folder colour pine (cream text). Nothing here is exported for other agents: this note
says what the world is made of, how every plate behaves, what is honest copy and what to touch if you change it.

## 1. The idea

One big sheet of Plana's own Paper, printed with a faint graticule, lies inside the pine folder. On it: a title page ("Brand atlas."), a contents list and
seven numbered plates of different sizes (not identical cards). Each plate has a drafted frame in the brand's own finish (a thick Night outline and a solid,
hard Night shadow: the manual says "never gradients, never blurred shadows") and its own small interaction. The sheet is a CSS grid of 12 columns at
>= 1180 px (hero 8 + title block 4, then 4 + 8, 7 + 5, 5 + 7) and one column below that (title, hero, contents, plates 2 to 7). The world ends on pine again:
the facts slate (`WorldFacts`, fixer round 1: seven of twelve columns, Role in two columns, the year as a big Poppy display number; the ticket stub to planadigital.cat is large, beside it; the sample-mockups note runs under both at 18 to 24 px), and a holm-oak horizon (`Horizon`) with a big poppy sun that rises as you scroll and the manual's own closing line, "See you in la Plana."

Plana's palette lives as local variables on `.w-plana` (and `.w-plana-viewer`, which is portalled out of the world root, so it carries a copy):
`--paper #F7F2E8  --holm #1E4634  --poppy #E5502F  --wheat #F2CF6B  --night #18181B` plus `--field #2E6A4F --sunrise #EC8F4D --dot-off #D8D0BF --paper-2 --paper-3 --night-2`.
Faces: Sora 800 (400 for "digital"), Figtree, DM Mono (the shell loads them with the chunk through `loadWorldFonts('plana')`); the marker hand font (Gochi Hand,
`loadHandFonts()`) is only for the three margin notes ("pull the sun", "hover to fan them out", "no corporate blue. on purpose.") and the closing line.

## 2. Files

| File | What |
|---|---|
| `PlanaWorld.tsx` | the composition: sheet, grid, plates, `WorldFacts`, closing horizon |
| `plana/plana.css` | palette, sheet, grid, plate chrome (number, title, rule, hint, caption), title page, contents, foot, closing horizon |
| `plana/data.ts` | all content: days, plates, lockups, swatches (+ `contrast()`), mockups, the 17 manual pages, tour stops; `plana(path)` = `asset('/works/plana/' + path)` |
| `plana/Plate.tsx` | numbered header + children + printed caption, `<section id="plana-plate-<id>" aria-labelledby tabIndex=-1>` |
| `plana/Intro.tsx` | `IntroTitle` (the world's `<h2>` "Brand atlas.") and `Contents` (buttons that scroll the world's own scroller to a plate and focus it; never a `#hash`) |
| `plana/PlanaSymbol.tsx`, `Sunrise.tsx`, `sunrise.css` | plate 1 |
| `plana/Lockups.tsx`, `SealFigure.tsx`, `lockups.css` | plate 2 |
| `plana/Colour.tsx`, `colour.css` | plate 3 |
| `plana/TypeTester.tsx`, `type.css` | plate 4 |
| `plana/Mockups.tsx`, `mockups.css` | plate 5 |
| `plana/Manual.tsx`, `ManualViewer.tsx`, `manual.css` | plate 6 and its lightbox |
| `plana/Website.tsx`, `website.css` | plate 7 |
| `plana/Horizon.tsx` | the closing ground: a holm-oak field with a poppy half sun that RISES with the scroll (one css variable `--rise`, 0 to 1, written to the element from the world scroller; no React state) and stays risen; reduced / paused motion and no script: risen. The manual's closing line is written across the sun (Night on Poppy) once it has cleared the horizon |
| `plana/notify.ts` | `notify(message, { swatch, label })`: thin wrapper over the site toast (`src/components/chrome/toast.ts`, drawn by `ToastLayer` above every world) |
| `plana/roving.ts` | arrow / Home / End handler for a tablist or radiogroup (roving tabindex) |

Bundle (production build): `PlanaWorld` chunk 54.8 KB raw JS = 17.2 KB gzip, plus 45.4 KB raw CSS = 9.0 KB gzip (budget 120 KB), and the Sora, Figtree and DM Mono faces (latin subsets 34 + 20 + 15 KB).
framer-motion is used only for the rail's drag; no other library.

## 3. Plates and behaviour

1. **Sunrise** (hero, dominant). The inline symbol (`PlanaSymbol`, same geometry and ids as `logo/plana-digital-symbol-animatable.svg`: `pd-sun`, `pd-horizon-field`,
   `pd-horizon-stripe`, `pd-dot-1..3`, `pd-frame`, `pd-bar`, `pd-cursor`; ids only when `ids` is set, one instance per page) rises over the holm-oak horizon on load, then the
   hours count 0 to 72 by themselves (about 4 s), the cursor "clicks" and the round "Websites ready in 72 hours" sticker thumps on. Any touch of a control ends the intro at once.
   A range input (0 to 72 h, step 1; arrows, Home, End, PageUp / PageDown natively) drives the sun (`sunOffset(h)`: 16.7 -> 7.6 -> 0 units below the horizon at 0 / 24 / 48 h, as in the manual's
   three windows) and the lit dots (`dotsOf`: one per day, Wheat / Sunrise orange / Poppy). The three captions (Day 1 0 h "You tell us about your business", Day 2 24 h "We design and
   code", Day 3 48 to 72 h "Your website, online") share one grid cell, so the plate never changes height while you drag; a visually hidden live region (polite once the intro is over)
   announces the change of day. The manual's three windows (page 3) are buttons that jump to a day, drawn as little printed cards with a Night tab along the foot (hard shadow; the chosen one sits in the page with a Poppy tab, about 110 px at 1440). The sky copy is LAST in the DOM (the plate is a grid and places it over the sky), so the tab order is the slider first, then the day windows. On a plate of 640 to 859 px the paragraph steps aside (the deck caption tells the same story) so nothing runs under the windows. They stand in the sky on a wide plate and in the deck on a phone (two copies, one displayed).
   The story ("A sunrise inside the browser.") is over the sky on a wide plate and under the slider on a phone, so the symbol and the slider share the first screen of a phone.
   `useWorld().reduced` (OS reduced motion or the visitor's "Pause motion"): no rise, no count, the symbol stands at day 3 (72 h) with the sticker on.
2. **Lockups**. A tablist (roving tabindex; arrows / Home / End) switches between Horizontal, Vertical, Symbol, Seal and Reversed. Each is the real SVG on the ground the manual approves
   for it (paper, wheat, holm oak, poppy, night); the new ground wipes in as a circle rising from the bottom edge (clip-path only). "Show clear space" overlays the manual's clear
   space (x = the height of the letter a) on the horizontal form; a bracket draws the 120 px minimum at its real size. The seal is swapped for its inline SVG the first time its tab is
   chosen (`SealFigure`, sanitised first-party file, falls back to the `<img>`): the ring of lettering turns slowly (70 s, class `pm-ambient`, only while that tab is on show AND on screen),
   the symbol in the middle stands still.
3. **Colour**. A proportion bar sized by the manual's own shares (Paper 55, Holm oak 18, Wheat 12, Poppy 10, Night 5) and five loose paint chips (a punched hole and a tilt each). A click copies the hex
   (clipboard API with a textarea fallback) and fires the site toast with a colour chip; the chosen colour then shows its "Aa" on each of the other four with the real WCAG 2 ratio and what it
   allows (any size / large type only / avoid). The Night segment is typeset upright; narrower plates also turn Wheat and Poppy; on a phone the fifth chip lies down.
4. **Type**. A live type tester: one `<input>` (max 40 characters), the text rendered in Sora ExtraBold (size range 28 px up to 12.5 % of the specimen's width, so a long word always fits),
   Figtree (a four-step weight radiogroup, 400 to 700) and DM Mono Medium capitals, each row naming its role from the manual (voice / reader / programmer) and its size. Rows have fixed heights, so
   typing never shifts the page.
5. **Mockups**. A draggable rail (framer-motion drag with momentum, `dragConstraints`, spring-to-slot on release; no momentum under still motion) of six prints: apparel, signage, social, stationery, van,
   website. Prev / Next tabs, focus the rail and use the left / right arrows, Home and End (quick presses add up); a polite live region announces "Mockup 3 of 6: Social". Every print wears a
   "Sample mockup" tag; the captions say what is made up (opening hours, follower numbers, the bakery, phone and e-mail).
6. **Manual**. 17 pages (1600 x 1000 WebP) stand at rest in a low fan (the cover on top, the other leaves peeking out on both sides, scaled up to fill the plate; `--cr` per leaf) behind a holm-oak horizon; hover (mouse), keyboard focus or the "Fan it out" tab fans them like a sunrise (58 degree arc, so the cover is not cropped by the plate); the page under the
   pointer (or focused, or chosen with the arrows or the two arrow tabs) lifts out of the fan. Arrow keys move through the leaves (roving tabindex); Enter / click on a leaf while open (or "Read page N")
   opens the viewer: a lightbox portalled into the shell's folder body (below the tab strip) with real Close / Previous / Next tabs, a thumbnail row, arrow keys, Home / End, a focus trap, `inert`
   on the world behind, Escape through `useWorldEscape` (closes the viewer, not the world) and focus restored to the leaf. The shell's `[` and `]` keys are not intercepted. Pages 11 to 17 are flagged
   "sample mockup" in their captions. Only 4 pages load before the fan has ever opened. On touch the first tap fans the pile out, the second tap opens a page.
7. **Website**. (A scene change in the process section is a clip-path WIPE over the previous capture, never a cross-fade, so no two captures are ever half visible at once; the hour-chip row is always laid out so the plate never changes height.) A browser window in the brand's own finish that tours captures of the live planadigital.cat (desktop captures >= 760 px wide, the 390 px mobile captures below): hero, services, the 0 h to
   72 h scroll story (six scenes of a sample bakery site) and the closing footer. It glides by itself only while the plate is on screen, the tab is visible and motion is allowed; "Pause tour" / "Play tour",
   four stop tabs (roving tabindex) and six hour chips are the manual controls. Reduced or paused motion: it starts on the hero and nothing moves unless you choose a stop. Pricing, team and contact
   sections are cropped out on purpose. The ticket stub to planadigital.cat is `WorldFacts` (from the `works.ts` links).

## 4. Honesty

- "Plana Digital is my new web studio in Cardedeu. I designed the identity, the brand manual, the logo and the website layout" (Pau's statement). Nothing about the studio's size, clients, prices or the strategy report.
- Everything with placeholder contacts or sample numbers (planadigital.com, hola@, 600 000 000, "Nom Cognom", Fleca Rosella, Instagram counts, opening hours) is tagged "Sample mockup" and captioned as made up.
- The identity shown is v2.0 "plana digital" only; the v1.0 board is not used.
- English captions are mine; the text inside the images is Spanish or Catalan and says so.
- No price is printed anywhere. The captures of the real site show a strip of four commitments in Catalan (including "Manteniment 3 mesos inclòs"); that is the live site's own text, not a figure.

## 5. Gotchas

- The viewer is portalled to `scrollRef.current.parentElement` so it covers the world but not the tab strip; it carries the palette variables itself.
- Do not render `<PlanaSymbol ids />` twice (duplicate ids); the six little day windows and the lockups use `decorative` symbols without ids.
- The hero frame (`.w-plana-p1`) is wheat on purpose: the story text is a direct child of it (it sits over the sky or under the deck depending on the plate's width) and automated contrast checks read the frame's colour.
- Hover-only things have equivalents: the fan opens with focus, taps and "Fan it out"; the rail has buttons and arrows; the tour has Play / Pause and stop tabs; the slider is a native range.
- No raw `<style>` tags; classes are `w-plana-*`; only transform, opacity and clip-path animate (the chips' solid shadow snaps on instead of transitioning).
- `WorldFacts` clapper stick lies open (9 degrees) until it scrolls into view: `.w-plana-foot` keeps a margin above it so it never touches the sheet.
- Needs from other files: nothing. `works.ts` lists no tools for Plana, so the slate shows Role and Year only.

Final round: the plate 3 "Aa" specimens are large type, so a pairing under 3:1 (the ones marked "Avoid") draws its letters nudged toward black or white (`legible()` in `Colour.tsx`, inline colour) until they reach 3.1:1; the printed ratio and verdict are still the real palette values.

## 6. Verified (re-run with `node tools/shot.mjs`, `node tools/audit-page.mjs`, `npx tsc -b`)

1440 x 900, 1920 x 1080, 1200 x 800, 768 x 1024, 390 x 844 (touch emulation, dpr 2); reduced motion and paused motion; deep link `#/work/plana` and opening from the works section; Esc and `[` `]`
inside the world; every plate used by mouse, keyboard and touch (slider keys, day windows, lockup tabs with arrows, chip click + toast, type field and size and weight, rail drag / swipe / arrows / buttons,
fan hover / focus / tap, viewer paging, focus trap and Escape, tour play / pause / stops / hour chips); no console warnings or errors and no failed requests on the dev server; no horizontal scroll at any width;
CLS 0 at all three sizes (images carry width and height); images below the fold are lazy (4 requests before scrolling at desktop, 1 on a phone); tour, seal ring and intro idle off-screen and when the tab is hidden;
text 13 px or larger; contrast checked (the only Poppy-on-Paper text is 24 px or larger, small text on Poppy is Night, the sky's full stop is Night because Poppy on Wheat is 2.5:1).

Mop-up round: the foot is the slate (7 columns) with the sample-mockups note under it, and the ticket takes the right 5 columns across both rows (set big); the year is a display number at every width; the mockup rail's cards are all as tall as the tallest (no poppy left under a short one); the Website plate centres its content when the Manual next to it is taller; the hero's sky headline is smaller than the title block's "Brand atlas." and the paragraph is one sentence; the day caption fades in 0.16 s (none under still or paused motion). The slate's Tools cell stays hidden because `work.tools` is empty for Plana in `src/lib/works.ts` (no evidence in the notes).
