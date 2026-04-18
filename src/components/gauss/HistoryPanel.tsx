import { motion } from 'framer-motion'
import { StepType, type Step } from '../../engine/types'

interface Props {
  steps: Step[]
  currentIndex: number
  onJump: (i: number) => void
}

const TYPE_COLORS: Record<StepType, string> = {
  [StepType.HighlightPivot]:    'bg-pivot',
  [StepType.SwapRows]:          'bg-accent',
  [StepType.HighlightTarget]:   'bg-target',
  [StepType.EliminateRow]:      'bg-target',
  [StepType.MarkZero]:          'bg-muted',
  [StepType.BackSubstitute]:    'bg-accent',
  [StepType.SingularDetected]:  'bg-target',
  [StepType.NoSolution]:        'bg-red-500',
  [StepType.InfiniteSolutions]: 'bg-purple-500',
  [StepType.Complete]:          'bg-pivot',
}

export default function HistoryPanel({ steps, currentIndex, onJump }: Props) {
  return (
    <div className="flex flex-col gap-1 overflow-y-auto h-full pr-1">
      <p className="text-muted text-xs mb-2 sticky top-0 bg-bg py-1">Historial de pasos</p>
      {steps.map((s, i) => (
        <motion.button
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.02, duration: 0.2 }}
          onClick={() => onJump(i)}
          className={`flex items-start gap-2 text-left px-2 py-1.5 rounded-lg transition-colors ${
            i === currentIndex
              ? 'bg-accent/10 border border-accent/20'
              : i < currentIndex
              ? 'opacity-50 hover:opacity-80 hover:bg-surface-2'
              : 'opacity-30 hover:opacity-50 hover:bg-surface-2'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${TYPE_COLORS[s.type]}`} />
          <span className="text-xs font-mono text-white leading-relaxed">{s.description}</span>
        </motion.button>
      ))}
    </div>
  )
}
