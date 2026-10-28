// sticker-lib.mjs - the shared "frame" of every doodle sticker (styles, filters, halo, grain, assembly).
//
//   import { createSticker } from './kit/sticker-lib.mjs'
//   import { smooth, limb, blob, ... } from './kit/pen.mjs'
//
//   const st = createSticker({ title: 'Boombox ollie', accent: '#C6B1FE', seed: 7, root: 'translate(7,-25)' })
//   const { shape, use, line, fillp, raw, clip, group, S } = st
//   group('leg', () => { shape('leg', S(points, { closed: true })); use('leg') })   // fill + ink outline, also feeds the halo
//   st.write('sticker-01.svg')
//
// What it guarantees (so 9 stickers built by different hands still look like one family):
//   * canvas 1200 x 1600, transparent unless bg:true, ids are namespaced, everything inline (no external refs)
//   * the same 3 ink weights (contour 10 / interior 9 / detail 7 px at 1600 px height), round caps + joins
//   * the same halo (die-cut border): every shape registered with shape(..) is dilated 38 px, then smoothed
//   * the same low-frequency hand wobble on the whole line art and the same subtle paper grain
import fs from 'node:fs'
import { smooth } from './pen.mjs'

export const DEFAULTS = {
  accent: '#C6B1FE',          // the one flat colour of the sticker (clothes, skin, props AND the halo)
  ink: '#0C0A10',
  paper: '#FFEFDF',           // tiny highlights only: eye glints, teeth, soles, pages...
  seed: 7,                    // wobble seed: give every sticker its own
  haloWidth: 76,              // = 2 x 38 px halo: the stroke width of the dilation
  wobble: { freq: 0.006, scale: 9 },
  grainOpacity: 0.16,
}

/** the shared stylesheet: every class used by the stickers and by the kit symbols */
export function styleBlock({ accent, ink, paper }) {
  return `<style>
/* palette: ink ${ink} / accent ${accent} / paper ${paper}  (recolour = replace the accent hex everywhere) */
.fa{fill:${accent}} .fi{fill:${ink}} .fp{fill:${paper}}
.k{stroke:${ink};stroke-width:10;stroke-linecap:round;stroke-linejoin:round}
.k2{fill:none;stroke:${ink};stroke-width:9;stroke-linecap:round;stroke-linejoin:round}
.k3{fill:none;stroke:${ink};stroke-width:7;stroke-linecap:round;stroke-linejoin:round}
.k3f{stroke:${ink};stroke-width:7;stroke-linecap:round;stroke-linejoin:round}
.st{fill:none;stroke:${ink};stroke-width:6;stroke-linecap:round;stroke-dasharray:1 14}
.sh{fill:none;stroke:${accent};stroke-width:7;stroke-linecap:round}
.pp{fill:none;stroke:${paper};stroke-width:7;stroke-linecap:round}
.tube-k{fill:none;stroke:${ink};stroke-width:28;stroke-linecap:round;stroke-linejoin:round}
.tube-a{fill:none;stroke:${accent};stroke-width:9;stroke-linecap:round;stroke-linejoin:round}
</style>`
}

/** the three filters of the recipe (halo smoothing, hand wobble, paper grain) */
export function filterDefs({ wobble, seed }, region = { x: -100, y: -100, width: 1400, height: 1800 }) {
  const R = `filterUnits="userSpaceOnUse" x="${region.x}" y="${region.y}" width="${region.width}" height="${region.height}"`
  return `<!-- HALO: shapes dilated by a round stroke, then blurred + thresholded => rounded, closed-up die-cut border -->
<filter id="halo-smooth" ${R} color-interpolation-filters="sRGB">
  <feGaussianBlur stdDeviation="13"/>
  <feComponentTransfer><feFuncA type="linear" slope="18" intercept="-7.5"/></feComponentTransfer>
</filter>
<!-- WOBBLE: slow (wavelength ~165 px), +-1-2 px displacement of the whole line art = hand-drawn feel without jitter -->
<filter id="wobble" ${R} color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency="${wobble.freq}" numOctaves="1" seed="${seed}" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="${wobble.scale}" xChannelSelector="R" yChannelSelector="G"/>
</filter>
<!-- GRAIN: fine ink speckle, clipped to the die-cut with a mask that repeats the halo -->
<filter id="grain" filterUnits="userSpaceOnUse" x="0" y="0" width="1200" height="1600" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="${seed + 4}" result="n"/>
  <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.047  0 0 0 0 0.039  0 0 0 0 0.063  3.4 0 0 0 -1.9"/>
</filter>`
}

export function createSticker(opts = {}) {
  const cfg = {
    title: 'Doodle sticker',
    desc: '',
    root: 'translate(0,0)',     // final fit transform (translate/scale) that centres the die-cut in the safe area
    bg: false,                  // true = paint a paper-coloured backdrop (for previews only, never for finals)
    grain: true,
    fx: true,                   // false = no filters (fast draft renders)
    ...DEFAULTS,
    ...opts,
  }
  if (process.env.FX === '0') cfg.fx = false
  if (process.env.BG === '1') cfg.bg = true
  if (process.env.GRAIN === '0') cfg.grain = false

  const defs = [], art = [], sil = []
  const S = (pts, o) => smooth(pts, o)

  const api = {
    cfg, defs, art, sil, S,
    /** register a closed shape in <defs>; halo:true (default) makes it part of the die-cut silhouette. tf = transform string. */
    shape(id, d, o = {}) {
      const { halo = true, tf = '' } = o
      defs.push(`<path id="${id}" d="${d}"${tf ? ` transform="${tf}"` : ''}/>`)
      if (halo) sil.push(id)
    },
    /** paint a registered shape: class 'fa k' = accent fill + 10 px ink contour. */
    use(id, cls = 'fa k') { art.push(`<use href="#${id}" xlink:href="#${id}" class="${cls}"/>`) },
    /** open ink line: classes k2 (interior 9 px) / k3 (detail 7 px) / st (dotted stitch) / sh (accent line) / pp (paper line) */
    line(d, cls = 'k2', extra = '') { art.push(`<path class="${cls}" d="${d}"${extra ? ' ' + extra : ''}/>`) },
    /** one-off filled path (not part of the halo): fa / fi (ink) / fp (paper), optionally with k, k3f outlines */
    fillp(d, cls = 'fa', extra = '') { art.push(`<path class="${cls}" d="${d}"${extra ? ' ' + extra : ''}/>`) },
    raw(s) { art.push(s) },
    /** clipPath from path data (tf only if the clipped content is NOT inside the transformed group) */
    clip(id, d, tf = '') { defs.push(`<clipPath id="${id}"><path d="${d}"${tf ? ` transform="${tf}"` : ''}/></clipPath>`) },
    /** named group (id is prefixed with g- so it never collides with a shape id) */
    group(name, fn) { art.push(`<g id="g-${name}">`); fn(); art.push('</g>') },
    write(outPath) {
      const svg = api.svg()
      fs.writeFileSync(outPath, svg)
      console.log('wrote', outPath, svg.length, 'bytes')
      return svg
    },
    svg() {
      const { accent, ink, paper, fx, grain, root, bg, haloWidth } = cfg
      const halo = sil.map((id) => `<use href="#${id}" xlink:href="#${id}"/>`).join('')
      const haloGroup = (c) => `<g fill="${c}" stroke="${c}" stroke-width="${haloWidth}" stroke-linejoin="round">${halo}</g>`
      const fxDefs = fx
        ? `
${filterDefs(cfg)}
<mask id="haloMask" maskUnits="userSpaceOnUse" x="0" y="0" width="1200" height="1600">
  <g transform="${root}"><g filter="url(#halo-smooth)">${haloGroup('#fff')}</g></g>
</mask>`
        : ''
      return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="1600" viewBox="0 0 1200 1600">
<title>${cfg.title}</title>
${cfg.desc ? `<desc>${cfg.desc}</desc>\n` : ''}${styleBlock(cfg)}
<defs>
${defs.join('\n')}${fxDefs}
</defs>
${bg ? `<rect width="1200" height="1600" fill="${paper}"/>\n` : ''}<g transform="${root}">
<g id="halo"${fx ? ' filter="url(#halo-smooth)"' : ''}>${haloGroup(accent)}</g>
<g id="art"${fx ? ' filter="url(#wobble)"' : ''}>
${art.join('\n')}
</g>
</g>
${fx && grain ? `<rect id="grain-overlay" width="1200" height="1600" filter="url(#grain)" mask="url(#haloMask)" opacity="${cfg.grainOpacity}"/>\n` : ''}</svg>
`
    },
  }
  return api
}
