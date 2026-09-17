import OrbitingSkills from './ui/orbiting-skills'

export default function Skills() {
  return (
    <section id="skills" className="relative bg-[#0b0b0c]">
      <div className="pt-24 pb-4 text-center px-5">
        <h2
          className="text-3xl md:text-5xl font-bold text-white"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Con qué trabajo
        </h2>
        <p className="mt-3 text-white/60 max-w-lg mx-auto">
          Anillo interno: frontend, aprendizaje reciente. Anillo externo: diseño,
          años de oficio. Pasa el cursor sobre cada icono para ver la skill.
        </p>
      </div>
      <OrbitingSkills />
    </section>
  )
}
