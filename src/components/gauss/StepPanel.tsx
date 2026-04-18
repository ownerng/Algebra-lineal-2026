import { motion } from 'framer-motion'
import { StepType, type Step } from '../../engine/types'

interface Props {
  step: Step
  index: number
  total: number
}

const TYPE_LABELS: Record<StepType, { label: string; color: string }> = {
  [StepType.HighlightPivot]:    { label: 'PIVOTE',      color: 'bg-pivot/20 text-pivot border-pivot/30' },
  [StepType.SwapRows]:          { label: 'INTERCAMBIO', color: 'bg-accent/20 text-accent border-accent/30' },
  [StepType.HighlightTarget]:   { label: 'OBJETIVO',    color: 'bg-target/20 text-target border-target/30' },
  [StepType.EliminateRow]:      { label: 'ELIMINAR',    color: 'bg-target/20 text-target border-target/30' },
  [StepType.MarkZero]:          { label: 'CERO',        color: 'bg-muted/20 text-muted border-muted/30' },
  [StepType.BackSubstitute]:    { label: 'SUSTITUCIÓN', color: 'bg-accent/20 text-accent border-accent/30' },
  [StepType.SingularDetected]:  { label: 'SINGULAR',    color: 'bg-target/20 text-target border-target/30' },
  [StepType.NoSolution]:        { label: 'SIN SOL.',    color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  [StepType.InfiniteSolutions]: { label: 'INF. SOL.',   color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  [StepType.Complete]:          { label: 'COMPLETO',    color: 'bg-pivot/20 text-pivot border-pivot/30' },
}

export default function StepPanel({ step, index, total }: Props) {
  const meta = TYPE_LABELS[step.type]

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="card flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className={`step-badge border ${meta.color}`}>{meta.label}</span>
        <span className="text-muted text-xs font-mono">{index + 1} / {total}</span>
      </div>

      <p className="font-mono text-sm text-white leading-relaxed">{step.description}</p>

      {step.type === StepType.EliminateRow && (
        <div className="text-xs text-muted bg-surface-2 rounded-lg p-3 font-mono">
          <p className="text-muted/70 mb-1">Factor de eliminación:</p>
          <p className="text-target">{step.factor.toFixed(6)}</p>
        </div>
      )}

      {step.type === StepType.Complete && step.solution.length > 0 && (
        <div className="bg-pivot/10 border border-pivot/20 rounded-lg p-3">
          <p className="text-pivot text-xs font-semibold mb-2">Solución:</p>
          <div className="flex flex-col gap-1">
            {step.solution.map((val, i) => (
              <p key={i} className="text-white font-mono text-sm">
                {step.description.split(',')[i] ?? `x${i+1} = ${val.toFixed(4)}`}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="w-full bg-surface-2 rounded-full h-1">
        <motion.div
          className="h-1 rounded-full bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${((index + 1) / total) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  )
}
