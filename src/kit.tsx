// DEV-ONLY entry of kit.html: the gallery of every primitive (never imported by the production build).
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/typography.css'
import './styles/fonts.css'
import './styles/base.css'
import './components/primitives/kit.css'
import { loadHandFonts } from './styles/fonts'
import { KitGallery } from './components/primitives/KitGallery'

void loadHandFonts()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <KitGallery />
  </StrictMode>,
)
