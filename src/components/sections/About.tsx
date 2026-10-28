// PLACEHOLDER (foundation phase). The about agent replaces this file: keep `export default` and id="about".
import { ABOUT } from '../../lib/copy'
import './placeholder.css'

export function About() {
  return (
    <section id="about" className="pm-ph pm-ph--marigold" aria-labelledby="about-title">
      <h2 id="about-title" className="pm-ph-title t-display">
        {ABOUT.greeting}
      </h2>
      <p className="pm-ph-sub t-lead">{ABOUT.paragraph}</p>
    </section>
  )
}

export default About
