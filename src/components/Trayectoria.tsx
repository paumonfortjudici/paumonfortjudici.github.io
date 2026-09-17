import { ContainerScroll } from './ui/container-scroll-animation'

export default function Trayectoria() {
  return (
    <section id="trayectoria" className="relative bg-[#0b0b0c]">
      <ContainerScroll
        outerHeightClassName="h-[70rem] md:h-[95rem]"
        cardSizeClassName="h-[38rem] md:h-[56rem] w-auto aspect-[1787/2527]"
        titleComponent={
          <>
            <h2 className="text-4xl font-semibold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
              Del branding al código:
              <br />
              <span className="text-4xl md:text-[5rem] font-bold mt-1 leading-none block">
                mi trayectoria
              </span>
            </h2>
            <p className="mt-4 text-white/60 text-base md:text-lg max-w-xl mx-auto">
              Años dando dirección de arte a marcas, y el salto reciente a construir
              interfaces con código propio. Este es el currículum detrás de todo eso.
            </p>
          </>
        }
      >
        <img
          src="/resume-preview.png"
          alt="Currículum de Pau Monfort Judici"
          height={2527}
          width={1787}
          className="mx-auto rounded-2xl object-cover h-full w-full object-center"
          draggable={false}
        />
      </ContainerScroll>
    </section>
  )
}
