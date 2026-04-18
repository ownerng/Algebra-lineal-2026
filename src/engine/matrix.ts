export function cloneMatrix(m: number[][]): number[][] {
  return m.map(row => [...row])
}

export function formatNum(f: number): string {
  const eps = 1e-9
  if (Math.abs(f) < eps) return '0'
  const rounded = Math.round(f)
  if (Math.abs(f - rounded) < eps) return String(rounded)
  const s = f.toFixed(4).replace(/\.?0+$/, '')
  return s
}

export function fracDisplay(f: number): string {
  const eps = 1e-9
  if (Math.abs(f) < eps) return '0'
  const neg = f < 0
  const x = Math.abs(f)
  const maxDen = 9999

  const a0 = Math.floor(x)
  let frac = x - a0
  if (frac < eps) return neg ? String(-a0) : String(a0)

  let h2 = 1, h1 = 0
  let k2 = 0, k1 = 1
  let r = frac

  for (let iter = 0; iter < 50; iter++) {
    r = 1.0 / r
    const a = Math.floor(r)
    r -= a
    const h = a * h1 + h2
    const k = a * k1 + k2
    if (k > maxDen) break
    h2 = h1; h1 = h
    k2 = k1; k1 = k
    if (Math.abs(r) < eps) break
  }

  const num = a0 * k1 + h1
  const finalNum = neg ? -num : num
  if (k1 === 1) return String(finalNum)
  return `${finalNum}/${k1}`
}

export function subscript(n: number): string {
  const map: Record<string, string> = {
    '0': '₀','1': '₁','2': '₂','3': '₃','4': '₄',
    '5': '₅','6': '₆','7': '₇','8': '₈','9': '₉',
  }
  return String(n).split('').map(d => map[d] ?? d).join('')
}

export function makeZeroMatrix(n: number): number[][] {
  return Array.from({ length: n }, () => Array(n).fill(0))
}
