export type AppRole = 'super_admin' | 'admin' | 'editor' | 'pengurus'

export const ROLE_LABEL: Record<AppRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  editor: 'Editor',
  pengurus: 'Pengurus',
}

export interface Profile {
  id: string
  full_name: string
  email: string | null
  role: AppRole
  is_active: boolean
  created_at: string
}

export type Settings = Record<string, string>

export interface Cabinet {
  id: string
  name: string
  period: string
  tagline: string | null
  logo_url: string | null
  philosophy: string | null
  vision: string | null
  mission: string[]
  is_current: boolean
}

export interface Department {
  id: string
  slug: string
  name: string
  description: string | null
  icon: string | null
  sort_order: number
}

export interface Member {
  id: string
  cabinet_id: string | null
  department_id: string | null
  full_name: string
  position: string
  level: 0 | 1 | 2 | 3
  photo_url: string | null
  bio: string | null
  instagram: string | null
  sort_order: number
}

export interface Program {
  id: string
  department_id: string | null
  title: string
  description: string | null
  is_featured: boolean
  status: 'planned' | 'ongoing' | 'done'
  year: number
}

export const ARTICLE_CATEGORIES = ['Organisasi', 'Akademik', 'Teknologi', 'Kegiatan', 'Pengumuman'] as const
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number]

export interface Article {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  category: ArticleCategory
  thumbnail_url: string | null
  author_name: string
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
}

export interface EventItem {
  id: string
  slug: string
  title: string
  description: string | null
  location: string | null
  starts_at: string
  ends_at: string | null
  poster_url: string | null
  registration_url: string | null
  is_published: boolean
}

export interface GalleryItem {
  id: string
  title: string
  image_url: string | null
  event_id: string | null
  department_id: string | null
  taken_at: string | null
}

export const ACADEMIC_CATEGORIES = [
  'Informasi Perkuliahan',
  'Materi Pembelajaran',
  'Referensi Buku',
  'Modul Praktikum',
  'Kompetisi',
  'Seminar & Webinar',
  'Beasiswa',
  'KP & Magang',
] as const
export type AcademicCategory = (typeof ACADEMIC_CATEGORIES)[number]

export interface AcademicItem {
  id: string
  category: AcademicCategory
  title: string
  description: string | null
  url: string | null
  deadline: string | null
  is_published: boolean
}

export type TicketType = 'aspirasi' | 'pengaduan' | 'konsultasi' | 'surat'
export type TicketStatus = 'diterima' | 'diproses' | 'selesai' | 'ditolak'

export const TICKET_TYPE_LABEL: Record<TicketType, string> = {
  aspirasi: 'Aspirasi',
  pengaduan: 'Pengaduan',
  konsultasi: 'Konsultasi Akademik',
  surat: 'Pengajuan Surat',
}

export interface Ticket {
  id: string
  ticket_no: string
  type: TicketType
  name: string
  nim: string | null
  email: string
  subject: string
  message: string
  extra: Record<string, unknown>
  status: TicketStatus
  admin_response: string | null
  created_at: string
  updated_at: string
}

export interface TicketTrack {
  ticket_no: string
  type: TicketType
  subject: string
  status: TicketStatus
  admin_response: string | null
  created_at: string
  updated_at: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  is_read: boolean
  created_at: string
}
