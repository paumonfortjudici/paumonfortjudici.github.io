# Section 06 Contact: API and behaviour note

Source: `src/components/sections/Contact.tsx`, `contact.css` and `src/components/sections/contact/**`. Read this instead of the source.
Prefix of every class: `pm-ct-`. Copy: `CONTACT` and `FOOTER.clocks` in `src/lib/copy.ts`, plus the few strings the section adds (section 9).
Pau liked the template's contact format ("keep it and put all my information"), so the format is kept as it was (outline word, then a stack of three overlapping coloured folders with tabs at different x) and enriched.

## 1. What is on the sheet

`<Sheet id="contact" tone="tomato" page="Contact" n={6}>`: ink text on tomato, pine meta bar. Exactly one `<h2>` (the outline word CONTACT); everything else is `<h3>` or a labelled region. No `<h1>`, no form, no third-party contact data.

| Block | What |
|---|---|
| Head | `StrokeWord` CONTACT (`h2`, tint fill, ink outline) with a hand-drawn cream double underline (`Scribble kind="underline"`). |
| Folder 1 (ink, tab `FOLDER 11 · YOURS`) | giant outline `LET’S TALK :)` (U+2019, `h3`, accessible name "Let’s talk") on two lines, cream outline + tomato misregistered shadow; the open-to paragraph (`CONTACT.paragraph`, Karla lead, the dash is glued to the word before it); a handwritten note "no forms, just write" with an arrow that points down at the e-mail folder. The tab ties back to the Works sheet, which ends with the dashed card "Next folder: yours?": this is that folder. |
| Folder 2 (marigold, tab `EMAIL`) | `paumonfortjudici@gmail.com` in Fraunces 800 at up to 5.4rem on a ruled line; two tabs stand on the rule at its right end: `COPY` (`TabButton`, ink) and `WRITE` (paper, `mailto:`). Under it "At Plana Digital" `pau@planadigital.cat` on its own rule, smaller, same two tabs. |
| Folder 3 (cream, tab `ELSEWHERE`) | five `Ticket` stubs (never pills): WhatsApp `+34 697 512 258` (`https://wa.me/34697512258`), Plana Digital `planadigital.cat`, Instagram `@fortyfour.lab`, GitHub `paumonfortjudici`, Book `Spelled Guilty on Amazon`. Each has its own colourway, tilt and a different small drawn glyph (chat bubble, browser sunrise, the 44 Lab devil, git branch, magnifying glass): no icon-in-circle. Links come from `CONTACT.links` (the three project links resolve through `works.ts`). |
| Business card | `SignatureCard` (lazy chunk): Pau's Plana Digital e-mail signature rebuilt in HTML / CSS as a taped card poking out of the stack (section 4). |
| Time zones | `TimeZones`: a strip of film leader with two live clocks and the hours when both of us are at work (section 5). |

## 2. Layout (all in `contact.css`)

- `.pm-ct-stage` is a grid. `.pm-ct-stack` holds three `Reveal kind="drop"` slots; each next folder overlaps the previous one by 20px so its tab pokes into the folder above; the first two folders get 22px extra bottom padding so content never sits behind the next tab.
- Folder 1 word: sized by a container-query length (`--ct-word`, per breakpoint) divided by the measured em-width of the exact phrase (`layoutLetters`, the layout `StrokeWord` uses), so it fills exactly that share of the folder at any width. At >= 1180px the word takes 52% of the folder and the card lies on the right (absolute, `top: -84px`, width `clamp(400px, 38.5vw, 640px)`, 720px from 1500px), its top edge and tape poking out above the folder into the free corner beside the heading; below 1180px the card is its own row under the tickets (610px wide from 720px, full width on a phone). The margin note and its arrow grow from 1500px.
- Tickets: 3 + 2 (6-column grid, second row centred) from 1001px, two columns from 640px, one column below. **Each ticket is a size container** (`container-type: inline-size` on the `li`): label size, stub width and paddings come from the ticket's own width (`cqw`), so a long handle such as `paumonfortjudici` never breaks inside a word, at any width (checked at 22 widths from 320 to 2560).
- **No layout shift.** `.pm-ct-cardslot` is a size container too and reserves the card's room before its chunk arrives: a spacer with the card's own 480 x 260 ratio, or 393px (the one-column height) when the slot is under 420px wide; the card lies over that box. Measured at 20 widths with the chunk held back: 0px of movement. The late hand font moves nothing either (the note is out of flow from 900px, and the sheet height does not change below).
- Phone (< 768px): the phone is its own composition, no rotations, 44px targets (tabs, tickets, the big address link gets 44px by padding with a negative margin so nothing moves), the margin note and its arrow share one line so the address, COPY and WRITE are on the first screen. The dual bar gets a 00 / 06 / 12 / 18 axis under each lane because its cells are too thin for numbers.
- Tokens only. Raw hex exists only for Plana Digital's own palette (`--pd-*`, brand manual p8) on `.pm-ct`, used by the business card.
- Tab order is DOM order and follows the eye: from 1180px (`useMediaQuery`) the card slot is rendered FIRST in `.pm-ct-stack` (it lies top right, so its flip button is the first stop after the heading, then COPY / WRITE, the five tickets, the footer); below 1180px it is rendered last (it lies under the tickets). Crossing 1180px remounts the card (state resets, harmless).
- Tickets (>= 1001px): 3 + 2 on a 6-column grid, the second row's two tickets span 3 columns each, so the folder is full to both margins at every width. Type and stub grow with the viewport (`min(6.6cqw, 1.9vw)`, cap 2.7rem), never past what the ticket can hold. Each ticket shows the real destination host in mono on the kicker line (`wa.me`, `instagram.com`, `github.com`, `amazon.com`; omitted when the value already is the host, and under 330px of ticket width).
- Touch targets: every COPY / WRITE tab on the sheet is 44px tall at every width (`--th: 44px`), not only on coarse pointers.
- 900 to 1179px: the phrase takes 78% of the folder (no card beside it), so no corner is empty. From 1500px the card is 36.5vw (max 700px) and sits 76px above the folder top.

## 3. E-mail folder: copy and write

- Every successful copy also slides a slate card ("TAKE n · COPIED", clapper stripes, `aria-hidden`, 2.2s, no animation in still modes) out above the COPY tab; the toast stays the screen-reader voice.
`COPY` = `TabButton` with `useCopy(address)` (clipboard API with the textarea fallback built into the hook). On success it calls the site toast (`toast(CONTACT.toast)` from `src/components/chrome/toast.ts`: "Email copied — talk soon!", the chrome's luggage tag, `role=status`) and the label swaps to "Copied" for 2.2s (both words are laid out, so the tab never changes width). If both clipboard routes refuse, the address text is selected (the keyboard can finish the job) and the toast says so (4.6s).
- `WRITE` = `TabButton href="mailto:..." target="_blank" rel="noopener noreferrer"`, accessible name "Write an email to <address>". The big address is also a `mailto:` link for mouse and touch (`tabIndex=-1`: WRITE is the keyboard way in, so there is no duplicate tab stop). Addresses and ticket links carry `translate="no"`.
- The earlier local toast shim (`contact/notify.ts`) is gone: the chrome toast exists and is imported directly.

## 4. The business card (`contact/SignatureCard.tsx`, `planaMark.ts`)

Recreates the Plana Digital e-mail signature (the original image is never published). Content, checked against `scratchpad/ref/firma.png`:
- left: Plana Digital's horizontal lockup (symbol + "plana digital"; the brand's own paths as data in `planaMark.ts`, coloured by class from the `--pd-*` tokens; the sun is its own shape and rises after the card has landed), the promise "Websites ready in 72 hours." (the signature's "Webs llestes en 72 hores.", `72 hours.` in Poppy), the sun on the horizon band, the band text "WEB STUDIO · CARDEDEU" (the signature's "ESTUDI WEB · CARDEDEU").
- right: `Pau Monfort` (Sora 800), `DESIGN & BRAND` (DM Mono; from `CONTACT.businessCard.role`; the original reads DISSENY I MARCA), rows `TEL +34 697 512 258` with the word WhatsApp under it (a link in the original, where it shares the line; on the card there is no room), `MAIL pau@planadigital.cat`, `WEB planadigital.cat`. The e-mail's legal footer is deliberately left out. No vCard.
- Fonts: Sora, DM Mono and Figtree are imported inside this file, which is `lazy()` in `Contact.tsx` and only mounts when the section is within 1400px of the viewport. Measured on a production build of the section alone: nothing is requested at the top of the page; the chunk and the three faces start about 2000px before the section. In the whole-site build Sora and Figtree are ALSO fetched at load by another part of the site (the Catalog's world-font warm-up, `src/components/sections/catalog/faces.ts` calling `loadWorldFonts` for every world, Plana's world uses the same two faces), so only DM Mono and the card chunk are truly lazy there. Nothing downloads twice. The card stays invisible until the faces are in (`whenFontsLoaded`, 1.2s cap), so no fallback text flashes.
- Flip: one real `<button class="pm-ct-card__hit" aria-pressed aria-label="Flip the business card">` over the whole card (click, tap, Enter, Space; cursor label "Flip"; `touch-action: manipulation`). Hover and keyboard focus lean the card toward you and lift it (a preview of the turn); the click completes it. The back is a hand-written thank-you in the marker face ("Thanks for scrolling this far. Let’s make something.") over the Plana sunrise (the sun rises behind the horizon stripe when the card turns). The face that is hidden is `aria-hidden`.
- Tape: the `Tape` primitive (butter, stripes) with the hand-written label "flip me"; it is a pivot that stays still while the card turns.
- RECEIVED: the first time the card is turned over, a paper-ink rubber stamp "RECEIVED" (Sora 800, double border, tilted) thumps onto the back over the sun (`pm-ct-thump`, 0.7s after the turn starts) and stays.
- The chunk (not its fonts) is also prefetched when the browser is idle (`requestIdleCallback`, 4s cap), and the section mounts the card from 2000px away, so a deep link or a fast scroll does not wait in an empty slot.
- Arrival: hidden until its faces are in and it is well inside the viewport (`useRevealOnce`, threshold .45), then it lands (`pm-ct-land`, 0.8s overshoot, 0.4s after the reveal so it comes after the folder it lies on has dropped); the two suns rise after that.
- Reduced / paused motion (`useMotion().still`): the card does not wait for its fonts at all (`data-ready` is set at mount and the font gate is 0ms; the faces swap in when they arrive), so there is never a hole beside the heading; no landing (not even a one-frame flash), no travel, no 3D flip (the faces swap with `visibility`), the suns are already risen, no lean. Phone: the card re-flows to one column below 420px (container query `pmct`); under 768px it lies flat.

## 5. Time zones (`contact/TimeZones.tsx`, `overlap.ts`)

- Two clocks (Barcelona = `Europe/Madrid`, Sydney = `Australia/Sydney`, from `FOOTER.clocks`): time in Courier Prime 700 with tabular numerals, a day / night dot (sun with rays / crescent with a star, drawn), weekday and part of the day, a one-line note ("Home, in Cardedeu" / "Where I worked in 2025–26"). Visible text is `aria-hidden`; a `pm-sr` sentence per clock carries the same ("Barcelona: 20:07, Wednesday evening. Home, in Cardedeu."). No live region (a minute tick would be noise). Between the clocks a leader frame (ring, crosshair, wiped quarter) counts the hour difference (`+10`) on a dashed dimension line.
- The 24-hour dual bar: one cell per hour of Barcelona's day (from its local midnight), two lanes (BCN marigold, SYD lagoon) showing the same 24 instants in each zone's wall-clock hour. Work hours are the slots 08:00 to 19:59 local; a lane cell is outlined when that zone is at work and filled when both are; a tomato bracket "BOTH AT WORK" wraps the longest shared run; a "NOW" playhead marks the current minute; a tick and a day name mark Sydney's midnight.
- The sentence is computed, not written: "Best overlap: **18:00 to 20:00** in Sydney, **08:00 to 10:00** in Barcelona." plus the rule behind it ("A working day is counted as 08:00 to 20:00 on both sides.") and "Sydney is 10 hours ahead today." Daylight saving comes from `Intl` (`overlap.ts` has no tables; `planDay` nudges the midnight on the two days a year when the clocks change; checked on 10 dates around both switches: 10 h, 9 h, 8 h, 9 h, 10 h and the matching overlaps). If the two days never meet the sentence becomes "Our working days do not meet today, so email is the best way in."
- Cost: nothing runs while the strip is off screen or the tab is hidden (`useInView` + `visibilitychange`); one `setState` per minute. `useClock` is not used because it does not pause off screen; `readClock` (the pure helper) is.
- Under 720px the cells hide their numbers and each lane gets the 00 / 06 / 12 / 18 axis underneath.

## 6. Files

| File | What |
|---|---|
| `Contact.tsx` | the section, `CopyTab`, `MailRow`, ticket colourways, `QuietBoundary` (an extra failing never takes the page down) |
| `contact.css` | everything, one file, `pm-ct-*`, a STILL block at the end for reduced / paused motion |
| `contact/SignatureCard.tsx`, `planaMark.ts` | the business card and the Plana lockup path data |
| `contact/TimeZones.tsx`, `overlap.ts` | the strip and its pure time maths (Intl only) |
| `contact/glyphs.tsx` | 5 ticket pictograms + the day / night dot |
| `contact/dev/` | dev-only harness (the section alone in the real CSS stack, so other work in progress cannot break a test): run a dev server and open `/src/components/sections/contact/dev/index.html`. Not imported by the site, not part of the build. |

## 7. Verification (production build of the harness, real Chrome, plus the dev server for the whole site)

- Copy: clipboard granted (value read back, toast text "Email copied — talk soon!", tab swaps to "Copied"); clipboard API missing (textarea route, same toast); both routes refused (address selected, failure toast). No console message in any of the three.
- Links: all nine anchors carry `target="_blank" rel="noopener noreferrer"`; hrefs are `mailto:` x2, `https://wa.me/34697512258`, `https://planadigital.cat/`, `https://www.instagram.com/fortyfour.lab/`, `https://github.com/paumonfortjudici`, `https://www.amazon.com/dp/B0HNKTP74L`.
- Keyboard: Tab goes meta buttons, COPY, WRITE, COPY, WRITE, five tickets, the card, then the footer; Enter and Space flip the card (the page scrolls it into view and the two-tone ring surrounds it); rings checked on COPY, WRITE, a ticket and the card.
- Touch (390 x 844, touch emulation): tap flips and un-flips; targets 44px and up; `scrollWidth == clientWidth`.
- Widths: no horizontal overflow and no element outside the viewport at 320 to 2560 (23 widths); no ticket word breaks (22 widths); card/slot height identical at 20 widths (0px layout shift); card and heading clear of each other at every width.
- Reduced motion (OS) and "Pause motion": card present, flips by face swap, no 3D, no landing, suns risen; reduced run viewed at 1440, 768 and 390.
- Lazy fonts: on a production build of the section alone, Sora / DM Mono / Figtree and the `SignatureCard` chunk are requested only when the section is about 2000px away (never at the top of the page). On the whole-site production build (one run, before other agents' worlds stopped compiling) DM Mono and the chunk behaved the same, while Sora and Figtree were already requested at load by the Catalog's warm-up (see section 4). The harness is built with `vite build --config <own config>` into the scratchpad because the whole-site build was broken at that moment by unfinished world files that are not mine.
- Contrast (computed from tokens): every text pair is 4.85:1 or better; the Poppy "72 hours." on Paper is 3.4:1 and is 18.7px bold or larger (large text), as in Plana's own signature.
- `tools/audit-page.mjs` on the harness at 1440: no console errors or warnings, CLS 0, no overflow, no text under 13px, headings h2 + h3 only. `tools/audit-copy.mjs`: no finding in these files. Dev server (React dev mode): no warning while scrolling, copying, flipping, tabbing and resizing.

## 8. Known limits

- The card never shows the legal footer of the e-mail signature and puts WhatsApp under the number (no room on one line).
- Work hours (08:00 to 20:00 local) are a convention, stated under the bar; a visitor in another zone can still read both clocks.
- The first screen at 1440 x 900 shows the card, the phrase and the note with its arrow; the address itself starts just under the fold (the arrow points at it). On a phone the address and both tab pairs are on the first screen.
- Between 1000 and 1179px the card lies below the tickets (there is no room beside the phrase); the phrase is widened to 78% of the folder there so the right of folder 1 holds only the note and its arrow.
- Em dashes: the section has two, both verbatim from COPY.md (the paragraph and the toast "Email copied — talk soon!"). The brief allows two per page, and other sheets have their own, so if the page total is over budget the toast's dash is the one to swap for a comma (`CONTACT.toast` in `src/lib/copy.ts`).

## 9. Strings the section adds (not in COPY.md)

`FOLDER 11 · YOURS` / `EMAIL` / `ELSEWHERE` (tabs), "At Plana Digital", "no forms, just write", `Let’s talk` (accessible name of the phrase), "Couldn’t copy it automatically. The address is selected, so copy it from your keyboard.", "Websites ready in 72 hours." and "WEB STUDIO · CARDEDEU" (translated from the signature), the card's back "Thanks for scrolling this far. Let’s make something." and "flip me", the time strip's labels ("Time zones", "Home, in Cardedeu", "Where I worked in 2025–26", "Both at work", "Now", "Best overlap:", "A working day is counted as 08:00 to 20:00 on both sides.", "Sydney is 10 hours ahead today.").

## Changelog (critique rounds, resume run)

- Inventory: the earlier run's section was complete in structure; found: toast was a local shim, no rule sentence under the bar, tickets could break a word, the card slot reserved the wrong height, no card arrival choreography.
- Round 1: (1) the card floated small on tablets and phones, (2) the e-mail tabs wrapped left on one row and sat right on the other, (3) the folder-1 tab said only "Folder 11". Fixed: 610px card on tablets, tabs always at the right end of the rule, tab reads "Folder 11 · yours". Also: ticket words never break, real toast, 44px big address, note spacing at 768, bigger note and card from 1500px.
- Round 2: (1) the GitHub handle broke mid-word between 560 and 1240px, (2) 13px of layout shift when the card chunk arrived (and a 150px hole at exactly 484px), (3) a one-frame flash of the landing keyframe under reduced / paused motion. Fixed: per-ticket container queries and one column under 640px; a spacer that reserves the card's room; no landing animation in still modes.
- Round 3: (1) the phone's margin note and arrow took 65px of the first screen and pushed COPY / WRITE under the fold, (2) at landing the stroke words and the card still looked empty on a slow machine (checked: it is dev-server speed, the production build is ready before the section is reached), (3) 1000 to 1179px leaves the right of folder 1 quiet beside the phrase (kept: one deliberate rest). Fixed (1): the note and its arrow share one line on phones.
- Last pass: on phones the day change on Sydney's lane is named in the axis ("THU 00", the cells have no room for the day name), the card back's handwriting no longer touches the tape, `dev/index.html` has an empty favicon so the harness audit is silent.

- Fix round 1: card present at once in reduced / paused motion (no font or reveal gate); chunk prefetch; 44px COPY / WRITE tabs; tickets full-width with hosts; card lower and phrase wider so folder 1 has no hole; keyboard order follows the layout; card front promise line and sun bigger (no rays: the real signature has none); RECEIVED stamp on the back; COPY slate card.
