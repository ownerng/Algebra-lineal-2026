import { useState, useEffect, useRef, useCallback } from 'react'
import { VecOpKind, type VecStep } from '../../engine/types'
import { computeVectorOp } from '../../engine/vectors'
import { VECTOR_EXAMPLES } from '../../engine/examples'
import Vector3DScene from './Vector3DScene'
import Vector2DScene from './Vector2DScene'
import VectorSteps from './VectorSteps'

type V3 = [number, number, number]
type ViewMode = '2d' | '3d'

const OP_LABELS: { id: VecOpKind; label: string; sub: string; needsB: boolean; needsScalar: boolean }[] = [
  { id: VecOpKind.Add,       label: 'Suma',           sub: 'a + b',    needsB: true,  needsScalar: false },
  { id: VecOpKind.Sub,       label: 'Resta',          sub: 'a − b',    needsB: true,  needsScalar: false },
  { id: VecOpKind.Scale,     label: 'Escalar',        sub: 'k · a',    needsB: false, needsScalar: true  },
  { id: VecOpKind.Dot,       label: 'Producto punto', sub: 'a · b',    needsB: true,  needsScalar: false },
  { id: VecOpKind.Cross,     label: 'Producto cruz',  sub: 'a × b',    needsB: true,  needsScalar: false },
  { id: VecOpKind.Normalize, label: 'Normalizar',     sub: 'â',        needsB: false, needsScalar: false },
]

const IconPlay  = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 2 L11 7 L3 12 Z"/></svg>
const IconPause = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="3" y="2" width="3" height="10" rx="0.5"/><rect x="8" y="2" width="3" height="10" rx="0.5"/></svg>
const IconPrev  = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M11 2 L5 7 L11 12 Z"/><rect x="3" y="2" width="1.5" height="10"/></svg>
const IconNext  = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 2 L9 7 L3 12 Z"/><rect x="9.5" y="2" width="1.5" height="10"/></svg>
const IconReset = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M2.5 7 a4.5 4.5 0 1 0 1.5-3.4"/><polyline points="2,2 2,4.5 4.5,4.5"/></svg>
const IconBack  = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="12" y1="7" x2="3" y2="7"/><polyline points="6,4 3,7 6,10"/></svg>
const IconList  = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><line x1="4" y1="3.5" x2="12" y2="3.5"/><line x1="4" y1="7" x2="12" y2="7"/><line x1="4" y1="10.5" x2="12" y2="10.5"/><circle cx="2" cy="3.5" r="0.7" fill="currentColor"/><circle cx="2" cy="7" r="0.7" fill="currentColor"/><circle cx="2" cy="10.5" r="0.7" fill="currentColor"/></svg>

function VecInput({ label, value, onChange }: { label: string; value: V3; onChange: (v: V3) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink)' }}>
        Vector <strong style={{ fontWeight: 600 }}>{label}</strong>
      </span>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        {(['x', 'y', 'z'] as const).map((axis, i) => (
          <div key={axis} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <span style={{ fontSize: 11, color: 'var(--ink-faint)', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>{axis}</span>
            <input
              type="number" value={value[i]} className="input"
              onChange={e => { const n = [...value] as V3; n[i] = parseFloat(e.target.value) || 0; onChange(n) }}
              style={{ textAlign: 'center', padding: '7px 4px', fontSize: 14 }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function VectorsPage() {
  const [vecA, setVecA]       = useState<V3>([1, 2, 0])
  const [vecB, setVecB]       = useState<V3>([3, -1, 0])
  const [scalar, setScalar]   = useState(2)
  const [op, setOp]           = useState<VecOpKind>(VecOpKind.Add)
  const [steps, setSteps]     = useState<VecStep[]>([])
  const [result, setResult]   = useState<V3 | null>(null)
  const [stepIdx, setStepIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [view, setView]       = useState<ViewMode>('3d')
  const [showPanel, setShowPanel] = useState(false)
  const timerRef              = useRef<ReturnType<typeof setTimeout> | null>(null)

  const meta = OP_LABELS.find(o => o.id === op)!

  const compute = useCallback(() => {
    const { steps: s, result: r } = computeVectorOp(vecA, vecB, op, scalar)
    setSteps(s); setResult(r); setStepIdx(0); setPlaying(true)
  }, [vecA, vecB, op, scalar])

  useEffect(() => {
    if (!playing) return
    if (stepIdx >= steps.length - 1) { setPlaying(false); return }
    timerRef.current = setTimeout(() => setStepIdx(i => i + 1), 1200)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [playing, stepIdx, steps.length])

  const step = steps[stepIdx]
  const sceneProps = {
    vecA,
    vecB: meta.needsB ? vecB : [0, 0, 0] as V3,
    result: step?.resultVec ?? result,
    op,
    highlightA:      step?.highlightA      ?? true,
    highlightB:      step?.highlightB      ?? true,
    highlightResult: step?.highlightResult ?? false,
  }

  const hasAnim = steps.length > 0

  return (
    <div className={`vectors-page ${hasAnim ? 'vectors-page--presenting' : ''}`}>

      {!hasAnim ? (
        <div className="gauss-input-view">
          <div className="gauss-input-card">
            <div className="gauss-input-header">
              <div>
                <div className="module-eyebrow">Módulo · Operaciones Vectoriales</div>
                <h1 className="module-title">Vectores en el espacio</h1>
                <p className="module-desc">
                  Suma, resta, producto punto y cruz, norma y ángulo — visualización animada en 2D y 3D.
                </p>
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <h3 className="stage-panel-h">Operación</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 10 }}>
                {OP_LABELS.map(o => (
                  <button key={o.id} className="example-card"
                    style={{ background: op === o.id ? 'var(--sage-tint)' : 'var(--bg)', borderColor: op === o.id ? 'oklch(0.48 0.045 145 / 0.35)' : 'var(--rule)' }}
                    onClick={() => { setOp(o.id); setSteps([]); setResult(null) }}>
                    <div className="example-name">{o.label}</div>
                    <div className="example-meta">{o.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <VecInput label="a" value={vecA} onChange={setVecA} />
              {meta.needsB && <div style={{ marginTop: 14 }}><VecInput label="b" value={vecB} onChange={setVecB} /></div>}

              {meta.needsScalar && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 14 }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink)' }}>
                    Escalar <strong>k</strong>
                  </span>
                  <input className="input" type="number" value={scalar}
                    onChange={e => setScalar(parseFloat(e.target.value) || 0)}
                    style={{ width: 90 }} />
                </div>
              )}
            </div>

            <button className="btn btn-primary" style={{ width: '100%', marginTop: 18, padding: '10px 28px', fontSize: 14 }} onClick={compute}>
              Animar operación
            </button>

            <div className="divider" />
            <div className="sidebar-label" style={{ padding: 0, marginBottom: 4 }}>Ejemplos</div>
            <div className="examples">
              {VECTOR_EXAMPLES.map(ex => (
                <button key={ex.name} className="example-card"
                  onClick={() => { setVecA(ex.a); setVecB(ex.b); setSteps([]); setResult(null) }}>
                  <div className="example-name">{ex.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="gauss-cinema">
          {/* ── Full-screen vector scene ── */}
          <div className="gauss-matrix-stage">
            <div className="cinema-vector-scene">
              {view === '3d' ? <Vector3DScene {...sceneProps} /> : <Vector2DScene {...sceneProps} />}
            </div>
          </div>

          {/* ── 2D/3D toggle floating top-right ── */}
          <div className="vectors-view-toggle">
            <button className={`gauss-btn${view === '2d' ? ' gauss-btn--active' : ''}`}
              onClick={() => setView('2d')} title="Vista 2D">
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>2D</span>
            </button>
            <button className={`gauss-btn${view === '3d' ? ' gauss-btn--active' : ''}`}
              onClick={() => setView('3d')} title="Vista 3D">
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>3D</span>
            </button>
          </div>

          {/* ── Floating step info top-left ── */}
          <div className="gauss-cinema-info">
            <div className="gauss-cinema-step-label">
              Paso {stepIdx + 1} / {steps.length}
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

          {/* ── Bottom control bar ── */}
          <div className="gauss-cinema-controls">
            <div className="gauss-cinema-controls-left">
              <button className="gauss-btn" onClick={() => { setSteps([]); setResult(null); setPlaying(false) }} title="Volver al editor">
                <IconBack />
              </button>
            </div>

            <div className="gauss-cinema-controls-center">
              <button className="gauss-btn" onClick={() => { setPlaying(false); setStepIdx(0) }} title="Reiniciar"><IconReset /></button>
              <button className="gauss-btn" disabled={stepIdx === 0} onClick={() => { setPlaying(false); setStepIdx(i => Math.max(0, i - 1)) }}><IconPrev /></button>
              <button className="gauss-btn gauss-btn--play" onClick={() => { if (stepIdx >= steps.length - 1) setStepIdx(0); setPlaying(p => !p) }}>
                {playing ? <IconPause /> : <IconPlay />}
              </button>
              <button className="gauss-btn" disabled={stepIdx >= steps.length - 1} onClick={() => { setPlaying(false); setStepIdx(i => Math.min(steps.length - 1, i + 1)) }}><IconNext /></button>
            </div>

            <div className="gauss-cinema-controls-right">
              <div className="gauss-cinema-progress" onClick={e => {
                const r = e.currentTarget.getBoundingClientRect()
                setPlaying(false); setStepIdx(Math.round(((e.clientX - r.left) / r.width) * (steps.length - 1)))
              }}>
                <div className="gauss-cinema-progress-fill" style={{ width: `${steps.length > 1 ? (stepIdx / (steps.length - 1)) * 100 : 0}%` }} />
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
                <VectorSteps
                  steps={steps}
                  currentIndex={stepIdx}
                  onJump={i => { setPlaying(false); setStepIdx(i) }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
