// The cut-out of a project (public/works/<slug>/peek.webp, a transparent die-cut with its own light edge) slapped on the corner of the
// taped print in the open band. It is the same art the cover's deck pops out of each folder, so the two sheets say the same thing.
// Decorative (alt=""), absolutely placed (it never moves the layout), and silent when the file is missing (no broken-image icon on a
// vivid field).
import { useState, type CSSProperties } from 'react'
import { asset } from '@/lib/asset'
import type { WorkMeta } from '@/lib/works'

/** natural sizes of the shipped cut-outs (docs/api/card-art.md): they give the browser the aspect ratio before the file arrives */
const PEEK_SIZE: Record<string, readonly [number, number]> = {
  contract: [481, 640],
  plana: [695, 640],
  'fortyfour-lab': [511, 633],
  'spelled-guilty': [428, 640],
  'space-monkey': [433, 640],
  procreate: [411, 640],
  somia: [336, 519],
  'concept-brand': [767, 633],
  'concept-portfolio': [561, 628],
  illustration: [430, 632],
}

export function Cutout({ work }: { work: WorkMeta }) {
  const [failed, setFailed] = useState(false)
  if (!work.peek || failed) return null
  const [width, height] = PEEK_SIZE[work.slug] ?? [480, 640]
  return (
    <img
      className="pm-cat-cut"
      src={asset(work.peek)}
      alt=""
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      draggable={false}
      style={{ '--asp': width / height } as CSSProperties}
      onError={() => setFailed(true)}
    />
  )
}
