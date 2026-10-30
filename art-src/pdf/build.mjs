// Builds the portfolio PDF an interview can take as an attachment: node art-src/pdf/build.mjs [--pages]
//   1. python -I -X utf8 art-src/pdf/prep.py      (once: JPEG/PNG copies of the pictures, art-src/pdf/_build/img)
//   2. node art-src/pdf/build.mjs                  -> art-src/pdf/_build/portfolio.html + portfolio-raw.pdf + toc.json
//   3. python -I -X utf8 art-src/pdf/finish.py     -> export/Pau-Monfort-Portfolio-2026.pdf (clean bookmarks, metadata, compressed)
//      --pages also writes one PNG per page to _build/pages/ so the layout can be checked by eye.
// Every word comes from the site's own sources (src/lib/works.ts, src/lib/copy.ts, bundled here with esbuild) so the PDF never says anything
// the site does not. 15 pages, 1920 x 1080 (16:9), live text and links, fonts embedded, no private data (docs/ART_DIRECTION.md section 12).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'esbuild'
import { chromium } from 'playwright-core'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..', '..')
const out = path.join(here, '_build')
const img = path.join(out, 'img')
const fonts = path.join(root, 'public', 'fonts')
const RAW_PDF = path.join(out, 'portfolio-raw.pdf')
const SITE = 'https://paumonfortjudici.github.io/'
const W = 1920
const H = 1080

// ---- the site's own data, bundled on the fly ------------------------------------------------------------------------
const bundled = await build({
  entryPoints: [path.join(root, 'src', 'lib', 'copy.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  write: false,
  alias: { '@': path.join(root, 'src') },
})
const dataFile = path.join(out, '_data.mjs')
fs.mkdirSync(out, { recursive: true })
fs.writeFileSync(dataFile, bundled.outputFiles[0].text)
const { ABOUT, CONTACT, COVER, PROCESS, CONCEPT_LINE } = await import(pathToFileURL(dataFile).href)
// copy.ts does not re-export the registry: bundle works.ts next to it
const bundledWorks = await build({ entryPoints: [path.join(root, 'src', 'lib', 'works.ts')], bundle: true, format: 'esm', platform: 'node', write: false })
const worksFile = path.join(out, '_works.mjs')
fs.writeFileSync(worksFile, bundledWorks.outputFiles[0].text)
const { WORKS, CATEGORY_LABEL } = await import(pathToFileURL(worksFile).href)

const index = JSON.parse(fs.readFileSync(path.join(img, 'index.json'), 'utf8'))
const url = (key) => {
  const e = index[key]
  if (!e) throw new Error('picture not prepared: ' + key)
  return pathToFileURL(path.join(img, e.file)).href
}
const font = (f) => pathToFileURL(path.join(fonts, f)).href
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const pad2 = (n) => String(n).padStart(2, '0')
const TOTAL = 15
// Fraunces, Karla and Courier Prime have no arrow glyph: draw it
const ARROW = '<svg class="ar" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 18 6M8 6h10v10" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const live = (slug) => `${SITE}#/work/${slug}`

// ---- the pictures of each project page (page coordinates; left half of the page) -------------------------------------
// f: 'bare' (the picture as it is), 'print' (white print border), 'flat' (no shadow, for cut-outs)
const ART = {
  contract: [
    { k: 'in-contract', x: 90, y: 150, w: 600, r: -2.5, z: 1 },
    { k: 'p-contract-cover', x: 590, y: 120, w: 380, r: 3, z: 2, f: 'print' },
    { k: 'p-contract-l', x: 650, y: 560, w: 250, r: -4, z: 3, f: 'print' },
    { k: 'p-contract-r', x: 820, y: 600, w: 250, r: 3, z: 3, f: 'print' },
  ],
  plana: [
    { k: 'in-plana', x: 90, y: 150, w: 600, r: -2, z: 1 },
    { k: 'p-plana-web', x: 450, y: 170, w: 600, r: 2, z: 2, f: 'print' },
    { k: 'p-plana-stationery', x: 420, y: 560, w: 600, r: -2.5, z: 3, f: 'print' },
  ],
  'fortyfour-lab': [
    { k: 'in-fortyfour-lab', x: 90, y: 150, w: 600, r: -2, z: 1 },
    { k: 'p-fortyfour-lab-rug1', x: 640, y: 130, w: 330, r: 3, z: 2, f: 'print' },
    { k: 'p-fortyfour-lab-rug2', x: 760, y: 520, w: 300, r: -3, z: 2, f: 'print' },
    { k: 'p-fortyfour-lab-devil', x: 560, y: 540, w: 270, r: 5, z: 3, f: 'flat' },
  ],
  'spelled-guilty': [
    { k: 'in-spelled-guilty', x: 90, y: 150, w: 560, r: -2, z: 1 },
    { k: 'p-spelled-guilty-wrap', x: 480, y: 150, w: 600, r: 2, z: 2, f: 'print' },
    { k: 'p-spelled-guilty-pages', x: 450, y: 520, w: 620, r: -1.5, z: 3, f: 'print' },
  ],
  'space-monkey': [
    { k: 'in-space-monkey', x: 90, y: 150, w: 580, r: -2, z: 1 },
    { k: 'p-space-monkey-tyler', x: 560, y: 130, w: 300, r: 3, z: 2, f: 'print' },
    { k: 'p-space-monkey-smith', x: 810, y: 320, w: 270, r: -3, z: 3, f: 'print' },
    { k: 'p-space-monkey-patch', x: 620, y: 640, w: 230, r: -8, z: 4, f: 'flat' },
  ],
  procreate: [
    { k: 'in-procreate', x: 90, y: 150, w: 600, r: -2, z: 1 },
    { k: 'p-procreate-a', x: 620, y: 140, w: 340, r: 3, z: 2 },
    { k: 'p-procreate-b', x: 790, y: 470, w: 290, r: -3, z: 3 },
    { k: 'p-procreate-c', x: 560, y: 640, w: 250, r: 4, z: 4 },
  ],
  somia: [
    { k: 'in-somia', x: 90, y: 150, w: 560, r: -2, z: 1 },
    { k: 'p-somia-hero', x: 480, y: 160, w: 600, r: 1.5, z: 2, f: 'print' },
    { k: 'p-somia-collection', x: 560, y: 450, w: 330, r: -2, z: 3, f: 'print' },
    { k: 'p-somia-mobile', x: 880, y: 500, w: 190, r: 3, z: 4, f: 'print' },
  ],
  'concept-brand': [
    { k: 'in-concept-brand', x: 90, y: 150, w: 520, r: -2, z: 1 },
    { k: 'p-concept-brand-board', x: 560, y: 120, w: 470, r: 2, z: 2, f: 'print' },
    { k: 'p-concept-brand-logo', x: 390, y: 640, w: 420, r: -3, z: 3, f: 'flat' },
    { k: 'p-concept-brand-poster', x: 860, y: 560, w: 220, r: 4, z: 3, f: 'print' },
  ],
  'concept-portfolio': [
    { k: 'in-concept-portfolio', x: 90, y: 150, w: 560, r: -2, z: 1 },
    { k: 'p-concept-portfolio-1', x: 560, y: 130, w: 260, r: -3, z: 2, f: 'print' },
    { k: 'p-concept-portfolio-2', x: 720, y: 250, w: 260, r: 2, z: 3, f: 'print' },
    { k: 'p-concept-portfolio-3', x: 850, y: 420, w: 230, r: 5, z: 4, f: 'print' },
  ],
  illustration: [
    { k: 'in-illustration', x: 90, y: 150, w: 580, r: -2, z: 1 },
    { k: 'p-illustration-sheet', x: 600, y: 120, w: 440, r: 2, z: 2, f: 'print' },
    { k: 'p-illustration-s3', x: 560, y: 600, w: 220, r: -6, z: 3, f: 'flat' },
    { k: 'p-illustration-s8', x: 820, y: 620, w: 230, r: 6, z: 3, f: 'flat' },
  ],
}

// per-page title size (px): the long names need less
const TITLE_PX = { contract: 118, plana: 128, 'fortyfour-lab': 190, 'spelled-guilty': 120, 'space-monkey': 118, procreate: 104, somia: 190, 'concept-brand': 190, 'concept-portfolio': 92, illustration: 128 }

// ---- helpers ---------------------------------------------------------------------------------------------------------
const GROUP_LABEL = { 'Published work': 'Published work', 'First steps': 'First steps', Concept: 'Concept project' }

const foot = (n, dark = false) => `
  <footer class="foot${dark ? ' dark' : ''}">
    <span>Pau Monfort · Portfolio 2026</span>
    <a href="${SITE}">paumonfortjudici.github.io</a>
    <span>${pad2(n)} / ${TOTAL}</span>
  </footer>`

const artItem = (a, i) => {
  const e = index[a.k]
  const aspect = e.h / e.w
  return `<img class="art ${a.f ?? 'bare'}" src="${url(a.k)}" alt="" style="left:${a.x}px;top:${a.y}px;width:${a.w}px;height:${Math.round(a.w * aspect)}px;transform:rotate(${a.r}deg);z-index:${a.z ?? i}">`
}

const projectPage = (w, pageNo) => {
  const art = ART[w.slug].map(artItem).join('')
  const facts = [
    w.years && ['Years', w.years],
    ['Role', w.roles.join(' · ')],
    w.tools.length && ['Tools', w.tools.join(' · ')],
  ]
    .filter(Boolean)
    .map(([l, v]) => `<div class="fact"><dt>${l}</dt><dd>${esc(v)}</dd></div>`)
    .join('')
  const ext = (w.links ?? []).map((l) => `<a class="btn ghost" href="${esc(l.href)}">${esc(l.label)} ${ARROW}</a>`).join('')
  const concept = w.concept
    ? `<p class="concept"><b>CONCEPT</b><span>${esc(CONCEPT_LINE)} The artwork was produced with AI-assisted tools under that direction.</span></p>`
    : ''
  return `
<section class="page proj" id="p-${w.slug}" style="--c:${w.color};--ink-on:${w.ink}">
  <div class="tab">FOLDER ${pad2(w.n)}</div>
  <div class="filemeta">${esc(w.categories.map((c) => CATEGORY_LABEL[c]).join(' · '))}${w.years ? ` · ${esc(w.years)}` : ''}</div>
  <div class="artwrap">${art}</div>
  <div class="txt">
    <p class="kicker">${esc(GROUP_LABEL[w.group])}</p>
    <h2 style="font-size:${TITLE_PX[w.slug]}px">${esc(w.title)}</h2>
    <p class="kind">${esc(w.kind)}</p>
    <dl class="facts">${facts}</dl>
    <p class="blurb">${esc(w.blurb)}</p>
    ${concept}
    <div class="btns"><a class="btn solid" href="${live(w.slug)}">Open this folder live ${ARROW}</a>${ext}</div>
  </div>
  ${foot(pageNo)}
</section>`
}

// ---- pages -----------------------------------------------------------------------------------------------------------
const FAN = WORKS.map((w, i) => {
  const n = WORKS.length
  const a = -33 + (66 / (n - 1)) * i
  return `<div class="fold" style="--c:${w.color};--ink-on:${w.ink};transform:rotate(${a.toFixed(2)}deg)"><span class="ftab">${pad2(w.n)}</span><img src="${url('in-' + w.slug)}" alt=""></div>`
}).join('')

const cover = `
<section class="page cover" id="cover">
  <div class="c-left">
    <p class="kicker">Portfolio 2026 · ${esc(COVER.nameTag.split(' · ')[1])}</p>
    <h1>Pau<br>Monfort</h1>
    <p class="c-title">${esc(COVER.title.before)}<em>${esc(COVER.title.accent)}</em></p>
    <p class="c-blurb">${esc(COVER.blurb.replace(' Open a folder and step inside.', ''))} Ten folders, ten worlds: turn the page.</p>
    <p class="c-contact"><a href="mailto:${CONTACT.email}">${CONTACT.email}</a><span>·</span><a href="https://wa.me/34697512258">+34 697 512 258</a><span>·</span><a href="${SITE}">paumonfortjudici.github.io</a></p>
  </div>
  <div class="deck" aria-hidden="true">${FAN}</div>
  <div class="stamp"><span>OPEN FOR<br>PROJECTS<br>2026</span></div>
</section>`

const aboutPage = `
<section class="page about" id="about">
  <div class="a-left">
    <div class="tab ink">${esc(ABOUT.portraitTab)}</div>
    <div class="portrait"><img src="${url('about-portrait')}" alt="Stylised portrait of Pau"></div>
    <p class="cap">Stylised portrait (AI-generated), animated on the site.</p>
    <h3>Education &amp; certificates</h3>
    <ul class="chips">${ABOUT.education.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>
  </div>
  <div class="a-right">
    <h2>${esc(ABOUT.greeting)}</h2>
    <p class="small">${esc(ABOUT.greetingSmall)}</p>
    <p class="lead">${esc(ABOUT.paragraph)}</p>
    <div class="cols">${ABOUT.columns.map((c, i) => `<div class="col c${i}"><h3>${esc(c.title)}</h3><ul>${c.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div>`).join('')}</div>
    <h3 class="tl-label">${esc(ABOUT.timeline.label)}</h3>
    <ol class="tl">${ABOUT.timeline.items.map((j) => `<li><b>${esc(j.years)}</b><span>${esc(j.role)}</span><em>${esc(j.place)}</em></li>`).join('')}</ol>
  </div>
  ${foot(2)}
</section>`

const cabinet = `
<section class="page cabinet" id="cabinet">
  <h2>The cabinet</h2>
  <p class="sub">Ten folders, ten different worlds. Each page that follows is one folder; the live site opens them as interactive scenes.</p>
  <div class="grid">${WORKS.map(
    (w) => `
    <a class="tile" href="#p-${w.slug}" style="--c:${w.color};--ink-on:${w.ink}">
      <span class="ttab">FOLDER ${pad2(w.n)}</span>
      <span class="tbody">
        <img src="${url('in-' + w.slug)}" alt="">
        <strong>${esc(w.title)}</strong>
        <em>${esc(w.kind)}</em>
        <small>${esc(w.years || GROUP_LABEL[w.group])}</small>
      </span>
    </a>`,
  ).join('')}</div>
  ${foot(3, true)}
</section>`

const processPage = `
<section class="page process" id="process">
  <h2>Process</h2>
  <p class="sub">${esc(PROCESS.sub)}</p>
  <div class="steps">${PROCESS.steps
    .map(
      (s) => `
    <article class="step">
      <img src="${url('process-' + s.n)}" alt="">
      <h3><i>${pad2(s.n)}</i> ${esc(s.title)}</h3>
      <p>${esc(s.body)}</p>
      <ul>${s.chips.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
    </article>`,
    )
    .join('')}</div>
  <p class="shelf"><b>${esc(PROCESS.shelf.label)}</b> ${PROCESS.shelf.items.map(esc).join(' · ')}</p>
  ${foot(14)}
</section>`

const contactPage = `
<section class="page contact" id="contact">
  <h2>${esc(CONTACT.phrase)}</h2>
  <p class="lead">${esc(CONTACT.paragraph)}</p>
  <ul class="rows">
    <li><span>Email</span><a href="mailto:${CONTACT.email}">${CONTACT.email}</a></li>
    <li><span>Email</span><a href="mailto:${CONTACT.emailSecond}">${CONTACT.emailSecond}</a></li>
    ${CONTACT.links.map((l) => `<li><span>${esc(l.label)}</span><a href="${esc(l.href)}">${esc(l.value)}</a></li>`).join('')}
  </ul>
  <a class="big" href="${SITE}">See the live portfolio ${ARROW}<small>paumonfortjudici.github.io</small></a>
  <div class="bizcard">
    <b>${esc(CONTACT.businessCard.name)}</b>
    <em>${esc(CONTACT.businessCard.role)}</em>
    ${CONTACT.businessCard.rows.map((r) => `<span><u>${esc(r.label)}</u>${esc(r.value)}</span>`).join('')}
  </div>
  ${foot(15)}
</section>`

const css = fs.readFileSync(path.join(here, 'pdf.css'), 'utf8')
  .replaceAll('{{F_FRAUNCES}}', font('fraunces-latin-full-normal.woff2'))
  .replaceAll('{{F_FRAUNCES_I}}', font('fraunces-latin-full-italic.woff2'))
  .replaceAll('{{F_KARLA}}', font('karla-latin-wght-normal.woff2'))
  .replaceAll('{{F_COURIER}}', font('courier-prime-latin-700-normal.woff2'))
  .replaceAll('{{F_COURIER4}}', font('courier-prime-latin-400-normal.woff2'))

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Pau Monfort · Portfolio 2026</title>
<meta name="author" content="Pau Monfort Judici">
<style>${css}</style></head><body>
${cover}
${aboutPage}
${cabinet}
${WORKS.map((w, i) => projectPage(w, 4 + i)).join('\n')}
${processPage}
${contactPage}
</body></html>`

const htmlFile = path.join(out, 'portfolio.html')
fs.writeFileSync(htmlFile, html)

// ---- render ----------------------------------------------------------------------------------------------------------
const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args: ['--allow-file-access-from-files'] })
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })
const pg = await ctx.newPage()
const errs = []
pg.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 160)))
pg.on('requestfailed', (r) => errs.push('FAILED ' + r.url().slice(-80)))
await pg.goto(pathToFileURL(htmlFile).href, { waitUntil: 'load' })
await pg.evaluate(async () => {
  await document.fonts.ready
  await Promise.all([...document.images].map((i) => i.decode().catch(() => {})))
})
await pg.waitForTimeout(300)
if (process.argv.includes('--pages')) {
  const dir = path.join(out, 'pages')
  fs.mkdirSync(dir, { recursive: true })
  const els = await pg.$$('section.page')
  for (let i = 0; i < els.length; i++) await els[i].screenshot({ path: path.join(dir, `${pad2(i + 1)}.png`) })
  console.log('pages ->', dir, els.length)
}
await pg.pdf({ path: RAW_PDF, width: `${W}px`, height: `${H}px`, printBackground: true, preferCSSPageSize: true, tagged: true })
await browser.close()
// the bookmarks Chrome derives from the headings lose the spaces of wrapped titles: finish.py writes a clean list instead
const toc = [[1, 'Cover', 1], [1, 'About', 2], [1, 'The cabinet', 3], ...WORKS.map((w, i) => [1, `${pad2(w.n)} · ${w.title}`, 4 + i]), [1, 'Process', 14], [1, 'Contact', 15]]
fs.writeFileSync(path.join(out, 'toc.json'), JSON.stringify({ toc, title: 'Pau Monfort · Portfolio 2026', author: 'Pau Monfort Judici' }))
console.log(`raw PDF ${RAW_PDF} ${Math.round(fs.statSync(RAW_PDF).size / 1024)} KB`, errs.length ? JSON.stringify(errs) : 'no errors')
