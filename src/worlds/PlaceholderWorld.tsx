// Shared body of the PLACEHOLDER worlds (foundation phase). Each world agent replaces its own <Name>World.tsx and stops using this.
import { pad2 } from '../lib/copy'
import { useWorld } from './WorldContext'

export default function PlaceholderWorld() {
  const { work } = useWorld()
  return (
    <div className="w-placeholder">
      <p className="w-placeholder-kicker t-label">
        {pad2(work.n)} · {work.kind}
      </p>
      <h2 className="w-placeholder-title t-display">{work.title}</h2>
      <p className="w-placeholder-note t-lead">World under construction</p>
    </div>
  )
}
