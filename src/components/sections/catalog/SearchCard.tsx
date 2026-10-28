// The search field is a typewritten index card: Courier Prime on ruled paper, taped to the sheet, with a block caret that blinks like a
// typewriter's (class pm-ambient: it stops for reduced motion and for "Pause motion", and stays as a solid block).
//
// The native caret is hidden (caret-color: transparent). The block is placed from a measured mirror of the text before the caret,
// so it follows the real glyph widths whatever the font does. The placeholder is a real element, not the attribute, so the long hint
// can wrap over two typed lines; it is also the field's description for screen readers.
import { useEffect, useId, useLayoutEffect, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent, type RefObject, type SyntheticEvent } from 'react'
import { CATALOG } from '@/lib/copy'
import { Tape } from '../../primitives'
import { CAT_UI } from './strings'

const MAX_LENGTH = 30

interface SearchCardProps {
  value: string
  onChange: (value: string) => void
  /** Enter: open the best match */
  onSubmit: () => void
  /** ArrowDown: move on to the bands */
  onArrowDown: () => void
  inputRef: RefObject<HTMLInputElement>
}

export function SearchCard({ value, onChange, onSubmit, onArrowDown, inputRef }: SearchCardProps) {
  const uid = useId()
  const hintId = `pm-cat-hint-${uid}`
  const [focused, setFocused] = useState(false)
  const [caret, setCaret] = useState(0)
  const measureRef = useRef<HTMLSpanElement>(null)
  const caretRef = useRef<HTMLSpanElement>(null)
  const fieldRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLSpanElement>(null)

  const at = Math.min(caret, value.length)

  const place = (): void => {
    const measure = measureRef.current
    const block = caretRef.current
    if (measure && block) block.style.setProperty('--x', `${measure.offsetWidth}px`)
  }
  // every render: the text before the caret may have changed
  useLayoutEffect(place)
  // the typed face can swap in after the first paint: measure again whenever the mirror changes size
  useEffect(() => {
    const measure = measureRef.current
    if (!measure || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(place)
    ro.observe(measure)
    return () => ro.disconnect()
  }, [])

  // the field is as tall as the hint's lines (two on a wide card, three on a phone), so it never changes height when typing starts
  useLayoutEffect(() => {
    const hint = hintRef.current
    const field = fieldRef.current
    if (!hint || !field) return
    const fit = (): void => field.style.setProperty('--hint-h', `${hint.offsetHeight}px`)
    fit()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(fit)
    ro.observe(hint)
    return () => ro.disconnect()
  }, [])

  const sync = (event: SyntheticEvent<HTMLInputElement>): void => {
    const el = event.currentTarget
    setCaret(el.selectionEnd ?? el.value.length)
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange(event.target.value)
    setCaret(event.target.selectionEnd ?? event.target.value.length)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Escape' && value) {
      event.preventDefault()
      event.stopPropagation()
      onChange('')
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      onArrowDown()
    }
  }

  const handleSubmit = (event: FormEvent): void => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form className="pm-cat-card" role="search" aria-label={CATALOG.searchLabel} onSubmit={handleSubmit}>
      <Tape at="tl" color="marigold" pattern="stripes" w="5.6rem" h="1.7rem" rotate={-34} />
      <p className="pm-cat-card__try">
        <span className="pm-cat-card__try-k">{CAT_UI.try}</span>
        {CAT_UI.examples.map((word, i) => (
          <span key={word} className="pm-cat-card__try-w">
            <button
              type="button"
              className="pm-cat-card__ex"
              aria-label={CAT_UI.exampleLabel(word)}
              onClick={() => {
                onChange(word)
                setCaret(word.length)
                inputRef.current?.focus()
              }}
            >
              {word}
            </button>
            {i < CAT_UI.examples.length - 1 && <span aria-hidden="true">,</span>}
          </span>
        ))}
      </p>
      {/* the whole ruled area is the writing surface: a tap on any line puts the caret in the field (the input itself is one line tall) */}
      <div ref={fieldRef} className="pm-cat-card__field" data-focus={focused ? '' : undefined} onClick={() => inputRef.current?.focus()}>
        <input
          ref={inputRef}
          className="pm-cat-card__input"
          type="text"
          name="q"
          value={value}
          maxLength={MAX_LENGTH}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          aria-label={CATALOG.searchLabel}
          aria-describedby={hintId}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onKeyUp={sync}
          onSelect={sync}
          onClick={sync}
          onFocus={(event) => {
            setFocused(true)
            sync(event)
          }}
          onBlur={() => setFocused(false)}
        />
        <span ref={measureRef} className="pm-cat-card__measure" aria-hidden="true">
          {value.slice(0, at)}
        </span>
        <span ref={caretRef} className="pm-cat-card__caret pm-ambient" data-on={focused || value === '' ? '' : undefined} aria-hidden="true" />
        <span className="pm-cat-card__flag" data-show={value === '' && !focused ? '' : undefined} aria-hidden="true">
          {CAT_UI.typeHere}
        </span>
        <span ref={hintRef} id={hintId} className="pm-cat-card__hint" data-show={value === '' ? '' : undefined}>
          {CATALOG.searchPlaceholder}
        </span>
      </div>
    </form>
  )
}
