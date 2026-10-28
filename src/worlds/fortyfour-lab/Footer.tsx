// The end of the page: a fringe of yarn hanging from the rug's last edge over the folder's own marigold, then "the label on the back":
// the facts slate (role, year, tools, the Instagram ticket) and, hung from the fringe on a loop of yarn, the whole logo as it was drawn.
import { WorldFacts } from '../../components/primitives'
import { asset } from '../../lib/asset'
import { useWorld } from '../WorldContext'

export default function Footer() {
  const { work: registered } = useWorld()
  // the registry lists the tool as hand-drawn, which reads as the tool for the rugs; the notes only support the tufting gun (the 74 s clip)
  const work = { ...registered, tools: ['Tufting gun'] }
  return (
    <div className="w-fortyfour-lab-foot">
      <div className="w-fortyfour-lab-fringe" aria-hidden="true" />
      <div className="w-fortyfour-lab-foot-grid">
        <div className="w-fortyfour-lab-foot-main">
          <h3 className="w-fortyfour-lab-end-title">The label on the back</h3>
          <WorldFacts work={work} tone="ink">
            Photos and clips come from the @fortyfour.lab Instagram account and are shown here as portfolio samples. The short captions are my own English versions.
          </WorldFacts>
        </div>
        <div className="w-fortyfour-lab-foot-side">
          <figure className="w-fortyfour-lab-badge">
            <span className="w-fortyfour-lab-badge-cord" aria-hidden="true" />
            <span className="w-fortyfour-lab-badge-eyelet" aria-hidden="true" />
            <img
              src={asset('/works/fortyfour-lab/logo/devil.webp')}
              alt="The 44 Lab logo: the red devil with his trident, walking under the curved yellow lettering 44 LAB, on tan."
              width={1600}
              height={1600}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
            <figcaption className="w-fortyfour-lab-badge-note">the whole logo</figcaption>
          </figure>
        </div>
      </div>
    </div>
  )
}
