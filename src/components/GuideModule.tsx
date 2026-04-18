export default function GuideModule() {
  const items = [
    { n: 'I',   h: 'Proyectar en clase',    b: 'Abra el módulo deseado, ingrese el ejercicio y presione reproducir. La animación se detiene y retrocede libremente para adaptarse al ritmo de la clase.' },
    { n: 'II',  h: 'Sistemas lineales',     b: 'Ingrese ecuaciones en formato natural — la herramienta construye la matriz aumentada y ejecuta Gauss-Jordan paso a paso, resaltando el pivote y la operación elemental en cada iteración.' },
    { n: 'III', h: 'Matrices',              b: 'Suma, resta y multiplicación. Cada entrada de la matriz resultante se construye ante los ojos de los estudiantes con highlight celda por celda.' },
    { n: 'IV',  h: 'Vectores',              b: 'Operaciones vectoriales en 2D con visualización cartesiana: regla del paralelogramo, producto punto, norma y ángulo entre vectores.' },
    { n: 'V',   h: 'Modo claro u oscuro',   b: 'Alterne el tema desde el pie de la barra lateral — útil para aulas con proyección en entornos de baja luz.' },
    { n: 'VI',  h: 'Controles del player',  b: 'Play, pausa, paso atrás, paso adelante y reinicio. La barra de progreso permite saltar a cualquier paso de la demostración.' },
  ]
  return (
    <div className="content">
      <div className="module-intro">
        <div className="module-intro-text">
          <div className="module-eyebrow">Recurso · Para el docente</div>
          <h1 className="module-title">Guía de uso en el aula</h1>
          <p className="module-desc">
            MathLearn está diseñado como material de proyección para profesores universitarios de álgebra lineal. No requiere registro, licencias ni instalación.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {items.map(item => (
          <div className="stage-panel" key={item.n} style={{ padding: 22 }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 12, letterSpacing: '0.1em', color: 'var(--sage-deep)', marginBottom: 6 }}>
              § {item.n}
            </div>
            <h3 className="stage-panel-h" style={{ marginBottom: 8 }}>{item.h}</h3>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 14.5, lineHeight: 1.55, color: 'var(--ink-soft)', margin: 0 }}>{item.b}</p>
          </div>
        ))}
      </div>

      <div className="divider" style={{ marginTop: 36 }} />
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 13.5, color: 'var(--ink-faint)', fontStyle: 'italic', textAlign: 'center', letterSpacing: '0.02em' }}>
        MathLearn · Herramienta de apoyo docente · Proyecto académico 2026
      </div>
    </div>
  )
}
