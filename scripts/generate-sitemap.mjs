// Membuat dist/sitemap.xml saat build. Memakai hanya anon key (data publik), aman dijalankan di CI.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

function loadEnv() {
  const env = { ...process.env }
  for (const f of ['.env.production', '.env']) {
    if (!existsSync(f)) continue
    for (const line of readFileSync(f, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && env[m[1]] === undefined) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
  return env
}

const env = loadEnv()
const site = (env.VITE_SITE_URL || '').replace(/\/$/, '')
if (!site) {
  console.warn('[sitemap] VITE_SITE_URL belum diisi; sitemap dilewati.')
  process.exit(0)
}

const urls = ['', '/tentang', '/kabinet', '/departemen', '/berita', '/kegiatan', '/akademik', '/layanan', '/kontak'].map((p) => ({ loc: p, prio: p === '' ? '1.0' : '0.7' }))

const sb = env.VITE_SUPABASE_URL
const key = env.VITE_SUPABASE_ANON_KEY
if (sb && key && !sb.includes('xxxxxxxx')) {
  const get = async (q) => {
    try {
      const r = await fetch(`${sb}/rest/v1/${q}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
      return r.ok ? await r.json() : []
    } catch { return [] }
  }
  for (const a of await get('articles?select=slug,updated_at&status=eq.published')) urls.push({ loc: `/berita/${a.slug}`, prio: '0.6', last: a.updated_at })
  for (const d of await get('departments?select=slug')) urls.push({ loc: `/departemen/${d.slug}`, prio: '0.6' })
} else {
  console.warn('[sitemap] Supabase belum dikonfigurasi; hanya halaman statis yang dimasukkan.')
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
  .map((u) => `  <url><loc>${esc(site + u.loc)}</loc>${u.last ? `<lastmod>${u.last.slice(0, 10)}</lastmod>` : ''}<priority>${u.prio}</priority></url>`)
  .join('\n')}\n</urlset>\n`
writeFileSync('dist/sitemap.xml', xml)
writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${site}/sitemap.xml\n`)
console.log(`[sitemap] ${urls.length} URL ditulis ke dist/sitemap.xml`)
