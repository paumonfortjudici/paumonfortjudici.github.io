// The typewriter's keyboard: four rows of round keys and a space bar on a dark steel tray. It is a prop that tells the truth: the
// key that matches the character being typed goes down (one Web Animations press per keystroke, nothing is ever animated while
// motion is still, and the whole tray is hidden from assistive tech: the text itself is the content).
import { forwardRef, memo, useImperativeHandle, useRef } from 'react'

const ROWS = ['1234567890', 'QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM,.']

export interface KeysHandle {
  /** press the key for a character (letters, digits, comma, full stop and the space bar; anything else is ignored) */
  press: (ch: string) => void
}

const Keys = forwardRef<KeysHandle, { plate?: string }>(function Keys({ plate }, ref) {
  const rootRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(
    ref,
    () => ({
      press: (ch) => {
        const root = rootRef.current
        if (!root || ch === '\n') return
        const id = ch === ' ' ? 'space' : ch.toUpperCase()
        if (!/^([A-Z0-9,.]|space)$/.test(id)) return
        const cap = root.querySelector<HTMLElement>(`[data-k="${id}"]`)
        if (!cap || typeof cap.animate !== 'function') return
        const depth = Math.max(2, cap.offsetHeight * 0.14)
        cap.animate(
          [
            { translate: '0 0' },
            { translate: `0 ${depth}px`, offset: 0.35 },
            { translate: '0 0' },
          ],
          { duration: 90, easing: 'ease-out' },
        )
      },
    }),
    [],
  )

  return (
    <div ref={rootRef} className="w-sg-tray" aria-hidden="true">
      <span className="w-sg-tray__screw w-sg-tray__screw--l" />
      <span className="w-sg-tray__screw w-sg-tray__screw--r" />
      {plate ? <p className="w-sg-tray__plate w-sg-strip">{plate}</p> : null}
      <div className="w-sg-tkrows">
        {ROWS.map((row) => (
          <div key={row} className="w-sg-tkrow">
            {row.split('').map((k) => (
              <span key={k} className="w-sg-tkwell">
                <span className="w-sg-tkey" data-k={k}>
                  {k}
                </span>
              </span>
            ))}
          </div>
        ))}
        <div className="w-sg-tkrow">
          <span className="w-sg-tkwell w-sg-tkwell--space">
            <span className="w-sg-tkey w-sg-tkey--space" data-k="space" />
          </span>
        </div>
      </div>
    </div>
  )
})

// the synopsis re-renders on every keystroke; the keys only need to be pressed, never re-drawn
export default memo(Keys)
