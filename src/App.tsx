// The cabinet. Composition only: every piece lives in its own component.
//   #app-root   the page (skip link, desk, mast, nav, the six sheets, footer). It becomes `inert` while a world is open.
//   WorldHost   sits next to it, never inside: the open project world (overlay) mounts there.
//   .pm-grain   one static film-grain overlay above everything.
// Chrome agent: Mast, PillNav and Footer are placeholders to replace; add Desk, Toast, Intro and CustomCursor here.
import { useEffect } from 'react'
import { LayoutGroup, MotionConfig } from 'framer-motion'
import Footer from './components/chrome/Footer'
import Mast from './components/chrome/Mast'
import PillNav from './components/chrome/PillNav'
import About from './components/sections/About'
import Catalog from './components/sections/Catalog'
import Contact from './components/sections/Contact'
import Cover from './components/sections/Cover'
import Process from './components/sections/Process'
import Works from './components/sections/Works'
import { UI } from './lib/copy'
import { useMotion } from './lib/motion'
import { syncInitialScroll } from './lib/router'
import { loadHandFonts } from './styles/fonts'
import WorldHost from './worlds/WorldHost'

export default function App() {
  const { paused } = useMotion()

  useEffect(() => {
    syncInitialScroll()
    // the marker faces are only needed for margin notes: fetch them when the browser is idle
    const load = () => void loadHandFonts()
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(load, { timeout: 1500 })
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(load, 600)
    return () => window.clearTimeout(id)
  }, [])

  return (
    // reducedMotion: 'user' follows the OS; 'always' follows the visitor's "Pause motion" (framer-motion then stops transform + layout animations)
    <MotionConfig reducedMotion={paused ? 'always' : 'user'}>
      {/* one LayoutGroup for page and worlds, so a card and the world shell can share a layoutId across the two trees */}
      <LayoutGroup>
        <div id="app-root">
          <a className="pm-skip" href="#main">
            {UI.skipLink}
          </a>
          <div className="pm-desk" aria-hidden="true" />
          <Mast />
          <PillNav />
          <main id="main" tabIndex={-1}>
            <Cover />
            <Catalog />
            <About />
            <Works />
            <Process />
            <Contact />
          </main>
          <Footer />
        </div>
        <WorldHost />
        <div className="pm-grain" aria-hidden="true" />
      </LayoutGroup>
    </MotionConfig>
  )
}
