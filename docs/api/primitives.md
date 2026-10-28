# Primitives: the physical-object vocabulary (API note)

Everything the sheets and worlds are made of: folders, tabs, outline lettering, paper sheets, stamps, tape, tickets, stickers, scribbles, slates.
Source: `src/components/primitives/**` (one `.tsx` per family, `css/*.css` partials, imported through `src/styles/primitives.css`).
Gallery (dev only): `http://127.0.0.1:<port>/kit.html` (run `npx vite --port 52xx --strictPort --host 127.0.0.1`). It shows every object on cream / ink / marigold / ultraviolet / tomato and the desk, with all ten folder colours, and has a "Pause motion" tab to test the still state.

```tsx
import { Folder, TabButton, StrokeWord, Sheet, Stamp, Tape, Ticket, Sticker, Scribble, Reveal, WorldFacts } from '@/components/primitives'
```
The barrel also loads `src/styles/primitives.css` and injects the shared SVG filters once (`defs.ts`: stamp edge, die-cut halo, grain). Nothing to mount in `App`.

## 0. Ground rules (read once)

- **Order of CSS.** `tokens.css`, `typography.css`, `fonts.css`, `base.css`, then anything importing the barrel. The primitives do not depend on the order (they beat `base.css` focus and `svg { max-width }` rules with their own selectors).
- **`html.js`.** Hidden / initial animation states (draw-on, reveal, thump, clap) exist only under `html.js`; the inline script in `index.html` sets it. Without it everything is simply visible.
- **Motion.** Every animation has a path for `prefers-reduced-motion: reduce` AND `html[data-motion="paused"]` (fully drawn, no travel, no loops). Ambient loops carry `pm-ambient`. No primitive needs `useMotion()`; the CSS handles it. `isStill()` (util) is a plain function for event handlers.
- **Tones and contrast** (measured against `tokens.css`; never swap the pairs): ink text on `cream, paper, tomato, marigold, bubblegum, lagoon, olive, butter, lilac`; cream text on `ink, pine, oxblood, ultraviolet`. Names: `ToneName = 'cream' | 'paper' | 'ink' | 'tomato' | 'pine' | 'marigold' | 'oxblood' | 'ultraviolet' | 'bubblegum' | 'lagoon' | 'olive' | 'butter' | 'lilac'`; `TONES[name] = { color, ink }`; `resolveTone(name | {color, ink})`.
- **Nothing under 13px.** Labels use `--fs-label` (13 to 14px). Ring stamps must be at least 10rem wide (ring text renders >= 13px). Small text on tomato: use ink; `--on2` is already raised to 4.6:1 where a folder needs it.
- **Focus.** Two-tone ring (ink inside, cream outside) on every interactive primitive. It follows the silhouette (folder: svg ring; tab button: stacked offset shadows; ticket: ring around the stub; meta buttons: outline + box-shadow).
- **Reusable recipes** (custom properties from `00-base.css`, usable in any CSS): `--pm-ring` = the silhouette-following two-tone focus ring as a `filter` value (`:focus-visible { outline: none; filter: var(--pm-ring) }` for shapes with shoulders or notches), `--pm-float` = the floating shadow (hard 2px + soft 14px), `--pm-grain` = the paper tooth tile (`background-image: var(--pm-grain)` over a colour), `--pm-hl` = the 1px paper highlight, `--edge-h` = the paper thickness (3px).
- **Keyboard / touch.** `Folder as="button" | "a"`, `TabButton`, `Ticket`, `SheetMeta` categories are real elements. Hover-only effects (lift, tear, wave) are also applied on `:focus-visible` where meaningful and never carry information alone.
- **Cursor labels.** Interactive objects set `data-cursor` (`Open` on meta buttons, `Visit` on tickets; `TabButton cursor="Flip"`; any other element accepts `data-cursor` directly).

| surface (`Sheet tone`) | `--sheet` | `--on-sheet` | `--muted-on-sheet` | contrast text / muted |
|---|---|---|---|---|
| `cream` | cream | ink | ink-3 | 16.8 / 9.2 |
| `ink` | ink | cream | cream-2 | 16.8 / 14.8 |
| `marigold` | marigold | ink | ink at 72 % | 10.8 / 5.7 |
| `ultraviolet` | ultraviolet | cream | cream-2 | 5.5 / 4.9 |
| `tomato` | tomato | ink | ink (a softer ink fails 4.5) | 5.6 / 5.6 |

## 1. Folder + TabChip

The core object: coloured paper with a tab. The silhouette (body, tab and the two concave "inverted radius" shoulders) is **one SVG path** measured from the real boxes (ResizeObserver, no React state): no hairline seams at any zoom (checked at dpr 1, 1.25, 1.5, 2). Paper feel: grain, 1px top highlight, a drawn 3px darker bottom edge, soft shadow only when lifted, optional 2px cream-2 rim.

| prop | type | default | notes |
|---|---|---|---|
| `color` / `ink` | CSS colour | cream / ink | fill and the text colour that sits on it. Hex or `var(--x)`. |
| `tone` | `ToneName` | | shorthand for the legible colour pair (`tone="pine"`) |
| `tab` | node | none | tab label (label font, caps). Omit for a plain rounded panel. |
| `count` | number or string | | adds a `TabChip` (`2` shows `02`) |
| `tabX` | 0..1 | 0.12 | tab position along the top edge. `<= 0` flush left, `>= 1` flush right. A tab that cannot fit between the corner arcs hugs the nearer edge. |
| `flush` | `true \| 'left' \| 'right'` | | force a flush tab (the body squares that corner) |
| `lift` | `boolean \| 'hover'` | false | raise 6px, tilt, soft shadow. `'hover'` = while hovered or focused. |
| `rim` | `boolean \| 'auto'` | `'auto'` | 2px cream-2 rim. Auto = on when the colour is under 3.3:1 against the desk (pine, oxblood, ultraviolet). Hex or `var(--token)` colours are measured. |
| `as` | element or component | `'div'` | polymorphic: the props of that element come along. `as="a" href`, `as="button" onClick`, `as={motion.div} layoutId whileHover`. For `a` / `button` the body is a `<span>` (valid HTML). |
| `clip` | boolean | false | clip children to the rounded body |
| `dashed` | boolean | false | an empty dashed outline (the "Next folder: yours?" card): no fill, a dashed 2.5px line in `ink` |
| `bodyClassName`, `bodyStyle`, `className`, `style` | | | |

```tsx
<Folder as="button" color={work.color} ink={work.ink} tab={`Folder ${pad(work.n)}`} count={work.categories.length}
        tabX={0.55} lift="hover" onClick={() => openWork(work.slug)} data-cursor="Open">
  <span className="t-num t-display">{pad(work.n)}</span>
  <span className="t-h5 t-display">{work.title}</span>
  <span className="t-caption" style={{ color: 'var(--on2)' }}>{work.kind}</span>
</Folder>
```
CSS variables on `.pm-folder`: `--c` fill, `--on` ink, `--on2` secondary ink (contrast-checked, never below 4.6:1 on its own folder), `--edge` darker paper edge, `--th` tab height (32px), `--fr` tab and shoulder radius (12px), `--br` body radius (18px), `--fpad` body padding, `--edge-h` (3px). Classes: `.pm-folder__tab`, `.pm-folder__body`, `.pm-chip`.
Notes: the root has `pointer-events: none` and only the tab and body take the pointer (the empty corners above the body never steal clicks from folders underneath). A tab label wider than its folder is cut with an ellipsis (the count chip stays); a tab that cannot fit between the corner arcs hugs the nearer edge. Layout animations (`layoutId`, scale) scale the svg silhouette: animate a wrapper (clip-path, opacity, translate) or accept a brief distortion.

`TabChip` (`<TabChip>02</TabChip>`): knocked-out numerals in a 5px-radius chip (`background: var(--on)`, `color: var(--c)`), 20px tall.

## 2. TabButton

The site's button: a small folder tab (label font, ink on colour), never a pill. Hover pulls it up 2px (the edge grows by the same amount), press = `translateY(2px)` and the edge collapses 3px to 1px.

| prop | type | default | notes |
|---|---|---|---|
| `tone` or `color` + `ink` | `ToneName` / `{color, ink}` / CSS | `'ink'` | |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 34 / 42 / 52px tall (44px minimum on coarse pointers) |
| `href` | string | | renders `<a>`; otherwise `<button type="button">` |
| `external` | boolean | | `target="_blank"`, `rel="noopener noreferrer"` and a hidden "(opens in a new tab)" |
| `icon`, `iconPosition` | `'arrow-right' \| 'arrow-left' \| 'arrow-up-right' \| 'arrow-down' \| 'cross' \| node`; `'before' \| 'after'` | | hand-drawn stroke icons (no arrow glyphs exist in the fonts) |
| `count` | number or string | | TabChip inside the button |
| `selected` | boolean | | pulled up (for tablists: also set `role="tab"` and `aria-selected` yourself) |
| `fused` | boolean | | sits on a bar of its own colour: no edge |
| `shoulders` | boolean | true | concave corners |
| `cursor` | string | | `data-cursor` |

```tsx
<TabButton tone="tomato" icon="arrow-right" onClick={next}>Next step</TabButton>
<TabButton href="https://planadigital.cat/" external tone="marigold" icon="arrow-up-right">planadigital.cat</TabButton>
```
A label longer than its box wraps (balanced) instead of spilling out; add `white-space: nowrap` through `className` where it must stay on one line. Variables: `--c`, `--on`, `--edge`, `--pm-lift` (registered with `@property`, so it animates), `--fr`, `--th`.

## 3. StrokeWord

Giant outline lettering: Fraunces Black 900 outlines, laid out at runtime from `src/lib/lettering` (advance + pair kerning), one `<path pathLength="1">` per contour, stroke-dash draw staggered per letter (`--i`, 70ms, capped so a long word takes about a second), round joins, ink width kept at about 3px at 1440 (stroke width is scaled in viewBox units by a ResizeObserver; never `non-scaling-stroke`). Looks right at 8vw and up; below about 40px of em the counters fill with ink.

| prop | type | default | notes |
|---|---|---|---|
| `text` | string | | upper-cased; accents are stripped (É draws E; the real text stays in the accessible name). Drawn: `A-Z 0-9 # ( ) : ' ’ & . , ! ? -`; line breaks `\n` allowed. |
| `size` | number (px) or CSS length | `clamp(4.5rem, 13vw, 17rem)` | the em of the lettering (cap height = 0.7em). The word is never wider than its container (`max-width: 100%`). |
| `as` | `'h1'..'h4' \| 'p' \| 'div' \| 'span'` | `'span'` | headings: `<h2 class="pm-sw"><span class="pm-sr">TEXT</span><svg aria-hidden></h2>`; `span`/`div`/`p`: `role="img" aria-label` |
| `ghost` | boolean | false | decorative faint solid word (no outline, aria-hidden): `#2026`, `(10)`. Colour it with `color`; opacity `--ghost-a` (.13) |
| `draw` | `boolean \| number` | true | draw on when scrolled into view; a number is a start delay in ms |
| `hoverWave` | boolean | true | letters hop in a ripple (mouse only) |
| `strokeScale` | number | 1 | ink weight multiplier |
| `fill` | `false \| 'tint' \| 'solid' \| true` | false | fades in after the draw (`true` = tint, 16 %) |
| `shadow` | CSS colour | | a second outline offset by 0.02em: the misregistered riso look (the tint fill takes this colour) |
| `tracking` | em | 0.03 | extra letter-spacing (outline needs a little air) |
| `stack` | `'mobile' \| true` | | one word per line; `'mobile'` only below 720px (renders both, CSS picks). `stackSize` sets the em of the stacked version (default `min(24vw, 8rem)`) |
| `align` | `'start' \| 'center' \| 'end'` | `'start'` | alignment of stacked lines |
| `label`, `id`, `className`, `style` | | | `id` lets a `Sheet` point `aria-labelledby` at the heading |

```tsx
<StrokeWord as="h2" id="catalog-title" text="CATALOG" fill="tint" style={{ color: 'var(--cream)' }} />
<StrokeWord text="#2026" ghost size="14vw" style={{ color: 'var(--marigold)', position: 'absolute', right: 0 }} />
<StrokeWord as="h1" text="PAU MONFORT" size="11vw" stack="mobile" shadow="var(--tomato)" />
```
Variables: `--sw-size`, `--sw-size-stack`, `--step`, `--d`, `--draw-dur`, `--fill-delay`, `--ghost-a`, `--sw-shadow`.
Data: `src/lib/lettering/fraunces900.ts` (32 KB, generated; do not edit). Regenerate or change the character set:
`node tools/glyphs.mjs fontsource:fraunces:900 "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#():'’&.,!?-" --dict --runtime --size 200 --precision 1 --name FRAUNCES_900 --out src/lib/lettering/fraunces900.ts`
(`--runtime` writes the compact relative-path format; it needs the dev dependencies `opentype.js` and `@fontsource/fraunces`). `layoutLetters(text, opts)` in `src/lib/lettering/layout.ts` is the layout function if you need the paths yourself.

## 4. Sheet + SheetMeta

A paper sheet on the desk: rounded, grain, 3px darker edge, highlight, `+` crop marks in the four corners (hidden below 720px), the meta bar on top. Sets the surface variables for everything inside (table in section 0). Width = `--wrap`, bottom margin = `--sheet-gap`, padding = `--sheet-pad`, radius = `--sheet-radius`.

| prop | type | default | notes |
|---|---|---|---|
| `id` | string | | anchor: `cover`, `catalog`, `about`, `works`, `process`, `contact` |
| `tone` | `'cream' \| 'ink' \| 'marigold' \| 'ultraviolet' \| 'tomato'` | `'cream'` | |
| `page`, `n`, `total` | string, number, number | , , 6 | the meta bar shows `PAGE` and `0N / 06` |
| `accent` | `ToneName \| {color, ink}` | by page | colour of the meta bar and the `--accent` for chips and scribbles. Defaults rotate: cover tomato, other cream sheets lagoon, ink marigold, marigold oxblood, ultraviolet bubblegum, tomato pine. `defaultAccent(tone, n)` is exported. |
| `years` | string | `2019–2026` | |
| `meta`, `marks` | boolean | true | bar / crop marks |
| `as` | `'section' \| 'div' \| 'article'` | `'section'` | gets `aria-label={page}` unless you pass `aria-labelledby` |

The bar only shows what is real: years, `Branding`, `Editorial`, `Illustration`, this page, the counter (copy from `SHEET_META` in `src/lib/copy.ts`). The three kinds of work are **real `<button>`s**: a click runs `window.dispatchEvent(new CustomEvent('pm:filter', { detail: 'branding' | 'editorial' | 'illustration' }))` and then scrolls `#works` into view (smooth unless still). The Works section listens: `window.addEventListener('pm:filter', e => setFilter((e as CustomEvent<Category>).detail))`. `FILTER_EVENT` and `requestFilter(category)` are exported (the cover's quick links can call it).

```tsx
<Sheet id="catalog" tone="ink" page="Catalog" n={2} aria-labelledby="catalog-title">
  <StrokeWord as="h2" id="catalog-title" text="CATALOG" style={{ color: 'var(--on-sheet)' }} />
  <p style={{ color: 'var(--muted-on-sheet)' }}>…</p>
</Sheet>
```
Variables: `--sheet --on-sheet --muted-on-sheet --accent --accent-ink --sheet-edge --meta-h`. `<SheetMeta page n total years accent tone />` works on its own.

## 5. Stamp

A rubber stamp. Letterpress edge from an SVG filter (wobbled outline, ink-starved specks, pressure blotches, a little bleed), ink that soaks into the paper (`mix-blend-mode: multiply`), a thump-in (scale 1.45 to 1 with overshoot) when it scrolls into view. Not interactive (`pointer-events: none`).

| prop | type | default | notes |
|---|---|---|---|
| `text`, `sub` | string | | big word and an optional second line (>= 13px) |
| `ring` | string | | text running round a circle: makes it a round stamp (repeated to fill the ring) |
| `shape` | `'rect' \| 'round' \| 'plain'` | rect (round when `ring`) | double frame / ring seal / two rules |
| `tone` or `color` | `ToneName` / CSS | tomato | the ink. Small text (sub, ring) needs ink, pine, oxblood or ultraviolet on cream; tomato on cream is only 3:1 (fine for the big word). |
| `rotate` | deg | -8 | |
| `size` | CSS length | `1.6rem` (rect: the em), `10rem` (round: the width, minimum 10rem) | |
| `rough` | 1, 2, 3 | 2 | edge roughness |
| `thump` | boolean | true | |
| `spin` | boolean | false | round stamp turns slowly (38s, class `pm-ambient`, stops when paused); the centre becomes an asterisk |
| `blend` | `'multiply' \| 'normal'` | multiply | use `normal` on dark surfaces |
| `decorative` | boolean | false | `aria-hidden` instead of `role="img"` |

```tsx
<Stamp text="Concept" tone="ink" />                                            // rect
<Stamp text="First project" sub="Age 13" ring="My first project · age 13" />   // round
<Stamp text="Open" ring="Open for projects · 2026" spin size="9.5rem" />         // the rotating cover badge
```
Variables: `--rot`, `--size`.

## 6. Tape

A strip of washi tape: translucent (the art shows through), torn zig-zag ends, a faint pattern, fibre tooth, a hair of shadow. It always holds something.

| prop | type | default | notes |
|---|---|---|---|
| `color` | `ToneName` or CSS | `'butter'` | |
| `pattern` | `'plain' \| 'stripes' \| 'dots' \| 'grid' \| 'checks'` | plain | |
| `rotate` | deg | -3 (or by `at`) | |
| `w`, `h` | CSS length | `7.5rem`, `1.9rem` | |
| `at` | `'top' \| 'bottom' \| 'left' \| 'right' \| 'tl' \| 'tr' \| 'bl' \| 'br'` | | absolutely placed so the tape overhangs that edge or corner of its `position: relative` parent |
| `children` | node | | a hand-written label on the tape (then it is not aria-hidden) |

```tsx
<figure style={{ position: 'relative' }}><Tape at="tl" color="lagoon" pattern="stripes" w="5rem" /> … </figure>
```
Variables: `--tape --rot --w --h`.

## 7. Ticket

A perforated ticket stub: the external-link CTA (never a pill). Two quarter-circle notches per part and a row of perforation holes along the tear line are cut with masks (the shadow and the folder colour show through); hover or focus tears the stub away a few degrees; a hand-drawn arrow redraws. Reduced / paused: no tear, the label underlines.

| prop | type | default | notes |
|---|---|---|---|
| `href`, `label` | string, node | | the link and its text (`planadigital.cat`) |
| `kicker` | node | `'Visit'` | small line above |
| `external` | boolean | true | `target="_blank"`, `rel="noopener noreferrer"`, accessible name ends "(opens in a new tab)" |
| `tone` | `ToneName` | `'paper'` | paper of the main part |
| `stub` | `ToneName \| {color, ink}` | `'ink'` | colour of the stub (the arrow takes its ink) |
| `rotate` | deg | | |
| `cursor` | string | `'Visit'` | `data-cursor` |
| `aria-label` | string | `Visit {label} (opens in a new tab)` | |

```tsx
<Ticket href="https://planadigital.cat/" label="planadigital.cat" rotate={-1.5} />
<Ticket href={amazon} label="Spelled Guilty on Amazon" kicker="Get the book" tone="butter" stub="oxblood" />
```
Variables: `--c --on --stub --stub-ink --n` (notch radius, 9px) `--bite` (hole radius) `--rot`. Masks need a current browser (`mask-composite`; `-webkit-mask-composite` fallback is included). Without mask support the notches are simply missing.

## 8. Sticker

A die-cut sticker: a smooth white paper rim grown around the art's own outline (shared filter: dilate + blur + threshold), a hard and a soft shadow, a tilt. Give it an image or any content.

| prop | type | default | notes |
|---|---|---|---|
| `src`, `alt`, `width`, `height` | | | explicit size (no layout shift). Transparent PNG or WebP (`peek.webp` cut-outs work). `alt=""` when decorative. |
| `halo` | 1, 2, 3 | 2 | rim thickness 3 / 5 / 8px |
| `rotate` | deg | | |
| `lifted` | boolean | | bigger shadow, 5 % larger (the drag state) |
| `as` | element | `'span'` | |
| `children` | node | | instead of `src` (text stickers) |

```tsx
<Sticker src={asset('/works/fortyfour-lab/peek.webp')} alt="The 44 Lab devil" width={478} height={591} rotate={-5} style={{ width: 120 }} />
```
Set the on-screen size with `style={{ width }}` or a class. Variables: `--rot`, `--pm-sticker-shadow`.

## 9. Polaroid

A print with a white border and a hand-written caption, taped up, tilted.

| prop | type | default | notes |
|---|---|---|---|
| `src`, `alt`, `width`, `height` | | | the photo's real size sets the aspect ratio. Or give `children` for any content in the photo area. |
| `caption` | node | | Gochi Hand (`t-hand`) |
| `rotate` | deg | -2 | |
| `tape` | `boolean \| TapeProps` | true | butter strip on top; `false` for none |
| `w` | CSS length | `15rem` | |

```tsx
<Polaroid src={asset('/works/contract/thumb.webp')} alt="Proyecto Contract cover" width={720} height={900} caption="the issue" rotate={-3} w="12rem" />
```
Variables: `--w --rot`.

## 10. StickyNote, PaperClip, Pin

Small objects that hold or label something (leave them out if they do not).

```tsx
<StickyNote color="butter" rotate={-3} pin="pin" w="10rem">pick a folder</StickyNote>   // pin: 'pin' | 'tape' | 'none'
<PaperClip color="tomato" rotate={8} size="4.5rem" />                                   // steel by default
<Pin color="lagoon" size="2.6rem" />
```
`StickyNote`: flat colour (`ToneName` or CSS, ink text), folded corner, 3px edge, hand font; variables `--c --on --rot --w`. `PaperClip`: variables `--wire --rot --size`. `Pin`: `--pin --size`.

## 11. Scribble

Hand-drawn marks that draw themselves on (`pathLength` dash). Procedural and seeded: the same `seed` is the same mark, other seeds are other hands. Decorative (`aria-hidden`).

| prop | type | default | notes |
|---|---|---|---|
| `kind` | `'underline' \| 'circle' \| 'arrow' \| 'burst' \| 'squiggle' \| 'tick'` | | |
| `seed` | number or string | from the element id | |
| `color` | `ToneName` or CSS | `currentColor` | |
| `w` | CSS length | per kind (10rem, 9rem, 7.5rem, 5.5rem, 7rem, 2.8rem) | |
| `ratio` | number | per kind | width / height of the drawing |
| `dir` | `'right' \| 'left' \| 'up' \| 'down' \| 'up-right' ...` | right | arrows only |
| `stroke` | px | 3.4 | kept constant while the mark scales (capped for tiny boxes) |
| `draw` | `boolean \| number` | true | a number is a start delay in ms |
| `filled` | boolean | | burst gets a faint fill |
| `at` | `'under' \| 'around'` | | overlays a `position: relative` parent: `under` is a line below it, `around` stretches a loop to its box |
| `rotate` | deg | | |

```tsx
<span style={{ position: 'relative', display: 'inline-block' }}>Pau<Scribble kind="circle" at="around" color="var(--tomato)" /></span>
<Scribble kind="arrow" dir="down-right" w="5rem" />
```
Variables: `--w --d --dur --rot`.

## 12. Reveal

Wrapper that makes content arrive once when it scrolls into view. One shared IntersectionObserver sets `data-in="true"`; hidden state only under `html.js`; reduced / paused shows everything at once.

| prop | type | default | notes |
|---|---|---|---|
| `as` | element | `'div'` | |
| `kind` | `'rise' \| 'fade' \| 'pop' \| 'drop' \| 'left' \| 'right'` | `'rise'` | `pop` and `drop` overshoot (physical objects only) |
| `delay` | ms | 0 | stagger in 60 to 90ms steps |
| `rootMargin`, `threshold` | | `0px 0px -8% 0px`, 0 | |

```tsx
{works.map((w, i) => <Reveal key={w.slug} kind="pop" delay={i * 70}><Card work={w} /></Reveal>)}
```
Variable: `--rv-delay`. `useRevealOnce(ref)` and `observeOnce(el, cb)` are exported for custom elements.

## 13. SlateLabel, ColorBars, FilmPerforations, FilmStrip

```tsx
<SlateLabel tone="ink" items={[{ label: 'Role', value: 'Editorial director' }, { label: 'Year', value: '2022–2024' }, { label: 'Tools', value: '' }]} />  // empty cells are hidden
<ColorBars height="4.5rem" />          // SMPTE order in the folder palette; compact = the seven bars only
<FilmPerforations tone="ink" hole="1rem" />
<FilmStrip tone="ink">{frames}</FilmStrip>   // perforations above and below
```
`SlateLabel`: a `<dl>` on a slate (label-font cells, chalk rules) under a clapper stick that snaps shut when it arrives (`clap={false}` to disable); `tone="paper"` inverts it for dark surfaces. Variables `--board --chalk`. `ColorBars` (decorative): `--h`. `FilmPerforations` (decorative): the holes are cut out with a mask so the surface shows through; `--hole --perf`.

### Extras: printer's marks (for proof tables and light tables)
```tsx
<RegMark size="2rem" />                       // registration target, currentColor, aria-hidden
<div style={{ position: 'relative', margin: '2.5rem' }}><CropMarks gap="0.5rem" len="1.3rem" />…page…</div>   // trim marks sit OUTSIDE the parent's box
```
Variables: `--size` (RegMark), `--gap --len` (CropMarks).

## 14. WorldFacts

The slate that ends every world.

```tsx
<WorldFacts work={work} tone={work.ink === '#FFF2DA' ? 'paper' : 'ink'}>
  Pages © Casual Magazines and the credited photographers, shown as a portfolio sample.
</WorldFacts>
```
Composes `SlateLabel` (Role = one line per entry of `work.roles`, Year = `work.years`, Tools = `work.tools` joined by commas; empty cells hidden), one `Ticket` per `work.links` (kicker "Visit"), and for `work.concept` the CONCEPT stamp (in the folder's ink) plus the exact `CONCEPT_LINE`. `children` go below as a caption (credits, notes). Nothing is invented: every cell comes from the registry. Classes: `.pm-wf`, `.pm-wf__slate`, `.pm-wf__tix`, `.pm-wf__concept`.

## 15. Small exports

`RegMark`, `CropMarks`, `ArrowIcon dir size` and `CrossIcon` (hand-drawn stroke icons, `currentColor`), `TONES`, `TONE_HEX`, `resolveTone`, `needsRim(hex)`, `on2Percent(color, ink)`, `cx`, `defaultAccent`, `requestFilter`, `FILTER_EVENT`, `useRevealOnce`, `observeOnce`, `isStill`.

## 16. Caveats worth knowing

- Browser support: everything uses current CSS (`color-mix`, masks, `@property`). `@property --pm-lift` only smooths the tab-button press; without it the edge jumps.
- Safari renders SVG filters (`pm-stamp-*`, `pm-diecut-*`) correctly but on the CPU: use stamps and stickers as accents, not by the dozen.
- `Folder` measures itself in a layout effect; inside `display: none` it draws when it becomes visible.
- Spinning stamps keep the filter on a static inner element and turn the wrapper, so the filter is not recomputed every frame.
- Em dashes: the meta bar uses an en dash in `2019–2026`.
