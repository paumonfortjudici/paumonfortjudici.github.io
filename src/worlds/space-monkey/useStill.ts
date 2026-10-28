// The world's "stay still" switch: the shell's `reduced` (OS setting or the Pause switch, through React state) OR the html[data-motion]
// attribute itself. Watching the attribute means a pause written straight to it (a test, an embed, another script) also stops the sky,
// the tilt and the typing, not only the visitor's own switch.
import { useEffect, useState } from 'react'
import { useWorld } from '../WorldContext'

export function useStill(): boolean {
  const { reduced } = useWorld()
  const [attr, setAttr] = useState(() => document.documentElement.getAttribute('data-motion') === 'paused')
  useEffect(() => {
    const root = document.documentElement
    const read = () => setAttr(root.getAttribute('data-motion') === 'paused')
    read()
    const observer = new MutationObserver(read)
    observer.observe(root, { attributes: true, attributeFilter: ['data-motion'] })
    return () => observer.disconnect()
  }, [])
  return reduced || attr
}
