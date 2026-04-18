import { VecOpKind, type VecStep } from './types'

type V3 = [number, number, number]

const fmt = (n: number) => {
  const r = Math.round(n * 10000) / 10000
  return r === Math.round(r) ? String(Math.round(r)) : r.toFixed(4).replace(/\.?0+$/, '')
}

const fmtV = (v: V3) => `(${fmt(v[0])}, ${fmt(v[1])}, ${fmt(v[2])})`

export function computeVectorOp(a: V3, b: V3, op: VecOpKind, scalar = 1): { steps: VecStep[]; result: V3 } {
  const steps: VecStep[] = []
  let result: V3 = [0, 0, 0]

  switch (op) {
    case VecOpKind.Add: {
      result = [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
      steps.push({
        description: 'Identificar los vectores',
        latex: `\\vec{a} = ${fmtV(a)},\\quad \\vec{b} = ${fmtV(b)}`,
        highlightA: true, highlightB: true,
      })
      steps.push({
        description: 'Sumar componente a componente',
        latex: `\\vec{a} + \\vec{b} = \\begin{pmatrix}${fmt(a[0])}+${fmt(b[0])}\\\\${fmt(a[1])}+${fmt(b[1])}\\\\${fmt(a[2])}+${fmt(b[2])}\\end{pmatrix}`,
        highlightA: true, highlightB: true,
      })
      steps.push({
        description: 'Resultado final',
        latex: `\\vec{r} = ${fmtV(result)}`,
        resultVec: result, highlightResult: true,
      })
      break
    }
    case VecOpKind.Sub: {
      result = [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
      steps.push({
        description: 'Identificar los vectores',
        latex: `\\vec{a} = ${fmtV(a)},\\quad \\vec{b} = ${fmtV(b)}`,
        highlightA: true, highlightB: true,
      })
      steps.push({
        description: 'Restar componente a componente',
        latex: `\\vec{a} - \\vec{b} = \\begin{pmatrix}${fmt(a[0])}-${fmt(b[0])}\\\\${fmt(a[1])}-${fmt(b[1])}\\\\${fmt(a[2])}-${fmt(b[2])}\\end{pmatrix}`,
        highlightA: true, highlightB: true,
      })
      steps.push({
        description: 'Resultado final',
        latex: `\\vec{r} = ${fmtV(result)}`,
        resultVec: result, highlightResult: true,
      })
      break
    }
    case VecOpKind.Scale: {
      result = [scalar * a[0], scalar * a[1], scalar * a[2]]
      steps.push({
        description: 'Vector original',
        latex: `\\vec{a} = ${fmtV(a)}`,
        highlightA: true,
      })
      steps.push({
        description: `Multiplicar cada componente por el escalar ${fmt(scalar)}`,
        latex: `${fmt(scalar)} \\cdot \\vec{a} = \\begin{pmatrix}${fmt(scalar)}\\cdot${fmt(a[0])}\\\\${fmt(scalar)}\\cdot${fmt(a[1])}\\\\${fmt(scalar)}\\cdot${fmt(a[2])}\\end{pmatrix}`,
        highlightA: true,
      })
      steps.push({
        description: 'Resultado final',
        latex: `\\vec{r} = ${fmtV(result)}`,
        resultVec: result, highlightResult: true,
      })
      break
    }
    case VecOpKind.Dot: {
      const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
      result = [dot, 0, 0]
      steps.push({
        description: 'Identificar los vectores',
        latex: `\\vec{a} = ${fmtV(a)},\\quad \\vec{b} = ${fmtV(b)}`,
        highlightA: true, highlightB: true,
      })
      steps.push({
        description: 'Multiplicar componentes correspondientes',
        latex: `\\vec{a} \\cdot \\vec{b} = (${fmt(a[0])})(${fmt(b[0])}) + (${fmt(a[1])})(${fmt(b[1])}) + (${fmt(a[2])})(${fmt(b[2])})`,
        highlightA: true, highlightB: true,
      })
      steps.push({
        description: 'Sumar los productos',
        latex: `= ${fmt(a[0] * b[0])} + ${fmt(a[1] * b[1])} + ${fmt(a[2] * b[2])} = ${fmt(dot)}`,
        highlightResult: true,
      })
      const magA = Math.sqrt(a[0] ** 2 + a[1] ** 2 + a[2] ** 2)
      const magB = Math.sqrt(b[0] ** 2 + b[1] ** 2 + b[2] ** 2)
      if (magA > 1e-10 && magB > 1e-10) {
        const cosTheta = Math.min(1, Math.max(-1, dot / (magA * magB)))
        const angle = (Math.acos(cosTheta) * 180 / Math.PI).toFixed(2)
        steps.push({
          description: 'Ángulo entre vectores',
          latex: `\\theta = \\arccos\\left(\\frac{${fmt(dot)}}{${fmt(magA)} \\cdot ${fmt(magB)}}\\right) \\approx ${angle}°`,
          highlightResult: true,
        })
      }
      break
    }
    case VecOpKind.Cross: {
      result = [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
      ]
      steps.push({
        description: 'Identificar los vectores',
        latex: `\\vec{a} = ${fmtV(a)},\\quad \\vec{b} = ${fmtV(b)}`,
        highlightA: true, highlightB: true,
      })
      steps.push({
        description: 'Aplicar la fórmula del producto vectorial',
        latex: `\\vec{a} \\times \\vec{b} = \\begin{vmatrix}\\hat{i}&\\hat{j}&\\hat{k}\\\\${fmt(a[0])}&${fmt(a[1])}&${fmt(a[2])}\\\\${fmt(b[0])}&${fmt(b[1])}&${fmt(b[2])}\\end{vmatrix}`,
        highlightA: true, highlightB: true,
      })
      steps.push({
        description: 'Calcular cada componente',
        latex: `\\vec{r} = \\begin{pmatrix}(${fmt(a[1])})(${fmt(b[2])})-(${fmt(a[2])})(${fmt(b[1])})\\\\(${fmt(a[2])})(${fmt(b[0])})-(${fmt(a[0])})(${fmt(b[2])})\\\\(${fmt(a[0])})(${fmt(b[1])})-(${fmt(a[1])})(${fmt(b[0])})\\end{pmatrix}`,
        highlightA: true, highlightB: true,
      })
      steps.push({
        description: 'Resultado final (perpendicular a ambos vectores)',
        latex: `\\vec{r} = ${fmtV(result)}`,
        resultVec: result, highlightResult: true,
      })
      break
    }
    case VecOpKind.Normalize: {
      const mag = Math.sqrt(a[0] ** 2 + a[1] ** 2 + a[2] ** 2)
      if (mag < 1e-10) {
        result = [0, 0, 0]
        steps.push({ description: 'Vector cero no tiene dirección', latex: '\\|\\vec{a}\\| = 0', highlightA: true })
      } else {
        result = [a[0] / mag, a[1] / mag, a[2] / mag]
        steps.push({ description: 'Calcular la magnitud', latex: `\\|\\vec{a}\\| = \\sqrt{${fmt(a[0])}^2+${fmt(a[1])}^2+${fmt(a[2])}^2} = ${fmt(mag)}`, highlightA: true })
        steps.push({ description: 'Dividir cada componente por la magnitud', latex: `\\hat{a} = \\frac{1}{${fmt(mag)}} ${fmtV(a)}`, highlightA: true })
        steps.push({ description: 'Vector unitario resultante', latex: `\\hat{a} = ${fmtV(result)}`, resultVec: result, highlightResult: true })
      }
      break
    }
  }

  return { steps, result }
}
