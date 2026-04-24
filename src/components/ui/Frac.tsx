import { fracDisplay } from '../../engine/matrix'

interface FracProps {
  n: number
  className?: string
}

export default function Frac({ n, className }: FracProps) {
  const s = fracDisplay(n)
  const idx = s.indexOf('/')
  if (idx === -1) return <span className={className}>{s}</span>

  const num = s.slice(0, idx)
  const den = s.slice(idx + 1)

  return (
    <span className={`frac ${className ?? ''}`}>
      <span className="frac-num">{num}</span>
      <span className="frac-bar" />
      <span className="frac-den">{den}</span>
    </span>
  )
}
