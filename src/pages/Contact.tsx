import { useState, type FormEvent } from 'react'
import { CheckCircle2, Mail, MapPin, Phone } from 'lucide-react'
import { z } from 'zod'
import { FormField, PageHeader } from '@/components/ui'
import { api } from '@/lib/api'
import { useSettings } from '@/lib/settings'
import { useSEO } from '@/lib/seo'
import { errorMessage } from '@/lib/utils'

const schema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(100),
  email: z.string().trim().email('Format email tidak valid'),
  subject: z.string().trim().min(3, 'Subjek minimal 3 karakter').max(150),
  message: z.string().trim().min(10, 'Pesan minimal 10 karakter').max(4000),
})

export default function Contact() {
  const s = useSettings()
  useSEO({ title: 'Kontak', description: 'Hubungi HMTE UM Bandung.' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [fail, setFail] = useState('')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    if (fd.get('website')) return // honeypot untuk bot
    const r = schema.safeParse(Object.fromEntries(fd))
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message])))
      return
    }
    setErrors({}); setFail(''); setBusy(true)
    try {
      await api.submitMessage(r.data as { name: string; email: string; subject: string; message: string })
      setDone(true); form.reset()
    } catch (err) {
      setFail(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader title="Kontak" desc="Punya pertanyaan atau ingin berkolaborasi? Kirim pesan kepada kami." crumbs={[{ label: 'Kontak' }]} />
      <div className="container-x section grid gap-8 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          {[
            { I: MapPin, t: 'Alamat', v: s.address },
            { I: Mail, t: 'Email', v: s.email, href: `mailto:${s.email}` },
            { I: Phone, t: 'Telepon / WhatsApp', v: s.phone },
          ].map(({ I, t, v, href }) => v && (
            <div key={t} className="card flex gap-4 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-cyan-300"><I className="h-5 w-5" aria-hidden="true" /></span>
              <div><p className="text-sm font-bold text-navy-900">{t}</p>{href ? <a href={href} className="break-all text-sm text-slate-600 hover:text-cyan-600">{v}</a> : <p className="text-sm text-slate-600">{v}</p>}</div>
            </div>
          ))}
        </div>
        <form onSubmit={onSubmit} noValidate className="card space-y-4 p-6 lg:col-span-3" aria-label="Formulir kontak">
          {done ? (
            <div className="py-10 text-center" role="status">
              <CheckCircle2 className="mx-auto h-12 w-12 text-cyan-500" aria-hidden="true" />
              <h2 className="mt-3 text-xl">Pesan terkirim</h2>
              <p className="mt-1 text-sm text-slate-600">Terima kasih, kami akan menghubungi Anda melalui email.</p>
              <button type="button" className="btn-outline mt-5" onClick={() => setDone(false)}>Kirim pesan lain</button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Nama" htmlFor="c-name" error={errors.name}><input id="c-name" name="name" className="input" autoComplete="name" maxLength={100} /></FormField>
                <FormField label="Email" htmlFor="c-email" error={errors.email}><input id="c-email" name="email" type="email" className="input" autoComplete="email" /></FormField>
              </div>
              <FormField label="Subjek" htmlFor="c-subject" error={errors.subject}><input id="c-subject" name="subject" className="input" maxLength={150} /></FormField>
              <FormField label="Pesan" htmlFor="c-message" error={errors.message}><textarea id="c-message" name="message" rows={6} className="input" maxLength={4000} /></FormField>
              <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              {fail && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{fail}</p>}
              <button className="btn-primary" disabled={busy}>{busy ? 'Mengirim...' : 'Kirim pesan'}</button>
            </>
          )}
        </form>
      </div>
    </>
  )
}
