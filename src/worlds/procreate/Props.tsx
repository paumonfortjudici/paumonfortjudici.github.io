// The tools that lie on the ledge of the wall, drawn in SVG. They are not decoration: the ruler squares the prints up
// (Tidy up) and the eraser rubs the notes out. Both are mouse shortcuts to the TabButtons next to them, so they are hidden
// from assistive tech and left out of the tab order; the pencil only holds the ledge together.
import { useMemo } from 'react'

/** a 30 cm boxwood ruler with millimetre ticks */
export function RulerArt() {
  const ticks = useMemo(() => {
    let long = ''
    let mid = ''
    let short = ''
    for (let mm = 0; mm <= 300; mm++) {
      const px = 22 + mm * 2
      if (mm % 10 === 0) long += `M${px} 8v26`
      else if (mm % 5 === 0) mid += `M${px} 8v18`
      else short += `M${px} 8v10`
    }
    return { long, mid, short }
  }, [])
  return (
    <svg className="w-procreate-ruler-art" viewBox="0 0 644 78" aria-hidden="true" focusable="false">
      <rect className="w-procreate-ruler-edge" x="3" y="9" width="638" height="64" rx="6" />
      <rect className="w-procreate-ruler-body" x="3" y="3" width="638" height="64" rx="6" />
      <rect className="w-procreate-ruler-bevel" x="3" y="3" width="638" height="5" rx="2.5" />
      <path className="w-procreate-ruler-tick" d={ticks.short} />
      <path className="w-procreate-ruler-tick" d={ticks.mid} />
      <path className="w-procreate-ruler-tick w-procreate-ruler-tick--long" d={ticks.long} />
      <circle className="w-procreate-ruler-hole" cx="622" cy="46" r="7" />
      <path className="w-procreate-ruler-mark" d="M70 52h120M70 59h72" />
    </svg>
  )
}

/** a hexagonal pencil, seen from above, point to the left */
export function PencilArt() {
  return (
    <svg className="w-procreate-pencil-art" viewBox="0 0 310 30" aria-hidden="true" focusable="false">
      <polygon className="w-procreate-pencil-wood" points="2,15 40,3 40,27" />
      <polygon className="w-procreate-pencil-lead" points="2,15 15,10.5 15,19.5" />
      <rect className="w-procreate-pencil-body" x="40" y="3" width="214" height="24" />
      <rect className="w-procreate-pencil-lit" x="40" y="3" width="214" height="7" />
      <rect className="w-procreate-pencil-shade" x="40" y="20" width="214" height="7" />
      <path className="w-procreate-pencil-line" d="M62 3v24M70 3v24" />
      <rect className="w-procreate-pencil-ferrule" x="254" y="3" width="24" height="24" />
      <path className="w-procreate-pencil-groove" d="M262 3v24M270 3v24" />
      <rect className="w-procreate-pencil-rubber" x="278" y="4" width="28" height="22" rx="6" />
    </svg>
  )
}

/** a hand-drawn magnifier for the "Look closer" tabs: a slightly wobbly lens and a thick handle, drawn in the tab's ink */
export function LoupeIcon() {
  return (
    <svg className="w-procreate-loupe" viewBox="0 0 22 22" aria-hidden="true" focusable="false">
      <path d="M9.4 3.1c3.4-.4 6.4 2.2 6.5 5.6.1 3.3-2.4 6.1-5.8 6.3-3.3.2-6.1-2.3-6.3-5.6-.2-3.2 2.2-6 5.6-6.3Z" />
      <path d="M14.2 13.6l5.2 5.1" />
      <path d="M6.4 7.2c.6-1.3 1.7-2 3-2.2" className="w-procreate-loupe-glint" />
    </svg>
  )
}

/** a pink eraser in a paper sleeve, one end worn round; the crumbs show while the notes are rubbed out */
export function EraserArt() {
  return (
    <svg className="w-procreate-eraser-art" viewBox="0 0 150 84" aria-hidden="true" focusable="false">
      <path className="w-procreate-eraser-edge" d="M16 18h112a10 10 0 0 1 10 10v36a10 10 0 0 1-10 10H22a14 14 0 0 1-12-8L4 56c-2-3-2-7 0-10l8-24a10 10 0 0 1 4-4Z" />
      <path className="w-procreate-eraser-body" d="M16 12h112a10 10 0 0 1 10 10v36a10 10 0 0 1-10 10H22a14 14 0 0 1-12-8L4 50c-2-3-2-7 0-10l8-24a10 10 0 0 1 4-4Z" />
      <rect className="w-procreate-eraser-sleeve" x="56" y="12" width="78" height="56" rx="0" />
      <rect className="w-procreate-eraser-sleeve-lit" x="56" y="12" width="78" height="8" />
      <path className="w-procreate-eraser-print" d="M70 34h50M70 44h34M70 54h42" />
      <g className="w-procreate-crumbs">
        <ellipse cx="14" cy="74" rx="3.2" ry="2" />
        <ellipse cx="27" cy="79" rx="2.4" ry="1.6" />
        <ellipse cx="38" cy="75" rx="3" ry="1.9" />
        <ellipse cx="6" cy="68" rx="2" ry="1.4" />
        <ellipse cx="46" cy="80" rx="2.2" ry="1.4" />
      </g>
    </svg>
  )
}
