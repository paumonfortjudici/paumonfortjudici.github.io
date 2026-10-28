// Exhibit A: the poster. A giant keyline title and one honest line on the wall; the paperback and the tab that opens it stand on
// the desk. The wall and the desk are two bands of one grid, so nothing ever straddles the lip of the desk.
import { useRef, type RefObject } from 'react'
import { TabButton } from '@/components/primitives'
import Book3D from './Book3D'
import { SG } from './copy'
import './sg-room.css'

interface PosterProps {
  titleId: string
  still: boolean
  stageRef: RefObject<HTMLDivElement>
  onOpen: () => void
}

export default function Poster({ titleId, still, stageRef, onOpen }: PosterProps) {
  const roomRef = useRef<HTMLElement>(null)
  return (
    <section ref={roomRef} className="w-sg-room" aria-labelledby={titleId}>
      <div className="w-sg-blinds" aria-hidden="true" />
      <div className="w-sg-deskline" aria-hidden="true" />

      <div className="w-sg-poster">
        <p className="w-sg-tag w-sg-type">{SG.poster.exhibit}</p>
        <h2 id={titleId} className="w-sg-title w-sg-key">
          <span className="w-sg-title__a">{SG.poster.titleA}</span> <span className="w-sg-title__b">{SG.poster.titleB}</span>
        </h2>
        <div className="w-sg-copy">
          <p className="w-sg-strip">{SG.poster.strip}</p>
          <p className="w-sg-blurb">{SG.poster.blurb}</p>
          <ul className="w-sg-facts">
            {SG.poster.facts.map((f) => (
              <li key={f.l} className="w-sg-facts__i">
                <span className="w-sg-facts__n">{f.n}</span>
                <span className="w-sg-facts__l w-sg-type">{f.l}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="w-sg-deskbar">
        <TabButton size="lg" tone="cream" icon="arrow-down" cursor="Open" onClick={onOpen}>
          {SG.poster.open}
        </TabButton>
      </div>

      <Book3D still={still} hoverRoot={roomRef} stageRef={stageRef} onOpen={onOpen} />
    </section>
  )
}
