import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useSettings } from '@/lib/settings'

export function LogoMark({ className }: { className?: string }) {
  const custom = useSettings().ui_logo_url
  if (custom) return <img src={custom} alt="Logo HMTE" className={cn('h-9 w-9 object-contain', className)} />
  return (
    <svg viewBox="0 0 40 40" className={cn('h-9 w-9', className)} role="img" aria-label="Logo HMTE">
      <rect width="40" height="40" rx="10" style={{ fill: 'rgb(var(--navy-900))' }} />
      <rect x="1" y="1" width="38" height="38" rx="9" fill="none" strokeOpacity=".5" style={{ stroke: 'rgb(var(--cyan-400))' }} />
      <path d="M5 21c3 0 3-9 6.5-9S15 28 18.5 28 22 12 25.5 12 29 21 35 21" fill="none" strokeWidth="2.4" strokeLinecap="round" style={{ stroke: 'rgb(var(--cyan-400))' }} />
    </svg>
  )
}

export function Logo({ light = true, className }: { light?: boolean; className?: string }) {
  return (
    <Link to="/" className={cn('flex items-center gap-2.5', className)} aria-label="HMTE UM Bandung - Beranda">
      <LogoMark />
      <span className="leading-tight">
        <span className={cn('block text-base font-extrabold tracking-tight', light ? 'text-white' : 'text-navy-900')}>HMTE</span>
        <span className={cn('block text-[10px] font-medium uppercase tracking-wider', light ? 'text-navy-200' : 'text-slate-500')}>UM Bandung</span>
      </span>
    </Link>
  )
}
