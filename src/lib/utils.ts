import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

const idDate = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })
const idDateShort = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' })
const idTime = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jakarta' })

export const formatDate = (iso?: string | null) => (iso ? idDate.format(new Date(iso)) : '-')
export const formatDateShort = (iso?: string | null) => (iso ? idDateShort.format(new Date(iso)) : '-')
export const formatTime = (iso?: string | null) => (iso ? `${idTime.format(new Date(iso)).replace(':', '.')} WIB` : '')

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
}

export const toList = (s?: string) => (s ? s.split('|').map((x) => x.trim()).filter(Boolean) : [])

/** Ubah ISO ke format input datetime-local (waktu lokal browser) */
export function toLocalInput(iso?: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

export function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message
  if (typeof e === 'object' && e && 'message' in e) return String((e as { message: unknown }).message)
  return 'Terjadi kesalahan. Silakan coba lagi.'
}

/** Aman untuk dipakai pada filter PostgREST .or()/.ilike() */
export const sanitizeSearch = (q: string) => q.replace(/[%,()*\\:"']/g, ' ').trim().slice(0, 80)
