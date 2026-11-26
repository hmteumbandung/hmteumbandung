import { useCallback, useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from './supabase'
import { sanitizeSearch } from './utils'
import type {
  AcademicItem, Article, Cabinet, Department, EventItem, GalleryItem, Member, Program,
  Settings, TicketTrack, TicketType,
} from './types'
import {
  demoAcademic, demoArticles, demoCabinet, demoDepartments, demoEvents, demoGallery,
  demoMembers, demoPrograms, demoSettings,
} from '@/data/demo'

/** Hook generik untuk memuat data async dengan status loading/error dan reload. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    fn()
      .then((d) => alive && setData(d))
      .catch((e: unknown) => alive && setError(e instanceof Error ? e.message : 'Gagal memuat data'))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  return { data, loading, error, reload }
}

const rows = <T,>({ data, error }: { data: T[] | null; error: { message: string } | null }) => {
  if (error) throw new Error(error.message)
  return data ?? []
}

export const api = {
  async settings(): Promise<Settings> {
    if (!isSupabaseConfigured) return demoSettings
    const list = rows(await supabase.from('site_settings').select('key,value'))
    return { ...demoSettings, ...Object.fromEntries(list.map((r) => [r.key as string, r.value as string])) }
  },

  async currentCabinet(): Promise<Cabinet | null> {
    if (!isSupabaseConfigured) return demoCabinet
    const { data, error } = await supabase.from('cabinets').select('*').eq('is_current', true).maybeSingle()
    if (error) throw new Error(error.message)
    return data as Cabinet | null
  },

  async departments(): Promise<Department[]> {
    if (!isSupabaseConfigured) return demoDepartments
    return rows(await supabase.from('departments').select('*').order('sort_order')) as Department[]
  },

  async members(): Promise<Member[]> {
    if (!isSupabaseConfigured) return demoMembers
    const cab = await api.currentCabinet()
    let q = supabase.from('members').select('*').order('level').order('sort_order')
    if (cab) q = q.eq('cabinet_id', cab.id)
    return rows(await q) as Member[]
  },

  async programs(): Promise<Program[]> {
    if (!isSupabaseConfigured) return demoPrograms
    return rows(await supabase.from('programs').select('*').order('year', { ascending: false }).order('created_at')) as Program[]
  },

  async articles(opts: { category?: string; q?: string; limit?: number } = {}): Promise<Article[]> {
    const { category, q, limit } = opts
    if (!isSupabaseConfigured) {
      const term = (q ?? '').toLowerCase()
      return demoArticles
        .filter((a) => (!category || a.category === category) &&
          (!term || a.title.toLowerCase().includes(term) || (a.excerpt ?? '').toLowerCase().includes(term)))
        .sort((a, b) => +new Date(b.published_at!) - +new Date(a.published_at!))
        .slice(0, limit ?? 100)
    }
    let query = supabase.from('articles').select('*').eq('status', 'published')
      .lte('published_at', new Date().toISOString()).order('published_at', { ascending: false })
    if (category) query = query.eq('category', category)
    const term = sanitizeSearch(q ?? '')
    if (term) query = query.or(`title.ilike.%${term}%,excerpt.ilike.%${term}%`)
    if (limit) query = query.limit(limit)
    return rows(await query) as Article[]
  },

  async article(slug: string): Promise<Article | null> {
    if (!isSupabaseConfigured) return demoArticles.find((a) => a.slug === slug) ?? null
    const { data, error } = await supabase.from('articles').select('*').eq('slug', slug).eq('status', 'published').maybeSingle()
    if (error) throw new Error(error.message)
    return data as Article | null
  },

  async events(): Promise<EventItem[]> {
    if (!isSupabaseConfigured) return [...demoEvents].sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at))
    return rows(await supabase.from('events').select('*').eq('is_published', true).order('starts_at')) as EventItem[]
  },

  async gallery(limit?: number): Promise<GalleryItem[]> {
    if (!isSupabaseConfigured) return demoGallery.slice(0, limit ?? 100)
    let q = supabase.from('gallery').select('*').order('taken_at', { ascending: false })
    if (limit) q = q.limit(limit)
    return rows(await q) as GalleryItem[]
  },

  async academic(): Promise<AcademicItem[]> {
    if (!isSupabaseConfigured) return demoAcademic
    return rows(await supabase.from('academic_items').select('*').eq('is_published', true).order('created_at', { ascending: false })) as AcademicItem[]
  },

  // ---- Layanan & kontak: lewat RPC server-side (tabel tidak dibuka ke publik) ----
  async submitTicket(input: {
    type: TicketType; name: string; nim?: string; email: string; subject: string; message: string; extra?: Record<string, string>
  }): Promise<string> {
    if (!isSupabaseConfigured) return demoSubmit(input)
    const { data, error } = await supabase.rpc('submit_ticket', {
      p_type: input.type, p_name: input.name, p_nim: input.nim ?? '', p_email: input.email,
      p_subject: input.subject, p_message: input.message, p_extra: input.extra ?? {},
    })
    if (error) throw new Error(error.message)
    return data as string
  },

  async trackTicket(ticketNo: string, email: string): Promise<TicketTrack | null> {
    if (!isSupabaseConfigured) return demoTrack(ticketNo, email)
    const { data, error } = await supabase.rpc('track_ticket', { p_ticket_no: ticketNo, p_email: email })
    if (error) throw new Error(error.message)
    return ((data as TicketTrack[] | null) ?? [])[0] ?? null
  },

  async submitMessage(input: { name: string; email: string; subject: string; message: string }): Promise<void> {
    if (!isSupabaseConfigured) return
    const { error } = await supabase.rpc('submit_message', {
      p_name: input.name, p_email: input.email, p_subject: input.subject, p_message: input.message,
    })
    if (error) throw new Error(error.message)
  },
}

// ---- Mode demo untuk tiket (disimpan di localStorage browser, hanya untuk pratinjau) ----
const DEMO_KEY = 'hmte-demo-tickets'
type DemoTicket = TicketTrack & { email: string }

function demoRead(): DemoTicket[] {
  try { return JSON.parse(localStorage.getItem(DEMO_KEY) ?? '[]') as DemoTicket[] } catch { return [] }
}

function demoSubmit(input: { type: TicketType; email: string; subject: string }): string {
  const d = new Date()
  const no = `HMTE-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
  const now = d.toISOString()
  const list = demoRead()
  list.push({ ticket_no: no, type: input.type, subject: input.subject, status: 'diterima', admin_response: null, created_at: now, updated_at: now, email: input.email.toLowerCase() })
  try { localStorage.setItem(DEMO_KEY, JSON.stringify(list)) } catch { /* abaikan */ }
  return no
}

function demoTrack(no: string, email: string): TicketTrack | null {
  const t = demoRead().find((x) => x.ticket_no.toUpperCase() === no.trim().toUpperCase() && x.email === email.trim().toLowerCase())
  if (!t) return null
  const { email: _e, ...rest } = t
  return rest
}
