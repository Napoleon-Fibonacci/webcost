-- Kesan & Pesan: tabel pesan masuk dari halaman /kesan&pesan.
-- Jalankan SEKALI di Supabase SQL Editor (bagian project website COST).
-- Sudah pernah menjalankan versi lama? Cukup jalankan blok ALTER paling bawah.

create table public.kesan_pesan (
  id         bigint generated always as identity primary key,
  nama       text not null,
  kelas      text,
  kesan      text,
  pesan      text not null,
  saran      text,
  created_at timestamptz not null default now()
);

-- Publik hanya boleh MENGIRIM (insert). Membaca & menghapus dilakukan
-- panel admin lewat fungsi server Vercel memakai service key (menembus RLS),
-- jadi isi pesan tidak bisa diambil orang lain dari sisi browser.
alter table public.kesan_pesan enable row level security;

create policy "publik kirim kesan-pesan" on public.kesan_pesan
  for insert to anon with check (true);

-- ===== Upgrade v2: kolom kelas (X1..XII12). Jalankan bila tabel sudah ada =====
alter table public.kesan_pesan add column if not exists kelas text;
