# Website Resmi HMTE UM Bandung

Website Himpunan Mahasiswa Teknik Elektro, Universitas Muhammadiyah Bandung.
Stack: React 18 + TypeScript + Vite, Tailwind CSS, Framer Motion, Lucide Icons, Supabase (PostgreSQL, Auth, Storage).

## Fitur

**Publik:** Beranda, Tentang Kami, Kabinet (bagan interaktif), Departemen (+ halaman detail), Berita (cari, kategori, detail, rekomendasi), Kegiatan (kalender + agenda + detail), Akademik (cari + filter), Layanan (aspirasi, pengaduan, konsultasi, surat, nomor tiket, pelacakan status), Kontak.

**Dashboard admin (`/admin`):** menu **Tampilan Situs** (ganti logo, favicon, tema warna, hero beranda, judul dan ikon pilar, tanpa ubah kode); login Supabase Auth, RBAC 4 role, CRUD berita, pengurus, kabinet, departemen, program kerja, agenda, galeri, akademik; tindak lanjut tiket, pesan masuk, manajemen pengguna, pengaturan situs (termasuk angka statistik beranda), unggah gambar.

| Role | Hak akses |
|---|---|
| Super Admin | Semua, termasuk manajemen pengguna |
| Admin | Semua konten, tiket, pesan, pengaturan |
| Editor | Berita, agenda, galeri, akademik, program kerja |
| Pengurus | Melihat konten; menindaklanjuti tiket dan pesan |

## Instalasi lokal

Prasyarat: Node.js 18+.

```bash
npm install
cp .env.example .env     # lalu isi (lihat bagian Supabase)
npm run dev              # http://localhost:5173
```

Tanpa `.env`, website berjalan dalam **mode demo** (data contoh dari `src/data/demo.ts`; form layanan tersimpan di browser saja; login admin dinonaktifkan).

## Menyiapkan Supabase

1. Buat project di https://supabase.com.
2. Buka **SQL Editor**, jalankan berurutan:
   1. `supabase/migrations/001_schema.sql` (tabel, RLS, fungsi, bucket `media`)
   2. `supabase/seed.sql` (data contoh; ganti dengan data asli lewat dashboard)
3. **Project Settings > API**: salin `Project URL` dan `anon public key` ke `.env`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   VITE_SITE_URL=https://domain-anda
   ```
   **Jangan** memakai `service_role` key di frontend.
4. **Authentication > Users > Add user**: buat akun admin pertama (centang auto-confirm).
5. Promosikan menjadi Super Admin lewat SQL Editor:
   ```sql
   update public.profiles set role = 'super_admin', is_active = true
   where email = 'EMAIL_ANDA@contoh.com';
   ```
6. Login di `/admin/login`. Akun berikutnya dibuat di Supabase Dashboard, lalu diaktifkan dan diberi role di menu **Pengguna**.
7. Disarankan: **Authentication > Providers > Email**, matikan "Allow new users to sign up" agar hanya akun buatan Anda yang ada.

## Deployment

Build: `npm run build` (menghasilkan `dist/` dan `dist/sitemap.xml`).

**GitHub Pages (otomatis lewat GitHub Actions):**

1. Buat repository di GitHub, lalu unggah proyek ini (branch `main`):
   ```bash
   git init
   git add .
   git commit -m "Website HMTE"
   git branch -M main
   git remote add origin https://github.com/USERNAME/NAMA-REPO.git
   git push -u origin main
   ```
2. Repo > **Settings > Pages > Build and deployment > Source**: pilih **GitHub Actions**.
3. Repo > **Settings > Secrets and variables > Actions > Secrets**: tambahkan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` (anon key saja, bukan service_role).
4. Setiap `git push` ke `main` akan membangun dan menerbitkan situs di `https://USERNAME.github.io/NAMA-REPO/`. Progres terlihat di tab **Actions**.
5. (Opsional) Domain sendiri: isi **Variables** `CUSTOM_DOMAIN` (mis. `hmte.umbandung.ac.id`), lalu atur domain di Settings > Pages. Workflow otomatis memakai base path `/`.
6. Di Supabase > Authentication > URL Configuration, tambahkan URL situs di atas ke **Site URL**.

Catatan: GitHub Pages tidak mendukung header keamanan kustom dan sub-path memakai nama repo; `base`, sitemap, dan fallback rute (`404.html`) sudah diatur oleh workflow. Untuk pengembangan lokal tidak ada yang perlu diubah.


## Keamanan (ringkas)

- RLS aktif di semua tabel; publik hanya dapat membaca konten terpublikasi.
- Tabel `tickets` dan `contact_messages` **tidak** dapat dibaca publik. Pengiriman dan pelacakan lewat fungsi RPC dengan validasi dan pembatasan 5 kirim/jam per email; pelacakan membutuhkan nomor tiket + email.
- Akun baru tidak aktif sampai diaktifkan Super Admin; perubahan role dibatasi Super Admin (trigger + RLS).
- Unggahan hanya gambar JPG/PNG/WebP maks 5 MB (divalidasi di klien dan dipaksa oleh bucket), nama file diacak.
- Konten artikel dirender sebagai teks (bukan HTML) untuk mencegah XSS; input divalidasi dengan Zod.
- Pembatas role di UI hanya kemudahan penggunaan; penegakan sesungguhnya ada di RLS.

## Struktur

```
src/
  components/   Navbar, Footer, ui, cards, HeroCircuit
  pages/        halaman publik
  pages/admin/  dashboard (ResourceManager generik + resources.tsx sebagai konfigurasi CRUD)
  lib/          supabase, api, auth, settings, seo, upload, types
  data/demo.ts  data mode demo
supabase/       migrasi + seed
scripts/        generate-sitemap.mjs
```

Menambah modul CRUD baru cukup menambah satu entri di `src/pages/admin/resources.tsx`, lalu satu menu di `AdminLayout.tsx`.

## Yang perlu Anda ganti

Semua nama, angka, tanggal, sejarah, dan filosofi logo adalah **data contoh** (ditandai "Data contoh"/"Contoh teks"). Logo saat ini placeholder (gelombang sinus); unggah logo resmi dan ganti `public/favicon.svg` serta komponen `src/components/Logo.tsx`.
