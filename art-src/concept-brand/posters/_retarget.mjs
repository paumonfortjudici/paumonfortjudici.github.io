// One-off: swaps the baked-in 1930s characters of the three posters for the new cast.
//   node art-src/concept-brand/posters/_retarget.mjs            (reads posters/_1930s/poster-N.svg, writes posters/poster-N.svg)
// A poster's characters are inline vector groups (a child of a named group, found by index with the child lister in the notes of
// docs/api/world-concept-brand.md section 12); each op removes the old ones and puts a new <image> where they stood.
// Idempotent: it always starts again from the _1930s copy.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from 'playwright-core'

const here = path.dirname(fileURLToPath(import.meta.url))
const img = (href, x, y, w, h, extra = '') => ({ tag: 'image', attrs: { href, x, y, width: w, height: h, ...(extra ? { 'clip-path': extra } : {}) } })
const M = '../mascots/'

// group -> { remove: [child indexes], insert: [{ at: child index to insert BEFORE (after removals, counted on the original list), el }] }
const PLAN = {
  1: [
    // Sifo with his own soda arc (the old inline jet goes), the old Oliva and the old glass (+ its ice, foam and drops) go, new ones stand in
    { group: 'cast-and-jet', remove: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], insert: [
      img(M + 'sifo-a.svg', -120, 626.4, 840, 924),
      img(M + 'gotet-b.svg', 330, 450, 1000, 1100),
      img(M + 'oliva-a.svg', 360, 1002, 480, 528),
    ] },
  ],
  2: [
    { group: 'xip', remove: [0], insert: [img(M + 'xip-b.svg', 700, 250, 560, 616)] },
    { group: 'cast-and-props', remove: [1], insert: [img(M + 'oliva-a.svg', 257, 876, 600, 660)], before: 2 },
  ],
  3: [
    { group: 'cast', remove: [2], set: [{ i: 1, attrs: { x: 620 } }], insert: [img(M + 'gotet-b.svg', 50, 130, 1060, 1166)] },
  ],
}

const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args: ['--allow-file-access-from-files'] })
const only = process.argv.slice(2).map(Number)
for (const n of [1, 2, 3]) {
  if (only.length && !only.includes(n)) continue
  const src = path.join(here, '_1930s', `poster-${n}.svg`)
  const page = await browser.newPage({ viewport: { width: 1200, height: 1700 } })
  await page.goto(pathToFileURL(src).href)
  await page.waitForTimeout(400)
  const xml = await page.evaluate((plan) => {
    const NS = 'http://www.w3.org/2000/svg'
    for (const op of plan) {
      const g = document.getElementById(op.group)
      const kids = [...g.children]
      const anchor = op.before !== undefined ? kids[op.before] : null
      let place = anchor
      if (!place) {
        // insert where the first removed child stood: the next surviving sibling after it
        const last = Math.max(...op.remove)
        place = kids.slice(last + 1).find((k) => !op.remove.includes(kids.indexOf(k))) || null
      }
      for (const t of op.set || []) for (const [k, v] of Object.entries(t.attrs)) kids[t.i].setAttribute(k, v)
      for (const i of op.remove) kids[i].remove()
      for (const e of op.insert) {
        const el = document.createElementNS(NS, e.tag)
        for (const [k, v] of Object.entries(e.attrs)) el.setAttribute(k, v)
        g.insertBefore(el, place)
      }
    }
    return new XMLSerializer().serializeToString(document.documentElement)
  }, PLAN[n])
  fs.writeFileSync(path.join(here, `poster-${n}.svg`), xml)
  console.log('poster', n, 'written', xml.length)
  await page.close()
}
await browser.close()
