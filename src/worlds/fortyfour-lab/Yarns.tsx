// The logo's five yarns, as a tufter's shade card: one tuft of each colour with its name and hex. Press one to copy its hex.
// Colours are exactly the ones read from the logo art (public/works/fortyfour-lab/logo/manifest.json, palette_exact).
import { useCopy } from '../../lib/hooks'

interface Yarn {
  name: string
  hex: string
}

const YARNS: Yarn[] = [
  { name: 'Rug tan', hex: '#C9A269' },
  { name: 'Devil red', hex: '#E8673F' },
  { name: 'Outline', hex: '#2D2D2D' },
  { name: 'Cream', hex: '#FFE4AB' },
  { name: 'Horn yellow', hex: '#EDB52B' },
]

function YarnRow({ yarn }: { yarn: Yarn }) {
  const { copied, copy } = useCopy(yarn.hex)
  return (
    <li>
      <button
        type="button"
        className="w-fortyfour-lab-yarn"
        data-copied={copied ? '' : undefined}
        data-cursor="Copy"
        aria-label={`Copy the hex code of ${yarn.name}, ${yarn.hex}`}
        onClick={() => void copy()}
      >
        <span className="w-fortyfour-lab-yarn-tuft" aria-hidden="true" style={{ backgroundColor: yarn.hex }} />
        <span className="w-fortyfour-lab-yarn-name" aria-hidden="true">
          {yarn.name}
        </span>
        <span className="w-fortyfour-lab-yarn-hex t-label" aria-hidden="true">
          {copied ? 'Copied' : yarn.hex}
        </span>
      </button>
      <span className="pm-sr" role="status">
        {copied ? `Copied ${yarn.hex}` : ''}
      </span>
    </li>
  )
}

export default function Yarns() {
  return (
    <section className="w-fortyfour-lab-yarns" aria-label="The five yarns of the logo">
      <p className="w-fortyfour-lab-yarns-label t-label">The logo&rsquo;s five yarns</p>
      <ul className="w-fortyfour-lab-yarns-list">
        {YARNS.map((yarn) => (
          <YarnRow key={yarn.hex} yarn={yarn} />
        ))}
      </ul>
    </section>
  )
}
