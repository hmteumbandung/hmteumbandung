-- =====================================================================
-- HMTE UM Bandung : skema database, RBAC, dan Row Level Security
-- Jalankan di Supabase Dashboard > SQL Editor (atau `supabase db push`)
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1. ROLE & PROFIL PENGGUNA
-- ---------------------------------------------------------------------
do $$ begin
  create type public.app_role as enum ('super_admin', 'admin', 'editor', 'pengurus');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  email       text,
  role        public.app_role not null default 'pengurus',
  -- Akun baru TIDAK aktif sampai diaktifkan Super Admin
  is_active   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

create trigger trg_profiles_touch before update on public.profiles
for each row execute function public.touch_updated_at();

-- Buat profil otomatis saat user mendaftar (nonaktif by default)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.email)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- Helper RBAC (security definer agar tidak rekursif terhadap RLS)
create or replace function public.current_app_role() returns public.app_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid() and is_active
$$;

create or replace function public.has_role(roles public.app_role[]) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.current_app_role() = any(roles), false)
$$;

-- Cegah eskalasi hak akses: hanya Super Admin yang boleh mengubah role / is_active
create or replace function public.guard_profile_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- auth.uid() null = dijalankan dari SQL Editor / service role (promosi super admin pertama)
  if auth.uid() is not null
     and (new.role is distinct from old.role or new.is_active is distinct from old.is_active)
     and not public.has_role(array['super_admin']::public.app_role[]) then
    raise exception 'Hanya Super Admin yang dapat mengubah role atau status akun';
  end if;
  return new;
end $$;

create trigger trg_profiles_guard before update on public.profiles
for each row execute function public.guard_profile_update();

-- ---------------------------------------------------------------------
-- 2. PENGATURAN SITUS (termasuk angka statistik beranda)
-- ---------------------------------------------------------------------
create table if not exists public.site_settings (
  key        text primary key,
  value      text not null default '',
  label      text,
  updated_at timestamptz not null default now()
);
create trigger trg_settings_touch before update on public.site_settings
for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- 3. KABINET, DEPARTEMEN, PENGURUS, PROGRAM KERJA
-- ---------------------------------------------------------------------
create table if not exists public.cabinets (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  period      text not null,
  tagline     text,
  logo_url    text,
  philosophy  text,
  vision      text,
  mission     text[] not null default '{}',
  is_current  boolean not null default false,
  created_at  timestamptz not null default now()
);
-- hanya satu kabinet aktif
create unique index if not exists uq_cabinet_current on public.cabinets (is_current) where is_current;

create table if not exists public.departments (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text,
  icon        text default 'Cpu',
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.members (
  id            uuid primary key default gen_random_uuid(),
  cabinet_id    uuid references public.cabinets(id) on delete cascade,
  department_id uuid references public.departments(id) on delete set null,
  full_name     text not null,
  position      text not null,
  -- 0 Ketua Umum, 1 Wakil/Sekretaris/Bendahara, 2 Kepala Departemen, 3 Staf/Anggota
  level         smallint not null default 3 check (level between 0 and 3),
  photo_url     text,
  bio           text,
  instagram     text,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists idx_members_cabinet on public.members(cabinet_id);
create index if not exists idx_members_dept on public.members(department_id);

create table if not exists public.programs (
  id            uuid primary key default gen_random_uuid(),
  department_id uuid references public.departments(id) on delete cascade,
  title         text not null,
  description   text,
  is_featured   boolean not null default false,
  status        text not null default 'planned' check (status in ('planned', 'ongoing', 'done')),
  year          int not null default extract(year from now())::int,
  created_at    timestamptz not null default now()
);
create index if not exists idx_programs_dept on public.programs(department_id);

-- ---------------------------------------------------------------------
-- 4. BERITA, KEGIATAN, GALERI, AKADEMIK
-- ---------------------------------------------------------------------
create table if not exists public.articles (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  excerpt       text,
  content       text not null default '',
  category      text not null check (category in ('Organisasi','Akademik','Teknologi','Kegiatan','Pengumuman')),
  thumbnail_url text,
  author_name   text not null default 'Tim Kominfo HMTE',
  author_id     uuid references public.profiles(id) on delete set null,
  status        text not null default 'draft' check (status in ('draft', 'published')),
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_articles_pub on public.articles(status, published_at desc);
create trigger trg_articles_touch before update on public.articles
for each row execute function public.touch_updated_at();

create table if not exists public.events (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  description   text,
  location      text,
  starts_at     timestamptz not null,
  ends_at       timestamptz,
  poster_url    text,
  registration_url text,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now()
);
create index if not exists idx_events_start on public.events(starts_at);

create table if not exists public.gallery (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  image_url     text,
  event_id      uuid references public.events(id) on delete set null,
  department_id uuid references public.departments(id) on delete set null,
  taken_at      date default current_date,
  created_at    timestamptz not null default now()
);

create table if not exists public.academic_items (
  id          uuid primary key default gen_random_uuid(),
  category    text not null check (category in (
    'Informasi Perkuliahan','Materi Pembelajaran','Referensi Buku','Modul Praktikum',
    'Kompetisi','Seminar & Webinar','Beasiswa','KP & Magang')),
  title       text not null,
  description text,
  url         text,
  deadline    date,
  is_published boolean not null default true,
  created_at  timestamptz not null default now()
);
create index if not exists idx_academic_cat on public.academic_items(category);

-- ---------------------------------------------------------------------
-- 5. LAYANAN (tiket) & PESAN KONTAK
-- ---------------------------------------------------------------------
create table if not exists public.tickets (
  id             uuid primary key default gen_random_uuid(),
  ticket_no      text not null unique,
  type           text not null check (type in ('aspirasi','pengaduan','konsultasi','surat')),
  name           text not null,
  nim            text,
  email          text not null,
  subject        text not null,
  message        text not null,
  extra          jsonb not null default '{}'::jsonb,
  status         text not null default 'diterima'
                 check (status in ('diterima','diproses','selesai','ditolak')),
  admin_response text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists idx_tickets_email on public.tickets(lower(email));
create trigger trg_tickets_touch before update on public.tickets
for each row execute function public.touch_updated_at();

create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text not null,
  message    text not null,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 6. RPC PUBLIK (validasi di sisi server; tabel tidak dibuka langsung)
-- ---------------------------------------------------------------------
create or replace function public.submit_ticket(
  p_type text, p_name text, p_nim text, p_email text,
  p_subject text, p_message text, p_extra jsonb default '{}'::jsonb
) returns text
language plpgsql security definer set search_path = public as $$
declare
  v_no text;
  v_try int := 0;
begin
  if p_type not in ('aspirasi','pengaduan','konsultasi','surat') then
    raise exception 'Jenis layanan tidak valid';
  end if;
  if char_length(trim(coalesce(p_name,''))) not between 2 and 100 then
    raise exception 'Nama harus 2-100 karakter';
  end if;
  if p_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    raise exception 'Format email tidak valid';
  end if;
  if char_length(trim(coalesce(p_subject,''))) not between 3 and 150 then
    raise exception 'Judul harus 3-150 karakter';
  end if;
  if char_length(trim(coalesce(p_message,''))) not between 10 and 4000 then
    raise exception 'Isi pesan harus 10-4000 karakter';
  end if;
  if char_length(coalesce(p_extra::text,'')) > 2000 then
    raise exception 'Data tambahan terlalu panjang';
  end if;
  -- pembatasan sederhana: maks 5 tiket per email per jam
  if (select count(*) from public.tickets
      where lower(email) = lower(p_email) and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Terlalu banyak pengajuan. Coba lagi beberapa saat lagi.';
  end if;

  loop
    v_no := 'HMTE-' || to_char(now() at time zone 'Asia/Jakarta', 'YYMMDD') || '-' ||
            upper(substr(md5(random()::text || clock_timestamp()::text), 1, 5));
    begin
      insert into public.tickets (ticket_no, type, name, nim, email, subject, message, extra)
      values (v_no, p_type, trim(p_name), nullif(trim(coalesce(p_nim,'')),''),
              lower(trim(p_email)), trim(p_subject), trim(p_message), coalesce(p_extra,'{}'::jsonb));
      return v_no;
    exception when unique_violation then
      v_try := v_try + 1;
      if v_try > 5 then raise; end if;
    end;
  end loop;
end $$;

create or replace function public.track_ticket(p_ticket_no text, p_email text)
returns table (ticket_no text, type text, subject text, status text,
               admin_response text, created_at timestamptz, updated_at timestamptz)
language sql stable security definer set search_path = public as $$
  select t.ticket_no, t.type, t.subject, t.status, t.admin_response, t.created_at, t.updated_at
  from public.tickets t
  where upper(t.ticket_no) = upper(trim(p_ticket_no)) and lower(t.email) = lower(trim(p_email))
$$;

create or replace function public.submit_message(
  p_name text, p_email text, p_subject text, p_message text
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if char_length(trim(coalesce(p_name,''))) not between 2 and 100 then
    raise exception 'Nama harus 2-100 karakter';
  end if;
  if p_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    raise exception 'Format email tidak valid';
  end if;
  if char_length(trim(coalesce(p_subject,''))) not between 3 and 150 then
    raise exception 'Subjek harus 3-150 karakter';
  end if;
  if char_length(trim(coalesce(p_message,''))) not between 10 and 4000 then
    raise exception 'Pesan harus 10-4000 karakter';
  end if;
  if (select count(*) from public.contact_messages
      where lower(email) = lower(p_email) and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Terlalu banyak pesan. Coba lagi beberapa saat lagi.';
  end if;
  insert into public.contact_messages (name, email, subject, message)
  values (trim(p_name), lower(trim(p_email)), trim(p_subject), trim(p_message));
end $$;

revoke all on function public.submit_ticket(text,text,text,text,text,text,jsonb) from public;
revoke all on function public.track_ticket(text,text) from public;
revoke all on function public.submit_message(text,text,text,text) from public;
grant execute on function public.submit_ticket(text,text,text,text,text,text,jsonb) to anon, authenticated;
grant execute on function public.track_ticket(text,text) to anon, authenticated;
grant execute on function public.submit_message(text,text,text,text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY
-- Matriks akses:
--   super_admin : semua, termasuk pengguna & pengaturan
--   admin       : semua konten, tiket, pesan, pengaturan (tanpa kelola pengguna)
--   editor      : berita, kegiatan, galeri, akademik, program kerja
--   pengurus    : baca konten, tindak lanjut tiket & pesan
--   publik      : hanya membaca konten terpublikasi
-- ---------------------------------------------------------------------
alter table public.profiles         enable row level security;
alter table public.site_settings    enable row level security;
alter table public.cabinets         enable row level security;
alter table public.departments      enable row level security;
alter table public.members          enable row level security;
alter table public.programs         enable row level security;
alter table public.articles         enable row level security;
alter table public.events           enable row level security;
alter table public.gallery          enable row level security;
alter table public.academic_items   enable row level security;
alter table public.tickets          enable row level security;
alter table public.contact_messages enable row level security;

-- profiles
create policy "profiles: baca diri sendiri atau admin" on public.profiles for select to authenticated
  using (id = auth.uid() or public.has_role(array['super_admin','admin']::public.app_role[]));
create policy "profiles: ubah diri sendiri" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles: super admin kelola" on public.profiles for all to authenticated
  using (public.has_role(array['super_admin']::public.app_role[]))
  with check (public.has_role(array['super_admin']::public.app_role[]));

-- site_settings: publik baca, admin+ tulis
create policy "settings: publik baca" on public.site_settings for select using (true);
create policy "settings: admin tulis" on public.site_settings for all to authenticated
  using (public.has_role(array['super_admin','admin']::public.app_role[]))
  with check (public.has_role(array['super_admin','admin']::public.app_role[]));

-- struktur organisasi: publik baca, admin+ tulis
create policy "cabinets: publik baca" on public.cabinets for select using (true);
create policy "cabinets: admin tulis" on public.cabinets for all to authenticated
  using (public.has_role(array['super_admin','admin']::public.app_role[]))
  with check (public.has_role(array['super_admin','admin']::public.app_role[]));

create policy "departments: publik baca" on public.departments for select using (true);
create policy "departments: admin tulis" on public.departments for all to authenticated
  using (public.has_role(array['super_admin','admin']::public.app_role[]))
  with check (public.has_role(array['super_admin','admin']::public.app_role[]));

create policy "members: publik baca" on public.members for select using (true);
create policy "members: admin tulis" on public.members for all to authenticated
  using (public.has_role(array['super_admin','admin']::public.app_role[]))
  with check (public.has_role(array['super_admin','admin']::public.app_role[]));

-- konten: editor ikut boleh menulis
create policy "programs: publik baca" on public.programs for select using (true);
create policy "programs: editor tulis" on public.programs for all to authenticated
  using (public.has_role(array['super_admin','admin','editor']::public.app_role[]))
  with check (public.has_role(array['super_admin','admin','editor']::public.app_role[]));

create policy "articles: publik baca terbit" on public.articles for select
  using (status = 'published' and published_at <= now());
create policy "articles: staf baca semua" on public.articles for select to authenticated
  using (public.has_role(array['super_admin','admin','editor','pengurus']::public.app_role[]));
create policy "articles: editor tulis" on public.articles for all to authenticated
  using (public.has_role(array['super_admin','admin','editor']::public.app_role[]))
  with check (public.has_role(array['super_admin','admin','editor']::public.app_role[]));

create policy "events: publik baca terbit" on public.events for select using (is_published);
create policy "events: staf baca semua" on public.events for select to authenticated
  using (public.has_role(array['super_admin','admin','editor','pengurus']::public.app_role[]));
create policy "events: editor tulis" on public.events for all to authenticated
  using (public.has_role(array['super_admin','admin','editor']::public.app_role[]))
  with check (public.has_role(array['super_admin','admin','editor']::public.app_role[]));

create policy "gallery: publik baca" on public.gallery for select using (true);
create policy "gallery: editor tulis" on public.gallery for all to authenticated
  using (public.has_role(array['super_admin','admin','editor']::public.app_role[]))
  with check (public.has_role(array['super_admin','admin','editor']::public.app_role[]));

create policy "academic: publik baca terbit" on public.academic_items for select using (is_published);
create policy "academic: staf baca semua" on public.academic_items for select to authenticated
  using (public.has_role(array['super_admin','admin','editor','pengurus']::public.app_role[]));
create policy "academic: editor tulis" on public.academic_items for all to authenticated
  using (public.has_role(array['super_admin','admin','editor']::public.app_role[]))
  with check (public.has_role(array['super_admin','admin','editor']::public.app_role[]));

-- tiket & pesan: TIDAK ada akses publik langsung (hanya lewat RPC).
create policy "tickets: staf baca" on public.tickets for select to authenticated
  using (public.has_role(array['super_admin','admin','pengurus']::public.app_role[]));
create policy "tickets: staf tindak lanjut" on public.tickets for update to authenticated
  using (public.has_role(array['super_admin','admin','pengurus']::public.app_role[]))
  with check (public.has_role(array['super_admin','admin','pengurus']::public.app_role[]));
create policy "tickets: admin hapus" on public.tickets for delete to authenticated
  using (public.has_role(array['super_admin','admin']::public.app_role[]));

create policy "messages: staf baca" on public.contact_messages for select to authenticated
  using (public.has_role(array['super_admin','admin','pengurus']::public.app_role[]));
create policy "messages: staf tandai" on public.contact_messages for update to authenticated
  using (public.has_role(array['super_admin','admin','pengurus']::public.app_role[]))
  with check (public.has_role(array['super_admin','admin','pengurus']::public.app_role[]));
create policy "messages: admin hapus" on public.contact_messages for delete to authenticated
  using (public.has_role(array['super_admin','admin']::public.app_role[]));

-- Pengurus hanya boleh mengubah kolom tindak lanjut tiket
create or replace function public.guard_ticket_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if public.has_role(array['pengurus']::public.app_role[]) and (
      new.ticket_no is distinct from old.ticket_no or new.name is distinct from old.name or
      new.email is distinct from old.email or new.subject is distinct from old.subject or
      new.message is distinct from old.message or new.type is distinct from old.type) then
    raise exception 'Pengurus hanya dapat mengubah status dan tanggapan';
  end if;
  return new;
end $$;
create trigger trg_tickets_guard before update on public.tickets
for each row execute function public.guard_ticket_update();

-- ---------------------------------------------------------------------
-- 8. STORAGE: bucket "media" (gambar saja, maks 5 MB)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "media: publik baca" on storage.objects for select
  using (bucket_id = 'media');
create policy "media: editor unggah" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.has_role(array['super_admin','admin','editor']::public.app_role[]));
create policy "media: editor ubah" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.has_role(array['super_admin','admin','editor']::public.app_role[]));
create policy "media: editor hapus" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.has_role(array['super_admin','admin','editor']::public.app_role[]));

-- ---------------------------------------------------------------------
-- 9. PROMOSI SUPER ADMIN PERTAMA (jalankan manual setelah akun dibuat)
-- update public.profiles set role = 'super_admin', is_active = true
-- where email = 'EMAIL_ANDA@contoh.com';
-- ---------------------------------------------------------------------
