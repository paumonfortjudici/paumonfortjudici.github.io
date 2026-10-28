// PLACEHOLDER (foundation phase). The works agent replaces this file: keep `export default` and id="works".
// The plain folder buttons below already use the real contract: layoutId={folderLayoutId(slug, origin)} + openWork(slug, origin),
// so the shared-element folder-open transition can be tested before the real cards exist.
import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { WORKS_SECTION, pad2 } from '../../lib/copy'
import { folderLayoutId, openWork } from '../../lib/router'
import { WORKS } from '../../lib/works'
import './placeholder.css'

export function Works() {
  return (
    <section id="works" className="pm-ph" aria-labelledby="works-title">
      <h2 id="works-title" className="pm-ph-title t-display">
        Works
      </h2>
      <p className="pm-ph-sub t-lead">{WORKS_SECTION.sub}</p>
      <ul className="pm-ph-folders">
        {WORKS.map((work) => (
          <li key={work.slug}>
            <motion.button
              type="button"
              className="pm-ph-folder"
              layoutId={folderLayoutId(work.slug, 'works')}
              style={{ '--c': work.color, '--on': work.ink, borderRadius: 18 } as CSSProperties}
              onClick={() => openWork(work.slug, 'works')}
              aria-label={`${work.title}, open folder`}
              data-cursor="Open"
            >
              <span className="pm-ph-num t-display">{pad2(work.n)}</span>
              <span className="pm-ph-name t-display">{work.title}</span>
            </motion.button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Works
