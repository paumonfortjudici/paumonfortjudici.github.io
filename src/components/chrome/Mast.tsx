// PLACEHOLDER (foundation phase). The chrome agent replaces this file: keep `export default`; render a <header>.
import { MAST } from '../../lib/copy'
import '../sections/placeholder.css'

export function Mast() {
  return (
    <header className="pm-ph-mast">
      <p className="pm-ph-name t-display">{MAST.name}</p>
      <p className="t-caption">{MAST.notes[0]}</p>
    </header>
  )
}

export default Mast
