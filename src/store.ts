import { create } from 'zustand'

export type AppMode = 'gauss' | 'matops' | 'vectors' | 'guide'

interface AppStore {
  mode: AppMode
  setMode: (m: AppMode) => void
  theme: 'light' | 'dark'
  setTheme: (t: 'light' | 'dark') => void
  collapsed: boolean
  setCollapsed: (c: boolean) => void
}

export const useAppStore = create<AppStore>(set => ({
  mode: 'gauss',
  setMode: mode => set({ mode }),
  theme: (() => {
    try { return (localStorage.getItem('ml-theme') as 'light' | 'dark') || 'light' }
    catch { return 'light' }
  })(),
  setTheme: theme => {
    try { localStorage.setItem('ml-theme', theme) } catch { /* storage unavailable */ }
    set({ theme })
  },
  collapsed: false,
  setCollapsed: collapsed => set({ collapsed }),
}))
