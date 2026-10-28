// External link audit. Usage: node tools/audit-links.mjs
// Reads every href in src/lib/works.ts and the literal https:// links in src/**, then requests each URL
// (GET, browser-like headers, 15s timeout) and prints the final status. Amazon and Instagram often answer
// with bot walls (HTTP 200 + interstitial, 403 or 429): those are reported as "bot-wall?" and need a human look.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (/\.(tsx?|css)$/.test(e.name)) out.push(p)
  }
  return out
}

const urls = new Map()
for (const f of walk(path.join(ROOT, 'src'))) {
  const text = fs.readFileSync(f, 'utf8')
  for (const m of text.matchAll(/https?:\/\/[^\s'"`)<>]+/g)) {
    const u = m[0].replace(/[.,;]+$/, '')
    if (/localhost|127\.0\.0\.1|w3\.org|schema\.org|fonts\.g|example\./.test(u)) continue
    if (!urls.has(u)) urls.set(u, path.relative(ROOT, f).replace(/\\/g, '/'))
  }
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
let bad = 0
for (const [url, where] of urls) {
  try {
    const ctl = new AbortController()
    const t = setTimeout(() => ctl.abort(), 15000)
    const res = await fetch(url, { redirect: 'follow', headers: { 'user-agent': UA, 'accept-language': 'en' }, signal: ctl.signal })
    clearTimeout(t)
    const wall = /amazon\.|instagram\./.test(url) && (res.status >= 400 || res.status === 200)
    const flag = res.ok ? (wall ? 'bot-wall?' : 'ok') : wall ? 'bot-wall?' : 'BAD'
    if (flag === 'BAD') bad++
    console.log(`${String(res.status).padEnd(4)} ${flag.padEnd(9)} ${url}  (${where}) -> ${res.url !== url ? res.url : 'same'}`)
  } catch (e) {
    bad++
    console.log(`ERR  BAD       ${url}  (${where}) ${e.name}: ${e.message}`)
  }
}
console.log(`\n${urls.size} links checked, ${bad} problems`)
process.exit(bad ? 1 : 0)
