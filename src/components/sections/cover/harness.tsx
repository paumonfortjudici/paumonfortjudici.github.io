// DEV-ONLY entry of harness.html: the real <Cover/> inside the real providers, with a stand-in for the chrome (mast + nav)
// and for the next sheet. ?intro=running|done|none sets html[data-intro] to test the wait for the intro.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LayoutGroup, MotionConfig } from 'framer-motion'
import '../../../styles/tokens.css'
import '../../../styles/typography.css'
import '../../../styles/fonts.css'
import '../../../styles/base.css'
import { loadHandFonts } from '../../../styles/fonts'
import { useMotion } from '../../../lib/motion'
import { syncInitialScroll } from '../../../lib/router'
import WorldHost from '../../../worlds/WorldHost'
import Cover from '../Cover'

const params = new URLSearchParams(window.location.search)
const intro = params.get('intro') ?? 'done'
if (intro !== 'none') document.documentElement.setAttribute('data-intro', intro === 'hold' ? 'running' : intro)
if (intro === 'running') window.setTimeout(() => document.documentElement.setAttribute('data-intro', 'done'), 1130)
void loadHandFonts()
const chromeH = Number(params.get('chrome') ?? 150)

function Harness() {
  const { paused } = useMotion()
  return (
    <MotionConfig reducedMotion={paused ? 'always' : 'user'}>
      <LayoutGroup>
        <div id="app-root">
          <div className="pm-desk" aria-hidden="true" />
          <header style={{ height: chromeH, display: 'grid', placeItems: 'center', color: 'var(--cream)', opacity: 0.5 }}>
            <span className="t-label">stand-in for the mast and the nav</span>
          </header>
          <main id="main" tabIndex={-1}>
            <Cover />
            <section id="catalog" style={{ width: 'var(--wrap)', margin: '0 auto 28px', height: 600, borderRadius: 26, background: 'var(--ink)' }} />
          </main>
          <a id="about" href="#about" style={{ display: 'block', height: 1 }} aria-hidden="true" tabIndex={-1} />
          <div id="works" style={{ height: 900 }} />
        </div>
        <WorldHost />
        <div className="pm-grain" aria-hidden="true" />
      </LayoutGroup>
    </MotionConfig>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Harness />
  </StrictMode>,
)
window.requestAnimationFrame(() => syncInitialScroll())
