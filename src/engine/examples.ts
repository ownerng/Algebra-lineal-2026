export const GAUSS_EXAMPLES = [
  { name: 'Básico 2×2', equations: ['x + y = 5', '2x - y = 1'] },
  { name: '3×3 (solución entera)', equations: ['2x + y - z = 8', '-3x - y + 2z = -11', '-2x + y + 2z = -3'] },
  { name: 'Pivoteo parcial', equations: ['0x + 2y = 4', 'x + y = 3'] },
  { name: 'Sin solución', equations: ['x + y = 1', 'x + y = 2'] },
  { name: 'Infinitas soluciones', equations: ['x + y = 1', '2x + 2y = 2'] },
  {
    name: 'Sistema 4×4',
    equations: ['x + y + z + w = 10', '2x - y + z - w = 4', 'x + 3y - z + 2w = 8', '-x + y + 2z + w = 6'],
  },
]

import { VecOpKind } from './types'

export const VECTOR_EXAMPLES: { name: string; op: VecOpKind; a: [number, number, number]; b: [number, number, number] }[] = [
  { name: 'Suma básica',        op: VecOpKind.Add,       a: [1, 2, 0], b: [3, -1, 0] },
  { name: 'Resta simple',       op: VecOpKind.Sub,       a: [4, 1, 0], b: [1, 3, 0] },
  { name: 'Producto cruz 3D',   op: VecOpKind.Cross,     a: [1, 0, 0], b: [0, 1, 0] },
  { name: 'Producto punto',     op: VecOpKind.Dot,       a: [2, 3, 0], b: [1, 4, 0] },
  { name: 'Ortogonales',        op: VecOpKind.Dot,       a: [2, 0, 0], b: [0, 3, 0] },
  { name: 'Escalar ×3',         op: VecOpKind.Scale,     a: [2, -1, 3], b: [0, 0, 0] },
  { name: 'Normalizar',         op: VecOpKind.Normalize, a: [3, 4, 0], b: [0, 0, 0] },
  { name: 'Opuestos',           op: VecOpKind.Add,       a: [1, 1, 1], b: [-1, -1, -1] },
]
