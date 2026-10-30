// The card art of the folder (public/works/procreate/thumb.webp 720 x 900 and peek.webp): node art-src/sketchbook/cards.mjs, then cards.py.
//   thumb: a page of the sketchbook lying on the green cutting mat, a pencil and an eraser across the corner.
//   peek: the closed sketchbook, upright, with its page edges showing and a cream die-cut edge (the Works card tilts it and adds the shadow).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from 'playwright-core'
import { grain } from '../folders/lib.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const build = path.join(here, '_build')
fs.mkdirSync(build, { recursive: true })
const book = (id) => pathToFileURL(path.resolve(here, '..', '..', 'public', 'works', 'procreate', 'book', `${id}.webp`)).href

const DS = 'drop-shadow(0 1px 1px rgba(0,0,0,.35)) drop-shadow(0 10px 10px rgba(0,0,0,.4))'
const pencil = (w, rot, x, y) => `<svg style="position:absolute;left:${x}px;top:${y}px;width:${w}px;transform:rotate(${rot}deg);filter:${DS}" viewBox="0 0 480 44"><path d="M2 22 L48 5 L48 39 Z" fill="#f1d3a3"/><path d="M2 22 L16 16.8 L16 27.2 Z" fill="#3d3b42"/><rect x="48" y="5" width="330" height="34" fill="#ffc83a"/><rect x="48" y="5" width="330" height="9" fill="#ffe487"/><rect x="48" y="30" width="330" height="9" fill="#d98e00"/><rect x="378" y="3" width="42" height="38" fill="#b9bec7"/><path d="M386 3v38M394 3v38M402 3v38M410 3v38" stroke="#7d8490" stroke-width="2"/><rect x="420" y="5" width="48" height="34" rx="9" fill="#ff8fc1"/></svg>`
const eraser = (w, rot, x, y) => `<svg style="position:absolute;left:${x}px;top:${y}px;width:${w}px;transform:rotate(${rot}deg);filter:${DS}" viewBox="0 0 170 76"><rect x="4" y="8" width="162" height="62" rx="10" fill="#cfc8ba"/><rect x="4" y="3" width="162" height="62" rx="10" fill="#f7f2e7"/><rect x="52" y="3" width="66" height="62" fill="#2b79d8"/><rect x="52" y="3" width="66" height="10" fill="#5b9be9"/><path d="M62 34h46M62 44h30" stroke="#f7f2e7" stroke-width="4" stroke-linecap="round"/></svg>`

const thumbHtml = `<!doctype html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box;margin:0;padding:0}html,body{width:720px;height:900px;overflow:hidden}
.mat{position:absolute;inset:0;background-color:#2d6b57;background-image:linear-gradient(112deg,transparent 49.6%,rgba(255,255,255,.1) 49.8%,transparent 50.2%),linear-gradient(rgba(255,255,255,.2) 2px,transparent 2px),linear-gradient(90deg,rgba(255,255,255,.2) 2px,transparent 2px),linear-gradient(rgba(255,255,255,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.1) 1px,transparent 1px);background-size:560px 460px,100px 100px,100px 100px,20px 20px,20px 20px;box-shadow:inset 0 0 110px rgba(15,50,38,.85)}
.grain{position:absolute;inset:0;mix-blend-mode:multiply;opacity:.4;background-image:url("data:image/svg+xml,${grain(0.9, 1.0)}")}</style></head><body>
<div class="mat"></div>
<div style="position:absolute;left:70px;top:52px;width:610px;height:818px;transform:rotate(-3.4deg);filter:${DS}">
  <div style="position:absolute;left:-26px;top:10px;width:640px;height:812px;background:#16151a;border-radius:10px"></div>
  <div style="position:absolute;left:0;top:10px;width:622px;height:812px;background:repeating-linear-gradient(0deg,#e9dfc6 0 2px,#cdbf9b 2px 3px);border-radius:3px"></div>
  <img src="${book('p-04')}" style="position:absolute;left:0;top:0;width:610px;height:813px;border-radius:2px" alt="">
  <div style="position:absolute;right:0;top:0;width:60px;height:813px;background:linear-gradient(270deg,rgba(60,38,18,.42),rgba(60,38,18,0))"></div>
</div>
${pencil(420, -14, 168, 770)}
${eraser(150, 12, 520, 756)}
<div class="grain"></div></body></html>`

const peekHtml = `<!doctype html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box;margin:0;padding:0}html,body{width:560px;height:720px;overflow:hidden;background:transparent}</style></head><body>
<div style="position:absolute;left:40px;top:40px;width:460px;height:610px;filter:drop-shadow(6px 0 0 #fbf6ea) drop-shadow(-6px 0 0 #fbf6ea) drop-shadow(0 6px 0 #fbf6ea) drop-shadow(0 -6px 0 #fbf6ea) drop-shadow(4px 4px 0 #fbf6ea) drop-shadow(-4px -4px 0 #fbf6ea) drop-shadow(4px -4px 0 #fbf6ea) drop-shadow(-4px 4px 0 #fbf6ea)">
  <div style="position:absolute;left:440px;top:8px;width:16px;height:594px;background:repeating-linear-gradient(90deg,#efe6cf 0 2px,#c9bb96 2px 3px);border-radius:0 3px 3px 0"></div>
  <div style="position:absolute;left:8px;top:588px;width:440px;height:16px;background:repeating-linear-gradient(0deg,#efe6cf 0 2px,#c9bb96 2px 3px);border-radius:0 0 3px 3px"></div>
  <img src="${book('cover')}" style="position:absolute;left:0;top:0;width:446px;height:595px;border-radius:7px 9px 9px 7px" alt="">
</div></body></html>`

const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args: ['--allow-file-access-from-files', '--disable-web-security'] })
for (const [name, html, w, h, transparent] of [
  ['thumb', thumbHtml, 720, 900, false],
  ['peek', peekHtml, 560, 720, true],
]) {
  const file = path.join(build, `${name}.html`)
  fs.writeFileSync(file, html)
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
  const pg = await ctx.newPage()
  await pg.goto(pathToFileURL(file).href, { waitUntil: 'load' })
  await pg.evaluate(async () => {
    await Promise.all([...document.images].map((i) => i.decode().catch(() => {})))
  })
  await pg.waitForTimeout(250)
  await pg.screenshot({ path: path.join(build, `${name}.png`), omitBackground: transparent })
  console.log(name, 'done')
  await ctx.close()
}
await browser.close()
