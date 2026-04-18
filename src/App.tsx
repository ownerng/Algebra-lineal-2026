import { useEffect } from 'react'
import { useAppStore } from './store'
import Sidebar from './components/ui/Sidebar'
import GaussPage from './components/gauss/GaussPage'
import MatOpsPage from './components/matops/MatOpsPage'
import VectorsPage from './components/vectors/VectorsPage'
import GuideModule from './components/GuideModule'

const MODULE_TITLES = {
  gauss:   { eyebrow: 'Módulo', title: 'Gauss-Jordan' },
  matops:  { eyebrow: 'Módulo', title: 'Matrices' },
  vectors: { eyebrow: 'Módulo', title: 'Vectores' },
  guide:   { eyebrow: 'Recurso', title: 'Guía Docente' },
}

const IconSun = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
    <circle cx="7" cy="7" r="2.5" />
    <line x1="7" y1="1.5" x2="7" y2="3" /><line x1="7" y1="11" x2="7" y2="12.5" />
    <line x1="1.5" y1="7" x2="3" y2="7" /><line x1="11" y1="7" x2="12.5" y2="7" />
  </svg>
)
const IconMoon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M11.5 8.5 A4.5 4.5 0 1 1 5.5 2.5 A3.5 3.5 0 0 0 11.5 8.5 Z" />
  </svg>
)

export default function App() {
  const { mode, theme, setTheme, collapsed } = useAppStore()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const mt = MODULE_TITLES[mode]

  return (
    <div className="app" data-collapsed={collapsed}>
      <Sidebar />
      <main className="main">
        <div className="topbar">
          <div className="topbar-title">
            <div className="topbar-eyebrow">{mt.eyebrow}</div>
            <div className="topbar-h">{mt.title}</div>
          </div>
          <div className="topbar-actions">
            <button
              className="btn btn-ghost"
              style={{ gap: 6 }}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <IconSun /> : <IconMoon />}
              <span>{theme === 'dark' ? 'Claro' : 'Oscuro'}</span>
            </button>
          </div>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {mode === 'gauss'   && <GaussPage />}
          {mode === 'matops'  && <MatOpsPage />}
          {mode === 'vectors' && <VectorsPage />}
          {mode === 'guide'   && <GuideModule />}
        </div>
      </main>
    </div>
  )
}
