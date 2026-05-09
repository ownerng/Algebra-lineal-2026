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
        reason: 'Partimos representando ambos vectores para ver sus componentes antes de operar.',
        latex: `\\vec{a} = ${fmtV(a)},\\quad \\vec{b} = ${fmtV(b)}`,
        highlightA: true, highlightB: true,
      })
      steps.push({
        description: 'Sumar componente a componente',
        reason: 'La suma vectorial es conmutativa y se realiza sumando las componentes del mismo eje por separado.',
        latex: `\\vec{a} + \\vec{b} = \\begin{pmatrix}${fmt(a[0])}+${fmt(b[0])}\\\\${fmt(a[1])}+${fmt(b[1])}\\\\${fmt(a[2])}+${fmt(b[2])}\\end{pmatrix}`,
        highlightA: true, highlightB: true,
      })
      steps.push({
        description: 'Resultado final',
        reason: 'El vector resultante es la diagonal del paralelogramo formado por los dos vectores originales.',
        latex: `\\vec{r} = ${fmtV(result)}`,
        resultVec: result, highlightResult: true,
      })
      break
    }
    case VecOpKind.Sub: {
      result = [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
      steps.push({
        description: 'Identificar los vectores',
        reason: 'Visualizamos los vectores originales antes de efectuar la resta.',
        latex: `\\vec{a} = ${fmtV(a)},\\quad \\vec{b} = ${fmtV(b)}`,
        highlightA: true, highlightB: true,
      })
      steps.push({
        description: 'Restar componente a componente',
        reason: 'La resta a − b equivale a sumar a + (−b); cada componente se resta por separado.',
        latex: `\\vec{a} - \\vec{b} = \\begin{pmatrix}${fmt(a[0])}-${fmt(b[0])}\\\\${fmt(a[1])}-${fmt(b[1])}\\\\${fmt(a[2])}-${fmt(b[2])}\\end{pmatrix}`,
        highlightA: true, highlightB: true,
      })
      steps.push({
        description: 'Resultado final',
        reason: 'El vector resultante apunta de la punta de b hacia la punta de a.',
        latex: `\\vec{r} = ${fmtV(result)}`,
        resultVec: result, highlightResult: true,
      })
      break
    }
    case VecOpKind.Scale: {
      result = [scalar * a[0], scalar * a[1], scalar * a[2]]
      steps.push({
        description: 'Vector original',
        reason: 'Identificamos el vector que vamos a escalar.',
        latex: `\\vec{a} = ${fmtV(a)}`,
        highlightA: true,
      })
      steps.push({
        description: `Multiplicar cada componente por ${fmt(scalar)}`,
        reason: `El escalar k = ${fmt(scalar)} estira (|k|>1) o encoge (|k|<1) el vector. Si k<0 invierte su dirección.`,
        latex: `${fmt(scalar)} \\cdot \\vec{a} = \\begin{pmatrix}${fmt(scalar)}\\cdot${fmt(a[0])}\\\\${fmt(scalar)}\\cdot${fmt(a[1])}\\\\${fmt(scalar)}\\cdot${fmt(a[2])}\\end{pmatrix}`,
        highlightA: true,
      })
      steps.push({
        description: 'Resultado final',
        reason: 'El vector resultante es paralelo al original, con magnitud multiplicada por |k|.',
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
        reason: 'El producto punto mide cuánto se proyecta un vector sobre el otro. Resultado: un escalar.',
        latex: `\\vec{a} = ${fmtV(a)},\\quad \\vec{b} = ${fmtV(b)}`,
        highlightA: true, highlightB: true,
      })
      steps.push({
        description: 'Multiplicar componentes correspondientes',
        reason: 'Cada componente de a se multiplica por la componente del mismo eje de b.',
        latex: `\\vec{a} \\cdot \\vec{b} = (${fmt(a[0])})(${fmt(b[0])}) + (${fmt(a[1])})(${fmt(b[1])}) + (${fmt(a[2])})(${fmt(b[2])})`,
        highlightA: true, highlightB: true,
      })
      steps.push({
        description: 'Sumar los productos',
        reason: 'La suma de los productos es el producto punto: a·b = |a||b|cos(θ).',
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
          reason: `Si a·b > 0 el ángulo es agudo; si a·b = 0 son perpendiculares; si a·b < 0 es obtuso.`,
          latex: `\\theta = \\arccos\\!\\left(\\frac{${fmt(dot)}}{${fmt(magA)} \\cdot ${fmt(magB)}}\\right) \\approx ${angle}°`,
          highlightA: true,
          highlightB: true,
          highlightResult: true,
          showAngleArc: true,
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
        reason: 'El producto vectorial produce un vector perpendicular a ambos, siguiendo la regla de la mano derecha.',
        latex: `\\vec{a} = ${fmtV(a)},\\quad \\vec{b} = ${fmtV(b)}`,
        highlightA: true, highlightB: true,
      })
      steps.push({
        description: 'Aplicar la fórmula del determinante 3×3',
        reason: 'Expandimos el determinante simbólico con i, j, k para obtener cada componente del resultado.',
        latex: `\\vec{a} \\times \\vec{b} = \\begin{vmatrix}\\hat{i}&\\hat{j}&\\hat{k}\\\\${fmt(a[0])}&${fmt(a[1])}&${fmt(a[2])}\\\\${fmt(b[0])}&${fmt(b[1])}&${fmt(b[2])}\\end{vmatrix}`,
        highlightA: true, highlightB: true,
      })
      steps.push({
        description: 'Calcular cada componente',
        reason: 'Cada componente del producto vectorial es el determinante del submenor 2×2 correspondiente.',
        latex: `\\vec{r} = \\begin{pmatrix}(${fmt(a[1])})(${fmt(b[2])})-(${fmt(a[2])})(${fmt(b[1])})\\\\(${fmt(a[2])})(${fmt(b[0])})-(${fmt(a[0])})(${fmt(b[2])})\\\\(${fmt(a[0])})(${fmt(b[1])})-(${fmt(a[1])})(${fmt(b[0])})\\end{pmatrix}`,
        highlightA: true, highlightB: true,
      })
      steps.push({
        description: 'Resultado — perpendicular a ambos vectores',
        reason: '|a×b| = |a||b|sin(θ); equivale al área del paralelogramo formado por los dos vectores.',
        latex: `\\vec{r} = ${fmtV(result)}`,
        resultVec: result, highlightResult: true,
      })
      break
    }
    case VecOpKind.Normalize: {
      const mag = Math.sqrt(a[0] ** 2 + a[1] ** 2 + a[2] ** 2)
      if (mag < 1e-10) {
        result = [0, 0, 0]
        steps.push({
          description: 'Vector cero — sin dirección definida',
          reason: 'El vector nulo no tiene dirección; no puede normalizarse.',
          latex: '\\|\\vec{a}\\| = 0',
          highlightA: true,
        })
      } else {
        result = [a[0] / mag, a[1] / mag, a[2] / mag]
        steps.push({
          description: 'Calcular la magnitud',
          reason: 'La magnitud (norma) es la longitud del vector; necesitamos dividir por ella para obtener longitud 1.',
          latex: `\\|\\vec{a}\\| = \\sqrt{${fmt(a[0])}^2+${fmt(a[1])}^2+${fmt(a[2])}^2} = ${fmt(mag)}`,
          highlightA: true,
        })
        steps.push({
          description: 'Dividir cada componente por la magnitud',
          reason: 'Al dividir por su propia longitud, el vector resultante tiene magnitud exactamente 1.',
          latex: `\\hat{a} = \\frac{1}{${fmt(mag)}} ${fmtV(a)}`,
          highlightA: true,
        })
        steps.push({
          description: 'Vector unitario resultante',
          reason: 'Este vector apunta en la misma dirección que a, con longitud = 1. Útil como dirección pura.',
          latex: `\\hat{a} = ${fmtV(result)}`,
          resultVec: result, highlightResult: true,
        })
      }
      break
    }
  }

  return { steps, result }
}
