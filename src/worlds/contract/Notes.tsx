// The left column: a sheet of press notes with the rust title block of the issue's own section tabs and a drop cap in Bitter.
import { PaperClip, Reveal } from '../../components/primitives'
import { NOTES } from './copy'
import Swatches from './Swatches'

export default function Notes() {
  return (
    <aside className="w-contract-notes" aria-labelledby="w-contract-notes-title">
      <Reveal kind="left">
        <div className="w-contract-sheet-paper">
          <PaperClip rotate={-9} size="4.2rem" className="w-contract-clip" />
          <h2 id="w-contract-notes-title" className="w-contract-tab">
            {NOTES.title}
          </h2>
          <div className="w-contract-prose">
            <p className="w-contract-drop">{NOTES.p1}</p>
            <p>{NOTES.p2}</p>
            <p>{NOTES.p3}</p>
          </div>
        </div>
      </Reveal>
      <Swatches />
    </aside>
  )
}
