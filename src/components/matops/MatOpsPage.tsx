import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { MatOpKind, MatOpType, type MatOpsStep } from '../../engine/types'
import { matAdd, matSub, matMul } from '../../engine/matrixOps'
import { fracDisplay } from '../../engine/matrix'
import MatrixGridInput from './MatrixGridInput'

/* ── Icons ── */
const IconPlay  = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 2 L11 7 L3 12 Z"/></svg>
const IconPause = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="3" y="2" width="3" height="10" rx="0.5"/><rect x="8" y="2" width="3" height="10" rx="0.5"/></svg>
const IconPrev  = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M11 2 L5 7 L11 12 Z"/><rect x="3" y="2" width="1.5" height="10"/></svg>
const IconNext  = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 2 L9 7 L3 12 Z"/><rect x="9.5" y="2" width="1.5" height="10"/></svg>
const IconReset = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M2.5 7 a4.5 4.5 0 1 0 1.5-3.4"/><polyline points="2,2 2,4.5 4.5,4.5"/></svg>

const makeId  = (n: number): number[][] => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? 1 : 0))

const OPS = [
  { id: MatOpKind.Add, label: 'Suma',           sub: 'A + B' },
  { id: MatOpKind.Sub, label: 'Resta',          sub: 'A − B' },
  { id: MatOpKind.Mul, label: 'Multiplicación', sub: 'A × B' },
]

function SmallMatrix({ data, highlight }: { data: number[][]; highlight?: { row: number; col: number } }) {
  if (!data || !data.length) return null
  const ncols = data[0].length
  return (
    <div className="matrix-wrap">
      <div className="matrix-paren left" />
      <div className="matrix" style={{ gridTemplateColumns: `repeat(${ncols}, auto)` }}>
        {data.map((row, i) => row.map((val, j) => {
          const isHl = highlight && highlight.row === i && highlight.col === j
          return (
            <div key={`${i}-${j}`} className={`matrix-cell sm${isHl ? ' hl-pivot changed' : ''}`}>
              {fracDisplay(val)}
            </div>
          )
        }))}
      </div>
      <div className="matrix-paren right" />
    </div>
  )
}

export default function MatOpsPage() {
  const [size, setSize]   = useState(2)
  const [A, setA]         = useState<number[][]>(makeId(2))
  const [B, setB]         = useState<number[][]>(makeId(2))
  const [op, setOp]       = useState<MatOpKind>(MatOpKind.Mul)
  const [steps, setSteps] = useState<MatOpsStep[] | null>(null)
  const [idx, setIdx]     = useState(0)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateSize = (n: number) => { setSize(n); setA(makeId(n)); setB(makeId(n)); setSteps(null) }

  const compute = useCallback(() => {
    setError('')
    try {
      let s: MatOpsStep[]
      if (op === MatOpKind.Add)      s = matAdd(A, B)
      else if (op === MatOpKind.Sub) s = matSub(A, B)
      else                           s = matMul(A, B)
      setSteps(s); setIdx(0); setPlaying(true)
    } catch (e) { setError((e as Error).message) }
  }, [A, B, op])

  useEffect(() => {
    if (!playing || !steps) return
    if (idx >= steps.length - 1) { setPlaying(false); return }
    timerRef.current = setTimeout(() => setIdx(i => i + 1), 1100)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [playing, idx, steps])

  const step = steps?.[idx]
  const opInfo = OPS.find(o => o.id === op)!
  const opSymbol = op === MatOpKind.Add ? '+' : op === MatOpKind.Sub ? '−' : '×'

  const resultHighlight = step ? { row: step.row, col: step.col } : undefined

  return (
    <div className="content">
      <div className="module-intro">
        <div className="module-intro-text">
          <div className="module-eyebrow">Módulo · Operaciones Matriciales</div>
          <h1 className="module-title">Matrices</h1>
          <p className="module-desc">
            Suma, resta y multiplicación con desglose animado celda por celda. Ideal para el aula.
          </p>
        </div>
      </div>

      <div className="stage split">
        {/* LEFT */}
        <div className="stage-panel" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <h3 className="stage-panel-h">Operación</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 12 }}>
              {OPS.map(o => (
                <button
                  key={o.id}
                  className="example-card"
                  style={{
                    background: op === o.id ? 'var(--sage-tint)' : 'var(--bg)',
                    borderColor: op === o.id ? 'oklch(0.48 0.045 145 / 0.35)' : 'var(--rule)',
                  }}
                  onClick={() => setOp(o.id)}
                >
                  <div className="example-name">{o.label}</div>
                  <div className="example-meta">{o.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--ink-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Tamaño</span>
              {[2, 3, 4].map(n => (
                <button key={n} className={`btn btn-icon${size === n ? ' btn-primary' : ' btn-ghost'}`} style={{ width: 32, height: 32, fontSize: 13, border: '1px solid var(--rule)' }} onClick={() => updateSize(n)}>
                  {n}
                </button>
              ))}
            </div>
            {error && <div className="error-banner">{error}</div>}
            <MatrixGridInput label="A" size={size} values={A} onChange={setA} />
            <div style={{ marginTop: 16 }}>
              <MatrixGridInput label="B" size={size} values={B} onChange={setB} />
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={compute}>
            Calcular y animar
          </button>
          {steps && (
            <button className="btn btn-ghost" style={{ width: '100%', fontSize: 12 }} onClick={() => { setSteps(null); setPlaying(false) }}>
              Reiniciar
            </button>
          )}
        </div>

        {/* RIGHT */}
        <div className="stage-panel" style={{ display: 'flex', flexDirection: 'column', gap: 18, minHeight: 480 }}>
          {!steps ? (
            <div style={{ flex: 1, display: 'grid', placeItems: 'center', textAlign: 'center', color: 'var(--ink-faint)' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontStyle: 'italic', marginBottom: 10, color: 'var(--ink-soft)' }}>
                  {opInfo.label} — {opInfo.sub}
                </div>
                <div style={{ fontSize: 13.5, maxWidth: 300, margin: '0 auto', lineHeight: 1.5 }}>
                  Configure las matrices y presione <span className="kbd">Calcular y animar</span>.
                </div>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h3 className="stage-panel-h">Resultado — {opInfo.label}</h3>
                <p className="stage-panel-desc">Entrada por entrada, acumulando el resultado.</p>
              </div>

              <div style={{ flex: 1, display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-faint)' }}>A</span>
                  <SmallMatrix data={A} />
                </div>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--ink-faint)' }}>{opSymbol}</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-faint)' }}>B</span>
                  <SmallMatrix data={B} />
                </div>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--ink-faint)' }}>=</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-faint)' }}>C</span>
                  <SmallMatrix data={step?.snapC ?? []} highlight={resultHighlight} />
                </div>
              </div>

              {step && (
                <div className="steplog">
                  <div className="steplog-eyebrow">Operación</div>
                  <div>{step.description}</div>
                </div>
              )}

              <div className="player">
                <button className="btn btn-icon btn-ghost" onClick={() => { setPlaying(false); setIdx(0) }}><IconReset /></button>
                <button className="btn btn-icon btn-ghost" onClick={() => { setPlaying(false); setIdx(i => Math.max(0, i - 1)) }} disabled={idx === 0}><IconPrev /></button>
                <button className="btn btn-icon btn-primary" onClick={() => { if (idx >= steps.length - 1) setIdx(0); setPlaying(p => !p) }}>
                  {playing ? <IconPause /> : <IconPlay />}
                </button>
                <button className="btn btn-icon btn-ghost" onClick={() => { setPlaying(false); setIdx(i => Math.min(steps.length - 1, i + 1)) }} disabled={idx >= steps.length - 1}><IconNext /></button>
                <div className="player-track" onClick={e => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const ratio = (e.clientX - rect.left) / rect.width
                  setPlaying(false); setIdx(Math.round(ratio * (steps.length - 1)))
                }}>
                  <div className="player-fill" style={{ width: `${steps.length > 1 ? (idx / (steps.length - 1)) * 100 : 0}%` }} />
                </div>
                <div className="player-step">{idx + 1} / {steps.length}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
