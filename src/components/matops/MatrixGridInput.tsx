import { useState, useRef, useEffect } from 'react'
import { fracDisplay } from '../../engine/matrix'

function parseVal(s: string): number {
  const t = s.trim()
  if (!t) return 0
  if (t.includes('/')) {
    const neg = t.startsWith('-')
    const clean = neg ? t.slice(1) : t
    const parts = clean.split('/')
    if (parts.length === 2) {
      const num = parseFloat(parts[0])
      const den = parseFloat(parts[1])
      if (!isNaN(num) && !isNaN(den) && den !== 0) return neg ? -(num / den) : num / den
    }
  }
  return parseFloat(t) || 0
}

function displayVal(n: number): string {
  return fracDisplay(n)
}

interface CellProps {
  value: number
  onChange: (val: string) => void
}

function Cell({ value, onChange }: CellProps) {
  const [editing, setEditing] = useState(false)
  const [raw, setRaw] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!editing) return
    setRaw(displayVal(value))
    ref.current?.focus()
    ref.current?.select()
  }, [editing])

  const commit = () => {
    onChange(raw)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={ref}
        type="text"
        value={raw}
        onChange={e => setRaw(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
        className="input mat-cell-input"
      />
    )
  }

  return (
    <button
      className="mat-cell-display"
      onClick={() => setEditing(true)}
    >
      {displayVal(value)}
    </button>
  )
}

interface Props {
  label: string
  size: number
  values: number[][]
  onChange: (values: number[][]) => void
}

export default function MatrixGridInput({ label, values, onChange }: Props) {
  const update = (r: number, c: number, val: string) => {
    const next = values.map(row => [...row])
    next[r][c] = parseVal(val)
    onChange(next)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--ink)' }}>
        Matriz <strong style={{ fontWeight: 600 }}>{label}</strong>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-faint)', marginLeft: 8 }}>
          {values.length}×{values[0]?.length ?? 0}
        </span>
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {values.map((row, r) => (
          <div key={r} style={{ display: 'flex', gap: 6 }}>
            {row.map((val, c) => (
              <Cell key={c} value={val} onChange={v => update(r, c, v)} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
