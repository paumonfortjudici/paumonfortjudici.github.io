// DEV-ONLY lab for the Process art: scenes in their frame colours and the tool tokens on the sheet colour.
import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../../../../styles/tokens.css'
import '../../../../styles/typography.css'
import '../../../../styles/fonts.css'
import '../../../../styles/base.css'
import '../../../primitives'
import '../art.css'
import '../tokens.css'
import { loadHandFonts } from '../../../../styles/fonts'
import { SCENES } from '../scenes'
import { TOKEN_ART } from '../tokens'
import { TOOLS, STEP_STYLE } from '../data'

void loadHandFonts()

const COLORS = ['var(--marigold)', 'var(--bubblegum)', 'var(--tomato)', 'var(--lagoon)']

function Lab() {
  const params = new URLSearchParams(location.search)
  const only = params.get('only')
  const [dev, setDev] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setDev(true), 200)
    return () => window.clearTimeout(t)
  }, [])
  return (
    <div style={{ padding: 20, background: 'var(--desk)', minHeight: '100vh' }}>
      <div style={{ display: 'grid', gridTemplateColumns: only ? '1fr' : 'repeat(2, 560px)', gap: 24, justifyContent: 'center' }}>
        {SCENES.map((Scene, i) =>
          only && Number(only) !== i + 1 ? null : (
            <div key={i} id={`scene-${i + 1}`} style={{ ['--c' as string]: COLORS[i], background: COLORS[i], backgroundImage: 'var(--pm-grain)', borderRadius: 14, padding: 0, width: 560 }} data-tone={STEP_STYLE[i].tone}>
              <div className="pm-proc-lab-frame" style={{ ['--c' as string]: COLORS[i] }}>
                <Scene dev={dev} />
              </div>
            </div>
          ),
        )}
      </div>
      {!only && (
        <div id="tokens" style={{ marginTop: 30, background: 'var(--ultraviolet)', padding: 30, display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', borderRadius: 14 }}>
          {TOOLS.map((t) => {
            const Art = TOKEN_ART[t.id]
            return (
              <div key={t.id} style={{ display: 'flex', gap: 20 }}>
                <div className="pm-proc-tk"><Art /></div>
                <div className="pm-proc-tk" data-hot=""><Art /></div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Lab />
  </StrictMode>,
)
