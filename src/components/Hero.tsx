import { useEffect, useState } from 'react'
import { useTypewriter } from '../hooks/useTypewriter'
import { useVideoScrub } from '../hooks/useVideoScrub'

const GREETING = '¿Qué te gustaría ver primero: el diseño, el código, o los dos a la vez?'

const PILLS = [
  { label: 'Ver proyectos', href: '#proyectos' },
  { label: 'Ver trayectoria', href: '#trayectoria' },
  { label: 'Ver skills', href: '#skills' },
]

const EMAIL = 'paumonfortjudici@gmail.com'

export default function Hero() {
  const videoRef = useVideoScrub<HTMLVideoElement>()
  const { displayed, done } = useTypewriter(GREETING)
  const [pillsVisible, setPillsVisible] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setPillsVisible(true), 400)
    return () => clearTimeout(t)
  }, [])

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard access can fail (permissions, insecure context) — non-critical
    }
  }

  return (
    <section id="top" className="relative h-screen flex flex-col justify-end pb-12 md:justify-center md:pb-0 px-5 sm:px-8 md:px-10 overflow-hidden">
      {/* placeholder background video — swap the src for Pau's own footage later */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover z-0 transition-[object-position] duration-500 ease-out"
        style={{ objectPosition: '34% 28%' }}
        src="/hero-video.mp4"
        muted
        playsInline
        preload="auto"
      />
      {/* scrim behind the text, fading to full opacity at the very bottom — absolute (not fixed) so it
          scrolls away with the section itself and its opaque base blends into the next section's
          background at the seam, instead of staying pinned and getting covered like a hard curtain */}
      <div className="absolute inset-x-0 bottom-0 z-0 h-[70vh] bg-gradient-to-t from-[#0b0b0c] from-[2%] via-black/40 via-40% to-transparent" />

      <div className="relative z-10 max-w-xl">
        <p
          className="text-white mb-5 sm:mb-6"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(20px, 4.5vw, 30px)',
            lineHeight: 1.3,
            fontWeight: 500,
            minHeight: 54,
          }}
        >
          {displayed}
          {!done && <span className="inline-block w-[2px] h-[1.1em] bg-white align-middle ml-[2px] animate-blink" />}
        </p>

        <div className="flex flex-wrap gap-y-1">
          {PILLS.map((pill, i) => (
            <a
              key={pill.label}
              href={pill.href}
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200"
              style={{
                opacity: pillsVisible ? 1 : 0,
                transform: pillsVisible ? 'translateY(0)' : 'translateY(8px)',
                transition: 'opacity 0.4s ease, transform 0.4s ease',
                transitionDelay: `${i * 60}ms`,
              }}
            >
              {pill.label}
            </a>
          ))}

          <button
            onClick={copyEmail}
            className="inline-flex items-center justify-center gap-2 sm:gap-3 text-white bg-transparent border border-white rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-white hover:text-black transition-colors duration-200"
            style={{
              opacity: pillsVisible ? 1 : 0,
              transform: pillsVisible ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
              transitionDelay: `${PILLS.length * 60}ms`,
            }}
          >
            {copied ? 'Copiado' : <>Escríbeme: <span className="underline underline-offset-1">{EMAIL}</span></>}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <rect x="1" y="3" width="7" height="8" rx="1" stroke="currentColor" strokeWidth="1" />
              <rect x="4" y="1" width="7" height="8" rx="1" stroke="currentColor" strokeWidth="1" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
