import { useState } from 'react'
import { Link, NavLink, Navigate, Outlet } from 'react-router-dom'
import {
  Building2, CalendarDays, FileText, GraduationCap, Home, Image, Inbox, LayoutDashboard, ListChecks, LogOut, Menu, Network, Palette, Settings, Ticket, UserCog, Users, X,
} from 'lucide-react'
import { LogoMark } from '@/components/Logo'
import { Loading } from '@/components/ui'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { ROLE_LABEL, type AppRole } from '@/lib/types'

const ALL: AppRole[] = ['super_admin', 'admin', 'editor', 'pengurus']
const STAFF: AppRole[] = ['super_admin', 'admin', 'pengurus']
const ADMINS: AppRole[] = ['super_admin', 'admin']

const MENU = [
  { to: '/admin', label: 'Ringkasan', icon: LayoutDashboard, roles: ALL, end: true },
  { to: '/admin/berita', label: 'Berita', icon: FileText, roles: ALL },
  { to: '/admin/agenda', label: 'Agenda Kegiatan', icon: CalendarDays, roles: ALL },
  { to: '/admin/galeri', label: 'Galeri', icon: Image, roles: ALL },
  { to: '/admin/akademik', label: 'Akademik', icon: GraduationCap, roles: ALL },
  { to: '/admin/proker', label: 'Program Kerja', icon: ListChecks, roles: ALL },
  { to: '/admin/departemen', label: 'Departemen', icon: Building2, roles: ALL },
  { to: '/admin/kabinet', label: 'Kabinet', icon: Network, roles: ALL },
  { to: '/admin/pengurus', label: 'Pengurus', icon: Users, roles: ALL },
  { to: '/admin/tiket', label: 'Aspirasi & Pengaduan', icon: Ticket, roles: STAFF },
  { to: '/admin/pesan', label: 'Pesan Masuk', icon: Inbox, roles: STAFF },
  { to: '/admin/pengguna', label: 'Pengguna', icon: UserCog, roles: ['super_admin'] as AppRole[] },
  { to: '/admin/tampilan', label: 'Tampilan Situs', icon: Palette, roles: ADMINS },
  { to: '/admin/pengaturan', label: 'Pengaturan Situs', icon: Settings, roles: ADMINS },
]

export function AdminLayout() {
  const { session, profile, loading, can, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  if (loading) return <Loading />
  if (!session) return <Navigate to="/admin/login" replace />
  if (!profile || !profile.is_active) return <Navigate to="/admin/login" replace />

  const nav = (
    <nav aria-label="Menu admin" className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
      {MENU.filter((m) => can(m.roles)).map((m) => (
        <NavLink key={m.to} to={m.to} end={m.end} onClick={() => setOpen(false)}
          className={({ isActive }) => cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium', isActive ? 'bg-cyan-500/15 text-cyan-300' : 'text-navy-100 hover:bg-white/5')}>
          <m.icon className="h-4 w-4" aria-hidden="true" /> {m.label}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className="hidden w-64 shrink-0 flex-col bg-navy-950 lg:flex">
        <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-4"><LogoMark /><span className="font-extrabold text-white">Admin HMTE</span></div>
        {nav}
      </aside>
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <aside className="flex w-64 flex-col bg-navy-950">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><span className="font-extrabold text-white">Admin HMTE</span><button onClick={() => setOpen(false)} aria-label="Tutup menu" className="text-white"><X className="h-5 w-5" /></button></div>
            {nav}
          </aside>
          <button className="flex-1 bg-navy-950/60" onClick={() => setOpen(false)} aria-label="Tutup menu" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <button className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(true)} aria-label="Buka menu"><Menu className="h-5 w-5" /></button>
          <Link to="/" className="hidden items-center gap-1.5 text-sm text-slate-500 hover:text-cyan-600 lg:flex"><Home className="h-4 w-4" aria-hidden="true" /> Lihat website</Link>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right leading-tight"><p className="text-sm font-semibold text-navy-900">{profile.full_name || profile.email}</p><p className="text-xs text-cyan-600">{ROLE_LABEL[profile.role]}</p></div>
            <button className="btn-outline btn-sm" onClick={() => void signOut()}><LogOut className="h-4 w-4" aria-hidden="true" /> Keluar</button>
          </div>
        </header>
        <main className="p-4 sm:p-6"><Outlet /></main>
      </div>
    </div>
  )
}
