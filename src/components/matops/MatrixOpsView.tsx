import { motion, AnimatePresence } from 'framer-motion'
import { MatOpType, MatOpKind, type MatOpsStep } from '../../engine/types'
import { fracDisplay } from '../../engine/matrix'

interface Props {
  step: MatOpsStep
  A: number[][]
  B: number[][]
}

function cellStyle(
  step: MatOpsStep,
  which: 'A' | 'B' | 'C',
  r: number,
  c: number,
): string {
  const base = 'w-12 h-10 flex items-center justify-center font-mono text-sm rounded transition-all duration-200'

  switch (step.type) {
    case MatOpType.HighlightCell:
      if (which === 'A' && r === step.aRow && c === step.aCol) return `${base} bg-accent/20 text-accent`
      if (which === 'B' && r === step.bRow && c === step.bCol) return `${base} bg-pivot/20 text-pivot`
      break
    case MatOpType.SetResult:
      if (which === 'C' && r === step.row && c === step.col) return `${base} bg-target/20 text-target`
      break
    case MatOpType.HighlightRowCol:
      if (which === 'A' && r === step.aRow) return `${base} bg-accent/20 text-accent`
      if (which === 'B' && c === step.bCol) return `${base} bg-pivot/20 text-pivot`
      break
    case MatOpType.SetResultMul:
      if (which === 'C' && r === step.row && c === step.col) return `${base} bg-target/20 text-target`
      break
    case MatOpType.Complete:
      if (which === 'C') return `${base} bg-pivot/10 text-pivot`
      break
  }
  return `${base} text-white`
}

function MatGrid({ matrix, step, which, label, color }: {
  matrix: number[][]
  step: MatOpsStep
  which: 'A' | 'B' | 'C'
  label: string
  color: string
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="font-mono text-sm font-semibold" style={{ color }}>{label}</span>
      <div className="flex flex-col gap-0.5">
        {matrix.map((row, r) => (
          <div key={r} className="flex gap-0.5">
            {row.map((val, c) => (
              <AnimatePresence key={`${r}-${c}`} mode="wait">
                <motion.div
                  key={`${r}-${c}-${val.toFixed(4)}`}
                  initial={{ scale: 0.85, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2, type: 'spring', stiffness: 400 }}
                  className={cellStyle(step, which, r, c)}
                >
                  {fracDisplay(val)}
                </motion.div>
              </AnimatePresence>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

const OP_SYMBOLS: Record<MatOpKind, string> = {
  [MatOpKind.Add]: '+',
  [MatOpKind.Sub]: '−',
  [MatOpKind.Mul]: '×',
}

export default function MatrixOpsView({ step, A, B }: Props) {
  const C = step.snapC
  const n = A.length

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-4">
        <MatGrid matrix={A} step={step} which="A" label="A" color="#5B8AF0" />
        <span className="text-2xl text-muted font-mono">{OP_SYMBOLS[step.op]}</span>
        <MatGrid matrix={B} step={step} which="B" label="B" color="#3DAA72" />
        <span className="text-2xl text-muted font-mono">=</span>
        <MatGrid matrix={C.length ? C : Array.from({ length: n }, () => Array(n).fill(0))} step={step} which="C" label="C" color="#D4884A" />
      </div>

      <motion.div
        key={step.description}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-sm font-mono text-white bg-surface border border-border rounded-lg px-4 py-2 max-w-md"
      >
        {step.description}
      </motion.div>

      {step.type === MatOpType.Complete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-pivot text-sm font-medium"
        >
          ✓ Operación completada — {step.opCount} operaciones aritméticas
        </motion.div>
      )}
    </div>
  )
}
