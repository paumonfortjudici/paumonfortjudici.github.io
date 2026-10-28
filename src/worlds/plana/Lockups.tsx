// Plate 2, "Lockups": a switcher for the five forms of the logo, each one the real SVG on the background the manual approves for it.
// Picking a form wipes the plate to that colour (a circle that rises from the bottom edge, like a sun). The tabs are the index tabs of
// the cabinet, painted in the colour of the ground they show. Arrow keys, Home and End move between them (roving tabindex).
import { useRef, useState } from 'react'
import { TabButton } from '../../components/primitives'
import { LOCKUPS, PLATES, plana, type Ground } from './data'
import { Plate } from './Plate'
import { SealFigure } from './SealFigure'
import { rovingKeyDown } from './roving'
import './lockups.css'

// the tab colours are the grounds themselves (the colours are Plana's, defined in plana.css)
const TAB: Record<Ground, { color: string; ink: string }> = {
  paper: { color: 'var(--paper)', ink: 'var(--night)' },
  wheat: { color: 'var(--wheat)', ink: 'var(--night)' },
  holm: { color: 'var(--holm)', ink: 'var(--paper)' },
  poppy: { color: 'var(--poppy)', ink: 'var(--night)' },
  night: { color: 'var(--night)', ink: 'var(--paper)' },
}

export default function Lockups() {
  const [index, setIndex] = useState(0)
  const [previous, setPrevious] = useState<number | null>(null)
  const [clear, setClear] = useState(false)
  const tabs = useRef<(HTMLElement | null)[]>([])

  const choose = (next: number) => {
    if (next === index) return
    setPrevious(index)
    setIndex(next)
  }

  const current = LOCKUPS[index]

  return (
    <Plate
      info={PLATES[1]}
      caption="One mark, five working forms. Each is the real vector file, shown on the background the manual approves for it."
    >
      <div className="w-plana-frame w-plana-lock">
        <div className="w-plana-lock__stage" role="tabpanel" id="plana-lock-panel" aria-labelledby={`plana-lock-tab-${current.id}`}>
          {LOCKUPS.map((l, n) => (
            <div
              key={l.id}
              className="w-plana-lock__layer"
              data-ground={l.ground}
              data-state={n === index ? 'on' : n === previous ? 'prev' : 'off'}
              aria-hidden={n === index ? undefined : true}
            >
              <div className={`w-plana-lock__fig w-plana-lock__fig--${l.id}`}>
                {l.id === 'seal' ? (
                  <SealFigure file={l.file} w={l.w} h={l.h} alt={l.alt} active={n === index} />
                ) : (
                  <img src={plana(l.file)} width={l.w} height={l.h} alt={l.alt} loading="lazy" decoding="async" draggable={false} />
                )}
                {l.id === 'horizontal' && (
                  <span className="w-plana-lock__clear" data-on={clear ? 'true' : 'false'} aria-hidden="true">
                    <i>x</i>
                  </span>
                )}
              </div>
              {l.id === 'horizontal' && (
                <p className="w-plana-lock__min">
                  <span className="w-plana-lock__bracket" aria-hidden="true" />
                  Smallest on screen: 120 px wide
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="w-plana-lock__bar">
          <div
            className="w-plana-lock__tabs"
            role="tablist"
            aria-label="Logo forms"
            onKeyDown={rovingKeyDown(LOCKUPS.length, index, (n) => {
              choose(n)
              tabs.current[n]?.focus()
            })}
          >
            {LOCKUPS.map((l, n) => (
              <TabButton
                key={l.id}
                ref={(el) => {
                  tabs.current[n] = el
                }}
                id={`plana-lock-tab-${l.id}`}
                role="tab"
                aria-selected={n === index}
                aria-controls="plana-lock-panel"
                tabIndex={n === index ? 0 : -1}
                size="sm"
                color={TAB[l.ground].color}
                ink={TAB[l.ground].ink}
                selected={n === index}
                onClick={() => choose(n)}
                cursor="Open"
              >
                {l.label}
              </TabButton>
            ))}
          </div>
          <div className="w-plana-lock__foot">
            <p className="w-plana-lock__note" aria-live="polite">
              {current.note}
            </p>
            {current.id === 'horizontal' && (
              <TabButton size="sm" color="var(--poppy)" ink="var(--night)" aria-pressed={clear} onClick={() => setClear((c) => !c)} cursor="Open">
                {clear ? 'Hide clear space' : 'Show clear space'}
              </TabButton>
            )}
          </div>
        </div>
      </div>
    </Plate>
  )
}
