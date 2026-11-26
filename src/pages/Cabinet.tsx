import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Instagram } from 'lucide-react'
import { Avatar, DeptIcon } from '@/components/cards'
import { ErrorBox, Loading, Modal, PageHeader, Reveal, SectionHeading } from '@/components/ui'
import { LogoMark } from '@/components/Logo'
import { api, useAsync } from '@/lib/api'
import { useSEO } from '@/lib/seo'
import { cn } from '@/lib/utils'
import type { Member } from '@/lib/types'

function MemberNode({ m, onOpen, big }: { m: Member; onOpen: (m: Member) => void; big?: boolean }) {
  return (
    <button onClick={() => onOpen(m)} className={cn('card group flex flex-col items-center p-4 text-center transition hover:border-cyan-500 hover:shadow-glow', big ? 'w-64' : 'w-48')} aria-label={`Lihat profil ${m.full_name}, ${m.position}`}>
      <Avatar member={m} className={cn('mb-3 border-2 border-cyan-400/50', big ? 'h-20 w-20 text-2xl' : 'h-14 w-14 text-base')} />
      <span className="text-sm font-bold text-navy-900">{m.full_name}</span>
      <span className="mt-0.5 text-xs text-slate-500">{m.position}</span>
    </button>
  )
}

const Connector = () => <div className="mx-auto h-8 w-px bg-gradient-to-b from-cyan-400 to-navy-300" aria-hidden="true" />

export default function Cabinet() {
  useSEO({ title: 'Kabinet', description: 'Struktur kepengurusan, visi, misi, dan filosofi kabinet HMTE UM Bandung.' })
  const cab = useAsync(() => api.currentCabinet(), [])
  const mem = useAsync(() => api.members(), [])
  const dep = useAsync(() => api.departments(), [])
  const [selected, setSelected] = useState<Member | null>(null)
  const [openDept, setOpenDept] = useState<string | null>(null)

  const tree = useMemo(() => {
    const all = mem.data ?? []
    return {
      top: all.filter((m) => m.level === 0),
      bph: all.filter((m) => m.level === 1),
      byDept: (id: string) => all.filter((m) => m.department_id === id),
    }
  }, [mem.data])

  const loading = cab.loading || mem.loading || dep.loading
  const error = cab.error || mem.error || dep.error
  const c = cab.data

  return (
    <>
      <PageHeader title={c?.name ?? 'Kabinet'} desc={c ? `Periode ${c.period}${c.tagline ? ' · ' + c.tagline : ''}` : undefined} crumbs={[{ label: 'Kabinet' }]} />
      <div className="container-x section">
        {loading && <Loading />}
        {error && <ErrorBox message={error} onRetry={() => { cab.reload(); mem.reload(); dep.reload() }} />}
        {c && (
          <>
            <Reveal className="mb-16 grid gap-6 lg:grid-cols-3">
              <div className="card flex flex-col items-center justify-center p-8 text-center">
                {c.logo_url ? <img src={c.logo_url} alt={`Logo ${c.name}`} className="h-28 w-28 object-contain" /> : <LogoMark className="h-28 w-28" />}
                <h2 className="mt-4 text-xl">{c.name}</h2>
                <p className="text-sm text-slate-500">{c.period}</p>
              </div>
              <div className="card p-6 lg:col-span-2">
                <h3 className="text-lg">Filosofi Kabinet</h3>
                <p className="mt-2 leading-relaxed text-slate-600">{c.philosophy}</p>
                <h3 className="mt-5 text-lg">Visi</h3>
                <p className="mt-2 leading-relaxed text-slate-600">{c.vision}</p>
                <h3 className="mt-5 text-lg">Misi</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">{c.mission.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
            </Reveal>

            <SectionHeading eyebrow="Struktur Kepengurusan" title="Bagan organisasi interaktif" desc="Klik pengurus untuk melihat profil, atau klik departemen untuk membuka anggotanya." align="center" />
            <div className="flex flex-col items-center overflow-x-auto pb-6">
              {tree.top.map((m) => <MemberNode key={m.id} m={m} onOpen={setSelected} big />)}
              <Connector />
              <div className="flex flex-wrap justify-center gap-4">
                {tree.bph.map((m) => <MemberNode key={m.id} m={m} onOpen={setSelected} />)}
              </div>
              <Connector />
              <div className="grid w-full max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(dep.data ?? []).map((d) => {
                  const members = tree.byDept(d.id)
                  const open = openDept === d.id
                  return (
                    <div key={d.id} className="card overflow-hidden">
                      <button
                        onClick={() => setOpenDept(open ? null : d.id)}
                        aria-expanded={open}
                        className="flex w-full items-center gap-3 p-4 text-left"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-cyan-300"><DeptIcon name={d.icon} className="h-5 w-5" /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold text-navy-900">{d.name}</span>
                          <span className="text-xs text-slate-500">{members.length} pengurus</span>
                        </span>
                        <ChevronDown className={cn('h-4 w-4 text-slate-400 transition', open && 'rotate-180')} aria-hidden="true" />
                      </button>
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-slate-100">
                            {members.map((m) => (
                              <li key={m.id}>
                                <button onClick={() => setSelected(m)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50">
                                  <Avatar member={m} className="h-9 w-9 text-xs" />
                                  <span className="min-w-0"><span className="block truncate text-sm font-medium text-navy-900">{m.full_name}</span><span className="block truncate text-xs text-slate-500">{m.position}</span></span>
                                </button>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Profil Pengurus">
        {selected && (
          <div className="text-center">
            <Avatar member={selected} className="mx-auto h-28 w-28 border-4 border-cyan-400/50 text-3xl" />
            <h3 className="mt-4 text-xl">{selected.full_name}</h3>
            <p className="text-sm font-semibold text-cyan-600">{selected.position}</p>
            <p className="text-xs text-slate-500">{dep.data?.find((d) => d.id === selected.department_id)?.name ?? 'Badan Pengurus Harian'}</p>
            {selected.bio && <p className="mt-4 text-sm leading-relaxed text-slate-600">{selected.bio}</p>}
            {selected.instagram && (
              <a href={`https://instagram.com/${selected.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm mt-4"><Instagram className="h-4 w-4" aria-hidden="true" /> {selected.instagram}</a>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
