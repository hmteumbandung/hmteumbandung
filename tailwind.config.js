/** @type {import('tailwindcss').Config} */
// Warna "navy" dan "cyan" membaca CSS variables (diatur dari dashboard admin > Tampilan Situs).
// Nilai bawaan ada di src/index.css (:root).
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`
const scale = (prefix, steps) => Object.fromEntries(steps.map((s) => [s, v(`${prefix}-${s}`)]))

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: scale('navy', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]),
        cyan: scale('cyan', [300, 400, 500, 600]),
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px -8px rgb(var(--cyan-400) / 0.45)',
        card: '0 1px 2px rgba(13,27,58,0.06), 0 8px 24px -12px rgba(13,27,58,0.18)',
      },
    },
  },
  plugins: [],
}
