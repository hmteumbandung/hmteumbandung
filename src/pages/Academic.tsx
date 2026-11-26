import { useMemo, useState } from 'react'
import { BookOpen, Briefcase, Calendar, ExternalLink, FileText, GraduationCap, Mic, Search, Trophy, Award, type LucideIcon } from 'lucide-react'
import { Empty, ErrorBox, Loading, PageHeader } from '@/components/ui'
import { api, useAsync } from '@/lib/api'
import { useSEO } from '@/lib/seo'
import { cn, formatDate } from '@/lib/utils'
import { ACADEMIC_CATEGORIES, type AcademicCategory } from '@/lib/types'

const ICON: Record<AcademicCategory, LucideIcon> = {
  'Informasi Perkuliahan': GraduationCap, 'Materi Pembelajaran': FileText, 'Referensi Buku': BookOpen, 'Modul Praktikum': FileText,
  Kompetisi: Trophy, 'Seminar & Webinar': Mic, Beasiswa: Award, 'KP & Magang': Briefcase,
}

export default function Academic() {
  useSEO({ title: 'Akademik', description: 'Pusat informasi akademik mahasiswa Teknik Elektro: materi, modul praktikum, kompetisi, beasiswa, dan magang.' })
  const { data, loading, error, reload } = useAsync(() => api.academic(), [])
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string>('')

  const items = useMemo(() => {
    const t = q.trim().toLowerCase()
    return (data ?? []).filter((i) => (!cat || i.category === cat) && (!t || `${i.title} ${i.description ?? ''}`.toLowerCase().includes(t)))
  }, [data, q, cat])

  return (
    <>
      <PageHeader title="Akademik" desc="Pusat informasi perkuliahan, pembelajaran, dan pengembangan karier mahasiswa Teknik Elektro." crumbs={[{ label: 'Akademik' }]} />
      <div className="container-x section">
        <div className="relative mb-5 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input className="input pl-9" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari informasi akademik..." aria-label="Cari informasi akademik" maxLength={80} />
        </div>
        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter kategori">
          {['', ...ACADEMIC_CATEGORIES].map((c) => (
            <button key={c || 'all'} onClick={() => setCat(c)} aria-pressed={cat === c}
              className={cn('rounded-full border px-4 py-1.5 text-sm font-medium transition', cat === c ? 'border-navy-900 bg-navy-900 text-white' : 'border-slate-300 bg-white text-slate-600 hover:border-cyan-500')}>
              {c || 'Semua'}
            </button>
          ))}
        </div>
        {loading && <Loading />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {data && (items.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((i) => {
              const Icon = ICON[i.category] ?? FileText
              return (
                <article key={i.id} className="card flex flex-col p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900 text-cyan-300"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                    <span className="badge">{i.category}</span>
                  </div>
                  <h2 className="text-base leading-snug">{i.title}</h2>
                  <p className="mt-2 flex-1 text-sm text-slate-600">{i.description}</p>
                  {i.deadline && <p className="mt-3 flex items-center gap-1.5 text-xs text-amber-700"><Calendar className="h-3.5 w-3.5" aria-hidden="true" />Batas: {formatDate(i.deadline)}</p>}
                  {i.url && <a href={i.url} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm mt-4 self-start">Buka tautan <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>}
                </article>
              )
            })}
          </div>
        ) : <Empty text="Tidak ada informasi yang cocok." />)}
      </div>
    </>
  )
}
