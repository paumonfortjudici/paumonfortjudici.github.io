// "Which way the words run": three frames of a film strip, one per level, each with a compass rosette whose lit arrows are the
// directions a word may take in that level (the printed how-to page says the same in a small table). Easy: across, down and
// diagonally down. Medium adds backward, up and diagonally up. Hard: all eight.
import type { CSSProperties } from 'react'
import { FilmStrip } from '@/components/primitives'
import { SG } from './copy'
import type { Difficulty } from './data'
import { Stars } from './Reader'

/** screen angles in degrees, 0 = right, 90 = down */
const EASY = [0, 45, 90]
const MEDIUM = [...EASY, 180, 270, 315]
const HARD = [0, 45, 90, 135, 180, 225, 270, 315]
const SET: Record<Difficulty, number[]> = { easy: EASY, medium: MEDIUM, hard: HARD }

const RAD = Math.PI / 180

function Rosette({ level }: { level: Difficulty }) {
  const on = SET[level]
  return (
    <svg className="w-sg-rose" viewBox="-60 -60 120 120" aria-hidden="true" focusable="false">
      <circle className="w-sg-rose__ring" r="52" />
      <circle className="w-sg-rose__ring w-sg-rose__ring--in" r="19" />
      {HARD.map((deg) => {
        const lit = on.includes(deg)
        const c = Math.cos(deg * RAD)
        const s = Math.sin(deg * RAD)
        // the shaft runs from the hub to the tip; the head is two short strokes folded back from the tip
        const tip = 46
        const head = 11
        const back = (a: number) => `${(tip * c - head * Math.cos((deg + a) * RAD)).toFixed(1)} ${(tip * s - head * Math.sin((deg + a) * RAD)).toFixed(1)}`
        return (
          <g key={deg} className="w-sg-rose__arrow" data-on={lit ? '' : undefined}>
            <path d={`M${(22 * c).toFixed(1)} ${(22 * s).toFixed(1)} L${(tip * c).toFixed(1)} ${(tip * s).toFixed(1)}`} />
            <path d={`M${back(-32)} L${(tip * c).toFixed(1)} ${(tip * s).toFixed(1)} L${back(32)}`} />
          </g>
        )
      })}
      <circle className="w-sg-rose__hub" r="6.5" />
    </svg>
  )
}

export default function Directions() {
  return (
    <div className="w-sg-dirs">
      <h4 className="w-sg-type w-sg-dirs__title">{SG.steps.dirsTitle}</h4>
      <FilmStrip tone="ink" className="w-sg-dirs__strip">
        <ol className="w-sg-dirs__frames" aria-label={SG.steps.dirsLabel}>
          {SG.steps.dirs.map((d) => (
            <li key={d.level} className="w-sg-frame8" data-l={d.level} style={{ '--n': SET[d.level].length } as CSSProperties}>
              <Rosette level={d.level} />
              <div className="w-sg-frame8__text">
                <p className="w-sg-type w-sg-frame8__level">
                  <span>{SG.reader.difficulty[d.level]}</span>
                  <Stars level={d.level} />
                </p>
                <p className="w-sg-type w-sg-frame8__range">Cases {d.range}</p>
                <p className="w-sg-frame8__line">{d.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </FilmStrip>
    </div>
  )
}
