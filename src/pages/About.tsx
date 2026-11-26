import { Compass, Flag, History, Info, Palette, Target } from 'lucide-react'
import { PageHeader, Reveal } from '@/components/ui'
import { LogoMark } from '@/components/Logo'
import { useSettings } from '@/lib/settings'
import { useSEO } from '@/lib/seo'
import { toList } from '@/lib/utils'

export default function About() {
  const s = useSettings()
  useSEO({ title: 'Tentang Kami', description: s.about_short })
  const List = ({ items }: { items: string[] }) => (
    <ol className="mt-3 space-y-2">
      {items.map((m, i) => (
        <li key={m} className="flex gap-3 text-slate-600">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-cyan-300">{i + 1}</span>
          {m}
        </li>
      ))}
    </ol>
  )
  return (
    <>
      <PageHeader title="Tentang Kami" desc="Mengenal sejarah, visi, misi, dan identitas Himpunan Mahasiswa Teknik Elektro UM Bandung." crumbs={[{ label: 'Tentang Kami' }]} />
      <div className="container-x section space-y-8">
        <Reveal>
          <section className="card p-6 sm:p-8" aria-labelledby="sejarah">
            <h2 id="sejarah" className="flex items-center gap-2 text-xl"><History className="h-5 w-5 text-cyan-600" aria-hidden="true" /> Sejarah HMTE</h2>
            <p className="mt-3 leading-relaxed text-slate-600">{s.history}</p>
          </section>
        </Reveal>
        <Reveal>
          <section className="card p-6 sm:p-8" aria-labelledby="profil">
            <h2 id="profil" className="flex items-center gap-2 text-xl"><Info className="h-5 w-5 text-cyan-600" aria-hidden="true" /> Profil Organisasi</h2>
            <p className="mt-3 leading-relaxed text-slate-600">{s.about_short}</p>
          </section>
        </Reveal>
        <div className="grid gap-8 lg:grid-cols-2">
          <Reveal>
            <section className="card h-full p-6 sm:p-8" aria-labelledby="visi">
              <h2 id="visi" className="flex items-center gap-2 text-xl"><Compass className="h-5 w-5 text-cyan-600" aria-hidden="true" /> Visi</h2>
              <p className="mt-3 leading-relaxed text-slate-600">{s.vision}</p>
            </section>
          </Reveal>
          <Reveal delay={0.08}>
            <section className="card h-full p-6 sm:p-8" aria-labelledby="misi">
              <h2 id="misi" className="flex items-center gap-2 text-xl"><Flag className="h-5 w-5 text-cyan-600" aria-hidden="true" /> Misi</h2>
              <List items={toList(s.mission)} />
            </section>
          </Reveal>
        </div>
        <Reveal>
          <section className="card p-6 sm:p-8" aria-labelledby="tujuan">
            <h2 id="tujuan" className="flex items-center gap-2 text-xl"><Target className="h-5 w-5 text-cyan-600" aria-hidden="true" /> Tujuan Organisasi</h2>
            <List items={toList(s.goals)} />
          </section>
        </Reveal>
        <Reveal>
          <section className="card flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8" aria-labelledby="logo">
            <LogoMark className="h-24 w-24 shrink-0" />
            <div>
              <h2 id="logo" className="flex items-center gap-2 text-xl"><Palette className="h-5 w-5 text-cyan-600" aria-hidden="true" /> Identitas dan Filosofi Logo</h2>
              <p className="mt-3 leading-relaxed text-slate-600">{s.logo_philosophy}</p>
            </div>
          </section>
        </Reveal>
        <Reveal>
          <section className="rounded-2xl bg-navy-900 p-6 text-navy-100 sm:p-8" aria-labelledby="info">
            <h2 id="info" className="text-xl text-white">Informasi Keorganisasian</h2>
            <p className="mt-3 leading-relaxed">{s.org_info}</p>
          </section>
        </Reveal>
      </div>
    </>
  )
}
