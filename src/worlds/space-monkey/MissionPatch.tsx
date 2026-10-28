// The mission patch: "MY FIRST PROJECT / AGE 13" stitched round the monkey-astronaut badge.
// The monkey is the ROOM's own patch, cut from SMITH's sleeve (author unknown: not claimed); the ring, the stitching and the
// lettering are the composition. Embroidered look: merrowed edge (two dashed rings), woven twill, lettering in Orbitron with
// no middle dot (stars are drawn instead), a faint thread wobble from one SVG filter. Small by design: the cut-out is only
// 181 px native.
// Legibility: the lettering is 19 units of a 240-unit drawing, so it renders at 13 px or more from a patch width of 11 rem up
// (every layout keeps the patch at least that wide).
import { useId } from 'react'
import { PATCH_SRC } from './data'

// The cut-out is fetched and decoded as soon as the world's code arrives (not when the SVG is first painted), so the patch is whole
// when its "pop" starts and never fills in late on a cold load.
if (typeof Image !== 'undefined') {
  const warm = new Image()
  warm.decoding = 'async'
  ;(warm as HTMLImageElement & { fetchPriority?: string }).fetchPriority = 'high'
  warm.src = PATCH_SRC
}

const STAR ='M0 -9 L2.2 -2.2 L9 0 L2.2 2.2 L0 9 L-2.2 2.2 L-9 0 L-2.2 -2.2 Z'

export function MissionPatch({ className }: { className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const top = `${uid}-top`
  const bottom = `${uid}-bottom`
  const twill = `${uid}-twill`
  const thread = `${uid}-thread`
  const puff = `${uid}-puff`
  const label = `Mission patch reading "My first project, age 13". The monkey astronaut in the middle is the room’s own badge, cut out of the SMITH poster.`

  return (
    <svg className={className} viewBox="0 0 240 240" role="img" aria-label={label} focusable="false">
      <defs>
        <filter id={thread} x="-4%" y="-4%" width="108%" height="108%">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <pattern id={twill} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="4" height="4" fill="#0c152f" />
          <rect width="1.5" height="4" fill="#16244d" />
        </pattern>
        <radialGradient id={puff} cx="34%" cy="28%" r="80%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.3" />
        </radialGradient>
        {/* over the top, 240 degrees from lower left to lower right (letters stand outside the path), then along the bottom,
            counter-clockwise, 120 degrees (letters stand inside it) */}
        <path id={top} d="M 53.75 158.25 A 76.5 76.5 0 1 1 186.25 158.25" />
        <path id={bottom} d="M 43.4 164.3 A 88.5 88.5 0 0 0 196.6 164.3" />
      </defs>

      <g filter={`url(#${thread})`}>
        <circle cx="120" cy="120" r="117" fill="#6e4d14" />
        <circle cx="120" cy="120" r="114" fill="#c89231" />
        <circle cx="120" cy="120" r="108.5" fill="none" stroke="#efc873" strokeWidth="8.4" strokeDasharray="2.3 1.5" />
        <circle cx="120" cy="120" r="108.5" fill="none" stroke="#8f6420" strokeWidth="8.4" strokeDasharray="0.9 2.9" strokeDashoffset="1.6" />
        <circle cx="120" cy="120" r="104" fill={`url(#${twill})`} />
        <circle cx="120" cy="120" r="99.5" fill="none" stroke="#c89231" strokeWidth="1.7" />
        <circle cx="120" cy="120" r="64.5" fill="#1961d0" />
        <circle cx="120" cy="120" r="64.5" fill="none" stroke="#dedede" strokeWidth="2" />
        <circle cx="120" cy="120" r="61" fill="none" stroke="#c89231" strokeWidth="1" strokeDasharray="1.6 1.6" />

        <g className="w-space-monkey-patch-type" fill="#e1de0a">
          <text>
            <textPath href={`#${top}`} startOffset="50%" textAnchor="middle">
              MY FIRST PROJECT
            </textPath>
          </text>
          <text>
            <textPath href={`#${bottom}`} startOffset="50%" textAnchor="middle">
              AGE 13
            </textPath>
          </text>
        </g>
        <path d={STAR} transform="translate(59.5 181.5) rotate(18) scale(0.7)" fill="#e1de0a" />
        <path d={STAR} transform="translate(180.5 181.5) rotate(-18) scale(0.7)" fill="#e1de0a" />
      </g>

      <image
        href={PATCH_SRC}
        x="63"
        y="73.5"
        width="114"
        height="102"
        transform="rotate(12 120 124.5)"
        preserveAspectRatio="xMidYMid meet"
      />
      <circle cx="120" cy="120" r="104" fill={`url(#${puff})`} pointerEvents="none" />
    </svg>
  )
}
