import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { ArticleCard } from '@/components/cards'
import { Empty, ErrorBox, Loading, PageHeader } from '@/components/ui'
import { api, useAsync } from '@/lib/api'
import { useSEO } from '@/lib/seo'
import { cn } from '@/lib/utils'
import { ARTICLE_CATEGORIES } from '@/lib/types'

export default function News() {
  useSEO({ title: 'Berita dan Artikel', description: 'Berita, pengumuman, dan artikel terbaru dari HMTE UM Bandung.' })
  const [q, setQ] = useState('')
  const [term, setTerm] = useState('')
  const [cat, setCat] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setTerm(q), 300)
    return () => clearTimeout(t)
  }, [q])

  const { data, loading, error, reload } = useAsync(() => api.articles({ category: cat || undefined, q: term }), [cat, term])

  return (
    <>
      <PageHeader title="Berita dan Artikel" desc="Informasi terbaru seputar organisasi, akademik, dan teknologi." crumbs={[{ label: 'Berita' }]} />
      <div className="container-x section">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter kategori">
            {['', ...ARTICLE_CATEGORIES].map((c) => (
              <button key={c || 'all'} onClick={() => setCat(c)} aria-pressed={cat === c}
                className={cn('rounded-full border px-4 py-1.5 text-sm font-medium transition', cat === c ? 'border-navy-900 bg-navy-900 text-white' : 'border-slate-300 bg-white text-slate-600 hover:border-cyan-500')}>
                {c || 'Semua'}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input className="input pl-9" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari artikel..." aria-label="Cari artikel" maxLength={80} />
          </div>
        </div>
        {loading && <Loading />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {data && (data.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{data.map((a) => <ArticleCard key={a.id} a={a} />)}</div>
        ) : <Empty text="Tidak ada artikel yang cocok dengan pencarian Anda." />)}
      </div>
    </>
  )
}
