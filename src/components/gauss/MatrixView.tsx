import { motion, AnimatePresence } from 'framer-motion'
import { StepType, type Step } from '../../engine/types'
import { fracDisplay } from '../../engine/matrix'

interface Props {
  step: Step
  variables: string[]
}

function cellColor(step: Step, row: number, col: number, n: number): string {
  const isAug = col === n
  if (isAug) return 'text-muted'

  switch (step.type) {
    case StepType.HighlightPivot:
      if (row === step.pivotRow && col === step.pivotRow) return 'text-pivot bg-pivot/20 rounded'
      break
    case StepType.SwapRows:
      if (row === step.swapRow1 || row === step.swapRow2) return 'text-accent bg-accent/10 rounded'
      break
    case StepType.HighlightTarget:
    case StepType.EliminateRow:
      if (row === step.pivotRow && col === step.pivotRow) return 'text-pivot'
      if (row === step.targetRow) return 'text-target bg-target/15 rounded'
      break
    case StepType.MarkZero:
      if (row === step.targetRow && col === step.pivotRow) return 'text-muted'
      break
    case StepType.BackSubstitute:
      if (row === step.pivotRow) return 'text-accent bg-accent/10 rounded'
      break
    case StepType.Complete:
      return 'text-pivot'
  }
  return 'text-white'
}

export default function MatrixView({ step, variables }: Props) {
  const n = variables.length
  const matrix = step.matrixSnap
  if (!matrix || matrix.length === 0) return null

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-1 text-muted text-xs font-mono mb-1">
        {variables.map(v => (
          <span key={v} className="w-14 text-center text-accent">{v}</span>
        ))}
        <span className="w-4 text-center">|</span>
        <span className="w-14 text-center">b</span>
      </div>

      <div className="relative flex items-center">
        <div className="absolute -left-3 top-0 bottom-0 flex flex-col justify-between">
          <span className="text-surface-2 text-3xl font-thin leading-none">⎡</span>
          {matrix.length > 2 && Array.from({ length: matrix.length - 2 }).map((_, i) => (
            <span key={i} className="text-surface-2 text-3xl font-thin leading-none">⎢</span>
          ))}
          <span className="text-surface-2 text-3xl font-thin leading-none">⎣</span>
        </div>

        <div className="flex flex-col gap-1 px-4">
          {matrix.map((row, ri) => (
            <div key={ri} className="flex items-center gap-1">
              {row.map((val, ci) => {
                const isAugSep = ci === n
                return (
                  <AnimatePresence key={ci} mode="wait">
                    <motion.span
                      key={`${ri}-${ci}-${val.toFixed(6)}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.25, type: 'spring', stiffness: 300, damping: 20 }}
                      className={`w-14 text-center font-mono text-sm py-1 px-1 ${
                        isAugSep ? 'border-l border-border ml-1 pl-2 ' : ''
                      }${cellColor(step, ri, ci, n)}`}
                    >
                      {fracDisplay(val)}
                    </motion.span>
                  </AnimatePresence>
                )
              })}
            </div>
          ))}
        </div>

        <div className="absolute -right-3 top-0 bottom-0 flex flex-col justify-between">
          <span className="text-surface-2 text-3xl font-thin leading-none">⎤</span>
          {matrix.length > 2 && Array.from({ length: matrix.length - 2 }).map((_, i) => (
            <span key={i} className="text-surface-2 text-3xl font-thin leading-none">⎥</span>
          ))}
          <span className="text-surface-2 text-3xl font-thin leading-none">⎦</span>
        </div>
      </div>
    </div>
  )
}
