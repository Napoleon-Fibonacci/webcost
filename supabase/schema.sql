-- Skema basis data website COST. Jalankan di Supabase SQL Editor.
-- Semua baris seed adalah placeholder; ganti lewat Table Editor.

create table public.pengaturan (
  key   text primary key,
  value text not null
);

create table public.kegiatan (
  id         bigint generated always as identity primary key,
  judul      text not null,
  deskripsi  text,
  tanggal    date,
  foto_url   text,
  urutan     int  not null default 0
);

-- Row Level Security: kunci anon hanya boleh membaca.
-- Editing dilakukan pengurus lewat Dashboard (Table Editor) yang memakai koneksi postgres dan melewati RLS.
alter table public.pengaturan enable row level security;
alter table public.kegiatan enable row level security;

create policy "publik baca pengaturan" on public.pengaturan for select to anon using (true);
create policy "publik baca kegiatan" on public.kegiatan for select to anon using (true);

-- Data awal (placeholder).
insert into public.pengaturan (key, value) values
  ('tagline', 'Club of Science and Technology'),
  ('ringkasan_home', 'COST adalah ekstrakurikuler sekolah di bidang sains dan teknologi.');

insert into public.kegiatan (judul, deskripsi, tanggal, urutan) values
  ('Pertemuan Rutin', 'Contoh kegiatan rutin mingguan. Ganti dengan data asli.', current_date, 1);

-- Galeri: tabel daftar foto + bucket publik.
-- Tulis dan hapus dilakukan fungsi server Vercel memakai service key (menembus RLS), jadi cukup policy baca.
create table public.foto (
  id         bigint generated always as identity primary key,
  path       text not null unique,
  created_at timestamptz not null default now()
);

alter table public.foto enable row level security;

create policy "publik baca foto" on public.foto for select to anon using (true);

insert into storage.buckets (id, name, public) values ('gallery', 'gallery', true)
on conflict (id) do nothing;

create policy "galeri dibaca publik" on storage.objects for select to anon using (bucket_id = 'gallery');