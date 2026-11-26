import { useEffect, useState } from 'react'
import { MailCheck, Trash2 } from 'lucide-react'
import { ErrorBox, Loading, Modal } from '@/components/ui'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { cn, formatDate } from '@/lib/utils'
import type { ContactMessage } from '@/lib/types'

export default function MessagesAdmin() {
  const { can } = useAuth()
  const [rows, setRows] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sel, setSel] = useState<ContactMessage | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    setLoading(true)
    void supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).then(({ data, error: e }) => {
      if (!alive) return
      if (e) setError(e.message); else { setError(''); setRows((data ?? []) as ContactMessage[]) }
      setLoading(false)
    })
    return () => { alive = false }
  }, [tick])

  async function open(m: ContactMessage) {
    setSel(m)
    if (!m.is_read) {
      const { error: e } = await supabase.from('contact_messages').update({ is_read: true }).eq('id', m.id)
      if (!e) setRows((r) => r.map((x) => (x.id === m.id ? { ...x, is_read: true } : x)))
    }
  }

  async function remove(m: ContactMessage) {
    if (!window.confirm('Hapus pesan ini?')) return
    const { error: e } = await supabase.from('contact_messages').delete().eq('id', m.id)
    if (e) setError(e.message); else setTick((t) => t + 1)
  }

  return (
    <div>
      <h1 className="text-2xl">Pesan Masuk</h1>
      <p className="mb-5 mt-1 text-sm text-slate-500">Pesan dari formulir Kontak.</p>
      {loading && <Loading />}
      {error && <ErrorBox message={error} onRetry={() => setTick((t) => t + 1)} />}
      {!loading && !error && (
        <ul className="card divide-y divide-slate-100">
          {rows.map((m) => (
            <li key={m.id} className="flex items-center gap-3 p-4">
              <button className="min-w-0 flex-1 text-left" onClick={() => void open(m)}>
                <p className={cn('truncate text-sm', m.is_read ? 'text-slate-600' : 'font-bold text-navy-900')}>{m.subject}</p>
                <p className="truncate text-xs text-slate-500">{m.name} &middot; {m.email} &middot; {formatDate(m.created_at)}</p>
              </button>
              {!m.is_read && <span className="badge">Baru</span>}
              {can(['super_admin', 'admin']) && <button className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600" onClick={() => void remove(m)} aria-label="Hapus pesan"><Trash2 className="h-4 w-4" /></button>}
            </li>
          ))}
          {!rows.length && <li className="p-10 text-center text-sm text-slate-500">Belum ada pesan.</li>}
        </ul>
      )}
      <Modal open={!!sel} onClose={() => setSel(null)} title="Detail Pesan">
        {sel && (
          <div className="space-y-3 text-sm">
            <h3 className="text-base">{sel.subject}</h3>
            <p className="text-slate-500">{sel.name} &middot; <a className="text-cyan-600 hover:underline" href={`mailto:${sel.email}`}>{sel.email}</a></p>
            <p className="whitespace-pre-line rounded-lg bg-slate-50 p-3">{sel.message}</p>
            <a className="btn-dark btn-sm" href={`mailto:${sel.email}?subject=${encodeURIComponent('Re: ' + sel.subject)}`}><MailCheck className="h-4 w-4" aria-hidden="true" /> Balas via email</a>
          </div>
        )}
      </Modal>
    </div>
  )
}
