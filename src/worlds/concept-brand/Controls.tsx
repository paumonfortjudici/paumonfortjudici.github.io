// Zoom controls drawn as bar objects: a crown-cap dial in the middle (it turns as you zoom, press it to fit the whole board) and two
// coasters, one to zoom out and one to zoom in. Real buttons, 44 px or more, labelled.
import { useMemo, useSyncExternalStore } from 'react'
import { UI_TEXT } from './copy'

/** the camera's zoom as an external store: the wall writes it, the dial reads it (the wall itself does not re-render per frame) */
export interface CamStore {
  scale: number
  listeners: Set<() => void>
  percent: () => number
  subscribe: (cb: () => void) => () => void
}

export function makeStore(): CamStore {
  const store: CamStore = {
    scale: 0.2,
    listeners: new Set(),
    percent: () => Math.round(store.scale * 100),
    subscribe: (cb) => {
      store.listeners.add(cb)
      return () => store.listeners.delete(cb)
    },
  }
  return store
}

interface ControlsProps {
  store: CamStore
  atFit: boolean
  onFit: () => void
  onIn: () => void
  onOut: () => void
}

const TEETH = 21

/** a crown cap outline: 21 outward scallops around a circle */
function capPath(r: number): string {
  const pts: [number, number][] = []
  for (let i = 0; i < TEETH; i++) {
    const a = (i / TEETH) * Math.PI * 2 - Math.PI / 2
    pts.push([Math.cos(a) * r, Math.sin(a) * r])
  }
  const chord = 2 * r * Math.sin(Math.PI / TEETH)
  const rt = chord * 0.62
  let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`
  for (let i = 1; i <= TEETH; i++) {
    const p = pts[i % TEETH]
    d += `A${rt.toFixed(2)} ${rt.toFixed(2)} 0 0 1 ${p[0].toFixed(2)} ${p[1].toFixed(2)}`
  }
  return `${d}Z`
}

export default function Controls({ store, atFit, onFit, onIn, onOut }: ControlsProps) {
  const percent = useSyncExternalStore(store.subscribe, store.percent, store.percent)
  const rim = useMemo(() => capPath(35), [])
  // the cap turns with the zoom: a quarter turn each time the board doubles in size
  const turn = Math.log2(Math.max(percent, 1) / 17) * 90
  return (
    <div className="w-concept-brand-controls" role="group" aria-label="Zoom">
      <button type="button" className="w-concept-brand-coaster" data-kind="out" onClick={onOut} aria-label={UI_TEXT.zoomOut} data-cursor="Open">
        <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
          <circle className="w-concept-brand-coaster-body" cx="32" cy="32" r="29" />
          <circle className="w-concept-brand-coaster-ring" cx="32" cy="32" r="23" />
          <path className="w-concept-brand-coaster-sign" d="M21 32.4C27 31.6 37 33 43 32" />
        </svg>
      </button>
      <button
        type="button"
        className="w-concept-brand-cap"
        onClick={onFit}
        aria-label={`${UI_TEXT.fit}. Zoom is ${percent} percent.`}
        data-at-fit={atFit ? 'true' : undefined}
        data-cursor="Open"
      >
        <svg viewBox="-40 -40 80 80" aria-hidden="true" focusable="false">
          <g className="w-concept-brand-cap-rim" style={{ transform: `rotate(${turn.toFixed(1)}deg)` }}>
            <path className="w-concept-brand-cap-teeth" d={rim} />
          </g>
          <circle className="w-concept-brand-cap-face" r="24" />
          <path className="w-concept-brand-cap-shine" d="M-15 -11C-11 -17 -4 -19 2 -19" />
          <text className="w-concept-brand-cap-text" y="5" textAnchor="middle">
            {percent}%
          </text>
        </svg>
      </button>
      <button type="button" className="w-concept-brand-coaster" data-kind="in" onClick={onIn} aria-label={UI_TEXT.zoomIn} data-cursor="Open">
        <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
          <circle className="w-concept-brand-coaster-body" cx="32" cy="32" r="29" />
          <circle className="w-concept-brand-coaster-ring" cx="32" cy="32" r="23" />
          <path className="w-concept-brand-coaster-sign" d="M21 32.4C27 31.6 37 33 43 32M32.3 21C31.6 27 33 37 32 43" />
        </svg>
      </button>
    </div>
  )
}
