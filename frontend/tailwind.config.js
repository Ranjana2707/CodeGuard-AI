/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary:   '#0d1117',
          secondary: '#161b22',
          tertiary:  '#21262d',
          elevated:  '#30363d',
        },
        border: {
          DEFAULT: '#30363d',
          muted:   '#21262d',
          subtle:  '#484f58',
        },
        text: {
          primary:  '#e6edf3',
          secondary:'#8b949e',
          muted:    '#6e7681',
        },
        brand: {
          blue:   '#388bfd',
          blue2:  '#1f6feb',
          green:  '#3fb950',
          red:    '#f85149',
          orange: '#d29922',
          yellow: '#e3b341',
          purple: '#bc8cff',
          cyan:   '#39c5cf',
        },
      },
      fontFamily: {
        mono: ['SF Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'fade-in':    'fadeIn 0.25s ease both',
        'slide-up':   'slideUp 0.3s ease both',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
