// PLACEHOLDER (foundation phase). The catalog agent replaces this file: keep `export default` and id="catalog".
import { CATALOG } from '../../lib/copy'
import './placeholder.css'

export function Catalog() {
  return (
    <section id="catalog" className="pm-ph pm-ph--ink" aria-labelledby="catalog-title">
      <h2 id="catalog-title" className="pm-ph-title t-display">
        Catalog
      </h2>
      <p className="pm-ph-sub t-lead">{CATALOG.sub}</p>
    </section>
  )
}

export default Catalog
