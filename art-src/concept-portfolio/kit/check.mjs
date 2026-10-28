// QA linter for a finished (or in-progress) slide.   node kit/check.mjs slide-1.svg [slide-2.svg ...]
// Checks: kit block present; every href="#id" / url(#id) resolves; colours are tokens (kit/tokens.css) only; no gradients / images / rgb() / hsl();
// fonts are Anybody / Syne / DM Sans only; no text under 18 px; number of filtered groups; source size (< 200 KB).
// Exit code 1 if any ERROR; WARN lines are judgement calls.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const tokens = fs.readFileSync(path.join(HERE, 'tokens.css'), 'utf8')
const allowed = new Set([...tokens.matchAll(/#[0-9a-fA-F]{6}\b/g)].map((m) => m[0].toUpperCase()))
// colours that exist only inside the Ona symbols are all tokens too, nothing extra is allowed. Pure white / black are NOT allowed (use paper / ink).
let bad = 0
for (const file of process.argv.slice(2)) {
  const svg = fs.readFileSync(file, 'utf8')
  const errs = [], warns = []
  const m = svg.match(/<!--KIT:BEGIN[\s\S]*?<!--KIT:END-->/)
  if (!m) errs.push('no <!--KIT:BEGIN--> ... <!--KIT:END--> block: run node kit/inline-kit.mjs on this file')
  let body = svg.replace(/<!--KIT:BEGIN[\s\S]*?<!--KIT:END-->/, '').replace(/<!--[\s\S]*?-->/g, '')
  // drop the layout-guides overlay (balanced <g id="guides"> ... </g>): its magenta is allowed
  const gi = body.indexOf('<g id="guides"')
  if (gi >= 0) {
    let depth = 0, i = gi
    const re = /<g\b|<\/g>/g
    re.lastIndex = gi
    let mm
    while ((mm = re.exec(body))) { depth += mm[0] === '</g>' ? -1 : 1; if (depth === 0) { i = mm.index + 4; break } }
    body = body.slice(0, gi) + body.slice(i)
    if (/display="inline"/.test(svg.slice(gi, gi + 120))) warns.push('the guides overlay is visible (display="inline"): set display="none" before the final export')
  }
  // references
  const ids = new Set([...svg.matchAll(/\sid="([^"]+)"/g)].map((x) => x[1]))
  const missing = new Set()
  for (const r of body.matchAll(/(?:href="#|url\(#)([^")]+)/g)) if (!ids.has(r[1])) missing.add(r[1])
  if (missing.size) errs.push(`unresolved references (re-run node kit/inline-kit.mjs, or typo): ${[...missing].join(', ')}`)
  // colours
  const off = new Map()
  for (const c of body.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
    const raw = c[0]
    if (/^#[0-9a-fA-F]{6}$/.test(raw)) { if (!allowed.has(raw.toUpperCase())) off.set(raw.toUpperCase(), (off.get(raw.toUpperCase()) || 0) + 1) }
    else if (/^#[0-9a-fA-F]{3}$/.test(raw) || /^#[0-9a-fA-F]{8}$/.test(raw)) off.set(raw, (off.get(raw) || 0) + 1)
  }
  if (off.size) errs.push('colours that are not tokens: ' + [...off].map(([k, v]) => `${k} x${v}`).join(', ') + '  (guides layer #FF00AA is only allowed inside <g id="guides">)')
  if (/rgba?\(|hsla?\(/.test(body)) errs.push('rgb()/hsl() colours are not allowed, use tokens')
  if (/<(linearGradient|radialGradient|pattern)\b/.test(body)) errs.push('gradients / patterns are not allowed in slide art (flat + halftone only); the kit tone-* masks are the only gradients')
  if (/<image\b/.test(body)) errs.push('<image> is not allowed: author everything as vector shapes')
  // fonts
  for (const f of body.matchAll(/font-family\s*[:=]\s*["']?([^;"'>]+)/g)) if (!/Anybody|Syne|DM Sans|sans-serif|^\s*$/.test(f[1])) errs.push('foreign font: ' + f[1].trim())
  const small = [...body.matchAll(/font-size\s*[:=]\s*"?(\d+(?:\.\d+)?)/g)].map((x) => Number(x[1])).filter((n) => n < 18)
  if (small.length) warns.push(`text under 18 px found (${small.join(', ')}): only allowed for decorative micro-labels`)
  // filters
  const fcount = [...body.matchAll(/filter="url\(#([^)]+)\)"/g)].length
  if (fcount > 16) warns.push(`${fcount} filtered elements: keep <= 14-16 (render time, 260 KB WebP budget); group objects instead of filtering each path`)
  const kb = Buffer.byteLength(svg) / 1024
  if (kb > 200) errs.push(`source is ${kb.toFixed(0)} KB (> 200 KB): simplify paths / re-run inline-kit (prunes unused kit pieces)`)
  else if (kb > 170) warns.push(`source is ${kb.toFixed(0)} KB (limit 200)`)
  console.log(`${file}: ${kb.toFixed(1)} KB, ${fcount} filtered elements, ${ids.size} ids`)
  errs.forEach((e) => console.log('  ERROR ' + e))
  warns.forEach((w) => console.log('  WARN  ' + w))
  if (!errs.length && !warns.length) console.log('  clean')
  bad += errs.length
}
process.exit(bad ? 1 : 0)
