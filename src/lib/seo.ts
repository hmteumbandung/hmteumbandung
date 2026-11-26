import { useEffect } from 'react'
import { useSettings } from './settings'

const SITE = 'HMTE UM Bandung'
const SITE_URL = ((import.meta.env.VITE_SITE_URL as string | undefined) ?? '').replace(/\/$/, '')

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = href
}

interface SEOProps {
  title?: string
  description?: string
  image?: string | null
  type?: 'website' | 'article'
  noindex?: boolean
}

/** Mengatur title, meta description, Open Graph, dan canonical untuk setiap halaman (SPA). */
export function useSEO({ title, description, image, type = 'website', noindex }: SEOProps) {
  const ogDefault = useSettings().ui_og_image_url
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE}` : `${SITE} - Himpunan Mahasiswa Teknik Elektro UM Bandung`
    const desc =
      description ??
      'Website resmi Himpunan Mahasiswa Teknik Elektro (HMTE) Universitas Muhammadiyah Bandung.'
    const path = window.location.pathname
    const base = SITE_URL || window.location.origin
    const img = image ?? (ogDefault || `${base}/og-image.svg`)

    document.title = fullTitle
    setMeta('name', 'description', desc)
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', desc)
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:url', `${base}${path}`)
    setMeta('property', 'og:image', img)
    setMeta('name', 'twitter:card', 'summary_large_image')
    setCanonical(`${base}${path}`)
  }, [title, description, image, type, noindex, ogDefault])
}
