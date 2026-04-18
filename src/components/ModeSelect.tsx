import { motion } from 'framer-motion'
import { useAppStore, type AppMode } from '../store'

const CARDS = [
  {
    id: 'gauss' as AppMode,
    title: 'Eliminación Gaussiana',
    subtitle: 'Con Pivoteo Parcial',
    desc: 'Visualiza paso a paso cómo se resuelven sistemas de ecuaciones lineales usando el algoritmo GEPP animado.',
    icon: (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="6" y="6" width="36" height="36" rx="3" />
        <line x1="18" y1="6" x2="18" y2="42" /><line x1="30" y1="6" x2="30" y2="42" />
        <line x1="6" y1="18" x2="42" y2="18" /><line x1="6" y1="30" x2="42" y2="30" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
        <circle cx="24" cy="24" r="2" fill="currentColor" />
        <circle cx="36" cy="36" r="2" fill="currentColor" />
      </svg>
    ),
    color: 'accent',
    glow: 'rgba(91,138,240,0.15)',
    border: '#5B8AF0',
  },
  {
    id: 'matops' as AppMode,
    title: 'Operaciones Matriciales',
    subtitle: 'Suma · Resta · Multiplicación',
    desc: 'Observa cómo se calculan las operaciones entre matrices con animaciones celda por celda.',
    icon: (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="8" width="18" height="32" rx="2" />
        <rect x="26" y="8" width="18" height="32" rx="2" />
        <text x="22" y="28" textAnchor="middle" fontSize="14" fill="currentColor" stroke="none">×</text>
      </svg>
    ),
    color: 'pivot',
    glow: 'rgba(61,170,114,0.15)',
    border: '#3DAA72',
  },
  {
    id: 'vectors' as AppMode,
    title: 'Vectores en 3D',
    subtitle: 'Suma · Cruz · Punto · Escalar',
    desc: 'Explora operaciones vectoriales con animaciones 3D interactivas y explicaciones paso a paso.',
    icon: (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5">
        <line x1="8" y1="40" x2="40" y2="8" />
        <polyline points="28,8 40,8 40,20" />
        <line x1="8" y1="40" x2="24" y2="40" />
        <polyline points="18,40 8,40 8,28" />
        <circle cx="8" cy="40" r="3" fill="currentColor" />
      </svg>
    ),
    color: 'target',
    glow: 'rgba(212,136,74,0.15)',
    border: '#D4884A',
  },
]

export default function ModeSelect() {
  const { setMode } = useAppStore()

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 py-12 bg-bg">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-14"
      >
        <h1 className="text-5xl font-bold tracking-tight text-white mb-3">
          Math<span className="text-accent">Learn</span>
        </h1>
        <p className="text-muted text-lg">Álgebra Lineal Visual e Interactiva</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl w-full">
        {CARDS.map((card, i) => (
          <motion.button
            key={card.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 + 0.2, duration: 0.4 }}
            whileHover={{ scale: 1.03, transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setMode(card.id)}
            className="relative text-left p-6 rounded-2xl border transition-all duration-200 group cursor-pointer"
            style={{
              background: `linear-gradient(135deg, #1A1A1D, #0E0E0F)`,
              borderColor: '#2A2A2F',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = card.border
              ;(e.currentTarget as HTMLElement).style.boxShadow = `0 0 32px ${card.glow}`
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#2A2A2F'
              ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
            }}
          >
            <div className="mb-4" style={{ color: card.border }}>{card.icon}</div>
            <h2 className="text-white font-semibold text-lg mb-0.5">{card.title}</h2>
            <p className="text-xs mb-3" style={{ color: card.border }}>{card.subtitle}</p>
            <p className="text-muted text-sm leading-relaxed">{card.desc}</p>
            <div
              className="mt-5 inline-flex items-center text-xs font-medium gap-1.5 transition-colors"
              style={{ color: card.border }}
            >
              Explorar <span>→</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
