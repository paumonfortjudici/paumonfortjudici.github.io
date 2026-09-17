import { useState } from 'react'

const NAV_LINKS = ['Trayectoria', 'Skills', 'Microskills', 'Proyectos']

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5">
        <a href="#top" className="flex items-center gap-3">
          <span
            className="text-white text-[21px] sm:text-[26px] tracking-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Pau Monfort
          </span>
          <span className="text-white text-[25px] sm:text-[30px] select-none" style={{ letterSpacing: '-0.02em' }}>
            ✳︎
          </span>
        </a>

        <nav
          className="hidden md:flex items-center gap-2 text-white text-[22px]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {NAV_LINKS.map((link, i) => (
            <span key={link}>
              <a href={`#${link.toLowerCase()}`} className="hover:opacity-60 transition-opacity">
                {link}
              </a>
              {i < NAV_LINKS.length - 1 && ', '}
            </span>
          ))}
        </nav>

        <a
          href="#contacto"
          className="hidden md:inline text-white text-[22px] underline underline-offset-2 hover:opacity-60 transition-opacity"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Hablemos
        </a>

        <button
          className="md:hidden flex flex-col items-end gap-[5px]"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className="w-6 h-[2px] bg-white transition-all duration-300"
            style={open ? { transform: 'rotate(45deg) translate(5px, 6px)' } : undefined}
          />
          <span
            className="w-6 h-[2px] bg-white transition-all duration-300"
            style={open ? { opacity: 0 } : undefined}
          />
          <span
            className="w-6 h-[2px] bg-white transition-all duration-300"
            style={open ? { transform: 'rotate(-45deg) translate(5px, -6px)' } : undefined}
          />
        </button>
      </header>

      <div
        className="md:hidden fixed inset-0 z-[9] bg-black/90 backdrop-blur-md flex flex-col justify-center items-start px-8 gap-8 transition-opacity duration-300"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase()}`}
            className="text-white text-[32px] font-medium"
            style={{ fontFamily: 'var(--font-heading)' }}
            onClick={() => setOpen(false)}
          >
            {link}
          </a>
        ))}
        <a
          href="#contacto"
          className="text-white text-[32px] font-medium underline"
          style={{ fontFamily: 'var(--font-heading)' }}
          onClick={() => setOpen(false)}
        >
          Hablemos
        </a>
      </div>
    </>
  )
}
