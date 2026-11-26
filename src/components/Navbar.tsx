import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Logo } from './Logo'
import { cn } from '@/lib/utils'

export const NAV = [
  { to: '/', label: 'Beranda' },
  { to: '/tentang', label: 'Tentang Kami' },
  { to: '/kabinet', label: 'Kabinet' },
  { to: '/departemen', label: 'Departemen' },
  { to: '/berita', label: 'Berita' },
  { to: '/kegiatan', label: 'Kegiatan' },
  { to: '/akademik', label: 'Akademik' },
  { to: '/layanan', label: 'Layanan' },
  { to: '/kontak', label: 'Kontak' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [pathname])
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <header className={cn('fixed inset-x-0 top-0 z-50 transition', scrolled || open ? 'bg-navy-900/95 shadow-lg backdrop-blur' : 'bg-transparent')}>
      <div className="container-x flex h-16 items-center justify-between">
        <Logo />
        <nav aria-label="Navigasi utama" className="hidden items-center gap-0.5 xl:flex">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                cn('rounded-lg px-3 py-2 text-sm font-medium transition', isActive ? 'bg-white/10 text-cyan-300' : 'text-navy-100 hover:bg-white/5 hover:text-white')
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <button
          className="rounded-lg p-2 text-white xl:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Navigasi seluler" className="container-x grid gap-1 pb-4 xl:hidden">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) => cn('rounded-lg px-3 py-2.5 text-sm font-medium', isActive ? 'bg-white/10 text-cyan-300' : 'text-navy-100')}
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
