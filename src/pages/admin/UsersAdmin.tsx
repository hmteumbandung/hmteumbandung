import { useEffect, useState } from 'react'
import { ErrorBox, Loading } from '@/components/ui'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { errorMessage, formatDate } from '@/lib/utils'
import { ROLE_LABEL, type AppRole, type Profile } from '@/lib/types'

export default function UsersAdmin() {
  const { profile: me } = useAuth()
  const [rows, setRows] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    setLoading(true)
    void supabase.from('profiles').select('*').order('created_at', { ascending: false }).then(({ data, error: e }) => {
      if (!alive) return
      if (e) setError(e.message); else { setError(''); setRows((data ?? []) as Profile[]) }
      setLoading(false)
    })
    return () => { alive = false }
  }, [tick])

  async function patch(p: Profile, changes: Partial<Pick<Profile, 'role' | 'is_active'>>) {
    setNotice('')
    const { error: e } = await supabase.from('profiles').update(changes).eq('id', p.id)
    if (e) setError(errorMessage(e)); else { setError(''); setNotice('Perubahan disimpan.'); setTick((t) => t + 1) }
  }

  return (
    <div>
      <h1 className="text-2xl">Manajemen Pengguna</h1>
      <p className="mb-5 mt-1 text-sm text-slate-500">
        Akun baru mendaftar melalui Supabase Auth dan <strong>tidak aktif</strong> sampai Anda mengaktifkannya di sini. Buat akun baru lewat Supabase Dashboard &gt; Authentication &gt; Users.
      </p>
      {notice && <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800" role="status">{notice}</p>}
      {loading && <Loading />}
      {error && <ErrorBox message={error} onRetry={() => setTick((t) => t + 1)} />}
      {!loading && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Nama</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Aktif</th><th className="px-4 py-3">Terdaftar</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((p) => {
                const self = p.id === me?.id
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-3">{p.full_name || '-'}{self && <span className="badge ml-2">Anda</span>}</td>
                    <td className="px-4 py-3">{p.email}</td>
                    <td className="px-4 py-3">
                      <select className="input w-auto py-1.5" value={p.role} disabled={self} aria-label={`Role ${p.email}`} onChange={(e) => void patch(p, { role: e.target.value as AppRole })}>
                        {(Object.keys(ROLE_LABEL) as AppRole[]).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-cyan-600" checked={p.is_active} disabled={self} aria-label={`Aktifkan ${p.email}`} onChange={(e) => void patch(p, { is_active: e.target.checked })} /></td>
                    <td className="px-4 py-3">{formatDate(p.created_at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
