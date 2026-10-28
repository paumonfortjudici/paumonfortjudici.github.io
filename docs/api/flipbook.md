# FlipBook: the in-house page-turning book

`src/components/flip/` · CSS 3D + framer-motion's spring generator · no third-party flipbook package · used by the **Contract** world (230-page magazine, 30 shipped pages) and the **Spelled Guilty** world (6 x 9 in paperback, 16 shipped pages + both covers).

Dev demo (not shipped; it loads the site's own tokens, fonts, `base.css` and `primitives.css`, so the book is seen in the real CSS stack): `npx vite --port <port> --strictPort --host 127.0.0.1` then `/flip.html` (`?only=mag|book|narrow`, `&bare=1&h=66` for tight screenshots, `&still=1`, `&curl=flat`, `&hard=1`, `&strips=N`, `&gloss=0..1`).

```tsx
import { useRef } from 'react'
import { FlipBook, type FlipBookHandle, type FlipPage } from '@/components/flip'

const pages: FlipPage[] = manifest.pages.map((p) => ({
  id: `p-${String(p.n).padStart(3, '0')}`,
  src: asset(`/works/contract/${p.file}`),
  alt: `Magazine page ${p.n}. ${p.note}`,
  width: p.w, height: p.h,
  kind: p.n === 1 ? 'cover' : p.n === 230 ? 'back' : 'page',
  n: p.n,                                   // printed page number (live region: "Pages 4 and 5 of 230")
  overlay: p.n === 4 ? <CreditCircle /> : undefined,
}))

const book = useRef<FlipBookHandle>(null)
<FlipBook
  ref={book}
  pages={pages}
  totalPages={230}
  aspect={1000 / 1331}
  gloss={0.55}                 // glossy magazine; use 0.15 for a paperback
  keys="window"                // arrow keys work as soon as the world is open
  aria-label="Proyecto Contract, Hotel Design 18"
  onSpreadChange={(info) => setCaption(info.text)}
/>
<button onClick={() => book.current?.goToPage('p-004')}>Find my name</button>
```

## Pages, leaves and spreads

`pages` is the reading order of **single pages**. After the cover they are paired (even, odd): `[cover] [2,3] [4,5] ... [220,221] [back]`. The cover (`kind: 'cover'`, first) and the back cover (`kind: 'back'`, last) are single leaves that sit centred while the book is closed. The pairing never re-pairs a selection: the manifest's `spreads` list is exactly what you get.

Internally the faces are padded to an even length (a blank endpaper goes before the back cover if needed; a book with no back cover and an odd count just stops on its last real page) and grouped in **leaves** (front = face 2k, back = face 2k + 1). Spread `i` shows the back of leaf `i - 1` on the left and the front of leaf `i` on the right. Contract: 30 pages = 15 leaves = **16 spreads** (0 = closed front, 15 = closed back). Spelled Guilty: cover + 16 pages + back = 18 faces = 9 leaves = **10 spreads**.

Every position the API talks about is a **spread index** (`page`, `defaultPage`, `onPageChange`, `goTo`, `spread`, `count`), in both modes.

## Props

| prop | type | default | notes |
|---|---|---|---|
| `pages` | `FlipPage[]` | required | `{id, src, srcSet?, sizes?, alt, width, height, kind?: 'cover'｜'page'｜'back', n?, overlay?}` |
| `page` / `defaultPage` / `onPageChange(spread)` | `number` | uncontrolled, 0 | controlled or uncontrolled. A change the parent refuses turns back. `onPageChange` fires when the spread index changes (also while a drag is released) |
| `onSpreadChange(info)` | `(FlipSpreadInfo) => void` | | `{index, count, left, right, pages, text}`; also fires once on mount and per page in single mode. Use it for captions |
| `aspect` | `number` | first inner page `w/h` | page width / height. Cover and back cover (0.3 % different) are stretched to fit |
| `className` | `string` | | on the root `.pm-flip` |
| `labels` | `Partial<FlipLabels>` | English | `label, prev, next, scrubber, cover, back, pages(l, r, total), page(n, total)` |
| `aria-label` | `string` | `labels.label` | the book's accessible name |
| `mode` | `'auto'｜'spread'｜'single'` | `'auto'` | auto = single page below **720 px of container width**; resizing across it keeps the spread |
| `hardCover` | `boolean` | `false` | first and last leaf are boards 2.8 % larger than the paper, with a rim |
| `reducedMotion` | `boolean` | | force the dissolve. Also honoured: `prefers-reduced-motion`, `html[data-motion="paused"]` |
| `curl` | `'strips'｜'flat'` | `'strips'` | the bend, or the rigid `rotateY` leaf (variant b) |
| `strips` | `8..32` | 22 (16 in single mode) | strips per turning leaf. A governor lowers it for the visit if a turn runs under ~45 fps |
| `gloss` | `0..1` | `0.3` | sheen along the bend |
| `keys` | `'focus'｜'window'` | `'focus'` | `'window'` also handles arrows / Home / End anywhere on the page (ignored while typing, sliding or on selects) |
| `controls` | `boolean` | `true` | built-in tabs and scrubber |
| `totalPages` | `number` | `pages.length` | the "of 230" in the live region |
| `tilt` | `number` (deg) | `0` | camera `rotateX` |

## Imperative handle (`ref`)

`next()`, `prev()`, `goTo(spread)`, `goToPage(id)`, `spreadOf(id)` (-1 if unknown), `hint()` (one-shot: the corner of the next page lifts and settles, an invitation; no-op in reduced motion), `spread`, `count`, `mode`, `still`, `element`, plus `scrub(progress, 'next'｜'prev')` / `release(to?)` to hold the turning leaf at a progress like a hand (also how the tests freeze a mid-turn frame; handy for scroll-linked turns).

`goTo` / `goToPage` over more than one spread play **one** leaf: the page on the right turns and its back already shows the destination's left page, the destination's right page is revealed under it (no riffle through the pages in between, and only the destination spread's images are fetched).

## Interaction

- **Drag** a page from its outer 20 % (mouse) or **swipe** anywhere on the page (touch, pen). The grabbed point follows the pointer, the sheet bends, on release distance + velocity decide, then a spring settles. Click or tap the outer 20 % to turn. Hover shows the corner lifting (mouse only).
- **Touch**: `touch-action: pan-y` on the book, a drag only starts for a horizontal gesture, vertical scrolling keeps working.
- **Keyboard**: the book is focusable (`role="group"`, `aria-roledescription="book"`); `ArrowLeft/Right`, `Home`, `End`. ESC, `[` and `]` are left to the world shell.
- **Buttons + scrubber** are the non-drag path (WCAG 2.5.7). The tabs are plain `<button class="pm-tabbtn pm-flip__btn" data-size="md" data-cursor="Flip">` with the markup contract of the shared folder-tab button (`primitives/css/20-tabbutton.css`: label in `.pm-tabbtn__label`, fill and ink from `--c` / `--on`, which come from `--flip-ink` / `--flip-on`); the book styles no part of the tab itself, so whatever `.pm-tabbtn` looks like is what you get. The scrubber is a styled `<input type="range">`. The tabs use `aria-disabled` so focus is never lost at the ends. Below 520 px of book width the tabs keep only their arrows (the label stays for assistive tech).
- The two edge zones carry `data-cursor="Flip"` for the custom cursor. **Keep interactive overlay content out of the outer 20 %** (the zones sit above it). Overlay `<a>`, `<button>` and form controls never start a drag; the pointer is only captured once a drag really starts, so taps on them still click. Add `data-flip-no-drag` to any other clickable element.

## Accessibility

Live region (`role="status"`, polite): "Pages 4 and 5 of 230", "Front cover", "Back cover". Only the visible pages are exposed; every other mounted page is `aria-hidden` + `inert` and keeps its `alt`. The range has `aria-label` and an `aria-valuetext` equal to the live text. Two-tone focus ring (outline 2 px `--focus-in`, shadow 4 px `--focus-out`) on the book, the tabs and the range. Reduced or paused motion = no curl: the new spread dissolves in over the old one (240 ms; swipes and keys still work). Nothing animates in the background (no idle rAF; verified: 0 pending frames after settle and after unmounting mid-turn).

## Theming (CSS variables on the book or any ancestor)

`--book-paper` (#f6efde) · `--book-edge` (page-stack edge, #eadfc6) · `--book-shadow` (table shadow) · `--book-gutter` (spine shading) · `--book-radius` (3px) · `--book-tint` (flat warm tint over every page, e.g. `rgb(240 225 190 / .1)` for a paperback) · `--flip-max-h` (tallest the book may get, 78vh) · `--flip-ink` / `--flip-on` (colours of the built-in tabs and scrubber).

The root is `width: 100%`; the book is as wide as its container allows up to `--flip-max-h * aspect * 2`. Leave ~6 % room above and below (a lifted leaf is magnified by perspective and the root does not clip in spread mode).

## Overlays

`overlay` is rendered inside the page in an absolutely positioned `inset: 0` box (percent coordinates). It is hidden with the page while the leaf is mid-turn and back when it lands. The Contract credit circle uses `manifest.credit.circleBboxPct` directly (`left/top/width/height` in %). To draw it when the spread appears, toggle a class from `onSpreadChange` (`info.index === 2`).

## How it works (for maintainers)

- `model.ts` pairs the pages; `engine.ts` holds one MotionValue per leaf (turn 0..1) and runs framer-motion's spring (`JSAnimation`) on it; components move their own DOM from `MotionValue.on('change')`, nothing re-renders per frame.
- A leaf at rest is a plain `<img>` (crisp). While it moves, `Leaf.tsx` mounts a **sheet**: N vertical strips, each an absolutely positioned box with its slice of the page as three CSS backgrounds (image, paper grain, gutter), `translate3d + rotateY`, and a two-stop shading gradient. `curl.ts` solves the polyline (the free edge leads in the direction of travel, amplitude grows with speed, the sheet never goes below the page under it so it rolls down on landing) and lights it (overhead half-Lambert, a sheen vector for gloss, ambient occlusion at the hinge).
- Cast shadows, hinge darkening, spine, page-stack thickness (clip-path, changes with progress), table shadow, centring of the closed book: `FlipBook.tsx` `applyProgress`.
- Mounted: the current spread and its neighbours (3 spreads of real `<img>`s, `decoding="async"`); the rest is not in the DOM. A hovered, focused or pressed book "arms" the two turnable leaves so the first frame is warm.

## Decision log

Measured in Chromium (Chrome stable, headless, real GPU: Intel UHD via ANGLE/D3D11, 144 Hz frame grid = 6.94 ms), Contract demo (892 x 594 px book), 6 forward + 6 back spring turns per run, frame intervals from `requestAnimationFrame`.

**Prototype (b), rigid `rotateY` leaf with a moving gradient** (`curl="flat"`): 7.05 ms avg, p95 7.1, 5 of 1537 frames over 20 ms; at 4x CPU throttle 9.1 ms avg. Looks like a card on a door hinge: perspective only, no paper.

**Prototype (a), N strips:** first version 22 strips: 13.98 ms avg, p95 20.9, **29 % of frames over 20 ms**; 12 strips 8.75; 32 strips 20.7; at 4x throttle 84 ms. I assumed raster/GPU. A trace said otherwise: `Document::recalcStyle` was **740 ms per second** of the main thread. Cause: the paper grain was a ~15 KB `data:` URL stored in a custom property and substituted into the `background-image` of every strip, re-parsed on every style recalc (22 strips x every frame). Disabling the per-frame shading writes did not help (17 ms), removing the grain did (7.3 ms). Fix: the grain is a short `blob:` URL (`grain.ts`). After the fix, 22 strips: **6.98 ms avg, p95 7.1, 1 of 1552 frames over 20 ms**; 32 strips 9.05; CPU 2x: 9.98 (p95 14); 3x: 17.5; 4x: 31.5 (flat at 4x: 9.1). The main thread, not the GPU, is the limit, and it grows with strips: hence the governor (`quality.ts`: if the median frame of a turn is over 22 ms the strip count drops to 72 %, 50 %, 36 % for the rest of the visit).

**Winner: (a), strips.** In side-by-side frames at t = .3 / .5 / .62 the strip sheet reads as bending paper (the outer edge leads, photos wrap around the curve, the page rolls down when it lands) and (b) reads as a rigid card; (a) also holds 144 fps on this laptop and ~100 fps at 2x slower. Bend 46 degrees looked timid at mid-turn (the leaf was an edge-on sliver), 64 looked rubbery, **60 degrees at the free edge, distribution exponent 1.5** it is.

**Critique rounds on the mid-turn frames** (held with `scrub()` at t = .12 / .25 / .33 / .5 / .62 / .8, 1440 and 390 wide, plus 2x crops):
1. Grain read as dirty film (and its repeating fibre strokes showed up as a wallpaper pattern at 2x), the lifted leaf stayed bright and flat, the cast shadow was barely there, the leaf overlapped the tabs. Fixed: noise only at 40 % of the alpha, overhead light, two-sided cast shadow plus a hinge shadow, perspective 6.5x and more air above the tabs.
2. Near 90 degrees the leaf was an edge-on sliver and the photographs did not wrap round the curve; opening the cover showed a ghost paper block on the empty left side. Fixed: bend 46 to 60 degrees, exponent 1.5; the paper blocks fade in only once the turning leaf is over them; stronger sheen for glossy paper.
3. 2x crops of the edges and seams: clean (no gaps between strips, no stair-stepping on the curved top and bottom edges). Added a catch-light on the free edge, a gutter bulge highlight and a faint edge vignette so flat pages are not dead flat, thicker page-stack lines. At 390 px the turning leaf is clipped to the page frame and the tabs collapse to arrows.

Other choices:
- **Light**: first a lamp from the left: a rising leaf stayed bright and flat. Now an almost overhead half-Lambert (a leaf that stands up goes darker, front and back), a separate sheen vector for gloss, ambient occlusion near the hinge. Cast shadow on both pages beneath, plus the hinge going dark while the sheet stands over it.
- **Perspective** 6.5 x page width (5.5 magnified the lifted leaf by about a fifth and it overlapped the controls).
- **One element per strip** (switches to the back-face slice at 90 degrees, flipped by 180 degrees) instead of front + back faces with `backface-visibility`: a third of the layers. No nesting, no `overflow` or `opacity` on any `preserve-3d` ancestor.
- **Warm-up**: strips are mounted at 1 % opacity when the book is hovered, focused or pressed, and the flat page is only hidden when they have been painted for two frames (no flash, no late first frame).
- **Far jumps** turn one leaf with the destination pages on its back (rejected: riffling 8 leaves = 8 sheets of strips at once, and it loads pages nobody sees).
- **Spring**: `JSAnimation` (framer-motion's spring generator on its frame loop) instead of `animate()`: 12.8 KB gz instead of 35 KB gz for the same behaviour. FlipBook total: **26 KB gz JS + 2.8 KB gz CSS** with React external (`vite build` in lib mode).
- **Not chosen**: nested strips (deep DOM), WebGL (breaks the real-`<img>`/overlay/a11y model, spec asks for CSS 3D), react-pageflip / StPageFlip (last published 2022; open issues about `destroy()` not stopping the render loop and touch/scroll conflicts, see `notes/creative-playbook.md` 3.4).
- **Reduced motion** is its own render path (two dissolving layers) instead of a zero-duration spring, so nothing 3D is ever mounted.

Frame-by-frame check (CDP screencast, ~12 ms apart): a turn started from a warm book (hover, focus or pointer down) lifts on the very next frame and every frame after it is a smooth curl; a programmatic `next()` on a cold book starts about 70 ms late because the strips are warmed first, and nothing flashes or pops. CLS 0 at load and through every navigation.

Verified: keyboard (arrows, Home, End, window mode), mouse drag forward and back, drag cancelled, click on both edges, hover corner, tab buttons, scrubber, touch swipe (next, previous, vertical ignored), 390 px single mode, resize across 720 px, reduced motion (OS preference and `data-motion="paused"`), hard cover, controlled and uncontrolled (a refusing parent turns the book back), rapid next x7 (max 3 sheets alive), overlapping `goTo`/`next`/`prev`, unmount mid-turn (0 pending animation frames), no console errors or 404s, `tsc -b` clean. Not tested: Firefox and Safari (nothing here uses `backface-visibility`; if one misbehaves, `curl="flat"` or `reducedMotion` is the fallback).
