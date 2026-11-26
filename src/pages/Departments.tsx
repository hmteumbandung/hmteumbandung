import { Link, useParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Avatar, DeptIcon } from '@/components/cards'
import { Empty, ErrorBox, Img, Loading, PageHeader, Reveal } from '@/components/ui'
import { api, useAsync } from '@/lib/api'
import { useSEO } from '@/lib/seo'
import { formatDateShort } from '@/lib/utils'

const STATUS = { planned: 'Direncanakan', ongoing: 'Berjalan', done: 'Selesai' } as const

export default function Departments() {
  const { slug } = useParams()
  const dep = useAsync(() => api.departments(), [])
  const mem = useAsync(() => api.members(), [])
  const prog = useAsync(() => api.programs(), [])
  const gal = useAsync(() => api.gallery(), [])
  const current = slug ? dep.data?.find((d) => d.slug === slug) : undefined

  useSEO({
    title: current ? current.name : 'Departemen',
    description: current?.description ?? 'Departemen dan divisi HMTE UM Bandung beserta program kerjanya.',
  })

  const loading = dep.loading || mem.loading || prog.loading
  const error = dep.error || mem.error || prog.error

  if (slug && !loading && dep.data && !current) {
    return (
      <>
        <PageHeader title="Departemen tidak ditemukan" crumbs={[{ label: 'Departemen', to: '/departemen' }]} />
        <div className="container-x section"><Empty text="Departemen yang Anda cari tidak tersedia." /></div>
      </>
    )
  }

  if (current) {
    const members = (mem.data ?? []).filter((m) => m.department_id === current.id)
    const head = members.find((m) => m.level === 2)
    const staff = members.filter((m) => m.level !== 2)
    const programs = (prog.data ?? []).filter((p) => p.department_id === current.id)
    const photos = (gal.data ?? []).filter((g) => g.department_id === current.id)
    return (
      <>
        <PageHeader title={current.name} desc={current.description ?? undefined} crumbs={[{ label: 'Departemen', to: '/departemen' }, { label: current.name }]} />
        <div className="container-x section space-y-12">
          <section aria-labelledby="kadep">
            <h2 id="kadep" className="mb-4 text-xl">Kepala Departemen</h2>
            {head ? (
              <div className="card flex items-center gap-4 p-5 sm:max-w-md">
                <Avatar member={head} className="h-16 w-16 text-xl" />
                <div><p className="font-bold text-navy-900">{head.full_name}</p><p className="text-sm text-slate-500">{head.position}</p></div>
              </div>
            ) : <Empty text="Belum ada kepala departemen." />}
          </section>
          <section aria-labelledby="anggota">
            <h2 id="anggota" className="mb-4 text-xl">Anggota</h2>
            {staff.length ? (
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {staff.map((m) => (
                  <li key={m.id} className="card flex items-center gap-3 p-4">
                    <Avatar member={m} className="h-11 w-11 text-sm" />
                    <div className="min-w-0"><p className="truncate text-sm font-semibold text-navy-900">{m.full_name}</p><p className="truncate text-xs text-slate-500">{m.position}</p></div>
                  </li>
                ))}
              </ul>
            ) : <Empty text="Belum ada anggota terdaftar." />}
          </section>
          <section aria-labelledby="proker">
            <h2 id="proker" className="mb-4 text-xl">Program Kerja</h2>
            {programs.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {programs.map((p) => (
                  <div key={p.id} className="card p-5">
                    <div className="mb-2 flex items-center gap-2"><span className="badge">{STATUS[p.status]}</span><span className="text-xs text-slate-500">{p.year}</span></div>
                    <h3 className="text-base">{p.title}</h3>
                    <p className="mt-1.5 text-sm text-slate-600">{p.description}</p>
                  </div>
                ))}
              </div>
            ) : <Empty text="Belum ada program kerja." />}
          </section>
          <section aria-labelledby="dok">
            <h2 id="dok" className="mb-4 text-xl">Dokumentasi Kegiatan</h2>
            {photos.length ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {photos.map((g) => (
                  <figure key={g.id}><Img src={g.image_url} alt={g.title} ratio="aspect-[4/3]" className="rounded-xl" /><figcaption className="mt-1.5 text-xs text-slate-600">{g.title} &middot; {formatDateShort(g.taken_at)}</figcaption></figure>
                ))}
              </div>
            ) : <Empty text="Dokumentasi departemen ini belum tersedia." />}
          </section>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Departemen" desc="Enam departemen yang menjalankan roda organisasi HMTE." crumbs={[{ label: 'Departemen' }]} />
      <div className="container-x section">
        {loading && <Loading />}
        {error && <ErrorBox message={error} onRetry={() => { dep.reload(); mem.reload(); prog.reload() }} />}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(dep.data ?? []).map((d, i) => {
            const head = mem.data?.find((m) => m.department_id === d.id && m.level === 2)
            const count = prog.data?.filter((p) => p.department_id === d.id).length ?? 0
            return (
              <Reveal key={d.id} delay={(i % 3) * 0.07}>
                <Link to={`/departemen/${d.slug}`} className="card group flex h-full flex-col p-6 transition hover:border-cyan-500 hover:shadow-glow">
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-cyan-300"><DeptIcon name={d.icon} className="h-6 w-6" /></span>
                  <h2 className="text-lg group-hover:text-cyan-600">{d.name}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{d.description}</p>
                  <p className="mt-4 text-xs text-slate-500">{head ? `Kepala: ${head.full_name} · ` : ''}{count} program kerja</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-cyan-600">Lihat detail <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" /></span>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </div>
    </>
  )
}
