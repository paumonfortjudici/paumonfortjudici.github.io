// The top zone of the board, rebuilt live (guide 9.2): Rosat ground with the faint pattern, 25 awning scallops, the wordmark,
// the four mascots at scale 0.95 with their feet on y 1350, and the two captions. Everything is in board units (3000 x 1560).
// The mascots are alive (bob, hop, pose B) and the ground re-tints when the pattern colourway changes.
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import {
  COLOUR,
  COLOURWAY,
  IMG,
  MASCOTS,
  SCALLOP_BOTTOM,
  TOP,
  BOARD_W,
  logoSrc,
  LOGOS,
  mascotImg,
  patternFile,
  type ColourwayId,
  type MascotId,
} from './data'
import { SCALLOP_FILL, SCALLOP_OUTLINE } from './geometry'

const REVERSE = LOGOS.find((v) => v.id === 'reverse')!

interface TopZoneProps {
  colourway: ColourwayId
  /** fade the wordmark and the cast so the wallpaper shows alone */
  wallpaper: boolean
  /** which mascots are in pose B right now, and a counter that restarts the hop */
  active: Record<MascotId, boolean>
  hop: Record<MascotId, number>
  /** no idle motion (reduced or paused) */
  still: boolean
  /** which mascot the panel has selected (gets a slightly livelier bob) */
  chosen: MascotId | null
}

/** the ground: one layer per colourway, the newest fades in over the previous one */
function Ground({ colourway }: { colourway: ColourwayId }) {
  const [stack, setStack] = useState<ColourwayId[]>([colourway])
  const timer = useRef(0)
  useEffect(() => {
    setStack((s) => (s[s.length - 1] === colourway ? s : [...s, colourway].slice(-3)))
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setStack([colourway]), 700)
    return () => window.clearTimeout(timer.current)
  }, [colourway])
  return (
    <div className="w-concept-brand-ground" aria-hidden="true" style={{ clipPath: `path('${SCALLOP_FILL}')` }}>
      {stack.map((id, i) => (
        <div
          key={id}
          className="w-concept-brand-ground-layer"
          data-new={i > 0 ? 'true' : undefined}
          style={{ backgroundColor: COLOUR[COLOURWAY[id].ground].hex, backgroundImage: `url(${patternFile(id)})` }}
        />
      ))}
    </div>
  )
}

export default function TopZone({ colourway, wallpaper, active, hop, still, chosen }: TopZoneProps) {
  const way = COLOURWAY[colourway]
  // load the reverse wordmark the first time a colourway needs it, then keep it (so the swap is instant afterwards)
  const [reverseWanted, setReverseWanted] = useState(false)
  useEffect(() => {
    if (way.wordmark === 'reverse') setReverseWanted(true)
  }, [way.wordmark])
  const label = COLOUR[way.label].hex
  return (
    <div className="w-concept-brand-top" style={{ width: BOARD_W, height: SCALLOP_BOTTOM, '--cb-label': label } as CSSProperties} data-wallpaper={wallpaper ? 'true' : undefined}>
      <Ground colourway={colourway} />
      <svg className="w-concept-brand-top-svg" width={BOARD_W} height={SCALLOP_BOTTOM} viewBox={`0 0 ${BOARD_W} ${SCALLOP_BOTTOM}`} aria-hidden="true" focusable="false">
        <path d={SCALLOP_OUTLINE} fill="none" stroke="var(--cb-tinta)" strokeWidth="12" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div className="w-concept-brand-fade" data-faded={wallpaper ? 'true' : undefined}>
        <img
          className="w-concept-brand-wordmark"
          data-on={way.wordmark === 'full' ? 'true' : 'false'}
          src={IMG.wordmark}
          alt=""
          width={TOP.wordmark.w}
          height={TOP.wordmark.h}
          decoding="async"
          draggable={false}
          style={{ left: TOP.wordmark.x, top: TOP.wordmark.y, width: TOP.wordmark.w, height: TOP.wordmark.h }}
        />
        {reverseWanted && (
          <img
            className="w-concept-brand-wordmark"
            data-on={way.wordmark === 'reverse' ? 'true' : 'false'}
            src={logoSrc(REVERSE)}
            alt=""
            width={TOP.wordmark.w}
            height={TOP.wordmark.h}
            decoding="async"
            draggable={false}
            style={{ left: TOP.wordmark.x, top: TOP.wordmark.y, width: TOP.wordmark.w, height: TOP.wordmark.h }}
          />
        )}
        <svg className="w-concept-brand-top-svg" width={BOARD_W} height={SCALLOP_BOTTOM} viewBox={`0 0 ${BOARD_W} ${SCALLOP_BOTTOM}`} aria-hidden="true" focusable="false">
          <text className="w-concept-brand-caption" x={100} y={TOP.labelY}>
            NEIGHBOURHOOD VERMUTERIA
          </text>
          {/* Chrome counts the trailing letter-spacing when it right-aligns: +6 puts the last letter on x 2900 like the board */}
          <text className="w-concept-brand-caption" x={BOARD_W - 100 + 6} y={TOP.labelY} textAnchor="end">
            BRAND DESIGN
          </text>
        </svg>
        {MASCOTS.map((m) => (
          <div
            key={m.id}
            className="w-concept-brand-mascot"
            data-id={m.id}
            data-active={active[m.id] ? 'true' : undefined}
            data-chosen={chosen === m.id ? 'true' : undefined}
            style={{ left: m.cx - 475, top: TOP.castY, width: TOP.castW, height: TOP.castH }}
          >
            <div
              className={still ? 'w-concept-brand-bob' : 'w-concept-brand-bob pm-ambient'}
              style={{ '--cb-bob': `${m.bob.dur}s`, '--cb-bob-delay': `${m.bob.delay}s` } as CSSProperties}
            >
              <div className="w-concept-brand-hop" data-hop={active[m.id] ? (hop[m.id] % 2 ? 'a' : 'b') : undefined}>
                <img className="w-concept-brand-pose" data-pose="a" src={mascotImg(m.id, 'a')} alt="" width={TOP.castW} height={TOP.castH} decoding="async" draggable={false} />
                <img className="w-concept-brand-pose" data-pose="b" src={mascotImg(m.id, 'b')} alt="" width={TOP.castW} height={TOP.castH} decoding="async" draggable={false} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
