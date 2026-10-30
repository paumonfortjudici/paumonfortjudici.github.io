// The things lying on the desk beside the sketchbook, drawn in SVG: a pencil, an eraser, a sharpener and a short ruler.
// Pure decoration (aria-hidden, not focusable): they only make the desk look used.
import { useMemo } from 'react'

/** a hexagonal pencil, point to the left */
export function PencilArt() {
  return (
    <svg className="w-procreate-prop-art" viewBox="0 0 480 44" aria-hidden="true" focusable="false">
      <path d="M2 22 L48 5 L48 39 Z" fill="#f1d3a3" />
      <path d="M2 22 L16 16.8 L16 27.2 Z" fill="#3d3b42" />
      <path d="M30 11 L48 5 L48 39 L30 33 Z" fill="#d9b27c" opacity=".55" />
      <rect x="48" y="5" width="330" height="34" fill="#ffc83a" />
      <rect x="48" y="5" width="330" height="9" fill="#ffe487" />
      <rect x="48" y="30" width="330" height="9" fill="#d98e00" />
      <rect x="378" y="3" width="42" height="38" fill="#b9bec7" />
      <path d="M386 3v38M394 3v38M402 3v38M410 3v38" stroke="#7d8490" strokeWidth="2" />
      <rect x="420" y="5" width="48" height="34" rx="9" fill="#ff8fc1" />
      <rect x="420" y="5" width="48" height="9" rx="4" fill="#ffc0dc" />
    </svg>
  )
}

/** a white block eraser in a blue paper sleeve, worn at one end */
export function EraserArt() {
  return (
    <svg className="w-procreate-prop-art" viewBox="0 0 170 76" aria-hidden="true" focusable="false">
      <rect x="4" y="8" width="162" height="62" rx="10" fill="#cfc8ba" />
      <rect x="4" y="3" width="162" height="62" rx="10" fill="#f7f2e7" />
      <rect x="52" y="3" width="66" height="62" fill="#2b79d8" />
      <rect x="52" y="3" width="66" height="10" fill="#5b9be9" />
      <path d="M62 34h46M62 44h30" stroke="#f7f2e7" strokeWidth="4" strokeLinecap="round" />
      <path d="M4 3 L26 3 L4 22 Z" fill="#cfc8ba" opacity=".7" />
      <circle cx="142" cy="46" r="3" fill="#6f6a60" opacity=".35" />
      <circle cx="152" cy="30" r="2" fill="#6f6a60" opacity=".3" />
    </svg>
  )
}

/** a metal pencil sharpener */
export function SharpenerArt() {
  return (
    <svg className="w-procreate-prop-art" viewBox="0 0 100 64" aria-hidden="true" focusable="false">
      <rect x="2" y="10" width="96" height="52" rx="9" fill="#7d8490" />
      <rect x="2" y="4" width="96" height="52" rx="9" fill="#c3c8d0" />
      <rect x="2" y="4" width="96" height="12" rx="6" fill="#e4e7ec" />
      <circle cx="30" cy="32" r="12" fill="#2a2e36" />
      <rect x="52" y="24" width="30" height="5" rx="2" fill="#7d8490" />
      <circle cx="84" cy="44" r="4" fill="#7d8490" />
    </svg>
  )
}

/** a 15 cm ruler */
export function RulerArt() {
  const ticks = useMemo(() => {
    let long = ''
    let mid = ''
    let short = ''
    for (let mm = 0; mm <= 150; mm++) {
      const px = 20 + mm * 4
      if (mm % 10 === 0) long += `M${px} 6v26`
      else if (mm % 5 === 0) mid += `M${px} 6v18`
      else short += `M${px} 6v11`
    }
    return { long, mid, short }
  }, [])
  return (
    <svg className="w-procreate-prop-art" viewBox="0 0 640 74" aria-hidden="true" focusable="false">
      <rect x="2" y="9" width="636" height="62" rx="5" fill="#bf9c5e" />
      <rect x="2" y="3" width="636" height="62" rx="5" fill="#ecd08f" />
      <rect x="2" y="3" width="636" height="5" rx="2.5" fill="#f7e2ae" />
      <g stroke="#3d3b42" strokeWidth="1.6" fill="none" opacity=".85">
        <path d={ticks.short} />
        <path d={ticks.mid} />
        <path d={ticks.long} strokeWidth="2.2" />
      </g>
      <circle cx="616" cy="44" r="7" fill="#bf9c5e" />
    </svg>
  )
}
