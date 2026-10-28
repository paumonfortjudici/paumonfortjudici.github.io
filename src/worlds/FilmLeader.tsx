// The Suspense fallback while a world chunk (and its display face) loads: a film-leader countdown ring + "Developing…".
// It waits 180 ms before showing anything, so a world that loads instantly never flashes a loader.
// The sweep and the digits are ambient loops (class pm-ambient): paused / reduced motion leave a still ring showing "3".
import { useEffect, useState } from 'react'
import { UI } from '../lib/copy'

export default function FilmLeader() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(() => setVisible(true), 180)
    return () => window.clearTimeout(id)
  }, [])

  if (!visible) return <div className="pm-leader pm-leader--wait" aria-hidden="true" />

  return (
    <div className="pm-leader" role="status">
      <svg className="pm-leader-art" viewBox="0 0 240 240" aria-hidden="true" focusable="false">
        <circle cx="120" cy="120" r="104" fill="none" stroke="currentColor" strokeWidth="4" />
        <circle cx="120" cy="120" r="86" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M120 4V236M4 120H236" fill="none" stroke="currentColor" strokeWidth="2" />
        <path className="pm-leader-sweep pm-ambient" d="M120 120V16A104 104 0 0 1 224 120Z" fill="currentColor" />
        <text className="pm-leader-digit pm-leader-digit--3 pm-ambient" x="120" y="152" textAnchor="middle">
          3
        </text>
        <text className="pm-leader-digit pm-leader-digit--2 pm-ambient" x="120" y="152" textAnchor="middle">
          2
        </text>
        <text className="pm-leader-digit pm-leader-digit--1 pm-ambient" x="120" y="152" textAnchor="middle">
          1
        </text>
      </svg>
      <p className="pm-leader-text t-label">{UI.world.developing}</p>
    </div>
  )
}
