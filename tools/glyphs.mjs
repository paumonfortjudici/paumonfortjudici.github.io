#!/usr/bin/env node
// glyphs.mjs - font + text  ->  per-glyph SVG outline paths, ready for a stroke-only "pathLength=1" draw-on animation.
//
// Usage
//   node tools/glyphs.mjs <font> "<text>" [more texts...] [options]
//
//   <font>   a .ttf / .otf / .woff file, or a fontsource shorthand
//            fontsource:<id>[:<weight>[:<style>[:<subset>]]]   e.g. fontsource:fraunces:900   fontsource:caprasimo
//            (resolves to node_modules/@fontsource/<id>/files/<id>-<subset>-<weight>-<style>.woff; subset defaults to latin)
//            fontsource-variable:<id>[:<variant>[:<style>[:<subset>]]]   e.g. fontsource-variable:fraunces:full
//            (the variable .woff2; needs `wawoff2` to unpack it, and then --var to choose the instance - see Notes)
//
// Options
//   --var "wght=900,opsz=144,SOFT=100,WONK=1"   instantiate a VARIABLE font at these axis values (opentype.js 2.x).
//                     Variable outlines usually keep overlapping contours: check `warnings` before using them.
//   --size 200        font size in px. Output coordinates are in these px (the viewBox is in the same unit).
//   --tracking 0.02   extra letter-spacing in em (added after every glyph).
//   --upper           upper-case the text first (the template lettering is upper-case only).
//   --no-kern         disable pair kerning (default: kern table / GPOS pair kerning is applied).
//   --pad 12          padding (px) around the ink bbox - leave room for half the stroke width. Default = 0.06 * size.
//   --precision 2     decimals in path data (default 2).
//   --bake            emit `d` / `subpaths` already translated to their final position (no transform needed).
//                     Default: they are local to the glyph origin and you place them with translate(x, baseline).
//   --svg out.svg     also write a standalone preview SVG (stroke only, pathLength=1 on every sub-path);
//   --animate         ...and make that preview play the draw-on animation (CSS, staggered per glyph).
//   --stroke "#e5502f" --stroke-width 3   preview colours (only used with --svg).
//   --dict            DICTIONARY mode: <text> is a character set (default A-Z 0-9 + punctuation + accented caps). Prints
//                     {font,size,capHeight,spaceAdvance,glyphs:{"A":{d,subpaths,advance,bbox}},kerning:{"AV":-7.5}} so the
//                     site can lay out ANY word at runtime with ~12 lines of code (no opentype.js in the bundle):
//                       x=0; for(ch of text){ g=dict.glyphs[ch]; if(!g){x+=dict.spaceAdvance;prev=null;continue}
//                         if(prev) x+=dict.kerning[prev+ch]??0; place(g,x); x+=g.advance+tracking*dict.size; prev=ch }
//   --runtime         (with --dict) emit the COMPACT runtime format used by src/lib/lettering: one entry per glyph,
//                     [advance, x0, y0, x1, y1, path] where `path` is ONE string (absolute `M` per closed contour, then relative
//                     q/c/l/h/v, closed with `z`; split it at "z" to get one self-contained <path> per contour) and `kern`
//                     holds only the pairs inside the character set. With --out file.ts it writes a typed TypeScript module
//                     (`export const <NAME>: LetteringFont`, name from --name, default FONT) so no resolveJsonModule is needed.
//                     Regenerate the site's data with:
//                       node tools/glyphs.mjs fontsource:fraunces:900 "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#():'’&.,!?-" \
//                         --dict --runtime --size 200 --precision 1 --name FRAUNCES_900 --out src/lib/lettering/fraunces900.ts
//   --name NAME       export name for the --runtime TypeScript module (default FONT).
//   --out out.json    write the JSON to a file instead of stdout.   --pretty  indent the JSON.
//   --opentype <dir|file>   where to find opentype.js (see "Finding opentype.js").
//   --nm <dir>        extra node_modules folder to search for @fontsource/* (shorthand lookup).
//
// Output (one text => one object; several texts => an array of objects)
//   {
//     text, font:{family,style,unitsPerEm,ascender,descender,capHeight,xHeight,file}, size, tracking, kerning,
//     viewBox:"0 0 W H", width:W, height:H, baseline:Y,             // glyph transform = translate(x, baseline)
//     glyphs:[{ ch, d, subpaths:[d,d..], x, advance, kern, word }], // visible glyphs only; spaces only move `x`
//     words:[{ text, from, to, x, width }],                         // from/to = glyph index range (inclusive)
//     warnings:[ ... ]                                              // overlapping contours, missing glyphs...
//   }
//   `d` is the whole glyph (all contours). `subpaths` is the same outline split at every closed contour (outer shape,
//   counters) - the same shape as the template's glyphs.json (`d` + `subpaths`), so a component written for that
//   dictionary can draw this output unchanged. Give every sub-path its own pathLength=1: contours then finish together
//   (one <path> holding several contours reveals the short counters first - see notes/typography.md).
//
// React / framer-motion sketch
//   <svg viewBox={data.viewBox} fill="none" stroke="currentColor" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round">
//     {data.glyphs.map((g,i)=>(
//       <g key={i} transform={`translate(${g.x} ${data.baseline})`}>
//         {g.subpaths.map((d,j)=>(
//           <motion.path key={j} d={d} initial={{pathLength:0}} animate={{pathLength:1}}
//                        transition={{duration:.9, delay:i*.07+j*.12, ease:'easeInOut'}} />
//         ))}
//       </g>
//     ))}
//   </svg>
//   (plain CSS: pathLength="1", stroke-dasharray:1, stroke-dashoffset:1 -> 0. Do NOT add vector-effect:non-scaling-stroke:
//    it breaks the dash maths. Scale stroke-width with the rendered width instead.)
//
// Notes
//   * Use a STATIC instance. Variable fonts keep overlapping contours (they show up as stray inner lines once you
//     only stroke the outline). This tool reports them in `warnings` by testing contour intersections.
//   * Always set stroke-linejoin:round (sharp A V M W K corners otherwise grow miter spikes on a thin stroke).
//   * Ligatures / contextual alternates are NOT applied (one glyph per code point) so each letter is drawn alone.
//   * Glyph outlines are filled shapes: stroking them traces both edges of every stem (hollow letters). That is the look
//     of outlined display type, not of a pen-drawn centre line (the template's lettering is centre-line based).
//
// Finding opentype.js / wawoff2 (first hit wins)
//   --opentype <path> | --wawoff2 <path>  ->  $OPENTYPE_JS | $WAWOFF2  ->  normal resolution from tools/ (repo node_modules,
//   i.e. after `npm i -D opentype.js`)  ->  from the current directory.
//   They are only needed when GENERATING the data; the site ships the resulting JSON/TS, not the libraries.
//   wawoff2 is optional: only for .woff2 / fontsource-variable input.

import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

// ---------------------------------------------------------------- args
const BOOL = new Set(['no-kern', 'bake', 'pretty', 'upper', 'animate', 'dict', 'runtime', 'help', 'h'])
const flags = {}
const pos = []
{
  const a = process.argv.slice(2)
  for (let i = 0; i < a.length; i++) {
    const t = a[i]
    if (t.startsWith('--') && t.length > 2) {
      const [k, v] = t.slice(2).split(/=(.*)/s)
      if (v !== undefined) flags[k] = v
      else if (BOOL.has(k)) flags[k] = true
      else flags[k] = a[++i]
    } else pos.push(t)
  }
}
if (flags.help || flags.h || pos.length < (flags.dict ? 1 : 2)) {
  const src = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n')
  console.error(src.slice(1, 86).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'))
  process.exit(!(flags.help || flags.h) ? 2 : 0)
}

// ---------------------------------------------------------------- locate opentype.js (and wawoff2)
function tryLoad(name, candidate) {
  try {
    let target = candidate
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
      // a package folder, or a folder that contains node_modules/<name>
      const inner = path.join(candidate, 'node_modules', name)
      target = fs.existsSync(path.join(candidate, 'package.json')) ? candidate : fs.existsSync(inner) ? inner : candidate
    } else if (!fs.existsSync(candidate)) {
      target = require.resolve(candidate, { paths: [here, process.cwd()] })
    }
    const mod = require(target)
    return mod.parse || mod.decompress ? mod : mod.default
  } catch {
    return null
  }
}
function findPackage(name, flagValue, envValue, required) {
  const list = [flagValue, envValue, name].filter(Boolean)
  for (const c of list) {
    const m = tryLoad(name, c)
    if (m) return m
  }
  if (required) {
    console.error(`glyphs.mjs: cannot find ${name}. Run \`npm i -D ${name}\` in the repo or pass --${name.replace('.js', '')} <dir>.`)
    process.exit(3)
  }
  return null
}
const opentype = findPackage('opentype.js', flags.opentype, process.env.OPENTYPE_JS, true)

// ---------------------------------------------------------------- font file
function nodeModulesDirs() {
  const dirs = []
  if (flags.nm) dirs.push(flags.nm)
  dirs.push(path.join(here, '..', 'node_modules'), path.join(process.cwd(), 'node_modules'))
  return dirs
}
function resolveFont(spec) {
  const m = /^(fontsource|fontsource-variable):/.exec(spec)
  if (!m) return path.resolve(spec)
  const variable = m[1] === 'fontsource-variable'
  const [, id, a = variable ? 'wght' : '400', style = 'normal', subset = 'latin'] = spec.split(':')
  const pkg = variable ? '@fontsource-variable' : '@fontsource'
  const ext = variable ? 'woff2' : 'woff'
  for (const nm of nodeModulesDirs()) {
    const f = path.join(nm, pkg, id, 'files', `${id}-${subset}-${a}-${style}.${ext}`)
    if (fs.existsSync(f)) return f
  }
  console.error(`glyphs.mjs: no ${pkg}/${id} ${ext} for "${a}" (${style}, ${subset}) in ${nodeModulesDirs().join(' | ')}`)
  process.exit(4)
}
const fontFile = resolveFont(pos[0])
let buf = fs.readFileSync(fontFile)
if (/\.woff2$/i.test(fontFile)) {
  const wawoff2 = findPackage('wawoff2', flags.wawoff2, process.env.WAWOFF2, false)
  if (!wawoff2) {
    console.error('glyphs.mjs: .woff2 input needs wawoff2 (`npm i -D wawoff2`), or use the .woff / .ttf (fontsource ships .woff for static weights).')
    process.exit(5)
  }
  buf = Buffer.from(await wawoff2.decompress(buf))
}
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
const useVar = !!flags.var
if (useVar) {
  if (!font.tables.fvar) { console.error('glyphs.mjs: --var given but this font has no fvar table (it is static).'); process.exit(6) }
  const axes = Object.fromEntries(String(flags.var).split(',').map((kv) => kv.split('=')).map(([k, v]) => [k.trim(), Number(v)]))
  font.variation.set(axes)
}

// ---------------------------------------------------------------- helpers
const size = Number(flags.size ?? 200)
const tracking = Number(flags.tracking ?? 0)
const kerning = !flags['no-kern']
const precision = Number(flags.precision ?? 2)
const pad = Number(flags.pad ?? size * 0.06)
const bake = !!flags.bake
const upm = font.unitsPerEm
const scale = size / upm
const r = (n) => {
  const v = Number(n.toFixed(precision))
  return Object.is(v, -0) ? 0 : v
}
const nameOf = (o) => (o && (o.en || Object.values(o)[0])) || ''
const nameField = (k) => nameOf(font.names?.windows?.[k] || font.names?.macintosh?.[k] || font.names?.[k])
// advance + outline of one glyph; for a variable instance (--var) opentype.js needs the font passed in / HVAR applied
// (in a variable instance, getPath(..., font) is also what updates glyph.advanceWidth to the varied advance - HVAR/phantom points)
const pathOf = (g) => (useVar ? g.getPath(0, 0, size, undefined, font) : g.getPath(0, 0, size))
const advOf = (g) => {
  if (useVar) pathOf(g)
  return (g.advanceWidth || 0) * scale
}

function splitContours(cmds) {
  // opentype.js (esp. TrueType) does not always emit Z: split on every M and close each contour ourselves.
  const out = []
  let cur = null
  for (const c of cmds) {
    if (c.type === 'M') {
      if (cur && cur.length > 1) out.push(cur)
      cur = [c]
    } else if (cur && c.type !== 'Z') cur.push(c)
  }
  if (cur && cur.length > 1) out.push(cur)
  return out.map(closeContour)
}
// drop zero-length segments and a final L that only returns to the start, then close with Z
function closeContour(cmds) {
  const out = []
  let cx = null, cy = null, sx = null, sy = null
  for (const c of cmds) {
    if (c.type === 'M') { sx = c.x; sy = c.y; cx = c.x; cy = c.y; out.push(c); continue }
    if (c.type === 'L' && Math.abs(c.x - cx) < 1e-6 && Math.abs(c.y - cy) < 1e-6) continue
    out.push(c)
    cx = c.x; cy = c.y
  }
  const last = out[out.length - 1]
  if (out.length > 2 && last.type === 'L' && Math.abs(last.x - sx) < 1e-6 && Math.abs(last.y - sy) < 1e-6) out.pop()
  out.push({ type: 'Z' })
  return out
}
function contourToD(cmds, dx = 0, dy = 0) {
  let s = ''
  for (const c of cmds) {
    if (c.type === 'M' || c.type === 'L') s += `${c.type}${r(c.x + dx)} ${r(c.y + dy)}`
    else if (c.type === 'C') s += `C${r(c.x1 + dx)} ${r(c.y1 + dy)} ${r(c.x2 + dx)} ${r(c.y2 + dy)} ${r(c.x + dx)} ${r(c.y + dy)}`
    else if (c.type === 'Q') s += `Q${r(c.x1 + dx)} ${r(c.y1 + dy)} ${r(c.x + dx)} ${r(c.y + dy)}`
    else if (c.type === 'Z') s += 'Z'
  }
  return s
}
// ---- compact encoding (runtime format): absolute M, then relative q/c/l/h/v, closed with z -------------------------------
// All arithmetic happens on integers (value * 10^precision) so the relative deltas add up exactly to the rounded absolutes.
const SCALE = 10 ** precision
const toInt = (v) => Math.sign(v) * Math.round(Math.abs(v) * SCALE) // symmetric rounding: same result as toFixed()
function numStr(i) {
  let s = (i / SCALE).toFixed(precision).replace(/\.?0+$/, '')
  if (s === '' || s === '-' || s === '-0') s = '0'
  if (s.startsWith('0.')) s = s.slice(1)
  else if (s.startsWith('-0.')) s = '-' + s.slice(2)
  return s
}
function contourToCompact(cmds) {
  let out = ''
  let last = '' // last command letter written
  let lastNum = '' // text of the last number written (to decide separators)
  const emitNums = (ints) => {
    for (const i of ints) {
      const s = numStr(i)
      if (lastNum === '') {
        out += s
      } else if (s[0] === '-') {
        out += s
      } else if (s[0] === '.' && lastNum.includes('.')) {
        out += s
      } else {
        out += ' ' + s
      }
      lastNum = s
    }
  }
  const letter = (c) => {
    if (last === c) return false // implicit repeat
    out += c
    last = c
    lastNum = ''
    return true
  }
  let cx = 0, cy = 0, sx = 0, sy = 0
  for (const c of cmds) {
    if (c.type === 'M') {
      const x = toInt(c.x), y = toInt(c.y)
      letter('M'); last = '' // an absolute M is never repeated implicitly
      emitNums([x, y])
      cx = sx = x; cy = sy = y
    } else if (c.type === 'L') {
      const x = toInt(c.x), y = toInt(c.y)
      const dx = x - cx, dy = y - cy
      if (dy === 0) { letter('h'); emitNums([dx]) }
      else if (dx === 0) { letter('v'); emitNums([dy]) }
      else { letter('l'); emitNums([dx, dy]) }
      cx = x; cy = y
    } else if (c.type === 'Q') {
      const x1 = toInt(c.x1), y1 = toInt(c.y1), x = toInt(c.x), y = toInt(c.y)
      letter('q'); emitNums([x1 - cx, y1 - cy, x - cx, y - cy])
      cx = x; cy = y
    } else if (c.type === 'C') {
      const x1 = toInt(c.x1), y1 = toInt(c.y1), x2 = toInt(c.x2), y2 = toInt(c.y2), x = toInt(c.x), y = toInt(c.y)
      letter('c'); emitNums([x1 - cx, y1 - cy, x2 - cx, y2 - cy, x - cx, y - cy])
      cx = x; cy = y
    } else if (c.type === 'Z') {
      letter('z'); last = ''; lastNum = ''
      cx = sx; cy = sy
    }
  }
  return out
}

// flatten a contour into a polyline (for overlap tests + bbox)
function flatten(cmds) {
  const pts = []
  let cx = 0, cy = 0
  for (const c of cmds) {
    if (c.type === 'M' || c.type === 'L') { pts.push([c.x, c.y]); cx = c.x; cy = c.y }
    else if (c.type === 'Q') {
      for (let i = 1; i <= 10; i++) { const t = i / 10, u = 1 - t; pts.push([u * u * cx + 2 * u * t * c.x1 + t * t * c.x, u * u * cy + 2 * u * t * c.y1 + t * t * c.y]) }
      cx = c.x; cy = c.y
    } else if (c.type === 'C') {
      for (let i = 1; i <= 14; i++) {
        const t = i / 14, u = 1 - t
        pts.push([u * u * u * cx + 3 * u * u * t * c.x1 + 3 * u * t * t * c.x2 + t * t * t * c.x, u * u * u * cy + 3 * u * u * t * c.y1 + 3 * u * t * t * c.y2 + t * t * t * c.y])
      }
      cx = c.x; cy = c.y
    }
  }
  return pts
}
const area = (p) => { let a = 0; for (let i = 0; i < p.length; i++) { const [x1, y1] = p[i], [x2, y2] = p[(i + 1) % p.length]; a += x1 * y2 - x2 * y1 } return a / 2 }
const bboxOf = (p) => p.reduce((b, [x, y]) => [Math.min(b[0], x), Math.min(b[1], y), Math.max(b[2], x), Math.max(b[3], y)], [Infinity, Infinity, -Infinity, -Infinity])
const bboxHit = (a, b) => a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1]
function segHit(p1, p2, p3, p4) {
  const d = (p2[0] - p1[0]) * (p4[1] - p3[1]) - (p2[1] - p1[1]) * (p4[0] - p3[0])
  if (Math.abs(d) < 1e-9) return false
  const t = ((p3[0] - p1[0]) * (p4[1] - p3[1]) - (p3[1] - p1[1]) * (p4[0] - p3[0])) / d
  const u = ((p3[0] - p1[0]) * (p2[1] - p1[1]) - (p3[1] - p1[1]) * (p2[0] - p1[0])) / d
  return t > 0.001 && t < 0.999 && u > 0.001 && u < 0.999
}
function inside(pt, poly) {
  let c = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j]
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c
  }
  return c
}
// true overlap = two contours of ONE glyph whose outlines cross, or a same-winding contour nested inside another.
function findOverlap(polys) {
  const info = polys.map((p) => ({ p, a: area(p), b: bboxOf(p) }))
  for (let i = 0; i < info.length; i++) {
    for (let j = i + 1; j < info.length; j++) {
      const A = info[i], B = info[j]
      if (!bboxHit(A.b, B.b)) continue
      for (let s = 0; s < A.p.length; s += 1) {
        const a1 = A.p[s], a2 = A.p[(s + 1) % A.p.length]
        for (let t = 0; t < B.p.length; t += 1) {
          if (segHit(a1, a2, B.p[t], B.p[(t + 1) % B.p.length])) return `contours ${i} and ${j} cross`
        }
      }
      if (Math.sign(A.a) === Math.sign(B.a)) {
        if (inside(B.p[0], A.p) || inside(A.p[0], B.p)) return `contour ${j} nested inside ${i} with the same winding`
      }
    }
  }
  return null
}

// ---------------------------------------------------------------- layout one text
function build(rawText) {
  const text = flags.upper ? rawText.toUpperCase() : rawText
  const warnings = []
  const placed = []
  let pen = 0
  let prev = null
  let word = -1
  let inWord = false
  const wordsRaw = []
  for (const ch of Array.from(text)) {
    const g = font.charToGlyph(ch)
    const isSpace = /\s/.test(ch)
    if (g.index === 0 && !isSpace) warnings.push(`font has no glyph for "${ch}" (U+${ch.codePointAt(0).toString(16).toUpperCase()}); .notdef would be drawn`)
    let kern = 0
    if (kerning && prev && !isSpace) {
      try { kern = (font.getKerningValue(prev, g) || 0) * scale } catch { kern = 0 }
    }
    pen += kern
    if (isSpace) {
      inWord = false
    } else {
      if (!inWord) { word += 1; inWord = true; wordsRaw.push({ chars: '' }) }
      wordsRaw[word].chars += ch
      placed.push({ ch, g, x: pen, kern: r(kern), word, adv: advOf(g, ch) })
    }
    pen += advOf(g, ch) + tracking * size
    prev = isSpace ? null : g
  }
  const totalAdvance = pen - tracking * size

  // outlines at origin (baseline y=0, y down)
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  const items = placed.map((p) => {
    const gp = pathOf(p.g)
    const contours = splitContours(gp.commands)
    const polys = contours.map(flatten)
    const warn = findOverlap(polys)
    if (warn) warnings.push(`"${p.ch}": overlapping contours (${warn}) - outline will show extra inner lines; use a static, overlap-free instance`)
    for (const poly of polys) {
      const [x0, y0, x1, y1] = bboxOf(poly)
      minX = Math.min(minX, p.x + x0); minY = Math.min(minY, y0); maxX = Math.max(maxX, p.x + x1); maxY = Math.max(maxY, y1)
    }
    return { p, contours }
  })
  if (!isFinite(minX)) { minX = 0; minY = -size; maxX = totalAdvance; maxY = 0 }
  const shiftX = pad - minX
  const baseline = pad - minY
  const width = r(maxX - minX + 2 * pad)
  const height = r(maxY - minY + 2 * pad)

  const glyphs = items.map(({ p, contours }) => {
    const x = p.x + shiftX
    const dx = bake ? x : 0
    const dy = bake ? baseline : 0
    const subpaths = contours.map((c) => contourToD(c, dx, dy))
    return { ch: p.ch, d: subpaths.join(''), subpaths, x: r(x), advance: r(p.adv), kern: p.kern, word: p.word }
  })
  const words = wordsRaw.map((w, i) => {
    const idx = glyphs.map((g, k) => (g.word === i ? k : -1)).filter((k) => k >= 0)
    const first = glyphs[idx[0]], last = glyphs[idx[idx.length - 1]]
    return { text: w.chars, from: idx[0], to: idx[idx.length - 1], x: first.x, width: r(last.x + last.advance - first.x) }
  })
  return {
    text,
    font: {
      family: nameField('preferredFamily') || nameField('fontFamily'),
      style: nameField('preferredSubfamily') || nameField('fontSubfamily'),
      unitsPerEm: upm,
      ascender: font.ascender,
      descender: font.descender,
      capHeight: font.tables.os2?.sCapHeight ?? null,
      xHeight: font.tables.os2?.sxHeight ?? null,
      file: path.basename(fontFile),
      ...(useVar ? { variation: font.variation.get() } : {}),
    },
    size,
    tracking,
    kerning,
    viewBox: `0 0 ${width} ${height}`,
    width,
    height,
    baseline: r(baseline),
    baked: bake,
    glyphs,
    words,
    warnings,
  }
}

// ---------------------------------------------------------------- dictionary mode
const DEFAULT_SET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'’:;.,!?&-–—+/()#@%*·ÀÁÈÉÍÒÓÚÇÑÜÏ"
function buildDict(set) {
  const warnings = []
  const chars = Array.from(new Set(Array.from(set).filter((c) => !/\s/.test(c))))
  const glyphs = {}
  const compactGlyphs = {}
  const gl = {}
  for (const ch of chars) {
    const g = font.charToGlyph(ch)
    if (g.index === 0) { warnings.push(`font has no glyph for "${ch}" (U+${ch.codePointAt(0).toString(16).toUpperCase()}) - skipped`); continue }
    gl[ch] = g
    const contours = splitContours(pathOf(g).commands)
    const polys = contours.map(flatten)
    const warn = findOverlap(polys)
    if (warn) warnings.push(`"${ch}": overlapping contours (${warn})`)
    const subpaths = contours.map((c) => contourToD(c))
    const all = polys.flat()
    const bb = all.length ? bboxOf(all) : [0, 0, 0, 0]
    glyphs[ch] = { d: subpaths.join(''), subpaths, advance: r(advOf(g, ch)), bbox: bb.map(r) }
    if (flags.runtime) compactGlyphs[ch] = [r(advOf(g, ch)), ...bb.map(r), contours.map(contourToCompact).join('')]
  }
  const kerningMap = {}
  if (kerning) {
    for (const a of Object.keys(gl)) {
      for (const b of Object.keys(gl)) {
        let k = 0
        try { k = (font.getKerningValue(gl[a], gl[b]) || 0) * scale } catch { k = 0 }
        if (Math.abs(k) >= 0.05) kerningMap[a + b] = Number(k.toFixed(2))
      }
    }
  }
  const space = font.charToGlyph(' ')
  if (flags.runtime) {
    return {
      font: `${nameField('preferredFamily') || nameField('fontFamily')} (${path.basename(fontFile)}, static instance)`,
      size,
      cap: font.tables.os2?.sCapHeight != null ? r(font.tables.os2.sCapHeight * scale) : 0,
      space: r(advOf(space, ' ') || upm * 0.25 * scale),
      glyphs: compactGlyphs,
      kern: kerningMap,
      warnings,
    }
  }
  return {
    dictionary: true,
    font: {
      family: nameField('preferredFamily') || nameField('fontFamily'),
      style: nameField('preferredSubfamily') || nameField('fontSubfamily'),
      unitsPerEm: upm, file: path.basename(fontFile),
    },
    size,
    capHeight: font.tables.os2?.sCapHeight != null ? r(font.tables.os2.sCapHeight * scale) : null,
    ascender: r(font.ascender * scale),
    descender: r(font.descender * scale),
    spaceAdvance: r(advOf(space, ' ') || upm * 0.25 * scale),
    note: 'y is down, baseline = 0 (ascenders negative). place a glyph with translate(x, baseline). kerning keys are char pairs, values in the same px units.',
    glyphs,
    kerning: kerningMap,
    warnings,
  }
}

// ---------------------------------------------------------------- run
const texts = pos.slice(1)
const results = flags.dict ? [buildDict(texts.length ? texts.join('') : DEFAULT_SET)] : texts.map(build)
const payload = results.length === 1 ? results[0] : results
let json = JSON.stringify(payload, null, flags.pretty ? 2 : 0)
const asTs = !!(flags.runtime && flags.dict && flags.out && /\.ts$/i.test(flags.out))
if (asTs) {
  const { warnings: _w, ...data } = payload
  const name = flags.name || 'FONT'
  json =
    `// GENERATED by tools/glyphs.mjs (--dict --runtime). Do not edit by hand; see the header of that file to regenerate.\n` +
    `// Outline lettering data for <StrokeWord>: static ${payload.font}. Units: 1 em = ${payload.size} units, y down, baseline = 0.\n` +
    `// glyphs[ch] = [advance, x0, y0, x1, y1, path]. path = absolute M + relative q/c/l/h/v per closed contour, "z" ends a contour.\n` +
    `export interface LetteringFont {\n  font: string\n  size: number\n  cap: number\n  space: number\n` +
    `  glyphs: Record<string, [number, number, number, number, number, string]>\n  kern: Record<string, number>\n}\n\n` +
    `export const ${name}: LetteringFont = ${JSON.stringify(data)}\n`
}

if (flags.svg && !flags.dict) {
  const stroke = flags.stroke ?? '#e5502f'
  const sw = flags['stroke-width'] ?? Math.max(1.5, size / 70)
  const res = results[0]
  const body = res.glyphs
    .map((g, i) => {
      const t = bake ? '' : ` transform="translate(${g.x} ${res.baseline})"`
      return `<g${t}>` + g.subpaths.map((d, j) => `<path d="${d}" pathLength="1"${flags.animate ? ` style="animation-delay:${(i * 0.07 + j * 0.1).toFixed(2)}s"` : ''}/>`).join('') + '</g>'
    })
    .join('\n  ')
  const anim = flags.animate
    ? `\n <style>path{stroke-dasharray:1;stroke-dashoffset:1;animation:d 1.1s cubic-bezier(.65,0,.25,1) forwards}@keyframes d{to{stroke-dashoffset:0}}@media(prefers-reduced-motion:reduce){path{animation:none;stroke-dashoffset:0}}</style>`
    : ''
  fs.writeFileSync(
    flags.svg,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${res.viewBox}" width="${res.width}" height="${res.height}">${anim}\n` +
      ` <g fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round">\n  ${body}\n </g>\n</svg>\n`,
  )
}
if (flags.out) {
  fs.mkdirSync(path.dirname(path.resolve(flags.out)), { recursive: true })
  fs.writeFileSync(flags.out, json)
  const w = results.flatMap((x) => x.warnings)
  const count = results.reduce((n, x) => n + (Array.isArray(x.glyphs) ? x.glyphs.length : Object.keys(x.glyphs).length), 0)
  console.error(`glyphs.mjs: wrote ${flags.out} (${json.length} bytes, ${count} glyphs)${w.length ? ` - ${w.length} warning(s): ${w.slice(0, 3).join(' / ')}` : ''}`)
} else {
  process.stdout.write(json + '\n')
}
