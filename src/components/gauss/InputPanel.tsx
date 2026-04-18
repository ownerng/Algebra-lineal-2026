import { useState } from 'react'
import { GAUSS_EXAMPLES } from '../../engine/examples'

interface Props {
  onSolve: (equations: string[]) => void
  error: string
}

export default function InputPanel({ onSolve, error }: Props) {
  const [rows, setRows] = useState(['x + y = 5', '2x - y = 1'])
  const [count, setCount] = useState(2)

  const updateCount = (n: number) => {
    setCount(n)
    setRows(prev => {
      const next = [...prev]
      while (next.length < n) next.push('')
      return next.slice(0, n)
    })
  }

  const loadExample = (eqs: string[]) => {
    setCount(eqs.length)
    setRows(eqs)
  }

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      <div className="flex items-center gap-3">
        <span className="text-muted text-sm">Tamaño:</span>
        {[2, 3, 4].map(n => (
          <button
            key={n}
            onClick={() => updateCount(n)}
            className={`w-8 h-8 rounded-lg text-sm font-mono font-medium transition-colors ${
              count === n ? 'bg-accent text-white' : 'bg-surface-2 text-muted hover:text-white'
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {rows.map((eq, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-muted text-xs font-mono w-5 text-right">{i + 1}.</span>
            <input
              className="input-field flex-1"
              value={eq}
              onChange={e => setRows(prev => { const n = [...prev]; n[i] = e.target.value; return n })}
              placeholder={`ecuación ${i + 1}`}
            />
          </div>
        ))}
      </div>

      {error && (
        <div className="text-target text-xs font-mono bg-target/10 border border-target/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <button
        onClick={() => onSolve(rows)}
        className="btn-primary w-full mt-auto"
      >
        Resolver →
      </button>

      <div className="border-t border-border pt-3">
        <p className="text-muted text-xs mb-2">Ejemplos:</p>
        <div className="flex flex-col gap-1">
          {GAUSS_EXAMPLES.map(ex => (
            <button
              key={ex.name}
              onClick={() => loadExample(ex.equations)}
              className="text-left text-xs text-muted hover:text-accent px-2 py-1 rounded hover:bg-surface-2 transition-colors"
            >
              {ex.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
