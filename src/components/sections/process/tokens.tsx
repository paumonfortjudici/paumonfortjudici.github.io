// The seven tool tokens of the shelf: seven different objects drawn in the section's graphic language (art.css).
// No logos and no app icons: each object carries the tool's name in the label face. 150 x 150 user units = 150 CSS px,
// so the 13px names are 13px on screen. Micro-animations (hover, focus) live in bench.css, keyed on the part classes (tk-*).
import { memo, type ComponentType, type ReactNode } from 'react'
import type { ToolId } from './data'

const Svg = ({ children }: { children: ReactNode }) => (
  <svg className="pm-art pm-tk-svg" viewBox="0 0 150 150" aria-hidden="true" focusable="false">
    {children}
  </svg>
)

/** the whole Adobe suite: a fan of paint chips on one rivet */
function Fan() {
  return (
    <Svg>
      <g className="tk-fl">
        <rect className="o pa" x="49" y="40" width="52" height="100" rx="6" />
        <rect className="o t n to" x="53" y="44" width="44" height="32" rx="3" />
        <rect className="o t n mg" x="53" y="80" width="44" height="22" rx="3" />
        <rect className="o t n bg" x="53" y="106" width="44" height="26" rx="3" />
      </g>
      <g className="tk-fr">
        <rect className="o pa" x="49" y="40" width="52" height="100" rx="6" />
        <rect className="o t n lg" x="53" y="44" width="44" height="32" rx="3" />
        <rect className="o t n ol" x="53" y="80" width="44" height="22" rx="3" />
        <rect className="o t n bt" x="53" y="106" width="44" height="26" rx="3" />
      </g>
      <g className="tk-fc">
        <rect className="o pa" x="49" y="40" width="52" height="100" rx="6" />
        <rect className="o t n uv" x="53" y="44" width="44" height="30" rx="3" />
        <rect className="o t n lc" x="53" y="78" width="44" height="20" rx="3" />
        <rect className="o t n mg" x="53" y="102" width="44" height="14" rx="3" />
        <text className="lab" x="75" y="127" textAnchor="middle">ADOBE</text>
      </g>
      <circle className="o ik" cx="75" cy="137" r="5.5" />
      <circle cx="75" cy="137" r="1.8" fill="var(--paper)" />
    </Svg>
  )
}

/** pencil and paper: a stub of pencil on a scrap of paper, mid-scribble */
function Pencil() {
  return (
    <Svg>
      <g className="tk-paper">
        <path className="o pa" d="M10 76 L128 70 L134 140 L16 144 Z" />
        <path className="o t lt nofill" d="M22 94 L122 89 M24 110 L124 105 M26 126 L128 121" />
      </g>
      <path className="tk-scr o t gr nofill" pathLength={1} d="M26 130 q7 -12 14 0 t14 0 t14 0 t14 0 t14 0 t14 0" />
      <g className="tk-pen">
        <g transform="translate(-6 34) rotate(24 75 62)">
          <path className="o c2" d="M112 49 L138 62 L112 75 Z" />
          <path className="o n ik" d="M131 58.4 L138 62 L131 65.6 Z" />
          <rect className="o mg" x="22" y="49" width="90" height="26" rx="3" />
          <rect className="o n dmg" x="24" y="68" width="86" height="5" rx="1" />
          <path className="o t w nofill" d="M26 53 H108" />
          <path className="o t nofill" d="M112 49 Q119 62 112 75" />
          <text className="lab" x="66" y="66" textAnchor="middle">PENCIL</text>
        </g>
      </g>
    </Svg>
  )
}

/** Procreate: a plastic index tab on a canvas card, with one brush stroke */
function IndexTab() {
  return (
    <Svg>
      <g className="tk-card">
        <rect className="o pa" x="22" y="50" width="106" height="88" rx="6" />
        <path className="tk-b1 x nofill o" pathLength={1} d="M38 106 C52 78 66 130 82 102 S106 90 114 108" style={{ stroke: 'var(--ink)', strokeWidth: 11 }} />
        <path className="tk-b2 x nofill o" pathLength={1} d="M38 106 C52 78 66 130 82 102 S106 90 114 108" style={{ stroke: 'var(--tomato)', strokeWidth: 6 }} />
      </g>
      <g className="tk-tab">
        <path className="o bg" d="M28 54 V42 Q28 33 37 33 H113 Q122 33 122 42 V54 Z" />
        <text className="lab" x="75" y="49" textAnchor="middle">PROCREATE</text>
      </g>
    </Svg>
  )
}

/** Nomad Sculpt: a lump of clay with thumbprints, a wire loop tool and a flag on a toothpick */
function Clay() {
  return (
    <Svg>
      <g className="tk-flag">
        <path className="o t nofill" d="M71 53 L66 14" />
        <rect className="o pa" x="66" y="8" width="62" height="38" rx="2" />
        <text className="lab" x="97" y="24" textAnchor="middle">NOMAD</text>
        <text className="lab" x="97" y="40" textAnchor="middle">SCULPT</text>
      </g>
      <g className="tk-clay">
        <path className="o to" d="M26 98 C22 68 46 52 74 54 C102 56 116 76 110 100 C106 122 84 136 60 132 C42 128 28 116 26 98 Z" />
        <ellipse className="o t dto" cx="50" cy="90" rx="8" ry="11" transform="rotate(-20 50 90)" />
        <ellipse className="o t dto" cx="70" cy="114" rx="10" ry="7" transform="rotate(10 70 114)" />
        <path className="o t w nofill" d="M42 74 C50 66 62 63 72 65" />
      </g>
      <g className="tk-tool">
        <g transform="translate(98 116) rotate(-40)">
          <rect className="o mg" x="0" y="-6" width="50" height="12" rx="6" />
          <path className="o t nofill" d="M0 0 H-6" />
          <ellipse className="o t nofill" cx="-17" cy="0" rx="11" ry="7" />
        </g>
      </g>
    </Svg>
  )
}

/** AI tools: a luggage tag with a grid of variations and one tick (picked, not generated blindly) */
function Tag() {
  return (
    <Svg>
      <g className="tk-tagg">
        <path className="o t nofill" d="M75 10 C60 22 62 42 75 50 M75 10 C90 22 88 42 75 50" />
        <path className="o bt" d="M52 38 H98 L112 52 V132 Q112 137 107 137 H43 Q38 137 38 132 V52 Z" />
        <circle className="o t uv" cx="75" cy="52" r="6.5" />
        <text className="lab" x="75" y="82" textAnchor="middle">AI TOOLS</text>
        <rect className="o t bg" x="54" y="92" width="18" height="16" rx="2" />
        <rect className="o t mg" x="78" y="92" width="18" height="16" rx="2" />
        <rect className="o t lg" x="54" y="113" width="18" height="16" rx="2" />
        <rect className="o t to" x="78" y="113" width="18" height="16" rx="2" />
        <path className="tk-tick o x nofill" pathLength={1} d="M80 121 L86 126 L97 111" style={{ strokeWidth: 3.6 }} />
      </g>
    </Svg>
  )
}

/** Pinterest: a reference card held to the wall with a push pin */
function Pin() {
  return (
    <Svg>
      <g className="tk-pcard">
        <g transform="rotate(5 75 92)">
          <rect className="o pa" x="30" y="40" width="90" height="94" rx="4" />
          <rect className="o t lg" x="38" y="56" width="74" height="46" rx="2" />
          <circle className="o t mg" cx="94" cy="69" r="7.5" />
          <path className="o t pn" d="M38 102 V90 Q58 68 78 90 T112 86 V102 Z" />
          <text className="lab" x="75" y="124" textAnchor="middle">PINTEREST</text>
        </g>
      </g>
      <g className="tk-pin">
        <ellipse cx="80" cy="50" rx="11" ry="6" fill="var(--shd)" />
        <circle className="o to" cx="75" cy="44" r="11" />
        <path className="o t w nofill" d="M67 41 A8.5 8.5 0 0 1 74 35" />
      </g>
    </Svg>
  )
}

/** VS Code: a keyboard key with braces */
function Key() {
  return (
    <Svg>
      <rect className="tk-base o dc2" x="28" y="56" width="94" height="78" rx="14" />
      <g className="tk-top">
        <rect className="o pa" x="30" y="40" width="90" height="80" rx="14" />
        <text className="tk-br" x="75" y="84" textAnchor="middle" style={{ fontFamily: 'var(--font-label)', fontWeight: 700, fontSize: 40, fill: 'var(--ultraviolet)' }}>{'{ }'}</text>
        <text className="lab" x="75" y="107" textAnchor="middle">VS CODE</text>
      </g>
    </Svg>
  )
}

// memoised: no props, so a token is drawn once
export const TOKEN_ART: Record<ToolId, ComponentType> = {
  adobe: memo(Fan),
  pencil: memo(Pencil),
  procreate: memo(IndexTab),
  nomad: memo(Clay),
  ai: memo(Tag),
  pinterest: memo(Pin),
  vscode: memo(Key),
}
