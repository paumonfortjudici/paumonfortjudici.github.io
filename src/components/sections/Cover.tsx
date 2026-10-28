// PLACEHOLDER (foundation phase). The cover agent replaces this file: keep `export default`, id="cover" and the single <h1>.
import { COVER, SHEET_META } from '../../lib/copy'
import './placeholder.css'

export function Cover() {
  return (
    <section id="cover" className="pm-ph" aria-labelledby="cover-title">
      <p className="pm-ph-page t-label">{SHEET_META.pages.cover}</p>
      <h1 id="cover-title" className="pm-ph-title t-display">
        {COVER.title.before}
        <em>{COVER.title.accent}</em>
      </h1>
      <p className="pm-ph-sub t-lead">{COVER.blurb}</p>
    </section>
  )
}

export default Cover
