import { useEffect, useState, type FormEvent } from 'react'
import { ErrorBox, Loading } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { errorMessage } from '@/lib/utils'

interface Row { key: string; value: string; label: string | null }
const LONG = new Set(['about_short', 'history', 'vision', 'mission', 'goals', 'logo_philosophy', 'org_info', 'address'])
const NUMERIC = (k: string) => k.startsWith('stat_')

export default function SettingsAdmin() {
  const [rows, setRows] = useState<Row[]>([])
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [ok, setOk] = useState(false)

  useEffect(() => {
    void supabase.from('site_settings').select('key,value,label').order('key').then(({ data, error: e }) => {
      if (e) setError(e.message)
      else { const r = ((data ?? []) as Row[]).filter((x) => !x.key.startsWith('ui_')); setRows(r); setValues(Object.fromEntries(r.map((x) => [x.key, x.value]))) }
      setLoading(false)
    })
  }, [])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const bad = rows.find((r) => NUMERIC(r.key) && !/^\d{1,7}$/.test(values[r.key] ?? ''))
    if (bad) return setError(`${bad.label ?? bad.key} harus berupa angka bulat.`)
    setSaving(true); setError(''); setOk(false)
    try {
      const changed = rows.filter((r) => values[r.key] !== r.value).map((r) => ({ key: r.key, value: values[r.key].trim(), label: r.label }))
      if (changed.length) {
        const { error: err } = await supabase.from('site_settings').upsert(changed, { onConflict: 'key' })
        if (err) throw err
        setRows((rs) => rs.map((r) => ({ ...r, value: values[r.key] })))
      }
      setOk(true)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading />
  return (
    <form onSubmit={(e) => void onSubmit(e)} className="max-w-3xl">
      <h1 className="text-2xl">Pengaturan Situs</h1>
      <p className="mb-5 mt-1 text-sm text-slate-500">Termasuk angka statistik beranda, kontak, dan teks halaman Tentang Kami.</p>
      {error && <div className="mb-4"><ErrorBox message={error} /></div>}
      {ok && <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800" role="status">Pengaturan disimpan.</p>}
      <div className="card space-y-4 p-6">
        {rows.map((r) => (
          <div key={r.key}>
            <label className="label" htmlFor={`s-${r.key}`}>{r.label ?? r.key}</label>
            {LONG.has(r.key)
              ? <textarea id={`s-${r.key}`} className="input" rows={r.key === 'address' ? 2 : 4} value={values[r.key] ?? ''} onChange={(e) => setValues({ ...values, [r.key]: e.target.value })} />
              : <input id={`s-${r.key}`} className="input" inputMode={NUMERIC(r.key) ? 'numeric' : undefined} value={values[r.key] ?? ''} onChange={(e) => setValues({ ...values, [r.key]: e.target.value })} />}
          </div>
        ))}
      </div>
      <button className="btn-dark mt-5" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan pengaturan'}</button>
    </form>
  )
}
