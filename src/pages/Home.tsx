import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Calendar } from 'lucide-react'
import { HeroCircuit } from '@/components/HeroCircuit'
import { ArticleCard, Avatar, DeptIcon, NamedIcon } from '@/components/cards'
import { Empty, ErrorBox, Img, Loading, Reveal, SectionHeading } from '@/components/ui'
import { api, useAsync } from '@/lib/api'
import { useSettings } from '@/lib/settings'
import { useSEO } from '@/lib/seo'
import { formatDateShort } from '@/lib/utils'

function Counter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!inView) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(value)
      return
    }
    const start = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min((t - start) / 1200, 1)
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value])
  return <span ref={ref}>{n}</span>
}

function Hero() {
  const s = useSettings()
  return (
    <section className="relative overflow-hidden bg-navy-950 text-white">
      <div className="grid-bg absolute inset-0" aria-hidden="true" />
      <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl" aria-hidden="true" />
      <div className="container-x relative grid items-center gap-10 pb-20 pt-32 lg:grid-cols-2 lg:pb-28 lg:pt-40">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
            Himpunan Mahasiswa Teknik Elektro &middot; UM Bandung
          </p>
          <h1 className="text-4xl font-extrabold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
            {s.ui_hero_title ? s.ui_hero_title : <>INOVASI, <span className="text-cyan-400">KOLABORASI,</span> DAN KONTRIBUSI</>}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-navy-200">
            {s.ui_hero_subtitle || 'Wadah pengembangan potensi, kreativitas, dan intelektualitas mahasiswa Teknik Elektro Universitas Muhammadiyah Bandung.'}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/tentang" className="btn-primary">{s.ui_hero_btn1 || 'Mengenal HMTE'} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <Link to="/kegiatan" className="btn-ghost-light">{s.ui_hero_btn2 || 'Jelajahi Kegiatan'}</Link>
          </div>
        </motion.div>
        <motion.div className="mx-auto w-full max-w-md lg:max-w-none" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.15 }}>
          {s.ui_hero_image ? (
            <img src={s.ui_hero_image} alt="Visual utama HMTE" className="aspect-[4/3] w-full rounded-2xl border border-white/10 object-cover shadow-glow" />
          ) : (
            <HeroCircuit />
          )}
        </motion.div>
      </div>
    </section>
  )
}

function About() {
  const s = useSettings()
  return (
    <section className="section">
      <div className="container-x grid items-center gap-10 lg:grid-cols-2">
        <Reveal>
          <SectionHeading eyebrow="Tentang HMTE" title="Organisasi keilmuan yang tumbuh bersama mahasiswa" />
          <p className="-mt-4 leading-relaxed text-slate-600">{s.about_short}</p>
          <Link to="/tentang" className="btn-dark mt-6">Lihat profil lengkap <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </Reveal>
        <Reveal delay={0.1} className="grid grid-cols-3 gap-3">
          {[['Inovasi', 'Layers'], ['Kolaborasi', 'Users'], ['Kontribusi', 'Award']].map(([title, icon], i) => (
            <div key={i} className="card p-5 text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-cyan-300">
                <NamedIcon name={s[`ui_pillar${i + 1}_icon`] || icon} className="h-5 w-5" />
              </div>
              <p className="text-sm font-bold text-navy-900">{s[`ui_pillar${i + 1}_title`] || title}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

function Stats() {
  const s = useSettings()
  const items = [
    { label: 'Anggota', v: s.stat_members }, { label: 'Pengurus', v: s.stat_pengurus },
    { label: 'Program Kerja', v: s.stat_programs }, { label: 'Kegiatan', v: s.stat_events },
  ]
  return (
    <section className="bg-navy-900 py-14 text-white" aria-label="Statistik organisasi">
      <div className="container-x grid grid-cols-2 gap-6 text-center lg:grid-cols-4">
        {items.map((i) => (
          <div key={i.label}>
            <p className="text-4xl font-extrabold text-cyan-400 sm:text-5xl"><Counter value={Number(i.v) || 0} />+</p>
            <p className="mt-1 text-sm text-navy-200">{i.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function CabinetSection() {
  const cab = useAsync(() => api.currentCabinet(), [])
  const mem = useAsync(() => api.members(), [])
  const ketum = mem.data?.find((m) => m.level === 0)
  if (!cab.data) return null
  return (
    <section className="section bg-slate-50">
      <div className="container-x grid items-center gap-10 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <SectionHeading eyebrow={`Kabinet Saat Ini · ${cab.data.period}`} title={cab.data.name} desc={cab.data.tagline ?? undefined} />
          <p className="-mt-4 leading-relaxed text-slate-600">{cab.data.philosophy}</p>
          <Link to="/kabinet" className="btn-dark mt-6">Lihat struktur kabinet <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </Reveal>
        {ketum && (
          <Reveal delay={0.1} className="lg:col-span-2">
            <div className="card overflow-hidden text-center">
              <div className="bg-gradient-to-br from-navy-800 to-navy-950 px-6 pb-12 pt-8"><Avatar member={ketum} className="mx-auto h-28 w-28 border-4 border-cyan-400/60 text-3xl" /></div>
              <div className="-mt-6 px-6 pb-6">
                <span className="badge bg-white shadow">{ketum.position}</span>
                <h3 className="mt-3 text-xl">{ketum.full_name}</h3>
                {ketum.bio && <p className="mt-2 line-clamp-3 text-sm text-slate-600">{ketum.bio}</p>}
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}

function Programs() {
  const progs = useAsync(() => api.programs(), [])
  const depts = useAsync(() => api.departments(), [])
  const featured = (progs.data ?? []).filter((p) => p.is_featured)
  return (
    <section className="section">
      <div className="container-x">
        <SectionHeading eyebrow="Program Unggulan" title="Karya nyata dari setiap departemen" align="center" />
        {(progs.loading || depts.loading) && <Loading />}
        {progs.error && <ErrorBox message={progs.error} onRetry={progs.reload} />}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => {
            const d = depts.data?.find((x) => x.id === p.department_id)
            return (
              <Reveal key={p.id} delay={(i % 3) * 0.07}>
                <div className="card h-full p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-cyan-300"><DeptIcon name={d?.icon} className="h-5 w-5" /></div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-cyan-600">{d?.name}</p>
                  <h3 className="mt-1 text-lg">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.description}</p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function LatestNews() {
  const { data, loading, error, reload } = useAsync(() => api.articles({ limit: 3 }), [])
  return (
    <section className="section bg-slate-50">
      <div className="container-x">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <SectionHeading eyebrow="Berita Terbaru" title="Kabar terkini dari HMTE" />
          <Link to="/berita" className="btn-outline mb-10">Semua berita <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
        {loading && <Loading />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {data && (data.length ? <div className="grid gap-6 md:grid-cols-3">{data.map((a) => <ArticleCard key={a.id} a={a} />)}</div> : <Empty text="Belum ada berita." />)}
      </div>
    </section>
  )
}

function Gallery() {
  const { data, loading, error, reload } = useAsync(() => api.gallery(6), [])
  return (
    <section className="section">
      <div className="container-x">
        <SectionHeading eyebrow="Dokumentasi" title="Jejak kegiatan HMTE" align="center" />
        {loading && <Loading />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {data && (data.length ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {data.map((g) => (
              <figure key={g.id} className="group relative overflow-hidden rounded-2xl">
                <Img src={g.image_url} alt={g.title} ratio="aspect-[4/3]" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/90 to-transparent p-3 text-xs text-white sm:text-sm">
                  <span className="font-semibold">{g.title}</span>
                  <span className="mt-0.5 flex items-center gap-1 text-navy-200"><Calendar className="h-3 w-3" aria-hidden="true" />{formatDateShort(g.taken_at)}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : <Empty text="Dokumentasi belum tersedia." />)}
      </div>
    </section>
  )
}

export default function Home() {
  useSEO({})
  return (
    <>
      <Hero />
      <About />
      <Stats />
      <CabinetSection />
      <Programs />
      <LatestNews />
      <Gallery />
    </>
  )
}
