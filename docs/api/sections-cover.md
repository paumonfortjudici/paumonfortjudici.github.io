# Section 01 Cover: API and behaviour note

Source: `src/components/sections/Cover.tsx`, `cover.css` and `src/components/sections/cover/**`. Read this instead of the source.
Prefix of every class: `cv-` (`.cv` is the root and a size container). Copy: `COVER`, `SHEET_META` in `src/lib/copy.ts`; works from `src/lib/works.ts`.

## 1. What is on the sheet

`<Sheet id="cover" tone="cream" page="Cover" n={1} aria-labelledby="cover-title">`, one `.cv` container inside it. Every size is in `cqw` (1cqw = 1 % of the cover's content width), so the lettering, the title and the deck scale together from 320 to 2560 px.

| Block | What |
|---|---|
| Aperture (`Iris.tsx`) | a nine-blade iris in a lens barrel with a ring of focus ticks, drawn from geometry, ink at 11 % / 4.5 %. Sits behind the word and bleeds off the sheet. Its blades "open" once when the cover arrives. Decorative. |
| Print kit | `.cv__reg` (decorative, wide and tablet; hidden on phones): a handwritten `misregistered on purpose`, a two-ink step wedge (tomato, ultraviolet) and a registration target whose violet plate sits a hair off, on the right of the band above the word. |
| Lettering | the page's only `<h1>`: `Pau Monfort, portfolio` (`.pm-sr`); the drawn word is `aria-hidden`. Two `StrokeWord` plates of PORTFOLIO (PORT / FOLIO stacked below 600 px): tomato ink with a 30 % tint fill, and an ultraviolet outline a few px off register with `mix-blend-mode: multiply` (two riso drums; the second plate starts 260 ms later). The ghost `#2026` is a violet outline (stroke scale .95) on its own line above the word (it never touches the letters, and clears the sheet's `+` crop mark). The iris rings are at 17 % ink. Hover (mouse): the letters hop in a ripple, the violet plate a beat late. |
| Title | `<h2>`: `Brands, books` / `& characters`, two lines at every width (authored break). `characters` is Fraunces italic in ultraviolet with a hand-drawn tomato underline: the only accent word on the page. |
| Note | `pick a folder` (Gochi Hand) with a `Scribble` arrow. It waits for the marker face (`useHandFontReady`), so a system handwriting face never shows. The arrow is diagonal on the wide cover and points straight down on narrow ones. On the wide cover the left column stretches to the height of the right one, so the note ends right above the deck it points at. |
| Name tab | `TabButton` (ultraviolet, lg) `Pau Monfort · Graphic designer` + down arrow, `href="#about"`. The label is two pieces: one line where there is room, name over role (the dot goes) in the narrow middle range and on phones. |
| Quick tabs | `Branding`, `Editorial`, `Illustration` with their folder counts (the counts hide between 860 and 1169 px of cover width and on phones; they are always in the accessible name). Their cursor is `none` (the ring grows but no 'Open' disc sits on the label), same for the name tab: `requestFilter(category)` = event `pm:filter` + scroll to `#works`. While one is hovered (mouse) or keyboard-focused, the folders filed under that kind are pulled out (a clear lift, their cut-outs lean out, the front row's stickers appear) and every other folder washes out (`saturate(.2)`) (`data-hint` on `.cv`, written straight onto the DOM: no state, no re-render). |
| Blurb | `COVER.blurb`. |
| Stamp | round `Stamp`, ring text `OPEN FOR PROJECTS · 2026 ·`, `spin` (class `pm-ambient`: stops when paused or reduced), pressed on a round paper disc (`.cv__stamp::before`, the sheet's own colour) so the O underneath is cut by a clean circle and the ring text is never ink on ink. It lives inside `.cv__side`: on wide and tablet covers it is absolutely placed over the last letter (its top is 0.62 of its own width above the text row); on phones it is a grid cell beside the quick tabs, which then stack one per row. |
| Deck | section 2. |

Layout switch (`useDeckLayout`, measured from the cover's own content width, not the viewport): `wide` >= 860 px (title left; name tab, quick tabs and blurb right; two tiers of folders), `duo` 600 to 859 px (one column; two folder cascades), `solo` < 600 px (one cascade of ten). `data-layout` is on `.cv` and on the deck. The three viewports in the brief: 1440 and 1920 and 1024 are `wide`, 768 is `duo`, 390 is `solo`.

## 2. The deck (`Deck.tsx`, `slots.ts`, CSS in `cover.css`)

`<ul class="cv-deck" role="list" aria-label="Projects: ten folders, one per project">`, one `<li class="cv-slot">` per entry of `WORKS` (Pau's order, so DOM order = tab order = folder number). Each slot holds the cut-out (`img.cv-peek`) and a real link:

```tsx
<Folder as={motion.a} layoutId={folderLayoutId(work.slug, 'cover')} href={workHref(work.slug)} ... onClick={open}>
```
`open` calls `openWork(slug, 'cover')` for a plain left click and lets modified clicks and middle click through (the `href` is a real deep link). Pointer enter and focus call `prefetchWorld(slug)`. `aria-label`: `Open folder 04: Spelled Guilty, Book: 80 word-search whodunits, 2026`; everything visible inside is `aria-hidden` (the label carries it). The cursor label is `Open` (`data-cursor`).

**Geometry is data.** `slots.ts` holds, per folder: `col` / `row` (wide: 5 per tier, back row 0, front row 1), `jx` / `jy` (tenths of a cqw of hand-made wobble, so the tiers are never a ruler-straight grid), `tab` (where the tab sits along the top edge, per layout), `tilt` (how the cut-out leans, and how the folder tilts while it drops in). `fitTab()` caps each wide-layout tab so it ends inside the strip of its folder that the right-hand neighbour does not cover (`WIDE_FW`, `WIDE_M` must stay in step with `--fw`, `--m` in `cover.css`). The CSS positions slots with `calc()` from the custom properties `--col --row --jx --jy --c2 --r2 --i --t --ar --tilt` that `Deck.tsx` writes on every slot.

| Layout | Shape |
|---|---|
| wide | two overlapping tiers of five, tabs staggered across the whole width. Back row: the cut-out already stands up out of its folder. Front row: its cut-out is stuck on the folder on hover and focus (fine pointers only: touch has no hover, and the request is never made). The hovered or focused folder comes forward of its right-hand neighbour, never of the other tier. A typed paper label (primary category) is stuck on each front folder's lower edge; concept folders carry the CONCEPT rubber stamp there instead (pressed on after the folders land). The front row is tall enough for a two-line title, the kind line and the stamp. |
| duo | two cascades of five (the right one 3.6rem lower); each folder's tab pokes into the previous one, so every tab and every title stays visible |
| solo | one cascade of ten (step 7 to 10.5rem, wider when the column is narrow because titles wrap). The template's bug (second folder hidden behind the first) cannot happen: z-order is the folder number. |

**Cut-outs (peeks).** Every peek is a die-cut sticker: the same 2.5px cream halo (`--halo`, four chained drop-shadows), a hard contact shadow and a soft drop shadow, and about the same AREA (`--pk` = sqrt(.78 / aspect), clamped .8 to 1.12, written by `Deck.tsx`; the height is `--ph`). Wide back row: stands out of the folder at rest (`--rest`, 25 % of its height above the tab). On hover or focus it does NOT climb higher (a raised cut-out must never cover the blurb above): the folder lifts, the cut-out leans to its full tilt and swells 5 %. Wide front row: the sticker is stuck on the folder's own empty lower-right corner on hover or focus (it can never reach the back row's titles; its height is capped by its width so a landscape sticker stays clear of the kind line). Cascades: each cut-out stands behind its folder's top edge over the previous folder's right side, about three quarters visible (`top: -3rem`), and the kind line of every cascade face keeps its right 5.4rem free (`padding-right` on `.cv-face__kind`) so text wraps before it reaches a cut-out. `PEEK_SIZE` in `slots.ts` lists the real size of every `public/works/<slug>/peek.webp` that exists (7 of 10). **The three concept folders have no registry peek yet, so the cover carries its own** (`cover/art/peek-concept-brand.webp` = the Sifo mascot of Gotet, `peek-concept-portfolio.webp` = slide 1 of the client portfolio, `peek-illustration.webp` = the clapperboard sticker; cream halo, <= 600 px tall, 35 to 57 KB, bundled by Vite, `LOCAL_PEEK` in `slots.ts`). When the card-art pass delivers real ones: delete the entry from `LOCAL_PEEK` and add its size to `PEEK_SIZE`; nothing else changes (`peekFor()` prefers the registry file). A slug in neither map gets no `<img>`. Images are `alt=""`, `loading="lazy"`, `decoding="async"`, sized by their own width / height. Fetch policy: wide back row when the intro is over; wide front row when the browser is idle or at the first touch of the deck (fine pointers only); cascades: each folder's own cut-out when that folder is within about a screen of the viewport. Nothing is requested before the intro is over: the first screen carries no image.

**Entrance.** The deck waits for `useIntroReady()` (`html[data-intro="done"]`; or 1.5 s after load when an intro runs and never says so; or about 0.2 s when the page has no intro; or at once under reduced or paused motion), then drops in when it is about to enter the screen (or 2.8 s after the intro, for a visitor or a tool that never scrolls): stagger 50 ms, every folder drops from a little above, tilted the way its cut-out leans, with the one overshoot of the page (`--spring-drop`, a sampled spring in `linear()` with a cubic-bezier fallback). The lettering, scribbles and stamp are held at their first frame until the intro is over (`.cv:not([data-ready])`). Hidden states exist only under `html.js`. Measured on the real intro (production build): the bars unmount and the cover starts in the same frame; the whole sequence is under 2.2 s of motion.

**Springs** are step responses of damped springs sampled into `linear()`: lift (zeta .55, 13 % overshoot), peek (.58), drop (.42, the only big one).

## 3. Motion switches

* Reduced motion (OS) and `html[data-motion="paused"]`: everything is in its final state at once (no drop, no draw, no hover travel; the cut-out appears where it would end; the quick-tab preview is the shadow only), the stamp stops (`pm-ambient`), the iris is static. Verified: no running animation or transition inside `#cover` after load.
* No JS timers or rAF loops of its own beyond the entrance safety timers. Observers: `ResizeObserver` (layout, deck width), `IntersectionObserver` (`useInView`), `MutationObserver` (intro attribute); all cleaned up. No work while off-screen.

## 4. Keyboard, touch, screen readers

Tab order: name tab, three quick tabs, then folders 01 to 10. The sheet meta bar's three filter buttons (they duplicate the quick tabs) are taken out of the tab order by an effect in `Cover.tsx` (`tabindex=-1`; the mouse still reaches them). Focus ring = the primitives' two-tone silhouette ring, widened for the deck (9px ink line inside a 17px cream stroke, `cover.css`); a focused folder also lifts, comes forward and raises its cut-out (the same as hover). Enter opens the world (shared-element flight); middle-click and "open in new tab" use the real hash link. Quick-tab preview works on keyboard focus (`:focus-visible` only). Touch: cascades show every cut-out, tap opens. Targets: tabs are 44 px on coarse pointers (primitive), folders are 140 px tall or more. Nothing under 13 px. One `<h1>` (the lettering) and one `<h2>` (the title).

## 5. Files

| File | What |
|---|---|
| `Cover.tsx` | the sheet (default export + `Cover`) |
| `cover.css` | all styles (`cv-*`) |
| `cover/Deck.tsx` | the ten folders |
| `cover/slots.ts` | hand-made geometry, `PEEK_SIZE`, `LOCAL_PEEK`, `peekFor`, `fitTab`, `layoutFor` |
| `cover/hooks.ts` | `useIntroReady`, `useDeckLayout`, `useArmed`, `useElementWidth`, `useHandFontReady`, `useLate` |
| `cover/Iris.tsx` | the aperture |
| `cover/art/*.webp` | the three concept cut-outs (see above) |
| `cover/harness.html` + `harness.tsx` | DEV ONLY: the real Cover inside the real providers with a stand-in for the chrome; `?intro=running\|done\|hold\|none`, `?chrome=<px>`. Use it while other agents' files are in flux. Not part of the build (only `index.html` is an entry). |

## 6. How it was verified

Dev server per port and a static production build (`vite build` into the scratchpad, served by a 30-line static server). `tsc -b` clean. Hit-testing of every folder's tab, number, title, kind and years at 1920, 1440, 1280, 1024, 940, 768, 600, 390 and 320 (none covered; the stamp and label never overlap text at 940 to 2560 and 320 to 860). No horizontal scroll (390: `scrollWidth` 390). Production build: no console messages, no 404, CLS 0 to 0.0005, LCP is the title text (no image above the fold), the ten cut-outs all load (200) once scrolled to. `tools/audit-page.mjs` at 1440, 1920, 768, 390: no blocking findings, one `<h1>`, no low-contrast text found, no small text, no nameless controls. Keyboard: Tab through quick tabs and all ten folders, Enter opens, Escape closes and focus returns to the folder; scroll position is restored. Reduced motion and paused motion: static, no running animation. Real intro: the cover waits for the bars and starts in the same frame they unmount.
