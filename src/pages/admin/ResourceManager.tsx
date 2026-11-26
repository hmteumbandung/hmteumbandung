import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Pencil, Plus, Search, Trash2, Upload } from 'lucide-react'
import { ErrorBox, FormField, Loading, Modal } from '@/components/ui'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { uploadImage } from '@/lib/upload'
import { errorMessage, slugify, toLocalInput } from '@/lib/utils'
import type { AppRole } from '@/lib/types'

export type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'datetime' | 'date' | 'image' | 'lines' | 'url' | 'relation'

export interface Field {
  name: string
  label: string
  type: FieldType
  required?: boolean
  max?: number
  min?: number
  options?: { value: string | number; label: string }[]
  relation?: { table: string; label: string; filter?: Record<string, string | boolean> }
  help?: string
  full?: boolean
  rows?: number
}

export interface Column { key: string; label: string; render?: (row: Row, lookups: Lookups) => ReactNode }
export type Row = Record<string, unknown> & { id: string }
export type Lookups = Record<string, Record<string, string>>

export interface ResourceConfig {
  table: string
  title: string
  singular: string
  description?: string
  writeRoles: AppRole[]
  deleteRoles?: AppRole[]
  fields: Field[]
  columns: Column[]
  order: { column: string; ascending: boolean }
  searchKeys: string[]
  defaults?: Record<string, unknown>
  /** isi otomatis kolom slug dari kolom ini bila slug kosong */
  slugFrom?: string
  imageFolder?: string
}

const toForm = (f: Field, v: unknown): string | boolean => {
  if (f.type === 'checkbox') return Boolean(v)
  if (v === null || v === undefined) return ''
  if (f.type === 'lines') return (v as string[]).join('\n')
  if (f.type === 'datetime') return toLocalInput(String(v))
  return String(v)
}

export function ImageInput({ value, onChange, folder }: { value: string; onChange: (url: string) => void; folder: string }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  return (
    <div>
      <div className="flex items-center gap-3">
        {value ? <img src={value} alt="Pratinjau" className="h-16 w-16 rounded-lg border object-cover" /> : <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed text-slate-400"><Upload className="h-5 w-5" /></div>}
        <label className="btn-outline btn-sm cursor-pointer">
          {busy ? 'Mengunggah...' : 'Pilih gambar'}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={busy}
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              setErr(''); setBusy(true)
              try { onChange(await uploadImage(file, folder)) } catch (x) { setErr(errorMessage(x)) } finally { setBusy(false); e.target.value = '' }
            }} />
        </label>
        {value && <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => onChange('')}>Hapus</button>}
      </div>
      <p className="mt-1 text-xs text-slate-500">JPG/PNG/WebP, maksimal 5 MB.</p>
      {err && <p className="field-error" role="alert">{err}</p>}
    </div>
  )
}

export function ResourceManager({ cfg }: { cfg: ResourceConfig }) {
  const { can } = useAuth()
  const canWrite = can(cfg.writeRoles)
  const canDelete = can(cfg.deleteRoles ?? cfg.writeRoles)
  const [rows, setRows] = useState<Row[]>([])
  const [lookups, setLookups] = useState<Lookups>({})
  const [relOptions, setRelOptions] = useState<Record<string, { value: string; label: string }[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<Row | 'new' | null>(null)
  const [form, setForm] = useState<Record<string, string | boolean>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [tick, setTick] = useState(0)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let alive = true
    setLoading(true); setError('')
    ;(async () => {
      try {
        const { data, error: e } = await supabase.from(cfg.table).select('*').order(cfg.order.column, { ascending: cfg.order.ascending })
        if (e) throw e
        const rel: Lookups = {}
        const opts: Record<string, { value: string; label: string }[]> = {}
        for (const f of cfg.fields.filter((x) => x.type === 'relation' && x.relation)) {
          const r = f.relation!
          const res = await supabase.from(r.table).select(`id,${r.label}`).order(r.label)
          if (res.error) throw res.error
          const list = (res.data ?? []) as unknown as Record<string, string>[]
          opts[f.name] = list.map((x) => ({ value: x.id, label: x[r.label] }))
          rel[f.name] = Object.fromEntries(list.map((x) => [x.id, x[r.label]]))
        }
        if (alive) { setRows((data ?? []) as Row[]); setLookups(rel); setRelOptions(opts) }
      } catch (e) {
        if (alive) setError(errorMessage(e))
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [cfg, tick])

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase()
    return t ? rows.filter((r) => cfg.searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(t))) : rows
  }, [rows, q, cfg.searchKeys])

  function openForm(row: Row | 'new') {
    const init: Record<string, string | boolean> = {}
    for (const f of cfg.fields) {
      const src = row === 'new' ? cfg.defaults?.[f.name] : row[f.name]
      init[f.name] = toForm(f, src)
    }
    setForm(init); setErrors({}); setFormError(''); setEditing(row)
  }

  async function save() {
    const errs: Record<string, string> = {}
    const payload: Record<string, unknown> = {}
    const values = { ...form }
    if (cfg.slugFrom && cfg.fields.some((f) => f.name === 'slug') && !String(values.slug ?? '').trim()) {
      values.slug = slugify(String(values[cfg.slugFrom] ?? ''))
    }
    for (const f of cfg.fields) {
      const raw = values[f.name]
      const s = typeof raw === 'string' ? raw.trim() : ''
      if (f.type === 'checkbox') { payload[f.name] = Boolean(raw); continue }
      if (!s) {
        if (f.required) errs[f.name] = `${f.label} wajib diisi`
        payload[f.name] = f.type === 'lines' ? [] : null
        continue
      }
      if (f.max && s.length > f.max) errs[f.name] = `Maksimal ${f.max} karakter`
      switch (f.type) {
        case 'number': {
          const n = Number(s)
          if (!Number.isFinite(n)) errs[f.name] = 'Harus berupa angka'
          else if (f.min !== undefined && n < f.min) errs[f.name] = `Minimal ${f.min}`
          else payload[f.name] = n
          break
        }
        case 'datetime': payload[f.name] = new Date(s).toISOString(); break
        case 'lines': payload[f.name] = s.split('\n').map((x) => x.trim()).filter(Boolean); break
        case 'url':
          if (!/^https?:\/\//i.test(s)) errs[f.name] = 'Harus diawali http:// atau https://'
          payload[f.name] = s
          break
        default:
          payload[f.name] = f.type === 'select' && typeof f.options?.[0]?.value === 'number' ? Number(s) : s
      }
    }
    if (cfg.table === 'articles' && payload.status === 'published' && !payload.published_at) payload.published_at = new Date().toISOString()
    if (cfg.table === 'articles' && payload.status === 'draft') payload.published_at = payload.published_at ?? null
    if (Object.keys(errs).length) return setErrors(errs)

    setSaving(true); setFormError('')
    try {
      const res = editing === 'new'
        ? await supabase.from(cfg.table).insert(payload)
        : await supabase.from(cfg.table).update(payload).eq('id', (editing as Row).id)
      if (res.error) throw res.error
      setEditing(null); setNotice(editing === 'new' ? 'Data berhasil ditambahkan.' : 'Perubahan disimpan.'); setTick((t) => t + 1)
    } catch (e) {
      const msg = errorMessage(e)
      setFormError(/duplicate|unique/i.test(msg) ? 'Data dengan nilai unik yang sama (mis. slug atau kabinet aktif) sudah ada.' : msg)
    } finally {
      setSaving(false)
    }
  }

  async function remove(row: Row) {
    if (!window.confirm(`Hapus ${cfg.singular} ini? Tindakan tidak dapat dibatalkan.`)) return
    const { error: e } = await supabase.from(cfg.table).delete().eq('id', row.id)
    if (e) setError(e.message)
    else { setNotice('Data dihapus.'); setTick((t) => t + 1) }
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl">{cfg.title}</h1>
          {cfg.description && <p className="mt-1 text-sm text-slate-500">{cfg.description}</p>}
        </div>
        {canWrite && <button className="btn-dark" onClick={() => openForm('new')}><Plus className="h-4 w-4" aria-hidden="true" /> Tambah {cfg.singular}</button>}
      </div>
      {!canWrite && <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Role Anda hanya dapat melihat data ini.</p>}
      {notice && <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800" role="status">{notice}</p>}
      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input className="input pl-9" type="search" placeholder="Cari..." aria-label="Cari data" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {loading && <Loading />}
      {error && <ErrorBox message={error} onRetry={() => setTick((t) => t + 1)} />}
      {!loading && !error && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>{cfg.columns.map((c) => <th key={c.key} className="px-4 py-3 font-semibold">{c.label}</th>)}<th className="px-4 py-3 text-right font-semibold">Aksi</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shown.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  {cfg.columns.map((c) => <td key={c.key} className="max-w-xs truncate px-4 py-3">{c.render ? c.render(r, lookups) : String(r[c.key] ?? '-')}</td>)}
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {canWrite && <button className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-cyan-600" onClick={() => openForm(r)} aria-label="Ubah"><Pencil className="h-4 w-4" /></button>}
                    {canDelete && <button className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600" onClick={() => void remove(r)} aria-label="Hapus"><Trash2 className="h-4 w-4" /></button>}
                  </td>
                </tr>
              ))}
              {!shown.length && <tr><td colSpan={cfg.columns.length + 1} className="px-4 py-10 text-center text-slate-500">Belum ada data.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={`${editing === 'new' ? 'Tambah' : 'Ubah'} ${cfg.singular}`} wide>
        <form onSubmit={(e) => { e.preventDefault(); void save() }} noValidate className="grid gap-4 sm:grid-cols-2">
          {cfg.fields.map((f) => {
            const id = `f-${f.name}`
            const v = form[f.name]
            const set = (val: string | boolean) => setForm((p) => ({ ...p, [f.name]: val }))
            const wide = f.full || f.type === 'textarea' || f.type === 'lines' || f.type === 'image'
            let input: ReactNode
            switch (f.type) {
              case 'textarea': case 'lines':
                input = <textarea id={id} className="input" rows={f.rows ?? (f.type === 'lines' ? 4 : 6)} value={String(v ?? '')} onChange={(e) => set(e.target.value)} />; break
              case 'select':
                input = <select id={id} className="input" value={String(v ?? '')} onChange={(e) => set(e.target.value)}>{!f.required && <option value="">-</option>}{f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>; break
              case 'relation':
                input = <select id={id} className="input" value={String(v ?? '')} onChange={(e) => set(e.target.value)}><option value="">-</option>{relOptions[f.name]?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>; break
              case 'checkbox':
                input = <label className="flex items-center gap-2 text-sm"><input id={id} type="checkbox" className="h-4 w-4 rounded border-slate-300 text-cyan-600" checked={Boolean(v)} onChange={(e) => set(e.target.checked)} /> Ya</label>; break
              case 'image':
                input = <ImageInput value={String(v ?? '')} onChange={set} folder={cfg.imageFolder ?? cfg.table} />; break
              case 'datetime':
                input = <input id={id} type="datetime-local" className="input" value={String(v ?? '')} onChange={(e) => set(e.target.value)} />; break
              case 'date':
                input = <input id={id} type="date" className="input" value={String(v ?? '')} onChange={(e) => set(e.target.value)} />; break
              case 'number':
                input = <input id={id} type="number" className="input" value={String(v ?? '')} min={f.min} onChange={(e) => set(e.target.value)} />; break
              default:
                input = <input id={id} type={f.type === 'url' ? 'url' : 'text'} className="input" maxLength={f.max} value={String(v ?? '')} onChange={(e) => set(e.target.value)} />
            }
            return (
              <div key={f.name} className={wide ? 'sm:col-span-2' : ''}>
                <FormField label={f.label + (f.required ? ' *' : '')} htmlFor={id} error={errors[f.name]} hint={f.help}>{input}</FormField>
              </div>
            )
          })}
          {formError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 sm:col-span-2" role="alert">{formError}</p>}
          <div className="flex justify-end gap-2 sm:col-span-2">
            <button type="button" className="btn-outline" onClick={() => setEditing(null)}>Batal</button>
            <button className="btn-dark" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
