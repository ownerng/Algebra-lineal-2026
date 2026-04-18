interface Props {
  label: string
  size: number
  values: number[][]
  onChange: (values: number[][]) => void
}

export default function MatrixGridInput({ label, values, onChange }: Props) {
  const update = (r: number, c: number, val: string) => {
    const next = values.map(row => [...row])
    next[r][c] = parseFloat(val) || 0
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
              <input
                key={c}
                type="number"
                value={val}
                onChange={e => update(r, c, e.target.value)}
                className="input"
                style={{ width: 56, height: 40, textAlign: 'center', padding: '6px 4px', fontSize: 14 }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
