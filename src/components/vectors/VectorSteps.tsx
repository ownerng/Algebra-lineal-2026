import { motion, AnimatePresence } from 'framer-motion'
import type { VecStep } from '../../engine/types'
import KatexRenderer from '../ui/KatexRenderer'

interface Props {
  steps: VecStep[]
  currentIndex: number
  onJump: (i: number) => void
}

export default function VectorSteps({ steps, currentIndex, onJump }: Props) {
  return (
    <div className="flex flex-col gap-2 overflow-y-auto h-full">
      <p className="text-muted text-xs mb-1 sticky top-0 bg-bg py-1">Pasos de la operación</p>
      {steps.map((s, i) => (
        <motion.button
          key={i}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => onJump(i)}
          className={`text-left flex flex-col gap-2 p-3 rounded-xl border transition-all ${
            i === currentIndex
              ? 'bg-target/10 border-target/30'
              : i < currentIndex
              ? 'border-border bg-surface/50 opacity-60 hover:opacity-90'
              : 'border-transparent opacity-30 hover:opacity-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono ${
              i === currentIndex ? 'bg-target text-white' : i < currentIndex ? 'bg-pivot/40 text-pivot' : 'bg-surface-2 text-muted'
            }`}>
              {i < currentIndex ? '✓' : i + 1}
            </span>
            <span className="text-white text-xs font-medium">{s.description}</span>
          </div>
          <div className="pl-7 overflow-x-auto">
            <KatexRenderer latex={s.latex} className="text-sm" />
          </div>
        </motion.button>
      ))}
    </div>
  )
}
