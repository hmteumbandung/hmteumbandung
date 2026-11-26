import { useEffect, useMemo, useState } from 'react'
import { Eye, Trash2 } from 'lucide-react'
import { ErrorBox, Loading, Modal } from '@/components/ui'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { cn, errorMessage, formatDate } from '@/lib/utils'
import { TICKET_TYPE_LABEL, type Ticket, type TicketStatus, type TicketType } from '@/lib/types'

const STATUSES: TicketStatus[] = ['diterima', 'diproses', 'selesai', 'ditolak']
const COLOR: Record<TicketStatus, string> = { diterima: 'bg-slate-100 text-slate-700', diproses: 'bg-amber-100 text-amber-800', selesai: 'bg-emerald-100 text-emerald-800', ditolak: 'bg-red-100 text-red-800' }

export default function TicketsAdmin() {
  const { can } = useAuth()
  const [rows, setRows] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [sel, setSel] = useState<Ticket | null>(null)
  const [st, setSt] = useState<TicketStatus>('diterima')
  const [resp, setResp] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    setLoading(true)
    void supabase.from('tickets').select('*').order('created_at', { ascending: false }).then(({ data, error: e }) => {
      if (!alive) return
      if (e) setError(e.message); else { setError(''); setRows((data ?? []) as Ticket[]) }
      setLoading(false)
    })
    return () => { alive = false }
  }, [tick])

  const shown = useMemo(() => rows.filter((r) => (!type || r.type === type) && (!status || r.status === status)), [rows, type, status])

  function open(t: Ticket) { setSel(t); setSt(t.status); setResp(t.admin_response ?? ''); setMsg('') }

  async function save() {
    if (!sel) return
    setSaving(true); setMsg('')
    const { error: e } = await supabase.from('tickets').update({ status: st, admin_response: resp.trim() || null }).eq('id', sel.id)
    setSaving(false)
    if (e) return setMsg(errorMessage(e))
    setSel(null); setTick((t) => t + 1)
  }

  async function remove(t: Ticket) {
    if (!window.confirm(`Hapus tiket ${t.ticket_no}?`)) return
    const { error: e } = await supabase.from('tickets').delete().eq('id', t.id)
    if (e) setError(e.message); else setTick((x) => x + 1)
  }

  return (
    <div>
      <h1 className="text-2xl">Aspirasi, Pengaduan, Konsultasi &amp; Surat</h1>
      <p className="mt-1 text-sm text-slate-500">Data ini bersifat rahasia dan hanya dapat dibaca pengurus berwenang.</p>
      <div className="my-5 flex flex-wrap gap-3">
        <select className="input w-auto" value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter jenis"><option value="">Semua jenis</option>{(Object.keys(TICKET_TYPE_LABEL) as TicketType[]).map((k) => <option key={k} value={k}>{TICKET_TYPE_LABEL[k]}</option>)}</select>
        <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter status"><option value="">Semua status</option>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
      </div>
      {loading && <Loading />}
      {error && <ErrorBox message={error} onRetry={() => setTick((t) => t + 1)} />}
      {!loading && !error && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Tiket</th><th className="px-4 py-3">Jenis</th><th className="px-4 py-3">Pengaju</th><th className="px-4 py-3">Judul</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Aksi</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {shown.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs">{t.ticket_no}</td>
                  <td className="px-4 py-3">{TICKET_TYPE_LABEL[t.type]}</td>
                  <td className="px-4 py-3">{t.name}</td>
                  <td className="max-w-[200px] truncate px-4 py-3">{t.subject}</td>
                  <td className="px-4 py-3"><span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold capitalize', COLOR[t.status])}>{t.status}</span></td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-cyan-600" onClick={() => open(t)} aria-label="Lihat dan tindak lanjuti"><Eye className="h-4 w-4" /></button>
                    {can(['super_admin', 'admin']) && <button className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600" onClick={() => void remove(t)} aria-label="Hapus"><Trash2 className="h-4 w-4" /></button>}
                  </td>
                </tr>
              ))}
              {!shown.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500">Tidak ada tiket.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={!!sel} onClose={() => setSel(null)} title={sel?.ticket_no ?? 'Tiket'} wide>
        {sel && (
          <div className="space-y-4 text-sm">
            <dl className="grid gap-2 sm:grid-cols-2">
              <div><dt className="text-xs text-slate-500">Jenis</dt><dd>{TICKET_TYPE_LABEL[sel.type]}</dd></div>
              <div><dt className="text-xs text-slate-500">Diajukan</dt><dd>{formatDate(sel.created_at)}</dd></div>
              <div><dt className="text-xs text-slate-500">Nama</dt><dd>{sel.name}{sel.nim ? ` (${sel.nim})` : ''}</dd></div>
              <div><dt className="text-xs text-slate-500">Email</dt><dd className="break-all">{sel.email}</dd></div>
              {Object.entries(sel.extra ?? {}).map(([k, v]) => <div key={k}><dt className="text-xs capitalize text-slate-500">{k.replace('_', ' ')}</dt><dd>{String(v)}</dd></div>)}
            </dl>
            <div><p className="text-xs text-slate-500">Judul</p><p className="font-semibold text-navy-900">{sel.subject}</p></div>
            <div><p className="text-xs text-slate-500">Isi</p><p className="whitespace-pre-line rounded-lg bg-slate-50 p-3">{sel.message}</p></div>
            <div className="grid gap-3 border-t pt-4">
              <label className="label" htmlFor="t-status">Status tindak lanjut</label>
              <select id="t-status" className="input" value={st} onChange={(e) => setSt(e.target.value as TicketStatus)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
              <label className="label" htmlFor="t-resp">Tanggapan (terlihat oleh pengaju)</label>
              <textarea id="t-resp" className="input" rows={4} maxLength={2000} value={resp} onChange={(e) => setResp(e.target.value)} />
              {msg && <p className="text-sm text-red-600" role="alert">{msg}</p>}
              <div className="flex justify-end gap-2"><button className="btn-outline" onClick={() => setSel(null)}>Tutup</button><button className="btn-dark" disabled={saving} onClick={() => void save()}>{saving ? 'Menyimpan...' : 'Simpan'}</button></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
