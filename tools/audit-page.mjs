// Objective page audit in a real browser (installed Chrome via playwright-core).
// Usage: node tools/audit-page.mjs <url> [--w=1440] [--h=900] [--reduced] [--wait=1200] [--scroll] [--tabs=20] [--json=<path>]
// Reports: horizontal overflow, text under 13px, images without alt/size or broken, controls without an accessible
// name, heading outline, duplicate ids, WCAG contrast of text over its effective background (solid colours only),
// focus-ring visibility along the tab order, CJK text, console errors, failed requests, LCP and CLS.
// Exit code 1 when any blocking finding exists (overflow, broken image, nameless control, CJK, console error, failed request).
import { chromium } from 'playwright-core'
import fs from 'node:fs'

const args = Object.fromEntries(
  process.argv.slice(3).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=')
    return [k, v ?? true]
  }),
)
const url = process.argv[2]
if (!url || url.startsWith('--')) {
  console.error('Usage: node tools/audit-page.mjs <url> [--w=1440] [--h=900] [--reduced] [--wait=1200] [--scroll] [--tabs=20] [--json=<path>]')
  process.exit(2)
}
const W = Number(args.w || 1440)
const H = Number(args.h || 900)
const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].find((p) => fs.existsSync(p))

const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--autoplay-policy=no-user-gesture-required'] })
const context = await browser.newContext({
  viewport: { width: W, height: H },
  reducedMotion: args.reduced ? 'reduce' : 'no-preference',
  isMobile: W < 700,
  hasTouch: W < 700,
  deviceScaleFactor: 1,
})
const page = await context.newPage()
const consoleErrors = []
const failed = []
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') consoleErrors.push(`${m.type()}: ${m.text().slice(0, 300)}`)
})
page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + String(e).slice(0, 300)))
page.on('requestfailed', (r) => failed.push(`${r.failure()?.errorText} ${r.url().slice(0, 200)}`))
page.on('response', (r) => {
  if (r.status() >= 400) failed.push(`HTTP ${r.status()} ${r.url().slice(0, 200)}`)
})

await page.addInitScript(() => {
  window.__cls = 0
  window.__lcp = 0
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value
    }).observe({ type: 'layout-shift', buffered: true })
    new PerformanceObserver((l) => {
      const es = l.getEntries()
      window.__lcp = es[es.length - 1].startTime
    }).observe({ type: 'largest-contentful-paint', buffered: true })
  } catch (e) {
    /* unsupported */
  }
})

await page.goto(url, { waitUntil: 'load' })
await page.waitForTimeout(Number(args.wait || 1200))

if (args.scroll) {
  const total = await page.evaluate(() => document.scrollingElement.scrollHeight)
  for (let y = 0; y < total; y += Math.round(H * 0.8)) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y)
    await page.waitForTimeout(220)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(300)
}

const report = await page.evaluate(() => {
  const out = {}
  const vw = window.innerWidth
  const sel = (el) => {
    if (el.id) return '#' + el.id
    const cls = (el.getAttribute('class') || '').split(/\s+/).filter(Boolean).slice(0, 2).join('.')
    return el.tagName.toLowerCase() + (cls ? '.' + cls : '')
  }
  const visible = (el) => {
    const r = el.getBoundingClientRect()
    if (r.width < 1 || r.height < 1) return false
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) return false
    return !el.closest('[aria-hidden="true"], [inert], .pm-sr')
  }

  // overflow
  out.overflowX = document.documentElement.scrollWidth - vw
  out.overflowers = []
  if (out.overflowX > 1) {
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect()
      if (r.right > vw + 2 && r.width > 0 && getComputedStyle(el).position !== 'fixed') out.overflowers.push(sel(el) + ' right=' + Math.round(r.right))
      if (out.overflowers.length >= 8) break
    }
  }

  // text under 13px
  out.smallText = []
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  const seen = new Set()
  while (walker.nextNode()) {
    const n = walker.currentNode
    const t = n.textContent.trim()
    if (!t) continue
    const el = n.parentElement
    if (!el || seen.has(el) || !visible(el)) continue
    seen.add(el)
    const fs = parseFloat(getComputedStyle(el).fontSize)
    if (fs < 12.99) out.smallText.push(`${sel(el)} ${fs.toFixed(1)}px "${t.slice(0, 40)}"`)
  }
  out.smallText = out.smallText.slice(0, 25)

  // images
  out.imageProblems = []
  for (const img of document.images) {
    if (img.closest('[aria-hidden="true"]') && img.getAttribute('alt') === '') continue
    const p = []
    if (!img.hasAttribute('alt')) p.push('no alt')
    if (!(img.getAttribute('width') && img.getAttribute('height')) && !getComputedStyle(img).aspectRatio.match(/\d/)) p.push('no width/height or aspect-ratio')
    if (img.complete && img.naturalWidth === 0 && img.currentSrc) p.push('broken')
    if (p.length) out.imageProblems.push(`${sel(img)} ${(img.currentSrc || img.src).split('/').slice(-2).join('/')}: ${p.join(', ')}`)
  }
  out.imageProblems = out.imageProblems.slice(0, 25)

  // accessible names
  const nameOf = (el) => {
    const lab = el.getAttribute('aria-label')
    if (lab) return lab
    const by = el.getAttribute('aria-labelledby')
    if (by) return by.split(/\s+/).map((id) => document.getElementById(id)?.textContent || '').join(' ').trim()
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
      if (el.labels && el.labels.length) return el.labels[0].textContent.trim()
      return el.getAttribute('placeholder') || el.getAttribute('title') || ''
    }
    const txt = (el.innerText || el.textContent || '').trim()
    if (txt) return txt
    const img = el.querySelector('img[alt]')
    if (img && img.getAttribute('alt')) return img.getAttribute('alt')
    const svgTitle = el.querySelector('svg title')
    if (svgTitle) return svgTitle.textContent
    return el.getAttribute('title') || ''
  }
  out.nameless = []
  for (const el of document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea, [role=button], [role=tab], [tabindex="0"]')) {
    if (!visible(el)) continue
    if (!nameOf(el)) out.nameless.push(sel(el))
  }
  out.nameless = out.nameless.slice(0, 20)

  // headings
  out.headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter((h) => !h.closest('[aria-hidden="true"]')).map((h) => `${h.tagName.toLowerCase()}: ${(h.innerText || h.textContent).trim().replace(/\s+/g, ' ').slice(0, 50)}`)
  out.h1Count = document.querySelectorAll('h1').length
  const ids = {}
  for (const el of document.querySelectorAll('[id]')) ids[el.id] = (ids[el.id] || 0) + 1
  out.duplicateIds = Object.entries(ids).filter(([, n]) => n > 1).map(([id]) => id).slice(0, 15)
  out.lang = document.documentElement.lang
  out.cjk = /[\u3400-\u9fff\uf900-\ufaff]/.test(document.body.innerText)

  // contrast (solid backgrounds only)
  const cv = document.createElement('canvas').getContext('2d')
  const parse = (css) => {
    cv.fillStyle = '#000'
    cv.fillStyle = css
    const v = cv.fillStyle
    if (v.startsWith('#')) {
      const n = parseInt(v.slice(1), 16)
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1]
    }
    const m = v.match(/rgba?\(([^)]+)\)/)
    if (!m) return null
    const p = m[1].split(',').map((x) => parseFloat(x))
    return [p[0], p[1], p[2], p[3] === undefined ? 1 : p[3]]
  }
  const lum = ([r, g, b]) => {
    const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
  }
  const over = (fg, bg) => [0, 1, 2].map((i) => fg[i] * fg[3] + bg[i] * (1 - fg[3])).concat([1])
  const bgOf = (el) => {
    let layers = []
    for (let e = el; e; e = e.parentElement) {
      const cs = getComputedStyle(e)
      if (cs.backgroundImage !== 'none') return { unknown: true }
      const c = parse(cs.backgroundColor)
      if (c && c[3] > 0) layers.push(c)
      if (c && c[3] >= 0.99) break
    }
    let base = [255, 255, 255, 1]
    for (const l of layers.reverse()) base = over(l, base)
    return { color: base }
  }
  out.lowContrast = []
  let unknown = 0
  let checked = 0
  const seen2 = new Set()
  const w2 = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  while (w2.nextNode() && checked < 600) {
    const n = w2.currentNode
    if (!n.textContent.trim()) continue
    const el = n.parentElement
    if (!el || seen2.has(el) || !visible(el)) continue
    seen2.add(el)
    const cs = getComputedStyle(el)
    const bg = bgOf(el)
    if (bg.unknown) {
      unknown++
      continue
    }
    const fg = parse(cs.color)
    if (!fg) continue
    const f = over(fg, bg.color)
    const L1 = lum(f)
    const L2 = lum(bg.color)
    const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
    const size = parseFloat(cs.fontSize)
    const bold = parseInt(cs.fontWeight, 10) >= 700
    const need = size >= 24 || (size >= 18.66 && bold) ? 3 : 4.5
    checked++
    if (ratio < need) out.lowContrast.push(`${sel(el)} ${ratio.toFixed(2)}:${need} ${size.toFixed(0)}px "${n.textContent.trim().slice(0, 30)}"`)
  }
  out.contrastChecked = checked
  out.contrastUnknownBackgrounds = unknown
  out.lowContrast = out.lowContrast.slice(0, 30)
  return out
})

// focus ring along the tab order
const tabs = Number(args.tabs || 20)
const focus = []
await page.evaluate(() => {
  document.activeElement && document.activeElement.blur && document.activeElement.blur()
  window.scrollTo(0, 0)
})
for (let i = 0; i < tabs; i++) {
  await page.keyboard.press('Tab')
  const info = await page.evaluate(() => {
    const el = document.activeElement
    if (!el || el === document.body) return null
    const cs = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    const name = (el.getAttribute('aria-label') || el.innerText || el.getAttribute('title') || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 40)
    const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow && cs.boxShadow !== 'none')
    return { tag: el.tagName.toLowerCase(), name, ring: !!ring, inView: r.bottom > 0 && r.top < innerHeight, size: Math.round(r.width) + 'x' + Math.round(r.height) }
  })
  if (info) focus.push(info)
}
report.tabOrder = focus.map((f) => `${f.tag}:${f.name}${f.ring ? '' : ' [NO RING]'}${f.inView ? '' : ' [offscreen]'} ${f.size}`)
report.noRing = focus.filter((f) => !f.ring).length

const perf = await page.evaluate(() => ({ cls: Number((window.__cls || 0).toFixed(3)), lcp: Math.round(window.__lcp || 0) }))
Object.assign(report, perf, { consoleErrors: [...new Set(consoleErrors)].slice(0, 20), failedRequests: [...new Set(failed)].slice(0, 20), viewport: `${W}x${H}`, reduced: !!args.reduced, url })
await browser.close()

if (args.json) fs.writeFileSync(String(args.json), JSON.stringify(report, null, 1))
const show = (label, arr) => {
  if (!arr || !arr.length) return
  console.log(`\n${label} (${arr.length})`)
  for (const a of arr) console.log('  - ' + a)
}
console.log(`AUDIT ${url}  ${W}x${H}${args.reduced ? ' reduced-motion' : ''}`)
console.log(`lang=${report.lang} h1=${report.h1Count} overflowX=${report.overflowX} cjk=${report.cjk} LCP=${report.lcp}ms CLS=${report.cls} contrast-checked=${report.contrastChecked} (unknown bg: ${report.contrastUnknownBackgrounds})`)
show('OVERFLOWING ELEMENTS', report.overflowers)
show('TEXT UNDER 13px', report.smallText)
show('IMAGE PROBLEMS', report.imageProblems)
show('CONTROLS WITHOUT AN ACCESSIBLE NAME', report.nameless)
show('DUPLICATE IDS', report.duplicateIds)
show('LOW CONTRAST TEXT', report.lowContrast)
show('CONSOLE ERRORS/WARNINGS', report.consoleErrors)
show('FAILED REQUESTS', report.failedRequests)
show('HEADINGS', report.headings)
show('TAB ORDER', report.tabOrder)
const blocking = report.overflowX > 1 || report.imageProblems.some((p) => /broken/.test(p)) || report.nameless.length || report.cjk || report.consoleErrors.some((e) => e.startsWith('error') || e.startsWith('pageerror')) || report.failedRequests.length
console.log(`\n${blocking ? 'BLOCKING FINDINGS PRESENT' : 'no blocking findings'}`)
process.exit(blocking ? 1 : 0)
