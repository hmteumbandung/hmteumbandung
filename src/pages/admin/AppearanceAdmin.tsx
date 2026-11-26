import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Check, RotateCcw } from 'lucide-react'
import { ErrorBox, FormField, Loading } from '@/components/ui'
import { ICON_NAMES, NamedIcon } from '@/components/cards'
import { useReloadSettings } from '@/lib/settings'
import { supabase } from '@/lib/supabase'
import { applyTheme, THEMES } from '@/lib/themes'
import { cn, errorMessage } from '@/lib/utils'
import { ImageInput } from './ResourceManager'

const LABELS: Record<string, string> = {
  ui_logo_url: 'Logo HMTE', ui_favicon_url: 'Favicon', ui_og_image_url: 'Gambar pratinjau tautan (Open Graph)',
  ui_theme: 'Tema warna', ui_hero_image: 'Gambar hero', ui_hero_title: 'Judul hero', ui_hero_subtitle: 'Subjudul hero',
  ui_hero_btn1: 'Teks tombol 1', ui_hero_btn2: 'Teks tombol 2',
  ui_pillar1_title: 'Pilar 1 - judul', ui_pillar1_icon: 'Pilar 1 - ikon',
  ui_pillar2_title: 'Pilar 2 - judul', ui_pillar2_icon: 'Pilar 2 - ikon',
  ui_pillar3_title: 'Pilar 3 - judul', ui_pillar3_icon: 'Pilar 3 - ikon',
}
const KEYS = Object.keys(LABELS)

function Section({ title, desc, children }: { title: string; desc?: string; children: ReactNode }) {
  return (
    <section className="card p-6">
      <h2 className="text-lg">{title}</h2>
      {desc && <p className="mt-1 text-sm text-slate-500">{desc}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  )
}

export default function AppearanceAdmin() {
  const reloadSettings = useReloadSettings()
  const [saved, setSaved] = useState<Record<string, string>>({})
  const [v, setV] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [ok, setOk] = useState(false)
  const savedTheme = useRef('')

  useEffect(() => {
    void supabase.from('site_settings').select('key,value').like('key', 'ui\\_%').then(({ data, error: e }) => {
      if (e) setError(e.message)
      else {
        const m = Object.fromEntries(KEYS.map((k) => [k, ''])) as Record<string, string>
        for (const r of (data ?? []) as { key: string; value: string }[]) if (r.key in m) m[r.key] = r.value
        setSaved(m); setV(m); savedTheme.current = m.ui_theme
      }
      setLoading(false)
    })
    // keluar dari halaman tanpa menyimpan: kembalikan tema yang tersimpan
    return () => { applyTheme(savedTheme.current) }
  }, [])

  const set = (k: string, val: string) => { setV((p) => ({ ...p, [k]: val })); setOk(false) }
  const dirty = KEYS.some((k) => v[k] !== saved[k])

  async function persist(next: Record<string, string>) {
    setSaving(true); setError(''); setOk(false)
    try {
      const rows = KEYS.filter((k) => next[k] !== saved[k]).map((k) => ({ key: k, value: (next[k] ?? '').trim(), label: LABELS[k] }))
      if (rows.length) {
        const { error: e } = await supabase.from('site_settings').upsert(rows, { onConflict: 'key' })
        if (e) throw e
      }
      setSaved(next); setV(next); savedTheme.current = next.ui_theme
      applyTheme(next.ui_theme)
      reloadSettings()
      setOk(true)
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (v.ui_hero_title.length > 120) return setError('Judul hero maksimal 120 karakter.')
    if (v.ui_hero_subtitle.length > 300) return setError('Subjudul hero maksimal 300 karakter.')
    for (const n of [1, 2, 3]) if (v[`ui_pillar${n}_title`].length > 30) return setError(`Judul pilar ${n} maksimal 30 karakter.`)
    void persist(v)
  }

  if (loading) return <Loading />

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl">Tampilan Situs</h1>
        <p className="mt-1 text-sm text-slate-500">Ubah logo, warna, tampilan hero, dan ikon tanpa mengubah kode. Kolom yang dikosongkan memakai tampilan bawaan.</p>
      </div>
      {error && <ErrorBox message={error} />}
      {ok && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800" role="status">Tampilan disimpan dan langsung berlaku di website.</p>}

      <Section title="Logo dan identitas" desc="Gunakan PNG/WebP transparan agar rapi di latar gelap. Maksimal 5 MB.">
        <FormField label="Logo HMTE (navbar, footer, halaman Tentang, login)"><ImageInput value={v.ui_logo_url} onChange={(u) => set('ui_logo_url', u)} folder="branding" /></FormField>
        <FormField label="Favicon (ikon tab browser)" hint="Disarankan PNG persegi, minimal 64x64 px."><ImageInput value={v.ui_favicon_url} onChange={(u) => set('ui_favicon_url', u)} folder="branding" /></FormField>
        <FormField label="Gambar pratinjau saat tautan dibagikan" hint="Disarankan 1200x630 px. Catatan: aplikasi pembagi (mis. WhatsApp) membaca gambar bawaan di index.html; pengaturan ini berlaku untuk mesin yang menjalankan JavaScript."><ImageInput value={v.ui_og_image_url} onChange={(u) => set('ui_og_image_url', u)} folder="branding" /></FormField>
      </Section>

      <Section title="Warna tema" desc="Pilih palet. Pratinjau langsung terlihat di dashboard ini; klik Simpan agar berlaku untuk pengunjung.">
        <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Tema warna">
          {THEMES.map((t) => {
            const active = (v.ui_theme || THEMES[0].id) === t.id
            return (
              <button
                key={t.id} type="button" role="radio" aria-checked={active}
                onClick={() => { set('ui_theme', t.id === THEMES[0].id ? '' : t.id); applyTheme(t.id) }}
                className={cn('flex items-center gap-3 rounded-xl border p-3 text-left transition', active ? 'border-cyan-500 ring-2 ring-cyan-500/30' : 'border-slate-200 hover:border-slate-400')}
              >
                <span className="flex overflow-hidden rounded-lg">
                  {[t.navy[900], t.navy[700], t.accent[400], t.accent[500]].map((c) => <span key={c} className="h-10 w-6" style={{ background: c }} />)}
                </span>
                <span className="flex-1 text-sm font-semibold text-navy-900">{t.name}</span>
                {active && <Check className="h-4 w-4 text-cyan-600" aria-hidden="true" />}
              </button>
            )
          })}
        </div>
      </Section>

      <Section title="Hero beranda" desc="Bagian paling atas halaman beranda.">
        <FormField label="Gambar hero" hint="Bila kosong, ditampilkan ilustrasi rangkaian elektronik bawaan."><ImageInput value={v.ui_hero_image} onChange={(u) => set('ui_hero_image', u)} folder="branding" /></FormField>
        <FormField label="Judul" htmlFor="ui_hero_title" hint="Kosong = INOVASI, KOLABORASI, DAN KONTRIBUSI."><input id="ui_hero_title" className="input" maxLength={120} value={v.ui_hero_title} onChange={(e) => set('ui_hero_title', e.target.value)} /></FormField>
        <FormField label="Subjudul" htmlFor="ui_hero_subtitle"><textarea id="ui_hero_subtitle" rows={3} className="input" maxLength={300} value={v.ui_hero_subtitle} onChange={(e) => set('ui_hero_subtitle', e.target.value)} /></FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Teks tombol 1" htmlFor="ui_hero_btn1"><input id="ui_hero_btn1" className="input" maxLength={30} placeholder="Mengenal HMTE" value={v.ui_hero_btn1} onChange={(e) => set('ui_hero_btn1', e.target.value)} /></FormField>
          <FormField label="Teks tombol 2" htmlFor="ui_hero_btn2"><input id="ui_hero_btn2" className="input" maxLength={30} placeholder="Jelajahi Kegiatan" value={v.ui_hero_btn2} onChange={(e) => set('ui_hero_btn2', e.target.value)} /></FormField>
        </div>
      </Section>

      <Section title="Tiga pilar di beranda" desc="Judul dan ikon pada bagian Tentang HMTE. Ikon departemen diubah di menu Departemen.">
        {[1, 2, 3].map((n) => (
          <div key={n} className="grid items-end gap-4 sm:grid-cols-[1fr_auto]">
            <FormField label={`Pilar ${n} - judul`} htmlFor={`pt${n}`}><input id={`pt${n}`} className="input" maxLength={30} placeholder={['Inovasi', 'Kolaborasi', 'Kontribusi'][n - 1]} value={v[`ui_pillar${n}_title`]} onChange={(e) => set(`ui_pillar${n}_title`, e.target.value)} /></FormField>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-cyan-300"><NamedIcon name={v[`ui_pillar${n}_icon`]} fallback={['Layers', 'Users', 'Award'][n - 1]} className="h-5 w-5" /></span>
              <select className="input w-40" aria-label={`Ikon pilar ${n}`} value={v[`ui_pillar${n}_icon`]} onChange={(e) => set(`ui_pillar${n}_icon`, e.target.value)}>
                <option value="">Bawaan</option>
                {ICON_NAMES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>
        ))}
      </Section>

      <div className="flex flex-wrap items-center gap-3">
        <button className="btn-dark" disabled={saving || !dirty}>{saving ? 'Menyimpan...' : 'Simpan tampilan'}</button>
        <button
          type="button" className="btn-outline" disabled={saving}
          onClick={() => { if (window.confirm('Kembalikan seluruh tampilan ke bawaan? Gambar yang sudah diunggah tidak terhapus dari penyimpanan.')) void persist(Object.fromEntries(KEYS.map((k) => [k, ''])) as Record<string, string>) }}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> Kembalikan ke bawaan
        </button>
      </div>
    </form>
  )
}
