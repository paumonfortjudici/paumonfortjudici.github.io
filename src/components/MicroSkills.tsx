import { useEffect, useState } from 'react'
import { Sparkles, ShieldCheck, Code2, X } from 'lucide-react'

const MICROSKILLS = [
  {
    title: 'IA Generativa y sus Aplicaciones en Negocio',
    desc: 'Cómo aplicar herramientas de IA generativa a casos de uso reales de negocio — de la ideación a la implementación práctica.',
    meta: 'Microskill · TAFE NSW · Mayo 2025',
    icon: Sparkles,
    gradientFrom: '#9333EA',
    gradientTo: '#06B6D4',
    href: '/certificates/generative-ai.pdf',
  },
  {
    title: 'Introducción a la Ciberseguridad',
    desc: 'Fundamentos de seguridad digital: amenazas comunes, buenas prácticas y cómo proteger sistemas y datos.',
    meta: 'Microskill · TAFE NSW · Mayo 2025',
    icon: ShieldCheck,
    gradientFrom: '#10B981',
    gradientTo: '#06B6D4',
    href: '/certificates/cyber-security.pdf',
  },
  {
    title: 'Software y Desarrollo Web',
    desc: 'Bases de programación y desarrollo web — el primer paso que, después, me llevó al curso intensivo de frontend.',
    meta: 'Microskill · TAFE NSW · Mayo 2025',
    icon: Code2,
    gradientFrom: '#F59E0B',
    gradientTo: '#EC4899',
    href: '/certificates/software-web-dev.pdf',
  },
]

export default function MicroSkills() {
  const [openPdf, setOpenPdf] = useState<{ href: string; title: string } | null>(null)

  useEffect(() => {
    if (!openPdf) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenPdf(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openPdf])

  return (
    <section id="microskills" className="relative bg-[#0b0b0c] py-24 px-5">
      <div className="text-center mb-16">
        <h2
          className="text-3xl md:text-5xl font-bold text-white"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Formación complementaria
        </h2>
        <p className="mt-3 text-white/60 max-w-lg mx-auto">
          Tres microcredenciales que completé online a través del Institute of
          Applied Technology Digital (NSW Government), Australia.
        </p>
      </div>

      <div className="flex justify-center items-stretch flex-wrap gap-10 max-w-6xl mx-auto">
        {MICROSKILLS.map(({ title, desc, meta, icon: Icon, gradientFrom, gradientTo, href }) => (
          <div
            key={title}
            className="group relative w-[300px] h-[380px] transition-all duration-500"
          >
            <span
              className="absolute top-0 left-[50px] w-1/2 h-full rounded-2xl transform skew-x-[15deg] transition-all duration-500 group-hover:skew-x-0 group-hover:left-[20px] group-hover:w-[calc(100%-90px)]"
              style={{ background: `linear-gradient(315deg, ${gradientFrom}, ${gradientTo})` }}
            />
            <span
              className="absolute top-0 left-[50px] w-1/2 h-full rounded-2xl transform skew-x-[15deg] blur-[30px] opacity-70 transition-all duration-500 group-hover:skew-x-0 group-hover:left-[20px] group-hover:w-[calc(100%-90px)]"
              style={{ background: `linear-gradient(315deg, ${gradientFrom}, ${gradientTo})` }}
            />

            <div className="relative z-20 h-full flex flex-col p-6 bg-white/5 backdrop-blur-md shadow-lg rounded-2xl text-white transition-all duration-500 group-hover:-translate-x-2">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 shrink-0"
                style={{ background: `linear-gradient(315deg, ${gradientFrom}, ${gradientTo})` }}
              >
                <Icon size={20} strokeWidth={2} className="text-white" />
              </div>
              <h3
                className="text-lg leading-snug mb-2"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-white/70 mb-3 flex-1">{desc}</p>
              <p className="text-[11px] font-mono text-white/40 mb-4">{meta}</p>
              <button
                onClick={() => setOpenPdf({ href, title })}
                className="inline-flex items-center justify-center text-sm font-semibold text-black bg-white px-4 py-2 rounded-full w-fit transition-colors duration-200 hover:bg-white/90"
              >
                Leer más
              </button>
            </div>
          </div>
        ))}
      </div>

      {openPdf && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-sm"
          onClick={() => setOpenPdf(null)}
        >
          <div
            className="relative w-full max-w-3xl h-[85vh] bg-[#151517] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 shrink-0">
              <p className="text-sm text-white/80 truncate pr-4" style={{ fontFamily: 'var(--font-heading)' }}>
                {openPdf.title}
              </p>
              <button
                onClick={() => setOpenPdf(null)}
                aria-label="Cerrar"
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <iframe src={openPdf.href} title={openPdf.title} className="flex-1 w-full bg-white" />
          </div>
        </div>
      )}
    </section>
  )
}
