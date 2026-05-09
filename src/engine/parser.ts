import type { ParsedSystem } from './types'

export function parse(equations: string[]): ParsedSystem {
  if (equations.length === 0) throw new Error('No se proporcionaron ecuaciones')

  const varSet = new Set<string>()
  for (const eq of equations) {
    for (const ch of eq) {
      if (ch >= 'a' && ch <= 'z') varSet.add(ch)
    }
  }

  const vars = [...varSet].sort()
  const n = vars.length
  const m = equations.length

  if (n === 0) throw new Error('No se detectaron variables')
  if (n !== m) throw new Error(`Sistema ${m}×${n} — se requiere sistema cuadrado (${m} ecuaciones, ${n} variables)`)

  const matrix = equations.map((eq, i) => {
    try { return parseEquation(eq, vars) }
    catch (e) { throw new Error(`Ecuación ${i + 1}: ${(e as Error).message}`) }
  })

  return { variables: vars, matrix, n }
}

function parseEquation(eq: string, vars: string[]): number[] {
  const idx = eq.indexOf('=')
  if (idx < 0) throw new Error('Falta el signo igual')

  const lhs = eq.slice(0, idx).trim()
  const rhs = eq.slice(idx + 1).trim()

  const constant = parseFloat(rhs)
  if (isNaN(constant) || !isFinite(constant)) throw new Error(`Constante inválida: "${rhs}"`)

  const coeffMap = parseLHS(lhs)
  const row = vars.map(v => coeffMap[v] ?? 0)
  row.push(constant)
  return row
}

function parseLHS(lhs: string): Record<string, number> {
  const coeffs: Record<string, number> = {}
  const s = lhs.replace(/\s/g, '')
  if (!s) return coeffs

  const terms = splitTerms(s)
  for (const term of terms) {
    if (!term) continue
    const last = term[term.length - 1]
    if (last < 'a' || last > 'z') throw new Error(`Término sin variable: "${term}"`)

    const varName = last
    const coeffStr = term.slice(0, -1)

    let coeff: number
    if (coeffStr === '' || coeffStr === '+') coeff = 1
    else if (coeffStr === '-') coeff = -1
    else {
      coeff = parseFloat(coeffStr)
      if (isNaN(coeff) || !isFinite(coeff)) throw new Error(`Coeficiente inválido: "${coeffStr}"`)
    }

    coeffs[varName] = (coeffs[varName] ?? 0) + coeff
  }

  return coeffs
}

function splitTerms(s: string): string[] {
  const terms: string[] = []
  let start = 0
  for (let i = 1; i < s.length; i++) {
    if (s[i] === '+' || s[i] === '-') {
      terms.push(s.slice(start, i))
      start = i
    }
  }
  terms.push(s.slice(start))
  return terms
}
