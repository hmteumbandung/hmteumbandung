import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import { ArticleCard } from '@/components/cards'
import { Empty, ErrorBox, Img, Loading, PageHeader } from '@/components/ui'
import { api, useAsync } from '@/lib/api'
import { useSEO } from '@/lib/seo'
import { formatDate } from '@/lib/utils'

export default function NewsDetail() {
  const { slug = '' } = useParams()
  const { data: a, loading, error, reload } = useAsync(() => api.article(slug), [slug])
  const related = useAsync(() => api.articles({ limit: 12 }), [])

  useSEO({ title: a?.title ?? 'Berita', description: a?.excerpt ?? undefined, image: a?.thumbnail_url, type: 'article', noindex: !a && !loading })

  if (loading) return <><PageHeader title="Memuat..." /><Loading /></>
  if (error) return <><PageHeader title="Berita" /><div className="container-x section"><ErrorBox message={error} onRetry={reload} /></div></>
  if (!a) return <><PageHeader title="Artikel tidak ditemukan" crumbs={[{ label: 'Berita', to: '/berita' }]} /><div className="container-x section"><Empty text="Artikel tidak tersedia atau sudah dihapus." /></div></>

  // Rekomendasi: kategori sama diprioritaskan, lalu terbaru lainnya
  const others = (related.data ?? []).filter((r) => r.id !== a.id)
  const rec = [...others.filter((r) => r.category === a.category), ...others.filter((r) => r.category !== a.category)].slice(0, 3)

  return (
    <>
      <PageHeader title={a.title} crumbs={[{ label: 'Berita', to: '/berita' }, { label: a.category }]} />
      <div className="container-x section">
        <article className="mx-auto max-w-3xl">
          <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="badge">{a.category}</span>
            <span className="flex items-center gap-1.5"><User className="h-4 w-4" aria-hidden="true" />{a.author_name}</span>
            <time className="flex items-center gap-1.5" dateTime={a.published_at ?? undefined}><Calendar className="h-4 w-4" aria-hidden="true" />{formatDate(a.published_at)}</time>
          </div>
          <Img src={a.thumbnail_url} alt={`Gambar: ${a.title}`} className="mb-8 rounded-2xl" ratio="aspect-[16/9]" />
          {/* Konten dirender sebagai teks biasa per paragraf (bukan HTML) agar aman dari XSS */}
          <div className="prose-hmte text-base">
            {a.content.split(/\n{2,}/).map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)}
          </div>
          <Link to="/berita" className="btn-outline mt-8"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Kembali ke berita</Link>
        </article>
        {rec.length > 0 && (
          <section className="mt-16" aria-labelledby="rekomendasi">
            <h2 id="rekomendasi" className="mb-6 text-xl">Artikel lainnya</h2>
            <div className="grid gap-6 md:grid-cols-3">{rec.map((r) => <ArticleCard key={r.id} a={r} compact />)}</div>
          </section>
        )}
      </div>
    </>
  )
}
