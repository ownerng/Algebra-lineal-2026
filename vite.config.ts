import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Algebra-lineal-2026/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'framer': ['framer-motion'],
          'react-vendor': ['react', 'react-dom'],
          'katex-vendor': ['katex'],
        },
      },
    },
  },
})
