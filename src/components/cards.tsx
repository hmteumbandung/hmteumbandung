import { Link } from 'react-router-dom'
import {
  Calendar, MapPin, Radio, Users, GraduationCap, Handshake, Lightbulb, HeartHandshake, Zap, Cpu, Layers, Award, Rocket, Target,
  ShieldCheck, Star, Globe, BookOpen, Wrench, Trophy, Heart, Megaphone, type LucideIcon,
} from 'lucide-react'
import { Img } from './ui'
import { cn, formatDate, formatDateShort, formatTime, initials } from '@/lib/utils'
import type { Article, EventItem, Member } from '@/lib/types'

const ICONS: Record<string, LucideIcon> = {
  Radio, Users, GraduationCap, Handshake, Lightbulb, HeartHandshake, Zap, Cpu, Layers, Award, Rocket, Target,
  ShieldCheck, Star, Globe, BookOpen, Wrench, Trophy, Heart, Megaphone,
}
/** Daftar nama ikon yang dapat dipilih dari dashboard. */
export const ICON_NAMES = Object.keys(ICONS)
export const NamedIcon = ({ name, fallback = 'Cpu', className }: { name?: string | null; fallback?: string; className?: string }) => {
  const I = (name && ICONS[name]) || ICONS[fallback] || Cpu
  return <I className={className} aria-hidden="true" />
}
export const DeptIcon = NamedIcon

export function Avatar({ member, className }: { member: Pick<Member, 'full_name' | 'photo_url'>; className?: string }) {
  return member.photo_url ? (
    <img src={member.photo_url} alt={member.full_name} loading="lazy" decoding="async" className={cn('rounded-full object-cover', className)} />
  ) : (
    <div className={cn('flex items-center justify-center rounded-full bg-gradient-to-br from-navy-700 to-navy-900 font-bold text-cyan-300', className)} role="img" aria-label={member.full_name}>
      {initials(member.full_name)}
    </div>
  )
}

export function ArticleCard({ a, compact }: { a: Article; compact?: boolean }) {
  return (
    <article className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-glow">
      <Link to={`/berita/${a.slug}`} className="block">
        <Img src={a.thumbnail_url} alt={`Thumbnail: ${a.title}`} />
        <div className="p-5">
          <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="badge">{a.category}</span>
            <time dateTime={a.published_at ?? undefined}>{formatDate(a.published_at)}</time>
          </div>
          <h3 className="text-base leading-snug group-hover:text-cyan-600">{a.title}</h3>
          {!compact && a.excerpt && <p className="mt-2 line-clamp-3 text-sm text-slate-600">{a.excerpt}</p>}
          <p className="mt-3 text-xs text-slate-500">Oleh {a.author_name}</p>
        </div>
      </Link>
    </article>
  )
}

export function EventCard({ e, onOpen }: { e: EventItem; onOpen?: (e: EventItem) => void }) {
  const start = new Date(e.starts_at)
  return (
    <button onClick={() => onOpen?.(e)} className="card group flex w-full gap-4 p-4 text-left transition hover:border-cyan-500">
      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-navy-900 text-white">
        <span className="text-xl font-extrabold leading-none">{start.toLocaleDateString('id-ID', { day: 'numeric', timeZone: 'Asia/Jakarta' })}</span>
        <span className="text-[10px] uppercase text-cyan-300">{start.toLocaleDateString('id-ID', { month: 'short', timeZone: 'Asia/Jakarta' })}</span>
      </div>
      <div className="min-w-0">
        <h3 className="text-sm leading-snug group-hover:text-cyan-600">{e.title}</h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500"><Calendar className="h-3.5 w-3.5" aria-hidden="true" />{formatDateShort(e.starts_at)}, {formatTime(e.starts_at)}</p>
        {e.location && <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500"><MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />{e.location}</p>}
      </div>
    </button>
  )
}
