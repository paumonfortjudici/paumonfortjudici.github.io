// A project thumbnail (public/works/<slug>/thumb.webp, 4:5) on a flat colour field in the project's colour with its number behind it.
// The field is what you see while the picture loads, and what stays if it never does: no broken-image icon, no layout shift.
// Used by the taped print in the open band, the cursor preview and the touch / still thumbnail.
import { useState, type CSSProperties } from 'react'
import { asset } from '@/lib/asset'
import { pad2 } from '@/lib/copy'
import type { WorkMeta } from '@/lib/works'

const warmed = new Set<string>()

/** Starts fetching a project's thumbnail (once), so the print is already decoded when its band opens. Call it on hover and focus of a band header. */
export function prefetchThumb(work: WorkMeta): void {
  if (warmed.has(work.slug) || typeof Image === 'undefined') return
  warmed.add(work.slug)
  const img = new Image()
  img.decoding = 'async'
  img.src = asset(work.thumb)
}

interface ThumbProps {
  work: WorkMeta
  /** '' for decoration (the default); a description when the picture is the content */
  alt?: string
  loading?: 'lazy' | 'eager'
  className?: string
}

export function Thumb({ work, alt = '', loading = 'lazy', className }: ThumbProps) {
  const [state, setState] = useState<'idle' | 'ok' | 'failed'>('idle')
  return (
    <span className={className ? `pm-cat-thumb ${className}` : 'pm-cat-thumb'} style={{ '--c': work.color, '--on': work.ink } as CSSProperties}>
      <span className="pm-cat-thumb__no" aria-hidden="true">
        {pad2(work.n)}
      </span>
      {state !== 'failed' && (
        <img
          src={asset(work.thumb)}
          alt={alt}
          width={720}
          height={900}
          loading={loading}
          decoding="async"
          draggable={false}
          data-ok={state === 'ok' ? '' : undefined}
          onLoad={() => setState('ok')}
          onError={() => setState('failed')}
        />
      )}
    </span>
  )
}
