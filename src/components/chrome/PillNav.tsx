// PLACEHOLDER (foundation phase). The chrome agent replaces this file: keep `export default`; render a <nav aria-label>.
import { NAV } from '../../lib/copy'
import '../sections/placeholder.css'

export function PillNav() {
  return (
    <nav className="pm-ph-nav" aria-label="Sections">
      <ul>
        {NAV.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="t-label">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default PillNav
