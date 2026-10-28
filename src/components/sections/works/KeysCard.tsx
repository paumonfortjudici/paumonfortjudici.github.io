// An index card clipped to the sheet: the keys that work inside a folder ([ and ] hop between projects, Esc closes).
// It only shows where there is a keyboard to press (CSS hides it on touch and on small screens). Each key is drawn as a physical keycap.
// A plain note, not a landmark: a shortcut hint is not a region of the page.

import { PaperClip } from '@/components/primitives'
import { WORKS_UI } from './strings'

export function KeysCard() {
  return (
    <div className="pm-wk-keys" role="note" aria-label={WORKS_UI.keys.label}>
      <PaperClip className="pm-wk-keys__clip" rotate={6} size="3.4rem" />
      <p className="pm-wk-keys__title">{WORKS_UI.keys.title}</p>
      <ul className="pm-wk-keys__list" role="list">
        {WORKS_UI.keys.items.map((item) => (
          <li key={item.key} className="pm-wk-keys__item">
            <kbd className="pm-wk-key">{item.key}</kbd>
            <span className="pm-wk-keys__label">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
