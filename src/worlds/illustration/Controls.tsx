// The control row under the lid: tab buttons (Peel all, Arrange, Reset) and the Gravity lever, a switch made of a strip of tape
// with a little stick that flips between "off" and "on". "Save my laptop" is a tab that stands on the lid's top edge (SaveTab).
import type { ReactNode } from 'react'
import { TabButton, Tape } from '../../components/primitives'
import type { Board, UiState } from './board'
import { DownloadIcon } from './icons'

function Lever({ on, busy, onToggle }: { on: boolean; busy: boolean; onToggle: () => void }) {
  return (
    <div className="w-illustration-lever" data-on={on ? 'true' : 'false'} data-busy={busy ? 'true' : undefined}>
      <Tape color="butter" pattern="stripes" w="12.6rem" h="4.4rem" rotate={-1.2}>
        <span className="w-illustration-lever-face" aria-hidden="true">
          <span className="w-illustration-lever-word">Gravity</span>
          <span className="w-illustration-lever-dial">
            <i className="w-illustration-lever-off">off</i>
            <i className="w-illustration-lever-on">on</i>
            <span className="w-illustration-lever-stick">
              <b className="w-illustration-lever-knob" />
            </span>
          </span>
        </span>
      </Tape>
      <button type="button" className="w-illustration-lever-hit" role="switch" aria-checked={on} aria-label="Gravity" disabled={busy} onClick={onToggle} data-cursor="Flip" />
    </div>
  )
}

export function Controls({ board, ui, children }: { board: Board; ui: UiState; children?: ReactNode }) {
  const anyOnSheet = ui.onLid.some((v) => !v)
  const anyOnLid = ui.onLid.some(Boolean)
  return (
    <div className="w-illustration-controls" role="group" aria-label="Sticker board controls">
      <TabButton size="sm" color="var(--wi-tangerine)" ink="var(--ink)" disabled={!anyOnSheet || ui.busy} onClick={() => board.peelAll()}>
        Peel all
      </TabButton>
      <TabButton size="sm" color="var(--wi-mint)" ink="var(--ink)" disabled={ui.busy} onClick={() => board.arrange()}>
        Arrange
      </TabButton>
      <TabButton size="sm" color="var(--wi-sky)" ink="var(--ink)" disabled={!anyOnLid || ui.busy} onClick={() => board.reset()}>
        Reset
      </TabButton>
      <Lever on={ui.gravity} busy={ui.busy} onToggle={() => void board.setGravity(!ui.gravity)} />
      {children}
    </div>
  )
}

/** a pink tab (standing on the lid's top edge on a wide screen, in the control row on a phone): renders the lid and its stickers to a PNG */
export function SaveTab({ ui, saving, onSave, short }: { ui: UiState; saving: boolean; onSave: () => void; short?: boolean }) {
  return (
    <TabButton
      size="sm"
      color="var(--wi-pink)"
      ink="var(--ink)"
      disabled={saving || !ui.onLid.some(Boolean)}
      icon={<DownloadIcon />}
      iconPosition="before"
      onClick={onSave}
      aria-label={short ? 'Save my laptop as a picture' : undefined}
    >
      {short ? 'Save' : 'Save my laptop'}
    </TabButton>
  )
}
