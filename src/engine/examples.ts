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

export const VECTOR_EXAMPLES = [
  { name: 'Suma básica', a: [1, 2, 0] as [number, number, number], b: [3, -1, 0] as [number, number, number] },
  { name: 'Cruz 3D', a: [1, 0, 0] as [number, number, number], b: [0, 1, 0] as [number, number, number] },
  { name: 'Ortogonales', a: [2, 0, 0] as [number, number, number], b: [0, 3, 0] as [number, number, number] },
  { name: 'Opuestos', a: [1, 1, 1] as [number, number, number], b: [-1, -1, -1] as [number, number, number] },
]
