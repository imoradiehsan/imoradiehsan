const v = (n) => `rgb(var(--${n}) / <alpha-value>)`
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      fontFamily: { sans: ['IRANYekanX', 'Tahoma', 'sans-serif'] },
      colors: {
        brand: { DEFAULT: '#2E62FF', light: '#3C7CFF', dark: '#2047FF' },
        bg: v('bg'), surface: v('surface'), surface2: v('surface2'),
        line: v('line'), ink: v('ink'), muted: v('muted'),
        up: v('up'), down: v('down'),
      },
      boxShadow: { glow: '0 10px 40px -10px rgba(46,98,255,.6)' },
    },
  },
}
