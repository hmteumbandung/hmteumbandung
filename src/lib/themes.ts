// Preset warna tema. Setiap preset memiliki skala "navy" (warna utama/gelap) dan "accent" (aksen; dipakai lewat kelas cyan-*).
export const NAVY_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const
export const ACCENT_STEPS = [300, 400, 500, 600] as const

export interface Theme {
  id: string
  name: string
  navy: Record<number, string>
  accent: Record<number, string>
}

const NAVY = { 50: '#eef3fb', 100: '#d9e4f5', 200: '#b5c8e8', 300: '#86a3d3', 400: '#5a7fbd', 500: '#3a5f9f', 600: '#2a4a82', 700: '#1f3a68', 800: '#152a4e', 900: '#0d1b3a', 950: '#081226' }
const CYAN = { 300: '#67e8f9', 400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2' }

export const THEMES: Theme[] = [
  { id: 'navy-cyan', name: 'Navy & Cyan (bawaan)', navy: NAVY, accent: CYAN },
  { id: 'navy-biru', name: 'Navy & Biru Listrik', navy: NAVY, accent: { 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb' } },
  {
    id: 'hijau-emas', name: 'Hijau Tua & Emas',
    navy: { 50: '#effaf3', 100: '#d7f2e0', 200: '#b1e3c4', 300: '#82cca1', 400: '#52b07c', 500: '#329462', 600: '#247650', 700: '#1d5d41', 800: '#174a35', 900: '#0f3425', 950: '#082016' },
    accent: { 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' },
  },
  {
    id: 'slate-emerald', name: 'Slate & Zamrud',
    navy: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617' },
    accent: { 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669' },
  },
  {
    id: 'indigo-violet', name: 'Indigo & Ungu',
    navy: { 50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#3730a3', 800: '#312e81', 900: '#1e1b4b', 950: '#13112f' },
    accent: { 300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed' },
  },
]

const channels = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`
}

/** Menerapkan tema ke seluruh situs lewat CSS variables (dibaca oleh tailwind.config.js). */
export function applyTheme(id?: string) {
  const t = THEMES.find((x) => x.id === id) ?? THEMES[0]
  const root = document.documentElement.style
  for (const s of NAVY_STEPS) root.setProperty(`--navy-${s}`, channels(t.navy[s]))
  for (const s of ACCENT_STEPS) root.setProperty(`--cyan-${s}`, channels(t.accent[s]))
}

/** Mengganti favicon; bila kosong, kembali ke favicon bawaan. */
export function applyFavicon(url?: string) {
  const el = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (!el) return
  if (el.dataset.origHref === undefined) {
    el.dataset.origHref = el.getAttribute('href') ?? ''
    el.dataset.origType = el.getAttribute('type') ?? ''
  }
  el.setAttribute('href', url || el.dataset.origHref)
  if (url) el.removeAttribute('type')
  else if (el.dataset.origType) el.setAttribute('type', el.dataset.origType)
}
