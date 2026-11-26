import { useMemo, useState } from 'react'
import { Calendar as CalIcon, ChevronLeft, ChevronRight, ExternalLink, MapPin } from 'lucide-react'
import { EventCard } from '@/components/cards'
import { Empty, ErrorBox, Img, Loading, Modal, PageHeader } from '@/components/ui'
import { api, useAsync } from '@/lib/api'
import { useSEO } from '@/lib/seo'
import { cn, formatDate, formatTime } from '@/lib/utils'
import type { EventItem } from '@/lib/types'

const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`

export default function Events() {
  useSEO({ title: 'Kegiatan', description: 'Kalender dan agenda kegiatan HMTE UM Bandung beserta poster dan dokumentasinya.' })
  const ev = useAsync(() => api.events(), [])
  const gal = useAsync(() => api.gallery(), [])
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1) })
  const [day, setDay] = useState<string | null>(null)
  const [tab, setTab] = useState<'akan' | 'lalu'>('akan')
  const [open, setOpen] = useState<EventItem | null>(null)

  const events = ev.data ?? []
  const byDay = useMemo(() => {
    const map = new Map<string, EventItem[]>()
    for (const e of events) {
      // tandai setiap hari yang dilewati kegiatan multi-hari
      const s = new Date(e.starts_at)
      const end = new Date(e.ends_at ?? e.starts_at)
      for (let d = new Date(s.getFullYear(), s.getMonth(), s.getDate()); d <= end && d.getTime() - s.getTime() < 31 * 86_400_000; d.setDate(d.getDate() + 1)) {
        const k = key(d)
        map.set(k, [...(map.get(k) ?? []), e])
      }
    }
    return map
  }, [events])

  const now = Date.now()
  const upcoming = events.filter((e) => new Date(e.ends_at ?? e.starts_at).getTime() >= now)
  const past = events.filter((e) => new Date(e.ends_at ?? e.starts_at).getTime() < now).reverse()
  const list = day ? byDay.get(day) ?? [] : tab === 'akan' ? upcoming : past

  const first = (month.getDay() + 6) % 7
  const total = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells = [...Array<null>(first).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)]
  const todayKey = key(new Date())
  const docs = open ? (gal.data ?? []).filter((g) => g.event_id === open.id) : []

  return (
    <>
      <PageHeader title="Kegiatan" desc="Agenda dan dokumentasi kegiatan HMTE." crumbs={[{ label: 'Kegiatan' }]} />
      <div className="container-x section grid gap-8 lg:grid-cols-5">
        <section className="lg:col-span-2" aria-label="Kalender kegiatan">
          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <button className="rounded-lg p-2 hover:bg-slate-100" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Bulan sebelumnya"><ChevronLeft className="h-5 w-5" /></button>
              <h2 className="text-base capitalize">{month.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h2>
              <button className="rounded-lg p-2 hover:bg-slate-100" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Bulan berikutnya"><ChevronRight className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500">{DAYS.map((d) => <div key={d} className="py-1">{d}</div>)}</div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((n, i) => {
                if (!n) return <div key={`e${i}`} />
                const k = key(new Date(month.getFullYear(), month.getMonth(), n))
                const has = byDay.has(k)
                return (
                  <button
                    key={k}
                    onClick={() => setDay(day === k ? null : k)}
                    aria-pressed={day === k}
                    aria-label={`${n} ${month.toLocaleDateString('id-ID', { month: 'long' })}${has ? `, ${byDay.get(k)!.length} kegiatan` : ''}`}
                    className={cn('relative aspect-square rounded-lg text-sm transition', day === k ? 'bg-navy-900 text-white' : todayKey === k ? 'bg-cyan-500/15 font-bold text-cyan-700' : 'hover:bg-slate-100')}
                  >
                    {n}
                    {has && <span className={cn('absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full', day === k ? 'bg-cyan-300' : 'bg-cyan-500')} />}
                  </button>
                )
              })}
            </div>
            {day && <button className="btn-outline btn-sm mt-4 w-full" onClick={() => setDay(null)}>Hapus filter tanggal</button>}
          </div>
        </section>

        <section className="lg:col-span-3" aria-label="Daftar agenda">
          {!day && (
            <div className="mb-4 inline-flex rounded-xl bg-slate-100 p-1" role="tablist">
              {(['akan', 'lalu'] as const).map((t) => (
                <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn('rounded-lg px-4 py-1.5 text-sm font-semibold', tab === t ? 'bg-white text-navy-900 shadow' : 'text-slate-500')}>
                  {t === 'akan' ? `Akan datang (${upcoming.length})` : `Telah berlalu (${past.length})`}
                </button>
              ))}
            </div>
          )}
          {ev.loading && <Loading />}
          {ev.error && <ErrorBox message={ev.error} onRetry={ev.reload} />}
          {!ev.loading && (list.length ? <div className="space-y-3">{list.map((e) => <EventCard key={e.id} e={e} onOpen={setOpen} />)}</div> : <Empty text={day ? 'Tidak ada kegiatan pada tanggal ini.' : 'Belum ada agenda.'} />)}
        </section>
      </div>

      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.title ?? 'Detail Kegiatan'} wide>
        {open && (
          <div className="grid gap-6 md:grid-cols-5">
            <div className="md:col-span-2"><Img src={open.poster_url} alt={`Poster ${open.title}`} ratio="aspect-[3/4]" className="rounded-xl" /></div>
            <div className="md:col-span-3">
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex gap-2"><CalIcon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" aria-hidden="true" />
                  <span>{formatDate(open.starts_at)}, {formatTime(open.starts_at)}{open.ends_at && ` – ${formatDate(open.ends_at) !== formatDate(open.starts_at) ? formatDate(open.ends_at) + ', ' : ''}${formatTime(open.ends_at)}`}</span></li>
                {open.location && <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" aria-hidden="true" />{open.location}</li>}
              </ul>
              {open.description && <p className="mt-4 text-sm leading-relaxed text-slate-600">{open.description}</p>}
              {open.registration_url && <a href={open.registration_url} target="_blank" rel="noopener noreferrer" className="btn-primary mt-4">Daftar <ExternalLink className="h-4 w-4" aria-hidden="true" /></a>}
              <h3 className="mb-2 mt-6 text-sm">Dokumentasi</h3>
              {docs.length ? (
                <div className="grid grid-cols-3 gap-2">{docs.map((g) => <Img key={g.id} src={g.image_url} alt={g.title} ratio="aspect-square" className="rounded-lg" />)}</div>
              ) : <p className="text-xs text-slate-500">Dokumentasi belum tersedia.</p>}
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
