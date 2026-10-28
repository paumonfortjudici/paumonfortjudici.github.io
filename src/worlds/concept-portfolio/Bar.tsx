// The toolbar of the presentation room: five folder tabs (never default buttons).
//   Present     shows the deck full screen            Design notes   toggles the director's pins
//   Sound       toggles the sound board (OFF at first) Sheet          opens the contact sheet
//   About Ona   opens the client panel
import { TabButton } from '@/components/primitives'
import { pad2 } from '@/lib/copy'
import { COPY } from './copy'
import { PlayIcon, SheetIcon, SpeakerIcon } from './icons'

interface BarProps {
  notes: boolean
  sound: boolean
  /** pins on the slide in the middle */
  pins: number
  onPresent: () => void
  onNotes: () => void
  onSound: () => void
  onSheet: () => void
  onAbout: () => void
  /** id of a (visually hidden) paragraph that says what the Sound tab does and how the sounds are made */
  soundHelpId: string
}

export function Bar({ notes, sound, pins, onPresent, onNotes, onSound, onSheet, onAbout, soundHelpId }: BarProps) {
  return (
    <div className="w-cp-bar" role="group" aria-label={COPY.bar.label}>
      <div className="w-cp-bar-l">
        <TabButton color="var(--cp-tomato)" ink="var(--cp-ink)" icon={<PlayIcon />} iconPosition="before" cursor="Play" onClick={onPresent}>
          {COPY.bar.present}
        </TabButton>
        <TabButton
          color="var(--cp-sun)"
          ink="var(--cp-ink)"
          selected={notes}
          aria-pressed={notes}
          aria-label={COPY.bar.notesLabel(pins)}
          count={pad2(pins)}
          className="w-cp-t-notes"
          onClick={onNotes}
        >
          <span className="w-cp-long">{COPY.bar.notes}</span>
          <span className="w-cp-short" aria-hidden="true">
            {COPY.bar.notesShort}
          </span>
        </TabButton>
        <TabButton
          color="var(--cp-celery)"
          ink="var(--cp-ink)"
          icon={<SpeakerIcon muted={!sound} />}
          iconPosition="before"
          selected={sound}
          aria-pressed={sound}
          aria-label={COPY.bar.sound}
          aria-describedby={soundHelpId}
          count={sound ? COPY.bar.on : COPY.bar.off}
          onClick={onSound}
        >
          {COPY.bar.sound}
        </TabButton>
      </div>
      <div className="w-cp-bar-r">
        <TabButton color="var(--cp-paper)" ink="var(--cp-ink)" icon={<SheetIcon />} iconPosition="before" aria-haspopup="dialog" onClick={onSheet}>
          {COPY.bar.sheet}
        </TabButton>
        <TabButton color="var(--cp-ink)" ink="var(--cp-butter)" aria-haspopup="dialog" onClick={onAbout}>
          {COPY.bar.about}
        </TabButton>
      </div>
    </div>
  )
}
