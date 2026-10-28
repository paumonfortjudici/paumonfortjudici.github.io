// The colophon of the table: the two faces this world is set in, shown on a headline from the issue, and which of the issue's own
// faces each one stands in for (the PDF embeds Caecilia for the editorial pages and Interstate for the cover). A designer's habit:
// say what you are using and why it is not the original.
import { Tape } from '../../components/primitives'
import { TYPE } from './copy'

export default function TypeCard() {
  return (
    <figure className="w-contract-type">
      <Tape at="top" color="paper" w="5.2rem" h="1.45rem" rotate={2} />
      <div className="w-contract-type-row">
        <p className="w-contract-type-slab" lang="es">
          {TYPE.slab}
        </p>
        <p className="w-contract-type-note">{TYPE.slabNote}</p>
      </div>
      <div className="w-contract-type-row">
        <p className="w-contract-type-sans">{TYPE.sans}</p>
        <p className="w-contract-type-note">{TYPE.sansNote}</p>
      </div>
    </figure>
  )
}
