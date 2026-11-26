import { Link } from 'react-router-dom'
import { Instagram, Mail, MapPin, Phone, Youtube } from 'lucide-react'
import { Logo } from './Logo'
import { NAV } from './Navbar'
import { useSettings } from '@/lib/settings'

export function Footer() {
  const s = useSettings()
  return (
    <footer className="bg-navy-950 text-navy-200">
      <div className="container-x grid gap-10 py-14 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            Himpunan Mahasiswa Teknik Elektro Universitas Muhammadiyah Bandung. {s.site_tagline}.
          </p>
          <div className="mt-5 flex gap-3">
            {s.instagram && (
              <a href={s.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram HMTE" className="rounded-lg bg-white/5 p-2 hover:bg-cyan-500/20 hover:text-cyan-300">
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {s.youtube && (
              <a href={s.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube HMTE" className="rounded-lg bg-white/5 p-2 hover:bg-cyan-500/20 hover:text-cyan-300">
                <Youtube className="h-5 w-5" />
              </a>
            )}
            {s.email && (
              <a href={`mailto:${s.email}`} aria-label="Email HMTE" className="rounded-lg bg-white/5 p-2 hover:bg-cyan-500/20 hover:text-cyan-300">
                <Mail className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
        <div>
          <h2 className="mb-4 text-sm uppercase tracking-wider text-white">Navigasi</h2>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {NAV.map((n) => (
              <li key={n.to}><Link to={n.to} className="hover:text-cyan-300">{n.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-4 text-sm uppercase tracking-wider text-white">Kontak</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" aria-hidden="true" />{s.address}</li>
            {s.email && <li className="flex gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" aria-hidden="true" /><a href={`mailto:${s.email}`} className="break-all hover:text-cyan-300">{s.email}</a></li>}
            {s.phone && <li className="flex gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" aria-hidden="true" />{s.phone}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs">
        &copy; {new Date().getFullYear()} HMTE Universitas Muhammadiyah Bandung. Seluruh hak cipta dilindungi.
      </div>
    </footer>
  )
}
