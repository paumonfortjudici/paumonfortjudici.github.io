// World 2: Plana Digital, "Brand Atlas". An atlas of the brand on one big sheet of paper lying in the pine folder: seven numbered plates
// of different sizes, each with its own small interaction (see docs/api/world-plana.md). Everything lives in src/worlds/plana/.
import { useEffect } from 'react'
import './plana/plana.css' // first: the plates' own css files come after it and win on equal specificity
import { WorldFacts } from '../components/primitives'
import { loadHandFonts } from '../styles/fonts'
import { useWorld } from './WorldContext'
import Colour from './plana/Colour'
import { Horizon } from './plana/Horizon'
import { Contents, IntroTitle } from './plana/Intro'
import Lockups from './plana/Lockups'
import Manual from './plana/Manual'
import Mockups from './plana/Mockups'
import Sunrise from './plana/Sunrise'
import TypeTester from './plana/TypeTester'
import Website from './plana/Website'

export default function PlanaWorld() {
  const { work } = useWorld()

  useEffect(() => {
    void loadHandFonts()
  }, [])

  return (
    <div className="w-plana">
      <div className="w-plana-sheet">
        <div className="w-plana-grid">
          <IntroTitle />
          <Sunrise />
          <Contents />
          <Lockups />
          <Colour />
          <TypeTester />
          <Mockups />
          <Manual />
          <Website />
        </div>
      </div>

      <div className="w-plana-foot">
        <WorldFacts work={work} tone="paper">
          Plana Digital is my new web studio in Cardedeu. I designed the identity, the brand manual, the logo and the website layout. Every mockup here is a
          sample: the contact details, the bakery and the Instagram numbers inside them are placeholders, not real clients. Text inside the images is Spanish
          and Catalan; the English captions are mine.
        </WorldFacts>
      </div>

      {/* the atlas ends where the symbol began: a sun on the horizon (it rises as you scroll), and the manual's own closing line */}
      <Horizon />
    </div>
  )
}
