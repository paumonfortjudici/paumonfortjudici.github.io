// PLACEHOLDER (foundation phase). The contact agent replaces this file: keep `export default` and id="contact".
import { CONTACT } from '../../lib/copy'
import './placeholder.css'

export function Contact() {
  return (
    <section id="contact" className="pm-ph pm-ph--tomato" aria-labelledby="contact-title">
      <h2 id="contact-title" className="pm-ph-title t-display">
        {CONTACT.phrase}
      </h2>
      <p className="pm-ph-sub t-lead">{CONTACT.paragraph}</p>
    </section>
  )
}

export default Contact
