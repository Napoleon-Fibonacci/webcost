# Website COST

Website profil ekstrakurikuler COST (Club of Science and Technology). Dibangun dengan HTML/CSS/JavaScript vanilla, di-hosting di Vercel, dan datanya disimpan di Supabase (PostgreSQL).

## Struktur proyek

```
public/            -> seluruh isi situs (halaman, css, js)
public/js/config.js-> dibuat otomatis saat build, tidak di-commit
scripts/           -> build-config.mjs, pembaca environment variable
supabase/schema.sql-> skema tabel, kebijakan RLS, dan data awal
```

## Persiapan Supabase (satu kali)

1. Buat proyek di https://supabase.com.
2. Buka **SQL Editor**, salin seluruh isi `supabase/schema.sql`, lalu jalankan.
3. Simpan email dan password akun supabase.com pemilik proyek ini. Akun dashboard tersebut yang dipakai pengurus untuk mengedit konten; jangan berikan **service role key** ke siapa pun.
4. Ambil nilai **Project URL** dan **anon public key** di **Project Settings → API**.

## Deploy ke Vercel (satu kali)

1. Upload folder ini ke repository Git (GitHub), lalu import di https://vercel.com.
2. Di **Project Settings → Environment Variables**, tambahkan:
   - `SUPABASE_URL` — Project URL dari langkah 4 di atas
   - `SUPABASE_ANON_KEY` — anon public key
   Gunakan Environment `Production` (tambahkan `Preview` bila perlu).
3. Deploy. `vercel.json` sudah mengatur build command (`npm run build`) dan output (`public`). Build script menulis kredensial ke `js/config.js` sehingga kunci tidak pernah masuk ke Git.

## Cara pengurus memperbarui konten

Konten diedit lewat Supabase Dashboard, bukan lewat kode:

1. Buka https://supabase.com/dashboard, login dengan akun pengurus, masuk ke proyek.
2. Buka **Table Editor**, pilih tabel sesuai kebutuhan:
   - `pengaturan` — tagline dan ringkasan beranda (sejarah, visi misi, kepengurusan, dan kontak ditulis statis di `index.html`)
   - `kegiatan` — program kerja dan dokumentasi
3. Tambah baris lewat **Insert row**, ubah lewat klik sel. Untuk foto, unggah ke **Storage**, lalu salin URL publiknya ke kolom `foto_url`.
4. Perubahan langsung tampil saat halaman dimuat ulang; tidak perlu deploy ulang.

## Menjalankan di komputer lokal

```bash
npm run build
npx serve public
```

Sebelum `npm run build`, setel dua environment variable Supabase di terminal (atau gunakan `vercel env pull` bila Vercel CLI sudah login). Tanpa kredensial, situs tetap terbuka tetapi daftar isi menampilkan pesan bahwa basis data belum terhubung.
