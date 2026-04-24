import { StepType, type Step } from './types'
import { cloneMatrix, formatNum, subscript } from './matrix'

const EPS = 1e-10

export function solve(matrix: number[][], vars: string[]): Step[] {
  const n = vars.length
  const m = cloneMatrix(matrix)
  const steps: Step[] = []
  let opCount = 0

  const step = (partial: Partial<Step>): Step => ({
    type: StepType.HighlightPivot,
    pivotRow: 0, targetRow: 0, factor: 0,
    swapRow1: 0, swapRow2: 0,
    matrixSnap: cloneMatrix(m),
    description: '', reason: '', variable: '', solution: [],
    opCount,
    ...partial,
  })

  for (let col = 0; col < n; col++) {
    let maxVal = Math.abs(m[col][col])
    let maxRow = col
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(m[row][col]) > maxVal) {
        maxVal = Math.abs(m[row][col])
        maxRow = row
      }
    }

    if (maxVal < EPS) {
      steps.push(step({
        type: StepType.SingularDetected,
        pivotRow: col,
        description: `Pivote ≈ 0 en columna ${col + 1}`,
        reason: 'Todos los elementos de esta columna son cero; no hay pivote disponible.',
      }))
      continue
    }

    if (maxRow !== col) {
      ;[m[col], m[maxRow]] = [m[maxRow], m[col]]
      opCount++
      steps.push(step({
        type: StepType.SwapRows,
        swapRow1: col, swapRow2: maxRow,
        description: `Intercambiar R${subscript(col + 1)} ↔ R${subscript(maxRow + 1)}`,
        reason: 'Pivoteo parcial: colocamos el elemento de mayor valor absoluto como pivote para reducir errores de redondeo.',
      }))
    }

    steps.push(step({
      type: StepType.HighlightPivot,
      pivotRow: col,
      description: `Pivote [${subscript(col + 1)},${subscript(col + 1)}] = ${formatNum(m[col][col])}`,
      reason: 'Este elemento es el pivote: lo usaremos para eliminar todos los valores debajo de él en esta columna.',
    }))

    for (let target = col + 1; target < n; target++) {
      if (Math.abs(m[target][col]) < EPS) continue

      const factor = m[target][col] / m[col][col]
      const desc = `R${subscript(target + 1)} ← R${subscript(target + 1)} − ${formatNum(factor)}·R${subscript(col + 1)}`

      steps.push(step({
        type: StepType.HighlightTarget,
        pivotRow: col, targetRow: target, factor,
        description: desc,
        reason: `El factor ${formatNum(factor)} = elemento objetivo ÷ pivote. Restar este múltiplo creará un cero.`,
      }))

      for (let j = col; j <= n; j++) m[target][j] -= factor * m[col][j]
      opCount++

      steps.push(step({
        type: StepType.EliminateRow,
        pivotRow: col, targetRow: target, factor,
        description: desc,
        reason: 'Operación elemental de fila: al restar el múltiplo exacto, el elemento de la columna pivote se vuelve cero.',
      }))

      steps.push(step({
        type: StepType.MarkZero,
        pivotRow: col, targetRow: target,
        description: `R${subscript(target + 1)}[${target + 1},${col + 1}] = 0`,
        reason: 'Cero conseguido. Esta posición ya no influirá en las ecuaciones restantes.',
      }))
    }
  }

  for (let i = 0; i < n; i++) {
    if (Math.abs(m[i][i]) < EPS) {
      if (Math.abs(m[i][n]) > EPS) {
        steps.push(step({
          type: StepType.NoSolution,
          pivotRow: i,
          description: `Fila R${subscript(i + 1)}: 0 = ${formatNum(m[i][n])} (inconsistente)`,
          reason: 'La ecuación 0 = c con c ≠ 0 es una contradicción — el sistema no tiene solución.',
        }))
        return steps
      }
      steps.push(step({
        type: StepType.InfiniteSolutions,
        pivotRow: i,
        description: `Variable libre en R${subscript(i + 1)}`,
        reason: 'Fila de ceros: hay más incógnitas que ecuaciones independientes, lo que genera infinitas soluciones.',
      }))
      return steps
    }
  }

  const x = new Array(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    let sum = 0
    for (let j = i + 1; j < n; j++) sum += m[i][j] * x[j]
    x[i] = (m[i][n] - sum) / m[i][i]
    const varVal = `${vars[i]} = ${formatNum(x[i])}`
    steps.push(step({
      type: StepType.BackSubstitute,
      pivotRow: i,
      description: varVal,
      reason: 'Sustitución hacia atrás: con los valores ya calculados, despejamos esta variable directamente.',
      variable: varVal,
    }))
  }

  steps.push(step({
    type: StepType.Complete,
    description: 'Solución encontrada',
    reason: 'La matriz quedó en forma escalonada reducida. Todas las incógnitas han sido determinadas.',
    solution: x,
  }))

  return steps
}
