import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, FileText, Inbox, Ticket, Users, type LucideIcon } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { ROLE_LABEL } from '@/lib/types'

interface Stat { label: string; icon: LucideIcon; to: string; count: number | null }

export default function Dashboard() {
  const { profile, can } = useAuth()
  const [stats, setStats] = useState<Stat[]>([])

  useEffect(() => {
    if (!isSupabaseConfigured) return
    const staff = can(['super_admin', 'admin', 'pengurus'])
    const defs: { label: string; icon: LucideIcon; to: string; run: () => PromiseLike<{ count: number | null }> }[] = [
      { label: 'Artikel', icon: FileText, to: '/admin/berita', run: () => supabase.from('articles').select('id', { count: 'exact', head: true }) },
      { label: 'Agenda kegiatan', icon: CalendarDays, to: '/admin/agenda', run: () => supabase.from('events').select('id', { count: 'exact', head: true }) },
      { label: 'Pengurus', icon: Users, to: '/admin/pengurus', run: () => supabase.from('members').select('id', { count: 'exact', head: true }) },
      ...(staff ? [
        { label: 'Tiket belum selesai', icon: Ticket, to: '/admin/tiket', run: () => supabase.from('tickets').select('id', { count: 'exact', head: true }).in('status', ['diterima', 'diproses']) },
        { label: 'Pesan belum dibaca', icon: Inbox, to: '/admin/pesan', run: () => supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('is_read', false) },
      ] : []),
    ]
    let alive = true
    void Promise.all(defs.map(async (d) => ({ label: d.label, icon: d.icon, to: d.to, count: (await d.run()).count }))).then((r) => alive && setStats(r))
    return () => { alive = false }
  }, [can])

  return (
    <div>
      <h1 className="text-2xl">Selamat datang, {profile?.full_name || 'Pengurus'}</h1>
      <p className="mt-1 text-sm text-slate-500">Anda masuk sebagai {profile ? ROLE_LABEL[profile.role] : '-'}.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="card p-5 transition hover:border-cyan-500">
            <s.icon className="h-5 w-5 text-cyan-600" aria-hidden="true" />
            <p className="mt-3 text-3xl font-extrabold text-navy-900">{s.count ?? '-'}</p>
            <p className="text-sm text-slate-500">{s.label}</p>
          </Link>
        ))}
      </div>
      <div className="card mt-8 p-6 text-sm text-slate-600">
        <h2 className="mb-2 text-base">Panduan singkat</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Angka statistik di beranda diubah pada menu <strong>Pengaturan Situs</strong> (khusus Admin).</li>
          <li>Artikel berstatus <em>Draf</em> tidak tampil di website sampai diterbitkan.</li>
          <li>Tindak lanjut aspirasi dan pengaduan dilakukan pada menu <strong>Aspirasi &amp; Pengaduan</strong>.</li>
        </ul>
      </div>
    </div>
  )
}
