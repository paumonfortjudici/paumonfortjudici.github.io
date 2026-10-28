// The seal of the Lockups plate. It starts as the plain <img> of the real vector file; the first time its tab is chosen the file is fetched
// and swapped in as inline SVG (same size, same drawing), so the ring of lettering can turn slowly while the symbol in the middle stands
// still: the file was prepared for that (#pd-seal-ring is the ring, #pd-seal-symbol the centre). The turn is an ambient loop (class
// pm-ambient), so "Pause motion" and the OS setting stop it. The file is a first-party, sanitised asset (only <svg>, <circle>, <g>, <path>);
// anything that does not look like that is ignored and the <img> stays.
import { useEffect, useRef, useState } from 'react'
import { useInView } from '../../lib/hooks'
import { useWorld } from '../WorldContext'
import { plana } from './data'

interface SealFigureProps {
  file: string
  w: number
  h: number
  alt: string
  /** true while this form is the one on show */
  active: boolean
}

const SAFE = /^<svg[\s\S]*<\/svg>\s*$/
const UNSAFE = /<script|<foreignObject|<image|<use|\son\w+\s*=|href\s*=/i

export function SealFigure({ file, w, h, alt, active }: SealFigureProps) {
  const { scrollRef } = useWorld()
  const box = useRef<HTMLDivElement>(null)
  const visible = useInView(box, { root: scrollRef, rootMargin: '60px' })
  const [markup, setMarkup] = useState<string | null>(null)
  const asked = useRef(false)

  useEffect(() => {
    if (!active || asked.current) return
    asked.current = true
    fetch(plana(file))
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then((text) => {
        if (!SAFE.test(text) || UNSAFE.test(text) || !text.includes('id="pd-seal-ring"')) return
        setMarkup(
          text
            .replace('<g id="pd-seal-ring">', '<g id="pd-seal-ring" class="pm-ambient w-plana-seal-ring">')
            .replace(/^<svg /, '<svg aria-hidden="true" focusable="false" '),
        )
      })
      .catch(() => {
        /* the <img> stays */
      })
  }, [active, file])

  // the ring only turns while this form is the one on show AND on screen (no work off-screen)
  return (
    <div ref={box} className="w-plana-seal-box" data-run={active && visible ? 'true' : 'false'}>
      {markup ? (
        <div className="w-plana-seal" role="img" aria-label={alt} dangerouslySetInnerHTML={{ __html: markup }} />
      ) : (
        <img src={plana(file)} width={w} height={h} alt={alt} loading="lazy" decoding="async" draggable={false} />
      )}
    </div>
  )
}
