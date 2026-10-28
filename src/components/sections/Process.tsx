// PLACEHOLDER (foundation phase). The process agent replaces this file: keep `export default` and id="process".
import { PROCESS } from '../../lib/copy'
import './placeholder.css'

export function Process() {
  return (
    <section id="process" className="pm-ph pm-ph--ultraviolet" aria-labelledby="process-title">
      <h2 id="process-title" className="pm-ph-title t-display">
        Process
      </h2>
      <p className="pm-ph-sub t-lead">{PROCESS.sub}</p>
    </section>
  )
}

export default Process
