// Data contoh yang dipakai HANYA bila Supabase belum dikonfigurasi (mode demo / pratinjau lokal).
// Isinya mencerminkan supabase/seed.sql. Semua nama dan angka adalah dummy.
import type {
  AcademicItem, Article, Cabinet, Department, EventItem, GalleryItem, Member, Program, Settings,
} from '@/lib/types'

const day = 86_400_000
const ago = (d: number) => new Date(Date.now() - d * day).toISOString()
const ahead = (d: number, hours = 0) => new Date(Date.now() + d * day + hours * 3_600_000).toISOString()
const dateOnly = (d: number) => new Date(Date.now() + d * day).toISOString().slice(0, 10)

export const demoSettings: Settings = {
  site_name: 'HMTE UM Bandung',
  site_tagline: 'Inovasi, Kolaborasi, dan Kontribusi',
  stat_members: '186',
  stat_pengurus: '42',
  stat_programs: '24',
  stat_events: '38',
  address: 'Fakultas Teknik, Universitas Muhammadiyah Bandung, Jl. Soekarno-Hatta No. 752, Cipamokolan, Bandung',
  email: 'medkominfo.hmteumbandung@gmail.com',
  phone: '+62 812-0000-0000',
  instagram: 'https://instagram.com/hmte.umbandung',
  youtube: 'https://youtube.com/@hmteumbandung',
  about_short:
    'HMTE adalah wadah aspirasi, pengembangan potensi, kreativitas, dan intelektualitas mahasiswa Teknik Elektro Universitas Muhammadiyah Bandung.',
  history:
    'HMTE dibentuk oleh mahasiswa Program Studi Teknik Elektro sebagai wadah kaderisasi, keilmuan, dan pengabdian. Dari masa ke masa, HMTE berkembang menjadi organisasi yang aktif menyelenggarakan kegiatan akademik, pelatihan teknis, kompetisi, dan kegiatan sosial kemasyarakatan. (Contoh teks: ganti dengan sejarah resmi.)',
  vision:
    'Menjadi himpunan mahasiswa yang unggul, inovatif, dan berintegritas dalam mengembangkan keilmuan Teknik Elektro berlandaskan nilai-nilai Islam.',
  mission:
    'Menyelenggarakan kegiatan keilmuan dan keprofesian|Membangun kolaborasi internal dan eksternal|Memfasilitasi aspirasi dan kesejahteraan mahasiswa|Mengabdikan keilmuan kepada masyarakat',
  goals:
    'Mengembangkan kompetensi akademik dan nonakademik anggota|Menumbuhkan jiwa kepemimpinan dan organisasi|Menjalin hubungan dengan alumni, industri, dan himpunan lain',
  logo_philosophy:
    'Gelombang sinusoidal melambangkan dinamika energi dan sinyal; warna biru tua mencerminkan keilmuan dan profesionalisme; warna cyan melambangkan inovasi dan teknologi. (Contoh teks: ganti dengan filosofi logo resmi.)',
  org_info:
    'Berkedudukan di Fakultas Teknik Universitas Muhammadiyah Bandung. Dipimpin Ketua Umum yang dipilih melalui musyawarah mahasiswa Teknik Elektro dan bekerja dalam periode satu tahun kepengurusan.',
}

export const demoCabinet: Cabinet = {
  id: 'cab-1',
  name: 'Kabinet Resonansi',
  period: '2026/2027',
  tagline: 'Selaras dalam Gerak, Bergema dalam Karya',
  logo_url: null,
  philosophy:
    'Resonansi terjadi ketika sebuah sistem bergetar pada frekuensi yang selaras sehingga amplitudonya menguat. Begitu pula kabinet ini: setiap pengurus bergerak selaras agar dampaknya bergema bagi mahasiswa dan masyarakat.',
  vision: 'Mewujudkan HMTE yang selaras, adaptif, dan berdampak melalui kolaborasi seluruh elemen mahasiswa Teknik Elektro.',
  mission: [
    'Menguatkan kolaborasi antar departemen dan antar himpunan',
    'Meningkatkan kualitas keilmuan melalui pelatihan dan kompetisi',
    'Mendigitalkan layanan dan publikasi organisasi',
    'Menumbuhkan kepedulian sosial melalui pengabdian masyarakat',
  ],
  is_current: true,
}

export const demoDepartments: Department[] = [
  { id: 'd-kominfo', slug: 'kominfo', name: 'Komunikasi dan Informasi', description: 'Mengelola publikasi, media sosial, dokumentasi, dan website resmi HMTE.', icon: 'Radio', sort_order: 1 },
  { id: 'd-psdm', slug: 'psdm', name: 'Pengembangan Sumber Daya Mahasiswa', description: 'Membina kaderisasi, kepemimpinan, dan soft skill pengurus serta anggota.', icon: 'Users', sort_order: 2 },
  { id: 'd-akademik', slug: 'akademik', name: 'Akademik dan Keilmuan', description: 'Menyelenggarakan pelatihan teknis, kelas belajar, dan pendampingan kompetisi.', icon: 'GraduationCap', sort_order: 3 },
  { id: 'd-humas', slug: 'humas', name: 'Hubungan Masyarakat', description: 'Menjalin kerja sama dengan alumni, industri, dan himpunan mahasiswa lain.', icon: 'Handshake', sort_order: 4 },
  { id: 'd-kwu', slug: 'kewirausahaan', name: 'Kewirausahaan', description: 'Mengembangkan unit usaha dan pelatihan kewirausahaan berbasis teknologi.', icon: 'Lightbulb', sort_order: 5 },
  { id: 'd-pengabdian', slug: 'pengabdian', name: 'Pengabdian Masyarakat', description: 'Melaksanakan kegiatan sosial dan penerapan keilmuan elektro untuk masyarakat.', icon: 'HeartHandshake', sort_order: 6 },
]

let mi = 0
const m = (department_id: string | null, full_name: string, position: string, level: 0 | 1 | 2 | 3, bio: string | null = null): Member => ({
  id: `m-${++mi}`, cabinet_id: 'cab-1', department_id, full_name, position, level, photo_url: null, bio, instagram: null, sort_order: mi,
})

export const demoMembers: Member[] = [
  m(null, 'Muhammad Rizky Ramadhan', 'Ketua Umum', 0, 'Mahasiswa Teknik Elektro angkatan 2023 yang berfokus pada sistem tertanam dan kepemimpinan organisasi. (Data contoh)'),
  m(null, 'Aulia Nurfadilah', 'Wakil Ketua Umum', 1, 'Mengoordinasikan seluruh departemen dan agenda kerja kabinet. (Data contoh)'),
  m(null, 'Salsabila Putri', 'Sekretaris Umum', 1, 'Mengelola administrasi, persuratan, dan arsip organisasi. (Data contoh)'),
  m(null, 'Fauzan Hakim', 'Bendahara Umum', 1, 'Mengelola keuangan dan pelaporan anggaran kabinet. (Data contoh)'),
  m('d-kominfo', 'Dimas Aditya Pratama', 'Kepala Departemen Kominfo', 2),
  m('d-kominfo', 'Nabila Azzahra', 'Staf Desain dan Publikasi', 3),
  m('d-kominfo', 'Rafi Maulana', 'Staf Dokumentasi', 3),
  m('d-psdm', 'Intan Permatasari', 'Kepala Departemen PSDM', 2),
  m('d-psdm', 'Yusuf Abdillah', 'Staf Kaderisasi', 3),
  m('d-akademik', 'Ghifari Ahmad', 'Kepala Departemen Akademik dan Keilmuan', 2),
  m('d-akademik', 'Syifa Kamila', 'Staf Keilmuan', 3),
  m('d-humas', 'Anisa Rahmawati', 'Kepala Departemen Humas', 2),
  m('d-humas', 'Rendi Saputra', 'Staf Hubungan Eksternal', 3),
  m('d-kwu', 'Bagas Prakoso', 'Kepala Departemen Kewirausahaan', 2),
  m('d-kwu', 'Mutia Ananda', 'Staf Usaha', 3),
  m('d-pengabdian', 'Hilmi Fadhlurrahman', 'Kepala Departemen Pengabdian Masyarakat', 2),
  m('d-pengabdian', 'Zahra Alifia', 'Staf Kegiatan Sosial', 3),
]

let pi = 0
const p = (department_id: string, title: string, description: string, is_featured: boolean, status: Program['status']): Program => ({
  id: `p-${++pi}`, department_id, title, description, is_featured, status, year: 2026,
})

export const demoPrograms: Program[] = [
  p('d-kominfo', 'Resonansi Media Center', 'Pusat publikasi dan dokumentasi digital kegiatan HMTE.', true, 'ongoing'),
  p('d-kominfo', 'Website dan Layanan Digital HMTE', 'Pengembangan website resmi dan layanan aspirasi mahasiswa.', false, 'ongoing'),
  p('d-psdm', 'Elektro Leadership Camp', 'Pelatihan kepemimpinan dan kerja tim bagi pengurus dan anggota.', true, 'planned'),
  p('d-akademik', 'Workshop Mikrokontroler dan IoT', 'Pelatihan praktik pemrograman mikrokontroler dan perangkat IoT.', true, 'planned'),
  p('d-akademik', 'Kelas Belajar Bersama Elektro', 'Sesi belajar kelompok mata kuliah inti setiap pekan.', false, 'ongoing'),
  p('d-humas', 'Kunjungan Industri Ketenagalistrikan', 'Kunjungan ke pembangkit dan industri kelistrikan.', true, 'planned'),
  p('d-kwu', 'Elektro Fabrication Unit', 'Unit usaha jasa rakit modul elektronik dan PCB.', true, 'ongoing'),
  p('d-pengabdian', 'Elektro Peduli Desa', 'Instalasi penerangan sederhana dan penyuluhan keselamatan listrik.', true, 'planned'),
]

const art = (slug: string, title: string, excerpt: string, content: string, category: Article['category'], d: number, author: string): Article => ({
  id: `a-${slug}`, slug, title, excerpt, content, category, thumbnail_url: null, author_name: author,
  status: 'published', published_at: ago(d), created_at: ago(d),
})

export const demoArticles: Article[] = [
  art('pelantikan-kabinet-resonansi-2026', 'Pelantikan Kabinet Resonansi Periode 2026/2027', 'HMTE resmi melantik pengurus Kabinet Resonansi dengan semangat kolaborasi dan inovasi.',
    'HMTE Universitas Muhammadiyah Bandung resmi melantik pengurus Kabinet Resonansi periode 2026/2027.\n\nDalam sambutannya, Ketua Umum menekankan pentingnya kolaborasi lintas departemen untuk menghadirkan program yang berdampak.\n\nKabinet ini menargetkan digitalisasi layanan, penguatan keilmuan, dan perluasan kerja sama eksternal. (Konten contoh)',
    'Organisasi', 12, 'Tim Kominfo HMTE'),
  art('workshop-iot-mikrokontroler-dibuka', 'Pendaftaran Workshop Mikrokontroler dan IoT Dibuka', 'Peserta akan belajar membangun prototipe sensor terhubung internet dari nol.',
    'Departemen Akademik dan Keilmuan membuka pendaftaran Workshop Mikrokontroler dan IoT.\n\nPeserta akan mempelajari dasar pemrograman mikrokontroler, pembacaan sensor, dan pengiriman data ke platform cloud.\n\nKuota terbatas, daftar melalui halaman Kegiatan. (Konten contoh)',
    'Kegiatan', 8, 'Departemen Akademik'),
  art('tips-lolos-kerja-praktik-teknik-elektro', 'Tips Lolos Seleksi Kerja Praktik Bidang Teknik Elektro', 'Persiapan berkas, portofolio, dan wawancara untuk KP di industri kelistrikan.',
    'Kerja praktik adalah kesempatan menerapkan teori di dunia industri.\n\nSiapkan CV ringkas, portofolio proyek, dan pelajari profil perusahaan tujuan.\n\nManfaatkan layanan konsultasi akademik HMTE bila membutuhkan arahan. (Konten contoh)',
    'Akademik', 6, 'Departemen Akademik'),
  art('mengenal-energi-terbarukan-skala-kampus', 'Mengenal Potensi Energi Terbarukan Skala Kampus', 'Ulasan singkat penerapan panel surya atap untuk gedung perkuliahan.',
    'Energi surya menjadi salah satu opsi yang paling mudah diterapkan di lingkungan kampus.\n\nArtikel ini membahas komponen dasar sistem PLTS atap dan pertimbangan perancangannya. (Konten contoh)',
    'Teknologi', 4, 'Tim Kominfo HMTE'),
  art('pengumuman-jadwal-open-recruitment-staf', 'Pengumuman Jadwal Open Recruitment Staf HMTE', 'Informasi tahapan seleksi, persyaratan, dan jadwal wawancara staf departemen.',
    'Open recruitment staf HMTE dibuka bagi mahasiswa aktif Teknik Elektro.\n\nTahapan: pendaftaran, seleksi berkas, wawancara, dan pengumuman. Informasi lengkap akan diperbarui pada website ini. (Konten contoh)',
    'Pengumuman', 2, 'Sekretariat HMTE'),
]

const ev = (slug: string, title: string, description: string, location: string, start: string, end: string): EventItem => ({
  id: `e-${slug}`, slug, title, description, location, starts_at: start, ends_at: end, poster_url: null, registration_url: null, is_published: true,
})

export const demoEvents: EventItem[] = [
  ev('workshop-mikrokontroler-iot', 'Workshop Mikrokontroler dan IoT', 'Pelatihan praktik membangun sistem sensor terhubung internet. Bawa laptop masing-masing.', 'Laboratorium Teknik Elektro UM Bandung', ahead(9), ahead(9, 6)),
  ev('seminar-ketenagalistrikan-nasional', 'Seminar Ketenagalistrikan Nasional', 'Diskusi bersama praktisi mengenai transisi energi dan peluang karier.', 'Aula Fakultas Teknik', ahead(20), ahead(20, 4)),
  ev('elektro-leadership-camp', 'Elektro Leadership Camp', 'Pelatihan kepemimpinan dan kerja tim bagi pengurus dan anggota HMTE.', 'Lembang, Bandung Barat', ahead(35), ahead(37)),
  ev('open-recruitment-staf', 'Open Recruitment Staf HMTE', 'Pembukaan seleksi staf departemen Kabinet Resonansi.', 'Daring dan Sekretariat HMTE', ago(3), ahead(4)),
  ev('upgrading-pengurus-resonansi', 'Upgrading Pengurus Kabinet Resonansi', 'Penguatan visi, misi, dan program kerja seluruh pengurus.', 'Kampus UM Bandung', ago(25), ago(24)),
]

export const demoGallery: GalleryItem[] = [
  ['Pelantikan Kabinet Resonansi', -12], ['Upgrading Pengurus', -25], ['Kunjungan Industri', -60],
  ['Kelas Belajar Bersama', -18], ['Bakti Sosial Elektro Peduli', -90], ['Lomba Robotika Internal', -75],
].map(([title, d], i) => ({
  id: `g-${i}`, title: title as string, image_url: null, event_id: null, department_id: null, taken_at: dateOnly(d as number),
}))

const ac = (category: AcademicItem['category'], title: string, description: string, deadline: number | null = null): AcademicItem => ({
  id: `ac-${title}`, category, title, description, url: null, deadline: deadline === null ? null : dateOnly(deadline), is_published: true,
})

export const demoAcademic: AcademicItem[] = [
  ac('Informasi Perkuliahan', 'Jadwal Kuliah Semester Genap 2026/2027', 'Jadwal dan ruang perkuliahan (contoh).'),
  ac('Materi Pembelajaran', 'Rangkuman Rangkaian Listrik I', 'Ringkasan hukum Kirchhoff, Thevenin, dan Norton.'),
  ac('Referensi Buku', 'Fundamentals of Electric Circuits (Alexander & Sadiku)', 'Referensi utama mata kuliah rangkaian listrik.'),
  ac('Modul Praktikum', 'Modul Praktikum Elektronika Dasar', 'Panduan praktikum dioda, transistor, dan penguat operasional.'),
  ac('Kompetisi', 'Kontes Robot Indonesia Regional', 'Informasi pendaftaran tim dan pembinaan.', 45),
  ac('Seminar & Webinar', 'Webinar Karier Insinyur Elektro', 'Bersama praktisi industri ketenagalistrikan.', 14),
  ac('Beasiswa', 'Beasiswa Prestasi Akademik Fakultas Teknik', 'Persyaratan IPK dan berkas pendaftaran.', 30),
  ac('KP & Magang', 'Magang Teknisi Gardu Induk', 'Lowongan magang di perusahaan ketenagalistrikan (contoh).', 21),
]
