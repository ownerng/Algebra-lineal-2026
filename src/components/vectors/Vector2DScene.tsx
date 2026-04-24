import { useMemo } from 'react'
import { VecOpKind } from '../../engine/types'

type V3 = [number, number, number]

interface Props {
  vecA: V3
  vecB: V3
  result: V3 | null
  op: VecOpKind
  highlightA?: boolean
  highlightB?: boolean
  highlightResult?: boolean
}

interface ArrowProps {
  ox: number; oy: number
  tx: number; ty: number
  color: string
  label?: string
  opacity?: number
  dashed?: boolean
}

function Arrow({ ox, oy, tx, ty, color, label, opacity = 1, dashed = false }: ArrowProps) {
  const dx = tx - ox
  const dy = ty - oy
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len < 3) return null

  const angle = Math.atan2(dy, dx)
  const headLen = Math.min(12, len * 0.28)
  const spread = 0.42

  const lx = tx - headLen * Math.cos(angle - spread)
  const ly = ty - headLen * Math.sin(angle - spread)
  const rx = tx - headLen * Math.cos(angle + spread)
  const ry = ty - headLen * Math.sin(angle + spread)

  const midX = (ox + tx) / 2 + 10 * Math.sin(angle)
  const midY = (oy + ty) / 2 - 10 * Math.cos(angle)

  return (
    <g opacity={opacity}>
      <line
        x1={ox} y1={oy} x2={tx} y2={ty}
        stroke={color} strokeWidth="2.2" strokeLinecap="round"
        strokeDasharray={dashed ? '5,4' : undefined}
      />
      <polygon
        points={`${tx},${ty} ${lx},${ly} ${rx},${ry}`}
        fill={color}
      />
      {label && (
        <text
          x={midX} y={midY}
          fontSize="14" fontFamily="Georgia, serif" fontStyle="italic"
          fill={color} textAnchor="middle" dominantBaseline="middle"
          style={{ filter: 'drop-shadow(0 0 3px #0E0E0F)' }}
        >
          {label}
        </text>
      )}
    </g>
  )
}

export default function Vector2DScene({
  vecA, vecB, result, op,
  highlightA = true, highlightB = true, highlightResult = false,
}: Props) {
  const W = 400
  const H = 400
  const cx = W / 2
  const cy = H / 2
  const PAD = 44

  const showB = vecB.some(v => v !== 0) && op !== VecOpKind.Scale && op !== VecOpKind.Normalize

  const { scale, ticks } = useMemo(() => {
    const pts: [number, number][] = [
      [vecA[0], vecA[1]],
      showB ? [vecB[0], vecB[1]] : [0, 0],
      result ? [result[0], result[1]] : [0, 0],
    ]
    const maxMag = Math.max(1, ...pts.map(([x, y]) => Math.sqrt(x * x + y * y)))

    const rawScale = (W / 2 - PAD) / maxMag
    const niceUnit = rawScale > 60 ? 1 : rawScale > 30 ? 2 : rawScale > 15 ? 5 : 10
    const finalScale = (W / 2 - PAD) / (Math.ceil(maxMag / niceUnit) * niceUnit)

    const axisRange = Math.ceil((W / 2 - PAD) / finalScale)
    const tickVals: number[] = []
    for (let i = -axisRange; i <= axisRange; i++) {
      if (i !== 0 && i % niceUnit === 0) tickVals.push(i)
    }

    return { scale: finalScale, ticks: tickVals }
  }, [vecA, vecB, result, showB])

  const svgX = (x: number) => cx + x * scale
  const svgY = (y: number) => cy - y * scale

  const colorA = highlightA ? '#5B8AF0' : '#3A5FAD'
  const colorB = highlightB ? '#3DAA72' : '#2A7A52'
  const colorR = '#D4884A'

  const origin: [number, number] = [cx, cy]
  const pA: [number, number] = [svgX(vecA[0]), svgY(vecA[1])]
  const pB: [number, number] = [svgX(vecB[0]), svgY(vecB[1])]
  const pR: [number, number] | null = result ? [svgX(result[0]), svgY(result[1])] : null

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: '100%', background: '#0E0E0F', borderRadius: 8, display: 'block' }}
    >
      {/* Grid lines */}
      {ticks.map(t => (
        <g key={t}>
          <line x1={svgX(t)} y1={0} x2={svgX(t)} y2={H} stroke="#1E1E28" strokeWidth="1" />
          <line x1={0} y1={svgY(t)} x2={W} y2={svgY(t)} stroke="#1E1E28" strokeWidth="1" />
        </g>
      ))}

      {/* Axes */}
      <line x1={0} y1={cy} x2={W} y2={cy} stroke="#3A3A4C" strokeWidth="1.5" />
      <line x1={cx} y1={0} x2={cx} y2={H} stroke="#3A3A4C" strokeWidth="1.5" />

      {/* Tick marks + labels */}
      {ticks.map(t => (
        <g key={t}>
          <line x1={svgX(t)} y1={cy - 4} x2={svgX(t)} y2={cy + 4} stroke="#3A3A4C" strokeWidth="1" />
          <line x1={cx - 4} y1={svgY(t)} x2={cx + 4} y2={svgY(t)} stroke="#3A3A4C" strokeWidth="1" />
          {Math.abs(svgX(t) - cx) > 8 && (
            <text x={svgX(t)} y={cy + 14} fontSize="9" fill="#4A4A5A" textAnchor="middle">{t}</text>
          )}
          {Math.abs(svgY(t) - cy) > 8 && (
            <text x={cx - 8} y={svgY(t)} fontSize="9" fill="#4A4A5A" textAnchor="end" dominantBaseline="middle">{t}</text>
          )}
        </g>
      ))}

      {/* Axis labels */}
      <text x={W - 10} y={cy + 16} fontSize="13" fill="#6B6B7A" fontFamily="Georgia, serif" fontStyle="italic" textAnchor="end">x</text>
      <text x={cx + 8} y={10} fontSize="13" fill="#6B6B7A" fontFamily="Georgia, serif" fontStyle="italic">y</text>

      {/* Parallelogram for Add */}
      {op === VecOpKind.Add && pR && highlightResult && (
        <polygon
          points={`${origin[0]},${origin[1]} ${pA[0]},${pA[1]} ${pR[0]},${pR[1]} ${pB[0]},${pB[1]}`}
          fill="none" stroke="#333345" strokeWidth="1" strokeDasharray="5,4"
        />
      )}

      {/* Ghost of A from tip of B for Add/Sub */}
      {(op === VecOpKind.Add || op === VecOpKind.Sub) && pR && highlightResult && (
        <Arrow
          ox={pB[0]} oy={pB[1]}
          tx={pB[0] + (pA[0] - origin[0])} ty={pB[1] + (pA[1] - origin[1])}
          color={colorA} opacity={0.28} dashed
        />
      )}

      {/* Vector A */}
      {vecA.some(v => v !== 0) && (
        <Arrow ox={origin[0]} oy={origin[1]} tx={pA[0]} ty={pA[1]}
          color={colorA} label="a" opacity={highlightA ? 1 : 0.5} />
      )}

      {/* Vector B */}
      {showB && (
        <Arrow ox={origin[0]} oy={origin[1]} tx={pB[0]} ty={pB[1]}
          color={colorB} label="b" opacity={highlightB ? 1 : 0.5} />
      )}

      {/* Result */}
      {pR && highlightResult && (
        <Arrow ox={origin[0]} oy={origin[1]} tx={pR[0]} ty={pR[1]} color={colorR} label="r" />
      )}

      {/* Origin dot */}
      <circle cx={cx} cy={cy} r="3.5" fill="#5A5A6A" />

      {/* Z-component warning if non-zero */}
      {vecA[2] !== 0 && (
        <text x={W / 2} y={H - 8} fontSize="10" fill="#555568" textAnchor="middle">
          z ignorada en vista 2D
        </text>
      )}
    </svg>
  )
}
