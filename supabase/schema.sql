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

create table public.prestasi (
  id       bigint generated always as identity primary key,
  nama     text not null,
  posisi   text,
  tingkat  text,
  tahun    int,
  foto_url text
);

create table public.kontak (
  id     bigint generated always as identity primary key,
  jenis  text not null,
  nilai  text not null,
  urutan int  not null default 0
);

-- Row Level Security: kunci anon hanya boleh membaca.
-- Editing dilakukan pengurus lewat Dashboard (Table Editor) yang memakai koneksi postgres dan melewati RLS.
alter table public.pengaturan enable row level security;
alter table public.kegiatan enable row level security;
alter table public.prestasi    enable row level security;
alter table public.kontak      enable row level security;

create policy "publik baca pengaturan" on public.pengaturan for select to anon, authenticated using (true);
create policy "publik baca kegiatan" on public.kegiatan for select to anon, authenticated using (true);
create policy "publik baca prestasi"    on public.prestasi    for select to anon, authenticated using (true);
create policy "publik baca kontak"      on public.kontak      for select to anon, authenticated using (true);

create policy "hanya pengurus login tulis pengaturan" on public.pengaturan for insert to authenticated with check (true);
create policy "hanya pengurus login ubah pengaturan"  on public.pengaturan for update to authenticated using (true);
create policy "hanya pengurus login hapus pengaturan" on public.pengaturan for delete to authenticated using (true);

create policy "hanya pengurus login tulis kegiatan" on public.kegiatan for insert to authenticated with check (true);
create policy "hanya pengurus login ubah kegiatan"  on public.kegiatan for update to authenticated using (true);
create policy "hanya pengurus login hapus kegiatan" on public.kegiatan for delete to authenticated using (true);

create policy "hanya pengurus login tulis prestasi" on public.prestasi for insert to authenticated with check (true);
create policy "hanya pengurus login ubah prestasi"  on public.prestasi for update to authenticated using (true);
create policy "hanya pengurus login hapus prestasi" on public.prestasi for delete to authenticated using (true);

create policy "hanya pengurus login tulis kontak" on public.kontak for insert to authenticated with check (true);
create policy "hanya pengurus login ubah kontak"  on public.kontak for update to authenticated using (true);
create policy "hanya pengurus login hapus kontak" on public.kontak for delete to authenticated using (true);

-- Data awal (placeholder).
insert into public.pengaturan (key, value) values
  ('tagline', 'Club of Science and Technology'),
  ('ringkasan_home', 'COST adalah ekstrakurikuler sekolah di bidang sains dan teknologi. Ganti teks ini lewat Supabase Table Editor.');

insert into public.kontak (jenis, nilai, urutan) values
  ('instagram', 'https://instagram.com/akun.cost', 1),
  ('email', 'cost@sekolah.sch.id', 2);

insert into public.kegiatan (judul, deskripsi, tanggal, urutan) values
  ('Pertemuan Rutin', 'Contoh kegiatan rutin mingguan. Ganti dengan data asli.', current_date, 1);

insert into public.prestasi (nama, posisi, tingkat, tahun) values
  ('Nama Kompetisi', 'Juara 1', 'Kota', extract(year from current_date)::int);
