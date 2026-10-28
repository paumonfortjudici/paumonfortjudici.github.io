// The keyboard shortcuts of the cabinet, as a line of little keycaps. Hidden on touch devices (they have no keys to press).
// Esc closes a folder, [ and ] hop between folders, the arrow keys turn pages. Arrows are drawn (no arrow glyphs in the fonts).

import { ArrowIcon } from '../primitives'
import { CHROME } from './strings'

export default function KeyHints({ className }: { className?: string }) {
  return (
    <ul className={className ? `pm-keys ${className}` : 'pm-keys'} aria-label="Keyboard shortcuts">
      <li className="pm-keys__item">
        <kbd className="pm-key">Esc</kbd>
        <span>{CHROME.keys.close}</span>
      </li>
      <li className="pm-keys__item">
        <span className="pm-sr">{CHROME.keys.srBrackets}</span>
        <kbd className="pm-key" aria-hidden="true">
          [
        </kbd>
        <kbd className="pm-key" aria-hidden="true">
          ]
        </kbd>
        <span>{CHROME.keys.hop}</span>
      </li>
      <li className="pm-keys__item">
        <span className="pm-sr">{CHROME.keys.srArrows}</span>
        <kbd className="pm-key" aria-hidden="true">
          <ArrowIcon dir="left" />
        </kbd>
        <kbd className="pm-key" aria-hidden="true">
          <ArrowIcon dir="right" />
        </kbd>
        <span>{CHROME.keys.turn}</span>
      </li>
    </ul>
  )
}
