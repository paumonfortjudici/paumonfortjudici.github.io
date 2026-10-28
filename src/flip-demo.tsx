// DEV ONLY: demo page for the in-house FlipBook (http://127.0.0.1:<port>/flip.html). Not part of the shipped site.
import { StrictMode, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
// the same CSS stack as the site, so the book is seen with the real base, tokens and shared tab buttons
import './styles/tokens.css'
import './styles/typography.css'
import './styles/fonts.css'
import './styles/base.css'
import './styles/primitives.css'
import './components/flip/demo.css'
import { FlipBook, type FlipBookHandle, type FlipPage, type FlipSpreadInfo } from './components/flip'
import { asset } from './lib/asset'

interface ContractManifest {
  pages: { n: number; file: string; w: number; h: number; note: string; kind: string }[]
  totalPagesInIssue: number
  credit: { circleBboxPct: [number, number, number, number] }
}
interface GuiltyManifest {
  book: { pages: number }
  cover: { front: { file: string; w: number; h: number; alt: string }; back: { file: string; w: number; h: number; alt: string } }
  flipbook: { pages: { file: string; w: number; h: number; alt: string; sourcePage: number }[] }
}

/** A hand-drawn circle around Pau's credit on magazine page 4 (percent coordinates of the page). */
function CreditCircle({ box }: { box: [number, number, number, number] }) {
  const [x, y, w, h] = box
  return (
    <svg
      className="demo-circle"
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, overflow: 'visible' }}
    >
      <path d="M7 24 C 3 8, 38 0, 68 2 C 97 4, 102 26, 86 35 C 66 45, 20 43, 9 32 C 3 26, 5 13, 17 7" pathLength={1} />
    </svg>
  )
}

function useJson<T>(url: string): T | null {
  const [data, setData] = useState<T | null>(null)
  useEffect(() => {
    let live = true
    fetch(url)
      .then((r) => r.json())
      .then((j) => live && setData(j as T))
      .catch(() => undefined)
    return () => {
      live = false
    }
  }, [url])
  return data
}

function Fps({ run }: { run: boolean }) {
  const [txt, setTxt] = useState('fps -')
  useEffect(() => {
    if (!run) return
    let raf = 0
    let last = performance.now()
    const dts: number[] = []
    const w = window as unknown as { __fps?: { dts: number[] } }
    w.__fps = { dts }
    const loop = (now: number) => {
      dts.push(now - last)
      if (dts.length > 240) dts.shift()
      last = now
      if (dts.length % 20 === 0) {
        const recent = dts.slice(-60)
        const avg = recent.reduce((a, b) => a + b, 0) / recent.length
        const worst = Math.max(...recent)
        setTxt(`${(1000 / avg).toFixed(0)} fps, worst frame ${worst.toFixed(0)} ms`)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [run])
  return <output className="demo-fps">{run ? txt : 'fps meter off'}</output>
}

function Demo() {
  const params = useMemo(() => new URLSearchParams(location.search), [])
  const only = params.get('only')
  const bare = params.get('bare') === '1'
  const maxH = params.get('h') ?? '66'
  const [still, setStill] = useState(params.get('still') === '1')
  const [flat, setFlat] = useState(params.get('curl') === 'flat')
  const [hard, setHard] = useState(params.get('hard') === '1')
  const [winKeys, setWinKeys] = useState(false)
  const [meter, setMeter] = useState(params.get('fps') !== '0')
  const [strips, setStrips] = useState(Number(params.get('strips') ?? 22))
  const [gloss, setGloss] = useState(Number(params.get('gloss') ?? 0.5))
  const [spread, setSpread] = useState<FlipSpreadInfo | null>(null)
  // 'off' = uncontrolled, 'live' = controlled and the parent follows, 'locked' = controlled and the parent refuses every change
  const [ctl, setCtl] = useState<'off' | 'live' | 'locked'>('off')
  const [ctlPage, setCtlPage] = useState(3)
  const controlled = ctl === 'off' ? undefined : ctlPage

  const magRef = useRef<FlipBookHandle>(null)
  const bookRef = useRef<FlipBookHandle>(null)
  const narrowRef = useRef<FlipBookHandle>(null)
  const oddRef = useRef<FlipBookHandle>(null)

  const contract = useJson<ContractManifest>(asset('/works/contract/manifest.json'))
  const guilty = useJson<GuiltyManifest>(asset('/works/spelled-guilty/manifest.json'))

  const magPages = useMemo<FlipPage[]>(() => {
    if (!contract) return []
    return contract.pages.map((pg) => ({
      id: `p-${String(pg.n).padStart(3, '0')}`,
      src: asset(`/works/contract/${pg.file}`),
      alt: pg.n === 1 ? `Front cover. ${pg.note}` : pg.n === 230 ? `Back cover. ${pg.note}` : `Magazine page ${pg.n}. ${pg.note}`,
      width: pg.w,
      height: pg.h,
      kind: pg.n === 1 ? 'cover' : pg.n === 230 ? 'back' : 'page',
      n: pg.n,
      overlay: pg.n === 4 ? <CreditCircle box={contract.credit.circleBboxPct} /> : undefined,
    }))
  }, [contract])

  const bookPages = useMemo<FlipPage[]>(() => {
    if (!guilty) return []
    const f = guilty.cover.front
    const b = guilty.cover.back
    return [
      { id: 'cover-front', src: asset(`/works/spelled-guilty/${f.file}`), alt: f.alt, width: f.w, height: f.h, kind: 'cover' as const },
      ...guilty.flipbook.pages.map((pg) => ({
        id: pg.file.replace(/^pages\//, '').replace(/\.webp$/, ''),
        src: asset(`/works/spelled-guilty/${pg.file}`),
        alt: pg.alt,
        width: pg.w,
        height: pg.h,
        n: pg.sourcePage,
      })),
      { id: 'cover-back', src: asset(`/works/spelled-guilty/${b.file}`), alt: b.alt, width: b.w, height: b.h, kind: 'back' as const },
    ]
  }, [guilty])

  // expose handles for the test harness
  useEffect(() => {
    const w = window as unknown as { __flip?: Record<string, FlipBookHandle | null> }
    w.__flip = {
      get mag() {
        return magRef.current
      },
      get book() {
        return bookRef.current
      },
      get narrow() {
        return narrowRef.current
      },
      get odd() {
        return oddRef.current
      },
    }
  })

  // edge cases for tests: ?only=odd&n=<pages>&cover=0|1&back=0|1
  const oddPages = useMemo<FlipPage[]>(() => {
    if (!guilty || only !== 'odd') return []
    const n = Number(params.get('n') ?? 7)
    const inner = guilty.flipbook.pages.slice(0, n).map((pg, i) => ({
      id: 'odd-' + i,
      src: asset(`/works/spelled-guilty/${pg.file}`),
      alt: pg.alt,
      width: pg.w,
      height: pg.h,
      n: i + 1,
    }))
    const f = guilty.cover.front
    const b = guilty.cover.back
    const out: FlipPage[] = []
    if (params.get('cover') !== '0') out.push({ id: 'odd-c', src: asset(`/works/spelled-guilty/${f.file}`), alt: f.alt, width: f.w, height: f.h, kind: 'cover' })
    out.push(...inner)
    if (params.get('back') !== '0') out.push({ id: 'odd-b', src: asset(`/works/spelled-guilty/${b.file}`), alt: b.alt, width: b.w, height: b.h, kind: 'back' })
    return out
  }, [guilty, only, params])

  const show = (id: string) => !only || only === id
  const common = { curl: flat ? ('flat' as const) : ('strips' as const), strips, gloss, reducedMotion: still, hardCover: hard, keys: winKeys ? ('window' as const) : ('focus' as const) }

  return (
    <div className={bare ? "demo demo--bare" : "demo"} style={{ ["--flip-max-h" as string]: maxH + "vh" }}>
      <header className="demo-head">
        <h1>FlipBook demo</h1>
        <p>Dev only. Drag a page from its outer edge, click the outer 20 %, use the arrow keys, Home / End, the tabs or the scrubber.</p>
        <fieldset className="demo-opts">
          <legend>Options</legend>
          <label><input type="checkbox" checked={still} onChange={(e) => setStill(e.target.checked)} /> Reduced motion</label>
          <label><input type="checkbox" checked={flat} onChange={(e) => setFlat(e.target.checked)} /> Flat leaf (variant b)</label>
          <label><input type="checkbox" checked={hard} onChange={(e) => setHard(e.target.checked)} /> Hard cover</label>
          <label><input type="checkbox" checked={winKeys} onChange={(e) => setWinKeys(e.target.checked)} /> Arrow keys on the whole page</label>
          <label><input type="checkbox" checked={meter} onChange={(e) => setMeter(e.target.checked)} /> FPS meter</label>
          <label>Strips <input type="range" min={8} max={32} value={strips} onChange={(e) => setStrips(Number(e.target.value))} /> {strips}</label>
          <label>Gloss <input type="range" min={0} max={1} step={0.05} value={gloss} onChange={(e) => setGloss(Number(e.target.value))} /> {gloss.toFixed(2)}</label>
          <button type="button" onClick={() => (window as unknown as { __unmount?: () => void }).__unmount?.()}>Unmount demo</button>
          <Fps run={meter} />
        </fieldset>
      </header>

      {show('mag') ? (
        <section className="demo-panel demo-panel--tomato" id="mag" aria-labelledby="mag-h">
          <h2 id="mag-h">Magazine mode: Proyecto Contract, 30 pages of a 230-page issue</h2>
          {magPages.length ? (
            <FlipBook
              ref={magRef}
              pages={magPages}
              totalPages={contract?.totalPagesInIssue}
              aspect={1000 / 1331}
              aria-label="Proyecto Contract, Hotel Design 18"
              page={controlled}
              onPageChange={(sp) => {
                if (ctl === 'live') setCtlPage(sp)
              }}
              onSpreadChange={setSpread}
              {...common}
            />
          ) : (
            <p>Loading the manifest…</p>
          )}
          <div className="demo-row">
            <button type="button" onClick={() => magRef.current?.goToPage('p-004')}>Find my name (page 4)</button>
            <button type="button" onClick={() => magRef.current?.goToPage('p-220')}>Jump to page 220</button>
            <button type="button" onClick={() => magRef.current?.goTo(0)}>Back to the cover</button>
            <button type="button" onClick={() => magRef.current?.hint()}>Hint</button>
            <button type="button" onClick={() => setCtl((c) => (c === 'off' ? 'live' : c === 'live' ? 'locked' : 'off'))}>{ctl === 'off' ? 'Uncontrolled' : ctl === 'live' ? 'Controlled (follows)' : 'Controlled (locked at ' + (ctlPage + 1) + ')'}</button>
            <output className="demo-cap" aria-live="off">{spread ? `${spread.index + 1} / ${spread.count}: ${spread.text}` : ''}</output>
          </div>
        </section>
      ) : null}

      {show('book') ? (
        <section className="demo-panel demo-panel--oxblood" id="book" aria-labelledby="book-h">
          <h2 id="book-h">Book mode: Spelled Guilty, a 6 × 9 in paperback (16 pages, 8 spreads + covers)</h2>
          {bookPages.length ? (
            <FlipBook
              ref={bookRef}
              pages={bookPages}
              totalPages={guilty?.book.pages}
              aspect={900 / 1350}
              aria-label="Spelled Guilty, sample pages"
              className="demo-book"
              {...common}
              gloss={Math.min(gloss, 0.2)}
            />
          ) : (
            <p>Loading the manifest…</p>
          )}
        </section>
      ) : null}

      {only === 'odd' ? (
        <section className="demo-panel demo-panel--oxblood" id="odd" aria-label="Edge cases">
          {oddPages.length ? <FlipBook ref={oddRef} pages={oddPages} aspect={900 / 1350} aria-label="Edge case book" {...common} gloss={0.15} /> : null}
        </section>
      ) : null}

      {show('narrow') ? (
        <section className="demo-panel demo-panel--lilac" id="narrow" aria-labelledby="narrow-h">
          <h2 id="narrow-h">390 px wide: single-page mode</h2>
          <div className="demo-phone">
            {bookPages.length ? (
              <FlipBook ref={narrowRef} pages={bookPages} totalPages={guilty?.book.pages} aspect={900 / 1350} aria-label="Spelled Guilty on a phone" {...common} gloss={0.15} />
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  )
}

const root: Root = createRoot(document.getElementById('root')!)
;(window as unknown as { __unmount: () => void }).__unmount = () => {
  root.unmount()
  const el = document.getElementById('root')
  if (el) el.textContent = 'Demo unmounted.'
}
root.render(
  <StrictMode>
    <Demo />
  </StrictMode>,
)
