# Platform foundation: API note

Everything below is implemented and verified (dev server + production build, 1440 / 1920 / 768 / 390, keyboard, reduced motion, paused motion).
Read this instead of the source. Paths are relative to the repo root. `@/` = `src/` (configured in Vite and tsconfig), relative imports work too.

## 1. File map

| File | What it is |
|---|---|
| `index.html` | `<html lang="en">`, meta, **inline script** (adds `html.js`, copies `localStorage['pm-motion']==='paused'` to `html[data-motion]`), 3 font preloads (Fraunces roman, Karla, Courier Prime 700). |
| `public/fonts/*.woff2` + `LICENSE.txt` | Latin-only core faces (Fraunces roman + italic variable `full`, Karla variable `wght`, Courier Prime 400 / 700). Stable URLs. |
| `src/main.tsx` | imports `tokens.css`, `typography.css`, `fonts.css`, `base.css`, renders `<App/>` in StrictMode. |
| `src/App.tsx` | `MotionConfig` + `LayoutGroup` > `#app-root` (skip link, `.pm-desk`, Mast, PillNav, `<main id="main">` with the 6 sections, Footer) + `<WorldHost/>` + `.pm-grain`. |
| `src/styles/base.css` | reset, page foundations, focus ring, `.pm-sr`, `.pm-skip`, `.pm-desk`, `.pm-grain`, motion safety net, `@tailwind utilities` (no preflight). |
| `src/styles/fonts.css` / `fonts.ts` | latin `@font-face` rules; `loadHandFonts()` (Gochi Hand + Reenie Beanie, lazy) and `whenFontsLoaded(specs, ms)`. |
| `src/lib/router.ts` | hash router (section 3). |
| `src/lib/copy.ts` | every visible string of the shell (section 6). |
| `src/lib/motion.ts` | pause-switch store, `useMotion`, `useReducedMotion`, `setMotionPaused`, shared `ease` / `spring`. |
| `src/lib/hooks/*` | `useMotion useReducedMotion usePointerFine useMediaQuery useInView useClock useCopy useBodyLock useKey` + barrel `index.ts`. |
| `src/worlds/WorldHost.tsx` | reads the route, mounts the shell, `inert` on `#app-root`, document title, film leader, error boundary. |
| `src/worlds/WorldShell.tsx` | the overlay every world lives in (section 4). Also re-exports `useWorld`, `useWorldEscape`. |
| `src/worlds/WorldContext.ts` | `useWorld()`, `useWorldEscape()`. |
| `src/worlds/registry.ts` | `WORLDS` (slug -> lazy import), `getWorldComponent`, `prefetchWorld(slug)`. |
| `src/worlds/fonts.ts` | `loadWorld` map + `loadWorldFonts(slug)` (one lazy face per world). |
| `src/worlds/worlds.css` | all shell CSS (`pm-world-*`, `pm-wtab-*`, `pm-leader-*`) + the placeholder world look (`w-placeholder-*`). |
| `src/worlds/<Pascal>World.tsx` | the 10 world files (PLACEHOLDERS: `ContractWorld PlanaWorld FortyFourLabWorld SpelledGuiltyWorld SpaceMonkeyWorld ProcreateWorld SomiaWorld ConceptBrandWorld ConceptPortfolioWorld IllustrationWorld`). Replace the file, keep the name and `export default`. `PlaceholderWorld.tsx` is the shared placeholder body: delete it when nothing imports it. |
| `src/components/sections/*.tsx` | PLACEHOLDERS `Cover Catalog About Works Process Contact` (+ `placeholder.css`). Replace the file, keep `export default`, the `id`, and the single `<h1>` in Cover. The `Works.tsx` placeholder already uses the real card contract (section 3): copy it. |
| `src/components/chrome/*.tsx` | PLACEHOLDERS `Mast PillNav Footer`. Replace the file, keep `export default`. |
| `package.json` scripts | added `glyphs` (`node tools/glyphs.mjs`) and `typecheck` (`tsc -b`). |

**Chrome agent, edit `src/App.tsx` to add** `Desk`, `Toast`, `Intro`, `CustomCursor` (replace the `<div className="pm-desk" aria-hidden>` placeholder with `<Desk/>` and keep the class). The intro must be bypassed for deep links: `getRoute().kind === 'work'`.

## 2. Hooks

```ts
import { useMotion, useInView, useKey } from '@/lib/hooks'   // or '@/lib/motion' for the motion ones
```

| Hook | Signature | Notes |
|---|---|---|
| `useMotion()` | `() => { reduced, paused, still }` | `reduced` = OS setting, `paused` = visitor pressed "Pause motion", `still = reduced \|\| paused`. Stable object. Use `still` to stop canvas / video / rAF loops. |
| `useReducedMotion()` | `() => boolean` | OS setting only. |
| `setMotionPaused(next)` / `toggleMotionPaused()` / `getMotionPaused()` | | The visitor switch: sets `html[data-motion="paused"]`, persists `localStorage['pm-motion']` (try/catch), syncs other tabs. The chrome agent's "Pause motion" control calls these. |
| `usePointerFine()` | `() => boolean` | `(hover: hover) and (pointer: fine)`. |
| `useMediaQuery(q)` | `(string) => boolean` | |
| `useInView(ref, opts?)` | `(RefObject<Element>, { once?, rootMargin?, threshold?, root?, initial? }) => boolean` | Element must be mounted at the first effect. `root` takes an element or a ref: inside a world pass `root: useWorld().scrollRef` so the observer uses the world's scroller, not the viewport. |
| `useClock(timeZone)` | `(string) => { time:'HH:MM', hour, minute, isDay, timeZone }` | 24 h, refreshed every 20 s and on tab focus. `Europe/Madrid` (Barcelona), `Australia/Sydney`. Show it in Courier Prime. Bad zone gives `--:--`. Pure helper `readClock(tz, date?)`. |
| `useCopy(text?, resetMs=2200)` | `=> { copied, copy(override?) => Promise<boolean> }` | Clipboard API with a textarea fallback. Also `copyToClipboard(text)`. |
| `useBodyLock(active, target?)` | | Ref-counted `overflow:hidden` on `<html>` (default) or on an element / ref. **Not needed for worlds** (the router locks the page). Inside a world lightbox: `useBodyLock(open, useWorld().scrollRef)`. |
| `useKey(key \| key[], handler, opts?)` | opts `{ ignoreTyping=true, enabled=true, event='keydown', repeat=false, allowModifiers=false, preventDefault=false, target=window }` | `key` follows `KeyboardEvent.key`. Skips events whose `defaultPrevented` is set, IME composition, typing targets (input / textarea / select / contenteditable) and Ctrl / Meta / Alt (AltGr is allowed: `[` and `]` are AltGr on Spanish keyboards). **Never bind Alt+Arrow.** |

## 3. Router (`src/lib/router.ts`)

```ts
type SectionId = 'cover'|'catalog'|'about'|'works'|'process'|'contact'      // SECTION_IDS
type Route = { kind:'home'; anchor?: SectionId } | { kind:'work'; slug:string; origin?:string; dir?:-1|0|1 }

useRoute(): Route              // React hook (useSyncExternalStore)
getRoute(): Route              // non-React reads (e.g. the intro: bypass when kind==='work')
openWork(slug, origin?, { replace?, dir? }?)   // open a folder; origin = 'cover' | 'catalog' | 'works'
closeWork()                    // history.back() when the entry is ours, otherwise home without leaving the site
workHref(slug)                 // '#/work/<slug>' for href attributes
folderLayoutId(slug, origin?)  // 'folder-'+slug+'-'+(origin ?? 'x')
scrollToSection(id, { instant? })   // smooth unless reduced / paused (CSS decides); updates the URL without adding history
getOpener()                    // the element that opened the world (focus restore)
syncInitialScroll()            // App calls it once: scrolls to #section anchors present at load
```

* URLs: `#/work/<slug>` opens a world; `#cover #catalog #about #works #process #contact` are native anchors (nothing to handle, `scroll-padding-top: var(--nav-h)` makes them land under the nav). Unknown slug: falls back to home and the bogus hash is removed.
* `openWork` pushes one tagged history entry and remembers `scrollY`, the previous hash and the opening element. Closing returns there (scroll restored before the folder flies back). Back / Forward work. Prev / next hops **replace** the entry, so Escape / Back always leave in one step.
* While a world is open: `<html data-world-open="<slug>">` (page scroll locked via CSS, gutter removed so the overlay covers the full width) and `#app-root` is `inert`.
* **Opening a world from a card** (this is the whole contract):

```tsx
import { motion } from 'framer-motion'
import { folderLayoutId, openWork } from '@/lib/router'
import { prefetchWorld } from '@/worlds/registry'

<motion.button                                   // any motion.* element, or <Folder as={motion.div} layoutId=...>
  layoutId={folderLayoutId(work.slug, 'works')}  // the SAME id the shell uses; origin = the section this card lives in
  style={{ borderRadius: 18 }}                   // framer corrects border-radius only when it is a style value
  onClick={() => openWork(work.slug, 'works')}
  onPointerEnter={() => prefetchWorld(work.slug)} onFocus={() => prefetchWorld(work.slug)}   // optional: chunk + font ahead of the click
  data-cursor="Open"
/>
```

  Rules: cover deck, catalog band and works card of the same project each use their own `origin` (only the clicked one animates). Do **not** wrap cards in their own `<LayoutGroup id="...">` (App already has one `LayoutGroup`; an id would namespace the layoutId and break the match). A plain `<a href={workHref(slug)}>` also works (the world opens with the plain scale + fade instead of the shared-element flight). Keep the card's focus ring: focus returns to the opener on close.
* Deep link `#/work/<slug>` opens without the flight (plain scale + fade, instant on first paint).

## 4. World shell

Rendered by `WorldShell` around every world (worlds **must not** render a title, close, prev or next):

* fixed overlay `.pm-world[role=dialog][aria-modal][data-world=<slug>]` with a desk layer, a tab strip on top and the folder body below (`border-radius: 18px 18px 0 0`, colour `--w-bg`, shared element of the folder-open transition).
* tab strip (folder-tab technique with concave shoulders, own CSS in `worlds.css`): `[‹ previous neighbour in its own colour] [NN · Title tab] [next neighbour ›] ........ [× Close  Esc]`. Neighbours link to `#/work/<slug>` and replace the history entry. Below 900 px the neighbours show only their number, below 520 px only a chevron; touch devices get 40 px tabs. (This replaces the "edge tabs at the viewport sides": nothing overlaps a world's content.)
* keys: `Escape` closes (also while typing), `]` next, `[` previous (ignored while typing; never Alt+Arrow). Plain arrows stay free for the world.
* focus: moves into the world's scroller on open (arrows / space scroll it), Tab is trapped inside the dialog (+ `inert` page behind), focus returns to the opener on close (or to `<main>` for deep links).
* a shell that is leaving (closing or sliding away) is `inert` and click-through, so the page behind is usable at once.
* `document.title` becomes `<Title> · Pau Monfort` while open.
* three transitions: **shared** (opened from a card with an `origin`: folder body flies out of / back into the card, desk fades behind), **hop** (previous / next: panels slide sideways), **plain** (deep link / Forward: scale + fade). `reducedMotion`/paused make all of them instant.
* the world mounts when the folder has finished opening (about 0.3 s after a card click, 0.26 s after a hop, immediately for deep links and still motion), so there is no render or image-decode jank in the flight and the world's own entrance animations are seen. The chunk and its face start loading the moment the route changes.
* while the chunk or its display face loads: the **film leader** (countdown ring + "Developing…", only after 180 ms). If the chunk fails: "This folder is stuck." + a reload button.

```tsx
// src/worlds/XyzWorld.tsx  (default export, lazy chunk, brings its own css + face)
import './xyz.css'
import { useWorld } from './WorldShell'          // or './WorldContext'
export default function XyzWorld() {
  const { work, color, ink, accent, close, next, prev, nextWork, prevWork, reduced, scrollRef } = useWorld()
  return <div className="w-xyz">...</div>
}
```

`useWorld()` returns `{ work, slug, color, ink, accent, close(), next(), prev(), nextWork, prevWork, reduced, scrollRef }`. `next` / `prev` / `close` are **functions** (hop / close the world); `nextWork` / `prevWork` are the registry entries. `reduced` is `useMotion().still` (OS reduced OR paused): stop loops and autoplay when true. `scrollRef` is the `.pm-world-scroll` element.

**Inner overlays and Escape.** Window listeners run in registration order and the shell registers first, so an inner `useKey('Escape')` loses. Use `useWorldEscape(open, () => setOpen(false))` (export of `./WorldShell`): while `open`, Escape calls your handler instead of closing the world. (A handler that calls `event.preventDefault()` before the shell sees the event also works.)

Layout facts for world CSS: the scroller `.pm-world-scroll` is `position:absolute; inset:0; overflow-y:auto` below a 44 px strip (52 px on touch, plus the iOS top inset), so `height:100%` gives a full-area canvas and normal flow gives a scrolling page. It is a `layoutScroll` container (framer layout animations inside are measured correctly). `100vh` is the viewport, not the scroller. Add `padding-bottom: env(safe-area-inset-bottom)` yourself where it matters. Fixed-position children are relative to the viewport (they would cover the strip): prefer `absolute` inside your world root.

### CSS variables on `.pm-world`

`--w-color` (folder colour), `--w-ink` (text on it), `--w-accent` (= `work.accent ?? work.ink`), `--w-bg` (field colour, defaults to `var(--w-color)`; the shell paints the folder body with it, so a world that wants a different field sets its own root's `background` and may redefine `--w-bg` for its own children), `--w-strip` (strip height), `--w-tab-h`, `--w-edge` (strip side padding). Tokens (`--cream`, `--ink`, `--f-<slug>`, `--font-*`, `--fs-*`, `--ease-*`, `--z-*`) come from `tokens.css` / `typography.css`.

### Fonts of a world

`src/worlds/fonts.ts` has the typography.md section 4 map (`loadWorld[slug]` = dynamic imports of the @fontsource CSS) and `loadWorldFonts(slug)`; the registry loads them together with the chunk, so the film leader covers the font load (max ~0.9 s) and the big title never flashes a fallback. concept-brand loads Shrikhand + Barlow Semi Condensed 400/500/600/700, concept-portfolio loads Anybody `wdth`. In the world CSS: `font-family: 'Sora Variable', var(--font-body)` (always list the core face next: Orbitron has no middle dot). If a world needs another face, `import` its CSS inside the world's own file (same chunk). Family names: Bitter Variable, Overpass Variable, Sora Variable, DM Mono, Figtree Variable, Chango, Archivo Variable (`font-stretch`), Orbitron Variable, Gloria Hallelujah, Jost Variable, Shrikhand, Barlow Semi Condensed, Anybody Variable (`font-stretch`), Cherry Bomb One.

## 5. Motion contract

* `html.js` is set before first paint by the inline script. **Hidden / initial animation states must be written only under `html.js`** (`html.js .x { opacity: 0 }`), so no-JS visitors see everything.
* `html[data-motion="paused"]` = the visitor's "Pause motion" (`useMotion().paused`). `@media (prefers-reduced-motion: reduce)` = the OS.
* Every **ambient loop** (light leaks, rotating stamp, marquee, idle tilt, starfield, film-leader sweep) carries the class `pm-ambient`: base.css sets `animation: none !important` for it under both switches. Canvas / video / rAF loops must also check `useMotion().still` and pause off-screen and on `visibilitychange`.
* base.css also shortens **every** animation and transition to 0.01 ms (and iteration 1, delay 0) under both switches, so content never gets stuck mid-state. Anything that must still communicate under reduced motion needs a static state.
* `App` wraps the tree in `<MotionConfig reducedMotion={paused ? 'always' : 'user'}>`: framer-motion transform and layout animations stop for both switches automatically (opacity still animates).
* `scroll-behavior: smooth` on `<html>` only when the OS and the visitor both allow motion.
* Easing: `ease.out`, `ease.inOut`, `spring.folder` (one small overshoot, physical objects only), `spring.tab`, `spring.calm` from `@/lib/motion`.

## 6. Copy (`src/lib/copy.ts`)

Typed exports, verbatim from `docs/COPY.md` with typographic apostrophes / quotes: `META`, `MAST`, `NAV`, `NAV_COUNTER(i)`, `SHEET_META` (`years`, `categories`, `pages`, `counter(n)`), `COVER`, `CATALOG` (`empty(q)`, `bandTab(n)`, `bandFooter(n, years)`), `ABOUT`, `WORKS_SECTION` (`filters()` with counts, `cardTab(category, n)`, `lastCard`), `PROCESS`, `CONTACT` (`links`, `businessCard`, `emailActions`, `toast`), `FOOTER` (`clocks` with IANA zones), `CURSOR_LABELS`, `CONCEPT` / `CONCEPT_LINE`, `UI` (skip link, Pause / Resume motion, world strings), helper `pad2`. Arrows (`->`, `↗`, `↑`) are never in a string: the three faces have no arrow glyphs, draw them as SVG.

## 7. CSS facts (base.css)

* `html`/`body` = `--desk`, `overflow-x: clip` (never `hidden`: sticky must keep working), `scrollbar-gutter: stable` (removed only while a world is open), `scroll-padding-top: var(--nav-h)` (`--nav-h` defaults to 72 px: the nav's CSS must set the real value on `:root`).
* Body copy = the `.t-body` scale. Headings default to the display face (size inherits: use `.t-h1..` classes or your own sizes). `button` is reset (no UA look). `a` inherits colour.
* Focus ring (global `:focus-visible`): `outline: 2px solid var(--focus-in); outline-offset: 0; box-shadow: 0 0 0 4px var(--focus-out)`. Do not remove it; irregular silhouettes may use the primitives' drop-shadow ring.
* Utilities: `.pm-sr` (screen-reader only), `.pm-skip` (skip link), `.pm-desk` (fixed desk layer, z -1 inside `#app-root`), `.pm-grain` (static film grain, fixed, z 85, 6 %), Tailwind **utilities** (no preflight) for trivial layout only.
* z layers: nav 40, world 80, grain 85, toast 90, intro 95, cursor 100, skip link 110 (the first five are in `tokens.css`, the skip link in `base.css`).
* Grain: a balanced white / black speck tile drawn with normal blending at 6 % (soft-light at 7 % was measured: under 1 level of change on cream and on the desk, i.e. invisible).

## 8. How it was verified (re-run with `node tools/shot.mjs`, `npx tsc -b`, `npx vite build`)

Open / close / Escape / `]` `[` / Back / Forward / Close button / deep link / unknown slug / typing guard / Tab trap / inert / focus restore / scroll restore / anchors under the sticky nav / reduced + paused motion / failed chunk. Fonts: 4 requests (the 3 preloads + Fraunces italic), no duplicates, no preload warnings, Catalan accents, `l·l`, curly quotes, dashes, `€`, `©` all rendered by the web faces (no system fallback glyphs). Initial JS 104 KB gzip (budget 250).

Test hazard: the dev servers of all agents watch the same files, so another agent's edit can full-reload your page mid-test. For tests that inject DOM, build into your scratchpad (`npx vite build --outDir <scratchpad>/dist --emptyOutDir`) and serve that.
