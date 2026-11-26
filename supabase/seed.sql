-- =====================================================================
-- DATA CONTOH (DUMMY). Semua nama, angka, dan tanggal hanya contoh.
-- Ganti lewat Dashboard Admin dengan data asli HMTE.
-- Jalankan SETELAH 001_schema.sql
-- =====================================================================

insert into public.site_settings (key, value, label) values
  ('site_name',      'HMTE UM Bandung', 'Nama situs'),
  ('site_tagline',   'Inovasi, Kolaborasi, dan Kontribusi', 'Tagline'),
  ('stat_members',   '186', 'Statistik: jumlah anggota'),
  ('stat_pengurus',  '42',  'Statistik: jumlah pengurus'),
  ('stat_programs',  '24',  'Statistik: jumlah program kerja'),
  ('stat_events',    '38',  'Statistik: jumlah kegiatan'),
  ('address',        'Fakultas Teknik, Universitas Muhammadiyah Bandung, Jl. Soekarno-Hatta No. 752, Cipamokolan, Bandung', 'Alamat'),
  ('email',          'medkominfo.hmteumbandung@gmail.com', 'Email resmi'),
  ('phone',          '+62 812-0000-0000', 'Telepon / WhatsApp'),
  ('instagram',      'https://instagram.com/hmte.umbandung', 'Instagram'),
  ('youtube',        'https://youtube.com/@hmteumbandung', 'YouTube'),
  ('about_short',    'HMTE adalah wadah aspirasi, pengembangan potensi, kreativitas, dan intelektualitas mahasiswa Teknik Elektro Universitas Muhammadiyah Bandung.', 'Deskripsi singkat beranda'),
  ('history',        'HMTE dibentuk oleh mahasiswa Program Studi Teknik Elektro sebagai wadah kaderisasi, keilmuan, dan pengabdian. Dari masa ke masa, HMTE berkembang menjadi organisasi yang aktif menyelenggarakan kegiatan akademik, pelatihan teknis, kompetisi, dan kegiatan sosial kemasyarakatan. (Contoh teks: ganti dengan sejarah resmi.)', 'Sejarah HMTE'),
  ('vision',         'Menjadi himpunan mahasiswa yang unggul, inovatif, dan berintegritas dalam mengembangkan keilmuan Teknik Elektro berlandaskan nilai-nilai Islam.', 'Visi HMTE'),
  ('mission',        'Menyelenggarakan kegiatan keilmuan dan keprofesian|Membangun kolaborasi internal dan eksternal|Memfasilitasi aspirasi dan kesejahteraan mahasiswa|Mengabdikan keilmuan kepada masyarakat', 'Misi HMTE (pisahkan dengan |)'),
  ('goals',          'Mengembangkan kompetensi akademik dan nonakademik anggota|Menumbuhkan jiwa kepemimpinan dan organisasi|Menjalin hubungan dengan alumni, industri, dan himpunan lain', 'Tujuan HMTE (pisahkan dengan |)'),
  ('logo_philosophy','Gelombang sinusoidal melambangkan dinamika energi dan sinyal; warna biru tua mencerminkan keilmuan dan profesionalisme; warna cyan melambangkan inovasi dan teknologi. (Contoh teks: ganti dengan filosofi logo resmi.)', 'Filosofi logo'),
  ('org_info',       'Berkedudukan di Fakultas Teknik Universitas Muhammadiyah Bandung. Dipimpin Ketua Umum yang dipilih melalui musyawarah mahasiswa Teknik Elektro dan bekerja dalam periode satu tahun kepengurusan.', 'Informasi keorganisasian')
on conflict (key) do nothing;

insert into public.cabinets (name, period, tagline, philosophy, vision, mission, is_current) values
  ('Kabinet Resonansi', '2026/2027', 'Selaras dalam Gerak, Bergema dalam Karya',
   'Resonansi terjadi ketika sebuah sistem bergetar pada frekuensi yang selaras sehingga amplitudonya menguat. Begitu pula kabinet ini: setiap pengurus bergerak selaras agar dampaknya bergema bagi mahasiswa dan masyarakat.',
   'Mewujudkan HMTE yang selaras, adaptif, dan berdampak melalui kolaborasi seluruh elemen mahasiswa Teknik Elektro.',
   array['Menguatkan kolaborasi antar departemen dan antar himpunan',
         'Meningkatkan kualitas keilmuan melalui pelatihan dan kompetisi',
         'Mendigitalkan layanan dan publikasi organisasi',
         'Menumbuhkan kepedulian sosial melalui pengabdian masyarakat'],
   true)
on conflict do nothing;

insert into public.departments (slug, name, description, icon, sort_order) values
  ('kominfo',   'Komunikasi dan Informasi', 'Mengelola publikasi, media sosial, dokumentasi, dan website resmi HMTE.', 'Radio', 1),
  ('psdm',      'Pengembangan Sumber Daya Mahasiswa', 'Membina kaderisasi, kepemimpinan, dan soft skill pengurus serta anggota.', 'Users', 2),
  ('akademik',  'Akademik dan Keilmuan', 'Menyelenggarakan pelatihan teknis, kelas belajar, dan pendampingan kompetisi.', 'GraduationCap', 3),
  ('humas',     'Hubungan Masyarakat', 'Menjalin kerja sama dengan alumni, industri, dan himpunan mahasiswa lain.', 'Handshake', 4),
  ('kewirausahaan', 'Kewirausahaan', 'Mengembangkan unit usaha dan pelatihan kewirausahaan berbasis teknologi.', 'Lightbulb', 5),
  ('pengabdian','Pengabdian Masyarakat', 'Melaksanakan kegiatan sosial dan penerapan keilmuan elektro untuk masyarakat.', 'HeartHandshake', 6)
on conflict (slug) do nothing;

-- Pengurus inti (dummy)
with c as (select id from public.cabinets where is_current limit 1)
insert into public.members (cabinet_id, department_id, full_name, position, level, bio, sort_order)
select c.id, null, v.full_name, v.position, v.level, v.bio, v.sort_order from c, (values
  ('Muhammad Rizky Ramadhan', 'Ketua Umum', 0::smallint, 'Mahasiswa Teknik Elektro angkatan 2023 yang berfokus pada sistem tertanam dan kepemimpinan organisasi. (Data contoh)', 1),
  ('Aulia Nurfadilah', 'Wakil Ketua Umum', 1::smallint, 'Mengoordinasikan seluruh departemen dan agenda kerja kabinet. (Data contoh)', 2),
  ('Salsabila Putri', 'Sekretaris Umum', 1::smallint, 'Mengelola administrasi, persuratan, dan arsip organisasi. (Data contoh)', 3),
  ('Fauzan Hakim', 'Bendahara Umum', 1::smallint, 'Mengelola keuangan dan pelaporan anggaran kabinet. (Data contoh)', 4)
) as v(full_name, position, level, bio, sort_order);

-- Kepala departemen & staf (dummy)
with c as (select id from public.cabinets where is_current limit 1)
insert into public.members (cabinet_id, department_id, full_name, position, level, sort_order)
select c.id, d.id, v.full_name, v.position, v.level, v.sort_order
from c
join (values
  ('kominfo','Dimas Aditya Pratama','Kepala Departemen Kominfo',2,10),
  ('kominfo','Nabila Azzahra','Staf Desain dan Publikasi',3,11),
  ('kominfo','Rafi Maulana','Staf Dokumentasi',3,12),
  ('psdm','Intan Permatasari','Kepala Departemen PSDM',2,20),
  ('psdm','Yusuf Abdillah','Staf Kaderisasi',3,21),
  ('akademik','Ghifari Ahmad','Kepala Departemen Akademik dan Keilmuan',2,30),
  ('akademik','Syifa Kamila','Staf Keilmuan',3,31),
  ('humas','Anisa Rahmawati','Kepala Departemen Humas',2,40),
  ('humas','Rendi Saputra','Staf Hubungan Eksternal',3,41),
  ('kewirausahaan','Bagas Prakoso','Kepala Departemen Kewirausahaan',2,50),
  ('kewirausahaan','Mutia Ananda','Staf Usaha',3,51),
  ('pengabdian','Hilmi Fadhlurrahman','Kepala Departemen Pengabdian Masyarakat',2,60),
  ('pengabdian','Zahra Alifia','Staf Kegiatan Sosial',3,61)
) as v(slug, full_name, position, level, sort_order) on true
join public.departments d on d.slug = v.slug;

-- Program kerja (dummy)
insert into public.programs (department_id, title, description, is_featured, status, year)
select d.id, v.title, v.description, v.is_featured, v.status, 2026
from (values
  ('kominfo','Resonansi Media Center','Pusat publikasi dan dokumentasi digital kegiatan HMTE.',true,'ongoing'),
  ('kominfo','Website dan Layanan Digital HMTE','Pengembangan website resmi dan layanan aspirasi mahasiswa.',false,'ongoing'),
  ('psdm','Elektro Leadership Camp','Pelatihan kepemimpinan dan kerja tim bagi pengurus dan anggota.',true,'planned'),
  ('akademik','Workshop Mikrokontroler dan IoT','Pelatihan praktik pemrograman mikrokontroler dan perangkat IoT.',true,'planned'),
  ('akademik','Kelas Belajar Bersama Elektro','Sesi belajar kelompok mata kuliah inti setiap pekan.',false,'ongoing'),
  ('humas','Kunjungan Industri Ketenagalistrikan','Kunjungan ke pembangkit dan industri kelistrikan.',true,'planned'),
  ('kewirausahaan','Elektro Fabrication Unit','Unit usaha jasa rakit modul elektronik dan PCB.',true,'ongoing'),
  ('pengabdian','Elektro Peduli Desa','Instalasi penerangan sederhana dan penyuluhan keselamatan listrik.',true,'planned')
) as v(slug, title, description, is_featured, status)
join public.departments d on d.slug = v.slug;

-- Berita (dummy)
insert into public.articles (slug, title, excerpt, content, category, status, published_at, author_name) values
  ('pelantikan-kabinet-resonansi-2026', 'Pelantikan Kabinet Resonansi Periode 2026/2027',
   'HMTE resmi melantik pengurus Kabinet Resonansi dengan semangat kolaborasi dan inovasi.',
   E'HMTE Universitas Muhammadiyah Bandung resmi melantik pengurus Kabinet Resonansi periode 2026/2027.\n\nDalam sambutannya, Ketua Umum menekankan pentingnya kolaborasi lintas departemen untuk menghadirkan program yang berdampak.\n\nKabinet ini menargetkan digitalisasi layanan, penguatan keilmuan, dan perluasan kerja sama eksternal. (Konten contoh)',
   'Organisasi', 'published', now() - interval '12 days', 'Tim Kominfo HMTE'),
  ('workshop-iot-mikrokontroler-dibuka', 'Pendaftaran Workshop Mikrokontroler dan IoT Dibuka',
   'Peserta akan belajar membangun prototipe sensor terhubung internet dari nol.',
   E'Departemen Akademik dan Keilmuan membuka pendaftaran Workshop Mikrokontroler dan IoT.\n\nPeserta akan mempelajari dasar pemrograman mikrokontroler, pembacaan sensor, dan pengiriman data ke platform cloud.\n\nKuota terbatas, daftar melalui halaman Kegiatan. (Konten contoh)',
   'Kegiatan', 'published', now() - interval '8 days', 'Departemen Akademik'),
  ('tips-lolos-kerja-praktik-teknik-elektro', 'Tips Lolos Seleksi Kerja Praktik Bidang Teknik Elektro',
   'Persiapan berkas, portofolio, dan wawancara untuk KP di industri kelistrikan.',
   E'Kerja praktik adalah kesempatan menerapkan teori di dunia industri.\n\nSiapkan CV ringkas, portofolio proyek, dan pelajari profil perusahaan tujuan.\n\nManfaatkan layanan konsultasi akademik HMTE bila membutuhkan arahan. (Konten contoh)',
   'Akademik', 'published', now() - interval '6 days', 'Departemen Akademik'),
  ('mengenal-energi-terbarukan-skala-kampus', 'Mengenal Potensi Energi Terbarukan Skala Kampus',
   'Ulasan singkat penerapan panel surya atap untuk gedung perkuliahan.',
   E'Energi surya menjadi salah satu opsi yang paling mudah diterapkan di lingkungan kampus.\n\nArtikel ini membahas komponen dasar sistem PLTS atap dan pertimbangan perancangannya. (Konten contoh)',
   'Teknologi', 'published', now() - interval '4 days', 'Tim Kominfo HMTE'),
  ('pengumuman-jadwal-open-recruitment-staf', 'Pengumuman Jadwal Open Recruitment Staf HMTE',
   'Informasi tahapan seleksi, persyaratan, dan jadwal wawancara staf departemen.',
   E'Open recruitment staf HMTE dibuka bagi mahasiswa aktif Teknik Elektro.\n\nTahapan: pendaftaran, seleksi berkas, wawancara, dan pengumuman. Informasi lengkap akan diperbarui pada website ini. (Konten contoh)',
   'Pengumuman', 'published', now() - interval '2 days', 'Sekretariat HMTE');

-- Kegiatan (dummy; tanggal relatif terhadap hari ini)
insert into public.events (slug, title, description, location, starts_at, ends_at, is_published) values
  ('workshop-mikrokontroler-iot', 'Workshop Mikrokontroler dan IoT',
   'Pelatihan praktik membangun sistem sensor terhubung internet. Bawa laptop masing-masing.',
   'Laboratorium Teknik Elektro UM Bandung', now() + interval '9 days', now() + interval '9 days 6 hours', true),
  ('seminar-ketenagalistrikan-nasional', 'Seminar Ketenagalistrikan Nasional',
   'Diskusi bersama praktisi mengenai transisi energi dan peluang karier.',
   'Aula Fakultas Teknik', now() + interval '20 days', now() + interval '20 days 4 hours', true),
  ('elektro-leadership-camp', 'Elektro Leadership Camp',
   'Pelatihan kepemimpinan dan kerja tim bagi pengurus dan anggota HMTE.',
   'Lembang, Bandung Barat', now() + interval '35 days', now() + interval '37 days', true),
  ('open-recruitment-staf', 'Open Recruitment Staf HMTE',
   'Pembukaan seleksi staf departemen Kabinet Resonansi.',
   'Daring dan Sekretariat HMTE', now() - interval '3 days', now() + interval '4 days', true),
  ('upgrading-pengurus-resonansi', 'Upgrading Pengurus Kabinet Resonansi',
   'Penguatan visi, misi, dan program kerja seluruh pengurus.',
   'Kampus UM Bandung', now() - interval '25 days', now() - interval '24 days', true);

-- Galeri (gambar dikosongkan; unggah foto asli lewat dashboard)
insert into public.gallery (title, taken_at) values
  ('Pelantikan Kabinet Resonansi', current_date - 12),
  ('Upgrading Pengurus', current_date - 25),
  ('Kunjungan Industri', current_date - 60),
  ('Kelas Belajar Bersama', current_date - 18),
  ('Bakti Sosial Elektro Peduli', current_date - 90),
  ('Lomba Robotika Internal', current_date - 75);

-- Akademik (dummy)
insert into public.academic_items (category, title, description, url, deadline) values
  ('Informasi Perkuliahan', 'Jadwal Kuliah Semester Genap 2026/2027', 'Jadwal dan ruang perkuliahan (contoh).', null, null),
  ('Materi Pembelajaran', 'Rangkuman Rangkaian Listrik I', 'Ringkasan hukum Kirchhoff, Thevenin, dan Norton.', null, null),
  ('Referensi Buku', 'Fundamentals of Electric Circuits (Alexander & Sadiku)', 'Referensi utama mata kuliah rangkaian listrik.', null, null),
  ('Modul Praktikum', 'Modul Praktikum Elektronika Dasar', 'Panduan praktikum dioda, transistor, dan penguat operasional.', null, null),
  ('Kompetisi', 'Kontes Robot Indonesia Regional', 'Informasi pendaftaran tim dan pembinaan.', null, current_date + 45),
  ('Seminar & Webinar', 'Webinar Karier Insinyur Elektro', 'Bersama praktisi industri ketenagalistrikan.', null, current_date + 14),
  ('Beasiswa', 'Beasiswa Prestasi Akademik Fakultas Teknik', 'Persyaratan IPK dan berkas pendaftaran.', null, current_date + 30),
  ('KP & Magang', 'Magang Teknisi Gardu Induk', 'Lowongan magang di perusahaan ketenagalistrikan (contoh).', null, current_date + 21);
