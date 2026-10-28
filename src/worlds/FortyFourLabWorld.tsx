// World 3: 44 Lab, "Workshop Wall". A tufted rug hung from a marigold rail: the hero (wordmark, profile label, intro), then all thirteen
// Instagram posts as hang tags on one vertical thread, in date order, under huge month banners. A hand-drawn devil walks the thread as
// you scroll. Carousels are rings of tags you flip; four posts carry clips that play muted while they are on screen; six reels are stills.
// Docs: docs/api/world-fortyfour-lab.md
import { useEffect, useRef } from 'react'
import { useMediaQuery } from '../lib/hooks'
import { loadHandFonts } from '../styles/fonts'
import './fortyfour-lab/fortyfour-lab.css'
import Feed from './fortyfour-lab/Feed'
import Footer from './fortyfour-lab/Footer'
import Hero from './fortyfour-lab/Hero'
import Thread from './fortyfour-lab/Thread'
import { WIDE_QUERY } from './fortyfour-lab/format'
import { FUZZ_PILE, WALL_PILE, pileUrl } from './fortyfour-lab/pile'

// start the pile tiles and the hand-writing face as soon as the chunk is evaluated (the folder is still opening); the tiles are made in a worker
void pileUrl(WALL_PILE)
void pileUrl(FUZZ_PILE)
void loadHandFonts()

export default function FortyFourLabWorld() {
  const rootRef = useRef<HTMLDivElement>(null)
  const wallRef = useRef<HTMLDivElement>(null)
  const wide = useMediaQuery(WIDE_QUERY)

  // the tiles arrive a moment after the first paint: they go straight onto the root as custom properties (no React state, so nothing
  // under the root re-renders) and the flat tan fades into the pile
  useEffect(() => {
    let alive = true
    void Promise.all([pileUrl(WALL_PILE), pileUrl(FUZZ_PILE)]).then(([wall, fuzz]) => {
      const root = rootRef.current
      if (!alive || !root) return
      if (fuzz) root.style.setProperty('--ffl-fuzz', 'url(' + fuzz + ')')
      if (wall) {
        root.style.setProperty('--ffl-pile', 'url(' + wall + ')')
        root.setAttribute('data-pile', '')
      }
    })
    return () => {
      alive = false
    }
  }, [])

  return (
    <div ref={rootRef} className="w-fortyfour-lab">
      <div className="w-fortyfour-lab-rail" aria-hidden="true">
        <span className="w-fortyfour-lab-loops" />
      </div>

      <div ref={wallRef} className="w-fortyfour-lab-wall">
        <span className="w-fortyfour-lab-border" data-side="left" aria-hidden="true" />
        <span className="w-fortyfour-lab-border" data-side="right" aria-hidden="true" />

        <Hero />
        <Feed wide={wide} />
        <Thread wallRef={wallRef} />
      </div>

      <Footer />
    </div>
  )
}
