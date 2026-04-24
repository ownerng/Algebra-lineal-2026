import { useState, useEffect, useRef, useCallback } from 'react'
import { MatOpKind, MatOpType, type MatOpsStep } from '../../engine/types'
import { matAdd, matSub, matMul } from '../../engine/matrixOps'
import { fracDisplay } from '../../engine/matrix'
import MatrixGridInput from './MatrixGridInput'
import Frac from '../ui/Frac'

const IconPlay  = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 2 L11 7 L3 12 Z"/></svg>
const IconPause = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="3" y="2" width="3" height="10" rx="0.5"/><rect x="8" y="2" width="3" height="10" rx="0.5"/></svg>
const IconPrev  = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M11 2 L5 7 L11 12 Z"/><rect x="3" y="2" width="1.5" height="10"/></svg>
const IconNext  = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 2 L9 7 L3 12 Z"/><rect x="9.5" y="2" width="1.5" height="10"/></svg>
const IconReset = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M2.5 7 a4.5 4.5 0 1 0 1.5-3.4"/><polyline points="2,2 2,4.5 4.5,4.5"/></svg>
const IconBack  = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="12" y1="7" x2="3" y2="7"/><polyline points="6,4 3,7 6,10"/></svg>
const IconList  = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><line x1="4" y1="3.5" x2="12" y2="3.5"/><line x1="4" y1="7" x2="12" y2="7"/><line x1="4" y1="10.5" x2="12" y2="10.5"/><circle cx="2" cy="3.5" r="0.7" fill="currentColor"/><circle cx="2" cy="7" r="0.7" fill="currentColor"/><circle cx="2" cy="10.5" r="0.7" fill="currentColor"/></svg>

const IconDice  = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="1" width="12" height="12" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.3"/><circle cx="4.5" cy="4.5" r="1"/><circle cx="9.5" cy="4.5" r="1"/><circle cx="7" cy="7" r="1"/><circle cx="4.5" cy="9.5" r="1"/><circle cx="9.5" cy="9.5" r="1"/></svg>

const makeId = (n: number): number[][] => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? 1 : 0))

const OPS = [
  { id: MatOpKind.Add, label: 'Suma',           sub: 'A + B' },
  { id: MatOpKind.Sub, label: 'Resta',          sub: 'A − B' },
  { id: MatOpKind.Mul, label: 'Multiplicación', sub: 'A × B' },
]

function SmallMatrix({ data, highlight }: { data: number[][]; highlight?: { row: number; col: number } }) {
  if (!data?.length) return null
  const ncols = data[0].length
  return (
    <div className="matrix-wrap">
      <div className="matrix-paren left" />
      <div className="matrix" style={{ gridTemplateColumns: `repeat(${ncols}, auto)` }}>
        {data.map((row, i) => row.map((val, j) => (
          <div key={`${i}-${j}`} className={`matrix-cell sm${highlight?.row === i && highlight?.col === j ? ' hl-pivot changed' : ''}`}>
            <Frac n={val} />
          </div>
        )))}
      </div>
      <div className="matrix-paren right" />
    </div>
  )
}

export default function MatOpsPage() {
  const [size, setSize]       = useState(2)
  const [A, setA]             = useState<number[][]>(makeId(2))
  const [B, setB]             = useState<number[][]>(makeId(2))
  const [op, setOp]           = useState<MatOpKind>(MatOpKind.Mul)
  const [steps, setSteps]     = useState<MatOpsStep[] | null>(null)
  const [idx, setIdx]         = useState(0)
  const [playing, setPlaying] = useState(false)
  const [error, setError]       = useState('')
  const [showPanel, setShowPanel] = useState(false)
  const timerRef                = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateSize = (n: number) => { setSize(n); setA(makeId(n)); setB(makeId(n)); setSteps(null) }

  const randomize = useCallback(() => {
    const rand = () => {
      const r = Math.random()
      if (r < 0.35) {
        const denoms = [2, 3, 4, 5, 6]
        const d = denoms[Math.floor(Math.random() * denoms.length)]
        const n = Math.floor(Math.random() * (2 * d + 1)) - d
        return n / d
      }
      return Math.floor(Math.random() * 19) - 9
    }
    const rA = Array.from({ length: size }, () => Array.from({ length: size }, () => rand()))
    const rB = Array.from({ length: size }, () => Array.from({ length: size }, () => rand()))
    setA(rA); setB(rB); setSteps(null)
  }, [size])

  const compute = useCallback(() => {
    setError('')
    try {
      const s = op === MatOpKind.Add ? matAdd(A, B) : op === MatOpKind.Sub ? matSub(A, B) : matMul(A, B)
      setSteps(s); setIdx(0); setPlaying(true)
    } catch (e) { setError((e as Error).message) }
  }, [A, B, op])

  useEffect(() => {
    if (!playing || !steps) return
    if (idx >= steps.length - 1) { setPlaying(false); return }
    timerRef.current = setTimeout(() => setIdx(i => i + 1), 1100)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [playing, idx, steps])

  const step    = steps?.[idx]
  const opInfo  = OPS.find(o => o.id === op)!
  const opSym   = op === MatOpKind.Add ? '+' : op === MatOpKind.Sub ? '−' : '×'

  return (
    <div className={`matops-page ${steps ? 'matops-page--presenting' : ''}`}>

      {!steps ? (
        <div className="module-landing">
          <div className="module-landing-center">
            <div className="module-landing-left">
              <div className="module-eyebrow">Módulo · Operaciones Matriciales</div>
              <h1 className="module-landing-title">Matrices</h1>
              <p className="module-landing-desc">
                Suma, resta y multiplicación con desglose animado celda por celda.
              </p>

              <div className="op-selector">
                {OPS.map(o => (
                  <button key={o.id} className={`op-pill${op === o.id ? ' op-pill--active' : ''}`}
                    onClick={() => setOp(o.id)}>
                    <span className="op-pill-label">{o.label}</span>
                    <span className="op-pill-sub">{o.sub}</span>
                  </button>
                ))}
              </div>

              <div className="size-selector">
                <span className="size-label">Dimensión</span>
                {[2, 3, 4].map(n => (
                  <button key={n} className={`size-btn${size === n ? ' size-btn--active' : ''}`}
                    onClick={() => updateSize(n)}>{n}×{n}</button>
                ))}
                <button className="btn btn-ghost" onClick={randomize} style={{ marginLeft: 8, gap: 6, fontSize: 12.5, padding: '5px 12px' }}>
                  <IconDice /> Aleatorio
                </button>
              </div>

              {error && <div className="error-banner">{error}</div>}

              <div className="mat-pair">
                <MatrixGridInput label="A" size={size} values={A} onChange={setA} />
                <MatrixGridInput label="B" size={size} values={B} onChange={setB} />
              </div>

              <div className="module-landing-actions">
                <button className="btn btn-primary btn-go" onClick={compute}>
                  Calcular y animar
                </button>
              </div>
            </div>

            <div className="module-landing-right">
              <div className="module-landing-right-label">Operación</div>
              <div className="op-display">
                <span className="op-display-letter">A</span>
                <span className="op-display-sym">{opSym}</span>
                <span className="op-display-letter">B</span>
              </div>
              <div className="module-landing-hint">
                {opInfo.label} — cada celda de C se calcula y resalta paso a paso.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="gauss-cinema">
          {/* ── Full-screen matrices ── */}
          <div className="gauss-matrix-stage">
            <div className="cinema-matops-display">
              <div className="cinema-matops-col">
                <span className="cinema-matops-label">A</span>
                <SmallMatrix data={A} />
              </div>
              <span className="cinema-matops-op">{opSym}</span>
              <div className="cinema-matops-col">
                <span className="cinema-matops-label">B</span>
                <SmallMatrix data={B} />
              </div>
              <span className="cinema-matops-op">=</span>
              <div className="cinema-matops-col">
                <span className="cinema-matops-label">C</span>
                <SmallMatrix data={step?.snapC ?? []} highlight={step ? { row: step.row, col: step.col } : undefined} />
              </div>
            </div>
          </div>

          {/* ── Floating step info top-left ── */}
          <div className="gauss-cinema-info">
            <div className="gauss-cinema-step-label">
              Paso {idx + 1} / {steps.length}
            </div>
            {step && (
              <div className="gauss-cinema-desc">{step.description}</div>
            )}
            {step?.reason && (
              <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink-faint)', marginTop: 4 }}>
                {step.reason}
              </div>
            )}
          </div>

          {/* ── Complete banner ── */}
          {step?.type === MatOpType.Complete && (
            <div className="gauss-cinema-solution">
              La matriz resultado C ha sido calculada completamente.
            </div>
          )}

          {/* ── Bottom control bar ── */}
          <div className="gauss-cinema-controls">
            <div className="gauss-cinema-controls-left">
              <button className="gauss-btn" onClick={() => { setSteps(null); setPlaying(false) }} title="Volver al editor">
                <IconBack />
              </button>
            </div>

            <div className="gauss-cinema-controls-center">
              <button className="gauss-btn" onClick={() => { setPlaying(false); setIdx(0) }} title="Reiniciar"><IconReset /></button>
              <button className="gauss-btn" disabled={idx === 0} onClick={() => { setPlaying(false); setIdx(i => Math.max(0, i - 1)) }}><IconPrev /></button>
              <button className="gauss-btn gauss-btn--play" onClick={() => { if (idx >= steps.length - 1) setIdx(0); setPlaying(p => !p) }}>
                {playing ? <IconPause /> : <IconPlay />}
              </button>
              <button className="gauss-btn" disabled={idx >= steps.length - 1} onClick={() => { setPlaying(false); setIdx(i => Math.min(steps.length - 1, i + 1)) }}><IconNext /></button>
            </div>

            <div className="gauss-cinema-controls-right">
              <div className="gauss-cinema-progress" onClick={e => {
                const r = e.currentTarget.getBoundingClientRect()
                setPlaying(false); setIdx(Math.round(((e.clientX - r.left) / r.width) * (steps.length - 1)))
              }}>
                <div className="gauss-cinema-progress-fill" style={{ width: `${steps.length > 1 ? (idx / (steps.length - 1)) * 100 : 0}%` }} />
              </div>
              <button className="gauss-btn" onClick={() => setShowPanel(!showPanel)} title="Ver pasos">
                <IconList />
              </button>
            </div>
          </div>

          {/* ── Step rail overlay ── */}
          {showPanel && (
            <div className="gauss-cinema-overlay" onClick={() => setShowPanel(false)}>
              <div className="gauss-cinema-side" onClick={e => e.stopPropagation()}>
                <div className="step-rail-header">Operaciones</div>
                <div className="step-rail">
                  {steps.map((s, i) => {
                    const state = i === idx ? 'active' : i < idx ? 'done' : 'future'
                    return (
                      <button key={i} className={`step-item ${state}`}
                        onClick={() => { setPlaying(false); setIdx(i) }}>
                        <div className="step-num">{i < idx ? '✓' : i + 1}</div>
                        <div className="step-body">
                          <div className="step-desc">{s.description}</div>
                          {s.reason && <div className="step-reason">{s.reason}</div>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
