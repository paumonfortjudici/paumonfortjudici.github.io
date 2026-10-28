import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/typography.css'
import './styles/fonts.css'
import './styles/base.css'
import App from './App'

// framer-motion logs this once per motion component whenever the OS asks for reduced motion. It is a dev-only notice (the site
// honours the setting on purpose), so keep it from burying real warnings.
if (import.meta.env.DEV) {
  const warn = console.warn
  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].startsWith('You have Reduced Motion enabled')) return
    warn(...args)
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
