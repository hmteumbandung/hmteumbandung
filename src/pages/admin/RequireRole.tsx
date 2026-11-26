import type { ReactNode } from 'react'
import { ShieldX } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import type { AppRole } from '@/lib/types'

/** Pembatas akses di UI. Penegakan sebenarnya dilakukan oleh RLS di database. */
export function RequireRole({ roles, children }: { roles: AppRole[]; children: ReactNode }) {
  const { can } = useAuth()
  if (can(roles)) return <>{children}</>
  return (
    <div className="card mx-auto mt-10 max-w-md p-8 text-center">
      <ShieldX className="mx-auto h-10 w-10 text-red-500" aria-hidden="true" />
      <h1 className="mt-3 text-xl">Akses ditolak</h1>
      <p className="mt-1 text-sm text-slate-600">Role Anda tidak memiliki izin untuk membuka halaman ini.</p>
    </div>
  )
}
