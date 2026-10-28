// DEV-ONLY: the live top zone (or the whole board with ?board=1) at 1:1, no zoom, so it can be diffed against the finished board.webp. See _top.html.
import { createRoot } from 'react-dom/client'
import '../../styles/tokens.css'
import '../../styles/typography.css'
import '../../styles/fonts.css'
import '../../styles/base.css'
import '@fontsource/barlow-semi-condensed/latin-700.css'
import './wall.css'
import Board from './Board'
import TopZone from './TopZone'
import { NONE } from './data'

const params = new URLSearchParams(location.search)
const none = { gotet: false, oliva: false, sifo: false, xip: false }
const zero = { gotet: 0, oliva: 0, sifo: 0, xip: 0 }
const way = (params.get('way') as 'faint') || 'faint'
const speech = { active: none, hop: zero, said: null, trigger: () => undefined }

createRoot(document.getElementById('root')!).render(
  params.get('board') ? (
    <div className="w-concept-brand" style={{ position: 'relative', width: 3000, height: 4243, background: '#2340c0', overflow: 'hidden' }}>
      <Board
        sel={NONE}
        landed
        colourway={way}
        still
        detail={false}
        view={null}
        full
        speech={speech}
        chosen={null}
        onSelect={() => undefined}
        onEnsureVisible={() => undefined}
        wasDrag={() => false}
        style={{ left: 0, top: 0, '--z': 1 } as React.CSSProperties}
      />
    </div>
  ) : (
    <div className="w-concept-brand" style={{ position: 'relative', width: 3000, height: 1560, background: '#2340c0', overflow: 'hidden' }}>
      <TopZone colourway={way} wallpaper={false} active={none} hop={zero} still chosen={null} />
    </div>
  ),
)
