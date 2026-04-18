import { useState, useEffect, useRef, useCallback } from 'react'
import { VecOpKind, type VecStep } from '../../engine/types'
import { computeVectorOp } from '../../engine/vectors'
import { VECTOR_EXAMPLES } from '../../engine/examples'
import Vector3DScene from './Vector3DScene'
import VectorSteps from './VectorSteps'

type V3 = [number, number, number]

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

function VecInput({ label, value, onChange }: { label: string; value: V3; onChange: (v: V3) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--ink)' }}>
        Vector <strong style={{ fontWeight: 600 }}>{label}</strong>
      </span>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        {(['x', 'y', 'z'] as const).map((axis, i) => (
          <div key={axis} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <span style={{ fontSize: 11, color: 'var(--ink-faint)', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>{axis}</span>
            <input
              type="number"
              value={value[i]}
              onChange={e => { const n = [...value] as V3; n[i] = parseFloat(e.target.value) || 0; onChange(n) }}
              className="input"
              style={{ textAlign: 'center', padding: '8px 4px', fontSize: 14 }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function VectorsPage() {
  const [vecA, setVecA]     = useState<V3>([1, 2, 0])
  const [vecB, setVecB]     = useState<V3>([3, -1, 0])
  const [scalar, setScalar] = useState(2)
  const [op, setOp]         = useState<VecOpKind>(VecOpKind.Add)
  const [steps, setSteps]   = useState<VecStep[]>([])
  const [result, setResult] = useState<V3 | null>(null)
  const [stepIdx, setStepIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed]   = useState(1200)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const meta = OP_LABELS.find(o => o.id === op)!

  const compute = useCallback(() => {
    const { steps: s, result: r } = computeVectorOp(vecA, vecB, op, scalar)
    setSteps(s); setResult(r); setStepIdx(0); setPlaying(true)
  }, [vecA, vecB, op, scalar])

  useEffect(() => {
    if (!playing) return
    if (stepIdx >= steps.length - 1) { setPlaying(false); return }
    timerRef.current = setTimeout(() => setStepIdx(i => i + 1), speed)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [playing, stepIdx, steps.length, speed])

  const step = steps[stepIdx]

  return (
    <div className="content">
      <div className="module-intro">
        <div className="module-intro-text">
          <div className="module-eyebrow">Módulo · Operaciones Vectoriales</div>
          <h1 className="module-title">Vectores en el espacio</h1>
          <p className="module-desc">
            Suma, resta, producto punto y cruz, norma y ángulo — con visualización 3D interactiva y explicaciones paso a paso.
          </p>
        </div>
      </div>

      {/* Full-width split: controls | 3D scene */}
      <div className="stage split">
        {/* LEFT — controls */}
        <div className="stage-panel" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <h3 className="stage-panel-h">Operación</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 10 }}>
              {OP_LABELS.map(o => (
                <button
                  key={o.id}
                  className="example-card"
                  style={{
                    background: op === o.id ? 'var(--sage-tint)' : 'var(--bg)',
                    borderColor: op === o.id ? 'oklch(0.48 0.045 145 / 0.35)' : 'var(--rule)',
                  }}
                  onClick={() => { setOp(o.id); setSteps([]); setResult(null) }}
                >
                  <div className="example-name">{o.label}</div>
                  <div className="example-meta">{o.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <VecInput label="a" value={vecA} onChange={setVecA} />

          {meta.needsB && <VecInput label="b" value={vecB} onChange={setVecB} />}

          {meta.needsScalar && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--ink)' }}>
                Escalar <strong>k</strong>
              </span>
              <input className="input" type="number" value={scalar} onChange={e => setScalar(parseFloat(e.target.value) || 0)} style={{ width: 100 }} />
            </div>
          )}

          <button className="btn btn-primary" onClick={compute}>
            Animar operación
          </button>

          <div className="divider" />

          <div className="sidebar-label" style={{ padding: 0, marginBottom: 6 }}>Ejemplos</div>
          {VECTOR_EXAMPLES.map(ex => (
            <button
              key={ex.name}
              className="example-card"
              onClick={() => { setVecA(ex.a); setVecB(ex.b); setSteps([]); setResult(null) }}
            >
              <div className="example-name">{ex.name}</div>
            </button>
          ))}
        </div>

        {/* RIGHT — 3D scene + steps */}
        <div className="stage-panel" style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 520 }}>
          <div>
            <h3 className="stage-panel-h">Visualización — {meta.label}</h3>
            <p className="stage-panel-desc">Representación 3D interactiva. Arrastra para rotar, scroll para zoom.</p>
          </div>

          <div style={{ flex: 1, minHeight: 300, borderRadius: 'var(--r-md)', overflow: 'hidden', background: 'var(--bg-sunken)', border: '1px solid var(--rule-soft)' }}>
            <Vector3DScene
              vecA={vecA}
              vecB={meta.needsB ? vecB : [0, 0, 0]}
              result={step?.resultVec ?? result}
              op={op}
              highlightA={step?.highlightA ?? true}
              highlightB={step?.highlightB ?? true}
              highlightResult={step?.highlightResult ?? false}
            />
          </div>

          {steps.length > 0 && (
            <>
              {step && (
                <div className="steplog">
                  <div className="steplog-eyebrow">Paso {stepIdx + 1} de {steps.length}</div>
                  <div>{step.description}</div>
                </div>
              )}

              <div className="player">
                <button className="btn btn-icon btn-ghost" onClick={() => { setPlaying(false); setStepIdx(0) }}><IconReset /></button>
                <button className="btn btn-icon btn-ghost" disabled={stepIdx === 0} onClick={() => { setPlaying(false); setStepIdx(i => Math.max(0, i - 1)) }}><IconPrev /></button>
                <button className="btn btn-icon btn-primary" onClick={() => { if (stepIdx >= steps.length - 1) setStepIdx(0); setPlaying(p => !p) }}>
                  {playing ? <IconPause /> : <IconPlay />}
                </button>
                <button className="btn btn-icon btn-ghost" disabled={stepIdx >= steps.length - 1} onClick={() => { setPlaying(false); setStepIdx(i => Math.min(steps.length - 1, i + 1)) }}><IconNext /></button>
                <div className="player-track" onClick={e => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const ratio = (e.clientX - rect.left) / rect.width
                  setPlaying(false); setStepIdx(Math.round(ratio * (steps.length - 1)))
                }}>
                  <div className="player-fill" style={{ width: `${steps.length > 1 ? (stepIdx / (steps.length - 1)) * 100 : 0}%` }} />
                </div>
                <div className="player-step">{stepIdx + 1} / {steps.length}</div>
              </div>
            </>
          )}

          {!steps.length && (
            <div style={{ flex: 1, display: 'grid', placeItems: 'center', textAlign: 'center', color: 'var(--ink-faint)' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15 }}>
                Configure los vectores y presione <span className="kbd">Animar operación</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
