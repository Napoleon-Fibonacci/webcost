-- Kesan & Pesan: tabel pesan masuk dari halaman /kesan&pesan.
-- Jalankan SEKALI di Supabase SQL Editor (bagian project website COST).

create table public.kesan_pesan (
  id         bigint generated always as identity primary key,
  nama       text not null,
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
