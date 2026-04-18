import { MatOpType, MatOpKind, type MatOpsStep } from './types'
import { cloneMatrix, makeZeroMatrix, fracDisplay } from './matrix'

function step(partial: Partial<MatOpsStep>): MatOpsStep {
  return {
    type: MatOpType.HighlightCell,
    op: MatOpKind.Add,
    row: 0, col: 0,
    aRow: 0, aCol: 0,
    bRow: 0, bCol: 0,
    snapC: [],
    description: '',
    opCount: 0,
    ...partial,
  }
}

function matAddSub(A: number[][], B: number[][], op: MatOpKind): MatOpsStep[] {
  const n = A.length
  const C = makeZeroMatrix(n)
  let opCount = 0
  const steps: MatOpsStep[] = []
  const sym = op === MatOpKind.Add ? '+' : '-'

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      steps.push(step({
        type: MatOpType.HighlightCell, op,
        row: i, col: j,
        aRow: i, aCol: j, bRow: i, bCol: j,
        snapC: cloneMatrix(C),
        description: `Calculando C[${i+1}][${j+1}] = A[${i+1}][${j+1}] ${sym} B[${i+1}][${j+1}]`,
        opCount,
      }))

      C[i][j] = op === MatOpKind.Add ? A[i][j] + B[i][j] : A[i][j] - B[i][j]
      opCount++

      steps.push(step({
        type: MatOpType.SetResult, op,
        row: i, col: j,
        aRow: i, aCol: j, bRow: i, bCol: j,
        snapC: cloneMatrix(C),
        description: `C[${i+1}][${j+1}] = ${fracDisplay(A[i][j])} ${sym} ${fracDisplay(B[i][j])} = ${fracDisplay(C[i][j])}`,
        opCount,
      }))
    }
  }

  steps.push(step({ type: MatOpType.Complete, op, snapC: cloneMatrix(C), description: 'Operación completada', opCount }))
  return steps
}

export const matAdd = (A: number[][], B: number[][]): MatOpsStep[] => matAddSub(A, B, MatOpKind.Add)
export const matSub = (A: number[][], B: number[][]): MatOpsStep[] => matAddSub(A, B, MatOpKind.Sub)

export function matMul(A: number[][], B: number[][]): MatOpsStep[] {
  const n = A.length
  const C = makeZeroMatrix(n)
  let opCount = 0
  const steps: MatOpsStep[] = []

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      steps.push(step({
        type: MatOpType.HighlightRowCol, op: MatOpKind.Mul,
        row: i, col: j, aRow: i, bCol: j,
        snapC: cloneMatrix(C),
        description: `C[${i+1}][${j+1}] = fila ${i+1} de A × col ${j+1} de B`,
        opCount,
      }))

      let sum = 0
      for (let k = 0; k < n; k++) { sum += A[i][k] * B[k][j]; opCount++ }
      C[i][j] = sum

      steps.push(step({
        type: MatOpType.SetResultMul, op: MatOpKind.Mul,
        row: i, col: j, aRow: i, bCol: j,
        snapC: cloneMatrix(C),
        description: `C[${i+1}][${j+1}] = ${fracDisplay(sum)}`,
        opCount,
      }))
    }
  }

  steps.push(step({ type: MatOpType.Complete, op: MatOpKind.Mul, snapC: cloneMatrix(C), description: 'Multiplicación completada', opCount }))
  return steps
}
