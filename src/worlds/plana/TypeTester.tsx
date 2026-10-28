// Plate 4, "Type": a live type tester. Whatever you type is set in the brand's three faces at once, each with its role and size named:
// Sora ExtraBold for headlines and the logotype, Figtree for reading, DM Mono for labels and data. A range changes the headline size,
// four small tabs change Figtree's weight (Regular to Bold, as in the manual). The rows have fixed heights, so typing never moves the page.
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { TabButton } from '../../components/primitives'
import { PLATES } from './data'
import { Plate } from './Plate'
import { rovingKeyDown } from './roving'
import './type.css'

const SAMPLE = 'Websites ready in 72 hours.'
const WEIGHTS = [
  { value: 400, label: 'Regular' },
  { value: 500, label: 'Medium' },
  { value: 600, label: 'SemiBold' },
  { value: 700, label: 'Bold' },
]

export default function TypeTester() {
  const [text, setText] = useState(SAMPLE)
  const [want, setWant] = useState(76) // the size the visitor asked for
  const [width, setWidth] = useState(0) // the specimen's own width: the headline never grows past 12.5 % of it (so one word always fits a line)
  const [weight, setWeight] = useState(1) // index into WEIGHTS
  const inputId = useId()
  const sizeId = useId()
  const weightRefs = useRef<(HTMLElement | null)[]>([])
  const soraRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = soraRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setWidth(el.clientWidth))
    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  const maxSize = width > 0 ? Math.max(40, Math.min(110, Math.floor((width * 0.125) / 2) * 2)) : 110
  const size = Math.min(want, maxSize)

  const shown = text.trim() === '' ? SAMPLE : text
  const body = 22
  const label = 15

  return (
    <Plate
      info={PLATES[3]}
      caption="Three free families (OFL): Sora for headlines and the logotype, Figtree for reading, DM Mono for labels and data. The manual calls them the voice, the reader and the programmer."
    >
      <div className="w-plana-frame w-plana-type">
        <div className="w-plana-type__field">
          <label className="w-plana-type__label" htmlFor={inputId}>
            Type your own words
          </label>
          <input
            id={inputId}
            className="w-plana-type__input"
            type="text"
            value={text}
            maxLength={40}
            spellCheck={false}
            autoComplete="off"
            placeholder={SAMPLE}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <p className="pm-sr">The three specimens below repeat your text in Sora ExtraBold, Figtree and DM Mono.</p>

        <div className="w-plana-type__row" role="group" aria-label="Sora ExtraBold">
          <div className="w-plana-type__spec">
            <p>
              <strong>Sora ExtraBold</strong>
              <span>Headlines and the logotype · {size} px · tracking −0.045 em</span>
            </p>
            <label className="w-plana-type__range" htmlFor={sizeId}>
              <span>Size</span>
              <input id={sizeId} type="range" min={28} max={maxSize} step={2} value={size} onChange={(e) => setWant(Number(e.target.value))} data-cursor="Drag" />
            </label>
          </div>
          <p ref={soraRef} className="w-plana-type__sample w-plana-type__sample--sora" style={{ '--s': `${size}px` } as CSSProperties} aria-hidden="true">
            {shown}
          </p>
        </div>

        <div className="w-plana-type__row" role="group" aria-label="Figtree">
          <div className="w-plana-type__spec">
            <p>
              <strong>Figtree {WEIGHTS[weight].label}</strong>
              <span>
                Reading: paragraphs and buttons · {body} px · {WEIGHTS[weight].value}
              </span>
            </p>
            <div
              className="w-plana-type__weights"
              role="radiogroup"
              aria-label="Figtree weight"
              onKeyDown={rovingKeyDown(WEIGHTS.length, weight, (n) => {
                setWeight(n)
                weightRefs.current[n]?.focus()
              })}
            >
              {WEIGHTS.map((w, n) => (
                <TabButton
                  key={w.value}
                  ref={(el) => {
                    weightRefs.current[n] = el
                  }}
                  role="radio"
                  aria-checked={n === weight}
                  aria-label={`${w.label} ${w.value}`}
                  tabIndex={n === weight ? 0 : -1}
                  size="sm"
                  color="var(--wheat)"
                  ink="var(--night)"
                  selected={n === weight}
                  onClick={() => setWeight(n)}
                >
                  {w.value}
                </TabButton>
              ))}
            </div>
          </div>
          <p className="w-plana-type__sample w-plana-type__sample--figtree" style={{ '--w': WEIGHTS[weight].value } as CSSProperties} aria-hidden="true">
            {shown}
          </p>
        </div>

        <div className="w-plana-type__row" role="group" aria-label="DM Mono">
          <div className="w-plana-type__spec">
            <p>
              <strong>DM Mono Medium</strong>
              <span>
                Labels and data · {label} px · capitals · +0.12 em
              </span>
            </p>
          </div>
          <p className="w-plana-type__sample w-plana-type__sample--mono" aria-hidden="true">
            {shown}
          </p>
        </div>

        <div className="w-plana-type__foot">
          <div className="w-plana-type__logotype" role="img" aria-label="The logotype: plana in Sora ExtraBold and digital in Sora Regular, all lowercase">
            <span>plana</span> <span>digital</span>
          </div>
          <p className="w-plana-type__glyphs" aria-label="Catalan character set">
            àéèíïòóúüç l·l 0123456789 &amp;?!€
          </p>
        </div>
      </div>
    </Plate>
  )
}
