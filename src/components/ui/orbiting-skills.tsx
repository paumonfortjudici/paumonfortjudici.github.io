import { useEffect, useState, memo } from 'react'
import type { ComponentType } from 'react'
import { Palette, Layers, Camera, Tags } from 'lucide-react'

// --- Type Definitions ---
type IconType = 'html' | 'css' | 'javascript' | 'react' | 'art' | 'adobe' | 'photo' | 'brand'

type GlowColor = 'cyan' | 'purple'

interface SkillIconProps {
  type: IconType
}

interface SkillConfig {
  id: string
  orbitRadius: number
  size: number
  speed: number
  iconType: IconType
  phaseShift: number
  glowColor: GlowColor
  label: string
  energy: number
  date: string
  description: string
}

interface OrbitingSkillProps {
  config: SkillConfig
  angle: number
  isExpanded: boolean
  onToggle: (id: string) => void
}

interface GlowingOrbitPathProps {
  radius: number
  glowColor?: GlowColor
  animationDelay?: number
}

// --- SVG Icon Components (real technology logos + lucide icons for design skills) ---
const iconComponents: Record<IconType, { component: ComponentType; color: string }> = {
  html: {
    component: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z" fill="#E34F26"/>
      </svg>
    ),
    color: '#E34F26',
  },
  css: {
    component: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm17.09 4.413L5.41 4.41l.213 2.622 10.125.002-.255 2.716h-6.64l.24 2.573h6.182l-.366 3.523-2.91.804-2.956-.81-.188-2.11h-2.61l.29 3.751L12 19.351l5.379-1.443.744-8.157z" fill="#1572B6"/>
      </svg>
    ),
    color: '#1572B6',
  },
  javascript: {
    component: () => (
      <svg viewBox="0 0 24 24" className="w-full h-full rounded-[3px] overflow-hidden">
        <rect width="24" height="24" fill="#F7DF1E"/>
        <path d="M22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="#323330"/>
      </svg>
    ),
    color: '#F7DF1E',
  },
  react: {
    component: () => (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <g stroke="#61DAFB" strokeWidth="1" fill="none">
          <circle cx="12" cy="12" r="2.05" fill="#61DAFB"/>
          <ellipse cx="12" cy="12" rx="11" ry="4.2"/>
          <ellipse cx="12" cy="12" rx="11" ry="4.2" transform="rotate(60 12 12)"/>
          <ellipse cx="12" cy="12" rx="11" ry="4.2" transform="rotate(120 12 12)"/>
        </g>
      </svg>
    ),
    color: '#61DAFB',
  },
  art: {
    component: () => <Palette className="w-full h-full" color="#F97066" strokeWidth={1.5} />,
    color: '#F97066',
  },
  adobe: {
    component: () => <Layers className="w-full h-full" color="#FF6154" strokeWidth={1.5} />,
    color: '#FF6154',
  },
  photo: {
    component: () => <Camera className="w-full h-full" color="#34D399" strokeWidth={1.5} />,
    color: '#34D399',
  },
  brand: {
    component: () => <Tags className="w-full h-full" color="#FBBF24" strokeWidth={1.5} />,
    color: '#FBBF24',
  },
}

// --- Memoized Icon Component ---
const SkillIcon = memo(({ type }: SkillIconProps) => {
  const IconComponent = iconComponents[type]?.component
  return IconComponent ? <IconComponent /> : null
})
SkillIcon.displayName = 'SkillIcon'

// --- Configuration: Pau's skills — inner ring = frontend (recent), outer ring = design (established) ---
const skillsConfig: SkillConfig[] = [
  // Inner orbit — Frontend
  {
    id: 'html', orbitRadius: 100, size: 44, speed: 1, iconType: 'html', phaseShift: 0, glowColor: 'cyan',
    label: 'HTML', energy: 92, date: '2026 · Curso intensivo',
    description: 'Estructura semántica y accesible — la base de todo lo que construyo.',
  },
  {
    id: 'css', orbitRadius: 100, size: 44, speed: 1, iconType: 'css', phaseShift: Math.PI / 2, glowColor: 'cyan',
    label: 'CSS', energy: 88, date: '2026 · Curso intensivo',
    description: 'Maquetación, animaciones y diseño responsive — el puente entre diseño y código.',
  },
  {
    id: 'javascript', orbitRadius: 100, size: 44, speed: 1, iconType: 'javascript', phaseShift: Math.PI, glowColor: 'cyan',
    label: 'JavaScript', energy: 70, date: '2026 · Curso intensivo',
    description: 'Interactividad, lógica de interfaz y manejo del DOM.',
  },
  {
    id: 'react', orbitRadius: 100, size: 44, speed: 1, iconType: 'react', phaseShift: (3 * Math.PI) / 2, glowColor: 'cyan',
    label: 'React', energy: 74, date: '2026 · Curso intensivo',
    description: 'Componentes, estado y la librería con la que construí este mismo portafolio.',
  },
  // Outer orbit — Diseño
  {
    id: 'art', orbitRadius: 190, size: 50, speed: -0.6, iconType: 'art', phaseShift: 0, glowColor: 'purple',
    label: 'Dirección de arte', energy: 95, date: '2019 – 2024 · Barcelona',
    description: 'Años dando dirección creativa en Connecor y Casual Magazines.',
  },
  {
    id: 'adobe', orbitRadius: 190, size: 50, speed: -0.6, iconType: 'adobe', phaseShift: Math.PI / 2, glowColor: 'purple',
    label: 'Adobe / Edición', energy: 90, date: '2019 – 2024 · Barcelona',
    description: 'Edición de imagen y producción de piezas gráficas para medios digitales.',
  },
  {
    id: 'photo', orbitRadius: 190, size: 50, speed: -0.6, iconType: 'photo', phaseShift: Math.PI, glowColor: 'purple',
    label: 'Composición fotográfica', energy: 85, date: '2019 – 2024 · Barcelona',
    description: 'Fotografía y composición aplicadas a banners, campañas y redes.',
  },
  {
    id: 'brand', orbitRadius: 190, size: 50, speed: -0.6, iconType: 'brand', phaseShift: (3 * Math.PI) / 2, glowColor: 'purple',
    label: 'Branding', energy: 88, date: '2019 – 2024 · Barcelona',
    description: 'Identidad de marca y consistencia visual en todos los materiales.',
  },
]

// --- Memoized Orbiting Skill Component ---
const OrbitingSkill = memo(({ config, angle, isExpanded, onToggle }: OrbitingSkillProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const { id, orbitRadius, size, iconType, label, energy, date, description, glowColor } = config
  const accent = iconComponents[iconType]?.color ?? '#06B6D4'

  const x = Math.cos(angle) * orbitRadius
  const y = Math.sin(angle) * orbitRadius

  return (
    <div
      className="absolute top-1/2 left-1/2 transition-all duration-300 ease-out"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))`,
        zIndex: isExpanded ? 30 : isHovered ? 20 : 10,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`
          relative w-full h-full p-2.5 bg-gray-800/90 backdrop-blur-sm
          rounded-full flex items-center justify-center
          transition-all duration-300 cursor-pointer
          ${isExpanded ? 'scale-125 shadow-2xl' : isHovered ? 'scale-110 shadow-xl' : 'shadow-lg'}
        `}
        style={{
          boxShadow: isExpanded || isHovered
            ? `0 0 30px ${accent}40, 0 0 60px ${accent}20`
            : undefined,
          outline: isExpanded ? `2px solid ${accent}` : undefined,
        }}
        onClick={(e) => {
          e.stopPropagation()
          onToggle(id)
        }}
      >
        <SkillIcon type={iconType} />
        {isHovered && !isExpanded && (
          <div
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900/95 backdrop-blur-sm rounded text-xs text-white whitespace-nowrap pointer-events-none"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {label}
          </div>
        )}
      </div>

      {isExpanded && (
        <div
          className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-60 rounded-2xl bg-gray-900/95 backdrop-blur-lg p-4 text-left"
          style={{
            border: `1px solid ${accent}55`,
            boxShadow: `0 0 0 1px ${accent}22, 0 20px 40px -12px ${accent}40`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
              {label}
            </h3>
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded-full whitespace-nowrap"
              style={{ color: accent, border: `1px solid ${accent}55` }}
            >
              {glowColor === 'cyan' ? 'FRONTEND' : 'DISEÑO'}
            </span>
          </div>
          <p className="text-[11px] font-mono text-white/40 mb-2">{date}</p>
          <p className="text-xs text-white/70 leading-relaxed mb-3">{description}</p>
          <div className="flex justify-between items-center text-[11px] font-mono text-white/60 mb-1">
            <span>Nivel</span>
            <span>{energy}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${energy}%`, background: accent }}
            />
          </div>
        </div>
      )}
    </div>
  )
})
OrbitingSkill.displayName = 'OrbitingSkill'

// --- Optimized Orbit Path Component ---
const GlowingOrbitPath = memo(({ radius, glowColor = 'cyan', animationDelay = 0 }: GlowingOrbitPathProps) => {
  const glowColors = {
    cyan: {
      primary: 'rgba(6, 182, 212, 0.4)',
      secondary: 'rgba(6, 182, 212, 0.2)',
      border: 'rgba(6, 182, 212, 0.3)',
    },
    purple: {
      primary: 'rgba(147, 51, 234, 0.4)',
      secondary: 'rgba(147, 51, 234, 0.2)',
      border: 'rgba(147, 51, 234, 0.3)',
    },
  }

  const colors = glowColors[glowColor] || glowColors.cyan

  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
      style={{
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
        animationDelay: `${animationDelay}s`,
      }}
    >
      <div
        className="absolute inset-0 rounded-full animate-pulse"
        style={{
          background: `radial-gradient(circle, transparent 30%, ${colors.secondary} 70%, ${colors.primary} 100%)`,
          boxShadow: `0 0 60px ${colors.primary}, inset 0 0 60px ${colors.secondary}`,
          animationDelay: `${animationDelay}s`,
        }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          border: `1px solid ${colors.border}`,
          boxShadow: `inset 0 0 20px ${colors.secondary}`,
        }}
      />
    </div>
  )
})
GlowingOrbitPath.displayName = 'GlowingOrbitPath'

// --- Main Component ---
export default function OrbitingSkills() {
  const [time, setTime] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpanded = (id: string) => {
    setExpandedId((prev) => {
      const next = prev === id ? null : id
      setIsPaused(next !== null)
      return next
    })
  }

  useEffect(() => {
    if (isPaused) return

    let animationFrameId: number
    let lastTime = performance.now()

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000
      lastTime = currentTime

      setTime((prevTime) => prevTime + deltaTime)
      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrameId)
  }, [isPaused])

  const orbitConfigs: Array<{ radius: number; glowColor: GlowColor; delay: number }> = [
    { radius: 100, glowColor: 'cyan', delay: 0 },
    { radius: 190, glowColor: 'purple', delay: 1.5 },
  ]

  return (
    <div
      className="relative w-full flex items-center justify-center overflow-visible py-24"
      onClick={() => expandedId && toggleExpanded(expandedId)}
    >
      <div
        className="relative w-[calc(100vw-40px)] h-[calc(100vw-40px)] md:w-[500px] md:h-[500px] flex items-center justify-center"
        onMouseEnter={() => !expandedId && setIsPaused(true)}
        onMouseLeave={() => !expandedId && setIsPaused(false)}
      >
        <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center z-10 relative shadow-2xl">
          <div className="absolute inset-0 rounded-full bg-cyan-500/30 blur-xl animate-pulse"></div>
          <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="relative z-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="url(#orbitGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <defs>
                <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#9333EA" />
                </linearGradient>
              </defs>
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
          </div>
        </div>

        {orbitConfigs.map((config) => (
          <GlowingOrbitPath
            key={`path-${config.radius}`}
            radius={config.radius}
            glowColor={config.glowColor}
            animationDelay={config.delay}
          />
        ))}

        {skillsConfig.map((config) => {
          const angle = time * config.speed + (config.phaseShift || 0)
          return (
            <OrbitingSkill
              key={config.id}
              config={config}
              angle={angle}
              isExpanded={expandedId === config.id}
              onToggle={toggleExpanded}
            />
          )
        })}
      </div>
    </div>
  )
}
