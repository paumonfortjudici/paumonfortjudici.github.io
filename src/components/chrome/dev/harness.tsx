// DEV ONLY. A stand-in page for the chrome: the real Desk, Mast, index tabs, Footer, Toast, Intro and Cursor around six fake
// sheets with the real ids and tones, so the chrome can be built and tested while the sections are being written elsewhere.
// Open: http://127.0.0.1:<port>/src/components/chrome/dev/harness.html   (?intro=1 plays the intro, #/work/x fakes an open world)
import { StrictMode, useState, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { LayoutGroup, MotionConfig } from 'framer-motion'
import '../../../styles/tokens.css'
import '../../../styles/typography.css'
import '../../../styles/fonts.css'
import '../../../styles/base.css'
import { Sheet, StrokeWord, Stamp, TabButton } from '../../primitives'
import { useMotion } from '../../../lib/motion'
import { UI } from '../../../lib/copy'
import CustomCursor from '../CustomCursor'
import Desk from '../Desk'
import Footer from '../Footer'
import Intro from '../Intro'
import Mast from '../Mast'
import PillNav from '../PillNav'
import ToastLayer from '../ToastLayer'
import { toast } from '../toast'

function Fake({ id, tone, page, n, word, height, children }: { id: string; tone: 'cream' | 'ink' | 'marigold' | 'ultraviolet' | 'tomato'; page: string; n: number; word: string; height: string; children?: ReactNode }) {
  return (
    <Sheet id={id} tone={tone} page={page} n={n} style={{ minHeight: height }}>
      {n === 1 ? (
        <h1 style={{ margin: 0 }}>
          <StrokeWord as="span" text={word} size="clamp(4rem, 13vw, 15rem)" />
        </h1>
      ) : (
        <StrokeWord as="h2" text={word} size="clamp(4rem, 12vw, 14rem)" />
      )}
      <p className="t-lead" style={{ maxWidth: '46ch', marginTop: 24 }}>
        Stand-in sheet for the chrome harness. The real one is written by another agent.
      </p>
      {children}
    </Sheet>
  )
}

function Harness() {
  const { paused } = useMotion()
  const [world, setWorld] = useState(false)
  return (
    <MotionConfig reducedMotion={paused ? 'always' : 'user'}>
      <LayoutGroup>
        <div id="app-root" {...(world ? { inert: '' } : {})}>
          <a className="pm-skip" href="#main">
            {UI.skipLink}
          </a>
          <Desk />
          <Mast />
          <PillNav />
          <main id="main" tabIndex={-1}>
            <Fake id="cover" tone="cream" page="Cover" n={1} word="PORTFOLIO" height="62vh">
              <div style={{ display: 'flex', gap: 16, marginTop: 28, flexWrap: 'wrap', alignItems: 'center' }}>
                <TabButton tone="tomato" onClick={() => toast('Email copied — talk soon!')}>
                  Toast me
                </TabButton>
                <TabButton tone="ink" onClick={() => toast('Copied Tomato', { swatch: 'var(--tomato)', label: 'Colour', tone: 'cream' })}>
                  Colour toast
                </TabButton>
                <TabButton tone="lagoon" onClick={() => setWorld(true)} cursor="Open">
                  Fake world
                </TabButton>
                <a href="#catalog" data-cursor="Visit" style={{ padding: 12 }}>
                  a link with a Visit label
                </a>
                <input aria-label="test field" placeholder="native cursor here" style={{ padding: 8 }} />
                <Stamp text="Concept" tone="tomato" />
              </div>
            </Fake>
            <Fake id="catalog" tone="ink" page="Catalog" n={2} word="CATALOG" height="90vh" />
            <Fake id="about" tone="marigold" page="About" n={3} word="ABOUT ME" height="84vh" />
            <Fake id="works" tone="cream" page="Works" n={4} word="WORKS" height="120vh" />
            <Fake id="process" tone="ultraviolet" page="Process" n={5} word="PROCESS" height="82vh" />
            <Fake id="contact" tone="tomato" page="Contact" n={6} word="CONTACT" height="80vh" />
          </main>
          <Footer />
        </div>
        {world && (
          <div
            role="dialog"
            aria-modal="true"
            style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'var(--oxblood)', color: 'var(--cream)', display: 'grid', placeItems: 'center' }}
          >
            <div style={{ textAlign: 'center' }}>
              <p className="t-h3 t-display">A fake world is open.</p>
              <p>The nav, mast and desk must stay under this. The cursor and toast stay above it.</p>
              <TabButton tone="cream" onClick={() => setWorld(false)} cursor="Close" style={{ marginTop: 18 }}>
                Close
              </TabButton>
              <TabButton tone="butter" onClick={() => toast('Above the world')} style={{ marginTop: 18, marginLeft: 12 }}>
                Toast
              </TabButton>
            </div>
          </div>
        )}
        <ToastLayer />
        <div className="pm-grain" aria-hidden="true" />
        <Intro />
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
