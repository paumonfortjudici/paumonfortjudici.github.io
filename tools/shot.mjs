// Headless screenshot / interaction harness (uses the installed Chrome via playwright-core).
// Usage:
//   node tools/shot.mjs plan.json
//   node tools/shot.mjs '{"viewport":[1440,900],"steps":[{"goto":"http://localhost:5173/"},{"wait":800},{"shot":"out/home.png"}]}'
// Plan: { viewport:[w,h], scheme:"light"|"dark", reducedMotion:bool, dpr:number, mobile:bool, steps:[...] }
// Steps: goto, wait(ms), waitFor(selector), click, hover, move([x,y]), press, type, scroll(y), scrollTo(selector),
//        eval(js), shot(path | {path, full, selector, clip}), drag({from:[x,y],to:[x,y]}), resize([w,h])
// Prints a JSON report with console errors, page errors, failed/404 requests and eval results.
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'

const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
]

const arg = process.argv[2]
if (!arg) {
  console.error('Usage: node tools/shot.mjs <plan.json | inline-json>')
  process.exit(2)
}
const plan = JSON.parse(arg.trim().startsWith('{') ? arg : fs.readFileSync(arg, 'utf8'))
const [w, h] = plan.viewport || [1440, 900]
const executablePath = CHROME_CANDIDATES.find((p) => fs.existsSync(p))
if (!executablePath) throw new Error('No Chrome/Edge found')

const browser = await chromium.launch({ executablePath, headless: true, args: ['--autoplay-policy=no-user-gesture-required'] })
const context = await browser.newContext({
  viewport: { width: w, height: h },
  deviceScaleFactor: plan.dpr || 1,
  colorScheme: plan.scheme || 'light',
  reducedMotion: plan.reducedMotion ? 'reduce' : 'no-preference',
  isMobile: !!plan.mobile,
  hasTouch: !!plan.mobile,
})
const page = await context.newPage()
const report = { consoleErrors: [], pageErrors: [], failedRequests: [], badResponses: [], evals: [], shots: [] }
page.on('console', (m) => { if (m.type() === 'error') report.consoleErrors.push(m.text().slice(0, 400)) })
page.on('pageerror', (e) => report.pageErrors.push(String(e).slice(0, 600)))
page.on('requestfailed', (r) => report.failedRequests.push(`${r.url().slice(0, 200)} :: ${r.failure()?.errorText}`))
page.on('response', (r) => { if (r.status() >= 400) report.badResponses.push(`${r.status()} ${r.url().slice(0, 200)}`) })

for (const step of plan.steps) {
  const [k] = Object.keys(step)
  const v = step[k]
  try {
    if (k === 'goto') await page.goto(v, { waitUntil: 'load', timeout: 60000 })
    else if (k === 'wait') await page.waitForTimeout(v)
    else if (k === 'waitFor') await page.waitForSelector(v, { timeout: 15000 })
    else if (k === 'click') await page.click(v, { timeout: 8000 })
    else if (k === 'hover') await page.hover(v, { timeout: 8000 })
    else if (k === 'move') await page.mouse.move(v[0], v[1], { steps: 8 })
    else if (k === 'press') await page.keyboard.press(v)
    else if (k === 'type') await page.keyboard.type(v)
    else if (k === 'scroll') await page.evaluate((y) => window.scrollTo(0, y), v)
    else if (k === 'scrollTo') await page.$eval(v, (el) => el.scrollIntoView({ block: 'start' }))
    else if (k === 'resize') await page.setViewportSize({ width: v[0], height: v[1] })
    else if (k === 'drag') {
      await page.mouse.move(v.from[0], v.from[1])
      await page.mouse.down()
      await page.mouse.move(v.to[0], v.to[1], { steps: 14 })
      await page.mouse.up()
    } else if (k === 'eval') {
      const r = await page.evaluate(v)
      report.evals.push(r)
    } else if (k === 'shot') {
      const opts = typeof v === 'string' ? { path: v } : v
      fs.mkdirSync(path.dirname(path.resolve(opts.path)), { recursive: true })
      if (opts.selector) await (await page.$(opts.selector)).screenshot({ path: opts.path })
      else await page.screenshot({ path: opts.path, fullPage: !!opts.full, clip: opts.clip })
      report.shots.push(opts.path)
    } else throw new Error('unknown step ' + k)
  } catch (e) {
    report.pageErrors.push(`STEP ${k}(${JSON.stringify(v).slice(0, 80)}) failed: ${String(e).slice(0, 300)}`)
  }
}
await browser.close()
console.log(JSON.stringify(report, null, 2))
