// World 7: Somia, "Storefront".
// A shop front (awning, sign plate, chalk motto, window) whose window is a scrolling laptop + phone showing the real
// captures of somia.store; behind it a shelving unit with the brand (logo family, palette, values), a wall of eight framed
// screens with a lightbox, and a till receipt on the counter next to the facts slate. The world wears Somia's own look
// (black, paper beige, periwinkle; Cormorant for headlines as a look-alike of PP Hatton, Fira Sans for text) on top of the
// lagoon folder.
// Docs: docs/api/world-somia.md
import '@fontsource/fira-sans/latin-300.css'
import './somia/somia.css'
import { useEffect, useRef, useState } from 'react'
import { useWorld } from './WorldContext'
import { Counter } from './somia/Counter'
import { Facade } from './somia/Facade'
import { Gallery } from './somia/Gallery'
import { Shelves } from './somia/Shelves'

// The shell waits for Cormorant and Fira Sans 400 before it opens the folder; Fira Sans 300 (the shop's body weight) comes
// with this chunk's CSS, so wait for it here too. The world stays invisible until the faces are in (or 900 ms have passed),
// so the text never reflows in front of the visitor. The entrances start at the same moment.
const FACES = ['300 16px "Fira Sans"', '300 40px "Cormorant Variable"', 'italic 500 20px "Cormorant Variable"']

function useFacesReady(): boolean {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let alive = true
    const done = () => {
      if (alive) setReady(true)
    }
    const timer = window.setTimeout(done, 900)
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
    if (fonts && typeof fonts.load === 'function') {
      Promise.all(FACES.map((face) => fonts.load(face))).then(
        () => {
          window.clearTimeout(timer)
          window.setTimeout(done, 40)
        },
        () => undefined,
      )
    } else {
      window.clearTimeout(timer)
      window.setTimeout(done, 40)
    }
    return () => {
      alive = false
      window.clearTimeout(timer)
    }
  }, [])
  return ready
}

export default function SomiaWorld() {
  const { work } = useWorld()
  const rootRef = useRef<HTMLDivElement>(null)
  const ready = useFacesReady()
  const [pictureOpen, setPictureOpen] = useState(false)

  // while a framed picture is open the rest of the world is inert (the lightbox lives outside this root)
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (pictureOpen) root.setAttribute('inert', '')
    else root.removeAttribute('inert')
  }, [pictureOpen])

  return (
    <div ref={rootRef} className="w-somia" data-ready={ready ? 'true' : 'false'}>
      <h2 className="pm-sr">Somia: brand identity, logo and web layout for a sustainable-fashion online store</h2>
      <Facade ready={ready} paused={pictureOpen} />
      <Shelves />
      <Gallery onOpenChange={setPictureOpen} />
      <Counter work={work} />
    </div>
  )
}
