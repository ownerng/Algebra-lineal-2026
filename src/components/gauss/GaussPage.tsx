import { useState, useEffect, useRef, useMemo } from 'react'
import { parse } from '../../engine/parser'
import { solve } from '../../engine/gauss'
import { StepType, type Step } from '../../engine/types'
import { fracDisplay } from '../../engine/matrix'
import { GAUSS_EXAMPLES } from '../../engine/examples'

/* ── Icons ────────────────────────────────────────────────────────────────── */
const IconPlay   = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 2 L11 7 L3 12 Z"/></svg>
const IconPause  = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="3" y="2" width="3" height="10" rx="0.5"/><rect x="8" y="2" width="3" height="10" rx="0.5"/></svg>
const IconPrev   = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M11 2 L5 7 L11 12 Z"/><rect x="3" y="2" width="1.5" height="10"/></svg>
const IconNext   = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 2 L9 7 L3 12 Z"/><rect x="9.5" y="2" width="1.5" height="10"/></svg>
const IconReset  = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M2.5 7 a4.5 4.5 0 1 0 1.5-3.4"/><polyline points="2,2 2,4.5 4.5,4.5"/></svg>
const IconAdd    = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="7" y1="3" x2="7" y2="11"/><line x1="3" y1="7" x2="11" y2="7"/></svg>
const IconRemove = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="3" y1="7" x2="11" y2="7"/></svg>

/* ── Highlight mapping ────────────────────────────────────────────────────── */
interface Highlight {
  pivotRow?: number
  pivotCol?: number
  targetRow?: number
  sourceRow?: number
  rows?: number[]
}

function getHighlight(step: Step): Highlight {
  switch (step.type) {
    case StepType.HighlightPivot:
      return { pivotRow: step.pivotRow, pivotCol: step.pivotRow }
    case StepType.SwapRows:
      return { rows: [step.swapRow1, step.swapRow2] }
    case StepType.HighlightTarget:
      return { pivotRow: step.pivotRow, pivotCol: step.pivotRow, targetRow: step.targetRow }
    case StepType.EliminateRow:
    case StepType.MarkZero:
      return { sourceRow: step.pivotRow, pivotCol: step.pivotRow, targetRow: step.targetRow }
    case StepType.BackSubstitute:
      return { sourceRow: step.pivotRow, pivotCol: step.pivotRow }
    case StepType.Complete:
      return {}
    default:
      return {}
  }
}

/* ── Matrix cell classifier ───────────────────────────────────────────────── */
function cellClass(hl: Highlight, row: number, col: number, nVars: number, isAug: boolean): string {
  const cls: string[] = ['matrix-cell']
  if (isAug) cls.push('augment-divider')

  const { pivotRow, pivotCol, targetRow, sourceRow, rows } = hl
  if (pivotRow !== undefined && pivotCol !== undefined && row === pivotRow && col === pivotCol) {
    cls.push('hl-pivot')
  } else if (targetRow !== undefined && pivotCol !== undefined && row === targetRow && col === pivotCol) {
    cls.push('hl-target')
  } else if (sourceRow !== undefined && pivotCol !== undefined && row === sourceRow && col === pivotCol) {
    cls.push('hl-source')
  } else if (rows !== undefined && rows.includes(row)) {
    cls.push('hl-row')
  } else if (targetRow !== undefined && row === targetRow) {
    cls.push('hl-target')
  } else if (sourceRow !== undefined && row === sourceRow) {
    cls.push('hl-source')
  } else if (pivotRow !== undefined && row === pivotRow) {
    cls.push('hl-row')
  }
  return cls.join(' ')
}

/* ── MatrixDisplay ────────────────────────────────────────────────────────── */
interface MatrixDisplayProps {
  matrix: number[][]
  nVars: number
  highlight: Highlight
  changedCells: Set<string>
}

function MatrixDisplay({ matrix, nVars, highlight, changedCells }: MatrixDisplayProps) {
  if (!matrix || matrix.length === 0) return null
  const ncols = matrix[0].length
  return (
    <div className="matrix-wrap">
      <div className="matrix-paren left" />
      <div className="matrix" style={{ gridTemplateColumns: `repeat(${ncols}, auto)` }}>
        {matrix.map((row, i) =>
          row.map((val, j) => {
            const isAug = j === nVars
            const cls = cellClass(highlight, i, j, nVars, isAug)
            const changed = changedCells.has(`${i}-${j}`)
            return (
              <div
                key={`${i}-${j}-${val}`}
                className={changed ? cls + ' changed' : cls}
              >
                {fracDisplay(val)}
              </div>
            )
          })
        )}
      </div>
      <div className="matrix-paren right" />
    </div>
  )
}

/* ── Player ───────────────────────────────────────────────────────────────── */
interface PlayerProps {
  step: number
  total: number
  playing: boolean
  onPlay: () => void
  onPause: () => void
  onPrev: () => void
  onNext: () => void
  onReset: () => void
  onJump: (i: number) => void
}

function Player({ step, total, playing, onPlay, onPause, onPrev, onNext, onReset, onJump }: PlayerProps) {
  const pct = total > 1 ? (step / (total - 1)) * 100 : 0
  return (
    <div className="player">
      <button className="btn btn-icon btn-ghost" onClick={onReset} title="Reiniciar"><IconReset /></button>
      <button className="btn btn-icon btn-ghost" onClick={onPrev} disabled={step === 0} title="Anterior"><IconPrev /></button>
      <button className="btn btn-icon btn-primary" onClick={playing ? onPause : onPlay}>
        {playing ? <IconPause /> : <IconPlay />}
      </button>
      <button className="btn btn-icon btn-ghost" onClick={onNext} disabled={step >= total - 1} title="Siguiente"><IconNext /></button>
      <div
        className="player-track"
        onClick={e => {
          const rect = e.currentTarget.getBoundingClientRect()
          const ratio = (e.clientX - rect.left) / rect.width
          onJump(Math.max(0, Math.min(total - 1, Math.round(ratio * (total - 1)))))
        }}
      >
        <div className="player-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="player-step">{step + 1} / {total}</div>
    </div>
  )
}

/* ── GaussPage ────────────────────────────────────────────────────────────── */
const DEFAULTS = ['2x + y - z = 8', '-3x - y + 2z = -11', '-2x + y + 2z = -3']

export default function GaussPage() {
  const [equations, setEquations] = useState<string[]>(DEFAULTS)
  const [result, setResult]       = useState<{ steps: Step[]; variables: string[] } | null>(null)
  const [stepIdx, setStepIdx]     = useState(0)
  const [playing, setPlaying]     = useState(false)
  const [error, setError]         = useState('')
  const timerRef                  = useRef<ReturnType<typeof setTimeout> | null>(null)

  const addEq    = () => setEquations(prev => [...prev, ''])
  const removeEq = (i: number) => setEquations(prev => prev.filter((_, idx) => idx !== i))
  const updateEq = (i: number, v: string) => {
    setEquations(prev => { const n = [...prev]; n[i] = v; return n })
    setResult(null)
  }

  const handleSolve = () => {
    setError('')
    try {
      const filtered = equations.map(e => e.trim()).filter(Boolean)
      if (!filtered.length) throw new Error('Agrega al menos una ecuación')
      const parsed = parse(filtered)
      const steps  = solve(parsed.matrix, parsed.variables)
      setResult({ steps, variables: parsed.variables })
      setStepIdx(0)
      setPlaying(true)
    } catch (e) {
      setError((e as Error).message)
      setResult(null)
    }
  }

  const loadExample = (eqs: string[]) => {
    setEquations(eqs)
    setResult(null)
    setError('')
  }

  // auto-play
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

  const isFinal = result && stepIdx === result.steps.length - 1
  const finalStep = isFinal ? result!.steps[result!.steps.length - 1] : null

  return (
    <div className="content">
      {/* Module intro */}
      <div className="module-intro">
        <div className="module-intro-text">
          <div className="module-eyebrow">Módulo · Sistemas Lineales</div>
          <h1 className="module-title">Método de Gauss-Jordan</h1>
          <p className="module-desc">
            Ingrese un sistema de ecuaciones lineales y proyecte en clase la reducción paso a paso. Cada operación elemental se anima con resaltado de fila, columna y pivote.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <span className="chip">Animado</span>
          <span className="chip amber">Pivote</span>
          <span className="chip terra">Eliminación</span>
        </div>
      </div>

      {/* Stage */}
      <div className="stage split">
        {/* LEFT — input */}
        <div className="stage-panel">
          <h3 className="stage-panel-h">Sistema de ecuaciones</h3>
          <p className="stage-panel-desc">
            Formato: <span className="kbd">3x + 2y - z = 10</span>
          </p>

          {error && <div className="error-banner">{error}</div>}

          <div className="eq-list">
            {equations.map((eq, i) => (
              <div className="eq-row" key={i}>
                <div className="eq-num">{i + 1}.</div>
                <input
                  className="eq-input"
                  value={eq}
                  onChange={e => updateEq(i, e.target.value)}
                  placeholder={`ecuación ${i + 1}`}
                  spellCheck={false}
                  onKeyDown={e => e.key === 'Enter' && handleSolve()}
                />
                {equations.length > 1 && (
                  <button className="eq-remove" onClick={() => removeEq(i)} title="Quitar">
                    <IconRemove />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn btn-ghost" onClick={addEq} style={{ fontSize: 13 }}>
              <IconAdd /> Agregar ecuación
            </button>
            <button className="btn btn-primary" onClick={handleSolve} style={{ marginLeft: 'auto' }}>
              Resolver y animar
            </button>
          </div>

          <div className="divider" />

          <div className="sidebar-label" style={{ padding: 0, marginBottom: 8 }}>Ejemplos preparados</div>
          <div className="examples">
            {GAUSS_EXAMPLES.map((ex, i) => (
              <button className="example-card" key={i} onClick={() => loadExample(ex.equations)}>
                <div className="example-name">{ex.name}</div>
                <div className="example-meta">{ex.equations.length} ecuaciones</div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT — animation stage */}
        <div className="stage-panel" style={{ display: 'flex', flexDirection: 'column', gap: 18, minHeight: 520 }}>
          {!result ? (
            <div style={{ flex: 1, display: 'grid', placeItems: 'center', textAlign: 'center', color: 'var(--ink-faint)' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontStyle: 'italic', marginBottom: 10, color: 'var(--ink-soft)' }}>
                  Listo para proyectar
                </div>
                <div style={{ fontSize: 13.5, maxWidth: 320, margin: '0 auto', lineHeight: 1.5 }}>
                  Edite las ecuaciones y presione <span className="kbd">Resolver y animar</span>.
                </div>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h3 className="stage-panel-h">Matriz aumentada</h3>
                <p className="stage-panel-desc">
                  Variables:{' '}
                  <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                    {result.variables.join(', ')}
                  </span>
                </p>
              </div>

              <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '20px 0', overflow: 'auto' }}>
                {step && (
                  <MatrixDisplay
                    matrix={step.matrixSnap}
                    nVars={result.variables.length}
                    highlight={highlight}
                    changedCells={changedCells}
                  />
                )}
              </div>

              {/* Step log */}
              {step && (
                <div className="steplog">
                  <div className="steplog-eyebrow">Operación elemental</div>
                  <div>{step.description}</div>
                </div>
              )}

              <Player
                step={stepIdx}
                total={result.steps.length}
                playing={playing}
                onPlay={() => {
                  if (stepIdx >= result.steps.length - 1) setStepIdx(0)
                  setPlaying(true)
                }}
                onPause={() => setPlaying(false)}
                onPrev={() => { setPlaying(false); setStepIdx(Math.max(0, stepIdx - 1)) }}
                onNext={() => { setPlaying(false); setStepIdx(Math.min(result.steps.length - 1, stepIdx + 1)) }}
                onReset={() => { setPlaying(false); setStepIdx(0) }}
                onJump={i => { setPlaying(false); setStepIdx(i) }}
              />

              {/* Solution */}
              {isFinal && finalStep && finalStep.type === StepType.Complete && finalStep.solution.length > 0 && (
                <div style={{
                  background: 'var(--sage-tint)',
                  border: '1px solid oklch(0.48 0.045 145 / 0.25)',
                  borderRadius: 'var(--r-md)',
                  padding: '16px 20px',
                }}>
                  <div className="steplog-eyebrow" style={{ color: 'var(--sage-deep)' }}>Solución</div>
                  <div className="solution">
                    {result.variables.map((v, i) => (
                      <div className="solution-line" key={v}>
                        <span className="solution-var">{v}</span>
                        <span className="solution-eq">=</span>
                        <span className="solution-val">{fracDisplay(finalStep.solution[i] ?? 0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isFinal && finalStep && finalStep.type === StepType.NoSolution && (
                <div style={{ background: 'var(--terra-soft)', border: '1px solid oklch(0.55 0.12 35 / 0.3)', borderRadius: 'var(--r-md)', padding: '14px 18px' }}>
                  <div className="steplog-eyebrow" style={{ color: 'var(--terra)' }}>Sin solución</div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>Sistema <strong>inconsistente</strong> — no admite solución.</div>
                </div>
              )}

              {isFinal && finalStep && finalStep.type === StepType.InfiniteSolutions && (
                <div style={{ background: 'var(--sage-tint)', border: '1px solid oklch(0.48 0.045 145 / 0.25)', borderRadius: 'var(--r-md)', padding: '14px 18px' }}>
                  <div className="steplog-eyebrow" style={{ color: 'var(--sage-deep)' }}>Infinitas soluciones</div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>Sistema con <strong>variables libres</strong>.</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
