// One post of the wall, hung on the thread: a tag (carousel = a ring of tags, reel = a film-strip tag) with its title and note.
// The tag's eyelet is where the thread passes: a zero-size marker (data-ffl-anchor="knot") sits exactly on the pivot the tag swings
// around, so the thread builder reads the same point however the tag is tilted, swinging in, or flipping.
// DOM order is reading order (title, tag, note); the title is shown under the tag with CSS order.
import { useId, useRef, type CSSProperties } from 'react'
import { Stamp } from '../../components/primitives'
import { asset } from '../../lib/asset'
import { useInView } from '../../lib/hooks'
import { useWorld } from '../WorldContext'
import Clip from './Clip'
import { longDate, stampText, timecode } from './format'
import { FrameIcon } from './icons'
import { POSTS_DIR, type Post } from './posts'
import Ring from './Ring'

export interface PostTagProps {
  post: Post
  /** position in the whole wall, 0-based */
  index: number
  /** square root of the days since the previous post of the same month: the quiet stretches get a little more thread */
  gap: number
  /** which column the tag hangs in (wide layout); the narrow layout hangs every tag the same way */
  side: 'left' | 'right'
  /** the eyelet is on the right of tags that hang left of the thread (and on every tag in the narrow layout) */
  eyelet: 'right' | 'left'
}

function Reel({ post }: { post: Post }) {
  const slide = post.slides[0]
  const clip = slide.kind === 'video' ? slide.video : undefined
  const label = `${post.title}, ${longDate(post.date)}`
  return (
    <div className="w-fortyfour-lab-media" data-kind="reel" role="group" aria-label={`${label}: ${post.still ? 'still from a reel' : 'reel'}`}>
      <span className="w-fortyfour-lab-anchor" data-ffl-anchor="knot" aria-hidden="true" />
      <div className="w-fortyfour-lab-stack">
        <div className="w-fortyfour-lab-card" data-top="">
          <span className="w-fortyfour-lab-card-shadow" aria-hidden="true" />
          <span className="w-fortyfour-lab-card-edge" aria-hidden="true" />
          <div className="w-fortyfour-lab-card-paper">
            <figure className="w-fortyfour-lab-photo" style={{ aspectRatio: `${post.ratio}` }}>
              {clip ? (
                <Clip slide={slide} active label={label} />
              ) : (
                <img src={asset(`${POSTS_DIR}${slide.image}`)} alt={slide.alt} width={slide.w} height={slide.h} loading="lazy" decoding="async" draggable={false} />
              )}
              {post.still && (
                <span className="w-fortyfour-lab-still t-label">
                  <FrameIcon width="1.15em" height="1.15em" />
                  Still
                </span>
              )}
            </figure>
          </div>
        </div>
      </div>
      <div className="w-fortyfour-lab-tagui">
        <div className="w-fortyfour-lab-tagui-head">
          <Stamp text={stampText(post.date)} color="var(--ffl-cream)" blend="normal" rotate={-4} size="1.05rem" rough={1} decorative />
        </div>
        <span className="w-fortyfour-lab-eyelet" aria-hidden="true" />
        <div className="w-fortyfour-lab-tagui-foot">
          <span className="w-fortyfour-lab-kind t-label">
            {post.still ? 'Reel, still frame' : clip ? <>Reel, {timecode(clip.seconds)}<span className="pm-sr">{`, ${Math.round(clip.seconds)} seconds`}</span></> : 'Reel'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function PostTag({ post, index, gap, side, eyelet }: PostTagProps) {
  const { scrollRef } = useWorld()
  const ref = useRef<HTMLElement>(null)
  const titleId = useId()
  const seen = useInView(ref, { once: true, root: scrollRef, rootMargin: '0px 0px -8% 0px' })
  const vars = { '--gap': gap.toFixed(2) } as CSSProperties
  return (
    <article
      ref={ref}
      className="w-fortyfour-lab-post"
      data-pack=""
      data-ffl-post={index}
      data-side={side}
      data-eyelet={eyelet}
      data-kind={post.type}
      data-seen={seen ? '' : undefined}
      style={vars}
      aria-labelledby={titleId}
    >
      <h4 id={titleId} className="w-fortyfour-lab-title">
        {post.title}
        <span className="pm-sr">{`, ${longDate(post.date)}`}</span>
      </h4>
      <div className="w-fortyfour-lab-hang">
        {post.type === 'carousel' ? <Ring post={post} eyelet={eyelet} /> : <Reel post={post} />}
      </div>
      <p className="w-fortyfour-lab-note">{post.note}</p>
    </article>
  )
}
