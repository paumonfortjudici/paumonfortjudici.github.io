// World 10, "Sticker Sheet": a sticker sandbox. Nine doodle characters sit on a cream sticker sheet; peel them off, throw them at
// the aluminium laptop lid, stick them anywhere, turn and resize them, tip the lid with Gravity (matter-js, loaded on demand),
// arrange them, save the result as a PNG. Concept project: art-directed by Pau, made with AI-assisted tools.
// The physics and pointer handling live in illustration/board.ts (no React); this file only renders and wires it up.
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react'
import { Stamp, Tape, WorldFacts } from '../components/primitives'
import { useMediaQuery } from '../lib/hooks'
import { Board } from './illustration/board'
import { Cast } from './illustration/Cast'
import { Controls, SaveTab } from './illustration/Controls'
import { STICKERS } from './illustration/data'
import { Lightbox } from './illustration/Lightbox'
import { renderLaptopPng, downloadBlob } from './illustration/save'
import { StickerView } from './illustration/StickerView'
import { Lid, Sheet } from './illustration/Surfaces'
import { Title } from './illustration/Title'
import { useWorld, useWorldEscape } from './WorldContext'
import './illustration/illustration.css'
import './illustration/stickers.css'
import './illustration/controls.css'
import './illustration/cast.css'

export default function IllustrationWorld() {
  const { work, scrollRef, reduced } = useWorld()
  const [board] = useState(() => new Board())
  const narrow = useMediaQuery('(max-width: 899px)')
  const ui = useSyncExternalStore(board.subscribe, board.getUi, board.getUi)
  const stageRef = useRef<HTMLDivElement>(null)
  const lidRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const [details, setDetails] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  const openDetails = useCallback((n: number, el?: HTMLElement | null) => {
    opener.current = el ?? (document.activeElement as HTMLElement | null)
    setDetails(n)
  }, [])

  const closeDetails = useCallback(() => {
    const n = details
    setDetails(null)
    const el = opener.current
    opener.current = null
    // the page behind the lightbox is inert until React's effect clears it, which comes after the next frame: clear it now,
    // or the focus call below lands on an inert element and is dropped
    contentRef.current?.removeAttribute('inert')
    // the focus goes back to the sticker that was being viewed (the user may have stepped to another one with Previous / Next);
    // the opener (a button of a tag that has closed since) is only the fallback
    const focusIt = () => {
      const stick = n === null ? null : stageRef.current?.querySelector<HTMLElement>(`[data-stk="${n}"] .w-illustration-stk-btn`)
      const fromCast = el && el.isConnected && el.closest('.w-illustration-cast') ? el : null
      const target = fromCast ?? stick ?? (el && el.isConnected ? el : null)
      target?.focus?.({ preventScroll: true })
    }
    window.requestAnimationFrame(() => {
      focusIt()
      // the lightbox leaves the DOM in this commit; if the focus is still not on a sticker or the opener, try once more
      window.setTimeout(() => {
        if (!document.activeElement || document.activeElement === document.body) focusIt()
      }, 60)
    })
  }, [details])

  const stepDetails = useCallback((dir: 1 | -1) => {
    setDetails((cur) => (cur === null ? cur : ((cur - 1 + dir + STICKERS.length) % STICKERS.length) + 1))
  }, [])

  useEffect(() => {
    board.setCallbacks({ onDetails: (n) => openDetails(n) })
  }, [board, openDetails])

  // a layout effect: the board places every sticker before the browser paints, so nothing flashes at the wrong spot
  // (it also needs to know about reduced motion before it plans the entrance)
  const reducedRef = useRef(reduced)
  reducedRef.current = reduced
  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    board.setStill(reducedRef.current)
    board.mount(stage, scrollRef.current, lidRef.current)
    const ro = new ResizeObserver(() => board.measure())
    ro.observe(stage)
    stage.querySelectorAll('[data-frame], .w-illustration-head').forEach((frame) => ro.observe(frame))
    const fonts = document.fonts
    if (fonts?.ready) void fonts.ready.then(() => board.measure())
    return () => {
      ro.disconnect()
      board.unmount()
    }
  }, [board, scrollRef])

  useEffect(() => {
    board.setStill(reduced)
  }, [board, reduced])

  // dev builds only: lets the browser tests peek at the board
  useEffect(() => {
    if (!import.meta.env.DEV) return
    ;(window as unknown as { __illustration?: Board }).__illustration = board
    return () => {
      delete (window as unknown as { __illustration?: Board }).__illustration
    }
  }, [board])

  // Escape: put a picked-up sticker back, then close an open tag (the keyboard caption goes away with the focus, so it never
  // swallows an Escape). The lightbox has its own entry on the same stack and wins.
  useWorldEscape(ui.held !== null || (ui.selected !== null && ui.tagMode === 'full'), () => {
    board.escape()
  })

  // the page behind the lightbox is inert
  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    if (details !== null) el.setAttribute('inert', '')
    else el.removeAttribute('inert')
    return () => el.removeAttribute('inert')
  }, [details])

  const save = useCallback(async () => {
    setSaving(true)
    setSaveMsg('')
    try {
      const blob = await renderLaptopPng(board.snapshot())
      downloadBlob(blob, 'my-sticker-laptop.png')
      setSaveMsg('Saved my-sticker-laptop.png to your downloads.')
    } catch {
      setSaveMsg('Sorry, the picture could not be made. Try again.')
    } finally {
      setSaving(false)
    }
  }, [board])

  const locked = ui.gravity || ui.busy

  return (
    <div className="w-illustration" style={{ '--sheet-rot': '-1.3deg' } as CSSProperties}>
      <div className="w-illustration-inner" ref={contentRef}>
        <section
          className="w-illustration-stage"
          ref={stageRef}
          data-gravity={ui.gravity ? 'true' : undefined}
          aria-label="Sticker board"
          onPointerDown={(e) => {
            if (!(e.target as Element).closest('[data-stk], [data-adorn]')) board.select(null)
          }}
        >
          <div className="w-illustration-lidcol">
            <header className="w-illustration-head">
              <Title />
              <div className="w-illustration-headtext">
                <p className="w-illustration-lede">
                  <strong>Peel, throw, stick.</strong> Drag a sticker off the sheet and let go: it glides across the lid, then holds.
                </p>
                {/* a recap strip for wide screens, where the head has room: three little labels (the how-to below says it all again) */}
                <ol className="w-illustration-steps" aria-hidden="true">
                  <li style={{ '--c': 'var(--wi-tangerine)', '--t': '-2deg' } as CSSProperties}>
                    <b>1</b>Peel it off
                  </li>
                  <li style={{ '--c': 'var(--wi-sky)', '--t': '1.6deg' } as CSSProperties}>
                    <b>2</b>Throw it
                  </li>
                  <li style={{ '--c': 'var(--wi-mint)', '--t': '-1deg' } as CSSProperties}>
                    <b>3</b>Stick it down
                  </li>
                </ol>
              </div>
            </header>
            <Lid
              ref={lidRef}
              badge={<Stamp text="Concept · AI-assisted" rotate={-3} color="var(--ink)" size="0.95rem" thump={false} />}
              tabs={narrow ? undefined : <SaveTab ui={ui} saving={saving} onSave={() => void save()} />}
              footer={<Controls board={board} ui={ui}>{narrow && <SaveTab ui={ui} saving={saving} onSave={() => void save()} short />}</Controls>}
            />
          </div>
          <div className="w-illustration-sheetcol">
            <Sheet />
          </div>
          <div className="w-illustration-layer" role="group" aria-label="The nine stickers" aria-describedby="w-illustration-help">
            {STICKERS.map((s) => (
              <StickerView
                key={s.n}
                n={s.n}
                board={board}
                selected={ui.selected === s.n}
                tagMode={ui.tagMode}
                held={ui.held === s.n}
                onLid={ui.onLid[s.n - 1]}
                locked={locked}
                onDetails={openDetails}
              />
            ))}
          </div>
        </section>

        <aside className="w-illustration-how" aria-labelledby="w-illustration-how-h">
          <Tape at="top" color="butter" pattern="stripes" w="7rem" rotate={-2} />
          <h3 className="w-illustration-how-title" id="w-illustration-how-h">
            How it works
          </h3>
          <dl className="w-illustration-how-list">
            <div>
              <dt>Mouse</dt>
              <dd>Drag a sticker off the sheet and throw it. Double-click turns it (on the sheet it peels it off). Alt and the wheel resize it. A click opens its tag.</dd>
            </div>
            <div>
              <dt>Keyboard</dt>
              <dd>Tab to a sticker, Space picks it up, arrows move it, Space sticks it down. R turns it, plus and minus resize it, D opens its details, L and B send it to the lid or the sheet.</dd>
            </div>
            <div>
              <dt>Touch</dt>
              <dd>Press and hold a sticker for a moment, then drag it (or just drag it sideways). A swipe up or down that starts on a sticker still scrolls the page. Or tap it and choose Stick on lid. Double-tap turns it.</dd>
            </div>
          </dl>
        </aside>

        <Cast onOpen={(n, el) => openDetails(n, el)} />

        <div className="w-illustration-foot">
          <section className="w-illustration-why" aria-labelledby="w-illustration-why-h">
            <Tape at="tl" color="bubblegum" pattern="dots" w="6rem" />
            <Tape at="tr" color="marigold" pattern="stripes" w="5.5rem" />
            <h3 className="w-illustration-why-title" id="w-illustration-why-h">
              One outline, one halo, one colour each.
            </h3>
            <p className="w-illustration-why-text">
              I art-directed all nine so they read as one set: a single outline weight, a single white halo, a single flat accent per character. They are invented characters made with AI-assisted tools, not clients or real people.
            </p>
          </section>
          <WorldFacts work={work} tone={work.ink.toLowerCase() === '#fff2da' ? 'paper' : 'ink'} />
        </div>
      </div>

      {details !== null && <Lightbox n={details} onClose={closeDetails} onStep={stepDetails} />}

      <p id="w-illustration-help" className="pm-sr">
        Space picks it up. Arrows move it, Shift for bigger steps. Space sticks it down. R turns it, D opens details, Escape puts it back.
      </p>
      <div className="pm-sr" role="status" aria-live="polite" aria-atomic="true">
        <span key={ui.seq}>{ui.message}</span>
        <span>{saveMsg}</span>
      </div>
    </div>
  )
}
