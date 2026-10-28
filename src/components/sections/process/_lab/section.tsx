// DEV-ONLY: the Process section on its own (so other agents' work in progress cannot break the test page).
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { LayoutGroup, MotionConfig } from 'framer-motion'
import '../../../../styles/tokens.css'
import '../../../../styles/typography.css'
import '../../../../styles/fonts.css'
import '../../../../styles/base.css'
import { loadHandFonts } from '../../../../styles/fonts'
import { setMotionPaused, useMotion } from '../../../../lib/motion'
import Process from '../../Process'

function Page() {
  const { paused } = useMotion()
  useEffect(() => {
    void loadHandFonts()
    if (new URLSearchParams(location.search).get('paused') === '1') setMotionPaused(true)
  }, [])
  return (
    <MotionConfig reducedMotion={paused ? 'always' : 'user'}>
      <LayoutGroup>
        <div id="app-root" style={{ paddingTop: 12 }}>
          <main id="main" tabIndex={-1}>
            <Process />
          </main>
        </div>
        <div className="pm-grain" aria-hidden="true" />
      </LayoutGroup>
    </MotionConfig>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
