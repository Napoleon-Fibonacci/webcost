# Website COST

Website profil ekstrakurikuler COST (Club of Science and Technology). Dibangun dengan HTML/CSS/JavaScript vanilla, di-hosting di Vercel, dan datanya disimpan di Supabase (PostgreSQL).

## Struktur proyek

```
public/            -> seluruh isi situs (halaman, css, js)
public/js/config.js-> dibuat otomatis saat build, tidak di-commit
api/               -> fungsi server Vercel: login, daftar, unggah, hapus foto
lib/               -> helper bersama untuk fungsi api (verifikasi sesi)
scripts/           -> build-config.mjs, pembaca environment variable
supabase/schema.sql-> skema tabel, kebijakan RLS, dan data awal
```

## Persiapan Supabase (satu kali)

1. Buat proyek di https://supabase.com.
2. Buka **SQL Editor**, salin seluruh isi `supabase/schema.sql`, lalu jalankan (termasuk bagian Galeri: tabel `foto`, bucket `gallery`, policy baca).
3. Supabase Auth tidak dipakai. Login admin cukup satu password, dibuat di bagian deploy Vercel (`ADMIN_PASSWORD`).
4. Simpan email dan password akun supabase.com pemilik proyek ini untuk edit konten di dashboard. Ambil **Project URL**, **anon public key**, dan **service role key** di **Project Settings → API**. Service role key setara kunci master: jangan pernah ditempel ke kode, chat, atau screenshot.

## Deploy ke Vercel (satu kali)

1. Upload folder ini ke repository Git (GitHub), lalu import di https://vercel.com.
2. Di **Project Settings → Environment Variables**, tambahkan empat variabel:
   - `SUPABASE_URL` — Project URL
   - `SUPABASE_ANON_KEY` — anon public key
   - `SUPABASE_SERVICE_ROLE_KEY` — service role key (hanya untuk fungsi server, jangan bocor)
   - `ADMIN_PASSWORD` — satu password untuk login halaman `/admin`, sampaikan ke pengurus lewat jalur tertutup
   Gunakan Environment `Production` (tambahkan `Preview` bila perlu).
3. Deploy. `vercel.json` sudah mengatur build command (`npm run build`) dan output (`public`). Build script menulis kredensial ke `js/config.js` sehingga kunci tidak pernah masuk ke Git.

## Cara pengurus memperbarui konten

Teks beranda diedit lewat Supabase Dashboard; kegiatan dan foto lewat panel admin di situs.

### Teks beranda (Supabase Dashboard)

1. Buka https://supabase.com/dashboard, login dengan akun pengurus, masuk ke proyek.
2. Buka **Table Editor**, pilih tabel sesuai kebutuhan:
   - `pengaturan` — tagline dan ringkasan beranda (sejarah, visi misi, kepengurusan, dan kontak ditulis statis di `index.html`)
   - `kegiatan` — masih bisa diedit langsung di sini, tapi lebih nyaman lewat tab Kegiatan di panel admin
3. Tambah baris lewat **Insert row**, ubah lewat klik sel.
4. Perubahan langsung tampil saat halaman dimuat ulang; tidak perlu deploy ulang.

### Foto galeri & kegiatan (panel admin di situs)

1. Buka `https://domain-anda.vercel.app/admin` (sengaja tidak ditautkan dari halaman publik; bookmark alamatnya).
2. Masukkan `ADMIN_PASSWORD` yang dibuat di Vercel. Satu password, berlaku untuk semua pengurus; ganti dengan mengubah env lalu deploy ulang.
3. Tab **Foto Galeri**: tarik foto ke kotak putus-putus atau klik untuk memilih file. Tombol merah **Hapus** menghapus foto.
4. Tab **Kegiatan**: isi judul, tanggal, deskripsi, lalu pilih foto dari galeri yang sudah diunggah (atau Tanpa foto). **Simpan Kegiatan** menambah entri baru; setiap baris punya **Ubah** (memuat ulang data ke formulir) dan **Hapus**.
5. Semua perubahan langsung tampil di halaman utama, tanpa deploy ulang.

## Menjalankan di komputer lokal

```bash
npm run build
npx serve public
```

Sebelum `npm run build`, setel environment variable Supabase di terminal. Tanpa kredensial, situs tetap terbuka tetapi daftar isi menampilkan pesan bahwa basis data belum terhubung. Untuk mencoba halaman `/admin` dan fungsi `api/` di lokal, gunakan `vercel dev` dari Vercel CLI (login dulu dengan `vercel login`), bukan `serve`.
