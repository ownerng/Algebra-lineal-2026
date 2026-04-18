import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-elev': 'var(--bg-elev)',
        'bg-sunken': 'var(--bg-sunken)',
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        'ink-faint': 'var(--ink-faint)',
        rule: 'var(--rule)',
        'rule-soft': 'var(--rule-soft)',
        sage: 'var(--sage)',
        'sage-deep': 'var(--sage-deep)',
        'sage-soft': 'var(--sage-soft)',
        'sage-tint': 'var(--sage-tint)',
        amber: 'var(--amber)',
        'amber-soft': 'var(--amber-soft)',
        terra: 'var(--terra)',
        'terra-soft': 'var(--terra-soft)',
        // aliases so old code still resolves
        surface: 'var(--bg-elev)',
        'surface-2': 'var(--bg-sunken)',
        accent: 'var(--sage)',
        'accent-dim': 'var(--sage-deep)',
        pivot: 'var(--sage)',
        target: 'var(--terra)',
        muted: 'var(--ink-faint)',
        border: 'var(--rule)',
      },
      fontFamily: {
        serif: ['Newsreader', 'Source Serif 4', 'Georgia', 'serif'],
        sans: ['Inter Tight', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      animation: {
        'cell-pop': 'cellPop 480ms cubic-bezier(0.2,0.8,0.2,1)',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
      },
      keyframes: {
        cellPop: {
          '0%':   { transform: 'scale(1)' },
          '40%':  { transform: 'scale(1.16)' },
          '100%': { transform: 'scale(1)' },
        },
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
} satisfies Config
