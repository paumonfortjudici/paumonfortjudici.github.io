// PLACEHOLDER (foundation phase). The chrome agent replaces this file: keep `export default`; render a <footer>.
import { FOOTER } from '../../lib/copy'
import '../sections/placeholder.css'

export function Footer() {
  return (
    <footer className="pm-ph-foot">
      <p className="t-caption">{FOOTER.rights}</p>
      <a href="#cover" className="t-label">
        {FOOTER.back}
      </a>
    </footer>
  )
}

export default Footer
