import { ICON_NAMES } from '@/components/cards'
import { ACADEMIC_CATEGORIES, ARTICLE_CATEGORIES, type AppRole } from '@/lib/types'
import { formatDate, formatDateShort } from '@/lib/utils'
import type { ResourceConfig } from './ResourceManager'

const ADMIN: AppRole[] = ['super_admin', 'admin']
const EDITOR: AppRole[] = ['super_admin', 'admin', 'editor']
const opts = (a: readonly string[]) => a.map((v) => ({ value: v, label: v }))
const yesNo = (v: unknown) => (v ? 'Ya' : 'Tidak')

export const RESOURCES: Record<string, ResourceConfig> = {
  berita: {
    table: 'articles', title: 'Berita dan Artikel', singular: 'artikel', writeRoles: EDITOR, slugFrom: 'title', imageFolder: 'articles',
    order: { column: 'created_at', ascending: false }, searchKeys: ['title', 'category', 'author_name'],
    defaults: { category: 'Organisasi', status: 'draft', author_name: 'Tim Kominfo HMTE', content: '' },
    columns: [
      { key: 'title', label: 'Judul' }, { key: 'category', label: 'Kategori' },
      { key: 'status', label: 'Status', render: (r) => (r.status === 'published' ? 'Terbit' : 'Draf') },
      { key: 'published_at', label: 'Terbit', render: (r) => formatDate(r.published_at as string) },
    ],
    fields: [
      { name: 'title', label: 'Judul', type: 'text', required: true, max: 200, full: true },
      { name: 'slug', label: 'Slug URL', type: 'text', max: 100, help: 'Kosongkan untuk dibuat otomatis dari judul.' },
      { name: 'category', label: 'Kategori', type: 'select', required: true, options: opts(ARTICLE_CATEGORIES) },
      { name: 'author_name', label: 'Penulis', type: 'text', required: true, max: 100 },
      { name: 'status', label: 'Status', type: 'select', required: true, options: [{ value: 'draft', label: 'Draf' }, { value: 'published', label: 'Terbit' }] },
      { name: 'published_at', label: 'Tanggal terbit', type: 'datetime', help: 'Kosong = sekarang saat diterbitkan. Isi tanggal masa depan untuk menjadwalkan.' },
      { name: 'excerpt', label: 'Ringkasan', type: 'textarea', max: 300, rows: 3 },
      { name: 'thumbnail_url', label: 'Thumbnail', type: 'image' },
      { name: 'content', label: 'Isi artikel', type: 'textarea', required: true, rows: 12, help: 'Teks biasa; pisahkan paragraf dengan baris kosong.' },
    ],
  },
  pengurus: {
    table: 'members', title: 'Data Pengurus', singular: 'pengurus', writeRoles: ADMIN, imageFolder: 'members',
    description: 'Tambah, ubah, atau hapus pengurus. Level menentukan posisinya pada bagan struktur.',
    order: { column: 'sort_order', ascending: true }, searchKeys: ['full_name', 'position'],
    defaults: { level: 3, sort_order: 0 },
    columns: [
      { key: 'full_name', label: 'Nama' }, { key: 'position', label: 'Jabatan' },
      { key: 'level', label: 'Level' },
      { key: 'department_id', label: 'Departemen', render: (r, l) => l.department_id?.[String(r.department_id)] ?? '-' },
    ],
    fields: [
      { name: 'full_name', label: 'Nama lengkap', type: 'text', required: true, max: 100 },
      { name: 'position', label: 'Jabatan', type: 'text', required: true, max: 100 },
      { name: 'level', label: 'Level hierarki', type: 'select', required: true, options: [{ value: 0, label: '0 - Ketua Umum' }, { value: 1, label: '1 - Wakil/Sekretaris/Bendahara' }, { value: 2, label: '2 - Kepala Departemen' }, { value: 3, label: '3 - Staf/Anggota' }] },
      { name: 'department_id', label: 'Departemen', type: 'relation', relation: { table: 'departments', label: 'name' } },
      { name: 'cabinet_id', label: 'Kabinet', type: 'relation', relation: { table: 'cabinets', label: 'name' } },
      { name: 'sort_order', label: 'Urutan', type: 'number', min: 0 },
      { name: 'instagram', label: 'Instagram', type: 'text', max: 60 },
      { name: 'photo_url', label: 'Foto', type: 'image' },
      { name: 'bio', label: 'Profil singkat', type: 'textarea', max: 600, rows: 4 },
    ],
  },
  kabinet: {
    table: 'cabinets', title: 'Struktur Kabinet', singular: 'kabinet', writeRoles: ADMIN, imageFolder: 'cabinets',
    description: 'Hanya satu kabinet yang dapat berstatus aktif. Nonaktifkan kabinet lama sebelum mengaktifkan yang baru.',
    order: { column: 'created_at', ascending: false }, searchKeys: ['name', 'period'],
    defaults: { is_current: false },
    columns: [{ key: 'name', label: 'Nama' }, { key: 'period', label: 'Periode' }, { key: 'is_current', label: 'Aktif', render: (r) => yesNo(r.is_current) }],
    fields: [
      { name: 'name', label: 'Nama kabinet', type: 'text', required: true, max: 100 },
      { name: 'period', label: 'Periode', type: 'text', required: true, max: 20 },
      { name: 'tagline', label: 'Tagline', type: 'text', max: 150, full: true },
      { name: 'logo_url', label: 'Logo kabinet', type: 'image' },
      { name: 'is_current', label: 'Kabinet aktif', type: 'checkbox' },
      { name: 'philosophy', label: 'Filosofi', type: 'textarea', rows: 4 },
      { name: 'vision', label: 'Visi', type: 'textarea', rows: 3 },
      { name: 'mission', label: 'Misi (satu per baris)', type: 'lines' },
    ],
  },
  departemen: {
    table: 'departments', title: 'Departemen', singular: 'departemen', writeRoles: ADMIN, slugFrom: 'name',
    order: { column: 'sort_order', ascending: true }, searchKeys: ['name', 'slug'], defaults: { sort_order: 0, icon: 'Cpu' },
    columns: [{ key: 'name', label: 'Nama' }, { key: 'slug', label: 'Slug' }, { key: 'sort_order', label: 'Urutan' }],
    fields: [
      { name: 'name', label: 'Nama departemen', type: 'text', required: true, max: 100 },
      { name: 'slug', label: 'Slug URL', type: 'text', max: 60, help: 'Kosongkan untuk otomatis.' },
      { name: 'icon', label: 'Ikon', type: 'select', required: true, options: opts(ICON_NAMES) },
      { name: 'sort_order', label: 'Urutan', type: 'number', min: 0 },
      { name: 'description', label: 'Deskripsi', type: 'textarea', rows: 4 },
    ],
  },
  proker: {
    table: 'programs', title: 'Program Kerja', singular: 'program kerja', writeRoles: EDITOR,
    order: { column: 'created_at', ascending: false }, searchKeys: ['title', 'description'],
    defaults: { status: 'planned', is_featured: false, year: new Date().getFullYear() },
    columns: [
      { key: 'title', label: 'Program' },
      { key: 'department_id', label: 'Departemen', render: (r, l) => l.department_id?.[String(r.department_id)] ?? '-' },
      { key: 'status', label: 'Status' }, { key: 'is_featured', label: 'Unggulan', render: (r) => yesNo(r.is_featured) },
    ],
    fields: [
      { name: 'title', label: 'Nama program', type: 'text', required: true, max: 150, full: true },
      { name: 'department_id', label: 'Departemen', type: 'relation', relation: { table: 'departments', label: 'name' } },
      { name: 'status', label: 'Status', type: 'select', required: true, options: [{ value: 'planned', label: 'Direncanakan' }, { value: 'ongoing', label: 'Berjalan' }, { value: 'done', label: 'Selesai' }] },
      { name: 'year', label: 'Tahun', type: 'number', required: true, min: 2000 },
      { name: 'is_featured', label: 'Program unggulan (tampil di beranda)', type: 'checkbox' },
      { name: 'description', label: 'Deskripsi', type: 'textarea', rows: 4 },
    ],
  },
  agenda: {
    table: 'events', title: 'Agenda Kegiatan', singular: 'kegiatan', writeRoles: EDITOR, slugFrom: 'title', imageFolder: 'events',
    order: { column: 'starts_at', ascending: false }, searchKeys: ['title', 'location'], defaults: { is_published: true },
    columns: [
      { key: 'title', label: 'Kegiatan' }, { key: 'starts_at', label: 'Mulai', render: (r) => formatDateShort(r.starts_at as string) },
      { key: 'location', label: 'Lokasi' }, { key: 'is_published', label: 'Tayang', render: (r) => yesNo(r.is_published) },
    ],
    fields: [
      { name: 'title', label: 'Judul kegiatan', type: 'text', required: true, max: 200, full: true },
      { name: 'slug', label: 'Slug URL', type: 'text', max: 100, help: 'Kosongkan untuk otomatis.' },
      { name: 'location', label: 'Lokasi', type: 'text', max: 200 },
      { name: 'starts_at', label: 'Mulai', type: 'datetime', required: true },
      { name: 'ends_at', label: 'Selesai', type: 'datetime' },
      { name: 'registration_url', label: 'Tautan pendaftaran', type: 'url', max: 300 },
      { name: 'poster_url', label: 'Poster', type: 'image' },
      { name: 'is_published', label: 'Tayangkan di website', type: 'checkbox' },
      { name: 'description', label: 'Deskripsi', type: 'textarea', rows: 5 },
    ],
  },
  galeri: {
    table: 'gallery', title: 'Galeri Dokumentasi', singular: 'foto', writeRoles: EDITOR, imageFolder: 'gallery',
    order: { column: 'created_at', ascending: false }, searchKeys: ['title'],
    columns: [
      { key: 'title', label: 'Judul' }, { key: 'taken_at', label: 'Tanggal', render: (r) => formatDateShort(r.taken_at as string) },
      { key: 'event_id', label: 'Kegiatan', render: (r, l) => l.event_id?.[String(r.event_id)] ?? '-' },
    ],
    fields: [
      { name: 'title', label: 'Judul / keterangan', type: 'text', required: true, max: 150, full: true },
      { name: 'image_url', label: 'Foto', type: 'image', required: true },
      { name: 'taken_at', label: 'Tanggal pengambilan', type: 'date' },
      { name: 'event_id', label: 'Kegiatan terkait', type: 'relation', relation: { table: 'events', label: 'title' } },
      { name: 'department_id', label: 'Departemen terkait', type: 'relation', relation: { table: 'departments', label: 'name' } },
    ],
  },
  akademik: {
    table: 'academic_items', title: 'Informasi Akademik', singular: 'informasi', writeRoles: EDITOR,
    order: { column: 'created_at', ascending: false }, searchKeys: ['title', 'category'], defaults: { category: 'Informasi Perkuliahan', is_published: true },
    columns: [
      { key: 'title', label: 'Judul' }, { key: 'category', label: 'Kategori' },
      { key: 'deadline', label: 'Batas', render: (r) => formatDateShort(r.deadline as string) }, { key: 'is_published', label: 'Tayang', render: (r) => yesNo(r.is_published) },
    ],
    fields: [
      { name: 'title', label: 'Judul', type: 'text', required: true, max: 200, full: true },
      { name: 'category', label: 'Kategori', type: 'select', required: true, options: opts(ACADEMIC_CATEGORIES) },
      { name: 'deadline', label: 'Batas waktu', type: 'date' },
      { name: 'url', label: 'Tautan', type: 'url', max: 400 },
      { name: 'is_published', label: 'Tayangkan di website', type: 'checkbox' },
      { name: 'description', label: 'Deskripsi', type: 'textarea', rows: 4 },
    ],
  },
}
