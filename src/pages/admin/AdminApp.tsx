import { Navigate, Route, Routes } from 'react-router-dom'
import { useSEO } from '@/lib/seo'
import { AdminLayout } from './AdminLayout'
import Login from './Login'
import Dashboard from './Dashboard'
import { ResourceManager } from './ResourceManager'
import { RESOURCES } from './resources'
import TicketsAdmin from './TicketsAdmin'
import MessagesAdmin from './MessagesAdmin'
import UsersAdmin from './UsersAdmin'
import SettingsAdmin from './SettingsAdmin'
import AppearanceAdmin from './AppearanceAdmin'
import { RequireRole } from './RequireRole'
import type { AppRole } from '@/lib/types'

const ALL: AppRole[] = ['super_admin', 'admin', 'editor', 'pengurus']
const STAFF: AppRole[] = ['super_admin', 'admin', 'pengurus']
const ADMINS: AppRole[] = ['super_admin', 'admin']

export default function AdminApp() {
  useSEO({ title: 'Dashboard Admin', noindex: true })
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        {Object.entries(RESOURCES).map(([path, cfg]) => (
          <Route key={path} path={path} element={<RequireRole roles={ALL}><ResourceManager key={path} cfg={cfg} /></RequireRole>} />
        ))}
        <Route path="tiket" element={<RequireRole roles={STAFF}><TicketsAdmin /></RequireRole>} />
        <Route path="pesan" element={<RequireRole roles={STAFF}><MessagesAdmin /></RequireRole>} />
        <Route path="pengguna" element={<RequireRole roles={['super_admin']}><UsersAdmin /></RequireRole>} />
        <Route path="tampilan" element={<RequireRole roles={ADMINS}><AppearanceAdmin /></RequireRole>} />
        <Route path="pengaturan" element={<RequireRole roles={ADMINS}><SettingsAdmin /></RequireRole>} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  )
}
