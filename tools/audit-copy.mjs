// Source-level copy and hygiene audit. Usage: node tools/audit-copy.mjs [--json]
// Scans src/**, index.html and public/**/*.json for things that must never ship:
// Chinese characters, template leftovers, placeholder copy, third-party contact data, banned buzzwords,
// raw hex colours in shell components and a count of em dashes per file.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const json = process.argv.includes('--json')

const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

const files = [...walk(path.join(ROOT, 'src')), path.join(ROOT, 'index.html')].filter((f) => /\.(tsx?|css|html|json)$/.test(f))

const RULES = [
  { id: 'chinese', re: /[㐀-鿿豈-﫿]/, sev: 'FAIL', note: 'CJK characters' },
  { id: 'template-name', re: /Aoi|Lin\b|Palm Studio|Tide Notes|Lumen Mall|Northwind/, sev: 'FAIL', note: 'template leftovers' },
  { id: 'lorem', re: /lorem ipsum|dolor sit amet/i, sev: 'FAIL', note: 'lorem ipsum' },
  { id: 'placeholder', re: /under construction|placeholder text|coming soon|TODO|FIXME|XXX/i, sev: 'WARN', note: 'unfinished marker' },
  { id: 'buzzword', re: /\b(passionate|elevate|unlock|seamless|cutting-edge|world-class|leverage|synergy|game-changing|revolutionary)\b/i, sev: 'WARN', note: 'buzzword' },
  { id: 'learn-more', re: /\b(learn more|get started|click here)\b/i, sev: 'WARN', note: 'generic CTA' },
  { id: 'third-party-contact', re: /(Rudy Kore|Lidia Judici|Alfou|Salvatella)/, sev: 'FAIL', note: 'third-party personal data' },
  { id: 'phone-or-email', re: /(?<![\w.])(?:\+?\d[\d ]{8,}\d)(?![\w])|[\w.+-]+@[\w-]+\.[\w.-]+/g, sev: 'INFO', note: 'phone/e-mail literal (allowed only for Pau)' },
  { id: 'system-font', re: /font-family:\s*(system-ui|Arial|Helvetica|sans-serif)\s*[;}]/i, sev: 'WARN', note: 'system font as the only family' },
  { id: 'console', re: /console\.(log|debug)\(/, sev: 'WARN', note: 'console call' },
]

const ALLOWED_CONTACT = /paumonfortjudici@gmail\.com|pau@planadigital\.cat|\+?34\s?697\s?512\s?258|34697512258/

const results = []
for (const f of files) {
  const rel = path.relative(ROOT, f).replace(/\\/g, '/')
  const text = fs.readFileSync(f, 'utf8')
  const lines = text.split(/\r?\n/)
  lines.forEach((line, i) => {
    for (const r of RULES) {
      const re = new RegExp(r.re.source, r.re.flags.replace('g', ''))
      const m = line.match(re)
      if (!m) continue
      if (r.id === 'phone-or-email') {
        const all = [...line.matchAll(new RegExp(r.re.source, 'g'))].map((x) => x[0]).filter((x) => !ALLOWED_CONTACT.test(x))
        const real = all.filter((x) => x.includes('@') || x.replace(/\D/g, '').length >= 9)
        if (!real.length) continue
      }
      results.push({ file: rel, line: i + 1, rule: r.id, sev: r.sev, note: r.note, text: line.trim().slice(0, 140) })
    }
  })
  const dashes = (text.match(/—/g) || []).length
  if (dashes > 6 && /\.tsx$/.test(f)) results.push({ file: rel, line: 0, rule: 'em-dash', sev: 'INFO', note: dashes + ' em dashes in file (visible copy: keep to 2 per page)', text: '' })
  if (/\.tsx$/.test(f) && !/worlds\//.test(rel)) {
    const hex = (text.match(/#[0-9a-fA-F]{6}\b/g) || []).length
    if (hex) results.push({ file: rel, line: 0, rule: 'raw-hex-in-shell', sev: 'WARN', note: hex + ' raw hex colours in a shell component (use tokens)', text: '' })
  }
}

const order = { FAIL: 0, WARN: 1, INFO: 2 }
results.sort((a, b) => order[a.sev] - order[b.sev] || a.file.localeCompare(b.file) || a.line - b.line)
if (json) console.log(JSON.stringify(results, null, 1))
else {
  const counts = results.reduce((c, r) => ((c[r.sev] = (c[r.sev] || 0) + 1), c), {})
  for (const r of results) console.log(`${r.sev.padEnd(4)} ${r.file}:${r.line} [${r.rule}] ${r.note} :: ${r.text}`)
  console.log(`\nfiles scanned: ${files.length}  FAIL ${counts.FAIL || 0}  WARN ${counts.WARN || 0}  INFO ${counts.INFO || 0}`)
}
process.exit(results.some((r) => r.sev === 'FAIL') ? 1 : 0)
