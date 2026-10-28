// Shared SVG resources the primitives paint with, injected ONCE into <body> when this module is first imported
// (import './defs' from any primitive that needs them; nothing to mount in App):
//   #pm-grain         paper tooth tile (also the CSS custom property --pm-grain in primitives.css)
//   #pm-stamp-1..3    rubber-stamp edge: displaced outline, ink starvation specks, pressure blotches, a little bleed
//   #pm-diecut-1..3   die-cut sticker halo: dilate + blur + threshold = a smooth rounded paper rim, painted under the art
// Filters live in one hidden <svg> (not display:none: Safari and Firefox would ignore them).

import grainUrl from './grain.png'

export const GRAIN_URL = grainUrl

const STAMP_TIERS = [
  // freq/scale: how much the outline wobbles. sfreq/thr/k: ink-starved specks (bigger sfreq = finer). bleed: soaked-in halo
  { n: 1, freq: 0.06, scale: 1.5, seed: 3, sfreq: 0.6, thr: 0.22, k: 24, bleed: 0.22, blur: 0.6 },
  { n: 2, freq: 0.05, scale: 2.2, seed: 5, sfreq: 0.5, thr: 0.27, k: 24, bleed: 0.26, blur: 0.7 },
  { n: 3, freq: 0.04, scale: 3.6, seed: 9, sfreq: 0.38, thr: 0.32, k: 20, bleed: 0.32, blur: 0.9 },
]

const DIECUT_TIERS = [
  { n: 1, radius: 3 },
  { n: 2, radius: 5 },
  { n: 3, radius: 8 },
]

function stampFilter(t: (typeof STAMP_TIERS)[number]): string {
  const k = t.k
  return `<filter id="pm-stamp-${t.n}" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency="${t.freq}" numOctaves="2" seed="${t.seed}" result="warp"/>
  <feDisplacementMap in="SourceGraphic" in2="warp" scale="${t.scale}" xChannelSelector="R" yChannelSelector="G" result="wob"/>
  <feTurbulence type="fractalNoise" baseFrequency="${t.sfreq}" numOctaves="2" seed="${t.seed + 4}" result="grain"/>
  <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${k} 0 0 0 ${(-k * t.thr).toFixed(2)}" result="speck"/>
  <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="${t.seed + 9}" result="press"/>
  <feColorMatrix in="press" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.6 0 0 0 0.12" result="pressure"/>
  <feComposite in="wob" in2="speck" operator="in" result="s1"/>
  <feComposite in="s1" in2="pressure" operator="in" result="inked"/>
  <feGaussianBlur in="wob" stdDeviation="${t.blur}" result="bl"/>
  <feColorMatrix in="bl" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${t.bleed} 0" result="bleed"/>
  <feMerge><feMergeNode in="bleed"/><feMergeNode in="inked"/></feMerge>
</filter>`
}

function diecutFilter(t: (typeof DIECUT_TIERS)[number]): string {
  return `<filter id="pm-diecut-${t.n}" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">
  <feMorphology in="SourceAlpha" operator="dilate" radius="${t.radius}" result="grow"/>
  <feGaussianBlur in="grow" stdDeviation="${(t.radius * 0.38).toFixed(2)}" result="soft"/>
  <feComponentTransfer in="soft" result="halo"><feFuncA type="linear" slope="14" intercept="-6.5"/></feComponentTransfer>
  <feFlood style="flood-color: var(--paper); flood-opacity: 1" result="paper"/>
  <feComposite in="paper" in2="halo" operator="in" result="rim"/>
  <feMerge><feMergeNode in="rim"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>`
}

export const DEFS_HTML = `<svg id="pm-defs" xmlns="http://www.w3.org/2000/svg" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden;pointer-events:none">
<defs>
<pattern id="pm-grain" width="128" height="128" patternUnits="userSpaceOnUse"><image href="${grainUrl}" width="128" height="128"/></pattern>
${STAMP_TIERS.map(stampFilter).join('\n')}
${DIECUT_TIERS.map(diecutFilter).join('\n')}
</defs>
</svg>`

export function ensurePrimitiveDefs(): void {
  if (typeof document === 'undefined') return
  const existing = document.getElementById('pm-defs')
  if (existing) {
    existing.outerHTML = DEFS_HTML // hot reload: keep the markup in sync with this file
    return
  }
  const body = document.body
  if (!body) {
    document.addEventListener('DOMContentLoaded', ensurePrimitiveDefs, { once: true })
    return
  }
  body.insertAdjacentHTML('afterbegin', DEFS_HTML)
}

ensurePrimitiveDefs()
