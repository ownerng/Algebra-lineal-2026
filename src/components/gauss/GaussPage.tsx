import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { parse } from '../../engine/parser'
import { solve } from '../../engine/gauss'
import { StepType, type Step } from '../../engine/types'
import { GAUSS_EXAMPLES } from '../../engine/examples'
import Frac from '../ui/Frac'

const IconPlay   = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 2 L11 7 L3 12 Z"/></svg>
const IconPause  = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="3" y="2" width="3" height="10" rx="0.5"/><rect x="8" y="2" width="3" height="10" rx="0.5"/></svg>
const IconPrev   = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M11 2 L5 7 L11 12 Z"/><rect x="3" y="2" width="1.5" height="10"/></svg>
const IconNext   = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 2 L9 7 L3 12 Z"/><rect x="9.5" y="2" width="1.5" height="10"/></svg>
const IconReset  = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M2.5 7 a4.5 4.5 0 1 0 1.5-3.4"/><polyline points="2,2 2,4.5 4.5,4.5"/></svg>
const IconAdd    = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="7" y1="3" x2="7" y2="11"/><line x1="3" y1="7" x2="11" y2="7"/></svg>
const IconRemove = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="3" y1="7" x2="11" y2="7"/></svg>
const IconBack   = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="12" y1="7" x2="3" y2="7"/><polyline points="6,4 3,7 6,10"/></svg>
const IconList   = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><line x1="4" y1="3.5" x2="12" y2="3.5"/><line x1="4" y1="7" x2="12" y2="7"/><line x1="4" y1="10.5" x2="12" y2="10.5"/><circle cx="2" cy="3.5" r="0.7" fill="currentColor"/><circle cx="2" cy="7" r="0.7" fill="currentColor"/><circle cx="2" cy="10.5" r="0.7" fill="currentColor"/></svg>
const IconDice   = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="1" width="12" height="12" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.3"/><circle cx="4.5" cy="4.5" r="1"/><circle cx="9.5" cy="4.5" r="1"/><circle cx="7" cy="7" r="1"/><circle cx="4.5" cy="9.5" r="1"/><circle cx="9.5" cy="9.5" r="1"/></svg>

const VARS = ['x', 'y', 'z', 'w']

interface Highlight {
  pivotRow?: number; pivotCol?: number
  targetRow?: number; sourceRow?: number
  rows?: number[]
}

function getHighlight(step: Step): Highlight {
  switch (step.type) {
    case StepType.HighlightPivot:    return { pivotRow: step.pivotRow, pivotCol: step.pivotRow }
    case StepType.SwapRows:           return { rows: [step.swapRow1, step.swapRow2] }
    case StepType.HighlightTarget:   return { pivotRow: step.pivotRow, pivotCol: step.pivotRow, targetRow: step.targetRow }
    case StepType.EliminateRow:
    case StepType.MarkZero:          return { sourceRow: step.pivotRow, pivotCol: step.pivotRow, targetRow: step.targetRow }
    case StepType.BackSubstitute:    return { sourceRow: step.pivotRow, pivotCol: step.pivotRow }
    default:                          return {}
  }
}

function cellClass(hl: Highlight, row: number, col: number, _nVars: number, isAug: boolean): string {
  const cls = ['matrix-cell']
  if (isAug) cls.push('augment-divider')
  const { pivotRow, pivotCol, targetRow, sourceRow, rows } = hl
  if (pivotRow !== undefined && pivotCol !== undefined && row === pivotRow && col === pivotCol) cls.push('hl-pivot')
  else if (targetRow !== undefined && pivotCol !== undefined && row === targetRow && col === pivotCol) cls.push('hl-target')
  else if (sourceRow !== undefined && pivotCol !== undefined && row === sourceRow && col === pivotCol) cls.push('hl-source')
  else if (rows !== undefined && rows.includes(row)) cls.push('hl-row')
  else if (targetRow !== undefined && row === targetRow) cls.push('hl-target')
  else if (sourceRow !== undefined && row === sourceRow) cls.push('hl-source')
  else if (pivotRow !== undefined && row === pivotRow) cls.push('hl-row')
  return cls.join(' ')
}

function MatrixDisplay({ matrix, nVars, highlight, changedCells }: {
  matrix: number[][]; nVars: number; highlight: Highlight; changedCells: Set<string>
}) {
  if (!matrix?.length) return null
  const ncols = matrix[0].length
  return (
    <div className="matrix-wrap">
      <div className="matrix-paren left" />
      <div className="matrix" style={{ gridTemplateColumns: `repeat(${ncols}, auto)` }}>
        {matrix.map((row, i) => row.map((val, j) => {
          const cls = cellClass(highlight, i, j, nVars, j === nVars)
          return (
            <div key={`${i}-${j}-${val}`} className={changedCells.has(`${i}-${j}`) ? cls + ' changed' : cls}>
              <Frac n={val} />
            </div>
          )
        }))}
      </div>
      <div className="matrix-paren right" />
    </div>
  )
}


const DEFAULTS = ['2x + y - z = 8', '-3x - y + 2z = -11', '-2x + y + 2z = -3']

export default function GaussPage() {
  const [equations, setEquations] = useState<string[]>(DEFAULTS)
  const [result, setResult]       = useState<{ steps: Step[]; variables: string[] } | null>(null)
  const [stepIdx, setStepIdx]     = useState(0)
  const [playing, setPlaying]     = useState(false)
  const [error, setError]         = useState('')
  const [showPanel, setShowPanel] = useState<'examples' | 'steps' | null>(null)
  const timerRef                  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stageRef                  = useRef<HTMLDivElement>(null)

  const addEq    = () => setEquations(p => [...p, ''])
  const removeEq = (i: number) => setEquations(p => p.filter((_, idx) => idx !== i))
  const updateEq = (i: number, v: string) => {
    setEquations(p => { const n = [...p]; n[i] = v; return n }); setResult(null)
  }

  const randomizeGauss = useCallback(() => {
    const n    = equations.length
    const vars = VARS.slice(0, n)
    const sol  = Array.from({ length: n }, () => Math.floor(Math.random() * 11) - 5)
    const coeffs = Array.from({ length: n }, () => {
      let row: number[]
      do { row = Array.from({ length: n }, () => Math.floor(Math.random() * 13) - 6) }
      while (row.every(c => c === 0))
      return row
    })
    const eqs = coeffs.map(row => {
      const rhs   = row.reduce((sum, c, j) => sum + c * sol[j], 0)
      const terms = row.map((c, j) => {
        if (c === 0) return null
        const abs  = Math.abs(c)
        const coef = abs === 1 ? '' : String(abs)
        return `${c > 0 ? '+' : '-'}${coef}${vars[j]}`
      }).filter(Boolean) as string[]
      if (terms.length === 0) return `0 = ${rhs}`
      const first = terms[0].startsWith('+') ? terms[0].slice(1) : terms[0]
      const rest  = terms.slice(1).map(t => t.startsWith('+') ? ` + ${t.slice(1)}` : ` - ${t.slice(1)}`)
      return `${first}${rest.join('')} = ${rhs}`
    })
    setEquations(eqs); setResult(null); setError('')
  }, [equations.length])

  const handleSolve = () => {
    setError('')
    try {
      const filtered = equations.map(e => e.trim()).filter(Boolean)
      if (!filtered.length) throw new Error('Agrega al menos una ecuación')
      const parsed = parse(filtered)
      const steps  = solve(parsed.matrix, parsed.variables)
      setResult({ steps, variables: parsed.variables })
      setStepIdx(0); setPlaying(true)
    } catch (e) { setError((e as Error).message); setResult(null) }
  }

  useEffect(() => {
    if (!playing || !result) return
    if (stepIdx >= result.steps.length - 1) { setPlaying(false); return }
    timerRef.current = setTimeout(() => setStepIdx(s => s + 1), 1400)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [playing, stepIdx, result])

  const step = result?.steps[stepIdx]
  const highlight: Highlight = step ? getHighlight(step) : {}

  const changedCells = useMemo<Set<string>>(() => {
    const s = new Set<string>()
    if (!result || stepIdx === 0) return s
    const prev = result.steps[stepIdx - 1].matrixSnap
    const cur  = result.steps[stepIdx].matrixSnap
    for (let i = 0; i < cur.length; i++)
      for (let j = 0; j < cur[i].length; j++)
        if (Math.abs((prev[i]?.[j] ?? 0) - cur[i][j]) > 1e-9) s.add(`${i}-${j}`)
    return s
  }, [result, stepIdx])

  const isFinal   = result && stepIdx === result.steps.length - 1
  const finalStep = isFinal ? result!.steps[result!.steps.length - 1] : null

  return (
    <div className={`gauss-page ${result ? 'gauss-page--presenting' : ''}`} ref={stageRef}>

      {!result ? (
        <div className="module-landing">
          <div className="module-landing-center">
            <div className="module-landing-left">
              <div className="module-eyebrow">Módulo · Sistemas Lineales</div>
              <h1 className="module-landing-title">Gauss-Jordan</h1>
              <p className="module-landing-desc">
                Ingrese un sistema de ecuaciones lineales y proyecte la reducción paso a paso.
              </p>

              {error && <div className="error-banner">{error}</div>}

              <div className="eq-list">
                {equations.map((eq, i) => (
                  <div className="eq-row" key={i}>
                    <div className="eq-num">{i + 1}.</div>
                    <input
                      className="eq-input" value={eq}
                      onChange={e => updateEq(i, e.target.value)}
                      placeholder={`ecuación ${i + 1}`}
                      spellCheck={false}
                      onKeyDown={e => e.key === 'Enter' && handleSolve()}
                    />
                    {equations.length > 1 && (
                      <button className="eq-remove" onClick={() => removeEq(i)}><IconRemove /></button>
                    )}
                  </div>
                ))}
              </div>

              <div className="module-landing-actions">
                <button className="btn btn-ghost" onClick={addEq} style={{ fontSize: 13 }}>
                  <IconAdd /> Agregar
                </button>
                <button className="btn btn-ghost" onClick={randomizeGauss} style={{ fontSize: 13 }} title="Sistema aleatorio">
                  <IconDice /> Aleatorio
                </button>
                <button className="btn btn-primary btn-go" onClick={handleSolve}>
                  Resolver
                </button>
              </div>
            </div>

            <div className="module-landing-right">
              <div className="module-landing-right-label">Ejemplos</div>
              <div className="module-landing-examples">
                {GAUSS_EXAMPLES.map((ex, i) => (
                  <button className="example-pill" key={i} onClick={() => { setEquations(ex.equations); setResult(null); setError('') }}>
                    <div className="example-pill-name">{ex.name}</div>
                    <div className="example-pill-meta">{ex.equations.length} ec.</div>
                  </button>
                ))}
              </div>
              <div className="module-landing-hint">
                Formato: <span className="kbd">3x + 2y - z = 10</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="gauss-cinema">
          {/* ── Full-screen matrix ── */}
          <div className="gauss-matrix-stage">
            {step && (
              <MatrixDisplay
                matrix={step.matrixSnap}
                nVars={result.variables.length}
                highlight={highlight}
                changedCells={changedCells}
              />
            )}
          </div>

          {/* ── Floating step info top-left ── */}
          <div className="gauss-cinema-info">
            <div className="gauss-cinema-step-label">
              Paso {stepIdx + 1} / {result.steps.length}
            </div>
            {step && (
              <div className="gauss-cinema-desc">{step.description}</div>
            )}
          </div>

          {/* ── Floating solution banner ── */}
          {isFinal && finalStep?.type === StepType.Complete && finalStep.solution.length > 0 && (
            <div className="gauss-cinema-solution">
              {result.variables.map((v, i) => (
                <span key={v}>
                  <em>{v}</em> = <strong><Frac n={finalStep.solution[i] ?? 0} /></strong>
                </span>
              ))}
            </div>
          )}
          {isFinal && finalStep?.type === StepType.NoSolution && (
            <div className="gauss-cinema-solution gauss-cinema-solution--error">
              Sistema <strong>inconsistente</strong> — sin solución.
            </div>
          )}
          {isFinal && finalStep?.type === StepType.InfiniteSolutions && (
            <div className="gauss-cinema-solution">
              Sistema con <strong>variables libres</strong> — infinitas soluciones.
            </div>
          )}

          {/* ── Bottom control bar ── */}
          <div className="gauss-cinema-controls">
            <div className="gauss-cinema-controls-left">
              <button className="gauss-btn" onClick={() => setResult(null)} title="Volver al editor">
                <IconBack />
              </button>
            </div>

            <div className="gauss-cinema-controls-center">
              <button className="gauss-btn" onClick={() => { setPlaying(false); setStepIdx(0) }} title="Reiniciar"><IconReset /></button>
              <button className="gauss-btn" disabled={stepIdx === 0} onClick={() => { setPlaying(false); setStepIdx(s => Math.max(0, s - 1)) }}><IconPrev /></button>
              <button className="gauss-btn gauss-btn--play" onClick={() => { if (stepIdx >= result.steps.length - 1) setStepIdx(0); setPlaying(p => !p) }}>
                {playing ? <IconPause /> : <IconPlay />}
              </button>
              <button className="gauss-btn" disabled={stepIdx >= result.steps.length - 1} onClick={() => { setPlaying(false); setStepIdx(s => Math.min(result.steps.length - 1, s + 1)) }}><IconNext /></button>
            </div>

            <div className="gauss-cinema-controls-right">
              <div className="gauss-cinema-progress" onClick={e => {
                const r = e.currentTarget.getBoundingClientRect()
                setPlaying(false); setStepIdx(Math.round(((e.clientX - r.left) / r.width) * (result.steps.length - 1)))
              }}>
                <div className="gauss-cinema-progress-fill" style={{ width: `${result.steps.length > 1 ? (stepIdx / (result.steps.length - 1)) * 100 : 0}%` }} />
              </div>
              <button className="gauss-btn" onClick={() => setShowPanel(showPanel === 'steps' ? null : 'steps')} title="Ver pasos">
                <IconList />
              </button>
            </div>
          </div>

          {/* ── Step rail overlay ── */}
          {showPanel === 'steps' && (
            <div className="gauss-cinema-overlay" onClick={() => setShowPanel(null)}>
              <div className="gauss-cinema-side" onClick={e => e.stopPropagation()}>
                <div className="step-rail-header">Operaciones</div>
                <div className="step-rail">
                  {result.steps.map((s, i) => {
                    const state = i === stepIdx ? 'active' : i < stepIdx ? 'done' : 'future'
                    return (
                      <button key={i} className={`step-item ${state}`}
                        onClick={() => { setPlaying(false); setStepIdx(i) }}>
                        <div className="step-num">{i < stepIdx ? '✓' : i + 1}</div>
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
