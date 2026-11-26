import { useMemo, useState, type FormEvent } from 'react'
import { CheckCircle2, ClipboardList, Copy, FileText, Lightbulb, MessageSquare, Search, ShieldAlert } from 'lucide-react'
import { z } from 'zod'
import { Empty, FormField, PageHeader } from '@/components/ui'
import { Avatar } from '@/components/cards'
import { api, useAsync } from '@/lib/api'
import { useSEO } from '@/lib/seo'
import { cn, errorMessage, formatDate } from '@/lib/utils'
import { TICKET_TYPE_LABEL, type TicketTrack, type TicketType } from '@/lib/types'

const TABS: { id: TicketType; icon: typeof FileText; hint: string }[] = [
  { id: 'aspirasi', icon: Lightbulb, hint: 'Sampaikan ide, saran, atau masukan untuk HMTE dan prodi.' },
  { id: 'pengaduan', icon: ShieldAlert, hint: 'Laporkan permasalahan. Data pengaduan hanya dapat dibaca pengurus berwenang.' },
  { id: 'konsultasi', icon: MessageSquare, hint: 'Tanyakan hal seputar perkuliahan, KRS, praktikum, KP, atau skripsi.' },
  { id: 'surat', icon: FileText, hint: 'Ajukan surat organisasi (rekomendasi, izin kegiatan, keterangan aktif, dll).' },
]

const STATUS_STYLE: Record<string, string> = {
  diterima: 'bg-slate-100 text-slate-700', diproses: 'bg-amber-100 text-amber-800', selesai: 'bg-emerald-100 text-emerald-800', ditolak: 'bg-red-100 text-red-800',
}

const base = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(100),
  nim: z.string().trim().max(20).optional(),
  email: z.string().trim().email('Format email tidak valid'),
  subject: z.string().trim().min(3, 'Judul minimal 3 karakter').max(150),
  message: z.string().trim().min(10, 'Isi minimal 10 karakter').max(4000),
})

const EXTRA: Record<TicketType, { name: string; label: string; options?: string[]; type?: string }[]> = {
  aspirasi: [],
  pengaduan: [],
  konsultasi: [{ name: 'semester', label: 'Semester', options: ['1', '2', '3', '4', '5', '6', '7', '8', '9+'] }, { name: 'topik', label: 'Topik', options: ['Perkuliahan', 'KRS', 'Praktikum', 'Kerja Praktik', 'Skripsi', 'Lainnya'] }],
  surat: [{ name: 'jenis_surat', label: 'Jenis surat', options: ['Surat Rekomendasi', 'Surat Izin Kegiatan', 'Surat Keterangan Anggota', 'Surat Peminjaman', 'Lainnya'] }, { name: 'dibutuhkan', label: 'Tanggal dibutuhkan', type: 'date' }],
}

function TicketForm({ type }: { type: TicketType }) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [no, setNo] = useState('')
  const [fail, setFail] = useState('')
  const [copied, setCopied] = useState(false)
  const extras = EXTRA[type]
  const needNim = type === 'konsultasi' || type === 'surat'

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    if (fd.get('website')) return
    const r = base.safeParse(Object.fromEntries(fd))
    const errs: Record<string, string> = r.success ? {} : Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message]))
    if (needNim && !String(fd.get('nim') ?? '').trim()) errs.nim = 'NIM wajib diisi untuk layanan ini'
    const extra: Record<string, string> = {}
    for (const x of extras) {
      const v = String(fd.get(x.name) ?? '').trim()
      if (!v) errs[x.name] = `${x.label} wajib diisi`
      extra[x.name] = v
    }
    if (Object.keys(errs).length || !r.success) return setErrors(errs)
    setErrors({}); setFail(''); setBusy(true)
    try {
      const ticket = await api.submitTicket({ type, ...(r.data as Required<Pick<typeof r.data, 'name' | 'email' | 'subject' | 'message'>>), nim: r.data.nim, extra })
      setNo(ticket); form.reset()
    } catch (err) {
      setFail(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  if (no) {
    return (
      <div className="py-8 text-center" role="status">
        <CheckCircle2 className="mx-auto h-12 w-12 text-cyan-500" aria-hidden="true" />
        <h3 className="mt-3 text-xl">Pengajuan berhasil dikirim</h3>
        <p className="mt-1 text-sm text-slate-600">Simpan nomor tiket berikut untuk memantau status tindak lanjut.</p>
        <div className="mx-auto mt-4 inline-flex items-center gap-3 rounded-xl bg-navy-900 px-5 py-3 font-mono text-lg font-bold text-cyan-300">
          {no}
          <button type="button" aria-label="Salin nomor tiket" onClick={() => { void navigator.clipboard?.writeText(no); setCopied(true) }}><Copy className="h-4 w-4" /></button>
        </div>
        {copied && <p className="mt-2 text-xs text-emerald-600">Tersalin</p>}
        <div><button type="button" className="btn-outline mt-5" onClick={() => setNo('')}>Buat pengajuan baru</button></div>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4" aria-label={`Formulir ${TICKET_TYPE_LABEL[type]}`}>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Nama lengkap" htmlFor={`${type}-name`} error={errors.name}><input id={`${type}-name`} name="name" className="input" maxLength={100} autoComplete="name" /></FormField>
        <FormField label={needNim ? 'NIM' : 'NIM (opsional)'} htmlFor={`${type}-nim`} error={errors.nim}><input id={`${type}-nim`} name="nim" className="input" maxLength={20} inputMode="numeric" /></FormField>
      </div>
      <FormField label="Email" htmlFor={`${type}-email`} error={errors.email} hint="Dipakai untuk melacak status tiket."><input id={`${type}-email`} name="email" type="email" className="input" autoComplete="email" /></FormField>
      {extras.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {extras.map((x) => (
            <FormField key={x.name} label={x.label} htmlFor={`${type}-${x.name}`} error={errors[x.name]}>
              {x.options ? (
                <select id={`${type}-${x.name}`} name={x.name} className="input" defaultValue=""><option value="" disabled>Pilih...</option>{x.options.map((o) => <option key={o}>{o}</option>)}</select>
              ) : <input id={`${type}-${x.name}`} name={x.name} type={x.type ?? 'text'} className="input" />}
            </FormField>
          ))}
        </div>
      )}
      <FormField label="Judul" htmlFor={`${type}-subject`} error={errors.subject}><input id={`${type}-subject`} name="subject" className="input" maxLength={150} /></FormField>
      <FormField label={type === 'surat' ? 'Keperluan dan keterangan' : 'Isi pesan'} htmlFor={`${type}-message`} error={errors.message}><textarea id={`${type}-message`} name="message" rows={6} className="input" maxLength={4000} /></FormField>
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {fail && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{fail}</p>}
      <button className="btn-primary" disabled={busy}>{busy ? 'Mengirim...' : 'Kirim pengajuan'}</button>
    </form>
  )
}

function Tracker() {
  const [no, setNo] = useState('')
  const [email, setEmail] = useState('')
  const [res, setRes] = useState<TicketTrack | null | undefined>()
  const [busy, setBusy] = useState(false)
  const [fail, setFail] = useState('')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!no.trim() || !email.trim()) return setFail('Nomor tiket dan email wajib diisi.')
    setFail(''); setBusy(true); setRes(undefined)
    try { setRes(await api.trackTicket(no, email)) } catch (err) { setFail(errorMessage(err)) } finally { setBusy(false) }
  }

  return (
    <div className="card p-6">
      <h2 className="flex items-center gap-2 text-lg"><Search className="h-5 w-5 text-cyan-600" aria-hidden="true" /> Lacak status tiket</h2>
      <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:grid-cols-3" aria-label="Lacak tiket">
        <input className="input font-mono uppercase" placeholder="HMTE-260101-AB12C" value={no} onChange={(e) => setNo(e.target.value)} aria-label="Nomor tiket" maxLength={30} />
        <input className="input" type="email" placeholder="Email pengaju" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email pengaju" />
        <button className="btn-dark" disabled={busy}>{busy ? 'Mencari...' : 'Cek status'}</button>
      </form>
      {fail && <p className="mt-3 text-sm text-red-600" role="alert">{fail}</p>}
      {res === null && <p className="mt-4 text-sm text-slate-600" role="status">Tiket tidak ditemukan. Periksa kembali nomor tiket dan email Anda.</p>}
      {res && (
        <div className="mt-5 space-y-2 rounded-xl border border-slate-200 p-4 text-sm" role="status">
          <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-mono font-bold text-navy-900">{res.ticket_no}</span><span className={cn('rounded-full px-3 py-0.5 text-xs font-bold capitalize', STATUS_STYLE[res.status])}>{res.status}</span></div>
          <p><span className="text-slate-500">Jenis:</span> {TICKET_TYPE_LABEL[res.type]}</p>
          <p><span className="text-slate-500">Judul:</span> {res.subject}</p>
          <p><span className="text-slate-500">Diajukan:</span> {formatDate(res.created_at)} · <span className="text-slate-500">Diperbarui:</span> {formatDate(res.updated_at)}</p>
          {res.admin_response && <p className="rounded-lg bg-cyan-500/10 p-3"><span className="font-semibold text-navy-900">Tanggapan pengurus:</span> {res.admin_response}</p>}
        </div>
      )}
    </div>
  )
}

export default function Services() {
  useSEO({ title: 'Layanan', description: 'Layanan digital HMTE: aspirasi, pengaduan, konsultasi akademik, dan pengajuan surat dengan nomor tiket.' })
  const [tab, setTab] = useState<TicketType>('aspirasi')
  const mem = useAsync(() => api.members(), [])
  const contacts = useMemo(() => (mem.data ?? []).filter((m) => m.level <= 1), [mem.data])
  const active = TABS.find((t) => t.id === tab)!

  return (
    <>
      <PageHeader title="Layanan" desc="Pusat layanan digital untuk mahasiswa Teknik Elektro. Setiap pengajuan mendapat nomor tiket." crumbs={[{ label: 'Layanan' }]} />
      <div className="container-x section space-y-10">
        <section aria-label="Formulir layanan">
          <div className="mb-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4" role="tablist">
            {TABS.map((t) => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
                className={cn('flex items-center gap-3 rounded-xl border p-4 text-left transition', tab === t.id ? 'border-navy-900 bg-navy-900 text-white' : 'border-slate-200 bg-white hover:border-cyan-500')}>
                <t.icon className={cn('h-5 w-5', tab === t.id ? 'text-cyan-300' : 'text-cyan-600')} aria-hidden="true" />
                <span className="text-sm font-semibold">{TICKET_TYPE_LABEL[t.id]}</span>
              </button>
            ))}
          </div>
          <div className="card p-6" role="tabpanel">
            <p className="mb-5 text-sm text-slate-600">{active.hint}</p>
            <TicketForm key={tab} type={tab} />
          </div>
        </section>

        <Tracker />

        <section aria-labelledby="adm" className="grid gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <h2 id="adm" className="flex items-center gap-2 text-lg"><ClipboardList className="h-5 w-5 text-cyan-600" aria-hidden="true" /> Informasi layanan administrasi</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {['Pengajuan surat diproses maksimal 3 hari kerja setelah berkas lengkap.', 'Sertakan NIM dan keperluan yang jelas pada setiap pengajuan.', 'Pantau status melalui nomor tiket dan email yang digunakan saat mengajukan.', 'Sekretariat HMTE melayani pada hari kerja, pukul 09.00 – 15.00 WIB. (Contoh: sesuaikan dengan jadwal resmi.)'].map((t) => <li key={t} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" />{t}</li>)}
            </ul>
          </div>
          <div className="card p-6">
            <h2 className="text-lg">Kontak pengurus</h2>
            {contacts.length ? (
              <ul className="mt-4 space-y-3">
                {contacts.map((m) => (
                  <li key={m.id} className="flex items-center gap-3">
                    <Avatar member={m} className="h-10 w-10 text-xs" />
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-navy-900">{m.full_name}</p><p className="truncate text-xs text-slate-500">{m.position}</p></div>
                    {m.instagram && <a className="text-xs font-semibold text-cyan-600 hover:underline" href={`https://instagram.com/${m.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">{m.instagram}</a>}
                  </li>
                ))}
              </ul>
            ) : <Empty text="Kontak pengurus belum tersedia." />}
          </div>
        </section>
      </div>
    </>
  )
}
