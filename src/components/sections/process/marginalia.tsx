// Marginalia of the tool shelf: the things that lie around a real desk. A ruler, a coffee ring, pencil shavings and the bin of
// discarded thumbnails from step 02 (it shows the "dozens, then one" idea instead of only saying it). All decoration (aria-hidden),
// drawn in the same language as the scenes: round ink lines, flat fills, a hard offset shadow. Each piece is a few hundred bytes.
import { Scribble } from '../../primitives'
import { PROCESS_UI } from './data'

const RULER_MARKS = Array.from({ length: 30 }, (_, i) => i)

/** a cream ruler with numbered centimetres, lying a little crooked */
export function Ruler() {
  return (
    <div className="pm-proc-ruler-desk" aria-hidden="true">
      {RULER_MARKS.map((n) => (
        <span key={n}>{n}</span>
      ))}
    </div>
  )
}

/** a coffee ring: a full ring that is darker where the cup was set down, a second thinner ring, and a few drops */
export function CoffeeRing() {
  return (
    <svg className="pm-proc-coffee" viewBox="0 0 130 130" aria-hidden="true" focusable="false">
      <path d="M65 10C96 9 121 33 120 65C119 98 93 121 63 120C31 119 9 95 10 64C11 35 34 11 65 10Z" fill="none" stroke="currentColor" strokeWidth="9" strokeLinejoin="round" opacity="0.5" />
      <path d="M64 12C84 10 111 24 118 52" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.4" />
      <path d="M66 24C90 24 107 41 106 65C105 90 85 107 63 106C40 105 24 88 25 65C26 43 43 24 66 24Z" fill="none" stroke="currentColor" strokeWidth="2.6" opacity="0.4" />
      <circle cx="118" cy="110" r="6" fill="currentColor" opacity="0.5" />
      <circle cx="106" cy="124" r="3" fill="currentColor" opacity="0.5" />
      <circle cx="16" cy="16" r="3.6" fill="currentColor" opacity="0.4" />
    </svg>
  )
}

/** pencil shavings: ribbons of wood that curl up, flat colour inside an ink outline */
export function Shavings() {
  const curls = [
    { d: 'M10 62C6 30 44 14 62 36C76 54 50 70 38 56C30 46 44 38 52 46', c: 'var(--marigold)' },
    { d: 'M96 70C92 44 126 36 142 54C154 70 130 82 122 70C116 62 128 56 134 62', c: 'var(--bubblegum)' },
    { d: 'M168 40C170 18 198 14 208 32C216 48 196 56 190 46', c: 'var(--marigold)' },
    { d: 'M66 90C74 80 90 84 90 94', c: 'var(--cream)' },
  ]
  return (
    <svg className="pm-proc-shavings" viewBox="0 0 224 104" aria-hidden="true" focusable="false">
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {curls.map((c) => (
          <g key={c.d}>
            <path d={c.d} stroke="var(--ink)" strokeWidth="17" />
            <path d={c.d} stroke={c.c} strokeWidth="8.5" />
          </g>
        ))}
      </g>
    </svg>
  )
}

/** the bin: a mesh basket with crumpled thumbnails and one sheet that still shows a crossed-out sketch */
export function Bin() {
  return (
    <div className="pm-proc-bin" aria-hidden="true">
      <svg viewBox="0 0 240 200" focusable="false" className="pm-proc-bin__svg">
        <g strokeLinecap="round" strokeLinejoin="round" stroke="var(--ink)" strokeWidth="4">
          <path className="sh" d="M38 80 L50 192 L196 192 L208 80Z" fill="color-mix(in srgb, var(--ultraviolet) 46%, var(--ink))" stroke="none" transform="translate(6 7)" />
          {/* a sheet leaning on the rim, with a devil thumbnail that has been crossed out */}
          <g transform="rotate(-9 90 70)">
            <rect x="52" y="6" width="98" height="104" rx="4" fill="var(--cream)" />
            <rect x="64" y="20" width="74" height="62" rx="3" fill="var(--paper)" strokeWidth="2.6" />
            <path d="M84 40l6 10M118 40l-6 10" strokeWidth="3.2" />
            <circle cx="101" cy="58" r="13" fill="var(--bubblegum)" strokeWidth="3" />
            <path d="M95 56h2M105 56h2M96 63q5 4 10 0" strokeWidth="2.4" />
            <path d="M62 18L140 86M140 18L62 86" stroke="var(--tomato)" strokeWidth="5" />
            <path d="M66 96h60M66 104h40" strokeWidth="2.6" opacity="0.5" />
          </g>
          {/* crumpled balls */}
          <path d="M120 58l16-12 17 5 12 15-4 18-18 9-18-6-8-15Z" fill="var(--butter)" />
          <path d="M132 62l9 6-4 9M144 56l-2 9 10 3" strokeWidth="2.4" opacity="0.7" />
          <path d="M150 34l14-10 15 4 8 13-6 15-16 6-14-8-4-13Z" fill="var(--cream-2)" />
          <path d="M160 40l7 7-5 8M171 33l-3 8 9 4" strokeWidth="2.4" opacity="0.7" />
          <path d="M82 70l12-10 16 3 8 12-5 14-15 6-14-7-4-12Z" fill="var(--lilac)" />
          <path d="M90 74l8 5-4 8" strokeWidth="2.4" opacity="0.7" />
          {/* the basket: a dark trapezoid with a cream mesh */}
          <path d="M34 82 L47 188 Q48 194 54 194 L192 194 Q198 194 199 188 L212 82Z" fill="var(--ink)" />
          <path d="M30 82H216" strokeWidth="7" stroke="var(--cream)" />
          <g stroke="var(--cream)" strokeWidth="2.6" opacity="0.8">
            <path d="M62 92L68 186M90 92L92 186M118 92V186M146 92L144 186M174 92L168 186M202 92L196 186" />
            <path d="M40 118H208M44 148H204M47 174H200" />
          </g>
        </g>
      </svg>
      <p className="pm-proc-bin__note t-hand">
        <span>{PROCESS_UI.binNote}</span>
        <Scribble kind="arrow" dir="right" w="3.6rem" color="var(--proc-pink)" seed="process-bin" />
      </p>
    </div>
  )
}
