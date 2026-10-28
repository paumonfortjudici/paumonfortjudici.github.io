// The first screen: the wordmark, the profile card (a woven maker's label) and the intro. The big devil is not here: he is the walker
// (see Thread.tsx) and starts out standing in the empty slot this component leaves for him on the right.
import { Scribble, Ticket } from '../../components/primitives'
import { asset } from '../../lib/asset'
import { BubbleIcon, PlaneIcon, SpoolIcon } from './icons'
import { FIRST_DATE, LAST_DATE, dayMonth, longDate } from './format'
import { POSTS } from './posts'

const LOGO = '/works/fortyfour-lab/logo/'
const POSTS_DIR = '/works/fortyfour-lab/posts/'
export const INSTAGRAM = 'https://www.instagram.com/fortyfour.lab/'

const numberWords = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen']

export default function Hero() {
  const count = numberWords[POSTS.length] ?? String(POSTS.length)
  return (
    <div className="w-fortyfour-lab-hero">
      <h2 className="pm-sr">44 Lab: the workshop wall</h2>

      <img
        className="w-fortyfour-lab-wordmark"
        src={asset(`${LOGO}wordmark-44lab.webp`)}
        alt="44 Lab"
        width={1420}
        height={456}
        decoding="async"
        {...{ fetchpriority: 'high' }}
      />

      {/* the empty place where the devil stands before he starts to walk */}
      <div className="w-fortyfour-lab-slot" data-ffl-slot aria-hidden="true" />

      <aside className="w-fortyfour-lab-profile" aria-label="The @fortyfour.lab Instagram profile">
        <img
          className="w-fortyfour-lab-avatar"
          src={asset(`${POSTS_DIR}avatar.webp`)}
          alt="The 44 Lab profile picture: the devil on a tan disc"
          width={150}
          height={150}
          decoding="async"
        />
        <div className="w-fortyfour-lab-who">
          <p className="w-fortyfour-lab-who-name">44 Lab</p>
          <p className="w-fortyfour-lab-who-handle t-label">@fortyfour.lab</p>
        </div>
        <ul className="w-fortyfour-lab-bio">
          <li>
            <SpoolIcon className="w-fortyfour-lab-bio-icon" />
            <span>Handtufted rugs</span>
          </li>
          <li>
            <PlaneIcon className="w-fortyfour-lab-bio-icon" />
            <span>International shipping</span>
          </li>
          <li>
            <BubbleIcon className="w-fortyfour-lab-bio-icon" />
            <span>DM for custom orders</span>
          </li>
        </ul>
        <div className="w-fortyfour-lab-profile-link">
          <Ticket href={INSTAGRAM} label="@fortyfour.lab" kicker="On Instagram" rotate={-2} stub="tomato" />
        </div>
      </aside>

      <div className="w-fortyfour-lab-intro">
        <p className="w-fortyfour-lab-lead">
          44 Lab: custom handtufted rugs, made to order, and the mischievous devil I drew by hand as its logo.
        </p>
        <p className="w-fortyfour-lab-lead-2">
          Below is its whole Instagram wall, {count} posts from {dayMonth(FIRST_DATE)} to {longDate(LAST_DATE)}, hung on one thread.
        </p>
        <p className="w-fortyfour-lab-follow t-hand">
          <span>follow the thread</span>
          <Scribble kind="arrow" dir="down-right" w="4.6rem" color="var(--ffl-outline)" seed={44} draw={1250} />
        </p>
      </div>
    </div>
  )
}
