import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Lock } from 'lucide-react'
import { LogoMark } from '@/components/Logo'
import { Loading, FormField } from '@/components/ui'
import { useAuth } from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/supabase'
import { errorMessage } from '@/lib/utils'

const schema = z.object({ email: z.string().trim().email('Email tidak valid'), password: z.string().min(6, 'Kata sandi minimal 6 karakter') })

export default function Login() {
  const { session, profile, loading, signIn, signOut } = useAuth()
  const nav = useNavigate()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [fail, setFail] = useState('')
  const [busy, setBusy] = useState(false)

  if (loading) return <Loading />
  if (session && profile?.is_active) return <Navigate to="/admin" replace />

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const r = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)))
    if (!r.success) return setErrors(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message])))
    setErrors({}); setFail(''); setBusy(true)
    try { await signIn(r.data.email, r.data.password); nav('/admin') } catch (err) { setFail(errorMessage(err)) } finally { setBusy(false) }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-navy-950 px-4">
      <div className="grid-bg absolute inset-0" aria-hidden="true" />
      <div className="card relative w-full max-w-sm p-8">
        <LogoMark className="mx-auto h-14 w-14" />
        <h1 className="mt-4 text-center text-xl">Masuk Dashboard HMTE</h1>
        <p className="mt-1 text-center text-sm text-slate-500">Khusus pengurus dan admin</p>

        {!isSupabaseConfigured && (
          <p className="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-800" role="alert">
            Supabase belum dikonfigurasi, sehingga login tidak tersedia (mode demo). Isi file <code>.env</code> sesuai README.
          </p>
        )}
        {session && profile && !profile.is_active && (
          <div className="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-800" role="alert">
            Akun Anda belum diaktifkan. Hubungi Super Admin.
            <button className="mt-2 block text-xs font-semibold underline" onClick={() => void signOut()}>Keluar</button>
          </div>
        )}

        <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
          <FormField label="Email" htmlFor="l-email" error={errors.email}><input id="l-email" name="email" type="email" className="input" autoComplete="username" /></FormField>
          <FormField label="Kata sandi" htmlFor="l-pass" error={errors.password}><input id="l-pass" name="password" type="password" className="input" autoComplete="current-password" /></FormField>
          {fail && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{fail}</p>}
          <button className="btn-dark w-full" disabled={busy || !isSupabaseConfigured}><Lock className="h-4 w-4" aria-hidden="true" /> {busy ? 'Masuk...' : 'Masuk'}</button>
        </form>
      </div>
    </div>
  )
}
