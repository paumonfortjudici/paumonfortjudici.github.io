// The house directory: the sections of the issue are named like the rooms of a hotel (Hall, Sala de Visitas, Open Space, Zona VIP...),
// so the index is drawn as the engraved sign you find in a lobby. Every row is a button that turns the book to that room.
// The rust tab on the left is the issue's own device: a vertical section tab.
import { DIRECTORY, ROOMS } from './copy'
import { SPREADS } from './data'

interface DirectoryProps {
  /** printed numbers of the pages on show in the book: the room they belong to is marked */
  onShow: number[]
  onGo: (page: number) => void
}

/** the room a page belongs to, from the contents pages of the two magazines */
function roomOf(page: number): string | undefined {
  return ROOMS.find((r) => r.spans.some(([a, b]) => page >= a && page <= b))?.id
}

export default function Directory({ onShow, onGo }: DirectoryProps) {
  const here = onShow.map(roomOf).find(Boolean)
  return (
    <section className="w-contract-dir" aria-labelledby="w-contract-dir-title">
      <h2 id="w-contract-dir-title" className="w-contract-dir-tab">
        {DIRECTORY.title}
      </h2>
      <div className="w-contract-dir-plate">
        <p className="w-contract-dir-sub">{DIRECTORY.sub}</p>
        <ul className="w-contract-dir-list">
          {ROOMS.filter((r) => SPREADS.some((s) => s.includes(r.page))).map((r) => (
            <li key={r.id}>
              <button type="button" className="w-contract-room" aria-current={here === r.id ? 'true' : undefined} data-cursor="Flip" onClick={() => onGo(r.page)}>
                <span className="w-contract-room-name" lang={r.es ? 'es' : undefined}>
                  {r.name}
                </span>
                <span className="w-contract-room-gloss">{r.gloss}</span>
                <span className="w-contract-room-page">
                  <span className="pm-sr">page </span>
                  {r.page}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
