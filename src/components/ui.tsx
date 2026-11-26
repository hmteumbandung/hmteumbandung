import { useEffect, useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, ChevronRight, Loader2, X, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SectionHeading({
  eyebrow, title, desc, align = 'left', light,
}: { eyebrow?: string; title: string; desc?: string; align?: 'left' | 'center'; light?: boolean }) {
  return (
    <div className={cn('mb-10 max-w-2xl', align === 'center' && 'mx-auto text-center')}>
      {eyebrow && (
        <p className={cn('mb-2 text-xs font-bold uppercase tracking-[0.18em]', light ? 'text-cyan-300' : 'text-cyan-600')}>{eyebrow}</p>
      )}
      <h2 className={cn('text-2xl sm:text-3xl', light && 'text-white')}>{title}</h2>
      {desc && <p className={cn('mt-3 leading-relaxed', light ? 'text-navy-200' : 'text-slate-600')}>{desc}</p>}
    </div>
  )
}

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  )
}

export function PageHeader({ title, desc, crumbs = [] }: { title: string; desc?: string; crumbs?: { label: string; to?: string }[] }) {
  return (
    <header className="relative overflow-hidden bg-navy-900 pb-12 pt-28 text-white sm:pb-16 sm:pt-32">
      <div className="grid-bg absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" aria-hidden="true" />
      <div className="container-x relative">
        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-xs text-navy-200">
          <Link to="/" className="hover:text-cyan-300">Beranda</Link>
          {crumbs.map((c) => (
            <span key={c.label} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
              {c.to ? <Link to={c.to} className="hover:text-cyan-300">{c.label}</Link> : <span className="text-white">{c.label}</span>}
            </span>
          ))}
        </nav>
        <h1 className="text-3xl text-white sm:text-4xl">{title}</h1>
        {desc && <p className="mt-3 max-w-2xl text-navy-200">{desc}</p>}
      </div>
    </header>
  )
}

export function Placeholder({ label, className }: { label?: string; className?: string }) {
  return (
    <div
      className={cn('relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-navy-800 to-navy-950', className)}
      role="img"
      aria-label={label ?? 'Gambar belum tersedia'}
    >
      <div className="grid-bg absolute inset-0" aria-hidden="true" />
      <Zap className="relative h-8 w-8 text-cyan-400/70" aria-hidden="true" />
    </div>
  )
}

/** Gambar responsif dengan lazy loading; memakai placeholder bila URL kosong. */
export function Img({ src, alt, className, ratio = 'aspect-[16/10]' }: { src?: string | null; alt: string; className?: string; ratio?: string }) {
  return (
    <div className={cn('overflow-hidden bg-slate-100', ratio, className)}>
      {src ? (
        <img src={src} alt={alt} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      ) : (
        <Placeholder label={alt} />
      )}
    </div>
  )
}

export function Loading({ label = 'Memuat data...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500" role="status">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> {label}
    </div>
  )
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-8 text-center" role="alert">
      <AlertCircle className="h-6 w-6 text-red-600" aria-hidden="true" />
      <p className="text-sm text-red-700">{message}</p>
      {onRetry && <button className="btn-outline btn-sm" onClick={onRetry}>Coba lagi</button>}
    </div>
  )
}

export function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">{text}</div>
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    ref.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prev?.focus()
    }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-navy-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn('max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl outline-none sm:rounded-2xl', wide ? 'sm:max-w-3xl' : 'sm:max-w-lg')}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
          <h2 className="text-base">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Tutup">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function FormField({ label, error, hint, children, htmlFor }: { label: string; error?: string; hint?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div>
      <label className="label" htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  )
}
