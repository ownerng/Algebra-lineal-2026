import { useAppStore, type AppMode } from '../../store'

const MODES: { id: AppMode; label: string; icon: string }[] = [
  { id: 'gauss', label: 'Gauss-Jordan', icon: '∑' },
  { id: 'matops', label: 'Matrices', icon: '⊞' },
  { id: 'vectors', label: 'Vectores', icon: '↗' },
  { id: 'guide', label: 'Guía', icon: '§' },
]

export default function NavBar() {
  const { mode, setMode } = useAppStore()

  return (
    <nav className="flex items-center gap-1 px-4 py-2 border-b border-border bg-surface shrink-0">
      <span className="text-accent font-mono font-bold text-sm mr-4">MathLearn</span>
      {MODES.map(m => (
        <button
          key={m.id}
          onClick={() => setMode(m.id)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            mode === m.id
              ? 'bg-accent/20 text-accent border border-accent/30'
              : 'text-muted hover:text-white hover:bg-surface-2'
          }`}
        >
          <span className="mr-1.5">{m.icon}</span>
          {m.label}
        </button>
      ))}
    </nav>
  )
}
