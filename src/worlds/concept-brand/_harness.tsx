// DEV-ONLY harness: the real WorldHost / WorldShell without the cabinet's sections (see _harness.html).
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { LayoutGroup, MotionConfig } from 'framer-motion'
import '../../styles/tokens.css'
import '../../styles/typography.css'
import '../../styles/fonts.css'
import '../../styles/base.css'
import { useMotion } from '../../lib/motion'
import { loadHandFonts } from '../../styles/fonts'
import WorldHost from '../WorldHost'
import ToastLayer from '../../components/chrome/ToastLayer'
import CustomCursor from '../../components/chrome/CustomCursor'
import '../../components/chrome/chrome.css'

function Harness() {
  const { paused } = useMotion()
  useEffect(() => {
    void loadHandFonts()
  }, [])
  return (
    <MotionConfig reducedMotion={paused ? 'always' : 'user'}>
      <LayoutGroup>
        <div id="app-root">
          <div className="pm-desk" aria-hidden="true" />
          <main id="main" tabIndex={-1} style={{ minHeight: '100vh' }} />
        </div>
        <WorldHost />
        <div className="pm-grain" aria-hidden="true" />
        <ToastLayer />
        <CustomCursor />
      </LayoutGroup>
    </MotionConfig>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Harness />
  </StrictMode>,
)
