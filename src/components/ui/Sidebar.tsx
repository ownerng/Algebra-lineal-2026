import { useAppStore, type AppMode } from '../../store'

const IconExpand = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M6 4 L10 8 L6 12" />
  </svg>
)
const IconCollapse = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M10 4 L6 8 L10 12" />
  </svg>
)

const NAV_ITEMS: { id: AppMode; label: string; sub: string; letter: string }[] = [
  { id: 'gauss',   label: 'Gauss-Jordan',  sub: 'Sistemas lineales', letter: '∑' },
  { id: 'matops',  label: 'Matrices',      sub: 'Operaciones',       letter: 'M' },
  { id: 'vectors', label: 'Vectores',      sub: 'En 2D y 3D',        letter: 'v' },
]
const REF_ITEMS: { id: AppMode; label: string; sub: string; letter: string }[] = [
  { id: 'guide', label: 'Guía docente', sub: 'Cómo usar en clase', letter: '§' },
]

export default function Sidebar() {
  const { mode, setMode, theme, setTheme, collapsed, setCollapsed } = useAppStore()

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        {!collapsed && (
          <div className="brand">
            <div className="brand-mark">M</div>
            <div className="brand-text">
              <div className="brand-name">MathLearn</div>
              <div className="brand-sub">Álgebra Lineal</div>
            </div>
          </div>
        )}
        <button
          className="icon-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expandir menú' : 'Contraer menú'}
        >
          {collapsed ? <IconExpand /> : <IconCollapse />}
        </button>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">Módulos</div>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className="nav-item"
            aria-current={mode === item.id}
            onClick={() => setMode(item.id)}
            title={collapsed ? item.label : undefined}
          >
            <div className="nav-icon">{item.letter}</div>
            <div className="nav-text">
              <div className="nav-label">{item.label}</div>
              <div className="nav-sub">{item.sub}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">Recursos</div>
        {REF_ITEMS.map(item => (
          <button
            key={item.id}
            className="nav-item"
            aria-current={mode === item.id}
            onClick={() => setMode(item.id)}
            title={collapsed ? item.label : undefined}
          >
            <div className="nav-icon">{item.letter}</div>
            <div className="nav-text">
              <div className="nav-label">{item.label}</div>
              <div className="nav-sub">{item.sub}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="sidebar-foot">
        <button
          className="theme-toggle"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          aria-label="Alternar tema"
        />
        <div className="sidebar-foot-text">
          {theme === 'dark' ? 'Modo oscuro' : 'Modo claro'}<br />
          <span style={{ opacity: 0.7 }}>v0.1 · Académico</span>
        </div>
      </div>
    </aside>
  )
}
