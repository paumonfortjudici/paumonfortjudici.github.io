# Pau Monfort — Portfolio 2026 · Art Direction (source of truth)

> Written by the lead. Every agent that touches the site reads this first. **Section 12 (amendments after research) overrides anything above it.** Where a research note (typography.md, creative-playbook.md, template-behavior.md) is more specific, follow the note; where this document conflicts with a note on *taste or concept*, this document wins.

## 0. The job in one paragraph
Pau Monfort Judici (graphic designer, Cardedeu/Barcelona, worked in Sydney 2025-26) is pitching a **rebranding job for a small cinematic film studio in Australia**. The portfolio *is* the pitch: it must be so creative, crafted and specific that there is no doubt he is the right designer. Base structure comes from the 21st.dev **Folder Tab Portfolio Template** (paper sheets, colored folder tabs, stroke-drawn lettering, catalog accordion, works cabinet, process tabs, contact stack). We keep that DNA and push it much further: bigger, richer, vivid, tactile, cinematic, human. **All site copy is English. No Chinese. No system fonts.**

## 1. Concept: "The Cabinet" (a cinematic filing cabinet)
The site is a physical **filing cabinet in a projection room**. Pages are *paper sheets* lying on a dark desk lit by colored light leaks. Every project is a **colored folder**. Opening a folder opens a **world** — a distinct, hand-built micro-universe for that project (a press-proof light table for the magazine, a brand atlas for Plana, a workshop wall for 44 Lab, a noir case file for the book, a mission dossier for the space-monkey posters, a corkboard for early Procreate work, a storefront for Somia, a brand-board explorer, a slide deck, a sticker sheet).
Cinema is the quiet second metaphor (SMPTE color bars, film perforations, timecode, slate/clapperboard labels, aperture rings, grain) — used for *details*, never as a theme park.
Design adjectives: vivid, tactile, warm, witty, generous, precise. Anti-adjectives: corporate, glassy, gradient-purple SaaS, templated, timid, "AI-generated".

## 2. Color system
Desk (body): `--desk #0E0912` (plum-black) with slow, big, blurred **light leaks** (tomato, ultraviolet, marigold at 25-40% opacity, `mix-blend-mode: screen`) + film grain overlay (static noise tile, 6-9% opacity). The desk shows in the 20-28 px gaps between sheets and in the page margins.
Neutrals: ink `#17101B`, ink-2 `#2A1F30`, cream `#FFF2DA`, paper `#FFF8EA`, cream-2 `#F6E3BE`.
Folder colors (each project owns one; `ink` = text color placed on it):
| # | slug | name | folder | text |
|---|------|------|--------|------|
| 1 | contract | Tomato | `#FF4B2B` | ink |
| 2 | plana | Pine | `#1F5C46` | cream |
| 3 | fortyfour-lab | Marigold | `#FFB81C` | ink |
| 4 | spelled-guilty | Oxblood | `#8A1B3D` | cream |
| 5 | space-monkey | Ultraviolet | `#5B3DF5` | cream |
| 6 | procreate | Bubblegum | `#FF8FC1` | ink |
| 7 | somia | Lagoon (folder identity only; the world itself uses Somia's own black / paper-beige / periwinkle) | `#0F9AA8` | ink |
| 8 | concept-brand | Olive (Verd Oliva of the invented brand “Gotet”) | `#86A22F` | ink |
| 9 | concept-portfolio | Butter | `#FBE79A` | ink |
| 10 | illustration | Lilac | `#B79CFF` | ink |
Order alternates warm/cool so neighbours always contrast. A project may define a secondary `accent`.
Sheet tones (page rhythm): Cover = cream · Catalog = ink · About = marigold · Works = cream · Process = ultraviolet (cream text) · Contact = tomato. Sheet accent colors (meta bar, chips) rotate through the folder colors.
Rules: text contrast ≥ 4.5:1 (≥ 3:1 only for ≥ 24 px display). Never put cream text on tomato/marigold/lagoon. No blue-navy anywhere in the shell. Color is a *material*: flat fills + grain/halftone, never default gradients (soft light-leak glows on the desk are the only gradients).

## 3. Typography
See `C:/Users/User/AppData/Local/Temp/claude/C--Users-User-Documents-Portofolio/0908f779-4789-499a-9f74-ecb97a4d3b2d/scratchpad/notes/typography.md` (final pairing, packages, scale). Principles: one expressive **display** face for titles; a **serif italic accent** for single emphasized words; a calm **grotesk body** at 16-18 px (never system fonts); a **mono/label** face for tabs, chips, meta (11-12.5 px uppercase, tracking .08-.14em); a **handwritten marker** face only for annotations/scribbles. Giant section titles are **outline stroke lettering** (SVG, drawn on with `stroke-dashoffset` as in the template) — bigger than the template. Each world may load its own display face (lazy, inside the world chunk).

## 4. Layout rules (Pau: "make everything bigger, reach the margins, no dead space")
- Wrapper `min(100vw - 2*clamp(10px,1.6vw,28px), 1880px)`; sheet padding `clamp(18px,2.6vw,44px)`; type scale ~15-20 % larger than the template; section titles ≥ 12vw on desktop.
- Every sheet should feel *full*: layered decoration (halftone, stamps, tape, scribbles, perforations) fills space intentionally; no big empty rectangles. But keep a clear reading path.
- Mobile first-class: sheets stack, deck becomes a vertical folder stack, worlds become single-column; hover-only features get touch equivalents.

## 5. Component vocabulary (physical objects — use these instead of generic buttons)
- **Folder** (tab + body with inverted-radius tab corners; the template's `--fr` technique).
- **Stroke word** (outline lettering drawn on).
- **Tab chip** (small count chip inside tabs, like `02`).
- **Stamp** (rotated, rough-edged rubber stamp: "CONCEPT", "FIRST PROJECT · AGE 13", "OUT NOW"). Letterpress texture via SVG filter.
- **Ticket stub** (perforated stub) = the external-link CTA ("Visit planadigital.cat ↗", "Get the book ↗") — never a pill button.
- **Tape** (translucent washi pieces holding images), **paper clip**, **pin**, **sticker** (die-cut with halo), **sticky note**, **polaroid**.
- **Slate label** (clapperboard strip) for metadata: Role / Year / Tools.
- **Scribble** (hand-drawn SVG underline, circle, arrow, burst) drawn on with stroke animation.
- Buttons, if unavoidable, are *tabs*, *stamps* or *tickets*. No gradient pills. No icon-in-circle rows. No glassmorphism cards.
- **Cursor** (`CustomCursor`): small ink dot + ring with `mix-blend-mode: difference`; ring grows on interactive elements and shows a **context label** from `data-cursor="Open|Flip|Drag|Play|Visit|Copy"`. Respect reduced motion; hidden on touch.

## 6. Motion principles
Springy and physical (framer-motion springs, slight overshoot), never floaty-linear. Stagger by 40-70 ms. Stroke-draw for lettering/scribbles. Parallax subtle (<= 24 px). **Everything must have a `prefers-reduced-motion` fallback** (static, instant). No scroll-jacking; native scroll with optional gentle smoothing only if the research recommends it.
Signature moments: (1) **Intro**: SMPTE bars wipe, the name draws, folders drop into the drawer (≤ 2.2 s, skippable, once per session). (2) **Folder-open transition**: the clicked card's folder body expands (shared-element, `layoutId`) to fill the viewport; its tab becomes the world's title tab; close reverses it. (3) **Hover-scrub portrait** in About (pointer position scrubs the video; timecode overlay). (4) **Page-curl flipbooks** (magazine, book). (5) **Catalog**: live search + cursor-following previews. (6) **Process** as a bespoke filmstrip/lab bench with drawn-on step illustrations. (7) **Contact** with live Barcelona / Sydney clocks.

## 7. Information architecture
Single page, 6 sheets: `01 Cover · 02 Catalog · 03 About · 04 Works · 05 Process · 06 Contact` (no "Words/Kind words" section). Sticky pill nav with sliding indicator, `01/06` counter. Route for worlds: hash `#/work/<slug>` (GitHub Pages friendly); section anchors `#catalog`, `#about`, `#works`, `#process`, `#contact`. ESC closes a world; the edge tabs and the `[` / `]` keys move to the previous / next project (never Alt+Arrow: that is browser Back/Forward); plain arrow keys stay available for in-world carousels/flipbooks.
Works registry (order given by Pau): 1 Proyecto Contract · 2 Plana Digital · 3 44 Lab · 4 Spelled Guilty · 5 Space Monkey · 6 Procreate (first steps) · 7 Somia · 8 Gotet (concept brand) · 9 Concept portfolio · 10 Illustration (concept sticker sheet). Categories (multi-membership; tabs): Editorial, Branding, Web, Illustration, Print.

## 8. Voice & copy (English)
Warm, direct, a little witty, concrete. First person. Short sentences. Name real deliverables ("brand manual", "124-page issue"). Never "passionate", "creative solutions", "elevate", "unlock". No invented numbers or claims. Spanish/Catalan words only as flavor (project names, "vermut"). Concept work is always labeled.
Header notes (right of the name): **"Design is my first language."** / "I draw it, lay it out and build it."
Cover title: **"Brands, books & characters"** (accent italic on *characters*).
Cover blurb: "Graphic designer from Cardedeu, Barcelona. I design brands, magazines, books and characters — drawn by hand, laid out in Adobe, built for the web. Open a folder and step inside."
Catalog sub: "Everything in the cabinet, indexed. Search by name, tool or kind of work — or just open a folder."
About greeting: "Hi, I'm Pau!" — see section 9 for the full facts.
Contact: "LET'S TALK :)" / "Open to freelance projects and studio collaborations — branding, editorial, illustration and web. Tell me what you're making."

## 9. Facts allowed on the site (from his CV and brief; do not add others)
- Graphic designer + junior front-end developer. Based in Cardedeu (Barcelona), Spain. Worked in Sydney, Australia.
- Experience: Web graphic designer — Connecor, Barcelona (Oct 2019 – Nov 2024); Editorial director — Casual Magazines, Barcelona (May 2022 – Nov 2024); Front-end developer (junior) — 4mation Technologies, Sydney (Jul 2025 – Feb 2026); Brand & web design — Plana Digital, Cardedeu (2026 – now).
- CV text: Connecor — developed and presented design proposals, edited photographs for web banners and social media, designed, laid out and produced technical illustrations for brochures, banners and signage. Casual Magazines — tracked communication strategies, ad campaigns and marketing actions; helped maintain brand identity guidelines for visual consistency. 4mation — developed and maintained web applications with the dev team; HTML, CSS, JavaScript, responsive design and UX good practice.
- Skills: digital design, art direction, adaptability, image editing, attention to detail, graphic & web design, HTML5/JavaScript/CSS3, front-end development (master's).
- Education/certificates: Tourism degree, Universitat Autònoma de Barcelona (2022); Australian College of Business Intelligence (2026); NSW Government certificate (May 2026); Generative AI and its Business Applications; Software / Web Development; Introduction to Cyber Security.
- Contact (public): paumonfortjudici@gmail.com · pau@planadigital.cat · +34 697 512 258 (WhatsApp) · planadigital.cat · Instagram @fortyfour.lab · GitHub paumonfortjudici. **Never** publish references' contacts or a street address.
- Process tools (Pau's list): the whole Adobe suite, hand illustration, Procreate, Nomad Sculpt (3D), AI tools, Pinterest (ideas & references).

## 10. The ten worlds (each is a different UI — do NOT reuse one layout)
Each world: `src/worlds/<Pascal>World.tsx` (+ own CSS), default export, lazy-loaded; consumes `useWorld()` for `{slug,color,ink,accent,close}`; renders inside `WorldShell` (shared overlay, folder tab title, close, prev/next). Brings its own display font via fontsource import inside the chunk. All external links are **ticket stubs**. Each ends with a short "facts" slate (Role / Year / Tools / Links).
1. **Contract — "Press Proof"**: tomato light-table with crop marks, registration marks, color bars and a slug line. Center: a real **page-turning flipbook** (curl, drag corners, arrow keys) of the issue (cover, credits p.3, selected spreads). a “Find my name” control flips to the masthead spread (magazine pages 4–5; Pau calls it “page 3” because it is the third PDF page) and draws a hand-drawn circle around his credit, with the enlarged masthead crop taped beside it and the six “Textos: Pau Monfort.” byline crops as a strip. Editorial column with drop cap. Link: proyectocontract.es. Role wording: see section 12.
2. **Plana — "Brand Atlas"**: cream grid; the sun-over-horizon logo *rises* over a pine horizon on load; explorer cards: Logo lockups, Color (click-to-copy hex chips), Typography (live type tester), Mockups (draggable horizontal rail with momentum), Manual (17 pages fan), Website (browser frame auto-scrolling the planadigital.cat capture). Sticker "Websites ready in 72 hours". Link: planadigital.cat.
3. **44 Lab — "Workshop Wall"**: tan rug-weave wall, the hand-drawn devil cutout bouncing along a dashed path as you scroll a **dated vertical timeline** of Instagram posts (images/videos in rug-tag/polaroid frames, date stamps, alternating sides, videos autoplay muted in view). Wordmark huge. Link: Instagram.
4. **Spelled Guilty — "Case File"**: oxblood noir with a cursor-following **flashlight** reveal; the book as a CSS-3D object (rotates with pointer); "Open" turns it into a page-curl flipbook sample; evidence board of illustrations pinned with red string; typewriter synopsis; credits worded exactly as in section 12 (no line about how the illustrations were made, per Pau's decision of 2026-10-29); Amazon ticket stub.
5. **Space Monkey — "Mission Dossier"**: ultraviolet starfield (canvas) with Earth glow; two **holographic tilt posters** (Tyler, Smith) that flip to dossier backs; mission-patch stamp "My first project · age 13"; short story of the room; note that the room's original website no longer exists.
6. **Procreate — "Sketchbook Wall"**: kraft/cork wall with six **taped, draggable prints** (inertia, bring-to-front), handwritten marker annotations with arrows, double-click lightbox. Message: made very young, always the passion.
7. **Somia — "Storefront"**: awning-stripe header; laptop + phone mockups carousel with auto-scrolling full-page captures; brand strip (logo, palette, imagery); device switcher; "Open the shop ↗" ticket.
8. **Gotet (concept brand) — "Brand Board Explorer"** (fictional neighbourhood vermuteria in Cardedeu: logo, four mascots, pattern, mockups, three posters; palette Blau Sifo `#2340C0`, Vermell Vermut `#D8283B`, Verd Oliva `#86A22F`, Mantega `#FFD34E`, Rosat `#F8D2D0`, Tinta `#211736`; see the brand guide): pan/zoom canvas of the full board with hotspot chips (logo, cast, pattern, mockups, posters) + docked info panel (story, palette, fonts). CONCEPT stamp.
9. **Concept portfolio — "Slide Deck"**: five tall slides in a snap-scrolling lane inside a device frame; hover zoom; client bio panel. CONCEPT stamp.
10. **Illustration — "Sticker Sheet"**: die-cut sticker sheet; stickers can be **dragged off and stuck anywhere with physics**, double-click rotates, captions on hover, "peel all / reset" tape control. CONCEPT stamp.

## 11. Quality bar
- A designer should be able to screenshot any viewport at 1440×900 and 390×844 and find it intentional, balanced and *full*.
- No layout shift: every image has width/height; video has poster.
- Budgets: JS initial ≤ 250 KB gz (worlds lazy); each world chunk ≤ 120 KB gz excluding images; LCP image/video ≤ 1.5 s on broadband; total `public/` ≤ 150 MB.
- Accessibility: semantic landmarks, one `h1`, labelled controls, visible focus (2 px ink ring + offset), keyboard path for every interaction (flipbooks, drag boards have buttons), alt text on all images, reduced motion honored, contrast checked.
- Type-safe (`tsc -b` clean), no console errors, no 404s, no leftover template strings, no Chinese characters, no "Aoi Lin".

## 12. Amendments after research (authoritative; these override everything above)

### 12.1 Honesty rules that change copy
- **Proyecto Contract (role).** The issue's masthead (magazine p.4) credits Pau under *Redacción* (editorial team) and six Open Space features carry the byline *"Textos: Pau Monfort."*; *Maquetación* (layout) is credited to someone else. His CV says *Editorial director, Casual Magazines, May 2022 – Nov 2024*. So the site says: editorial director at Casual Magazines (publisher of Proyecto Contract); name in the masthead; byline on six features; the flipbook shows the issue as published. **Never write that Pau laid out the issue or any page** until he confirms which pages. Add a visible credit line "Pages © Casual Magazines and the credited photographers, shown as a portfolio sample." Do not mention the director's surname.
- **Spelled Guilty (authorship).** The site says: *Written, art-directed and published by Pau Monfort. Puzzles and layout built with a custom book engine.* Pau decided on 2026-10-29 to remove the AI wording of Spelled Guilty and the concept folders: no line on the site says how the illustrations or the stories were made. Never "hand-drawn", never "illustrated by Pau". No spoilers (no hints/solutions pages). Do not state price, ISBN, publication date, ratings or Kindle availability.
- **44 Lab.** The Instagram account has 13 posts dated 2023-03-08 to 2023-06-30 (profile: handtufted rugs, international shipping, custom orders by DM). Timeline = those dates (show date strings as text, never timezone-converted). No prices (2023 Etsy prices appear in captions: omit), no comments, no like counts. Six reels have poster frames only (copyright-flagged audio): show them as stills with a "still" mark, never as playable. Years = "2023".
- **Space Monkey.** Posters TYLER and SMITH, Photoshop files dated Dec 2017; per Pau they were his first project at age 13 (use his statement: "my first project, at 13"). The escape room opened in Feb 2018 in Granollers; its original website no longer exists. The only logo found is a small monkey-astronaut mark; use the cleaned patch cut-out only as a small inset.
- **Plana Digital.** Current identity = v2.0 "plana digital" (browser-window sunrise symbol; Poppy `#E5502F`, Wheat `#F2CF6B`, Holm oak `#1E4634`, Paper `#F7F2E8`, Night `#18181B`; Sora / Figtree / DM Mono). The old v1.0 board is superseded (only as an optional before/after). Some manual pages and mockups carry placeholder contacts and sample stats: label them "sample mockup" and never present them as real clients. Copy inside the images is Catalan: add English captions.
- **Somia.** Pau says he did the branding, logo and web layout; Somia's own pages carry no designer credit. Use his statement. The heading font of the real site (PP Hatton) is commercial: never self-host it. No customer or portrait photography beyond what `public/works/somia/web/` already contains.
- **Procreate.** Four pieces (logo, crest, two portraits). Held back until Pau confirms in writing: the group portrait (third-party logo) and the kids portrait (minors, a licensed cartoon on a shirt); their files are not in `public/`. Caption everything as early work; no claims about clients; nothing says 'first' or 'my drawing' for the crest (its noodle bowl may be a stock icon); the two portraits are palette studies of people whose consent is unconfirmed, so their close-up stays small.
- **Lead decisions of the final pass (2026-10-29).** The About and Cover copy say 'edit magazines' (Pau was editorial director; layout is credited to someone else). The Somia captures are price-masked. Only two em dashes remain on the site (Contact paragraph and the copy toast). The 44 Lab devil is 'hand-drawn' only in the registry, on Pau's own statement: confirm it.
- **Concept projects** (Gotet, the client portfolio, the sticker sheet): always carry the CONCEPT stamp and the line *Concept project, art-directed by Pau.* (Pau decided on 2026-10-29 to drop the "AI-assisted" wording from these folders.) All names, phones and addresses in them are fictional.
- **About video.** The animated portrait is an AI-generated stylised likeness (Kling): caption it as an animated portrait, not footage.

### 12.2 Accessibility and platform decisions (objective fixes from the audit)
- Focus ring is **two-tone**: `outline: 2px solid var(--focus-in)` plus `box-shadow: 0 0 0 4px var(--focus-out)` (ink inside, cream outside) so it is visible on the desk and every folder colour.
- A visible **"Pause motion"** control (header or footer; chrome agent) sets `html[data-motion="paused"]`; it stops every ambient loop (light leaks, grain flicker, rotating stamp, marquee, starfield, looping videos, idle tilt). `prefers-reduced-motion` does the same by default. Hidden/initial animation states exist only under `html.js`.
- No Alt+Arrow shortcuts. ESC closes a world; `[` and `]` hop between projects (ignored while typing); every hover-only feature (scrub video, cursor previews, flashlight, tilt) has a keyboard/touch alternative (range scrubber, tap-to-play, inline previews, buttons).
- Nothing is read under 13 px (labels included). Small text on vivid fills is INK, except cream on pine, oxblood and ultraviolet. Pine and oxblood folders get a 2 px cream-2 rim on the desk.
- The intro is 2.2 s or less, skippable (any key or tap), once per session (sessionStorage in try/catch), bypassed for deep links (`#/work/...`), reduced motion and paused motion, and rendered on top of already-painted content (never delays LCP).
- Overshoot easing only on physical objects (folders, stickers, stamps, tickets); ease-out for tabs, menus and accordions. At most 2 moving things per view besides the desk leaks and every ornament must label, point at or hold something.
- Typography is final: see notes/typography.md (Fraunces + Karla + Courier Prime core; Gochi Hand / Reenie Beanie for annotations; one lazy face per world). The outline section words are Fraunces Black outlines with real ink weight (stroke at least 3 px at 1440, scaled); the real text lives in an `<h2>` and the SVG is `aria-hidden`.
- framer-motion is pinned to 14.7.1 (fallback 14.6.0). Flipbooks are built in-house (CSS 3D, no third-party flipbook package). Installed helpers for worlds: react-zoom-pan-pinch 4.2.0, matter-js 0.20.0, gsap 3.15.0 + @gsap/react (GSAP is free; lazy-load it inside a world chunk only).
- Dependencies are installed centrally. To add one, take the lock first: `until mkdir .locks/npm 2>/dev/null; do sleep 5; done; npm install <pkg>@<exact> --save-exact; rmdir .locks/npm`.
- Dev servers: Vite keeps one optimizer cache per `--port`, so every agent uses its own port.
