// A swatch card taped under the press notes: the colours of the issue, sampled from the cover and the section tabs (the values
// are in public/works/contract/manifest.json). It only appears on tall screens, where the left column has the room; it is the
// designer's habit of pulling the palette before touching anything else.
import { Reveal, Tape } from '../../components/primitives'
import { SWATCHES } from './copy'

export default function Swatches() {
  return (
    <Reveal kind="drop" delay={200} className="w-contract-swatches-wrap">
      <figure className="w-contract-swatches">
        <Tape at="top" color="paper" w="5.6rem" h="1.5rem" rotate={-2} />
        <figcaption className="w-contract-h3 w-contract-swatches-title">The colours of the issue</figcaption>
        <ul className="w-contract-chips">
          {SWATCHES.map((s) => (
            <li key={s.hex}>
              <span className="w-contract-chip" style={{ backgroundColor: s.hex }} aria-hidden="true" />
              <span className="pm-sr">{s.name} </span>
              <span className="w-contract-chip-hex">{s.hex}</span>
            </li>
          ))}
        </ul>
        <p className="w-contract-small">Sampled from the cover and the tabs.</p>
      </figure>
    </Reveal>
  )
}
