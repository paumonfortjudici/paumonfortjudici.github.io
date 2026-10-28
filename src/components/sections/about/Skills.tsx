// What I do: three blocks that deliberately do not match. Each is a different paper object with a labelled tab and a drawn
// pictogram: a colour-fan card for the graphic designer, a spiral-bound sketchbook page for the illustrator, a dark line-numbered
// card for the front-end developer. Copy comes from ABOUT.columns.

import type { CSSProperties } from 'react'
import { ABOUT } from '../../../lib/copy'
import { Reveal, Scribble } from '../../primitives'
import { honest } from './text'
import { BraceScribble, BracketsIcon, NibIcon, PencilIcon } from './marks'
import './skills.css'

const FAN = ['tomato', 'lagoon', 'ultraviolet', 'pine', 'bubblegum'] as const
const pad2 = (n: number): string => String(n).padStart(2, '0')
const tab = (color: string, on: string): CSSProperties => ({ '--c': `var(--${color})`, '--on': `var(--${on})` }) as CSSProperties

export default function Skills() {
  const [design, draw, code] = ABOUT.columns
  return (
    <ul className="pm-ab-skills" aria-label="What I do">
      <Reveal as="li" kind="pop" className="pm-ab-skill">
        <div className="pm-ab-skill__in pm-ab-skill__in--design">
          <span className="pm-ab-fan" aria-hidden="true">
            {FAN.map((color, i) => (
              <span key={color} className="pm-ab-fan__chip" style={{ '--a': `${(i - 2) * 12}deg`, '--c': `var(--${color})` } as CSSProperties} />
            ))}
          </span>
          <div className="pm-ab-card">
            <h4 className="pm-ab-tab" style={tab('tomato', 'ink')}>
              <NibIcon />
              {design.title}
            </h4>
            <ul className="pm-ab-points" role="list">
              {design.points.map((point) => (
                <li key={point}>{honest(point)}</li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>

      <Reveal as="li" kind="pop" delay={90} className="pm-ab-skill">
        <div className="pm-ab-skill__in pm-ab-skill__in--draw">
          <div className="pm-ab-card">
            <span className="pm-ab-spiral" aria-hidden="true" />
            <h4 className="pm-ab-tab" style={tab('bubblegum', 'ink')}>
              <PencilIcon />
              {draw.title}
            </h4>
            <ul className="pm-ab-points" role="list">
              {draw.points.map((point) => (
                <li key={point}>{honest(point)}</li>
              ))}
            </ul>
            <Scribble kind="squiggle" w="5.4rem" color="tomato" stroke={5.5} seed="pm-brush" draw={200} className="pm-ab-brush" />
          </div>
        </div>
      </Reveal>

      <Reveal as="li" kind="pop" delay={180} className="pm-ab-skill">
        <div className="pm-ab-skill__in pm-ab-skill__in--code">
          <div className="pm-ab-card">
            <h4 className="pm-ab-tab" style={tab('lagoon', 'ink')}>
              <BracketsIcon />
              {code.title}
            </h4>
            <ul className="pm-ab-points pm-ab-points--code" role="list">
              {code.points.map((point, i) => (
                <li key={point}>
                  <span className="pm-ab-ln" aria-hidden="true">
                    {pad2(i + 1)}
                  </span>
                  {honest(point)}
                </li>
              ))}
            </ul>
            <BraceScribble className="pm-ab-braces" delay={250} />
          </div>
        </div>
      </Reveal>
    </ul>
  )
}
