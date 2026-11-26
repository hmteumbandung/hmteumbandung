import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** true bila variabel lingkungan Supabase sudah diisi. Bila false, situs berjalan dalam MODE DEMO. */
export const isSupabaseConfigured = Boolean(url && anon && !url.includes('xxxxxxxx'))

// Hanya anon key yang dipakai di frontend. Keamanan data dijaga oleh RLS di database.
export const supabase = createClient(
  isSupabaseConfigured ? (url as string) : 'http://localhost:54321',
  isSupabaseConfigured ? (anon as string) : 'public-anon-key-placeholder',
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } },
)

export const MEDIA_BUCKET = 'media'
