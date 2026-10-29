// Marginalia of the tool shelf: the things that lie around a real desk. A ruler, a coffee ring, pencil shavings and the bin of
// discarded thumbnails from step 02 (it shows the "dozens, then one" idea instead of only saying it). All decoration (aria-hidden),
// drawn in the same language as the scenes: round ink lines, flat fills, a hard offset shadow. Each piece is a few hundred bytes, except the
// bin, which is Pau's blackwork tattoo-flash picture (public/process/bin.webp, filed by tools/ingest_tokens.py).
import { asset } from '../../../lib/asset'
import { Scribble } from '../../primitives'
import { PROCESS_UI } from './data'
import { SPRITES } from './tokens.sprites'

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

/** the bin: Pau's blackwork tattoo drawing of a wire basket of discarded thumbnails (public/process/bin.webp, filed by tools/ingest_tokens.py) */
export function Bin() {
  return (
    <div className="pm-proc-bin" aria-hidden="true">
      <img className="pm-proc-bin__svg" src={asset('/process/bin.webp')} width={SPRITES.bin.w} height={SPRITES.bin.h} alt="" loading="lazy" decoding="async" draggable={false} />
      <p className="pm-proc-bin__note t-hand">
        <span>{PROCESS_UI.binNote}</span>
        <Scribble kind="arrow" dir="right" w="3.6rem" color="var(--proc-pink)" seed="process-bin" />
      </p>
    </div>
  )
}
