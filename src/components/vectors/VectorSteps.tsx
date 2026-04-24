import type { VecStep } from '../../engine/types'
import KatexRenderer from '../ui/KatexRenderer'

interface Props {
  steps: VecStep[]
  currentIndex: number
  onJump: (i: number) => void
}

export default function VectorSteps({ steps, currentIndex, onJump }: Props) {
  if (!steps.length) return null

  return (
    <>
      <div className="step-rail-header">Procedimiento</div>
      <div className="step-rail">
        {steps.map((s, i) => {
          const state = i === currentIndex ? 'active' : i < currentIndex ? 'done' : 'future'
          return (
            <button
              key={i}
              className={`step-item ${state}`}
              onClick={() => onJump(i)}
            >
              <div className="step-num">
                {i < currentIndex ? '✓' : i + 1}
              </div>
              <div className="step-body">
                <div className="step-desc">{s.description}</div>
                {s.latex && (
                  <KatexRenderer latex={s.latex} className="step-latex" />
                )}
                {s.reason && (
                  <div className="step-reason">{s.reason}</div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </>
  )
}
