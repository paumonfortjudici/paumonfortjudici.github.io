# Pau Monfort, portfolio

Live site: <https://paumonfortjudici.github.io>

A portfolio built as a **filing cabinet in a projection room**. Paper sheets lie on a dark desk lit by warm light leaks, every project is a coloured **folder**, and opening a folder opens a hand-built **world** of its own: a flip-through magazine on a cutting mat, a brand atlas, an Instagram-style timeline of rugs, a noir case file lit by a flashlight, a sketchbook wall, a shop front, a pan-and-zoom brand board, a presentation room and a sticker sheet. Controls are physical objects (folder tabs, stamps, ticket stubs, tape, slate labels), never default buttons.

It started from the structure of the *Folder Tab Portfolio Template* on 21st.dev (cover deck of folders, catalog bands, about sheet, works cabinet, process, stacked-folder contact) and was rebuilt from zero on top of it. See **Credits**.

## Stack

- React 18, Vite 5, TypeScript (strict), Tailwind 3 (layout only), framer-motion 14.7.1 (pinned: the shared-element folder flight depends on it).
- A few libraries live inside single worlds only: `matter-js` (stickers), `react-zoom-pan-pinch` (brand board). Each world is a lazy chunk.
- No CSS-in-JS, no UI kit. Fonts come from Fontsource and are loaded per world.
- Hash routing (`#/work/<slug>`, plus the section anchors `#cover #catalog #about #works #process #contact`) because GitHub Pages cannot rewrite URLs. `public/404.html` covers any other path.

## Scripts

```bash
npm run dev         # Vite dev server
npm run build       # tsc -b && vite build  (what the GitHub Action runs)
npm run preview     # serve the production build
npm run typecheck   # tsc -b
npm run glyphs      # rebuild the outline-lettering data (src/lib/lettering) from Fraunces Black
```

`kit.html` (primitives gallery) and `flip.html` (flipbook demo) are dev-only pages: Vite serves them in development, the production build only contains `index.html`.

## Layout of the repo

```
src/components/chrome/      desk, mast, nav, footer, intro, cursor, toasts
src/components/sections/    cover, catalog, about, works, process, contact
src/components/primitives/  folders, tabs, stamps, tickets, tape, slate labels, outline lettering
src/components/flip/        in-house page-curl flipbook (Contract and Spelled Guilty)
src/worlds/                 one folder per project world + the shell that frames them
src/lib/                    registry of the ten projects, copy, router, motion hooks, lettering data
public/works/<slug>/        optimised card art and assets of each project (WebP, SVG, no originals)
art-src/                    sources of the generated art (SVG builders and scripts), not shipped
docs/                       ART_DIRECTION.md (read section 12 first), ARCHITECTURE.md, COPY.md, docs/api/*
tools/                      Playwright-based checks: screenshots, page audit, copy audit, link audit
```

`docs/api/` has one short note per unit (chrome, each section, each world, the primitives, the flipbook, the card-art contract).

## Motion, accessibility, performance

- Everything that moves respects `prefers-reduced-motion`, and there is a visible **Pause motion** switch (it stops every ambient loop, canvas and marquee, and it persists).
- Everything works with the keyboard: `Tab`, `Enter`, `Space`, arrows, and in a world `Esc` closes, `[` and `]` hop to the previous or next folder.
- Targets are 44 px on touch, text is at least 13 px, focus is always visible, nothing depends on hover or drag alone.
- Budgets: initial JavaScript under 250 KB gzip, each world chunk under 120 KB gzip, `public/` under 150 MB. Worlds, fonts and heavy media load only when needed.

## Honesty rules

The copy only claims what the evidence supports (`docs/ART_DIRECTION.md`, section 12). In short:

- **AI-generated or AI-assisted material is labelled where it appears.** The animated portrait in *About* is an AI-generated stylised likeness. The 80 case illustrations of *Spelled Guilty* were made with AI image tools under Pau's art direction (the book's own credit says so). The three **Concept** folders (a vermuteria identity, a client portfolio deck, a sticker sheet) are invented projects, art-directed by Pau and built with AI-assisted tools; they carry a CONCEPT stamp.
- *Proyecto Contract* is shown as an editorial-director credit (masthead and bylines), not as layout work. On page 4 the e-mails, phones and addresses were removed and the director's name is mosaic-masked; the pages are © Casual Magazines and their authors and are shown as portfolio samples.
- No customer data and no third-party contact details: screenshots of other people's pages are masked (Somia's product prices) or left out, and the only contact details on the site are Pau's own. The placeholder contacts printed inside the Plana mockups are labelled as samples. The invented Gotet bar has invented prices and an invented address, labelled as such.
- Held back until Pau confirms: a Procreate portrait of two children and a group portrait with a third-party logo. Their files are not in `public/`.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml` (`npm ci`, `npm run build`, publish `dist/` to GitHub Pages, Node 20). `vite.config.ts` uses `base: '/'` for the user-site URL. The previous portfolio lives in the history at commit `63efb29`.

## Credits

- Structure inspired by the **Folder Tab Portfolio Template** on 21st.dev (<https://21st.dev>). Everything here (code, lettering, drawn parts, copy) was rebuilt for this site.
- Typefaces are open source (SIL OFL) from Fontsource: Fraunces, Karla, Courier Prime, Gochi Hand, Reenie Beanie, Barlow Semi Condensed, Sora, Figtree, DM Mono, Bitter, Overpass, Anybody, Archivo, Jost, Cormorant, Orbitron, Shrikhand, Chango, Cherry Bomb One, Fira Sans and Gloria Hallelujah. Licences are in `public/fonts/LICENSE.txt` and in each package.
- Design, illustration, art direction and code: Pau Monfort Judici.
