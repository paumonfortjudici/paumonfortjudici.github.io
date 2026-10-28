// The end of the page: a fringe of yarn hanging from the rug's last edge over the folder's own marigold (now tufted too), then "the label on the back":
// the facts slate (role, year, tools, the Instagram ticket), the whole logo hung from the fringe on a loop of yarn, and a ribbon that lists all thirteen
// posts in date order (made from the posts data, so it can only say what the wall says; each cell scrolls the wall back to its tag).
import { WorldFacts } from '../../components/primitives'
import { asset } from '../../lib/asset'
import { useWorld } from '../WorldContext'
import { longDate, stampText, timecode } from './format'
import { POSTS, type Post } from './posts'

const FIRST = POSTS[0].date
const LAST = POSTS[POSTS.length - 1].date

/** '2023-03-08' -> '8 MAR' (the year is said once, in the heading) */
function shortStamp(date: string) {
  return stampText(date).replace(/ \d{4}$/, '')
}

function kindOf(post: Post): { key: 'photos' | 'clip' | 'still'; label: string } {
  if (post.type === 'carousel') return { key: 'photos', label: `${post.slides.length} slides` }
  if (post.still) return { key: 'still', label: 'Still' }
  const seconds = post.slides.find((s) => s.video)?.video?.seconds
  return { key: 'clip', label: seconds ? timecode(seconds) : 'Clip' }
}

function goTo(index: number, from: HTMLElement) {
  const root = from.closest('.w-fortyfour-lab')
  const tag = root?.querySelector<HTMLElement>(`[data-ffl-post="${index}"]`)
  if (!tag) return
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.getAttribute('data-motion') === 'paused'
  tag.scrollIntoView({ block: 'center', behavior: calm ? 'auto' : 'smooth' })
}

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
          <p className="w-fortyfour-lab-foot-hint">
            <svg viewBox="0 0 90 70" width="90" height="70" aria-hidden="true" focusable="false">
              <path d="M22 4C6 18 20 40 46 58" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              <path d="M30 52L47 60L56 42" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>every cell below jumps back to its tag</span>
          </p>
        </div>
      </div>

      <section className="w-fortyfour-lab-ribbon" aria-labelledby="ffl-ribbon-h">
        <h4 id="ffl-ribbon-h" className="w-fortyfour-lab-ribbon-title">
          <span>All {POSTS.length} posts, in order</span>
          <span className="w-fortyfour-lab-ribbon-span">
            {shortStamp(FIRST)} to {stampText(LAST)}
          </span>
        </h4>
        <ol className="w-fortyfour-lab-ribbon-list">
          {POSTS.map((post, i) => {
            const kind = kindOf(post)
            return (
              <li key={post.id}>
                <button
                  type="button"
                  className="w-fortyfour-lab-cell"
                  data-kind={kind.key}
                  data-cursor="Go"
                  aria-label={`Go to ${post.title}, ${longDate(post.date)}, ${kind.key === 'photos' ? kind.label : kind.key === 'clip' ? `clip, ${kind.label}` : 'still frame'}`}
                  onClick={(e) => goTo(i, e.currentTarget)}
                >
                  <span className="w-fortyfour-lab-cell-n" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="w-fortyfour-lab-cell-date" aria-hidden="true">
                    {shortStamp(post.date)}
                  </span>
                  <span className="w-fortyfour-lab-cell-kind" aria-hidden="true">
                    {kind.label}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}
