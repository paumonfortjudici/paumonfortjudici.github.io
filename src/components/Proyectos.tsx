import { Lock, ArrowUpRight } from 'lucide-react'
import { GlowCard } from './ui/spotlight-card'

// ---- Original illustrated identity for each project preview (no screenshots, no third-party art —
// just an abstract read of each project's own brand colors/motif) ----

function VerticeScene() {
  return (
    <svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
      <rect width="300" height="400" fill="#0A0A0A" />
      <g stroke="#C9A227" strokeWidth="1" opacity="0.25">
        {Array.from({ length: 7 }).map((_, i) => (
          <line key={i} x1={i * 50} y1="0" x2={i * 50} y2="400" />
        ))}
      </g>
      {/* vertex / triangle mark, echoing the ▲ Vértice.design logo */}
      <g transform="translate(150 190)">
        <polygon points="0,-90 78,52 -78,52" fill="none" stroke="#C9A227" strokeWidth="3" />
        <polygon points="0,-45 39,26 -39,26" fill="none" stroke="#C9A227" strokeWidth="1.5" opacity="0.5" />
        <circle r="4" fill="#C9A227" />
      </g>
      <text
        x="150"
        y="330"
        textAnchor="middle"
        fontSize="20"
        letterSpacing="4"
        fill="#C9A227"
        opacity="0.7"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        VÉRTICE
      </text>
    </svg>
  )
}

function ContractScene() {
  return (
    <svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
      <rect width="300" height="400" fill="#141414" />
      <rect width="300" height="46" fill="#000" />
      <text x="150" y="30" textAnchor="middle" fontSize="15" letterSpacing="2" fill="#F5F3EE" fontWeight="700">
        PROYECTO CONTRACT
      </text>
      {/* editorial grid — magazine article tiles */}
      <g fill="#F5F3EE" opacity="0.9">
        <rect x="20" y="70" width="150" height="110" rx="2" opacity="0.85" />
        <rect x="180" y="70" width="100" height="52" rx="2" opacity="0.6" />
        <rect x="180" y="128" width="100" height="52" rx="2" opacity="0.6" />
      </g>
      <g fill="#F5F3EE" opacity="0.5">
        <rect x="20" y="196" width="80" height="80" rx="2" />
        <rect x="110" y="196" width="80" height="80" rx="2" />
        <rect x="200" y="196" width="80" height="80" rx="2" />
        <rect x="20" y="288" width="120" height="60" rx="2" />
        <rect x="150" y="288" width="130" height="60" rx="2" />
      </g>
    </svg>
  )
}

function LabortiScene() {
  return (
    <svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
      <defs>
        <radialGradient id="labortiBg" cx="50%" cy="40%" r="75%">
          <stop offset="0%" stopColor="#3F0D10" />
          <stop offset="100%" stopColor="#160404" />
        </radialGradient>
      </defs>
      <rect width="300" height="400" fill="url(#labortiBg)" />
      {/* abstract molecule / lab motif in the brand red, mid-transformation */}
      <g stroke="#EF4444" strokeWidth="2" opacity="0.6" fill="none">
        <line x1="90" y1="160" x2="150" y2="120" />
        <line x1="150" y1="120" x2="210" y2="160" />
        <line x1="150" y1="120" x2="150" y2="60" />
        <line x1="90" y1="160" x2="90" y2="230" />
        <line x1="210" y1="160" x2="210" y2="230" />
      </g>
      <g fill="#EF4444">
        <circle cx="150" cy="120" r="10" />
        <circle cx="90" cy="160" r="7" opacity="0.85" />
        <circle cx="210" cy="160" r="7" opacity="0.85" />
        <circle cx="150" cy="60" r="6" opacity="0.7" />
        <circle cx="90" cy="230" r="6" opacity="0.7" />
        <circle cx="210" cy="230" r="6" opacity="0.7" />
      </g>
      <text
        x="150"
        y="330"
        textAnchor="middle"
        fontSize="120"
        fontWeight="700"
        fill="#EF4444"
        opacity="0.2"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        ?
      </text>
    </svg>
  )
}

const LIVE_PROJECTS = [
  {
    tag: 'Marketing digital',
    title: 'Vértice Design',
    desc: 'Agencia de marketing digital para estudios de arquitectura e interiorismo.',
    accent: '#C9A227',
    Scene: VerticeScene,
    href: 'https://vertice.design/',
  },
  {
    tag: 'Editorial / Revista',
    title: 'Proyecto Contract',
    desc: 'Revista digital de interiorismo comercial, hostelería y oficinas.',
    accent: '#F5F3EE',
    Scene: ContractScene,
    href: 'https://www.proyectocontract.es/',
  },
]

const IN_PROGRESS = {
  tag: 'Rebranding en curso',
  title: 'Laborti Veterinaria',
  desc: 'Estoy rediseñando la identidad y la web de este laboratorio veterinario de Barcelona.',
  accent: '#EF4444',
  Scene: LabortiScene,
}

export default function Proyectos() {
  return (
    <section id="proyectos" className="relative bg-[#0b0b0c] py-24 px-5">
      <div className="text-center mb-16">
        <h2
          className="text-3xl md:text-5xl font-bold text-white"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Proyectos
        </h2>
        <p className="mt-3 text-white/60 max-w-lg mx-auto">
          Webs reales que he desarrollado — y una más que sigue en obras.
        </p>
      </div>

      <div className="flex justify-center items-stretch flex-wrap gap-8 max-w-6xl mx-auto">
        {LIVE_PROJECTS.map(({ tag, title, desc, accent, Scene, href }) => (
          <a
            key={title}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <GlowCard customSize className="group w-[280px] h-[360px] cursor-pointer">
              <div className="absolute inset-0">
                <div className="absolute inset-0 scale-105 blur-[2px] transition-all duration-700 ease-out group-hover:blur-0 group-hover:scale-100">
                  <Scene />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

              <div
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-45"
                style={{ background: `${accent}26`, border: `1.5px solid ${accent}` }}
              >
                <ArrowUpRight size={16} color={accent} strokeWidth={2.2} />
              </div>

              <div className="absolute bottom-0 inset-x-0 z-20 p-5">
                <span
                  className="inline-block text-[10px] font-mono font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full mb-3"
                  style={{ background: `${accent}26`, color: accent, border: `1px solid ${accent}55` }}
                >
                  {tag}
                </span>
                <h3 className="text-lg text-white mb-1.5" style={{ fontFamily: 'var(--font-heading)' }}>
                  {title}
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">{desc}</p>
              </div>
            </GlowCard>
          </a>
        ))}

        {/* still in progress — kept locked and blurry */}
        <GlowCard customSize className="group w-[280px] h-[360px] cursor-default">
          <div className="absolute inset-0">
            <div className="absolute inset-0 scale-110 blur-xl transition-all duration-700 ease-out group-hover:blur-[6px] group-hover:scale-105">
              <IN_PROGRESS.Scene />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

          <div
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-transform duration-500 group-hover:scale-110"
            style={{ background: `${IN_PROGRESS.accent}26`, border: `1.5px solid ${IN_PROGRESS.accent}` }}
          >
            <Lock size={16} color={IN_PROGRESS.accent} strokeWidth={2.2} />
          </div>

          <div className="absolute bottom-0 inset-x-0 z-20 p-5">
            <span
              className="inline-block text-[10px] font-mono font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full mb-3"
              style={{ background: `${IN_PROGRESS.accent}26`, color: IN_PROGRESS.accent, border: `1px solid ${IN_PROGRESS.accent}55` }}
            >
              {IN_PROGRESS.tag}
            </span>
            <h3 className="text-lg text-white mb-1.5" style={{ fontFamily: 'var(--font-heading)' }}>
              {IN_PROGRESS.title}
            </h3>
            <p className="text-sm text-white/70 leading-relaxed">{IN_PROGRESS.desc}</p>
          </div>
        </GlowCard>
      </div>
    </section>
  )
}
