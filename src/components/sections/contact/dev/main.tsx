// DEV-ONLY harness: the Contact section alone, in the real CSS stack (so other agents' work in progress cannot break it).
// Not imported by the site. Open /src/components/sections/contact/dev/index.html on a dev server.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LayoutGroup, MotionConfig } from 'framer-motion'
import '../../../../styles/tokens.css'
import '../../../../styles/typography.css'
import '../../../../styles/fonts.css'
import '../../../../styles/base.css'
import { loadHandFonts } from '../../../../styles/fonts'
import { useMotion } from '../../../../lib/motion'
import Toast from '../../../chrome/ToastLayer'
import Contact from '../../Contact'

void loadHandFonts()

function Harness() {
  const { paused } = useMotion()
  return (
    <MotionConfig reducedMotion={paused ? 'always' : 'user'}>
      <LayoutGroup>
        <div id="app-root">
          <div className="pm-desk" aria-hidden="true" />
          <div style={{ height: '40vh' }} aria-hidden="true" />
          <main id="main" tabIndex={-1}>
            <Contact />
          </main>
          <div style={{ height: '16vh' }} aria-hidden="true" />
        </div>
        <Toast />
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
