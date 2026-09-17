import { useEffect, useRef } from 'react'

const INTERACTIVE_SELECTOR =
  'a, button, [data-magnetic], .cursor-pointer, input, textarea, select, [role="button"]'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const isTouchDevice = window.matchMedia('(max-width: 860px)').matches || 'ontouchstart' in window
    if (isTouchDevice) return

    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let ringX = mouseX
    let ringY = mouseY
    let ready = false
    let rafId: number

    const showCursor = () => {
      if (ready) return
      ready = true
      document.body.classList.add('has-custom-cursor')
      dotRef.current?.classList.add('is-ready')
      ringRef.current?.classList.add('is-ready')
    }

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`
      }
      showCursor()
    }

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.18
      ringY += (mouseY - ringY) * 0.18
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`
      }
      rafId = requestAnimationFrame(animateRing)
    }
    animateRing()

    // event delegation — works for content that mounts/expands later
    // (orbiting skill nodes, expanded cards, etc.) without re-binding
    const onOver = (e: Event) => {
      const target = e.target as HTMLElement
      if (target.closest?.(INTERACTIVE_SELECTOR)) {
        ringRef.current?.classList.add('is-active')
      }
    }
    const onOut = (e: Event) => {
      const target = e.target as HTMLElement
      if (target.closest?.(INTERACTIVE_SELECTOR)) {
        ringRef.current?.classList.remove('is-active')
      }
    }
    const onDown = () => ringRef.current?.classList.add('is-pressed')
    const onUp = () => ringRef.current?.classList.remove('is-pressed')

    window.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('mouseup', onUp)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('mouseup', onUp)
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true">
        <span className="cursor-ring-spin" />
      </div>
    </>
  )
}
