export enum StepType {
  HighlightPivot,
  SwapRows,
  HighlightTarget,
  EliminateRow,
  MarkZero,
  BackSubstitute,
  SingularDetected,
  NoSolution,
  InfiniteSolutions,
  Complete,
}

export interface Step {
  type: StepType
  pivotRow: number
  targetRow: number
  factor: number
  swapRow1: number
  swapRow2: number
  matrixSnap: number[][]
  description: string
  variable: string
  solution: number[]
  opCount: number
}

export enum MatOpType {
  HighlightCell,
  SetResult,
  HighlightRowCol,
  SetResultMul,
  Complete,
}

export enum MatOpKind {
  Add,
  Sub,
  Mul,
}

export interface MatOpsStep {
  type: MatOpType
  op: MatOpKind
  row: number
  col: number
  aRow: number
  aCol: number
  bRow: number
  bCol: number
  snapC: number[][]
  description: string
  opCount: number
}

export interface ParsedSystem {
  variables: string[]
  matrix: number[][]
  n: number
}

export enum VecOpKind {
  Add,
  Sub,
  Scale,
  Dot,
  Cross,
  Normalize,
}

export interface VecStep {
  description: string
  latex: string
  resultVec?: [number, number, number]
  highlightA?: boolean
  highlightB?: boolean
  highlightResult?: boolean
}
